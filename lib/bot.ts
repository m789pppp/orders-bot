import { db, BUCKET } from "./supabase/admin";
import { downloadMedia, sendText } from "./whatsapp";
import { runAssistant, type ChatLine, type Draft } from "./ai";
import { THANK_YOU } from "./config";
import { notifyNewOrder } from "./notify";

type WaMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string; mime_type?: string };
  document?: { id: string; caption?: string; filename?: string; mime_type?: string };
  video?: { id: string; caption?: string };
  audio?: { id: string };
};

const WAIT_MS = 4000; // wait a bit so several quick messages get one combined reply

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Step 1 (fast): save the incoming message. Returns the conversation id, or null if it's a duplicate. */
export async function saveIncoming(msg: WaMessage, profileName: string): Promise<string | null> {
  const supabase = db();

  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .upsert({ phone: msg.from, ...(profileName ? { name: profileName } : {}) }, { onConflict: "phone" })
    .select("id")
    .single();
  if (custErr) throw custErr;

  // Reuse the open conversation, or start a new one (e.g. after a submitted order).
  let { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("status", "collecting")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!conv) {
    const created = await supabase.from("conversations").insert({ customer_id: customer.id }).select("id").single();
    if (created.error) throw created.error;
    conv = created.data;
  }

  const caption = msg.image?.caption || msg.document?.caption || msg.video?.caption || "";
  const body = msg.type === "text" ? msg.text?.body ?? "" : caption;

  const { error: msgErr } = await supabase
    .from("messages")
    .insert({ conversation_id: conv.id, wamid: msg.id, direction: "in", type: msg.type, body });
  if (msgErr) {
    if (msgErr.code === "23505") return null; // already received: Meta retried
    throw msgErr;
  }
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conv.id);

  // Save images and files.
  const media = msg.image ?? msg.document ?? msg.video;
  if (media) {
    try {
      const file = await downloadMedia(media.id);
      const ext = (file.mime.split("/")[1] || "bin").split(";")[0];
      const path = `${conv.id}/${msg.id}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file.data, { contentType: file.mime, upsert: true });
      if (up.error) throw up.error;
      await supabase.from("attachments").insert({
        conversation_id: conv.id,
        storage_path: path,
        mime: file.mime,
        size_bytes: file.size,
        original_name: msg.document?.filename ?? null,
      });
    } catch (err) {
      console.error("[bot] media save failed", err);
      await supabase.from("messages").update({ error: String(err) }).eq("wamid", msg.id);
    }
  }
  return conv.id;
}

/** Step 2 (slower): let the AI answer. Only the newest message of a burst triggers a reply. */
export async function replyToConversation(conversationId: string, wamid: string, phone: string) {
  await sleep(WAIT_MS);
  const supabase = db();

  const { data: latest } = await supabase
    .from("messages")
    .select("wamid")
    .eq("conversation_id", conversationId)
    .eq("direction", "in")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (latest?.wamid !== wamid) return; // a newer message arrived; it will reply to everything

  const { data: conv } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
  if (!conv || conv.status !== "collecting") return;

  const { data: rows } = await supabase
    .from("messages")
    .select("direction,type,body")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(30);
  const history: ChatLine[] = (rows ?? []).reverse().map((m) => {
    const fileNote = m.type !== "text" ? `[customer sent a ${m.type} file]` : "";
    return {
      role: m.direction === "in" ? "user" : "assistant",
      content: [fileNote, m.body].filter(Boolean).join(" ") || "[empty]",
    };
  });

  const { count: filesCount } = await supabase
    .from("attachments")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  let result;
  try {
    result = await runAssistant(history, (conv.draft ?? {}) as Draft, filesCount ?? 0);
  } catch (err) {
    console.error("[bot] AI failed", err);
    await supabase.from("messages").update({ error: String(err).slice(0, 1500) }).eq("wamid", wamid);
    // Don't leave the customer without an answer.
    const sorry =
      conv.language === "en"
        ? "Sorry, we're getting a lot of messages right now. Please send your message again in a minute."
        : "معلش عندنا ضغط رسايل دلوقتي 🙏 ابعت رسالتك تاني بعد دقيقة.";
    const outId = await sendText(phone, sorry);
    await supabase.from("messages").insert({ conversation_id: conversationId, wamid: outId, direction: "out", type: "text", body: sorry });
    return;
  }

  await supabase.from("conversations").update({ draft: result.draft, language: result.language }).eq("id", conversationId);

  if (result.complete) {
    await submitOrder(conversationId, conv.customer_id, phone, result.draft, result.language);
    return;
  }

  if (result.reply) {
    const outId = await sendText(phone, result.reply);
    await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, wamid: outId, direction: "out", type: "text", body: result.reply });
  }
}

async function submitOrder(conversationId: string, customerId: string, phone: string, d: Draft, lang: "ar" | "en") {
  const supabase = db();

  // Lock: only one request can move the conversation to "submitted".
  const { data: locked } = await supabase
    .from("conversations")
    .update({ status: "submitted" })
    .eq("id", conversationId)
    .eq("status", "collecting")
    .select("id");
  if (!locked?.length) return;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      conversation_id: conversationId,
      customer_name: d.customer_name,
      product_type: d.product_type,
      quantity: d.quantity,
      colors: d.colors,
      sizes: d.sizes,
      customization: d.customization,
      notes: [d.company && `Company: ${d.company}`, d.city && `City: ${d.city}`, d.notes].filter(Boolean).join("\n") || null,
    })
    .select("id, order_code")
    .single();
  if (error) {
    console.error("[bot] order insert failed", error);
    await supabase.from("conversations").update({ status: "collecting" }).eq("id", conversationId);
    return;
  }

  await supabase.from("attachments").update({ order_id: order.id }).eq("conversation_id", conversationId);
  await supabase.from("order_status_history").insert({ order_id: order.id, to_status: "NEW" });
  if (d.customer_name) await supabase.from("customers").update({ name: d.customer_name }).eq("id", customerId);

  const thanks = THANK_YOU[lang];
  const outId = await sendText(phone, thanks);
  await supabase.from("messages").insert({ conversation_id: conversationId, wamid: outId, direction: "out", type: "text", body: thanks });

  await notifyNewOrder(order.order_code, d, phone);
}

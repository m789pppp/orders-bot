import crypto from "crypto";

const GRAPH = "https://graph.facebook.com/v23.0";
const token = () => (process.env.WHATSAPP_ACCESS_TOKEN ?? "").trim();

let cachedPhoneId: string | null = null;

/**
 * The WhatsApp phone number id to send from. Uses WHATSAPP_PHONE_NUMBER_ID when set; otherwise finds
 * the first phone number of the WhatsApp Business Account this token can access.
 */
export async function phoneNumberId(): Promise<string> {
  const fromEnv = (process.env.WHATSAPP_PHONE_NUMBER_ID ?? "").trim();
  if (fromEnv) return fromEnv;
  if (cachedPhoneId) return cachedPhoneId;
  for (const waba of await wabaIds()) {
    const r = await fetch(`${GRAPH}/${waba}/phone_numbers?fields=id,display_phone_number`, { headers: { Authorization: `Bearer ${token()}` } });
    const json = await r.json();
    const id = json?.data?.[0]?.id;
    if (id) return (cachedPhoneId = id);
  }
  throw new Error("No WhatsApp phone number found for this token");
}

/** WhatsApp Business Account ids this token has access to. */
export async function wabaIds(): Promise<string[]> {
  const dbg = await fetch(`${GRAPH}/debug_token?input_token=${token()}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) => r.json());
  const scopes: { scope: string; target_ids?: string[] }[] = dbg?.data?.granular_scopes ?? [];
  return Array.from(new Set(scopes.filter((s) => s.scope.startsWith("whatsapp")).flatMap((s) => s.target_ids ?? [])));
}

/** Checks that the request really came from Meta (X-Hub-Signature-256). */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const got = header.slice(7);
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(expected, "hex"));
}

/** Sends a text message. Returns the WhatsApp message id, or null if it failed. */
export async function sendText(to: string, body: string): Promise<string | null> {
  try {
    const res = await fetch(`${GRAPH}/${await phoneNumberId()}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("[whatsapp] send failed", res.status, JSON.stringify(json));
      return null;
    }
    return json?.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[whatsapp] send error", err);
    return null;
  }
}

/** Downloads a media file (image, document...) that a customer sent. */
export async function downloadMedia(mediaId: string): Promise<{ data: ArrayBuffer; mime: string; size: number }> {
  const metaRes = await fetch(`${GRAPH}/${mediaId}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!metaRes.ok) throw new Error(`media lookup failed: ${metaRes.status}`);
  const meta = await metaRes.json();
  const fileRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token()}` } });
  if (!fileRes.ok) throw new Error(`media download failed: ${fileRes.status}`);
  const data = await fileRes.arrayBuffer();
  return { data, mime: meta.mime_type ?? "application/octet-stream", size: data.byteLength };
}

/** Sends an image by public/signed link. Returns the WhatsApp message id, or null if it failed. */
export async function sendImage(to: string, link: string, caption?: string): Promise<string | null> {
  try {
    const res = await fetch(`${GRAPH}/${await phoneNumberId()}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { link, ...(caption ? { caption } : {}) } }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("[whatsapp] image send failed", res.status, JSON.stringify(json));
      return null;
    }
    return json?.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[whatsapp] image send error", err);
    return null;
  }
}

/** Marks the customer's message as read and shows "typing..." while the reply is prepared. */
export async function showTyping(messageId: string): Promise<void> {
  try {
    await fetch(`${GRAPH}/${await phoneNumberId()}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: messageId, typing_indicator: { type: "text" } }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // cosmetic only
  }
}

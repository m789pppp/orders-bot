import { NextRequest, NextResponse, after } from "next/server";
import { verifySignature } from "@/lib/whatsapp";
import { saveIncoming, replyToConversation } from "@/lib/bot";
import { db, BUCKET } from "@/lib/supabase/admin";

/** Keeps a small trace of each webhook call in storage (debug/), so problems can be diagnosed. */
async function trace(info: Record<string, unknown>) {
  try {
    const name = `debug/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    await db().storage.from(BUCKET).upload(name, JSON.stringify(info), { contentType: "application/json", upsert: true });
  } catch {
    // never break the webhook because of tracing
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

// 1) Meta calls this once to verify the webhook URL.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// 2) Meta sends every incoming message here.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sigOk = verifySignature(raw, req.headers.get("x-hub-signature-256"));
  await trace({ at: new Date().toISOString(), sigOk, hasSigHeader: !!req.headers.get("x-hub-signature-256"), body: raw.slice(0, 1500) });
  if (!sigOk) {
    console.warn("[webhook] bad signature, ignored");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      const name: string = value?.contacts?.[0]?.profile?.name ?? "";
      for (const msg of value?.messages ?? []) {
        if (["reaction", "sticker", "system", "unsupported"].includes(msg.type)) continue;
        // Answer Meta right away; do the slow work afterwards.
        after(async () => {
          try {
            const conversationId = await saveIncoming(msg, name);
            if (conversationId) await replyToConversation(conversationId, msg.id, msg.from);
          } catch (err) {
            console.error("[webhook] processing failed", err);
            await trace({ at: new Date().toISOString(), stage: "processing", error: String(err), detail: JSON.stringify(err).slice(0, 800) });
          }
        });
      }
    }
  }
  return NextResponse.json({ ok: true });
}

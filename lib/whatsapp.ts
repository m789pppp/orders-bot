import crypto from "crypto";

const GRAPH = "https://graph.facebook.com/v23.0";
const token = () => process.env.WHATSAPP_ACCESS_TOKEN!;

/** Checks that the request really came from Meta (X-Hub-Signature-256). */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const got = header.slice(7);
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(expected, "hex"));
}

/** Sends a text message. Returns the WhatsApp message id, or null if it failed. */
export async function sendText(to: string, body: string): Promise<string | null> {
  try {
    const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
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

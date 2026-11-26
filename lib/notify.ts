import type { Draft } from "./ai";

/** Optional instant alert to the owner on Telegram. Skipped if not configured. */
export async function notifyNewOrder(code: string, d: Draft, phone: string) {
  const bot = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chat) return;
  const site = process.env.SITE_URL ? `\n${process.env.SITE_URL}/dashboard` : "";
  const text = `🆕 New order request ${code}\n${d.customer_name ?? ""} (+${phone})\n${d.quantity ?? "?"} × ${d.product_type}${site}`;
  try {
    await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch (err) {
    console.error("[notify] telegram failed", err);
  }
}

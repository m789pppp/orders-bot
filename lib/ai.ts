import { BUSINESS_NAME, PRODUCTS } from "./config";

/** The order details the AI fills in step by step. */
export type Draft = {
  customer_name?: string | null;
  product_type?: string | null;
  quantity?: number | null;
  colors?: string | null;
  sizes?: string | null;
  customization?: string | null;
  notes?: string | null;
};

export type AiResult = {
  reply: string;
  language: "ar" | "en";
  draft: Draft;
  complete: boolean;
};

export type ChatLine = { role: "user" | "assistant"; content: string };

// Works with any OpenAI-compatible API. Default: Google Gemini (free key from aistudio.google.com).
const BASE = process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = process.env.AI_MODEL || "gemini-2.5-flash";

function systemPrompt(draft: Draft, filesCount: number) {
  return `You are the WhatsApp order-intake assistant for "${BUSINESS_NAME}", a custom apparel business.
Your only job: greet customers warmly and collect the details of their order request so the team can review it.

PRODUCTS AND WHAT TO ASK:
${PRODUCTS}

RULES (never break them):
- Reply in the customer's language. If they write Arabic, use friendly Egyptian Arabic. If English, use English.
- Short, natural WhatsApp messages. Ask at most 2-3 related questions per message, never a long form.
- Never repeat a question that is already answered in the draft below.
- NEVER confirm or accept an order, never mention or estimate prices, discounts, payment, delivery or production dates. If asked, say the team will contact them with all of that after reviewing the request.
- Never invent information about the business. Stay on topic politely.
- Ask for the customer's name if you don't know it.
- When files are needed, ask them to send the logo/design images here in the chat. Files received so far: ${filesCount}.
- Set "complete" to true ONLY when product_type, quantity and the key details for that product are known, the customer has had the chance to send files, AND the customer has said they have nothing more to add. When complete, "reply" can be empty: the system sends the final message itself.

CURRENT DRAFT (what is already known):
${JSON.stringify(draft)}

Respond with ONLY a JSON object, no other text:
{"reply": string, "language": "ar" | "en", "complete": boolean,
 "draft": {"customer_name": string|null, "product_type": string|null, "quantity": number|null, "colors": string|null,
           "sizes": string|null, "customization": string|null, "notes": string|null}}
The "draft" must contain ALL fields, keeping known values and adding new ones from the conversation.`;
}

export async function runAssistant(history: ChatLine[], draft: Draft, filesCount: number): Promise<AiResult> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt(draft, filesCount) }, ...history],
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  return parseResult(text, draft);
}

/** Never trust the AI blindly: parse and validate its output. */
export function parseResult(text: string, previous: Draft): AiResult {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const obj = JSON.parse(cleaned);
  const d = (obj.draft ?? {}) as Record<string, unknown>;
  const str = (v: unknown, old?: string | null) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 1000) : old ?? null);
  const qty = Number(d.quantity);
  const draft: Draft = {
    customer_name: str(d.customer_name, previous.customer_name),
    product_type: str(d.product_type, previous.product_type),
    quantity: Number.isFinite(qty) && qty > 0 ? Math.round(qty) : previous.quantity ?? null,
    colors: str(d.colors, previous.colors),
    sizes: str(d.sizes, previous.sizes),
    customization: str(d.customization, previous.customization),
    notes: str(d.notes, previous.notes),
  };
  return {
    reply: typeof obj.reply === "string" ? obj.reply.trim().slice(0, 3000) : "",
    language: obj.language === "en" ? "en" : "ar",
    draft,
    // The code double-checks the minimum before accepting "complete".
    complete: obj.complete === true && !!draft.product_type && !!draft.quantity,
  };
}

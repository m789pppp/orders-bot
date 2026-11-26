import { BUSINESS_FACTS, BUSINESS_NAME, PRODUCTS } from "./config";

/** The order details the AI fills in step by step. */
export type Draft = {
  customer_name?: string | null;
  company?: string | null;
  city?: string | null;
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
const PREFERRED = process.env.AI_MODEL?.trim() || "gemini-3.8-flash";
let resolvedModel: string | null = null;

/** Lists the models this API key can use (OpenAI-compatible /models). */
export async function listModels(): Promise<string[]> {
  const res = await fetch(`${BASE}/models`, { headers: { Authorization: `Bearer ${process.env.AI_API_KEY?.trim()}` } });
  if (!res.ok) throw new Error(`models list ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json?.data ?? []).map((m: { id: string }) => m.id.replace(/^models\//, ""));
}

const isTextFlash = (id: string) => id.includes("flash") && !/(image|tts|audio|live|embedding|preview|omni)/.test(id);

/** Models to try, best first: the preferred one, then other fast text models this key can use. */
async function candidateModels(): Promise<string[]> {
  let ids: string[] = [];
  try {
    ids = (await listModels()).filter(isTextFlash);
  } catch {
    // listing failed: just use the preferred model
  }
  const full = ids.filter((id) => !id.includes("lite")).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const lite = ids.filter((id) => id.includes("lite")).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return Array.from(new Set([resolvedModel ?? PREFERRED, PREFERRED, ...full, ...lite])).filter(Boolean).slice(0, 5);
}

function systemPrompt(draft: Draft, filesCount: number) {
  return `You are the WhatsApp order-intake assistant for "${BUSINESS_NAME}", a uniform and cap manufacturer.
Your only job: greet customers warmly and collect the details of their order request so the team can review it.

ABOUT THE BUSINESS (you may share these facts, nothing more):
${BUSINESS_FACTS}

PRODUCTS AND WHAT TO ASK:
${PRODUCTS}

RULES (never break them):
- Reply in the customer's language. If they write Arabic, use friendly Egyptian Arabic. If English, use English.
- Short, natural WhatsApp messages. Ask at most 2-3 related questions per message, never a long form.
- Never repeat a question that is already answered in the draft below.
- NEVER confirm or accept an order, never mention or estimate prices, discounts, payment, delivery or production dates. If asked, say the team will contact them with all of that after reviewing the request.
- Never invent information about the business. Stay on topic politely.
- Collect the customer's details too: their name, the company/organisation name if they order for one, and their city/governorate (for delivery). Ask naturally, not all at once.
- If they ask about prices: say prices are sent personally by the team after reviewing the request (they change often), then continue collecting the order. Put "asked about price" in notes.
- When files are needed, ask them to send the logo/design images here in the chat. Files received so far: ${filesCount}.
- Set "complete" to true ONLY when product_type, quantity and the key details for that product are known, the customer has had the chance to send files, AND the customer has said they have nothing more to add. When complete, "reply" can be empty: the system sends the final message itself.

CURRENT DRAFT (what is already known):
${JSON.stringify(draft)}

Respond with ONLY a JSON object, no other text:
{"reply": string, "language": "ar" | "en", "complete": boolean,
 "draft": {"customer_name": string|null, "company": string|null, "city": string|null, "product_type": string|null, "quantity": number|null, "colors": string|null,
           "sizes": string|null, "customization": string|null, "notes": string|null}}
The "draft" must contain ALL fields, keeping known values and adding new ones from the conversation.`;
}

async function callModel(model: string, history: ChatLine[], draft: Draft, filesCount: number) {
  return fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY?.trim()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt(draft, filesCount) }, ...history],
    }),
  });
}

export async function runAssistant(history: ChatLine[], draft: Draft, filesCount: number): Promise<AiResult> {
  const errors: string[] = [];
  let res: Response | null = null;
  // Google models get busy (503/429) or retired (404): try the next model instead of failing.
  for (const model of await candidateModels()) {
    try {
      res = await callModel(model, history, draft, filesCount);
    } catch (e) {
      errors.push(`${model}: ${String(e)}`);
      continue;
    }
    if (res.ok) {
      resolvedModel = model;
      break;
    }
    errors.push(`${model}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    res = null;
  }
  if (!res) throw new Error(`AI error, all models failed: ${errors.join(" | ")}`);
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
    company: str(d.company, previous.company),
    city: str(d.city, previous.city),
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

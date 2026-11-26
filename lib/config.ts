/**
 * Business settings. Edit this file when the client sends their real product info.
 */
export const BUSINESS_NAME = "REGINA";

/** Facts the assistant may share. Nothing here is a price, a date or a promise. */
export const BUSINESS_FACTS = `
- REGINA (ريجينا) is a uniform and cap manufacturer in Alexandria, Egypt, founded in 1983. It makes its own products in its own factory.
- Ships to all Egyptian governorates, delivered to the company or factory door.
- Logos can be embroidered or printed. A real sample is made first, and production starts only after the customer approves it.
- Custom designs and special specifications are handled by the technical team.
- Working hours: Saturday to Thursday, 9am to 6pm.
- Prices, minimum quantities and delivery times depend on the product, quantity and branding method: the team gives a free quote after reviewing the request.
`.trim();

export const PRODUCTS = `
- Caps (classic, Regina, chef, bandana, visor, Air Force, Faroukia): ask quantity, cap type, colour(s), logo embroidery or print, logo position, and ask for the logo file.
- Hats (safari, bob, safari with cord, commando): ask quantity, hat type, colour(s), logo embroidery or print, and the logo file.
- T-shirts (polo, basic round neck): ask quantity, type, colour(s), size breakdown (e.g. 10 M, 5 L), logo embroidery or print, logo position (front, back, sleeve), and the logo/design files.
- Winter wear (jacket, sweatshirt, hoodie, crew neck): ask quantity, type, colour(s), size breakdown, logo embroidery or print, logo position, and the design files.
- Workwear (coverall, waist apron, bib apron): ask quantity, type, colour(s), sizes if relevant, logo embroidery or print, and the logo file.
- Graduation (gown, cap): ask quantity, items needed, colour(s), sizes, any printing or embroidery, and the event/school logo if any.
- Anything else: ask what the product is, quantity, colours, sizes, customization, and reference images.
A customer can order several products in one request: collect each one and put them together in product_type / colors / sizes.
`.trim();

/** Fixed final messages. The AI never writes these. */
export const THANK_YOU = {
  en: "Thank you for sharing your requirements with us! We have successfully received your request. Our team will review your details and contact you as soon as possible to discuss the next steps.",
  ar: "شكراً جداً لثقتك فينا! استلمنا كل تفاصيل طلبك، وفريقنا هيراجع البيانات وهيتواصل معاك في أقرب وقت.",
} as const;

export const STATUSES = ["NEW", "PENDING_REVIEW", "CONTACTED", "APPROVED", "REJECTED"] as const;
export type OrderStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "New",
  PENDING_REVIEW: "Pending review",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/**
 * Business settings. Edit this file when the client sends their real product info.
 */
export const BUSINESS_NAME = process.env.BUSINESS_NAME || "Our Store";

export const PRODUCTS = `
- T-shirts: ask for quantity, colour(s), size breakdown (e.g. 10 M, 5 L), fabric if they care, print or embroidery, design/logo position (front, back, sleeve), and ask them to send the logo or design files.
- Caps: ask for quantity, colour(s), cap style (baseball, trucker, bucket...), logo position, embroidery or print, and ask for the logo file.
- Hoodies: ask for quantity, colour(s), size breakdown, zip or pullover, print or embroidery, design position, and the design files.
- Anything else (custom product): ask what the product is, quantity, colours, sizes if relevant, customization, and any reference images.
`.trim();

/** Fixed final messages. The AI never writes these. */
export const THANK_YOU = {
  en: "Thank you for sharing your requirements with us! We have successfully received your request. Our team will review your details and contact you within 24 hours at most to discuss the next steps.",
  ar: "شكراً جداً لثقتك فينا! استلمنا كل تفاصيل طلبك، وفريقنا هيراجع البيانات وهنرجع نتواصل معاك خلال 24 ساعة بحد أقصى.",
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

import { BUSINESS_NAME } from "@/lib/config";

export const metadata = { title: `${BUSINESS_NAME} · Privacy Policy` };

export default function Privacy() {
  return (
    <div className="wrap" style={{ maxWidth: 760, lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: 26 November 2026</p>
      <p>
        {BUSINESS_NAME} uses a WhatsApp assistant to receive order requests. This page explains what we collect and how we use it.
      </p>
      <h2>What we collect</h2>
      <p>
        When you message us on WhatsApp we receive your WhatsApp name and phone number, the messages you send, and any images or
        files you share (such as logos and designs), plus the order details you give us (product, quantity, colours, sizes,
        company name and city).
      </p>
      <h2>How we use it</h2>
      <p>
        Only to review your order request, contact you about it, and prepare your quote and order. We do not sell your data or
        use it for advertising.
      </p>
      <h2>Who can see it</h2>
      <p>
        Only {BUSINESS_NAME} staff, through a password-protected dashboard. Messages are processed by our service providers
        (Meta/WhatsApp, our hosting and database providers, and an AI provider that helps read and reply to messages) only to run
        this service.
      </p>
      <h2>How long we keep it</h2>
      <p>As long as needed to handle your request and our business records. You can ask us to delete your data at any time.</p>
      <h2>Your choices</h2>
      <p>
        To access or delete your data, message us on WhatsApp or contact {BUSINESS_NAME}, 15 El Nasr St., El Mansheya,
        Alexandria, Egypt.
      </p>
      <p dir="rtl" style={{ marginTop: 32 }}>
        بنستخدم بياناتك (اسمك ورقمك ورسايلك وملفاتك وتفاصيل طلبك) بس عشان نراجع طلبك ونتواصل معاك. مش بنبيع بياناتك، وتقدر تطلب
        مسحها في أي وقت.
      </p>
    </div>
  );
}

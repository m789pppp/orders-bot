import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Shows which settings are filled in (never their values). Open /api/health to check.
export async function GET() {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_ACCESS_TOKEN",
    "META_APP_SECRET",
    "WEBHOOK_VERIFY_TOKEN",
  ];
  keys.push(process.env.GROQ_API_KEY ? "GROQ_API_KEY" : "AI_API_KEY");
  const settings = Object.fromEntries(keys.map((k) => [k, process.env[k] ? "OK" : "MISSING"]));
  // Lengths help spot copy/paste mistakes without revealing the values.
  const lengths = {
    META_APP_SECRET: process.env.META_APP_SECRET?.length ?? 0,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID?.length ?? 0,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN?.length ?? 0,
  };
  return NextResponse.json({ running: true, settings, lengths });
}

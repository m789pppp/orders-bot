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
    "AI_API_KEY",
  ];
  const settings = Object.fromEntries(keys.map((k) => [k, process.env[k] ? "OK" : "MISSING"]));
  return NextResponse.json({ running: true, settings });
}

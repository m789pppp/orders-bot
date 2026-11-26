import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const GRAPH = "https://graph.facebook.com/v23.0";

/**
 * Diagnostics + one-time setup. Protected by the webhook verify token.
 *   /api/setup?key=VERIFY_TOKEN            -> checks database, WhatsApp token, webhook subscription
 *   /api/setup?key=VERIFY_TOKEN&fix=1      -> also subscribes the app to the WhatsApp account
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.WEBHOOK_VERIFY_TOKEN?.trim()) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const fix = req.nextUrl.searchParams.get("fix") === "1";
  const token = (process.env.WHATSAPP_ACCESS_TOKEN ?? "").trim();
  const phoneId = (process.env.WHATSAPP_PHONE_NUMBER_ID ?? "").trim();
  const auth = { Authorization: `Bearer ${token}` };
  const report: Record<string, unknown> = {};

  // 1) Database
  for (const table of ["customers", "conversations", "messages", "orders", "attachments"]) {
    const { error } = await db().from(table).select("id", { head: true, count: "exact" });
    report[`db_${table}`] = error ? `ERROR: ${error.message}` : "OK";
  }

  // 2) WhatsApp token + phone number
  try {
    const r = await fetch(`${GRAPH}/${phoneId}?fields=display_phone_number,verified_name`, { headers: auth });
    report.phone_number = await r.json();
  } catch (e) {
    report.phone_number = `ERROR: ${String(e)}`;
  }

  // 3) Find the WhatsApp Business Account and check the app is subscribed to it
  try {
    const dbg = await fetch(`${GRAPH}/debug_token?input_token=${token}`, { headers: auth }).then((r) => r.json());
    const scopes = dbg?.data?.granular_scopes ?? [];
    const wabaIds: string[] = Array.from(
      new Set(scopes.filter((s: { scope: string }) => s.scope.startsWith("whatsapp")).flatMap((s: { target_ids?: string[] }) => s.target_ids ?? [])),
    );
    report.token_valid = dbg?.data?.is_valid ?? dbg;
    report.token_expires = dbg?.data?.expires_at ? new Date(dbg.data.expires_at * 1000).toISOString() : null;
    report.waba_ids = wabaIds;
    for (const waba of wabaIds) {
      if (fix) {
        const sub = await fetch(`${GRAPH}/${waba}/subscribed_apps`, { method: "POST", headers: auth }).then((r) => r.json());
        report[`subscribe_${waba}`] = sub;
      }
      const list = await fetch(`${GRAPH}/${waba}/subscribed_apps`, { headers: auth }).then((r) => r.json());
      report[`subscribed_apps_${waba}`] = list;
    }
  } catch (e) {
    report.waba = `ERROR: ${String(e)}`;
  }

  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}

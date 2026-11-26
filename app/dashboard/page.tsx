import Link from "next/link";
import { db } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  order_code: string;
  customer_name: string | null;
  product_type: string;
  quantity: number | null;
  status: OrderStatus;
  submitted_at: string;
  customers: { phone: string; name: string | null } | null;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;

  const { data } = await db()
    .from("orders")
    .select("id, order_code, customer_name, product_type, quantity, status, submitted_at, customers(phone, name)")
    .order("submitted_at", { ascending: false })
    .limit(500);
  const all = (data ?? []) as unknown as Row[];

  const counts = Object.fromEntries(STATUSES.map((s) => [s, all.filter((o) => o.status === s).length]));
  const term = (q ?? "").trim().toLowerCase();
  const rows = all.filter(
    (o) =>
      (!status || o.status === status) &&
      (!term ||
        [o.order_code, o.customer_name, o.customers?.name, o.customers?.phone].some((v) => v?.toLowerCase().includes(term))),
  );

  return (
    <>
      <h1>Orders</h1>
      <div className="stats">
        <Link href="/dashboard" className={`stat ${!status ? "on" : ""}`}>
          <b>{all.length}</b>
          <span>Total</span>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/dashboard?status=${s}`} className={`stat ${status === s ? "on" : ""}`}>
            <b>{counts[s]}</b>
            <span>{STATUS_LABEL[s]}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <form className="row" style={{ marginBottom: 12 }}>
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search name, phone or order code" style={{ flex: 1, minWidth: 200 }} />
          <button type="submit">Search</button>
        </form>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/dashboard/orders/${o.id}`}>{o.order_code}</Link>
                  </td>
                  <td>
                    {o.customer_name || o.customers?.name || "-"}
                    <div className="muted">+{o.customers?.phone}</div>
                  </td>
                  <td>{o.product_type}</td>
                  <td>{o.quantity ?? "-"}</td>
                  <td>
                    <span className={`badge ${o.status}`}>{STATUS_LABEL[o.status]}</span>
                  </td>
                  <td className="muted">{new Date(o.submitted_at).toLocaleString("en-GB", { timeZone: "Africa/Cairo" })}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

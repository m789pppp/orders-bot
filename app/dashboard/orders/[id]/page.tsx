import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, BUCKET } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/config";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

async function changeStatus(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const id = String(formData.get("id"));
  const to = String(formData.get("status")) as OrderStatus;
  if (!STATUSES.includes(to)) return;
  const supabase = db();
  const { data: current } = await supabase.from("orders").select("status").eq("id", id).single();
  if (!current || current.status === to) return;
  await supabase.from("orders").update({ status: to }).eq("id", id);
  await supabase.from("order_status_history").insert({ order_id: id, from_status: current.status, to_status: to, changed_by: user.id });
  revalidatePath(`/dashboard/orders/${id}`);
}

async function addNote(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const id = String(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!body) return;
  await db().from("order_notes").insert({ order_id: id, author: user.id, body });
  revalidatePath(`/dashboard/orders/${id}`);
}

const fmt = (d: string) => new Date(d).toLocaleString("en-GB", { timeZone: "Africa/Cairo" });

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = db();

  const { data: order } = await supabase.from("orders").select("*, customers(id, phone, name)").eq("id", id).maybeSingle();
  if (!order) notFound();

  const [files, notes, history, messages, previous] = await Promise.all([
    supabase.from("attachments").select("*").eq("order_id", id).order("created_at"),
    supabase.from("order_notes").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("changed_at", { ascending: false }),
    supabase.from("messages").select("direction, type, body, created_at").eq("conversation_id", order.conversation_id).order("created_at"),
    supabase
      .from("orders")
      .select("id, order_code, product_type, submitted_at")
      .eq("customer_id", order.customer_id)
      .neq("id", id)
      .order("submitted_at", { ascending: false }),
  ]);

  // Private files: links that work for 1 hour only.
  const signed = await Promise.all(
    (files.data ?? []).map(async (f) => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(f.storage_path, 3600);
      return { ...f, url: data?.signedUrl ?? "#" };
    }),
  );

  const status = order.status as OrderStatus;
  const details: [string, string | number | null][] = [
    ["Order", order.order_code],
    ["Submitted", fmt(order.submitted_at)],
    ["Customer", order.customer_name || order.customers?.name],
    ["WhatsApp", `+${order.customers?.phone}`],
    ["Product", order.product_type],
    ["Quantity", order.quantity],
    ["Colours", order.colors],
    ["Sizes", order.sizes],
    ["Customization", order.customization],
    ["Notes", order.notes],
  ];

  return (
    <>
      <div className="row noprint" style={{ justifyContent: "space-between", marginBottom: 8 }}>
        <Link href="/dashboard">← All orders</Link>
        <PrintButton />
      </div>
      <h1>
        {order.order_code} <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
      </h1>

      <div className="grid2">
        <div className="card">
          <h2>Order details</h2>
          <dl>
            {details.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k}</dt>
                <dd>{v ?? "-"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card noprint">
          <h2>Status</h2>
          <form action={changeStatus} className="row" style={{ marginBottom: 14 }}>
            <input type="hidden" name="id" value={id} />
            <select name="status" defaultValue={status}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <button type="submit" className="green">
              Update
            </button>
          </form>
          {(history.data ?? []).map((h) => (
            <div key={h.id} className="muted">
              {fmt(h.changed_at)}: {h.from_status ? `${STATUS_LABEL[h.from_status as OrderStatus]} → ` : ""}
              {STATUS_LABEL[h.to_status as OrderStatus]}
            </div>
          ))}

          <h2 style={{ marginTop: 18 }}>Internal notes</h2>
          <form action={addNote} className="row" style={{ marginBottom: 10 }}>
            <input type="hidden" name="id" value={id} />
            <textarea name="body" rows={2} placeholder="Add a note" style={{ flex: 1 }} />
            <button type="submit">Add</button>
          </form>
          {(notes.data ?? []).map((n) => (
            <div key={n.id} style={{ marginBottom: 8 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{n.body}</div>
              <div className="muted">{fmt(n.created_at)}</div>
            </div>
          ))}

          {(previous.data ?? []).length > 0 && (
            <>
              <h2 style={{ marginTop: 18 }}>Previous orders</h2>
              {(previous.data ?? []).map((p) => (
                <div key={p.id}>
                  <Link href={`/dashboard/orders/${p.id}`}>{p.order_code}</Link> <span className="muted">{p.product_type}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Files ({signed.length})</h2>
        {signed.length === 0 && <p className="muted">No files.</p>}
        <div className="files">
          {signed.map((f) => (
            <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
              {f.mime?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" />
              ) : (
                <div style={{ padding: "30px 6px" }}>📄</div>
              )}
              {f.original_name || f.mime}
            </a>
          ))}
        </div>
      </div>

      <div className="card noprint">
        <h2>WhatsApp conversation</h2>
        <div className="chat">
          {(messages.data ?? []).map((m, i) => (
            <div key={i} className={`bubble ${m.direction}`}>
              {m.type !== "text" && <div className="muted">[{m.type}]</div>}
              {m.body}
              <div className="muted" style={{ fontSize: 11 }}>
                {fmt(m.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

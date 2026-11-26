import { revalidatePath } from "next/cache";
import { db, BUCKET } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/config";

export const dynamic = "force-dynamic";

const MAX_PER_ALBUM = 8;

async function upload(formData: FormData) {
  "use server";
  await requireAdmin();
  const key = String(formData.get("key"));
  if (!CATALOG.some((c) => c.key === key)) return;
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files.slice(0, MAX_PER_ALBUM)) {
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) continue;
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    await db().storage.from(BUCKET).upload(`catalog/${key}/${name}`, await file.arrayBuffer(), { contentType: file.type });
  }
  revalidatePath("/dashboard/catalog");
}

async function remove(formData: FormData) {
  "use server";
  await requireAdmin();
  const path = String(formData.get("path"));
  if (!path.startsWith("catalog/")) return;
  await db().storage.from(BUCKET).remove([path]);
  revalidatePath("/dashboard/catalog");
}

export default async function CatalogPage() {
  await requireAdmin();
  const supabase = db();
  const albums = await Promise.all(
    CATALOG.map(async (c) => {
      const { data } = await supabase.storage.from(BUCKET).list(`catalog/${c.key}`, { limit: 50, sortBy: { column: "name", order: "asc" } });
      const photos = await Promise.all(
        (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map(async (f) => {
            const path = `catalog/${c.key}/${f.name}`;
            const { data: s } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
            return { path, url: s?.signedUrl ?? "" };
          }),
      );
      return { ...c, photos };
    }),
  );

  return (
    <>
      <h1>Catalog photos</h1>
      <p className="muted">
        The WhatsApp assistant sends these photos when a customer asks to see models. It sends the first 4 photos of an album.
      </p>
      {albums.map((a) => (
        <div key={a.key} className="card">
          <h2>
            {a.label} <span className="muted">({a.photos.length})</span>
          </h2>
          <div className="files" style={{ marginBottom: 12 }}>
            {a.photos.map((p) => (
              <div key={p.path} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                <form action={remove} style={{ padding: 6, textAlign: "center" }}>
                  <input type="hidden" name="path" value={p.path} />
                  <button type="submit" style={{ background: "#b42318", padding: "4px 10px", fontSize: 12 }}>
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
          <form action={upload} className="row">
            <input type="hidden" name="key" value={a.key} />
            <input type="file" name="photos" accept="image/*" multiple required />
            <button type="submit" className="green">
              Upload
            </button>
          </form>
        </div>
      ))}
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { authClient, requireAdmin } from "@/lib/supabase/server";
import { BUSINESS_NAME } from "@/lib/config";

async function logout() {
  "use server";
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <div className="top">
        <Link href="/dashboard">{BUSINESS_NAME} · Orders</Link>
        <div className="row">
          <Link href="/dashboard/catalog" style={{ fontWeight: 400 }}>
            Catalog
          </Link>
          <form action={logout}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </div>
      <div className="wrap">{children}</div>
    </>
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./admin";

/** Supabase client tied to the logged-in admin's cookies (for login/logout). */
export async function authClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes cookies instead.
        }
      },
    },
  });
}

/** Returns the admin user, or sends the visitor to /login. */
export async function requireAdmin() {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  if (!isAdminEmail(data.user.email)) {
    const { data: profile } = await db().from("admin_profiles").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (!profile) redirect("/login?error=not-admin");
  }
  return data.user;
}

/** Admins listed in the ADMIN_EMAILS setting (comma separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function isAdminEmail(email?: string | null) {
  return !!email && adminEmails().includes(email.toLowerCase());
}

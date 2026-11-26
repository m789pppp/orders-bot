import { redirect } from "next/navigation";
import { adminEmails, authClient } from "@/lib/supabase/server";
import { db } from "@/lib/supabase/admin";
import { BUSINESS_NAME } from "@/lib/config";

/** Turns "01012345678", "+201012345678" or "201012345678" into "201012345678". */
function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "20" + digits.slice(1);
  return digits;
}

async function login(formData: FormData) {
  "use server";
  const login = String(formData.get("login") ?? "").trim();
  let email = login;

  // Phone number instead of email: find the admin's email from their phone.
  if (!login.includes("@")) {
    const phone = normalizePhone(login);
    if (process.env.ADMIN_PHONE && phone === normalizePhone(process.env.ADMIN_PHONE)) {
      email = adminEmails()[0] ?? "";
    } else {
      const { data } = await db().from("admin_profiles").select("user_id").eq("phone", phone).maybeSingle();
      if (!data) redirect("/login?error=wrong");
      const { data: u } = await db().auth.admin.getUserById(data.user_id);
      email = u.user?.email ?? "";
    }
  }

  const supabase = await authClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect("/login?error=wrong");
  redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="login card">
      <h1>{BUSINESS_NAME}</h1>
      <p className="muted">Orders dashboard</p>
      {error === "wrong" && <div className="err">Wrong email or password.</div>}
      {error === "not-admin" && <div className="err">This account is not an admin.</div>}
      <form action={login}>
        <input name="login" type="text" placeholder="Email or phone number" required autoComplete="username" />
        <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        <button type="submit">Log in</button>
      </form>
    </div>
  );
}

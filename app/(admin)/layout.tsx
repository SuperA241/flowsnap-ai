import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { isAdmin } from "@/lib/auth/is-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user.email ?? "")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

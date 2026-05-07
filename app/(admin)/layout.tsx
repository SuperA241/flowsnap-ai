import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { isAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/db/server";

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

  return (
    <SidebarProvider>
      <AdminSidebar user={{ email: user.email ?? "" }} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

import { env } from "@/lib/env";

export function isAdmin(email: string): boolean {
  return email === env.ADMIN_EMAIL;
}

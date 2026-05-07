// Server-only. Never import this in client components or browser code.
// This client uses the service role key and bypasses Row Level Security.
// Use it only for admin operations that require seeing all rows.
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

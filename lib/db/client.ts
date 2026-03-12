import { createBrowserClient } from "@supabase/ssr";

// Returns a Supabase client scoped to the current browser session.
// Safe to call inside client components and hooks.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

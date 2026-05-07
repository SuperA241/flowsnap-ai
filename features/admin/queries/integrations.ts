import { createAdminClient } from "@/lib/db/admin";
import type { Integration } from "@/types/database";

export interface FetchIntegrationsResult {
  integrations: Integration[];
  error: string | null;
}

export interface FetchIntegrationResult {
  integration: Integration | null;
  error: string | null;
}

/**
 * Fetches all integrations regardless of status.
 * Uses the service role client to bypass RLS — call this from server components
 * inside the admin route group only.
 */
export async function fetchAllIntegrations(): Promise<FetchIntegrationsResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("integrations")
    .select("id, name, category, status, docs_url, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { integrations: [], error: error.message };
  }

  return { integrations: (data as Integration[]) ?? [], error: null };
}

/**
 * Fetches a single integration by ID.
 * Uses the service role client — call this from server components inside the
 * admin route group only.
 */
export async function fetchIntegrationById(
  id: string
): Promise<FetchIntegrationResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("integrations")
    .select("id, name, category, status, docs_url, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { integration: null, error: error.message };
  }

  return { integration: (data as Integration) ?? null, error: null };
}

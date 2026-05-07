import { createClient } from "@/lib/db/server";

export interface PublishedIntegration {
  id: string;
  name: string;
  category: string;
  docs_url: string | null;
  version_id: string;
  schema_json: Record<string, unknown>;
  runtime_template: string;
}

interface IntegrationVersionRow {
  id: string;
  schema_json: Record<string, unknown>;
  runtime_template: string;
  created_at: string;
}

interface IntegrationRow {
  id: string;
  name: string;
  category: string;
  docs_url: string | null;
  integration_versions: IntegrationVersionRow[];
}

export interface FetchPublishedIntegrationsResult {
  integrations: PublishedIntegration[];
  error: string | null;
}

/**
 * Fetches all published integrations with their latest version.
 * Uses the anon server client — published integrations are publicly readable
 * per RLS and safe to call from authenticated user-facing server components.
 */
export async function fetchPublishedIntegrations(): Promise<FetchPublishedIntegrationsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("integrations")
    .select(
      `
      id,
      name,
      category,
      docs_url,
      integration_versions (
        id,
        schema_json,
        runtime_template,
        created_at
      )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return { integrations: [], error: error.message };
  }

  const rows = (data as IntegrationRow[]) ?? [];

  const integrations: PublishedIntegration[] = rows.flatMap((row) => {
    if (!row.integration_versions.length) return [];

    // Pick the most recently created version for this integration.
    const latestVersion = row.integration_versions.reduce((a, b) =>
      a.created_at > b.created_at ? a : b
    );

    return [
      {
        id: row.id,
        name: row.name,
        category: row.category,
        docs_url: row.docs_url,
        version_id: latestVersion.id,
        schema_json: latestVersion.schema_json,
        runtime_template: latestVersion.runtime_template,
      },
    ];
  });

  return { integrations, error: null };
}

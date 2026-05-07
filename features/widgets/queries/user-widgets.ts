import { createClient } from "@/lib/db/server";

export interface UserWidget {
  id: string;
  name: string;
  embed_token: string;
  integration_name: string;
  created_at: string;
}

export interface FetchUserWidgetsResult {
  widgets: UserWidget[];
  error: string | null;
}

interface WidgetRow {
  id: string;
  name: string;
  embed_token: string;
  created_at: string;
  integration_versions: {
    integrations: {
      name: string;
    } | null;
  } | null;
}

/**
 * Fetches all widgets owned by the authenticated user.
 * Uses the server client — RLS (`widgets: users read own`) filters to auth.uid()
 * automatically. The userId parameter provides an additional explicit guard.
 */
export async function fetchUserWidgets(
  userId: string
): Promise<FetchUserWidgetsResult> {
  if (!userId) return { widgets: [], error: null };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("widgets")
    .select(
      `
      id,
      name,
      embed_token,
      created_at,
      integration_versions (
        integrations (
          name
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { widgets: [], error: error.message };
  }

  const rows = (data as unknown as WidgetRow[]) ?? [];

  const widgets: UserWidget[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    embed_token: row.embed_token,
    created_at: row.created_at,
    integration_name: row.integration_versions?.integrations?.name ?? "Unknown",
  }));

  return { widgets, error: null };
}

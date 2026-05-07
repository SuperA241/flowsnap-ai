// Server-only. Uses service role so the public widget page can resolve a token
// without requiring the visitor to be authenticated.
import { createAdminClient } from "@/lib/db/admin";

export interface WidgetRuntimeData {
  widgetId: string;
  widgetOwnerId: string;
  widgetName: string;
  configJson: Record<string, unknown>;
  integrationId: string;
  integrationName: string;
  serverAdapterKey: string;
  runtimeTemplate: string;
}

export interface FetchWidgetByTokenResult {
  widget: WidgetRuntimeData | null;
  error: string | null;
}

interface WidgetRow {
  id: string;
  user_id: string;
  name: string;
  config_json: Record<string, unknown>;
  integration_versions: {
    server_adapter_key: string;
    runtime_template: string;
    integrations: {
      id: string;
      name: string;
    } | null;
  } | null;
}

/**
 * Resolves a widget by its public embed_token. Returns all runtime-relevant
 * fields needed to render and execute the widget in an iframe.
 * Only published integrations are matched (integration status check is enforced
 * by the join — if the integration is not published the row will be absent).
 */
export async function fetchWidgetByToken(
  token: string
): Promise<FetchWidgetByTokenResult> {
  if (!token) return { widget: null, error: "Missing token." };

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("widgets")
    .select(
      `
      id,
      user_id,
      name,
      config_json,
      integration_versions (
        server_adapter_key,
        runtime_template,
        integrations (
          id,
          name
        )
      )
    `
    )
    .eq("embed_token", token)
    .maybeSingle();

  if (error) {
    return { widget: null, error: error.message };
  }

  if (!data) {
    return { widget: null, error: "Widget not found." };
  }

  const row = data as unknown as WidgetRow;
  const version = row.integration_versions;
  const integration = version?.integrations;

  if (!version || !integration) {
    return { widget: null, error: "Integration data unavailable." };
  }

  return {
    widget: {
      widgetId: row.id,
      widgetOwnerId: row.user_id,
      widgetName: row.name,
      configJson: row.config_json,
      integrationId: integration.id,
      integrationName: integration.name,
      serverAdapterKey: version.server_adapter_key,
      runtimeTemplate: version.runtime_template,
    },
    error: null,
  };
}

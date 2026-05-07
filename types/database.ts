// Shared domain types derived from the database schema.
// Source of truth: supabase/migrations/20260312000001_initial_schema.sql
// These are hand-written row types. If Supabase CLI type generation is added
// later, replace this file with the generated output.

export type IntegrationStatus = "draft" | "published" | "deprecated";

export type WidgetRunStatus = "pending" | "success" | "error";

export interface Profile {
  id: string;
  email: string;
  created_at: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  docs_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationVersion {
  id: string;
  integration_id: string;
  version: string;
  schema_json: Record<string, unknown>;
  runtime_template: string;
  server_adapter_key: string;
  created_at: string;
}

export interface IntegrationCredential {
  id: string;
  integration_id: string;
  /** null = platform-owned credential */
  user_id: string | null;
  encrypted_secret: string;
  created_at: string;
  updated_at: string;
}

export interface Widget {
  id: string;
  user_id: string;
  integration_version_id: string;
  name: string;
  config_json: Record<string, unknown>;
  embed_token: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetRun {
  id: string;
  widget_id: string;
  status: WidgetRunStatus;
  prompt_input: string | null;
  error_message: string | null;
  created_at: string;
}

export interface GeneratedAsset {
  id: string;
  widget_run_id: string;
  storage_path: string;
  file_type: string;
  created_at: string;
}

export interface AdminIntegrationDraft {
  id: string;
  title: string;
  description: string | null;
  notes: Record<string, unknown>;
  created_at: string;
}

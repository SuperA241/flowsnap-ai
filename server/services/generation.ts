// Server-only. Orchestrates the full generation pipeline:
// token → widget → credential → adapter → storage → widget_runs + generated_assets
import { createAdminClient } from "@/lib/db/admin";
import { logger } from "@/lib/logger/logger";
import { isAdapterError } from "@/server/integrations/elevenlabs/types";
import { getAdapter } from "@/server/integrations/registry/integration-registry";
import { getPlatformApiKey, getUserApiKey } from "@/server/services/credentials";
import { uploadAudio } from "@/server/storage/upload";
import { fetchWidgetByToken } from "@/features/widget-runtime/queries/widget-by-token";

export interface GenerationSuccess {
  audioUrl: string;
}

export interface GenerationError {
  error: string;
  status: number;
}

export type GenerationResult = GenerationSuccess | GenerationError;

/**
 * Runs the full generation pipeline for a widget identified by its public
 * embed_token. Returns either an audioUrl on success or a typed error.
 *
 * Steps:
 * 1. Resolve widget + integration version by token
 * 2. Resolve API key: user-supplied key (BYOK) → platform key fallback
 * 3. Look up adapter in registry
 * 4. Call adapter.execute(input, apiKey)
 * 5. Upload audio to Supabase Storage
 * 6. Insert widget_run + generated_asset rows (service role)
 * 7. Return { audioUrl }
 */
export async function generateForWidget(
  token: string,
  prompt: string
): Promise<GenerationResult> {
  // 1. Resolve widget
  const { widget, error: resolveError } = await fetchWidgetByToken(token);

  if (resolveError || !widget) {
    return { error: "Widget not found.", status: 404 };
  }

  // 2. Resolve API key — user key takes priority over platform key (BYOK)
  let apiKey: string | null = null;
  try {
    apiKey = await getUserApiKey(widget.integrationId, widget.widgetOwnerId);
  } catch {
    return { error: "Failed to retrieve credentials.", status: 500 };
  }

  if (!apiKey) {
    try {
      apiKey = await getPlatformApiKey(widget.integrationId);
    } catch {
      return { error: "Failed to retrieve credentials.", status: 500 };
    }
  }

  if (!apiKey) {
    logger.error("generateForWidget: no credential available", {
      integrationId: widget.integrationId,
      widgetOwnerId: widget.widgetOwnerId,
    });
    return { error: "Integration is not configured.", status: 503 };
  }

  // 3. Look up adapter
  const adapter = getAdapter(widget.serverAdapterKey);
  if (!adapter) {
    logger.error("generateForWidget: unknown adapter key", {
      key: widget.serverAdapterKey,
    });
    return { error: "Unsupported integration.", status: 500 };
  }

  // 4. Call adapter
  const adapterInput = {
    text: prompt,
    ...(typeof widget.configJson.duration_seconds === "number" && {
      duration_seconds: widget.configJson.duration_seconds,
    }),
    ...(typeof widget.configJson.prompt_influence === "number" && {
      prompt_influence: widget.configJson.prompt_influence,
    }),
    ...(typeof widget.configJson.loop === "boolean" && {
      loop: widget.configJson.loop,
    }),
  };

  const result = await adapter(adapterInput, apiKey);

  if (isAdapterError(result)) {
    logger.error("generateForWidget: adapter returned error", {
      code: result.code,
      message: result.message,
    });
    return { error: result.message, status: 502 };
  }

  const supabase = createAdminClient();

  // 5 + 6a. Create a pending widget_run row first so we have its ID for storage path
  const { data: runData, error: runInsertError } = await supabase
    .from("widget_runs")
    .insert({
      widget_id: widget.widgetId,
      status: "pending" as const,
      prompt_input: prompt,
    })
    .select("id")
    .single();

  if (runInsertError || !runData) {
    logger.error("generateForWidget: failed to insert widget_run", {
      message: runInsertError?.message,
    });
    return { error: "Failed to record generation run.", status: 500 };
  }

  const runId: string = runData.id;

  // 6b. Upload audio
  let audioUrl: string;
  try {
    audioUrl = await uploadAudio(widget.widgetId, runId, result.audioBytes);
  } catch {
    // Mark run as errored
    await supabase
      .from("widget_runs")
      .update({ status: "error", error_message: "Audio upload failed." })
      .eq("id", runId);

    return { error: "Failed to store audio.", status: 500 };
  }

  // 6c. Insert generated_asset
  const { error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      widget_run_id: runId,
      storage_path: `${widget.widgetId}/${runId}.mp3`,
      file_type: "audio/mpeg",
    });

  if (assetError) {
    logger.error("generateForWidget: failed to insert generated_asset", {
      runId,
      message: assetError.message,
    });
    // Non-fatal: audio is uploaded; still mark run as success
  }

  // 6d. Mark run as success
  await supabase
    .from("widget_runs")
    .update({ status: "success" })
    .eq("id", runId);

  return { audioUrl };
}

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

// ---- Plan limit helpers ----

interface PlanLimitEntry {
  price_id: string;
  name: string;
  monthly_limit: number;
}

function parsePlanLimits(configJson: Record<string, unknown>): PlanLimitEntry[] {
  const raw = configJson.plan_limits;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is PlanLimitEntry =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).price_id === "string" &&
      typeof (item as Record<string, unknown>).monthly_limit === "number"
  );
}

/**
 * Returns how many successful widget_runs a Memberstack member has made for a
 * given widget in the current calendar month (UTC).
 */
export async function countMemberRunsThisMonth(
  widgetId: string,
  memberstackMemberId: string
): Promise<number> {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count, error } = await supabase
    .from("widget_runs")
    .select("*", { count: "exact", head: true })
    .eq("widget_id", widgetId)
    .eq("memberstack_member_id", memberstackMemberId)
    .neq("status", "error")
    .gte("created_at", monthStart);

  if (error) {
    logger.error("countMemberRunsThisMonth: query failed", { message: error.message });
    throw new Error("Failed to count member runs.");
  }

  return count ?? 0;
}

/**
 * Runs the full generation pipeline for a widget identified by its public
 * embed_token. Returns either an audioUrl on success or a typed error.
 *
 * Steps:
 * 1. Resolve widget + integration version by token
 * 2. Resolve API key: user-supplied key (BYOK) → platform key fallback
 * 3. Look up adapter in registry
 * 4. [NEW] Enforce plan limits for Memberstack members
 * 5. Call adapter.execute(input, apiKey)
 * 6. Upload audio to Supabase Storage
 * 7. Insert widget_run (with memberstack_member_id) + generated_asset rows
 * 8. Return { audioUrl }
 *
 * @param mid  Memberstack member ID (optional — passed from the widget client)
 * @param plan Memberstack price ID (optional — used to look up the matching tier)
 */
export async function generateForWidget(
  token: string,
  prompt: string,
  mid?: string,
  plan?: string
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

  // 3. [NEW] Enforce Memberstack plan limits
  const planLimits = parsePlanLimits(widget.configJson);

  if (planLimits.length > 0) {
    // Widget has tiers configured — every request must be authenticated + matched.

    if (!mid) {
      return { error: "Please log in to use this widget.", status: 401 };
    }

    const tier = planLimits.find((t) => t.price_id === plan);
    if (!tier) {
      return {
        error: "Your current plan does not include access to this widget.",
        status: 403,
      };
    }

    let usageCount: number;
    try {
      usageCount = await countMemberRunsThisMonth(widget.widgetId, mid);
    } catch {
      return { error: "Failed to check usage limits.", status: 500 };
    }

    if (usageCount >= tier.monthly_limit) {
      return {
        error: `You have reached your ${tier.name} plan limit of ${tier.monthly_limit} generation${tier.monthly_limit === 1 ? "" : "s"} this month.`,
        status: 429,
      };
    }
  }

  // 4. Look up adapter
  const adapter = getAdapter(widget.serverAdapterKey);
  if (!adapter) {
    logger.error("generateForWidget: unknown adapter key", {
      key: widget.serverAdapterKey,
    });
    return { error: "Unsupported integration.", status: 500 };
  }

  // 5. Call adapter
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

  // 6a. Create a pending widget_run row first so we have its ID for storage path
  const { data: runData, error: runInsertError } = await supabase
    .from("widget_runs")
    .insert({
      widget_id: widget.widgetId,
      status: "pending" as const,
      prompt_input: prompt,
      ...(mid ? { memberstack_member_id: mid } : {}),
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

  // 7b. Upload audio
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

  // 7c. Insert generated_asset
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

  // 7d. Mark run as success
  await supabase
    .from("widget_runs")
    .update({ status: "success" })
    .eq("id", runId);

  return { audioUrl };
}

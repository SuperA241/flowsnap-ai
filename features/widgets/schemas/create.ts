import { z } from "zod";

// ---- JSON Schema types for integration config fields ----

export interface SchemaProperty {
  type: "string" | "number" | "boolean";
  description?: string;
  minimum?: number;
  maximum?: number;
}

export interface SchemaJson {
  type: "object";
  required?: string[];
  properties: Record<string, SchemaProperty>;
}

/** Narrows an unknown schema_json value to SchemaJson if it looks valid. */
export function parseSchemaJson(value: Record<string, unknown>): SchemaJson | null {
  if (value.type !== "object" || typeof value.properties !== "object") {
    return null;
  }
  return value as unknown as SchemaJson;
}

// ---- Plan limits ----

/**
 * One tier entry stored in widget config_json.plan_limits.
 * price_id must match the Memberstack price ID exactly.
 * monthly_limit is the max number of generations per calendar month.
 */
export interface PlanLimit {
  price_id: string;
  name: string;
  monthly_limit: number;
}

export const planLimitSchema = z.object({
  price_id: z.string().min(1, "Price ID is required."),
  name: z.string().min(1, "Plan name is required."),
  monthly_limit: z.number().int().min(1, "Limit must be at least 1."),
});

// ---- Widget creation Zod schema ----

export const createWidgetSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100, "Name must be 100 characters or fewer."),
  integrationVersionId: z.string().uuid("Invalid integration version."),
  config: z.record(z.string(), z.unknown()),
  planLimits: z.array(planLimitSchema).default([]),
});

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

export interface CreateWidgetFieldErrors {
  name?: string;
  integrationVersionId?: string;
  config?: string;
  planLimits?: string;
}

export interface CreateWidgetActionResult {
  error?: string;
  fieldErrors?: CreateWidgetFieldErrors;
}

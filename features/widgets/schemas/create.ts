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

// ---- Widget creation Zod schema ----

export const createWidgetSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100, "Name must be 100 characters or fewer."),
  integrationVersionId: z.string().uuid("Invalid integration version."),
  config: z.record(z.string(), z.unknown()),
});

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

export interface CreateWidgetFieldErrors {
  name?: string;
  integrationVersionId?: string;
  config?: string;
}

export interface CreateWidgetActionResult {
  error?: string;
  fieldErrors?: CreateWidgetFieldErrors;
}

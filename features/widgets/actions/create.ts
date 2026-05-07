"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { logger } from "@/lib/logger/logger";
import {
  createWidgetSchema,
  type CreateWidgetActionResult,
  type SchemaJson,
} from "@/features/widgets/schemas/create";

/**
 * Parses config fields from FormData using the integration's schema_json.
 * Only includes fields that are present and non-empty.
 */
function parseConfigFromFormData(
  formData: FormData,
  schemaJson: SchemaJson
): Record<string, unknown> {
  const config: Record<string, unknown> = {};

  for (const [key, prop] of Object.entries(schemaJson.properties)) {
    const raw = formData.get(`config.${key}`);

    if (prop.type === "boolean") {
      config[key] = raw === "on";
    } else if (prop.type === "number") {
      const num = parseFloat(raw as string);
      if (!isNaN(num)) config[key] = num;
    } else {
      if (raw !== null && raw !== "") config[key] = raw as string;
    }
  }

  return config;
}

export async function createWidget(
  _prev: CreateWidgetActionResult,
  formData: FormData
): Promise<CreateWidgetActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a widget." };
  }

  // Reconstruct config from flat FormData keys (config.<fieldName>)
  const schemaJsonRaw = formData.get("schemaJson");
  let schemaJson: SchemaJson | null = null;
  try {
    schemaJson = schemaJsonRaw ? (JSON.parse(schemaJsonRaw as string) as SchemaJson) : null;
  } catch {
    return { error: "Invalid integration schema." };
  }

  const config = schemaJson ? parseConfigFromFormData(formData, schemaJson) : {};

  const parsed = createWidgetSchema.safeParse({
    name: formData.get("name"),
    integrationVersionId: formData.get("integrationVersionId"),
    config,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        name: fieldErrors.name?.[0],
        integrationVersionId: fieldErrors.integrationVersionId?.[0],
        config: fieldErrors.config?.[0],
      },
    };
  }

  const { name, integrationVersionId, config: validatedConfig } = parsed.data;

  const { error } = await supabase.from("widgets").insert({
    user_id: user.id,
    integration_version_id: integrationVersionId,
    name,
    config_json: validatedConfig,
  });

  if (error) {
    logger.error("createWidget failed", { message: error.message });
    return { error: "Failed to create widget. Please try again." };
  }

  redirect("/dashboard");
}

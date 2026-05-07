"use server";

import { isAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/db/server";
import { storePlatformCredential } from "@/server/services/credentials";

export interface CredentialActionResult {
  success?: boolean;
  error?: string;
}

/**
 * Server action: validates and upserts a platform-owned API key for an integration.
 * Called from the admin CredentialForm component.
 * Auth is checked here explicitly — layout guards do not protect server actions.
 */
export async function upsertPlatformCredential(
  _prev: CredentialActionResult,
  formData: FormData
): Promise<CredentialActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email ?? "")) {
    return { error: "Unauthorized." };
  }

  const integrationId = (formData.get("integrationId") as string) ?? "";
  const apiKey = (formData.get("apiKey") as string) ?? "";

  if (!integrationId) {
    return { error: "Integration ID is missing." };
  }

  if (!apiKey || apiKey.trim().length < 10) {
    return { error: "API key must be at least 10 characters." };
  }

  try {
    await storePlatformCredential(integrationId, apiKey.trim());
    return { success: true };
  } catch {
    return { error: "Failed to save credential. Please try again." };
  }
}

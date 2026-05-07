"use server";

import { createClient } from "@/lib/db/server";
import { storeUserCredential } from "@/server/services/credentials";

export interface SaveUserCredentialResult {
  success?: boolean;
  error?: string;
}

/**
 * Server action: validates and stores a user-supplied API key for an integration.
 * The authenticated user's ID is always read from the session — never from form input.
 */
export async function saveUserCredential(
  _prev: SaveUserCredentialResult,
  formData: FormData
): Promise<SaveUserCredentialResult> {
  const integrationId = (formData.get("integrationId") as string) ?? "";
  const apiKey = (formData.get("apiKey") as string) ?? "";

  if (!integrationId) {
    return { error: "Integration ID is missing." };
  }

  if (!apiKey || apiKey.trim().length < 10) {
    return { error: "API key must be at least 10 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to save a credential." };
  }

  try {
    await storeUserCredential(integrationId, user.id, apiKey.trim());
    return { success: true };
  } catch {
    return { error: "Failed to save credential. Please try again." };
  }
}

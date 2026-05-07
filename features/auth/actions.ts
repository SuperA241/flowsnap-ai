"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { logger } from "@/lib/logger/logger";
import { validateAuthFields, type AuthValidationError } from "./schemas";

export interface ActionResult {
  error?: string;
  fieldErrors?: AuthValidationError;
}

export async function signIn(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const fields = {
    email: (formData.get("email") as string) ?? "",
    password: (formData.get("password") as string) ?? "",
  };

  const fieldErrors = validateAuthFields(fields);
  if (fieldErrors) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(fields);

  if (error) {
    logger.warn("signIn failed", { message: error.message });
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const fields = {
    email: (formData.get("email") as string) ?? "",
    password: (formData.get("password") as string) ?? "",
  };

  const fieldErrors = validateAuthFields(fields);
  if (fieldErrors) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...fields,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    },
  });

  if (error) {
    logger.warn("signUp failed", { message: error.message });
    return { error: error.message };
  }

  // If email confirmation is disabled in the Supabase project settings,
  // the user is signed in immediately and we redirect to the dashboard.
  // If confirmation is enabled, we redirect to a confirmation notice page.
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

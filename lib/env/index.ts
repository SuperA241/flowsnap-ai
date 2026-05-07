// Server-only. Do not import this module in client components or browser code.
// These variables are validated once at module load time. A missing variable
// will throw immediately, preventing a silent runtime failure later.

const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ENCRYPTION_SECRET",
  "ELEVENLABS_API_KEY",
  "ADMIN_EMAIL",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

function buildEnv(): Record<RequiredVar, string> {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables:\n  ${missing.join("\n  ")}`
    );
  }

  return Object.fromEntries(
    REQUIRED_VARS.map((key) => [key, process.env[key] as string])
  ) as Record<RequiredVar, string>;
}

export const env = buildEnv();

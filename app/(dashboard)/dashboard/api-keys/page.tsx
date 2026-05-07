import { createClient } from "@/lib/db/server";
import { fetchPublishedIntegrations } from "@/features/integrations/queries/published";
import { UserCredentialForm } from "@/features/user-credentials/components/UserCredentialForm";
import { fetchUserCredentialStatus } from "@/features/user-credentials/queries/status";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { integrations } = await fetchPublishedIntegrations();

  const integrationIds = integrations.map((i) => i.id);

  const { hasKey } = await fetchUserCredentialStatus(
    user?.id ?? "",
    integrationIds
  );

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store your own API keys to use integrations from your personal quota.
          Keys are encrypted at rest and never returned to the browser.
        </p>
      </div>

      {integrations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No integrations are available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <UserCredentialForm
              key={integration.id}
              integrationId={integration.id}
              integrationName={integration.name}
              docsUrl={integration.docs_url}
              hasExistingKey={hasKey[integration.id] ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";

import { CredentialForm } from "@/features/admin/components/CredentialForm";
import { fetchIntegrationById } from "@/features/admin/queries/integrations";
import { hasPlatformCredential } from "@/server/services/credentials";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { integration } = await fetchIntegrationById(id);
  return { title: integration ? `${integration.name} — Admin` : "Integration — Admin" };
}

export default async function AdminIntegrationDetailPage({ params }: Props) {
  const { id } = await params;

  const [{ integration, error }, hasCredential] = await Promise.all([
    fetchIntegrationById(id),
    hasPlatformCredential(id),
  ]);

  if (error || !integration) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-2">
        <a
          href="/admin/integrations"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to integrations
        </a>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{integration.name}</h1>
        <p className="mt-1 text-sm text-gray-500 font-mono">{integration.id}</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Category</p>
          <p className="mt-1 text-gray-900">{integration.category}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</p>
          <p className="mt-1 text-gray-900">{integration.status}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Docs</p>
          <p className="mt-1">
            {integration.docs_url ? (
              <a
                href={integration.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View docs ↗
              </a>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </p>
        </div>
      </div>

      <CredentialForm
        integrationId={integration.id}
        hasExistingCredential={hasCredential}
      />
    </div>
  );
}

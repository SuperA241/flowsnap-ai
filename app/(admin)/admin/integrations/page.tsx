import { IntegrationList } from "@/features/admin/components/IntegrationList";
import { fetchAllIntegrations } from "@/features/admin/queries/integrations";

export const metadata = { title: "Integrations — Admin" };

export default async function AdminIntegrationsPage() {
  const { integrations, error } = await fetchAllIntegrations();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform integration catalog. All statuses visible to admin only.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load integrations: {error}
        </div>
      ) : (
        <IntegrationList integrations={integrations} />
      )}
    </div>
  );
}

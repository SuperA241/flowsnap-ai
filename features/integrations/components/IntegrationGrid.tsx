import { IntegrationCard } from "@/features/integrations/components/IntegrationCard";
import type { PublishedIntegration } from "@/features/integrations/queries/published";

interface Props {
  integrations: PublishedIntegration[];
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        No integrations available yet.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Check back soon — new integrations are on the way.
      </p>
    </div>
  );
}

export function IntegrationGrid({ integrations }: Props) {
  if (integrations.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => (
        <li key={integration.id}>
          <IntegrationCard integration={integration} />
        </li>
      ))}
    </ul>
  );
}

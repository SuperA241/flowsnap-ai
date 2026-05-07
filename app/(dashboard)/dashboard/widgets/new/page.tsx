import { redirect } from "next/navigation";

import { CreateWidgetForm } from "@/features/widgets/components/CreateWidgetForm";
import { fetchPublishedIntegrations } from "@/features/integrations/queries/published";
import { parseSchemaJson } from "@/features/widgets/schemas/create";

interface Props {
  searchParams: Promise<{ integrationVersionId?: string }>;
}

export default async function NewWidgetPage({ searchParams }: Props) {
  const { integrationVersionId } = await searchParams;

  if (!integrationVersionId) {
    redirect("/dashboard");
  }

  const { integrations } = await fetchPublishedIntegrations();
  const integration = integrations.find((i) => i.version_id === integrationVersionId);

  if (!integration) {
    redirect("/dashboard");
  }

  const schemaJson = parseSchemaJson(integration.schema_json);

  if (!schemaJson) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Widget</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your{" "}
          <span className="font-medium text-foreground">{integration.name}</span>{" "}
          widget.
        </p>
      </div>

      <div className="max-w-lg">
        <CreateWidgetForm
          integrationVersionId={integrationVersionId}
          integrationName={integration.name}
          schemaJson={schemaJson}
        />
      </div>
    </div>
  );
}

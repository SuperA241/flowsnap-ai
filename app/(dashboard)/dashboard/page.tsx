import { IntegrationGrid } from "@/features/integrations/components/IntegrationGrid";
import { fetchPublishedIntegrations } from "@/features/integrations/queries/published";
import { WidgetList } from "@/features/widgets/components/WidgetList";
import { fetchUserWidgets } from "@/features/widgets/queries/user-widgets";
import { createClient } from "@/lib/db/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ integrations, error: integrationError }, { widgets, error: widgetError }] =
    await Promise.all([
      fetchPublishedIntegrations(),
      fetchUserWidgets(user?.id ?? ""),
    ]);

  return (
    <div className="flex flex-col gap-10 p-6">
      {/* My Widgets */}
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Widgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your saved widgets and their embed tokens.
          </p>
        </div>

        {widgetError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Failed to load widgets: {widgetError}
          </div>
        )}

        <WidgetList widgets={widgets} />
      </section>

      {/* Available Integrations */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Integrations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an integration to create a new widget.
          </p>
        </div>

        {integrationError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Failed to load integrations: {integrationError}
          </div>
        )}

        <IntegrationGrid integrations={integrations} />
      </section>
    </div>
  );
}

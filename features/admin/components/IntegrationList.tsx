import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Integration, IntegrationStatus } from "@/types/database";

interface Props {
  integrations: Integration[];
}

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const statusVariant: Record<IntegrationStatus, BadgeVariant> = {
  published: "default",
  draft: "secondary",
  deprecated: "outline",
};

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <p className="text-sm text-muted-foreground">No integrations found.</p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Seed the database to add the first integration.
      </p>
    </div>
  );
}

export function IntegrationList({ integrations }: Props) {
  if (integrations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Docs</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {integrations.map((integration) => (
            <TableRow key={integration.id}>
              <TableCell>
                <div className="font-medium">{integration.name}</div>
                <div className="font-mono text-xs text-muted-foreground mt-0.5">
                  {integration.id}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {integration.category}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[integration.status]}>
                  {integration.status}
                </Badge>
              </TableCell>
              <TableCell>
                {integration.docs_url ? (
                  <a
                    href={integration.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Docs ↗
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(integration.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={`/admin/integrations/${integration.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  Manage →
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

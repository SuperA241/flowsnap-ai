import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublishedIntegration } from "@/features/integrations/queries/published";

interface Props {
  integration: PublishedIntegration;
}

const categoryLabel: Record<string, string> = {
  audio: "Audio",
  image: "Image",
  video: "Video",
  text: "Text",
};

export function IntegrationCard({ integration }: Props) {
  const { name, category, docs_url } = integration;
  const label = categoryLabel[category] ?? category;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-snug">
            {name}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground">
          Generate {label.toLowerCase()} assets and embed them directly into
          your Webflow site.
        </p>
        {docs_url && (
          <a
            href={docs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-blue-600 hover:underline"
          >
            View docs ↗
          </a>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/dashboard/widgets/new?integrationVersionId=${integration.version_id}`}>
            Create Widget
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

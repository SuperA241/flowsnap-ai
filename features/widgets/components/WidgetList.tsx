"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserWidget } from "@/features/widgets/queries/user-widgets";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function buildIframeSnippet(token: string): string {
  return `<iframe src="${APP_URL}/w/${token}" width="100%" height="220" frameborder="0" allowtransparency="true"></iframe>`;
}

interface Props {
  widgets: UserWidget[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <p className="text-sm font-medium text-muted-foreground">No widgets yet.</p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Create your first one from an integration below.
      </p>
    </div>
  );
}

function WidgetCard({ widget }: { widget: UserWidget }) {
  const snippet = buildIframeSnippet(widget.embed_token);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{widget.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {widget.integration_name}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(widget.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Embed code</p>
        <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2">
          <code className="flex-1 break-all font-mono text-xs text-muted-foreground">
            {snippet}
          </code>
          <CopyButton text={snippet} />
        </div>
      </CardContent>
    </Card>
  );
}

export function WidgetList({ widgets }: Props) {
  if (widgets.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <li key={widget.id}>
          <WidgetCard widget={widget} />
        </li>
      ))}
    </ul>
  );
}

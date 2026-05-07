import { notFound } from "next/navigation";

import { SoundFxWidget } from "@/features/widget-runtime/components/SoundFxWidget";
import { fetchWidgetByToken } from "@/features/widget-runtime/queries/widget-by-token";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mid?: string; plan?: string }>;
}

export default async function WidgetRuntimePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { mid, plan } = await searchParams;

  const { widget, error } = await fetchWidgetByToken(token);

  if (error || !widget) {
    notFound();
  }

  if (widget.runtimeTemplate === "sound_fx_generator") {
    const defaultPrompt =
      typeof widget.configJson.text === "string"
        ? widget.configJson.text
        : undefined;

    return (
      <SoundFxWidget
        token={token}
        widgetName={widget.widgetName}
        defaultPrompt={defaultPrompt}
        mid={mid}
        plan={plan}
      />
    );
  }

  // Unsupported runtime_template — surface a clear error rather than a blank page.
  return (
    <p style={{ padding: "16px", fontFamily: "system-ui", fontSize: "13px" }}>
      Unsupported widget type: {widget.runtimeTemplate}
    </p>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWidget } from "@/features/widgets/actions/create";
import {
  type CreateWidgetActionResult,
  type SchemaJson,
  type SchemaProperty,
} from "@/features/widgets/schemas/create";

interface Props {
  integrationVersionId: string;
  integrationName: string;
  schemaJson: SchemaJson;
}

const initialState: CreateWidgetActionResult = {};

function ConfigField({
  fieldKey,
  prop,
  required,
}: {
  fieldKey: string;
  prop: SchemaProperty;
  required: boolean;
}) {
  const label = fieldKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const inputName = `config.${fieldKey}`;

  if (prop.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <input
          id={inputName}
          name={inputName}
          type="checkbox"
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor={inputName} className="cursor-pointer">
          {label}
          {prop.description && (
            <span className="ml-1 font-normal text-muted-foreground">
              — {prop.description}
            </span>
          )}
        </Label>
      </div>
    );
  }

  if (prop.type === "number") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputName}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {prop.description && (
          <p className="text-xs text-muted-foreground">{prop.description}</p>
        )}
        <Input
          id={inputName}
          name={inputName}
          type="number"
          step="any"
          min={prop.minimum}
          max={prop.maximum}
          required={required}
          placeholder={
            prop.minimum !== undefined && prop.maximum !== undefined
              ? `${prop.minimum} – ${prop.maximum}`
              : undefined
          }
        />
      </div>
    );
  }

  // Default: string
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputName}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {prop.description && (
        <p className="text-xs text-muted-foreground">{prop.description}</p>
      )}
      <Input
        id={inputName}
        name={inputName}
        type="text"
        required={required}
        placeholder={prop.description}
      />
    </div>
  );
}

export function CreateWidgetForm({
  integrationVersionId,
  integrationName,
  schemaJson,
}: Props) {
  const [state, formAction, isPending] = useActionState(createWidget, initialState);

  const requiredFields = new Set(schemaJson.required ?? []);
  const properties = Object.entries(schemaJson.properties);

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields passed to the action */}
      <input type="hidden" name="integrationVersionId" value={integrationVersionId} />
      <input type="hidden" name="schemaJson" value={JSON.stringify(schemaJson)} />

      {/* Widget name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Widget name<span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoFocus
          placeholder={`My ${integrationName} widget`}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Dynamic config fields */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <p className="mb-4 text-sm font-medium">Configuration</p>
            <div className="space-y-4">
              {properties.map(([key, prop]) => (
                <ConfigField
                  key={key}
                  fieldKey={key}
                  prop={prop}
                  required={requiredFields.has(key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create Widget"}
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWidget } from "@/features/widgets/actions/create";
import {
  type CreateWidgetActionResult,
  type PlanLimit,
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

const EMPTY_TIER: PlanLimit = { price_id: "", name: "", monthly_limit: 5 };

export function CreateWidgetForm({
  integrationVersionId,
  integrationName,
  schemaJson,
}: Props) {
  const [state, formAction, isPending] = useActionState(createWidget, initialState);
  const [planLimits, setPlanLimits] = useState<PlanLimit[]>([]);

  const requiredFields = new Set(schemaJson.required ?? []);
  const properties = Object.entries(schemaJson.properties);

  function addTier() {
    setPlanLimits((prev) => [...prev, { ...EMPTY_TIER }]);
  }

  function removeTier(index: number) {
    setPlanLimits((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTier(index: number, field: keyof PlanLimit, value: string | number) {
    setPlanLimits((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields passed to the action */}
      <input type="hidden" name="integrationVersionId" value={integrationVersionId} />
      <input type="hidden" name="schemaJson" value={JSON.stringify(schemaJson)} />
      <input type="hidden" name="planLimits" value={JSON.stringify(planLimits)} />

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

      {/* Plan limits */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Plan limits</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Optional. Add a row per Memberstack plan to limit monthly generations.
              Leave empty for no limits.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTier}>
            + Add plan
          </Button>
        </div>

        {planLimits.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Memberstack Price ID</span>
              <span>Plan name</span>
              <span>Monthly limit</span>
              <span />
            </div>
            {planLimits.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center">
                <Input
                  value={tier.price_id}
                  onChange={(e) => updateTier(i, "price_id", e.target.value)}
                  placeholder="prc_pro-abc123"
                  className="text-xs h-8"
                />
                <Input
                  value={tier.name}
                  onChange={(e) => updateTier(i, "name", e.target.value)}
                  placeholder="Pro"
                  className="text-xs h-8"
                />
                <Input
                  type="number"
                  min={1}
                  value={tier.monthly_limit}
                  onChange={(e) => updateTier(i, "monthly_limit", parseInt(e.target.value) || 1)}
                  className="text-xs h-8"
                />
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="text-muted-foreground hover:text-destructive text-lg leading-none"
                  aria-label="Remove tier"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {state.fieldErrors?.planLimits && (
          <p className="text-xs text-destructive">{state.fieldErrors.planLimits}</p>
        )}
      </div>

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

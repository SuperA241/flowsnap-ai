"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  upsertPlatformCredential,
  type CredentialActionResult,
} from "@/features/admin/actions/credentials";

interface Props {
  integrationId: string;
  hasExistingCredential: boolean;
}

const initialState: CredentialActionResult = {};

export function CredentialForm({ integrationId, hasExistingCredential }: Props) {
  const [state, formAction, isPending] = useActionState(
    upsertPlatformCredential,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Credential</CardTitle>
        <CardDescription>
          This API key is encrypted at rest and never returned to the client.
          It is used server-side when executing this integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasExistingCredential && !state.success && (
          <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200">
            A credential is already stored — enter a new key to replace it.
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="integrationId" value={integrationId} />

          <div className="space-y-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder={
                hasExistingCredential ? "Enter new key to replace" : "Paste API key"
              }
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          {state.success && (
            <p className="text-sm font-medium text-green-700">
              Credential saved successfully.
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : hasExistingCredential
                ? "Replace credential"
                : "Save credential"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

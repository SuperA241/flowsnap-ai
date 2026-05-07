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
  saveUserCredential,
  type SaveUserCredentialResult,
} from "@/features/user-credentials/actions/save";

interface Props {
  integrationId: string;
  integrationName: string;
  docsUrl: string | null;
  hasExistingKey: boolean;
}

const initialState: SaveUserCredentialResult = {};

export function UserCredentialForm({
  integrationId,
  integrationName,
  docsUrl,
  hasExistingKey,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    saveUserCredential,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{integrationName}</CardTitle>
            <CardDescription className="mt-1">
              Your key is encrypted at rest and used only when your widgets
              generate content.{" "}
              {docsUrl && (
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Get your API key
                </a>
              )}
            </CardDescription>
          </div>
          {(hasExistingKey || state.success) && !state.error && (
            <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Key stored
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="integrationId" value={integrationId} />

          <div className="space-y-1.5">
            <Label htmlFor={`apiKey-${integrationId}`}>API Key</Label>
            <Input
              id={`apiKey-${integrationId}`}
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder={
                hasExistingKey || state.success
                  ? "Enter new key to replace"
                  : "Paste your API key"
              }
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          {state.success && (
            <p className="text-sm font-medium text-green-700">
              Key saved successfully.
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : hasExistingKey || state.success
                ? "Replace key"
                : "Save key"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

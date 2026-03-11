# FlowWidgets — Cursor Working Protocol

Version: v1
Status: Active

This file defines how Cursor should work on the FlowWidgets codebase.
Paste the session header at the start of every Cursor chat.
The rules files go into `.cursor/rules/` before any real coding starts.

---

## Session header — paste this at the start of every Cursor chat

```md
You are helping build FlowWidgets.
Read the project rules in `.cursor/rules/` before doing anything.
Work only in the smallest possible incremental step.
Before making changes, list the exact files you will create or edit.
Prefer one file at a time.
After each step, explain what changed, how to test it, and what the next smallest step should be.
Do not perform broad refactors.
Do not collapse frontend, backend, and provider logic into the same file.
Do not create new top-level folders without being asked.
Keep the architecture modular and explicit.
```

---

## Standard task request format

Use this pattern for every task you give Cursor.

```md
Task:
[one sentence describing the goal]

Goal:
[one narrow deliverable — one file, one route, one component]

Constraints:
- one file at a time where possible
- no unrelated refactors
- keep page files thin
- keep business logic in services or adapters
- do not create new abstractions unless there are at least two real uses

First respond with:
1. files you will create or edit
2. short plan
3. any blockers you see

Then implement.
```

---

## How Cursor should verify after every step

After every step, Cursor must tell you:
- which page or route to open to test it
- which environment variables must be present
- what placeholder data is assumed if any
- how to verify success manually

For server-side changes, Cursor must also tell you:
- the lint command to run
- the typecheck command to run
- which route or function to exercise manually

---

## What to tell Cursor not to do

Paste these guardrails into any session where Cursor starts drifting.

```md
Do not rewrite the folder structure.
Do not add billing or plan logic.
Do not add Webflow CMS sync.
Do not add background jobs.
Do not create a generic services.ts file.
Do not put business logic in page files.
Do not create giant components.
Do not hardcode provider assumptions into generic integration code.
Do not store or evaluate executable logic from the database.
Do not invent new top-level folders.
Do not create abstractions speculatively — only when two real uses exist.
```

---

## Cursor project rules

Create all of these files in `.cursor/rules/` before starting any feature work.

---

### `.cursor/rules/architecture.mdc`

```md
---
description: Architecture and separation rules for FlowWidgets
globs:
  - "**/*"
alwaysApply: true
---

# Architecture rules

This codebase is a modular monolith.

## Folder ownership — strict

app/
  Route files and layout shells only.
  No business logic. No provider calls. No data fetching logic.

components/
  Shared presentational UI only.
  No data fetching. No server actions. No feature-specific logic.

features/
  Everything domain-specific for one feature.
  Components, actions, queries, schemas, and types for that feature stay together.
  Do not put code here that belongs to a different feature.

server/integrations/<provider>/
  All provider-specific logic for one external service.
  Adapter, schema, mapper, types.
  Nothing else lives here.

server/services/
  Business logic that crosses feature boundaries.
  No UI. No route handling.

lib/
  Tiny shared utilities only: env, db client, encryption, logger.
  No domain logic. No feature logic. No provider logic.

types/
  Shared domain TypeScript types only.
  No implementation code.

## Rules

- Never place provider-specific fetch logic inside page components.
- Never place business logic inside route handlers if it can live in a service or adapter.
- Keep page files thin — composition only.
- Keep feature boundaries explicit — one feature per folder.
- Do not create new top-level folders without being asked.
- Add code in the smallest sensible unit.
- Avoid broad refactors unless explicitly asked.
- Preserve readability over cleverness.
```

---

### `.cursor/rules/typescript-quality.mdc`

```md
---
description: TypeScript and code quality rules for FlowWidgets
globs:
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# TypeScript quality rules

- Use strict typing throughout.
- Never use `any` unless genuinely unavoidable — if you use it, add a comment explaining why.
- Prefer named domain types over inline object shapes.
- Validate all function inputs explicitly.
- Return explicit shapes from all services — never return `any` or `unknown` without narrowing.
- Keep functions short and single-purpose.
- Add comments only where intent is not immediately obvious from the code.
- Do not leave dead code.
- Do not leave placeholder mocks unless they are clearly marked with a TODO comment.
- Keep imports clean, sorted, and minimal.
- Export only what is actually needed by consumers.
```

---

### `.cursor/rules/workflow.mdc`

```md
---
description: Incremental implementation workflow for FlowWidgets
globs:
  - "**/*"
alwaysApply: true
---

# Workflow rules

- Work in small, incremental steps at all times.
- Before making any change, state exactly which files will be created or edited.
- Prefer creating or editing one file per step.
- After each step, provide three things: what changed, how to test it, what the next smallest step is.
- Do not make hidden structural changes.
- Do not silently rename files or folders.
- Do not refactor things that are not part of the current task.
- Do not introduce new dependencies without asking first.
- If you see a problem outside the current scope, note it but do not fix it without being asked.
```

---

### `.cursor/rules/ui.mdc`

```md
---
description: UI rules for FlowWidgets
globs:
  - "**/*.tsx"
alwaysApply: true
---

# UI rules

- Use shadcn/ui and Tailwind consistently.
- Keep presentation components separate from data fetching.
- Shared UI components go in components/ui/ or components/shared/.
- Feature-specific UI stays inside the feature folder.
- Forms must have clear labels, validation messages, and error states.
- Do not create large monolithic components — break them into meaningful subcomponents.
- Do not fetch data inside presentational components.
- Page files compose components — they do not contain rendering logic themselves.
```

---

### `.cursor/rules/security.mdc`

```md
---
description: Security rules for FlowWidgets
globs:
  - "**/*"
alwaysApply: true
---

# Security rules

- API keys must never be exposed to the client. All provider calls happen server-side only.
- All credentials stored in the database must be encrypted with ENCRYPTION_SECRET before storage.
- The raw decrypted secret must never be returned in a server response.
- Admin routes must be protected before any admin feature is built.
  Admin access is gated by checking the authenticated user's email against ADMIN_EMAIL.
  This check must exist in middleware or the admin layout before any admin page code runs.
- Do not store executable code in the database.
  The server_adapter_key field maps to a registered adapter in code — it is a reference, not executable content.
- Widget runtime pages are public by embed token only — they must not expose any user account data.
- Row Level Security must be applied to all Supabase tables.
```

---

### `.cursor/rules/integrations.mdc`

```md
---
description: Integration architecture rules for FlowWidgets
globs:
  - "**/admin/**"
  - "**/integrations/**"
  - "**/server/**"
alwaysApply: true
---

# Integration architecture rules

## Boundaries

- Integration definitions are platform-level objects owned by the admin.
- Widget instances are user-level objects owned by users.
- Credentials are stored encrypted and are never returned to the client.
- Integration metadata, config schema, and runtime template references are stored in the database.
- Actual execution logic lives in code at server/integrations/<provider>/adapter.ts.
- The server_adapter_key in integration_versions is a string reference that maps to a registry entry.
  It is never evaluated as code. It selects which adapter function to call.

## What the admin can configure

- Integration metadata (name, category, status, docs URL)
- Credential storage (encrypted platform-owned or user-supplied API keys)
- Widget config schema (which fields the widget builder exposes to the user)
- Render template reference (which public widget component to render in the iframe)
- Adapter selection key (which registered adapter handles execution for this version)

## What the admin cannot do

- Store raw executable code in the database
- Publish integrations without review
- Bypass the server_adapter_key registry pattern

## ElevenLabs-specific rules

- Do not hardcode ElevenLabs assumptions into generic integration tables, services, or platform-wide types.
- All ElevenLabs-specific logic must live in server/integrations/elevenlabs/.
- The registry entry for elevenlabs-sfx-v1 maps to server/integrations/elevenlabs/adapter.ts.

## AI discovery policy

- An AI agent may write draft ideas to admin_integration_drafts only.
- An AI agent must never write to integrations or integration_versions directly.
- Publishing a new integration must always require platform owner review and approval.
- Do not build any autonomous ingestion flow in v1.
```

---

## Anti-patterns reference

This is a quick-reference checklist. Review before ending any Cursor session.

| Anti-pattern | Correct approach |
|---|---|
| Business logic in page files | Move to feature action, service, or adapter |
| Provider API calls from client code | All provider calls go through server API routes |
| Unencrypted API keys in the database | Always encrypt with `ENCRYPTION_SECRET` before storage |
| Admin pages built before the admin gate exists | Build admin access check in Step 5b before any admin pages |
| Abstractions created speculatively | Abstract only when two real cases exist |
| Executable code stored in the database | `server_adapter_key` is a reference string — logic lives in code |
| Widget runtime and dashboard in the same module | Separate route groups, separate features, separate trust levels |
| Logic spread across `lib/`, `app/`, and `components/` | Follow folder ownership rules strictly |
| New top-level folder created without asking | All folders are defined — ask before adding |
| Cursor silently refactoring outside the current task | Flag it, do not do it without being asked |

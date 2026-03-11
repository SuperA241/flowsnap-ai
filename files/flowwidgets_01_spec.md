# FlowWidgets — Product and Architecture Spec

Version: v1
Status: Active

---

## What is FlowWidgets

FlowWidgets is a Webflow-first micro SaaS that lets a non-developer customer:

1. Sign up for a FlowWidgets account
2. Connect one or more AI integrations
3. Create a widget powered by that integration
4. Copy an iframe embed snippet
5. Paste it into any Webflow site
6. Let site visitors use the widget directly on the customer's website

The first production integration is **ElevenLabs Sound FX**.
The first widget type is a **text-to-sound-effect generator**.

This is not a one-off ElevenLabs wrapper.
It is a reusable, extensible integration platform where ElevenLabs is only the first integration.

---

## Product direction

The architecture must assume that later we will add:
- more AI service integrations
- more widget types per service
- multiple providers per widget category
- managed platform-owned API keys
- per-user API keys for some integrations
- integration config templates
- Webflow CMS sync options
- platform analytics
- plan limits and billing

None of these are v1 scope. They shape how we model the domain, not what we build first.

---

## What the platform owner does

The platform owner (admin) controls what integrations exist on the platform and what users can access.

In v1 the admin can:
- define a new integration (metadata, category, status)
- store platform-owned credentials for an integration
- define the widget config schema for an integration
- define the render template reference for a widget type
- select which server adapter key handles execution for this integration version
- set an integration to draft, beta, or public
- review and approve draft integration ideas before they reach the live catalog

The admin does **not** store executable code in the database.
Execution logic always lives in code. The admin selects which adapter key to use. The adapter itself lives in `server/integrations/<provider>/adapter.ts`.

### Integration boundary — what lives where

| Layer | Lives in | Managed by |
|---|---|---|
| Integration metadata | Database — `integrations` table | Admin UI |
| Credential storage | Database — `integration_credentials` table (encrypted) | Admin UI |
| Widget config schema | Database — `integration_versions.schema_json` | Admin UI |
| Render template reference | Database — `integration_versions.runtime_template` | Admin UI |
| Adapter selection key | Database — `integration_versions.server_adapter_key` | Admin UI |
| Actual execution logic | Code — `server/integrations/<provider>/adapter.ts` | Developer |
| Request/response mapping | Code — `server/integrations/<provider>/mapper.ts` | Developer |

The `server_adapter_key` in the database is a string like `elevenlabs-sfx-v1`. It maps to a registered entry in `server/integrations/registry/integration-registry.ts`. Cursor must never store or evaluate raw execution logic from the database.

---

## What a user does

A logged-in user can:
- see available public integrations on the platform
- create a widget based on an available integration
- configure the widget name, behavior, and appearance
- copy the iframe embed snippet for their widget
- review generated outputs and usage logs in their dashboard

---

## What a site visitor does

A visitor on the customer's Webflow site interacts with the embedded iframe widget.

In v1:
- visitor opens the widget inside the iframe
- visitor types a text prompt describing a sound
- the widget sends the prompt to the FlowWidgets backend
- the backend calls ElevenLabs using the platform-owned API key
- the generated audio file is stored and a URL is returned
- the visitor can preview and download the audio

The visitor does not have a FlowWidgets account.
The visitor does not know which AI provider is being used.
The visitor session is tracked by a UUID generated client-side in the iframe and stored in `sessionStorage`.

---

## What is not in scope for v1

Do not build:
- billing or subscription plans
- rate limiting by plan tier
- Webflow OAuth app
- automatic publishing to Webflow CMS
- multi-tenant teams
- autonomous integration discovery that writes to the live catalog
- advanced audit logging
- plugin marketplace
- visual widget theme editor

---

## Environment variables

Use these exact names everywhere. Do not invent alternatives.

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ENCRYPTION_SECRET
ELEVENLABS_API_KEY
ADMIN_EMAIL
```

Notes:
- `ELEVENLABS_API_KEY` is a platform-owned key. It is server-side only. It must never reach the browser.
- `ENCRYPTION_SECRET` is used to AES-256 encrypt all credentials stored in the database.
- `ADMIN_EMAIL` gates access to all admin routes. If the authenticated user's email matches this value, they are treated as the platform owner. This is sufficient for v1.

---

## Tech stack

| Concern | Tool |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript (strict mode everywhere) |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| File storage | Supabase Storage |
| Deployment | Vercel |

---

## Architecture decision

Use a **single-repository modular monolith**.

Rationale:
- one deploy target
- one auth boundary
- one database
- one shared type system
- one code search surface for Cursor
- easier incremental development than premature service splitting

Do not split into microservices in v1.

---

## Folder structure and ownership rules

This is the canonical folder structure. Every folder has one owner. Do not mix ownership.

```text
app/
  (marketing)/      ← public marketing pages only
  (auth)/           ← login, signup, password reset only
  (dashboard)/      ← authenticated user area only
  (widget)/         ← public widget runtime only
  (admin)/          ← platform owner area only
  api/              ← API route handlers only, thin wrappers over services

components/
  layout/           ← shared layout shells, navbars, sidebars
  ui/               ← dumb, presentational, no data fetching
  shared/           ← shared cross-feature components only

features/
  auth/             ← auth-related components, actions, queries, schemas, types
  dashboard/        ← dashboard-related components, queries
  integrations/     ← integration browsing and selection
  widgets/          ← widget creation, detail, embed snippet
  widget-runtime/   ← public iframe runtime UI and interaction
  generated-assets/ ← generated file browsing and playback
  admin/            ← admin pages, forms, integration catalog management

server/
  integrations/
    elevenlabs/     ← ElevenLabs-specific adapter, schema, mapper, types
    registry/       ← integration registry mapping adapter keys to implementations
  storage/          ← Supabase Storage upload helpers
  services/         ← cross-feature server services (e.g. widget resolution, run logging)

lib/
  env/              ← environment variable validation and export only
  auth/             ← auth session helpers only
  db/               ← Supabase client instantiation only
  encryption/       ← AES encryption and decryption utilities only
  logger/           ← logging utility only

types/              ← shared domain TypeScript types only
supabase/
  migrations/       ← SQL migration files
  seed/             ← seed data for development
  policies/         ← Row Level Security policy files
```

### Ownership rules — hard

| Location | What belongs here | What does NOT belong here |
|---|---|---|
| `app/` | Route files and layout shells | Business logic, data fetching logic, provider calls |
| `components/` | Shared UI that has no data dependency | Feature-specific components, server actions |
| `features/` | Everything domain-specific for one feature | Code shared across features |
| `server/integrations/` | Provider-specific adapters and mappers | Generic platform logic |
| `server/services/` | Business logic that crosses features | UI, route handling |
| `lib/` | Tiny shared utilities (env, db client, encryption) | Domain logic, feature logic |
| `types/` | Shared domain types | Implementation code |

If you are not sure where something belongs, ask before creating a new folder.

---

## Domain model

### integrations
Platform-defined catalog of available integrations.

Fields: `id`, `slug`, `name`, `provider`, `category`, `status`, `description`, `auth_mode`, `is_public`, `owner_notes`, `docs_url`, `icon_url`, `created_at`, `updated_at`

Examples: `elevenlabs-sfx`, `elevenlabs-tts`, `openai-chat-widget`

### integration_versions
Versioned configuration for each integration. Allows evolution without breaking existing widgets.

Fields: `id`, `integration_id`, `version`, `is_active`, `schema_json`, `runtime_template`, `server_adapter_key`, `created_at`

**How versioning works in practice:**

Version 1 of `elevenlabs-sfx` defines a schema with two inputs: `text` (string, required) and `duration_seconds` (number, optional). Its `server_adapter_key` is `elevenlabs-sfx-v1`, which maps to the registered adapter at `server/integrations/elevenlabs/adapter.ts`. The `runtime_template` key references the iframe widget component that renders the prompt UI.

If we later add a `mood` selector to the widget, we create `elevenlabs-sfx` version 2 with an updated `schema_json`. Widgets pinned to version 1 continue working. New widgets default to version 2.

The `server_adapter_key` is the only bridge between the database and executable code. All actual logic stays in code.

### integration_credentials
Encrypted credentials for either platform-owned or user-supplied API keys.

Fields: `id`, `owner_type` (`platform` or `user`), `owner_user_id` (nullable), `integration_id`, `credential_label`, `encrypted_secret`, `metadata_json`, `is_active`, `created_at`

The `encrypted_secret` field stores the API key encrypted with `ENCRYPTION_SECRET`. The raw value is never stored. It is never returned to the client.

### widgets
User-created widget instances tied to a specific integration version.

Fields: `id`, `user_id`, `integration_id`, `integration_version_id`, `name`, `slug`, `status`, `embed_token`, `public_path`, `config_json`, `style_json`, `limits_json`, `created_at`, `updated_at`

### widget_runs
Log of every generation or execution event triggered by a site visitor through an embedded widget.

Fields: `id`, `widget_id`, `user_id`, `visitor_session_id` (nullable), `input_json`, `output_json`, `status`, `provider_request_id` (nullable), `cost_estimate` (nullable), `error_message` (nullable), `created_at`

**Note on `visitor_session_id`:** A UUID generated client-side when the iframe widget loads. Stored in `sessionStorage` for the duration of the visitor's browser session. Passed with each generation request to enable basic per-session grouping in logs. Nullable. A run is still logged if this field is absent.

### generated_assets
File references for outputs produced by widget runs.

Fields: `id`, `widget_run_id`, `widget_id`, `user_id`, `asset_type`, `file_name`, `mime_type`, `storage_path`, `public_url`, `metadata_json`, `created_at`

### admin_integration_drafts
Staging area for integration ideas before they reach the live catalog. Used now for manual research notes. Reserved for future AI-assisted discovery.

Fields: `id`, `source`, `title`, `provider_name`, `proposed_category`, `notes`, `raw_research_json`, `status`, `created_at`, `reviewed_at`

**AI discovery policy:** An AI agent may in future write draft proposals into this table. It must never write directly to the `integrations` or `integration_versions` tables. All draft ideas require platform owner review and approval before becoming live integrations.

---

## V1 anti-patterns — never do these

These must never appear in the codebase.

| Anti-pattern | Why |
|---|---|
| Business logic inside page files | Pages are composition layers only |
| Provider API calls from client code | API keys would be exposed in the browser |
| Raw API keys stored unencrypted | Security violation — always encrypt with `ENCRYPTION_SECRET` |
| Admin routes accessible before auth gating is applied | Admin area must be gated in middleware or layout before any admin page is built |
| Generic abstractions created before first real use | Abstract only when you have two real cases, not in anticipation |
| Executable code stored in the database and evaluated at runtime | Adapter logic must live in code — DB stores adapter key references only |
| Widget runtime and dashboard UI in the same module | These are different audiences with different trust levels |
| Logic spread across `lib/`, `app/`, and `components/` | Each folder has a defined owner — see folder ownership rules |
| Cursor inventing a new top-level folder without being asked | All folders are defined — ask before creating new ones |

---

## ElevenLabs v1 integration spec

Integration slug: `elevenlabs-sfx`
Widget type: `sound_fx_generator`
Adapter key: `elevenlabs-sfx-v1`
Adapter file: `server/integrations/elevenlabs/adapter.ts`

API endpoint: `POST https://api.elevenlabs.io/v1/sound-generation`
Auth header: `xi-api-key`
Request body: `{ text: string, duration_seconds: number | null, prompt_influence: number }`
Default `prompt_influence`: `0.3`
Response: Raw audio bytes (store to Supabase Storage, return public URL)

V1 non-goals for this integration:
- waveform editor
- project collaboration
- usage billing logic
- automatic Webflow CMS sync

---

## Future integration discovery policy

AI-assisted discovery is a future capability, not a v1 feature.

When it is built, the flow must be:
1. AI agent researches tools relevant to Webflow users
2. Agent writes a draft proposal into `admin_integration_drafts`
3. Platform owner reviews, edits, and approves
4. Developer creates the adapter and template in code
5. Platform owner publishes the integration to the live catalog

An AI agent must never write directly to `integrations` or `integration_versions`.
An AI agent must never generate executable adapter code into production without review.
Discovery can be AI-assisted. Publishing must remain human-gated.

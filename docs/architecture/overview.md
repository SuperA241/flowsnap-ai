# FlowWidgets — Architecture Overview

Version: v1
Status: Active

## What is FlowWidgets

FlowWidgets is a Webflow-first micro SaaS that lets non-developer customers connect AI integrations, create widgets, and embed them via iframe into any Webflow site. The first integration is ElevenLabs Sound FX.

## Architecture decision: modular monolith

Single repository, single deploy target, single database, single auth boundary. No microservices in v1.

Rationale: one code search surface, easier incremental development, one type system shared across all features.

## Folder structure

```
app/
  (marketing)/        public marketing pages
  (auth)/             login, signup, password reset
  (dashboard)/        authenticated user area
  (widget)/           public iframe widget runtime
  (admin)/            platform owner area
  api/                API route handlers — thin wrappers over services

components/
  layout/             shared layout shells, navbars, sidebars
  ui/                 dumb presentational components
  shared/             shared cross-feature components

features/
  auth/               auth components, actions, queries, schemas
  dashboard/          dashboard components and queries
  integrations/       integration browsing and selection
  widgets/            widget creation, detail, embed snippet
  widget-runtime/     public iframe runtime UI and interaction
  generated-assets/   generated file browsing and playback
  admin/              admin pages, forms, integration catalog management

server/
  integrations/
    elevenlabs/       ElevenLabs adapter, schema, mapper, types
    registry/         integration registry mapping adapter keys to implementations
  storage/            Supabase Storage upload helpers
  services/           cross-feature server services

lib/
  env/                environment variable validation and export
  auth/               auth session helpers
  db/                 Supabase client instantiation
  encryption/         AES-256 encrypt and decrypt utilities
  logger/             logging utility

types/                shared domain TypeScript types
supabase/
  migrations/         SQL migration files
  seed/               seed data for development
  policies/           Row Level Security policy files
```

## Dependency direction

```
lib/        →  platform packages + types/ only
server/     →  lib/, types/, provider SDKs
features/   →  components/, lib/, types/, server actions / API routes
components/ →  (must never import from server/)
app/        →  composes features/ and components/ only
```

## Integration boundary

| Layer | Lives in | Managed by |
|---|---|---|
| Integration metadata | Database — integrations table | Admin UI |
| Credential storage | Database — integration_credentials (encrypted) | Admin UI |
| Widget config schema | Database — integration_versions.schema_json | Admin UI |
| Render template reference | Database — integration_versions.runtime_template | Admin UI |
| Adapter selection key | Database — integration_versions.server_adapter_key | Admin UI |
| Actual execution logic | Code — server/integrations/provider/adapter.ts | Developer |
| Request/response mapping | Code — server/integrations/provider/mapper.ts | Developer |

The `server_adapter_key` is a string reference (e.g. `elevenlabs-sfx-v1`) that maps to a registered entry in `server/integrations/registry/integration-registry.ts`. Executable logic is never stored in the database.

## Route group access model

| Route group | Auth required | Additional gate |
|---|---|---|
| (marketing) | No | — |
| (auth) | No | — |
| (dashboard) | Yes — Supabase session | Redirect to /login if absent |
| (widget) | No | Embed token lookup only |
| (admin) | Yes — Supabase session | Email must match ADMIN_EMAIL env var |

## Key domain entities

- `integrations` — platform catalog of available integrations
- `integration_versions` — versioned config per integration (schema, template, adapter key)
- `integration_credentials` — encrypted API keys (platform-owned or user-supplied)
- `widgets` — user-created widget instances tied to an integration version
- `widget_runs` — log of every generation event by site visitors
- `generated_assets` — file references for outputs produced by widget runs
- `admin_integration_drafts` — staging area for integration ideas before going live

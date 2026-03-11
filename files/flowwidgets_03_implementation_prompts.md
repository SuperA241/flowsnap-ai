# FlowWidgets — Implementation Prompts

Version: v1
Status: Active

This file contains the step-by-step prompts for building FlowWidgets in Cursor.
Each step has a goal, what to ask Cursor to do, and the exact prompt to paste.

Read `flowwidgets_01_spec.md` for architecture context.
Read `flowwidgets_02_cursor_protocol.md` for working rules and session setup.

---

## Build phases overview

| Phase | Focus |
|---|---|
| Phase 1 | Foundation — project, tooling, rules, layouts, shared infrastructure |
| Phase 2 | Integration model — admin area, ElevenLabs integration definition, credentials |
| Phase 3 | User workflow — dashboard, widget creation, embed snippet |
| Phase 4 | Runtime execution — public widget, generation route, file storage, logging |
| Phase 5 | Polish — admin states, embed copy, asset browsing |

---

## Phase 1 — Foundation

---

### Step 0 — Repository and tooling

**Goal:** Create the base project and folder structure. No features yet.

Ask Cursor to:
- initialise Next.js App Router with TypeScript and Tailwind
- add shadcn/ui
- add Supabase packages
- create the canonical folder structure from the spec
- add no business logic

**Prompt:**

```md
Set up the initial FlowWidgets project structure.

Create only the base folders and minimal starter files for a modular monolith using:
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Supabase

Use this exact folder structure:
app/ components/ features/ server/ lib/ types/ supabase/ docs/ .cursor/rules/

Inside app/ create these route groups as empty placeholders:
(marketing) (auth) (dashboard) (widget) (admin)

Do not build any features yet.
Explain each folder briefly after creating it.
Work in the smallest possible steps.
```

---

### Step 1 — Cursor rules and documentation

**Goal:** Make Cursor stable before real coding starts. Rules prevent drift.

Ask Cursor to:
- create `.cursor/rules/architecture.mdc`
- create `.cursor/rules/typescript-quality.mdc`
- create `.cursor/rules/workflow.mdc`
- create `.cursor/rules/ui.mdc`
- create `.cursor/rules/security.mdc`
- create `.cursor/rules/integrations.mdc`
- create `README.md`
- create `docs/architecture/overview.md`

Use the exact rule file contents from `flowwidgets_02_cursor_protocol.md`.

**Prompt:**

```md
Create the Cursor project rules for FlowWidgets.

Create these files in .cursor/rules/:
- architecture.mdc
- typescript-quality.mdc
- workflow.mdc
- ui.mdc
- security.mdc
- integrations.mdc

I will give you the content for each file.
Start with architecture.mdc only, then stop and confirm before moving to the next file.
```

---

### Step 2 — App skeleton and route group layouts

**Goal:** Create clean layouts for each route group. Placeholders only. No data.

Ask Cursor to:
- create a marketing layout (no auth required)
- create an auth layout (no auth required)
- create a dashboard layout (auth required, redirect to login if not authenticated)
- create a widget runtime layout (public, no auth)
- create an admin layout (auth required, email must match `ADMIN_EMAIL`, redirect to dashboard if not authorised)

**Important:** The admin layout must gate access using the `ADMIN_EMAIL` check before any admin page is built. This is Step 2b, not an afterthought.

**Prompt:**

```md
Create the route group layouts for FlowWidgets.

Create placeholder layouts for:
- (marketing) — public, no auth
- (auth) — public, no auth
- (dashboard) — requires authentication, redirect to /login if not authenticated
- (widget) — public, access by embed token only
- (admin) — requires authentication AND email must match ADMIN_EMAIL env var, redirect to /dashboard if not authorised

For the admin layout: add the ADMIN_EMAIL check now, before any admin pages exist.
Create a small utility at lib/auth/is-admin.ts that compares the authenticated user email to process.env.ADMIN_EMAIL.
Apply this check in the admin layout.

Add placeholder page.tsx files inside each route group.
Keep all layouts thin — no real content yet.
```

---

### Step 3 — Environment validation and shared infrastructure

**Goal:** Validate env vars at startup. Create db client, encryption helper, logger.

Ask Cursor to:
- validate all required env vars at startup using these exact names:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_SECRET`, `ELEVENLABS_API_KEY`, `ADMIN_EMAIL`
- create Supabase browser client at `lib/db/client.ts`
- create Supabase server client at `lib/db/server.ts`
- create AES-256 encryption and decryption utilities at `lib/encryption/encrypt.ts`
- create a basic logger at `lib/logger/logger.ts`

**Prompt:**

```md
Build the shared infrastructure layer for FlowWidgets.

Start with environment validation at lib/env/index.ts.
Validate that these exact variables are present at startup:
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ENCRYPTION_SECRET, ELEVENLABS_API_KEY, ADMIN_EMAIL

Do not invent alternative variable names.
Throw a clear error if any variable is missing.

Then:
1. Create lib/db/client.ts — Supabase browser client
2. Create lib/db/server.ts — Supabase server client
3. Create lib/encryption/encrypt.ts — AES-256 encrypt and decrypt functions
4. Create lib/logger/logger.ts — minimal structured logger

One file at a time. Stop after each file and explain what was created.
```

---

### Step 4 — Database schema and TypeScript types

**Goal:** Migration files and typed domain models for all core entities.

Ask Cursor to create migration files for:
- `integrations`
- `integration_versions`
- `integration_credentials`
- `widgets`
- `widget_runs`
- `generated_assets`
- `admin_integration_drafts`

**Prompt:**

```md
Create the initial Supabase migration files for FlowWidgets.

Create one migration file for each table:
- integrations
- integration_versions
- integration_credentials (encrypted_secret field — note in migration comment that this stores AES-256 encrypted values only, never raw secrets)
- widgets
- widget_runs (visitor_session_id is nullable UUID — see comment below)
- generated_assets
- admin_integration_drafts

For integration_versions: add a comment explaining that server_adapter_key is a string reference to a registered adapter in code, not executable content.

For widget_runs: add a comment explaining that visitor_session_id is a UUID generated client-side in the iframe widget, stored in sessionStorage, and passed with each generation request. It is nullable and a run is still logged if absent.

Apply Row Level Security policies to all tables.
After the migration files, create matching TypeScript domain types in types/domain.ts.
Keep the migration files well commented.
```

---

### Step 5 — Auth flow

**Goal:** Login, signup, and protected route middleware.

**Prompt:**

```md
Build the FlowWidgets authentication flow using Supabase Auth.

Start with the login page only at app/(auth)/login/page.tsx.
Keep styling clean and minimal using shadcn/ui and Tailwind.
Use the Supabase client from lib/db/client.ts.

After login is working, move to:
1. Signup page
2. Route protection middleware that redirects unauthenticated users away from (dashboard) and (admin)

One page at a time. Stop after login and confirm before continuing.
```

---

## Phase 2 — Integration model

---

### Step 6 — ElevenLabs adapter

**Goal:** Isolate all ElevenLabs provider logic before building anything that calls it.

This comes before admin and user features so the adapter exists as a foundation.

**Prompt:**

```md
Create the ElevenLabs Sound FX provider adapter for FlowWidgets.

Create these files in server/integrations/elevenlabs/:
- types.ts — input and output types for the sound generation call
- schema.ts — Zod schema for validating the input
- mapper.ts — maps FlowWidgets input to the ElevenLabs API request shape
- adapter.ts — execute function that calls the ElevenLabs API

API details:
- Endpoint: POST https://api.elevenlabs.io/v1/sound-generation
- Auth header: xi-api-key
- Request body: { text: string, duration_seconds: number | null, prompt_influence: number }
- Default prompt_influence: 0.3
- Response: raw audio bytes

The adapter must not know anything about Supabase, widgets, or users.
It only takes a validated input and an API key, calls ElevenLabs, and returns audio bytes or an error.

Also create server/integrations/registry/integration-registry.ts.
This is a map from adapter key strings to adapter execute functions.
Register elevenlabs-sfx-v1 pointing to the ElevenLabs adapter.

One file at a time.
```

---

### Step 7 — Admin integration catalog

**Goal:** Platform owner can see and manage the integration catalog.

**Prompt:**

```md
Build the first admin feature for FlowWidgets: integration catalog management.

Start with the integration list page at app/(admin)/admin/integrations/page.tsx.
Query the integrations table and display id, name, provider, category, status, is_public.
Keep the page thin — data fetching logic goes in features/admin/queries/integrations.ts.

Do not build create or edit forms yet. List page only.
```

---

### Step 8 — Seed ElevenLabs integration definition

**Goal:** Create one real integration entry so the platform has something to work with.

**Prompt:**

```md
Create a database seed file for the first FlowWidgets integration: ElevenLabs Sound FX.

Create supabase/seed/01_elevenlabs_sfx.sql.

This seed creates:
1. One row in integrations with slug elevenlabs-sfx, name ElevenLabs Sound FX, status public
2. One row in integration_versions with version 1, is_active true, server_adapter_key elevenlabs-sfx-v1
   schema_json should define two fields: text (string required) and duration_seconds (number optional)
   runtime_template should be sound_fx_generator

Add a comment in the SQL explaining that server_adapter_key is a reference to the adapter registry, not stored code.
```

---

### Step 9 — Admin credential storage

**Goal:** Platform owner can store the ElevenLabs API key securely.

**Prompt:**

```md
Build the admin credential management page for FlowWidgets.

Create app/(admin)/admin/credentials/page.tsx.
Platform owner can:
- see existing platform-owned credentials (label and integration name only — never the secret)
- add a new platform-owned credential for an integration

When saving a new credential:
- encrypt the secret using the encrypt function from lib/encryption/encrypt.ts before storing
- never return the raw secret in any response

Keep the form in features/admin/components/CredentialForm.tsx.
Keep the save action in features/admin/actions/save-credential.ts.
```

---

## Phase 3 — User workflow

---

### Step 10 — User dashboard and available integrations

**Goal:** Logged-in user sees their widgets and available integrations.

**Prompt:**

```md
Build the first user dashboard view for FlowWidgets.

Create app/(dashboard)/dashboard/page.tsx.

The page shows:
1. A list of the user's existing widgets (empty state if none yet)
2. A list of available public integrations from the integrations table

Data queries go in:
- features/dashboard/queries/user-widgets.ts
- features/integrations/queries/available-integrations.ts

Keep the page thin. No widget creation form yet.
```

---

### Step 11 — Widget creation

**Goal:** User can create a widget from an integration.

**Prompt:**

```md
Build the widget creation flow for FlowWidgets.

Start with the server-side create-widget service at server/services/create-widget.ts.
It should:
- accept user_id, integration_id, integration_version_id, and a name
- generate an embed_token (UUID)
- generate a public_path based on the embed token
- insert a row into the widgets table
- return the created widget

Then create the minimal creation form at features/widgets/components/CreateWidgetForm.tsx.
Wire it to a server action at features/widgets/actions/create-widget.ts.

Do not build the embed snippet page yet.
```

---

### Step 12 — Embed snippet generation

**Goal:** User can copy the iframe code to paste into Webflow.

**Prompt:**

```md
Build the widget detail page for FlowWidgets.

Create app/(dashboard)/dashboard/widgets/[id]/page.tsx.

Show:
- widget name and status
- recent runs (basic list — no stats yet)
- a copyable iframe embed snippet

The embed snippet should be:
<iframe src="https://flowwidgets.com/w/[embed_token]" width="100%" height="200" frameborder="0"></iframe>

Keep snippet generation in a helper at features/widgets/lib/embed-snippet.ts.
The page fetches the widget record and passes embed_token to the helper.
```

---

## Phase 4 — Runtime execution

---

### Step 13 — Public widget runtime page

**Goal:** Public iframe page that a site visitor interacts with.

**Prompt:**

```md
Build the public widget runtime page for FlowWidgets.

Create app/(widget)/w/[token]/page.tsx.

The page:
- looks up the widget by embed_token
- renders a minimal prompt input form
- has a generate button
- shows a loading state during generation
- shows a playable audio player when a result is returned

On page load:
- generate a random UUID and store it in sessionStorage as visitor_session_id
- pass this value with every generation request

Keep the UI in features/widget-runtime/components/SoundFxWidget.tsx.
Keep form submission logic in features/widget-runtime/actions/generate-sound.ts.
Keep the page file thin — composition only.
```

---

### Step 14 — Generation API route and asset storage

**Goal:** Complete the vertical slice — end to end generation works.

**Prompt:**

```md
Build the server-side generation route for FlowWidgets.

Create app/api/widgets/[token]/generate/route.ts.

The route should:
1. Validate the request input using the schema from server/integrations/elevenlabs/schema.ts
2. Resolve the widget by embed_token — return 404 if not found
3. Load the platform-owned credential for elevenlabs-sfx — decrypt it before use
4. Execute the ElevenLabs adapter from server/integrations/elevenlabs/adapter.ts
5. Upload the returned audio bytes to Supabase Storage
6. Insert a row into widget_runs (include visitor_session_id if present in the request)
7. Insert a row into generated_assets with the storage path and public URL
8. Return the public URL to the client

Keep the route handler thin. All steps after input validation go into server/services/generate-widget-output.ts.

Do not expose the decrypted API key in any response or log.
```

---

## Phase 5 — Polish

---

### Step 15 — Admin integration states

**Goal:** Admin can manage integration lifecycle states.

**Prompt:**

```md
Add integration lifecycle management to the admin area.

Update the integration list page to show status clearly (draft, beta, public, disabled).
Add a simple toggle or dropdown on each row to change the status.

Keep the update action in features/admin/actions/update-integration-status.ts.
```

---

### Step 16 — Admin draft ideas area

**Goal:** Admin can capture integration ideas before they go live.

**Prompt:**

```md
Build the admin draft ideas area for FlowWidgets.

Create app/(admin)/admin/drafts/page.tsx.

The platform owner can:
- see a list of draft integration ideas from admin_integration_drafts
- add a new draft manually (title, provider name, notes)
- change a draft status (idea, researching, ready for review, approved, rejected)

Drafts never appear in the public integration catalog.
Only items in the integrations table with is_public true are visible to users.

Keep forms in features/admin/components/DraftForm.tsx.
Keep actions in features/admin/actions/save-draft.ts.
```

---

## Final delivery checklist

Before calling v1 complete, verify this full story works end to end:

- [ ] Platform owner logs into admin
- [ ] Platform owner adds ElevenLabs platform credential (encrypted, not visible in UI)
- [ ] Platform owner confirms ElevenLabs integration is public
- [ ] New user signs up
- [ ] User sees ElevenLabs Sound FX in available integrations
- [ ] User creates a widget
- [ ] User copies the iframe embed snippet
- [ ] User pastes snippet into a Webflow test page
- [ ] Site visitor opens the widget in the iframe
- [ ] Site visitor types a sound prompt and clicks generate
- [ ] Audio is generated, stored, and returned as a playable file
- [ ] Widget owner sees the run logged in their dashboard
- [ ] Widget owner can access the generated audio file

That is enough. Do not overbuild before this story is confirmed working.

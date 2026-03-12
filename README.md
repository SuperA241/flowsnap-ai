# FlowWidgets

A Webflow-first micro SaaS that lets users embed AI-powered widgets into any Webflow site. The first integration is ElevenLabs Sound FX — a text-to-sound-effect generator.

## Tech stack

| Concern | Tool |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| File storage | Supabase Storage |
| Package manager | pnpm |
| Deployment | Vercel |

## Getting started

```bash
cp .env.example .env.local
# Fill in all values in .env.local
pnpm install
pnpm dev
```

## Folder ownership

| Folder | What belongs here |
|---|---|
| `app/` | Route files, layouts, loading/error states only. No logic. |
| `components/` | Shared presentational UI. No data fetching. No feature logic. |
| `features/` | All domain logic for one feature area. Components, actions, queries, schemas, types. |
| `server/` | Server-only code: provider adapters, integration registry, storage helpers, services. |
| `lib/` | Tiny shared utilities: env validation, Supabase client, encryption, logger. |
| `types/` | Shared cross-cutting TypeScript types. No implementation code. |
| `supabase/` | SQL migration files, seed data, and Row Level Security policies. |
| `docs/` | Architecture overviews, implementation notes, product decisions. |

## Dependency direction

```
lib/        →  platform packages + types/ only
server/     →  lib/, types/, provider SDKs
features/   →  components/, lib/, types/, server actions / API routes
components/ →  (must never import from server/)
app/        →  composes features/ and components/ only
```

## Environment variables

All six are required. See `.env.example` for names and descriptions.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ENCRYPTION_SECRET
ELEVENLABS_API_KEY
ADMIN_EMAIL
```

## Architecture notes

See `docs/architecture/overview.md` for the full architecture decision record.

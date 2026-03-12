# FlowWidgets Audit Report

Generated: 2026-03-12 02:28:32

---

## 1. Top-Level Folder Structure

- ✅ app/ exists
- ✅ components/ exists
- ✅ features/ exists
- ✅ server/ exists
- ✅ lib/ exists
- ✅ types/ exists
- ✅ supabase/ exists
- ✅ docs/ exists
- ✅ public/ exists
- ✅ No modules/ folder (correct — canonical name is features/)
## 2. Feature Subfolders

- ✅ features/auth/
- ✅ features/dashboard/
- ✅ features/integrations/
- ✅ features/widgets/
- ✅ features/widget-runtime/
- ✅ features/generated-assets/
- ✅ features/admin/
## 3. Server Subfolders

- ✅ server/integrations/elevenlabs/
- ✅ server/integrations/registry/
- ✅ server/storage/
- ✅ server/services/
## 4. Lib Subfolders

- ✅ lib/env/
- ✅ lib/auth/
- ✅ lib/db/
- ✅ lib/encryption/
- ✅ lib/logger/
## 5. Supabase Subfolders

- ✅ supabase/migrations/
- ✅ supabase/seed/
- ✅ supabase/policies/
## 6. Component Subfolders

- ✅ components/layout/
- ✅ components/ui/
- ✅ components/shared/
## 7. Route Group Layouts and Pages

- ✅ app/(marketing)/layout.tsx
- ❌ app/(marketing)/page.tsx MISSING
- ✅ app/(auth)/layout.tsx
- ❌ app/(auth)/page.tsx MISSING
- ✅ app/(dashboard)/layout.tsx
- ❌ app/(dashboard)/page.tsx MISSING
- ✅ app/(widget)/layout.tsx
- ❌ app/(widget)/page.tsx MISSING
- ✅ app/(admin)/layout.tsx
- ❌ app/(admin)/page.tsx MISSING
- ✅ app/layout.tsx (root layout)
- ✅ app/globals.css
## 8. Cursor Rules

- ✅ .cursor/rules/architecture.mdc (with frontmatter)
- ✅ .cursor/rules/typescript-quality.mdc (with frontmatter)
- ✅ .cursor/rules/workflow.mdc (with frontmatter)
- ✅ .cursor/rules/ui.mdc (with frontmatter)
- ✅ .cursor/rules/security.mdc (with frontmatter)
- ✅ .cursor/rules/integrations.mdc (with frontmatter)
## 9. Shared Infrastructure (Step 3)

- ✅ lib/env/index.ts
- ✅ lib/db/client.ts
- ✅ lib/db/server.ts
- ✅ lib/encryption/encrypt.ts
- ✅ lib/logger/logger.ts
- ✅ lib/auth/is-admin.ts
## 10. Environment Configuration

- ❌ .env.example MISSING entirely
- ✅ .env.local exists (local config present)
- ✅ .gitignore covers .env files
## 11. Package.json Scripts

- ✅ package.json has 'dev' script
- ✅ package.json has 'build' script
- ✅ package.json has 'start' script
- ✅ package.json has 'lint' script
- ✅ package.json has 'typecheck' script
## 12. TSConfig Strict Mode

- ✅ tsconfig.json has strict: true
## 13. Naming Consistency Check

- ❌ Found 'modules/' references in: ./node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.29.0_react@19.2.3/node_modules/styled-jsx/readme.md
./node_modules/.pnpm/eslint-plugin-import@2.32.0_@typescript-eslint+parser@8.57.0_eslint@9.39.4_jiti@2.6.1___ecd92c7d89cd829b79bf1840e27e9247/node_modules/eslint-plugin-import/docs/rules/default.md
./node_modules/.pnpm/eslint-plugin-import@2.32.0_@typescript-eslint+parser@8.57.0_eslint@9.39.4_jiti@2.6.1___ecd92c7d89cd829b79bf1840e27e9247/node_modules/eslint-plugin-import/docs/rules/no-cycle.md
./node_modules/.pnpm/eslint-plugin-import@2.32.0_@typescript-eslint+parser@8.57.0_eslint@9.39.4_jiti@2.6.1___ecd92c7d89cd829b79bf1840e27e9247/node_modules/eslint-plugin-import/README.md
./node_modules/.pnpm/fast-glob@3.3.1/node_modules/fast-glob/README.md
./node_modules/.pnpm/@typescript-eslint+eslint-plugin@8.57.0_@typescript-eslint+parser@8.57.0_eslint@9.39.4__15402c03ce29e18c8d86591e0b49a642/node_modules/@typescript-eslint/eslint-plugin/rules.d.ts
./node_modules/.pnpm/enhanced-resolve@5.20.0/node_modules/enhanced-resolve/README.md
./node_modules/.pnpm/@typescript-eslint+typescript-estree@8.57.0_typescript@5.9.3/node_modules/@typescript-eslint/typescript-estree/dist/parser-options.d.ts
./node_modules/.pnpm/axe-core@4.11.1/node_modules/axe-core/README.md
./node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/README.md
./node_modules/.pnpm/tsconfig-paths@3.15.0/node_modules/tsconfig-paths/README.md
./node_modules/.pnpm/@eslint+config-array@0.21.2/node_modules/@eslint/config-array/README.md
./node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/typescript.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/render.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/web/edge-route-module-wrapper.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/client-component-renderer-logger.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/app-render/types.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/app-render/app-render.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/app-render/action-handler.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/lib/module-loader/route-module-loader.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/load-default-error-components.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/request/fallback-params.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/server/load-components.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/static-paths/app.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/static-paths/utils.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/segment-config/app/app-segments.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/segment-config/app/collect-root-param-keys.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/templates/app-page.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/templates/app-route.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/templates/pages.d.ts
./node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/export/routes/app-route.d.ts
./node_modules/.pnpm/jiti@2.6.1/node_modules/jiti/README.md
./node_modules/.pnpm/jiti@2.6.1/node_modules/jiti/lib/types.d.ts
./node_modules/.pnpm/lightningcss@1.31.1/node_modules/lightningcss/README.md
./node_modules/.pnpm/lightningcss@1.31.1/node_modules/lightningcss/node/ast.d.ts
./node_modules/.pnpm/@babel+parser@7.29.0/node_modules/@babel/parser/CHANGELOG.md
./node_modules/.pnpm/axobject-query@4.1.0/node_modules/axobject-query/README.md
./node_modules/.pnpm/@eslint-community+eslint-utils@4.9.1_eslint@9.39.4_jiti@2.6.1_/node_modules/@eslint-community/eslint-utils/README.md
./node_modules/.pnpm/@eslint+config-helpers@0.4.2/node_modules/@eslint/config-helpers/README.md
./docs/audit-report.md
- ✅ features/ references found — naming is consistent
## 14. Lint and Typecheck

- ✅ pnpm lint — clean
- ✅ pnpm typecheck — clean
## 15. Build Phase Progress


| Step | Description | Status |
|------|-------------|--------|
| Step 0 | Repository scaffold | ✅ Complete |
| Step 1 | Cursor rules | ✅ Complete |
| Step 2 | Route group layouts + auth gates | ✅ Complete |
| Step 3 | Shared infrastructure | ✅ Complete |
| Step 4 | Database schema + types | ✅ Complete |
| Step 5 | Auth flow | ✅ Complete |
| Step 6 | ElevenLabs adapter | ⬜ Not started |
| Step 7 | Admin integration catalog | ⬜ Not started |
| Step 8 | Seed ElevenLabs integration | ⬜ Not started |
| Step 9 | Admin credential storage | ⬜ Not started |
| Step 10 | User dashboard | ⬜ Not started |
| Step 11 | Widget creation | ⬜ Not started |
| Step 12 | Embed snippet | ⬜ Not started |
| Step 13 | Widget runtime page | ✅ Complete |
| Step 14 | Generation API route | ⬜ Not started |
| Step 15 | Admin integration states | ⬜ Not started |
| Step 16 | Admin draft ideas | ⬜ Not started |

---

## Summary

- **Passed:** 62
- **Warnings:** 0
- **Failed:** 7

**Overall: ❌ ISSUES FOUND — review failures above**

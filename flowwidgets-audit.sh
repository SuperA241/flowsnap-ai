#!/usr/bin/env bash
# FlowWidgets — Scaffold Audit Script
# Run from the project root: bash flowwidgets-audit.sh
# Produces: docs/audit-report.md

set -euo pipefail

REPORT="docs/audit-report.md"
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p docs

pass()  { PASS_COUNT=$((PASS_COUNT + 1)); echo "  ✅ $1"; echo "- ✅ $1" >> "$REPORT"; }
warn()  { WARN_COUNT=$((WARN_COUNT + 1)); echo "  ⚠️  $1"; echo "- ⚠️  $1" >> "$REPORT"; }
fail()  { FAIL_COUNT=$((FAIL_COUNT + 1)); echo "  ❌ $1"; echo "- ❌ $1" >> "$REPORT"; }
section() { echo ""; echo "## $1" | tee -a "$REPORT"; echo "" >> "$REPORT"; }

# --- Init report ---
cat > "$REPORT" <<EOF
# FlowWidgets Audit Report

Generated: $TIMESTAMP

---

EOF

# =============================================
section "1. Top-Level Folder Structure"
# =============================================

REQUIRED_DIRS=("app" "components" "features" "server" "lib" "types" "supabase" "docs" "public")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    pass "$dir/ exists"
  else
    fail "$dir/ MISSING"
  fi
done

# Check for forbidden naming
if [ -d "modules" ]; then
  fail "modules/ exists — should be features/ (naming inconsistency)"
else
  pass "No modules/ folder (correct — canonical name is features/)"
fi

if [ -d "config" ]; then
  warn "config/ exists — not in v1 spec, verify it has a concrete use"
fi

if [ -d "src" ]; then
  fail "src/ exists — project should use root-level folders, not src/"
fi

# =============================================
section "2. Feature Subfolders"
# =============================================

FEATURE_DIRS=("auth" "dashboard" "integrations" "widgets" "widget-runtime" "generated-assets" "admin")
for dir in "${FEATURE_DIRS[@]}"; do
  if [ -d "features/$dir" ]; then
    pass "features/$dir/"
  else
    fail "features/$dir/ MISSING"
  fi
done

# =============================================
section "3. Server Subfolders"
# =============================================

SERVER_DIRS=("integrations/elevenlabs" "integrations/registry" "storage" "services")
for dir in "${SERVER_DIRS[@]}"; do
  if [ -d "server/$dir" ]; then
    pass "server/$dir/"
  else
    fail "server/$dir/ MISSING"
  fi
done

# =============================================
section "4. Lib Subfolders"
# =============================================

LIB_DIRS=("env" "auth" "db" "encryption" "logger")
for dir in "${LIB_DIRS[@]}"; do
  if [ -d "lib/$dir" ]; then
    pass "lib/$dir/"
  else
    fail "lib/$dir/ MISSING"
  fi
done

# =============================================
section "5. Supabase Subfolders"
# =============================================

SUPA_DIRS=("migrations" "seed" "policies")
for dir in "${SUPA_DIRS[@]}"; do
  if [ -d "supabase/$dir" ]; then
    pass "supabase/$dir/"
  else
    fail "supabase/$dir/ MISSING"
  fi
done

# =============================================
section "6. Component Subfolders"
# =============================================

COMP_DIRS=("layout" "ui" "shared")
for dir in "${COMP_DIRS[@]}"; do
  if [ -d "components/$dir" ]; then
    pass "components/$dir/"
  else
    fail "components/$dir/ MISSING"
  fi
done

# =============================================
section "7. Route Group Layouts and Pages"
# =============================================

ROUTE_GROUPS=("(marketing)" "(auth)" "(dashboard)" "(widget)" "(admin)")
for group in "${ROUTE_GROUPS[@]}"; do
  if [ -f "app/$group/layout.tsx" ]; then
    pass "app/$group/layout.tsx"
  else
    fail "app/$group/layout.tsx MISSING"
  fi
  if [ -f "app/$group/page.tsx" ]; then
    pass "app/$group/page.tsx"
  else
    fail "app/$group/page.tsx MISSING"
  fi
done

if [ -f "app/layout.tsx" ]; then
  pass "app/layout.tsx (root layout)"
else
  fail "app/layout.tsx (root layout) MISSING"
fi

if [ -f "app/globals.css" ]; then
  pass "app/globals.css"
else
  fail "app/globals.css MISSING"
fi

# =============================================
section "8. Cursor Rules"
# =============================================

RULE_FILES=("architecture.mdc" "typescript-quality.mdc" "workflow.mdc" "ui.mdc" "security.mdc" "integrations.mdc")
for rule in "${RULE_FILES[@]}"; do
  if [ -f ".cursor/rules/$rule" ]; then
    # Check for frontmatter
    if head -1 ".cursor/rules/$rule" | grep -q "^---"; then
      pass ".cursor/rules/$rule (with frontmatter)"
    else
      warn ".cursor/rules/$rule exists but MISSING frontmatter"
    fi
  else
    fail ".cursor/rules/$rule MISSING"
  fi
done

# =============================================
section "9. Shared Infrastructure (Step 3)"
# =============================================

INFRA_FILES=(
  "lib/env/index.ts"
  "lib/db/client.ts"
  "lib/db/server.ts"
  "lib/encryption/encrypt.ts"
  "lib/logger/logger.ts"
)
for f in "${INFRA_FILES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f MISSING"
  fi
done

# Check is-admin utility
if [ -f "lib/auth/is-admin.ts" ]; then
  pass "lib/auth/is-admin.ts"
else
  fail "lib/auth/is-admin.ts MISSING (needed for admin gate)"
fi

# =============================================
section "10. Environment Configuration"
# =============================================

if [ -f ".env.example" ]; then
  ENV_KEYS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "ENCRYPTION_SECRET" "ELEVENLABS_API_KEY" "ADMIN_EMAIL")
  for key in "${ENV_KEYS[@]}"; do
    if grep -q "^$key" .env.example 2>/dev/null; then
      pass ".env.example has $key"
    else
      fail ".env.example MISSING $key"
    fi
  done
else
  fail ".env.example MISSING entirely"
fi

if [ -f ".env.local" ]; then
  pass ".env.local exists (local config present)"
else
  warn ".env.local not found — needed to run dev server"
fi

if grep -q ".env.local" .gitignore 2>/dev/null || grep -q ".env\*" .gitignore 2>/dev/null || grep -q "\.env" .gitignore 2>/dev/null; then
  pass ".gitignore covers .env files"
else
  fail ".gitignore does NOT cover .env files — secrets at risk"
fi

# =============================================
section "11. Package.json Scripts"
# =============================================

if [ -f "package.json" ]; then
  for script in "dev" "build" "start" "lint" "typecheck"; do
    if grep -q "\"$script\"" package.json; then
      pass "package.json has '$script' script"
    else
      fail "package.json MISSING '$script' script"
    fi
  done
else
  fail "package.json MISSING"
fi

# =============================================
section "12. TSConfig Strict Mode"
# =============================================

if [ -f "tsconfig.json" ]; then
  if grep -q '"strict":\s*true\|"strict": true' tsconfig.json; then
    pass "tsconfig.json has strict: true"
  else
    fail "tsconfig.json strict mode NOT enabled"
  fi
else
  fail "tsconfig.json MISSING"
fi

# =============================================
section "13. Naming Consistency Check"
# =============================================

# Search for stale 'modules/' references
MODULES_REFS=$(grep -r "modules/" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.mdc" -l 2>/dev/null || true)
if [ -z "$MODULES_REFS" ]; then
  pass "No stale 'modules/' references in code or docs"
else
  fail "Found 'modules/' references in: $MODULES_REFS"
fi

# Search for features/ references to confirm consistency
FEATURES_REFS=$(grep -r "features/" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.mdc" -l 2>/dev/null || true)
if [ -n "$FEATURES_REFS" ]; then
  pass "features/ references found — naming is consistent"
else
  warn "No features/ references found in code yet (may be normal at this stage)"
fi

# =============================================
section "14. Lint and Typecheck"
# =============================================

echo "  Running pnpm lint..."
if pnpm lint > /tmp/fw-lint.log 2>&1; then
  pass "pnpm lint — clean"
else
  LINT_ERRORS=$(cat /tmp/fw-lint.log | tail -5)
  fail "pnpm lint — errors found: $LINT_ERRORS"
fi

echo "  Running pnpm typecheck..."
if pnpm exec tsc --noEmit > /tmp/fw-tsc.log 2>&1; then
  pass "pnpm typecheck — clean"
else
  TSC_ERRORS=$(cat /tmp/fw-tsc.log | tail -5)
  fail "pnpm typecheck — errors found: $TSC_ERRORS"
fi

# =============================================
section "15. Build Phase Progress"
# =============================================

echo "" >> "$REPORT"
echo "| Step | Description | Status |" >> "$REPORT"
echo "|------|-------------|--------|" >> "$REPORT"

# Step 0
if [ -d "app" ] && [ -d "features" ] && [ -d "server" ] && [ -d "lib" ]; then
  echo "| Step 0 | Repository scaffold | ✅ Complete |" >> "$REPORT"
else
  echo "| Step 0 | Repository scaffold | ❌ Incomplete |" >> "$REPORT"
fi

# Step 1
RULES_OK=true
for rule in "architecture.mdc" "typescript-quality.mdc" "workflow.mdc" "ui.mdc" "security.mdc" "integrations.mdc"; do
  [ ! -f ".cursor/rules/$rule" ] && RULES_OK=false
done
if $RULES_OK; then
  echo "| Step 1 | Cursor rules | ✅ Complete |" >> "$REPORT"
else
  echo "| Step 1 | Cursor rules | ❌ Incomplete |" >> "$REPORT"
fi

# Step 2
if [ -f "lib/auth/is-admin.ts" ] && [ -f "app/(dashboard)/layout.tsx" ] && [ -f "app/(admin)/layout.tsx" ]; then
  echo "| Step 2 | Route group layouts + auth gates | ✅ Complete |" >> "$REPORT"
else
  echo "| Step 2 | Route group layouts + auth gates | ❌ Incomplete |" >> "$REPORT"
fi

# Step 3
STEP3_OK=true
for f in "lib/env/index.ts" "lib/db/client.ts" "lib/db/server.ts" "lib/encryption/encrypt.ts" "lib/logger/logger.ts"; do
  [ ! -f "$f" ] && STEP3_OK=false
done
if $STEP3_OK; then
  echo "| Step 3 | Shared infrastructure | ✅ Complete |" >> "$REPORT"
else
  echo "| Step 3 | Shared infrastructure | ❌ Incomplete |" >> "$REPORT"
fi

# Steps 4-16
STEPS_FUTURE=(
  "4|Database schema + types|supabase/migrations|types/domain.ts"
  "5|Auth flow|app/(auth)/login/page.tsx|features/auth"
  "6|ElevenLabs adapter|server/integrations/elevenlabs/adapter.ts|server/integrations/registry/integration-registry.ts"
  "7|Admin integration catalog|features/admin/queries|app/(admin)/admin/integrations"
  "8|Seed ElevenLabs integration|supabase/seed/01_elevenlabs_sfx.sql|"
  "9|Admin credential storage|features/admin/actions/save-credential.ts|features/admin/components/CredentialForm.tsx"
  "10|User dashboard|features/dashboard/queries|features/integrations/queries"
  "11|Widget creation|server/services/create-widget.ts|features/widgets/components/CreateWidgetForm.tsx"
  "12|Embed snippet|features/widgets/lib/embed-snippet.ts|app/(dashboard)/dashboard/widgets"
  "13|Widget runtime page|features/widget-runtime/components/SoundFxWidget.tsx|app/(widget)/w"
  "14|Generation API route|app/api/widgets|server/services/generate-widget-output.ts"
  "15|Admin integration states|features/admin/actions/update-integration-status.ts|"
  "16|Admin draft ideas|features/admin/components/DraftForm.tsx|features/admin/actions/save-draft.ts"
)

for entry in "${STEPS_FUTURE[@]}"; do
  IFS='|' read -r num desc check1 check2 <<< "$entry"
  FOUND=false
  [ -n "$check1" ] && { [ -f "$check1" ] || [ -d "$check1" ]; } && FOUND=true
  [ -n "$check2" ] && { [ -f "$check2" ] || [ -d "$check2" ]; } && FOUND=true
  if $FOUND; then
    echo "| Step $num | $desc | ✅ Complete |" >> "$REPORT"
  else
    echo "| Step $num | $desc | ⬜ Not started |" >> "$REPORT"
  fi
done

# =============================================
# Summary
# =============================================

echo "" >> "$REPORT"
echo "---" >> "$REPORT"
echo "" >> "$REPORT"
echo "## Summary" >> "$REPORT"
echo "" >> "$REPORT"
echo "- **Passed:** $PASS_COUNT" >> "$REPORT"
echo "- **Warnings:** $WARN_COUNT" >> "$REPORT"
echo "- **Failed:** $FAIL_COUNT" >> "$REPORT"
echo "" >> "$REPORT"

if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
  STATUS="✅ ALL CLEAR"
elif [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="✅ PASS WITH WARNINGS"
else
  STATUS="❌ ISSUES FOUND — review failures above"
fi

echo "**Overall: $STATUS**" >> "$REPORT"

echo ""
echo "========================================="
echo "  AUDIT COMPLETE"
echo "  Passed: $PASS_COUNT  Warnings: $WARN_COUNT  Failed: $FAIL_COUNT"
echo "  Status: $STATUS"
echo "  Report: $REPORT"
echo "========================================="
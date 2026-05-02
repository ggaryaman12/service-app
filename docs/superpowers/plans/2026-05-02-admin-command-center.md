# Admin Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the full admin suite into a premium Operations Command Center.

**Architecture:** Add route-aware app chrome so `/admin/*` gets a full-screen shell. Add admin-only UI primitives and update each admin page to use them while keeping existing Server Actions and Prisma reads.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Prisma, Auth.js, Playwright.

---

### Task 1: Admin E2E Coverage

**Files:**
- Create: `tests/e2e/admin-dashboard.spec.ts`

- [ ] Add a Playwright test that creates an admin, injects an Auth.js session cookie, opens `/admin`, and expects the command-center heading, sidebar navigation, KPI labels, chart labels, and live queue.
- [ ] Run `npm run test:e2e -- tests/e2e/admin-dashboard.spec.ts` and verify it fails because the current admin UI does not expose the command-center shell.

### Task 2: Admin Shell and Shared UI

**Files:**
- Create: `src/components/app-chrome.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/admin/_components/admin-shell.tsx`
- Create: `src/app/admin/_components/admin-ui.tsx`
- Modify: `src/app/admin/layout.tsx`

- [ ] Move public chrome orchestration into `AppChrome` and hide public header/footer/mobile nav for `/admin/*`.
- [ ] Add `AdminShell` with persistent sidebar, topbar/search, responsive navigation, sign-out form, and active route styling.
- [ ] Add reusable admin primitives: `AdminPageHeader`, `MetricCard`, `DataPanel`, `StatusPill`, `AdminActionButton`, `MiniBarChart`, `DonutChart`, `AdminTable`, `FieldShell`.

### Task 3: Overview Dashboard

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] Replace the simple cards with KPI strip, booking velocity chart, status mix chart, live booking queue, worker capacity, and catalog/content health panels.
- [ ] Use real Prisma aggregates and tolerate missing optional integration tables.

### Task 4: CRUD Pages

**Files:**
- Modify: `src/app/admin/categories/page.tsx`
- Modify: `src/app/admin/services/page.tsx`
- Modify: `src/app/admin/users/page.tsx`
- Modify: `src/app/admin/marketing/page.tsx`
- Modify: `src/app/admin/integration-channels/page.tsx`
- Modify: `src/app/admin/integration-channels/integration-channel-forms.tsx`

- [ ] Convert each page to page header + table-first layout + action panel.
- [ ] Preserve all existing form field names and actions.
- [ ] Add status badges, empty states, compact metadata, and hover transitions.

### Task 5: Verification

**Files:**
- Modify tests only if selectors need scoping.

- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `git diff --check`.

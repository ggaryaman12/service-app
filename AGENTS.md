# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:headed   # Playwright E2E tests with visible browser
npm run test:e2e:report   # open latest Playwright HTML report
npm run prisma:generate   # regenerate Prisma client after schema changes
npm run prisma:migrate    # run migrations (dev)
npm run prisma:studio     # open Prisma Studio GUI
```

Playwright E2E tests are configured under `tests/e2e`. No separate unit test suite is configured.

## Testing policy

Future agents must use a test-first workflow for every feature, bug fix, route change, permission change, API change, or UI behavior change:

1. Write or update the relevant test first.
2. Run that focused test and confirm it fails for the expected reason.
3. Implement the smallest change that makes the test pass.
4. Run the focused test again.
5. Before handoff, run `npx tsc --noEmit --pretty false`, `npm run lint`, `npm run build`, `npm run test:e2e`, and `git diff --check` unless the user explicitly narrows verification.

Use Playwright E2E tests in `tests/e2e` for user-visible app behavior because this repo has no separate unit test suite. API features need request-level tests, UI features need screen/navigation tests, and cross-role or booking flows need integrated E2E tests that exercise auth, database records, and real route handlers together.

## Architecture

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Prisma + MySQL (TiDB Serverless) · NextAuth v5 (beta) · Cloudinary

### Auth & roles

Four roles: `ADMIN`, `MANAGER`, `WORKER`, `CUSTOMER`. Auth is credentials-only (no OAuth). Two separate login pages: `/customer/login` and `/staff/login`. The `loginAs` field in the credentials payload enforces the split — customers can't log in via staff login and vice versa.

`src/auth.ts` exports `{ handlers, auth, signIn, signOut }`. Role is embedded in the JWT and surfaced on `session.user.role` via the callbacks there. `src/types/next-auth.d.ts` extends the session type.

Middleware (`middleware.ts`) guards staff feature routes (`/dashboard`, `/bookings/*`, `/dispatch`, `/catalog/*`, `/marketing`, `/integration-channels`, `/roles`, `/managers`), `/worker/*`, and `/staff/*`. Public routes and customer routes are unguarded by middleware (customer auth is enforced in page/action code).

First admin is bootstrapped via `/staff/setup` (one-time).

Managers keep the core `MANAGER` auth role, but feature access is controlled by one assigned `ManagerAccessRole`. Admin users bypass manager access-role restrictions.

### Data layer

Single Prisma client singleton in `src/lib/prisma.ts` (dev global to avoid hot-reload connection storms). Prisma remains the default access layer for transactional business logic: auth, users, roles, bookings, services, workers, marketing records, integration channels, and normal CRUD mutations.

This project is expected to need heavier reporting, analytics, exports, dashboards, and multi-table joins over time. Those should not be forced through deeply nested Prisma query builders. For reporting-style reads, create a dedicated reporting/query service and use explicit MySQL/TiDB SQL through Prisma raw-query APIs (`$queryRaw` with parameter binding, not string-concatenated unsafe SQL). Keep raw SQL read-focused unless a write is explicitly designed and reviewed.

Operationally, the database direction is TiDB Cloud Starter first: MySQL-compatible, free-first, Mac/browser-friendly, with TiDB Cloud SQL Editor for visual table/query inspection. Future paid scaling should upgrade the same TiDB/hosting path where possible instead of changing database families.

See `docs/architecture/free-first-deployment-database-plan.md` for the deployment/database plan and reporting-query policy.

Key models: `User` (with `WorkerProfile` 1:1 for workers and optional manager access role for managers) → `Booking` (links customer + optional worker + optional manager + service + optional integration channel) → `Media` + `Review`. `ManagerAccessRole` controls manager permissions. `IntegrationChannel` stores hashed API keys for open APIs. `SiteSetting` (singleton) and `Banner` drive the marketing/landing content.

`BookingStatus` state machine: `PENDING → CONFIRMED → EN_ROUTE → IN_PROGRESS → COMPLETED` (or `CANCELLED`).

Prices are stored as integer INR rupee amounts, not floats.

### Mutations

UI form mutations use Next.js Server Actions (`"use server"`). Each section has its own `actions.ts` and now delegates business logic to feature services:
- `src/app/(admin)/admin/actions.ts` — catalog category/service mutations, guarded by feature permissions.
- `src/app/(admin)/admin/marketing/server-actions.ts` — SiteSetting + Banner mutations, guarded by `marketing.manage`.
- `src/app/(staff)/actions.ts` — admin-only manager access-role and manager account mutations.
- `src/app/(public)/book/actions.ts` — single-service booking.
- `src/app/(public)/checkout/actions.ts` — cart checkout (multi-booking).
- `src/app/(operations)/_actions/booking-actions.ts` — booking status + dispatch, guarded by feature permissions.
- `src/app/(operations)/worker/actions.ts` — duty toggle + job state transitions.

REST mutations live under `/api/app/*` for first-party Auth.js session clients and `/api/open/*` for integration channels. Staff feature APIs use the centralized permission resolver in `src/features/operations/operations-access.ts`; open write/status APIs authenticate DB-backed integration-channel keys.

### Cart

Client-only, persisted to `localStorage` key `jammuserve_cart_v1`. `src/lib/cart-store.ts` is the pure store (no React). `src/components/cart/use-cart.ts` is the React hook that subscribes to `jammuserve:cart` custom events + `storage` events for cross-tab sync.

### Image uploads

Cloudinary. `src/app/api/cloudinary/sign/route.ts` signs upload requests server-side. `src/components/cloudinary-upload-field.tsx` is the reusable upload widget.

### Route summary

See `ROUTES.md` for the full route map. Short version: public customer routes at `/`, `/services`, `/service/[slug]`, `/book/[serviceId]`, `/checkout`; customer auth at `/customer/*`; shared admin/manager feature routes at `/dashboard`, `/bookings`, `/dispatch`, `/catalog/*`, `/marketing`, `/integration-channels`, `/roles`, `/managers`; worker portal at `/worker/*`.

## Env vars

Required (see `.env.example`):
- `DATABASE_URL` — MySQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — base URL (e.g. `http://localhost:3000`)
- `CLOUDINARY_URL` — Cloudinary credentials


<claude-mem-context>
# Memory Context

# [service-app] recent context, 2026-05-01 8:31pm GMT+5:30

No previous sessions found.
</claude-mem-context>

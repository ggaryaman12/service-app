# E2E Test Runbook

## Project Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example and fill the required values:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CLOUDINARY_URL`

Generate Prisma client after dependency/schema changes:

```bash
npm run prisma:generate
```

Run the app locally:

```bash
npm run dev
```

By default, Next.js serves the app at `http://localhost:3000`.

## Quality Commands

Run lint:

```bash
npm run lint
```

Run production build and type checks:

```bash
npm run build
```

## E2E Commands

Install the Chromium browser binary once:

```bash
npm run playwright:install
```

Run the full E2E suite:

```bash
npm run test:e2e
```

Run only the public customer routes and open catalog contract:

```bash
npm run test:e2e -- tests/e2e/public-routes.spec.ts
```

Run with a visible browser:

```bash
npm run test:e2e:headed
```

Open the latest HTML report:

```bash
npm run test:e2e:report
```

## When To Add Tests

### Mandatory Test-First Workflow

Any future agent building a feature or fixing behavior in this repository must write or update tests before implementation. The expected workflow is:

1. Add the smallest focused test that describes the required behavior.
2. Run that test and verify it fails for the expected reason.
3. Implement the feature or fix.
4. Re-run the focused test until it passes.
5. Run broader verification before handoff.

API features need request-level tests. UI features need browser tests that assert visible screens, navigation, and shell behavior. Role/permission, booking, checkout, worker, manager, admin, and integration-channel changes need integrated tests that exercise auth, DB records, and real route handlers together.

Add or update E2E tests whenever a change affects:

- public navigation
- login/register flows
- public catalog API contracts
- booking or checkout flows
- cart behavior
- responsive mobile shell behavior
- design-system tokens that should compile into visible runtime CSS
- route guards or role-specific portals
- first-party `/api/app/*` contracts
- open `/api/open/*` contracts
- manager access roles and permission-scoped fields/actions
- staff feature routes such as `/dashboard`, `/bookings`, `/dispatch`, `/catalog/*`, `/marketing`, `/integration-channels`, `/roles`, and `/managers`

Keep tests stable. Prefer public UI behavior and accessible labels over implementation details. Public customer tests must not require seeded categories, services, or bookings.

## How It Works

`playwright.config.ts` starts the Next.js dev server on `127.0.0.1:3100` and runs Chromium tests from `tests/e2e`.

The runner uses one worker by default because several public pages hit the configured database during render. Serial execution keeps local verification deterministic and avoids noisy concurrent database failures.

Artifacts are written under `../.jammuserve-playwright/`, which is outside this repository:

- `../.jammuserve-playwright/results`: screenshots, traces, and videos for failures.
- `../.jammuserve-playwright/report`: HTML report.

## Existing Coverage

Current test files:

- `tests/e2e/public-routes.spec.ts`
  - Public homepage shell, JammuServe brand link, and visible main content.
  - Customer-first services page heading, search, and category controls.
  - Customer login/register page forms and route contract.
  - Mobile bottom navigation.
  - `GET /api/open/catalog` public API contract with empty-database-safe assertions.
- `tests/e2e/design-system.spec.ts`
  - Runtime design-token CSS compilation.
- `tests/e2e/api-platform.spec.ts`
  - Open catalog without auth.
  - Open booking/status API key failures.
  - Open booking creates a real `PENDING` booking and returns minimal status.
  - First-party app APIs reject unauthenticated and wrong-role users.
  - Manager booking/dispatch APIs stay scoped to the manager region and redact restricted fields.
  - Worker APIs reject unassigned jobs and invalid status transitions.
- `tests/e2e/manager-access-roles.spec.ts`
  - Admin can create manager access roles.
  - Admin can create managers and update their assigned access role.
  - Managers with no access role are blocked from feature APIs.
  - Booking-only managers can access bookings but not dispatch, roles, or managers APIs.
  - Old role-named staff routes and APIs (`/admin/*`, `/manager/*`, `/api/app/manager/*`) are removed.
- `tests/e2e/admin-dashboard.spec.ts`
  - Admin/staff dashboard shell renders navigation and operational widgets.
  - Catalog category/service workspaces render through feature routes.
  - Route transition overlay appears during internal staff navigation.
- `tests/e2e/persistent-shell.spec.ts`
  - Public shell remains mounted during public navigation.
  - Staff sidebar/header remain mounted during admin catalog navigation.
  - Manager feature shell remains mounted during `/dashboard`, `/dispatch`, and `/bookings` navigation.
  - Full-screen loader covers the viewport without remounting staff chrome.

## Current Coverage Review

The current suite covers API testing, UI screen testing, and integrated E2E testing for the platform foundation:

- API coverage: public catalog, open booking/status, first-party customer/staff/worker auth guards, manager booking/dispatch scoping, worker job transition failures, roles, and managers.
- UI coverage: public home/services/auth/mobile shells, admin dashboard, catalog category/service workspaces, staff shell persistence, route-transition overlay, and manager feature navigation.
- Integrated coverage: access-role creation, manager creation and reassignment, manager permission gating, region scoping, old-route removal, open booking persistence, and worker assignment safety.

When adding a new page or feature, update this section and add tests before implementation so future agents can quickly see what is covered and what still needs tests.

## Customer UI/API Regression Checklist

Before shipping customer-facing UI changes, run:

```bash
npm run test:e2e -- tests/e2e/public-routes.spec.ts
```

The checks should confirm:

- `/`, `/services`, `/customer/login`, and `/customer/register` load without app error text.
- `/services` exposes the customer-first services heading, a `Search services` input, and the all-categories control.
- Mobile home keeps the bottom navigation visible.
- `/api/open/catalog` returns `{ data, meta }` with array-backed `categories` and `services`, plus `version`, `currency`, and `paymentMode` metadata.

These tests intentionally avoid exact service/category counts so they remain deterministic against a fresh or empty local database.

## Reusing A Running Server

To test against an already running app:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## Debugging Failures

After a failed E2E run, inspect artifacts under:

```bash
../.jammuserve-playwright/results
```

Open the HTML report:

```bash
npm run test:e2e:report
```

Playwright traces can be opened with:

```bash
npx playwright show-trace ../.jammuserve-playwright/results/<failed-test-folder>/trace.zip
```

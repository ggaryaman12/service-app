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

Add or update E2E tests whenever a change affects:

- public navigation
- login/register flows
- public catalog API contracts
- booking or checkout flows
- cart behavior
- responsive mobile shell behavior
- design-system tokens that should compile into visible runtime CSS
- route guards or role-specific portals

Keep tests stable. Prefer public UI behavior and accessible labels over implementation details. Public customer tests must not require seeded categories, services, or bookings.

## How It Works

`playwright.config.ts` starts the Next.js dev server on `127.0.0.1:3100` and runs Chromium tests from `tests/e2e`.

The runner uses one worker by default because several public pages hit the configured database during render. Serial execution keeps local verification deterministic and avoids noisy concurrent database failures.

Artifacts are written under `output/playwright/`, which is ignored by git:

- `output/playwright/results`: screenshots, traces, and videos for failures.
- `output/playwright/report`: HTML report.

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
output/playwright/results
```

Open the HTML report:

```bash
npm run test:e2e:report
```

Playwright traces can be opened with:

```bash
npx playwright show-trace output/playwright/results/<failed-test-folder>/trace.zip
```

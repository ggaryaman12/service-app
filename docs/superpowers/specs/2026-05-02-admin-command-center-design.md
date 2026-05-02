# Admin Command Center Design

## Goal

Redesign every admin page into an industry-level Operations Command Center while preserving the existing business logic, Server Actions, Auth.js role guards, and API/service foundation.

## Visual Direction

Use a premium, dense operations UI: dark persistent sidebar, warm neutral work surface, amber primary accent, compact KPI strips, table-first CRUD screens, and subtle motion. The admin should feel like a professional internal tool, not a marketing page.

## Scope

- Redesign `/admin` overview.
- Redesign `/admin/categories`.
- Redesign `/admin/services`.
- Redesign `/admin/users`.
- Redesign `/admin/marketing`.
- Redesign `/admin/integration-channels`.
- Add reusable admin UI primitives for shell, page headers, metrics, charts, data sections, fields, buttons, status pills, and tables.
- Hide public site chrome on `/admin/*` and use a full-screen admin shell.

## Non-Goals

- No public/customer UI redesign.
- No manager or worker portal redesign in this pass.
- No new chart library.
- No new business rules or DB model changes.

## Data and Behavior

The overview uses existing Prisma data: bookings, workers, users, services, categories, banners, and integration channels when the table exists. CRUD pages continue to submit to existing Server Actions. Missing optional/migration-backed tables show polished setup or empty states instead of crashing.

## Motion

Use CSS/Tailwind and existing Framer Motion infrastructure only where useful: page entrance, sidebar active states, KPI/chart reveals, table hover states, and button interactions. Motion must remain fast and operational.

## Verification

- Add Playwright admin UI coverage with an Auth.js session cookie.
- Run `npm run build`.
- Run `npm run lint`.
- Run `npm run test:e2e`.
- Run `git diff --check`.

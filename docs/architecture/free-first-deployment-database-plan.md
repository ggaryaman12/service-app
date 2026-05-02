# Free-First Deployment And Database Plan

Date: 2026-05-02

## Decision

Use a free-first stack while the business is validating real customer demand:

- Database: TiDB Cloud Starter.
- App hosting: start with Netlify Free; if Next.js runtime behavior is blocked, use Koyeb Free as the fallback.
- Media: keep Cloudinary free because upload signing is already wired.
- Database visibility: use TiDB Cloud SQL Editor in the browser on Mac.

Avoid SQL Server Management Studio, SQL Server, phpMyAdmin-only hosts, and local-only database tools as the default operating model. The first production path should stay Mac/browser friendly and MySQL-compatible.

## Database Access Policy

Keep Prisma for transactional application logic:

- auth and sessions
- users, managers, roles, and workers
- booking creation and status updates
- catalog and marketing CRUD
- integration-channel writes
- normal app APIs and Server Actions

Use explicit MySQL/TiDB SQL for reporting-style reads:

- revenue reports
- worker performance reports
- booking funnels
- customer cohorts
- admin dashboards with many joins
- exports and analytical snapshots

Reporting SQL should live in dedicated reporting/query services instead of being scattered through pages or route handlers. Prefer `prisma.$queryRaw` with parameter binding. Do not build SQL by string concatenation. Use `$queryRawUnsafe` only when the SQL shape cannot be parameterized and the input is fully controlled.

## Why This Split

Prisma keeps business writes and relation-heavy CRUD type-safe and maintainable. Raw SQL keeps heavy reports readable, optimizable, and easy to compare with TiDB Cloud SQL Editor. This avoids a false choice between ORM-only code and raw-SQL-everywhere code.

## Scale-Up Path

When customer traffic or operational usage grows:

1. Upgrade TiDB Cloud first instead of switching database families.
2. Upgrade the selected app host plan.
3. Add indexes based on real `EXPLAIN` output from reporting queries.
4. Move repeated reports into stable reporting services with tests.
5. Consider a paid all-in-one platform only if operational simplicity becomes more valuable than free-first cost.

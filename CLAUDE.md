# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm run prisma:generate   # regenerate Prisma client after schema changes
npm run prisma:migrate    # run migrations (dev)
npm run prisma:studio     # open Prisma Studio GUI
```

No test suite is configured.

## Architecture

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Prisma + MySQL (TiDB Serverless) · NextAuth v5 (beta) · Cloudinary

### Auth & roles

Four roles: `ADMIN`, `MANAGER`, `WORKER`, `CUSTOMER`. Auth is credentials-only (no OAuth). Two separate login pages: `/customer/login` and `/staff/login`. The `loginAs` field in the credentials payload enforces the split — customers can't log in via staff login and vice versa.

`src/auth.ts` exports `{ handlers, auth, signIn, signOut }`. Role is embedded in the JWT and surfaced on `session.user.role` via the callbacks there. `src/types/next-auth.d.ts` extends the session type.

Middleware (`middleware.ts`) guards `/admin/*`, `/manager/*`, `/worker/*`, `/staff/*`. Admin-only, manager-or-admin, worker-or-admin respectively. Public routes and customer routes are unguarded by middleware (customer auth is enforced in page/action code).

First admin is bootstrapped via `/staff/setup` (one-time).

### Data layer

Single Prisma client singleton in `src/lib/prisma.ts` (dev global to avoid hot-reload connection storms). All DB access goes through this — no raw SQL.

Key models: `User` (with `WorkerProfile` 1:1 for workers) → `Booking` (links customer + optional worker + optional manager + service) → `Media` + `Review`. `SiteSetting` (singleton) and `Banner` drive the marketing/landing content.

`BookingStatus` state machine: `PENDING → CONFIRMED → EN_ROUTE → IN_PROGRESS → COMPLETED` (or `CANCELLED`).

Prices stored as integers (paise/cents, not floats).

### Mutations

All mutations use Next.js Server Actions (`"use server"`). Each section has its own `actions.ts`:
- `src/app/admin/actions.ts` — categories, services, staff user CRUD
- `src/app/admin/marketing/server-actions.ts` — SiteSetting + Banner
- `src/app/book/actions.ts` — single-service booking
- `src/app/checkout/actions.ts` — cart checkout (multi-booking)
- `src/app/manager/actions.ts` — booking status + dispatch
- `src/app/worker/actions.ts` — duty toggle + job state transitions

Every admin/staff action calls a `requireAdmin()` / `requireManager()` guard at the top that reads the session server-side.

### Cart

Client-only, persisted to `localStorage` key `jammuserve_cart_v1`. `src/lib/cart-store.ts` is the pure store (no React). `src/components/cart/use-cart.ts` is the React hook that subscribes to `jammuserve:cart` custom events + `storage` events for cross-tab sync.

### Image uploads

Cloudinary. `src/app/api/cloudinary/sign/route.ts` signs upload requests server-side. `src/components/cloudinary-upload-field.tsx` is the reusable upload widget.

### Route summary

See `ROUTES.md` for the full route map. Short version: public customer routes at `/`, `/services`, `/service/[slug]`, `/book/[serviceId]`, `/checkout`; customer auth at `/customer/*`; staff portals at `/admin/*`, `/manager/*`, `/worker/*`.

## Env vars

Required (see `.env.example`):
- `DATABASE_URL` — MySQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — base URL (e.g. `http://localhost:3000`)
- `CLOUDINARY_URL` — Cloudinary credentials

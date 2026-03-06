# JammuServe Routes

This document lists the currently implemented routes in this repo.

## Public (Customer-facing)

- `/` — Landing + categories + offers + featured services
- `/services` — Service listing (search + category filters)
- `/service/[id]` — Service detail page (PDP)
- `/book/[serviceId]` — Checkout flow (creates `Booking` as `PENDING`)
- `/checkout` — Cart checkout (creates multiple `Booking`s as `PENDING`)
- `/account` — Customer dashboard (booking timeline + provider actions)

## Customer Auth

- `/customer/login` — Customer login (CUSTOMER-only)
- `/customer/register` — Customer signup (creates CUSTOMER)

Legacy redirects:
- `/login` → `/customer/login`
- `/register` → `/customer/register`

## Staff Auth

- `/staff/login` — Staff login (ADMIN/MANAGER/WORKER only)
- `/staff/setup` — One-time first-admin bootstrap (keep private)

Legacy redirect:
- `/setup` → `/staff/setup`

## Admin (protected)

- `/admin` — Admin overview
- `/admin/categories` — Categories CRUD
- `/admin/services` — Services CRUD
- `/admin/users` — User management + create manager/worker
- `/admin/marketing` — Announcement + landing hero + offers (banners)

## Manager (protected)

- `/manager` — Manager home
- `/manager/bookings` — Bookings list + status updates
- `/manager/bookings/[id]` — Booking detail + dispatch assign worker
- `/manager/dispatch` — Dispatch screen (assign PENDING → CONFIRMED)

## Worker (protected)

- `/worker` — Worker dashboard (toggle duty + active jobs)
- `/worker/job/[id]` — Job execution state machine

## API

- `/api/auth/[...nextauth]` — Auth.js handlers

## Middleware protection

Route protection is enforced for:
- `/admin/*` (ADMIN only)
- `/manager/*` (MANAGER or ADMIN)
- `/worker/*` (WORKER or ADMIN)
- `/staff/*` (public for `/staff/login` + `/staff/setup`, otherwise staff redirect)

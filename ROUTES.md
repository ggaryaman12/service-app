# JammuServe Functionality, Routes, APIs, and Demo Access

Last updated: 2026-05-01

JammuServe is a hyper-local home-service marketplace built with Next.js App Router, Prisma, MySQL/TiDB, NextAuth credentials auth, Cloudinary uploads, Framer Motion, and React Three Fiber.

## Local Access

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

Required environment variables are listed in `.env.example`:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_URL
```

## Local Credentials

The current local database has this admin account:

| Role | Email | Password | Login URL |
|---|---|---|---|
| Admin | `admin@jammuserve.test` | `Demo@1234` | `/staff/login` |

Other demo users are not created automatically during `npm install` or `npm run dev`. If you want all predictable demo credentials, run:

```bash
npm run seed:demo
```

This command upserts the following users and resets their password to `Demo@1234`.

| Role | Email | Password | Login URL | How to create |
|---|---|---|---|---|
| Admin | `admin@jammuserve.test` | `Demo@1234` | `/staff/login` | Created by `npm run seed:demo`, or manually through `/staff/setup` before any admin exists. |
| Manager | `manager@jammuserve.test` | `Demo@1234` | `/staff/login` | Created by `npm run seed:demo`, or manually from `/managers`. |
| Worker | `worker@jammuserve.test` | `Demo@1234` | `/staff/login` | Created by `npm run seed:demo`. |
| Customer | `customer@jammuserve.test` | `Demo@1234` | `/customer/login` | Created by `npm run seed:demo`, or manually from `/customer/register`. |

Important auth rule: customers must use customer login. Admin, manager, and worker accounts must use staff login.

## Core Functionality

| Area | What it supports | Main routes |
|---|---|---|
| Landing | Cinematic home page, service story, route buttons into focused flows | `/` |
| Catalog | Browse services, search by keyword, filter by category, add services to cart | `/services`, `/service/[serviceId]` |
| Cart | Client-side localStorage cart using `jammuserve_cart_v1` | `/services`, `/checkout` |
| Booking | Single-service booking with address, region, date, slot, notes, COD payment mode | `/book/[serviceId]` |
| Checkout | Cart checkout that creates one booking per cart item quantity | `/checkout` |
| Customer account | Customer profile summary, booking status timeline, worker call/WhatsApp links | `/account` |
| Customer auth | Customer login and self-registration | `/customer/login`, `/customer/register` |
| Staff auth | Staff login and first-admin setup | `/staff/login`, `/staff/setup` |
| Staff dashboard | Shared admin/manager overview, booking operations, catalog, marketing, integration channels, manager roles | `/dashboard`, `/bookings`, `/dispatch`, `/catalog/*`, `/marketing`, `/integration-channels`, `/roles`, `/managers` |
| Worker | Duty toggle, active jobs, assigned job status updates | `/worker/*` |
| Open API | Public catalog plus authorized booking/status APIs for third-party clients, AI chatbots, or WhatsApp integrations | `/api/open/*` |
| First-party API | Session-authenticated REST APIs for JammuServe-owned web/mobile clients | `/api/app/*` |
| Upload signing | Permission-gated Cloudinary upload signature generation | `/api/cloudinary/sign` |

## Page Routes

### Public Customer-Facing Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page. It should introduce the service and route users to focused flows instead of rendering the full catalog inline. |
| `/services` | Public | Catalog listing with keyword search (`q`) and category filter (`category`). Shows categories, service cards, prices, durations, and cart controls. |
| `/service/[serviceId]` | Public | Service detail page. Despite the folder name `[slug]`, the current implementation expects a service ID. |
| `/book/[serviceId]` | Public view, customer required to submit | Single-service booking screen. Logged-out users see login/register CTAs. Customers can submit booking details. |
| `/checkout` | Public view, customer required to submit | Cart checkout. Reads cart from localStorage, validates service prices server-side, and creates bookings after login. |
| `/account` | Customer only | Customer dashboard with recent bookings, status timeline, worker assignment, call, and WhatsApp links. Redirects unauthenticated users to `/customer/login?next=/account`. |

### Customer Auth Routes

| Route | Access | Purpose |
|---|---|---|
| `/customer/login` | Public | Customer-only credentials login. Uses `loginAs=customer`. |
| `/customer/register` | Public | Creates a `CUSTOMER` user, then signs in and redirects. |
| `/login` | Public | Legacy redirect to `/customer/login`. |
| `/register` | Public | Legacy redirect to `/customer/register`. |

### Staff Auth Routes

| Route | Access | Purpose |
|---|---|---|
| `/staff/login` | Public | Staff-only credentials login for `ADMIN`, `MANAGER`, and `WORKER`. Uses `loginAs=staff`. |
| `/staff/setup` | Public only until first admin exists | One-time first-admin bootstrap. Redirects to `/staff/login` after an admin exists. |
| `/setup` | Public | Legacy redirect to `/staff/setup`. |

### Staff Feature Routes

Staff feature routes require an authenticated `ADMIN` or `MANAGER`. Admins always get all feature permissions. Managers must have one active manager access role with the matching permission.

| Route | Permission | Purpose |
|---|---|---|
| `/dashboard` | Any staff feature access, or admin | Shared role-aware overview with KPIs and live queue. |
| `/bookings` | `bookings.view` | Booking list and status controls scoped by manager region unless `bookings.allRegions` is granted. |
| `/bookings/[id]` | `bookings.view` | Booking detail and worker dispatch assignment when assignment permission is available. |
| `/dispatch` | `dispatch.view` | Dispatch board for assigning available workers to pending bookings. Assignment requires `dispatch.assign`. |
| `/catalog/categories` | `catalog.view` | Category workspace. Mutations require `catalog.edit`. |
| `/catalog/services` | `catalog.view` | Service catalog workspace. Mutations require `catalog.edit`. |
| `/marketing` | `marketing.manage` | Announcement, landing hero media/text/CTA, banner auto-scroll, and offer/banner records. |
| `/integration-channels` | `integrations.manage` | DB-backed integration channels, API key rotation, active status, and allowed scopes. |
| `/roles` | Admin only | Create, edit, and deactivate manager access roles. |
| `/managers` | Admin only | Create managers, set region, and assign one access role. |

### Worker Routes

Worker routes require `WORKER` or `ADMIN`.

| Route | Purpose |
|---|---|
| `/worker` | Worker dashboard with duty toggle and active jobs for today. |
| `/worker/job/[id]` | Assigned job detail and state transitions. Only the assigned worker can update the job. |

## Booking Lifecycle

The booking state machine is:

```text
PENDING -> CONFIRMED -> EN_ROUTE -> IN_PROGRESS -> COMPLETED
```

`CANCELLED` is also supported.

Typical flow:

1. Customer registers or logs in.
2. Customer opens `/services`.
3. Customer books one service through `/book/[serviceId]` or adds multiple services to cart and uses `/checkout`.
4. Booking is created as `PENDING`.
5. Manager assigns a worker from `/dispatch` or booking detail, if their access role allows dispatch assignment.
6. Booking becomes `CONFIRMED`.
7. Worker toggles duty online from `/worker`.
8. Worker updates assigned job through `/worker/job/[id]`.
9. Customer tracks status from `/account`.

## API Routes

### `GET /api/open/catalog`

Public open catalog endpoint for web UI, AI chatbot, WhatsApp, and future third-party integrations.

Query parameters:

| Name | Required | Meaning |
|---|---|---|
| `q` | No | Search services by service name, description, or category name. |
| `category` | No | Category slug filter. |

Example:

```bash
curl "http://localhost:3000/api/open/catalog?q=ac&category=ac-repair"
```

Response shape:

```json
{
  "data": {
    "categories": [],
    "services": [],
    "activeCategory": null
  },
  "meta": {
    "version": "v1",
    "currency": "INR",
    "paymentMode": "COD"
  }
}
```

Implementation path:

```text
src/app/api/open/catalog/route.ts
src/features/catalog/catalog.controller.ts
src/features/catalog/catalog.service.ts
```

### `GET /api/open/catalog/[serviceId]`

Public service-detail endpoint.

Example:

```bash
curl "http://localhost:3000/api/open/catalog/<SERVICE_ID>"
```

Successful response:

```json
{
  "data": {
    "id": "service-id",
    "name": "Service name",
    "description": "Service description",
    "imageUrl": null,
    "basePrice": 499,
    "estimatedMinutes": 60,
    "category": {
      "id": "category-id",
      "name": "Category",
      "slug": "category-slug"
    }
  },
  "meta": {
    "version": "v1",
    "currency": "INR",
    "paymentMode": "COD"
  }
}
```

Not found response:

```json
{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service not found"
  }
}
```

### `POST /api/open/bookings`

Creates a real `PENDING` booking for authorized third-party, chatbot, or WhatsApp channels.

Auth:

```text
x-api-key: <integration-channel-api-key>
```

The channel must be active and include the `booking:create` scope. Missing/invalid keys return `401`; active keys without the scope return `403 CHANNEL_FORBIDDEN`.

Request body:

```json
{
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "9999999999"
  },
  "serviceId": "service-id",
  "scheduledDate": "2026-05-02",
  "scheduledTimeSlot": "09:00 - 11:00",
  "address": "House/Flat, street, landmark",
  "region": "Gandhi Nagar",
  "notes": "Optional notes"
}
```

If the customer email does not exist, the API creates a locked `CUSTOMER` account with the supplied name, email, and phone. If the email belongs to staff or the phone does not match an existing customer, the request is rejected.

Successful response:

```json
{
  "data": {
    "id": "booking-id",
    "status": "PENDING"
  }
}
```

### `GET /api/open/bookings/[id]/status`

Returns minimal booking status for authorized integration channels. Status reads are scoped to bookings created by the same integration channel key.

Auth:

```text
x-api-key: <integration-channel-api-key>
```

The channel must be active and include the `booking:status` scope. Missing/invalid keys return `401`; active keys without the scope return `403 CHANNEL_FORBIDDEN`; bookings not owned by that channel return `404 BOOKING_NOT_FOUND`.

Example:

```bash
curl -H "x-api-key: <key>" "http://localhost:3000/api/open/bookings/<BOOKING_ID>/status"
```

Successful response:

```json
{
  "data": {
    "id": "booking-id",
    "status": "PENDING",
    "scheduledDate": "2026-05-02",
    "scheduledTimeSlot": "09:00 - 11:00",
    "service": {
      "id": "service-id",
      "name": "Service name"
    },
    "worker": null
  }
}
```

### First-party `/api/app/*`

First-party app APIs use the same Auth.js cookie/session authentication as the web app. They are intended for JammuServe-owned web/mobile clients, not third-party channels.

| Endpoint | Roles | Purpose |
|---|---|---|
| `GET /api/app/customer/account` | `CUSTOMER` | Customer profile plus recent bookings. |
| `GET /api/app/customer/bookings` | `CUSTOMER` | Customer booking list. |
| `POST /api/app/customer/bookings` | `CUSTOMER` | Single-service booking creation. |
| `POST /api/app/checkout` | `CUSTOMER` | Cart checkout; creates one booking per item quantity. |
| `GET /api/app/bookings` | `ADMIN`, `MANAGER` with `bookings.view` | Latest bookings, optional `region` filter. Managers stay region-scoped unless `bookings.allRegions` is granted. |
| `GET /api/app/bookings/[id]` | `ADMIN`, `MANAGER` with `bookings.view` | Booking detail with restricted fields based on permissions. |
| `PATCH /api/app/bookings` | `ADMIN`, `MANAGER` with `bookings.statusOverride` | Booking status update. |
| `GET /api/app/dispatch` | `ADMIN`, `MANAGER` with `dispatch.view` | Pending bookings plus online workers. |
| `POST /api/app/dispatch` | `ADMIN`, `MANAGER` with `dispatch.assign` | Assign worker and move booking to `CONFIRMED`. |
| `GET /api/app/worker/jobs` | `WORKER`, `ADMIN` | Worker active jobs for today. |
| `PATCH /api/app/worker/jobs` | `WORKER`, `ADMIN` | Assigned worker forward status transition. |
| `POST /api/app/worker/duty` | `WORKER`, `ADMIN` | Toggle duty online/offline. |
| `GET /api/app/admin/catalog` | `ADMIN`, `MANAGER` with `catalog.view` | Categories and services snapshot. |
| `/api/app/admin/categories*` | `ADMIN`, `MANAGER` with `catalog.edit` | Category create/update/delete. |
| `/api/app/admin/services*` | `ADMIN`, `MANAGER` with `catalog.edit` | Service create/update/delete. |
| `/api/app/admin/marketing/*` | `ADMIN`, `MANAGER` with `marketing.manage` | Announcement, hero, banner auto-scroll, and banner CRUD. |
| `/api/app/admin/integration-channels*` | `ADMIN`, `MANAGER` with `integrations.manage` | List/create channels, rotate keys, activate/deactivate channels. |
| `/api/app/roles*` | `ADMIN` | Create/edit/deactivate manager access roles. |
| `/api/app/managers*` | `ADMIN` | Create managers and update assigned access role/region/contact fields. |

API contract details are also documented in:

```text
docs/api/openapi.yaml
```

### `POST /api/cloudinary/sign`

Admin-only endpoint that returns Cloudinary upload signing fields.

Auth:

```text
Requires logged-in ADMIN session cookie.
```

Request body:

```json
{
  "folder": "jammuserve/hero",
  "resourceType": "video",
  "publicId": "optional-public-id"
}
```

Allowed folders must start with:

```text
jammuserve/
```

Example response:

```json
{
  "cloudName": "cloud-name",
  "apiKey": "api-key",
  "timestamp": 1770000000,
  "folder": "jammuserve/hero",
  "resourceType": "video",
  "publicId": "optional-public-id",
  "signature": "sha1-signature"
}
```

### `GET/POST /api/auth/[...nextauth]`

Auth.js route handlers for credentials login/session handling.

Implementation path:

```text
src/auth.ts
src/app/api/auth/[...nextauth]/route.ts
```

## Server Actions

These are not public REST APIs, but they power form submissions in the UI.

| File | Actions | Purpose |
|---|---|---|
| `src/app/(admin)/admin/actions.ts` | `createCategory`, `updateCategory`, `deleteCategory`, `createService`, `updateService`, `deleteService` | Catalog management, guarded by feature permissions. |
| `src/app/(admin)/admin/marketing/server-actions.ts` | `updateAnnouncement`, `updateLandingHero`, `updateBannerAutoScroll`, `createBanner`, `updateBanner`, `deleteBanner` | Landing/marketing content management, guarded by `marketing.manage`. |
| `src/app/(staff)/actions.ts` | `createAccessRole`, `updateAccessRole`, `createManagerAccount`, `updateManagerAccount` | Admin-only access role and manager account management. |
| `src/app/book/actions.ts` | `createBooking` | Single-service booking creation. |
| `src/app/checkout/actions.ts` | `createBookingsFromCart` | Multi-service cart checkout. |
| `src/app/(operations)/_actions/booking-actions.ts` | `assignWorker`, `updateBookingStatus` | Dispatch and booking status management, guarded by feature permissions. |
| `src/app/worker/actions.ts` | `toggleDuty`, `updateJobStatus` | Worker availability and assigned job progression. |

## Data Model Summary

| Model | Purpose |
|---|---|
| `User` | All users across roles: `ADMIN`, `MANAGER`, `WORKER`, `CUSTOMER`. |
| `WorkerProfile` | Worker-only duty status, skills, rating, current location. |
| `Category` | Service category, slug, image, active status. |
| `Service` | Bookable service with category, description, image, price, estimated minutes. |
| `Booking` | Customer booking linked to service, customer, optional worker, optional manager, status, date/slot, address, amount, notes. |
| `Media` | Before/after job media linked to bookings. |
| `Review` | Customer review of completed work. |
| `SiteSetting` | Announcement, hero, and landing/marketing settings. |
| `Banner` | Marketing offer/banner cards. |

Prices are stored as integers and displayed as INR rupee amounts in the current UI.

## Creating Demo Data

After creating the demo users, add catalog data:

1. Log in as admin at `/staff/login`.
2. Open `/catalog/categories`.
3. Create categories such as:
   - `AC Repair` with slug `ac-repair`
   - `Electrician` with slug `electrician`
   - `Salon` with slug `salon`
4. Open `/catalog/services`.
5. Create services under those categories with base prices and estimated minutes.
6. Open `/services` to confirm the customer catalog is populated.

Suggested demo services:

| Category | Service | Price | Duration |
|---|---|---:|---:|
| AC Repair | AC Gas Check | 299 | 30 mins |
| AC Repair | AC Service (General) | 499 | 60 mins |
| Electrician | Switch/Fan Repair | 249 | 45 mins |
| Electrician | New Light Installation | 299 | 45 mins |
| Salon | Haircut (Men) | 199 | 30 mins |
| Salon | Facial (Basic) | 499 | 45 mins |

## Route Protection Rules

| Route group | Allowed roles |
|---|---|
| `/dashboard`, `/bookings/*`, `/dispatch`, `/catalog/*`, `/marketing`, `/integration-channels` | `ADMIN`, `MANAGER` with matching feature permission |
| `/roles`, `/managers` | `ADMIN` |
| `/worker/*` | `WORKER`, `ADMIN` |
| `/staff/login` | Public |
| `/staff/setup` | Public only for first-admin setup |
| `/customer/*` | Public auth pages |
| `/account` | Enforced in page code for `CUSTOMER` |
| `/book/[serviceId]` | Public view, booking submit requires customer session |
| `/checkout` | Public view, checkout submit requires customer session |

## Quick Demo Walkthrough

1. For predictable demo credentials, run `npm run seed:demo`.
2. Log in at `/staff/login` with `admin@jammuserve.test` / `Demo@1234`.
3. Create manager access roles from `/roles` and managers from `/managers`.
4. Create categories and services from `/catalog/categories` and `/catalog/services`.
5. Log in at `/customer/login` with `customer@jammuserve.test` / `Demo@1234`, or register a new customer at `/customer/register`.
6. Browse `/services`, add services to cart, or open a service detail and book directly.
7. Customer confirms booking and sees it in `/account`.
8. Manager logs in and assigns a worker from `/dispatch`.
9. Worker logs in, toggles duty, opens `/worker/job/[id]`, and updates status.
10. Customer refreshes `/account` to see updated status.

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
| Manager | `manager@jammuserve.test` | `Demo@1234` | `/staff/login` | Created by `npm run seed:demo`, or manually from `/admin/users`. |
| Worker | `worker@jammuserve.test` | `Demo@1234` | `/staff/login` | Created by `npm run seed:demo`, or manually from `/admin/users`. |
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
| Admin | Category CRUD, service CRUD, staff creation, marketing settings, banners | `/admin/*` |
| Manager | Booking list, booking detail, dispatch worker assignment, status updates | `/manager/*` |
| Worker | Duty toggle, active jobs, assigned job status updates | `/worker/*` |
| Open API | Public catalog APIs for third-party clients, AI chatbots, or WhatsApp integrations | `/api/open/catalog*` |
| Upload signing | Admin-only Cloudinary upload signature generation | `/api/cloudinary/sign` |

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

### Admin Routes

Admin routes require an authenticated `ADMIN` user.

| Route | Purpose |
|---|---|
| `/admin` | Admin overview with total bookings and active worker count. |
| `/admin/categories` | Create, update, delete categories. Fields include name, slug, image, active status. |
| `/admin/services` | Create, update, delete services. Fields include category, name, description, image, base price, estimated minutes. |
| `/admin/users` | Create manager/worker staff users and update user roles. Worker creation also creates a `WorkerProfile`. |
| `/admin/marketing` | Manage announcement, landing hero media/text/CTA, banner auto-scroll, and offer/banner records. |

### Manager Routes

Manager routes require `MANAGER` or `ADMIN`.

| Route | Purpose |
|---|---|
| `/manager` | Manager home with links to booking operations. |
| `/manager/bookings` | Booking list and status update controls. |
| `/manager/bookings/[id]` | Booking detail and worker dispatch assignment. |
| `/manager/dispatch` | Dispatch board for assigning available workers to pending bookings. Assignment moves the booking to `CONFIRMED`. |

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
5. Manager assigns a worker from `/manager/dispatch` or booking detail.
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
| `src/app/admin/actions.ts` | `createCategory`, `updateCategory`, `deleteCategory`, `createService`, `updateService`, `deleteService`, `createStaffUser`, `updateUserRole` | Admin catalog and staff management. |
| `src/app/admin/marketing/server-actions.ts` | `updateAnnouncement`, `updateLandingHero`, `updateBannerAutoScroll`, `createBanner`, `updateBanner`, `deleteBanner` | Landing/marketing content management. |
| `src/app/book/actions.ts` | `createBooking` | Single-service booking creation. |
| `src/app/checkout/actions.ts` | `createBookingsFromCart` | Multi-service cart checkout. |
| `src/app/manager/actions.ts` | `assignWorker`, `updateBookingStatus` | Dispatch and booking status management. |
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
2. Open `/admin/categories`.
3. Create categories such as:
   - `AC Repair` with slug `ac-repair`
   - `Electrician` with slug `electrician`
   - `Salon` with slug `salon`
4. Open `/admin/services`.
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
| `/admin/*` | `ADMIN` |
| `/manager/*` | `MANAGER`, `ADMIN` |
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
3. Create manager and worker demo users from `/admin/users`.
4. Create categories and services from `/admin/categories` and `/admin/services`.
5. Log in at `/customer/login` with `customer@jammuserve.test` / `Demo@1234`, or register a new customer at `/customer/register`.
6. Browse `/services`, add services to cart, or open a service detail and book directly.
7. Customer confirms booking and sees it in `/account`.
8. Manager logs in and assigns a worker from `/manager/dispatch`.
9. Worker logs in, toggles duty, opens `/worker/job/[id]`, and updates status.
10. Customer refreshes `/account` to see updated status.

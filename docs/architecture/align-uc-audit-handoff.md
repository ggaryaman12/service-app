# Align/Urban Company Architecture Audit Handoff

Last updated: 2026-05-01

## Verdict

The project is **partially aligned**, but it is **not yet at the Urban Company Align / 10x Engineering bar**.

The current codebase has the right first moves: semantic Tailwind tokens, a small `src/components/ui` layer, Framer Motion, React Three Fiber, first DDD slice under `src/features/catalog`, and public catalog APIs. But the implementation still has too much one-off page UI, direct Prisma access in pages/actions/components, duplicated button/card/form styling, hard-coded colors in global CSS and 3D code, and only one backend domain using the controller/service boundary.

The next agent should treat this as a **platformization task**, not another visual polish pass.

## Benchmark Used

Reference direction:

- Urban Company Align design-system case study: https://www.obvious.in/blog/urban-company-design-system
- UC 10x Engineering microservices overview: https://medium.com/uc-engineering/ucs-secret-to-10x-engineering-94c3684e27a4
- UC simple RPC/platform boundary article: https://medium.com/uc-engineering/step-1-creating-a-simple-rpc-platform-555b46272a12
- UC zero-boilerplate services article: https://medium.com/uc-engineering/tale-zero-boilerplate-services-a79a665ccd3

Practical interpretation for this repo:

- UI should be assembled from reusable primitives and product components, not hand-written per page.
- Token changes should propagate broadly from one place.
- Pages should be thin composition layers.
- Business capabilities should live in domain services/controllers.
- Server Actions and public APIs should be transport adapters over the same domain code.
- Boilerplate should move into platform helpers, not be repeated in every page/action.

## What Currently Follows The Direction

### Design System

- `tailwind.config.ts` defines a semantic token foundation: `brand`, `surface`, `text`, `border`, `state`, radii, shadows, typography, and shimmer animation.
- `src/components/ui/button.tsx` has typed variants: `solid`, `outline`, `ghost`; sizes; tones; loading; Framer `whileTap`.
- `src/components/ui/card.tsx` provides a base card primitive.
- `src/components/ui/service-card.tsx` is a dumb, prop-driven UI component.
- `src/components/service-card.tsx` correctly composes the dumb UI card with cart behavior.
- `src/components/page-transition-shell.tsx`, `src/components/landing-reveal.tsx`, `src/components/landing-hero.tsx`, and `src/components/landing-story.tsx` establish the motion direction.
- `src/components/hero-scene.tsx` adds a lazy-loaded React Three Fiber hero layer.
- `tests/e2e/design-system.spec.ts` checks that key tokens compile into runtime CSS.

### Backend/API Boundary

- `src/features/catalog/catalog.service.ts` owns the catalog read model.
- `src/features/catalog/catalog.controller.ts` adapts catalog service output into an open API response.
- `src/app/api/open/catalog/route.ts` and `src/app/api/open/catalog/[serviceId]/route.ts` reuse the catalog controller.
- `src/app/services/page.tsx` uses `getCatalogSnapshot`, so catalog UI and open API share the same read source.
- `docs/architecture/backend-api-boundary.md` documents the desired backend/frontend separation.
- `ROUTES.md` documents routes, APIs, demo account setup, and access flow.
- `docs/testing/e2e.md` documents how to run the project and E2E checks.

## Where It Still Fails Align Principles

### UI Is Not Yet Component-Driven Enough

Reusable primitives exist, but many pages still hand-roll the same UI classes:

- Buttons/links are repeated in `src/app/page.tsx`, `src/app/services/page.tsx`, `src/app/customer/login/page.tsx`, `src/app/customer/register/page.tsx`, `src/app/book/[serviceId]/page.tsx`, and `src/app/checkout/checkout-client.tsx`.
- Cards/panels are repeated inline in services, account, book, checkout, admin, manager, and worker pages instead of consistently using `Card`.
- Form inputs are repeated across login, register, book, checkout, admin, marketing, and staff pages. There is no `Input`, `Field`, `Select`, `Textarea`, `FormError`, or `FormActions` primitive yet.
- `src/components/cloudinary-upload-field.tsx` still uses neutral Tailwind primitives like `text-neutral-500`, `border-neutral-200`, and `rounded-md`, so it visually forks from the semantic system.

### Tokens Exist, But Hard-Coded Styling Still Leaks

Examples:

- `src/app/globals.css` contains many hard-coded hex and `rgba(...)` values for hero/story/loading/intro systems.
- `src/components/hero-scene.tsx` hard-codes many 3D material colors instead of using a theme bridge or central scene palette.
- Arbitrary values still exist: `text-[11px]`, `top-[76px]`, `md:min-h-[420px]`, `md:min-h-[520px]`, `max-w-[11rem]`, `hover:scale-[1.03]`, and custom grid tracks.
- `:root` in `src/app/globals.css` only defines a subset of token vars while CSS references additional semantic vars. Tailwind v4 may emit config vars, but this local semantic var layer is incomplete and easy to break.

### Motion Is Premium-Looking, But Not Platformized

- Motion durations/easings are copied as literals across components.
- Reduced-motion handling is present in some places but missing in others.
- There is no shared `motionTokens` module for timings/easing/viewport defaults.
- Loading/intro/hero/story animations are large one-off systems in `globals.css`, not reusable motion primitives.

## Where It Still Fails UC 10x Engineering Principles

### Domain-Driven Split Is Only Started

Only catalog has a proper feature service/controller:

- Good: `src/features/catalog/catalog.service.ts`
- Good: `src/features/catalog/catalog.controller.ts`
- Missing: `src/features/bookings`
- Missing: `src/features/auth`
- Missing: `src/features/staff`
- Missing: `src/features/dispatch`
- Missing: `src/features/marketing`

### Server Actions Still Own Business Logic

These actions directly parse forms, authorize, call Prisma, mutate state, and revalidate:

- `src/app/book/actions.ts`
- `src/app/checkout/actions.ts`
- `src/app/manager/actions.ts`
- `src/app/worker/actions.ts`
- `src/app/admin/actions.ts`
- `src/app/admin/marketing/server-actions.ts`

Target shape: these should become thin adapters that call domain service functions.

### Direct Prisma Access Is Still Widespread

Direct Prisma reads/writes still appear in many pages/components:

- `src/app/page.tsx`
- `src/components/site-header.tsx`
- `src/components/announcement-bar.tsx`
- `src/app/customer/register/page.tsx`
- `src/app/worker/page.tsx`
- `src/app/admin/*`
- `src/app/account/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/book/[serviceId]/page.tsx`
- `src/app/manager/*`
- `src/app/staff/setup/page.tsx`

This violates the desired “frontend and backend separated” direction. Server Components can call backend code, but they should call domain services/read models, not Prisma directly.

### Public APIs Are Too Narrow

Currently implemented public/open APIs:

- `GET /api/open/catalog`
- `GET /api/open/catalog/[serviceId]`

Still missing for chatbot/WhatsApp/third-party integration:

- Open booking quote/intake endpoint.
- Open service availability/slot endpoint.
- Open booking creation endpoint with a safe auth strategy or channel token.
- Open booking status endpoint.
- OpenAPI/Swagger document.
- Shared request/response schemas used by both API handlers and Server Actions.

### Strict Typing Is Not Clean Yet

Known `any` usage:

- `src/lib/cart-store.ts`
- `src/app/checkout/actions.ts`

These should be replaced with typed runtime parsing helpers. Do not just cast parsed JSON to the desired type.

## What I Failed At / Incomplete Work

- I improved the landing/intro direction, but I did **not** finish a clean verified visual pass after the last intro-overlay patch. TypeScript and lint passed before the browser timing check, but the Playwright CLI `run-code` attempt failed due command syntax.
- I did **not** complete the requested full “Align-style” refactor across every customer page. Many screens still use inline class composition.
- I did **not** refactor all Server Actions into domain services. Only catalog has the service/controller/open API shape.
- I did **not** produce a complete OpenAPI spec yet.
- I did **not** run the full E2E suite because the user explicitly said not to run full tests all the time.
- I did **not** push or commit anything, per user instruction.

## Next Agent Pickup Plan

### Phase 1: Freeze The Platform Rules

- Create a short `docs/architecture/design-system-rules.md`.
- Define allowed primitives: `Button`, `LinkButton`, `Card`, `Input`, `Textarea`, `Select`, `Field`, `Badge`, `Sheet`, `PageHeader`, `Section`, `EmptyState`, `StatusTimeline`.
- Define allowed motion constants in `src/components/ui/motion.ts`.
- Define rule: no new hard-coded hex/rgba in components; use tokens or component variants.

### Phase 2: Finish UI Primitive Layer

- Add `Input`, `Textarea`, `Select`, `Field`, `Badge`, `LinkButton`, and `Section`.
- Convert auth pages first: `/customer/login`, `/customer/register`, `/staff/login`, `/staff/setup`.
- Convert booking/checkout forms next.
- Convert admin/manager/worker last, because Phase 1 scope was customer-first.

### Phase 3: Token Cleanup

- Move cinematic colors into semantic tokens or a dedicated scene palette.
- Remove duplicate/incomplete CSS variable declarations from `:root`.
- Replace scattered arbitrary values with config tokens where stable.
- Keep truly layout-specific arbitrary values only when documented and unavoidable.

### Phase 4: Backend Boundary Expansion

Create these domains:

- `src/features/bookings/booking.service.ts`
- `src/features/bookings/booking.controller.ts`
- `src/features/dispatch/dispatch.service.ts`
- `src/features/marketing/marketing.service.ts`
- `src/features/auth/account.service.ts`

Then migrate Server Actions to thin adapters:

- `book/actions.ts` -> `booking.service.createSingleBooking`
- `checkout/actions.ts` -> `booking.service.createCartBookings`
- `manager/actions.ts` -> `dispatch.service.assignWorker` and `booking.service.updateStatus`
- `worker/actions.ts` -> `dispatch.service.toggleDuty` and `booking.service.updateAssignedWorkerJobStatus`
- `admin/marketing/server-actions.ts` -> `marketing.service`

### Phase 5: Open APIs And OpenAPI Spec

- Add `/api/open/availability`.
- Add `/api/open/bookings` or `/api/v1/bookings` with a clear channel/auth model.
- Add `/api/open/bookings/[id]` status read.
- Generate or hand-maintain `docs/api/openapi.yaml`.
- Ensure the API handlers call the same controllers/services as UI Server Actions.

### Phase 6: Verification Discipline

Use targeted checks unless the user asks for the full suite:

```bash
npm exec tsc -- --noEmit
npm run lint
git diff --check
```

For customer UI changes, run only:

```bash
npm run test:e2e -- tests/e2e/public-routes.spec.ts
```

For visual checks, use Playwright screenshots under:

```text
output/playwright/
```

Do not push to git unless the user explicitly asks.


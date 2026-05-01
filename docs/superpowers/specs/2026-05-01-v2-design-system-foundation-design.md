# V2 Design System Foundation

Date: 2026-05-01

## Context

JammuServe is currently a Next.js 15 service marketplace prototype with Tailwind CSS v4, Prisma, NextAuth, and mostly one-off component styling. The existing Tailwind config has no design tokens, and components such as `ServiceCard`, `BottomSheet`, page CTAs, cards, and skeletons use direct Tailwind color and spacing choices. The first V2 slice should establish a strict visual foundation and make it visible on the homepage without starting the larger 3D hero or domain refactor yet.

The selected visual direction is **Premium Utility**: near-white product surfaces, deep ink typography, a service-green primary action color, quiet borders, and restrained motion.

## Goals

- Replace the empty Tailwind theme extension with semantic design tokens.
- Add reusable UI primitives in `src/components/ui`.
- Add Framer Motion tap feedback to new interactive primitives.
- Make the new token system visible on the homepage through featured services, major CTAs, cards, and skeleton styling.
- Keep this slice narrow enough to review before the 3D hero and larger feature-domain refactor.

## Non-Goals

- Do not implement the React Three Fiber hero in this slice.
- Do not reorganize all `src/` code into feature domains yet.
- Do not migrate all admin, manager, worker, checkout, and auth screens yet.
- Do not change Prisma models, booking logic, auth logic, or cart behavior.
- Do not introduce raw SQL or new data contracts.

## Tailwind Token System

Rewrite `tailwind.config.ts` around semantic tokens:

- `brand-primary`, `brand-primary-hover`, `brand-primary-muted`
- `brand-secondary`, `brand-secondary-muted`
- `surface-default`, `surface-elevated`, `surface-muted`, `surface-inverse`
- `text-primary`, `text-secondary`, `text-muted`, `text-inverse`
- `border-subtle`, `border-strong`
- `state-success`, `state-danger`, `state-warning`, `state-info`

Add semantic shadow, radius, and typography extensions rather than relying on arbitrary color values. Existing Tailwind utilities can still be used for layout, spacing, grid, flex, and responsive behavior.

## Typography Utilities

Add named typography utilities in `src/app/globals.css` using Tailwind layers:

- `.heading-1`
- `.heading-2`
- `.heading-3`
- `.body`
- `.body-sm`
- `.label`
- `.caption`
- `.caption-small`

These utilities should map to a modular type scale with stable line heights and no negative letter spacing. Homepage-visible text should start using these utilities where it improves consistency.

## UI Components

Create `src/components/ui` with:

- `utils.ts`: `cn()` helper using `clsx` and `tailwind-merge`.
- `button.tsx`: strictly typed client component with `variant="solid" | "outline" | "ghost"`, `size="sm" | "md" | "lg"`, and `tone="primary" | "neutral" | "danger"`. It uses Framer Motion `whileTap={{ scale: 0.97 }}` and supports normal button props.
- `card.tsx`: semantic surface wrapper with simple variants for default, elevated, and muted surfaces.
- `service-card.tsx`: dumb prop-driven service display component using the token system, card shell, motion feedback, image fallback, and a slot for the existing cart control.

The current `src/components/service-card.tsx` can become a compatibility wrapper that imports the UI service card and passes the existing `ServiceAddControl`. This limits call-site churn while moving design ownership into `src/components/ui`.

## Homepage Integration

Update homepage-visible surfaces so the new system is obvious:

- Featured service cards use the new UI service card.
- Major homepage CTAs use the new button styling or matching token classes.
- Category cards and empty states switch to semantic surface/text/border tokens where low-risk.
- Loading skeletons use a reusable shimmer utility instead of plain `animate-pulse` blocks where touched.

This is intentionally not a full app-wide migration. Staff and admin screens can be migrated after the foundation is reviewed.

## Dependencies

Install:

- `framer-motion`
- `clsx`
- `tailwind-merge`
- `@react-three/fiber`
- `@react-three/drei`

Only `framer-motion`, `clsx`, and `tailwind-merge` are used in this first slice. React Three Fiber and Drei are installed now for the next approved phase, but no 3D code is added until the hero implementation begins.

## Architecture Boundaries

UI components remain dumb and prop-driven. They do not call Prisma, auth, server actions, localStorage, or external APIs. Current business logic remains in server components, server actions, cart hooks, and existing page code.

The large Domain-Driven Design reorganization should be handled as a later planned refactor. For this slice, avoid moving business logic across app boundaries just to satisfy folder shape.

## Error Handling

The new components should expose normal disabled and loading states. They should not catch data-fetching errors or invent empty-state logic internally. Pages continue to own empty states and data availability.

## Verification

Run after implementation:

- `npm run lint`
- `npm run build`

If dependency installation requires network approval, request it directly and then retry the install with approval.

## Review Gate

After this slice, stop for review before implementing:

- 3D landing hero
- app-router page transitions
- broad DDD folder refactor
- admin/staff/checkout design migration

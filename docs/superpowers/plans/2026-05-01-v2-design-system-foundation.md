# V2 Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Premium Utility design foundation, reusable UI primitives, and homepage-visible adoption without starting the 3D hero or large DDD refactor.

**Architecture:** Keep UI primitives dumb and prop-driven under `src/components/ui`. Preserve existing business logic in server components, server actions, and cart hooks. Treat backend/frontend separation and public OpenAPI controllers as the next architecture track, not part of this UI foundation patch.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Framer Motion, clsx, tailwind-merge, React 19.

**Git Constraint:** Do not stage, commit, or push. The user explicitly asked to avoid git operations for now.

---

## File Map

- Modify `package.json` and `package-lock.json`: install UI/motion/3D dependencies.
- Modify `tailwind.config.ts`: add semantic Premium Utility tokens, typography, radius, shadow, and animation tokens.
- Modify `src/app/globals.css`: add Tailwind layer utilities for typography and shimmer skeletons; update CSS variables to match tokens.
- Create `src/components/ui/utils.ts`: `cn()` helper.
- Create `src/components/ui/button.tsx`: Framer Motion button primitive.
- Create `src/components/ui/card.tsx`: semantic card primitive.
- Create `src/components/ui/service-card.tsx`: dumb service display component with motion feedback and add-control slot.
- Modify `src/components/service-card.tsx`: compatibility wrapper that injects `ServiceAddControl`.
- Modify `src/app/page.tsx`: homepage-visible token adoption for major CTAs, categories, empty states, and typography.
- Modify loading files as needed: replace plain pulse blocks with shimmer utility on touched skeletons.
- Create `docs/architecture/backend-api-boundary.md`: short next-phase note for backend/frontend separation and future OpenAPI controllers.

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Check current dependency state**

Run:

```bash
npm ls framer-motion clsx tailwind-merge @react-three/fiber @react-three/drei
```

Expected: missing dependencies are reported.

- [ ] **Step 2: Install required packages**

Run:

```bash
npm install framer-motion clsx tailwind-merge @react-three/fiber @react-three/drei
```

Expected: `package.json` and `package-lock.json` update successfully.

- [ ] **Step 3: Verify installed packages**

Run:

```bash
npm ls framer-motion clsx tailwind-merge @react-three/fiber @react-three/drei
```

Expected: all five packages resolve under `jammuserve`.

## Task 2: Add Tailwind Tokens And Global Utilities

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the empty Tailwind theme extension**

Set `tailwind.config.ts` to define Premium Utility tokens:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#145C37",
          "primary-hover": "#0F4A2C",
          "primary-muted": "#E8F4ED",
          secondary: "#3154B7",
          "secondary-muted": "#E8EEFC"
        },
        surface: {
          default: "#F7F8F5",
          elevated: "#FFFFFF",
          muted: "#EFF2ED",
          inverse: "#101510"
        },
        text: {
          primary: "#101510",
          secondary: "#4C5A50",
          muted: "#6D776F",
          inverse: "#FFFFFF"
        },
        border: {
          subtle: "#DDE3DC",
          strong: "#B8C4BB"
        },
        state: {
          success: "#16834A",
          danger: "#B42318",
          warning: "#B7791F",
          info: "#3154B7"
        }
      },
      borderRadius: {
        ui: "0.875rem",
        "ui-sm": "0.625rem",
        "ui-lg": "1.25rem"
      },
      boxShadow: {
        card: "0 16px 40px rgba(16, 21, 16, 0.08)",
        "card-hover": "0 22px 55px rgba(16, 21, 16, 0.12)",
        "button-primary": "0 12px 26px rgba(20, 92, 55, 0.24)"
      },
      fontSize: {
        "heading-1": ["2.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        "heading-2": ["2rem", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-3": ["1.5rem", { lineHeight: "1.2", fontWeight: "650" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.8125rem", { lineHeight: "1.2", fontWeight: "650" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
        "caption-small": ["0.6875rem", { lineHeight: "1.35", fontWeight: "500" }]
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
```

- [ ] **Step 2: Add global CSS utilities**

Update `src/app/globals.css` to include:

```css
@import "tailwindcss";

:root {
  --background: #f7f8f5;
  --foreground: #101510;
}

html,
body {
  height: 100%;
}

body {
  color: var(--foreground);
  background: var(--background);
}

@layer utilities {
  .heading-1 {
    @apply text-heading-1 tracking-normal text-text-primary;
  }

  .heading-2 {
    @apply text-heading-2 tracking-normal text-text-primary;
  }

  .heading-3 {
    @apply text-heading-3 tracking-normal text-text-primary;
  }

  .body {
    @apply text-body text-text-secondary;
  }

  .body-sm {
    @apply text-body-sm text-text-secondary;
  }

  .label {
    @apply text-label text-text-primary;
  }

  .caption {
    @apply text-caption text-text-muted;
  }

  .caption-small {
    @apply text-caption-small text-text-muted;
  }

  .skeleton-shimmer {
    @apply animate-shimmer bg-[linear-gradient(110deg,#E4E9E2_8%,#F4F6F2_18%,#E4E9E2_33%)] bg-[length:200%_100%];
  }
}
```

- [ ] **Step 3: Run syntax check**

Run:

```bash
npm run lint
```

Expected: no syntax errors caused by Tailwind config or global CSS.

## Task 3: Create UI Primitives

**Files:**
- Create: `src/components/ui/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create `cn()` helper**

Create `src/components/ui/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create motion button primitive**

Create `src/components/ui/button.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonTone = "primary" | "neutral" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, Record<ButtonTone, string>> = {
  solid: {
    primary: "bg-brand-primary text-text-inverse shadow-button-primary hover:bg-brand-primary-hover",
    neutral: "bg-surface-inverse text-text-inverse hover:bg-text-secondary",
    danger: "bg-state-danger text-text-inverse hover:bg-red-800"
  },
  outline: {
    primary: "border border-brand-primary text-brand-primary hover:bg-brand-primary-muted",
    neutral: "border border-border-subtle text-text-primary hover:bg-surface-muted",
    danger: "border border-state-danger text-state-danger hover:bg-red-50"
  },
  ghost: {
    primary: "text-brand-primary hover:bg-brand-primary-muted",
    neutral: "text-text-secondary hover:bg-surface-muted",
    danger: "text-state-danger hover:bg-red-50"
  }
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-label",
  md: "h-11 px-4 text-label",
  lg: "h-12 px-6 text-label"
};

export function Button({
  className,
  variant = "solid",
  size = "md",
  tone = "primary",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default disabled:cursor-not-allowed disabled:opacity-55",
        sizeClasses[size],
        variantClasses[variant][tone],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
```

- [ ] **Step 3: Create card primitive**

Create `src/components/ui/card.tsx`:

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

type CardVariant = "default" | "elevated" | "muted";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface-elevated ring-1 ring-border-subtle shadow-sm",
  elevated: "bg-surface-elevated ring-1 ring-border-subtle shadow-card",
  muted: "bg-surface-muted ring-1 ring-border-subtle"
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-ui-lg", variantClasses[variant], className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: no TypeScript or ESLint errors from the new primitives.

## Task 4: Create Tokenized Service Card

**Files:**
- Create: `src/components/ui/service-card.tsx`
- Modify: `src/components/service-card.tsx`

- [ ] **Step 1: Create UI service card**

Create `src/components/ui/service-card.tsx`:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export type ServiceCardUiProps = {
  id: string;
  categoryName: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  minutes: number;
  action?: ReactNode;
  className?: string;
};

export function ServiceCardUi({
  id,
  categoryName,
  name,
  description,
  imageUrl,
  price,
  minutes,
  action,
  className
}: ServiceCardUiProps) {
  return (
    <motion.article
      whileTap={{ scale: 0.99 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={cn("group", className)}
    >
      <Card variant="elevated" className="relative overflow-hidden transition-shadow group-hover:shadow-card-hover">
        <div className="flex min-h-40">
          <div className="min-w-0 flex-1 p-4">
            <div className="mb-2 inline-flex items-center rounded-full bg-brand-primary-muted px-2.5 py-1">
              <span className="caption-small font-semibold text-brand-primary">{categoryName}</span>
            </div>
            <Link href={`/service/${id}`} className="block">
              <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-brand-primary">
                {name}
              </h3>
            </Link>
            <p className="mt-1.5 line-clamp-2 body-sm text-text-muted">
              {description}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-lg font-bold text-text-primary">₹{price}</span>
              <div className="flex items-center gap-1 caption text-text-muted">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>{minutes} mins</span>
              </div>
            </div>
          </div>

          <div className="relative w-28 shrink-0 overflow-hidden bg-surface-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-muted to-brand-primary-muted">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-primary/35" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
            )}
            {action ? (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                {action}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
```

- [ ] **Step 2: Replace compatibility wrapper**

Set `src/components/service-card.tsx` to:

```tsx
import { ServiceAddControl } from "@/components/cart/service-add-control";
import {
  ServiceCardUi,
  type ServiceCardUiProps
} from "@/components/ui/service-card";

type ServiceCardProps = Omit<ServiceCardUiProps, "action">;

export function ServiceCard(props: ServiceCardProps) {
  return (
    <ServiceCardUi
      {...props}
      action={<ServiceAddControl serviceId={props.id} />}
    />
  );
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: no type or lint errors.

## Task 5: Migrate Homepage-Visible Surfaces

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update app shell tokens**

In `src/app/layout.tsx`, replace the body class string:

```tsx
"min-h-screen bg-surface-default text-text-primary antialiased"
```

Expected: app shell uses semantic surface and text tokens.

- [ ] **Step 2: Import `Button` and `Card` in homepage**

Add:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

- [ ] **Step 3: Convert homepage fallback hero cards**

When `heroEnabled` is false, replace major card shells with `Card` and token utilities:

```tsx
<Card variant="elevated" className="p-5 md:col-span-7">
  <p className="caption font-semibold">Jammu, India</p>
  <h1 className="mt-1 heading-2">
    Premium home services, on-demand
  </h1>
  <p className="mt-2 body-sm">
    Trusted professionals • Cash on delivery • Fast local support
  </p>
  ...
</Card>
```

Use token classes for the search-like link and secondary quick-pick card:

```tsx
className="flex h-12 flex-1 items-center gap-3 rounded-full bg-surface-muted px-4 body-sm transition-transform active:scale-95"
```

- [ ] **Step 4: Convert homepage CTA links without breaking navigation**

Because the first `Button` primitive renders native `button`, do not wrap route `Link` elements with it in this slice. Instead apply matching token classes to homepage links:

```tsx
className="inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-5 text-label text-text-inverse shadow-button-primary transition-transform hover:bg-brand-primary-hover active:scale-95"
```

- [ ] **Step 5: Convert category cards and empty states**

Use semantic classes:

```tsx
className="flex flex-col items-center gap-2 rounded-ui-lg bg-surface-elevated p-3 shadow-sm ring-1 ring-border-subtle transition-transform active:scale-95"
```

Empty state:

```tsx
<Card className="col-span-4 p-4 body-sm">
  No categories yet. Add them in <span className="font-mono">/admin</span>.
</Card>
```

- [ ] **Step 6: Keep current data fetching and cart behavior unchanged**

Do not modify Prisma queries, `ServiceCard` props, `ServiceAddControl`, auth, or banner logic.

- [ ] **Step 7: Run lint**

Run:

```bash
npm run lint
```

Expected: no errors.

## Task 6: Improve Touched Loading Skeletons

**Files:**
- Modify: `src/app/loading.tsx`
- Modify only nearby route loading files if they use the same simple pulse pattern and can be changed safely.

- [ ] **Step 1: Replace homepage loading pulse blocks**

In `src/app/loading.tsx`, replace `bg-slate-200/70 animate-pulse` with:

```tsx
skeleton-shimmer
```

Full expected pattern:

```tsx
<div className="h-28 rounded-ui-lg skeleton-shimmer" />
```

- [ ] **Step 2: Keep dimensions stable**

Do not change skeleton heights, counts, or layout shape except radius token names where matching.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: no errors.

## Task 7: Add Backend/API Boundary Note For Next Phase

**Files:**
- Create: `docs/architecture/backend-api-boundary.md`

- [ ] **Step 1: Create architecture note**

Create:

```md
# Backend/API Boundary Direction

## Goal

Keep frontend UX work separate from backend application logic so the same backend capabilities can serve the Next.js UI, future public APIs, AI chatbots, and WhatsApp integrations.

## Direction

- Frontend pages and components should not own business rules.
- Server Actions should become thin adapters that call domain services.
- Route handlers under `src/app/api/.../route.ts` should call the same domain services as Server Actions.
- Public OpenAPI endpoints should not duplicate controller logic.
- Shared request/response schemas should live near the domain service they protect.

## Proposed Future Shape

- `src/features/catalog/services/*`: catalog read/write services.
- `src/features/bookings/services/*`: booking creation, state transitions, dispatch.
- `src/features/auth/services/*`: auth/account helpers.
- `src/app/api/v1/*/route.ts`: public/API routes using the same services.
- `src/app/*/actions.ts`: UI Server Actions using the same services.
- `src/lib/openapi/*`: OpenAPI document generation and shared schema export.

## Rule

One business capability should have one service implementation. UI Server Actions and public APIs are transport adapters over that service, not separate business implementations.
```

- [ ] **Step 2: Do not implement API routes in this UI slice**

This note is planning context only. No public endpoint or OpenAPI generator is added until the next approved backend/API phase.

## Task 8: Final Verification

**Files:**
- All changed files.

- [ ] **Step 1: Check worktree changes**

Run:

```bash
git status --short
```

Expected: changed files are visible, but nothing is staged.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: pass.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 4: Report result**

Report:

- files changed
- verification commands run
- any commands that could not run
- note that no git staging, commits, or pushes were performed

# Backend/API Boundary Direction

## Goal

Keep frontend UX work separate from backend application logic so the same backend capabilities can serve the Next.js UI, future public APIs, AI chatbots, and WhatsApp integrations.

## Direction

- Frontend pages and components should not own business rules.
- Server Actions should become thin adapters that call domain services.
- Route handlers under `src/app/api/.../route.ts` should call the same domain services as Server Actions.
- Public OpenAPI endpoints should not duplicate controller logic.
- Shared request and response schemas should live near the domain service they protect.

## Proposed Future Shape

- `src/features/catalog/services/*`: catalog read/write services.
- `src/features/bookings/services/*`: booking creation, state transitions, dispatch.
- `src/features/auth/services/*`: auth/account helpers.
- `src/app/api/v1/*/route.ts`: public API routes using the same services.
- `src/app/*/actions.ts`: UI Server Actions using the same services.
- `src/lib/openapi/*`: OpenAPI document generation and shared schema export.

## Rule

One business capability should have one service implementation. UI Server Actions and public APIs are transport adapters over that service, not separate business implementations.

## Implemented First Slice

- `src/features/catalog/catalog.service.ts` owns catalog read models for services/categories.
- `src/features/catalog/catalog.controller.ts` adapts that service into an open integration response.
- `GET /api/open/catalog?q=&category=` exposes catalog search/listing for future AI chatbot or WhatsApp clients.
- `GET /api/open/catalog/:serviceId` exposes the same service-detail read model used by the UI.

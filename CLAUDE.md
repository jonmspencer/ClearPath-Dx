# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

ClearPath Diagnostics — a neutral diagnostics marketplace platform. pnpm + Turborepo monorepo.

## Architecture

```
apps/platform/          → Next.js 15 app (port 3001)
packages/auth/           → NextAuth v5, JWT strategy, credentials + magic link + SMS OTP
packages/database/       → Prisma 6 + PostgreSQL (schema in prisma/schema.prisma)
packages/email/          → Postmark transactional email client + templates
packages/rbac/           → 13 roles, flat permission matrix
packages/types/          → Shared TypeScript types
packages/ui/             → Shared UI components (shadcn/ui)
e2e/                     → Playwright E2E tests
```

## Key Patterns

- **API routes**: `getSessionOrThrow()` → `requirePermission()` → Zod validation → Prisma query → `createAuditLog()` → `successResponse()`/`handleApiError()`
- **Pages**: Server component fetches data, passes `JSON.parse(JSON.stringify(data))` to client component
- **Forms**: react-hook-form + zodResolver + FormField + sonner toast
- **Lists**: DataTable (@tanstack/react-table) with server-side pagination
- **Next.js 15**: `params` is `Promise<{ id: string }>` — must `await` it

## Database

- Schema: `packages/database/prisma/schema.prisma`
- `User.name` (NOT firstName/lastName) — `Client` model HAS firstName/lastName
- `DiagnosticCase` has NO `status` field
- `CareCoordinationFlag` has `title` (NOT flagType), `isResolved` (NOT status)
- Prisma Decimal serializes to string via JSON — use `Number()` before `.toFixed()`
- Seed: `pnpm --filter @clearpath/database run db:seed`

## Auth

- Edge-safe middleware config at `packages/auth/src/edge-config.ts` (no Node.js imports)
- Full auth config at `packages/auth/src/config.ts` (includes Prisma, nodemailer, postmark)
- Middleware imports from `@clearpath/auth/edge`, API routes from `@clearpath/auth`

## Build & Deploy

- Dev: `pnpm dev:platform` (port 3001)
- Build: `pnpm --filter @clearpath/platform run build`
- Deployed on Vercel; Neon PostgreSQL for production DB
- Prisma engine binary copied via `apps/platform/scripts/copy-prisma-engine.mjs`
- `.env` symlinked from root to `packages/database/.env`

## Testing

- E2E: `pnpm test:e2e` (needs dev server running on port 3001)
- Login selectors: `#email` and `#password` (not getByLabel)

## Workflow Rules

- Always ask before committing or pushing code
- Start with plan mode for complex, multi-step tasks
- Use `/compact` at ~50% context usage
- Break tasks small enough to complete in under 50% context
- Never commit `.env` files or secrets

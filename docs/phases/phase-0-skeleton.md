# Phase 0 — Monorepo skeleton (rebuilt for web)

**Status:** done, 2026-08-25

## Why this phase was rebuilt

The original Phase 0 (2026-08-24) scaffolded an Expo/React Native mobile frontend against a local Docker Postgres, which doesn't match the product brief's actual plan (a web pilot, reachable by any browser with no install step — brief §7) or the build plan's original stack (React web frontend, Neon Postgres). This rebuild replaces the frontend with Next.js and repoints the database at Neon, per an explicit stack decision: Next.js frontend, Node.js backend, Tailwind, Postgres via Neon.

## What shipped

- **Frontend** (`frontend/`): Next.js (App Router, JavaScript, Tailwind v4), scaffolded via `create-next-app`. Design System colors (`docs/design-tokens.md`) wired in as CSS variables + Tailwind `@theme` tokens in `src/app/globals.css`. Fonts switched to Noto Sans Armenian (UI text) and JetBrains Mono (numerals/timers) per the design tokens doc. A single home page calls the backend's `/health` endpoint via `src/lib/api.js` and shows the connection status.
- **Backend** (`backend/`): unchanged Express + Prisma app from the original Phase 0 — `users`/`groups` schema, `GET /health` doing a real `SELECT 1` round-trip. `.env`/`.env.example` repointed from a local Docker connection string to Neon's format (`?sslmode=require`).
- **Database**: local Docker Postgres removed (`docker-compose.yml` deleted, `db:up`/`db:down` scripts removed from root `package.json`). Neon is now the only Postgres target, for local dev and prod alike — no docker-compose "kiko-postgres" container.
- Root `package.json` scripts updated: `npm start` now runs `next dev` for the frontend instead of `expo start`.

## Decisions made this pass

- **Next.js over Vite/CRA for the web frontend.** Matches the explicit stack ask; App Router + Tailwind v4 out of the box via `create-next-app`.
- **Neon for local dev too, not just staging/prod.** Removes the Docker Postgres dependency entirely — one database target, no drift between local schema and Neon schema.
- **JavaScript, not TypeScript**, carried over from the backend's Phase 0 decision — no build-step friction for a solo-built pilot.
- Removed template boilerplate (`AGENTS.md`, `CLAUDE.md`, unused `public/*.svg`) that `create-next-app` generates by default, same cleanup pattern as the original Phase 0.

## Not yet verified

- Full `npm start` run (backend + Next.js dev server together) with a real Neon `DATABASE_URL` in `backend/.env` — the current `.env` has a placeholder connection string pending the Neon project being created.
- `prisma migrate dev` against the actual Neon database.

## Carried into Phase 1

Same as before: auth fields (`password_hash`, `group_id` resolution via invite code, `is_admin`) are added as their own migration in Phase 1, not guessed at now.

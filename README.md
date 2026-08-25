# Kiko

A daily accountability app built on manufactured deadlines and social visibility. See `Documentation/` for the product brief and build plan (rebuilt as needed — the docs folder is a working scratch space, not a permanent archive).

## Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Node.js + Express, Prisma ORM
- **Database:** PostgreSQL via [Neon](https://neon.tech)
- **Auth:** JWT

## Getting started

1. Copy `backend/.env.example` to `backend/.env` and fill in your Neon `DATABASE_URL` (from the Neon project dashboard) and a `JWT_SECRET`.
2. Apply migrations (first time / after schema changes):
   ```
   npm run --workspace=backend prisma:migrate
   ```
3. Copy `frontend/.env.example` to `frontend/.env.local` if you need to point at a non-default API URL.
4. From the repo root:
   ```
   npm start
   ```
   This runs the backend (`http://localhost:4000`) and the Next.js dev server (`http://localhost:3000`) together.

## Repo layout

```
Kiko/
├── backend/     Node.js + Express + Prisma API
├── frontend/    Next.js + Tailwind web app
├── docs/phases/ One doc per completed build phase
└── Design/, Design System/   Source-of-truth design files (Claude Design canvases)
```

## Status

See `docs/phases/` for what's shipped so far and the decisions made along the way.

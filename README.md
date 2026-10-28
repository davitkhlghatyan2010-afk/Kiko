# Kiko

> A daily accountability app built on manufactured deadlines and social visibility.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://kiko-frontend-eta.vercel.app/)

See `docs/` for the product brief and build plan (rebuilt as needed — the docs folder is a working scratch space, not a permanent archive).

---

## 🎥 Preview

> *[Drop your demo GIF here]*
> `![Kiko Demo](./path-to-your-demo.gif)`

---

##  Key Features

* ** Leaderboard:** Compete with friends and peers, keeping accountability high through public visibility and social ranking.
* ** Visualisation:** Track streaks, completion rates, and historical accountability metrics with clean visual charts.
* ** Mascot-Led Learning:** Stay engaged, motivated, and guided by your interactive app mascot as you build daily habits.

---

## Stack

* **Frontend:** Next.js (App Router), Tailwind CSS (Deployed on Vercel)
* **Backend:** Node.js + Express, Prisma ORM
* **Database:** PostgreSQL via [Neon](https://neon.tech)
* **Authentication:** JWT

---

##  Getting Started

### 1. Environment Setup
* Copy `backend/.env.example` to `backend/.env` and configure:
  * `DATABASE_URL` (from your Neon project dashboard)
  * `JWT_SECRET`
* Copy `frontend/.env.example` to `frontend/.env.local` if pointing to a non-default API URL.

### 2. Database Migration
Apply migrations (run for initial setup or after schema changes):
```bash
npm run --workspace=backend prisma:migrate

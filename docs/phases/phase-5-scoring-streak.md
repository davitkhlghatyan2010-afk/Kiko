# Phase 5 — Scoring & streak

**Status:** done, 2026-08-25

## What shipped

No schema change was needed — `day.credit` (nullable `full`/`none`) has existed since Phase 2; this phase is what actually sets it.

- **Backend**:
  - `backend/src/routes/proofs.js` — `POST /proofs/:id/answer` now checks, in the same transaction as marking the task complete, whether every *other* task on the day is already done and the deadline hasn't passed. If so, `day.credit` is set to `'full'` immediately — the streak updates the instant the last task is proved, not up to a minute later when the sweep would otherwise catch it. Guarded on `day.credit === null` so an already-finalized day is never overwritten.
  - `backend/src/jobs/finalizeDays.js` — `finalizeExpiredDays()`: the authoritative closing rule. Finds every day with `credit: null` and `deadlineAt` in the past, sets `'full'` if all its tasks were completed or `'none'` otherwise. `startDeadlineSweep()` runs this on a 60-second interval, started at server boot in `index.js`. This is the catch-all for days that were never fully proved before the deadline — the instant-finalization above is just an optimistic early application of the same rule.
  - `backend/src/streak.js` — `computeStreak(daysDescending)` (pure) walks a user's finalized days most-recent-first, counting the consecutive run of `'full'` days; a `'none'` day or a calendar-day gap (an unresolved or never-declared day in between) both break it. `getUserStreak(userId)` fetches and calls it. Split out from `routes/users.js` so Phase 6's leaderboard can reuse it without duplicating the logic.
  - `backend/src/routes/users.js` — `GET /users/me/streak`.
- **Frontend**: `src/app/page.js` now fetches the streak alongside today's day (on mount, on focus, and after a proof completes) and shows it near the account line. The "Today: done/not done" indicator now prefers the finalized `day.credit` over a live task-completion snapshot, since a task proved *after* the deadline would otherwise show "done" even though the day already scored `'none'` — day.credit, once set, is authoritative.

## Verified

- Completing a day's only task before its deadline instantly flips `day.credit` to `'full'` and `GET /users/me/streak` to `1`.
- Built a realistic multi-day history directly via Prisma (the API only ever lets you declare "today," so historical fixtures needed direct DB writes) — a `full, none, full, full` run (oldest to newest, ending today) correctly computed streak `2`, stopping exactly at the `'none'` day.
- The sweep job resolves a genuinely past, unresolved day with all tasks done to `'full'`, and one with an incomplete task to `'none'` — both caught *live* by the actual 60-second background interval running inside the dev server, not just the standalone function call.
- One test-fixture mistake worth recording since it looked like a bug at first: `Date.UTC`'s month argument is 0-indexed, and an early fixture used `8` intending August, landing the rows in September instead — with a future deadline the sweep correctly left alone. Not an app bug; just a reminder that this file's own test scripts should build dates from ISO strings (`new Date("2026-08-24T...")`) rather than `Date.UTC(y, m, d)` to avoid the same mistake next time.
- Lint and production build both pass.

## Not yet verified

- Live browser view of the streak/done-not-done display (verified via direct API + Prisma inspection, same sandbox limitation as prior phases).
- Real-time behavior exactly at a deadline crossing in production (the 60s sweep interval was verified functionally, not timed to the second).

## Carried into Phase 6

Five synthetic historical `days` rows exist for the test user `petra` (2026-08-20 through 2026-08-24, mixing `full`/`none`) from verifying streak-chaining — left in place since deleting rows needs your go-ahead each time; harmless for continued dev. `computeStreak`/`getUserStreak` in `backend/src/streak.js` are ready for the leaderboard to import directly.

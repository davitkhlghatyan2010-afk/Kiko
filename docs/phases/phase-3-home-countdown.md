# Phase 3 — Home & countdown

**Status:** done, 2026-08-25

## What shipped

- **Backend**: `POST /days/today/start` (`backend/src/routes/days.js`) — sets `started_at` on today's declared day. 404 if nothing's declared yet, 409 if already started (rejects a second start, matching the build plan's "rejects if already set").
- **Frontend**:
  - `src/components/Countdown.js` — a live countdown ticking every second against `day.deadlineAt`, rendered as the largest element on Home (`text-6xl`, JetBrains Mono via the `font-mono` token), turning `alert`-colored once it hits zero.
  - `src/app/page.js` — when today's declared: shows the countdown, a "Start" button (disabled after press, replaced by a "Started HH:MM" readout once `started_at` is set) above the task list. Refetches `GET /days/today` both on mount and on window `focus`, per the build plan.

## Decisions made this phase

- **No garden/character art built.** The build plan's Phase 3 UI also specs a "Greek-costume character in the garden, idle." That's real visual design work pulling from the Design System's pixel-art canvas (`Design System/301AD.dc.html`), not something to improvise inline — per the earlier conversation about deferring the full visual pass until more screens exist to apply it to. This phase ships the countdown/start mechanics only; the character is still owed.
- **Countdown display floors at `00:00:00`** rather than going negative once the deadline passes — Phase 5 (scoring/streak) is what actually resolves a missed day; Phase 3 just needs to show time running out, not adjudicate the miss.

## Not yet verified

- Browser click-through (verified via direct API calls + curl against the SSR shell, same sandbox limitation as prior phases).
- Countdown behavior exactly at the zero-crossing over a real elapsed minute (verified the display logic and the backend 409-after-start behavior, not a live multi-minute session).

## Carried into Phase 4

`Start`'s timestamp (`started_at`) is what Phase 4/the brief's primary pilot metric (§9: median time between start and deadline) will read from — already being recorded correctly.

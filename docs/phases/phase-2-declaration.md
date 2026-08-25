# Phase 2 — Task declaration

**Status:** done, 2026-08-25

## What shipped

- **Schema**: new `days` (`user_id`, `date` (DATE), `deadline_at`, `declared_at`, `started_at`, `credit` nullable `full|none` enum, unique on `[user_id, date]`) and `tasks` (`day_id`, `text`, `amount`, `type` `artifact|knowledge` enum, `completed`, `proof_id` — unwired placeholder for Phase 4) tables. Migration `20260825124721_days_and_tasks`.
- **Backend** (`backend/src/routes/days.js`, mounted at `/days` behind the `authenticate` middleware for the whole router):
  - `POST /days` — takes `{ tasks: [{ text, amount, type }] }`, 1–3 tasks. Deadline defaults to 23:59:59.999 server-local time on the declaration date (per your call — no weekly-locked deadline setting exists yet; that's Phase 8). Rejects a second declaration for the same calendar day with 409.
  - `GET /days/today` — returns `{ day: null }` if nothing's declared yet, or the day with its tasks.
- **Frontend**:
  - `src/app/declare/page.js` — dynamic task rows (what / how much / artifact-or-knowledge toggle), add up to 3, remove down to 1. Redirects to `/login` if not authenticated, and to `/` if today's already declared (declaration is read-only after submit, per spec).
  - `src/app/page.js` — logged-in home now checks `GET /days/today`: shows a "Declare today" button if nothing's declared, or the deadline + task list (with a ✓/○ completion marker, unused until Phase 4) if it is.

## Decisions made this phase

- **Deadline defaults to 23:59 same-day**, per your explicit instruction, since weekly-locked deadline-setting is Phase 8 and Phase 2 needs something to declare against now. Revisit when Phase 8 lands — declarations made under this default don't need migrating, since `deadline_at` is stored per-day already (the build plan's own design: "copied onto each day at declaration so a later change can't retroactively rescue or condemn a day in progress").
- **Found and fixed a timezone bug while verifying**: `date` is a Postgres `DATE` column, which Postgres/Prisma truncates by UTC calendar day. Building the "start of today" instant from local date parts (`new Date(y, m, d)`) put local midnight a few hours into the *previous* UTC day whenever the server's local offset is positive — and this server is on Armenia time, UTC+4. The stored `date` was landing on the wrong day even though `deadline_at` (a full timestamp) was correct. Fixed by building the UTC instant from the same local Y/M/D (`Date.UTC(y, m, d)`) so the stored calendar date matches what a person here means by "today". This is exactly the class of bug the Phase 9 checklist calls out ("Deadline job fires correctly across timezones") — worth a specific regression check once that phase's scheduled job exists.
- **`proof_id` on `tasks` has no FK yet** — the build plan's own Phase 2 schema lists it as a plain column, and the `Proof` table doesn't exist until Phase 4. Left as an unconstrained nullable string until then.

## Not yet verified

- Browser click-through of `/declare` (verified via direct API calls + curl against the rendered SSR shell — same sandbox limitation as prior phases).
- What happens right at the deadline instant — there's no scheduled job yet to flip `credit` to `'none'` on a miss; that's Phase 5.

## Extension: add-only editing, uncapped task count (2026-08-25, same day)

Per your request: no cap on how many tasks can be declared, and a way to add more after the fact — but no editing or removing what's already been declared, matching the build plan's own principle that declaring more can only add risk, never help ("one honest task done beats five declared and four finished").

- **Backend**: removed the 1–3 cap on `POST /days` (now just "at least 1"). New `POST /days/today/tasks` appends tasks to the already-declared day — 404 if nothing's declared yet, 400 if today's deadline has already passed. Task validation logic factored into a shared `validateTasks()` used by both routes.
- **Frontend**: extracted the task-row UI (`src/components/TaskRows.js`) since both `/declare` and the new `/declare/add` page need the same uncapped add/remove-row behavior. The home page shows a "+ Add another task" link under today's task list once something's declared.
- No PATCH/DELETE was added for existing tasks — intentionally, since you asked for add-only.

## Extension: removed artifact/knowledge task type (2026-08-25, same day)

Per your instruction: tasks no longer have a "type." Every task uses one proving method going forward — write a summary, answer one AI-generated follow-up question, task completes. No branching by type anywhere.

- **Schema**: dropped `tasks.type` and the `TaskType` enum entirely. Migration `20260825135955_remove_task_type`.
- **Backend**: removed the artifact/knowledge check from `validateTasks()` and the `type` field from task creation and serialization in `backend/src/routes/days.js`.
- **Frontend**: removed the artifact/knowledge toggle from `TaskRows`, and the `(type)` annotation from the home page's task list.
- **No file-upload proof path existed to remove.** Checked — there's no `Proof` model, no upload endpoint, nothing artifact-specific beyond the type field itself, since Phase 4 (proving) hasn't been built yet. When it is, it'll be built single-flow from the start per this instruction: `tasks.proof_id` (already an unwired placeholder column) will point at one `Proof` record per task with `summary`, `ai_question`, `user_answer`, `flagged` — no type-conditional logic to remove later, because there isn't any now.

## Extension: reject duplicate tasks (2026-08-25, same day)

Per your request: a task can't be declared (or later added) if it's "totally similar" to one already on today's list. Defined as an exact match on `text` + `amount`, normalized (trimmed, case-insensitive) — so "Read chapter 4" / "20 pages" and "  READ CHAPTER 4  " / "20 PAGES" collide, but the same text with a different amount ("30 pages") is treated as a genuinely different task and allowed.

- **Backend**: `taskKey()` builds the normalized `text||amount` key; `validateTasks()` now takes an `existingKeys` set and rejects both in-request duplicates (two identical tasks submitted together) and, for `POST /days/today/tasks`, duplicates of tasks already on the day.
- No frontend changes needed — the declare/add-task forms already surface whatever error message the API returns.

## Carried into Phase 3

Two test declarations exist for `erin` (one with the pre-fix mis-dated `date`, one correct) — harmless leftovers, not cleaned up since deleting rows now requires your go-ahead each time. Say the word if you want the test data cleared before continuing.

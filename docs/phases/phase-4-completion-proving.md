# Phase 4 — Completion & proving

**Status:** done, 2026-08-25

## What shipped

- **Schema**: replaced the unwired `tasks.proof_id` placeholder column from Phase 2 with a real `Proof` model — `id, task_id (unique FK), summary, ai_question, user_answer, flagged, created_at`. Migration `20260825151744_proofs`.
- **Backend** (`backend/src/routes/proofs.js`, mounted at root behind `authenticate`, after every unauthenticated route):
  - `POST /tasks/:id/proof` — stores the summary, calls the (stubbed) LLM for one follow-up question, returns it. 404s if the task isn't yours, 409 if already complete. Resubmitting on a task that already has an unanswered proof returns the *existing* proof/question instead of creating a duplicate, so a reload mid-flow can resume cleanly.
  - `POST /proofs/:id/answer` — stores the answer and marks the task `completed` in one transaction. 404 if not yours, 409 if already answered.
  - `backend/src/llm.js` — stub: picks a templated follow-up question referencing the summary. Async, so a real provider (Claude, per the earlier default recommendation) can replace the body later without touching either route or any call site.
  - `days.js` now embeds `pendingProof: { id, aiQuestion } | null` per task (only when unanswered) in every day response, so the frontend can resume the question step after a reload instead of restarting from "Mark done."
- **Frontend**:
  - `src/components/TaskItem.js` — per-task state machine: idle ("Mark done") → summary form → AI question + answer form → done. Resumes straight into the question step if `task.pendingProof` is set.
  - `src/app/page.js` — task list now renders `TaskItem` per task instead of a plain row; added a binary "Today: done / not done" line (`every(task => task.completed)`) — display-only, since actual `day.credit` is still computed by Phase 5, not built yet.

## Bug caught and fixed during this phase

Mounting `app.use(authenticate, proofsRouter)` with no path prefix, placed *before* the `/health` route in `index.js`, made `authenticate` run unconditionally for every request reaching that point in the middleware stack — including `/health`, which started requiring a bearer token and returning 401. Fixed by moving `/health` to the top of the file, before any authenticated route is mounted. Re-verified `/health` returns `{"status":"ok"}` with no auth header afterward.

## Verified

- Empty summary → 400; empty answer → 400.
- Valid summary → proof created, question returned; resubmitting the same task's summary resumes the existing proof rather than duplicating it.
- Valid answer → task flips to `completed: true`; re-answering the same proof → 409; re-proving a completed task → 409.
- Cross-user isolation: another user posting a proof on someone else's task, or answering someone else's proof, both get 404 (existence is checked through the `task -> day -> userId` chain, not just the task/proof ID).
- Two-task day: completing one of two leaves the binary check `false`; completing both flips it to `true`.
- Lint and production build both pass.

## Not yet verified

- Live browser click-through of the summary → question → answer UI (verified via direct API calls, matching prior phases' sandbox limitation).
- No real LLM is wired up — the stub's questions are templated, not actually grounded by an AI reading the summary.

## Carried into Phase 5

`task.completed` (all-true vs. not) is exactly what Phase 5's day-credit computation needs to read at the deadline; nothing further to change here for that to work.

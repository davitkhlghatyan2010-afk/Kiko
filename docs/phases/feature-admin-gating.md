# Feature — admin gating (requireAdmin middleware)

**Status:** done, 2026-08-25

## What shipped

- `backend/src/middleware/requireAdmin.js` — 403s unless `req.user.isAdmin` is true. Must run after `authenticate` (needs `req.user`).
- `backend/src/routes/admin.js` — `GET /admin/ping`, gated by `authenticate` + `requireAdmin`. This is a **temporary smoke-test route**, not a real feature: there is no admin-only backend endpoint in the codebase yet (proof review is Phase 7, unbuilt), so there was nothing real to attach the middleware to. This exists solely so the "non-admin gets 403" requirement had something to call. Delete it once Phase 7 ships a real admin endpoint.
- No frontend changes were needed. The only existing admin-related UI is the `", admin"` text label on the home page, which was already driven by the real `user.isAdmin` from the authenticated session — cosmetic only. The actual security boundary is `requireAdmin`, server-side; the frontend never hides anything that would otherwise be reachable.

## Verified

- Non-admin (`GET /admin/ping` with a solo/non-admin token) → `403 {"message":"Admin access required"}`.
- No auth at all → `401` (unchanged `authenticate` behavior, runs first).
- Actual admin (group creator, flagged `is_admin` at registration) → `200 {"status":"ok","message":"admin access confirmed"}`.

## Carried forward

When Phase 7 (admin proof review) is built, its endpoints should use this same `requireAdmin` middleware, and `GET /admin/ping` should be deleted.

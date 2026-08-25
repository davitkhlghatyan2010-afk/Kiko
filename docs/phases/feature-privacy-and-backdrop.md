# Feature — privacy policy acceptance + pixel-art auth backdrop

**Status:** done, 2026-08-25

Follow-up from reviewing the design pass in the browser: registration was missing privacy policy acceptance (present in the Design System's register flow spec but not carried over), and the auth cards sat on a flat color with no pixel-art backdrop behind them.

## What shipped

- **Schema**: `users.privacy_accepted_at` (nullable `DateTime`). Nullable rather than required, since many test accounts already exist from earlier phases and never saw a policy to accept — backfilling a fake timestamp for them would misrepresent what actually happened. Migration `20260825160243_privacy_accepted`.
- **Backend**: `POST /auth/register` now requires `privacyAccepted: true` in the body (400 otherwise) and stamps `privacyAcceptedAt` on the created user in the same create call, for all three registration paths (solo, join-group, create-group).
- **Frontend**:
  - `src/components/PrivacyPolicy.js` — collapsible inline block (closed by default) with placeholder policy text, plus a required checkbox. **The policy text is honest placeholder copy I wrote, not reviewed legal terms** — it describes what's actually collected and why (username/email/hashed password, task summaries and AI Q&A for verification, group-admin visibility of proofs) in plain language, but should be replaced with real legal review before an actual launch.
  - `src/components/PixelBackdrop.js` — renders the Design System's `drawWorld()` garden scene (native 380×210 world buffer, scale 2) as a centered, framed backdrop behind the auth card, using the same `PixelCanvas`/`pixelWorld.js` foundation from the design pass. Applied to all four auth pages (login, register, forgot-password, reset-password).

## Verified

- Registering without `privacyAccepted` (omitted or `false`) → 400 "You must accept the Privacy Policy"; with `true` → succeeds and `privacyAcceptedAt` is stamped with a real timestamp (confirmed directly via Prisma).
- Register page SSR output includes the policy control and checkbox; login page SSR output includes the `<canvas>` backdrop element.
- Lint and production build both pass.

## Not yet verified

- Live visual check of the backdrop's framing/centering on an actual wide desktop viewport (no headless browser tool in this sandbox) — the first screenshot that prompted this feature confirms the general auth-card styling reads correctly in a real browser, but this specific addition hasn't been screenshotted yet.

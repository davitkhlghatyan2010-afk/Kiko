# Phase 1 — Accounts, login & account type

**Status:** done, 2026-08-25

## What shipped

- **Schema**: `users` gained `password_hash`, `account_type` (`group`|`solo` enum), `is_admin`; `groups` gained `invite_code` (unique) and `admin_user_id` (unique, FK to `users`). Migration `20260825120946_auth_and_groups` applied to Neon.
- **Backend** (`backend/src/routes/auth.js`):
  - `POST /auth/register` — solo accounts need no code. Group accounts pass an `inviteCode`: an existing code joins that group as a regular member; an unrecognized code creates a new group (named from `groupName`, falling back to the code) with the registering user flagged `is_admin`. Username/password/invite-code length are validated server-side; duplicate usernames return 409.
  - `POST /auth/login` — bcrypt compare, returns a JWT (7-day expiry) + the user.
  - `GET /auth/me` — protected by `authenticate` middleware (`backend/src/middleware/authenticate.js`), used by the frontend to restore a session on reload.
- **Frontend**:
  - `src/lib/api.js` — `register`/`login`/`getMe`, a `request()` wrapper that attaches the bearer token and clears it + hard-redirects to `/login` on a 401 from an authenticated call.
  - `src/lib/auth-context.js` — `AuthProvider`/`useAuth`, wraps the root layout. Hydrates from `localStorage` on mount by calling `/auth/me`; `loading` starts `false` when there's no stored token, so logged-out users see the page immediately rather than a loading flash.
  - `src/app/register/page.js` — solo/group toggle, invite code + optional group name fields shown only for group signup.
  - `src/app/login/page.js`.
  - `src/app/page.js` — shows logged-in username/account type + log out, or log in/create account links, alongside the existing backend health check.

## Decisions made this phase

- **Create-or-join by invite code**, not a separate "create a group" flow. The build plan's spec ("resolves invite code to group, or creates solo; the group creator is flagged is_admin") only describes two registration paths but also requires a group creator to be flagged admin — the simplest reading that satisfies both is that an unrecognized invite code creates the group. Fine for a 10-person pilot; revisit if this needs to be an explicit admin-only action later.
- **Circular FK (`users.group_id` <-> `groups.admin_user_id`) resolved via a Prisma transaction**: create the admin user first (no group yet) -> create the group referencing that user -> update the user's `group_id`. All three steps are one `$transaction`.
- **Token storage: `localStorage`**, not an httpOnly cookie — simplest correct option for a separately-hosted Next.js frontend and Express backend (no shared domain to set a cookie against without extra proxy config). Revisit if XSS surface becomes a real concern before the pilot.
- **`prisma migrate dev` doesn't run in this non-interactive shell.** Used `prisma migrate diff --from-schema-datasource ... --to-schema-datamodel ...` to generate the SQL by hand, wrote it into a manually-created timestamped migration folder, and applied it with `prisma migrate deploy`. Confirmed both tables were empty first since the diff adds several `NOT NULL` columns with no defaults.

## Not yet verified

- Actual browser click-through of the register/login forms (verified via direct API calls + HTML/SSR content checks — no headless browser tool available in this sandbox).
- JWT expiry/refresh behavior at the 7-day boundary.

## Extension: email, password confirmation, login-by-email, forgot password (2026-08-25, same day)

- **Schema**: `users` gained a required, unique `email`. New `password_reset_tokens` table (`user_id`, `token_hash` unique, `expires_at`, `used_at`). Migration `20260825122733_email_and_password_reset`. Required deleting the three Phase-1 test accounts first since the new `email` column is `NOT NULL` with no default.
- **Register** now requires `email` (validated with a basic regex, stored lowercased) and `confirmPassword` (must match `password`); duplicate email returns 409 same as duplicate username, with the field named in the message.
- **Login** takes `identifier` instead of `username` — looked up against both `username` and `email` (case-insensitive on email) in one `findFirst`.
- **Forgot/reset password**: `POST /auth/forgot-password { email }` always returns the same generic message regardless of whether the email exists (no account enumeration); when it does exist, a random 32-byte token is generated, its SHA-256 hash stored with a 1-hour expiry, and — since no transactional email provider is wired up yet — the raw reset link is returned in the response (`devResetUrl`/`devResetToken`) and logged server-side. `POST /auth/reset-password { token, password, confirmPassword }` validates the token is unexpired and unused, updates the password, and marks the token used (so it can't be replayed). `frontend/src/app/forgot-password` and `.../reset-password` implement the UI; the forgot-password page surfaces the dev link directly since there's nowhere else to see it right now.
- **Decision**: email accepts any valid address, not restricted to `@gmail.com`.
- **Decision**: real email delivery is deliberately stubbed for now — no provider (Resend/SendGrid/SMTP) is configured. Swap the `console.log` + response fields in `POST /auth/forgot-password` for an actual send once one is chosen; the rest of the flow (token generation, expiry, single-use) doesn't need to change.

## Extension: password strength policy (2026-08-25, same day)

Password rule tightened from "8+ characters" to "8+ characters, at least one uppercase letter, one lowercase letter, one digit, and one symbol" — enforced in both `POST /auth/register` and `POST /auth/reset-password` via a shared regex in `backend/src/validators.js` (`isValidPassword`/`PASSWORD_RULES_MESSAGE`), mirrored on the frontend in `frontend/src/lib/password.js` for inline validation/hint text on the register and reset-password forms before hitting the API.

## Carried into Phase 2

Two test accounts (`dana`, `erin`, both solo) exist in Neon from verifying the email/reset/password-policy flows — harmless to keep, but worth clearing before real pilot users register.

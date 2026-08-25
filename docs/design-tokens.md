# Design tokens

Extracted from `Design System/301AD.dc.html` (source of truth — re-check there if this drifts). Wired into `frontend/src/app/globals.css` as CSS variables + Tailwind v4 `@theme` colors (e.g. `bg-sky-day`, `text-ink`).

## Colors

| Token | Hex |
|---|---|
| sky-day | `#CBDFD6` |
| sky-cloud | `#EDEFE4` |
| water | `#93B5B0` |
| water-deep | `#6E9691` |
| foliage-light | `#A8C0AC` |
| foliage-mid | `#7C9A8A` |
| foliage-dark | `#5A7A6C` |
| trunk | `#9A6156` |
| ink | `#1E2E28` |
| wood-light | `#C89457` |
| wood-mid | `#9A6634` |
| wood-dark | `#5E3D24` |
| wall | `#EAE2D4` |
| stone | `#C4BFB8` |
| fire | `#E88A3C` |
| fire-hot | `#F3C24C` |
| alert | `#E4695E` |
| autumn | `#C97F3D` |
| dead | `#A88B4A` |

## Type

- **Noto Sans Armenian** — all UI text. Sentence case only; never letterspaced; never all-caps. Sizes: 32 / 24 / 18 / 15 / 13.
- **JetBrains Mono** — numerals, timers, labels. Tabular by default.

(Copy ships English-only for this build — see the decisions log in `Kiko-build-plan.md` — but the type choice/rules still apply to the English strings.)

## Grid

- World buffer 380×210, extended to 380×478 on Home.
- Viewport 220 wide. Display scale 2×, integer only — no fractional scaling, no anti-aliasing.
- Character 16×24 → 48px on screen. Tier tile 16×16 → 32px.
- Spacing steps: 4 · 8 · 12 · 16 · 24 · 32.

## Garden tiers

Bloom (5+ clean days) → Green (2–4) → Autumn (1 miss) → Dead (2+ consecutive misses). Two clean days climb one tier; falling is one day. Tiers cut at midnight, never crossfade.

## Fauna rule

The dog is always present beside the character, at every tier — coat desaturates as the streak dies, but it never leaves. Deer and butterflies visit only in Bloom/Green, on a shared per-group visit window, and are gone entirely once Dead.

## Components reference (see the Design System file for exact markup/states)

Buttons (one alert-colored button per screen, everything else quiet/disabled), task rows (a line, not a card — no per-task checkbox in the declare flow), app chips (pill-shaped, on/off states), timer readouts (JetBrains Mono, 56px), leaderboard rows (same treatment at every position, only the user's own row marked), statistic blocks, tab bar (Home / Gardens / Me), dialog, small-day notice (inline, no dismiss).

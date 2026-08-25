# Feature — Design pass: real pixel art + web-adapted visual system

**Status:** done, 2026-08-25

Applies the Design System (originally built for a 220px-wide mobile phone viewport with a bottom tab bar) to Kiko's actual web screens, adapted for desktop/web rather than ported as-is.

## What shipped

- **`frontend/src/lib/pixelWorld.js`** — `Design/pixel.js` ported to an ES module (`export const PixelWorld = {...}` instead of `window.PixelWorld`). All drawing logic is byte-identical to the source; only the export mechanism changed. **Fixed one real bug found in the port**: the source file declared `function drawAppTile` twice (byte-identical bodies) — harmless in a plain `(function(){...})()` script scope where the second silently wins, but a hard `SyntaxError` under ES module strict mode. Removed the duplicate; verified the module now loads and exports all 24 expected members (`drawWorld`, `drawRoomSlot`, `drawSprite`, `drawTile`, `drawPlot`, `drawBed`, `drawGlyph`, `drawAvatar`, `TIERS`, etc.).
- **`frontend/src/components/PixelCanvas.js`** — thin wrapper: owns the `<canvas>` ref/lifecycle, delegates all actual drawing to whatever `PixelWorld.draw*` function is passed in. No pixel-art logic lives here.
- **`frontend/src/components/PomodoroScene.js`** — replaces the old CSS two-zone bar + sliding dot with real rendering: `drawWorld` (character walking, dog, fauna, `tier: 'green'`) for the rest phase, `drawRoomSlot` (hearth interior) with a `drawSprite` character layered on top for the work phase. Rendered at native scale (`scale: 1`, not the source's 2x) specifically to stay secondary in size to the deadline countdown, per the original Pomodoro spec's "deadline stays primary" rule.
- **`frontend/src/components/Header.js`** — new global header (in `layout.js`, wraps every page): "Kiko" wordmark + auth state (log in/create account, or username + log out). Replaces the source design's mobile bottom tab bar (Home/Gardens/Me) — there's nothing to link to yet besides Home, since Gardens is Phase 6 and Me is Phase 8, so a tab bar with two dead links would be worse than no tab bar. Revisit when those screens exist.
- **Visual vocabulary applied across every existing screen** (login, register, forgot-password, reset-password, declare, declare/add, home): dialog-style cards (`border-2 border-ink rounded-2xl`, replacing the flat `bg-wall` fill with no border), bottom-border-only inputs (`border-b-2 border-ink bg-transparent`, replacing the boxed `border border-stone bg-sky-cloud` style), error text in the `dead` tier hex (`text-dead`, `#A88B4A` — already an existing design token, not newly invented) instead of a neutral gray box, and 8×8-filled / 2px-outlined square task-row bullets (`TaskItem.js`) instead of ✓/○ characters. The deadline countdown's typography was tightened to the spec's exact `56px`/weight `500` (was an approximate `text-6xl`).
- Home page's own duplicate "Kiko" heading and login/logout controls were removed now that `Header` handles them globally on every page — no more double controls.

## Adaptations made for web (the explicit ask: "the one I have given is for phone, can you make it for web")

- **No mobile bottom tab bar.** A top header instead, and only for what exists.
- **Pixel-art canvases kept at native/near-native scale within card-width containers**, not stretched full-bleed across a wide desktop viewport (which would either blur badly or look absurdly tiny relative to the page). The source's "380×210 world, 220 viewport, 2× integer scale" sizing is a phone-screen decision; the Pomodoro scene here uses `scale: 1` deliberately, both to fit a card and to stay visually secondary to the countdown.
- **Forms stay in centered, max-width cards** (a pattern Kiko already had from earlier phases), now carrying the dialog border/input styling rather than a full-bleed mobile single-column layout.
- **Garden tier is fixed at `'green'`** for the Pomodoro's rest-state scene — real streak-driven tier computation (Bloom/Green/Autumn/Dead per `docs/design-tokens.md`) is a Phase 6 (Gardens leaderboard) concern, out of scope for a secondary companion widget.

## Verified

- `pixelWorld.js` loads cleanly as an ES module and exports the full expected API (confirmed via direct `node` import, after fixing the duplicate-declaration bug).
- Lint and production build both pass across all 7 routes.
- Full core loop re-verified unaffected by the (frontend-only) redesign: register → declare → start → prove → answer → `day.credit: 'full'` → `streak: 1`, all still correct.
- SSR output confirmed to carry the new classes (`border-ink`, `border-b-2`, `rounded-2xl`) on login/register, and the `Header` wordmark rendering on every page.

## Not yet verified

- Live browser view of the actual rendered pixel-art scenes and their positioning/sizing (character-in-room overlay alignment, garden crop framing) — no headless browser tool in this sandbox. Positioning values (e.g. the character sprite's `left`/`top` offset inside the room scene) are reasonable estimates and may need visual tuning once actually viewed.

## Carried forward

- `PixelCanvas` and `pixelWorld.js` are the shared foundation Phase 6 (Gardens leaderboard: `drawPlot`, `drawBed`, `drawAvatar`, `drawGlyph`, real tier computation) and Phase 8 (Profile) will build on directly — no new porting work needed there.
- `Header` should gain Gardens/Me links once those screens exist.

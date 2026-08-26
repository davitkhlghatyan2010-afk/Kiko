// Kiko pixel-art engine, ported from the "Kiko Pixel Kit" design (claude.ai/design,
// project 9b7f8fa1-0efc-42fe-a967-19791620adc4, kiko-art.js). All art is authored on a
// 1:1 pixel buffer and upscaled with nearest-neighbour, so every edge stays crisp at any
// zoom.

const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export const HEX = {
  paper: "#f3f2f2", ink: "#201f1d", gold: "#b68235", goldLt: "#d8ae6c", goldPale: "#f2e0bb",
  wall: "#ece5d9", wallStripe: "#e4dccd", wallDim: "#d9cebb", wallDimStripe: "#d0c4ae",
  wallTrim: "#c2b39b", skirt: "#8a6a4a",
  floorA: "#c39163", floorB: "#b9885a", floorC: "#ad7e52", floorLine: "#96683f",
  wood: "#8f6742", woodLt: "#ab8055", woodDk: "#6b4c30", woodEdge: "#4e3722",
  rug: "#a06248", rugDk: "#874e37", rugTrim: "#c9a271", rugPale: "#b9755a",
  skin: "#e8c49a", skinSh: "#cfa176", skinDk: "#a97a53",
  hair: "#3f2d24", hairHi: "#5b4331", eye: "#2b2320", mouth: "#a5624c", brow: "#5b4030",
  sw: "#5a8076", swHi: "#6f958a", swDk: "#42615a", swEdge: "#2f4640",
  pant: "#46565f", pantDk: "#333f47", shoe: "#2f2721",
  leaf: "#618050", leafDk: "#46613a", pot: "#ab705a", potDk: "#8a5544",
  dog: "#cda878", dogDk: "#a8814f", dogPale: "#e3c79c", dogNose: "#3a2c24",
  metal: "#b9b3a6", metalDk: "#8b857a", glass: "#cdd8d1", glassLt: "#e4ebe4",
  paperSheet: "#f0ebe1", shade: "#5b432c",
};
export const PAL = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [k, hx(v)]));

export class Buf {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  set(x, y, c) {
    x |= 0; y |= 0;
    if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255;
  }
  tint(x, y, c, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    if (!this.d[i + 3]) return;
    for (let k = 0; k < 3; k++) this.d[i + k] = this.d[i + k] * (1 - a) + c[k] * a;
  }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  hline(x0, x1, y, c) { for (let x = x0; x <= x1; x++) this.set(x, y, c); }
  vline(x, y0, y1, c) { for (let y = y0; y <= y1; y++) this.set(x, y, c); }
  blit(map, ox, oy, pal, flip) {
    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        const c = pal[ch];
        if (!c) continue;
        this.set(ox + (flip ? row.length - 1 - x : x), oy + y, c);
      }
    }
  }
  ellipse(cx, cy, rx, ry, c, a) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
      if (d <= 1) this.tint(x, y, c, a * (1 - d * 0.55));
    }
  }
  paint(canvas, scale) {
    const src = document.createElement("canvas");
    src.width = this.w; src.height = this.h;
    src.getContext("2d").putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    canvas.width = this.w * scale; canvas.height = this.h * scale;
    const g = canvas.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.drawImage(src, 0, 0, canvas.width, canvas.height);
  }
}

/* ---------------------------------------------------------------- character */

const FACE = {
  h: PAL.hair, H: PAL.hairHi, s: PAL.skin, S: PAL.skinSh, k: PAL.skinDk, M: PAL.skinDk,
  e: PAL.eye, w: PAL.paper, m: PAL.mouth, b: PAL.brow,
};

// 13 wide x 13 tall. Row 12 is the neck, so the torso can start immediately below.
const HEADS = {
  front: [
    "....hhhhh....", "..hhhhhhhhh..", ".hhhhhhhhhhh.", ".hhHHhhhhhhh.", ".hhhhhhhhhhh.",
    ".hsssssssssh.", ".hseessseesh.", ".hseessseesh.", ".hsssskssssh.", ".hSssMmMssSh.",
    ".hSsssssssSh.", "...kSsssSk...", ".....sss.....",
  ],
  quarter: [
    "...hhhhhh....", "..hhhhhhhhh..", ".hhhhhhhhhhh.", ".hhHHhhhhhhh.", ".hhhhhhhhhhhh",
    ".khhsssssssss", ".khhseesssees", ".khhseesssees", ".khhsssssksss", ".khhSssMmMsS.",
    "..hhSsssssss.", "...kSsssssk..", ".....sss.....",
  ],
  side: [
    "....hhhhh....", "..hhhhhhhhh..", ".hhhhhhhhhhh.", ".hhHHhhhhhhh.", ".hhhhhhhhhhh.",
    ".hhhhsssssss.", ".hhhhseessss.", ".hhhhseessss.", ".hhhhssssssss", ".hhhhSssMmM..",
    ".hhhhSssss...", "..hhkSsss....", ".....sss.....",
  ],
  back: [
    "....hhhhh....", "..hhhhhhhhh..", ".hhhhhhhhhhh.", ".hhHHhhhhhhh.", ".hhhhhhhhhhh.",
    ".hhhhhhhhhhh.", ".hhhhhhhhhhh.", ".hhhhhhhhhhh.", ".hhhhhhhhhhh.", "..hhhhhhhhh..",
    "...hhhhhhh...", "....kSssSk...", ".....sss.....",
  ],
};

// One limb chain. Segment angle: 0 = straight down, + = toward +x.
function limb(b, x, y, segs) {
  let px = x, py = y, end = [x, y];
  for (const s of segs) {
    const r = (s.a * Math.PI) / 180, dx = Math.sin(r), dy = Math.cos(r);
    const n = Math.max(1, Math.round(s.l)), vertical = Math.abs(dy) >= Math.abs(dx);
    for (let i = 0; i <= n; i++) {
      const cx = Math.round(px + dx * i), cy = Math.round(py + dy * i);
      const lo = -Math.floor((s.t - 1) / 2), hi = lo + s.t - 1;
      for (let o = lo; o <= hi; o++) {
        if (vertical) b.set(cx + o, cy, o === hi ? s.cd || s.c : s.c);
        else b.set(cx, cy + o, o === hi ? s.cd || s.c : s.c);
      }
    }
    px += dx * n; py += dy * n; end = [Math.round(px), Math.round(py)];
  }
  return end;
}

export const SPRITE = { w: 30, h: 38 };

export function drawChar(b, ox, oy, p) {
  const cx = ox + 15, base = oy + (p.ty || 0);
  const headTop = base, shoulder = base + 13, hip = base + 24;
  const legs = p.legs || { l: [0, 0], r: [0, 0] };
  const arms = p.arms || { l: [11, 5], r: [-11, -5] };
  const back = p.head === "back";

  const drawLeg = (dx, key, far) => {
    const c = far ? PAL.pantDk : PAL.pant, cd = PAL.pantDk;
    const [a1, a2] = legs[key];
    const foot = limb(b, cx + dx, hip, [
      { a: a1, l: 6, t: 5, c, cd }, { a: a1 + a2, l: 5, t: 4, c, cd },
    ]);
    const lean = a1 + a2 > 12 ? 1 : a1 + a2 < -12 ? -2 : -1;
    b.rect(foot[0] + lean, foot[1] + 1, 5, 2, PAL.shoe);
    b.rect(foot[0] + lean, foot[1] + 1, 5, 1, far ? PAL.shoe : PAL.pantDk);
  };
  const drawArm = (dx, key, far) => {
    const c = far ? PAL.swDk : PAL.sw, cd = PAL.swEdge;
    const [a1, a2] = arms[key];
    if (p.stub) { limb(b, cx + dx, shoulder + 2, [{ a: a1, l: 5, t: 4, c, cd }]); return [cx + dx, shoulder + 6]; }
    const hand = limb(b, cx + dx, shoulder + 2, [
      { a: a1, l: 5, t: 4, c, cd }, { a: a1 + a2, l: 5, t: 3, c, cd },
    ]);
    b.rect(hand[0] - 1, hand[1], 3, 3, PAL.skin);
    b.set(hand[0] + 1, hand[1] + 2, PAL.skinSh);
    b.set(hand[0] - 1, hand[1] + 2, PAL.skinSh);
    return hand;
  };

  drawLeg(-3, "l", true);
  drawArm(-6, "l", true);

  // torso -- lit left edge, two shaded columns on the right, a couple of folds
  for (let y = shoulder; y <= hip; y++) {
    const t = (y - shoulder) / (hip - shoulder), hw = Math.round(6 - t * 1.4);
    for (let x = cx - hw; x <= cx + hw; x++) {
      let c = PAL.sw;
      if (x <= cx - hw) c = PAL.swHi;
      if (x >= cx + hw - 1) c = PAL.swDk;
      if (x >= cx + hw) c = PAL.swEdge;
      b.set(x, y, c);
    }
  }
  b.hline(cx - 5, cx + 4, shoulder, PAL.swHi);
  b.hline(cx - 2, cx + 1, shoulder, PAL.swEdge);
  b.set(cx - 3, shoulder + 1, PAL.swDk); b.set(cx + 2, shoulder + 1, PAL.swDk);
  b.set(cx + 3, hip - 5, PAL.swDk);
  b.set(cx - 4, hip - 3, PAL.swDk);
  b.hline(cx - 5, cx + 4, hip, PAL.swEdge);

  const hy = headTop + (p.hdy || 0);
  for (let y = hy + 12; y <= shoulder; y++) {
    b.set(cx - 1, y, back ? PAL.skinSh : PAL.skin);
    b.set(cx, y, PAL.skin);
    b.set(cx + 1, y, PAL.skinSh);
  }
  b.blit(HEADS[p.head || "front"], cx - 6 + (p.hdx || 0), hy, FACE, !!p.flipHead);

  const nearHand = drawArm(6, "r", false);
  drawLeg(3, "r", false);
  if (!p.seat && Math.abs(legs.l[0] + legs.l[1]) < 12 && Math.abs(legs.r[0] + legs.r[1]) < 12) b.vline(cx, hip + 1, hip + 8, PAL.pantDk);

  if (p.prop === "mug") {
    const [mx, my] = [nearHand[0] - 1, nearHand[1] - 1];
    b.rect(mx, my, 5, 5, PAL.paperSheet);
    b.rect(mx, my, 5, 1, PAL.gold);
    b.set(mx + 5, my + 1, PAL.paperSheet); b.set(mx + 5, my + 2, PAL.paperSheet);
    b.set(mx + 2, my - 2, PAL.wallDim); b.set(mx + 3, my - 4, PAL.wallDim);
  }
  if (p.prop === "book") {
    const bx = cx - 8, by = shoulder + 5;
    b.rect(bx, by, 17, 10, PAL.paperSheet);
    b.hline(bx, bx + 16, by, PAL.woodDk); b.hline(bx, bx + 16, by + 9, PAL.woodDk);
    b.vline(bx, by, by + 9, PAL.woodDk); b.vline(bx + 16, by, by + 9, PAL.woodDk);
    b.vline(bx + 8, by, by + 9, PAL.woodDk);
    for (let i = 2; i < 9; i += 2) { b.hline(bx + 2, bx + 6, by + i, PAL.wallDim); b.hline(bx + 10, bx + 14, by + i, PAL.wallDim); }
  }
  if (p.prop === "spark") {
    for (const [dx, dy] of [[-10, 2], [10, 2], [-8, -3], [8, -3], [0, -5]]) {
      b.set(cx + dx, headTop + dy, PAL.goldLt);
      b.set(cx + dx, headTop + dy - 2, PAL.gold);
    }
  }
}

const A = (l1, l2, r1, r2) => ({ l: [l1, l2], r: [r1, r2] });

const SEATED_LEGS = { l: [78, -80], r: [86, -88] };

export const POSES = {
  "sit-type": {
    label: "Sitting at the desk", hint: "The 25-minute pose. Hands alternate on the keys.", ms: 260,
    frames: [
      { head: "quarter", ty: 7, seat: 1, arms: A(60, 35, 68, 27), legs: SEATED_LEGS, hdy: -1 },
      { head: "quarter", ty: 7, seat: 1, arms: A(64, 31, 64, 31), legs: SEATED_LEGS },
      { head: "quarter", ty: 7, seat: 1, arms: A(58, 37, 70, 25), legs: SEATED_LEGS },
      { head: "quarter", ty: 7, seat: 1, arms: A(62, 33, 66, 29), legs: SEATED_LEGS, hdy: -1 },
    ],
  },
  "sit-back": {
    label: "Sitting -- seen from behind", hint: "Working state in the room: face hidden, screen private.", ms: 260,
    frames: [
      { head: "back", ty: 7, seat: 1, stub: 1, arms: A(-52, 0, 54, 0), legs: SEATED_LEGS, hdy: -1 },
      { head: "back", ty: 7, seat: 1, stub: 1, arms: A(-54, 0, 52, 0), legs: SEATED_LEGS },
      { head: "back", ty: 7, seat: 1, stub: 1, arms: A(-50, 0, 56, 0), legs: SEATED_LEGS },
      { head: "back", ty: 7, seat: 1, stub: 1, arms: A(-56, 0, 50, 0), legs: SEATED_LEGS, hdy: -1 },
    ],
  },
  "walk-down": {
    label: "Walking -- toward you", hint: "Contact, pass, contact, pass.", ms: 160,
    frames: [
      { head: "front", arms: A(18, -10, -18, 10), legs: { l: [-18, 14], r: [20, -16] } },
      { head: "front", ty: -1, arms: A(9, -5, -9, 5), legs: { l: [-5, 5], r: [7, -7] } },
      { head: "front", arms: A(-18, 10, 18, -10), legs: { l: [20, -16], r: [-18, 14] } },
      { head: "front", ty: -1, arms: A(-9, 5, 9, -5), legs: { l: [7, -7], r: [-5, 5] } },
    ],
  },
  "walk-up": {
    label: "Walking -- away", hint: "Back of the head, same cycle offset by two.", ms: 160,
    frames: [
      { head: "back", arms: A(18, -10, -18, 10), legs: { l: [20, -16], r: [-18, 14] } },
      { head: "back", ty: -1, arms: A(9, -5, -9, 5), legs: { l: [7, -7], r: [-5, 5] } },
      { head: "back", arms: A(-18, 10, 18, -10), legs: { l: [-18, 14], r: [20, -16] } },
      { head: "back", ty: -1, arms: A(-9, 5, 9, -5), legs: { l: [-5, 5], r: [7, -7] } },
    ],
  },
  "walk-side": {
    label: "Walking -- sideways", hint: "Flip horizontally for the other direction.", ms: 160,
    frames: [
      { head: "side", hdx: 1, arms: A(36, -16, -32, 18), legs: { l: [-26, 22], r: [28, -24] } },
      { head: "side", hdx: 1, ty: -1, arms: A(18, -9, -16, 9), legs: { l: [-7, 7], r: [9, -9] } },
      { head: "side", hdx: 1, arms: A(-32, 18, 36, -16), legs: { l: [28, -24], r: [-26, 22] } },
      { head: "side", hdx: 1, ty: -1, arms: A(-16, 9, 18, -9), legs: { l: [9, -9], r: [-7, 7] } },
    ],
  },
  celebrate: {
    label: "Block finished", hint: "Crouch, jump with both arms up, land, settle.", ms: 190,
    frames: [
      { head: "front", ty: 3, arms: A(30, -12, -30, 12), legs: { l: [-10, 22], r: [10, -22] } },
      { head: "front", ty: -5, arms: A(-160, -14, 160, 14), legs: { l: [-13, 9], r: [13, -9] }, prop: "spark" },
      { head: "front", ty: -7, arms: A(-172, -8, 172, 8), legs: { l: [-9, 7], r: [9, -7] }, prop: "spark" },
      { head: "front", ty: 1, arms: A(42, -16, -42, 16), legs: { l: [-8, 14], r: [8, -14] } },
    ],
  },
  drink: {
    label: "Coffee break", hint: "Raise, two sips, lower.", ms: 300,
    frames: [
      { head: "front", arms: A(13, 6, -30, -40), legs: { l: [-3, 3], r: [3, -3] } },
      { head: "front", arms: A(13, 6, 148, 44), legs: { l: [-3, 3], r: [3, -3] }, prop: "mug", hdy: 1 },
      { head: "front", arms: A(13, 6, 152, 46), legs: { l: [-3, 3], r: [3, -3] }, prop: "mug", hdy: 1 },
      { head: "front", arms: A(13, 6, -28, -70), legs: { l: [-3, 3], r: [3, -3] }, prop: "mug" },
    ],
  },
  read: {
    label: "Reading", hint: "Held at chest height, a slow page turn.", ms: 520,
    frames: [
      { head: "front", arms: A(52, 40, -52, -40), legs: { l: [-4, 4], r: [4, -4] }, prop: "book", hdy: 1 },
      { head: "front", arms: A(56, 36, -48, -44), legs: { l: [-4, 4], r: [4, -4] }, prop: "book", hdy: 1 },
      { head: "front", arms: A(52, 40, -52, -40), legs: { l: [-4, 4], r: [4, -4] }, prop: "book" },
    ],
  },
  "stand-up": {
    label: "Getting up", hint: "Seated, lean forward, push, stand.", ms: 230,
    frames: [
      { head: "quarter", ty: 7, seat: 1, arms: A(60, 35, 68, 27), legs: SEATED_LEGS },
      { head: "quarter", ty: 6, seat: 1, arms: A(40, 40, 50, 34), legs: { l: [64, -66], r: [72, -74] }, hdy: 1 },
      { head: "quarter", ty: 3, arms: A(22, 18, 28, 14), legs: { l: [30, -36], r: [36, -42] } },
      { head: "quarter", ty: 0, arms: A(13, 6, -13, -6), legs: { l: [-3, 3], r: [3, -3] } },
    ],
  },
  // Not in the source kit (which has no static "stand" state) -- last frame of
  // stand-up held still, reused for an idle/standing beat between walk cycles.
  stand: {
    label: "Standing", hint: "Idle.", ms: 1000,
    frames: [{ head: "front", ty: 0, arms: A(13, 6, -13, -6), legs: { l: [-3, 3], r: [3, -3] } }],
  },
};

/* -------------------------------------------------------------------- room */

export const ROOM = { w: 250, h: 182, cx: 125, top: 58, G: 56, wall: 52 };

const g2s = (a, bb) => [ROOM.cx + 2 * (a - bb), ROOM.top + (a + bb)];

function isoTop(b, a0, b0, w, d, y, c, cEdge) {
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) {
    const [x, sy] = g2s(a0 + i, b0 + j);
    const edge = i === 0 || j === 0 || i === w - 1 || j === d - 1;
    const col = edge && cEdge ? cEdge : c;
    b.set(x, sy - y, col); b.set(x + 1, sy - y, col);
  }
}

function isoBox(b, a0, b0, w, d, h, base, top, left, right, edge) {
  for (let i = 0; i < w; i++) {
    const [x, sy] = g2s(a0 + i, b0 + d - 1);
    for (let k = 0; k < h; k++) { b.set(x, sy - base - k, left); b.set(x + 1, sy - base - k, left); }
    if (edge) { b.set(x, sy - base, edge); b.set(x + 1, sy - base, edge); }
  }
  for (let j = 0; j < d; j++) {
    const [x, sy] = g2s(a0 + w - 1, b0 + j);
    for (let k = 0; k < h; k++) { b.set(x, sy - base - k, right); b.set(x + 1, sy - base - k, right); }
    if (edge) { b.set(x, sy - base, edge); b.set(x + 1, sy - base, edge); }
  }
  isoTop(b, a0, b0, w, d, base + h, top, edge);
}

function contact(b, a, bb, rx, ry) {
  const [x, y] = g2s(a, bb);
  b.ellipse(x, y, rx, ry, PAL.shade, 0.3);
}

function walls(b) {
  const { cx, top, G, wall } = ROOM;
  for (let x = cx - 2 * G; x <= cx + 2 * G; x++) {
    const right = x > cx;
    const yF = top + Math.round(Math.abs(x - cx) / 2);
    const stripe = Math.abs(x - cx) % 12 < 4;
    const c = right ? (stripe ? PAL.wallDimStripe : PAL.wallDim) : stripe ? PAL.wallStripe : PAL.wall;
    for (let y = yF - wall; y <= yF; y++) b.set(x, y, c);
    b.set(x, yF - wall, PAL.wallTrim);
    b.set(x, yF - wall + 1, PAL.wallTrim);
    for (let k = 0; k < 3; k++) b.set(x, yF - k, PAL.skirt);
    b.set(x, yF - 3, PAL.woodEdge);
  }
  for (let y = top - wall; y <= top; y++) b.set(cx, y, PAL.wallTrim);
}

function floor(b) {
  const { G } = ROOM;
  for (let a = 0; a < 2 * G; a++) for (let bb = 0; bb < 2 * G; bb++) {
    const [x, y] = g2s(a / 2, bb / 2);
    const plank = Math.floor(a / 9);
    let c = plank % 3 === 0 ? PAL.floorA : plank % 3 === 1 ? PAL.floorB : PAL.floorC;
    if (a % 9 === 0) c = PAL.floorLine;
    b.set(x, y, c); b.set(x + 1, y, c);
  }
}

function window_(b) {
  const { cx, top } = ROOM;
  const x0 = cx - 82, w = 32;
  for (let i = 0; i <= w; i++) {
    const x = x0 + i, yF = top + Math.round((cx - x) / 2);
    const frame = i <= 1 || i >= w - 1 || Math.abs(i - w / 2) < 1;
    for (let y = yF - 46; y <= yF - 20; y++) b.set(x, y, frame ? PAL.woodDk : y < yF - 34 ? PAL.glassLt : PAL.glass);
    b.set(x, yF - 47, PAL.woodLt); b.set(x, yF - 48, PAL.woodDk);
    b.set(x, yF - 19, PAL.woodLt); b.set(x, yF - 18, PAL.woodDk);
    if (!frame) b.set(x, yF - 33, PAL.woodDk);
  }
}

function clock(b, t) {
  const { cx, top } = ROOM;
  const x0 = cx + 26, yF = top + Math.round((x0 - cx) / 2) - 40;
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
    const d = x * x + y * y;
    if (d > 40) continue;
    b.set(x0 + x, yF + y + Math.round(x / 2), d > 27 ? PAL.woodDk : d > 22 ? PAL.woodLt : PAL.paperSheet);
  }
  const ang = (t / 4000) % (Math.PI * 2);
  for (let r = 0; r < 4; r++) b.set(Math.round(x0 + Math.sin(ang) * r), Math.round(yF - Math.cos(ang) * r + (Math.sin(ang) * r) / 2), PAL.ink);
  for (let r = 0; r < 3; r++) b.set(Math.round(x0 + Math.sin(ang * 12) * r), Math.round(yF - Math.cos(ang * 12) * r), PAL.gold);
}

function rug(b) {
  for (let a = 8; a < 46; a++) for (let bb = 10; bb < 36; bb++) {
    const [x, y] = g2s(a, bb);
    const ring = a < 10 || a > 43 || bb < 12 || bb > 33;
    const ring2 = a < 12 || a > 41 || bb < 14 || bb > 31;
    const c = ring ? PAL.rugDk : ring2 ? PAL.rugTrim : PAL.rug;
    b.set(x, y, c); b.set(x + 1, y, c);
  }
}

function desk(b) {
  contact(b, 28, 15, 26, 13);
  for (const [a, bb] of [[19, 11], [36, 11], [19, 18], [36, 18]]) isoBox(b, a, bb, 2, 2, 15, 0, PAL.wood, PAL.woodDk, PAL.woodEdge, PAL.woodEdge);
  isoBox(b, 18, 10, 20, 10, 2, 15, PAL.woodLt, PAL.wood, PAL.woodDk, PAL.woodEdge);
  isoTop(b, 30, 12, 7, 6, 17, PAL.paperSheet, PAL.wallDim);
  isoTop(b, 31, 13, 5, 4, 18, PAL.paperSheet, PAL.wallDimStripe);
  isoBox(b, 21, 12, 7, 5, 1, 17, PAL.metal, PAL.metalDk, PAL.metalDk, PAL.woodEdge);
  isoBox(b, 21, 11, 7, 1, 8, 18, PAL.metalDk, PAL.metal, PAL.metalDk, PAL.woodEdge);
  const [lx, ly] = g2s(24, 11);
  b.ellipse(lx, ly - 24, 10, 7, PAL.glassLt, 0.4);
  const [mx, my] = g2s(34, 13);
  b.rect(mx - 1, my - 22, 5, 5, PAL.paper);
  b.rect(mx - 1, my - 22, 5, 1, PAL.gold);
  b.set(mx + 4, my - 21, PAL.paper); b.set(mx + 4, my - 20, PAL.paper);
  b.set(mx + 1, my - 24, PAL.wallDim); b.set(mx + 2, my - 26, PAL.wallDim);
}

function chairSeat(b) {
  isoBox(b, 20, 22, 10, 9, 2, 9, PAL.woodLt, PAL.wood, PAL.woodDk, PAL.woodEdge);
  for (const [a, bb] of [[21, 23], [28, 23], [21, 29], [28, 29]]) isoBox(b, a, bb, 2, 2, 9, 0, PAL.wood, PAL.woodDk, PAL.woodEdge, PAL.woodEdge);
}

function chairBack(b) {
  isoBox(b, 20, 29, 10, 2, 8, 11, PAL.woodLt, PAL.wood, PAL.woodDk, PAL.woodEdge);
}

function shelf(b) {
  isoBox(b, 26, 2, 16, 6, 42, 0, PAL.woodLt, PAL.wood, PAL.woodDk, PAL.woodEdge);
  const spines = [PAL.rug, PAL.sw, PAL.gold, PAL.leafDk, PAL.rugDk, PAL.swDk, PAL.goldLt, PAL.pant];
  for (let s = 0; s < 3; s++) {
    const y = 9 + s * 12;
    isoTop(b, 27, 3, 14, 4, y, PAL.woodDk, PAL.woodEdge);
    for (let i = 0; i < 12; i++) {
      if ((i + s) % 5 === 4) continue;
      const [x, sy] = g2s(28 + i, 4);
      const h = 7 + ((i * 5 + s * 3) % 3), c = spines[(i + s * 3) % spines.length];
      for (let k = 0; k < h; k++) { b.set(x, sy - y - 1 - k, c); b.set(x + 1, sy - y - 1 - k, k === h - 1 ? PAL.woodEdge : c); }
    }
  }
}

function plant(b) {
  isoBox(b, 46, 3, 6, 6, 7, 0, PAL.pot, PAL.pot, PAL.potDk, PAL.woodEdge);
  isoTop(b, 47, 4, 4, 4, 7, PAL.woodEdge);
  const [x, y] = g2s(48, 5);
  const stems = [[0, -13], [-4, -10], [4, -11], [-7, -6], [7, -7], [-2, -15]];
  for (const [dx, dy] of stems) {
    const n = Math.round(Math.hypot(dx, dy));
    for (let k = 0; k <= n; k++) {
      const px = Math.round(x + (dx * k) / n), py = Math.round(y - 7 + (dy * k) / n);
      b.set(px, py, k > n - 3 ? PAL.leaf : PAL.leafDk);
      b.set(px + 1, py, PAL.leafDk);
    }
  }
}

function lamp(b) {
  contact(b, 47, 33, 12, 6);
  isoBox(b, 44, 30, 7, 7, 2, 0, PAL.metalDk, PAL.metalDk, PAL.woodEdge, PAL.woodEdge);
  const [x, y] = g2s(47, 33);
  for (let k = 2; k < 34; k++) { b.set(x, y - k, PAL.metal); b.set(x + 1, y - k, PAL.metalDk); }
  for (let i = 0; i < 8; i++) {
    const w = 3 + i * 2, xx = x - Math.floor(w / 2) + 1;
    for (let j = 0; j < w; j++) b.set(xx + j, y - 34 - 8 + i, i === 0 ? PAL.gold : i > 5 ? PAL.goldPale : PAL.goldLt);
  }
  b.rect(x - 4, y - 34, 9, 1, PAL.goldPale);
}

function dog(b, awake, t) {
  contact(b, 10, 43, 20, 10);
  isoBox(b, 3, 36, 15, 13, 3, 0, PAL.rug, PAL.rugDk, PAL.rugDk, PAL.woodEdge);
  isoTop(b, 5, 38, 11, 9, 3, PAL.rugDk, PAL.rug);
  const [x, y] = g2s(10, 43);
  const yy = y - 4;
  b.rect(x - 9, yy - 7, 16, 7, PAL.dog);
  b.hline(x - 9, x + 6, yy - 7, PAL.dogPale);
  b.rect(x - 9, yy - 1, 16, 1, PAL.dogDk);
  b.set(x - 9, yy - 7, PAL.dogDk); b.set(x + 6, yy - 7, PAL.dogDk);
  if (awake) {
    b.rect(x + 4, yy - 17, 8, 10, PAL.dog);
    b.rect(x + 4, yy - 17, 3, 5, PAL.dogDk);
    b.rect(x + 9, yy - 11, 4, 4, PAL.dogPale);
    b.set(x + 12, yy - 10, PAL.dogNose);
    b.set(x + 8, yy - 14, PAL.dogNose);
    b.rect(x + 2, yy - 2, 3, 2, PAL.dogPale);
    b.rect(x + 6, yy - 2, 3, 2, PAL.dogPale);
    const wag = Math.sin(t / 160) > 0 ? 0 : 3;
    b.rect(x - 13, yy - 9 - wag, 6, 4, PAL.dogDk);
  } else {
    b.rect(x + 5, yy - 13, 9, 7, PAL.dog);
    b.rect(x + 5, yy - 13, 3, 5, PAL.dogDk);
    b.set(x + 4, yy - 12, PAL.dogDk); b.set(x + 4, yy - 11, PAL.dogDk);
    b.rect(x + 11, yy - 9, 4, 3, PAL.dogPale);
    b.set(x + 14, yy - 8, PAL.dogNose);
    b.hline(x + 8, x + 10, yy - 10, PAL.dogNose);
    b.rect(x + 2, yy - 2, 3, 2, PAL.dogPale);
    b.rect(x + 6, yy - 2, 3, 2, PAL.dogPale);
    b.rect(x - 13, yy - 6, 6, 4, PAL.dogDk);
    b.set(x - 14, yy - 7, PAL.dogDk);
    const z = Math.floor(t / 700) % 3;
    b.set(x + 16, yy - 16 - z, PAL.wallTrim);
    b.set(x + 18, yy - 19 - z, PAL.wallTrim);
  }
}

function lampGlow(b) {
  const [x, y] = g2s(47, 33);
  b.ellipse(x, y - 12, 42, 22, PAL.goldPale, 0.3);
  b.ellipse(x, y - 40, 13, 11, PAL.goldPale, 0.34);
}

function windowGlow(b) {
  for (let a = 2; a < 24; a++) for (let bb = 6; bb < 30; bb++) {
    const [x, y] = g2s(a, bb);
    const soft = a < 5 || a > 21 || bb < 9 || bb > 27 ? 0.05 : 0.13;
    b.tint(x, y, PAL.glassLt, soft); b.tint(x + 1, y, PAL.glassLt, soft);
  }
}

// state: "work" | "break" | "done" -- maps directly onto the Pomodoro
// work/rest/complete phases. t: a timestamp in ms (e.g. from requestAnimationFrame),
// used to pick the current animation frame.
export function drawRoom(b, state, t) {
  walls(b);
  window_(b);
  clock(b, t);
  floor(b);
  windowGlow(b);
  rug(b);
  shelf(b);
  plant(b);
  desk(b);
  chairSeat(b);

  const working = state === "work";
  const [kx, ky] = g2s(25, working ? 26 : 32);
  const pose = state === "break" ? POSES.drink : state === "done" ? POSES.celebrate : POSES["sit-back"];
  const fr = pose.frames[Math.floor(t / pose.ms) % pose.frames.length];
  contact(b, 25, working ? 26 : 32, 10, 5);
  drawChar(b, kx - 15, ky - 37 - (working ? 7 : 0), fr);
  if (working) chairBack(b);

  lamp(b);
  dog(b, !working, t);
  lampGlow(b);
}

/* -------------------------------------------------------------------- logo */

const GLYPH = {
  K: ["##.....##", "##....##.", "##...##..", "##..##...", "##.##....", "#####....", "##.##....", "##..##...", "##...##..", "##....##.", "##.....##"],
  i: ["##", "##", "..", "##", "##", "##", "##", "##", "##", "##", "##"],
  k: ["##.....", "##.....", "##..##.", "##.##..", "####...", "###....", "####...", "##.##..", "##..##.", "##...##", "##....#"],
  o: [".......", ".......", ".#####.", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", ".#####."],
};

function glyph(b, map, x, y, c) {
  for (let j = 0; j < map.length; j++) for (let i = 0; i < map[j].length; i++) if (map[j][i] === "#") b.set(x + i, y + j, c);
}

const BALL = [
  "..###..",
  ".#####.",
  "#######",
  "#######",
  "#######",
  ".#####.",
  "..###..",
];

export const LOGO = { w: 80, h: 26 };
export const LOGO_PLAIN_W = 48;

// opts: { dark, spark, rule }. `spark` (default true) draws the struck-ball
// speed lines after the "o" -- the source design says to drop it for the
// header lockup/favicon and keep only the letters (variant "plain").
export function drawWordmark(b, opts = {}) {
  const dark = !!opts.dark, ink = dark ? PAL.paper : PAL.ink, accent = dark ? PAL.goldLt : PAL.gold;
  const y = 7;
  glyph(b, GLYPH.K, 4, y, ink);
  glyph(b, GLYPH.i, 16, y, ink);
  glyph(b, GLYPH.k, 21, y, ink);
  glyph(b, GLYPH.o, 31, y, ink);
  if (opts.spark !== false) {
    b.hline(41, 51, y + 4, accent);
    b.hline(44, 54, y + 7, accent);
    b.hline(41, 50, y + 10, accent);
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
      if (BALL[j][i] !== "#") continue;
      const near = i > 3 && j > 3;
      b.set(58 + i, y + 4 + j, near ? accent : dark ? PAL.gold : PAL.goldLt);
    }
    b.set(60, y + 6, dark ? PAL.paper : PAL.goldPale);
    b.set(61, y + 6, dark ? PAL.paper : PAL.goldPale);
  }
  if (opts.rule) {
    const r = dark ? PAL.woodDk : PAL.wallTrim;
    b.hline(4, b.w - 5, 1, r); b.hline(4, b.w - 5, b.h - 2, r);
  }
}

export function drawMono(b, size, opts = {}) {
  const dark = !!opts.dark, ink = dark ? PAL.paper : PAL.ink, accent = dark ? PAL.goldLt : PAL.gold;
  if (opts.fill) b.rect(0, 0, size, size, dark ? hx("#1b1a18") : PAL.paper);
  b.hline(0, size - 1, 0, accent); b.hline(0, size - 1, size - 1, accent);
  b.vline(0, 0, size - 1, accent); b.vline(size - 1, 0, size - 1, accent);
  const s = size >= 32 ? 2 : 1;
  const x0 = Math.round((size - 9 * s) / 2) - (size >= 32 ? 2 : 0);
  const y0 = Math.round((size - 11 * s) / 2);
  for (let j = 0; j < 11; j++) for (let i = 0; i < 9; i++)
    if (GLYPH.K[j][i] === "#") b.rect(x0 + i * s, y0 + j * s, s, s, ink);
  if (size >= 32) { b.rect(24, 20, 4, 4, accent); b.hline(20, 25, 16, accent); }
}

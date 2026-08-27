// Design System pixel-art renderer, ported to an ES module. All drawing logic
// below is unchanged from Design/pixel.js -- only the export mechanism at the
// bottom of this file differs (ES `export const` instead of `window.PixelWorld`).
var PAL = {
    skyDay: '#CBDFD6', skyCloud: '#EDEFE4', water: '#93B5B0', waterDeep: '#6E9691',
    foliageLight: '#A8C0AC', foliageMid: '#7C9A8A', foliageDark: '#5A7A6C',
    trunk: '#9A6156', ink: '#1E2E28',
    woodLight: '#C89457', woodMid: '#9A6634', woodDark: '#5E3D24',
    wall: '#EAE2D4', stone: '#C4BFB8', fire: '#E88A3C', fireHot: '#F3C24C',
    alert: '#E4695E', autumn: '#C97F3D', dead: '#A88B4A', skin: '#E8C49A'
  };

  var TIERS = {
    bloom: {
      sky: '#CBDFD6', skyLow: '#D9E7DF', cloud: '#EDEFE4', cloudD: '#D5DED2', cloudS: '#BFCFC7',
      ridge: '#B3C7C0', ridgeD: '#A2B8B0', far: '#9DB6AB', far2: '#7F9C90',
      folL: '#B6CCB8', folM: '#8CA898', folD: '#66876F', out: '#33514A', trunk: '#9A6156', trunkD: '#75473F',
      water: '#93B5B0', waterD: '#6E9691', waterL: '#B5CEC8', foam: '#D6E4DE',
      gFar: '#8CAA98', gNear: '#7C9A8A', gEdge: '#A8C0AC', gDark: '#69897A', tuft: '#A8C0AC',
      soil: '#5E4B3C', dirt: '#6B5644', rock: '#A9AFA6',
      flower: '#EDEFE4', flower2: '#E4695E', litter: null, bare: false, lit: true, birds: true,
      dog: ['#D8A566', '#A8703A', '#EFE7D6'], deer: ['#B98457', '#8C5C38', '#EFE4CE'], deerCount: 2, flutter: 5
    },
    green: {
      sky: '#CBDFD6', skyLow: '#D9E7DF', cloud: '#EDEFE4', cloudD: '#D5DED2', cloudS: '#BFCFC7',
      ridge: '#B3C7C0', ridgeD: '#A2B8B0', far: '#9DB6AB', far2: '#7F9C90',
      folL: '#A8C0AC', folM: '#7C9A8A', folD: '#5A7A6C', out: '#33514A', trunk: '#9A6156', trunkD: '#75473F',
      water: '#93B5B0', waterD: '#6E9691', waterL: '#B5CEC8', foam: '#D6E4DE',
      gFar: '#8CAA98', gNear: '#7C9A8A', gEdge: '#A8C0AC', gDark: '#69897A', tuft: '#A8C0AC',
      soil: '#5E4B3C', dirt: '#6B5644', rock: '#A9AFA6',
      flower: null, flower2: null, litter: null, bare: false, lit: true, birds: true,
      dog: ['#D09A5E', '#A0693A', '#E8E0D0'], deer: ['#B07C4E', '#845436', '#E8DCC4'], deerCount: 2, flutter: 2
    },
    autumn: {
      sky: '#C3D0C9', skyLow: '#D1DBD4', cloud: '#E2E3D8', cloudD: '#CDD0C4', cloudS: '#B8BDB2',
      ridge: '#AFB5AA', ridgeD: '#9EA69B', far: '#A79E86', far2: '#8C8469',
      folL: '#DCAB68', folM: '#C97F3D', folD: '#9A6156', out: '#5E3E2C', trunk: '#8A5449', trunkD: '#6B3F36',
      water: '#8CAAA6', waterD: '#6E9691', waterL: '#A7C0BA', foam: '#C6D4CE',
      gFar: '#A29A74', gNear: '#948C64', gEdge: '#BCB07C', gDark: '#7E7654', tuft: '#BCB07C',
      soil: '#5A4436', dirt: '#6A5240', rock: '#A5A398',
      flower: null, flower2: null, litter: '#C97F3D', bare: false, lit: true, birds: false,
      dog: ['#BE8A50', '#8E5C34', '#DED6C4'], deer: ['#9E6F46', '#744A30', '#D8CCB6'], deerCount: 1, flutter: 0
    },
    dead: {
      sky: '#B6C0BA', skyLow: '#C2CAC3', cloud: '#D4D6CC', cloudD: '#C1C4BA', cloudS: '#ADB2A8',
      ridge: '#A2A79E', ridgeD: '#93998F', far: '#8A8168', far2: '#736B55',
      folL: '#A88B4A', folM: '#8E7440', folD: '#5E3D24', out: '#42301F', trunk: '#6E4638', trunkD: '#553428',
      water: '#6E9691', waterD: '#587D78', waterL: '#84A69F', foam: '#9DB6AF',
      gFar: '#8A8060', gNear: '#7A7050', gEdge: '#968B62', gDark: '#665D42', tuft: '#968B62',
      soil: '#4E3B2E', dirt: '#5C4634', rock: '#9A968C',
      flower: null, flower2: null, litter: null, bare: true, lit: false, birds: false,
      dog: ['#8E7440', '#5E4A2A', '#BCB49E'], deer: null, deerCount: 0, flutter: 0,
      cracks: '#4A3524'
    }
  };

  function P(W, H) { this.W = W; this.H = H; this.d = new Array(W * H).fill(null); }
  P.prototype.set = function (x, y, c) {
    if (!c) return; x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return;
    this.d[y * this.W + x] = c;
  };
  P.prototype.get = function (x, y) { return this.d[(y | 0) * this.W + (x | 0)]; };
  P.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  P.prototype.hl = function (x, y, w, c) { this.rect(x, y, w, 1, c); };
  P.prototype.vl = function (x, y, h, c) { this.rect(x, y, 1, h, c); };
  P.prototype.disc = function (cx, cy, r, c) {
    for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++)
      if (x * x + y * y <= r * r + r * 0.5) this.set(cx + x, cy + y, c);
  };
  P.prototype.arcBottom = function (cx, cy, r, c) {
    for (var x = -r; x <= r; x++) {
      var y = Math.round(Math.sqrt(Math.max(0, r * r - x * x)));
      this.set(cx + x, cy + y, c); this.set(cx + x, cy + y - 1, c);
    }
  };

  function rng(seed) { var s = seed || 7; return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

  /* ---------- flora ---------- */
  function conifer(p, cx, baseY, h, w, T) {
    var trunkH = Math.max(3, Math.round(h * 0.13)), tw = Math.max(2, Math.round(w * 0.14));
    p.rect(cx - (tw >> 1), baseY - trunkH, tw, trunkH, T.trunk);
    p.vl(cx - (tw >> 1), baseY - trunkH, trunkH, T.trunkD);
    p.vl(cx - (tw >> 1) - 1, baseY - trunkH, trunkH, T.out);
    p.vl(cx - (tw >> 1) + tw, baseY - trunkH, trunkH, T.out);
    var top = baseY - h, body = h - trunkH, tiers = 4, seg = body / tiers;
    for (var y = top; y < baseY - trunkH; y++) {
      var dy = y - top, ti = Math.min(tiers - 1, Math.floor(dy / seg)), local = (dy - ti * seg) / seg;
      var hw = Math.max(1, Math.round((w / 2) * ((ti + 1) / tiers) * (0.36 + 0.64 * local)));
      if (T.bare) {
        p.set(cx, y, T.out);
        if (dy % 3 === 0) {
          var bl = Math.max(1, Math.round(hw * 0.8));
          for (var b = 1; b <= bl; b++) { p.set(cx - b, y + Math.round(b * 0.4), T.out); p.set(cx + b, y + Math.round(b * 0.4), T.out); }
        }
        continue;
      }
      for (var x = cx - hw; x <= cx + hw; x++) {
        var c = T.folM;
        if ((x * 2 + y * 3) % 7 === 0) c = T.folD;
        else if ((x + y * 2) % 5 === 0) c = T.folL;
        if (x > cx + hw - 3) c = T.folD;
        if (x < cx - hw + 2) c = T.folL;
        p.set(x, y, c);
      }
      if (local > 0.9) { p.hl(cx - hw + 1, y, hw * 2 - 1, T.folD); }
      p.set(cx - hw, y, T.out); p.set(cx + hw, y, T.out);
      if (local > 0.82 && hw > 3) { p.set(cx - hw - 1, y, T.out); p.set(cx + hw + 1, y, T.out); }
    }
    p.set(cx, top, T.out); p.set(cx, top + 1, T.folL);
  }

  function decid(p, cx, baseY, h, w, T) {
    var trunkH = Math.round(h * 0.38), tw = Math.max(3, Math.round(w * 0.12));
    p.rect(cx - (tw >> 1), baseY - trunkH, tw, trunkH, T.trunk);
    p.vl(cx - (tw >> 1), baseY - trunkH, trunkH, T.trunkD);
    p.vl(cx - (tw >> 1) - 1, baseY - trunkH, trunkH, T.out);
    p.vl(cx - (tw >> 1) + tw, baseY - trunkH, trunkH, T.out);
    var r = Math.round(w / 2), cy = baseY - trunkH - r + 2;
    if (T.bare) {
      for (var a = 0; a < 7; a++) {
        var ang = -Math.PI * (0.1 + a * 0.133);
        for (var t = 1; t < r + 1; t++) {
          p.set(cx + Math.round(Math.cos(ang) * t), baseY - trunkH + Math.round(Math.sin(ang) * t), T.out);
          if (t === r - 2) { p.set(cx + Math.round(Math.cos(ang - 0.4) * (t + 2)), baseY - trunkH + Math.round(Math.sin(ang - 0.4) * (t + 2)), T.out); }
        }
      }
      return;
    }
    var clumps = [[0, 0, r], [-r * 0.55, r * 0.2, r * 0.62], [r * 0.55, r * 0.22, r * 0.6],
                  [-r * 0.28, -r * 0.5, r * 0.55], [r * 0.32, -r * 0.45, r * 0.5]];
    for (var i = 0; i < clumps.length; i++) p.disc(cx + Math.round(clumps[i][0]), cy + Math.round(clumps[i][1]), Math.max(2, Math.round(clumps[i][2])), T.out);
    for (i = 0; i < clumps.length; i++) p.disc(cx + Math.round(clumps[i][0]), cy + Math.round(clumps[i][1]), Math.max(1, Math.round(clumps[i][2]) - 1), T.folM);
    p.disc(cx - Math.round(r * 0.34), cy - Math.round(r * 0.34), Math.max(2, Math.round(r * 0.44)), T.folL);
    p.disc(cx - Math.round(r * 0.62), cy - Math.round(r * 0.06), Math.max(1, Math.round(r * 0.28)), T.folL);
    p.disc(cx + Math.round(r * 0.46), cy + Math.round(r * 0.34), Math.max(2, Math.round(r * 0.36)), T.folD);
    p.disc(cx + Math.round(r * 0.1), cy + Math.round(r * 0.5), Math.max(1, Math.round(r * 0.3)), T.folD);
    for (var d = 0; d < 14; d++) {
      var ax = cx - r + Math.round(rng(d + 5)() * r * 2), ay = cy - r + Math.round(rng(d + 19)() * r * 2);
      if ((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy) < r * r * 0.72) p.set(ax, ay, (d % 2) ? T.folL : T.folD);
    }
  }

  function bushy(p, cx, baseY, h, w, T) {
    var r = Math.max(3, Math.round(w / 2)), trunkH = Math.max(3, Math.round(h * 0.26));
    p.rect(cx - 1, baseY - trunkH, 2, trunkH, T.trunk);
    p.vl(cx - 2, baseY - trunkH, trunkH, T.out); p.vl(cx + 1, baseY - trunkH, trunkH, T.trunkD);
    var cy = baseY - trunkH - r + 1;
    if (T.bare) {
      for (var a = 0; a < 6; a++) { var ang = -Math.PI * (0.12 + a * 0.152); for (var t = 1; t < r + 2; t++) p.set(cx + Math.round(Math.cos(ang) * t), baseY - trunkH + Math.round(Math.sin(ang) * t), T.out); }
      return;
    }
    var lobes = [[0, 0, r], [-r * 0.6, r * 0.25, r * 0.7], [r * 0.6, r * 0.25, r * 0.68], [0, -r * 0.5, r * 0.66]];
    for (var i = 0; i < lobes.length; i++) p.disc(cx + Math.round(lobes[i][0]), cy + Math.round(lobes[i][1]), Math.max(2, Math.round(lobes[i][2])), T.out);
    for (i = 0; i < lobes.length; i++) p.disc(cx + Math.round(lobes[i][0]), cy + Math.round(lobes[i][1]), Math.max(1, Math.round(lobes[i][2]) - 1), T.folD);
    p.disc(cx - Math.round(r * 0.3), cy - Math.round(r * 0.45), Math.max(2, Math.round(r * 0.52)), T.folM);
    p.disc(cx + Math.round(r * 0.3), cy - Math.round(r * 0.2), Math.max(1, Math.round(r * 0.34)), T.folL);
  }

  function bareThin(p, cx, baseY, h, T) {
    p.rect(cx - 1, baseY - h, 3, h, T.out);
    p.vl(cx, baseY - h + 4, h - 4, T.trunkD);
    p.rect(cx - 2, baseY - 6, 5, 6, T.out);
    p.vl(cx, baseY - 6, 6, T.trunkD);
    var b = Math.max(5, Math.round(h * 0.3));
    for (var i = 0; i < 6; i++) {
      var y = baseY - h + Math.round(h * (0.06 + i * 0.15)), d = (i % 2 ? 1 : -1);
      var len = b - (i % 2) - Math.round(i * 0.5);
      for (var t = 1; t <= len; t++) {
        var by = y - Math.round(t * 0.62);
        p.set(cx + d * t, by, T.out);
        if (t < len - 1) p.set(cx + d * t, by + 1, T.trunkD);
      }
      // forked tip
      var tx = cx + d * len, ty = y - Math.round(len * 0.62);
      p.set(tx + d, ty - 1, T.out); p.set(tx, ty - 2, T.out);
      if (i % 2 === 0) { p.set(tx + d * 2, ty - 2, T.out); p.set(tx + d, ty - 3, T.out); }
    }
    p.set(cx, baseY - h - 1, T.out); p.set(cx - 1, baseY - h - 2, T.out); p.set(cx + 1, baseY - h - 3, T.out);
    if (!T.bare) {
      p.rect(cx - 4, baseY - h + Math.round(h * 0.36), 2, 2, T.folM);
      p.rect(cx + 4, baseY - h + Math.round(h * 0.58), 2, 2, T.folM);
      p.set(cx - 3, baseY - h + Math.round(h * 0.74), T.folL);
    }
  }

  function tuft(p, x, y, T) {
    p.set(x, y - 1, T.gDark); p.set(x, y - 2, T.gDark); p.set(x - 1, y - 1, T.gDark); p.set(x + 1, y - 2, T.gDark);
    p.set(x, y - 3, T.tuft); p.set(x + 1, y - 3, T.tuft);
    p.set(x - 1, y, T.gDark); p.set(x + 1, y, T.gDark);
  }
  function rock(p, x, y, r, T) {
    for (var g = -r - 2; g <= r + 2; g++) p.set(x + g, y, T.gDark);
    p.set(x - r - 1, y - 1, T.gDark); p.set(x + r + 1, y - 1, T.gDark);
    p.disc(x, y - r, r, T.out); p.disc(x, y - r, r - 1, T.rock);
    p.set(x - Math.round(r * 0.4), y - r - Math.round(r * 0.3), '#D6D8D2');
    p.set(x + Math.round(r * 0.5), y - r + Math.round(r * 0.3), T.out);
    p.hl(x - r + 1, y - 1, r * 2 - 1, T.out);
  }
  function bench(p, x, y, T) {
    p.hl(x, y - 5, 13, T.trunk); p.hl(x, y - 4, 13, T.trunkD);
    p.hl(x, y - 8, 13, T.trunk); p.set(x, y - 8, T.out); p.set(x + 12, y - 8, T.out);
    p.vl(x + 1, y - 4, 4, T.trunkD); p.vl(x + 11, y - 4, 4, T.trunkD);
    p.vl(x + 1, y - 8, 4, T.trunkD); p.vl(x + 11, y - 8, 4, T.trunkD);
  }
  function woodpile(p, x, y, T) {
    for (var r = 0; r < 3; r++) for (var i = 0; i < 4 - r; i++) {
      var lx = x + i * 4 + r * 2, ly = y - 4 - r * 4;
      p.rect(lx, ly, 4, 4, PAL.woodMid); p.rect(lx, ly, 4, 1, PAL.woodLight);
      p.rect(lx, ly, 1, 4, PAL.woodDark); p.set(lx + 2, ly + 2, PAL.woodDark);
    }
  }

  /* ---------- fauna ---------- */
  // dog, side view, facing right. x = tail end, y = ground line.
  function dog(p, x, y, T, sit) {
    var c = T.dog, body = c[0], shade = c[1], chest = c[2], out = T.out;
    if (sit) {
      p.rect(x + 2, y - 8, 7, 5, body);
      p.rect(x + 2, y - 4, 7, 1, shade);
      p.rect(x + 3, y - 3, 5, 3, body); p.rect(x + 3, y - 1, 5, 1, shade);
      p.rect(x + 7, y - 3, 2, 3, chest);
      p.set(x + 1, y - 9, body); p.set(x, y - 10, body); p.set(x, y - 11, shade);
    } else {
      p.rect(x + 2, y - 8, 8, 4, body);
      p.hl(x + 2, y - 8, 8, shade);
      p.hl(x + 3, y - 5, 6, chest);
      p.set(x + 1, y - 9, body); p.set(x, y - 10, body); p.set(x, y - 11, shade);
      p.rect(x + 3, y - 4, 1, 4, shade); p.rect(x + 5, y - 4, 1, 4, body);
      p.set(x + 3, y, out); p.set(x + 5, y, out);
    }
    p.rect(x + 8, y - 4, 1, 4, body); p.rect(x + 10, y - 4, 1, 4, shade);
    p.set(x + 8, y, out); p.set(x + 10, y, out);
    var hy = y - (sit ? 12 : 11);
    p.rect(x + 9, hy, 4, 4, body);
    p.rect(x + 12, hy + 2, 2, 2, body);
    p.set(x + 12, hy + 3, chest);
    p.set(x + 9, hy - 1, shade); p.set(x + 10, hy - 1, shade);
    p.set(x + 8, hy + 1, shade); p.set(x + 8, hy + 2, shade);
    p.set(x + 11, hy + 1, out);
    p.set(x + 13, hy + 2, out);
  }

  // deer, side view, facing right. x = rump, y = ground line. antlers only when buck.
  function deer(p, x, y, T, scale2, buck) {
    if (!T.deer) return;
    var c = T.deer, body = c[0], shade = c[1], pale = c[2], out = T.out;
    var bw = scale2 ? 13 : 10, bh = scale2 ? 7 : 5, legH = scale2 ? 6 : 4, lw = scale2 ? 2 : 1;
    var top = y - legH - bh, i;
    p.rect(x, top, bw, bh, body);
    p.hl(x, top, bw, shade);
    p.hl(x, y - legH - 1, bw, shade);
    p.rect(x, top + 1, 2, 2, pale);
    [1, 3 + lw, bw - 4 - lw, bw - 2 - lw].forEach(function (lx, k) {
      p.rect(x + lx, y - legH, lw, legH, k % 2 ? body : shade);
      p.hl(x + lx, y, lw, out);
    });
    var neck = scale2 ? 4 : 3, nw = scale2 ? 3 : 2, nx = x + bw - nw;
    for (i = 0; i < neck; i++) {
      p.rect(nx + i, top - 1 - i, nw, 2, body);
      p.set(nx + i + nw - 1, top - 1 - i, shade);
    }
    var hx = nx + neck, hy = top - neck, hw = scale2 ? 4 : 3, hh = scale2 ? 3 : 2;
    p.rect(hx, hy - hh, hw, hh, body);
    p.hl(hx, hy - hh, hw, shade);
    p.set(hx + hw, hy - 1, out); // nose tip
    p.set(hx + hw, hy - 2, out); // stacked with the line above so the snout actually reads as a nose, not just outline noise
    p.set(hx + hw - 2, hy - hh + 1, out); // eye
    if (buck) {
      p.set(hx, hy - hh - 1, out); p.set(hx, hy - hh - 2, out);
      p.set(hx - 1, hy - hh - 3, out); p.set(hx - 1, hy - hh - 4, out);
      p.set(hx - 2, hy - hh - 2, out);
      p.set(hx + hw - 1, hy - hh - 1, out); p.set(hx + hw - 1, hy - hh - 2, out);
      p.set(hx + hw, hy - hh - 3, out); p.set(hx + hw, hy - hh - 4, out);
      p.set(hx + hw + 1, hy - hh - 2, out);
    } else {
      p.set(hx, hy - hh - 1, shade); p.set(hx + hw - 1, hy - hh - 1, shade);
    }
    p.vl(x - 1, top, 3, pale);
  }

  function butterfly(p, x, y, T, up, warm) {
    var wing = warm ? (T.flower2 || '#E4695E') : (T.flower || '#EDEFE4');
    if (T.bare) return;
    if (up) {
      p.vl(x, y - 2, 2, wing); p.vl(x + 2, y - 2, 2, wing);
      p.set(x + 1, y - 1, T.out); p.set(x + 1, y, T.out);
      p.set(x, y - 3, T.out); p.set(x + 2, y - 3, T.out);
    } else {
      p.hl(x - 1, y, 5, wing);
      p.set(x, y - 1, wing); p.set(x + 2, y - 1, wing);
      p.set(x + 1, y, T.out); p.set(x + 1, y - 1, T.out);
    }
  }

  /* ---------- water ---------- */
  function lake(p, x0, y0, w, h, T, frame, treeXs) {
    var rad = Math.max(3, Math.min(10, Math.round(Math.min(w, h) * 0.3))), ins = [], y, i;
    for (y = 0; y < h; y++) {
      var d = Math.min(y, h - 1 - y), k = 0;
      if (d < rad) k = rad - Math.round(Math.sqrt(Math.max(0, rad * rad - (rad - 1 - d) * (rad - 1 - d))));
      ins.push(k);
    }
    var L = function (yy) { return x0 + ins[yy]; }, RW = function (yy) { return w - ins[yy] * 2; };
    for (y = 0; y < h; y++) p.hl(L(y), y0 + y, RW(y), T.water);
    p.hl(L(0), y0, RW(0), T.waterL);
    p.hl(L(1), y0 + 1, RW(1), T.waterL);
    if (treeXs) treeXs.forEach(function (tx) {
      if (tx > x0 && tx < x0 + w) for (var yt = y0 + 2; yt < y0 + Math.min(h - 2, 10); yt++) if ((yt + tx) % 2 === 0 && tx > L(yt - y0) && tx < L(yt - y0) + RW(yt - y0) - 1) p.set(tx, yt, T.waterD);
    });
    var r = rng(31);
    for (i = 0; i < Math.round(h / 2.2); i++) {
      var ry = 3 + Math.round(r() * (h - 5));
      var rw = Math.max(3, Math.round(w * (0.05 + r() * 0.13)));
      var rx = L(ry) + 2 + Math.round(r() * (RW(ry) - rw - 4)) + ((frame || 0) % 2 ? 1 : 0);
      if (ry < 1 || ry > h - 2) continue;
      p.hl(rx, y0 + ry, rw, T.waterD);
      p.hl(rx + 1, y0 + ry - 1, Math.max(2, rw - 2), T.waterL);
    }
    p.hl(L(h - 1), y0 + h - 1, RW(h - 1), T.waterD);
    p.hl(L(h - 2), y0 + h - 2, RW(h - 2), T.foam);
    for (y = 0; y < h; y++) {
      var xl = L(y), xr = xl + RW(y) - 1;
      p.set(xl, y0 + y, T.waterD); p.set(xr, y0 + y, T.waterD);
      p.set(xl - 1, y0 + y, T.soil); p.set(xr + 1, y0 + y, T.soil);
      var nxt = y + 1 < h ? ins[y + 1] : ins[y], prv = y > 0 ? ins[y - 1] : ins[y];
      if (ins[y] > nxt) { p.hl(xl - 1, y0 + y, ins[y] - nxt + 1, T.soil); p.hl(xr - (ins[y] - nxt), y0 + y, ins[y] - nxt + 1, T.soil); }
      if (ins[y] > prv) { p.hl(xl - 1, y0 + y, ins[y] - prv + 1, T.soil); p.hl(xr - (ins[y] - prv), y0 + y, ins[y] - prv + 1, T.soil); }
    }
    for (var rd = 0; rd < 5; rd++) {
      var dx = x0 + w - 5 - rd * 6;
      p.vl(dx, y0 + h - 4 - (rd % 2) * 3, 4 + (rd % 2) * 3, T.folD);
      p.set(dx + 1, y0 + h - 6 - (rd % 2) * 2, T.folD);
    }
  }

  /* ---------- built ---------- */
  function house(p, x, baseY, w, h, T, opts) {
    var roofH = Math.round(h * 0.38), wallH = h - roofH, top = baseY - wallH;
    var found = Math.max(3, Math.round(h * 0.07));
    // stone foundation
    p.rect(x - 2, baseY - found, w + 4, found, PAL.stone);
    for (var sx0 = x - 1; sx0 < x + w + 2; sx0 += 5) { p.vl(sx0, baseY - found, found, '#ADA8A1'); p.set(sx0 + 2, baseY - found + 1, '#D2CDC6'); }
    p.hl(x - 2, baseY - found, w + 4, PAL.ink);

    // log wall
    p.rect(x, top, w, wallH - found, PAL.woodMid);
    for (var y = top + 1; y < baseY - found - 1; y += 4) {
      p.hl(x + 1, y, w - 2, PAL.woodLight);
      p.hl(x + 1, y + 3, w - 2, PAL.woodDark);
      for (var nx = x + 4; nx < x + w - 3; nx += 11) { p.set(nx, y + 1, PAL.woodDark); p.set(nx + 5, y + 2, '#7A5232'); }
    }
    p.vl(x, top, wallH - found, PAL.woodDark); p.vl(x + w - 1, top, wallH - found, PAL.woodDark);
    p.vl(x - 1, top, wallH - found, PAL.ink); p.vl(x + w, top, wallH - found, PAL.ink);
    // corner notching
    for (var cy0 = top + 2; cy0 < baseY - found; cy0 += 8) {
      p.rect(x - 2, cy0, 3, 2, PAL.woodDark); p.rect(x + w - 1, cy0, 3, 2, PAL.woodDark);
      p.set(x - 2, cy0, PAL.ink); p.set(x + w + 1, cy0, PAL.ink);
    }

    // gable + shingled roof
    var mid = x + Math.round(w / 2);
    for (var ry = 0; ry < roofH; ry++) {
      var hw = Math.round((w / 2 + 6) * (ry + 1) / roofH), ry0 = top - roofH + ry;
      p.hl(mid - hw, ry0, hw * 2, PAL.woodDark);
      if (ry % 3 === 1) for (var shx = mid - hw + 1; shx < mid + hw - 1; shx += 5) p.set(shx + (ry % 6 === 1 ? 0 : 2), ry0, '#7A5232');
      if (ry % 6 === 3) p.hl(mid - hw + 1, ry0, hw * 2 - 2, '#4E3220');
      p.set(mid - hw, ry0, PAL.ink); p.set(mid + hw - 1, ry0, PAL.ink);
    }
    p.hl(x - 5, top, w + 10, PAL.ink);
    p.hl(x - 5, top - 1, w + 10, PAL.woodDark);
    // gable vent
    if (roofH > 14) {
      p.rect(mid - 3, top - Math.round(roofH * 0.45), 6, 5, PAL.woodDark);
      p.rect(mid - 2, top - Math.round(roofH * 0.45) + 1, 4, 3, T.lit ? PAL.fire : '#3A3028');
      p.vl(mid, top - Math.round(roofH * 0.45) + 1, 3, PAL.woodDark);
    }

    // chimney — starts inside the roof and rises through it
    var chx = x + Math.round(w * 0.6);
    var chTop = baseY - h - 13;
    var chBot = baseY - wallH - Math.round(roofH * 0.22);
    var chH = chBot - chTop;
    p.rect(chx, chTop, 10, chH, PAL.stone);
    p.rect(chx, chTop, 10, 2, PAL.ink);
    p.vl(chx, chTop, chH, PAL.ink); p.vl(chx + 9, chTop, chH, PAL.ink);
    p.rect(chx - 1, chTop + 2, 12, 3, PAL.stone);
    p.hl(chx - 1, chTop + 2, 12, PAL.ink); p.hl(chx - 1, chTop + 4, 12, '#ADA8A1');
    for (var chy = chTop + 6; chy < chBot; chy += 3) { p.hl(chx + 1, chy, 8, '#ADA8A1'); p.set(chx + 3, chy + 1, '#D2CDC6'); p.set(chx + 7, chy + 1, '#D2CDC6'); }
    p.rect(chx - 2, chBot - Math.round(roofH * 0.34), 14, 2, PAL.woodDark);
    p.hl(chx - 2, chBot - Math.round(roofH * 0.34), 14, PAL.ink);
    if (T.lit && opts && opts.smoke) {
      var sm = rng(9);
      for (var k = 0; k < 6; k++) p.disc(chx + 5 + Math.round(sm() * 5) - 2, chTop - 5 - k * 5, 1 + (k > 2 ? 1 : 0) + (k > 4 ? 1 : 0), T.cloud);
    }

    // porch roof + posts
    var dw = Math.max(9, Math.round(w * 0.2)), dh = Math.max(16, Math.round((wallH - found) * 0.7));
    var dx = x + Math.round(w * 0.14);
    var porchY = baseY - dh - 6;
    p.rect(dx - 5, porchY, dw + 12, 2, PAL.woodDark);
    p.hl(dx - 5, porchY, dw + 12, PAL.ink);
    p.hl(dx - 4, porchY + 2, dw + 10, '#7A5232');
    p.vl(dx - 4, porchY + 2, dh + 4, PAL.woodDark);
    p.vl(dx + dw + 5, porchY + 2, dh + 4, PAL.woodDark);
    p.vl(dx - 5, porchY + 2, dh + 4, PAL.ink);
    p.vl(dx + dw + 6, porchY + 2, dh + 4, PAL.ink);

    // door
    p.rect(dx - 2, baseY - dh - 2, dw + 4, dh + 2, PAL.woodDark);
    p.rect(dx - 1, baseY - dh - 1, dw + 2, dh + 1, PAL.ink);
    if (opts && opts.doorOpen) {
      p.rect(dx, baseY - dh, dw, dh, T.lit ? PAL.fire : '#2A3A34');
      p.rect(dx, baseY - dh, 3, dh, PAL.woodDark);
      if (T.lit) { p.rect(dx + 3, baseY - Math.round(dh * 0.4), dw - 4, Math.round(dh * 0.4), PAL.fireHot); }
    } else {
      p.rect(dx, baseY - dh, dw, dh, PAL.woodMid);
      p.vl(dx + 1, baseY - dh + 1, dh - 2, PAL.woodLight);
      p.vl(dx + dw - 2, baseY - dh + 1, dh - 2, PAL.woodDark);
      p.hl(dx + 1, baseY - Math.round(dh * 0.66), dw - 2, PAL.woodDark);
      p.hl(dx + 1, baseY - Math.round(dh * 0.34), dw - 2, PAL.woodDark);
      p.set(dx + dw - 3, baseY - Math.round(dh * 0.5), PAL.fireHot);
    }
    // steps
    p.rect(dx - 4, baseY, dw + 8, 2, PAL.stone);
    p.rect(dx - 6, baseY + 2, dw + 12, 2, '#B8B3AC');
    p.hl(dx - 4, baseY, dw + 8, '#D2CDC6');
    p.hl(dx - 6, baseY + 2, dw + 12, '#C8C3BC');

    // lantern
    var lx = dx + dw + 8;
    p.rect(lx, baseY - dh + 4, 4, 6, PAL.ink);
    p.rect(lx + 1, baseY - dh + 5, 2, 4, T.lit ? PAL.fireHot : '#67736C');
    p.vl(lx + 1, baseY - dh, 4, PAL.ink);
    p.set(lx + 2, baseY - dh + 10, PAL.ink);

    // main window with shutters
    var ww = Math.max(10, Math.round(w * 0.22));
    var wx = x + w - ww - Math.max(6, Math.round(w * 0.14)), wy = top + Math.max(4, Math.round((wallH - found) * 0.2));
    p.rect(wx - 3, wy - 3, ww + 6, ww + 6, PAL.woodDark);
    p.rect(wx - 2, wy - 2, ww + 4, ww + 4, PAL.ink);
    p.rect(wx, wy, ww, ww, T.lit ? PAL.fireHot : '#67736C');
    if (T.lit) { p.rect(wx, wy + ww - 4, ww, 4, PAL.fire); p.rect(wx + 1, wy + 1, 3, 3, '#FBE39A'); }
    p.vl(wx + (ww >> 1), wy, ww, PAL.woodDark); p.hl(wx, wy + (ww >> 1), ww, PAL.woodDark);
    p.rect(wx - 6, wy - 2, 3, ww + 4, PAL.woodMid); p.vl(wx - 6, wy - 2, ww + 4, PAL.ink);
    p.rect(wx + ww + 3, wy - 2, 3, ww + 4, PAL.woodMid); p.vl(wx + ww + 5, wy - 2, ww + 4, PAL.ink);
    p.rect(wx - 2, wy + ww + 2, ww + 4, 2, PAL.woodDark);
    // flower box
    if (!T.bare) { p.rect(wx - 1, wy + ww + 4, ww + 2, 3, T.trunk); p.hl(wx - 1, wy + ww + 4, ww + 2, T.trunkD); for (var fbx = wx; fbx < wx + ww; fbx += 3) { p.set(fbx, wy + ww + 3, T.folD); p.set(fbx + 1, wy + ww + 2, T.flower || T.folM); } }

    // small side window
    if (w > 60) {
      var sw = 7, sx1 = x + Math.round(w * 0.42), sy1 = top + Math.max(4, Math.round((wallH - found) * 0.24));
      p.rect(sx1 - 1, sy1 - 1, sw + 2, sw + 2, PAL.ink);
      p.rect(sx1, sy1, sw, sw, T.lit ? PAL.fire : '#67736C');
      p.vl(sx1 + (sw >> 1), sy1, sw, PAL.woodDark);
    }

    p.rect(x - 5, baseY - 2, w + 10, 2, PAL.woodDark);
  }

  function gardenBed(p, x, y, w, T, dense) {
    p.rect(x, y - 1, w, 5, T.dirt);
    p.hl(x, y - 1, w, T.soil);
    p.hl(x, y + 3, w, T.soil);
    p.vl(x, y - 1, 5, T.soil); p.vl(x + w - 1, y - 1, 5, T.soil);
    for (var s = x + 2; s < x + w - 1; s += 5) { p.set(s, y + 1, T.soil); p.set(s + 2, y + 2, T.soil); }
    var jr = rng(x * 7 + 3), clumps = [], cx0 = x + 6;
    while (cx0 < x + w - 7) { clumps.push(cx0); cx0 += 13 + Math.round(jr() * 8); }
    for (var i = 0; i < clumps.length; i++) {
      var px = clumps[i];
      if (T.bare) { p.rect(px - 2, y - 3, 5, 2, T.out); p.set(px + 1, y - 4, T.out); p.set(px - 1, y - 4, T.out); p.set(px, y - 5, T.out); continue; }
      var ph = dense ? 16 : 12;
      for (var yy = 0; yy < ph; yy++) {
        var half = Math.max(1, Math.round(4.2 * (1 - yy / ph)) + 1);
        for (var xx = -half; xx <= half; xx++) {
          var c = ((xx * 2 + yy) % 3 === 0) ? T.folM : T.folD;
          if (xx <= -half + 1) c = T.folM;
          if (xx >= half - 1 && yy > 1) c = T.out;
          p.set(px + xx, y - 1 - yy, c);
        }
        if (yy % 4 === 2) { p.set(px - half - 1, y - 1 - yy, T.folM); p.set(px + half + 1, y - 1 - yy, T.out); }
      }
      p.vl(px, y - ph - 2, 2, T.folL); p.set(px - 1, y - ph - 1, T.folL); p.set(px + 1, y - ph - 1, T.folM);
      p.set(px - 3, y - ph + 3, T.folL); p.set(px + 3, y - ph + 4, T.folM);
      p.set(px - 4, y - ph + 6, T.folM); p.set(px + 4, y - ph + 7, T.folD);
      if (T.flower) {
        var fc = (i % 3 === 0) ? T.flower2 : T.flower;
        p.rect(px - 1, y - ph - 4, 3, 2, fc); p.set(px, y - ph - 5, fc); p.set(px, y - ph - 3, T.folL);
        if (i % 2 === 1) { p.rect(px - 4, y - ph + 2, 2, 2, fc); p.rect(px + 3, y - ph + 4, 2, 2, fc); }
      }
      if (T.litter) { p.set(px + 5, y + 4, T.litter); p.set(px - 4, y + 5, T.litter); p.set(px + 2, y + 5, T.litter); }
    }
  }

  /* ---------- character ---------- */
  var LEGEND = { '.': null, o: 'ink', h: 'hair', H: 'hairL', s: 'skin', d: 'skinD', S: 'ink', t: 'shirt', T: 'shirtD', L: 'shirtL', p: 'pants', k: 'pantsL', b: 'ink' };
  var IDLE = [
    '.....oooooo.....',
    '....ohHHHHHho...',
    '...ohHHHHHHhho..',
    '..ohHHhhhhhhhho.',
    '..ohhhsssssdhho.',
    '..ohhssssssdsho.',
    '..ohsssssssddho.',
    '..ohsSsssssSdho.',
    '..ohsssssssddho.',
    '..ohssdssssdho..',
    '...ohsddsssdho..',
    '....ohsssddho...',
    '.....oossoo.....',
    '...ottLLLtttо..',
    '..otLLLLttttto.',
    '.osttLLLtttttso.',
    '.osttLLtttttTso.',
    '.osttTTTTTTTtso.',
    '.osttttttTTTtso.',
    '..ostttttTTtso..',
    '..okkppppppkpo..',
    '..okkppooppkpo..',
    '..okpo....okpo..',
    '..obbbo..obbbo..'
  ];
  IDLE[13] = '...ottLLLttttо..';
  IDLE[13] = '...ottLLLtttto..';
  var WALK = IDLE.slice(0, 22).concat(['.okpo......okpo.', 'obbbo.....obbbo.']);
  var SIT = IDLE.slice(0, 20).concat([
    '..okkpppppppo...',
    '..okpppppppppo..',
    '..obbbo...okpo..',
    '..obbbo...obbo..'
  ]);
  function backOf(grid) {
    return grid.map(function (row, j) {
      if (j > 12) return row;
      return row.split('').map(function (ch) { return (ch === 's' || ch === 'S' || ch === 'd') ? 'h' : ch; }).join('');
    });
  }
  var POSES = { idle: IDLE, walk: WALK, sit: SIT, back: backOf(IDLE) };

  var CHAR = {
    boy: { ink: PAL.ink, hair: '#5E3D24', hairL: '#7A5232', skin: PAL.skin, skinD: '#C89457', shirt: '#6E9691', shirtD: '#4E6E6A', shirtL: '#8FB2AC', pants: '#3C4A44', pantsL: '#4E5E56' },
    girl: { ink: PAL.ink, hair: '#8A5449', hairL: '#A5685A', skin: PAL.skin, skinD: '#C89457', shirt: '#9A6634', shirtD: '#7A4E28', shirtL: '#B98149', pants: '#3C4A44', pantsL: '#4E5E56' },
    tunic: { ink: PAL.ink, hair: '#3B2A22', hairL: '#5E3D24', skin: PAL.skin, skinD: '#C89457', shirt: '#DCD8C4', shirtD: '#B3AE94', shirtL: '#EFECDD', pants: '#CBC6AE', pantsL: '#E0DCC8' }
  };

  function sprite(p, grid, x, baseY, colors) {
    for (var j = 0; j < grid.length; j++) {
      var row = grid[j];
      for (var i = 0; i < row.length; i++) {
        var key = LEGEND[row[i]];
        if (key) p.set(x + i, baseY - grid.length + j, colors[key]);
      }
    }
  }

  /* ---------- the world ---------- */
  var WORLD_W = 380, WORLD_H = 210;
  var GY = 108, MY = 146, CHAR_BASE = 178;

  function world(tier, opts) {
    opts = opts || {};
    var skyAdd = opts.skyAdd || 0, groundAdd = opts.groundAdd || 0;
    var T = TIERS[tier] || TIERS.green, W = WORLD_W, H = WORLD_H + skyAdd + groundAdd, p = new P(W, H);
    var GY = 108 + skyAdd, MY = 146 + skyAdd, CHAR_BASE = 178 + skyAdd;

    p.rect(0, 0, W, GY, T.sky);
    p.rect(0, GY - 40, W, 40, T.skyLow);

    var cl = [[26, 30, 7], [39, 35, 9], [52, 29, 6], [104, 24, 8], [117, 29, 10], [131, 23, 7],
              [186, 37, 7], [198, 32, 9], [210, 39, 6], [252, 26, 8], [265, 31, 10], [278, 27, 7],
              [320, 34, 8], [334, 29, 10], [348, 36, 7]];
    if (skyAdd > 0) cl = cl.concat([[62, -108, 8], [75, -102, 10], [88, -110, 7],
                                    [158, -74, 7], [170, -68, 9], [182, -76, 6],
                                    [236, -120, 6], [247, -114, 8], [16, -62, 6], [28, -56, 8],
                                    [300, -92, 7], [313, -86, 9], [326, -95, 6]]);
    cl = cl.map(function (c) { return [c[0], c[1] + skyAdd, c[2]]; });
    var i;
    for (i = 0; i < cl.length; i++) p.disc(cl[i][0], cl[i][1], cl[i][2], T.cloud);
    for (i = 0; i < cl.length; i++) p.hl(cl[i][0] - cl[i][2], cl[i][1] + cl[i][2] - 1, cl[i][2] * 2, T.cloud);
    for (i = 0; i < cl.length; i++) p.arcBottom(cl[i][0], cl[i][1], cl[i][2] - 1, T.cloudD);
    for (i = 0; i < cl.length; i += 2) p.disc(cl[i][0] - 2, cl[i][1] - 2, Math.max(1, cl[i][2] - 4), '#F6F7EF');

    if (T.birds) [[70, 52], [76, 48], [82, 54], [228, 46], [234, 51], [120, -84], [127, -89], [134, -83], [300, 44], [307, 39]].forEach(function (b) {
      var by = b[1] + skyAdd;
      p.set(b[0], by, T.far2); p.set(b[0] + 1, by - 1, T.far2); p.set(b[0] + 2, by, T.far2);
    });

    for (var x = 0; x < W; x++) {
      var hgt = 15 + Math.round(9 * Math.sin(x / 46) + 6 * Math.sin(x / 17 + 2));
      p.rect(x, GY - 7 - hgt, 1, hgt, T.ridge);
      if ((x + hgt) % 5 === 0) p.rect(x, GY - 7 - hgt + 1, 1, Math.round(hgt * 0.4), T.ridgeD);
    }
    // two treeline layers for depth
    var fr = rng(19);
    p.rect(0, GY - 8, W, 9, T.far);
    for (var fx = -2; fx < W + 3; fx += 4) {
      var hh = Math.round(13 * (0.55 + fr() * 0.75));
      for (var y = 0; y < hh; y++) { var hw2 = Math.max(0, Math.round((y / hh) * 3)); p.hl(fx - hw2, GY - 8 - hh + y, hw2 * 2 + 1, T.far); }
    }
    var fr2 = rng(37);
    p.rect(0, GY - 4, W, 5, T.far2);
    for (fx = -1; fx < W + 3; fx += 5) {
      var hh2 = Math.round(9 * (0.6 + fr2() * 0.7));
      for (y = 0; y < hh2; y++) { var hw3 = Math.max(0, Math.round((y / hh2) * 3)); p.hl(fx - hw3, GY - 4 - hh2 + y, hw3 * 2 + 1, T.far2); }
    }

    p.rect(0, GY, W, MY - GY, T.gFar);
    p.rect(0, MY, W, H - MY, T.gNear);
    // value step, not a hairline: dithered transition band
    for (var mx = 0; mx < W; mx++) {
      var wob2 = Math.round(1.5 * Math.sin(mx / 31) + Math.sin(mx / 13));
      for (var my2 = 0; my2 < 4; my2++) {
        var yy2 = MY + wob2 + my2;
        if ((mx + my2 * 2) % (my2 + 2) === 0) p.set(mx, yy2, T.gFar);
      }
      p.set(mx, MY + wob2 - 1, T.gDark);
    }
    p.hl(0, GY, W, T.gEdge);
    for (var gx = 0; gx < W; gx += 7) p.set(gx + (gx % 3), MY + 6 + (gx % 7), T.gDark);

    var treeXs = [118, 140, 158, 182, 203, 220, 242];
    lake(p, 2, GY + 4, 88, MY - GY - 9, T, opts.frame, [14, 30, 46, 62, 78]);
    p.hl(2, MY - 5, 88, T.soil);
    p.hl(2, MY - 4, 88, T.gEdge);
    for (var pb = 4; pb < 88; pb += 7) p.set(pb, MY - 5, T.dirt);

    p.rect(10, MY - 13, 46, 3, T.trunk);
    p.hl(10, MY - 13, 46, T.trunkD);
    for (var dx2 = 12; dx2 < 54; dx2 += 9) { p.vl(dx2, MY - 10, 8, T.trunkD); p.vl(dx2 + 1, MY - 10, 8, T.out); }
    bench(p, 64, MY + 8, T);
    rock(p, 100, MY + 3, 4, T); rock(p, 90, MY + 12, 3, T); rock(p, 8, MY + 14, 2, T);

    conifer(p, 132, MY, 86, 36, T);
    bushy(p, 164, MY, 48, 32, T);
    conifer(p, 188, MY, 68, 30, T);
    decid(p, 222, MY, 76, 42, T);
    decid(p, 252, MY, 62, 34, T);
    conifer(p, 274, MY, 94, 40, T);
    decid(p, 300, MY, 56, 30, T);
    conifer(p, 376, MY, 78, 34, T);

    house(p, 304, MY + 28, 70, 88, T, { smoke: opts.smoke, doorOpen: opts.doorOpen });
    woodpile(p, 276, MY + 28, T);

    gardenBed(p, 122, MY + 30, 74, T, tier === 'bloom');
    gardenBed(p, 146, MY + 56, 86, T, tier === 'bloom');
    bushy(p, 108, MY + 14, 26, 18, T);
    bushy(p, 246, MY + 12, 22, 16, T);

    if (opts.fauna === true) {
      if (T.deerCount > 0) {
        deer(p, 70, MY + 35, T, true, true);
        if (T.deerCount > 1) deer(p, 330, MY + 45, T, false, false);
        if (T.deerCount > 2) deer(p, 350, MY + 9, T, true, false);
      }
      if (T.flutter > 0) {
        var bfs = [[134, MY + 20, true, true], [172, MY + 44, false, false], [152, MY + 12, true, false],
                   [204, MY + 38, false, true], [118, MY + 40, true, true]];
        for (var bi = 0; bi < Math.min(T.flutter, bfs.length); bi++)
          butterfly(p, bfs[bi][0], bfs[bi][1], T, bfs[bi][2], bfs[bi][3]);
      }
    }

    var gr = rng(77);
    for (var t = 0; t < 34; t++) {
      var tx = Math.round(gr() * W), ty = MY + 6 + Math.round(gr() * (H - MY - 8));
      if (tx > 114 && tx < 240 && ty > MY + 14) continue;
      if (T.bare) { if (gr() > 0.55) { p.hl(tx, ty, 4 + Math.round(gr() * 6), T.cracks || T.soil); p.set(tx + 2, ty + 1, T.cracks || T.soil); } }
      else tuft(p, tx, ty, T);
    }
    if (T.flower) { var flr = rng(91); for (var f = 0; f < 14; f++) { var fx2 = Math.round(flr() * W), fy2 = MY + 8 + Math.round(flr() * (H - MY - 10)); if (fx2 > 114 && fx2 < 240) continue; p.set(fx2, fy2 - 2, flr() > 0.6 ? T.flower2 : T.flower); p.vl(fx2, fy2 - 1, 2, T.folD); } }
    if (T.litter) { var lr = rng(43); for (var l = 0; l < 46; l++) p.set(Math.round(lr() * W), MY + 2 + Math.round(lr() * (H - MY - 3)), T.litter); }

    if (groundAdd > 0) {
      // foreground: a path across the bottom, coarser detail for depth
      var fgTop = MY + 62, pr = rng(59);
      p.rect(0, fgTop, W, H - fgTop, T.gNear);
      for (var bx0 = 0; bx0 < W; bx0++) if ((bx0 * 3) % 7 === 0) p.set(bx0, fgTop + 1 + (bx0 % 3), T.gDark);
      for (var wx = 0; wx < W; wx++) {
        var wob = Math.round(3 * Math.sin(wx / 27) + 2 * Math.sin(wx / 11));
        var py0 = fgTop + 30 + wob;
        p.rect(wx, py0, 1, 9, T.dirt);
        p.set(wx, py0, T.soil); p.set(wx, py0 + 8, T.soil);
        if ((wx + wob) % 5 === 0) p.set(wx, py0 + 3 + (wx % 4), T.soil);
        if ((wx * 3 + wob) % 11 === 0) p.set(wx, py0 + 2, T.rock);
      }
      for (var st = 0; st < 9; st++) {
        var sx = 18 + st * 42, sy = fgTop + 30 + Math.round(3 * Math.sin(sx / 27) + 2 * Math.sin(sx / 11));
        p.rect(sx, sy + 2, 6, 5, T.rock); p.set(sx, sy + 2, T.soil); p.set(sx + 5, sy + 6, T.soil);
      }
      for (var ft = 0; ft < 14; ft++) {
        var cx1 = Math.round(pr() * W), cy1 = fgTop + 5 + Math.round(pr() * 20);
        for (var cb = 0; cb < 3 + Math.round(pr() * 3); cb++) {
          var fx3 = cx1 + Math.round(pr() * 9) - 4, fy3 = cy1 + Math.round(pr() * 5) - 2;
          if (T.bare) p.hl(fx3, fy3, 5 + Math.round(pr() * 6), T.cracks || T.soil);
          else { tuft(p, fx3, fy3, T); p.set(fx3 + 1, fy3 - 3, T.tuft); }
        }
      }
      for (var fb = 0; fb < 15; fb++) {
        var bcx = Math.round(pr() * W), bcy = H - 4 - Math.round(pr() * 24);
        for (var bb = 0; bb < 3 + Math.round(pr() * 3); bb++) {
          var bx = bcx + Math.round(pr() * 11) - 5, by2 = bcy + Math.round(pr() * 6) - 3;
          if (T.bare) { p.hl(bx, by2, 6 + Math.round(pr() * 7), T.cracks || T.soil); p.set(bx + 3, by2 + 1, T.cracks || T.soil); }
          else {
            var bh = 7 + Math.round(pr() * 3);
            p.rect(bx, by2 - bh, 2, bh, T.gDark);
            p.set(bx + 2, by2 - bh + 2, T.gDark); p.set(bx - 1, by2 - bh + 4, T.gDark);
            p.vl(bx, by2 - bh - 2, 2, T.tuft); p.set(bx + 1, by2 - bh, T.tuft);
            p.set(bx + 2, by2 - bh - 1, T.tuft);
          }
        }
      }
      rock(p, 38, H - 8, 5, T); rock(p, 246, H - 14, 4, T); rock(p, 168, H - 5, 3, T); rock(p, 330, H - 11, 4, T);
      if (T.flower) { var ffr = rng(83); for (var ff = 0; ff < 16; ff++) { var ffx = Math.round(ffr() * W), ffy = fgTop + 8 + Math.round(ffr() * 18); p.set(ffx, ffy - 3, ffr() > 0.55 ? T.flower2 : T.flower); p.vl(ffx, ffy - 2, 3, T.folD); } }
      if (T.litter) { var lr2 = rng(67); for (var l2 = 0; l2 < 34; l2++) p.set(Math.round(lr2() * W), fgTop + Math.round(lr2() * (H - fgTop - 1)), T.litter); }
    }

    if (opts.character !== false) {
      var pose = POSES[opts.pose || 'idle'] || IDLE;
      var cxx = Math.round(opts.charX == null ? 60 : opts.charX);
      for (var sh = 0; sh < 12; sh++) p.set(cxx + 2 + sh, CHAR_BASE, T.gDark);
      sprite(p, pose, cxx, CHAR_BASE, CHAR[opts.who || 'boy']);
      if (opts.dog === true) {
        var dgx = cxx + (opts.dogX == null ? 20 : opts.dogX);
        for (var ds = 0; ds < 13; ds++) p.set(dgx + ds, CHAR_BASE, T.gDark);
        dog(p, dgx, CHAR_BASE, T, opts.dogSit !== false);
      }
    }
    return p;
  }

  /* ---------- paint ---------- */
  function paint(canvas, p, scale, ox, ow) {
    if (!canvas) return;
    ox = ox || 0; ow = ow || p.W;
    canvas.width = ow; canvas.height = p.H;
    canvas.style.width = (ow * scale) + 'px';
    canvas.style.height = (p.H * scale) + 'px';
    canvas.style.imageRendering = 'pixelated';
    var ctx = canvas.getContext('2d'), img = ctx.createImageData(ow, p.H), d = img.data, cache = {};
    for (var y = 0; y < p.H; y++) for (var x = 0; x < ow; x++) {
      var c = p.d[y * p.W + (x + ox)]; if (!c) continue;
      var v = cache[c]; if (!v) v = cache[c] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      var o = (y * ow + x) * 4;
      d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawWorld(canvas, o) {
    var viewW = o.viewW || 220, scale = o.scale || 2;
    var p = world(o.tier, o);
    var camX = Math.max(0, Math.min(WORLD_W - viewW, Math.round(o.camX == null ? 0 : o.camX)));
    paint(canvas, p, scale, camX, viewW);
  }
  function drawSprite(canvas, o) {
    var grid = POSES[o.pose || 'idle'] || IDLE, w = grid[0].length, h = grid.length;
    var p = new P(w + 2, h + 2);
    if (o.bg) p.rect(0, 0, w + 2, h + 2, o.bg);
    sprite(p, grid, 1, h + 1, CHAR[o.who] || CHAR.boy);
    paint(canvas, p, o.scale || 2);
  }

  function drawFauna(canvas, o) {
    o = o || {};
    var T = TIERS[o.tier || 'green'] || TIERS.green, scale = o.scale || 6, k = o.kind || 'dogSit';
    var W, H, p;
    if (k.indexOf('butterfly') === 0) {
      W = 7; H = 6; p = new P(W, H); if (o.bg) p.rect(0, 0, W, H, o.bg);
      butterfly(p, 2, 4, T, k !== 'butterflyFlat', o.warm !== false);
    } else if (k === 'buck' || k === 'doe') {
      var big = k === 'buck'; W = big ? 26 : 20; H = big ? 27 : 18;
      p = new P(W, H); if (o.bg) p.rect(0, 0, W, H, o.bg);
      deer(p, 2, H - 2, T, big, big);
    } else {
      W = 17; H = 15; p = new P(W, H); if (o.bg) p.rect(0, 0, W, H, o.bg);
      dog(p, 1, H - 2, T, k !== 'dogStand');
    }
    paint(canvas, p, scale);
  }

  function drawTile(canvas, tier, scale) {
    var T = TIERS[tier] || TIERS.green, p = new P(16, 16);
    p.rect(0, 0, 16, 16, T.sky);
    p.rect(0, 11, 16, 5, T.gNear); p.hl(0, 11, 16, T.gEdge);
    p.set(2, 14, T.gDark); p.set(9, 13, T.gDark); p.set(14, 15, T.gDark);
    conifer(p, 5, 12, 11, 8, T);
    if (tier === 'bloom') { p.set(11, 10, T.flower); p.set(13, 10, T.flower2); p.vl(11, 10, 2, T.folD); p.vl(13, 10, 2, T.folD); p.set(12, 11, T.folM); }
    else if (tier === 'green') bushy(p, 12, 12, 7, 7, T);
    else if (tier === 'autumn') { bushy(p, 12, 12, 7, 7, T); p.set(10, 13, T.litter); p.set(14, 14, T.litter); }
    else { bareThin(p, 12, 12, 8, T); p.hl(9, 14, 4, T.cracks); }
    paint(canvas, p, scale || 2);
  }

  function drawAppTile(canvas, o) {
    var p = new P(16, 16), k = o.kind || 'book', i, x, y;
    var body = o.on ? PAL.wall : '#D8DCD2', edge = PAL.ink, mark = o.on ? PAL.woodDark : '#6E7A72';
    p.rect(0, 0, 16, 16, edge);
    p.rect(1, 1, 14, 14, body);
    p.rect(2, 0, 12, 1, null); p.rect(2, 15, 12, 1, null); p.rect(0, 2, 1, 12, null); p.rect(15, 2, 1, 12, null);
    p.set(1, 1, edge); p.set(14, 1, edge); p.set(1, 14, edge); p.set(14, 14, edge);
    p.rect(2, 1, 12, 1, edge); p.rect(2, 14, 12, 1, edge); p.rect(1, 2, 1, 12, edge); p.rect(14, 2, 1, 12, edge);
    p.rect(2, 2, 12, 12, body);
    if (k === 'book') { p.rect(3, 3, 10, 10, mark); p.rect(4, 4, 3, 8, body); p.rect(9, 4, 3, 8, body); }
    else if (k === 'note') { p.rect(4, 2, 8, 12, mark); for (i = 0; i < 4; i++) p.hl(6, 5 + i * 2, 4, body); }
    else if (k === 'calc') { p.rect(3, 3, 10, 10, mark); for (y = 0; y < 3; y++) for (x = 0; x < 3; x++) p.rect(4 + x * 3, 4 + y * 3, 2, 2, body); }
    else if (k === 'docs') { p.rect(3, 2, 9, 12, mark); p.rect(9, 2, 3, 3, body); for (i = 0; i < 3; i++) p.hl(5, 7 + i * 2, 5, body); }
    else if (k === 'camera') { p.rect(2, 5, 12, 8, mark); p.rect(6, 3, 4, 2, mark); p.disc(8, 9, 3, body); p.disc(8, 9, 1, mark); }
    else if (k === 'music') { p.disc(5, 11, 2, mark); p.rect(7, 4, 2, 8, mark); p.rect(7, 3, 5, 2, mark); }
    else if (k === 'browser') { p.disc(8, 8, 6, mark); p.disc(8, 8, 4, body); p.vl(8, 3, 11, mark); p.hl(3, 8, 11, mark); }
    else if (k === 'maps') { p.disc(8, 6, 4, mark); p.rect(7, 9, 2, 5, mark); p.disc(8, 6, 1, body); }
    else if (k === 'video') { p.rect(2, 4, 9, 8, mark); for (i = 0; i < 3; i++) { p.rect(12, 5 + i, 2, 1, mark); p.rect(12, 10 - i, 2, 1, mark); } }
    else if (k === 'gear') { p.disc(8, 8, 6, mark); p.disc(8, 8, 3, body); p.rect(7, 1, 2, 3, mark); p.rect(7, 12, 2, 3, mark); p.rect(1, 7, 3, 2, mark); p.rect(12, 7, 3, 2, mark); }
    else p.rect(4, 4, 8, 8, mark);
    paint(canvas, p, o.scale || 2);
  }

  /* ---------- 16x16 nav bar icons ---------- */
  // 'profile' and the sprout half of 'home' reuse the Design System's own
  // glyph() drawings (and its G palette) instead of a separate one-off
  // palette, so all three tabs read as one family. Nothing here recolors by
  // `active` -- in the source design that's carried by the surrounding tab
  // (label color/background), not the icon itself.
  function navIcon(kind, o) {
    o = o || {};
    if (kind === 'profile') return glyph('person');

    var p = new P(16, 16), ink = PAL.ink;
    if (o.bg !== null) p.rect(0, 0, 16, 16, o.bg || null);

    if (kind === 'leaderboard') {
      // gold trophy: goblet-shaped cup (narrow rim, wide bowl, narrow neck)
      // with bracket handles held apart from the body, wood stem and base
      p.hl(7, 2, 3, G.fire);
      p.hl(5, 3, 7, G.fire); p.hl(5, 4, 7, G.fire);
      p.hl(6, 5, 5, G.fire);
      p.hl(7, 6, 3, G.fire);
      p.rect(6, 3, 2, 2, G.hot);
      p.vl(2, 3, 3, ink); p.set(3, 2, ink); p.set(3, 6, ink);
      p.vl(14, 3, 3, ink); p.set(13, 2, ink); p.set(13, 6, ink);
      p.rect(7, 7, 3, 2, G.wood);
      p.hl(7, 9, 3, G.wood); p.hl(5, 10, 7, G.wood); p.hl(4, 11, 9, G.wood);
      p.hl(3, 12, 11, ink);
    } else if (kind === 'admin') {
      // wizard hat: black cone with a bent, gold-tipped point, a gold
      // ribbon band with a buckle, and a wide flat brim
      for (var wy = 2; wy <= 7; wy++) {
        var wh = Math.floor((wy - 2) / 2), wx0 = 8 - wh, wx1 = 8 + wh;
        p.hl(wx0, wy, wx1 - wx0 + 1, ink);
      }
      p.set(8, 0, G.hot); p.set(6, 1, ink); p.set(7, 1, ink); p.set(7, 2, ink);
      p.hl(5, 8, 7, G.hot); p.hl(5, 9, 7, G.hot); p.set(8, 8, ink);
      p.hl(4, 10, 9, ink);
      p.rect(1, 11, 14, 2, ink);
    } else {
      // 'home' (default): the sprout glyph's ground/soil strip, a small
      // house on it, and a little sprout beside the house -- "garden with a
      // house added to it".
      p.rect(0, 13, 16, 3, G.soil); p.hl(0, 13, 16, G.soilD);
      for (var hy = 2; hy <= 6; hy++) {
        var half = hy - 2, hx0 = 6 - half, hx1 = 6 + half;
        p.hl(hx0, hy, hx1 - hx0 + 1, G.wood);
      }
      p.set(6, 1, ink);
      p.hl(2, 7, 9, ink);
      p.rect(3, 7, 7, 5, G.woodL);
      p.vl(3, 7, 5, ink); p.vl(9, 7, 5, ink); p.hl(3, 11, 7, ink);
      p.rect(5, 9, 2, 3, G.wood);
      p.vl(13, 8, 5, G.leafD);
      p.rect(12, 9, 2, 1, G.leaf);
      p.set(14, 7, G.leafL);
    }
    return p;
  }
  function drawNavIcon(canvas, o) {
    o = o || {};
    paint(canvas, navIcon(o.kind, o), o.scale || 2);
  }

  /* ---------- leaderboard plot: one member, one bed, height = clean days ---------- */
  function plot(days, tier, o) {
    o = o || {};
    var T = TIERS[tier] || TIERS.green, W = o.w || 32, H = o.h || 78, p = new P(W, H);
    var baseY = H - 10, cx = W >> 1, d = Math.max(0, days | 0), i;

    p.rect(0, baseY, W, 10, T.dirt);
    p.hl(0, baseY, W, T.soil);
    p.hl(0, H - 1, W, T.soil);
    for (i = 1; i < W; i += 5) { p.set(i, baseY + 3, T.soil); p.set(i + 2, baseY + 6, T.soil); }
    p.vl(0, baseY, 10, T.soil);

    if (d === 0) {
      p.hl(3, baseY + 4, 7, T.cracks || T.soil);
      p.hl(W - 12, baseY + 7, 8, T.cracks || T.soil);
      p.rect(cx - 2, baseY - 4, 5, 4, T.trunkD);
      p.hl(cx - 2, baseY - 4, 5, T.trunk);
      p.vl(cx - 3, baseY - 4, 4, T.out); p.vl(cx + 3, baseY - 4, 4, T.out);
    } else if (d <= 2) {
      var sh = 7 + d * 5;
      p.vl(cx, baseY - sh, sh, T.folD);
      p.rect(cx - 4, baseY - sh + 1, 4, 2, T.folM);
      p.rect(cx + 1, baseY - sh + 4, 4, 2, T.folM);
      p.set(cx - 1, baseY - sh - 1, T.folM); p.set(cx, baseY - sh - 2, T.folL);
    } else if (d <= 5) {
      bushy(p, cx, baseY, 15 + (d - 2) * 5, 15 + (d - 3) * 3, T);
    } else {
      var h = Math.min(H - 16, 30 + Math.round((d - 5) * 3.4));
      conifer(p, cx, baseY, h, Math.min(W - 6, 18 + Math.round((d - 5) * 0.9)), T);
    }
    if (!T.bare && d > 0) { for (i = 2; i < W - 2; i += 7) tuft(p, i, baseY - 1, T); }
    if (T.flower && d >= 10) {
      p.rect(3, baseY - 4, 2, 2, T.flower2); p.vl(3, baseY - 2, 2, T.folD);
      p.rect(W - 6, baseY - 5, 2, 2, T.flower); p.vl(W - 6, baseY - 3, 3, T.folD);
    }
    return p;
  }
  function drawPlot(canvas, o) { o = o || {}; paint(canvas, plot(o.days, o.tier, o), o.scale || 2); }

  /* ---------- horizontal bed: one plant per clean day ---------- */
  function bedRow(days, tier, o) {
    o = o || {};
    var T = TIERS[tier] || TIERS.green, slots = o.slots || 14, cell = o.cell || 10;
    var W = slots * cell, H = o.h || 24, p = new P(W, H), baseY = H - 6, i, j;
    p.rect(0, baseY, W, 6, T.dirt);
    p.hl(0, baseY, W, T.soil);
    p.hl(0, H - 1, W, T.soil);
    for (i = 0; i < slots; i++) {
      var x = i * cell + (cell >> 1);
      p.vl(i * cell, baseY, 6, T.soil);
      if (i >= days) { p.set(x, baseY + 2, T.soil); p.set(x + 2, baseY + 4, T.soil); continue; }
      var h = Math.min(H - 8, 8 + ((i * 5) % 4) + (i % 3));
      p.vl(x, baseY - h, h, T.folD);
      p.rect(x - 3, baseY - h + 2, 3, 2, T.folM);
      p.rect(x + 1, baseY - h + 5, 3, 2, T.folM);
      p.set(x - 1, baseY - h - 1, T.folM);
      p.set(x, baseY - h - 2, T.folL);
      if (T.flower && i % 3 === 0) p.set(x, baseY - h - 3, i % 2 ? T.flower2 : T.flower);
      if (T.bare) { p.vl(x, baseY - h, h, T.out); p.set(x - 1, baseY - h + 3, T.out); p.set(x + 1, baseY - h + 6, T.out); }
    }
    return p;
  }
  function drawBed(canvas, o) { o = o || {}; paint(canvas, bedRow(o.days, o.tier, o), o.scale || 2); }

  /* ---------- 16x16 glyphs ---------- */
  var G = { soil: '#6B5644', soilD: '#5E4B3C', leaf: '#7C9A8A', leafL: '#A8C0AC', leafD: '#5A7A6C',
            ink: PAL.ink, stone: PAL.stone, stoneD: '#ADA8A1', wall: PAL.wall, wood: PAL.woodMid,
            woodL: PAL.woodLight, fire: PAL.fire, hot: PAL.fireHot, skin: PAL.skin, hair: '#5E3D24',
            teal: '#6E9691', tealD: '#4E6E6A', alert: PAL.alert, water: PAL.water, ridge: '#B3C7C0', ridgeD: '#A2B8B0' };

  function glyph(kind) {
    var p = new P(16, 16), i;
    if (kind === 'sprout') {
      p.rect(0, 12, 16, 4, G.soil); p.hl(0, 12, 16, G.soilD);
      p.set(3, 14, G.soilD); p.set(11, 15, G.soilD);
      p.vl(8, 4, 8, G.leafD);
      p.rect(4, 6, 4, 2, G.leaf); p.set(3, 7, G.leaf);
      p.rect(9, 8, 4, 2, G.leafL); p.set(13, 9, G.leafL);
      p.set(7, 4, G.leafL); p.set(9, 4, G.leaf); p.set(8, 3, G.leafL);
    } else if (kind === 'lantern') {
      p.set(8, 0, G.ink); p.hl(7, 1, 3, G.ink);
      p.rect(4, 2, 8, 2, G.ink); p.rect(4, 13, 8, 2, G.ink);
      p.rect(4, 4, 8, 9, G.hot); p.vl(4, 4, 9, G.ink); p.vl(11, 4, 9, G.ink);
      p.rect(6, 7, 4, 5, G.fire); p.rect(7, 9, 2, 3, G.hot); p.set(8, 6, G.fire);
    } else if (kind === 'peak') {
      for (i = 0; i < 8; i++) { p.hl(7 - i, 3 + i, i * 2 + 1, G.ridge); p.hl(8, 3 + i, i + 1, G.ridgeD); }
      p.set(7, 3, G.wall); p.hl(6, 4, 3, G.wall); p.hl(6, 5, 4, G.wall);
      p.hl(0, 11, 16, G.leafD);
      p.vl(13, 1, 6, G.ink); p.rect(10, 1, 3, 2, G.alert);
    } else if (kind === 'hearth') {
      p.rect(1, 1, 14, 2, G.wood); p.hl(1, 1, 14, G.ink);
      p.rect(2, 3, 12, 12, G.stone); p.vl(2, 3, 12, G.ink); p.vl(13, 3, 12, G.ink);
      for (i = 5; i < 15; i += 3) p.hl(3, i, 10, G.stoneD);
      p.rect(5, 7, 6, 8, G.ink);
      p.rect(6, 10, 4, 5, G.fire); p.rect(7, 12, 2, 3, G.hot); p.set(8, 9, G.hot);
    } else if (kind === 'cog') {
      p.rect(6, 0, 4, 3, G.ink); p.rect(6, 13, 4, 3, G.ink);
      p.rect(0, 6, 3, 4, G.ink); p.rect(13, 6, 3, 4, G.ink);
      p.rect(2, 2, 3, 3, G.ink); p.rect(11, 2, 3, 3, G.ink);
      p.rect(2, 11, 3, 3, G.ink); p.rect(11, 11, 3, 3, G.ink);
      p.disc(8, 8, 6, G.ink); p.disc(8, 8, 4, G.wall); p.disc(8, 8, 2, G.ink);
    } else if (kind === 'clock') {
      p.disc(8, 8, 7, G.ink); p.disc(8, 8, 6, G.wall);
      p.vl(8, 4, 5, G.ink); p.hl(8, 8, 4, G.ink);
      p.set(8, 2, G.ink); p.set(8, 14, G.ink); p.set(2, 8, G.ink); p.set(14, 8, G.ink);
    } else if (kind === 'key') {
      p.disc(4, 8, 4, G.ink); p.disc(4, 8, 2, G.woodL);
      p.rect(7, 7, 8, 2, G.wood); p.hl(7, 7, 8, G.ink); p.hl(7, 9, 8, G.ink);
      p.rect(11, 9, 2, 3, G.wood); p.rect(14, 9, 1, 3, G.wood); p.set(11, 12, G.ink); p.set(14, 12, G.ink);
    } else if (kind === 'person') {
      p.disc(8, 5, 3, G.skin); p.rect(5, 1, 7, 3, G.hair); p.set(5, 4, G.hair); p.set(11, 4, G.hair);
      p.rect(4, 9, 9, 7, G.teal); p.hl(4, 9, 9, G.tealD); p.vl(4, 9, 7, G.tealD);
      p.set(8, 8, G.skin);
    } else if (kind === 'people') {
      p.disc(4, 6, 2, G.skin); p.rect(1, 9, 7, 7, G.leaf); p.hl(1, 9, 7, G.leafD);
      p.disc(11, 4, 3, G.skin); p.rect(8, 8, 7, 8, G.teal); p.hl(8, 8, 7, G.tealD);
    } else if (kind === 'globe') {
      p.disc(8, 8, 7, G.ink); p.disc(8, 8, 6, G.water);
      p.vl(8, 2, 13, G.tealD); p.hl(2, 8, 13, G.tealD);
      p.rect(4, 5, 3, 2, G.leaf); p.rect(10, 9, 3, 2, G.leaf); p.rect(6, 11, 2, 2, G.leaf);
    } else if (kind === 'door') {
      p.rect(2, 1, 9, 15, G.wood); p.vl(2, 1, 15, G.ink); p.hl(2, 1, 9, G.ink); p.vl(10, 1, 15, G.ink);
      p.rect(3, 2, 7, 13, G.woodL); p.set(8, 8, G.ink);
      p.rect(11, 7, 5, 2, G.ink); p.set(13, 5, G.ink); p.set(14, 6, G.ink); p.set(13, 11, G.ink); p.set(14, 10, G.ink);
    } else if (kind === 'bell') {
      p.set(8, 1, G.ink); p.disc(8, 8, 5, G.ink); p.disc(8, 8, 4, G.woodL);
      p.rect(3, 12, 11, 2, G.ink); p.rect(7, 14, 3, 2, G.ink);
    } else if (kind === 'check') {
      for (i = 0; i < 4; i++) { p.set(2 + i, 8 + i, G.ink); p.set(2 + i, 9 + i, G.ink); }
      for (i = 0; i < 10; i++) { p.set(6 + i, 11 - i, G.ink); p.set(6 + i, 12 - i, G.ink); }
    } else p.rect(3, 3, 10, 10, G.ink);
    return p;
  }
  function drawGlyph(canvas, o) { o = o || {}; paint(canvas, glyph(o.kind), o.scale || 2); }

  /* ---------- 16x16 member portrait ---------- */
  var AVA = [
    {bg:'#CBDFD6', skin:'#E8C39A', skinD:'#C39A72', hair:'#3B2A22', shirt:'#7C9A8A', style:'short'},
    {bg:'#EAE2D4', skin:'#D9A97C', skinD:'#B0835C', hair:'#6B4A2F', shirt:'#E4695E', style:'long'},
    {bg:'#DDE3DA', skin:'#F0D3B0', skinD:'#C9A985', hair:'#A88B4A', shirt:'#5A7A6C', style:'short'},
    {bg:'#C6D6CD', skin:'#C08A5E', skinD:'#98673F', hair:'#1E2E28', shirt:'#C89457', style:'long'},
    {bg:'#E7DFD0', skin:'#E8C39A', skinD:'#C39A72', hair:'#9A6156', shirt:'#6E9691', style:'cap'},
    {bg:'#D6DFD8', skin:'#D9A97C', skinD:'#B0835C', hair:'#5E3D24', shirt:'#93B5B0', style:'short'},
    {bg:'#EDE4D8', skin:'#F0D3B0', skinD:'#C9A985', hair:'#C97F3D', shirt:'#9A6634', style:'long'},
    {bg:'#CFDAD3', skin:'#B5794E', skinD:'#8C5A36', hair:'#3B2A22', shirt:'#A8C0AC', style:'cap'}
  ];
  function avatar(v, o) {
    o = o || {};
    var a = AVA[((v | 0) % AVA.length + AVA.length) % AVA.length], p = new P(16, 16);
    p.rect(0, 0, 16, 16, o.bg === null ? null : (o.bg || a.bg));
    p.rect(3, 13, 10, 3, PAL.ink);
    p.rect(4, 14, 8, 2, a.shirt);
    p.disc(8, 8, 5, PAL.ink);
    p.disc(8, 8, 4, a.skin);
    p.hl(7, 4, 3, a.hair); p.hl(5, 5, 7, a.hair);
    if (a.style === 'cap') { p.hl(4, 5, 9, a.hair); p.hl(5, 6, 7, a.hair); }
    else { p.hl(5, 6, 7, a.hair); }
    if (a.style === 'long') {
      p.vl(4, 7, 4, a.hair); p.vl(12, 7, 4, a.hair);
      p.vl(5, 7, 2, a.hair); p.vl(11, 7, 2, a.hair);
    }
    p.set(6, 8, PAL.ink); p.set(10, 8, PAL.ink);
    p.hl(7, 10, 2, a.skinD);
    p.set(5, 9, a.skinD); p.set(11, 9, a.skinD);
    return p;
  }
  function drawAvatar(canvas, o) { o = o || {}; paint(canvas, avatar(o.v || 0, o), o.scale || 2); }

export const PixelWorld = {
  PAL: PAL, TIERS: TIERS, WORLD_W: WORLD_W, WORLD_H: WORLD_H, GY: GY, MY: MY,
  world: world, paint: paint, drawWorld: drawWorld, drawSprite: drawSprite, drawFauna: drawFauna,
  drawTile: drawTile, drawAppTile: drawAppTile, drawNavIcon: drawNavIcon,
  plot: plot, drawPlot: drawPlot, bedRow: bedRow, drawBed: drawBed, glyph: glyph, drawGlyph: drawGlyph,
  avatar: avatar, drawAvatar: drawAvatar,
  P: P, sprite: sprite, POSES: POSES, CHAR: CHAR
};

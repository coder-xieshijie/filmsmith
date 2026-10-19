// text.mjs — text lines found in a rendered frame, from pixels only (no DOM, no canvas hooks), so canvas
// text is measured the same way as DOM text.
//
// Method: background = most common luma around each 64 px tile; ink = pixels at least 45 grey levels away from
// it; 4-connected components of ink; components of glyph size grouped into lines when they sit side by
// side at similar heights, then words on one baseline joined. A line's type size is estimated from its
// tallest ordinary glyph (≈ cap or ascender height ≈ 0.73 em); a line in lowercase without ascenders
// reads small (x-height). Its contrast is WCAG contrast between the extreme 2 % of
// its ink (the stroke core) and the median of the non-ink pixels around it.
//
// Limits: graphics with glyph-like parts (icons, tick labels, chart marks) can read as text; a single
// large glyph (one numeral) is not a line and is skipped; text knocked out of a filled panel smaller
// than about 320 px is not found; text on gradients or photos splits badly;
// estimated sizes are within about ±15 %. Treat results as INFO and check flagged lines by eye.

const W = 1920, H = 1080, TILE = 64, INK = 45;
const lin = Float64Array.from({ length: 256 }, (_, v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });

export const findLines = (rgb, mask = [0, 0, W, H]) => {
  const [mx, my, mw, mh] = mask.map(Math.round);
  const x0 = Math.max(0, mx), y0 = Math.max(0, my), x1 = Math.min(W, mx + mw), y1 = Math.min(H, my + mh);
  const Y = new Uint8Array(W * H), L = new Float32Array(W * H);
  for (let i = 0, j = 0; i < W * H; i++, j += 3) {
    const r = rgb[j], g = rgb[j + 1], b = rgb[j + 2];
    Y[i] = (54 * r + 183 * g + 19 * b) >> 8;
    L[i] = 0.2126 * lin[r] + 0.7152 * lin[g] + 0.0722 * lin[b];
  }
  // Background per tile: the most common luma (4-level bins) over the 5 × 5 tiles around it (320 px),
  // so the strokes of large type never outvote the paper behind them.
  const tx = Math.ceil(W / TILE), ty = Math.ceil(H / TILE), bg = new Uint8Array(tx * ty);
  const hist = new Uint32Array(tx * ty * 64);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) hist[(((y / TILE) | 0) * tx + ((x / TILE) | 0)) * 64 + (Y[y * W + x] >> 2)]++;
  const sum = new Uint32Array(64);
  for (let a = 0; a < ty; a++) for (let c = 0; c < tx; c++) {
    sum.fill(0);
    for (let aa = Math.max(0, a - 2); aa <= Math.min(ty - 1, a + 2); aa++) for (let cc = Math.max(0, c - 2); cc <= Math.min(tx - 1, c + 2); cc++) {
      const o = (aa * tx + cc) * 64;
      for (let k = 0; k < 64; k++) sum[k] += hist[o + k];
    }
    let best = 0;
    for (let k = 1; k < 64; k++) if (sum[k] > sum[best]) best = k;
    bg[a * tx + c] = best * 4 + 2;
  }
  const ink = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * W + x;
    if (Math.abs(Y[i] - bg[((y / TILE) | 0) * tx + ((x / TILE) | 0)]) >= INK) ink[i] = 1;
  }
  // 4-connected components.
  const label = new Int32Array(W * H), stack = new Int32Array(W * H), comps = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const s = y * W + x;
    if (!ink[s] || label[s]) continue;
    const id = comps.length + 1;
    let sp = 0, area = 0, ax = x, bx = x, ay = y, by = y;
    stack[sp++] = s; label[s] = id;
    while (sp) {
      const p = stack[--sp], px = p % W, py = (p / W) | 0;
      area++;
      if (px < ax) ax = px; if (px > bx) bx = px; if (py < ay) ay = py; if (py > by) by = py;
      if (px > x0 && ink[p - 1] && !label[p - 1]) { label[p - 1] = id; stack[sp++] = p - 1; }
      if (px < x1 - 1 && ink[p + 1] && !label[p + 1]) { label[p + 1] = id; stack[sp++] = p + 1; }
      if (py > y0 && ink[p - W] && !label[p - W]) { label[p - W] = id; stack[sp++] = p - W; }
      if (py < y1 - 1 && ink[p + W] && !label[p + W]) { label[p + W] = id; stack[sp++] = p + W; }
    }
    comps.push({ id, x: ax, y: ay, w: bx - ax + 1, h: by - ay + 1, area });
  }
  // Glyph-sized components.
  // Glyph-sized components; solid blocks (panels, bars, filled boxes) are not glyphs.
  const glyphs = comps.filter((c) => {
    const fill = c.area / (c.w * c.h);
    // Solid squares and dots (chart marks, unit squares) are not glyphs at any size.
    const solid = fill > 0.85 && (c.h > 12 ? c.w > 0.6 * c.h : c.w > 0.7 * c.h && c.w < 1.4 * c.h);
    return c.h >= 7 && c.h <= 400 && c.w <= Math.max(8 * c.h, 40) && c.w <= 900 && fill >= 0.08 && c.area >= 12 && !solid;
  });
  glyphs.sort((a, b) => a.x - b.x);
  // Union glyphs that sit side by side at similar heights.
  const parent = glyphs.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  for (let i = 0; i < glyphs.length; i++) {
    const a = glyphs[i];
    for (let j = i + 1; j < glyphs.length; j++) {
      const b = glyphs[j];
      const gap = b.x - (a.x + a.w), big = Math.max(a.h, b.h), small = Math.min(a.h, b.h);
      if (b.x > a.x + a.w + 360) break; // sorted by x: nothing further can join
      if (gap > 0.9 * big) continue;
      if (big / small > 2.6) continue;
      const overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (overlap < 0.4 * small) continue;
      parent[find(j)] = find(i);
    }
  }
  const groups = new Map();
  glyphs.forEach((g, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(g); });
  // Words on one baseline join into one line (word gaps can exceed the glyph gap above), so a word
  // without ascenders ("errors") is sized together with its neighbours, not by its x-height.
  const box = (gs) => ({ gs, x: Math.min(...gs.map((g) => g.x)), r: Math.max(...gs.map((g) => g.x + g.w)), top: Math.min(...gs.map((g) => g.y)), bottom: Math.max(...gs.map((g) => g.y + g.h)), h: Math.max(...gs.map((g) => g.h)) });
  let words = [...groups.values()].map(box).sort((a, b) => a.x - b.x);
  for (let merged = true; merged;) {
    merged = false;
    for (let i = 0; i < words.length && !merged; i++) for (let j = i + 1; j < words.length; j++) {
      const a = words[i], b = words[j], big = Math.max(a.h, b.h);
      if (b.x - a.r > 1.5 * big || a.x - b.r > 1.5 * big) continue;
      if (Math.abs(a.bottom - b.bottom) > 0.25 * big || Math.max(a.h, b.h) / Math.min(a.h, b.h) > 2.2) continue;
      words[i] = box([...a.gs, ...b.gs]); words.splice(j, 1); merged = true; break;
    }
  }
  const lines = [];
  for (const { gs } of words) {
    if (gs.length < 3) continue;
    // Not text: a row of near-solid shapes (cells, bars), or specks without a common baseline.
    const fills = gs.map((g) => g.area / (g.w * g.h)).sort((a, b) => a - b);
    if (fills[Math.floor(fills.length / 2)] > 0.78) continue; // strokes of type rarely fill 78 % of their box
    const cv = (v) => { const m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length) / m; };
    if (gs.length >= 6 && cv(gs.map((g) => g.w)) < 0.08 && cv(gs.map((g) => g.h)) < 0.08) continue; // a row of identical marks
    const hs = gs.map((g) => g.h).sort((a, b) => a - b), med = hs[Math.floor(hs.length / 2)];
    const bottoms = gs.map((g) => g.y + g.h).sort((a, b) => a - b), base = bottoms[Math.floor(bottoms.length / 2)];
    if (gs.filter((g) => Math.abs(g.y + g.h - base) <= Math.max(2, 0.15 * med)).length < 0.6 * gs.length) continue;
    // Cap / ascender height: the tallest glyph that is not an outlier (brackets, merged pieces).
    const cap = Math.max(...hs.filter((h) => h <= 1.6 * med));
    const lx = Math.min(...gs.map((g) => g.x)), ly = Math.min(...gs.map((g) => g.y));
    const rx = Math.max(...gs.map((g) => g.x + g.w)), ry = Math.max(...gs.map((g) => g.y + g.h));
    if (rx - lx < 1.5 * cap) continue;
    // Contrast: stroke core against the surrounding background.
    const ids = new Set(gs.map((g) => g.id)), tl = [], bl = [];
    const pad = Math.round(0.3 * cap), X0 = Math.max(0, lx - pad), X1 = Math.min(W, rx + pad), Y0 = Math.max(0, ly - pad), Y1 = Math.min(H, ry + pad);
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) { const i = y * W + x; if (ids.has(label[i])) tl.push(L[i]); else if (!ink[i]) bl.push(L[i]); }
    if (tl.length < 20 || bl.length < 20) continue;
    tl.sort((a, b) => a - b); bl.sort((a, b) => a - b);
    const lb = bl[Math.floor(bl.length / 2)], lighter = tl[Math.floor(tl.length / 2)] > lb;
    const lt = lighter ? tl[Math.floor(0.98 * (tl.length - 1))] : tl[Math.floor(0.02 * (tl.length - 1))];
    const cr = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
    lines.push({ x: lx, y: ly, w: rx - lx, h: ry - ly, glyphs: gs.length, cap, px: Math.round(cap / 0.73), cr: Number(cr.toFixed(2)) });
  }
  return lines.sort((a, b) => a.y - b.y || a.x - b.x);
};

// Size levels: sizes within 15 % of the smallest size of a level belong to it (clarity check, draft).
export const levels = (sizes) => {
  const s = [...sizes].sort((a, b) => a - b), out = [];
  for (const v of s) { const last = out.at(-1); if (last && v / last[0] <= 1.15) last.push(v); else out.push([v]); }
  return out;
};

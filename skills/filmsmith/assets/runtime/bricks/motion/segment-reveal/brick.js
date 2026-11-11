// segment-reveal — a word is cut into a dozen or more separate pieces that light up in a shuffled order; it cannot be
// read until the last key pieces land, and on the last one the whole word surges to full light.
// Adapted from video-shotcraft demos/opening/stroke-segment-build/StrokeSegmentBuild.tsx (card references/shots/opening/stroke-segment-build.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the pieces are cut from the film's own font
// (each grapheme split by slanted, seeded cuts into cells, each cell's ink one piece with a gap at its edges) instead of
// sixteen hand-drawn neon tubes for one brand word, so any word in either language works; the key pieces (the last
// three) are the inked middle-row cells, where crossbars and spines sit; the tube colour, glow and white-hot core are
// the accent, the accent screened and the accent mixed with white; the wall, floor, reflection and the subtitle are
// the scene's; brand and demo copy removed.
import { clamp, mix, rgba, ground, canvasOf, fontOf, measure } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

// Upstream timing (frames at 30 fps): first piece at 12, the others spread over 60 frames thinning out (ease-out
// stagger), a held breath, the three keys 7 and 6 frames apart, the reveal 6 frames after the last key, a surge.
const T = { first: 12, span: 60, keys: [86, 93, 99], strike: 7, frames: 128 };
const STRIKE = [[0, 0], [1, 1], [2, 0.12], [3, 0.95], [4, 0.4], [5, 1], [7, 0.58]];   // lit — off — lit — half — lit, then 0.58
const strikeAt = (f, s) => { const k = f - s; if (k <= 0) return 0; for (let i = 1; i < STRIKE.length; i++) { const [k1, v1] = STRIKE[i], [k0, v0] = STRIKE[i - 1]; if (k <= k1) return v0 + ((k - k0) / (k1 - k0)) * (v1 - v0); } return 0.58; };
const hum = (f, i) => 1 + 0.035 * Math.sin(f * 0.9 + i * 2.3) * Math.sin(f * 0.37 + i);
const surgeAt = (f, r) => (f <= r ? 0 : f <= r + 3 ? EASE.out((f - r) / 3) : 1 - EASE.out(clamp((f - r - 3) / 19)));

// The cut lines of one grapheme box: columns x = c + k (y − ym), rows y = r + m (x − xm); the outer lines run far out.
const cutsOf = (i, box, cols, rows, seed) => {
  const [x0, y0, x1, y1] = box, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0;
  const col = [{ c: x0 - (i ? 0 : 400), k: 0 }];
  for (let a = 1; a < cols; a++) col.push({ c: x0 + w * (a / cols + (hash(i * 31 + a, seed) - 0.5) * 0.24 / cols * 2), k: (hash(i * 37 + a, seed + 3) - 0.5) * 0.36 });
  col.push({ c: x1, k: 0 });
  const row = [{ r: y0 - 400, m: 0 }];
  for (let b = 1; b < rows; b++) row.push({ r: y0 + h * (b / rows + (hash(i * 41 + b, seed + 5) - 0.5) * 0.12), m: (hash(i * 43 + b, seed + 7) - 0.5) * 0.24 });
  row.push({ r: y1 + 400, m: 0 });
  return { col, row, xm, ym };
};
const meet = (cl, rw, xm, ym) => { const x = (cl.c + cl.k * (rw.r - rw.m * xm - ym)) / (1 - cl.k * rw.m); return [x, rw.r + rw.m * (x - xm)]; };

export default {
  id: 'segment-reveal', kind: 'motion',
  tier: 'T3', family: 'mask-type', beats: T.frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'accent'],
  from: 'the dark ground (the word not yet there)',
  to: 'the word fully lit, settled',
  interpolates: ['pieces lit one by one in a shuffled order, sparse to dense (neon strike flicker, then half light)', 'a held breath, then the three key pieces on the beat', 'the reveal: every piece half → full light with one surge', 'the light on the ground behind, by the share of pieces lit', 'a slow push 1 → 1.035'],
  summary: 'A word is cut into separate pieces that light up in a shuffled order; it reads only when the last key pieces land, and then the whole word surges to full light.',
  theory: 'Recognition is the hook: a figure with its diagnostic parts missing is not recognised, and is recognised at once when they arrive (recognition by components, Biederman 1987); delaying the key strokes holds the viewer in an open question until the reveal (the title sequence of Alien, 1979).',
  defaults: (ctx) => ({ text: copy('steps', ctx.lang)[3], size: ctx.lang === 'zh' ? 320 : 360, weight: 700, y: null, cuts: ctx.lang === 'zh' ? [3, 3] : [2, 3], gap: 4, push: 0.035, glow: 1, seed: 3 }),
  prepare(P) {
    const look = P.look || NEUTRAL, f = fontFor(look, 'display', P.lang, P.size, P.weight, 'display');
    const g = graphemes(P.text), c = P.colors, sc = canvasOf(16, 16).getContext('2d', { willReadFrequently: true });
    const total = measure(sc, P.text, f).width, x0 = 960 - total / 2;
    const xs = g.map((_, i) => x0 + measure(sc, g.slice(0, i).join(''), f).width).concat(x0 + total);
    const mt = measure(sc, P.text, f), base = P.y ?? 540 + (mt.actualBoundingBoxAscent - mt.actualBoundingBoxDescent) / 2;
    const top = base - mt.actualBoundingBoxAscent, bot = base + mt.actualBoundingBoxDescent;
    // the ink of the whole word, once
    const mask = canvasOf(1920, 1080), mc = mask.getContext('2d', { willReadFrequently: true });
    mc.font = fontOf(f); if ('letterSpacing' in mc) mc.letterSpacing = `${f.spacing ?? 0}px`; mc.fillStyle = '#ffffff'; mc.textBaseline = 'alphabetic';
    mc.fillText(P.text, x0, base);
    const bx0 = Math.max(0, Math.floor(x0 - 60)), bx1 = Math.min(1920, Math.ceil(x0 + total + 60)), by0 = Math.max(0, Math.floor(top - 20)), by1 = Math.min(1080, Math.ceil(bot + 20));
    const ink = mc.getImageData(bx0, by0, bx1 - bx0, by1 - by0).data;
    // cells: per grapheme a cols × rows grid of slanted cuts
    const [cols, rows] = P.cuts, cells = [];
    g.forEach((ch, i) => {
      if (/\s/.test(ch)) return;
      const { col, row, xm, ym } = cutsOf(i, [xs[i], top, xs[i + 1], bot], cols, rows, P.seed);
      if (i === 0) col[0].c = xs[0] - 400;
      if (i === g.length - 1) col[col.length - 1].c = xs[i + 1] + 400;
      for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
        const quad = [meet(col[a], row[b], xm, ym), meet(col[a + 1], row[b], xm, ym), meet(col[a + 1], row[b + 1], xm, ym), meet(col[a], row[b + 1], xm, ym)];
        cells.push({ g: i, a, b, quad, lines: [col[a], col[a + 1], row[b], row[b + 1]], xm, ym, ink: 0 });
      }
    });
    const inside = (cl, x, y) => { const [L, R, U, D] = cl.lines; return x >= L.c + L.k * (y - cl.ym) && x < R.c + R.k * (y - cl.ym) && y >= U.r + U.m * (x - cl.xm) && y < D.r + D.m * (x - cl.xm); };
    for (let y = by0; y < by1; y += 2) for (let x = bx0; x < bx1; x += 2) {
      if (ink[((y - by0) * (bx1 - bx0) + (x - bx0)) * 4 + 3] < 128) continue;
      const cl = cells.find((q) => inside(q, x, y)); if (cl) cl.ink++;
    }
    const pieces = cells.filter((q) => q.ink >= 30);
    // the keys: in each grapheme the most inked middle-row cell; at most three, the most inked, in reading order
    const mid = Math.floor(rows / 2), best = new Map();
    for (const q of pieces) if (q.b === mid && (!best.get(q.g) || best.get(q.g).ink < q.ink)) best.set(q.g, q);
    let keys = [...best.values()].sort((u, v) => v.ink - u.ink).slice(0, Math.min(3, Math.max(1, pieces.length - 3))).sort((u, v) => u.g - v.g);
    const rest = pieces.filter((q) => !keys.includes(q)).map((q, i) => ({ q, h: hash(i * 7 + 1, P.seed + 11) })).sort((u, v) => u.h - v.h).map((x) => x.q);
    const order = rest.concat(keys), m = rest.length, kAt = T.keys.slice(3 - keys.length);
    order.forEach((q, r) => { q.start = r < m ? T.first + (m <= 1 ? 0 : EASE.out(r / (m - 1)) * T.span) : kAt[r - m]; });
    const reveal = kAt[kAt.length - 1] + 6;
    // each piece pre-drawn twice (the tube in the accent, the core in the accent mixed with white), clipped to its cell
    // with a gap cut along the cell's edges (the electrode gap that keeps the pieces apart)
    const body = c.accent, core = mix(c.accent, '#ffffff', 0.72);
    for (const q of order) {
      const xsq = q.quad.map((p) => p[0]), ysq = q.quad.map((p) => p[1]);
      const qx = Math.max(bx0, Math.floor(Math.min(...xsq))), qy = Math.max(by0, Math.floor(Math.min(...ysq))), qw = Math.min(bx1, Math.ceil(Math.max(...xsq))) - qx, qh = Math.min(by1, Math.ceil(Math.max(...ysq))) - qy;
      q.box = [qx, qy, Math.max(1, qw), Math.max(1, qh)];
      q.img = [body, core].map((col) => {
        const cv = canvasOf(q.box[2], q.box[3]), cc = cv.getContext('2d', { willReadFrequently: true });
        cc.translate(-qx, -qy);
        cc.save(); cc.beginPath(); q.quad.forEach(([x, y], k) => (k ? cc.lineTo(x, y) : cc.moveTo(x, y))); cc.closePath(); cc.clip();
        cc.font = fontOf(f); if ('letterSpacing' in cc) cc.letterSpacing = `${f.spacing ?? 0}px`; cc.fillStyle = col; cc.fillText(P.text, x0, base); cc.restore();
        cc.globalCompositeOperation = 'destination-out'; cc.lineWidth = P.gap * 2; cc.lineJoin = 'round'; cc.strokeStyle = '#000000';
        cc.beginPath(); q.quad.forEach(([x, y], k) => (k ? cc.lineTo(x, y) : cc.moveTo(x, y))); cc.closePath(); cc.stroke();
        return cv;
      });
    }
    return { order, reveal, n: order.length, cx: 960, cy: (top + bot) / 2, w: total, h: bot - top };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = clamp(p) * T.frames, reveal = ramp(f, D.reveal, 8, 'snappy'), surge = surgeAt(f, D.reveal);
    const levels = D.order.map((q, i) => (f < q.start ? -1 : f >= q.start + T.strike ? (0.58 + 0.42 * reveal) * (p >= 1 ? 1 : hum(f, i)) : strikeAt(f, q.start)));
    const lit = levels.filter((v, i) => v >= 0 && f >= D.order[i].start + 1).length, shown = levels.filter((v) => v >= 0).length;
    return { p, f, levels, lit, shown, reveal, surge: p >= 1 ? 0 : surge, push: 1 + P.push * EASE.smooth(clamp(p)) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    ground(ctx, P);
    ctx.save();
    ctx.translate(D.cx, D.cy); ctx.scale(S.push * (1 + 0.02 * S.surge), S.push * (1 + 0.02 * S.surge)); ctx.translate(-D.cx, -D.cy);
    // the ground lit by the word: more pieces, more light
    const amb = clamp(0.12 * Math.min(1, S.f / T.first) + 0.5 * (S.lit / D.n) + 0.35 * S.reveal + 0.3 * S.surge);
    const rg = ctx.createRadialGradient(D.cx, D.cy, 0, D.cx, D.cy, Math.max(D.w, 600) * 0.62);
    rg.addColorStop(0, rgba(c.accent, 0.22 * amb)); rg.addColorStop(0.5, rgba(c.accent, 0.08 * amb)); rg.addColorStop(1, rgba(c.accent, 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 1920, 1080);
    D.order.forEach((q, i) => {
      const b = S.levels[i]; if (b < 0) return;
      const [x, y] = q.box, gb = P.glow;
      ctx.save();
      ctx.shadowColor = rgba(c.accent, Math.min(1, 0.55 * b + 0.4 * S.surge) * gb); ctx.shadowBlur = 34 + 16 * S.surge;
      ctx.globalAlpha = Math.min(1, 0.35 + 0.65 * b); ctx.drawImage(q.img[0], x, y);
      ctx.shadowBlur = 0; ctx.globalAlpha = clamp(b * 0.9 + 0.1 * S.surge) * 0.85; ctx.drawImage(q.img[1], x, y);
      ctx.restore();
    });
    ctx.restore();
  },
  // the share of pieces shown (× 1000 px on x): the timing the comparison follows; not a moving point, so no blur
  track(S, P, D) { return [[(S.shown / D.n) * 1000, 0]]; },
  blur() { return false; },
};

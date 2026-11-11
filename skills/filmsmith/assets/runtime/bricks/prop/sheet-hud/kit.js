// sheet-hud/kit.js — the drafting engine of the blueprint bricks: the pen (every line and letter a timed item drawn as
// a pure function of t), lettering with construction lines, rubber stamps, the paper tile, the sheet frame, the
// drafting grid, lamp and vignette, the camera inside a sheet (arrival, drift, the push-in on a stamp and its thud),
// and the persistent frame (border, label panel, corner note, scale bar, title block). Every blueprint scene brick
// imports it; the sheet-hud prop draws its frame.
// From the blueprint template: fx.js (pen, items, stamps, paper) and sheets/common.js are copied with three changes:
// fonts come from the look drafting-sheet with Noto Sans SC after each family; capitals go through lang.js caseOf
// (Chinese has none); Chinese lettering takes the library floors (25 → 28 px, 35 → 40 px), no tracking, and its
// construction lines are the em box instead of the baseline and cap line. choreography.js's constants, camera.js
// (drift, push, thud) and hud.js (the frame, now with its fixed words as slots) are reduced to one sheet at 1:1.
import { clamp, lerp, rgba, canvasOf, crit } from '../../../handoffs/util.js';
import { mulberry32, fbm, hash } from '../../../rng.js';
import { fontStack, caseOf, graphemes, isCJK, readTime, breaks } from '../../lang.js';
import LOOK from '../../look/drafting-sheet/look.js';

export { clamp, lerp, rgba, crit, canvasOf, readTime, graphemes, LOOK };
const CUR = { L: 'en' };
export const setLang = (L) => (CUR.L = L || 'en');
export const hasCJK = (s) => graphemes(String(s ?? '')).some((g) => isCJK(g));
// labels in capitals like drafting lettering (English); Chinese as written
export const up = (s) => caseOf(String(s ?? ''), LOOK, 'label', CUR.L).text;
// a font for a string: Chinese takes the library floors and no tracking
const ZH = { 25: 28, 26: 28, 35: 40 };
export const zf = (str, f) => (CUR.L === 'zh' && hasCJK(str) ? { ...f, size: ZH[f.size] || f.size, track: 0 } : f);
// ---------- easing (named after their GSAP equivalents used by the source film) ----------
export const E = {
  linear: (u) => clamp(u),
  quadOut: (u) => 1 - (1 - clamp(u)) ** 2,
  cubicInOut: (u) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; }, // power2.inOut
  quartInOut: (u) => { u = clamp(u); return u < 0.5 ? 8 * u ** 4 : 1 - (-2 * u + 2) ** 4 / 2; }, // power3.inOut
  quartOut: (u) => 1 - (1 - clamp(u)) ** 4, // power3.out
  quintIn: (u) => clamp(u) ** 5, // power4.in
  quadIn: (u) => clamp(u) ** 2, // power1.in: exits
  // accelerating exit that still settles: ease-in over the first 70 %, a short ease-out in the last 30 %
  // (C1 at the joint), so a camera returning to its rest framing leaves fast and does not stop dead
  accel: (u) => { u = clamp(u); const k = 0.7; return u < k ? (u * u) / k : 1 - ((1 - u) * (1 - u)) / (1 - k); },
  sineInOut: (u) => -(Math.cos(Math.PI * clamp(u)) - 1) / 2,
  backOut: (u, s = 2.2) => { u = clamp(u); const c3 = s + 1; return 1 + c3 * (u - 1) ** 3 + s * (u - 1) ** 2; },
};


// ---------- fonts ----------
// the two families with Noto Sans SC after them, so Chinese glyphs fall through to it (lang.js fontStack order)
export const FAM = { cond: fontStack(LOOK, 'display', 'zh'), mono: fontStack(LOOK, 'mono', 'zh') };
export const fontStr = (f) => `${f.w || 400} ${f.size}px ${FAM[f.fam]}`;
const mcache = new Map();
// width of text with tracking (em), measured by the browser with letterSpacing applied
export const measureT = (ctx, str, f) => {
  const key = fontStr(f) + '|' + (f.track || 0) + '|' + str;
  let w = mcache.get(key);
  if (w === undefined) {
    ctx.save();
    ctx.font = fontStr(f);
    ctx.letterSpacing = `${((f.track || 0) * f.size).toFixed(2)}px`;
    w = ctx.measureText(str).width - (f.track || 0) * f.size; // drop the trailing tracking after the last glyph
    ctx.restore();
    mcache.set(key, w);
  }
  return w;
};
export const clearMeasure = () => mcache.clear();
export const CAP = 0.698; // cap height / em for IBM Plex (Sans Condensed and Mono)

// ---------- polylines ----------
export const polyLen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
export const partial = (pts, u, L = polyLen(pts)) => {
  if (u >= 1) return pts;
  if (u <= 0) return [pts[0]];
  let want = L * u;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const d = Math.hypot(bx - ax, by - ay);
    if (d >= want) { const k = d ? want / d : 0; out.push([ax + (bx - ax) * k, ay + (by - ay) * k]); return out; }
    out.push(pts[i]);
    want -= d;
  }
  return out;
};
export const pointAt = (pts, u, L = polyLen(pts)) => { const p = partial(pts, clamp(u), L); return p[p.length - 1]; };
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
export const circlePts = (cx, cy, r, a0 = -Math.PI / 2, n = 120, sweep = Math.PI * 2) => {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (sweep * i) / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return p;
};
// rounded rectangle, clockwise from the middle of the top edge
export const roundRectPts = (x, y, w, h, r) => {
  const p = [[x + w / 2, y]];
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 12; i++) { const a = a0 + (Math.PI / 2) * (i / 12); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x + w - r, y + r, -Math.PI / 2);
  arc(x + w - r, y + h - r, 0);
  arc(x + r, y + h - r, Math.PI / 2);
  arc(x + r, y + r, Math.PI);
  p.push([x + w / 2, y]);
  return p;
};

// ---------- stroke styles (palette roles) ----------
export const strokeStyle = (P, st) => ({
  s1: { c: P.line, w: 2.5, cap: 'square' },
  s2: { c: P.ink, w: 3, cap: 'square' },
  sa: { c: P.accent, w: 4, cap: 'round' },
  sg: { c: rgba(P.line, 0.4), w: 1.5, cap: 'butt' },
  sf: { c: rgba(P.line, 0.55), w: 2, cap: 'butt' },
  route: { c: P.ink, w: 14, cap: 'round' },
}[st]);
export const DASH = { dash: [14, 10], dashdot: [36, 10, 6, 10] };

// ---------- line work: the drafting instrument (content.linework; mode card, Variants) ----------
// 'ink'    (default) the technical pen: every line draws once, uniform weight, the issued print.
// 'pencil' the pencil original: each line is first laid out as a light construction line that runs past its
//          ends (blocking in), then lined in over it with a graphite stroke; the construction lines stay, as
//          drafting textbooks keep them light enough not to need erasing. The finished line ends exactly where
//          the ink line does, at the same moment, so the choreography, the timing and every landing are
//          unchanged. Lettering, stamps and the pre-printed frame (HUD) stay as they are.
export const LINEWORK = ['ink', 'pencil'];
export const PENCIL = {
  lay: 0.55, // the construction line draws over the first 55 % of the line's time, fast out (it leads the pen)
  inkAt: 0.2, // the finished line starts 20 % in and ends with the ink line's end
  over: 56, // px the construction line runs past each end of a straight segment (blocked in with the T-square)
  width: 1.5, alpha: 0.42, // construction line: as thin and about as light as the lettering guides (1.5 px at 0.4)
  maxSegs: 5, // polylines with more segments (circles, curves, the loop) are laid out along their own path
};

// graphite: the stroke colour through a seeded, tileable grain mask (mean alpha ≈ 0.8, so line work stays
// above 3:1 on every preset's paper); one pattern per colour and canvas context
let graphiteMask = null;
const graphiteCache = new WeakMap();
const graphite = (ctx, colour) => {
  if (!graphiteMask) {
    const N = 96, raw = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) raw[i] = hash(i, 4242);
    const c = canvasOf(N, N);
    const g = c.getContext('2d'), img = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      // a 2 × 2 box over wrapped white noise: fine tooth, periodic across the tile edge
      const v = (raw[y * N + x] + raw[y * N + ((x + 1) % N)] + raw[((y + 1) % N) * N + x] + raw[((y + 1) % N) * N + ((x + 1) % N)]) / 4;
      img.data[(y * N + x) * 4 + 3] = Math.round(255 * clamp(0.15 + 1.1 * v));
    }
    g.putImageData(img, 0, 0);
    graphiteMask = c;
  }
  let m = graphiteCache.get(ctx);
  if (!m) graphiteCache.set(ctx, (m = new Map()));
  let pat = m.get(colour);
  if (!pat) {
    const c = canvasOf(graphiteMask.width, graphiteMask.width);
    const g = c.getContext('2d');
    g.fillStyle = colour; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(graphiteMask, 0, 0);
    pat = ctx.createPattern(c, 'repeat');
    m.set(colour, pat);
  }
  return pat;
};

// the construction layout of a line: straight segments extended past both ends, or the path itself
const layoutOf = (it) => {
  if (it.lay) return it.lay;
  const segs = [];
  if (it.pts.length - 1 <= PENCIL.maxSegs) {
    for (let i = 1; i < it.pts.length; i++) {
      const [ax, ay] = it.pts[i - 1], [bx, by] = it.pts[i], d = Math.hypot(bx - ax, by - ay);
      if (d < 1e-6) continue;
      const ux = (bx - ax) / d, uy = (by - ay) / d, o = PENCIL.over;
      segs.push([[ax - ux * o, ay - uy * o], [bx + ux * o, by + uy * o]]);
    }
  } else segs.push(it.pts);
  const lens = segs.map((p) => polyLen(p));
  it.lay = { segs, lens, L: lens.reduce((a, b) => a + b, 0) };
  return it.lay;
};

const drawPencilLine = (ctx, P, it, t) => {
  const s = strokeStyle(P, it.st);
  // guides are construction lines already; the final route and the amber marks are not laid out
  if (it.st !== 'sg' && it.st !== 'route' && it.st !== 'sa') {
    const u = it.dur > 0 ? E.quartOut(clamp((t - it.t0) / (it.dur * PENCIL.lay))) : 1;
    if (u > 0) {
      const lay = layoutOf(it);
      let want = lay.L * u;
      ctx.save();
      ctx.strokeStyle = rgba(P.line, PENCIL.alpha);
      ctx.lineWidth = PENCIL.width;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';
      for (let k = 0; k < lay.segs.length && want > 0; k++) {
        const L = lay.lens[k];
        strokePts(ctx, partial(lay.segs[k], Math.min(1, want / L), L));
        want -= L;
      }
      ctx.restore();
    }
  }
  const u = it.dur > 0 ? it.ease(clamp((t - it.t0 - it.dur * PENCIL.inkAt) / (it.dur * (1 - PENCIL.inkAt)))) : 1;
  if (u <= 0) return;
  ctx.save();
  ctx.strokeStyle = graphite(ctx, s.c);
  ctx.lineWidth = it.width || s.w;
  ctx.lineCap = it.dash ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  if (it.alpha !== undefined) ctx.globalAlpha *= it.alpha;
  if (it.dash) ctx.setLineDash(DASH[it.dash]);
  strokePts(ctx, partial(it.pts, u, it.L));
  ctx.restore();
};

// ---------- the pen: collects timed items for one sheet (or the HUD / world) ----------
// t0/dur in seconds. Items draw in the order they were added. o.linework: 'ink' (default) or 'pencil' (above).
export const makePen = (P, mctx, o = {}) => {
  if (o.lang) CUR.L = o.lang;
  const pencil = o.linework === 'pencil';
  const items = [];
  const add = (it) => (items.push(it), it);
  const pen = {
    items,
    P,
    measure: (str, f) => measureT(mctx, str, zf(str, f)),
    lang: CUR.L,
    line(pts, t0, dur, st = 's1', o = {}) {
      const it = { k: 'line', pts, L: polyLen(pts), t0, dur, st, dash: o.dash, ease: o.ease || E.cubicInOut, width: o.width, alpha: o.alpha };
      if (pencil) it.pencil = true;
      return add(it);
    },
    seg(x1, y1, x2, y2, t0, dur, st, o) { return pen.line([[x1, y1], [x2, y2]], t0, dur, st, o); },
    rect(x, y, w, h, t0, dur, st, o) { return pen.line(rectPts(x, y, w, h), t0, dur, st, o); },
    circle(cx, cy, r, t0, dur, st, o) { return pen.line(circlePts(cx, cy, r), t0, dur, st, o); },
    head(x, y, ang, t0, col = 'line', size = 16) { return add({ k: 'head', x, y, ang, t0, col, size }); },
    arrow(x1, y1, x2, y2, t0, dur, st = 's2', o = {}) {
      const l = pen.seg(x1, y1, x2, y2, t0, dur, st, o);
      pen.head(x2, y2, Math.atan2(y2 - y1, x2 - x1), t0 + dur * 0.92, o.headCol || (st === 's1' ? 'line' : st === 'sa' ? 'accent' : 'ink'), o.headSize || 16);
      return l;
    },
    dot(x, y, r, t0, col = 'line', o = {}) { return add({ k: 'dot', x, y, r, t0, col, pop: o.pop }); },
    fill(pts, t0, dur, col, alpha) { return add({ k: 'fill', pts, t0, dur, col, alpha }); },
    // dimension line: extension ticks, two half-lines drawn from the middle out, arrowheads
    dim(x1, x2, y, t0, dur = 0.5, ext = 22) {
      pen.seg(x1, y - ext, x1, y + ext, t0, 0.15, 'sf');
      pen.seg(x2, y - ext, x2, y + ext, t0, 0.15, 'sf');
      const mid = (x1 + x2) / 2;
      pen.seg(mid, y, x1 + 2, y, t0 + 0.1, dur, 's1');
      pen.seg(mid, y, x2 - 2, y, t0 + 0.1, dur, 's1');
      pen.head(x1, y, Math.PI, t0 + 0.1 + dur * 0.9, 'line', 14);
      pen.head(x2, y, 0, t0 + 0.1 + dur * 0.9, 'line', 14);
    },
    // lettering: x, baseline y; mode 'wipe' (traced in left to right), 'pop', 'fade'
    text(str, x, y, f, t0, dur = 0.5, o = {}) {
      f = zf(str, f);
      const w = measureT(mctx, str, f);
      const align = o.align || 'left';
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      return add({ k: 'text', str, x: x0, y, w, f, t0, dur, col: o.col || 'ink', mode: o.mode || 'wipe', ease: o.ease || E.cubicInOut, spans: o.spans, rect: [x0, y - f.size * 0.82, w, f.size * 1.08] });
    },
    // construction lines (baseline + cap line) that run past the lettering, drawn just before it
    // Chinese lettering has no cap line: its guides are the em box (ideographic bottom and top, 0.12 em under and
    // 0.88 em over the baseline), the square each character is drawn in
    guides(base, size, t0, x1 = 80, x2 = 1840, str = '') {
      const cjk = CUR.L === 'zh' && hasCJK(str), lo = cjk ? base + size * 0.12 : base, hi = cjk ? base - size * 0.88 : base - size * CAP;
      pen.seg(x1, lo, x2, lo, t0, 0.55, 'sg');
      pen.seg(x1, hi, x2, hi, t0 + 0.08, 0.55, 'sg');
    },
    custom(t0, draw, o = {}) { return add({ k: 'custom', t0, draw, ...o }); },
  };
  return pen;
};

// ---------- drawing items ----------
const colOf = (P, c) => P[c] || c;

const drawText = (ctx, P, it, t) => {
  const u = it.dur > 0 ? it.ease(clamp((t - it.t0) / it.dur)) : 1;
  if (u <= 0) return;
  ctx.save();
  ctx.font = fontStr(it.f);
  ctx.letterSpacing = `${((it.f.track || 0) * it.f.size).toFixed(2)}px`;
  ctx.textBaseline = 'alphabetic';
  let alpha = 1, sc = 1;
  if (it.mode === 'wipe' && u < 1) {
    ctx.beginPath();
    ctx.rect(it.x - 8, it.y - it.f.size * 1.2, (it.w + 16) * u, it.f.size * 1.7);
    ctx.clip();
  } else if (it.mode === 'pop') {
    const v = clamp((t - it.t0) / it.dur);
    alpha = clamp(v * 3);
    sc = 0.8 + 0.2 * E.backOut(v);
  } else if (it.mode === 'fade') alpha = u;
  ctx.globalAlpha *= alpha;
  if (sc !== 1) {
    const cx = it.x + it.w / 2, cy = it.y - it.f.size * 0.35;
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  }
  if (it.f.outline) {
    ctx.strokeStyle = colOf(P, it.col);
    ctx.lineWidth = it.f.outline;
    ctx.strokeText(it.str, it.x, it.y);
  } else if (it.spans) {
    // spans: [[text, colourRole], ...] drawn in sequence; widths measured with the same font
    let x = it.x;
    for (const [s, c] of it.spans) {
      ctx.fillStyle = colOf(P, c);
      ctx.fillText(s, x, it.y);
      x += measureT(ctx, s, it.f) + (it.f.track || 0) * it.f.size;
    }
  } else {
    ctx.fillStyle = colOf(P, it.col);
    ctx.fillText(it.str, it.x, it.y);
  }
  ctx.restore();
};

const drawHead = (ctx, P, it, t) => {
  const v = clamp((t - it.t0) / 0.08);
  if (v <= 0) return;
  const { x, y, ang, size: s } = it;
  ctx.save();
  ctx.globalAlpha *= v;
  ctx.fillStyle = colOf(P, it.col);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * Math.cos(ang) + (s / 2.4) * Math.sin(ang), y - s * Math.sin(ang) - (s / 2.4) * Math.cos(ang));
  ctx.lineTo(x - s * Math.cos(ang) - (s / 2.4) * Math.sin(ang), y - s * Math.sin(ang) + (s / 2.4) * Math.cos(ang));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const strokePts = (ctx, pts) => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
};

export const drawItem = (ctx, P, it, t) => {
  if (t < it.t0) return;
  switch (it.k) {
    case 'line': {
      if (it.pencil) return drawPencilLine(ctx, P, it, t);
      const u = it.dur > 0 ? it.ease(clamp((t - it.t0) / it.dur)) : 1;
      if (u <= 0) return;
      const s = strokeStyle(P, it.st);
      ctx.save();
      ctx.strokeStyle = s.c;
      ctx.lineWidth = it.width || s.w;
      ctx.lineCap = it.dash ? 'butt' : s.cap;
      ctx.lineJoin = 'round';
      if (it.alpha !== undefined) ctx.globalAlpha *= it.alpha;
      if (it.dash) ctx.setLineDash(DASH[it.dash]);
      strokePts(ctx, partial(it.pts, u, it.L));
      ctx.restore();
      return;
    }
    case 'text': return drawText(ctx, P, it, t);
    case 'head': return drawHead(ctx, P, it, t);
    case 'dot': {
      const v = it.pop ? E.backOut(clamp((t - it.t0) / 0.25)) : clamp((t - it.t0) / 0.08);
      if (v <= 0) return;
      ctx.save();
      ctx.fillStyle = colOf(P, it.col);
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r * Math.max(0, v), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    case 'fill': {
      const u = clamp((t - it.t0) / it.dur);
      if (u <= 0) return;
      ctx.save();
      ctx.globalAlpha *= u * it.alpha;
      ctx.fillStyle = colOf(P, it.col);
      ctx.beginPath();
      it.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }
    case 'custom': return it.draw(ctx, t, t - it.t0);
  }
};

// ---------- stamps: pre-rendered rubber stamp with seeded worn-ink texture ----------
// spec { word, small } → { canvas, w, h } in world px (canvas is 2× for push-ins).
// role: 'accent' for a person's decision (CONFIRMED, APPROVED); 'line' for an inspection stamp, the mark of
// something a machine did (VERIFIED, FROZEN): same shape, line colour (mode principle 4).
// The small line is information, so it never drops below 25 px (principle 1).
export const STAMP_SMALL_MIN = 25;
export const makeStamp = (P, mctx, { word, small }, size, seed, role = 'accent') => {
  const ink = P[role] || P.accent;
  const fw = { fam: 'cond', w: 700, size, track: 0.06 };
  const fs = { fam: 'mono', w: 600, size: Math.max(STAMP_SMALL_MIN, Math.round(size * 0.3)), track: 0.24 };
  const W = up(word), Sm = up(small || ''), cjk = hasCJK(W + Sm);
  if (cjk) { fw.track = 0; fs.track = 0; fs.size = Math.max(28, fs.size); }
  const ww = measureT(mctx, W, fw), sw = Sm ? measureT(mctx, Sm, fs) : 0;
  const padX = size * 0.45, padT = size * 0.17, gap = size * 0.1;
  const inner = { w: Math.max(ww, sw) + padX * 2, h: size * 0.78 + padT * 2 + (Sm ? fs.size + gap : 0) };
  const off = 13; // outer ring offset (border 6 + gap 7)
  const w = inner.w + off * 2, h = inner.h + off * 2;
  const k = 2;
  const c = canvasOf(Math.ceil(w * k), Math.ceil(h * k));
  const g = c.getContext('2d');
  g.scale(k, k);
  g.fillStyle = rgba(P.paper, 0.74);
  g.fillRect(off, off, inner.w, inner.h);
  g.strokeStyle = ink;
  g.lineWidth = 6;
  g.strokeRect(off + 3, off + 3, inner.w - 6, inner.h - 6);
  g.lineWidth = 2;
  g.strokeRect(1, 1, w - 2, h - 2);
  g.fillStyle = ink;
  g.textBaseline = 'alphabetic';
  g.font = fontStr(fw);
  g.letterSpacing = `${(fw.track * size).toFixed(2)}px`;
  const base1 = off + padT + size * CAP + size * 0.04;
  g.fillText(W, off + (inner.w - ww) / 2, base1 + size * 0.04);
  if (Sm) {
    g.font = fontStr(fs);
    g.letterSpacing = `${(fs.track * fs.size).toFixed(2)}px`;
    g.fillText(Sm, off + (inner.w - sw) / 2, base1 + gap + fs.size * 1.05);
  }
  // worn ink: erase speckles and soft blotches from a seeded noise field
  g.setTransform(1, 0, 0, 1, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  // the small line is information at 25 px: its band wears at most to 60 % ink, so no letter breaks
  const smallY = Sm ? (base1 + gap) * k : Infinity;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i + 3] === 0) continue;
      const n = fbm(x / 34, y / 34, seed, 3);
      const speck = hash(x * 7919 + y * 104729, seed);
      let keep = 1;
      if (n < 0.33) keep = clamp((n - 0.25) / 0.08);
      if (speck < 0.035) keep *= 0.3;
      if (y > smallY && y < (h - off) * k) keep = Math.max(keep, 0.6);
      d[i + 3] = Math.round(d[i + 3] * (0.86 + 0.14 * keep) * keep ** 0.6);
    }
  }
  g.putImageData(img, 0, 0);
  return { canvas: c, w, h, role };
};

// axis-aligned size of a stamp rotated by rot degrees: [w, h]
export const stampBox = (st, rot) => {
  const a = Math.abs((rot * Math.PI) / 180);
  return [st.w * Math.cos(a) + st.h * Math.sin(a), st.w * Math.sin(a) + st.h * Math.cos(a)];
};

// stamp item: lands at tLand (scale 2.1 → 1 over 0.17 s, accelerating), then a 0.14 s squash
export const drawStamp = (ctx, st, cx, cy, rot, tLand, t) => {
  const t0 = tLand - 0.17;
  if (t < t0) return;
  let sc, r, a;
  if (t < tLand) {
    const u = E.quintIn((t - t0) / 0.17);
    sc = 2.1 + (1 - 2.1) * u; r = rot - 9 + 9 * u; a = 0.96 * clamp(u * 1.6);
  } else {
    const d = t - tLand;
    sc = d < 0.14 ? 1 + 0.035 * Math.sin((Math.PI * d) / 0.14) : 1; r = rot; a = 0.96;
  }
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.rotate((r * Math.PI) / 180);
  ctx.scale(sc, sc);
  ctx.drawImage(st.canvas, -st.w / 2, -st.h / 2, st.w, st.h);
  ctx.restore();
};

// ---------- paper texture from a seed (replaces the source film's paper-noise.png) ----------
export const paperTile = (seed, size = 384) => {
  const c = canvasOf(size, size);
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const r = mulberry32(seed);
  // tileable: sample fbm on a torus by blending four shifted copies
  const tor = (x, y, s, sd) => {
    const u = x / size, v = y / size;
    const a = fbm(x / s, y / s, sd, 3), b = fbm((x - size) / s, y / s, sd, 3), c2 = fbm(x / s, (y - size) / s, sd, 3), d2 = fbm((x - size) / s, (y - size) / s, sd, 3);
    return (a * (1 - u) + b * u) * (1 - v) + (c2 * (1 - u) + d2 * u) * v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const cloud = tor(x, y, 56, seed); // soft mottling
      const fleck = tor(x, y, 6, seed + 7); // small fibre flecks, isotropic
      const grain = r();
      const v = 0.55 * cloud + 0.2 * fleck + 0.25 * grain;
      const k = Math.round(clamp(0.5 + (v - 0.5) * 1.4) * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = k;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};
export const HOLD_S = 1.0;
export const URL_HOLD_S = 3; // the release URL stays readable at least this long

// A stamp sheet: the camera pushes in over [STAMP_B − 1.5, STAMP_B − 0.5], the stamp lands on STAMP_B, the push
// holds at least one beat and returns in PUSH_BACK_B, landing on the build's end, the next whole beat (N0). The
// return lands there rather than earlier, so the sheet's two-beat hold starts where the camera settles: a return
// landing 0.4 beat before N0 left the picture still 0.1–0.24 s before the declared hold, and check-film measured
// the hold 1–2 frames over two beats (2026-10-19 test film t4). timing.rules.js pushBeats() times it.
export const STAMP_B = 5;
export const PUSH_BACK_B = 0.6; // a stamp push-in returns in 0.6 of its 1-beat entrance
export const STAMP_N0 = Math.ceil(STAMP_B + 1 + PUSH_BACK_B); // 7

// The issue (2026-10-19, timing API 3): a film may be drafted as a pencil original (content.original, default
// 'vellum', in pencil line work) until a person signs its plan. The `detail` sheet marked issue: true is that
// signature: one beat after its amber stamp lands, the stamp's own outline floods the frame (lib/transitions
// shape-flood, FLOOD_B beat) and inside it is the same drawing as the print (content.palette, content.linework).
// The camera stays pushed in until the flood has closed, then returns (landing on N0), so the build ends a beat later.
export const FLOOD_AFTER_B = 1, FLOOD_B = 1;
export const ISSUE_N0 = Math.ceil(STAMP_B + FLOOD_AFTER_B + FLOOD_B + PUSH_BACK_B); // 8
// The release entered from the final overview under a parallel rule (lib/transitions occluder-pass): the rule
// crosses the lens in RULE_B beats while the camera cuts from the whole drawing to the release sheet under it.
export const RULE_B = 1;
// The interface sheet (X04 + X05): the outline is drafted, three lines make it a cube (stroke-reinterpret,
// REINTERPRET_B), it holds, then opens into the console's panels (net-unfold, UNFOLD_B).
export const REINTERPRET_B = 1, UNFOLD_B = 2;
// The stages sheet (X02): one word a beat through a slot between two dimension lines (slot-rails, SLOT_B each).
export const SLOT_B = 1;
// The checklist's probe run (2026-10-19, phase 3): the machine's inspection is a lamp crossing the record at a
// machine's steady feed (lib/transitions blueprint-expose, develop: false: a reading, not an exposure, so the print
// is still issued once, by a person). Each row's result is drafted as the lamp passes it; the count is the rows
// passed. SCAN_B beats from the `scan` cue; the lamp has left the frame by 0.83 of it, before the push-in starts.
export const SCAN_B = 1.5;
// The inspection table's row centres (sheet px, y), shared with sheets/checklist.js so the picture, the sound and the
// key events time each row from the same geometry.
export const CHECK_TABLE = { y: 430, head: 48, rows: 315, rowMax: 45, tickX: 658 };
export const checkRows = (n) => {
  const rh = Math.min(CHECK_TABLE.rowMax, Math.floor(CHECK_TABLE.rows / Math.max(n, 1)));
  return { rh, yc: [...Array(n).keys()].map((i) => CHECK_TABLE.y + CHECK_TABLE.head + rh * (i + 0.5) + 6) };
};
// blueprint-expose's lamp (lib/transitions/blueprint.js, develop: false): X = mix(−210, len + 210, e), e = mix(p,
// cubicInOut(p), 0.45); a film pixel at coordinate a along the travel is passed when X reaches it. Returns that p.
const cubicInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const lampPass = (a, len) => {
  const want = (a + 210) / (len + 420);
  let lo = 0, hi = 1;
  for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; ((0.55 * m + 0.45 * cubicInOut(m)) < want ? (lo = m) : (hi = m)); }
  return (lo + hi) / 2;
};
// The k-th probe run of a film crosses down the rows, the next across the columns, so two in a row are never the
// same (api 3: one device twice in a row unchanged is an error). Beats after the scan cue at which each row is passed:
// the sheet sits centred at rest, so a row's sheet y is its screen y (the drift's 1 % moves it < 2 px, a frame's
// travel of the lamp).
export const SCAN_DIRS = ['down', 'right'];
export const scanRowBeats = (n, dir) => {
  const { yc } = checkRows(n);
  return yc.map((y) => SCAN_B * (dir === 'right' ? lampPass(CHECK_TABLE.tickX - 16, 1920) : lampPass(y - 11, 1080)));
};

export const X0 = 150, X1 = 1790, CW = X1 - X0;

// The type scale: ISO 3098 lettering heights, stepping by √2 (2.5 · 3.5 · 5 · 7 · 10 · 14 · 20 · 28 mm), at 10 px a
// millimetre. Each sheet uses three tiers: title (140; one-line heads 100; the release name 200), notes (35; the
// problem's values 70) and labels (25, the floor). The HUD, the stamps and the drawn read-outs (the checklist
// count) are counted apart, but their sizes come from the same series. env.fit() (film.js) steps down the series,
// so a fitted size stays on it. Settled 2026-10-18 (check C9; accepted on the recommendation; the owner did not
// compare it shot by shot); the source film's sizes (150 / 64 / 44 / 26 …) were removed.
// Text that carries information is ≥ 25 px (principle 1, landscape full-screen on a phone); MIN is the floor.
export const ISO = [25, 35, 50, 70, 100, 140, 200, 280];
export const MIN = 25;
export const F = {
  label: { fam: 'mono', w: 400, size: 25, track: 0.14 }, // figure label, line colour
  tag: { fam: 'mono', w: 400, size: 25, track: 0.14 }, // box tags, column heads
  sub: { fam: 'mono', w: 400, size: 35 }, // one-line explanation, muted
  body: { fam: 'mono', w: 400, size: 35 }, // annotations
  small: { fam: 'mono', w: 400, size: 25 },
  title: { fam: 'cond', w: 700, size: 140, track: -0.02 }, // one-word sheet title
  head2: { fam: 'cond', w: 700, size: 100, track: -0.02 }, // one-line sheet title
  claim: { fam: 'cond', w: 700, size: 140, track: -0.02 }, // two-line claim
};
export const sz = (f, size, extra = {}) => ({ ...f, size, ...extra });

// Label + construction lines + a title of one or two lines. Returns the title's bounding rect.
// o: { lines: [str], fonts: [f], bases: [y], cues: [t], minSize }
export const header = (pen, env, s, o) => {
  const { lines, bases, cues } = o;
  env.lim('label', s.label, 36);
  pen.text(up(s.label), X0, 180, F.label, cues[0] - 0.42, 0.45, { col: 'line' });
  let rect = null;
  lines.forEach((str, i) => {
    const f = env.fit(str, o.fonts[i], CW, o.minSize, `title line ${i + 1}`);
    pen.guides(bases[i], f.size, cues[i] - (i ? 0.15 : 0.38), 80, 1840, str);
    const it = pen.text(str, X0 - 8, bases[i], f, cues[i], o.dur || 0.6 * (str.length > 12 ? 1.15 : 1));
    rect = rect ? union(rect, it.rect) : it.rect;
  });
  return rect;
};

export const union = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
  return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
};

const meets = (a, b) => !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);

// Where a stamp may land: the free spot nearest `prefer` inside `region` [x0, y0, x1, y1] whose rotated box
// stays `margin` px clear of every lettering on the sheet (pen text items: key numbers, captions, labels) and
// of the extra rects in `avoid` (custom-drawn figures such as a computed count) and env.hud (the HUD at rest,
// mapped into sheet coordinates). A stamp
// lands beside the result it certifies, never on top of it. Call it after all lettering is placed.
export const solveStamp = (pen, env, box, { prefer, region, avoid = [], margin = 14, where = 'stamp' }) => {
  const [bw, bh] = box;
  const blocks = [...pen.items.filter((it) => it.k === 'text' && !it.f.outline).map((it) => it.rect), ...avoid, ...(env.hud || [])]
    .map((r) => [r[0] - margin, r[1] - margin, r[2] + 2 * margin, r[3] + 2 * margin]);
  let best = null;
  for (let cy = region[1] + bh / 2; cy <= region[3] - bh / 2 + 1e-6; cy += 4) {
    for (let cx = region[0] + bw / 2; cx <= region[2] - bw / 2 + 1e-6; cx += 4) {
      const R = [cx - bw / 2, cy - bh / 2, bw, bh];
      if (blocks.some((b) => meets(R, b))) continue;
      const d = Math.hypot(cx - prefer[0], cy - prefer[1]);
      if (!best || d < best.d) best = { cx, cy, d };
    }
  }
  if (!best) { env.err(`${where}: no place clear of the lettering; shorten the stamp or the copy around it`); return { cx: prefer[0], cy: prefer[1] }; }
  return best;
};

// The largest stamp (sizes tried in order) that solveStamp can place clear of the lettering; the stamp's
// own lettering stays ≥ 25 px at every size (fx.js). Returns { st, box, cx, cy, rect }.
export const fitStamp = (pen, env, spec, { sizes, rot, role = 'accent', ...opts }) => {
  let last = null;
  for (const size of sizes) {
    const st = env.stamp(spec, size, role), box = stampBox(st, rot);
    const quiet = { ...env, err: () => {} };
    const p = solveStamp(pen, size === sizes[sizes.length - 1] ? env : quiet, box, opts);
    last = { st, box, ...p, rect: [p.cx - box[0] / 2, p.cy - box[1] / 2, box[0], box[1]] };
    if (p.d !== undefined) break;
  }
  return last;
};

// A box whose outline draws itself, then its lettering appears. Returns the box rect.
export const box = (pen, x, y, w, h, t, st = 's1', dur = 0.4) => {
  pen.rect(x, y, w, h, t, dur, st);
  return [x, y, w, h];
};

// Spans: a string or [[text, role], ...] → { text, spans }
export const spans = (v) => (Array.isArray(v) ? { text: v.map((p) => p[0]).join(''), spans: v } : { text: String(v ?? ''), spans: null });

// ---------- one sheet as a brick: palette, env, cues, camera, ground, frame ----------
export const SW = 1920, SH = 1080, BEAT = (bpm) => 60 / bpm;
export const ARRIVE_B = 1;   // the brick's first beat is the camera's travel in (plan lead 1); cues count from arrival
// the template's palette object from a brick's colours (roles) and the look preset that carries grid, lamp, texture
export const palOf = (C, id) => {
  const pre = LOOK.palettes.find((p) => p.id === id) || LOOK.palettes.find((p) => p.roles.paper === C.paper) || LOOK.palettes[0];
  return { bg: C.ground, paper: C.paper, ink: C.ink, line: C.line, muted: C.dim || C.muted, accent: C.accent, onAccent: C.onAccent, grid: pre.grid, texture: pre.texture, lamp: pre.lamp, vignette: pre.vignette, dark: pre.dark };
};
// the HUD's rects at rest in sheet coordinates (a sheet sits at 1:1): label panel, corner note, scale bar, title block
export const HUD_RECTS = [[44, 40, 760, 96], [1500, 56, 380, 36], [40, 980, 290, 66], [1300, 884, 580, 156]];
// fit(): step down the ISO series (English) or the Chinese series, never under the floor
export const makeEnv = (pen, P, mctx, { cues, beat, seed = 7, stampT = null, errs = [] }) => ({
  P, b: beat, hud: HUD_RECTS,
  c: (name) => { const v = cues[name]; if (v === undefined) errs.push(`missing cue "${name}"`); return v ?? 0; },
  err: (m) => errs.push(m), lim: () => {},
  fit: (str, f, maxW, min) => {
    const series = CUR.L === 'zh' && hasCJK(str) ? [28, 40, 50, 70, 100, 140, 200, 280] : ISO;
    let g = { ...f };
    const lo = Math.max(...series.filter((v) => v <= Math.max(min, series[0])));
    const steps = series.filter((v) => v < g.size && v >= lo).reverse();
    while (pen.measure(str || '', g) > maxW && steps.length) g = { ...g, size: steps.shift() };
    return g;
  },
  stamp: (spec, size, role = 'accent') => makeStamp(P, mctx, spec, size, seed * 31, role),
  placeStamp: (st, cx, cy, rot) => { const tl = stampT; pen.custom(tl - 0.2, (c2, t) => drawStamp(c2, st, cx, cy, rot, tl, t)); },
  handoff: () => { errs.push('hand-offs are the host’s (library recipe)'); return { h: null }; },
});
// cue name → seconds from the brick's start (arrival after ARRIVE_B)
export const cueSec = (cue, beat) => Object.fromEntries(Object.entries(cue).map(([k, v]) => [k, (ARRIVE_B + v) * beat]));
// the sheet's own frame, crop marks and outlined number, drawn during the arrival
export const sheetFrame = (pen, P, no, beat) => {
  const tf = ARRIVE_B * beat * 0.55;
  pen.rect(0, 0, SW, SH, tf, 0.8, 'sf', { ease: E.cubicInOut });
  [[0, 0, -1, -1], [SW, 0, 1, -1], [0, SH, -1, 1], [SW, SH, 1, 1]].forEach(([px, py, sx, sy]) => {
    pen.seg(px + sx * 16, py, px + sx * 70, py, tf + 0.2, 0.3, 's1');
    pen.seg(px, py + sy * 16, px, py + sy * 70, tf + 0.2, 0.3, 's1');
  });
  if (no) pen.text(String(no).padStart(2, '0'), 1790, 250, { fam: 'cond', w: 700, size: 140, outline: 2 }, tf + 0.1, 0.6, { align: 'right', col: rgba(P.line, 0.42) });
};
// length in beats: arrival + the build (N0) + the two-beat hold, and enough for the reading (0.3 s a word, 6 Chinese
// characters a second + 0.5 s) from each text's landing in draw order
export const sheetBeats = (items, N0, bpm, L, { hold = 2, extra = 0, min = 0 } = {}) => {
  const beat = 60 / bpm;
  let prim = 0;
  for (const it of items.filter((x) => x.k === 'text' && !x.f.outline && x.read !== false).sort((a, b) => a.t0 - b.t0)) prim = Math.max(prim, it.t0 + it.dur) + readTime(it.str, L) * (it.glance ? 0 : 1);
  const build = ARRIVE_B + N0 + hold + extra;
  return Math.max(min, Math.ceil(Math.max(build, prim / beat + 1) - 1e-9));
};
// the camera inside a sheet: it arrives over the first beat from `from` (left, right, above, below; 'none' starts at
// rest), drifts 1.0 → 1.012 while the sheet draws, pushes in on the stamp (1.5 → 0.5 beats before it), holds, returns
// in 0.6 of a beat accelerating; a short thud on each impact.
export const camOf = ({ beat, from = 'left', push = null, holdStart, impacts = [] }) => (t) => {
  const A = ARRIVE_B * beat;
  let x = 960, y = 540, s = 1;
  if (t < A && from !== 'none') { const e = 1 - E.quartInOut(t / A), d = { left: [-1, 0], right: [1, 0], above: [0, -1], below: [0, 1] }[from] || [-1, 0]; x += d[0] * (SW + 120) * e; y += d[1] * (SH + 120) * e; }
  const drift = (tt) => 1 + 0.012 * E.sineInOut((tt - A) / Math.max(0.01, holdStart - A));
  s = t < A ? 1 : drift(t);
  if (push) {
    const k = (tt, a, b2, ease) => ease(clamp((tt - a) / Math.max(1e-6, b2 - a)));
    if (t >= push.from && t < push.back) {
      const s0 = drift(push.from), e = t < push.at ? k(t, push.from, push.at, E.cubicInOut) : 1;
      x = lerp(960, push.cx, e); y = lerp(540, push.cy, e); s = Math.exp(lerp(Math.log(s0), Math.log(push.s), e));
      if (t >= push.hold) { const r = k(t, push.hold, push.back, E.accel); x = lerp(push.cx, 960, r); y = lerp(push.cy, 540, r); s = Math.exp(lerp(Math.log(push.s), Math.log(drift(push.back)), r)); }
    }
  }
  let dx = 0, dy = 0;
  for (const ti of impacts) { const d = t - ti; if (d >= 0 && d < 0.25) { const amp = 3 * Math.exp(-d * 18); dx += amp * Math.sin(d * 95); dy += amp * 0.7 * Math.cos(d * 73); } }
  return { x, y, s, dx, dy };
};
// a push-in framing: the largest scale (1.12 … 1.045) that keeps the focus inside the safe area, centred on it
export const pushOf = (focus) => {
  if (!focus) return null;
  const fx = focus[0] + focus[2] / 2, fy = focus[1] + focus[3] / 2;
  for (const s of [1.12, 1.1, 1.08, 1.06, 1.045]) {
    const hw = 960 / s, hh = 540 / s, cx = clamp(fx, hw, SW - hw), cy = clamp(fy, hh, SH - hh);
    const L = (focus[0] - cx) * s + 960, T = (focus[1] - cy) * s + 540, R = L + focus[2] * s, B = T + focus[3] * s;
    if (L >= 60 && T >= 140 && R <= 1860 && B <= 960) return { cx, cy, s };
  }
  return { cx: 960, cy: 540, s: 1.045 };
};
// the pushes of a stamp sheet (timing.rules.js pushBeats), in seconds from the brick's start
export const pushTimes = (stampB, N0, beat, issue = false) => {
  const st = ARRIVE_B + stampB, back = ARRIVE_B + N0, hold = Math.max(st + (issue ? FLOOD_AFTER_B + FLOOD_B : 1), back - PUSH_BACK_B);
  return { from: (st - 1.5) * beat, at: (st - 0.5) * beat, stamp: st * beat, hold: hold * beat, back: (hold + PUSH_BACK_B) * beat };
};
// textures, made once per brick
export const texturesOf = (P, seed = 7) => {
  const paper = paperTile(seed), grain = canvasOf(256, 256), g = grain.getContext('2d'), img = g.createImageData(256, 256), r = mulberry32(seed + 3);
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(128 + (r() - 0.5) * 2 * 26); img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  return { paper, grain };
};
const fadeA = (it, t) => (it.fadeOut === undefined ? 1 : it.fadeDur !== undefined ? 1 - E.quadIn((t - it.fadeOut) / it.fadeDur) : 1 - clamp((t - it.fadeOut) / 0.45));
export const drawList = (c2, P, items, t) => { for (const it of items) { const a = fadeA(it, t); if (a <= 0) continue; if (a < 1) { c2.save(); c2.globalAlpha *= a; drawItem(c2, P, it, t); c2.restore(); } else drawItem(c2, P, it, t); } };
// the world under the camera: ground, paper, drafting grid (fine 40 px, major 200 px), the sheet's items
export const drawWorld = (c2, P, cam, items, t, { extent = [-2400, -1400, 6240, 3880], world = null, k = 1 } = {}) => {
  c2.save();
  c2.fillStyle = P.bg; c2.fillRect(0, 0, SW, SH);
  const ox = 960 - cam.x * cam.s + cam.dx, oy = 540 - cam.y * cam.s + cam.dy;
  c2.setTransform(cam.s * k, 0, 0, cam.s * k, ox * k, oy * k);
  c2.fillStyle = P.paper; c2.fillRect(...extent);
  const view = [-ox / cam.s, -oy / cam.s, SW / cam.s, SH / cam.s];
  const fineA = P.grid[0] * clamp((cam.s - 0.42) / 0.4);
  const lines = (step, off, w, a) => {
    if (a <= 0.001) return;
    const x0 = Math.max(extent[0], view[0]), y0 = Math.max(extent[1], view[1]), x1 = Math.min(extent[0] + extent[2], view[0] + view[2]), y1 = Math.min(extent[1] + extent[3], view[1] + view[3]);
    c2.beginPath();
    for (let x = Math.ceil((x0 - off) / step) * step + off; x <= x1; x += step) { c2.moveTo(x, y0); c2.lineTo(x, y1); }
    for (let y = Math.ceil((y0 - off) / step) * step + off; y <= y1; y += step) { c2.moveTo(x0, y); c2.lineTo(x1, y); }
    c2.strokeStyle = rgba(P.line, a); c2.lineWidth = w; c2.stroke();
  };
  lines(40, 0, 1, fineA);
  lines(200, 120, 2, P.grid[1]);
  if (world) world(c2, t, cam);
  drawList(c2, P, items, t);
  c2.restore();
};
// screen space over the world: the warm lamp drifting, the paper tile, grain, vignette
export const drawLight = (c2, P, T, t, t0 = 0, k = 1) => {
  c2.save(); c2.setTransform(k, 0, 0, k, 0, 0);
  const tt = t0 + t, lx = 650 + tt * 14, ly = 390 + Math.sin(tt * 0.21) * 60;
  const lamp = c2.createRadialGradient(lx, ly, 0, lx, ly, 820);
  lamp.addColorStop(0, rgba(P.lamp.color, P.lamp.alpha)); lamp.addColorStop(1, rgba(P.lamp.color, 0));
  c2.globalCompositeOperation = P.lamp.mode; c2.fillStyle = lamp; c2.fillRect(0, 0, SW, SH);
  c2.globalCompositeOperation = P.texture.mode; c2.globalAlpha = P.texture.alpha * 0.35; c2.fillStyle = c2.createPattern(T.paper, 'repeat'); c2.fillRect(0, 0, SW, SH);
  c2.globalCompositeOperation = 'overlay'; c2.globalAlpha = P.dark ? 0.05 : 0.035; c2.fillStyle = c2.createPattern(T.grain, 'repeat'); c2.fillRect(0, 0, SW, SH);
  c2.globalCompositeOperation = 'source-over'; c2.globalAlpha = 1;
  const vig = c2.createRadialGradient(960, 518, 0, 960, 518, 1180);
  vig.addColorStop(0.58, rgba(P.vignette.color, 0)); vig.addColorStop(1, rgba(P.vignette.color, P.vignette.alpha));
  c2.fillStyle = vig; c2.fillRect(0, 0, SW, SH);
  c2.restore();
};

// ---------- the frame (HUD): hud.js reduced to a still frame with its fixed words as slots ----------
export const hudDefaults = {
  en: { title: 'Northwind', subtitle: 'Releases, reviewed first', corner: 'MIT · Open source', sheet: 1, total: 7, name: 'Problem statement', words: { approvedBy: 'Approved by', sheet: 'Sheet', scale: 'Scale', sheetLabel: 'Sheet', sheetsLabel: 'Sheets {n}', all: 'All' } },
  zh: { title: 'Northwind', subtitle: '先审核，再发布', corner: 'MIT · 开源', sheet: 1, total: 7, name: '问题说明', words: { approvedBy: '批准', sheet: '张次', scale: '比例', sheetLabel: '第 {n} 张', sheetsLabel: '第 {n} 张', all: '全部' } },
};
export const makeHud = (P, mctx, meta, L) => {
  mctx = mctx || canvasOf(8, 8).getContext('2d');
  const pen = makePen(P, mctx, { lang: L });
  const W0 = { ...hudDefaults[L === 'zh' ? 'zh' : 'en'].words, ...(meta.words || {}) };
  const fl = { fam: 'mono', w: 400, size: 26, track: 0.14 }, fsub = { fam: 'mono', w: 400, size: 25, track: 0.12 };
  const label = meta.sheet === 'all' ? `${up((W0.sheetsLabel || W0.sheetLabel).replace('{n}', `1–${meta.total - 1}`))} · ${up(meta.name)}` : (W0.sheetLabel.includes('{n}') ? W0.sheetLabel.replace('{n}', meta.sheet) : `${up(W0.sheetLabel)} ${meta.sheet}`) + ` · ${up(meta.name)}`;
  const subLine = `${up(meta.title)} · ${up(meta.subtitle)}`;
  const panelW = Math.max(640, 120 + Math.max(pen.measure(label, fl), pen.measure(subLine, fsub)) + 36);
  pen.line([[24, 24], [1896, 24], [1896, 1056], [24, 1056], [24, 24]], -9, 0.9, 's1');
  pen.line([[36, 36], [1884, 36], [1884, 1044], [36, 1044], [36, 36]], -9, 0.9, 'sg');
  for (let i = 1; i < 8; i++) { pen.seg(i * 240, 24, i * 240, 36, -9, 0.1, 'sf'); pen.seg(i * 240, 1044, i * 240, 1056, -9, 0.1, 'sf'); }
  for (let i = 1; i < 4; i++) { pen.seg(24, i * 270, 36, i * 270, -9, 0.1, 'sf'); pen.seg(1884, i * 270, 1896, i * 270, -9, 0.1, 'sf'); }
  const fz = { fam: 'mono', w: 400, size: 15, track: 0.1 };
  '12345678'.split('').forEach((d, i) => pen.text(d, 120 + i * 240, 19, fz, -9, 0.3, { col: 'line', mode: 'fade', align: 'center' }));
  'ABCD'.split('').forEach((d, i) => pen.text(d, 16, 140 + i * 270, fz, -9, 0.3, { col: 'line', mode: 'fade' }));
  pen.circle(98, 88, 42, -9, 0.5, 's1');
  pen.seg(58, 92, 138, 92, -9, 0.25, 's1');
  const fcorner = { fam: 'mono', w: 400, size: 25, track: 0.14 };
  if (meta.corner) pen.text(up(meta.corner), 1856, 84, fcorner, -9, 0.4, { col: 'line', align: 'right', mode: 'fade' });
  pen.seg(64, 1000, 304, 1000, -9, 0.4, 's1');
  for (let i = 0; i <= 4; i++) pen.seg(64 + i * 60, 992, 64 + i * 60, 1008, -9, 0.1, 's1');
  pen.custom(-9, (ctx) => { ctx.fillStyle = P.line; ctx.fillRect(64, 996, 60, 8); ctx.fillRect(184, 996, 60, 8); });
  [['0', 64], ['100', 176], ['200 MM', 296]].forEach(([s, x]) => pen.text(s, x, 1034, fz, -9, 0.3, { col: 'line', mode: 'fade' }));
  const fk = { fam: 'mono', w: 400, size: 25, track: 0.12 }, fv = { fam: 'mono', w: 500, size: 28 };
  let fname = { fam: 'cond', w: 700, size: 40 };
  while (pen.measure(meta.title || '', fname) > 420 && fname.size > 28) fname = { ...fname, size: fname.size - 1 };
  const Wm = (s, f) => pen.measure(s, f), PAD = 16, RIGHT = 1880, BOTTOM = 1040, BH = 156, NAME_H = 56, KEY_H = 44;
  const sheetW = Math.max(Wm(up(W0.sheet), fk), Wm(up(W0.all), fv), Wm('9 / 9', fv)) + 2 * PAD;
  const scaleW = Math.max(Wm(up(W0.scale), fk), Wm('1.1:1', fv), Wm('1:2.4', fv)) + 2 * PAD;
  const rightW = Math.max(Wm(meta.title || '', fname) + 2 * PAD, sheetW + scaleW);
  const apW = Math.max(Wm(up(W0.approvedBy), fk) + 2 * PAD, 250);
  const bw = apW + rightW, bx = RIGHT - bw, by = BOTTOM - BH;
  pen.custom(-9, (ctx) => { ctx.save(); ctx.globalAlpha *= 0.88; ctx.fillStyle = P.bg; ctx.fillRect(bx, by, bw, BH); ctx.restore(); });
  pen.rect(bx, by, bw, BH, -9, 0.45, 's1');
  pen.seg(bx + apW, by, bx + apW, by + BH, -9, 0.45, 's1');
  pen.seg(bx + apW, by + NAME_H, bx + bw, by + NAME_H, -9, 0.45, 's1');
  pen.seg(bx + apW + sheetW, by + NAME_H, bx + apW + sheetW, by + BH, -9, 0.45, 's1');
  pen.text(up(W0.approvedBy), bx + PAD, by + 34, fk, -9, 0.4, { col: 'line', mode: 'fade' });
  pen.text(meta.title || '', bx + apW + PAD, by + 42, fname, -9, 0.4, { mode: 'fade' });
  const cx1 = bx + apW + PAD, cx2 = bx + apW + sheetW + PAD, ky = by + NAME_H + 34, vy = by + NAME_H + 80;
  pen.text(up(W0.sheet), cx1, ky, fk, -9, 0.4, { col: 'line', mode: 'fade' });
  pen.text(up(W0.scale), cx2, ky, fk, -9, 0.4, { col: 'line', mode: 'fade' });
  const sheetStr = meta.sheet === 'all' ? up(W0.all) : `${meta.sheet} / ${meta.total}`;
  const top = meta.sheet === 'all' ? `1-${meta.total - 1}` : String(meta.sheet);
  return { items: pen.items, panel: [44, 40, panelW, 96], block: [bx, by, bw, BH], approve: [bx + PAD / 2, by + KEY_H, apW - PAD, BH - KEY_H - 6], label: zf(label, fl), labelStr: label, sub: subLine, fsub: zf(subLine, fsub), top, total: meta.total, sheetStr, cx1, cx2, vy, fv };
};
// fold: 0 open … 1 folded back to the bubble (while the camera is pushed in); cam: for the live SCALE field
export const drawHud = (ctx, P, H, cam = { s: 1 }, fold = 0, alpha = 1, k = 1) => {
  if (alpha <= 0) return;
  ctx.save(); ctx.setTransform(k, 0, 0, k, 0, 0); ctx.globalAlpha = alpha;
  const pw = H.panel[2] + (104 - H.panel[2]) * fold, pr = [H.panel[0], H.panel[1], pw, H.panel[3]];
  ctx.save(); ctx.globalAlpha *= 0.9; ctx.fillStyle = P.bg; ctx.fillRect(...pr); ctx.restore();
  ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 2.5; ctx.lineCap = 'square'; ctx.strokeRect(...pr); ctx.restore();
  drawList(ctx, P, H.items, 0);
  const txt = (s, x, y, f, col, align = 'left') => { ctx.font = fontStr(f); ctx.letterSpacing = `${((f.track || 0) * f.size).toFixed(2)}px`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
  const fTop = { fam: 'mono', w: 600, size: H.top.length > 2 ? 25 : 30 }, fBot = { fam: 'mono', w: 500, size: 25 };
  txt(H.top, 98, 82, fTop, P.ink, 'center');
  txt(String(H.total), 98, 121, fBot, P.line, 'center');
  const la = clamp(1 - fold * 3);
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la;
    ctx.beginPath(); ctx.rect(156, 48, Math.max(0, pr[0] + pr[2] - 156), 86); ctx.clip();
    txt(H.labelStr, 164, 82, H.label, P.ink);
    txt(H.sub, 164, 122, H.fsub, P.line);
    ctx.restore();
  }
  txt(H.sheetStr, H.cx1, H.vy, H.fv, P.ink);
  const s = cam.s;
  txt(s >= 1.06 ? `${s.toFixed(1)}:1` : s > 0.97 ? '1:1' : `1:${(1 / s).toFixed(1)}`, H.cx2, H.vy, H.fv, P.ink);
  ctx.restore();
};
// the fold of the label panel over a push (0.2 s each way, around push.from … push.back)
export const foldOf = (push, t) => { if (!push) return 0; const sm = (u) => { u = clamp(u); return u * u * (3 - 2 * u); }; return sm((t - (push.from - 0.1)) / 0.2) * (1 - sm((t - push.back) / 0.2)); };

// ---------- a whole sheet brick, prepared once: items, camera, textures, frame ----------
// plan(pen, env, s) is the sheet type's planner (copied from the template's sheets/<type>.js); cue: beats after arrival
export const prepareSheet = (planFn, cueBeats, s, c, { N0, stampB = null, issue = false, extraItems = null } = {}) => {
  const L = c.lang || 'en', beat = 60 / c.bpm, P = palOf(s.colors, s.palette), mctx = canvasOf(8, 8).getContext('2d');
  setLang(L);
  const pen = makePen(P, mctx, { lang: L, linework: s.linework });
  const cues = cueSec(cueBeats, beat), errs = [];
  const stampT = stampB === null ? null : (ARRIVE_B + stampB) * beat;
  const env = makeEnv(pen, P, mctx, { cues, beat, seed: s.seed || 7, stampT, errs });
  // the drawing's layout (release key plan): the 3-column serpentine of `frame.total` sheets
  { const n = (s.frame && s.frame.total) || 7, cols = 3; env.layout = { cols, rows: Math.ceil(n / cols), n, cellOf: (k) => { const row = Math.floor(k / cols), c0 = k % cols; return { row, col: row % 2 ? cols - 1 - c0 : c0 }; } }; }
  sheetFrame(pen, P, s.sheetNo, beat);
  const out = planFn(pen, env, s) || {};
  if (extraItems) extraItems(pen, env, out);
  const push = stampB !== null && out.focus ? { ...pushTimes(stampB, N0, beat, issue), ...pushOf(out.focus) } : null;
  return { P, pen, out, cues, beat, push, stampT, errs, T: texturesOf(P, s.seed || 7) };
};

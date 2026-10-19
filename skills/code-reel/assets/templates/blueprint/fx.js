// fx.js — drafting primitives for the blueprint template.
// Every primitive is planned once at init (geometry from measured text) and drawn later as a pure
// function of t: an item knows its start time t0 and duration, nothing else changes between frames.
import { clamp, hexToRgb } from './lib/motion.js';
import { mulberry32, fbm, hash } from './lib/rng.js';

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

export const rgba = (hex, a = 1) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };

// ---------- fonts ----------
export const FAM = { cond: 'Plex Condensed', mono: 'Plex Mono' };
export const fontStr = (f) => `${f.w || 400} ${f.size}px "${FAM[f.fam]}"`;
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
    const c = document.createElement('canvas');
    c.width = c.height = N;
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
    const c = document.createElement('canvas');
    c.width = c.height = graphiteMask.width;
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
  const pencil = o.linework === 'pencil';
  const items = [];
  const add = (it) => (items.push(it), it);
  const pen = {
    items,
    P,
    measure: (str, f) => measureT(mctx, str, f),
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
      const w = measureT(mctx, str, f);
      const align = o.align || 'left';
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      return add({ k: 'text', str, x: x0, y, w, f, t0, dur, col: o.col || 'ink', mode: o.mode || 'wipe', ease: o.ease || E.cubicInOut, spans: o.spans, rect: [x0, y - f.size * 0.82, w, f.size * 1.08] });
    },
    // construction lines (baseline + cap line) that run past the lettering, drawn just before it
    guides(base, size, t0, x1 = 80, x2 = 1840) {
      pen.seg(x1, base, x2, base, t0, 0.55, 'sg');
      pen.seg(x1, base - size * CAP, x2, base - size * CAP, t0 + 0.08, 0.55, 'sg');
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
  const W = String(word).toUpperCase(), Sm = String(small || '').toUpperCase();
  const ww = measureT(mctx, W, fw), sw = Sm ? measureT(mctx, Sm, fs) : 0;
  const padX = size * 0.45, padT = size * 0.17, gap = size * 0.1;
  const inner = { w: Math.max(ww, sw) + padX * 2, h: size * 0.78 + padT * 2 + (Sm ? fs.size + gap : 0) };
  const off = 13; // outer ring offset (border 6 + gap 7)
  const w = inner.w + off * 2, h = inner.h + off * 2;
  const k = 2;
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
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
  const c = document.createElement('canvas');
  c.width = c.height = size;
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

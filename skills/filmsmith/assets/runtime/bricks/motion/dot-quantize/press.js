// press.js — the engine of the halftone bricks: print logic on a newsprint frame. One anchor (the piece of the
// product's mark printed in the process ink) sits on one screen point P = (1440, 540) from the first frame to the
// lock-up; every world is a procedural tone field centred on it, printed by an AM screen (two plates: black at 45°,
// the process ink at 15°; dots vary in size and never in grey); type knocks the plate out round itself. Pure: every
// function is of its arguments; the scenes (anchor-rise, field-card, cell-count, burst-claim, mark-pullback), the
// anchor-mark prop and the dot-quantize motion import it.
// From the halftone template (assets/templates/halftone/screen.js, fields.js, film.js): the screen, the eight fields,
// the anchor and mark plates, the type scale (28 × 1.36ⁿ) and the text column (x 150–1130) are the template's.
import { fontOf } from '../../../handoffs/util.js';
import { clamp, lerp, cubicOut, cubicInOut, quintOut, expOut, expIn } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { fontFor, readTime, graphemes } from '../../lang.js';
import LOOK from '../../look/newsprint/look.js';

export const W = 1920, H = 1080;
export const P = [1440, 540];               // the anchor's screen point
export const X0 = 150, TEXT_R = 1130, COL = 1060;
export const SCALE = [28, 38, 52, 71, 96, 131, 178, 242];
export const ANGLE_K = 45, ANGLE_C = 15, MARK_H = 405, MARK_PITCH = 7, ANCHOR_H = 220, Q = 23;
// text motion (s): rises through its baseline mask in 0.24 s starting 0.12 s before its beat; leaves in 0.17 s
export const RISE = 0.24, LEAD = 0.12, EXIT = 0.17;
export const secs = (beats, bpm) => (beats * 60) / bpm;
const TAU = Math.PI * 2;
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

// ── colour: paper or ink ground; the accent prints the anchor and nothing else ──────────────────────────────────
export const worldColors = (C, ground = 'paper') => (ground === 'ink' ? { ground: C.ink, ink: C.ground, dim: C.dimInk || C.dim } : { ground: C.ground, ink: C.ink, dim: C.dim });

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const look = LOOK;
export const display = (lang, size, weight = 800) => fontFor(LOOK, 'display', lang, size, weight, 'display');
export const textF = (lang, size, weight = 500) => fontFor(LOOK, 'text', lang, size, weight);
export const monoF = (lang, size, weight = 500) => fontFor(LOOK, 'mono', lang, size, weight);
export const widthOf = (ctx, s, f) => { ctx.save(); ctx.font = fontOf(f); if ('letterSpacing' in ctx) ctx.letterSpacing = `${f.spacing || 0}px`; const w = ctx.measureText(String(s ?? '')).width; ctx.restore(); return w; };
// the first size of `sizes` at which s fits maxW
export const fitSize = (ctx, s, mk, sizes, maxW) => { for (const z of sizes) if (widthOf(ctx, s, mk(z)) <= maxW) return { size: z, ok: true }; return { size: sizes[sizes.length - 1], ok: false }; };
// type with a paper knock-out round it: the plate under the type is cleared, so dots never touch a glyph
export const knockText = (ctx, s, x, y, f, { color, paper, knock = 0, align = 'left', alpha = 1 }) => {
  ctx.save(); ctx.font = fontOf(f); if ('letterSpacing' in ctx) ctx.letterSpacing = `${f.spacing || 0}px`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha *= alpha;
  if (knock > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = knock * 2; ctx.strokeStyle = paper; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
};
// one text element at t (s): rises through its baseline mask onto `land`; leaves up through it from `exitAt`
export const riseText = (ctx, e, t, wc, { exitAt = null, statik = false, alpha = 1 } = {}) => {
  if (!e.str) return;
  const r0 = e.land - LEAD;
  if (!statik && t < r0) return;
  const u = statik ? 1 : cubicOut((t - r0) / RISE), x = exitAt == null ? 0 : clamp((t - exitAt) / EXIT);
  if (x >= 1) return;
  const dy = (1 - u) * e.f.size * 0.95 - x * x * x * e.f.size * 0.95;
  ctx.save(); ctx.beginPath(); ctx.rect(0, e.y - e.f.size * 1.02, W, e.f.size * 1.3); ctx.clip();
  knockText(ctx, e.str, e.x, e.y + dy, e.f, { color: e.role === 'dim' ? wc.dim : wc.ink, paper: wc.ground, knock: Math.max(6, Math.round(e.f.size * 0.07)), alpha });
  ctx.restore();
};
// the mono label is set as written (the template keeps it lower case); Chinese takes no tracking
export const label = (s) => String(s ?? ''); // the template sets its mono labels as written (lower case), never in capitals

// ── the screen: an AM halftone (dots on a fixed grid at an angle; only their size carries the tone) ───────────────
export const SHAPES = ['round', 'square', 'line'];
export const dotR = (v, p) => { if (v <= 0.003) return 0; if (v < 0.785) return p * Math.sqrt(v / Math.PI); return p * (0.5 + 0.2072 * Math.min(1, (v - 0.785) / 0.215)); };
export const screen = (ctx, { x0 = 0, y0 = 0, x1 = W, y1 = H, pitch = 14, angle = 45, ox = 960, oy = 540, tone, color, shape = 'round' }) => {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), p = pitch;
  let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    const dx = x - ox, dy = y - oy, u = (dx * c + dy * s) / p, v = (-dx * s + dy * c) / p;
    umin = Math.min(umin, u); umax = Math.max(umax, u); vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
  }
  const Pt = new Path2D();
  for (let i = Math.floor(umin) - 1; i <= Math.ceil(umax) + 1; i++) for (let j = Math.floor(vmin) - 1; j <= Math.ceil(vmax) + 1; j++) {
    const x = ox + (i * c - j * s) * p, y = oy + (i * s + j * c) * p;
    if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
    const v = tone(x, y);
    if (!(v > 0.004)) continue;
    if (shape === 'square') {
      const h = (p * Math.sqrt(Math.min(1, v) * 1.02)) / 2, ux = c * h, uy = s * h, vx = -s * h, vy = c * h;
      Pt.moveTo(x + ux + vx, y + uy + vy); Pt.lineTo(x - ux + vx, y - uy + vy); Pt.lineTo(x - ux - vx, y - uy - vy); Pt.lineTo(x + ux - vx, y + uy - vy); Pt.closePath();
    } else if (shape === 'line') {
      const hl = p * 0.52, ht = (p * Math.min(1, v)) / 2;
      if (ht < 0.25) continue;
      const ux = c * hl, uy = s * hl, vx = -s * ht, vy = c * ht;
      Pt.moveTo(x + ux + vx, y + uy + vy); Pt.lineTo(x - ux + vx, y - uy + vy); Pt.lineTo(x - ux - vx, y - uy - vy); Pt.lineTo(x + ux - vx, y + uy - vy); Pt.closePath();
    } else { const r = dotR(v, p); if (r <= 0.2) continue; Pt.moveTo(x + r, y); Pt.arc(x, y, r, 0, TAU); }
  }
  ctx.fillStyle = color; ctx.fill(Pt);
};

// ── fields: one generating function round the anchor whose parameters change; never a picture ─────────────────────
export const KINDS = ['rings', 'cross', 'cells', 'count', 'rows', 'wave', 'grid', 'none'];
export const DEF = { lam: 104, R: 560, M: 0.5, r0: 150, pitch: 14 };
export const HOOK = { lam: 128, R: 470, M: 0.36, r0: 190, pitch: 24 };
const SOURCES = [[0, 0], [-250, 260], [220, -280]];
export const spiral = (A, n) => Array.from({ length: n }, (_, k) => { if (k === 0) return [A[0], A[1]]; const r = 150 * Math.sqrt(k), th = k * 2.39996 + 0.6; return [A[0] + r * Math.cos(th), A[1] + r * Math.sin(th) * 0.86]; });
const envelope = (x, y, A, o) => { const d = Math.hypot(x - A[0], y - A[1]); return { d, e: clamp(1 - (d - o.r0) / (o.R - o.r0)) * sm(COL, COL + 140, x) * sm(o.r0 - 30, o.r0 + 30, d) }; };
const ring = (d, lam, ph) => 0.5 - 0.5 * Math.cos((TAU * d) / lam - TAU * ph);
const fade = (dj) => clamp(1 - (Math.abs(dj) - 4) / 1.5);
// tone(x, y) for a field; st = { A, o, ph (beats, stepped), k (beat index), on (cross), n (count), seed, cut }
export const toneOf = (kind, st) => {
  const { A, o } = st, lam = o.lam, M = o.M;
  switch (kind) {
    case 'rings': return (x, y) => { const { d, e } = envelope(x, y, A, o); return e > 0 ? M * e * ring(d - o.r0, lam, st.ph) : 0; };
    case 'cross': {
      const S = SOURCES.map(([dx, dy]) => [A[0] + dx, A[1] + dy]), on = st.on ?? [1, 1, 1];
      return (x, y) => {
        const { e } = envelope(x, y, A, { ...o, R: o.R + 60 });
        if (e <= 0) return 0;
        let h = 0, w = 0;
        S.forEach(([sx, sy], k) => { const a = on[k] ?? 0; if (a <= 0) return; const d = Math.hypot(x - sx, y - sy), f = k === 0 ? 1 : clamp((a * 1600 - d) / 90); if (f <= 0) return; h += f * Math.cos((TAU * d) / lam - TAU * st.ph); w += f; });
        return w > 0 ? M * e * Math.pow(0.5 + (0.5 * h) / Math.max(1, w), 2.2) * 1.25 : 0;
      };
    }
    case 'cells': case 'count': {
      const S = kind === 'count' ? spiral(A, Math.max(1, st.n | 0)) : SOURCES.map(([dx, dy]) => [A[0] + dx, A[1] + dy]);
      const gut = 26 * (st.cut ?? 1), act = kind === 'cells' ? (((st.k ?? 0) % S.length) + S.length) % S.length : -1;
      return (x, y) => {
        const { e } = envelope(x, y, A, { ...o, R: o.R + (kind === 'count' ? -40 : 60) });
        if (e <= 0) return 0;
        let d0 = Infinity, d1 = Infinity, k0 = 0;
        S.forEach(([sx, sy], k) => { const d = Math.hypot(x - sx, y - sy); if (d < d0) { d1 = d0; d0 = d; k0 = k; } else if (d < d1) d1 = d; });
        if (S.length > 1 && d1 - d0 < gut) return 0;
        const amp = act < 0 ? 0.84 : k0 === act ? 1 : 0.62, inner = kind === 'count' ? sm(18, 46, d0) : 1;
        return M * e * amp * inner * ring(d0, kind === 'count' ? lam * 0.62 : lam, st.ph);
      };
    }
    case 'rows': {
      const rowH = 2 * Q, c0 = -16, c1 = 16;
      return (x, y) => {
        const cx = Math.floor((x - A[0]) / Q + 0.5), cy = (y - A[1]) / Q + 0.5;
        if (cx < c0 || cx > c1) return 0;
        const r = cy / 2 + st.ph, j = Math.floor(r);
        if ((r - j) * rowH >= Q || Math.abs(j - st.ph) > 5.5) return 0;
        const amp = M * 1.3 * fade(j - st.ph);
        if (cx === c0) return 1.1 * amp;
        let c = c0 + 2;
        for (let w = 0; w < 12 && c <= c1; w++) { const len = 2 + Math.floor(5 * hash(j * 31 + w, st.seed)); if (cx >= c && cx < Math.min(c1 + 1, c + len)) return (0.6 + 0.3 * hash(j * 7 + w, st.seed + 1)) * amp; c += len + 1; }
        return 0;
      };
    }
    case 'wave': {
      const bw = 26, n = 34, x0 = A[0] - (n * bw) / 2;
      return (x, y) => {
        const i = Math.floor((x - x0) / bw);
        if (i < 0 || i >= n || x - x0 - i * bw > bw - 8) return 0;
        const g = i + Math.floor(st.ph) * 4, amp = 60 + 300 * Math.pow(hash(g, st.seed), 1.6) * (0.4 + 0.6 * Math.abs(Math.sin(g * 0.37))), dy = Math.abs(y - A[1]);
        if (dy > amp) return 0;
        return M * 1.25 * (1 - (0.5 * dy) / amp) * (1 - 0.6 * sm(0, 1, Math.abs(i - n / 2) / (n / 2))) * sm(COL, COL + 140, x);
      };
    }
    case 'grid': {
      const cs = 92, nx = 7, ny = 6, gx = A[0] - (nx * cs) / 2, gy = A[1] - (ny * cs) / 2, done = Math.max(0, Math.floor(st.ph) + 4);
      return (x, y) => {
        const i = Math.floor((x - gx) / cs), j = Math.floor((y - gy) / cs);
        if (i < 0 || i >= nx || j < 0 || j >= ny || x - gx - i * cs > cs - 16 || y - gy - j * cs > cs - 16) return 0;
        return Math.floor(hash(i * 13 + j, st.seed) * nx * ny) < done * 2 ? Math.min(1, M * 1.8) : M * (0.35 + 0.35 * hash(i, j + st.seed));
      };
    }
    default: return () => 0;
  }
};
// field `a` → field `b` behind a front running out from the anchor (u 0..1): one field, new parameters, no cross-fade
export const morphTone = (a, b, A, u, width = 220) => {
  if (u <= 0) return a; if (u >= 1) return b;
  const R = u * (2200 + width) - width;
  return (x, y) => { const k = clamp((R - Math.hypot(x - A[0], y - A[1])) / width); return k <= 0 ? a(x, y) : k >= 1 ? b(x, y) : a(x, y) * (1 - k) + b(x, y) * k; };
};
// the per-beat step (T0): a whole step lands on each beat, eased over 0.4 beat, then still
export const stepped = (b) => { const k = Math.floor(b); return k + quintOut(clamp((b - k) / 0.4)); };
// the field of a scene at b beats from its start: kind, its params (hook or default), seed; quant: whole beats only
export const fieldTone = (kind, b, { seed = 1, hook = false, n = 12, quant = false } = {}) => {
  const st = { A: P, o: hook ? HOOK : DEF, seed, ph: quant ? Math.floor(Math.max(0, b)) : stepped(Math.max(0, b)), k: Math.floor(b), n };
  if (kind === 'cross') st.on = [1, clamp((b + 0.25) / 1.2), clamp((b - 0.75) / 1.2)];
  if (kind === 'cells') st.cut = cubicOut(clamp((b + 0.25) / 0.6));
  return toneOf(kind, st);
};
export const drawField = (ctx, tone, color, { pitch = DEF.pitch, shape = 'round' } = {}) => screen(ctx, { x0: COL - 20, y0: 0, x1: W, y1: H, pitch, angle: ANGLE_K, ox: P[0], oy: P[1], tone, color, shape });
// a quantized field: binary blocks of side Q·k on a grid anchored at P (k from level(x, y), 0..1 per block)
export const drawBlocks = (ctx, level, color, clip = null) => {
  const p = new Path2D(), ni = Math.ceil((W - COL) / Q) + 2, nj = Math.ceil(H / Q) + 2;
  for (let i = -ni; i <= ni; i++) for (let j = -nj; j <= nj; j++) {
    const x = P[0] + i * Q, y = P[1] + j * Q;
    if (x < COL - Q || x > W + Q || y < -Q || y > H + Q || (clip && !clip(x, y))) continue;
    const k = level(x, y);
    if (k <= 0.02) continue;
    const w = Q * Math.min(1, k) - 3;
    if (w > 0.5) p.rect(x - w / 2, y - w / 2, w, w);
  }
  ctx.fillStyle = color; ctx.fill(p);
};
export const binOf = (tone, M = DEF.M) => (x, y) => (tone(x, y) > M * 0.42 ? 1 : 0);

// ── the anchor and the mark (made up for the samples: a microphone capsule and three arcs of sound) ───────────────
const band = (r, w, deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), ro = r + w / 2, ri = r - w / 2, h = w / 2;
  const p = (rr, sg) => `${(rr * c).toFixed(4)} ${(sg * rr * s).toFixed(4)}`;
  return `M ${p(ro, -1)} A ${ro} ${ro} 0 0 1 ${p(ro, 1)} A ${h} ${h} 0 0 1 ${p(ri, 1)} A ${ri} ${ri} 0 0 0 ${p(ri, -1)} A ${h} ${h} 0 0 1 ${p(ro, -1)} Z`;
};
export const MARK = {
  accent: 'M -0.06 -0.09 A 0.06 0.06 0 0 1 0.06 -0.09 L 0.06 0.09 A 0.06 0.06 0 0 1 -0.06 0.09 Z',
  ink: [band(0.25, 0.08, 48), band(0.39, 0.075, 48), band(0.53, 0.07, 48)].join(' '),
  box: [-0.075, -0.45, 0.58, 0.45], anchorBox: [-0.06, -0.15, 0.06, 0.15], lambda: 0.14, ringAt: 0.25,
};
// the geometry of a mark: px per mark unit at the lock-up (U), the anchor's scale through the film (ZA), the push-in
// scale before the lock-up (ZP), and its Path2Ds
export const markGeo = (mark = MARK) => {
  const [, by0, , by1] = mark.box, [, ay0, , ay1] = mark.anchorBox, U = MARK_H / (by1 - by0), ZA = ANCHOR_H / ((ay1 - ay0) * U);
  return { mark, U, ZA, ZH: ZA * 1.45, ZP: 24 / MARK_PITCH, ink: new Path2D(mark.ink), acc: new Path2D(mark.accent) };
};
const boxOf = (A, k, b, pad = 0.02) => ({ x0: Math.max(0, A[0] + (b[0] - pad) * k), y0: Math.max(0, A[1] + (b[1] - pad) * k), x1: Math.min(W, A[0] + (b[2] + pad) * k), y1: Math.min(H, A[1] + (b[3] + pad) * k) });
// the anchor: a paper knock-out with a 3 px trap and the process ink's dots at 15°, shaded top to bottom
export const drawAnchor = (ctx, G, A, Z, C, { sq = 0, gain = 1, shape = 'round' } = {}) => {
  const k = G.U * Z, [ax0, ay0, ax1, ay1] = G.mark.anchorBox;
  ctx.save();
  if (sq) { ctx.translate(A[0], A[1]); ctx.scale(1 + 0.5 * sq, 1 - sq); ctx.translate(-A[0], -A[1]); }
  const m = ctx.getTransform();
  ctx.setTransform(m.multiply(new DOMMatrix([k, 0, 0, k, A[0], A[1]])));
  ctx.lineJoin = 'round'; ctx.lineWidth = 6 / k; ctx.strokeStyle = C.ground; ctx.stroke(G.acc);
  ctx.fillStyle = C.ground; ctx.fill(G.acc); ctx.clip(G.acc);
  ctx.setTransform(m);
  screen(ctx, { ...boxOf(A, k, G.mark.anchorBox), pitch: MARK_PITCH * Z, angle: ANGLE_C, ox: A[0], oy: A[1], color: C.accent, shape,
    tone: (x, y) => { const v = (y - A[1]) / k, u = (x - A[0]) / k; return clamp((0.5 + 0.38 * ((v - ay0) / (ay1 - ay0)) + 0.1 * Math.cos(((u - ax0) / (ax1 - ax0)) * Math.PI)) * gain, 0, 1); } });
  ctx.restore();
};
// the black plate of the mark at scale Z, origin A; `inked` 0..1 a front from the anchor; `gain` a dot gain
export const drawMarkPlate = (ctx, G, A, Z, color, { inked = 1, gain = 1, shape = 'round' } = {}) => {
  const k = G.U * Z;
  ctx.save(); ctx.setTransform(k, 0, 0, k, A[0], A[1]); ctx.clip(G.ink); ctx.setTransform(1, 0, 0, 1, 0, 0);
  screen(ctx, { ...boxOf(A, k, G.mark.box), pitch: MARK_PITCH * Z, angle: ANGLE_K, ox: A[0], oy: A[1], color, shape,
    tone: (x, y) => { const d = Math.hypot(x - A[0], y - A[1]) / k, front = inked >= 1 ? 1 : clamp((inked * 0.9 - d) / 0.12); return clamp((0.97 - 0.42 * clamp(d / 0.6)) * gain) * front; } });
  ctx.restore();
};
// the rings round the anchor in mark space (λ = the mark's ring spacing), outside the mark's plate; amt scales them
export const drawMarkRings = (ctx, G, A, Z, color, amt, shape = 'round') => {
  if (amt <= 0.01) return;
  const k = G.U * Z, R = 0.66, m = new Path2D();
  m.rect(-50, -50, 100, 100); m.addPath(G.ink);
  ctx.save(); ctx.setTransform(k, 0, 0, k, A[0], A[1]); ctx.clip(m, 'evenodd'); ctx.setTransform(1, 0, 0, 1, 0, 0);
  screen(ctx, { x0: Math.max(0, A[0] - R * k), y0: Math.max(0, A[1] - R * k), x1: Math.min(W, A[0] + R * k), y1: Math.min(H, A[1] + R * k), pitch: MARK_PITCH * Z, angle: ANGLE_K, ox: A[0], oy: A[1], color, shape,
    tone: (x, y) => { const d = Math.hypot(x - A[0], y - A[1]) / k; if (d < 0.17 || d > R) return 0; return amt * HOOK.M * clamp((R - d) / 0.12) * clamp((d - 0.17) / 0.05) * (0.5 + 0.5 * Math.cos((TAU * (d - (G.mark.ringAt ?? 0.25))) / (G.mark.lambda ?? 0.14))); } });
  ctx.restore();
};
// the anchor's rise on a film's first beat: 820 px from below, quadratic, then a squash on landing
export const riseOf = (t, landAt) => {
  const u = clamp(t / landAt), q = t - landAt;
  return { A: [P[0], P[1] + 820 * Math.pow(1 - u, 2)], sq: q > 0 ? 0.09 * Math.exp(-q / 0.07) * Math.min(1, q / 0.02) : 0 };
};

export const ground = (ctx, wc) => { ctx.fillStyle = wc.ground; ctx.fillRect(0, 0, W, H); };
export const loadFonts = async (lang) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fams = new Set(Object.values(LOOK.type.families).flatMap((r) => r[lang] || r.en));
  for (const f of fams) for (const w of [500, 800]) { try { await document.fonts.load(`${w} 40px "${f}"`, lang === 'zh' ? '中文 Aa 0' : 'Aa 0'); } catch (e) { /* the stack falls through */ } }
};
export { clamp, lerp, cubicOut, cubicInOut, quintOut, expOut, expIn, hash, readTime, graphemes, fontOf };

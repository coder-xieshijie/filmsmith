// digit-roll — a number changes like an odometer: each digit column rolls a full lap through 0–9 and lands on its new
// digit, the columns starting one after another from the left; separators and units stand still.
// Adapted from video-shotcraft assets/lib/DigitRoll.tsx (the roll that shots list-stack-press and paper-title-card use;
// card references/shots/ui-entrance/list-stack-press.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; digits in fixed cells (the widest
// figure of the font) so a rolling number never shifts sideways; rolls from any old value (laps + the difference)
// instead of from zero only; the label and the illustrative note are the film's slots.
//
// Also the data bricks' shared number helpers (batch 7), until they move into runtime text.js and motion.js:
// `figures` (a string drawn with every digit in a fixed cell: tabular figures on a canvas, which has no
// font-variant-numeric), `figuresWidth`, `grouped` (a number with group separators), and `spring` (the closed-form
// damped spring the data shots time their landings with).
import { clamp, rgba, text, measure, ground } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { graphemes, fontFor } from '../../lang.js';
import { look, copy } from '../../sample.js';

const DIGITS = '0123456789';
const isDigit = (g) => g.length === 1 && g >= '0' && g <= '9';
const ROLL = bez(0.25, 0.8, 0.25, 1);                  // upstream DigitRoll's curve

// ── shared number helpers ─────────────────────────────────────────────────────────────────────────────────────────
const cellOf = (ctx, f) => Math.max(...DIGITS.split('').map((d) => measure(ctx, d, f).width));
// Width of s with every digit in a cell of the widest figure.
export const figuresWidth = (ctx, s, f) => {
  const cell = cellOf(ctx, f);
  return graphemes(String(s)).reduce((w, g) => w + (isDigit(g) ? cell : measure(ctx, g, f).width), 0);
};
// Draw s with tabular figures: each digit centred in a fixed cell, other graphemes at their own width. Returns the width.
export const figures = (ctx, s, x, y, f, { color = '#000000', align = 'left', baseline = 'alphabetic', alpha = 1 } = {}) => {
  const cell = cellOf(ctx, f), gs = graphemes(String(s));
  const ws = gs.map((g) => (isDigit(g) ? cell : measure(ctx, g, f).width)), w = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  gs.forEach((g, i) => { text(ctx, g, cx + ws[i] / 2, y, f, { color, align: 'center', baseline, alpha }); cx += ws[i]; });
  return w;
};
// A whole number with group separators every three digits (the separator is the film's: ',' by default).
export const grouped = (n, sep = ',') => {
  const s = String(Math.round(Math.abs(n)));
  let out = '';
  for (let i = 0; i < s.length; i++) { if (i && (s.length - i) % 3 === 0) out += sep; out += s[i]; }
  return (n < 0 ? '−' : '') + out;
};
// Closed-form damped spring from 0 toward 1 after `frame` frames (stiffness, damping, mass as in the upstream shots);
// with `dur` the spring is time-scaled so it rests (within `rest`) at frame `dur`.
const springAt = (t, k, d, m) => {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k / m), z = d / (2 * Math.sqrt(k * m));
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t)); }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
};
const NATURAL = new Map();
const natural = (k, d, m, rest) => {
  const key = `${k}/${d}/${m}/${rest}`;
  if (!NATURAL.has(key)) { let last = 0; for (let f = 0; f < 1800; f++) if (Math.abs(1 - springAt(f / 30, k, d, m)) > rest) last = f + 1; NATURAL.set(key, last); }
  return NATURAL.get(key);
};
export const spring = (frame, { stiffness = 100, damping = 10, mass = 1, dur = null, rest = 0.005 } = {}) => {
  let f = frame;
  if (dur) { const n = natural(stiffness, damping, mass, rest); if (n > 0) f = (f * n) / dur; }
  return springAt(f / 30, stiffness, damping, mass);
};
// Damping that makes a spring overshoot by `share` of its travel once (ζ from the overshoot ratio).
export const dampingFor = (share, stiffness, mass = 1) => {
  const lp = Math.log(Math.min(0.5, Math.max(1e-4, share)));
  return 2 * (-lp / Math.sqrt(Math.PI * Math.PI + lp * lp)) * Math.sqrt(stiffness * mass);
};

// ── the roll ──────────────────────────────────────────────────────────────────────────────────────────────────────
const framesOf = (P) => P.roll + P.stagger * Math.max(0, graphemes(String(P.to)).length - 1);

export default {
  id: 'digit-roll', kind: 'motion',
  tier: 'T0', family: 'vertical', beats: 3,
  beatsFor: (P) => Math.max(2, Math.ceil(framesOf(P) / 7.5) / 2),
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'a number (the old value, zeros by default)',
  to: 'the new number, every digit landed',
  interpolates: ['each digit column: old digit → laps × 10 + new digit (curve 0.25, 0.8, 0.25, 1), columns 4 frames apart from the left'],
  summary: 'A number changes like an odometer: each digit column rolls a full lap and lands on its new digit, one column after another.',
  theory: 'The odometer: a counter whose wheels carry over reads as a quantity that has been counted, not typed (the mechanical tally of meters and clocks); fixed digit cells keep the number\'s width still, so the eye reads the change, not a jitter.',
  defaults: (ctx = {}) => ({
    from: '0', to: copy('kpis', ctx.lang)[1].value, label: copy('kpis', ctx.lang)[1].label,
    note: ctx.lang === 'zh' ? '示意数据' : 'Illustrative figures',
    at: [960, 600], size: 240, weight: 720, laps: 1, roll: 22, stagger: 4, accent: false,
  }),
  prepare(P) {
    const to = graphemes(String(P.to)), from = graphemes(String(P.from)).filter(isDigit);
    // the old digit under each new digit, counted from the right; missing digits are 0
    let k = from.length;
    const cols = [];
    for (let i = to.length - 1; i >= 0; i--) {
      if (!isDigit(to[i])) { cols[i] = { g: to[i] }; continue; }
      const a = k > 0 ? Number(from[--k]) : 0, b = Number(to[i]);
      cols[i] = { g: to[i], a, b: a + P.laps * 10 + ((b - a + 10) % 10) };   // forward only: laps, then the difference
    }
    return { cols, F: framesOf(P) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * this.beatsFor(P) * 15;
    return { p, o: D.cols.map((c, i) => (c.a == null ? 0 : c.a + (c.b - c.a) * ROLL(clamp((f - i * P.stagger) / P.roll)))) };
  },
  layout(ctx, P, D) {
    const f = fontFor(look, 'display', P.lang, P.size, P.weight), cell = cellOf(ctx, f);
    const ws = D.cols.map((c) => (c.a == null ? measure(ctx, c.g, f).width : cell)), w = ws.reduce((a, b) => a + b, 0);
    const lh = P.size * 1.15, xs = [];
    let x = P.at[0] - w / 2;
    for (const cw of ws) { xs.push(x); x += cw; }
    return { f, ws, xs, lh, top: P.at[1] - lh / 2 };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, L = this.layout(ctx, P, D), ink = P.accent ? c.accent : c.ink, base = L.top + L.lh * 0.8;
    ground(ctx, P);
    D.cols.forEach((col, i) => {
      const x = L.xs[i] + L.ws[i] / 2;
      if (col.a == null) { text(ctx, col.g, x, base, L.f, { color: ink, align: 'center' }); return; }
      const o = S.o[i], d0 = Math.floor(o), fr = o - d0;
      ctx.save(); ctx.beginPath(); ctx.rect(L.xs[i] - 4, L.top, L.ws[i] + 8, L.lh); ctx.clip();
      text(ctx, DIGITS[((d0 % 10) + 10) % 10], x, base - fr * L.lh, L.f, { color: ink, align: 'center' });
      if (fr > 0) text(ctx, DIGITS[(((d0 + 1) % 10) + 10) % 10], x, base + (1 - fr) * L.lh, L.f, { color: ink, align: 'center' });
      ctx.restore();
    });
    const lf = fontFor(look, 'text', P.lang, 44, 550);
    if (P.label) text(ctx, P.label, P.at[0], L.top + L.lh + 70, lf, { color: c.dim, align: 'center' });
    if (P.note) text(ctx, P.note, 96, 1080 - 64, fontFor(look, 'text', P.lang, P.lang === 'zh' ? 28 : 25, 500), { color: rgba(c.dim, 0.9) });
  },
  // one point per digit column at its reel position (the speed the motion blur reads)
  track(S, P, D) { return D.cols.map((c, i) => [P.at[0] + i * 10, P.at[1] - S.o[i] * P.size * 1.15]); },
};

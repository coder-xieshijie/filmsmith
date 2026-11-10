// stagger-in — a set of items (rows, bars, dots, words) arrives in a staggered order, each with its own small landing,
// while the values of the landing (height, offset, blur, tone) can also run as a gradient across the set; an optional
// second wave pulses back through the set from another origin.
// Adapted from video-shotcraft demos/ui-entrance/list-reveal/ListReveal.tsx (card references/shots/ui-entrance/list-reveal.md),
// demos/ui-entrance/value-stagger-gradient/ValueStaggerGradient.tsx (card references/shots/ui-entrance/value-stagger-gradient.md)
// and demos/ui-entrance/radial-wave/RadialWave.tsx (card references/shots/ui-entrance/radial-wave.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); the three shots are three `set`s of one staggered
// entrance (list: settle with a soft back and a slow drift of the whole list; bars: grow with value gradients and a
// pulse from the centre; dots: pop by distance from a source and a return wave); colours by role (the bars' hue sweep
// becomes a tone from dim to the accent, the dots' pale pulse the accent mixed with white); the menu labels, code
// caption, title and glyph icons of the upstream are dropped or replaced by the film's own items (sample copy by
// default); the helpers springAt and riseText are exported for scenes that stagger their own parts.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez, cubicOut } from '../../../motion.js';
import { breaks, fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';

// ── helpers shared with scenes ─────────────────────────────────────────────────────────────────────────────────────
// A damped spring 0 → 1 after `fr` frames at 30 fps (the physical spring of the upstream's springAt: mass 1).
export const springAt = (fr, { damping = 18, stiffness = 170, mass = 1 } = {}) => {
  if (fr <= 0) return 0;
  const t = fr / 30, w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};
export const SOFT_BACK = bez(0.3, 1.18, 0.5, 1);   // about 1.5 % past, the landing frame "clicks"

// Text whose units (words in English, characters in Chinese, by lang.js breaks) rise one after another out of a line
// mask: unit i starts at start + i·gap frames and takes `each` frames; `span` caps the whole stagger (long Chinese
// lines). f is the scene's frame. align: left | center | right of the whole line at x.
export const riseText = (ctx, s, x, y, font, { color, lang = 'en', f, start = 0, each = 18, gap = 3, span = Infinity, align = 'left', ease = EASE.snappy, alpha = 1 } = {}) => {
  const units = breaks(s, lang);
  if (!units.length) return;
  const g = units.length > 1 ? Math.min(gap, span / (units.length - 1)) : gap;
  const parts = units.map((u, i) => (i ? u.sep : '') + u.w);
  const ws = parts.map((p) => measure(ctx, p, font).width);
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const size = font.size;
  for (let i = 0; i < parts.length; i++) {
    const p = ease(clamp((f - start - i * g) / each));
    if (p > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - 4, y - size * 1.12, ws[i] + 8, size * 1.45); ctx.clip();
      text(ctx, parts[i], cx, y + (1 - p) * size * 1.35, font, { color, alpha });
      ctx.restore();
    }
    cx += ws[i];
  }
};

// Stagger keys in [0, 1] for n items: by index, from the centre of the index range, or by distance from a point.
export const keysOf = (n, order = 'index', rects = null, origin = null) => {
  if (order === 'center') { const c = (n - 1) / 2; return Array.from({ length: n }, (_, i) => (c ? Math.abs(i - c) / c : 0)); }
  if (order === 'point' && rects) {
    const o = origin || [960, 540];
    const d = rects.map(([x, y, w, h]) => Math.hypot(x + w / 2 - o[0], y + h / 2 - o[1]));
    const m = Math.max(...d) || 1;
    return d.map((v) => v / m);
  }
  return Array.from({ length: n }, (_, i) => (n > 1 ? i / (n - 1) : 0));
};

// ── the three sets the sample draws (the film passes its own items instead) ────────────────────────────────────────
const ICONS = [
  (g) => { g.moveTo(4, 10.5); g.lineTo(12, 4); g.lineTo(20, 10.5); g.moveTo(5.5, 9.5); g.lineTo(5.5, 20); g.lineTo(18.5, 20); g.lineTo(18.5, 9.5); },
  (g) => { g.moveTo(3.5, 7); g.lineTo(9.5, 7); g.lineTo(11.5, 9); g.lineTo(20.5, 9); g.lineTo(20.5, 19); g.lineTo(3.5, 19); g.closePath(); },
  (g) => { g.rect(3.5, 5, 17, 14); g.moveTo(10.2, 9.2); g.lineTo(10.2, 14.8); g.lineTo(14.8, 12); g.closePath(); },
  (g) => { g.moveTo(4, 6); g.lineTo(20, 6); g.lineTo(20, 16); g.lineTo(11, 16); g.lineTo(6.5, 19.5); g.lineTo(6.5, 16); g.lineTo(4, 16); g.closePath(); },
  (g) => { g.moveTo(14, 4); g.lineTo(18.5, 4); g.lineTo(18.5, 20); g.lineTo(14, 20); g.moveTo(10, 8); g.lineTo(6, 12); g.lineTo(10, 16); g.moveTo(6, 12); g.lineTo(15, 12); },
];
const LIST = { x: 170, y: 236, w: 700, h: 92, gap: 14 };
const listSet = (lang) => {
  const nav = copy('nav', lang), cards = copy('cards', lang);
  const labels = [nav[0], nav[1], nav[2], cards[1].title, nav[3], cards[5].title];
  return labels.map((label, i) => ({
    rect: [LIST.x, LIST.y + i * (LIST.h + LIST.gap) + (i === labels.length - 1 ? 22 : 0), LIST.w, LIST.h],
    kind: 'row', label, key: i === 3 || i === 5 ? null : `0${i + 1}`, badge: i === 3 ? '3' : null, active: i === 0, last: i === labels.length - 1, icon: [0, 1, 2, 3, 3, 4][i],
  }));
};
const barSet = () => Array.from({ length: 16 }, (_, i) => ({ rect: [(8 + i * 5.4) * 19.2, 196 * 4 - 92 * 4, 3.4 * 19.2, 92 * 4], kind: 'bar' }));
const dotSet = () => Array.from({ length: 17 * 9 }, (_, i) => ({ rect: [((i % 17) + 0.5) * (1920 / 17) - 20, (Math.floor(i / 17) + 0.5) * 120 - 20, 40, 40], kind: 'dot' }));

// Per set: timeline length (upstream frames), stagger (start, spread, each), landing curve, order and the extras.
const SETS = {
  list: { frames: 120, start: 2, spread: 50, each: 24, ease: 'softBack', envelope: 'settle', order: 'index', drift: 96 },
  bars: { frames: 150, start: 9, spread: 45, each: 33, ease: 'cubicOut', envelope: 'grow', order: 'index',
          gradient: { height: [1, 0.35], offset: [46 * 4, 14 * 4], blur: [8 * 4, 2 * 4], tone: [0, 1] },
          pulse: { at: 84, width: 27, spread: 19.5, order: 'center', amp: [0.06, 0.42] } },
  dots: { frames: 114, start: 0, spread: 39.9, each: 20.5, ease: 'cubicOut', envelope: 'pop', order: 'point',
          pulse: { at: 70.7, width: 17.1, spread: 28.5, order: 'reverse', amp: [0.8, 0.8] } },
};
const EASES = { softBack: SOFT_BACK, cubicOut, snappy: EASE.snappy, out: EASE.out, linear: (u) => u };

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);

// Built-in painters at the item's own origin; st: { e (landing), lin (linear landing), pulse, k (gradient position) }.
const paintRow = (g, it, w, h, st, P) => {
  const c = P.colors, on = it.active;
  rrect(g, 0, 0, w, h, 24); g.fillStyle = on ? c.paper : c.panel; g.fill();
  g.lineWidth = 1.5; g.strokeStyle = on ? mix(c.paper, c.ink, 0.08) : c.line; g.stroke();
  const pIcon = SOFT_BACK(clamp((st.f - st.t0 - 2) / st.each)), pKey = EASE.out(clamp((st.f - st.t0 - 4) / (st.each - 4)));
  const ink = on ? c.onPaper : it.last ? c.dim : c.ink;
  g.save(); g.translate(30 + 28, h / 2); g.scale(0.72 + 0.28 * pIcon, 0.72 + 0.28 * pIcon); g.globalAlpha *= clamp(pIcon * 2);
  rrect(g, -28, -28, 56, 56, 16); g.fillStyle = on ? mix(c.paper, c.onPaper, 0.06) : mix(c.panel, c.ink, 0.05); g.fill();
  g.translate(-17, -17); g.scale(34 / 24, 34 / 24); g.beginPath(); ICONS[it.icon % ICONS.length](g);
  g.lineWidth = 1.7; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = on ? c.onPaper : it.last ? c.dim : mix(c.ink, c.dim, 0.35); g.stroke();
  g.restore();
  text(g, it.label, 30 + 56 + 26, h / 2 + 16, F(P, 'text', 44, on ? 680 : 560), { color: ink });
  g.save(); g.globalAlpha *= pKey; g.translate((1 - pKey) * 14, 0);
  if (it.badge) {
    const bw = 54; rrect(g, w - 34 - bw, h / 2 - 20, bw, 40, 20); g.fillStyle = c.accent; g.fill();
    text(g, it.badge, w - 34 - bw / 2, h / 2 + 9, F(P, 'text', 26, 750), { color: c.onAccent, align: 'center' });
  } else if (it.key) text(g, it.key, w - 34, h / 2 + 9, F(P, 'mono', infoSize(P.lang), 500), { color: on ? mix(c.paper, c.onPaper, 0.45) : c.dim, align: 'right' });
  g.restore();
};
const paintBar = (g, it, w, h, st, P) => {
  const c = P.colors, tone = mix(mix(c.dim, c.panel, 0.2), c.accent, st.k), hh = h * st.height;
  if (hh <= 0.5) return;
  const top = h - hh;
  const grd = g.createLinearGradient(0, top, 0, h);
  grd.addColorStop(0, mix(tone, '#ffffff', 0.25 + 0.3 * st.pulse)); grd.addColorStop(0.45, mix(tone, '#ffffff', 0.3 * st.pulse)); grd.addColorStop(1, mix(tone, '#000000', 0.25));
  rrect(g, 0, top, w, hh, 16); g.fillStyle = grd; g.fill();
  g.save(); rrect(g, 0, top, w, hh, 16); g.clip(); g.fillStyle = rgba('#ffffff', 0.16); g.fillRect(0, top, w * 0.34, hh); g.restore();
  const ref = g.createLinearGradient(0, h + 6, 0, h + 6 + hh * 0.45);
  ref.addColorStop(0, rgba(tone, 0.32)); ref.addColorStop(1, rgba(tone, 0));
  rrect(g, 0, h + 6, w, hh * 0.45, 16); g.fillStyle = ref; g.fill();
};
const paintDot = (g, it, w, h, st, P) => {
  const c = P.colors, hot = st.pulse > 0.3;
  g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  g.fillStyle = hot ? mix(c.accent, '#ffffff', 0.7) : c.accent;
  if (hot) { g.shadowColor = mix(c.accent, '#ffffff', 0.5); g.shadowBlur = 48; }
  g.fill();
};
const PAINT = { row: paintRow, bar: paintBar, dot: paintDot };

export default {
  id: 'stagger-in', kind: 'motion',
  tier: 'T0', family: 'vertical', beats: 8,
  beatsFor: (P) => (P.frames || (SETS[P.set] || SETS.list).frames) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'paper', 'onPaper', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  from: 'the scene without the set (its ground, or the scene painter `under`)',
  to: 'every item of the set in place, still',
  interpolates: ['per item: opacity, rise, scale, focus blur (settle) · height, offset, blur and tone along a gradient (grow) · scale past 1.5 and back (pop)', 'a whole-set drift', 'a second pulse wave from another origin'],
  summary: 'A set of items arrives one after another, each with its own small landing; values can grade across the set and a second wave can pulse back through it.',
  theory: 'Successive onset groups items and leads the eye in reading order (Wertheimer\'s common fate and the serial-position effect); a gradient of values across the stagger makes the order itself visible (Disney\'s overlapping action).',
  defaults: () => ({ set: 'list', items: null, under: null, order: null, origin: null, frames: null, start: null, spread: null, each: null, ease: null, envelope: null, drift: null, gradient: null, pulse: null }),
  prepare(P) {
    const S = SETS[P.set] || SETS.list;
    const items = P.items || (P.set === 'bars' ? barSet() : P.set === 'dots' ? dotSet() : listSet(P.lang));
    const cfg = { ...S };
    for (const k of ['frames', 'start', 'spread', 'each', 'ease', 'envelope', 'order', 'drift', 'gradient', 'pulse']) if (P[k] != null) cfg[k] = P[k];
    const rects = items.map((it) => it.rect);
    const origin = P.origin || (cfg.envelope === 'pop' ? [960, 540] : null);
    const keys = keysOf(items.length, cfg.order, rects, origin);
    const pk = cfg.pulse ? (cfg.pulse.order === 'reverse' ? keys.map((k) => 1 - k) : keysOf(items.length, cfg.pulse.order, rects, origin)) : null;
    const n = items.length, grad = (pair, i) => (pair ? lerp(pair[0], pair[1], n > 1 ? i / (n - 1) : 0) : null);
    return { items, cfg, keys, pk, grad, ease: EASES[cfg.ease] || (typeof cfg.ease === 'function' ? cfg.ease : cubicOut) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const C = D.cfg, f = p * C.frames;
    const drift = C.drift ? C.drift / 2 - (C.drift * f) / (C.frames - 1) : 0;
    const items = D.items.map((it, i) => {
      const t0 = C.start + C.spread * D.keys[i], lin = clamp((f - t0) / C.each), e = D.ease(lin);
      let pulse = 0, amp = 0;
      if (C.pulse) {
        const w = clamp((f - C.pulse.at - C.pulse.spread * D.pk[i]) / C.pulse.width);
        pulse = w > 0 && w < 1 ? Math.sin(w * Math.PI) : 0;
        amp = lerp(C.pulse.amp[0], C.pulse.amp[1], C.pulse.order === 'center' ? 1 - D.pk[i] : 1);
      }
      return { t0, lin, e, pulse, amp };
    });
    return { p, f, drift, items };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, C = D.cfg, n = D.items.length;
    if (P.under) P.under(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    D.items.forEach((it, i) => {
      const st = S.items[i];
      if (st.lin <= 0 && st.pulse <= 0) return;
      const [x, y, w, h] = it.rect;
      const k = n > 1 ? i / (n - 1) : 0;
      const paint = it.paint || PAINT[it.kind];
      ctx.save();
      if (C.envelope === 'settle') {
        ctx.translate(0, S.drift);
        ctx.globalAlpha *= Math.min(1, st.lin * 2.2);
        const blur = (1 - EASE.out(st.lin)) * 8;
        if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(2)}px)`;
        const s = 0.82 + 0.18 * st.e, ox = x + w * 0.3, oy = y + h / 2;
        ctx.translate(ox, oy + (1 - st.e) * 44); ctx.scale(s, s); ctx.translate(-ox + x, -oy + y);
        if (it.last) { ctx.save(); ctx.filter = 'none'; ctx.fillStyle = c.line; ctx.fillRect(24, -18, (w - 48) * EASE.snappy(st.lin), 1.5); ctx.restore(); }
        paint(ctx, it, w, h, { ...st, f: S.f, each: C.each, k }, P);
      } else if (C.envelope === 'grow') {
        const G = C.gradient || {}, off = D.grad(G.offset, i) ?? 0, blur = (1 - st.e) * (D.grad(G.blur, i) ?? 0);
        const height = (D.grad(G.height, i) ?? 1) * st.e * (1 + st.pulse * st.amp);
        ctx.globalAlpha *= st.e;
        if (blur > 0.1) ctx.filter = `blur(${blur.toFixed(2)}px)`;
        ctx.translate(x, y + (1 - st.e) * off);
        paint(ctx, it, w, h, { ...st, height, k: D.grad(G.tone, i) ?? k, f: S.f }, P);
      } else {
        const s = st.e * (1 + 0.5 * Math.sin(st.e * Math.PI)) + st.pulse * st.amp;
        ctx.globalAlpha *= clamp(0.25 + st.e * 0.5 + st.pulse * 0.25);
        ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
        paint(ctx, it, w, h, { ...st, k, f: S.f }, P);
      }
      ctx.restore();
    });
  },
  // the first item, the middle one and the last one (their centres, as drawn)
  track(S, P, D) {
    const C = D.cfg, n = D.items.length;
    return [0, Math.floor(n / 2), n - 1].map((i) => {
      const [x, y, w, h] = D.items[i].rect, st = S.items[i];
      if (C.envelope === 'settle') return [x + w * 0.3 + w * 0.2 * (0.82 + 0.18 * st.e), y + h / 2 + S.drift + (1 - st.e) * 44];
      if (C.envelope === 'grow') { const G = C.gradient || {}; return [x + w / 2, y + (1 - st.e) * (D.grad(G.offset, i) ?? 0) + h * (1 - ((D.grad(G.height, i) ?? 1) * st.e * (1 + st.pulse * st.amp)) / 2)]; }
      return [x + w / 2, y + h / 2];
    });
  },
};

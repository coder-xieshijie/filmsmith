// word-ignite — one word of a line takes the beat's energy: a charge of light sweeps through it left to right and
// leaves it glowing (sweep), or it lands hollow inside a closing aiming ring and is lit solid on one frame (outline).
// Adapted from video-shotcraft demos/typography/gradient-word-sweep/GradientWordSweep.tsx (card
// references/shots/typography/gradient-word-sweep.md) and demos/typography/outline-word-fill/OutlineWordFill.tsx (card
// references/shots/typography/outline-word-fill.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as one HyperFrames brick (no React or Remotion) with two variants; colours by role: the multi-hue
// gradient becomes the accent lit toward white (one accent, one meaning), the white-hot fill is `paper` on a dark
// ground; brand, slogan, readouts (before/after numbers) and backdrops removed; sparks are seeded and scheduled from
// rng.js; the line's entrance is left to type-enter; Chinese outline uses a thin stroke over a faint fill (see card).
import { clamp, lerp, ground, rgba, mix, measure, scratch, text, fontOf, hexToRgb } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { EASE } from '../../ease.js';
import { copy } from '../../sample.js';
import { fontSpec, pick, langOf } from '../type-enter/type.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c = (u) => u) => c(R((f - a) / d));
const quadOut = (u) => 1 - (1 - u) * (1 - u);
const SWEEP = { fill: 18, head: 6, trail: 10, sparks: [0, 9, 17, 25, 33, 40, 44], life: 3, settle: 52, frames: 60 };
const RING = { pop: 52, shrink: [2, 11], fadeIn: [2, 6], ring: [8, 44], lines: [28, 18], warm: [43, 9], flash: 8, shock: 14, frames: 75, r: 410 };

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), word: pick(P.word, lang), size: pick(P.size, lang) };
};

export default {
  id: 'word-ignite', kind: 'motion',
  tier: 'T2', family: 'mask-type', beats: 4,
  beatsFor(P) { return (P.how === 'outline' ? RING.frames : SWEEP.frames) / 15; },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'paper', 'line'],
  from: 'a line at rest (sweep); nothing (outline)',
  to: 'the line with its one word lit and glowing (sweep); the word solid inside a locked ring (outline)',
  interpolates: ['sweep: the charge front across the word, a bright head and a trail that fades, glow level, scheduled sparks', 'outline: word scale 3.2 → 1, ring scale 2.8 → 1 and turn, side lines reaching in, outline warming, a hard cut to solid with a flash and one shock ring'],
  summary: 'One word of a line takes the beat: a charge of light sweeps through it and leaves it glowing; or it lands hollow inside a closing aiming ring and is lit solid on one frame.',
  theory: 'A peak needs one carrier: the energy event happens to the word that is the claim, so the viewer reads the word as the cause (von Restorff isolation); a hard cut to solid after a slow aim is tension and release (Huron 2006).',
  defaults: (ctx = {}) => ({
    how: 'sweep', text: copy('claim', ctx.lang), word: ctx.lang === 'zh' ? '想要' : 'meant',
    size: { en: 92, zh: 88 }, weight: 750, x: 960, y: 540, seed: 1, ring: true, probes: false,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch();
    if (P.how === 'outline') {
      const f = fontSpec(P, P.size, 500);
      return { N: P, f, w: measure(g, P.word, f).width, frames: RING.frames };
    }
    const f = fontSpec(P), i = P.text.indexOf(P.word);
    if (i < 0) throw new Error(`word-ignite: "${P.word}" is not in "${P.text}"`);
    const W = measure(g, P.text, f).width, left = P.x - W / 2;
    const x0 = left + measure(g, P.text.slice(0, i), f).width, ww = measure(g, P.word, f).width;
    // sparks: short jagged arcs over the word, one at a time
    const sparks = SWEEP.sparks.map((at, k) => {
      const r = (j) => hash(k * 31 + j, P.seed);
      const a = x0 + r(1) * ww * 0.6, b = a + ww * (0.25 + r(2) * 0.4), y = P.y - P.size * (0.55 + r(3) * 0.25), n = 6 + Math.floor(r(4) * 3);
      return { at, pts: Array.from({ length: n + 1 }, (_, j) => [lerp(a, b, j / n) + (r(10 + j) - 0.5) * 14, y + Math.sin((j / n) * Math.PI) * -18 + (r(20 + j) - 0.5) * 18]) };
    });
    return { N: P, f, left, x0, ww, sparks, frames: SWEEP.frames };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames;
    if (D.N.how === 'outline') {
      const lit = f >= RING.pop ? 1 : 0;
      return { p, f, lit,
        scale: lerp(3.2, 1, ramp(f, RING.shrink[0], RING.shrink[1] - RING.shrink[0], EASE.snappy)), born: ramp(f, RING.fadeIn[0], RING.fadeIn[1] - RING.fadeIn[0], EASE.out),
        cin: ramp(f, 8, 10, EASE.out), ring: lerp(2.8, 1, ramp(f, RING.ring[0], RING.ring[1], EASE.out)), lines: ramp(f, RING.lines[0], RING.lines[1], EASE.out),
        warm: ramp(f, RING.warm[0], RING.warm[1], EASE.swift), flash: lit * (1 - ramp(f, RING.pop, RING.flash, EASE.out)),
        shock: lit ? ramp(f, RING.pop, RING.shock, EASE.out) : 0, rot: 0.22 * Math.min(f, RING.pop) + (lit ? 6 * ramp(f, RING.pop, RING.shock, EASE.out) : 0) };
    }
    const fill = ramp(f, 0, SWEEP.fill, quadOut);
    const glow = R(f / SWEEP.fill) * (f < SWEEP.settle ? 0.82 + 0.18 * hash(Math.floor(f), D.N.seed + 7) : 1);
    const spark = D.sparks.find((s) => f >= s.at && f < s.at + SWEEP.life);
    return { p, f, fill, head: 1 - ramp(f, SWEEP.fill, SWEEP.head), trail: 1 - ramp(f, SWEEP.fill, SWEEP.trail), glow: glow + (spark ? 0.35 : 0), spark: spark ? D.sparks.indexOf(spark) : -1 };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors;
    ground(ctx, P);
    if (P.how === 'outline') return paintRing(ctx, S, P, D);
    const lit = mix(c.accent, '#ffffff', 0.35), front = D.x0 + D.ww * S.fill;
    text(ctx, P.text, D.left, P.y + P.size * 0.35, D.f, { color: c.ink });
    if (S.fill <= 0) return;
    const clipTo = (x1, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(D.x0 - P.size, P.y - P.size * 1.5, x1 - D.x0 + P.size, P.size * 3); ctx.clip(); fn(); ctx.restore(); };
    const word = (color, alpha = 1, blur = 0) => {
      ctx.save(); if (blur) { ctx.shadowColor = rgba(c.accent, alpha); ctx.shadowBlur = blur; }
      text(ctx, P.word, D.x0, P.y + P.size * 0.35, D.f, { color, alpha: blur ? 1 : alpha }); ctx.restore();
    };
    // the charged part of the word: the accent, a lighter core toward the front; steady glow behind it
    clipTo(S.fill >= 1 ? D.x0 + D.ww + P.size : front, () => {
      if (S.glow > 0) { word(c.accent, 0.5 * S.glow, 40); word(c.accent, 0.4 * S.glow, 14); }
      const gr = ctx.createLinearGradient(D.x0, 0, D.x0 + D.ww, 0);
      gr.addColorStop(0, c.accent); gr.addColorStop(1, lit);
      ctx.save(); ctx.font = fontOf(D.f); if ('letterSpacing' in ctx) ctx.letterSpacing = `${D.f.spacing ?? 0}px`; ctx.fillStyle = gr; ctx.fillText(P.word, D.x0, P.y + P.size * 0.35); ctx.restore();
    });
    // the trail just behind the front, and the bright head at it
    if (S.trail > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(front - D.ww * 0.34, P.y - P.size * 1.5, D.ww * 0.34, P.size * 3); ctx.clip();
      ctx.globalAlpha = 0.9 * S.trail; word(lit, 0.9, 24); ctx.restore();
    }
    if (S.head > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(front - D.ww * 0.12, P.y - P.size * 1.5, D.ww * 0.13, P.size * 3); ctx.clip();
      ctx.globalAlpha = S.head; word('#ffffff', 1, 30); ctx.restore();
    }
    if (S.spark >= 0) {
      const sp = D.sparks[S.spark].pts;
      ctx.save(); ctx.strokeStyle = lit; ctx.lineWidth = 2; ctx.shadowColor = c.accent; ctx.shadowBlur = 12; ctx.lineJoin = 'round';
      ctx.beginPath(); sp.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    }
  },
  track(S, P, D) {
    if (D.N.how === 'outline') return [[960 + RING.r * S.ring, D.N.y], [960 + (D.w / 2) * S.scale, D.N.y]];
    // `probes` adds the fill front as an offset (×500 px), layout-free, for the comparison
    return D.N.probes ? [[D.x0 + D.ww * S.fill, D.N.y], [960 + 500 * S.fill, 540]] : [[D.x0 + D.ww * S.fill, D.N.y]];
  },
};

// outline: the hollow word, the dashed aiming ring and side lines, the solid cut
const paintRing = (ctx, S, P, D) => {
  const c = P.colors, cx = P.x, cy = P.y, dark = hexToRgb(c.ground).reduce((a, v) => a + v, 0) < 384;
  const hot = dark ? c.paper : c.ink, lock = S.lit ? c.accent : c.line;
  // ring and its tick ring
  if (P.ring && S.cin > 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((S.rot * Math.PI) / 180); ctx.scale(S.ring, S.ring);
    ctx.globalAlpha = S.cin; ctx.strokeStyle = lock; ctx.lineWidth = 2 / S.ring; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.arc(0, 0, RING.r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let k = 0; k < 72; k++) { const a = (k / 72) * Math.PI * 2, l = k % 6 === 0 ? 18 : 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * (RING.r - 30), Math.sin(a) * (RING.r - 30)); ctx.lineTo(Math.cos(a) * (RING.r - 30 - l), Math.sin(a) * (RING.r - 30 - l)); ctx.lineWidth = 1.5 / S.ring; ctx.stroke(); }
    ctx.restore();
    // side lines reaching in to 28 px outside the ring
    if (S.lines > 0) {
      ctx.save(); ctx.strokeStyle = lock; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
      const stop = RING.r * S.ring + 28;
      for (const s of [-1, 1]) { const x0 = cx + s * 960, x1 = lerp(x0, cx + s * stop, S.lines); ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke(); }
      ctx.restore();
    }
  }
  if (S.shock > 0 && S.shock < 1) {
    ctx.save(); ctx.strokeStyle = rgba(c.accent, 1 - S.shock); ctx.lineWidth = 6 * (1 - S.shock) + 1;
    ctx.beginPath(); ctx.arc(cx, cy, RING.r + 160 * S.shock, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // the word
  if (S.born <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(S.scale, S.scale); ctx.globalAlpha = S.born;
  ctx.font = fontOf(D.f); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${D.f.spacing ?? 0}px`;
  const by = P.size * 0.35;
  if (S.lit) {
    if (S.flash > 0) { ctx.shadowColor = rgba(c.accent, 0.9 * S.flash); ctx.shadowBlur = 60 * S.flash; }
    ctx.fillStyle = hot; ctx.fillText(P.word, 0, by);
  } else {
    // hollow: Latin is a 2 px outline; Chinese fonts overlap their strokes' contours, so Chinese adds a faint fill
    // under a thinner outline and the overlaps read as part of the strokes
    if (P.lang === 'zh') { ctx.fillStyle = rgba(hot, 0.1 + 0.15 * S.warm); ctx.fillText(P.word, 0, by); }
    ctx.lineWidth = (P.lang === 'zh' ? 1.5 : 2) / S.scale; ctx.lineJoin = 'round';
    ctx.strokeStyle = mix(c.dim || c.line, hot, S.warm); ctx.strokeText(P.word, 0, by);
  }
  ctx.restore();
};

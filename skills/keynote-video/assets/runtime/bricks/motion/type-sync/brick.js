// type-sync — a line bound to a time track: each word fills with the accent as it is read, a reading bar under it
// (fill); or every character's strokes swell to black on the beat and spring back thin, the last hit landing bold (pump).
// Adapted from video-shotcraft demos/typography/type-rhythm-sync/KaraokeFillSync.tsx and FontWeightPump.tsx (card
// references/shots/typography/type-rhythm-sync.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as one HyperFrames brick (no React or Remotion) with two variants; colours by role: the active word
// is the accent and settles to ink, the drop lands in the accent instead of a two-hue gradient; brand slogan, echo rows,
// sequencer cells, waveform preview and backdrops removed; the reading times come from the words (Chinese: phrases,
// at Chinese reading speed) or from `times`, the hits from `hits` in beats; weights from the variable font in canvas.
import { clamp, lerp, ground, rgba, mix, rrect, measure, scratch, fontOf } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { copy } from '../../sample.js';
import { setText, drawUnit, fontSpec, pick, langOf, roughUnits, chunks } from '../type-enter/type.js';
import { graphemes, isCJK } from '../../lang.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c = (u) => u) => c(R((f - a) / d));
const FILL = { lead: 6, gap: 4, lineGap: 10, perLatin: 3.6, perHan: 6, min: 12, back: 10, bar: 6, tail: 12 };
const PUMP = { lead: 4, every: 15, rest: 250, peak: 900, final: 780, decay: 9, spread: 1.6, tail: 18 };

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), size: pick(P.size, lang) };
};
// reading windows [start, end] per unit, in frames
const fillTimes = (P, units) => {
  if (P.times) return P.times.map(([a, b]) => [a * 15, b * 15]);
  let t = FILL.lead, line = 0;
  return units.map((u) => {
    if (u.line !== line) { t += FILL.lineGap - FILL.gap; line = u.line; }
    const g = graphemes(u.s), d = Math.max(FILL.min, g.reduce((s, ch) => s + (isCJK(ch) ? FILL.perHan : /[\p{L}\p{N}]/u.test(ch) ? FILL.perLatin : 0), 0));
    const w = [t, t + d]; t += d + FILL.gap; return w;
  });
};
const frames = (P) => {
  if (P.how === 'pump') return PUMP.lead + P.hits * PUMP.every + PUMP.tail;
  const T = fillTimes(P, roughUnits(P.text, P.lang, { by: 'word', size: P.size, maxW: P.maxW }));
  return T[T.length - 1][1] + FILL.tail;
};

export default {
  id: 'type-sync', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 6,
  beatsFor(P) { return Math.ceil(frames(norm(P)) / 7.5) / 2; },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the line unread (dim) — fill; the line set thin — pump',
  to: 'the line read (ink) — fill; the line landed bold in the accent — pump',
  interpolates: ['fill: per word a fill front left to right with a soft edge, the accent while read, ink after; the reading bar\'s ends', 'pump: per character weight 250 → 900 → 250 on each hit (the centre springs back first), the downbeat wider and in the accent, the last hit landing at 780'],
  summary: 'A line bound to a time track: each word fills with the accent as it is read, a reading bar under it; or every character swells bold on the beat and springs back thin, the last hit landing bold.',
  theory: 'Audio-visual synchrony binds what is seen to what is heard (the ventriloquism and karaoke effects): the eye follows the fill at the speed of the voice; a visual onset on each beat makes the beat visible (Lee, Forlizzi & Hudson 2002 on kinetic type).',
  defaults: (ctx = {}) => ({
    how: 'fill', text: copy('claim', ctx.lang), times: null, hits: 4, downbeats: [0],
    size: { en: 120, zh: 112 }, weight: 750, x: 960, y: 520, maxW: 1500, bar: true,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch();
    if (P.how === 'pump') {
      // every character pinned in the slot it takes at the peak weight: the line never reflows
      const f = fontSpec(P, P.size, PUMP.peak);
      const L = setText(g, P.text, f, P.lang, { by: 'char', x: P.x, y: P.y, align: 'center', maxW: 1e5 });
      return { N: P, L, n: L.units.length, frames: this.beatsFor(P) * 15 };
    }
    const f = fontSpec(P);
    const L = setText(g, P.text, f, P.lang, { by: 'word', x: P.x, y: P.y, align: 'center', maxW: P.maxW });
    return { N: P, L, T: fillTimes(P, L.units), frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames, N = D.N;
    if (N.how === 'pump') {
      const mid = (D.n - 1) / 2, last = PUMP.lead + (N.hits - 1) * PUMP.every;
      const U = D.L.units.map((u, i) => {
        const decay = PUMP.decay + Math.max(0, Math.abs(i - mid) - 0.5) * PUMP.spread;
        let e = 0, beat = -1;
        for (let k = 0; k < N.hits - 1; k++) { const t = f - (PUMP.lead + k * PUMP.every); if (t >= 0 && t < decay) { const v = Math.pow(1 - t / decay, 0.8); if (v > e) { e = v; beat = k; } } }
        const fin = (PUMP.final - PUMP.rest) / (PUMP.peak - PUMP.rest), td = f - last;
        const drop = td < 0 ? 0 : fin + (1 - fin) * Math.pow(1 - R(td / (decay + 4)), 1.4);
        const w = Math.max(e, drop), down = beat >= 0 && N.downbeats.includes(beat % 4);
        return { weight: Math.round(PUMP.rest + (PUMP.peak - PUMP.rest) * w), wide: down ? 0.06 * e : 0, tint: td >= 0 ? 1 : Math.min(1, e * 1.25) * (down ? 1 : 0.5), e };
      });
      return { p, f, U };
    }
    const U = D.T.map(([a, b]) => {
      const q = R((f - a) / (b - a));
      return { q, read: ramp(f, b, FILL.back, EASE.out), bar: q > 0 ? (q < 1 ? [0, q] : [ramp(f, b, FILL.bar, EASE.out), 1]) : null };
    });
    return { p, f, U };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, L = D.L;
    ground(ctx, P);
    if (P.how === 'pump') {
      L.units.forEach((u, i) => {
        const o = S.U[i], col = mix(c.ink, c.accent, o.tint);
        ctx.save(); ctx.translate(u.cx, u.y); ctx.scale(1 + o.wide, 1);
        ctx.font = fontOf({ ...L.f, weight: o.weight }); ctx.textAlign = 'center'; ctx.fillStyle = col;
        if (o.e > 0.4) { ctx.shadowColor = rgba(c.accent, 0.35 * o.e); ctx.shadowBlur = 30 * o.e; }
        ctx.fillText(u.s, 0, 0); ctx.restore();
      });
      return;
    }
    L.units.forEach((u, i) => {
      const o = S.U[i], done = mix(c.accent, c.ink, o.read);
      drawUnit(ctx, u, L, { color: rgba(c.ink, 0.22), accentColor: rgba(c.ink, 0.22) });
      if (o.q > 0) {
        // the read part, its front a soft edge 8 % of the word wide
        const fx = u.x + (u.w + 8) * o.q, soft = Math.max(4, u.w * 0.08);
        ctx.save(); ctx.beginPath(); ctx.rect(u.x - 10, u.y - L.size * 1.2, fx - u.x + 10, L.size * 1.6); ctx.clip();
        drawUnit(ctx, u, L, { color: done, accentColor: done });
        ctx.restore();
        if (o.q < 1) {
          ctx.save(); ctx.beginPath(); ctx.rect(fx, u.y - L.size * 1.2, soft, L.size * 1.6); ctx.clip();
          drawUnit(ctx, u, L, { color: rgba(c.accent, 0.5), accentColor: rgba(c.accent, 0.5) }); ctx.restore();
        }
      }
      if (P.bar && o.bar && o.bar[1] > o.bar[0]) {
        const a = u.x + u.w * o.bar[0], b = u.x + u.w * o.bar[1];
        rrect(ctx, a, u.y + L.size * 0.2, Math.max(0, b - a), 8, 4); ctx.fillStyle = c.accent; ctx.fill();
      }
    });
  },
  // the line never moves (no motion blur); `probe` adds a point that runs with one word's fill (or one character's
  // weight) for the comparison with upstream
  track(S, P, D) {
    const pts = [[D.L.box[0], D.L.box[1]], [D.L.box[0] + D.L.box[2], D.L.box[1]]];
    const k = D.N.probe;
    if (k != null) pts.push(D.N.how === 'pump' ? [960 + 300 * (S.U[k].weight - PUMP.rest) / (PUMP.peak - PUMP.rest), 540] : [960 + 300 * S.U[k].q, 540]);
    return pts;
  },
};

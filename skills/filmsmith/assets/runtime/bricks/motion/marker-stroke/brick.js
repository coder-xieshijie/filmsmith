// marker-stroke — a marker underlines one word of a title that is already there, left to right in one quick stroke.
// Adapted from video-shotcraft demos/typography/marker-underline-title/MarkerUnderlineTitle.tsx (card
// references/shots/typography/marker-underline-title.md), with the highlighter bar of
// demos/typography/typewriter-moves/TypewriterErrorRetype.tsx (card references/shots/typography/typewriter-moves.md) and
// the ruled underline of demos/typography/paper-title-card/PaperTitleCard.tsx (card
// references/shots/typography/paper-title-card.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the mark in the accent, not a
// warm black); brand and demo copy removed; the title is set by type.js in either language and the mark spans the
// marked characters' measured box; the dry-brush texture is seeded noise cut out of the stroke in prepare() instead of
// SVG turbulence; the title's own entrance is left to type-enter.
import { clamp, lerp, ground, rgba, rrect, bez, scratch, canvasOf } from '../../../handoffs/util.js';
import { hash, mulberry32 } from '../../../rng.js';
import { EASE } from '../../ease.js';
import { copy } from '../../sample.js';
import { setText, drawUnit, fontSpec, pick, langOf } from '../type-enter/type.js';

const R = (u) => clamp(u);
const RULE = bez(0.3, 0, 0.2, 1);
// Each way of marking: frames of the stroke (at 120 BPM), its curve.
const HOW = {
  marker:    { frames: 10, ease: (u) => 1 - Math.pow(1 - R(u), 2.2) },
  highlight: { frames: 14, ease: EASE.snappy },
  rule:      { frames: 18, ease: RULE },
};

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), mark: pick(P.mark, lang), size: pick(P.size, lang) };
};

// The marker's outline: a centre line that rises slightly to the right with a slow wave, a width that starts thin,
// swells and tapers to a point, both with seeded wobble. Points in a box len × h, origin at its left.
const strokeOutline = (len, k, seed) => {
  const rand = mulberry32(seed * 7919 + 77);
  const N = 40, top = [], bot = [];
  const wob = Array.from({ length: N + 1 }, () => rand() - 0.5);
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = t * len;
    const mid = (19 - t * 9 + Math.sin(t * Math.PI * 1.6 + 0.4) * 2.6 + wob[i] * 1.6) * k;
    const w = Math.max(2.2, 14 + Math.sin(t * Math.PI) * 6 - Math.max(0, t - 0.86) * 46 - Math.max(0, 0.06 - t) * 70 + wob[i] * 3) * k;
    top.push([x, mid - w / 2]); bot.push([x, mid + w / 2]);
  }
  return [...top, ...bot.reverse()];
};

export default {
  id: 'marker-stroke', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a title at rest',
  to: 'the same title with one word or phrase marked',
  interpolates: ['the mark revealed left to right (marker, highlighter) or scaled out from its left end (rule)'],
  summary: 'A marker underlines one word of a title at rest, left to right in one quick stroke; or a highlighter fills its lower half, or a ruled line draws under it.',
  theory: 'A mark made by hand points at the one word to read (pre-attentive emphasis by added marks, Treisman 1985); drawn after the title settles, it is read as a comment on it, not part of it.',
  defaults: (ctx = {}) => ({
    how: 'marker', text: copy('claim', ctx.lang), mark: ctx.lang === 'zh' ? '想要' : 'meant',
    size: ctx.lang === 'zh' ? 112 : 118, weight: 700, role: 'display',
    x: 960, y: 540, align: 'center', maxW: 1600, leading: null, lead: 0, color: 'accent', probes: false, seed: 1,
  }),
  beatsFor(P) { const H = HOW[P.how || 'marker']; return Math.max(1, Math.ceil(((P.lead || 0) + H.frames) / 7.5) / 2); },
  prepare(P) {
    P = norm(P);
    const L = setText(scratch(), P.text, fontSpec(P), P.lang, { by: 'char', x: P.x, y: P.y, align: P.align, maxW: P.maxW, leading: P.leading, accent: P.mark });
    const marked = L.units.filter((u) => u.accent);
    if (!marked.length) throw new Error(`marker-stroke: "${P.mark}" is not in "${P.text}"`);
    const line = marked[0].line, ms = marked.filter((u) => u.line === line);
    // Chinese glyphs sit lower on the baseline than Latin ones (the ideographic box reaches ~0.12 em below it): the
    // mark goes down by 0.08 em so it still runs just under the characters
    const x0 = ms[0].x, x1 = ms[ms.length - 1].x + ms[ms.length - 1].w, base = ms[0].y + (P.lang === 'zh' ? P.size * 0.08 : 0);
    const k = P.size / 118, len = x1 - x0 + 24 * k;
    const D = { L, N: P, x0: x0 - 12 * k, len, base, k, frames: this.beatsFor(P) * 15 };
    if (P.how === 'marker') {
      // the stroke with its dry-brush texture, drawn once: an outline filled in the mark colour, roughened by seeded
      // streaks cut out along its length
      const h = Math.ceil(48 * k), cv = canvasOf(Math.ceil(len + 8), h), g = cv.getContext('2d', { willReadFrequently: true });   // software, like the host canvas: a GPU canvas drawn into it changes how its text rasterises
      const pts = strokeOutline(len, k, P.seed);
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + 2, y + 6 * k) : g.moveTo(x + 2, y + 6 * k))); g.closePath();
      g.fillStyle = P.colors[P.color] || P.colors.accent; g.globalAlpha = 0.94; g.fill();
      g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1;
      for (let i = 0; i < 70; i++) {
        const x = hash(i * 3 + 1, P.seed) * len, y = (8 + hash(i * 3 + 2, P.seed) * 28) * k, w = (6 + hash(i * 3 + 3, P.seed) * 30) * k;
        g.globalAlpha = 0.25 + 0.6 * hash(i * 5 + 9, P.seed);
        g.fillRect(x, y, w, Math.max(1, 1.2 * k * hash(i * 7 + 4, P.seed)));
      }
      D.img = cv; D.top = base + 2 * k;
    }
    return D;
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const H = HOW[D.N.how], f = p * D.frames;
    return { p, draw: H.ease(R((f - (D.N.lead || 0)) / H.frames)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, col = c[P.color] || c.accent, k = D.k, L = D.L;
    ground(ctx, P);
    if (S.draw > 0 && P.how === 'highlight') {
      rrect(ctx, D.x0 + 2 * k, D.base - P.size * 0.3, (D.len - 4 * k) * S.draw, P.size * 0.4, 6 * k);
      ctx.fillStyle = rgba(col, 0.24); ctx.fill();
    }
    L.units.forEach((u) => drawUnit(ctx, u, L, { color: c.ink, accentColor: c.ink }));
    if (S.draw <= 0) return;
    if (P.how === 'marker') {
      ctx.save();
      ctx.beginPath(); ctx.rect(D.x0 - 4, D.top - 40 * k, (D.len + 6) * S.draw + 4, 140 * k); ctx.clip();
      ctx.drawImage(D.img, D.x0 - 2, D.top);
      ctx.restore();
    } else if (P.how === 'rule') {
      ctx.fillStyle = col; ctx.fillRect(D.x0 + 12 * k, D.base + P.size * 0.16, (D.len - 24 * k) * S.draw, Math.max(3, 6 * k));
    }
  },
  track(S, P, D) {
    const tip = [D.x0 + (D.len + 6) * S.draw, D.base + 20 * D.k];
    return D.N.probes ? [tip, [960 + (D.len + 6) * S.draw, 540]] : [tip];
  },
};

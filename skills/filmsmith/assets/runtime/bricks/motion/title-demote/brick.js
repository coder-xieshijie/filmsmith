// title-demote — a hero title, centred, shrinks in one continuous move into the section label at the top left, and the
// section's content grows in under it while it lands; optionally a text selection sweeps over the title first.
// Adapted from video-shotcraft demos/typography/title-demote-to-label/TitleDemoteToLabel.tsx (card
// references/shots/typography/title-demote-to-label.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo cards, quotes and the
// storyboard script removed: the content is the next scene's painter, grown in by blocks (rects of it) with the
// upstream's clip, rise and fade; the A and B forms are one brick with a `select` variant; the title's own entrance and
// the chain of several sections are left to the film; Chinese keeps its tracking and has no caps eyebrow.
import { clamp, lerp, ground, measure, scratch, text, bez, rgba, mix } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { copy, card, infoSize } from '../../sample.js';
import { fontSpec, pick, langOf } from '../type-enter/type.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const R = (u) => clamp(u);
const DEMOTE = bez(0.6, 0, 0.18, 1);
const SEL = { sweep: 10, stay: 10, back: 8, gap: 2 };
const K = { demote: 26, grow: 12, slot: [216, 196], label: 0.22, margin: 120 };

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), eyebrow: pick(P.eyebrow, lang), size: pick(P.size, lang) };
};
const lead = (P) => (P.select ? SEL.sweep + SEL.stay + SEL.back + SEL.gap : 0);
const total = (P) => lead(P) + K.grow + Math.max(...P.blocks.map((b) => b[4] + (b[5] ?? 20)), K.demote - K.grow);

// The default next scene: a hairline, a lead sentence and three cards, all neutral (sample.js); blocks grow in that
// order, denser first: [x, y, w, h, at (frames after the growth starts), dur].
const section = ({ lang, colors: c }) => (ctx) => {
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = rgba(c.ink, 0.85); ctx.fillRect(K.margin, 262, 1680, 1.5);
  const f = fontFor(NEUTRAL, 'display', lang, lang === 'zh' ? 56 : 60, 650, 'display');
  text(ctx, copy('titleLong', lang), K.margin, 372, f, { color: c.ink });
  for (let i = 0; i < 3; i++) card(ctx, i, [K.margin + i * 572, 440, 536, 309], { lang, colors: c, target: i === 1 });
};
const BLOCKS = [[100, 250, 1720, 30, 8, 18], [100, 290, 1720, 110, 6, 20], [100, 430, 556, 330, 10, 22], [672, 430, 556, 330, 16, 22], [1244, 430, 556, 330, 24, 22]];

export default {
  id: 'title-demote', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 4,
  beatsFor(P) { return Math.ceil(total({ blocks: BLOCKS, ...P }) / 7.5) / 2; },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the section title, large and centred (a chapter card)',
  to: 'the same title as the section label at the top left, the section\'s content under it',
  interpolates: ['title scale 1 → 0.22 and its left-middle anchor → the label slot, on one asymmetric in-out curve', 'the eyebrow out, the number prefix in', 'content blocks: clip from the left, rise 30 px, fade, staggered', 'select: a selection band sweeps over the title, stays, retracts'],
  summary: 'A centred hero title shrinks in one move into the section label at the top left while the section\'s content grows in under it; optionally a text selection sweeps over the title first.',
  theory: 'Object constancy across a change of role: the same words go from subject to signpost, so the viewer keeps their place (Heer & Robertson 2007); handing over while the label is still landing leaves no empty beat.',
  defaults: (ctx = {}) => ({
    text: copy('detailTitle', ctx.lang), eyebrow: copy('eyebrow', ctx.lang), number: '01',
    size: { en: 220, zh: 200 }, weight: 800, y: 520, select: false,
    to: null, blocks: BLOCKS, probes: false,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), f = fontSpec(P), w = measure(g, P.text, f).width;
    const to = typeof P.to === 'function' ? P.to : section({ lang: P.lang, colors: P.colors });
    const ef = fontFor(NEUTRAL, 'mono', P.lang, infoSize(P.lang) + 4, 600, 'label');
    return { N: P, f, w, to, ef, pre: P.number + ' /', frames: this.beatsFor(P) * 15, lead: lead(P) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const N = D.N, f = p * D.frames, t = f - D.lead;
    const q = DEMOTE(R(t / K.demote));
    const s = lerp(1, K.label, q);
    const ax = lerp(960 - D.w / 2, K.slot[0], q), ay = lerp(N.y, K.slot[1], q);
    const sel = !N.select ? null : { to: EASE.swift(R(f / SEL.sweep)), from: EASE.swift(R((f - SEL.sweep - SEL.stay) / SEL.back)) };
    const blocks = N.blocks.map((b) => EASE.out(R((t - K.grow - b[4]) / (b[5] ?? 20))));
    return { p, f, q, s, ax, ay, sel, blocks, brow: 1 - EASE.out(R(t / 6)), pre: EASE.snappy(R((t - K.demote + 6) / 10)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors;
    ground(ctx, P);
    // the content, block by block: clipped from the left (30 % → 100 % of its width), rising 30 px, fading in
    S.blocks.forEach((u, i) => {
      if (u <= 0) return;
      const [x, y, w, h] = P.blocks[i];
      ctx.save();
      ctx.globalAlpha = Math.min(1, u * 1.6);
      ctx.beginPath(); ctx.rect(x, y - 30 * (1 - u), w * (u < 1 ? 0.3 + 0.7 * u : 1), h); ctx.clip();
      ctx.translate(0, 30 * (1 - u));
      D.to(ctx);
      ctx.restore();
    });
    // eyebrow above the hero, leaving as it starts to move
    if (S.brow > 0) text(ctx, P.eyebrow, 960, P.y - P.size * 0.62, D.ef, { color: c.dim, align: 'center', alpha: S.brow });
    // selection band behind the title, its caret at the right edge
    if (S.sel && S.sel.to > S.sel.from) {
      const x0 = 960 - D.w / 2 - 12, wf = D.w + 24, a = x0 + wf * S.sel.from, b = x0 + wf * S.sel.to;
      ctx.fillStyle = rgba(c.accent, 0.2); ctx.fillRect(a, P.y - P.size * 0.58, b - a, P.size * 1.1);
      if (S.sel.from === 0) { ctx.fillStyle = c.accent; ctx.fillRect(b - 1.5, P.y - P.size * 0.62, 3, P.size * 1.18); }
    }
    // the title, left-middle anchored, scaled
    ctx.save();
    ctx.translate(S.ax, S.ay); ctx.scale(S.s, S.s);
    text(ctx, P.text, 0, P.size * 0.35, D.f, { color: c.ink });
    ctx.restore();
    if (S.pre > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(K.margin, K.slot[1] - 40, (K.slot[0] - K.margin) * S.pre, 80); ctx.clip();
      text(ctx, D.pre, K.margin, K.slot[1] + P.size * K.label * 0.35, { ...D.f, size: P.size * K.label, spacing: 0 }, { color: c.accent });
      ctx.restore();
    }
  },
  // the label's anchor and right end; `probes` adds the demote progress (×500 px) for the comparison
  track(S, P, D) { const pts = [[S.ax, S.ay], [S.ax + D.w * S.s, S.ay]]; if (D.N.probes) pts.push([960 + 500 * S.q, 540]); return pts; },
};

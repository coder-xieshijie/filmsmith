// lead-word — the first word of a line fills the screen, drifts closer, then shrinks into its place as the line slides
// home; the other words are pushed in from the right, one after another; the line lifts and a subline rises.
// Adapted from video-shotcraft demos/typography/lead-word-zoom-assemble/LeadWordZoomAssemble.tsx (card
// references/shots/typography/lead-word-zoom-assemble.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion, no measuring after mount: the pivot is computed from
// the measured line in prepare()); colours by role; brand and demo copy, mesh backdrop, vignette and grain removed; the
// closing crash zoom is left to a transition (viewport-push or whip-push), so the brick ends on the settled line; the
// lead may be any prefix of the line (Chinese: a phrase such as a product name); motion blur from track().
import { clamp, lerp, ground, measure, scratch, bez } from '../../../handoffs/util.js';
import { copy } from '../../sample.js';
import { setText, drawUnit, fontSpec, pick, langOf, chunks } from '../type-enter/type.js';

const R = (u) => clamp(u);
const PUSH = bez(0.25, 1, 0.5, 1), ZOOM = bez(0.5, 0, 0.05, 1), WORD = bez(0.22, 0.8, 0.36, 1);
const cubicOut = (u) => 1 - Math.pow(1 - R(u), 3);
const K = { scale: 2.3, intro: 6, hold: 12, push: 1.06, recede: 12, assemble: 24, delay: 6, stagger: 4, dur: 12, from: 0.5, fade: 2, lift: [32, 46], liftBy: -56 };

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), lead: pick(P.lead, lang), accent: pick(P.accent, lang), sub: pick(P.sub, lang), size: pick(P.size, lang) };
};
// the lead and the rest's units (words, Chinese phrases), without measuring
const split = (P) => {
  const lead = P.lead && P.text.startsWith(P.lead) ? P.lead : chunks(P.text, P.lang)[0].s;
  return { lead, rest: P.text.slice(lead.length).replace(/^\s+/, ''), space: /^\s/.test(P.text.slice(lead.length)) };
};
const frames = (P) => {
  const { rest } = split(P), n = chunks(rest, P.lang).length;
  return Math.max(K.lift[1], K.hold + K.delay + Math.max(0, n - 1) * K.stagger + K.dur, K.hold + K.assemble);
};

export default {
  id: 'lead-word', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 3.5,
  beatsFor(P) { return Math.ceil(frames(norm(P)) / 7.5) / 2; },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the ground; the first word arrives filling the screen',
  to: 'the whole line at its size, lifted, with its subline',
  interpolates: ['line scale 2.3 → 2.44 → 1 about the lead\'s centre and the baseline', 'line offset → 0 on the same curve', 'each later word from 0.5 em right of its slot', 'lift and subline'],
  summary: 'The first word fills the screen and drifts closer, then shrinks into its place as the line slides home; the other words are pushed in after it; the line lifts and a subline rises.',
  theory: 'Figure first, then context: the lead word is seen alone before the sentence frames it (the "Introducing X" card); one curve for the shrink and the slide keeps it one motion (common fate).',
  defaults: (ctx = {}) => ({
    text: copy('claim', ctx.lang), lead: null, accent: null, sub: copy('caption', ctx.lang),
    size: { en: 96, zh: 88 }, weight: 600, x: 960, y: 540, subSize: { en: 34, zh: 32 }, crash: false, probes: false,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), f = fontSpec(P), { lead, rest, space } = split(P);
    const lw = measure(g, lead, f).width, sep = rest ? (space || P.lang !== 'zh' ? measure(g, ' ', f).width : 0) : 0;
    const rw = rest ? measure(g, rest, f).width : 0, W = lw + sep + rw;
    const left = P.x - W / 2;
    const L = setText(g, lead, f, P.lang, { by: 'line', x: left, y: P.y, align: 'left', maxW: 1e5, accent: P.accent && lead.includes(P.accent) ? P.accent : null });
    const RL = rest ? setText(g, rest, f, P.lang, { by: 'word', x: left + lw + sep, y: P.y, align: 'left', maxW: 1e5, accent: P.accent && rest.includes(P.accent) ? P.accent : null }) : null;
    const pivot = [left + lw / 2, L.units[0].y];                          // the lead's centre on the baseline
    const S = P.sub ? setText(g, P.sub, fontSpec(P, pick(P.subSize, P.lang), 400, 'text'), P.lang, { by: 'line', x: P.x, y: P.y + 79, align: 'center', maxW: 1700 }) : null;
    return { N: P, L, RL, S, pivot, slide: P.x - pivot[0], frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames;
    const sc = lerp(K.scale, K.scale * K.push, PUSH(R(f / K.hold))) + (1 - K.scale * K.push) * ZOOM(R((f - K.hold) / K.recede));
    const dx = lerp(D.slide, 0, ZOOM(R((f - K.hold) / K.assemble)));
    const words = D.RL ? D.RL.units.map((u, i) => {
      const t0 = K.hold + K.delay + i * K.stagger, q = WORD(R((f - t0) / K.dur));
      return { dx: (1 - q) * K.from * D.N.size, alpha: R((f - t0) / K.fade) };
    }) : [];
    const lift = cubicOut((f - K.lift[0]) / (K.lift[1] - K.lift[0]));
    return { p, f, sc, dx, words, lift, intro: R(f / K.intro), blurIntro: (1 - cubicOut(f / K.intro)) * 8 / K.scale };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors;
    ground(ctx, P);
    ctx.save();
    ctx.translate(0, S.lift * K.liftBy);
    // the line: scaled about the pivot, slid by dx
    ctx.translate(D.pivot[0] + S.dx, D.pivot[1]); ctx.scale(S.sc, S.sc); ctx.translate(-D.pivot[0], -D.pivot[1]);
    drawUnit(ctx, D.L.units[0], D.L, { alpha: S.intro, blur: S.blurIntro, color: c.ink, accentColor: c.accent });
    if (D.RL) D.RL.units.forEach((u, i) => drawUnit(ctx, u, D.RL, { dx: S.words[i].dx, alpha: S.words[i].alpha, color: c.ink, accentColor: c.accent }));
    ctx.restore();
    if (D.S && S.lift > 0) drawUnit(ctx, D.S.units[0], D.S, { alpha: S.lift, dy: (1 - S.lift) * 16, color: c.dim });
  },
  // the lead's centre and the last word's centre on screen
  track(S, P, D) {
    const tr = ([x, y]) => [D.pivot[0] + S.dx + (x - D.pivot[0]) * S.sc, D.pivot[1] + (y - D.pivot[1]) * S.sc + S.lift * K.liftBy];
    const lead = D.L.units[0], pts = [tr([lead.cx, lead.cy])];
    if (D.RL) { const u = D.RL.units[D.RL.units.length - 1], i = D.RL.units.length - 1; pts.push(tr([u.cx + S.words[i].dx, u.cy])); }
    // `probes`: the line's scale (×100 px) and slide as offsets, layout-free, for the comparison
    if (D.N.probes) pts.push([960 + 100 * S.sc, 540], [960 + S.dx, 540]);
    return pts;
  },
};

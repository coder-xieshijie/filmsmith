// poster-tagline — the promise restated as the biggest type in the film: one or two lines at 225 px rise a quarter
// beat apart, a 28 px ink bar grows under them, a mono label rises under the bar; it is the film's claim, read in a
// pause; the lines sink through their masks across the cut. Entered by plakat-reblock, the bar arrives from the
// install page's command block (block-carry) instead of growing.
// From the plakat template's `tagline` (assets/templates/plakat/scenes.js).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, wrapLines, drawPath, rollUp, lerp, graphemes , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = { en: { lines: ['Agents draft.', '*You* sign.'], label: 'draft → measure → replay → sign' }, zh: { lines: ['代理起草。', '*你*来签字。'], label: '起草 → 测量 → 回放 → 签字' } };
const tplan = (s, bpm, L) => {
  const rb = s.enterBy === 'reblock', P = { bar: rb ? 0.5 : 0.6, lab: 1.0 };
  P.reads = [...s.lines.map((l, i) => [0.25 * i, [l]]), [1.0, [s.label], G]];
  P.settled = Math.max(rb ? P.bar : P.bar + 0.7, P.lab + 0.45);
  P.D = Math.max(needU(P.reads, P.settled, s.last ? 0 : 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.exit = P.D - 0.125;
  return P;
};
export default {
  id: 'poster-tagline', kind: 'scene',
  fits: ['claim', 'climax'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['block-carry'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent'], type: ['display', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 17 }, zh: { chars: 7 } } } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 10, chars: 60 }, zh: { chars: 24 } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null, enterBy: null, from: null, last: false }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: s.lines.map((text) => ({ text, lang: ctx.lang, claim: true })), cues: [{ beat: 0, kind: 'claim' }, { beat: P.bar * 2, kind: 'turn' }], motion: 'the lines rise; the bar; the label', settled: P.settled * 2, peakAt: 0, pause: [0, Math.round(P.D * 2)] };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, lh = 246;
    ground(ctx, C);
    const xs = s.last ? 0 : ck.sec(AT(P.exit), 0.19, E.p3In);
    s.lines.forEach((l, i) => { const z = fitSize(ctx, plain(l), (v) => F('display', L, v), 1736, 225, 164); masked(ctx, l, 88, 190 + lh * i, F('display', L, z), C, { off: xs > 0 ? sinkOff(ck.sec(AT(P.exit) + 0.03 * i, 0.19, E.p3In)) : riseOff(ck.sec(AT(0) + 0.25 * i * ck.k, 0.65)), lh: 1 }); });
    const by = 190 + lh * (s.lines.length - 1) + 300;
    if (s.enterBy === 'reblock' && s.from) { const m = ck.sec(AT(-0.25), 0.5 * ck.k, E.expoInOut); rect(ctx, lerp(s.from[0], 96, m), lerp(s.from[1], by, m), lerp(s.from[2], 1728, m), lerp(s.from[3], 28, m), C.ink); }
    else { const g = tw(P.bar, 0.7, E.expoInOut) * (1 - ck.sec(AT(P.exit), 0.25, E.p3In)); rect(ctx, 96 + (ck.t > AT(P.exit) ? 1728 * (1 - g) : 0), by, 1728 * g, 28, C.ink); }
    masked(ctx, labelText(s.label, L), 96, by + 60, labelFont(L), C, { off: xs > 0 ? sinkOff(xs) : riseOff(tw(P.lab, 0.45)), lh: null, color: C.dim, rich: false });
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 400]]; },
};

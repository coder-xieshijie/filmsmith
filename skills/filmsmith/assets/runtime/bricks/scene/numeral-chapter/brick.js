// numeral-chapter — a chapter card between pages: a 640 px numeral as a graphic on one side, a mono label, the title
// at 225 px, a 12 px ink rule and a caption on the other; the numeral steps 6 px outward on every beat (a T0 the eye
// can see while the card holds); the card sinks through its masks across the cut. Sides alternate by chapter.
// From the plakat template's `chapter` (assets/templates/plakat/scenes.js). Its entrance by the grid columns
// (plakat-columns) is a runtime transition between whole frames and is not drawn here.
import { clock, E, F, SZ, zh, masked, riseOff, sinkOff, at, rect, labelFont, labelText, fitSize, plain, ground, tooth, paperTooth, drawChrome, needU, G, wrapLines , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = { en: { num: '01', label: 'The agent writes the plan', title: 'Draft', caption: 'Four statements, one file.', side: 'left' },
  zh: { num: '01', label: '代理先写出计划', title: '起草', caption: '四条语句，一个文件。', side: 'left' } };
const tplan = (s, bpm, L) => {
  const out = 0.125, settled = 0.6, reads = [[0.08, [s.label], G], [0.1, [s.title]], [0.3, [s.caption], G]];
  const D = Math.max(needU(reads, settled, out, bpm, L), s.minBeats ? s.minBeats / 2 : 0), hops = [];
  for (let u = 0.5; u < D - out - 0.1 + 1e-9; u += 0.5) hops.push(u);
  return { reads, settled, D, hops, sinkAt: D - out };
};
export default {
  id: 'numeral-chapter', kind: 'scene',
  fits: ['turn', 'rest'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: [], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid'], type: ['display', 'text', 'mono'] },
  slots: {
    num: { type: 'number', tier: 'primary', limits: { en: { chars: 2 }, zh: { chars: 2 } } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 8 }, zh: { chars: 4 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), beats = Math.round(P.D * 2);
    return { beats, reads: [{ text: s.title, lang: ctx.lang }], cues: [{ beat: 0, kind: 'land' }, { beat: 0.4, kind: 'stamp' }, ...P.hops.map((h) => ({ beat: h * 2, kind: 'tick' }))], motion: 'numeral, label, title, rule, caption; the numeral steps on every beat', settled: P.settled * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L);
    const left = (s.side || 'left') === 'left';
    ground(ctx, C);
    const x0 = AT(P.sinkAt), xd = 0.19, sk = (i) => ck.sec(x0 + 0.03 * i, xd, E.p3In), off = (p, i) => (sk(i) > 0 ? sinkOff(sk(i)) : riseOff(p));
    let dx = 0; P.hops.forEach((h) => { dx += -6 * E.p2Out((ck.t - AT(h) + 0.06) / 0.12); });
    const nf = F('num', L, 640), tx = left ? 972 : 96;
    if (left) masked(ctx, s.num, 72 + dx, 150, nf, C, { off: off(tw(0, 0.55), 0), lh: 0.82, rich: false });
    else masked(ctx, s.num, 1860 - dx, 150, nf, C, { off: off(tw(0, 0.55), 0), lh: 0.82, rich: false, align: 'right' });
    masked(ctx, labelText(s.label, L), tx, 250, labelFont(L), C, { off: off(tw(0.08, 0.4), 1), lh: null, color: C.dim, rich: false });
    const tf = (z) => F('display', L, z), tz = fitSize(ctx, plain(s.title), tf, 858, 225, 160);
    masked(ctx, s.title, tx - 6, 300, tf(tz), C, { off: off(tw(0.1, 0.5), 2), lh: 1 });
    const rg = tw(0.2, 0.45) * (1 - ck.sec(x0 + 0.03, xd, E.p3In));
    rect(ctx, tx + (ck.t > x0 ? 852 * (1 - rg) : 0), 560, 852 * rg, 12, C.ink);
    const cp = tw(0.3, 0.3, E.p2Out) * (1 - ck.sec(x0, 0.12, E.none)), cf = F('text', L, zh(L) ? 40 : 36, 500);
    wrapLines(ctx, s.caption, cf, 852, L).slice(0, 2).forEach((ln, i) => at(ctx, ln, tx, 600 + i * cf.size * 1.25, cf, C.ink, { lh: 1.25, alpha: cp, dy: 12 * (1 - tw(0.3, 0.3, E.p2Out)) }));
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track(u, s) { return [[(s.side || 'left') === 'left' ? 400 : 1500, 420]]; },
};

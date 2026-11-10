// input-output — the claim as input → output: the full accent field (left by the problem's wipe) collapses to the
// left half and becomes the person's INPUT side; the output lines rise on the paper half; an arrow draws across the
// input half, an ink rule lands under the output, the product name and one line follow; on the next composition the
// accent half collapses into a band behind the input label and the input type turns ink as the band passes it.
// While the page holds, the arrow pushes forward one gutter a beat. From the plakat template's `claim`
// (assets/templates/plakat/scenes.js; plan, layout and tweens as there; the closing lock-up is left to poster-end).
import { clock, E, F, SZ, zh, masked, riseOff, sinkOff, at, rect, labelFont, labelText, fitSize, plain, ground, tooth, paperTooth, drawChrome, needU, G, drawPath, wrapLines, walkMoves , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { input: { label: 'YOU SIGN', lines: ['Each change.'] }, output: { label: 'IT APPLIES', lines: ['In small', 'batches.'] }, name: 'tablewarden', desc: 'Agents draft. You sign.' },
  zh: { input: { label: '你签字', lines: ['每一处改动。'] }, output: { label: '它执行', lines: ['分小批', '执行。'] }, name: 'tablewarden', desc: '代理起草，你来签字。' },
};
const tplan = (s, bpm, L) => {
  const collapse = 3.0, settled = Math.max(2.75 + 0.45, collapse + 0.6), out = 0.15;
  const reads = [[0.3, s.input.lines], [0.3, [s.input.label], G], [0.8, s.output.lines], [0.8, [s.output.label], G], [2.5, [s.name]], [2.75, [s.desc]]];
  const D = Math.max(needU(reads, settled, out, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  return { collapse, settled, out, reads, D, exit: D - out, moves: walkMoves(2.1, D - out).filter((u) => u < 1.5 || u > 2.75) };
};
export default {
  id: 'input-output', kind: 'scene',
  fits: ['claim', 'turn'],
  surface: ['canvas'],
  beats: { min: 8, max: 18 },
  needs: { motions: [], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    input: { type: 'group', of: {
      label: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
      lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } } } } },
    output: { type: 'group', of: {
      label: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
      lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } } } } },
    name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 16 }, zh: { chars: 8 } } },
    desc: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 40 }, zh: { chars: 16 } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), beats = Math.round(P.D * 2);
    return { beats, reads: [...s.input.lines, ...s.output.lines, s.name, s.desc].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'turn' }, { beat: 0.6, kind: 'land' }, { beat: 1.6, kind: 'land' }, { beat: 3, kind: 'turn' }, { beat: 4, kind: 'stamp' }, { beat: 5, kind: 'tick' }, { beat: 6, kind: 'turn' }],
      motion: 'the accent half collapses into the input; output, arrow, rule, name; the half becomes a band', settled: P.settled * 2, peakAt: 0, shots: [{ beat: 6, what: 'the accent half collapses into a band' }] };
  },
  validate(s) { return !s.input?.lines?.length || !s.output?.lines?.length ? ['input and output need a line each'] : []; },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT, t } = ck, S = SZ(L);
    ground(ctx, C);
    const xp = ck.sec(AT(P.exit), 0.2, E.p2In), xs = ck.sec(AT(P.exit), 0.2, E.p3In);
    // the accent field: full → half (0.6 s), then a band at y 172–252 (0.6 s); the exit folds it to the left
    const half = 1 - 0.5 * tw(0, 0.6, E.expoInOut), col = tw(P.collapse, 0.6, E.expoInOut), sy = 1 - col * (1 - 80 / 1080), cy = 540 + col * (212 - 540);
    const fx = 1920 * half * (1 - ck.sec(AT(P.exit) + 0.04, 0.2, E.p2In)), fy = cy - 540 * sy, fh = 1080 * sy;
    rect(ctx, 0, fy, fx, fh, C.accent);
    const onField = (y) => y >= fy && y <= fy + fh;
    const lab = { ...labelFont(L, S.label, 600), spacing: zh(L) ? 0 : 0.1 * 25 };
    const a1 = tw(0.3, 0.6), b1 = tw(0.8, 0.6), sink = (p) => (xs > 0 ? sinkOff(xs) : riseOff(p));
    masked(ctx, labelText(s.input.label, L), 96, 196, lab, C, { off: sink(a1), lh: null, color: onField(210) ? C.onAccent : C.ink, rich: false });
    const inF = (z) => F('display', L, z);
    s.input.lines.forEach((l, i) => { const z = fitSize(ctx, plain(l), inF, 820, 120, 96), y = 300 + i * 136; masked(ctx, l, 96, y, inF(z), C, { off: sink(ck.sec(AT(0.3) + 0.1 * (i + 1), 0.6)), lh: 1, color: onField(y + 60) ? C.onAccent : C.ink }); });
    // the arrow (12 px, 800 wide at y 735), pushed one gutter per hold move
    let nx = 0; P.moves.forEach((m, i) => { const p = tw(m, 0.35); if (p > 0) nx = nx + (24 * ((i % 3) + 1) - nx) * p; });
    const ap = tw(1.5, 0.6, E.p3InOut), aa = 1 - ck.sec(AT(P.exit), 0.1, E.none);
    if (ap > 0 && aa > 0) { ctx.save(); ctx.globalAlpha = aa; ctx.translate(96 + nx, 690); drawPath(ctx, [[0, 45], [776, 45]], Math.min(1, ap * 1.25), onField(735) ? C.onAccent : C.ink, 12); if (ap > 0.8) drawPath(ctx, [[736, 8], [778, 45], [736, 82]], (ap - 0.8) / 0.2, onField(735) ? C.onAccent : C.ink, 12); ctx.restore(); }
    masked(ctx, labelText(s.output.label, L), 972, 196, lab, C, { off: sink(b1), lh: null, color: C.dim, rich: false });
    const outF = (z) => F('display', L, z);
    s.output.lines.forEach((l, i) => { const z = fitSize(ctx, plain(l), outF, 852, 120, 96); masked(ctx, l, 972, 300 + i * 136, outF(z), C, { off: sink(ck.sec(AT(0.8) + 0.1 * (i + 1), 0.6)), lh: 1 }); });
    const ul = tw(2.0, 0.5) * (1 - ck.sec(AT(P.exit) + 0.02, 0.2, E.p2In));
    rect(ctx, 972 + 852 * (1 - ul) * (xp > 0 ? 1 : 0), 612, 852 * ul, 14, C.ink);
    masked(ctx, s.name, 972, 712, { ...F('display', L, S.body === 40 ? 40 : 34, 800), spacing: zh(L) ? 0 : -0.02 * 34 }, C, { off: sink(tw(2.5, 0.5)), lh: 1 });
    const dp = tw(2.75, 0.45, E.p2Out) * (1 - ck.sec(AT(P.exit), 0.12, E.none)), df = F('text', L, S.body, 500);
    wrapLines(ctx, s.desc, df, 820, L).slice(0, 2).forEach((ln, i) => at(ctx, ln, 972, 776 + i * S.body * 1.3, df, C.ink, { lh: 1.3, alpha: dp, dy: 14 * (1 - tw(2.75, 0.45, E.p2Out)) }));
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L, { fields: fx > 0 ? [{ x: 0, y: fy, w: fx, h: fh }] : [] });
  },
  track() { return [[960, 540]]; },
};

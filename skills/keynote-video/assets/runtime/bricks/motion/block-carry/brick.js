// block-carry — plakat's reblock: the block that ends one page becomes the block that starts the next. The rest of
// the outgoing page rolls up under it (bottom-first clip, 0.25 s), the block itself crosses the cut changing only
// its rectangle (expoInOut, one beat, landing on the downbeat), and the incoming page's type rises round it.
// Two uses in the template: the install page's ink command block lands as the tagline's 28 px bar (`ink`), and the
// options page's accent pick lands as the flow's first YOU node (`accent`, the person carried over).
// From the plakat template's plakat-reblock (assets/templates/plakat/devices.js; scenes.js tagline/flow `from`).
import { E, F, SZ, COL, zh, masked, riseOff, at, rect, labelFont, labelText, fitSize, plain, ground, tooth, paperTooth, lerp, clamp } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { kind: 'ink', from: [96, 350, 1728, 200], to: [96, 726, 1728, 28], fromText: '› tw sign 0042', title: 'Start in one line', toLines: ['Agents draft.', '*You* sign.'], label: 'YOU' },
  zh: { kind: 'ink', from: [96, 350, 1728, 200], to: [96, 726, 1728, 28], fromText: '› tw sign 0042', title: '一行命令开始', toLines: ['代理起草。', '*你*来签字。'], label: '你' },
};
const seg = (p, a, b) => clamp((p - a) / (b - a));
export default {
  id: 'block-carry', kind: 'motion',
  tier: 'T2', family: 'shape', beats: 2,
  surface: ['canvas'],
  roles: ['paper', 'ink', 'grid', 'accent', 'onAccent', 'onInk'],
  from: 'a page ending on a solid block (its rect)',
  to: 'the next page, whose first element is a block at another rect',
  interpolates: ['the rest of the outgoing page clips away bottom-first', 'block rect from → to (expoInOut, one beat)', 'incoming type rises through its masks'],
  summary: 'The block that ends one page crosses the cut changing only its rectangle and becomes the first block of the next page.',
  theory: 'Object constancy (Heer & Robertson 2007): one solid shape survives the cut, so two pages read as one argument; the colour keeps its meaning across it (ink is the system, the accent is the person).',
  defaults: (P = {}) => ({ ...DEFAULT[zh(P.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5 }),
  prepare(P) { return { T: paperTooth(P.seed || 1, P.paper ?? 0.5) }; },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p, roll: E.p2In(seg(p, 0.0, 0.25)), m: E.expoInOut(seg(p, 0.25, 0.75)), rise: seg(p, 0.75, 1) }; },
  paint(ctx, S, P, D) {
    const C = P.colors, L = P.lang || 'en', acc = P.kind === 'accent', fill = acc ? C.accent : C.ink;
    ground(ctx, C);
    // the outgoing page: its title, rolled up bottom-first while the block stays
    if (S.m === 0 && S.roll < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080 * (1 - S.roll)); ctx.clip();
      const tz = fitSize(ctx, plain(P.title), (z) => F('display', L, z), 1732, 120, 100);
      masked(ctx, P.title, 92, 150, F('display', L, tz), C, { lh: 1 });
      ctx.restore();
    }
    const [a, b] = [P.from, P.to], r = a.map((v, i) => lerp(v, b[i], S.m));
    rect(ctx, r[0], r[1], r[2], r[3], fill);
    if (S.m < 0.15) at(ctx, acc ? P.label : P.fromText, r[0] + 40, r[1] + (acc ? 34 : 80), acc ? { ...F('display', L, SZ(L).body, 800) } : F('mono', L, 34, 400), acc ? C.onAccent : C.onInk, { alpha: 1 - S.m / 0.15 });
    if (S.rise > 0) {
      if (acc) at(ctx, P.label, r[0] + 20, r[1] + 34, F('display', L, SZ(L).body, 800), C.onAccent, { alpha: S.rise });
      else P.toLines.forEach((l, i) => { const z = fitSize(ctx, plain(l), (v) => F('display', L, v), 1736, 225, 164); masked(ctx, l, 88, 190 + 246 * i - (P.toLines.length === 2 ? 0 : 0), F('display', L, z), C, { off: riseOff(E.expoOut(clamp(S.rise * 1.6 - 0.3 * i))), lh: 1 }); });
    }
    tooth(ctx, D.T);
  },
  track(S, P) { const r = P.from.map((v, i) => lerp(v, P.to[i], S.m)); return [[r[0] + r[2] / 2, r[1] + r[3] / 2]]; },
};

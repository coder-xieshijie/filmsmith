// pile-split — the count is sorted into the answer: the ledger card pushes in place to the full ruled page, a "sorted by"
// label names the rule, the heap splits into one pile per group (each dot crossing on its own and taking its group's
// colour), the share lands as a large figure with its count beside it and the group's examples drop in as chips; later
// one pile splits again — the dots that need a judgement swell red and gather into their own small pile, the rest go
// grey — and the second figure names that share. The counter at the top right keeps the total all scene.
// From the terminal-ledger kit as the approved film uses it (the source film
// segments/abc.js 15.8–27.4 s; the kit's demo-a2): F.ledger grow, toPile, F.partition, F.lbl, F.chip, F.how, F.tag;
// the dots' sorting is dot-sort's. Seconds from the scene's start, as the narration places them.
import { wallPlan, drawCollapse } from '../wall-ledger/brick.js';
import { W, drawChapter, drawCounter, drawHow, drawTag, drawLedgerPage, drawDot, dotColor, drawChip, pile, assign, partition, rank, hash, say, widthOf, tw, E, lerp, mix, clamp } from '../../look/paper-ledger/kit.js';

const DEFAULT = {
  en: { chapter: 'A week of email', title: 'To handle', how: 'Sorted by: does it need you', tag: 'Dot places and counts are illustrative', counter: { value: '600', unit: 'emails may need you' }, total: 600,
    groups: [{ count: 300, color: 'wait', pct: '50%', sub: 'about 300', chips: ['Alerts', 'Newsletters', 'Ads'] }, { count: 300, color: 'base', keep: true, split: [{ count: 120, color: 'judge', label: 'about 2 in 10', sub: 'about 120' }, { count: 180, color: 'rest' }] }] },
  zh: { chapter: '一周的邮件', title: '待处理', how: '分法：按要不要你动手', tag: '点的位置和个数都是示意', counter: { value: '600', unit: '封可能要处理' }, total: 600,
    groups: [{ count: 300, color: 'wait', pct: '50%', sub: '约 300 封', chips: ['通知', '订阅', '广告'] }, { count: 300, color: 'base', keep: true, split: [{ count: 120, color: 'judge', label: '约两成', sub: '约 120 封' }, { count: 180, color: 'rest' }] }] },
};
// the approved film's layout and times (seconds from 15.83 s in the film)
const AT = { grow: 0.12, how: 0.92, tag: 1.37, sort: [0.85, 0.97], pct: 1.72, sub: 2.57, chips: [3.65, 4.32, 5.13], pop: 7.62, move: 8.67, fade: 8.62, label: 9.4, label2: 9.8, end: 11.62 };
const GEO = { card: [1190, 196, 0.28], heap: [790, 512], piles: [[372, 536, 23], [1090, 512, 37]], split: [[936, 396, 41, [1.1, 0.92]], [1272, 664, 53, [1.12, 0.9]]],
  pct: [228, 262], sub: [452, 286], chipY: 726, chipX: [170, 288, 404], chipRot: [-2.5, 1.8, -1.2], label: [862, 220], label2: [1012, 236], tagAt: [120, 814] };
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export const pilePlan = (s) => {
  const A = { ...AT, ...(s.at || {}) }, G = { ...GEO, ...(s.geo || {}) }, leaves = [];
  s.groups.forEach((g, gi) => (g.split ? g.split.forEach((x, k) => leaves.push({ ...x, top: gi, leaf: k })) : leaves.push({ ...g, top: gi, leaf: -1 })));
  const n = leaves.reduce((a, x) => a + x.count, 0), leafOf = partition(n, leaves.map((x) => x.count), s.seed ?? 20261027);
  const start = assign([...Array(n).keys()], pile(n, G.heap[0], G.heap[1], 11), G.heap, () => [40, 512]);
  const st = new Array(n); for (const [i, q] of start) st[i] = q;
  const topOf = (i) => leaves[leafOf[i]].top, P1 = new Array(n), T1 = new Array(n), P2 = new Array(n);
  s.groups.forEach((g, gi) => {
    const sub = [...Array(n).keys()].filter((i) => topOf(i) === gi), [cx, cy, seed] = G.piles[gi], m = assign(sub, pile(sub.length, cx, cy, seed), [cx, cy], (i) => st[i]), rk = rank(sub, (i) => st[i][0]);
    const spread = gi === 0 ? 0.3 : 0.25, hs = gi === 0 ? 7 : 9;
    for (const i of sub) { P1[i] = m.get(i); T1[i] = A.sort[gi] + rk.get(i) * spread + hash(i, hs) * 0.08; }
    (g.split || []).forEach((x, k) => {
      const ss = sub.filter((i) => leafOf[i] === leaves.findIndex((l) => l.top === gi && l.leaf === k)), [sx, sy, sseed, sq] = G.split[k];
      const m2 = assign(ss, pile(ss.length, sx, sy, sseed, sq), [sx, sy], (i) => P1[i]); for (const i of ss) P2[i] = m2.get(i);
    });
  });
  return { A, G, n, leaves, leafOf, st, P1, T1, P2 };
};
// one dot at t: heap → its group's pile (colour on the way) → its leaf's pile when its group splits
export const pileDot = (C, s, D, i, t) => {
  const { A } = D, lf = D.leaves[D.leafOf[i]], g = s.groups[lf.top], base = dotColor(C, 'base');
  const u1 = tw(t, D.T1[i], 0.8, E.p3io), c1 = g.keep ? 0 : tw(t, D.T1[i] + 0.1, 0.6, E.p1io), gc = dotColor(C, g.color);
  let x = lerp(D.st[i][0], D.P1[i][0], u1), y = lerp(D.st[i][1], D.P1[i][1], u1), fill = mix(base.fill, gc.fill, c1), stroke = mix(base.stroke, gc.stroke, c1), sc = 1;
  if (lf.leaf >= 0 && D.P2[i]) {
    const lc = dotColor(C, lf.color);
    if (lf.leaf === 0) {        // the share that needs a judgement: swells red in place, then gathers
      const tp = A.pop + hash(i, 11) * 0.9, k = tw(t, tp, 0.14, E.p2o), tm = A.move + hash(i, 13) * 0.35, um = tw(t, tm, 0.8, E.p3io);
      fill = mix(fill, lc.fill, k); stroke = mix(stroke, lc.stroke, k); sc = t < tp + 0.14 ? lerp(1, 1.4, k) : lerp(1.4, 1, tw(t, tp + 0.14, 0.22, E.p2io));
      x = lerp(x, D.P2[i][0], um); y = lerp(y, D.P2[i][1], um);
    } else {                    // the rest: goes grey, then gathers
      const k = tw(t, A.fade + hash(i, 15) * 0.2, 0.6, E.p1io), um = tw(t, A.move + 0.1 + hash(i, 17) * 0.35, 0.85, E.p3io);
      fill = mix(fill, lc.fill, k); stroke = mix(stroke, lc.stroke, k); x = lerp(x, D.P2[i][0], um); y = lerp(y, D.P2[i][1], um);
    }
  }
  return { x, y, s: sc, a: 1, fill, stroke };
};
const blurLbl = (ctx, C, L, txt, [x, y], px, color, t, at, d = 0.22) => { if (!txt) return; const a = tw(t, at, d, E.p2o); if (a > 0) say(ctx, txt, x, y, L, px, color, { lh: Math.round(px * 1.15), alpha: a, blur: (1 - a) * 8 }); };

export default {
  id: 'pile-split', kind: 'scene',
  fits: ['demo', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 10, max: 40 },
  needs: { motions: ['dot-sort'], props: ['ruled-ledger', 'paper-frame'], roles: ['ground', 'paper', 'ink', 'dim', 'line', 'base', 'baseS', 'wait', 'waitS', 'waitSoft', 'judge', 'judgeS', 'rest', 'restS', 'ruling', 'margin', 'chapInk', 'chapRule'], type: ['text'] },
  slots: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 12, 5) },
    how: { type: 'text', tier: 'glance', limits: lim(34, 16, 6) },
    tag: { type: 'text', tier: 'glance', limits: lim(40, 18, 7) },
    counter: { type: 'object' },
    fromWall: { type: 'object', optional: true },
    title: { type: 'text', tier: 'glance', optional: true, limits: lim(16, 8, 3) },
    groups: { type: 'list', count: [2, 2], of: { count: { type: 'number', limits: lim(4, 4, 1) }, pct: { type: 'text', tier: 'primary', optional: true, limits: lim(6, 6, 1) }, sub: { type: 'text', tier: 'glance', optional: true, limits: lim(14, 7, 3) }, chips: { type: 'list', count: [0, 3], of: { type: 'text', tier: 'word', limits: lim(12, 4, 2) } }, split: { type: 'list', count: [0, 2], optional: true } } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'line', 'base', 'baseS', 'wait', 'waitS', 'waitSoft', 'judge', 'judgeS', 'rest', 'restS', 'ruling', 'margin', 'chapInk', 'chapRule'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, A = { ...AT, ...(s.at || {}) }, hasSplit = s.groups.some((g) => g.split), end = Math.max(A.end, (hasSplit ? A.label2 : A.chips.at(-1)) + 1.2);
    return { beats: clamp(Math.ceil(end / B - 1e-9), this.beats.min, this.beats.max), reads: [{ text: s.how, lang: ctx.lang, tier: 'glance' }, ...s.groups.flatMap((g) => [g.pct, g.sub, ...(g.split || []).map((x) => x.label)]).filter(Boolean).map((x) => ({ text: x, lang: ctx.lang }))],
      cues: [{ beat: A.grow / B, kind: 'turn' }, ...A.chips.map((x) => ({ beat: x / B, kind: 'accent' })), ...(hasSplit ? [{ beat: A.pop / B, kind: 'tick' }, { beat: A.label / B, kind: 'accent' }] : [])],
      motion: 'dot-sort', settled: (hasSplit ? A.move + 1.2 : A.sort[1] + 1.2) / B, peakAt: (hasSplit ? A.label : A.pct) / B, pause: 0, lead: 0 };
  },
  validate(s) { return s.groups?.length === 2 ? [] : ['groups: two (the second may split in two)']; },
  prepare(s, c) { return { B: 60 / c.bpm, D: pilePlan(s), WP: s.fromWall ? wallPlan({ dots: 0, ...s.fromWall }) : null }; },
  paint(ctx, u, s, c, X) {
    const C = s.colors, L = c.lang, D = X.D, A = D.A, G = D.G, t = u * X.B;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    drawChapter(ctx, C, L, { text: s.chapter, at: -1 }, t);
    // the card pushes in place to the full page; its frame and title go, the rules leave and return near the end
    const g = tw(t, A.grow, 0.8, E.p2io), [cx, cy, cs] = G.card, fr = 1 - tw(t, A.grow - 0.12, 0.2, E.p1i), rl = 1 - tw(t, A.grow - 0.12, 0.2, E.p1i) + tw(t, A.grow + 0.8 - 0.18, 0.3, E.p1o);
    drawLedgerPage(ctx, C, L, { x: lerp(cx, 0, g), y: lerp(cy, 0, g), s: lerp(cs, 1, g) }, { frame: fr, title: 1 - tw(t, A.grow - 0.12, 0.15, E.p1i), text: s.title || '', rules: clamp(rl), dots: (cc) => { for (let i = 0; i < D.n; i++) drawDot(cc, pileDot(C, s, D, i, t), i); } });
    // the wall-ledger scene before still collapsing into the card (fromWall: its params and `offset`, the seconds it started before this scene)
    if (X.WP) drawCollapse(ctx, C, X.WP, t + (s.fromWall.offset ?? 6.13));
    drawHow(ctx, C, L, s.how, t, A.how);
    drawTag(ctx, C, L, s.tag, ...G.tagAt, tw(t, A.tag, 0.4, E.p1o));
    const [g0, g1] = s.groups;
    blurLbl(ctx, C, L, g0.pct, G.pct, 66, C.ink, t, A.pct);
    // a count line sits after its figure: at the film's place, or further right when the figure is wider (English)
    const after = (txt, at, px, sub) => [Math.max(sub[0], at[0] + (txt ? widthOf(ctx, txt, L, px) : 0) + 16), sub[1]];
    blurLbl(ctx, C, L, g0.sub, after(g0.pct, G.pct, 66, G.sub), 28, C.dim, t, A.sub, 0.3);
    (g0.chips || []).slice(0, 3).forEach((txt, k) => drawChip(ctx, C, L, txt, G.chipX[k], G.chipY, 'c', t, A.chips[k], G.chipRot[k]));
    const sp = g1.split?.[0];
    if (sp) { blurLbl(ctx, C, L, sp.label, G.label, 46, C.judgeS, t, A.label); blurLbl(ctx, C, L, sp.sub, after(sp.label, G.label, 46, G.label2), 28, C.dim, t, A.label2, 0.3); }
    const cn = s.counter || {};
    drawCounter(ctx, C, L, { on: -1, segs: [{ t0: -1, t1: 1e9, value: cn.value ?? String(s.total ?? D.n) }], units: [{ text: cn.unit, on: -1 }], approx: cn.approx ? -1 : null }, t);
  },
  track(u, s, c, X) { const t = u * X.B, D = X.D; return [0, Math.floor(D.n / 3), Math.floor((2 * D.n) / 3), D.n - 1].map((i) => { const d = pileDot(s.colors, s, D, i, t); return [d.x, d.y]; }); },
  blur: () => false,
};

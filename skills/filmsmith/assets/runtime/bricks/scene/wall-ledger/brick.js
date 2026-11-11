// wall-ledger — the work is read and what matters is counted: the terminal shrinks into a wall of small windows (term-wall),
// a reader frame in the machine's teal walks the windows and ticks each, a rail draws to a small ledger card, marks pop out
// of the windows and run along the rail into it, and every mark pours its dots onto the card's heap while the counter at
// the top right counts the dots that have landed (a hop when it settles); a legend says what a mark and a dot stand for;
// then the wall collapses into the card's entrance, which the next scene pushes in on.
// From the terminal-ledger kit as the approved film uses it (the source film
// segments/abc.js 9.7–15.8 s; the kit's demo-a2): F.wall (fromTerm, read, emit, collapse), F.ledger (card, addDots,
// F.assign onto F.pile), the counter and the chapter label. Seconds from the scene's start, as the narration places them.
import { W, drawChapter, drawCounter, drawLedgerPage, drawDot, dotColor, drawMini, drawAgentTag, wallSlots, mulberry32, pile, assign, hash, say, tw, E, lerp, clamp, rrect, sample, lengths, pointAt, strokePart, rgba } from '../../look/paper-ledger/kit.js';
import { termToWall } from '../../motion/term-wall/brick.js';
import TC, { countInner } from '../term-count/brick.js';

const DEFAULT = {
  en: { chapter: 'A week of email', term: { box: [360, 130, 1200, 590], title: 'Inbox · this week', line: 'How many emails came in this week?' },
    wall: { label: '1,200 emails · one window per batch (illustrative)' }, reader: { label: 'A program reads each' }, ledger: { title: 'To handle' },
    counter: { unit: 'emails may need you' }, legend: ['One mark = one batch of emails', 'One dot = one email'], dots: 600 },
  zh: { chapter: '一周的邮件', term: { box: [360, 130, 1200, 590], title: '收件箱 · 本周', line: '这一周收到多少封邮件？' },
    wall: { label: '1,200 封邮件 · 一个窗口代表一批（示意）' }, reader: { label: '程序逐封读' }, ledger: { title: '待处理' },
    counter: { unit: '封可能要处理' }, legend: ['一颗记号 = 一批邮件', '一颗点 = 一封邮件'], dots: 600 },
};
// the approved film's times, seconds from the scene's start (9.7 s in the film)
const AT = { label: 0.9, readShow: 0.37, read: [1.21, 2.44], card: 2.75, rail: 2.85, pop: 2.9, go: 3.25, jump: 5.3, legend: [[3.2, 4.6], [4.77, 5.9]], collapse: 5.9, end: 6.13 };
const GEO = { cols: 6, rows: 4, x0: 130, y0: 200, dx: 172, dy: 118, seed: 20261027, labelAt: [130, 678], card: [1190, 196, 0.28], heap: [790, 512], from: [40, 512], rail: [[140, 178], [1180, 178], [1180, 339], [1201, 339]], legendAt: [1190, 534], marks: 21 };
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export const wallPlan = (s) => {
  const G = { ...GEO, ...(s.geo || {}) }, A = { ...AT, ...(s.at || {}) }, slots = wallSlots(G), rnd = mulberry32(G.seed);
  const rows = slots.map(() => [32, 50, 68].map(() => 50 + Math.round(rnd() * 70)));
  const pick = []; for (let i = 0; i < G.marks; i++) pick.push(Math.floor(rnd() * slots.length)); pick.sort((a, b) => a - b);
  const cnt = {}, marks = pick.map((wi, i) => { const j = (cnt[wi] = (cnt[wi] || 0) + 1) - 1, [x, y] = slots[wi]; const mx = x + 161, my = y + 22 + j * 28; const pts = [[mx, my], [mx, G.rail[0][1]], ...G.rail.slice(1)]; return { mx, my, pts, Ls: lengths(pts), pop: A.pop + 0.02 + i * 0.018, go: A.go + i * 0.045 }; });
  const n = s.dots, order = [...Array(n).keys()], r7 = mulberry32(7);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r7() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const markOf = new Array(n); order.forEach((i, k) => (markOf[i] = Math.floor((k * G.marks) / n)));
  const heap = assign([...Array(n).keys()], pile(n, G.heap[0], G.heap[1], 11), G.heap, () => G.from);
  const land = [...Array(n).keys()].map((i) => marks[markOf[i]].go + 0.7 + hash(i, 3) * 0.12);
  const sorted = land.map((x) => x + 0.3).sort((a, b) => a - b);
  return { G, A, slots, rows, marks, heap, land, sorted };
};
// the ledger card with the dots landed by t (page coordinates in the card's pose)
export const drawCardDots = (ctx, C, L, P, t, pose, title, frame = 1, rules = 1) => {
  const base = dotColor(C, 'base');
  drawLedgerPage(ctx, C, L, pose, { frame, title: frame, text: title, rules, dots: (c) => {
    for (let i = 0; i < P.land.length; i++) { const t0 = P.land[i]; if (t < t0) continue; const u = tw(t, t0, 0.34, E.p3o), q = P.heap.get(i); drawDot(c, { x: lerp(P.G.from[0], q[0], u), y: lerp(P.G.from[1], q[1], u), s: lerp(0.5, 1, u), a: 1, ...base }, i); }
  } });
};
// the wall flying into the card's entrance in order of distance (0.34 s power3.in): also drawn by pile-split, whose
// push-in starts while the far windows are still on their way
export const drawCollapse = (ctx, C, P, t) => {
  const A = P.A, end = P.G.rail.at(-1), to = [end[0] - 11, end[1] - 44];
  P.slots.forEach(([x, y], i) => { const dd = Math.hypot(end[0] - x, end[1] - y), u0 = tw(t, A.collapse + dd * 0.0002, 0.34, E.p3i); if (u0 < 1) drawMini(ctx, C, lerp(x, to[0], u0), lerp(y, to[1], u0), P.rows[i], { alpha: 1 - u0, scale: lerp(1, 0.2, u0), ck: 1 }); });
};
const landedBy = (P, t) => { let lo = 0, hi = P.sorted.length; while (lo < hi) { const m = (lo + hi) >> 1; if (P.sorted[m] <= t) lo = m + 1; else hi = m; } return lo; };

export default {
  id: 'wall-ledger', kind: 'scene',
  fits: ['problem', 'demo'],
  surface: ['canvas'],
  beats: { min: 8, max: 24 },
  needs: { motions: ['term-wall'], props: ['ruled-ledger', 'paper-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'machine', 'base', 'baseS', 'ruling', 'margin', 'chapInk', 'chapRule'], type: ['text', 'mono'] },
  slots: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 12, 5) },
    term: { type: 'object' },
    wall: { type: 'object' },
    reader: { type: 'object' },
    ledger: { type: 'object' },
    counter: { type: 'object' },
    legend: { type: 'list', count: [0, 2], of: { type: 'text', tier: 'glance', limits: lim(34, 14, 7) } },
    dots: { type: 'number', limits: lim(4, 4, 1) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'machine', 'base', 'baseS', 'ruling', 'margin', 'chapInk', 'chapRule'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, P = wallPlan(s), end = Math.max(P.A.end, P.sorted.at(-1) + 0.4);
    return { beats: clamp(Math.ceil(end / B - 1e-9), this.beats.min, this.beats.max), reads: [{ text: s.wall.label, lang: ctx.lang, tier: 'glance' }, ...(s.legend || []).map((x) => ({ text: x, lang: ctx.lang, tier: 'glance' }))],
      cues: [{ beat: 0.65 / B, kind: 'turn' }, { beat: P.A.rail / B, kind: 'turn' }, { beat: P.A.jump / B, kind: 'land' }], motion: 'term-wall', settled: P.A.jump / B, peakAt: P.A.jump / B, pause: 0, lead: 0 };
  },
  validate(s) { return s.dots > 0 ? [] : ['dots: how many items the ledger counts']; },
  prepare(s, c) { return { B: 60 / c.bpm, P: wallPlan(s) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, A = P.A, G = P.G, t = u * D.B;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    drawChapter(ctx, C, L, { text: s.chapter, at: -1 }, t);
    // the ledger card
    const ca = tw(t, A.card, 0.3, E.p1o);
    if (ca > 0) { ctx.save(); ctx.globalAlpha *= ca; drawCardDots(ctx, C, L, P, t, { x: G.card[0], y: G.card[1], s: G.card[2] }, s.ledger.title); ctx.restore(); }
    // the rail
    const rpts = G.rail, ra = 1 - tw(t, A.collapse, 0.25, E.p1i), rd = tw(t, A.rail, 0.45, E.p2o);
    if (rd > 0 && ra > 0) { ctx.save(); ctx.globalAlpha *= ra; ctx.strokeStyle = C.line; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; strokePart(ctx, rpts, 0, rd); ctx.restore(); }
    // the terminal into the wall, then the wall collapsing into the card's entrance
    const readStep = (A.read[1] - A.read[0]) / P.slots.length, ckAt = (i) => tw(t, A.read[0] + i * readStep + readStep * 0.8, 0.01, E.none);
    const tc = s.term.count ? { ...TC.defaults({ lang: L }), ...s.term.count, colors: C } : null;
    if (t < A.collapse) termToWall(ctx, C, L, s, t, P.slots, P.rows, { ck: ckAt, inner: tc ? (c) => countInner(c, C, L, tc, 1e9) : null });
    else drawCollapse(ctx, C, P, t);
    // the reader
    const rs = tw(t, A.readShow, 0.25, E.p1o) * (1 - tw(t, A.read[1] + 0.1, 0.2, E.p1i));
    if (rs > 0) {
      const k = clamp(Math.floor((t - A.read[0]) / readStep), 0, P.slots.length - 1), [x, y] = P.slots[t < A.read[0] ? 0 : k];
      ctx.save(); ctx.globalAlpha *= rs; rrect(ctx, x - 6, y - 6, 162, 108, 9); ctx.strokeStyle = C.machine; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      drawAgentTag(ctx, C, L, s.reader.label, x - 8, y - 52, rs);
    }
    // the wall's caption
    const la = tw(t, A.label, 0.4, E.p1o) * (1 - tw(t, A.collapse, 0.2, E.p1i));
    if (la > 0) say(ctx, s.wall.label, G.labelAt[0], G.labelAt[1], L, 28, C.dim, { lh: 40, alpha: la });
    // the marks, popping out of the windows and running along the rail
    for (const m of P.marks) {
      const pa = tw(t, m.pop, 0.18, E.back(1.6)), gone = tw(t, m.go + 0.68, 0.04, E.none);
      if (t < m.pop || gone >= 1) continue;
      const [x, y] = t < m.go ? [m.mx, m.my] : pointAt(m.pts, tw(t, m.go, 0.7, E.p2io), m.Ls);
      ctx.save(); ctx.globalAlpha *= clamp(tw(t, m.pop, 0.18, E.none) * 2) * (1 - gone); ctx.beginPath(); ctx.arc(x, y, 11 * Math.max(0, pa), 0, Math.PI * 2); ctx.fillStyle = C.base; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
    }
    // the legend
    (s.legend || []).slice(0, 2).forEach((txt, k) => {
      const [on, off] = A.legend[k], b = tw(t, on, 0.22, E.p2o) * (1 - tw(t, off, 0.15, E.p1i));
      if (b <= 0) return;
      const [x, y] = G.legendAt;
      ctx.save(); ctx.globalAlpha *= b; ctx.beginPath(); ctx.arc(x + (k ? 8 : 11), y + 20, k ? 7.5 : 11, 0, Math.PI * 2); ctx.fillStyle = C.base; ctx.fill(); ctx.lineWidth = k ? 1.2 : 2.5; ctx.strokeStyle = k ? C.baseS : C.ink; ctx.stroke(); ctx.restore();
      say(ctx, txt, x + 32, y, L, 26, C.dim, { lh: 40, alpha: b, blur: (1 - b) * 6 });
    });
    // the counter: the dots that have landed
    if (P.sorted.length) drawCounter(ctx, C, L, { on: P.sorted[0] - 0.12, segs: [{ t0: -1, t1: 1e9, fn: (tt) => landedBy(P, tt).toLocaleString('en-US') }], units: [{ text: s.counter.unit, on: P.sorted[0] - 0.05 }], jump: [A.jump] }, t);
  },
  track(u, s, c, D) { const t = u * D.B, m = D.P.marks[Math.min(D.P.marks.length - 1, 10)]; return [t < m.go ? [m.mx, m.my] : pointAt(m.pts, tw(t, m.go, 0.7, E.p2io), m.Ls)]; },
  blur: () => false,
};

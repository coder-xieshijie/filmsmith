// demo-a2 (example segment, deleted by npm run init; 7.5 s to the end): the terminal shrinks into a wall of mailbox windows → a reader walks them →
// windows emit marks that flow along a rail into a small ledger → each mark scatters into dots, the counter reaches 600 → the windows fold into the
// ledger, which pushes in to a full page → dots sort: half yellow (notices, subscriptions, ads), about two in ten red (needs your reply), the rest grey.
// Illustrative data, labelled as such on screen.
defineSegment('demo-a2', function build(ctx) {
  const { init, to, set, show, hide, blurIn, hash, div, svgEl, COL } = F;
  const T = ctx.T, L = ctx.layer, t0 = ctx.t0;
  const term = ctx.take('term');
  // ---------- a wall of windows, read one by one ----------
  const wall = F.wall(L, { cols: 6, rows: 4, x0: 130, y0: 200, dx: 172, dy: 118, seed: 20261027 });
  wall.fromTerm(term, t0); ctx.hit('paper', t0 + 0.65, 0.5);
  const wallLbl = div(L, 'abs nw', '1,200 封邮件 · 一个窗口代表一批（示意）', 130, 678, { fontSize: '28px', color: COL.mute });
  init(wallLbl, { opacity: 0 }); show(wallLbl, t0 + 0.5, 0.4);
  wall.read(T.read, T.readEnd, '程序逐封读', t0 + 0.25);
  // ---------- a small ledger; marks flow into it along a rail ----------
  const led = F.ledger(L, { title: '待处理', card: [1190, 196, 0.28] });
  led.appear(T.mark - 0.15);
  const rail = F.fullSvg(L);
  const railP = svgEl('path', { d: 'M140,178 L1180,178 L1180,339 L1201,339', fill: 'none', stroke: COL.stroke, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rail);
  init(railP, { drawSVG: '0%' }); init(rail, { opacity: 1 });
  to(railP, { drawSVG: '100%' }, T.mark - 0.05, 0.45, 'power2.out'); ctx.hit('paper', T.mark - 0.05, 0.4);
  const arrive = wall.emit({ n: 21, t: T.mark, go: T.mark + 0.35, path: (mx, my) => `M${mx},${my} L${mx},178 L1180,178 L1180,339 L1201,339` });
  // 600 dots: each mark that reaches the ledger scatters into the batch it stands for, landing in one heap
  const dots = led.addDots(600, { at: [40, 512], scale: 0.5, opacity: 0 });
  F.partition(dots, { c: 300, j: 120, r: 180 }, 20261027);
  const rr = F.rng(7), order = dots.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.forEach((i, k) => (dots[i].m = Math.floor((k * 21) / 600)));
  const heap = F.assign(dots, F.pile(600, 790, 512, 11), [790, 512], led.pos);
  const LAND = [];
  dots.forEach((o) => {
    const t = arrive[o.m] + hash(o.i, 3) * 0.12, q = heap.get(o);
    set(o.e, { opacity: 1 }, t); to(o.e, { x: q[0], y: q[1], scale: 1 }, t, 0.34, 'power3.out');
    LAND.push(t + 0.3);
  });
  LAND.sort((a, b) => a - b);
  const landed = (t) => { let lo = 0, hi = LAND.length; while (lo < hi) { const m = (lo + hi) >> 1; if (LAND[m] <= t) lo = m + 1; else hi = m; } return lo; };
  F.unit('n', '封可能要处理');
  F.cntSeg(T.mark, ctx.t1, (t) => F.fmtInt(landed(t)));
  F.cntOn(LAND[0] - 0.12); F.unitOn('n', LAND[0] - 0.05);
  const full = LAND[LAND.length - 1];
  F.cntJump(full + 0.1); ctx.hit('stamp', full + 0.08, 0.55);
  const leg = (h, a) => { const e = div(L, 'abs nw', h, 1190, 520, { fontSize: '26px', color: COL.mute }); init(e, { opacity: 0, filter: 'blur(6px)' }); blurIn(e, a, 0.22); return e; };
  F.blurOut(leg('<i class="icoM"></i>一颗记号 = 一批邮件', T.mark + 0.3), T.n600 - 0.2, 0.15);
  hide(leg('<i class="icoD"></i>一颗点 = 一封邮件', T.n600 - 0.03), full + 0.65, 0.2);
  // ---------- 600 settles and holds 0.6 s → the windows fold into the ledger → it pushes in to a full page ----------
  const fold = full + 0.7;
  hide(wallLbl, fold, 0.2); to(rail, { opacity: 0 }, fold, 0.25);
  wall.collapse(1201, 339, fold);
  led.grow(fold + 0.35, 0.8); ctx.hit('whoosh', fold + 0.4, 0.35);
  // ---------- sorted by whether you have to act ----------
  const gS = F.group(ctx.scr);
  const how1 = F.how(gS, '分法：按要不要你动手'); blurIn(how1, T.pct, 0.2);
  show(F.tag(gS, '点的位置和个数都是示意', 120, 814), T.pct + 0.45, 0.4);
  const cont = dots.filter((o) => o.k === 'c'), rem = dots.filter((o) => o.k !== 'c');
  led.toPile(cont, F.pile(300, 372, 536, 23), [372, 536], T.pct - 0.07, { spread: 0.3, jitter: 0.08, color: 'cont' });
  led.toPile(rem, F.pile(300, 1090, 512, 37), [1090, 512], T.pct + 0.05, { spread: 0.25, jitter: 0.08, seed: 9 });
  const gA = F.group(L);
  to(F.lbl(gA, '50%', 228, 262, 66, COL.ink), { opacity: 1, filter: 'blur(0px)' }, T.pct + 0.8, 0.22, 'power2.out');
  to(F.lbl(gA, '约 300 封', 400, 286, 28, COL.mute), { opacity: 1, filter: 'blur(0px)' }, T.pct + 1.4, 0.3, 'power1.out');
  [['通知', 200, T.tongzhi, -2.5], ['订阅', 300, T.dingyue, 1.8], ['广告', 400, T.guanggao, -1.2]].forEach(([s, x, t, rot]) => { F.chip(gA, s, x, 726, 'c', t, rot); ctx.hit('paper', t + 0.05, 0.42); });
  // The ones that need you, about two in ten, turn red and gather top centre; the remaining three in ten fade to grey bottom right, unlabelled
  const judge = rem.filter((o) => o.k === 'j'), rest = rem.filter((o) => o.k === 'r');
  const mJ = F.assign(judge, F.pile(120, 936, 396, 41, [1.1, 0.92]), [936, 396], led.pos);
  const mR = F.assign(rest, F.pile(180, 1272, 664, 53, [1.12, 0.9]), [1272, 664], led.pos);
  judge.forEach((o) => {
    const t = T.judge + hash(o.i, 11) * 0.9;
    to(o.e, { fill: COL.judge, stroke: COL.judgeS, scale: 1.4 }, t, 0.14, 'power2.out'); to(o.e, { scale: 1 }, t + 0.14, 0.22, 'power2.inOut');
    const q = mJ.get(o); to(o.e, { x: q[0], y: q[1] }, T.judge + 1.05 + hash(o.i, 13) * 0.35, 0.8, 'power3.inOut');
  });
  rest.forEach((o) => {
    to(o.e, { fill: COL.rest, stroke: COL.restS }, T.judge + 1.0 + hash(o.i, 15) * 0.2, 0.6, 'power1.inOut');
    const q = mR.get(o); to(o.e, { x: q[0], y: q[1] }, T.judge + 1.15 + hash(o.i, 17) * 0.35, 0.85, 'power3.inOut');
  });
  [0.05, 0.4, 0.75].forEach((d, i) => ctx.hit('tick', T.judge + d, [0.45, 0.38, 0.42][i]));
  to(F.lbl(gA, '约两成', 862, 220, 46, COL.judgeS), { opacity: 1, filter: 'blur(0px)' }, T.liang - 0.15, 0.22, 'power2.out');
  to(F.lbl(gA, '约 120 封', 1012, 236, 28, COL.mute), { opacity: 1, filter: 'blur(0px)' }, T.liang + 0.25, 0.3, 'power1.out');
  ctx.hit('paper', T.liang, 0.4);
  ctx.give('ledger', led); ctx.give('labelsA', gA); ctx.give('howA', gS);
});

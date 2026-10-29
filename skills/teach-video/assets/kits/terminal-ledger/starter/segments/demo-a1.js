// demo-a1 (example segment, deleted by npm run init; 0–7.5 s): a terminal types a question → three mailboxes → 1,200 fills a grid column by column
// → nearly 3,000 minutes rides a progress bar. Illustrative data. Hands the terminal to demo-a2.
defineSegment('demo-a1', function build(ctx) {
  const { tl, init, to, show, hide, pop, div, COL } = F;
  const T = ctx.T, L = ctx.layer;
  F.chapter('一周的邮件', 0.25);
  const w = F.term(L, { title: '收件箱 · 本周', x: 360, y: 130, w: 1200, h: 590 });
  init(w, { opacity: 0, y: 24, height: 140 });
  to(w, { opacity: 1, y: 0 }, 0.12, 0.6, 'power3.out');
  to(w, { height: 215 }, T.clients - 0.2, 0.3, 'power2.out');
  to(w, { height: 590 }, T.n1200 - 0.45, 0.4, 'power2.out');
  F.termType(w, '› ', '这一周收到多少封邮件？', 0.5, 0.055, { x: 36, y: 54, size: 40, caret: 1.9 });
  const lb = (s, x, y, size = 28) => { const e = div(w, 'abs nw', s, x, y, { fontSize: size + 'px', color: COL.mute }); init(e, { opacity: 0 }); return e; };
  show(lb('邮箱', 36, 142), T.clients - 0.05, 0.3);
  ['工作邮箱', '个人邮箱', '订阅邮箱'].forEach((s, i) => { const p = div(w, 'pill', s, [130, 282, 434][i], 136); init(p, { opacity: 0, scale: 0.75, transformOrigin: '0% 50%' }); pop(p, T.clients + 0.1 + i * 0.25); ctx.hit('tick', T.clients + 0.15 + i * 0.25, 0.5); });
  show(lb('邮件', 36, 212), T.n1200 - 0.25); show(lb('每格一封邮件', 36, 374, 24), T.n1200 - 0.2);
  const big = (x, y) => { const e = div(w, 'abs nw dg', F.dg('0'), x, y, { fontSize: '80px', lineHeight: '1' }); init(e, { opacity: 0, scale: 1, transformOrigin: '0% 60%' }); return e; };
  const nS = big(36, 256); show(nS, T.n1200 - 0.25);
  // 1,200 mails as a grid: 100 columns × 12 rows, filled column by column, the count follows the grid
  const grid = (bg) => div(w, 'abs', '', 36, 418, { width: '1000px', height: '120px', backgroundColor: bg, backgroundSize: '10px 10px',
    backgroundImage: `linear-gradient(to right, transparent 7px, ${COL.body} 7px), linear-gradient(to bottom, transparent 7px, ${COL.body} 7px)` });
  const gE = grid('#e6dfd0'), gF = grid('#3b3732');
  init(gE, { opacity: 0 }); show(gE, T.n1200 - 0.25, 0.3);
  init(gF, { clipPath: 'inset(0px 1000px 0px 0px)' });
  F.roll(nS, 0, 100, T.n1200, T.n1200End - T.n1200, (v) => F.dg(F.fmtInt(Math.round(v) * 12)), 'sine.inOut', (p, t) => tl.set(gF, { clipPath: `inset(0px ${1000 - Math.round(p * 100) * 10}px 0px 0px)` }, t), true);
  to(nS, { scale: 1.07 }, T.n1200End + 0.02, 0.16, 'power3.out'); to(nS, { scale: 1 }, T.n1200End + 0.18, 0.16, 'power2.out');
  ctx.hit('tick', T.n1200End, 0.6);
  // Nearly 3,000 minutes to read them all: the progress bar fills
  show(lb('全部读完要（分钟）', 640, 212), T.mins, 0.3);
  const near = div(w, 'abs nw', '近', 640, 270, { fontSize: '48px', lineHeight: '1' }); init(near, { opacity: 0, filter: 'blur(6px)' }); F.blurIn(near, T.near, 0.18);
  const nM = big(700, 256); show(nM, T.mins, 0.3);
  const bar = div(w, 'bar-prog', '<b></b>', 640, 352, { width: '500px' }); init(bar, { opacity: 0 }); show(bar, T.mins, 0.3);
  init(bar.firstChild, { scaleX: 0 }); to(bar.firstChild, { scaleX: 1 }, T.n3000, T.n3000End - T.n3000, 'sine.inOut');
  F.roll(nM, 0, 3000, T.n3000, T.n3000End - T.n3000, (v) => F.dg(F.fmtInt(Math.round(v / 20) * 20)), 'sine.inOut', null, true);
  to(nM, { scale: 1.07 }, T.n3000End + 0.02, 0.16, 'power3.out'); to(nM, { scale: 1 }, T.n3000End + 0.18, 0.16, 'power2.out');
  ctx.hit('tick', T.n3000End, 0.6);
  const note = F.tag(L, '终端为示意 · 数字为示意数据', 360, 752); show(note, T.n1200, 0.4); hide(note, ctx.t1 - 0.25, 0.2);
  ctx.give('term', w);
});

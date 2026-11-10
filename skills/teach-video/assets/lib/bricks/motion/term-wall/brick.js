// term-wall — one becomes many: the terminal's content goes (its title bar stays), the window shrinks into the first cell
// of a wall, becomes a small window there, and copies of it fan out into a grid (6 × 4 by default) one after another, so a
// single session reads as one of many.
// From teach-video assets/kits/terminal-ledger/starter/components/wall.js (F.wall, fromTerm: content hidden 0.2 s, the
// window 0.55 s power3.inOut into the first cell, the copies 0.03 s apart, 0.5 s power3.out each) as the approved film
// uses it (the source film segments/abc.js at 9.7 s). Seconds at 120 BPM.
import { drawTerm, drawTyped, drawMini, wallSlots, wallRows, tw, E, lerp, clamp } from '../../look/paper-ledger/kit.js';

const SEC = 0.5;
const DEFAULT = { en: { title: 'Inbox · this week', line: 'How many emails came in this week?' }, zh: { title: '收件箱 · 本周', line: '这一周收到多少封邮件？' } };
// the window and the wall at t seconds from the move's start (shared with wall-ledger)
export const termToWall = (ctx, C, lang, P, t, slots, rows, o = {}) => {
  const [tx, ty, tw0, th] = P.term.box, s0 = slots[0], u = tw(t, 0.1, 0.55, E.p3io), content = 1 - tw(t, 0, 0.2, E.p1i), gone = 1 - tw(t, 0.62, 0.05, E.none);
  if (gone > 0) drawTerm(ctx, C, lang, [lerp(tx, s0[0], u), lerp(ty, s0[1], u), tw0, th], { title: P.term.title, alpha: gone, scale: [lerp(1, 150 / tw0, u), lerp(1, 96 / th, u)] }, (c) => {
    if (content > 0) { c.save(); c.globalAlpha *= content; if (o.inner) o.inner(c); else drawTyped(c, C, lang, '› ', P.term.line || '', 36, 54, 1e9, 0, 0, { size: 40, lh: 64 }); c.restore(); }
  });
  slots.forEach(([x, y], i) => {
    if (i === 0) { const a = tw(t, 0.6, 0.05, E.none); if (a > 0) drawMini(ctx, C, x, y, rows[i], { alpha: a, ck: o.ck?.(i) }); return; }
    const t0 = 0.65 + (i - 1) * 0.03, a = tw(t, t0, 0.08, E.none), m = tw(t, t0, 0.5, E.p3o);
    if (a > 0) drawMini(ctx, C, lerp(s0[0], x, m), lerp(s0[1], y, m), rows[i], { alpha: a, ck: o.ck?.(i) });
  });
};
const total = (P) => 0.65 + (P.wall.cols * P.wall.rows - 2) * 0.03 + 0.5;
export default {
  id: 'term-wall', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 4,
  beatsFor: (P) => Math.ceil(((total(P) + 0.1) / SEC) * 2) / 2,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'rule', 'machine', 'dotR', 'dotY', 'dotG', 'shadow'],
  from: 'one light terminal window (its title and a typed line)',
  to: 'a wall of small windows, the first where the terminal shrank',
  interpolates: ['content opacity 1 → 0 (0.2 s)', 'window rect → the first cell (scale about its top left, 0.55 s power3.inOut)', 'each copy: first cell → its own cell, 0.03 s apart, 0.5 s power3.out'],
  summary: 'One becomes many: a terminal shrinks into the first cell of a wall and copies of it fan out into a grid of small windows.',
  theory: 'Shrinking the one window the viewer has watched into a cell, then multiplying the cell, carries identity across the change of scale (object constancy), so the wall reads as "many of that", not a new picture.',
  defaults: (ctx = {}) => { const d = DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en']; return { term: { box: [360, 130, 1200, 590], title: d.title, line: d.line }, wall: { cols: 6, rows: 4, x0: 130, y0: 200, dx: 172, dy: 118, seed: 20261027 } }; },
  prepare(P) { const slots = wallSlots(P.wall); return { slots, rows: wallRows(slots.length, P.wall.seed) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { return { p, t: p * this.beatsFor(P) * SEC }; },
  paint(ctx, S, P, D) { ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); termToWall(ctx, P.colors, P.lang, P, S.t, D.slots, D.rows); },
  track(S, P, D) {
    const [tx, ty] = P.term.box, s0 = D.slots[0], u = tw(S.t, 0.1, 0.55, E.p3io), last = D.slots.length - 1, m = tw(S.t, 0.65 + (last - 1) * 0.03, 0.5, E.p3o);
    return [[lerp(tx, s0[0], u), lerp(ty, s0[1], u)], [lerp(s0[0], D.slots[last][0], m), lerp(s0[1], D.slots[last][1], m)], [lerp(s0[0], D.slots[6][0], tw(S.t, 0.65 + 5 * 0.03, 0.5, E.p3o)), lerp(s0[1], D.slots[6][1], tw(S.t, 0.65 + 5 * 0.03, 0.5, E.p3o))]];
  },
  blur: () => false,
};

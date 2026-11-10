// thread-pierce — one thread gathers a scattered pile: from the mascot, the thread's white-hot head runs a smooth path
// through the centre of every item in turn (each lights with a ring of the accent as it is pierced), then the whole thread
// goes taut once (wider, a glow at its root) and relaxes. The items are the scene's; here neutral placeholders.
// From the stream template: plan.js the opening's path (Catmull-Rom through the items by angle, the head on io2 over 3.5
// beats, each item's pierce time), film.js renderOpen (the thread, the head, the lit ring, the taut swell).
import { palOf, thread, glow, catmull, cumLen, atLen, subPath, nearest, E, seg } from '../../prop/glow-thread/draw.js';
import { night, perch, placeholder, lighter } from '../../prop/glow-thread/demo.js';

const ITEMS = [[180, 110, 420, 230], [760, 120, 380, 180], [1310, 90, 420, 210], [1290, 620, 460, 240], [820, 780, 400, 180], [200, 640, 460, 220]];
const DROP = [960, 520], HEAD = 3.5 / 5, TAUT = [3.45 / 5, 3.6 / 5, 3.7 / 5, 4.3 / 5];
const io2inv = (y) => (y < 0.5 ? Math.sqrt(y / 2) : 1 - Math.sqrt(2 * (1 - y)) / 2);
export default {
  id: 'thread-pierce', kind: 'motion',
  tier: 'T2', family: 'line-path', beats: 5,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core', 'paper'],
  from: 'a scattered pile around the mascot, nothing threaded', to: 'one thread through the centre of every item, relaxed after one taut swell',
  interpolates: ['the head along the path (io2 over 3.5 beats)', 'each item\'s lit ring as the head passes (on in 0.08 beat, down to 40 %)', 'the taut swell (width ×1.6, a glow at the root) over 3.45–4.3 beats'],
  summary: 'One glowing thread runs through every scattered item from the mascot, lighting each as it passes, and goes taut once.',
  theory: 'Common fate and connectedness (Gestalt): one continuous line through scattered things makes them read as one group; the taut swell is the follow-through that says the line now holds them (Thomas & Johnston).',
  defaults: () => ({ palette: 'night', items: ITEMS }),
  prepare(P) {
    const items = (P.items || ITEMS).map(([x, y, w, h]) => ({ x, y, w, h, cx: x + w / 2, cy: y + h / 2 }));
    const byAng = [...items].sort((a, b) => Math.atan2(a.cy - DROP[1], a.cx - DROP[0]) - Math.atan2(b.cy - DROP[1], b.cx - DROP[0]));
    const wp = [DROP, ...byAng.filter((_, k) => k % 2 === 0).map((i) => [i.cx, i.cy]), ...byAng.filter((_, k) => k % 2 === 1).reverse().map((i) => [i.cx, i.cy]), [1980, 200]];
    const path = catmull(wp, 30), len = cumLen(path), total = len[len.length - 1];
    items.forEach((it) => { it.d = nearest(path, len, it.cx, it.cy); });
    return { ...palOf(P.colors, P.palette), items, path, len, total };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: Math.min(1, Math.max(0, p)) }; },
  head(p, D) { return D.total * E.io2(seg(p, 0, HEAD)); },
  paint(ctx, S, P, D) {
    const p = S.p, d1 = this.head(p, D), taut = seg(p, TAUT[0], TAUT[1]) * (1 - seg(p, TAUT[2], TAUT[3]));
    night(ctx, D.P, 1);
    D.items.forEach((it) => { const pt = HEAD * io2inv(Math.min(1, it.d / D.total)); const lit = d1 >= it.d ? seg(p, pt - 0.004, pt + 0.012) * (1 - 0.6 * seg(p, pt + 0.02, pt + 0.1)) : 0; placeholder(ctx, D.P, it.x, it.y, it.w, it.h, { lit, C: D.C }); });
    lighter(ctx, () => {
      if (d1 > 0.5) {
        thread(ctx, D.C, subPath(D.path, D.len, 0, d1), 1, 1 + 0.6 * taut);
        const hp = atLen(D.path, D.len, d1);
        if (p < HEAD) { glow(ctx, hp[0], hp[1], 44, D.C.line, 0.7); glow(ctx, hp[0], hp[1], 10, D.C.core, 1); }
      }
      if (taut > 0) glow(ctx, DROP[0], DROP[1], 260, D.C.line, 0.35 * taut);
    });
    perch(ctx, D.C, DROP[0], DROP[1], 1.6);
  },
  track(S, P, D) { return [atLen(D.path, D.len, this.head(S.p, D))]; },
};

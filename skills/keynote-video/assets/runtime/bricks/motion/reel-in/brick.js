// reel-in — the threaded pile is swallowed in one pull: every item slides back along the thread into the mascot, the
// nearest first, shrinking to a speck and fading over its last quarter, while the thread reels in behind the farthest;
// all arrive together. The items are the scene's; here neutral placeholders.
// From the stream template: film.js renderOpen (the tug: each item starts 0.6 beat × its distance share late, io2 to the
// tug's end over 2.5 beats, scale 1 → 0.08, the thread cut at the farthest item still on it).
import { palOf, thread, catmull, cumLen, atLen, subPath, nearest, E, seg, lerp } from '../../prop/glow-thread/draw.js';
import { night, perch, placeholder, lighter } from '../../prop/glow-thread/demo.js';

const ITEMS = [[180, 110, 420, 230], [760, 120, 380, 180], [1310, 90, 420, 210], [1290, 620, 460, 240], [820, 780, 400, 180], [200, 640, 460, 220]];
const DROP = [960, 520], PULL = 2.5 / 3;
export default {
  id: 'reel-in', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: 3,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core', 'paper'],
  from: 'items threaded on one line from the mascot', to: 'the mascot alone: every item swallowed, the thread reeled in',
  interpolates: ['each item\'s distance along the thread d → 0 (io2, starting 0.24 × its share of the length late)', 'its scale 1 → 0.08 and rotation → 0', 'its opacity over the last quarter', 'the thread\'s length to the farthest item still on it'],
  summary: 'Every item slides back along the thread into the mascot, nearest first, and is swallowed in one pull.',
  theory: 'Staggered arrival on one path (follow-through and overlapping action) reads as one pull, not many moves; shrinking into the mascot says the product took them over (Thomas & Johnston).',
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
  tug(it, p, D) { return E.io2(seg(p, 0.24 * PULL * (it.d / D.total), PULL)); },
  paint(ctx, S, P, D) {
    const p = S.p;
    night(ctx, D.P, 1);
    const far = Math.max(0, ...D.items.map((it) => it.d * (1 - this.tug(it, p, D))));
    const d1 = p <= 0 ? D.total : far;
    D.items.forEach((it) => {
      const tg = this.tug(it, p, D), q = atLen(D.path, D.len, it.d * (1 - tg)), s = lerp(1, 0.08, tg), o = 1 - seg(tg, 0.75, 1);
      if (o <= 0.001) return;
      ctx.save(); ctx.globalAlpha = o; ctx.translate(q[0], q[1]); ctx.scale(s, s); placeholder(ctx, D.P, -it.w / 2, -it.h / 2, it.w, it.h); ctx.restore();
    });
    lighter(ctx, () => { if (d1 > 0.5) thread(ctx, D.C, subPath(D.path, D.len, 0, d1), 1); });
    perch(ctx, D.C, DROP[0], DROP[1], 1.6);
  },
  track(S, P, D) { return D.items.map((it) => atLen(D.path, D.len, it.d * (1 - this.tug(it, S.p, D)))); },
};

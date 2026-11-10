// bar-window — ink's wipe out of a scene: over half a beat the full stop stretches sideways into a bar the width of
// the frame (expo out), then the bar opens vertically as a window onto the next scene, accelerating (power 2.2), fully
// open just before the downbeat. The dot is the transition: it was the last thing standing.
// From the ink template's `wipe` (assets/templates/ink/film.js drawTransition 'wipe'): the curves and timings the
// template's. `from` and `to` are scene painters; the dot's place and colour come from `dot`.
import { clamp } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { painterOf } from '../../sample.js';

export default {
  id: 'bar-window', kind: 'motion',
  tier: 'T1', family: 'split-wipe', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'accent'],
  from: 'a scene with its full stop standing', to: 'the next scene, full frame',
  interpolates: ['dot → bar: left and right edges to the frame edges, expo out over half a beat', 'bar height → frame: power 2.2 over the second half beat', 'the next scene clipped to the bar'],
  summary: 'The full stop stretches into a bar across the frame, then the bar opens like a window onto the next scene, landing on the downbeat.',
  theory: 'A transition grown from an element already on screen is read as caused, not imposed (the ink mode card: "the dot carries every cut"); the accelerating open puts the arrival on the beat (anticipation into the downbeat).',
  sceneRest: true,
  defaults: () => ({ from: { scene: 'title' }, to: { scene: 'detail' }, dot: { x: 1180, y: 610, r: 20 } }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const d = P.dot || { x: 960, y: 540, r: 20 }, u1 = expOut(clamp(p / 0.5)), u2 = Math.pow(clamp((p - 0.5) / 0.48), 2.2);
    return { p, left: d.x - d.r + (-10 - (d.x - d.r)) * u1, right: d.x + d.r + (1930 - (d.x + d.r)) * u1, open: u2 * (Math.max(d.y, 1080 - d.y) + 20), d };
  },
  paint(ctx, S, P, D) {
    if (S.p <= 0) return D.from(ctx);
    if (S.p >= 1) return D.to(ctx, 1);
    D.from(ctx);
    const d = S.d, C = P.colors;
    if (S.open > 0.5) { ctx.save(); ctx.beginPath(); ctx.rect(0, d.y - S.open, 1920, S.open * 2); ctx.clip(); D.to(ctx, 0); ctx.restore(); }
    const h = Math.max(d.r, 0) * (1 - clamp(S.open / d.r));
    if (h > 0.2) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.roundRect(S.left, d.y - d.r, S.right - S.left, d.r * 2, d.r); ctx.fill(); }
  },
  track(S) { return [[S.d.x, S.d.y]]; },
};

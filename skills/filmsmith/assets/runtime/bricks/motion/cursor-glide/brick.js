// cursor-glide — a pointer glides in (from off frame, or from where it was) to a control, presses it (0.86 about the
// tip) and a ripple in the accent confirms the click; several stops make a tour (tick, tick, tick, button).
// Adapted from video-shotcraft demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx (card
// references/shots/interaction/segmented-thumb-hero.md) and
// demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx (card
// references/shots/interaction/canvas-materialize-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the control
// removed (the brick draws only the pointer and its ripple over the caller's scene; the control's own response is the
// scene's); one timeline for one stop (the close-up) or many (the tour), exported as glideAt() for scenes.
import { clamp, lerp } from '../../../handoffs/util.js';
import { EASE, ease } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';
import { drawCursor, drawRipple } from '../../prop/cursor/brick.js';

const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
const curve = (name) => (name === 'cubicOut' ? cubicOut : ease(name));
const centre = ([x, y, w, h]) => [x + w / 2, y + h / 2];

// The legs of a glide in frames: each stop is reached after `travel` frames, clicked `wait` frames later, and the next
// leg leaves on the click frame (the hand moves on while the button springs back). `after` frames close the last
// ripple. Returns { legs: [{ f0, f1, a, b, click, ease }], frames }.
export const legsOf = (P) => {
  const legs = [];
  let f = P.appear || 0, at = P.start;
  P.stops.forEach((s, i) => {
    const travel = s.travel ?? (i ? 10 : 24), wait = s.wait ?? (i ? 1 : 4);
    legs.push({ f0: f, f1: f + travel, a: at, b: s.at, click: s.click !== false ? f + travel + wait : null, ease: s.ease || (i ? 'swift' : P.ease) });
    f = f + travel + wait; at = s.at;
  });
  return { legs, frames: f + P.after };
};

// The pointer at frame f of the glide: { x, y, press, alpha, ripples: [{ x, y, t }] }. Pure; scenes call it with
// their own frame offsets.
export const glideAt = (f, P, L = legsOf(P)) => {
  let x = P.start[0], y = P.start[1];
  for (const g of L.legs) {
    if (f < g.f0) break;
    const u = clamp((f - g.f0) / Math.max(1e-9, g.f1 - g.f0)), e = curve(g.ease)(u);
    x = lerp(g.a[0], g.b[0], e); y = lerp(g.a[1], g.b[1], e) - Math.sin(Math.PI * clamp(e)) * (P.arc || 0);
  }
  let press = 0;
  const ripples = [];
  for (const g of L.legs) if (g.click != null) {
    const d = f - g.click;
    if (d >= 0 && d < 7) press = Math.max(press, d < 3 ? d / 3 : 1 - (d - 3) / 4);
    if (d >= 0 && d < P.ripple.frames) ripples.push({ x: g.b[0], y: g.b[1], t: d / P.ripple.frames });
  }
  const alpha = P.appear ? clamp(f / P.appear) : 1;
  return { x, y, press, alpha, ripples };
};

export default {
  id: 'cursor-glide', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 2.6,
  beatsFor: (P) => legsOf(P).frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'accent'],
  from: 'a scene with the pointer away (off frame, or at its last stop)',
  to: 'the same scene, the pointer resting on the control it clicked',
  interpolates: ['pointer tip start → each stop (cubic out for the entry, swift between stops, optional arc)', 'press 0 → 1 → 0 (3 frames down, 4 up) at each click', 'ripple radius 0 → r, opacity 0.9 → 0 (quad out)'],
  summary: 'A pointer glides in to a control, presses it and a ripple in the accent confirms the click; several stops make a tour.',
  theory: 'Cause before effect (Michotte 1946): a visible hand arriving and pressing makes the interface change that follows read as caused, not autoplayed; the press and the ripple are the two halves of a button (:active, then confirmed).',
  sceneRest: false,
  defaults: (ctx = {}) => ({
    from: { scene: 'grid', target: 4 }, start: [2010, 1190], stops: [{ at: centre(gridRect(4)), travel: 24, wait: 4 }],
    ease: 'cubicOut', arc: 0, appear: 0, after: 11, h: 64, form: 'solid', ripple: { rings: 2, r: 54, frames: 11, glow: 24 },
  }),
  prepare(P) { return { scene: painterOf(P.from, P), L: legsOf(P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) { const f = p * D.L.frames; return { p, f, ...glideAt(f, P, D.L) }; },
  paint(ctx, S, P, D) {
    const c = P.colors;
    if (D.scene) D.scene(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    for (const r of S.ripples) drawRipple(ctx, r.x, r.y, r.t, { colors: c, r: P.ripple.r, rings: P.ripple.rings, frames: P.ripple.frames, glow: P.ripple.glow || 0 });
    drawCursor(ctx, S.x, S.y, { h: P.h, form: P.form, press: S.press, alpha: S.alpha, colors: c });
  },
  track(S) { return [[S.x, S.y]]; },
};

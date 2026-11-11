// outline-morph — one ink shape changes form without a cut: both outlines are sampled at 480 points of equal arc length
// from their top centre, clockwise, so point i of one goes to point i of the other (no twist, no crossing); the fill
// stays the ink, and the outline's stroke fades in as the new form settles. Shapes: a card (rounded or cut corners),
// the pill, a hexagon, a circle (the point), or any rect [x, y, w, h, r].
// From the morph template (assets/templates/morph/film.js outlineOf, resample, drawSolid: the card → hexagon morph,
// cubic in-out over 0.38 s after 0.1 s of content out). Theory: Sederberg & Greenwood 1992 (shape blending by
// arc-length correspondence).
import { CARD, PILL, CX, HX, HY, HR, colorsOf, outlineOf, hexOutline, circleOutline, morphPath, cubicInOut } from './ink.js';

const shapeOf = (k, corners) => {
  if (Array.isArray(k)) return outlineOf(k, corners);
  if (k === 'hex') return hexOutline();
  if (k === 'point') return circleOutline(HX, HY, 22);
  if (k === 'circle') return circleOutline(HX, HY, HR);
  if (k === 'pill') return outlineOf([CX - 520, PILL[0], 1040, PILL[1], PILL[1] / 2], corners);
  return outlineOf(CARD, corners);
};

export default {
  id: 'outline-morph', kind: 'motion',
  tier: 'T1', family: 'shape',
  beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'ink'],
  from: 'a closed ink shape (card, pill, point)', to: 'another closed ink shape (hexagon, circle, card)',
  interpolates: ['each of 480 outline points, at equal arc length'],
  summary: 'One ink shape morphs into another, point for point at equal arc length, so the form changes without a cut.',
  theory: 'Shape blending by arc-length correspondence (Sederberg & Greenwood 1992): equal parameter steps keep the outline from twisting; one continuous object reads as the same thing transformed (Gestalt common fate).',
  defaults: () => ({ from: 'card', to: 'hex', corners: 'round', bpm: 120 }),
  prepare(P) { return { A: shapeOf(P.from, P.corners), B: shapeOf(P.to, P.corners) }; },
  rest(side) { return { e: side === 'from' ? 0 : 1 }; },
  at(p) { return { e: cubicInOut(p) }; },
  paint(ctx, S, P, D) {
    const C = colorsOf(P);
    if (P.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080); }
    morphPath(ctx, D.A, D.B, S.e); ctx.fillStyle = C.ink; ctx.fill();
    if (S.e > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = 4 * S.e; ctx.strokeStyle = C.ink; ctx.stroke(); }
  },
  track(S, P, D) { const i = 0; const A = D.A[i], B = D.B[i]; return [[A[0] + (B[0] - A[0]) * S.e, A[1] + (B[1] - A[1]) * S.e]]; },
};

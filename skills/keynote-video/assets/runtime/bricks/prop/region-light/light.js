// light.js — the spotlight a real-asset film points with: a uniform veil of the ground over a rect with a hole for the
// region in play (a padded box or a full-width band), a ring round the region drawn on clockwise from its top-left
// corner over a ground-coloured under-stroke (so it reads on a white page or a black one), and a short level tick.
// Pure painters of their arguments, shared by the handset scenes (on a device's screen) and the exhibit ones (on a
// print). From the handset template (film.js paintScreen's veil and rings, the level tick) and runtime asset.js ring.
import { rgba, rrect } from '../../../handoffs/util.js';
import { ring } from '../../../handoffs/asset.js';

// The veil: `clip` { x, y, w, h } is what it covers; `poly` the hole ([[x, y], …], film px) or null (all veiled);
// `alpha` the veil's share of the ground; `fill` > 0 veils the hole too (a hole opening in a veiled screen).
export const veilHole = (g, clip, poly, C, alpha, fill = 0) => {
  if (alpha <= 0 && fill <= 0) return;
  const path = () => { poly.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  g.save();
  g.beginPath(); g.rect(clip.x, clip.y, clip.w, clip.h);
  if (poly) path();
  g.fillStyle = rgba(C.ground, Math.min(1, alpha)); g.fill('evenodd');
  if (poly && fill > 0) { g.beginPath(); path(); g.fillStyle = rgba(C.ground, Math.min(1, fill)); g.fill(); }
  g.restore();
};
// The ring: a `width` px accent stroke on a `under` px stroke of the ground, padded `pad`, corners `radius`, drawn on
// by `draw` (0..1) clockwise from the top-left corner.
export const ringRect = (g, r, C, { draw = 1, alpha = 1, pad = 8, radius = 10, width = 4, under = 9 } = {}) => {
  if (draw <= 0 || alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha;
  if (under > 0) ring(g, r, { colors: C }, { pad, radius, width: under, draw, color: C.ground });
  ring(g, r, { colors: C }, { pad, radius, width, draw, color: C.accent });
  g.restore();
};
// The level tick: 8 × 48 px of the accent centred on y.
export const tick = (g, x, y, C, alpha = 1, w = 8, h = 48) => {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = C.accent; rrect(g, x, y - h / 2, w, h, w / 2); g.fill(); g.restore();
};

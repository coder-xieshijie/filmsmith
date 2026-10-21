// roll — the sheet's paper roll. `unroll`: the roll drops from the sheet's top edge and leaves the frame with a flick's
// momentum, and the sheet hangs where it passed (paper visible only above the roll's front tangent). `rollup`: the
// roll comes back up from below and winds the sheet onto itself, stopping under the last thing left in view. The roll
// is the only object with volume in the mode: a paper cylinder lit from above (highlight, core shadow, a contact
// shadow on the sheet just above it), with spiral end caps. Theory: the hanging scroll and the handscroll are read by
// unrolling (a long sheet's own way of showing itself, one part at a time); a roll that keeps its identity is one
// object (Heer & Robertson 2007). Values `draft`.
//
// Params: `x`, `w` the sheet's span; `R` the roll's radius; `from`, `to` the roll centre's y (film px); `k` friction;
// `paper`, `shade`, `edge` colours of the roll; `sheet(ctx, clipBottom, P)` paints the sheet clipped above the roll.

import { clamp, lerp, rgba } from './util.js';
import { NEUTRAL } from './asset.js';
import { momentum } from './scroll-reel.js';

export const drawRoll = (ctx, y, P) => {
  const { x, w, R } = P, x0 = x - P.overhang, x1 = x + w + P.overhang, C = P.colors;
  ctx.save();
  // contact shadow on the sheet above the roll
  const sh = ctx.createLinearGradient(0, y - R - 26, 0, y - R + 2);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = sh; ctx.fillRect(x, y - R - 26, w, 28);
  // the cylinder: lit from above
  const g = ctx.createLinearGradient(0, y - R, 0, y + R);
  g.addColorStop(0, C.rollHi); g.addColorStop(0.32, C.roll); g.addColorStop(0.78, C.rollShade); g.addColorStop(1, C.rollEdge);
  ctx.fillStyle = g; ctx.fillRect(x0, y - R, x1 - x0, 2 * R);
  // a fine line where the outer turn of paper leaves the roll
  ctx.fillStyle = rgba(C.rollEdge, 0.5); ctx.fillRect(x0, y + R * 0.18, x1 - x0, 1.5);
  // end caps: the spiral of the rolled paper
  for (const cx of [x0, x1]) {
    ctx.save(); ctx.translate(cx, y); ctx.scale(0.3, 1);
    ctx.fillStyle = C.rollShade; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(C.rollEdge, 0.9); ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 9; a += 0.08) { const r = R * (0.18 + 0.82 * (a / (Math.PI * 9))); const px = Math.cos(a) * r, py = Math.sin(a) * r; if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
};

export default {
  name: 'roll',
  tier: 'T1',
  beats: 2,
  modes: ['scroll'],
  roles: ['ground', 'roll', 'rollHi', 'rollShade', 'rollEdge'],
  from: 'the sheet rolled (only what is above the roll in view)',
  to: 'the sheet hanging open (unroll) or wound up under its last section (rollup)',
  interpolates: ['roll position'],
  summary: 'The paper roll drops and the sheet hangs where it passed, or comes back up and winds the sheet onto itself.',
  theory: 'A long sheet shows itself by unrolling; the roll is one object throughout (Heer & Robertson 2007).',
  defaults: {
    x: 210, w: 1500, R: 30, overhang: 22, from: 84, to: 1160, k: 5,
    sheet: (ctx, bottom, P) => { ctx.fillStyle = '#F3F3F0'; ctx.fillRect(P.x, 54, P.w, Math.max(0, bottom - 54)); },
    colors: { ...NEUTRAL, roll: '#E4E0D7', rollHi: '#F6F3EC', rollShade: '#B5B0A6', rollEdge: '#7E7A72' },
  },
  rest(side, P) { return { y: side === 'from' ? P.from : P.to }; },
  at(p, P) { return { y: lerp(P.from, P.to, momentum(clamp(p), P.k)) }; },
  paint(ctx, S, P) {
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    P.sheet(ctx, S.y - P.R * 0.2, P);
    if (S.y - P.R < 1080 + P.R) drawRoll(ctx, S.y, P);
  },
  track: (S) => [[960, S.y]],
};

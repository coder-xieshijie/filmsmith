// stroke-reinterpret — three lines drawn into a flat hexagon (a Y from its centre) and three dashed hidden edges turn it,
// with zero displacement, into a cube in isometric: the same outline re-read as a solid. Theory: Y and arrow junctions
// are depth cues (Huffman 1971; Clowes 1971; Biederman 1987). references/transitions.md#stroke-reinterpret.

import { seg, expOut, ground } from './util.js';

const SOLID = [1, 3, 5], DASHED = [0, 2, 4];   // vertices of a pointy-top hexagon: seen edges from the near corner, hidden ones
const win = (i, hidden) => (hidden ? [i * 0.06, i * 0.06 + 0.46] : [i * 0.1, i * 0.1 + 0.8]);
const winDash = (i) => [0.45 + i * 0.06, 0.45 + i * 0.06 + 0.43];

export default {
  name: 'stroke-reinterpret',
  tier: 'T2',
  beats: 1,
  modes: ['blueprint', 'morph'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a flat hexagon',
  to: 'the same outline read as a cube (three seen edges, three hidden)',
  interpolates: ['length of each added line'],
  summary: 'Three lines from the centre and three dashed hidden edges turn a flat hexagon into a cube without moving anything.',
  theory: 'Line junctions carry depth (Huffman 1971; Clowes 1971; Biederman 1987): adding a Y re-reads the same outline as a solid.',
  defaults: {
    direction: 'add',                    // 'add' (flat → solid) or 'remove' (solid → flat)
    center: [960, 540],
    r: 290,                              // circumradius = side = cube edge
    lineWidth: 4,
    hidden: true,                        // draw the three hidden edges dashed
    dash: [16, 12],
    colors: { ground: '#0A2652', ink: '#9FD3FF', accent: '#FFB547' },
  },
  rest(side, P) {
    const full = (P.direction === 'remove') === (side === 'from');
    const v = full ? 1 : 0;
    return { solid: [v, v, v], dashed: P.hidden ? [v, v, v] : [0, 0, 0] };
  },
  at(p, P) {
    const q = P.direction === 'remove' ? 1 - p : p;
    return {
      solid: SOLID.map((_, i) => expOut(seg(q, ...win(i, P.hidden)))),
      dashed: DASHED.map((_, i) => (P.hidden ? expOut(seg(q, ...winDash(i))) : 0)),
    };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const [cx, cy] = P.center, R = P.r, C = P.colors;
    const vtx = (k) => { const a = Math.PI / 2 - (k * Math.PI) / 3; return [cx + R * Math.cos(a), cy - R * Math.sin(a)]; };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = C.ink; ctx.lineWidth = P.lineWidth;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const [x, y] = vtx(k); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, P.lineWidth, 0, Math.PI * 2); ctx.fill();
    const edge = (k, u, dashed) => {
      if (u <= 0) return;
      const [x, y] = vtx(k);
      ctx.save();
      ctx.strokeStyle = C.accent; ctx.lineWidth = dashed ? P.lineWidth * 0.75 : P.lineWidth;
      if (dashed) ctx.setLineDash(P.dash);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (x - cx) * u, cy + (y - cy) * u); ctx.stroke();
      ctx.restore();
    };
    SOLID.forEach((k, i) => edge(k, S.solid[i], false));
    DASHED.forEach((k, i) => edge(k, S.dashed[i], true));
  },
};

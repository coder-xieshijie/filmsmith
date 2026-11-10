// sheen-sweep — one diagonal highlight crosses a dark card once, clipped to its corners; its top edge catches the light.
// Adapted from video-shotcraft demos/effects/light-play-moves/SheenSweepRetry.tsx (card references/shots/effects/light-play-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the card is a rect of the caller's scene, flat (the
// 3D turn toward the light, the brushed metal and the etched lit copy are the scene's); the band is paper screened over
// the card instead of warm white; brand, demo copy and the left-hand title removed.
import { clamp, lerp, rgba, rrect } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

const ANGLE = (115 * Math.PI) / 180;
// The band's profile across its 2W-wide box (stops of the upstream gradient): offset → alpha of the light.
const STOPS = [[0.36, 0], [0.43, 0.06], [0.475, 0.14], [0.5, 0.5], [0.525, 0.14], [0.57, 0.06], [0.64, 0]];

export default {
  id: 'sheen-sweep', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 2,
  surface: ['canvas'],
  roles: ['paper'],
  from: 'the scene with a dark card at rest',
  to: 'the same scene (the light has passed)',
  interpolates: ['band centre −0.45 W → 1.45 W across the card (swift)', 'top-edge highlight following the band'],
  summary: 'One diagonal highlight crosses a dark card once, clipped to its corners, and its top edge catches the light.',
  theory: 'A specular highlight moving over a surface is how the eye reads a material turning to the light (gloss perception, Fleming 2014); passing once, on the one card that matters, it crowns it without decorating the rest.',
  sceneRest: true,
  defaults: () => ({ from: { scene: 'grid', target: 4 }, rect: gridRect(4), radius: 22, core: 0.5, edge: 0.85 }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.from, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { const [, , w] = P.rect; return { p, on: p > 0 && p < 1, c: lerp(-0.45 * w, 1.45 * w, EASE.swift(clamp(p))) }; },
  paint(ctx, S, P, D) {
    D.from(ctx);
    if (!S.on) return;
    const [x, y, w, h] = P.rect, col = P.colors.paper;
    ctx.save();
    rrect(ctx, x, y, w, h, P.radius); ctx.clip();
    // a CSS linear-gradient at 115° over a 2W × H box whose left edge is at c − W
    const bx = x + S.c - w, bw = 2 * w, cx = bx + bw / 2, cy = y + h / 2;
    const dx = Math.sin(ANGLE), dy = -Math.cos(ANGLE), half = (Math.abs(bw * dx) + Math.abs(h * dy)) / 2;
    const g = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
    for (const [o, a] of STOPS) g.addColorStop(o, rgba(col, a * (P.core / 0.5)));
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(bx, y, bw, h);
    // the top edge lit where the band crosses it
    const top = x + S.c + ((h / 2) * Math.cos((65 * Math.PI) / 180)) / Math.sin(ANGLE);
    const e = ctx.createLinearGradient(top - 170, 0, top + 170, 0);
    e.addColorStop(0, rgba(col, 0)); e.addColorStop(0.5, rgba(col, P.edge)); e.addColorStop(1, rgba(col, 0));
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = e; ctx.fillRect(x, y, w, 2);
    ctx.restore();
  },
  track(S) { return [[S.c, 0]]; },                       // the band centre, in the card's own px (compared as such)
  blur() { return false; },
};

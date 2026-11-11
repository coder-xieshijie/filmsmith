// route.js — the pencil's route over the desk at the end of an exhibit film: from the top of each region the ring
// visited, up to a lane above the row, along it and down into the next, drawn as one stroke (3 px, round joins) by
// a dash that grows with u. From the exhibit template (film.js lockup: ROUTE, laneY, the route's dash).
import { cubicInOut, clamp } from '../../../handoffs/util.js';

// points (world): rects [{ x, y, w, h }] in visiting order, laneY the lane's height
export const routePoints = (rects, laneY) => {
  const pts = [];
  rects.forEach((r, k) => { const x = r.x + r.w / 2; if (k) pts.push([x, laneY]); pts.push([x, r.y]); if (k < rects.length - 1) pts.push([x, laneY]); });
  return pts;
};
// sp: the points on screen; u (0..1) how much of the route is drawn
export const paintRoute = (ctx, sp, C, u) => {
  if (sp.length < 2 || u <= 0) return;
  let len = 0; for (let k = 1; k < sp.length; k++) len += Math.hypot(sp[k][0] - sp[k - 1][0], sp[k][1] - sp[k - 1][1]);
  ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.setLineDash([len * cubicInOut(clamp(u)), len + 10]);
  ctx.beginPath(); ctx.moveTo(...sp[0]); for (const p of sp.slice(1)) ctx.lineTo(...p); ctx.stroke(); ctx.restore();
};
// the rule under the name: from x0 to x0 + w at y (screen), drawn to u (6 px, round caps)
export const paintRule = (ctx, x0, y, w, C, u) => {
  if (u <= 0) return;
  ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w * cubicInOut(clamp(u)), y); ctx.stroke(); ctx.restore();
};

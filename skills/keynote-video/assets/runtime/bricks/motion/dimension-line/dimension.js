// dimension.js — a dimension on a print's own axis, as a draughtsman sets one: from point a to point b, offset 44 px
// to the side, a tick across each end, dashed drops to the points it measures, and a chip of label stock with the
// measured difference. Below a horizontal span, right of a vertical one, unless that leaves the print (then the other
// side). From the exhibit template (film.js measureGeom, measures, measureVeil).
import { clamp, lerp, rgba, measure, settle, cubicInOut, cubicOut } from '../../../handoffs/util.js';
import { drawLabelChip } from '../../prop/claim-chip/chip.js';

// the label: '{diff}' and '{ratio}' filled from the two values (computed, never typed)
export const labelOf = (a, b, label = '{diff}', digits = 1) => {
  const d = (b ?? 0) - (a ?? 0), r = a ? b / a : 0;
  return String(label).replace('{diff}', `${d >= 0 ? '' : '−'}${Math.abs(d).toFixed(digits)}`).replace('{ratio}', Math.abs(r).toFixed(digits));
};
// geometry in screen px: [ax, ay], [bx, by] the measured points, c the print's content rect, k the view's scale
export const geom = (g, [ax, ay], [bx, by], c, k, label, font) => {
  const dx = bx - ax, dy = by - ay, horiz = Math.abs(dx) >= Math.abs(dy), n = horiz ? [0, 1] : [1, 0];
  const size = 44 * Math.max(k, 0.45), f = { ...font, weight: 650, size }, tw = measure(g, label, f).width, px = 0.4 * size, h = 1.42 * size, w = tw + 2 * px;
  const kk = Math.max(k, 0.4);
  const build = (nn) => {
    const off = 44 * kk, A = [ax + nn[0] * off, ay + nn[1] * off], Bp = [bx + nn[0] * off, by + nn[1] * off];
    const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2;
    const chip = horiz ? { x: mx - w / 2, y: my + nn[1] * (h / 2 + 10 * kk) - h / 2, w, h } : { x: nn[0] > 0 ? mx + 12 * kk : mx - 12 * kk - w, y: my - h / 2, w, h };
    const inside = [A, Bp].every(([x, y]) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) && chip.y + chip.h <= c.y + c.h && chip.y >= c.y;
    return { A, Bp, chip, inside, n: nn };
  };
  let G = build(n);
  if (!G.inside) { const F = build([-n[0], -n[1]]); if (F.inside) G = F; }
  return { ...G, ax, ay, bx, by, tk: 14 * kk, k: kk, size, label, f, px };
};
// the span the dimension isolates (its points, ends and chip, padded 40 px)
export const holeOf = (G) => {
  const pad = 40 * G.k, xs = [G.ax, G.bx, G.A[0], G.Bp[0], G.chip.x, G.chip.x + G.chip.w], ys = [G.ay, G.by, G.A[1], G.Bp[1], G.chip.y, G.chip.y + G.chip.h];
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
};
// the rest of the print steps back (45 % of the ground) round the span, k its share
export const isolate = (ctx, G, c, C, k) => {
  if (k <= 0) return;
  const hole = holeOf(G);
  ctx.save();
  ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip();
  ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.rect(hole.x, hole.y, hole.w, hole.h);
  ctx.fillStyle = rgba(C.ground, 0.45 * k); ctx.fill('evenodd');
  ctx.restore();
};
// the dimension drawn to u (0..1), its chip landed by kc (0..1)
export const paintDimension = (ctx, G, C, u, kc) => {
  if (u <= 0 && kc <= 0) return;
  const [nx, ny] = G.n, { A, Bp, tk } = G, e = cubicInOut(clamp(u)), Ex = lerp(A[0], Bp[0], e), Ey = lerp(A[1], Bp[1], e);
  ctx.save();
  ctx.strokeStyle = C.accent; ctx.lineWidth = 4 * G.k; ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(A[0] - nx * tk, A[1] - ny * tk); ctx.lineTo(A[0] + nx * tk, A[1] + ny * tk);
  ctx.moveTo(A[0], A[1]); ctx.lineTo(Ex, Ey);
  if (e >= 1) { ctx.moveTo(Bp[0] - nx * tk, Bp[1] - ny * tk); ctx.lineTo(Bp[0] + nx * tk, Bp[1] + ny * tk); }
  ctx.stroke();
  ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(G.ax, G.ay); ctx.lineTo(A[0], A[1]); if (e >= 1) { ctx.moveTo(G.bx, G.by); ctx.lineTo(Bp[0], Bp[1]); } ctx.stroke();
  ctx.restore();
  drawLabelChip(ctx, G.chip, G.label, C, G.f, G.px, G.size, settle(clamp(kc), 10));
};
export { cubicOut };

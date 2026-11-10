// path-flow — paths draw on one after another, packets of light run along them toward a sink, and the paths can erase
// from their source end; the line-and-packet grammar of "many things feed one".
// Adapted from video-shotcraft demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx (card
// references/shots/ui-entrance/bezier-source-converge-merge.md) and demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx
// (card references/shots/ui-entrance/integration-hub-map.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); paths are any polyline, quadratic or cubic segments,
// sampled once by arc length in prepare; two `look`s: `line` (a thin line graded from dim to ink toward the sink,
// comet packets of the accent with a nine-dot tail) and `tube` (a glowing accent tube with a white core and a spark at
// the growing head, comet pulses at a fixed spacing and speed); the rainbow tube gradient and per-pipe tints of the
// upstream are one accent; the source nodes, hub page and mark are the scene's (hub-links); helpers are exported.
import { clamp, lerp, mix, rgba } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { cubicOut, cubicInOut } from '../../../motion.js';

// ── geometry ──────────────────────────────────────────────────────────────────────────────────────────────────────
// segs: [['M', x, y], ['L', x, y], ['Q', cx, cy, x, y], ['C', c1x, c1y, c2x, c2y, x, y], …] → { pts, cum, len, at(s) }
export const pathGeom = (segs, step = 3) => {
  const pts = [];
  let cx = 0, cy = 0;
  for (const s of segs) {
    if (s[0] === 'M') { cx = s[1]; cy = s[2]; pts.push([cx, cy]); continue; }
    if (s[0] === 'L') { const n = Math.max(1, Math.ceil(Math.hypot(s[1] - cx, s[2] - cy) / step)); for (let i = 1; i <= n; i++) pts.push([lerp(cx, s[1], i / n), lerp(cy, s[2], i / n)]); cx = s[1]; cy = s[2]; continue; }
    const n = 200;
    for (let i = 1; i <= n; i++) {
      const u = i / n, v = 1 - u;
      if (s[0] === 'Q') pts.push([v * v * cx + 2 * v * u * s[1] + u * u * s[3], v * v * cy + 2 * v * u * s[2] + u * u * s[4]]);
      else pts.push([v * v * v * cx + 3 * v * v * u * s[1] + 3 * v * u * u * s[3] + u * u * u * s[5], v * v * v * cy + 3 * v * v * u * s[2] + 3 * v * u * u * s[4] + u * u * u * s[6]]);
    }
    cx = s[0] === 'Q' ? s[3] : s[5]; cy = s[0] === 'Q' ? s[4] : s[6];
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[cum.length - 1];
  const at = (s) => {
    s = clamp(s, 0, len);
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < s) lo = mid + 1; else hi = mid; }
    const i = Math.max(1, lo), a = cum[i - 1], b = cum[i], k = b > a ? (s - a) / (b - a) : 0;
    return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
  };
  return { pts, cum, len, at };
};
// Trace the part of a path between arc lengths a and b as the current path (caller strokes).
export const subPath = (ctx, g, a, b) => {
  a = clamp(a, 0, g.len); b = clamp(b, 0, g.len);
  if (b <= a) return false;
  ctx.beginPath();
  const p0 = g.at(a); ctx.moveTo(p0[0], p0[1]);
  for (let i = 0; i < g.pts.length; i++) if (g.cum[i] > a && g.cum[i] < b) ctx.lineTo(g.pts[i][0], g.pts[i][1]);
  const p1 = g.at(b); ctx.lineTo(p1[0], p1[1]);
  return true;
};

// ── the two looks of a path and its packets ───────────────────────────────────────────────────────────────────────
// line: a thin line graded from dim at the source to ink at the sink, between arc lengths a and b.
export const drawLine = (ctx, g, a, b, c, { width = 3.6, alpha = 1, from = null, to = null } = {}) => {
  if (alpha <= 0 || !subPath(ctx, g, a, b)) return;
  const s = g.pts[0], e = g.pts[g.pts.length - 1];
  const grd = ctx.createLinearGradient(s[0], s[1], e[0], e[1]);
  grd.addColorStop(0, from || mix(c.ground, c.dim, 0.55)); grd.addColorStop(0.45, mix(c.dim, c.ink, 0.25)); grd.addColorStop(1, to || mix(c.ink, c.ground, 0.1));
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = grd; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
};
// A comet packet at arc length s: a head of radius r and a tail of n dots behind it, gap px apart.
export const drawPacket = (ctx, g, s, c, { r = 12, n = 9, gap = 0, alpha = 1, color = null } = {}) => {
  if (alpha <= 0.01) return;
  const col = color || c.accent, step = gap || g.len * 0.0055;
  ctx.save();
  for (let j = n; j >= 1; j--) {
    const sj = s - j * step; if (sj < 0) continue;
    const [x, y] = g.at(sj), rr = 2.6 * 4 * (1 - j / (n + 1));
    ctx.globalAlpha = alpha * 0.38 * (1 - j / (n + 1)); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
  }
  const [x, y] = g.at(s);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = rgba(col, 0.45); ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  const hg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  hg.addColorStop(0, mix(col, '#ffffff', 0.25)); hg.addColorStop(1, col);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
// tube: a glowing accent tube between arc lengths a and b with a white core; a spark at b while it grows.
export const drawTube = (ctx, g, a, b, c, { width = 8, alpha = 1, spark = 0 } = {}) => {
  if (alpha <= 0 || !subPath(ctx, g, a, b)) return;
  const layers = [[width * 3.2, rgba(c.accent, 0.16), 10], [width * 1.6, rgba(c.accent, 0.4), 4], [width, mix(c.accent, '#ffffff', 0.15), 0], [width * 0.32, mix(c.accent, '#ffffff', 0.85), 0]];
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, col, blur] of layers) { subPath(ctx, g, a, b); ctx.filter = blur ? `blur(${blur}px)` : 'none'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  ctx.filter = 'none';
  if (spark > 0) {
    const [x, y] = g.at(b), R = width * 4;
    const sg = ctx.createRadialGradient(x, y, 0, x, y, R);
    sg.addColorStop(0, rgba('#ffffff', spark)); sg.addColorStop(0.35, rgba(mix(c.accent, '#ffffff', 0.5), 0.7 * spark)); sg.addColorStop(1, rgba(c.accent, 0));
    ctx.fillStyle = sg; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  ctx.restore();
};
// A pulse in a tube at arc length s: a bright head with a fading tail of length tail px.
export const drawPulse = (ctx, g, s, c, { width = 8, tail = 46, alpha = 1 } = {}) => {
  if (alpha <= 0.01 || s <= 0) return;
  const a = Math.max(0, s - tail), b = Math.min(g.len, s);
  if (b <= a) return;
  const p0 = g.at(a), p1 = g.at(b);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = 'round';
  const grd = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
  grd.addColorStop(0, rgba('#ffffff', 0)); grd.addColorStop(1, rgba('#ffffff', 0.95));
  subPath(ctx, g, a, b); ctx.strokeStyle = grd; ctx.lineWidth = width * 0.9; ctx.stroke();
  ctx.fillStyle = rgba('#ffffff', 0.95); ctx.beginPath(); ctx.arc(p1[0], p1[1], width * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ── the sample's paths: four sources on the left curving into one sink on the right (film px) ─────────────────────
const D4 = (x, y) => [80 + 4 * x, 60 + 4 * y];
export const MERGE_PATHS = [36, 92, 148, 204].map((y0) => {
  const [ax, ay] = D4(-22, y0), [bx, by] = D4(74, y0), [c1x, c1y] = D4(186, y0), [c2x, c2y] = D4(214, 120), [ex, ey] = D4(332, 120);
  return [['M', ax, ay], ['L', bx, by], ['C', c1x, c1y, c2x, c2y, ex, ey]];
});
// The hub's five pipes: from each source tile to the edge of a 820 × 520 panel centred on the frame.
export const HUB_PATHS = [
  [['M', 452, 322], ['L', 452, 440], ['Q', 452, 480, 492, 480], ['L', 552, 480]],
  [['M', 316, 612], ['L', 552, 612]],
  [['M', 992, 240], ['L', 992, 332]],
  [['M', 1512, 332], ['L', 1512, 440], ['Q', 1512, 480, 1472, 480], ['L', 1372, 480]],
  [['M', 1640, 618], ['L', 1372, 618]],
];

export default {
  id: 'path-flow', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 11.2,
  beatsFor: (P) => (P.look === 'tube' ? 88 : 168) / 15,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the scene without the paths (`under`)',
  to: 'the paths drawn and still (or erased, with `erase`); every packet has arrived',
  interpolates: ['each path\'s drawn length (staggered)', 'packets\' arc length along their paths, two whole cycles', 'the erased share from the source end'],
  summary: 'Paths draw on one after another and packets of light run along them into one sink; the paths can erase from the source end.',
  theory: 'Motion along a line is read as flow in that direction (Michotte\'s launching and entraining: what moves along a path is carried by it); a packet stream makes an abstract connection concrete without a label.',
  defaults: () => ({ look: 'line', paths: null, under: null, erase: false, stagger: null }),
  prepare(P) {
    const tube = P.look === 'tube';
    return { tube, geoms: (P.paths || (tube ? HUB_PATHS : MERGE_PATHS)).map((s) => pathGeom(s)), under: P.under };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    if (D.tube) {
      const f = p * 88;   // upstream frames 52–140 of the hub: grow 10–19, flow from 19, pulses fade 76–88
      const grow = EASE.out(clamp((f - 10) / 9)), on = clamp((f - 19) / 8) * (1 - clamp((f - 76) / 12));
      return { f, tube: true, grow, spark: grow > 0 && grow < 1 ? 1 : 0, flow: Math.max(0, f - 19) * 4.6, on };
    }
    const t = p, n = D.geoms.length, st = P.stagger ?? 0.045;
    const draw = D.geoms.map((_, i) => EASE.out(clamp((t - 0.04 - i * st) / 0.17)));
    const erase = P.erase ? cubicOut(clamp((t - 0.78) / 0.12)) : 0;
    const cyc = ((clamp((t - 0.1) / 0.64) * 2) % 1 + 1) % 1;
    const on = clamp((t - 0.1) / 0.06) * (1 - clamp((t - 0.7) / 0.06));
    return { t, draw, erase, cyc: t >= 0.74 ? 0 : cyc, on };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    if (D.under) D.under(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    if (S.tube) {
      D.geoms.forEach((g, i) => {
        drawTube(ctx, g, 0, g.len * S.grow, c, { spark: S.spark });
        for (let s = S.flow % 74; s < g.len + 46; s += 74) drawPulse(ctx, g, s, c, { alpha: S.on * (0.84 + 0.16 * Math.sin(S.f * 0.16 + i)) });
      });
      return;
    }
    D.geoms.forEach((g, i) => {
      const a = S.erase * g.len, b = S.draw[i] * g.len;
      drawLine(ctx, g, a, b, c, { alpha: S.draw[i] * (1 - clamp((S.erase - 0.85) / 0.15)) });
      const f0 = 96 * 4 / g.len, ph = (S.cyc + i * 0.13) % 1;
      drawPacket(ctx, g, g.len * (f0 + (1 - f0) * ph), c, { alpha: S.on * (1 - Math.abs(ph - 0.5) * 0.6), gap: g.len * 0.0055 * (1 - f0) });
    });
  },
  // the growing heads of the first and last paths, and the first packet
  track(S, P, D) {
    const g0 = D.geoms[0], gl = D.geoms[D.geoms.length - 1];
    if (S.tube) return [g0.at(g0.len * S.grow), gl.at(gl.len * S.grow)];
    const f0 = (96 * 4) / g0.len;
    return [g0.at(g0.len * S.draw[0]), gl.at(gl.len * S.draw[D.geoms.length - 1]), g0.at(g0.len * (f0 + (1 - f0) * S.cyc))];
  },
  blur: () => false,
};

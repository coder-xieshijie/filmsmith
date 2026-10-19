// fx.js — ink effects: streak bursts, gooey dots. The ink bloom is bloom.js (a baked fluid, inkflow.js).
// Every function is a pure function of its arguments (time included); nothing reads the previous frame.
import { clamp, lerp, hexToRgb } from './lib/motion.js';

// ---------- streak bursts on night (one burst per entry in `bursts`) ----------
// Razor-straight horizontal strips of the night's soft grey fire left to right, kept out of the central type band
// and out of every `avoid` band [y0, y1] (labels). They are light, not accent: the accent stays the dot's.
export const drawStreaks = (ctx, t, bursts, pal, { W = 1920, H = 1080, band = [0.34, 0.68], seed = 1, lightNight = false, avoid = [] } = {}) => {
  // the y ranges a strip may use: above and below the type band, minus the avoid bands (a strip's halo is
  // 3.2 × its height, so a strip is placed by its centre and the bands are widened by the largest half-halo)
  const halo = 34 * 1.6;
  let free = [[H * 0.05, H * band[0] - 30], [H * band[1] + 30, H * 0.95]];
  for (const [a, b] of avoid) {
    free = free.flatMap(([x, y]) => [[x, Math.min(y, a - halo)], [Math.max(x, b + halo), y]]).filter(([x, y]) => y - x > 4);
  }
  const span = free.reduce((n, [x, y]) => n + y - x, 0);
  const pick = (u) => { let v = u * span; for (const [x, y] of free) { if (v <= y - x) return x + v; v -= y - x; } return free.at(-1)[1]; };
  const r = (i, k) => {
    let x = Math.imul(i * 7919 + k * 104729 + seed * 31, 0x9e3779b1) >>> 0;
    x = Math.imul(x ^ (x >>> 15), 0x85ebca6b) >>> 0;
    return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
  };
  ctx.save();
  ctx.globalCompositeOperation = lightNight ? 'multiply' : 'lighter';
  bursts.forEach((t0, bi) => {
    const lt = t - t0;
    if (lt < -0.02 || lt > 0.42) return;
    const n = 7 + Math.floor(r(bi, 0) * 5);
    for (let s = 0; s < n; s++) {
      if (!span) return;
      const y = pick(r(bi, s * 5 + 2));
      const hh = [2, 3, 4, 6, 10, 16, 24, 34][Math.floor(r(bi, s * 5 + 3) * 8)];
      const delay = r(bi, s * 5 + 4) * 0.07;
      const u = clamp((lt - delay) / 0.24);
      if (u <= 0) continue;
      const head = lerp(-200, W + 1100, 1 - Math.pow(1 - u, 2.2));
      const len = lerp(600, 1500, r(bi, s * 5 + 5));
      const fade = 1 - clamp((lt - delay - 0.16) / 0.2);
      if (fade <= 0) continue;
      const col = hexToRgb(pal.nightSoft);
      const c = `${col[0]},${col[1]},${col[2]}`;
      const strip = (yy, h, peak) => {
        const g = ctx.createLinearGradient(head - len, 0, head, 0);
        g.addColorStop(0, `rgba(${c},0)`);
        g.addColorStop(0.7, `rgba(${c},${0.5 * peak})`);
        g.addColorStop(1, `rgba(${c},${peak})`);
        ctx.fillStyle = g;
        ctx.fillRect(head - len, yy - h / 2, len, h);
      };
      strip(y, hh * 3.2, 0.16 * fade); // halo
      strip(y, hh, 0.9 * fade); // body
      if (hh >= 10) { // hot core: the light runs whiter in the middle of thick strips
        const g = ctx.createLinearGradient(head - len * 0.6, 0, head, 0);
        const wc = hexToRgb(pal.nightInk).join(',');
        g.addColorStop(0, `rgba(${wc},0)`); g.addColorStop(1, `rgba(${wc},${0.45 * fade})`);
        ctx.fillStyle = g; ctx.fillRect(head - len * 0.6, y - hh * 0.12, len * 0.6, Math.max(1.5, hh * 0.24));
      }
    }
  });
  ctx.restore();
  // faint scanlines drifting upward between bursts
  ctx.save();
  ctx.globalAlpha = lightNight ? 0.05 : 0.035;
  ctx.fillStyle = lightNight ? pal.nightInk : pal.nightInk;
  const off = (t * 22) % 6;
  for (let y = H - off; y > 0; y -= 6) {
    if (y > H * band[0] && y < H * band[1]) continue;
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
};

// ---------- gooey dots: circles joined by a metaball neck when close ----------
export const drawGoo = (ctx, dots, color) => {
  ctx.save();
  ctx.fillStyle = color;
  for (const d of dots) { if (d.r <= 0.3) continue; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < dots.length; i++)
    for (let j = i + 1; j < dots.length; j++) neck(ctx, dots[i], dots[j]);
  ctx.restore();
};
// metaball bridge between two circles (after the paper.js metaball example), v = neck tension
const neck = (ctx, a, b, v = 0.5, maxDist = 3.2) => {
  const r1 = a.r, r2 = b.r;
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  if (r1 <= 0.5 || r2 <= 0.5 || d > (r1 + r2) * maxDist / 2 || d <= Math.abs(r1 - r2)) return;
  let u1 = 0, u2 = 0;
  if (d < r1 + r2) {
    u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
    u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
  }
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const maxSpread = Math.acos((r1 - r2) / d);
  const spread = maxSpread * (1 - clamp((d - (r1 + r2) * 0.6) / ((r1 + r2) * (maxDist / 2 - 0.6))) * 0.85);
  const a1 = ang + u1 + (spread - u1) * v, a2 = ang - u1 - (spread - u1) * v;
  const a3 = ang + Math.PI - u2 - (Math.PI - u2 - spread) * v, a4 = ang - Math.PI + u2 + (Math.PI - u2 - spread) * v;
  const P = (c, r, t) => [c.x + r * Math.cos(t), c.y + r * Math.sin(t)];
  const p1 = P(a, r1, a1), p2 = P(a, r1, a2), p3 = P(b, r2, a3), p4 = P(b, r2, a4);
  const total = r1 + r2, d2 = Math.min(v * 2.4, Math.hypot(p1[0] - p3[0], p1[1] - p3[1]) / total) * Math.min(1, (d * 2) / total);
  const h1 = r1 * d2, h2 = r2 * d2;
  const H = (p, t, l) => [p[0] + l * Math.cos(t), p[1] + l * Math.sin(t)];
  const hp = Math.PI / 2;
  const c1 = H(p1, a1 - hp, h1), c2 = H(p2, a2 + hp, h1), c3 = H(p3, a3 + hp, h2), c4 = H(p4, a4 - hp, h2);
  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.bezierCurveTo(c1[0], c1[1], c3[0], c3[1], p3[0], p3[1]);
  ctx.lineTo(p4[0], p4[1]);
  ctx.bezierCurveTo(c4[0], c4[1], c2[0], c2[1], p2[0], p2[1]);
  ctx.closePath();
  ctx.fill();
};

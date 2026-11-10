// texture.js — the night-sky ground as pure painters: the radial field, the drifting dust and the soft bokeh, pushed 5 %
// over the film. From the stream template's film.js renderBG (the sky part; the stars are the engine's). A frame depends
// on its arguments only: the motes come from the seeded mulberry32 (rng.js) in the template's order.
import { mulberry32 } from '../../../rng.js';

const W = 1920, H = 1080;
const hx = (h) => [1, 3, 5].map((i) => parseInt(String(h).slice(i, i + 2), 16));
export const rgbOf = (h) => hx(h).join(',');
const wrapv = (v, m) => ((v % m) + m) % m;
const io2 = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
export const glowAt = (ctx, x, y, r, rgb, a) => {
  if (a <= 0.002 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
};

// The motes of one film (seed): 240 dust motes and 22 bokeh discs, drawn in this order by the template.
const MOTES = new Map();
export const motes = (seed = 1) => {
  if (!MOTES.has(seed)) {
    const RND = mulberry32(seed * 31 + 5);
    const dust = Array.from({ length: 240 }, () => ({ x: RND() * W, y: RND() * H, r: 0.5 + RND() * 1.3, a: 0.16 + RND() * 0.42, vx: -(2 + RND() * 5), ph: RND() * 6.28, z: 0.2 + RND() * 0.4 }));
    const bokeh = Array.from({ length: 22 }, () => ({ x: RND() * W, y: RND() * H, r: 8 + RND() * 22, a: 0.05 + RND() * 0.09, vx: -(4 + RND() * 6), vy: (RND() - 0.5) * 3, z: 0.5 + RND() * 0.4 }));
    MOTES.set(seed, { dust, bokeh });
  }
  return MOTES.get(seed);
};

// The sky at time t (s) of a film `duration` s long (the push runs 0 → 5 % over it): P has ground, field, fieldEdge,
// dust (hex) and line (the accent, hex). Leaves the context in source-over.
export const sky = (ctx, P, t = 0, { seed = 1, duration = 0, push = 0.05 } = {}) => {
  const g = ctx.createRadialGradient(760, 520, 80, 960, 540, 1250);
  g.addColorStop(0, P.field); g.addColorStop(0.55, P.ground); g.addColorStop(1, P.fieldEdge);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k = 1 + push * (duration > 0 ? io2(Math.min(1, Math.max(0, t / duration))) : 0), M = motes(seed), dust = rgbOf(P.dust), line = rgbOf(P.line);
  ctx.globalCompositeOperation = 'lighter';
  M.dust.forEach((s) => { const x = wrapv(s.x + s.vx * t, W + 40) - 20; const px = 960 + (x - 960) * (1 + (k - 1) * s.z), py = 540 + (s.y - 540) * (1 + (k - 1) * s.z); ctx.fillStyle = `rgba(${dust},${(s.a * (0.75 + 0.25 * Math.sin(s.ph + t * 1.3))).toFixed(3)})`; ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill(); });
  M.bokeh.forEach((b) => { const x = wrapv(b.x + b.vx * t, W + 80) - 40, y = wrapv(b.y + b.vy * t, H + 80) - 40; glowAt(ctx, x, y, b.r, line, b.a); });
  ctx.globalCompositeOperation = 'source-over';
};

// The specimen cell of the look sheet: the sky, one glowing stroke with a star and a paper block hung on it.
export const specimen = (ctx, w, h, C) => {
  ctx.save(); ctx.scale(w / W, h / H);
  const P = { ground: C.ground, field: C.field || C.panel, fieldEdge: C.fieldEdge || C.ground, dust: C.dust || C.ink, line: C.accent };
  sky(ctx, P, 2, { seed: 7 });
  const acc = rgbOf(C.accent), glw = rgbOf(C.glow || C.accent), core = rgbOf(C.core || C.ink);
  const pts = []; for (let i = 0; i <= 60; i++) { const f = i / 60; pts.push([200 + f * 1100, 700 - 260 * Math.sin(Math.PI * f * 0.9)]); }
  ctx.globalCompositeOperation = 'lighter';
  [[16, 0.07, acc], [7, 0.22, acc], [2.6, 0.95, glw]].forEach(([lw, al, col]) => { ctx.strokeStyle = `rgba(${col},${al})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); });
  glowAt(ctx, 1500, 300, 70, glw, 0.55); glowAt(ctx, 1500, 300, 16, core, 1);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = C.paper || C.panel; ctx.beginPath(); ctx.roundRect(1340, 560, 420, 200, 30); ctx.fill();
  ctx.restore();
};

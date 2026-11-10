// texture.js — the light textures of the afterglow look, as pure painters (a frame depends on its arguments only).
// Bricks and scenes import them (`../../look/afterglow/texture.js`) and pass the look's roles; nothing here keeps state.
//
//   orbs(ctx, f, colors, opts)     three orbs of light drifting on two sines each, screened; they converge to a stop
//   bloom(ctx, s, colors)          an aurora of soft ellipses rising from the foot of the frame; s = { rise, flip, t, squash }
//   rings(ctx, f, colors, opts)    four concentric rings breathing out of phase, the outer two past the frame
//   vignette(ctx, k, colors)       a radial darkening of the ground
//
// Adapted from video-shotcraft demos/effects/glow-flyline-moves/GlowOrbAmbient.tsx (orbs, tide time),
// demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx (bloom) and
// demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx (rings) (cards references/shots/effects/
// glow-flyline-moves.md, aurora-bloom-bg-flip.md, radial-ripple-phone-chips.md), https://github.com/Vincentwei1021/video-shotcraft
// @ 1266a3e, Apache-2.0. Changes: Canvas2D painters; colours by role (the orbs are the accent and two mixes of it with
// paper and line, the bloom the accent with paper tints, the rings ground-to-panel steps) instead of teal, blue, coral,
// purple, orange and sand; the bloom's 60 px blur is replaced by soft elliptical gradients; brand and content removed.
import { clamp, lerp, mix, rgba } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';

const TAU = Math.PI * 2;

// Tide time: frame time until `t0`, then an out-sine that slows to a stop over `ts` frames (start slope 1, so no jolt).
export const tide = (f, t0 = 115, ts = 30) => (f <= t0 ? f : t0 + ((2 * ts) / Math.PI) * Math.sin((Math.PI / 2) * Math.min(1, (f - t0) / ts)));

export const ORBS = [
  { size: 1200, peak: 0.55, mixWith: null, bx: 560, by: 360, p1: 118, p2: 150, ax: 300, ay: 200, seed: 1 },
  { size: 1000, peak: 0.5, mixWith: 'line', bx: 1420, by: 660, p1: 132, p2: 96, ax: 280, ay: 190, seed: 2 },
  { size: 760, peak: 0.42, mixWith: 'paper', bx: 1240, by: 220, p1: 104, p2: 142, ax: 300, ay: 160, seed: 3 },
];
export const orbAt = (o, t) => {
  const ph = (k) => hash(o.seed * 7 + k, 11) * TAU;
  return [o.bx + o.ax * (0.62 * Math.sin((TAU * t) / o.p1 + ph(1)) + 0.38 * Math.sin((TAU * t) / o.p2 + ph(2))),
          o.by + o.ay * (0.6 * Math.sin((TAU * t) / o.p2 + ph(3)) + 0.4 * Math.sin((TAU * t) / o.p1 + ph(4)))];
};
// f: frame; opts.surge[i] (0–1) brightens orb i by 1 + 1.6 × surge and grows it 12 % (an orb answering an event).
export const orbs = (ctx, f, c, { level = 1, surge = [], tideAt = [115, 30], orbsList = ORBS } = {}) => {
  const t = tide(f, ...tideAt);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  orbsList.forEach((o, i) => {
    const [x, y] = orbAt(o, t), s = surge[i] || 0, r = (o.size / 2) * (1 + 0.12 * s), a = Math.min(1, o.peak * (1 + 1.6 * s)) * level;
    const col = o.mixWith ? mix(c.accent, c[o.mixWith], 0.45) : c.accent;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [k, m] of [[0, 1], [0.22, 0.62], [0.48, 0.3], [0.72, 0.1], [1, 0]]) g.addColorStop(k, rgba(col, a * m));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  });
  ctx.restore();
};

// A soft ellipse of light (the bloom's layers): centre, radii, colour, alpha at the centre.
const softEllipse = (ctx, cx, cy, rx, ry, col, a) => {
  if (a <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(0.45, rgba(col, a * 0.75)); g.addColorStop(0.75, rgba(col, a * 0.3)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore();
};
// The bloom group sits in a box 10 % larger than the frame; s.rise (0–1) lifts it from 32 % below to 6 % above its place
// and scales it 1 → 1.25; s.flip (0–1) presses it to 40 % and removes the pale fringe; s.t (0–1, the shot's time)
// drifts the core sideways; s.squash shrinks it 6 % as it is pressed. Returns the box (for tracking).
export const bloomBox = (s) => {
  const W = 2304, H = 1296, x0 = -192, y0 = -108, ty = lerp(32, -6, s.rise) / 100 * H, k = lerp(1, 1.25, s.rise) * (1 - 0.06 * (s.squash || 0));
  return { x0, y0, W, H, ty, k, at: (px, py) => [960 + (px - 960) * k, 540 + ty + (py - 540) * k] };
};
export const bloom = (ctx, s, c) => {
  const B = bloomBox(s), a = lerp(1, 0.4, s.flip), d1 = Math.sin(s.t * Math.PI * 2.2), d2 = Math.sin(s.t * Math.PI * 1.6 + 1.1);
  // [left %, bottom %, width %, height %] of the box, colour, alpha, sideways drift
  const layers = [
    [8, -45, 90, 85, c.accent, 0.85, 0],
    [22, -36, 60, 58, mix(c.accent, c.paper, 0.3), 0.6, d2 * 6],
    [32, -18, 44, 46, mix(c.accent, c.paper, 0.6), 0.9, d1 * 8],
    [-12, -40, 64, 60, c.paper, 0.8 * (1 - s.flip), 0],
  ];
  ctx.save(); ctx.globalAlpha = a;
  for (const [l, b, w, h, col, al, dx] of layers) {
    const bw = (w / 100) * B.W, bh = (h / 100) * B.H, bx = B.x0 + (l / 100 + dx / 100 * (w / 100)) * B.W, by = B.y0 + B.H - (b / 100) * B.H - bh;
    const [cx, cy] = B.at(bx + bw / 2, by + bh / 2);
    softEllipse(ctx, cx, cy, (bw / 2) * B.k * 1.25, (bh / 2) * B.k * 1.25, col, al);
  }
  ctx.restore();
  return B;
};

// Rings round a centre, largest first, from the ground to the panel; each breathes 1 ± amp, phase 1.7 rad apart.
export const RINGS = [2240, 1760, 1280, 840];
export const rings = (ctx, f, c, { at = [960, 540], period = 112, amp = 0.06, sizes = RINGS } = {}) => {
  sizes.forEach((d, i) => {
    const k = 1 + amp * Math.sin((f / period) * TAU + i * 1.7), r = (d / 2) * k;
    const col = mix(mix(c.ground, c.line, 0.6), c.panel, i / (sizes.length - 1));
    ctx.beginPath(); ctx.arc(at[0], at[1], r, 0, TAU); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(c.paper, 0.5); ctx.stroke();
  });
  const g = ctx.createRadialGradient(at[0], at[1], 0, at[0], at[1], 520);
  g.addColorStop(0, rgba(c.paper, 0.55)); g.addColorStop(1, rgba(c.paper, 0));
  ctx.fillStyle = g; ctx.fillRect(at[0] - 520, at[1] - 520, 1040, 1040);
};

export const vignette = (ctx, k, c, inner = 0.45) => {
  if (k <= 0) return;
  const g = ctx.createRadialGradient(960, 540, 1100 * inner, 960, 540, 1150);
  g.addColorStop(0, rgba(mix(c.ground, '#000000', 0.7), 0)); g.addColorStop(1, rgba(mix(c.ground, '#000000', 0.7), clamp(k)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
};

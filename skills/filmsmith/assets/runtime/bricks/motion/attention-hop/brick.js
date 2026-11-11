// attention-hop — one icon hops for attention: four jumps, each higher, a crouch before, a squash on every landing, a
// ripple on the ground, while the camera is drawn to it and the rest of the screen goes soft.
// Adapted from video-shotcraft demos/effects/icon-performance-moves/AttentionBounce.tsx
// (card references/shots/effects/icon-performance-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the icon is a rect of the caller's scene (cropped,
// its place filled with the ground while it is in the air), the neighbours are the rest of the scene, softened as a
// whole; colours by role (ripple and splash in dim, contact shadows ink mixed with black); brand, the dock, window
// light, badge, run dot and the feature panel removed (the scene's next step); motion blur from the tracked corners.
import { clamp, lerp, mix, rgba, rrect } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

const F = 120;
const JUMPS = [{ start: 12, dur: 14, peak: 0.35 }, { start: 28, dur: 18, peak: 0.6 }, { start: 48, dur: 22, peak: 0.85 }, { start: 72, dur: 26, peak: 1.2 }];
const LAST = 98;

export default {
  id: 'attention-hop', kind: 'motion',
  tier: 'T2', family: 'vertical', beats: 8,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim'],
  from: 'the scene with the icon (a rect of it) at rest',
  to: 'the same scene drawn in on the icon, the rest of it soft',
  interpolates: ['icon height: four throws 0.35 → 0.6 → 0.85 → 1.2 × its height, air time ∝ √height', 'squash on each contact 0.1 → 0.2, stretch with speed, a damped settle', 'ripple and splash per landing', 'camera 1 → 1.015 → 1.08 toward the icon', 'the rest blurred 0 → 7 px, faded 40 %'],
  summary: 'One icon hops for attention, each jump higher, squashing on every landing, while the camera is drawn to it and the rest goes soft.',
  theory: 'The Dock bounce of desktop systems, played as a performer: rising jumps read as a voice getting louder; air time in proportion to the square root of the height keeps one gravity (a projectile), squash and stretch give it weight (Thomas & Johnston); the rack focus and the push act out the viewer being drawn in.',
  defaults: () => ({ from: { scene: 'grid', target: 4 }, rect: gridRect(4), radius: 22, push: [0.015, 0.065], focus: null, defocus: 7, seed: 1 }),
  prepare(P) { return { scene: painterOf(P.from, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  body(f, h) {
    let y = 0, v = 0, squash = 0;
    JUMPS.forEach((j, i) => {
      const t = (f - j.start) / j.dur;
      if (t > 0 && t < 1) { y = j.peak * h * 4 * t * (1 - t); v = 1 - 2 * t; }
      const land = j.start + j.dur, q = 0.1 + 0.1 * (i / 3);
      if (i < 3 && f >= land && f < land + 2) squash = q * (1 - (f - land) / 2) + q * 0.4;
    });
    if (f >= 6 && f < 12) squash = 0.08 * EASE.out((f - 6) / 6);
    if (f >= LAST) { const k = f - LAST; squash = 0.2 * Math.exp(-k * 0.38) * Math.cos(k * 0.72); }
    return { y, v, squash };
  },
  at(p, P) {
    const f = p * F, [, , , h] = P.rect, { y, v, squash } = this.body(f, h);
    const stretch = y > 0 ? Math.abs(v) * 0.1 : 0;
    const zoom = 1 + P.push[0] * ramp(f, 0, 72, 'smooth') + P.push[1] * ramp(f, 72, 18, 'smooth');
    return { p, f, y, sx: p >= 1 ? 1 : 1 + squash - stretch * 0.5, sy: p >= 1 ? 1 : 1 - squash + stretch, zoom, defocus: ramp(f, 30, 66, 'swift'), lift: y / (1.2 * h) };
  },
  focusOf(P) { const [x, y, w, h] = P.rect; return P.focus || [x + w / 2 + 120, y + h - 260]; },
  paint(ctx, S, P, D) {
    const c = P.colors, [x, y, w, h] = P.rect, [fx, fy] = this.focusOf(P), ground = y + h;
    ctx.save();
    ctx.translate(fx, fy); ctx.scale(S.zoom, S.zoom); ctx.translate(-fx, -fy);
    // the rest of the scene: soft and faded as attention leaves it; the icon's place is the ground
    ctx.save();
    if (S.defocus > 0.01) { ctx.filter = `blur(${(S.defocus * P.defocus).toFixed(2)}px)`; ctx.globalAlpha = 1 - 0.4 * S.defocus; }
    if (S.defocus > 0.01) { ctx.save(); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.fillStyle = c.ground; ctx.fillRect(-200, -200, 2320, 1480); ctx.restore(); }
    D.scene(ctx);
    ctx.restore();
    ctx.save(); ctx.fillStyle = c.ground; rrect(ctx, x - 2, y - 2, w + 4, h + 4, P.radius); ctx.fill(); ctx.restore();
    // ripples and splash of each landing
    JUMPS.forEach((j, k) => {
      const t = (S.f - j.start - j.dur) / 18;
      if (t <= 0 || t >= 1) return;
      const e = EASE.snappy(t), strength = 0.5 + k * 0.17;
      ctx.save(); ctx.filter = 'blur(2.5px)'; ctx.strokeStyle = rgba(c.dim, (1 - t) * strength * 0.3); ctx.lineWidth = lerp(10, 3, e);
      ctx.beginPath(); ctx.ellipse(x + w / 2, ground + 6, lerp(w * 0.48, w * (0.85 + 0.15 * k), e), lerp(14, 34 + 6 * k, e), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      for (let i = 0; i < 4; i++) {
        const side = i % 2 ? 1 : -1, dx = side * (w * 0.5 + (40 + 60 * hash(k * 7 + i, P.seed)) * e * (0.7 + k * 0.25));
        const dy = -(30 + 40 * hash(k * 11 + i, P.seed)) * 4 * t * (1 - t) * (0.6 + k * 0.2);
        ctx.beginPath(); ctx.arc(x + w / 2 + dx, ground - 4 + dy, 4 + 3 * hash(i + k + 50, P.seed), 0, Math.PI * 2); ctx.fillStyle = rgba(c.dim, (1 - t) * 0.7); ctx.fill();
      }
    });
    // contact shadows: small and dark near the ground, wide and faint, fading with height
    const sh = rgba(mix(c.ink, '#000000', 0.5), 0.34);
    ctx.save(); ctx.filter = 'blur(7px)'; ctx.globalAlpha = Math.max(0, 1 - S.lift * 1.8); ctx.fillStyle = sh;
    ctx.beginPath(); ctx.ellipse(x + w / 2, ground + 1, w * 0.42 * S.sx * (1 - S.lift * 0.4), 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.filter = 'blur(16px)'; ctx.globalAlpha = 0.5 * (1 - S.lift * 0.6); ctx.fillStyle = sh;
    ctx.beginPath(); ctx.ellipse(x + w / 2, ground + 7, w * 0.52 * (1 - S.lift * 0.25), 23, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // the icon: the scene inside its rect, squashed and stretched about its foot
    ctx.save();
    ctx.translate(x + w / 2, ground - S.y); ctx.scale(S.sx, S.sy); ctx.translate(-(x + w / 2), -ground);
    rrect(ctx, x - 1, y - 1, w + 2, h + 2, P.radius); ctx.clip();
    D.scene(ctx);
    ctx.restore();
    ctx.restore();
  },
  blur(p) { return p > 0.08 && p < LAST / F; },
  track(S, P) {
    const [x, y, w, h] = P.rect, [fx, fy] = this.focusOf(P), ground = y + h;
    const at = (px, py) => { const X = x + w / 2 + (px - x - w / 2) * S.sx, Y = ground - S.y + (py - ground) * S.sy; return [fx + (X - fx) * S.zoom, fy + (Y - fy) * S.zoom]; };
    return [at(x, y), at(x + w, y), at(x, y + h), at(x + w, y + h), at(x + w / 2, y + h / 2)];
  },
};

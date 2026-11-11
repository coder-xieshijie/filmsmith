// slam-drop — a card slams into its place: it hangs near the camera (or over its slot, or above the frame), drops with
// an accelerating ease-in, and the landing frame fires a ring, shards, sparks, a flash and a shake.
// Adapted from video-shotcraft demos/effects/slam-entrance-moves/ScoreSlam.tsx and ImpactBurstKit.tsx
// (card references/shots/effects/slam-entrance-moves.md) and demos/effects/impact-feedback/HitCounter.tsx
// (card references/shots/effects/impact-feedback.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the three shots are three `drop`s of one brick
// (camera: score-slam, slot: impact-burst-kit, fall: one hit of hit-counter); the card is the next scene cropped to its
// rect, the neighbours are the scene's own cards cropped and pushed; colours by role (ring and sparks in paper and the
// accent, shards in the accent and panel); brand, demo copy, stadium lights and score digits removed (the digits'
// second landing, the badge and the title are the scene's); hit-stop is left to the time bricks; motion blur comes
// from the tracked corners.
import { clamp, lerp, mix, rgba, seg } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

const IN_QUAD = bez(0.55, 0.085, 0.68, 0.53), IN_CUBIC = bez(0.55, 0.055, 0.675, 0.19);
// A damped spring from 0 toward 1 after t frames (the closed form Remotion's spring() uses, mass 1, 30 fps).
export const spring = (t, damping, stiffness) => {
  if (t <= 0) return 0;
  const s = t / 30, w0 = Math.sqrt(stiffness), z = damping / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
};

// The three drops, in frames: where the card hangs, when it lands, how long the burst and the after-shocks last.
export const DROPS = {
  camera: { frames: 36, hover: [0, 9], land: 15, ring: { from: 60, to: 750, dur: 16, w: [9, 1.5] }, shake: { amp: 18, dur: 5 }, flash: [0.22, 0.12, 0.04], shards: 14, sparks: 16 },
  slot: { frames: 66, hover: [0, 16], land: 22, ring: { from: 100, to: 1100, dur: 16, w: [10, 1.5] }, shake: { amp: 8, dur: 4 }, flash: null, shards: 18, sparks: 0, disc: true, push: { at: 3, px: 34, deg: 3.5, dur: 40 } },
  fall: { frames: 30, hover: [0, 0], land: 10, ring: { from: 40, to: 520, dur: 14, w: [8, 1.5] }, shake: { amp: 10, dur: 4 }, flash: null, shards: 0, sparks: 12 },
};

// The burst at a landing point: ring (with an optional pressure disc), shards, sparks; k = frames since the landing.
// Exported for scenes that land several things (each landing calls it with its own k and point).
export const burst = (ctx, k, [cx, cy], D, c, { seed = 1, dark = true } = {}) => {
  if (k < 0) return;
  const R = D.ring;
  if (k < R.dur) {
    const t = EASE.snappy(k / R.dur), lin = k / R.dur, r = lerp(R.from, R.to, t);
    const a = D.disc ? lerp(0.95, 0, lin) : lin < 0.6 ? lerp(1, 0.65, lin / 0.6) : lerp(0.65, 0, (lin - 0.6) / 0.4);
    if (D.disc) {
      const g = ctx.createRadialGradient(cx, cy, r * 0.36, cx, cy, r * 0.9);
      g.addColorStop(0, rgba(c.paper, 0)); g.addColorStop(0.75, rgba(c.paper, 0.55 * (1 - lin))); g.addColorStop(1, rgba(c.paper, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.globalAlpha = a;
    ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 20 + t * 30;
    ctx.strokeStyle = dark ? c.paper : c.accent; ctx.lineWidth = lerp(R.w[0], R.w[1], t);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // sparks: thin bright streaks along the radius, 10 frames
  if (D.sparks && k < 10) {
    const t = bez(0.1, 0.9, 0.2, 1)(k / 10), lin = k / 10;
    ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = rgba(c.accent, 0.8); ctx.shadowBlur = 10;
    for (let i = 0; i < D.sparks; i++) {
      const ang = (i / D.sparks) * Math.PI * 2 + (hash(i + 61, seed) - 0.5) * 0.4, r = 160 + (360 + hash(i + 71, seed) * 320) * t;
      const len = (40 + hash(i + 81, seed) * 50) * (1 - lin) + 6, x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * 0.8;
      const g = ctx.createLinearGradient(x - Math.cos(ang) * len, y - Math.sin(ang) * len, x, y);
      g.addColorStop(0, rgba(c.paper, 0)); g.addColorStop(1, rgba(c.paper, 1 - lin));
      ctx.strokeStyle = g; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
  }
  // shards: small polygons thrown out, falling, spinning and turning edge-on, 20–22 frames
  const sd = D.disc ? 22 : 20;
  if (D.shards && k < sd) {
    const t = EASE.out(k / sd), lin = k / sd;
    for (let i = 0; i < D.shards; i++) {
      const ang = D.disc ? -Math.PI / 2 + (hash(i + 1, seed) - 0.5) * Math.PI * 1.75 : (i / D.shards) * Math.PI * 2 + (hash(i + 3, seed) - 0.5) * 0.5;
      const dist = (D.disc ? 260 : 280) + hash(i + 11, seed) * 300, size = (D.disc ? 12 : 22) + hash(i + 23, seed) * (D.disc ? 16 : 26);
      const x = cx + Math.cos(ang) * ((D.disc ? 140 : 300) + dist * t), y = cy + Math.sin(ang) * ((D.disc ? 140 : 120) + dist * 0.75 * t) + (D.disc ? 120 : 260) * lin * lin;
      const s = size * (1 - 0.55 * lin), flip = Math.max(0.15, Math.abs(Math.cos(lin * Math.PI * 1.6 + i)));
      ctx.save();
      ctx.globalAlpha = lin < 0.7 ? 1 : 1 - (lin - 0.7) / 0.3;
      ctx.translate(x, y); ctx.rotate(((hash(i + 31, seed) - 0.5) * 620 * t * Math.PI) / 180); ctx.scale(1, flip);
      ctx.fillStyle = i % 3 === 0 ? c.accent : mix(c.panel, c.ink, 0.12);
      ctx.beginPath();
      for (let q = 0; q < 4; q++) { const rr = (0.3 + hash(i * 4 + q, seed) * 0.2) * s, a = q * 1.7 + i; q ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
};

export default {
  id: 'slam-drop', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 2.4,
  beatsFor: (P) => (DROPS[P.drop] || DROPS.camera).frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'accent', 'paper'],
  from: 'the scene without the card (an empty slot, or nothing there)',
  to: 'the scene with the card in its place; its neighbours (slot) are the scene’s own cards',
  interpolates: ['card scale 2.6 → 0.965 → 1 (camera), 1.6 → 1 with a squash (slot), y above the frame → slot (fall)', 'rotation 5° → 0, depth blur 10 px → 0, opacity', 'ring radius and width, shards, sparks, flash, shake', 'neighbours pushed out and back (slot)'],
  summary: 'A card hangs near the camera, drops with an accelerating ease-in and lands with a ring, shards, a flash and a shake.',
  theory: 'Weight is read from acceleration into the contact (an ease-in is a slam, an ease-out is a set-down; Thomas & Johnston, timing); the burst on the contact frame is game feedback for a hit (Vlambeer, "screenshake") and the neighbours knocked three frames later show the force travelling (Michotte, launching effect).',
  sceneRest: true,
  defaults: () => ({
    drop: 'camera',
    from: { scene: 'grid', skip: 4, target: 4 }, to: { scene: 'grid', target: 4 },
    rect: gridRect(4), neighbours: [gridRect(3), gridRect(5)], fall: 980, dark: false,
  }),
  prepare(P) {
    const d = DROPS[P.drop] || DROPS.camera;
    return { from: painterOf(P.from, P), to: painterOf(P.to, P), d };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const d = D.d, f = p * d.frames, [x, y, w, h] = P.rect;
    let sx = 1, sy = 1, rot = 0, dy = 0, alpha = 1, dof = 0;
    if (P.drop === 'slot') {
      const wind = ramp(f, 0, d.hover[1], 'smooth'), drop = ramp(f, d.hover[1], d.land - d.hover[1], IN_CUBIC);
      const s = lerp(1.55 + 0.05 * wind, 1, drop);
      const sq = f < d.land ? 0 : f < d.land + 3 ? ramp(f, d.land, 3, 'out') : 1 - spring(f - d.land - 3, 12, 320);
      sx = s * (1 + 0.06 * sq); sy = s * (1 - 0.085 * sq);
      dy = lerp(-110 - 20 * wind, 0, drop); alpha = ramp(f, 0, 5, 'out'); dof = 7 * clamp((s - 1) / 0.6);
    } else if (P.drop === 'fall') {
      const drop = ramp(f, 0, d.land, IN_QUAD);
      dy = lerp(-P.fall, 0, drop);
      const sq = f < d.land ? 0 : Math.exp(-(f - d.land) / 2.2) * Math.cos((f - d.land) * 0.9);
      const v = f < d.land ? drop : 0;
      sx = 1 + 0.08 * sq - 0.05 * v; sy = 1 - 0.1 * sq + 0.08 * v;
    } else {
      const hover = ramp(f, 0, d.hover[1], 'smooth'), drop = ramp(f, d.hover[1], d.land - d.hover[1], IN_QUAD);
      const s = f < d.land ? lerp(lerp(2.75, 2.6, hover), 0.965, drop) : lerp(0.965, 1, spring(f - d.land, 14, 260));
      sx = sy = s; rot = lerp(5, 0, drop); dy = f < d.land ? lerp(-40 - 30 * hover, 0, drop) : 0;
      alpha = ramp(f, 0, 6, 'out') * lerp(0.6, 1, drop); dof = 10 * clamp((s - 1) / 1.75);
    }
    if (p >= 1) { sx = sy = 1; rot = dy = dof = 0; alpha = 1; }
    const k = f - d.land;
    let shake = [0, 0];
    if (k >= 0 && k < d.shake.dur && p < 1) {
      const amp = P.drop === 'camera' ? d.shake.amp * Math.exp(-k * 0.85) : d.shake.amp * (1 - k / d.shake.dur), fk = Math.floor(k);
      shake = [(hash(fk * 7 + 1, P.seed) * 2 - 1) * amp * (P.drop === 'camera' ? 0.4 : 1), (fk === 0 ? 1 : hash(fk * 13 + 2, P.seed) * 2 - 1) * amp];
    }
    const flash = d.flash && k >= 0 && k < 3 ? d.flash[Math.floor(k)] : 0;
    let push = 0;
    if (d.push && p < 1) { const t = k - d.push.at; push = t >= 0 && t < d.push.dur ? Math.cos(t * 0.5) * Math.exp(-t / 8) : 0; }
    return { p, f, k, sx, sy, rot, dy, alpha, dof, shake, flash, push, done: p >= 1, start: p <= 0, rect: [x, y, w, h] };
  },
  paint(ctx, S, P, D) {
    if (S.start) return D.from(ctx);
    if (S.done) return D.to(ctx);
    const c = P.colors, d = D.d, [x, y, w, h] = P.rect;
    if (S.shake[0] || S.shake[1]) { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    ctx.save();
    ctx.translate(S.shake[0], S.shake[1]);
    D.from(ctx);
    // neighbours knocked by the wave: the scene's own cards, cropped, pushed outward and rocked about their foot
    if (d.push && S.push) for (const [i, r] of P.neighbours.entries()) {
      const dir = r[0] + r[2] / 2 < x + w / 2 ? -1 : 1, [nx, ny, nw, nh] = r;
      ctx.save(); ctx.fillStyle = c.ground; ctx.fillRect(nx - 3, ny - 3, nw + 6, nh + 6); ctx.restore();
      ctx.save();
      ctx.translate(nx + nw / 2 + dir * d.push.px * S.push, ny + nh); ctx.rotate((dir * d.push.deg * S.push * Math.PI) / 180); ctx.translate(-(nx + nw / 2), -(ny + nh));
      ctx.beginPath(); ctx.rect(nx - 3, ny - 3, nw + 6, nh + 6); ctx.clip(); D.from(ctx);
      ctx.restore();
    }
    const after = S.k >= 0;
    if (after) burst(ctx, S.k, [x + w / 2, y + h / 2 - (P.drop === 'slot' ? 40 : 0)], d, c, { seed: P.seed, dark: P.dark });
    // the card: the next scene inside its rect, scaled about its centre (its foot for the slot squash)
    ctx.save();
    ctx.globalAlpha = S.alpha;
    const ox = x + w / 2, oy = P.drop === 'slot' ? y + h : y + h / 2;
    if (S.dof > 0.4) ctx.filter = `blur(${S.dof.toFixed(2)}px)`;
    ctx.translate(ox, oy + S.dy); ctx.rotate((S.rot * Math.PI) / 180); ctx.scale(S.sx, S.sy); ctx.translate(-ox, -oy);
    if (S.sx > 1.02 || S.dy < -2) {               // a lifted card casts a soft shadow under it
      ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.3); ctx.shadowBlur = 40; ctx.shadowOffsetY = 30;
      ctx.fillStyle = c.panel; ctx.fillRect(x + 6, y + 6, w - 12, h - 12); ctx.restore();
    }
    ctx.beginPath(); ctx.rect(x - 2, y - 2, w + 4, h + 4); ctx.clip();
    D.to(ctx);
    ctx.restore();
    ctx.restore();
    if (S.flash) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rgba(c.paper, S.flash); ctx.fillRect(0, 0, 1920, 1080); ctx.restore(); }
  },
  blur(p, P, D) { const f = p * D.d.frames; return f < D.d.land; },
  track(S, P) {
    const [x, y, w, h] = P.rect, ox = x + w / 2, oy = P.drop === 'slot' ? y + h : y + h / 2;
    const r = (S.rot * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
    const at = (px, py) => { const X = (px - ox) * S.sx, Y = (py - oy) * S.sy; return [ox + X * cs - Y * sn + S.shake[0], oy + S.dy + X * sn + Y * cs + S.shake[1]]; };
    const pts = [at(x, y), at(x + w, y), at(x, y + h), at(x + w, y + h), at(x + w / 2, y + h / 2)];
    return [...pts, [Math.min(...pts.slice(0, 4).map((q) => q[0])), Math.min(...pts.slice(0, 4).map((q) => q[1]))]];   // 5: bounding-box corner
  },
};

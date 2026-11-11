// light-leak — a soft film light leak sweeps across from one corner, burns the frame at its peak, and the cut hides there.
// Adapted from video-shotcraft demos/transition/transition-hidden-cut/LightLeakBurn.tsx (card references/shots/transition/transition-hidden-cut.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the leak is the accent mixed with
// white and black instead of the amber, ember and ochre literals); brand, demo copy, the viewfinder and the two photos
// removed (the scenes are any painters); the outgoing scene's slow push-in, the vignette and grain are left to the film;
// the incoming scene's settle from 1.04 lands exactly at the end.
import { canvasOf, mix, rgba } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { painterOf } from '../../sample.js';
// an offscreen buffer rasterised on the CPU (the same pixels on every pass; a GPU buffer read back into another canvas
// can switch raster path mid-render and change its anti-aliasing)
const buffer = (w, h) => { const b = canvasOf(w, h); b.getContext('2d', { willReadFrequently: true }); return b; };

const W = 1920, H = 1080;
const PEAK = 28 / 71;            // the upstream's peak frame 52 in its leak window 24–95
const clamp01 = (u) => Math.min(1, Math.max(0, u));
const DIRS = { 'top-right': [1, 1], 'top-left': [-1, 1], 'bottom-right': [1, -1], 'bottom-left': [-1, -1] };

export default {
  id: 'light-leak', kind: 'motion',
  tier: 'T1', family: 'edit-cut', beats: 4.75,
  surface: ['canvas'],
  roles: ['accent'],
  from: 'the current scene, full frame',
  to: 'the next scene, full frame',
  interpolates: ['leak intensity (ease-in to the peak, ease-out after)', 'leak centre along the diagonal', 'burn of the scene (brightness up, contrast and saturation down)', 'the next scene settling from 1.04'],
  summary: 'A soft light leak sweeps in from a corner and burns most of the frame at its peak; the cut hides in the peak and the light drains away along the diagonal over the next scene.',
  theory: 'A cut at the brightest frame is masked by the luminance transient (the eye cannot compare the two pictures through it); a slow ease-in build and a long ease-out tail read as warmth and time passing rather than a flash.',
  sceneRest: true,
  defaults: () => ({ from: { scene: 'title' }, to: { scene: 'detail' }, corner: 'top-right', burn: 0.85, settle: 0.04 }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P), buf: buffer(W, H) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const u = clamp01(p);
    const intensity = u <= PEAK ? Math.pow(u / PEAK, 2) : 1 - EASE.out(clamp01((u - PEAK) / (1 - PEAK)));
    // the upstream's sweep (1 − (1 − u)^1.2) until the leak has all but faded, then a stop with matched speed, so
    // the brick lands still (the upstream's light is still flying, invisibly, at its last frame)
    const sw = (x) => 1 - Math.pow(1 - x, 1.2), U1 = 0.85, v1 = 1.2 * Math.pow(1 - U1, 0.2);
    const sweep = u <= U1 ? sw(u) : sw(U1) + v1 * (u - U1) - (v1 * (u - U1) * (u - U1)) / (2 * (1 - U1));
    const golden = u > PEAK;
    const zoom = golden ? 1 + 1 * (1 - EASE.out(clamp01((u - PEAK) / (1 - PEAK)))) : 1; // × settle, below
    const cut = u > PEAK && u <= PEAK + 2 / 71 ? 1 : 0;
    return { p: u, intensity: u >= 1 ? 0 : intensity, sweep, side: golden ? 'to' : 'from', zoomK: u >= 1 ? 0 : zoom - 1, cut };
  },
  paint(ctx, S, P, D) {
    const scene = S.side === 'to' ? (c) => D.to(c, 1) : (c) => D.from(c);
    if (S.intensity <= 0.003 && S.zoomK === 0) return scene(ctx);
    const c = P.colors, I = S.intensity, [sx, sy] = DIRS[P.corner] || DIRS['top-right'];
    // the scene, burnt through and (incoming) settling from 1 + settle
    const b = D.buf.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.filter = 'none';
    b.clearRect(0, 0, W, H); scene(b);
    ctx.save();
    const z = 1 + P.settle * S.zoomK;
    ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
    if (I > 0.01) ctx.filter = `brightness(${(1 + I * P.burn).toFixed(3)}) contrast(${(1 - I * 0.5).toFixed(3)}) saturate(${(1 - I * 0.25).toFixed(3)})`;
    ctx.drawImage(D.buf, 0, 0);
    ctx.restore();
    if (I <= 0.003) return;
    // the leak: mirrored per corner (the upstream's comes in from the top right)
    ctx.save();
    ctx.translate(sx > 0 ? 0 : W, sy > 0 ? 0 : H); ctx.scale(sx, sy);
    ctx.globalCompositeOperation = 'screen';
    const hot = mix(c.accent, '#FFFFFF', 0.55), mid = c.accent, deep = mix(c.accent, '#000000', 0.3);
    // gate light: a band leaking in from the right and top edges
    const ang = (250 * Math.PI) / 180, L = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang));
    const gx = (Math.sin(ang) * L) / 2, gy = (-Math.cos(ang) * L) / 2;
    const gate = ctx.createLinearGradient(W / 2 - gx, H / 2 - gy, W / 2 + gx, H / 2 + gy);
    gate.addColorStop(0, rgba(hot, 0.9)); gate.addColorStop(0.14, rgba(mid, 0.55)); gate.addColorStop(0.3, rgba(deep, 0.2)); gate.addColorStop(0.46, rgba(deep, 0)); gate.addColorStop(1, rgba(deep, 0));
    ctx.globalAlpha = I; ctx.fillStyle = gate; ctx.fillRect(0, 0, W, H);
    const cx = 2250 + (-500 - 2250) * S.sweep, cy = -380 + (1400 + 380) * S.sweep;
    const blob = (d, col, a, o) => {
      const x = cx + o * 0.8, y = cy - o * 0.6;
      ctx.save(); ctx.translate(x, y); ctx.rotate((-34 * Math.PI) / 180); ctx.scale(1, 1 / 1.35);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, d / 2);
      g.addColorStop(0, rgba(col, 1)); g.addColorStop(0.35, rgba(col, 0.65)); g.addColorStop(1, rgba(col, 0));
      ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, d / 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    blob(3000, deep, 0.6 * I, 360);
    blob(2300, mid, 0.8 * I, 160);
    blob(1700, hot, 0.95 * I, 0);
    // the white-hot core only near the peak
    const core = I * I * I;
    if (core > 0.002) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((-34 * Math.PI) / 180); ctx.scale(1, 1400 / 2200);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1100), w = mix(c.accent, '#FFFFFF', 0.92), w2 = mix(c.accent, '#FFFFFF', 0.6);
      g.addColorStop(0, rgba(w, 1)); g.addColorStop(0.4, rgba(w, 0.9)); g.addColorStop(1, rgba(w2, 0));
      ctx.globalAlpha = core; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1100, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // a warm wash over everything, plus a two-frame lift at the cut
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(1, 0.4 * I * I + 0.25 * S.cut); ctx.fillStyle = mix(c.accent, '#FFFFFF', 0.35); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
  blur: () => false,
  // 0: the leak's core centre (film px, after the corner mirror)
  track(S, P) {
    const [sx, sy] = DIRS[P.corner] || DIRS['top-right'];
    const cx = 2250 + (-500 - 2250) * S.sweep, cy = -380 + (1400 + 380) * S.sweep;
    return [[sx > 0 ? cx : W - cx, sy > 0 ? cy : H - cy]];
  },
};

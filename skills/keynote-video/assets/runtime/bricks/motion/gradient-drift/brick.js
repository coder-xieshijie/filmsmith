// gradient-drift — an ambient ground that drifts through a linear, a radial and a conic gradient, parameter by parameter.
// Adapted from video-shotcraft demos/transition/gradient-transition/GradientTransition.tsx (card references/shots/transition/gradient-transition.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the stops are mixes of the
// ground, the accent and the ink instead of the aurora purples); brand, demo copy and the parameter readout removed;
// the foreground is any painter laid over the ground (`over`); grain is left to the look.
import { bez, canvasOf, mix, rgba } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf } from '../../sample.js';
// an offscreen buffer rasterised on the CPU (the same pixels on every pass; a GPU buffer read back into another canvas
// can switch raster path mid-render and change its anti-aliasing)
const buffer = (w, h) => { const b = canvasOf(w, h); b.getContext('2d', { willReadFrequently: true }); return b; };

const SW = 480, SH = 270;                 // the gradients are drawn small and scaled 4× (soft, cheap)
const SLOW = bez(0.45, 0, 0.2, 1);
const F = 200;                           // the upstream's timeline in frames; phases below are fractions of it
const lin = (f) => ramp(f, 0, 68, 'swift');
const rad = (f) => ramp(f, 56, 76, 'swift');
const con = (f) => ramp(f, 118, 82, SLOW);
const lerp = (a, b, u) => a + (b - a) * u;
const lum = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };

export default {
  id: 'gradient-drift', kind: 'motion',
  tier: 'T0', family: 'shape', beats: 12,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a linear gradient at 18° (its own rest)',
  to: 'a conic gradient turned 250° (its own rest)',
  interpolates: ['linear angle 18° → 198° and its stops', 'radial centre (24 %, 72 %) → (68 %, 38 %), radius 48 % → 80 %', 'conic start 0° → 250°', 'narrow cross-fades between the three kinds'],
  summary: 'The ground drifts from a linear to a radial to a conic gradient, each kind moving its own parameters, with narrow cross-fades between kinds.',
  theory: 'Slow, continuous change of the ground keeps a still layout alive without competing with it (peripheral motion is noticed but not attended, Peterson & Dugas 1972); the three kinds give three readable phases a title can follow.',
  sceneRest: false,
  defaults: () => ({ over: null, darken: 0.42, vignette: 0.55 }),
  prepare(P) { return { over: painterOf(P.over, P), small: buffer(SW, SH), conic: buffer(SW + 28, SH + 28) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const f = Math.min(1, Math.max(0, p)) * F;
    const p1 = lin(f), p2 = rad(f), p3 = con(f);
    const x12 = ramp(f, 56, 12, 'smooth'), x23 = ramp(f, 118, 14, 'smooth');
    return { p, p1, p2, p3, ang: lerp(18, 198, p1), rc: [lerp(24, 68, p2), lerp(72, 38, p2)], rr: lerp(48, 80, p2), from: lerp(0, 250, p3), w: [1 - x12, x12 - x23, x23] };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, dark = lum(c.ground) < 0.5;
    const lo = dark ? mix(c.ground, '#000000', 0.45) : c.ground;
    const shade = dark ? mix(c.ground, '#000000', 0.7) : mix(c.ground, c.ink, 0.12);
    const hiA = mix(c.accent, c.ink, 0.35), hiB = mix(c.accent, c.ink, 0.5), midA = mix(c.accent, lo, 0.35), midB = mix(c.accent, lo, 0.25);
    const g = D.small.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.fillStyle = lo; g.fillRect(0, 0, SW, SH);
    // linear: the angle sweeps; a soft light drifts along the top
    if (S.w[0] > 0.001) {
      g.globalAlpha = S.w[0];
      const a = ((S.ang - 90) * Math.PI) / 180, L = Math.abs(SW * Math.cos(a)) + Math.abs(SH * Math.sin(a));
      const dx = (Math.cos(a) * L) / 2, dy = (Math.sin(a) * L) / 2;
      const gr = g.createLinearGradient(SW / 2 - dx, SH / 2 - dy, SW / 2 + dx, SH / 2 + dy);
      const s1 = mix(hiA, hiB, S.p1), s2 = mix(midA, midB, S.p1);
      gr.addColorStop(0, s1); gr.addColorStop(0.34, s2); gr.addColorStop(0.78, lo); gr.addColorStop(1, lo);
      g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
      const lx = (lerp(18, 70, S.p1) / 100) * SW, ly = (lerp(10, 22, S.p1) / 100) * SH;
      g.save(); g.translate(lx, ly); g.scale(0.6, 0.7);
      const sp = g.createRadialGradient(0, 0, 0, 0, 0, SW * 0.7);
      sp.addColorStop(0, rgba(s1, 0.3)); sp.addColorStop(0.7, rgba(s1, 0)); sp.addColorStop(1, rgba(s1, 0));
      g.fillStyle = sp; g.fillRect(-SW * 2, -SH * 2, SW * 4, SH * 4); g.restore();
    }
    // radial: the centre walks the diagonal while the radius opens
    if (S.w[1] > 0.001) {
      g.globalAlpha = S.w[1];
      const x = (S.rc[0] / 100) * SW, y = (S.rc[1] / 100) * SH, r = (S.rr / 100) * SW;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, mix(hiA, c.accent, S.p2)); gr.addColorStop(0.36, mix(midA, midB, S.p2)); gr.addColorStop(1, lo);
      g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
    }
    // conic: a three-tone ring turns behind the right of the frame, pre-blurred so its centre has no point
    if (S.w[2] > 0.001) {
      const k = D.conic.getContext('2d');
      k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = 1; k.filter = 'none';
      const cx = 0.64 * SW + 14, cy = 0.54 * SH + 14;
      const cg = k.createConicGradient(((S.from - 90) * Math.PI) / 180, cx, cy);
      cg.addColorStop(0, c.accent); cg.addColorStop(1 / 3, hiA); cg.addColorStop(2 / 3, mix(c.accent, lo, 0.5)); cg.addColorStop(1, c.accent);
      k.fillStyle = cg; k.fillRect(0, 0, SW + 28, SH + 28);
      g.save(); g.globalAlpha = S.w[2]; g.filter = 'blur(9px)'; g.drawImage(D.conic, -14, -14); g.restore();
      g.save(); g.globalAlpha = S.w[2];
      g.translate(0.64 * SW, 0.54 * SH); g.scale(0.62, 0.78);
      const v = g.createRadialGradient(0, 0, 0, 0, 0, SW);
      v.addColorStop(0.18, rgba(shade, 0)); v.addColorStop(0.64, rgba(shade, 0.55)); v.addColorStop(1, rgba(shade, 0.92));
      g.fillStyle = v; g.fillRect(-SW * 2, -SH * 2, SW * 4, SH * 4); g.restore();
      g.globalAlpha = S.w[2];
      const lg = g.createLinearGradient(0, 0, SW, 0); lg.addColorStop(0, rgba(shade, 0.55)); lg.addColorStop(0.46, rgba(shade, 0)); lg.addColorStop(1, rgba(shade, 0));
      g.fillStyle = lg; g.fillRect(0, 0, SW, SH);
    }
    // the text side darkened under the first two kinds; a frame vignette over all
    g.globalAlpha = 1 - S.w[2];
    const tg = g.createLinearGradient(0, 0, SW, 0); tg.addColorStop(0, rgba(shade, P.darken)); tg.addColorStop(0.55, rgba(shade, 0)); tg.addColorStop(1, rgba(shade, 0));
    g.fillStyle = tg; g.fillRect(0, 0, SW, SH);
    g.globalAlpha = 1;
    g.save(); g.translate(SW / 2, SH / 2); g.scale(1, SH / SW);
    const vg = g.createRadialGradient(0, 0, 0, 0, 0, SW * 0.8);
    vg.addColorStop(0, rgba(shade, 0)); vg.addColorStop(0.55, rgba(shade, 0)); vg.addColorStop(1, rgba(shade, P.vignette));
    g.fillStyle = vg; g.fillRect(-SW, -SW, SW * 2, SW * 2); g.restore();
    ctx.save();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(D.small, 0, 0, 1920, 1080);
    ctx.restore();
    if (D.over) D.over(ctx, S.p);
  },
  // 0: the linear angle as a point on a 400 px circle; 1: the radial centre; 2: the conic start as a point
  track(S) {
    const a = ((S.ang - 90) * Math.PI) / 180, b = ((S.from - 90) * Math.PI) / 180;
    return [[960 + 400 * Math.cos(a), 540 + 400 * Math.sin(a)], [(S.rc[0] / 100) * 1920, (S.rc[1] / 100) * 1080], [0.64 * 1920 + 400 * Math.cos(b), 0.54 * 1080 + 400 * Math.sin(b)]];
  },
  blur: () => false,
};

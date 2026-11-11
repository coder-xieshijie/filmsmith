// perspective-glide — a page stands steeply on edge in 3D and glides along its own plane past a camera that never moves.
// Adapted from video-shotcraft demos/camera/steep-tilt-glide/SteepTiltGlide.tsx (card references/shots/camera/steep-tilt-glide.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the task
// board removed: the page is a strip of the scenes' own painters side by side; the camera constants (perspective 1100,
// origin 30 % 58 %, rotateY −60°, rotateZ −2°) and the glide distance are the upstream's; by default the glide lands
// (the upstream never settles, it is cut out moving: `land: false` keeps that curve); the hovering text that settles on
// the page is the separate brick float-land; grain is left to the look.
import { mix, rgba } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { el, n } from '../../dom.js';
import { painterOf } from '../../sample.js';

const CAM = { d: 1100, ox: 0.3 * 1920, oy: 0.58 * 1080, left: 0.4 * 1920, top: 0.15 * 1080, rotY: -60, rotZ: -2 };
const UP = { scale: 0.62, ph: 2400, from: 60, to: -4100 };   // upstream panel: 2400 px tall at 0.62, glides 60 → −4100
const GLIDE = bez(0.3, 0.12, 0.72, 0.9);                       // the upstream's: soft start, never stops
const LAND = bez(0.3, 0.12, 0.5, 1);                           // the same start, landing at rest
const clamp01 = (u) => Math.min(1, Math.max(0, u));
const rad = (d) => (d * Math.PI) / 180;
const PAGE_W = 1920, PAGE_H = 1080;

// screen position of a point (x, y) of the strip (page px) when the strip is slid by lx (page px)
const project = (P, x, y, lx) => {
  const k = P.scale, u = k * (x + lx), v = k * y;
  const cz = Math.cos(rad(CAM.rotZ)), sz = Math.sin(rad(CAM.rotZ)), cy = Math.cos(rad(CAM.rotY)), sy = Math.sin(rad(CAM.rotY));
  const x1 = u * cz - v * sz, y1 = u * sz + v * cz;
  const X = x1 * cy + CAM.left, Y = y1 + CAM.top, Z = -x1 * sy;
  const f = CAM.d / (CAM.d - Z);
  return [CAM.ox + (X - CAM.ox) * f, CAM.oy + (Y - CAM.oy) * f];
};

export default {
  id: 'perspective-glide', kind: 'motion',
  tier: 'T2', family: 'horizontal', beats: 8,
  surface: ['dom'],
  roles: ['ground', 'panel', 'accent'],
  from: 'a strip of pages standing steeply on edge, dark, its start in view',
  to: 'the same strip lit, slid along its own plane about one page further',
  interpolates: ['the strip\'s slide along its own x (the only thing that moves)', 'the darkening lifting off the strip', 'trailing copies by speed'],
  summary: 'A page stands steeply on edge (60°) and glides along its own plane past a camera that never moves, lighting up as it comes.',
  theory: 'With the camera locked, motion parallax across the steep plane carries all the depth (near edge fast, far edge slow), so a flat UI reads as an object in space (Gibson 1979, optic flow); moving the object rather than the camera keeps the frame calm.',
  sceneRest: false,
  defaults: () => ({ pages: [{ scene: 'page' }, { scene: 'grid' }, { scene: 'detail' }], land: true, scale: (UP.scale * UP.ph) / PAGE_H, trail: true, res: 1 }),
  prepare(P) { return { pages: P.pages.map((s) => painterOf(s, P)), travel: ((UP.to - UP.from) * UP.scale) / P.scale, start: (UP.from * UP.scale) / P.scale }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const ease = P.land ? LAND : GLIDE, f = clamp01(p) * 120;
    const lxAt = (g) => D.start + D.travel * (g <= 0 ? 0 : g >= 120 ? 1 : ease(g / 120));
    const shade = f < 18 ? 0.7 - (0.3 * f) / 18 : f < 44 ? 0.4 - (0.4 * (f - 18)) / 26 : 0;
    const speed = Math.abs(lxAt(f - 1) - lxAt(f + 1)) / 2 * (P.scale / UP.scale);   // in the upstream's panel px per frame
    const g = [Math.min(0.3, speed * 0.021), Math.min(0.2, speed * 0.014), Math.min(0.11, speed * 0.008)];
    return { p, lx: lxAt(f), trail: [lxAt(f - 1.6), lxAt(f - 3.2), lxAt(f - 4.8)], g: p > 0 && p < 1 ? g : [0, 0, 0], shade, glow: f <= 14 ? 0.15 : f >= 70 ? 1 : 0.15 + (0.85 * (f - 14)) / 56 };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = mix(c.ground, '#000000', 0.35);
    const glow = el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 40% 50% at 20% 66%, ${rgba(c.accent, 0.3)}, ${rgba(c.accent, 0)} 70%)` }, root);
    const layer = (res) => {
      const L = el('div', { position: 'absolute', inset: '0', perspective: `${CAM.d}px`, perspectiveOrigin: `${n(CAM.ox)}px ${n(CAM.oy)}px` }, root);
      const wall = el('div', { position: 'absolute', left: `${CAM.left}px`, top: `${CAM.top}px`, transform: `rotateY(${CAM.rotY}deg) rotateZ(${CAM.rotZ}deg)`, transformOrigin: 'left top', transformStyle: 'preserve-3d' }, L);
      const strip = el('div', { position: 'absolute', left: '0', top: '0', width: `${PAGE_W * D.pages.length}px`, height: `${PAGE_H}px`, transformOrigin: 'left top', borderRadius: '28px', overflow: 'hidden', background: c.panel,
        boxShadow: `0 0 220px ${rgba(c.accent, 0.25)}` }, wall);
      D.pages.forEach((paint, i) => {
        const cv = el('canvas', { position: 'absolute', left: `${i * PAGE_W}px`, top: '0', width: `${PAGE_W}px`, height: `${PAGE_H}px` }, strip);
        cv.width = Math.round(PAGE_W * res); cv.height = Math.round(PAGE_H * res);
        const g = cv.getContext('2d'); g.scale(res, res); paint(g);
      });
      const dark = mix(c.ground, '#000000', 0.8);
      const shade = el('div', { position: 'absolute', inset: '0', background: dark }, strip);
      const edge = el('div', { position: 'absolute', inset: '0', background: `linear-gradient(90deg, ${rgba(dark, 0.9)}, ${rgba(dark, 0)} 42%)` }, strip);
      return { L, strip, shade, edge };
    };
    const trails = P.trail ? [layer(0.5), layer(0.5), layer(0.5)].reverse() : [];
    const main = layer(P.res);
    const dark = mix(c.ground, '#000000', 0.7);
    el('div', { position: 'absolute', inset: '0', pointerEvents: 'none', background: `linear-gradient(100deg, ${rgba(dark, 0.62)} 0%, ${rgba(dark, 0.28)} 18%, ${rgba(dark, 0)} 40%)` }, root);
    el('div', { position: 'absolute', inset: '0', pointerEvents: 'none', background: `radial-gradient(ellipse 105% 95% at 55% 42%, ${rgba(dark, 0)} 60%, ${rgba(dark, 0.25)} 85%, ${rgba(dark, 0.5)} 100%)` }, root);
    return { root, glow, main, trails, blurTarget: null };
  },
  pose(R, S, P) {
    const set = (Ly, lx, op) => {
      Ly.L.style.opacity = n(op, 4);
      Ly.L.style.visibility = op > 0.02 ? 'visible' : 'hidden';
      Ly.strip.style.transform = `scale(${n(P.scale, 5)}) translateX(${n(lx, 3)}px)`;
      Ly.shade.style.opacity = n(S.shade, 4);
      Ly.edge.style.opacity = n(Math.min(1, S.shade * 1.6), 4);
    };
    set(R.main, S.lx, 1);
    R.trails.forEach((t, i) => set(t, S.trail[2 - i], S.g[2 - i]));
    R.glow.style.opacity = n(S.glow, 4);
  },
  // 0–3: strip corners of the first page; 4: the point (400, 1200) of the upstream's panel, in this strip's px
  track(S, P) {
    const k = UP.scale / P.scale;
    return [[0, 0], [PAGE_W, 0], [0, PAGE_H], [PAGE_W, PAGE_H], [400 * k, 1200 * k]].map(([x, y]) => project(P, x, y, S.lx));
  },
  blur: () => false,
};

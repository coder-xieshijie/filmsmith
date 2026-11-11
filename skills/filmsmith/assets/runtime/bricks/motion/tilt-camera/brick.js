// tilt-camera — the camera tilts over a page or a desk of pages lying flat, then rights itself in front of one.
// Adapted from video-shotcraft demos/camera/overhead-camera-moves/TiltReveal.tsx (card references/shots/camera/overhead-camera-moves.md),
// demos/camera/overhead-camera-moves/OverheadTabletopDrop.tsx (same card) and
// demos/camera/space-camera-moves/DroneDiveLanding.tsx (card references/shots/camera/space-camera-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the three shots are three `move`s of one camera
// (rise, drop, dive) over one world of planes painted by the scenes' own painters; colours by role (the desk and floor are
// ground with line-coloured rules, the rim is the accent); brand, demo copy and screenshots removed; the hold-phase push,
// dust, top-light beams, grain and vignette are left to the style; motion blur comes from the tracked corners.
import { clamp, lerp, mix, rgba, seg } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n, stage3d } from '../../dom.js';
import { bez } from '../../../motion.js';
import { painterOf } from '../../sample.js';

const rad = (d) => (d * Math.PI) / 180;
const cubicIn = (u) => u * u * u;
const quintOut = (u) => 1 - Math.pow(1 - u, 5);
const DIVE = bez(0.36, 0, 0.12, 1);          // zero-speed start, fast, long landing
const DIVE_SCALE = bez(0.45, -0.18, 0.12, 1); // pulls back about 5 % before it dives

// Camera at p for each move: pivot (world px) placed at screen (sx, sy), scale s, tilt rot (deg, + lies back), perspective
// d and its origin height ey; order 'sr' = scale then tilt (z not scaled: rise), 'rs' = tilt of a scaled plane.
const MOVES = {
  // tilt-reveal: 0–20 creep 86→83°, 20–60 lift (swift) through −2.2°, 60–70 settle to 0°; scale 2.5→0.84, hinge 600→975.6
  rise: {
    frames: 70, order: 'sr', pivot: [960, 1080],
    cam(p) {
      const f = p * 70, creep = ramp(f, 0, 20, 'smooth') * (3 / 86), lift = ramp(f, 20, 40, 'swift'), over = 1 + 2.2 / 86;
      const q = lerp(creep, over, lift) - (over - 1) * ramp(f, 60, 10, 'smooth'), u = lerp(creep, 1, lift);
      return { rot: 86 * (1 - q), s: lerp(2.5, 0.84, u), sx: 960, sy: lerp(600, 540 + (1080 * 0.84) / 2 - 18, u), ey: lerp(300, 520, u), d: lerp(700, 1500, u), flat: Math.min(1, Math.abs(86 * (1 - q)) / 86), u };
    },
  },
  // overhead-tabletop-drop: 0–50 pan (smooth) at 62°, 44–60 the target lifts, 58–86 drop (rot, scale, x together), 86–94 settle
  drop: {
    frames: 94, order: 'rs', pivot: [0, 0],
    cam(p) {
      const f = p * 94, d = ramp(f, 58, 28, DIVE), ds = ramp(f, 58, 28, DIVE_SCALE);
      const rot = f < 86 ? lerp(62, -1.6, d) : f < 90 ? lerp(-1.6, 0.5, ramp(f, 86, 4, 'smooth')) : lerp(0.5, 0, ramp(f, 90, 4, 'smooth'));
      const s = f < 86 ? lerp(1, 2.04, ds) : lerp(2.04, 2.0, ramp(f, 86, 8, 'smooth'));
      const tx = f <= 58 ? lerp(760, -360, ramp(f, 0, 50, 'smooth')) : lerp(-360, 0, d);
      const pick = ramp(f, 44, 16, 'out');
      return { rot, s, sx: 960 + tx, sy: 540, ey: 0.42 * 1080, d: 1600, pick, lift: 16 * (pick - ramp(f, 70, 18, 'smooth')), tilt: clamp(rot / 62) };
    },
  },
  // drone-dive-landing: 4–24 pre-lift (2.5 % back), 24–49 dive (cubic in, 82 % of the travel), 49–69 cushion (quint out)
  dive: {
    frames: 69, order: 'rs', pivot: [518, 335],
    cam(p, [px, py]) {
      const f = p * 69, pre = -0.025 * ramp(f, 4, 20, 'smooth');
      const u = f < 24 ? pre : f < 49 ? lerp(-0.025, 0.82, cubicIn(seg(f, 24, 49))) : 0.82 + 0.18 * quintOut(seg(f, 49, 69));
      return { rot: lerp(72, 0, u), s: lerp(0.42, 1.35, u), sx: px + lerp(256, 960 - px, u), sy: py + lerp(170, 540 - py, u), ey: 540, d: 1400, u,
        lift: 150 * Math.pow(1 - clamp(u), 1.4) };
    },
  },
};

// Where a world point lands on screen for a camera state (CSS transform then perspective), and its depth.
const project = (C, x, y, z = 0) => {
  const [ox, oy] = C.pivot;
  let X = x - ox, Y = y - oy, Z = z;
  const c = Math.cos(rad(C.rot)), s = Math.sin(rad(C.rot));
  if (C.order === 'sr') { const y1 = Y * c - Z * s, z1 = Y * s + Z * c; X *= C.s; Y = y1 * C.s; Z = z1; }
  else { X *= C.s; const ys = Y * C.s, zs = Z * C.s; Y = ys * c - zs * s; Z = ys * s + zs * c; }
  X += C.sx; Y += C.sy;
  const k = C.d / (C.d - Z);
  return [960 + (X - 960) * k, C.ey + (Y - C.ey) * k];
};
const transformOf = (C) => {
  const [ox, oy] = C.pivot;
  const t = `translate(${n(C.sx - ox)}px, ${n(C.sy - oy)}px)`;
  return C.order === 'sr' ? `${t} scale(${n(C.s, 5)}) rotateX(${n(C.rot)}deg)` : `${t} rotateX(${n(C.rot)}deg) scale(${n(C.s, 5)})`;
};

// The world of each move: planes [{ x, y, w, h, scene }] in world px, the target index, and the floor.
const WORLDS = {
  rise: { items: [{ x: 0, y: 0, w: 1920, h: 1080, scene: { scene: 'page' } }], target: 0, floor: null, res: 1.5, radius: 26 },
  drop: { items: [-1146, 0, 1146].map((x, i) => ({ x: x - 498, y: -280, w: 996, h: 560, scene: { scene: ['grid', 'page', 'detail'][i] } })), target: 1, floor: 'desk', res: 2, radius: 10 },
  dive: { items: [{ x: 0, y: 0, w: 1920, h: 1080, scene: { scene: 'grid' } }], target: 0, floor: 'dots', res: 1.4, radius: 0, focus: [256, 108, 524, 454] },
};
// The sample's dive lands on the grid's first card (the upstream lands on its own hero card at 518, 335).
const DIVE_ON = { pivot: [408, 480], focus: [148, 330, 520, 300] };

export default {
  id: 'tilt-camera', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 4.5,
  beatsFor: (P) => ({ rise: 4.5, drop: 6, dive: 4.5 })[P.move] ?? 4.5,
  surface: ['dom'],
  roles: ['ground', 'line', 'ink', 'accent'],
  from: 'a page (or a desk of pages) lying flat under the camera',
  to: 'one page upright and framed: the page itself (rise), full frame (drop) or a close-up of one region (dive)',
  interpolates: ['tilt 86° / 62° / 72° → 0° with a small overshoot', 'scale', 'pivot position', 'perspective and eye height'],
  summary: 'The camera looks down on pages lying flat and lifts or dives until one stands upright in front of it.',
  theory: 'A change of viewpoint on one continuous space reads as a camera move, not a cut (Gibson 1979: optic flow specifies self-motion); the tilt hides the content and gives it back, so the reveal lands on the righted page.',
  defaults: () => ({ move: 'rise', items: null, rim: true, shade: true, pivot: null, focus: null }),
  prepare(P) {
    const W = WORLDS[P.move] || WORLDS.rise;
    const items = (P.items || W.items).map((it) => ({ ...it, paint: painterOf(it.scene || it.paint, P) }));
    const own = P.move === 'dive' && !P.items;    // the sample's own grid: land on its first card
    return { M: MOVES[P.move] || MOVES.rise, W, items, pivot: P.pivot || (own ? DIVE_ON.pivot : null), focus: P.focus || (own ? DIVE_ON.focus : null) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const pivot = D.pivot || D.M.pivot;
    return { p, ...D.M.cam(p, pivot), pivot, order: D.M.order };
  },
  build(root, P, D) {
    const c = P.colors, { W } = D;
    root.style.background = c.ground;
    const glow = el('div', { position: 'absolute', left: '-10%', right: '-10%', top: '-20%', height: '90%', background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(mix(c.ground, c.ink, 0.5), 0.22)} 0%, ${rgba(c.ground, 0)} 70%)` }, root);
    const { stage, world } = stage3d(root, {});
    world.style.width = '0px'; world.style.height = '0px';
    let floor = null;
    if (W.floor === 'desk') floor = el('div', { position: 'absolute', left: '-2800px', top: '-3200px', width: '5600px', height: '4100px', background: [
      `repeating-linear-gradient(90deg, ${rgba(c.line, 0.6)} 0px, ${rgba(c.line, 0.6)} 1.5px, transparent 1.5px, transparent 400px)`,
      `repeating-linear-gradient(0deg, ${rgba(c.line, 0.6)} 0px, ${rgba(c.line, 0.6)} 1.5px, transparent 1.5px, transparent 400px)`,
      `linear-gradient(180deg, ${mix(c.ground, c.ink, 0.04)}, ${c.ground})`].join(', ') }, world);
    if (W.floor === 'dots') floor = el('div', { position: 'absolute', left: '-2400px', top: '-1500px', width: '6720px', height: '3300px',
      backgroundImage: `radial-gradient(circle at 3px 3px, ${rgba(c.line, 0.9)} 2.2px, ${rgba(c.line, 0)} 3.2px)`, backgroundSize: '48px 48px', backgroundPosition: '0px 12px',
      maskImage: 'radial-gradient(ellipse 2419px 1386px at 3360px 2100px, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 2419px 1386px at 3360px 2100px, #000 30%, transparent 100%)' }, world);
    const shadow = W.floor === 'dots' ? el('div', { position: 'absolute', left: '0px', top: '0px', width: '1920px', height: '1080px', background: mix(c.ground, '#000000', 0.7), borderRadius: '24px' }, world) : null;
    const planes = D.items.map((it, i) => {
      const pl = el('div', { position: 'absolute', left: `${it.x}px`, top: `${it.y}px`, width: `${it.w}px`, height: `${it.h}px`, borderRadius: `${W.radius}px`, overflow: 'hidden',
        transformOrigin: '50% 50%', backfaceVisibility: 'hidden', boxShadow: `0 30px 90px ${rgba(mix(c.ground, '#000000', 0.8), 0.45)}` }, world);
      const cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${it.w}px`, height: `${it.h}px` }, pl);
      cv.width = Math.round(it.w * W.res); cv.height = Math.round(it.h * W.res);
      const g = cv.getContext('2d');
      g.scale(cv.width / 1920, cv.height / 1080);
      it.paint(g);
      const shade = el('div', { position: 'absolute', inset: '0' }, pl);
      return { pl, shade, i };
    });
    const top = el('div', { position: 'absolute', inset: '0', pointerEvents: 'none' }, root);
    const rim = el('div', { position: 'absolute', left: '0', right: '0', height: '3px', background: `linear-gradient(90deg, ${rgba(c.accent, 0)} 4%, ${c.accent} 32%, ${mix(c.accent, '#ffffff', 0.6)} 50%, ${c.accent} 68%, ${rgba(c.accent, 0)} 96%)`, boxShadow: `0 0 18px ${rgba(c.accent, 0.8)}` }, root);
    return { root, glow, stage, world, floor, shadow, planes, top, rim, blurTarget: stage };
  },
  pose(R, S, P, D) {
    const c = P.colors, W = D.W, cam = { ...S };
    R.stage.style.perspective = `${n(S.d, 2)}px`;
    R.stage.style.perspectiveOrigin = `960px ${n(S.ey, 2)}px`;
    R.world.style.transformOrigin = `${n(S.pivot[0])}px ${n(S.pivot[1])}px`;
    R.world.style.transform = transformOf(cam);
    R.glow.style.transform = P.move === 'rise' ? `translateY(${n(lerp(-150, 0, S.u))}px)` : 'none';
    for (const { pl, shade, i } of R.planes) {
      const lift = P.move === 'drop' && i === W.target ? S.lift : P.move === 'dive' ? S.lift : 0;
      pl.style.transform = lift ? `translateZ(${n(lift)}px)` : 'none';
      if (P.move === 'rise' && P.shade) shade.style.background = `linear-gradient(0deg, ${rgba(c.ground, 0.1 * S.flat)} 0%, ${rgba(c.ground, 0.5 * S.flat)} 45%, ${rgba(c.ground, 0.9 * Math.pow(S.flat, 1.5))} 100%)`;
      else if (P.move === 'drop' && i !== W.target) shade.style.background = rgba(c.ground, 0.08 + 0.34 * S.pick);
      else shade.style.background = 'transparent';
    }
    if (R.shadow) { const off = S.lift * 0.22; R.shadow.style.transform = `translate(${n(off)}px, ${n(off)}px)`; R.shadow.style.filter = `blur(${n(22 + S.lift * 0.42, 2)}px)`; R.shadow.style.opacity = n(clamp(S.u <= 0.9 ? lerp(0.16, 0.12, clamp(S.u / 0.9)) : lerp(0.12, 0, (S.u - 0.9) / 0.1)), 4); }
    if (R.floor && P.move === 'dive') R.floor.style.opacity = n(1 - 0.45 * clamp(S.u), 4);
    R.top.style.background = P.move === 'drop' ? `linear-gradient(180deg, ${rgba(c.ground, 0.95 * S.tilt)} 0%, ${rgba(c.ground, 0.55 * S.tilt)} 24%, ${rgba(c.ground, 0)} 48%)` : 'transparent';
    // the horizon: the far edge of the lying page, lit, gone once the page has risen
    const rimOn = P.move === 'rise' && P.rim ? ramp(S.p * 70, 0, 26, 'out') * Math.pow(S.flat, 3) : 0;
    R.rim.style.opacity = n(rimOn, 4);
    R.rim.style.top = `${n(project(cam, 960, 0)[1] - 1.5)}px`;
  },
  track(S, P, D) {
    const it = D.items[D.W.target], z = P.move === 'dive' || (P.move === 'drop') ? (S.lift || 0) : 0;
    const box = D.focus || D.W.focus || [it.x, it.y, it.w, it.h];
    const [x, y, w, h] = box;
    // corners, centre, far-edge middle, near-edge middle
    return [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y + h / 2], [x + w / 2, y], [x + w / 2, y + h]].map(([a, b]) => project(S, a, b, z));
  },
};

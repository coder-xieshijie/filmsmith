// shard-gather — a picture assembles from shards: tiles cut from it fly in from scattered 3D poses and land in a wave
// from the centre out, each with a small click into its slot; or the whole picture shatters and flies off the frame.
// Adapted from video-shotcraft demos/opening/fracture/Fracture.tsx (card references/shots/opening/fracture.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom brick (no React or Remotion): CSS 3D planes, each holding a canvas cut from the caller's
// picture (the `to` painter, a neutral title poster by default) and painted once; every pose rewrites every transform;
// the upstream's one shot is three `dir`s of one move (in: assemble, out: shatter, through: assemble, hold, shatter);
// seeded poses from rng.js hash in place of the upstream's rand(); colours by role (the ground, the accent's glow behind
// the picture); the poster art, its glowing horizon arc, eyebrow, wordmark and mark removed; motion blur from track()
// instead of a multi-sample camera blur.
import { clamp, mix, rgba } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { el, n } from '../../dom.js';
import { painterOf } from '../../sample.js';

// Upstream geometry in screen px (its 480 × 270 design stage drawn at × 4): a 1520 × 920 poster in 5 × 5 tiles, a
// 2 px seam, perspective 3600 px. Its time t runs 0 → 1 over 155 frames.
const N = 5, PW = 1520, PH = 920, TW = PW / N, TH = PH / N, SEAM = 2, PERSP = 3600, LEN = 155;
const land = bez(0.42, 0, 0.3, 1), inCubic = (u) => u * u * u, inOutQuad = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const segT = (t, a, b, e) => e(clamp((t - a) / (b - a)));
// the window of t each dir plays, and whether the camera's slow push and the hold glow belong to it
const DIRS = { in: [0, 0.61], out: [0.7, 0.97], through: [0, 1] };

const tilesOf = (seed) => Array.from({ length: N * N }, (_, i) => {
  const r = Math.floor(i / N), c = i % N, R = (k) => hash(i * 17 + k, seed);
  const ang = r === 2 && c === 2 ? R(1) * Math.PI * 2 : Math.atan2(r - 2 + (R(2) - 0.5) * 0.8, c - 2 + (R(3) - 0.5) * 0.8);
  return {
    r, c, dx: (R(4) - 0.5) * 3600, dy: (R(5) - 0.5) * 2400, dz: (R(6) - 0.3) * 2800,
    rx: (R(7) - 0.5) * 360, ry: (R(8) - 0.5) * 360, rz: (R(9) - 0.5) * 360,
    exX: Math.cos(ang) * (2480 + R(10) * 1040), exY: Math.sin(ang) * (1880 + R(11) * 880), exR: (R(12) - 0.5) * 300,
    wob: R(13) < 0.5 ? -1 : 1, delay: (Math.abs(r - 2) + Math.abs(c - 2)) * 0.045,
  };
});

// One tile's pose at t: translate, rotations, opacity, shade.
const poseAt = (tl, t, dir) => {
  const landAt = tl.delay + 0.34, tin = dir === 'out' ? 1 : segT(t, tl.delay, landAt, land);
  const tout = dir === 'in' ? 0 : segT(t, 0.7 + tl.delay * 0.5, 0.7 + tl.delay * 0.5 + 0.18, inCubic), inv = 1 - tin;
  const since = (t - landAt) * LEN, settle = dir !== 'out' && Math.min(since, 14 - since) > 0 ? Math.exp(-since / 3.2) * Math.sin(since * 0.75) : 0;
  const rx = tl.rx * inv + tl.wob * 2.5 * settle, ry = tl.ry * inv, rz = tl.rz * inv + tl.exR * tout;
  const facing = Math.abs(Math.cos((rx * Math.PI) / 180) * Math.cos((ry * Math.PI) / 180));
  return { x: tl.dx * inv + tl.exX * tout, y: tl.dy * inv + tl.exY * tout, z: tl.dz * inv - 16 * Math.abs(settle), rx, ry, rz, op: Math.min(1, tin * 2.5), shade: (1 - facing) * 0.6 };
};

export default {
  id: 'shard-gather', kind: 'motion',
  tier: 'T2', family: 'shape', beats: (0.61 * LEN) / 15,
  beatsFor: (P) => ((DIRS[P.dir] || DIRS.in)[1] - (DIRS[P.dir] || DIRS.in)[0]) * LEN / 15,
  surface: ['dom'],
  roles: ['ground', 'panel', 'accent'],
  from: 'in: the ground; out: the picture whole; through: the ground',
  to: 'in: the picture whole, tile seams just visible; out and through: the ground, the picture gone',
  interpolates: ['per tile: scattered pose (±1800, ±1200, −840…+1960 px, three turns ±180°) → its slot, on (0.42, 0, 0.3, 1), started by its Manhattan distance from the centre (0.045 a ring)', 'a ≤ 2.5° damped wobble over 14 frames after each landing', 'out: each tile flies away from the centre 2480–3520 px with a ±150° turn, ease-in', 'shade by how far a tile faces away; the glow behind the picture as it becomes whole'],
  summary: 'A picture assembles from shards that fly in from scattered 3D poses and click into place from the centre out; or it shatters and flies off the frame.',
  theory: 'Order out of chaos is a reveal the eye completes before the last piece lands (closure, Wertheimer 1923); pieces starting by distance from the centre read as one wave from one source (common fate); a landing that clicks gives each piece weight (follow-through, Thomas & Johnston 1981).',
  defaults: () => ({ dir: 'in', to: { scene: 'title', key: 'claim', size: 104 }, rect: [200, 80, PW, PH], push: true, seed: 5 }),
  prepare(P) {
    const spec = P.to && !P.to.ground && typeof P.to === 'object' ? { ...P.to, ground: mix(P.colors.panel, P.colors.accent, 0.12) } : P.to;
    return { picture: painterOf(spec, P), tiles: tilesOf(P.seed), win: DIRS[P.dir] || DIRS.in };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const [a, b] = D.win, t = a + (b - a) * clamp(p), dir = P.dir;
    const push = dir === 'through' && P.push ? 1 + 0.03 * segT(t, 0.45, 1, inOutQuad) : 1;
    const whole = (dir === 'out' ? 1 : segT(t, 0.28, 0.55, (u) => 1 - Math.pow(1 - u, 3))) * (dir === 'in' ? 1 : 1 - segT(t, 0.7, 0.86, (u) => u * u));
    return { p, t, push, whole, tiles: D.tiles.map((tl) => poseAt(tl, t, dir)) };
  },
  build(root, P, D) {
    const c = P.colors, [rx0, ry0] = P.rect;
    root.style.background = `radial-gradient(ellipse 80% 70% at 50% 8%, ${mix(c.ground, c.panel, 0.7)} 0%, ${c.ground} 72%)`;
    const glow = el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 52% 56% at 50% 52%, ${rgba(c.accent, 0.26)} 0%, ${rgba(c.accent, 0)} 70%)` }, root);
    const stage = el('div', { position: 'absolute', inset: '0', perspective: `${PERSP}px`, perspectiveOrigin: '960px 540px', overflow: 'hidden' }, root);
    const world = el('div', { position: 'absolute', left: `${rx0}px`, top: `${ry0}px`, width: `${PW}px`, height: `${PH}px`, transformStyle: 'preserve-3d', transformOrigin: `${PW / 2}px ${PH / 2}px` }, stage);
    // the picture once, then each tile's slice of it
    const pic = document.createElement('canvas'); pic.width = 1920; pic.height = 1080;
    D.picture(pic.getContext('2d', { willReadFrequently: true }));
    const tiles = D.tiles.map((tl) => {
      const box = el('div', { position: 'absolute', left: `${tl.c * TW + SEAM / 2}px`, top: `${tl.r * TH + SEAM / 2}px`, width: `${TW - SEAM}px`, height: `${TH - SEAM}px`,
        borderRadius: '6px', overflow: 'hidden', boxShadow: `inset 0 1.4px 0 ${rgba('#ffffff', 0.16)}, inset 0 0 0 1.2px ${rgba('#ffffff', 0.07)}`, backfaceVisibility: 'visible' }, world);
      const cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${TW - SEAM}px`, height: `${TH - SEAM}px` }, box);
      cv.width = Math.round(TW - SEAM); cv.height = Math.round(TH - SEAM);
      cv.getContext('2d').drawImage(pic, rx0 + tl.c * TW + SEAM / 2, ry0 + tl.r * TH + SEAM / 2, TW - SEAM, TH - SEAM, 0, 0, cv.width, cv.height);
      const shade = el('div', { position: 'absolute', inset: '0', background: mix(c.ground, '#000000', 0.6) }, box);
      return { box, shade };
    });
    return { root, glow, stage, world, tiles, blurTarget: world };
  },
  pose(R, S) {
    R.world.style.transform = `scale(${n(S.push, 5)})`;
    R.glow.style.opacity = n(S.whole, 4);
    S.tiles.forEach((q, i) => {
      const t = R.tiles[i];
      t.box.style.transform = `translate3d(${n(q.x, 2)}px, ${n(q.y, 2)}px, ${n(q.z, 2)}px) rotateX(${n(q.rx, 3)}deg) rotateY(${n(q.ry, 3)}deg) rotateZ(${n(q.rz, 3)}deg)`;
      t.box.style.opacity = n(q.op, 4);
      t.shade.style.opacity = n(q.shade > 0.004 ? q.shade : 0, 4);
    });
  },
  // the projected centres of the corner tile (0) and the centre tile (12), held at a margin once off the frame
  track(S, P) {
    const [rx0, ry0] = P.rect;
    return [0, 12].map((i) => {
      const q = S.tiles[i], r = Math.floor(i / N), c = i % N;
      const x = rx0 + PW / 2 + ((c + 0.5) * TW - PW / 2 + q.x) * S.push, y = ry0 + PH / 2 + ((r + 0.5) * TH - PH / 2 + q.y) * S.push, k = PERSP / (PERSP - q.z * S.push);
      // a tile that has left the frame is held at the frame's margin: it is gone, and its speed no longer counts
      return [clamp(960 + (x - 960) * k, -240, 2160), clamp(540 + (y - 540) * k, -240, 1320)];
    });
  },
};

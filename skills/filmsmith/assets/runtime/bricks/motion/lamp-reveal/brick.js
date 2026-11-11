// lamp-reveal — a scene in the dark, shown only where a lamp falls: a spot swings like a pendulum and opens like an
// iris, grows from a corner, or crosses the scene and leaves it dark again; an edge light can run with it.
// Adapted from video-shotcraft demos/effects/light-play-moves/SpotlightSweepReveal.tsx (card
// references/shots/effects/light-play-moves.md) and demos/effects/spotlight-sweep-moves/CornerSpotlightReveal.tsx,
// GlowWakeSleepPanel.tsx, SlideSpotlightPan.tsx (card references/shots/effects/spotlight-sweep-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the four shots are four `path`s of one light over the
// caller's scene (swing, grow, pass, pan); the dark is the ground mixed with black, the edge light is the accent;
// brand, demo copy, the velvet curtain, stage floor, motes, ghost panel, logo ring and the 3D panel tilt removed (the
// scene's and the style's); the camera drift of the corner and pass shots is left out (pan keeps its slide, which is
// the shot).
import { clamp, lerp, mix, rgba, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf } from '../../sample.js';

const outCubic = bez(0.215, 0.61, 0.355, 1);
const FLICKER = [0, 0.55, 0.15, 0.8, 0.45, 1];
// Constant speed to a stop: linear over [0, n − b], then a quadratic brake over the last b frames at the same entry speed
// (a constant-speed pan has to stop somewhere for the next scene to hold); returns the share of the path in [0, 1].
const brake = (f, n, b) => { const L = n - b / 2, v = 1 / L; if (f <= n - b) return f * v; const t = Math.min(b, f - (n - b)); return (n - b) * v + v * (t - (t * t) / (2 * b)); };
const keys = (f, ks) => { if (f <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (f <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return va + ((f - a) / (b - a)) * (vb - va); } return ks[ks.length - 1][1]; };

// Each path in frames: where the light is (x, y, rx, ry), how bright (env), its profile [offset, light] and what moves.
export const PATHS = {
  // spotlight-sweep (upstream 4–141): lamp warms 0–6, pendulum 4–117, iris 117–137
  swing: { frames: 137, at(f, P) {
    const env = f < 6 ? FLICKER[Math.floor(f)] : 1, sf = clamp(f - 4, 0, 112.5);
    const th = -Math.PI / 2 + (2 * Math.PI * sf) / 50, damp = 1 - ramp(sf, 37.5, 75, 'smooth'), u = Math.sin(th) * damp;
    const iris = ramp(f, 116.5, 20, outCubic);
    return { x: P.at[0] + 600 * u, y: P.at[1] + 26 - 44 * u * u, rx: lerp(360, 1080, iris), ry: lerp(331.2, 480, iris), env, profile: [[0, 1], [0.42, 0.92], [0.72, 0.35], [1, 0]] };
  } },
  // corner-spotlight-reveal (upstream 0–100): radius 160 → 1300 linear, feather 0.85 r, the centre creeping out of the corner
  grow: { frames: 100, at(f, P) {
    const r = lerp(160, 1300, f / 100), k = Math.min(1, f / 96), R = r * 1.85, inner = Math.max(0, (r - r * 0.85 * 0.25) / R);
    return { x: lerp(P.corner[0], P.corner[0] + 280, k), y: lerp(P.corner[1], P.corner[1] + 170, k), rx: R, ry: R, env: 1, profile: [[0, 1], [inner, 1], [1, 0]] };
  } },
  // glow-wake-sleep-panel (upstream 0–130): the light crosses the panel's top at constant speed, wakes it and lets it sleep
  pass: { frames: 130, at(f, P) {
    const [x, y, w] = P.rim;
    return { x: x + keys(f, [[4, -260], [120, w + 260]]), y: y + 150, rx: 640, ry: 640, env: keys(f, [[0, 0], [16, 1], [100, 1], [130, 0]]), profile: [[0, 0.88], [0.58, 0.72], [0.92, 0.015], [1, 0]] };
  } },
  // slide-spotlight-pan (upstream 0–132): the light runs right while the scene slides left, both at constant speed
  pan: { frames: 132, at(f, P) {
    const u = brake(f, 132, 10), slide = lerp(P.slide[0], P.slide[1], u);
    return { x: lerp(-360, 2600, u), y: P.rim[1] + 260, rx: 760, ry: 620, env: keys(f, [[0, 0.4], [10, 1]]), slide, profile: [[0, 1], [0.5, 0.75], [0.85, 0.12], [1, 0]] };
  } },
};

export default {
  id: 'lamp-reveal', kind: 'motion',
  tier: 'T1', family: 'mask-type', beats: 137 / 15,
  beatsFor: (P) => (PATHS[P.path] || PATHS.swing).frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'accent'],
  from: 'the scene in the dark (only a ghost of it at `dark`)',
  to: 'the scene lit where the lamp ends (swing, grow), or dark again (pass); slid along (pan)',
  interpolates: ['spot centre along the path (pendulum, corner creep, constant crossing)', 'spot radius (iris 360 → 1080, corner 160 → 1300 at constant speed)', 'light level (lamp warm-up flicker, wake and sleep)', 'edge light along the rim, following the spot', 'scene slide (pan)'],
  summary: 'A scene in the dark is shown only where a lamp falls: a spot swings and opens like an iris, grows from a corner, or crosses and leaves the scene dark.',
  theory: 'In the dark the viewer sees only what the light gives (figure and ground by luminance, Gestalt); the lamp is both camera and edit. Constant speed reads as a mechanical searchlight with no intention of its own (the upstream finding); the pendulum that dies to the centre before the iris opens is a damped swing, read as a hand on the lamp (anticipation, then release).',
  defaults: () => ({ path: 'swing', from: { scene: 'title' }, dark: 0.07, at: [960, 560], corner: [140, 90], rim: [0, 150, 1920, 1080], slide: [180, -1100], edge: false, seed: 1 }),
  prepare(P) { return { scene: painterOf(P.from, P), buf: canvasOf(1920, 1080), shade: canvasOf(1920, 1080), path: PATHS[P.path] || PATHS.swing }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) { const f = p * D.path.frames; return { p, f, ...D.path.at(f, P) }; },
  paint(ctx, S, P, D) {
    const c = P.colors, night = mix(c.ground, '#000000', 0.7);
    const b = D.buf.getContext('2d', { willReadFrequently: true });
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, 1920, 1080);
    b.save(); if (S.slide) b.translate(S.slide, 0); D.scene(b); b.restore();
    // the dark: night everywhere except a ghost of the scene, cut away where the light falls
    const s = D.shade.getContext('2d', { willReadFrequently: true });
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, 1920, 1080);
    s.fillStyle = rgba(night, 1 - P.dark); s.fillRect(0, 0, 1920, 1080);
    if (S.env > 0) {
      s.globalCompositeOperation = 'destination-out';
      s.save(); s.translate(S.x, S.y); s.scale(1, S.ry / S.rx);
      const g = s.createRadialGradient(0, 0, 0, 0, 0, S.rx);
      for (const [o, a] of S.profile) g.addColorStop(o, rgba('#000000', clamp(a * S.env)));
      s.fillStyle = g; s.fillRect(-S.rx, -S.rx, 2 * S.rx, 2 * S.rx);
      s.restore();
    }
    ctx.fillStyle = night; ctx.fillRect(0, 0, 1920, 1080);
    ctx.drawImage(D.buf, 0, 0);
    ctx.drawImage(D.shade, 0, 0);
    if (P.edge && S.env > 0) this.edge(ctx, S, P);
  },
  // the edge light: a glowing line along the rim's top edge, brightest at the spot, three layers (wide, mid, core)
  edge(ctx, S, P) {
    const [x, y, w] = P.rim, c = P.colors.accent, x0 = Math.max(x, S.x - 490), x1 = Math.min(x + w + (S.slide || 0), S.x + 490);
    if (x1 <= x0) return;
    for (const [blur, width, a] of [[26, 16, 0.5], [9, 7, 0.75], [0, 2.5, 1]]) {
      const g = ctx.createLinearGradient(S.x - 490, 0, S.x + 490, 0);
      g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.5, rgba(blur ? c : mix(c, '#ffffff', 0.7), a * S.env)); g.addColorStop(1, rgba(c, 0));
      ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = g; ctx.fillRect(x0, y - width / 2, x1 - x0, width); ctx.restore();
    }
  },
  blur() { return false; },
  // the spot centre and its visible edge (an edge past the farthest corner of the frame no longer changes the picture)
  track(S) { const far = Math.max(Math.hypot(S.x, S.y), Math.hypot(1920 - S.x, S.y), Math.hypot(S.x, 1080 - S.y), Math.hypot(1920 - S.x, 1080 - S.y)); return [[S.x, S.y], [S.x + Math.min(S.rx, far), S.y]]; },
};

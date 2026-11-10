// time-freeze — time stops inside the picture while the camera keeps moving: the content brakes into a freeze, the
// camera orbits the frozen plane (or the frozen frame is marked up), then time ramps back and the content finishes.
// Adapted from video-shotcraft demos/camera/tension-camera-moves/BulletTimeFreezeOrbit.tsx (card references/shots/camera/tension-camera-moves.md)
// and demos/rhythm/speed-ramp-freeze/FreezeAnnotateReal.tsx (card references/shots/rhythm/speed-ramp-freeze.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy, the glass data
// panel with its sparks and odometer, and the card rail with its screenshots removed: the content is any time-driven
// painter (paint(ctx, t), default the sample bar chart) on one plane; the two shots are two `mode`s of one content clock
// (orbit: a speed ramp in and out of the freeze while the camera orbits 52°; annotate: an instant freeze, a marker ring
// and a note on the frame, then a catch-up thaw); the light breathing and grain are left to the look.
// Mode 'hit-stop' and the export hitStop() (from demos/effects/impact-feedback/HitCounter.tsx, same repo and commit): on
// each hit the content holds still for `stop` frames (2), camera and effects too, then resumes from where it stopped;
// the upstream's remap (real hit frame = content hit frame + the frames already held) and its flash on the held frames,
// here a paper flash over the frame. The damage number and the ×N counter are the scene combo-hits'.
import { measure, mix, rgba, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { painterOf, copy, infoSize } from '../../sample.js';
import { fontFor } from '../../lang.js';
import { default as NEUTRAL } from '../../look/neutral/look.js';

const clamp01 = (u) => Math.min(1, Math.max(0, u));
const rad = (d) => (d * Math.PI) / 180;
const PW = 1180, PH = (1180 * 1080) / 1920;    // the content plane (the upstream's panel is 1180 wide)
const CAM = { d: 1800, ox: 960, oy: 0.46 * 1080, x: 960, y: 520 };

// content clocks: frames of content time elapsed at film frame f
const orbitSpeed = (f) => (f < 40 ? 1 : f < 48 ? 1 - EASE.smooth((f - 40) / 8) : f < 100 ? 0 : f < 108 ? EASE.smooth((f - 100) / 8) : 1);
const ORBIT_EFF = (() => { const out = [0]; let e = 0; for (let f = 0; f < 200; f++) { for (let s = 0; s < 4; s++) e += orbitSpeed(f + (s + 0.5) / 4) / 4; out.push(e); } return out; })();
const effOrbit = (f) => { const i = Math.max(0, Math.min(ORBIT_EFF.length - 2, Math.floor(f))); return ORBIT_EFF[i] + (ORBIT_EFF[i + 1] - ORBIT_EFF[i]) * (f - i); };
const effAnnotate = (f) => { if (f <= 45) return Math.max(0, f); if (f <= 112) return 45; const t = Math.min(1, (f - 112) / 22); return 45 + 42 * t * t * t * (t * (6 * t - 15) + 10); };
// hit-stop: the content frame at film frame f when `stop` frames are held at each hit (hits in content frames)
export const hitStop = (f, hits, stop = 2) => { let t = f; hits.forEach((h, i) => { t -= Math.min(Math.max(f - (h + i * stop), 0), stop); }); return t; };
const HIT = { content: 54, hits: [14, 28, 42], stop: 2 };
const MODES = {
  orbit: { frames: 140, eff: effOrbit },
  annotate: { frames: 134, eff: effAnnotate },
};

// screen position of a plane point (x, y from the plane's centre) for the camera at S
const project = (S, x, y) => {
  const cy = Math.cos(rad(S.ry)), sy = Math.sin(rad(S.ry)), cx = Math.cos(rad(S.rx)), sx = Math.sin(rad(S.rx));
  const x1 = x * cy, z1 = -x * sy;
  const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx + S.dolly;
  const k = CAM.d / (CAM.d - z2);
  return [CAM.ox + (CAM.x + x1 - CAM.ox) * k, CAM.oy + (CAM.y + y2 - CAM.oy) * k];
};

export default {
  id: 'time-freeze', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 9.5,
  beatsFor: (P) => (P.mode === 'annotate' ? 9 : P.mode === 'hit-stop' ? Math.ceil(((P.content ?? HIT.content) + (P.hits ?? HIT.hits).length * (P.stop ?? HIT.stop)) / 15 * 4) / 4 : 9.5),
  surface: ['dom'],
  roles: ['ground', 'accent', 'ink', 'line', 'paper'],
  from: 'the content at its start (time t = 0), square to the camera',
  to: 'the content finished (t = 1), square to the camera',
  interpolates: ['content time (three clocks: a speed ramp into and out of a freeze, an instant freeze and a catch-up, or a 2-frame hold on each hit)', 'orbit: camera yaw 0 → −52° → 0, pitch, dolly', 'annotate: shutter flash, frame corners, a marker ring and a note'],
  summary: 'Time stops inside the picture while the camera keeps moving: the content brakes into a freeze, the camera orbits the frozen moment (or it is marked up), then time comes back and the content finishes.',
  theory: 'Two clocks: freezing the content while the camera moves separates "what happened" from "how we look at it" (bullet time); motion parallax during the orbit proves the frozen frame is a space, and the instant freeze of the annotate mode reads as pressing pause to point at one thing.',
  sceneRest: false,
  defaults: () => ({ look: null, mode: 'orbit', scene: { scene: 'bars' }, yaw: -52, floor: true, focus: [960, 380, 120, 480], note: 'metric' }),
  prepare(P) {
    if (P.mode === 'hit-stop') {
      const hits = P.hits ?? HIT.hits, stop = P.stop ?? HIT.stop, content = P.content ?? HIT.content;
      return { paint: painterOf(P.scene, P), M: { frames: content + hits.length * stop, eff: (f) => hitStop(f, hits, stop), hits: hits.map((h, i) => h + i * stop), stop } };
    }
    return { paint: painterOf(P.scene, P), M: MODES[P.mode] || MODES.orbit };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const M = D.M, f = clamp01(p) * M.frames, t = clamp01(M.eff(f) / M.eff(M.frames));
    if (P.mode === 'hit-stop') {
      // the upstream's flash: 0.7 on the held frames, then gone over the next 5
      const df = M.hits.map((h) => f - h).filter((d) => d >= 0).pop() ?? -1;
      const flash = df >= 0 && df < M.stop + 4 ? (df < M.stop ? 0.7 : 0.7 * Math.max(0, 1 - (df - M.stop + 1) / 5)) : 0;
      return { p, f, t, ry: 0, rx: 0, dolly: 0, flash };
    }
    if (P.mode === 'annotate') {
      const focus = ramp(f, 45, 10, 'snappy') * (1 - ramp(f, 104, 12, 'swift'));
      return { p, f, t, ry: 0, rx: 0, dolly: 0, flash: f >= 45 ? 1 - ramp(f, 45, 4, 'out') : 0, focus, corners: ramp(f, 45, 8, 'overshoot') * (1 - ramp(f, 104, 8, 'exit')),
        draw: ramp(f, 54, 10, 'swift'), shaft: ramp(f, 64, 6, 'out'), head: ramp(f, 70, 3, 'out'), noteIn: ramp(f, 66, 12, 'snappy'), under: ramp(f, 78, 10, 'swift'), ink: 1 - ramp(f, 104, 8, 'out') };
    }
    const out = ramp(f, 46, 26, 'smooth'), back = ramp(f, 84, 22, 'swift'), drift = ramp(f, 72, 12, 'linear'), orbit = out * (1 - back);
    return { p, f, t, ry: P.yaw * orbit - 3 * drift * (1 - back), rx: -3 - 6 * orbit, dolly: 160 * orbit, frozen: 1 - orbitSpeed(f) };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = c.ground;
    el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${rgba(mix(c.ground, c.accent, 0.35), 0.5)}, ${rgba(c.ground, 0)} 70%)` }, root);
    const stage = el('div', { position: 'absolute', inset: '0', perspective: `${CAM.d}px`, perspectiveOrigin: `${CAM.ox}px ${n(CAM.oy)}px`, overflow: 'hidden' }, root);
    const flat = P.mode === 'annotate' || P.mode === 'hit-stop';   // no camera move: the plane is the frame
    const world = el('div', { position: 'absolute', left: `${CAM.x}px`, top: `${flat ? 540 : CAM.y}px`, width: '0', height: '0', transformStyle: 'preserve-3d' }, stage);
    if (P.floor && !flat) {
      el('div', { position: 'absolute', left: '-2600px', top: '-1500px', width: '5200px', height: '3000px', transform: 'translateZ(-1200px)', opacity: '0.55',
        backgroundImage: `radial-gradient(circle at 3px 3px, ${rgba(c.accent, 0.35)} 2px, ${rgba(c.accent, 0)} 3px)`, backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 40% 42% at 50% 50%, #000 0%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 40% 42% at 50% 50%, #000 0%, transparent 100%)' }, world);
      el('div', { position: 'absolute', left: '-1800px', top: `${n(PH / 2 + 70 - 1800)}px`, width: '3600px', height: '3600px', transform: 'rotateX(90deg)',
        backgroundImage: `linear-gradient(${rgba(c.line, 0.5)} 2px, transparent 2px), linear-gradient(90deg, ${rgba(c.line, 0.5)} 2px, transparent 2px)`, backgroundSize: '120px 120px',
        maskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 46%)', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 46%)' }, world);
    }
    const annotate = flat;
    const w = annotate ? 1920 : PW, h = annotate ? 1080 : PH;
    const panel = el('div', { position: 'absolute', left: `${-w / 2}px`, top: `${-h / 2}px`, width: `${w}px`, height: `${h}px`, borderRadius: annotate ? '0' : '28px', overflow: 'hidden',
      boxShadow: annotate ? 'none' : `0 50px 120px -30px ${rgba(mix(c.ground, '#000000', 0.85), 0.9)}`, background: c.ground }, world);
    const cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px` }, panel);
    cv.width = 1920; cv.height = 1080;
    const veil = el('div', { position: 'absolute', inset: '0', background: rgba(c.ground, 1), opacity: '0' }, panel);
    const over = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', pointerEvents: 'none' }, root);
    over.width = 1920; over.height = 1080;
    over.getContext('2d', { willReadFrequently: true });
    return { root, stage, world, panel, cv, g: cv.getContext('2d', { willReadFrequently: true }), veil, over, blurTarget: null };
  },
  pose(R, S, P, D) {
    const c = P.colors;
    R.world.style.transform = `translateZ(${n(S.dolly, 2)}px) rotateX(${n(S.rx, 3)}deg) rotateY(${n(S.ry, 3)}deg)`;
    const g = R.g;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, 1920, 1080);
    D.paint(g, S.t);
    const o = R.over.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, 1920, 1080);
    if (P.mode === 'hit-stop') { if (S.flash > 0) { o.fillStyle = rgba(c.paper || '#FFFFFF', 0.25 * S.flash); o.fillRect(0, 0, 1920, 1080); } return; }
    if (P.mode !== 'annotate') return;
    // pause: a shutter flash, frame corners, the rest of the frame veiled while the marker works
    R.veil.style.opacity = n(0.35 * S.focus, 4);
    if (S.flash > 0) { o.fillStyle = rgba('#FFFFFF', 0.55 * S.flash); o.fillRect(0, 0, 1920, 1080); }
    const ink = c.accent;
    if (S.corners > 0.001) {
      o.save(); o.globalAlpha = Math.min(1, S.corners * 1.5); o.strokeStyle = ink; o.lineWidth = 4;
      const m = 72, L = 64, sh = (1 - S.corners) * 40;
      for (const [x, y, sx, sy] of [[m, m, 1, 1], [1920 - m, m, -1, 1], [m, 1080 - m, 1, -1], [1920 - m, 1080 - m, -1, -1]]) {
        const X = x - sx * sh, Y = y - sy * sh;
        o.beginPath(); o.moveTo(X, Y + sy * L); o.lineTo(X, Y); o.lineTo(X + sx * L, Y); o.stroke();
      }
      o.restore();
    }
    if (S.ink <= 0.001 || S.draw <= 0) return;
    // the marker: one superellipse stroke, 1.08 turns, closing in 4 %, around `focus`
    const [fx, fy, fw, fh] = P.focus, cx = fx + fw / 2, cy = fy + fh / 2, rx = 1.2 * (fw / 2) * 1.03 + 40, ry = 1.22 * (fh / 2) * 1.03;
    o.save(); o.globalAlpha = S.ink; o.strokeStyle = ink; o.lineWidth = 9; o.lineCap = 'round'; o.lineJoin = 'round';
    o.beginPath();
    const N = Math.max(2, Math.round(140 * S.draw));
    for (let i = 0; i <= N; i++) {
      const u = (i / 140), a = -2.3 + u * Math.PI * 2 * 1.08, k = 1 - 0.04 * u, ca = Math.cos(a), sa = Math.sin(a);
      const x = cx + Math.sign(ca) * Math.pow(Math.abs(ca), 2 / 3) * rx * k, y = cy + Math.sign(sa) * Math.pow(Math.abs(sa), 2 / 3) * ry * k;
      i ? o.lineTo(x, y) : o.moveTo(x, y);
    }
    o.stroke();
    // an arrow from the ring's upper right to the note, and the note with its underline
    const ax = cx + rx * 0.72, ay = cy - ry * 0.78, bx = ax + 210, by = ay - 120;
    if (S.shaft > 0) {
      o.beginPath(); o.moveTo(ax, ay); o.quadraticCurveTo(ax + 40, by + 10, ax + (bx - ax) * S.shaft, ay + (by - ay) * S.shaft); o.stroke();
      if (S.head > 0) { o.beginPath(); o.moveTo(bx - 26 * S.head, by + 4); o.lineTo(bx, by); o.lineTo(bx - 8, by + 26 * S.head); o.stroke(); }
    }
    if (S.noteIn > 0) {
      const lang = P.lang, look = P.look || NEUTRAL, s = copy(P.note, lang), f = fontFor(look, 'display', lang, 68, 800, 'display');
      const a = Math.min(1, S.noteIn * 1.4); // globalAlpha already carries the ink fade
      text(o, s, bx + 24, by + 22 + (1 - S.noteIn) * 30, f, { color: ink, alpha: a });
      if (S.under > 0) { const w = measure(o, s, f).width; o.globalAlpha = S.ink; o.beginPath(); o.moveTo(bx + 24, by + 44); o.lineTo(bx + 24 + w * S.under, by + 40); o.stroke(); }
      text(o, copy('caption', lang), bx + 24, by + 96, fontFor(look, 'text', lang, infoSize(lang), 500), { color: c.ink, alpha: a });
    }
    o.restore();
  },
  // 0, 1: the left and right middles of the content plane's screen bounding box (its projected corners); 2: its centre
  track(S, P) {
    if (P.mode === 'annotate' || P.mode === 'hit-stop') return [[0, 540], [1920, 540], [960, 540]]; // no camera move: the plane is the frame
    const q = [[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [-PW / 2, PH / 2], [PW / 2, PH / 2]].map(([x, y]) => project(S, x, y));
    const xs = q.map((v) => v[0]), ys = q.map((v) => v[1]), my = (Math.min(...ys) + Math.max(...ys)) / 2;
    return [[Math.min(...xs), my], [Math.max(...xs), my], project(S, 0, 0)];
  },
  blur: () => false,
};

// line-carry — one line carries the eye from this scene to the next: it runs out of the scene, the camera follows it
// sideways one frame width, and it turns its corners to draw the frame the next scene's picture appears in.
// Adapted from video-shotcraft demos/transition/line-carry-transition/LineCarryTransition.tsx (card references/shots/transition/line-carry-transition.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy, the export card
// and the poster removed (the two scenes are any painters, side by side in one world); the frame's place and the line's
// start are parameters; the ruler under the line has no distance labels; the horizontal speed blur of the world is a few
// shifted copies of the frame, and the line and its tip stay outside it.
import { canvasOf, rgba } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { painterOf } from '../../sample.js';

const W = 1920, H = 1080;
const F0 = 4, FN = 138;                       // upstream frames 4–142 map to p 0–1
const clamp01 = (u) => Math.min(1, Math.max(0, u));
const ramp = (f, a, d, e) => e(clamp01((f - a) / d));
const buffer = (w, h) => { const b = canvasOf(w, h); b.getContext('2d', { willReadFrequently: true }); return b; };

const geometry = (P) => {
  const [fx, fy, fw, fh] = P.frame, y = fy + fh, X0 = P.x0, FX0 = W + fx, FX1 = W + fx + fw, FY0 = fy;
  const segs = [[X0, y, FX0, y], [FX0, y, FX0, FY0], [FX0, FY0, FX1, FY0], [FX1, FY0, FX1, y], [FX1, y, FX0, y]];
  const lens = segs.map(([a, b, c, d]) => Math.hypot(c - a, d - b));
  return { y, X0, FX0, FX1, FY0, segs, lens, total: lens.reduce((s, x) => s + x, 0), lead: P.tipX - X0 };
};
const tipAt = (G, d) => {
  let r = Math.max(0, Math.min(d, G.total));
  for (let i = 0; i < G.segs.length; i++) {
    const [a, b, c, e] = G.segs[i];
    if (r <= G.lens[i]) { const t = r / G.lens[i]; return [a + (c - a) * t, b + (e - b) * t]; }
    r -= G.lens[i];
  }
  return [G.FX0, G.y];
};

export default {
  id: 'line-carry', kind: 'motion',
  tier: 'T2', family: 'line-path', beats: 9.2,
  surface: ['canvas'],
  roles: ['ink', 'accent', 'ground'],
  from: 'the current scene, full frame; the line starts on it (a progress bar, a rule) at x0 on the frame\'s bottom line',
  to: 'the next scene, full frame, one frame width to the right; its picture inside `frame` appears once the line closes it',
  interpolates: ['line length (bar fill, run-out, pan at the camera\'s speed, closing the frame)', 'camera x 0 → 1920', 'the frame\'s picture fading in'],
  summary: 'A line fills its bar, runs out of the scene, the camera follows it one frame to the right, and it turns its corners to draw the frame the next picture appears in; one line, no cut.',
  theory: 'The eye follows a single moving point (smooth pursuit), so a line that never breaks carries attention across a change of place with no cut (the graphic relay of title sequences in the Saul Bass tradition); continuous speed at every hand-over keeps it one gesture.',
  sceneRest: false,
  defaults: () => ({ from: { scene: 'title' }, to: { scene: 'page' }, frame: [960, 280, 720, 480], x0: 336, bar: 648, tipX: 1480, width: 8, ticks: true, cover: true, smear: 0.28 }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P), G: geometry(P), buf: buffer(W, H) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = F0 + clamp01(p) * FN, G = D.G;
    const camAt = (x) => W * ramp(x, 56, 56, EASE.smooth);
    const cam = camAt(f);
    let drawn;
    if (f < 46) drawn = P.bar * ramp(f, 4, 36, EASE.out);
    else if (f < 56) drawn = P.bar + (G.lead - P.bar) * ramp(f, 46, 10, EASE.swift);
    else if (f < 112) drawn = G.lead + cam;
    else drawn = G.lead + W + (G.total - G.lead - W) * ramp(f, 112, 24, EASE.smooth);
    const vx = (camAt(f + 0.5) - camAt(f - 0.5));   // px per frame of the camera
    return { p, f, cam, drawn, tip: tipAt(G, drawn), tipO: 1 - ramp(f, 136, 6, (u) => u), fill: ramp(f, 132, 10, EASE.out), vx };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, G = D.G;
    // the world (both scenes) in screen space, smeared horizontally by the camera's speed
    const b = D.buf.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.filter = 'none';
    b.clearRect(0, 0, W, H);
    if (S.cam < W) { b.save(); b.translate(-S.cam, 0); D.from(b); b.restore(); }
    if (S.cam > 0) {
      b.save(); b.translate(W - S.cam, 0); b.beginPath(); b.rect(0, 0, W, H); b.clip(); D.to(b);
      if (P.cover && S.fill < 1) { const [fx, fy, fw, fh] = P.frame; b.globalAlpha = 1 - S.fill; b.fillStyle = c.ground; b.fillRect(fx, fy, fw, fh); }
      b.restore();
    }
    const smear = Math.min(16, Math.abs(S.vx) * P.smear);
    if (smear < 0.5) ctx.drawImage(D.buf, 0, 0);
    else {
      const n = 6;
      for (let i = 0; i < n; i++) { ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(D.buf, smear * (i / (n - 1) - 0.5), 0); }
      ctx.globalAlpha = 1;
    }
    // the line, its ruler and its tip, always sharp (world space shifted by the camera)
    ctx.save(); ctx.translate(-S.cam, 0);
    if (P.ticks) for (let i = 0; i < 14; i++) {
      const x = 1200 + i * 120, on = ramp(G.X0 + S.drawn, x, 40, EASE.out);
      if (on <= 0) continue;
      const major = i % 4 === 0;
      ctx.strokeStyle = rgba(c.ink, (major ? 0.55 : 0.3) * on); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, G.y + 10); ctx.lineTo(x, G.y + (major ? 34 : 20)); ctx.stroke();
    }
    if (S.drawn > 0) {
      ctx.strokeStyle = c.ink; ctx.lineWidth = P.width; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
      ctx.beginPath(); ctx.moveTo(G.X0, G.y);
      let r = S.drawn;
      for (let i = 0; i < G.segs.length && r > 0; i++) {
        const [a, bb, cc, e] = G.segs[i], t = Math.min(1, r / G.lens[i]);
        ctx.lineTo(a + (cc - a) * t, bb + (e - bb) * t); r -= G.lens[i];
      }
      ctx.stroke();
    }
    if (S.tipO > 0.001) {
      const [tx, ty] = S.tip;
      ctx.globalAlpha = S.tipO * 0.16; ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(tx, ty, 30, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = S.tipO; ctx.beginPath(); ctx.arc(tx, ty, 14, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },
  blur: () => false,
  // 0: the line's tip on screen; 1: the world's origin (the camera)
  track(S) { return [[S.tip[0] - S.cam, S.tip[1]], [960 - S.cam, 540]]; },
};

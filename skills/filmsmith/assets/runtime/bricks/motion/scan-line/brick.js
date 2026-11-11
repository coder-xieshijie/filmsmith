// scan-line — a machine reads a still picture: a band of light sweeps a document back and forth with a tail that stretches
// with its speed (band), or one line crosses a page top to bottom at constant speed with a wash behind it (line).
// Scenes ask `crossAt(y)` when the line passes a block, so what reacts reacts after the light has reached it.
// Adapted from video-shotcraft demos/effects/scan-bracket-sweep/ScanBracketSweep.tsx (card
// references/shots/effects/scan-bracket-sweep.md), demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx (card
// references/shots/effects/scanline-annotate-focus.md) and demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx
// (card references/shots/effects/scanline-assemble-flyin.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0. Changes: rewritten as a HyperFrames brick (no React or Remotion); the light of the three shots is one
// brick with two modes; colours by role (the light is the accent); brand, demo documents, pages and status rows removed
// (the scene's); the brackets are reticle-lock's, the docking of parts the scenes'.
// Mode 'develop' (from demos/ui-entrance/wall-reveal-moves/WireframeDrawOn.tsx, same repo and commit): a vertical line
// sweeps left to right in 30 frames (0.55, 0, 0.25, 1) and the `to` picture develops behind it out of the `from` (the
// wireframe); one value is both the line and the clip edge; the line fades in over 6 frames before and out over 8 after,
// with a 260 px afterglow behind it. The wireframe drawn group by group is the scene's (outline-trace); by default the
// `from` is a pale proof of the `to`.
import { bez, canvasOf, clamp, lerp, mix, rgba, rrect, seg } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { painterOf } from '../../sample.js';

const inOutSin = (x) => 0.5 - Math.cos(Math.PI * clamp(x)) / 2;
// Frames of each mode: band = upstream scan-bracket-sweep 23–149 (fade in, five passes, fade out); line = upstream
// scanline-annotate-focus 2–88 (fade in, constant crossing 6–80, fade out).
export const MODES = { band: { frames: 126, f0: 23 }, line: { frames: 86, f0: 2 }, develop: { frames: 44, f0: 0 } };
// line mode's crossing, in the brick's own frames: its length, the frames the line crosses between (constant speed), the
// fade-in [start, frames] and the fade-out's frames after the crossing. Default: scanline-annotate-focus; `cross` sets it
// (scanline-assemble-flyin: { frames: 102, at: [8, 92], fadeIn: [3, 6], fadeOut: 10 }).
const LINE = { frames: 86, at: [4, 78], fadeIn: [0, 5], fadeOut: 8 };
const crossOf = (P) => ({ ...LINE, ...(P.cross || {}) });
// line mode's look; `lineLook` sets it (default: the 3 px accent core with two glows, the wash and dots behind, inside the rect)
const LOOK = { core: 3, color: 'accent', glow: [[10, 0.55], [28, 0.3]], reach: 0, behind: 'wash', band: 140, grid: [24, 120] };
const DEV = bez(0.55, 0, 0.25, 1);

// Where the light is at p: { y (film px), dir, on (opacity), speed (0–1 of the band's peak) }.
export const lightAt = (p, P) => {
  const [x0, y0, w, h] = P.rect;
  if (P.mode === 'develop') {   // x: where the line and the developed edge are
    const f = p * MODES.develop.frames, u = DEV(clamp((f - 6) / 30));
    return { x: x0 + u * w, y: y0 + h / 2, dir: 1, on: ramp(f, 0, 6, 'out') * (1 - ramp(f, 36, 8, 'exit')), speed: u > 0 && u < 1 ? 1 : 0 };
  }
  if (P.mode === 'line') {
    const X = crossOf(P), f = p * X.frames, u = clamp((f - X.at[0]) / (X.at[1] - X.at[0]));
    const on = ramp(f, X.fadeIn[0], X.fadeIn[1], 'out') * (1 - ramp(f, X.at[1], X.fadeOut, 'exit'));
    return { y: y0 + lerp(P.over[0], h + P.over[1], u), dir: 1, on, speed: u > 0 && u < 1 ? 1 : 0 };
  }
  const t = (p * MODES.band.frames + 23) / 149, n = P.passes;
  const at = (tt) => { const raw = seg(tt, 0.17, 0.95) * n, i = Math.min(n - 1, Math.floor(raw)), local = clamp((raw - i) / 0.88), dir = i % 2 === 0 ? 1 : -1, q = inOutSin(local); return { y: dir > 0 ? q * h : h - q * h, dir }; };
  const { y, dir } = at(t), dt = 1 / 149;
  const peak = (h * Math.PI) / 2 / (((0.78 * 150) / n) * 0.88);
  const speed = clamp(Math.abs(at(t + dt / 2).y - at(t - dt / 2).y) / peak);
  return { y: y0 + y, dir, on: seg(t, 0.16, 0.2) * (1 - seg(t, 0.93, 0.99)), speed };
};
// The progress p at which the light first reaches film y (line mode; band mode: the first downward pass; develop: film x).
export const crossAt = (y, P) => {
  const [x0, y0, w, h] = P.rect;
  if (P.mode === 'develop') { const q = clamp((y - x0) / w); let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (DEV(m) < q) lo = m; else hi = m; } return clamp((6 + 30 * hi) / MODES.develop.frames); }
  if (P.mode === 'line') { const X = crossOf(P), a = P.over[0], b = h + P.over[1]; return clamp((X.at[0] + ((y - y0 - a) / (b - a)) * (X.at[1] - X.at[0])) / X.frames); }
  const n = P.passes, q = clamp((y - y0) / h), local = Math.acos(1 - 2 * q) / Math.PI * 0.88, t = 0.17 + (local / n) * 0.78;
  return clamp((t * 149 - 23) / MODES.band.frames);
};

// line mode with `lineLook`: what lies behind the line (the wash and dots, or a band of lit grid fading up to it, or
// nothing) inside the rect, then the core with its glows, `reach` px past the rect on each side, its ends fading out.
const paintLine = (ctx, S, P) => {
  const L = { ...LOOK, ...P.lineLook }, C = P.colors, c = C.accent, [x, y0, w, h] = P.rect, y = S.y, core = C[L.color] || L.color;
  ctx.save(); rrect(ctx, x, y0, w, h, P.radius); ctx.clip(); ctx.globalAlpha = S.on;
  if (L.behind === 'wash') {
    const g = ctx.createLinearGradient(0, y - L.band, 0, y);
    g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.6, rgba(c, 0.05)); g.addColorStop(1, rgba(c, 0.13));
    ctx.fillStyle = g; ctx.fillRect(x, y - L.band, w, L.band);
    if (P.dots) for (let r = Math.ceil((y - 90 - y0 - 9) / 18); y0 + 9 + r * 18 < y; r++) {
      const cy = y0 + 9 + r * 18, a = 0.44 * clamp((cy - (y - 90)) / 90); if (a <= 0) continue;
      ctx.fillStyle = rgba(c, a); for (let cx = x + 9; cx < x + w; cx += 18) { ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill(); }
    }
  } else if (L.behind === 'grid') {
    // the lit grid (fine and major lines from the rect's corner), faded in from `band` px above the line to the line
    const [fine, major] = L.grid, top = y - L.band, cv = canvasOf(w, L.band + 2), g2 = cv.getContext('2d');
    g2.translate(-x, -top);
    g2.fillStyle = rgba(c, 0.22);
    for (let gx = x; gx < x + w; gx += fine) g2.fillRect(gx, top, 1, L.band + 2);
    for (let gy = y0 + Math.ceil((top - y0) / fine) * fine; gy < y + 2; gy += fine) g2.fillRect(x, gy, w, 1);
    g2.fillStyle = rgba(mix(c, C.paper || '#ffffff', 0.5), 0.4);
    for (let gx = x; gx < x + w; gx += major) g2.fillRect(gx, top, 1.5, L.band + 2);
    for (let gy = y0 + Math.ceil((top - y0) / major) * major; gy < y + 2; gy += major) g2.fillRect(x, gy, w, 1.5);
    const m = g2.createLinearGradient(0, top, 0, y); m.addColorStop(0, rgba('#000000', 0)); m.addColorStop(1, '#000000');
    g2.globalCompositeOperation = 'destination-in'; g2.fillStyle = m; g2.fillRect(x, top, w, L.band + 2);
    ctx.drawImage(cv, x, top);
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = S.on;
  const x0 = x - L.reach, x1 = x + w + L.reach, k = ctx.createLinearGradient(x0, 0, x1, 0), edge = L.reach > 0;
  k.addColorStop(0, rgba(core, edge ? 0 : 1)); k.addColorStop(0.08, mix(core, c, 0.12)); k.addColorStop(0.5, core); k.addColorStop(0.92, mix(core, c, 0.12)); k.addColorStop(1, rgba(core, edge ? 0 : 1));
  for (const [b, a] of [...L.glow].sort((p, q) => q[0] - p[0])) { ctx.shadowColor = rgba(c, a); ctx.shadowBlur = b; ctx.fillStyle = k; ctx.fillRect(x0, y - L.core / 2, x1 - x0, L.core); }
  ctx.restore();
};

export default {
  id: 'scan-line', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: 126 / 15,
  beatsFor: (P) => (P.mode === 'line' ? crossOf(P).frames : (MODES[P.mode] || MODES.band).frames) / 15,
  surface: ['canvas'],
  roles: ['accent', 'ground', 'paper'],
  from: 'a still picture (a document, a page) in the scene',
  to: 'the same picture, read',
  interpolates: ['band: y over n passes, each in-out sine with a 12 % pause at its end; tail length ∝ speed^0.75, on the side it came from', 'line: y at constant speed (`cross` sets its frames), wash, a lit grid band or nothing behind it (`lineLook`)', 'light fades in and out'],
  summary: 'A machine reads a still picture: a band of light sweeps it back and forth with a speed-stretched tail, or one line crosses it at constant speed with a wash behind.',
  theory: 'Only the light moves, so the picture reads as being examined rather than loading (figure–ground: the still document is the figure); constant speed is mechanical, without intention (the upstream finding), and anything that reacts after the line has passed it reads as caused by it (Michotte, launching).',
  sceneRest: true,
  defaults: () => ({ mode: 'band', from: { scene: 'page' }, to: null, rect: [0, 0, 1920, 1080], radius: 26, passes: 5, over: [-20, 20], tail: 328, core: 5, glow: 40, wash: 140, dots: true, cross: null, lineLook: null }),
  prepare(P) {
    const s = painterOf(P.from, P) || ((ctx) => { ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); });   // no picture: the ground
    if (P.mode !== 'develop') return { from: s, to: s };
    const pic = painterOf(P.to || { scene: 'page' }, P), to = (ctx) => { ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); pic(ctx); };   // opaque, so it covers the wireframe
    // the default wireframe: the picture as a pale grey proof on the ground
    // (painted once, then laid down faint: a painter sets its own alpha, so it cannot be faded while it paints)
    const cv = canvasOf(1920, 1080); pic(cv.getContext('2d', { willReadFrequently: true }));
    const proof = (ctx) => { ctx.save(); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); ctx.globalAlpha = 0.28; ctx.filter = 'grayscale(1)'; ctx.drawImage(cv, 0, 0); ctx.restore(); };
    return { from: P.from ? s : proof, to };
  },
  rest(side, P) { return { p: side === 'from' ? 0 : 1, ...lightAt(side === 'from' ? 0 : 1, P), on: 0 }; },
  at(p, P) { return { p, ...lightAt(p, P) }; },
  paint(ctx, S, P, D) {
    D.from(ctx);
    if (P.mode === 'develop') {
      const [x, y0, w, h] = P.rect, c = P.colors.accent, lx = S.x;
      if (lx > x) { ctx.save(); ctx.beginPath(); ctx.rect(x, y0, lx - x, h); ctx.clip(); D.to(ctx); ctx.restore(); }
      if (S.on <= 0.001) return;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y0, w, h); ctx.clip(); ctx.globalAlpha = S.on;
      const g = ctx.createLinearGradient(lx - 260, 0, lx, 0);   // the afterglow behind the line
      g.addColorStop(0, rgba(c, 0)); g.addColorStop(1, rgba(c, 0.16)); ctx.fillStyle = g; ctx.fillRect(lx - 260, y0, 260, h);
      ctx.shadowColor = rgba(c, 0.6); ctx.shadowBlur = 12; ctx.fillStyle = c; ctx.fillRect(lx - 2, y0, 4, h);
      ctx.shadowColor = rgba(c, 0.35); ctx.shadowBlur = 36; ctx.fillRect(lx - 2, y0, 4, h);
      ctx.restore();
      return;
    }
    if (S.on <= 0.001) return;
    if (P.mode === 'line' && P.lineLook) return paintLine(ctx, S, P);
    const c = P.colors.accent, [x, y0, w, h] = P.rect, y = S.y;
    ctx.save();
    rrect(ctx, x, y0, w, h, P.radius); ctx.clip();
    ctx.globalAlpha = S.on;
    if (P.mode === 'band') {
      const tail = P.tail * Math.pow(S.speed, 0.75);     // the tail trails behind: above going down, below going up
      if (tail > 0.5) {
        const a = S.dir > 0 ? y - tail : y + tail, g = ctx.createLinearGradient(0, a, 0, y);
        g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.55, rgba(c, 0.06)); g.addColorStop(1, rgba(c, 0.2));
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(x, Math.min(a, y), w, tail); ctx.restore();
      }
      const g = ctx.createLinearGradient(0, y - P.glow / 2, 0, y + P.glow / 2);
      g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.5, rgba(c, 0.22)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; ctx.fillRect(x, y - P.glow / 2, w, P.glow);
      const k = ctx.createLinearGradient(x, 0, x + w, 0);
      k.addColorStop(0, rgba(c, 0.55)); k.addColorStop(0.18, c); k.addColorStop(0.5, mix(c, '#ffffff', 0.35)); k.addColorStop(0.82, c); k.addColorStop(1, rgba(c, 0.55));
      ctx.fillStyle = k; ctx.fillRect(x, y - P.core / 2, w, P.core);
    } else {
      // behind the line: the read wash (140 px) and a dot field fading in toward the line (90 px), then the 3 px core
      const g = ctx.createLinearGradient(0, y - P.wash, 0, y);
      g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.6, rgba(c, 0.05)); g.addColorStop(1, rgba(c, 0.13));
      ctx.fillStyle = g; ctx.fillRect(x, y - P.wash, w, P.wash);
      if (P.dots) {
        for (let r = Math.ceil((y - 90 - y0 - 9) / 18); y0 + 9 + r * 18 < y; r++) {
          const cy = y0 + 9 + r * 18, a = 0.55 * 0.8 * clamp((cy - (y - 90)) / 90);
          if (a <= 0) continue;
          ctx.fillStyle = rgba(c, a);
          for (let cx = x + 9; cx < x + w; cx += 18) { ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      ctx.save(); ctx.shadowColor = rgba(c, 0.55); ctx.shadowBlur = 10; ctx.fillStyle = c; ctx.fillRect(x, y - 1.5, w, 3);
      ctx.shadowColor = rgba(c, 0.3); ctx.shadowBlur = 28; ctx.fillRect(x, y - 1.5, w, 3); ctx.restore();
    }
    ctx.restore();
  },
  blur() { return false; },
  track(S, P) { return P.mode === 'develop' ? [[S.x, S.y]] : [[P.rect[0] + P.rect[2] / 2, S.y]]; },
};

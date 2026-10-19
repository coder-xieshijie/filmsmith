// beam-trace — the old picture is no longer refreshed and fades as phosphor does (exponential afterglow); a blanked
// beam returns and draws the new path with its glowing tail, each drawn point flaring and settling; the new reading
// lands bright and settles. Theory: phosphor persistence decays exponentially; a beam is how vector displays really
// draw (Braun 1897 onward). references/transitions.md#beam-trace.

import { seg, decay, mix, text, ground } from './util.js';
import { measurePath } from './paths.js';

const DECAY = [0, 0.42], SWEEP = [0.3, 0.78], DOT_OUT = [0.78, 0.86], LAND = 0.8;

// phosphor stroke: wide glow, mid glow, core (additive)
const glow = (ctx, pts, I, C, core) => {
  if (I < 0.01 || pts.length < 2) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = C.deep; ctx.globalAlpha = 0.1 * I; ctx.lineWidth = 16; ctx.stroke();
  ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.3 * I; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = core; ctx.globalAlpha = Math.min(1, 0.95 * I); ctx.lineWidth = 2.4; ctx.stroke();
  ctx.globalAlpha = 1;
};
const beamDot = (ctx, x, y, a) => {
  if (a < 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 34);
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.18, `rgba(220,235,255,${0.8 * a})`);
  g.addColorStop(0.5, `rgba(136,191,255,${0.22 * a})`); g.addColorStop(1, 'rgba(136,191,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 34, y - 34, 68, 68);
};

// default old picture: a clipped, tangled trace (a Lissajous with flattened tops) under a word, at intensity I
const tangle = (u) => {
  const a = u * Math.PI * 2, y = 205 * (0.78 * Math.sin(6 * a) + 0.22 * Math.sin(17 * a + 1));
  return [960 + 430 * (0.74 * Math.sin(5 * a + 0.6) + 0.26 * Math.sin(13 * a)), 680 + Math.max(-150, Math.min(150, y))];
};
const oldPicture = (ctx, P, I) => {
  const C = P.colors;
  text(ctx, 'Clipped.', 194, 300, P.font, { color: C.ink, alpha: I });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const M = 240, sub = 6;
  for (let j = 0; j < M; j++) {
    const pts = [];
    for (let k = 0; k <= sub; k++) pts.push(tangle((j + k / sub) / M));
    glow(ctx, pts, 0.5 * I, C, C.accent);
  }
  ctx.restore();
};
const newReading = (ctx, P, color) => { text(ctx, 'Clean.', 194, 300, P.font, { color }); };

// default new path: a clean sine (the time base), then a lead-in and a rounded-square mark with its level line
const defaultPath = () => {
  const pts = [], CY = 680, X0 = 200, X1 = 1440;
  for (let x = X0; x <= X1; x += 4) pts.push([x, CY - 150 * Math.sin((2 * Math.PI * (x - X0)) / 310)]);
  const L = 1510, R = 1710, T = 580, B = 780, r = 26;
  const line = (x0, y0, x1, y1) => { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6)); for (let i = 1; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]); };
  const arc = (cx, cy, a0, a1) => { for (let i = 1; i <= 8; i++) { const a = a0 + ((a1 - a0) * i) / 8; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  line(X1, CY, L, CY);
  line(L, CY, L, T + r); arc(L + r, T + r, Math.PI, 1.5 * Math.PI);
  line(L + r, T, R - r, T); arc(R - r, T + r, 1.5 * Math.PI, 2 * Math.PI);
  line(R, T + r, R, B - r); arc(R - r, B - r, 0, 0.5 * Math.PI);
  line(R - r, B, L + r, B); arc(L + r, B - r, 0.5 * Math.PI, Math.PI);
  line(L, B - r, L, CY);
  line(L, CY, R, CY);
  return pts;
};

export default {
  name: 'beam-trace',
  tier: 'T1',
  beats: 3,
  modes: ['phosphor'],
  roles: ['ground', 'ink', 'accent', 'deep', 'hi'],
  from: 'the old picture on the phosphor (a trace, a reading)',
  to: 'the new path drawn by the beam, the new reading settled',
  interpolates: ['old picture intensity (afterglow)', 'beam position along the new path', 'flare of each drawn point', 'new reading brightness'],
  summary: 'The old picture fades as phosphor afterglow; the beam returns and draws the new path, then the new reading settles.',
  theory: 'Phosphor persistence decays exponentially; vector displays draw with a moving beam (Braun 1897 onward).',
  defaults: {
    path: null,                          // [[x, y], ...] the beam draws at constant speed; default a sine then a mark
    from: oldPicture,                    // (ctx, P, intensity) => the old picture at that intensity
    to: newReading,                      // (ctx, P, color) => the new reading in that colour (flares to white, settles)
    font: { family: 'sans-serif', weight: 800, size: 140, spacing: -2 },
    colors: { ground: '#04080C', ink: '#E6EEF6', accent: '#88BFFF', deep: '#3F86D6', hi: '#DCEBFF' },
  },
  prepare(P) {
    const path = measurePath(P.path || defaultPath());
    // each point's draw time in p (constant beam speed along the path)
    return { path, at: path.cum.map((c) => SWEEP[0] + (SWEEP[1] - SWEEP[0]) * (c / path.len)) };
  },
  rest(side) { return { p: side === 'from' ? 0 : 1 }; },
  at(p) { return { p }; },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors, p = S.p, I = decay(seg(p, ...DECAY), 3.2);
    if (I > 0) P.from(ctx, P, I);
    const pts = D.path.pts, at = D.at;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (p > SWEEP[0]) {
      const CH = 6;
      for (let i = 0; i < pts.length - 1; i += CH) {
        if (at[i] > p) break;
        const chunk = [];
        for (let k = i; k <= Math.min(i + CH, pts.length - 1); k++) {
          if (at[k] <= p) chunk.push(pts[k]);
          else { const f = (p - at[k - 1]) / (at[k] - at[k - 1]); chunk.push([pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f]); break; }
        }
        const s = at[Math.min(i + (CH >> 1), pts.length - 1)];
        glow(ctx, chunk, 0.62 + 0.38 * decay(seg(p, s, s + 0.16), 3), C, C.hi);
      }
      if (p < DOT_OUT[1]) {
        let hx = pts[pts.length - 1][0], hy = pts[pts.length - 1][1];
        for (let k = 1; k < pts.length; k++) if (at[k] > p) { const f = Math.max(0, (p - at[k - 1]) / (at[k] - at[k - 1])); hx = pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f; hy = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f; break; }
        beamDot(ctx, hx, hy, decay(seg(p, ...DOT_OUT), 3));
      }
    }
    ctx.restore();
    if (p >= LAND) {
      const e = decay(seg(p, LAND, 1), 2.5);
      if (e > 0.02) {
        ctx.save(); ctx.filter = 'blur(10px)'; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7 * e;
        P.to(ctx, P, C.accent);
        ctx.restore();
      }
      P.to(ctx, P, mix(C.ink, '#FFFFFF', e));
    }
  },
};

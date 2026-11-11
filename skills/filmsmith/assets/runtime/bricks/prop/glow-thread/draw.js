// draw.js — the stream thread's pure drawing kit, shared by its engine and by every stream brick: the one stroke drawn in
// three passes (a 16 px haze and a 7 px body in the accent, a 2.6 px core in the glow colour), the radial glow, the star
// (a soft halo and a white-hot core), the arc a star travels along, and the path tools (Catmull-Rom, arc length).
// From the stream template: film.js thread, glow, star, arcPts, straight; plan.js E, seg, catmull, cumLen, atLen, subPath.
// The palette as the template names it (palOf): line is the accent, text the ink on the night, ink the ink on paper.
import LOOK from '../../look/night-sky/look.js';
import { rgbOf, glowAt } from '../../look/night-sky/texture.js';

export const W = 1920, H = 1080;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  out3: (k) => 1 - Math.pow(1 - k, 3), in3: (k) => k * k * k,
  io2: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  io3: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
};

// The look's roles (library names) as the template's palette.
export const ROLES = ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent', 'paper', 'onPaper', 'onPaper2', 'field', 'fieldEdge', 'dust', 'glow', 'core', 'panel2', 'bubble', 'user', 'onUser', 'rule', 'accentInk', 'desk1', 'desk2', 'desk3', 'deskBar', 'warn'];
export const palOf = (colors, id = 'night') => {
  const base = (LOOK.palettes.find((p) => p.id === String(id || '').replace(/^night-sky\//, '')) || LOOK.palettes[0]).roles;
  // roles a look of another style leaves out come from this look's preset (a neutral palette has no glow, desk, …)
  const r = { ...base };
  for (const [k, v] of Object.entries(colors || {})) if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) r[k] = v;
  const P = {
    ground: r.ground, field: r.field, fieldEdge: r.fieldEdge, dust: r.dust, line: r.accent, glow: r.glow, core: r.core, onLine: r.onAccent,
    text: r.ink, text2: r.dim, panel: r.panel, panel2: r.panel2, paper: r.paper, bubble: r.bubble, ink: r.onPaper, ink2: r.onPaper2,
    user: r.user, onUser: r.onUser, rule: r.rule, accentInk: r.accentInk, desk1: r.desk1, desk2: r.desk2, desk3: r.desk3, deskBar: r.deskBar,
    warn: r.warn || r.accentInk,
  };
  const C = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, rgbOf(v)]));
  P.rgb = C;
  return { P, C };
};

export const glow = glowAt;
// the thread: one stroke, three passes for its glow; a the opacity, w the width factor
export const thread = (ctx, C, pts, a, w = 1) => {
  if (pts.length < 2 || a <= 0.002) return;
  [[16 * w, 0.07, C.line], [7 * w, 0.22, C.line], [2.6 * w, 0.95, C.glow]].forEach(([lw, al, col]) => {
    ctx.strokeStyle = `rgba(${col},${al * a})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  });
};
export const star = (ctx, C, x, y, s, a) => { glow(ctx, x, y, 26 * s, C.glow, 0.55 * a); glow(ctx, x, y, 6 * s, C.core, a); };
// a point of light on the thread (a hook, a knot, the head): the halo r in the glow colour and a small core
export const knot = (ctx, C, x, y, r, a = 1, core = 6) => { glow(ctx, x, y, r, C.glow, 0.7 * a); glow(ctx, x, y, core, C.core, a); };
export const cubic = (p0, p1, p2, p3, u) => { const v = 1 - u; return [0, 1].map((d) => v * v * v * p0[d] + 3 * v * v * u * p1[d] + 3 * v * u * u * p2[d] + u * u * u * p3[d]); };
// the arc a star travels from a (on the thread) to b (its place in the sky), sampled from u0 to u1
export const arcPts = (a, b, u0 = 0, u1 = 1, n = 40) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const c1 = [a[0] + dx * 0.4, a[1] - Math.abs(dx) * 0.1 + dy * 0.1], c2 = [a[0] + dx * 0.75, b[1]]; const out = []; for (let k = 0; k <= n; k++) out.push(cubic(a, c1, c2, b, lerp(u0, u1, k / n))); return out; };
export const straight = (a, b, n = 24) => Array.from({ length: n + 1 }, (_, k) => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
export const catmull = (p, steps) => {
  const out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  out.push(p[p.length - 1]);
  return out;
};
export const cumLen = (pts) => { const Ls = [0]; for (let i = 1; i < pts.length; i++) Ls.push(Ls[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return Ls; };
export const atLen = (pts, Ls, d) => { let j = 0; while (j < Ls.length - 2 && Ls[j + 1] < d) j++; const f = clamp((d - Ls[j]) / Math.max(1e-6, Ls[j + 1] - Ls[j])); return [lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f)]; };
export const subPath = (pts, Ls, d0, d1) => { const out = [atLen(pts, Ls, d0)]; for (let i = 0; i < pts.length; i++) if (Ls[i] > d0 && Ls[i] < d1) out.push(pts[i]); out.push(atLen(pts, Ls, d1)); return out; };
export const nearest = (pts, Ls, x, y) => { let bd = 1e9, bi = 0; pts.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; bi = i; } }); return Ls[bi]; };
// a layer: an offscreen 1920 × 1080 canvas the engine composes (the template's stacked canvases and DOM layers)
export const layer = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); return x; };

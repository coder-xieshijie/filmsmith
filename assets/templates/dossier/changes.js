// changes.js — the page changes an exhibit may arrive by (content.js `enter`), as one registry. A change runs in the
// last beat of the scene before the exhibit (choreo.js outSec) and is one T2 device of the film.
//
//   level 'sheet'  the outgoing sheet alone is transformed (the mat, the claims and the sheet underneath keep their
//                  own motion): draw(ctx, { sheet, x, y, w, h, p, opts }) paints the outgoing sheet's canvas at
//                  progress p ∈ [0, 1] (linear; the change applies its own easing)
//   level 'frame'  the whole frame changes: draw(ctx, { from, to, p, opts, palette }) mixes two finished frames
//                  (canvases of 1920 × 1080). Every frame-level transition of lib/transitions is one of these, under its
//                  own name (references/transitions.md lists them), drawn by WebGL
//
// Built in: 'turn' (dossier-page-turn: the sheet turns away over its top or left edge, `edge` in content.js, to show
// the sheet underneath). 'deal' (the default: the old sheet slides off, the new one is dealt on) is not a change but
// ordinary sheet motion, drawn by film.js. More changes plug in with register(name, def), e.g. from a module of the
// workshop's next transition set; a registered change must name its device id (`device`) and be listed in
// timing.rules.js `devices` so lib/fit.mjs knows it.
import { list as libList, createTransitions } from './lib/transitions/index.js';

const REG = new Map();
export const register = (name, def) => {
  if (!def || !['sheet', 'frame'].includes(def.level) || typeof def.draw !== 'function') throw new Error(`register("${name}"): { level: 'sheet' | 'frame', draw }`);
  REG.set(name, def);
};

const easeIn2 = (u) => u * u;

// dossier-page-turn. The sheet rotates about its top edge (rotateX) or left edge (rotateY) to 89°, with a perspective
// of 2200 px from the hinge, easing in (power2.in: it leaves slowly and is gone edge-on on the boundary). Drawn in
// strips of 3 px: each strip is projected and scaled about the hinge's middle. The page darkens as it tilts (up to
// 28 % ink at edge-on), so the sheet underneath reads as lit.
const F = 2200, STRIP = 3;
const turn = {
  level: 'sheet',
  device: 'dossier-page-turn',
  draw: (ctx, { sheet, x, y, w, h, p, opts = {} }) => {
    const th = easeIn2(Math.min(1, Math.max(0, p))) * (89 * Math.PI) / 180;
    if (th >= (88.9 * Math.PI) / 180) return;
    const s = Math.sin(th), c = Math.cos(th);
    ctx.save();
    if ((opts.edge ?? 'top') === 'left') {
      const cy = h / 2;
      for (let u = 0; u < w; u += STRIP) {
        const u1 = Math.min(w, u + STRIP);
        const k0 = F / (F + u * s), k1 = F / (F + u1 * s);
        const x0 = u * c * k0, x1 = u1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(sheet, u, 0, u1 - u, h, x + x0, y + cy - cy * k, Math.max(0.5, x1 - x0 + 0.35), h * k);
      }
      ctx.globalAlpha = 0.28 * s;
      ctx.fillStyle = opts.shade ?? '#000';
      ctx.beginPath();
      const kw = F / (F + w * s);
      ctx.moveTo(x, y); ctx.lineTo(x + w * c * kw, y + cy - cy * kw); ctx.lineTo(x + w * c * kw, y + cy + cy * kw); ctx.lineTo(x, y + h);
      ctx.fill();
    } else {
      const cx = w / 2;
      for (let v = 0; v < h; v += STRIP) {
        const v1 = Math.min(h, v + STRIP);
        const k0 = F / (F + v * s), k1 = F / (F + v1 * s);
        const y0 = v * c * k0, y1 = v1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(sheet, 0, v, w, v1 - v, x + cx - cx * k, y + y0, w * k, Math.max(0.5, y1 - y0 + 0.35));
      }
      ctx.globalAlpha = 0.28 * s;
      ctx.fillStyle = opts.shade ?? '#000';
      const kh = F / (F + h * s);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + cx + cx * kh, y + h * c * kh); ctx.lineTo(x + cx - cx * kh, y + h * c * kh);
      ctx.fill();
    }
    ctx.restore();
  },
  // the hinge-opposite edge's travel at p (px), for the motion blur's speed
  travel: ({ w, h, p, opts = {} }) => {
    const th = easeIn2(Math.min(1, Math.max(0, p))) * (89 * Math.PI) / 180, d = (opts.edge ?? 'top') === 'left' ? w : h;
    return d - d * Math.cos(th) * (F / (F + d * Math.sin(th)));
  },
};
register('turn', turn);

// Every frame-level transition of lib/transitions, by its own name.
let TX = null;
const LIB = new Set(libList.filter((d) => d.tier !== 'T0').map((d) => d.name));
export const changeOf = (name) => {
  if (REG.has(name)) return REG.get(name);
  if (!LIB.has(name)) return null;
  return {
    level: 'frame',
    device: name,
    draw: (ctx, { from, to, p, opts = {}, palette: P }) => {
      if (!TX) TX = createTransitions(null);
      if (!TX) throw new Error('WebGL is not available: the page change cannot be drawn');
      ctx.drawImage(TX.draw(name, from, to, p, { colors: { ink: P.ink, accent: P.accent, ground: P.mat, paper: P.paper }, ...opts }), 0, 0);
    },
  };
};
export const names = () => [...REG.keys(), ...LIB];

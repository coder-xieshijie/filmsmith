// grain-condense — a line of text boils into grain under a hatched selection box, the grain cloud collapses into a
// shorter, larger mark, and the displacement dies out until the mark stands sharp with a soft glow.
// Adapted from video-shotcraft demos/outro/grain-dissolve/GrainDissolve.tsx (card references/shots/outro/grain-dissolve.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion, no SVG filter): the feTurbulence + feDisplacementMap
// chain is a per-pixel displacement of the two text masks by seeded block noise (rng.js hash, re-seeded 46 times over
// the move like the upstream's seed = floor(t·46)), the two-layer bloom is two blurred, tinted copies of that layer;
// colours by role (text and bloom in ink tinted toward the accent, box and HUD in line and dim); brand name and demo
// copy removed (both texts are parameters, the box is sized from the line); the HUD corners are optional.
import { clamp, lerp, mix, rgba, ground, measure, text, canvasOf } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { fontFor } from '../../lang.js';
import { look, copy } from '../../sample.js';

const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t) => 1 - Math.pow(1 - t, 3);
const inCubic = (t) => t * t * t;
const inQuart = (t) => t * t * t * t;
const seg = (t, a, b, e = (x) => x) => e(clamp((t - a) / (b - a)));
// the region the grain can reach (film px); the text sits on its centre line
const RX = 120, RY = 360, RW = 1680, RH = 380, CY = 540;
const SAND = 150;

export default {
  id: 'grain-condense', kind: 'motion',
  tier: 'T2', family: 'shape', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'line', 'accent'],
  from: 'a line of text on the ground (a sentence, a claim with the product name in it)',
  to: 'a shorter, larger mark in its place (the product name, a word), sharp with a soft glow',
  interpolates: ['displacement 0 → ±78 px → 0 (block noise re-seeded 46 times)', 'line → mark crossfade inside the boil', 'mark scale 1.06 → 1', 'bloom 0 → 1 → 0.55', 'selection box width 20 % → 100 % → gone', '150 loose grains blown out and drawn back'],
  summary: 'A line of text boils into grain under a selection box and the cloud condenses into a larger mark that sets sharp and glowing.',
  theory: 'Loss of form then closure (Wertheimer 1923): the line falls apart into grain the eye can still group, so the cloud reads as the same stuff when it collapses into the shorter word; the swap happens at peak noise where no letter can be read, so two texts are never seen together (C5).',
  defaults: (ctx = {}) => {
    const zh = ctx.lang === 'zh';
    return { from: { text: zh ? `{ ${copy('product', 'zh')} 正式上线 }` : `{ ${copy('product', 'en')}. Now live }` }, to: { text: copy('product', ctx.lang || 'en') },
      hud: true, box: null, size: { from: 78, to: 132 }, maxW: { from: 1240, to: 1240 }, seed: 7 };
  },
  prepare(P) {
    const L = P.lang || 'en', g = { w: RW, h: RH };
    const fit = (s, role, size, weight, maxW) => { let f = fontFor(look, role, L, size, weight, role === 'display' ? 'display' : null); const tmp = canvasOf(8, 8).getContext('2d'); const w = measure(tmp, s, f).width; if (w > maxW) f = fontFor(look, role, L, Math.floor((size * maxW) / w), weight, role === 'display' ? 'display' : null); return f; };
    const fa = fit(P.from.text, 'text', P.size.from, 500, P.maxW.from), fb = fit(P.to.text, 'display', P.size.to, 750, P.maxW.to);
    // two alpha masks over the region: the line and the mark (at scale 1, centred on the frame)
    const mask = (s, f, y) => { const c = canvasOf(g.w, g.h), x = c.getContext('2d', { willReadFrequently: true }); text(x, s, 960 - RX, y - RY, f, { color: '#ffffff', align: 'center' }); const d = x.getImageData(0, 0, g.w, g.h).data, a = new Float32Array(g.w * g.h); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] / 255; return a; };
    const A = mask(P.from.text, fa, CY + fa.size * 0.33), B = mask(P.to.text, fb, CY + fb.size * 0.36);
    const tmp = canvasOf(8, 8).getContext('2d'), lw = measure(tmp, P.from.text, fa).width;
    const box = P.box || [960 - lw / 2 - 72, CY - 93, lw + 144, 186];
    // loose grains: start in the line's band, blown out, drawn back into the mark's band
    const mw = measure(tmp, P.to.text, fb).width;
    const sand = Array.from({ length: SAND }, (_, i) => {
      const r = (k) => hash(i * 16 + k, P.seed), ang = r(3) * Math.PI * 2;
      return { hx: 960 + (r(1) - 0.5) * lw, hy: CY - 36 + r(2) * 78, dx: Math.cos(ang) * (24 + r(4) * 78), dy: Math.sin(ang) * (15 + r(5) * 42),
        tx: 960 + (r(6) - 0.5) * mw, ty: CY - 30 + r(7) * 84, size: (0.35 + r(8) * 0.75) * 3, alpha: 0.25 + r(9) * 0.6, lag: r(10) * 0.05, ph: r(11) * Math.PI * 2 };
    });
    const core = canvasOf(g.w, g.h);
    return { A, B, box, sand, core, cx: core.getContext('2d', { willReadFrequently: true }), buf: new ImageData(g.w, g.h), g1: canvasOf(g.w, g.h), g2: canvasOf(g.w, g.h) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const t = clamp(p);
    const burst = seg(t, 0.13, 0.28, outCubic), cond = seg(t, 0.6, 0.71, inOutCubic), lock = seg(t, 0.68, 0.9, outCubic), settle = seg(t, 0.88, 1, outCubic);
    const boxOut = seg(t, 0.55, 0.64, inCubic);
    return { t, burst, cond, lock, settle, glow: Math.max(0, burst * 0.3 + cond * 0.7 - settle * 0.45), boxOpen: burst * (1 - boxOut * 0.35), boxOp: Math.min(1, burst * 1.4) * (1 - boxOut),
      markScale: 1 + 0.06 * (1 - lock), streak: cond * (1 - seg(t, 0.74, 0.92, outCubic)), boil: Math.floor(t * 46), disp: burst * 156 * (1 - lock), soft: burst * 3.3 * (1 - lock), freq: 0.9 + burst * 0.4 };
  },
  // the text layer: both masks displaced by block noise, the mark scaled about the centre
  layer(S, P, D) {
    const { A, B, buf } = D, w = RW, h = RH, out = buf.data, ink = hexRgb(P.colors.ink);
    const cell = Math.max(2, Math.round(3 / S.freq * 0.9)), cw = Math.ceil(w / cell) + 1, ch = Math.ceil(h / cell) + 1;
    const nx = new Float32Array(cw * ch), ny = new Float32Array(cw * ch), seed = (P.seed | 0) * 977 + S.boil * 131;
    if (S.disp > 0.01) for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const k = j * cw + i, c2 = (j >> 1) * 4099 + (i >> 1);
      // two octaves of a narrow (triangular) spread: fractal noise sits near its middle, so most grains move a little
      nx[k] = 0.3 * (0.66 * (hash(k, seed) + hash(k, seed + 5) - 1) + 0.34 * (hash(c2, seed + 17) + hash(c2, seed + 19) - 1));
      ny[k] = 0.3 * (0.66 * (hash(k, seed + 3) + hash(k, seed + 7) - 1) + 0.34 * (hash(c2, seed + 29) + hash(c2, seed + 31) - 1));
    }
    const sa = 1 - S.cond, sb = S.cond, inv = 1 / S.markScale, ox = 960 - RX, oy = CY - RY;
    const bil = (M, x, y) => { if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) return 0; const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, i = yi * w + xi; return (M[i] * (1 - fx) + M[i + 1] * fx) * (1 - fy) + (M[i + w] * (1 - fx) + M[i + w + 1] * fx) * fy; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let sx = x, sy = y;
      if (S.disp > 0.01) { const k = ((y / cell) | 0) * cw + ((x / cell) | 0); sx += nx[k] * S.disp; sy += ny[k] * S.disp; }
      let a = 0;
      if (sa > 0.001) a += sa * (S.disp > 0.01 ? bil(A, sx, sy) : A[y * w + x]);
      if (sb > 0.001) a += sb * bil(B, ox + (sx - ox) * inv, oy + (sy - oy) * inv);
      const o = (y * w + x) * 4;
      out[o] = ink[0]; out[o + 1] = ink[1]; out[o + 2] = ink[2]; out[o + 3] = Math.round(clamp(a) * 255);
    }
    D.cx.putImageData(buf, 0, 0);
    return D.core;
  },
  paint(ctx, S, P, D) {
    const C = P.colors;
    ground(ctx, P);
    if (P.hud) this.hud(ctx, C);
    // selection box: opens from the centre line, leaves before the mark sets
    if (S.boxOp > 0.002) {
      const [bx, by, bw, bh] = D.box, k = 0.2 + 0.8 * S.boxOpen;
      ctx.save(); ctx.globalAlpha = S.boxOp; ctx.translate(960, 0); ctx.scale(k, 1); ctx.translate(-960, 0);
      ctx.fillStyle = rgba(C.accent, 0.035); ctx.fillRect(bx, by, bw, bh);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
      ctx.strokeStyle = mix(C.ground, C.line, 0.7); ctx.lineWidth = 2.4;
      for (let x = bx - bh; x < bx + bw; x += 102) { ctx.beginPath(); ctx.moveTo(x, by + bh); ctx.lineTo(x + bh, by); ctx.stroke(); }
      ctx.restore();
      ctx.restore();
      // the frame and its handles are not stretched (non-scaling stroke)
      const l = 960 + (bx - 960) * k, r = 960 + (bx + bw - 960) * k;
      ctx.save(); ctx.globalAlpha = S.boxOp;
      ctx.strokeStyle = mix(C.line, C.dim, 0.6); ctx.lineWidth = 2; ctx.strokeRect(l, by, r - l, bh);
      ctx.fillStyle = mix(C.ink, C.dim, 0.25);
      for (const [hx, hy] of [[l, by], [r, by], [l, by + bh], [r, by + bh]]) { ctx.fillRect(hx - 15, hy - 15, 15, 15); ctx.fillRect(hx, hy, 15, 15); }
      ctx.restore();
    }
    // one horizontal streak at the condensing peak
    if (S.streak > 0.002) {
      const g = ctx.createLinearGradient(210, 0, 1710, 0), hot = mix(C.ink, C.accent, 0.12), cold = mix(C.ink, C.accent, 0.45);
      g.addColorStop(0, rgba(cold, 0)); g.addColorStop(0.5, rgba(hot, 1)); g.addColorStop(1, rgba(cold, 0));
      ctx.save(); ctx.globalAlpha = S.streak; ctx.fillStyle = g;
      ctx.globalAlpha = S.streak * 0.12; ctx.beginPath(); ctx.ellipse(960, 546, 750, 21, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = S.streak * 0.7; ctx.beginPath(); ctx.ellipse(960, 546, 690, 2.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // loose grains: blown out with the boil, pulled back faster and faster, out as the mark sets
    for (const s of D.sand) {
      const pull = seg(S.t, 0.56 + s.lag, 0.71 + s.lag * 0.4, inQuart);
      const jitter = Math.sin(S.boil * 1.7 + s.ph) * 3.6 * S.burst * (1 - pull);
      const sx = s.hx + s.dx * S.burst, sy = s.hy + s.dy * S.burst + jitter;
      const a = s.alpha * S.burst * (1 - seg(S.t, 0.66, 0.8, outCubic)) * (0.55 + 0.45 * Math.abs(Math.sin(S.boil * 0.9 + s.ph)));
      if (a < 0.01) continue;
      ctx.beginPath(); ctx.arc(lerp(sx, s.tx, pull), lerp(sy, s.ty, pull), s.size * (1 - 0.4 * pull), 0, Math.PI * 2);
      ctx.fillStyle = rgba(mix(C.ink, C.accent, 0.12), a); ctx.fill();
    }
    // the text layer and its two blooms (tight and wide), tinted toward the accent
    const core = this.layer(S, P, D);
    const bloom = (cv, blur, color, alpha) => {
      if (alpha <= 0.002) return;
      const x = cv.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, RW, RH);
      x.filter = `blur(${blur.toFixed(2)}px)`; x.drawImage(core, 0, 0); x.filter = 'none';
      x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, RW, RH); x.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.drawImage(cv, RX, RY); ctx.restore();
    };
    bloom(D.g2, (5 + S.glow * 6) * 3, mix(C.ink, C.accent, 0.45), S.glow * 0.75);
    bloom(D.g1, (1.2 + S.glow * 1.6) * 3, mix(C.ink, C.accent, 0.15), 0.15 + S.glow * 0.95);
    ctx.save();
    if (S.soft > 0.05) ctx.filter = `blur(${S.soft.toFixed(2)}px)`;
    ctx.drawImage(core, RX, RY);
    ctx.restore();
  },
  hud(ctx, C) {
    ctx.save(); ctx.lineCap = 'square';
    for (const [x, y, sx, sy] of [[264, 288, 1, 1], [1656, 288, -1, 1], [264, 792, 1, -1], [1656, 792, -1, -1]]) {
      ctx.strokeStyle = C.line; ctx.lineWidth = 3.3; ctx.beginPath(); ctx.moveTo(x + 42 * sx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + 42 * sy); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.beginPath(); ctx.arc(x + 102 * sx, y + 84 * sy, 3.9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = C.line; ctx.lineWidth = 3.3; ctx.setLineDash([12, 9]);
    for (const [a, b] of [[156, 228], [1692, 1764]]) { ctx.beginPath(); ctx.moveTo(a, 540); ctx.lineTo(b, 540); ctx.stroke(); }
    ctx.restore();
  },
  // the selection box's top corners (compare pairs them with the upstream box)
  track(S, P, D) { const [bx, by, bw] = D.box, k = 0.2 + 0.8 * S.boxOpen; return [[960 + (bx - 960) * k, by], [960 + (bx + bw - 960) * k, by]]; },
  blur() { return false; },
};

function hexRgb(h) { const v = parseInt(h.slice(1, 7), 16); return [v >> 16, (v >> 8) & 255, v & 255]; }

// outline-write — a widely spaced wordmark writes itself: every letter's outline starts on the same frame, grows as one
// continuous line and closes on the same frame; a brief glow as it closes.
// Adapted from video-shotcraft demos/opening/letterspace-materialize/LetterspaceMaterialize.tsx (card references/shots/opening/letterspace-materialize.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the letters are the film's own font, drawn as
// outlines (canvas strokeText under a growing dash, every contour of a glyph starting at once) instead of thirteen
// hand-drawn single-line skeleton glyphs that only spell the upstream brand; each grapheme's dash is normalised to its
// longest contour (measured in prepare), so all graphemes close on the same frame; an optional fill lets a heavy face
// crystallise solid; colour by role (ink, its glow); the dusk lake, ridges, water glints and the reflection are the
// scene's and the style's; brand removed.
import { clamp, rgba, ground, canvasOf, fontOf, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

// Upstream frames (30 fps): the line grows over 52 frames from frame 16 (here p = 0) on a hand-writing curve, the glow
// gathers over its last 30 % and falls over 14 frames after it closes (frame 82, here p = 1).
const F = { draw: 52, glow: 14 };
F.frames = F.draw + F.glow;
const stroke = bez(0.5, 0, 0.3, 1);
const DASH_GAP = 100000;

// The longest contour of one grapheme, in px: the shortest dash under which the dashed outline covers the full one.
const longest = (g, f, w, h, lw) => {
  const cv = canvasOf(Math.ceil(w), Math.ceil(h)), c = cv.getContext('2d', { willReadFrequently: true });
  const draw = (d) => {
    c.clearRect(0, 0, cv.width, cv.height);
    c.font = fontOf(f); c.lineWidth = lw; c.strokeStyle = '#000000'; c.lineCap = 'butt';
    c.setLineDash(d == null ? [] : [d, DASH_GAP]);
    c.strokeText(g, f.size * 0.3, h * 0.72);
    const a = c.getImageData(0, 0, cv.width, cv.height).data; let n = 0;
    for (let i = 3; i < a.length; i += 16) if (a[i] > 96) n++;
    return n;
  };
  const full = draw(null);
  if (!full) return 1;
  let lo = 0, hi = f.size * 12;
  for (let k = 0; k < 16; k++) { const mid = (lo + hi) / 2; if (draw(mid) >= full * 0.998) hi = mid; else lo = mid; }
  return hi;
};

export default {
  id: 'outline-write', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: F.frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'ink'],
  from: 'the ground (the wordmark not yet there)',
  to: 'the wordmark drawn in outline (or filled), settled',
  interpolates: ['every contour of every grapheme: dash 0 → its grapheme\'s longest contour, on one shared progress (0.5, 0, 0.3, 1)', 'glow: gathers over the last 30 % of the line, falls over 14 frames after it closes', 'fill (optional): 0 → 1 as the line closes'],
  summary: 'A widely spaced wordmark writes itself: every letter\'s outline starts on the same frame, grows as one continuous line and closes on the same frame, with a brief glow.',
  theory: 'One hand writing every letter at once reads as one act, not a sequence: a shared start and finish group the letters by common fate (Wertheimer 1923); a continuous line is read as being drawn (a trace implies its maker, Leyton 1992), where a mask that uncovers in pieces is read through.',
  defaults: (ctx) => ({ text: ctx.lang === 'zh' ? copy('cards', 'zh')[4].title : copy('product', 'en'), size: ctx.lang === 'zh' ? 150 : 170, weight: 500, track: ctx.lang === 'zh' ? 0.36 : 0.3, width: 3, y: null, fill: false, glow: 1 }),
  prepare(P) {
    const look = P.look || NEUTRAL, base = fontFor(look, 'display', P.lang, P.size, P.weight);
    const f = { ...base, spacing: 0 }, sc = canvasOf(16, 16).getContext('2d'), gs = graphemes(P.text), gap = P.track * P.size;
    const ws = gs.map((g) => measure(sc, g, f).width), total = ws.reduce((a, b) => a + b, 0) + gap * Math.max(0, gs.length - 1);
    const m = measure(sc, P.text, f), y = P.y ?? 540 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    let x = 960 - total / 2;
    const glyphs = gs.map((g, i) => { const o = { g, x, L: /\s/.test(g) ? 0 : longest(g, f, ws[i] + f.size * 0.6, f.size * 1.6, P.width) }; x += ws[i] + gap; return o; });
    const layer = canvasOf(1920, 1080); layer.getContext('2d', { willReadFrequently: true });
    return { f, y, glyphs, layer, cx: 960, cy: y - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2, w: total };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const f = clamp(p) * F.frames, e = ramp(f, 0, F.draw, stroke);
    const rise = ramp(f, F.draw * 0.7, F.draw * 0.3, 'swift'), fall = 1 - ramp(f, F.draw, F.glow, 'out');
    return { p, e, glow: p >= 1 ? 0 : e >= 1 ? fall : rise, fill: ramp(f, F.draw * 0.85, F.glow + F.draw * 0.15, 'out') };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    if (S.e <= 0) return;
    const c = P.colors, L = D.layer, lc = L.getContext('2d', { willReadFrequently: true });
    // the line on a scratch layer, twice as wide, then the glyphs' own fill cut out of it: only the outer half of the
    // stroke stays, so contours that overlap inside a glyph (variable and CJK fonts) never show
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, L.width, L.height);
    lc.font = fontOf(D.f); lc.textBaseline = 'alphabetic'; lc.lineCap = 'round'; lc.lineJoin = 'round'; lc.lineWidth = P.width * 2; lc.strokeStyle = c.ink;
    for (const g of D.glyphs) { if (!g.L) continue; lc.setLineDash(S.e >= 1 ? [] : [S.e * g.L, DASH_GAP]); lc.strokeText(g.g, g.x, D.y); }
    lc.setLineDash([]); lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = '#000000';
    for (const g of D.glyphs) if (g.L) lc.fillText(g.g, g.x, D.y);
    lc.globalCompositeOperation = 'source-over';
    ctx.save();
    if (P.fill && S.fill > 0) {
      ctx.font = fontOf(D.f); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = c.ink; ctx.globalAlpha = S.fill;
      for (const g of D.glyphs) if (g.L) ctx.fillText(g.g, g.x, D.y);
      ctx.globalAlpha = 1;
    }
    ctx.shadowColor = rgba(c.ink, (0.3 + 0.38 * S.glow) * P.glow); ctx.shadowBlur = (5 + 10 * S.glow) * P.glow;
    ctx.drawImage(L, 0, 0);
    ctx.restore();
  },
  // the shared progress of the line (× 1000 px on x): the timing the comparison follows; nothing moves, so no blur
  track(S) { return [[S.e * 1000, 0]]; },
  blur() { return false; },
};

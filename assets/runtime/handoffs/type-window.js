// type-window — a word drawn in code (the claim: a number, a name) becomes a window onto the asset that proves it.
// A hard line rises through the word and the line under it: below the line the letters show the asset (already in
// its final place and size, so it never moves or scales), and the caption is wiped away; then the letters swell
// (their outline dilates, exponentially, round joins) until they merge and cover the frame, which is the asset at rest.
// Only the mask moves; the asset is drawn once at its landed view, under the sharpness cap. The letters' dilation that
// covers the frame is computed in prepare (a distance transform of the word), so the last frames are exactly the asset.
// Theory: the title designer's image seen through type (knockout lettering; Saul Bass and the masked title cards of
// the 1950s–60s); the claim in words leads to its evidence in pixels (principle 2: the asset proves the copy); one
// object (the word) does one thing per stage. Sources: video-in-text knockouts; HyperFrames `svg-mask-reveal`,
// `texture-mask-text` (named, not copied).

import { seg, cubicInOut, expIn, clamp, fontOf, measure, scratch, canvasOf } from './util.js';
import { NEUTRAL, assetOf, placeholderPage } from './asset.js';
import { coverView, paintView } from './stage.js';

const GRID = 8;   // distance transform cell, film px

export default {
  name: 'type-window',
  tier: 'T2',
  beats: 2,
  modes: ['plakat', 'pulse', 'ink', 'halftone (logos and UI only)', 'every mode at a claim with its evidence'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'a word (a claim) set large in code, with a caption line under it',
  to: 'the asset that proves it, filling the frame (or a given rect)',
  interpolates: ['fill line (rises through word and caption)', 'outline dilation radius (exponential, to the frame-covering radius)'],
  summary: 'The claim, set large in code, fills with its evidence through the letters, then the letters swell until the asset fills the frame.',
  theory: 'Image seen through type (title-design knockouts); the copy leads straight into the pixels that prove it (principle 2); fill, then swell.',
  defaults: {
    word: '199',
    font: { family: 'sans-serif', weight: 800 },
    size: 600, x: 960, baseline: 690,
    caption: { text: 'token/s, live readout', size: 48, y: 800, weight: 500 },
    to: { asset: null, focus: null },
    rect: { x: 0, y: 0, w: 1920, h: 1080 },    // where the asset rests at the end
    fill: [0, 0.34], grow: [0.34, 1], cover: 0.94,   // grow reaches the covering radius at this share of its window
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const B = assetOf(P.to.asset, () => placeholderPage(1920, 1080));
    const v = coverView(B, P.rect, P.to.focus);
    const f = { ...P.font, size: P.size };
    const m = measure(scratch(), P.word, f);
    const top = P.baseline - m.actualBoundingBoxAscent, bottom = Math.max(P.baseline + m.actualBoundingBoxDescent, P.caption ? P.caption.y + 16 : 0);
    // distance from every cell of the rect to the nearest inked cell of the word (two-pass chamfer, 1 and √2)
    const gw = Math.ceil(1920 / GRID), gh = Math.ceil(1080 / GRID);
    const c = canvasOf(gw, gh), g = c.getContext('2d', { willReadFrequently: true });
    g.font = fontOf({ ...f, size: P.size / GRID }); g.textAlign = 'center'; g.fillStyle = '#fff';
    g.fillText(P.word, P.x / GRID, P.baseline / GRID);
    const px = g.getImageData(0, 0, gw, gh).data, d = new Float32Array(gw * gh);
    for (let i = 0; i < gw * gh; i++) d[i] = px[i * 4 + 3] > 127 ? 0 : 1e9;
    const S2 = Math.SQRT2;
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = y * gw + x; let v0 = d[i];
      if (x > 0) v0 = Math.min(v0, d[i - 1] + 1);
      if (y > 0) { v0 = Math.min(v0, d[i - gw] + 1); if (x > 0) v0 = Math.min(v0, d[i - gw - 1] + S2); if (x < gw - 1) v0 = Math.min(v0, d[i - gw + 1] + S2); }
      d[i] = v0;
    }
    for (let y = gh - 1; y >= 0; y--) for (let x = gw - 1; x >= 0; x--) {
      const i = y * gw + x; let v0 = d[i];
      if (x < gw - 1) v0 = Math.min(v0, d[i + 1] + 1);
      if (y < gh - 1) { v0 = Math.min(v0, d[i + gw] + 1); if (x < gw - 1) v0 = Math.min(v0, d[i + gw + 1] + S2); if (x > 0) v0 = Math.min(v0, d[i + gw - 1] + S2); }
      d[i] = v0;
    }
    let far = 0;
    const R = P.rect;
    for (let y = Math.floor(R.y / GRID); y < Math.ceil((R.y + R.h) / GRID); y++) for (let x = Math.floor(R.x / GRID); x < Math.ceil((R.x + R.w) / GRID); x++) far = Math.max(far, d[y * gw + x]);
    const rmax = (far + 2) * GRID;                       // a margin of two cells over the chamfer estimate
    const layer = canvasOf(1920, 1080);                  // a scratch layer (a tool, fully redrawn by every paint)
    return { B, v, f, top, bottom, rmax, layer };
  },
  rest(side, P, D) { return side === 'from' ? { line: 0, r: 0 } : { line: 1, r: D.rmax }; },
  at(p, P, D) {
    return { line: cubicInOut(seg(p, ...P.fill)), r: D.rmax * expIn(clamp(seg(p, ...P.grow) / P.cover)) * (p > P.grow[0] ? 1 : 0) };
  },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (S.r >= D.rmax) { paintView(ctx, D.B, D.v, P.rect); return; }
    const ly = D.bottom + (D.top - D.bottom) * S.line;    // the fill line: below it, the asset
    // above the line: the word in ink and the caption as set
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, ly); ctx.clip();
    ctx.font = fontOf(D.f); ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText(P.word, P.x, P.baseline);
    if (P.caption) { ctx.font = fontOf({ ...P.font, weight: P.caption.weight, size: P.caption.size }); ctx.fillStyle = C.dim; ctx.fillText(P.caption.text, P.x, P.caption.y); }
    ctx.restore();
    // below the line (and, once swelling, everywhere): the asset through the letters
    const L = D.layer, g = L.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 1920, 1080);
    g.font = fontOf(D.f); g.textAlign = 'center'; g.fillStyle = '#fff';
    g.fillText(P.word, P.x, P.baseline);
    if (S.r > 0) { g.lineJoin = 'round'; g.lineWidth = 2 * S.r; g.strokeStyle = '#fff'; g.strokeText(P.word, P.x, P.baseline); }
    g.globalCompositeOperation = 'source-in';
    paintView(g, D.B, D.v, P.rect);
    g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.beginPath(); ctx.rect(0, S.r > 0 ? 0 : ly, 1920, 1080); ctx.clip(); ctx.drawImage(L, 0, 0); ctx.restore();
  },
  track: (S, P, D) => [[P.x + Math.min(S.r, D.rmax), P.baseline], [P.x, D.bottom + (D.top - D.bottom) * S.line]],
};

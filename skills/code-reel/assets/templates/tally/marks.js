// marks.js — what one item looks like: the mark variant (content.mark). Runs in the browser and in Node.
//
//   'square'      the default: a rounded square, the densest packing; the bands read as areas turning into bars
//   'dot'         a disc of the same area as the square (diameter 1.13 × its side), centred in the same cell:
//                 a Wilkinson dot plot of counts (Wilkinson 1999); each item reads as a separate instance
//   'glyph:<id>'  an Isotype pictogram of the thing counted (Neurath 1936): one symbol = one item, more items =
//                 more symbols, never a bigger symbol. Drawn in full from GLYPH_FULL px up; below GLYPH_MIN px
//                 it is the square, and in between the square's corners fade out as the size grows, so a
//                 square that flies from a band into the axis changes outline with its size, in the same move
//
// One mark for the whole film: every unit wears it in every chapter, in the legend and in the accent key. The
// mark never separates categories (position and labels do, mode principle 4) and never changes between
// chapters. Only position, size and colour move; the comparison is still the count.
import { clamp, smooth } from './lib/motion.js';

export const GLYPH_MIN = 7, GLYPH_FULL = 12; // px: below MIN the square, from FULL up the whole pictogram
const DOT = 1.128; // a disc of the square's area: d = 2 / sqrt(pi) × side

// Pictograms in unit coordinates (the square's cell, 0..1 both ways). Silhouettes with knocked-out gaps, as
// Isotype drew them: no outline, no inner detail finer than about 1/12 of the symbol.
const GLYPHS = {
  // a page with a turned corner: proposals, RFCs, papers, issues, documents
  doc: [
    [[0.14, 0], [0.54, 0], [0.54, 0.34], [0.86, 0.34], [0.86, 1], [0.14, 1]],
    [[0.62, 0], [0.86, 0.26], [0.62, 0.26]],
  ],
  // an isometric box, three faces apart: packages, releases, containers, builds
  box: [
    [[0.5, 0.03], [0.92, 0.25], [0.5, 0.47], [0.08, 0.25]],
    [[0.06, 0.32], [0.46, 0.53], [0.46, 0.98], [0.06, 0.76]],
    [[0.94, 0.32], [0.54, 0.53], [0.54, 0.98], [0.94, 0.76]],
  ],
  // a chip with three pins a side: devices, GPUs, boards, machines
  chip: [
    [[0.22, 0.22], [0.78, 0.22], [0.78, 0.78], [0.22, 0.78]],
    ...[0.31, 0.5, 0.69].flatMap((c) => [
      [[c - 0.05, 0.04], [c + 0.05, 0.04], [c + 0.05, 0.16], [c - 0.05, 0.16]],
      [[c - 0.05, 0.84], [c + 0.05, 0.84], [c + 0.05, 0.96], [c - 0.05, 0.96]],
      [[0.04, c - 0.05], [0.16, c - 0.05], [0.16, c + 0.05], [0.04, c + 0.05]],
      [[0.84, c - 0.05], [0.96, c - 0.05], [0.96, c + 0.05], [0.84, c + 0.05]],
    ]),
  ],
};
export const GLYPH_IDS = Object.keys(GLYPHS);

// content.mark → { kind: 'square' | 'dot' | 'glyph', glyph?, noun } ; noun names the mark in the default legend.
export const markOf = (content) => {
  const v = String(content?.mark ?? 'square');
  if (v === 'square') return { kind: 'square', noun: 'square' };
  if (v === 'dot') return { kind: 'dot', noun: 'dot' };
  const g = /^glyph:([a-z]+)$/.exec(v);
  if (g && GLYPHS[g[1]]) return { kind: 'glyph', glyph: g[1], noun: 'symbol' };
  throw new Error(`mark "${v}": use 'square', 'dot' or 'glyph:<${GLYPH_IDS.join('|')}>'`);
};
export const legendOf = (content) => content.legend || `1 ${markOf(content).noun} = 1 {unit}`;

const poly = (ctx, pts, x, y, s) => {
  ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(x + pts[i][0] * s, y + pts[i][1] * s);
  ctx.closePath();
};

// Draw one mark of side s with its cell's top-left at (x, y), in the current fillStyle. `r` is the square's
// corner radius (the films use s × 0.18; the legend and key 3 px).
export const drawMark = (ctx, M, x, y, s, r = s * 0.18) => {
  if (M.kind === 'square') {
    ctx.beginPath(); ctx.roundRect(x, y, s, s, r); ctx.fill();
    return;
  }
  if (M.kind === 'dot') {
    const d = s * DOT;
    ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, d / 2, 0, Math.PI * 2); ctx.fill();
    return;
  }
  const u = smooth(clamp((s - GLYPH_MIN) / (GLYPH_FULL - GLYPH_MIN)));
  if (u < 1) {
    // the square around the pictogram fades as the size grows; the pictogram lies inside the square's cell, so
    // its own area stays solid and its gaps open gradually (no pop at a threshold)
    const a = ctx.globalAlpha;
    ctx.globalAlpha = a * (1 - u);
    ctx.beginPath(); ctx.roundRect(x, y, s, s, r); ctx.fill();
    ctx.globalAlpha = a;
    if (u <= 0) return;
  }
  ctx.beginPath(); for (const p of GLYPHS[M.glyph]) poly(ctx, p, x, y, s); ctx.fill();
};

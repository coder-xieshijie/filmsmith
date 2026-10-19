// picture.mjs — one decode of the film at 320×180 (area-averaged), per-frame measurements:
//   blocks   per 20×20 block (16×9 grid) the mean |Δluma|; only pixels inside the content mask count
//   blocksC  the same with max(|ΔR|, |ΔG|, |ΔB|), so a change of colour at equal luma counts (events)
//   bins     per block, its mean colour quantised to 8 levels a channel (512 bins), for the noise model
//   mafd     mean |Δluma| over the whole frame; scene = min(mafd, |mafd − previous mafd|) / 100, as
//            ffmpeg's select scene score (a hard cut scores > 0.3)
//   cells    12×12 grid of mean linear R, G, B and relative luminance, for the flash windows
//   accent   share of mask pixels within ΔE76 20 of the accent colour (when one is given)
//   blacks   ffmpeg blackdetect runs (d ≥ 0.1 s, pix_th 0.02, pic_th 0.995)

import { streamFrames } from './media.mjs';

export const W = 320, H = 180, B = 20, BX = W / B, BY = H / B, NB = BX * BY, SCALE = 1920 / W;
export const GRID = 12, NC = GRID * GRID;

const srgbToLinear = Float64Array.from({ length: 256 }, (_, v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });

// Lab (D65) of an sRGB triple 0..255.
export const lab = (r, g, b) => {
  const R = srgbToLinear[r], G = srgbToLinear[g], Bl = srgbToLinear[b];
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * Bl) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * Bl, Z = (0.0193 * R + 0.1192 * G + 0.9505 * Bl) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
export const hexRgb = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim()); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };

// 32×32×32 lookup: 1 when the quantised colour lies within ΔE76 `de` of any accent.
const accentLut = (accents, de = 20) => {
  const targets = accents.map((h) => hexRgb(h)).filter(Boolean).map((c) => lab(...c));
  if (!targets.length) return null;
  const lut = new Uint8Array(32768);
  for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
    const [L, A, Bb] = lab(r * 8 + 4, g * 8 + 4, b * 8 + 4);
    if (targets.some(([l, a, bb]) => Math.hypot(L - l, A - a, Bb - bb) < de)) lut[(r << 10) | (g << 5) | b] = 1;
  }
  return lut;
};

// mask = [x, y, w, h] in 1920×1080 pixels, or null for the whole frame.
export const analysePicture = async (file, { mask = null, accent = null } = {}) => {
  const inMask = new Uint8Array(W * H).fill(1);
  if (mask) {
    const [mx, my, mw, mh] = mask.map((v) => v / SCALE);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) inMask[y * W + x] = x + 0.5 >= mx && x + 0.5 < mx + mw && y + 0.5 >= my && y + 0.5 < my + mh ? 1 : 0;
  }
  const blockOf = new Int16Array(W * H), cellOf = new Int16Array(W * H), blockN = new Float64Array(NB), cellN = new Float64Array(NC);
  let maskN = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    blockOf[i] = ((y / B) | 0) * BX + ((x / B) | 0);
    cellOf[i] = Math.min(GRID - 1, Math.floor((y * GRID) / H)) * GRID + Math.min(GRID - 1, Math.floor((x * GRID) / W));
    if (inMask[i]) { blockN[blockOf[i]]++; maskN++; }
    cellN[cellOf[i]]++;
  }
  // A block counts when at least a quarter of it lies inside the mask.
  const blockIn = Uint8Array.from(blockN, (n) => (n >= (B * B) / 4 ? 1 : 0));
  const lut = accent ? accentLut([accent].flat()) : null;

  const blocks = [], blocksC = [], bins = [], mafd = [], cells = [], acc = [];
  let prev = null, prevRgb = null;
  const cur = new Uint8Array(W * H), bsum = new Float64Array(NB), csum = new Float64Array(NC * 4), rgbSum = new Float64Array(NB * 3), csumC = new Float64Array(NB);
  const { stderr, frames } = await streamFrames(file, { w: W, h: H, vf: ['blackdetect=d=0.1:pix_th=0.02:pic_th=0.995'] }, (f) => {
    bsum.fill(0); csum.fill(0); rgbSum.fill(0); csumC.fill(0);
    let sad = 0, hits = 0;
    for (let i = 0, j = 0; i < W * H; i++, j += 3) {
      const r = f[j], g = f[j + 1], b = f[j + 2];
      const y = (77 * r + 150 * g + 29 * b) >> 8;
      cur[i] = y;
      if (prev) {
        const dy = Math.abs(y - prev[i]);
        sad += dy;
        if (inMask[i]) { bsum[blockOf[i]] += dy; csumC[blockOf[i]] += Math.max(Math.abs(r - prevRgb[j]), Math.abs(g - prevRgb[j + 1]), Math.abs(b - prevRgb[j + 2])); }
      }
      if (inMask[i]) { const k = blockOf[i] * 3; rgbSum[k] += r; rgbSum[k + 1] += g; rgbSum[k + 2] += b; }
      const c = cellOf[i] * 4, R = srgbToLinear[r], G = srgbToLinear[g], Bl = srgbToLinear[b];
      csum[c] += R; csum[c + 1] += G; csum[c + 2] += Bl; csum[c + 3] += 0.2126 * R + 0.7152 * G + 0.0722 * Bl;
      if (lut && inMask[i] && lut[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)]) hits++;
    }
    const bf = new Float32Array(NB);
    if (prev) for (let k = 0; k < NB; k++) bf[k] = blockIn[k] ? bsum[k] / blockN[k] : 0;
    blocks.push(bf);
    const bc = new Float32Array(NB);
    if (prev) for (let k = 0; k < NB; k++) bc[k] = blockIn[k] ? csumC[k] / blockN[k] : 0;
    blocksC.push(bc);
    const bb = new Uint16Array(NB);
    for (let k = 0; k < NB; k++) if (blockN[k]) bb[k] = ((rgbSum[k * 3] / blockN[k]) >> 5) << 6 | ((rgbSum[k * 3 + 1] / blockN[k]) >> 5) << 3 | ((rgbSum[k * 3 + 2] / blockN[k]) >> 5);
    bins.push(bb);
    mafd.push(prev ? sad / (W * H) : 0);
    const cf = new Float32Array(NC * 4);
    for (let k = 0; k < NC; k++) for (let c = 0; c < 4; c++) cf[k * 4 + c] = csum[k * 4 + c] / cellN[k];
    cells.push(cf);
    if (lut) acc.push(hits / maskN);
    prev = prev || new Uint8Array(W * H);
    prev.set(cur);
    prevRgb = prevRgb || new Uint8Array(W * H * 3);
    prevRgb.set(f);
  });
  const scene = mafd.map((m, i) => (i ? Math.min(m, Math.abs(m - mafd[i - 1])) / 100 : 0));
  const blacks = [...stderr.matchAll(/black_start:\s*([\d.]+)\s+black_end:\s*([\d.]+)\s+black_duration:\s*([\d.]+)/g)].map((m) => ({ start: +m[1], end: +m[2], dur: +m[3] }));
  return { n: frames, blocks, blocksC, bins, blockIn, mafd, scene, cells, accent: lut ? acc : null, blacks, mask };
};

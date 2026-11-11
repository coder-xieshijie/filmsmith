// tools/regions.mjs — the accent rule of the Scroll mode: the mark must differ from every colour inside each region
// it marks by ΔE00 ≥ 20, so an underline never reads as part of the page. Each marked region of content.js (an
// underlined line box, a docked row, the row an unfold opens from) is decoded with ffmpeg; its
// chromatic colours (CIELAB C* ≥ 12, at least 0.5 % of the region's pixels after 4-bit quantising) are compared with
// the accent of every preset. Used by `npm run palettes` and tools/check-assets.mjs.
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FILM = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const MIN_DE = 20;

// sRGB hex or [r, g, b] → CIELAB (D65)
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const lab = (rgb) => {
  const [r, g, b] = (typeof rgb === 'string' ? [1, 3, 5].map((i) => parseInt(rgb.slice(i, i + 2), 16)) : rgb).map((v) => lin(v / 255));
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), Y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), Z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
};
// CIEDE2000 (Sharma, Wu & Dalal 2005)
export const de00 = (p, q) => {
  const [L1, a1, b1] = p, [L2, a2, b2] = q, rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G), C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1p = (Math.atan2(b1, a1p) / rad + 360) % 360, h2p = (Math.atan2(b2, a2p) / rad + 360) % 360;
  const dL = L2 - L1, dC = C2p - C1p;
  let dh = h2p - h1p; if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * rad) / 2);
  const Lb = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hb = h1p + h2p; if (C1p * C2p !== 0) hb = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  const dth = 30 * Math.exp(-(((hb - 275) / 25) ** 2)), RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 - Math.sin(2 * dth * rad) * RC * (dC / SC) * (dH / SH));
};

// the region's pixels, decoded by ffmpeg (any image ffmpeg reads), as raw RGB
export const pixels = (file, [x, y, w, h]) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `crop=${Math.round(w)}:${Math.round(h)}:${Math.round(x)}:${Math.round(y)}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${String(r.stderr).trim()}`);
  return r.stdout;
};
// chromatic colours of a region: [{ rgb, lab, share }], quantised to 16 levels a channel
export const chromatic = (buf) => {
  const n = buf.length / 3, bins = new Map();
  for (let i = 0; i < buf.length; i += 3) {
    const k = ((buf[i] >> 4) << 8) | ((buf[i + 1] >> 4) << 4) | (buf[i + 2] >> 4);
    bins.set(k, (bins.get(k) ?? 0) + 1);
  }
  const out = [];
  for (const [k, c] of bins) {
    if (c / n < 0.005) continue;
    const rgb = [((k >> 8) & 15) * 16 + 8, ((k >> 4) & 15) * 16 + 8, (k & 15) * 16 + 8], L = lab(rgb);
    if (Math.hypot(L[1], L[2]) >= 12) out.push({ rgb, lab: L, share: c / n });
  }
  return out;
};

// every marked region of the content: { where, file, box }
export const markedRegions = (content) => {
  const A = content.assets || {}, out = [];
  const grow = ([x, y, w, h]) => [Math.max(0, x - 8), Math.max(0, y - 4), w + 16, h + 16];
  (content.scenes || []).forEach((s, i) => {
    if (s.mark && A[s.mark.asset]) (s.mark.rects || []).forEach((r, k) => out.push({ where: `scene ${i + 1} ${s.type}, underline ${k + 1}`, file: A[s.mark.asset].file, box: grow(r) }));
    if (s.type === 'ratchet') (s.rows || []).forEach((r) => A[r.asset] && out.push({ where: `scene ${i + 1} ratchet, row ${r.name}`, file: A[r.asset].file, box: r.box }));
    if (s.type === 'unfold' && s.row && A[s.row.asset]) out.push({ where: `scene ${i + 1} unfold, the row`, file: A[s.row.asset].file, box: s.row.box });
  });
  return out.filter((r) => r.file && Array.isArray(r.box)).map((r) => {
    const a = Object.values(A).find((x) => x.file === r.file);
    const [x, y, w, h] = r.box, W = a?.size?.[0] ?? Infinity, H = a?.size?.[1] ?? Infinity;
    return { ...r, box: [x, y, Math.min(w, W - x), Math.min(h, H - y)] };
  });
};

// the check: per preset, the smallest ΔE00 between its accent and any chromatic colour of any marked region
export const accentCheck = async (palettes, { quiet = false } = {}) => {
  const content = (await import(pathToFileURL(resolve(FILM, 'content.js')).href)).default;
  const regs = markedRegions(content).map((r) => ({ ...r, colours: chromatic(pixels(resolve(FILM, 'assets/real', r.file), r.box)) }));
  const log = (s) => !quiet && console.log(s);
  log(`\naccent vs marked regions (ΔE00 ≥ ${MIN_DE}; ${regs.length} regions of content.js)`);
  let fails = 0;
  const rows = {};
  for (const [id, p] of Object.entries(palettes)) {
    const A = lab(p.accent);
    let worst = { d: Infinity };
    for (const r of regs) for (const c of r.colours) { const d = de00(A, c.lab); if (d < worst.d) worst = { d, where: r.where, rgb: c.rgb }; }
    const ok = worst.d >= MIN_DE, chosen = id === content.palette;
    if (!ok && chosen) fails++;
    rows[id] = { ok, worst };
    const at = Number.isFinite(worst.d) ? `${worst.d.toFixed(1).padStart(5)}  nearest: ${worst.where}, rgb(${worst.rgb.join(', ')})` : '   —   the regions hold no chromatic colour';
    log(`  ${ok ? 'ok  ' : chosen ? 'FAIL' : 'no  '} ${id.padEnd(16)} ${p.accent}${chosen ? ' (content.js)' : '             '} ${at}`);
  }
  if (fails) log(`  content.js's palette ${content.palette} fails the rule: choose a preset marked ok`);
  return { fails, rows, regions: regs.length };
};

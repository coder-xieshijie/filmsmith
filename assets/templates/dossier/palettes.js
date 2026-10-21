// palettes.js — dossier presets. Neutrals shared by every preset (a warm near-black mat, paper sheets, ink); the one
// accent is the highlighter and means "a published claim and its proof". Choose one by id in content.js; never invent
// hex values (a brand colour becomes a new preset: references/system.md, "A preset from a brand colour").
//
// Roles
//   mat          the ground the sheets lie on (L* 7)          onMat, mutedOnMat   the claim and its terms on the mat
//   paper        sheet mounts and worksheets (L* 95)          paperEdge           the hard edges of the stack
//   ink, muted   type on paper                                rule                worksheet ruling (decoration)
//   accent       the highlighter: bands (multiply over the page), the leader's core, stickers and tabs
//   onAccent     type set on an accent fill (stickers, tabs): ink where ink passes 4.5:1, else a darker near-black
//
// `npm run palettes` prints every contrast pair the template draws, preset by preset, and then checks the film's own
// highlighted regions (content.js): the accent must differ from every colour inside each band by ΔE00 ≥ 20, and the
// claim under a stroke must keep ≥ 3:1 (or 80 % of the source's own contrast); a band that cannot runs under the line
// (`under: true`). `npm run palettes -- --all` checks the regions against every preset.
export const PALETTES = {
  yellow: {
    name: 'Highlighter yellow (default)',
    fits: 'Almost every source; the colour newsrooms annotate in. Black type under it keeps about 14:1',
    mat: '#161512', onMat: '#EEEBE2', mutedOnMat: '#A8A396',
    paper: '#F3F1EA', paperEdge: '#CFCBBF', ink: '#1C1B17', muted: '#5A574E', rule: 'rgba(28,27,23,0.07)',
    accent: '#FFE13B', onAccent: '#1C1B17',
  },
  // `magenta` (2026-10-21), from a brand guide: the first stop of an icon gradient, #E21680 (OKLCH 0.599 0.236
  // 357.7°), moved 2.2 ΔE00 cooler along its own OKLCH hue to #E20088, which keeps ≥ 20 ΔE00 from coral and red
  // print (a red table rule measured 19.1 against #E21680, 20.7 against #E20088). The gradient's middle and warm stops
  // sit 6–15 ΔE00 from red print and were not taken. Ink on it is 3.77:1, so type on accent fills is a darker
  // near-black (`onAccent` #020202, 4.53:1). A solid magenta stroke takes coloured type to about 1–1.8:1: claims printed
  // in colour run under the line (`under: true`), which `npm run palettes` and `npm run assets` enforce.
  magenta: {
    name: 'Magenta highlighter',
    fits: 'A subject whose brand colour is a magenta or pink-red; sources printed mostly in black',
    mat: '#161512', onMat: '#EEEBE2', mutedOnMat: '#A8A396',
    paper: '#F3F1EA', paperEdge: '#CFCBBF', ink: '#1C1B17', muted: '#5A574E', rule: 'rgba(28,27,23,0.07)',
    accent: '#E20088', onAccent: '#020202',
  },
  // `coral` (2026-10-20): a brand guide's flat coral #FF6452, lightened along its OKLCH hue to #FF7A63 so ink reads
  // on it (6.74:1). Barred from sources that print data in red or coral (it sits within 12 ΔE00 of them).
  coral: {
    name: 'Coral highlighter',
    fits: 'A subject whose brand colour is a coral; sources with no red or coral data',
    mat: '#161512', onMat: '#EEEBE2', mutedOnMat: '#A8A396',
    paper: '#F3F1EA', paperEdge: '#CFCBBF', ink: '#1C1B17', muted: '#5A574E', rule: 'rgba(28,27,23,0.07)',
    accent: '#FF7A63', onAccent: '#1C1B17',
  },
};
export default PALETTES;
export const VEIL = 0.5; // the mat laid over a sheet's asset outside the lit band, uniformly

// ---------- colour science (WCAG 2.2 contrast, CIEDE2000) ----------
const rgb = (h) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export const luminance = (c) => { const [r, g, b] = (typeof c === 'string' ? rgb(c) : c).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const lab = (c) => {
  const [r, g, b] = (typeof c === 'string' ? rgb(c) : c).map(lin);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
export const deltaE00 = (c1, c2) => {
  const [L1, a1, b1] = lab(c1), [L2, a2, b2] = lab(c2);
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (b, a) => { const x = Math.atan2(b, a) / rad; return x < 0 ? x + 360 : x; };
  const h1p = h(b1, a1p), h2p = h(b2, a2p);
  let dh = h2p - h1p; if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dLp = L2 - L1, dCp = C2p - C1p, dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p; if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) <= 180 ? hbp / 2 : h1p + h2p < 360 ? (hbp + 360) / 2 : (hbp - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dth = 30 * Math.exp(-(((hbp - 275) / 25) ** 2)), Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dth * rad) * Rc;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
};
const mixHex = (a, b, u) => '#' + rgb(a).map((v, i) => Math.round(v * u + rgb(b)[i] * (1 - u)).toString(16).padStart(2, '0')).join('');

// Every pair the template draws: [what, fg, bg, min]. Information text ≥ 4.5:1; graphics and display type ≥ 3:1.
export const pairs = (P) => [
  ['claim on the mat (50 px)', P.onMat, P.mat, 4.5],
  ['terms, header and capture line on the mat (25 px)', P.mutedOnMat, P.mat, 4.5],
  ['worksheet and ledger type on paper', P.ink, P.paper, 4.5],
  ['muted type on paper (sources)', P.muted, P.paper, 4.5],
  ['sticker and tab type on the accent (25 px)', P.onAccent, P.accent, 4.5],
  ['the leader core and a struck name\'s band on the mat (graphics)', P.accent, P.mat, 3],
  ['a sheet against the mat (graphics)', P.paper, P.mat, 3],
  ['black page type under the veil (dimmed context keeps 3:1)', '#000000', mixHex(P.mat, '#FFFFFF', VEIL), 3],
].map(([what, fg, bg, min]) => ({ what, fg, bg, min, ratio: contrast(fg, bg) }));
export const report = pairs;

// ---------- the highlighted regions of a film ----------
// The accent against every chromatic colour inside each band (CIELAB chroma ≥ 12), and the claim's own type under a
// multiply stroke. `pixels(file)` returns { w, h, data: Uint8Array RGB } (tools/pixels.mjs, ffmpeg).
export const regionReport = (accent, px, [x, y, w, h]) => {
  const seen = new Map();
  let minDE = Infinity, at = null;
  const cells = [];
  for (let j = Math.max(0, y); j < Math.min(px.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(px.w, x + w); i++) {
    const k = (j * px.w + i) * 3, c = [px.data[k], px.data[k + 1], px.data[k + 2]];
    cells.push(c);
    const q = (c[0] >> 2) * 4096 + (c[1] >> 2) * 64 + (c[2] >> 2);
    let d = seen.get(q);
    if (d === undefined) { const L = lab(c); d = Math.hypot(L[1], L[2]) >= 12 ? deltaE00(accent, c) : null; seen.set(q, d); }
    if (d != null && d < minDE) { minDE = d; at = c; }
  }
  // legibility: the claim's ink (2nd percentile of luminance among pixels well below the paper) and its paper (the
  // most common light colour), both multiplied by the accent
  const lum = cells.map(luminance), counts = new Map();
  cells.forEach((c, i) => { if (lum[i] > 0.5) { const q = c.map((v) => v >> 3 << 3).join(','); counts.set(q, (counts.get(q) || 0) + 1); } });
  const paper = counts.size ? [...counts].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number) : [255, 255, 255];
  const lp = luminance(paper), dark = cells.map((c, i) => [c, lum[i]]).filter(([, l]) => l < lp * 0.6).sort((a, b) => a[1] - b[1]);
  const ink = dark.length ? dark[Math.floor(dark.length / 50)][0] : paper;
  const A = rgb(accent), mul = (c) => c.map((v, i) => (v * A[i]) / 255);
  // the lowest row of the claim's ink (where an under-stroke must start below)
  const far = (l) => Math.abs(l - lp) >= Math.abs(luminance(ink) - lp) * 0.5;
  let inkBottom = null;
  cells.forEach((c, i) => { if (far(lum[i])) inkBottom = Math.max(inkBottom ?? -1, y + Math.floor(i / Math.min(w, px.w - x))); });
  return { minDE: at ? minDE : null, at, before: contrast(ink, paper), after: contrast(mul(ink), mul(paper)), inkBottom };
};
export const bandOk = (r, under) => (under ? true : r.after >= 3 || r.after >= 0.8 * r.before);

// node palettes.js [--all] → contrast table for every preset, then the film's highlighted regions
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of pairs(p)) {
      const ok = r.ratio >= r.min - 1e-9;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg} / ${r.bg} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  const { regions } = await import('./tools/regions.mjs');
  bad += await regions({ all: process.argv.includes('--all'), lib: { PALETTES, regionReport, bandOk } });
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

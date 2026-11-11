// palettes.js — Strip presets: a light box (or an editing bench) under a strip of film, the strip's black base, the
// intertitle frames, the type on the box, and ONE accent: the grease pencil (a china marker) that marks the pick. The
// colours inside the frames are content, never palette. Choose one by id in content.js; never invent hex values.
//
// Roles
//   ground · glow   the light box and its brighter centre (static); on `flatbed` the bench
//   base            the film's base and frame lines; hole: what shows through a sprocket hole
//   title · titleInk an intertitle frame on the strip and its type
//   trackDim · trackLit  the variable-area optical track before and after it lights (texture)
//   ink · muted · dim    labels under the gate and beside the rows, the name, the address
//   accent          the grease pencil: the loop round the picked cell, the underline of the address. Never type, never a
//                   fill, never over a frame on a dark ground. It must differ from every colour inside the ringed cell
//                   by ΔE00 ≥ 20 (`npm run palettes` decodes the cell with ffmpeg)
export const PALETTES = {
  lightbox: {
    name: 'Light box, carmine china marker', fits: 'Default: most frame sets',
    ground: '#ECEFEE', glow: '#F5F7F6', base: '#0B0C0D', hole: '#ECEFEE', title: '#1B1D1F', titleInk: '#ECEFEE',
    trackDim: '#2B2E31', trackLit: '#C9CFCC', ink: '#14171A', muted: '#474D51', dim: '#565C61', accent: '#C2185B',
  },
  'lightbox-blue': {
    name: 'Light box, blue china marker', fits: 'A pick whose frame is red, pink or magenta',
    ground: '#ECEFEE', glow: '#F5F7F6', base: '#0B0C0D', hole: '#ECEFEE', title: '#1B1D1F', titleInk: '#ECEFEE',
    trackDim: '#2B2E31', trackLit: '#C9CFCC', ink: '#14171A', muted: '#474D51', dim: '#565C61', accent: '#2F5BD8',
  },
  flatbed: {
    name: 'Editing bench, pink china marker', fits: 'Frames that are mostly dark (night terminals, dark interfaces)',
    ground: '#17191A', glow: '#1F2223', base: '#050606', hole: '#3A3F41', title: '#1B1D1F', titleInk: '#ECEFEE',
    trackDim: '#202325', trackLit: '#C9CFCC', ink: '#E9ECEA', muted: '#A9AFAC', dim: '#8F9693', accent: '#F58FB8',
  },
};
export default PALETTES;

// WCAG 2.2 relative luminance and contrast.
const lum = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
};
export const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
// [foreground, background, minimum, what it is]
export const PAIRS = [
  ['ink', 'ground', 4.5, 'labels, the name and the address on the box'],
  ['muted', 'ground', 4.5, 'the measured lengths beside the rows'],
  ['dim', 'ground', 4.5, 'secondary text on the box'],
  ['titleInk', 'title', 4.5, 'an intertitle'],
  ['accent', 'ground', 3, 'the pencil on the box (graphic)'],
  ['accent', 'base', 3, 'the pencil on the film base (graphic)'],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg] ?? fg, p[bg] ?? bg) }));

// node palettes.js → contrast table for every preset, then the accent-vs-cell check of content.js
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(8)} on ${r.bg.padEnd(7)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
    const w = contrast(p.accent, '#FFFFFF');
    console.log(`  info accent  on white  ${w.toFixed(2).padStart(5)}    ${w >= 3 ? 'the pencil may cross a white frame' : 'keep the pencil off the frames (it runs on the base and the box)'}`);
  }
  const { accentCheck } = await import('./tools/regions.mjs');
  const res = await accentCheck(PALETTES);
  bad += res.fails;
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

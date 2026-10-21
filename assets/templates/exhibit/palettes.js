// palettes.js — Exhibit presets: a desk (ground), the mount every exhibit lies in (mat), the code-drawn type, the
// label stock readings are set on, and ONE accent: the pencil that rings what the film is pointing at now. The colours
// inside the assets are content, never palette. Choose one by id in content.js; never invent hex values.
//
// Roles
//   ground   the desk (light by default: most captures are white pages, and on a light desk they sit one step above
//            the ground instead of being the brightest thing in the frame)
//   mat      the mount: the frame round each exhibit and its source bar
//   ink      captions and the lock-up on the desk; muted: the source line on the mount and secondary desk text;
//            dim: glance text on the desk
//   stock    label stock: the paper a code-drawn reading is set on; sink / smuted: its type
//   accent   the pencil: rings, the edge of a lifted reading, a carried value's edge, a dimension, the route, the rule.
//            Never type, never a fill. It must differ from every colour inside each ringed region by ΔE00 ≥ 20
//            (`npm run palettes` checks the content's regions with ffmpeg)
//
// `npm run palettes` prints every contrast pair of every preset and then the ΔE00 check of content.js's regions.
export const PALETTES = {
  lightbox: {
    name: 'Light desk, red pencil', fits: 'Default: white pages, product UIs, charts without red',
    ground: '#ECEBE6', mat: '#DAD8D2', ink: '#17181B', muted: '#4C4E52', dim: '#5A5C60',
    stock: '#FBFAF7', sink: '#17181B', smuted: '#55575C', accent: '#D0233D',
  },
  'lightbox-pencil': {
    name: 'Light desk, blue pencil', fits: 'The light desk when the assets themselves use red, pink or orange',
    ground: '#ECEBE6', mat: '#DAD8D2', ink: '#17181B', muted: '#4C4E52', dim: '#5A5C60',
    stock: '#FBFAF7', sink: '#17181B', smuted: '#55575C', accent: '#677BFE',
  },
  grease: {
    name: 'Dark desk, grease-pencil red', fits: 'Dark captures: terminals, dark interfaces, dark charts',
    ground: '#141518', mat: '#26282C', ink: '#ECEBE6', muted: '#A9AAA6', dim: '#909290',
    stock: '#EEECE6', sink: '#17181B', smuted: '#55575C', accent: '#E02944',
  },
  pencil: {
    name: 'Dark desk, blue pencil', fits: 'The dark desk when the assets use red',
    ground: '#141518', mat: '#26282C', ink: '#ECEBE6', muted: '#A9AAA6', dim: '#909290',
    stock: '#EEECE6', sink: '#17181B', smuted: '#55575C', accent: '#677BFE',
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
// [foreground, background, minimum, what it is]; WHITE and BLACK stand for the extremes of a captured page
export const PAIRS = [
  ['ink', 'ground', 4.5, 'captions and the lock-up on the desk'],
  ['muted', 'ground', 4.5, 'secondary text on the desk'],
  ['dim', 'ground', 4.5, 'glance text on the desk'],
  ['muted', 'mat', 4.5, 'the source line on the mount'],
  ['sink', 'stock', 4.5, 'a reading on label stock'],
  ['smuted', 'stock', 4.5, 'a reading\'s meta line'],
  ['accent', 'ground', 3, 'the pencil on the desk (graphic)'],
  ['accent', 'stock', 3, 'the pencil round a reading (graphic)'],
  ['accent', '#FFFFFF', 3, 'the pencil on a white capture (graphic)'],
  ['accent', '#000000', 3, 'the pencil on a black capture (graphic)'],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg] ?? fg, p[bg] ?? bg) }));

// node palettes.js → contrast table for every preset, then the accent-vs-region check of content.js
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(7)} on ${r.bg.padEnd(7)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  const { accentCheck } = await import('./tools/regions.mjs');
  const res = await accentCheck(PALETTES);
  bad += res.fails;
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

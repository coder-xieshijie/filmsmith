// palettes.js — morph presets. One light ground, ONE ink, ONE accent that marks only "the part that is changing now".
// Choose one by id in content.js; never invent hex values. `npm run palettes` prints every contrast pair; film.js
// checks them on load and paints a failing preset in red.
//
// Roles
//   bg        the ground (L* 95 class, cool), never pure white
//   paper     panel fill of the interface, a step lighter than the ground (darker on night)
//   fg        the one ink: the shape, type, outlines
//   dim       secondary text on bg and paper (labels, meta, the tagline)
//   line      hairlines that carry nothing (separators, the empty segmented control); decoration only
//   accent    the part that is changing now: the point, the line while it grows, a swapped token, a new chip, the
//             three lines that turn a hexagon into a cube, a highlight while it moves, the Run button, the mark's point
//   onAccent  type on an accent chip
//   inkDim / inkAccent   the same roles on the ink ground of the live console (flood): secondary text, and the accent
//             lifted until it reads on ink (violet on ink is only 3.0:1)
// The shape's shading (cube faces) mixes fg toward line: tones of the one ink, never a second colour.
export const PALETTES = {
  slate: {
    name: 'Slate and violet (source)',
    fits: 'Default; developer tools and interface products, the approved sample',
    bg: '#EDEFF2', paper: '#F8F9FB', fg: '#15171A', dim: '#5F656D', line: '#C3C9D0',
    accent: '#6A3DF0', onAccent: '#EDEFF2', inkDim: '#9AA0A8', inkAccent: '#8C6CFF',
  },
  azure: {
    name: 'Slate and azure',
    fits: 'Infrastructure, data and API products; a calmer, more institutional blue',
    bg: '#EDEFF2', paper: '#F8F9FB', fg: '#15171A', dim: '#5F656D', line: '#C3C9D0',
    accent: '#1F55E0', onAccent: '#EDEFF2', inkDim: '#9AA0A8', inkAccent: '#7FA0FF',
  },
  night: {
    name: 'Night (inverted)',
    fits: 'Night launches, editor and terminal-adjacent tools; the console flood turns light',
    bg: '#121418', paper: '#1B1E23', fg: '#E8EBEF', dim: '#8D939B', line: '#2C3036',
    accent: '#9C80FF', onAccent: '#121418', inkDim: '#585E66', inkAccent: '#6A3DF0',
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
  ['fg', 'bg', 4.5, 'type and the shape on the ground'],
  ['fg', 'paper', 4.5, 'type on interface panels'],
  ['dim', 'bg', 4.5, 'labels, meta, tagline on the ground'],
  ['dim', 'paper', 4.5, 'labels on interface panels'],
  ['bg', 'fg', 4.5, 'type knocked out of the ink shape (pill, card, console)'],
  ['inkDim', 'fg', 4.5, 'secondary type on the ink shape and the console'],
  ['accent', 'bg', 3, 'the point, chips and lines (graphics) on the ground'],
  ['accent', 'paper', 3, 'highlights on interface panels'],
  ['onAccent', 'accent', 4.5, 'type on an accent chip or button'],
  ['inkAccent', 'fg', 3, 'the accent on the ink shape (graphics, 44 px type)'],
  ['bg', 'inkCard', 4.5, 'type on the console card'],
  ['inkDim', 'inkCard', 4.5, 'secondary type (tabs) on the console card'],
  ['inkAccent', 'inkCard', 3, 'the console status line (44 px semibold: large type) on the console card'],
];
// the console card is the ink mixed 6 % toward the ground (film.js C.inkCard): measured against what is behind the type
const mixHex = (a, b, k) => '#' + [16, 8, 0].map((s) => { const x = (parseInt(a.slice(1), 16) >> s) & 255, y = (parseInt(b.slice(1), 16) >> s) & 255; return Math.round(x + (y - x) * k).toString(16).padStart(2, '0'); }).join('');
const surfaces = (p) => ({ ...p, inkCard: mixHex(p.fg, p.bg, 0.06) });
export const report = (p0) => { const p = surfaces(p0); return PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg], p[bg]) })); };

// node palettes.js → contrast table for every preset
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(9)} on ${r.bg.padEnd(5)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  if (bad) { console.error(`\n${bad} pair(s) below the minimum`); process.exit(1); }
}

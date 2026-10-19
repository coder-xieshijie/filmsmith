// palettes.js — halftone presets: newsprint paper, one black plate, and ONE process ink (the accent) that prints
// only the anchor, the piece of the product's mark that runs through the film. Choose one by id in content.js; never
// invent hex values. `npm run palettes` prints every contrast pair.
//
// Roles
//   bg       paper (newsprint, L* about 94, warm); the ground of paper scenes, and the knock-out under the anchor
//   fg       the black plate: type, field dots on paper, the ground of ink scenes, the mark's plate
//   dim      secondary text (labels) on paper
//   dimInk   secondary text on an ink ground
//   accent   the process ink: the anchor and nothing else (principle 7). Never type, never a field, never emphasis
// The anchor sits on paper and on ink grounds, so the accent clears 3:1 (graphics) against both.
export const PALETTES = {
  cyan: {
    name: 'Process cyan',
    fits: 'Default; models, developer tools, launches',
    bg: '#F1EDE4', fg: '#141414', dim: '#6E6A62', dimInk: '#A39E94',
    accent: '#0090CC',
  },
  magenta: {
    name: 'Process magenta',
    fits: 'Consumer and media products; anything louder or warmer',
    bg: '#F1EDE4', fg: '#141414', dim: '#6E6A62', dimInk: '#A39E94',
    accent: '#E4007C',
  },
  reverse: {
    name: 'Reverse (ink paper)',
    fits: 'Night launches, infrastructure, security; the whole film printed reversed out of black',
    bg: '#141414', fg: '#F1EDE4', dim: '#A39E94', dimInk: '#68645C',
    accent: '#0090CC',
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
  ['fg', 'bg', 4.5, 'type and field dots on paper; paper type on ink grounds'],
  ['dim', 'bg', 4.5, 'labels on paper'],
  ['dimInk', 'fg', 4.5, 'labels on an ink ground'],
  ['accent', 'bg', 3, 'the anchor on paper (graphic)'],
  ['accent', 'fg', 3, 'the anchor on an ink ground (graphic)'],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg], p[bg]) }));

// node palettes.js → contrast table for every preset
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(7)} on ${r.bg.padEnd(3)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  if (bad) { console.error(`\n${bad} pair(s) below the minimum`); process.exit(1); }
}

// palettes.js — Split presets. Two sides: the input side's paper (where things are written) and the result side's bench
// (behind a result that does not fill its pane, and the report pane); three text tones on each; ONE accent: the seam,
// the edit point between what is written and what it makes. Results keep their own colours: they are content, not
// palette. Choose one by id in content.js; never invent hex values. `npm run palettes` prints every contrast pair, then
// the accent against every result region of content.js (ΔE00 ≥ 20 against each colour filling ≥ 2 % of the region the
// seam or its copies cross; below that the seam reads as part of the result: take another preset).
//
// Roles
//   paper    the input side's ground; ink / muted / dim   claims and code, secondary lines, labels and line numbers
//   bench    behind results; onBench / mutedOnBench        report lines and chips on the bench
//   accent   the seam, its copies, its grip, the caret and the one mark pairing an input with a result
//   key      the seam's 2 px edges (the input side's ground), so the seam reads on any result
export const PALETTES = {
  diff: {
    name: 'Paper and diff teal (default)',
    fits: 'Most products; results in blue, indigo, violet, amber, cyan, black or paper',
    paper: '#F3F2EE', ink: '#16171A', muted: '#4A4F57', dim: '#5C626B',
    bench: '#15171A', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5',
    accent: '#007C72', key: '#F3F2EE',
  },
  night: {
    name: 'Graphite and light teal (the input side dark)',
    fits: 'Products used in a dark editor; light results',
    paper: '#121417', ink: '#E8E9EB', muted: '#A7ADB5', dim: '#8C929B',
    bench: '#0B0C0E', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5',
    accent: '#36B5B0', key: '#121417',
  },
  plum: {
    name: 'Paper and plum',
    fits: 'Results that are green or teal (where the teal seam would sit inside the content)',
    paper: '#F3F2EE', ink: '#16171A', muted: '#4A4F57', dim: '#5C626B',
    bench: '#15171A', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5',
    accent: '#A23B92', key: '#F3F2EE',
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
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// [foreground, background, minimum, what it is]
export const PAIRS = [
  ['ink', 'paper', 4.5, 'claims, code, the name on the input side'],
  ['muted', 'paper', 4.5, 'the removed line of a diff, the address'],
  ['dim', 'paper', 4.5, 'labels and line numbers'],
  ['onBench', 'bench', 4.5, 'report lines, chips, claims in the report pane'],
  ['mutedOnBench', 'bench', 4.5, 'report items and the report label'],
  ['accent', 'paper', 3, 'the seam, the caret and the pairing marks on paper (graphics)'],
  ['accent', 'bench', 3, 'the seam beside the bench (graphics)'],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg], p[bg]) }));

// node palettes.js → contrast table for every preset, then ΔE00 of each accent against content.js's result regions
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(12)} on ${r.bg.padEnd(6)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  const { regionReport } = await import('./tools/regions.mjs');
  const content = (await import('./content.js')).default;
  const rows = await regionReport(content, PALETTES);
  console.log(`\naccent against the result regions of content.js (ΔE00 ≥ 20; the film uses '${content.palette}')`);
  for (const r of rows) {
    const used = r.preset === content.palette;
    if (used && !r.ok) bad++;
    console.log(`  ${r.ok ? 'ok  ' : used ? 'FAIL' : 'no  '} ${r.preset.padEnd(6)} ${r.region.padEnd(22)} ΔE00 ${r.min.toFixed(1).padStart(5)} against ${r.worst}${used ? '' : '  (not the film\'s preset)'}`);
  }
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

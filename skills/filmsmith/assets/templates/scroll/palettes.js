// palettes.js — Scroll presets: the ground round the sheet, the quote bands' stock and type, the unfold panel, the
// paper roll, and ONE accent: the mark of the line being read now (an underline in the capture, the docked row's
// margin mark, the minimap's bracket). The colours inside the captures are content, never palette. Choose one by id in
// content.js; never invent hex values.
//
// Roles
//   ground    round the sheet (dark by default: most pages are light, and a light sheet on a dark ground reads as one
//             long paper)
//   stock     the quote bands' paper (a warm paper, a separate material from the captured pages); ink / muted: its type
//   panel     an unfolded row's panel; onPanel / panelMuted: its caption and label
//   roll*     the paper roll at the two ends (the only object with volume): highlight, body, shade, edge
//   accent    the mark of the line being read now. Never type, never a fill. It must differ from every colour inside each
//             region it marks by ΔE00 ≥ 20 (`npm run palettes` checks the content's regions with ffmpeg)
//
// `npm run palettes` prints every contrast pair of every preset and then the ΔE00 check of content.js's regions.
const ROLL = { rollHi: '#F6F3EC', roll: '#E4E0D7', rollShade: '#B5B0A6', rollEdge: '#7E7A72' };
export const PALETTES = {
  slate: {
    name: 'Slate, ochre mark', fits: 'Default: light pages (READMEs, docs, changelogs) on a near-black ground; a pencil-ochre underline clears blue links, blue and red thumbnails',
    ground: '#0E0F11', stock: '#F3F0E8', ink: '#17181B', muted: '#55575C',
    panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#C9CDD3', ...ROLL, accent: '#8F7719',
  },
  'slate-violet': {
    name: 'Slate, violet mark', fits: 'Light pages whose marked lines hold yellow, ochre or green and no strong blue',
    ground: '#0E0F11', stock: '#F3F0E8', ink: '#17181B', muted: '#55575C',
    panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#C9CDD3', ...ROLL, accent: '#9B4DCA',
  },
  linen: {
    name: 'Linen, ochre mark', fits: 'Dark-mode pages: a dark sheet on a light ground; the bands become dark stock',
    ground: '#ECEAE4', stock: '#17181B', ink: '#F1EFEA', muted: '#A9ABB0',
    panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#3A3D44', ...ROLL, accent: '#8F7719',
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
  ['ink', 'stock', 4.5, 'a quote on its band'],
  ['muted', 'stock', 4.5, 'the address on the hook band'],
  ['onPanel', 'panel', 4.5, 'an unfolded panel\'s claim'],
  ['panelMuted', 'panel', 4.5, 'an unfolded panel\'s label'],
  ['accent', 'ground', 3, 'the minimap bracket on the ground (graphic)'],
  ['accent', '#FFFFFF', 3, 'an underline on a white page (graphic)'],
  ['accent', '#000000', 3, 'an underline on a black page (graphic)'],
  ['accent', 'stock', 3, 'the mark beside a band (graphic)'],
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
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(10)} on ${r.bg.padEnd(7)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  const { accentCheck } = await import('./tools/regions.mjs');
  const res = await accentCheck(PALETTES);
  bad += res.fails;
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

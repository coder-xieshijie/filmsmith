// palettes.js — Handset presets. A dark (or light) ground, the device's neutrals, three text tones for the margin, and ONE
// accent that marks only the region of the screen in play (the focus ring, the level tick). Captures keep their own
// colours: they are content, not palette. Choose one by id in content.js; never invent hex values.
// `npm run palettes` prints every contrast pair, then the accent against every ringed region of content.js (ΔE00 ≥ 20
// against each colour filling ≥ 2 % of the region; below that the ring reads as part of the capture: take another preset).
//
// Roles
//   bg       the ground; lid / lidEdge / deck / deckEdge / glass   the device (the edge carries the outline: fill ≈ ground)
//   ink      the display and main lines; muted   secondary lines; dim   glance notes and the source line on the chin
//   accent   the region in play (ring, tick); key   the ring's under-stroke (the ground), so it reads on a white page
//   veil     the share of the ground laid over the screen outside the lit region (a uniform dim, never a recolour)
export const PALETTES = {
  graphite: {
    name: 'Graphite and focus lime (default)',
    fits: 'Most products; captures that are white pages, blue or red interfaces, charts',
    bg: '#0E1013', lid: '#1A1D22', lidEdge: '#30353C', deck: '#22262C', deckEdge: '#3B4048', glass: '#07080A', cam: '#2B3037',
    ink: '#ECEEF1', muted: '#A9AFB8', dim: '#8B929C', accent: '#ADE05E', key: '#0E1013', veil: 0.52,
  },
  umber: {
    name: 'Warm graphite and amber',
    fits: 'Captures that are green or teal (where lime would sit inside the content)',
    bg: '#100F0D', lid: '#1C1B18', lidEdge: '#34322D', deck: '#25231F', deckEdge: '#403D37', glass: '#080807', cam: '#2E2C28',
    ink: '#EFEDE8', muted: '#B1ACA2', dim: '#948F85', accent: '#FFB45C', key: '#100F0D', veil: 0.52,
  },
  porcelain: {
    name: 'Porcelain and deep green (light)',
    fits: 'A light film, or a dark-mode product: a dark screen on a light ground',
    bg: '#ECEEF1', lid: '#D3D7DD', lidEdge: '#B8BEC6', deck: '#C5CAD1', deckEdge: '#AEB4BC', glass: '#101215', cam: '#B8BEC6',
    ink: '#14161A', muted: '#454B53', dim: '#50565F', accent: '#3D7A0A', key: '#ECEEF1', veil: 0.4,
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
  ['ink', 'bg', 4.5, 'display and main lines in the margin'],
  ['muted', 'bg', 4.5, 'secondary lines in the margin'],
  ['dim', 'bg', 4.5, 'glance notes in the margin, the source line under the phone'],
  ['dim', 'lid', 4.5, 'the source line on the laptop chin'],
  ['accent', 'bg', 3, 'the level tick (graphics) on the ground'],
  ['accent', 'key', 3, 'the ring on its under-stroke (graphics)'],
  ['lidEdge', 'bg', 1.3, "the device's 2 px outline against the ground (decoration: the device is recognised by shape)"],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg], p[bg]) }));

// node palettes.js → contrast table for every preset, then ΔE00 of each accent against content.js's ringed regions
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(8)} on ${r.bg.padEnd(4)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  const { ringReport } = await import('./tools/rings.mjs');
  const content = (await import('./content.js')).default;
  const rows = await ringReport(content, PALETTES);
  console.log(`\naccent against the ringed regions of content.js (ΔE00 ≥ 20; the film uses '${content.palette}')`);
  for (const r of rows) {
    const used = r.preset === content.palette;
    if (used && !r.ok) bad++;
    console.log(`  ${r.ok ? 'ok  ' : used ? 'FAIL' : 'no  '} ${r.preset.padEnd(9)} ${r.region.padEnd(16)} ΔE00 ${r.min.toFixed(1).padStart(5)} against ${r.worst}${used ? '' : '  (not the film\'s preset)'}`);
  }
  if (bad) { console.error(`\n${bad} check(s) failed`); process.exit(1); }
}

// palettes.js — tally presets. One accent marks the protagonist (one category, one flag, one bar);
// every other square, bar and label is a neutral. Pick one by id in content.js; do not invent hex values.
// Checked by `npm run palettes` (tools/check-palettes.mjs): text >= 4.5:1 and graphics >= 3:1 against both
// background stops, accent vs neutrals distinct for normal vision and under protan / deutan simulation.
//
// Roles
//   ground      flat background (contrast is checked against ground and glow)
//   glow, edge  radial background: centre and corner
//   text        titles, big numbers, values
//   muted       labels, subtitles, the source line
//   base        neutral squares and bars (the comparison group)
//   rest        squares that are "not it" in a split; darker/lighter than base, still >= 3:1
//   accent      the protagonist; also used as text in titles, so >= 4.5:1
//   rule        hairlines, axis ticks, progress rule track (decorative)
export default {
  'navy-amber': {
    name: 'Navy and amber (source film)',
    ground: '#0B111F', glow: '#16203A', edge: '#070B14',
    text: '#EEF1F5', muted: '#929EB2', base: '#C0C8D0', rest: '#647187', accent: '#FFB71C', rule: '#2A3550',
    grain: 0.05, dark: true,
  },
  'paper-red': {
    name: 'Paper, ink and red',
    ground: '#F2EEE6', glow: '#F8F6F1', edge: '#EAE5DB',
    text: '#141414', muted: '#57534D', base: '#3B3A37', rest: '#7F7B73', accent: '#BF2417', rule: '#CFC8BA',
    grain: 0.06, dark: false,
  },
  'night-teal': {
    name: 'Night and teal',
    ground: '#0D1213', glow: '#152022', edge: '#080B0C',
    text: '#E9EEEE', muted: '#93A2A4', base: '#8F9A9C', rest: '#5F6D70', accent: '#3FE0C5', rule: '#263335',
    grain: 0.05, dark: true,
  },
};

// Which roles the checker tests, and against what.
export const roles = {
  grounds: ['ground', 'glow', 'edge'],
  text: ['text', 'muted', 'accent'],
  graphic: ['base', 'rest', 'accent'],
  separate: [['accent', 'base'], ['accent', 'rest'], ['base', 'rest']],
};

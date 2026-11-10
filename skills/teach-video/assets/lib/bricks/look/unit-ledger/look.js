// unit-ledger — the look of the tally style: a data-journalism unit chart on a dark radial ground (or warm paper),
// one square per item in two neutrals (`base` the comparison group, `rest` "not it"), one accent for the chapter's
// protagonist, Inter Tight for numbers and titles, a mono in capitals for every label, measure and source (SPEC 3.4).
// From the tally template (assets/templates/tally/palettes.js, index.html, layouts.js): the four presets keep the
// template's hexes; `panel` is the template's radial glow, `line` its rule, `paper` its base square.
// Contrast is WCAG 2 measured from the hex values.
export default {
  id: 'unit-ledger', kind: 'look',
  palettes: [
    { id: 'navy-amber', name: { en: 'Navy and amber', zh: '藏青与琥珀' }, dark: true,
      roles: { ground: '#0B111F', panel: '#16203A', ink: '#EEF1F5', dim: '#929EB2', line: '#2A3550', accent: '#FFB71C',
               onAccent: '#0B111F', paper: '#C0C8D0', onPaper: '#0B111F', base: '#C0C8D0', rest: '#647187', edge: '#070B14' },
      alias: { glow: 'panel', text: 'ink', muted: 'dim', rule: 'line' },
      contrast: { 'ink/ground': 16.64, 'dim/ground': 6.96, 'accent/ground': 10.81, 'ink/panel': 14.24, 'dim/panel': 5.96 },
      accentMeans: "this chapter's protagonist: the category, flag, bar or number the title is about" },
    { id: 'paper-red', name: { en: 'Paper, ink and red', zh: '纸、墨与红' }, dark: false,
      roles: { ground: '#F2EEE6', panel: '#F8F6F1', ink: '#141414', dim: '#57534D', line: '#CFC8BA', accent: '#BF2417',
               onAccent: '#F8F6F1', paper: '#3B3A37', onPaper: '#F2EEE6', base: '#3B3A37', rest: '#7F7B73', edge: '#EAE5DB' },
      alias: { glow: 'panel', text: 'ink', muted: 'dim', rule: 'line' },
      contrast: { 'ink/ground': 15.92, 'dim/ground': 6.6, 'accent/ground': 5.21, 'ink/panel': 17.06, 'dim/panel': 7.07 },
      accentMeans: "this chapter's protagonist" },
    { id: 'night-teal', name: { en: 'Night and teal', zh: '夜色与青' }, dark: true,
      roles: { ground: '#0D1213', panel: '#152022', ink: '#E9EEEE', dim: '#93A2A4', line: '#263335', accent: '#3FE0C5',
               onAccent: '#0D1213', paper: '#8F9A9C', onPaper: '#0D1213', base: '#8F9A9C', rest: '#5F6D70', edge: '#080B0C' },
      alias: { glow: 'panel', text: 'ink', muted: 'dim', rule: 'line' },
      contrast: { 'ink/ground': 16.11, 'dim/ground': 7.14, 'accent/ground': 11.39, 'ink/panel': 14.21, 'dim/panel': 6.3 },
      accentMeans: "this chapter's protagonist" },
    { id: 'coral', name: { en: 'Coral red', zh: '珊瑚红' }, dark: true,
      roles: { ground: '#170C0D', panel: '#2C1517', ink: '#F7EFED', dim: '#B6A4A0', line: '#3C2729', accent: '#FF6452',
               onAccent: '#170C0D', paper: '#D4C7C3', onPaper: '#170C0D', base: '#D4C7C3', rest: '#7A6662', edge: '#0B0607' },
      alias: { glow: 'panel', text: 'ink', muted: 'dim', rule: 'line' },
      contrast: { 'ink/ground': 16.92, 'dim/ground': 8.04, 'accent/ground': 6.57, 'ink/panel': 15.1, 'dim/panel': 7.18 },
      accentMeans: "this chapter's protagonist" },
  ],
  type: {
    // display: big numbers and titles (Inter Tight 600–800); text: captions and values; mono: every label, measure and
    // source, in capitals in English. IBM Plex Mono is the template's mono; JetBrains Mono follows it in the stack as
    // the installed stand-in until tools/fonts.json lists IBM Plex Mono (batches/modes-1.json toolIssues).
    families: {
      display: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono', 'JetBrains Mono'], zh: ['IBM Plex Mono', 'JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Regular.ttf', weight: 400, licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // the template's scale 25 · 32 · 40 · 64 · 150 · 210 · 273 · 300; Chinese labels start at 28
    scale: { en: [25, 32, 40, 64, 150, 210, 273, 300], zh: [28, 32, 40, 64, 150, 210, 273, 300] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.022, label: 0.05 }, zh: { display: 0, label: 0.04 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.2, zh: 1.35 },
  },
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 54], chart: [330, 920],
          frame: { chapter: 82, rule: 986, source: 1040 } },
  camera: { habit: 'locked', maxScale: 1, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  // ground: radial glow at (62 %, 42 %) from `panel` into `ground` and `edge`; seeded grain at 5 % (6 % on paper)
  texture: { grain: 0.05, glow: { role: 'panel', at: [0.62, 0.42] }, vignette: 0, light: 'radial' },
  motion: { spring: 10, enterBeats: 0.25, exitShare: 0.66 },
};

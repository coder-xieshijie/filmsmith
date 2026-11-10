// poster-grid — the look of the plakat style: International Typographic Style posters in motion. Warm paper, one ink
// for text, rules and solid blocks, one accent for the person and the person's decisions only, a visible 12-column
// grid (96 px margins, 122 px columns, 24 px gutters), giant numerals beside small mono labels, a static print tooth
// over the sheet, a locked camera (SPEC 3.4).
// From the plakat template (assets/templates/plakat/palettes.js, index.html CSS, scenes.js SERIES): the six presets
// keep the template's hexes; `line` is the template's hairline (ink at hairAlpha over paper), `grid` its column line
// (ink at gridAlpha), `onInk`, `mutedOnInk` and `promptOnInk` its roles on the ink blocks.
const base = (paper, ink, grey, accent, onAccent, onInk, mutedOnInk, promptOnInk, line, grid) =>
  ({ ground: paper, panel: paper, paper, onPaper: ink, ink, dim: grey, line, grid, accent, onAccent, onInk, mutedOnInk, promptOnInk });
export default {
  id: 'poster-grid', kind: 'look',
  palettes: [
    { id: 'signal', name: { en: 'Swiss red', zh: '瑞士红' }, dark: false,
      roles: base('#F2EFE8', '#111111', '#5E5A53', '#FF3B1F', '#111111', '#F2EFE8', '#BDB8AE', '#FF3B1F', '#D7D4CE', '#DFDCD6'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 16.44, 'dim/ground': 5.97, 'accent/ground': 3.1, 'onAccent/accent': 5.3, 'onInk/ink': 16.44, 'mutedOnInk/ink': 9.56, 'promptOnInk/ink': 5.3 },
      accentMeans: 'the person and the person’s decisions: the input half, the pick, the YOU nodes, the stop band, the current bar' },
    { id: 'ikb', name: { en: 'Ultramarine signal', zh: '群青信号' }, dark: false,
      roles: base('#F2EFE8', '#111111', '#5E5A53', '#1E40D8', '#F2EFE8', '#F2EFE8', '#BDB8AE', '#8EA2FF', '#D7D4CE', '#DFDCD6'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 16.44, 'dim/ground': 5.97, 'accent/ground': 6.58, 'onAccent/accent': 6.58, 'onInk/ink': 16.44, 'mutedOnInk/ink': 9.56, 'promptOnInk/ink': 7.88 },
      accentMeans: 'the person and the person’s decisions (cooler, institutional)' },
    { id: 'orange', name: { en: 'Safety orange', zh: '安全橙' }, dark: false,
      roles: base('#F2EFE8', '#111111', '#5E5A53', '#D36F01', '#111111', '#F2EFE8', '#BDB8AE', '#D36F01', '#D7D4CE', '#DFDCD6'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 16.44, 'dim/ground': 5.97, 'accent/ground': 3.03, 'onAccent/accent': 5.43, 'onInk/ink': 16.44, 'mutedOnInk/ink': 9.56, 'promptOnInk/ink': 5.43 },
      accentMeans: 'the person and the person’s decisions (stories with a stop)' },
    { id: 'clay', name: { en: 'Clay', zh: '陶土' }, dark: false,
      roles: base('#F2EFE8', '#111111', '#5E5A53', '#CF6E4E', '#111111', '#F2EFE8', '#BDB8AE', '#CF6E4E', '#D7D4CE', '#DFDCD6'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 16.44, 'dim/ground': 5.97, 'accent/ground': 3.05, 'onAccent/accent': 5.39, 'onInk/ink': 16.44, 'mutedOnInk/ink': 9.56, 'promptOnInk/ink': 5.39 },
      accentMeans: 'the person and the person’s decisions (warmer, softer)' },
    { id: 'poster-coral', name: { en: 'Coral red', zh: '珊瑚红' }, dark: false,
      roles: base('#F2EFE8', '#111111', '#5E5A53', '#EE5444', '#111111', '#F2EFE8', '#BDB8AE', '#EE5444', '#D7D4CE', '#DFDCD6'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 16.44, 'dim/ground': 5.97, 'accent/ground': 3.05, 'onAccent/accent': 5.38, 'onInk/ink': 16.44, 'mutedOnInk/ink': 9.56, 'promptOnInk/ink': 5.38 },
      accentMeans: 'the person and the person’s decisions (a coral brand colour)' },
    { id: 'night-print', name: { en: 'Night print', zh: '夜印' }, dark: true,
      roles: base('#141414', '#EDEAE3', '#A39E94', '#FF4A2E', '#141414', '#141414', '#5E5A53', '#C4311A', '#373635', '#2C2C2B'),
      alias: { grey: 'dim', hair: 'line', gridline: 'grid' },
      contrast: { 'ink/ground': 15.33, 'dim/ground': 6.91, 'accent/ground': 5.5, 'onAccent/accent': 5.5, 'onInk/ink': 15.33, 'mutedOnInk/ink': 5.71, 'promptOnInk/ink': 4.6 },
      accentMeans: 'the person and the person’s decisions (dark rooms)' },
  ],
  type: {
    // display, numerals, body: Inter Tight 500–800; mono labels, commands, ids and chrome: IBM Plex Mono 400–600.
    // Chinese takes Noto Sans SC after the Latin family: no negative tracking, no capitals, labels at 28 px, body at 40.
    families: {
      display: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Regular.ttf', weight: '400', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.ttf', weight: '600', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // one modular scale, 25 × 1.3685ⁿ; three tiers a page: display, body, label. Chinese: label 28, body 40.
    scale: { en: [25, 34, 47, 64, 88, 120, 164, 225], zh: [28, 40, 47, 64, 88, 120, 164, 225] },
    floors: { en: { info: 25, main: 34 }, zh: { info: 28, main: 40 } },
    // display −0.045 em, numerals −0.06 em, mono labels +0.08 em in capitals; Chinese at 0 and as written
    tracking: { en: { display: -0.045, numeral: -0.06, label: 0.08 }, zh: { display: 0, numeral: 0, label: 0 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.0, zh: 1.25 },
  },
  // column i (1..12) starts at 96 + 146 (i − 1); header rule y 116, footer rule y 962; page head rule y 300
  grid: { cols: 12, margin: 96, gutter: 24, column: 122, baseline: 8, safe: [96, 54], header: 116, footer: 962, pageRule: 300 },
  camera: { habit: 'locked', maxScale: 1, shutter: 0.5, ease: { enter: 'expo.out', move: 'expo.inOut', exit: 'power3.in' } },
  // a static seeded print tooth (fbm fibre + fine noise), soft-light at 0.5; no glow, no vignette
  texture: { grain: 0, paper: 0.5, glow: null, vignette: 0, light: 'none' },
  motion: { spring: null, enterBeats: 1.1, exitShare: 0.66, exit: 0.25, exitLead: 0.125 },
};

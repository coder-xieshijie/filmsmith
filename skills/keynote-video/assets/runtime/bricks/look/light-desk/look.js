// light-desk — the look of the exhibit style: real prints in neutral mounts on a light desk (or a dark one) under an
// overhead camera, label stock for the mounts' bars, the chips and the readings, and one pencil (red, or blue for red
// assets) that strokes what the film points at: a ring, a dimension, a route, the rule under the name. Instrument
// Sans for captions, chips and the name; IBM Plex Mono for sources, notes and the address (SPEC 3.4).
// From the exhibit template (assets/templates/exhibit/palettes.js, film.js type and desk, layout.js): the four presets
// keep the template's hexes; `panel` is the label stock, `line` the mat (the mounts' edges and the numerals),
// `onPaper` the type on stock (sink); `muted` and `smuted` (secondary type on the desk and on stock) are extra roles.
// Contrast is WCAG 2 measured from the hex values.
export default {
  id: 'light-desk', kind: 'look',
  palettes: [
    { id: 'lightbox', name: { en: 'Light desk, red pencil', zh: '浅色桌面，红铅笔' }, dark: false,
      roles: { ground: '#ECEBE6', panel: '#FBFAF7', ink: '#17181B', dim: '#5A5C60', line: '#DAD8D2', accent: '#D0233D',
               onAccent: '#FBFAF7', paper: '#FBFAF7', onPaper: '#17181B', muted: '#4C4E52', smuted: '#55575C' },
      alias: { stock: 'panel', mat: 'line', sink: 'onPaper' },
      contrast: { 'ink/ground': 14.87, 'muted/ground': 6.98, 'dim/ground': 5.61, 'onPaper/panel': 17.01, 'smuted/panel': 6.93, 'accent/ground': 4.41, 'accent/panel': 5.04 },
      accentMeans: 'what the film points at now: a ring, a lifted reading’s edge, a dimension, the route, the rule' },
    { id: 'lightbox-pencil', name: { en: 'Light desk, blue pencil', zh: '浅色桌面，蓝铅笔' }, dark: false,
      roles: { ground: '#ECEBE6', panel: '#FBFAF7', ink: '#17181B', dim: '#5A5C60', line: '#DAD8D2', accent: '#677BFE',
               onAccent: '#FBFAF7', paper: '#FBFAF7', onPaper: '#17181B', muted: '#4C4E52', smuted: '#55575C' },
      alias: { stock: 'panel', mat: 'line', sink: 'onPaper' },
      contrast: { 'ink/ground': 14.87, 'muted/ground': 6.98, 'dim/ground': 5.61, 'onPaper/panel': 17.01, 'smuted/panel': 6.93, 'accent/ground': 3.01, 'accent/panel': 3.44 },
      accentMeans: 'what the film points at now (for assets that are themselves red, pink or orange)' },
    { id: 'grease', name: { en: 'Dark desk, grease-pencil red', zh: '深色桌面，油性红笔' }, dark: true,
      roles: { ground: '#141518', panel: '#EEECE6', ink: '#ECEBE6', dim: '#909290', line: '#26282C', accent: '#E02944',
               onAccent: '#EEECE6', paper: '#EEECE6', onPaper: '#17181B', muted: '#A9AAA6', smuted: '#55575C' },
      alias: { stock: 'panel', mat: 'line', sink: 'onPaper' },
      contrast: { 'ink/ground': 15.3, 'muted/ground': 7.81, 'dim/ground': 5.83, 'onPaper/panel': 15.03, 'smuted/panel': 6.12, 'accent/ground': 3.97, 'accent/panel': 3.89 },
      accentMeans: 'what the film points at now (dark captures: terminals, dark UIs, dark charts)' },
    { id: 'pencil', name: { en: 'Dark desk, blue pencil', zh: '深色桌面，蓝铅笔' }, dark: true,
      roles: { ground: '#141518', panel: '#EEECE6', ink: '#ECEBE6', dim: '#909290', line: '#26282C', accent: '#677BFE',
               onAccent: '#EEECE6', paper: '#EEECE6', onPaper: '#17181B', muted: '#A9AAA6', smuted: '#55575C' },
      alias: { stock: 'panel', mat: 'line', sink: 'onPaper' },
      contrast: { 'ink/ground': 15.3, 'muted/ground': 7.81, 'dim/ground': 5.83, 'onPaper/panel': 15.03, 'smuted/panel': 6.12, 'accent/ground': 5.08, 'accent/panel': 3.04 },
      accentMeans: 'what the film points at now (the dark desk with red assets)' },
  ],
  type: {
    // display: the name (Instrument Sans 600, 140 px), chip values (700, 76); text: captions (600, 59), reading labels
    // (44), chip labels (500, 32); mono: sources, notes (25; Chinese 28) and the address (40). Index numerals (220,
    // 800) are Latin digits and stay in the Latin face.
    families: {
      display: { en: ['Instrument Sans'], zh: ['Instrument Sans', 'Noto Sans SC'] },
      text: { en: ['Instrument Sans'], zh: ['Instrument Sans', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Instrument Sans', file: 'InstrumentSans-VF.ttf', weight: '400 700', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // ratio 4/3 from the 25 px floor: 25 · 33 · 44 · 59 · 79 · 105 · 140 (Chinese from 28)
    scale: { en: [25, 33, 44, 59, 79, 105, 140], zh: [28, 33, 44, 59, 79, 105, 140] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: 0, text: 0, label: 0 }, zh: { display: 0, text: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.2, zh: 1.35 },
  },
  // the rest window: content 1200 × 675 at (360, 224) under a 54 px bar; the index numeral at (48, 330); the chip
  // 570 × 190 at (1290, 770); captions 76 px under the mount; prints one screen (1920 px) apart; three planes at
  // rates 0.3 · 1 · 1.65
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 54], mount: [360, 170, 1200, 675], bar: 54, chip: [1290, 770, 570, 190], spacing: 1920, depth: [0.3, 1, 1.65] },
  camera: { habit: 'truck', maxScale: 1.333, shutter: 0.5, ease: { enter: 'smooth', move: 'smooth', exit: 'smooth' } },
  // a fixed-seed fibre texture on the back plane (soft light, 50 %), the cutting mat's grid with desk 'mat', and the
  // light falling off toward the frame's edges (10 % at the corners on the light desk, 38 % on the dark)
  texture: { grain: 0.5, glow: null, vignette: 0.1, light: 'falloff', mat: { step: 80, alpha: 0.22 } },
  motion: { spring: 10, enterBeats: 0.3, exitShare: 0.5 },
};

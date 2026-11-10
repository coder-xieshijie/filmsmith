// device-margin — the look of the handset style: one head-on code-drawn device on a near-black (or porcelain) ground,
// its edge the outline, its screen showing only real captures; one accent that marks only the region of the screen in
// play (the ring, the level tick); Inter Tight for the margin's value and lines, IBM Plex Mono for notes, the chin's
// source line and the address (SPEC 3.4).
// From the handset template (assets/templates/handset/palettes.js, film.js TYPE, the mode card's Type and Frame):
// the three presets keep the template's hexes; `panel` is the lid, `line` its 2 px edge, the device's other neutrals
// (`deck`, `deckEdge`, `glass`, `cam`) and the secondary text tone `muted` are extra roles. The veil (a share of the
// ground laid over the screen outside the lit region) is a palette value, not a colour role.
// Contrast is WCAG 2 measured from the hex values.
export default {
  id: 'device-margin', kind: 'look',
  palettes: [
    { id: 'graphite', name: { en: 'Graphite and focus lime', zh: '石墨与亮青柠' }, dark: true,
      roles: { ground: '#0E1013', panel: '#1A1D22', ink: '#ECEEF1', dim: '#8B929C', line: '#30353C', accent: '#ADE05E',
               onAccent: '#0E1013', paper: '#ECEEF1', onPaper: '#0E1013',
               muted: '#A9AFB8', deck: '#22262C', deckEdge: '#3B4048', glass: '#07080A', cam: '#2B3037' },
      alias: { bg: 'ground', lid: 'panel', lidEdge: 'line', key: 'ground' },
      veil: 0.52,
      contrast: { 'ink/ground': 16.39, 'muted/ground': 8.63, 'dim/ground': 6.07, 'dim/panel': 5.38, 'accent/ground': 12.34 },
      accentMeans: 'the region of the screen in play: the ring round it and the level tick beside it' },
    { id: 'umber', name: { en: 'Warm graphite and amber', zh: '暖石墨与琥珀' }, dark: true,
      roles: { ground: '#100F0D', panel: '#1C1B18', ink: '#EFEDE8', dim: '#948F85', line: '#34322D', accent: '#FFB45C',
               onAccent: '#100F0D', paper: '#EFEDE8', onPaper: '#100F0D',
               muted: '#B1ACA2', deck: '#25231F', deckEdge: '#403D37', glass: '#080807', cam: '#2E2C28' },
      alias: { bg: 'ground', lid: 'panel', lidEdge: 'line', key: 'ground' },
      veil: 0.52,
      contrast: { 'ink/ground': 16.37, 'muted/ground': 8.48, 'dim/ground': 5.95, 'dim/panel': 5.35, 'accent/ground': 10.89 },
      accentMeans: 'the region of the screen in play (captures that are green or teal)' },
    { id: 'porcelain', name: { en: 'Porcelain and deep green', zh: '瓷白与深绿' }, dark: false,
      roles: { ground: '#ECEEF1', panel: '#D3D7DD', ink: '#14161A', dim: '#50565F', line: '#B8BEC6', accent: '#3D7A0A',
               onAccent: '#ECEEF1', paper: '#ECEEF1', onPaper: '#14161A',
               muted: '#454B53', deck: '#C5CAD1', deckEdge: '#AEB4BC', glass: '#101215', cam: '#B8BEC6' },
      alias: { bg: 'ground', lid: 'panel', lidEdge: 'line', key: 'ground' },
      veil: 0.4,
      contrast: { 'ink/ground': 15.58, 'muted/ground': 7.58, 'dim/ground': 6.37, 'dim/panel': 5.12, 'accent/ground': 4.53 },
      accentMeans: 'the region of the screen in play (a light film, or a dark-mode product)' },
  ],
  type: {
    // display: the margin's value or name (Inter Tight 700, 95 px, 76 for the whole film when a value does not fit);
    // text: the margin's lines (Inter Tight 600, 49 px); mono: notes, the chin's source line, the address (IBM Plex
    // Mono 500, 25 px; Chinese 28 px). Chinese lines wrap inside the 448 px margin (lang.js wrap) instead of shrinking.
    families: {
      display: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // 25 × 1.25ⁿ: 25 · 31 · 39 · 49 · 61 · 76 · 95 · 119; in use 95 (or 76) / 49 / 25 (Chinese notes 28)
    scale: { en: [25, 31, 39, 49, 61, 76, 95, 119], zh: [28, 31, 39, 49, 61, 76, 95, 119] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.02, text: -0.01, label: 0 }, zh: { display: 0, text: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.36, zh: 1.4 },
  },
  // the laptop: lid (96, 131) 1192 × 800, screen (116, 151) 1152 × 720, chin 31 px above the deck, deck 1272 × 18;
  // the margin x 1376–1824 (448 px); the phone: body (300, 48) 440 × 920, screen 400 × 840, margin x 828–1824
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 96], copy: { laptop: [1376, 448], phone: [828, 996] } },
  camera: { habit: 'locked', maxScale: 1.333, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  // a fixed seeded 256 px grain at 4 % overlay; no glow, no vignette, no shadow, no reflection
  texture: { grain: 0.04, glow: null, vignette: 0, light: 'none' },
  motion: { spring: 10, enterBeats: 0.72, exitShare: 0.4 },
};

// drafting-sheet — the look of the blueprint style: one engineering drawing printed on reprographic paper. A ground
// outside the sheet, the sheet itself, line work in two weights (ink for main lines and titles, line for fine lines,
// dimensions and labels), ONE accent for a person's annotation or approval; a fine 40 px and a major 200 px drafting
// grid, a seeded paper tile, a warm lamp drifting over the sheet, a vignette; IBM Plex Sans Condensed and Plex Mono
// on ISO 3098's √2 series (25 · 35 · 50 · 70 · 100 · 140 · 200 · 280).
// From the blueprint template (assets/templates/blueprint/palettes.js; sheets/common.js ISO, F; fx.js strokeStyle):
// the six presets keep the template's hexes; `coral` is renamed `oxblood` and `graphite` `graphite-film` (both ids
// are taken by other looks); `ground` is the template's bg, `dim` its muted.
const base = (ground, paper, ink, line, muted, accent, onAccent) => ({ ground, panel: paper, paper, ink, line, dim: muted, muted, accent, onAccent });
export default {
  id: 'drafting-sheet', kind: 'look',
  palettes: [
    { id: 'cyanotype', name: { en: 'Cyanotype', zh: '蓝晒' }, dark: true,
      roles: base('#0A2652', '#10356C', '#EAF3FF', '#9FD3FF', '#BCD6F3', '#FFB547', '#0A2652'),
      grid: [0.075, 0.16], texture: { mode: 'screen', alpha: 0.5 }, lamp: { color: '#FFD6A0', alpha: 0.085, mode: 'screen' }, vignette: { color: '#05122C', alpha: 0.5 },
      contrast: { 'ink/paper': 10.73, 'line/paper': 7.57, 'dim/paper': 8.04, 'accent/paper': 6.84, 'onAccent/accent': 8.47 },
      accentMeans: 'a person’s annotation or approval: CONFIRMED and APPROVED stamps, revision marks, the bracket on chosen answers, YOU' },
    { id: 'diazo', name: { en: 'Diazo night', zh: '重氮夜色' }, dark: true,
      roles: base('#050B18', '#0A1630', '#E6EDF8', '#8EB4E8', '#B0C1DB', '#FFB547', '#0A1630'),
      grid: [0.06, 0.14], texture: { mode: 'screen', alpha: 0.42 }, lamp: { color: '#FFD6A0', alpha: 0.07, mode: 'screen' }, vignette: { color: '#02060F', alpha: 0.55 },
      contrast: { 'ink/paper': 15.24, 'line/paper': 8.41, 'dim/paper': 9.82, 'accent/paper': 10.21, 'onAccent/accent': 10.21 },
      accentMeans: 'a person’s annotation or approval (dark platforms, a quieter film)' },
    { id: 'blueline', name: { en: 'Blueline print', zh: '蓝线图' }, dark: false,
      roles: base('#C5CED9', '#F3F5F1', '#14306A', '#2D5CA3', '#3C5479', '#A85200', '#F3F5F1'),
      grid: [0.09, 0.2], texture: { mode: 'multiply', alpha: 0.32 }, lamp: { color: '#FFE2B8', alpha: 0.22, mode: 'multiply' }, vignette: { color: '#4A5A70', alpha: 0.28 },
      contrast: { 'ink/paper': 11.53, 'line/paper': 6.04, 'dim/paper': 7, 'accent/paper': 4.94, 'onAccent/accent': 4.94 },
      accentMeans: 'a person’s annotation or approval (light, print-like pages)' },
    { id: 'vellum', name: { en: 'Vellum original', zh: '硫酸纸原稿' }, dark: false,
      roles: base('#D7D8D3', '#F4F3EE', '#2B2E33', '#565C64', '#474C54', '#A85200', '#F4F3EE'),
      grid: [0.05, 0.11], texture: { mode: 'multiply', alpha: 0.26 }, lamp: { color: '#FFE6C4', alpha: 0.16, mode: 'multiply' }, vignette: { color: '#5A5C58', alpha: 0.22 },
      contrast: { 'ink/paper': 12.26, 'line/paper': 6.08, 'dim/paper': 7.78, 'accent/paper': 4.88, 'onAccent/accent': 4.88 },
      accentMeans: 'a person’s annotation or approval, on the pencil original before it is issued' },
    { id: 'oxblood', name: { en: 'Oxblood', zh: '牛血红' }, dark: true,
      roles: base('#220A0B', '#311414', '#FAF1EE', '#BACAD4', '#DCCDC9', '#FF6452', '#311414'),
      grid: [0.06, 0.13], texture: { mode: 'screen', alpha: 0.4 }, lamp: { color: '#FFD1C1', alpha: 0.06, mode: 'screen' }, vignette: { color: '#0F0203', alpha: 0.55 },
      contrast: { 'ink/paper': 15.22, 'line/paper': 10.06, 'dim/paper': 10.98, 'accent/paper': 5.8, 'onAccent/accent': 5.8 },
      accentMeans: 'a person’s annotation or approval (a warm red brand)' },
    { id: 'graphite-film', name: { en: 'Graphite film', zh: '石墨胶片' }, dark: true,
      roles: base('#0F1114', '#1A1E23', '#ECEEF1', '#A9B6C3', '#BCC4CD', '#FFB547', '#1A1E23'),
      grid: [0.06, 0.13], texture: { mode: 'screen', alpha: 0.38 }, lamp: { color: '#FFD6A0', alpha: 0.06, mode: 'screen' }, vignette: { color: '#050607', alpha: 0.55 },
      contrast: { 'ink/paper': 14.41, 'line/paper': 8.11, 'dim/paper': 9.5, 'accent/paper': 9.53, 'onAccent/accent': 9.53 },
      accentMeans: 'a person’s annotation or approval (when blue clashes with the brand)' },
  ],
  type: {
    // titles, claims, values and stamp words: IBM Plex Sans Condensed 500–700; labels, notes, commands and the HUD:
    // IBM Plex Mono 400–600. Chinese takes Noto Sans SC after the Latin family, as written (no capitals), no tracking.
    families: {
      display: { en: ['Plex Condensed'], zh: ['Plex Condensed', 'Noto Sans SC'] },
      text: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Plex Condensed', file: 'IBMPlexSansCondensed-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'Plex Condensed', file: 'IBMPlexSansCondensed-SemiBold.ttf', weight: '600', licence: 'OFL-1.1' },
      { family: 'Plex Condensed', file: 'IBMPlexSansCondensed-Bold.ttf', weight: '700', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Regular.ttf', weight: '400', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.ttf', weight: '600', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // ISO 3098 at 10 px a millimetre; Chinese lifts the two small steps to the library floors (labels 28, notes 40)
    scale: { en: [25, 35, 50, 70, 100, 140, 200, 280], zh: [28, 40, 50, 70, 100, 140, 200, 280] },
    floors: { en: { info: 25, main: 35 }, zh: { info: 28, main: 40 } },
    // labels in capitals tracked 0.14 em like drafting lettering; titles −0.02 em; Chinese as written, no tracking
    tracking: { en: { display: -0.02, label: 0.14 }, zh: { display: 0, label: 0 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.0, zh: 1.2 },
  },
  // a sheet is 1920 × 1080 at 1:1; content x 150–1790; HUD border at 24 / 36 px; title block bottom right 156 px tall
  grid: { cols: 1, margin: 150, gutter: 120, column: 1640, baseline: 10, safe: [60, 140], fine: 40, major: 200, majorOffset: 120 },
  camera: { habit: 'travel', maxScale: 1.12, shutter: 0.5, ease: { enter: 'power3.inOut', move: 'power3.inOut', exit: 'accel' } },
  // seeded paper tile (screen or multiply at the preset's alpha × 0.35), overlay grain, a drifting warm lamp, vignette
  texture: { grain: 0.05, paper: 0.35, glow: null, vignette: 0.5, light: 'lamp' },
  motion: { spring: null, enterBeats: 1, exitShare: 0.6, exit: 0.6, exitLead: 0 },
};

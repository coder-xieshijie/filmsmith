// one-line — the look of the thread style: one line colour that becomes everything (line, caret, full stop, swatch,
// panel, spheres, riders, playhead, ink dye, flood, the URL's underline) on a near-black ground, a second ground (the
// field) that only ever fills large areas, flat graphic type and shapes, volume only where something is an object.
// Bricolage Grotesque for display (the big word swings 200–800), Instrument Serif Italic for the serif voice (notes,
// the formula, the ink's words, the closing line), JetBrains Mono for what is typed and the labels.
// From the thread template (assets/templates/thread/palettes.js, fx.js TYPE): the four presets keep the template's
// hexes; `vermilion` is renamed `cobalt-vermilion` and `paper` `vermilion-paper` (both ids are taken by other looks).
// Chinese: Noto Sans SC after the grotesque and the mono, Noto Serif SC after the serif, set upright (no italic in
// Chinese), no tracking; labels 28 px.
// Library roles: ink is the template's text colour, accent its line colour (the thread), onAccent its onLine; field and
// onField are the second ground and the text on it; dim (text 42 % toward the ground, 35 % on paper) and line (78 %, a
// divider) are derived for library bricks; the thread's own bricks never draw them.
const roles = (ground, panel, ink, accent, onAccent, field, onField, dim, line) => ({ ground, panel, ink, dim, line, accent, onAccent, field, onField });
export default {
  id: 'one-line', kind: 'look',
  palettes: [
    { id: 'cobalt-vermilion', name: { en: 'Vermilion on cobalt', zh: '钴蓝上的朱红' }, dark: true,
      roles: roles('#0B0B0D', '#17171B', '#EDEAE2', '#EE4938', '#0B0B0D', '#2E2EF4', '#EDEAE2', '#8E8C89', '#3D3C3C'),
      contrast: { 'ink/ground': 16.36, 'accent/ground': 5.29, 'onAccent/accent': 5.29, 'onField/field': 6.21 },
      accentMeans: 'the thread: the one object that carries the work from step to step (the default; tools, studios)' },
    { id: 'ultramarine', name: { en: 'Ultramarine on saffron', zh: '藏青配藏红花黄' }, dark: true,
      roles: roles('#0A0B10', '#161823', '#ECEDF2', '#6B7BFF', '#0A0B10', '#F2B630', '#0A0B10', '#8D8E93', '#3C3D42'),
      contrast: { 'ink/ground': 16.81, 'accent/ground': 5.53, 'onAccent/accent': 5.53, 'onField/field': 10.77 },
      accentMeans: 'the thread (calm, technical, product reels)' },
    { id: 'rose', name: { en: 'Rose on deep teal', zh: '深青上的玫红' }, dark: true,
      roles: roles('#0D0B0E', '#1A161B', '#F0EAEE', '#FF4F9A', '#0D0B0E', '#0B6658', '#F0EAEE', '#918C90', '#3F3C3F'),
      contrast: { 'ink/ground': 16.53, 'accent/ground': 6.38, 'onAccent/accent': 6.38, 'onField/field': 5.8 },
      accentMeans: 'the thread (creative tools, culture)' },
    { id: 'vermilion-paper', name: { en: 'Vermilion on paper', zh: '纸上的朱红' }, dark: false,
      roles: roles('#EEEAE1', '#E0DBD0', '#141416', '#EE4938', '#141416', '#2E2EF4', '#EEEAE1', '#605F5D', '#BEBBB4'),
      contrast: { 'ink/ground': 15.32, 'accent/ground': 3.1, 'onAccent/accent': 4.95, 'onField/field': 6.22 },
      accentMeans: 'the thread (print, editorial, daytime)' },
  ],
  type: {
    // display: Bricolage Grotesque 200–800 at −0.02 to −0.03 em; serif: Instrument Serif Italic; mono: JetBrains Mono
    // 500 (700 on the field and the flood), +0.18 em on labels. Chinese: Noto Sans SC / Noto Serif SC after each
    // family, the serif upright, no tracking.
    families: {
      display: { en: ['Bricolage Grotesque'], zh: ['Bricolage Grotesque', 'Noto Sans SC'] },
      text: { en: ['Instrument Serif'], zh: ['Instrument Serif', 'Noto Serif SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Bricolage Grotesque', file: 'BricolageGrotesque-VF.ttf', weight: '200 800', licence: 'OFL-1.1' },
      { family: 'Instrument Serif', file: 'InstrumentSerif-Italic.ttf', weight: '400', style: 'italic', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
      { family: 'Noto Serif SC', file: 'NotoSerifSC-VF.ttf', weight: '200 900', licence: 'OFL-1.1', subset: true },
    ],
    scale: { en: [26, 34, 44, 58, 76, 98, 196, 230, 360], zh: [28, 34, 44, 58, 76, 98, 196, 230, 360] },
    floors: { en: { info: 26, main: 44 }, zh: { info: 28, main: 44 } },
    tracking: { en: { display: -0.02, numeral: -0.02, label: 0.18 }, zh: { display: 0, numeral: 0, label: 0 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: true, zh: false },
    leading: { en: 1.0, zh: 1.15 },
  },
  // stage label at x 150 (mark 16 px at y 90, label baseline 106, note 152); static elements ≥ 150 px from the sides,
  // ≥ 90 px from top and bottom; content area y 170–1080
  grid: { cols: 12, margin: 150, gutter: 40, column: 100, baseline: 2, safe: [150, 90], header: [150, 106] },
  camera: { habit: 'locked', maxScale: 1.06, shutter: 0.5, ease: { enter: 'crit', move: 'expo.inOut', exit: 'expo.in' } },
  // seeded full-range grain, overlay 12 %; no glow, no vignette, no HUD
  texture: { grain: 0.12, paper: 0, glow: null, vignette: 0, light: 'flat' },
  motion: { spring: { omega: [14, 26], damping: 'critical' }, enterBeats: 0.5, exitShare: 0.4, exit: 0.13, exitLead: 0.05 },
};

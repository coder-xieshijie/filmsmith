// reel-box — the look of the strip style: one strip of real film on a light box (or an editing bench), the strip's
// black base and sprocket holes, intertitle frames set in the strip, labels on the box, and ONE accent: the grease
// pencil (a china marker) that rings the pick and underlines the address. The colours inside the frames are content,
// never palette. Hanken Grotesk for intertitles, captions, labels and the name; DM Mono for lengths and the address.
// From the strip template (assets/templates/strip/palettes.js, film.js type and light box): the three presets keep
// the template's hexes; `panel` / `onPanel` are the intertitle frame and its type, `line` the gate's corner marks
// (the template's dim); `base`, `glow`, `hole`, `title`, `titleInk`, `trackDim`, `trackLit` are the template's own
// roles, kept by name for the runtime's strip painters. Contrast is WCAG 2 measured from the hex values.
const strip = (o) => ({ title: o.panel, titleInk: o.onPanel, ...o });
export default {
  id: 'reel-box', kind: 'look',
  palettes: [
    { id: 'lightbox-carmine', name: { en: 'Light box, carmine china marker', zh: '灯箱，洋红蜡笔' }, dark: false,
      roles: strip({ ground: '#ECEFEE', panel: '#1B1D1F', ink: '#14171A', dim: '#565C61', line: '#565C61', accent: '#C2185B', onAccent: '#ECEFEE', paper: '#F5F7F6', onPaper: '#14171A', onPanel: '#ECEFEE', muted: '#474D51', glow: '#F5F7F6', base: '#0B0C0D', hole: '#ECEFEE', trackDim: '#2B2E31', trackLit: '#C9CFCC' }),
      contrast: { 'ink/ground': 15.55, 'muted/ground': 7.41, 'dim/ground': 5.86, 'onPanel/panel': 14.61, 'accent/ground': 5.08, 'accent/base': 3.33 },
      accentMeans: 'the grease pencil: the loop round the picked cell, the underline of the address' },
    { id: 'lightbox-blue', name: { en: 'Light box, blue china marker', zh: '灯箱，蓝蜡笔' }, dark: false,
      roles: strip({ ground: '#ECEFEE', panel: '#1B1D1F', ink: '#14171A', dim: '#565C61', line: '#565C61', accent: '#2F5BD8', onAccent: '#ECEFEE', paper: '#F5F7F6', onPaper: '#14171A', onPanel: '#ECEFEE', muted: '#474D51', glow: '#F5F7F6', base: '#0B0C0D', hole: '#ECEFEE', trackDim: '#2B2E31', trackLit: '#C9CFCC' }),
      contrast: { 'ink/ground': 15.55, 'muted/ground': 7.41, 'dim/ground': 5.86, 'onPanel/panel': 14.61, 'accent/ground': 5.03, 'accent/base': 3.36 },
      accentMeans: 'the grease pencil, for a pick whose frame is red, pink or magenta' },
    { id: 'flatbed', name: { en: 'Editing bench, pink china marker', zh: '剪辑台，粉蜡笔' }, dark: true,
      roles: strip({ ground: '#17191A', panel: '#1B1D1F', ink: '#E9ECEA', dim: '#8F9693', line: '#8F9693', accent: '#F58FB8', onAccent: '#17191A', paper: '#1F2223', onPaper: '#E9ECEA', onPanel: '#ECEFEE', muted: '#A9AFAC', glow: '#1F2223', base: '#050606', hole: '#3A3F41', trackDim: '#202325', trackLit: '#C9CFCC' }),
      contrast: { 'ink/ground': 14.83, 'muted/ground': 7.91, 'dim/ground': 5.84, 'onPanel/panel': 14.61, 'accent/ground': 7.98, 'accent/base': 9.18 },
      accentMeans: 'the grease pencil, for frames that are mostly dark (night terminals, dark interfaces)' },
  ],
  type: {
    // display: intertitles (Hanken Grotesk 700, 79 px in the gate) and the name (700, 140); text: captions under the
    // gate (600, 59) and the sheet's row names (600, 33); mono: the measured lengths (DM Mono 500, 33) and the address
    // (44). Chinese: Noto Sans SC after the Latin family; intertitles keep 79 px and wrap inside the frame.
    families: {
      display: { en: ['Hanken Grotesk'], zh: ['Hanken Grotesk', 'Noto Sans SC'] },
      text: { en: ['Hanken Grotesk'], zh: ['Hanken Grotesk', 'Noto Sans SC'] },
      mono: { en: ['DM Mono'], zh: ['DM Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Hanken Grotesk', file: 'HankenGrotesk-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'DM Mono', file: 'DMMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    scale: { en: [25, 33, 44, 59, 79, 105, 140], zh: [28, 33, 44, 59, 79, 105, 140] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: 0, text: 0, label: 0 }, zh: { display: 0, text: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.15, zh: 1.3 },
  },
  // the gate: a frame 832 × 468 registered at the centre (its strip's top at 156, its centre at y 486); a strip is
  // 660 strip px tall at scale 1, cells 860 apart; captions on y 950 (984 under the sheet); the contact sheet's rows
  // 84 px apart from x 432 at scale 96 / 832, 4 s a cell
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 54], gate: [544, 252, 832, 468], strip: { pitch: 860, height: 660 }, caption: 950, sheet: { x: 432, top: 56, pitch: 84, k: 0.1154, secPerCell: 4 } },
  camera: { habit: 'locked', maxScale: 1.333, shutter: 0.5, ease: { enter: 'smooth', move: 'smooth', exit: 'smooth' } },
  // a light box: the ground with a brighter glow at the gate's centre (radial, static); no grain; the optical track
  // lights once, swept left to right
  texture: { grain: 0, glow: { role: 'glow', radius: 1150 }, vignette: 0, light: 'lightbox' },
  motion: { spring: 10, enterBeats: 0.25, exitShare: 0 },
};

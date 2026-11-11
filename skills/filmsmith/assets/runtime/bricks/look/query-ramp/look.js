// query-ramp — the look of the pulse style: grounds that walk one hue's lightness ramp (four steps plus a tinted
// near-white), white type on the dark steps and ramp[0] / ramp[1] on the light ones, amber for the answer only, huge
// condensed black words at one anchor, Barlow for lines, a mono query line (SPEC 3.4).
// From the pulse template (assets/templates/pulse/palettes.js, film.js grid and type): the four presets keep the
// template's hexes; roles: ground = ramp[0], panel = ramp[1], ink = the near-white, paper = ramp[3]; the ramp itself
// travels as the extra roles r0–r3 and white (which ground each text colour sits on: kit.js onGround).
// Chinese has no condensed black: display words are set in Noto Sans SC 900 as 长体 (a horizontal scale of 0.84, the
// condensed setting of Chinese headline type), kit.js `zhScale`. Contrast is WCAG 2 measured from the hex values.
const pal = (id, name, ramp, white, dim, accent, extra = {}) => ({
  id, name, dark: true,
  roles: { ground: ramp[0], panel: ramp[1], ink: white, dim, line: ramp[1], accent, onAccent: ramp[0], paper: ramp[3], onPaper: ramp[0],
           r0: ramp[0], r1: ramp[1], r2: ramp[2], r3: ramp[3], white },
  alias: { text: 'ink', quiet: 'dim', hop: 'r2', rule: 'r1' },
  ...extra,
});
export default {
  id: 'query-ramp', kind: 'look',
  palettes: [
    pal('indigo', { en: 'Indigo', zh: '靛蓝' }, ['#0D0C14', '#24206B', '#4B43E6', '#ECEAF7'], '#F4F3FA', '#8F8CA8', '#FFC53D',
      { contrast: { 'ink/ground': 17.64, 'dim/ground': 6.01, 'accent/ground': 12.32, 'ink/panel': 12.75, 'accent/panel': 8.91, 'ink/r2': 5.87, 'r1/white': 12.75, 'onAccent/accent': 12.32 },
        accentMeans: 'the answer: the locked cell, the revealed value, the version that is the answer' }),
    pal('petrol', { en: 'Petrol', zh: '石油青' }, ['#071214', '#0C3A40', '#0F717A', '#E1F0F0'], '#F2F8F8', '#7E9A9D', '#FFC53D',
      { contrast: { 'ink/ground': 17.69, 'dim/ground': 6.33, 'accent/ground': 12.03, 'ink/panel': 11.54, 'accent/panel': 7.85, 'ink/r2': 5.34, 'r1/white': 11.54, 'onAccent/accent': 12.03 },
        accentMeans: 'the answer' }),
    pal('graphite', { en: 'Graphite', zh: '石墨' }, ['#0E0F11', '#2A2D33', '#5A606B', '#E9EAEC'], '#F5F5F6', '#8E939C', '#FFC53D',
      { contrast: { 'ink/ground': 17.6, 'dim/ground': 6.21, 'accent/ground': 12.15, 'ink/panel': 12.67, 'accent/panel': 8.74, 'ink/r2': 5.81, 'r1/white': 12.67, 'onAccent/accent': 12.15 },
        accentMeans: 'the answer' }),
    pal('coral-ramp', { en: 'Coral red', zh: '珊瑚红' }, ['#1C080C', '#561525', '#B42F52', '#F8E1E4'], '#FCF5F5', '#AD9093', '#FF6452',
      { contrast: { 'ink/ground': 17.92, 'dim/ground': 6.6, 'accent/ground': 6.61, 'ink/panel': 12.76, 'accent/panel': 4.7, 'ink/r2': 5.63, 'r1/white': 12.76, 'onAccent/accent': 6.61 },
        accentOn: ['r0', 'r1'], accentMeans: 'the answer (on ramp[0] and ramp[1] only)' }),
  ],
  type: {
    // display: asked words, verdict, cell labels, figures, the name (Barlow Condensed 900); text: lines (Barlow 600) and
    // the answer (Barlow 700, whose 0 opens a counter wide enough to push through); mono: the query line
    families: {
      display: { en: ['Barlow Condensed'], zh: ['Barlow Condensed', 'Noto Sans SC'] },
      text: { en: ['Barlow'], zh: ['Barlow', 'Noto Sans SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Barlow Condensed', file: 'BarlowCondensed-Black.ttf', weight: 900, licence: 'OFL-1.1' },
      { family: 'Barlow', file: 'Barlow-SemiBold.ttf', weight: 600, licence: 'OFL-1.1' },
      { family: 'Barlow', file: 'Barlow-Bold.ttf', weight: 700, licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // 25 × 1.25ⁿ in use; Chinese query and labels start at 31 too (the smallest text is the 31 px query line)
    scale: { en: [31, 49, 61, 186, 233, 291, 364, 455, 568], zh: [31, 49, 61, 186, 233, 291, 364, 455, 568] },
    floors: { en: { info: 31, main: 49 }, zh: { info: 31, main: 49 } },
    tracking: { en: { display: -0.01, wide: -0.015, label: 0 }, zh: { display: 0, wide: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.0, zh: 1.15 },
    // 长体: Chinese display words are scaled horizontally (kit.js); Latin keeps its condensed face
    zhScale: 0.84,
  },
  grid: { cols: 12, margin: 160, gutter: 40, baseline: 8, safe: [160, 54], anchor: [160, 660], query: 990 },
  camera: { habit: 'locked', maxScale: 1.14, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  texture: { grain: 0.05, glow: null, vignette: 0, light: 'none' },
  motion: { spring: 10, enterBeats: 0.4, exitShare: 0.66 },
};

// diff-paper — the look of the split style: one movable seam divides the frame into the input side (paper, where
// everything is written: requests, lists, real lines of a real file, commands, the install line) and the result side
// (real frames and pages on a dark bench). ONE accent: the seam, its copies, its grip, the caret and the one mark that
// pairs an input with a result; colours inside results are content, never palette. Archivo (semi-expanded 700) for
// claims and the name, JetBrains Mono for everything that really is code, a command, a path or a report.
// From the split template (assets/templates/split/palettes.js, film.js type): the three presets keep the template's
// hexes; `ground` is the paper, `panel` the bench, `line` the dim tone; `paper`, `bench`, `onBench`, `mutedOnBench`
// and `key` (the seam's 2 px edges) are the template's own roles, kept by name. Contrast is WCAG 2 measured from the
// hex values.
const split = (o) => ({ ground: o.paper, panel: o.bench, line: o.dim, onAccent: o.paper, onPaper: o.ink, onPanel: o.onBench, ...o });
export default {
  id: 'diff-paper', kind: 'look',
  palettes: [
    { id: 'diff-teal', name: { en: 'Paper and diff teal', zh: '纸面与 diff 青' }, dark: false,
      roles: split({ paper: '#F3F2EE', ink: '#16171A', muted: '#4A4F57', dim: '#5C626B', bench: '#15171A', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5', accent: '#007C72', key: '#F3F2EE' }),
      contrast: { 'ink/paper': 16, 'muted/paper': 7.36, 'dim/paper': 5.49, 'onBench/bench': 14.78, 'mutedOnBench/bench': 7.94, 'accent/paper': 4.54, 'accent/bench': 3.53 },
      accentMeans: 'the seam: the edit point between what is written and what it makes (its copies, the grip, the caret, the one pairing mark)' },
    { id: 'diff-night', name: { en: 'Graphite and light teal', zh: '石墨与浅青' }, dark: true,
      roles: split({ paper: '#121417', ink: '#E8E9EB', muted: '#A7ADB5', dim: '#8C929B', bench: '#0B0C0E', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5', accent: '#36B5B0', key: '#121417' }),
      contrast: { 'ink/paper': 15.19, 'muted/paper': 8.16, 'dim/paper': 5.89, 'onBench/bench': 16.11, 'mutedOnBench/bench': 8.65, 'accent/paper': 7.37, 'accent/bench': 7.82 },
      accentMeans: 'the seam, for a product used in a dark editor (light results)' },
    { id: 'diff-plum', name: { en: 'Paper and plum', zh: '纸面与梅紫' }, dark: false,
      roles: split({ paper: '#F3F2EE', ink: '#16171A', muted: '#4A4F57', dim: '#5C626B', bench: '#15171A', onBench: '#E8E9EB', mutedOnBench: '#A7ADB5', accent: '#A23B92', key: '#F3F2EE' }),
      contrast: { 'ink/paper': 16, 'muted/paper': 7.36, 'dim/paper': 5.49, 'onBench/bench': 14.78, 'mutedOnBench/bench': 7.94, 'accent/paper': 5.24, 'accent/bench': 3.06 },
      accentMeans: 'the seam, for results that are green or teal (keep its marks ≥ 4 px)' },
  ],
  type: {
    // display: claims (Archivo 700 semi-expanded, 59 px, −0.6 px) and the name (105, −2 px); mono: the request and the
    // command (JetBrains Mono 500, 44), code, the list and the install line (33; 700 for the picked item), labels,
    // chips and report lines (25). Chinese: Noto Sans SC after the Latin family; claims keep 59 px and wrap on the
    // input side; code, commands and paths stay Latin.
    families: {
      display: { en: ['Archivo'], zh: ['Archivo', 'Noto Sans SC'] },
      text: { en: ['Archivo'], zh: ['Archivo', 'Noto Sans SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Archivo', file: 'Archivo-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    scale: { en: [25, 33, 44, 59, 79, 105], zh: [28, 33, 44, 59, 79, 105] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.01, text: 0, label: 0 }, zh: { display: 0, text: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.25, zh: 1.35 },
  },
  // the seam's places (content-led): vertical at x 900 for request and pick (input 804 px wide), horizontal under the
  // quoted code (y 236 + 46 a line), y 260 for the command band and the diff, the branch at x 1320, the slider from
  // 1320 to 620, the lock-up's seam at x 1000; input hangs from the label (baseline 84); code from x 176, line
  // numbers in a gutter at x 96
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 46, safe: [96, 54], seam: { x: 900, band: 260, branch: 1320, rest: 620, lockup: 1000 }, label: 84, code: { x: 176, gutter: 96, y: 236, step: 46 } },
  camera: { habit: 'locked', maxScale: 1.333, shutter: 0.5, ease: { enter: 'expo-out', move: 'cubic-in-out', exit: 'ease-in' } },
  // nothing over a result: no grain, no veil, no shadow; the seam carries a 2 px key in the paper either side
  texture: { grain: 0, glow: null, vignette: 0, light: 'none' },
  motion: { spring: 0, enterBeats: 0.72, exitShare: 0.4 },
};

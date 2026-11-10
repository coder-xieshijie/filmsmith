// evidence-mat — the look of the dossier style: published pages laid one at a time on a dark mat, front-on, on a
// paper mount with hard stacked edges; the rest of the page veiled 50 % in the mat; one highlighter colour that marks
// only a published claim and its proof (the stroke, the leader's core, the stickers and tabs, the struck name); serif
// claims on the mat with mono terms; a ruled worksheet beside the page that computes; the camera locked (SPEC 3.4).
// From the dossier template (assets/templates/dossier/palettes.js, layout.js, film.js type): roles: ground = the mat,
// ink and dim the type on it, panel = paper (the mount, the worksheet, the index), onPaper and paperMuted the type on
// it, line = the paper's stacked edges, accent and onAccent the highlighter and the type on it.
const BASE = { mat: '#161512', onMat: '#EEEBE2', mutedOnMat: '#A8A396', paper: '#F3F1EA', paperEdge: '#CFCBBF', ink: '#1C1B17', muted: '#5A574E' };
const pal = (id, name, accent, onAccent, contrast, fits) => ({
  id, name, dark: true, fits,
  roles: { ground: BASE.mat, ink: BASE.onMat, dim: BASE.mutedOnMat, panel: BASE.paper, paper: BASE.paper, onPaper: BASE.ink, paperMuted: BASE.muted, line: BASE.paperEdge, accent, onAccent },
  alias: { mat: 'ground', paperEdge: 'line' },
  contrast, accentMeans: 'a published claim and its proof: the stroke over it, the leader to its source, the sticker, the struck name',
});
export default {
  id: 'evidence-mat', kind: 'look',
  palettes: [
    pal('yellow', { en: 'Highlighter yellow', zh: '荧光黄' }, '#FFE13B', '#1C1B17', { 'ink/ground': 15.32, 'dim/ground': 7.26, 'onPaper/paper': 15.25, 'paperMuted/paper': 6.39, 'onAccent/accent': 13.2, 'accent/ground': 13.99 }, 'almost every source'),
    pal('magenta', { en: 'Magenta highlighter', zh: '洋红荧光' }, '#E20088', '#020202', { 'ink/ground': 15.32, 'dim/ground': 7.26, 'onPaper/paper': 15.25, 'paperMuted/paper': 6.39, 'onAccent/accent': 4.53, 'accent/ground': 3.99 }, 'a magenta or pink-red brand; sources printed mostly in black'),
    pal('coral', { en: 'Coral highlighter', zh: '珊瑚荧光' }, '#FF7A63', '#1C1B17', { 'ink/ground': 15.32, 'dim/ground': 7.26, 'onPaper/paper': 15.25, 'paperMuted/paper': 6.39, 'onAccent/accent': 6.74, 'accent/ground': 7.14 }, 'a coral brand; sources with no red or coral data'),
  ],
  veil: 0.5,
  type: {
    families: {
      display: { en: ['Source Serif 4'], zh: ['Source Serif 4', 'Noto Serif SC'] },
      text: { en: ['Source Serif 4'], zh: ['Source Serif 4', 'Noto Serif SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
      sans: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Source Serif 4', file: 'SourceSerif4-VF.ttf', weight: '200 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Regular.ttf', weight: 400, licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.ttf', weight: 600, licence: 'OFL-1.1' },
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'Noto Serif SC', file: 'NotoSerifSC-VF.ttf', weight: '200 900', licence: 'OFL-1.1', subset: true },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // 25 · 40 · 50 · 125 · 160 (terms and tags · rows and captions · claims and titles · the result · the name)
    scale: { en: [25, 40, 50, 125, 160], zh: [28, 40, 50, 125, 160] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.01, title: -0.008, fig: -0.02, name: -0.02, label: 0 }, zh: { display: 0, title: 0, fig: 0, name: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.2, zh: 1.4 },
  },
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 54], lines: { header: 54, claim: 140, terms: 208, sheet: 292, bottom: 1026 } },
  camera: { habit: 'locked', maxScale: 1, shutter: 0.5, ease: { enter: 'expo-out', move: 'power2-in-out', exit: 'power2-in' } },
  texture: { grain: 0, glow: null, vignette: 0, light: 'none', paperTooth: 7 },
  motion: { stroke: { beats: 1 }, veil: 0.3, leader: 0.4, stamp: 0.12, bandMove: 0.4, rise: 0.42, stagger: 0.12, sink: 0.2 },
};

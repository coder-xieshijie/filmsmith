// sketch-paper — the look of teach-video's blueprint-zoom kit: warm paper, one overview diagram of equal-width layer
// bands, each a clean rounded frame with a light tint and its name in the left column; only the nodes are hand-drawn (a
// rough outline and hachure on a solid backing), connectors are clean vector lines with two-stroke arrowheads, loops are
// smooth pills that become circles; one colour per layer (product blue, composition violet, mechanism ochre, core teal,
// infrastructure stone, the model red) and one per message on a line (yellow a person's message, red text the model wrote
// — a tool call, green a result coming back, grey plain text); the chapter label at the top left, the presenter reserve
// and the caption band kept empty, the camera locked: the zoom is the diagram's own (SPEC 3.4).
// From teach-video assets/kits/blueprint-zoom/starter/tokens.js and style.css (the values are the kit's). Roles: ground =
// the paper, panel = a window's body, ink, dim = the kit's mute, line = its stroke, accent = vermilion (the kit's `me`, the
// person); layers are extra roles <layer>S (stroke), <layer>H (hachure), <layer>B (node backing), <layer>T (band tint).
// Type: the kit sets all text in LXGW WenKai. Chinese keeps that; English takes Source Serif 4 (WenKai's Latin is a
// handwriting cut with no bold) and IBM Plex Mono in terminals. Floors 28 px in Chinese and 25 px in English (SPEC 4).
const ROLES = {
  ground: '#f6f1e7', panel: '#fffdf8', ink: '#2b2824', dim: '#6a645a', line: '#8a8478',
  accent: '#c4432a', onAccent: '#f6f1e7', paper: '#f6f1e7', onPaper: '#2b2824',
  rule: '#d8d1c2', faint: '#b9b2a6', grey: '#ebe6dc', chapInk: '#3b3732', chapRule: '#e8b93a', accentSoft: '#f6dcd2',
  machine: '#1f6f78', machineSoft: '#dcefef', ok: '#2e7d4f', dotR: '#eeab9b', dotY: '#f6d673', dotG: '#b9dfb0', pill: '#f2ede2', shadow: '#2b2824',
  prodS: '#3f6f9f', prodH: '#9dbbd9', prodB: '#eef3f8', prodT: '#f1f4f6',
  compS: '#6f55a0', compH: '#bba8dc', compB: '#f3eff9', compT: '#f4f1f5',
  mechS: '#a86d1e', mechH: '#e2b874', mechB: '#fbf3e6', mechT: '#f8f1e4',
  coreS: '#1f6f78', coreH: '#86c3c4', coreB: '#ecf6f5', coreT: '#eef4f0',
  infS: '#6f6a61', infH: '#bdb6aa', infB: '#f3f0ea', infT: '#f2eee6',
  modS: '#a83c32', modH: '#e0968b', modB: '#faece8', modT: '#faece8',
  msgS: '#b58714', msgB: '#fbf0cf', callS: '#a83c32', callB: '#f8e1dc', resS: '#2e7d4f', resB: '#e3f1e6', txtS: '#6a645a', txtB: '#fffdf8', subBack: '#fffdf8', subInk: '#4f4a42',
};
export default {
  id: 'sketch-paper', kind: 'look',
  palettes: [{
    id: 'sketch', name: { en: 'Sketch on paper', zh: '纸上草图' }, dark: false,
    roles: ROLES,
    alias: { me: 'accent', mute: 'dim', stroke: 'line', body: 'panel', agent: 'machine', chapUl: 'chapRule' },
    contrast: { 'ink/ground': 13.03, 'dim/ground': 5.21, 'accent/ground': 4.46, 'onAccent/accent': 4.46, 'coreS/ground': 5.18, 'prodS/ground': 4.68, 'compS/ground': 5.36, 'mechS/ground': 3.83, 'modS/ground': 5.56, 'ink/msgB': 12.9, 'ink/callB': 11.73, 'subInk/subBack': 8.64 },
    accentMeans: 'the person: what a person says or decides',
    note: 'mechS (ochre) is 3.83:1 on the paper: it colours the mechanism band\'s name at 30 px and outlines, never body text',
  }],
  meanings: { accent: 'the person', machine: 'the machine', prodS: 'product layer', compS: 'composition and extension layer', mechS: 'mechanism layer', coreS: 'the core layer', infS: 'infrastructure', modS: 'the model', msgS: "a person's message", callS: 'text the model wrote (a tool call)', resS: 'a result coming back', txtS: 'plain text, no tool call' },
  type: {
    families: {
      display: { en: ['Source Serif 4'], zh: ['LXGW WenKai', 'Noto Serif SC'] },
      text: { en: ['Source Serif 4'], zh: ['LXGW WenKai', 'Noto Serif SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'LXGW WenKai', 'Noto Serif SC'] },
    },
    files: [
      { family: 'LXGW WenKai', file: 'LXGWWenKai-Medium.ttf', weight: 500, licence: 'OFL-1.1', subset: true, url: 'https://github.com/lxgw/LxgwWenKai/releases/download/v1.522/LXGWWenKai-Medium.ttf' },
      { family: 'Source Serif 4', file: 'SourceSerif4-VF.ttf', weight: '200 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Serif SC', file: 'NotoSerifSC-VF.ttf', weight: '200 900', licence: 'OFL-1.1', subset: true },
    ],
    // floor · body and labels · notes · chapter · quote · mid numbers · large numbers · the counter
    scale: { en: [25, 28, 30, 34, 42, 46, 66, 112], zh: [28, 30, 34, 42, 46, 66, 112] },
    floors: { en: { info: 25, main: 28 }, zh: { info: 28, main: 28 } },
    tracking: { en: { display: 0, label: 0 }, zh: { display: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.25, zh: 1.4 },
  },
  // the kit's no-go zones: the presenter reserve (plain paper outside presenter windows) and the caption band
  grid: { cols: 12, margin: 56, gutter: 24, baseline: 8, safe: [56, 28], reserve: [1580, 560, 1880, 860], captions: 880, ruleEnd: 1540, counterRight: 1860 },
  camera: { habit: 'locked', maxScale: 1, shutter: 0, ease: { enter: 'power3-out', move: 'power2-in-out', exit: 'power2-in' } },
  texture: { grain: 0, glow: null, vignette: 0, light: 'none', shadow: 'terminal windows only: hard offset 8/9 px at 14 % ink' },
  motion: { hold: 0.6, exitShare: 0.5, push: 'power2-in-out', arrive: 'power3-out', blurIn: 0.2 },
};

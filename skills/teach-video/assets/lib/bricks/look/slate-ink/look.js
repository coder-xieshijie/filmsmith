// slate-ink — the look of the morph style: a cool slate ground, one ink shape that is promoted one dimension per
// scene (point, line, plane, solid, interface), interface panels in a lighter paper, one accent handed on like a baton
// (it marks only the part that is changing now); a bold grotesque for words, a mono for code and facts; a locked
// camera, fine overlay grain (SPEC 3.4).
// From the morph template (assets/templates/morph/palettes.js, film.js type scale and layout): the three presets keep
// the template's hexes; inkCard, inkEdge and inkTrack are the template's tones of the ink (6, 24, 12 % toward the
// ground) for the console, the same card in the other material.
export default {
  id: 'slate-ink', kind: 'look',
  palettes: [
    { id: 'slate', name: { en: 'Slate and violet', zh: '石板紫' }, dark: false,
      roles: { ground: '#EDEFF2', panel: '#F8F9FB', paper: '#F8F9FB', ink: '#15171A', dim: '#5F656D', line: '#C3C9D0', accent: '#6A3DF0', onAccent: '#EDEFF2',
               inkDim: '#9AA0A8', inkAccent: '#8C6CFF', inkCard: '#222427', inkEdge: '#494B4E', inkTrack: '#2F3134' },
      alias: { text: 'ink', faint: 'line', onInk: 'ground' },
      contrast: { 'ink/ground': 15.59, 'dim/ground': 5.11, 'accent/ground': 5.15, 'ink/panel': 17.05, 'dim/panel': 5.59, 'ground/ink': 15.59, 'inkDim/ink': 6.81, 'onAccent/accent': 5.15, 'inkAccent/inkCard': 4.23 },
      accentMeans: 'the part that is changing now: the point, the swapped token, the action, the front face, the Run button; never two at once' },
    { id: 'azure', name: { en: 'Slate and azure', zh: '石板蓝' }, dark: false,
      roles: { ground: '#EDEFF2', panel: '#F8F9FB', paper: '#F8F9FB', ink: '#15171A', dim: '#5F656D', line: '#C3C9D0', accent: '#1F55E0', onAccent: '#EDEFF2',
               inkDim: '#9AA0A8', inkAccent: '#7FA0FF', inkCard: '#222427', inkEdge: '#494B4E', inkTrack: '#2F3134' },
      alias: { text: 'ink', faint: 'line', onInk: 'ground' },
      contrast: { 'ink/ground': 15.59, 'dim/ground': 5.11, 'accent/ground': 5.31, 'ink/panel': 17.05, 'dim/panel': 5.59, 'ground/ink': 15.59, 'inkDim/ink': 6.81, 'onAccent/accent': 5.31, 'inkAccent/inkCard': 6.21 },
      accentMeans: 'the part that is changing now (a calmer, institutional blue)' },
    { id: 'night', name: { en: 'Night (inverted)', zh: '夜（反相）' }, dark: true,
      roles: { ground: '#121418', panel: '#1B1E23', paper: '#1B1E23', ink: '#E8EBEF', dim: '#8D939B', line: '#2C3036', accent: '#9C80FF', onAccent: '#121418',
               inkDim: '#585E66', inkAccent: '#6A3DF0', inkCard: '#DBDEE2', inkEdge: '#B5B7BB', inkTrack: '#CED1D5' },
      alias: { text: 'ink', faint: 'line', onInk: 'ground' },
      contrast: { 'ink/ground': 15.42, 'dim/ground': 5.95, 'accent/ground': 6.1, 'ink/panel': 13.98, 'dim/panel': 5.4, 'ground/ink': 15.42, 'inkDim/ink': 5.47, 'onAccent/accent': 6.1, 'inkAccent/inkCard': 4.4 },
      accentMeans: 'the part that is changing now; the console flood turns light' },
  ],
  type: {
    // display and text: Inter Tight 600/700 for every word; mono: IBM Plex Mono for code, paths and facts (code stays
    // Latin in every language). Chinese words take Noto Sans SC after Inter Tight. IBM Plex Mono is not in
    // tools/fonts.json (batches/modes-1.json toolIssues): JetBrains Mono stands in for it in samples.
    families: {
      display: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono', 'JetBrains Mono'], zh: ['IBM Plex Mono', 'JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.ttf', weight: '600', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // one scale, ratio 1.25 from 28: label · body · main · sub · line · caption · mark (the template's SZ)
    scale: { en: [28, 35, 44, 55, 69, 86, 135], zh: [28, 35, 44, 55, 69, 86, 135] },
    floors: { en: { info: 28, main: 44 }, zh: { info: 28, main: 44 } },
    // tracking in em: captions -2 px at 86, the mark name -3 px at 135, capital labels +2 px at 28; Chinese at 0
    tracking: { en: { display: -0.023, mark: -0.022, label: 0.07 }, zh: { display: 0, mark: 0, label: 0 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.15, zh: 1.35 },
  },
  // the frame's fixed places: the line's centre (960, 560), the card, the hexagon, the focus card, the six panels
  grid: { cols: 12, margin: 120, gutter: 24, baseline: 8, safe: [96, 54], line: [960, 560], card: [460, 240, 1000, 600, 36], hex: [1300, 560, 210], focus: [200, 120, 1520, 640, 28], captions: [470, 580] },
  camera: { habit: 'locked', maxScale: 1, shutter: 0.5, ease: { enter: 'spring', move: 'cubicInOut', exit: 'exit' } },
  // corners: 'round' (default) or 'cut' (45° chamfers, Material's cut family); the point stays round
  texture: { grain: 0.05, grainMode: 'overlay', glow: null, vignette: 0, light: 'none', corners: ['round', 'cut'] },
  motion: { spring: 22, enterBeats: 0.25, exitShare: 0.66, contentOut: 0.1, contentBlur: 12 },
};

// live-diagram — the look of the trace style: a dark 3Blue1Brown-style diagram (or paper, or a chalkboard) where an
// algorithm runs live; four semantic colours with one meaning each (base untouched, active = the accent, being acted
// on now, learned = produced by the run, unseen = never seen by it), a serif for the author (title, thesis), a mono
// for the run, a sans for the narration; a flat ground with fine grain (SPEC 3.4).
// From the trace template (assets/templates/trace/palettes.js, pieces.js TYPE, frame): the three presets keep the
// template's hexes; `panel` is a lift of the ground for cards; `line` is the template's faint, `cell` its bar cell.
export default {
  id: 'live-diagram', kind: 'look',
  palettes: [
    { id: 'ink', name: { en: 'Ink', zh: '墨' }, dark: true,
      roles: { ground: '#0C1013', panel: '#151B1F', ink: '#E6ECEF', dim: '#8A97A0', line: '#2A343B', accent: '#F7D96F', onAccent: '#0C1013',
               paper: '#E6ECEF', onPaper: '#0C1013', base: '#7D8A93', learned: '#5CD0B3', unseen: '#FC6255', cell: '#66737C' },
      alias: { text: 'ink', faint: 'line', active: 'accent' },
      contrast: { 'ink/ground': 16.02, 'dim/ground': 6.38, 'accent/ground': 13.75, 'ink/panel': 14.57, 'dim/panel': 5.8 },
      accentMeans: 'what the algorithm is counting or acting on right now (active); learned and unseen are category colours' },
    { id: 'paper', name: { en: 'Paper', zh: '纸' }, dark: false,
      roles: { ground: '#F5F2EA', panel: '#FBF9F4', ink: '#1A1E21', dim: '#5B646A', line: '#D3D9DE', accent: '#2456C8', onAccent: '#FFFFFF',
               paper: '#FFFFFF', onPaper: '#1A1E21', base: '#2C3236', learned: '#077562', unseen: '#C2362C', cell: '#7D868C' },
      alias: { text: 'ink', faint: 'line', active: 'accent' },
      contrast: { 'ink/ground': 15, 'dim/ground': 5.4, 'accent/ground': 5.79, 'ink/panel': 15.95, 'dim/panel': 5.74 },
      accentMeans: 'what the algorithm is acting on right now (active)' },
    { id: 'chalk', name: { en: 'Chalkboard', zh: '黑板' }, dark: true,
      roles: { ground: '#17221F', panel: '#1E2B27', ink: '#EEEDE6', dim: '#9AA8A2', line: '#2D3B37', accent: '#F6C945', onAccent: '#17221F',
               paper: '#EEEDE6', onPaper: '#17221F', base: '#84908B', learned: '#8FD0F7', unseen: '#FF8F70', cell: '#6E7D78' },
      alias: { text: 'ink', faint: 'line', active: 'accent' },
      contrast: { 'ink/ground': 13.92, 'dim/ground': 6.61, 'accent/ground': 10.4, 'ink/panel': 12.51, 'dim/panel': 5.94 },
      accentMeans: 'what the algorithm is acting on right now (active)' },
  ],
  type: {
    // display and serif: the author (title, thesis); text: the narration (captions, headings); mono: the run (chips,
    // counts, rules), fixed width so letters line up as tokens fuse. Source Serif 4 and Noto Serif SC are not in
    // tools/fonts.json yet (batches/modes-1.json toolIssues): samples fall back for them.
    families: {
      display: { en: ['Source Serif 4'], zh: ['Source Serif 4', 'Noto Serif SC'] },
      serif: { en: ['Source Serif 4'], zh: ['Source Serif 4', 'Noto Serif SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Source Serif 4', file: 'SourceSerif4-VF.ttf', weight: '200 900', licence: 'OFL-1.1' },
      { family: 'Source Serif 4', file: 'SourceSerif4-Italic-VF.ttf', weight: '200 900', style: 'italic', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'Noto Serif SC', file: 'NotoSerifSC-VF.ttf', weight: '200 900', licence: 'OFL-1.1', subset: true },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // the template's 26 · 40 · 54 · 76 · 82 (chips move with the board, 36–70); Chinese labels at 28
    scale: { en: [26, 30, 40, 46, 54, 76, 82], zh: [28, 30, 40, 46, 54, 76, 82] },
    floors: { en: { info: 26, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: 0, label: 0 }, zh: { display: 0, label: 0.02 } },
    caps: { en: [], zh: [] },
    // the subtitle is an italic serif in English; Chinese has no italic, it takes the dim colour instead
    italic: { en: true, zh: false },
    leading: { en: 1.15, zh: 1.35 },
  },
  grid: { cols: 12, margin: 130, gutter: 24, baseline: 8, safe: [96, 54], board: [130, 1220, 176, 806], column: [1290, 1800], caption: 872, bar: 950 },
  // the camera moves twice in a film: the summary push (1.3) and the probe push (1.06)
  camera: { habit: 'locked', maxScale: 1.3, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  texture: { grain: 0.035, glow: null, vignette: 0, light: 'none' },
  motion: { spring: 10, enterBeats: 0.25, exitShare: 0.66 },
};

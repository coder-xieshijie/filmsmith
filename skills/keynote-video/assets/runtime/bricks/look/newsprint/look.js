// newsprint — the look of the halftone style: warm newsprint paper, one black plate and ONE process ink that prints
// only the anchor (the piece of the product's mark that runs through the film); every picture is a procedural tone
// field printed as an AM screen (black 45°, the process ink 15°, dots vary in size and never in grey); type knocks the
// plate out round itself; a fixed paper tooth (grain that belongs to the paper, the same on every frame).
// From the halftone template (assets/templates/halftone/palettes.js, film.js type and frame, screen.js): the three
// presets keep the template's hexes; `dimInk` is secondary text on an ink ground; `panel` equals the ground (print
// has no lifted surfaces).
export default {
  id: 'newsprint', kind: 'look',
  palettes: [
    { id: 'cyan', name: { en: 'Process cyan', zh: '印刷青' }, dark: false,
      roles: { ground: '#F1EDE4', panel: '#F1EDE4', ink: '#141414', dim: '#6E6A62', dimInk: '#A39E94', line: '#C9C3B6', accent: '#0090CC', onAccent: '#141414' },
      alias: { paper: 'ground', plate: 'ink' },
      contrast: { 'ink/ground': 15.77, 'dim/ground': 4.61, 'accent/ground': 3.07, 'ink/panel': 15.77, 'dim/panel': 4.61, 'dimInk/ink': 6.91, 'accent/ink': 5.14 },
      accentMeans: 'the anchor and nothing else: never type, never a field, never emphasis (graphics, 3:1 on paper and on ink)' },
    { id: 'magenta', name: { en: 'Process magenta', zh: '印刷品红' }, dark: false,
      roles: { ground: '#F1EDE4', panel: '#F1EDE4', ink: '#141414', dim: '#6E6A62', dimInk: '#A39E94', line: '#C9C3B6', accent: '#E4007C', onAccent: '#F1EDE4' },
      alias: { paper: 'ground', plate: 'ink' },
      contrast: { 'ink/ground': 15.77, 'dim/ground': 4.61, 'accent/ground': 3.92, 'ink/panel': 15.77, 'dim/panel': 4.61, 'dimInk/ink': 6.91, 'accent/ink': 4.03 },
      accentMeans: 'the anchor and nothing else; louder and warmer' },
    { id: 'reverse', name: { en: 'Reverse (ink paper)', zh: '反白（墨底）' }, dark: true,
      roles: { ground: '#141414', panel: '#141414', ink: '#F1EDE4', dim: '#A39E94', dimInk: '#68645C', line: '#3A3833', accent: '#0090CC', onAccent: '#141414' },
      alias: { paper: 'ground', plate: 'ink' },
      contrast: { 'ink/ground': 15.77, 'dim/ground': 6.91, 'accent/ground': 5.14, 'ink/panel': 15.77, 'dim/panel': 6.91, 'dimInk/ink': 5.04 },
      accentMeans: 'the anchor and nothing else; the whole film printed reversed out of black' },
  ],
  type: {
    // display: Bricolage Grotesque 800 for words and numbers, 500 for lines; mono: IBM Plex Mono for labels, quotes,
    // timecodes. Chinese takes Noto Sans SC (800 and 500) after them. Bricolage Grotesque and IBM Plex Mono are not
    // in tools/fonts.json (batches/modes-1.json toolIssues): samples fall back to the stack's next family.
    families: {
      display: { en: ['Bricolage Grotesque', 'Inter Tight'], zh: ['Bricolage Grotesque', 'Noto Sans SC'] },
      text: { en: ['Bricolage Grotesque', 'Inter Tight'], zh: ['Bricolage Grotesque', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono', 'JetBrains Mono'], zh: ['IBM Plex Mono', 'JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Bricolage Grotesque', file: 'BricolageGrotesque-VF.ttf', weight: '200 800', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'Inter Tight', file: 'InterTight-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // 28 × 1.36ⁿ: label 28 · 38 · line 52 · 71 · 96 · hook/claim 131 · card word 178 · count 242
    scale: { en: [28, 38, 52, 71, 96, 131, 178, 242], zh: [28, 38, 52, 71, 96, 131, 178, 242] },
    floors: { en: { info: 28, main: 52 }, zh: { info: 28, main: 52 } },
    tracking: { en: { display: 0, label: 0 }, zh: { display: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.08, zh: 1.25 },
  },
  // the text column x 150–1130 stays paper; fields start right of x 1060; the anchor sits at (1440, 540)
  grid: { cols: 12, margin: 150, gutter: 24, baseline: 8, safe: [96, 54], column: [150, 1130], field: 1060, anchor: [1440, 540] },
  // a locked camera; the one move is the closing push-in (to the opening's 24 px screen) and log-scale pull-back
  camera: { habit: 'locked', maxScale: 3.43, shutter: 0.5, ease: { enter: 'cubicOut', move: 'cubicInOut', exit: 'cubic' } },
  texture: { grain: 0.05, grainMode: 'overlay', grainFixed: true, screen: { pitch: 14, hookPitch: 24, markPitch: 7, angles: { ink: 45, accent: 15 }, dots: ['round', 'square', 'line'] }, glow: null, vignette: 0, light: 'none' },
  motion: { spring: null, enterBeats: 0.25, exitShare: 0.7, rise: 0.24, riseLead: 0.12, exit: 0.17 },
};

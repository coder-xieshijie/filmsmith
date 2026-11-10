// paper-ledger — the look of teach-video's terminal-ledger kit: warm paper and dark ink, light terminal windows with a
// hard offset shadow, a ruled ledger page of small hand-drawn dots, one colour per meaning (vermilion the person — the
// narrator or viewer, a decision only a person makes, the irreversible, hand marks; teal the machine; yellow waiting or
// routine; green what passes; grey dashed what is void), a chapter label with a yellow rule at the top left and one
// counter at the top right, a presenter reserve and a caption band kept empty, the camera locked (SPEC 3.4).
// From teach-video assets/kits/terminal-ledger/starter/tokens.js and style.css (the values are the kit's). Roles:
// ground = the paper, panel = a window's body, ink, dim = the kit's mute, line = its stroke (structural lines, dashed
// notes), accent = vermilion (the kit's `me`); the kit's other colours are extra roles under their meanings.
// Type: the kit sets everything in LXGW WenKai (one weight) and terminal logs in IBM Plex Mono. Chinese keeps that; English
// takes Source Serif 4 for text (WenKai's Latin is a handwriting cut with no bold) and IBM Plex Mono for logs. Sizes
// follow the kit's scale, the information floor raised to 28 px in Chinese and 25 px in English (SPEC 4; the kit's floor
// was 24).
const ROLES = {
  ground: '#f6f1e7', panel: '#fffdf8', ink: '#2b2824', dim: '#6a645a', line: '#8a8478',
  accent: '#c4432a', onAccent: '#f6f1e7', paper: '#f6f1e7', onPaper: '#2b2824',
  // the kit's other tokens, each with one meaning
  rule: '#d8d1c2', faint: '#b9b2a6', grey: '#ebe6dc', chapInk: '#3b3732', chapRule: '#e8b93a',
  accentSoft: '#f6dcd2', accentDeep: '#8a2a14', accentRing: '#f3cfc4',
  machine: '#1f6f78', machineSoft: '#dcefef', ok: '#2e7d4f',
  base: '#62717d', baseS: '#3f4b55', wait: '#e9b440', waitS: '#9a6a1c', waitSoft: '#fbf7ee', lamp: '#f2c14e', lampS: '#a8701a',
  judge: '#d4472d', judgeS: '#8f2716', rest: '#d3cbbd', restS: '#aaa194', pass: '#4f8a5b', passS: '#2f5c3a', passSoft: '#f1f7ef',
  sA: '#1f6f78', sB: '#7a5ea8', sC: '#b07d1a', sD: '#4f7d3a', dotR: '#eeab9b', dotY: '#f6d673', dotG: '#b9dfb0',
  ruling: '#40688c', margin: '#c4543e', pill: '#f2ede2', cell: '#e6dfd0', cellOn: '#3b3732', shadow: '#2b2824',
};
export default {
  id: 'paper-ledger', kind: 'look',
  palettes: [{
    id: 'paper', name: { en: 'Paper and ink', zh: '纸与墨' }, dark: false,
    roles: ROLES,
    alias: { me: 'accent', mute: 'dim', stroke: 'line', body: 'panel', agent: 'machine', cont: 'wait', rel: 'pass', chapUl: 'chapRule' },
    contrast: { 'ink/ground': 13.03, 'dim/ground': 5.21, 'accent/ground': 4.46, 'onAccent/accent': 4.46, 'machine/ground': 5.18, 'ok/ground': 4.48, 'judgeS/ground': 7.55, 'waitS/ground': 4.19 },
    accentMeans: 'the person: the narrator or viewer, a decision only a person makes, the irreversible step, a hand mark',
  }],
  meanings: { accent: 'the person', machine: 'the machine (an agent, a program)', wait: 'waiting or routine, no thought needed', pass: 'what passes, matches or is allowed', judge: 'needs a judgement', rest: 'the rest, unlabelled', base: 'not sorted yet', line: 'void (dashed) and structure' },
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
  texture: { grain: 0, glow: null, vignette: 0, light: 'none', shadow: 'hard offset 8/9 px at 14 % ink' },
  motion: { hold: 0.6, exitShare: 0.5, push: 'power2-in-out', arrive: 'power3-out', blurIn: 0.2 },
};

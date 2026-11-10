// paper-slam — the look of the ink style: warm paper and black ink, heavy extra-condensed capitals slammed on the beat,
// one accent that means "the dot and what it becomes", a night ground for the middle section, an orange (or blue)
// misregistration ghost on impact frames only, IBM Plex Mono labels in capitals (SPEC 3.4).
// From the ink template (assets/templates/ink/palettes.js, film.js type and grid): the five presets keep the
// template's hexes; roles: ground = paper, ink = ink, dim = soft, panel and line = night, plus night, nightInk,
// nightSoft, nightAccent and mis. Display type is Archivo 900 on its width axis (`stretch`: extra-condensed for words,
// normal for the name at rest and the claim). Chinese has no width axis: display words are Noto Sans SC 900 set as 长体
// (scaled to 0.8 wide), and the width jumps become 长体 jumps (kit.js, motion/width-jump).
const pal = (id, name, c, dark = false, extra = {}) => ({
  id, name, dark,
  roles: { ground: c.paper, panel: c.night, ink: c.ink, dim: c.soft, line: c.night, accent: c.accent, onAccent: c.onAccent, paper: c.paper, onPaper: c.ink,
           night: c.night, nightInk: c.nightInk, nightSoft: c.nightSoft, nightAccent: c.nightAccent, mis: c.mis },
  alias: { soft: 'dim', field: 'accent' },
  ...extra,
});
export default {
  id: 'paper-slam', kind: 'look',
  palettes: [
    pal('cobalt', { en: 'Cobalt', zh: '钴蓝' }, { paper: '#EFEEE8', ink: '#111214', soft: '#52545A', accent: '#2B3BFF', onAccent: '#EFEEE8', night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#6B78FF', mis: '#FF5A1F' }, false,
      { contrast: { 'ink/ground': 16.12, 'dim/ground': 6.51, 'accent/ground': 5.69, 'onAccent/accent': 5.69, 'nightInk/night': 16.12, 'nightAccent/night': 5.14 }, accentMeans: 'the dot and what it becomes (stop, burst, field, playhead, cursor)' }),
    pal('vermilion', { en: 'Vermilion', zh: '朱红' }, { paper: '#EFEEE8', ink: '#111214', soft: '#595250', accent: '#C8321A', onAccent: '#EFEEE8', night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#FF6A45', mis: '#1F6BFF' }, false,
      { contrast: { 'ink/ground': 16.12, 'dim/ground': 6.58, 'accent/ground': 4.6, 'onAccent/accent': 4.6, 'nightInk/night': 16.12, 'nightAccent/night': 6.6 }, accentMeans: 'the dot and what it becomes' }),
    pal('forest', { en: 'Forest', zh: '森绿' }, { paper: '#EFEEE8', ink: '#111214', soft: '#4E5451', accent: '#0E6A48', onAccent: '#EFEEE8', night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#3CC48C', mis: '#FF5A1F' }, false,
      { contrast: { 'ink/ground': 16.12, 'dim/ground': 6.66, 'accent/ground': 5.69, 'onAccent/accent': 5.69, 'nightInk/night': 16.12, 'nightAccent/night': 8.45 }, accentMeans: 'the dot and what it becomes' }),
    pal('carbon', { en: 'Carbon', zh: '碳黑' }, { paper: '#16161A', ink: '#EEEDE6', soft: '#BFB8B6', accent: '#FF5B2E', onAccent: '#16161A', night: '#EEEDE6', nightInk: '#16161A', nightSoft: '#55565B', nightAccent: '#C23A16', mis: '#2B3BFF' }, true,
      { contrast: { 'ink/ground': 15.37, 'dim/ground': 9.23, 'accent/ground': 5.83, 'onAccent/accent': 5.83, 'nightInk/night': 15.37, 'nightAccent/night': 4.58 }, accentMeans: 'the dot and what it becomes' }),
  ],
  type: {
    families: {
      display: { en: ['Archivo'], zh: ['Archivo', 'Noto Sans SC'] },
      text: { en: ['Archivo'], zh: ['Archivo', 'Noto Sans SC'] },
      mono: { en: ['IBM Plex Mono'], zh: ['IBM Plex Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Archivo', file: 'Archivo-VF.ttf', weight: '100 900', stretch: '62% 125%', licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.ttf', weight: 600, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // √2 from the label, then display fitted to its slot: 28 · 40 · 130–330
    scale: { en: [28, 40, 140, 180, 200, 210, 220, 225, 260, 280, 300, 330], zh: [28, 40, 140, 180, 200, 210, 220, 225, 260, 280, 300, 330] },
    floors: { en: { info: 28, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.02, mark: -0.035, label: 0.12 }, zh: { display: 0, mark: 0, label: 0.04 } },
    caps: { en: ['display', 'label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 0.95, zh: 1.1 },
    stretch: { word: 'extra-condensed', mark: 'normal', jumps: ['condensed', 'semi-condensed', 'extra-condensed', 'semi-condensed', 'normal'] },
    // 长体: the horizontal scale a Chinese display word takes for each width keyword
    zhWidth: { 'extra-condensed': 0.8, condensed: 0.86, 'semi-condensed': 0.93, normal: 1 },
  },
  grid: { cols: 12, margin: 150, gutter: 24, baseline: 8, safe: [150, 54], lines: { one: 640, two: [520, 830], label: 730 } },
  camera: { habit: 'drift', maxScale: 1.065, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' }, push: { perSec: 0.014, knee: 0.045, max: 0.065 }, punch: { amount: 0.05, decay: 7 } },
  texture: { grain: 0.1, glow: null, vignette: 0, light: 'none', mis: { alpha: 0.4, dx: 5, dy: -3, sec: 0.1 } },
  motion: { spring: 30, enterBeats: 0, exitShare: 0.66 },
};

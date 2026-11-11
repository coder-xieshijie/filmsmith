// reading-sheet — the look of the scroll style: one long sheet of the product's own page (real captures at one scale)
// hanging in a fixed viewport over a near-black ground (or linen for dark pages), quote bands on warm paper stock
// pasted in between, a dark panel where a row unfolds, a pencil-ochre accent that is only ever a stroke (the
// underline, the docked row's margin mark, the minimap's bracket), and a lit paper roll at the two ends (SPEC 3.4).
// From the scroll template (assets/templates/scroll/palettes.js, film.js type and grid; mode card): roles: ground,
// paper = the stock of the bands, onPaper and paperMuted their type, panel and onPanel its type, dim its muted type,
// ink = type straight on the ground, line = the hairline under a pinned tab, accent; roll, rollHi, rollShade, rollEdge the roll.
const ROLL = { roll: '#E4E0D7', rollHi: '#F6F3EC', rollShade: '#B5B0A6', rollEdge: '#7E7A72' };
const pal = (id, name, c, dark, contrast) => ({
  id, name, dark,
  roles: { ground: c.ground, panel: c.panel, ink: c.onGround, onPanel: c.onPanel, dim: c.panelMuted, line: c.hair, accent: c.accent, paper: c.stock, onPaper: c.ink, paperMuted: c.muted, ...ROLL },
  alias: { stock: 'paper', hair: 'line' },
  contrast, accentMeans: 'the line being read now: a stroke only (underline, margin mark, bracket), never a fill or text',
});
export default {
  id: 'reading-sheet', kind: 'look',
  palettes: [
    pal('slate', { en: 'Slate, ochre mark', zh: '石板 · 赭石记号' }, { ground: '#0E0F11', stock: '#F3F0E8', ink: '#17181B', muted: '#55575C', panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#C9CDD3', accent: '#8F7719', onGround: '#F1EFEA' }, true,
      { 'ink/ground': 16.69, 'onPanel/panel': 15.89, 'dim/panel': 7.95, 'onPaper/paper': 15.59, 'paperMuted/paper': 6.35, 'accent/ground': 4.4, 'accent/paper': 3.83 }),
    pal('slate-violet', { en: 'Slate, violet mark', zh: '石板 · 紫色记号' }, { ground: '#0E0F11', stock: '#F3F0E8', ink: '#17181B', muted: '#55575C', panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#C9CDD3', accent: '#9B4DCA', onGround: '#F1EFEA' }, true,
      { 'ink/ground': 16.69, 'onPanel/panel': 15.89, 'dim/panel': 7.95, 'onPaper/paper': 15.59, 'paperMuted/paper': 6.35, 'accent/ground': 3.93, 'accent/paper': 4.28 }),
    pal('linen', { en: 'Linen, ochre mark', zh: '亚麻 · 赭石记号' }, { ground: '#ECEAE4', stock: '#17181B', ink: '#F1EFEA', muted: '#A9ABB0', panel: '#141518', onPanel: '#F1EFEA', panelMuted: '#A9ABB0', hair: '#3A3D44', accent: '#8F7719', onGround: '#17181B' }, false,
      { 'ink/ground': 14.76, 'onPanel/panel': 15.89, 'dim/panel': 7.95, 'onPaper/paper': 15.45, 'paperMuted/paper': 7.73, 'accent/ground': 3.62, 'accent/paper': 4.08 }),
  ],
  type: {
    families: {
      display: { en: ['Schibsted Grotesk'], zh: ['Schibsted Grotesk', 'Noto Sans SC'] },
      text: { en: ['Schibsted Grotesk'], zh: ['Schibsted Grotesk', 'Noto Sans SC'] },
      mono: { en: ['DM Mono'], zh: ['DM Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Schibsted Grotesk', file: 'SchibstedGrotesk-VF.ttf', weight: '400 900', licence: 'OFL-1.1' },
      { family: 'DM Mono', file: 'DMMono-Medium.ttf', weight: 500, licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // 25 × 1.4ⁿ: the mode card's modular scale; Chinese starts at its 28 px floor
    scale: { en: [25, 35, 49, 69, 96, 134], zh: [28, 35, 49, 69, 96, 134] },
    floors: { en: { info: 25, main: 49 }, zh: { info: 28, main: 49 } },
    tracking: { en: { display: -0.01, text: 0, label: 0 }, zh: { display: 0, text: 0, label: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.25, zh: 1.4 },
  },
  grid: { cols: 12, margin: 120, gutter: 24, baseline: 8, safe: [96, 54], lines: { top: 54, sheet: [120, 1616], minimap: [1664, 1824] } },
  camera: { habit: 'locked', maxScale: 1, shutter: 0.5, ease: { enter: 'smooth', move: 'momentum', exit: 'fling' } },
  texture: { grain: 0.04, glow: null, vignette: 0, light: 'roll only' },
  motion: { detent: { beats: 1, k: 5.5 }, reel: { beats: 2, k: 6.5 }, fling: { beats: 2, k: 12 }, unroll: { beats: 2, k: 4.2 }, rollup: { beats: 1.5, k: 5 }, unfold: { beats: 2 } },
};

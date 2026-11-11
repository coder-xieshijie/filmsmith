// night-terminal — the look of the phosphor style: a CI run going green on a CRT. A near-black radial ground with a
// breathing glow disc, a 160 px accent grid at 5 % and + crosses, ONE phosphor accent that marks what passed or is
// proven (and only it glows), status colours for problems (`bad`) and findings (`find`), display type in a neutral
// gradient (titleHi → titleLo) striped by the raster, mono for everything the machine says; scanlines, a tube
// vignette and seeded grain on the default `crt` screen.
// From the phosphor template (assets/templates/phosphor/palettes.js, index.html CSS): the six presets keep the
// template's hexes; `cyan` is renamed `ansi-cyan` and `coral` `coral-crt` (both ids are taken by other looks);
// `ground` is bg, `onAccent` is on.
const base = (bg, bgHi, bgLo, ink, muted, dim, line, panel, accent, hi, deep, on, bad, find, key, titleHi, titleLo) =>
  ({ ground: bg, groundHi: bgHi, groundLo: bgLo, panel, ink, muted, dim, line, accent, hi, deep, onAccent: on, bad, find, key, titleHi, titleLo });
export default {
  id: 'night-terminal', kind: 'look',
  palettes: [
    { id: 'phosphor', name: { en: 'P1 phosphor green', zh: 'P1 磷光绿' }, dark: true,
      roles: base('#050A07', '#0A1A12', '#030604', '#E8F1EB', '#9DB3A6', '#7A9385', '#1D3527', '#08120D', '#3DDC84', '#B9F0D0', '#1A9E5E', '#04140A', '#FF6B6B', '#F2CF6B', '#8FD0FF', '#EEF7F1', '#A9B9B0'),
      contrast: { 'ink/ground': 17.3, 'muted/ground': 8.96, 'dim/ground': 6.02, 'accent/ground': 11.18, 'onAccent/accent': 10.61 },
      accentMeans: 'what passed or is proven: checks, locks, lit outputs, the counter, the closing chips' },
    { id: 'amber', name: { en: 'P3 amber phosphor', zh: 'P3 琥珀磷光' }, dark: true,
      roles: base('#0A0703', '#1C1309', '#050302', '#F4ECE1', '#BBAA94', '#968570', '#3A2B1A', '#130D06', '#FFB45C', '#FFE3C0', '#D9822A', '#1A0D00', '#FF6F87', '#9ED0FF', '#C8B8FF', '#FAF4EC', '#BFB09C'),
      contrast: { 'ink/ground': 17.17, 'muted/ground': 8.89, 'dim/ground': 5.63, 'accent/ground': 11.43, 'onAccent/accent': 10.84 },
      accentMeans: 'what passed or is proven (infrastructure, databases, ops)' },
    { id: 'ice', name: { en: 'P4 ice white', zh: 'P4 冰白' }, dark: true,
      roles: base('#04080C', '#0B1724', '#020406', '#E6EEF6', '#AAB0B6', '#848C94', '#1A2C3D', '#07111B', '#88BFFF', '#DCEBFF', '#3F86D6', '#03101C', '#FF7070', '#F2CF6B', '#C9B4FF', '#EEF6FD', '#A7B6C4'),
      contrast: { 'ink/ground': 17.15, 'muted/ground': 9.18, 'dim/ground': 5.89, 'accent/ground': 10.47, 'onAccent/accent': 10 },
      accentMeans: 'what passed or is proven (the default; security, data, cloud)' },
    { id: 'ansi-cyan', name: { en: 'ANSI cyan', zh: 'ANSI 青' }, dark: true,
      roles: base('#040A0B', '#051A1D', '#020606', '#E5F1F2', '#97B3B6', '#749297', '#133538', '#061214', '#05D8E3', '#B9ECF3', '#009BA4', '#001416', '#FF6B6B', '#F2CF6B', '#C9B4FF', '#EBF7F8', '#A5B9BC'),
      contrast: { 'ink/ground': 17.27, 'muted/ground': 8.96, 'dim/ground': 5.98, 'accent/ground': 11.33, 'onAccent/accent': 10.74 },
      accentMeans: 'what passed or is proven (networking, containers, observability)' },
    { id: 'violet', name: { en: 'Theme violet', zh: '主题紫' }, dark: true,
      roles: base('#09070D', '#181321', '#050408', '#EFEEF3', '#AEABB4', '#8E8A94', '#322A40', '#110D16', '#C9BCF3', '#E8E1F7', '#9086AF', '#120C1C', '#FF7070', '#F2CF6B', '#8FD0FF', '#F5F4FC', '#B6B2BB'),
      contrast: { 'ink/ground': 17.36, 'muted/ground': 8.86, 'dim/ground': 5.93, 'accent/ground': 11.42, 'onAccent/accent': 10.93 },
      accentMeans: 'what passed or is proven (AI and agent tools, editors)' },
    { id: 'coral-crt', name: { en: 'Coral red', zh: '珊瑚红' }, dark: true,
      roles: base('#0D0706', '#21110F', '#080404', '#F7EBEA', '#BFA6A2', '#A08480', '#412723', '#170C0B', '#FF6452', '#FEC3AD', '#FF3763', '#1C0A07', '#C9B4FF', '#F2CF6B', '#8FD0FF', '#FEF2F1', '#C2B0AC'),
      contrast: { 'ink/ground': 17.17, 'muted/ground': 8.75, 'dim/ground': 5.82, 'accent/ground': 6.85, 'onAccent/accent': 6.57 },
      accentMeans: 'what passed or is proven (a coral brand; `bad` moves to violet)' },
  ],
  type: {
    // display, headlines, numerals: Inter 800 at −0.045 em; body Inter 400–700; code, commands, labels and the HUD:
    // JetBrains Mono. Chinese takes Noto Sans SC after each family, as written, no tracking.
    families: {
      display: { en: ['Inter'], zh: ['Inter', 'Noto Sans SC'] },
      text: { en: ['Inter'], zh: ['Inter', 'Noto Sans SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'Inter', file: 'Inter-VF.ttf', weight: '100 900', licence: 'OFL-1.1' },
      { family: 'JetBrains Mono', file: 'JetBrainsMono-VF.ttf', weight: '100 800', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    scale: { en: [25, 32, 40, 50, 64, 84, 108, 150, 190, 240], zh: [28, 32, 40, 50, 64, 84, 108, 150, 190, 240] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.045, numeral: -0.045, label: 0.12 }, zh: { display: 0, numeral: 0, label: 0 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 0.95, zh: 1.15 },
  },
  // content x 110–1810, HUD at 70–74 px, corner brackets 34 px at (38, 34); page header (110, 92), note (112, 192),
  // panels from y 262, check row y 792, strip y 948
  grid: { cols: 12, margin: 110, gutter: 20, column: 125, baseline: 8, safe: [110, 84], accentGrid: 160, crosses: 320, header: [110, 92] },
  camera: { habit: 'push', maxScale: 1.1, shutter: 0.5, ease: { enter: 'expo.out', move: 'expo.inOut', exit: 'power1.in' } },
  // crt: 2 px scanlines (1 dark line in 3 at 22 %), display type striped (4 px solid, 2 px at 62 %), a tube vignette
  // (60 % at the corners); grain overlay 50 %; a glow disc breathing over four bars; `flat` drops scanlines, stripes
  // and vignette
  texture: { grain: 0.5, paper: 0, glow: 'disc', vignette: 0.6, light: 'phosphor', scanlines: 0.22 },
  motion: { spring: null, enterBeats: 0.5, exitShare: 0.6, exit: 0.2, exitLead: 0 },
};

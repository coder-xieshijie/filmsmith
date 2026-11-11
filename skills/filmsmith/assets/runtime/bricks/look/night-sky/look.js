// night-sky — the look of the stream style: a night sky (a radial field over a near-black ground, drifting dust, soft
// bokeh, a 5 % push over the film) where one accent colour is the product's attention (the glowing thread, the stars it
// sends, their glow and the one "needs you"), and warm off-white paper blocks hung on the thread carry the interface.
// DM Sans for everything, Noto Sans SC after it in Chinese.
// From the stream template (assets/templates/stream/palettes.js, lang.js TYPE, film.js renderBG): the four presets keep
// the template's hexes. Library roles: ink is the template's text (on the night), dim its text2, accent its line (the
// thread), onAccent its onLine, onPaper and onPaper2 its ink and ink2 (text on paper); line (a divider on the night) is
// derived (text2 28 % over the ground) for library bricks, the stream bricks never draw it. The other names are the
// template's own: field, fieldEdge, dust (the sky), glow, core (the thread's halo and white-hot core), panel2, bubble,
// user, onUser, rule, accentInk (the accent's ink tone on paper: the running ring) and desk1–3, deskBar (the desk opening).
// warn is the one "needs you" (its pill, its row's dot and word, the nudge's dot): accentInk in every preset, its own
// colour when a film's interface has a warning hue (a product's ui-kit orange), so the one alert can stand apart.
const roles = (p) => ({
  ground: p[0], panel: p[1], ink: p[2], dim: p[3], line: p[4], accent: p[5], onAccent: p[6], paper: p[7], onPaper: p[8],
  field: p[9], fieldEdge: p[10], dust: p[11], glow: p[12], core: p[13], panel2: p[14], bubble: p[15], onPaper2: p[16],
  user: p[17], onUser: p[18], rule: p[19], accentInk: p[20], desk1: p[21], desk2: p[22], desk3: p[23], deskBar: p[24],
  warn: p[25] ?? p[20],
});
export default {
  id: 'night-sky', kind: 'look',
  palettes: [
    { id: 'night', name: { en: 'Night sky, blue thread', zh: '夜空蓝线' }, dark: true,
      roles: roles(['#05070D', '#0F1B30', '#EEF3FF', '#A9B6CC', '#333842', '#4DB5FF', '#05070D', '#F5F2EC', '#1C1E24',
        '#0B1426', '#04050A', '#C8DEFF', '#D6EEFF', '#F0FAFF', '#18263F', '#E6E2DA', '#575B66', '#2A2D34', '#FFFFFF', '#DDD8CF', '#175F9C',
        '#EAF4FF', '#5C9EF0', '#2F6FD6', '#F4F6FA']),
      contrast: { 'ink/ground': 18.13, 'dim/ground': 9.83, 'accent/ground': 8.99, 'onAccent/accent': 8.99, 'onPaper/paper': 14.91, 'onPaper2/paper': 6.08, 'accentInk/paper': 5.96, 'warn/paper': 5.96, 'ink/panel': 15.49 },
      accentMeans: 'the thread: the product\'s attention (the thread, the stars it sends, their glow, the one "needs you")' },
    { id: 'ember', name: { en: 'Ember: warm dark, amber thread', zh: '余烬：暖黑琥珀线' }, dark: true,
      roles: roles(['#0A0705', '#1F150E', '#FBF1E6', '#C9B7A2', '#3F3831', '#FFB347', '#0A0705', '#F7F2EA', '#211A14',
        '#1C130C', '#060403', '#FFE6C7', '#FFE2B8', '#FFF7EC', '#2B1E14', '#E9E1D5', '#5F554B', '#2E2620', '#FFFFFF', '#DED4C6', '#834C00',
        '#FFF4E6', '#F2A65A', '#C9702A', '#FAF6F1']),
      contrast: { 'ink/ground': 18.01, 'dim/ground': 10.31, 'accent/ground': 11.28, 'onAccent/accent': 11.28, 'onPaper/paper': 15.41, 'onPaper2/paper': 6.53, 'accentInk/paper': 6.28, 'warn/paper': 6.28, 'ink/panel': 16.07 },
      accentMeans: 'the thread (warmer brands, writing and research tools)' },
    { id: 'aurora', name: { en: 'Aurora: deep teal night, mint thread', zh: '极光：深青薄荷线' }, dark: true,
      roles: roles(['#03090A', '#0C1F21', '#EAF8F4', '#A2C2BB', '#303D3C', '#4FE0B8', '#03090A', '#F2F4F1', '#172020',
        '#0A1C1E', '#020606', '#CFF5EC', '#CFFBEF', '#F0FFFA', '#132C2E', '#E0E5E1', '#52605E', '#243030', '#FFFFFF', '#D5DCD8', '#096A50',
        '#EAFBF5', '#4CC7A4', '#1F8F74', '#F3F7F5']),
      contrast: { 'ink/ground': 18.36, 'dim/ground': 10.47, 'accent/ground': 12.11, 'onAccent/accent': 12.11, 'onPaper/paper': 15.02, 'onPaper2/paper': 5.95, 'accentInk/paper': 5.95, 'warn/paper': 5.95, 'ink/panel': 15.59 },
      accentMeans: 'the thread (infrastructure, data, ops)' },
    { id: 'mono', name: { en: 'Mono: graphite night, white thread', zh: '石墨：白线' }, dark: true,
      roles: roles(['#070708', '#17181B', '#F2F2F4', '#AEB0B7', '#363639', '#E9EAEE', '#070708', '#F3F3F1', '#1A1A1C',
        '#16171A', '#040405', '#E6E6EA', '#F4F5F8', '#FFFFFF', '#222327', '#E2E2DF', '#58595E', '#2A2A2D', '#FFFFFF', '#D9D9D5', '#1A1A1C',
        '#F4F4F6', '#A9ABB3', '#6E7079', '#F5F5F6']),
      contrast: { 'ink/ground': 18.01, 'dim/ground': 9.29, 'accent/ground': 16.75, 'onAccent/accent': 16.75, 'onPaper/paper': 15.64, 'onPaper2/paper': 6.29, 'accentInk/paper': 15.64, 'warn/paper': 15.64, 'ink/panel': 15.88 },
      accentMeans: 'the thread (when the brand colour must stay out)' },
  ],
  type: {
    // DM Sans 400–700 (variable, opsz and wght) for every role; Chinese adds Noto Sans SC after it, cut to the film's
    // characters. Tracking −0.01 em in Latin, +0.02 em in Chinese; leading 1.32 / 1.5. mono (DM Mono) is not drawn by the
    // stream bricks; it is there for library bricks that set a path or a command in this look.
    families: {
      display: { en: ['DM Sans'], zh: ['DM Sans', 'Noto Sans SC'] },
      text: { en: ['DM Sans'], zh: ['DM Sans', 'Noto Sans SC'] },
      mono: { en: ['DM Mono'], zh: ['DM Mono', 'Noto Sans SC'] },
    },
    files: [
      { family: 'DM Sans', file: 'DMSans-VF.ttf', weight: '100 1000', licence: 'OFL-1.1' },
      { family: 'DM Mono', file: 'DMMono-Medium.ttf', weight: '500', licence: 'OFL-1.1' },
      { family: 'Noto Sans SC', file: 'NotoSansSC-VF.ttf', weight: '100 900', licence: 'OFL-1.1', subset: true },
    ],
    // the template's series 26 · 30 · 34 · 42 · 58 · 66 · 168 with the row details (25, 27) and the freeze (96);
    // Chinese raises every information size to the library's 28 px floor (the hung blocks' details, labels, statuses)
    scale: { en: [25, 27, 30, 34, 42, 58, 66, 96, 168], zh: [28, 30, 34, 42, 58, 64, 92, 168] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.01, text: -0.01, name: -0.02 }, zh: { display: 0.02, text: 0.02, name: 0 } },
    caps: { en: [], zh: [] },
    italic: { en: false, zh: false },
    leading: { en: 1.32, zh: 1.5 },
  },
  // the thread's home: the mascot at (230, 156), the spine x 230 from y 236 to 1010; captions at x 1000, y 112, one line
  // 860 px wide; hung blocks left (290–930), the right region x 1060–1840
  grid: { cols: 12, margin: 90, gutter: 40, baseline: 2, safe: [90, 60], spine: { x: 230, top: 236, bottom: 1010 }, caption: [1000, 112, 860] },
  camera: { habit: 'locked', maxScale: 1.05, shutter: 0.5, ease: { enter: 'out3', move: 'io3', exit: 'in3' } },
  // the sky: a radial field (field at 0, ground at 55 %, fieldEdge at 100 %), 240 dust motes drifting 2–7 px/s, 22 bokeh
  // discs in the accent, a 5 % push over the film; the thread glows in three passes (16, 7, 2.6 px; accent, accent, glow)
  texture: { grain: 0, glow: { role: 'accent', radius: 26 }, vignette: 0, light: 'night', dust: 240, bokeh: 22, push: 0.05 },
  motion: { spring: null, enterBeats: 0.6, exitShare: 0.22, textBlur: 8, perWord: { en: 0.07, zh: 0.04 } },
};

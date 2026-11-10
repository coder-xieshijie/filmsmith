// neutral — the look every brick sample and every motion comparison is drawn in (SPEC 3.4). Three presets:
// neutral-light and neutral-dark for samples, probe (grey only, the accent grey too) for the comparison with upstream
// (SPEC 8.4); probe-light is its light-ground twin, so a light upstream shot is compared at the same polarity. contrast is WCAG 2 measured from the hex values (dim on the light ground is 3.8: captions only, never
// main text). Fonts: Inter Tight, JetBrains Mono and Noto Sans SC, all OFL; tools/fonts.json lists the files.
export default {
  id: 'neutral', kind: 'look',
  palettes: [
    { id: 'neutral-light', name: { en: 'Neutral light', zh: '中性浅色' }, dark: false,
      roles: { ground: '#F2F1EE', panel: '#FFFFFF', ink: '#1C1C1C', dim: '#7A7A7A', line: '#C9C7C2', accent: '#2F6BFF',
               onAccent: '#FFFFFF', paper: '#FFFFFF', onPaper: '#1C1C1C', ok: '#2E9E5B', warn: '#C98A12', fail: '#D2453B' },
      contrast: { 'ink/ground': 15.09, 'dim/ground': 3.8, 'accent/ground': 3.98, 'ink/panel': 17.04, 'dim/panel': 4.29 },
      accentMeans: 'the one thing in play' },
    { id: 'neutral-dark', name: { en: 'Neutral dark', zh: '中性深色' }, dark: true,
      roles: { ground: '#121314', panel: '#1C1D20', ink: '#F2F2F0', dim: '#8C8C8C', line: '#2E3034', accent: '#5B8CFF',
               onAccent: '#FFFFFF', paper: '#F2F2F0', onPaper: '#121314', ok: '#4CC27E', warn: '#E0A63A', fail: '#F06A5E' },
      contrast: { 'ink/ground': 16.59, 'dim/ground': 5.53, 'accent/ground': 5.88, 'ink/panel': 15.04, 'dim/panel': 5.01 },
      accentMeans: 'the one thing in play' },
    { id: 'probe', name: { en: 'Probe (grey)', zh: '灰阶对照' }, dark: true,
      roles: { ground: '#1A1A1A', panel: '#3A3A3A', ink: '#E6E6E6', dim: '#8A8A8A', line: '#555555', accent: '#BDBDBD',
               onAccent: '#1A1A1A', paper: '#F0F0F0', onPaper: '#1A1A1A', ok: '#BDBDBD', warn: '#BDBDBD', fail: '#BDBDBD' },
      contrast: { 'ink/ground': 13.94, 'dim/ground': 5.04, 'accent/ground': 9.26, 'ink/panel': 9.11, 'dim/panel': 3.29 },
      accentMeans: 'none: comparison only' },
    { id: 'probe-light', name: { en: 'Probe light (grey)', zh: '浅灰阶对照' }, dark: false,
      roles: { ground: '#E6E6E6', panel: '#FFFFFF', ink: '#1E1E1E', dim: '#8A8A8A', line: '#D2D2D2', accent: '#7A7A7A',
               onAccent: '#FFFFFF', paper: '#FFFFFF', onPaper: '#1E1E1E', ok: '#7A7A7A', warn: '#7A7A7A', fail: '#7A7A7A' },
      contrast: { 'ink/ground': 13.36, 'dim/ground': 2.77, 'accent/ground': 3.44, 'ink/panel': 16.67, 'dim/panel': 3.45 },
      accentMeans: 'none: comparison only (for upstream shots on a light ground)' },
  ],
  type: {
    families: {
      display: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      text: { en: ['Inter Tight'], zh: ['Inter Tight', 'Noto Sans SC'] },
      mono: { en: ['JetBrains Mono'], zh: ['JetBrains Mono', 'Noto Sans SC'] },
    },
    scale: { en: [25, 34, 47, 64, 88, 120, 164, 225], zh: [28, 36, 48, 64, 88, 120, 164] },
    floors: { en: { info: 25, main: 40 }, zh: { info: 28, main: 40 } },
    tracking: { en: { display: -0.03, label: 0.12 }, zh: { display: 0, label: 0.04 } },
    caps: { en: ['label'], zh: [] },
    italic: { en: true, zh: false },
    leading: { en: 1.1, zh: 1.3 },
  },
  grid: { cols: 12, margin: 96, gutter: 24, baseline: 8, safe: [96, 54] },
  camera: { habit: 'free', maxScale: 2.6, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  texture: { grain: 0, glow: null, vignette: 0, light: 'none' },
  motion: { spring: 10, enterBeats: 1, exitShare: 0.66 },
};

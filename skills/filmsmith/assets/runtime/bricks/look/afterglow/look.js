// afterglow — a look for one dark section (or a warm light one) whose texture is light itself: drifting orbs of light
// behind the content, an aurora bloom that rises from the foot of the frame, concentric rings breathing out of phase,
// grain and a vignette (SPEC 3.4). The painters are in texture.js; bricks and scenes call them with this look's roles.
// Palettes: afterglow-night (dark) and afterglow-dawn (warm light). Contrast is WCAG 2 measured from the hex values.
// Idea and texture parameters from video-shotcraft demos/effects/glow-flyline-moves/GlowOrbAmbient.tsx,
// demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx and demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx,
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0 (see texture.js for what was adapted).
export default {
  id: 'afterglow', kind: 'look',
  palettes: [
    { id: 'afterglow-night', name: { en: 'Afterglow night', zh: '余晖·夜' }, dark: true,
      roles: { ground: '#0A0C14', panel: '#141826', ink: '#EEF0F6', dim: '#8C93A6', line: '#262B3B', accent: '#7A86FF',
               onAccent: '#0A0C14', paper: '#F4F1EA', onPaper: '#141826', ok: '#4CC27E', warn: '#E0A63A', fail: '#F06A5E' },
      contrast: { 'ink/ground': 17.13, 'dim/ground': 6.36, 'accent/ground': 6.21, 'ink/panel': 15.51, 'dim/panel': 5.76 },
      accentMeans: 'the light: where the product is attending' },
    { id: 'afterglow-dawn', name: { en: 'Afterglow dawn', zh: '余晖·晨' }, dark: false,
      roles: { ground: '#EFE7DA', panel: '#FBF7F0', ink: '#231F1A', dim: '#756B5E', line: '#D8CCBA', accent: '#3E55E0',
               onAccent: '#FFFFFF', paper: '#FFFFFF', onPaper: '#231F1A', ok: '#2E9E5B', warn: '#C98A12', fail: '#D2453B' },
      contrast: { 'ink/ground': 13.34, 'dim/ground': 4.26, 'accent/ground': 4.78, 'ink/panel': 15.33, 'dim/panel': 4.89 },
      accentMeans: 'the light: where the product is attending' },
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
    italic: { en: false, zh: false },
    leading: { en: 1.1, zh: 1.3 },
  },
  grid: { cols: 12, margin: 120, gutter: 24, baseline: 8, safe: [96, 54] },
  camera: { habit: 'drift', maxScale: 1.1, shutter: 0.5, ease: { enter: 'snappy', move: 'smooth', exit: 'exit' } },
  // light: 'orbs' (night: three orbs drifting behind the content, converging still at the end of a section),
  // 'bloom' (an aurora rising from the foot of the frame; ground-flip presses it into an afterglow), 'rings' (dawn:
  // four concentric rings breathing out of phase round the subject). One light per section, never two.
  texture: { grain: 0.06, glow: { role: 'accent', radius: 90 }, vignette: 0.35, light: 'orbs', lights: ['orbs', 'bloom', 'rings'] },
  motion: { spring: 10, enterBeats: 1, exitShare: 0.66 },
};

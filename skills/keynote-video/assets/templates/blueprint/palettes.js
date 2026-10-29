// palettes.js — blueprint presets. Choose one by id in content.js; never invent hex values.
// Logic shared by every preset: a reprographic ground, pale (or dark) line work in two weights,
// and ONE accent that marks only what a person decides: stamps, revision marks, YOU.
// Contrast (WCAG, checked by tools/contrast.mjs): ink, muted and accent ≥ 4.5:1 on paper; line ≥ 4.5:1.
export default {
  cyanotype: {
    name: 'Cyanotype (source film)',
    bg: '#0A2652', // outside the drawing
    paper: '#10356C', // the drawing
    ink: '#EAF3FF', // main lines, titles
    line: '#9FD3FF', // fine lines, dimensions, labels
    muted: '#BCD6F3', // secondary text
    accent: '#FFB547', // human decisions only
    onAccent: '#0A2652', // numbers inside accent marks
    grid: [0.075, 0.16], // fine / major grid alpha (of line)
    texture: { mode: 'screen', alpha: 0.5 },
    lamp: { color: '#FFD6A0', alpha: 0.085, mode: 'screen' },
    vignette: { color: '#05122C', alpha: 0.5 },
    dark: true,
  },
  diazo: {
    name: 'Diazo night (deep navy)',
    bg: '#050B18',
    paper: '#0A1630',
    ink: '#E6EDF8',
    line: '#8EB4E8',
    muted: '#B0C1DB',
    accent: '#FFB547',
    onAccent: '#0A1630',
    grid: [0.06, 0.14],
    texture: { mode: 'screen', alpha: 0.42 },
    lamp: { color: '#FFD6A0', alpha: 0.07, mode: 'screen' },
    vignette: { color: '#02060F', alpha: 0.55 },
    dark: true,
  },
  blueline: {
    name: 'Blueline print (blue lines on white)',
    bg: '#C5CED9',
    paper: '#F3F5F1',
    ink: '#14306A',
    line: '#2D5CA3',
    muted: '#3C5479',
    accent: '#A85200',
    onAccent: '#F3F5F1',
    grid: [0.09, 0.2],
    texture: { mode: 'multiply', alpha: 0.32 },
    lamp: { color: '#FFE2B8', alpha: 0.22, mode: 'multiply' },
    vignette: { color: '#4A5A70', alpha: 0.28 },
    dark: false,
  },
  // the pencil original (content.original, 2026-10-19): graphite on drafting vellum, as drawn before it is issued.
  // A film marked with an issue is drafted on it in pencil until a person's stamp floods it into the print.
  vellum: {
    name: 'Vellum original (graphite on drafting film)',
    bg: '#D7D8D3',
    paper: '#F4F3EE',
    ink: '#2B2E33',
    line: '#565C64',
    muted: '#474C54',
    accent: '#A85200',
    onAccent: '#F4F3EE',
    grid: [0.05, 0.11],
    texture: { mode: 'multiply', alpha: 0.26 },
    lamp: { color: '#FFE6C4', alpha: 0.16, mode: 'multiply' },
    vignette: { color: '#5A5C58', alpha: 0.22 },
    dark: false,
  },
  // `coral` is "Coral red" (2026-10-19), for a brand whose colour is a warm red. The accent is a brand guide's flat
  // coral #FF6452 (OKLCH 0.699 0.192 29.4°), used exactly (ΔE00 0): on this ground it passes as text (5.8:1), so it is
  // not darkened. A cool blue ground makes a red accent vibrate, so the ground keeps the mode's logic (a reprographic
  // negative: light lines in two weights on a dark ground, one accent) on a deep oxblood drawing ground in the
  // accent's own hue (paper OKLCH 0.235 0.048 20°, bg 0.185 0.040 20°): the accent stands out by lightness and chroma,
  // not by a clash of hues. The line work is a cool silver (OKLCH 0.83 0.022 235°), 163° of hue from the accent (the
  // contrast tool's hue), so a line never reads as a mark; ink and muted are warm whites. The guide's gradient (#FF3763 → #FF7038) is not used:
  // the mode's accent is one flat ink (stamps, brackets, marks). There is no red negative process in reprography; the
  // hue is the brand's, the logic the cyanotype's (`derived`). Contrast on paper: ink 15.2, line 10.1, muted 11.0,
  // accent 5.8, onAccent (paper) on accent 5.8; paper / bg 1.11.
  coral: {
    name: 'Coral red (oxblood ground)',
    bg: '#220A0B',
    paper: '#311414',
    ink: '#FAF1EE',
    line: '#BACAD4',
    muted: '#DCCDC9',
    accent: '#FF6452',
    onAccent: '#311414',
    grid: [0.06, 0.13],
    texture: { mode: 'screen', alpha: 0.4 },
    lamp: { color: '#FFD1C1', alpha: 0.06, mode: 'screen' },
    vignette: { color: '#0F0203', alpha: 0.55 },
    dark: true,
  },
  graphite: {
    name: 'Graphite film (pencil on dark drafting film)',
    bg: '#0F1114',
    paper: '#1A1E23',
    ink: '#ECEEF1',
    line: '#A9B6C3',
    muted: '#BCC4CD',
    accent: '#FFB547',
    onAccent: '#1A1E23',
    grid: [0.06, 0.13],
    texture: { mode: 'screen', alpha: 0.38 },
    lamp: { color: '#FFD6A0', alpha: 0.06, mode: 'screen' },
    vignette: { color: '#050607', alpha: 0.55 },
    dark: true,
  },
};

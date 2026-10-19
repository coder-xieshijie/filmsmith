// palettes.js — plakat presets. Choose one by id in content.js; never invent hex values.
//
// Every preset keeps the mode's logic: a neutral paper, one ink for text, rules and solid blocks, one accent
// that marks only the human and the human's decisions (input, chosen option, YOU nodes, stop band, current bar).
//
// Roles
//   paper     ground
//   ink       text, rules, solid blocks
//   grey      secondary text on paper
//   accent    blocks, rules and large type only (never small text on paper)
//   onAccent  text drawn on an accent block
//   onInk     text drawn on an ink block (usually = paper)
//   mutedOnInk  small labels on an ink block
//   promptOnInk the command prompt glyph on the ink install block
//   gridAlpha column-line opacity (ink at this alpha), hairAlpha thin table rules
//
// Contrast (WCAG 2.2, computed): text >= 4.5:1, large type and graphics >= 3:1.
//   signal  ink/paper 16.4  grey/paper 6.0  accent/paper 3.1 (large/blocks only)  onAccent(ink)/accent 5.3
//   ikb     ink/paper 16.4  grey/paper 6.0  accent/paper 6.6                       onAccent(paper)/accent 6.6
//   orange  ink/paper 16.4  grey/paper 6.0  accent/paper 3.0 (large/blocks only)  onAccent(ink)/accent 5.4
//   clay    ink/paper 16.4  grey/paper 6.0  accent/paper 3.05 (large/blocks only) onAccent(ink)/accent 5.4
//   night   ink/paper 15.3  grey/paper 6.9  accent/paper 5.5                       onAccent(paper)/accent 5.5
//   promptOnInk on the ink block: signal 5.3, ikb 7.9, orange 5.4, clay 5.4, night 4.6 (all >= 4.5, 2026-10-18;
//   clay 2026-10-19)
//
// Names and sources (2026-10-18, theory 05 §5.2; ids unchanged). `signal` is "Swiss red": #FF3B1F approximates the
// hue of the Swiss federal design manual's red #FF0000 (ΔE00 3.8); it is not RAL 3001 Signal red, a different,
// darker colour. `ikb` is "Ultramarine signal", #1E40D8: not Klein's IKB (no published value; the web's #002FA7 is
// ΔE00 8.1 away). What separates it from ink is chroma, not lightness (it is only 2.5:1 against ink). `orange` is
// the ANSI Z535 Safety Orange hue (5.0YR 6.0/15, about #E27700, clipped) darkened to #D36F01 until it just passes
// 3:1 on paper; the ANSI centre itself reaches only 2.66. `clay` is "Clay", a warm terracotta chosen by the owner
// 2026-10-19 from the sample #D97757 (OKLCH 0.672 0.131 38.8°, only 2.72:1 on paper), darkened along its own
// OKLCH hue and chroma to #CF6E4E (0.643 0.131 38.9°, ΔE00 3.1 from the sample) until it passes 3:1 on paper with
// a little margin (3.05). Ink stays the text on it (5.39), so it is the prompt glyph as well (5.39 on ink).

export default {
  signal: {
    name: 'Swiss red (source film)',
    fits: 'Default. Warm, decisive; the accepted dev-skills launch film. Approximates the Swiss federal red #FF0000.',
    paper: '#F2EFE8', ink: '#111111', grey: '#5E5A53',
    accent: '#FF3B1F', onAccent: '#111111',
    onInk: '#F2EFE8', mutedOnInk: '#BDB8AE', promptOnInk: '#FF3B1F',
    gridAlpha: 0.085, hairAlpha: 0.12,
  },
  ikb: {
    name: 'Ultramarine signal',
    fits: 'Cooler, more institutional; design and research tools. Chroma, not lightness, separates it from ink.',
    paper: '#F2EFE8', ink: '#111111', grey: '#5E5A53',
    accent: '#1E40D8', onAccent: '#F2EFE8',
    onInk: '#F2EFE8', mutedOnInk: '#BDB8AE', promptOnInk: '#8EA2FF',
    gridAlpha: 0.085, hairAlpha: 0.12,
  },
  orange: {
    name: 'Safety orange (ANSI hue)',
    fits: 'Operations, infrastructure, anything with a stop or a warning in its story.',
    paper: '#F2EFE8', ink: '#111111', grey: '#5E5A53',
    accent: '#D36F01', onAccent: '#111111',
    onInk: '#F2EFE8', mutedOnInk: '#BDB8AE', promptOnInk: '#D36F01',
    gridAlpha: 0.085, hairAlpha: 0.12,
  },
  clay: {
    name: 'Clay (terracotta)',
    fits: 'Warmer and softer than the red; craft, writing and people-first tools. Chosen by the owner 2026-10-19.',
    paper: '#F2EFE8', ink: '#111111', grey: '#5E5A53',
    accent: '#CF6E4E', onAccent: '#111111',
    onInk: '#F2EFE8', mutedOnInk: '#BDB8AE', promptOnInk: '#CF6E4E',
    gridAlpha: 0.085, hairAlpha: 0.12,
  },
  night: {
    name: 'Night print (inverted)',
    fits: 'Dark rooms, keynote screens; same system printed light on black.',
    paper: '#141414', ink: '#EDEAE3', grey: '#A39E94',
    accent: '#FF4A2E', onAccent: '#141414',
    onInk: '#141414', mutedOnInk: '#5E5A53', promptOnInk: '#C4311A',
    gridAlpha: 0.11, hairAlpha: 0.16,
  },
};

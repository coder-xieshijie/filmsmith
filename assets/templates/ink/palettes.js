// palettes.js — ink presets. Paper + ink + ONE accent that means "the dot, and what the dot becomes".
// Choose one by id in content.js; never invent hex values. `npm run palettes` prints every contrast pair.
//
// Roles
//   paper / ink / soft      main ground, main type, secondary mono lines on paper (the licence line). soft is the
//                           neutral grey tinted toward the preset's own hue at the same lightness, C* about 3
//                           (2026-10-18, LAB 学习理论/05 proposal I1, settled by theory): cobalt cool, vermilion and
//                           carbon warm (the accent's hue), forest green
//   accent                  the accent: the dot and the field it blooms into; also a word that is itself transforming
//   onAccent                type on the accent field
//   night / nightInk / nightSoft / nightAccent   the contrast section (steps, ruler, counter);
//                           nightAccent is the same hue as accent, lifted to read on night; nightSoft is the step
//                           counter and the streaks (light, not accent)
//   mis                     an effect colour, not a second accent: the misregistration ghost on slam impact frames
//                           only (40 % alpha, ≤ 0.1 s); it never marks anything
export const PALETTES = {
  cobalt: {
    name: 'Cobalt',
    fits: 'Default; tools and launches, the source film',
    paper: '#EFEEE8', ink: '#111214', soft: '#52545A',
    accent: '#2B3BFF', onAccent: '#EFEEE8',
    night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#6B78FF',
    mis: '#FF5A1F',
  },
  vermilion: {
    name: 'Vermilion',
    fits: 'Editorial, culture, anything with a stamp or a seal',
    paper: '#EFEEE8', ink: '#111214', soft: '#595250',
    accent: '#C8321A', onAccent: '#EFEEE8',
    night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#FF6A45',
    mis: '#1F6BFF',
  },
  forest: {
    name: 'Forest',
    fits: 'Data, finance, sustainability, calm products',
    paper: '#EFEEE8', ink: '#111214', soft: '#4E5451',
    accent: '#0E6A48', onAccent: '#EFEEE8',
    night: '#111214', nightInk: '#EFEEE8', nightSoft: '#9A9BA0', nightAccent: '#3CC48C',
    mis: '#FF5A1F',
  },
  carbon: {
    name: 'Carbon (inverted)',
    fits: 'Night launches, developer tools; dark paper, light night section',
    paper: '#16161A', ink: '#EEEDE6', soft: '#BFB8B6',
    accent: '#FF5B2E', onAccent: '#16161A',
    night: '#EEEDE6', nightInk: '#16161A', nightSoft: '#55565B', nightAccent: '#C23A16',
    mis: '#2B3BFF',
  },
  // `coral` (2026-10-20): carbon's dark paper and light night with a brand guide's flat coral accent #FF6452
  // (OKLCH 0.699 0.192 29.4°), used unchanged: 6.18:1 on the dark paper, and the paper is the type on its field
  // (onAccent 6.18). On the light night the flat coral reaches only 2.49:1, so nightAccent is the same colour
  // darkened along its own OKLCH hue and chroma to #EB5141 (0.643 0.193 29.3°, ΔE00 5.8 from #FF6452, 6.8 between
  // #FF6452 and carbon's #FF5B2E) until it passes 3:1 with a little margin (3.09; nightInk on it 4.97). soft and
  // nightSoft are carbon's greys tinted toward the coral's CIELAB hue (35°) at the same L* and C* about 3:
  // #C0B8B6 9.26:1 on paper, #5B5553 6.24:1 on night. mis stays blue (#2B3BFF), so the ghost never reads as a
  // second red. The same guide's two-stop gradient (#FF3763 → #FF7038) is not used: the bloom is one pigment.
  coral: {
    name: 'Coral red (inverted)',
    fits: 'Night launches whose brand colour is a coral or pink-red; dark paper, light night section',
    paper: '#16161A', ink: '#EEEDE6', soft: '#C0B8B6',
    accent: '#FF6452', onAccent: '#16161A',
    night: '#EEEDE6', nightInk: '#16161A', nightSoft: '#5B5553', nightAccent: '#EB5141',
    mis: '#2B3BFF',
  },
};
export default PALETTES;

// WCAG 2.2 relative luminance and contrast.
const lum = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
};
export const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
// [foreground, background, minimum, what it is]
export const PAIRS = [
  ['ink', 'paper', 4.5, 'slam words, labels on paper'],
  ['soft', 'paper', 4.5, 'secondary mono line on paper'],
  ['accent', 'paper', 3, 'the dot, accent words (large) on paper'],
  ['onAccent', 'accent', 4.5, 'name and labels on the accent field'],
  ['nightInk', 'night', 4.5, 'step words, labels on night'],
  ['nightSoft', 'night', 4.5, 'step counter, streaks on night'],
  ['nightAccent', 'night', 3, 'the dot, progress dot, playhead on night'],
];
export const report = (p) => PAIRS.map(([fg, bg, min, what]) => ({ fg, bg, min, what, ratio: contrast(p[fg], p[bg]) }));

// node palettes.js → contrast table for every preset
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of report(p)) {
      const ok = r.ratio >= r.min;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.fg.padEnd(11)} on ${r.bg.padEnd(7)} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  if (bad) { console.error(`\n${bad} pair(s) below the minimum`); process.exit(1); }
}

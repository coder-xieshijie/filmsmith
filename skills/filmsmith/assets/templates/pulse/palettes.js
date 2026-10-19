// palettes.js — pulse presets. One hue's lightness ramp (four steps) plus a near-white and a near-black, and ONE
// accent that means "the answer". Choose one by id in content.js; never invent hex values. `npm run palettes`
// prints every contrast pair the template can draw, ground by ground.
//
// Roles
//   ramp[0..3]   the grounds: near-black tinted with the hue, deep, mid (saturated), light tint. The ground flips
//                along this ramp (and to `white`) on the beat; mid tones carry the most chroma (system.md, Taylor)
//   white        near-white tinted with the hue: type on the dark steps, and the inverted ground (never #FFFFFF)
//   ink          near-black: type on the light steps (= ramp[0])
//   dim          candidates that failed, the quiet query line on ramp[0]
//   accent       the answer, and nothing else: the locked cell, the revealed value, the version in the lock-up.
//                Lands only on the three dark steps (amber on a light step fails 3:1)
//
// Which colour sets which text on which ground is decided in one place, `onGround()` below; film.js asks it
// for every frame, and `PAIRS` checks every pair it can return.
export const PALETTES = {
  indigo: {
    name: 'Indigo (source)',
    fits: 'Default; launches, version releases, benchmark answers (the owner-accepted sample, 2026-10-19)',
    ramp: ['#0D0C14', '#24206B', '#4B43E6', '#ECEAF7'],
    white: '#F4F3FA', ink: '#0D0C14', dim: '#8F8CA8',
    accent: '#FFC53D',
  },
  petrol: {
    name: 'Petrol',
    fits: 'Infrastructure, data and storage products; a cooler, quieter blue-green',
    ramp: ['#071214', '#0C3A40', '#0F717A', '#E1F0F0'],
    white: '#F2F8F8', ink: '#071214', dim: '#7E9A9D',
    accent: '#FFC53D',
  },
  graphite: {
    name: 'Graphite',
    fits: 'Sober benchmark reports and security or compliance tools; achromatic, so the amber answer carries all the colour',
    ramp: ['#0E0F11', '#2A2D33', '#5A606B', '#E9EAEC'],
    white: '#F5F5F6', ink: '#0E0F11', dim: '#8E939C',
    accent: '#FFC53D',
  },
};
export default PALETTES;

// Grounds a frame can stand on: the four ramp steps and the inverted white.
export const GROUNDS = ['r0', 'r1', 'r2', 'r3', 'white'];
export const isLight = (g) => g === 'r3' || g === 'white';
export const groundHex = (P, g) => (g === 'white' ? P.white : P.ramp[Number(g.slice(1))]);

// The colours for type on a ground: `text` (display and text lines), `quiet` (the query line, labels, values of
// candidates that already failed are `dim` on r0 only), `accent` (null where the accent may not land: the light
// grounds), `accentInk` (type on an accent fill), `hop` (the highlight fill of a candidate), `rule` (cell outlines,
// 3 px, decoration: the cell is named by its label).
export const onGround = (P, g) => {
  switch (g) {
    case 'r0': return { text: P.white, quiet: P.dim, dim: P.dim, accent: P.accent, accentInk: P.ink, hop: P.ramp[2], rule: P.ramp[1] };
    case 'r1': return { text: P.white, quiet: P.ramp[3], dim: P.ramp[3], accent: P.accent, accentInk: P.ink, hop: P.ramp[2], rule: P.ramp[2] };
    case 'r2': return { text: P.white, quiet: P.ramp[3], dim: P.ramp[3], accent: P.accent, accentInk: P.ink, hop: P.ramp[1], rule: P.ramp[1] };
    case 'r3': return { text: P.ink, quiet: P.ink, dim: P.ramp[1], accent: null, accentInk: P.ink, hop: P.ramp[1], rule: P.ramp[1] };
    case 'white': return { text: P.ramp[1], quiet: P.ramp[1], dim: P.ramp[1], accent: null, accentInk: P.ink, hop: P.ramp[1], rule: P.ramp[1] };
    default: throw new Error(`unknown ground ${g}`);
  }
};

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
export const luminance = lum;

// Every pair the template draws: [ground, role, minimum, what]. Text tones need 4.5:1 on every ground they land on
// (the 31 px query line is the smallest text); the accent is display type and fills only, 3:1; the hop fill and the
// ground steps against each other are graphics, 3:1 where they carry the highlight.
export const pairs = (P) => {
  const out = [];
  for (const g of GROUNDS) {
    const c = onGround(P, g), bg = groundHex(P, g);
    out.push({ ground: g, role: 'text', fg: c.text, bg, min: 4.5, what: 'words, cells, values, lines' });
    out.push({ ground: g, role: 'quiet', fg: c.quiet, bg, min: 4.5, what: 'query line, labels' });
    out.push({ ground: g, role: 'dim', fg: c.dim, bg, min: 4.5, what: 'failed candidates' });
    if (c.accent) out.push({ ground: g, role: 'accent', fg: c.accent, bg, min: 3, what: 'the answer (display type, fills)' });
  }
  out.push({ ground: 'accent', role: 'accentInk', fg: P.ink, bg: P.accent, min: 4.5, what: 'label on the locked cell' });
  out.push({ ground: 'r0', role: 'hop', fg: P.ramp[2], bg: P.ramp[0], min: 3, what: 'highlight fill on the search ground (graphic)' });
  out.push({ ground: 'hop', role: 'text', fg: P.white, bg: P.ramp[2], min: 4.5, what: 'label on the highlighted cell' });
  return out.map((p) => ({ ...p, ratio: contrast(p.fg, p.bg) }));
};
export const report = pairs;

// node palettes.js → contrast table for every preset
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  let bad = 0;
  for (const [id, p] of Object.entries(PALETTES)) {
    console.log(`\n${id} — ${p.name}`);
    for (const r of pairs(p)) {
      const ok = r.ratio >= r.min - 1e-9;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.role.padEnd(9)} on ${r.ground.padEnd(6)} ${r.fg} / ${r.bg} ${r.ratio.toFixed(2).padStart(5)} ≥ ${r.min}  ${r.what}`);
    }
  }
  if (bad) { console.error(`\n${bad} pair(s) below the minimum`); process.exit(1); }
}

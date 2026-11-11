// plakat.js — plakat-columns: an ink shutter runs up each of the 12 columns of the plakat grid, one after
// the other, left to right; ahead of it the old poster, behind it the new one, which rises the last few pixels into
// place as the shutter clears. angle: the columns lean (sheared by that many degrees); twoPhase: the ink first fills
// every column (a moment of solid ink), then lifts from the bottom, column by column, onto the new poster.
// Theory: references/transitions.md#plakat-columns.

const COLUMNS = `
uniform float uStagger;   // start delay between neighbouring columns (fraction of p)
uniform float uDur;       // one column's sweep (fraction of p)
uniform float uBlock;     // shutter height (film px)
uniform float uRise;      // how far the new poster rises into place (film px)
uniform float uSlant;     // tan of the columns' lean (0: upright)
uniform float uTwo;       // 1: cover, hold, reveal

vec3 transition(vec2 s, float p) {
  // strips of the 12-column grid (96 px margins, 122 px columns, 24 px gutters), split at the gutters' centres
  float sx = s.x - uSlant * (s.y - 540.0);
  float k = clamp(floor((sx - 96.0 + 12.0) / 146.0), 0.0, 11.0);
  if (uTwo > 0.5) {
    float u1 = easeInOutQuint(lin(k * uStagger, k * uStagger + uDur, p / 0.45));
    float u2 = easeInOutQuint(lin(k * uStagger, k * uStagger + uDur, (p - 0.55) / 0.45));
    float top = mix(1080.0, -2.0, u1), trail = mix(1080.0, -2.0, u2);
    vec3 c = mix(A(s), uInk, cover(s.y - top));
    return mix(c, B(s + vec2(0.0, uRise * (1.0 - u2))), cover(s.y - trail));
  }
  float u = easeInOutQuint(lin(k * uStagger, k * uStagger + uDur, p));
  float top = mix(1080.0, -uBlock, u);          // the shutter's leading edge
  vec3 a = A(s);
  vec3 b = B(s + vec2(0.0, uRise * (1.0 - u)));
  vec3 col = mix(a, uInk, cover(s.y - top));
  return mix(col, b, cover(s.y - (top + uBlock)));
}`;

export default [
  {
    name: 'plakat-columns',
    mode: 'plakat',
    tier: 'T2',
    beats: 2,
    ease: 'each column quint in-out over 40 %; columns 5 % apart, left to right; new poster rises 40 px with its column',
    roles: ['ink'],
    summary: 'An ink shutter runs up each of the twelve grid columns in turn; the new poster is behind it.',
    frag: COLUMNS,
    uniforms: ({ block = 200, rise = 40, angle = 0, twoPhase = false }) => ({
      uStagger: 0.05, uDur: 0.4, uBlock: block, uRise: rise, uSlant: Math.tan((angle * Math.PI) / 180), uTwo: twoPhase ? 1 : 0,
    }),
  },
];

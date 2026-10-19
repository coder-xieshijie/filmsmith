// aperture-swap.js — aperture-swap: the word stays on its anchor (same left edge, same baseline) while a geometric
// aperture opens onto the next frame: a horizontal band from the word's middle, a circle from the word, bars closing
// from top and bottom, or a hard cut (an invert of the palette is a cut between two frames). Hard antialiased edges,
// nothing blended. Theory: references/transitions.md#aperture-swap.

const APERTURE = `
uniform float uShape;   // 0 band, 1 circle, 2 close, 3 cut
uniform float uR;       // band: half-height that clears the frame; circle: radius that clears the farthest corner

vec3 transition(vec2 s, float p) {
  float u = easeOutCubic(p);
  float m;
  if (uShape < 0.5) m = cover(u * uR - abs(s.y - uOrigin.y));
  else if (uShape < 1.5) m = cover(u * uR - length(s - uOrigin));
  else if (uShape < 2.5) m = max(cover(u * (uOrigin.y + 1.0) - s.y), cover(s.y - (1080.0 - u * (1081.0 - uOrigin.y))));
  else m = 1.0;
  return mix(A(s), B(s), m);
}`;

const SHAPES = { band: 0, circle: 1, close: 2, cut: 3 };
const farthest = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(1920 - x, y), Math.hypot(x, 1080 - y), Math.hypot(1920 - x, 1080 - y));

export default [
  {
    name: 'aperture-swap',
    mode: 'pulse, plakat, ink',
    tier: 'T0',
    beats: 0.44,
    ease: 'cubic out over 0.22 s (0.44 beat at 120 BPM); hard edge',
    roles: [],
    summary: 'The word holds its place while an aperture (band, circle, closing bars or a cut) opens onto the next ground.',
    origin: [960, 540],
    frag: APERTURE,
    // origin: the word's optical middle (the band's centre line, the circle's centre)
    uniforms: ({ origin, shape = 'band' }) => {
      const sh = SHAPES[shape] ?? 0;
      return { uShape: sh, uR: sh === 1 ? farthest(origin) + 2 : Math.max(origin[1], 1080 - origin[1]) + 2 };
    },
  },
];

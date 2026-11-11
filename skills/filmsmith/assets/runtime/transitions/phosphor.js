// phosphor.js — two phosphor transitions.
//   crt-collapse: the old picture collapses as a CRT does when its deflection dies (height first, to a bright
//                 line, then width, to a dot that fades), and the new one opens the same way: dot, line, raster.
//   dither-sweep: an ordered-dither front (Bayer 8 × 8, 16 px cells) sweeps out from the origin; each cell lights in
//                 the phosphor accent for a moment, then shows the new frame.
// Theory: references/transitions.md#crt-collapse, #dither-sweep.

const CRT = `
uniform float uLine;   // height of the collapsed line (film px)

// one raster of frame F (0: old, 1: new) squeezed to half-size (hx, hy) round the centre, heated toward paper
vec3 raster(vec2 s, float hx, float hy, float heat, float which) {
  vec2 c = vec2(960.0, 540.0);
  vec2 d = s - c;
  vec2 src = c + d / vec2(max(hx / 960.0, 1e-4), max(hy / 540.0, 1e-4));
  vec3 img = which < 0.5 ? A(src) : B(src);
  // the beam's energy concentrates as the raster shrinks: brighter, toward the phosphor's hot colour
  vec3 hot = mix(img * (1.0 + 1.5 * heat), uPaper, heat);
  float inside = cover(hx - abs(d.x)) * cover(hy - abs(d.y));
  // a soft bloom round a thin hot line, only on the ground
  float halo = heat * exp(-abs(d.y) / 7.0) * exp(-max(abs(d.x) - hx, 0.0) / 9.0) * 0.55;
  vec3 ground = mix(uGround, uAccent, clamp(halo, 0.0, 1.0));
  return mix(ground, hot, inside);
}

vec3 transition(vec2 s, float p) {
  if (p < 0.47) {
    float t = p / 0.47;
    float vy = easeInCubic(lin(0.0, 0.55, t));
    float vx = easeInCubic(lin(0.5, 0.86, t));
    float hy = mix(540.0, uLine * 0.5, vy);
    float hx = mix(960.0, 2.0, vx);
    float heat = 1.0 - smoothstep(0.03, 0.3, hy / 540.0);         // energy concentrates as the raster shrinks
    if (t < 0.86) return raster(s, hx, hy, heat, 0.0);
    // the spot: the beam parked in the centre, a bright dot whose glow dies away
    float k = 1.0 - smoothstep(0.86, 1.0, t);
    float dd = length(s - vec2(960.0, 540.0));
    vec3 spot = mix(uGround, uAccent, clamp(exp(-dd / 12.0) * 0.85 * k, 0.0, 1.0));
    return mix(spot, uPaper, cover(4.0 * k - dd));
  }
  if (p < 0.53) return uGround;
  float t = (p - 0.53) / 0.47;
  float vx = easeOutCubic(lin(0.0, 0.32, t));
  float u = lin(0.26, 0.82, t);
  // the height opens with a slight overshoot (a spatial property, so a small bounce is allowed)
  float xo = u - 1.0;
  float vy = u <= 0.0 ? 0.0 : 1.0 + 1.7 * xo * xo * xo + 0.7 * xo * xo;   // back-out, about 3.5 % over
  float hx = mix(2.0, 960.0, vx);
  float hy = mix(uLine * 0.5, 540.0, vy);
  float heat = (1.0 - smoothstep(0.03, 0.3, hy / 540.0)) * (1.0 - smoothstep(0.6, 0.85, t));   // spreads as it opens
  float rise = smoothstep(0.0, 0.08, t);
  vec3 r = raster(s, hx, hy, heat, 1.0);
  return mix(uGround, r, rise);
}`;

const DITHER = `
uniform float uCell;    // cell size (film px)
uniform float uBand;    // width of the dithered band (fraction of the sweep)
uniform float uMaxR;    // distance from the origin to the farthest corner

float bayer8(vec2 c) {          // ordered-dither threshold of an integer cell, in [0, 1)
  vec2 q = mod(c, 8.0);
  float v = 0.0;
  float w = 16.0;
  for (int i = 0; i < 3; i++) {
    vec2 b = mod(q, 2.0);
    v += w * (2.0 * abs(b.x - b.y) + b.y);
    q = floor(q / 2.0);
    w /= 4.0;
  }
  return v / 64.0;
}

vec3 transition(vec2 s, float p) {
  vec2 cell = floor(s / uCell);
  vec2 cc = (cell + 0.5) * uCell;
  float ramp = length(cc - uOrigin) / uMaxR;           // 0 at the origin, 1 at the farthest corner
  float e = mix(p, easeInOutCubic(p), 0.5);
  float local = (e * (1.0 + uBand + 0.2) - ramp) / uBand;
  float th = bayer8(cell) * 0.82;
  float lit = step(th, local) * step(0.0001, local);
  float done = step(th + 0.2, local);
  // a lit cell is a block character: inset 2 px, ground in the gap
  vec2 l = s - cell * uCell;
  float block = cover(min(min(l.x, l.y), min(uCell - l.x, uCell - l.y)) - 2.0);
  vec3 litc = mix(uGround, uAccent, block);
  return mix(mix(A(s), litc, lit), B(s), done);
}`;

const farthest = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(1920 - x, y), Math.hypot(x, 1080 - y), Math.hypot(1920 - x, 1080 - y));

export default [
  {
    name: 'crt-collapse',
    mode: 'phosphor',
    tier: 'T2',
    beats: 2,
    ease: 'off 47 %: height cubic-in, then width cubic-in, spot fades; 6 % dark; on 47 %: width cubic-out, height back-out (3.5 % over)',
    roles: ['ground', 'accent', 'paper'],
    summary: 'The picture collapses like a CRT switched off (height, then width, to a dying spot) and the new one powers on.',
    frag: CRT,
    uniforms: ({ line = 4 }) => ({ uLine: line }),
  },
  {
    name: 'dither-sweep',
    mode: 'phosphor, tally',
    tier: 'T2',
    beats: 2,
    ease: 'front 50 % linear + 50 % cubic in-out; each cell lit for 20 % of the band',
    roles: ['ground', 'accent'],
    summary: 'An ordered-dither front sweeps out from the origin; cells flick on in the phosphor accent, then show the new frame.',
    origin: [0, 1080],
    frag: DITHER,
    uniforms: ({ origin, cell = 16 }) => ({ uCell: cell, uBand: 0.22, uMaxR: farthest(origin) }),
  },
];

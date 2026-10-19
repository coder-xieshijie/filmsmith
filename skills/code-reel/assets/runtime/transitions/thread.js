// thread.js — thread-split: one line draws down the frame, then opens like a seam into marbled dye; the new frame
// is inside the seam. thread's own grammar (one line becomes everything; its ink is a line dissolving into two
// marbled dyes curling outward). Theory: references/transitions.md#thread-split.

const SPLIT = `
uniform float uX0;     // the line's x (film px)
uniform float uSmax;   // half-opening at p = 1: past both edges with room for the curls
uniform float uW;      // line width (film px)

// the seam's edge offset: two-level domain warp in coordinates that stretch with the opening (as thread's ink)
vec2 seam(vec2 s, float S, float po, out float marb, out float fold) {
  vec2 o = seedOff();
  vec2 q = vec2((s.x - uX0) / (90.0 + 0.55 * S), s.y / 330.0 - po * 0.55);
  vec2 w1 = vec2(fbm2(q * 1.3 + o), fbm2(q * 1.3 + o + vec2(5.2, 1.3)));
  vec2 p2 = q + 1.7 * w1;
  vec2 w2 = vec2(fbm2(p2 * 1.9 + o + 7.1), fbm2(p2 * 1.9 + o + 2.9));
  vec2 p3 = p2 + 0.8 * w2;
  marb = fbm(p3 * 1.6 + 11.0 + o);
  fold = fbm2(p3 * 5.0 + 3.0 + o);
  float k = smoothstep(0.0, 0.35, po);            // the line starts straight
  float amp = k * (26.0 + 0.3 * S) * (1.0 - 0.65 * smoothstep(0.55, 1.0, po));   // ≤ 170 px at the end
  // outer edge (old frame side) and inner edge (new frame side) curl differently
  return vec2(amp * (w1.x + 0.6 * w2.x), amp * (w1.y + 0.6 * w2.y) * 0.8);
}

vec3 transition(vec2 s, float p) {
  float pd = easeInOutCubic(lin(0.0, 0.3, p));    // the line draws top to bottom
  float po = lin(0.24, 1.0, p);
  float S = uSmax * easeInOutCubic(po);
  float band = (uW * 0.5 + 150.0 * pow(max(sin(3.1416 * min(po * 1.25, 1.0)), 0.0), 0.75)) * (1.0 - smoothstep(0.72, 1.0, po));
  band = po < 0.8 ? max(band, uW * 0.5 * (1.0 - smoothstep(0.6, 0.8, po))) : band;
  float marb, fold;
  vec2 off = seam(s, S, po, marb, fold);
  float X = abs(s.x - uX0 + off.x);
  float Xi = abs(s.x - uX0 + off.y);
  // the drawn length of the line, with a round tip
  float tipY = -20.0 + 1120.0 * pd;
  float drawn = cover(tipY - s.y);
  float outer = cover(S + band - X) * drawn;        // inside the dye or the opening
  float inner = cover(S - Xi);                      // the opening: the new frame
  // the dye: line colour marbled with the neutral, lit by its folds (finite difference of the marbling)
  float m2, f2;
  seam(s + vec2(2.0, 0.0), S, po, m2, f2);
  float m3, f3;
  seam(s + vec2(0.0, 2.0), S, po, m3, f3);
  vec3 n = normalize(vec3(-(m2 - marb) * 22.0, -(m3 - marb) * 22.0, 1.0));
  float lit = clamp(0.62 + 0.55 * dot(n, normalize(vec3(-0.6, -0.7, 0.45))), 0.35, 1.2);
  // three tones as in thread's ink: the neutral dye (left of the line), the line colour (right), and the ground
  // showing through thin dye between them
  float side = clamp((s.x - uX0) / max(S + band, 40.0), -1.0, 1.0);
  float t = marb + 0.25 * fold - 0.22 * side;
  float neutral = smoothstep(0.02, 0.16, t);
  float gap = 1.0 - smoothstep(0.0, 0.05, abs(t - 0.09) - 0.02);
  vec3 dye = mix(uInk, uPaper, neutral * 0.9);
  dye = mix(dye, mix(uGround, uInk * 0.4, 0.3), gap * 0.85);
  float thin = smoothstep(uW, uW * 4.0, band);      // a plain line until it opens
  vec3 deep = uInk * uInk / max(max(uInk.r, uInk.g), max(uInk.b, 1e-3)) * 0.5;
  vec3 shaded = dye * lit * (0.85 + 0.3 * fold);
  shaded = mix(shaded, deep, 0.35 * smoothstep(0.3, 0.0, (S + band - X) / max(band, 1.0)) * thin);   // edge darker
  vec3 col = mix(A(s), mix(uInk, shaded, thin), outer);
  return mix(col, B(s), inner * step(0.001, S));
}`;

export default [
  {
    name: 'thread-split',
    mode: 'thread',
    tier: 'T2',
    beats: 3,
    ease: 'draw: cubic in-out over 30 %; open: cubic in-out from 24 % (overlapping by 6 %)',
    roles: ['ink', 'paper', 'ground'],
    summary: 'One line draws down the frame and opens like a seam into curling marbled dye; the new frame is inside.',
    origin: [960, 540],
    frag: SPLIT,
    uniforms: ({ origin, width = 6 }) => ({ uX0: origin[0], uSmax: Math.max(origin[0], 1920 - origin[0]) + 360, uW: width }),
  },
];

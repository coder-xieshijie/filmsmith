// whiteout-slam.js — whiteout-slam: the film's one peak. The outgoing frame is exposed up to white over the first half
// while the camera leans into the locked answer (origin); two frames of white; then the incoming frame lands with blur,
// scale and a small channel offset that all decay to zero, while its ground falls back from white. One per film, on
// the sound's high point. Theory: references/transitions.md#whiteout-slam.

const SLAM = `
uniform float uWhiteAt;   // p of the hit (end of the build)
uniform float uWhite;     // length of the white frames (fraction of p)
uniform float uShock;     // length of the shock decay (fraction of p)
uniform float uFade;      // length of the ground's fall from white (fraction of p)
uniform float uBlurPx, uShift, uZoom;

// golden-angle disc taps (radius 1)
vec2 tap(float k) { float r = sqrt((k + 0.5) / 16.0), a = k * 2.39996; return r * vec2(cos(a), sin(a)); }

vec3 transition(vec2 s, float p) {
  vec2 C = vec2(960.0, 540.0);
  if (p < uWhiteAt) {
    float u = p / uWhiteAt;
    float push = 1.0 + 0.14 * u * u;
    vec2 at = uOrigin + (C - uOrigin) * 0.3 * u * u;     // the leaned-into point moves a little toward the centre
    vec3 a = A(uOrigin + (s - at) / push);
    return mix(a, uPaper, pow(u, 2.2) * 0.94);
  }
  float q = sat((p - uWhiteAt) / uShock), d = pow(1.0 - q, 2.2);
  float g = easeOutExpo(sat((p - uWhiteAt - uWhite) / uFade));
  vec2 x = uOrigin + (s - uOrigin) / (1.0 + uZoom * d);
  vec3 c;
  if (d < 0.002) c = B(x);
  else {
    float off = uShift * d, r = uBlurPx * d;
    c = vec3(0.0);
    for (int k = 0; k < 16; k++) {
      vec2 o = tap(float(k)) * r;
      c += vec3(B(x + o - vec2(off, 0.0)).r, B(x + o).g, B(x + o + vec2(off, 0.0)).b);
    }
    c /= 16.0;
  }
  // the ground (B's ground colour) shows white during the white frames and falls back; content stays itself
  float m = sat(length(c - uGround) * 4.0);
  return c + (mix(uPaper, uGround, g) - uGround) * (1.0 - m);
}`;

export default [
  {
    name: 'whiteout-slam',
    mode: 'pulse, ink, halftone',
    tier: 'T3',
    beats: 2,
    ease: 'build: exposure u^2.2 to 94 % white, lean 1 + 0.14 u²; 2 white frames; shock (1 − q)^2.2 over 0.45 s; ground expo out over 0.28 s',
    roles: ['paper', 'ground'],
    summary: 'The frame is exposed up to white, two white frames cut, and the answer lands with blur, scale and colour offset decaying to zero.',
    origin: [960, 540],
    frag: SLAM,
    // origin: the locked answer (where the camera leans and the new answer scales from); dur: seconds the slam lasts
    uniforms: ({ dur = 1, fps = 30, blur = 26, shift = 22, zoom = 0.16 }) => ({
      uWhiteAt: 0.5, uWhite: 2 / fps / dur, uShock: 0.45 / dur, uFade: 0.28 / dur, uBlurPx: blur, uShift: shift, uZoom: zoom,
    }),
  },
];

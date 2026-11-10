// glsl.js — the GLSL ES 1.00 shared by every transition: uniforms, sampling of the two frames, noise.
//
// Coordinates: every transition works in film pixels `s` (1920 × 1080, y down), whatever the canvas size;
// uScale = canvas px per film px. A(s) and B(s) sample the outgoing and incoming frames at film pixel s.
// The frames are uploaded with UNPACK_FLIP_Y, so at the pixel's own centre A(s) returns the source texel
// exactly (same size) — that is what makes p = 0 and p = 1 pixel-exact (see test/selftest.html).

export const HEAD = `
precision highp float;
uniform sampler2D uFrom, uTo;
uniform vec2 uRes;
uniform float uScale;
uniform float uP;
uniform float uSeed;
uniform vec2 uOrigin;
uniform vec3 uInk, uAccent, uGround, uPaper;

vec3 A(vec2 s) { return texture2D(uFrom, vec2(s.x * uScale, uRes.y - s.y * uScale) / uRes).rgb; }
vec3 B(vec2 s) { return texture2D(uTo, vec2(s.x * uScale, uRes.y - s.y * uScale) / uRes).rgb; }

// coverage of a signed distance d (film px, > 0 inside) with a one-output-pixel antialiased edge
float cover(float d) { return clamp(d * uScale + 0.5, 0.0, 1.0); }
float cover(float d, float g) { return clamp(d * uScale / max(g, 1e-3) + 0.5, 0.0, 1.0); }

float sat(float x) { return clamp(x, 0.0, 1.0); }
float lin(float a, float b, float x) { return clamp((x - a) / (b - a), 0.0, 1.0); }
float easeInOutCubic(float x) { x = sat(x); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
float easeOutCubic(float x) { x = sat(x); return 1.0 - pow(1.0 - x, 3.0); }
float easeInCubic(float x) { x = sat(x); return x * x * x; }
float easeOutExpo(float x) { x = sat(x); return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x); }
float easeInOutExpo(float x) {
  x = sat(x);
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;
  return x < 0.5 ? pow(2.0, 20.0 * x - 10.0) / 2.0 : (2.0 - pow(2.0, -20.0 * x + 10.0)) / 2.0;
}
float easeInOutQuint(float x) { x = sat(x); return x < 0.5 ? 16.0 * x * x * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 5.0) / 2.0; }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// Hash without sine (Hoskins): the same value on every GPU and on SwiftShader.
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec2 seedOff() { return vec2(17.31, 41.77) * fract(uSeed * 0.1031) * 37.0 + vec2(uSeed * 1.37, uSeed * 2.11); }

// Value noise in [-1, 1] with its analytic gradient (Quilez), quintic fade.
vec3 noised(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash12(i), b = hash12(i + vec2(1.0, 0.0)), c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
  float k1 = b - a, k2 = c - a, k3 = a - b - c + d;
  return vec3(-1.0 + 2.0 * (a + k1 * u.x + k2 * u.y + k3 * u.x * u.y), 2.0 * du * vec2(k1 + k3 * u.y, k2 + k3 * u.x));
}
float vnoise(vec2 x) { return noised(x).x; }
const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);
float fbm(vec2 x) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(x); x = ROT * x * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
float fbm2(vec2 x) { return 0.66 * vnoise(x) + 0.33 * vnoise(ROT * x * 2.07 + vec2(4.1, 2.3)); }
// Curl of a two-octave stream function: a divergence-free velocity (Bridson et al. 2007), |v| about 1..3.
vec2 curl2(vec2 x) {
  vec2 g = noised(x).yz + 1.05 * (noised(ROT * x * 2.1 + vec2(3.3, 7.1)).yz * ROT);   // chain rule: ROT^T grad
  return vec2(g.y, -g.x);
}
`;

export const MAIN = `
void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec3 c;
  if (uP <= 0.0) c = A(s);
  else if (uP >= 1.0) c = B(s);
  else c = transition(s, uP);
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

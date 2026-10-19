// whip-push.js — whip-push: the new card pushes the old one off; the two cards are one strip [A | B] sliding by the
// frame. While the strip is fast, each pixel averages the strip over the shutter (the offsets of the last uBlur of p),
// so the blur is the real motion streak and vanishes as the strip lands (p = 1 is B pixel for pixel).
// Theory: references/transitions.md#whip-push.

const WHIP = `
uniform float uBlur;      // shutter as a fraction of p (shutter / fps / duration)
uniform float uDir;       // 0 the old card leaves left, 1 right, 2 up, 3 down

float offAt(float p) { return easeInOutQuint(p); }   // most of the travel in the middle two frames
vec3 strip(vec2 s, float o) {
  if (uDir < 0.5) { float u = s.x + o * 1920.0; return u < 1920.0 ? A(vec2(u, s.y)) : B(vec2(u - 1920.0, s.y)); }
  if (uDir < 1.5) { float u = s.x - o * 1920.0; return u >= 0.0 ? A(vec2(u, s.y)) : B(vec2(u + 1920.0, s.y)); }
  if (uDir < 2.5) { float v = s.y + o * 1080.0; return v < 1080.0 ? A(vec2(s.x, v)) : B(vec2(s.x, v - 1080.0)); }
  float v = s.y - o * 1080.0; return v >= 0.0 ? A(vec2(s.x, v)) : B(vec2(s.x, v + 1080.0));
}
vec3 transition(vec2 s, float p) {
  float o1 = offAt(p), o0 = offAt(max(p - uBlur, 0.0));
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 64; i++) {
    float f = (float(i) + 0.5) / 64.0;
    acc += strip(s, mix(o0, o1, f));
  }
  return acc / 64.0;
}`;

const DIRS = { left: 0, right: 1, up: 2, down: 3 };

export default [
  {
    name: 'whip-push',
    mode: 'halftone, pulse, phosphor',
    tier: 'T1',
    beats: 0.3,
    ease: 'quint in-out over 0.15 s, starting 0.15 s before the beat and landing on it; 64-tap shutter of 0.75 frame',
    roles: [],
    summary: 'The new card pushes the old one off with a strong motion streak along the push that is gone on landing.',
    frag: WHIP,
    // blur: the shutter in units of p (0.75 frame at 30 fps over 0.15 s); pass dur (s) and fps instead to derive it
    uniforms: ({ blur, dur = 0.15, fps = 30, direction = 'left' }) => ({ uBlur: blur ?? 0.75 / fps / dur, uDir: DIRS[direction] ?? 0 }),
  },
];

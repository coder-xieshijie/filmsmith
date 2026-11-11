// blueprint.js — blueprint-expose: a print machine's lamp crosses the sheet; behind it the new drawing develops,
// first as line work in the line colour on the paper blue, then in its full colours. Theory:
// references/transitions.md#blueprint-expose.

const EXPOSE = `
uniform float uDev;    // length of the developing zone behind the lamp (film px)
uniform float uNoDev;  // 1: no developing zone, the new drawing at once
uniform float uHair;   // 1: a 2 px lamp line, no glow
uniform float uDir;    // 0 right, 1 left, 2 down, 3 up
uniform float uLen;    // frame length along the travel (1920 or 1080)

vec3 transition(vec2 s, float p) {
  // the lamp: a constant feed, eased only at the two ends
  float e = mix(p, easeInOutCubic(p), 0.45);
  float X = mix(-210.0, uLen + uDev + 210.0, e);     // lamp and glow wholly outside at both ends
  float a = uDir < 0.5 ? s.x : uDir < 1.5 ? 1920.0 - s.x : uDir < 2.5 ? s.y : 1080.0 - s.y;
  float dx = X - a;                               // > 0: the lamp has passed this pixel
  vec3 b = B(s);
  if (uNoDev > 0.5) {
    vec3 c0 = mix(A(s), b, cover(dx));
    if (uHair > 0.5) return mix(c0, uPaper, cover(1.0 - abs(dx)));
    float g0 = (exp(-dx * dx / 90.0) + 0.3 * exp(-abs(dx) / 46.0)) * (1.0 - smoothstep(120.0, 200.0, abs(dx)));
    return mix(c0, uPaper, clamp(g0, 0.0, 0.92));
  }
  // developing: line work first (the drawing's light parts in the line colour on the ground), then full colour
  float l = luma(b);
  vec3 duo = mix(uGround, uInk, smoothstep(0.16, 0.62, l));
  float dev = smoothstep(0.0, 1.0, (dx - 24.0) / uDev);
  vec3 col = mix(A(s), mix(duo, b, dev), cover(dx));
  if (uHair > 0.5) return mix(col, uPaper, cover(1.0 - abs(dx)));
  // the lamp: a narrow bright line with a short glow, cut off within 200 px
  float g = (exp(-dx * dx / 90.0) + 0.3 * exp(-abs(dx) / 46.0)) * (1.0 - smoothstep(120.0, 200.0, abs(dx)));
  return mix(col, uPaper, clamp(g, 0.0, 0.92));
}`;

export default [
  {
    name: 'blueprint-expose',
    mode: 'blueprint',
    tier: 'T2',
    beats: 2,
    ease: 'lamp: 55 % linear + 45 % cubic in-out (a machine feed); development smoothstep over 280 px behind it',
    roles: ['ground', 'ink', 'paper'],
    summary: 'A print lamp crosses the sheet; the new drawing develops behind it, line work first, then full colour.',
    frag: EXPOSE,
    uniforms: ({ develop = 280, lamp = 'glow', direction = 'right' }) => ({
      uDev: develop === false ? 0 : develop, uNoDev: develop === false ? 1 : 0, uHair: lamp === 'hairline' ? 1 : 0,
      uDir: { right: 0, left: 1, down: 2, up: 3 }[direction] ?? 0, uLen: direction === 'down' || direction === 'up' ? 1080 : 1920,
    }),
  },
];

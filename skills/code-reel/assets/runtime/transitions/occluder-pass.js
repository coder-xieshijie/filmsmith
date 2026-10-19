// occluder-pass.js — occluder-pass: a drafting straightedge, close to the lens and out of focus, sweeps across the
// frame; the change from the old frame to the new happens entirely under its opaque body (the boundary is its centre
// line), so the two frames are never seen over each other. The body is drawn from the palette (ground and line
// colour), with a bevel, a highlight and graduations along its working edge, defocused, and streaked over the shutter
// while it passes. Theory: references/transitions.md#occluder-pass.

const PASS = `
uniform float uTilt;     // from vertical (rad)
uniform float uW;        // body width (film px)
uniform float uBlur;     // defocus sigma (film px)
uniform float uReach;    // centre x at p = 0 is -uReach, at p = 1 is 1920 + uReach
uniform float uShutter;  // fraction of p

// the sweep ends at p = 0.94, so the shutter's last taps are off frame too and p = 1 is clean
float xcAt(float p) { float q = sat(p / 0.94); return mix(-uReach, 1920.0 + uReach, 0.8 * q + 0.2 * q * q * q * (q * (q * 6.0 - 15.0) + 10.0)); }
float soft(float d) { return smoothstep(-2.2 * uBlur, 2.2 * uBlur, d); }         // ≈ Gaussian edge of sigma uBlur
float bump(float v, float period) { float dv = abs(mod(v + 0.5 * period, period) - 0.5 * period); return exp(-dv * dv / (2.0 * uBlur * uBlur)); }

// the straightedge at centre xc: rgb and coverage
vec4 body(vec2 s, float xc) {
  float t = tan(uTilt), c = cos(uTilt);
  float q = (s.x - (xc + (540.0 - s.y) * t)) * c;           // across the bar, 0 on its centre line
  float xl = q + 0.5 * uW;                                   // 0 at its left edge, uW at its right
  float v = s.y / c;                                         // along the bar
  float cov = soft(xl) * soft(uW - xl);
  if (cov <= 0.0) return vec4(0.0);
  vec3 colBody = mix(uGround, uInk, 0.23), colBevel = mix(uGround, uInk, 0.45), colFar = mix(uGround, uInk, 0.12);
  vec3 col = mix(colBevel, colBody, soft(xl - 70.0));
  col = mix(col, uInk, soft(xl - 70.0) * soft(78.0 - xl));               // bevel highlight
  col = mix(col, colFar, soft(xl - (uW - 26.0)));                         // shadowed far edge
  // graduations (3 px every 12 px, longer every 5th and 10th), seen through the defocus
  float e = uW - 26.0;
  float g = 0.25 * soft(xl - (e - 26.0)) * soft(e - xl);                  // the short ticks blur into a 25 % band
  g += (3.0 / (2.5066 * uBlur)) * bump(v, 60.0) * soft(xl - (e - 46.0)) * soft((e - 26.0) - xl);
  g += (3.0 / (2.5066 * uBlur)) * bump(v, 120.0) * soft(xl - (e - 70.0)) * soft((e - 46.0) - xl);
  col = mix(col, uGround, clamp(g, 0.0, 1.0));
  return vec4(col, cov);
}

vec3 transition(vec2 s, float p) {
  vec3 acc = vec3(0.0);
  for (int k = 0; k < 16; k++) {
    float pk = p - uShutter * (float(k) + 0.5) / 16.0;
    float xc = xcAt(pk);
    float line = xc + (540.0 - s.y) * tan(uTilt);
    vec3 under = s.x < line ? B(s) : A(s);                   // behind the body's centre line the new frame
    vec4 b = body(s, xc);
    acc += mix(under, b.rgb, b.a);
  }
  return acc / 16.0;
}`;

export default [
  {
    name: 'occluder-pass',
    mode: 'blueprint, morph',
    tier: 'T1',
    beats: 1,
    ease: 'near-constant speed (80 % linear + 20 % smootherstep), off frame to off frame by p = 0.94; 16-tap shutter of 0.5 frame',
    roles: ['ground', 'ink'],
    summary: 'A defocused straightedge sweeps past the lens; the old frame becomes the new one entirely under its body.',
    frag: PASS,
    uniforms: ({ tilt = 10, width = 460, defocus = 9, dur = 0.5, fps = 30 }) => {
      const t = (tilt * Math.PI) / 180;
      return { uTilt: t, uW: width, uBlur: defocus, uReach: width / 2 + 3 * defocus + 540 * Math.tan(t) + 10, uShutter: 0.5 / fps / dur };
    },
  },
];

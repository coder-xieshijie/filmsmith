// shape-flood.js — shape-flood: the subject's own outline (hexagon, circle or rounded rectangle) grows exponentially
// from its centre; inside it is the incoming frame, which must be the same geometry drawn in another material,
// registered pixel for pixel, so the cut reads as one object changing material. Hard antialiased edge; while the edge
// moves fast it gets a few px of radial motion blur (the coverage is averaged over the radii swept in half a frame).
// Theory: references/transitions.md#shape-flood.

const FLOOD = `
uniform float uShape;     // 0 circle, 1 rounded rectangle, 2 hexagon (flats top and bottom)
uniform float uR;         // size now: circumradius (hexagon), radius (circle), half-height (rectangle), film px
uniform float uRprev;     // size half a frame earlier (motion blur span)
uniform float uAspect;    // rectangle half-width / half-height
uniform float uCorner;    // rectangle corner radius as a fraction of the half-height

// signed distance, < 0 inside
float sdShape(vec2 q, float R) {
  if (uShape < 0.5) return length(q) - R;
  if (uShape < 1.5) {
    float cr = uCorner * R;
    vec2 b = vec2(R * uAspect, R) - cr;
    vec2 d = abs(q) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - cr;
  }
  // regular hexagon with inradius r = R cos 30 (Quilez sdHexagon, flats at y = ±r)
  float r = R * 0.8660254;
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  vec2 p = abs(q);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

vec3 transition(vec2 s, float p) {
  vec2 q = s - uOrigin;
  float m = 0.0;
  if (uR - uRprev < 1.0) {
    m = cover(-sdShape(q, uR));
  } else {
    for (int i = 0; i < 6; i++) m += cover(-sdShape(q, mix(uRprev, uR, (float(i) + 0.5) / 6.0)));
    m /= 6.0;
  }
  if (m <= 0.0) return A(s);
  if (m >= 1.0) return B(s);
  return mix(A(s), B(s), m);
}`;

const SHAPES = { circle: 0, rect: 1, hexagon: 2 };

export default [
  {
    name: 'shape-flood',
    mode: 'blueprint, morph, ink',
    tier: 'T2',
    beats: 1,
    ease: 'size r0 · (r1 / r0)^(p / 0.92): exponential in time, covers the frame by p = 0.92; edge blur ≤ blurMax px while fast',
    roles: [],
    origin: [960, 540],
    summary: "The subject's own outline grows from its centre and floods the frame; inside it, the same geometry in the next material.",
    frag: FLOOD,
    uniforms: ({ origin, shape = 'hexagon', r0 = 3, aspect = 1.6, corner = 0.28, dur = 0.5, fps = 30, blurMax = 14 }, p) => {
      const sh = SHAPES[shape] ?? 2;
      const [ox, oy] = origin;
      const dx = Math.max(ox, 1920 - ox), dy = Math.max(oy, 1080 - oy);
      // smallest size whose shape contains the farthest corner, plus a margin for the blur
      const cover = sh === 0 ? Math.hypot(dx, dy)
        : sh === 2 ? Math.max(dy / 0.8660254, (dx + dy / Math.sqrt(3)) * 1.0)   // flats at ±r, slanted sides
        : Math.max(dy, dx / aspect) + corner * Math.max(dy, dx / aspect);
      const r1 = cover + 2 * blurMax + 8;
      const size = (x) => r0 * Math.pow(r1 / r0, Math.min(1, Math.max(0, x) / 0.92));
      const R = size(p), Rp = size(p - 0.5 / fps / dur);   // half a frame earlier (shutter 0.5)
      return { uShape: sh, uR: R, uRprev: Math.max(Rp, R - blurMax), uAspect: aspect, uCorner: corner };
    },
  },
];

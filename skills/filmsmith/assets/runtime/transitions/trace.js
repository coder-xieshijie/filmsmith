// trace.js — trace-flow: the boundary between the two frames is a line carried by a steady vector field, so it
// arrives as a curve shaped by the flow; content near the boundary is dragged along the streamlines, and the
// streamlines themselves light up (in the `ink` role, not the accent) where the front passes. Theory: references/transitions.md#trace-flow.

const FLOW = `
uniform float uScaleF;   // eddy size (film px)
uniform float uStep;     // advection per step (film px)
uniform float uMargin;   // the front starts and ends this far outside the frame

vec2 field(vec2 x) { return curl2(x / uScaleF + seedOff()); }
float stream(vec2 x) { vec2 y = x / uScaleF + seedOff(); return vnoise(y) + 0.5 * vnoise(ROT * y * 2.1 + vec2(3.3, 7.1)); }

vec3 transition(vec2 s, float p) {
  // where this point was before the flow carried it (backward advection through a steady field)
  vec2 q = s;
  for (int i = 0; i < 8; i++) q -= uStep * field(q);
  vec2 D = q - s;
  float X = mix(-uMargin, 1920.0 + uMargin, easeInOutCubic(p));
  float phi = q.x - X;                                  // > 0: ahead of the front (old frame)
  float w = 1.0 - smoothstep(0.0, 240.0, abs(phi));
  w *= w;
  vec2 sa = s + D * w * 0.5;                            // content near the front is dragged along the flow
  vec3 col = mix(B(sa), A(sa), cover(phi, 1.4));
  // streamlines: contours of the stream function, drawn only near the front, thinning to nothing away from it
  float sf = stream(s) * 5.0;
  float fr = fract(sf);
  float dl = min(fr, 1.0 - fr);
  float e = 1.5;
  float gs = length(vec2(stream(s + vec2(e, 0.0)) * 5.0 - sf, stream(s + vec2(0.0, e)) * 5.0 - sf)) / e;
  float lw = 1.2 * smoothstep(0.35, 1.0, w) * step(0.0, phi);    // only ahead of the front, where it is about to pass
  col = mix(col, uInk, cover(lw - dl / max(gs, 1e-3)) * step(0.02, lw));
  // the front itself: a 2.5 px line
  return mix(col, uInk, cover(1.25 - abs(phi) / 1.4));
}`;

const DEFS = [
  {
    name: 'trace-flow',
    mode: 'trace',
    tier: 'T2',
    beats: 2,
    ease: 'front cubic in-out across the frame; content drag and streamlines weighted by distance to the front',
    roles: ['ink'],
    summary: 'A front carried by a vector field sweeps across; content is dragged along the streamlines it lights up.',
    frag: FLOW,
    // margin: drag ≤ 8 × 15 × |curl| ≈ 300 px, plus the 240 px drag radius
    uniforms: ({ eddy = 520 }) => ({ uScaleF: eddy, uStep: 15, uMargin: 580 }),
  },
];

// token-sweep: the cells of the token bar at the foot of the frame grow, cell by cell, into vertical bars that
// sweep up over the old frame; then they fall back, left to right, uncovering the new one, and sink into the foot.
// Hard edges, heights snapped to whole cells (a counter, not a tween).
const SWEEP = `
uniform float uCell;     // cell size (film px)
uniform float uStag;     // stagger across all columns, per phase (fraction of p)

vec3 transition(vec2 s, float p) {
  float n = ceil(1920.0 / uCell);
  float k = floor(s.x / uCell);
  float st = uStag * k / max(n - 1.0, 1.0);
  float up = easeInOutCubic(lin(st, st + 0.5 - uStag, p));          // phase 1: the bar rises over the old frame
  float dn = easeInOutCubic(lin(0.5 + st, 1.0 - uStag + st, p));     // phase 2: it falls back over the new one
  float h = 1080.0 * (up - dn);
  h = ceil(h / uCell - 1e-4) * uCell;                                 // whole cells
  float top = 1080.0 - h;
  vec3 under = dn > 0.0 ? B(s) : A(s);
  float lx = s.x - k * uCell;
  float gap = cover(min(lx, uCell - lx) - 1.0);                       // a 2 px ground gap between the bars
  vec3 bar = mix(uGround, uInk, gap);
  return mix(under, bar, cover(s.y - top) * step(0.5, h));
}`;

DEFS.push({
  name: 'token-sweep',
  mode: 'trace',
  tier: 'T2',
  beats: 2,
  ease: 'two phases of 50 %: bars rise, then fall, each cubic in-out, columns 30 % apart in each phase; heights in whole cells',
  roles: ['ink', 'ground'],
  summary: 'The token bar’s cells grow into bars that sweep over the frame, then fall back to uncover the new one.',
  frag: SWEEP,
  uniforms: ({ cell = 40 }) => ({ uCell: cell, uStag: 0.3 }),
});

export default DEFS;

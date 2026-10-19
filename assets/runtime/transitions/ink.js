// ink.js — ink-wash (ink wicking through absorbent paper) and ink-drop (a drop blooming in water).
// Theory and parameters: references/transitions.md#ink-wash, #ink-drop.

// ---------------------------------------------------------------------------------------------------------------
// ink-wash: brush touches set ink on absorbent paper; the ink wicks outward through the fibres. Each touch's front
// follows the Lucas–Washburn law (distance ∝ √time, so it starts fast and slows), the paper's uneven absorbency warps
// it, fibres pull feathers ahead of it, and where fronts meet they merge. Pigment piles up at the moving edge (edge
// darkening: a dark rim), the wet band behind it is uneven (浓淡, granulation), and where the wash has settled the
// next frame shows. Every pixel is the old frame, ink (an opaque palette tone) or the new frame.
const WASH = `
uniform vec4 uS0, uS1, uS2, uS3;   // touches: x, y (film px), start (0..1 of p), reach (fraction of uRmax)
uniform float uRmax;               // reach of the first touch at p = 1: past every corner, so p = 1 is all new frame

// paper fibres: sparse thin strands in random local directions (the hairs the ink runs along)
float fibre(vec2 s) {
  vec2 o = seedOff();
  float a = 3.1416 * vnoise(s / 180.0 + o);
  vec2 d = vec2(cos(a), sin(a)), e = vec2(-d.y, d.x);
  float f = vnoise(vec2(dot(s, d) / 46.0, dot(s, e) / 3.2) + o * 1.7);
  float a2 = a + 1.3;
  vec2 d2 = vec2(cos(a2), sin(a2)), e2 = vec2(-d2.y, d2.x);
  float g = vnoise(vec2(dot(s, d2) / 34.0, dot(s, e2) / 2.6) + o * 0.3 + 11.0);
  return max(smoothstep(0.35, 0.8, f), smoothstep(0.4, 0.85, g));
}
float touch(vec4 S, vec2 w, float p) {          // signed distance to one touch's front, < 0 inside
  float u = max(p - S.z, 0.0) / (1.0 - S.z);
  float t0 = 0.03;
  // Lucas–Washburn (distance ∝ √t) with a finite start; exponent softened to 0.62 so the frame fills evenly
  float R = uRmax * S.w * (pow(u + t0, 0.62) - pow(t0, 0.62)) / (pow(1.0 + t0, 0.62) - pow(t0, 0.62));
  return length(w - S.xy) - R + 40.0 * (1.0 - smoothstep(0.0, 0.05, u));              // not there before it starts
}
float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }

vec3 transition(vec2 s, float p) {
  vec2 o = seedOff();
  // uneven absorbency: the front is a circle in a warped paper
  vec2 w = s + 150.0 * vec2(fbm(s / 520.0 + o), fbm(s / 520.0 + o + 5.2)) + 24.0 * vec2(fbm2(s / 80.0 + o + 9.0), fbm2(s / 80.0 + o + 2.7));
  float f = touch(uS0, w, p);
  f = smin(f, touch(uS1, w, p), 70.0);
  f = smin(f, touch(uS2, w, p), 70.0);
  f = smin(f, touch(uS3, w, p), 70.0);
  float wet = 1.0 - smoothstep(0.72, 0.97, p);
  float fb = fibre(s);
  // the halo (墨晕): pale ink wicked ahead of the front, furthest along the fibres
  float H = wet * (16.0 + 34.0 * (0.5 + 0.5 * fbm2(s / 120.0 + o + 6.0)));
  float halo = cover(H * (0.35 + 0.65 * fb) - f);
  float x = -f;                                   // depth behind the front, px
  // the wet body: dark, uneven (浓淡), a darker rim where pigment piles up at the edge, fine granulation
  float W = (70.0 + 80.0 * (0.5 + 0.5 * fbm2(s / 160.0 + o + 4.0))) * wet;
  float inner = W * (0.5 + 0.5 * (0.5 + 0.5 * fbm(s / 75.0 + o + 3.0)));
  // darkest where the ink was laid (toward the new frame), lighter toward the front, then a darker rim at the edge
  float rim = exp(-max(x, 0.0) / 3.0);
  float grad = smoothstep(0.0, 1.0, x / max(inner, 1.0));
  float dens = mix(0.42, 0.97, grad) + 0.14 * fbm(s / 120.0 + o + 7.0) * (1.0 - grad) + 0.035 * vnoise(s / 3.0 + o);
  dens = clamp(dens + 0.32 * rim, 0.0, 1.0);
  float hd = 0.16 + 0.22 * fb + 0.06 * vnoise(s / 4.0 + o + 2.0);    // the halo's pale ink
  // ink sinks into the paper: it can only darken what is printed there (lighten, when the ink is the light one)
  vec3 a = A(s);
  bool darker = luma(uInk) <= luma(uPaper);
  vec3 hc = mix(uPaper, uInk, hd), bc = mix(uPaper, uInk, dens);
  vec3 col = mix(a, darker ? min(a, hc) : max(a, hc), halo * step(0.001, wet));
  col = mix(col, darker ? min(a, bc) : max(a, bc), cover(x, 1.2));
  return mix(col, B(s), cover(x - inner, 1.2));
}`;

// ---------------------------------------------------------------------------------------------------------------
// ink-drop: a drop lands, then blooms like ink in water. The bloom is fluid advected by a velocity field, traced
// backward from each pixel (semi-Lagrangian, as in Stam's stable fluids): a radial source (the drop's volume
// spreading: the area grows linearly with time) plus a divergence-free curl-noise field whose eddies grow with the
// bloom (Bridson et al. 2007), so the edge folds and rolls into puffs. The first slug of fluid out of the drop is
// ink; what follows is the new frame. So a ring of ink rolls outward, the new frame opens inside it, and the ring
// leaves past the corners. The ink is lit from its own thickness, which is carried by the flow (streaks and folds).
const DROP = `
uniform float uR0;     // drop radius (film px)
uniform float uKQ;     // area the bloom gains per unit tau (px^2)
uniform float uTink;   // tau at which the ink slug ends (later fluid is the new frame)
uniform float uCurl;   // eddy strength, relative to the front's speed
uniform float uLand;   // p at which the drop has landed and the bloom starts

const int N = 20;
float gTau;
// x: signed distance-like value of the outer edge (< 0 inside the bloom), y: emission time of the fluid (-0.04..0:
// the drop itself, -0.5: water that never left the drop), zw: where the fluid left the drop (unit direction)
vec4 trace(vec2 s) {
  vec2 o = seedOff();
  vec2 q = s - uOrigin;
  float tau = gTau;
  float dt = tau / float(N);
  float t = tau;
  float r02 = uR0 * uR0;
  for (int k = 0; k < N; k++) {
    float R = sqrt(r02 + uKQ * t);
    float vr = uKQ / (2.0 * R);                      // speed of the bloom's edge, px per unit tau
    float L = 0.42 * R + 40.0;                       // eddies scale with the bloom
    float r = length(q);
    vec2 v = curl2(q / L + o + vec2(0.0, 1.3 * t)) * uCurl * vr;
    // eddies live round the bloom's rim, not deep inside it, and calm down as the bloom ends
    v *= smoothstep(0.3 * R, 0.75 * R, r) * (1.0 - smoothstep(1.2 * R, 1.7 * R, r)) * (1.0 - 0.6 * smoothstep(0.6, 1.0, t));
    q -= v * dt;
    // the radial source, in area: going back in time the area shrinks by KQ dt
    float a = max(dot(q, q), 1e-4);
    vec2 dir = q * inversesqrt(a);
    float lobe = 1.0 + 0.3 * fbm2(dir * 1.2 + o + 3.0);  // the drop spreads further along some directions
    float an = a - uKQ * lobe * dt;
    if (an < r02) {
      float te = t - (a - r02) / (uKQ * lobe);       // when this fluid left the drop
      return vec4(-(sqrt(r02 + uKQ * max(te, 0.0)) - uR0) - 0.5, max(te, 0.0), dir);
    }
    q *= sqrt(an / a);
    t -= dt;
  }
  float r = length(q);
  vec2 dir = q / max(r, 1e-3);
  if (r < uR0) return vec4(r - uR0, -0.04 * (1.0 - r * r / r02), dir);   // the drop itself
  return vec4(r - uR0, -0.5, dir);
}
// height of the ink at one sample: thick in the middle of the ring, puffs carried by the flow. The puffs are cells
// of turbulence (|noise|: round cells split by creases) in a disc whose radius is the fluid's age, so nothing
// converges to a point where the newest fluid leaves the drop.
float inkH(vec4 tr) {
  float u = clamp((tr.y + 0.04) / (uTink + 0.04), 0.0, 1.0);    // 0 at the bloom's edge, 1 where the new frame begins
  vec2 z = tr.zw * (gTau - max(tr.y, 0.0)) * 13.0 + seedOff();
  float turb = abs(vnoise(z)) + 0.5 * abs(vnoise(ROT * z * 2.2 + 3.1));
  float bump = sqrt(max(sin(3.1416 * clamp(u * 0.9 + 0.05, 0.0, 1.0)), 0.0));
  return bump * (0.55 + 0.9 * sqrt(turb)) * step(-0.45, tr.y);
}
vec3 transition(vec2 s, float p) {
  vec3 acc = uInk;
  vec3 deep = acc * acc / max(max(acc.r, acc.g), max(acc.b, 1e-3)) * 0.5;   // the ink deepened, never grey
  vec3 lite = mix(acc, vec3(1.0), 0.38);
  // landing: the drop appears and settles (a small overshoot on its size)
  if (p < uLand) {
    float land = p / uLand;
    float rd = uR0 * (1.0 + 0.15 * sin(3.1416 * land)) * sqrt(land);
    float d = rd - length(s - uOrigin);
    float sh = sat(1.0 - length(s - uOrigin - vec2(-0.3, -0.35) * rd) / max(rd, 1.0));
    return mix(A(s), mix(deep, lite, 0.25 + 0.75 * sh * sh), cover(d));
  }
  float x = (p - uLand) / (1.0 - uLand);
  // the bloom's radius follows an ease-out (fast after the impact, slowing as it grows); area = radius squared
  float E = 1.0 - pow(1.0 - x, 1.6);
  gTau = E * E;
  float e = 2.0;
  vec4 c0 = trace(s), cx = trace(s + vec2(e, 0.0)), cy = trace(s + vec2(0.0, e));
  float r02 = uR0 * uR0;
  // the new frame: fluid emitted after uTink; its edge in px (equivalent radius), antialiased by its own gradient
  float req = sqrt(r02 + uKQ * max(c0.y, 0.0)), rt = sqrt(r02 + uKQ * uTink);
  float gB = length(vec2(sqrt(r02 + uKQ * max(cx.y, 0.0)) - req, sqrt(r02 + uKQ * max(cy.y, 0.0)) - req)) / e;
  // masks averaged over the three samples (2 px apart): folds thinner than a pixel read as a soft edge, not stripes
  float inB = (cover(req - rt, max(gB, 0.3)) + cover(sqrt(r02 + uKQ * max(cx.y, 0.0)) - rt, max(gB, 0.3)) + cover(sqrt(r02 + uKQ * max(cy.y, 0.0)) - rt, max(gB, 0.3))) / 3.0;
  // and a core that grows behind the ring's inner edge, so no stray ink or water is left inside (settles clean)
  float Rin = sqrt(max(uKQ * (gTau - uTink), 0.0));
  float core = Rin * mix(0.78, 1.0, smoothstep(0.4, 0.8, x)) - 60.0 + 70.0 * fbm2((s - uOrigin) / 260.0 + seedOff() + 9.0) - length(s - uOrigin);
  inB = max(inB, cover(core));
  float gO = length(vec2(cx.x - c0.x, cy.x - c0.x)) / e;
  float inInk = (cover(-c0.x, max(gO, 0.3)) + cover(-cx.x, max(gO, 0.3)) + cover(-cy.x, max(gO, 0.3))) / 3.0;
  // ink, lit from its own height
  float h0 = inkH(c0), hx = inkH(cx), hy = inkH(cy);
  vec2 g = vec2(hx - h0, hy - h0) / e * 60.0;
  vec3 n = normalize(vec3(-g, 1.0));
  vec3 L = normalize(vec3(-0.35, -0.75, 0.6));
  float dif = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0) - (L.z * 0.5 + 0.5);
  float sheen = pow(1.0 - n.z, 1.4);
  float v = (dif * 2.4 + 0.45 * sheen + 0.35 * (h0 - 0.8)) * 1.5;
  float vs = v / (1.0 + abs(v));
  vec3 inkc = vs >= 0.0 ? mix(acc, lite, vs) : mix(acc, deep, -vs);
  vec3 col = mix(A(s), inkc, inInk);
  return mix(col, B(s), inB);
}`;


// ---------------------------------------------------------------------------------------------------------------
// dot-iris: the ink dot as the hand-off. open: the dot on the old frame swells into a hard-edged disc, a thin ink
// ring at its edge, the new frame inside, until it passes the corners. close: the old frame shrinks inside a disc
// that ends as the dot, on the new frame (whose own first frame has the dot there). No blend anywhere.
// contents 'ground-only': the incoming side shows only its ground colour (the subject spreads into the next ground;
// the next scene's content enters after); growth 'exp': the radius grows exponentially (dot · (Rmax / dot)^p).
const IRIS = `
uniform float uDot;     // the dot's radius (film px)
uniform float uRmax;    // radius that clears the farthest corner, ring included
uniform float uClose;   // 0: open (dot to frame), 1: close (frame to dot)
uniform float uGroundOnly;  // 1: the incoming side is its ground colour (uGround) only
uniform float uExpo;    // 1: exponential growth instead of cubic in-out
uniform float uRing;    // 1: the ink ring at the disc's edge, 0: none

vec3 transition(vec2 s, float p) {
  float d = length(s - uOrigin);
  float e = uClose > 0.5 ? 1.0 - easeInOutCubic(p) : easeInOutCubic(p);   // 0 = the dot, 1 = the whole frame
  float R = mix(uDot, uRmax, e);
  if (uExpo > 0.5) {
    R = uDot * pow(uRmax / uDot, uClose > 0.5 ? 1.0 - p : p);
    e = (R - uDot) / (uRmax - uDot);
  }
  // the ring: the whole dot at the small end, 10 px while it travels
  float w = mix(uDot, 10.0, smoothstep(0.0, 0.12, e)) * (1.0 - smoothstep(0.9, 1.0, e)) * uRing;
  vec3 incoming = uGroundOnly > 0.5 ? uGround : B(s);
  vec3 inside = uClose > 0.5 ? A(s) : incoming;
  vec3 outside = uClose > 0.5 ? incoming : A(s);
  vec3 col = mix(outside, uInk, cover(R - d));
  return mix(col, inside, cover(R - w - d));
}`;

const rnd = (seed, i) => {
  let x = (Math.imul((seed | 0) + 1, 0x9e3779b1) ^ Math.imul(i + 7, 0x85ebca6b)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};
const farthest = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(1920 - x, y), Math.hypot(x, 1080 - y), Math.hypot(1920 - x, 1080 - y));

export default [
  {
    name: 'ink-wash',
    mode: 'ink, thread',
    tier: 'T2',
    beats: 3,
    ease: 'front ∝ t^0.62 (Lucas–Washburn √t, softened; decelerating); halo and wet band dry over 72–97 %',
    roles: ['ink', 'paper'],
    summary: 'Ink wicks through absorbent paper from a few brush touches; dark rims, uneven wash, the new frame where it settles.',
    origin: [700, 470],
    frag: WASH,
    uniforms: ({ seed, origin }) => {
      const t = [origin];
      for (let i = 1; i < 4; i++) t.push([240 + rnd(seed, i * 3) * 1440, 160 + rnd(seed, i * 3 + 1) * 760]);
      return {
        uS0: [origin[0], origin[1], 0, 1],
        uS1: [t[1][0], t[1][1], 0.1, 0.42],
        uS2: [t[2][0], t[2][1], 0.18, 0.36],
        uS3: [t[3][0], t[3][1], 0.26, 0.3],
        uRmax: farthest(origin) + 270,   // warp ≤ 150 + 24 px per axis, so this passes every corner
      };
    },
  },
  {
    name: 'ink-drop',
    mode: 'ink',
    tier: 'T2',
    beats: 3,
    ease: 'landing 10 % (size overshoot 15 %); then the bloom radius follows 1 − (1 − x)^1.6 (fast after impact, slowing)',
    roles: ['ink'],
    summary: 'A drop lands and blooms like ink in water; a rolling ring of ink opens the new frame inside it.',
    origin: [960, 540],
    frag: DROP,
    uniforms: ({ origin, body = 0.16, curl = 0.75, radius = 30 }) => {
      // the new frame's edge (fluid emitted at uTink) must pass the farthest corner by p = 1, with room for eddies
      const need = farthest(origin) + 320;   // lobes vary the spread by ±30 %, the core below covers what they leave
      return { uR0: radius, uKQ: (need * need) / (1 - body), uTink: body, uCurl: curl, uLand: 0.1 };
    },
  },
  {
    name: 'dot-iris',
    mode: 'ink',
    tier: 'T1',
    beats: 1,
    ease: 'cubic in-out; ring = the whole dot at the small end, 10 px in between',
    roles: ['ink'],
    summary: 'The dot swells into a hard-edged disc that opens on the new frame (or the frame closes down to the dot).',
    origin: [960, 540],
    frag: IRIS,
    // origin: the dot, or the previous shot's subject; contents 'ground-only' needs colors.ground (the next scene's ground)
    uniforms: ({ origin, dot = 20, direction = 'open', contents = 'frame', growth = 'cubic', ring = true }) => ({
      uDot: dot, uRmax: farthest(origin) + 20, uClose: direction === 'close' ? 1 : 0,
      uGroundOnly: contents === 'ground-only' ? 1 : 0, uExpo: growth === 'exp' ? 1 : 0, uRing: ring ? 1 : 0,
    }),
  },
];

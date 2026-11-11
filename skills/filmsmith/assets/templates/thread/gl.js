// gl.js — the two volume shots of thread, drawn by WebGL as pure functions of their parameters.
//
//   blob(p)  three glossy spheres on a flat field that merge through a viscous neck (smooth-min of rounded
//            boxes, ray-marched with an orthographic camera tilted down 12°): key light whose dark side is
//            the line colour deepened (never the field's blue or a grey), one softbox highlight, a rim in the
//            line colour, a faint floor bounce, soft contact shadow, a small decaying tremor after each
//            contact. The same primitive squashes into a 6 px rod, so the hand-off to the 2D line is exact.
//   ink(p)   a vertical line dissolving into two marbled dyes curling outward (domain-warped fbm, lit from
//            its own density gradient, with filaments), centre kept darker for the words laid over it.
//
// Both write into one offscreen canvas; the film draws it into the 2D frame with drawImage, so tiles,
// thumbnails and the main frame share one code path. GLSL ES 1.00 so WebGL1 and WebGL2 both work.
// No state carries between calls: every uniform is set on every call.

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const BLOB = `
precision highp float;
uniform vec2 uRes;
uniform vec4 uC0, uC1, uC2;   // centres (world px), w = 1 if active
uniform vec4 uB0, uB1, uB2;   // half extents xyz, w = rounding radius
uniform float uK1, uK2;       // smooth-min radius (px): sphere 1 joining 0, sphere 2 joining both
uniform float uWob, uPh;      // surface tremor amplitude (px) and phase (merge time)
uniform float uBox;           // 0 = ellipsoids, 1 = rounded boxes (the rod)
uniform float uFlat;          // 0 = lit volume, 1 = flat line colour
uniform float uPitch;         // camera tilt (radians)
uniform vec3 uField, uShade, uLine, uDeep; // sRGB 0..1; uDeep = the line colour's dark side
uniform float uScale;         // output pixels per film pixel

float sdRB(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}
float sdEll(vec3 p, vec3 r) {
  float k0 = length(p / r), k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}
float prim(vec3 p, vec4 b) {
  if (uBox <= 0.0) return sdEll(p, b.xyz);
  if (uBox >= 1.0) return sdRB(p, b.xyz, b.w);
  return mix(sdEll(p, b.xyz), sdRB(p, b.xyz, b.w), uBox);
}
float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
float map(vec3 p) {
  float d = prim(p - uC0.xyz, uB0);
  if (uC1.w > 0.5) d = smin(d, prim(p - uC1.xyz, uB1), uK1);
  if (uC2.w > 0.5) d = smin(d, prim(p - uC2.xyz, uB2), uK2);
  if (uWob > 0.0) d -= uWob * sin(p.x * 0.035 + uPh * 9.0) * sin(p.y * 0.041 - uPh * 7.0) * sin(p.z * 0.029 + uPh * 5.0);
  return d;
}
vec3 normalAt(vec3 p) {
  // a 1 px tetrahedron, and an epsilon on the length: where three smooth-min surfaces meet the gradient can
  // vanish, and normalising it gave a one-frame bright spot
  const vec2 e = vec2(1.0, -1.0);
  vec3 g = e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx);
  return g / max(length(g), 1e-3);
}
float aoAt(vec3 p, vec3 n, float s) {
  float o = 0.0, w = 1.0;
  for (int i = 1; i <= 5; i++) {
    float h = s * float(i) / 5.0;
    o += w * (h - map(p + n * h));
    w *= 0.6;
  }
  return clamp(1.0 - 1.6 * o / s, 0.0, 1.0);
}
float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0, t = 1.5;
  for (int i = 0; i < 56; i++) {
    float h = map(ro + rd * t);
    res = min(res, 7.0 * h / t);
    t += clamp(h, 1.5, 60.0);
    if (res < 0.001 || t > 1400.0) break;
  }
  return clamp(res, 0.0, 1.0);
}
vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

vec3 shadePixel(vec2 s) {
  float sp = sin(uPitch), cp = cos(uPitch);
  vec3 dir = vec3(0.0, -sp, cp), up = vec3(0.0, cp, sp);
  vec3 ro = vec3(s.x - 960.0, 0.0, 0.0) + up * (540.0 - s.y) - dir * 4000.0;
  float tFloor = -ro.y / dir.y;
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 160; i++) {
    float d = map(ro + dir * t);
    if (d < 0.05) { hit = true; break; }
    t += d;
    if (t > tFloor) break;
  }
  if (!hit || t > tFloor) {
    // floor: exact field colour where lit, deeper field under the contact shadow
    vec3 pf = ro + dir * tFloor;
    vec3 Ls = normalize(vec3(-0.18, 1.0, -0.12));
    float sh = softShadow(pf + vec3(0.0, 0.5, 0.0), Ls);
    float dist = map(pf);
    float ao = smoothstep(0.0, 70.0, dist);
    float lit = mix(1.0, min(sh * 0.65 + 0.35, 1.0) * mix(0.55, 1.0, ao), 1.0 - uFlat);
    lit = min(lit, mix(1.0, sh, 0.85 * (1.0 - uFlat)));
    return mix(uShade, uField, lit);
  }
  vec3 p = ro + dir * t;
  vec3 n = normalAt(p);
  vec3 v = -dir;
  vec3 base = toLin(uLine), deep = toLin(uDeep);
  vec3 Lk = normalize(vec3(-0.55, 0.78, -0.48));
  float occ = aoAt(p, n, 60.0);
  float dif = clamp(dot(n, Lk) * 0.5 + 0.5, 0.0, 1.0);
  dif = dif * dif;
  // the shadow side is the line colour deepened, a saturated dark red for vermilion, not lit by the field
  vec3 col = mix(deep, base * 1.12, dif) * mix(0.55, 1.0, occ);
  // a faint bounce off the field onto the underside
  col += toLin(uField) * base.r * 0.03 * clamp(-n.y * 0.8 + 0.2, 0.0, 1.0) * occ;
  // one highlight: the softbox window reflection
  vec3 r = reflect(-v, n);
  vec3 S = normalize(vec3(-0.10, 0.92, -0.40));
  float sb = smoothstep(0.90, 0.93, dot(r, S)) * smoothstep(-0.2, 0.3, r.y);
  col += vec3(0.9, 0.85, 0.85) * sb * 0.15;
  // rim light from behind, in the line colour (no grey environment fresnel)
  float fr = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
  vec3 Lr = normalize(vec3(0.75, 0.35, 0.55));
  col += base * fr * clamp(dot(n, Lr) * 0.6 + 0.4, 0.0, 1.0) * 0.25;
  col = col / (1.0 + col * 0.08);
  return mix(toSrgb(col), uLine, uFlat);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec3 acc = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 o = (vec2(float(i), float(j)) + 0.5) / 2.0 - 0.5;
    acc += shadePixel(frag + o / uScale);
  }
  gl_FragColor = vec4(acc / 4.0, 1.0);
}`;

const INK = `
precision highp float;
uniform vec2 uRes;
uniform float uT;      // plume growth: 0..1 across the first bar, easing to 1.15 in a longer shot
uniform float uZ;      // evolution time (equals uT during the first bar, keeps drifting after)
uniform float uSeed;
uniform float uScale;
uniform vec3 uGround, uDyeA, uDyeB; // sRGB 0..1; A is the neutral dye (left), B the line colour (right)
uniform float uDark;   // how much the centre third is held down for the words

vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float gnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)), dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                 mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
             mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                 mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * gnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return v;
}
float fbm3(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * gnoise(p); p = p * 2.07 + vec3(4.1, 2.3, 7.7); a *= 0.5; }
  return v;
}

// height (continuous), dye and fold shade of the plume at film-pixel position s; density = smoothstep of height
vec4 plume(vec2 s, float T, float Z) {
  float x = (s.x - 960.0) / 540.0, y = (s.y - 540.0) / 540.0;
  float S = 0.01 + 1.3 * pow(T, 1.6);                     // half-width, accelerating
  float z = uSeed + Z * 1.2;                               // slow evolution
  // coordinates that stretch outward with the plume, so curls unfold away from the line
  vec2 q = vec2(x / (0.42 + 0.55 * S), y * 1.25 - Z * 0.35);
  vec2 w1 = vec2(fbm3(vec3(q * 1.2, z)), fbm3(vec3(q * 1.2 + 5.2, z + 1.3)));
  vec2 p2 = q + 1.9 * w1;
  vec2 w2 = vec2(fbm3(vec3(p2 * 1.9 + 7.1, z * 1.3)), fbm3(vec3(p2 * 1.9 + 2.9, z * 1.3)));
  vec2 p3 = p2 + 0.8 * w2;
  // envelope: wider where the billows are, curling sideways
  float side = sign(x + 1e-4);
  float lobe = 0.75 + 0.7 * fbm3(vec3(y * 1.6 + side * 3.0, Z * 0.6 + side * 2.0, uSeed));
  float xw = abs(x + S * 0.7 * w1.y);
  float env = 1.0 - smoothstep(0.15, 1.0, xw / max(S * lobe, 1e-4));
  // puffs: thresholded turbulence gives cauliflower edges and holes inside
  float h = 2.2 * fbm(vec3(p3 * 2.6, z)) + mix(-0.9, 0.28, env);
  // thin dark core where the line was
  float core = exp(-pow((x + 0.05 * w1.y) / (0.008 + 0.06 * T), 2.0));
  h -= 0.9 * core * smoothstep(0.04, 0.2, T);
  h -= 1.0 - smoothstep(0.0, 0.08, T);
  // dye: neutral left, line colour right, marbled where they meet
  float dye = smoothstep(-0.25, 0.25, x / max(S, 0.03) * 1.0 + 1.4 * fbm3(vec3(p3 * 1.5 + 11.0, z)));
  float fold = fbm3(vec3(p3 * 6.0 + 3.0, z * 1.4));
  float outer = 1.0 - smoothstep(0.8, 1.5, xw / max(S * lobe, 1e-4));
  return vec4(h, dye, fold, outer);
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  float T = uT, Z = uZ;
  vec4 c = plume(s, T, Z);
  float e = 3.0;
  float hx = plume(s + vec2(e, 0.0), T, Z).x, hy = plume(s + vec2(0.0, e), T, Z).x;
  vec2 g = vec2(hx - c.x, hy - c.x) / e * 540.0;           // height gradient per unit
  vec3 n = normalize(vec3(-g * 0.035, 1.0));
  vec3 L = normalize(vec3(-0.6, -0.7, 0.45));               // light from the upper left (y down)
  float lit = clamp(0.5 + 0.75 * dot(n, L), 0.3, 1.25);
  float dens = smoothstep(-0.04, 0.3, c.x);
  float haze = 0.22 * smoothstep(-0.5, 0.0, c.x) * c.w;
  float thick = smoothstep(0.0, 0.9, c.x);
  vec3 dyeCol = mix(uDyeA, uDyeB, c.y);
  float shade = lit * mix(0.72, 1.12, thick) * clamp(0.85 + 0.5 * c.z, 0.55, 1.15);
  vec3 col = dyeCol * shade;
  // wisps: contour strands just outside the puffs
  float wisp = exp(-pow((c.x + 0.16) / 0.03, 2.0)) * smoothstep(0.1, 0.35, T) * 0.35 * c.w;
  float a = max(max(dens, haze), wisp);
  // hold the centre third down for the words laid over it
  float x = (s.x - 960.0) / 540.0, y = (s.y - 540.0) / 540.0;
  float hold = uDark * exp(-pow(x / 0.62, 2.0) - pow(y / 0.24, 2.0));
  a *= 1.0 - hold;
  vec3 outc = mix(uGround, col, clamp(a, 0.0, 1.0));
  gl_FragColor = vec4(clamp(outc, 0.0, 1.0), 1.0);
}`;

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const createGL = ({ width = 1920, height = 1080 } = {}) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const opts = { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false };
  const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
  if (!gl) return null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = (frag) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const u = gl.getActiveUniform(p, i);
      loc[u.name] = gl.getUniformLocation(p, u.name);
    }
    return { p, loc };
  };
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const progs = { blob: program(BLOB), ink: program(INK) };
  const run = (pr, set) => {
    gl.useProgram(pr.p);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const u = pr.loc;
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uScale, canvas.width / 1920);
    set(u);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return canvas;
  };

  // prims: [{ c: [x, y, z], b: [bx, by, bz], r }] (1..3), k: [k1, k2], wobble (px), phase, flat, box,
  // colours { field, shade, line, deep }
  const blob = ({ prims, k = [0, 0], wobble = 0, phase = 0, flat = 0, box = 0, pitch, colors }) =>
    run(progs.blob, (u) => {
      const C = [u.uC0, u.uC1, u.uC2], B = [u.uB0, u.uB1, u.uB2];
      for (let i = 0; i < 3; i++) {
        const p = prims[i] || prims[0];
        gl.uniform4f(C[i], p.c[0], p.c[1], p.c[2], prims[i] ? 1 : 0);
        gl.uniform4f(B[i], p.b[0], p.b[1], p.b[2], p.r);
      }
      gl.uniform1f(u.uK1, k[0]);
      gl.uniform1f(u.uK2, k[1]);
      gl.uniform1f(u.uWob, wobble);
      gl.uniform1f(u.uPh, phase);
      gl.uniform1f(u.uFlat, flat);
      gl.uniform1f(u.uBox, box);
      gl.uniform1f(u.uPitch, pitch);
      gl.uniform3fv(u.uField, hex(colors.field));
      gl.uniform3fv(u.uShade, hex(colors.shade));
      gl.uniform3fv(u.uLine, hex(colors.line));
      gl.uniform3fv(u.uDeep, hex(colors.deep));
    });

  const ink = ({ t, z = t, seed = 0, dark = 0.55, colors }) =>
    run(progs.ink, (u) => {
      gl.uniform1f(u.uT, t);
      gl.uniform1f(u.uZ, z);
      gl.uniform1f(u.uSeed, seed);
      gl.uniform1f(u.uDark, dark);
      gl.uniform3fv(u.uGround, hex(colors.ground));
      gl.uniform3fv(u.uDyeA, hex(colors.dyeA));
      gl.uniform3fv(u.uDyeB, hex(colors.dyeB));
    });

  return { canvas, blob, ink, renderer: (() => { const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl'; })() };
};

// fx.js — the four energy shots of phosphor, drawn in Canvas 2D as pure functions of time.
//
//   burst    fibres converging on the frame centre, then flooding it (opening hit, before the white flash)
//   sphere   a sphere sliced into scanline rings with streaks, shell and dust (hero claim)
//   tunnel   a perspective grid corridor rushing to the horizon; `flat` collapses it into one horizon line
//   horizon  a still horizontal glow under the end card
//
// Rebuilt from measurements of the generated clips the source film used (centre, radius, push-in rate,
// horizon brightness profile, ceiling lift speed). Every colour derives from the palette accent, so the shots
// follow the preset. Shared glow pipeline: draw sharp, downsample, blur twice, add back with `lighter`.
// burst and sphere hold light only: the canvas is cleared to transparent, never filled black, so a screen
// blend over the ground adds their light and leaves the ground, grid and crosses as they are wherever
// nothing is lit (principles 6 and 7; film.js lightLayer). The lit pixels carry the same premultiplied
// values as they did on black. Until 2026-10-19 both filled black, which covered the ground (Known issues).
// tunnel keeps its own ground on purpose (a change of ground at the claim, mode card); horizon writes
// opaque pixels and relies on the screen blend of its layer.
import { mulberry32 } from './lib/rng.js';
import { hexToRgb } from './lib/motion.js';

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a, 0, 1).toFixed(4)})`;

// Tints of the accent: k < 1 darkens toward black, w mixes toward the highlight colour.
export const tints = (pal) => {
  const A = hexToRgb(pal.accent), H = hexToRgb(pal.hi);
  return (k = 1, w = 0) => [0, 1, 2].map((i) => clamp(lerp(A[i], H[i], w) * k, 0, 255));
};

function Bloom(W, H, levels) {
  this.levels = levels.map((L) => ({ ...L, a: mk(Math.ceil(W / L.d), Math.ceil(H / L.d)), b: mk(Math.ceil(W / L.d), Math.ceil(H / L.d)) }));
}
Bloom.prototype.apply = function (dst, src, gain = 1) {
  for (const L of this.levels) {
    const al = L.alpha * gain;
    if (al <= 0) continue;
    const ac = L.a.getContext('2d'), bc = L.b.getContext('2d');
    ac.globalCompositeOperation = 'copy';
    ac.drawImage(src, 0, 0, L.a.width, L.a.height);
    bc.globalCompositeOperation = 'copy';
    bc.filter = `blur(${L.blur}px)`;
    bc.drawImage(L.a, 0, 0);
    bc.filter = 'none';
    dst.save();
    dst.setTransform(1, 0, 0, 1, 0, 0);
    dst.globalCompositeOperation = 'lighter';
    let rem = al;
    while (rem > 0.001) { dst.globalAlpha = Math.min(1, rem); dst.drawImage(L.b, 0, 0, dst.canvas.width, dst.canvas.height); rem -= 1; }
    dst.restore();
  }
};

// ---------------------------------------------------------------- burst
// draw(u): u in [0, 1] across the shot (about two beats before the flash).
export const burst = (canvas, pal, seed = 9031) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, CX = W / 2, CY = H / 2;
  const src = mk(W, H), s = src.getContext('2d');
  const bloom = new Bloom(W, H, [{ d: 4, blur: 4, alpha: 0.75 }, { d: 10, blur: 9, alpha: 0.7 }]);
  const T = tints(pal);
  const PAL = [T(0.66), T(0.8), T(0.78, 0.15), T(0.86, 0.4), T(0.92, 0.75), T(0.46)];
  const r = mulberry32(seed);
  const fib = [];
  for (let i = 0; i < 340; i++) {
    const thick = r() < 0.16;
    const c = thick ? (r() < 0.7 ? PAL[4] : PAL[3]) : PAL[Math.floor(r() * 4) === 3 ? 5 : Math.floor(r() * 4)];
    fib.push({
      phi: r() * TAU, tw: (r() * 2 - 1) * 0.28 + 0.06,
      wa: thick ? 0.45 + r() * 0.5 : 0.1 + r() * 0.55, wf: 0.3 + r() * 0.6, wp: r() * TAU,
      w0: thick ? 5 + r() * 12 : 0.5 + Math.pow(r(), 2.2) * 3.2, col: c,
      a0: thick ? 0.5 + r() * 0.3 : 0.45 + r() * 0.55, arr: r() * 0.5, ad: 0.22 + r() * 0.3, late: r(),
      sEnd: thick ? 1500 : 900 + r() * 700,
    });
  }
  const SEG = 30, core0 = T(1, 0.8), core1 = T(0.95, 0.2);
  return (u) => {
    const m = 0.3 + clamp(u, 0, 1) * 1.025;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H); // light only: unlit pixels stay transparent (see the header)
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, W, H);
    s.globalCompositeOperation = 'lighter';
    s.lineCap = 'butt'; s.lineJoin = 'round';
    const zoom = Math.exp(1.55 * (m - 0.3)), rot = 0.25 * (m - 0.3);
    const dens = sstep(0.3, 1.25, m), gain = 0.5 + 0.55 * sstep(0.55, 1.32, m);
    for (const f of fib) {
      if (f.late > 0.35 + 0.65 * dens) continue;
      const pa = sstep(0.3 + f.arr, 0.3 + f.arr + f.ad, m);
      if (pa <= 0) continue;
      const sHead = lerp(1300, 6, 1 - Math.pow(1 - pa, 2.2));
      const pts = [];
      for (let j = 0; j <= SEG; j++) {
        const v = j / SEG, sc = sHead * Math.pow(f.sEnd / sHead, v), lr = Math.log(1 + sc / zoom / 30);
        const ang = f.phi + rot + f.tw * lr + f.wa * Math.sin(f.wf * lr * 1.6 + f.wp + 1.1 * m) * sstep(0, 3, lr);
        pts.push([CX + Math.cos(ang) * sc, CY + Math.sin(ang) * sc * 0.92, sc, v]);
      }
      for (let c0 = 0; c0 < SEG; c0 += 5) {
        const c1 = Math.min(SEG, c0 + 5), sm = pts[(c0 + c1) >> 1];
        const wv = clamp(f.w0 * Math.pow(sm[2] / 400, 0.9), 0.35, 46);
        const a = f.a0 * sstep(4, 90, sm[2]) * (1 - 0.4 * sstep(0.85, 1, sm[3])) * gain * (wv < 1 ? wv : 1);
        if (a < 0.01) continue;
        s.strokeStyle = rgba(f.col, a * (wv > 6 ? 0.62 : 1));
        s.lineWidth = Math.max(1, wv);
        s.beginPath(); s.moveTo(pts[c0][0], pts[c0][1]);
        for (let j = c0 + 1; j <= c1; j++) s.lineTo(pts[j][0], pts[j][1]);
        s.stroke();
      }
    }
    const core = sstep(0.75, 1.32, m);
    const cg = s.createRadialGradient(CX, CY, 0, CX, CY, 60 + 260 * core * core);
    cg.addColorStop(0, rgba(core0, 0.1 + 0.3 * core));
    cg.addColorStop(0.25, rgba(core1, 0.06 * core));
    cg.addColorStop(1, rgba(core1, 0));
    s.fillStyle = cg; s.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, 0, 0);
    bloom.apply(ctx, src, 0.45 + 0.4 * sstep(0.6, 1.32, m));
  };
};

// ---------------------------------------------------------------- sphere
// draw(m, grow): m = seconds since the shot began; grow in [0, 1] scales the radius (birth from a point).
// The canvas is supersampled (canvas.width / 1440) and shown in a 1440×810 box; the sphere sits at its centre.
// opts.push = seconds the push-in lasts (default: for ever, the source film's constant push). The radius
// grows e^(0.05 t) over that time, eased to a stop, then holds; the dust drifts outward only while it grows.
// The highlight streaks and smears slide at most ≈ 14 px/s (ambient limit 15 px/s, principle 5; the source
// film's ≈ 170 px/s was settled away 2026-10-18); they still pulse in brightness.
export const sphere = (canvas, pal, seed = 5150, opts = {}) => {
  const P = opts.push ?? Infinity;
  // slide speeds: streak sp 0.25–0.75 rad/s × R ≈ 230 px → up to 170 px/s; × 0.08 → ≤ 14 px/s.
  // smear sp ±0.09 of the half chord /s → up to 21 px/s; × 0.15 → ≤ 3 px/s
  const kStreak = 0.08, kSmear = 0.15;
  const pushed = (m0) => (m0 <= 0 || !Number.isFinite(P) ? m0 : m0 >= P ? P : P * (1 - (1 - m0 / P) ** 2));
  const ctx = canvas.getContext('2d');
  const K = canvas.width / 1440, W = canvas.width, H = canvas.height;
  const src = mk(W, H), s = src.getContext('2d');
  const bloom = new Bloom(W, H, [{ d: 3, blur: 3, alpha: 0.55 }, { d: 8, blur: 8, alpha: 0.65 }]);
  const T = tints(pal);
  const C = { far: T(0.84), near: T(0.92), streak: T(1, 0.3), smear: T(1, 0.45), dust: T(1, 0.75), haze: T(0.47), haze2: T(0.36), shell: T(0.78), rim: T(0.92) };
  const r = mulberry32(seed);
  const TILT = 0.15, COS = Math.sqrt(1 - TILT * TILT), N = 46;
  const streaks = [], smears = [], dust = [];
  for (let i = 0; i < 14; i++) streaks.push({ k: r(), lam: r() * TAU, len: 0.18 + r() * 0.55, w: 0.25 + r() * 0.5, ph: r() * TAU, per: 1.4 + r() * 2.6, sp: 0.25 + r() * 0.5 });
  for (let i = 0; i < 12; i++) smears.push({ y: (r() * 2 - 1) * 0.7, x: (r() * 2 - 1) * 0.5, len: 0.25 + r() * 0.6, ph: r() * TAU, per: 1.6 + r() * 2.4, sp: (r() - 0.5) * 0.18 });
  for (let i = 0; i < 130; i++) dust.push({ a: r() * TAU, d: 0.35 + Math.pow(r(), 0.7) * 1.9, z: 0.6 + r() * 1.8, ph: r() * TAU, w: 1.5 + r() * 3.5, sz: 0.8 + r() * 1.6 });
  const ring = (cx, cy, rx, ry, a0, a1) => { s.beginPath(); s.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), 0, a0, a1); s.stroke(); };
  return (m0, grow = 1) => {
    const m = m0 + 0.4;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H); // light only: unlit pixels stay transparent (see the header)
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, W, H);
    if (grow <= 0.002) return;
    s.setTransform(K, 0, 0, K, 0, 0);
    s.globalCompositeOperation = 'lighter';
    const mp = pushed(m0); // pushed time: m0 while pushing, eased, then held
    const cx = 720, cy = 404, R = 184.5 * Math.exp(0.05 * mp) * grow;
    const hz = s.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2.1);
    hz.addColorStop(0, rgba(C.haze, 0.12)); hz.addColorStop(0.5, rgba(C.haze2, 0.12)); hz.addColorStop(1, rgba(C.haze2, 0));
    s.fillStyle = hz; s.fillRect(0, 0, 1440, 810);
    const Rh = R * 1.58;
    s.setLineDash([2, 2.6]); s.lineWidth = 1;
    for (let k = 0; k < 44; k++) {
      const hh = -Rh + ((k + 0.5) / 44) * 2 * Rh, rr = Math.sqrt(Math.max(0, Rh * Rh - hh * hh));
      s.strokeStyle = rgba(C.shell, 0.32 * (0.55 + 0.45 * Math.abs(hh / Rh)) * sstep(0.3, 1, grow));
      ring(cx, cy + hh * COS, rr, rr * TILT, 0, TAU);
    }
    s.setLineDash([]);
    const scroll = (m * 0.42) % 1;
    s.lineWidth = 1.05;
    for (let k = -1; k < N + 1; k++) {
      const hh = -R + ((k + scroll) / N) * 2 * R;
      if (hh <= -R || hh >= R) continue;
      const rr = Math.sqrt(R * R - hh * hh), yc = cy + hh * COS, cap = Math.abs(hh / R), b = 0.7 + 0.6 * cap * cap * cap;
      s.strokeStyle = rgba(C.far, 0.46 * b); ring(cx, yc, rr, rr * TILT, Math.PI, TAU);
      s.strokeStyle = rgba(C.near, 0.86 * b); ring(cx, yc, rr, rr * TILT, 0, Math.PI);
    }
    const rim = s.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.04);
    rim.addColorStop(0, rgba(C.rim, 0)); rim.addColorStop(0.8, rgba(C.rim, 0.1)); rim.addColorStop(1, rgba(C.rim, 0));
    s.fillStyle = rim; s.fillRect(0, 0, 1440, 810);
    s.lineCap = 'round';
    for (const st of streaks) {
      const pulse = Math.pow(Math.max(0, Math.sin((TAU * m) / st.per + st.ph)), 3);
      if (pulse < 0.02) continue;
      const hh = -R * 0.92 + st.k * 1.84 * R, rr = Math.sqrt(R * R - hh * hh);
      const aa = ((((st.lam + kStreak * st.sp * m) % TAU) + TAU) % TAU) % Math.PI;
      s.strokeStyle = rgba(C.streak, 0.6 * pulse); s.lineWidth = 1.6 + st.w;
      ring(cx, cy + hh * COS, rr, rr * TILT, aa, Math.min(Math.PI, aa + st.len));
    }
    for (const sm of smears) {
      const pulse = Math.pow(Math.max(0, Math.sin((TAU * m) / sm.per + sm.ph)), 2);
      if (pulse < 0.02) continue;
      const y = cy + sm.y * R, half = Math.sqrt(Math.max(0, 1 - sm.y * sm.y)) * R;
      const xc = cx + clamp(sm.x + kSmear * sm.sp * m, -0.6, 0.6) * half, L = sm.len * half;
      const gr = s.createLinearGradient(xc - L, 0, xc + L, 0);
      gr.addColorStop(0, rgba(C.smear, 0)); gr.addColorStop(0.5, rgba(C.smear, 0.65 * pulse)); gr.addColorStop(1, rgba(C.smear, 0));
      s.fillStyle = gr; s.fillRect(xc - L, y - 2.2, 2 * L, 4.4);
    }
    for (const d of dust) {
      const tw = Math.pow(0.5 + 0.5 * Math.sin(d.w * m + d.ph), 3), rad = R * d.d * (1 + 0.02 * (mp + 0.4) * d.z);
      const x = cx + Math.cos(d.a + 0.02 * m) * rad, y = cy + Math.sin(d.a + 0.02 * m) * rad * 0.9;
      s.fillStyle = rgba(C.dust, (0.15 + 0.75 * tw) * sstep(0.4, 1, grow));
      s.fillRect(x - d.sz / 2, y - d.sz / 2, d.sz, d.sz);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, 0, 0);
    bloom.apply(ctx, src, 1);
  };
};

// ---------------------------------------------------------------- tunnel
// draw(m, flat): m = seconds since the shot began; flat in [0, 1] folds floor and ceiling onto the horizon.
export const tunnel = (canvas, pal, seed = 7301) => {
  const ctx = canvas.getContext('2d');
  const K = canvas.width / 1920, W = canvas.width, H = canvas.height;
  const src = mk(W, H), s = src.getContext('2d');
  const bloom = new Bloom(W, H, [{ d: 3, blur: 3, alpha: 0.8 }, { d: 8, blur: 9, alpha: 0.9 }]);
  const T = tints(pal);
  const BAR = T(0.88, 0.35), CORE = T(1, 0.72), TEAL = T(0.76, 0.1), DIM = T(0.52), HAZE = T(0.6, 0.1), CHIP = T(0.9, 0.3);
  const bgc = T(0.02);
  const F = 960, VX = 960, VY = 525, V = 24.5, ZEND = 48, ZFAR = 150, SHUT = 0.5 / 30;
  const r = mulberry32(seed);
  const streaks = [], chips = [];
  for (let i = 0; i < 1700; i++) {
    const onPlane = r() < 0.75, side = r() < 0.5 ? 1 : -1;
    streaks.push({ x: (r() * 2 - 1) * (onPlane ? 9 : 4), y: onPlane ? side * (0.86 + r() * 0.13) : (r() * 2 - 1) * 0.8, z0: r() * 60, L: 1.2 + r() * 3.5, a: 0.05 + Math.pow(r(), 2) * 0.32, w: 0.6 + r() * 1.6 });
  }
  for (let i = 0; i < 16; i++) chips.push({ x: (r() * 2 - 1) * 3, y: (r() < 0.5 ? 1 : -1) * (0.55 + r() * 0.4), z0: r() * 60, sz: 0.03 + r() * 0.05, a: 0.4 + r() * 0.5 });
  let FY = 1; // vertical fold factor, set per frame
  const P = (x, y, z) => [VX + (F * x) / z, VY + (F * y * FY) / z];
  const fog = (z) => Math.exp(-z / 42);
  const fogL = (z) => Math.exp(-z / 24) * (1 - sstep(30, 55, z));
  function zSeg(x, y, zn, zf, width, col, alpha) {
    zn = Math.max(zn, (F * Math.abs(y)) / 620, (F * Math.abs(x)) / 1060, 0.12); // near end fixed in z, so the fold scales every line by FY (the centre line used to keep 620 px until the last frames of the fold)
    if (zf <= zn) return;
    const a = P(x, y, zn), b = P(x, y, zf);
    const g = s.createLinearGradient(a[0], a[1], b[0], b[1] + 0.01);
    const iz = (z) => (1 / zn - 1 / z) / (1 / zn - 1 / zf);
    for (const z of [zn, 4, 10, 22, 45, 90, zf]) if (z >= zn && z <= zf) g.addColorStop(clamp(iz(z), 0, 1), rgba(col, alpha * fogL(z)));
    s.strokeStyle = g; s.lineWidth = width;
    s.beginPath(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.stroke();
  }
  function zLine(x, y, zn, zf, width, col, alpha) {
    const cuts = [zn, 8, 18, 36, zf], wk = [1, 0.6, 0.35, 0.2];
    for (let i = 0; i < 4; i++) {
      const a0 = Math.max(zn, cuts[i]), a1 = Math.min(zf, cuts[i + 1]);
      if (a1 > a0) zSeg(x, y, a0, a1, width * wk[i], col, alpha);
    }
  }
  function band(y, zr, wz, xExt, col, alpha) {
    const z1 = Math.max(0.05, zr - wz / 2), z2 = zr + wz / 2 + V * SHUT;
    const y1 = VY + (F * y * FY) / z1, y2 = VY + (F * y * FY) / z2;
    const px = Math.abs(y1 - y2);
    const ideal = Math.abs((F * y * FY) / Math.max(0.05, zr - wz / 2) - (F * y * FY) / (zr + wz / 2));
    const a = alpha * clamp(Math.max(ideal, 2) / Math.max(px, 2), 0.45, 1);
    const x0 = VX - (F * xExt) / zr, x1 = VX + (F * xExt) / zr;
    s.fillStyle = rgba(col, a);
    s.fillRect(Math.max(-10, x0), Math.min(y1, y2), Math.min(1940, x1) - Math.max(-10, x0), Math.max(1, px));
  }
  return (m, flat = 0) => {
    FY = 1 - clamp(flat, 0, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(bgc, 1); ctx.fillRect(0, 0, W, H);
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = 'source-over';
    s.clearRect(0, 0, W, H);
    s.setTransform(K, 0, 0, K, 0, 0);
    s.globalCompositeOperation = 'lighter';
    s.lineCap = 'butt';
    const zc = V * m, ceilLeft = ZEND - zc;
    const hg = s.createLinearGradient(0, VY - 70, 0, VY + 70);
    hg.addColorStop(0, rgba(HAZE, 0)); hg.addColorStop(0.5, rgba(HAZE, 0.16 + 0.5 * flat)); hg.addColorStop(1, rgba(HAZE, 0));
    s.fillStyle = hg; s.fillRect(0, VY - 70, 1920, 140);
    const hr = s.createRadialGradient(VX, VY, 0, VX, VY, 520);
    hr.addColorStop(0, rgba(HAZE, 0.22 + 0.4 * flat)); hr.addColorStop(1, rgba(HAZE, 0));
    s.save(); s.translate(VX, VY); s.scale(1.6 + 1.2 * flat, 0.16 * (1 - 0.6 * flat)); s.translate(-VX, -VY);
    s.fillStyle = hr; s.fillRect(VX - 520, VY - 520, 1040, 1040); s.restore();
    s.lineCap = 'round';
    for (const st of streaks) {
      const zr = ((((st.z0 - zc) % 60) + 60) % 60) + 0.4;
      if (st.y < -0.85 && zr + zc > ZEND) continue;
      const a = P(st.x, st.y, zr), b = P(st.x, st.y, zr + st.L);
      const al = st.a * 2.2 * fog(zr) * sstep(0.4, 2.5, zr) * (1 - flat);
      if (al < 0.01) continue;
      s.strokeStyle = rgba(DIM, al);
      s.lineWidth = clamp((st.w * 6) / zr, 0.6, 5);
      s.beginPath(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.stroke();
    }
    s.lineCap = 'butt';
    const DX = 0.865;
    for (let j = -36; j <= 36; j++) {
      const x = j * DX;
      if (j === 0) zLine(x, 1, 0.12, 70, 9, CORE, 1);
      else if (j % 2 === 0) zLine(x, 1, 0.12, 70, 6, CORE, 0.9);
      else zLine(x, 1, 0.12, 70, 3, TEAL, 0.65);
    }
    const cEnd = Math.min(ZFAR, ceilLeft);
    if (cEnd > 0.15) {
      for (let j = -16; j <= 16; j++) {
        const x = j * DX;
        if (j === 0) zLine(x, -1, 0.12, cEnd, 9, CORE, 1);
        else if (j % 2 === 0) zLine(x, -1, 0.12, cEnd, 6, CORE, 0.9);
        else zLine(x, -1, 0.12, cEnd, 2.4, TEAL, 0.45);
      }
    }
    // Crossbars pass the camera about 7 times a second. Near the camera each one fills the top or bottom
    // quarter of the frame, which made an area flash at 4.5 a second (check 2026-10-18, flash gate): they
    // fade to 30 % between 6 and 2 units away, so the rush still reads and no quarter of the frame flashes.
    const nearBar = (zr) => 0.3 + 0.7 * sstep(2, 6, zr);
    const DZ = 3.4, n0 = Math.floor(zc / DZ), n1 = Math.ceil((zc + 70) / DZ);
    for (let n = n0; n <= n1; n++) {
      const zw = n * DZ + 1.1, zr = zw - zc;
      if (zr < 0.15) continue;
      const fa = fogL(zr) * (1 - 0.85 * flat) * nearBar(zr);
      band(1, zr, 0.1, 40, BAR, 0.9 * fa);
      if (zw < ZEND - 0.5) band(-1, zr, 0.1, 16, BAR, 0.9 * fa);
    }
    if (ceilLeft > 0.15) band(-1, ceilLeft, 0.18, 16, BAR, (0.15 + 0.8 * (1 - sstep(12, 40, ceilLeft))) * (1 - flat));
    for (const c of chips) {
      const zr = ((((c.z0 - zc) % 60) + 60) % 60) + 0.5;
      const al = c.a * fog(zr) * sstep(0.5, 3, zr) * (1 - flat);
      if (al < 0.02) continue;
      const a = P(c.x, c.y, zr), b = P(c.x, c.y, zr + 0.5), sz = (F * c.sz) / zr;
      s.strokeStyle = rgba(CHIP, al); s.lineWidth = clamp(sz, 1, 30);
      s.beginPath(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.stroke();
    }
    if (flat > 0) {
      // the folded planes: one hot horizon line across the frame
      const lw = 2 + 3 * flat;
      s.fillStyle = rgba(CORE, 0.85 * sstep(0.2, 1, flat));
      s.fillRect(0, VY - lw / 2, 1920, lw);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, 0, 0);
    bloom.apply(ctx, src, 1);
  };
};

// ---------------------------------------------------------------- horizon
// A still glow, built once per pixel from two measured brightness profiles (separable product).
export const horizon = (canvas, pal) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const A = hexToRgb(pal.accent), mx = Math.max(...A);
  const ratio = A.map((v) => v / mx);
  const PY = [[0, 145], [5, 110], [10, 96], [20, 78], [30, 66], [40, 56], [60, 41], [80, 31], [120, 17], [160, 8], [220, 0]];
  const PX = [[0, 145], [100, 130], [200, 111], [300, 90], [400, 75], [500, 57], [700, 25], [900, 3], [1000, 0]];
  const tab = (T, d) => {
    d = Math.abs(d);
    for (let i = 1; i < T.length; i++) if (d <= T[i][0]) return lerp(T[i - 1][1], T[i][1], (d - T[i - 1][0]) / (T[i][0] - T[i - 1][0]));
    return 0;
  };
  const img = ctx.createImageData(W, H), d = img.data, sx = 1920 / W, sy = 1080 / H;
  for (let y = 0; y < H; y++) {
    const py = tab(PY, (y + 0.5 - H / 2) * sy) / 145;
    for (let x = 0; x < W; x++) {
      const g = tab(PX, (x + 0.5 - W / 2) * sx) * py, i = (y * W + x) * 4;
      d[i] = Math.round(g * ratio[0]); d[i + 1] = Math.round(g * ratio[1]); d[i + 2] = Math.round(g * ratio[2]); d[i + 3] = 255;
    }
  }
  return () => ctx.putImageData(img, 0, 0);
};

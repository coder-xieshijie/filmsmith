// inkflow.js — the ink bloom: ink dropped in water, as a 2D stable-fluids simulation (Stam 1999) baked once, then
// drawn per frame as pigment absorbance on paper (Beer–Lambert), the way watercolour and sumi are modelled.
//
// simulate(opt) runs the water on a 192 × 108 grid (10 px a cell) and carries the ink on a grid 4 times finer. A drop
// is a source: an ink-only outward flow (not projected, so the ink spreads while the water stays incompressible)
// shaped by an uneven angular profile, and a ring of alternating tangential pushes at its advancing front that sheds
// vortex pairs into the water; those roll the front into curled tendrils. Vorticity confinement keeps the curls, a
// slow divergence-free current keeps the water moving, MacCormack advection keeps filaments sharp, a little diffusion
// feathers them. The choreography (BLOOM, beats from the bloom's start):
//   rest (0–1)        the dot, exactly as the slam scene left it (r 34, centred)
//   drop (1)          the dot is released and blooms: lobes and curls
//   pour (2.4)        held ink at the centre and three drops round it thicken and widen the mass
//   spread (4.2)      drops round the rim carry it past the frame while the camera pushes in (3.6 → 2.4× at 7.2);
//                     from 4.8 the ink clouding the water fills the last gaps from their surroundings
//   flat (6.9–7.9)    the tones even out into exactly the accent the name scene stands on
// One byte of concentration per ink cell is stored 16 times a beat (about 6 MB gzipped).
// shade() turns concentration into colour: up to c = 1 the paper turns into the accent, beyond it the accent deepens;
// a tideline darkens the front where it thins against clear water, the paper's sizing makes the wash uneven, and a
// fine granulation is fixed to the paper. About 20 ms a 1080p frame.
//
// Plain JS, no DOM: bloom-bake.mjs runs simulate() in Node and writes assets/bloom/; bloom.js loads it in the browser
// and calls shade(). Every frame is a pure function of the beat.

import { mulberry32 } from './lib/rng.js';

export const VERSION = 5;

// key beats, used by plan.js for the sound events
export const BLOOM = { drop: 1, pour: 2.4, spread: 4.2, push: 3.6, flatFrom: 6.9, flatTo: 7.9 };

// The choreography in beats. Drops: [beat, x, y (film px), size, held beats]
export const SUMI = {
  NX: 192, NY: 108, R: 4, perBeat: 16, beats: 8, steps: 22,
  drops: [
    [1.0, 960, 540, 2.3, 0.0],
    [2.4, 960, 540, 2.6, 1.8],
    [2.55, 880, 500, 1.25, 0],
    [2.7, 1050, 590, 1.35, 0],
    [2.9, 990, 450, 1.0, 0],
    [4.2, 790, 610, 1.9, 0.8],
    [4.3, 1150, 470, 1.9, 0.8],
    [4.45, 930, 700, 1.6, 0],
    [4.6, 1010, 370, 1.6, 0],
    [4.8, 700, 430, 1.4, 0],
    [4.9, 1250, 660, 1.4, 0],
    [5.2, 640, 560, 1.3, 0.5],
    [5.3, 640, 360, 1.5, 0],
    [5.4, 1300, 380, 1.5, 0],
    [5.5, 620, 720, 1.5, 0],
    [5.6, 1290, 760, 1.5, 0],
  ],
  dot: { x: 960, y: 540, r: 34 },
};

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const sm = (a, z, x) => { const u = clamp((x - a) / (z - a), 0, 1); return u * u * (3 - 2 * u); };
function hash2(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export const CMAX = 2.4; // stored range of c

export function simulate(opt = {}) {
  const P = { ...SUMI, ...opt };
  const rand = mulberry32(P.seed ?? 1);
  const { NX, NY, R } = P;
  const SX = NX + 2, SY = NY + 2, n = SX * SY;
  const cell = 1920 / NX;                   // film px per velocity cell
  const scale = 12 / cell;
  let u = new Float32Array(n), v = new Float32Array(n), uP = new Float32Array(n), vP = new Float32Array(n);
  const p = new Float32Array(n), dv = new Float32Array(n), cu = new Float32Array(n), eu = new Float32Array(n), ev = new Float32Array(n);
  const DX = NX * R, DY = NY * R, m = DX * DY;
  let D = new Float32Array(m), T = new Float32Array(m), M = new Float32Array(m);
  const VX = new Float32Array(m), VY = new Float32Array(m);
  const EKX = new Float32Array(DX), EKY = new Float32Array(DY);
  const band = Math.round(Math.min(DX, DY) * 0.04);
  for (let a = 0; a < DX; a++) { const e = Math.min(a, DX - 1 - a) / band; EKX[a] = e >= 1 ? 1 : 0.985 + 0.015 * e * e; }
  for (let b = 0; b < DY; b++) { const e = Math.min(b, DY - 1 - b) / band; EKY[b] = e >= 1 ? 1 : 0.985 + 0.015 * e * e; }
  const colI = new Int32Array(DX), colF = new Float32Array(DX), rowJ = new Int32Array(DY), rowF = new Float32Array(DY);
  for (let a = 0; a < DX; a++) { const g = (a + 0.5) / R + 0.5; colI[a] = g | 0; colF[a] = g - (g | 0); }
  for (let b = 0; b < DY; b++) { const g = (b + 0.5) / R + 0.5; rowJ[b] = g | 0; rowF[b] = g - (g | 0); }

  const setBnd = (k, x) => {
    const top = SX * (NY + 1);
    for (let i = 1; i <= NX; i++) { x[i] = k === 2 ? -x[i + SX] : x[i + SX]; x[i + top] = k === 2 ? -x[i + top - SX] : x[i + top - SX]; }
    for (let j = 1; j <= NY; j++) { const r = SX * j; x[r] = k === 1 ? -x[r + 1] : x[r + 1]; x[r + NX + 1] = k === 1 ? -x[r + NX] : x[r + NX]; }
  };
  const project = () => {
    for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) { dv[k] = -0.5 * (u[k + 1] - u[k - 1] + v[k + SX] - v[k - SX]); p[k] *= 0.9; }
    setBnd(0, dv); setBnd(0, p);
    for (let it = 0; it < 26; it++) {
      for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) p[k] = (dv[k] + p[k - 1] + p[k + 1] + p[k - SX] + p[k + SX]) * 0.25;
      setBnd(0, p);
    }
    for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) { u[k] -= 0.5 * (p[k + 1] - p[k - 1]); v[k] -= 0.5 * (p[k + SX] - p[k - SX]); }
    setBnd(1, u); setBnd(2, v);
  };
  const diffuseVel = (a) => {
    const c = 1 + 4 * a; uP.set(u); vP.set(v);
    for (let it = 0; it < 3; it++) {
      for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) {
        u[k] = (uP[k] + a * (u[k - 1] + u[k + 1] + u[k - SX] + u[k + SX])) / c;
        v[k] = (vP[k] + a * (v[k - 1] + v[k + 1] + v[k - SX] + v[k + SX])) / c;
      }
      setBnd(1, u); setBnd(2, v);
    }
  };
  const advectVel = (dt) => {
    let t = u; u = uP; uP = t; t = v; v = vP; vP = t;
    const mx = NX + 0.5, my = NY + 0.5;
    for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) {
      const x = clamp(i - dt * uP[k], 0.5, mx), y = clamp(j - dt * vP[k], 0.5, my);
      const i0 = x | 0, j0 = y | 0, s1 = x - i0, t1 = y - j0, s0 = 1 - s1, t0 = 1 - t1, q = i0 + SX * j0;
      u[k] = s0 * (t0 * uP[q] + t1 * uP[q + SX]) + s1 * (t0 * uP[q + 1] + t1 * uP[q + 1 + SX]);
      v[k] = s0 * (t0 * vP[q] + t1 * vP[q + SX]) + s1 * (t0 * vP[q + 1] + t1 * vP[q + 1 + SX]);
    }
    setBnd(1, u); setBnd(2, v);
  };
  const confine = (eps) => {
    for (let j = 1; j <= NY; j++) for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) cu[k] = 0.5 * ((v[k + 1] - v[k - 1]) - (u[k + SX] - u[k - SX]));
    for (let j = 2; j < NY; j++) for (let i = 2, k = 2 + SX * j; i < NX; i++, k++) {
      const wx = 0.5 * (Math.abs(cu[k + 1]) - Math.abs(cu[k - 1])), wy = 0.5 * (Math.abs(cu[k + SX]) - Math.abs(cu[k - SX]));
      const w = cu[k] * eps / (Math.sqrt(wx * wx + wy * wy) + 1e-5);
      u[k] += wy * w; v[k] -= wx * w;
    }
  };
  let simT = 0;
  const ambient = (dt) => {
    const A = 0.00022 * dt * 12, k1 = 0.055, k2 = 0.07;
    for (let j = 1; j <= NY; j++) {
      const sy = Math.sin(j * k2 - simT * 0.0017), cy = Math.cos(j * k2 - simT * 0.0017);
      for (let i = 1, k = 1 + SX * j; i <= NX; i++, k++) {
        u[k] += A * Math.sin(i * k1 + simT * 0.0021) * k2 * cy;
        v[k] -= A * k1 * Math.cos(i * k1 + simT * 0.0021) * sy;
      }
    }
  };
  const vortex = (cx, cy, rad, s) => {
    const box = Math.ceil(rad * 3), inv = 1 / (rad * rad);
    for (let j = Math.max(1, Math.floor(cy - box)); j <= Math.min(NY, Math.ceil(cy + box)); j++) {
      const dy = j - cy;
      for (let i = Math.max(1, Math.floor(cx - box)); i <= Math.min(NX, Math.ceil(cx + box)); i++) {
        const dx = i - cx, g = Math.exp(-(dx * dx + dy * dy) * inv) * s, k = i + SX * j;
        u[k] -= dy * g / rad; v[k] += dx * g / rad;
      }
    }
  };
  // add concentration conc around (cx, cy) in velocity-cell units, gaussian radius rad
  const stamp = (cx, cy, rad, conc, mix) => {
    const ax = (cx - 0.5) * R, ay = (cy - 0.5) * R, rd = rad * R, r2 = rd * rd;
    for (let b = Math.max(0, Math.floor(ay - rd * 2.5)); b <= Math.min(DY - 1, Math.ceil(ay + rd * 2.5)); b++) {
      const dy = b + 0.5 - ay;
      for (let a = Math.max(0, Math.floor(ax - rd * 2.5)); a <= Math.min(DX - 1, Math.ceil(ax + rd * 2.5)); a++) {
        const dx = a + 0.5 - ax, w = Math.exp(-(dx * dx + dy * dy) / r2) * mix;
        if (w < 0.004) continue;
        const k = a + DX * b;
        D[k] += (conc - D[k]) * w;
      }
    }
  };

  // the dot, crisp, at full concentration
  {
    const ax = P.dot.x / 1920 * DX, ay = P.dot.y / 1080 * DY, rd = P.dot.r / 1920 * DX;
    for (let b = 0; b < DY; b++) for (let a = 0; a < DX; a++) {
      const d = Math.hypot(a + 0.5 - ax, b + 0.5 - ay) - rd;
      D[a + DX * b] = clamp(0.5 - d, 0, 1);
    }
  }

  const PROF_N = 128, PROF_K = PROF_N / (2 * Math.PI);
  const blooms = [];
  const spawn = (cx, cy, size, held) => {
    const b = { x: cx, y: cy, age: 0, flow: 0, size, held };
    b.q0 = (5.2 + rand() * 2.2) * size * size * scale * scale;
    b.tau = 20 + rand() * 10;
    b.rc = (0.75 + 0.25 * size) * scale;
    const k = 5 + Math.floor(rand() * 5), f3 = 11 + Math.floor(rand() * 9);
    const ph = [0, 0, 0, 0].map(() => rand() * 6.283);
    b.prof = new Float32Array(PROF_N);
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i < PROF_N; i++) {
      const th = i / PROF_K;
      const q = Math.sin(k * th + ph[0]) + 0.62 * Math.sin((2 * k + 1) * th + ph[1]) + 0.42 * Math.sin(f3 * th + ph[2]) + 0.5 * Math.sin(2 * th + ph[3]);
      b.prof[i] = q; mn = Math.min(mn, q); mx = Math.max(mx, q);
    }
    let mean = 0;
    for (let i = 0; i < PROF_N; i++) { b.prof[i] = 0.3 + 1.8 * Math.pow(clamp((b.prof[i] - mn) / (mx - mn + 1e-9), 0, 1), 1.7); mean += b.prof[i]; }
    for (let i = 0; i < PROF_N; i++) b.prof[i] /= mean / PROF_N;
    const fr = [3 + Math.floor(rand() * 4), 6 + Math.floor(rand() * 5), 9 + Math.floor(rand() * 6), 13 + Math.floor(rand() * 5)];
    const am = [1, 0.7 + rand() * 0.4, 0.45 + rand() * 0.4, 0.3 + rand() * 0.3], sp = fr.map(() => rand() * 6.283);
    b.shed = new Float32Array(PROF_N);
    let sm2 = 1e-6;
    for (let i = 0; i < PROF_N; i++) { let q = 0; for (let z = 0; z < 4; z++) q += am[z] * Math.sin(fr[z] * i / PROF_K + sp[z]); b.shed[i] = q; sm2 = Math.max(sm2, Math.abs(q)); }
    for (let i = 0; i < PROF_N; i++) b.shed[i] /= sm2;
    b.twist = (rand() - 0.5) * 0.12;
    b.fa = (0.08 + rand() * 0.07) * size;
    b.spin = (rand() - 0.5) * 0.05;
    b.area = Math.PI * b.rc * b.rc;
    b.cs = (held ? 1.9 : 1.45) + rand() * 0.25;
    const wa = rand() * 6.283, ws = (0.012 + rand() * 0.02) * scale;
    b.vx = Math.cos(wa) * ws; b.vy = Math.sin(wa) * ws; b.turn = (rand() - 0.5) * 0.02;
    stamp(cx, cy, b.rc * 1.1, b.cs, 1);
    const kicks = 3 + Math.floor(rand() * 3), est = Math.sqrt(b.q0 * b.tau / Math.PI);
    for (let z = 0; z < kicks; z++) {
      const a = rand() * 6.283, d = est * (0.5 + rand() * 1.1);
      vortex(cx + Math.cos(a) * d, cy + Math.sin(a) * d, (1.2 + rand() * 1.8) * scale, (rand() < 0.5 ? -1 : 1) * (0.1 + rand() * 0.16) * size);
    }
    blooms.push(b);
  };
  const updateBlooms = (dt) => {
    for (const b of blooms) {
      if (b.off) continue;
      b.age += dt;
      if (b.held > 0) b.held -= dt; else b.flow += dt;
      const Q = b.q0 * (b.held > 0 ? 0.75 : Math.exp(-b.flow / b.tau));
      b.area += Q * dt;
      if (Q < 0.03 && b.age > 30) { b.off = true; continue; }
      const rf = Math.sqrt(b.area / Math.PI), reach = Math.min(Math.max(NX, NY) * 0.5, rf * 2.2 + 4), reach2 = reach * reach;
      const qf = Q / (2 * Math.PI), rc2 = b.rc * b.rc, fa = b.fa * Math.exp(-b.age / 45) * dt, ringW = 1 / (1.2 + rf * 0.12);
      for (let j = Math.max(1, Math.floor(b.y - reach)); j <= Math.min(NY, Math.ceil(b.y + reach)); j++) {
        const dy = j - b.y;
        for (let i = Math.max(1, Math.floor(b.x - reach)), k = i + SX * j; i <= Math.min(NX, Math.ceil(b.x + reach)); i++, k++) {
          const dx = i - b.x, r2 = dx * dx + dy * dy;
          if (r2 > reach2) continue;
          const th = Math.atan2(dy, dx), r = Math.sqrt(r2) + 1e-4;
          let pa = ((th + b.twist * r) * PROF_K) % PROF_N; if (pa < 0) pa += PROF_N;
          const pi0 = pa | 0, pf = pa - pi0;
          const mod = b.prof[pi0] * (1 - pf) + b.prof[(pi0 + 1) % PROF_N] * pf;
          const f = qf * mod / (r2 + rc2) * Math.exp(-r2 / reach2 * 1.6);
          eu[k] += dx * f - b.spin * dy * f * 6;
          ev[k] += dy * f + b.spin * dx * f * 6;
          const ring = (r - rf) * ringW, ea = ring * ring;
          if (ea < 9) {
            let sa = th * PROF_K; if (sa < 0) sa += PROF_N;
            const si = sa | 0, sf = sa - si;
            const sh = b.shed[si % PROF_N] * (1 - sf) + b.shed[(si + 1) % PROF_N] * sf;
            const g = Math.exp(-ea) * fa * sh;
            u[k] += -dy / r * g; v[k] += dx / r * g;
          }
        }
      }
      if (!(b.held > 0)) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        const c = Math.cos(b.turn * dt), s = Math.sin(b.turn * dt), nvx = b.vx * c - b.vy * s;
        b.vy = b.vx * s + b.vy * c; b.vx = nvx;
      }
      const conc = b.cs * (0.82 + 0.18 * Math.sin(b.age * 0.19)) * (b.held > 0 ? 0.9 : 0.35 + 0.65 * Math.exp(-b.flow / 24));
      stamp(b.x, b.y, b.rc, conc, Math.min(1, 0.55 * dt) * clamp(Q / b.q0 * 1.4, 0, 1));
    }
  };
  const advectDye = (dt) => {
    const mxA = DX - 1.001, mxB = DY - 1.001, dr = dt * R;
    for (let b = 0, idx = 0; b < DY; b++) {
      const jj = rowJ[b], fy = rowF[b], gy = 1 - fy, base = SX * jj;
      for (let a = 0; a < DX; a++, idx++) {
        const fx = colF[a], gx = 1 - fx, q = colI[a] + base;
        const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;
        VX[idx] = dr * (w00 * (u[q] + eu[q]) + w10 * (u[q + 1] + eu[q + 1]) + w01 * (u[q + SX] + eu[q + SX]) + w11 * (u[q + SX + 1] + eu[q + SX + 1]));
        VY[idx] = dr * (w00 * (v[q] + ev[q]) + w10 * (v[q + 1] + ev[q + 1]) + w01 * (v[q + SX] + ev[q + SX]) + w11 * (v[q + SX + 1] + ev[q + SX + 1]));
      }
    }
    const samp = (S, x, y) => {
      x = clamp(x, 0, mxA); y = clamp(y, 0, mxB);
      const x0 = x | 0, y0 = y | 0, sx = x - x0, sy = y - y0, s = x0 + DX * y0;
      return (1 - sy) * ((1 - sx) * S[s] + sx * S[s + 1]) + sy * ((1 - sx) * S[s + DX] + sx * S[s + DX + 1]);
    };
    for (let b = 0, idx = 0; b < DY; b++) for (let a = 0; a < DX; a++, idx++) T[idx] = samp(D, a - VX[idx], b - VY[idx]);
    for (let b = 0, idx = 0; b < DY; b++) for (let a = 0; a < DX; a++, idx++) M[idx] = samp(T, a + VX[idx], b + VY[idx]);
    for (let b = 0, idx = 0; b < DY; b++) {
      const kr = 0.99996 * EKY[b];
      for (let a = 0; a < DX; a++, idx++) {
        const x = clamp(a - VX[idx], 0, mxA), y = clamp(b - VY[idx], 0, mxB), s = (x | 0) + DX * (y | 0);
        const c0 = D[s], c1 = D[s + 1], c2 = D[s + DX], c3 = D[s + DX + 1];
        const lo = Math.min(c0, c1, c2, c3), hi = Math.max(c0, c1, c2, c3);
        const q = T[idx] + 0.5 * (D[idx] - M[idx]);
        M[idx] = (q < lo ? lo : q > hi ? hi : q) * kr * EKX[a];
      }
    }
    const t = D; D = M; M = t;
  };
  const diffuseDye = (k) => {
    const t = D; D = T; T = t;
    const c = 1 - 4 * k;
    for (let b = 0; b < DY; b++) {
      const up = b > 0 ? -DX : 0, dn = b < DY - 1 ? DX : 0;
      for (let a = 0, idx = DX * b; a < DX; a++, idx++) {
        const l = a > 0 ? -1 : 0, r = a < DX - 1 ? 1 : 0;
        D[idx] = c * T[idx] + k * (T[idx + l] + T[idx + r] + T[idx + up] + T[idx + dn]);
      }
    }
  };
  const step = (dt) => {
    simT += dt;
    eu.fill(0); ev.fill(0);
    ambient(dt);
    updateBlooms(dt);
    confine(0.11 * dt);
    diffuseVel(0.02 * dt);
    advectVel(dt);
    project();
    const damp = Math.pow(0.9965, dt);
    for (let i = 0; i < n; i++) { u[i] = clamp(u[i] * damp, -4, 4); v[i] = clamp(v[i] * damp, -4, 4); }
    advectDye(dt);
    diffuseDye(0.004 * dt);
  };

  const frames = P.beats * P.perBeat + 1;
  const data = new Uint8Array(frames * m);
  const enc = (c) => Math.round(255 * Math.sqrt(clamp(c / CMAX, 0, 1)));
  const drops = P.drops.map((d) => ({ b: d[0], x: d[1] / cell + 0.5, y: d[2] / cell + 0.5, size: d[3], held: d[4] * P.steps, done: false }));
  const sub = P.steps / P.perBeat;          // sim steps per stored frame
  for (let f = 0; f < frames; f++) {
    if (f > 0) {
      for (let s = 0; s < sub; s++) {
        const bs = (f - 1 + s / sub) / P.perBeat;
        for (const d of drops) if (!d.done && bs >= d.b) { d.done = true; spawn(d.x, d.y, d.size, d.held); }
        step(1);
      }
    }
    const o = f * m;
    for (let i = 0; i < m; i++) data[o + i] = enc(D[i]);
  }
  return { version: VERSION, seed: P.seed ?? 1, NX, NY, R, DX, DY, perBeat: P.perBeat, beats: P.beats, frames, data };
}

// concentration at stored frame f, decoded
const dec = new Float32Array(256);
for (let i = 0; i < 256; i++) dec[i] = (i / 255) * (i / 255) * CMAX;

let GR = null, GRkey = '';
const sizing = (DX, DY) => {
  const key = DX + 'x' + DY;
  if (GRkey === key) return GR;
  GR = new Float32Array(DX * DY);
  for (let b = 0; b < DY; b++) for (let a = 0; a < DX; a++) {
    const x = a * 1920 / DX, y = b * 1920 / DX;
    const g = 0.62 * vnoise(x / 70, y / 70) + 0.28 * vnoise(x / 19 + 40, y / 19 - 11) + 0.1 * hash2(a, b);
    GR[a + DX * b] = 0.86 + 0.3 * g;
  }
  GRkey = key;
  return GR;
};

// separable box blur, radius r cells
const boxBlur = (S, DX, DY, r) => {
  const T = new Float32Array(S.length), O = new Float32Array(S.length), w = 1 / (2 * r + 1);
  for (let y = 0; y < DY; y++) {
    let acc = 0; const o = DX * y;
    for (let x = -r; x <= r; x++) acc += S[o + clamp(x, 0, DX - 1)];
    for (let x = 0; x < DX; x++) { T[o + x] = acc * w; acc += S[o + Math.min(DX - 1, x + r + 1)] - S[o + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < DX; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += T[x + DX * clamp(y, 0, DY - 1)];
    for (let y = 0; y < DY; y++) { O[x + DX * y] = acc * w; acc += T[x + DX * Math.min(DY - 1, y + r + 1)] - T[x + DX * Math.max(0, y - r)]; }
  }
  return O;
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// view: { zoom, cx, cy } in film px (the film point at the frame's centre); flat: 0..1 toward the accent
export function viewAt(b) {
  const z = 1 + 1.4 * sm(BLOOM.push, 7.2, b) ** 1.3;
  return { zoom: z, cx: 960, cy: 540, flat: sm(BLOOM.flatFrom, BLOOM.flatTo, b) };
}

export function shade(F, b, out, W, H, pal, view = viewAt(b)) {
  const { DX, DY, perBeat, frames, data } = F, m = DX * DY;
  const fb = clamp(b * perBeat, 0, frames - 1), f0 = Math.floor(fb), f1 = Math.min(frames - 1, f0 + 1), w1 = fb - f0, w0 = 1 - w1;
  // the field at this beat, at dye resolution
  const C = new Float32Array(m);
  for (let i = 0, o0 = f0 * m, o1 = f1 * m; i < m; i++) C[i] = w0 * dec[data[o0 + i]] + w1 * dec[data[o1 + i]];
  const G = sizing(DX, DY);
  // absorbance field: c × sizing × rim, plus the tideline where the front thins against clear water
  const A = new Float32Array(m);
  for (let y = 0; y < DY; y++) {
    const up = y > 0 ? -DX : 0, dn = y < DY - 1 ? DX : 0;
    for (let x = 0, i = DX * y; x < DX; x++, i++) {
      const c = C[i];
      if (c < 0.002) { A[i] = 0; continue; }
      const gx = C[i + (x < DX - 1 ? 1 : 0)] - C[i - (x > 0 ? 1 : 0)], gy = C[i + dn] - C[i + up];
      const g = Math.sqrt(gx * gx + gy * gy) * 1.6;
      const bandv = (c - 0.14) * 16;
      const tide = Math.min(1, g * 7.2) * Math.exp(-bandv * bandv);
      let rim = clamp((g * 3 - 0.12) * 1.1, 0, 1) * (c < 0.4 ? 1 : c > 1.2 ? 0 : (1.2 - c) / 0.8);
      A[i] = c * (1 + 0.5 * rim) * G[i] + 0.9 * tide;
    }
  }
  // a tent filter at dye resolution: the bilinear upsample of a sharp front would show stair steps
  const A2 = new Float32Array(m);
  for (let y = 0; y < DY; y++) {
    const up = y > 0 ? -DX : 0, dn = y < DY - 1 ? DX : 0;
    for (let x = 0, i = DX * y; x < DX; x++, i++) {
      const l = x > 0 ? -1 : 0, r = x < DX - 1 ? 1 : 0;
      A2[i] = (4 * A[i] + 2 * (A[i + l] + A[i + r] + A[i + up] + A[i + dn]) + A[i + up + l] + A[i + up + r] + A[i + dn + l] + A[i + dn + r]) / 16;
    }
  }
  A.set(A2);
  // late haze: ink that has left the drops clouds the water around them (a wide blur of c), so the last gaps fill
  // from their surroundings instead of the paper fading as one
  const hk = sm(4.8, 7.0, b);
  if (hk > 0) {
    const Hz = boxBlur(boxBlur(C, DX, DY, Math.round(DX / 48)), DX, DY, Math.round(DX / 48));
    const thr = 0.75 - 0.6 * hk;
    for (let i = 0; i < m; i++) { const h = sm(thr, thr + 0.25, Hz[i]) * (0.35 + 0.7 * hk); if (h > A[i]) A[i] = h; }
  }
  const P = hex(pal.paper), K = hex(pal.accent);
  // two layers of absorbance: up to c = 1 the paper turns into the accent; beyond, the accent deepens toward navy
  const Dp = [K[0] * 0.14, K[1] * 0.2, K[2] * 0.4];
  const ab = [0, 1, 2].map((ch) => -Math.log(Math.max(K[ch], 3) / P[ch]));
  const dp = [0, 1, 2].map((ch) => -Math.log(Math.max(Dp[ch], 2) / Math.max(K[ch], 3)));
  // colour LUT over absorbance 0..4
  const LN = 2048, LS = LN / 4, lut = [new Uint8Array(LN), new Uint8Array(LN), new Uint8Array(LN)];
  for (let i = 0; i < LN; i++) for (let ch = 0; ch < 3; ch++) { const a = i / LS; lut[ch][i] = clamp(Math.round(P[ch] * Math.exp(-ab[ch] * Math.min(a, 1) - dp[ch] * Math.max(a - 1, 0) * 0.8)), 0, 255); }
  const fl = view.flat, z = view.zoom, sx = DX / 1920, sy = DY / 1080;
  const dk = 1 - sm(0.5, 1.05, b);        // the slam's crisp dot, until the drop is released
  for (let py = 0, o = 0; py < H; py++) {
    const fyp = view.cy + ((py + 0.5) * 1080 / H - 540) / z;
    let gy = fyp * sy - 0.5; if (gy < 0) gy = 0; if (gy > DY - 1.001) gy = DY - 1.001;
    const y0 = gy | 0, ty = gy - y0;
    for (let px = 0; px < W; px++, o += 4) {
      const fxp = view.cx + ((px + 0.5) * 1920 / W - 960) / z;
      let gx = fxp * sx - 0.5; if (gx < 0) gx = 0; if (gx > DX - 1.001) gx = DX - 1.001;
      const x0 = gx | 0, tx = gx - x0, q = x0 + DX * y0;
      let a = (1 - ty) * ((1 - tx) * A[q] + tx * A[q + 1]) + ty * ((1 - tx) * A[q + DX] + tx * A[q + DX + 1]);
      // pigment granulation, fixed to the paper (film px), strongest in thin washes
      if (a > 0.01) a *= 1 + 0.09 * (hash2((fxp * 0.7) | 0, (fyp * 0.7) | 0) - 0.5) / (0.6 + a);
      if (dk > 0) { const d = Math.hypot(fxp - SUMI.dot.x, fyp - SUMI.dot.y) - SUMI.dot.r; if (d < 1) { const cv = clamp(0.5 - d * z, 0, 1) * dk; a = a * (1 - dk) + cv; } }
      let li = (a * LS) | 0; if (li > LN - 1) li = LN - 1;
      let r = lut[0][li], g = lut[1][li], bl = lut[2][li];
      if (fl > 0) { r += (K[0] - r) * fl; g += (K[1] - g) * fl; bl += (K[2] - bl) * fl; }
      out[o] = r; out[o + 1] = g; out[o + 2] = bl; out[o + 3] = 255;
    }
  }
}

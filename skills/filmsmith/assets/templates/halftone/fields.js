// fields.js — the procedural background fields (PLAN: concentric, interference, quantised). Every field is a tone
// function centred on the anchor A, printed by screen.js; nothing is an image. A field is one generating function
// whose parameters change (wavelength, number of sources, quantisation), never a picture swapped for another
// (ordered dither and halftone: Bayer 1973, Ulichney 1987).
//
// Density (owner, 2026-10-19: the sample's first screen "too dense, fills everything"): every field
//   · keeps a clear disc of paper round the anchor (r0), so the anchor is the focal point,
//   · peaks at tone M ≤ 0.5 (a dot at most 0.8 of the pitch across, so paper always shows between dots),
//   · fades to nothing R px from the anchor and never enters the text column (x < COL),
// so a field covers about a sixth of the frame or less; the opening (hook) prints coarser and lighter still.
// Kinds (TEMPLATE.md, Fields):
//   rings   one source: concentric rings that step outward one wavelength per beat
//   cross   two or three sources switched on one per beat: their rings interfere
//   cells   the same sources split into cells (Voronoi) with a paper gutter; each cell its own clean rings; one
//           cell is darker each beat (the active one)
//   count   cells round the anchor, one more per counted step (golden-angle placement)
//   rows    rows of word blocks that scroll up one row a beat (a log, a transcript, a feed)
//   wave    a waveform of vertical bars that advances one bar group a beat
//   grid    a grid of cells; one more cell turns solid each beat (tests passing, tiles done)
//   none    paper only

import { hash } from './lib/rng.js';

export const KINDS = ['rings', 'cross', 'cells', 'count', 'rows', 'wave', 'grid', 'none'];
export const COL = 1060; // fields start right of this x (the text column stays paper)

const TAU = Math.PI * 2;
const cl = (x, a = 0, z = 1) => Math.min(z, Math.max(a, x));
const smooth = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };

// a field's default parameters (px at 1080; λ wavelength, R fade radius, M peak tone, r0 clear disc)
export const DEF = { lam: 104, R: 560, M: 0.5, r0: 150, pitch: 14 };
// the opening prints coarser and lighter (owner, 2026-10-19): 24 px screen, peak 0.36, three rings
export const HOOK = { lam: 128, R: 470, M: 0.36, r0: 190, pitch: 24 };

// the extra sources of `cross` and `cells`, as offsets from the anchor (px)
const SOURCES = [[0, 0], [-250, 260], [220, -280]];
// golden-angle placement of n sources round the anchor for `count`, inside a 520 px disc
export const spiral = (A, n) => Array.from({ length: n }, (_, k) => {
  if (k === 0) return [A[0], A[1]];
  const r = 150 * Math.sqrt(k), th = k * 2.39996 + 0.6;
  return [A[0] + r * Math.cos(th), A[1] + r * Math.sin(th) * 0.86];
});

const envelope = (x, y, A, o) => {
  const d = Math.hypot(x - A[0], y - A[1]);
  return { d, e: cl(1 - (d - o.r0) / (o.R - o.r0)) * smooth(COL, COL + 140, x) * smooth(o.r0 - 30, o.r0 + 30, d) };
};
const ring = (d, lam, ph) => 0.5 - 0.5 * Math.cos((TAU * d) / lam - TAU * ph);

// tone(x, y) for a field. st = { A, ph (beats, stepped), k (beat index), on (0..1 per source for cross),
// n (count), seed, cut (0..1 gutter), o: params }
export const toneOf = (kind, st) => {
  const { A, o } = st;
  const lam = o.lam, M = o.M;
  switch (kind) {
    case 'rings':
      return (x, y) => {
        const { d, e } = envelope(x, y, A, o);
        return e > 0 ? M * e * ring(d - o.r0, lam, st.ph) : 0;
      };
    case 'cross': {
      const S = SOURCES.map(([dx, dy]) => [A[0] + dx, A[1] + dy]);
      const on = st.on ?? [1, 1, 1];
      return (x, y) => {
        const { e } = envelope(x, y, A, { ...o, R: o.R + 60 });
        if (e <= 0) return 0;
        let h = 0, w = 0;
        S.forEach(([sx, sy], k) => {
          const a = on[k] ?? 0;
          if (a <= 0) return;
          const d = Math.hypot(x - sx, y - sy);
          // a source's rings arrive as a front that travels out from it
          const f = k === 0 ? 1 : cl((a * 1600 - d) / 90);
          if (f <= 0) return;
          h += f * Math.cos((TAU * d) / lam - TAU * st.ph); w += f;
        });
        // only the crests print: where the waves cancel the paper shows (interference, not a grey wash)
        return w > 0 ? M * e * Math.pow(0.5 + 0.5 * h / Math.max(1, w), 2.2) * 1.25 : 0;
      };
    }
    case 'cells':
    case 'count': {
      const S = kind === 'count' ? spiral(A, Math.max(1, st.n | 0)) : SOURCES.map(([dx, dy]) => [A[0] + dx, A[1] + dy]);
      const cut = st.cut ?? 1, gut = 26 * cut;
      const act = kind === 'cells' ? ((st.k ?? 0) % S.length + S.length) % S.length : -1;
      return (x, y) => {
        const { e } = envelope(x, y, A, { ...o, R: o.R + (kind === 'count' ? -40 : 60) });
        if (e <= 0) return 0;
        let d0 = Infinity, d1 = Infinity, k0 = 0;
        S.forEach(([sx, sy], k) => {
          const d = Math.hypot(x - sx, y - sy);
          if (d < d0) { d1 = d0; d0 = d; k0 = k; } else if (d < d1) d1 = d;
        });
        if (S.length > 1 && d1 - d0 < gut) return 0; // the gutter between two cells is paper
        const lamC = kind === 'count' ? lam * 0.62 : lam;
        const amp = act < 0 ? 0.84 : k0 === act ? 1 : 0.62;
        const inner = kind === 'count' ? smooth(18, 46, d0) : 1;
        return M * e * amp * inner * ring(d0, lamC, st.ph);
      };
    }
    case 'rows': {
      // laid out in cells of Q px from the anchor, so the quantized version (film.js blocks, Q = 23) lands on whole
      // blocks: a row is one cell high with one cell of gap; words are runs of 2–6 cells with one-cell spaces
      const Qc = 23, rowH = 2 * Qc, c0 = -16, c1 = 16;
      return (x, y) => {
        const cx = Math.floor((x - A[0]) / Qc + 0.5), cy = (y - A[1]) / Qc + 0.5;
        if (cx < c0 || cx > c1) return 0;
        const r = cy / 2 + st.ph, j = Math.floor(r);           // rows scroll up one a beat
        if ((r - j) * rowH >= Qc) return 0;                     // the gap under each row
        if (Math.abs(j - st.ph) > 5.5) return 0;
        const amp = M * 1.3 * fade(j - st.ph);
        if (cx === c0) return 1.1 * amp;                        // the speaker tick
        let c = c0 + 2;
        for (let w = 0; w < 12 && c <= c1; w++) {
          const len = 2 + Math.floor(5 * hash(j * 31 + w, st.seed));
          if (cx >= c && cx < Math.min(c1 + 1, c + len)) return (0.6 + 0.3 * hash(j * 7 + w, st.seed + 1)) * amp;
          c += len + 1;
        }
        return 0;
      };
    }
    case 'wave': {
      const bw = 26, n = 34, x0 = A[0] - (n * bw) / 2;
      return (x, y) => {
        const i = Math.floor((x - x0) / bw);
        if (i < 0 || i >= n || x - x0 - i * bw > bw - 8) return 0;
        const g = i + Math.floor(st.ph) * 4;           // advances one group of four bars a beat
        const amp = 60 + 300 * Math.pow(hash(g, st.seed), 1.6) * (0.4 + 0.6 * Math.abs(Math.sin(g * 0.37)));
        const dy = Math.abs(y - A[1]);
        if (dy > amp) return 0;
        const edge = smooth(0, 1, Math.abs(i - n / 2) / (n / 2));
        return M * 1.25 * (1 - 0.5 * dy / amp) * (1 - 0.6 * edge) * smooth(COL, COL + 140, x);
      };
    }
    case 'grid': {
      const cs = 92, nx = 7, ny = 6, gx = A[0] - (nx * cs) / 2, gy = A[1] - (ny * cs) / 2;
      const done = Math.max(0, Math.floor(st.ph) + 4);
      return (x, y) => {
        const i = Math.floor((x - gx) / cs), j = Math.floor((y - gy) / cs);
        if (i < 0 || i >= nx || j < 0 || j >= ny || x - gx - i * cs > cs - 16 || y - gy - j * cs > cs - 16) return 0;
        const order = Math.floor(hash(i * 13 + j, st.seed) * nx * ny);
        const solid = order < done * 2;
        return solid ? Math.min(1, M * 1.8) : M * (0.35 + 0.35 * hash(i, j + st.seed));
      };
    }
    default:
      return () => 0;
  }
};
const fade = (dj) => cl(1 - (Math.abs(dj) - 4) / 1.5);

// A tone that moves from field `a` to field `b` behind a front running out from the anchor (u in 0..1): one
// field, new parameters, so the dots resize; nothing is cross-faded.
export const morphTone = (a, b, A, u, width = 220) => {
  if (u <= 0) return a;
  if (u >= 1) return b;
  const R = u * (2200 + width) - width;
  return (x, y) => {
    const k = cl((R - Math.hypot(x - A[0], y - A[1])) / width);
    return k <= 0 ? a(x, y) : k >= 1 ? b(x, y) : a(x, y) * (1 - k) + b(x, y) * k;
  };
};

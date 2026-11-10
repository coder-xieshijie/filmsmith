// converge-mark — the film's own pieces fly along arcs into the cells of the product's mark; a thin target ring draws
// itself on the one empty cell, and the last piece (the mode's dot) hops in and becomes the mark's dot. Pieces are
// assigned to cells by the shortest total path, which never crosses (a minimum-length matching has no crossing
// segments), and the arcs bow only as far as they stay apart. Theory: common fate, then closure; the ring cues where
// to look before the landing (Posner 1980). references/transitions.md#converge-mark.

import { seg, lerp, clamp, cubicInOut, cubicOut, ground } from './util.js';
import { polylinesCross } from './paths.js';

const LOCAL = 1.25;   // seconds at the approved tempo; the hand-off scales with its beats
const RING = 0.75, DROP = [0.95, 1.25], CLOSE = [1.13, 1.25];

const quad = (a, c, b, u) => {
  const k0 = (1 - u) * (1 - u), k1 = 2 * u * (1 - u), k2 = u * u;
  return [k0 * a[0] + k1 * c[0] + k2 * b[0], k0 * a[1] + k1 * c[1] + k2 * b[1]];
};
const control = (a, b, bend) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  return [mx - (dy / L) * bend * L, my + (dx / L) * bend * L];
};
const arcPts = (a, c, b) => Array.from({ length: 25 }, (_, i) => quad(a, c, b, i / 24));
const permutations = (n) => {
  if (n <= 1) return [[0]];
  const out = [];
  for (const p of permutations(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  return out;
};

export default {
  name: 'converge-mark',
  tier: 'T3',
  beats: 2.5,
  modes: ['morph', 'thread', 'ink', 'plakat', 'blueprint', 'phosphor', 'tally', 'trace', 'halftone', 'pulse'],
  roles: ['ground', 'ink', 'accent'],
  from: 'pieces scattered over the frame (this film\'s own nodes, squares, letters) and the dot',
  to: 'the product mark built from them, the dot landing last',
  interpolates: ['each piece along its arc (stretched along its velocity while fast)', 'piece size', 'target ring sweep and close', 'the dot\'s hop'],
  summary: 'The film\'s pieces fly along arcs into the cells of the mark; a ring marks the empty cell and the dot lands in it last.',
  theory: 'Common fate, then closure (Wertheimer 1923); a cue at the landing place shortens the search for it (Posner 1980).',
  defaults: {
    pieces: [                            // kind 'c' circle or 's' square; at = start, r = start radius
      { kind: 'c', at: [560, 430], r: 34 }, { kind: 'c', at: [960, 430], r: 34 }, { kind: 'c', at: [1360, 430], r: 34 },
      { kind: 's', at: [760, 690], r: 32 }, { kind: 's', at: [1160, 690], r: 32 },
    ],
    targets: [                           // the mark's cells: centre and half size
      { at: [506, 486], r: 46 }, { at: [614, 486], r: 46 }, { at: [722, 486], r: 46 },
      { at: [506, 594], r: 46 }, { at: [614, 594], r: 46 },
    ],
    dot: { at: [960, 430], r: 14, to: [722, 594], r1: 26 },
    assign: 'shortest',                  // 'shortest' (no crossings) or 'given' (piece i → target i)
    bend: 0.32,                          // largest arc bow, as a share of the flight length
    dur: null,                           // seconds the hand-off lasts (for the velocity stretch); default beats at 120 BPM
    colors: { ground: '#EDEFF2', ink: '#15171A', accent: '#6A3DF0' },
  },
  prepare(P) {
    const n = P.pieces.length;
    let order = P.pieces.map((_, i) => i);
    if (P.assign === 'shortest' && n <= 8) {
      let best = Infinity;
      for (const perm of permutations(n)) {
        let s = 0;
        for (let i = 0; i < n; i++) s += Math.hypot(P.targets[perm[i]].at[0] - P.pieces[i].at[0], P.targets[perm[i]].at[1] - P.pieces[i].at[1]);
        if (s < best - 1e-6) { best = s; order = perm; }
      }
    }
    // the largest bow (either side) at which no two arcs cross
    let bend = 0;
    for (const b of [1, -1, 0.75, -0.75, 0.5, -0.5, 0.25, -0.25].map((k) => k * P.bend)) {
      const arcs = P.pieces.map((q, i) => arcPts(q.at, control(q.at, P.targets[order[i]].at, b), P.targets[order[i]].at));
      let ok = true;
      for (let i = 0; i < n && ok; i++) for (let j = i + 1; j < n && ok; j++) if (polylinesCross(arcs[i], arcs[j])) ok = false;
      if (ok) { bend = b; break; }
    }
    // the farthest leaves first; flights are 0.36 s + distance / 1500 px/s, all landed before the dot drops
    const flights = P.pieces.map((q, i) => {
      const to = P.targets[order[i]], dist = Math.hypot(to.at[0] - q.at[0], to.at[1] - q.at[1]);
      return { q, to, dist, c: control(q.at, to.at, bend) };
    }).sort((a, b) => b.dist - a.dist);
    flights.forEach((f, i) => { f.t0 = i * 0.06; f.dur = Math.min(0.36 + f.dist / 1500, DROP[0] - f.t0); });
    // the dot bows to the side away from the mark's centre, so it passes outside the other cells
    const cx = P.targets.reduce((a, t) => a + t.at[0], 0) / P.targets.length, cy = P.targets.reduce((a, t) => a + t.at[1], 0) / P.targets.length;
    const d0 = P.dot.at, d1 = P.dot.to, cA = control(d0, d1, 0.25), cB = control(d0, d1, -0.25);
    const dc = Math.hypot(cA[0] - cx, cA[1] - cy) > Math.hypot(cB[0] - cx, cB[1] - cy) ? cA : cB;
    return { flights, dc };
  },
  rest(side, P, D) {
    const end = side === 'to';
    return {
      pieces: D.flights.map((f) => ({ x: end ? f.to.at[0] : f.q.at[0], y: end ? f.to.at[1] : f.q.at[1], r: end ? f.to.r : f.q.r, ang: 0, st: 1 })),
      dot: { x: end ? P.dot.to[0] : P.dot.at[0], y: end ? P.dot.to[1] : P.dot.at[1], r: end ? P.dot.r1 : P.dot.r, ang: 0, st: 1 },
      ring: null,
    };
  },
  at(p, P, D) {
    const t = p * LOCAL, durS = P.dur ?? (2.5 * 60) / 120, k = LOCAL / durS;   // local s per film s
    const fly = (u, a, c, b) => quad(a, c, b, cubicInOut(u));
    const vel = (u, a, c, b, span) => {
      const h = 1e-3, p0 = fly(Math.max(0, u - h), a, c, b), p1 = fly(Math.min(1, u + h), a, c, b);
      const sp = (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / (2 * h)) / span * k;   // px per film second
      return { st: 1 + Math.min(0.9, sp / 3200), ang: sp > 1 ? Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) : 0 };
    };
    const pieces = D.flights.map((f) => {
      const u = seg(t, f.t0, f.t0 + f.dur);
      if (u >= 1) return { x: f.to.at[0], y: f.to.at[1], r: f.to.r, ang: 0, st: 1 };
      const [x, y] = fly(u, f.q.at, f.c, f.to.at), v = u > 0 ? vel(u, f.q.at, f.c, f.to.at, f.dur) : { st: 1, ang: 0 };
      return { x, y, r: lerp(f.q.r, f.to.r, cubicOut(u)), ...v };
    });
    const du = seg(t, ...DROP);
    let dot;
    if (du >= 1) dot = { x: P.dot.to[0], y: P.dot.to[1], r: P.dot.r1, ang: 0, st: 1 };
    else {
      const [x, y] = fly(du, P.dot.at, D.dc, P.dot.to), v = du > 0 ? vel(du, P.dot.at, D.dc, P.dot.to, DROP[1] - DROP[0]) : { st: 1, ang: 0 };
      dot = { x, y, r: lerp(P.dot.r, P.dot.r1, cubicOut(du)), ...v, st: Math.min(1.7, v.st) };
    }
    const close = cubicOut(seg(t, ...CLOSE));
    const ring = t >= RING && close < 1 ? { sweep: cubicOut(seg(t, RING, RING + 0.2)), r: lerp(P.dot.r1 * 1.7, P.dot.r1, close) } : null;
    return { pieces, dot, ring };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors;
    // a piece stretched along its velocity while fast, upright otherwise
    const shape = (kind, s, color) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      if (s.st > 1) { ctx.rotate(s.ang); ctx.scale(s.st, 1 / Math.sqrt(s.st)); ctx.rotate(-s.ang); }
      ctx.fillStyle = color; ctx.beginPath();
      if (kind === 'c') ctx.arc(0, 0, s.r, 0, Math.PI * 2); else ctx.rect(-s.r, -s.r, 2 * s.r, 2 * s.r);
      ctx.fill(); ctx.restore();
    };
    D.flights.forEach((f, i) => shape(f.q.kind, S.pieces[i], C.ink));
    if (S.ring) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(P.dot.to[0], P.dot.to[1], S.ring.r, -Math.PI / 2, -Math.PI / 2 + S.ring.sweep * Math.PI * 2); ctx.stroke();
    }
    shape('c', S.dot, C.accent);
  },
  track: (S) => [...S.pieces.map((q) => [q.x, q.y]), [S.dot.x, S.dot.y]],
};

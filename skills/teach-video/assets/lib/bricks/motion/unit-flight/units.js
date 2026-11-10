// units.js — the engine of the tally bricks: one square per item, the layouts the same squares take (grid, sorted grid,
// bands, share, period columns, axis, closing rule), the mark-then-fly move between two layouts, the wave entrance,
// the marks (square, dot, pictograms), and the type helpers the tally scenes share. Pure: every function is of its
// arguments; the scenes (scene/unit-*) and the unit-flight motion import it.
// From the tally template (assets/templates/tally/layouts.js, squares.js, marks.js, fx.js): geometry, timings and
// the mark rules are the template's; the data model is reduced to what a brick can take as slots (groups with counts,
// periods with counts, one protagonist group).
import { clamp, lerp, mix, rgba, text, measure } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { cubicInOut, cubicOut, smooth } from '../../../motion.js';
import { fontFor, caseOf, wrap, graphemes, readTime } from '../../lang.js';
import LOOK from '../../look/unit-ledger/look.js';

export const ROLE = { hidden: 0, base: 1, rest: 2, accent: 3 };
export const MX = 96, RX = 1824, CW = RX - MX, TOP = 330, TITLE_Y = 206, SUB_Y = 256;
export const TIME = { flight: 1.4, mark: 0.5, depart: 0.6, group: 0.5, waveSpan: 2.05, waveGrow: 0.7 };

// ── colours: the look's roles; base and rest fall back to mixes of ink and ground in other looks ────────────────────
export const tones = (C) => ({
  [ROLE.base]: C.base || mix(C.ink, C.ground, 0.22),
  [ROLE.rest]: C.rest || mix(C.ink, C.ground, 0.6),
  [ROLE.accent]: C.accent,
});

// ── the data: items in data order, each with a group (seeded interleave, so a grid looks like a real registry) and a
// period (contiguous runs in data order, so the timeline reads in time) ─────────────────────────────────────────────
export const itemsOf = (P) => {
  const G = P.groups || [];
  const cnt = (g) => Math.max(0, Math.round(+g.count || 0)), N = G.reduce((a, g) => a + cnt(g), 0);
  const period = new Int16Array(N).fill(-1);
  const Ps = P.periods || [];
  if (Ps.length) {
    const tot = Ps.reduce((a, p) => a + p.count, 0) || 1;
    let k = 0, acc = 0;
    Ps.forEach((p, pi) => { acc += p.count; const end = pi === Ps.length - 1 ? N : Math.round((acc / tot) * N); for (; k < end; k++) period[k] = pi; });
  }
  const group = new Int16Array(N), seed = (P.seed ?? 3) + 11;
  const shuffle = (a, sd) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(hash(k, sd) * (k + 1)); const t = a[k]; a[k] = a[j]; a[j] = t; } return a; };
  // the protagonist's real count per period (`periods[i].accent`), when the data has the cross-tab: its items sit in
  // their own periods, the other groups are shuffled over the rest; otherwise every group is shuffled over all items
  const ag = P.accent, real = Ps.length && ag != null && G[ag] && Ps.every((p) => Number.isFinite(+p.accent)) && Ps.reduce((a, p) => a + Math.round(+p.accent), 0) === cnt(G[ag]);
  if (real) {
    const others = shuffle(G.flatMap((g, gi) => (gi === ag ? [] : Array.from({ length: cnt(g) }, () => gi))), seed);
    let o = 0;
    Ps.forEach((p, pi) => {
      const run = []; for (let k = 0; k < N; k++) if (period[k] === pi) run.push(k);
      shuffle(run, seed + pi + 1).forEach((k, j) => { group[k] = j < Math.round(+p.accent) ? ag : others[o++] ?? ag; });
    });
  } else {
    let i = 0;
    G.forEach((g, gi) => { for (let k = 0; k < cnt(g); k++) group[i++] = gi; });
    shuffle(group, seed);
  }
  return { N, group, period, counts: G.map(cnt) };
};

const place = (N) => ({ x: new Float32Array(N), y: new Float32Array(N), s: new Float32Array(N), role: new Uint8Array(N), rank: new Float32Array(N), grp: new Int16Array(N) });
const sizeOf = (p) => Math.max(2, Math.round(p * 0.79));
const fitGrid = (n, w, h, max = 30) => {
  for (let p = max; p >= 3; p -= 0.5) { const cols = Math.floor(w / p), rows = Math.ceil(n / cols); if (cols > 0 && rows * p <= h) return { p, cols, rows }; }
  const cols = Math.floor(w / 3); return { p: 3, cols, rows: Math.ceil(n / cols) };
};
export const GRID_BOX = { x0: 1000, y0: TOP, w: RX - 1000, h: 370 };
export const gridGeo = (n) => {
  const g = fitGrid(n, GRID_BOX.w, GRID_BOX.h, 26), s = sizeOf(g.p), x0 = RX - g.cols * g.p + (g.p - s);
  return { ...g, s, x0, y0: GRID_BOX.y0, pos: (r) => [x0 + (r % g.cols) * g.p, GRID_BOX.y0 + Math.floor(r / g.cols) * g.p] };
};

// ── layouts: where every square sits, its size, role, rank and group ───────────────────────────────────────────────
// lab(s) measures a label in the scene's label font (the bands' label column follows the widest label).
export const LAYOUTS = {
  // the whole set, in data order, in the right-hand grid (count)
  grid(I, P) {
    const L = place(I.N), G = gridGeo(I.N);
    for (let k = 0; k < I.N; k++) { const [x, y] = G.pos(k); L.x[k] = x; L.y[k] = y; L.s[k] = G.s; L.role[k] = ROLE.base; L.rank[k] = k / I.N; L.grp[k] = 0; }
    return { L, geo: { G } };
  },
  // the same grid re-sorted, the group `by` first in the accent, the rest in `rest` (split)
  sorted(I, P) {
    const L = place(I.N), G = gridGeo(I.N), by = P.by ?? P.accent ?? 0;
    const inn = [], out = [];
    for (let k = 0; k < I.N; k++) (I.group[k] === by ? inn : out).push(k);
    [...inn, ...out].forEach((k, r) => {
      const [x, y] = G.pos(r), isIn = r < inn.length;
      L.x[k] = x; L.y[k] = y; L.s[k] = G.s; L.grp[k] = isIn ? 0 : 1;
      L.rank[k] = isIn ? r / inn.length : (r - inn.length) / out.length; L.role[k] = isIn ? ROLE.accent : ROLE.rest;
    });
    return { L, geo: { G, nIn: inn.length, nOut: out.length } };
  },
  // one band of squares per group, top first, the protagonist in the accent (columns)
  bands(I, P, lab) {
    const L = place(I.N), B = I.counts.length, names = (P.groups || []).map((g) => g.name);
    const labelRight = MX + Math.max(300, ...names.map((n) => lab(n)));
    const x0 = labelRight + 32, band = Math.min(74, 590 / B), maxN = Math.max(1, ...I.counts), room = RX - x0 - 420;
    let p = 14, rows = 1;
    for (p = 14; p >= 4; p -= 0.5) { rows = Math.max(1, Math.floor((band * 0.66) / p)); if (Math.ceil(maxN / rows) * p <= room) break; }
    const s = sizeOf(p), seen = new Array(B).fill(0);
    for (let k = 0; k < I.N; k++) {
      const gi = I.group[k], r = seen[gi]++;
      L.x[k] = x0 + Math.floor(r / rows) * p; L.y[k] = TOP + gi * band + (r % rows) * p; L.s[k] = s; L.grp[k] = gi;
      L.rank[k] = r / Math.max(1, I.counts[gi]); L.role[k] = gi === P.accent ? ROLE.accent : ROLE.base;
    }
    return { L, geo: { x0, band, p, rows, s, labelRight, endX: I.counts.map((n) => x0 + Math.ceil(n / rows) * p), yc: (gi) => TOP + gi * band + (rows * p - (p - s)) / 2 } };
  },
  // one block cut into segments, one per group, left to right (share): part of the whole
  share(I, P) {
    const L = place(I.N), K = I.counts.length, gaps = K - 1;
    let best = null;
    for (let rows = 6; rows <= 40; rows++) { const cols = I.counts.reduce((a, n) => a + Math.ceil(n / rows), 0) + gaps; const p = Math.min(CW / cols, 330 / rows, 26); if (!best || p > best.p) best = { rows, p }; }
    const { rows, p } = best, s = sizeOf(p), seen = new Array(K).fill(0), x0s = [];
    let x = MX;
    I.counts.forEach((n) => { x0s.push(x); x += (Math.ceil(n / rows) + 1) * p; });
    const y0 = 440;
    for (let k = 0; k < I.N; k++) {
      const gi = I.group[k], r = seen[gi]++;
      L.x[k] = x0s[gi] + Math.floor(r / rows) * p; L.y[k] = y0 + (r % rows) * p; L.s[k] = s; L.grp[k] = gi;
      L.rank[k] = (x0s[gi] - MX) / CW + (r / Math.max(1, I.counts[gi])) * 0.1; L.role[k] = gi === P.accent ? ROLE.accent : ROLE.base;
    }
    return { L, geo: { p, s, rows, y0, x0s, ends: I.counts.map((n, gi) => x0s[gi] + Math.ceil(n / rows) * p - (p - s)), h: rows * p - (p - s) } };
  },
  // a column per period, the protagonist's squares at the base of each column (timeline)
  periods(I, P) {
    const L = place(I.N), n = (P.periods || []).length || 1, per = new Array(n).fill(0);
    for (let k = 0; k < I.N; k++) per[Math.max(0, I.period[k])]++;
    const slot = CW / n, base = 860, hMax = 470, maxC = Math.max(1, ...per);
    let w = 1, p = 30;
    for (w = 1; w <= 20; w++) { p = Math.min(slot * 0.72 / w, 26); if (Math.ceil(maxC / w) * p <= hMax) break; }
    const s = sizeOf(p), colW = w * p - (p - s);
    const order = Array.from({ length: n }, () => []);
    for (let k = 0; k < I.N; k++) order[Math.max(0, I.period[k])].push(k);
    order.forEach((ks, pi) => {
      ks.sort((a, b) => (I.group[b] === P.accent) - (I.group[a] === P.accent) || a - b);
      const xc = MX + slot * pi + slot / 2 - colW / 2;
      ks.forEach((k, r) => {
        L.x[k] = xc + (r % w) * p; L.y[k] = base - s - Math.floor(r / w) * p; L.s[k] = s; L.grp[k] = pi;
        L.rank[k] = (pi + r / ks.length) / n; L.role[k] = I.group[k] === P.accent ? ROLE.accent : ROLE.base;
      });
    });
    return { L, geo: { slot, base, w, p, s, colW, per, top: per.map((c) => base - Math.ceil(c / w) * p + (p - s)), xc: (pi) => MX + slot * pi + slot / 2 } };
  },
  // the subset (group `within`, or all) shrinks into a vertical axis; the others drop and fade (axis)
  axis(I, P, lab) {
    const L = place(I.N), S = (P.series || []).length || 1, names = (P.series || []).map((s) => s.name);
    const axisX = MX + Math.max(260, ...names.map((n) => lab(n))) + 36, band = Math.min(82, 500 / S);
    const y0 = TOP - 14, y1 = TOP + S * band - band * 0.44 + 14;
    const sub = [];
    for (let k = 0; k < I.N; k++) if (P.within == null || P.within < 0 || I.group[k] === P.within) sub.push(k);
    const pitch = (y1 - y0) / Math.max(1, sub.length), sz = clamp(pitch * 0.8, 3, 10);
    for (let k = 0; k < I.N; k++) L.role[k] = ROLE.hidden;
    sub.forEach((k, r) => { L.x[k] = axisX - sz / 2; L.y[k] = y0 + r * pitch; L.s[k] = sz; L.role[k] = ROLE.base; L.rank[k] = r / sub.length; });
    return { L, geo: { axisX, band, sz, nSub: sub.length } };
  },
  // the closing rule: every square a 3 px tick in a line; the protagonist's squares (≤ 56) as beads under one number
  rule(I, P) {
    const L = place(I.N), beadsOf = P.beads ?? P.accent ?? -1, ruleY = 660, bead = 14, pitch = 18;
    const beads = [], line = [];
    for (let k = 0; k < I.N; k++) (I.group[k] === beadsOf ? beads : line).push(k);
    const useBeads = beads.length > 0 && beads.length <= 56;
    const all = useBeads ? line : [...line, ...beads], step = CW / Math.max(1, all.length);
    all.forEach((k, r) => { L.x[k] = MX + r * step; L.y[k] = ruleY - 1.5; L.s[k] = Math.max(2, Math.min(3, step * 0.8)); L.role[k] = ROLE.base; L.rank[k] = r / all.length; });
    const bx = P.beadX ?? 1340, perRow = Math.min(28, beads.length);
    if (useBeads) beads.forEach((k, r) => { L.x[k] = bx + (r % perRow) * pitch; L.y[k] = ruleY + 6 + Math.floor(r / perRow) * pitch; L.s[k] = bead; L.role[k] = ROLE.base; L.rank[k] = r / beads.length; L.grp[k] = 1; });
    return { L, geo: { ruleY, beads: useBeads ? beads.length : 0, bx, perRow, pitch, bead } };
  },
};
export const layout = (name, I, P, lab) => (LAYOUTS[name] || LAYOUTS.grid)(I, P, lab || ((s) => s.length * 15));

// ── the move: mark (colour in place, by rank), then fly (seeded arc, landing swell); or the wave entrance ──────────
// Times in beats from the start of the move. Returns, per item, when it departs and lands.
export const schedule = (I, A, B, { depart = 1, mark = 0, groupStep = TIME.group } = {}) => {
  const dep = new Float32Array(I.N), land = new Float32Array(I.N);
  for (let k = 0; k < I.N; k++) {
    const g = B.L.role[k] === ROLE.hidden ? 0 : B.L.grp[k];
    dep[k] = depart + g * groupStep + B.L.rank[k] * TIME.depart * 0.8 + hash(k, 29) * TIME.depart * 0.2;
    land[k] = dep[k] + TIME.flight;
  }
  return { dep, land, mark, end: Math.max(0, ...land) };
};
export const waveSchedule = (I) => {
  const dep = new Float32Array(I.N), land = new Float32Array(I.N);
  for (let k = 0; k < I.N; k++) { dep[k] = (k / Math.max(1, I.N - 1)) * (TIME.waveSpan - TIME.waveGrow); land[k] = dep[k] + TIME.waveGrow; }
  return { dep, land, end: TIME.waveSpan, wave: true };
};
// Items of group g landed by beat u (a band's value follows its landed squares).
export const landed = (I, S, B, g, u) => { let n = 0; for (let k = 0; k < I.N; k++) if (B.L.grp[k] === g && B.L.role[k] !== ROLE.hidden && S.land[k] <= u) n++; return n; };

// One square's pose at beat u: { x, y, s, col, a } (a = 0: not drawn).
export const pose = (k, u, I, A, B, S, C, T = tones(C)) => {
  const b = B.L;
  if (S.wave || !A) {
    const e = cubicOut((u - S.dep[k]) / TIME.waveGrow);
    if (e <= 0 || b.role[k] === ROLE.hidden) return null;
    const s = b.s[k] * lerp(0.3, 1, e);
    return { x: b.x[k] + (b.s[k] - s) / 2, y: b.y[k] + (b.s[k] - s) / 2, s, col: T[b.role[k]], a: e };
  }
  const a = A.L, r0 = a.role[k], r1 = b.role[k];
  if (r0 === ROLE.hidden && r1 === ROLE.hidden) return null;
  const e = cubicInOut((u - S.dep[k]) / TIME.flight);
  const alpha = lerp(r0 === ROLE.hidden ? 0 : 1, r1 === ROLE.hidden ? 0 : 1, e);
  if (alpha <= 0.003) return null;
  const x0 = a.x[k], y0 = a.y[k], x1 = r1 === ROLE.hidden ? a.x[k] : b.x[k], y1 = r1 === ROLE.hidden ? a.y[k] + 40 : b.y[k];
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1;
  const arc = Math.sin(Math.PI * e) * (hash(k, 5) - 0.5) * Math.min(140, d * 0.3);
  let s = lerp(a.s[k], r1 === ROLE.hidden ? a.s[k] : b.s[k], e);
  let x = lerp(x0, x1, e) - (dy / d) * arc, y = lerp(y0, y1, e) + (dx / d) * arc;
  const v = ((u - S.dep[k]) / TIME.flight - 0.7) / 0.3;
  if (v > 0 && v < 1 && d > 2) { const ns = s * (1 + 0.1 * Math.sin(Math.PI * v)); x -= (ns - s) / 2; y -= (ns - s) / 2; s = ns; }
  const c0 = T[r0 === ROLE.hidden ? r1 : r0], c1 = T[r1 === ROLE.hidden ? r0 : r1];
  // mark, then move: the colour changes in place before departure, a short sweep by rank
  const m = smooth((u - (S.mark + b.rank[k] * 0.4 * TIME.mark)) / (0.6 * TIME.mark));
  return { x, y, s, col: c0 === c1 ? c0 : mix(c0, c1, m), a: alpha };
};

// ── marks: what one item looks like (one mark for the whole film) ────────────────────────────────────────────────
const GLYPHS = {
  doc: [[[0.14, 0], [0.54, 0], [0.54, 0.34], [0.86, 0.34], [0.86, 1], [0.14, 1]], [[0.62, 0], [0.86, 0.26], [0.62, 0.26]]],
  box: [[[0.5, 0.03], [0.92, 0.25], [0.5, 0.47], [0.08, 0.25]], [[0.06, 0.32], [0.46, 0.53], [0.46, 0.98], [0.06, 0.76]], [[0.94, 0.32], [0.54, 0.53], [0.54, 0.98], [0.94, 0.76]]],
  chip: [[[0.22, 0.22], [0.78, 0.22], [0.78, 0.78], [0.22, 0.78]], ...[0.31, 0.5, 0.69].flatMap((c) => [
    [[c - 0.05, 0.04], [c + 0.05, 0.04], [c + 0.05, 0.16], [c - 0.05, 0.16]], [[c - 0.05, 0.84], [c + 0.05, 0.84], [c + 0.05, 0.96], [c - 0.05, 0.96]],
    [[0.04, c - 0.05], [0.16, c - 0.05], [0.16, c + 0.05], [0.04, c + 0.05]], [[0.84, c - 0.05], [0.96, c - 0.05], [0.96, c + 0.05], [0.84, c + 0.05]]])],
};
export const MARKS = ['square', 'dot', 'glyph:doc', 'glyph:box', 'glyph:chip'];
export const drawMark = (ctx, mark, x, y, s, r = s * 0.18) => {
  if (!mark || mark === 'square') { ctx.beginPath(); ctx.roundRect(x, y, s, s, r); ctx.fill(); return; }
  if (mark === 'dot') { ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, (s * 1.128) / 2, 0, Math.PI * 2); ctx.fill(); return; }
  const g = GLYPHS[String(mark).replace('glyph:', '')] || GLYPHS.doc, u = smooth(clamp((s - 7) / 5));
  if (u < 1) { const a = ctx.globalAlpha; ctx.globalAlpha = a * (1 - u); ctx.beginPath(); ctx.roundRect(x, y, s, s, r); ctx.fill(); ctx.globalAlpha = a; if (u <= 0) return; }
  ctx.beginPath();
  for (const pts of g) { ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s); for (let i = 1; i < pts.length; i++) ctx.lineTo(x + pts[i][0] * s, y + pts[i][1] * s); ctx.closePath(); }
  ctx.fill();
};
// Draw every square of a move at beat u; extra(k, q) may change a pose (reveal pops, the closing light).
export const drawUnits = (ctx, u, I, A, B, S, C, mark, extra) => {
  const T = tones(C);
  for (let k = 0; k < I.N; k++) {
    let q = pose(k, u, I, A, B, S, C, T);
    if (!q) continue;
    if (extra) q = extra(k, q) || q;
    ctx.globalAlpha = q.a; ctx.fillStyle = q.col; drawMark(ctx, mark, q.x, q.y, q.s);
  }
  ctx.globalAlpha = 1;
};

// ── type: the look's roles per language; titles with *accent* words; fixed digit cells; capital mono labels ─────────
export const look = LOOK;
export const F = (role, lang, size, weight, kind) => fontFor(LOOK, role, lang, size, weight, kind);
export const labelFont = (lang, size) => F('mono', lang, size ?? LOOK.type.floors[lang === 'zh' ? 'zh' : 'en'].info, 400, 'label');
export const label = (s, lang) => caseOf(s, LOOK, 'label', lang).text;
export const secs = (beats, bpm) => (beats * 60) / bpm;
// fade in with a short rise over 0.35 s from beat t0; returns [alpha, dy]
export const enter = (u, t0, bpm, rise = 14) => { const t = secs(u - t0, bpm); return [cubicOut(t / 0.35), (1 - cubicOut(t / 0.5)) * rise]; };
export const pulse = (u, t0, bpm, d = 0.3) => Math.sin(Math.PI * clamp(secs(u - t0, bpm) / d));
// "*word*" spans → [{ s, accent }]
export const spans = (s) => String(s ?? '').split('*').map((x, i) => ({ s: x, accent: i % 2 === 1 })).filter((x) => x.s);
export const richWidth = (ctx, s, f) => spans(s).reduce((w, p) => w + measure(ctx, p.s, f).width, 0);
export const rich = (ctx, s, x, y, f, C, { color = C.ink, accent = C.accent, alpha = 1 } = {}) => {
  for (const p of spans(s)) { text(ctx, p.s, x, y, f, { color: p.accent ? accent : color, alpha }); x += measure(ctx, p.s, f).width; }
  return x;
};
// The title (64 px, fitted down to 44 to keep one line) and its capital mono sub, entering at beat t0.
export const title = (ctx, s, u, P, lang, bpm, { t0 = 0.25, a = 1, accentAt = null } = {}) => {
  if (!s.title) return;
  const C = s.colors;
  let size = 64;
  while (size > 44 && richWidth(ctx, s.title, F('display', lang, size, 700, 'display')) > CW) size -= 1;
  const [ea, dy] = enter(u, t0, bpm), f = F('display', lang, size, 700, 'display');
  // with accentAt, the accent words arrive on that beat (the roulette's lock, a reveal): the title names the protagonist then
  let x = MX;
  for (const p of spans(s.title)) {
    const [pa, pdy] = p.accent && accentAt != null ? enter(u, accentAt, bpm, 10) : [ea, dy];
    text(ctx, p.s, x, TITLE_Y + pdy, f, { color: p.accent ? C.accent : C.ink, alpha: pa * a });
    x += measure(ctx, p.s, f).width;
  }
  if (s.sub) { const [sa] = enter(u, t0 + 0.5, bpm, 0); text(ctx, label(s.sub, lang), MX, SUB_Y, labelFont(lang), { color: C.dim, alpha: sa * a }); }
};
// A number in fixed digit cells (no jitter while counting): returns its width.
export const digits = (ctx, n, x, y, f, color, { align = 'left', alpha = 1, fmt = (v) => Math.round(v).toLocaleString('en-US') } = {}) => {
  const s = fmt(n), cw = measure(ctx, '0', f).width;
  const w = graphemes(s).reduce((a, ch) => a + (/\d/.test(ch) ? cw : measure(ctx, ch, f).width), 0);
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  for (const ch of graphemes(s)) { const d = /\d/.test(ch), wd = d ? cw : measure(ctx, ch, f).width; text(ctx, ch, cx + (d ? wd / 2 : 0), y, f, { color, alpha, align: d ? 'center' : 'left' }); cx += wd; }
  return w;
};
export const lines = (ctx, s, f, maxW, lang) => wrap(ctx, s, f, maxW, lang);
// Readable copy: the protagonist's name for a key from a group, as the template's "HIGHLIGHTED: …"
export const dimMix = (C, u) => mix(C.ink, C.dim, clamp(u));
export { rgba, mix, clamp, lerp, smooth, cubicOut, hash };

// ── shared by the scenes: fonts, the ground, the move a scene makes from the previous layout into its own ──────────
import { radial, grainTile, grain } from '../../look/unit-ledger/texture.js';
import { canvasOf, scratch } from '../../../handoffs/util.js';
export const loadFonts = async (lang) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fams = new Set(Object.values(LOOK.type.families).flatMap((r) => r[lang] || r.en));
  for (const f of fams) for (const w of [400, 500, 600, 700, 800]) { try { await document.fonts.load(`${w} 40px "${f}"`, lang === 'zh' ? '中文 Aa 0' : 'Aa 0'); } catch (e) { /* not installed: the stack falls through */ } }
  if (document.fonts.ready) await document.fonts.ready;
};
// prepare() of a tally scene: the items, the layout it comes from (null: the wave), its own layout, the schedule.
export const setup = async (s, c, to, { from = s.from ?? 'grid', depart = 1, mark = 0, groupStep = TIME.group } = {}) => {
  await loadFonts(c.lang);
  const m = scratch(), lf = labelFont(c.lang), lab = (x) => measure(m, String(x), lf).width; // data names are set as written (only the frame's labels take capitals)
  const I = itemsOf(s), B = layout(to, I, s, lab), A = from ? layout(from, I, { ...s, ...(s.fromParams || {}) }, lab) : null;
  const S = A ? schedule(I, A, B, { depart, mark, groupStep }) : waveSchedule(I);
  let tile = null;
  if (s.grain !== 0 && typeof document !== 'undefined') tile = grainTile(canvasOf(256, 256), s.seed ?? 3);
  return { I, A, B, S, tile, lab };
};
export const paintGround = (ctx, s, D) => { if (s.ground === false) return; radial(ctx, s.colors); grain(ctx, D.tile, s.grain ?? 0.05); };
export { readTime };

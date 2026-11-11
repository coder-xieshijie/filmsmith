// kit.js — what the blueprint-zoom bricks share (sketch-node, msg-chip, layer-zoom, msg-hop, layer-overview,
// detail-walk): the rough node (outline and hachure, drawn on in order), the layer band, the loop (a pill that becomes a
// circle, its hachure clipped to it, an orbit marking a round), the clean connector with two-stroke arrowheads, the
// message chip and its travel along a path (resting in the gap between two parts, fading as it slides under one), the
// overview diagram's layout. Text, windows, eases and paths come from the paper-ledger kit (both kits share one source
// and share the paper, the ink, the window and the type). Every value is the kit's (assets/kits/blueprint-zoom/starter: tokens.js, style.css, components/*.js), redrawn in Canvas2D; a frame depends only
// on its arguments and t (seconds). The rough strokes follow Rough.js's idea (bowed, doubled, jittered lines and hachure
// at −41°, gap 8, roughness 1.05, bowing 0.9; MIT) with this kit's own deterministic generator, not its code.
import { W, H, E, tw, kf, lerp, clamp, mix, rgba, rrect, hash, mulberry32, say, widthOf, sz, drawChapter, drawTag, drawTerm, drawTyped, typedOf, sample, lengths, pointAt, strokePart, chevron, tick } from '../paper-ledger/kit.js';

export { W, H, E, tw, kf, lerp, clamp, mix, rgba, rrect, hash, mulberry32, say, widthOf, sz, drawChapter, drawTag, drawTerm, drawTyped, typedOf, sample, lengths, pointAt, strokePart, chevron, tick };
export const BP = { roughness: 1.05, bowing: 0.9, gap: 8, angle: -41, push: 1.55, zoomD: 1.3 };
export const PAL = (C, c) => ({ S: C[c + 'S'] || C.line, H: C[c + 'H'] || C.faint, B: C[c + 'B'] || C.panel, T: C[c + 'T'] || C[c + 'B'] || C.panel });

// ── rough strokes ───────────────────────────────────────────────────────────────────────────────────────────────────
// one bowed, jittered line p→q (a cubic, sampled), as Rough.js draws a side: endpoints moved up to `off` px, the middle
// bowed by bowing × len / 200 and jittered
const roughLine = (r, [x0, y0], [x1, y1], off, bow = BP.bowing) => {
  const len = Math.hypot(x1 - x0, y1 - y0), j = () => (r() * 2 - 1) * off, nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1);
  const b = (r() * 2 - 1) * bow * BP.roughness * Math.min(len, 200) / 40;
  const a = [x0 + j(), y0 + j()], d = [x1 + j(), y1 + j()];
  const c1 = [lerp(a[0], d[0], 0.33) + nx * b + j(), lerp(a[1], d[1], 0.33) + ny * b + j()], c2 = [lerp(a[0], d[0], 0.67) + nx * b + j(), lerp(a[1], d[1], 0.67) + ny * b + j()];
  return sample([['M', ...a], ['C', ...c1, ...c2, ...d]], Math.max(6, Math.round(len / 24)));
};
// hachure segments across a box at BP.angle, BP.gap apart (each a jittered line), in drawing order
const hatchSegs = (r, [x, y, w, h], gap = BP.gap, ang = BP.angle) => {
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2, out = [];
  for (let o = -R + gap / 2; o <= R; o += gap) {
    const px = cx + nx * o, py = cy + ny * o; let t0 = -1e9, t1 = 1e9;
    for (const [p, d, lo, hi] of [[px, dx, x, x + w], [py, dy, y, y + h]]) { if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) { t0 = 1; t1 = 0; } continue; } const u0 = (lo - p) / d, u1 = (hi - p) / d; t0 = Math.max(t0, Math.min(u0, u1)); t1 = Math.min(t1, Math.max(u0, u1)); }
    if (t1 - t0 > 2) out.push(roughLine(r, [px + dx * t0, py + dy * t0], [px + dx * t1, py + dy * t1], 0.8, 0.3));
  }
  return out;
};
const CACHE = new Map();
// a rough rectangle in local coordinates [0, 0, w, h]: { outline: polyline (each side twice), hatch: [polylines] }
export const roughRect = (w, h, seed = 1, hatchBox = null) => {
  const key = `${w}|${h}|${seed}|${hatchBox}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const r = mulberry32(seed || 1), P = [[0, 0], [w, 0], [w, h], [0, h]], outline = [];
  for (const off of [2 * BP.roughness, 1.2 * BP.roughness]) for (let i = 0; i < 4; i++) outline.push(...roughLine(r, P[i], P[(i + 1) % 4], off));
  const v = { outline, hatch: hatchSegs(r, hatchBox || [0, 0, w, h]) };
  CACHE.set(key, v); return v;
};
// draw a share of polylines in order (as drawSVG on one path): u 0–1 of their total length
export const strokeSeq = (ctx, lines, u) => {
  if (u <= 0) return;
  const lens = lines.map((p) => lengths(p)), tot = lens.reduce((a, l) => a + l[l.length - 1], 0);
  let left = u * tot;
  lines.forEach((p, i) => { const L0 = lens[i][lens[i].length - 1]; if (left <= 0) return; strokePart(ctx, p, 0, Math.min(1, left / L0), lens[i]); left -= L0; });
};

// ── node, band, loop ─────────────────────────────────────────────────────────────────────────────────────────────────
// timing of a part drawn on at t0 (the kit's nodeIn): backing 0.25 s, outline d, hachure from +0.1 over d + 0.1, label +0.15
export const inState = (t, t0, d = 0.45) => ({ bg: tw(t, t0, 0.25, E.p1o), outline: tw(t, t0, d, E.p2io), hatch: tw(t, t0 + 0.1, d + 0.1, E.p1io), lab: tw(t, t0 + 0.15, 0.3, E.p2o) });
export const SHOWN = { bg: 1, outline: 1, hatch: 1, lab: 1 };
// a pulse at t (scale 1.05 over 0.18 s, back over 0.3 s from +0.22)
export const pulseK = (t, ts = [], k = 1.05) => ts.reduce((s, p) => s * (t < p + 0.22 ? lerp(1, k, tw(t, p, 0.18, E.p2o)) : lerp(k, 1, tw(t, p + 0.22, 0.3, E.p2io))), 1);
// a node's label: the title and an optional secondary line on a light backing, centred in [0, 0, w, h]
const nodeLabel = (ctx, C, L, n, w, h, a) => {
  if (a <= 0) return;
  const tp = n.size || 36, sp = sz(n.subSize || 26, L), gap = 6, th = Math.round(tp * 1.2), sh = Math.round(sp * 1.2), tot = th + (n.sub ? gap + sh : 0), y0 = h / 2 - tot / 2;
  say(ctx, n.title, w / 2, y0, L, tp, C.ink, { lh: th, align: 'center', alpha: a, blur: (1 - a) * 6 });
  if (n.sub) {
    const sw = widthOf(ctx, n.sub, L, sp) + 16;
    ctx.save(); ctx.globalAlpha *= a * 0.86; rrect(ctx, w / 2 - sw / 2, y0 + th + gap + (n.subDy || 0), sw, sh, 5); ctx.fillStyle = C.subBack; ctx.fill(); ctx.restore();
    say(ctx, n.sub, w / 2, y0 + th + gap + (n.subDy || 0), L, sp, C.subInk, { lh: sh, align: 'center', alpha: a, blur: (1 - a) * 6 });
  }
};
// node { box: [x, y, w, h] (its layout), c (layer), title, sub, seed, size, subSize }; st from inState; at: the box it is shown
// in now (scaled from its layout box, the label with it); k: pulse scale
export const drawNode = (ctx, C, L, n, st = SHOWN, at = n.box, k = 1, alpha = 1) => {
  const [, , w, h] = n.box, p = PAL(C, n.c), R = roughRect(Math.round(w), Math.round(h), n.seed);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(at[0], at[1]); ctx.scale(at[2] / w, at[3] / h);
  ctx.translate(w / 2, h / 2); ctx.scale(k, k); ctx.translate(-w / 2, -h / 2);
  if (st.bg > 0) { ctx.save(); ctx.globalAlpha *= st.bg; rrect(ctx, 1.5, 1.5, w - 3, h - 3, 4); ctx.fillStyle = p.B; ctx.fill(); ctx.restore(); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = p.H; ctx.lineWidth = 1.3; strokeSeq(ctx, R.hatch, st.hatch);
  ctx.strokeStyle = p.S; ctx.lineWidth = 2.4; strokeSeq(ctx, [R.outline], st.outline);
  nodeLabel(ctx, C, L, n, w, h, st.lab);
  ctx.restore();
};
// band { box, c, name, sub, nameY }; st: { frame (drawn share), tint, name, sub, op (stroke opacity, 0.55) }; at: its box now
export const drawBand = (ctx, C, L, b, st, at = b.box, alpha = 1) => {
  const [x, y, w, h] = at, p = PAL(C, b.c), ny = b.nameY ?? 14;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (st.tint > 0) { ctx.save(); ctx.globalAlpha *= st.tint * (st.fill ?? 1); rrect(ctx, x, y, w, h, 12); ctx.fillStyle = p.T; ctx.fill(); ctx.restore(); }
  if (st.frame > 0) { const pts = sample([['M', x + 12, y], ['L', x + w - 12, y], ['Q', x + w, y, x + w, y + 12], ['L', x + w, y + h - 12], ['Q', x + w, y + h, x + w - 12, y + h], ['L', x + 12, y + h], ['Q', x, y + h, x, y + h - 12], ['L', x, y + 12], ['Q', x, y, x + 12, y]], 8); ctx.save(); ctx.globalAlpha *= st.op ?? 0.55; ctx.strokeStyle = p.S; ctx.lineWidth = 2; strokePart(ctx, pts, 0, st.frame); ctx.restore(); }
  if (st.name > 0) say(ctx, b.name, x + 24, y + ny, L, 30, p.S, { lh: 38, alpha: st.name, blur: (1 - st.name) * 6 });
  if (b.sub && st.sub > 0) b.sub.split('\n').forEach((s, i) => say(ctx, s, x + 24, y + ny + 42 + i * 30, L, 24, C.dim, { lh: 30, alpha: st.sub, blur: (1 - st.sub) * 6 }));
  ctx.restore();
};
export const bandIn = (t, t0) => ({ frame: tw(t, t0, 0.5, E.p2io), tint: tw(t, t0 + 0.1, 0.4, E.p1o), name: tw(t, t0 + 0.15, 0.3, E.p2o), sub: tw(t, t0 + 0.25, 0.3, E.p2o), op: 0.55 });
// loop { pill, circle, c, title, sub, seed }; st: { k (0 pill → 1 circle), bg, line, hatch, lab, lw (outline width), grey (0–1), subDy }
export const loopBox = (lp, k) => lp.pill.map((v, i) => lerp(v, lp.circle[i], k));
export const drawLoop = (ctx, C, L, lp, st) => {
  const p = PAL(C, lp.c), [x, y, w, h] = loopBox(lp, st.k), r = Math.min(w, h) / 2;
  const ux = Math.min(lp.pill[0], lp.circle[0]) - 10, uy = Math.min(lp.pill[1], lp.circle[1]) - 10, uw = Math.max(lp.pill[0] + lp.pill[2], lp.circle[0] + lp.circle[2]) + 10 - ux, uh = Math.max(lp.pill[1] + lp.pill[3], lp.circle[1] + lp.circle[3]) + 10 - uy;
  const R = roughRect(Math.round(uw), Math.round(uh), lp.seed || 3);
  ctx.save();
  if (st.bg > 0) { ctx.save(); ctx.globalAlpha *= st.bg; rrect(ctx, x, y, w, h, r); ctx.fillStyle = p.B; ctx.fill(); ctx.restore(); }
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip(); ctx.translate(ux, uy); ctx.globalAlpha *= lerp(1, 0.3, st.grey || 0); ctx.strokeStyle = p.H; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; strokeSeq(ctx, R.hatch, st.hatch); ctx.restore();
  if (st.line > 0) { const pts = roundPts(x, y, w, h, r); ctx.strokeStyle = mix(p.S, C.line, st.grey || 0); ctx.lineWidth = st.lw || 3; ctx.lineCap = 'round'; strokePart(ctx, pts, 0, st.line); }
  ctx.restore();
  if (st.lab > 0) { ctx.save(); ctx.translate(x, y); nodeLabel(ctx, C, L, { title: lp.title, sub: lp.sub, size: 36, subDy: st.subDy || 0 }, w, h, st.lab); ctx.restore(); }
};
// a rounded rectangle's outline as points, clockwise from the top left corner's end, the corners true quarter circles
const roundPts = (x, y, w, h, r, n = 24) => { const out = [], c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; out.push([x + r, y]); for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } out.push([x + r, y]); return out; };
// one turn drawn clockwise around the circle (0.6 s), then fading (0.3 s from +0.05)
export const drawOrbit = (ctx, C, lp, t, t0, d = 0.6) => {
  const u = tw(t, t0, d, E.p1io), a = 1 - tw(t, t0 + d + 0.05, 0.3, E.p1i);
  if (u <= 0 || a <= 0) return;
  const [x, y, w] = lp.circle, cx = x + w / 2, cy = y + w / 2, r = w / 2 + 9;
  ctx.save(); ctx.globalAlpha *= 0.75 * a; ctx.strokeStyle = PAL(C, lp.c).S; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); ctx.stroke(); ctx.restore();
};

// ── connectors and messages ──────────────────────────────────────────────────────────────────────────────────────────
// a clean line along path cmds (M/L/Q/C), drawn share u, two-stroke arrowheads (13 px, ±0.42 rad) at 'end' or 'both'
export const drawLine = (ctx, cmds, col, o = {}) => {
  const u = o.u ?? 1, a = o.alpha ?? 1, w = o.w || 2.5;
  if (u <= 0 || a <= 0) return;
  const pts = Array.isArray(cmds[0]?.[0]) || typeof cmds[0]?.[0] === 'number' ? cmds : sample(cmds, 16), Ls = lengths(pts), tot = Ls[Ls.length - 1];
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; strokePart(ctx, pts, 0, u, Ls);
  const hd = clamp((u * tot - (tot - 16)) / 16), head = (s0, s1) => { const [ax, ay] = pointAt(pts, s0 / tot, Ls), [bx, by] = pointAt(pts, s1 / tot, Ls), g = Math.atan2(by - ay, bx - ax), L0 = 13, A = 0.42; ctx.beginPath(); ctx.moveTo(bx - L0 * Math.cos(g - A), by - L0 * Math.sin(g - A)); ctx.lineTo(bx, by); ctx.lineTo(bx - L0 * Math.cos(g + A), by - L0 * Math.sin(g + A)); ctx.stroke(); };
  if (hd > 0) { ctx.globalAlpha *= hd; if (o.arrows === 'end' || o.arrows === 'both') head(tot - 6, tot); if (o.arrows === 'both') head(6, 0); }
  ctx.restore();
};
export const KIND = { msg: ['msgS', 'msgB'], call: ['callS', 'callB'], res: ['resS', 'resB'], txt: ['txtS', 'txtB'] };
// a chip centred at (x, y): the kit's .bp-chip (24 px → the floor, line 38, padding 14, 2.5 px border, radius 21); shown: graphemes typed so far
export const chipSize = (ctx, L, s) => { const px = sz(24, L); return [widthOf(ctx, s, L, px) + 28 + 5, Math.max(38, px + 12) + 5]; };
export const drawMsgChip = (ctx, C, L, s, kind, x, y, o = {}) => {
  const a = o.alpha ?? 1; if (a <= 0) return;
  const [S, B] = (KIND[kind] || KIND.msg).map((k) => C[k]), px = sz(24, L), [w, h] = chipSize(ctx, L, s), body = o.shown != null ? o.shown : s;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(o.scale ?? 1, o.scale ?? 1);
  rrect(ctx, -w / 2 + 1.25, -h / 2 + 1.25, w - 2.5, h - 2.5, Math.min(21, h / 2)); ctx.fillStyle = B; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = S; ctx.stroke();
  say(ctx, body, -w / 2 + 16.5, -h / 2 + 2.5, L, px, C.ink, { lh: h - 5 });
  ctx.restore();
};
// share of a chip [cx, cy, w, h] under the most-covering box
const coverOf = (x, y, w, h, boxes) => { let m = 0; for (const [bx, by, bw, bh] of boxes) { const iw = Math.min(x + w / 2, bx + bw) - Math.max(x - w / 2, bx), ih = Math.min(y + h / 2, by + bh) - Math.max(y - h / 2, by); if (iw > 0 && ih > 0) m = Math.max(m, (iw * ih) / (w * h)); } return m; };
// the middle of the longest stretch of the path (fractions a–b) where a chip w × h is under no box
const gapMid = (pts, Ls, a, b, w, h, under) => { const N = 120; let best = null, run = null, low = { f: (a + b) / 2, c: 1e9 }; for (let i = 0; i <= N; i++) { const f = a + ((b - a) * i) / N, [x, y] = pointAt(pts, f, Ls), c = under ? coverOf(x, y, w, h, under) : 0; if (c < low.c) low = { f, c }; if (c === 0) { run = run || { s: f, e: f }; run.e = f; if (!best || Math.abs(run.e - run.s) > Math.abs(best.e - best.s)) best = { ...run }; } else run = null; } return best ? (best.s + best.e) / 2 : low.f; };
// a trip: { text, kind, path (cmds), t0, t1, a, b, ease, hold, under, show ('keep'), hide, type: [t0, dt] }; returns
// { x, y, alpha, shown } at t (alpha 0 outside it); the kit's travel (message.js)
export const tripAt = (ctx, L, tr, t) => {
  if (!tr._pts) { tr._pts = sample(tr.path, 24); tr._Ls = lengths(tr._pts); }
  const { _pts: pts, _Ls: Ls } = tr, a = tr.a ?? 0, b = tr.b ?? 1, ease = tr.ease || E.p1io, [w, h] = chipSize(ctx, L, tr.text);
  if (t < tr.t0 - 1e-6) return { alpha: 0 };
  let f = a + (b - a) * ease(clamp((t - tr.t0) / (tr.t1 - tr.t0)));
  if (tr.hold) {
    if (tr._m == null) tr._m = gapMid(pts, Ls, a, b, w, h, tr.under);
    const m = tr._m, mv = Math.max(0.1, tr.t1 - tr.t0 - tr.hold), sh = Math.abs(b - a) > 1e-9 ? Math.abs(m - a) / Math.abs(b - a) : 0.5, l1 = mv * sh, l2 = mv - l1, u = t - tr.t0;
    f = u <= l1 ? (l1 > 0 ? a + (m - a) * E.p2o(clamp(u / l1)) : m) : u <= l1 + tr.hold ? m : l2 > 0 ? m + (b - m) * E.p2i(clamp((u - l1 - tr.hold) / l2)) : b;
  }
  const [x, y] = pointAt(pts, f, Ls);
  let al = tr.show === 'keep' || tr.show === false ? 1 : clamp((t - tr.t0) / 0.12);
  if (tr.under) al *= 1 - clamp(coverOf(x, y, w, h, tr.under) / 0.35);
  if (tr.hide) al *= clamp((tr.t1 + 0.08 - t) / 0.1);
  if (tr.hide && t > tr.t1 + 0.08) al = 0;
  const shown = tr.type ? typedOf(tr.text, t, tr.type[0], tr.type[1]) : null;
  return { x, y, alpha: al, shown };
};

// ── the overview diagram ─────────────────────────────────────────────────────────────────────────────────────────────
// rows top to bottom, equal width (bands x 60–1540, cells x 320–1516, 14 px apart from y 100), one of them the focus row
// (its cells become the detail diagram on the zoom; one cell may be a loop); a side node (the model) right of the focus
// row with a two-headed link; the kit's overview.js and the approved film's layout (agent-harness 11-blueprint-zoom)
export const GEO = { bx: 60, bw: 1480, cx: 320, cw: 1196, top: 100, gap: 14, side: [1600, 240], origin: [800, 514] };
export const overviewLayout = (s) => {
  const G = { ...GEO, ...(s.geo || {}) }, rows = [];
  let y = G.top;
  s.rows.forEach((r, i) => {
    const focus = i === s.focus, h = r.h ?? (focus ? 184 : r.sub && r.sub.includes('\n') ? 104 : 88), inset = r.inset ?? (focus ? 20 : h > 90 ? 18 : 14), gap = focus ? 25 : 24, n = r.cells.length, w = (G.cw - gap * (n - 1)) / n;
    const cells = r.cells.map((c, k) => ({ ...(typeof c === 'string' ? { title: c } : c), box: [G.cx + k * (w + gap), y + inset, w, h - 2 * inset], c: r.c, seed: 11 + k * 7 + y, size: focus ? 36 : 28, subSize: 26 }));
    rows.push({ ...r, focus, below: i > s.focus, box: [G.bx, y, G.bw, h], nameY: focus ? 14 : 10, cells });
    y += h + G.gap;
  });
  const fr = rows[s.focus], mid = fr.box[1] + fr.box[3] / 2;
  const side = s.side ? { ...s.side, c: s.side.c || 'mod', box: [G.side[0], mid - 52, G.side[1], 92], seed: 53, size: 34, subSize: 24 } : null;
  return { G, rows, fr, side, link: side ? [['M', G.cx + G.cw + 1, mid - 6], ['L', G.side[0] - 2, mid - 6]] : null };
};
// load times: the focus row first, then the others from the bottom up (the kit's overview order)
export const loadTimes = (O, A) => {
  const order = O.rows.map((r, i) => i).filter((i) => !O.rows[i].focus).reverse(), T = {};
  T[O.rows.indexOf(O.fr)] = A.core;
  order.forEach((i, k) => (T[i] = A.up + [0.02, 0.5, 0.95, 1.4, 1.85, 2.3][k]));
  return T;
};

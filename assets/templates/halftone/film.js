// film.js — the halftone renderer: a pure function of t (render(ctx, t)), wired through lib/boot.js.
//
// One anchor — the piece of the product's mark printed in the process ink — sits on one screen point P from the
// first frame to the lock-up. Every world (ground, field, type) is drawn round it and every transition happens
// round it; at the end the camera pulls back on a log scale and the anchor lands in the whole mark.
// Print logic throughout: two plates (black 45°, process ink 15°), dots vary in size and never in grey, type
// knocks the plate out round itself, the anchor knocks the black plate out under itself.
import content from './content.js';
import rules, { C, leadSec, inPostSec, countBeats } from './timing.rules.js';
import { fit } from './lib/timing.js';
import PALETTES from './palettes.js';
import { validate, transitionOut, transitionIn, groundOf, fieldOf } from './registry.js';
import { screen, knockText } from './screen.js';
import { toneOf, morphTone, DEF, HOOK, COL } from './fields.js';
import * as M from './lib/motion.js';
import { font, measure, errorBanner } from './lib/text.js';
import { subframes, grainTile } from './lib/canvas.js';
import { hash } from './lib/rng.js';
import { drawHandoff } from './lib/handoffs/index.js';       // anchor-swap: scan, iris, pull-back
import { createTransitions } from './lib/transitions/index.js'; // whip-push, whiteout-slam (WebGL)

const problems = validate(content);
if (problems.length) throw new Error('content.js\n' + problems.join('\n'));

export const T = fit(content, rules);
export const duration = T.duration;
const B = T.beat, BAR = T.bar;
const PAL = PALETTES[content.palette];
const DOT = content.dot ?? 'round';
const EDGES = content.edges ?? 'full';
const SEED = content.seed ?? 1;
const MARK = content.mark;

const FAM = 'Bricolage Grotesque', MONO = 'IBM Plex Mono';
export const fonts = [{ family: FAM, weight: 800 }, { family: FAM, weight: 500 }, { family: MONO, weight: 500 }];

// ---------- the frame ----------
const W = 1920, H = 1080;
const P = [1440, 540];               // the anchor's screen point, from the first frame to the lock-up
const X0 = 150, TEXT_R = 1130;       // the text column (150 px margin)
const SCALE = [28, 38, 52, 71, 96, 131, 178, 242]; // type scale: 28 × 1.36ⁿ (TEMPLATE.md, mode card)
const MARK_H = 405;                  // the mark's height at the lock-up, px
const MARK_PITCH = 7;                // the mark's screen at the lock-up, px (pitch scales with the camera)
const ANGLE_K = 45, ANGLE_C = 15;    // screen angles: black plate, process ink (ISO 12647-2 practice)
const ANCHOR_H = 220;                // the anchor's height through the film, px
const Q = 23;                        // block size of a quantized field, px

const [bx0, by0, bx1, by1] = MARK.box, [ax0, ay0, ax1, ay1] = MARK.anchorBox;
const U = MARK_H / (by1 - by0);                    // px per mark unit at the lock-up
const ZA = ANCHOR_H / ((ay1 - ay0) * U);           // the anchor's scale through the film
const ZH = ZA * 1.45;                              // the opening close-up
const ZP = 24 / MARK_PITCH;                        // the push-in before the lock-up: the opening's 24 px screen again
const INK_PATH = new Path2D(MARK.ink), ACC_PATH = new Path2D(MARK.accent);
const LAMBDA = MARK.lambda ?? 0.14, RING_AT = MARK.ringAt ?? 0.25;

// ---------- scenes ----------
const S = T.scenes.map((s, i) => {
  const o = i === 0 ? C.firstOffset : 0;
  const ground = groundOf(s);
  return {
    ...s, i, o, ground,
    kind: fieldOf(s),
    tin: transitionIn(T.scenes, i), tout: transitionOut(T.scenes, i),
    par: s.type === 'hook' ? HOOK : DEF,
    seed: s.pattern != null ? SEED + 101 * s.pattern : SEED + i * 17, // cards with the same pattern draw the same field
  };
});
const colors = (ground) => ground === 'ink'
  ? { ground: PAL.fg, ink: PAL.bg, dim: PAL.dimInk }
  : { ground: PAL.bg, ink: PAL.fg, dim: PAL.dim };

// transition windows round each boundary b = S[k].end: [b − pre, b + post]
const WIN = S.slice(0, -1).map((s, k) => {
  const tr = s.tout, b = s.end;
  return { k, tr, b, pre: leadSec(tr, B), post: inPostSec(tr, B) };
});

// ---------- layout (measured once fonts are ready) ----------
let L = null;
const f = (weight, size, fam = FAM) => font({ family: fam, weight, size });
const fitSize = (ctx, str, weight, sizes, maxW, fam = FAM) => {
  for (const sz of sizes) if (measure(ctx, str, f(weight, sz, fam)) <= maxW) return { size: sz, ok: true };
  return { size: sizes[sizes.length - 1], ok: false };
};

export const ready = async (ctx) => {
  const bad = [];
  const texts = S.map((s) => {
    const out = [];
    const add = (str, x, y, weight, size, fam, role, land, extra = {}) => out.push({ str, x, y, weight, size, fam, role, land, ...extra });
    const st = s.start;
    if (s.type === 'hook') {
      const ls = s.lines || [];
      const sz = Math.min(...ls.map((l) => { const r = fitSize(ctx, l, 800, [131, 96], TEXT_R - X0); if (!r.ok) bad.push(`hook line "${l}"`); return r.size; }));
      const ys = ls.length > 1 ? [520, 520 + Math.round(sz * 1.08)] : [600];
      ls.forEach((l, k) => add(l, X0, ys[k], 800, sz, FAM, 'ink', st + (s.o + k * C.hookLine2) * B));
      if (s.label) add(s.label, X0 + 4, 330, 500, 28, MONO, 'dim', st + (s.o + 0.5) * B);
    }
    if (s.type === 'card') {
      const r = fitSize(ctx, s.word, 800, [178, 131], TEXT_R - X0);
      if (!r.ok) bad.push(`card word "${s.word}"`);
      add(s.word, X0 - 4, 590, 800, r.size, FAM, 'ink', st + s.o * B);
      if (s.line) {
        const fam = s.mono ? MONO : FAM, w = s.mono ? 500 : 500;
        if (measure(ctx, s.line, f(w, 52, fam)) > TEXT_R - X0) bad.push(`card line "${s.line}"`);
        add(s.line, X0, 680, w, 52, fam, 'ink', st + (s.o + C.lineAt) * B);
      }
      if (s.label) add(s.label, X0 + 4, 380, 500, 28, MONO, 'dim', st + s.o * B);
    }
    if (s.type === 'count') {
      const top = String(s.value);
      const r = fitSize(ctx, top, 800, [242, 178], TEXT_R - X0);
      if (!r.ok) bad.push(`count value "${top}"`);
      add(top, X0 - 6, 610, 800, r.size, FAM, 'ink', st + s.o * B, { count: s });
      if (s.line) {
        if (measure(ctx, s.line, f(500, 52)) > TEXT_R - X0) bad.push(`count line "${s.line}"`);
        add(s.line, X0, 700, 500, 52, FAM, 'ink', st + (s.o + C.lineAt) * B);
      }
      if (s.label) add(s.label, X0 + 4, 380, 500, 28, MONO, 'dim', st + s.o * B);
    }
    if (s.type === 'claim') {
      const ls = s.lines || [];
      const sz = Math.min(...ls.map((l) => { const r = fitSize(ctx, l, 800, [131, 96], TEXT_R - X0); if (!r.ok) bad.push(`claim line "${l}"`); return r.size; }));
      const ys = ls.length > 1 ? [500, 500 + Math.round(sz * 1.08)] : [580];
      ls.forEach((l, k) => add(l, X0, ys[k], 800, sz, FAM, 'ink', st + C.claimLand * B, { claim: true }));
    }
    return out;
  });
  // the lock-up: mark left, name right, centred together
  const lk = S.at(-1);
  const nr = fitSize(ctx, lk.name, 800, [178, 131], 1100);
  if (!nr.ok) bad.push(`lockup name "${lk.name}"`);
  const nameW = measure(ctx, lk.name, f(800, nr.size));
  const markW = (bx1 - bx0) * U, gap = 84, total = markW + gap + nameW, left = Math.round(960 - total / 2);
  const F = [left - bx0 * U, 540 - ((by0 + by1) / 2) * U];
  const nameX = left + markW + gap, nameY = 540 + Math.round(nr.size * 0.36);
  texts[lk.i] = [
    { str: lk.name, x: nameX, y: nameY, weight: 800, size: nr.size, fam: FAM, role: 'ink', land: lk.start + C.nameAt * B },
    ...(lk.line ? [{ str: lk.line, x: nameX + 6, y: nameY + 92, weight: 500, size: 52, fam: FAM, role: 'dim', land: lk.start + C.lineAtLock * B }] : []),
  ];
  if (lk.line && nameX + measure(ctx, lk.line, f(500, 52)) > W - 96) bad.push(`lockup line "${lk.line}"`);

  // the claim's letters sampled into dot cells: the burst's dots condense onto them
  const cl = S.find((s) => s.type === 'claim');
  let cells = [];
  if (cl) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    for (const e of texts[cl.i]) { g.font = f(800, e.size); g.fillStyle = '#000'; g.fillText(e.str, e.x, e.y); }
    const img = g.getImageData(0, 0, W, H).data, STEP = 8;
    let xa = Infinity, xb = -Infinity;
    for (let y = 300 + STEP / 2; y < 900; y += STEP) for (let x = X0 - 10 + STEP / 2; x < TEXT_R + 40; x += STEP) {
      if (img[(Math.round(y) * W + Math.round(x)) * 4 + 3] < 120) continue;
      cells.push({ x, y }); xa = Math.min(xa, x); xb = Math.max(xb, x);
    }
    cells = cells.map((p, i) => {
      const u = (p.x - xa) / Math.max(1, xb - xa);
      return { ...p, step: STEP, mx: P[0] + (p.x - P[0]) * 0.45 + (hash(i, SEED + 21) - 0.5) * 520, my: Math.min(P[1], p.y) - 180 + (hash(i, SEED + 22) - 0.5) * 480,
        sx: P[0] + (hash(i, SEED + 23) - 0.5) * 30, sy: P[1] + (hash(i, SEED + 24) - 0.5) * 60, lag: u * 0.14 + hash(i, SEED + 25) * 0.04 };
    });
  }
  L = { texts, F, cells, grain: grainTile(SEED % 997, 256, 18) };
  if (bad.length) {
    const lines = ['TEXT TOO WIDE — shorten it in content.js (type never shrinks below the scale floor)', ...bad.map((b) => `  ${b}`)];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-layout-error');
    setTimeout(() => { throw new Error(lines.join('; ')); }, 0);
  }
};

// ---------- fields ----------
const beatsOf = (s, t) => (t - s.start) / B - s.o;
// the per-beat step (T0): a whole step lands on each beat, eased over 0.4 beat, then still
const stepped = (b) => { const k = Math.floor(b); return k + M.quintOut(M.clamp((b - k) / 0.4)); };
const countAt = (s, t) => {
  const from = s.from ?? 0, cb = countBeats(s);
  const u = M.clamp((t - (s.start + s.o * B)) / (cb * B));
  return Math.round(from + (s.value - from) * (1 - (1 - u) * (1 - u))); // ease-out, so every value shows
};
const toneAt = (s, t, quant = false) => {
  const b = beatsOf(s, t);
  const st = { A: P, o: s.par, seed: s.seed, ph: quant ? Math.floor(Math.max(0, b)) : stepped(Math.max(0, b)), k: Math.floor(b) };
  if (s.kind === 'cross') { const u = (x) => M.clamp(x); st.on = [1, u((b + 0.25) / 1.2), u((b - 0.75) / 1.2)]; }
  if (s.kind === 'cells') st.cut = M.cubicOut(M.clamp((b + 0.25) / 0.6));
  if (s.kind === 'count') st.n = s.type === 'count' ? countAt(s, t) : 12;
  let tone = toneOf(s.kind, st);
  if (s.type === 'hook') { // the contact wave: an annulus of larger dots runs out of the anchor as it lands
    const u = (t - (s.start + s.o * B)) / 0.7;
    if (u > 0 && u < 1) {
      const base = tone, r = 260 + 1300 * M.cubicOut(u), wv = 100;
      tone = (x, y) => { const d = Math.abs(Math.hypot(x - P[0], y - P[1]) - r); return d < wv ? Math.max(base(x, y), 0.24 * (1 - d / wv) * (1 - u)) : base(x, y); };
    }
  }
  return tone;
};
const quantized = (s) => s.tin === 'quantize';

const drawField = (ctx, s, tone, ground, pitch = s.par.pitch) => {
  if (s.kind === 'none') return;
  screen(ctx, { x0: COL - 20, y0: 0, x1: W, y1: H, pitch, angle: ANGLE_K, ox: P[0], oy: P[1], tone, color: colors(ground).ink, shape: DOT });
};
// a quantized field: binary blocks of side Q·k on a grid anchored at P (k from `level`, 0..1 per block)
const drawBlocks = (ctx, level, ground, clip = null) => {
  const p = new Path2D();
  const ni = Math.ceil((W - COL) / Q) + 2, nj = Math.ceil(H / Q) + 2;
  for (let i = -ni; i <= ni; i++) for (let j = -nj; j <= nj; j++) {
    const x = P[0] + i * Q, y = P[1] + j * Q;
    if (x < COL - Q || x > W + Q || y < -Q || y > H + Q) continue;
    if (clip && !clip(x, y)) continue;
    const k = level(x, y, i, j);
    if (k <= 0.02) continue;
    const w = Q * Math.min(1, k) - 3;
    if (w > 0.5) p.rect(x - w / 2, y - w / 2, w, w);
  }
  ctx.fillStyle = colors(ground).ink; ctx.fill(p);
};
const binOf = (tone, s) => (x, y) => (tone(x, y) > s.par.M * 0.42 ? 1 : 0);

// ---------- type ----------
const textColor = (e, ground) => (e.role === 'dim' ? colors(ground).dim : colors(ground).ink);
// one text element at t: rises through its baseline mask onto its land time; exits up through it from `exitAt`
const drawText = (ctx, e, t, ground, { exitAt = null, statik = false, alpha = 1 } = {}) => {
  const r0 = e.land - C.riseLeadSec;
  if (!statik && t < r0) return;
  const u = statik ? 1 : M.cubicOut((t - r0) / C.riseSec);
  const x = exitAt == null ? 0 : M.clamp((t - exitAt) / C.exitSec);
  if (x >= 1) return;
  const ex = x * x * x;
  const str = e.count ? String(countAt(e.count, t)) : e.str;
  const dy = (1 - u) * e.size * 0.95 - ex * e.size * 0.95;
  const c = colors(ground);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, e.y - e.size * 1.02, W, e.size * 1.3); ctx.clip();
  knockText(ctx, str, e.x, e.y + dy, { font: f(e.weight, e.size, e.fam), color: textColor(e, ground), paper: c.ground, knock: Math.max(6, Math.round(e.size * 0.07)), alpha });
  ctx.restore();
};
// the scene's exit time for its text (null: the transition covers it)
const exitOf = (s) => {
  switch (s.tout) {
    case 'morph': case 'quantize': return s.end - C.exitSec - C.riseLeadSec;
    case 'invert': return s.end - C.invertBeats * B;
    case 'pull': return s.end - leadSec('pull', B);
    default: return null;
  }
};
const statikIn = (s) => ['whip', 'scan', 'slam'].includes(s.tin);
const drawTexts = (ctx, s, t, opts = {}) => {
  for (const e of L.texts[s.i]) drawText(ctx, e, t, s.ground, { exitAt: exitOf(s), statik: statikIn(s) && !(e.land > s.start + 1e-6), ...opts });
};

// ---------- the anchor and the mark ----------
const plate = (ctx, path, A, Z, fn) => { // clip to a mark path drawn at scale Z with its origin at A, then fn()
  const k = U * Z;
  ctx.save();
  ctx.setTransform(k, 0, 0, k, A[0], A[1]);
  ctx.clip(path);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  fn(k);
  ctx.restore();
};
const box = (A, k, b, pad = 0.02) => ({ x0: Math.max(0, A[0] + (b[0] - pad) * k), y0: Math.max(0, A[1] + (b[1] - pad) * k), x1: Math.min(W, A[0] + (b[2] + pad) * k), y1: Math.min(H, A[1] + (b[3] + pad) * k) });
// the anchor: a paper knock-out (with a 3 px trap) and the process ink's dots at 15°, shaded top to bottom
const drawAnchor = (ctx, A, Z, { sq = 0, gain = 1 } = {}) => {
  const k = U * Z;
  ctx.save();
  if (sq) { ctx.translate(A[0], A[1]); ctx.scale(1 + 0.5 * sq, 1 - sq); ctx.translate(-A[0], -A[1]); }
  const m = ctx.getTransform();
  ctx.setTransform(m.multiply(new DOMMatrix([k, 0, 0, k, A[0], A[1]])));
  ctx.lineJoin = 'round'; ctx.lineWidth = 6 / k; ctx.strokeStyle = PAL.bg; ctx.stroke(ACC_PATH);
  ctx.fillStyle = PAL.bg; ctx.fill(ACC_PATH);
  ctx.clip(ACC_PATH);
  ctx.setTransform(m);
  const bb = box(A, k, MARK.anchorBox);
  screen(ctx, { ...bb, pitch: MARK_PITCH * Z, angle: ANGLE_C, ox: A[0], oy: A[1], color: PAL.accent, shape: DOT,
    tone: (x, y) => {
      const v = (y - A[1]) / k, u = (x - A[0]) / k;
      const n = (v - ay0) / (ay1 - ay0), side = (u - ax0) / (ax1 - ax0);
      return M.clamp((0.5 + 0.38 * n + 0.1 * Math.cos(side * Math.PI)) * gain, 0, 1);
    } });
  ctx.restore();
};
// the black plate of the mark at scale Z, origin A; `inked` 0..1 is a front from the anchor (the plate inks up),
// `gain` a dot-gain multiplier (the second move)
const markTone = (A, k, inked = 1, gain = 1) => (x, y) => {
  const d = Math.hypot(x - A[0], y - A[1]) / k;
  const front = inked >= 1 ? 1 : M.clamp((inked * 0.9 - d) / 0.12);
  return M.clamp((0.97 - 0.42 * M.clamp(d / 0.6)) * gain) * front;
};
const drawMark = (ctx, A, Z, { inked = 1, gain = 1 } = {}) => {
  const k = U * Z;
  plate(ctx, INK_PATH, A, Z, () => {
    screen(ctx, { ...box(A, k, MARK.box), pitch: MARK_PITCH * Z, angle: ANGLE_K, ox: A[0], oy: A[1], color: PAL.fg, shape: DOT, tone: markTone(A, k, inked, gain) });
  });
};
// the rings round the anchor in mark space (λ = the mark's ring spacing): the field the film has been made of,
// drawn outside the mark's plate; `amt` scales their tone
const drawMarkRings = (ctx, A, Z, amt) => {
  if (amt <= 0.01) return;
  const k = U * Z;
  ctx.save();
  const m = new Path2D();
  m.rect(-50, -50, 100, 100); m.addPath(INK_PATH);
  ctx.setTransform(k, 0, 0, k, A[0], A[1]); ctx.clip(m, 'evenodd'); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const R = 0.66;
  screen(ctx, { x0: Math.max(0, A[0] - R * k), y0: Math.max(0, A[1] - R * k), x1: Math.min(W, A[0] + R * k), y1: Math.min(H, A[1] + R * k),
    pitch: MARK_PITCH * Z, angle: ANGLE_K, ox: A[0], oy: A[1], color: PAL.fg, shape: DOT,
    tone: (x, y) => {
      const d = Math.hypot(x - A[0], y - A[1]) / k;
      if (d < 0.17 || d > R) return 0;
      const e = M.clamp((R - d) / 0.12) * M.clamp((d - 0.17) / 0.05);
      return amt * HOOK.M * e * (0.5 + 0.5 * Math.cos((2 * Math.PI * (d - RING_AT)) / LAMBDA));
    } });
  ctx.restore();
};

// ---------- worlds ----------
const ground = (ctx, g) => { ctx.fillStyle = colors(g).ground; ctx.fillRect(0, 0, W, H); };
// scene s at time t without the anchor; `tone` overrides its field (morphs)
const world = (ctx, s, t, { tone = null, text = true, textOpts = {} } = {}) => {
  ground(ctx, s.ground);
  if (s.type !== 'lockup' && s.kind !== 'none') {
    if (quantized(s)) drawBlocks(ctx, binOf(tone ?? toneAt(s, t, true), s), s.ground);
    else drawField(ctx, s, tone ?? toneAt(s, t), s.ground);
  }
  if (text && s.type !== 'lockup') drawTexts(ctx, s, t, textOpts);
};

// ---------- offscreen canvases for whips ----------
const offs = new Map();
const off = (name) => {
  if (!offs.has(name)) { const c = document.createElement('canvas'); c.width = W; c.height = H; offs.set(name, c); }
  const c = offs.get(name), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  return [c, g];
};

// ---------- transitions ----------
const anchorAt = (t) => { // the anchor's scale through the film: the hook's close-up eases to ZA over its morph out
  const h = S[0];
  if (h.type !== 'hook') return ZA;
  const b = h.end, a = b - C.exitSec - C.riseLeadSec;
  return Math.exp(M.lerp(Math.log(ZH), Math.log(ZA), M.cubicInOut((t - a) / (b + 0.5 * B - a))));
};

// ---------- library glue ----------
let GL = null;
const gl = () => (GL ??= createTransitions(null, { width: W, height: H }));
const farFrom = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
const invInOut = (y) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2); // inverse of cubic in-out
// anchor-swap params: our worlds as its painters; the anchor is drawn by paint() on top, so its own painter is empty
const swapParams = (swap, A, N, t) => ({
  swap, anchor: P, unit: U, zoom: 1, hole: 0.01,
  from: (c) => world(c, A, t), to: (c) => world(c, N, t), anchorPaint: () => {},
  colors: { ground: colors(N.ground).ground, ink: colors(N.ground).ink, accent: PAL.accent },
});

const paintBoundary = (ctx, w, t) => {
  const A = S[w.k], N = S[w.k + 1], b = w.b;
  switch (w.tr) {
    case 'morph': {
      const u = M.clamp((t - (b - 0.25 * B)) / (C.morphBeats * B));
      ground(ctx, N.ground);
      const tone = morphTone(toneAt(A, t), toneAt(N, t), P, u);
      if (A.kind !== 'none' || N.kind !== 'none') drawField(ctx, A.kind === 'none' ? N : A, tone, N.ground, M.lerp(A.par.pitch, N.par.pitch, M.cubicInOut(u)));
      drawTexts(ctx, A, t);
      drawTexts(ctx, N, t);
      return true;
    }
    case 'whip': { // lib/transitions whip-push: the strip [A | B] slides left, a 64-tap streak over 0.75 frame
      const [ca, ga] = off('a'), [cb, gb] = off('b');
      world(ga, A, t); world(gb, N, t);
      ctx.drawImage(gl().draw('whip-push', ca, cb, M.clamp((t - (b - w.pre)) / w.pre), { dur: w.pre, direction: 'left' }), 0, 0);
      return true;
    }
    case 'scan': { // lib/handoffs anchor-swap 'scan': a hairline sweeps down, the next world already printed above it
      drawHandoff(ctx, 'anchor-swap', M.clamp((t - (b - w.pre)) / w.pre), swapParams('scan', A, N, t));
      return true;
    }
    case 'invert': { // lib/handoffs anchor-swap 'iris': a disc out of the anchor onto the other ground
      // the disc accelerates (radius 40 + 1960 u^2.4 px) so the change peaks on the cut; mapped onto the module's
      // cubic in-out radius by inverting its easing
      const u = M.clamp((t - (b - w.pre)) / w.pre), R0 = 40, far = farFrom(P) + 4;
      drawHandoff(ctx, 'anchor-swap', invInOut(M.clamp((1960 * Math.pow(u, 2.4)) / (far - R0))), { ...swapParams('iris', A, N, t), hole: R0 / U });
      return true;
    }
    case 'quantize': {
      ground(ctx, N.ground);
      if (t < b) { // the front from the anchor turns the outgoing field into blocks
        const u = M.clamp((t - (b - C.quantBeats * B)) / (C.quantBeats * B)), R = 1500 * M.cubicInOut(u);
        const tone = toneAt(A, t);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(P[0], P[1], Math.max(0.1, R), 0, Math.PI * 2); ctx.clip('evenodd');
        drawField(ctx, A, tone, A.ground); ctx.restore();
        const bin = binOf(toneAt(A, b - 1e-3, true), A);
        drawBlocks(ctx, bin, N.ground, (x, y) => Math.hypot(x - P[0], y - P[1]) < R);
      } else { // the blocks re-sort, inside out, into the next field's blocks
        const s0 = binOf(toneAt(A, b - 1e-3, true), A), s1 = binOf(toneAt(N, t, true), N);
        const span = C.sortBeats * B - 0.14;
        drawBlocks(ctx, (x, y) => {
          const a = s0(x, y), z = s1(x, y);
          if (a === z) return a;
          const lag = span * M.clamp(Math.hypot(x - P[0], y - P[1]) / 900);
          return a + (z - a) * M.cubicOut((t - b - lag) / 0.14);
        }, N.ground);
      }
      drawTexts(ctx, A, t); drawTexts(ctx, N, t);
      return true;
    }
    case 'collapse': {
      ground(ctx, N.ground);
      const t0 = b - C.collapseBeats * B, t1 = t0 + 0.5 * B;
      if (t < t1) { // the whole scene shrinks into the anchor
        const sc = 1 - Math.pow(M.clamp((t - t0) / (t1 - t0)), 2.5);
        ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(sc, sc); ctx.translate(-P[0], -P[1]);
        ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
        world(ctx, A, Math.min(t, t0));
        ctx.restore();
      }
      if (t >= b) { // the burst: dots fly from the anchor and condense onto the claim's letters
        const path = new Path2D();
        for (const q of L.cells) {
          const u = M.cubicInOut(M.clamp((t - b - q.lag) / (C.claimLand * B - 0.2)));
          if (u <= 0) continue;
          const iu = 1 - u, x = iu * iu * q.sx + 2 * iu * u * q.mx + u * u * q.x, y = iu * iu * q.sy + 2 * iu * u * q.my + u * u * q.y;
          const r = M.lerp(2.4, q.step * 0.72, u);
          path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = colors(N.ground).ink; ctx.fill(path);
      }
      return true;
    }
    case 'slam': { // lib/transitions whiteout-slam: exposure to paper, two paper frames, the word lands decaying
      const [ca, ga] = off('a'), [cb, gb] = off('b');
      world(ga, A, t); world(gb, N, t);
      const e0 = L.texts[N.i][0], dur = w.pre + w.post;
      ctx.drawImage(gl().draw('whiteout-slam', ca, cb, M.clamp((t - (b - w.pre)) / dur), {
        dur, origin: [e0.x + 300, e0.y - e0.size * 0.36], blur: 22, shift: 0, zoom: 0.16, // no channel offset: two inks, no RGB
        colors: { paper: PAL.bg, ground: colors(N.ground).ground },
      }), 0, 0);
      return true;
    }
    case 'pull': return false; // drawn by paintPull with the anchor
    default: return false;
  }
};

// the lock-up and the push-in before it: the camera on a log scale, the anchor's point travelling from P to F
const pullState = (t) => {
  const lk = S.at(-1), b = lk.start;
  const pushA = b - (C.pushBeats + C.stillBeats) * B, pushB = b - C.stillBeats * B;
  if (t < b) {
    const u = M.cubicInOut(M.clamp((t - pushA) / (pushB - pushA)));
    return { Z: Math.exp(M.lerp(Math.log(ZA), Math.log(ZP), u)), A: P, rings: M.clamp((t - pushA) / (C.pushBeats * B * 0.7)), inked: M.clamp((t - pushA) / (C.pushBeats * B)), pre: true };
  }
  const e = M.expOut(M.clamp((t - b) / (C.pullBeats * B)));
  return { Z: Math.exp(M.lerp(Math.log(ZP), 0, e)), A: [M.lerp(P[0], L.F[0], e), M.lerp(P[1], L.F[1], e)], rings: 1 - M.clamp((t - b) / (C.pullBeats * B * 0.8)), inked: 1, pre: false };
};
const paintPull = (ctx, t) => {
  const lk = S.at(-1), cl = S[lk.i - 1];
  if (t >= lk.start) { // lib/handoffs anchor-swap 'pull': log-scale pull-back, the anchor travels to its place in the mark
    const u = M.clamp((t - lk.start) / (C.pullBeats * B)), e = M.expOut(u);
    const ringsAt = (Z) => { // the rings fade over the first 80 % of the pull (time recovered from the scale)
      const ee = M.clamp(1 - Math.log(Z) / Math.log(ZP)), uu = ee >= 1 ? 1 : -Math.log2(1 - ee) / 10;
      return 1 - M.clamp(uu / 0.8);
    };
    drawHandoff(ctx, 'anchor-swap', 1 - Math.cbrt(1 - e), { // expOut timing mapped onto the module's cubic out
      swap: 'pull', anchor: P, home: L.F, zoom: ZP, unit: U, hole: 1 / U,
      view: (c, at, Z) => { drawMarkRings(c, at, Z, ringsAt(Z)); drawMark(c, at, Z); },
      anchorPaint: (c, at, R) => drawAnchor(c, at, R),
      colors: { ground: colors(lk.ground).ground, ink: colors(lk.ground).ink, accent: PAL.accent },
    }, { dur: C.pullBeats * B });
    return;
  }
  const st = pullState(t);
  ground(ctx, lk.ground);
  if (st.pre && cl) drawTexts(ctx, cl, t); // the claim leaves before the push-in
  drawMarkRings(ctx, st.A, st.Z, st.rings);
  drawMark(ctx, st.A, st.Z, { inked: st.pre ? st.inked : 1 });
  drawAnchor(ctx, st.A, st.Z);
};
const paintLockup = (ctx, t) => {
  const lk = S.at(-1);
  // the second move on the last downbeat: the plate takes a dot-gain impression and settles
  const tm = lk.end - BAR, q = t - tm;
  const gain = q > 0 ? 1 + 0.16 * Math.exp(-q / 0.12) * Math.min(1, q / 0.03) : 1;
  ground(ctx, lk.ground);
  drawMark(ctx, L.F, 1, { gain });
  drawAnchor(ctx, L.F, 1, { gain: q > 0 ? 1 + 0.1 * Math.exp(-q / 0.12) * Math.min(1, q / 0.03) : 1 });
  for (const e of L.texts[lk.i]) drawText(ctx, e, t, lk.ground);
};

// ---------- the frame ----------
export const setContext = () => {}; // index.html hands the context to ready() and render(); kept for the template's boot code

const paint = (ctx, t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  const lk = S.at(-1);
  const pullFrom = lk.start - leadSec('pull', B);
  if (S.length > 1 && t >= lk.start + C.pullBeats * B) return paintLockup(ctx, t);
  if (S.length > 1 && t >= pullFrom + C.exitSec) return paintPull(ctx, t);
  if (S.length === 1) return paintLockup(ctx, t);
  const w = WIN.find((x) => x.tr !== 'pull' && t >= x.b - x.pre && t < x.b + x.post);
  let drawn = false;
  if (w) drawn = paintBoundary(ctx, w, t);
  const i = S.findIndex((s) => t >= s.start && t < s.end);
  const s = S[i < 0 ? S.length - 1 : i];
  if (!drawn) world(ctx, s, t);
  // the anchor, on top: rises in on the opening's first beat (unless edges: 'cut'), recoils and strikes in a collapse
  const Z = anchorAt(t);
  let A = P, sq = 0;
  if (i === 0 && EDGES !== 'cut' && t < S[0].o * B + 0.4) {
    const u = M.clamp(t / (S[0].o * B));
    A = [P[0], P[1] + 820 * Math.pow(1 - u, 2)];
    const q = t - S[0].o * B;
    if (q > 0) sq = 0.09 * Math.exp(-q / 0.07) * Math.min(1, q / 0.02);
  }
  if (w && w.tr === 'collapse') {
    const t1 = w.b - C.collapseBeats * B + 0.5 * B;
    if (t >= t1 && t < w.b) sq = 0.1 * M.expIn(M.clamp((t - t1) / (w.b - t1)));   // anticipation: it squashes, holding still
    if (t >= w.b) sq = -0.06 * Math.exp(-(t - w.b) / 0.08);                       // and strikes
  }
  drawAnchor(ctx, A, Z, { sq });
  // the burst's ring: one crisp stroke out of the anchor, thinning to nothing in 0.42 s
  if (w && w.tr === 'collapse' && t >= w.b) {
    const u = M.clamp((t - w.b) / 0.42);
    if (u < 1) {
      ctx.save(); ctx.strokeStyle = colors(S[w.k + 1].ground).ink; ctx.lineWidth = 12 * Math.pow(1 - u, 1.5);
      ctx.beginPath(); ctx.arc(P[0], P[1], 40 + 1500 * M.expOut(u), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
};

// fast moves get sub-frame motion blur (lib/canvas.js subframes, exact sum): the anchor's rise is gated by its speed;
// the collapse and the burst are blurred with 6 sub-frames; the pull-back is blurred by its hand-off; still frames
// are drawn once
const riseSpeed = (t) => { const T1 = S[0].o * B, u = M.clamp(t / T1); return t < T1 ? (2 * 820 * (1 - u)) / T1 / 30 : 0; };
const blurOf = (t) => {
  if (EDGES !== 'cut' && t > 0.02 && t < S[0].o * B + 0.05) return { speed: riseSpeed };
  const hit = WIN.some((w) => w.tr === 'collapse' && ((t > w.b - C.collapseBeats * B && t < w.b - C.collapseBeats * B + 0.5 * B + 0.03) || (t > w.b && t < w.b + C.claimLand * B - 0.05)));
  return hit ? { n: 6, exact: true } : null;
};

export const render = (ctx, t) => {
  if (!L) return;
  const bl = blurOf(t);
  if (bl) subframes(ctx, (c, tt) => paint(c, Math.max(0, tt)), t, { shutter: 0.5, ...bl });
  else paint(ctx, t);
  // paper tooth: one fixed seeded grain, the same on every frame (it belongs to the paper, not the film)
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  for (let y = 0; y < H; y += 256) for (let x = 0; x < W; x += 256) ctx.drawImage(L.grain, x, y);
  ctx.restore();
};
export { S as scenes, P as anchorPoint, ZA, ZH, ZP, U };

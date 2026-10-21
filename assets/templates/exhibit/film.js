// film.js — the Exhibit renderer: a pure function of t (render(ctx, t)), wired through lib/boot.js.
//
// One desk; every real asset lies on it in a mount that names its source (layout.js); a camera looking straight down
// travels over it. One pencil ring finds the region a claim rests on; the region lifts out and becomes the code-drawn
// reading (moves.js: the four pluggable moves). At the end the camera rises over the whole desk and the ring's route
// ends as the rule under the name. Times come from choreo.js, the same module timing.rules.js and score.mjs read.
import content from './content.js';
import rules, { validate } from './timing.rules.js';
import { fit } from './lib/timing.js';
import PALETTES from './palettes.js';
import { plan, exhibitBefore, measureLabel, C } from './choreo.js';
import { ADAPTERS, moveOf } from './moves.js';
import * as L from './layout.js';
import { createHandoff } from './lib/handoffs/index.js';
import liftOut from './lib/handoffs/lift-out.js';
import bezelPullback from './lib/handoffs/bezel-pullback.js';
import cameraTruck from './lib/handoffs/camera-truck.js';
import valueCarry from './lib/handoffs/value-carry.js';
import { windowBack, windowFront, clipWindow, drawAsset, veil, ring, zoomBetween } from './lib/handoffs/asset.js';
import { text, measure, rrect, rgba, cubicInOut, cubicOut, settle, clamp, lerp } from './lib/handoffs/util.js';
import { subframes } from './lib/canvas.js';
import { mulberry32 } from './lib/rng.js';

const problems = validate(content);
if (problems.length) throw new Error('content.js\n' + problems.join('\n'));

export const T = fit(content, rules);
export const duration = T.duration;
const B = T.beat, BAR = T.bar, FPS = 30;
const PAL = PALETTES[content.palette];
if (!PAL) throw new Error(`content.js\npalette "${content.palette}" is not in palettes.js (${Object.keys(PALETTES).join(', ')})`);
const DESK = content.desk ?? 'plain';
const FAM = 'Instrument Sans', MONO_FAM = 'IBM Plex Mono';
const FONT = { family: FAM, weight: 600 }, MONO = { family: MONO_FAM, weight: 500 };
export const fonts = [{ family: FAM, weight: 700 }, { family: FAM, weight: 600 }, { family: FAM, weight: 500 }, { family: MONO_FAM, weight: 500 }];
const COLORS = { ground: PAL.ground, panel: PAL.mat, line: PAL.mat, ink: PAL.ink, dim: PAL.muted, accent: PAL.accent };
const PW = { colors: COLORS, mono: MONO };

const WD = L.world(content);
const E = WD.E;
const LOCK = content.scenes.find((s) => s.type === 'lockup');
const CARD = { w: 660, h: 300 };   // a carried reading on label stock, film px when lifted
const OV = L.overview(WD, { name: LOCK?.name, line: LOCK?.line, mark: LOCK?.mark, card: content.scenes.some((s) => s.type === 'carry' && s.card) ? CARD.h : 0 });

// scenes with their plans at the fitted length
const S = T.scenes.map((s, i) => {
  const ctx = { i, scenes: T.scenes, content };
  const dur = s.end - s.start;
  const p = plan(s, ctx, B, dur, content);
  return { ...s, i, dur, p, e: E[s.exhibit], prev: E[exhibitBefore(T.scenes, i)] ?? null };
});
const sceneAt = (t) => (t < S[0].start ? S[0] : S.find((s) => t >= s.start - 1e-9 && t < s.end - 1e-9) ?? S.at(-1));

// captions on the desk: each lies under its exhibit from its first word until the next caption on that exhibit
const CAPS = [];
for (const s of S) {
  if (!s.p.capAt || !s.caption) continue;
  const ex = s.exhibit;
  CAPS.push({ ex, from: s.start + s.p.capAt, words: s.p.words.filter((w) => w.tag === 'caption' || w.tag === 'claim').map((w) => ({ ...w, t: s.start + w.t })), text: s.caption });
}
CAPS.forEach((c, k) => { const next = CAPS.slice(k + 1).find((d) => d.ex === c.ex); c.to = next ? next.from : Infinity; });

// the regions the ring visited, in order (first cell of each read, the carry's target): the route at the end
const ROUTE = [];
for (const s of S) {
  if (s.type === 'read' && s.cells?.length) ROUTE.push(L.fileRect(s.e, s.cells[0].box));
  if (s.type === 'carry') ROUTE.push(L.fileRect(s.e, s.to.ring));
}

let IMG = {};
const INST = new Map();   // scene index → { role: move instance }
const assetOf = (id) => ({ image: IMG[id], crop: content.assets[id].crop });

export const ready = async () => {
  for (const [id, a] of Object.entries(content.assets)) {
    const img = new Image();
    img.src = `assets/real/${a.file}`;
    await img.decode();
    IMG[id] = img;
  }
  const env = {
    createHandoff, zoomBetween, measure, world: WD, content, PAL, FONT, MONO, assetOf,
    modules: { 'lift-out': liftOut, 'bezel-pullback': bezelPullback, 'camera-truck': cameraTruck, 'value-carry': valueCarry },
    focusOf: () => content.scenes[0].focus ?? null,
  };
  const mv = content.moves ?? {};
  for (const s of S) {
    const m = {};
    if (s.type === 'open') m.open = await ADAPTERS.open[moveOf('open', mv.open).id].create(env, { e: s.e, s });
    if (s.type === 'read') {
      if (s.p.travel) m.travel = await ADAPTERS.travel[moveOf('travel', mv.travel).id].create(env, { from: s.prev, e: s.e, s });
      m.lift = await ADAPTERS.lift[moveOf('lift', mv.lift).id].create(env, { e: s.e, cells: s.cells, s });
    }
    if (s.type === 'carry') m.carry = await ADAPTERS.carry[moveOf('carry', mv.carry).id].create(env, { from: s.prev, e: s.e, s });
    INST.set(s.i, m);
  }
};

// ---------- drawing ----------
const W = 1920, H = 1080;
let TEX = null;
const texture = () => {
  if (TEX) return TEX;
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), img = g.createImageData(n, n), r = mulberry32(content.seed ?? 1);
  for (let i = 0; i < n * n; i++) { const v = 128 + (r() - 0.5) * 18; img.data.set([v, v, v, 255], i * 4); }
  g.putImageData(img, 0, 0);
  return (TEX = c);
};
// the desk: ground, a fixed-seed fibre texture in world space (it moves with the camera), and with desk 'mat' a
// cutting mat's grid (1 px, decoration) every 80 world px
function desk(ctx, v) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAL.ground; ctx.fillRect(0, 0, W, H);
  const pat = ctx.createPattern(texture(), 'repeat');
  pat.setTransform(new DOMMatrix([v.a * 2, 0, 0, v.a * 2, v.bx, v.by]));
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (DESK === 'mat') {
    const step = 80 * v.a;
    ctx.strokeStyle = rgba(PAL.muted, 0.22); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ((v.bx % step) + step) % step; x < W; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (let y = ((v.by % step) + step) % step; y < H; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
    ctx.stroke();
  }
  ctx.restore();
}
// the light falls off toward the frame's edges (screen space)
function falloff(ctx) {
  const g = ctx.createRadialGradient(960, 520, 420, 960, 540, 1250);
  const dark = parseInt(PAL.ground.slice(1, 3), 16) < 100;
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.38)' : 'rgba(60,55,45,0.10)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// one exhibit in its mount, through the camera view v, veiled toward the desk by vl
function exhibit(ctx, e, v, vl = 0, hole = null) {
  const Wd = L.windowOfE(e);
  const s = L.rect(v, Wd);
  if (s.x > W || s.x + s.w < 0 || s.y > H || s.y + s.h < 0) return;
  ctx.save();
  ctx.setTransform(v.a, 0, 0, v.a, v.bx, v.by);
  const c = { x: e.x, y: e.y + L.BAR, w: e.w, h: e.h };
  windowBack(ctx, Wd, PW);
  ctx.save(); clipWindow(ctx, Wd); drawAsset(ctx, assetOf(e.id), { a: e.a, bx: e.x - e.cx * e.a, by: e.y + L.BAR - e.cy * e.a }, c); ctx.restore();
  windowFront(ctx, Wd, PW, { title: e.source });
  if (vl > 0) {
    ctx.save(); clipWindow(ctx, { ...Wd, x: Wd.x - 2, y: Wd.y - 2, w: Wd.w + 4, h: Wd.h + 4 });
    ctx.beginPath(); ctx.rect(Wd.x - 2, Wd.y - 2, Wd.w + 4, Wd.h + 4);
    if (hole) ctx.rect(hole.x, hole.y, hole.w, hole.h);
    ctx.fillStyle = rgba(PAL.ground, Math.min(1, vl)); ctx.fill('evenodd');
    ctx.restore();
  }
  ctx.restore();
}
// a word set down on the desk: scale 1.04 → 1 and opacity in wordIn, as each word enters
function deskWords(ctx, v, ws, x, y, size, t, { weight = 600, color = PAL.ink, alpha = 1 } = {}) {
  const f = { ...FONT, weight, size: size * v.a };
  const sp = measure(ctx, ' ', f).width;
  let cx = 0;
  const [sx, sy] = L.pt(v, x, y);
  for (const w of ws) {
    const ww = measure(ctx, w.w, f).width;
    if (t >= w.t) {
      const u = cubicOut(clamp((t - w.t) / C.wordIn)), k = 1.04 - 0.04 * u;
      ctx.save(); ctx.translate(sx + cx, sy); ctx.scale(k, k);
      text(ctx, w.w, 0, 0, f, { color, alpha: u * alpha });
      ctx.restore();
    }
    cx += ww + sp;
  }
}
const grow = (r, d) => ({ x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d });
const pIn = (t, [a, b]) => clamp((t - a) / (b - a));

// the camera at film time t: { v (world → screen), owner (instance drawing exhibits itself), veils }
function camera(t) {
  const s = sceneAt(t), q = t - s.start, m = INST.get(s.i) || {};
  if (s.type === 'open') return { v: m.open.camera(pIn(q, s.p.pull)).view };
  if (s.type === 'read' && s.p.travel && q < s.p.travel[1]) return { v: L.camView(m.travel.camera(pIn(q, s.p.travel)).x) };
  if (s.type === 'carry' && q >= s.p.carry[0] && q < s.p.carry[1]) return { v: L.camView(m.carry.camera(pIn(q, s.p.carry)).x) };
  if (s.type === 'carry' && q < s.p.carry[0]) return { v: L.camView(s.prev.cam) };
  if (s.type === 'lockup') {
    const last = S.slice(0, s.i).reverse().find((x) => x.e)?.e;
    return { v: L.lerpView(L.camView(last.cam), OV.view, cubicInOut(pIn(q, s.p.rise))) };
  }
  return { v: L.camView(s.e.cam) };
}

function paint(ctx, t) {
  t = clamp(t, 0, duration);
  const s = sceneAt(t), q = t - s.start, m = INST.get(s.i) || {};
  const { v } = camera(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  desk(ctx, v);

  // which exhibit is in focus, and which a move draws itself
  let focus = s.e?.id, owned = [];
  let move = null, mp = 0;
  if (s.type === 'open') { move = m.open; mp = pIn(q, s.p.pull); owned = [s.e.id]; }
  if (s.type === 'read' && s.p.travel && q < s.p.travel[1]) { move = m.travel; mp = pIn(q, s.p.travel); owned = m.travel.owns; }
  if (s.type === 'carry' && q >= s.p.carry[0] && q < s.p.carry[1]) { move = m.carry; mp = pIn(q, s.p.carry); owned = m.carry.owns; }
  if (s.type === 'carry' && q < s.p.carry[0]) focus = s.prev.id;
  const rise = s.type === 'lockup' ? cubicInOut(pIn(q, s.p.rise)) : 0;
  const after = afterCarry(s, q);   // the target of a carry, stepped back outside its ring

  for (const e of WD.list) {
    if (owned.includes(e.id)) continue;
    if (after && e.id === after.e.id) continue;
    const vl = s.type === 'lockup' ? lerp(e.id === lastExhibit(s)?.id ? 0 : 0.55, 0.5, rise) : e.id === focus ? 0 : 0.55;
    exhibit(ctx, e, v, vl);
  }
  if (after) exhibit(ctx, after.e, v, lerp(after.vl, 0.5, rise), after.vl > 0.001 ? after.hole : null);
  const moving = (s.type === 'carry' && q < s.p.carry[1]) || (s.type === 'read' && s.p.travel && q < s.p.travel[1]);
  captions(ctx, v, t, moving ? null : focus, rise);

  // the move's own layer (its windows, chips and rings), then the neighbours it leaves veiled
  if (move) {
    move.draw(ctx, mp, { blur: false });
    if (s.type === 'carry') {
      const pan = move.state(mp).pan;
      const c4 = move.track(mp), chip = grow({ x: c4[0][0], y: c4[0][1], w: c4[3][0] - c4[0][0], h: c4[3][1] - c4[0][1] }, 12);
      for (const [e, a] of [[s.prev, 0.55 * pan], [s.e, 0.55 * (1 - pan)]]) if (a > 0.001) {
        const r = grow(L.rect(v, L.windowOfE(e)), 2);
        ctx.save(); clipWindow(ctx, { ...r, r: 12 });
        ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.rect(chip.x, chip.y, chip.w, chip.h);
        ctx.fillStyle = rgba(PAL.ground, a); ctx.fill('evenodd'); ctx.restore();
      }
    }
  }
  if (s.type === 'read') readLayer(ctx, s, q, m, v);
  if (s.type === 'carry' && q < s.p.carry[0]) ring(ctx, grow(m.carry.D.chip0, 6), PW, { pad: 0, radius: 10, width: 3, draw: cubicInOut(pIn(q, s.p.ringIn)) });
  if (after?.ring) ring(ctx, grow(L.rect(v, after.ringRect), 8), PW, { pad: 0, radius: 10, width: 3, draw: after.ring });
  carryCards(ctx, v, t);
  measures(ctx, v, t);
  if (s.type === 'lockup') lockup(ctx, s, q, v);
  falloff(ctx);
}
const lastExhibit = (s) => S.slice(0, s.i).reverse().find((x) => x.e)?.e;

// the target of the last carry, from its landing on: veil outside the ring and the ring itself
function afterCarry(s, q) {
  const c = S.slice(0, s.i + 1).reverse().find((x) => x.type === 'carry');
  if (!c) return null;
  const tc = (s.i === c.i ? q : s.start + q - c.start);
  if (tc < c.p.carry[1]) return null;
  const ringRect = L.fileRect(c.e, c.to.ring);
  let vl = 0.45 * cubicOut(pIn(tc, c.p.veil));
  // the ring stays until a measure on the same exhibit takes the marker; the exhibit comes forward again while the
  // dimension draws (a measurement needs the whole exhibit)
  const mz = S.find((x) => x.i > c.i && x.type === 'measure' && x.exhibit === c.exhibit);
  let r = 1;
  if (mz && s.start + q >= mz.start) {
    const qm = s.start + q - mz.start;
    r = mz.p.unringM ? 1 - cubicInOut(pIn(qm, mz.p.unringM)) : 0;
    vl *= 1 - cubicInOut(pIn(qm, mz.p.dim));
  }
  if (s.type === 'lockup') r = 0;
  const onIt = (s.e?.id === c.e.id) || s.type === 'lockup';
  if (!onIt && s.type !== 'carry') return null;
  return { e: c.e, vl, hole: grow(ringRect, 8), ringRect, ring: r };
}

// a read scene's layer: rings drawn on, the lift-out, notes, the reading marker, the readings going back
function readLayer(ctx, s, q, m, v) {
  const P = s.p, lift = m.lift;
  if (P.travel && q < P.travel[1]) return;
  const content = L.rect(v, { x: s.e.x, y: s.e.y + L.BAR, w: s.e.w, h: s.e.h });
  if (q < P.lift[0]) {
    lift.cards.forEach((c, k) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: cubicInOut(pIn(q, P.rings[k])) }));
    return;
  }
  if (q >= P.unring[0]) {
    lift.cards.forEach((c) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: 1 - cubicInOut(pIn(q, P.unring)) }));
    return;
  }
  const p = q < P.back[0] ? pIn(q, P.lift) : 1 - pIn(q, P.back);
  const dim = lift.state(p).dim;
  ctx.save(); veil(ctx, content, PW, dim); ctx.restore();
  lift.draw(ctx, p, { blur: false });
  if (q >= P.back[0]) return;
  // the reading marker: while card k is read, the others step back; notes enter a beat into their reading
  const n = lift.cards.length;
  const cur = P.reading.reduce((a, [from], k) => (q >= from ? k : a), -1);
  const capOn = P.capAt != null && q >= P.capAt;
  lift.cards.forEach((c, k) => {
    if (s.cells[k].note && q >= P.noteAt[k]) {
      const a = cubicOut(clamp((q - P.noteAt[k]) / C.wordIn));
      text(ctx, s.cells[k].note, c.labelX, c.y + c.h / 2 + 52, { ...MONO, size: lift.note }, { color: PAL.smuted, alpha: a });
    }
    if (n > 1 && cur >= 0 && !capOn && k !== cur && q >= P.lift[1]) {
      ctx.save(); ctx.fillStyle = rgba(PAL.ground, 0.5); ctx.fillRect(c.x, c.y, c.w, c.h); ctx.restore();
    }
  });
}

// a caption steps back with its exhibit (out of focus 0.45) and fades in the last 0.15 s before the next caption on
// its exhibit begins
function captions(ctx, v, t, focus, rise) {
  for (const c of CAPS) {
    if (t < c.from || t >= c.to) continue;
    const e = E[c.ex];
    const back = focus == null ? 1 : c.ex === focus ? 1 : 0.45;
    const alpha = lerp(back, 0.6, rise) * (1 - clamp((t - (c.to - C.wordIn)) / C.wordIn));
    deskWords(ctx, v, c.words, e.x, WD.capY, L.CAPTION, t, { alpha });
  }
}

// the carried reading: code-drawn on label stock, lifted over the exhibit with its shadow; set down under it during
// the rise
function carryCards(ctx, v, t) {
  for (const s of S) {
    if (s.type !== 'carry' || !s.card) continue;
    const q = t - s.start;
    if (q < s.p.card[0]) continue;
    const lockS = S.find((x) => x.type === 'lockup');
    const r = lockS ? cubicInOut(pIn(t - lockS.start, lockS.p.rise)) : 0;
    const e = s.e;
    // lifted: lower right of the exhibit on screen at its camera; resting: under the exhibit, below its caption line
    const liftFoot = { x: e.x + e.w - CARD.w + 60, y: e.y + L.BAR + e.h - CARD.h + 40, w: CARD.w, h: CARD.h };
    const restFoot = { x: e.x, y: WD.capY + L.CARD_GAP, w: CARD.w, h: CARD.h };
    const foot = { x: lerp(liftFoot.x, restFoot.x, r), y: lerp(liftFoot.y, restFoot.y, r), w: CARD.w, h: CARD.h };
    const up = cubicOut(pIn(q, s.p.card)) * (1 - r);
    const f0 = L.rect(v, foot), k = 1 + 0.06 * up;
    const R = { x: 960 + (f0.x - 960) * k, y: 540 + (f0.y - 540) * k, w: f0.w * k, h: f0.h * k }, sc = R.w / CARD.w;
    if (up > 0.001) { ctx.save(); ctx.filter = `blur(${6 + 22 * up}px)`; ctx.fillStyle = `rgba(30,28,24,${0.3 * up})`; ctx.fillRect(f0.x + 20 * up, f0.y + 28 * up, f0.w, f0.h); ctx.restore(); }
    ctx.save();
    rrect(ctx, R.x, R.y, R.w, R.h, 6 * sc); ctx.fillStyle = PAL.stock; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = PAL.mat; ctx.stroke();
    const tt = (x) => s.start + x;
    if (s.card.meta && q >= s.p.metaAt) text(ctx, s.card.meta, R.x + 34 * sc, R.y + 58 * sc, { ...MONO, size: 25 * sc }, { color: PAL.smuted, alpha: cubicOut(clamp((q - s.p.metaAt) / C.wordIn)) });
    const vw = s.p.words.filter((w) => w.tag === 'card value').map((w) => ({ ...w, t: tt(w.t) }));
    const lw = s.p.words.filter((w) => w.tag === 'card line').map((w) => ({ ...w, t: tt(w.t) }));
    const sv = { a: sc, bx: R.x, by: R.y };
    deskWords(ctx, sv, vw, 30, 172, 105, t, { weight: 700, color: PAL.sink });
    deskWords(ctx, sv, lw, 34, 246, 44, t, { weight: 500, color: PAL.sink });
    ctx.restore();
  }
}

// a dimension on the exhibit's own axis: from a to b, offset to the side, ticks at both ends, dashed drops to the
// points it measures, and a chip of label stock with the computed difference
function measures(ctx, v, t) {
  for (const s of S) {
    if (s.type !== 'measure') continue;
    const q = t - s.start;
    if (q < s.p.dim[0]) continue;
    const e = s.e;
    const [ax, ay] = L.pt(v, ...L.fileToWorld(e, ...s.a.point)), [bx, by] = L.pt(v, ...L.fileToWorld(e, ...s.b.point));
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = dy / len, ny = -dx / len;
    const sgn = Math.abs(dx) > Math.abs(dy) ? (ny > 0 ? 1 : -1) : (nx > 0 ? 1 : -1);   // below a horizontal span, right of a vertical one
    const off = 44 * Math.max(v.a, 0.4) * sgn, tk = 14 * Math.max(v.a, 0.4);
    const A = [ax + nx * off, ay + ny * off], Bp = [bx + nx * off, by + ny * off];
    const u = cubicInOut(pIn(q, s.p.dim)), Ex = lerp(A[0], Bp[0], u), Ey = lerp(A[1], Bp[1], u);
    ctx.save();
    ctx.strokeStyle = PAL.accent; ctx.lineWidth = 4; ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(A[0] - nx * tk, A[1] - ny * tk); ctx.lineTo(A[0] + nx * tk, A[1] + ny * tk);
    ctx.moveTo(A[0], A[1]); ctx.lineTo(Ex, Ey);
    if (u >= 1) { ctx.moveTo(Bp[0] - nx * tk, Bp[1] - ny * tk); ctx.lineTo(Bp[0] + nx * tk, Bp[1] + ny * tk); }
    ctx.stroke();
    ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(A[0], A[1]); if (u >= 1) { ctx.moveTo(bx, by); ctx.lineTo(Bp[0], Bp[1]); } ctx.stroke();
    ctx.restore();
    // the chip: lands on the dimension's middle, outside it
    if (q >= s.p.landAt - 0.2 * B) {
      const k = settle(pIn(q, [s.p.landAt - 0.2 * B, s.p.landAt]), 10);
      const size = 44 * Math.max(v.a, 0.45), label = measureLabel(s);
      const f = { ...FONT, weight: 650, size };
      const tw = measure(ctx, label, f).width, px = 0.4 * size, h = 1.42 * size;
      const mx = (A[0] + Bp[0]) / 2 + nx * (Math.abs(off) * 0.4 + 10) * sgn, my = (A[1] + Bp[1]) / 2 + ny * (Math.abs(off) * 0.4) * sgn;
      const x = sgn * nx >= 0 && Math.abs(nx) > 0.5 ? mx : mx - (tw + 2 * px) / 2, y = my - h / 2 + (Math.abs(ny) > 0.5 ? (ny * sgn > 0 ? h / 2 : -h / 2) : 0);
      ctx.save(); ctx.globalAlpha = k;
      rrect(ctx, x, y, tw + 2 * px, h, 8); ctx.fillStyle = PAL.stock; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = PAL.mat; ctx.stroke();
      text(ctx, label, x + px, y + h / 2 + 0.36 * size, f, { color: PAL.sink });
      ctx.restore();
    }
  }
}

// the lock-up: the title block on the desk (optional mark asset, the name, the rule, the line, the address), the
// ring's route over the row, and the last ring round the address on the last downbeat
function lockup(ctx, s, q, v) {
  const P = s.p, tb = OV.tb;
  if (q >= P.name[0]) {
    const u = settle(pIn(q, P.name), 10);
    if (s.mark) {
      const a = content.assets[s.mark], [cx, cy, cw, ch] = a.crop, h = tb.markH, w = (h * cw) / ch;
      const [x, y] = L.pt(v, tb.x, tb.markY);
      ctx.save(); ctx.globalAlpha = u; ctx.drawImage(IMG[s.mark], cx, cy, cw, ch, x, y, w * v.a, h * v.a); ctx.restore();
    }
    const [x, y] = L.pt(v, tb.x - tb.nameSize * 0.04, tb.nameY);
    const k = 1.04 - 0.04 * u;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    text(ctx, s.name, 0, 0, { ...FONT, weight: 600, size: tb.nameSize * v.a }, { color: PAL.ink, alpha: u });
    ctx.restore();
  }
  if (s.line) deskWords(ctx, v, P.words.filter((w) => w.tag === 'line').map((w) => ({ ...w, t: s.start + w.t })), tb.x, tb.lineY, tb.lineSize, s.start + q, { weight: 500, color: PAL.muted });
  if (q >= P.urlAt) {
    const n = Math.max(1, Math.floor(clamp((q - P.urlAt) / (P.urlTyped - P.urlAt)) * s.url.length + 1e-9));
    const [x, y] = L.pt(v, tb.x, tb.urlY);
    text(ctx, s.url.slice(0, n), x, y, { ...MONO, size: tb.urlSize * v.a }, { color: PAL.muted });
  }
  if (q >= P.rule[0]) {
    const nameW = measure(ctx, s.name, { ...FONT, weight: 600, size: tb.nameSize }).width;
    const [x0, y] = L.pt(v, tb.x, tb.ruleY), x1 = x0 + nameW * v.a * cubicInOut(pIn(q, P.rule));
    ctx.save(); ctx.strokeStyle = PAL.accent; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
  }
  if (q >= P.route[0] && ROUTE.length) {
    const top = (r) => [r.x + r.w / 2, r.y];
    const pts = [];
    ROUTE.forEach((r, k) => { const [x, y] = top(r); if (k) pts.push([x, OV.laneY]); pts.push([x, y]); if (k < ROUTE.length - 1) pts.push([x, OV.laneY]); });
    const sp = pts.map(([x, y]) => L.pt(v, x, y));
    let len = 0; for (let k = 1; k < sp.length; k++) len += Math.hypot(sp[k][0] - sp[k - 1][0], sp[k][1] - sp[k - 1][1]);
    ctx.save(); ctx.strokeStyle = PAL.accent; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([len * cubicInOut(pIn(q, P.route)), len + 10]);
    ctx.beginPath(); ctx.moveTo(...sp[0]); for (const p of sp.slice(1)) ctx.lineTo(...p); ctx.stroke(); ctx.restore();
  }
  if (q >= P.last[0]) {
    const w = measure(ctx, s.url, { ...MONO, size: tb.urlSize }).width;
    const r = L.rect(v, { x: tb.x, y: tb.urlY - tb.urlSize * 0.8, w, h: tb.urlSize * 1.05 });
    ring(ctx, r, PW, { pad: 12, radius: 10, width: 3, draw: cubicOut(pIn(q, P.last)) });
  }
}

// ---------- motion blur: the fastest tracked point in px per frame ----------
const track = (t) => {
  const s = sceneAt(t), q = t - s.start, m = INST.get(s.i) || {}, out = [];
  const { v } = camera(t);
  out.push(L.pt(v, 0, 0), L.pt(v, 3000, 1500));
  const add = (inst, span, rev) => { if (inst && q > span[0] && q < span[1]) { const p = pIn(q, span); out.push(...inst.track(rev ? 1 - p : p)); } };
  if (s.type === 'read') { add(m.lift, s.p.lift); add(m.lift, s.p.back, true); }
  if (s.type === 'carry') add(m.carry, s.p.carry);
  return out;
};
const speedAt = (t) => {
  if (t < 1 / FPS) return 0;
  const a = track(t), b = track(t - 1 / FPS);
  let sp = 0;
  for (let k = 0; k < Math.min(a.length, b.length); k++) sp = Math.max(sp, Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1]));
  return sp;
};

let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
export const render = (ctx, t) => subframes(ctx, paint, t, { speed: speedAt, fps: FPS, shutter: 0.5 });

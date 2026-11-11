// film.js — the Exhibit renderer: a pure function of t (render(ctx, t)), wired through lib/boot.js.
//
// A multiplane desk under a camera looking straight down (layout.js): the desk and each exhibit's index numeral at
// the back, the prints in their mounts on a glass in the middle, the chips (the claim a print carries, set in code)
// on a glass in front. The camera travels between prints along the row with parallax, pulls back over the whole desk
// and hops, or cuts on a value two prints share (moves.js: the library's moves, pluggable); one pencil ring finds what
// a claim rests on, and at the claim the region lifts out as code-drawn readings. At the end the camera rises over
// the whole desk and the ring's route ends as the rule under the name. Times come from choreo.js, the same module
// timing.rules.js and score.mjs read.
import content from './content.js';
import rules, { validate } from './timing.rules.js';
import { fit } from './lib/timing.js';
import PALETTES from './palettes.js';
import { plan, exhibitBefore, measureLabel, travelMove, C } from './choreo.js';
import { ADAPTERS, moveOf, COLORS } from './moves.js';
import * as L from './layout.js';
import { createHandoff } from './lib/handoffs/index.js';
import liftOut from './lib/handoffs/lift-out.js';
import bezelPullback from './lib/handoffs/bezel-pullback.js';
import parallaxSlide from './lib/handoffs/parallax-slide.js';
import cameraTruck from './lib/handoffs/camera-truck.js';
import gridHop from './lib/handoffs/grid-hop.js';
import matchCut from './lib/handoffs/match-cut.js';
import { windowBack, windowFront, clipWindow, ring, zoomBetween, veil } from './lib/handoffs/asset.js';
import { castShadow, paintView } from './lib/handoffs/stage.js';
import { text, measure, rrect, rgba, cubicInOut, cubicOut, settle, clamp, lerp } from './lib/handoffs/util.js';
import { subframes } from './lib/canvas.js';
import { mulberry32 } from './lib/rng.js';

const problems = validate(content);
if (problems.length) throw new Error('content.js\n' + problems.join('\n'));

export const T = fit(content, rules);
export const duration = T.duration;
const B = T.beat, FPS = 30;
const PAL = PALETTES[content.palette];
if (!PAL) throw new Error(`content.js\npalette "${content.palette}" is not in palettes.js (${Object.keys(PALETTES).join(', ')})`);
const DESK = content.desk ?? 'plain';
const FAM = 'Instrument Sans', MONO_FAM = 'IBM Plex Mono';
const FONT = { family: FAM, weight: 600 }, MONO = { family: MONO_FAM, weight: 500 };
export const fonts = [{ family: FAM, weight: 700 }, { family: FAM, weight: 600 }, { family: FAM, weight: 500 }, { family: MONO_FAM, weight: 500 }];
const PW = { colors: COLORS(PAL), mono: MONO };

const WD = L.world(content);
const E = WD.E;
const LOCK = content.scenes.find((s) => s.type === 'lockup');
const OV = L.overview(WD, { line: LOCK?.line, mark: LOCK?.mark });
const ZGRID = L.overviewZoom(WD);   // grid-hop opens to the whole desk at the zoom of the closing overview's row

const S = T.scenes.map((s, i) => {
  const ctx = { i, scenes: T.scenes, content };
  const dur = s.end - s.start;
  const p = plan(s, ctx, B, dur, content);
  return { ...s, i, dur, p, e: E[s.exhibit], prev: E[exhibitBefore(T.scenes, i)] ?? null };
});
const sceneAt = (t) => (t < S[0].start ? S[0] : S.find((s) => t >= s.start - 1e-9 && t < s.end - 1e-9) ?? S.at(-1));
const lastExhibit = (s) => S.slice(0, s.i).reverse().find((x) => x.e)?.e;

// captions lie on the middle plane under their print, from their first word until the next caption on that print
const CAPS = [];
for (const s of S) {
  if (s.p.capAt == null || !s.caption) continue;
  CAPS.push({ ex: s.exhibit, from: s.start + s.p.capAt, words: s.p.words.filter((w) => w.tag === 'caption' || w.tag === 'claim').map((w) => ({ ...w, t: s.start + w.t })) });
}
CAPS.forEach((c, k) => { const next = CAPS.slice(k + 1).find((d) => d.ex === c.ex); c.to = next ? next.from : Infinity; });

// the regions the ring visited, in order (the first cell of each read, both sides of each match): the route at the end
const ROUTE = [];
for (const s of S) {
  if (s.type === 'read' && s.cells?.length) ROUTE.push(L.fileRect(s.e, s.cells[0].box));
  if (s.type === 'match') { ROUTE.push(L.fileRect(s.prev, s.from.box)); ROUTE.push(L.fileRect(s.e, s.to.box)); }
}

const IMG = {};
const INST = new Map();   // scene index → the move instance(s) it plays
const assetOf = (id) => ({ image: IMG[id], crop: E[id] ? E[id].region : content.assets[id].crop });

export const ready = async () => {
  for (const [id, a] of Object.entries(content.assets)) {
    const img = new Image();
    img.src = `assets/real/${a.file}`;
    await img.decode();
    IMG[id] = img;
  }
  const env = {
    createHandoff, zoomBetween, measure, world: WD, content, PAL, FONT, MONO, assetOf,
    modules: { 'lift-out': liftOut, 'bezel-pullback': bezelPullback, 'parallax-slide': parallaxSlide, 'camera-truck': cameraTruck, 'grid-hop': gridHop, 'match-cut': matchCut },
  };
  const mv = content.moves ?? {};
  for (const s of S) {
    let m = null;
    if (s.type === 'open') m = await ADAPTERS.open[moveOf('open', mv.open).id].create(env, { e: s.e, s });
    if (s.type === 'travel') m = await ADAPTERS.travel[travelMove(s, content).id].create(env, { from: s.prev, e: s.e, s, zoom: ZGRID });
    if (s.type === 'read') m = await ADAPTERS.lift[moveOf('lift', mv.lift).id].create(env, { e: s.e, cells: s.cells, s });
    if (s.type === 'match') m = await ADAPTERS.match[moveOf('match', mv.match).id].create(env, { from: s.prev, e: s.e, s });
    if (m) INST.set(s.i, m);
  }
};

// ---------- the camera ----------
const pIn = (t, [a, b]) => clamp((t - a) / (b - a));
// { cam, move (an instance drawing now), mp (its progress) } at film time t
function shot(t) {
  const s = sceneAt(t), q = t - s.start, m = INST.get(s.i);
  if (s.type === 'open') return { cam: m.camera(pIn(q, s.p.pull)), move: m, mp: pIn(q, s.p.pull) };
  if (s.type === 'travel' && q < s.p.move[1]) return { cam: m.camera(pIn(q, s.p.move)), move: m, mp: pIn(q, s.p.move) };
  if (s.type === 'match' && q < s.p.move[0]) return { cam: L.restCam(s.prev) };
  if (s.type === 'match' && q < s.p.move[1]) return { cam: m.camera(pIn(q, s.p.move)), move: m, mp: pIn(q, s.p.move) };
  if (s.type === 'lockup') return { cam: L.lerpCam(L.restCam(lastExhibit(s)), OV.cam, cubicInOut(pIn(q, s.p.rise))) };
  return { cam: L.restCam(s.e) };
}

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
// the desk (the back plane): ground, a fixed-seed fibre texture, and with desk 'mat' a cutting mat's grid (1 px,
// decoration) every 80 desk px; both move and scale with the back plane
function desk(ctx, cam) {
  const v = L.planeView(cam, L.DEPTH.back);
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
const under = (ctx, v) => ctx.setTransform(v.a, 0, 0, v.a, v.bx, v.by);
// the back plane: an exhibit's index numeral (as parallax-slide draws it), fading as the camera rises over the desk
function numerals(ctx, cam, skip = []) {
  // only the prints near the camera show their numerals (the far plane would show every index at once)
  const v = L.planeView(cam, L.DEPTH.back), za = clamp((cam.z - 0.6) / 0.4), c = (cam.cx - 960) / L.S;
  if (za <= 0) return;
  ctx.save(); under(ctx, v);
  for (const e of WD.list) {
    const alpha = za * clamp(1.5 - Math.abs(e.i - c));
    if (skip.includes(e.id) || alpha <= 0) continue;
    const n = L.numeralAt(e);
    text(ctx, e.index, n.x, n.baseline, { ...FONT, weight: 800, size: L.NUMERAL.size }, { color: PW.colors.line, alpha });
  }
  ctx.restore();
}
// the front plane: an exhibit's chip (as parallax-slide draws it: a card of label stock, the pencil's tick, label, value)
function chips(ctx, cam, skip = [], t = 0) {
  const v = L.planeView(cam, L.DEPTH.front), C2 = PW.colors;
  for (const e of WD.list) {
    if (!e.chip || skip.includes(e.id)) continue;
    const c0 = L.chipAt(e), out = chipAside(e, t), c = { ...c0, x: c0.x + out * (L.W - L.CHIP.x + 40) }, r = L.rect(v, c);
    if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) continue;
    ctx.save();
    castShadow(ctx, r, { radius: 10 * v.a, alpha: 0.5, blur: 36 * v.a, dy: 18 * v.a });
    under(ctx, v);
    ctx.fillStyle = C2.panel; rrect(ctx, c.x, c.y, c.w, c.h, 10); ctx.fill();
    ctx.strokeStyle = C2.line; ctx.lineWidth = 2; rrect(ctx, c.x + 1, c.y + 1, c.w - 2, c.h - 2, 9); ctx.stroke();
    ctx.fillStyle = C2.accent; ctx.fillRect(c.x + 28, c.y + 34, 6, c.h - 68);
    text(ctx, e.chip[0], c.x + 56, c.y + 66, { ...FONT, weight: 500, size: 32 }, { color: C2.dim });
    text(ctx, e.chip[1], c.x + 56, c.y + 150, { ...FONT, weight: 700, size: 76 }, { color: C2.ink });
    ctx.restore();
  }
}
// the middle plane: one exhibit in its mount (shadow, mount, content, bar), veiled toward the desk by vl
function shadowOf(ctx, v, e, k = 1) {
  const r = L.rect(v, L.windowOfE(e));
  if (r.x > W || r.x + r.w < 0) return;
  castShadow(ctx, r, { radius: 12 * v.a * k, alpha: 0.4 * k, blur: 30 * v.a, dy: 14 * v.a * k });
}
function mount(ctx, v, e, { vl = 0, content: withContent = true, front = true } = {}) {
  const Wd = L.windowOfE(e), r = L.rect(v, Wd);
  if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) return;
  ctx.save();
  shadowOf(ctx, v, e);
  under(ctx, v);
  windowBack(ctx, Wd, PW);
  if (withContent) { ctx.save(); clipWindow(ctx, Wd); paintView(ctx, assetOf(e.id), L.fileView({ a: 1, bx: 0, by: 0 }, e), L.contentOfE(e)); ctx.restore(); }
  if (front) windowFront(ctx, Wd, PW, { title: e.source });
  if (vl > 0) { ctx.save(); clipWindow(ctx, { ...Wd, x: Wd.x - 2, y: Wd.y - 2, w: Wd.w + 4, h: Wd.h + 4 }); ctx.fillStyle = rgba(PAL.ground, Math.min(1, vl)); ctx.fillRect(Wd.x - 2, Wd.y - 2, Wd.w + 4, Wd.h + 4); ctx.restore(); }
  ctx.restore();
}
function border(ctx, v, e) {
  const Wd = L.windowOfE(e);
  ctx.save(); under(ctx, v);
  rrect(ctx, Wd.x + 1, Wd.y + 1, Wd.w - 2, Wd.h - 2, Wd.r - 1); ctx.strokeStyle = PW.colors.line; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
// a word set down on a plane: scale 1.04 → 1 and opacity in wordIn, as each word enters
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
// a ring round a file box of exhibit e (match-cut's: 12 px padding, clipped to the content)
function boxRing(ctx, v, e, box, draw) {
  if (draw <= 0) return;
  const c = L.rect(v, L.contentOfE(e));
  ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip();
  ring(ctx, L.rect(v, L.fileRect(e, box)), PW, { pad: 12 * v.a, radius: 10, width: 3, draw });
  ctx.restore();
}

function paint(ctx, t) {
  t = clamp(t, 0, duration);
  const s = sceneAt(t), q = t - s.start;
  const { cam, move, mp } = shot(t);
  const v = L.viewOf(cam);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  desk(ctx, cam);
  const dr = move?.draws ?? {};
  numerals(ctx, cam, dr.numerals ?? []);

  // the middle plane: every print not drawn by the move in play
  const focus = move ? null : (s.type === 'match' && q < s.p.move[0] ? s.prev.id : s.e?.id ?? null);
  const rise = s.type === 'lockup' ? cubicInOut(pIn(q, s.p.rise)) : 0;
  const owned = move?.owns ?? [];
  for (const e of WD.list) {
    if (dr.tiles) { mount(ctx, v, e, { content: false }); continue; }
    if (owned.includes(e.id)) {
      // the module draws this mount; the template lays its shadow under it where the module does not
      if (dr.shadows) continue;
      if (move.frame) {   // bezel-pullback: the shadow grows with the mount
        const f = move.frame(mp);
        if (f.u > 0) castShadow(ctx, { x: f.x, y: f.y, w: f.w, h: f.h }, { radius: f.r, alpha: 0.4 * f.u, blur: 30 * v.a, dy: 14 * v.a * f.u });
      } else shadowOf(ctx, v, e);
      continue;
    }
    const vl = s.type === 'lockup' ? lerp(e.id === lastExhibit(s)?.id ? 0 : 0.55, 0.5, rise) : 0;
    mount(ctx, v, e, { vl });
  }
  captions(ctx, v, t, focus, rise);

  // the move in play
  if (move) {
    ctx.save();
    if (move.transform) ctx.setTransform(...move.transform);
    move.draw(ctx, mp);
    ctx.restore();
    if (dr.tiles) for (const e of WD.list) border(ctx, v, e);
  }
  measureVeil(ctx, v, t);
  chips(ctx, cam, dr.chips ?? [], t);

  if (s.type === 'read') readLayer(ctx, s, q, INST.get(s.i), v);
  if (s.type === 'match' && q < s.p.move[0]) boxRing(ctx, v, s.prev, s.from.box, cubicInOut(pIn(q, s.p.ringIn)));
  heldRing(ctx, v, s, q);
  measures(ctx, v, t);
  if (s.type === 'lockup') lockup(ctx, s, q, v);
  falloff(ctx);
}

// the ring a match leaves round the value it landed on, until a measure on that print takes the pencil
function heldRing(ctx, v, s, q) {
  const m = S.slice(0, s.i + 1).reverse().find((x) => x.type === 'match');
  if (!m) return;
  const tm = s.start + q - m.start;
  if (tm < m.p.move[1]) return;
  if (s.i !== m.i && s.exhibit !== m.exhibit) return;
  let r = 1;
  if (s.type === 'measure' && s.exhibit === m.exhibit) r = s.p.unringM ? 1 - cubicInOut(pIn(q, s.p.unringM)) : 0;
  if (s.type === 'lockup' || (s.i > m.i && s.type !== 'measure')) r = 0;
  boxRing(ctx, v, m.e, m.to.box, r);
}

// a read: rings drawn on, the lift-out, notes, the reading marker, the readings going back
function readLayer(ctx, s, q, lift, v) {
  const P = s.p;
  const content = L.rect(v, L.contentOfE(s.e));
  if (q < P.lift[0]) {
    lift.cards.forEach((c, k) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: cubicInOut(pIn(q, P.rings[k])) }));
    return;
  }
  if (q >= P.unring[0]) {
    lift.cards.forEach((c) => ring(ctx, c.r0, PW, { pad: 6, radius: 10, width: 3, draw: 1 - cubicInOut(pIn(q, P.unring)) }));
    return;
  }
  const p = q < P.back[0] ? pIn(q, P.lift) : 1 - pIn(q, P.back);
  ctx.save(); veil(ctx, content, PW, lift.state(p).dim); ctx.restore();
  lift.draw(ctx, p);
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

// a caption steps back while the camera moves (0.45 off its print) and fades in the last 0.15 s before the next
// caption on its print begins
function captions(ctx, v, t, focus, rise) {
  for (const c of CAPS) {
    if (t < c.from || t >= c.to) continue;
    const e = E[c.ex];
    const back = focus == null || c.ex === focus ? 1 : 0.45;
    const alpha = lerp(back, 0.6, rise) * (1 - clamp((t - (c.to - C.wordIn)) / C.wordIn));
    deskWords(ctx, v, c.words, e.x, WD.capY, L.CAPTION, t, { alpha });
  }
}

// the climax isolates the measured gap: as its chip lands, the rest of the print steps back (45 %) round the span
// the dimension measures, and stays back until the camera rises
function measureVeil(ctx, v, t) {
  for (const s of S) {
    if (s.type !== 'measure') continue;
    const q = t - s.start;
    if (q < s.p.landAt - 0.2 * B) continue;
    const lk = S.find((x) => x.type === 'lockup');
    const rise = lk && t >= lk.start ? cubicInOut(pIn(t - lk.start, lk.p.rise)) : 0;
    const k = cubicOut(pIn(q, [s.p.landAt - 0.2 * B, s.p.landAt + 0.3 * B])) * (1 - rise);
    if (k <= 0) continue;
    const G = measureGeom(s, v), pad = 40 * G.k;
    const xs = [G.ax, G.bx, G.A[0], G.Bp[0], G.chip.x, G.chip.x + G.chip.w], ys = [G.ay, G.by, G.A[1], G.Bp[1], G.chip.y, G.chip.y + G.chip.h];
    const hole = { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
    const c = L.rect(v, L.contentOfE(s.e));
    ctx.save();
    ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip();
    ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.rect(hole.x, hole.y, hole.w, hole.h);
    ctx.fillStyle = rgba(PAL.ground, 0.45 * k); ctx.fill('evenodd');
    ctx.restore();
  }
}

// a dimension on the exhibit's own axis: from a to b, offset to the side, ticks at both ends, dashed drops to the
// points it measures, and a chip of label stock with the computed difference. The side: below a horizontal span,
// right of a vertical one, unless that leaves the print (then the other side)
let SCR = null;
function measureGeom(s, v) {
  const e = s.e, k = Math.max(v.a, 0.4);
  const [ax, ay] = L.pt(v, ...L.fileToWorld(e, ...s.a.point)), [bx, by] = L.pt(v, ...L.fileToWorld(e, ...s.b.point));
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const horiz = Math.abs(dx) >= Math.abs(dy);
  let n = horiz ? [0, 1] : [1, 0];
  const size = 44 * Math.max(v.a, 0.45), label = measureLabel(s);
  SCR ??= document.createElement('canvas').getContext('2d');
  const f = { ...FONT, weight: 650, size }, tw = measure(SCR, label, f).width, px = 0.4 * size, h = 1.42 * size, w = tw + 2 * px;
  const c = L.rect(v, L.contentOfE(e));
  const build = (nn) => {
    const off = 44 * k, A = [ax + nn[0] * off, ay + nn[1] * off], Bp = [bx + nn[0] * off, by + nn[1] * off];
    const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2;
    const chip = horiz
      ? { x: mx - w / 2, y: my + nn[1] * (h / 2 + 10 * k) - h / 2, w, h }
      : { x: nn[0] > 0 ? mx + 12 * k : mx - 12 * k - w, y: my - h / 2, w, h };
    const inside = [A, Bp].every(([x, y]) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) && chip.y + chip.h <= c.y + c.h && chip.y >= c.y;
    return { A, Bp, chip, inside, n: nn };
  };
  let G = build(n);
  if (!G.inside) { const F = build([-n[0], -n[1]]); if (F.inside) G = F; }
  return { ...G, ax, ay, bx, by, tk: 14 * k, k, size, label, f, px };
}
function measures(ctx, v, t) {
  for (const s of S) {
    if (s.type !== 'measure') continue;
    const q = t - s.start;
    if (q < s.p.dim[0]) continue;
    const G = measureGeom(s, v), [nx, ny] = G.n, { A, Bp, tk } = G;
    const u = cubicInOut(pIn(q, s.p.dim)), Ex = lerp(A[0], Bp[0], u), Ey = lerp(A[1], Bp[1], u);
    ctx.save();
    ctx.strokeStyle = PAL.accent; ctx.lineWidth = 4 * G.k; ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(A[0] - nx * tk, A[1] - ny * tk); ctx.lineTo(A[0] + nx * tk, A[1] + ny * tk);
    ctx.moveTo(A[0], A[1]); ctx.lineTo(Ex, Ey);
    if (u >= 1) { ctx.moveTo(Bp[0] - nx * tk, Bp[1] - ny * tk); ctx.lineTo(Bp[0] + nx * tk, Bp[1] + ny * tk); }
    ctx.stroke();
    ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(G.ax, G.ay); ctx.lineTo(A[0], A[1]); if (u >= 1) { ctx.moveTo(G.bx, G.by); ctx.lineTo(Bp[0], Bp[1]); } ctx.stroke();
    ctx.restore();
    if (q >= s.p.landAt - 0.2 * B) {
      const kk = settle(pIn(q, [s.p.landAt - 0.2 * B, s.p.landAt]), 10), r = G.chip;
      ctx.save(); ctx.globalAlpha = kk;
      rrect(ctx, r.x, r.y, r.w, r.h, 8); ctx.fillStyle = PAL.stock; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = PAL.mat; ctx.stroke();
      text(ctx, G.label, r.x + G.px, r.y + r.h / 2 + 0.36 * G.size, G.f, { color: PAL.sink });
      ctx.restore();
    }
  }
}
// a print's chip steps aside (out of the frame to the right, on its own plane) while a measure on that print would
// lie under it, and comes back as the camera rises
function chipAside(e, t) {
  const s = S.find((x) => x.type === 'measure' && x.exhibit === e.id);
  if (!s || t < s.start) return 0;
  if (s.aside == null) {
    const cam = L.restCam(e), v = L.viewOf(cam), G = measureGeom(s, v), c = L.rect(L.planeView(cam, L.DEPTH.front), L.chipAt(e));
    const rs = [G.chip, { x: Math.min(G.A[0], G.Bp[0], G.ax, G.bx) - 10, y: Math.min(G.A[1], G.Bp[1], G.ay, G.by) - 10, w: Math.abs(G.A[0] - G.Bp[0]) + Math.abs(G.ax - G.A[0]) + 20, h: Math.abs(G.A[1] - G.Bp[1]) + Math.abs(G.ay - G.A[1]) + 20 }];
    s.aside = rs.some((r) => r.x < c.x + c.w && r.x + r.w > c.x && r.y < c.y + c.h && r.y + r.h > c.y);
  }
  if (!s.aside) return 0;
  const lk = S.find((x) => x.type === 'lockup');
  const back = lk && t >= lk.start ? cubicInOut(pIn(t - lk.start, lk.p.rise)) : 0;
  return cubicInOut(pIn(t - s.start, [0, s.p.dim[0]])) * (1 - back);
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
    const pts = [];
    ROUTE.forEach((r, k) => { const x = r.x + r.w / 2, y = r.y; if (k) pts.push([x, OV.laneY]); pts.push([x, y]); if (k < ROUTE.length - 1) pts.push([x, OV.laneY]); });
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
  const s = sceneAt(t), q = t - s.start, out = [];
  const { cam, move, mp } = shot(t);
  const v = L.viewOf(cam);
  out.push(L.pt(v, 0, 0), L.pt(v, 3000, 1500));
  if (move) out.push(...move.track(mp));
  if (s.type === 'read') {
    const lift = INST.get(s.i), P = s.p;
    if (q > P.lift[0] && q < P.lift[1]) out.push(...lift.track(pIn(q, P.lift)));
    if (q > P.back[0] && q < P.back[1]) out.push(...lift.track(1 - pIn(q, P.back)));
  }
  return out;
};
const speedAt = (t) => {
  if (t < 1 / FPS) return 0;
  const a = track(t), b = track(t - 1 / FPS);
  let sp = 0;
  for (let k = 0; k < Math.min(a.length, b.length); k++) sp = Math.max(sp, Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1]));
  return sp;
};

export const setContext = () => {};
// the match-cut's cut is one frame: never blur across it (the two sources are never mixed)
const nearCut = (t) => S.some((s) => s.type === 'match' && Math.abs(t - (s.start + s.p.cut)) < 2 / FPS);
export const render = (ctx, t) => (nearCut(t) ? paint(ctx, t) : subframes(ctx, paint, t, { speed: speedAt, fps: FPS, shutter: 0.5 }));

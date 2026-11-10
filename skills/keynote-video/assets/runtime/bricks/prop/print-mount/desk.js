// desk.js — the engine of the exhibit bricks: a multiplane desk under a camera looking straight down. The desk and
// each print's index numeral lie at the back (rate 0.3), the prints in their mounts on a glass in the middle (rate 1),
// the chips (the claim a print carries, set in code) on a glass in front (rate 1.65). Prints lie one screen apart in a
// row; a camera { cx, cy, z } is the middle-plane point at the frame centre and its zoom. The runtime's moves
// (bezel-pullback, parallax-slide, camera-truck, grid-hop, lift-out, match-cut) rest on exactly this frame.
// Pure: every function is of its arguments. The scenes print-open, print-read, print-travel, value-match, gap-measure
// and desk-lockup import it.
// From the exhibit template (assets/templates/exhibit/layout.js; film.js desk, numerals, chips, mount, deskWords,
// boxRing, captions, measures, lockup; moves.js adapters; choreo.js C): geometry, planes and timings are the
// template's; the desk is a slot (`prints`: [{ image, crop, focus, source, chip }]) instead of content.js's assets.
import { clamp, lerp, rgba, rrect, text, measure, scratch, canvasOf, cubicOut, cubicInOut, settle } from '../../../handoffs/util.js';
import { windowBack, windowFront, clipWindow, ring, coverRect, placeholderPage, zoomBetween, veil } from '../../../handoffs/asset.js';
import { castShadow, paintView } from '../../../handoffs/stage.js';
import { createHandoff } from '../../../handoffs/index.js';
import bezelPullback from '../../../handoffs/bezel-pullback.js';
import parallaxSlide from '../../../handoffs/parallax-slide.js';
import cameraTruck from '../../../handoffs/camera-truck.js';
import gridHop from '../../../handoffs/grid-hop.js';
import matchCut from '../../../handoffs/match-cut.js';
import liftOut from '../../../handoffs/lift-out.js';
import { fontStack, breaks, readTime } from '../../lang.js';
import LOOK from '../../look/light-desk/look.js';
import { desk as paintDesk, falloff, fibreTile } from '../../look/light-desk/texture.js';
import { drawChip } from '../claim-chip/chip.js';

export const W = 1920, H = 1080, BAR = 54, S = 1920;
export const WIN = { x: 360, y: 170, w: 1200, h: 675 };
export const R = { x: WIN.x, y: WIN.y + BAR, w: WIN.w, h: WIN.h };
export const DEPTH = { back: 0.3, mid: 1, front: 1.65 };
export const NUMERAL = { x: 48, baseline: 330, size: 220 };
export const CHIP = { x: 1290, y: 770, w: 570, h: 190 };
export const CAPTION = 59, CAP_GAP = 76;
// the template's choreography constants (choreo.js C), in beats unless marked s
export const C = { wordIn: 0.15, settle: 0.3, pullAt: 1, capAt: 0.5, ringStep: 0.5, ringDraw: 1.5, liftStagger: 0.08, noteAt: 1, back: 1, unring: 0.5, ringIn: 1, cutAt: 0.5, unringM: 0.5, dimAt: 0.5, dim: 1.5, mcapAt: 2.5, pauseMin: 0.75, rise: 2, nameAt: 1.5, lineAt: 3, urlCps: 24, urlHold: 3, glance: 1 };
export const MOVE_BEATS = { 'bezel-pullback': 2, 'lift-out': 2, 'parallax-slide': 2, 'camera-truck': 2, 'grid-hop': 3, 'match-cut': 2 };

// ── type and reading ─────────────────────────────────────────────────────────────────────────────────────────────
export const fonts = (lang) => ({ font: { family: fontStack(LOOK, 'text', lang), weight: 600 }, mono: { family: fontStack(LOOK, 'mono', lang), weight: 500 }, note: lang === 'zh' ? 28 : 25 });
// the template's reader on lang.js reading times: primary items one after another from their `at`, glances 1 s
export const reader = (list, lang) => {
  let done = 0, glanceDone = 0;
  const items = list.filter((i) => i && i.text).map((it) => {
    if (it.tier === 'glance') { glanceDone = Math.max(glanceDone, it.at + C.glance); return { ...it, from: it.at, to: it.at + C.glance }; }
    const from = Math.max(done, it.at); done = from + readTime(it.text, lang);
    return { ...it, from, to: done };
  });
  return { items, done, glanceDone };
};
// a line set down at reading pace: a word every 0.3 s in English, a character every 1/5.5 s in Chinese (lang.js)
export const unitSec = (lang) => (lang === 'zh' ? 1 / 5.5 : 0.3);
export const wordsOf = (s, lang, t0) => breaks(s || '', lang).map((u, k) => ({ ...u, t: t0 + k * unitSec(lang) }));
// the colours the runtime hand-offs read: stock for panels, the mat for edges, sink and smuted for type on stock
export const handColors = (Cl) => ({ ground: Cl.ground, panel: Cl.panel, line: Cl.line, ink: Cl.onPaper || Cl.ink, dim: Cl.smuted || Cl.dim, accent: Cl.accent });

// ── the world: prints in a row ───────────────────────────────────────────────────────────────────────────────────
// prints: [{ image (an image, a canvas, or a URL loaded in prepare), crop [x, y, w, h], focus [x, y], source, chip:
// [label, value] | null }]; without an image the neutral placeholder page (1600 × 900) stands in
export const PLACEHOLDER = { w: 1600, h: 900 };
// boxes on the placeholder page (file px): the dark value block of rows 0, 1, 2 and 4 with 10 px above and below and
// 44 px of the row to its left (lift-out takes a card's paper from the box's left edge, so it must be the page's)
export const SAMPLE_BOXES = { r0: [500, 172, 244, 70], r1: [500, 298, 201, 70], r2: [500, 424, 272, 70], r4: [500, 676, 223, 70] };
export const SAMPLE_GLYPHS = { r0: [544, 182, 190, 50], r1: [544, 308, 147, 50], r2: [544, 434, 218, 50], r4: [544, 686, 169, 50] };
const loadImage = async (src) => { const im = new Image(); im.src = src; await im.decode(); return im; };
// the world from prints whose images are loaded (a URL string stays the placeholder here; worldOf loads it)
export const worldFrom = (prints) => {
  const list = (prints || []).map((p0, i) => {
    const p = p0 || {}, image = p.image && typeof p.image !== 'string' ? p.image : placeholderPage(PLACEHOLDER.w, PLACEHOLDER.h);
    const crop = p.crop && p.image ? p.crop : p.crop && !p.image ? p.crop : [0, 0, image.naturalWidth || image.width, image.naturalHeight || image.height];
    const region = coverRect(crop, R.w / R.h, p.focus);
    return { id: i, i, image, crop, region, a: R.w / region[2], x: WIN.x + i * S, source: p.source ?? '', index: String(i + 1).padStart(2, '0'), chip: p.chip ?? null };
  });
  return { list, n: list.length, capY: R.y + R.h + CAP_GAP };
};
export const worldOf = async (prints) => worldFrom(await Promise.all((prints || []).map(async (p) => (p && typeof p.image === 'string' ? { ...p, image: await loadImage(p.image) } : p))));
export const assetOf = (e) => ({ image: e.image, crop: e.region });
export const fileToWorld = (e, x, y) => [e.x + (x - e.region[0]) * e.a, R.y + (y - e.region[1]) * e.a];
export const fileRect = (e, [x, y, w, h]) => { const [X, Y] = fileToWorld(e, x, y); return { x: X, y: Y, w: w * e.a, h: h * e.a }; };
export const windowOfE = (e) => ({ x: e.x, y: WIN.y, w: WIN.w, h: WIN.h + BAR, bar: BAR, r: 12 });
export const contentOfE = (e) => ({ x: e.x, y: R.y, w: R.w, h: R.h });

// ── cameras ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const restCam = (e) => ({ cx: 960 + e.i * S, cy: 540, z: 1 });
export const viewOf = (c) => ({ a: c.z, bx: 960 - c.z * c.cx, by: 540 - c.z * c.cy });
export const camOf = (v) => ({ z: v.a, cx: (960 - v.bx) / v.a, cy: (540 - v.by) / v.a });
export const lerpCam = (p, q, u) => {
  if (Math.abs(p.z - q.z) < 1e-9) return { cx: p.cx + (q.cx - p.cx) * u, cy: p.cy + (q.cy - p.cy) * u, z: p.z };
  const vp = viewOf(p), vq = viewOf(q);
  const fx = (vq.bx - vp.bx) / (vp.a - vq.a), fy = (vq.by - vp.by) / (vp.a - vq.a);
  const sx = vp.a * fx + vp.bx, sy = vp.a * fy + vp.by, a = vp.a * Math.pow(vq.a / vp.a, u);
  return camOf({ a, bx: sx - a * fx, by: sy - a * fy });
};
export const zoomOf = (z, r) => 1 / (1 + r * (1 / z - 1));
export const planeView = (c, r) => { const a = zoomOf(c.z, r); return { a, bx: 960 - a * (r * (c.cx - 960) + 960), by: 540 - a * (r * (c.cy - 540) + 540) }; };
export const pt = (v, x, y) => [v.bx + x * v.a, v.by + y * v.a];
export const rect = (v, r) => ({ x: v.bx + r.x * v.a, y: v.by + r.y * v.a, w: r.w * v.a, h: r.h * v.a });
export const fileView = (v, e) => ({ a: v.a * e.a, bx: v.bx + v.a * (e.x - e.region[0] * e.a), by: v.by + v.a * (R.y - e.region[1] * e.a) });
export const numeralAt = (e) => ({ x: NUMERAL.x + e.i * S * DEPTH.back, baseline: NUMERAL.baseline });
export const chipAt = (e) => ({ x: CHIP.x + e.i * S * DEPTH.front, y: CHIP.y, w: CHIP.w, h: CHIP.h });
export const overviewZoom = (Wd) => Math.min(0.62, 1728 / ((Wd.n - 1) * S + WIN.w + 120));
// the overview over the whole desk and the title block under the row (screen sizes: name 140, line 44, address 40)
export const overview = (Wd, { line = '', mark = false } = {}) => {
  const L = Wd.list, x0 = L[0].x - 60, x1 = L.at(-1).x + WIN.w + 60, top = WIN.y - 120, below = Wd.capY + 40;
  const tbScreen = (mark ? 120 : 0) + 140 + (line ? 76 : 0) + 96 + 40;
  const z = Math.min(1728 / (x1 - x0), (972 - tbScreen) / (below - top + 300), 0.62);
  const tb = { x: L[0].x, top: below + 300 / 2, z, markH: mark ? 100 / z : 0, nameSize: 140 / z, lineSize: 44 / z, urlSize: 40 / z };
  tb.markY = tb.top; tb.nameY = tb.top + tb.markH + (mark ? 40 / z : 0) + tb.nameSize * 0.78;
  tb.ruleY = tb.nameY + 26 / z; tb.lineY = tb.ruleY + (line ? 64 / z : 0); tb.urlY = (line ? tb.lineY : tb.ruleY) + 76 / z;
  return { cam: { cx: (x0 + x1) / 2, cy: (top + tb.urlY + 30 / z) / 2, z }, tb, laneY: top + 50 };
};

// ── a scene's context ────────────────────────────────────────────────────────────────────────────────────────────
// X: { Wd, C (colours), dark, F (fonts), tile, mat, lang, g (a measuring context), held (captions already on the desk) }
export const contextFrom = (s, lang, Wd = worldFrom(s.prints)) => {
  const Cl = s.colors;
  const X = { Wd, C: Cl, dark: parseInt(Cl.ground.slice(1, 3), 16) < 100, F: fonts(lang), tile: tileOf(s.seed ?? 1), mat: s.desk === 'mat', lang, g: scratch() };
  X.held = (s.held || []).filter((h) => h && h.text && Wd.list[h.print]).map((h) => ({ print: h.print, units: wordsOf(h.text, lang, -1e9) }));
  return X;
};
export const contextOf = async (s, lang) => contextFrom(s, lang, await worldOf(s.prints));
const TILES = new Map();
const tileOf = (seed) => { if (!TILES.has(seed)) TILES.set(seed, fibreTile(canvasOf(256, 256), seed)); return TILES.get(seed); };

// ── painters ─────────────────────────────────────────────────────────────────────────────────────────────────────
const under = (ctx, v) => ctx.setTransform(v.a, 0, 0, v.a, v.bx, v.by);
// the back plane: the desk, then the index numerals of the prints near the camera, fading as it rises
export const backPlane = (ctx, cam, X, skip = []) => {
  paintDesk(ctx, X.C, planeView(cam, DEPTH.back), X.tile, { mat: X.mat });
  const v = planeView(cam, DEPTH.back), za = clamp((cam.z - 0.6) / 0.4), c = (cam.cx - 960) / S;
  if (za <= 0) return;
  ctx.save(); under(ctx, v);
  for (const e of X.Wd.list) {
    const alpha = za * clamp(1.5 - Math.abs(e.i - c));
    if (skip.includes(e.id) || alpha <= 0) continue;
    const n = numeralAt(e);
    text(ctx, e.index, n.x, n.baseline, { ...X.F.font, family: fontStack(LOOK, 'display', 'en'), weight: 800, size: NUMERAL.size }, { color: X.C.line, alpha });
  }
  ctx.restore();
};
// the front plane: each print's chip; aside[id] (0..1) slides one out of the frame to the right
export const chips = (ctx, cam, X, skip = [], aside = {}) => {
  const v = planeView(cam, DEPTH.front);
  for (const e of X.Wd.list) {
    if (!e.chip || skip.includes(e.id)) continue;
    const c0 = chipAt(e), c = { ...c0, x: c0.x + (aside[e.id] || 0) * (W - CHIP.x + 40) }, r = rect(v, c);
    if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) continue;
    drawChip(ctx, v, c, e.chip, X.C, X.F.font);
  }
};
export const shadowOf = (ctx, v, e, k = 1) => {
  const r = rect(v, windowOfE(e));
  if (r.x > W || r.x + r.w < 0) return;
  castShadow(ctx, r, { radius: 12 * v.a * k, alpha: 0.4 * k, blur: 30 * v.a, dy: 14 * v.a * k });
};
const PWof = (X) => ({ colors: handColors(X.C), mono: X.F.mono });
// the middle plane: one print in its mount (shadow, mount, content, the bar naming its source), veiled by vl
export const mount = (ctx, v, e, X, { vl = 0, withContent = true, front = true } = {}) => {
  const Wd = windowOfE(e), r = rect(v, Wd);
  if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) return;
  ctx.save();
  shadowOf(ctx, v, e);
  under(ctx, v);
  const PW = PWof(X);
  windowBack(ctx, Wd, PW);
  if (withContent) { ctx.save(); clipWindow(ctx, Wd); paintView(ctx, assetOf(e), fileView({ a: 1, bx: 0, by: 0 }, e), contentOfE(e)); ctx.restore(); }
  if (front) windowFront(ctx, Wd, PW, { title: e.source });
  if (vl > 0) { ctx.save(); clipWindow(ctx, { ...Wd, x: Wd.x - 2, y: Wd.y - 2, w: Wd.w + 4, h: Wd.h + 4 }); ctx.fillStyle = rgba(X.C.ground, Math.min(1, vl)); ctx.fillRect(Wd.x - 2, Wd.y - 2, Wd.w + 4, Wd.h + 4); ctx.restore(); }
  ctx.restore();
};
export const border = (ctx, v, e, X) => {
  const Wd = windowOfE(e);
  ctx.save(); under(ctx, v); rrect(ctx, Wd.x + 1, Wd.y + 1, Wd.w - 2, Wd.h - 2, Wd.r - 1); ctx.strokeStyle = X.C.line; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
};
// units set down on a plane (scale 1.04 → 1 and opacity over 0.15 s as each enters); Chinese without spaces
export const deskWords = (ctx, v, units, x, y, size, t, X, { weight = 600, color, alpha = 1, mono = false } = {}) => {
  const f = { ...(mono ? X.F.mono : X.F.font), weight: mono ? 500 : weight, size: size * v.a };
  const sp = measure(ctx, ' ', f).width, [sx, sy] = pt(v, x, y);
  let cx = 0;
  units.forEach((w, k) => {
    if (k > 0 && w.sep) cx += sp;
    const ww = measure(ctx, w.w, f).width;
    if (t >= w.t) {
      const u = cubicOut(clamp((t - w.t) / C.wordIn)), kk = 1.04 - 0.04 * u;
      ctx.save(); ctx.translate(sx + cx, sy); ctx.scale(kk, kk);
      text(ctx, w.w, 0, 0, f, { color: color || X.C.ink, alpha: u * alpha });
      ctx.restore();
    }
    cx += ww;
  });
};
// a ring round a file box of print e (12 px padding, clipped to the content)
export const boxRing = (ctx, v, e, box, draw, X, { pad = 12 } = {}) => {
  if (draw <= 0) return;
  const c = rect(v, contentOfE(e));
  ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip();
  ring(ctx, rect(v, fileRect(e, box)), PWof(X), { pad: pad * v.a, radius: 10, width: 3, draw });
  ctx.restore();
};
// captions lie on the middle plane under their print: [{ print, units, alpha }]
export const captions = (ctx, cam, X, list, t) => { const v = viewOf(cam); for (const c of list) if (c.alpha > 0) deskWords(ctx, v, c.units, X.Wd.list[c.print].x, X.Wd.capY, CAPTION, t, X, { alpha: c.alpha }); };
// the captions on the desk at t: the held ones (stepped back to 45 % off the print in focus, gone once this scene's
// caption on the same print begins) and the scene's own (from its first unit)
export const captionList = (X, { focus = null, own = null, rise = 0, t = 0 } = {}) => {
  const out = [];
  for (const h of X.held) {
    let a = focus == null || h.print === focus ? 1 : 0.45;
    if (own && own.print === h.print) a *= 1 - clamp((t - (own.units[0]?.t ?? Infinity) + C.wordIn) / C.wordIn);
    out.push({ ...h, alpha: lerp(a, 0.6, rise) });
  }
  if (own) out.push({ ...own, alpha: lerp(1, 0.6, rise) });
  return out;
};

// ── the moves (the template's moves.js adapters over the runtime hand-offs) ─────────────────────────────────────
const pair = (a, b) => (a.i < b.i ? [a, b, 0, 1] : [b, a, 1, 0]);
export const openMove = async (X, e) => {
  const P = { asset: assetOf(e), title: e.source, rim: 0, radius: 12, focus: null, window: { cx: WIN.x + WIN.w / 2, cy: WIN.y + (R.h + BAR) / 2, w: WIN.w }, ground: false, mono: X.F.mono, colors: handColors(X.C) };
  const h = await createHandoff('bezel-pullback', P), M = bezelPullback, D = M.prepare(h.params);
  const viewAt = (p) => zoomBetween(D.v0, D.v1, h.state(p).u);
  const camera = (p) => { const bv = viewAt(p), a = bv.a / e.a; return camOf({ a, bx: bv.bx - a * (e.x - e.region[0] * e.a), by: bv.by - a * (R.y - e.region[1] * e.a) }); };
  const frame = (p) => { const u = h.state(p).u, bv = viewAt(p), [cx, cy, cw, ch] = D.A.crop; return { ...M.frame({ x: bv.bx + cx * bv.a, y: bv.by + cy * bv.a, w: cw * bv.a, h: ch * bv.a }, u, h.params), u }; };
  return { device: 'bezel-pullback', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera, frame, track: (p) => M.track(h.state(p), h.params, D), owns: [e.id], draws: {} };
};
export const travelMove = async (X, from, e, kind = 'parallax-slide') => {
  const [lo, hi, f, t] = pair(from, e), PC = handColors(X.C);
  if (kind === 'camera-truck') {
    const P = { items: [lo, hi].map((x) => ({ asset: assetOf(x), title: x.source, w: WIN.w })), gap: S - WIN.w, from: f, to: t, cy: WIN.y + (R.h + BAR) / 2, veil: 0.55, ground: false, mono: X.F.mono, colors: PC };
    const h = await createHandoff('camera-truck', P), D = cameraTruck.prepare(h.params);
    return { device: 'camera-truck', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera: (p) => ({ cx: 960 + WIN.x + lo.i * S + h.state(p).cam, cy: 540, z: 1 }), track: (p) => cameraTruck.track(h.state(p), h.params, D), owns: [lo.id, hi.id], draws: {} };
  }
  if (kind === 'grid-hop') {
    const s = R.w / 1920, L = X.Wd.list, gx = S / s - 1920, gw = L.length * 1920 + (L.length - 1) * gx, zoom = overviewZoom(X.Wd);
    const P = { tiles: L.map((x) => ({ asset: assetOf(x), label: '' })), cols: L.length, from: from.i, to: e.i, gutter: { x: gx, y: 380 }, margin: (1920 - zoom * gw) / 2, veil: 0.5, mono: X.F.mono, colors: PC, ground: false };
    const h = await createHandoff('grid-hop', P), D = gridHop.prepare(h.params);
    const camera = (p) => { const v = gridHop.viewOf(h.state(p), D); return { z: v.a, cx: (960 - R.x - s * v.bx + v.a * R.x) / v.a, cy: (540 - R.y - s * v.by + v.a * R.y) / v.a }; };
    return { device: 'grid-hop', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera, track: (p) => gridHop.track(h.state(p), h.params, D).map(([x, y]) => [R.x + s * x, R.y + s * y]), owns: [], draws: { tiles: true }, transform: [s, 0, 0, s, R.x, R.y] };
  }
  const item = (x) => ({ asset: assetOf(x), title: x.source, index: x.index, chip: x.chip });
  const P = { items: [item(lo), item(hi)], from: f, to: t, window: { x: WIN.x, y: WIN.y, w: WIN.w, h: R.h }, chip: CHIP, numeral: NUMERAL, depth: DEPTH, spacing: S, font: X.F.font, mono: X.F.mono, colors: PC, ground: false };
  const h = await createHandoff('parallax-slide', P), D = parallaxSlide.prepare(h.params);
  return { device: 'parallax-slide', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera: (p) => ({ cx: 960 + (lo.i + h.state(p).c) * S, cy: 540, z: 1 }), track: (p) => parallaxSlide.track(h.state(p), h.params, D), owns: [lo.id, hi.id], draws: { numerals: [lo.id, hi.id], chips: [lo.id, hi.id], shadows: true } };
};
export const matchMove = async (X, from, e, fromBox, toBox) => {
  const P = { window: { x: WIN.x, y: WIN.y, w: WIN.w, h: R.h }, from: { asset: assetOf(from), title: from.source, box: fromBox }, to: { asset: assetOf(e), title: e.source, box: toBox }, match: { cx: R.x + R.w / 2, cy: R.y + R.h / 2, h: 64 }, ringPad: 12, mono: X.F.mono, colors: handColors(X.C), ground: false };
  const h = await createHandoff('match-cut', P), D = matchCut.prepare(h.params);
  return { device: 'match-cut', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera: (p) => restCam(h.state(p).b ? e : from), track: (p) => matchCut.track(h.state(p), h.params, D), owns: [from.id, e.id], draws: {} };
};
export const liftMove = async (X, e, cells) => {
  const v = fileView(viewOf(restCam(e)), e);
  const P = { asset: assetOf(e), view: v, backdrop: false, ground: false, title: e.source, window: { x: WIN.x, y: WIN.y, w: WIN.w },
    cells: cells.map(({ box, glyph, value, label }) => ({ box, glyph, value, label })),
    card: { x: null, h: 140, gap: 22, rise: 0, pad: 28, labelSize: 44, margin: 100 }, swapAt: 1.2, dim: 0.55, ringPad: 6, ringStyle: { width: 3, radius: 10 },
    font: { ...X.F.font, weight: 700 }, mono: X.F.mono, colors: { ...handColors(X.C), paper: null, onPaper: X.C.onPaper || X.C.ink } };
  const h = await createHandoff('lift-out', P), Q = h.params, D = liftOut.prepare(Q);
  // a note sits under its card's label, so the cards widen to the longest note (and stay inside the frame)
  const Cd = Q.card, noteW = Math.max(0, ...cells.map((c) => (c.note ? measure(X.g, c.note, { ...X.F.mono, size: X.F.note }).width : 0)));
  D.cardW = Math.max(D.cardW, D.zoneW + Cd.pad + noteW + Cd.pad);
  const x = Math.min(D.cells[0].r1.x, 1920 - Cd.margin - D.cardW);
  for (const c of D.cells) if (!c.land) c.r1.x = x;
  const cards = D.cells.map((c) => ({ x: c.r1.x, y: c.r1.y, w: c.r1.w + (D.cardW - c.zoneW), h: c.r1.h, labelX: c.r1.x + D.zoneW + Cd.pad, r0: c.r0 }));
  const at = (p) => liftOut.at(clamp(p), Q, D);
  return { device: 'lift-out', D, cards, draw: (ctx, p) => { ctx.save(); liftOut.paint(ctx, at(p), Q, D); ctx.restore(); }, state: at, track: (p) => liftOut.track(at(p), Q, D) };
};

// ── one frame of the desk ────────────────────────────────────────────────────────────────────────────────────────
// cam; move/mp: a move in play and its progress; caps: captionList(); vl(e): a print's veil; aside: chips aside;
// over(ctx, v): the scene's own layer (rings, readings, dimensions, the title block) before the falloff
export const frame = (ctx, X, { cam, move = null, mp = 0, caps = [], t = 0, vl = () => 0, aside = {}, under: veilFn = null, over = null }) => {
  const v = viewOf(cam), dr = move?.draws || {}, owned = move?.owns || [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  backPlane(ctx, cam, X, dr.numerals || []);
  for (const e of X.Wd.list) {
    if (dr.tiles) { mount(ctx, v, e, X, { withContent: false }); continue; }
    if (owned.includes(e.id)) {
      if (dr.shadows) continue;
      if (move.frame) { const f = move.frame(mp); if (f.u > 0) castShadow(ctx, { x: f.x, y: f.y, w: f.w, h: f.h }, { radius: f.r, alpha: 0.4 * f.u, blur: 30 * v.a, dy: 14 * v.a * f.u }); }
      else shadowOf(ctx, v, e);
      continue;
    }
    mount(ctx, v, e, X, { vl: vl(e) });
  }
  captions(ctx, cam, X, caps, t);
  if (move) { ctx.save(); if (move.transform) ctx.setTransform(...move.transform); move.draw(ctx, mp); ctx.restore(); if (dr.tiles) for (const e of X.Wd.list) border(ctx, v, e, X); }
  if (veilFn) veilFn(ctx, v);
  chips(ctx, cam, X, dr.chips || [], aside);
  if (over) over(ctx, v);
  falloff(ctx, X.C, X.dark);
};
// the motion-blur track of a frame: two desk corners through the camera, plus the move's own points
export const trackFrame = (cam, move, mp) => { const v = viewOf(cam); return [pt(v, 0, 0), pt(v, 3000, 1500), ...(move ? move.track(mp) : [])]; };
export const pIn = (t, [a, b]) => clamp((t - a) / (b - a));
export { clamp, lerp, cubicOut, cubicInOut, settle, veil, ring, text, measure, rrect, rgba };

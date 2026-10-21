// film.js — Handset renderer. render(t) paints the whole frame from t, content.js and palettes.js alone.
//
// One code-drawn device (a laptop or a phone, content.device) stays head-on, locked off, from the first frame to the
// last; everything that changes, changes on its screen, and the screen shows only real captures (content.assets),
// cropped to their public region and pushed in no further than the zoom cap. The margin right of the device carries
// the copy, level with the region in play (the level rail); the chin names where the screen's state comes from.
// The four moves are pluggable (moves.js): by default viewport-push (pushes and pans), spotlight-band (the band hops),
// device-flip (a change of surface) from the hand-off library, and page-scroll, this template's own device (TEMPLATE.md,
// Moves). Fast frames get sub-frame motion blur (lib/canvas.js subframes, speed-gated). Every time comes from choreo.js.
import FILM from './content.js';
import PALETTES, { report as contrastReport } from './palettes.js';
import RULES from './timing.rules.js';
import { fit } from './lib/timing.js';
import { plan, deviceOf, deviceBox, toScreen, publicOf, validate, movesOf, TEXT_IN, TEXT_OUT, RING_DRAW } from './choreo.js';
import { clamp, lerp, cubicInOut, expOut, hexToRgb } from './lib/motion.js';
import { grainTile, subframes } from './lib/canvas.js';
import { errorBanner } from './lib/text.js';
import { rrect, rgba, maxDisp } from './lib/handoffs/util.js';
import { view as hview, zoomBetween, ring as drawRing, ringContrast } from './lib/handoffs/asset.js';

const W = 1920, H = 1080, FPS = 30;
const TM = fit(FILM, RULES);
const B = TM.beat, BAR = TM.bar;
const P = PALETTES[FILM.palette] ?? PALETTES.graphite;
const D = deviceOf(FILM);
const BOX = deviceBox(D);
const SCR = D.screen;
const CUT = FILM.edges === 'cut';    // a cut-down: the first frame is already the lit device (TEMPLATE.md, Short cut)
const ERRORS = validate(FILM);
const S = ERRORS.length ? [] : plan(FILM, TM.scenes, B, BAR);
const M = ERRORS.length ? movesOf({}) : movesOf(FILM);   // the move adapters (moves.js)
const CHIN_AT = S[0]?.chin ?? B;                          // the source line appears after the wake's copy (choreo.js wake)
export const duration = TM.duration;
export const fonts = [{ family: 'Inter Tight', weight: 700 }, { family: 'Inter Tight', weight: 600 }, { family: 'IBM Plex Mono', weight: 500 }];
const TYPE = {
  display: { size: 95, weight: 700, family: 'Inter Tight', track: -1.9, color: 'ink' },
  line: { size: 49, weight: 600, family: 'Inter Tight', track: -0.5, color: 'muted' },
  note: { size: 25, weight: 500, family: 'IBM Plex Mono', track: 0, color: 'dim' },
  url: { size: 25, weight: 500, family: 'IBM Plex Mono', track: 0, color: 'ink' },
};

// ---------------------------------------------------------------- absolute tables (from choreo.js)
const CAMERA = [], LIGHT = [], COPY = [], BLOCK = [];
const asView = (v) => hview(v.k, -v.x * v.k, -v.y * v.k);    // asset.js view: screen = a · img + b (screen-local)
S.forEach((T, i) => {
  const s0 = TM.scenes[i].start, s1 = TM.scenes[i].end;
  if (T.move) CAMERA.push({ t: s0 + T.move.t, dur: T.move.dur ?? 0, kind: T.move.kind, asset: T.asset, v: asView(T.view), variant: T.move.variant });
  for (const l of T.light ?? []) LIGHT.push({ ...l, t: s0 + l.t, asset: T.asset });
  for (const c of T.copy ?? []) COPY.push({ ...c, scene: i, in: s0 + c.in, out: c.out != null ? s0 + c.out : T.type === 'lockup' ? Infinity : s1 - TEXT_OUT });
  // the copy block's level: each state's lit region in the view it lands on; a band row's level moves with its hop
  const lit = (T.light ?? []).filter((l) => l.region && !l.ring);
  if (!lit.length) BLOCK.push({ t0: s0, t1: s0, y: T.type === 'lockup' ? 420 : 410 });
  for (const l of lit) {
    const R = FILM.assets[T.asset].regions[l.region], [, sy] = toScreen(T.view, 0, R.box[1] + R.box[3] / 2);
    const y = clamp(SCR.y + sy - 62, 96, H - 96 - 330);
    const hopping = T.type === 'band' && l !== lit[0];
    BLOCK.push(hopping ? { t0: s0 + l.t, t1: s0 + l.t + M.hop.beats * B, y } : { t0: l === lit[0] ? s0 : s0 + l.t, t1: l === lit[0] ? s0 : s0 + l.t, y });
  }
});
LIGHT.sort((a, b) => a.t - b.t);
const blockY = (t) => {
  let y = BLOCK[0]?.y ?? 410;
  for (const k of BLOCK) { if (t < k.t0) break; y = k.t1 > k.t0 ? lerp(y, k.y, cubicInOut((t - k.t0) / (k.t1 - k.t0))) : k.y; }
  return y;
};

// ---------------------------------------------------------------- camera
// { asset, v } on a still or moving screen; { flip: { p, from, to, c } } inside a device-flip.
const camera = (t) => {
  let cur = CAMERA[0] ? { asset: CAMERA[0].asset, v: CAMERA[0].v } : null;
  for (const c of CAMERA) {
    if (t < c.t) break;
    const next = { asset: c.asset, v: c.v };
    if (!c.dur || t >= c.t + c.dur) { cur = next; continue; }
    const p = (t - c.t) / c.dur;
    if (c.kind === 'flip') return { flip: { p, from: cur, to: next, c } };
    // the adapter's curve along the log-zoom path between the two views (moves.js push, scroll)
    const u = c.kind === 'scroll' ? M.scroll.curve(p) : M.push.curve(p);
    return { asset: c.asset, v: zoomBetween(cur.v, next.v, u), moving: c, p, from: cur, to: next };
  }
  return cur;
};

// ---------------------------------------------------------------- light
const regionPoly = (asset, name) => {
  const A = FILM.assets[asset], R = A.regions[name], Pb = publicOf(A);
  if (R.band) return [[Pb[0], R.band[0]], [Pb[0] + Pb[2], R.band[0]], [Pb[0] + Pb[2], R.band[0] + R.band[1]], [Pb[0], R.band[0] + R.band[1]]];
  const [x, y, w, h] = R.box, pad = 14;
  return [[x - pad, y - pad], [x + w + pad, y - pad], [x + w + pad, y + h + pad], [x - pad, y + h + pad]];
};
// { alpha, poly (null: the whole screen), asset, holeFill, ring: { asset, region, draw, alpha } }
const light = (t) => {
  const states = LIGHT.filter((l) => !l.ring && l.t <= t);
  const none = { alpha: 0, ring: null };
  if (!states.length) return none;
  const e = states[states.length - 1], prev = states[states.length - 2] ?? {}, dt = t - e.t;
  const ringE = [...LIGHT].reverse().find((l) => l.ring && l.t <= t && l.t >= e.t - 1e-9 && l.region === e.region && l.asset === e.asset);
  const ring = ringE ? { asset: ringE.asset, region: ringE.region, draw: clamp((t - ringE.t) / RING_DRAW), alpha: 1 } : null;
  if (e.off) {                                            // a lift: what was lit fades in 0.15 s
    const a = 1 - clamp(dt / 0.15);
    if (!(prev.region || prev.all) || a <= 0) return none;
    const pr = [...LIGHT].reverse().find((l) => l.ring && l.t <= e.t && l.region === prev.region && l.asset === prev.asset && l.t >= prev.t);
    return { alpha: a, poly: prev.region ? regionPoly(prev.asset, prev.region) : null, asset: prev.asset, holeFill: 0, ring: pr ? { asset: pr.asset, region: pr.region, draw: 1, alpha: a } : null };
  }
  if (e.all) return { alpha: clamp(dt / 0.3), poly: null, asset: e.asset, holeFill: 0, ring: null };
  const out = { alpha: clamp(dt / 0.2), poly: regionPoly(e.asset, e.region), asset: e.asset, holeFill: 0, ring };
  if (prev.all) { out.alpha = 1; out.holeFill = 1 - clamp(dt / 0.2); }                       // the hole opens in a veiled screen
  else if (e.cut && prev.region) out.alpha = 1;                                               // an in-frame cut: the light stays
  else if (prev.region && prev.asset === e.asset && prev.region === e.region) out.alpha = 1;  // the same region, carried
  else if (prev.region && prev.asset === e.asset) {                                           // spotlight-band: the light hops
    const R0 = FILM.assets[e.asset].regions[prev.region], R1 = FILM.assets[e.asset].regions[e.region];
    if (R0.band && R1.band) {
      const [y, h] = M.hop.band(clamp(dt / (M.hop.beats * B)), R0.band, R1.band);
      out.poly = out.poly.map(([x], k) => [x, k < 2 ? y : y + h]);
      out.alpha = 1;
    }
  }
  return out;
};

// ---------------------------------------------------------------- the device
const C = P;
const IMG = {};
let GRAIN;
const TEX = [document.createElement('canvas'), document.createElement('canvas')];
for (const c of TEX) { c.width = BOX.w; c.height = BOX.h; }
// what a flip adapter gets (moves.js): both faces of the device, its box, where its screen is inside the box, the palette
const flipEnv = (variant) => ({ faces: TEX, box: BOX, screen: { x: SCR.x - BOX.x, y: SCR.y - BOX.y, w: SCR.w, h: SCR.h, r: SCR.r }, colors: C, variant });
// what a scroll adapter with its own screen() gets: both views (image, view a·img + b, public region), the screen's size
const scrollEnv = (cam) => ({ from: { image: IMG[cam.from.asset], view: cam.from.v, public: publicOf(FILM.assets[cam.from.asset]) }, to: { image: IMG[cam.to.asset], view: cam.to.v, public: publicOf(FILM.assets[cam.to.asset]) }, w: SCR.w, h: SCR.h, colors: C, variant: cam.moving.variant });

const paintScreen = (g, cam, L, t) => {
  g.save();
  rrect(g, 0, 0, SCR.w, SCR.h, SCR.r); g.clip();
  g.fillStyle = C.glass; g.fillRect(0, 0, SCR.w, SCR.h);
  if (cam) {
    const A = FILM.assets[cam.asset], im = IMG[cam.asset], v = cam.v, [cx, cy, cw, ch] = publicOf(A);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    // only the public region is ever drawn
    const x0 = Math.max(cx, -v.bx / v.a), y0 = Math.max(cy, -v.by / v.a);
    const x1 = Math.min(cx + cw, (SCR.w - v.bx) / v.a), y1 = Math.min(cy + ch, (SCR.h - v.by) / v.a);
    if (cam.moving?.kind === 'scroll' && M.scroll.screen) M.scroll.screen(g, cam.p, scrollEnv(cam));
    else if (im && x1 > x0 && y1 > y0) g.drawImage(im, x0, y0, x1 - x0, y1 - y0, v.bx + x0 * v.a, v.by + y0 * v.a, (x1 - x0) * v.a, (y1 - y0) * v.a);
    // backlight while waking: the first capture comes up from the glass over 0.3 s, monotonic
    const lit = CUT ? 1 : clamp((t - B) / 0.3);
    if (lit < 1) { g.fillStyle = rgba(C.glass, 1 - lit); g.fillRect(0, 0, SCR.w, SCR.h); }
    const P2 = (x, y) => [v.bx + x * v.a, v.by + y * v.a];
    if (L && L.alpha > 0 && (!L.poly || L.asset === cam.asset)) {
      const path = () => { L.poly.forEach(([x, y], k) => { const [sx, sy] = P2(x, y); k ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); };
      g.beginPath(); g.rect(0, 0, SCR.w, SCR.h);
      if (L.poly) path();
      g.fillStyle = rgba(C.bg, C.veil * L.alpha);
      g.fill('evenodd');
      if (L.poly && L.holeFill > 0) { g.beginPath(); path(); g.fillStyle = rgba(C.bg, C.veil * L.holeFill); g.fill(); }
    }
    if (L && L.ring && L.ring.draw > 0 && L.ring.asset === cam.asset) {
      const [x, y, w, h] = FILM.assets[cam.asset].regions[L.ring.region].box, [sx, sy] = P2(x, y), r = { x: sx, y: sy, w: w * v.a, h: h * v.a };
      g.save(); g.globalAlpha = L.ring.alpha;
      drawRing(g, r, { colors: C }, { pad: 8, radius: 10, width: 9, draw: L.ring.draw, color: C.key });
      drawRing(g, r, { colors: C }, { pad: 8, radius: 10, width: 4, draw: L.ring.draw, color: C.accent });
      g.restore();
    }
  }
  g.restore();
};

// The device into a context whose origin is the device box's top-left.
const paintDevice = (g, cam, L, t) => {
  const ox = -BOX.x, oy = -BOX.y, b = D.body, draw = CUT ? 1 : clamp(t / 0.45);
  g.save(); g.translate(ox, oy);
  g.save(); g.globalAlpha = CUT ? 1 : clamp(t / 0.3);
  rrect(g, b.x, b.y, b.w, b.h, b.r); g.fillStyle = C.lid; g.fill();
  if (D.deck) { g.fillStyle = C.deck; rrect(g, D.deck.x, D.deck.y, D.deck.w, D.deck.h, 8); g.fill(); }
  g.restore();
  // the wake: the 2 px edge draws out from the camera both ways
  g.save();
  const per = 2 * (b.w + b.h);
  if (draw < 1) { g.setLineDash([per * draw / 2, per]); g.lineDashOffset = per * draw / 4 - b.w / 2; }
  rrect(g, b.x + 1, b.y + 1, b.w - 2, b.h - 2, b.r - 1); g.strokeStyle = C.lidEdge; g.lineWidth = 2; g.stroke();
  g.restore();
  if (D.deck) {
    g.fillStyle = C.deckEdge; g.fillRect(D.deck.x + D.deck.w / 2 - (D.deck.w / 2) * draw, D.deck.y, D.deck.w * draw, 2);
    g.fillStyle = C.lid; rrect(g, D.deck.x + D.deck.w / 2 - 90, D.deck.y, 180, 7, 4); g.fill();
    g.beginPath(); g.arc(D.cam.x, D.cam.y, 4, 0, Math.PI * 2); g.fillStyle = C.cam; g.fill();
  } else { g.fillStyle = C.cam; rrect(g, D.cam.x - 36, D.cam.y - 7, 72, 14, 7); g.fill(); }
  g.save(); g.translate(SCR.x, SCR.y); paintScreen(g, cam, L, t); g.restore();
  // the source line: on the laptop's chin, under the phone
  if (cam && t >= CHIN_AT) {
    g.font = `500 25px "IBM Plex Mono"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.dim;
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.globalAlpha = clamp((t - CHIN_AT) / 0.3);
    g.fillText(FILM.assets[cam.asset].chin ?? '', b.x + b.w / 2, D.chin.y);
    g.globalAlpha = 1;
  }
  g.restore();
};

// ---------------------------------------------------------------- the margin
const paintCopy = (g, t) => {
  const by = blockY(t), X = D.copy.x, Wd = D.copy.w;
  for (const l of COPY) {
    if (t < l.in || t >= l.out + TEXT_OUT) continue;
    const T = TYPE[l.role];
    const railH = l.role === 'mark' ? 100 : Math.round(T.size * 1.32) + ((LINES.get(l)?.length ?? 1) - 1) * Math.round(T.size * 1.36);
    const y = by + l.slot;
    const enter = 1 - expOut((t - l.in) / TEXT_IN), leave = t > l.out ? Math.pow(clamp((t - l.out) / TEXT_OUT), 2) : 0;
    const dy = (enter - leave) * railH * 1.15;
    g.save();
    g.beginPath(); g.rect(X - 4, y, Wd + 40, railH); g.clip();
    if (l.role === 'mark') {
      const A = FILM.assets[l.asset], im = IMG[l.asset], c = publicOf(A), h = 96;
      if (im) { g.imageSmoothingQuality = 'high'; g.drawImage(im, c[0], c[1], c[2], c[3], X, y + 2 + dy, (c[2] * h) / c[3], h); }
    } else {
      g.font = `${T.weight} ${T.size}px "${T.family}"`;
      if ('letterSpacing' in g) g.letterSpacing = `${T.track}px`;
      g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = C[T.color];
      (LINES.get(l) ?? [l.text]).forEach((tx, k) => g.fillText(tx, X, y + T.size + dy + k * Math.round(T.size * 1.36)));
    }
    g.restore();
  }
};

// ---------------------------------------------------------------- the frame
const frame = (g, t) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const cam = camera(t), L = light(t);
  if (cam?.flip) {
    const { p, from, to, c } = cam.flip;
    const a = TEX[0].getContext('2d'), z = TEX[1].getContext('2d');
    a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, BOX.w, BOX.h); paintDevice(a, from, null, t);
    z.setTransform(1, 0, 0, 1, 0, 0); z.clearRect(0, 0, BOX.w, BOX.h); paintDevice(z, to, null, t);
    M.flip.paint(g, p, flipEnv(c.variant));
  } else {
    g.save(); g.translate(BOX.x, BOX.y); paintDevice(g, cam, L, t); g.restore();
    // the level tick on the device's right edge, at the height of the ringed region
    if (cam && L.ring && L.ring.asset === cam.asset && L.ring.alpha > 0) {
      const R = FILM.assets[cam.asset].regions[L.ring.region].box, y = SCR.y + cam.v.by + (R[1] + R[3] / 2) * cam.v.a;
      if (y > SCR.y && y < SCR.y + SCR.h) {
        g.globalAlpha = L.ring.alpha * clamp(L.ring.draw * 3);
        g.fillStyle = C.accent; rrect(g, D.tick.x, y - 24, 8, 48, 4); g.fill();
        g.globalAlpha = 1;
      }
    }
  }
  paintCopy(g, t);
  // a fixed seeded grain, 4 % overlay (texture; it never moves)
  if (GRAIN) { g.save(); g.globalAlpha = 0.04; g.globalCompositeOperation = 'overlay'; for (let y = 0; y < H; y += 256) for (let x = 0; x < W; x += 256) g.drawImage(GRAIN, x, y); g.restore(); }
};

// px per frame of the fastest point of the screen's content (a push, a pan, a scroll) or of the device (a flip)
const SCR_PTS = [[0, 0], [SCR.w, 0], [0, SCR.h], [SCR.w, SCR.h]];
const speed = (t) => {
  const dt = 1 / FPS, a = camera(t), z = camera(Math.max(0, t - dt));
  if (!a || !z) return 0;
  if (a.flip || z.flip) {
    const f = (a.flip || z.flip).c;
    const p1 = clamp((t - f.t) / f.dur), p0 = clamp((t - dt - f.t) / f.dur);
    return maxDisp(M.flip.track(p0, flipEnv(f.variant)), M.flip.track(p1, flipEnv(f.variant)));
  }
  if (a.moving?.kind === 'scroll' && M.scroll.track && z.moving === a.moving) return maxDisp(M.scroll.track(z.p, scrollEnv(z)), M.scroll.track(a.p, scrollEnv(a)));
  if ((!a.moving && !z.moving) || a.asset !== z.asset) return 0;
  const src = SCR_PTS.map(([x, y]) => [(x - a.v.bx) / a.v.a, (y - a.v.by) / a.v.a]);
  const scr = (v) => src.map(([x, y]) => [v.bx + x * v.a, v.by + y * v.a]);
  return maxDisp(scr(z.v), scr(a.v));
};

// Measured layout: the display size is one for the whole film, 95 px, or 76 px when a value does not fit the margin at 95
// (one step down the scale); a URL or a note wider than the margin wraps after a '/' or a space. Anything still wider is
// an error banner: rewrite it shorter (TEMPLATE.md, Slots).
const LINES = new Map();
const fitCopy = (ctx) => {
  const problems = [], Wd = D.copy.w;
  const width = (T, tx) => { ctx.save(); ctx.font = `${T.weight} ${T.size}px "${T.family}"`; if ('letterSpacing' in ctx) ctx.letterSpacing = `${T.track}px`; const w = ctx.measureText(tx).width; ctx.restore(); return w; };
  const displays = COPY.filter((l) => l.role === 'display');
  if (displays.some((l) => width(TYPE.display, l.text) > Wd)) TYPE.display.size = 76;
  for (const l of COPY) {
    if (l.role === 'mark') continue;
    const T = TYPE[l.role];
    if (width(T, l.text) <= Wd) continue;
    if (l.role === 'url' || l.role === 'note') {
      const parts = l.text.split(/(?<=[/ ])/), lines = [''];
      for (const p of parts) { const tryL = lines[lines.length - 1] + p; if (width(T, tryL.trimEnd()) <= Wd || !lines[lines.length - 1]) lines[lines.length - 1] = tryL; else lines.push(p); }
      if (lines.length <= 2 && lines.every((x) => width(T, x.trimEnd()) <= Wd)) { LINES.set(l, lines.map((x) => x.trimEnd())); continue; }
    }
    problems.push(`"${l.text}" (${l.role}, ${T.size} px) is ${Math.round(width(T, l.text))} px wide; the margin is ${Wd} px: rewrite it shorter`);
  }
  return problems;
};

let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(`cannot load ${src}`)); i.src = src; });
export const ready = async () => {
  if (ERRORS.length) { errorBanner(['CONTENT.JS INVALID — run npm run fit', ...ERRORS.slice(0, 8)], 'hf-content-error'); console.error(ERRORS.join('\n')); return; }
  const used = new Set(S.map((T) => T.asset));
  for (const T of S) for (const c of T.copy ?? []) if (c.asset) used.add(c.asset);
  const problems = [];
  for (const id of used) { try { IMG[id] = await load(FILM.assets[id].file); } catch (e) { problems.push(e.message); } }
  // the palette: contrast pairs, and the accent against every ringed region (ΔE00 ≥ 20)
  for (const r of contrastReport(P)) if (r.ratio < r.min) problems.push(`palette ${FILM.palette}: ${r.fg} on ${r.bg} ${r.ratio.toFixed(2)} < ${r.min}`);
  const ringedSet = new Set(LIGHT.filter((l) => l.ring).map((l) => `${l.asset}\u0000${l.region}`));
  for (const k of ringedSet) {
    const [a, r] = k.split('\u0000');
    if (!IMG[a]) continue;
    const { min, worst } = ringContrast(IMG[a], FILM.assets[a].regions[r].box, P.accent);
    if (min < 20) problems.push(`accent ${P.accent} is ΔE00 ${min.toFixed(1)} from ${worst} in ${a}.${r} (ringed); at least 20: choose another preset`);
  }
  if (CTX) problems.push(...fitCopy(CTX));
  if (problems.length) { errorBanner(['HANDSET: FIX BEFORE RENDERING', ...problems.slice(0, 8)], 'hf-asset-error'); console.error(problems.join('\n')); }
  GRAIN = grainTile(FILM.seed ?? 7, 256, 22);
};
export const render = (ctx, t) => {
  if (ERRORS.length) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); return; }
  subframes(ctx, frame, t, { speed: speed(t), fps: FPS, shutter: 0.5 });
};
export { hexToRgb };

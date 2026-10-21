// film.js — Split renderer. render(t) paints the whole frame from t, content.js and palettes.js alone.
//
// One movable seam divides the frame from the first scene to the last: on one side what is written (the input, on
// paper: a request, a list, real lines of a real file, a command, a diff, the install line), on the other what that
// makes (the result: real frames, renders and pages from content.assets, shown 1:1 or contained, cropped only by
// their pane; a report). Every change is a move of the seam, through moves.js: split-open (the caret stands up into the
// seam), louvre (slats out of the seam; one slat is the plain push), wipe-line (a copy of the seam crosses the frame),
// split-branch (a branch opens a second result pane), diff-slider (the seam across two renders of one instant). Fast
// frames get sub-frame motion blur (lib/canvas.js subframes, speed-gated). Every time comes from choreo.js plan1().
import FILM from './content.js';
import PALETTES from './palettes.js';
import RULES from './timing.rules.js';
import { fit } from './lib/timing.js';
import { clamp, lerp, cubicInOut, expOut } from './lib/motion.js';
import { subframes } from './lib/canvas.js';
import { rrect } from './lib/handoffs/util.js';
import { plan1, paneOf, placeOf, lastResult, validate, L, YC, TEXT_IN, TEXT_OUT, CPS, MARGIN, W, H } from './choreo.js';
import { createMove } from './moves.js';
import { clipRect, seamV, seamH } from './lib/handoffs/seam.js';

const FPS = 30;
const ERRORS = validate(FILM);
if (ERRORS.length) throw new Error(`content.js does not fit the registry:\n${ERRORS.join('\n')}`);
const TM = fit(FILM, RULES);
const B = TM.beat;
const PAL = PALETTES[FILM.palette] ?? PALETTES.diff;
const C = { ...PAL, stitch: FILM.seam === 'stitched' };       // the seam's colours (and its form) for the hand-offs
const SC = FILM.scenes.map((s, i) => {
  const start = TM.scenes[i].start, end = TM.scenes[i].end;
  return { s, i, start, end, T: plan1(FILM, FILM.scenes, i, B, end - start, start) };
});
const A = FILM.assets;
export const duration = TM.duration;
export const fonts = [{ family: 'Archivo', weight: 700 }, { family: 'JetBrains Mono', weight: 500 }, { family: 'JetBrains Mono', weight: 700 }];

// ---------------------------------------------------------------- type (25 × (4/3)^n: 25 · 33 · 44 · 59 · 79 · 105)
const SANS = 'Archivo', MONO = 'JetBrains Mono';
const TY = {
  name: { family: SANS, weight: 700, size: 105, stretch: 'semi-expanded', track: -2 },
  claim: { family: SANS, weight: 700, size: 59, stretch: 'semi-expanded', track: -0.6 },
  req: { family: MONO, weight: 500, size: 44 },
  code: { family: MONO, weight: 500, size: 33 },
  codeB: { family: MONO, weight: 700, size: 33 },
  label: { family: MONO, weight: 500, size: 25 },
  labelB: { family: MONO, weight: 700, size: 25 },
};
const setFont = (g, s) => {
  g.font = `${s.stretch ?? ''} ${s.weight} ${s.size}px "${s.family}"`.trim();
  if ('fontStretch' in g) g.fontStretch = s.stretch ?? 'normal';
  if ('letterSpacing' in g) g.letterSpacing = `${s.track ?? 0}px`;
};
const text = (g, str, x, y, s, color, align = 'left') => { setFont(g, s); g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(str, x, y); };
let MEASURE = null;
const width = (str, s) => { setFont(MEASURE, s); return MEASURE.measureText(str).width; };
const CHW = (s) => width('0', s);    // mono advance

// A line that rises into place through its own rail (TEXT_IN, expo out) and leaves upward (TEXT_OUT), clipped to it.
const rail = (g, str, x, y, s, color, tin, tout, t, align = 'left', clipX = [0, W]) => {
  if (!str || t < tin || (tout != null && t >= tout + TEXT_OUT)) return;
  const h = s.size * 1.3, top = y - s.size * 1.02;
  const enter = 1 - expOut((t - tin) / TEXT_IN), leave = tout != null && t > tout ? Math.pow(clamp((t - tout) / TEXT_OUT), 2) : 0;
  clipRect(g, clipX[0], top, clipX[1] - clipX[0], h, () => text(g, str, x, y + (enter - leave) * h, s, color, align));
};
const typed = (str, t, t0, cps) => str.slice(0, Math.max(0, Math.min(str.length, Math.floor((t - t0) * cps + 1e-6))));
const caret = (g, x, base, size, color = C.accent) => { g.fillStyle = color; g.fillRect(x, base - size * 0.95, 4, size * 1.18); };

// ---------------------------------------------------------------- results
const IMG = {};
const placeIn = (id, s) => placeOf(A[id], paneOf(s), A[id].focus);
const drawAsset = (g, id, pl, dx = 0, dy = 0) => {
  const a = A[id];
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(IMG[id], pl.x + dx, pl.y + dy, a.size[0] * pl.k, a.size[1] * pl.k);
};
// a pane painter: the bench, then the asset at its place in that scene's pane (shifted by dx, dy for a move)
const painter = (id, s, ddy = 0) => (g, dx = 0, dy = 0) => { g.fillStyle = C.bench; g.fillRect(0, 0, W, H); drawAsset(g, id, placeIn(id, s), dx, dy + ddy); };

// result chip: where the result pane's content comes from, on a bench tab next to the seam's grip (glance, mono 25)
const chip = (g, str, x, y, align = 'left', dy = 0) => {
  const w = width(str, TY.label) + 28, x0 = align === 'left' ? x : x - w;
  clipRect(g, x0 - 2, y, w + 4, 40, () => {
    g.fillStyle = C.bench; rrect(g, x0, y + dy, w, 40, 4); g.fill();
    text(g, str, x0 + 14, y + dy + 28, TY.label, C.onBench);
  });
};
// the chip of the result showing at t in a scene, swapping (0.24 s) when the result changes
const chipFor = (g, sc, t, x, y, align = 'left') => {
  const R = sc.T.results;
  let k = -1;
  for (let j = 0; j < R.length; j++) if (t >= sc.start + R[j].at) k = j;
  const id = k < 0 ? lastResult(FILM, FILM.scenes, sc.i) : R[k].asset;
  if (!id) return;
  const t0 = k < 0 ? sc.start : sc.start + R[k].at + (R[k].move ? R[k].move.dur / 2 : 0);
  if (t < t0 && k >= 0) { const prev = k > 0 ? R[k - 1].asset : lastResult(FILM, FILM.scenes, sc.i); if (prev) chip(g, A[prev].chip, x, y, align); return; }
  chip(g, A[id].chip, x, y, align, (1 - expOut((t - t0) / 0.24)) * 40);
};
const gripV = (g, x) => { g.fillStyle = C.accent; rrect(g, x - 12, 40, 24, 64, 4); g.fill(); g.fillStyle = C.key; g.fillRect(x - 5, 58, 2, 28); g.fillRect(x + 3, 58, 2, 28); };
const gripH = (g, y) => { g.fillStyle = C.accent; rrect(g, W - 104, y - 12, 64, 24, 4); g.fill(); g.fillStyle = C.key; g.fillRect(W - 86, y - 5, 28, 2); g.fillRect(W - 86, y + 3, 28, 2); };

// ---------------------------------------------------------------- moves (created in ready(), drawn by p)
let NOW = 0;                    // the time the frame being painted is at: pane painters of a move read it
const MV = {};                  // `${scene}:${k}` → handle
const progress = (t, a, d) => clamp((t - a) / d);

// the result pane of a scene with a vertical seam at L.X (request, pick) at time t
const resultPane = (g, sc, t) => {
  const R = sc.T.results;
  let k = -1;
  for (let j = 0; j < R.length; j++) if (t >= sc.start + R[j].at) k = j;
  if (k < 0) { const id = lastResult(FILM, FILM.scenes, sc.i); if (id) painter(id, sc.s)(g); return; }
  const r = R[k], m = MV[`${sc.i}:${k}`];
  if (r.move && m && t < sc.start + r.at + r.move.dur && r.move.role !== 'open') { m.draw(g, progress(t, sc.start + r.at, r.move.dur)); return; }
  painter(r.asset, sc.s)(g);
};

// ---------------------------------------------------------------- the input side, per type
const inputOf = {
  request(g, sc, t, out) {
    const s = sc.s, T = sc.T, t0 = sc.start;
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, -1, out, t);
    s.claim && [].concat(s.claim).forEach((p, k) => rail(g, p, MARGIN, L.claimA[k], TY.claim, C.ink, t0 + T.phrases[k], out, t));
    const pOut = Math.min(out ?? Infinity, t0 + T.promptOut);
    if (t < pOut + TEXT_OUT) {
      const leave = t > pOut ? Math.pow(clamp((t - pOut) / TEXT_OUT), 2) : 0, sz = TY.req, y = L.prompt, h = sz.size * 1.3;
      clipRect(g, 0, y - sz.size * 1.02, L.X - 20, h, () => {
        text(g, '>', MARGIN, y - leave * h, sz, C.muted);
        text(g, typed(s.prompt, t, t0 + 0.25 * B, CPS), MARGIN + 2 * CHW(sz), y - leave * h, sz, C.ink);
      });
    }
  },
  pick(g, sc, t, out) {
    const s = sc.s, T = sc.T, t0 = sc.start;
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, t0 + 0.25 * B, out, t);
    rail(g, s.claim, MARGIN, L.claimB, TY.claim, C.ink, t0 + T.claimAt, out, t);
    let k = -1;
    for (let j = 0; j < T.hops.length; j++) if (t >= t0 + T.hops[j]) k = j;
    const cur = k >= 0 ? s.list.indexOf(s.picks[k].item) : -1;
    s.list.forEach((m, i) => rail(g, m, L.listX, L.listY + i * L.listStep, i === cur ? TY.codeB : TY.code, i === cur ? C.ink : C.muted, t0 + T.listAt + i * 0.04, out, t));
    if (k >= 0 && (out == null || t < out)) {
      const prev = k > 0 ? s.list.indexOf(s.picks[k - 1].item) : cur, u = cubicInOut(clamp((t - t0 - T.hops[k]) / 0.25));
      const y = L.listY + lerp(prev, cur, k > 0 ? u : 1) * L.listStep;
      g.globalAlpha = k === 0 ? clamp((t - t0 - T.hops[0]) / 0.15) : 1;
      g.fillStyle = C.accent; g.fillRect(MARGIN, y - 26, 6, 34); g.globalAlpha = 1;
    }
  },
  file(g, sc, t, out) {
    const s = sc.s, T = sc.T, t0 = sc.start, ch = CHW(TY.code);
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, -1, out, t);
    rail(g, s.claim, MARGIN, L.claimC, TY.claim, C.ink, t0 + T.claimAt, out, t);
    s.lines.forEach((ln, i) => {
      const y = L.inputY + i * L.inputStep;
      rail(g, String(s.source.from + i), MARGIN, y, TY.code, C.dim, -1, out, t);
      rail(g, ln, L.inputX, y, TY.code, C.ink, -1, out, t);
    });
    // the underline: the token the seam pairs with the frame under it
    if (t >= t0 + T.pairs[0] && (out == null || t < out)) {
      let k = 0;
      for (let j = 0; j < T.pairs.length; j++) if (t >= t0 + T.pairs[j]) k = j;
      const box = (j) => { const p = s.pairs[j], i = s.lines[p.line].indexOf(p.token); return { x: L.inputX + (i + 1) * ch, w: (p.token.length - 2) * ch, y: L.inputY + p.line * L.inputStep }; };
      const a = box(Math.max(0, k - 1)), b = box(k);
      const u = k === 0 ? 1 : cubicInOut(clamp((t - t0 - T.pairs[k]) / 0.2)), draw = k === 0 ? clamp((t - t0 - T.pairs[0]) / 0.15) : 1;
      g.fillStyle = C.accent; g.fillRect(lerp(a.x, b.x, u), lerp(a.y, b.y, u) + 9, lerp(a.w, b.w, u) * draw, 4);
    }
  },
  render(g, sc, t, out, bandY) {
    const s = sc.s, T = sc.T, t0 = sc.start;
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, t0 + 0.5 * B, out, t);
    if (t >= t0 + T.cmdAt && (out == null || t < out + TEXT_OUT)) {
      clipRect(g, 0, 0, W, bandY, () => text(g, typed(s.command, t, t0 + T.cmdAt, CPS), MARGIN, L.cmdY, TY.req, C.ink));
      if (t < t0 + T.cmdEnd + 0.25) caret(g, MARGIN + typed(s.command, t, t0 + T.cmdAt, CPS).length * CHW(TY.req) + 2, L.cmdY, 44);
    }
  },
  diff(g, sc, t, out) {
    const s = sc.s, T = sc.T, t0 = sc.start, y0 = L.diffY, y1 = L.diffY + L.diffStep;
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, -1, out, t);
    text(g, String(s.line.n), L.diffNum, y0, TY.code, C.dim); text(g, '-', L.diffSign, y0, TY.code, C.muted); text(g, s.line.before, L.diffCode, y0, TY.code, C.muted);
    if (t >= t0 + T.plusAt) {
      const u = clamp((t - t0 - T.plusAt) / 0.15);
      g.fillStyle = C.accent; g.fillRect(L.diffBar, y1 - 30 + (1 - u) * 20, 6, 40 * u);
      text(g, String(s.line.n), L.diffNum, y1, TY.code, C.dim); text(g, '+', L.diffSign, y1, TY.code, C.ink);
      text(g, typed(s.line.after, t, t0 + T.plusAt, T.plusCps), L.diffCode, y1, TY.code, C.ink);
    }
    [].concat(s.claim).forEach((p, k) => rail(g, p, L.claimEX, L.claimE[k], TY.claim, C.ink, t0 + (k === 0 ? T.p1 : T.p2), out, t));
  },
};

// ---------------------------------------------------------------- whole states
// stateOf(g, i, t): scene i's full frame at time t (its entering move done); the previous scene's copy leaves on top
// where both share the input side (pick after request, render after file)
const stateOf = (g, i, t) => {
  const sc = SC[i], s = sc.s, T = sc.T, prev = SC[i - 1];
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (s.type === 'request' || s.type === 'pick') {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    if (s.type === 'pick' && prev) inputOf[prev.s.type](g, prev, t, prev.end);
    inputOf[s.type](g, sc, t, null);
    if (s.type === 'request' && t < sc.start + T.open[0]) {          // the caret follows the typing
      caret(g, MARGIN + 2 * CHW(TY.req) + typed(s.prompt, t, sc.start + 0.25 * B, CPS).length * CHW(TY.req) + 2, L.prompt, 44);
      return;
    }
    if (s.type === 'request' && t < sc.start + T.open[1]) { MV[`${i}:0`].draw(g, progress(t, sc.start + T.open[0], T.open[1] - T.open[0])); }
    else { clipRect(g, L.X, 0, W - L.X, H, () => resultPane(g, sc, t)); seamV(g, L.X, 0, H, C); }
    if (s.type !== 'request' || t >= sc.start + T.land) gripV(g, L.X);
    if (s.type !== 'request' || t >= sc.start + T.land + 0.5 * B) chipFor(g, sc, t, L.X + 28, 50);
    return;
  }
  if (s.type === 'file') {
    const y = YC(s);
    g.fillStyle = C.paper; g.fillRect(0, 0, W, y);
    let k = 0;
    for (let j = 0; j < T.results.length; j++) if (t >= sc.start + T.results[j].at) k = j;
    clipRect(g, 0, y, W, H - y, () => painter(T.results[k].asset, s)(g));
    inputOf.file(g, sc, t, null);
    seamH(g, y, 0, W, C); gripH(g, y);
    chipFor(g, sc, t, W - 120, y + 22, 'right');
    return;
  }
  if (s.type === 'render') {
    const br = MV[`${i}:branch`], pb = progress(t, sc.start + T.branch[0], T.branch[1] - T.branch[0]);
    br.draw(g, pb);
    const S = { y: lerp(YC(prev.s), L.YD, cubicInOut(clamp(pb / 0.5))) };
    gripH(g, S.y);
    chipFor(g, sc, t, pb >= 1 ? L.XD - 28 : W - 120, S.y + 22, 'right');
    return;
  }
  if (s.type === 'diff') {
    g.fillStyle = C.paper; g.fillRect(0, 0, W, L.YD);
    inputOf.diff(g, sc, t, null);
    MV[`${i}:slide`].draw(g, progress(t, sc.start + T.slide[0], T.slide[1] - T.slide[0]));
    seamH(g, L.YD, 0, W, C); gripH(g, L.YD);
    const x = lerp(L.XD, L.XE, cubicInOut(progress(t, sc.start + T.slide[0], T.slide[1] - T.slide[0]))), dy = (1 - expOut((t - sc.start - T.chipsAt) / 0.24)) * 40;
    if (t >= sc.start + T.chipsAt) { chip(g, A[s.before].chip, x - 28, L.YD + 22, 'right', dy); chip(g, A[s.after].chip, x + 28, L.YD + 22, 'left', dy); }
    return;
  }
  if (s.type === 'lockup') {
    const x = T.close ? lerp(L.XF, W + 16, cubicInOut(progress(t, sc.start + T.close[0], T.close[1] - T.close[0]))) : L.XF;
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    rail(g, s.label, MARGIN, L.label, TY.label, C.dim, -1, null, t);
    rail(g, s.name, MARGIN, L.name, TY.name, C.ink, sc.start + T.nameAt, null, t);
    if (t >= sc.start + T.cmdAt) text(g, typed(s.command, t, sc.start + T.cmdAt, CPS), MARGIN, L.install, TY.code, C.ink);
    rail(g, s.url, MARGIN, L.url, TY.code, C.muted, sc.start + T.urlAt, null, t);
    if (s.line) rail(g, s.line, MARGIN, L.line, TY.label, C.dim, sc.start + T.lineAt, null, t);
    const n = typed(s.command, t, sc.start + T.cmdAt, CPS).length, cx = MARGIN + n * CHW(TY.code) + 3;
    const typing = t >= sc.start + T.cmdAt && t < sc.start + T.cmdEnd + 0.25, blink = (T.blinks ?? []).some((b) => t >= sc.start + b && t < sc.start + b + 0.25);
    if (typing || blink) caret(g, cx, L.install, 33);
    if (x < W) {
      clipRect(g, x, 0, W - x, H, () => { painter(s.result, s)(g, x - L.XF, 0); chip(g, A[s.result].chip, L.XF + 28 + (x - L.XF), 50); });
      seamV(g, x, 0, H, C); gripV(g, x);
    }
  }
};

// the frame at t: the scene's state, or its entering wipe line from the previous scene's last state
const sceneAt = (t) => { let i = 0; for (let j = 0; j < SC.length; j++) if (t >= SC[j].start - 1e-6) i = j; return i; };
const paintAt = (g, t) => {
  NOW = t;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const i = sceneAt(t), sc = SC[i], T = sc.T;
  if (T.wipe && t < sc.start + T.wipe[1] && i > 0) { MV[`${i}:wipe`].draw(g, progress(t, sc.start + T.wipe[0], T.wipe[1] - T.wipe[0])); return; }
  stateOf(g, i, t);
};

// px per frame of the fastest point of whatever move is running at t (the seam, its copies, a drawer, the slider)
const speed = (t) => {
  const i = sceneAt(t), sc = SC[i], T = sc.T, rel = t - sc.start;
  const one = (m, a, d) => (m && rel > a && rel < a + d ? m.speed((rel - a) / d) / (d * FPS) : 0);
  let v = 0;
  if (T.open) v = Math.max(v, one(MV[`${i}:0`], T.open[0], T.open[1] - T.open[0]));
  T.results.forEach((r, k) => { if (r.move && r.move.role !== 'open') v = Math.max(v, one(MV[`${i}:${k}`], r.at, r.move.dur)); });
  if (T.wipe && i > 0) v = Math.max(v, one(MV[`${i}:wipe`], T.wipe[0], T.wipe[1] - T.wipe[0]));
  if (T.branch) v = Math.max(v, one(MV[`${i}:branch`], T.branch[0], T.branch[1] - T.branch[0]));
  if (T.slide) v = Math.max(v, one(MV[`${i}:slide`], T.slide[0], T.slide[1] - T.slide[0]));
  if (T.close && rel > T.close[0] && rel < T.close[1]) {
    const x = (r) => lerp(L.XF, W + 16, cubicInOut(clamp((r - T.close[0]) / (T.close[1] - T.close[0]))));
    v = Math.max(v, Math.abs(x(rel) - x(rel - 1 / FPS)));
  }
  return v;
};

// ---------------------------------------------------------------- setup
let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error(`cannot load ${src}`)); im.src = src; });
export const ready = async () => {
  MEASURE = document.createElement('canvas').getContext('2d');
  for (const [id, a] of Object.entries(A)) IMG[id] = await load(`assets/real/${a.file}`);
  for (const sc of SC) {
    const { s, i, T } = sc, prev = SC[i - 1];
    for (const [k, r] of T.results.entries()) {
      if (!r.move) continue;
      if (r.move.role === 'open') {
        const ch = width('0', TY.req);
        MV[`${i}:${k}`] = await createMove(FILM, 'open', {
          caret: { x: MARGIN + 2 * ch + s.prompt.length * ch + 4, y: L.prompt - 16, h: 52, w: 4 },
          seam: { x: L.X, y0: 0, y1: H }, pane: paneOf(s), run: 0.75 / 1.75,
          to: { paint: painter(r.asset, s) }, colors: C,
        });
      } else {
        const from = k > 0 ? T.results[k - 1].asset : lastResult(FILM, FILM.scenes, i);
        MV[`${i}:${k}`] = await createMove(FILM, r.move.role, { pane: paneOf(s), from: { paint: painter(from, s) }, to: { paint: painter(r.asset, s) }, colors: C });
      }
    }
    if (T.wipe && i > 0) MV[`${i}:wipe`] = await createMove(FILM, 'wipe', { dir: s.type === 'lockup' ? 'left' : 'down', from: { paint: (g) => stateOf(g, i - 1, Math.min(NOW, prev.end - 1e-3)) }, to: { paint: (g) => stateOf(g, i, NOW) }, colors: C });
    if (T.branch) {
      const y0 = YC(prev.s);
      const panes = (g, S) => {
        const t = NOW;
        g.fillStyle = C.paper; g.fillRect(0, 0, W, S.y);
        inputOf.file(g, prev, t, prev.end);
        inputOf.render(g, sc, t, null, S.y);
        // the film below: its frame rides up with the seam, from its place in the file scene to its place here
        let k = -1;
        for (let j = 0; j < T.results.length; j++) if (t >= sc.start + T.results[j].at) k = j;
        const id = k < 0 ? lastResult(FILM, FILM.scenes, i) : T.results[k].asset;
        const p0 = placeIn(id, prev.s), p1 = placeIn(id, s), u = (y0 - S.y) / (y0 - L.YD);
        const pl = { x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u), k: p1.k };
        clipRect(g, 0, S.y, W, H - S.y, () => { g.fillStyle = C.bench; g.fillRect(0, 0, W, H); drawAsset(g, id, pl); });
        if (S.tip > S.y) clipRect(g, L.XD, S.y, W - L.XD, S.tip - S.y, () => reportPane(g, sc, t));
      };
      MV[`${i}:branch`] = await createMove(FILM, 'branch', { y0, y1: L.YD, x: L.XD, y2: H, panes, colors: C });
    }
    if (T.slide) {
      const pane = paneOf(s);
      MV[`${i}:slide`] = await createMove(FILM, 'slide', { pane, x0: L.XD, x1: L.XE, before: { paint: painter(s.before, s) }, after: { paint: painter(s.after, s) }, colors: C });
    }
  }
};

// the report pane of a render scene: the bench, the report's label and lines (glance), the claim, the result line
const reportPane = (g, sc, t) => {
  const s = sc.s, T = sc.T, t0 = sc.start, x = L.reportX;
  g.fillStyle = C.bench; g.fillRect(L.XD, 0, W - L.XD, H);
  rail(g, s.report.label, x, L.reportLabel, TY.label, C.mutedOnBench, t0 + T.labelAt, null, t);
  const [p1, p2] = [].concat(s.claim);
  rail(g, p1, x, L.claimD[0], TY.claim, C.onBench, t0 + T.p1, null, t);
  if (p2) rail(g, p2, x, L.claimD[1], TY.claim, C.onBench, t0 + T.p2, null, t);
  s.report.lines.forEach(([st, item, val], k) => {
    const y = L.reportY + k * L.reportStep, tin = t0 + T.lines[k];
    rail(g, st, x, y, TY.label, C.onBench, tin, null, t);
    rail(g, item, x + 78, y, TY.label, C.mutedOnBench, tin, null, t);
    rail(g, val, W - MARGIN, y, TY.label, C.onBench, tin, null, t, 'right');
  });
  rail(g, s.report.result, x, L.resultY, TY.labelB, C.onBench, t0 + T.resultAt, null, t);
};

export const render = (ctx, t) => subframes(ctx, paintAt, t, { speed: speed(t), fps: FPS, shutter: 0.5 });
if (typeof window !== 'undefined') window.__film = { paintAt, speed, SC, TM };

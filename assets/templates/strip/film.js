// film.js — the Strip renderer: a pure function of t (render(ctx, t)), wired through lib/boot.js.
//
// One strip of film on a light box carries the film: real frames of real films move through a fixed gate and stop
// registered in it (moves.js `advance`), a frame punches to the full frame and shrinks into its cell on a contact
// sheet whose rows are as long as the films (`punch`), the grease pencil rings one cell, which punches to full and
// runs (`pick`), and the strip runs out of the gate at the end. Times come from choreo.js, the module
// timing.rules.js and score.mjs read. The camera never moves.
import content from './content.js';
import rules, { validate } from './timing.rules.js';
import { fit } from './lib/timing.js';
import PALETTES from './palettes.js';
import { build, sceneAt, C } from './choreo.js';
import { ADAPTERS, moveOf } from './moves.js';
import stripAdvance from './lib/handoffs/strip-advance.js';
import gatePunch from './lib/handoffs/gate-punch.js';
import sheetPick from './lib/handoffs/sheet-pick.js';
import { S as STRIP, cellFrame, paintSheet, sheetCell, rowEndX, pencilLoop, pencilUnderline, FULL, drawCrop, paintTrack } from './lib/handoffs/strip.js';
import { text, measure, clamp, lerp, cubicOut, cubicInOut, settle } from './lib/handoffs/util.js';
import { subframes } from './lib/canvas.js';
import TRACKS from './assets/real/tracks.js';

const problems = validate(content);
if (problems.length) throw new Error('content.js\n' + problems.join('\n'));

export const T = fit(content, rules);
export const duration = T.duration;
const B = T.beat, FPS = 30, W = 1920, H = 1080;
const PAL = PALETTES[content.palette];
if (!PAL) throw new Error(`content.js\npalette "${content.palette}" is not in palettes.js (${Object.keys(PALETTES).join(', ')})`);
const PERFS = content.perfs ?? 'double';
const FAM = 'Hanken Grotesk', MONO_FAM = 'DM Mono';
const F = {
  title: { family: FAM, weight: 700 },
  caption: { family: FAM, weight: 600, size: 59 },
  label: { family: FAM, weight: 600, size: 33 },
  name: { family: FAM, weight: 700, size: 140 },
  mono: { family: MONO_FAM, weight: 500 },
};
export const fonts = [{ family: FAM, weight: 700 }, { family: FAM, weight: 600 }, { family: MONO_FAM, weight: 500 }];

// the gate: a frame registered at the centre, its strip's top so the frame's centre is at y 486; labels on y 950
const GATE = { cx: 960, top: 156 };
const GATE_RECT = cellFrame(0, 0, GATE.cx, GATE.top, 1);
const CAP_Y = 950, CAP_Y_SHEET = 984, NAME_Y = 560, URL_Y = 650;   // under the sheet the captions sit lower, clear of its last row
const FILMS = content.films, IDS = Object.keys(FILMS);
const Fb = build(content, T);
const tb = (sc, b) => sc.start + b * B;                   // a scene's beat → film seconds
const MV = content.moves ?? {};
const MOVE = { advance: moveOf('advance', MV.advance).id, punch: moveOf('punch', MV.punch).id, pick: moveOf('pick', MV.pick).id };

// ---------- assets ----------
const IMG = { frame: {}, row: {}, run: {}, capture: {} };
const img = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => i.decode().then(() => res(i), () => res(i)); i.onerror = () => rej(new Error(`image ${src}`)); i.src = src; });
const full = (im) => [0, 0, im.naturalWidth, im.naturalHeight];
let MIX = {}, REEL = [], CLOSE = null, ROWS = [], ENV = null;

export const ready = async () => {
  await Promise.all(IDS.map(async (id) => {
    const f = FILMS[id];
    IMG.frame[id] = await img(`assets/real/${f.frame.file}`);
    IMG.row[id] = await img(`assets/real/${f.row.file}`);
    if (f.run) IMG.run[id] = await Promise.all(Array.from({ length: f.run.frames }, (_, k) => img(`assets/real/${f.run.dir}/${String(k).padStart(2, '0')}.${f.run.ext ?? 'webp'}`)));
  }));
  for (const [id, c] of Object.entries(content.captures || {})) IMG.capture[id] = await img(`assets/real/${c.file}`);
  // this film's own mix beside each intertitle (score.mjs writes it; without it those tracks are blank)
  try { MIX = (await import('./assets/audio/track.js')).default?.cells ?? {}; } catch { MIX = {}; }
  const cellOf = (c, k) => {
    if (c.kind === 'film') { const im = IMG.frame[c.film]; return { kind: 'image', img: im, crop: full(im), env: TRACKS[c.film] ?? null }; }
    if (c.kind === 'title') return { kind: 'title', text: c.text, size: 79, env: MIX[k]?.text === c.text ? MIX[k].env : null };
    if (c.kind === 'source') return sourceCell();
    if (c.kind === 'run') { const im = IMG.run[c.film]?.[c.frame] ?? IMG.frame[c.film]; return { kind: 'image', img: im, crop: full(im) }; }
    return { kind: 'title', text: '' };
  };
  REEL = Fb.reel.map(cellOf);
  CLOSE = Fb.close ? Fb.close.map(cellOf) : null;
  ROWS = IDS.map((id) => {
    const f = FILMS[id];
    return { id, name: f.name, dur: f.duration, seconds: Math.round(f.duration), cells: f.row.times.map((_, k) => ({ kind: 'image', img: IMG.row[id], crop: [k * 192, 0, 192, 108] })) };
  });
  const modules = { 'strip-advance': stripAdvance, 'gate-punch': gatePunch, 'sheet-pick': sheetPick };
  const env = { modules, PAL, F };
  const adv = ADAPTERS.advance[MOVE.advance];
  ENV = { env, gate: adv.create(env, { cells: REEL, cx: GATE.cx, top: GATE.top }), close: CLOSE ? adv.create(env, { cells: CLOSE, cx: GATE.cx, top: GATE.top }) : null };
  // the hand-offs, each with the scene it reveals or leaves drawn underneath
  const pu = Fb.punchScene, pk = Fb.pickScene;
  if (pu) {
    const id = IDS.includes(lastFilmBefore(pu.i)) ? lastFilmBefore(pu.i) : IDS.at(-1), cell = FILMS[id].row.times.findIndex((x) => Math.abs(x - FILMS[id].frame.at) < 1 / 30);
    const im = IMG.frame[id];
    ENV.punchIn = ADAPTERS.punch[MOVE.punch].create(env, { rect: GATE_RECT, direction: 'in', ease: 'out', image: im, crop: full(im), under: (ctx) => withText(() => gateScene(ctx, tb(pu, 0))) });
    ENV.punchOut = ADAPTERS.punch[MOVE.punch].create(env, { rect: cellRect(IDS.indexOf(id), cell), direction: 'out', ease: 'inOut', image: im, crop: full(im), small: { img: IMG.row[id], crop: [cell * 192, 0, 192, 108] }, under: (ctx) => withText(() => sheetScene(ctx, pu.end, { loop: false })) });
    ENV.punched = { id, im };
  }
  if (pk) {
    const f = FILMS[pk.film], first = IMG.run[pk.film]?.[0] ?? IMG.frame[pk.film], last = IMG.run[pk.film]?.at(-1) ?? IMG.frame[pk.film];
    ENV.pick = ADAPTERS.pick[MOVE.pick].create(env, { rect: cellRect(IDS.indexOf(pk.film), pk.cell), image: first, crop: full(first), small: { img: IMG.row[pk.film], crop: [pk.cell * 192, 0, 192, 108] }, seed: content.seed ?? 3, under: (ctx) => withText(() => sheetScene(ctx, tb(pk, pk.p.pick[0]), { loop: false })) });
    ENV.backIn = ADAPTERS.punch[MOVE.punch].create(env, { rect: GATE_RECT, direction: 'out', ease: 'inOut', image: last, crop: full(last), under: (ctx) => withText(() => closeScene(ctx, pk.end)) });
    ENV.run = { frames: IMG.run[pk.film] ?? [first], fps: f.run?.fps ?? FPS, first, last };
  }
};
function lastFilmBefore(i) { for (let k = i - 1; k >= 0; k--) { const s = Fb.scenes[k]; if (s.type === 'frames') { const L = s.p.landings; return L.at(-1)?.film; } } return null; }
function sourceCell() {
  const L = content.scenes.at(-1), c = content.captures?.[L.source];
  if (c) return { kind: 'asset', asset: { image: IMG.capture[L.source], crop: c.crop }, focus: null };
  const im = IMG.frame[L.source]; return { kind: 'image', img: im, crop: full(im) };
}

// ---------- the light box ----------
function lightbox(ctx) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAL.ground; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(960, 486, 120, 960, 486, 1150);
  g.addColorStop(0, PAL.glow); g.addColorStop(1, PAL.ground);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// the gate's four corners on the base, fixed (decoration: where a frame registers)
function gateCorners(ctx, a = 1) {
  if (a <= 0) return;
  const r = GATE_RECT, o = 8, l = 26;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = PAL.dim; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  for (const [x, y, sx, sy] of [[r.x - o, r.y - o, 1, 1], [r.x + r.w + o, r.y - o, -1, 1], [r.x - o, r.y + r.h + o, 1, -1], [r.x + r.w + o, r.y + r.h + o, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * l); ctx.lineTo(x, y); ctx.lineTo(x + sx * l, y); ctx.stroke();
  }
  ctx.restore();
}
// perfs 'single' (the form variant): one row of holes along the top; the bottom edge carries a wide optical track
function singleEdge(ctx, cells, s, cx, top, k, track, { end = cells.length, clipX = null, veil = 0 } = {}) {
  if (PERFS !== 'single') return;
  const pitch = STRIP.PITCH * k, left = cx - (STRIP.FW * k) / 2 - STRIP.FRAME_X * k - s * pitch;
  const x0 = Math.max(-pitch, left), x1 = Math.min(clipX ?? W + pitch, left + end * pitch);
  if (x1 <= x0) return;
  const y0 = top + (STRIP.FRAME_Y + STRIP.FH + 4) * k, y1 = top + (STRIP.H - 6) * k;
  ctx.save(); ctx.fillStyle = PAL.base; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (k > 0.5) for (let i = Math.max(0, Math.floor(s - cx / pitch) - 1); i < Math.min(end, Math.ceil(s + (W - cx) / pitch) + 2); i++) {
    const r = cellFrame(i, s, cx, top, k), env = cells[i]?.env;
    if (env) paintTrack(ctx, PAL, env, r.x, y0 + 6 * k, r.w, y1 - y0 - 12 * k, track ?? { lit: 0 });
  }
  if (veil > 0.001) { ctx.globalAlpha = veil; ctx.fillStyle = PAL.ground; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
  ctx.restore();
}

// ---------- labels (cut in and out on the beat; drawn after the motion blur, sharp) ----------
let TEXT = true;
const withText = (f) => { const was = TEXT; TEXT = true; try { f(); } finally { TEXT = was; } };
const CAPS = Fb.scenes.flatMap((sc) => sc.p.captions.map((c) => ({ from: tb(sc, c.from), to: c.to != null ? tb(sc, c.to) : sc.end, text: c.text })));
function captions(ctx, t) {
  if (!TEXT) return;
  const c = CAPS.find((x) => x.text && t >= x.from - 1e-9 && t < x.to - 1e-9);
  if (c) text(ctx, c.text, 960, phase(t)[0] === 'sheet' ? CAP_Y_SHEET : CAP_Y, F.caption, { color: PAL.ink, align: 'center' });
}

// ---------- the main reel in the gate ----------
const trackState = (t) => (!Fb.track || t < Fb.track[0] ? { lit: 0 } : t < Fb.track[1] ? { lit: 1, sweep: lerp(-320, 2240, (t - Fb.track[0]) / (Fb.track[1] - Fb.track[0])) } : { lit: 1 });
const curve = (name, u) => stripAdvance.at(clamp(u), { ...stripAdvance.defaults, from: 0, to: 1, curve: name }).s;
function reelS(t) {
  const st = Fb.stops;
  if (!st.length) return 0;
  const [t0, c0] = st[0];
  if (Fb.runIn) {
    const [a, z] = Fb.runIn, s0 = c0 - C.runInCells, v0 = (3 * C.runInCells) / (z - a);
    if (t < a) return s0 + v0 * (t - a);
    if (t < z) return lerp(s0, c0, curve('brake', (t - a) / (z - a)));
  } else if (t < t0) return c0;
  let s = c0;
  for (let k = 1; k < st.length; k++) {
    const [tk, ck] = st[k];
    if (t >= tk) { s = ck; continue; }
    if (t > tk - C.pull * B) return lerp(s, ck, curve('claw', (t - (tk - C.pull * B)) / (C.pull * B)));
    break;
  }
  // the run-out, when the lock-up continues the main reel (no pick)
  const L = Fb.scenes.at(-1);
  if (!CLOSE && L.type === 'lockup') {
    const a = tb(L, L.p.runOut[0]), z = tb(L, L.p.runOut[1]);
    if (t >= a) return lerp(s, REEL.length + 0.75, curve('run-out', (t - a) / (z - a)));
  }
  return s;
}
function gateScene(ctx, t) {
  lightbox(ctx);
  const s = reelS(t), track = trackState(t);
  ENV.gate.paint(ctx, s, { track });
  singleEdge(ctx, REEL, s, GATE.cx, GATE.top, 1, track);
  const L = Fb.scenes.at(-1);
  gateCorners(ctx, L.type === 'lockup' && !CLOSE ? 1 - clamp((t - tb(L, L.p.runOut[0])) / (0.5 * B)) : 1);
  captions(ctx, t);
  if (!CLOSE) lockupText(ctx, t);
}

// ---------- the contact sheet ----------
const SHEET_K = 96 / 832;
const SHEET_DY = ((10 - Math.min(10, IDS.length)) * 84) / 2;      // fewer rows sit centred
const cellRect = (r, i) => { const c = sheetCell(r, i); return { ...c, y: c.y + SHEET_DY }; };
function sheetState(t) {
  const sc = Fb.scenes.find((x) => x.type === 'sheet'), pk = Fb.pickScene;
  const short = Math.min(...ROWS.map((r) => r.dur)), longer = ROWS.map((r, i) => ({ i, d: r.dur })).filter((r) => r.d > short + 1e-3).map((r) => r.i);
  const len = ROWS.map((r, i) => {
    if (!sc || !sc.p.extend || r.dur <= short + 1e-3) return r.dur;
    const a = tb(sc, sc.p.extend[0] + C.rowStep * longer.indexOf(i)), u = clamp((t - a) / (0.75 * B));
    return short + (r.dur - short) * cubicOut(u);
  });
  const durs = ROWS.map((_, i) => (sc && t >= tb(sc, sc.p.lengths[0] + C.rowStep * i) - 1e-9 ? 1 : 0));
  const back = pk ? 0.62 * cubicOut(clamp((t - tb(pk, pk.p.stepBack[0])) / (C.step * B))) : 0;
  const pr = pk ? IDS.indexOf(pk.film) : -1;
  return { len, durs, veil: ROWS.map((_, i) => (i === pr ? 0 : back)), labels: 1 };
}
function sheetScene(ctx, t, { loop = true } = {}) {
  lightbox(ctx);
  ctx.save(); ctx.translate(0, SHEET_DY);
  const st = sheetState(t);
  paintSheet(ctx, PAL, F, ROWS, st);
  if (PERFS === 'single') ROWS.forEach((r, i) => singleEdge(ctx, r.cells, 0, SHEET_X + (STRIP.FW * SHEET_K) / 2, 56 + i * 84, SHEET_K, null, { clipX: rowEndX(st.len[i]), veil: st.veil[i] }));
  ctx.restore();
  const pk = Fb.pickScene;
  if (loop && pk && t >= tb(pk, 0)) pencilLoop(ctx, PAL, cellRect(IDS.indexOf(pk.film), pk.cell), cubicInOut(clamp((t - tb(pk, pk.p.loop[0])) / (C.loop * B))), { seed: content.seed ?? 3 });
  captions(ctx, t);
}
const SHEET_X = 432;

// ---------- the closing reel (after a pick) and the lock-up ----------
function closeS(t) {
  const L = Fb.scenes.at(-1);
  let s = 1;
  for (const [tk, ck] of Fb.closeStops) {
    if (t >= tk) { s = ck; continue; }
    if (t > tk - C.pull * B) { s = lerp(s, ck, curve('claw', (t - (tk - C.pull * B)) / (C.pull * B))); }
    break;
  }
  const a = tb(L, L.p.runOut[0]), z = tb(L, L.p.runOut[1]);
  if (t >= a) return lerp(s, CLOSE.length + 0.75, curve('run-out', (t - a) / (z - a)));
  return s;
}
function closeScene(ctx, t) {
  lightbox(ctx);
  const L = Fb.scenes.at(-1), s = closeS(t);
  if (t < tb(L, L.p.runOut[1]) + 0.01) { ENV.close.paint(ctx, s, { end: CLOSE.length }); singleEdge(ctx, CLOSE, s, GATE.cx, GATE.top, 1, null, { end: CLOSE.length }); }
  gateCorners(ctx, 1 - clamp((t - tb(L, L.p.runOut[0])) / (0.5 * B)));
  captions(ctx, t);
  lockupText(ctx, t);
}
function lockupText(ctx, t) {
  const L = Fb.scenes.at(-1);
  if (L.type !== 'lockup' || t < tb(L, L.p.name[0])) return;
  const u = settle(clamp((t - tb(L, L.p.name[0])) / ((L.p.name[1] - L.p.name[0]) * B)), 10);
  ctx.save(); ctx.translate(960, NAME_Y); const k = 1.04 - 0.04 * u; ctx.scale(k, k);
  text(ctx, L.name, 0, 0, F.name, { color: PAL.ink, align: 'center', alpha: clamp(u * 1.6) });
  ctx.restore();
  if (t >= tb(L, L.p.url[0])) {
    const f = { ...F.mono, size: 44 }, w = measure(ctx, L.url, f).width;
    const n = Math.max(1, Math.floor(clamp((t - tb(L, L.p.url[0])) / ((L.p.url[1] - L.p.url[0]) * B)) * L.url.length + 1e-9));
    text(ctx, L.url.slice(0, n), 960 - w / 2, URL_Y, f, { color: PAL.muted });
    if (t >= tb(L, L.p.underline[0])) pencilUnderline(ctx, PAL, 960 - w / 2, 960 + w / 2, URL_Y + 24, cubicInOut(clamp((t - tb(L, L.p.underline[0])) / ((L.p.underline[1] - L.p.underline[0]) * B))));
  }
}

// ---------- the frame at t ----------
const span = (sc, [a, z]) => [tb(sc, a), tb(sc, z)];
const pIn = (t, [a, z]) => clamp((t - a) / (z - a));
function phase(t) {
  const sc = sceneAt(Fb, t), p = sc.p;
  if (sc.type === 'punch') {
    if (t < tb(sc, p.punch[1])) return ['punchIn', pIn(t, span(sc, p.punch))];
    if (t < tb(sc, p.out[0])) return ['punched'];
    return ['punchOut', pIn(t, span(sc, p.out))];
  }
  if (sc.type === 'sheet') return ['sheet'];
  if (sc.type === 'pick') {
    if (t < tb(sc, p.pick[0])) return ['sheet'];
    if (t < tb(sc, p.pick[1])) return ['pick', pIn(t, span(sc, p.pick))];
    if (t < tb(sc, p.back[0])) return ['run', t - tb(sc, p.run[0])];
    return ['backIn', pIn(t, span(sc, p.back))];
  }
  if (sc.type === 'lockup' && CLOSE) return ['close'];
  return ['gate'];
}
const HANDOFF = new Set(['punchIn', 'punched', 'punchOut', 'pick', 'run', 'backIn']);
function paint(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const [ph, x] = phase(t);
  if (ph === 'gate') return gateScene(ctx, t);
  if (ph === 'punchIn') return ENV.punchIn.paint(ctx, x);
  if (ph === 'punched') return drawCrop(ctx, ENV.punched.im, null, FULL);
  if (ph === 'punchOut') return ENV.punchOut.paint(ctx, x);
  if (ph === 'sheet') return sheetScene(ctx, t);
  if (ph === 'pick') return ENV.pick.paint(ctx, x);
  if (ph === 'run') { const R = ENV.run, k = Math.min(R.frames.length - 1, Math.max(0, Math.floor(x * R.fps + 1e-6))); return drawCrop(ctx, R.frames[k], null, FULL); }
  if (ph === 'backIn') return ENV.backIn.paint(ctx, x);
  return closeScene(ctx, t);
}

// ---------- motion blur: the fastest tracked point, px per frame ----------
function trackPts(t) {
  const [ph, x] = phase(t);
  if (ph === 'gate') return [[cellFrame(0, reelS(t), GATE.cx, GATE.top, 1).x, 0]];
  if (ph === 'close') return [[cellFrame(0, closeS(t), GATE.cx, GATE.top, 1).x, 0]];
  if (ph === 'punchIn') return ENV.punchIn.track(x);
  if (ph === 'punchOut') return ENV.punchOut.track(x);
  if (ph === 'pick') return ENV.pick.track(x);
  if (ph === 'backIn') return ENV.backIn.track(x);
  if (ph === 'sheet') return sheetState(t).len.map((l, i) => [rowEndX(l), i]);
  return [];
}
const speedAt = (t) => {
  const a = trackPts(t), b = trackPts(t - 1 / FPS);
  if (phase(t)[0] !== phase(t - 1 / FPS)[0]) return 0;
  let sp = 0;
  for (let k = 0; k < Math.min(a.length, b.length); k++) sp = Math.max(sp, Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1]));
  return sp;
};

let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
export const render = (ctx, t) => {
  TEXT = false;
  try { subframes(ctx, paint, t, { speed: speedAt, fps: FPS, shutter: 0.5 }); } finally { TEXT = true; }
  const ph = phase(t)[0];
  if (!HANDOFF.has(ph)) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    captions(ctx, t);
    ctx.restore();
  }
};
// for tools: paint one frame without motion blur (labels included)
export const still = (ctx, t) => paint(ctx, t);

// reel.js — the engine of the strip bricks: one strip of film on a light box, a fixed gate where a frame registers
// (832 × 468 at the centre), real frames and intertitles as the strip's cells, a contact sheet of strips as long as
// their films, the grease pencil, and the six scenes' timelines and painters (reel-titles, gate-frames, frame-punch,
// length-sheet, pick-run, reel-lockup). Every landing in the gate is pulled in during the last quarter beat before
// it; a scene's first landing is pulled during its `lead` (a quarter beat played under the scene before), so its
// first frame registers on the scene's boundary. Pure: every function is of its arguments.
// From the strip template (assets/templates/strip/choreo.js local, film.js lightbox, gateCorners, captions, reelS,
// sheetState, closeS, lockupText; moves.js adapters over strip-advance, gate-punch, sheet-pick; lib/handoffs/strip.js
// painters): geometry and timings are the template's; the films, frames and rows are slots, not content.js's films.
import { clamp, lerp, text, measure, cubicOut, cubicInOut, settle } from '../../../handoffs/util.js';
import stripAdvance from '../../../handoffs/strip-advance.js';
import gatePunch from '../../../handoffs/gate-punch.js';
import sheetPick from '../../../handoffs/sheet-pick.js';
import { cellFrame, paintSheet, sheetCell, rowEndX, pencilLoop, pencilUnderline, FULL, drawCrop } from '../../../handoffs/strip.js';
import { placeholderFrame } from '../../../handoffs/stage.js';
import { fontStack, readTime } from '../../lang.js';
import LOOK from '../../look/reel-box/look.js';
import { lightbox } from '../../look/reel-box/texture.js';

export const GATE = { cx: 960, top: 156 };
export const GATE_RECT = cellFrame(0, 0, GATE.cx, GATE.top, 1);
export const CAP_Y = 950, CAP_Y_SHEET = 984, NAME_Y = 560, URL_Y = 650;
export const C = { pull: 0.25, runIn: 2, runInCells: 3.5, fill: 6, holdMax: 2, track: [0.4, 1.15], punch: 1, full: 1, loop: 1, step: 0.5, pick: 1, back: 1, runOut: 1.5, urlCps: 72, urlHold: 3, rowStep: 0.1 };
export { lightbox, pencilLoop, pencilUnderline, FULL, drawCrop, cellFrame, sheetCell, rowEndX };

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const fonts = (lang) => {
  const d = fontStack(LOOK, 'display', lang), t = fontStack(LOOK, 'text', lang), m = fontStack(LOOK, 'mono', lang);
  return { title: { family: d, weight: 700 }, caption: { family: t, weight: 600, size: 59 }, label: { family: t, weight: 600, size: 33 }, name: { family: d, weight: 700, size: 140 }, mono: { family: m, weight: 500 } };
};
export const caption = (ctx, s, y, Cl, F, alpha = 1) => { if (s) text(ctx, s, 960, y, F.caption, { color: Cl.ink, align: 'center', alpha }); };

// ── cells ────────────────────────────────────────────────────────────────────────────────────────────────────────
// a cell param: { text, track?, env? } (an intertitle) | { image (an image or a URL), crop?, env?, name? } (a frame);
// a frame without an image is the neutral numbered placeholder frame n
const loadImg = async (src) => { const im = new Image(); im.src = src; await im.decode(); return im; };
const full = (im) => [0, 0, im.naturalWidth || im.width, im.naturalHeight || im.height];
export const cellOf = async (c, n = 0) => {
  if (!c) return { kind: 'title', text: '' };
  if (c.text != null && !c.image) return { kind: 'title', text: c.text, size: 79, env: c.env ?? null };
  const img = typeof c.image === 'string' ? await loadImg(c.image) : c.image || placeholderFrame(c.n ?? n);
  return { kind: 'image', img, crop: c.crop || full(img), env: c.env ?? null };
};
export const cellsOf = (list, n0 = 0) => Promise.all((list || []).map((c, k) => cellOf(c, n0 + k)));
// a deterministic sample envelope (64 RMS values) for an optical track, from a seed
export const sampleEnv = (seed = 1) => Array.from({ length: 64 }, (_, i) => 0.12 + 0.07 * Math.sin(i * 0.9 + seed) + 0.05 * Math.sin(i * 2.3 + seed * 1.7));

// ── the strip in the gate ────────────────────────────────────────────────────────────────────────────────────────
export const curve = (name, u) => stripAdvance.at(clamp(u), { ...stripAdvance.defaults, from: 0, to: 1, curve: name }).s;
export const stripParams = (Cl, F, cells, extra = {}) => ({ ...stripAdvance.defaults, material: 'film', beats: 0.25, cells, cx: GATE.cx, top: GATE.top, k: 1, veil: 0.55, end: cells.length, ground: false, colors: Cl, fonts: F, ...extra });
export const paintReel = (ctx, P, s, extra = {}) => stripAdvance.paint(ctx, { s }, { ...P, ...extra });
export const trackReel = (P, s) => stripAdvance.track({ s }, P);
// the gate's four corners on the base, fixed (decoration: where a frame registers)
export const gateCorners = (ctx, Cl, a = 1) => {
  if (a <= 0) return;
  const r = GATE_RECT, o = 8, l = 26;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = Cl.line || Cl.dim; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  for (const [x, y, sx, sy] of [[r.x - o, r.y - o, 1, 1], [r.x + r.w + o, r.y - o, -1, 1], [r.x - o, r.y + r.h + o, 1, -1], [r.x + r.w + o, r.y + r.h + o, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * l); ctx.lineTo(x, y); ctx.lineTo(x + sx * l, y); ctx.stroke();
  }
  ctx.restore();
};
// the strip's position at beat b from its stops [[beat, cell]] (a claw pull-down in the quarter beat before each)
export const reelAt = (b, stops, { from = null, run = null } = {}) => {
  if (!stops.length) return 0;
  const [b0, c0] = stops[0];
  if (run) {
    const [a, z] = run, s0 = c0 - C.runInCells, v0 = (3 * C.runInCells) / (z - a);
    if (b < a) return s0 + v0 * (b - a);
    if (b < z) return lerp(s0, c0, curve('brake', (b - a) / (z - a)));
  } else if (b < b0) return from != null && b > b0 - C.pull ? lerp(from, c0, curve('claw', (b - (b0 - C.pull)) / C.pull)) : from ?? c0;
  let s = c0;
  for (let k = 1; k < stops.length; k++) {
    const [bk, ck] = stops[k];
    if (b >= bk) { s = ck; continue; }
    if (b > bk - C.pull) return lerp(s, ck, curve('claw', (b - (bk - C.pull)) / C.pull));
    break;
  }
  return s;
};
export const trackState = (b, span) => (!span || b < span[0] ? { lit: 0 } : b < span[1] ? { lit: 1, sweep: lerp(-320, 2240, (b - span[0]) / (span[1] - span[0])) } : { lit: 1 });

// ── the contact sheet ────────────────────────────────────────────────────────────────────────────────────────────
// rows param: [{ name, duration (s), image (a row strip: one 192 × 108 frame per 4 s) | null }]
export const rowsOf = (list) => Promise.all((list || []).map(async (r, i) => {
  const n = Math.max(1, Math.ceil((r.duration || 4) / 4 - 1e-9)), img = typeof r.image === 'string' ? await loadImg(r.image) : r.image || null;
  const cw = r.cell?.[0] ?? 192, ch = r.cell?.[1] ?? 108;
  return { name: r.name, dur: r.duration, seconds: Math.round(r.duration), cells: Array.from({ length: n }, (_, k) => (img ? { kind: 'image', img, crop: [k * cw, 0, cw, ch] } : { kind: 'image', img: placeholderFrame((i + k) % 6, 192, 108), crop: [0, 0, 192, 108] })) };
}));
export const sheetDY = (n) => ((10 - Math.min(10, n)) * 84) / 2;
export const cellRect = (n, r, i) => { const c = sheetCell(r, i); return { ...c, y: c.y + sheetDY(n) }; };
// st: { len (s per row), durs (0..1 per row), veil (0..1 per row), labels }
export const paintRows = (ctx, Cl, F, rows, st) => { ctx.save(); ctx.translate(0, sheetDY(rows.length)); paintSheet(ctx, Cl, F, rows, st); ctx.restore(); };
// the longer rows pull out to their lengths (staggered rowStep, 0.75 beat each, cubic out); the lengths set at their
// ends from `at` (staggered); the other rows step back by `back` (0..1) to 62 %
export const sheetState = (b, rows, { extend = null, lengths = null, pickRow = -1, back = 0 } = {}) => {
  const short = Math.min(...rows.map((r) => r.dur)), longer = rows.map((r, i) => ({ i, d: r.dur })).filter((r) => r.d > short + 1e-3).map((r) => r.i);
  const len = rows.map((r, i) => {
    if (!extend) return r.dur;
    if (r.dur <= short + 1e-3) return r.dur;
    const u = clamp((b - (extend[0] + C.rowStep * longer.indexOf(i))) / 0.75);
    return short + (r.dur - short) * cubicOut(u);
  });
  const durs = rows.map((_, i) => (lengths == null ? 1 : b >= lengths + C.rowStep * i - 1e-9 ? 1 : 0));
  return { len, durs, veil: rows.map((_, i) => (i === pickRow ? 0 : 0.62 * back)), labels: 1 };
};

// ── the hand-offs ────────────────────────────────────────────────────────────────────────────────────────────────
export const punchOf = (Cl, { rect, direction, ease, image, crop, small = null, under }) => {
  const P = { ...gatePunch.defaults, rect, direction, ease, image, crop, small, under, ground: false, colors: Cl };
  return { paint: (ctx, p) => gatePunch.paint(ctx, gatePunch.at(clamp(p), P), P), track: (p) => gatePunch.track(gatePunch.at(clamp(p), P), P) };
};
export const pickOf = (Cl, { rect, image, crop, small, under, seed = 3 }) => {
  const P = { ...sheetPick.defaults, rect, image, crop, small, under, seed, ease: 'out', ground: false, colors: Cl };
  return { paint: (ctx, p) => sheetPick.paint(ctx, sheetPick.at(clamp(p), P), P), track: (p) => sheetPick.track(sheetPick.at(clamp(p), P), P) };
};

// ── the lock-up's type ───────────────────────────────────────────────────────────────────────────────────────────
export const lockupText = (ctx, s, b, T, Cl, F, B) => {
  if (b < T.name[0]) return;
  const u = settle(clamp((b - T.name[0]) / (T.name[1] - T.name[0])), 10);
  ctx.save(); ctx.translate(960, NAME_Y); const k = 1.04 - 0.04 * u; ctx.scale(k, k);
  text(ctx, s.name, 0, 0, F.name, { color: Cl.ink, align: 'center', alpha: clamp(u * 1.6) });
  ctx.restore();
  if (b >= T.url[0] && s.url) {
    const f = { ...F.mono, size: 44 }, w = measure(ctx, s.url, f).width;
    const n = Math.max(1, Math.floor(clamp((b - T.url[0]) / (T.url[1] - T.url[0])) * s.url.length + 1e-9));
    text(ctx, s.url.slice(0, n), 960 - w / 2, URL_Y, f, { color: Cl.muted || Cl.dim });
    if (b >= T.underline[0]) pencilUnderline(ctx, Cl, 960 - w / 2, 960 + w / 2, URL_Y + 24, cubicInOut(clamp((b - T.underline[0]) / (T.underline[1] - T.underline[0]))));
  }
};
// reading beats of a line (lang.js times)
export const readBeats = (s, lang, B) => (s ? readTime(s, lang) / B : 0);
export const q4 = (x) => Math.ceil(x * 4 - 1e-9) / 4;
export const ceil1 = (x) => Math.ceil(x - 1e-9);
export const pIn = (b, [a, z]) => clamp((b - a) / (z - a));
export { clamp, lerp, cubicOut, cubicInOut, settle, text, measure };

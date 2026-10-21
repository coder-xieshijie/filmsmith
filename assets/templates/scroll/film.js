// film.js — the Scroll renderer: a pure function of t (render(ctx, t)), wired through lib/boot.js.
//
// One long vertical sheet (sheet.js): the content's strips — real captures at one scale — joined top to bottom with
// code-set quote bands and cuts; a fixed viewport looks at it. Everything that changes is the sheet's offset (detents,
// reels, the ratchet, the fling: moves.js curves from lib/handoffs), the page's own headings pinned as chapters
// (lib/handoffs/section-lock.js tabsAt), the accent underline under the line being quoted, the band's phrases, an
// unfolding row and the paper roll at the two ends (lib/handoffs/roll.js). Times come from choreo.js, the same module
// timing.rules.js and score.mjs read.
import content from './content.js';
import rules, { validate } from './timing.rules.js';
import { fit } from './lib/timing.js';
import PALETTES from './palettes.js';
import { plan, C, words } from './choreo.js';
import { moveOf } from './moves.js';
import * as SH from './sheet.js';
import { tabsAt } from './lib/handoffs/section-lock.js';
import { drawRoll } from './lib/handoffs/roll.js';
import { text, measure, rgba, clamp, lerp, cubicOut, cubicInOut, expOut } from './lib/handoffs/util.js';
import { subframes } from './lib/canvas.js';
import { mulberry32 } from './lib/rng.js';
import { errorBanner } from './lib/text.js';

const problems = validate(content);
if (problems.length) throw new Error('content.js\n' + problems.join('\n'));

export const T = fit(content, rules);
export const duration = T.duration;
const B = T.beat, FPS = 30, W = SH.W, H = SH.H, TOP = SH.TOP;
const PAL = PALETTES[content.palette];
if (!PAL) throw new Error(`content.js\npalette "${content.palette}" is not in palettes.js (${Object.keys(PALETTES).join(', ')})`);
const SANS = 'Schibsted Grotesk', MONO = 'DM Mono';
export const fonts = [{ family: SANS, weight: 700 }, { family: SANS, weight: 600 }, { family: SANS, weight: 500 }, { family: MONO, weight: 500 }];
const F = (size, weight = 600, family = SANS) => ({ family, weight, size });
const SX = SH.sheetX(content), SW = SH.SW, MINI = content.minimap !== 'off';
const R_ROLL = 30;

// ---- scenes with their plans at the fitted length, and their offsets
const S = T.scenes.map((s, i) => ({ ...s, i, p: plan(s, { i, scenes: T.scenes, content }, B, s.end - s.start, content) }));
const OFFS = SH.offsets(content);
const A = content.assets;

// the offset timeline: [{ t0, t1, a, b, curve }]
const SEGS = [];
{
  let cur = SH.OFF0;
  const seg = (t0, t1, b, curve) => { SEGS.push({ t0, t1, a: cur, b, curve }); cur = b; };
  for (const s of S) {
    const o = OFFS[s.i], mv = content.moves ?? {};
    for (const m of s.p.moves) {
      const t0 = s.start + m.from, t1 = s.start + m.to;
      if (m.kind === 'detent' || m.kind === 'reach') seg(t0, t1, o.to, moveOf('detent', mv.detent).curve);
      if (m.kind === 'reel') seg(t0, t1, s.type === 'ratchet' ? o.lock : o.to, moveOf('reel', mv.reel).curve);
      if (m.kind === 'fling') seg(t0, t1, o.to, moveOf('fling', mv.fling).curve);
    }
    // while a quote is read (and once an unfolded panel's frames have run out), the page keeps creeping up, as a
    // reader's page does (C.creep px a second)
    if (s.p.creep) seg(s.start + s.p.creep[0], s.start + s.p.creep[1], cur + C.creep * (s.p.creep[1] - s.p.creep[0]), (p) => p);
    if (s.type === 'ratchet') (s.p.docks || []).forEach((d, k) => seg(s.start + d.t - C.dockMove * B, s.start + d.t, o.rows[k], expOut));
  }
}
const offsetAt = (t) => {
  let off = SH.OFF0;
  for (const g of SEGS) {
    if (t < g.t0) break;
    off = t >= g.t1 ? g.b : lerp(g.a, g.b, g.curve(clamp((t - g.t0) / (g.t1 - g.t0))));
    if (t < g.t1) break;
  }
  return off;
};
// unfold scenes: their open fraction
const UNFOLDS = S.filter((s) => s.type === 'unfold').map((s) => {
  const m = s.p.moves.find((x) => x.kind === 'unfold');
  return { i: s.i, s, t0: s.start + m.from, t1: s.start + m.to, curve: moveOf('unfold', content.moves?.unfold).curve };
});
const opensAt = (t) => Object.fromEntries(UNFOLDS.map((u) => [u.i, t <= u.t0 ? 0 : t >= u.t1 ? 1 : u.curve((t - u.t0) / (u.t1 - u.t0))]));

// the roll: the opening's unroll, the closing's roll-up (screen y of its centre; null when out of frame)
const OPEN = S[0], LOCK = S.at(-1);
const ROLL_OUT = H + R_ROLL + 40;
const rollAt = (t, L) => {
  const roll = moveOf('roll', content.moves?.roll);
  const un = OPEN.p.moves.find((m) => m.kind === 'unroll');
  if (un && t < OPEN.start + un.to) return lerp(TOP - SH.OFF0 + R_ROLL * 0.2, ROLL_OUT, roll.curve(clamp((t - OPEN.start - un.from) / (un.to - un.from))));
  const up = LOCK.p.moves.find((m) => m.kind === 'rollup');
  if (up && t >= LOCK.start + up.from) {
    const band = L.band(LOCK.band), target = TOP + band.y + band.h - offsetAt(LOCK.start + up.to) + R_ROLL * 0.2 + 2;
    return lerp(ROLL_OUT, target, roll.up(clamp((t - LOCK.start - up.from) / (up.to - up.from))));
  }
  return null;
};

// ---- what each band says, when: [{ lines: [[{ t, text }]], size, exitAt, kind }]
const BANDS = {};
const bandSize = (id) => (content.sheet.find((e) => e && e.band === id)?.size ?? 'quote');
for (const s of S) {
  if (!s.band) continue;
  const list = (BANDS[s.band] ||= []);
  const prev = list.at(-1);
  if (s.type === 'lockup') {
    if (prev) prev.exitAt = s.start + s.p.exitAt;
    list.push({ kind: 'name', name: s.name, url: s.url, nameAt: s.start + s.p.nameAt, urlAt: s.start + s.p.urlAt, urlEnd: s.start + s.p.urlEnd, exitAt: Infinity });
  } else {
    if (prev) prev.exitAt = s.start;
    const lines = [];
    for (const ph of s.p.phrases) (lines[ph.line] ||= []).push({ t: s.start + ph.t, text: ph.text });
    list.push({ kind: 'quote', lines, exitAt: Infinity });
  }
}
// the underlines, one at a time: [{ asset, rects, on, off }]
const MARKS = [];
for (const s of S) {
  if (!s.mark) continue;
  const prev = MARKS.at(-1);
  if (prev && prev.off === Infinity) prev.off = s.start;
  MARKS.push({ ...s.mark, on: s.start + s.p.markAt, off: Infinity });
}
// the ratchet's slot: [{ t (landing), name }] and its marker spans
const RATCHETS = S.filter((s) => s.type === 'ratchet').map((s) => ({
  s, head: s.head ?? 0, from: s.start + s.p.docks[0].t - C.dockMove * B, to: s.end,
  docks: s.p.docks.map((d, k) => ({ t: s.start + d.t, name: d.name, h: s.rows[k].box[3] })),
}));
for (const r of RATCHETS) {
  const next = S[r.s.i + 1];
  if (next?.type === 'unfold') {
    const row = r.s.rows.find((x) => x.asset === next.row.asset && x.box[1] === next.row.box[1]);
    if (row) r.docks.push({ t: next.start + next.p.moves[0].to, name: row.name, h: row.box[3], reach: true });
  }
}

let IMG = {}, MIMG = {}, FRAMES = {}, SLOT = {};
const K = SH.scaleOf(content), MS = SH.MINI.w / SW;

export const ready = async () => {
  for (const id of content.sheet.filter((e) => typeof e === 'string')) {
    const a = A[id], img = new Image();
    img.src = `assets/real/${a.file}`;
    await img.decode();
    IMG[id] = img;
    MIMG[id] = await createImageBitmap(img, { resizeWidth: SH.MINI.w, resizeHeight: Math.max(1, Math.round(a.size[1] * K * MS)), resizeQuality: 'high' });
  }
  for (const s of S.filter((x) => x.type === 'unfold')) {
    const a = A[s.frames];
    if (FRAMES[s.frames]) continue;
    FRAMES[s.frames] = await Promise.all(Array.from({ length: a.count }, async (_, k) => {
      const im = new Image(); im.src = `assets/real/${a.frames}/f${String(k + 1).padStart(3, "0")}.${a.ext ?? "webp"}`; await im.decode(); return im;
    }));
  }
  // where each pinned heading's ink ends, so a ratchet's slot follows the real word
  for (const r of RATCHETS) {
    const hd = content.heads[r.head], a = A[hd.asset], [, by, , bh] = hd.box;
    const y0 = Math.max(0, by - 6), h = Math.min(a.size[1] - y0, bh + 14);
    const c = new OffscreenCanvas(a.size[0], h), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(IMG[hd.asset], 0, y0, a.size[0], h, 0, 0, a.size[0], h);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let right = 0, base = 0;
    const bgv = (d[0] + d[1] + d[2]) / 3;            // the page's own ground, at the strip's corner
    for (let y = 0; y < h - 10; y++) for (let x = 0; x < c.width * 0.6; x++) {
      const i = (y * c.width + x) * 4, v = (d[i] + d[i + 1] + d[i + 2]) / 3;
      if (Math.abs(v - bgv) > 110) { right = Math.max(right, x); base = Math.max(base, y); }
    }
    SLOT[r.head] = { x: (right + 1) * K + 26, base: (base + 1) * K + 1 };
  }
  // copy wider than its slot is an error, shown on every frame
  const g = document.createElement('canvas').getContext('2d'), over = [];
  for (const s of S) {
    if (s.lines) {
      const b = SH.BAND[bandSize(s.band)];
      s.lines.forEach((line, li) => { const w = measure(g, line.join(' '), F(b.size, b.weight)).width; if (w > SW - 2 * SH.BAND_X) over.push(`scene ${s.i + 1} line ${li + 1}: "${line.join(' ')}" is ${Math.round(w)} px; the band holds ${SW - 2 * SH.BAND_X}`); });
    }
    if (s.type === 'lockup') for (const [txt, f] of [[s.name, F(SH.NAME.size, 700)], [s.url, F(SH.URL.size, 500, MONO)]]) { const w = measure(g, txt, f).width; if (w > SW - 2 * SH.BAND_X) over.push(`lockup: "${txt}" is ${Math.round(w)} px; the band holds ${SW - 2 * SH.BAND_X}`); }
    if (s.type === 'unfold') { const w = measure(g, s.caption, F(49)).width; if (w > SH.PANEL.fw * 0.72) over.push(`unfold: caption is ${Math.round(w)} px; at most ${Math.round(SH.PANEL.fw * 0.72)}`); }
  }
  if (over.length) { console.error('[scroll] ' + over.join(' | ')); errorBanner(['COPY TOO WIDE — shorten it', ...over.slice(0, 6)], 'hf-copy-wide'); }
};

// ---- drawing
let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
const sy = (y, off) => TOP + y - off;

// a phrase: rises into its line's clip box, may leave upward
function slotText(ctx, s, x, base, f, color, t, enter, exit = Infinity) {
  if (t < enter) return;
  const u = expOut(clamp((t - enter) / (C.phraseIn * B)));
  const v = t >= exit ? clamp((t - exit) / (C.exit * B)) ** 2 : 0;
  if (v >= 1) return;
  const dy = (1 - u) * f.size * 0.62 - v * f.size * 1.15;
  ctx.save();
  ctx.beginPath(); ctx.rect(SX, base - f.size * 1.0, SW, f.size * 1.32); ctx.clip();
  text(ctx, s, x, base + dy, f, { color });
  ctx.restore();
}

function band(ctx, id, y, size, t) {
  const b = SH.BAND[size];
  ctx.fillStyle = PAL.stock; ctx.fillRect(SX, y, SW, b.h);
  const x = SX + SH.BAND_X;
  for (const e of BANDS[id] || []) {
    if (e.kind === 'quote') e.lines.forEach((line, li) => {
      let px = x;
      for (const ph of line) {
        slotText(ctx, ph.text, px, y + b.lines[li], F(b.size, b.weight), PAL.ink, t, ph.t, e.exitAt + li * 0.1 * B);
        px += measure(ctx, ph.text + ' ', F(b.size, b.weight)).width;
      }
    });
    else {
      slotText(ctx, e.name, x, y + SH.NAME.base, F(SH.NAME.size, 700), PAL.ink, t, e.nameAt);
      if (t >= e.urlAt) {
        const n = Math.max(1, Math.round(clamp((t - e.urlAt) / (e.urlEnd - e.urlAt)) * e.url.length));
        text(ctx, e.url.slice(0, n), x + 4, y + SH.URL.base, F(SH.URL.size, 500, MONO), { color: PAL.muted });
      }
    }
  }
}

const frameIndex = (u, t) => {
  const a = A[u.s.frames];
  return clamp(Math.floor((t - (u.s.start + u.s.p.playAt)) * a.fps + 1e-6), 0, a.count - 1);
};
function panel(ctx, y, h, full, u, t) {
  if (h <= 0.5) return;
  const s = u.s, a = A[s.frames];
  ctx.save();
  ctx.beginPath(); ctx.rect(SX, y, SW, h); ctx.clip();
  ctx.fillStyle = PAL.panel; ctx.fillRect(SX, y, SW, full);
  const fh = full - SH.PANEL.cap - SH.PANEL.pad, fx = SX + (SW - SH.PANEL.fw) / 2, fy = y + SH.PANEL.cap;
  ctx.drawImage(FRAMES[s.frames][frameIndex(u, t)], fx, fy, SH.PANEL.fw, fh);
  if (s.label) text(ctx, s.label, fx + SH.PANEL.fw, y + 58, F(25, 500, MONO), { color: PAL.panelMuted, align: 'right' });
  const capT = s.start + s.p.captionAt;
  if (t >= capT) {
    ctx.save(); ctx.beginPath(); ctx.rect(fx, y + 6, SH.PANEL.fw * 0.75, SH.PANEL.cap - 8); ctx.clip();
    const k = expOut(clamp((t - capT) / (C.phraseIn * B)));
    text(ctx, s.caption, fx, y + 64 + (1 - k) * 32, F(49, 600), { color: PAL.onPanel });
    ctx.restore();
  }
  ctx.restore();
}

function underline(ctx, m, off, L, t) {
  const on = m.on, d = t < on ? 0 : t < on + C.markDraw * B ? cubicOut((t - on) / (C.markDraw * B)) : t >= m.off ? 1 - cubicInOut(clamp((t - m.off) / (C.markOff * B))) : 1;
  if (d <= 0) return;
  const total = m.rects.reduce((s, r) => s + r[2], 0);
  let left = d * total;
  ctx.save(); ctx.strokeStyle = PAL.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const r of m.rects) {
    if (left <= 0) break;
    const w = Math.min(r[2], left); left -= w;
    const y = sy(L.at(m.asset, Math.min(A[m.asset].size[1], r[1] + r[3])), off) + 5;
    ctx.beginPath(); ctx.moveTo(SX + r[0] * K, y); ctx.lineTo(SX + (r[0] + w) * K, y); ctx.stroke();
  }
  ctx.restore();
}

// the ratchet: the docked row's mark in the margin, the rows still to come veiled
function ratchet(ctx, L, t) {
  for (const r of RATCHETS) {
    const end = r.to + 0.5 * B;
    if (t < r.from || t >= end) continue;
    const fade = t < r.from + 0.5 * B ? cubicOut((t - r.from) / (0.5 * B)) : t >= r.to ? 1 - cubicInOut((t - r.to) / (0.5 * B)) : 1;
    const docks = r.docks.filter((d) => !d.reach);
    let k = 0;
    for (let i = 0; i < docks.length; i++) if (t >= docks[i].t - C.dockMove * B) k = i;
    const u = expOut(clamp((t - (docks[k].t - C.dockMove * B)) / (C.dockMove * B)));
    const hRow = lerp((docks[k - 1] ?? docks[0]).h, docks[k].h, u) * K;
    const y = TOP + SH.headsOf(content, L)[r.head].h;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = rgba(PAL.ground, 0.34); ctx.fillRect(SX, y + hRow, SW, H - y - hRow);
    ctx.fillStyle = PAL.accent; ctx.fillRect(SX + 8, y + 6, 6, hRow - 12);
    ctx.restore();
  }
}
// the slot on a pinned chapter tab: the row docked now, rolling vertically with each step
function slot(ctx, head, ty, t) {
  const r = RATCHETS.find((x) => x.head === head);
  if (!r || t < r.from || !SLOT[head]) return;
  let k = 0;
  for (let i = 0; i < r.docks.length; i++) if (t >= r.docks[i].t - C.dockMove * B) k = i;
  const d = r.docks[k], dur = d.reach ? (r.docks[k].t - (r.docks[k - 1]?.t ?? 0)) : C.dockMove * B;
  const u = expOut(clamp((t - (d.t - Math.min(dur, B))) / Math.min(dur, B)));
  const x = SX + SLOT[head].x, base = ty + SLOT[head].base, f = F(49, 600), hd = SH.headsOf(content, SH.layout(content, {}))[head];
  ctx.save();
  ctx.beginPath(); ctx.rect(x - 4, ty + 2, SW - (x - SX), hd.h - 4); ctx.clip();
  text(ctx, '·', x, base, F(49, 500), { color: PAL.muted });
  const nx = x + measure(ctx, '· ', F(49, 500)).width;
  if (k > 0) text(ctx, r.docks[k - 1].name, nx, base - u * f.size * 1.3, f, { color: PAL.ink });
  text(ctx, d.name, nx, base + (1 - u) * f.size * 1.3, f, { color: PAL.ink });
  ctx.restore();
}

function sheet(ctx, off, t, L, clipBottom) {
  ctx.save();
  ctx.beginPath(); ctx.rect(SX, TOP, SW, Math.max(0, Math.min(H, clipBottom) - TOP)); ctx.clip();
  for (const p of L.pieces) {
    const y = sy(p.y, off);
    if (y > H || y + p.h < TOP) continue;
    if (p.kind === 'strip') { const a = A[p.id]; ctx.drawImage(IMG[p.id], 0, p.f0, a.size[0], p.f1 - p.f0, SX, y, SW, p.h); }
    else if (p.kind === 'band') band(ctx, p.id, y, p.size, t);
    else if (p.kind === 'panel') panel(ctx, y, p.h, p.full, UNFOLDS.find((u) => u.i === p.scene), t);
  }
  for (const m of MARKS) underline(ctx, m, off, L, t);
  ratchet(ctx, L, t);
  const heads = SH.headsOf(content, L);
  for (const { i, y } of tabsAt(off, heads, TOP)) {
    const hd = content.heads[i], a = A[hd.asset], y0 = Math.max(0, hd.box[1] - 6), fh = Math.min(a.size[1] - y0, hd.box[3] + 14);
    ctx.drawImage(IMG[hd.asset], 0, y0, a.size[0], fh, SX, y, SW, fh * K);
    ctx.fillStyle = PAL.hair; ctx.fillRect(SX, y + heads[i].h, SW, 2);
    slot(ctx, i, y, t);
  }
  ctx.restore();
}

// the minimap (variant 'on'): the whole sheet in the right gutter; the frame's place on it bracketed in the accent
function minimap(ctx, off, t, L) {
  const at = OPEN.p.miniAt;
  if (!MINI || at == null || t < OPEN.start + at) return;
  const reveal = cubicInOut(clamp((t - OPEN.start - at) / (C.mini * B)));
  const X = SH.MINI.x, Y = SH.MINI.top, hTot = L.length * MS;
  ctx.save();
  ctx.beginPath(); ctx.rect(X - 8, Y - 8, SH.MINI.w + 16, (hTot + 16) * reveal); ctx.clip();
  for (const p of L.pieces) {
    const y = Y + p.y * MS, h = p.h * MS;
    if (p.kind === 'strip') { const a = A[p.id], mh = a.size[1] * K * MS; ctx.drawImage(MIMG[p.id], 0, (p.f0 / a.size[1]) * mh, SH.MINI.w, ((p.f1 - p.f0) / a.size[1]) * mh, X, y, SH.MINI.w, h); }
    else if (p.kind === 'band') {
      ctx.fillStyle = PAL.stock; ctx.fillRect(X, y, SH.MINI.w, h);
      const e = (BANDS[p.id] || []).filter((x) => t >= (x.kind === 'name' ? x.nameAt : x.lines[0]?.[0]?.t ?? Infinity) && t < x.exitAt).at(-1);
      ctx.fillStyle = PAL.ink;
      if (e?.kind === 'quote') e.lines.forEach((line, li) => { const n = line.filter((ph) => t >= ph.t).length; if (n) ctx.fillRect(X + 10, y + h * (li ? 0.72 : 0.38) - 2, (SH.MINI.w - 20) * Math.min(1, 0.22 * n + 0.2), 4); });
      if (e?.kind === 'name') { ctx.fillRect(X + 10, y + h * 0.5 - 3, (SH.MINI.w - 20) * 0.6, 6); if (t >= e.urlAt) ctx.fillRect(X + 10, y + h * 0.78 - 2, (SH.MINI.w - 20) * 0.4, 4); }
    } else if (p.kind === 'panel' && h > 0.5) {
      const u = UNFOLDS.find((x) => x.i === p.scene);
      ctx.fillStyle = PAL.panel; ctx.fillRect(X, y, SH.MINI.w, h);
      const fw = SH.PANEL.fw * MS, fh = (p.full - SH.PANEL.cap - SH.PANEL.pad) * MS;
      ctx.save(); ctx.beginPath(); ctx.rect(X, y, SH.MINI.w, h); ctx.clip();
      ctx.drawImage(FRAMES[u.s.frames][frameIndex(u, t)], X + (SH.MINI.w - fw) / 2, y + SH.PANEL.cap * MS, fw, fh); ctx.restore();
    }
  }
  const vy0 = Y + off * MS, vy1 = Y + (off + (H - TOP)) * MS;
  ctx.fillStyle = rgba(PAL.ground, 0.5);
  ctx.fillRect(X, Y, SH.MINI.w, Math.max(0, vy0 - Y));
  ctx.fillRect(X, vy1, SH.MINI.w, Math.max(0, Y + hTot - vy1));
  ctx.restore();
  if (reveal > 0.5) {
    ctx.save(); ctx.globalAlpha = Math.min(1, (reveal - 0.5) * 2); ctx.strokeStyle = PAL.accent; ctx.lineWidth = 3;
    const y0 = Math.max(Y - 4, vy0), y1 = Math.min(Y + hTot + 4, vy1);
    if (y1 > y0) { ctx.beginPath(); ctx.roundRect(X - 6, y0, SH.MINI.w + 12, y1 - y0, 4); ctx.stroke(); }
    ctx.restore();
  }
}

// ground grain (the ground only: captures are never textured)
let GRAIN = null;
const grain = () => {
  if (GRAIN) return GRAIN;
  const c = new OffscreenCanvas(256, 256), g = c.getContext('2d'), d = g.createImageData(256, 256), r = mulberry32((content.seed ?? 1) * 7 + 4);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 34; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  return (GRAIN = c);
};

function paint(ctx, t) {
  const off = offsetAt(t), L = SH.layout(content, opensAt(t)), roll = rollAt(t, L);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAL.ground; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.035; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grain(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  const clipBottom = roll == null ? H : roll - R_ROLL * 0.2;
  sheet(ctx, off, t, L, clipBottom);
  // a page flying past steps back: a uniform veil that follows the scroll speed, so a streak of light pages and a dark
  // panel never strobes (the flash gate); it lifts as the page brakes
  const v = Math.abs(off - offsetAt(t - 1 / FPS));
  const veil = 0.55 * clamp((v - 40) / 220) ** 1.5;
  if (veil > 0.002) { ctx.fillStyle = rgba(PAL.ground, veil); ctx.fillRect(SX, TOP, SW, Math.min(H, clipBottom) - TOP); }
  if (roll != null && roll - R_ROLL < H) drawRoll(ctx, roll, { x: SX, w: SW, R: R_ROLL, overhang: 22, colors: PAL });
  minimap(ctx, off, t, L);
}

// the fastest screen speed (px per frame) of what moves: the offset, an opening panel, the roll
const speedAt = (t) => {
  const t1 = t - 1 / FPS;
  let s = Math.abs(offsetAt(t) - offsetAt(t1));
  for (const u of UNFOLDS) s = Math.max(s, Math.abs((opensAt(t)[u.i] ?? 0) - (opensAt(t1)[u.i] ?? 0)) * SH.panelH(content, u.s));
  const L = SH.layout(content, opensAt(t)), r = rollAt(t, L), r1 = rollAt(t1, L);
  if (r != null && r1 != null) s = Math.max(s, Math.abs(r - r1));
  return s;
};

export const render = (ctx, t) => {
  const v = speedAt(t);
  // fast scrolls get a long shutter (up to 2.5 frames above 200 px a frame): a page flying past is one streak
  const o = v > 200 ? { shutter: 2.5, step: 14, maxN: 64 } : v > 60 ? { shutter: 1, step: 10, maxN: 48 } : { shutter: 0.5 };
  subframes(ctx, paint, t, { speed: v, fps: FPS, ...o });
};
export { words };

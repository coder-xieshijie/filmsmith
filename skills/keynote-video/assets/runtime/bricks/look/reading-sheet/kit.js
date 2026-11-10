// kit.js — what the scroll bricks share (sheet-open, quote-detent, row-ratchet, row-unfold, roll-lockup, quote-band,
// sheet-minimap): the sheet (real capture strips at one scale, quote bands and the unfold panel stacked top to bottom,
// a splice shown as a gap of the ground), its offsets, the pinned chapter tabs (runtime section-lock tabsAt), the
// underline under a line of the capture, a band's phrases rising into their line boxes, the minimap, the paper roll
// (runtime roll drawRoll), the scroll curves (runtime scroll-reel momentum and fling). Pure functions of their
// arguments, except loadSheet (it decodes the capture once in prepare).
// From the scroll template (assets/templates/scroll/film.js and the example film the source film
// PIECES, layout, imgToSheet, offsets, slotLine, phraseLine, band, underline, sheet, ratchet, slot, minimap): the
// geometry and timings are the template's.
//
// A sheet spec (all positions in image px of the capture): { src (URL of the capture; none: a placeholder README drawn
// in code), x0, w (the x range every strip shares), pieces: [{ id, kind: 'img', y0, y1 } | { id, kind: 'gap', h } |
// { id, kind: 'band', h, size, weight, lines: [[text, …], …] (what it holds when no scene animates it) } |
// { id, kind: 'panel', h }], heads: [{ iy0, iy1, label }], marks: { name: [[x, y, w, h], …] }, rows: [{ iy, ih,
// label }] }. Film px per image px K = SW / w.
import { clamp, text, measure, canvasOf, rgba } from '../../../handoffs/util.js';
import { momentum, fling } from '../../../handoffs/scroll-reel.js';
import { tabsAt } from '../../../handoffs/section-lock.js';
import { drawRoll } from '../../../handoffs/roll.js';
import { expOut, cubicOut, cubicInOut } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { fontStack, graphemes } from '../../lang.js';
import LOOK from './look.js';

export const W = 1920, H = 1080, SX = 120, SW = 1496, TOP = 54, OFF0 = -16, R_ROLL = 30;
export const MX = 1664, MW = 160, MT = 120, MS = MW / SW;
export const PANEL = { h: 792, cap: 88, fw: 1216, fh: 684 };
export { momentum, fling, tabsAt, expOut, cubicOut, cubicInOut, clamp };
export const secs = (beats, bpm = 120) => (beats * 60) / bpm;
export const pIn = (b, [a, z]) => clamp((b - a) / (z - a));
export const lerp = (a, b, u) => a + (b - a) * u;
export const F = (role, lang, size, weight = 600) => ({ family: fontStack(LOOK, role, lang), weight, size });

// ---- the placeholder README (image px, 1870 wide, 2× like a capture): the samples' page when no capture is given
const PH = {
  en: { owner: 'acme / tidewell', tabs: 'Code    Issues    Pull requests    Actions', title: 'tidewell', tagline: 'Incremental renders for big scenes.', intro: ['tidewell rebuilds only what an edit touches,', 'with every frame cached on disk', 'and every job resumable.'], h2: ['Benchmarks', 'Install', 'Measured'], rows: [['city-4k', '0.6 s'], ['forest', '0.9 s'], ['harbour', '1.1 s'], ['canyon', '1.4 s'], ['atrium', '0.8 s'], ['tunnel', '0.7 s']], install: 'npm i -D tidewell', measured: ['Measured: p50 rebuild time on a warm cache,', 'five runs, the median reported.'] },
  zh: { owner: 'acme / tidewell', tabs: '代码    议题    合并请求    构建', title: 'tidewell', tagline: '大场景的增量渲染。', intro: ['tidewell 只重建改动碰到的部分，', '每一帧都缓存在磁盘上，', '每个任务都能续跑。'], h2: ['基准测试', '安装', '测量方法'], rows: [['city-4k', '0.6 秒'], ['forest', '0.9 秒'], ['harbour', '1.1 秒'], ['canyon', '1.4 秒'], ['atrium', '0.8 秒'], ['tunnel', '0.7 秒']], install: 'npm i -D tidewell', measured: ['测量：缓存预热后的重建时间中位数，', '跑五次取中位数。'] },
};
export const placeholder = (lang = 'en') => {
  const T = PH[lang === 'zh' ? 'zh' : 'en'], Wd = 1870, sans = { family: fontStack(LOOK, 'text', lang) }, mono = { family: fontStack(LOOK, 'mono', lang) };
  const ink = rgba('#000000', 0.86), soft = rgba('#000000', 0.56), rule = rgba('#000000', 0.12);
  const lines = [], marks = {}, heads = [], rows = [];
  let y = 0;
  const ops = [];
  ops.push((g) => { g.fillStyle = rgba('#000000', 0.035); g.fillRect(0, 0, Wd, 220); text(g, T.owner, 80, 96, { ...sans, weight: 600, size: 40 }, { color: ink }); text(g, T.tabs, 80, 182, { ...sans, weight: 500, size: 28 }, { color: soft }); g.fillStyle = rule; g.fillRect(0, 218, Wd, 2); });
  y = 300;
  heads.push({ iy0: y - 70, iy1: y + 34, label: T.title });
  ops.push(((yy) => (g) => { text(g, T.title, 80, yy, { ...sans, weight: 700, size: 76 }, { color: ink }); g.fillStyle = rule; g.fillRect(80, yy + 28, Wd - 160, 2); })(y));
  y = 420;
  const tw = (s, f) => measure(canvasOf(8, 8).getContext('2d'), s, f).width;
  marks.tagline = [[80, y - 34, tw(T.tagline, { ...sans, weight: 500, size: 40 }), 44]];
  ops.push(((yy) => (g) => text(g, T.tagline, 80, yy, { ...sans, weight: 500, size: 40 }, { color: ink }))(y));
  y = 540;
  marks.intro = [];
  T.intro.forEach((l, k) => { const yy = y + k * 56; marks.intro.push([80, yy - 30, tw(l, { ...sans, weight: 400, size: 34 }), 40]); ops.push((g) => text(g, l, 80, yy, { ...sans, weight: 400, size: 34 }, { color: ink })); });
  const cut1 = y + 3 * 56;
  y = cut1 + 120;
  heads.push({ iy0: y - 62, iy1: y + 30, label: T.h2[0] });
  ops.push(((yy) => (g) => { text(g, T.h2[0], 80, yy, { ...sans, weight: 700, size: 58 }, { color: ink }); g.fillStyle = rule; g.fillRect(80, yy + 24, Wd - 160, 2); })(y));
  y += 70;
  T.rows.forEach(([a, b], k) => {
    const top = y + k * 100;
    rows.push({ iy: top, ih: 100, label: a });
    ops.push((g) => { g.fillStyle = k % 2 ? rgba('#000000', 0.03) : '#ffffff'; g.fillRect(80, top, Wd - 160, 100); g.fillStyle = rule; g.fillRect(80, top + 99, Wd - 160, 2); text(g, a, 112, top + 62, { ...mono, weight: 500, size: 34 }, { color: ink }); text(g, b, 900, top + 62, { ...sans, weight: 500, size: 34 }, { color: soft }); g.fillStyle = rgba('#000000', 0.08 + 0.05 * (k % 3)); g.fillRect(1300, top + 18, 420, 64); });
  });
  const tableEnd = y + T.rows.length * 100;
  y = tableEnd + 160;
  heads.push({ iy0: y - 62, iy1: y + 30, label: T.h2[1] });
  ops.push(((yy) => (g) => { text(g, T.h2[1], 80, yy, { ...sans, weight: 700, size: 58 }, { color: ink }); g.fillStyle = rgba('#000000', 0.05); g.fillRect(80, yy + 60, Wd - 160, 120); text(g, T.install, 120, yy + 132, { ...mono, weight: 500, size: 34 }, { color: ink }); })(y));
  y += 380;
  heads.push({ iy0: y - 62, iy1: y + 30, label: T.h2[2] });
  ops.push(((yy) => (g) => text(g, T.h2[2], 80, yy, { ...sans, weight: 700, size: 58 }, { color: ink }))(y));
  marks.measured = [];
  T.measured.forEach((l, k) => { const yy = y + 110 + k * 56; marks.measured.push([80, yy - 30, tw(l, { ...sans, weight: 400, size: 34 }), 40]); ops.push((g) => text(g, l, 80, yy, { ...sans, weight: 400, size: 34 }, { color: ink })); });
  const end = y + 110 + T.measured.length * 56 + 220;
  marks.title = [[80, heads[0].iy0 + 10, tw(T.title, { ...sans, weight: 700, size: 76 }), 80]];
  const c = canvasOf(Wd, end), g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, Wd, end);
  for (const op of ops) op(g);
  const rowEnd = rows[1].iy + rows[1].ih;
  return {
    canvas: c,
    spec: {
      x0: 0, w: Wd, heads, marks, rows,
      pieces: [
        { id: 'M', kind: 'img', y0: 0, y1: 222 }, { id: 'cut', kind: 'gap', h: 32 }, { id: 'C1', kind: 'img', y0: 222, y1: 470 },
        { id: 'Q1', kind: 'band', h: 320, size: 96, weight: 700, lines: [] }, { id: 'C2', kind: 'img', y0: 470, y1: cut1 + 20 },
        { id: 'Q2', kind: 'band', h: 250, size: 69, weight: 600, lines: [] }, { id: 'C3', kind: 'img', y0: cut1 + 20, y1: rowEnd },
        { id: 'PANEL', kind: 'panel', h: PANEL.h }, { id: 'C4', kind: 'img', y0: rowEnd, y1: end },
        { id: 'Q4', kind: 'band', h: 250, size: 69, weight: 600, lines: [] },
      ],
    },
  };
};

// the sheet: the capture (or the placeholder) and its geometry
export const loadSheet = async (spec, lang) => {
  let img, S = spec;
  if (spec?.src) { img = new Image(); img.src = spec.src; await img.decode(); }
  else { const ph = placeholder(lang); img = ph.canvas; S = { ...ph.spec, ...(spec || {}), pieces: spec?.pieces || ph.spec.pieces, heads: spec?.heads || ph.spec.heads, marks: { ...ph.spec.marks, ...(spec?.marks || {}) }, rows: spec?.rows || ph.spec.rows }; }
  const K = SW / S.w;
  const layout = (open = 0, bands = {}) => {
    let y = 0; const L = {};
    for (const p of S.pieces) { const h = p.kind === 'img' ? (p.y1 - p.y0) * K : p.kind === 'panel' ? p.h * open : p.h; L[p.id] = { ...p, ...(bands[p.id] || {}), y, h }; y += h; }
    L.length = y; return L;
  };
  const imgToSheet = (iy, L) => { for (const p of S.pieces) if (p.kind === 'img' && iy >= p.y0 - 1e-6 && iy <= p.y1 + 1e-6) return L[p.id].y + (iy - p.y0) * K; return L.length; };
  const heads = (L) => S.heads.map((h) => ({ y: imgToSheet(h.iy0, L), h: (h.iy1 - h.iy0) * K, iy0: h.iy0, iy1: h.iy1, label: h.label }));
  return { img, S, K, layout, imgToSheet, heads, x: (ix) => SX + (ix - S.x0) * K };
};
// an offset target: a number (film px), 'top', { piece, under } (the piece's top under pinned head `under`),
// { head } (the head pinned where it stands), { row, head } (row k docked under head h), { bandFoot, at } (a band's
// foot at screen y `at`); checked in that order: bandFoot, row, piece, head
export const offsetOf = (G, L, tg) => {
  if (tg == null || tg === 'top') return OFF0;
  if (typeof tg === 'number') return tg;
  const hs = G.heads(L);
  if (tg.bandFoot) return L[tg.bandFoot].y + L[tg.bandFoot].h - ((tg.at ?? 1000) - TOP);
  if (tg.row != null) return G.imgToSheet(G.S.rows[tg.row].iy, L) - hs[tg.head ?? 1].h;
  if (tg.piece) return L[tg.piece].y - (tg.under != null ? hs[tg.under].h + 4 : 0);
  if (tg.head != null) return hs[tg.head].y;
  return OFF0;
};
export const sy = (y, off) => TOP + y - off;

// a band line's phrase: rises into its own clip box (expo out, half a beat) and may rise out (ease in, 0.35 beat)
export const slotLine = (ctx, s, x, base, f, color, b, enterAt, exitAt = Infinity) => {
  if (b < enterAt) return;
  const u = expOut(clamp((b - enterAt) / 0.5)), v = b >= exitAt ? clamp((b - exitAt) / 0.35) ** 2 : 0;
  if (v >= 1) return;
  const dy = (1 - u) * f.size * 0.62 - v * f.size * 1.15;
  ctx.save(); ctx.beginPath(); ctx.rect(SX, base - f.size * 1.0, SW, f.size * 1.32); ctx.clip();
  text(ctx, s, x, base + dy, f, { color }); ctx.restore();
};
// a band: lines of phrases [{ text, at }] (beats), or static strings; baselines by its size
export const baselines = (h, size) => (size >= 96 ? [132, 244] : size >= 69 ? [104, 190] : [h * 0.4, h * 0.75]);
export const drawBand = (ctx, y, h, piece, C, lang, b, anim) => {
  ctx.fillStyle = C.paper; ctx.fillRect(SX, y, SW, h);
  const x = SX + 96, f = F('display', lang, piece.size || 69, piece.weight || 600), bl = baselines(h, f.size);
  const line = (ln, k, enter, exitAt) => { let px = x; for (const ph of ln) { const s = typeof ph === 'string' ? ph : ph.text; slotLine(ctx, s, px, y + bl[k], f, C.onPaper, b, typeof ph === 'string' ? enter : ph.at, exitAt); px += measure(ctx, s + (lang === 'zh' ? '' : ' '), f).width; } };
  if (anim?.custom) return anim.custom(ctx, y, h, x, b);
  (piece.lines || []).forEach((ln, k) => line(ln, k, -1e9, anim?.replaceAt ?? Infinity));
  (anim?.lines || []).forEach((ln, k) => line(ln, k, 0, anim.exitAt ?? Infinity));
};
// the accent underline under a mark (image px rects), drawn left to right over `draw` (0..1)
export const underline = (ctx, G, rects, off, L, draw, C) => {
  if (!rects || draw <= 0) return;
  const total = rects.reduce((s, r) => s + r[2], 0); let left = draw * total;
  ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const r of rects) { if (left <= 0) break; const w = Math.min(r[2], left); left -= w; const yy = sy(G.imgToSheet(r[1] + r[3] + 6, L), off); ctx.beginPath(); ctx.moveTo(G.x(r[0]), yy); ctx.lineTo(G.x(r[0] + w), yy); ctx.stroke(); }
  ctx.restore();
};
export const drawOf = (b, on, offSpan) => (b < on[0] ? 0 : b < on[1] ? cubicOut(pIn(b, on)) : offSpan && b >= offSpan[0] ? 1 - cubicInOut(pIn(b, offSpan)) : 1);
// the sheet at an offset: strips, bands (anim: { [id]: band anim }), the panel (painter), marks, the pinned tabs
export const drawSheet = (ctx, G, off, b, C, lang, { open = 0, clipBottom = H, anims = {}, panel = null, after = null, slot = null } = {}) => {
  const L = G.layout(open);
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.rect(SX, TOP, SW, Math.max(0, Math.min(H, clipBottom) - TOP)); ctx.clip();
  for (const p of G.S.pieces) {
    const P = L[p.id], y = sy(P.y, off);
    if (y > H || y + P.h < TOP) continue;
    if (p.kind === 'img') ctx.drawImage(G.img, G.S.x0, p.y0, G.S.w, p.y1 - p.y0, SX, y, SW, P.h);
    else if (p.kind === 'band') drawBand(ctx, y, P.h, p, C, lang, b, anims[p.id]);
    else if (p.kind === 'panel' && P.h > 0.5 && panel) { ctx.save(); ctx.beginPath(); ctx.rect(SX, y, SW, P.h); ctx.clip(); panel(ctx, y, P.h); ctx.restore(); }
  }
  if (after) after(ctx, L);
  const hs = G.heads(L);
  for (const { i, y } of tabsAt(off, hs, TOP)) {
    ctx.drawImage(G.img, G.S.x0, hs[i].iy0, G.S.w, hs[i].iy1 - hs[i].iy0, SX, y, SW, hs[i].h);
    ctx.fillStyle = C.line; ctx.fillRect(SX, y + hs[i].h, SW, 2);
    if (slot) slot(ctx, i, y, hs[i]);
  }
  ctx.restore();
  return L;
};
// the minimap: the whole sheet at 0.107 in the right gutter, the rest veiled 50 %, the frame bracketed in the accent;
// `reveal` prints it top to bottom
export const minimap = (ctx, G, off, C, { open = 0, reveal = 1, bandsOn = {}, panel = null } = {}) => {
  if (reveal <= 0) return;
  const L = G.layout(open), hTot = L.length * MS;
  ctx.save(); ctx.beginPath(); ctx.rect(MX - 8, MT - 8, MW + 16, (hTot + 16) * reveal); ctx.clip();
  for (const p of G.S.pieces) {
    const P = L[p.id], y = MT + P.y * MS, h = P.h * MS;
    if (p.kind === 'img') ctx.drawImage(G.img, G.S.x0, p.y0, G.S.w, p.y1 - p.y0, MX, y, MW, h);
    else if (p.kind === 'band') { ctx.fillStyle = C.paper; ctx.fillRect(MX, y, MW, h); ctx.fillStyle = C.onPaper; const on = bandsOn[p.id] ?? (p.lines || []).map((l) => (l.length ? 0.55 : 0)); [0.38, 0.72].forEach((fy, k) => { if (on[k]) ctx.fillRect(MX + 10, y + h * fy - 2, (MW - 20) * on[k], 4); }); }
    else if (p.kind === 'panel' && h > 0.5) { ctx.fillStyle = C.panel; ctx.fillRect(MX, y, MW, h); if (panel) { ctx.save(); ctx.beginPath(); ctx.rect(MX, y, MW, h); ctx.clip(); ctx.translate(MX, y); ctx.scale(MS, MS); ctx.translate(-SX, 0); panel(ctx, 0, P.h); ctx.restore(); } }
  }
  const vy0 = MT + off * MS, vy1 = MT + (off + (H - TOP)) * MS;
  ctx.fillStyle = rgba(C.ground, 0.5); ctx.fillRect(MX, MT, MW, Math.max(0, vy0 - MT)); ctx.fillRect(MX, vy1, MW, Math.max(0, MT + hTot - vy1));
  ctx.restore();
  if (reveal > 0.5) {
    ctx.save(); ctx.globalAlpha = clamp((reveal - 0.5) * 2); ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
    const y0 = Math.max(MT - 4, vy0), y1 = Math.min(MT + hTot + 4, vy1);
    if (y1 > y0) { ctx.beginPath(); ctx.roundRect(MX - 6, y0, MW + 12, y1 - y0, 4); ctx.stroke(); }
    ctx.restore();
  }
};
// the roll (runtime roll.drawRoll) with the look's roll colours
export const roll = (ctx, y, C) => drawRoll(ctx, y, { x: SX, w: SW, R: R_ROLL, overhang: 22, colors: { rollHi: C.rollHi, roll: C.roll, rollShade: C.rollShade, rollEdge: C.rollEdge } });
export const ROLL_TOP = TOP - OFF0 + R_ROLL * 0.2, ROLL_OUT = H + R_ROLL + 40;
// seeded grain on the ground only (captures are never textured): drawn before the sheet
export const grain = (ctx, seed, C, amount = LOOK.texture.grain) => {
  ctx.save(); ctx.globalAlpha = amount;
  for (let i = 0; i < 900; i++) { ctx.fillStyle = hash(i + 3, seed) > 0.5 ? '#ffffff' : '#000000'; ctx.fillRect(hash(i, seed) * W, hash(i + 7, seed) * H, 2, 2); }
  ctx.restore();
};
// placeholder frames for an unfold (the samples): a paper field with an ink dot that drops and grows, frame i of n
export const placeholderFrame = (ctx, x, y, w, h, i, n, C) => {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
  const p = i / Math.max(1, n - 1), cy = y + h * (0.2 + 0.4 * Math.min(1, p * 3)), r = 18 + Math.max(0, p - 0.33) * 0.5 * h;
  ctx.fillStyle = C.onPaper; ctx.beginPath(); ctx.arc(x + w / 2, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
export { graphemes };

// strip.js — film as material (strip-advance, gate-punch, sheet-pick): a strip of film (black base, sprocket holes,
// frames, a variable-area optical track) drawn at any scale, a contact sheet of such strips, a frame punched out of
// either, and the grease pencil. Pure painters: everything is a function of its arguments; nothing is kept between
// frames.
//
// Units: a strip is drawn at scale k from one geometry in strip px (k = 1 in the gate, 96 / 832 on the contact
// sheet). A cell is one frame plus its share of the frame line: PITCH wide; its frame sits FRAME_X in, FRAME_Y down.
import { rrect, text, clamp, lerp } from './util.js';
import { coverView, paintView } from './stage.js';

export const S = {
  PITCH: 860, FW: 832, FH: 468, FRAME_X: 14, FRAME_Y: 96, H: 660,
  PERF: { w: 34, h: 48, r: 7, pitch: 86, off: 43, y1: 16, y2: 596 },
  TRACK: { y: 577, h: 16 },
};
export const frameW = (k) => S.FW * k;

// the frame rect of cell i when cell `s` (fractional) is centred at screen x `cx`
export const cellFrame = (i, s, cx, top, k) => ({ x: cx - (S.FW * k) / 2 + (i - s) * S.PITCH * k, y: top + S.FRAME_Y * k, w: S.FW * k, h: S.FH * k });

const mixHex = (a, b, u) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`;
};

// draw an image crop into a rect (the crop's aspect is the rect's; never stretched)
export function drawCrop(ctx, img, crop, r) {
  if (!img) return;
  const [sx, sy, sw, sh] = crop ?? [0, 0, img.width, img.height];
  ctx.drawImage(img, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
}

// one cell's picture into its frame rect: `image` { img, crop } (crop of the frame's aspect, drawn as is), `asset`
// { asset: { image, crop } (assetOf), focus } (covered to the frame), else a title card { text, size }
export function paintCell(ctx, P, cell, r, k, F) {
  if (!cell) return;
  if (cell.kind === 'image') drawCrop(ctx, cell.img, cell.crop, r);
  else if (cell.kind === 'asset') paintView(ctx, cell.asset, coverView(cell.asset, r, cell.focus), r);
  else {
    ctx.fillStyle = P.title; ctx.fillRect(r.x, r.y, r.w, r.h);
    if (cell.kind === 'title' && cell.text) {
      const size = (cell.size ?? 79) * k;
      text(ctx, cell.text, r.x + r.w / 2, r.y + r.h / 2 + 0.36 * size, { ...F.title, size }, { color: P.titleInk, align: 'center' });
    }
  }
}

// the strip: cells[i] for i in [0, cells.length); cell `s` centred at x = cx; strip top at `top`; scale k.
//   veil(d)   darkness 0..1 laid over a frame d cells from the gate (the frames outside the gate step back)
//   track     { lit: 0..1, sweep: screen x up to which the track is lit (Infinity: all) }
//   start/end the strip's own ends in cells (default the cells' range); a cut end is a straight edge
export function paintStrip(ctx, P, F, { cells, s, cx = 960, top, k = 1, veil = () => 0, track = null, start = 0, end = cells.length, clipX = null }) {
  const pitch = S.PITCH * k;
  const left = cx - (S.FW * k) / 2 - S.FRAME_X * k + (start - s) * pitch;
  const right = cx - (S.FW * k) / 2 - S.FRAME_X * k + (end - s) * pitch;
  const x0 = Math.max(left, -pitch), x1 = Math.min(right, clipX ?? 1920 + pitch);
  if (x1 <= x0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, top - 1, x1 - x0, S.H * k + 2); ctx.clip();
  ctx.fillStyle = P.base; ctx.fillRect(x0, top, x1 - x0, S.H * k);
  const i0 = Math.max(start, Math.floor(s + (x0 - cx) / pitch) - 1), i1 = Math.min(end - 1, Math.ceil(s + (x1 - cx) / pitch) + 1);
  // sprocket holes: the light box shows through
  ctx.fillStyle = P.hole ?? P.ground;
  const pw = S.PERF.w * k, ph = S.PERF.h * k, pr = S.PERF.r * k;
  for (let i = i0; i <= i1; i++) {
    const cl = cx - (S.FW * k) / 2 - S.FRAME_X * k + (i - s) * pitch;
    for (let j = 0; j < 10; j++) {
      const hx = cl + (S.PERF.off + j * S.PERF.pitch) * k - pw / 2;
      if (hx + pw < x0 || hx > x1) continue;
      for (const yy of [S.PERF.y1, S.PERF.y2]) { rrect(ctx, hx, top + yy * k, pw, ph, pr); ctx.fill(); }
    }
  }
  // frames, their veil and their track
  for (let i = i0; i <= i1; i++) {
    const r = cellFrame(i, s, cx, top, k);
    if (r.x > x1 || r.x + r.w < x0) continue;
    paintCell(ctx, P, cells[i], r, k, F);
    const v = veil((r.x + r.w / 2 - cx) / pitch, i);
    if (v > 0.001) { ctx.fillStyle = `rgba(0,0,0,${v.toFixed(4)})`; ctx.fillRect(r.x, r.y, r.w, r.h); }
    const env = cells[i]?.env;
    if (track && env && k > 0.5) paintTrack(ctx, P, env, r.x, top + S.TRACK.y * k, r.w, S.TRACK.h * k, track);
  }
  ctx.restore();
}

// variable-area optical track: a clear band, symmetric about its centre line, as wide as the sound is loud
export function paintTrack(ctx, P, env, x, y, w, h, { lit = 0, sweep = Infinity }) {
  const n = env.length, cy = y + h / 2;
  const dark = P.trackDim, light = P.trackLit;
  const pts = env.map((a, i) => [x + ((i + 0.5) / n) * w, Math.max(0.6, Math.min(1, a / 0.3) * (h / 2))]);   // RMS 0.3 fills the band
  const shape = () => {
    ctx.beginPath(); ctx.moveTo(x, cy);
    for (const [px, a] of pts) ctx.lineTo(px, cy - a);
    ctx.lineTo(x + w, cy);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], cy + pts[i][1]);
    ctx.closePath();
  };
  ctx.save(); ctx.fillStyle = dark; shape(); ctx.fill();
  if (lit > 0 && sweep > x) {
    ctx.beginPath(); ctx.rect(x, y - 1, Math.min(w, sweep - x), h + 2); ctx.clip();
    ctx.fillStyle = mixHex(dark, light, clamp(lit)); shape(); ctx.fill();
  }
  ctx.restore();
}

// ---- the contact sheet: one strip per film at scale k, cut at the film's length
// rows[r] = { name, dur, cells: [{ kind: 'image', img, crop }] (one per 4 s block), y (strip top) }
// st = { len: [visible seconds per row], veil: [0..1 per row], labels: 0..1, durs: [0..1 per row] }
export const SHEET = { x0: 432, top: 56, pitch: 84, k: 96 / 832, secPerCell: 4 };
export const rowTop = (r) => SHEET.top + r * SHEET.pitch;
export const sheetCell = (r, i) => cellFrame(i, 0, SHEET.x0 + (S.FW * SHEET.k) / 2, rowTop(r), SHEET.k);
export const rowEndX = (secs) => SHEET.x0 - S.FRAME_X * SHEET.k + (secs / SHEET.secPerCell) * S.PITCH * SHEET.k;

export function paintSheet(ctx, P, F, rows, st) {
  const k = SHEET.k, cx = SHEET.x0 + (S.FW * k) / 2;
  rows.forEach((row, r) => {
    const top = rowTop(r), len = st.len?.[r] ?? row.dur;
    paintStrip(ctx, P, F, { cells: row.cells, s: 0, cx, top, k, start: 0, end: row.cells.length, clipX: rowEndX(len) });
    const v = st.veil?.[r] ?? 0;
    const yMid = top + (S.H * k) / 2;
    if (st.labels > 0) text(ctx, row.name, SHEET.x0 - 34, yMid + 12, { ...F.label }, { color: P.ink, align: 'right', alpha: st.labels });
    const d = st.durs?.[r] ?? 0;
    if (d > 0) text(ctx, `${row.seconds} s`, rowEndX(row.dur) + 26, yMid + 12, { ...F.mono, size: 33 }, { color: P.muted, alpha: d });
    if (v > 0.001) {
      ctx.save(); ctx.globalAlpha = v; ctx.fillStyle = P.ground;
      ctx.fillRect(0, top - 2, 1920, S.H * k + 4); ctx.restore();
    }
  });
}

// ---- the punch: a frame grown from (or shrunk into) a rect, about the point the two rects share (a log-scale zoom)
export function zoomRect(A, B, u) {
  const s = B.w / A.w;
  if (Math.abs(s - 1) < 1e-9) return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), w: A.w, h: A.h };
  const fx = (B.x - s * A.x) / (1 - s), fy = (B.y - s * A.y) / (1 - s), su = Math.pow(s, u);
  return { x: fx + su * (A.x - fx), y: fy + su * (A.y - fy), w: A.w * su, h: A.h * su };
}
export const FULL = { x: 0, y: 0, w: 1920, h: 1080 };

// ---- the grease pencil (china marker): a hand loop round a cell, an underline; drawn on by arc length
const loopPts = (box, seed = 3) => {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, rx = box.w / 2 + 30, ry = box.h / 2 + 24;
  const ph1 = seed * 1.7, ph2 = seed * 2.9, n = 160, a0 = -2.55, sweep = Math.PI * 2 * 1.1;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = a0 + sweep * u;
    const w = 1 + 0.05 * Math.sin(2 * a + ph1) + 0.03 * Math.sin(3 * a + ph2);
    const drift = lerp(1.05, 0.95, u);                  // a hand spirals in a little: the end crosses the start
    pts.push([cx + Math.cos(a) * rx * w * drift, cy + Math.sin(a) * ry * w * drift + 6 * u]);
  }
  return pts;
};
const underlinePts = (x0, x1, y) => {
  const pts = [], n = 60;
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0 - 10, x1 + 14, u), y + 3 * Math.sin(u * Math.PI * 1.3 + 0.4) - 9 * Math.max(0, u - 0.9) * 10 * (u - 0.9)]); }
  return pts;
};
function strokePart(ctx, pts, u, color, width) {
  if (u <= 0) return;
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  const target = L * clamp(u);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= target) { const f = (target - acc) / seg[i - 1]; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; }
    ctx.lineTo(pts[i][0], pts[i][1]); acc += seg[i - 1];
  }
  ctx.stroke(); ctx.restore();
}
export const pencilLoop = (ctx, P, box, u, { seed = 3, width = 6 } = {}) => strokePart(ctx, loopPts(box, seed), u, P.accent, width);
export const pencilUnderline = (ctx, P, x0, x1, y, u, { width = 6 } = {}) => strokePart(ctx, underlinePts(x0, x1, y), u, P.accent, width);
export const loopBounds = (box) => ({ x: box.x - box.w / 2 - 40, y: box.y - box.h / 2 - 40, w: box.w * 2 + 80, h: box.h * 2 + 80 });

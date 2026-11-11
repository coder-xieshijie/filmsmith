// blocks.js — the stream style's interface pieces drawn on canvas: warm off-white paper blocks (a chat with bubbles, a
// task row, a task list, a check chip, the closing panel, a nudge), glass cards on the night, and their small parts (the
// running ring, the done tick, the document glyph, pills), with the type helpers every stream brick sets text with.
// From the stream template's film.js css() and buildDOM(): the template laid these out as DOM blocks with CSS; here each
// is measured and drawn on canvas with the same boxes (padding, radius, shadow, line heights), so a stream scene is one
// canvas and a frame depends on its time only.
import { typeOf, fontOf, wrap, unitsOf, graphemes } from '../glow-thread/text.js';
import { E, seg } from '../glow-thread/draw.js';

// ---------- type ----------
const MET = new Map();
const probe = () => { const c = document.createElement('canvas'); c.width = c.height = 4; return c.getContext('2d', { willReadFrequently: true }); };
let PX;
// ascent and descent (px) of a face at px: DM Sans, and Noto Sans SC for Chinese inside a line of normal height
export const metricsOf = (px, cjk = false) => {
  const key = px + (cjk ? 'c' : '');
  if (!MET.has(key)) {
    PX = PX || probe();
    PX.font = `400 ${px}px 'DM Sans'`; const a = PX.measureText('Hg');
    let A = a.fontBoundingBoxAscent, D = a.fontBoundingBoxDescent;
    if (cjk) { PX.font = `400 ${px}px 'Noto Sans SC'`; const b = PX.measureText('中'); A = Math.max(A, b.fontBoundingBoxAscent); D = Math.max(D, b.fontBoundingBoxDescent); }
    MET.set(key, { A, D });
  }
  return MET.get(key);
};
const hasCJK = (s) => /[　-〿㐀-鿿＀-￯]/.test(String(s));
// the height of one line box: lh a factor, or 'normal' (the face's own ascent + descent, as CSS line-height: normal)
export const lineH = (px, lh, s = '') => (lh === 'normal' ? (({ A, D }) => A + D)(metricsOf(px, hasCJK(s))) : lh * px);
// the baseline of a line whose box starts at top
export const baseline = (px, lh, top, s = '') => { const n = lh === 'normal'; const { A, D } = metricsOf(px, n && hasCJK(s)); const h = n ? A + D : lh * px; return top + (h - (A + D)) / 2 + A; };
export const setFont = (ctx, TY, px, w = 400, track = TY.track) => { ctx.font = fontOf(TY, px, w); ctx.letterSpacing = `${(track * px).toFixed(3)}px`; };
export const textW = (ctx, TY, s, px, w = 400, track = TY.track) => { ctx.save(); setFont(ctx, TY, px, w, track); const v = ctx.measureText(String(s)).width; ctx.restore(); return v; };
// one line of text whose line box starts at (x, top); align 'left' | 'center' | 'right' about x
export const textAt = (ctx, TY, s, x, top, px, w = 400, color, { lh = 'normal', align = 'left', alpha = 1, track = TY.track } = {}) => {
  if (alpha <= 0.001 || !s) return;
  ctx.save(); setFont(ctx, TY, px, w, track); ctx.fillStyle = color; ctx.globalAlpha *= alpha; ctx.textBaseline = 'alphabetic';
  const width = ctx.measureText(String(s)).width, x0 = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  ctx.fillText(String(s), x0, baseline(px, lh, top, s)); ctx.restore();
};
// the template's measurer (width of the run plus the tracking of every character) for wrap()
export const measurer = (ctx, TY, px, w) => (s) => { ctx.save(); ctx.font = fontOf(TY, px, w); ctx.letterSpacing = '0px'; const v = ctx.measureText(s).width; ctx.restore(); return v + TY.track * px * graphemes(s).length; };
export const linesOf = (ctx, TY, text, px, w, maxW, lang) => wrap(measurer(ctx, TY, px, w), text, maxW, lang);

// A run of text that enters a unit at a time (Chinese a character, Latin a word), with a short blur: the template's
// glyphs(). Built once (positions measured), drawn per frame by runAt.
export const run = (ctx, TY, text, { px, w = 400, maxW = 2000, lang = 'en', lh = TY.lead, align = 'left' }) => {
  const lines = linesOf(ctx, TY, text, px, w, maxW, lang);
  const units = [];
  ctx.save(); setFont(ctx, TY, px, w);
  lines.forEach((ln, k) => {
    const lw = ctx.measureText(ln).width; let pre = '';
    for (const u of unitsOf(ln, lang)) { if (!u.space) units.push({ s: u.s, k, dx: ctx.measureText(pre).width, lw }); pre += u.s; }
  });
  ctx.restore();
  return { lines, units, px, w, lh, align, lineW: lines.map((ln) => textW(ctx, TY, ln, px, w)) };
};
export const runEnd = (R, t0, lang) => t0 + R.units.length * (lang === 'zh' ? 0.04 : 0.07) + 0.24;
// draw a run with its box's left (or centre, align 'center') at x and its top at top; units enter from t0 a STAG apart
// and leave over 0.22 s before t1
export const runAt = (ctx, TY, R, x, top, color, t, t0, t1 = Infinity, lang = 'en', { alpha = 1 } = {}) => {
  if (t < t0) return;
  const out = t1 === Infinity ? 0 : E.in3(seg(t, t1 - 0.22, t1));
  if (out >= 1) return;
  const STAG = lang === 'zh' ? 0.04 : 0.07;
  ctx.save(); setFont(ctx, TY, R.px, R.w); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
  R.units.forEach((u, k) => {
    const k0 = E.out3(seg(t, t0 + k * STAG, t0 + k * STAG + 0.24)), a = k0 * (1 - out) * alpha;
    if (a <= 0.001) return;
    const lx = R.align === 'center' ? x - u.lw / 2 : x;
    ctx.globalAlpha = a; ctx.filter = a < 0.98 ? `blur(${(8 * (1 - k0) + 10 * out).toFixed(1)}px)` : 'none';
    ctx.fillText(u.s, lx + u.dx, baseline(R.px, R.lh, top + u.k * R.lh * R.px));
  });
  ctx.restore();
};

// ---------- shapes ----------
const SH = '0,0,0';
export const shadowOf = (a = 0.42, oy = 18, blur = 50, rgb = SH) => ({ color: `rgba(${rgb},${a})`, oy, blur });
// a filled rounded box; radius a number or [tl, tr, br, bl]; shadow { color, oy, blur }; stroke [width, colour, dash]
export const box = (ctx, x, y, w, h, r, fill, { shadow = null, stroke = null } = {}) => {
  if (w <= 0 || h <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, Array.isArray(r) ? r.map((v) => Math.min(v, w / 2, h / 2)) : Math.min(r, w / 2, h / 2));
  if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowOffsetY = shadow.oy; ctx.shadowBlur = shadow.blur; }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.shadowColor = 'transparent';
  if (stroke) { ctx.lineWidth = stroke[0]; ctx.strokeStyle = stroke[1]; if (stroke[2]) ctx.setLineDash(stroke[2]); ctx.stroke(); }
  ctx.restore();
};
// the running ring (30 px, a 3 px band in the rule colour, its top quarter in accentInk) turned by rot (rad); dashed
// for queued; and the done tick (a bubble disc with the ink check)
export const ring = (ctx, P, cx, cy, rot = 0, { dashed = false, top = P.accentInk, a = 1 } = {}) => {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.rotate(rot); ctx.lineWidth = 3;
  ctx.strokeStyle = P.rule; if (dashed) ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, Math.PI * 2); ctx.stroke();
  if (!dashed) { ctx.strokeStyle = top; ctx.beginPath(); ctx.arc(0, 0, 13.5, -0.75 * Math.PI, -0.25 * Math.PI); ctx.stroke(); }
  ctx.restore();
};
export const tick = (ctx, P, x, y, { a = 1, disc = P.bubble, ink = P.ink } = {}) => {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x + 14.5, y + 14); ctx.rotate(Math.PI / 4); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(4, 6.5); ctx.lineTo(-5.5, 6.5); ctx.stroke(); ctx.restore();
};
export const doc = (ctx, P, x, y) => {
  box(ctx, x, y, 30, 36, 6, P.bubble);
  ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = P.ink2; [11, 18, 25].forEach((dy) => ctx.fillRect(x + 8, y + dy, 14, 2)); ctx.restore();
};
// a pill: padding 4 16, radius 20, the row detail size; returns its width
export const pill = (ctx, TY, P, x, y, s, { bg = P.bubble, color = P.ink2, w = 500, scale = 1, glow = 0, glowRgb = null } = {}) => {
  const px = TY.rowSub, tw = textW(ctx, TY, s, px, w), W = tw + 32, H = lineH(px, 'normal', s) + 8;
  ctx.save();
  if (scale !== 1) { ctx.translate(x + W / 2, y + H / 2); ctx.scale(scale, scale); ctx.translate(-(x + W / 2), -(y + H / 2)); }
  box(ctx, x, y, W, H, 20, bg, glow > 0.01 ? { shadow: { color: `rgba(${glowRgb},${(0.8 * glow).toFixed(2)})`, oy: 0, blur: 30 * glow } } : {});
  textAt(ctx, TY, s, x + 16, y + 4, px, w, color);
  ctx.restore();
  return W;
};

// ---------- the hung blocks' geometry (the template's measureDOM) ----------
// a chat bubble: padding 16 22, its lines at the bubble size; bot bubbles grow from their top left, user ones from
// their top right
// quote (optional): one line the bubble answers (a reply that adds to an earlier message), set small above the text
// with a bar on its left
// quote: a quoted line over the text; file: a file chip inside the bubble, over the text (as ui-kit's message with an
// attachment)
export const bubbleOf = (ctx, TY, text, lang, maxW = 470, quote = null, file = null) => {
  const lines = linesOf(ctx, TY, text, TY.bubble, 400, maxW, lang);
  const w = Math.max(...lines.map((l) => textW(ctx, TY, l, TY.bubble, 400))) + 44, h = lines.length * TY.bubble * TY.lead + 32;
  if (!quote && !file) return { lines, w, h };
  const qh = quote ? lineH(TY.rowSub, 'normal', quote) + 12 : 0;
  const fileG = file ? fileOf(ctx, TY, file) : null, fh = fileG ? fileG.h + 10 : 0;
  const B = { lines, w: Math.max(w, quote ? textW(ctx, TY, quote, TY.rowSub, 400) + 44 + 16 : 0, fileG ? fileG.w + 32 : 0), h: h + qh + fh };
  if (quote) Object.assign(B, { quote, qh });
  if (fileG) Object.assign(B, { file, fileG, fh });
  return B;
};
export const drawBubble = (ctx, TY, P, B, who, x, y) => {
  const bot = who === 'bot', ink = bot ? P.ink : P.onUser;
  box(ctx, x, y, B.w, B.h, bot ? [8, 24, 24, 24] : [24, 8, 24, 24], bot ? P.bubble : P.user);
  const qh = B.quote ? B.qh : 0;
  if (B.quote) {
    ctx.save(); ctx.globalAlpha *= 0.45; box(ctx, x + 22, y + 16, 4, qh - 12, 2, ink); ctx.restore();
    textAt(ctx, TY, B.quote, x + 22 + 16, y + 16, TY.rowSub, 400, ink, { alpha: 0.72 });
  }
  const fh = B.file ? B.fh : 0;
  if (B.file) drawFile(ctx, TY, P, B.file, x + 16, y + 14 + qh, B.fileG);
  B.lines.forEach((ln, k) => textAt(ctx, TY, ln, x + 22, y + 16 + qh + fh + k * TY.bubble * TY.lead, TY.bubble, 400, ink, { lh: TY.lead }));
};
export const chipOf = (ctx, TY, text) => ({ w: textW(ctx, TY, text, TY.rowSub, 500) + 36 + 3, h: lineH(TY.rowSub, 'normal', text) + 16 + 3 });
export const drawChip = (ctx, TY, P, text, x, y, G) => { box(ctx, x + 0.75, y + 0.75, G.w - 1.5, G.h - 1.5, 22, null, { stroke: [1.5, P.rule] }); textAt(ctx, TY, text, x + 19.5, y + 9.5, TY.rowSub, 500, P.ink2); };
export const fileOf = (ctx, TY, text) => ({ w: 14 + 30 + 12 + textW(ctx, TY, text, TY.rowSub, 500) + 18 + 3, h: Math.max(36, lineH(TY.rowSub, 'normal', text)) + 20 + 3 });
export const drawFile = (ctx, TY, P, text, x, y, G) => {
  box(ctx, x + 0.75, y + 0.75, G.w - 1.5, G.h - 1.5, 16, P.paper, { stroke: [1.5, P.rule] });
  doc(ctx, P, x + 15.5, y + (G.h - 36) / 2);
  textAt(ctx, TY, text, x + 15.5 + 42, y + (G.h - lineH(TY.rowSub, 'normal', text)) / 2, TY.rowSub, 500, P.ink2);
};
// the title-and-detail stack of a row: t-row (row 600, normal line) over t-sub (rowSub, normal line)
export const stackH = (TY, title, sub) => lineH(TY.row, 'normal', title) + lineH(TY.rowSub, 'normal', sub);
export { typeOf };

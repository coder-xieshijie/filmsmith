// kit.js — the drawing engine of the plakat bricks (look poster-grid): the 12-column grid, the type (masked rises and
// sinks, fitted display lines stepping down the scale), the template's tweens, the paper tooth and the chrome
// (header, footer, progress cells). Pure: every function is of its arguments; the scenes problem-table,
// input-output, numeral-chapter, option-pick, doc-freeze, step-matrix, verify-band, human-loop, install-block,
// poster-tagline and poster-end, the prop poster-chrome and the motions block-carry and walk-frame import it.
// From the plakat template (assets/templates/plakat/index.html CSS and helpers, scenes.js COL, SERIES, pageHead):
// positions are the template's DOM boxes (top-left, px); a masked line rises from 118 % below inside its clip and
// sinks 118 % up through it, as the template's rise() and sink(); fitted lines step down the modular scale.
import { clamp, lerp, rgba, text, measure, rrect, canvasOf } from '../../../handoffs/util.js';
import { mulberry32, fbm } from '../../../rng.js';
import { fontFor, readTime, graphemes, units, breaks, caseOf } from '../../lang.js';
import LOOK from '../../look/poster-grid/look.js';

export { clamp, lerp, rgba, readTime, graphemes, units, LOOK };
export const COL = (i) => 96 + (i - 1) * 146;          // left edge of column i (1..12)
export const SPAN = (n) => n * 146 - 24;                // width of n columns
export const SERIES = [25, 34, 47, 64, 88, 120, 164, 225, 308, 421];
export const zh = (L) => L === 'zh';
// the page's three tiers by language: Chinese labels 28, body 40 (SPEC floors), Latin labels 25, body 34
export const SZ = (L) => (zh(L) ? { label: 28, body: 40, small: 28 } : { label: 25, body: 34, small: 25 });

// ── tweens: the template's GSAP eases, as functions of a progress 0..1 ───────────────────────────────────────────
const c01 = (u) => clamp(u, 0, 1);
export const E = {
  none: (u) => c01(u),
  expoOut: (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * c01(u))),
  expoIn: (u) => (u <= 0 ? 0 : Math.pow(2, 10 * (c01(u) - 1))),
  expoInOut: (u) => { u = c01(u); return u === 0 || u === 1 ? u : u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2; },
  p1InOut: (u) => { u = c01(u); return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; },
  p2Out: (u) => 1 - Math.pow(1 - c01(u), 3),
  p2In: (u) => Math.pow(c01(u), 3),
  p2InOut: (u) => { u = c01(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
  p3Out: (u) => 1 - Math.pow(1 - c01(u), 4),
  p3In: (u) => Math.pow(c01(u), 4),
  p3InOut: (u) => { u = c01(u); return u < 0.5 ? 8 * u ** 4 : 1 - Math.pow(-2 * u + 2, 4) / 2; },
  back: (s = 1.7) => (u) => { u = c01(u); const c3 = s + 1; return 1 + c3 * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); },
};
// A scene's clock: u in beats from its start → seconds; at(U) is the template's unit (2 beats; 1 s at 120 BPM)
export const clock = (u, bpm) => {
  const t = (u * 60) / bpm, k = 120 / bpm;
  const at = (U) => U * k;
  // progress of a tween that starts at the template time U (template units) and runs d seconds (scaled with the tempo)
  const tw = (U, d, ease = E.expoOut) => ease((t - at(U)) / Math.max(1e-6, d));
  const sec = (U, d, ease = E.expoOut) => ease((t - U) / Math.max(1e-6, d));     // start given in seconds
  return { t, k, at, tw, sec };
};

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// font for a role at a size: display (Inter Tight 800, −0.045 em), num (−0.06 em), text (Inter Tight), mono (Plex)
export const F = (role, L, size, weight = 800) => {
  const fam = role === 'mono' ? 'mono' : role === 'text' ? 'text' : 'display';
  const kind = role === 'display' ? 'display' : role === 'num' ? 'numeral' : null;
  return fontFor(LOOK, fam, L, size, weight, kind);
};
export const track = (f, em) => ({ ...f, spacing: f.spacing + em * f.size });
// labels: Plex Mono 500 in capitals +0.08 em (Latin); Chinese as written, 28 px, no tracking
export const labelFont = (L, size = SZ(L).label, weight = 500) => (zh(L) ? fontFor(LOOK, 'mono', L, size, weight) : { ...fontFor(LOOK, 'mono', L, size, weight), spacing: 0.08 * size });
export const labelText = (s, L) => caseOf(String(s ?? ''), LOOK, 'label', L).text;
// the alphabetic baseline of a DOM line box whose top is `top` at line-height lh (font metrics of the Latin family)
const METRIC = { 'Inter Tight': [0.969, 0.242], 'IBM Plex Mono': [1.025, 0.275] };
export const baseline = (top, size, lh = null, family = 'Inter Tight') => {
  const [a, d] = METRIC[family] || METRIC['Inter Tight'], line = lh ?? a + d;
  return top + (line - (a + d)) * size / 2 + a * size;
};
export const width = (ctx, s, f) => measure(ctx, String(s ?? ''), f).width;
// step a display size down the scale until the string fits maxW (never below `min`, never off the scale)
export const fitSize = (ctx, s, fontAt, maxW, size, min) => {
  const floor = Math.max(...SERIES.filter((v) => v <= Math.max(min, SERIES[0])));
  const steps = SERIES.filter((v) => v < size && v >= floor).reverse();
  while (width(ctx, s, fontAt(size)) > maxW && size > floor) size = steps.shift() ?? floor;
  return size;
};
// *word* marks the person's word in large type: drawn in the accent
export const parts = (s) => String(s ?? '').split(/(\*[^*]+\*)/).filter(Boolean).map((p) => (p.startsWith('*') && p.endsWith('*') ? { t: p.slice(1, -1), acc: true } : { t: p, acc: false }));
export const plain = (s) => String(s ?? '').replace(/\*/g, '');
export const drawRich = (ctx, s, x, y, f, C, { color = C.ink, alpha = 1 } = {}) => {
  let cx = x;
  for (const p of parts(s)) { text(ctx, p.t, cx, y, f, { color: p.acc ? C.accent : color, alpha }); cx += width(ctx, p.t, f); }
  return cx - x;
};
// A masked line (the template's .m/.mi): text whose box top is `top`, clipped to its line box plus 0.14 em, offset by
// `off` line heights (rise: 1.18 → 0; sink: 0 → −1.18). lh: line height in em (display 1, numerals 0.82, else normal).
export const masked = (ctx, s, x, top, f, C, { off = 0, lh = 1, color = C.ink, rich = true, align = 'left', w = null, alpha = 1 } = {}) => {
  if (off <= -1.18 || off >= 1.18 || alpha <= 0) return;
  const size = f.size, H = (lh ?? 1.211) * size, tw = w ?? width(ctx, plain(s), f);
  const x0 = align === 'right' ? x - tw : x;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 0.1 * size, top, tw + 0.3 * size, H + 0.14 * size); ctx.clip();
  const y = baseline(top, size, lh, String(f.family).includes('Plex') ? 'IBM Plex Mono' : 'Inter Tight') + off * H;
  if (rich) drawRich(ctx, s, x0, y, f, C, { color, alpha }); else text(ctx, s, x0, y, f, { color, alpha });
  ctx.restore();
};
export const riseOff = (p) => 1.18 * (1 - p);
export const sinkOff = (p) => -1.18 * p;
// plain text at a DOM top (no mask), with an optional fade and offset
export const at = (ctx, s, x, top, f, color, { lh = null, alpha = 1, dx = 0, dy = 0, align = 'left' } = {}) => {
  if (alpha <= 0) return;
  const fam = String(f.family).includes('Plex') ? 'IBM Plex Mono' : 'Inter Tight';
  text(ctx, String(s ?? ''), x + dx, baseline(top, f.size, lh, fam) + dy, f, { color, alpha, align });
};
export const rect = (ctx, x, y, w, h, color, alpha = 1) => { if (w <= 0 || h <= 0 || alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.restore(); };
export const frameRect = (ctx, x, y, w, h, lw, color, { dash = null, alpha = 1 } = {}) => {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); ctx.restore();
};
// a polyline drawn along its length to p (the template's stroke-dashoffset draw)
export const drawPath = (ctx, pts, p, color, lw = 2) => {
  if (p <= 0) return;
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), L = seg.reduce((a, b) => a + b, 0);
  let left = p * L;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < seg.length && left > 0; i++) { const f = Math.min(1, left / seg[i]); ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)); left -= seg[i]; }
  ctx.stroke(); ctx.restore();
};
export const pad2 = (n) => String(n).padStart(2, '0');

// ── ground: paper, the 12-column grid (both edges of every column, ink at the grid alpha), the print tooth ────────
// grid: 0..1 how far the column lines have dropped in (the film's first 0.7 s); paper: the tooth amount (0 = flat)
export const paperTooth = (seed = 1, amount = 0.5) => {
  if (!amount) return null;
  const lo = canvasOf(240, 135), l = lo.getContext('2d'), img = l.createImageData(240, 135);
  for (let y = 0; y < 135; y++) for (let x = 0; x < 240; x++) {
    const v = fbm(x / 22, y / 22, seed + 5, 4), o = (y * 240 + x) * 4;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = 128 + (0.5 - v) * 112 * amount; img.data[o + 3] = 255;
  }
  l.putImageData(img, 0, 0);
  const c = canvasOf(1920, 1080), x = c.getContext('2d');
  x.imageSmoothingEnabled = true; x.drawImage(lo, 0, 0, 1920, 1080);
  const d = x.getImageData(0, 0, 1920, 1080), r = mulberry32(seed);
  for (let i = 0; i < d.data.length; i += 4) { const n = (r() - 0.5) * 140 * amount; d.data[i] = d.data[i + 1] = d.data[i + 2] = Math.max(0, Math.min(255, d.data[i] + n)); }
  x.putImageData(d, 0, 0);
  return c;
};
export const ground = (ctx, C, { grid = 1 } = {}) => {
  ctx.fillStyle = C.paper || C.ground; ctx.fillRect(0, 0, 1920, 1080);
  if (grid <= 0) return;
  ctx.fillStyle = C.grid || rgba(C.ink, 0.085);
  for (let i = 0; i < 12; i++) {
    const g = E.expoOut((grid * 0.7 - 0.018 * i) / 0.7);
    for (const x of [COL(i + 1), COL(i + 1) + 121]) ctx.fillRect(x, 0, 1, 1080 * g);
  }
};
export const tooth = (ctx, T) => { if (!T) return; ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; ctx.drawImage(T, 0, 0); ctx.restore(); };

// ── chrome: header (brand · tag · section · licence) over a 2 px rule at y 116; footer (URL · platforms · one cell
// per bar, past bars ink, the current bar accent) over a rule at y 962. Over an accent field (rects in `fields`,
// optional lean) the chrome takes onAccent, split at the field edge (clip), as the template splits per character.
export const chromeDefaults = {
  en: { brand: 'Northwind', tag: 'Release tooling · reviewed by a person', section: '01 — Draft', licence: 'MIT', url: 'northwind.example', platforms: 'macOS · Linux', bars: 16, bar: 3 },
  zh: { brand: 'Northwind', tag: '发布工具 · 由人审核', section: '01 — 起草', licence: 'MIT', url: 'northwind.example', platforms: 'macOS · Linux', bars: 16, bar: 3 },
};
const chromeText = (ctx, c, C, L, color, rules) => {
  const lf = labelFont(L);
  if (rules) { rect(ctx, 96, 116, 1728 * rules, 2, color); rect(ctx, 96, 962, 1728 * rules, 2, color); }
  at(ctx, c.brand, 96, 56, { ...F('display', L, 28, 800), spacing: zh(L) ? 0 : -0.03 * 28 }, color);
  at(ctx, labelText(c.tag, L), COL(3), 58, lf, color, { lh: null });
  at(ctx, labelText(c.section, L), COL(8), 58, lf, color);
  at(ctx, labelText(c.licence, L), COL(11), 58, lf, color);
  at(ctx, labelText(c.url, L), 96, 982, lf, color);
  at(ctx, labelText(c.platforms, L), COL(5), 982, lf, color);
};
export const drawChrome = (ctx, c, C, L, { fields = [], rules = 1, alpha = 1 } = {}) => {
  if (!c || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  chromeText(ctx, c, C, L, C.ink, rules);
  const n = Math.max(1, c.bars | 0), cw = (706 - 6 * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const x = COL(8) + i * (cw + 6);
    if (i < c.bar) rect(ctx, x, 990, cw, 14, C.ink); else if (i === c.bar) rect(ctx, x, 990, cw, 14, C.accent); else frameRect(ctx, x, 990, cw, 14, 1.5, C.ink);
  }
  if (fields.length) {
    ctx.save(); ctx.beginPath();
    for (const f of fields) { const d = f.lean ? f.lean * f.h / 2 : 0; ctx.moveTo(f.x + d, f.y); ctx.lineTo(f.x + f.w + d, f.y); ctx.lineTo(f.x + f.w - d, f.y + f.h); ctx.lineTo(f.x - d, f.y + f.h); ctx.closePath(); }
    ctx.clip(); chromeText(ctx, c, C, L, C.onAccent, rules); ctx.restore();
  }
  ctx.restore();
};

// ── the page head shared by the content pages: numeral and title at 120 px, caption from column 8, rule at y 300 ──
export const pageHead = (ctx, s, C, L, ck, { exit = 0 } = {}) => {
  const { tw } = ck, S = SZ(L);
  const titleF = (z) => F('display', L, z, 800);
  const tz = fitSize(ctx, plain(s.title), titleF, 706, 120, 88);
  masked(ctx, s.num, 90, 150, F('num', L, 120, 800), C, { off: exit ? sinkOff(exit) : riseOff(tw(0, 0.5)), lh: 0.82 });
  masked(ctx, s.title, 388, 150, titleF(tz), C, { off: exit ? sinkOff(exit) : riseOff(tw(0.07, 0.5)), lh: 1 });
  const cp = tw(0.15, 0.35, E.p2Out);
  wrapLines(ctx, s.caption, F('text', L, zh(L) ? 28 : 27, 500), 706, L).slice(0, 2).forEach((ln, i) => at(ctx, ln, 1118, 158 + i * (zh(L) ? 36 : 35), F('text', L, zh(L) ? 28 : 27, 500), C.ink, { lh: 1.3, alpha: cp, dy: 10 * (1 - cp) }));
  rect(ctx, 96, 300, 1728 * tw(0.05, 0.6, E.expoInOut), 2, C.ink);
};
export const wrapLines = (ctx, s, f, maxW, L) => {
  const out = []; let line = '';
  for (const { w, sep } of breaks(s, L)) { const n = line ? line + sep + w : w; if (line && width(ctx, n, f) > maxW) { out.push(line); line = w; } else line = n; }
  if (line) out.push(line);
  return out;
};
// the page roll-up exit: a page without its own exit is cleared bottom-up in 0.25 s from 0.125 s before its end
export const rollUp = (ctx, ck, D) => {
  const p = ck.sec(ck.at(D) - 0.125, 0.25 * ck.k, E.p2In);
  if (p <= 0) return false;
  ctx.beginPath(); ctx.rect(0, 0, 1920, 1080 * (1 - p)); ctx.clip();
  return true;
};

// ── how long a page needs (the template's timing.rules need): primary strings read one after another at the shared
// reading time from 0.25 s after they land, glance strings ≥ 1 s still in parallel, held strings ≥ hold s; the last
// landing then rests one beat; plus the exit. reads: [U, [strings], { tier, hold }] in template units (2 beats).
export const needU = (reads, settled, out, bpm, L) => {
  const k = 120 / bpm, beat = 60 / bpm;
  let end = 0, prim = 0;
  const list = [];
  for (const [U, strings, o = {}] of reads) for (const x of [].concat(strings).flat()) if (x != null && x !== '') list.push({ at: U * k + 0.25, text: plain(x), tier: o.tier || 'primary', hold: o.hold || 0 });
  list.sort((a, b) => a.at - b.at);
  for (const r of list) {
    if (r.tier === 'glance') end = Math.max(end, r.at + 1);
    else { prim = Math.max(prim, r.at) + readTime(r.text, L); end = Math.max(end, prim); }
    if (r.hold) end = Math.max(end, r.at + r.hold);
  }
  const D = (Math.max(end, settled * k + beat) + out * k) / k;
  return Math.ceil(D * 2 - 1e-9) / 2;               // whole beats
};
export const G = { tier: 'glance' };
export const halfBeatUp = (u) => Math.ceil(u * 4 - 1e-9) / 4;
export const beatUp = (u) => Math.ceil(u * 2 - 1e-9) / 2;
export const rd = (L, k = 1) => (x) => readTime(plain(x), L) / k;
// hold moves (the template's walk 'frame'): from the first beat 0.3 U into the still after `from`, one hop a beat
export const walkMoves = (from, end) => { const out = []; for (let u = Math.ceil((from + 0.3) * 2 - 1e-9) / 2; u < end - 0.25; u += 0.5) out.push(u); return out; };
// an ink frame steps over the page's items in reading order, one hop per move (0.12 s, power2.out, 0.06 s early)
export const walkFrame = (ctx, ck, moves, boxes, C, { lw = 3 } = {}) => {
  if (!moves.length || !boxes.length) return;
  let k = -1;
  for (let j = 0; j < moves.length; j++) if (ck.t >= ck.at(moves[j]) - 0.06) k = j;
  if (k < 0) return;
  const b = boxes[k % boxes.length], a = k ? boxes[(k - 1) % boxes.length] : b, p = k ? E.p2Out((ck.t - ck.at(moves[k]) + 0.06) / 0.12) : 1;
  frameRect(ctx, lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p), lw, C.ink);
};
// the progress cell moves on with the music: the chrome's `bar` is the bar the scene starts in, `phase` the beats of
// that bar already gone when it starts (0–3), one cell more at every bar line (u in beats)
export const barOf = (c, u) => (c && c.bar != null ? { ...c, bar: c.bar + Math.floor((u + (c.phase || 0) + 1e-6) / 4) } : c);

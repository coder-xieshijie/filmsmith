// type.js — what the type bricks of batch 2 share: cut a text into animation units by language, set it into lines on a
// canvas, and draw one unit with its own transform. Pure; prepare() measures once with a scratch context.
// Proposed for runtime/bricks/ next to lang.js when batch 2 moves into the skill; until then the type bricks import it
// from here (motion: ../type-enter/type.js, scene: ../../motion/type-enter/type.js).
//
// Units:
//   'char'  — grapheme clusters (lang.js graphemes); spaces are gaps, never units. Chinese: one character a unit.
//   'word'  — English: a word with its punctuation. Chinese: a phrase of 2–4 characters (词组), built from
//             Intl.Segmenter('zh', word) segments, a one-character segment joined to its neighbour, closing
//             punctuation to the phrase before it and opening punctuation to the one after: 每一次|渲染，|发布前|都检查过.
//   'line'  — a whole line.
// Lines break between words (English) or phrases (Chinese), so a phrase never splits across lines.

import { measure, fontOf, mix } from '../../../handoffs/util.js';
import { graphemes, isCJK, fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('zh', { granularity: 'word' }) : null;
const CLOSE = /^[。，、；：？！）」』》〉】,.;:?!)\]%…—]+$/;
const OPEN = /^[（「『《〈【(\[]+$/;
const cjkLen = (s) => graphemes(s).filter(isCJK).length;

// Chinese phrases with their offsets: [{ s, o }]
const phrasesZh = (s) => {
  const segs = SEG ? Array.from(SEG.segment(s), (x) => ({ s: x.segment, o: x.index, word: x.isWordLike })) : graphemes(s).map((g, i) => ({ s: g, o: i, word: true }));
  const out = [];
  let pendingOpen = null;
  for (const g of segs) {
    if (/^\s+$/.test(g.s)) { if (out.length) out[out.length - 1].space = true; continue; }
    if (OPEN.test(g.s)) { pendingOpen = pendingOpen ? { s: pendingOpen.s + g.s, o: pendingOpen.o } : { ...g }; continue; }
    if (CLOSE.test(g.s) && out.length && !out[out.length - 1].space) { out[out.length - 1].s += g.s; continue; }
    let cur = pendingOpen ? { s: pendingOpen.s + g.s, o: pendingOpen.o } : { s: g.s, o: g.o };
    pendingOpen = null;
    const prev = out[out.length - 1];
    const latin = !graphemes(cur.s).some(isCJK);
    if (prev && !prev.space && !latin && graphemes(prev.s).some(isCJK)) {
      const a = cjkLen(prev.s), b = cjkLen(cur.s);
      if (a < 2 || (b === 1 && a + b <= 4)) { prev.s += cur.s; continue; }
    }
    out.push(cur);
  }
  if (pendingOpen) out.push(pendingOpen);
  return out;
};

// Line-breakable chunks with offsets: [{ s, o, sep }] (sep: what goes before the chunk when it follows another on a line)
export const chunks = (s, lang = 'en') => {
  s = String(s ?? '');
  if (lang === 'zh') {
    const ph = phrasesZh(s);
    return ph.map((c, i) => ({ s: c.s, o: c.o, sep: i && ph[i - 1].space ? ' ' : '' }));
  }
  return Array.from(s.matchAll(/\S+/g), (m) => ({ s: m[0], o: m.index, sep: ' ' }));
};

// Animation units of a chunk: [{ s, o }] (o: offset in the whole text)
const unitsOf = (c, by) => {
  if (by !== 'char') return [{ s: c.s, o: c.o }];
  const out = [];
  let o = c.o;
  for (const g of graphemes(c.s)) { if (!/\s/.test(g)) out.push({ s: g, o }); o += g.length; }
  return out;
};

// A value given per language ({ en, zh }) or once: the one for lang.
export const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'zh' in v) ? v[lang] ?? v.en : v);

// The language of a text when the caller does not say: Chinese if it holds a CJK character.
export const langOf = (s, lang) => lang || (graphemes(String(s ?? '')).some(isCJK) ? 'zh' : 'en');

// Units without measuring (Node, where there is no canvas: a brick's length must not depend on a font): the same units
// as setText, lines estimated at 1 em a Chinese character and 0.55 em any other. [{ s, o, line, accent }]
export const roughUnits = (s, lang, { by = 'word', size = 100, maxW = 1600, accent = null } = {}) => {
  s = String(s ?? '');
  const est = (t) => graphemes(t).reduce((w, g) => w + (isCJK(g) ? 1 : 0.55), 0) * size;
  const acc = accent == null ? null : Array.isArray(accent) ? accent : s.indexOf(accent) >= 0 ? [s.indexOf(accent), s.indexOf(accent) + accent.length] : null;
  const out = [];
  let line = 0, w = 0;
  for (const c of chunks(s, lang)) {
    const cw = est(c.s), sw = est(c.sep);
    if (w && w + sw + cw > maxW) { line++; w = 0; }
    w += (w ? sw : 0) + cw;
    for (const u of unitsOf(c, by)) out.push({ s: u.s, o: u.o, line, accent: acc && acc[1] > u.o && acc[0] < u.o + u.s.length ? true : null });
  }
  return out;
};

// The font spec of a type brick: role and size from P, tracking from the look (Chinese never negative).
export const fontSpec = (P, size = P.size, weight = P.weight, role = P.role || 'display') => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, role === 'display' ? 'display' : null);

// Set a text into lines and units. opts: { by, x, y (the block's centre line), align 'left' | 'center' | 'right', maxW,
// leading (× size), accent (substring or [from, to] offsets) }. Returns { units, lines, size, lh, box, f }.
export const setText = (ctx, s, f, lang, { by = 'word', x = 960, y = 540, align = 'center', maxW = 1600, leading = null, accent = null } = {}) => {
  s = String(s ?? '');
  const cs = chunks(s, lang);
  const lines = [];
  let cur = null;
  for (const c of cs) {
    const next = cur ? cur.text + c.sep + c.s : c.s;
    if (cur && measure(ctx, next, f).width > maxW) { lines.push(cur); cur = null; }
    if (!cur) cur = { text: c.s, parts: [{ c, at: 0 }] };
    else { cur.parts.push({ c, at: cur.text.length + c.sep.length }); cur.text = next; }
  }
  if (cur) lines.push(cur);
  const size = f.size, lh = size * (leading ?? (lang === 'zh' ? 1.3 : 1.12));
  const asc = size * (lang === 'zh' ? 0.36 : 0.35);           // baseline below the line's visual centre
  const acc = accent == null ? null : Array.isArray(accent) ? accent : s.indexOf(accent) >= 0 ? [s.indexOf(accent), s.indexOf(accent) + accent.length] : null;
  const units = [];
  let x0 = Infinity, x1 = -Infinity;
  lines.forEach((L, li) => {
    const w = measure(ctx, L.text, f).width;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const base = y - ((lines.length - 1) * lh) / 2 + li * lh + asc;
    x0 = Math.min(x0, left); x1 = Math.max(x1, left + w);
    L.w = w; L.left = left; L.base = base;
    const parts = by === 'line' ? [{ c: { s: L.text, o: L.parts[0].c.o }, at: 0 }] : L.parts;
    for (const { c, at } of parts) for (const u of unitsOf(c, by)) {
      const k = at + (u.o - c.o);                               // offset in the line's text
      const ux = left + measure(ctx, L.text.slice(0, k), f).width;
      const uw = measure(ctx, u.s, f).width;
      const a = acc ? [Math.max(0, acc[0] - u.o), Math.min(u.s.length, acc[1] - u.o)] : null;
      units.push({ s: u.s, o: u.o, x: ux, y: base, w: uw, cx: ux + uw / 2, cy: base - asc, line: li, i: units.length,
        accent: a && a[1] > a[0] ? a : null });
    }
  });
  return { units, lines: lines.map((L) => ({ text: L.text, left: L.left, w: L.w, base: L.base })), size, lh, asc, f,
    box: [x0, y - (lines.length * lh) / 2, x1 - x0, lines.length * lh] };
};

// Draw one unit. o: { dx, dy, rot (rad), sx, sy, alpha, blur (px), color, accentColor, ox, oy (transform origin, absolute;
// default the unit's centre), stroke: { width, color } (drawn over the fill), fill: false (outline only) }.
export const drawUnit = (ctx, u, L, o = {}) => {
  const { dx = 0, dy = 0, rot = 0, sx = 1, sy = 1, alpha = 1, blur = 0, color = '#000', accentColor = color } = o;
  if (alpha <= 0.002) return;
  const ox = o.ox ?? u.cx, oy = o.oy ?? u.cy;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  ctx.translate(ox + dx, oy + dy);
  if (rot) ctx.rotate(rot);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  if (o.m) ctx.transform(o.m[0], o.m[1], o.m[2], o.m[3], 0, 0);   // a linear map about the origin (a projected 3D turn)
  ctx.translate(-ox, -oy);
  ctx.font = fontOf(L.f);
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${L.f.spacing ?? 0}px`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const parts = u.accent ? [[0, u.accent[0], color], [u.accent[0], u.accent[1], accentColor], [u.accent[1], u.s.length, color]] : [[0, u.s.length, color]];
  for (const [a, b, col] of parts) {
    if (b <= a) continue;
    const px = u.x + (a ? ctx.measureText(u.s.slice(0, a)).width : 0);
    const str = u.s.slice(a, b);
    if (o.fill !== false) { ctx.fillStyle = col; ctx.fillText(str, px, u.y); }
    if (o.stroke && o.stroke.width > 0.01) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke.width; ctx.strokeStyle = o.stroke.color || col; ctx.strokeText(str, px, u.y); }
  }
  ctx.restore();
};

// The unit's colour: ink, deepened toward black by k (a lock pulse on a light ground) or toward white (dark ground).
export const deepen = (c, k, dark) => (k > 0 ? mix(c, dark ? '#ffffff' : '#000000', k) : c);

// Frames at 30 fps of a 120 BPM beat, so upstream frame numbers read directly: 15 frames a beat.
export const FPB = 15;
export const beatsFrom = (frames) => Math.max(0.5, Math.ceil(frames / 7.5 - 1e-6) / 2);

// A damped spring from 0 toward 1 (the closed form of a mass on a spring, 30 fps frames), as the upstream springs:
// damping 12 lively, 14 one visible overshoot, 18 brisk, 26 none. Exactly 1 from `settle` frames on, so a brick that
// rests on it rests exactly.
export const springF = (f, { damping = 18, stiffness = 170, mass = 1, settle = 45 } = {}) => {
  if (f <= 0) return 0;
  if (f >= settle) return 1;
  const t = f / 30, w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};

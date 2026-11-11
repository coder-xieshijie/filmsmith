// kit.js — what the pulse bricks share (anchor-ask, hop-search, figure-rows, answer-whiteout, name-flip, query-line,
// symbol-scramble): the grid, the type in both languages, the colour of every text on every ground, the rise through a
// mask, the beat pop, the aperture shapes, the query line and the scramble glyphs. Pure functions of their arguments.
// From the pulse template (assets/templates/pulse/film.js, palettes.js onGround, choreo.js C): values are the
// template's. Chinese (SPEC 4): display words in Noto Sans SC 900 set as 长体 (scaled to 0.84 wide), never shrunk below
// the floor; the optical middle of a Chinese word is 0.38 of its size above the baseline (Latin 0.36).
import { clamp, mix, measure, text } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { expOut, cubicOut } from '../../../motion.js';
import { fontStack, graphemes, breaks, isCJK } from '../../lang.js';
import LOOK from './look.js';

export const W = 1920, H = 1080, X0 = 160, XR = W - 160, MAXW = XR - X0, ANCHOR_Y = 660, QUERY_Y = 990;
export const SZ = { word: 364, wordMin: 233, line: 61, query: 31, cell: 186, data: [364, 291, 291], dataMin: 186,
  reveal: 568, revealMin: 455, name: 364, nameMin: 291, install: 49 };
export const T = { typeSec: 0.012, riseSec: 0.22, apSec: 0.2, popScale: 0.035, popSec: 0.12, scrambleHz: 24, valueSec: 0.08,
  scrambleSec: 0.35, whiteSec: 2 / 30, shockSec: 0.45, fallSec: 0.3, installCps: 50 };
export const secs = (beats, bpm = 120) => (beats * 60) / bpm;
export const beatsOf = (s, bpm = 120) => (s * bpm) / 60;
const hasCJK = (s) => graphemes(s).some(isCJK);
export const zhScale = (s, lang) => (lang === 'zh' && hasCJK(s) ? LOOK.type.zhScale : 1);

// font specs: display = Barlow Condensed 900 (Chinese: Noto Sans SC 900), text = Barlow 600 (700 for the answer),
// mono = JetBrains Mono; tracking from the look, none in Chinese
export const F = (role, lang, size, weight) => {
  const tr = LOOK.type.tracking[lang === 'zh' ? 'zh' : 'en'];
  const w = weight ?? (role === 'display' ? 900 : role === 'mono' ? 500 : 600);
  return { family: fontStack(LOOK, role, lang), weight: w, size, spacing: (role === 'display' ? tr.display : role === 'text' && w >= 700 ? tr.wide : 0) * size };
};
// width of a string as drawn (the 长体 scale included)
export const widthOf = (ctx, s, f, lang) => measure(ctx, s, f).width * zhScale(s, lang);
// draw a display or text string at (x, y) left-aligned (or 'center'), scaled about its anchor by k and squeezed to 长体
export const draw = (ctx, s, x, y, f, color, lang, { align = 'left', k = 1, alpha = 1, blur = 0 } = {}) => {
  const sx = zhScale(s, lang);
  ctx.save();
  ctx.translate(x, y); ctx.scale(k * sx, k); ctx.translate(-x, -y);
  if (blur > 0.3) ctx.filter = `blur(${(blur / k).toFixed(2)}px)`;
  text(ctx, s, x, y, f, { color, align, alpha });
  ctx.restore();
};
export const fitSize = (ctx, s, role, lang, max, min, maxW = MAXW, weight) => {
  let z = max;
  while (z > min && widthOf(ctx, s, F(role, lang, z, weight), lang) > maxW) z -= 2;
  return z;
};
export const opticalMiddle = (size, lang) => ANCHOR_Y - size * (lang === 'zh' ? 0.38 : 0.36);

// grounds: r0–r3 the ramp, white the tinted near-white; the colours of type on each (the template's onGround)
const R = (C, k) => C['r' + k] || [C.ground, C.panel, mix(C.panel, C.accent, 0.35), C.paper][k];
export const groundHex = (C, g) => (g === 'white' ? C.white || C.paper : R(C, Number(String(g).slice(1))));
export const onGround = (C, g) => {
  const white = C.white || C.ink, ink = C.r0 || C.ground;
  const acc = (k) => (!C.accentOn || C.accentOn.includes(k) ? C.accent : null);
  switch (g) {
    case 'r1': return { text: white, quiet: R(C, 3), dim: R(C, 3), accent: acc('r1'), accentInk: ink, hop: R(C, 2), rule: R(C, 2) };
    case 'r2': return { text: white, quiet: R(C, 3), dim: R(C, 3), accent: acc('r2'), accentInk: ink, hop: R(C, 1), rule: R(C, 1) };
    case 'r3': return { text: ink, quiet: ink, dim: R(C, 1), accent: null, accentInk: ink, hop: R(C, 1), rule: R(C, 1) };
    case 'white': return { text: R(C, 1), quiet: R(C, 1), dim: R(C, 1), accent: null, accentInk: ink, hop: R(C, 1), rule: R(C, 1) };
    default: return { text: white, quiet: C.dim, dim: C.dim, accent: acc('r0'), accentInk: ink, hop: R(C, 2), rule: R(C, 1) };
  }
};
export const fillGround = (ctx, hex) => { ctx.fillStyle = hex; ctx.fillRect(-W, -H, 3 * W, 3 * H); };

// a line rising out of a mask whose lower edge sits just under its baseline (expo out, 0.22 s); t in seconds
export const rise = (ctx, s, x, y, t, t0, f, color, lang, opts = {}) => {
  const k = expOut(clamp((t - t0) / T.riseSec));
  if (k <= 0) return;
  const h = Math.round(f.size * 1.08);
  ctx.save(); ctx.beginPath(); ctx.rect(-W, y - h, 3 * W, h + Math.round(f.size * 0.32)); ctx.clip();
  draw(ctx, s, x, y + (1 - k) * h, f, color, lang, opts);
  ctx.restore();
};
// the beat pop: 3.5 % up on the beat, settling in 0.12 s (t, pops in seconds)
export const popAt = (pops, t) => { let t0 = null; for (const p of pops || []) if (t >= p - 1e-9) t0 = p; return t0 == null ? 1 : 1 + T.popScale * (1 - expOut(clamp((t - t0) / T.popSec))); };

// aperture-swap's three shapes as a clip (the runtime transition draws the same shapes in WebGL): the next ground
// opens on the beat over 0.2 s, cubic out, from `o` [x, y]; q is 0–1
export const aperture = (ctx, shape, q, o) => {
  const e = cubicOut(clamp(q)), [ox, oy] = o;
  ctx.beginPath();
  if (shape === 'circle') ctx.arc(ox, oy, e * Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy)) + 1, 0, Math.PI * 2);
  else if (shape === 'close') { ctx.rect(0, 0, W, e * oy + 1); ctx.rect(0, H - e * (H - oy) - 1, W, e * (H - oy) + 1); }
  else { const h = e * 2 * Math.max(oy, H - oy); ctx.rect(0, oy - h / 2, W, h); }
  ctx.clip();
};

// the query line: one mono line at y 990; it keeps its right end inside the content area by dropping whole leading
// fragments behind an ellipsis (fragments by lang.js breaks, not by splitting on spaces)
export const queryFont = (lang) => F('mono', lang, SZ.query, 500);
export const fitQuery = (ctx, s, lang) => {
  const f = queryFont(lang);
  let parts = breaks(s, lang), line = s, cut = false;
  while (parts.length > 1 && measure(ctx, line, f).width > MAXW) { parts = parts.slice(1); cut = true; line = '… ' + parts.map((p, i) => (i ? p.sep : '') + p.w).join(''); }
  return cut ? line : s;
};
export const drawQuery = (ctx, s, color, lang) => text(ctx, fitQuery(ctx, s, lang), X0 + 4, QUERY_Y, queryFont(lang), { color });
// typed at 12 ms a character (graphemes), from t0 (seconds)
export const typed = (s, t, t0, cps = 1 / T.typeSec) => (t < t0 ? '' : graphemes(s).slice(0, Math.max(0, Math.floor((t - t0) * cps))).join(''));

// a scrambling digit shows a symbol from a seeded hash 24 times a second: fixed slots, never another digit
const SCRAMBLE = '#&*@';
export const scrambleChar = (c, frame, seed) => SCRAMBLE[Math.floor(hash(c * 7919 + frame * 104729, seed) * SCRAMBLE.length)];
// draw s glyph by glyph in the advances of the final string; slot(c, ch) → the glyph to show in slot c
export const glyphSlots = (ctx, s, x, y, f, color, slot) => {
  const g = graphemes(s);
  let px = x, acc = '';
  for (let c = 0; c < g.length; c++) {
    const before = measure(ctx, acc, f).width; acc += g[c];
    const adv = measure(ctx, acc, f).width - before, show = slot(c, g[c]);
    if (show === g[c]) text(ctx, g[c], px, y, f, { color });
    else if (show) { ctx.save(); ctx.beginPath(); ctx.rect(px, y - f.size, adv, f.size * 1.3); ctx.clip(); text(ctx, show, px + adv / 2, y, f, { color, align: 'center' }); ctx.restore(); }
    px += adv;
  }
};
// a number counted toward its target, written in the target's own format (separators, decimals, suffix)
export const countTo = (target, u) => {
  const m = String(target).match(/^(\D*)([\d,]*\.?\d*)(.*)$/);
  if (!m || !m[2]) return target;
  const dec = (m[2].split('.')[1] || '').length, v = parseFloat(m[2].replace(/,/g, '')) * clamp(u);
  let s = v.toFixed(dec);
  if (m[2].includes(',')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return m[1] + s + m[3];
};
export const grain = (ctx, seed, amount = 0.05) => {
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 900; i++) { const x = hash(i, seed) * W, y = hash(i + 7, seed) * H; ctx.fillStyle = hash(i + 3, seed) > 0.5 ? '#ffffff' : '#000000'; ctx.fillRect(x, y, 2, 2); }
  ctx.restore();
};

// kit.js — what the terminal-ledger bricks share (paper-term, paper-frame, seal-stamp, ruled-ledger, dot-sort, term-wall,
// hand-mark, term-count, wall-ledger, pile-split, session-queue): GSAP-like eases and keyframes as pure functions of time,
// type in both languages (WenKai in Chinese, Source Serif 4 and IBM Plex Mono in English; floors 28 / 25 px), the light
// terminal and its log, the wall of small windows, the ruled ledger page, the hand-drawn dots and their piles, chips,
// labels, the chapter label, the counter, the dashed "illustrative" note, the stamp and its imprint, hand marks, session
// windows with lamps, the rope. Every value is the kit's (teach-video assets/kits/terminal-ledger/starter: tokens.js,
// style.css, components/*.js), redrawn in Canvas2D; a frame depends only on its arguments and t (seconds).
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor, graphemes } from '../../lang.js';
import LOOK from './look.js';

export { clamp, mix, rgba, rrect, LOOK };
export const W = 1920, H = 1080;
export const lerp = (a, b, u) => a + (b - a) * u;
export const L = (lang) => (lang === 'zh' ? 'zh' : 'en');

// ── eases (GSAP's curves) and time ───────────────────────────────────────────────────────────────────────────────────
const pin = (k) => (u) => u ** k, pout = (k) => (u) => 1 - (1 - u) ** k, pio = (k) => (u) => (u < 0.5 ? 2 ** (k - 1) * u ** k : 1 - (-2 * u + 2) ** k / 2);
export const E = {
  none: (u) => u, p1i: pin(2), p1o: pout(2), p1io: pio(2), p2i: pin(3), p2o: pout(3), p2io: pio(3), p3i: pin(4), p3o: pout(4), p3io: pio(4),
  sine: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
  back: (s = 1.7) => (u) => 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2,
};
// progress of a tween that starts at t0 and lasts d, eased
export const tw = (t, t0, d, e = E.p2o) => (t <= t0 ? 0 : t >= t0 + d ? 1 : e(clamp((t - t0) / Math.max(1e-6, d))));
// a value moved by sequential tweens, each from the value it had when it started (as GSAP's to()): segs [[t0, d, v, ease]]
export const kf = (t, v0, segs) => {
  let v = v0;
  for (const [t0, d, v1, e] of segs) { if (t < t0) return v; const u = tw(t, t0, d, e); if (u < 1) return Array.isArray(v) ? v.map((x, i) => lerp(x, v1[i], u)) : lerp(v, v1, u); v = v1; }
  return v;
};
export const kfc = (t, c0, segs) => { let c = c0; for (const [t0, d, c1, e] of segs) { if (t < t0) return c; const u = tw(t, t0, d, e); if (u < 1) return mix(c, c1, u); c = c1; } return c; };
// the kit's deterministic generator (ledger.js mulberry32) and hash (lib.js F.hash)
export const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const hash = (n, s = 1) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// a size never under the language's information floor (zh 28, en 25)
export const sz = (px, lang) => Math.max(px, LOOK.type.floors[L(lang)].info);
export const fnt = (lang, px, role = 'text', weight = 500) => fontFor(LOOK, role, L(lang), sz(px, lang), weight, null);
// one line; y is the top of a line box `lh` high (the kit's CSS boxes), the text centred in it
export const say = (ctx, s, x, y, lang, px, color, o = {}) => {
  const f = fnt(lang, px, o.role || 'text', o.weight), lh = o.lh || Math.round(f.size * 1.25);
  if (o.alpha === 0) return measure(ctx, s, f).width;
  const blur = o.blur || 0;
  ctx.save(); if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  text(ctx, s, x, y + lh / 2 + f.size * 0.04, f, { color, align: o.align || 'left', baseline: 'middle', alpha: o.alpha ?? 1 });
  ctx.restore();
  return measure(ctx, s, f).width;
};
export const widthOf = (ctx, s, lang, px, role = 'text') => measure(ctx, s, fnt(lang, px, role)).width;
// tabular figures (the kit's .dg: digits 0.6 em, separators 0.4 em); returns the width
// (WenKai, the kit's font, has 0.6 em digits; in English the digit cell is the widest digit of Source Serif 4 at that size)
const digitEm = (ctx, f, lang) => (L(lang) === 'zh' ? 0.6 : Math.max(...'0123456789'.split('').map((d) => measure(ctx, d, f).width)) / f.size);
export const figW = (s, px, em = 0.6) => graphemes(String(s)).reduce((w, g) => w + (/\d/.test(g) ? em : em * 0.66) * px, 0);
export const figures = (ctx, s, x, y, lang, px, color, o = {}) => {
  const f = fontFor(LOOK, 'text', L(lang), px, 500, null), em = digitEm(ctx, f, lang), wd = figW(s, px, em), x0 = o.align === 'right' ? x - wd : x;
  ctx.save(); if ((o.blur || 0) > 0.05) ctx.filter = `blur(${o.blur.toFixed(2)}px)`;
  let cx = x0;
  for (const g of graphemes(String(s))) { const a = (/\d/.test(g) ? em : em * 0.66) * px; text(ctx, g, cx + a / 2, y + px * 0.5, f, { color, align: 'center', baseline: 'middle', alpha: o.alpha ?? 1 }); cx += a; }
  ctx.restore();
  return wd;
};
export const fmtInt = (v, lang) => Math.round(v).toLocaleString('en-US');
// typed text: one grapheme every dt from t0 (dt a number or i → time); returns the x after the last shown grapheme
export const typedOf = (s, t, t0, dt) => { const g = graphemes(s); let n = 0; for (let i = 0; i < g.length; i++) if (t >= (typeof dt === 'function' ? dt(i) : t0 + i * dt)) n = i + 1; return g.slice(0, n).join(''); };

// ── blurs, pops ──────────────────────────────────────────────────────────────────────────────────────────────────────
// the kit's blurIn / blurOut: opacity with a blur of `px` that clears (power2.out 0.2 s in, power1.in out)
export const blurState = (t, on, d = 0.2, off = Infinity, dOff = 0.15, px = 8) => {
  const a = tw(t, on, d, E.p2o) * (1 - tw(t, off, dOff, E.p1i));
  const b = t < off ? (1 - tw(t, on, d, E.p2o)) * px : tw(t, off, dOff, E.p1i) * px;
  return { alpha: a, blur: b };
};

// ── the frame: chapter label, counter, "how" label, illustrative note ────────────────────────────────────────────────
// chapter: { text, at, prev: { text } (a swap), hide: t, show: t }; drawn at (56, 28) with the yellow rule under it
export const drawChapter = (ctx, C, lang, ch, t) => {
  if (!ch || !ch.text || t < ch.at - (ch.prev ? 0 : 0)) { if (ch?.prev && t < ch.at) drawChapter(ctx, C, lang, { text: ch.prev.text, at: -1 }, t); return; }
  const x = 56, y = 28, px = 34, w1 = widthOf(ctx, ch.text, lang, px) + 12;
  const hide = ch.hide != null ? tw(t, ch.hide, 0.25, E.p2i) * (1 - tw(t, ch.show ?? Infinity, 0.35, E.p3o)) : 0;
  if (ch.prev) {
    const w0 = widthOf(ctx, ch.prev.text, lang, px) + 12, u = tw(t, ch.at, 0.18, E.p1i);
    if (u < 1) say(ctx, ch.prev.text, x, y, lang, px, C.chapInk, { lh: 46, alpha: 1 - u, blur: 6 * u });
    const b = blurState(t, ch.at + 0.18, 0.2, Infinity, 0, 6);
    say(ctx, ch.text, x, y, lang, px, C.chapInk, { lh: 46, alpha: b.alpha * (1 - hide), blur: b.blur + 6 * hide });
    const w = lerp(w0, w1, tw(t, ch.at + 0.05, 0.35, E.p2io));
    ctx.fillStyle = C.chapRule; rrect(ctx, x - 6, y + 50, w * (1 - hide), 4, 2); ctx.fill();
    return;
  }
  const b = ch.at < 0 ? { alpha: 1, blur: 0 } : blurState(t, ch.at, 0.4, Infinity, 0, 6);
  say(ctx, ch.text, x, y, lang, px, C.chapInk, { lh: 46, alpha: b.alpha * (1 - hide), blur: b.blur + 6 * hide });
  const s = (ch.at < 0 ? 1 : tw(t, ch.at + 0.1, 0.5, E.p3o)) * (1 - hide);
  if (s > 0) { ctx.fillStyle = C.chapRule; rrect(ctx, x - 6, y + 50, w1 * s, 4, 2); ctx.fill(); }
};
// counter: { segs: [{ t0, t1, value (string), count: [from, to, ease] }], unit, units: [{ text, on, off }], approx: t | null, on, off, blur: [t], jump: [t] }
export const counterValue = (cn, t) => {
  let v = '';
  for (const g of cn.segs || []) if (t >= g.t0 && t < g.t1) v = g.count ? fmtInt(lerp(g.count[0], g.count[1], tw(t, g.t0, (g.count[3] ?? g.t1) - g.t0, E[g.count[2] || 'sine'])), 'en') : g.fn ? String(g.fn(t)) : String(g.value);
  return v;
};
export const drawCounter = (ctx, C, lang, cn, t) => {
  if (!cn || t < (cn.on ?? 0) - 0.01) return;
  const R = 1860, top = 28, px = 112;
  let a = tw(t, cn.on, 0.18, E.p2o) * (1 - tw(t, cn.off ?? Infinity, 0.2, E.p2i)), bl = (1 - tw(t, cn.on, 0.18, E.p2o)) * 8 + tw(t, cn.off ?? Infinity, 0.2, E.p2i) * 8;
  for (const b of cn.blur || []) { const o = tw(t, b, 0.13, E.p2i), i = tw(t, b + 0.18, 0.18, E.p2o); const k = o * (1 - i); a *= 1 - k; bl += 8 * k; }
  let sc = 1;
  for (const j of cn.jump || []) sc = sc * (t < j + 0.07 ? lerp(1, 1.1, tw(t, j, 0.07, E.p2o)) : lerp(1.1, 1, tw(t, j + 0.07, 0.25, E.p2o)));
  const v = counterValue(cn, t), pre = cn.approx != null ? tw(t, cn.approx, 0.15, E.p2o) : 0;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.translate(R, top + px * 0.6); ctx.scale(sc, sc); ctx.translate(-R, -(top + px * 0.6));
  const wd = figures(ctx, v, R, top, lang, px, C.ink, { align: 'right', blur: bl });
  if (pre > 0) say(ctx, cn.pre || (L(lang) === 'zh' ? '约' : '≈'), R - wd - 10, top + 46, lang, 44, C.ink, { lh: 60, align: 'right', alpha: pre, blur: bl });
  ctx.restore(); ctx.restore();
  const r = tw(t, (cn.on ?? 0) + 0.05, 0.5, E.p3o) * (1 - tw(t, (cn.off ?? Infinity) + 0.05, 0.3, E.p2i));
  if (r > 0) { ctx.fillStyle = C.ink; ctx.fillRect(R - 300 * r, top + 118, 300 * r, 2); ctx.fillRect(R - 300 * r, top + 123, 300 * r, 2); }
  for (const u of cn.units || []) {
    const ua = tw(t, u.on, 0.2, E.p2o) * (1 - tw(t, u.off ?? Infinity, 0.15, E.p2i)), ub = (1 - ua) * 6;
    if (ua > 0) say(ctx, u.text, R, top + 136, lang, 30, C.ink, { lh: 40, align: 'right', alpha: ua, blur: ub });
  }
};
// "how" label (sorted by): 28 px at (120, 104), a faint rule under it
export const drawHow = (ctx, C, lang, s, t, on, off = Infinity, at = [120, 104]) => {
  const b = blurState(t, on, 0.2, off, 0.15, 6);
  if (b.alpha <= 0) return;
  const w = say(ctx, s, at[0], at[1], lang, 28, C.ink, { lh: 40, alpha: b.alpha, blur: b.blur });
  ctx.save(); ctx.globalAlpha *= b.alpha; ctx.fillStyle = C.rule; ctx.fillRect(at[0], at[1] + 40, w + 6, 3); ctx.restore();
};
// dashed note for anything illustrative (24 px in the kit; the floor here), grey text in a dashed box
export const drawTag = (ctx, C, lang, s, x, y, alpha = 1) => {
  if (alpha <= 0) return;
  const px = sz(24, lang), w = widthOf(ctx, s, lang, px) + 24, h = px + 12;
  ctx.save(); ctx.globalAlpha *= alpha;
  rrect(ctx, x + 1, y + 1, w - 2, h - 2, 6); ctx.fillStyle = mix(C.panel, C.ground, 0.15); ctx.fill();
  ctx.setLineDash([6, 4]); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  say(ctx, s, x + 12, y, lang, px, C.dim, { lh: h });
  ctx.restore();
  return [x, y, w, h];
};

// ── the light terminal ───────────────────────────────────────────────────────────────────────────────────────────────
// a window at box [x, y, w, h]: 3 px ink frame, radius 12, hard 8/9 px shadow, 40 px title bar with three dots, an
// optional identity square, a title and a right note; inner(ctx) draws the content in window coordinates (inside the
// frame), clipped to it. o: { title, right, sq (a colour), alpha, scale: [sx, sy] about the top left, chrome (0–1) }
export const drawTerm = (ctx, C, lang, [x, y, w, h], o = {}, inner = null) => {
  const a = o.alpha ?? 1;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  if (o.scale) ctx.scale(o.scale[0], o.scale[1]);
  rrect(ctx, 8, 9, w, h, 12); ctx.fillStyle = rgba(C.shadow, 0.14); ctx.fill();
  rrect(ctx, 0, 0, w, h, 12); ctx.fillStyle = C.panel; ctx.fill();
  ctx.save(); rrect(ctx, 3, 3, w - 6, h - 6, 9); ctx.clip(); ctx.translate(3, 3);
  const IW = w - 6;
  ctx.fillStyle = C.ink; ctx.fillRect(0, 37.5, IW, 2.5);
  [C.dotR, C.dotY, C.dotG].forEach((c, i) => { ctx.beginPath(); ctx.arc(16 + 25 * i + 7.5, 18.5, 6.5, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); });
  let tx = 100;
  if (o.sq) { rrect(ctx, 100, 12, 14, 14, 3); ctx.fillStyle = o.sq; ctx.fill(); tx = 124; }
  const bar = sz(26, lang);
  if (o.title) say(ctx, o.title, tx, 0, lang, bar, C.dim, { lh: 38 });
  if (o.right) say(ctx, o.right, IW - 16, 0, lang, bar, C.dim, { lh: 38, align: 'right' });
  if (inner) { ctx.save(); ctx.beginPath(); ctx.rect(0, 40, IW, h - 46); ctx.clip(); inner(ctx, IW, h - 6); ctx.restore(); }
  ctx.restore();
  rrect(ctx, 1.5, 1.5, w - 3, h - 3, 10.5); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
};
// a typed line in a window: prefix as is, then one grapheme every dt; the 4 px caret after it from t0 − 0.05 to caretOff
export const drawTyped = (ctx, C, lang, prefix, s, x, y, t, t0, dt, o = {}) => {
  const px = o.size || 40, lh = o.lh || Math.round(px * 1.6), shown = typedOf(s, t, t0, dt), col = o.color || C.ink;
  const wp = /^›/.test(prefix) ? (chevron(ctx, x + px * 0.12, y + lh / 2, px * 0.42, col), px * 0.62) : say(ctx, prefix, x, y, lang, px, col, { lh });
  const ws = say(ctx, shown, x + wp, y, lang, px, col, { lh, alpha: shown ? 1 : 0 });
  if (o.caret != null && t >= t0 - 0.05 && t < o.caret) { ctx.fillStyle = col; ctx.fillRect(x + wp + ws + 4, y + lh / 2 - px * 0.5 + 6, 4, px); }
  return x + wp + ws;
};
// a log that scrolls: lines [{ text, t, cls: 'ok' | 'me' | 'stop' | '' , fast }], 34 px a line (the kit), `keep` at most
export const drawLog = (ctx, C, lang, lines, [x, y, w, h], t, keep = 3) => {
  const px = sz(26, lang), LH = Math.max(34, px + 6);
  let scroll = 0;
  lines.forEach((ln, k) => { if (k >= keep) scroll += tw(t, ln.t - 0.02, ln.fast ? 0.1 : 0.2, E.p2o); });
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  lines.forEach((ln, k) => {
    let a = tw(t, ln.t, ln.fast ? 0.1 : 0.22, E.p2o);
    const later = lines[k + keep];
    if (later) { const fd = later.fast ? 0.05 : 0.1; a *= 1 - tw(t, later.t - 0.02 - fd, fd, E.p1i); }
    if (a <= 0) return;
    const col = ln.cls === 'ok' ? C.ok : ln.cls === 'me' || ln.cls === 'stop' ? C.accent : C.dim, yy = y + (k - scroll) * LH;
    // a leading ✓ or › is drawn as a stroke (no glyph a subset font may lack)
    const m = /^([✓›])\s*/.exec(ln.text), body = m ? ln.text.slice(m[0].length) : ln.text, dx = m ? px * 0.95 : 0;
    if (m && m[1] === '✓') tick(ctx, x + 2, yy + LH / 2 - px * 0.36, px * 0.6, col, a, 2.6);
    if (m && m[1] === '›') { ctx.save(); ctx.globalAlpha *= a; chevron(ctx, x + 4, yy + LH / 2, px * 0.4, col); ctx.restore(); }
    say(ctx, body, x + dx, yy, lang, px, col, { lh: LH, alpha: a, role: ln.cls === 'me' ? 'text' : 'mono' });
  });
  ctx.restore();
};
// a pill (the kit's .pill: mono 24, 2 px ink frame, radius 8, line 38)
export const drawPill = (ctx, C, lang, s, x, y, o = {}) => {
  const px = sz(24, lang), w = widthOf(ctx, s, lang, px, 'mono') + 28, h = Math.max(42, px + 14), sc = o.scale ?? 1;
  if ((o.alpha ?? 1) <= 0) return w;
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.translate(x, y + h / 2); ctx.scale(sc, sc);
  rrect(ctx, 1, -h / 2 + 1, w - 2, h - 2, 8); ctx.fillStyle = C.pill; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  say(ctx, s, 14, -h / 2, lang, px, C.ink, { lh: h, role: 'mono' });
  ctx.restore();
  return w;
};

// ── chips and labels ─────────────────────────────────────────────────────────────────────────────────────────────────
// chip kinds: c yellow (routine, waiting), g green (allowed), a teal (the machine), m vermilion (a person), n neutral
export const chipColors = (C, k) => ({ c: [C.waitS, C.waitSoft], g: [C.passS, C.passSoft], a: [C.machine, C.machineSoft], m: [C.accent, C.accentSoft], n: [C.line, C.panel] }[k] || [C.waitS, C.waitSoft]);
// a chip landing at `at` (0.32 s, back.out 1.6): from 10 px above, 0.9 scale, upright → its angle `rot`
export const drawChip = (ctx, C, lang, s, x, y, kind, t, at, rot = 0, o = {}) => {
  const u = tw(t, at, 0.32, E.back(1.6)), a = clamp(tw(t, at, 0.32, E.none) * 3);
  if (a <= 0) return;
  const px = sz(28, lang), w = widthOf(ctx, s, lang, px) + 28, h = 44, [st, bg] = chipColors(C, o.kind2 && t >= o.kindAt ? o.kind2 : kind);
  ctx.save(); ctx.globalAlpha *= a * (o.alpha ?? 1); ctx.translate(x + w / 2, y + h / 2 + lerp(-10, 0, u)); ctx.rotate((rot * u * Math.PI) / 180); ctx.scale(lerp(0.9, 1, u), lerp(0.9, 1, u));
  rrect(ctx, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 6); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = st; ctx.lineWidth = 2; ctx.stroke();
  say(ctx, s, -w / 2 + 14, -h / 2, lang, px, C.ink, { lh: h });
  ctx.restore();
};
// the agent's tag (teal, 24 px paper text)
export const drawAgentTag = (ctx, C, lang, s, x, y, alpha = 1) => {
  if (alpha <= 0) return;
  const px = sz(24, lang), w = widthOf(ctx, s, lang, px) + 24, h = px + 12;
  ctx.save(); ctx.globalAlpha *= alpha; rrect(ctx, x, y, w, h, 8); ctx.fillStyle = C.machine; ctx.fill();
  say(ctx, s, x + 12, y, lang, px, C.panel, { lh: h }); ctx.restore();
};

// ── hand-drawn dots and piles (ledger.js) ────────────────────────────────────────────────────────────────────────────
const r1 = (v) => Math.round(v * 10) / 10;
const wobble = (seed, r = 7.6, pct = 7) => {
  const rr = mulberry32(seed * 7919), n = 12, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, w = 1 + ((rr() * 2 - 1) * pct) / 100; pts.push([Math.cos(a) * r * w, Math.sin(a) * r * w]); }
  return pts;
};
const SHAPES = [1, 2, 3, 4, 5, 6].map((s) => wobble(s));
let PATHS = null;
// the six 12-point wobbly circles (about 16 px across), as Path2D (made on first use, in the page)
export const dotPath = (i) => {
  if (!PATHS) PATHS = SHAPES.map((pts) => {
    const p = new Path2D(), n = pts.length;
    p.moveTo(r1((pts[0][0] + pts[n - 1][0]) / 2), r1((pts[0][1] + pts[n - 1][1]) / 2));
    for (let j = 0; j < n; j++) { const a = pts[j], b = pts[(j + 1) % n]; p.quadraticCurveTo(r1(a[0]), r1(a[1]), r1((a[0] + b[0]) / 2), r1((a[1] + b[1]) / 2)); }
    p.closePath(); return p;
  });
  return PATHS[i % 6];
};
// one dot: { x, y, s (scale), a (opacity), fill, stroke }
export const drawDot = (ctx, d, i) => {
  if (d.a <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= d.a; ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
  const p = dotPath(i); ctx.fillStyle = d.fill; ctx.fill(p); ctx.lineWidth = 1.2; ctx.strokeStyle = d.stroke; ctx.stroke(p);
  ctx.restore();
};
export const dotColor = (C, name) => ({ fill: C[name] || C.base, stroke: C[name + 'S'] || C.baseS });
// positions for one pile: an irregular blob relaxed so dots do not overlap (the kit's F.pile, same seeds, same layout)
export const pile = (n, cx, cy, seed, squash = [1.06, 0.94], gap = 20.4) => {
  const rr = mulberry32(seed), R = Math.sqrt((n * gap * gap * 0.92) / Math.PI), ph1 = rr() * 6.28, ph2 = rr() * 6.28;
  const edge = (th) => R * (1 + 0.075 * Math.sin(2 * th + ph1) + 0.05 * Math.sin(3 * th + ph2));
  const pts = [];
  for (let i = 0; i < n; i++) { const th = rr() * Math.PI * 2, u = Math.sqrt(rr()); pts.push([Math.cos(th) * edge(th) * u, Math.sin(th) * edge(th) * u]); }
  const MIN = gap * 0.858, CS = gap;
  for (let it = 0; it < 160; it++) {
    const grid = new Map();
    pts.forEach((p, i) => { const k = Math.floor(p[0] / CS) + ',' + Math.floor(p[1] / CS); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
    for (let i = 0; i < n; i++) {
      const p = pts[i], gx = Math.floor(p[0] / CS), gy = Math.floor(p[1] / CS);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const j of grid.get(gx + dx + ',' + (gy + dy)) || []) {
        if (j <= i) continue;
        const q = pts[j], ex = q[0] - p[0], ey = q[1] - p[1], d = Math.hypot(ex, ey) || 0.01;
        if (d < MIN) { const k = (MIN - d) / 2 / d; p[0] -= ex * k; p[1] -= ey * k; q[0] += ex * k; q[1] += ey * k; }
      }
    }
    for (let i = 0; i < n; i++) {
      const p = pts[i], th = Math.atan2(p[1], p[0]), d = Math.hypot(p[0], p[1]), e = edge(th) * (i % 37 === 0 ? 1.1 : 1);
      if (d > e) { p[0] *= 1 - (0.5 * (d - e)) / d; p[1] *= 1 - (0.5 * (d - e)) / d; } else { p[0] *= 0.997; p[1] *= 0.997; }
    }
  }
  return pts.map((p) => [r1(cx + p[0] * squash[0] + (rr() - 0.5) * 1.6), r1(cy + p[1] * squash[1] + (rr() - 0.5) * 1.6)]);
};
// greedy: slots from the outside in, each takes its nearest free dot (index list `sub`, start positions src(i))
export const assign = (sub, slots, center, src) => {
  const order = slots.map((p, k) => [k, Math.hypot(p[0] - center[0], p[1] - center[1])]).sort((a, b) => b[1] - a[1]);
  const free = new Set(sub), out = new Map();
  for (const [k] of order) {
    let best = null, bd = Infinity;
    for (const o of free) { const p = src(o); const d = (p[0] - slots[k][0]) ** 2 + (p[1] - slots[k][1]) ** 2; if (d < bd) { bd = d; best = o; } }
    free.delete(best); out.set(best, slots[k]);
  }
  return out;
};
// split n dots into groups of the given counts at random (the kit's F.partition): returns group index per dot
export const partition = (n, counts, seed) => {
  const rr = mulberry32(seed), idx = [...Array(n).keys()];
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const g = new Array(n).fill(-1); let k = 0;
  counts.forEach((c, gi) => { for (let m = 0; m < c && k < n; m++) g[idx[k++]] = gi; });
  return g;
};
// rank 0–1 by a key (left to right by default)
export const rank = (sub, key) => { const s = sub.slice().sort((a, b) => key(a) - key(b)), m = new Map(); s.forEach((o, k) => m.set(o, k / Math.max(1, s.length - 1))); return m; };

// ── the ruled ledger page ────────────────────────────────────────────────────────────────────────────────────────────
// page coordinates are the screen's at full size; pose { x, y, s } places it; frame and title (card mode), rules and margin
export const drawLedgerPage = (ctx, C, lang, pose, o = {}) => {
  ctx.save(); ctx.translate(pose.x, pose.y); ctx.scale(pose.s, pose.s);
  if ((o.frame ?? 0) > 0) {
    ctx.save(); ctx.globalAlpha *= o.frame;
    rrect(ctx, 26, 30, W, H, 30); ctx.fillStyle = rgba(C.shadow, 0.14); ctx.fill();
    rrect(ctx, 0, 0, W, H, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = C.ink; rrect(ctx, 4.5, 4.5, W - 9, H - 9, 25.5); ctx.stroke();
    ctx.restore();
  }
  if ((o.rules ?? 1) > 0) {
    ctx.save(); ctx.globalAlpha *= o.rules ?? 1;
    const end = LOOK.grid.ruleEnd, fade = end * 0.92;
    for (let y = 95; y < 95 + H - 310; y += 48) {
      const g = ctx.createLinearGradient(0, 0, end, 0); g.addColorStop(0, rgba(C.ruling, 0.14)); g.addColorStop(fade / end, rgba(C.ruling, 0.14)); g.addColorStop(1, rgba(C.ruling, 0));
      ctx.fillStyle = g; ctx.fillRect(0, y, end, 1.5);
    }
    ctx.fillStyle = rgba(C.margin, 0.38); ctx.fillRect(84, 0, 1.5, H - 214); ctx.fillRect(84 + 8 - 1.5 + 3, 0, 1.5, H - 214);
    ctx.restore();
  }
  if ((o.title ?? 0) > 0 && o.text) say(ctx, o.text, 130, 40, lang, 96, C.dim, { lh: 120, alpha: o.title });
  if (o.dots) o.dots(ctx);
  ctx.restore();
};

// ── the wall of small windows (wall.js) ──────────────────────────────────────────────────────────────────────────────
export const wallSlots = (o = {}) => { const s = [], cols = o.cols || 6, rows = o.rows || 4, x0 = o.x0 ?? 130, y0 = o.y0 ?? 200, dx = o.dx || 172, dy = o.dy || 118; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s.push([x0 + c * dx, y0 + r * dy]); return s; };
export const wallRows = (n, seed) => { const rnd = mulberry32(seed || 20261027); return [...Array(n)].map(() => [32, 50, 68].map(() => 50 + Math.round(rnd() * 70))); };
// a small window (150 × 96) at its top left, scale about its top left; ck 0–1 its teal tick
export const drawMini = (ctx, C, x, y, rows, o = {}) => {
  const a = o.alpha ?? 1, s = o.scale ?? 1;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, 4, 4, 150, 96, 7); ctx.fillStyle = rgba(C.shadow, 0.12); ctx.fill();
  rrect(ctx, 0, 0, 150, 96, 7); ctx.fillStyle = C.panel; ctx.fill();
  ctx.fillStyle = C.ink; ctx.fillRect(2, 18, 146, 1.5);
  [C.dotR, C.dotY, C.dotG].forEach((c, i) => { ctx.beginPath(); ctx.arc(2 + 7 + 11 * i + 3.5, 2 + 5 + 3.5, 3.5, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.stroke(); });
  rows.forEach((w, k) => { rrect(ctx, 14, 2 + [32, 50, 68][k], w, 7, 3.5); ctx.fillStyle = mix(C.rule, C.panel, 0.15); ctx.fill(); });
  if ((o.ck ?? 0) > 0) tick(ctx, 150 - 7 - 16, 12, 14, C.machine, o.ck, 2.5);
  rrect(ctx, 1, 1, 148, 94, 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
};
// the prompt sign › drawn as a stroke, its left tip at x
export const chevron = (ctx, x, y, s, color) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, s * 0.16); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y - s * 0.42); ctx.lineTo(x + s * 0.4, y); ctx.lineTo(x, y + s * 0.42); ctx.stroke(); ctx.restore(); };
// a tick drawn as a stroke (no glyph a font may lack)
export const tick = (ctx, x, y, s, color, a = 1, lw = 3) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y + s * 0.5); ctx.lineTo(x + s * 0.38, y + s * 0.85); ctx.lineTo(x + s, y + s * 0.1); ctx.stroke(); ctx.restore(); };

// ── polylines drawn on (rails, arrows, hand marks) ───────────────────────────────────────────────────────────────────
// sample a path given as [['M', x, y], ['L', x, y], ['C', x1, y1, x2, y2, x, y], ['Q', x1, y1, x, y]] into points
export const sample = (cmds, n = 24) => {
  const pts = []; let p = [0, 0];
  for (const c of cmds) {
    if (c[0] === 'M') { p = [c[1], c[2]]; pts.push(p); }
    else if (c[0] === 'L') { p = [c[1], c[2]]; pts.push(p); }
    else if (c[0] === 'C' || c[0] === 'Q') {
      const q = c[0] === 'Q' ? [p[0] + (2 / 3) * (c[1] - p[0]), p[1] + (2 / 3) * (c[2] - p[1]), c[3] + (2 / 3) * (c[1] - c[3]), c[4] + (2 / 3) * (c[2] - c[4]), c[3], c[4]] : c.slice(1);
      for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u; pts.push([v * v * v * p[0] + 3 * v * v * u * q[0] + 3 * v * u * u * q[2] + u * u * u * q[4], v * v * v * p[1] + 3 * v * v * u * q[1] + 3 * v * u * u * q[3] + u * u * u * q[5]]); }
      p = [q[4], q[5]];
    }
  }
  return pts;
};
export const lengths = (pts) => { const L0 = [0]; for (let i = 1; i < pts.length; i++) L0.push(L0[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L0; };
// the point at fraction f of a sampled polyline
export const pointAt = (pts, f, Ls = lengths(pts)) => {
  const s = clamp(f) * Ls[Ls.length - 1];
  let i = 1; while (i < Ls.length - 1 && Ls[i] < s) i++;
  const a = pts[i - 1], b = pts[i], u = (s - Ls[i - 1]) / Math.max(1e-6, Ls[i] - Ls[i - 1]);
  return [lerp(a[0], b[0], clamp(u)), lerp(a[1], b[1], clamp(u))];
};
// stroke the part of a polyline between fractions f0 and f1
export const strokePart = (ctx, pts, f0, f1, Ls = lengths(pts)) => {
  if (f1 <= f0) return;
  const tot = Ls[Ls.length - 1], s0 = f0 * tot, s1 = f1 * tot;
  ctx.beginPath(); let started = false;
  for (let i = 1; i < pts.length; i++) {
    if (Ls[i] < s0) continue;
    const a = pts[i - 1], b = pts[i], segL = Math.max(1e-6, Ls[i] - Ls[i - 1]);
    if (!started) { const u = clamp((s0 - Ls[i - 1]) / segL); ctx.moveTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); started = true; }
    if (Ls[i] >= s1) { const u = clamp((s1 - Ls[i - 1]) / segL); ctx.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); break; }
    ctx.lineTo(b[0], b[1]);
  }
  ctx.stroke();
};

// ── hand marks (hand.js): vermilion 4.5 px smooth strokes ────────────────────────────────────────────────────────────
export const braceV = (x, y0, y1, s) => { const m = (y0 + y1) / 2, X = (v) => x + s * v; return [['M', X(20), y0], ['C', X(4), y0, X(0), y0 + 10, X(0), y0 + 30], ['L', X(-1), m - 27], ['C', X(-2), m - 9, X(-7), m - 3, X(-22), m], ['C', X(-7), m + 3, X(-2), m + 9, X(-1), m + 27], ['L', X(0), y1 - 30], ['C', X(0), y1 - 10, X(4), y1, X(20), y1]]; };
export const braceH = (y, x0, x1, s) => { const m = (x0 + x1) / 2, Y = (v) => y + s * v; return [['M', x0, Y(20)], ['C', x0, Y(4), x0 + 10, Y(0), x0 + 30, Y(0)], ['L', m - 27, Y(-1)], ['C', m - 9, Y(-2), m - 3, Y(-7), m, Y(-22)], ['C', m + 3, Y(-7), m + 9, Y(-2), m + 27, Y(-1)], ['L', x1 - 30, Y(0)], ['C', x1 - 10, Y(0), x1, Y(4), x1, Y(20)]]; };
export const underlineCmds = (x0, x1, y) => [['M', x0 - 4, y + 3], ['C', x0 + (x1 - x0) * 0.3, y - 3, x0 + (x1 - x0) * 0.65, y + 7, x1 - 4, y]];
export const ellipsePts = (cx, cy, rx, ry, n = 96) => [...Array(n + 1)].map((_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
// a mark: { kind: 'brace' | 'underline' | 'circle', … geometry }, drawn on over d from at (brace: from its middle out)
export const markPts = (m) => (m.kind === 'circle' ? ellipsePts(m.cx, m.cy, m.rx, m.ry) : sample(m.kind === 'brace' ? (m.side === 'left' || m.side === 'right' ? braceV(m.x, m.y0, m.y1, m.side === 'left' ? 1 : -1) : braceH(m.y, m.x0, m.x1, m.side === 'top' ? 1 : -1)) : underlineCmds(m.x0, m.x1, m.y), 20));
export const drawMark = (ctx, C, m, t, pts = markPts(m)) => {
  const d = m.d ?? (m.kind === 'brace' ? 0.55 : m.kind === 'circle' ? 0.45 : 0.5), u = tw(t, m.at, d, m.kind === 'brace' ? E.p2o : E.p2io), out = m.off != null ? tw(t, m.off, 0.2, E.p1i) : 0;
  if (u <= 0 || out >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - out; ctx.strokeStyle = C.accent; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (m.kind === 'brace') strokePart(ctx, pts, 0.5 - u / 2, 0.5 + u / 2); else strokePart(ctx, pts, 0, u);
  ctx.restore();
};

// ── the stamp and its imprint (stamp.js) ─────────────────────────────────────────────────────────────────────────────
// stamp pose { x, y, s, a, hollow (0–1) }: a 64 px rounded vermilion square, an inner frame, one paper glyph (我 by default)
export const drawStamp = (ctx, C, lang, st, glyph) => {
  if (st.a <= 0) return;
  const h = clamp(st.hollow || 0);
  ctx.save(); ctx.globalAlpha *= st.a; ctx.translate(st.x, st.y); ctx.scale(st.s, st.s);
  rrect(ctx, -32, -32, 64, 64, 10); ctx.fillStyle = mix(C.accent, C.paper, h); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.accent; ctx.stroke();
  rrect(ctx, -26, -26, 52, 52, 6); ctx.lineWidth = 1.5; ctx.strokeStyle = mix(C.accentRing, C.paper, h); ctx.stroke();
  // one glyph (我) at 40 px; a Latin word (Me) shrinks to fit the 46 px inside the inner frame
  const f0 = fontFor(LOOK, 'text', L(lang), 40, 600, null), w0 = measure(ctx, glyph, f0).width, f = { ...f0, size: Math.round(40 * Math.min(1, 44 / Math.max(1, w0))) };
  text(ctx, glyph, 0, 1, f, { color: mix(C.paper, C.accent, h), align: 'center', baseline: 'middle' });
  ctx.restore();
};
// a hollow round imprint where the stamp pressed (r ≥ 21 so its glyph stays ≥ 24 px)
export const drawImprint = (ctx, C, lang, x, y, t, at, glyph, r = 30) => {
  const u = tw(t, at, 0.12, E.p3o);
  if (u <= 0) return;
  ctx.save(); ctx.globalAlpha *= u; ctx.translate(x, y); ctx.scale(lerp(1.5, 1, u), lerp(1.5, 1, u));
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = rgba(C.accent, 0.1); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.accent; ctx.stroke();
  const f0 = fontFor(LOOK, 'text', L(lang), Math.round(r * 1.15), 600, null), w0 = measure(ctx, glyph, f0).width;
  text(ctx, glyph, 0, 1, { ...f0, size: Math.round(f0.size * Math.min(1, (r * 1.45) / Math.max(1, w0))) }, { color: C.accent, align: 'center', baseline: 'middle' });
  ctx.restore();
};
// the stamp's pose at t from its moves: { at: [x, y], in: t (drops in 1.6 → 1, 0.22 s), presses: [{ x, y, t, hop, rest }],
// moves: [{ t, d, to: [x, y] }], hollow: [[t, on]], out: t }
export const stampPose = (sp, t) => {
  let x = sp.at[0], y = sp.at[1];
  const segs = [];
  for (const m of sp.moves || []) segs.push({ t0: m.t, d: m.d ?? 0.55, to: m.to, e: E.p2io });
  for (const p of sp.presses || []) {
    if (p.hop !== false) segs.push({ t0: p.t - 0.4, d: 0.25, to: [p.x, p.y - 64], e: E.p2io });
    segs.push({ t0: p.t - 0.13, d: 0.12, to: [p.x, p.y], e: E.p3i });
    segs.push({ t0: p.t + 0.12, d: p.rest ? 0.3 : 0.18, to: p.rest || [p.x, p.y - 64], e: E.p2o });
  }
  segs.sort((a, b) => a.t0 - b.t0);
  for (const g of segs) { if (t < g.t0) break; const u = tw(t, g.t0, g.d, g.e); x = lerp(x, g.to[0], u); y = lerp(y, g.to[1], u); if (u < 1) break; }
  let s = sp.in != null ? lerp(1.6, 1, tw(t, sp.in, 0.22, E.p3i)) : 1, a = sp.in != null ? tw(t, sp.in, 0.22, E.p3i) : 1;
  for (const p of sp.presses || []) s *= t < p.t + 0.05 ? lerp(1, 0.88, tw(t, p.t, 0.05, E.p2i)) : lerp(0.88, 1, tw(t, p.t + 0.05, 0.12, E.p2o));
  if (sp.out != null) a *= 1 - tw(t, sp.out, 0.2, E.p2i);
  let hollow = sp.hollow0 ? 1 : 0;
  for (const [ht, on] of sp.hollow || []) if (t >= ht) hollow = on ? tw(t, ht + 0.1, 0.25, E.none) : 1 - tw(t, ht + 0.06, 0.12, E.none);
  return { x, y, s, a, hollow };
};

// ── session windows with lamps, the rope (sessions.js) ───────────────────────────────────────────────────────────────
export const SESS_BOXES = [[470, 222, 510, 290], [1006, 222, 510, 290], [470, 556, 510, 290], [1006, 556, 510, 290]];
export const lampXY = (b, k) => [b[0] + 3 + 26 + k * 30 + 9, b[1] + 3 + b[3] - 98 + 9];
export const drawLamp = (ctx, C, x, y, lit) => { ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = mix(C.panel, C.lamp, clamp(lit)); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.lampS; ctx.stroke(); };
// a rope from a to b: slack quadratic (sag) drawn on (0.35 s power3.out), pulled straight (0.3 s back.out 2.2), reeled in
export const drawRope = (ctx, C, a, b, t, at, o = {}) => {
  const sag = o.sag ?? 60, k = o.tight != null ? tw(t, o.tight, 0.3, E.back(2.2)) : 0, mx = (a[0] + b[0]) / 2, my = lerp((a[1] + b[1]) / 2 + sag, (a[1] + b[1]) / 2, k);
  const pts = sample([['M', a[0], a[1]], ['Q', mx, my, b[0], b[1]]], 32), u = tw(t, at, o.d ?? 0.35, E.p3o), drop = o.drop != null ? tw(t, o.drop, 0.18, E.p2i) : 0;
  if (u <= 0 || drop >= 1) return;
  ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.lineCap = 'round'; strokePart(ctx, pts, drop, u); ctx.restore();
};

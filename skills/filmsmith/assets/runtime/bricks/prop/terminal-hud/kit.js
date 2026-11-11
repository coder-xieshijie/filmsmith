// terminal-hud/kit.js — the engine of the phosphor bricks, drawn on canvas: the ground stack (radial ground, breathing
// glow disc, 160 px accent grid, + crosses), the post stack (tube vignette, 2 px scanlines, seeded grain) of the
// `crt` screen, the two voices of type (striped display type in a titleHi → titleLo gradient; mono for what the
// machine says), decoding in reading order, typing at a block cursor, windows with their bar, chips, the HUD, and the
// four energy shots (burst, sphere, tunnel, horizon) copied from the template's fx.js.
// From the phosphor template (assets/templates/phosphor/film.js, fx.js, index.html CSS). The template is DOM and GSAP;
// these are the same layouts and timings as pure functions of time. Chinese: the decode flickers each Chinese cell
// through the line's own Chinese characters and a fixed pool of dense, common characters (never Latin letters), Latin
// cells through the line's own letters, digits stay (a numeral flickers through symbols); emphasis is marked in the
// copy (`*word*`), never found by matching Latin word characters.
import { canvasOf, lerp, rgba, hexToRgb, text as drawText, measure } from '../../../handoffs/util.js';
import { mulberry32, hash } from '../../../rng.js';
import { fontFor, caseOf, graphemes, isCJK, readTime, breaks, units } from '../../lang.js';
import LOOK from '../../look/night-terminal/look.js';

export { canvasOf, lerp, rgba, readTime, graphemes, breaks, hash, LOOK };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const zh = (L) => L === 'zh';
export const E = {
  lin: (u) => clamp(u), p1In: (u) => clamp(u) ** 2, p2Out: (u) => 1 - (1 - clamp(u)) ** 3, p3Out: (u) => 1 - (1 - clamp(u)) ** 4, p3In: (u) => clamp(u) ** 4,
  expoOut: (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - 2 ** (-10 * u)), expoIn: (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 2 ** (10 * u - 10)),
  expoInOut: (u) => { u = clamp(u); return u === 0 ? 0 : u === 1 ? 1 : u < 0.5 ? 2 ** (20 * u - 10) / 2 : (2 - 2 ** (-20 * u + 10)) / 2; },
  p2In: (u) => clamp(u) ** 3, sine: (u) => -(Math.cos(Math.PI * clamp(u)) - 1) / 2,
  back: (s = 1.8) => (u) => { u = clamp(u); const c3 = s + 1; return 1 + c3 * (u - 1) ** 3 + s * (u - 1) ** 2; },
};
export const tw = (t, t0, d, e = E.expoOut) => e((t - t0) / Math.max(1e-6, d));
// ── type: F(role, L, size, weight); labels in capitals tracked (Latin), as written in Chinese ──────────────────
export const F = (role, L, size, weight = 800) => fontFor(LOOK, role === 'display' ? 'display' : role === 'mono' ? 'mono' : 'text', L, size, weight, role === 'display' ? 'display' : null);
export const label = (s, L) => caseOf(String(s ?? ''), LOOK, 'label', L).text;
export const W = (ctx, s, f) => measure(ctx, String(s ?? ''), f).width;
export const fit = (ctx, s, f, maxW, min) => { let z = f.size; while (z > min && W(ctx, s, { ...f, size: z, spacing: (f.spacing / f.size) * z }) > maxW) z -= 2; return { ...f, size: z, spacing: (f.spacing / f.size) * z }; };
// top-aligned text (y is the top of the em box, as a DOM line)
export const at = (ctx, s, x, y, f, color, { align = 'left', alpha = 1 } = {}) => { if (alpha <= 0 || s == null || s === '') return; drawText(ctx, String(s), x, y + f.size * 0.82, f, { color, align, baseline: 'alphabetic', alpha }); };
export const rect = (ctx, x, y, w, h, color, alpha = 1) => { if (w <= 0 || h <= 0 || alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.restore(); };
export const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
// ── display type: the neutral gradient, the raster's stripes (crt), an optional RGB split ────────────────────────
const scratch = { c: null };
export const display = (ctx, s, x, y, f, P, { align = 'left', alpha = 1, screen = 'crt', grad = 'title', split = 0, scale = 1, glow = 0 } = {}) => {
  if (alpha <= 0 || !s) return 0;
  const w = W(ctx, s, f), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, h = Math.ceil(f.size * 1.25) + 8;
  if (!scratch.c) scratch.c = canvasOf(1920, 400);
  const c = scratch.c, g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, Math.min(c.height, h + 4));
  const gr = g.createLinearGradient(0, 0, 0, f.size * 1.05);
  if (grad === 'accent') { gr.addColorStop(0, P.hi); gr.addColorStop(0.45, P.accent); gr.addColorStop(1, P.deep); } else { gr.addColorStop(0.1, P.titleHi); gr.addColorStop(0.95, P.titleLo); }
  drawText(g, String(s), 4, f.size * 0.86, f, { color: gr, baseline: 'alphabetic' });
  if (screen === 'crt') { g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.38)'; for (let yy = 4; yy < h; yy += 6) g.fillRect(0, yy, c.width, 2); g.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(x0 + w / 2, y + f.size * 0.45); ctx.scale(scale, scale); ctx.translate(-(x0 + w / 2), -(y + f.size * 0.45));
  if (glow > 0) { ctx.shadowColor = rgba(P.accent, glow); ctx.shadowBlur = 30; }
  if (split > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha *= 0.8; drawText(ctx, String(s), x0 + split, y + f.size * 0.82, f, { color: P.bad }); drawText(ctx, String(s), x0 - split, y + f.size * 0.82, f, { color: P.key }); ctx.restore(); }
  ctx.drawImage(c, 0, 0, Math.min(c.width, w + 12), h, x0 - 4, y - f.size * 0.04, Math.min(c.width, w + 12), h);
  ctx.restore();
  return w;
};
// ── decode in reading order: each cell flickers through its own pool and locks left to right ─────────────────────
const HEX = '0123456789abcdef', NUMSYM = '#%&*@';
// dense, common characters: a Chinese cell never flickers through Latin letters, and these keep the line's weight
export const ZH_POOL = '码程序终端运行检查通过锁定部署节点密钥数据测试修复回放验证构建发布';
export const decodeAt = (str, t, t0, dur, seed = 1) => {
  const g = graphemes(String(str ?? ''));
  if (t >= t0 + dur) return g.join('');
  if (t < t0) return '';
  const isHex = /^[0-9a-f]{6,}$/i.test(g.join('').replace(/[\s.…]/g, ''));
  const latin = [...new Set(g.filter((c) => /[A-Za-z]/.test(c)))].join('') || 'XKQZW';
  const han = [...new Set(g.filter((c) => isCJK(c)))].join('') + ZH_POOL;
  const n = g.length, u = (t - t0) / dur, step = Math.floor((t - t0) * 30);
  return g.map((c, i) => {
    if (u >= (i + 1) / (n + 1) * 1.0 + 0.0001 && u > i / n) return c;     // locked, left to right
    if (c === ' ' || /[·.,:;!?—\-→/()[\]{}<>|'"`]/.test(c)) return c;
    const r = hash(i * 131 + step * 7, seed);
    if (/[0-9]/.test(c)) return isHex ? HEX[Math.floor(r * 16)] : NUMSYM[Math.floor(r * NUMSYM.length)];
    if (isCJK(c)) return han[Math.floor(r * han.length)];
    return isHex ? HEX[Math.floor(r * 16)] : latin[Math.floor(r * latin.length)];
  }).join('');
};
// typed text: the first n graphemes at cps from t0
export const typedAt = (str, t, t0, cps) => { const g = graphemes(String(str ?? '')); if (t < t0) return ''; return g.slice(0, clamp(Math.floor((t - t0) * cps) + 1, 0, g.length)).join(''); };
// emphasis marked in the copy: '*word*' → [{ t, em }]
export const marks = (s) => String(s ?? '').split(/(\*[^*]+\*)/).filter(Boolean).map((p) => (p.startsWith('*') && p.endsWith('*') ? { t: p.slice(1, -1), em: true } : { t: p, em: false }));
export const plain = (s) => String(s ?? '').replace(/\*/g, '');
// ── ground and post ───────────────────────────────────────────────────────────────────────────────────────────
export const ground = (ctx, P, t = 0, { bpm = 124 } = {}) => {
  const g = ctx.createRadialGradient(960, 540, 0, 960, 540, 1200);
  g.addColorStop(0, P.groundHi); g.addColorStop(0.55, P.ground); g.addColorStop(1, P.groundLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
  const bars4 = (16 * 60) / bpm, br = 0.967 + 0.033 * (0.5 + 0.5 * Math.cos((2 * Math.PI * t) / bars4)), R = 400 * br;
  const gl = ctx.createRadialGradient(960, 540, 0, 960, 540, R);
  gl.addColorStop(0, rgba(P.accent, 0.11)); gl.addColorStop(0.65, rgba(P.accent, 0)); gl.addColorStop(1, rgba(P.accent, 0));
  ctx.fillStyle = gl; ctx.fillRect(0, 0, 1920, 1080);
  const ox = -((160 * t) / 60) % 160, oy = -((80 * t) / 60) % 160;
  ctx.save(); ctx.strokeStyle = rgba(P.accent, 0.05); ctx.lineWidth = 1; ctx.beginPath();
  for (let x = ox; x < 1920; x += 160) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, 1080); }
  for (let y = oy; y < 1080; y += 160) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(1920, Math.round(y) + 0.5); }
  ctx.stroke();
  ctx.strokeStyle = rgba(P.muted, 0.18); ctx.beginPath();
  for (let x = 160; x < 1920; x += 320) for (let y = 160; y < 1080; y += 320) { ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); }
  ctx.stroke(); ctx.restore();
};
const grainCache = new Map();
export const post = (ctx, P, t = 0, { screen = 'crt', seed = 11, dim = 0, flash = 0 } = {}) => {
  ctx.save();
  if (screen === 'crt') {
    const v = ctx.createRadialGradient(960, 540, 0, 960, 540, 1100);
    v.addColorStop(0.55, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 2; y < 1080; y += 3) ctx.fillRect(0, y, 1920, 1);
  }
  let G = grainCache.get(seed);
  if (!G) { G = []; for (let k = 0; k < 4; k++) { const c = canvasOf(256, 256), g = c.getContext('2d'), im = g.createImageData(256, 256), r = mulberry32(seed * 31 + k); for (let i = 0; i < 65536; i++) { const v = 128 + (r() - 0.5) * 90; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); G.push(c); } grainCache.set(seed, G); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.5 * 0.35; ctx.fillStyle = ctx.createPattern(G[Math.floor(t * 12) % 4], 'repeat'); ctx.fillRect(0, 0, 1920, 1080);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (dim > 0) rect(ctx, 0, 0, 1920, 1080, '#000000', 0.9 * dim);
  if (flash > 0) rect(ctx, 0, 0, 1920, 1080, P.hi, flash);
  ctx.restore();
};
// ── furniture ─────────────────────────────────────────────────────────────────────────────────────────────────
export const win = (ctx, P, L, x, y, w, h, title, right, { alpha = 1, dots = true } = {}) => {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  rr(ctx, x, y, w, h, 10); ctx.fillStyle = rgba(P.panel, 0.88); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.stroke();
  rect(ctx, x, y + 54, w, 2, P.line);
  const f = F('mono', L, zh(L) ? 28 : 25, 400);
  let tx = x + 22;
  if (dots) { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(tx + 6 + i * 22, y + 27, 6, 0, Math.PI * 2); ctx.fillStyle = P.line; ctx.fill(); } tx += 76; }
  at(ctx, title, tx, y + 27 - f.size * 0.6, f, P.muted);
  if (right) at(ctx, right, x + w - 22, y + 27 - f.size * 0.6, f, P.muted, { align: 'right' });
  ctx.restore();
};
export const chip = (ctx, P, L, s, x, y, { size = 32, on = false, lit = 0, alpha = 1, pad = [30, 16], track = 0.06 } = {}) => {
  const f = { ...F('mono', L, zh(L) ? Math.max(size, 28) : size, 500), spacing: zh(L) ? 0 : track * size }, w = W(ctx, s, f) + pad[0] * 2, h = f.size + pad[1] * 2;
  if (alpha <= 0) return w;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (lit > 0) { ctx.shadowColor = rgba(P.accent, 0.22 + 0.48 * lit); ctx.shadowBlur = 22 + 28 * lit; }
  rr(ctx, x, y, w, h, 4); ctx.fillStyle = on ? P.accent : rgba(P.panel, 0.85); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = on ? P.accent : P.line; ctx.lineWidth = 2; ctx.stroke();
  at(ctx, s, x + pad[0], y + pad[1], f, on ? P.onAccent : P.ink);
  ctx.restore();
  return w;
};
export const cursor = (ctx, P, x, y, w, h, on = true, alpha = 1) => { if (on) rect(ctx, x, y, w, h, P.ink, alpha); };
// blink on the half beat: on for the first half of each half beat
export const blinkOn = (t, t0, beat) => t < t0 || Math.floor(((t - t0) / (beat / 2)) + 1e-6) % 2 === 0;
// ── the HUD: brand and tag top left, licence top right, chapter [nn/NN] bottom left, the progress bar, corners ──
export const hudDefaults = { en: { brand: 'reseed', tag: '// v1.0', licence: 'Open source · MIT', mark: '[01/03]', section: 'Catch the run', progress: 0.5 }, zh: { brand: 'reseed', tag: '// v1.0', licence: '开源 · MIT', mark: '[01/03]', section: '抓住这次运行', progress: 0.5 } };
export const hud = (ctx, P, L, h, { alpha = 1, progress = null } = {}) => {
  if (!h || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  const f = F('mono', L, zh(L) ? 28 : 25, 400), fb = F('mono', L, zh(L) ? 28 : 25, 500), tr = { ...f, spacing: zh(L) ? 0 : 0.18 * f.size }, ts = { ...f, spacing: zh(L) ? 0 : 0.12 * f.size };
  logo(ctx, P, 70, 38, 30);
  const bw = W(ctx, h.brand, fb); at(ctx, h.brand, 112, 40, fb, P.ink); at(ctx, h.tag, 124 + bw, 40, f, P.muted);
  const lw = W(ctx, label(h.licence, L), tr); at(ctx, label(h.licence, L), 1846, 42, tr, P.muted, { align: 'right' });
  ctx.beginPath(); ctx.arc(1846 - lw - 17, 42 + f.size * 0.5, 5, 0, Math.PI * 2); ctx.fillStyle = P.muted; ctx.fill();
  // bottom left: the chapter mark ([01/03], [>>] for the install, [00] for the close) and the section (the brand's
  // name, as on the close, stays as written)
  if (h.mark || h.section) at(ctx, `${h.mark || ''}${h.mark && h.section ? '  ' : ''}${h.section ? (h.section === h.brand ? h.section : label(h.section, L)) : ''}`, 74, 1080 - 42 - f.size, ts, P.muted);
  const pg = progress ?? h.progress ?? 0, g = ctx.createLinearGradient(0, 0, 1920, 0); g.addColorStop(0, rgba(P.muted, 0.2)); g.addColorStop(1, P.muted);
  ctx.fillStyle = g; ctx.fillRect(0, 1076, 1920 * clamp(pg), 4);
  ctx.strokeStyle = rgba(P.muted, 0.45); ctx.lineWidth = 2;
  [[38, 34, 1, 1], [1882, 34, -1, 1], [38, 1046, 1, -1], [1882, 1046, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * 34); ctx.lineTo(x, y); ctx.lineTo(x + sx * 34, y); ctx.stroke(); });
  ctx.restore();
};
// the HUD at a point of the scene (k in 0–1): `progress` may be [from, to] across the scene (the film's position)
export const hudAt = (h, k) => (h && Array.isArray(h.progress) ? { ...h, progress: h.progress[0] + (h.progress[1] - h.progress[0]) * clamp(k) } : h);
// the brand mark (the template's LOGO.prompt): a rounded square, a chevron in muted, an underscore in ink
export const logo = (ctx, P, x, y, px) => {
  const k = px / 40; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  rr(ctx, 2, 2, 36, 36, 8); ctx.strokeStyle = P.muted; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, 13); ctx.lineTo(17, 20); ctx.lineTo(10, 27); ctx.stroke();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(20, 27); ctx.lineTo(30, 27); ctx.stroke(); ctx.restore();
};
// icons before a URL (the template's ICON): the GitHub mark (Octicons mark-github, MIT) and a link
const GH = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';
export const icon = (ctx, P, kind, x, y, px, alpha = 1) => {
  if (!kind || kind === 'none' || alpha <= 0 || typeof Path2D === 'undefined') return 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  if (kind === 'github') { ctx.scale(px / 16, px / 16); ctx.fillStyle = P.ink; ctx.fill(new Path2D(GH)); }
  else { ctx.scale(px / 24, px / 24); ctx.strokeStyle = P.ink; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.stroke(new Path2D('M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1')); ctx.stroke(new Path2D('M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1')); }
  ctx.restore(); return px;
};
// ── reading: primary strings one after another from SEEN after they land, glance ≥ 1 s in parallel, holds ────
export const SEEN = 0.25;
export const needSec = (reads, L) => {
  let prim = 0, end = 0;
  for (const [t, s, o = {}] of [...reads].filter((r) => r[1]).sort((a, b) => a[0] - b[0])) {
    const x = plain(Array.isArray(s) ? s.join(' ') : s);
    if (o.glance) end = Math.max(end, t + SEEN + 1); else { prim = Math.max(prim, t + SEEN) + readTime(x, L); end = Math.max(end, prim); }
    if (o.hold) end = Math.max(end, t + o.hold);
  }
  return end;
};
export const beatsOf = (sec, bpm, min = 0) => Math.max(min, Math.ceil((sec * bpm) / 60 - 1e-6));
// the palette: the look's preset by id, overridden by the host's resolved colours
export const palOf = (colors, id = 'ice') => ({ ...(LOOK.palettes.find((p) => p.id === id) || LOOK.palettes.find((p) => p.id === 'ice')).roles, ...(colors || {}) });
// the template's reading session (events.js): moves end the picture's motion; primary text adds up in reading order
// from SEEN after it starts entering; glance text needs 1 s still alongside; `done` is when all of it has been read
export const reader = (L) => {
  const R = { prim: 0, done: 0, moves: [] };
  R.move = (t, d = 0) => { R.moves.push([t, t + d]); R.done = Math.max(R.done, t + d); return t; };
  R.at = (t) => { R.done = Math.max(R.done, t); return t; };
  // code (commands, URLs, hashes) reads as Latin in either language: pass lang 'en' for it
  R.primary = (t, s, lang = L) => { const x = plain([s].flat(Infinity).filter(Boolean).join(' ')); if (!x) return R.prim; R.prim = Math.max(R.prim, t) + readTime(x, lang); R.done = Math.max(R.done, R.prim); return R.prim; };
  R.typed = (t, s, cps, lang = L) => { const n = graphemes(String(s ?? '')).length; R.primary(t + SEEN, s, lang); R.prim = Math.max(R.prim, t + n / cps); R.done = Math.max(R.done, R.prim); return R.prim; };
  R.glance = (t, s) => { if ([s].flat(Infinity).filter(Boolean).length) R.done = Math.max(R.done, t + 1); return t + 1; };
  R.pause = (t, d) => R.at(t + d);
  return R;
};
export const half = (t, B) => Math.ceil(t / (B / 2) - 1e-6) * (B / 2);
export const onBeat = (t, B) => Math.ceil(t / B - 1e-6) * B;
// typing pace of a primary line: its base, slowed (never under 24 cps) so it ends ≤ 1.6 beats before it is read
export const paceCps = (str, base, B, L) => { const len = graphemes(String(str || '')).length, sec = readTime(plain(str), L); return clamp(len / Math.max(0.2, sec + SEEN - 1.6 * B), 24, base); };
// a title in two halves, decoded one after the other: at the word (English) or break opportunity (Chinese)
// nearest the middle
export const halves = (str, L) => {
  const b = breaks(String(str ?? ''), L), n = b.length;
  if (n < 2) return [String(str ?? ''), ''];
  const tot = graphemes(String(str)).length; let acc = 0, k = 1, best = 1e9;
  for (let i = 0; i < n - 1; i++) { acc += graphemes(b[i].w + b[i].sep).length; const d = Math.abs(acc - tot / 2); if (d < best) { best = d; k = i + 1; } }
  const j = (xs) => xs.map((x, i) => (i ? x.sep : '') + x.w).join('');
  return [j(b.slice(0, k)) + (L === 'zh' ? '' : ' '), j(b.slice(k)).replace(/^\s+/, '')].map((x, i) => (i === 0 ? x : x));
};
export const words = (s, L) => breaks(plain(s), L).map((x) => x.w);

// ── the energy shots (fx.js), drawn in Canvas 2D as pure functions of time ────────────────────────────────────
// the template's palette object for fx.js: accent, hi, deep, bg, and the shots' tints
export const fxPal = (C) => ({ ...C, bg: C.ground, bgHi: C.groundHi, bgLo: C.groundLo, on: C.onAccent });
export { burst, sphere, tunnel, horizon, tints } from './fx.js';
// ── the page header: the chapter title at (110, 92) at 84 / 150 of 150 px, the note under it at (112, 192) ──────
// enter: decode the halves at 0.1 and 0.3 beat and slide the note in at 0.3 beat (a page with no card before it);
// otherwise the header is in place from the first frame (the card's flight ended there)
export const HEAD = { x: 110, y: 92, scale: 84 / 150, px: 150 };
export const headFont = (L) => ({ ...F('display', L, 150, 800), spacing: zh(L) ? 0 : -0.045 * 150 });
export const pageHead = (ctx, P, L, head, t, B, { enter = false, screen = 'crt', alpha = 1 } = {}) => {
  if (!head || alpha <= 0) return;
  const [a, b] = head.title || ['', ''], f = headFont(L), sep = zh(L) ? '' : ' ';
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(HEAD.x, HEAD.y); ctx.scale(HEAD.scale, HEAD.scale);
  const da = enter ? decodeAt(a, t, 0.1 * B, 0.4, 31) : a, db = enter ? decodeAt(b, t, 0.3 * B, 0.45, 32) : b;
  display(ctx, da, 0, 0, f, P, { screen }); display(ctx, db, W(ctx, a + sep, f), 0, f, P, { screen });
  ctx.restore();
  if (head.note) { const t0 = enter ? 0.3 * B : -1, e = E.p3Out((t - t0) / 0.35); at(ctx, head.note, 112 - 14 * (1 - e), 192, F('mono', L, zh(L) ? 28 : 25, 400), P.muted, { alpha: alpha * e }); }
};

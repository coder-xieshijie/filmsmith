// kit.js — what the ink bricks share (word-swap, dot-slam, word-warp, dot-burst, width-name, step-dots, film-ruler,
// count-stop, claim-portal, cursor-close, glyph-slam, width-jump, bar-window, ink-dot): the type on Archivo's width
// axis in both languages, the per-glyph word (slam, rise, warp, the misregistration ghost, the masked exit), the mono
// label that types with a block cursor, the dot with its landing squash and bounce, the grounds, the ambient push and
// the landing punch-in, the grain. Pure functions of their arguments.
// From the ink template (assets/templates/ink/film.js word, label, landSq, bounceAt, camera; timing.rules.js C):
// values are the template's. Glyphs are grapheme clusters (lang.js), never code units. Chinese (SPEC 4): display words
// in Noto Sans SC 900 set as 长体 (look.type.zhWidth: 0.8 for extra-condensed … 1 for normal), no capitals, no negative
// tracking; labels in Noto Sans SC 500 with 0.04 em tracking.
import { clamp, mix, measure, text, rgba } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { bounce, crit, cubicInOut } from '../../../motion.js';
import { fontStack, graphemes, caseOf, isCJK } from '../../lang.js';
import LOOK from './look.js';

export const W = 1920, H = 1080, X = 150, MAXW = W - 2 * X, ONE = 640, L1 = 520, L2 = 830, LABEL = 28, URL_SIZE = 40;
export const SLAM = 330, SLAM_MIN = 220;
export const T = { cps: 90, urlCps: 120, wordExitSec: 0.2, labelEarlySec: 0.17, labelAfter: 0.75, hopGapSec: 0.15, bounceSec: 0.3 };
export const secs = (beats, bpm = 120) => (beats * 60) / bpm;
const TY = LOOK.type;
const hasCJK = (s) => graphemes(s).some(isCJK);
// the horizontal scale of a Chinese display string at a width keyword (1 for Latin: Archivo's own axis carries it)
export const zhW = (s, lang, stretch = 'extra-condensed') => (lang === 'zh' && hasCJK(s) ? TY.zhWidth[stretch] ?? 1 : 1);
// display text as written by the look: capitals in English (caseOf), as written in Chinese
export const disp = (s, lang) => caseOf(s, LOOK, 'display', lang).text;
export const lab = (s, lang) => caseOf(s, LOOK, 'label', lang).text;
// a display spec: Archivo 900 on a width keyword; tracking −0.02 em (words) or −0.035 em (the name, the claim)
export const D = (size, lang, stretch = TY.stretch.word, kind = stretch === 'normal' ? 'mark' : 'display') => ({
  family: fontStack(LOOK, 'display', lang), weight: 900, size, stretch, spacing: (TY.tracking[lang === 'zh' ? 'zh' : 'en'][kind] ?? 0) * size,
});
export const M = (size, lang, weight = 500) => ({ family: fontStack(LOOK, 'mono', lang), weight, size, spacing: TY.tracking[lang === 'zh' ? 'zh' : 'en'].label * size });
// advances of every grapheme (the prefix widths), scaled to 长体 for Chinese
export const advances = (ctx, s, f, lang) => {
  const g = graphemes(s), k = zhW(s, lang, f.stretch), xs = [0];
  let acc = '';
  for (const ch of g) { acc += ch; xs.push(measure(ctx, acc, f).width * k); }
  return { g, xs, k };
};
export const widthOf = (ctx, s, f, lang) => { const a = advances(ctx, s, f, lang); return a.xs[a.xs.length - 1] - (f.spacing || 0) * a.k; };
// Latin-only text in a Chinese film keeps the English tracking (the mark's −0.035 em)
export const tl = (s, lang) => (lang === 'zh' && !hasCJK(s) ? 'en' : lang);
export const fitSize = (ctx, s, lang, max, min, maxW = MAXW, stretch) => { let z = max; while (z > min && widthOf(ctx, s, D(z, tl(s, lang), stretch), lang) > maxW) z -= 2; return z; };

// grounds and the colours on them (the template's groundHex, inkOn, dotOn)
export const groundHex = (C, g) => (g === 'night' ? C.night || C.panel : g === 'accent' ? C.accent : C.ground);
export const inkOn = (C, g) => (g === 'night' ? C.nightInk || C.paper : g === 'accent' ? C.onAccent : C.ink);
export const softOn = (C, g) => (g === 'night' ? C.nightSoft || C.dim : g === 'accent' ? C.onAccent : C.dim);
export const dotOn = (C, g) => (g === 'night' ? C.nightAccent || C.accent : g === 'accent' ? C.onAccent : C.accent);
export const fill = (ctx, hex) => { ctx.fillStyle = hex; ctx.fillRect(-W, -H, 3 * W, 3 * H); };

const spring = (t, z = 0.62, w = 24) => bounce(t, 0, w, z);
// A word drawn glyph by glyph (times in seconds); `raw` keeps the text's own case (a name, a wordmark), otherwise
// English display is set in capitals. s: { text, raw, x, y, size, stretch, align, mode: 'slam' | 'rise',
// tIn, tOut, outMode: 'up' | 'cut' | 'none', color, stagger, z, w, warp(t), mis, lang }; C for the ghost colour.
export const word = (ctx, s, t, C) => {
  const t0 = s.tIn - 0.05, L = s.lang || 'en';
  if (t < t0) return;
  if (s.tOut !== undefined && t > s.tOut + 0.05) return;
  const txt = s.raw ? s.text : disp(s.text, L), f = D(s.size, tl(txt, L), s.stretch, s.kind), { g, xs, k } = advances(ctx, txt, f, L);
  const total = xs[xs.length - 1] - (f.spacing || 0) * k, x0 = s.align === 'center' ? s.x - total / 2 : s.align === 'right' ? s.x - total : s.x;
  const st = s.stagger ?? 0.028, masked = s.mode === 'rise' || s.outMode === 'up';
  ctx.save();
  if (masked) { ctx.beginPath(); ctx.rect(x0 - 400, s.y - s.size * 1.0, total + 800, s.size * 1.24); ctx.clip(); }
  const passes = [];
  if (s.mis !== false && s.mode === 'slam' && C.mis && t >= s.tIn && t < s.tIn + LOOK.texture.mis.sec) passes.push({ color: C.mis, dx: 5, dy: -3, alpha: 0.4 });
  passes.push({ color: s.color, dx: 0, dy: 0, alpha: 1 });
  const A = s.warp ? s.warp(t) : 0;
  for (const pass of passes) {
    for (let i = 0; i < g.length; i++) {
      if (/\s/.test(g[i])) continue;
      const ti = t - t0 - i * st;
      if (ti < 0) continue;
      let y = 0, sc = 1, a = 1, blur = 0, sx = 1;
      if (s.mode === 'slam') { const p = spring(ti, s.z ?? 0.62, s.w ?? 30); sc = 1 + 0.5 * (1 - p); y = -s.size * 0.1 * (1 - p); a = clamp(ti / 0.035); blur = 7 * (1 - crit(ti, 34)); }
      else if (s.mode === 'rise') { const p = spring(ti, 0.78, 22); y = s.size * 1.02 * (1 - p); blur = 6 * (1 - crit(ti, 26)); }
      if (A > 0) { const kk = i * 1.7; sx = 1 + A * 0.18 * Math.sin(3.1 * t + kk); y += A * s.size * 0.07 * Math.sin(2.3 * t + kk * 1.3); }
      if (s.tOut !== undefined && s.outMode !== 'none') {
        if (s.outMode === 'cut') { if (t >= s.tOut) a = 0; }
        else { const to = t - (s.tOut - T.wordExitSec) - i * 0.008; if (to > 0) { const u = clamp(to / 0.17); y -= s.size * 1.25 * u * u; } }
      }
      if (a <= 0.001) continue;
      const gx = x0 + xs[i], gw = xs[i + 1] - xs[i];
      ctx.save();
      ctx.globalAlpha *= a * pass.alpha;
      ctx.translate(gx + gw / 2 + pass.dx, s.y + y + pass.dy);
      ctx.scale(sc * sx * k, sc / Math.sqrt(sx));
      if (A > 0) ctx.transform(1, 0, A * 0.35 * Math.sin(1.9 * t + i * 2.2), 1, 0, 0);
      if (blur > 0.35) ctx.filter = `blur(${blur.toFixed(2)}px)`;
      const fx = { ...f, spacing: 0 };
      if (A > 0.05) {
        text(ctx, g[i], A * 18 * Math.sin(5.1 * t + i), A * 10 * Math.cos(4.3 * t + i), fx, { color: pass.color, align: 'center', alpha: 0.28 });
        text(ctx, g[i], -A * 14 * Math.cos(3.7 * t + i * 2), -A * 8 * Math.sin(4.9 * t + i), fx, { color: pass.color, align: 'center', alpha: 0.28 });
      }
      text(ctx, g[i], 0, 0, fx, { color: pass.color, align: 'center' });
      ctx.restore();
    }
  }
  ctx.restore();
  return { x0, total, x1: x0 + total };
};
// where a word ends (its full stop goes 0.05 em after it, radius 0.062 em, sitting on the baseline)
export const stopOf = (ctx, s) => {
  const L = s.lang || 'en', txt = s.raw ? s.text : disp(s.text, L), f = D(s.size, tl(txt, L), s.stretch, s.kind), w = widthOf(ctx, txt, f, L);
  const x0 = s.align === 'center' ? s.x - w / 2 : s.x, r = s.size * 0.062;
  return { x: x0 + w + s.size * 0.05 + r, y: s.y - r, r, x0, w };
};

// a mono label typing on with a block cursor (seconds); capitals in English unless raw (a command, a URL)
export const label = (ctx, s, t, lang) => {
  if (!s.text || t < s.tIn) return;
  if (s.tOut !== undefined && t >= s.tOut) return;
  const size = s.size || LABEL, f = M(size, lang, s.weight || 500), g = graphemes(s.raw ? s.text : lab(s.text, lang));
  const k = Math.min(g.length, Math.floor((t - s.tIn) * (s.cps || T.cps)) + 1), shown = g.slice(0, k).join('');
  const full = measure(ctx, g.join(''), f).width, x = s.align === 'center' ? s.x - full / 2 : s.x;
  text(ctx, shown, x, s.y, f, { color: s.color, alpha: s.alpha ?? 1 });
  if (k < g.length || (s.cursorUntil !== undefined && t < s.cursorUntil)) { ctx.fillStyle = s.color; ctx.fillRect(x + measure(ctx, shown, f).width + 4, s.y - size * 0.8, size * 0.55, size * 0.95); }
  return { x, w: full };
};

// the dot: a disc with a landing squash (decaying e^(−14 t), 40 rad/s), dropping in from above over 0.2 s
export const landSq = (dt) => (dt < 0 ? 0 : Math.exp(-dt * 14) * Math.cos(dt * 40) * 0.28);
export const dot = (ctx, x, y, r, color, t, land = -1e9, { fall = 0 } = {}) => {
  if (t < land - (fall ? 0.2 : 0)) return;
  let yy = y;
  if (fall && t < land) { const u = clamp((t - (land - 0.2)) / 0.2); yy = y - fall * (1 - u * u); }
  const q = landSq(t - land);
  ctx.save(); ctx.translate(x, yy + r); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, -r, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.restore();
};
// the in-place bounce of a resting dot: up `h` px and down over 0.3 s, landing on the beat `at`
export const bounceY = (t, ats, h = 70) => { for (const a of ats) { const u = (t - (a - T.bounceSec)) / T.bounceSec; if (u >= 0 && u <= 1) return -h * 4 * u * (1 - u); } return 0; };

// the camera: an ambient push from the scene's start (1.4 %/s easing from 4.5 % into a 6.5 % ceiling) and a 5 %
// punch-in on every landing decaying e^(−7 t); scale about the frame centre
export const camera = (t, punches = [], { push = true } = {}) => {
  const P = LOOK.camera.push;
  let p = push ? P.perSec * Math.max(0, t) : 0;
  if (p > P.knee) p = P.knee + (P.max - P.knee) * (1 - Math.exp(-(p - P.knee) / (P.max - P.knee)));
  let k = 0; for (const a of punches) if (t >= a) k += LOOK.camera.punch.amount * Math.exp(-LOOK.camera.punch.decay * (t - a)) * clamp((t - a) / 0.03);
  return 1 + p + Math.min(0.05, k);
};
export const applyCam = (ctx, s) => ctx.setTransform(s, 0, 0, s, (W / 2) * (1 - s), (H / 2) * (1 - s));
// seeded grain, overlay 10 %
export const grain = (ctx, seed, amount = LOOK.texture.grain) => {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 1400; i++) { ctx.fillStyle = hash(i + 3, seed) > 0.5 ? '#ffffff' : '#000000'; ctx.fillRect(hash(i, seed) * W, hash(i + 7, seed) * H, 2, 2); }
  ctx.restore();
};
// the streaks of a night list's first beat: `nightSoft` strips sweeping across in 0.24 s outside the type band
export const streaks = (ctx, t, t0, C, seed) => {
  const u = (t - t0) / 0.24;
  if (u < 0 || u > 1) return;
  for (let i = 0; i < 9; i++) {
    const top = hash(i, seed) < 0.5, y = top ? 40 + hash(i + 3, seed) * 300 : 760 + hash(i + 3, seed) * 280, h = 2 + hash(i + 5, seed) * 32;
    const x = -600 + (W + 1200) * clamp(u * (0.8 + 0.4 * hash(i + 9, seed)));
    ctx.fillStyle = rgba(C.nightSoft || C.dim, 0.35); ctx.fillRect(x - 500, y - h, 1000, h * 2);
    ctx.fillStyle = mix(C.nightSoft || C.dim, C.nightInk || C.ink, 0.4); ctx.fillRect(x - 400, y - h / 3, 800, (h * 2) / 3);
  }
};
export { cubicInOut, clamp, mix };

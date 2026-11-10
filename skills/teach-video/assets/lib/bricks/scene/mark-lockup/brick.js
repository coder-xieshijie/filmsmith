// mark-lockup — the closing lock-up: something on screen becomes the product's mark, the mark steps aside and the
// wordmark lands beside it, a tagline follows, and the whole lock-up holds long enough to read. Three ways in:
// `ring` (default): a neon ring with two gaps collapses from 5.4× onto the centre, turning as it shrinks, heals into a
// solid ring and brakes with a 6 % overshoot on the frame the mark replaces it, with one thin shock ring;
// `flip`: an app icon wobbles twice, flips edge-on (accelerating, with two ghosts) and the mark springs open from that
// sliver, its accent piece wiping in a beat later; the letters drop from 1.9× and defocus into place;
// `assemble`: a cursor sends the message in an input field, the text flies off, the field floods with the mark's ink
// and springs into the mark's stem, and the mark's other pieces drop into dashed construction slots one by one.
// Adapted from video-shotcraft demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx (card
// references/shots/outro/logo-shrink-wordmark-lockup.md) and demos/outro/ui-to-brand-morph/IconFlipBloomLogo.tsx and
// InputMorphsIntoLogo.tsx (card references/shots/outro/ui-to-brand-morph.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as one Canvas2D scene brick with three entries (no React or Remotion, no DOM or SVG); the brand
// mark, wordmark, motto and the demo icon, channel and message copy are removed: the mark is a slot (an image, a
// painter, or a neutral placeholder mark of four plain pieces), its pieces for `assemble` are a parameter, the
// wordmark, tagline, icon and message are slots; the lock-up geometry is computed from the measured wordmark so any
// name centres; colours by role (the ring and halo in the accent, the mark in ink with one accent piece, construction
// lines in the accent); the hold after the tagline comes from reading time (never under one second).
import { clamp, lerp, mix, rgba, rrect, ground, measure, text } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes, caseOf, readTime, units } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import { spring } from '../../motion/digit-roll/brick.js';
import { riseText } from '../../motion/stagger-in/brick.js';
import { drawCursor } from '../../prop/cursor/brick.js';

const E = {
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3), inCubic: (t) => t * t * t,
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), outQuad: (t) => t * (2 - t),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const seg = (t, a, b, e = (x) => x) => e(clamp((t - a) / (b - a)));
const ease = { swift: EASE.swift, snappy: EASE.snappy, out: EASE.out, smooth: EASE.smooth, exit: EASE.exit, flyOut: bez(0.5, 0, 0.9, 0.55), curY: bez(0.25, 0.6, 0.3, 1) };

// The neutral placeholder mark: four plain pieces in a 128-unit box (a stem, a long bar, a short bar, an accent dot).
// `stem` is the piece the input field becomes in `assemble`; the others drop in, in order; `accent` takes the accent.
export const PLACEHOLDER = [
  { shape: 'rect', x: 16, y: 16, w: 26, h: 96, stem: true },
  { shape: 'rect', x: 16, y: 16, w: 96, h: 26 },
  { shape: 'rect', x: 16, y: 58, w: 70, h: 24 },
  { shape: 'circle', cx: 96, cy: 98, r: 15, accent: true },
];
const boundsOf = (pcs) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of pcs) { const [a, b, c, d] = q.shape === 'circle' ? [q.cx - q.r, q.cy - q.r, q.cx + q.r, q.cy + q.r] : [q.x, q.y, q.x + q.w, q.y + q.h]; x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); } return { x0, y0, x1, y1 }; };
const pieceCentre = (q) => (q.shape === 'circle' ? [q.cx, q.cy] : [q.x + q.w / 2, q.y + q.h / 2]);
const piecePath = (ctx, q, u, ox, oy) => { ctx.beginPath(); if (q.shape === 'circle') ctx.arc(ox + q.cx * u, oy + q.cy * u, q.r * u, 0, Math.PI * 2); else if (q.shape === 'poly') q.pts.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * u, oy + y * u) : ctx.moveTo(ox + x * u, oy + y * u))); else ctx.rect(ox + q.x * u, oy + q.y * u, q.w * u, q.h * u); ctx.closePath(); };

// Draw the mark centred at (cx, cy), `size` px for the 128-unit box: the film's mark (an image or a painter) or the
// placeholder pieces; `cut` 0 → 1 wipes the accent piece in along the diagonal (the second beat of `flip`).
export const drawMark = (ctx, cx, cy, size, P, { alpha = 1, cut = 1, sx = 1 } = {}) => {
  if (alpha <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.scale(sx, 1);
  const m = P.mark;
  if (typeof m === 'function') m(ctx, -size / 2, -size / 2, size);
  else if (m && (m.width || m.naturalWidth)) { const w = m.naturalWidth || m.width, h = m.naturalHeight || m.height, k = size / Math.max(w, h); ctx.drawImage(m, (-w * k) / 2, (-h * k) / 2, w * k, h * k); }
  else {
    const u = size / 128, C = P.colors;
    for (const q of P.pieces || PLACEHOLDER) {
      if (q.accent && cut < 1) {
        if (cut <= 0.001) continue;
        ctx.save(); const d = (1 - cut) * 52 * u; ctx.translate(-d, d); ctx.globalAlpha *= clamp(cut * 1.6);
        piecePath(ctx, q, u, -64 * u, -64 * u); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore(); continue;
      }
      piecePath(ctx, q, u, -64 * u, -64 * u); ctx.fillStyle = q.accent ? C.accent : C.ink; ctx.fill();
    }
  }
  ctx.restore();
};

// A placeholder app icon (for `flip` without one): a rounded tile with three text bars.
const drawIcon = (ctx, cx, cy, size, P) => {
  const m = P.icon, C = P.colors;
  if (typeof m === 'function') return m(ctx, cx - size / 2, cy - size / 2, size);
  if (m && (m.width || m.naturalWidth)) { const w = m.naturalWidth || m.width, h = m.naturalHeight || m.height, k = size / Math.max(w, h); return ctx.drawImage(m, cx - (w * k) / 2, cy - (h * k) / 2, w * k, h * k); }
  const s = size * 0.78, x = cx - s / 2, y = cy - s / 2 - size * 0.04;
  rrect(ctx, x, y, s, s * 0.78, s * 0.12); ctx.fillStyle = C.panel; ctx.fill(); ctx.lineWidth = size * 0.035; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.fillStyle = C.ink;
  for (const [k, w] of [[0.24, 0.5], [0.42, 0.36], [0.6, 0.44]]) { rrect(ctx, x + s * 0.16, y + s * k, s * w, s * 0.07, s * 0.035); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + s * 0.8, y + s * 0.26, s * 0.06, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
  ctx.lineCap = 'round'; ctx.lineWidth = size * 0.045; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx - size * 0.41, cy + size * 0.36); ctx.lineTo(cx + size * 0.41, cy + size * 0.36); ctx.stroke();
};

// The three entries: their frames at 30 fps (120 BPM: 15 a beat), the lock-up geometry, the palette they suit.
const MODES = {
  ring: { frames: 132, settle: 110, mark: 128, word: 88, gap: 36, tag: 50, tagY: 676, letters0: 60 },
  flip: { frames: 130, settle: 100, mark: 300, word: 112, gap: 65, tag: 44, tagY: 760, letters0: 66 },
  assemble: { frames: 168, settle: 140, mark: 330 / 96 * 128, word: 110, gap: 60, tag: 46, tagY: 682, letters0: 114, my: 492, end: 0.7 },
};
const modeOf = (s) => (MODES[s.enter] ? s.enter : 'ring');
const LIM = {
  wordmark: { en: { words: 2, chars: 16 }, zh: { chars: 6 } },
  tagline: { en: { words: 6, chars: 34 }, zh: { chars: 12 } },
  prompt: { en: { words: 7, chars: 36 }, zh: { chars: 15 } },
};

// When the lock-up has settled and how long it holds: at least one second, at least the reading time of the wordmark
// and the tagline counted from the first letter.
const timing = (s, lang) => {
  const M = MODES[modeOf(s)], read = Math.round((readTime(s.wordmark, lang) + (s.tagline ? readTime(s.tagline, lang) : 0) + 0.6) * 30);
  const end = Math.max(M.frames, M.settle + 30, M.letters0 + read);
  return { end, beats: Math.ceil(end / 15) };
};

export default {
  id: 'mark-lockup', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 14 },
  needs: { motions: [], props: ['cursor'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    wordmark: { type: 'text', tier: 'primary', sample: 'product', limits: LIM.wordmark },
    tagline: { type: 'text', tier: 'glance', sample: 'claim', optional: true, limits: LIM.tagline },
    mark: { type: 'image', optional: true },
    icon: { type: 'image', optional: true },
    prompt: { type: 'text', tier: 'glance', sample: 'claim', optional: true, limits: LIM.prompt },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'Something on screen becomes the mark (a ring collapses onto it, an icon flips into it, or an input field and three pieces assemble it), the mark steps aside, the wordmark lands and the lock-up holds.',
  defaults: (ctx = {}) => ({ enter: 'ring', wordmark: copy('product', ctx.lang || 'en'), tagline: copy('claim', ctx.lang || 'en'), prompt: copy('claim', ctx.lang || 'en'), pieces: null, mark: null, icon: null }),
  plan(s, ctx) {
    const M = MODES[modeOf(s)], T = timing(s, ctx.lang);
    const land = modeOf(s) === 'ring' ? 0.28 * 131 : modeOf(s) === 'flip' ? 46 : 86;
    return { beats: T.beats, reads: [{ text: s.wordmark, lang: ctx.lang }, ...(s.tagline ? [{ text: s.tagline, lang: ctx.lang }] : [])],
      cues: [{ beat: land / 15, kind: 'land' }, { beat: M.letters0 / 15, kind: 'accent' }, { beat: M.settle / 15, kind: 'end' }],
      motion: `mark enters by ${modeOf(s)}, steps aside, wordmark lands`, settled: M.settle / 15, peakAt: land / 15, pause: (T.end - M.settle) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en', cap = (k) => (L === 'zh' ? LIM[k].zh.chars : LIM[k].en.words);
    for (const k of ['wordmark', 'tagline', 'prompt']) if (s[k] && units(s[k], L) > cap(k)) err.push(`${k} too long`);
    if (!s.wordmark) err.push('wordmark missing');
    if (s.enter && !MODES[s.enter]) err.push(`enter: ring | flip | assemble`);
    if (s.pieces && !s.pieces.some((q) => q.stem)) err.push('pieces: one piece needs stem: true (the field becomes it)');
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, mode = modeOf(s), M = MODES[mode], g = scratchCtx();
    const wf = fontFor(NEUTRAL, 'display', L, M.word, 700, 'display');
    let font = wf, ww = measure(g, s.wordmark, wf).width;
    const room = 1680 - M.mark * (mode === 'assemble' ? M.end : 1) - M.gap;
    if (ww > room) { font = fontFor(NEUTRAL, 'display', L, Math.floor((M.word * room) / ww), 700, 'display'); ww = measure(g, s.wordmark, font).width; }
    const glyphs = graphemes(s.wordmark), xs = []; let acc = 0;
    for (const ch of glyphs) { xs.push(acc); acc += measure(g, ch, font).width; }
    const scale = ww / Math.max(1, acc);
    const pcs = s.pieces || PLACEHOLDER, b = boundsOf(pcs);
    // visible mark box in px (the pieces' bounds) and the lock-up: mark, gap, wordmark, centred as a group
    const k = mode === 'assemble' ? M.end : 1, u = (M.mark / 128) * k;
    const markW = s.mark ? M.mark * k : (b.x1 - b.x0) * u;
    const total = markW + M.gap + ww, left = 960 - total / 2;
    const markCx = left + markW / 2 - ((b.x0 + b.x1) / 2 - 64) * u * (s.mark ? 0 : 1);
    const tagCase = s.tagline ? caseOf(s.tagline, NEUTRAL, 'label', L) : null;
    // markShift: where the mark ends (px from the centre), computed from the group; a film can pin it
    return { mode, M, font, ww, xs: xs.map((x) => x * scale), glyphs, markShift: s.markShift ?? markCx - 960, wordLeft: left + markW + M.gap + (s.markShift != null ? s.markShift - (markCx - 960) : 0), pcs, tag: tagCase,
      tagFont: { ...fontFor(NEUTRAL, mode === 'ring' ? 'text' : 'text', L, M.tag, mode === 'ring' ? 600 : 450, mode === 'ring' ? 'label' : null) },
      promptFont: fontFor(NEUTRAL, 'text', L, 44, 450), T: timing(s, L) };
  },
  paint(ctx, u, s, c, D) {
    const f = u * 15;
    ground(ctx, s);
    if (D.mode === 'ring') this.ring(ctx, f, s, c, D);
    else if (D.mode === 'flip') this.flip(ctx, f, s, c, D);
    else this.assemble(ctx, f, s, c, D);
  },

  // ── ring ────────────────────────────────────────────────────────────────────────────────────────────────────────
  ringScale(t) { const k = seg(t, 0.02, 0.28, E.inOutCubic), brake = Math.sin(seg(t, 0.26, 0.37) * Math.PI) * 0.06; return lerp(5.4, 1, k) * (1 + brake); },
  ringSpin(t) { return -150 * seg(t, 0, 0.3, E.outCubic); },
  ringView(f, D) { const t = Math.min(1, f / 131); return { t, s: this.ringScale(t), x: 960 + seg(t, 0.34, 0.47, E.inOutCubic) * D.markShift }; },
  ring(ctx, f, s, c, D) {
    const C = s.colors, V = this.ringView(f, D), t = V.t, DT = 1 / 131;
    const heal = seg(t, 0.1, 0.28, E.inOutQuad), markIn = seg(t, 0.24, 0.32, E.inOutQuad);
    const trail = Math.min(1, Math.abs(this.ringScale(t) - this.ringScale(t - DT)) / 0.35);
    const wave = seg(t, 0.28, 0.46, E.outCubic);
    const haloR = lerp(150, 34, seg(t, 0.02, 0.3, E.inOutCubic)) * 4, haloA = 0.5 - 0.32 * seg(t, 0.3, 0.5, E.outCubic);
    // the halo the ring carries in, collapsing with it
    const hg = ctx.createRadialGradient(V.x, 540, 0, V.x, 540, haloR);
    hg.addColorStop(0, rgba(C.accent, 0.42 * haloA)); hg.addColorStop(0.38, rgba(C.accent, 0.12 * haloA)); hg.addColorStop(0.7, rgba(C.accent, 0));
    ctx.fillStyle = hg; ctx.fillRect(V.x - haloR, 540 - haloR, haloR * 2, haloR * 2);
    // one shock ring on the brake
    if (wave < 1 && wave > 0) {
      ctx.save(); ctx.shadowColor = rgba(C.accent, 0.45 * (1 - wave)); ctx.shadowBlur = lerp(4, 10, wave) * 4;
      ctx.strokeStyle = rgba(mix(C.ink, C.accent, 0.15), 0.55 * (1 - wave)); ctx.lineWidth = lerp(0.9, 0.25, wave) * 4;
      ctx.beginPath(); ctx.arc(960, 540, lerp(16, 70, wave) * 4 - (ctx.lineWidth / 2), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    const icon = (sc, rot, op, ghost) => {
      const R = 10.5 * 4 * sc, a0 = (-32 + rot) * Math.PI / 180, a1 = (122 + rot) * Math.PI / 180;
      ctx.save(); ctx.globalAlpha *= op; ctx.lineCap = 'round';
      const arcs = (w, col, blur, a) => { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = w * sc; ctx.strokeStyle = col; if (blur) { ctx.shadowColor = col; ctx.shadowBlur = blur * sc; } for (const o of [0, Math.PI]) { ctx.beginPath(); ctx.arc(V.x, 540, R, a0 + o, a1 + o); ctx.stroke(); } ctx.restore(); };
      arcs(6.5 * 4, rgba(C.accent, 0.62), 10, 1 - heal);
      if (!ghost) {
        arcs(3.4 * 4, heal > 0.5 ? C.ink : mix(C.ink, C.accent, 0.15), 0, (1 - heal * 0.75) * (1 - markIn));
        const oa = heal * (1 - markIn);
        if (oa > 0.002) { ctx.save(); ctx.globalAlpha *= oa; ctx.lineWidth = 5.5 * 4 * sc; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(V.x, 540, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }
      ctx.restore();
    };
    if (trail > 0.02) { icon(this.ringScale(t - 2 * DT), this.ringSpin(t - 2 * DT), 0.16 * trail, true); icon(this.ringScale(t - DT), this.ringSpin(t - DT), 0.3 * trail, true); }
    icon(V.s, this.ringSpin(t), 1, false);
    if (markIn > 0) drawMark(ctx, V.x, 540, D.M.mark * V.s, s, { alpha: markIn });
    // letters: left to right, each slides 32 px and focuses in
    const n = D.glyphs.length, ST = 0.24 / Math.max(1, n), row = V.x + D.wordLeft - (960 + D.markShift);
    D.glyphs.forEach((ch, i) => {
      const lk = seg(t, 0.46 + i * ST, 0.46 + i * ST + 0.1, E.outCubic);
      if (lk <= 0) return;
      ctx.save(); if (lk < 0.999) ctx.filter = `blur(${(lerp(2.5, 0, lk) * 4 * 0.5).toFixed(2)}px)`;
      text(ctx, ch, row + D.xs[i] + lerp(32, 0, lk), 540 + D.font.size * 0.35, D.font, { color: C.ink, alpha: lk });
      ctx.restore();
    });
    if (D.tag) { const a = seg(t, 0.72, 0.84, E.outQuad), dy = lerp(12, 0, seg(t, 0.72, 0.86, E.outCubic)); if (a > 0) text(ctx, D.tag.text, 960, D.M.tagY + D.tagFont.size * 0.8 + dy, { ...D.tagFont, spacing: D.tag.tracking * D.tagFont.size }, { color: C.accent, align: 'center', alpha: a }); }
  },

  // ── flip ────────────────────────────────────────────────────────────────────────────────────────────────────────
  flipView(f, D) {
    const inT = spring(f, { damping: 13, stiffness: 140, mass: 0.8 });
    const K = [12, 18, 24, 30, 34], V = [0, -12, 14, -18, 0];
    let wob = 0; for (let i = 1; i < K.length; i++) if (f >= K[i - 1] && f <= K[i]) wob = lerp(V[i - 1], V[i], E.inOutSine((f - K[i - 1]) / (K[i] - K[i - 1])));
    const flipIn = seg(f, 34, 46, E.inCubic), iconSx = lerp(1, 0.04, flipIn);
    const bloom = f < 46 ? 0 : spring(f - 46, { damping: 11, stiffness: 130, mass: 0.9 }), markSx = lerp(0.04, 1, bloom);
    const cut = f < 53 ? 0 : spring(f - 53, { damping: 16, stiffness: 170 });
    const shift = seg(f, 64, 82, E.outCubic), x = 960 + shift * D.markShift;
    return { inT, wob, flipIn, iconSx, bloom, markSx, cut, x, icon: f < 46 };
  },
  flip(ctx, f, s, c, D) {
    const C = s.colors, V = this.flipView(f, D), SZ = 340, cy = 540;
    // contact shadow under the icon: follows the wobble, narrows with the flip, gone once the mark is up
    const shW = 300 * (V.icon ? V.iconSx : V.markSx), shA = V.inT * (1 - ramp(f, 46, 14, 'out'));
    if (shA > 0.002 && shW > 1) { ctx.save(); ctx.translate(V.x + V.wob * 2.2, cy + 163); ctx.scale(shW / 2, 13); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(mix(C.ink, '#000000', 0.4), 0.22 * shA)); g.addColorStop(0.7, rgba(mix(C.ink, '#000000', 0.4), 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    if (V.icon) {
      const pivotY = cy - SZ / 2 + SZ * 0.78;
      if (f >= 34) [0.12, 0.24].forEach((g, i) => { ctx.save(); ctx.globalAlpha = 0.22 - i * 0.08; ctx.filter = 'blur(6px)'; ctx.translate(V.x, cy); ctx.scale(Math.min(1, V.iconSx + g), 1); drawIcon(ctx, 0, 0, SZ, s); ctx.restore(); });
      ctx.save(); ctx.globalAlpha = clamp(V.inT); if (V.flipIn > 0.3) ctx.filter = `blur(${(V.flipIn * 5).toFixed(2)}px)`;
      ctx.translate(V.x, pivotY); ctx.scale(V.inT, V.inT); ctx.rotate((V.wob * Math.PI) / 180); ctx.scale(V.iconSx, 1); ctx.translate(0, cy - pivotY);
      drawIcon(ctx, 0, 0, SZ, s); ctx.restore();
    } else drawMark(ctx, V.x, cy, D.M.mark, s, { sx: V.markSx, cut: V.cut });
    // letters: each drops from 1.9× and defocuses into place, 2.6 frames apart
    const row = V.x + D.wordLeft - (960 + D.markShift), base = cy + D.font.size * 0.36;
    D.glyphs.forEach((ch, i) => {
      const st = D.M.letters0 + i * 2.6, cT = ramp(f, st, 12, 'snappy'), op = ramp(f, st, 5, 'out');
      if (op <= 0) return;
      const w = (D.xs[i + 1] ?? D.ww) - D.xs[i], ox = row + D.xs[i] + w / 2, oy = base - D.font.size * 0.22, k = 1.9 - 0.9 * cT;
      ctx.save(); if (cT < 0.995) ctx.filter = `blur(${((1 - cT) * 14).toFixed(2)}px)`;
      ctx.translate(ox, oy); ctx.scale(k, k); ctx.translate(-ox, -oy);
      text(ctx, ch, row + D.xs[i], base, D.font, { color: C.ink, alpha: op });
      ctx.restore();
    });
    if (D.tag) { const a = ramp(f, 96, 12, 'out'); if (a > 0) text(ctx, s.tagline, 960, D.M.tagY + (1 - a) * 10, D.tagFont, { color: C.dim, align: 'center', alpha: a }); }
  },

  // ── assemble ────────────────────────────────────────────────────────────────────────────────────────────────────
  assembleView(f, D) {
    const M = D.M, U = M.mark / 128, stem = D.pcs.find((q) => q.stem) || D.pcs[0];
    const shift = ramp(f, 108, 20, 'swift'), S = lerp(1, M.end, shift), MX = 960 + shift * D.markShift, MY = M.my;
    const m = f < 30 ? 0 : spring(f - 30, { damping: 15, stiffness: 95, mass: 1 });
    const [scx, scy] = pieceCentre(stem), BOX = { x: 960, y: 690, w: 1040, h: 132, r: 34 };
    const tx = MX + (scx - 64) * U * S, ty = MY + (scy - 64) * U * S;
    return { shift, S, MX, MY, m, U, stem, BOX, bx: lerp(BOX.x, tx, m), by: lerp(BOX.y, ty, m), bw: lerp(BOX.w, stem.w * U * S, m), bh: lerp(BOX.h, stem.h * U * S, m), br: Math.max(0, lerp(BOX.r, 0, Math.min(1, m))),
      push: 1 + 0.02 * ramp(f, 124, 44, 'smooth') };
  },
  drops(D) { return D.pcs.filter((q) => !q.stem).map((q, i) => ({ q, at: 58 + i * 14 })); },
  assemble(ctx, f, s, c, D) {
    const C = s.colors, V = this.assembleView(f, D), B = V.BOX, L = c.lang;
    // the construction grid: 12 columns and three baselines, stronger while the pieces land
    const gridA = 0.55 * ramp(f, 40, 20, 'out') * (1 - ramp(f, 108, 18, 'out')) + 0.25;
    ctx.save(); ctx.strokeStyle = rgba(C.ink, 0.06 * gridA / 0.8); ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(96 + i * 144 + 0.5, 0); ctx.lineTo(96 + i * 144 + 0.5, 1080); ctx.stroke(); }
    for (const y of [180, 492, 804]) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(1920, y + 0.5); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(960, 540); ctx.scale(V.push, V.push); ctx.translate(-960, -540);
    const drops = this.drops(D), at = (q) => { const [x, y] = pieceCentre(q); return [V.MX + (x - 64) * V.U * V.S, V.MY + (y - 64) * V.U * V.S]; };
    // construction lines through the first two drops' centres, while the pieces land
    const constrA = ramp(f, (drops[0]?.at ?? 58) - 14, 16, 'out') * (1 - ramp(f, 104, 16, 'out'));
    if (constrA > 0.002 && drops.length) {
      ctx.save(); ctx.globalAlpha = constrA; ctx.lineWidth = 1.2;
      const [x0, y0] = at(drops[0].q), [x1] = at(drops[drops.length - 1].q);
      ctx.strokeStyle = rgba(C.accent, 0.28); ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(1920, y0); ctx.moveTo(x1, 0); ctx.lineTo(x1, 1080); ctx.stroke();
      ctx.strokeStyle = rgba(C.accent, 0.18); ctx.setLineDash([6, 8]); const sx = V.MX + (V.stem.x - 64) * V.U * V.S;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, 1080); ctx.stroke(); ctx.restore();
    }
    // the thread above the field: a header and two message rows, gone (blurred up) once it is sent
    const ctxOut = ramp(f, 22, 10, 'out');
    if (ctxOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - ctxOut; ctx.translate(0, -24 * ramp(f, 22, 10, 'exit')); if (f > 22) ctx.filter = `blur(${(6 * clamp((f - 22) / 10)).toFixed(2)}px)`;
      const x0 = B.x - B.w / 2 + 8, top = B.y - B.h / 2 - 410;
      ctx.fillStyle = C.accent; rrect(ctx, x0, top + 8, 22, 30, 6); ctx.fill();
      ctx.fillStyle = mix(C.ink, C.ground, 0.15); rrect(ctx, x0 + 36, top + 12, 260, 22, 11); ctx.fill();
      ctx.fillStyle = mix(C.dim, C.ground, 0.4); rrect(ctx, x0 + B.w - 16 - 150, top + 14, 150, 18, 9); ctx.fill();
      ctx.fillStyle = rgba(C.ink, 0.08); ctx.fillRect(x0, top + 60, B.w - 16, 1.5);
      [[0.55, 0.62, 0.5], [1, 0.74, 0.62]].forEach(([a, w1, w2], i) => {
        const y = top + 92 + i * 120; ctx.save(); ctx.globalAlpha *= a;
        rrect(ctx, x0, y, 60, 60, 18); ctx.fillStyle = i ? mix(C.accent, C.ink, 0.35) : mix(C.dim, C.ink, 0.2); ctx.fill();
        ctx.fillStyle = C.ink; rrect(ctx, x0 + 82, y + 4, 150, 22, 11); ctx.fill();
        ctx.fillStyle = mix(C.dim, C.ground, 0.25); rrect(ctx, x0 + 82, y + 40, (B.w - 120) * w1 * 0.8, 22, 11); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }
    // the field → the stem: five values on one spring; it floods with the mark's ink from the send key
    const assembled = f >= 108, flood = ramp(f, 28, 12, 'snappy'), m = V.m, uiOut = Math.min(1, m * 3);
    if (!assembled) {
      const x = V.bx - V.bw / 2, y = V.by - V.bh / 2, flat = 1 - Math.min(1, m);
      ctx.save();
      if (flat > 0.01) { ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.5), 0.3 * flat); ctx.shadowBlur = lerp(50, 36, m); ctx.shadowOffsetY = lerp(24, 18, m) - 10; }
      rrect(ctx, x, y, V.bw, V.bh, V.br); ctx.fillStyle = flood >= 1 ? C.ink : C.panel; ctx.fill(); ctx.restore();
      if (flood < 1) {
        const ring = 1 - flood;
        if (ring > 0.01) { ctx.save(); rrect(ctx, x - 9 * ring, y - 9 * ring, V.bw + 18 * ring, V.bh + 18 * ring, V.br + 9 * ring); ctx.strokeStyle = rgba(C.accent, 0.12 * ring); ctx.lineWidth = 6 * ring; ctx.stroke(); rrect(ctx, x - 1.5 * ring, y - 1.5 * ring, V.bw + 3 * ring, V.bh + 3 * ring, V.br + 1.5 * ring); ctx.strokeStyle = rgba(C.accent, 0.9 * ring); ctx.lineWidth = 3 * ring; ctx.stroke(); ctx.restore(); }
        if (flood > 0) { ctx.save(); rrect(ctx, x, y, V.bw, V.bh, V.br); ctx.clip(); ctx.beginPath(); ctx.arc(x + V.bw - 66 * (1 - m), y + V.bh / 2, flood * Math.hypot(V.bw, V.bh), 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore(); }
      }
      if (uiOut < 1) {
        ctx.save(); ctx.globalAlpha = 1 - uiOut; rrect(ctx, x, y, V.bw, V.bh, V.br); ctx.clip();
        const press = f >= 20 && f <= 24 ? 0.84 : 1, flash = f >= 20 && f <= 25 ? 1 - (f - 20) / 6 : 0;
        const kx = x + V.bw - 24 - 42, ky = y + V.bh / 2;
        ctx.strokeStyle = mix(C.dim, C.panel, 0.2); ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        const ix = x + V.bw - 132 - 34; ctx.beginPath(); ctx.moveTo(ix - 34, ky); ctx.lineTo(ix - 12, ky); ctx.moveTo(ix - 23, ky - 11); ctx.lineTo(ix - 23, ky + 11); ctx.stroke();
        ctx.beginPath(); ctx.arc(ix + 20, ky, 13, 0, Math.PI * 2); ctx.stroke();
        ctx.save(); ctx.translate(kx, ky); ctx.scale(press, press);
        ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.fillStyle = mix(C.accent, C.panel, 0.45 * flash); ctx.fill();
        ctx.strokeStyle = C.onAccent; ctx.lineWidth = 4.2; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -12); ctx.moveTo(-10, -2); ctx.lineTo(0, -12); ctx.lineTo(10, -2); ctx.stroke();
        ctx.restore(); ctx.restore();
      }
    }
    // the message flies off (accelerating, turning), drawn outside the field so its corners do not cut it
    const flyT = ramp(f, 21, 11, ease.flyOut);
    if (s.prompt && flyT < 1 && uiOut < 1) {
      ctx.save(); ctx.globalAlpha = (1 - flyT) * (1 - uiOut);
      const px = B.x - B.w / 2 + 44, py = B.y + D.promptFont.size * 0.34;
      ctx.translate(px + flyT * 760, py - flyT * 420); ctx.rotate((-flyT * 9 * Math.PI) / 180); if (flyT > 0.15) ctx.filter = `blur(${(flyT * 6).toFixed(2)}px)`;
      text(ctx, s.prompt, 0, 0, D.promptFont, { color: C.ink });
      if (f < 21 && Math.floor(f / 8) % 2 === 0) { ctx.fillStyle = C.accent; ctx.fillRect(measure(ctx, s.prompt, D.promptFont).width + 6, -D.promptFont.size * 0.84, 3, 50); }
      ctx.restore();
    }
    // dashed construction outlines (10 px out) drawn along their edge 10 frames before each drop, gone after it lands
    for (const { q, at: a } of drops) {
      const draw = ramp(f, a - 10, 12, 'out'), fade = 1 - ramp(f, a + 14, 10, 'out'), al = draw > 0 ? Math.min(draw * 2, 1) * fade : 0;
      if (al <= 0.001) continue;
      const [cx, cy] = at(q), k = V.U * V.S;
      const pts = q.shape === 'circle' ? Array.from({ length: 48 }, (_, i) => [cx + Math.cos((i / 48) * Math.PI * 2 - Math.PI / 2) * (q.r * k + 10), cy + Math.sin((i / 48) * Math.PI * 2 - Math.PI / 2) * (q.r * k + 10)])
        : [[cx - (q.w * k) / 2 - 10, cy - (q.h * k) / 2 - 10], [cx + (q.w * k) / 2 + 10, cy - (q.h * k) / 2 - 10], [cx + (q.w * k) / 2 + 10, cy + (q.h * k) / 2 + 10], [cx - (q.w * k) / 2 - 10, cy + (q.h * k) / 2 + 10]];
      ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = rgba(C.accent, 0.75); ctx.lineWidth = 2; dashedPartial(ctx, pts, draw, [10, 8]);
      ctx.strokeStyle = rgba(C.accent, 0.7); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12); ctx.stroke(); ctx.restore();
    }
    // the assembled mark (one drawing once all have landed), and each piece falling: stretched by its speed, squashed
    // on the rebound (origin at its foot), a shadow while airborne
    if (assembled) drawMark(ctx, V.MX, V.MY, D.M.mark * V.S, s);
    const DROP = 760;
    for (const { q, at: a } of drops) {
      if (f < a || assembled) continue;
      const sp = (fr) => (fr < a ? 0 : spring(fr - a, { damping: 13, stiffness: 120, mass: 0.9 }));
      const sv = sp(f), v = (sv - sp(f - 1)) * DROP, kq = clamp(v / 70, -1, 1), sy = 1 + 0.14 * kq, sx = 1 - 0.09 * kq;
      const [cx, cy] = at(q), k = V.U * V.S, h = q.shape === 'circle' ? q.r * 2 * k : q.h * k, foot = cy + h / 2 - (1 - sv) * DROP, air = clamp((1 - sv) * 3);
      ctx.save(); ctx.translate(cx, foot); ctx.scale(sx, sy); ctx.translate(-cx, -foot);
      ctx.translate(0, -(1 - sv) * DROP);
      if (air > 0.01) { ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.5), 0.35 * air); ctx.shadowBlur = 16 * air; ctx.shadowOffsetY = 14 * air; }
      piecePath(ctx, q, k, V.MX - 64 * k, V.MY - 64 * k); ctx.fillStyle = q.accent ? C.accent : C.ink; ctx.fill();
      ctx.restore();
    }
    // wordmark letters rise from their baseline, then the tagline word by word
    const row = V.MX + D.wordLeft - (960 + D.markShift), base = V.MY - 4 + D.font.size * 0.36;
    D.glyphs.forEach((ch, i) => {
      const p = ramp(f, D.M.letters0 + i * 1.5, 16, 'snappy');
      if (p <= 0) return;
      const w = (D.xs[i + 1] ?? D.ww) - D.xs[i];
      ctx.save(); ctx.beginPath(); ctx.rect(row + D.xs[i] - 4, base - D.font.size * 1.12, w + 8, D.font.size * 1.45); ctx.clip();
      text(ctx, ch, row + D.xs[i], base + (1 - p) * D.font.size * 1.35, D.font, { color: C.ink }); ctx.restore();
    });
    if (s.tagline) riseText(ctx, s.tagline, 960, V.MY + 190 + D.tagFont.size * 0.8, D.tagFont, { color: C.dim, lang: L, f, start: D.M.letters0 + 16, each: 16, gap: 3, align: 'center', ease: EASE.out });
    ctx.restore();
    // the cursor glides to the send key, presses and leaves
    const curT = ramp(f, 0, 18, 'swift'), sendX = B.x + B.w / 2 - 24 - 42;
    const cx = lerp(1560, sendX + 6, curT), cy = lerp(940, B.y + 8, ramp(f, 0, 18, ease.curY)), curOp = 1 - ramp(f, 23, 8, 'out');
    drawCursor(ctx, cx, cy, { h: 46, press: f >= 20 && f <= 24 ? 1 : 0, alpha: curOp, colors: C });
  },

  // the mark's centre and its right edge at scale (compare pairs them with the upstream's icon / stem)
  track(u, s, c, D) {
    const f = u * 15;
    if (D.mode === 'ring') { const V = this.ringView(f, D); return [[V.x, 540], [V.x + 60 * V.s, 540]]; }
    if (D.mode === 'flip') { const V = this.flipView(f, D); return [[V.x, 540], [V.x + 150 * (V.icon ? V.iconSx * V.inT : V.markSx), 540]]; }
    const V = this.assembleView(f, D); return [[V.bx, V.by], [V.bx + V.bw / 2, V.by - V.bh / 2]];
  },
  blur() { return false; },
};

let G = null;
function scratchCtx() { if (!G) { const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas'); G = c.getContext('2d'); } return G; }
// A closed polyline stroked with a dash pattern, only along its first `share` of the perimeter.
function dashedPartial(ctx, pts, share, dash) {
  const segs = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]), lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  let left = clamp(share) * lens.reduce((a, b) => a + b, 0);
  ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < segs.length && left > 0; i++) { const [a, b] = segs[i], k = Math.min(1, left / lens[i]); ctx.lineTo(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k); left -= lens[i]; }
  ctx.stroke(); ctx.setLineDash([]);
}

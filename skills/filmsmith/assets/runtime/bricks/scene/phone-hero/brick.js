// phone-hero — the product held still and kept alive: a phone stands in the middle of four concentric rings that
// breathe out of phase like ripples, its feed scrolls slowly on its own, two chips pop out of its sides on springs
// (left first, right a second later) and start to hover once they have landed, and a wordmark with its tagline rises
// in the bottom-left corner. Three slow motions stacked, so a product still never goes dead.
// Adapted from video-shotcraft demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips.tsx (card
// references/shots/effects/radial-ripple-phone-chips.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the rings are the afterglow look's rings()
// (any palette's roles, the period of the upstream's 1.5 breaths a shot); the screen is a slot (`screen`, a tall image
// scrolled through) with a neutral feed drawn from the sample copy and tile-card's figures when the film has none
// (demo feed, recipe names, the clock and the player's title removed; the status bar is shapes); the chips' labels
// and icons, the mark, wordmark and tagline are slots (the mark drawn by mark-lockup's drawMark, the words risen by
// stagger-in's riseText, the chips sprung by its springAt); colours by role (the warm titanium frame is the line and
// dim roles, the terracotta the accent); the hold comes from reading time.
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch, canvasOf } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, readTime, units, breaks, caseOf } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import { rings, vignette } from '../../look/afterglow/texture.js';
import { figure } from '../../prop/tile-card/brick.js';
import { springAt, riseText } from '../../motion/stagger-in/brick.js';
import { drawMark } from '../mark-lockup/brick.js';

const UP = 167;                                   // the upstream's clock: t = f / 167
const P = { w: 430, h: 900, frame: 12, black: 9 }, PX = (1920 - P.w) / 2, PY = (1080 - P.h) / 2, GAP = 64;
const SW = P.w - 2 * (P.frame + P.black), SH = P.h - 2 * (P.frame + P.black), SCROLL = 560;
const CHIPS = [{ at: 37, ph: 0, side: -1, top: 330 }, { at: 67, ph: 1.8, side: 1, top: 610 }];
const WORD = 90;
const LIM = { chip: { en: { words: 3, chars: 18 }, zh: { chars: 7 } }, wordmark: { en: { words: 2, chars: 16 }, zh: { chars: 6 } }, tagline: { en: { words: 6, chars: 34 }, zh: { chars: 12 } } };

const timing = (s, lang) => {
  const n = s.tagline ? breaks(s.tagline, lang).length : 0, risen = WORD + 8 + Math.max(0, n - 1) * 4 + 16;
  const end = Math.max(168, risen + 15, Math.round(WORD + (readTime(s.wordmark || '', lang) + (s.tagline ? readTime(s.tagline, lang) : 0) + 0.6) * 30));
  return { end, risen, beats: Math.ceil(end / 15) };
};

// The chip icons: a list (lines with dots) and a download arrow, in the onAccent role on the accent disc.
const chipGlyph = (ctx, k, cx, cy, col) => {
  ctx.save(); ctx.translate(cx - 15, cy - 15); ctx.scale(30 / 24, 30 / 24); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  if (k % 2 === 0) { for (const y of [6, 12, 18]) { ctx.moveTo(9, y); ctx.lineTo(y === 18 ? 16 : 20, y); } ctx.stroke(); for (const y of [6, 12, 18]) { ctx.beginPath(); ctx.arc(4.5, y, 1.2, 0, Math.PI * 2); ctx.fill(); } }
  else { ctx.moveTo(12, 4); ctx.lineTo(12, 15); ctx.moveTo(7, 10.5); ctx.lineTo(12, 15.5); ctx.lineTo(17, 10.5); ctx.moveTo(5, 19.5); ctx.lineTo(19, 19.5); ctx.stroke(); }
  ctx.restore();
};

// The neutral feed (the screen when the film gives none): an eyebrow and title, a featured card, a section label and
// eight rows of a thumbnail, a title, a meta line, a progress bar and a play disc. Drawn once, scrolled in paint.
const feedOf = (C, L) => {
  const H = 1560, cv = canvasOf(SW, H), x = cv.getContext('2d'), screen = mix(C.panel, C.ground, 0.4), ink = C.ink;
  x.fillStyle = screen; x.fillRect(0, 0, SW, H);
  const eb = fontFor(NEUTRAL, 'text', L, 17, 650), tt = fontFor(NEUTRAL, 'display', L, 44, 780, 'display'), sec = fontFor(NEUTRAL, 'display', L, 22, 720), rt = fontFor(NEUTRAL, 'text', L, 22, 680), rm = fontFor(NEUTRAL, 'text', L, 17, 450), ft = fontFor(NEUTRAL, 'display', L, 30, 760, 'display'), fe = fontFor(NEUTRAL, 'text', L, 15, 700);
  const sub = caseOf(copy('subtitle', L), NEUTRAL, 'label', L); text(x, sub.text, 20, 76 + 17, { ...eb, spacing: sub.tracking * 17 }, { color: C.dim });
  text(x, copy('title', L), 18, 76 + 17 + 8 + 40, tt, { color: ink });
  // the featured card: a dark card with a glow of the accent
  const fy = 76 + 17 + 8 + 46 + 20, deep = mix(C.ink, C.accent, 0.2);
  x.save(); rrect(x, 16, fy, SW - 32, 210, 26); x.clip();
  const fg = x.createLinearGradient(16, fy, SW - 16, fy + 210); fg.addColorStop(0, deep); fg.addColorStop(1, mix(deep, C.accent, 0.35)); x.fillStyle = fg; x.fillRect(16, fy, SW - 32, 210);
  const gl = x.createRadialGradient(SW - 16 + 40 - 115, fy - 50 + 115, 0, SW - 16 + 40 - 115, fy - 50 + 115, 115); gl.addColorStop(0, rgba(mix(C.accent, '#ffffff', 0.5), 0.9)); gl.addColorStop(0.45, rgba(C.accent, 0.6)); gl.addColorStop(0.7, rgba(C.accent, 0)); x.fillStyle = gl; x.fillRect(16, fy, SW - 32, 210);
  x.restore();
  text(x, copy('detailEyebrow', L), 38, fy + 22 + 15, { ...fe, spacing: L === 'zh' ? 0 : 1.5 }, { color: rgba(C.panel, 0.7) });
  text(x, copy('detailTitle', L), 38, fy + 210 - 50 - 4, ft, { color: C.panel });
  text(x, copy('caption', L), 38, fy + 210 - 22 - 2, rm, { color: rgba(C.panel, 0.75) });
  let y = fy + 210 + 26;
  text(x, copy('label', L), 20, y + 22, sec, { color: ink }); y += 22 + 12 + 6;
  const cards = copy('cards', L), rows = [...cards, ...cards].slice(0, 8), kinds = ['wave', 'rings', 'bars', 'line', 'grid', 'dots', 'gantt', 'blocks'], prog = [0.62, 0, 0.18, 0, 0, 0.4, 0, 0];
  rows.forEach((r, i) => {
    const h = 100; x.save(); x.shadowColor = rgba(C.ink, 0.06); x.shadowBlur = 6; x.shadowOffsetY = 2; rrect(x, 16, y, SW - 32, h, 22); x.fillStyle = C.panel; x.fill(); x.restore();
    x.save(); rrect(x, 28, y + 12, 76, 76, 15); x.clip(); figure(x, kinds[i], 28, y + 12, 76, 76, C, { seed: i + 3, lit: i % 3 === 0 ? 1 : 0, ground: mix(C.panel, i % 2 ? C.line : C.accent, 0.2) }); x.restore();
    text(x, r.title, 118, y + 12 + 24, rt, { color: ink }); text(x, r.meta, 118, y + 12 + 24 + 25, rm, { color: C.dim });
    rrect(x, 118, y + 12 + 60, 150, 5, 3); x.fillStyle = mix(C.panel, C.line, 0.6); x.fill();
    if (prog[i]) { rrect(x, 118, y + 12 + 60, 150 * prog[i], 5, 3); x.fillStyle = C.accent; x.fill(); }
    x.beginPath(); x.arc(SW - 16 - 12 - 20, y + h / 2, 20, 0, Math.PI * 2); x.fillStyle = prog[i] ? C.accent : mix(C.panel, C.line, 0.5); x.fill();
    x.beginPath(); const px = SW - 16 - 12 - 20 - 3, py = y + h / 2; x.moveTo(px - 3, py - 5); x.lineTo(px + 5, py); x.lineTo(px - 3, py + 5); x.closePath(); x.fillStyle = prog[i] ? C.onAccent : ink; x.fill();
    y += h + 12;
  });
  return cv;
};

export default {
  id: 'phone-hero', kind: 'scene',
  fits: ['hero', 'lockup', 'rest'],
  surface: ['canvas'],
  beats: { min: 11, max: 14 },
  needs: { motions: ['stagger-in'], props: ['tile-card'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'], type: ['display', 'text'] },
  slots: {
    screen: { type: 'image', crop: true, optional: true },
    chips: { type: 'list', count: [2, 2], of: { label: { type: 'text', tier: 'glance', limits: LIM.chip }, icon: { type: 'image', optional: true } } },
    mark: { type: 'image', optional: true },
    wordmark: { type: 'text', tier: 'primary', sample: 'product', optional: true, limits: LIM.wordmark },
    tagline: { type: 'text', tier: 'glance', sample: 'claim', optional: true, limits: LIM.tagline },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent', 'paper'],
  summary: 'A phone stands still in breathing concentric rings while its feed scrolls by itself; two chips pop out of its sides and hover, and the wordmark rises in the corner.',
  defaults: (ctx = {}) => { const L = ctx.lang || 'en', k = copy('kpis', L); return { screen: null, chips: [{ label: k[0].label, icon: null }, { label: k[1].label, icon: null }], mark: null, wordmark: copy('product', L), tagline: copy('claim', L) }; },
  plan(s, ctx) {
    const T = timing(s, ctx.lang);
    return { beats: T.beats, reads: [...s.chips.map((c) => ({ text: c.label, lang: ctx.lang })), ...(s.wordmark ? [{ text: `${s.wordmark} ${s.tagline || ''}`.trim(), lang: ctx.lang }] : [])],
      cues: [{ beat: 0, kind: 'land' }, ...CHIPS.map((c) => ({ beat: c.at / 15, kind: 'accent' })), ...(s.wordmark ? [{ beat: WORD / 15, kind: 'accent' }] : [])],
      motion: 'phone rises; feed scrolls; chips pop and hover; rings breathe', settled: T.risen / 15, peakAt: CHIPS[1].at / 15, pause: (T.end - T.risen) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en', over = (v, lim) => v && units(v, L) > (L === 'zh' ? lim.zh.chars : lim.en.words);
    if (!Array.isArray(s.chips) || s.chips.length !== 2) err.push('chips: exactly two');
    (s.chips || []).forEach((c, i) => { if (over(c.label, LIM.chip)) err.push(`chips[${i}].label too long`); });
    for (const k of ['wordmark', 'tagline']) if (over(s[k], LIM[k])) err.push(`${k} too long`);
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, C = s.colors, g = scratch(), cf = fontFor(NEUTRAL, 'text', L, 36, 650);
    return { feed: feedOf(C, L), cf, cw: s.chips.map((c) => 14 + 60 + 20 + measure(g, c.label, cf).width + 34),
      wf: fontFor(NEUTRAL, 'display', L, 54, 700, 'display'), tf: fontFor(NEUTRAL, 'text', L, 32, 450), T: timing(s, L) };
  },
  // a chip's box and pose at frame f (the upstream's spring, slide out of the phone's side, hover once landed)
  chip(f, i, D) {
    const K = CHIPS[i], t = f / UP, s = springAt(f - K.at, { damping: 13, stiffness: 190 }), slide = ramp(f, K.at, 20, EASE.snappy), floatIn = ramp(f, K.at + 18, 24, EASE.smooth);
    const w = D.cw[i], x = K.side < 0 ? PX - GAP - w : PX + P.w + GAP;
    return { x, y: K.top, w, h: 88, dx: K.side * (1 - slide) * -28, dy: Math.sin(t * Math.PI * 4 + K.ph) * 8 * floatIn, k: 0.8 + 0.2 * s, a: clamp((f - K.at) / 5), ox: K.side < 0 ? x + w : x };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, t = f / UP, L = c.lang;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the key light, the rings breathing round the phone, a light vignette
    const kl = ctx.createRadialGradient(768, 0, 0, 768, 0, 1300); kl.addColorStop(0, rgba(C.paper, 0.35)); kl.addColorStop(1, rgba(C.paper, 0)); ctx.fillStyle = kl; ctx.fillRect(0, 0, 1920, 1080);
    rings(ctx, f, C, { period: UP / 1.5 });
    vignette(ctx, 0.2, C);
    // the phone: rises 90 px into place, its shadow tightening as it lands
    const rise = ramp(f, 0, 26, EASE.snappy), y0 = PY + (1 - rise) * 90, op = Math.min(1, rise * 2.2), shadow = mix(C.ink, '#000000', 0.3);
    ctx.save(); ctx.globalAlpha = op;
    ctx.save(); ctx.shadowColor = rgba(shadow, 0.42); ctx.shadowBlur = 80 + (1 - rise) * 40; ctx.shadowOffsetY = 40 + (1 - rise) * 30; rrect(ctx, PX + 10, y0 + 10, P.w - 20, P.h - 20, 70); ctx.fillStyle = shadow; ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = rgba(shadow, 0.25); ctx.shadowBlur = 140; ctx.shadowOffsetY = 90; rrect(ctx, PX + 30, y0 + 40, P.w - 60, P.h - 60, 70); ctx.fillStyle = shadow; ctx.fill(); ctx.restore();
    const metal = (a) => mix(mix(C.line, C.dim, a), C.panel, 0.15);
    for (const b of [{ side: -1, y: 190, h: 64 }, { side: -1, y: 272, h: 64 }, { side: 1, y: 230, h: 104 }]) { rrect(ctx, b.side < 0 ? PX - 3.5 : PX + P.w - 1.5, y0 + b.y, 5, b.h, 3); ctx.fillStyle = metal(0.5); ctx.fill(); }
    const fr = ctx.createLinearGradient(PX, y0, PX + P.w, y0 + P.h);
    [[0, 0.15], [0.3, 0.75], [0.55, 0.3], [0.8, 0.9], [1, 0.45]].forEach(([o, a]) => fr.addColorStop(o, metal(a)));
    rrect(ctx, PX, y0, P.w, P.h, 70); ctx.fillStyle = fr; ctx.fill(); ctx.strokeStyle = rgba(C.paper, 0.35); ctx.lineWidth = 1.5; ctx.stroke();
    rrect(ctx, PX + P.frame, y0 + P.frame, P.w - 2 * P.frame, P.h - 2 * P.frame, 58); ctx.fillStyle = mix(C.ink, '#000000', 0.6); ctx.fill();
    const sx = PX + P.frame + P.black, sy = y0 + P.frame + P.black, screen = mix(C.panel, C.ground, 0.4);
    ctx.save(); rrect(ctx, sx, sy, SW, SH, 50); ctx.clip(); ctx.fillStyle = screen; ctx.fillRect(sx, sy, SW, SH);
    // the feed, scrolling at an even speed (autoplay: no easing) from t 0.08 to 0.98
    const scroll = SCROLL * clamp((t - 0.08) / 0.9);
    if (s.screen && (s.screen.width || s.screen.naturalWidth)) { const iw = s.screen.naturalWidth || s.screen.width, ih = s.screen.naturalHeight || s.screen.height, k = SW / iw; ctx.drawImage(s.screen, sx, sy - scroll * Math.min(1, Math.max(0, ih * k - SH) / SCROLL), iw * k, ih * k); }
    else ctx.drawImage(D.feed, sx, sy - scroll);
    // the status bar (shapes only) over a fade, the island, the foot fade, the mini player, the home bar, the glass glint
    let g = ctx.createLinearGradient(0, sy, 0, sy + 70); g.addColorStop(0.55, screen); g.addColorStop(1, rgba(screen, 0)); ctx.fillStyle = g; ctx.fillRect(sx, sy, SW, 70);
    rrect(ctx, sx + 38, sy + 24, 44, 12, 6); ctx.fillStyle = C.ink; ctx.fill();
    [6, 9, 12].forEach((h, i) => { ctx.fillStyle = C.ink; ctx.fillRect(sx + SW - 32 - 26 - 6 - 18 + i * 7, sy + 23 + 13 - h, 4, h); });
    rrect(ctx, sx + SW - 32 - 26, sy + 23, 26, 13, 4); ctx.strokeStyle = rgba(C.ink, 0.45); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = C.ink; ctx.fillRect(sx + SW - 32 - 26 + 3, sy + 26, 15, 7);
    rrect(ctx, sx + SW / 2 - 59, sy + 14, 118, 34, 17); ctx.fillStyle = mix(C.ink, '#000000', 0.7); ctx.fill();
    g = ctx.createLinearGradient(0, sy + SH - 170, 0, sy + SH); g.addColorStop(0, rgba(screen, 0)); g.addColorStop(0.4, rgba(screen, 0.92)); g.addColorStop(0.7, screen); ctx.fillStyle = g; ctx.fillRect(sx, sy + SH - 170, SW, 170);
    const bx = sx + 14, by = sy + SH - 34 - 92, bw = SW - 28, play = 0.34 + 0.05 * t, dark = mix(C.ink, C.accent, 0.08);
    ctx.save(); ctx.shadowColor = rgba(shadow, 0.5); ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; rrect(ctx, bx, by, bw, 92, 26); ctx.fillStyle = dark; ctx.fill(); ctx.restore();
    ctx.save(); rrect(ctx, bx, by, bw, 92, 26); ctx.clip();
    ctx.save(); rrect(ctx, bx + 16, by + 15, 62, 62, 12); ctx.clip(); figure(ctx, 'wave', bx + 16, by + 15, 62, 62, C, { lit: 1, seed: 2, ground: mix(C.accent, C.panel, 0.7) }); ctx.restore();
    rrect(ctx, bx + 92, by + 22, 150, 12, 6); ctx.fillStyle = rgba(C.panel, 0.85); ctx.fill();
    for (let k = 0; k < 22; k++) { const amp = 0.35 + 0.65 * Math.abs(Math.sin(k * 1.37 + f * 0.21) * Math.cos(k * 0.53 - f * 0.09)), h = 4 + amp * 16; rrect(ctx, bx + 92 + k * 6, by + 58 - h / 2, 3, h, 1.5); ctx.fillStyle = k / 22 < play ? mix(C.accent, C.panel, 0.4) : rgba(C.panel, 0.3); ctx.fill(); }
    ctx.beginPath(); ctx.arc(bx + bw - 16 - 25, by + 46, 25, 0, Math.PI * 2); ctx.fillStyle = C.panel; ctx.fill();
    ctx.fillStyle = dark; rrect(ctx, bx + bw - 41 - 7.5, by + 37, 5, 18, 2); ctx.fill(); rrect(ctx, bx + bw - 41 + 2.5, by + 37, 5, 18, 2); ctx.fill();
    ctx.fillStyle = C.accent; ctx.fillRect(bx, by + 89, bw * play, 3);
    ctx.restore();
    rrect(ctx, sx + SW / 2 - 70, sy + SH - 15, 140, 5, 3); ctx.fillStyle = rgba(C.ink, 0.75); ctx.fill();
    g = ctx.createLinearGradient(sx, sy, sx + SW * Math.cos(0.49), sy + SH * Math.sin(0.49) * 0.5); g.addColorStop(0.32, rgba('#ffffff', 0)); g.addColorStop(0.44, rgba('#ffffff', 0.14)); g.addColorStop(0.56, rgba('#ffffff', 0)); ctx.fillStyle = g; ctx.fillRect(sx, sy, SW, SH);
    ctx.restore();
    ctx.restore();
    // the chips: popped from the phone's side on a spring, then hovering
    s.chips.forEach((cp, i) => {
      const Q = this.chip(f, i, D); if (Q.a <= 0) return;
      ctx.save(); ctx.globalAlpha = Q.a; ctx.translate(Q.dx, Q.dy); ctx.translate(Q.ox, Q.y + Q.h / 2); ctx.scale(Q.k, Q.k); ctx.translate(-Q.ox, -Q.y - Q.h / 2);
      ctx.save(); ctx.shadowColor = rgba(shadow, 0.32); ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; rrect(ctx, Q.x + 8, Q.y + 6, Q.w - 16, Q.h - 8, Q.h / 2); ctx.fillStyle = rgba(shadow, 0.5); ctx.fill(); ctx.restore();
      const cg = ctx.createLinearGradient(0, Q.y, 0, Q.y + Q.h); cg.addColorStop(0, C.paper); cg.addColorStop(1, mix(C.paper, C.ground, 0.4));
      rrect(ctx, Q.x, Q.y, Q.w, Q.h, Q.h / 2); ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = rgba(shadow, 0.06); ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(Q.x + 14 + 30, Q.y + 44, 30, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
      if (cp.icon && (cp.icon.width || cp.icon.naturalWidth)) ctx.drawImage(cp.icon, Q.x + 14 + 15, Q.y + 29, 30, 30); else chipGlyph(ctx, i, Q.x + 44, Q.y + 44, C.onAccent);
      text(ctx, cp.label, Q.x + 14 + 60 + 20, Q.y + 44 + D.cf.size * 0.36, D.cf, { color: C.ink });
      ctx.restore();
    });
    // the sign-off, bottom left: the mark and the wordmark rising together, the tagline word by word
    if (s.wordmark) {
      const ma = ramp(f, WORD, 10, EASE.out), mr = (1 - ramp(f, WORD, 18, EASE.snappy)) * 30, base = 1080 - 104 - 32 * 1.3 - 6;
      if (ma > 0) drawMark(ctx, 120 + 43, base - 27 + mr, 86, s, { alpha: ma });
      riseText(ctx, s.wordmark, 120 + 86 + 22, base, D.wf, { color: C.ink, lang: L, f, start: WORD, each: 18 });
      if (s.tagline) riseText(ctx, s.tagline, 120, base + 6 + 32 * 1.2, D.tf, { color: C.dim, lang: L, f, start: WORD + 8, each: 16, gap: 4 });
    }
  },
  // the phone's top-left and the second chip's left edge (compare pairs them with the upstream's)
  track(u, s, c, D) { const f = u * 15, rise = ramp(f, 0, 26, EASE.snappy), Q = this.chip(f, 1, D); return [[PX, PY + (1 - rise) * 90], [Q.x + Q.dx, Q.y + Q.dy + Q.h / 2]]; },
  blur() { return false; },
};

// icon-field — a field of unlit keycaps, one small icon each, rises from the centre out until it fills the frame;
// after a held breath, bands of light sweep down it row by row and light every key, then a title lands on a veil.
// Adapted from video-shotcraft demos/opening/icon-field-colorize/IconFieldColorize.tsx (card references/shots/opening/icon-field-colorize.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); keycaps pre-drawn once per icon and state and
// placed per frame; the four sunrise colours of the waves are four steps of the one accent (light to deep), the unlit
// keys the ground and dim, the lit glyph onAccent; the upstream's seeded draws through rng.js mulberry32; the icons are the
// film's (`icons`, SVG path data on a 24 grid) with the upstream's sixteen plain glyphs as the neutral default; the
// wordmark eyebrow and the two title lines are slots, entering by word (Chinese by phrase) as the stagger bricks do.
import { clamp, mix, rgba, rrect, ground } from '../../../handoffs/util.js';
import { mulberry32 } from '../../../rng.js';
import { EASE, ramp, mixN } from '../../ease.js';
import { fontFor, readTime } from '../../lang.js';
import { look as NEUTRAL, infoSize } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';

// Sixteen plain glyphs on a 24 grid: [path, 'c' (glyph colour) | 'k' (the cap's colour, a cut-out), transform].
const SHAPES = [
  [['M12 21s-7.5-4.7-9.6-9C.9 8.7 2.7 5 6.2 5c2 0 3.3 1 4 2.1h3.6C14.5 6 15.8 5 17.8 5c3.5 0 5.3 3.7 3.8 7-2.1 4.3-9.6 9-9.6 9z', 'c', [0.92, 1, 0]]],
  [['M12 2l2.7 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.2 6.1 19.8l1.6-6.6L2.5 8.8l6.8-.5z', 'c']],
  [['M13 2L4 14h6l-1 8 9-12h-6z', 'c']],
  [['M12 3a9 9 0 1 0 0.01 0z', 'c']],
  [['M9 3v12.3A3.5 3.5 0 1 0 11 18V7h7v6.3A3.5 3.5 0 1 0 20 16V3z', 'c', [0.85, 1.5, 1.5]]],
  [['M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z', 'c', [0.85, 2, 2]]],
  [['M5.5 6h13A2.5 2.5 0 0 1 21 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-8A2.5 2.5 0 0 1 5.5 6z', 'c'], ['M12 8.9a3.6 3.6 0 1 0 0.01 0z', 'k'], ['M9.5 3.5h5A1.5 1.5 0 0 1 16 5v2.5H8V5a1.5 1.5 0 0 1 1.5-1.5z', 'c']],
  [['M6.5 19a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 17.8 8.7 4.2 4.2 0 0 1 17.5 19z', 'c']],
  [['M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z', 'c', [0.9, 1.2, 0.5]]],
  [['M 3.5 10L12 3l8.5 7V21h-6v-6h-5v6h-6z', 'c']],
  [['M4 8h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z', 'c'], ['M6 12h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z', 'c'], ['M10.9 8h2.2v13h-2.2z', 'k']],
  [['M9.4 20.6l-1 1.9 7.2-.1 4.9-8.5-2.2.1-2 3.4L13 4.5h-2.1L7.6 17.3z', 'c', [0.9, 1, 1]]],
  [['M20.3 6.7L9.6 17.4l-5.9-5.9 2.1-2.1 3.8 3.8 8.6-8.6z', 'c']],
  [['M21.5 15.5L14 12V5.5a2 2 0 1 0-4 0V12l-7.5 3.5v2l7.5-2v4l-2.5 2v1.5l4.5-1 4.5 1V21.5l-2.5-2v-4l7.5 2z', 'c', [0.85, 1.8, 1.8]]],
  [['M12 8a4 4 0 1 0 0.01 0z', 'c'], ['M12 1.5l1.4 3.6h-2.8zM12 22.5l-1.4-3.6h2.8zM1.5 12l3.6-1.4v2.8zM22.5 12l-3.6 1.4v-2.8zM4.6 4.6l3.5 1.5-2 2zM19.4 19.4l-3.5-1.5 2-2zM19.4 4.6l-1.5 3.5-2-2zM4.6 19.4l1.5-3.5 2 2z', 'c']],
  [['M20 4C10 4 4.5 9 4 15.7 3.9 17.5 4 20 4 20s2.7-.2 4.4-.3C15 19.2 20 13.5 20 4zM6.8 17.2C10 11 15 8 15 8s-5.5 1.5-8.8 8z', 'c']],
];
const COLS = 17, ROWS = 10, CX = 108, CY = 106, TILE = 66, GLYPH = 32, PAD = 34, FLIP = 4;
const X0 = (1920 - ((COLS - 1) * CX + CX / 2 + TILE)) / 2, Y0 = (1080 - ((ROWS - 1) * CY + TILE)) / 2;
// frames (upstream): rise 0–48, the breath 56–74, waves from rows 0, 3, 5, 8 at 66, 72, 78, 84, the title from 118
const WAVES = [{ from: 0, at: 66 }, { from: 3, at: 72 }, { from: 5, at: 78 }, { from: 8, at: 84 }], TITLE = 118, END = 170;

// three seeded draws a key, in reading order (computed once in prepare)
const iconsOf = (seed) => { const rnd = mulberry32(seed); return Array.from({ length: ROWS * COLS }, (_, idx) => {
  const r = Math.floor(idx / COLS), c = idx % COLS, r1 = rnd(), r2 = rnd(), r3 = rnd();
  const x = X0 + c * CX + (r % 2) * (CX / 2), y = Y0 + r * CY, d = Math.hypot(x + TILE / 2 - 960, y + TILE / 2 - 540) / Math.hypot(960, 540);
  const batch = Math.min(9, Math.floor((d * 0.75 + r1 * 0.35) * 10));
  return { r, c, x, y, t0: 2 + batch * 4.4 + r2 * 3, gray: Math.floor(r2 * 3), shape: Math.floor(r3 * 16) % 16, arrive: WAVES.map((w, k) => ({ k, at: w.at + (r - w.from) * 1.4 + c * 0.25 + r3 * 1.5 })).filter((a) => r >= WAVES[a.k].from) };
}); };

export default {
  id: 'icon-field', kind: 'scene',
  fits: ['hook', 'proof', 'lockup'],
  surface: ['canvas'],
  beats: { min: 10, max: 12 },
  needs: { motions: ['stagger-in'], props: [], roles: ['ground', 'panel', 'dim', 'ink', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    icons: { type: 'list', count: [6, 16], of: { type: 'icon', set: 'neutral' }, optional: true },
    eyebrow: { type: 'text', tier: 'glance', sample: 'eyebrow', limits: { en: { words: 3, chars: 20 }, zh: { chars: 8 } } },
    line1: { type: 'text', tier: 'primary', sample: 'detailTitle', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } },
    line2: { type: 'text', tier: 'primary', claim: true, sample: 'claim', limits: { en: { words: 5, chars: 24 }, zh: { chars: 9 } } },
  },
  roles: ['ground', 'panel', 'dim', 'ink', 'accent', 'onAccent'],
  summary: 'A field of unlit keycaps rises from the centre out until it fills the frame; after a breath, bands of light sweep down it and light every key, then a title lands on a veil.',
  defaults: () => ({ icons: null, eyebrow: null, line1: null, line2: null, seed: 20260718 }),
  plan(s, ctx) {
    const read = (readTime(s.line1 || '', ctx.lang) + readTime(s.line2 || '', ctx.lang)) * 30;
    const end = Math.max(END, TITLE + 40 + read * 0.7), beats = clamp(Math.ceil(end / 7.5) / 2, this.beats.min, this.beats.max);
    return { beats, reads: [{ text: s.line1, lang: ctx.lang }, { text: s.line2, lang: ctx.lang }], cues: WAVES.map((w, k) => ({ beat: w.at / 15, kind: k ? 'accent' : 'turn' })).concat([{ beat: (TITLE + 14) / 15, kind: 'land' }]),
      motion: 'stagger rise; lighting waves', settled: (TITLE + 40) / 15, peakAt: WAVES[0].at / 15, pause: beats - (TITLE + 40) / 15 };
  },
  validate(s) { const n = s.icons ? s.icons.filter(Boolean).length : 16; return n && (n < 6 || n > 16) ? [`icons: ${n} (6–16)`] : []; },
  prepare(s, ctx) {
    const c = s.colors, lang = ctx.lang, look = s.look || NEUTRAL;
    const shapes = s.icons && s.icons.some(Boolean) ? s.icons.filter(Boolean).map((ic) => [[ic.d || ic, 'c']]) : SHAPES;
    const grays = [0.42, 0.52, 0.34].map((k) => mix(c.ground, c.dim, k));
    const waves = [mix(c.accent, '#ffffff', 0.42), mix(c.accent, '#ffffff', 0.2), c.accent, mix(c.accent, '#000000', 0.25)];
    const cap = (shape, tint, glyph) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = TILE + 2 * PAD;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.translate(PAD, PAD);
      const lit = !!tint;
      g.save();
      if (lit) { g.shadowColor = rgba(tint, 0.42); g.shadowBlur = 26; } else { g.shadowColor = rgba('#000000', 0.7); g.shadowBlur = 14; g.shadowOffsetY = 6; }
      const gr = g.createLinearGradient(0, 0, 0, TILE);
      if (lit) { gr.addColorStop(0, mix(tint, '#ffffff', 0.08)); gr.addColorStop(0.55, tint); gr.addColorStop(1, mix(tint, '#000000', 0.08)); }
      else { gr.addColorStop(0, mix(c.ground, c.panel, 0.9)); gr.addColorStop(1, mix(c.ground, '#000000', 0.15)); }
      rrect(g, 0, 0, TILE, TILE, 18); g.fillStyle = gr; g.fill(); g.restore();
      g.save(); rrect(g, 0, 0, TILE, TILE, 18); g.clip(); g.fillStyle = rgba('#ffffff', lit ? 0.45 : 0.07); g.fillRect(0, 0, TILE, 1); g.restore();
      if (!lit) { rrect(g, 0.5, 0.5, TILE - 1, TILE - 1, 18); g.strokeStyle = rgba(c.dim, 0.08); g.lineWidth = 1; g.stroke(); }
      g.translate((TILE - GLYPH) / 2, (TILE - GLYPH) / 2); g.scale(GLYPH / 24, GLYPH / 24);
      for (const [d, which, tf] of shape) {
        g.save(); if (tf) { g.scale(tf[0], tf[0]); g.translate(tf[1], tf[2]); }
        g.fillStyle = which === 'k' ? (lit ? tint : mix(c.ground, c.panel, 0.6)) : glyph; g.fill(new Path2D(d)); g.restore();
      }
      return cv;
    };
    const unlit = shapes.map((sh) => grays.map((gy) => cap(sh, null, gy)));
    const lit = shapes.map((sh) => waves.map((w) => cap(sh, w, rgba(c.onAccent, 0.86))));
    const fs = lang === 'zh' ? 120 : 112;
    return { shapes, unlit, lit, waves, icons: iconsOf(s.seed).map((ic) => ({ ...ic, shape: ic.shape % shapes.length })),
      f1: fontFor(look, 'display', lang, fs, 750, 'display'), fe: fontFor(look, 'mono', lang, infoSize(lang) + 3, 600, 'label'), fs };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, fr = u * 15, push = 1 + 0.04 * ramp(fr, 0, END, 'smooth');
    const inhale = ramp(fr, 56, 10, 'smooth') * (1 - ramp(fr, 66, 8, 'out')), litAll = ramp(fr, 66, 34, 'out');
    ground(ctx2d, s);
    // the key light from above and a fill from below, brighter as the field is lit
    const kl = ctx2d.createRadialGradient(960, 0, 0, 960, 0, 1100); kl.addColorStop(0, rgba(c.dim, 0.12 * (0.45 + 0.35 * litAll))); kl.addColorStop(1, rgba(c.dim, 0));
    ctx2d.fillStyle = kl; ctx2d.fillRect(0, 0, 1920, 1080);
    ctx2d.save(); ctx2d.translate(960, 540); ctx2d.scale(push, push); ctx2d.translate(-960, -540);
    // where each icon is: its colour now and before, how far through its flip
    const rowLit = new Array(ROWS).fill(0), rowCol = new Array(ROWS).fill(-1);
    const st = D.icons.map((ic) => {
      let prev = -1, cur = -1, p = 0, since = -1;
      for (const a of ic.arrive) { const q = clamp((fr - a.at) / FLIP); if (q > 0) { prev = cur; cur = a.k; p = q; since = fr - a.at; } }
      if (cur >= 0) { rowLit[ic.r] += 1 / COLS; rowCol[ic.r] = cur; }
      return { prev, cur, p, since };
    });
    // the light each lit row spills on the stage behind it
    rowCol.forEach((k, r) => { if (k < 0) return; const y = Y0 + r * CY + TILE / 2, g = ctx2d.createLinearGradient(0, y - CY * 1.1, 0, y + CY * 1.1);
      g.addColorStop(0, rgba(D.waves[k], 0)); g.addColorStop(0.5, rgba(D.waves[k], 0.16 * rowLit[r])); g.addColorStop(1, rgba(D.waves[k], 0)); ctx2d.fillStyle = g; ctx2d.fillRect(-100, y - CY * 1.1, 2120, CY * 2.2); });
    ctx2d.globalAlpha = 1 - 0.12 * inhale;
    D.icons.forEach((ic, i) => {
      const op = ramp(fr, ic.t0, 7, 'out'); if (op <= 0) return;
      const { prev, cur, p, since } = st[i], flipping = p > 0 && p < 1;
      const sc = mixN(0.6, 1, ramp(fr, ic.t0, 13, 'overshoot')) * (flipping ? 1 + Math.sin(p * Math.PI) * 0.22 : 1), lift = (1 - ramp(fr, ic.t0, 13, 'snappy')) * 10;
      const cx = ic.x + TILE / 2, cy = ic.y + lift + TILE / 2, base = (k) => (k < 0 ? D.unlit[ic.shape][ic.gray] : D.lit[ic.shape][k]);
      ctx2d.save(); ctx2d.globalAlpha *= op; ctx2d.translate(cx, cy); ctx2d.scale(sc, sc);
      const off = -TILE / 2 - PAD;
      ctx2d.drawImage(base(flipping ? prev : cur), off, off);
      if (flipping) { ctx2d.save(); ctx2d.beginPath(); ctx2d.rect(-TILE / 2 - PAD, -TILE / 2 - PAD, TILE + 2 * PAD, PAD + TILE * EASE.out(p)); ctx2d.clip(); ctx2d.drawImage(base(cur), off, off); ctx2d.restore(); }
      // the lighting overshoot: a brighter halo for 12 frames, a white flash for 5 once the new colour has filled the key
      const glowK = since >= 0 ? Math.max(0, 1 - since / 12) : 0, flash = since >= FLIP ? Math.max(0, 1 - (since - FLIP) / 5) : 0;
      if (glowK > 0 && cur >= 0) { const hg = ctx2d.createRadialGradient(0, 0, TILE * 0.3, 0, 0, TILE); hg.addColorStop(0, rgba(D.waves[cur], 0.5 * glowK)); hg.addColorStop(1, rgba(D.waves[cur], 0)); ctx2d.globalCompositeOperation = 'screen'; ctx2d.fillStyle = hg; ctx2d.fillRect(-TILE, -TILE, 2 * TILE, 2 * TILE); }
      if (flash > 0) { ctx2d.globalCompositeOperation = 'screen'; rrect(ctx2d, -TILE / 2, -TILE / 2, TILE, TILE, 18); ctx2d.fillStyle = rgba('#ffffff', 0.45 * flash); ctx2d.fill(); }
      ctx2d.restore();
    });
    ctx2d.restore();
    // the veil and the title
    const title = ramp(fr, TITLE, 22, 'out');
    if (title > 0) {
      const veil = mix(c.ground, '#000000', 0.55), vg = ctx2d.createRadialGradient(960, 540, 0, 960, 540, 960);
      vg.addColorStop(0, rgba(veil, 0.9 * title)); vg.addColorStop(0.45, rgba(veil, 0.78 * title)); vg.addColorStop(1, rgba(veil, 0));
      ctx2d.save(); ctx2d.translate(960, 540); ctx2d.scale(1, 0.92); ctx2d.translate(-960, -540); ctx2d.fillStyle = vg; ctx2d.fillRect(0, -100, 1920, 1300); ctx2d.restore();
      const e = ramp(fr, TITLE + 2, 14, 'out'), ey = (1 - ramp(fr, TITLE + 2, 18, 'snappy')) * 12, lh = D.fs * (ctx.lang === 'zh' ? 1.2 : 1.08), y1 = 540 - lh / 2 + D.fs * 0.32;
      if (s.eyebrow) riseText(ctx2d, s.eyebrow, 960, y1 - D.fs - 30 + ey, D.fe, { color: D.waves[0], lang: ctx.lang, f: fr, start: TITLE + 2, each: 14, gap: 2, align: 'center', alpha: e });
      riseText(ctx2d, s.line1 || '', 960, y1, D.f1, { color: c.ink, lang: ctx.lang, f: fr, start: TITLE + 6, each: 20, gap: 5, align: 'center' });
      riseText(ctx2d, s.line2 || '', 960, y1 + lh, D.f1, { color: D.waves[0], lang: ctx.lang, f: fr, start: TITLE + 14, each: 20, gap: 5, align: 'center' });
    }
  },
  // 0: [the scale of the top-left key × 1000, 0]: its rise, then its pop as the first band lights it
  track(u, s, ctx, D) {
    const fr = u * 15, ic = D.icons[0], a = ic.arrive[0], p = clamp((fr - a.at) / FLIP);
    return [[mixN(0.6, 1, ramp(fr, ic.t0, 13, 'overshoot')) * (p > 0 && p < 1 ? 1 + Math.sin(p * Math.PI) * 0.22 : 1) * 1000, 0]];
  },
  blur() { return false; },
};

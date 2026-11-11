// strip-away — the subtractive ending: a cursor clicks the editor's primary button and the whole interface
// evaporates around it, outermost layer first (each with its own drift outward and a growing blur), the ground goes
// dark, the button alone glides to the centre and grows, then lets go and hands the dark frame to the lock-up.
// Adapted from video-shotcraft demos/outro/ui-strip-away-outro/UiStripAwayOutro.tsx (card
// references/shots/outro/ui-strip-away-outro.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the demo editor (layer names, property values,
// project and repository names, the fixture cards) becomes a neutral editor of the same structure drawn in roles with
// text bars instead of words; the button's label, the document title, the wordmark and the mark are slots (the mark
// drawn by mark-lockup's drawMark, in the light role on the dark frame); colours by role (the dark frame is the ink
// darkened, the button and its halo the accent); the hold after the lock-up comes from reading time.
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { ramp } from '../../ease.js';
import { fontFor, graphemes, readTime, units } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import { spring } from '../../motion/digit-roll/brick.js';
import { figure } from '../../prop/tile-card/brick.js';
import { drawCursor } from '../../prop/cursor/brick.js';
import { drawMark } from '../mark-lockup/brick.js';

const CLICK = 34, DUR = 14, BTN_FADE = CLICK + 52, LOGO_IN = CLICK + 62;
const STRIP = { sidebar: CLICK + 4, panel: CLICK + 8, cards: CLICK + 12, ends: CLICK + 16, canvas: CLICK + 20, shell: CLICK + 24 };
const BTN = { w: 150, h: 40, from: [1920 - 24 - 75, 30], to: [960, 540] };
const inQuad = (t) => t * t, inOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lin = (f, a, b, c = (u) => u) => c(clamp((f - a) / (b - a)));
const CURY = bez(0.3, 0, 0.15, 1);
// one layer's evaporation at frame f: accelerating out, drifting (dx, dy), blurring to 7 px
const strip = (f, start, dx, dy) => { const p = lin(f, start, start + DUR, inQuad); return { a: 1 - p, x: dx * p, y: dy * p, blur: p * 7 }; };
const LIM = { wordmark: { en: { words: 2, chars: 16 }, zh: { chars: 6 } }, action: { en: { words: 1, chars: 10 }, zh: { chars: 3 } }, title: { en: { words: 3, chars: 20 }, zh: { chars: 8 } } };

const timing = (s, lang) => { const read = Math.round((readTime(s.wordmark, lang) + 0.9) * 30); const end = Math.max(144, LOGO_IN + 20 + read); return { end, beats: Math.ceil(end / 15) }; };

export default {
  id: 'strip-away', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 10, max: 12 },
  needs: { motions: [], props: ['cursor', 'tile-card'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    action: { type: 'text', tier: 'word', limits: LIM.action },
    title: { type: 'text', tier: 'glance', sample: 'detailTitle', limits: LIM.title },
    wordmark: { type: 'text', tier: 'primary', sample: 'product', limits: LIM.wordmark },
    mark: { type: 'image', optional: true },
    shots: { type: 'list', count: [0, 4], of: { type: 'image', crop: true, optional: true } },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'A click on the editor’s primary button and the interface evaporates around it layer by layer, outside in; the button alone glides to the centre of a dark frame, then lets go to the lock-up.',
  defaults: (ctx = {}) => ({ action: ctx.lang === 'zh' ? '发布' : 'Publish', title: copy('detailTitle', ctx.lang || 'en'), wordmark: copy('product', ctx.lang || 'en'), mark: null, shots: [] }),
  plan(s, ctx) {
    const T = timing(s, ctx.lang);
    return { beats: T.beats, reads: [{ text: s.wordmark, lang: ctx.lang }], cues: [{ beat: CLICK / 15, kind: 'accent' }, { beat: STRIP.shell / 15, kind: 'turn' }, { beat: LOGO_IN / 15, kind: 'land' }],
      motion: 'click; layers evaporate outside in; the button takes the centre; lock-up', settled: (LOGO_IN + 20) / 15, peakAt: CLICK / 15, pause: (T.end - LOGO_IN - 20) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en';
    for (const k of ['action', 'title', 'wordmark']) if (s[k] && units(s[k], L) > (L === 'zh' ? LIM[k].zh.chars : LIM[k].en.words)) err.push(`${k} too long`);
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, g = scratch();
    const wf = fontFor(NEUTRAL, 'display', L, 68, 700, 'display'), ww = measure(g, s.wordmark, wf).width;
    return { wf, ww, bf: fontFor(NEUTRAL, 'text', L, 15, 600), tf: fontFor(NEUTRAL, 'text', L, 14, 600), T: timing(s, L) };
  },
  button(f) {
    const press = spring(f - CLICK, { damping: 12, stiffness: 220 }), pressK = f < CLICK ? 1 : 1 - 0.12 * Math.sin(Math.min(1, press) * Math.PI);
    const c = lin(f, STRIP.shell, STRIP.shell + 18, inOutCubic), cPrev = lin(f - 1, STRIP.shell, STRIP.shell + 18, inOutCubic);
    const speed = Math.hypot(BTN.to[0] - BTN.from[0], BTN.to[1] - BTN.from[1]) * Math.abs(c - cPrev);
    return { x: lerp(BTN.from[0], BTN.to[0], c), y: lerp(BTN.from[1], BTN.to[1], c), k: 1 + 0.5 * c, c, press: pressK, blur: Math.min(3, speed * 0.04), a: 1 - ramp(f, BTN_FADE, 12, 'exit'), release: ramp(f, BTN_FADE, 12, 'out') };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, dark = mix(C.ink, '#000000', 0.45);
    const bgDark = lin(f, STRIP.canvas, STRIP.canvas + DUR + 6, inOutQuad);
    // the dark frame under everything, a faint light at its centre once it is dark
    ctx.fillStyle = dark; ctx.fillRect(0, 0, 1920, 1080);
    if (bgDark > 0) { ctx.save(); ctx.globalAlpha = bgDark; ctx.translate(960, 540); ctx.scale(960, 486); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(C.accent, 0.1)); g.addColorStop(0.5, rgba(C.accent, 0.03)); g.addColorStop(0.75, rgba(C.accent, 0)); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
    // the editor's dotted canvas, a layer that fades out
    if (bgDark < 1) { ctx.save(); ctx.globalAlpha = 1 - bgDark; ctx.fillStyle = mix(C.ground, C.line, 0.25); ctx.fillRect(0, 0, 1920, 1080); ctx.fillStyle = rgba(C.ink, 0.1); for (let y = 12; y < 1080; y += 24) for (let x = 12; x < 1920; x += 24) ctx.fillRect(x - 1, y - 1, 2, 2); ctx.restore(); }
    const layer = (L, draw) => { if (L.a <= 0.002) return; ctx.save(); ctx.globalAlpha = L.a; ctx.translate(L.x, L.y); if (L.blur > 0.05) ctx.filter = `blur(${L.blur.toFixed(2)}px)`; draw(); ctx.restore(); };
    const bar = (x, y, w, h, col) => { ctx.fillStyle = col; rrect(ctx, x, y, w, h, h / 2); ctx.fill(); };
    const side = mix(C.ink, C.panel, 0.1), sideText = rgba(C.panel, 0.5), toolbar = mix(C.panel, C.ground, 0.25), hair = rgba(C.ink, 0.08);
    // the canvas frame: a browser-like card with four content cards, which leave first one by one
    layer(strip(f, STRIP.canvas, 0, 40), () => {
      ctx.save(); ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.5), 0.14); ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
      rrect(ctx, 320, 130, 1180, 850, 18); ctx.fillStyle = C.panel; ctx.fill(); ctx.restore();
      ctx.save(); rrect(ctx, 320, 130, 1180, 850, 18); ctx.clip(); ctx.fillStyle = toolbar; ctx.fillRect(320, 130, 1180, 46); ctx.fillStyle = hair; ctx.fillRect(320, 175, 1180, 1); ctx.restore();
      ctx.strokeStyle = hair; ctx.lineWidth = 1.5; rrect(ctx, 320, 130, 1180, 850, 18); ctx.stroke();
      [0.55, 0.4, 0.3].forEach((k, i) => { ctx.beginPath(); ctx.arc(344 + i * 20, 153, 6, 0, Math.PI * 2); ctx.fillStyle = mix(C.dim, C.panel, k); ctx.fill(); });
      bar(420, 140, 380, 26, mix(C.ground, C.line, 0.3)); bar(440, 149, 180, 8, mix(C.dim, C.panel, 0.4));
    });
    for (let i = 0; i < 4; i++) {
      const L = strip(f, STRIP.cards + i * 3, i % 2 ? 70 : -70, 50 + i * 10), b = strip(f, STRIP.canvas, 0, 40);
      layer({ ...L, a: L.a * b.a, x: L.x + b.x, y: L.y + b.y }, () => {
        const x = 320 + 70 + (i % 2) * 560, y = 130 + 120 + Math.floor(i / 2) * 340, img = s.shots?.[i];
        ctx.save(); ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.5), 0.1); ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; rrect(ctx, x, y, 480, 280, 16); ctx.fillStyle = C.panel; ctx.fill(); ctx.restore();
        ctx.save(); rrect(ctx, x, y, 480, 280, 16); ctx.clip();
        if (img && (img.width || img.naturalWidth)) { const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.max(480 / iw, 280 / ih); ctx.drawImage(img, x + (480 - iw * k) / 2, y + (280 - ih * k) / 2, iw * k, ih * k); }
        else { figure(ctx, ['line', 'bars', 'wave', 'grid'][i], x, y, 480, 170, { ...C, dim: C.ink }, { seed: i + 4, ground: mix(C.panel, C.ground, 0.7) }); bar(x + 24, y + 196, 220, 18, mix(C.ink, C.panel, 0.25)); bar(x + 24, y + 232, 150, 14, mix(C.dim, C.panel, 0.45)); }
        ctx.restore(); ctx.strokeStyle = hair; ctx.lineWidth = 1.5; rrect(ctx, x, y, 480, 280, 16); ctx.stroke();
      });
    }
    // the layers sidebar (dark), the properties panel, the toolbar's ends and its middle
    layer(strip(f, STRIP.sidebar, -140, 0), () => {
      ctx.fillStyle = side; ctx.fillRect(0, 0, 240, 1080); ctx.fillStyle = rgba(C.panel, 0.06); ctx.fillRect(239, 0, 1, 1080);
      bar(18, 76, 60, 9, rgba(C.panel, 0.3));
      [[0, 0.62], [1, 0.42], [1, 0.5], [2, 0.36], [2, 0.3], [1, 0.48, true], [2, 0.5], [2, 0.44], [2, 0.52], [2, 0.4], [1, 0.38]].forEach(([d, w, sel], i) => {
        const y = 100 + i * 32;
        if (sel) { rrect(ctx, 10, y, 220, 30, 7); ctx.fillStyle = rgba(C.accent, 0.22); ctx.fill(); ctx.strokeStyle = rgba(C.accent, 0.35); ctx.lineWidth = 1; ctx.stroke(); }
        ctx.strokeStyle = sel ? mix(C.accent, C.panel, 0.6) : sideText; ctx.lineWidth = 1.6; ctx.strokeRect(20 + d * 16, y + 8, 13, 13);
        bar(42 + d * 16, y + 11, 150 * w, 8, sel ? rgba(C.panel, 0.9) : sideText);
      });
    });
    layer(strip(f, STRIP.panel, -90, 20), () => {
      ctx.fillStyle = toolbar; ctx.fillRect(1620, 60, 300, 1020); ctx.fillStyle = hair; ctx.fillRect(1620, 60, 1, 1020);
      let y = 82;
      for (const rows of [2, 1, 1, 1]) {
        bar(1642, y, 70, 10, mix(C.ink, C.panel, 0.2)); y += 24;
        for (let r = 0; r < rows; r++) { for (let k = 0; k < 2; k++) { rrect(ctx, 1642 + k * 132, y, 124, 34, 8); ctx.fillStyle = mix(C.ground, C.line, 0.15); ctx.fill(); bar(1652 + k * 132, y + 13, 50 + 20 * ((r + k) % 2), 8, mix(C.dim, C.panel, 0.3)); } y += 44; }
        y += 8; ctx.fillStyle = hair; ctx.fillRect(1642, y, 256, 1); y += 18;
      }
    });
    const topL = strip(f, STRIP.ends, -80, -60), topR = strip(f, STRIP.ends, 80, -60), shell = strip(f, STRIP.shell, 0, -50);
    layer(topL, () => {
      ctx.fillStyle = toolbar; ctx.fillRect(0, 0, 760, 60); ctx.fillStyle = hair; ctx.fillRect(0, 59, 760, 1);
      drawMark(ctx, 33, 30, 34, s);
      for (let i = 0; i < 6; i++) { const x = 66 + i * 42; if (i === 0) { rrect(ctx, x, 12, 36, 36, 9); ctx.fillStyle = rgba(C.accent, 0.12); ctx.fill(); } ctx.strokeStyle = i === 0 ? C.accent : mix(C.dim, C.ink, 0.3); ctx.lineWidth = 1.8; ctx.strokeRect(x + 11, 23, 14, 14); }
    });
    layer(shell, () => {
      ctx.fillStyle = toolbar; ctx.fillRect(760, 0, 760, 60); ctx.fillStyle = hair; ctx.fillRect(760, 59, 760, 1);
      const tw = measure(ctx, s.title, D.tf).width, x0 = 1140 - (tw + 70) / 2;
      text(ctx, s.title, x0, 35, D.tf, { color: C.ink });
      rrect(ctx, x0 + tw + 12, 19, 58, 22, 6); ctx.fillStyle = mix(C.ground, C.line, 0.4); ctx.fill(); bar(x0 + tw + 22, 27, 38, 6, mix(C.dim, C.panel, 0.2));
    });
    layer(topR, () => {
      ctx.fillStyle = toolbar; ctx.fillRect(1520, 0, 400, 60); ctx.fillStyle = hair; ctx.fillRect(1520, 59, 400, 1);
      [0, 1].forEach((i) => { ctx.beginPath(); ctx.arc(1590 + i * 22, 30, 15, 0, Math.PI * 2); ctx.fillStyle = mix(C.ground, i ? C.line : C.dim, 0.35); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = toolbar; ctx.stroke(); });
      rrect(ctx, 1640, 13, 70, 34, 9); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = rgba(C.ink, 0.13); ctx.lineWidth = 1; ctx.stroke(); bar(1655, 26, 40, 8, mix(C.ink, C.panel, 0.3));
    });
    // the button: pressed on the click, then the only thing left; glides to the centre, grows, lets go
    const B = this.button(f);
    if (B.a > 0.002) {
      ctx.save(); ctx.globalAlpha = B.a; ctx.translate(B.x, B.y); const kk = B.press * (1 + 0.06 * B.release); ctx.scale(kk, kk);
      if (B.c * bgDark > 0.002) { ctx.save(); ctx.globalAlpha *= B.c * bgDark; ctx.scale(260, 160); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(C.accent, 0.38)); g.addColorStop(0.4, rgba(C.accent, 0.1)); g.addColorStop(0.7, rgba(C.accent, 0)); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
      if (B.blur > 0.2) ctx.filter = `blur(${B.blur.toFixed(2)}px)`;
      const w = BTN.w * B.k, h = BTN.h * B.k;
      ctx.save(); ctx.shadowColor = rgba(C.accent, 0.18 + 0.4 * B.c * bgDark); ctx.shadowBlur = 30 + 40 * B.c;
      rrect(ctx, -w / 2, -h / 2, w, h, 10 * B.k); const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, mix(C.accent, C.panel, 0.12)); g.addColorStop(1, C.accent); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      const bf = { ...D.bf, size: D.bf.size * B.k }, lw = measure(ctx, s.action, bf).width, ax = -(lw + 22 * B.k) / 2;
      ctx.strokeStyle = C.onAccent; ctx.lineWidth = 2.4 * B.k * 14 / 24; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const k7 = 7 * B.k; ctx.beginPath(); ctx.moveTo(ax + k7, k7); ctx.lineTo(ax + k7, -k7); ctx.moveTo(ax + k7 - 6 * B.k, -k7 + 6 * B.k); ctx.lineTo(ax + k7, -k7); ctx.lineTo(ax + k7 + 6 * B.k, -k7 + 6 * B.k); ctx.stroke();
      text(ctx, s.action, ax + 22 * B.k, bf.size * 0.36, bf, { color: C.onAccent });
      ctx.restore();
    }
    // the lock-up takes the dark frame: the mark, the wordmark three frames behind it, each focusing in on a spring
    if (f >= LOGO_IN) {
      const lp = spring(f - LOGO_IN, { damping: 14, stiffness: 90 }), wp = spring(f - LOGO_IN - 3, { damping: 14, stiffness: 90 }), k = 0.86 + 0.14 * lp;
      const total = 132 + 30 + D.ww, x0 = 960 - total / 2, light = { ...s, colors: { ...C, ink: C.panel } };
      ctx.save(); ctx.translate(960, 540); ctx.scale(k, k); ctx.translate(-960, -540);
      ctx.save(); ctx.globalAlpha = Math.min(1, lp * 1.4); if (lp < 0.995) ctx.filter = `blur(${((1 - lp) * 9).toFixed(2)}px)`; drawMark(ctx, x0 + 66, 540, 132, light); ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(wp * 1.4); if (wp < 0.995) ctx.filter = `blur(${((1 - wp) * 9).toFixed(2)}px)`;
      text(ctx, s.wordmark, x0 + 162 + (1 - wp) * -16, 540 + D.wf.size * 0.34, D.wf, { color: C.panel }); ctx.restore();
      ctx.restore();
    }
    // the cursor: a wrist arc to the button, presses, leaves
    const cx = lerp(820, BTN.from[0] + 18, lin(f, 4, CLICK - 2, inOutQuad)), cy = lerp(640, BTN.from[1] + 4, lin(f, 4, CLICK - 2, CURY));
    drawCursor(ctx, cx, cy, { h: 38, press: f >= CLICK - 1 && f < CLICK + 3 ? 1 : 0, alpha: 1 - ramp(f, CLICK + 6, 10, 'out'), colors: C });
  },
  // the button's centre and the sidebar's centre (compare pairs them with the upstream's)
  track(u) { const f = u * 15, B = this.button(f), S = strip(f, STRIP.sidebar, -140, 0); return [[B.x, B.y], [120 + S.x, 540 + S.y]]; },
  blur() { return false; },
};


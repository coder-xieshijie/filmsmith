// param-dial — one parameter drives a layout, shown in a design tool's own language: a row of blocks under a
// selection frame with eight handles, the gap between them measured and badged; a big readout with a dial ruler
// above. The value draws back a little, swings out, holds a breath, then springs back past its start and settles;
// every block, measure, badge and the readout follow the one number in the same frame.
// Adapted from video-shotcraft demos/interaction/autolayout-gap-dial/AutolayoutGapDial.tsx (card
// references/shots/interaction/autolayout-gap-dial.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React or Remotion); colours by role (the selection in ink, the
// measures, badge, needle and the hot readout in the accent, the active block in ink with ground text); the site's
// navigation labels, the layer name and the system font replaced by slots and type roles; block widths measured from
// the film's labels in either language; the per-block horizontal blur drawn as a few offset copies.
import { clamp, mix, rgba, rrect, text, measure, scratch } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, readTime } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';

const FRAMES = 150, BH = 120, ROW_Y = 684, PRE = [22, 32], GROW = 66, HOLD = 86, OVER = 0.45, RULER_W = 760, UNIT = 6.5;
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);

// The parameter at frame f: anticipation (rest → pre), the swing out (→ peak), a held breath, an under-damped spring
// back past rest (the overshoot squeezed × 0.45 so it never goes below zero).
export const valueAt = (f, s) => {
  const r = s.rest, pre = s.pre, peak = s.peak;
  if (f < PRE[1]) return r + (pre - r) * ramp(f, PRE[0], PRE[1] - PRE[0], 'swift');
  if (f < HOLD) return pre + (peak - pre) * ramp(f, PRE[1], GROW - PRE[1], 'swift');
  const k = springAt(f - HOLD, { damping: 9, stiffness: 80, mass: 1.1 }), k2 = k > 1 ? 1 + (k - 1) * OVER : k;
  return peak + (r - peak) * k2;
};
const rowOf = (ws, gap) => { const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = (1920 - total) / 2; const xs = ws.map((w) => { const v = x; x += w + gap; return v; }); return { total, x0: (1920 - total) / 2, xs }; };

const icon = (ctx, x, y, s, color) => {
  ctx.save(); ctx.fillStyle = color;
  [[1, 1], [5.3, 0.7], [9.6, 0.45]].forEach(([bx, a]) => { ctx.globalAlpha = a; rrect(ctx, x + (bx / 14) * s, y + (3 / 14) * s, (3.4 / 14) * s, (8 / 14) * s, s / 14); ctx.fill(); });
  ctx.restore();
};

export default {
  id: 'param-dial', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 10, max: 10 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    label: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } }, default: { en: 'Layout · Gap', zh: '布局 · 间距' } },
    layer: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } }, default: { en: 'Top bar', zh: '顶栏' } },
    items: { type: 'list', count: [3, 6], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } },
  },
  defaults: (ctx = {}) => ({
    label: { en: 'Layout · Gap', zh: '布局 · 间距' }, layer: { en: 'Top bar', zh: '顶栏' }, unit: 'px',
    items: [...copy('nav', ctx.lang), copy('cards', ctx.lang)[5].title], rest: 12, pre: 6, peak: 104, step: 2, widths: null,
  }),
  plan(s, ctx = {}) {
    return { beats: FRAMES / 15, reads: readTime(pick(s.label, ctx.lang || 'en'), ctx.lang || 'en'), cues: [{ beat: PRE[1] / 15, kind: 'accent' }, { beat: HOLD / 15, kind: 'turn' }, { beat: 118 / 15, kind: 'land' }],
      motion: [], settled: 118 / 15, shots: 1, peakAt: GROW / 15, pause: { from: GROW / 15, to: HOLD / 15 } };
  },
  validate(s) { const n = (s.items || []).length; return n < 3 || n > 6 ? [`items: ${n}, want 3–6`] : []; },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, label: pick(s.label, lang), layer: pick(s.layer, lang), unit: pick(s.unit, lang) };
    const g = scratch(), f = F(S, 'text', 36, 600);
    const ws = s.widths || S.items.map((t, i) => Math.round(measure(g, t, f).width + 120 + (i === 0 ? 26 : 0)));
    const layer = () => { const W = Math.max(...ws) + 100, H = BH + 100, cv = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(W, H); cv.width = W; cv.height = H; return cv.getContext('2d', { willReadFrequently: true }); };
    return { S, ws, A: layer(), B: layer() };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, c = s.colors, f = u * 15, lang = S.lang, n = D.ws.length;
    const gap = valueAt(f, S), shown = Math.max(0, Math.round(gap / S.step) * S.step);
    const v = valueAt(f + 0.5, S) - valueAt(f - 0.5, S), moving = Math.min(1, Math.abs(v) / 1.2);
    let hot = 0;
    for (let k = 0; k <= 6; k++) hot = Math.max(hot, Math.min(1, Math.abs(valueAt(f - k + 0.5, S) - valueAt(f - k - 0.5, S)) / 1.5) * (1 - k / 7));
    const pulse = 1 + 0.06 * Math.abs(Math.sin((Math.PI * gap) / 2)) * moving;
    const { total, x0, xs } = rowOf(D.ws, gap);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = rgba(c.ink, 0.13);                                                      // the canvas's dot grid
    for (let y = 16; y < 1080; y += 36) for (let x = 6; x < 1920; x += 36) { const d = Math.hypot((x - 960) / 998, (y - 670) / 432); if (d < 1) { ctx.globalAlpha = Math.min(1, (1 - d) * 1.25); ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); } }
    ctx.globalAlpha = 1;
    const cam = 1 + 0.025 * ramp(f, 0, FRAMES, 'smooth');
    ctx.save(); ctx.translate(960, 562); ctx.scale(cam, cam); ctx.translate(-960, -562);
    // readout: label, the number, the unit
    const eb = ramp(f, 4, 18, 'snappy'), lf = { ...F(S, 'mono', infoSize(lang) - (lang === 'zh' ? 0 : 3), 600, 'label') };
    lf.spacing = (lang === 'zh' ? 0.06 : 0.05 + (1 - eb) * 0.4) * lf.size;            // the look's caps tracking is too wide for mixed case
    const lw = measure(ctx, S.label, lf).width;
    ctx.save(); ctx.globalAlpha = eb; icon(ctx, 960 - (lw + 38) / 2, 150, 22, c.dim); text(ctx, S.label, 960 - (lw + 38) / 2 + 38, 161, lf, { color: c.dim, baseline: 'middle' }); ctx.restore();
    const nf = { ...F(S, 'display', 196, 300) }, uf = F(S, 'text', 60, 500), numIn = ramp(f, 8, 18, 'snappy');
    nf.spacing = (nf.spacing || 0) - 0.05 * 196;
    const base = 386, right = 960 - (196 * 1.9 + 18 + 60 * 1.9) / 2 + 196 * 1.9;          // the number's box is 1.9 em, right-aligned
    ctx.save(); ctx.beginPath(); ctx.rect(0, 186, 1920, 220); ctx.clip();
    ctx.translate(0, (1 - numIn) * 231);
    ctx.save(); ctx.translate(right, base); ctx.scale(pulse, pulse);
    if (hot > 0.05) { ctx.shadowColor = rgba(c.accent, 0.35 * hot); ctx.shadowBlur = 40 * hot; }
    text(ctx, String(shown), 0, 0, nf, { color: mix(c.ink, c.accent, hot), align: 'right' });
    ctx.restore();
    text(ctx, S.unit, right + 18, base, uf, { color: mix(c.dim, c.ground, 0.25) });
    ctx.restore();
    // the dial ruler: ticks every 2 scrolling past the needle
    const rx = 960 - RULER_W / 2, ry = 414, rIn = ramp(f, 12, 16, 'out');
    ctx.save(); ctx.globalAlpha = rIn;
    ctx.save(); ctx.beginPath(); ctx.rect(rx, ry - 20, RULER_W, 96); ctx.clip();
    const mf = F(S, 'mono', 22, 500);
    for (let q = -60; q <= 180; q += 2) {
      const x = RULER_W / 2 + (q - gap) * UNIT;
      if (x < -10 || x > RULER_W + 10) continue;
      const major = q % 10 === 0, edge = clamp(Math.min(x, RULER_W - x) / 150), near = Math.abs(x - RULER_W / 2);
      ctx.fillStyle = rgba(c.ink, q < 0 ? 0.08 : major ? 0.5 : 0.22); ctx.globalAlpha = rIn * edge;
      ctx.fillRect(rx + x - 1, ry + 76 - (major ? 30 : 14), 2, major ? 30 : 14);
      if (major && q >= 0) { ctx.globalAlpha = rIn * edge * clamp((near - 18) / 22); text(ctx, String(q), rx + x, ry + 30, mf, { color: c.dim, align: 'center' }); }
    }
    ctx.restore();
    ctx.globalAlpha = rIn;
    const bl = ctx.createLinearGradient(rx, 0, rx + RULER_W, 0); bl.addColorStop(0, rgba(c.ink, 0)); bl.addColorStop(0.2, rgba(c.ink, 0.18)); bl.addColorStop(0.8, rgba(c.ink, 0.18)); bl.addColorStop(1, rgba(c.ink, 0));
    ctx.fillStyle = bl; ctx.fillRect(rx, ry + 75, RULER_W, 1);
    ctx.shadowColor = rgba(c.accent, 0.35 + hot * 0.4); ctx.shadowBlur = 8 + hot * 14;
    rrect(ctx, 960 - 1.5, ry + 76 - 44, 3, 50, 1.5); ctx.fillStyle = c.accent; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.beginPath(); ctx.moveTo(952, ry + 22); ctx.lineTo(968, ry + 22); ctx.lineTo(960, ry + 32); ctx.closePath(); ctx.fill();
    ctx.restore();
    // the blocks, each blurred along x by its own speed
    const tf = F(S, 'text', 36, 600), tfa = F(S, 'text', 36, 650), mid = (n - 1) / 2;
    D.ws.forEach((w, i) => {
      const inP = ramp(f, 1 + i * 2, 16, 'snappy'), active = i === 0, blur = Math.min(9, Math.abs((i - mid) * v) * 0.5);
      const g = D.A, PAD = 50;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, D.A.canvas.width, D.A.canvas.height); g.translate(PAD, PAD);
      g.save(); g.shadowColor = rgba('#000000', 0.35); g.shadowBlur = 30; g.shadowOffsetY = 12;
      rrect(g, 0, 0, w, BH, 24); g.fillStyle = active ? c.ink : c.panel; g.fill(); g.restore();
      rrect(g, 0.5, 0.5, w - 1, BH - 1, 24); g.lineWidth = 1; g.strokeStyle = active ? rgba(c.ink, 0.7) : rgba(c.ink, 0.09); g.stroke();
      const label = S.items[i], tw = measure(g, label, active ? tfa : tf).width, gx = (w - tw - (active ? 26 : 0)) / 2;
      if (active) { g.beginPath(); g.arc(gx + 6, BH / 2, 6, 0, Math.PI * 2); g.fillStyle = c.ground; g.fill(); }
      text(g, label, gx + (active ? 26 : 0), BH / 2 + 1, active ? tfa : tf, { color: active ? c.ground : rgba(c.ink, 0.86), baseline: 'middle' });
      let src = D.A.canvas;
      if (blur > 0.5) {                                    // a horizontal box blur: shifted copies added at 1/N (premultiplied, exact)
        const b = D.B, N = Math.max(3, Math.ceil(blur * 2.4) | 1), span = blur * 1.7;
        b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, D.B.canvas.width, D.B.canvas.height);
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = 1 / N;
        for (let k = 0; k < N; k++) b.drawImage(D.A.canvas, ((k / (N - 1)) * 2 - 1) * span, 0);
        b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; src = D.B.canvas;
      }
      ctx.save(); ctx.globalAlpha = inP; ctx.drawImage(src, xs[i] - PAD, ROW_Y - BH / 2 + (1 - inP) * 34 - PAD); ctx.restore();
    });
    // the selection frame, its handles and the layer name with the row's size
    const selIn = springAt(f - 4, { damping: 16, stiffness: 140 }), pad = 30, grow = (1 - selIn) * 26;
    const sx = x0 - pad - grow, sy = ROW_Y - BH / 2 - pad - grow, sw = total + pad * 2 + grow * 2, sh = BH + pad * 2 + grow * 2;
    ctx.save(); ctx.globalAlpha = Math.min(1, selIn * 1.4);
    rrect(ctx, sx + 1, sy + 1, sw - 2, sh - 2, 6); ctx.lineWidth = 2; ctx.strokeStyle = rgba(c.ink, 0.92); ctx.stroke();
    icon(ctx, sx, sy - 50, 20, rgba(c.ink, 0.92));
    const ln = F(S, 'text', 26, 560), lnw = measure(ctx, S.layer, ln).width;
    text(ctx, S.layer, sx + 30, sy - 33, ln, { color: rgba(c.ink, 0.92), baseline: 'middle' });
    text(ctx, `${Math.round(total)} × ${BH}`, sx + 30 + lnw + 16, sy - 33, F(S, 'mono', 22, 500), { color: c.dim, baseline: 'middle' });
    [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]].forEach(([hx, hy], i) => {
      const hp = springAt(f - 7 - i * 1.2, { damping: 13, stiffness: 240 });
      if (hp <= 0) return;
      ctx.save(); ctx.translate(sx + hx * sw, sy + hy * sh); ctx.scale(hp, hp);
      rrect(ctx, -8, -8, 16, 16, 3); ctx.fillStyle = c.ground; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(c.ink, 0.92); ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
    // the measures between blocks: extension lines, the span, its end ticks, the badge
    const mOp = ramp(f, 14, 10, 'out'), bf = F(S, 'text', 28, 700), cy = ROW_Y + BH / 2 + 74, ext = ROW_Y + BH / 2 + 34;
    xs.slice(0, -1).forEach((x, i) => {
      const gx = x + D.ws[i], bp = ramp(f, 14 + i * 2, 12, 'snappy');
      ctx.save(); ctx.globalAlpha = mOp;
      ctx.fillStyle = rgba(c.accent, 0.7);
      for (const lx of [gx, gx + gap]) for (let yy = 0; yy < 58; yy += 7) ctx.fillRect(lx - 0.75, ext + yy, 1.5, Math.min(3.85, 58 - yy));
      ctx.shadowColor = rgba(c.accent, 0.4); ctx.shadowBlur = 10; ctx.fillStyle = c.accent;
      ctx.fillRect(gx, cy - 1, Math.max(0, gap), 2); ctx.shadowColor = 'transparent';
      ctx.fillRect(gx - 1, cy - 8, 2, 16); ctx.fillRect(gx + gap - 1, cy - 8, 2, 16);
      if (bp > 0) {
        const t = String(shown), tw = Math.max(64, measure(ctx, t, bf).width + 28), sc = pulse * (0.7 + 0.3 * bp);
        ctx.globalAlpha = mOp * bp; ctx.translate(gx + gap / 2, cy + 20 + (1 - bp) * 10 + 22); ctx.scale(sc, sc);
        ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        rrect(ctx, -tw / 2, -22, tw, 44, 10); ctx.fillStyle = c.accent; ctx.fill(); ctx.shadowColor = 'transparent';
        text(ctx, t, 0, 1, bf, { color: c.onAccent || c.panel, align: 'center', baseline: 'middle' });
      }
      ctx.restore();
    });
    ctx.restore();
  },
  track(u, s, cx, D) {
    const f = u * 15, { xs } = rowOf(D.ws, valueAt(f, D.S)), n = D.ws.length;
    const y = (i) => ROW_Y + (1 - ramp(f, 1 + i * 2, 16, 'snappy')) * 34;
    return [[xs[0] + D.ws[0] / 2, y(0)], [xs[n - 1] + D.ws[n - 1] / 2, y(n - 1)]];
  },
};

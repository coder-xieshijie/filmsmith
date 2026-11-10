// stream-brake — a stream of lines (tokens, log lines, frames) runs past at speed, brakes exponentially and stops with
// the key item exactly in the reading band, which then locks to the accent. Theory: the change from motion to stillness
// captures attention (Abrams & Christ 2003); exponential braking reads as friction. references/transitions.md#stream-brake.
// Variants (batch 7): `layout: 'rows'` runs card rows of 72 / 94 / 116 px (a fixed pattern, 20 px apart) instead of
// lines, on the curve (0.45, 0, 0.06, 1), stops the key row at the frame's middle and locks it by lifting it (1.03, a
// deeper shadow, a 2 px accent outline) while every other row dims to 0.38; `brake: 'overshoot'` sprints (sine in) to
// 430 px short of the stop in 38 frames, runs 30 px past it in 9 (cubic out) and comes back in 4 (quad out), then locks.
// Adapted from video-shotcraft demos/data/scroll-brake-moves/ChangelogScrollBrake.tsx and BrakeReticleLock.tsx,
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0 (as filed by batch 7); the changelog copy and
// the reticle are not taken (reticle-lock's corners variant fires on the stop).

import { seg, cubicOut, mix, rgba, text, measure, ground, rrect } from './util.js';
import { bez } from '../motion.js';

const BRAKE = [0, 0.8], LOCK = [0.8, 1];
const ROWS_CURVE = bez(0.45, 0, 0.06, 1), PATTERN = [72, 94, 116], GAP = 20;
const rowH = (i) => PATTERN[(i * 7 + (i >> 2)) % 3];
const rowTop = (i) => { let y = 0; for (let k = 0; k < i; k++) y += rowH(k) + GAP; return y; };     // from row 0's top
// overshoot: 38 + 9 + 4 frames of travel (px from the start, D the full distance), then the lock
const OVER_F = 51, OVER_ALL = 66;
const overPx = (f, D) => {
  if (f <= 38) return (D - 430) * (1 - Math.cos((Math.PI / 2) * (f / 38)));
  if (f <= 47) return D - 430 + 460 * cubicOut((f - 38) / 9);
  const u = Math.min(1, (f - 47) / 4); return D + 30 - 30 * (1 - (1 - u) * (1 - u));
};

const defaultLine = (i) => `  ok   item_${String(i + 1).padStart(3, '0')}   ${(0.8 + ((i * 37) % 23) / 10).toFixed(1)} s`;

export default {
  name: 'stream-brake',
  tier: 'T1',
  beats: 2,
  modes: ['trace', 'phosphor', 'tally'],
  roles: ['ground', 'ink', 'dim', 'muted', 'accent', 'panel', 'band', 'line', 'deep'],
  from: 'the head of a long stream (log, tokens, frames)',
  to: 'the key item stopped in the reading band, the band locked',
  interpolates: ['stream position (exponential brake)', 'band colour (lock)'],
  summary: 'A stream of lines runs past at speed, brakes exponentially and stops with the key item in the reading band.',
  theory: 'Motion turning to stillness captures attention (Abrams & Christ 2003); an exponential brake reads as friction.',
  defaults: {
    count: 128,                          // items before the key item
    line: defaultLine,                   // (i) => string, the item at index i (0 … count − 1)
    key: { mark: 'PASS', text: '  128 items · 0 failed' },   // the item it stops on: accent mark + rest
    after: ['        report → report.json'],                  // lines after the key item
    start: 0,                            // index in the band at p = 0
    k: 4.5,                              // brake: e-foldings over the run
    band: 600, lineHeight: 64,           // reading band baseline, line pitch
    window: [250, 980],                  // the stream's visible window (y)
    x: 140, bandX: [100, 1820],
    mono: { family: 'monospace', weight: 500, size: 40 },
    colors: { ground: '#04080C', ink: '#E6EEF6', dim: '#848C94', muted: '#AAB0B6', accent: '#88BFFF', panel: '#07111B', band: '#0B1724', line: '#1A2C3D', deep: '#3F86D6' },
  },
  // variant options (absent by default): layout 'rows', brake 'overshoot'
  beatsFor: (P) => (P.brake === 'overshoot' ? Math.round((OVER_ALL / 15) * 4) / 4 : 2),
  rest(side, P) { if (P.layout === 'rows') return { px: rowTop(side === 'from' ? P.start : P.count), pos: P.count, lock: side === 'from' ? 0 : 1 }; return side === 'from' ? { pos: P.start, lock: 0 } : { pos: P.count, lock: 1 }; },
  at(p, P) {
    if (P.layout === 'rows' || P.brake === 'overshoot') {
      // distance travelled in px, then back to an item position (rows: through the rows' own heights)
      const D = P.layout === 'rows' ? rowTop(P.count) - rowTop(P.start) : (P.count - P.start) * P.lineHeight;
      let px, lock;
      if (P.brake === 'overshoot') { const f = Math.min(1, Math.max(0, p)) * OVER_ALL; px = p >= 1 ? D : overPx(f, D); lock = cubicOut(seg(f, OVER_F, OVER_ALL)); }
      else { px = D * ROWS_CURVE(seg(p, ...BRAKE)); lock = cubicOut(seg(p, ...LOCK)); }
      if (P.layout !== 'rows') return { pos: P.start + px / P.lineHeight, lock };
      return { px: rowTop(P.start) + px, pos: P.count, lock };
    }
    const u = seg(p, ...BRAKE), K = P.k;
    const pos = u >= 1 ? P.count : P.start + (P.count - P.start) * (1 - Math.exp(-K * u)) / (1 - Math.exp(-K));
    return { pos, lock: cubicOut(seg(p, ...LOCK)) };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    if (P.layout === 'rows') { this.paintRows(ctx, S, P); return; }
    const C = P.colors, LH = P.lineHeight, B = P.band, [top, bot] = P.window, f = P.mono;
    const [bx0, bx1] = P.bandX, by = B - LH * 0.72, bh = LH;
    ctx.fillStyle = mix(C.panel, C.band, S.lock); ctx.fillRect(bx0, by, bx1 - bx0, bh);
    ctx.fillStyle = mix(C.line, C.accent, S.lock); ctx.fillRect(bx0, by, 6, bh);
    ctx.fillStyle = mix(C.line, C.deep, S.lock); ctx.fillRect(bx0, by, bx1 - bx0, 2); ctx.fillRect(bx0, by + bh - 2, bx1 - bx0, 2);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, top, ctx.canvas.width, bot - top); ctx.clip();
    const i0 = Math.floor(S.pos - (B - top) / LH) - 1, i1 = Math.ceil(S.pos + (bot - B) / LH) + 1;
    for (let i = Math.max(0, i0); i <= i1; i++) {
      const y = B + (i - S.pos) * LH, inBand = Math.abs(y - B) < LH / 2;
      if (i < P.count) text(ctx, P.line(i), P.x, y, f, { color: inBand ? C.ink : C.dim });
      else if (i === P.count) {
        const bold = { ...f, weight: 700 };
        text(ctx, P.key.mark, P.x, y, bold, { color: inBand ? mix(C.ink, C.accent, S.lock) : C.muted });
        text(ctx, P.key.text, P.x + measure(ctx, P.key.mark, bold).width, y, f, { color: inBand ? C.ink : C.muted });
      } else if (P.after[i - P.count - 1] != null) text(ctx, P.after[i - P.count - 1], P.x, y, f, { color: C.dim });
    }
    ctx.restore();
    // soft edges of the window: a mask in the ground colour, not a second content
    for (const [y0, y1] of [[top, top + 110], [bot, bot - 110]]) {
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, rgba(C.ground, 1)); g.addColorStop(1, rgba(C.ground, 0));
      ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), ctx.canvas.width, 110);
    }
  },
  // rows: the key row's middle at the frame's middle when stopped; S.px is the offset (from row 0's top) of the row in the key's place
  paintRows(ctx, S, P) {
    const C = P.colors, f = P.mono, [top, bot] = P.window, kx = P.bandX[0], kw = P.bandX[1] - P.bandX[0];
    const y0 = 540 - rowH(P.count) / 2 - S.px;   // row 0's top: S.px is the offset of the row standing in the key's place
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, ctx.canvas.width, bot - top); ctx.clip();
    for (let i = 0, y = y0; i <= P.count + P.after.length; y += rowH(i) + GAP, i++) {
      const h = rowH(i);
      if (y > bot || y + h < top) continue;
      const key = i === P.count, k = key ? 1 + 0.03 * S.lock : 1, a = key ? 1 : 1 - 0.62 * S.lock;
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(kx + kw / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(kx + kw / 2), -(y + h / 2));
      ctx.shadowColor = rgba('#000000', key ? 0.25 + 0.3 * S.lock : 0.25); ctx.shadowBlur = key ? 12 + 24 * S.lock : 12; ctx.shadowOffsetY = key ? 4 + 8 * S.lock : 4;
      rrect(ctx, kx, y, kw, h, 14); ctx.fillStyle = key ? mix(C.panel, C.band, S.lock) : C.panel; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = key ? mix(C.line, C.accent, S.lock) : C.line; ctx.lineWidth = key ? 2 : 1.5; ctx.stroke();
      const ty = y + h / 2 + f.size * 0.35;
      if (i < P.count) text(ctx, P.line(i), P.x, ty, f, { color: C.dim });
      else if (key) { const bold = { ...f, weight: 700 }; text(ctx, P.key.mark, P.x, ty, bold, { color: mix(C.ink, C.accent, S.lock) }); text(ctx, P.key.text, P.x + measure(ctx, P.key.mark, bold).width, ty, f, { color: C.ink }); }
      else if (P.after[i - P.count - 1] != null) text(ctx, P.after[i - P.count - 1], P.x, ty, f, { color: C.dim });
      ctx.restore();
    }
    ctx.restore();
    for (const [ya, yb] of [[top, top + 110], [bot, bot - 110]]) {
      const g = ctx.createLinearGradient(0, ya, 0, yb);
      g.addColorStop(0, rgba(C.ground, 1)); g.addColorStop(1, rgba(C.ground, 0));
      ctx.fillStyle = g; ctx.fillRect(0, Math.min(ya, yb), ctx.canvas.width, 110);
    }
  },
  track: (S, P) => (P.layout === 'rows' ? [[0, S.px ?? rowTop(P.count)]] : [[0, S.pos * P.lineHeight]]),
};

// stream-brake — a stream of lines (tokens, log lines, frames) runs past at speed, brakes exponentially and stops with
// the key item exactly in the reading band, which then locks to the accent. Theory: the change from motion to stillness
// captures attention (Abrams & Christ 2003); exponential braking reads as friction. references/transitions.md#stream-brake.

import { seg, cubicOut, mix, rgba, text, measure, ground } from './util.js';

const BRAKE = [0, 0.8], LOCK = [0.8, 1];

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
  rest(side, P) { return side === 'from' ? { pos: P.start, lock: 0 } : { pos: P.count, lock: 1 }; },
  at(p, P) {
    const u = seg(p, ...BRAKE), K = P.k;
    const pos = u >= 1 ? P.count : P.start + (P.count - P.start) * (1 - Math.exp(-K * u)) / (1 - Math.exp(-K));
    return { pos, lock: cubicOut(seg(p, ...LOCK)) };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
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
  track: (S, P) => [[0, S.pos * P.lineHeight]],
};

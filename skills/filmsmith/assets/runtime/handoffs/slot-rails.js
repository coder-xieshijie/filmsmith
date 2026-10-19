// slot-rails — two rails are the top and bottom edges of a clip slot: the word leaves up through the top rail, the
// rails breathe to the next word's cap height, the next word rises in from the bottom rail. An optional dimension line
// states the gap, read from the same value that places the rails. Theory: common region groups the successive words
// (Palmer 1992); number and geometry share one source. references/transitions.md#slot-rails.

import { seg, settle, expOut, text, measure, scratch, ground } from './util.js';

const OUT = [0, 0.32], IN = [0.24, 0.72], BREATHE = [0.2, 1];

export default {
  name: 'slot-rails',
  tier: 'T0',
  beats: 1,
  modes: ['blueprint', 'plakat', 'morph'],
  roles: ['ground', 'ink', 'line', 'accent'],
  from: 'a word in the slot',
  to: 'the next word in the slot, the rails at its cap height',
  interpolates: ['outgoing word y', 'incoming word y', 'rail gap (and its number)'],
  summary: 'A word leaves up through the top rail, the rails breathe to the next word, which rises in from the bottom rail.',
  theory: 'Common region (Palmer 1992): the container groups the words that pass through it; the number and the rails share one value.',
  defaults: {
    x: 400,                              // left edge of the words
    rails: [340, 1540],                  // rail extent (the slot's clip, x)
    cy: 560,                             // slot centre
    pad: 12,                             // between a rail and the cap height / baseline
    ticks: 30,                           // tick spacing on the rails (0: none)
    font: { family: 'sans-serif', weight: 600 },
    from: { text: 'PARSE', size: 210 },
    to: { text: 'INDEX', size: 300, accent: false },
    dimension: { x: 1640, unit: 'px' },  // the measured gap at the side; false to hide
    mono: { family: 'monospace', weight: 500, size: 40 },
    colors: { ground: '#0A2652', ink: '#EAF3FF', line: '#9FD3FF', accent: '#FFB547' },
  },
  prepare(P) {
    const g = scratch();
    const cap = (w) => measure(g, 'H', { ...P.font, size: w.size }).actualBoundingBoxAscent;
    const c0 = cap(P.from), c1 = cap(P.to);
    return { c0, c1, g0: c0 + 2 * P.pad, g1: c1 + 2 * P.pad };
  },
  rest(side, P, D) {
    return side === 'from' ? { gap: D.g0, dyOld: 0, dyNew: null } : { gap: D.g1, dyOld: null, dyNew: 0 };
  },
  at(p, P, D) {
    const b = settle(seg(p, ...BREATHE), 6.4);
    const gap = b >= 1 ? D.g1 : D.g0 + (D.g1 - D.g0) * b;
    const out = seg(p, ...OUT);
    const dyOld = out < 1 ? -out * out * (gap + 40) : null;   // accelerates up through the top rail
    const inn = expOut(seg(p, ...IN));
    const dyNew = p >= IN[0] ? (1 - inn) * (D.c1 + 2 * P.pad + 30) : null;
    return { gap, dyOld, dyNew };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const C = P.colors, [L, R] = P.rails, top = P.cy - S.gap / 2, bot = P.cy + S.gap / 2;
    ctx.save();
    ctx.beginPath(); ctx.rect(L, top, R - L, S.gap); ctx.clip();
    const word = (w, dy) => text(ctx, w.text, P.x, bot - P.pad + dy, { ...P.font, size: w.size }, { color: w.accent ? C.accent : C.ink });
    if (S.dyOld != null) word(P.from, S.dyOld);
    if (S.dyNew != null) word(P.to, S.dyNew);
    ctx.restore();
    // rails with ticks
    ctx.fillStyle = C.line;
    ctx.fillRect(L - 30, top - 1, R - L + 60, 2); ctx.fillRect(L - 30, bot - 1, R - L + 60, 2);
    if (P.ticks > 0) {
      for (let x = L, i = 0; x <= R; x += P.ticks, i++) {
        const h = i % 5 === 0 ? 14 : 7;
        ctx.fillRect(x, top - 1 - h, 1, h); ctx.fillRect(x, bot + 1, 1, h);
      }
    }
    if (!P.dimension) return;
    // dimension line: extension lines, the arrowed measure, its live number
    const DX = P.dimension.x;
    ctx.fillRect(R + 40, top - 1, DX - R - 10, 1); ctx.fillRect(R + 40, bot, DX - R - 10, 1);
    ctx.fillRect(DX - 1, top, 2, S.gap);
    const arrow = (y, dir) => { ctx.beginPath(); ctx.moveTo(DX, y); ctx.lineTo(DX - 9, y + dir * 22); ctx.lineTo(DX + 9, y + dir * 22); ctx.closePath(); ctx.fill(); };
    arrow(top, 1); arrow(bot, -1);
    text(ctx, `${Math.round(S.gap)} ${P.dimension.unit}`, DX + 26, P.cy + P.mono.size * 0.35, P.mono, { color: C.ink });
  },
  // a hidden word is tracked where it left or will come from, so its (dis)appearance is not counted as speed
  track: (S, P, D) => [[P.rails[0], P.cy - S.gap / 2], [P.rails[0], P.cy + S.gap / 2], [P.x, P.cy + (S.dyOld ?? -(S.gap + 40))], [P.x, P.cy + (S.dyNew ?? D.c1 + 2 * P.pad + 30)]],
};

// scramble-resolve — a line resolves left to right: each cell shows a random glyph from the content's own alphabet
// (hex, token pieces), re-rolled at a fixed rate, until its lock time; the lock order is the reading order.
// Theory: locking in reading order never competes with reading; progressive refinement.
// references/transitions.md#scramble-resolve.

import { text, measure, scratch, ground } from './util.js';
import { hash } from '../rng.js';

const timeOf = (P) => P.scramble + Math.max(0, P.text.length - 1) * P.per;

export default {
  name: 'scramble-resolve',
  tier: 'T0',
  beats: 3,
  beatsFor: (P) => Math.max(1, Math.ceil((timeOf(P) / 0.5) * 2) / 2),
  modes: ['phosphor', 'trace'],
  roles: ['ground', 'ink', 'deep', 'accent'],
  from: 'an empty line (or the prompt before it)',
  to: 'the resolved line, the cursor after it',
  interpolates: ['cells shown', 'cells locked (left to right)', 'scrambled glyph per cell (seeded, at a fixed rate)'],
  summary: 'A line resolves left to right; each cell flickers through the content\'s own alphabet until it locks.',
  theory: 'Locking in reading order does not compete with reading; progressive refinement of a known slot.',
  defaults: {
    text: 'sha256 9f2c41e0 · signature OK',
    alphabet: '0123456789abcdef',
    accentFrom: 'OK',                    // substring (or index) from which locked cells are in the accent; null for none
    x: 260, y: 540,
    per: 0.035,                          // s between locks (at 120 BPM; scales with the beats)
    scramble: 0.35,                      // s a cell scrambles before the first lock
    appear: 0.012,                       // s between cells lighting up
    rate: 24,                            // re-rolls per second
    cursor: true,
    seed: 1,
    mono: { family: 'monospace', weight: 500, size: 44 },
    colors: { ground: '#04080C', ink: '#E6EEF6', deep: '#3F86D6', accent: '#88BFFF' },
  },
  prepare(P) {
    const cw = measure(scratch(), '0', P.mono).width;
    const a = P.accentFrom == null ? Infinity : typeof P.accentFrom === 'number' ? P.accentFrom : P.text.indexOf(P.accentFrom);
    const beats = this.beatsFor(P);
    return { cw, acc: a < 0 ? Infinity : a, T: beats * 0.5 };
  },
  rest(side, P, D) { return { t: side === 'from' ? 0 : D.T }; },
  at(p, P, D) { return { t: p * D.T }; },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors, t = S.t, s = P.text, frame = Math.floor(t * P.rate);
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === ' ' || !(t > i * P.appear)) continue;
      const locked = t >= P.scramble + i * P.per;
      const g = locked ? ch : P.alphabet[Math.floor(hash(i + 1000 * P.seed, frame) * P.alphabet.length)];
      text(ctx, g, P.x + i * D.cw, P.y, P.mono, { color: locked ? (i >= D.acc ? C.accent : C.ink) : C.deep });
    }
    if (P.cursor && t > 0) {
      const n = Math.min(s.length, Math.max(0, Math.floor((t - P.scramble) / P.per) + 1));
      const h = P.mono.size * 1.1;
      ctx.fillStyle = C.accent;
      ctx.fillRect(P.x + n * D.cw + 4, P.y - h * 0.79, D.cw * 0.83, h);
    }
  },
};

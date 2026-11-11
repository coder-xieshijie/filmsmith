// pencil-loop — the grease pencil (a china marker) marks the pick by hand: a loose loop drawn round one cell by arc
// length, spiralling in a little so its end crosses its start, while the other rows step back; or a wavering
// underline under the address on the last bar. The film's one accent, never over a frame on a dark ground.
// From the strip template (lib/handoffs/strip.js pencilLoop, pencilUnderline; choreo.js loop 1 beat, step 0.5;
// lockup's underline 0.75 beat).
import { clamp } from '../../../handoffs/util.js';
import { cubicInOut } from '../../../motion.js';
import { paintRows, lightbox, fonts, cellRect, pencilLoop, pencilUnderline, sheetState, text, measure } from '../../prop/film-strip/reel.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

const ROWS = [['Thread', 40], ['Ink', 34.9], ['Plakat', 46], ['Blueprint', 43.2], ['Phosphor', 42.6], ['Tally', 32], ['Trace', 36], ['Morph', 32]];
export default {
  id: 'pencil-loop', kind: 'motion',
  tier: 'T1', family: 'line-path',
  beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'muted', 'accent', 'base'],
  from: 'the contact sheet at rest (or the address set)', to: 'one cell looped in the pencil and the other rows stepped back (or the address underlined)',
  interpolates: ['the loop’s drawn length (cubic in-out, 1 beat)', 'the other rows’ veil 0 → 62 % (0.5 beat)'],
  summary: 'A grease-pencil loop is drawn by hand round one cell of a contact sheet while the other rows step back; or an underline under the address.',
  theory: 'A hand mark reads as a person’s choice, not the system’s (the editor’s china marker on a contact sheet); the step back keeps the picked row the only figure (Wertheimer 1923, figure and ground).',
  defaults: () => ({ mode: 'loop', row: 7, cell: 3, url: 'github.com/northwind/reel', seed: 3 }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(g, S, P) {
    const C = P.colors, F = fonts(P.lang || 'en'), b = S.u * 2;
    lightbox(g, C);
    if (P.mode === 'underline') {
      const f = { ...F.mono, size: 44 }, w = measure(g, P.url, f).width;
      text(g, 'Northwind', 960, 560, F.name, { color: C.ink, align: 'center' });
      text(g, P.url, 960 - w / 2, 650, f, { color: C.muted || C.dim });
      pencilUnderline(g, C, 960 - w / 2, 960 + w / 2, 674, cubicInOut(clamp(b / 0.75)));
      return;
    }
    const rows = ROWS.map(([name, dur], i) => ({ name, dur, seconds: Math.round(dur), cells: Array.from({ length: Math.ceil(dur / 4) }, (_, k) => ({ kind: 'image', img: placeholderFrame((i + k) % 6, 192, 108), crop: [0, 0, 192, 108] })) }));
    paintRows(g, C, F, rows, sheetState(b, rows, { pickRow: P.row, back: cubicInOut(clamp((b - 1) / 0.5)) }));
    pencilLoop(g, C, cellRect(rows.length, P.row, P.cell), cubicInOut(clamp(b)), { seed: P.seed });
  },
  track() { return [[960, 540]]; },
};

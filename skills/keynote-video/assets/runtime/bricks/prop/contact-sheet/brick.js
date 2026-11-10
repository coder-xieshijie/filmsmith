// contact-sheet — the films as a contact sheet on the light box: one strip per film at 96 / 832 scale, a frame for
// every 4 s, each strip cut at its film's length, the film's name to its left and its measured length at its end;
// rows 84 px apart, fewer rows centred. States: short (every strip at the shortest length) → long (each at its own)
// → measured (the lengths set) → picked (the other rows stepped back to 62 %). From the strip template
// (lib/handoffs/strip.js paintSheet, SHEET; film.js sheetState).
import { paintRows, lightbox, fonts } from '../film-strip/reel.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

const ROWS = [['Thread', 40], ['Ink', 34.9], ['Plakat', 46], ['Blueprint', 43.2], ['Phosphor', 42.6], ['Tally', 32], ['Trace', 36], ['Morph', 32]];
export default {
  id: 'contact-sheet', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { short: { long: 0, measured: 0, back: 0 }, long: { long: 1, measured: 0, back: 0 }, measured: { long: 1, measured: 1, back: 0 }, picked: { long: 1, measured: 1, back: 1 } },
  parts: ['row strip', 'cell', 'name', 'length'],
  swap: { rows: { type: 'list', count: [1, 10], sample: 'default', of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } }, image: { type: 'image', crop: true, optional: true } } } },
  roles: ['ground', 'glow', 'base', 'hole', 'ink', 'muted'],
  defaults: () => ({ rows: ROWS.map(([name, duration]) => ({ name, duration })), pick: 7 }),
  draw(g, s, P) {
    const F = fonts(P.lang), short = Math.min(...P.rows.map((r) => r.duration));
    const rows = P.rows.map((r, i) => ({ name: r.name, dur: r.duration, seconds: Math.round(r.duration), cells: Array.from({ length: Math.ceil(r.duration / 4) }, (_, k) => ({ kind: 'image', img: placeholderFrame((i + k) % 6, 192, 108), crop: [0, 0, 192, 108] })) }));
    g.save(); g.scale(P.w / 1920, P.h / 1080);
    lightbox(g, P.colors);
    paintRows(g, P.colors, F, rows, { len: rows.map((r) => short + (r.dur - short) * s.long), durs: rows.map(() => s.measured), veil: rows.map((_, i) => (i === P.pick ? 0 : 0.62 * s.back)), labels: 1 });
    g.restore();
  },
};

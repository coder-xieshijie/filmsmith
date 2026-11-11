// row-pull — on a contact sheet every strip starts at the shortest film's length; the longer strips pull out to their
// own lengths one after another (0.1 beat apart, 0.75 beat each, cubic out), then each measured length is set at its
// row's end (0.1 beat apart): the films' lengths compared as lengths of film. From the strip template (choreo.js
// sheet: extend, lengths; film.js sheetState).
import { clamp } from '../../../handoffs/util.js';
import { paintRows, lightbox, fonts, sheetState, rowEndX } from '../../prop/film-strip/reel.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

const ROWS = [['Thread', 40], ['Ink', 34.9], ['Plakat', 46], ['Blueprint', 43.2], ['Phosphor', 42.6], ['Tally', 32], ['Trace', 36], ['Morph', 32]];
export default {
  id: 'row-pull', kind: 'motion',
  tier: 'T1', family: 'horizontal',
  beats: 3,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'muted', 'base'],
  from: 'every strip of the sheet cut at the shortest length', to: 'each strip at its own film’s length, its measured length at its end',
  interpolates: ['each longer strip’s length (cubic out, 0.75 beat, staggered 0.1 beat)', 'the lengths set at the ends (staggered 0.1 beat)'],
  summary: 'The longer strips of a contact sheet pull out to their own lengths one after another, then the measured lengths are set at their ends.',
  theory: 'Length on a common baseline is the most accurate visual comparison of quantities (Cleveland & McGill 1984); a strip as long as its film is the quantity itself.',
  defaults: () => ({ rows: ROWS.map(([name, duration]) => ({ name, duration })) }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(g, S, P) {
    const C = P.colors, F = fonts(P.lang || 'en'), b = S.u * 3;
    const rows = P.rows.map((r, i) => ({ name: r.name, dur: r.duration, seconds: Math.round(r.duration), cells: Array.from({ length: Math.ceil(r.duration / 4) }, (_, k) => ({ kind: 'image', img: placeholderFrame((i + k) % 6, 192, 108), crop: [0, 0, 192, 108] })) }));
    lightbox(g, C);
    paintRows(g, C, F, rows, sheetState(b, rows, { extend: [0, 0.75], lengths: 1.6 }));
  },
  track(S, P) { const short = Math.min(...P.rows.map((r) => r.duration)); return P.rows.map((r, i) => [rowEndX(short + (r.duration - short) * clamp((S.u * 3 - 0.1 * i) / 0.75)), i * 84]); },
};

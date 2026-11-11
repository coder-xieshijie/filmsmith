// query-line — the machine form of the question, one mono line under the asked words (baseline 990 in film px): each
// word's fragment types at 12 ms a character as its word lands, an ask that follows an ask carries the line on, and
// the line keeps its right end inside the 160 px margin by dropping whole leading fragments behind an ellipsis. It
// carries only real parameters (no timecode, no HUD). The fragments stay code in every language.
// From the pulse template (assets/templates/pulse/film.js queryText, drawQuery): the template drops fragments with
// split(' '); here they come from lang.js breaks().
import { graphemes } from '../../lang.js';
import { fillGround, groundHex, onGround, drawQuery } from '../../look/query-ramp/kit.js';

const SWAP = { fragments: { type: 'list', count: [1, 8], of: { type: 'code', tier: 'glance', limits: { en: { chars: 34 }, zh: { chars: 34 } } } } };
const DEFAULT = ['$ tidewell bench', '--builds 2.1,2.2,2.3', '--scene city-4k', '--max 1s', '--warm', '--runs 5'];
export default {
  id: 'query-line', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // shown: how many fragments are fully typed; typing: the share of the next one typed
  states: { prompt: { shown: 1, typing: 0 }, typing: { shown: 2, typing: 0.5 }, carried: { shown: 6, typing: 0 } },
  parts: ['line', 'ellipsis'],
  swap: SWAP,
  roles: ['ground', 'dim', 'r0', 'r1'],
  defaults: () => ({ fragments: DEFAULT, ground: 'r0' }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en', F = P.fragments || DEFAULT;
    ctx.save(); ctx.scale(k, k);
    fillGround(ctx, groundHex(C, P.ground || 'r0'));
    const n = Math.max(0, Math.min(F.length, Math.floor(state.shown)));
    let s = F.slice(0, n).join(' ');
    if (n < F.length && state.typing > 0) { const g = graphemes(F[n]); s += (s ? ' ' : '') + g.slice(0, Math.floor(g.length * state.typing)).join(''); }
    drawQuery(ctx, s, onGround(C, P.ground || 'r0').quiet, L);
    ctx.restore();
  },
};

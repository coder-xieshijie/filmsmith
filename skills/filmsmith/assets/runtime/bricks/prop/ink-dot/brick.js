// ink-dot — the one dot of the ink style: the full stop of the word it ends (0.062 em radius, 0.05 em after the last
// glyph, sitting on the baseline), in the accent on paper, the lifted accent on night, paper-white on the accent
// field. It lands with a squash (28 %, decaying e^(−14 t) at 40 rad/s), bursts as a crisp ring, and ends as the
// cursor of the closing command. Every cut of the style is carried by it (bar-window, the hop, the burst, the iris).
// From the ink template (assets/templates/ink/film.js drawDot, landSq, the cta cursor; look/paper-slam/kit.js dot).
import { word, fill, groundHex, inkOn, dotOn, stopOf, X, M, URL_SIZE } from '../../look/paper-slam/kit.js';
import { measure, text } from '../../../handoffs/util.js';

const SWAP = { word: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 8 }, zh: { chars: 4 } } } };
export default {
  id: 'ink-dot', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // q: the squash (+ wide and low); ring: the burst ring's radius in dot radii (0: a disc); cursor: after a command
  states: { stop: { q: 0, ring: 0, cursor: false }, squash: { q: 0.28, ring: 0, cursor: false }, ring: { q: 0, ring: 2.6, cursor: false }, cursor: { q: 0, ring: 0, cursor: true } },
  parts: ['dot', 'ring', 'word'],
  swap: SWAP,
  roles: ['ground', 'ink', 'accent', 'night', 'nightAccent'],
  defaults: (ctx = {}) => ({ word: ctx.lang === 'zh' ? '二分' : 'Halve', ground: 'paper' }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en', g = P.ground || 'paper';
    ctx.save(); ctx.scale(k, k);
    fill(ctx, groundHex(C, g));
    let x, y, r;
    if (state.cursor) {
      const cmd = 'cleave run', f = M(URL_SIZE, 'en', 600), w = measure(ctx, cmd, f).width;
      r = 16; x = 960 - (w + 8 + 2 * r) / 2;
      text(ctx, cmd, x, 640, f, { color: inkOn(C, g) });
      x += w + 8 + r; y = 640 - URL_SIZE * 0.325;
    } else {
      const s = stopOf(ctx, { text: P.word, x: X, y: 640, size: 330, lang: L });
      word(ctx, { text: P.word, x: X, y: 640, size: 330, lang: L, mode: 'rise', tIn: -10, outMode: 'none', color: inkOn(C, g), mis: false }, 0, C);
      ({ x, y, r } = s);
    }
    ctx.fillStyle = dotOn(C, g);
    if (state.ring) { ctx.strokeStyle = dotOn(C, g); ctx.lineWidth = r * 0.35; ctx.beginPath(); ctx.arc(x, y, r * state.ring, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.save(); ctx.translate(x, y + r); ctx.scale(1 + state.q, 1 - state.q); ctx.beginPath(); ctx.arc(0, -r, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.restore();
  },
};

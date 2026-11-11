// token-bar — the through-line of a run: one cell per unit in a row under the board, its label and count at the left;
// cells shrink away when the run reduces the count, the whole bar lights in `learned` for the result and the closing
// move. It is on screen from the first count to the last frame and changes only when the run changes the data.
// `kinds` (optional, one per cell: 'base' | 'learned'): a learned token's cell takes the learned colour, as in the
// template, so the bar shows how much of the text the learned pieces already cover.
// From the trace template (assets/templates/trace/pieces.js token bar; y 950, cells ≤ 14 px, 3 px apart).
import { mix, text } from '../../../handoffs/util.js';
import { monoF } from '../../motion/pair-fuse/board.js';

export default {
  id: 'token-bar', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [700, 120], M: [1200, 160], L: [1680, 200] },
  states: { full: { left: 1, lit: 0 }, reduced: { left: 0.31, lit: 0 }, result: { left: 0.31, lit: 1 } },
  parts: ['label', 'count', 'cells'],
  swap: { label: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } } },
  roles: ['ground', 'ink', 'dim', 'learned', 'cell'],
  defaults: (ctx = {}) => ({ label: ctx.lang === 'zh' ? '词元' : 'tokens', total: 78, ground: true }),
  draw(ctx, st, P) {
    const C = P.colors, n = Math.round(P.total * st.left), x0 = P.w * 0.12, cell = Math.min(14, (P.w - x0) / P.total - 3), pitch = cell + 3, h = P.h * 0.22, y = P.h * 0.45;
    if (P.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(-P.w, -P.h * 2, P.w * 3, P.h * 5); }
    const base = C.cell || C.dim, learned = C.learned || C.accent;
    for (let i = 0; i < n; i++) { ctx.fillStyle = mix(base, learned, Math.max(st.lit, P.kinds?.[i] === 'learned' ? 1 : 0)); ctx.fillRect(x0 + i * pitch, y, cell, h); }
    text(ctx, P.label, 0, y - 10, monoF(Math.max(22, P.h * 0.14)), { color: C.dim });
    text(ctx, String(n), 0, y + h + P.h * 0.2, monoF(Math.max(28, P.h * 0.22), 600), { color: C.ink });
  },
};

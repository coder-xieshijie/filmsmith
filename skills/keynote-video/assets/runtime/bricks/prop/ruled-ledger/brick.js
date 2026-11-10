// ruled-ledger — the ledger page counts are kept on: a sheet of faint blue rules every 48 px fading out at the right, a
// red double margin line at x 84, and hundreds of small hand-drawn dots on it (one dot, one item; a 12-point wobbly circle
// about 16 px across in six shapes). Small, it is a card with a 9 px ink frame, a hard shadow and a grey title (a quarter
// size at the top right); it pushes in place to the full page (frame and title go, the rules return at the end).
// From teach-video assets/kits/terminal-ledger/starter/components/ledger.js (F.ledger, appear, grow, rulesOff, addDots,
// F.pile) and style.css (.led); drawn by the kit's drawLedgerPage, pile and drawDot.
import { W, H, drawLedgerPage, drawDot, dotColor, pile, clamp, lerp, E } from '../../look/paper-ledger/kit.js';

// grow: 0 the card, 1 the full page (power2.inOut); rules: 0–1; dots: 0–1 of the heap shown
const STATES = {
  card: { grow: 0, rules: 1, dots: 1 },
  full: { grow: 1, rules: 1, dots: 1 },
  plain: { grow: 1, rules: 0, dots: 1 },
};
export default {
  id: 'ruled-ledger', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1920, 1080], L: [1920, 1080] },
  states: STATES,
  parts: ['frame', 'shadow', 'title', 'rules', 'margin', 'dots'],
  swap: {
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } },
    n: { type: 'number', limits: { en: { chars: 4 }, zh: { chars: 4 } } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'base', 'baseS', 'ruling', 'margin', 'shadow'],
  summary: 'The ledger page counts are kept on: faint blue rules, a red margin line, small hand-drawn dots one per item; a framed card that pushes in place to the full page.',
  defaults: (ctx = {}) => ({ title: ctx.lang === 'zh' ? '待处理' : 'To handle', n: 300, heap: [790, 512], seed: 11, card: [1190, 196, 0.28], color: 'base' }),
  prepare(P) { return { pts: pile(Math.max(0, Math.round(P.n)), P.heap[0], P.heap[1], P.seed || 11) }; },
  draw(ctx, S, P, D) {
    const k = P.w / W, C = P.colors, g = E.p2io(clamp(S.grow)), [cx, cy, cs] = P.card, col = dotColor(C, P.color);
    ctx.save(); ctx.scale(k, k);
    // the card's frame and title go as it starts to grow; the rules leave and come back near the end of the push
    const frame = 1 - clamp(S.grow / 0.25), rules = clamp(S.rules) * (S.grow < 0.05 || S.grow > 0.8 ? 1 : 0.15);
    drawLedgerPage(ctx, C, P.lang, { x: lerp(cx, 0, g), y: lerp(cy, 0, g), s: lerp(cs, 1, g) }, { frame, title: frame, text: P.title, rules,
      dots: (c) => D.pts.forEach((p, i) => drawDot(c, { x: p[0], y: p[1], s: 1, a: clamp(S.dots), ...col }, i)) });
    ctx.restore();
  },
};

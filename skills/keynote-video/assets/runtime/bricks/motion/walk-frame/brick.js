// walk-frame — plakat's hold move: while a page holds, a 3 px ink frame steps over its items in reading order, one hop
// a beat (0.12 s power2.out, 0.06 s ahead of the beat so it lands on it). Nothing else moves; the frame is the eye's
// place, so a still page keeps the beat without a single element changing.
// From the plakat template's walk 'frame' (assets/templates/plakat/scenes.js walk(), timing.rules.js holds).
import { E, F, SZ, COL, zh, at, rect, frameRect, labelFont, labelText, pad2, ground, tooth, paperTooth, lerp, clamp } from '../../prop/poster-chrome/kit.js';

const DEFAULT = { en: { items: ['schema lock', 'row count', 'replay', 'sign-off'] }, zh: { items: ['结构锁', '行数', '回放', '签字'] } };
export default {
  id: 'walk-frame', kind: 'motion',
  tier: 'T0', family: 'shape', beats: 4,
  surface: ['canvas'],
  roles: ['paper', 'ink', 'dim', 'grid'],
  from: 'a settled page with items in reading order (their rects)',
  to: 'the same page, the frame one item on per beat',
  interpolates: ['frame rect item k → item k + 1 (0.12 s, power2.out, from 0.06 s before the beat)'],
  summary: 'While a page holds, a 3 px ink frame hops over its items in reading order, one hop a beat.',
  theory: 'A hold move keeps the beat without rewriting the page: one small element moving on the grid reads as a pointer, not as new content (pre-attentive motion; Ware 2012), so reading time is not lost.',
  defaults: (P = {}) => ({ ...DEFAULT[zh(P.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5 }),
  prepare(P) { return { T: paperTooth(P.seed || 1, P.paper ?? 0.5) }; },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { u: p * 4 }; },
  paint(ctx, S, P, D) {
    const C = P.colors, L = P.lang || 'en', S2 = SZ(L), n = P.items.length, boxes = P.items.map((_, i) => [84, 300 + 150 * i - 12, 1752, 134]);
    ground(ctx, C);
    rect(ctx, 96, 280, 1728, 2, C.ink);
    P.items.forEach((it, i) => { at(ctx, labelText(pad2(i + 1), L), 96, 300 + 150 * i + 40, labelFont(L), C.dim); at(ctx, it, 242, 300 + 150 * i + 16, { ...F('display', L, 88, 800) }, C.ink); rect(ctx, 96, 300 + 150 * i + 132, 1728, 1, C.ink); });
    // a hop on every beat from beat 0; lands 0.06 s ahead (at 120 BPM a beat is 0.5 s)
    const beat = 60 / (P.bpm || 120), t = S.u * beat;
    let k = Math.min(3, Math.floor((t + 0.06) / beat));   // hops on beats 1–3, settled on beat 4
    const b = boxes[k % n], a = k ? boxes[(k - 1) % n] : b, q = k ? E.p2Out(clamp((t - k * beat + 0.06) / 0.12)) : 1;
    frameRect(ctx, lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q), lerp(a[3], b[3], q), 3, C.ink);
    tooth(ctx, D.T);
  },
  track(S, P) { const n = P.items.length, beat = 60 / (P.bpm || 120), t = S.u * beat, k = Math.min(3, Math.floor((t + 0.06) / beat)), q = k ? E.p2Out(clamp((t - k * beat + 0.06) / 0.12)) : 1, y = (i) => 300 + 150 * (i % n) + 55; return [[960, lerp(y(Math.max(0, k - 1)), y(k), q)]]; },
};

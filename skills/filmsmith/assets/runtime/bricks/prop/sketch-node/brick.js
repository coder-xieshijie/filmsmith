// sketch-node — the one hand-drawn thing in a clean diagram: a part drawn as a rough rectangle (two bowed, jittered
// passes of a 2.4 px outline and a 1.3 px hachure at −41°, 8 px apart, on a solid light backing), its title and an
// optional secondary line on a light backing; or the loop: a smooth pill (a circle when enlarged) with the hachure
// clipped to it, never a rough circle. Same seed, same strokes; it draws on outline first, then the hachure, then the
// label blurs in; a pulse scales it 1.05 and back (a loop's outline thickens instead).
// From assets/kits/blueprint-zoom/starter/components/node.js and loop.js (Rough.js options roughness 1.05,
// bowing 0.9; the strokes are this kit's own deterministic generator after Rough.js's idea). Drawn by the sketch-paper
// kit's drawNode / drawLoop.
import { drawNode, drawLoop, clamp } from '../../look/sketch-paper/kit.js';

const DEFAULT = { en: { title: 'Tools', sub: 'Limit: only tokens out', c: 'core', seed: 41, shape: 'rect' }, zh: { title: '工具', sub: '约束：只能输出 token', c: 'core', seed: 41, shape: 'rect' } };
// bg / outline / hatch / lab: drawn share 0–1; k: the loop's shape 0 pill → 1 circle; pulse 1–1.05; grey: a stopped loop
const STATES = {
  hidden: { bg: 0, outline: 0, hatch: 0, lab: 0, k: 0, pulse: 1, grey: 0 },
  outlined: { bg: 1, outline: 1, hatch: 0, lab: 0, k: 0, pulse: 1, grey: 0 },
  drawn: { bg: 1, outline: 1, hatch: 1, lab: 1, k: 0, pulse: 1, grey: 0 },
  pulsed: { bg: 1, outline: 1, hatch: 1, lab: 1, k: 0, pulse: 1.05, grey: 0 },
  circle: { bg: 1, outline: 1, hatch: 1, lab: 1, k: 1, pulse: 1, grey: 0 },
  stopped: { bg: 1, outline: 1, hatch: 1, lab: 1, k: 1, pulse: 1, grey: 1 },
};
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export default {
  id: 'sketch-node', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [382, 144], M: [600, 226], L: [900, 340] },
  states: STATES,
  parts: ['backing', 'rough outline', 'hachure', 'title', 'secondary line', 'secondary backing', 'loop pill / circle'],
  swap: {
    title: { type: 'text', tier: 'primary', limits: lim(14, 6, 2) },
    sub: { type: 'text', tier: 'glance', optional: true, limits: lim(30, 12, 6) },
    c: { type: 'enum', of: ['prod', 'comp', 'mech', 'core', 'inf', 'mod'] },
    shape: { type: 'enum', of: ['rect', 'loop'] },
    seed: { type: 'number', limits: lim(4, 4, 1) },
  },
  roles: ['ground', 'ink', 'dim', 'line', 'subBack', 'subInk', 'coreS', 'coreH', 'coreB'],
  summary: 'The one hand-drawn thing in a clean diagram: a part as a rough outline and hachure on a light backing with its title, or a smooth loop pill that becomes a circle; same seed, same strokes.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  draw(ctx, S, P) {
    const k = P.w / 382, w = 382, h = Math.round(P.h / k), C = P.colors;
    ctx.save(); ctx.scale(k, k);
    if (P.shape === 'loop') {
      const d = Math.min(h + 106, 250), lp = { title: P.title, sub: P.sub, c: P.c, seed: P.seed, pill: [12, (h - 104) / 2 + 0, w - 24, 104], circle: [w / 2 - d / 2, (h - d) / 2, d, d] };
      drawLoop(ctx, C, P.lang, lp, { k: clamp(S.k), bg: S.bg, line: S.outline, hatch: S.hatch, lab: S.lab, lw: 3 + (S.pulse - 1) * 60, grey: S.grey, subDy: 0 });
    } else drawNode(ctx, C, P.lang, { box: [0, 0, w, h], title: P.title, sub: P.sub, c: P.c, seed: P.seed, size: 36, subSize: 26 }, S, [0, 0, w, h], S.pulse);
    ctx.restore();
  },
};

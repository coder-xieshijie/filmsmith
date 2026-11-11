// level-rail — the margin's copy block slides to stay level with the region in play: when the light hops to the next
// row (or a push moves the region), the block rides on the same ease to the new height, so the words and the evidence
// are read across one horizontal. A T0 move of the block only; the lines inside keep their own rails.
// From the handset template (film.js blockY: the block follows the lit region's height, clamped to the safe area,
// sliding over the hop's beat with cubic in-out; the level tick sits at the ringed region's height).
import { clamp, lerp } from '../../../handoffs/util.js';
import { cubicInOut } from '../../../motion.js';
import { layout, paintNotes } from '../../prop/margin-notes/notes.js';
import { tick } from '../../prop/region-light/light.js';

// the block's level for a region centred at y (film px): 62 px above the region's centre, inside the safe area
export const levelFor = (y) => clamp(y - 62, 96, 1080 - 96 - 330);
export const railAt = (p, y0, y1) => lerp(y0, y1, cubicInOut(clamp(p)));
const COPY = { en: [['display', '76.2'], ['line', 'second benchmark'], ['note', 'tied first of six']], zh: [['display', '76.2'], ['line', '第二项基准'], ['note', '并列六项中第一']] };

export default {
  id: 'level-rail', kind: 'motion',
  tier: 'T0', family: 'vertical',
  beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'accent'],
  from: 'the copy block level with one region (y0, the region centre in film px)', to: 'the same block level with the next region (y1)',
  interpolates: ['block level y0 → y1 (cubic in-out)', 'the level tick with it'],
  summary: 'The margin’s copy block slides on the hop’s ease to stay level with the region in play, the level tick with it.',
  theory: 'Spatial contiguity (Mayer 2017): a word read on the same horizontal as its evidence needs no search; the block moves with the light so the pairing survives the move.',
  defaults: (ctx = {}) => ({ y0: 380, y1: 640, x: 1376, w: 448, copy: COPY[ctx.lang === 'zh' ? 'zh' : 'en'] }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(g, S, P) {
    const C = P.colors, L = P.lang || 'en';
    g.fillStyle = C.ground; g.fillRect(0, 0, 1920, 1080);
    // a stand-in for the asset: a panel with two rows, the lit one following the block
    g.fillStyle = C.panel; g.fillRect(96, 160, 1152, 720);
    const y = railAt(S.u, P.y0, P.y1);
    g.fillStyle = C.line || C.dim; g.fillRect(140, P.y0 - 30, 700, 60); g.fillRect(140, P.y1 - 30, 520, 60);
    tick(g, 1284, y, C, 1);
    const Lay = layout(g, P.copy.map(([role, t]) => ({ role, text: t, in: -1 })), P.w, L);
    paintNotes(g, Lay, 10, levelFor(y), P.x, P.w, C);
  },
  track(S, P) { const y = railAt(S.u, P.y0, P.y1); return [[P.x, levelFor(y)], [1288, y]]; },
};

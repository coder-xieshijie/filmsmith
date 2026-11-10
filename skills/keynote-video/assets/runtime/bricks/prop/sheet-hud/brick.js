// sheet-hud — the persistent frame of a blueprint film, in screen space over the drawing: a border at 24 / 36 px with
// zone ticks 1–8 / A–D, the detail bubble and label panel top left (n / N, SHEET n · NAME, the product line), the corner
// note top right, a scale bar bottom left and the title block bottom right (APPROVED BY cell, the drawing's name,
// SHEET and a live SCALE). The panel folds back to the bubble while the camera is pushed in. Every field that carries
// information is ≥ 25 px (28 in Chinese); the zone digits and scale figures (15 px) are decoration.
// From the blueprint template (assets/templates/blueprint/hud.js): its fixed words (APPROVED BY, SHEET, SCALE, ALL)
// are swap points with Chinese defaults (批准, 张次, 比例, 全部), the labels go through caseOf.
import { palOf, makeHud, drawHud, hudDefaults, texturesOf, drawWorld, drawLight } from './kit.js';

export default {
  id: 'sheet-hud', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // fold: 0 open … 1 folded to the bubble (pushed in); scale: the camera scale the SCALE field reads; paper: draw a
  // blank sheet under the frame (the sample) or not (over a scene)
  states: { blank: { alpha: 0, fold: 0, scale: 1 }, drawn: { alpha: 1, fold: 0, scale: 1 }, folded: { alpha: 1, fold: 1, scale: 1.1 } },
  parts: ['border', 'zones', 'label panel', 'bubble', 'corner note', 'scale bar', 'title block'],
  swap: {
    title: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } },
    subtitle: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
    corner: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    name: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    sheet: { type: 'number' }, total: { type: 'number' },
    words: { type: 'group', of: { approvedBy: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } }, sheet: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } }, scale: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } }, sheetLabel: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 8 } } }, all: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 4 }, zh: { chars: 3 } } } } },
  },
  roles: ['ground', 'paper', 'ink', 'line', 'accent'],
  defaults: (ctx = {}) => ({ ...hudDefaults[ctx.lang === 'zh' ? 'zh' : 'en'], sheet: 4, total: 7, name: ctx.lang === 'zh' ? '负责人评审' : 'The owner’s review', paper: true, seed: 7 }),
  prepare: (P) => { const Pal = palOf(P.colors, P.palette); return { Pal, H: makeHud(Pal, null, P, P.lang || 'en'), T: texturesOf(Pal, P.seed || 7) }; },
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920;
    if (P.paper !== false) { ctx.save(); ctx.scale(k, k); drawWorld(ctx, D.Pal, { x: 960, y: 540, s: 1, dx: 0, dy: 0 }, [], 0, { k }); ctx.restore(); drawLight(ctx, D.Pal, D.T, 0, 0, k); }
    drawHud(ctx, D.Pal, D.H, { s: st.scale }, st.fold, st.alpha, k);
  },
};

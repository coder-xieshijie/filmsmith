// poster-chrome — the persistent frame of a plakat film: the 12-column grid (both edges of every column, dropping in
// over the film's first 0.7 s), the header (brand · tag · current section · licence over a 2 px rule at y 116), the
// footer (URL · platforms · one progress cell per bar, past bars ink, the current bar accent, over a rule at y 962)
// and the static paper tooth. Over an accent field the chrome takes onAccent, split at the field's edge.
// From the plakat template (assets/templates/plakat/index.html: #grid, #paper, #chrome).
import { ground, drawChrome, paperTooth, tooth, rect, chromeDefaults, zh } from './kit.js';

export default {
  id: 'poster-chrome', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // grid and rules: how far drawn (0..1); text: chrome type alpha; field: share of the frame under an accent field
  states: { blank: { grid: 0, rules: 0, text: 0, field: 0 }, drawn: { grid: 1, rules: 1, text: 1, field: 0 }, onAccent: { grid: 1, rules: 1, text: 1, field: 0.5 } },
  parts: ['grid', 'header', 'footer', 'progress', 'paper'],
  swap: {
    brand: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 16 }, zh: { chars: 8 } } },
    tag: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 42 }, zh: { chars: 14 } } },
    section: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 20 }, zh: { chars: 10 } } },
    licence: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 10 }, zh: { chars: 5 } } },
    url: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 28 }, zh: { chars: 28 } } },
    platforms: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 9 } } },
  },
  roles: ['paper', 'ink', 'grid', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...chromeDefaults[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5 }),
  prepare: (P) => ({ T: paperTooth(P.seed || 1, P.paper ?? 0.5) }),
  draw(ctx, st, P, D) {
    const C = P.colors, L = P.lang || 'en', sc = (P.w || 1920) / 1920;
    ctx.save(); ctx.scale(sc, sc);
    ground(ctx, C, { grid: st.grid });
    if (st.field > 0) rect(ctx, 0, 0, 1920 * st.field, 1080, C.accent);
    tooth(ctx, D?.T);
    drawChrome(ctx, P, C, L, { rules: st.rules, alpha: st.text, fields: st.field > 0 ? [{ x: 0, y: 0, w: 1920 * st.field, h: 1080 }] : [] });
    ctx.restore();
  },
};

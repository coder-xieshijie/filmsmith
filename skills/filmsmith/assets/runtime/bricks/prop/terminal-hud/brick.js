// terminal-hud — the persistent frame of a phosphor film over its ground, and the engine every phosphor scene imports
// (kit.js, fx.js): the brand mark and name with its tag top left, the licence with a dot top right, the chapter mark
// and section bottom left ([01/03] CATCH THE RUN, [>>] INSTALL, [00] the close), the progress bar along the bottom
// edge and four corner brackets; under it the ground (radial ground, breathing glow disc, 160 px accent grid,
// + crosses) and over it the screen (crt: 2 px scanlines and the tube's vignette; flat: none), with seeded grain.
// From the phosphor template: index.html HUD and ground CSS (brand 70 / 38, licence right 74 top 42, section 74 bottom
// 42, progress 4 px, corners 34 px at 38 / 34), film.js LOGO.prompt. Labels go through caseOf: capitals and tracking
// in English, as written and untracked in Chinese (28 px).
import { palOf, ground, post, hud, hudDefaults } from './kit.js';

export default {
  id: 'terminal-hud', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // alpha: the frame's opacity; ground: draw the ground and screen under / over it (the sample) or not (over a scene)
  states: { blank: { alpha: 0 }, drawn: { alpha: 1 } },
  parts: ['brand mark', 'brand and tag', 'licence', 'chapter mark and section', 'progress bar', 'corner brackets', 'ground', 'screen'],
  swap: {
    brand: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 14 }, zh: { chars: 7 } } },
    tag: { type: 'code', tier: 'glance', limits: { en: { chars: 12 }, zh: { chars: 12 } } },
    licence: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    mark: { type: 'code', tier: 'glance', limits: { en: { chars: 8 }, zh: { chars: 8 } } },
    section: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    progress: { type: 'number' },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'ink', 'muted', 'accent'],
  defaults: (ctx = {}) => ({ ...hudDefaults[ctx.lang === 'zh' ? 'zh' : 'en'], ground: true, screen: 'crt', palette: 'ice', seed: 11 }),
  prepare: (P) => ({ Pal: palOf(P.colors, P.palette) }),
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920, L = P.lang || 'en';
    ctx.save(); ctx.scale(k, k);
    if (P.ground !== false) ground(ctx, D.Pal, 0, {});
    hud(ctx, D.Pal, L, P, { alpha: st.alpha });
    if (P.ground !== false) post(ctx, D.Pal, 0, { screen: P.screen, seed: P.seed });
    ctx.restore();
  },
};

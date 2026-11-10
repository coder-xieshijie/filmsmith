// seam-grip — the split style's one actor: a 6 px accent seam with a 2 px paper key on each side (so it reads on any
// result), solid or stitched (14 px dashes on a fixed grid), its grip (a 24 × 64 tab, two key lines), and the result
// chip on a bench tab beside the grip that names where the result side comes from. The seam divides paper (input) from
// the bench (results); the caret it is born from is the same accent. States: vertical (x 900, request and pick) →
// horizontal (under the code, y 420) → band (y 260, render and diff). Carries the engine (split.js) and the scene
// machinery (scenes.js) the six split scenes share. From the split template (lib/handoffs/seam.js; film.js chip,
// gripV, gripH, caret).
import { W, H, L, fonts, painter, assetOf, chip, gripV, gripH, seamV, seamH, clipRect, seamColors, text, MARGIN, caret, chw } from './split.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

export default {
  id: 'seam-grip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { vertical: { axis: 'x', at: 900 }, horizontal: { axis: 'y', at: 420 }, band: { axis: 'y', at: 260 } },
  parts: ['seam', 'key', 'grip', 'chip', 'caret', 'paper side', 'bench side'],
  swap: {
    result: { type: 'image', crop: true, optional: true },
    chip: { type: 'code', sample: 'default', limits: { en: { chars: 52 }, zh: { chars: 52 } } },
  },
  roles: ['paper', 'ink', 'dim', 'bench', 'onBench', 'accent', 'key'],
  defaults: () => ({ result: null, chip: 'northwind-site.mp4 · 0:03', stitch: false }),
  draw(g, st, P) {
    const C = seamColors(P.colors, P.stitch), F = fonts(P.lang || 'en'), img = (P.result && typeof P.result.image !== 'string' && P.result.image) || placeholderFrame(3);
    const A = { img, size: [img.width, img.height], kind: 'frame', focus: null, at: null };
    g.save(); g.scale(P.w / W, P.h / H);
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    if (st.axis === 'x') {
      const pane = { x: st.at, y: 0, w: W - st.at, h: H };
      clipRect(g, st.at, 0, W - st.at, H, () => painter(A, pane, C)(g));
      text(g, '> Use northwind.', MARGIN, 600, F.req, C.ink); caret(g, MARGIN + 16 * chw(g, F.req) + 2, 600, 44, C.accent);
      seamV(g, st.at, 0, H, C); gripV(g, C, st.at); chip(g, F, C, P.chip, st.at + 28, 50);
    } else {
      const pane = { x: 0, y: st.at, w: W, h: H - st.at };
      clipRect(g, 0, st.at, W, H - st.at, () => painter(A, pane, C)(g));
      text(g, st.at < 300 ? '$ npm run docs' : "  pages: [ { title: 'Install' } ],", MARGIN, st.at < 300 ? 190 : 236, st.at < 300 ? F.req : F.code, C.ink);
      seamH(g, st.at, 0, W, C); gripH(g, C, st.at); chip(g, F, C, P.chip, W - 120, st.at + 22, 'right');
    }
    g.restore();
  },
};

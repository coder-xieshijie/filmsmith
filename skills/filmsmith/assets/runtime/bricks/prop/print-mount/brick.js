// print-mount — a real print laid on the desk in a neutral mount, seen from straight above: the desk (fibre texture,
// or a cutting mat), the print's index numeral on the back plane, a shadow cast on the desk, the mount of label stock
// with a 54 px bar naming the print's source in mono, and the print itself, cropped to 16:9 round its focus and never
// past 1.333 output px per source px. Every print has the same mount, so every move of the exhibit style rests on it.
// States: desk → mounted (the stock and the bar) → printed (the content) → indexed (the numeral behind).
// From the exhibit template (layout.js, film.js desk, numerals, mount).
import { contextFrom, backPlane, mount, viewOf, restCam } from './desk.js';

export default {
  id: 'print-mount', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { desk: { mount: 0, content: 0, numeral: 0 }, mounted: { mount: 1, content: 0, numeral: 0 }, printed: { mount: 1, content: 1, numeral: 0 }, indexed: { mount: 1, content: 1, numeral: 1 } },
  parts: ['desk', 'numeral', 'shadow', 'mount', 'bar', 'source', 'print'],
  swap: {
    image: { type: 'image', crop: true, optional: true },
    source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onPaper', 'smuted'],
  defaults: (ctx = {}) => ({ image: null, crop: null, focus: null, source: ctx.lang === 'zh' ? 'example.dev · 官方基准表' : 'example.dev/benchmarks · official table', desk: 'plain' }),
  draw(g, s, P) {
    const X = contextFrom({ prints: [{ image: P.image, crop: P.crop, focus: P.focus, source: P.source }], colors: P.colors, desk: P.desk }, P.lang), e = X.Wd.list[0], cam = restCam(e);
    g.save(); g.scale(P.w / 1920, P.h / 1080);
    backPlane(g, cam, X, s.numeral > 0 ? [] : [e.id]);
    if (s.mount > 0) { g.globalAlpha = s.mount; mount(g, viewOf(cam), e, X, { withContent: s.content > 0 }); g.globalAlpha = 1; }
    g.restore();
  },
};

// claim-chip — the claim a print carries, set in code on label stock and laid on a glass above the print: a card with
// a 2 px mat edge and a shadow on the print, the pencil's tick down its left, a short label (32 px, secondary) over the
// value (76 px). On its own plane it moves 1.65 times as far as the print, so a slide between prints reads in depth.
// States: off → landed (it settles 24 px onto the glass as it fades in). From the exhibit template (film.js chips,
// parallax-slide's chip).
import { drawChip } from './chip.js';
import { contextFrom, backPlane, mount, viewOf, restCam, chipAt, planeView, DEPTH } from '../print-mount/desk.js';

export default {
  id: 'claim-chip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { off: { k: 0 }, landing: { k: 0.5 }, landed: { k: 1 } },
  parts: ['card', 'edge', 'shadow', 'tick', 'label', 'value'],
  swap: {
    label: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 26 }, zh: { chars: 12 } } },
    value: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 2, chars: 11 }, zh: { chars: 6 } } },
  },
  roles: ['ground', 'panel', 'line', 'accent', 'onPaper', 'smuted'],
  defaults: (ctx = {}) => (ctx.lang === 'zh' ? { label: '每个任务的成本', value: '~$0.045' } : { label: 'cost per task, max', value: '~$0.045' }),
  draw(g, s, P) {
    const X = contextFrom({ prints: [{}], colors: P.colors }, P.lang), e = X.Wd.list[0], cam = restCam(e);
    g.save(); g.scale(P.w / 1920, P.h / 1080);
    backPlane(g, cam, X);
    mount(g, viewOf(cam), e, X);
    drawChip(g, planeView(cam, DEPTH.front), chipAt(e), [P.label, P.value], P.colors, X.F.font, { k: s.k });
    g.restore();
  },
};

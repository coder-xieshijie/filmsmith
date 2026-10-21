// diff-slider — a before/after of one frame rendered twice, registered pixel for pixel: left of the seam the frame
// before the edit, right of it the frame after, and the seam travels so the edit takes over the frame. The input above
// shows the one changed line. Borrowed mechanism: the before/after comparison slider (public grammar), here between
// two real renders of the same template at the same instant, so the only difference is the edited line.

import { cubicInOut, lerp } from './util.js';
import { clipRect, seamV, samplePane } from './seam.js';

export default {
  name: 'diff-slider',
  tier: 'T2',
  beats: 2,
  modes: ['split (the before / after)', 'dossier', 'every mode with two renders of one frame'],
  roles: ['accent', 'key'],
  from: 'the seam at x0: mostly before',
  to: 'the seam at x1: mostly after',
  interpolates: ['seam x'],
  summary: 'Two registered renders of one frame either side of the seam; the seam moves and the after takes over.',
  theory: 'Registered comparison isolates the one variable (juxtaposition, Tufte 1990: small multiples, compare like with like).',
  defaults: { pane: { x: 0, y: 260, w: 1920, h: 820 }, x0: 1440, x1: 620, before: { paint: samplePane(0) }, after: { paint: samplePane(1) }, colors: { accent: '#007C72', key: '#F3F2EE' } },
  rest(side, P) { return { x: side === 'from' ? P.x0 : P.x1 }; },
  at(p, P) { return { x: lerp(P.x0, P.x1, cubicInOut(p)) }; },
  paint(ctx, S, P) {
    const R = P.pane;
    clipRect(ctx, R.x, R.y, S.x - R.x, R.h, () => P.before.paint(ctx, 0, 0));
    clipRect(ctx, S.x, R.y, R.x + R.w - S.x, R.h, () => P.after.paint(ctx, 0, 0));
    seamV(ctx, S.x, R.y, R.y + R.h, P.colors);
  },
  track(S, P) { return [[S.x, P.pane.y + P.pane.h / 2]]; },
};

// split-branch — the seam splits: a horizontal seam moves to its new height, then a vertical branch runs from it to
// the frame's edge and the pane it cuts off opens behind the branch's tip, so two panes become three (input above,
// two results below). Two stages, one operation each (C3). The panes are the film's (P.panes paints them for a state);
// this module moves the seams. Borrowed mechanism: the split-screen build of multi-camera broadcasts (public grammar).

import { seg, cubicInOut, lerp } from './util.js';
import { seamV, seamH } from './seam.js';

export default {
  name: 'split-branch',
  tier: 'T2',
  beats: 2,
  modes: ['split (two panes become three)', 'tally', 'every mode built of panes'],
  roles: ['accent', 'key'],
  from: 'a horizontal seam at y0 over one result pane',
  to: 'the seam at y1 with a vertical branch at x down to the bottom: two result panes',
  interpolates: ['seam height', 'branch tip'],
  summary: 'The seam moves, then a branch runs down from it and opens a second result pane behind its tip.',
  theory: 'A new pane grows out of the seam the eye is on (Heer & Robertson 2007: staged, one change at a time).',
  defaults: { y0: 420, y1: 260, x: 1440, y2: 1080, stage: 0.5, panes: null, colors: { accent: '#007C72', key: '#F3F2EE' } },
  rest(side, P) { return side === 'from' ? { y: P.y0, tip: P.y0 } : { y: P.y1, tip: P.y2 }; },
  at(p, P) {
    const y = lerp(P.y0, P.y1, cubicInOut(seg(p, 0, P.stage)));
    return { y, tip: p <= P.stage ? y : lerp(P.y1, P.y2, cubicInOut(seg(p, P.stage, 1))) };
  },
  paint(ctx, S, P) {
    if (P.panes) P.panes(ctx, S);
    seamH(ctx, S.y, 0, 1920, P.colors);
    if (S.tip > S.y) seamV(ctx, P.x, S.y, S.tip, P.colors);
  },
  track(S, P) { return [[960, S.y], [P.x, S.tip]]; },
};

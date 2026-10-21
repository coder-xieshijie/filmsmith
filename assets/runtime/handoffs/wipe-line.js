// wipe-line — a second seam crosses the whole frame; the side it has passed shows the next state, the other the
// current one, and when it leaves the frame the next state is complete (its own seams were behind it all along).
// It changes input and result at once, with one stroke in one direction (down, up, left or right). Borrowed
// mechanism: the hard-edged line wipe (public grammar), drawn as the film's own seam, with motion blur on the line.

import { cubicInOut } from './util.js';
import { clipRect, seamV, seamH, samplePane } from './seam.js';

const W = 1920, H = 1080, M = 12;
export default {
  name: 'wipe-line',
  tier: 'T2',
  beats: 2,
  modes: ['split (input and result change at once)', 'plakat', 'pulse', 'every mode whose frame is divided by a rule'],
  roles: ['accent', 'key'],
  from: 'the whole current state',
  to: 'the whole next state',
  interpolates: ['line position'],
  summary: 'A copy of the seam crosses the frame; behind it the next state, ahead of it the current one.',
  theory: 'A wipe is read as replacement in one direction (Bordwell); drawn as the seam, it says the change is an edit.',
  defaults: { dir: 'down', from: { paint: samplePane(0) }, to: { paint: samplePane(1) }, colors: { accent: '#007C72', key: '#F3F2EE' } },
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: cubicInOut(p) }; },
  pos(S, P) {
    const ext = P.dir === 'down' || P.dir === 'up' ? H : W, d = S.u * (ext + 2 * M) - M;
    return P.dir === 'down' || P.dir === 'right' ? d : ext - d;
  },
  paint(ctx, S, P) {
    const C = P.colors;
    if (S.u <= 0) { P.from.paint(ctx); return; }
    if (S.u >= 1) { P.to.paint(ctx); return; }
    const q = this.pos(S, P);
    if (P.dir === 'down') { clipRect(ctx, 0, 0, W, q, () => P.to.paint(ctx)); clipRect(ctx, 0, q, W, H - q, () => P.from.paint(ctx)); seamH(ctx, q, 0, W, C); }
    else if (P.dir === 'up') { clipRect(ctx, 0, q, W, H - q, () => P.to.paint(ctx)); clipRect(ctx, 0, 0, W, q, () => P.from.paint(ctx)); seamH(ctx, q, 0, W, C); }
    else if (P.dir === 'right') { clipRect(ctx, 0, 0, q, H, () => P.to.paint(ctx)); clipRect(ctx, q, 0, W - q, H, () => P.from.paint(ctx)); seamV(ctx, q, 0, H, C); }
    else { clipRect(ctx, q, 0, W - q, H, () => P.to.paint(ctx)); clipRect(ctx, 0, 0, q, H, () => P.from.paint(ctx)); seamV(ctx, q, 0, H, C); }
  },
  track(S, P) { const q = this.pos(S, P); return P.dir === 'down' || P.dir === 'up' ? [[960, q]] : [[q, 540]]; },
};

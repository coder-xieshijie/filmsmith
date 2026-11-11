// beam-return — a job goes out along a beam and its result comes back along it: a star leaves the thread along an arc,
// drawing the beam behind it, and settles in the sky with its name and "Running"; later a bead of light runs back along
// the same arc to the thread, and the status turns to "Done". The beam stays, dim, as the job's link to the thread.
// From the stream template: film.js renderConst (the beam drawn with the star, io2 over 0.6 s at 0.42; the bead on
// 1 − io2 over 0.7 s; the label's blur entrance and the status cross-fade 0.6–0.8 s after the return), plan.js CONST.
import { palOf, thread, glow, star, arcPts, E, seg } from '../../prop/glow-thread/draw.js';
import { night, spine, perch, lighter } from '../../prop/glow-thread/demo.js';
import { typeOf } from '../../prop/glow-thread/text.js';
import { textAt, lineH } from '../../prop/hung-block/blocks.js';

const ORIGIN = [230, 470], TO = [1300, 520], OUT = [0, 1.2 / 4], LABEL = 0.9 / 4, BACK = [2.0 / 4, 3.4 / 4], SWAP = [3.2 / 4, 3.6 / 4];
const DEFAULT = { en: { label: 'Frameworks', running: 'Running', done: 'Done' }, zh: { label: '调研框架', running: '进行中', done: '已完成' } };
export default {
  id: 'beam-return', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent', 'glow', 'core'],
  from: 'the thread with nothing sent', to: 'a job\'s star in the sky on a dim beam from the thread, its status "Done"',
  interpolates: ['the star along the arc (io2, 0–1.2 beats) drawing the beam to it', 'the label\'s blur entrance', 'a bead from the star back to the thread (1 − io2, 2–3.4 beats)', 'the status running → done (3.2–3.6 beats)'],
  summary: 'A star goes out along an arc from the thread; later a bead of light runs back along the same arc and the job turns done.',
  theory: 'The same path out and back reads as cause and return (a round trip), so the result is seen to come from the job; the bead is the result\'s token moving, not a flash (continuity of motion).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'night' }),
  prepare: (P) => ({ ...palOf(P.colors, P.palette), TY: typeOf(P.lang) }),
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: Math.min(1, Math.max(0, p)) }; },
  paint(ctx, S, P, D) {
    const p = S.p, u = E.io2(seg(p, OUT[0], OUT[1])), TY = D.TY;
    night(ctx, D.P, 1);
    lighter(ctx, () => {
      spine(ctx, D.C);
      glow(ctx, ORIGIN[0], ORIGIN[1], 26, D.C.glow, 0.7);
      if (u > 0) { thread(ctx, D.C, arcPts(ORIGIN, TO, 0, u, 40), 0.42, 0.6); const sp = arcPts(ORIGIN, TO, u, u, 1)[0]; star(ctx, D.C, sp[0], sp[1], 1, E.out3(seg(p, 0, 0.05))); }
      const q = seg(p, BACK[0], BACK[1]);
      if (q > 0 && q < 1) { const b = arcPts(ORIGIN, TO, 1 - E.io2(q), 1 - E.io2(q), 1)[0]; glow(ctx, b[0], b[1], 30, D.C.glow, 0.8); glow(ctx, b[0], b[1], 7, D.C.core, 1); }
    });
    const li = E.out3(seg(p, LABEL, LABEL + 0.3 / 2)), sw = seg(p, SWAP[0], SWAP[1]), lh = lineH(TY.label, 'normal', P.label);
    if (li > 0.001) {
      ctx.save(); ctx.globalAlpha = li; if (li < 0.98) ctx.filter = `blur(${(8 * (1 - li)).toFixed(2)}px)`;
      ctx.shadowColor = D.P.ground; ctx.shadowOffsetY = 2; ctx.shadowBlur = 12;
      textAt(ctx, TY, P.label, TO[0] + 26, TO[1] - 20, TY.label, 600, D.P.text);
      textAt(ctx, TY, P.running, TO[0] + 26, TO[1] - 20 + lh, TY.labelSub, 400, D.P.text2, { alpha: 1 - sw });
      textAt(ctx, TY, P.done, TO[0] + 26, TO[1] - 20 + lh, TY.labelSub, 400, D.P.text2, { alpha: sw });
      ctx.restore();
    }
    perch(ctx, D.C);
  },
  track(S) { const u = E.io2(seg(S.p, OUT[0], OUT[1])), q = seg(S.p, BACK[0], BACK[1]); return [arcPts(ORIGIN, TO, u, u, 1)[0], q > 0 && q < 1 ? arcPts(ORIGIN, TO, 1 - E.io2(q), 1 - E.io2(q), 1)[0] : null]; },
};

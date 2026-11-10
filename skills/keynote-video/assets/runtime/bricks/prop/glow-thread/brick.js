// glow-thread — the one object of a stream film: the thread of light that is the product's attention, drawn in three
// passes (a 16 px haze and a 7 px body in the accent, a 2.6 px core in the glow colour, all additive) with a white-hot
// head while it travels, knots where it touches something and a swell when it goes taut. It may branch (hooks, beams,
// strands) but never breaks. Its states are the forms the film passes it through: running (the head travelling), the
// spine (straight down from the mascot), hooked (a point lit on it with a short light reaching right), taut (wider).
// And the engine every stream scene imports: kit.js (filmScene), engine.js (the template's film.js on one canvas),
// plan.js, sched.js, rules.js, text.js, draw.js, examples.js.
// From the stream template: film.js thread, glow, star, renderSpine; plan.js L.
import { palOf, thread, glow, straight, lerp, E } from './draw.js';
import { night, perch, SPINE, lighter } from './demo.js';

export default {
  id: 'glow-thread', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // run: how much of the spine is drawn (0–1); hook: the hook's reach (0–1); taut: the swell (0–1)
  states: {
    running: { run: 0.35, hook: 0, taut: 0 },
    spine: { run: 1, hook: 0, taut: 0 },
    hooked: { run: 1, hook: 1, taut: 0 },
    taut: { run: 1, hook: 1, taut: 1 },
  },
  parts: ['haze (16 px)', 'body (7 px)', 'core (2.6 px)', 'head', 'knot', 'hook'],
  swap: {},
  roles: ['ground', 'accent', 'glow', 'core', 'field', 'fieldEdge', 'dust'],
  defaults: () => ({ palette: 'night' }),
  prepare: (P) => palOf(P.colors, P.palette),
  draw(ctx, st, P, D) {
    const k = (P.w || 1920) / 1920;
    ctx.save(); ctx.scale(k, k);
    night(ctx, D.P, 2);
    const bot = lerp(SPINE.mascot[1] + 34, SPINE.bottom, st.run), hy = 520;
    lighter(ctx, () => {
      thread(ctx, D.C, straight([SPINE.x, SPINE.mascot[1] + 34], [SPINE.x, bot], 60), 1, 1 + 0.6 * st.taut);
      if (st.run < 1) { glow(ctx, SPINE.x, bot, 44, D.C.line, 0.7); glow(ctx, SPINE.x, bot, 10, D.C.core, 1); }
      if (st.hook > 0 && bot > hy) { const x1 = lerp(SPINE.x, SPINE.x + 420, E.io3(st.hook)); thread(ctx, D.C, [[SPINE.x, hy], [x1, hy]], 0.9, 0.7); glow(ctx, SPINE.x, hy, 22, D.C.glow, 0.7 * st.hook); glow(ctx, SPINE.x, hy, 6, D.C.core, st.hook); }
      if (st.taut > 0) glow(ctx, SPINE.x, 600, 260, D.C.line, 0.35 * st.taut);
    });
    perch(ctx, D.C);
    ctx.restore();
  },
};

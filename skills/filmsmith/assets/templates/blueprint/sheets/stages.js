// sheets/stages.js — STAGES (2026-10-19, timing API 3). A sequence of stages passes through one slot, one word a
// beat (lib/handoffs slot-rails, PLAN X02): the word leaves up through the top rail, the rails breathe to the next
// word's cap height, the next rises in from the bottom rail. The rails are dimension lines: the number at the side
// is the slot's measured height in px, from the same value that places the rails (mode principle 7). The words
// step up the ISO 3098 series, so a growing stage is lettered larger. A counter under the slot reads the stage
// it is on, computed from the same schedule.
import { E } from '../fx.js';
import { X0, CW, F, MIN, ISO, header, sz } from './common.js';
import { SLOT_B } from '../choreography.js';

const SLOT = { rails: [X0, 1400], x: X0 + 30, cy: 640, pad: 14, dimX: 1530 };

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 60);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.6, { col: 'muted' });

  const words = s.stages || [];
  const n = words.length;
  if (n < 3 || n > 5) env.err('stages needs 3–5 entries');
  words.forEach((w, k) => env.lim(`stages[${k}]`, w, 8));
  // sizes: the last stage at 200, each earlier one a step down the series
  const top = ISO.indexOf(200), sizes = words.map((_, k) => ISO[Math.max(0, top - (n - 1 - k))]);
  const font = { family: 'Plex Condensed', weight: 700 };
  const common = {
    x: SLOT.x, rails: SLOT.rails, cy: SLOT.cy, pad: SLOT.pad, ticks: 30, font,
    dimension: { x: SLOT.dimX, unit: 'px' }, mono: { family: 'Plex Mono', weight: 500, size: 35 },
    colors: { ground: P.paper, ink: P.ink, line: P.line, accent: P.accent },
  };
  const hs = words.map((w, k) => env.handoff('slot-rails', {
    ...common,
    from: k ? { text: words[k - 1], size: sizes[k - 1] } : { text: '', size: sizes[0] },
    to: { text: w, size: sizes[k] },
  }));
  const b = env.b, tr = c('rails'), starts = words.map((_, k) => c('stage' + k)), D = SLOT_B * b;
  // the slot drafts itself left to right (rails, ticks, the dimension line), then each word passes through it
  pen.custom(tr, (ctx, t) => {
    const h0 = hs[0]?.h;
    if (!h0) return;
    if (!n || t < starts[0]) {
      const u = E.cubicInOut((t - tr) / (0.5 * b));
      ctx.save(); ctx.beginPath(); ctx.rect(SLOT.rails[0] - 40, 0, (SLOT.dimX + 260 - SLOT.rails[0]) * u, 1080); ctx.clip();
      h0.still(ctx, 'from'); ctx.restore();
      return;
    }
    let k = n - 1;
    while (k > 0 && t < starts[k]) k--;
    const h = hs[k].h;
    if (t < starts[k] + D) h?.draw(ctx, (t - starts[k]) / D, { blur: false });
    else h?.still(ctx, 'to');
  });
  // the counter: STAGE k / n, k the last word that has landed (computed, never typed)
  const fcount = sz(F.tag, 25, { track: 0.14 });
  pen.custom(starts[0] ?? tr, (ctx, t) => {
    let k = 0;
    starts.forEach((s0, i) => { if (t >= s0 + D) k = i + 1; });
    if (!k) return;
    ctx.save();
    ctx.font = `400 25px "Plex Mono"`;
    ctx.letterSpacing = `${(fcount.track * 25).toFixed(2)}px`;
    ctx.fillStyle = P.line;
    ctx.fillText(`STAGE ${k} / ${n}`, X0, 800);
    ctx.restore();
  });
  if (s.note) {
    env.lim('note', s.note, 40);
    pen.text(s.note, X0, 860, env.fit(s.note, sz(F.body, 35), CW, MIN, 'note'), c('note'), 0.5, { col: 'muted' });
  }
  return { title, focus: null };
};

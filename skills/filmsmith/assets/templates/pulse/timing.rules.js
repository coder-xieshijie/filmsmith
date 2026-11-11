// timing.rules.js — how long each pulse scene needs (format: lib/timing.js header, api 3).
//
// Every scene is a sequence of steps on the beat (a word lands, a highlight hops, a figure resolves), so each
// type's need() plays choreo.js — the same schedule the picture and the sound use — and reads through
// ctx.reading (the shared reader). steps() returns the still hold after each landing; fit() checks each against
// the shared limits, at the need and again at the fitted length (ctx.dur). events() is timeline.js: the key
// events, holds, the portal hand-off and the four pacing tiers (micro, expressive, peaks), so renders/timing.json
// says what the film does.
//
// Reading tiers (principle 1):
//   primary  every ask word (one state at a time, at most five words, read before the next aperture covers it),
//            candidates' values, the search result, figures and their labels, the revealed value and its line,
//            the name, its line and the install command (≥ 3 s once typed)
//   glance   the query fragments under the words (each ≤ 6 words, the machine form of the word above it: safe
//            to delete), the search's restated question (repeats the ask), the data and reveal query lines (run
//            parameters; the shot reads without them). Each is fully still ≥ 1 s
// A glance slot over six words is counted as primary and reported by `npm run fit`: shorten it.
import { planAt, needOf, stepsOf, contextAt } from './choreo.js';
import { factsFor, validate as validateCopy } from './registry.js';
import { timelineOf } from './timeline.js';

const planOf = (s, g, ctx, extra = 0) => {
  const f = factsFor(ctx.content);
  const x = contextAt(ctx.scenes, ctx.i, f);
  return { p: planAt(ctx.scenes, ctx.i, g.beat, f, ctx.content.aperture || 'cut', [], extra), x };
};
const t = (o) => ({
  in: 0,
  ...o,
  need: (s, g, ctx) => { const { p, x } = planOf(s, g, ctx); return needOf(s, p, g.beat, x, ctx.reading); },
  // At the fitted length (ctx.dur, fit()'s second call) the steps are the picture's: a search into a reveal spends
  // the slack on extra highlight laps, an ask, a verdict or a data scene splits it with a beat pop (choreo.js popsOf),
  // so each hold is checked as drawn. ctx.dur is undefined at the need.
  steps: (s, g, ctx) => {
    const dur = ctx.dur;
    const { p, x } = planOf(s, g, ctx);
    const need = needOf(s, p, g.beat, x, ctx.reading);
    const laps = dur != null && s.type === 'search' && x.outKind === 'build' ? Math.max(0, dur - need) : 0;
    return stepsOf(s, laps > 1e-6 ? planOf(s, g, ctx, laps).p : p, g.beat, need, x, dur);
  },
});

export default {
  api: 3,
  // 120: the pacing tiers are stated at 120 bpm (one beat 0.5 s, the T0 median of two beats is one second) and
  // the owner-accepted sample ran at it. It is also the top of the range: a glance item (a query fragment, the
  // verdict's summary) must stay still a full second, and the hold after a landing may last two beats, which is a
  // second only at 120 bpm or slower. Below 112 a one-word state outstays its reading by more than half a beat.
  bpm: { default: 120, min: 112, max: 120 },
  beatsPerBar: 4,
  unit: 0.25,
  phrase: 2,
  types: {
    ask: t({ max: 4 }),
    search: t({ max: 4 }),
    data: t({ max: 3 }),
    reveal: t({ turn: true, climax: true, max: 3, reason: 'the reveal: the whiteout lands on the bar line with the drop, then the claim is read in a pause' }),
    name: t({ rest: true, absorb: true, reason: 'closing card: the install command holds ≥ 3 s, the phrase rounding lands here and the ground flips once more on the last downbeat' }),
  },
  events: (scenes, g, content) => {
    const tl = timelineOf(scenes, g, content);
    return { keys: tl.keys, holds: tl.holds, handoffs: tl.handoffs, mask: tl.mask, micro: tl.micro, shots: tl.shots, expressive: tl.expressive, peaks: tl.peaks };
  },
  validate: (content) => validateCopy(content),
};

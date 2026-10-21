// timing.rules.js — how long each dossier scene needs (format: lib/timing.js header, api 3).
//
// Every scene is a sequence of steps on the beat (a claim rises, the highlighter strikes, a sticker is pressed, a
// slip is laid down), so each type's need() plays choreo.js — the schedule the picture and the sound use — and reads
// through ctx.reading (the shared reader). steps() returns the still hold after each landing, at the need and again
// at the fitted length (ctx.dur), where the tail moves split any slack (choreo.js popsOf). events() is timeline.js.
//
// Reading tiers (principle 1):
//   primary  the claim on the mat (one state, ≤ 8 words, marked claim), the worksheet title and rows, the result and
//            its caption, the name and the URL (≥ 3 s)
//   glance   the terms under a claim (≤ 6 words, the claim's scope: safe to delete), the index rows (they repeat the
//            claims), the capture line. Each is fully still ≥ 1 s
// Asset text is evidence, never reading: nothing on a page is counted, and nothing the viewer must read is left
// to the page (it is restated on the mat).
import { needOf, stepsOf } from './choreo.js';
import { validate } from './registry.js';
import { timelineOf } from './timeline.js';

const t = (o) => ({
  in: 0,
  fillsSlack: true,
  ...o,
  need: (s, g, ctx) => needOf(ctx.scenes, ctx.i, g.beat, ctx.reading),
  steps: (s, g, ctx) => stepsOf(ctx.scenes, ctx.i, g.beat, needOf(ctx.scenes, ctx.i, g.beat, ctx.reading), ctx.dur),
});

export default {
  api: 3,
  // 120: the mode's sample ran at it; the stroke is one beat and must read as a hand's speed (0.5 s). Faster than
  // 124 the stroke snaps; slower than 112 the glance terms outstay their second by more than half a beat.
  bpm: { default: 120, min: 112, max: 124 },
  beatsPerBar: 4,
  unit: 0.25,
  phrase: 2,
  // all of the phrase rounding goes to the lockup (a rest): the scenes before it keep their own lengths, which vary
  // with their copy and their page changes (T1 CV ≥ 0.3); spread a beat at a time they would even out
  phraseShareBeats: 0,
  devices: ['dossier-page-turn', 'dossier-slip', 'dossier-stack'],
  types: {
    exhibit: t({ max: 3 }),
    claim: t({ max: 3 }),
    worksheet: t({ max: 3 }),
    result: t({ climax: true, max: 4, reason: 'the result: the highlighter strikes the figure and the claim lands with the drop, then is read in a pause' }),
    ledger: t({ max: 3 }),
    lockup: t({ rest: true, absorb: true, reason: 'closing card: the URL holds ≥ 3 s, the phrase rounding lands here and the URL is underlined on the last downbeat' }),
  },
  events: (scenes, g, content) => {
    const tl = timelineOf(scenes, g, content);
    return { keys: tl.keys, holds: tl.holds, mask: tl.mask, micro: tl.micro, shots: tl.shots, expressive: tl.expressive, peaks: tl.peaks };
  },
  validate: (content) => validate(content),
};

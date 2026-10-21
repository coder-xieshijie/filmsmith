// timing.rules.js — how long each Split scene needs and what happens in it (format: lib/timing.js, api 3).
//
// Every time comes from choreo.js plan1(), the same table film.js draws from and score.mjs scores from. A scene needs
// the longer of its choreography and its reading (ctx.reading over the items plan1 lists, each placed at the moment its
// text is readable):
//   primary  claims, the request, the paired tokens, the commands, the report's result line, the name, the address
//   glance   the list of a pick (single names, scanned not read), the report's lines (the evidence beside the
//            film; ≤ 4 words each), the lock-up's line (≤ 6 words, safe to lose)
// Code lines quoted in a file scene are evidence: what is read is the token the underline pairs with its frame.
//
// Tiers (api 3): every onset in plan1 is a micro event (T0): a word, a typed line, a tick, an underline, a cut, a move;
// a landed move or a cut to a new result is a composition (T1 shot); louvre, wipe-line and split-branch are the
// expressive transitions (T2); the peaks (T3) are the caret standing up into the seam (hook), the slider's landing in
// the diff (climax, on a bar line) and the name at the lock-up. The still windows between busy spans are the holds;
// the diff's last is the claim's pause.
import { plan1, needOf, holdsOf, validate } from './choreo.js';
import PALETTES from './palettes.js';
import { DEVICES } from './moves.js';
import { reader } from './lib/timing.js';

// Where scene i starts: no scene before the diff is a turn and no phrase rounding is shared before the lock-up, so
// fit() lays the scenes end to end, each its need rounded up to the beat; the diff's preroll to its bar line is then
// known when fit() sizes it (s.start, when fit() passes it, wins).
// (the scenes before are read with a plain reader, not ctx.reading, which records what this scene's need read)
const plain = (items) => reader(items, { wordSec: 0.3 });
const startOf = (g, ctx, upto) => {
  let t = 0;
  for (let j = 0; j < upto; j++) {
    const x = ctx.scenes[j];
    t += Math.ceil(needOf(plan1(ctx.content, ctx.scenes, j, g.beat, undefined, t), g.beat, plain) / g.beat - 1e-6) * g.beat;
  }
  return t;
};
const planOf = (s, g, ctx, dur) => {
  const scenes = ctx.scenes.map((x, j) => (j === ctx.i ? s : x));
  const start = Number.isFinite(s.start) ? s.start : startOf(g, { ...ctx, scenes }, ctx.i);
  return plan1(ctx.content, scenes, ctx.i, g.beat, dur, start);
};

const need = (s, g, ctx) => needOf(planOf(s, g, ctx), g.beat, ctx.reading);
const read = (s, ctx) => {
  try { return planOf(s, { beat: 0.5, bar: 2 }, ctx).reads.filter((x) => x.text).map(({ text, tier, claim }) => ({ text, tier, ...(claim ? { claim } : {}) })); } catch { return []; }
};
const events = (s, g, ctx) => {
  const dur = s.end - s.start, T = planOf(s, g, ctx, dur);
  return {
    keys: T.keys.map(({ t, kind }) => ({ t, kind })),
    micro: T.micro, holds: holdsOf(T, dur), shots: T.shots, expressive: T.expressive, peaks: T.peaks,
  };
};

const types = {};
for (const k of ['request', 'pick', 'file', 'render']) types[k] = { need, read, events, fillsSlack: true };
types.diff = { need, read, events, fillsSlack: true, max: 4, climax: true, reason: 'the climax: the + line types, the slider runs across two renders of one instant, the claim is read in a pause' };
types.lockup = { need, read, events, fillsSlack: true, rest: true, absorb: true, reason: 'the lock-up: the address holds ≥ 3 s; the phrase rounding lands here; the seam closes on the last downbeat' };

export default {
  api: 3,
  accent: (content) => (PALETTES[content.palette] ?? PALETTES.diff).accent,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4,
  unit: 0.25,           // one beat: only the key beats are locked; the diff lands its slider on a bar line itself
  phrase: 2,            // the rounding goes to the lock-up (a rest whose second move lands on the last downbeat)
  phraseShareBeats: 0,
  wordSec: 0.3,
  devices: DEVICES,     // split-open, louvre, wipe-line, split-branch, diff-slider (moves.js)
  types,
  validate: (content) => validate(content),
  events: () => ({ mask: [0, 0, 1920, 1080] }),
};

// timing.rules.js — how long each halftone scene needs, measured from its choreography (format: lib/timing.js, api 3).
//
// Every value below is read off film.js: when a word lands, how long a count runs, how much of a scene's tail the
// transition out of it takes (the scene's text must have been read before that tail starts). lib/timing.js fit()
// turns these into whole beats per scene and rounds the film to a 2-bar phrase in the lock-up. film.js and
// score.mjs import the same constants (C) and helpers, so picture, sound and the table agree.
//
// Reading goes through lib/timing.js's reader (ctx.reading), in three tiers:
//   primary  hook lines, card words and lines, the count's value and line, claim lines, the name and its line:
//            0.3 s a word, read one after another in the order they land
//   glance   only the labels (≤ 6 words, mono 28 px): each repeats the product, a place or a time already given
//            or is safe to delete (a slug line, as in print); each must stay still ≥ 1 s
// The first scene's text lands a beat late (beat 1), while the anchor rises in.
import { reader } from './lib/timing.js';
import { validate, transitionOut, groundOf } from './registry.js';

// Choreography constants, in beats unless the name says seconds. film.js imports these.
export const C = {
  wordSec: 0.3,
  firstOffset: 1, // the film's first text lands on beat 1, while the anchor rises in over beat 0
  riseSec: 0.24, riseLeadSec: 0.12, // text rises through its baseline mask in 0.24 s, starting 0.12 s before its beat (lands on it)
  exitSec: 0.17, // text leaves up through the mask in 0.17 s (exits faster than entrances, principle 5)
  settleSec: 0.2, // a landing holds at least 0.2 s before anything leaves (PLAN §5)
  lineAt: 1, // a card's or count's line lands one beat after its word
  hookLine2: 1, // the hook's second line lands one beat after its first
  countMin: 2, countMax: 4, countPerBeat: 4, // a count steps at most 4 values a beat, over 2–4 beats
  claimLand: 1.25, // after the burst on the bar line, the dots condense onto the claim by beat 1.25
  nameAt: 2, lineAtLock: 3, // the lock-up: pull-back over the first 1.25 beats; name on beat 2, its line on beat 3
  pullBeats: 1.25, pushBeats: 1.5, stillBeats: 0.25, // push in over 1.5 beats, hold a quarter beat in silence, pull back
  morphBeats: 0.75, // a field morph's front runs from 0.25 beat before the cut to 0.5 after it
  quantBeats: 0.5, sortBeats: 1.25, // quantize: the front turns the field into blocks over the last half beat; blocks re-sort over 1.25 beats
  whipBeats: 0.3, scanBeats: 0.6, invertBeats: 0.75, collapseBeats: 1.25, slamBeats: 1,
  slamShockSec: 0.45, // the slammed word's blur and scale decay to zero in 0.45 s (lib/transitions whiteout-slam; it runs a beat either side of the cut)
  holdEndSec: 1.5, // the lock-up holds name and line at least this long after its line is read (with the second move)
};

// Seconds at the end of the outgoing scene that its transition takes; the scene's text must be read before them.
export const leadSec = (tr, B) => ({
  whip: C.whipBeats * B, morph: C.exitSec + C.riseLeadSec, scan: C.scanBeats * B, invert: C.invertBeats * B,
  quantize: Math.max(C.exitSec + C.riseLeadSec, C.quantBeats * B), collapse: C.collapseBeats * B, slam: C.slamBeats * B,
  pull: (C.pushBeats + C.stillBeats) * B + C.exitSec, cut: 0,
}[tr] ?? 0);

// Seconds at the start of the incoming scene that the transition still takes (its window after the cut).
export const inPostSec = (tr, B) => ({
  morph: (C.morphBeats - 0.25) * B, quantize: C.sortBeats * B, collapse: C.claimLand * B, slam: C.slamBeats * B,
  pull: C.pullBeats * B,
}[tr] ?? 0);

// beats a count runs: at most countPerBeat values a beat, 2–4 beats
export const countBeats = (s) => Math.min(C.countMax, Math.max(C.countMin, Math.ceil(((s.value ?? 1) - (s.from ?? 0)) / C.countPerBeat)));

// ---------- per-type reading, shared with film.js ----------
// Each returns reader items with `at` = seconds from the scene start at which the text has landed.
export const hookItems = (s, B, o) => [
  ...(s.lines || []).map((l, k) => ({ text: l, at: (o + k * C.hookLine2) * B })),
  s.label && { text: s.label, tier: 'glance', at: (o + 0.5) * B },
].filter(Boolean);
export const cardItems = (s, B, o) => [
  { text: s.word, at: o * B },
  s.line && { text: s.line, at: (o + C.lineAt) * B },
  s.label && { text: s.label, tier: 'glance', at: o * B },
].filter(Boolean);
export const countItems = (s, B, o) => [
  s.line && { text: s.line, at: (o + C.lineAt) * B },
  { text: String(s.value), at: (o + countBeats(s)) * B },
  s.label && { text: s.label, tier: 'glance', at: o * B },
].filter(Boolean);
export const claimItems = (s, B) => [{ text: (s.lines || []).join(' '), at: C.claimLand * B, claim: true }];
export const lockItems = (s, B) => [{ text: s.name, at: C.nameAt * B }, s.line && { text: s.line, at: C.lineAtLock * B }].filter(Boolean);

const offset = (ctx) => (ctx?.i === 0 ? C.firstOffset : 0);
const outOf = (ctx) => (ctx?.scenes && ctx.i != null ? transitionOut(ctx.scenes, ctx.i) : null);
const tiers = (list) => list.map(({ text, tier, claim }) => ({ text, tier, ...(claim ? { claim } : {}) }));
// the text read, then the transition's tail; the last landing holds at least settleSec
// (and the transition into the scene and the one out of it never overlap)
const inOf = (ctx) => (ctx?.scenes && ctx.i > 0 ? transitionOut(ctx.scenes, ctx.i - 1) : null);
const needOf = (r, lastLand, ctx, B) => Math.max(r.end, lastLand + C.settleSec, inPostSec(inOf(ctx), B) + C.settleSec) + leadSec(outOf(ctx), B);

const rules = {
  api: 3,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4, unit: 0.25, phrase: 2, wordSec: C.wordSec,
  phraseShareBeats: 1,
  types: {
    // the opening (T3 hook): the anchor rises in on beat 0 and lands on beat 1 with the first line; the field is the
    // coarse, light opening screen (fields.js HOOK)
    hook: {
      doc: { in: 'anchor lands on beat 1 with line 1; line 2 one beat later', out: 'the transition out' },
      read: (s) => tiers(hookItems(s, 1, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, o = offset(ctx), r = ctx.reading(hookItems(s, B, o));
        return needOf(r, (o + ((s.lines || []).length - 1) * C.hookLine2) * B, ctx, B);
      },
      events: (s, g, ctx) => ({ keys: [{ t: offset(ctx) * g.beat, kind: 'land', what: 'anchor and first line land' }] }),
    },
    // a feature: one word, one line, a field round the anchor; the word lands on the scene's first beat
    card: {
      doc: { in: 'word on 0 (beat 1 in the first scene), line on 1', out: 'the transition out' },
      read: (s) => tiers(cardItems(s, 1, 0)),
      need: (s, g, ctx) => {
        const B = g.beat, o = offset(ctx), r = ctx.reading(cardItems(s, B, o));
        return needOf(r, (o + (s.line ? C.lineAt : 0)) * B, ctx, B);
      },
      events: (s, g, ctx) => ({ keys: [{ t: offset(ctx) * g.beat, kind: 'land', what: 'word lands' }] }),
    },
    // the number: steps up from `from` to `value`, at most four values a beat, landing on a beat; cells multiply
    count: {
      doc: { in: 'count from 0, 2–4 beats; line on 1', out: 'the transition out' },
      read: (s) => tiers(countItems(s, 1, 0)),
      need: (s, g, ctx) => {
        const B = g.beat, o = offset(ctx), r = ctx.reading(countItems(s, B, o));
        return needOf(r, (o + countBeats(s)) * B, ctx, B);
      },
      events: (s, g, ctx) => {
        const B = g.beat, o = offset(ctx);
        return { keys: [{ t: o * B, kind: 'land', what: 'count starts' }, { t: (o + countBeats(s)) * B, kind: 'land', what: 'count lands' }] };
      },
    },
    // the claim (T3): the scene before collapses into the anchor; on the bar line the anchor bursts and its dots
    // condense onto the claim's letters
    claim: {
      doc: { in: 'burst on 0 (bar line), lines by 1.25', out: 'the transition out' }, turn: true,
      read: (s) => tiers(claimItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, r = ctx.reading(claimItems(s, B));
        return needOf(r, C.claimLand * B, ctx, B);
      },
      // one step: the claim lands, then holds still while it is read (a pause, up to 2 bars), until the push-in
      steps: (s, g, ctx) => [{ still: Math.max(0, s.need - C.claimLand * g.beat - leadSec(outOf(ctx), g.beat)), pause: true }],
      // the claim is read in a pause hold (the picture is still: paper, the claim, the anchor), up to the push-in
      events: (s, g, ctx) => {
        const B = g.beat, dur = s.end - s.start, out = dur - leadSec(outOf(ctx), B);
        return { keys: [{ t: 0, kind: 'claim', what: 'the anchor bursts' }], holds: out > C.claimLand * B + 0.2 ? [{ from: C.claimLand * B, to: out, pause: true }] : [] };
      },
    },
    // the lock-up (T3): pull back from the anchor on a log scale to the whole mark on the bar line; the music has
    // dropped out for the push-in before it and comes back with the impact
    lockup: {
      doc: { in: 'pull-back 1.25 beats; name on 2, line on 3', out: 0 }, turn: true, min: 2, rest: true, absorb: true,
      reason: 'closing lock-up: name and line hold, the second move lands on the last downbeat; the phrase rounding lands here',
      read: (s) => tiers(lockItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, r = ctx.reading(lockItems(s, B));
        // the line is read before the last bar, whose downbeat carries the second move; then it all holds
        return Math.max(r.end, C.lineAtLock * B + C.settleSec) + Math.max(g.bar, C.holdEndSec);
      },
      events: (s, g) => ({ keys: [
        { t: 0, kind: 'turn', what: 'pull-back from the anchor; the music comes back', drop: true },
        { t: C.nameAt * g.beat, kind: 'land', what: 'name lands' },
        { t: s.end - s.start - g.bar, kind: 'end', what: 'second move: the plate inks up again' },
      ] }),
    },
  },
};

// The four tiers (research PLAN §5; lib/timing.js api 3 measures them, as INFO below api 3):
//   T0 micro       every beat inside a hook, card or count the field steps (rings step out, a source switches on,
//                  a cell lights, a row scrolls, a bar group advances, a grid cell turns solid, the count ticks);
//                  the line landing on its beat; the claim landing
//   T2 expressive  invert (anchor-swap, iris), quantize (field-morph, quantize), collapse (collapse-burst), slam
//                  (whiteout-slam), and the pull-back into the lock-up (anchor-swap, pull-back)
//   T3 peaks       the hook's landing, each claim (the one nearest 72 % of the film is the climax), the slam's
//                  landing, the lock-up
rules.events = (scenes, g) => {
  const B = g.beat, micro = [], expressive = [], peaks = [];
  scenes.forEach((s, i) => {
    const o = i === 0 ? C.firstOffset : 0, st = s.start, dur = s.end - s.start;
    const tout = transitionOut(scenes, i), lead = leadSec(tout, B);
    if (['hook', 'card', 'count'].includes(s.type)) {
      const cb = s.type === 'count' ? countBeats(s) : 0;
      for (let k = o + 1; k * B < dur - lead - 1e-6; k++) micro.push({ t: st + k * B, scene: i, what: k <= o + cb ? 'the count ticks' : 'the field steps' });
      if (s.type === 'hook' && s.label) micro.push({ t: st + (o + 0.5) * B, scene: i, what: 'label' });
    }
    if (s.type === 'claim') micro.push({ t: st + C.claimLand * B, scene: i, what: 'the claim lands' });
    if (tout === 'pull') micro.push({ t: s.end - (C.pushBeats + C.stillBeats) * B, scene: i, what: 'the camera pushes into the anchor' });
    if (s.type === 'lockup') micro.push({ t: st + C.lineAtLock * B, scene: i, what: 'the line lands' });
    if (tout === 'invert') expressive.push({ t: s.end - C.invertBeats * B, dur: C.invertBeats * B, device: 'anchor-swap', variant: 'iris', scene: i });
    if (tout === 'quantize') expressive.push({ t: s.end - C.quantBeats * B, dur: (C.quantBeats + C.sortBeats) * B, device: 'field-morph', variant: 'quantize', scene: i });
    if (tout === 'collapse') expressive.push({ t: s.end - C.collapseBeats * B, dur: C.collapseBeats * B, device: 'collapse-burst', scene: i });
    if (tout === 'slam') expressive.push({ t: s.end - C.slamBeats * B, dur: C.slamBeats * B, device: 'whiteout-slam', scene: i });
    if (tout === 'pull') expressive.push({ t: s.end, dur: C.pullBeats * B, device: 'anchor-swap', variant: 'pull-back', scene: i + 1 });
    if (s.type === 'hook' && i === 0) peaks.push({ t: st + o * B, kind: 'hook', scene: i });
    if (s.type === 'claim') peaks.push({ t: st, kind: 'claim', scene: i });
    if (tout === 'slam') peaks.push({ t: s.end, kind: 'reveal', scene: i + 1 });
    if (s.type === 'lockup') peaks.push({ t: st, kind: 'lockup', scene: i });
  });
  const D = scenes.at(-1)?.end ?? 0;
  const mid = peaks.filter((p) => p.kind === 'claim' || p.kind === 'reveal').sort((a, b) => Math.abs(a.t - 0.72 * D) - Math.abs(b.t - 0.72 * D))[0];
  if (mid) mid.climax = true;
  return { micro, expressive, peaks };
};

// Copy that breaks the registry or a slot limit stops `npm run fit`; warnings print but do not stop it.
rules.validate = (content) => validate(content, (w) => console.log(`WARN: ${w}`));
export { groundOf };
export default rules;

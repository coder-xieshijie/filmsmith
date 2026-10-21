// timing.rules.js — how long each Handset scene needs and what happens in it (format: lib/timing.js, api 3).
//
// Every time comes from choreo.js TYPES, the same table film.js draws from and score.mjs scores from. A scene needs the
// longer of its choreography and its reading (ctx.reading over the items its copy group lists, each placed at the moment
// its text is readable):
//   primary  the value (display), the line, the claim's lead, the lock-up's name, line and URL
//   glance   the note under each value (≤ 6 words): it repeats or sources the evidence the screen shows, so it is safe to lose
//
// Tiers (api 3): every onset in TYPES is a micro event (T0): a move, the light, each line, the ring closing; a band row
// is a new composition (T1 shot); device-flip and page-scroll are the expressive transitions (T2); the peaks (T3) are the
// screen lighting (hook), the claim's landing (climax, on a bar line) and the lock-up. The still windows between onsets
// are the holds; the claim's is a pause.
import { TYPES, plan, needOf, validate, SETTLE } from './choreo.js';
import { reader } from './lib/timing.js';
import PALETTES from './palettes.js';
import { ADAPTERS } from './moves.js';

const B0 = (g) => g.beat;
// Plan the scenes up to and including ctx.i. Before layout (no start yet) the starts are the needs rounded up to the
// beat, as fit() lays them out here: no type is a turn and no phrase rounding is shared before the lock-up, so the
// claim's preroll (beats to its bar line) is known when fit() sizes it.
const planUpTo = (s, g, ctx) => {
  const scenes = ctx.scenes.slice(0, ctx.i + 1).map((x, j) => (j === ctx.i ? s : x));
  const reading = (items) => reader(items, { wordSec: 0.3 });
  return plan(ctx.content, scenes, B0(g), g.bar, reading)[ctx.i];
};

function need(s, g, ctx) {
  const T = planUpTo(s, g, ctx);
  return needOf(T, ctx.reading);
}

const events = (s, g, ctx) => {
  const T = planUpTo(s, g, ctx);
  const dur = s.end - s.start;
  // micro: every onset; holds: from each onset's settle to the next onset (or the copy's exit before the scene's end)
  const micro = T.micro.map(([t, what]) => ({ t, what }));
  const exitAt = s.type === 'lockup' ? dur : dur - 0.2;
  const on = [...T.micro].sort((a, b) => a[0] - b[0]);
  const holds = [];
  on.forEach(([t, , st], k) => {
    const from = t + st, to = (k + 1 < on.length ? on[k + 1][0] : exitAt) - 1 / 30;
    if (to - from >= 0.2) holds.push({ from, to, ...(T.pauseFrom != null && Math.abs(from - T.pauseFrom) < 1e-6 ? { pause: true } : {}) });
  });
  if (s.type !== 'lockup') micro.push({ t: exitAt, what: 'the copy leaves' });
  return {
    keys: T.keys.map((k) => ({ ...k })),
    micro, holds,
    shots: T.shots ?? [],
    expressive: T.expressive ?? [],
    peaks: T.peaks ?? [],
  };
};

const types = {};
for (const k of Object.keys(TYPES)) types[k] = { need, events };
types.claim = { need, events, climax: true, reason: 'the claim: the region is lit and the lead read, the push lands on the bar line, the value is read in a pause' };
types.lockup = { need, events, rest: true, absorb: true, reason: 'the lock-up: the name and the URL hold (the URL ≥ 3 s); the region is ringed again on the last downbeat' };
// read() lists each type's text for the table (the timing itself comes from need()).
for (const r of Object.values(types)) r.read = (s, ctx) => {
  try { return planUpTo(s, { beat: 0.5, bar: 2 }, ctx).reads.map(({ text, tier, claim }) => ({ text, tier, claim })); } catch { return []; }
};

export default {
  api: 3,
  accent: (content) => (PALETTES[content.palette] ?? PALETTES.graphite).accent,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4,
  unit: 0.25,           // one beat: only the key beats are locked; the claim finds its bar line itself (its preroll)
  phrase: 1,            // the rounding goes to the lock-up (a rest that ends with its second move on the last downbeat)
  phraseShareBeats: 0,
  wordSec: 0.3,
  // the T2 devices the move adapters declare (moves.js), so lib/fit.mjs knows the template's own (page-scroll) and any swapped in
  devices: [...new Set(Object.values(ADAPTERS).flatMap((r) => Object.values(r).map((a) => a.device)).filter(Boolean))],
  types,
  validate: (content) => validate(content),
  // the content area for check-film's motion measures: the device and the margin, inside the safe area
  events: () => ({ mask: [56, 48, 1808, 984] }),
};
export { SETTLE };

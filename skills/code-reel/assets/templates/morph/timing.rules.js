// timing.rules.js — how long each morph scene needs and what happens in it (format: lib/timing.js, api 3).
//
// Every time comes from choreo.js TIMES, the same table film.js draws from and score.mjs scores from. A scene needs
// the longer of its choreography and its reading (ctx.reading over the items TIMES lists, each placed at the moment
// its text is readable and still):
//   primary  the line's text and its swapped token, the card's status line, the schema name, the captions, the focus
//            title and each tab's code, the console's status line, the claim, the name and the tagline
//   glance   ≤ 6 words, each repeated elsewhere or safe to lose: the action chip (the press shows it), the body lines
//            and their type chips (the docs page and the console show the same body), the face labels (the docs page
//            lists the same endpoints, schemas and SDKs), the reference title on the page (the focus card repeats it),
//            the tab names (the code itself says which language it is)
//
// Tiers (api 3): every onset in TIMES is a micro event (T0); the three dimension upgrades in the middle are the
// expressive transitions (T2: stroke-reinterpret, net-unfold, shape-flood); the peaks (T3) are the point's landing
// (hook), the claim in the console (the climax) and the point landing in the mark (lock-up, converge-mark). The still
// windows between onsets are the holds; the claim's is a pause.
import { TIMES, validate, secondMove, prerollOf } from './choreo.js';
import { reader } from './lib/timing.js';
import PALETTES from './palettes.js';

const ctxOf = (ctx) => ({ first: ctx.i === 0, prev: ctx.scenes?.[ctx.i - 1], next: ctx.scenes?.[ctx.i + 1], content: ctx.content });
// The flood's preroll (beats to the next bar line) depends on where it starts. Once laid out, the scene has its start;
// while fit() sizes the scenes it does not, so the start is computed here the way fit() lays them out: in morph no
// type is a turn and no phrase rounding is shared, so every scene before the flood is its need rounded up to the beat
// (a hand `bars` on an earlier scene breaks this; TEMPLATE.md says so).
const MIN_BEATS = { point: 2 };
const startBeats = (g, ctx) => {
  let b = 0;
  for (let j = 0; j < ctx.i; j++) {
    const sj = ctx.scenes[j];
    const cj = { i: j, scenes: ctx.scenes, content: ctx.content, reading: (items) => reader(items, { wordSec: 0.3 }) };
    b += Math.max(MIN_BEATS[sj.type] ?? 1, Math.ceil(need(sj, g, cj) / g.beat - 1e-9));
  }
  return b;
};
const timesFor = (s, g, ctx) => {
  const dur = s.end != null ? s.end - s.start : undefined;
  let pre;
  if (s.type === 'flood') pre = prerollOf(s.start != null ? s.start : startBeats(g, ctx) * g.beat, g.beat, g.beatsPerBar);
  return TIMES[s.type](s, g.beat, ctxOf(ctx), dur, pre);
};

function need(s, g, ctx) {
  const T = timesFor(s, g, ctx);
  const r = ctx.reading(T.reads);
  return Math.max(T.need, r.end + 0.1);
}

// Key events per type (seconds from the scene start); kinds as lib/timing.js KEY_KINDS.
const KEYS = {
  point: (T) => [{ t: T.land, kind: 'land', what: 'the point lands' }],
  line: (T) => (T.swap != null ? [{ t: T.swap, kind: 'accent', what: 'the token is swapped' }] : []),
  press: (T, s) => (s.action ? [{ t: T.press, kind: 'accent', what: 'the action is pressed' }] : []),
  card: (T) => (T.fromCard ? [{ t: T.chips, kind: 'accent', what: 'type chips rise' }] : [{ t: T.head, kind: 'land', what: 'the response lands' }]),
  solid: (T) => [{ t: T.lines, kind: 'accent', what: 'three lines make the cube' }],
  unfold: (T) => [{ t: T.jump, kind: 'accent', what: 'the highlight jumps to the endpoint' }],
  focus: (T) => T.tabs.slice(1).map((t) => ({ t, kind: 'accent', what: 'next tab' })),
  flood: (T) => [{ t: T.flood, kind: 'turn', what: 'the console floods out of the Run button on the bar line: the music drops', drop: true }, { t: T.claim, kind: 'claim', what: 'the claim' }],
  mark: (T) => [{ t: T.land, kind: 'land', what: 'the point lands in the mark' }],
};
// T2: the three dimension upgrades in the middle of the chain (plane → solid, solid → interface, interface → console).
// The lock-up's converge-mark is the T3 lock-up, not counted again as T2; a solid that opens the film is the hook.
const EXPRESSIVE = {
  solid: (T, s, i) => (i === 0 ? [] : [{ t: T.lines, beats: 1, device: 'stroke-reinterpret', variant: 'hexagon → cube' }]),
  unfold: () => [{ t: 0, beats: 2, device: 'net-unfold', variant: 'cube → interface panels' }],
  flood: (T) => [{ t: T.flood, beats: 1, device: 'shape-flood', variant: 'button outline → console' }],
};
const PEAKS = {
  point: (T, s, i) => (i === 0 ? [{ t: T.land, kind: 'hook' }] : []),
  solid: (T, s, i) => (i === 0 ? [{ t: T.lines, kind: 'hook' }] : []),
  flood: (T) => [{ t: T.claim, kind: 'claim', climax: true }],
  mark: (T) => [{ t: T.land, kind: 'lockup' }],
};

const events = (s, g, ctx) => {
  const T = timesFor(s, g, ctx);
  const i = ctx.i, dur = s.end - s.start;
  const keys = (KEYS[s.type]?.(T, s) ?? []);
  if (s.type === 'mark') {
    const u2 = secondMove(dur, g.bar, g.beat, T);
    if (u2 != null) keys.push({ t: u2, kind: 'end', what: 'the stack presses on the last downbeat' });
  }
  const micro = T.micro.map(([t, what]) => ({ t, what }));
  // still windows: from each onset's settle to the next onset (or the scene's exit)
  const on = [...T.micro.map(([t, , st]) => ({ t, st }))];
  if (s.type === 'mark') { const u2 = secondMove(dur, g.bar, g.beat, T); if (u2 != null) on.push({ t: u2 - 0.2, st: 0.5 }); }
  if (s.type === 'flood') on.push({ t: dur - T.retractBeats * g.beat - 0.12, st: Infinity }); // the claim leaves, the console retracts: no hold after
  on.sort((a, b) => a.t - b.t);
  const holds = [];
  on.forEach((x, k) => {
    const from = x.t + x.st, to = (k + 1 < on.length ? on[k + 1].t : dur) - 1 / 30;
    if (to - from >= 0.2) {
      const pause = s.type === 'flood' && x.t === T.claim;
      if (s.type === 'flood' && x.t === T.press && T.pre > 0) return; // the spinner turns until the flood: not still
      holds.push({ from, to, ...(pause ? { pause: true } : {}) });
    }
  });
  // the console is a new composition inside the flood when a preroll (the light card, Run spinning) comes first
  const shots = s.type === 'flood' && T.pre > 0 ? [{ t: T.flood, what: 'the live console' }] : [];
  return {
    keys, micro, holds, shots,
    handoffs: i > 0 ? [{ t: 0, what: `${ctx.scenes[i - 1].type} → ${s.type}` }] : [],
    expressive: (EXPRESSIVE[s.type]?.(T, s, i) ?? []),
    peaks: (PEAKS[s.type]?.(T, s, i) ?? []),
  };
};

// focus builds in steps: each tab holds still until the next one lands, the last until the Run button takes the accent
const focusSteps = (s, g, ctx) => {
  const T = timesFor(s, g, ctx);
  const at = T.tabs;
  return at.map((t, k) => Math.max(0, (k + 1 < at.length ? at[k + 1] : T.arm) - (t + 0.32)));
};

const types = {
  point: { min: 0.5, need, events },
  line: { need, events },
  press: { need, events },
  card: { need, events },
  solid: { need, events },
  unfold: { need, events },
  focus: { need, events, steps: focusSteps },
  flood: { need, events },
  mark: { rest: true, absorb: true, reason: 'the lock-up: name and tagline hold to the end; the stack presses on the last downbeat', need, events },
};
// read() lists each type's text for the table (the timing itself comes from need()).
for (const [k, r] of Object.entries(types)) r.read = (s, ctx) => (TIMES[k](s, 0.5, { first: false, prev: ctx?.prev, next: ctx?.next, content: ctx?.content ?? {} }).reads.map(({ text, tier, claim }) => ({ text, tier, claim })));

export default {
  api: 3,
  accent: (content) => (PALETTES[content.palette] ?? PALETTES.slate).accent,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4,
  unit: 0.25, // one beat: only the key beats are locked. No type is a turn: the flood finds the next bar line itself
  // (its preroll), so no scene before it is padded into a dead hold; the flood and the claim land on bar lines.
  // The phrase rounding goes to the mark (a rest that ends with its second move on the last downbeat): shared out one
  // beat per scene it would lengthen a still hold past api 3's 2 beats in most scenes. Since none of it can be shared,
  // the phrase is one bar, not two: a 2-bar phrase left up to 7 beats of extra lock-up hold (8.5 s closing scene in
  // the example; 2026-10-19). The bed resolves on any bar line.
  phrase: 1,
  phraseShareBeats: 0,
  wordSec: 0.3,
  types,
  validate: (content) => validate(content),
};

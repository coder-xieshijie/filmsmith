// timing.rules.js — how long each plakat scene needs (format: lib/timing.js header, api 3).
//
// Every scene here is a build: its parts land one after another on beats and half beats (scenes.js plan()), and the
// viewer reads each string once it has landed. So each type states `need` directly from its plan:
//
//   need = max(reading done, glance done, held text done, last landing settled + 1 beat) + exit
//   reading:   plan().reads lists every string with the u it lands at and its tier; each becomes legible `settle` s
//              after its landing starts (0.25 s, or the type's own: 0.1 s for a word opened by the aperture, 0.2 s in
//              the slot) and goes through the shared reader (ctx.reading): primary text at 0.3 s a word, one string
//              after another, never before it lands; glance text (≤ 6 words, repeated elsewhere or safe to delete —
//              scenes.js says why per type) ≥ 1 s fully still, in parallel.
//   held text: a string with `hold` (the closing URL) stays ≥ hold s once legible (principle 1: ≥ 3 s).
//   +1 beat:   an element lands, then holds still so the next onset can catch the eye (principle 5).
//   exit:      the scene's own exit, or the part of the next scene's device that covers it (columns 1 beat, the
//              portal 1.5 beats), counted in u before the scene end (`out`).
//
// The four tiers (api 3, principles 4 and 5, owner-approved 2026-10-19):
//   text per state  primary text entering together ≤ 5 words (the tagline's lines are the film's claim: 8, read in a
//                   pause); every multi-part slot enters part by part (scenes.js `reads`)
//   holds           `steps()` returns every still window of the scene at its fitted need (scenes.js planScene: the
//                   gaps in its motion table), each ≤ 2 beats; a still window past that is filled at render length
//                   with the type's hold move (an ink frame stepping over the page's items, the claim's arrow, the
//                   install cursor's blink), so the pads before turns and the phrase share never hold still either
//   T0 micro        every landing's cue, every hold move, every word through the slot or on the anchor
//   T1 shots        problem (the headline becomes the table heading) and claim (the half collapses into a band)
//                   declare a second composition; `max` is the 6 s composition ceiling at the fitted tempo, raised for
//                   those two types only (the T1 check holds each composition to 6 s)
//   T2 expressive   the scene entrances by device (devices.js): plakat-columns (three variants), counter-portal,
//                   step-wipe; and the problem's full accent wipe (the mode's own device, `plakat-accent-wipe`: fit
//                   warns that it is not a library id). The aperture and the slot are T0 and are not declared
//   T3 peaks        the first scene's peak (`hook`) and the last scene's (`lockup`) by default; any scene may set
//                   `peak: 'hook' | 'claim' | 'reveal' | 'lockup'` and one of them `climax: true`
import { TYPES, planScene } from './scenes.js';
import { linked, ENTER, windowOf } from './devices.js';

const SETTLE = 0.25; // s from a landing's start until a line is legible: expo-out / power-out entrances are > 90 % home
const STILL = 1; // beats a page rests after its last landing

const plan = (s, g, ctx, D = 1e3, fill = false) => { const L = linked(ctx.scenes, ctx.i); return planScene({ ...s, enterBy: L.enterBy, exitBy: L.exitBy, last: L.last, D, form: ctx.content?.form ?? 'square' }, D, 120 / g.bpm, { fill }); };

const need = (rule) => (s, g, ctx) => {
  const k = 120 / g.bpm; // u → s (1 u = 2 beats)
  const P = plan(s, g, ctx);
  const list = [], held = [];
  for (const [u, strings, o = {}] of P.reads) {
    const at = u * k + (o.settle ?? SETTLE);
    for (const x of [].concat(strings).flat(Infinity)) {
      if (x == null || x === '') continue;
      if (typeof x === 'object') list.push({ ...x, text: String(x.text), tier: x.tier ?? o.tier ?? 'primary', at });
      else list.push({ text: String(x), tier: o.tier ?? 'primary', at, ...(o.claim ? { claim: true } : {}) });
    }
    if (o.hold) held.push(at + (rule.hold ?? o.hold));
  }
  list.sort((a, b) => a.at - b.at);
  const r = ctx.reading(list);
  return Math.max(r.end, ...held, P.settled * k + STILL * g.beat) + P.out * k;
};

// The still windows at the fitted need (seconds), each ≤ 2 beats; { still, pause: true } where a claim is read. A type
// with a hold move (scenes.js `walk`, install's blink) fills whatever the grid, a turn's pad or the phrase share add
// to its length with hold moves at render length, so its last entry is -Infinity: "no fixed last hold" (lib/timing.js
// would otherwise add the pad to the last still and warn). The holds it really has are in events() and are checked
// there, at the length the film renders.
const steps = (rule) => (s, g, ctx) => {
  const k = 120 / g.bpm;
  const D = need(rule)(s, g, ctx) / k;
  const P = plan(s, g, ctx, D, true);
  const out = (P.stills || []).map((x) => (x.pause ? { still: (x.to - x.from) * k, pause: true } : (x.to - x.from) * k));
  return TYPES[s.type]?.walk || s.type === 'install' ? [...out, -Infinity] : out; // TYPES read at call time (scenes.js imports this file)
};

const fill = (o) => Object.fromEntries(Object.entries(o).map(([type, r]) => [type, {
  ...r,
  need: need(r),
  ...(!r.rest ? { steps: steps(r) } : {}),
}]));

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The same kinds score.mjs
// gives the bed (content.sound.kinds overrides).
export const MUSIC = { problem: 'build', claim: 'build', figure: 'build', chapter: 'drop', options: 'drop', document: 'drop', matrix: 'drop', verify: 'drop', flow: 'drop', slot: 'drop', bars: 'drop', words: 'drop', install: 'break', tagline: 'drop', end: 'outro' };
const musicOf = (s, content) => ({ ...MUSIC, ...(content.sound?.kinds || {}) })[s.type] || 'drop';
const dropsHere = (scenes, i, content) => musicOf(scenes[i], content) === 'drop' && (i === 0 || musicOf(scenes[i - 1], content) !== 'drop');

// Key events, holds, hand-offs and the four tiers of one scene (times in seconds from the scene start).
//   keys   claim (the claim's first frame, on a bar line), stamp (the document's stamps), end (the closing underline on
//          the last downbeat), turn (claim and tagline starts), drop: true where the music drops
//   holds  every still window ≥ 0.2 s (planScene), pause: true where the tagline is read
//   micro  every cue (a landing, a tick, a block, a word) and every hold move
//   shots  problem, claim: their second composition
//   expressive  the device this scene is entered by, when it is a T2
//   peaks  the scene's peak when it has one
const sceneEvents = (s, g, scenes, i, content) => {
  const k = 120 / g.bpm, D = s.dur / k;
  const S = { ...linked(scenes, i), D, form: content.form ?? 'square' };
  const P = planScene(S, D, k);
  const keys = [], holds = [], handoffs = [], micro = [], shots = [], expressive = [], peaks = [];
  if (s.type === 'claim') {
    keys.push({ t: 0, kind: 'claim' });
    if (scenes[i - 1]?.type === 'problem' || S.enterBy === 'portal') handoffs.push({ t: 0 });
  }
  if (s.type === 'document') keys.push({ t: (P.step[2] + 0.05) * k, kind: 'stamp' });
  if (s.type === 'end' && P.moves.length) keys.push({ t: P.last * k, kind: 'end' });
  if (dropsHere(scenes, i, content)) {
    const at0 = keys.find((x) => Math.abs(x.t) < 1e-3);
    if (at0) at0.drop = true;
    else keys.push({ t: 0, kind: s.timing?.turn ? 'turn' : 'accent', drop: true });
  }
  for (const x of P.stills || []) if ((x.to - x.from) * k >= 0.2) holds.push({ from: x.from * k, to: x.to * k, ...(x.pause ? { pause: true } : {}) });
  const seen = new Set();
  const mic = (u, what) => { const key = Math.round(u * k * 1000); if (seen.has(key)) return; seen.add(key); micro.push({ t: u * k, what }); };
  for (const [u, kind] of P.cues) if (u >= -1e-9 && u < D - 1e-9) mic(u, kind);
  for (const [u, what] of P.micro) mic(u, what);
  for (const u of P.moves) mic(u, 'hold move');
  for (const [u, what] of P.shots) shots.push({ t: u * k, what });
  // the problem's full accent wipe is a full-frame ground change (T2): it is the mode's own device, kept since the
  // source film (mode card, Signature transformations), so its id is the template's, not the library's
  if (P.wipe != null && !P.covered) expressive.push({ t: P.wipe * k, dur: 0.45 * k, device: 'plakat-accent-wipe', variant: { kind: 'wipe', from: s.type, into: scenes[i + 1]?.type } });
  const E = ENTER[S.enterBy];
  if (E && E.tier === 'T2') {
    const [a, b] = windowOf(S.enterBy, g.beat);
    expressive.push({ t: a, dur: b - a, device: E.device, variant: { kind: S.enterBy, ...(E.variant ? { form: E.variant } : {}), from: scenes[i - 1]?.type, into: s.type } });
    if (S.enterBy === 'portal' || S.enterBy === 'steps') handoffs.push({ t: S.enterBy === 'steps' ? b : 0 });
  }
  // default peaks: the first scene is the hook, the last the lock-up; content may mark any scene (peak, climax)
  const kind = s.peak ?? (i === 0 ? 'hook' : i === scenes.length - 1 ? 'lockup' : null);
  if (kind && P.peakAt != null) peaks.push({ t: P.peakAt * k, kind, ...(s.climax === true ? { climax: true } : {}) });
  return { keys, holds, handoffs, micro, shots, expressive, peaks };
};

export default {
  api: 3,
  devices: ['plakat-accent-wipe'], // the mode's own T2 device (lib/fit.mjs knows it; CONTRACT.md, api 3 T2)
  // 120 BPM is the source film's tempo and the swiss bed's home (borrowed); ±6.7 % keeps marimba runs and the
  // half-beat counters crisp (derived).
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4,
  unit: 0.25, // one beat: this mode cuts on any beat
  phrase: 1, // the film ends on a bar line (the swiss bed's outro is one resolving chord from the closing page's first beat)
  // max: the composition ceiling. Undefined = 6 s at the fitted tempo (lib/timing.js sceneMaxSec). problem and claim
  // hold two compositions each (their `shots`), so they may run past 6 s; the T1 check holds each half to 6 s.
  types: fill({
    problem: { in: 1.5, out: 0.9, max: 4 },
    claim: { in: 1.1, out: 0.3, turn: true, max: 4 },
    chapter: { in: 0.7, out: 0.25 },
    options: { in: 0.5, out: 0.25 },
    document: { in: 0.5, out: 0.25 },
    matrix: { in: 0.5, out: 0.25 },
    verify: { in: 0.5, out: 0.25 },
    flow: { in: 0.5, out: 0.25 },
    install: { in: 0.5, out: 0.25 },
    words: { in: 0.2, out: 0.25 },
    slot: { in: 0.7, out: 0.25 },
    bars: { in: 1, out: 0.25 },
    figure: { in: 0.5, out: 0.25 },
    tagline: { in: 0.5, out: 0.25, turn: true },
    end: { in: 0.5, out: 0, hold: 3, absorb: true, rest: true, reason: 'the closing page: the URL holds ≥ 3 s, then the last-bar move' },
  }),
  events: (scenes, g, content) => {
    const out = { keys: [], holds: [], handoffs: [], micro: [], shots: [], expressive: [], peaks: [], mask: [0, 120, 1920, 840] };
    scenes.forEach((s, i) => {
      const ev = sceneEvents(s, g, scenes, i, content);
      for (const name of ['keys', 'handoffs', 'micro', 'shots', 'expressive', 'peaks']) for (const x of ev[name]) out[name].push({ ...x, t: s.start + x.t, scene: i });
      for (const x of ev.holds) out.holds.push({ ...x, from: s.start + x.from, to: s.start + x.to, scene: i });
    });
    return out;
  },
};

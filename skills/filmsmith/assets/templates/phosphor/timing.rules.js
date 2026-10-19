// timing.rules.js — how long each phosphor scene needs (format: lib/timing.js header, api 3).
//
// Every scene here is a sequence of steps (a hook typed, then its problem tags; a claim, then its sub; a
// question with its options, then the pick, then the next question...). A step starts once the step before
// it has been read, so a scene's need is not "entrance + one block of reading + exit": each type's `need`
// plays events.js, the same schedule the picture and the sound use, and reads with ctx.reading (the shared
// reader). `steps` returns the still hold after each landing; fit() checks each against the api 3 limits
// (principles 4 and 5, owner-approved 2026-10-19): at most five primary words enter together, a landing holds
// ≥ 0.2 s and ≤ 2 beats (a claim read in a pause ≤ 2 bars), a composition lasts ≤ 6 s.
//
// Reading tiers (principle 1). Primary text adds up in reading order: claims, titles, questions with their
// options, flags, the lock and result, node and party names, counts, meta lines, commands being installed,
// the key line of a run, the result of a pick, the readings of a scope, the URL and the closing sub. Glance
// text needs 1 s fully still and is read alongside; a slot is glance only when it has at most six words AND
// repeats something on screen or can be deleted without the shot losing its point. Per type, the glance slots
// and why they qualify:
//   hero     facts (each ≤ 6 words; the claim and sub stand without them)
//   chapter  card line under the chapter title (names the chapter's tool, which the page then shows),
//            page note under the header (a caption; the page reads without it)
//   qa       window title
//   decide   window title; decisions that restate a pick from the questions page (a decision with
//            `found` is new and primary); each strip item (safe to delete)
//   freeze   window names, document lines (the page is about the flags; the lines only have to be seen
//            before the fix moves them), the added line (the fix note says it), the command (the hashes say
//            what it did), the output lines, the lock word (it lands with the result, which says it)
//   flow     command, node subs, hub label and sub, each strip item
//   compare  the three labels and descriptions, each list item (the names say who is who); the ticker
//            repeats the counted items with the verdict and is not read
//   run      window title (the command that runs); the lines after the key line (what the tool did with it,
//            safe to delete); the stream itself is not read: it repeats one line shape, the marquee condition
//   pick     window title; each candidate (a label the frame visits, one or two words; labels are scanned,
//            not read)
//   scope    window title
//   ends     sub, node tags and subs, bracket, loop label
//   install  window title, each step (it recaps a chapter)
//   end      chips (repeat the install steps)
// A glance slot over six words is counted as primary and reported by `npm run fit`: shorten it.
// horizon-tagline is word at a time: one word per half beat, then the whole line 0.3 s a word, in a pause.
//
// Fields: in / out document the choreography in beats (need() plays it); turn = the scene starts a chapter
// or carries the claim, on a bar line; max = bars a scene may last. A scene that holds two or three compositions
// (a chapter card, then its page, then the close-up after a push-in; the prompt, the hook, the collapse) may last
// five bars; every composition inside it stays ≤ 6 s, which the T1 check enforces (lib/timing.js tiers).
import { need, steps, exportEvents, plan } from './events.js';

// fillsSlack: every phosphor type fills the slack the grid adds with tail moves (dims on the beat), so the post-grid last-step check does not apply
const t = (o) => ({ fillsSlack: true, ...o, need: (s, g, ctx) => need(s, g, ctx.reading, ctx.scenes, ctx.i), steps: (s, g, ctx) => steps(s, g, ctx.reading, ctx.scenes, ctx.i) });

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The same sections
// score.mjs builds: a scene's music kind is its `music`, else MUSIC[type]; a drop scene with `musicRest` (a held
// chapter card, the install commands) drops when the rest ends, a tagline after its one-bar build, compare when
// its last count lands; any other drop scene drops on its first beat. A drop that follows a drop is no landing.
export const MUSIC = { boot: 'intro', audit: 'intro', hero: 'build', qa: 'build', decide: 'build', run: 'build', pick: 'build', scope: 'drop', freeze: 'drop', flow: 'build', compare: 'drop', ends: 'drop', install: 'drop', 'horizon-tagline': 'drop', 'tunnel-tagline': 'drop', end: 'outro' };
const musicOf = (s) => s.music || MUSIC[s.type] || 'build';
const dropAt = (s, g) => { // seconds from the scene start, or null
  if (musicOf(s) !== 'drop') return null;
  if (s.T.musicRest) return s.T.musicRest;
  if (s.type.endsWith('tagline')) return g.bar;
  if (s.type === 'compare' && !s.music && s.T.steps?.length && s.T.steps.at(-1) > 0 && s.T.steps.at(-1) < s.dur) return s.T.steps.at(-1);
  return 0;
};
// Mark the key on the drop's moment (an accent, claim or stamp before a land or turn); without one, a turn key
// on a turn scene's first beat, else an accent key.
const PREFER = ['accent', 'claim', 'stamp', 'land', 'turn', 'end'];
const markDrop = (keys, t, scene, turn) => {
  const k = keys.filter((x) => Math.abs(x.t - t) < 1e-3).sort((a, b) => PREFER.indexOf(a.kind) - PREFER.indexOf(b.kind))[0];
  if (k) k.drop = true;
  else keys.push({ t, kind: turn ? 'turn' : 'accent', scene, drop: true });
};
const events = (scenes, g, content) => {
  const ev = exportEvents(scenes, g, content);
  const { laid } = plan(content, { bpm: g.bpm, scenes });
  laid.forEach((s, i) => {
    const d = dropAt(s, g);
    if (d == null || (d === 0 && i > 0 && musicOf(laid[i - 1]) === 'drop')) return;
    markDrop(ev.keys, s.start + d, i, d === 0 && !!s.timing?.turn);
  });
  return ev;
};

export default {
  api: 3,
  devices: ['fibre-burst', 'glitch-cut', 'tunnel-fold'], // the mode's own T2 devices (crt-collapse is runtime/transitions')
  // 128 is the bed's written tempo and the source film's measured one; ±6 % keeps the 16th pulse from
  // dragging (below 120) or turning frantic (above 136), and keeps half-beat typing and counter steps
  // between 0.22 s and 0.25 s.
  bpm: { default: 128, min: 120, max: 136 },
  beatsPerBar: 4,
  // One beat (api 3, principle 5: only the key beats are locked; scene lengths round to a beat). Chapter turns,
  // the claim and the run / pick / scope pages start on a bar line; the part bar before them is their pad, and
  // the scene it lengthens fills it with tail moves (events.js tailsOf), so no hold passes two beats.
  unit: 0.25,
  phrase: 2,
  types: {
    boot: t({ in: 0.25, out: 4, max: 5 }), // three compositions: the prompt, the hook, the collapse
    audit: t({ in: 0.5, out: 2, max: 4 }),
    hero: t({ in: 0.27, out: 0.64, turn: true, max: 3 }),
    qa: t({ in: 0.08, out: 0.5, turn: true, max: 5 }),
    decide: t({ in: 0.1, out: 0.5, max: 3 }),
    freeze: t({ in: 0.08, out: 0.5, turn: true, max: 5 }), // three compositions: card, documents, terminal
    flow: t({ in: 0.08, out: 0.6, turn: true, max: 5 }),
    compare: t({ in: 0.08, out: 0.6, turn: true, max: 5 }),
    run: t({ in: 0.08, out: 0.5, turn: true, max: 5 }),
    pick: t({ in: 0.08, out: 0.5, turn: true, max: 5 }),
    scope: t({ in: 0.08, out: 0.5, turn: true, max: 5 }),
    ends: t({ in: 0.17, out: 0.53, max: 3 }),
    install: t({ in: 0.1, out: 0.5, max: 4 }), // two compositions: the terminal, then the steps on the drop
    'horizon-tagline': t({ in: 4.5, out: 0.5, turn: true, max: 4 }),
    'tunnel-tagline': t({ in: 4, out: 0.6, turn: true, max: 3 }),
    end: t({ in: 0.15, out: 0.85 /* 0.4 s dim */, absorb: true, rest: true, reason: 'closing card: the URL holds ≥ 3 s, the phrase rounding lands here and the chips light on the last downbeat' }),
  },
  // Key events (turn, claim, land, stamp, accent, end; drop: true where the music drops), the still holds of
  // pages without ambient motion in their content area, the hand-offs (fold → slit, line → cursor, the brake,
  // the beam), the content mask inside the HUD, and the four tiers: micro (every landing, every typed phrase,
  // every jump of the pick's frame, the tails), shots (the page after a chapter card, the collapse, the freeze
  // terminal, the slit), expressive (fibre-burst, glitch-cut, crt-collapse, tunnel-fold) and peaks (the hook,
  // the climax, the lock-up).
  events,
};

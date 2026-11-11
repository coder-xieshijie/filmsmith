// timing.rules.js — how long each trace scene needs and what happens in it. Format: lib/timing.js header (api 3).
//
// A scene's length here depends on the run as well as the copy (how many rows split, how many counts fly,
// how many steps the loop replays), so the rules are built from the run: rulesFor(run). The default export
// is built from the run of this folder's content.js, which is what lib/fit.mjs and check-film.mjs load.
//
// Every scene type's choreography lives here, in beats from the scene start, and timeline.js reads the same
// functions, so the length fit() computes, the key events and tiers in renders/timing.json and the moments the
// picture lands cannot drift apart. Nothing in a choreography is squeezed to fit a ceiling: items keep their natural
// spacing, and a scene whose run is too long for its ceiling is an error (split the loop with `from`/`to`).
// Exits that end a scene (the summary's return, the probe's hand-off to the thesis, the first half of an expressive
// transition into the next scene) are timed back from the scene's end.
//
// A scene needs the longer of two paths, because the captions describe the motion they sit under:
//   motion   the last landing of its choreography + the hold the landed element needs
//   reading  lib/timing.js reader through ctx.reading(): a caption is one line of one or more phrases; each phrase is
//            one reading state (api 3: ≤ 5 words) and enters when the one before has been read, on the same line.
//            Captions follow each other, or start on the beat the choreography pins (the hook's split, the probe's
//            reveal). Rule lines, histogram rows and the probe's size are glance text (≤ 6 words, each repeats what
//            the board shows), so they only need ≥ 1 s fully still.
//
// Tiers (api 3, principles 4 and 5): every onset of the choreography and every phrase is a micro event (T0); the
// expressive transitions (T2) are the scenes' `enter` devices (path-type, token-sweep, trace-flow), two beats
// straddling the cut, and the probe's `reveal` flow, two beats straddling its reveal; the peaks (T3) are the split
// of the words into chips (hook), the probe's reveal (the climax, read in a pause) and the claim the thesis lands
// (lock-up); the probe's reveal is a second composition inside its
// scene (a shot). The holds are the still windows between the scene's moves, computed from the same move list.
//
// Landings (principle 5): a fuse lands on the frame its move reaches 90 % (LAND_E of its duration, about
// 0.15 s after the two chips touch), an ease-out landing on the frame it reaches 90 %. Every fuse and the summary,
// reveal, claim and closing landings are key events on the beat; the count's landings sit on the half-beat grid.
import content from './content.js';
import { loadRun, fill } from './run.js';
import { readTime, DEFAULTS } from './lib/timing.js';
import { smooth } from './lib/motion.js';
import PALETTES from './palettes.js';

export const HOLD = 0.5; // beats a landed element holds before the next onset or the cut (principle 5, derived)
export const FADE = 0.5; // s: the film's final fade to the ground (index.html)
export const FUSE = 0.6; // s: a slow fuse; loop and probe fuses are shorter (below)
export const SETTLE = 0.4; // s: a fused chip's landing swell (pieces.js), part of its move
// The fuse's landing: the fraction of its duration at which its move (smootherstep, pieces.js drawRow) reaches
// 90 % (principle 5's landing; ≈ 0.75). The fuse starts LAND_E × its duration before the beat it lands on.
export const LAND_E = (() => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (smooth(m) < 0.9) lo = m; else hi = m; } return hi; })();
// Captions: a scene's first caption starts its 0.3 s rise LEAD beat before the scene starts, while the previous
// caption is still leaving (2026-10-18, brisk), so it is still 0.3 s − LEAD beat after the cut. After a scene that ends
// on an exit move (the summary's return, the probe's hand-off) and in the film's first scene it starts at 0.15 beat;
// after an expressive transition, at its end. A later phrase of the same line starts its rise PHRASE s before the
// phrase ahead of it has been read (api 3, 2026-10-19). The last caption leaves with a 0.2 s fade (2/3 of the rise)
// ending EXIT s before its scene's exit (0.6 beat covers fade, gap and margin).
export const CAP = { at: 0.15, lead: 0.25, rise: 0.3, gap: 0.1, out: 0.6, fade: 0.2, exit: 0.12, phrase: 0.15 };
const EXITS = new Set(['summary', 'probe']); // scene types that end on an exit move of their own
export const COUNT_IN = 0.75; // beats the token bar takes to count in, whatever its number of cells
// A weight's flight (count scene): leaves 0.12 s after its row is lit, 0.16 s between a row's weights, flies
// 0.45 s, grows its segment expo-out over 0.3 s; the segment reaches 90 % 0.1 s after touching down.
export const FLIGHT = { lead: 0.12, gap: 0.16, fly: 0.45, grow: 0.3, land90: 0.3 * (Math.log2(10) / 10) };
export const COUNT_SP = 1; // beats between count items: one landing a beat (was 1.5 before 2026-10-18, brisk)
export const LOOP_SP = 2; // beats between loop merges by default: every merge on a beat, each new rule line ≥ 1 s alone
export const PACES = [2, 1]; // a loop's `pace` (beats a merge): 2, or 1 for the compressed run into the climax
export const PROBE_SP = 1; // beats between the probe's replays
// Exits are faster than entrances (principle 5): about 0.6 × the entrance, accelerating.
export const EXIT = { camera: 0.2, big: 0.36, probe: 0.18, focus: 0.24 };
export const MORPH = 0.7; // s: the probe's result chips fuse and grow into the thesis's first line
export const PUSH = { dur: 0.32, land: 0.32 * (Math.log2(10) / 10) }; // camera push, expo-out; 90 % frame
export const BIG = { dur: 0.6, land: 0.6 * (Math.log2(10) / 10) }; // the summary line grows from the count
export const BIG_DEFAULT = '{T0} → [[learned|{TN}]]'; // the summary's default enlarged line
export const GLANCE = DEFAULTS.glanceSec; // s a glance item stays fully still
export const SCRAMBLE = { beats: 0.75, stagger: 0.04 }; // the probe's letters resolve (scramble-resolve), one chip after another
// The path caption: the line under a caption that rides path-type (the caption's baseline + LIFT), the range of its
// loop's radius (px; the loop takes the longer sentence's length), its width.
export const PATH = { lift: 14, radius: [56, 84], lineWidth: 3 };

// Expressive transitions (T2) a scene may enter with: `enter` on the scene. Two beats straddling the cut (one beat of
// the outgoing scene, one of the incoming); each is a library device (references/transitions.md, mode trace).
//   path   path-type: the outgoing scene's last caption lies on a line that rolls up a loop and carries it out; the
//          incoming scene's first caption follows it in and the line opens again. For a loop: the loop is the content
//   sweep  token-sweep: the token bar's cells grow into bars that sweep over the frame and fall back, uncovering the next
//          (between the run and the summary, and back)
//   flow   trace-flow: a front carried by a vector field crosses the frame and carries the old frame into the new
export const ENTER = {
  path: { device: 'path-type', beats: 2 },
  sweep: { device: 'token-sweep', beats: 2 },
  flow: { device: 'trace-flow', beats: 2 },
};
// The probe may turn into its reveal with an expressive transition: `reveal: 'flow'` on the probe scene (2026-10-19).
// The run turns there, from replaying its rules on the unseen input to their result, and it is the film's last
// stretch: without it the last T2 is the sweep into the summary, 14–17 s before the end (api 3 wants one every
// 8–12 s). Two beats straddling the reveal beat inside the scene, as a cut would be: side A is the probe while its
// last replay settles, side B the reveal (the push, the claim's caption, the size turning colour), each the run's
// real state. Always left to right, in reading order over the encoded input: the front has left the caption band's
// left half by the reveal beat, when the claim's caption starts to rise there.
export const REVEAL = { flow: { device: 'trace-flow', beats: 2, variant: 'left to right, at the reveal' } };
export const revealOf = (sc) => (sc?.type === 'probe' && REVEAL[sc.reveal] ? sc.reveal : null);
export const enterOf = (scenes, i) => (i > 0 && scenes[i]?.type !== 'thesis' && ENTER[scenes[i]?.enter] ? scenes[i].enter : null);
const halfWin = (scenes, i) => (enterOf(scenes, i) ? ENTER[scenes[i].enter].beats / 2 : 0); // beats of the window in scene i
// The variant of each use: a device's second use runs the other way (mirrored), so no repeat is unchanged.
export const enterVariant = (scenes, i) => {
  const e = enterOf(scenes, i);
  if (!e) return null;
  const k = scenes.slice(0, i).filter((s, j) => enterOf(scenes, j) === e).length;
  if (e === 'path') return 'loop under the caption';
  return k % 2 ? 'right to left' : 'left to right';
};

const q = (x) => Math.ceil(x - 1e-9); // up to the next whole beat

// A caption is one line: a string, or an array of phrases that enter one after another on it.
export const caps = (sc) => (Array.isArray(sc.captions) ? sc.captions : sc.caption != null ? [sc.caption] : []);
export const phrasesOf = (c) => (Array.isArray(c) ? c : [c]).filter((x) => x != null && x !== '');
export const lineOf = (c) => phrasesOf(c).join(' ');
// The captions that ride path-type: the last caption of a scene the next one enters by path, the first caption of a
// scene entered by path. They are drawn as plain text centred on their line (the hand-off draws one ink).
export const pathCaps = (scenes, i) => ({
  first: enterOf(scenes, i) === 'path' && caps(scenes[i]).length > 0,
  last: enterOf(scenes, i + 1) === 'path' && caps(scenes[i]).length > 0,
});

// seconds from the scene start at which scene i's first caption starts to rise (or, entered by path, is in place)
export const capStart = (scenes, i, b) => {
  // the summary's caption follows its line, which lands as the transition ends: a beat later, so the two never enter
  // together
  if (enterOf(scenes, i)) return (halfWin(scenes, i) + (scenes[i].type === 'summary' ? 1 : 0)) * b;
  return i > 0 && !EXITS.has(scenes[i - 1]?.type) ? -CAP.lead * b : CAP.at * b;
};

// Which run steps each step / loop scene shows, by scene index (step: 1-based `step`; loop: `from`, `to`,
// default the rest).
export const stepRanges = (scenes, nSteps) => {
  const out = [], done = [];
  const count = () => done.filter(Boolean).length;
  scenes.forEach((sc, i) => {
    if (sc.type === 'step') {
      const k = (sc.step ?? count() + 1) - 1;
      done[k] = true;
      out[i] = { from: k, to: k };
    } else if (sc.type === 'loop') {
      const from = (sc.from ?? count() + 1) - 1, to = (sc.to ?? nSteps) - 1;
      for (let k = from; k <= to; k++) done[k] = true;
      out[i] = { from, to };
    }
  });
  return out;
};

// Caption plan (seconds from the scene start). Each caption: its phrases, each with tin (starts to rise), ready
// (still, readable) and sec (reading time); the caption's tin and done (its last phrase read). Reading items for
// lib/timing.js's reader, one per phrase, with `at` measured from the first phrase's ready time (origin). t0: the
// first caption's start (capStart); placed: the first caption arrives in place (path-type), no rise. capAt[i]
// (beats) pins caption i to a beat of the choreography; otherwise it starts after the one before has been read.
export const captionPlan = (list, b, capAt = [], fills = {}, wordSec = DEFAULTS.wordSec, t0 = CAP.at * b, placed = false, claimLast = false) => {
  const out = [];
  list.forEach((c, i) => {
    const prev = out[i - 1];
    const tin = i === 0 ? t0 : capAt[i] != null ? capAt[i] * b : prev.done + CAP.gap;
    const phrases = [];
    phrasesOf(c).forEach((p, k) => {
      const text = fill(p, fills);
      const sec = readTime(text, { wordSec });
      const pin = k === 0 ? tin : phrases[k - 1].ready + phrases[k - 1].sec - CAP.phrase;
      // a caption carried in by path-type arrives whole and in place
      const now = i === 0 && placed;
      phrases.push({ text, sec, tin: now ? tin : pin, ready: now ? tin : pin + CAP.rise });
    });
    const last = phrases[phrases.length - 1];
    out.push({ text: phrases.map((p) => p.text).join(' '), phrases, tin, ready: phrases[0]?.ready ?? tin, done: last ? last.ready + last.sec : tin });
  });
  const r0 = out[0]?.ready ?? 0;
  const items = [];
  out.forEach((c, i) => c.phrases.forEach((p) => items.push({ text: p.text, tier: 'primary', at: p.ready - r0, ...(claimLast && i === out.length - 1 ? { claim: true } : {}) })));
  return { list: out, origin: r0, items };
};

// The choreography of every scene type, in beats from the scene start (`motion`, `exit`, `lands` and `moves` in
// seconds).
//   motion  when the last landing has held long enough (the motion path of need)
//   exit    seconds at the end of the scene that belong to its exit (captions leave before it)
//   lands   landing times, for the key events
//   moves   [{ t, d, what, info }]: everything that moves, t from the scene start, d until it is still again; info:
//           it brings new information (a T0 micro event). The still windows between moves are the holds
//   glance  [{ text, at (s from scene start) }]: glance text that must be still ≥ 1 s inside this scene
// x = { run, b (beat seconds), range (step / loop scenes), cap (seconds to read a caption list), ready0 (s: when
// the first caption is still), morphed / morphOut (the thesis grows from this scene), e0 (beats: the end of the
// expressive transition this scene enters with, else 0) }
const label = (parts) => parts.map((p) => p.t).join(' ');
export const choreo = {
  // rows fade in 0.25 beat apart; the words split into chips (0.5 s); the token bar counts in over COUNT_IN
  hook(sc, { run, b, cap, ready0 }) {
    const cs = caps(sc);
    let split = Math.min(2.4, 0.25 + run.rows.length * 0.25 + 0.6);
    // a second caption arrives with the split, so the first must have been read by then
    if (cs.length > 1) split = Math.max(split, q((ready0 + cap([cs[0]]) + CAP.gap) / b));
    const strip = split + 0.75;
    const land = (strip + COUNT_IN) * b;
    const rowsIn = run.rows.map((_, i) => 0.25 + i * 0.25);
    const moves = [
      ...rowsIn.map((x, i) => ({ t: x * b, d: 0.3, what: `row ${i + 1} appears`, info: true })),
      { t: split * b, d: 0.5 + run.rows.length * 0.05, what: 'the words split into chips', info: true },
      { t: strip * b, d: COUNT_IN * b + 0.12, what: 'the token bar counts in', info: true },
    ];
    return { rowsIn, split, strip, countIn: COUNT_IN, capAt: [null, split],
      lands: [split * b + 0.5, land], moves, motion: land + HOLD * b, exit: 0, glance: [] };
  },
  // step 1's histogram item by item: each row's weight flies over and grows a segment. Item i's first segment
  // lands (90 %) on beat `first + i × COUNT_SP`; its row lights FLIGHT.lead + fly + land90 before that.
  count(sc, { run, b, e0 }) {
    const items = run.steps[0].counts?.items ?? [];
    const pre = FLIGHT.lead + FLIGHT.fly + FLIGHT.land90;
    // the first segment lands on the first half beat ≥ 0.25 beat + the flight (count landings are not keys)
    const first = Math.ceil((e0 + 0.25 + pre / b) * 2 - 1e-9) / 2;
    const landAt = items.map((_, i) => first + i * COUNT_SP); // beats
    const segLands = items.map((it, i) => (it.from ?? [{}]).map((_, j) => landAt[i] * b + j * FLIGHT.gap)); // s
    const last = segLands.length ? Math.max(...segLands.flat()) : 0.5 * b;
    const lastItem = items.length ? items[items.length - 1] : null;
    const lbl = lastItem ? `${label(lastItem.parts)} ${lastItem.value}` : '';
    const moves = items.map((it, i) => ({ t: landAt[i] * b - pre, d: pre + (segLands[i].length - 1) * FLIGHT.gap + FLIGHT.grow, what: `${label(it.parts)} counted`, info: true }));
    moves.push({ t: e0 * b, d: 0.4, what: 'the histogram heading appears', info: true });
    return { items: landAt.map((L) => L * b - pre), landAt, segLands, lands: segLands.map((x) => x[x.length - 1]), moves,
      motion: last + FLIGHT.grow + HOLD * b, exit: 0, glance: lastItem ? [{ text: lbl, at: last + FLIGHT.grow }] : [] };
  },
  // one step: pick, highlight a quarter beat later, the fuse (0.6 s) lands, the rule line half a beat after it (still
  // 0.4 s after it starts). Straight after the count (the histogram is already up; the film's first, slowest step)
  // the pick is at 0.5 and the fuse lands on beat 3, the pair lit for a beat and a half; otherwise the histogram first
  // regrows (the recount, about a beat), the pick is at 0.75, as its bars land, and the fuse lands on beat 2 (api 3,
  // 2026-10-19: was pick 1, fuse on beat 3, rule 3.75 for both, so the steps now speed up into the loop).
  // When the thesis grows out of this scene's board (morphOut, 2026-10-19), the scene ends on that hand-off: its
  // last MORPH seconds are the morph, after the rule line has held and been read.
  step(sc, { run, b, range, morphOut, fresh, e0 }) {
    const pick = e0 + (fresh ? 0.75 : 0.5), hi = pick + 0.25, contact = e0 + (fresh ? 2 : 3), rule = contact + 0.5;
    const st = run.steps[range.from];
    const r = label(st.rule.parts);
    const still = rule * b + 0.4;
    const fuse = contact * b - LAND_E * FUSE;
    const moves = [
      ...(fresh ? [{ t: e0 * b, d: 0.35 + 0.05 * (st.counts?.items.length ?? 0), what: 'the histogram is recounted', info: true }] : []),
      { t: pick * b, d: 0.2, what: 'the top pair is picked', info: true },
      { t: hi * b, d: 0.2, what: 'its occurrences light up', info: true },
      { t: fuse, d: FUSE + SETTLE, what: `${r}: the pair fuses everywhere`, info: true },
      { t: rule * b, d: 0.4, what: 'the rule line is appended', info: true },
    ];
    return { pick, hi, contact, fuse, dur: FUSE, rule, fresh,
      lands: [contact * b, still], moves, motion: (rule + HOLD) * b + 0.4 + (morphOut ? MORPH : 0),
      exit: morphOut ? MORPH : 0, glance: [{ text: r, at: still }] };
  },
  // the remaining steps, `pace` beats apart (2, or 1 for the compressed run into the climax): each lights half a
  // pace before its fuse lands (on a beat, from beat 1), its rule line slides in a quarter pace after. The last rule
  // line stays fully still ≥ 1 s before the cut, unless the next loop keeps it in place (glanceCarries).
  loop(sc, { run, b, range, morphOut, e0, carry }) {
    const n = range.to - range.from + 1;
    const pace = PACES.includes(sc.pace) ? sc.pace : LOOP_SP;
    const dur = Math.min(FUSE, pace * b * 0.45);
    const contacts = Array.from({ length: n }, (_, k) => e0 + 1 + k * pace);
    const rules = contacts.map((c) => c + pace / 4);
    const hi = contacts.map((c) => Math.max(e0 + 0.1, c - pace / 2));
    const lastRule = rules[n - 1] * b + 0.4; // fully still: 0.25 s fade, 0.4 s slide
    const r = label(run.steps[range.to].rule.parts);
    const moves = [{ t: e0 * b, d: 0.4, what: 'the histogram leaves; the rule list rises', info: true }];
    contacts.forEach((c, k) => {
      const lb = label(run.steps[range.from + k].rule.parts);
      moves.push({ t: hi[k] * b, d: 0.2, what: `${lb}: occurrences light up`, info: true },
        { t: c * b - LAND_E * dur, d: dur + SETTLE, what: `${lb}: fuses`, info: true },
        { t: rules[k] * b, d: 0.4, what: `${lb}: rule line`, info: true });
    });
    return { ...range, n, pace, dur, contacts, rules, hi, fuse: contacts.map((c) => c * b - LAND_E * dur),
      lands: contacts.map((c) => c * b), moves,
      motion: lastRule + (carry ? HOLD * b : Math.max(HOLD * b, GLANCE)) + (morphOut ? MORPH : 0),
      exit: morphOut ? MORPH : 0, glance: [{ text: r, at: lastRule }] };
  },
  // camera pushes onto the bar at 0.1 beat; the bar's count grows into the enlarged line, landing on beat 1;
  // at the end the line shrinks back into the count while the camera returns (EXIT.big, accelerating). Before a
  // trace-flow the camera stays pushed: the flow carries the frame back.
  summary(sc, { b, flowOut }) {
    // entered by a sweep, the push runs under its falling bars and the line lands as they leave (beat 1, the window's
    // end); a beat later would be cleaner, but lengthens the summary to five beats and the median composition past 3 s
    const push = 0.1, big = 1;
    const moves = [
      { t: push * b, d: PUSH.dur, what: 'the camera pushes onto the token bar', info: true },
      { t: big * b - BIG.land, d: BIG.dur, what: 'the count grows into the result', info: true },
    ];
    return { push, big, bigStart: big * b - BIG.land, flowOut, lands: [push * b + PUSH.land, big * b], moves,
      motion: big * b + HOLD * b + EXIT.big, exit: EXIT.big, readFrom: big * b, glance: [] };
  },
  // the unseen row at 0 (as the summary's exit ends; after a transition, at its end), its chips 0.25 later, their
  // letters resolving left to right (scramble-resolve); the learned rules replay one per beat, each fuse landing on
  // beats 2, 3, …; the reveal (the push starts, expo-out, so its hit is on the beat; the second caption; the size
  // turns colour) is on the first beat ≥ 0.4 beat after the last replay ends; a beat later the rules it did not use
  // dim (one change at a time: the result first, then the context). The reveal is read in a pause (a claim): its
  // composition (a shot) holds until the hand-off. The scene's last MORPH seconds are the hand-off: the result's chips
  // fuse and grow into the thesis's first line, landing on the thesis's bar line; the camera returns over the morph's
  // first EXIT.camera seconds, while the chips slide together. With `reveal: 'flow'` a trace-flow straddles the reveal
  // beat (REVEAL), which then waits until the window's first beat is free of the scramble, the replays and caption 1.
  probe(sc, { run, b, cap, ready0, e0 }) {
    const n = run.probe?.steps.length ?? 0, cs = caps(sc);
    const dur = Math.min(0.45, PROBE_SP * b * 0.6);
    const rowIn = e0, chipsIn = e0 + 0.25;
    const nChips = run.probe?.tokens.length ?? 0;
    const scrambleEnd = chipsIn * b + SCRAMBLE.beats * b + Math.max(0, nChips - 1) * SCRAMBLE.stagger;
    // the first replay starts once the letters have resolved
    const first = Math.max(e0 + 2, q(scrambleEnd / b + (LAND_E * dur) / b));
    const contacts = Array.from({ length: n }, (_, i) => first + i * PROBE_SP);
    let reveal = n ? q(contacts[n - 1] + ((1 - LAND_E) * dur) / b + 0.4) : first;
    if (cs.length > 1) reveal = Math.max(reveal, q((ready0 + cap([cs[0]]) + CAP.gap + PUSH.land) / b));
    // a flow at the reveal (revealOf) starts a beat before it: the last replay has landed, the letters have resolved
    // and the first caption has been read before the front sets off
    const flow = revealOf(sc);
    const win = flow ? REVEAL[flow].beats / 2 : 0;
    if (flow) {
      reveal = Math.max(reveal, q(scrambleEnd / b + win), n ? contacts[n - 1] + win : 0);
      if (cs.length > 1) reveal = Math.max(reveal, q((ready0 + cap([cs[0]]) + CAP.gap) / b + win));
    }
    const out = MORPH;
    const size = run.probe ? `${run.probe.steps.at(-1)?.tokens.length ?? run.probe.tokens.length} x` : '';
    const moves = [
      { t: rowIn * b, d: 0.3, what: 'an unseen input appears', info: true },
      { t: chipsIn * b, d: scrambleEnd - chipsIn * b, what: 'its letters resolve', info: true },
      ...contacts.map((c, i) => ({ t: c * b - LAND_E * dur, d: dur + SETTLE, what: `rule ${(run.probe.steps[i].rule ?? 0) + 1} replays`, info: true })),
      { t: reveal * b, d: PUSH.dur, what: 'the reveal: the result in learned pieces', info: true },
      { t: (reveal + 1) * b, d: 0.35, what: 'the unused rules dim', info: true },
      ...(flow ? [{ t: (reveal - win) * b, d: 2 * win * b, what: `${REVEAL[flow].device} at the reveal`, info: false }] : []),
    ];
    return {
      rowIn, chipsIn, scrambleEnd, contacts, replay: contacts.map((c) => c - (LAND_E * dur) / b), dur, reveal, dim: reveal + 1, flow, win,
      pushAt: reveal, capAt: [null, reveal],
      lands: [...contacts.map((c) => c * b), reveal * b, (reveal + 1) * b + 0.35], moves,
      motion: (reveal + 1) * b + 0.35 + HOLD * b + out, exit: out,
      glance: size ? [{ text: size, at: reveal * b + 0.3 }] : [],
    };
  },
  // the first line is already in place (it grew out of the probe's chips, or fades in at the start when there
  // is no probe); later lines one per beat (0.5 s fade), the stats line's parts (split at ·) half a beat apart
  // from 0.75 beat after the last line; the card holds ≥ 2 s after its last part; the film fades out over its last 0.5 s
  thesis(sc, { b, morphed }) {
    const L = (sc.lines || []).length;
    const lines = (sc.lines || []).map((_, i) => (i === 0 ? (morphed ? 0 : 0.25) : i));
    const parts = statsParts(sc.stats);
    const stats = parts.map((_, k) => Math.max(0, L - 1) + 0.75 + k * 0.5);
    const ready = (x) => x * b + 0.5;
    const readyAt = lines.map((x, i) => (i === 0 && morphed ? 0 : ready(x)));
    const statsReady = stats.map(ready);
    const lastLand = Math.max(0, ...readyAt, ...statsReady);
    const moves = [
      ...lines.map((x, i) => ({ t: i === 0 && morphed ? 0 : x * b, d: i === 0 && morphed ? 0.4 : 0.7, what: `line ${i + 1}`, info: true })),
      ...stats.map((x, k) => ({ t: x * b, d: 0.5, what: `stats ${k + 1}`, info: true })),
    ];
    return { lines, stats, readyAt, statsReady, lands: [...readyAt, ...statsReady], moves,
      motion: lastLand + 2 + FADE, exit: FADE, glance: [] };
  },
};

// The stats line, split at its middle dots into parts that enter one after another (api 3: ≤ 5 words each).
export const statsParts = (s) => (s ? String(s).split(/\s*·\s*/).map((x) => x.trim()).filter(Boolean) : []);

// The thesis's first line grows out of chips already on screen (principle 4): the probe's result when a probe scene
// precedes the thesis, else (2026-10-19) the first chip the run's last step fused, when a step or loop precedes it
// (a film without a probe, such as a short insert). boardSource: that chip's row and index after the last step.
export const boardSource = (run) => {
  const last = run.steps[run.steps.length - 1];
  if (!last) return null;
  for (let r = 0; r < last.rows.length; r++) {
    const j = last.rows[r].map.findIndex((m) => m.length > 1);
    if (j >= 0) return { row: r, j };
  }
  return null;
};
export const morphFrom = (scenes, i, run) => {
  if (scenes[i]?.type !== 'thesis') return null;
  const p = scenes[i - 1]?.type;
  if (p === 'probe') return run.probe ? 'probe' : null;
  return (p === 'loop' || p === 'step') && boardSource(run) ? 'board' : null;
};
export const morphs = (scenes, i, run) => !!morphFrom(scenes, i, run);

// Everything a scene needs, shared by need(), events() and timeline.js.
export const sceneTiming = (s, b, run, scenes, i, wordSec = DEFAULTS.wordSec) => {
  const cap = (list) => list.reduce((n, c) => n + readTime(fill(lineOf(c), run.fills), { wordSec }), 0);
  const range = stepRanges(scenes, run.steps.length)[i];
  const t0 = capStart(scenes, i, b);
  // the incoming half of a transition: its captions wait for it (capStart); of the choreography only the summary's
  // line does (the rest may move under it: path-type covers only the caption band, a sweep or a flow uncovers it)
  const e0 = halfWin(scenes, i);
  // a step regrows the histogram (a recount) unless it comes straight after the count of its own step
  const fresh = s.type === 'step' ? !(scenes[i - 1]?.type === 'count' && range?.from === 0) : false;
  const ch = choreo[s.type](s, { run, b, range, cap, ready0: t0 + (e0 && enterOf(scenes, i) === 'path' ? 0 : CAP.rise), morphed: morphs(scenes, i, run),
    morphOut: morphFrom(scenes, i + 1, run) === 'board', fresh, e0: s.type === 'summary' ? e0 : 0, flowOut: enterOf(scenes, i + 1) === 'flow',
    carry: glanceCarries(scenes, i, run.steps.length) });
  // the first half of an expressive transition into the next scene overlaps this one's last beat: its captions are
  // read before it starts (the caption is carried or covered), its motion and glance text land before the cut
  ch.winOut = halfWin(scenes, i + 1) * b;
  // the summary's line shrinks back into the count before the transition out starts
  if (s.type === 'summary' && ch.winOut) { ch.exit += ch.winOut; ch.motion += ch.winOut; }
  const cp = captionPlan(caps(s), b, ch.capAt, run.fills, wordSec, t0, enterOf(scenes, i) === 'path', s.type === 'probe' && caps(s).length > 1);
  return { ch, cp, e0 };
};

// A scene's last glance text may finish its second of stillness in the next scene when that scene keeps it lit
// and in place (2026-10-18, brisk): the count's last histogram row into step 1 (the histogram stays, only the
// picked bar changes), a step's rule line into the next step, a loop's last rule line into the next loop (the rule
// list stays put). Not from a step into a loop (the rule list rises into the histogram's place) or into the summary
// (the list dims), nor across a sweep or a flow (they cover the frame).
export const glanceCarries = (scenes, i, nSteps) => {
  const s = scenes[i], n = scenes[i + 1];
  // path-type covers only the caption band, so the board and the rule list stay in place across it
  if (!n || (enterOf(scenes, i + 1) && enterOf(scenes, i + 1) !== 'path')) return false;
  const r = stepRanges(scenes, nSteps)[i + 1];
  if (s.type === 'count') return n.type === 'step' && r?.from === 0;
  if (s.type === 'step') return n.type === 'step';
  if (s.type === 'loop') return n.type === 'loop';
  return false;
};

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The same sections
// score.mjs builds: a scene's `music`, else MUSIC[type]. The probe drops on its reveal; any other drop scene after
// a scene of another kind drops on its first beat, or, when it starts inside a bar, on the next bar line inside it.
// A drop after a drop is no landing, nor is a drop that opens the film (nothing before it to drop from: a film that
// opens on its loop, such as a reel insert, 2026-10-19). Seconds from the scene start, or null.
const MUSIC = { hook: 'intro', count: 'intro', step: 'build', loop: 'drop', summary: 'break', probe: 'drop', thesis: 'outro' };
const musicOf = (sc) => sc.music ?? MUSIC[sc.type];
const dropAt = (scenes, i, g, reveal) => {
  const sc = scenes[i];
  if (musicOf(sc) !== 'drop') return null;
  if (sc.type === 'probe' && !sc.music && reveal != null) return reveal;
  if (i === 0 || musicOf(scenes[i - 1]) === 'drop') return null;
  const line = Math.ceil(sc.startBar - 1e-9);
  return i > 0 && line > sc.startBar && line < sc.startBar + sc.bars ? (line - sc.startBar) * g.bar : 0;
};

// Every move of a laid-out scene (s.start / s.end known), captions included: [{ t, d, what, info }], seconds from the
// scene start. Shared by events() (micro events and holds) and the README tables.
export const movesOf = (s, b, run, scenes, i) => {
  const { ch, cp, e0 } = sceneTiming(s, b, run, scenes, i);
  const dur = s.end - s.start;
  const moves = [...ch.moves];
  cp.list.forEach((c, j) => {
    c.phrases.forEach((p) => moves.push({ t: p.tin, d: p.ready - p.tin + 0.05, what: `caption: "${p.text}"`, info: true }));
    const isLast = j === cp.list.length - 1;
    const tout = !isLast ? cp.list[j + 1].tin - CAP.gap : dur - ch.exit - CAP.exit;
    // a caption leaves with a fade; one carried by the next scene's transition leaves with it
    if (!(isLast && ch.winOut)) moves.push({ t: tout - CAP.fade, d: CAP.fade, what: 'caption leaves', info: false });
  });
  // the expressive transitions on either side of the cut, and the scene's exit move
  if (e0) moves.push({ t: 0, d: e0 * b, what: `${ENTER[s.enter].device} lands`, info: false });
  if (ch.winOut) moves.push({ t: dur - ch.winOut, d: ch.winOut, what: 'the transition into the next scene', info: false });
  if (ch.exit) moves.push({ t: dur - ch.exit, d: ch.exit, what: 'exit', info: false });
  if (s.type === 'thesis') moves.push({ t: dur - b * 4 - 0.4 * (Math.log2(10) / 10), d: 0.75, what: 'the token bar lights again', info: true }); // the last downbeat (4 beats a bar)
  return { moves: moves.filter((m) => m.t < dur - 1e-6 && m.t + m.d > -1e-6).sort((x, y) => x.t - y.t), ch, cp, e0, dur };
};

// The still windows between moves: [{ from, to }] ≥ 0.2 s (shorter gaps are no hold), seconds from the scene start.
export const stillWindows = (moves, dur, min = 0.2) => {
  const iv = moves.map((m) => [Math.max(0, m.t), Math.min(dur, m.t + m.d)]).filter(([a, z]) => z > a - 1e-9).sort((x, y) => x[0] - y[0]);
  const out = [];
  let cur = 0;
  for (const [a, z] of iv) {
    if (a - cur >= min) out.push({ from: cur, to: a });
    cur = Math.max(cur, z);
  }
  if (dur - 1 / 30 - cur >= min) out.push({ from: cur, to: dur - 1 / 30 });
  return out;
};

export const rulesFor = (run) => {
  // reading items of a scene, with `at` from the first caption's ready time (cp.origin)
  const readItems = (s, ch, cp) => {
    const at0 = cp.origin;
    const out = [...cp.items];
    if (s.type === 'summary') out.push({ text: fill(s.big ?? BIG_DEFAULT, run.fills), tier: 'primary', at: Math.max(0, ch.readFrom + 0.3 - at0) });
    if (s.type === 'thesis') {
      (s.lines || []).forEach((l, k) => out.push({ text: fill(l, run.fills), tier: 'primary', at: ch.readyAt[k] - at0, ...(k === 0 ? { claim: true } : {}) }));
      statsParts(s.stats).forEach((p, k) => out.push({ text: fill(p, run.fills), tier: 'primary', at: ch.statsReady[k] - at0 }));
    }
    ch.glance.forEach((x) => out.push({ text: x.text, tier: 'glance', at: Math.max(0, x.at - at0) }));
    return out;
  };
  const need = (s, g, ctx) => {
    const { ch, cp } = sceneTiming(s, g.beat, run, ctx.scenes, ctx.i, ctx.wordSec);
    const res = ctx.reading(readItems(s, ch, cp));
    // primary text is read before the last caption starts leaving, which is CAP.exit + its fade before the exit, or
    // before the transition into the next scene starts
    const tail = s.type === 'thesis' ? FADE : Math.max(CAP.out * g.beat - CAP.exit + ch.exit, ch.winOut + 0.1);
    const primary = res.done > 0 ? cp.origin + res.done + tail : 0;
    // glance text is still for GLANCE seconds before the scene's exit begins, unless the next scene keeps it
    // still (glanceCarries); then it only has to have landed
    const carry = glanceCarries(ctx.scenes, ctx.i, run.steps.length);
    const glance = res.glanceDone > 0 ? cp.origin + res.glanceDone - (carry ? GLANCE : 0) + ch.exit : 0;
    return Math.max(ch.motion, primary, glance);
  };
  // key events, tiers, holds and hand-offs of one scene, in seconds from its start (lib/timing.js events())
  const events = (s, g, ctx) => {
    const scenes = ctx.scenes, i = ctx.i;
    const { moves, ch, dur } = movesOf(s, g.beat, run, scenes, i);
    const b = g.beat, keys = [], handoffs = [];
    if (s.type === 'step') keys.push({ t: ch.contact * b, kind: 'land' });
    if (s.type === 'loop') ch.contacts.forEach((c) => keys.push({ t: c * b, kind: 'land' }));
    if (s.type === 'summary') {
      keys.push({ t: ch.big * b, kind: 'accent' });
      handoffs.push({ t: ch.bigStart }, { t: dur });
    }
    if (s.type === 'probe') {
      ch.contacts.forEach((c) => keys.push({ t: c * b, kind: 'land' }));
      keys.push({ t: ch.reveal * b, kind: 'accent' });
    }
    const d = dropAt(scenes, i, g, s.type === 'probe' ? ch.reveal * b : null);
    if (d != null) {
      const k = keys.find((x) => Math.abs(x.t - d) < 1e-3);
      if (k) k.drop = true;
      else keys.push({ t: d, kind: 'accent', drop: true });
    }
    if (s.type === 'thesis') {
      if (morphs(scenes, i, run)) { keys.push({ t: 0, kind: 'claim' }); handoffs.push({ t: -MORPH }); }
      keys.push({ t: dur - g.bar, kind: 'end' }); // the closing move lands on the last downbeat
    }
    // T0: every move that brings something new; holds: the still windows between all moves. The probe's reveal is
    // read in a pause (a claim, ≤ 2 bars).
    const micro = moves.filter((m) => m.info && m.t >= -1e-6).map((m) => ({ t: m.t, what: m.what }));
    const holds = stillWindows(moves, dur).map((h) => (s.type === 'probe' && h.from >= ch.reveal * b - 1e-6 ? { ...h, pause: true } : h));
    // T1: the probe's reveal pushes in to a new composition
    const shots = s.type === 'probe' ? [{ t: ch.reveal * b, what: 'the reveal: the camera pushes in on the result' }] : [];
    // T2: the transition this scene enters with, starting a beat before the cut
    const e = enterOf(scenes, i);
    const expressive = e ? [{ t: -(ENTER[e].beats / 2) * b, beats: ENTER[e].beats, device: ENTER[e].device, variant: enterVariant(scenes, i) }] : [];
    // and the probe's turn into its reveal (REVEAL), a beat before the reveal beat
    if (s.type === 'probe' && ch.flow) expressive.push({ t: (ch.reveal - ch.win) * b, beats: REVEAL[ch.flow].beats, device: REVEAL[ch.flow].device, variant: REVEAL[ch.flow].variant });
    // T3: the hook's split, the probe's reveal (the climax), the claim the thesis lands (the lock-up)
    const peaks = [];
    if (s.type === 'hook') peaks.push({ t: ch.split * b, kind: 'hook' });
    if (s.type === 'probe') peaks.push({ t: ch.reveal * b, kind: 'reveal', climax: true });
    // without a probe (a short insert) the claim the chips grow into is the climax, and the closing move the lock-up
    if (s.type === 'thesis') {
      if (scenes.some((x) => x.type === 'probe')) peaks.push({ t: 0, kind: 'lockup' });
      else peaks.push({ t: 0, kind: 'claim', climax: true }, { t: dur - g.bar, kind: 'lockup' });
    }
    return { keys, holds, handoffs, micro, shots, expressive, peaks };
  };
  // in: beats until the first caption is still, at the slowest case (CAP.at + the rise at 104 bpm); need() overrides it
  const T = (o) => ({ in: 0.75, out: CAP.out, need, events, ...o });
  return {
    api: 3,
    // the accent is `active` (mode card, Accent role), for check-film's accent-area measure
    accent: (c) => PALETTES[c.palette]?.active,
    // 96 bpm, the tempo of the generated felt-piano track praised in the source film (a spoken decision of the
    // owner 2026-10-17, not an A/B), so that track can be the bed; the range keeps the calm felt-keys feel
    bpm: { default: 96, min: 88, max: 104 },
    // unit: one beat (cuts on any beat; turns on a bar line). The phrase rounding goes to the thesis only (a rest):
    // shared out, a beat would lengthen a still hold past api 3's 2 beats in most scenes. Since none of it can be
    // shared, the phrase is one bar, not the bed's two-bar motif: two bars left up to 7 beats of extra closing hold
    // (2026-10-19); the bed resolves on any bar line
    beatsPerBar: 4, unit: 0.25, phrase: 1, phraseShareBeats: 0,
    types: {
      // api 3: each composition ≤ 6 s (sceneMaxSec) by default; the probe holds two (its reveal is a shot)
      hook: T({}),
      count: T({}),
      step: T({}),
      loop: T({}),
      summary: T({}),
      probe: T({ max: 4.5 }),
      thesis: T({ in: 0.5, out: 0, turn: true, rest: true, absorb: true, reason: 'closing card: holds the claim, takes the phrase rounding, closes on the last downbeat' }),
    },
    // the content area check-film measures in: everything below the title row (the HUD is a persistent frame)
    events: () => ({ mask: [0, 150, 1920, 930] }),
  };
};

export default rulesFor(await loadRun(content));

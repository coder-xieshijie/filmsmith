// choreo.js — when everything happens inside each pulse scene, in seconds from the scene's start. One table for
// the picture (film.js), the sound (score.mjs), the timing (timing.rules.js: need, steps, key events) and the
// reading check, so a word, its sound and its reading window can never drift apart. Pure; Node and browser.
import { units } from './lib/timing.js';
import { fill, wordOf, outcome, isKnown, outOf, inOf, numberOf } from './registry.js';

// Choreography constants, in beats unless the name says seconds. Tags (mode card, Motion): s = standard,
// b = borrowed, d = derived, dr = draft.
export const C = {
  wordSec: 0.3, // reading, seconds per word (s: principle 1)
  glanceSec: 1.0, // a glance item fully still (s)
  firstOffset: 1, // the film's first word lands on beat 1; frame 0 is the ground and the query prompt typing (d)
  apLeadSec: 0, apSec: 0.2, // an aperture opens on the beat over 0.2 s (aperture-swap, cubic out): mostly open two frames later (d)
  typeSec: 0.012, // the query line types 12 ms a character (b: sample)
  riseSec: 0.22, // a line rises through its mask, expo out (b: sample)
  hopStart: 1, hop: 1, hopKnown: 0.5, // a search's first hop on beat 1; a new candidate holds a beat, a known one half (d)
  valueSec: 0.08, // a candidate's value starts rising 0.08 s after the hop lands (b: sample)
  scrambleHz: 24, // digits re-roll 24 times a second while they scramble (b: X15)
  dataStep: 1, scrambleSec: 0.35, countBeats: 1, labelAfter: 0.25, // data: one item a beat; resolve or count; label (d)
  whipSec: 0.15, // the whip push lands on the beat, starting 0.15 s before it (b: X19)
  sliceSec: 0.25, smearSec: 0.13, sliceLeadSec: 0.33, sliceDurSec: 0.5, // lib slice-smear over 0.5 s from 0.33 s before the beat: bands leave in 0.25 s, the next scene resolves from its smear in 0.13 s (b: X20)
  portal: 2, // beats: the push through the counter (eased in-out) passes its fastest frame on a beat and lands on the next scene's first beat (d)
  build: 1, // beats: the exposure build before the whiteout (b: X21)
  whiteSec: 2 / 30, shockSec: 0.45, fallSec: 0.3, // whiteout-slam: 2 white frames; blur and scale decay in 0.45 s (b: X21, the library's values); the ground falls from white in 0.3 s on an S-curve, so no single frame reads as a cut (d); no channel split (d: the mode's colours are its ramp and the amber)
  revealLine: 1, revealQuery: 2, // beats after the hit
  nameLine: 1, nameInstall: 2, installCps: 50, installHoldSec: 3, // the closing command holds ≥ 3 s once typed (s: principle 1)
};

// Seconds a transition starts before the next scene's first beat (the outgoing scene's content must be read by
// then), and how long after it the incoming scene's first text is fully in.
export const leadSec = (kind, B) => ({ aperture: C.apLeadSec, whip: C.whipSec, slice: C.sliceLeadSec, portal: C.portal * B, build: C.build * B }[kind] ?? 0);
export const tailSec = (kind) => ({ aperture: C.apLeadSec, slice: C.sliceDurSec - C.sliceLeadSec }[kind] ?? 0);

const ceilBeat = (x, B) => Math.ceil(x / B - 1e-9) * B;
const n = (text) => Math.max(1, units(text));

// ---------- context ----------
// Every plan gets x = { i, scenes, first, inKind, outKind, f } (f: the {facts} to fill copy with).
export const contextAt = (scenes, i, f) => ({ i, scenes, first: i === 0, inKind: inOf(scenes, i), outKind: outOf(scenes, i), f });

// ---------- ask: one word per beat at a fixed anchor ----------
// Each state lands on a beat and holds until it has been read (0.3 s a word) and the next aperture can start,
// so a one-word state takes one beat and a three-word state three at 120 bpm. Its query fragment types with it
// (the film's first fragment types from frame 0, before the hook word lands).
// shapes of lib/transitions aperture-swap: 'cut' alternates a band from the word's middle and bars closing from the
// top and bottom; 'round' opens every state in a circle from the word
export const APERTURES = { cut: ['band', 'close'], round: ['circle'] };
// the ramp walk: mid, black, light, deep — neighbours always differ by at least the r0 ↔ r2 step (3:1), never r1 ↔ r2
const CYCLE = ['r2', 'r0', 'r3', 'r1'];
export const askPlan = (s, B, x, form = 'cut', prevGround = null) => {
  const off = x.first ? C.firstOffset * B : 0;
  const ws = (s.words || []).map(wordOf).map((w) => ({ text: fill(w.text, x.f), param: w.param == null ? null : fill(w.param, x.f) }));
  const states = [];
  let t = off, cyc = 0, prev = prevGround;
  ws.forEach((w, k) => {
    const land = t;
    const words = n(w.text);
    // the state holds until it is read and the next aperture can start: one beat for a word at 120 bpm
    const beats = Math.max(1, Math.ceil((words * C.wordSec + C.apLeadSec) / B - 1e-9));
    // a state held three beats or more types its fragment a beat after the word, so no still hold passes two beats
    // (the last state's fragment types half a beat late, so its glance second splits the hold before the way out)
    const lastState = k === ws.length - 1;
    const paramAt = x.first && k === 0 ? 0 : beats >= 3 ? land + B : lastState && w.param ? land + B / 2 : land;
    const typed = w.param ? paramAt + w.param.length * C.typeSec : null;
    // ground: a question gets the inverted ground; the first state follows the way in; the rest walk the ramp
    let ground;
    if (/\?\s*$/.test(w.text)) ground = 'white';
    else if (k === 0 && x.first) ground = 'r0';
    else if (k === 0 && x.inKind === 'invert') ground = 'white';
    else {
      do { ground = CYCLE[cyc % CYCLE.length]; cyc++; } while (ground === prev || ((prev === 'white' || prev === 'r3') && ground === 'r3'));
    }
    const ap = k === 0 ? null : ground === 'white' ? 'invert' : APERTURES[form][(k - 1) % APERTURES[form].length];
    states.push({ k, land, beats, text: w.text, param: w.param, words, paramAt, typed, ground, ap, hook: x.first && k === 0 });
    prev = ground;
    t = land + beats * B;
  });
  const last = states.at(-1);
  const end = last ? Math.max(last.land + last.words * C.wordSec, last.typed != null ? last.typed + C.glanceSec : 0) : 0;
  const items = states.flatMap((st) => [
    { text: st.text, at: st.land },
    st.param && { text: st.param, tier: 'glance', at: st.typed },
  ]).filter(Boolean);
  return { states, end, items, ground: states.at(-1)?.ground ?? 'r0', grounds: states.map((st) => st.ground) };
};

// ---------- search: candidates, a highlight that hops, a lock ----------
export const searchPlan = (s, B, x, extraSec = 0) => {
  const cands = s.candidates || [];
  const o = outcome(s);
  const nextReveal = x.outKind === 'build';
  const known = cands.map((c) => isKnown(x.scenes, x.i, c));
  const hops = [];
  let t = (known[0] ? C.hopKnown : C.hopStart) * B;
  // time the fit adds before a reveal (the pad to its bar line, a phrase share) becomes extra laps of the highlight
  // on eighth notes over every cell, before the measured pass: anticipation, never a dead hold
  if (nextReveal && extraSec > 1e-6) {
    const laps = Math.floor(extraSec / (C.hopKnown * B) + 1e-6);
    for (let k = 0; k < laps; k++) { hops.push({ i: k % cands.length, t, known: true, lap: true }); t += C.hopKnown * B; }
  }
  const valueAt = cands.map(() => null);
  let scrambleFrom = null;
  cands.forEach((c, i) => {
    if (known[i]) { hops.push({ i, t, known: true }); t += C.hopKnown * B; return; }
    t = ceilBeat(t, B);
    hops.push({ i, t, known: false });
    if (i === o.best) scrambleFrom = t + C.valueSec; else valueAt[i] = t + C.valueSec;
    t += C.hop * B;
  });
  let slotHop = null;
  if (s.slot && o.best < 0) { t = ceilBeat(t, B); slotHop = t; hops.push({ i: cands.length, t, slot: true }); t += C.hop * B; }
  const lock = o.best >= 0 ? ceilBeat(t, B) : null;
  // the verdict: when no candidate passes, or the search does not lead into a reveal, the result lands at the
  // anchor on its own ground (a new composition: an aperture opens onto ramp[1]); a beat later the query line
  // appends the run's summary, a change that is not new primary text while the result is read
  const result = o.best < 0 ? ceilBeat(t, B) : nextReveal ? null : lock + B;
  const resolveAt = o.best >= 0 && !nextReveal ? lock : null; // the answer's digits lock left to right on the lock (into a reveal they scramble on)
  const summary = result != null ? summaryOf(s, o, x) : null;
  const summaryAt = result != null ? result + B : null;
  const summaryTyped = summary ? summaryAt + summary.length * C.typeSec : null;
  const items = [
    s.line && { text: fill(s.line, x.f), tier: 'glance', at: tailSec(x.inKind) },
    ...cands.map((c, i) => valueAt[i] != null && { text: fill(c.value, x.f), at: valueAt[i] + C.riseSec }),
    resolveAt != null && { text: fill(cands[o.best].value, x.f), at: resolveAt },
    result != null && { text: o.result, at: result + C.apLeadSec },
    summary && { text: summary, tier: 'glance', at: summaryTyped },
  ].filter(Boolean);
  return { hops, known, valueAt, scrambleFrom, resolveAt, lock, result, resultText: o.result, summary, summaryAt, summaryTyped, best: o.best, pass: o.pass, slot: !!s.slot, slotHop, nextReveal, items, endAt: Math.max(lock ?? 0, result ?? 0, summaryTyped != null ? summaryTyped + C.glanceSec : 0), ground: result != null ? 'r1' : 'r0' };
};
// The run's summary under the verdict: the best value against the limit, computed (e.g. 'best 1.9 s · limit 1 s').
const summaryOf = (s, o, x) => {
  const cands = s.candidates || [];
  const lower = (s.better ?? 'lower') === 'lower';
  let k = 0;
  cands.forEach((c, i) => { const a = numberOf(c.value), b = numberOf(cands[k].value); if (lower ? a < b : a > b) k = i; });
  const unit = String(cands[k]?.value ?? '').replace(/^[^a-zA-Z%×]*/, '').trim();
  return `best ${fill(cands[k]?.value, x.f)} · limit ${s.limit}${unit ? ' ' + unit : ''}`;
};

// ---------- data: one figure a beat ----------
export const dataPlan = (s, B, x) => {
  const instant = ['whip', 'portal', 'slice'].includes(x.inKind);
  // one figure a beat at most, and never faster than it is read: the next figure lands on the first beat after the
  // previous figure and its label have been read, less a beat (it may arrive while the label is finishing), so
  // no hold passes two beats and no figure waits unread
  const rows = [];
  let done = 0, prevLand = -Infinity;
  (s.items || []).forEach((it, k) => {
    const value = fill(it.value, x.f), label = it.label == null ? null : fill(it.label, x.f);
    const inst = k === 0 && instant;
    const land = k === 0 ? 0 : ceilBeat(Math.max(prevLand + C.dataStep * B, done - B), B);
    const settle = inst ? 0 : it.count ? C.countBeats * B : C.scrambleSec;
    // the label rises as the reader reaches it: once the figure has been read (never before a quarter beat)
    const valueRead = Math.max(done, land + settle) + n(value) * C.wordSec;
    const labelAt = inst ? 0 : Math.max(land + C.labelAfter * B, valueRead - C.riseSec);
    const labelIn = labelAt + (inst ? 0 : C.riseSec);
    done = valueRead;
    if (label) done = Math.max(done, labelIn) + n(label) * C.wordSec;
    rows.push({ k, land, value, label, count: !!it.count, resolved: land + settle, labelAt, labelIn, instant: inst });
    prevLand = land;
  });
  // the query line types on the first beat after the first figure's label is in: a change that is not new
  // primary text, and its glance second is spent while the figures are still being read
  const query = s.query == null ? null : fill(s.query, x.f);
  const queryAt = query ? ceilBeat((rows[0]?.labelIn ?? 0) + 1e-6, B) : null;
  const queryTyped = query ? queryAt + query.length * C.typeSec : null;
  const items = [
    ...rows.flatMap((r) => [{ text: r.value, at: r.resolved }, r.label && { text: r.label, at: r.labelIn }]),
    query && { text: query, tier: 'glance', at: queryTyped },
  ].filter(Boolean);
  return { rows, query, queryAt, queryTyped, items, ground: s.ground && /^r[0-2]$/.test(s.ground) ? s.ground : 'r2' };
};

// ---------- reveal: the exposure build ends, white for two frames, the answer slams ----------
export const revealPlan = (s, B, x) => {
  const value = fill(s.value, x.f), line = s.line == null ? null : fill(s.line, x.f), query = s.query == null ? null : fill(s.query, x.f);
  const lineAt = C.revealLine * B, queryAt = C.revealQuery * B;
  const typed = query ? queryAt + query.length * C.typeSec : null;
  const items = [
    { text: value, at: C.shockSec },
    line && { text: line, at: lineAt + C.riseSec, claim: true },
    query && { text: query, tier: 'glance', at: typed },
  ].filter(Boolean);
  return { value, line, query, lineAt, queryAt, typed, items, ground: 'r0' };
};

// ---------- name: the lock-up ----------
export const namePlan = (s, B, x) => {
  const nameIn = Math.max(tailSec(x.inKind), 0);
  const lineAt = C.nameLine * B, installAt = C.nameInstall * B;
  const install = s.install == null ? null : fill(s.install, x.f);
  const typed = install ? installAt + install.length / C.installCps : null;
  const items = [
    { text: `${fill(s.name, x.f)} ${s.version ? fill(s.version, x.f) : ''}`.trim(), at: nameIn },
    s.line && { text: fill(s.line, x.f), at: lineAt + C.riseSec },
    install && { text: install, at: typed },
  ].filter(Boolean);
  return { nameIn, lineAt, installAt, install, typed, items, hold: typed != null ? typed + C.installHoldSec : 0, ground: 'r1' };
};

export const PLANS = { ask: askPlan, search: searchPlan, data: dataPlan, reveal: revealPlan, name: namePlan };

// The plan of scene i with its neighbours (the ask's grounds follow the previous scene's last ground).
export const planAt = (scenes, i, B, f, form = 'cut', memo = [], extraSec = 0) => {
  const x = contextAt(scenes, i, f);
  const s = scenes[i];
  if (s.type === 'ask') {
    let prev = null;
    if (i > 0) prev = (memo[i - 1] ?? planAt(scenes, i - 1, B, f, form, memo)).ground;
    return (memo[i] = askPlan(s, B, x, form, prev));
  }
  const fn = PLANS[s.type];
  return (memo[i] = fn ? fn(s, B, x, extraSec) : { items: [], ground: 'r0' });
};

// Seconds the scene needs: its reading (through the shared reader) and choreography, plus the lead of the
// transition out. `reading` is lib/timing.js's ctx.reading.
export const needOf = (s, p, B, x, reading) => {
  const r = reading(p.items);
  let end = r.end;
  if (s.type === 'search') end = Math.max(end, p.endAt);
  if (s.type === 'ask') end = Math.max(end, p.end);
  if (s.type === 'name') end = Math.max(end, p.hold);
  if (s.type === 'data') end = Math.max(end, ...p.rows.map((row) => row.resolved));
  return end + leadSec(x.outKind, B);
};

// The still hold after each step lands, for fit()'s ceilings (api 3: ≤ 2 beats; the reveal's claim ≤ 2 bars, a pause).
export const stepsOf = (s, p, B, need, x) => {
  const lead = leadSec(x.outKind, B);
  const marks = (() => {
    switch (s.type) {
      case 'ask': return p.states.flatMap((st) => [st.land + (st.ap && st.ap !== 'invert' ? C.apLeadSec : 0), st.param && st.paramAt > st.land ? st.typed : null]);
      case 'search': return [0, ...p.hops.map((h) => h.t), p.lock, p.result != null ? p.result + C.apLeadSec : null, p.summaryTyped];
      case 'data': return [...p.rows.flatMap((r) => [r.land, r.resolved, r.labelIn]), p.queryTyped];
      case 'reveal': return [C.shockSec, p.lineAt + C.riseSec, p.typed];
      case 'name': return [p.nameIn, p.lineAt + C.riseSec, p.typed];
      default: return [0];
    }
  })().filter((v) => v != null).sort((a, b) => a - b).filter((v, k, a) => k === 0 || v - a[k - 1] > 1e-6);
  const stop = need - lead;
  // an ask's word is still only until the next aperture starts covering it, 0.12 s before the next state lands
  const cover = s.type === 'ask' ? p.states.slice(1).map((st) => st.land - (st.ap && st.ap !== 'invert' ? C.apLeadSec : 0)) : [];
  return marks.map((m, k) => {
    let next = k + 1 < marks.length ? marks[k + 1] : stop;
    for (const c of cover) if (c > m + 1e-6 && c < next) next = c;
    const still = Math.max(0, next - m);
    // the reveal's line is a claim, read in a pause (≤ 2 bars)
    if (s.type === 'reveal' && m >= p.lineAt + C.riseSec - 1e-6) return { still, pause: true };
    return still;
  });
};

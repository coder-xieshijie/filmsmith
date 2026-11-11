// timing.rules.js — how long each ink scene needs, measured from its choreography (format: lib/timing.js, api 3).
//
// Every value below is read off plan.js / film.js: the beat on which each word lands, the time a label takes to
// type, how long words take to leave, how early a scene clears the stage for the dot. lib/timing.js fit() turns
// these into whole beats per scene and rounds the film to a 2-bar phrase in the closing card. plan.js reads the
// same constants (C) and the same helpers, and its reading gate re-checks every window of the fitted film.
//
// api 3 (the four tiers of change, principles 4 and 5, owner-approved 2026-10-19): the top-level events() below
// returns the T0 changes (every word, label, landing, aperture, bounce of the resting dot), the still holds, the
// bloom's second composition (T1 shot), the T2 transitions with their library device ids and the T3 peaks, all
// read off plan.js, the same tables that place the picture and the sound.
//
// Reading goes through lib/timing.js's reader (ctx.reading), in three tiers:
//   word     slam words, the warp pair, the ruler pair: slammed one word a beat; once the line is complete it
//            holds 0.3 s × its words
//   primary  labels, names, step words, counter values, the closing URL or command: 0.3 s a word, read one
//            after another (a scene's primary text adds up; the label is read after the slammed line)
//   glance   only two items, both ≤ 6 words and safe to lose: the step counter "STEP n / N" in its final state
//            (it repeats the progress dots) and the licence line under the closing command (repeats nothing the
//            film needs; deleting it loses no meaning). Each must stay fully still ≥ 1 s
//   claim    the claim scene's lines, ≤ 8 words, primary with claim: true, read in a pause hold (≤ 2 bars)
// Labels type on the beat after their line is complete (api 3: one new piece of text per state, read in order).
// Windows inside a scene run in parallel where the picture runs them in parallel (a label types while the words
// land), so most types state `need` directly and read the reader's `end` from it.
import film from './content.js';
import { reader } from './lib/timing.js';
import { DOT_OUT, tokensOf, transitionOut, fill, FACTS_PROVISIONAL, readWords } from './registry.js';

// Choreography constants, in beats unless the name says seconds. plan.js and film.js import these.
export const C = {
  wordSec: 0.3, // reading standard, seconds per word (principle 1)
  cps: 90, urlCps: 120, // label typing speed, characters per second
  wordExitSec: 0.2, // words leave up through the mask, starting 0.2 s before their window ends
  labelEarlySec: 0.17, // slam and warp labels vanish 0.17 s before the words' window ends
  firstOffset: 1, // the film's first word lands on beat 1, not on frame 0
  labelAfter: 0.75, // a label starts typing three quarters of a beat after its line is complete (api 3: one new text per state), so it has typed by the next beat
  splitMerge: 0.85, hopGapSec: 0.15, // split stops merge back 0.85 beat after the last word; the dot rests 0.15 s
  leadToBloom: 0.8, leadDot: 1, // words clear 0.8 beat before a bloom, 1 beat before wipe / iris / flood / scan
  ownLeadHop: 0.9, // night scenes hand the dot on 0.9 beat before a hop (their words stay to the end)
  bounceEvery: 2, bounceSec: 0.3, bounceLeadSec: 0.3, // a resting dot bounces in place every 2 beats (up 0.3 s, landing on the beat), never in the last 0.3 s before it leaves
  warpWord2: 2, warpRamp: 3, // ink word on beat 2; the warp builds until beat 3; its label on beat 3
  swapApBeats: 0.44, // lib/transitions aperture-swap: the next ground opens from the dot on the beat in 0.44 beat (cubic out)
  burstRest: 1, burstBeats: 2, burstAt: 0.5 / 1.31, // collapse-burst after at least a beat of reading; 2 beats as a T2 (the library's 2.62 scaled); the dot bursts at 38 %
  bloom: 8, bloomShot: 4, // fixed (bloom.js): sink 0, surges 1 and 2.4, rim drops 4.2; from beat 4 the ink fills the frame (a new composition)
  nameLabel: 0.5, nameLabel2: 4.5, nameChoreo: 7, // width jumps on 2–6, playhead from 5 runs at least to 7
  scanBeats: 1, scanIn: 1, // lib/handoffs anchor-swap scan over the outgoing scene's last beat; the dot then hops to its new place in a beat
  rulerWord2: 1, rulerDrawSec: 0.5,
  counterRoll: 1, counterHopSec: 0.3, // digits roll for a beat; the stop hops 0.3 s before the next value
  slamBeats: 2, claimLandSec: 0.45, // lib/transitions whiteout-slam: build over the last beat before a claim, the hit on its bar line; the claim is still once the shock has decayed (0.45 s)
  portalClearSec: 0.3, // before the push the claim's other glyphs and its dot rise out (0.17 s each, 8 ms apart); the counter's glyph holds
  portalBeats: 1.5, portalLead: 1.8, // lib/handoffs counter-portal out of a claim: the push through the counter, landed at 94 %; it starts 1.8 beats before the end so the frame where the counter's strokes leave the frame (about 60 % in, which reads as a cut) falls on the claim's last beat
  ctaUrl: 0.25, ctaLine: 1, urlHoldSec: 3, // the URL or command types from beat 0.25 and holds ≥ 3 s once typed
  ctaLandGapSec: 0.15, // the dot lands on the cursor on the first beat at least 0.15 s after typing ends
  stepCounter: 'STEP 9 / 9', // the widest counter text, for the glance check
};

// ---------- context: lib/timing.js hands a rule only the scene, but ink timing depends on the neighbours ----------
// (the first scene's offset, the bloom lead-in, hop vs cut out of a night scene). plan.js binds its content by
// identity; lib/fit.mjs and check-film.mjs load their own copy of content.js, so scenes are also matched by value
// against this folder's content.js. Identical scenes merge to the longest need. api 2 and 3 also hand ctx.scenes,
// which is used first when present.
export const leadBeats = (out) => (out === 'tobloom' ? C.leadToBloom : DOT_OUT.includes(out) ? C.leadDot : out === 'whiteout' ? C.slamBeats / 2 : out === 'portal' ? C.portalLead : 0);
const ctxAt = (scenes, i) => ({ first: i === 0, out: transitionOut(scenes, i), inFrom: i > 0 ? transitionOut(scenes, i - 1) : null });
const bound = new WeakMap();
const byValue = new Map();
const key = (s) => JSON.stringify(s);
const learn = (scenes) => scenes.forEach((s, i) => {
  const c = ctxAt(scenes, i), p = byValue.get(key(s));
  byValue.set(key(s), !p ? c : { first: p.first || c.first, out: leadBeats(c.out) > leadBeats(p.out) ? c.out : p.out, inFrom: p.inFrom ?? c.inFrom });
});
learn(film.scenes);
export const bindContext = (content) => content.scenes.forEach((s, i) => bound.set(s, ctxAt(content.scenes, i)));
// Unknown scene (content not from this folder): assume the longest exit, never the first-scene offset.
export const contextOf = (s, ctx) => (ctx?.scenes && ctx.i != null ? ctxAt(ctx.scenes, ctx.i) : null) ?? bound.get(s) ?? byValue.get(key(s)) ?? { first: false, out: s.to ?? 'wipe', inFrom: null };

const text = (v) => fill(v, FACTS_PROVISIONAL);
const chars = (v) => (v == null ? 0 : [...text(v)].length);
const ceilTo = (x, u) => Math.ceil(x / u - 1e-9) * u;
const ceilBeat = (x, B) => Math.ceil(x / B - 1e-9) * B;
const line = (s) => tokensOf(s).map((tk) => text(tk.text)).join(' ');

// ---------- per-type reading, shared with plan.js ----------
// Each returns the reader items with `at` = seconds from the scene start at which that text is complete and
// still (typed, landed). The reader sums primary text in this order.
export const slamLabelAt = (s, B, first) => ((first ? C.firstOffset : 0) + tokensOf(s).length - 1 + C.labelAfter) * B;
export const slamItems = (s, B, first) => {
  const o = first ? C.firstOffset : 0, n = tokensOf(s).length;
  return [
    { text: line(s), tier: 'word', at: (o + n - 1) * B },
    s.label && { text: text(s.label), at: slamLabelAt(s, B, first) + chars(s.label) / C.cps },
  ].filter(Boolean);
};
// swap: one word a beat, each its own state on its own ground; the last one holds
export const swapItems = (s, B, first) => {
  const o = first ? C.firstOffset : 0;
  return (s.words || []).map((w, k) => ({ text: text(w), at: (o + k) * B }));
};
export const warpLabelAt = (B) => (C.warpWord2 + C.labelAfter) * B;
export const warpItems = (s, B) => [
  { text: `${text(s.word)} ${text(s.word2)}`, tier: 'word', at: C.warpWord2 * B },
  s.label && { text: text(s.label), at: warpLabelAt(B) + chars(s.label) / C.cps },
].filter(Boolean);
// burst: the word slams on the scene's first beat; after it has been read, collapse-burst turns it into `into`
export const burstTimes = (s, B, first) => {
  const o = first ? C.firstOffset : 0;
  const rest = Math.max(C.burstRest, Math.ceil((readWords(text(s.word)) * C.wordSec + 0.15) / B - 1e-9));
  const t0 = (o + rest) * B, t1 = t0 + C.burstBeats * B;
  return { land: o * B, t0, t1, burst: t0 + C.burstAt * C.burstBeats * B, labelAt: t1 + C.labelAfter * B };
};
export const burstItems = (s, B, first) => {
  const bt = burstTimes(s, B, first);
  return [
    { text: text(s.word), tier: 'word', at: bt.land },
    { text: text(s.into), at: bt.t1 },
    s.label && { text: text(s.label), at: bt.labelAt + chars(s.label) / C.cps },
  ].filter(Boolean);
};
export const rulerLabelAt = (B) => (C.rulerWord2 + C.labelAfter) * B;
export const rulerItems = (s, B) => [
  { text: (s.words || []).map(text).join(' '), tier: 'word', at: C.rulerWord2 * B },
  s.label && { text: text(s.label), at: rulerLabelAt(B) + chars(s.label) / C.cps },
].filter(Boolean);
export const stepsItems = (s, B) => {
  const st = s.steps || [];
  return [
    ...st.map((w, k) => ({ text: text(w), at: k * B })),
    // the counter in its final state, read at a glance (the dots say the same)
    { text: C.stepCounter, tier: 'glance', at: (st.length - 1) * B },
  ];
};
// the claim: all its lines land together on the whiteout's hit and are read in a pause once the shock is gone
export const claimText = (s) => (s.lines || []).map(text).join(' ');
export const claimItems = (s) => [{ text: claimText(s), at: C.claimLandSec, claim: true }];

// The second name label starts at beat 4.5, later (on a half beat) if the name and the first label need longer.
export const nameLabelStarts = (s, B, reading) => {
  const ls = s.labels || [];
  const first = C.nameLabel * B;
  if (ls.length < 2) return [first];
  const r = reading([{ text: text(s.name), at: 0 }, { text: text(ls[0]), at: first + chars(ls[0]) / C.cps }]);
  return [first, Math.max(C.nameLabel2 * B, ceilTo(r.done, B / 2))];
};
export const nameItems = (s, B, reading) => {
  const ls = s.labels || [], at = nameLabelStarts(s, B, reading);
  return [{ text: text(s.name), at: 0 }, ...ls.map((l, k) => ({ text: text(l), at: at[k] + chars(l) / C.cps }))];
};
// Counter values enter on bars: the next one on the first bar line after the previous value and its label have
// been read (value first, then the label, which types on the beat after the value lands), plus the stop's hop.
export const counterStarts = (s, g, reading) => {
  const B = g.beat, out = [];
  let t = 0;
  (s.items || []).forEach((it) => {
    const roll = /\d/.test(text(it.value));
    const landed = roll ? C.counterRoll * B : 0, labelAt = landed + C.labelAfter * B;
    const items = [{ text: text(it.value), at: landed }];
    if (it.label) items.push({ text: text(it.label), at: labelAt + chars(it.label) / C.cps });
    const need = reading(items).done;
    out.push({ t, need, items, landed, labelAt });
    t = Math.max(t + g.bar, ceilTo(t + need + C.counterHopSec, g.bar));
  });
  return out;
};
// The closing card: the URL or command types from beat 0.25; the dot lands on its cursor on the next beat after
// typing ends (plus a gap); the second move lands on the downbeat of the last bar (set by plan.js from the fitted
// length).
export const ctaTimes = (s, B) => {
  const urlAt = C.ctaUrl * B, typed = urlAt + chars(s.url) / C.urlCps;
  return { urlAt, typed, land: ceilBeat(typed + C.ctaLandGapSec, B) };
};
export const ctaItems = (s, B) => {
  const { typed } = ctaTimes(s, B);
  return [
    { text: text(s.name), at: 0 },
    { text: text(s.url), at: typed },
    s.line && { text: text(s.line), tier: 'glance', at: C.ctaLine * B + chars(s.line) / C.cps },
  ].filter(Boolean);
};

const exitLabel = C.wordExitSec + C.labelEarlySec; // a label must be read before it leaves, 0.37 s before the end
// Into a claim nothing leaves: the scene's words stay while the frame exposes to white over its last beat (they must
// have been read before the exposure starts, which leadBeats('whiteout') adds).
const exitOf = (out) => (out === 'whiteout' ? 0 : C.wordExitSec);
const exitLabelOf = (out) => (out === 'whiteout' ? 0 : exitLabel);
// read() lists what a scene reads, for the table and the glance-length check; the timing itself comes from need(),
// which places every item at its real moment through ctx.reading
const tiers = (list) => list.map(({ text: t, tier, claim }) => ({ text: t, tier, ...(claim ? { claim } : {}) }));
const plainReading = (list) => reader(list, { wordSec: C.wordSec });

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The first: the name's
// first bar, else the first steps, ruler or counter scene's, else half way through the film; null when no scene lies
// between it and the closing card. Then every claim's bar line (the second drop, on the whiteout's hit). score.mjs
// drops on the same bars. Every type's events() marks the key on that moment (a turn), or adds an accent key there.
export const dropBars = (scenes) => {
  const name = scenes.find((x) => x.type === 'name');
  const night = scenes.find((x) => ['steps', 'ruler', 'counter'].includes(x.type));
  const bar = name ? name.startBar : night ? night.startBar : Math.round(scenes.at(-1).startBar / 2);
  const cta = scenes.find((x) => x.type === 'cta');
  const end = cta && cta.startBar > bar ? cta.startBar : scenes.at(-1).startBar + scenes.at(-1).bars;
  const claims = scenes.filter((x) => x.type === 'claim').map((x) => x.startBar);
  return [...new Set([...(end > bar ? [bar] : []), ...claims])].sort((a, b) => a - b);
};
const withDrop = (events) => (s, g, ctx) => {
  const out = { ...(events ? events(s, g, ctx) : {}) };
  const sc = ctx.scenes[ctx.i], keys = [...(out.keys || [])];
  for (const bar of dropBars(ctx.scenes)) {
    if (bar < sc.startBar - 1e-9 || bar >= sc.startBar + sc.bars - 1e-9) continue;
    const t = (bar - sc.startBar) * g.bar;
    const k = keys.findIndex((x) => Math.abs(x.t - t) < 1e-3);
    if (k >= 0) keys[k] = { ...keys[k], drop: true };
    else keys.push({ t, kind: t < 1e-9 && sc.timing?.turn ? 'turn' : 'accent', what: 'the music drops', drop: true });
  }
  return { ...out, keys };
};

const rules = {
  api: 3,
  bpm: { default: 124, min: 120, max: 136 },
  beatsPerBar: 4, unit: 0.25, phrase: 2, wordSec: C.wordSec,
  // scenes are whole beats (principle 5: only the key beats are locked; whole bars made dead holds, changed
  // 2026-10-18); turns still start on a bar line. A scene takes at most one beat of the phrase rounding
  phraseShareBeats: 1,
  types: {
    // one word per beat; the label types on the beat after the line is complete and is read after it; words leave
    // 0.2 s before the scene ends (earlier before a dot transition)
    slam: {
      doc: { in: 'first word + 1 beat per word; label a beat after the line', out: '0.2 s exit (+0.8 beat before bloom, +1 before wipe/iris/flood/scan/whiteout)' },
      read: (s) => tiers(slamItems(s, 1, false)),
      need: (s, g, ctx) => {
        const B = g.beat, c = contextOf(s, ctx), o = c.first ? C.firstOffset : 0, lead = leadBeats(c.out) * B;
        const r = ctx.reading(slamItems(s, B, c.first));
        let n = Math.max(r.items[0].to + exitOf(c.out), s.label ? r.done + exitLabelOf(c.out) : 0);
        if (s.stops === 'each') n = Math.max(n, (o + tokensOf(s).length - 1 + C.splitMerge) * B + C.hopGapSec);
        return n + lead;
      },
      events: (s, g, ctx) => {
        const B = g.beat, o = contextOf(s, ctx).first ? C.firstOffset : 0;
        return { keys: tokensOf(s).map((tk, k) => ({ t: (o + k) * B, kind: 'land', what: 'slam' })) };
      },
    },
    // X18 aperture-swap: one word a beat on the same anchor, each on its own ground; the next ground opens from the dot
    swap: {
      doc: { in: 'word k on beat k (k + 1 in the first scene), each on its own ground', out: '0.2 s exit (+lead)' },
      read: (s) => tiers(swapItems(s, 1, false)),
      need: (s, g, ctx) => {
        const B = g.beat, c = contextOf(s, ctx);
        const r = ctx.reading(swapItems(s, B, c.first));
        return Math.max(r.end, (r.items.at(-1)?.from ?? 0) + C.hopGapSec) + exitOf(c.out) + leadBeats(c.out) * B;
      },
      events: (s, g, ctx) => {
        const B = g.beat, o = contextOf(s, ctx).first ? C.firstOffset : 0;
        return { keys: (s.words || []).map((w, k) => ({ t: (o + k) * B, kind: 'land', what: 'word on a new ground' })) };
      },
    },
    warp: {
      doc: { in: 'word on 0, word2 on 2, warp builds to 3, label on 3', out: '0.2 s exit (+lead)' }, read: (s) => tiers(warpItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, out = contextOf(s, ctx).out, lead = leadBeats(out) * B;
        const r = ctx.reading(warpItems(s, B));
        return Math.max(r.items[0].to + exitOf(out), s.label ? r.done + exitLabelOf(out) : 0, C.warpRamp * B + exitOf(out)) + lead;
      },
      events: (s, g) => ({ keys: [{ t: C.warpWord2 * g.beat, kind: 'land', what: 'slam' }] }),
    },
    // X11 collapse-burst: the word lands with its dot, is read, shrinks into the dot, which bursts into `into`
    burst: {
      doc: { in: 'word on 0; collapse-burst over 2 beats after it is read; label a beat after into', out: '0.2 s exit (+lead)' },
      read: (s) => tiers(burstItems(s, 1, false)),
      need: (s, g, ctx) => {
        const B = g.beat, c = contextOf(s, ctx), bt = burstTimes(s, B, c.first);
        const r = ctx.reading(burstItems(s, B, c.first));
        return Math.max(r.done + (s.label ? exitLabelOf(c.out) : exitOf(c.out)), bt.t1 + C.hopGapSec + exitOf(c.out)) + leadBeats(c.out) * B;
      },
      events: (s, g, ctx) => {
        const bt = burstTimes(s, g.beat, contextOf(s, ctx).first);
        return { keys: [{ t: bt.land, kind: 'land', what: 'word and dot' }, { t: bt.t1, kind: 'land', what: 'the burst condenses into the next word' }] };
      },
    },
    // fixed choreography of 8 beats; no text. A chapter turn: paper gives way to the accent field
    bloom: {
      in: C.bloom, out: 0, min: 2, max: 2, turn: true,
      // the hand-offs are pixel-continuous: the resting dot becomes the bloom, the flat field becomes the name's ground.
      // A bloom that opens the film has no dot hand-off: its frame 0 is the film's first frame
      events: (s, g, ctx) => ({ handoffs: [...(ctx?.i > 0 ? [{ t: 0, what: 'dot → bloom' }] : []), { t: s.end - s.start, what: 'field → name' }] }),
    },
    // the drop: 7 beats of rise, width jumps and playhead, then the dot transition
    name: {
      doc: { in: 'labels at 0.5 and 4.5; choreography to 7', out: '1 beat before wipe/iris/flood/scan' }, min: 2, max: 2, turn: true,
      read: (s) => [s.name, ...(s.labels || [])],
      need: (s, g, ctx) => {
        const B = g.beat, lead = DOT_OUT.includes(contextOf(s, ctx).out) ? C.leadDot * B : 0;
        const r = ctx.reading(nameItems(s, B, ctx.reading));
        return Math.max(C.nameChoreo * B, r.end) + lead;
      },
    },
    // one step per beat; the last one, and the counter's final state, hold until the dot leaves. Seven or eight
    // steps run past two bars, so the type declares its steps: each step holds one beat; after the last one the
    // dot bounces on the next beat (and every two beats after), so no hold is longer than two beats
    steps: {
      doc: { in: '1 beat per step (after a scan the dot arrives on beat 1)', out: '1 beat before wipe/iris/flood/scan, else 0' }, max: 3, turn: true,
      read: (s) => tiers(stepsItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, n = (s.steps || []).length;
        const r = ctx.reading(stepsItems(s, B));
        return Math.max((n - 1) * B + B, r.end) + leadBeats(contextOf(s, ctx).out) * B;
      },
      steps: (s, g) => {
        const B = g.beat, n = (s.steps || []).length;
        return Array.from({ length: n }, () => B);
      },
    },
    ruler: {
      doc: { in: 'words on 0 and 1, label on 2', out: 'as steps' }, read: (s) => tiers(rulerItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat;
        const r = ctx.reading(rulerItems(s, B));
        return Math.max(r.end, C.rulerDrawSec) + leadBeats(contextOf(s, ctx).out) * B;
      },
    },
    counter: {
      doc: { in: 'one value per bar line; digits roll 1 beat; label a beat after', out: 'as steps' },
      read: (s) => (s.items || []).flatMap((it) => [it.value, it.label]),
      need: (s, g, ctx) => {
        const st = counterStarts(s, g, ctx.reading), last = st.at(-1);
        if (st.length) ctx.reading(st.flatMap((x) => x.items.map((it) => ({ ...it, at: it.at + x.t }))));
        return last ? last.t + last.need + leadBeats(contextOf(s, ctx).out) * g.beat : g.bar;
      },
      events: (s, g) => ({ keys: counterStarts(s, g, plainReading).map((x) => ({ t: x.t, kind: 'land', what: 'value' })) }),
    },
    // X21 whiteout-slam into the claim on its bar line (the music's second drop); the claim is read in a pause;
    // X23 counter-portal out of it with to: 'portal'
    claim: {
      doc: { in: 'whiteout hit on 0 (bar line); still from 0.45 s; read in a pause', out: '1.5 beats of counter-portal, or a dot transition' }, turn: true,
      read: (s) => tiers(claimItems(s)),
      need: (s, g, ctx) => {
        const r = ctx.reading(claimItems(s));
        const out = contextOf(s, ctx).out;
        return Math.max(r.end, C.slamBeats / 2 * g.beat + C.hopGapSec) + (out === 'portal' ? C.portalClearSec : 0) + leadBeats(out) * g.beat;
      },
      // one step: the claim lands, then holds still while it is read (a pause, up to 2 bars)
      steps: (s, g, ctx) => { const out = contextOf(s, ctx).out; return [{ still: Math.max(0, s.need - C.claimLandSec - (out === 'portal' ? C.portalClearSec : 0) - leadBeats(out) * g.beat), pause: true }]; },
      events: (s) => ({ keys: [{ t: 0, kind: 'claim', what: 'the whiteout hits; the claim lands' }] }),
    },
    // the wordmark holds to the end; the URL or command holds ≥ 3 s after typing and the dot lands on its cursor;
    // takes the phrase rounding; a second move lands on the last downbeat
    cta: {
      doc: { in: 'URL at 0.25, dot on the cursor on the next beat, line at 1', out: 0 }, min: 2, rest: true, absorb: true,
      reason: 'closing card: the URL or command holds at least 3 s; the phrase rounding lands here',
      read: (s) => tiers(ctaItems(s, 1)),
      need: (s, g, ctx) => {
        const B = g.beat, { typed, land } = ctaTimes(s, B);
        const r = ctx.reading(ctaItems(s, B));
        return Math.max(r.end, typed + C.urlHoldSec, land + B);
      },
      events: (s, g) => {
        const { land } = ctaTimes(s, g.beat), dur = s.end - s.start;
        return { keys: [{ t: land, kind: 'land', what: 'dot on the cursor' }, { t: dur - g.bar, kind: 'end', what: 'second move on the last downbeat' }] };
      },
    },
  },
};
for (const r of Object.values(rules.types)) r.events = withDrop(r.events);

// The four tiers, read off plan.js (the same tables the picture and the sound use, so they cannot drift):
//   T0 micro       every word, label, value, step, aperture, width jump, ink drop, bounce of the resting dot
//   holds          the still windows after a landing; the claim's reading pause (pause: true)
//   T1 shots       the bloom's second composition (the ink fills the frame and the camera pushes in)
//   T2 expressive  collapse-burst, anchor-swap scan, whiteout-slam, counter-portal, and the dot's iris and flood
//                  (the mode's own drawing of the library's dot-iris) onto another ground
//   T3 peaks       the name (reveal), the claim (climax when it sits at 60–85 %), the closing card (lock-up); a
//                  film without a name or claim marks its opening as the hook
// plan.js imports these rules, so it is loaded when events() first runs (lib/fit.mjs awaits validate() first).
let planOf = null;
// When the plan cannot be built, fit or validate has already reported why: the tiers are skipped (lib/timing.js
// events() reads `skip`) rather than measured on no events at all.
rules.events = (scenes, g, content) => {
  if (!planOf) return { skip: 'plan.js is not loaded (lib/fit.mjs loads it through validate())' };
  let P;
  try { P = planOf(content); } catch (e) {
    const head = String(e?.message ?? e).split('\n')[0].replace(/:$/, '');
    return { skip: `plan.js could not build the film (${head.startsWith('timing') ? 'fit reports an error' : head.startsWith('content.js') || head.startsWith('reading time') ? `${head} errors` : head})` };
  }
  return P.tiers;
};

// The slot limits and scene order plan.js checks, run by `npm run fit` (lib/fit.mjs) so over-long copy fails there,
// not as a blank render. Imported lazily: plan.js imports these rules.
rules.validate = async (content) => {
  const { plan } = await import('./plan.js');
  planOf = plan;
  try { plan(content); return []; } catch (e) {
    const msg = String(e?.message ?? e);
    if (msg.startsWith('content.js') || msg.startsWith('reading time')) return msg.split('\n').slice(1).map((l) => l.trim());
    return msg.startsWith('timing (npm run fit)') ? [] : [`plan.js: ${msg}`]; // fit() reports its own errors
  }
};
// plan.js registers itself when it is imported first (the page, score.mjs)
export const registerPlan = (p) => { planOf = p; };

export default rules;

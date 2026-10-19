// timing.rules.js — how long each tally scene needs and what happens in it (format: lib/timing.js, api 3).
//
// The choreography lives in timeline.js schedule(): the beat each group lands, each counter settles, each phrase
// of text enters, the accent is revealed. lib/timing.js fit() turns the `need` below into whole beats per scene
// (unit: one beat) and gives the phrase rounding (one bar) to the closing scene.
//
// A scene needs the later of two things, plus the 0.15 beat of its exit that falls inside it:
//   1. reading (lib/timing.js ctx.reading(), principle 1), every item timed from the moment it is readable:
//      primary  each phrase of the title, then the line that proves it — the call-out, the counted number and its
//               caption, the key line of a list, each closing number with its label, the closing line — read in
//               sequence; a phrase is at most 5 words (timeline.js linePhrases), so a state never carries more
//      glance   the reference lines: sub, note, foot, the complement line, the split labels, a list's key note.
//               They qualify because each states the measure or repeats a number already on screen, so deleting
//               one leaves the chapter understood. Over 6 words a glance line is read as primary and fit() warns.
//      Chart labels (band, series, period and segment names) are read with the chart as it lands; see 2.
//   2. the last motion (timeline.js motionWindows) plus HOLD_MIN, so every landing reads as arrived.
// Nothing here holds still for long: plan() puts a glint into any still stretch over 1.75 beats (timeline.js
// glintsOf), and events() declares every still window as a hold, so fit() checks each against API 3's 2 beats on
// the fitted lengths.
//
// The closing scene is a rest (the lock-up): its accent squares light up on the downbeat of the film's last bar,
// at least HOLD_CLOSE after the numbers settle and a beat after the closing line enters, and the film fades out
// under the final chord once the line has been read. A chart scene that closes the film ends the same way.
//
// Band and period counts and the filled numbers come from the data, so the default export is a function
// content => rules (lib/timing.js fit() calls it with the film's content).
import { model, fmt } from './compute.js';
import { plain } from './fx.js';
import { schedule, swaps, entryOf, plan, timingEvents, motionWindows, EXIT, closeTier, listOf } from './timeline.js';

const READY = 0.2; // s: a 0.35 s cubic-out fade passes 90 % opacity after 0.19 s
const HOLD_MIN = 0.25; // s: the picture holds at least this long after its last landing, counter or reveal
const HOLD_CLOSE = 0.5; // s: the closing numbers (or a closing chart's reveal) hold before the closing light (brisk: was 1.5 s, api 2)
const SUB_DELAY = 0.25; // s: the sub enters 0.25 s after the title
const COUNT_SEC = 0.9; // s: a closing number counts up over 0.9 s
const FADE_OUT = 0.6; // s: the film fades to the edge colour over its last 0.6 s
const END_READ = 0.4; // s: the closing line is read this long before the fade starts

const models = new WeakMap(); // one model per data object
const modelOf = (content) => {
  if (!models.has(content.data)) models.set(content.data, model(content));
  return models.get(content.data);
};
const swapCache = new WeakMap(); // one swaps() per scene list
const swapOf = (scenes, m) => {
  if (!swapCache.has(scenes)) swapCache.set(scenes, swaps(scenes, m));
  return swapCache.get(scenes);
};

// The scene's reading items and timing, in seconds from its start, for `m` = model(content).
export const parts = (m, s, g, ctx) => {
  const i = ctx.i, scenes = ctx.scenes;
  const first = i === 0, last = i === scenes.length - 1;
  const fill = (x) => (x == null ? null : m.fill(String(x)));
  const flat = (x) => (x == null ? null : plain(m.fill(String(x))));
  const b = g.beat;
  const S = schedule(s, m, { first, swap: swapOf(scenes, m)[i], prev: scenes[i - 1] ?? null, last, beat: b, entry: entryOf(scenes, i), fill });
  const items = [];
  const primary = (at, text) => { if (text) items.push({ text, tier: 'primary', at: at + READY }); };
  const glance = (at, text) => { if (text) items.push({ text, tier: 'glance', at: at + READY }); };
  for (const ph of Object.values(S.lines)) for (const p of ph) primary(p.at * b, p.plain);
  glance(S.title * b + SUB_DELAY, flat(s.sub));
  switch (s.type) {
    case 'count':
      primary((S.counter[0] + S.counter[1]) * b, fmt(m.count((s.value || '{n}').replace(/[{}]/g, ''))));
      glance(S.note * b, flat(s.note));
      break;
    case 'axis':
      glance(S.foot * b, flat(s.foot));
      break;
    case 'split': {
      const nIn = s.by ? m.count(s.by) : 0;
      primary(S.reveal * b - 0.05, fmt(nIn)); // the counter lands; the caption's phrases follow
      if (s.other) glance(S.other * b, `${fmt(m.n - nIn)} ${flat(s.other)}`);
      glance(S.labels[0] * b, flat(s.labelIn));
      glance(S.labels[1] * b, flat(s.labelOut));
      break;
    }
    case 'share':
      if (s.accent) primary(S.reveal * b, 'x%'); // the accent percentage, enlarged: one word
      break;
    case 'list': {
      const L = listOf(s, m), u = L.units[L.key];
      if (u) primary(S.keyRead * b, `${u.id ?? ''} ${u.label ?? ''}`.trim());
      if (u?.note) glance(S.note * b, u.note);
      break;
    }
    case 'close':
      (s.numbers || []).forEach((x, k) => (closeTier(s, x) === 'primary' ? primary : glance)(S.nums[k] * b, `${fmt(m.count(x.value.replace(/[{}]/g, '')))} ${flat(x.label)}`));
      break;
  }
  // the reader takes primary items in the order they become readable
  items.sort((x, y) => x.at - y.at);
  const motion = motionWindows(s, S, b, { first });
  const moved = Math.max(0, ...motion.map(([, z]) => z));
  return { S, items, moved };
};

// fadeOut: the film's fade to the edge colour (0 with content.edges === 'cut': the film ends on its picture)
const needOf = (m, fadeOut) => (s, g, ctx) => {
  const p = parts(m, s, g, ctx);
  const r = ctx.reading(p.items);
  const settle = Math.max(p.moved, p.S.settle * g.beat);
  // a closing chart scene: the light after the reveal's hold and the reading; the film ends a bar later
  if (p.S.closing) return Math.max(Math.max(r.end, settle + HOLD_CLOSE) + g.bar, r.end + END_READ + fadeOut);
  if (s.type !== 'close') return Math.max(r.end, settle + HOLD_MIN) + EXIT * g.beat;
  // the light: after the numbers' hold and a beat after the line has entered; the film ends a bar later, and
  // not before the line has been read and END_READ has passed ahead of the fade
  const lineAt = p.S.lines.line?.[0]?.at;
  const light = Math.max(p.S.settle * g.beat + COUNT_SEC + HOLD_CLOSE, lineAt != null ? (lineAt + 1) * g.beat : 0);
  return Math.max(light + g.bar, r.end + END_READ + fadeOut);
};

// The content area that check-film measures for motion: below the chapter row (y 110) and above the progress
// rule (y 970); the persistent frame (chapter label, accent key, progress rule, source, legend) is outside it.
const MASK = [0, 110, 1920, 860];

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The same kinds
// score.mjs gives the bed: a chapter's `music`, else intro for the first chapter, else MUSIC[type].
const MUSIC = { count: 'intro', columns: 'build', share: 'build', timeline: 'build', trend: 'build', list: 'build', split: 'break', axis: 'drop', close: 'outro' };
export const musicOf = (c, i) => c.music ?? (i === 0 ? 'intro' : MUSIC[c.type]);
// The climax's reveal is a hit (score.mjs: an impact under the chime), the film's loudest moment: its key is a drop.
const markDrops = (scenes, keys) => {
  scenes.forEach((s, i) => {
    if (s.climax === true && s.type !== 'close') { const k = keys.find((x) => x.scene === i && x.kind === 'accent' && Math.abs(x.t - (s.T?.reveal ?? -1)) < 1e-3); if (k) k.drop = true; }
    if (musicOf(s, i) !== 'drop' || (i > 0 && musicOf(scenes[i - 1], i - 1) === 'drop')) return;
    const at = keys.filter((k) => Math.abs(k.t - s.start) < 1e-3).sort((a, b) => (a.kind === 'accent' ? 0 : 1) - (b.kind === 'accent' ? 0 : 1))[0];
    if (at) at.drop = true;
    else keys.push({ t: s.start, kind: 'accent', scene: i, drop: true });
  });
  return keys;
};

export default (content) => {
  const m = modelOf(content);
  const fadeOut = content.edges === 'cut' ? 0 : FADE_OUT;
  const need = needOf(m, fadeOut);
  // read() lists the text for the fit table; need() reads through ctx.reading() with the same items
  const read = (s, ctx) => parts(m, s, { beat: 60 / (content.bpm ?? 112), bar: 240 / (content.bpm ?? 112) }, ctx).items;
  // A regroup is two compositions: the title over the old layout, and the landed chart (events() declares the
  // landing as a shot); so a scene may run past 6 s while the T1 check holds each composition to 6 s (CONTRACT,
  // api 3: "a type that splits its scene into several compositions may raise it"). 5 bars: 10 s at 120 bpm.
  const chart = { need, read, max: 5 };
  return {
    api: 3,
    bpm: { default: 112, min: 104, max: 120 }, // data bed tempo (source film), ±7 %
    beatsPerBar: 4,
    // one beat: a scene ends on the first beat after its reading, so no rounding adds a still half bar (api 3
    // holds ≤ 2 beats). Regroups land on beats as before; they no longer wait for beat 1 or 3.
    unit: 0.25,
    // the phrase rounding (up to three beats) goes to the closing scene, a rest that ends with its light on the
    // last downbeat; shared out over the chart scenes it would lengthen their last hold
    phrase: 1,
    phraseShareBeats: 0,
    types: {
      count: { ...chart },
      columns: { ...chart },
      split: { ...chart },
      axis: { ...chart },
      share: { ...chart },
      timeline: { ...chart },
      trend: { ...chart },
      list: { ...chart },
      close: { ...chart, rest: true, absorb: true, reason: 'the lock-up: the closing numbers hold, the accent squares light up on the last downbeat' },
    },
    // Key events, holds, hand-offs and the four tiers for renders/timing.json, from the same plan the picture
    // draws; drop: true where the music drops.
    events: (scenes, g, c) => {
      const laid = plan(c, modelOf(c), { bpm: g.bpm, beatsPerBar: g.beatsPerBar, scenes: scenes.map((s) => ({ ...s })) }).chapters;
      const ev = timingEvents(laid, g, { fadeOut: c.edges === 'cut' ? 0 : FADE_OUT });
      return { ...ev, keys: markDrops(laid, ev.keys.map((k) => ({ ...k }))), mask: MASK };
    },
  };
};

// timing.test.mjs — lib/timing.js: api 2 rules keep their behaviour; api 3 rules get the four tiers
// (references/principles.md 4 and 5, owner-approved 2026-10-19) as errors where they follow from the content.
// Run: node --test assets/runtime/test/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fit, events, tiers, timingJson, readingStates, reader, deviceNotes, TIMING_API, DEFAULTS } from '../timing.js';

const errors = (notes) => notes.filter((n) => n.level === 'error');
const has = (notes, re, level = 'error') => notes.some((n) => n.level === level && re.test(n.msg));

// A small mode: a card reads its text; `bars` set by hand where a test wants a length.
const rulesOf = (api, extra = {}) => ({
  api, bpm: { default: 120 }, beatsPerBar: 4, unit: 0.25, phrase: 1,
  types: {
    card: { in: 1, out: 0.5, read: (s) => [s.text] },
    stack: { in: 1, out: 0.5, max: 4, read: (s) => s.lines.map((text, k) => ({ text, at: k * 0.5 })), steps: (s) => s.still ?? [] },
    claim: { in: 1, out: 0.5, read: (s) => [{ text: s.text, claim: true }] },
    end: { in: 1, read: (s) => [s.url], hold: 3, rest: true, absorb: true, reason: 'closing card' },
  },
  ...extra,
});

test('TIMING_API is 3 and timing.json records the rules api', () => {
  assert.equal(TIMING_API, 3);
  const t = fit({ scenes: [{ type: 'card', text: 'one two three' }, { type: 'end', url: 'x.dev' }] }, rulesOf(2));
  const j = timingJson(t);
  assert.equal(j.api, 3);
  assert.equal(j.rulesApi, 2);
  assert.deepEqual([j.micro, j.shots, j.expressive, j.peaks], [[], [], [], []]);
  assert.ok(j.tiers && j.tiers.t1.count === 2);
  assert.equal(j.limits.holdMaxBeats, 2);
});

test('api 2: twelve-word pages and one-bar steps still rule; tiers are one INFO note, never an error', () => {
  const content = { scenes: [
    { type: 'card', text: 'one two three four five six seven eight nine ten eleven twelve thirteen' },
    { type: 'stack', lines: ['a b c', 'd e f'], still: [1.5, 2.5] },
    { type: 'end', url: 'x.dev' },
  ] };
  const t = fit(content, rulesOf(2, { types: { ...rulesOf(2).types, card: { in: 1, out: 0.5, max: 4, steps: () => [], read: (s) => [s.text] } } }));
  assert.ok(has(t.notes, /words of primary text; a page carries at most 12/));
  assert.ok(!has(t.notes, /step 1 holds still/)); // 1.5 s = 0.75 bar ≤ 1
  assert.ok(!has(t.notes, /step 2 holds still/)); // 2.5 s = 1.25 bars ≤ 1.5 (last)
  const ev = events(t);
  assert.equal(errors(ev.notes).length, 0);
  const info = ev.notes.filter((n) => n.level === 'info');
  assert.equal(info.length, 1);
  assert.match(info[0].msg, /api 3 tiers not enforced at api 2/);
  assert.match(info[0].msg, /reading: 1 scene\(s\) with a state over 5 primary words/);
  assert.ok(!t.notes.some((n) => n.level === 'info')); // fit() notes stay as before (templates log them)
});

test('api 2: the shipped default ceiling (2 bars) is unchanged', () => {
  const t = fit({ scenes: [{ type: 'card', text: 'w '.repeat(12).trim() }] }, rulesOf(2));
  // 1.5 beats + 3.6 s = 4.35 s > 2 bars = 4 s
  assert.ok(has(t.notes, /needs 2\.\d+ bars to read but holds at most 2/));
});

test('readingStates groups primary items by the moment they become readable', () => {
  const r = reader([{ text: 'one two three', at: 0 }, { text: 'four five six', at: 0 }, { text: 'seven', at: 1 }, { text: 'label here', tier: 'glance' }, { text: 'slam slam slam slam slam slam', tier: 'word' }]);
  const st = readingStates(r);
  assert.deepEqual(st.map((x) => [x.words, x.cap]), [[6, 5], [1, 5]]);
  const c = readingStates(reader([{ text: 'a b c d e f g h', claim: true }]));
  assert.deepEqual(c.map((x) => [x.words, x.cap, x.claim]), [[8, 8, true]]);
});

test('api 3: more than five words entering together is an error; split into phrases it passes; a claim may carry eight', () => {
  const bad = fit({ scenes: [{ type: 'card', text: 'one two three four five six' }] }, rulesOf(3));
  assert.ok(has(bad.notes, /6 words of primary text enter together/));
  const ok = fit({ scenes: [{ type: 'stack', lines: ['one two three', 'four five six'], still: [0.5, 0.5] }] }, rulesOf(3));
  assert.ok(!has(ok.notes, /enter together/));
  const claim = fit({ scenes: [{ type: 'claim', text: 'one two three four five six seven eight' }] }, rulesOf(3));
  assert.ok(!has(claim.notes, /enter together/));
  const long = fit({ scenes: [{ type: 'claim', text: 'one two three four five six seven eight nine' }] }, rulesOf(3));
  assert.ok(has(long.notes, /9 words .* at most 8 \(a claim\)/));
  // api 3 drops the twelve-word page cap
  const page = fit({ scenes: [{ type: 'stack', lines: ['a b c d', 'e f g h', 'i j k l', 'm n'], still: [0.5, 0.5, 0.5, 0.5] }] }, rulesOf(3));
  assert.ok(!has(page.notes, /a page carries at most/));
});

test('api 3: a step holds still at most two beats, a pause step at most two bars', () => {
  const t = fit({ scenes: [{ type: 'stack', lines: ['a', 'b'], still: [1.2, 0.8] }] }, rulesOf(3));
  assert.ok(has(t.notes, /step 1 holds still 2\.40 beats; at most 2 beats/));
  const p = fit({ scenes: [{ type: 'stack', lines: ['a', 'b'], still: [{ still: 3.5, pause: true }, 0.8] }] }, rulesOf(3));
  assert.ok(!has(p.notes, /holds still/));
  assert.deepEqual(p.scenes[0].timing.pause, [true, false]);
  const pp = fit({ scenes: [{ type: 'stack', lines: ['a', 'b'], still: [{ still: 4.5, pause: true }] }] }, rulesOf(3));
  assert.ok(has(pp.notes, /at most 2 bars \(a pause\)/));
  // the same holds at api 2 are within its bar caps
  const v2 = fit({ scenes: [{ type: 'stack', lines: ['a', 'b'], still: [1.2, 0.8] }] }, rulesOf(2));
  assert.ok(!has(v2.notes, /holds still/));
});

test('api 3: a scene defaults to a 6 s ceiling at the fitted tempo', () => {
  const t = fit({ scenes: [{ type: 'card', text: 'a b c d e' }] }, rulesOf(3));
  assert.equal(t.scenes[0].timing.max, 3); // 6 s at 120 BPM = 3 bars
  const slow = fit({ bpm: 100, scenes: [{ type: 'card', text: 'a' }] }, { ...rulesOf(3), bpm: { default: 100 } });
  assert.equal(slow.scenes[0].timing.max, 2.5); // 2.4 s bars: 2.5 bars = 6 s
});

// ---- tiers() on plain data

const seg = (lens, extra = {}) => { // scenes from lengths
  let t = 0;
  return lens.map((len, i) => { const s = { i, type: 'x', start: t, end: t + len, rest: false, climax: false, ...(extra[i] || {}) }; t += len; return s; });
};
const everyBeat = (D, beat = 0.5) => Array.from({ length: Math.floor(D / beat) }, (_, k) => ({ t: k * beat }));
const good = () => {
  const lens = [1.5, 2, 2.5, 3, 2, 1.5, 1, 2.5, 3.5, 2, 1.5, 1, 1, 2, 4]; // 31 s, CV ≈ 0.4, runs up and down
  const scenes = seg(lens, { 14: { rest: true } });
  const D = scenes.at(-1).end;
  return {
    duration: D, beat: 0.5, bar: 2, scenes,
    keys: [], micro: everyBeat(D - 4), shots: [],
    holds: [{ from: 1.0, to: 1.5, scene: 0 }],
    expressive: [{ t: 4, dur: 1, device: 'ink-drop' }, { t: 14, dur: 1, device: 'dot-iris' }, { t: 23, dur: 1, device: 'ink-drop', variant: 'close' }],
    peaks: [{ t: 0, kind: 'hook' }, { t: 21.5, kind: 'claim', climax: true }, { t: 26.5, kind: 'lockup' }],
  };
};

test('tiers: a film that follows the four tiers has no errors', () => {
  const r = tiers(good(), DEFAULTS, 3);
  assert.deepEqual(errors(r.notes), []);
  assert.equal(r.summary.t1.count, 15);
  assert.ok(r.summary.t1.cv >= 0.3);
  assert.equal(r.summary.t3.climax.at, 0.69);
});

test('tiers T0: four beats without a change is the limit; rest scenes and pause holds do not count', () => {
  const d = good();
  d.micro = d.micro.filter((m) => m.t < 5 || m.t >= 8.5); // a 3.5 s gap from 4.5 to 8 (scene starts at 7 and 8 s still count)
  d.micro = d.micro.filter((m) => !(m.t > 4.5 && m.t < 9.5));
  d.scenes = seg([1.5, 2, 2.5, 6, 1.5, 1, 2.5, 3.5, 2, 1.5, 1, 1, 2, 4], { 13: { rest: true } });
  const r = tiers(d, DEFAULTS, 3);
  assert.ok(has(r.notes, /beats without a change/));
  d.holds.push({ from: 4.5, to: 9.5, pause: true, scene: 3 });
  const p = tiers(d, DEFAULTS, 3);
  assert.ok(!has(p.notes, /beats without a change/));
});

test('tiers T1: median, 6 s maximum, first 5 s, CV', () => {
  const d = good();
  d.scenes = seg([5.5, 5.5, 5.5, 5.5, 5, 4]); // median 5.5, CV small, 1 scene in the first 5 s
  const r = tiers(d, DEFAULTS, 3);
  assert.ok(has(r.notes, /median composition 5\.5 s; at most 3 s/));
  assert.ok(has(r.notes, /CV 0\.\d+, at least 0\.3/));
  assert.ok(has(r.notes, /1 composition\(s\) in the first 5 s/));
  d.scenes = seg([2, 1, 3, 7, 2, 1, 2, 4, 3, 2, 3.5]);
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /lasts 7 s; at most 6 s/));
  d.scenes = seg([2, 1, 3, 7, 2, 1, 2, 4, 3, 2, 3.5], { 3: { climax: true, reason: 'the reveal' } });
  assert.ok(!has(tiers(d, DEFAULTS, 3).notes, /at most 6 s/));
  d.scenes = seg([2, 1, 3, 4, 2, 1, 2, 4, 3, 2, 3.5]);
  d.shots = [{ t: 7.5 }]; // splits the 4 s scene at 6 s
  assert.equal(tiers(d, DEFAULTS, 3).summary.t1.count, 12);
});

test('tiers T2: count per length, device repeats, back to back unchanged, two beats long', () => {
  const d = good();
  d.expressive = [{ t: 4, dur: 1, device: 'ink-drop' }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /1 expressive transition\(s\) in 31 s; 2–4/));
  d.expressive = [4, 10, 16, 22].map((t) => ({ t, dur: 1, device: 'ink-drop', variant: t }));
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /device ink-drop used 4 times; at most 3/));
  d.expressive = [{ t: 4, dur: 1, device: 'ink-drop' }, { t: 14, dur: 1, device: 'ink-drop' }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /back to back unchanged/));
  d.expressive = [{ t: 4, dur: 1.5, device: 'ink-drop' }, { t: 14, dur: 1, device: 'dot-iris' }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /lasts 3 beats; at most 2/));
});

test('tiers T2 spacing: a gap over 12 s between two, or from the start or to the end, warns', () => {
  const warns = (d) => tiers(d, DEFAULTS, 3).notes.filter((n) => n.tier === 'T2' && n.level === 'warn' && /without an expressive transition/.test(n.msg));
  const d = good(); // 4, 14, 23 in 31 s: gaps 4, 10, 9, 8
  assert.deepEqual(warns(d), []);
  d.expressive = [{ t: 4, dur: 1, device: 'ink-drop' }, { t: 20, dur: 1, device: 'dot-iris' }, { t: 26, dur: 1, device: 'ink-drop', variant: 'close' }];
  const mid = warns(d);
  assert.equal(mid.length, 1);
  assert.match(mid[0].msg, /^16 s between ink-drop at 4\.00 s and dot-iris at 20\.00 s/);
  assert.equal(errors(tiers(d, DEFAULTS, 3).notes).length, 0); // spacing is shape, not an error
  d.expressive = [{ t: 13, dur: 1, device: 'ink-drop' }, { t: 18, dur: 1, device: 'dot-iris' }];
  const edges = warns(d).map((n) => n.msg);
  assert.ok(edges.some((m) => /^13 s between the start of the film and ink-drop at 13\.00 s/.test(m)));
  assert.ok(edges.some((m) => /^13 s between dot-iris at 18\.00 s and the end of the film/.test(m)));
  d.expressive = [];
  assert.deepEqual(warns(d), []); // no transitions at all: the count error says it
  assert.equal(tiers(d, DEFAULTS, 2).notes.length, 1); // below api 3 still one INFO note
});

test('fit: after the grid, steps() runs again with ctx.dur; a type that reads it is checked as returned; fillsSlack skips', () => {
  // one-bar grid at 120 BPM: a 1.05 s need becomes 2 s, 0.95 s of slack
  const rules = (steps, extra = {}) => ({ api: 3, bpm: { default: 120 }, beatsPerBar: 4, unit: 1, phrase: 1,
    types: { tail: { in: 1, out: 0.5, read: (s) => [s.text], steps, ...extra }, end: { in: 1, read: () => ['x.dev'], hold: 3, rest: true, absorb: true, reason: 'closing card' } } });
  const content = { scenes: [{ type: 'tail', text: 'one' }, { type: 'end' }] };
  const warn = (t) => t.notes.filter((n) => n.level === 'warn' && n.scene === 0 && /holds still/.test(n.msg));
  // does not read ctx.dur: the slack is counted on the last step (0.8 + 0.95 s = 3.5 beats)
  const plain = fit(content, rules(() => [0.8]));
  assert.equal(plain.scenes[0].bars, 1);
  assert.match(warn(plain)[0]?.msg ?? '', /the last step holds still 3\.50 beats once the grid are added; at most 2 beats/);
  // reads ctx.dur (undefined while sizing) and fills the slack with a tail move: no warning
  const seen = [];
  const filled = fit(content, rules((s, g, ctx) => { seen.push(ctx.dur); return ctx.dur == null ? [0.8] : [0.8, ctx.dur - 1.05] /* 1.9 beats */; }));
  assert.deepEqual(seen, [undefined, 2]);
  assert.deepEqual(warn(filled), []);
  // reads ctx.dur and really holds: warned at the fitted length, per step
  const held = fit(content, rules((s, g, ctx) => [0.8 + (ctx.dur == null ? 0 : ctx.dur - 1.05)]));
  assert.match(warn(held)[0]?.msg ?? '', /step 1 holds still 3\.50 beats at the scene's fitted length/);
  // fillsSlack: true: not checked here
  assert.deepEqual(warn(fit(content, rules(() => [0.8], { fillsSlack: true }))), []);
  // the first pass is unchanged: a step over two beats at the need is still an error
  assert.ok(has(fit(content, rules(() => [1.2], { fillsSlack: true })).notes, /step 1 holds still 2\.40 beats/));
});

test('deviceNotes: library ids and the rules\' own devices are known; anything else warns', () => {
  const ex = [{ device: 'ink-drop' }, { device: 'plakat-accent-wipe' }, { device: 'glitch-cut' }, { device: 'ink-drop' }];
  const known = new Set(['ink-drop', 'dot-iris']);
  const without = deviceNotes(ex, known, {});
  assert.deepEqual(without.map((n) => n.msg.match(/"([^"]+)"/)[1]), ['plakat-accent-wipe', 'glitch-cut']);
  assert.ok(without.every((n) => n.level === 'warn'));
  assert.deepEqual(deviceNotes(ex, known, { devices: ['plakat-accent-wipe', 'glitch-cut'] }), []);
  const bad = deviceNotes(ex, known, { devices: 'glitch-cut' });
  assert.ok(bad.some((n) => /rules\.devices must be an array/.test(n.msg)));
  assert.equal(bad.filter((n) => /is not an id/.test(n.msg)).length, 2);
});

test('tiers T3: two or three peaks, one climax at 60–85 %', () => {
  const d = good();
  d.peaks = [{ t: 0, kind: 'hook' }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /1 peak\(s\); 2–3/));
  d.peaks = [{ t: 0, kind: 'hook' }, { t: 10, kind: 'claim', climax: true }, { t: 26.5, kind: 'lockup' }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /climax at 10\.00 s is 32 % of the film; 60–85 %/));
  d.peaks = [{ t: 0, kind: 'hook', climax: true }, { t: 21.5, kind: 'claim', climax: true }];
  assert.ok(has(tiers(d, DEFAULTS, 3).notes, /2 peaks marked climax/));
});

test('tiers holds: at least 0.2 s, at most two beats, a pause at most two bars', () => {
  const d = good();
  d.holds = [{ from: 1, to: 1.1, scene: 0 }, { from: 2, to: 3.5, scene: 1 }, { from: 5, to: 8, scene: 3, pause: true }, { from: 9, to: 14, scene: 4, pause: true }];
  const r = tiers(d, DEFAULTS, 3);
  assert.ok(has(r.notes, /is 0\.1 s; a landing holds at least 0\.2 s/));
  assert.ok(has(r.notes, /is 3 beats; at most 2 beats/));
  assert.ok(!has(r.notes, /5\.00 s–8\.00 s/));
  assert.ok(has(r.notes, /is 10 beats; at most 2 bars \(pause\)/));
});

test('tiers below api 3: one INFO note with what would fail', () => {
  const d = good();
  d.peaks = [];
  const r = tiers(d, DEFAULTS, 2);
  assert.equal(r.notes.length, 1);
  assert.equal(r.notes[0].level, 'info');
  assert.match(r.notes[0].msg, /would be error\(s\) \(T3 1\)/);
});

test('events(): tier arrays from types are offset by the scene start; beats convert to dur', () => {
  const rules = rulesOf(3, {
    types: {
      ...rulesOf(3).types,
      card: { in: 1, out: 0.5, read: (s) => [s.text], events: (s, g) => ({ micro: [{ t: g.beat }], expressive: s.ex ? [{ t: 0, beats: 2, device: 'dot-iris' }] : [], peaks: s.peak ? [{ t: 0, kind: s.peak }] : [] }) },
    },
  });
  const t = fit({ scenes: [{ type: 'card', text: 'a b', peak: 'hook' }, { type: 'card', text: 'c d', ex: true }, { type: 'end', url: 'x.dev' }] }, rules);
  const ev = events(t);
  assert.equal(ev.micro[1].t, t.scenes[1].start + 0.5);
  assert.equal(ev.expressive[0].t, t.scenes[1].start);
  assert.equal(ev.expressive[0].dur, 1);
  assert.equal(ev.peaks[0].kind, 'hook');
  assert.ok(ev.notes.some((n) => n.tier === 'T3' && n.level === 'error')); // one peak only
  const j = timingJson(t, ev);
  assert.equal(j.rulesApi, 3);
  assert.equal(j.expressive.length, 1);
});

test('a throwing steps(), need() or events() is an error naming the scene; the tiers are skipped, not failed on missing data', () => {
  const boom = (what) => () => { throw new Error(`${what} went wrong`); };
  const base = rulesOf(3);
  const content = { scenes: [{ type: 'card', text: 'one two' }, { type: 'stack', lines: ['a b', 'c d'] }, { type: 'end', url: 'x.dev' }] };
  const falseTier = (notes) => notes.some((n) => n.tier && n.tier !== 'all' && n.level === 'error');

  // steps() throws: the first call (at the need) and the fitted-length call are both caught
  const t1 = fit(content, { ...base, types: { ...base.types, stack: { ...base.types.stack, steps: boom('steps') } } });
  const e1 = errors(t1.notes);
  assert.equal(e1.length, 1);
  assert.equal(e1[0].scene, 1);
  assert.match(e1[0].msg, /^stack: steps\(\) threw: steps went wrong$/);
  const ev1 = events(t1);
  assert.equal(ev1.tiers, null);
  assert.ok(!falseTier(ev1.notes), 'no T0–T3 errors computed on a scene that was never built');
  const skip = ev1.notes.find((n) => n.tier === 'all');
  assert.equal(skip.level, 'warn'); // the error above is the cause; the skip points at it
  assert.match(skip.msg, /tier checks \(T0–T3, holds\) skipped: scene 2 \(stack\): steps\(\) threw/);
  const j1 = timingJson(t1, ev1);
  assert.ok(!('tiers' in j1));
  assert.match(j1.tiersSkipped, /scene 2 \(stack\)/);

  // steps() that only throws at the fitted length (ctx.dur set)
  const late = { ...base.types.stack, steps: (s, g, ctx) => { if (ctx.dur != null) throw new Error('late'); return [0.5, 0.5]; } };
  const t2 = fit({ scenes: [{ type: 'stack', lines: ['a', 'b'] }, { type: 'card', text: 'x' }] }, { ...base, types: { ...base.types, stack: late } });
  assert.ok(t2.scenes[0].bars * t2.bar > t2.scenes[0].need + 1e-6); // the grid adds slack, so steps() is called again
  assert.ok(errors(t2.notes).some((n) => n.scene === 0 && /stack: steps\(\) at the fitted length threw: late/.test(n.msg)));
  assert.equal(events(t2).tiers, null);

  // need() throws
  const t3 = fit(content, { ...base, types: { ...base.types, card: { ...base.types.card, need: boom('need') } } });
  assert.ok(errors(t3.notes).some((n) => n.scene === 0 && /^card: need\(\) threw: need went wrong$/.test(n.msg)));
  assert.ok(!falseTier(events(t3).notes));

  // a type's events() throws: error with the scene and type; tiers skipped
  const t4 = fit(content, { ...base, types: { ...base.types, card: { ...base.types.card, events: boom('events') } } });
  assert.equal(errors(t4.notes).length, 0);
  const ev4 = events(t4);
  assert.ok(errors(ev4.notes).some((n) => n.scene === 0 && /^card: events\(\) threw: events went wrong$/.test(n.msg)));
  assert.equal(ev4.tiers, null);
  assert.ok(!falseTier(ev4.notes));

  // rules.events() returns { skip }: with nothing reported elsewhere the skip itself is an error
  const t5 = fit(content, { ...base, events: () => ({ skip: 'the plan could not be built' }) });
  const ev5 = events(t5);
  const s5 = ev5.notes.find((n) => n.tier === 'all');
  assert.equal(s5.level, 'error');
  assert.match(s5.msg, /skipped: rules\.events\(\): the plan could not be built/);
});

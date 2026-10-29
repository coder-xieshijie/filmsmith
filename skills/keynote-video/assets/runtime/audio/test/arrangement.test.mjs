// arrangement.test.mjs — D5 / D6 / D3 switches: reading drop, energy curve, layer rotation, fills,
// per-hit variation, and the v2 mix staying off unless asked for (score.mjs asks for it in every mode but blueprint).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { record } from './record.mjs';

const KIT = join(dirname(fileURLToPath(import.meta.url)), '..');
const within = (n, s, a, b) => n.t >= s.bar * a - 1e-6 && n.t < s.bar * b - 1e-6;

test('reading: true keeps kick, pad and sub but drops the melodic layer', async () => {
  const sections = [{ from: 0, to: 4, kind: 'drop' }, { from: 4, to: 8, kind: 'drop', reading: true }];
  const r = await record(KIT, 'terminal', { bpm: 128, bars: 8, sections });
  const count = (name, a, b) => r.notes.filter((n) => n.name === name && within(n, r, a, b)).length;
  assert.ok(count('synth', 0, 4) > 40);
  assert.equal(count('synth', 4, 8), 0);
  for (const name of ['kick', 'sub', 'pad']) assert.ok(count(name, 4, 8) > 0, `${name} kept`);
  for (const [preset, bpm, layer] of [['swiss', 120, (n) => n.name === 'marimba' && n.opts.dur === 1.2], ['blueprint', 100, (n) => n.name === 'synth' && n.pan !== 0.6], ['data', 112, (n) => n.name === 'pluck' && n.opts.dur === 0.6], ['thread', 120, (n) => n.name === 'pluck'], ['inkbeat', 128, (n) => n.name === 'synth'], ['diagram', 96, (n) => n.name === 'keys' && n.opts.freqs.length === 1]]) {
    const q = await record(KIT, preset, { bpm, bars: 8, sections });
    assert.ok(q.notes.filter((n) => layer(n) && within(n, q, 0, 4)).length > 0, `${preset} melodic layer plays`);
    assert.equal(q.notes.filter((n) => layer(n) && within(n, q, 4, 8)).length, 0, `${preset} melodic layer drops while reading`);
  }
});

test("reading: 'duck' keeps every layer and sets the music buses 3 dB lower", async () => {
  const r = await record(KIT, 'terminal', { bpm: 128, bars: 8, energy: 0.6, sections: [{ from: 0, to: 4, kind: 'drop' }, { from: 4, to: 8, kind: 'drop', reading: 'duck' }] });
  assert.ok(r.notes.filter((n) => n.name === 'synth' && within(n, r, 4, 8)).length > 40);
  assert.deepEqual(r.s.levels.map((x) => [+(x.from / r.bar).toFixed(3), +(x.to / r.bar).toFixed(3), x.gain, x.bus]), [[4, 8, -3, 'music']]);
});

test('energy: a curve (function of the bar) becomes bed level, (e − 0.6) × 2.5 dB per bar', async () => {
  const r = await record(KIT, 'data', { bpm: 112, bars: 4, energy: (bar) => [0.2, 0.6, 1, 1][Math.floor(bar)], sections: [{ from: 0, to: 4, kind: 'drop' }] });
  assert.deepEqual(r.s.levels.map((x) => [Math.round(x.from / r.bar), Math.round(x.to / r.bar), x.gain]), [[0, 1, -1], [2, 4, 1]]);
  const s2 = await record(KIT, 'data', { bpm: 112, bars: 4, energy: 0.2, sections: [{ from: 0, to: 2, kind: 'drop' }, { from: 2, to: 4, kind: 'drop', energy: 1 }] });
  assert.deepEqual(s2.s.levels.map((x) => x.gain), [-1, 1]);
});

test('drops rotate a layer every 4 bars: the terminal pulse alternates figures A and B', async () => {
  const r = await record(KIT, 'terminal', { bpm: 128, bars: 8, sections: [{ from: 0, to: 8, kind: 'drop' }] });
  const pulse = r.notes.filter((n) => n.name === 'synth').map((n) => Math.round(12 * Math.log2(n.opts.freq / 440)));
  const bar = (k) => pulse.slice(k * 16, k * 16 + 8);
  const rel = (k) => bar(k).map((m) => m - bar(k)[0]);
  assert.deepEqual(rel(0), [0, 0, 12, 0, 7, 0, 12, 10]);
  assert.deepEqual(rel(4), [0, 12, 7, 12, 0, 7, 10, 12]);
  assert.equal(r.A.info(3.5).group, 'A');
  assert.equal(r.A.info(4.5).group, 'B');
  const r8 = await record(KIT, 'terminal', { bpm: 128, bars: 8, rotate: 8, sections: [{ from: 0, to: 8, kind: 'drop' }] });
  assert.equal(r8.A.info(4.5).group, 'A');
});

test('fills: the last two beats of every 8th drop bar and of a drop block before another kind', async () => {
  const r = await record(KIT, 'terminal', { bpm: 128, bars: 18, sections: [{ from: 0, to: 12, kind: 'drop' }, { from: 12, to: 14, kind: 'break' }, { from: 14, to: 18, kind: 'drop' }] });
  const fills = [];
  for (let q = 0; q < 18 * 16; q++) if (r.A.info(q / 16).fill) fills.push(q / 16);
  const starts = fills.filter((b, i) => i === 0 || b - fills[i - 1] > 0.07);
  assert.deepEqual(starts, [7.5, 11.5]); // bar 8 of the block, and the end of the block before the break
  const kicks = r.notes.filter((n) => n.name === 'kick').map((n) => +(n.t / r.beat).toFixed(3));
  assert.ok(!kicks.includes(7 * 4 + 3), 'the last kick of a fill bar is dropped');
  assert.ok(kicks.includes(6 * 4 + 3));
});

test('vary: repeated hits rotate four samples and follow the metric level; vary: false turns it off', async () => {
  const sections = [{ from: 0, to: 4, kind: 'drop' }];
  const on = await record(KIT, 'terminal', { bpm: 128, bars: 4, sections });
  const kicks = on.notes.filter((n) => n.name === 'kick');
  assert.deepEqual(kicks.slice(0, 4).map((n) => n.opts.seed), [0, 1009, 2018, 3027]);
  assert.equal(kicks[0].opts.click, 0.165); // downbeat: +10 % brightness
  assert.equal(kicks[1].opts.click, 0.15); // beat 2: unchanged
  const off = await record(KIT, 'terminal', { bpm: 128, bars: 4, sections, vary: false });
  assert.ok(off.notes.filter((n) => n.name === 'kick').every((n) => n.opts.seed === undefined && n.opts.click === 0.15));
});

test("mix 'v2' is off by default; on, it sets the reverb filters, the shelf (not for blueprint) and a triangle arpeggio", async () => {
  const d = await record(KIT, 'terminal', { bpm: 128, bars: 4 });
  assert.deepEqual(d.s.eqs, []);
  assert.equal(d.s.reverbOpts.lowcut, undefined);
  assert.ok(d.notes.filter((n) => n.name === 'pad').every((n) => !n.opts.hp && !n.opts.dip && n.opts.air === 0));
  const v = await record(KIT, 'terminal', { bpm: 128, bars: 4, mix: 'v2' });
  assert.equal(v.s.eqs.length, 1);
  assert.equal(v.s.reverbOpts.lowcut, 400);
  assert.ok(v.notes.filter((n) => n.name === 'pad').every((n) => n.opts.hp === 150 && n.opts.air === 0.35));
  const b = await record(KIT, 'blueprint', { bpm: 100, bars: 8, sections: [{ from: 0, to: 8, kind: 'drop' }] });
  assert.ok(b.notes.filter((n) => n.name === 'synth').every((n) => n.opts.wave === 'square'));
  const bv = await record(KIT, 'blueprint', { bpm: 100, bars: 8, mix: 'v2', sections: [{ from: 0, to: 8, kind: 'drop' }] });
  assert.equal(bv.s.eqs.length, 0);
  assert.ok(bv.notes.filter((n) => n.name === 'synth').every((n) => n.opts.wave === 'tri'));
});

test('energy lifts the climax: gain terms follow the energy curve', async () => {
  const sections = [{ from: 0, to: 2, kind: 'drop', energy: 0.4 }, { from: 2, to: 4, kind: 'drop', energy: 0.9 }];
  const on = await record(KIT, 'terminal', { bpm: 128, bars: 4, sections });
  assert.deepEqual(on.s.levels.map((x) => x.gain), [-0.5, 0.75]);
  const padGain = (r, bar) => r.notes.find((n) => n.name === 'pad' && Math.abs(n.t - bar * r.bar) < 1e-6).gain;
  assert.ok(padGain(on, 2) > padGain(on, 0));
});

test("the pulse plays the maj7 chords' own seventh; elsewhere the minor seventh is the chord's", async () => {
  const sections = [{ from: 0, to: 8, kind: 'drop' }];
  const rel = (r) => {
    const out = new Map();
    for (const n of r.notes.filter((x) => x.name === 'synth')) {
      const bar = Math.floor(n.t / r.bar + 1e-6), sub = r.notes.find((x) => x.name === 'sub' && Math.abs(x.t - bar * r.bar) < 1e-6);
      const iv = (((Math.round(12 * Math.log2(n.opts.freq / sub.opts.freq)) % 12) + 12) % 12);
      if (!out.has(bar)) out.set(bar, new Set());
      out.get(bar).add(iv);
    }
    return out;
  };
  const c = rel(await record(KIT, 'terminal', { bpm: 128, bars: 8, sections }));
  // bars 1, 2, 5 are Fmaj7, Cmaj7, Fmaj7: 11, never the 10 a semitone under the chord's seventh.
  for (const b of [1, 2, 5]) assert.ok(c.get(b).has(11) && !c.get(b).has(10));
  // bars 0, 3, 4, 6, 7 (Am9, Em7, Am9, Dm9, E7sus4): the minor seventh is the chord's own.
  for (const b of [0, 3, 4, 6, 7]) assert.ok(c.get(b).has(10) && !c.get(b).has(11));
});

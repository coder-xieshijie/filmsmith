// templates.test.mjs — the hold kind in every preset, and the three template beds (query, glass, press): chord tones in
// the bar's chord, the reading drop, the key. Their sample-for-sample match with the templates' own beds is checked by
// rendering, outside these tests (the template's bed code against the preset with the scenes' sections).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { record, pc, padSpans, padAt } from './record.mjs';

const KIT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRESETS = ['terminal', 'swiss', 'blueprint', 'inkbeat', 'thread', 'data', 'diagram', 'query', 'glass', 'press'];
const between = (r, a, b) => (n) => n.t >= r.bar * a - 1e-6 && n.t < r.bar * b - 1e-6;

test('hold: one level for the section, its break layers, nothing out of it', async () => {
  for (const preset of PRESETS) {
    const energy = (bar) => 0.2 + 0.08 * bar;
    const sections = [{ from: 0, to: 4, kind: 'build' }, { from: 4, to: 8, kind: 'hold' }, { from: 8, to: 12, kind: 'drop' }];
    const r = await record(KIT, preset, { bpm: 120, bars: 12, energy, sections });
    assert.equal(r.A.energyAt(7.9), r.A.energyAt(4), `${preset}: the hold keeps its starting energy`);
    const inHold = r.s.levels.filter((x) => x.from >= 4 * r.bar - 1e-6 && x.to <= 8 * r.bar + 1e-6);
    if (preset !== 'glass') assert.deepEqual(inHold.map((x) => (x.to - x.from) / r.bar), [4], `${preset}: one level over the hold`);
    const held = r.notes.filter(between(r, 4, 8));
    assert.ok(held.some((n) => n.name === 'pad'), `${preset}: the pad plays`);
    for (const n of held) assert.ok(!['swell', 'riser'].includes(n.name), `${preset}: no ${n.name} out of the hold`);
    const b = await record(KIT, preset, { bpm: 120, bars: 12, energy, sections: sections.map((x) => (x.kind === 'hold' ? { ...x, kind: 'break' } : x)) });
    const names = (q) => [...new Set(q.notes.filter(between(q, 4, 8)).map((n) => n.name))].sort();
    for (const x of names(r)) assert.ok(names(b).includes(x), `${preset}: ${x} is one of the break's layers`);
    const all = await record(KIT, preset, { bpm: 120, bars: 8, sections: [{ from: 0, to: 8, kind: 'hold' }] });
    const layers = [...new Set(all.notes.map((n) => n.name))].sort();
    assert.deepEqual(layers, preset === 'press' ? ['kick', 'pad', 'rim', 'tick'] : ['pad'], `${preset}: a film-long hold`);
  }
});

const CHORD_TONES = {
  query: (n) => (n.name === 'synth' && n.bus === 'pump') || n.name === 'sub' || n.name === 'bass',
  glass: (n) => (n.name === 'pluck' && n.opts.dur === 0.5) || n.name === 'bass' || n.name === 'sub',
  press: (n) => n.name === 'pluck', // its bass is the template's note(Hz) pitch, not a chord tone (see beds.mjs press)
};
const shape = [{ from: 0, to: 2, kind: 'intro' }, { from: 2, to: 5, kind: 'build' }, { from: 5, to: 9, kind: 'drop' }, { from: 9, to: 11, kind: 'break' }, { from: 11, to: 14, kind: 'drop' }, { from: 14, to: 16, kind: 'outro' }];
for (const preset of Object.keys(CHORD_TONES)) {
  test(`${preset}: every chord tone sits in the pad's chord`, async () => {
    const r = await record(KIT, preset, { bpm: 120, bars: 16, sections: shape, key: 'F' });
    const spans = padSpans(r.notes).filter((x) => x.from < 14 * r.bar - 1e-6);
    const tones = r.notes.filter(CHORD_TONES[preset]).filter(between(r, 0, 14));
    assert.ok(tones.length > 20);
    const bad = tones.filter((n) => { const p = padAt(spans, n.t); return p && !p.pcs.has(pc(n.opts.freq ?? n.opts.freqs[0])); });
    assert.deepEqual(bad.map((n) => `${n.name} @${n.t.toFixed(2)}`), []);
  });
}

test('query, glass, press: reading drops the melodic layer; the key transposes', async () => {
  const layer = { query: (n) => n.name === 'synth', glass: (n) => n.name === 'pluck', press: (n) => n.name === 'pluck' };
  const sections = [{ from: 0, to: 4, kind: 'drop' }, { from: 4, to: 8, kind: 'drop', reading: true }];
  for (const preset of Object.keys(layer)) {
    const r = await record(KIT, preset, { bpm: 120, bars: 8, sections });
    assert.ok(r.notes.filter((n) => layer[preset](n) && between(r, 0, 4)(n)).length > 10, `${preset} plays its melodic layer`);
    assert.equal(r.notes.filter((n) => layer[preset](n) && between(r, 4, 8)(n)).length, 0, `${preset} rests it while reading`);
    assert.ok(r.notes.some((n) => n.name === 'kick' && between(r, 4, 8)(n)), `${preset} keeps the kick`);
    const home = { query: 'D', glass: 'E', press: 'D' }[preset];
    const up = await record(KIT, preset, { bpm: 120, bars: 8, sections, key: home === 'D' ? 'E' : 'F#' });
    const pcs = (q) => q.notes.find((n) => n.name === 'pad').opts.freqs.map(pc).sort((x, y) => x - y);
    assert.deepEqual(pcs(up), pcs(r).map((p) => (p + 2) % 12).sort((x, y) => x - y), `${preset} up a tone`);
  }
});

test('query, glass, press: the default arrangement covers the film', async () => {
  for (const preset of ['query', 'glass', 'press']) {
    const r = await record(KIT, preset, { bpm: 120, bars: 16 });
    assert.ok(r.A.secs.some((x) => x.kind === 'drop'));
    assert.equal(r.A.secs.at(-1).kind, 'outro');
    assert.ok(r.notes.filter((n) => n.name === 'kick').length > 20, `${preset} has a groove`);
  }
});

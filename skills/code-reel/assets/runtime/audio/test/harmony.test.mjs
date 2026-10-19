// harmony.test.mjs — D1 / D7: chords change on bar lines, every layer plays the pad's chord, and sections that
// start inside a bar (0.25, 0.5, 0.75 of a bar) do not shift the melody or bass against the pad.
// Run: node --test lib/audio/test/*.test.mjs   (or from the kit: node --test test/*.test.mjs)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { record, pc, padSpans, padAt } from './record.mjs';

// KIT_DIR=<another copy of the kit> runs the chord-tone checks against it (e.g. an older version, to see the bug).
const KIT = process.env.KIT_DIR || join(dirname(fileURLToPath(import.meta.url)), '..');
const OFFSETS = [0.25, 0.5, 0.75];

// Arrangements with fractional section starts: a build, a drop, a break, another drop, an outro.
const shape = (f) => [
  { from: 0, to: 2 + f, kind: 'intro' },
  { from: 2 + f, to: 5 + f, kind: 'build' },
  { from: 5 + f, to: 9 + f, kind: 'drop' },
  { from: 9 + f, to: 10.5 + f, kind: 'drop' },
  { from: 10.5 + f, to: 12 + f, kind: 'break' },
  { from: 12 + f, to: 17 + f, kind: 'drop' },
  { from: 17 + f, to: 20, kind: 'outro' },
];

// Notes that are chord tones by construction, per preset (voice name + a filter on its options).
const CHORD_TONES = {
  swiss: (n) => n.name === 'marimba' && [1.2, 1.5, 1].includes(n.opts.dur), // melody, bass, counter-line (not the glissando or the ending)
  blueprint: (n) => (n.name === 'synth' && n.bus === 'pump' && n.pan !== 0.6) || n.name === 'sub', // pan 0.6 = the echo
  data: (n) => (n.name === 'pluck' && n.opts.dur === 0.6) || n.name === 'bass',
  thread: (n) => (n.name === 'pluck' && n.opts.dur === 0.7) || n.name === 'bass',
  diagram: (n) => (n.name === 'keys' && n.opts.dur < 3) || n.name === 'sub' || (n.name === 'pluck' && n.opts.decay === 0.6),
  inkbeat: (n) => n.name === 'bass' || (n.name === 'synth' && n.bus === 'pump'),
  terminal: (n) => n.name === 'sub',
};
const BPM = { swiss: 120, blueprint: 100, data: 112, thread: 120, diagram: 96, inkbeat: 128, terminal: 128 };

for (const preset of Object.keys(CHORD_TONES)) {
  for (const f of OFFSETS) {
    test(`${preset}: every chord tone sits in the pad's chord (sections start at +${f} bar)`, async () => {
      const { notes } = await record(KIT, preset, { bpm: BPM[preset], bars: 20, sections: shape(f), seed: 3 });
      const spans = padSpans(notes);
      const bad = [];
      for (const n of notes.filter(CHORD_TONES[preset])) {
        const p = padAt(spans, n.t);
        if (!p) continue; // no pad here (gap, rest, break-only presets)
        const notePc = pc(n.opts.freq ?? n.opts.freqs[0]);
        if (!p.pcs.has(notePc)) bad.push(`${n.name} @${n.t.toFixed(3)}s`);
      }
      assert.deepEqual(bad, [], `${bad.length} notes outside the pad chord`);
    });
  }
}

const KIT_ONLY = process.env.KIT_DIR ? test.skip : test;

KIT_ONLY('chords change only on bar lines, except where a drop or the outro starts', async () => {
  for (const f of OFFSETS) {
    const { A } = await record(KIT, 'terminal', { bpm: 128, bars: 20, sections: shape(f) });
    const prog = ['Am9', 'Fmaj7', 'Cmaj7', 'Em7'];
    const restarts = new Set(A.runs.map((r) => r.from));
    let prev = null;
    for (let q = 0; q < 20 * 16; q++) {
      const bar = q / 16, sym = A.chord(prog, bar);
      if (prev !== null && sym !== prev) {
        const onLine = Math.abs(bar - Math.round(bar)) < 1e-9;
        assert.ok(onLine || restarts.has(bar), `chord changed inside a bar at ${bar} (offset ${f})`);
      }
      prev = sym;
    }
  }
});

KIT_ONLY('the progression runs on across sections and restarts only at drops and the outro', async () => {
  const sections = [
    { from: 0, to: 3, kind: 'intro' }, { from: 3, to: 5, kind: 'build' }, // one run of 5 bars
    { from: 5, to: 7, kind: 'drop' }, { from: 7, to: 10, kind: 'drop' }, { from: 10, to: 11, kind: 'break' }, // one run
    { from: 11, to: 14, kind: 'drop' }, { from: 14, to: 16, kind: 'outro' },
  ];
  const { A } = await record(KIT, 'blueprint', { bpm: 100, bars: 16, sections });
  const prog = ['Em9', 'Cmaj9', 'Gmaj7', 'D6'];
  const bars = Array.from({ length: 16 }, (_, b) => A.chord(prog, b + 0.5));
  assert.deepEqual(A.runs.map((r) => r.from), [0, 5, 11, 14]);
  assert.deepEqual(bars, [
    'Em9', 'Cmaj9', 'Gmaj7', 'D6', 'D6', //    intro+build: bar 4 would restart the loop; it plays the turnaround
    'Em9', 'Cmaj9', 'Gmaj7', 'D6', 'Em9', 'D6', // drops continue through the second section; the break's bar is the turnaround
    'Em9', 'Cmaj9', 'D6', //                     the last drop is cut off after 3 bars: turnaround on its last bar
    'Em9', 'Em9', //                              the outro holds the home chord
  ]);
});

KIT_ONLY('terminal plays an 8-bar progression: the second half answers the first', async () => {
  const { notes, beat } = await record(KIT, 'terminal', { bpm: 128, bars: 10, sections: [{ from: 0, to: 10, kind: 'drop' }] });
  const subs = notes.filter((n) => n.name === 'sub').map((n) => Math.round(12 * Math.log2(n.opts.freq / 440)) % 12);
  assert.equal(subs.length, 10);
  // roots A F C E | A F D E (semitones from A), then A F again
  assert.deepEqual(subs.map((x) => (x + 12) % 12), [0, 8, 3, 7, 0, 8, 5, 7, 0, 8].map((x) => x)); // semitones from A
});

KIT_ONLY('a drop that starts inside a bar holds the home chord to the end of its first full bar', async () => {
  const { A } = await record(KIT, 'terminal', { bpm: 128, bars: 12, sections: [{ from: 0, to: 4.5, kind: 'build' }, { from: 4.5, to: 12, kind: 'drop' }] });
  const prog = ['Am9', 'Fmaj7', 'Cmaj7', 'Em7'];
  assert.equal(A.chord(prog, 4.25), 'Em7'); // still the build's turnaround
  assert.equal(A.chord(prog, 4.5), 'Am9');
  assert.equal(A.chord(prog, 5.9), 'Am9');
  assert.equal(A.chord(prog, 6), 'Fmaj7');
});

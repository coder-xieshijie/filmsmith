// query-bed — the sound of the pulse style: a D-minor bed at the film's tempo with a muted kick on every beat from the
// first word, offbeat hats from bar 2, a rim on 2 and 4 from bar 3, a sixteenth-note "query" synth whose filter opens
// toward the drop (resting under reading), a near-silent beat of riser and swell for the exposure build, and the drop
// on the whiteout (full kick, sidechain, claps, open hats, offbeat bass) easing 2.5 dB after; the lock-up is the outro.
// Every picture event has its sound: a stamp and thud on each word, a tick on each aperture and known hop, a pop on a
// new hop, a glitch under a scramble, a chime and stamp on the lock, a low thud and bell on a failed search.
// The bed is lib/audio's `query` preset, the template's bed ported sample for sample. From the pulse template
// (assets/templates/pulse/score.mjs, mode card Sound).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'query',
    bpm: { default: 120, min: 112, max: 120 }, key: 'D minor', mix: 'v2',
    kinds: { hook: 'build', problem: 'build', turn: 'build', demo: 'build', climax: 'drop', proof: 'break', lockup: 'outro' },
    energy: { hook: 0.45, problem: 0.55, turn: 0.65, demo: 0.7, climax: 1, proof: 0.75, lockup: 0.4 }, reading: 'rest' },
  cues: {
    land: { voice: 'stamp', opts: { thud: 70 }, gain: -14, note: 'a word lands at the anchor; a figure lands' },
    tick: { voice: 'tick', opts: { freq: 2600 }, gain: -21, note: 'an aperture opens; a known candidate is hopped' },
    accent: { voice: 'pop', opts: { freq: 900 }, gain: -19, note: 'a new candidate is hopped' },
    hit: { voice: 'chime', opts: { notes: 1, stamp: true }, gain: -14, note: 'the answer locks' },
    turn: { voice: 'whoosh', opts: { dur: 0.15 }, gain: -18, lead: 0.15, note: 'the whip into the evidence; the slice into the lock-up' },
    type: { voice: 'typeKey', opts: {}, gain: -27, note: 'the query line types' },
    claim: { duck: { depth: -3, hold: 'read' } },
    end: { voice: 'chime', opts: { notes: 2 }, gain: -14, note: 'the closing flip on the last downbeat' },
    device: { 'whiteout-slam': { voice: 'impact', opts: { rim: true, chime: true }, gain: -12 }, 'symbol-scramble': { voice: 'glitch', opts: { dur: 0.3 }, gain: -24 },
              'counter-portal': { voice: 'whoosh', opts: { up: true, dur: 1 }, gain: -20 }, 'invert': { voice: 'impact', opts: { rim: true }, gain: -16 }, 'failed search': { voice: 'thud', opts: { freq: 55, bell: true }, gain: -16 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'query-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Query bed', zh: '查询节拍床' }, note: { en: 'pulse: a kick on every beat; near silence for the build; the drop on the whiteout', zh: 'pulse：每拍一记闷鼓；高潮前一拍几乎静音；drop 落在白闪上' } }, opts); },
};

// inkbeat-bed — the sound of the ink style: lib/audio's `inkbeat` bed (F minor minimal techno, 124 BPM default): a
// build with no kick under the paper scenes (hats, percussion, a resonant pulse opening, a riser), half a bar of
// silence, the first drop (kick, rolling bass, claps) on the name, easing through the steps and the numbers, a rebuild
// bar and the second drop on the claim's whiteout, the outro under the closing card. Every landing of the dot has its sound: a stamp on each
// slam, a soft thud on each hop, a tick on each step and width jump, a whoosh on the bar window and the scan, an
// impact on the whiteout, a bell when the dot becomes the cursor.
// From the ink template (assets/templates/ink/score.mjs, mode card Sound; lib/audio/beds.mjs inkbeat).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'inkbeat', bpm: { default: 124, min: 120, max: 136 }, key: 'F minor', mix: 'v2',
    kinds: { hook: 'build', problem: 'build', turn: 'build', climax: 'drop', demo: 'drop', proof: 'drop', claim: 'drop', lockup: 'outro' },
    energy: { hook: 0.6, problem: 0.6, turn: 0.6, climax: 1, demo: 0.85, proof: 0.8, claim: 1, lockup: 0.4 }, reading: 'duck' },
  cues: {
    land: { voice: 'stamp', opts: { thud: 80 }, gain: -13, note: 'a word slams; a value lands; the dot lands' },
    tick: { voice: 'tick', opts: { freq: 2400 }, gain: -20, note: 'a step; a width jump; a roll digit' },
    accent: { voice: 'pop', opts: { freq: 700 }, gain: -18, note: 'the warped word rises; a stop buds' },
    hit: { voice: 'impact', opts: { rim: true }, gain: -12, note: 'the burst; the claim on the whiteout' },
    drop: { voice: 'impact', opts: { chime: true }, gain: -12, note: 'the name rises out of the field (first drop)' },
    hop: { voice: 'thud', opts: { freq: 70 }, gain: -18, note: 'the dot hops to the next scene' },
    turn: { voice: 'whoosh', opts: { dur: 0.25 }, gain: -18, lead: 0.25, note: 'the bar window; the scan; the iris' },
    type: { voice: 'typeKey', opts: {}, gain: -27, note: 'a label or the command types' },
    bell: { voice: 'bell', opts: {}, gain: -14, note: 'the dot lands as the cursor' },
    end: { voice: 'chime', opts: { notes: 2 }, gain: -15, note: 'the dot\'s second landing on the last downbeat' },
    claim: { duck: { depth: -3, hold: 'read' } },
    device: { 'collapse-burst': { voice: 'riser', opts: { dur: 0.6 }, gain: -18 }, 'counter-portal': { voice: 'whoosh', opts: { up: true, dur: 1 }, gain: -20 }, 'whiteout-slam': { voice: 'impact', opts: { rim: true, chime: true }, gain: -11 }, 'aperture-swap': { voice: 'tick', opts: { freq: 1800 }, gain: -20 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'inkbeat-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Ink beat', zh: '墨点节拍' }, note: { en: 'ink: a stamp for every slam, a thud for every hop; two drops (the name, the claim)', zh: 'ink：每次砸字一记印章声，每次跳点一记闷响；两次 drop（名字、断言）' } }, opts); },
};

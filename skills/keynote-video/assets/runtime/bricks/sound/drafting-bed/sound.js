// drafting-bed — the sound of the blueprint style: the `blueprint` bed of lib/audio (a 16th-note arpeggio over soft
// pads, E, 92–108 BPM), quiet while the problem is drawn, building through the arrangement and the details, dropping
// on the stamp sheets, swelling with the route on the final overview, an outro under the release. On the picture: a
// pen rim per lettered line, a rim and a soft thud per box, a pop per amber mark, a stamp with a low impact (the bed
// ducks −4 dB), a whoosh per camera move, ticks as the probe run passes each row, a chime when the route lands.
// From the blueprint template (assets/templates/blueprint/score.mjs; timing.rules.js MUSIC, 92–108 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'blueprint', bpm: { default: 100, min: 92, max: 108 }, key: 'E', mix: 'v1',
    kinds: { hook: 'intro', problem: 'intro', claim: 'build', turn: 'build', demo: 'drop', proof: 'drop', climax: 'drop', rest: 'break', lockup: 'outro' },
    energy: { hook: 0.4, problem: 0.4, claim: 0.5, turn: 0.55, demo: 0.6, proof: 0.65, climax: 0.9, rest: 0.5, lockup: 0.5 }, reading: 'duck' },
  cues: {
    land: { voice: 'rim', opts: { freq: 1350 }, gain: -22, note: 'a line of lettering is drawn (pen)' },
    tick: { voice: 'rim', opts: { freq: 820 }, gain: -22, note: 'a box lands, with a 95 Hz thud at −22 dB' },
    accent: { voice: 'pop', opts: { freq: 620, decay: 0.06, sweep: 3 }, gain: -23, note: 'an amber mark: revision triangle, underline, bracket' },
    hit: { voice: 'tom', opts: { freq: 170, decay: 0.12 }, gain: -19, note: 'the exploded view snaps into its chain (clack)' },
    stamp: { voice: 'stamp', opts: { freq: 760, to: 120, decay: 0.09 }, gain: -13, note: 'a stamp lands; a 46 Hz impact under it, the bed ducks −4 dB' },
    turn: { voice: 'whoosh', opts: { dur: 0.6, up: false, lo: 350, hi: 2600 }, gain: -27, note: 'the camera travels to the next sheet; a probe run (whoosh up with a low swell)' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'rim', opts: { freq: 2600 }, gain: -19, note: 'RELEASED lettered on the last downbeat' },
    device: { 'route-pan': { voice: 'whoosh', opts: { up: false, lo: 350, hi: 2600 }, gain: -27, note: 'one per move' },
      'blueprint-expose': { voice: 'tick', opts: { freq: 3000, decay: 0.006 }, gain: -21, note: 'one per row the lamp passes' },
      'shape-flood': { voice: 'whoosh', opts: { up: true, lo: 260, hi: 5200 }, gain: -20, note: 'a chime as it closes' },
      'occluder-pass': { voice: 'whoosh', opts: { up: false, lo: 180, hi: 1600 }, gain: -19, note: 'the parallel rule crossing' } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v1' },
};
export default {
  id: 'drafting-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Drafting bed', zh: '制图音乐床' }, note: { en: 'blueprint: a quiet arpeggio; pen rims, a thud per stamp, a whoosh per camera move', zh: 'blueprint：安静的琶音；落笔是边击，盖章一声闷响，镜头移动一阵风声' } }, opts); },
};

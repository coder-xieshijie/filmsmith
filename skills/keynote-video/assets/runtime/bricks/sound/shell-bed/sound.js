// shell-bed — the sound of the split style: the `terminal` bed of lib/audio (a pulsing saw figure over an 8-bar
// progression in A minor: the input side is a shell) at 112–128 BPM, its sections following the scenes (an intro
// under the request, a build through the pick, the file and the render, the drop from the diff into its climax with
// the melodic layer out while the claim is read, an outro under the lock-up); and the sounds of the keyboard and the
// seam: a key click per typed character with a light duck of the pulse, a rim on each tick of a pick, a tick per
// louvre slat, an air sweep under each wipe line, the branch and the slider, a dry tick and a soft low body on each
// landing, an impact and a rolled chime with a duck on the climax, a bell and a thud on the lock-up's name.
// From the split template (assets/templates/split/score.mjs; timing.rules.js bpm { default 120, min 112, max 128 }).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'terminal', bpm: { default: 120, min: 112, max: 128 }, key: 'A minor', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', proof: 'build', climax: 'drop', lockup: 'outro' },
    energy: { hook: 0.35, demo: 0.52, proof: 0.62, climax: 0.82, lockup: 0.5 }, reading: 'the melodic layer out while the climax’s claim is read (drop, reading)' },
  cues: {
    type: { voice: 'typeKey', gain: -27, duck: { depth: -2, bus: 'pump' }, note: 'one key per typed character (not spaces); the pulse ducked 2 dB while typing' },
    pull: { voice: 'rim', opts: { freq: 1500 }, gain: -22, note: 'the pick’s tick hops to the next item' },
    tick: { voice: 'tick', opts: { freq: 3400, decay: 0.005 }, gain: -26, note: 'a report line lands' },
    land: { voice: 'tick', opts: { freq: 2400 }, gain: -13, body: { voice: 'thud', opts: { freq: 88, decay: 0.08 }, gain: -18 }, note: 'the seam lands, a frame cuts in' },
    accent: { voice: 'tick', opts: { freq: 2900 }, gain: -13, body: { voice: 'thud', opts: { freq: 88, decay: 0.08 }, gain: -18 }, note: 'a token paired, an output frame cut' },
    hook: { voice: 'chime', opts: { freq: 1760 }, gain: -15, body: { voice: 'thud', opts: { freq: 62 }, gain: -13 }, note: 'the caret stands up into the seam (+ a tick)' },
    claim: { voice: 'impact', opts: { freq: 46, decay: 0.8 }, gain: -9, then: { voice: 'chime', opts: { notes: 3, freq: 1318.5 }, gain: -16 }, duck: { depth: -5, release: 0.8 }, note: 'the slider lands on the bar line' },
    lockup: { voice: 'bell', opts: { freq: 880, dur: 2.4 }, gain: -16, body: { voice: 'thud', opts: { freq: 66 }, gain: -13 }, note: 'the name lands' },
    turn: { voice: 'whoosh', opts: { up: true, lo: 350, hi: 5200, peak: 0.5 }, gain: -19, note: 'a move of the seam starts (see devices)' },
    device: {
      'split-open': { voice: 'whoosh', opts: { up: true, lo: 600, hi: 5000, peak: 0.8 }, gain: -24 },
      louvre: { voice: 'tick', opts: { freq: 2600, decay: 0.008 }, gain: -22, note: 'one per slat, 90 Hz higher each' },
      'seam-push': { voice: 'whoosh', opts: { dur: 0.36, up: true, lo: 500, hi: 3500 }, gain: -25 },
      'wipe-line': { voice: 'whoosh', opts: { up: false, lo: 350, hi: 5200, peak: 0.5 }, gain: -19 },
      'split-branch': { voice: 'whoosh', opts: { dur: 0.45, up: true, lo: 400, hi: 3200, peak: 0.6 }, gain: -23 },
      'diff-slider': { voice: 'whoosh', opts: { up: true, lo: 350, hi: 5200, peak: 0.5 }, gain: -20 },
      'seam-close': { voice: 'whoosh', opts: { dur: 0.45, up: true, lo: 500, hi: 3600, peak: 0.7 }, gain: -23 },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'shell-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Shell bed', zh: '终端音乐床' }, note: { en: 'split: a key per typed character; the seam sweeps the air as it moves', zh: 'split：每打一个字一声按键；接缝移动时一阵风声' } }, opts); },
};

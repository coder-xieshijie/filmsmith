// desk-bed — the sound of the exhibit style: the `swiss` bed of lib/audio (marimba, woodblock and shaker over a light
// kick: a desk of paper and pencil) at 112–128 BPM, its sections following the scenes (the opening is the intro, from
// the first travel the build with the marimba resting while text is read, from the match the drop so the measured gap
// lands inside it, the lock-up the outro), and the desk's own sounds: a pencil rim for every ring, a soft tick and a
// low thud on each landing, a falling whoosh under the rise, an upward one under a travel or a lift-out, a riser into
// the match's hard cut (a tick and a stamp on the cut frame), four rising ticks under the dimension and an impact, a
// rolled chime and a duck on the measured gap, typing keys under the address.
// From the exhibit template (assets/templates/exhibit/score.mjs; timing.rules.js bpm { default 120, min 112, max 128 }).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'swiss', bpm: { default: 120, min: 112, max: 128 }, key: 'C major pentatonic', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', proof: 'build', turn: 'drop', climax: 'drop', claim: 'drop', lockup: 'outro' },
    energy: { hook: 0.4, demo: 0.5, proof: 0.5, turn: 0.85, climax: 0.85, claim: 0.85, lockup: 0.5 }, reading: 'rest the marimba line while text is read (build only)' },
  cues: {
    land: { voice: 'thud', opts: { freq: 80, decay: 0.1 }, gain: -13, body: { voice: 'tick', opts: { freq: 2800 }, gain: -16 }, note: 'the camera arrives, the mount lands, the readings land' },
    ring: { voice: 'rim', opts: { freq: 1500 }, gain: -15, send: 0.1, note: 'a pencil ring starts (+120 Hz for each next ring); also the rule, the route and the last ring' },
    hook: { voice: 'whoosh', opts: { up: false, lo: 250, hi: 4200, peak: 0.55 }, gain: -19, send: 0.2, note: 'the camera rises off the print (the open); a pop at 480 Hz as the caption begins' },
    accent: { voice: 'tick', opts: { freq: 3800 }, gain: -10, body: { voice: 'stamp', opts: { freq: 1100, to: 250, decay: 0.05 }, gain: -14 }, note: 'the match cut (a riser into it, a falling whoosh out of it)' },
    claim: { voice: 'impact', gain: -12, duck: { depth: -4, lead: 0.12, release: 0.8 }, then: { voice: 'chime', opts: { notes: 3 }, gain: -17 }, note: 'the measured gap lands; four ticks rise under the dimension, a riser a second before' },
    lockup: { voice: 'impact', opts: { freq: 52 }, gain: -13, then: { voice: 'chime', gain: -20 }, note: 'the name lands over the whole desk' },
    type: { voice: 'typeKey', gain: -25, note: 'the address types (one key every two characters)' },
    device: {
      'parallax-slide': { voice: 'whoosh', opts: { up: true, lo: 300, hi: 4500, peak: 0.5 }, gain: -19, send: 0.15 },
      'grid-hop': { voice: 'whoosh', opts: { up: false, lo: 250, hi: 3800, peak: 0.6, share: 0.36 }, gain: -19, hop: { voice: 'tick', opts: { freq: 4200 }, gain: -16 }, dive: { voice: 'whoosh', opts: { up: true, lo: 300, hi: 5000, peak: 0.7 }, gain: -19 } },
      'lift-out': { voice: 'whoosh', opts: { dur: 0.35, up: true, lo: 500, hi: 6000, peak: 0.6 }, gain: -21, back: { voice: 'whoosh', opts: { dur: 0.3, up: false, lo: 300, hi: 3500, peak: 0.4 }, gain: -23 } },
      'match-cut': { voice: 'riser', opts: { lo: 400, hi: 3000, tone: 0.2 }, gain: -27 },
    },
  },
  master: { lufs: -14, tp: -2.0, tone: 'v2' },
};
export default {
  id: 'desk-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Desk bed', zh: '桌面音乐床' }, note: { en: 'exhibit: paper and pencil; a rim for every ring, a stamp on the match cut', zh: 'exhibit：纸与铅笔；每个圈一声木边，匹配剪切一声戳' } }, opts); },
};

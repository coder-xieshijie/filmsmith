// reel-bed — the sound of the strip style: the `thread` bed of lib/audio (plucks over a soft four-on-the-floor: a
// reel's bed) at 112–128 BPM, its sections following the scenes (the opening run the intro, the intertitles a build
// with the reading drop, the frames a harder build, the punch a break, the sheet a build again, the pick a drop — or
// a rest while the picked film runs with its own sound — the lock-up the outro), and the projector's own sounds: a dry
// mechanical click on every claw pull-down, a thud and a tick on each landing, a stamp and a pop on the hook, a swell
// as the optical track lights, an impact on the punch, a stamp on the measured lengths, a scribble and a stamp for
// the pencil, an impact and a chime on the pick, typing keys under the address.
// From the strip template (assets/templates/strip/score.mjs; timing.rules.js bpm { default 120, min 112, max 128 }).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'thread', bpm: { default: 120, min: 112, max: 128 }, key: 'D major', mix: 'v2',
    kinds: { hook: 'intro', claim: 'build', demo: 'build', turn: 'break', proof: 'build', climax: 'drop', lockup: 'outro' },
    energy: { hook: 0.55, claim: 0.45, demo: 0.6, turn: 0.5, proof: 0.5, climax: 0.85, lockup: 0.5 }, reading: 'drop the plucked line while an intertitle or a caption is read (build)' },
  cues: {
    pull: { voice: 'tick', opts: { freq: 2300, decay: 0.004, noise: 0.5 }, gain: -15, body: { voice: 'rim', opts: { freq: 820 }, gain: -18 }, note: 'every claw pull-down (+90 Hz a step, five steps)' },
    land: { voice: 'thud', opts: { freq: 78, decay: 0.1 }, gain: -13, body: { voice: 'tick', opts: { freq: 2800 }, gain: -16 }, note: 'a frame registers, the full frame lands' },
    hook: { voice: 'stamp', opts: { freq: 1000, to: 260, decay: 0.05 }, gain: -15, then: { voice: 'pop', opts: { freq: 600 }, gain: -19 }, note: 'the hook line registers' },
    track: { voice: 'swell', opts: { freqs: ['D4', 'F#4', 'A4'], dur: 0.75 }, gain: -31, send: 0.3, note: 'the optical track lights' },
    accent: { voice: 'stamp', opts: { freq: 1200, to: 300, decay: 0.05 }, gain: -15, body: { voice: 'tick', opts: { freq: 3600 }, gain: -13 }, note: 'the measured lengths; the pencil closes its loop (1400 Hz)' },
    claim: { voice: 'impact', gain: -12, then: { voice: 'chime', opts: { notes: 3 }, gain: -18 }, note: 'the pick lands at full size; a riser half a second before' },
    lockup: { voice: 'impact', opts: { freq: 52 }, gain: -13, then: { voice: 'chime', gain: -22 }, note: 'the name settles' },
    type: { voice: 'typeKey', gain: -25, note: 'the address types (one key every two characters)' },
    device: {
      'strip-advance': { voice: 'whoosh', opts: { up: true, lo: 300, hi: 5000, peak: 0.7 }, gain: -19, send: 0.15 },
      'gate-punch': { voice: 'whoosh', opts: { up: true, lo: 300, hi: 5000, peak: 0.7 }, gain: -19, land: { voice: 'impact', opts: { freq: 55, decay: 0.4 }, gain: -15 } },
      'sheet-pick': { voice: 'riser', opts: { lo: 500, hi: 6000 }, gain: -23 },
      'pencil-loop': { voice: 'whoosh', opts: { up: true, lo: 2200, hi: 7500, q: 2.2, peak: 0.5 }, gain: -24 },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'reel-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Reel bed', zh: '胶片音乐床' }, note: { en: 'strip: a projector’s claw clicks on every pull-down; the pencil scribbles', zh: 'strip：每次拉片一声抓片爪的咔哒；铅笔的沙沙声' } }, opts); },
};

// stream-bed — the sound of the stream style: the `terminal` bed of lib/audio (a steady filtered synth pulse, soft kick,
// off-beat hats, sub and pad at 120–132 BPM, A minor) whose sections follow the scenes: a build while the desk piles up,
// a break on the freeze, the drop on each of the three peaks (threaded, the constellation, the gathered panel), quieter
// reading passages under copy, an outro under the lock-up. One sound per picture event on its frame: pops for windows
// and bubbles, a tick as the thread pierces each item and as the sweep catches each star, a pluck on a pentatonic scale
// per star launched, a chime per result returned, a stamp at the gate, an impact, a chime and a 4 dB duck on each peak,
// and the film's only three-note alert with a 6 dB duck on the one "needs you".
// From the stream template (assets/templates/stream/score.mjs; sched.js music and cues; timing.rules.js 120–132 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'terminal', bpm: { default: 128, min: 120, max: 132 }, key: 'A minor', mix: 'v2',
    kinds: { hook: 'build', problem: 'build', turn: 'break', demo: 'build', proof: 'build', climax: 'drop', claim: 'build', rest: 'intro', lockup: 'outro' },
    energy: { hook: 0.62, problem: 0.4, turn: 0.12, demo: 0.45, proof: 0.55, climax: 0.95, claim: 0.55, rest: 0.32, lockup: 0.5 },
    reading: 'the bed thins (reading sections) under a chat block or a caption being read; it breaks to 0.12 under the freeze line; each of the three peaks drops to 0.8–0.95' },
  cues: {
    land: { voice: 'thud', opts: { freq: 70, decay: 0.16 }, gain: -13, note: 'the mascot lands; a word of the claim lands (with a pluck)' },
    stamp: { voice: 'stamp', opts: { freq: 420, to: 110, decay: 0.09 }, gain: -16, note: 'the gate stops the item' },
    turn: { voice: 'whoosh', opts: { dur: 0.45, up: false, lo: 300, hi: 4000 }, gain: -24, note: 'a block folds back into the thread; the sweep starts' },
    accent: { voice: 'impact', opts: {}, gain: -13, note: 'a peak: the thread goes taut, the constellation links, the panel opens (with a three-note chime E6 and a 4 dB duck)' },
    claim: { duck: { depth: -6, hold: 'read' }, note: 'the one "needs you": the three-note alert (chime E6), the film\'s only alert' },
    end: { voice: 'chime', opts: { notes: 2, decay: 0.55 }, gain: -21, note: 'the tagline' },
    device: {
      'thread-pierce': { voice: 'tick', opts: { freq: 2200 }, gain: -27, note: 'a tick as each item is pierced (a riser under the head, a hit when taut)' },
      'reel-in': { voice: 'whoosh', opts: { dur: 1.2, up: true, lo: 300, hi: 5500, peak: 0.7 }, gain: -20, note: 'the pull' },
      'hook-unfold': { voice: 'whoosh', opts: { dur: 0.5, lo: 500, hi: 4000, peak: 0.5 }, gain: -26, note: 'a block unfolds' },
      'star-launch': { voice: 'pluck', opts: { freq: 440, dur: 1.0, bright: 0.6 }, gain: -17, note: 'one pluck per star, up an A-minor pentatonic (A4 C5 D5 E5 G5 A5 C6 D6), a short whoosh' },
      'beam-return': { voice: 'chime', opts: { notes: 1, decay: 0.45 }, gain: -22, note: 'a chime as each result arrives (A5, C6, E6)' },
      'star-sweep': { voice: 'riser', opts: { lo: 300, hi: 5200, tone: 0.3 }, gain: -21, note: 'a riser under the sweep, a tick per star caught, a pull under the flow' },
      'strand-zoom': { voice: 'whoosh', opts: { dur: 0.55, lo: 500, hi: 4500, peak: 0.45 }, gain: -27, note: 'a card enlarges' },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'stream-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Stream bed', zh: '意识流音乐床' }, note: { en: 'terminal: A minor, builds while things pile up, drops on the three peaks; one sound per picture event, one alert', zh: 'terminal：A 小调，堆积时铺垫、三个高峰落拍；每个画面事件一个声音，全片只一次提示音' } }, opts); },
};

// device-bed — the sound of the handset style: the `data` bed of lib/audio (a soft muted four-on-the-floor, a plucked
// up-down arpeggio, a warm pad, a round bass) in F at 112–128 BPM, its sections following the scenes (an intro under
// the wake, a build under the pushes and changes of surface, the groove from the first band or scroll to the claim with
// its melodic layer out while the claim is read, an outro under the lock-up), and the device's own sounds: a tick and a
// soft low body on each landing, a short rising sweep under a feed, a flick sweep under a scroll, a sweep and a muted
// thock on a flip's swap frame, an impact and a rolled chime with a duck on the claim, a chime as the screen lights,
// a bell and a thud on the lock-up. No whoosh under every move.
// From the handset template (assets/templates/handset/score.mjs; timing.rules.js bpm { default 120, min 112, max 128 }).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'data', bpm: { default: 120, min: 112, max: 128 }, key: 'F', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', turn: 'build', proof: 'drop', climax: 'drop', lockup: 'outro' },
    energy: { hook: 0.35, demo: 0.5, turn: 0.6, proof: 0.72, climax: 0.9, lockup: 0.5 }, reading: 'drop the melodic layer under the claim' },
  cues: {
    land: { voice: 'tick', opts: { freq: 2400 }, gain: -13, body: { voice: 'thud', opts: { freq: 90, decay: 0.08 }, gain: -19 }, note: 'a push, a feed, a scroll or a band lands' },
    accent: { voice: 'tick', opts: { freq: 2900 }, gain: -13, note: 'a cut, a band hop, a ring closing' },
    hook: { voice: 'chime', opts: { freq: 1396.9 }, gain: -15, send: 0.3, body: { voice: 'thud', opts: { freq: 64 }, gain: -14 }, note: 'the screen lights' },
    turn: { voice: 'whoosh', opts: { dur: 0.38, up: true, lo: 300, hi: 2600, peak: 0.35 }, gain: -21, note: 'a feed rises' },
    claim: { voice: 'impact', opts: { freq: 46, decay: 0.8 }, gain: -9, duck: { depth: -5, lead: 0.12, release: 0.8 }, then: { voice: 'chime', opts: { notes: 3, freq: 1046.5 }, gain: -17 } },
    end: { voice: 'bell', opts: { freq: 698.5, dur: 2.4 }, gain: -16, send: 0.35, body: { voice: 'thud', opts: { freq: 70 }, gain: -14 } },
    device: {
      'scroll-reel': { voice: 'whoosh', opts: { lo: 500, hi: 6000, peak: 0.18, share: 0.6 }, gain: -19, lead: -0.04 },
      'device-flip': { voice: 'whoosh', opts: { dur: 0.42, lo: 400, hi: 3800 }, gain: -20, swap: { voice: 'thud', opts: { freq: 82, decay: 0.1 }, gain: -13 } },
      'viewport-push': { voice: 'whoosh', opts: { lo: 600, hi: 4200, share: 0.9 }, gain: -27 },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'device-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Device bed', zh: '设备音乐床' }, note: { en: 'handset: the sounds belong to the device; a flick under a scroll, a thock on the flip', zh: 'handset：声音属于设备；滚动时一声甩动，翻转时一声闷响' } }, opts); },
};

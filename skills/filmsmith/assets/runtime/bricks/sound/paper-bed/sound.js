// paper-bed — the sound of the dossier style: lib/audio's `diagram` bed (felt keys, E♭, on the film's beat grid), rising
// one step per exhibit as a build, dropping on the result's struck claim (the climax key, not the scene's start) and
// playing out under the lock-up; over it, restrained paper sounds on the picture's own moments: the highlighter drawn
// across paper (lib/audio's `scratch` as a soft felt tip, the stroke's length), a sticker pressed (a stamp and a low thud), a light press
// when the first stroke lands and when the slip is laid down, a sheet dealt on or slid off, a page turned over, the
// seam of the worksheet, an index tab, the struck claim (an impact, a paper press and a tick), the struck name. No
// typewriter, no camera shutter, no ticking clock.
// From the dossier template's example (the dossier source film score.mjs; mode card Sound).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'diagram', bpm: { default: 120, min: 100, max: 124 }, key: 'Eb major', mix: 'v2',
    kinds: { hook: 'build', problem: 'build', turn: 'build', demo: 'build', proof: 'build', climax: 'drop', claim: 'drop', rest: 'outro', lockup: 'outro' },
    energy: { hook: 0.42, problem: 0.48, turn: 0.54, demo: 0.6, proof: 0.6, climax: 0.85, claim: 0.85, rest: 0.5, lockup: 0.5 }, reading: 'duck' },
  cues: {
    accent: { voice: 'scratch', opts: { tone: 3400, width: 0.7, depth: 0.35, dur: 'the stroke' }, gain: -25, note: 'the highlighter drawn across paper (a felt tip): every stroke' },
    land: { voice: 'stamp', opts: { freq: 640, to: 160, thud: 90 }, gain: -16, note: 'the first stroke landing; the slip laid on the worksheet; a sticker pressed (heavier, −13)' },
    tick: { voice: 'stamp', opts: { freq: 760, to: 220 }, gain: -19, note: 'an index tab; the worksheet tab' },
    turn: { voice: 'whoosh', opts: { up: false, lo: 300, hi: 2200 }, gain: -24, note: 'a sheet slid off; dealt on (−23, rising); the band moving (−28)' },
    claim: { voice: 'impact', opts: { freq: 52, stamp: true, tick: true }, gain: -12, note: 'the result\'s claim struck: the climax, on the drop' },
    pop: { voice: 'stamp', opts: { freq: 820, to: 300 }, gain: -26, note: 'the stroke pressed again (a tail move): the softest touch' },
    end: { voice: 'whoosh', opts: { up: true, dur: 0.4 }, gain: -23, note: 'the URL underlined' },
    device: { 'page-turn': { voice: 'whoosh', opts: { up: false, then: 'rim + thud' }, gain: -17 }, 'sheet-shuffle': { voice: 'whoosh', opts: { pair: true, tap: true }, gain: -23 }, louvre: { voice: 'tick', opts: { ripple: 6 }, gain: -28 }, 'match-cut': { voice: 'rim', opts: { freq: 1800 }, gain: -20 }, 'split-open': { voice: 'tick', opts: { freq: 3000, then: 'whoosh' }, gain: -24 }, lockup: { voice: 'impact', opts: { freq: 46, duck: -4 }, gain: -13 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'paper-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Paper bed', zh: '纸面节拍床' }, note: { en: 'dossier: felt keys rising by exhibit; paper sounds only, the drop on the struck result', zh: 'dossier：毛毡钢琴按证物逐步升起；只有纸面声，drop 落在被划出的结果上' } }, opts); },
};

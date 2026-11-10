// thread-bed — the sound of the thread style: the `thread` bed of lib/audio (120 BPM, D major, Dmaj7–Bm7–Gmaj7–A; a
// pad with a single downbeat kick, then four on the floor) following a tension curve over the chain: intro on the
// open, build through the links, half-time under the merge so its squelch reads, a break under the ink and the
// particles' gather, the drop on the contact sheet, a pad-only break on the card, the outro (D add9 and a bell) on the
// name. About 70 effects on picture events: a whoosh on the line, a pluck on the caret, typing, bells on the word's
// swings, plucks and ticks on swatches, panels and sketches, a thud on the merge's landing, an impact on the flood.
// From the thread template (assets/templates/thread/score.mjs; timing.rules.js 112–128 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'thread', bpm: { default: 120, min: 112, max: 128 }, key: 'D major', mix: 'v2',
    kinds: { hook: 'intro', claim: 'build', turn: 'build', demo: 'build', proof: 'build', rest: 'break', climax: 'drop', lockup: 'outro' },
    energy: { hook: 0.35, claim: 0.5, turn: 0.55, demo: 0.6, proof: 0.65, rest: 0.4, climax: 0.95, lockup: 0.3 }, reading: 'the merge runs half-time (pad and one kick a bar) so the squelch reads; the ink words and the card hold are pad-only breaks; a 0.2-bar rest before the sheet' },
  cues: {
    land: { voice: 'pluck', opts: { freq: 587 }, gain: -18, note: 'a centre name, a swatch, a panel, a clip, the counter lands' },
    accent: { voice: 'bell', opts: { freq: 1175 }, gain: -20, note: 'the word\'s weight swing, the line hitting the stage name, a check' },
    stamp: { voice: 'thud', opts: {}, gain: -16, note: 'the merged sphere lands; the chosen panel' },
    turn: { voice: 'impact', opts: {}, gain: -14, lead: 0.05, note: 'the flood lands on the downbeat' },
    claim: { duck: { depth: -3, hold: 'read' } },
    end: { voice: 'bell', opts: { freq: 1468 }, gain: -16, note: 'the caret falls flat into the URL\'s underline on the last downbeat' },
    device: {
      'path-type': { voice: 'whoosh', opts: { dur: 0.6 }, gain: -22, note: 'the brief goes round the loop' },
      'rail-press': { voice: 'whoosh', opts: { dur: 0.3, up: false }, gain: -20, note: 'the press into the ruler and the blade\'s cut into the name, an impact on the beat' },
      'dot-iris': { voice: 'riser', opts: { lo: 300, hi: 6000 }, gain: -18, note: 'into the flood' },
      'caret-fall': { voice: 'tick', opts: { freq: 3200 }, gain: -24, note: 'the caret falls flat' },
      'weight-swing': { voice: 'bell', opts: { freq: 1175 }, gain: -20, note: 'one bell a swing' },
      'card-squash': { voice: 'whoosh', opts: { dur: 0.25 }, gain: -22, note: 'the card squashes into the line' },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2', fadeIn: 0.06 },
};
export default {
  id: 'thread-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Thread bed', zh: '一线音乐床' }, note: { en: 'thread: D major, a tension curve over the chain; a sound on every picture event', zh: 'thread：D 大调，张力沿整条链上升；每个画面事件都有声音' } }, opts); },
};

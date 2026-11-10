// sheet-bed — the sound of the scroll style: lib/audio's `thread` bed (120 BPM, D major, Dmaj7–Bm7–Gmaj7–A: plucks, a
// pad, a soft four-on-the-floor; one long line that keeps moving, like the sheet): the opening is the intro, the quotes
// before the climax the build with the reading drop (the melody rests while a band is read), the ratchet raises the
// energy, the unfold is the drop (the claim lands inside it), the quotes after it dip for reading, the lock-up is the
// outro. Every move of the sheet has its sound: a dry whoosh under each scroll, a soft click (rim and thud) on each
// landing, a rising wheel-detent tick per ratchet step, a pencil tick on each underline, a soft pop per entering
// phrase (rising through the film), a paper slide and a swell under the unfold, an impact and a rolled chime on the
// claim and the lock-up, a riser into the fling, keys under the address, a click as the roll lands.
// From the scroll template (the source film score.mjs; mode card Sound).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'thread', bpm: { default: 120, min: 112, max: 128 }, key: 'D major', mix: 'v2',
    kinds: { hook: 'intro', problem: 'build', turn: 'build', demo: 'build', proof: 'build', climax: 'drop', claim: 'drop', rest: 'build', lockup: 'outro' },
    energy: { hook: 0.5, problem: 0.5, turn: 0.6, demo: 0.6, proof: 0.55, climax: 0.85, claim: 0.85, rest: 0.55, lockup: 0.5 }, reading: 'rest' },
  cues: {
    land: { voice: 'rim', opts: { freq: 1250, thud: 85 }, gain: -14, note: 'a scroll lands (a soft click)' },
    tick: { voice: 'tick', opts: { freq: 3200, rising: true }, gain: -17, note: 'a ratchet step (rising through the list)' },
    accent: { voice: 'tick', opts: { freq: 3600 }, gain: -15, note: 'the underline starts (a pencil tick); a phrase enters (a soft pop)' },
    turn: { voice: 'whoosh', opts: { dur: 0.3, dry: true }, gain: -20, lead: 0.1, note: 'a scroll moves; the sweep follows its direction' },
    claim: { voice: 'impact', opts: { chime: true, rolled: true }, gain: -14, note: 'the claim in the unfold panel' },
    type: { voice: 'typeKey', opts: {}, gain: -27, note: 'the address types' },
    end: { voice: 'chime', opts: { notes: 2 }, gain: -15, note: 'the roll lands under the name' },
    device: { unfold: { voice: 'swell', opts: { paper: true }, gain: -20 }, 'scroll-fling': { voice: 'riser', opts: { dur: 1 }, gain: -20 }, roll: { voice: 'thud', opts: { freq: 90 }, gain: -16 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'sheet-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Sheet bed', zh: '长卷节拍床' }, note: { en: 'scroll: one long moving line; a click on every landing, a tick per detent', zh: 'scroll：一条不停往前走的长线；每次停稳一声轻响，每格一声嗒' } }, opts); },
};

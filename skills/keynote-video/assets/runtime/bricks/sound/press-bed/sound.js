// press-bed — the sound of the halftone style: a synthesised print shop, D minor, one chord a bar (Dm9 Bbmaj7 Gm9
// A7sus4) over a 3-3-2 rim-and-tick ostinato (the rhythm of a sheet-fed press) from the first bar; the hook is pad and
// press only, the first chapter builds (half-time kick, offbeat hats, bass on 1 and 3), the first change of ground
// drops (four on the floor, offbeat bass, a plucked arpeggio); the claim is a break; the bed drops out for the push-in
// and returns with an impact and the home chord on the lock-up's bar line. The bed is lib/audio's `press` preset, the
// template's bed ported sample for sample. From the halftone template (assets/templates/halftone/score.mjs).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'press',
    bpm: { default: 120, min: 112, max: 128 }, key: 'D minor', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', proof: 'drop', climax: 'break', lockup: 'outro' },
    energy: { hook: 0.3, demo: 0.6, proof: 0.75, climax: 0.5, lockup: 0.6 }, reading: 'duck' },
  cues: {
    hit: { voice: 'thud', opts: { freq: 60, decay: 0.2 }, gain: -14, note: 'the anchor lands; the anchor strikes (the burst)' },
    land: { voice: 'stamp', opts: {}, gain: -18, note: 'a word lands (a press impression)' },
    turn: { voice: 'whoosh', opts: { dur: 0.3 }, gain: -20, lead: 0.15, note: 'a field morph, a whip, a scan, an iris' },
    tick: { voice: 'tick', opts: { freq: 2400 }, gain: -22, note: 'a field steps; a count steps' },
    accent: { voice: 'rim', opts: {}, gain: -20, note: 'a cell appears' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'impact', opts: { freq: 50, chord: 'Dm9' }, gain: -14, note: 'the lock-up bar line' },
    device: { 'dot-quantize': { voice: 'glitch', opts: { dur: 0.3 }, gain: -24 }, 'collapse-burst': { voice: 'riser', opts: { reverse: true }, gain: -20 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'press-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Press bed', zh: '印刷机音乐床' }, note: { en: 'halftone: a sheet-fed press in 3-3-2; silence before the pull-back', zh: 'halftone：3-3-2 节奏的印刷机；拉远前留出静默' } }, opts); },
};

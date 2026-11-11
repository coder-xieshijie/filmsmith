// glass-climb — the sound of the morph style: a glassy bed whose energy rises with the dimension (line < plane < solid
// < interface): E major, one chord a bar (Emaj9 C#m9 Amaj7#11 B7sus4), a soft pad, a plucked eighth-note arpeggio
// ("glass"), a muted kick and offbeat hats that thicken scene by scene, a pad-only breath under the code, a riser into
// the flood, the drop from the flood's bar line to its retract, an outro of felt keys and one bell under the mark.
// Every landing is a key hit (a 20 ms click and a low thud) with a 70 ms duck before it. The bed is lib/audio's `glass`
// preset, the template's bed ported sample for sample. From the morph template (assets/templates/morph/score.mjs).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'glass',
    bpm: { default: 120, min: 112, max: 128 }, key: 'E major', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', turn: 'build', climax: 'drop', lockup: 'outro' },
    energy: { hook: 0.3, demo: 0.5, turn: 0.65, climax: 0.95, lockup: 0.45 }, reading: 'duck' },
  cues: {
    land: { voice: 'thud', opts: { freq: 85, decay: 0.09, click: 'tick 2600 Hz' }, gain: -16, duck: { depth: -5, before: 0.035 }, note: 'a key hit: the point lands, the card fills' },
    accent: { voice: 'pop', opts: { freq: 700, decay: 0.05, sweep: 3 }, gain: -19, note: 'the accent moves to the next part (token, chip, Run)' },
    turn: { voice: 'whoosh', opts: { dur: 0.34, lo: 300, hi: 3000 }, gain: -20, lead: 0.05, note: 'a container transform or a morph' },
    hit: { voice: 'impact', opts: { freq: 55, decay: 0.35 }, gain: -21, note: 'the press; the flood covers the frame' },
    tick: { voice: 'tick', opts: { freq: 2600 }, gain: -24, note: 'a tab changes; a body line lands' },
    type: { voice: 'typeKey', opts: {}, gain: -26, note: 'the closing command types on' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'bell', opts: { note: 'E6', dur: 1.2 }, gain: -24 },
    device: { 'stroke-reinterpret': { voice: 'pluck', opts: { note: 'B5' }, gain: -20 }, 'outline-morph': { voice: 'whoosh', opts: { dur: 0.38 }, gain: -21 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'glass-climb', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Glass climb', zh: '玻璃攀升' }, note: { en: 'morph: energy rises with the dimension; the drop is the flood', zh: 'morph：能量随维度上升；高潮落在按钮淹没画面那一刻' } }, opts); },
};

// phosphor-bed — the sound of the phosphor style: the `terminal` bed of lib/audio (a pulsing synth bass, hats and a
// sidechained pad at 128 BPM, A minor), building through the chapters, breaking under the install and dropping on its
// first card; typing keys under every typed line, high ticks for options, chips and checks, pops for picks and
// hubs, a riser into the collapse and the fibre burst ending on an impact, a glitch for each glitch cut.
// From the phosphor template (assets/templates/phosphor/score.mjs; timing.rules.js 120–136 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'terminal', bpm: { default: 128, min: 120, max: 136 }, key: 'A minor', mix: 'v2',
    kinds: { hook: 'intro', problem: 'build', claim: 'build', turn: 'build', demo: 'drop', proof: 'drop', climax: 'drop', rest: 'break', lockup: 'outro' },
    energy: { hook: 0.5, problem: 0.5, claim: 0.55, turn: 0.6, demo: 0.65, proof: 0.7, climax: 0.95, rest: 0.45, lockup: 0.5 }, reading: 'the pad thins under a page whose primary text takes ≥ 60 % of it (bass and hats stay); the claim and the tagline duck the bed' },
  cues: {
    land: { voice: 'pop', opts: { freq: 520 }, gain: -17, note: 'a pick, a hub, a problem tag lands' },
    accent: { voice: 'tick', opts: { freq: 2600 }, gain: -19, note: 'an option, a chip, a decision, a check appears' },
    stamp: { voice: 'stamp', opts: {}, gain: -12, note: 'the key word grows, a confirmation passes, an output lights' },
    turn: { voice: 'whoosh', opts: { dur: 0.42 }, gain: -21, lead: 0.12, note: 'a title flies, the slit closes; the collapse is a riser into the burst' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'stamp', opts: {}, gain: -12, note: 'the first chip lights on the last downbeat (the rest tick)' },
    device: {
      'cursor-collapse': { voice: 'riser', opts: { lo: 400, hi: 9000 }, gain: -15, note: 'into the fibre burst, a whoosh as it ends and an impact on the flash' },
      'glyph-decode': { voice: 'glitch', opts: { dur: 0.22 }, gain: -21, note: 'a title decodes' },
      'crt-collapse': { voice: 'whoosh', opts: { up: false, lo: 200, hi: 4000 }, gain: -19, note: 'with a 60 Hz thud as the line closes' },
      'container-morph': { voice: 'whoosh', opts: { dur: 0.35, lo: 500, hi: 3000 }, gain: -25, note: 'the window reshapes' },
    },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'phosphor-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Phosphor bed', zh: '磷光音乐床' }, note: { en: 'phosphor: a terminal synth bed; keys under typing, a riser into the burst', zh: 'phosphor：终端合成器音乐床；敲字处有键声，冲进爆发前有上扬' } }, opts); },
};

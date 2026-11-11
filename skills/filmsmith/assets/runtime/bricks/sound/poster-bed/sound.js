// poster-bed — the sound of the plakat style: the `swiss` bed of lib/audio (marimba and wood over a light kick at
// 120 BPM, C major pentatonic), built up by chapter and resting on the install page; a bright marimba stroke only for
// the accent colour (a person and their decision), a low tom-and-thud landing for big type, rims for rows and steps,
// a stamp per ink flag, typing keys under commands, a swept whoosh for wipes and carried blocks.
// From the plakat template (assets/templates/plakat/score.mjs; timing.rules.js 112–128 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'swiss', bpm: { default: 120, min: 112, max: 128 }, key: 'C major pentatonic', mix: 'v2',
    kinds: { hook: 'build', problem: 'build', claim: 'build', turn: 'drop', demo: 'drop', proof: 'drop', climax: 'drop', rest: 'break', lockup: 'outro' },
    energy: { hook: 0.45, problem: 0.45, claim: 0.5, turn: 0.55, demo: 0.55, proof: 0.6, climax: 0.85, rest: 0.55, lockup: 0.5 }, reading: 'rest the marimba line on a page whose primary text takes ≥ 60 % of it (wood, bass and kick stay)' },
  cues: {
    land: { voice: 'thud', opts: { freq: 84, decay: 0.1 }, gain: -13, note: 'a big line lands; low landings add a tom (98 Hz) and duck the bed −4 dB' },
    tick: { voice: 'rim', opts: { freq: 1550 }, gain: -12, note: 'a row, a step or a node appears (soft: 1900 Hz, −16 dB)' },
    count: { voice: 'marimba', opts: { scale: 'C pentatonic up', dur: 0.5 }, gain: -13, note: 'a counter steps up; with a 3 kHz tick' },
    accent: { voice: 'marimba', opts: { notes: [79, 84, 88, 91], dur: 0.9, swish: true }, gain: -12, lead: 0.1, note: 'an accent block wipes in: the person or their decision (ink blocks keep only the swish)' },
    turn: { voice: 'whoosh', opts: { dur: 0.6, lo: 250, hi: 5000 }, gain: -15, lead: 0.05, note: 'the full-width accent wipe; a 64 Hz thud as it covers the frame' },
    stamp: { voice: 'stamp', opts: { freq: 760, to: 130, decay: 0.09 }, gain: -8, note: 'an ink flag or a seal lands; ducks the bed −5 dB' },
    type: { voice: 'typeKey', opts: { rate: 72 }, gain: -20, note: 'a command types (one key every two characters)' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'rim', opts: { freq: 2600 }, gain: -19, note: 'the closing underline on the last downbeat' },
    device: { 'plakat-columns': { voice: 'stamp', opts: { freq: 520, to: 110, decay: 0.08 }, gain: -12, note: 'plus a rim on every third column' },
      'step-wipe': { voice: 'rim', opts: { freq: 1800 }, gain: -16, note: 'one per step, a stamp as it lands' },
      'counter-portal': { voice: 'whoosh', opts: { up: true, lo: 250, hi: 6500 }, gain: -12, note: 'a 58 Hz thud where the push ends' },
      'block-carry': { voice: 'whoosh', opts: { lo: 300, hi: 4200 }, gain: -14, note: 'ink: a 66 Hz thud on the beat; accent: the accent cue\'s marimba' },
      'slot-rails': { voice: 'rim', opts: { freq: 1650 }, gain: -14, note: 'one per word' },
      'aperture-swap': { voice: 'kick', opts: { muted: true, f0: 120, f1: 50, decay: 0.12 }, gain: -16, note: 'with a 3.4 kHz tick per word' } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'poster-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Poster bed', zh: '海报音乐床' }, note: { en: 'plakat: marimba and wood; the bright marimba only for the accent (the person)', zh: 'plakat：马林巴与木鱼；明亮的马林巴只给强调色（人）' } }, opts); },
};

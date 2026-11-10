// data-bed — the sound of the tally style: the `data` bed of lib/audio (F lydian, felt keys and a soft pulse, the
// source film's tempo 112, ±7 %), and one sound for each picture event of the unit bricks: count ticks that thin out
// with the counter's ease, a thud on every landing whose pitch walks up the scale so a run of landings reads as a
// phrase, a chime on the accent, a whoosh on every regroup, a tick per roulette hop and a stamp on the lock.
// From the tally template (assets/templates/tally/score.mjs; timing.rules.js bpm { default 112, min 104, max 120 }).
import { drawTable } from './table.js';

export const SOUND = {
  bed: { preset: 'data', bpm: { default: 112, min: 104, max: 120 }, key: 'F lydian', mix: 'v2',
    kinds: { hook: 'intro', demo: 'build', turn: 'drop', proof: 'drop', rest: 'break', lockup: 'outro' },
    energy: { hook: 0.35, demo: 0.6, turn: 0.8, proof: 0.8, rest: 0.4, lockup: 0.5 }, reading: 'duck' },
  cues: {
    tick: { voice: 'tick', opts: { freq: 3000 }, gain: -19, note: 'count steps, thinning with the ease' },
    land: { voice: 'thud', opts: { freq: 70, walk: 'F lydian' }, gain: -16, send: 0.15, note: 'a band, bar, segment or column lands' },
    accent: { voice: 'chime', opts: { notes: 1 }, gain: -20, note: 'the protagonist lights' },
    turn: { voice: 'whoosh', opts: { dur: 0.35 }, gain: -20, lead: 0.3, note: 'the squares regroup' },
    hit: { voice: 'stamp', opts: {}, gain: -14, note: 'the roulette locks' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'chime', opts: { notes: 3 }, gain: -12 },
    device: { 'rank-sweep': { voice: 'swell', opts: { dur: 1.2 }, gain: -22 }, 'roulette-lock': { voice: 'tick', opts: { freq: 2600 }, gain: -22 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'data-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Data bed', zh: '数据音乐床' }, note: { en: 'tally: landings walk up the scale; the roulette ticks and stamps', zh: 'tally：落点音高沿音阶上行；轮盘逐格嘀嗒、锁定盖章' } }, opts); },
};

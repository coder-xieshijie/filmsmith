// diagram-bed — the sound of the trace style: the `diagram` bed of lib/audio (soft keys over a quiet pulse at 100 BPM),
// with ticks as rows and counts appear, a soft pluck as a pair fuses, a rising-then-falling whoosh round a loop,
// ticks up and down the scale under the token bar, an airy whoosh along a trace, and a quiet glitch under an unseen
// word that resolves, a tick as its last letter locks.
// From the trace template (assets/templates/trace/score.mjs; timing.rules.js 100 BPM).
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: 'diagram', bpm: { default: 100, min: 92, max: 108 }, key: 'C major', mix: 'v2',
    kinds: { hook: 'intro', problem: 'build', demo: 'build', proof: 'break', climax: 'drop', claim: 'outro' },
    energy: { hook: 0.3, problem: 0.45, demo: 0.55, proof: 0.5, climax: 0.8, claim: 0.4 }, reading: 'duck' },
  cues: {
    tick: { voice: 'tick', opts: { freq: 2400, decay: 0.008, noise: 0.15 }, gain: -21, note: 'a row or a count segment appears' },
    land: { voice: 'pluck', opts: { dur: 0.6 }, gain: -20, note: 'a pair fuses into one token' },
    accent: { voice: 'tick', opts: { freq: 2800 }, gain: -22, note: 'the active pair is lit' },
    turn: { voice: 'whoosh', opts: { dur: 0.5, up: true, lo: 320, hi: 3000 }, gain: -25, lead: 0.2, note: 'a loop of steps; a trace across the frame' },
    hit: { voice: 'glitch', opts: { dur: 0.25 }, gain: -26, note: 'an unseen word resolves' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'chime', opts: { notes: 2 }, gain: -16 },
    device: { 'token-sweep': { voice: 'tick', opts: { scale: 'up-down', count: 16 }, gain: -24 }, 'path-type': { voice: 'whoosh', opts: { up: true }, gain: -25 } },
  },
  master: { lufs: -14, tp: -1.5, tone: 'v2' },
};
export default {
  id: 'diagram-bed', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Diagram bed', zh: '图解音乐床' }, note: { en: 'trace: quiet; a pluck per fuse, ticks per count, a whoosh round each loop', zh: 'trace：安静；每次融合一声拨弦，每次计数一声嘀嗒，每轮循环一阵风声' } }, opts); },
};

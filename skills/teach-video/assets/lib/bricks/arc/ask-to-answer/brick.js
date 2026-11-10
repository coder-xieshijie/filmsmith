// ask-to-answer — the arc of a question with a measured answer (the pulse style): the question asked a word a beat,
// run over the real candidates (none passes), why (two or three figures), what changed (asked again on the inverted
// ground), the re-run that locks, the film's one whiteout on the drop, the figures that explain it through the
// answer's counter, and the name. The run into the reveal is the shortest stretch; the scene after it a release.
// From the pulse template (assets/templates/pulse/content.js scene order; the example's lengths at 120 BPM: ask 2.5 +
// 2.5 s, search 4.5 s, data 4 s, ask 2.5 + 1.5 s, search 2.5 s, reveal 4 s at 63 %, data 3.5 s, name 4.5 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [1.5, 3], scenes: { ids: ['anchor-ask'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [1.5, 3], scenes: { ids: ['anchor-ask'] }, optional: true },
    { role: 'demo', sec: [2, 4.5], scenes: { ids: ['hop-search'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [3, 4], scenes: { ids: ['figure-rows'], fits: 'proof' }, optional: true },
    { role: 'turn', sec: [1.5, 3], repeat: [1, 2], scenes: { ids: ['anchor-ask'], fits: 'turn' }, turn: true },
    { role: 'demo', sec: [2, 3], scenes: { ids: ['hop-search'] }, required: true },
    { role: 'climax', sec: [4, 4], scenes: { ids: ['answer-whiteout'], fits: 'climax' }, peak: 'reveal', at: [0.6, 0.85], required: true },
    { role: 'proof', sec: [3, 4], scenes: { ids: ['figure-rows'] }, optional: true },
    { role: 'lockup', sec: [4.5, 6], scenes: { ids: ['name-flip'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [12, 40] },
  peaks: [2, 3],
  bed: { hook: 'build', problem: 'build', demo: 'build', proof: 'break', turn: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: null,
};
export default {
  id: 'ask-to-answer', kind: 'arc',
  arc: ARC,
  summary: 'Ask the question a word a beat, run it over the real candidates, say why it fails, ask what changed, re-run until it locks, slam the answer on the drop, explain it, name it.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Ask to answer', zh: '从提问到答案' }, note: { en: 'a question with a measured answer; one whiteout on the drop (pulse)', zh: '一个有测量答案的问题；全片一次白闪落在 drop 上（pulse）' } }, opts); },
};

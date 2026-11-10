// rule-run — the arc of a mechanism shown by running it (the trace style): the input splits into units, what the
// mechanism counts is shown, one step is run slowly and named, the same step loops faster until it stops, the result
// is counted, an unseen input is replayed through the learned rules (the climax: it generalises), and the thesis is
// set in two lines.
// From the trace template (assets/templates/trace/content.js scene order; lengths at 100 BPM: hook 2.4 s, count 4.2 s,
// step 3.6 s, steps 3 + 3 + 3 s, summary 2.4 s, probe 7.2 s, thesis 3.2 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2, 3], scenes: { ids: ['chip-split'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [3, 5], scenes: { ids: ['weight-histogram'], fits: 'problem' }, required: true },
    { role: 'demo', sec: [3, 4.5], scenes: { ids: ['merge-step'], fits: 'demo' }, required: true },
    { role: 'demo', sec: [2.5, 4], repeat: [1, 3], scenes: { ids: ['merge-step'], fits: 'demo' } },
    { role: 'proof', sec: [2, 3], scenes: { ids: ['count-to-result'], fits: 'proof' }, required: true },
    { role: 'climax', sec: [5, 8], scenes: { ids: ['probe-replay'], fits: 'climax' }, peak: 'reveal', at: [0.6, 0.85], required: true },
    { role: 'claim', sec: [3, 4.5], scenes: { ids: ['thesis-lines'], fits: 'claim' }, peak: 'claim', required: true },
  ],
  length: { sec: [22, 40] },
  peaks: [2, 3],
  bed: { hook: 'intro', problem: 'build', demo: 'build', proof: 'break', climax: 'drop', claim: 'outro' },
  bedPreset: 'diagram',
};
export default {
  id: 'rule-run', kind: 'arc',
  arc: ARC,
  summary: 'Split the input into units, run one step slowly, loop it faster, count the result, replay an unseen input, state the thesis.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Rule run', zh: '规则跑一遍' }, note: { en: 'the picture is the run’s state; one step slow, then the loop (trace)', zh: '画面就是运行状态；先慢放一步，再循环加速（trace）' } }, opts); },
};

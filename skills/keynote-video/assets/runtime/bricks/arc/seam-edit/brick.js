// seam-edit — the arc of a launch told by one movable seam between what is written and what it makes: a request types
// and its caret becomes the seam (hook), a list is picked through beside its results, real lines of a file are paired
// with the frames they made, a command branches into its output and its report, one changed line slides the edited
// render over the frame (climax, on a bar line), and the seam closes on the lock-up. From the split template
// (assets/templates/split/content.js scene order; the mode card's Scenes lengths at 120 BPM).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [3, 4.5], scenes: { ids: ['request-open'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'demo', sec: [3, 5], scenes: { ids: ['pick-list'], fits: 'demo' } },
    { role: 'proof', sec: [2.5, 4], scenes: { ids: ['file-pair'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [3, 4.5], scenes: { ids: ['render-branch'], fits: 'proof' } },
    { role: 'climax', sec: [5, 8], scenes: { ids: ['diff-climax'], fits: 'climax' }, peak: 'claim', at: [0.6, 0.85], required: true },
    { role: 'lockup', sec: [6, 10], scenes: { ids: ['seam-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [16, 36] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', proof: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: 'terminal',
};
export default {
  id: 'seam-edit', kind: 'arc',
  arc: ARC,
  summary: 'The caret becomes a seam; on one side what is written, on the other what it makes; every change is a move of the seam, and one changed line takes the frame over at the climax.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Seam edit', zh: '接缝剪辑' }, note: { en: 'input | result across one seam; the climax is a one-line diff (split)', zh: '一道接缝两边是输入与结果；高潮是一行 diff（split）' } }, opts); },
};

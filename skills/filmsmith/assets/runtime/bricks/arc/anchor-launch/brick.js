// anchor-launch — the arc of a print launch (the halftone style): one anchor (a piece of the product's mark) sits on
// one screen point the whole film; the problem lands beside it, each feature is a word and a field that acts it out,
// a small count is printed reversed out of ink, the last world collapses into the anchor and bursts onto the claim,
// and the camera pulls back to show the anchor was the mark's all along.
// From the halftone template (assets/templates/halftone/content.js scene order; lengths at 120 BPM: hook 2.5 s,
// cards 2–2.5 s each, count 3 s, claim 4 s, lock-up 6 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2, 3.5], scenes: { ids: ['anchor-rise'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'demo', sec: [2, 3], repeat: [2, 6], scenes: { ids: ['field-card'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [2.5, 3.5], scenes: { ids: ['cell-count'], fits: 'proof' } },
    { role: 'climax', sec: [3, 4.5], scenes: { ids: ['burst-claim'], fits: 'climax' }, peak: 'claim', at: [0.7, 0.85], required: true },
    { role: 'lockup', sec: [4.5, 6.5], scenes: { ids: ['mark-pullback'], fits: 'close' }, peak: 'lockup', required: true },
  ],
  length: { sec: [14, 40] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', proof: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: 'press-bed',
};
export default {
  id: 'anchor-launch', kind: 'arc',
  arc: ARC,
  summary: 'An anchor holds one point all film; problem, feature cards with fields, a printed count, a collapse and burst onto the claim, the pull-back into the mark.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Anchor launch', zh: '锚点发布' }, note: { en: 'one printed piece on one point; worlds change round it (halftone)', zh: '一块印刷件钉在一个点上；世界围着它换（halftone）' } }, opts); },
};

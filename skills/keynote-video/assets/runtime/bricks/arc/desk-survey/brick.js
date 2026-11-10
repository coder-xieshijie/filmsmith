// desk-survey — the arc of a launch argued from published evidence laid on one desk: the first print opens at full
// frame and settles into its mount, its claim is read out of it, the camera travels along the row to the product,
// cuts on a value two prints share, measures the gap on the last print's own axis (the climax, in a pause), and rises
// over the whole desk for the name, the address and the pencil's route through everything it pointed at.
// From the exhibit template (assets/templates/exhibit/content.js scene order; the mode card's Scenes lengths at 120
// BPM: open 2 bars, travel 1.75, read 3.25, match 2, measure 1.75, lockup 5.5).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [3, 4.5], scenes: { ids: ['print-open'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'proof', sec: [5.5, 8], scenes: { ids: ['print-read'], fits: 'proof' }, required: true },
    { role: 'demo', sec: [3, 4.5], repeat: [1, 2], scenes: { ids: ['print-travel'], fits: 'demo' } },
    { role: 'turn', sec: [3.5, 5], scenes: { ids: ['value-match'], fits: 'turn' }, turn: true },
    { role: 'climax', sec: [3, 4.5], scenes: { ids: ['gap-measure'], fits: 'climax' }, peak: 'claim', at: [0.6, 0.8] },
    { role: 'lockup', sec: [8, 12], scenes: { ids: ['desk-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [24, 48] },
  peaks: [2, 3],
  bed: { hook: 'intro', proof: 'build', demo: 'build', turn: 'drop', climax: 'drop', lockup: 'outro' },
  bedPreset: 'swiss',
};
export default {
  id: 'desk-survey', kind: 'arc',
  arc: ARC,
  summary: 'Open on the first print, read its claim, travel to the product, cut on a shared value, measure the gap, rise over the desk for the name.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Desk survey', zh: '桌面勘查' }, note: { en: 'real prints on one desk; one pencil points, measures and retraces its route (exhibit)', zh: '一张桌上的真实截图；一支铅笔圈出、测量、最后重走路线（exhibit）' } }, opts); },
};

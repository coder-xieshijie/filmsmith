// page-read — the arc of the scroll style: the product's own long page read top to bottom as the story. The sheet
// unrolls and its tagline is quoted (the hook); a detent to the intro, its claims quoted (the problem and what it does);
// a reel to a list, which docks row by row (the demo); the row that carries something opens in place (the climax);
// a long reel to the evidence, quoted; a fling back to the top, the name in the hook band, the roll winding up.
// From the scroll template (the source film plan.js SCENES at 120 BPM: open 0–4, quote 4–7,
// quote 7–10, ratchet 10–16, unfold 16–20, quote 20–24, lockup 24–30 s; the climax at 63 %).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [3, 4.5], scenes: { ids: ['sheet-open'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [2.5, 4], repeat: [1, 2], scenes: { ids: ['quote-detent'], fits: 'problem' }, required: true },
    { role: 'demo', sec: [4, 7], scenes: { ids: ['row-ratchet'], fits: 'demo' }, turn: true, optional: true },
    { role: 'climax', sec: [3.5, 5], scenes: { ids: ['row-unfold'], fits: 'climax' }, peak: 'reveal', at: [0.55, 0.8], required: true },
    { role: 'proof', sec: [3, 4], scenes: { ids: ['quote-detent'], fits: 'proof' }, optional: true },
    { role: 'lockup', sec: [5, 6.5], scenes: { ids: ['roll-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [16, 60] },
  peaks: [3, 3],
  bed: { hook: 'intro', problem: 'build', demo: 'build', climax: 'drop', proof: 'build', lockup: 'outro' },
  bedPreset: 'thread',
};
export default {
  id: 'page-read', kind: 'arc',
  arc: ARC,
  summary: 'Read the product\'s own page top to bottom: unroll it and quote the tagline, quote its claims, dock its list row by row, open the row that carries the proof, quote the evidence, fling back to the top and roll it up under the name.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Page read', zh: '读一页长卷' }, note: { en: 'the product\'s own page as the story; one unfold at the climax (scroll)', zh: '产品自己的长页面就是故事；高潮处展开一行（scroll）' } }, opts); },
};

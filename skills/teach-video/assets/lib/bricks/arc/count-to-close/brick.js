// count-to-close — the arc of a data story told by counting (the tally style): the set is counted into a grid of
// squares, the same squares re-sort into the answer chapter by chapter (bands, a share, a split, an axis), time is
// read along a timeline and its trend, the long tail is braked through, and the close reduces it to the few numbers
// that matter while a light sweeps by rank. One mark per item from the first frame to the last.
// From the tally template (assets/templates/tally/content.js scene order; timing.rules.js lengths at 120 BPM: count
// 3.5 s, columns 6 s, timeline 2.5 s, trend 3 s, split 5 s, list 4.5 s, close 7.5 s).
import { drawStrip } from './strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [3, 4.5], scenes: { ids: ['unit-count'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'demo', sec: [4, 7], repeat: [1, 3], scenes: { ids: ['unit-bands', 'unit-split', 'unit-axis'], fits: 'demo' }, required: true },
    { role: 'turn', sec: [2, 3.5], scenes: { ids: ['unit-periods'], fits: 'proof' }, turn: true },
    { role: 'proof', sec: [2.5, 4], scenes: { ids: ['unit-periods'] }, optional: true },
    { role: 'rest', sec: [3, 5], scenes: { ids: ['stream-brake'] }, optional: true },
    { role: 'lockup', sec: [5, 8], scenes: { ids: ['unit-close'], fits: 'claim' }, peak: 'lockup', required: true },
  ],
  length: { sec: [16, 40] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', turn: 'drop', proof: 'drop', rest: 'break', lockup: 'outro' },
  bedPreset: 'data',
};
export default {
  id: 'count-to-close', kind: 'arc',
  arc: ARC,
  summary: 'Count the set into squares, re-sort the same squares chapter by chapter, read time and its trend, close on the few numbers that matter.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Count to close', zh: '从计数到收束' }, note: { en: 'one square per item, re-sorted each chapter (tally)', zh: '一格一件事，每章重排同一批方块（tally）' } }, opts); },
};

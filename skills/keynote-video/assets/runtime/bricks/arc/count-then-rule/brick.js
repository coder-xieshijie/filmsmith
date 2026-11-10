// count-then-rule — the arc of a narrated explainer that argues from a count (the terminal-ledger kit): a question is
// asked in a terminal and answered with a count; the work is read and what matters is counted onto a ledger; the
// ledger sorts into the answer (repeat per question); the count reverses a belief (who waits for whom); a figure proves
// it; a rule is stated and marked by hand and by the stamp; the film closes on the recap of its figures. Teach films run
// minutes, not seconds, and their sections follow the narration, so the seconds below are wide.
// From the terminal-ledger kit as the approved film uses it (the source film, 191.9 s:
// a 0–9.7 question, 9.7–15.8 count, 15.8–28 sort, 28–54 who waits, then de.js and ez.js: the second count, the rule, the
// recap). An explainer's "mechanism" and "recap" have no role of their own in SPEC 3.6: mechanism maps to demo, recap
// to lockup.
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [6, 12], scenes: { ids: ['term-count'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [5, 10], scenes: { ids: ['wall-ledger'], fits: 'problem' }, required: true },
    { role: 'demo', sec: [10, 30], repeat: [1, 3], scenes: { ids: ['pile-split'], fits: 'demo' }, required: true },
    { role: 'turn', sec: [4, 10], scenes: { ids: ['session-queue'], fits: 'problem' }, turn: true },
    { role: 'proof', sec: [8, 25], scenes: { ids: ['session-queue', 'pile-split'], fits: 'proof' }, peak: 'reveal' },
    { role: 'claim', sec: [6, 20], scenes: { ids: ['hand-mark', 'seal-stamp'], fits: 'claim' }, peak: 'claim', required: true },
    { role: 'rest', sec: [2, 6], scenes: { fits: 'rest' }, optional: true },
    { role: 'lockup', sec: [6, 15], scenes: { fits: 'lockup' }, required: true },
  ],
  length: { sec: [60, 240] },
  peaks: [2, 4],
  bed: { hook: 'bed', problem: 'bed', demo: 'bed', turn: 'bed', proof: 'bed', claim: 'bed', rest: 'bed', lockup: 'outro' },
  bedPreset: 'narration-pad',
  sound: 'narration-pad',
};
export default {
  id: 'count-then-rule', kind: 'arc',
  arc: ARC,
  summary: 'Ask in a terminal, count the work onto a ledger, sort it into the answer, let the count reverse a belief, state the rule, recap the figures.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Count, then the rule', zh: '先数清，再立规矩' }, note: { en: 'a narrated explainer that argues from a count (terminal-ledger)', zh: '用计数讲道理的解说片（terminal-ledger）' } }, opts); },
};

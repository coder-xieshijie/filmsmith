// claim-steps — the arc of a claim set as a poster series (the plakat style): the problem as a table of facts, the
// claim as input → output, then numbered chapters, each one page of steps or decisions with real material (options,
// documents, a matrix, a verification, the loop with the person at both ends), a rest on how to start, the promise
// restated as the biggest type in the film, and the closing page with the URL.
// From the plakat template (assets/templates/plakat/content.js scene types; the example film at 120 BPM: problem 8 s,
// claim 5 s, chapter 2 s, pages 3–6 s, tagline 3 s, end 5 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [5, 9], scenes: { ids: ['problem-table'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'claim', sec: [4, 6], scenes: { ids: ['input-output'], fits: 'claim' }, peak: 'claim', required: true },
    { role: 'turn', sec: [1.5, 3], repeat: [1, 3], scenes: { ids: ['numeral-chapter'], fits: 'turn' }, required: true },
    { role: 'demo', sec: [3, 7], repeat: [1, 4], scenes: { ids: ['option-pick', 'doc-freeze', 'step-matrix', 'human-loop'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [3, 7], repeat: [0, 2], scenes: { ids: ['verify-band', 'doc-freeze'], fits: 'proof' } },
    { role: 'rest', sec: [3, 6], scenes: { ids: ['install-block'], fits: 'rest' }, optional: true },
    { role: 'climax', sec: [2.5, 4], scenes: { ids: ['poster-tagline'], fits: 'climax' }, peak: 'claim', required: true },
    { role: 'lockup', sec: [4, 6], scenes: { ids: ['poster-end'], fits: 'lockup' }, required: true },
  ],
  length: { sec: [35, 60] },
  peaks: [2, 3],
  bed: { hook: 'build', claim: 'build', turn: 'drop', demo: 'drop', proof: 'drop', rest: 'break', climax: 'drop', lockup: 'outro' },
  bedPreset: 'swiss',
};
export default {
  id: 'claim-steps', kind: 'arc',
  arc: ARC,
  summary: 'Problem as a table of facts, the claim as input → output, numbered chapters of steps with real material, a rest, the promise at full size, the closing page.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Claim and steps', zh: '主张与步骤' }, note: { en: 'one page per idea; the accent only where a person decides (plakat)', zh: '一页一个意思；强调色只给人做决定的地方（plakat）' } }, opts); },
};

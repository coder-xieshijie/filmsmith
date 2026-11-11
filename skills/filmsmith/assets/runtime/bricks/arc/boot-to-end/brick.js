// boot-to-end — the arc of a CLI launch on a phosphor screen: a prompt types the problem and collapses into a point
// of light (the hook), the claim rises under the horizon, chapters of the tool at work (questions and decisions, a
// flow, a count, the run, the pick, the scope), you at both ends, the install under a break, the tunnel into the
// tagline's slit (the climax), and the lock-up typed out of a cursor.
// From the phosphor template (assets/templates/phosphor/content.js scene types, mode card use cases; the reseed demo
// at 124 BPM: boot 5.8 s, hero 3.9 s, pages 5.8–6.3 s, install 5.3 s, tagline 4.8 s, end 4.8 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [5, 9], scenes: { ids: ['prompt-boot'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'claim', sec: [3, 6], scenes: { ids: ['horizon-hero'], fits: 'claim' }, peak: 'claim', required: true },
    { role: 'turn', sec: [1.5, 3], repeat: [1, 4], scenes: { ids: ['chapter-card'], fits: 'turn' }, required: true },
    { role: 'demo', sec: [3, 8], repeat: [1, 4], scenes: { ids: ['qa-pick', 'decide-confirm', 'hub-flow', 'party-count'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [3, 7], repeat: [0, 2], scenes: { ids: ['you-ends', 'party-count'], fits: 'proof' } },
    { role: 'rest', sec: [4, 7], scenes: { ids: ['install-cards'], fits: 'rest' }, optional: true },
    { role: 'climax', sec: [4, 6], scenes: { ids: ['slit-tagline'], fits: 'climax' }, peak: 'claim', required: true },
    { role: 'lockup', sec: [4, 6], scenes: { ids: ['cursor-lockup'], fits: 'lockup' }, required: true },
  ],
  length: { sec: [30, 75] },
  peaks: [2, 3],
  bed: { hook: 'intro', claim: 'build', turn: 'build', demo: 'drop', proof: 'drop', rest: 'break', climax: 'drop', lockup: 'outro' },
  bedPreset: 'terminal',
};
export default {
  id: 'boot-to-end', kind: 'arc',
  arc: ARC,
  summary: 'A prompt types the problem and collapses into a point of light, the claim under the horizon, chapters of the tool at work, the install under a break, the tunnel into the tagline, the lock-up out of a cursor.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Boot to end', zh: '开机到收尾' }, note: { en: 'one terminal session; the cursor opens and closes the film (phosphor)', zh: '一次终端会话；光标开场也收尾（phosphor）' } }, opts); },
};

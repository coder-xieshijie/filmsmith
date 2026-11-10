// dot-to-claim — the arc of the ink style: one dot carries the whole film. A hook of words a beat on swapping
// grounds; the problem slammed (a number, a split, a warp); the guess bursting into the method (the turn); the field
// blooming out of the dot (the break); the name on the first drop with its width jumping; the method on night (steps,
// a number); the verdicts; the claim on the second drop, left through a counter; the dot ending as the cursor.
// From the ink template (assets/templates/ink/content.js order; the example's lengths at 124 BPM: swap 2.4, slam 2.4,
// slam 2.4, warp 1.9, burst 2.4, bloom 3.9, name 3.9, steps 3.4, counter 1.9, swap 2.4, claim 2.9, cta 4.8 s; 34.8 s,
// the claim at 78 %). The bloom stays in the recipe (a baked fluid simulation): without it the turn goes from the
// burst straight to the name through an iris.
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [1.9, 2.9], scenes: { ids: ['word-swap'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [1.9, 2.9], repeat: [1, 3], scenes: { ids: ['dot-slam', 'word-warp'], fits: 'problem' }, required: true },
    { role: 'turn', sec: [1.9, 2.9], scenes: { ids: ['dot-burst'], fits: 'turn' }, turn: true, required: true },
    { role: 'turn', sec: [3.5, 4], scenes: { ids: [] }, optional: true, note: 'the bloom (recipe; template only)' },
    { role: 'climax', sec: [3.5, 4.5], scenes: { ids: ['width-name'], fits: 'climax' }, peak: 'reveal', required: true },
    { role: 'demo', sec: [2.5, 4], scenes: { ids: ['step-dots', 'film-ruler'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [1.9, 4], scenes: { ids: ['count-stop'], fits: 'proof' }, optional: true },
    { role: 'proof', sec: [1.9, 2.9], scenes: { ids: ['word-swap'], fits: 'proof' }, optional: true },
    { role: 'claim', sec: [2.4, 3.5], scenes: { ids: ['claim-portal'], fits: 'claim' }, peak: 'climax', at: [0.7, 0.85], optional: true },
    { role: 'lockup', sec: [3.9, 6], scenes: { ids: ['cursor-close'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [20, 45] },
  peaks: [3, 3],
  bed: { hook: 'build', problem: 'build', turn: 'build', climax: 'drop', demo: 'drop', proof: 'drop', claim: 'drop', lockup: 'outro' },
  bedPreset: 'inkbeat',
};
export default {
  id: 'dot-to-claim', kind: 'arc',
  arc: ARC,
  summary: 'One dot carries the film: words slam on the beat, the guess bursts into the method, the name drops with its width jumping, the method runs on night, the claim lands on the second drop and the dot ends as the cursor.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Dot to claim', zh: '从墨点到断言' }, note: { en: 'one dot carries every cut; two drops, the name and the claim (ink)', zh: '一个墨点串起每次切换；两次 drop：名字和断言（ink）' } }, opts); },
};

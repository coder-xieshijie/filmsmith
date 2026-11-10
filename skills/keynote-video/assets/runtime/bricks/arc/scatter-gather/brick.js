// scatter-gather — the arc of a product that sends work out and brings it back: scattered → threaded → dispatched →
// gathered. A pile of loose work is pierced and reeled in by one thread (the hook); the product names itself from the
// top of the thread; one ask becomes one task and one star, then an evening of them; a job that keeps going becomes a
// constellation (the second peak); its result passes a check; whole – part – whole cards show what stays; the thread
// sweeps the sky and gathers every star into one panel with one "needs you" (the climax, about 83 %); the thread lies
// flat under the claim and winds back into the name. Fixed order; the template's nine required (the mode card's known
// issue: no cut-down yet; the check and the evening are the ones meant to become optional), plus one optional proof
// between the cards and the sweep: the days going on in the same chat (day-after-day, from the original K).
// From the stream template (assets/templates/stream/content.js, sched.js, the mode card's Scenes). Ranges cover the
// example under the library's reading rule (128 BPM, 80.6 s in English: open 14.5 s, intro 7.5 s, ask 6.1 s, evening
// 7.5 s, constellation 10.3 s, verify 5.2 s, cards 10.8 s, close 10.8 s, lock-up 8.0 s) and a full real film (K's
// content with every option and the days: 116.3 s; ask 10.3, evening 11.7, constellation 13.6, verify 10.8, cards 18.3).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [11, 18], scenes: { ids: ['desk-threaded'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'turn', sec: [6, 9], scenes: { ids: ['spine-intro'], fits: 'turn' }, required: true },
    { role: 'demo', sec: [5, 12], scenes: { ids: ['ask-to-star'], fits: 'demo' }, required: true },
    { role: 'demo', sec: [6, 13], scenes: { ids: ['evening-stars'], fits: 'demo' }, required: true },
    { role: 'climax', sec: [9, 16], scenes: { ids: ['job-constellation'], fits: 'climax' }, peak: 'reveal', at: [0.45, 0.6], required: true },
    { role: 'proof', sec: [4, 12], scenes: { ids: ['check-gate'], fits: 'proof' }, required: true },
    { role: 'demo', sec: [10, 20], scenes: { ids: ['strand-cards'], fits: 'demo' }, required: true },
    { role: 'proof', sec: [4, 11], scenes: { ids: ['day-after-day'], fits: 'proof' }, optional: true },
    { role: 'climax', sec: [9, 14], scenes: { ids: ['sky-gather'], fits: 'climax' }, peak: 'reveal', at: [0.78, 0.88], required: true },
    { role: 'lockup', sec: [6, 9], scenes: { ids: ['point-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [75, 120] },
  peaks: [3, 4],
  bed: { hook: 'build', turn: 'intro', demo: 'build', proof: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: 'terminal',
};
export default {
  id: 'scatter-gather', kind: 'arc',
  arc: ARC,
  summary: 'Scattered → threaded → dispatched → gathered: one thread takes over a pile of loose work, sends each task out as a star, checks the results and gathers every star into one panel.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Scatter → gather', zh: '散乱 → 收束' }, note: { en: 'one thread sends work out as stars and gathers it back (stream)', zh: '一根线把事派出去成星，再全部收回（stream）' } }, opts); },
};

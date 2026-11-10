// surface-tour — the arc of a launch told on one device: the screen wakes on the product's own surface, pushes to the
// part that matters, changes surface by feed (or scroll) to the official evidence, lights its rows one by one, lands the
// claim on the bar line in a pause, and turns back (the one flip) to the product at rest for the name and the address.
// From the handset template (assets/templates/handset/content.js scene order; the mode card's Scenes lengths at 120 BPM:
// wake 3 s, push 2.5 s, feed 2.5 s, band 4.5 s for two rows, scroll 3 s, claim 3.5 s, lockup 6.5 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2.5, 4], scenes: { ids: ['screen-wake'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'demo', sec: [2, 3.5], repeat: [1, 3], scenes: { ids: ['screen-push'], fits: 'demo' }, required: true },
    { role: 'turn', sec: [2, 3], scenes: { ids: ['screen-change'], fits: 'turn' }, turn: true },
    { role: 'proof', sec: [4, 8], repeat: [1, 2], scenes: { ids: ['row-band', 'screen-change'], fits: 'proof' } },
    { role: 'climax', sec: [3, 4.5], scenes: { ids: ['screen-push'], fits: 'climax' }, peak: 'claim', at: [0.6, 0.85], required: true },
    { role: 'lockup', sec: [5, 8], scenes: { ids: ['device-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [12, 60] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', turn: 'build', proof: 'drop', climax: 'drop', lockup: 'outro' },
  bedPreset: 'data',
};
export default {
  id: 'surface-tour', kind: 'arc',
  arc: ARC,
  summary: 'Wake the device on the product, push to what matters, change surface to the evidence, light its rows, land the claim, turn back for the name.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Surface tour', zh: '屏幕巡览' }, note: { en: 'one locked-off device; every state on its screen is a real capture (handset)', zh: '一台固定不动的设备；屏幕上每个状态都是真实截图（handset）' } }, opts); },
};

// gate-reel — the arc of a launch told on one strip of film: the strip runs in and brakes on the hook's intertitles,
// two claims are pulled through the gate, a frame of each thing shown passes a beat at a time, one punches to full
// and lands on a contact sheet whose strips are as long as their films, the pencil picks one that runs at full size
// (the climax), and the strip runs out of the gate for the name. From the strip template (assets/templates/strip/
// content.js scene order; the mode card's Scenes lengths at 120 BPM).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2.5, 4], scenes: { ids: ['reel-titles'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'claim', sec: [2, 3.5], scenes: { ids: ['reel-titles'], fits: 'claim' } },
    { role: 'demo', sec: [3, 7], scenes: { ids: ['gate-frames'], fits: 'demo' }, required: true },
    { role: 'turn', sec: [1.5, 2], scenes: { ids: ['frame-punch'], fits: 'turn' }, turn: true },
    { role: 'proof', sec: [3.5, 5], scenes: { ids: ['length-sheet'], fits: 'proof' } },
    { role: 'climax', sec: [3.5, 5], scenes: { ids: ['pick-run'], fits: 'climax' }, peak: 'claim', at: [0.55, 0.8] },
    { role: 'lockup', sec: [6, 9], scenes: { ids: ['reel-lockup'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [16, 40] },
  peaks: [2, 3],
  bed: { hook: 'intro', claim: 'build', demo: 'build', turn: 'break', proof: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: 'thread',
};
export default {
  id: 'gate-reel', kind: 'arc',
  arc: ARC,
  summary: 'Run the strip in on the hook, pull the claims and one frame of each thing through the gate, punch to a contact sheet, pick one to run, run the strip out for the name.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Gate reel', zh: '片门胶片' }, note: { en: 'one strip of real frames through a fixed gate; the pencil picks (strip)', zh: '一条真实画格的胶片穿过固定片门；蜡笔圈选（strip）' } }, opts); },
};

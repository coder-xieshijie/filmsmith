// dimension-climb — the arc of one shape promoted one dimension per scene (the morph style): a point, a line (an
// endpoint), a plane (the request pill, the response card), a solid (the spec as a cube), an interface (the docs
// page, then one card), the live console (the climax: it runs), the mark (the point lands as its dot). The accent
// is handed on like a baton; every scene starts from the exact shape the last one ended on.
// From the morph template (assets/templates/morph/content.js scene order, mode card Scenes: point 1 s, line 2.5 s,
// press 2 s, card 2.5 s each, solid 4 s, unfold 2.5 s, focus 4 s, flood 5.5 s, mark 5.5 s at 120 BPM).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2.5, 4], scenes: { ids: ['point-line'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'demo', sec: [3.5, 5], repeat: [1, 2], scenes: { ids: ['pill-card'], fits: 'demo' } },
    { role: 'turn', sec: [3, 4.5], scenes: { ids: ['hex-solid'], fits: 'turn' }, turn: true, required: true },
    { role: 'demo', sec: [2.5, 4], scenes: { ids: ['cube-page'], fits: 'demo' }, required: true },
    { role: 'demo', sec: [3, 5], scenes: { ids: ['panel-focus'], fits: 'demo' } },
    { role: 'climax', sec: [4.5, 6.5], scenes: { ids: ['run-flood'], fits: 'climax' }, peak: 'reveal', at: [0.65, 0.85] },
    { role: 'lockup', sec: [4.5, 6.5], scenes: { ids: ['mark-command'], fits: 'close' }, peak: 'lockup', required: true },
  ],
  length: { sec: [12, 40] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', turn: 'build', climax: 'drop', lockup: 'outro' },
  bedPreset: 'glass-climb',
};
export default {
  id: 'dimension-climb', kind: 'arc',
  arc: ARC,
  summary: 'One ink shape climbs a dimension per scene: point, line, plane, solid, interface, the live console, the mark.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Dimension climb', zh: '逐级升维' }, note: { en: 'one shape never leaves the frame; the accent is a baton (morph)', zh: '一个形状始终不离画面；强调色像接力棒（morph）' } }, opts); },
};

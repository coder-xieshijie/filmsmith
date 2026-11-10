// zoom-return — the arc of a narrated explainer that teaches one part of a system from its map (the blueprint-zoom kit):
// a question the viewer cannot answer yet; the whole system as one diagram of layers; zoom into one layer, which becomes
// the detail diagram; one task walked through it round by round until it stops; back to the map, the part marked as
// covered, one line to remember; the next part to enlarge named. One part a film (or a series, one part an episode).
// From the blueprint-zoom kit as the approved film uses it (the source film, 49.1 s: 0.8–4.2
// the question, 4.2–12 the map, 12–38 the zoom and the walk, 38–43.4 back and the line to remember, 43.4–49 the next
// part). An explainer's "mechanism" has no role of its own in SPEC 3.6 (it maps to demo); "recap" maps to claim, the
// "next part" teaser to lockup.
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [3, 6], scenes: { fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [6, 10], scenes: { ids: ['layer-overview'], fits: 'problem' }, required: true },
    { role: 'turn', sec: [1, 2], scenes: { ids: ['layer-zoom'] }, turn: true },
    { role: 'demo', sec: [10, 30], repeat: [1, 2], scenes: { ids: ['detail-walk'], fits: 'demo' }, required: true },
    { role: 'climax', sec: [2, 5], scenes: { ids: ['detail-walk'] }, peak: 'reveal', at: [0.6, 0.8] },
    { role: 'claim', sec: [4, 8], scenes: { ids: ['detail-walk', 'layer-overview'], fits: 'claim' }, peak: 'claim', required: true },
    { role: 'lockup', sec: [3, 8], scenes: { ids: ['layer-overview'] }, required: true },
  ],
  length: { sec: [30, 90] },
  peaks: [2, 3],
  bed: { hook: 'intro', problem: 'break', turn: 'break', demo: 'break', climax: 'break', claim: 'break', lockup: 'outro' },
  bedPreset: 'narration-pad',
  sound: 'narration-pad',
};
export default {
  id: 'zoom-return', kind: 'arc',
  arc: ARC,
  summary: 'From the map into one part and back: the whole system as layers, zoom into one, walk one task through it until it stops, return and name the next part.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Zoom and return', zh: '放大再回到总图' }, note: { en: 'teach one part of a system from its map (blueprint-zoom)', zh: '从总图讲系统的一部分（blueprint-zoom）' } }, opts); },
};

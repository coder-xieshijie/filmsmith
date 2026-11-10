// sheet-route — the arc of one engineering drawing drafted sheet by sheet (the blueprint style): the problem as open
// review items, the claim as a general arrangement, details a person settles (stamped, which may issue the print),
// artefacts and machine checks (inspection stamps), the whole drawing with its route and the claim under an approval
// stamp, and the release title block. Two consecutive sheets never share a drawing type.
// From the blueprint template (assets/templates/blueprint/content.js and the lintel demo; 100 BPM: problem 4.8 s,
// arrangement 4.8 s, interface 6 s, detail 6.6 s, stages 5.4 s, checklist 6.6 s, overview 4.2 s, release 4.8 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [4, 6], scenes: { ids: ['review-callouts'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'claim', sec: [4, 6], scenes: { ids: ['general-arrangement'], fits: 'claim' }, required: true },
    { role: 'demo', sec: [4, 7], repeat: [0, 2], scenes: { ids: ['lap-loop', 'exploded-chain', 'parts-list'], fits: 'demo' } },
    { role: 'turn', sec: [6, 8], scenes: { ids: ['detail-confirm'], fits: 'turn' }, required: true },
    { role: 'proof', sec: [6, 8], repeat: [1, 2], scenes: { ids: ['section-cut', 'inspection-record'], fits: 'proof' }, required: true },
    { role: 'climax', sec: [4, 6], scenes: { ids: ['sheet-overview'], fits: 'climax' }, peak: 'claim', at: [0.75, 0.85], required: true },
    { role: 'lockup', sec: [4, 7], scenes: { ids: ['release-block'], fits: 'lockup' }, required: true },
  ],
  length: { sec: [30, 60] },
  peaks: [2, 3],
  bed: { hook: 'intro', claim: 'build', demo: 'drop', turn: 'build', proof: 'drop', climax: 'drop', lockup: 'outro' },
  bedPreset: 'blueprint',
};
export default {
  id: 'sheet-route', kind: 'arc',
  arc: ARC,
  summary: 'Problem as review items, claim as a general arrangement, details a person stamps, machine checks, the whole drawing under an approval stamp, the release.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Sheet route', zh: '图纸路线' }, note: { en: 'one drawing, one camera route; amber only where a person signs (blueprint)', zh: '一张图、一条镜头路线；琥珀色只给人签字的地方（blueprint）' } }, opts); },
};

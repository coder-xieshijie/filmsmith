// evidence-file — the arc of the dossier style: a claim shown where it was published. The cold open lays the first
// exhibit and strikes its claim (the hook); the band moves to the next claims on the same page; each further source
// arrives by a page change (a deal, a turn, a sheet shuffle, a louvre, a match cut on a value printed in both); the
// exhibit opens into a spread and a figure is carried to a worksheet; the result is computed and struck on the drop
// (the climax); an index lists every claim where it was printed; the name is struck on the mat.
// From the dossier template's example (the dossier source film content.js at 120 BPM: exhibit 0–2.5, claim
// 2.5–4.5, claim 4.5–7, exhibit 7–10, exhibit 10–13, exhibit 13–15.5, claim 15.5–18, worksheet 18–22, result 22–26,
// ledger 26–29.5, lockup 29.5–36 s; the climax key at 24 s, 67 %).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [2, 3], scenes: { ids: ['exhibit-strike'], fits: 'hook' }, peak: 'hook', required: true },
    { role: 'problem', sec: [2, 3], repeat: [1, 3], scenes: { ids: ['claim-shift', 'exhibit-strike'], fits: 'problem' }, optional: true },
    { role: 'demo', sec: [2.5, 3.5], repeat: [1, 3], scenes: { ids: ['exhibit-strike'], fits: 'demo' }, turn: true, required: true },
    { role: 'proof', sec: [2, 3], repeat: [1, 2], scenes: { ids: ['claim-shift'], fits: 'proof' }, optional: true },
    { role: 'turn', sec: [3, 4.5], scenes: { ids: ['worksheet-carry'], fits: 'turn' }, optional: true },
    { role: 'climax', sec: [3.5, 4.5], scenes: { ids: ['result-strike'], fits: 'climax' }, peak: 'claim', at: [0.6, 0.8], required: true },
    { role: 'rest', sec: [3, 4], scenes: { ids: ['exhibit-ledger'], fits: 'rest' }, optional: true },
    { role: 'lockup', sec: [4.5, 7], scenes: { ids: ['name-strike'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [15, 45] },
  peaks: [3, 3],
  bed: { hook: 'build', problem: 'build', demo: 'build', proof: 'build', turn: 'build', climax: 'drop', rest: 'outro', lockup: 'outro' },
  bedPreset: 'diagram',
};
export default {
  id: 'evidence-file', kind: 'arc',
  arc: ARC,
  summary: 'Show each claim where it was published: strike it on its page, move to the next claim, change pages by handling paper, carry a figure to a worksheet, strike the computed result on the drop, list every exhibit, strike the name.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Evidence file', zh: '证据档案' }, note: { en: 'every claim struck where it was printed; one carry, one computed result (dossier)', zh: '每条断言都划在它印出来的地方；一次搬运，一个算出的结果（dossier）' } }, opts); },
};

// line-chain — the arc of a video tool's reel as one unbroken transformation: one line becomes everything in turn,
// each link a step the tool really performs. The line types the brief (the open) and the big word swings (the hook);
// the palette, the storyboard, the merge, the curves, the tracks and the ink show the steps; the flood and the film's
// own contact sheet are the climax; the line is cut into the name and types the URL (the lock-up). Fixed order; the
// palette, the curves and the ink may be left out, the head (open and word) and the tail (tracks and review, with the
// curves and the ink) only as wholes: storyboard → merge → close is the shortest film (6 bars).
// From the thread template (assets/templates/thread/content.js, film.js REGISTRY, the mode card's Scenes; the
// example at 120 BPM: 40 s, open 5.5 s, word 2 s, palette 3 s, storyboard 3 s, merge 4 s, curves 3.5 s, tracks 3 s,
// ink 2 s, review 9.5 s, close 4.5 s).
import { drawStrip } from '../count-to-close/strip.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [4, 7], scenes: { ids: ['brief-loop'], fits: 'hook' }, optional: true },
    { role: 'hook', sec: [1.5, 3], scenes: { ids: ['weight-word'], fits: 'hook' }, peak: 'hook', optional: true },
    { role: 'demo', sec: [2, 4], scenes: { ids: ['glyph-swatch'], fits: 'demo' }, optional: true },
    { role: 'demo', sec: [2, 4], scenes: { ids: ['panel-board'], fits: 'demo' }, required: true },
    { role: 'demo', sec: [3.5, 5], scenes: { ids: ['sphere-merge'], fits: 'demo' }, required: true },
    { role: 'demo', sec: [3, 4.5], scenes: { ids: ['ease-ruler'], fits: 'demo' }, optional: true },
    { role: 'demo', sec: [2.5, 4], scenes: { ids: ['edit-tracks'], fits: 'demo' }, optional: true },
    { role: 'rest', sec: [2, 3], scenes: { ids: ['ink-words'], fits: 'claim' }, optional: true },
    { role: 'climax', sec: [8, 11], scenes: { ids: ['sheet-flood'], fits: 'climax' }, peak: 'reveal', optional: true },
    { role: 'lockup', sec: [4, 7], scenes: { ids: ['name-cut'], fits: 'lockup' }, peak: 'lockup', required: true },
  ],
  length: { sec: [12, 45] },
  peaks: [2, 3],
  bed: { hook: 'intro', demo: 'build', rest: 'break', climax: 'drop', lockup: 'outro' },
  bedPreset: 'thread',
};
export default {
  id: 'line-chain', kind: 'arc',
  arc: ARC,
  summary: 'One line becomes everything in turn: it types the brief, the word swings, the steps of the tool are shown link by link, the line floods into the film\'s own contact sheet, and it is cut into the name and types the URL.',
  draw(ctx, opts) { drawStrip(ctx, ARC, { title: { en: 'Line chain', zh: '一线到底' }, note: { en: 'one unbroken transformation; every link is a step the tool performs (thread)', zh: '一次不断的变形；每一环都是工具真做的一步（thread）' } }, opts); },
};

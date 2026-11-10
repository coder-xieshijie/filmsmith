// value-match — one value printed in two sources: the ring draws round it on this print, the camera pushes in, cuts
// on a still frame to the same value in the next print and pulls back (match-cut); the ring stays round the value
// it landed on. From the exhibit template (choreo.js match: the ring in 1 beat, the move 2 beats, the cut half way).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('match');

export default {
  id: 'value-match', kind: 'scene',
  fits: ['proof', 'turn'],
  beats: { min: 5, max: 12 },
  needs: { motions: ['match-cut'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary',  limits: CAPTION_LIMITS },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 2, from: 1, fromBox: SAMPLE_BOXES.r1, toBox: SAMPLE_BOXES.r2, keepRing: true, held: [{ print: 1, text: zh ? '先在 Northwind 上线。' : 'Ships first in Northwind.' }], caption: zh ? '成本图上也有它。' : 'Named on the cost chart.', desk: 'plain', seed: 3 }; },
  ...body,
};

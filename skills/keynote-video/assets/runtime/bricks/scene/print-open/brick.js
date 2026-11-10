// print-open — the film opens on a real print at full frame: it holds a beat at the zoom cap, then the camera rises
// and the print's mount grows round it (bezel-pullback) until it lies on the desk at rest, its source on the bar; its
// chip (if any) is read, then the caption is set down under the print word by word at reading pace.
// From the exhibit template (choreo.js open: the rise 1–3 beats, the caption half a beat after the landing; moves.js
// bezel-pullback adapter).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('open');

export default {
  id: 'print-open', kind: 'scene',
  fits: ['hook', 'proof'],
  beats: { min: 5, max: 12 },
  needs: { motions: ['bezel-pullback'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary',  limits: CAPTION_LIMITS },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 0, from: null, held: [], caption: zh ? '在真实工作上评分。' : 'Scored on real work.', desk: 'plain', seed: 3 }; },
  ...body,
};

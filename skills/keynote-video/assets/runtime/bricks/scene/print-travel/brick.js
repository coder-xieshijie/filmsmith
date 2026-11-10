// print-travel — the camera goes to another print on the desk: it slides along the row with parallax (the numeral
// behind at 0.3, the chip in front at 1.65; parallax-slide, default), trucks across (camera-truck), or pulls back to
// the whole desk, hops and dives (grid-hop, 3 beats); the earlier captions stay on the desk, stepped back; the landed
// print's chip and then the caption are read. From the exhibit template (choreo.js travel; moves.js travel adapters).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('travel');

export default {
  id: 'print-travel', kind: 'scene',
  fits: ['demo', 'proof'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['parallax-slide', 'camera-truck', 'grid-hop'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary',  limits: CAPTION_LIMITS },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 1, from: 0, move: 'parallax-slide', held: [{ print: 0, text: zh ? '三行都是第一。' : 'First place in three rows.' }], caption: zh ? '先在 Northwind 上线。' : 'Ships first in Northwind.', desk: 'plain', seed: 3 }; },
  ...body,
};

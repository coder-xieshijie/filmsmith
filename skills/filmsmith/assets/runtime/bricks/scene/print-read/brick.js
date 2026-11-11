// print-read — the claim of a print is read out of it: one to three pencil rings draw round its cells half a beat
// apart, then the cells lift out and turn to code-drawn readings (lift-out), each card widening to take its label;
// while a card is read the others step back, its note enters a beat in, the caption follows; at the end the readings
// go back into the print and the rings come off. At most twice a film.
// From the exhibit template (choreo.js read: rings 0.5 beat apart drawing in 1.5, lift-out 2 beats, back 1, unring
// 0.5; moves.js lift-out adapter with the notes' widening).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('read');

export default {
  id: 'print-read', kind: 'scene',
  fits: ['proof', 'claim', 'demo'],
  beats: { min: 8, max: 24 },
  needs: { motions: ['lift-out'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary',  limits: CAPTION_LIMITS },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
    cells: { type: 'list', count: [1, 3], sample: 'default', of: { value: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 8 }, zh: { chars: 6 } } }, label: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 18 }, zh: { chars: 9 } } }, note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } } } },
  },
  defaults: (ctx = {}) => {
    const zh = ctx.lang === 'zh', L = zh ? [['第一项基准', '七家中第一'], ['第二项基准', '六家中并列第一'], ['第三项基准', '五家中第一']] : [['first benchmark', '1st of 7, vendor-reported'], ['second benchmark', 'tied 1st of 6'], ['third benchmark', '1st of 5']];
    const cells = [['r0', '62.8'], ['r1', '76.2'], ['r2', '60.3']].map(([b, value], k) => ({ box: SAMPLE_BOXES[b], glyph: SAMPLE_GLYPHS[b], value, label: L[k][0], note: L[k][1] }));
    return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 0, from: null, held: [{ print: 0, text: zh ? '在真实工作上评分。' : 'Scored on real work.' }], cells, caption: zh ? '三行都是第一。' : 'First place in three rows.', desk: 'plain', seed: 3 };
  },
  ...body,
};

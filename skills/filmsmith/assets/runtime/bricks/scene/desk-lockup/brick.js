// desk-lockup — the close: the camera rises over the whole desk (2 beats); the name settles on the desk under the
// row (with an optional mark above it), its line is set down, the address types at 24 characters a second; a rule
// draws under the name and the pencil's route joins every region the ring visited; a bar before the end the last
// ring closes round the address. From the exhibit template (choreo.js lockup; film.js lockup; layout.js overview).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('lockup');

export default {
  id: 'desk-lockup', kind: 'scene',
  fits: ['lockup'],
  beats: { min: 10, max: 24 },
  needs: { motions: ['ring-route'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 3, chars: 16 }, zh: { chars: 8 } } },
    line: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 7, chars: 40 }, zh: { chars: 18 } } },
    url: { type: 'text', tier: 'primary', sample: 'default', limits: { en: { words: 1, chars: 34 }, zh: { chars: 34 } } },
    mark: { type: 'image', crop: true, optional: true },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 2, from: 2, held: zh ? [{ print: 0, text: '三行都是第一。' }, { print: 1, text: '先在 Northwind 上线。' }, { print: 2, text: '对手约 20 倍的成本。' }] : [{ print: 0, text: 'First place in three rows.' }, { print: 1, text: 'Ships first in Northwind.' }, { print: 2, text: 'The rival: ~20× the cost.' }], route: [{ print: 0, box: SAMPLE_BOXES.r0 }, { print: 1, box: SAMPLE_BOXES.r1 }, { print: 2, box: SAMPLE_BOXES.r2 }], mark: null, name: 'Northwind', line: zh ? '每次构建都有实测。' : 'Every build, measured.', url: 'northwind.dev/download', caption: '', desk: 'plain', seed: 3 }; },
  ...body,
};

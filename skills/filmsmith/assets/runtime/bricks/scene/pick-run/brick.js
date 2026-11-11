// pick-run — the climax: the grease pencil loops one cell of the contact sheet (1 beat), the other rows step back,
// the ringed cell punches to the full frame (sheet-pick, 1 beat) and the picked film runs at full size from that
// moment, every frame, then shrinks into the gate of the closing reel (gate-punch, out). From the strip template
// (choreo.js pick; film.js sheetScene loop, pick, run, backIn).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('pick');

export default {
  id: 'pick-run', kind: 'scene',
  fits: ['climax', 'demo'],
  beats: { min: 5, max: 16 },
  needs: { motions: ['sheet-pick', 'pencil-loop'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    rows: { type: 'list', count: [1, 10], sample: 'default', of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } }, image: { type: 'image', crop: true, optional: true } } },
  },
  defaults: (ctx = {}) => ({ rows: SAMPLE_ROWS, cell: { row: 7, cell: 3 }, run: { frames: [{ n: 2 }, { n: 3 }, { n: 4 }], fps: 1.5 }, caption: ctx.lang === 'zh' ? '选一种风格。' : 'Pick a style.', seed: 3 }),
  ...body,
};

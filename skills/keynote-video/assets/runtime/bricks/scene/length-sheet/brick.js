// length-sheet — the contact sheet: every film as a strip of its frames (one per 4 s) as long as the film; the longer
// strips pull out to their lengths one after another, the measured lengths set at the row ends, a caption under
// the sheet and a second one with the lengths. From the strip template (choreo.js sheet: the pull-out from beat 2,
// 0.1 beat between rows, 0.75 each; the lengths a quarter beat after the second caption; film.js sheetState).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('sheet');

export default {
  id: 'length-sheet', kind: 'scene',
  fits: ['proof', 'demo'],
  beats: { min: 4, max: 14 },
  needs: { motions: ['row-pull'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 2], sample: 'default', of: { text: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 34 }, zh: { chars: 16 } } } } },
    rows: { type: 'list', count: [1, 10], sample: 'default', of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } }, image: { type: 'image', crop: true, optional: true } } },
  },
  defaults: (ctx = {}) => ({ rows: SAMPLE_ROWS, lines: ctx.lang === 'zh' ? [{ text: '长度跟着内容走。' }, { text: '每次渲染都量过。' }] : [{ text: 'Length follows the content.' }, { text: 'Every render is measured.' }] }),
  ...body,
};

// frame-punch — the frame in the gate punches to the full frame (gate-punch, in, 1 beat), holds a beat at full size,
// and shrinks into its cell on the contact sheet laid underneath (gate-punch, out, 1 beat): the frame is the one
// object the eye follows from the reel to the sheet. From the strip template (choreo.js punch; film.js punchIn,
// punchOut).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('punch');

export default {
  id: 'frame-punch', kind: 'scene',
  fits: ['turn', 'demo'],
  beats: { min: 3, max: 4 },
  needs: { motions: ['gate-punch'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    frame: { type: 'image', crop: true, optional: true, sample: 'default' },
    rows: { type: 'list', count: [1, 10], sample: 'default', of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } }, image: { type: 'image', crop: true, optional: true } } },
  },
  defaults: () => ({ frame: { n: 4 }, before: { n: 3 }, rows: SAMPLE_ROWS, cell: { row: 7, cell: 5 } }),
  ...body,
};

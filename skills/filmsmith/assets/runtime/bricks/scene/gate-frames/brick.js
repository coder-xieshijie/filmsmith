// gate-frames — one real frame of each film through the gate, a claw pull-down a beat, its name under the gate while
// it is registered: the films shown as one reel. From the strip template (choreo.js frames: a landing every beat,
// the caption from the landing to the next pull-down; film.js reelS).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('frames');

export default {
  id: 'gate-frames', kind: 'scene',
  fits: ['demo', 'proof'],
  beats: { min: 2, max: 16 },
  needs: { motions: ['strip-advance'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    frames: { type: 'list', count: [1, 12], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } } } },
  },
  defaults: () => ({ frames: SAMPLE_FRAMES, before: null }),
  ...body,
};

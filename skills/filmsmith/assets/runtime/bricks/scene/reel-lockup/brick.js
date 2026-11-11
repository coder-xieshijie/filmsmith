// reel-lockup — the close: a source frame (the repository page, the download page) is pulled into the gate, a line
// under it; the strip runs out of the gate (strip-advance, run-out, 1.5 beats) and its cut end passes; the name
// settles on the light box, the address types; on the last bar the pencil underlines it. From the strip template
// (choreo.js lockup; film.js reelS run-out, lockupText).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('lockup');

export default {
  id: 'reel-lockup', kind: 'scene',
  fits: ['lockup'],
  beats: { min: 8, max: 20 },
  needs: { motions: ['strip-advance', 'pencil-loop'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    source: { type: 'image', crop: true, optional: true, sample: 'default' },
    line: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 6, chars: 34 }, zh: { chars: 16 } } },
    name: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
    url: { type: 'text', tier: 'primary', sample: 'default', limits: { en: { words: 1, chars: 40 }, zh: { chars: 40 } } },
  },
  defaults: (ctx = {}) => ({ before: { n: 4 }, source: { n: 1 }, line: ctx.lang === 'zh' ? '任何编码 agent 里都能跑。' : 'Runs in any coding agent.', name: 'Northwind', url: 'github.com/northwind/reel' }),
  ...body,
};

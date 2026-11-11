// reel-titles — intertitles on the strip: each line is a title frame set in the film, pulled into the gate by one claw
// pull-down (a quarter beat) and held while it is read; the first scene of a film runs the strip in and brakes onto
// the first title (strip-advance, brake, 2 beats); a line may light the optical track under it, swept left to right.
// From the strip template (choreo.js titles: each line's slot its reading plus the pull-down, on a quarter-beat grid,
// at least a beat; holds stretch up to 2 beats; film.js reelS, the track).
import { sceneBody, SAMPLE_ROWS, SAMPLE_FRAMES } from '../../prop/film-strip/scenes.js';
const body = sceneBody('titles');

export default {
  id: 'reel-titles', kind: 'scene',
  fits: ['hook', 'claim'],
  beats: { min: 2, max: 16 },
  needs: { motions: ['strip-advance'], props: ['film-strip', 'contact-sheet'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 4], of: { text: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 8 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { lines: zh ? [{ text: '十种方式' }, { text: '拍你的' }, { text: '代码。', track: true }] : [{ text: 'Ten ways' }, { text: 'to film' }, { text: 'your code.', track: true }], run: false, fill: [], before: null, hook: true }; },
  ...body,
};

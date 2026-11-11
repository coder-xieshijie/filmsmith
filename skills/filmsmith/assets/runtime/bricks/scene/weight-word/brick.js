// weight-word — the big word of the chain: its letters spring in on 1/32 notes (ω 20, rising 180 px) and its weight swings
// 780 → 200 → 800 → 430 on beats 2–4; its full stop is the line colour. The hook (T3) of the full chain.
// From the thread template: film.js word, WORD. Chinese: four characters and a full stop (the four glyph boxes the
// swatches take), Noto Sans SC, whose variable weight swings the same way.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'weight-word', type: 'word',
  fits: [ 'hook' ],
  beats: { min: 2, max: 6 },
  slots: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 8 }, zh: { chars: 5 } } } },
  DEFAULT: {
    en: { stage: null, word: 'Plan.', before: [], after: [] },
    zh: { stage: null, word: '先做计划。', before: [], after: [] },
  },
  motions: [ 'weight-swing' ],
  motion: "the letters spring in; the weight swings on the beats; the full stop is the line colour",
  shots: [ 'word' ],
});

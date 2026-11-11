// ink-words — the ink link: the full-height line dissolves into two marbled dyes curling outward (WebGL, gl.js ink), the centre
// kept darker, and up to three serif words rise over it one after another.
// From the thread template: film.js ink, shots.js inkState. Chinese: the words are the word segmenter's (纯 / 代码),
// set upright in Noto Serif SC (no italic in Chinese).
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'ink-words', type: 'ink',
  fits: [ 'claim', 'demo' ],
  beats: { min: 4, max: 8 },
  slots: { words: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 14 }, zh: { chars: 6 } } } },
  DEFAULT: {
    en: { stage: { name: 'Output', note: 'no camera and no stock footage' }, words: 'pure code', before: [], after: [] },
    zh: { stage: { name: '输出', note: '没有摄像机也没有素材' }, words: '纯代码', before: [], after: [] },
  },
  motions: [],
  motion: "the line dissolves into marbled ink; the words rise over its dark centre",
  shots: [ 'ink' ],
});

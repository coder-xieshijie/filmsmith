// name-cut — the close of the chain: the ground opens out of the line, the line settles under the name's place, thickens into a
// bar and a blade cuts the bar into the name in the line colour (runtime hand-off rail-press, phase cut: the lock-up);
// the band contracts into the caret, which types the URL; the closing line enters; on the last downbeat the caret
// falls flat into the URL's underline.
// From the thread template: film.js close, urlGeo; shots.js CLOSE, closeSecondMove. Chinese: the closing line upright
// in Noto Serif SC (20 characters); the name and the URL stay Latin.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'name-cut', type: 'close',
  fits: [ 'lockup' ],
  beats: { min: 9, max: 14 },
  slots: { name: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 16 }, zh: { chars: 8 } } }, line: { type: 'text', tier: 'primary', limits: { en: { words: 9, chars: 52 }, zh: { chars: 20 } } }, url: { type: 'code', tier: 'primary', limits: { en: { chars: 52 }, zh: { chars: 52 } } } },
  DEFAULT: {
    en: { stage: null, name: 'filmsmith', line: 'Every film is code: scored, timed and checked.', url: 'github.com/coder-xieshijie/filmsmith', before: [], after: [] },
    zh: { stage: null, name: 'filmsmith', line: '每部片都是代码：配乐、计时、检查。', url: 'github.com/coder-xieshijie/filmsmith', before: [], after: [] },
  },
  motions: [ 'caret-fall' ],
  motion: "the ground opens from the line; a blade cuts the line into the name; the band becomes the caret; the URL is typed; the caret falls flat under it",
  shots: [ 'name' ],
});

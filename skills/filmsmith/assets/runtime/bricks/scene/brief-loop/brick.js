// brief-loop — the open of the chain: a line draws from the centre and becomes the caret, which types the brief's first phrase and
// falls flat under it in two moves (never crossing the text); with a second phrase the line rolls up a loop and carries
// the first phrase round and out while the second follows it in (runtime hand-off path-type, 2 beats), then tightens
// under the last phrase, contracts into the caret, and the caret takes the letters back, last letter first.
// From the thread template: film.js open, shots.js OPEN and openPlan. Chinese: the brief in Noto Sans SC after the
// mono (12 characters a phrase), typed by character; the loop carries it the same way.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'brief-loop', type: 'open',
  fits: [ 'hook', 'demo' ],
  beats: { min: 6, max: 14 },
  slots: { brief: { type: 'list', count: [ 1, 2 ], of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } } } },
  DEFAULT: {
    en: { stage: { name: 'Prompt', note: 'one sentence sets the brief' }, brief: [ 'explain our pipeline', 'in {seconds} seconds' ], before: [], after: [ { type: 'word', word: 'Plan.' } ] },
    zh: { stage: { name: '提示', note: '一句话定下需求' }, brief: [ '讲清我们的流程', '只用 {seconds} 秒' ], before: [], after: [ { type: 'word', word: '先做计划。' } ] },
  },
  motions: [ 'caret-fall' ],
  motion: "the line draws, becomes the caret, types the brief, falls flat under it; the loop carries the first phrase round and brings the second; the caret takes the letters back",
  shots: [ 'brief', 'loop' ],
});

// scroll-fling — the whole page travels back to its top in two beats: the "scroll to top" of a long page. It is
// scroll-reel with the fling curve: the offset accelerates, peaks a sixth of the way in and brakes for the rest
// (velocity ∝ p² e^(−kp)), so the eye sees the start of the move, a streak of everything in between, and a long, soft
// brake onto the first section; the last frame moves ≤ 2 px. Section tabs pinned on the way unpin in reverse order by
// themselves (scroll-reel's `sections` are a function of the offset). Theory: the status-bar "scroll to top" of touch
// lists, a known gesture, so the return reads as a return, not as a new place; motion streaks record speed
// (Geisler 1999). Same params and paint as scroll-reel (`window`, `chrome`, `items` / `asset` / `page`, `from`, `to`,
// `sections`, `pull`, `scrollbar`), with `curve` 'fling', `fling.k` 12 and no pull-back by default (its last frames
// would still change scale: pass `pull` with 3 beats or more). `fling(p, k)` is the curve alone.

import { merge } from './util.js';
import reel, { fling } from './scroll-reel.js';

export { fling };

export default {
  ...reel,
  name: 'scroll-fling',
  tier: 'T2',
  beats: 2,
  modes: ['scroll (the return to the top before the lock-up)', 'handset (back to the top of a page)', 'every mode with a long page'],
  from: 'a long page locked deep in, at a late section',
  to: 'the same page back at its top',
  interpolates: ['strip offset (fling: accelerate, peak at 1/6, soft brake)', 'content scale (optional pull-back)', 'scrollbar thumb', 'pinned section tabs (unpin in reverse)'],
  summary: 'The page flies back to its top: it accelerates, streaks past everything between and brakes softly onto the first section.',
  theory: 'The scroll-to-top of touch lists: a known gesture, so the return reads as a return; motion streaks record speed (Geisler 1999).',
  defaults: merge(reel.defaults, { curve: 'fling', pull: 0, from: { item: 0, y: 5200 }, to: { item: 0, y: 0, mark: null } }),
};

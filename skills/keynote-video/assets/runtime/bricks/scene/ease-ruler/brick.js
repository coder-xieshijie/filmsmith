// ease-ruler — the curves link: the sphere squashes into the rod, the rod drops onto the merge's stage name and presses it into
// itself on the beat (runtime hand-off rail-press, phase press), recovers as the beat ruler with ticks, and four
// easing curves (ω 12, 20, 30, 40) draw over it with their riders and the spring formula.
// From the thread template: film.js curves, easingGraph, railDraw; shots.js PRESS, RIDE. Chinese: the pressed name
// is Chinese (Noto Sans SC 800); the formula and the ω labels stay Latin.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'ease-ruler', type: 'curves',
  fits: [ 'demo' ],
  beats: { min: 4, max: 10 },
  slots: {},
  DEFAULT: {
    en: { stage: { name: 'Physics', note: 'springs settle on the beat' }, before: [ { type: 'merge', stage: { name: 'Physics', note: 'volume and light, computed per frame' } } ], after: [] },
    zh: { stage: { name: '物理', note: '弹簧落在拍点上' }, before: [ { type: 'merge', stage: { name: '物理', note: '体积与光逐帧计算' } } ], after: [] },
  },
  motions: [],
  motion: "the sphere becomes the rod; the rod presses the stage name into itself; the ruler; four easing curves with riders",
  shots: [ 'ruler' ],
});

// panel-board — the storyboard link: swatches (or the word's glyphs, or the line itself when it opens the film) grow into six
// 16:9 panels, sketches draw in them (the word, the line, the merge's first frame, a curve, tracks, a sheet), panel 3
// is chosen with an outline in the line colour; the centre stage name. As the first link (no head) the line is cut
// into four segments that open into panels, nearest first.
// From the thread template: film.js drawBoard, sketch, segEnvelope. Chinese: the board's title sketch takes the word.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'panel-board', type: 'storyboard',
  fits: [ 'demo' ],
  beats: { min: 3, max: 8 },
  slots: {},
  DEFAULT: {
    en: { stage: { name: 'Boards', note: 'six panels before anything moves' }, before: [], after: [ { type: 'merge' } ] },
    zh: { stage: { name: '分镜', note: '动之前先画六格分镜' }, before: [], after: [ { type: 'merge' } ] },
  },
  motions: [],
  motion: "swatches, glyphs or the line grow into six panels; sketches draw; panel 3 is outlined",
  shots: [ 'board' ],
});

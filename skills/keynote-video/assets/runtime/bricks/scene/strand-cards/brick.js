// strand-cards — whole – part – whole: three strands fork from the spine and each ends in a glass card that lands on it;
// each card is enlarged in turn in place on its strand, its rows arriving, and the next grows as the previous shrinks (the
// zoom never returns to an empty frame); then the three again and a sub-line. From the stream template: film.js
// renderCards, cardGeo; sched.js cards.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'strand-cards', type: 'cards',
  fits: ['demo', 'proof'],
  beats: { min: 20, max: 56 },
  slots: {
    caption: text('caption', 'primary'),
    caption2: text('caption', 'primary'),
    // per card, optional: a caption while it is open (`say`), a line that flows along its strand and becomes its last row
    // (`flow`), a new task hooked off the spine that reads it and leaves as a star (`task`); rows + flow ≤ 5
    cards: { type: 'list', count: [3, 3], of: { title: text('cardTitle', 'glance'), sub: text('cardSub', 'glance'), rows: { type: 'list', count: [1, 5], of: text('cardRow', 'glance') },
      say: text('caption', 'primary', { optional: true, sample: 'default' }), flow: text('cardRow', 'glance', { optional: true, sample: 'default' }), task: { type: 'group', optional: true, of: { title: text('row', 'glance'), detail: text('rowSub', 'glance', { optional: true, sample: 'default' }) } } } },
    // optional: first the earlier tasks' beams knot into a tangle and the thread pulls three strands out of it (6 beats)
    tangle: { type: 'flag', default: false, optional: true },
  },
  reads: (s) => [s.caption, ...s.cards.map((c) => c.say), s.caption2], // primary; titles, rows, flow and task are glanced (sched.js)
  motions: ['strand-zoom'], props: ['hung-block'],
  motion: 'strands fork into three cards; each enlarges in place with its rows, handing over to the next; the three again',
  shots: ['whole', 'part', 'part', 'part', 'whole'],
});

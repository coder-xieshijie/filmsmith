// evening-stars — one evening of asks: the chat block lowers and a task list grows out beside it; every ask the user sends
// adds a running row and launches a star from that row's ring; then a burst of unnamed tasks (those past the film's
// `ui.cap` queued, else the last two: a dashed ring that does not spin and a half-bright star) and the list's counts. The "too many to read" is the point.
// From the stream template: film.js renderEvening, listScrollEased, the stars of renderBG; sched.js evening.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'evening-stars', type: 'evening',
  fits: ['demo', 'proof'],
  beats: { min: 12, max: 36 },
  slots: {
    caption: text('caption', 'primary'),
    // a row gets a second line (`progress`, "running · …") and an ask a file chip (`file`) when given
    asks: { type: 'list', count: [3, 8], of: { ask: text('bubble', 'glance'), task: text('row', 'glance'), file: text('file', 'glance', { optional: true, sample: 'default' }), progress: text('rowSub', 'glance', { optional: true, sample: 'default' }) } },
    more: { type: 'number', min: 0, max: 16, sample: 'default' },
    // optional: the list's filter tabs (all, needs you, running, done, queued) under its title
    tabs: { type: 'flag', default: false, optional: true },
    // optional: the asks' file chips inside their bubbles, over the text (ui-kit's message with an attachment)
    fileInBubble: { type: 'flag', default: false, optional: true },
    // optional: one quoted addition sent along a beam to the star of the ask it adds to (`to`, an index into asks); after
    // the burst, or between the asks with `after` (the ask it follows, at or after `to`)
    followUp: { type: 'group', optional: true, of: { caption: text('caption', 'primary'), quote: text('quote', 'glance'), text: text('bubble', 'glance'), to: { type: 'number', min: 0, max: 7 }, after: { type: 'number', min: 0, max: 7, optional: true }, tag: text('label', 'glance', { optional: true, sample: 'default' }) } },
  },
  reads: (s) => [s.caption, s.followUp?.caption], // primary; the rest is glanced (sched.js)
  motions: ['star-launch'], props: ['hung-block'],
  motion: 'the block lowers and grows a list; each ask adds a row that launches a star; a burst; the list counts',
  shots: ['list', 'burst'],
});

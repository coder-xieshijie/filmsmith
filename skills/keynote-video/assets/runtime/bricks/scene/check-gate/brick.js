// check-gate — done means checked: a gate (a vertical stroke of the thread) rises from its middle; the item, hung on a
// beam from the chat block, slides up to it, is stopped with a white flash and sent back ("not passed" in grey), is
// reworked (its ring runs), slides through and is ringed in the accent ("checked"); then the chat block folds back into
// the spine. From the stream template: film.js renderVerify; sched.js verify.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'check-gate', type: 'verify',
  fits: ['proof'],
  beats: { min: 10, max: 34 },
  slots: {
    caption: text('caption', 'primary'),
    gate: text('word', 'glance'),
    item: text('label', 'glance'),
    fail: text('labelSub', 'glance'),
    pass: text('labelSub', 'glance'),
    // optional: the product says in the chat why it was sent back
    explain: text('bubble', 'glance', { optional: true, sample: 'default' }),
    // optional: the relation graph after the fold: arcs from the thread to one node (`outs`, 3–6, what the product does
    // to it), one thick arc back (`back`), with two captions
    graph: { type: 'group', optional: true, of: { caption: text('caption', 'primary'), node: text('label', 'glance'), outs: { type: 'list', count: [3, 6], of: text('labelSub', 'glance') }, back: text('labelSub', 'glance'), caption2: text('caption', 'primary') } },
  },
  reads: (s) => [s.caption, s.graph?.caption, s.graph?.caption2], // primary; the rest is glanced (sched.js)
  props: ['hung-block'],
  motion: 'a gate rises; the item is stopped, sent back, reworked and passed; the chat block folds into the spine',
  shots: ['gate', 'pass'],
});

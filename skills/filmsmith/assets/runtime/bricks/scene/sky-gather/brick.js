// sky-gather — one thread gathers everything (the climax): the spine retracts into the mascot, the thread sweeps the sky in
// three passes catching every star it passes, straightens, the caught stars ride it into its end, and that point opens
// into the task panel (every task, one row "needs you" in the accent's ink, its pill pulsing once); a nudge hangs on the
// tether; then the thread lies flat as the baseline of the claim and its three words, and winds back into the mascot.
// From the stream template: film.js renderClose; sched.js close; plan.js GATHER.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'sky-gather', type: 'close',
  fits: ['climax', 'claim'],
  beats: { min: 20, max: 36 },
  slots: {
    caption: text('caption', 'primary'),
    // the panel's optional interface parts: its title as a space chip with a queued filter (`head`, as ui-kit's space
    // header), the "needs you" grey until the alert, then warn with a pulse (`warnAtNeed`), tabs on the title line (`tabs`, 2–3, the first current), a group header where a
    // row's `group` changes, a time at a row's end (`time`)
    panel: { type: 'group', of: { title: text('row', 'glance'), head: { type: 'flag', default: false, optional: true }, warnAtNeed: { type: 'flag', default: false, optional: true }, tabs: { type: 'list', count: [2, 3], optional: true, sample: 'default', of: text('tab', 'glance') },
      rows: { type: 'list', count: [2, 4], of: { title: text('row', 'glance'), status: { type: 'enum', options: ['needs', 'done'] }, detail: text('rowSub', 'glance'), group: text('rowSub', 'glance', { optional: true, sample: 'default' }), time: text('time', 'glance', { optional: true, sample: 'default' }) } } } },
    nudge: text('rowSub', 'glance'),
    // optional: a second chapter line after the "needs you", once the first is read
    caption2: text('caption', 'primary', { optional: true }),
    claim: text('claim', 'primary', { claim: true }),
    words: { type: 'list', count: [3, 3], of: text('word', 'word') },
  },
  reads: (s) => [s.caption, s.caption2, s.claim, s.words.join(' ')], // primary; the panel and the nudge are glanced (sched.js)
  motions: ['star-sweep'], props: ['hung-block', 'yarn-mascot'],
  motion: 'the thread sweeps the sky catching every star, straightens, they flow into one point that opens as the panel; one "needs you"; the thread lies flat under the claim',
  shots: ['sweep', 'panel', 'claim'],
});

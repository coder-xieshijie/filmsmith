// desk-threaded — the stream opening: a desk piles up (three session windows, four alerts, a sticky note, fourteen dialog
// copies cascading, a cursor that never gets to click), freezes on one line ("Until today."), the mascot drops in, one
// glowing thread pierces every item, goes taut and reels them in, and the emptied desk sinks into the night while the
// thread straightens into the spine. `opening: 'night'` shows the same items as dark cards drifting over the night sky.
// From the stream template: film.js renderOpen, sched.js open, plan.js openItems and the opening's path.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'desk-threaded', type: 'open',
  fits: ['hook', 'problem'],
  beats: { min: 24, max: 44 },
  slots: {
    sessions: { type: 'list', count: [3, 3], of: { title: text('window', 'glance'), ask: text('popup', 'glance'), status: text('popup', 'glance') } },
    alerts: { type: 'list', count: [1, 6], of: { title: text('popup', 'glance'), yes: text('word', 'glance'), no: text('word', 'glance') } },
    note: { type: 'list', count: [2, 2], of: text('note', 'primary') },
    freeze: text('freeze', 'primary', { claim: true }),
    // how full the pile gets: the dialog copies that cascade (default 14)
    copies: { type: 'number', min: 4, max: 30, optional: true, sample: 'default' },
  },
  defaults: () => ({ opening: 'desk' }),
  extra: (c, s) => ({ ...c, opening: s.opening === 'night' ? 'night' : s.opening === 'desk' ? 'desk' : c.opening }),
  reads: (s) => [s.note.join(' '), s.freeze],
  motions: ['thread-pierce', 'reel-in'], props: ['desk-pile', 'yarn-mascot'],
  motion: 'items pile up and freeze; the mascot drops; the thread pierces every item, goes taut and reels them in; the desk sinks',
  shots: ['pile', 'freeze', 'threaded', 'night'],
});

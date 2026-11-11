// spine-intro — the product introduces itself from the top of the thread: its name lights beside the mascot, a point
// lights on the spine, a short light reaches right and the chat block unfolds from its left edge along it; two lines
// from the product arrive as bubbles. From the stream template: film.js renderSpine, renderChat; sched.js intro;
// plan.js cardAt (the block's place over the film).
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'spine-intro', type: 'intro',
  fits: ['hook', 'turn'],
  beats: { min: 12, max: 26 },
  slots: {
    name: { type: 'text', tier: 'glance', limits: { en: { chars: 10 }, zh: { chars: 10 } } },
    lines: { type: 'list', count: [2, 2], of: text('bubble', 'primary') },
    // optional: who it is, large on the right of the block (the name at 96 px, one line of role under it at 40 px)
    title: text('name', 'glance', { optional: true, sample: 'default' }),
    role: text('role', 'glance', { optional: true, sample: 'default' }),
  },
  defaults: (ctx) => ({ name: ctx.lang === 'zh' ? 'Skein' : 'Skein' }),
  extra: (c, s) => (s.name ? { ...c, product: { ...c.product, name: s.name } } : c),
  reads: (s) => s.lines, // primary, one after the other; the title and role are glanced (sched.js)
  motions: ['hook-unfold'], props: ['hung-block', 'yarn-mascot'],
  motion: 'the name lights beside the mascot; a hook lights on the spine and the chat block unfolds from it; two bubbles',
  shots: ['spine', 'block'],
});

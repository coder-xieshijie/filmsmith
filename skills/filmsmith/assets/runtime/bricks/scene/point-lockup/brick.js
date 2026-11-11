// point-lockup — the stream lock-up, two endings: `name` (the mascot winds to the centre and becomes the point the name
// opens out of; the thread opens with it and settles as a rule under it) or `mascot` (the name opens and the mascot hops
// from the top of the spine onto the end of the wordmark); the tagline rises a word (a character) at a time.
// From the stream template: film.js renderLock; sched.js lockup.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'point-lockup', type: 'lockup',
  fits: ['lockup'],
  beats: { min: 14, max: 22 },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { chars: 10 }, zh: { chars: 10 } } },
    tagline: text('tagline', 'primary', { claim: true }),
  },
  defaults: (ctx) => ({ ending: 'name', ...(ctx.lang === 'zh' ? { name: 'Skein', tagline: '交出去，拿回核对过的结果。' } : { name: 'Skein', tagline: 'Hand it off. Get it back checked.' }) }),
  extra: (c, s) => ({ ...c, lockup: s.ending === 'mascot' ? 'mascot' : 'name', product: { ...c.product, ...(s.name ? { name: s.name } : {}), ...(s.tagline ? { tagline: s.tagline } : {}) } }),
  reads: (s, c) => [c.product.name, c.product.tagline],
  props: ['yarn-mascot'],
  motion: 'the mascot winds into a point the name opens out of (or hops onto the wordmark); the rule settles; the tagline rises',
  shots: ['point', 'name'],
});

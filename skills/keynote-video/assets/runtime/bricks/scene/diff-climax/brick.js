// diff-climax — the climax: one changed line on the paper side (the removed line muted, the added one typing beside
// an accent bar), two registered renders of the same instant either side of the seam, named on chips four beats
// before the slider moves; the seam slides two beats so the edited render takes the frame over and lands on a bar
// line with the claim's second phrase, read in a pause.
// From the split template (choreo.js diff; film.js inputOf.diff; diff-slider).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('diff');

export default {
  id: 'diff-climax', kind: 'scene',
  fits: ['climax'],
  beats: { min: 10, max: 20 },
  needs: { motions: ['diff-slider'], props: ['seam-grip', 'code-gutter'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    claim: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 8, chars: 24 }, zh: { chars: 12 } } } },
    before: { type: 'image', crop: true, optional: true, sample: 'default' },
    after: { type: 'image', crop: true, optional: true, sample: 'default' },
  },
  defaults: (ctx = {}) => ({
    type: 'diff', label: 'docs.config.js', line: SAMPLE.diff, claim: ctx.lang === 'zh' ? ['改一行，', '换一套主题。'] : ['One line,', 'a new theme.'],
    before: sampleFrame(1, "before · theme: 'paper'"), after: sampleFrame(3, "after · theme: 'night'"), bar: 0,
  }),
  ...body,
};

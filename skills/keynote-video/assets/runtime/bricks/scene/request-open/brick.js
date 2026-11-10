// request-open — the opening: a request types on the paper side; its caret runs to the seam's place and stands up
// into the full-height seam (split-open, caret); the first result slides out of the seam like a drawer; the claim
// rises in two phrases, a beat apart; the request leaves. The edit point becomes the boundary the whole film keeps.
// From the split template (choreo.js request; film.js inputOf.request, the caret, split-open with `caret`).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('request');
const CLAIM = { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } } };

export default {
  id: 'request-open', kind: 'scene',
  fits: ['hook'],
  beats: { min: 5, max: 14 },
  needs: { motions: ['split-open'], props: ['seam-grip'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    prompt: { type: 'code', sample: 'default', limits: { en: { chars: 40 }, zh: { chars: 40 } } },
    claim: CLAIM,
    result: { type: 'image', crop: true, optional: true, sample: 'default' },
  },
  defaults: (ctx = {}) => ({ type: 'request', label: SAMPLE.label, prompt: SAMPLE.prompt, claim: ctx.lang === 'zh' ? ['一份文件', '变成一个站点。'] : ['One file', 'becomes a site.'], result: sampleFrame(0), stitch: false }),
  ...body,
};

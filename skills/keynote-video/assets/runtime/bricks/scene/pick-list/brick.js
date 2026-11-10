// pick-list — a list on the paper side (modes, presets, targets) and a tick that hops to one item at a time; the
// result beside the seam changes with it: the first change a louvre (nine slats slide out of the seam), later ones a
// one-slat push. The chip by the grip names each result's source as it lands.
// From the split template (choreo.js pick; film.js inputOf.pick; louvre n 9 and the seam push n 1).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('pick');

export default {
  id: 'pick-list', kind: 'scene',
  fits: ['demo'],
  beats: { min: 6, max: 16 },
  needs: { motions: ['louvre', 'pair-hop'], props: ['seam-grip'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    claim: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } },
    list: { type: 'list', count: [2, 10], sample: 'default', of: { type: 'code', limits: { en: { chars: 14 }, zh: { chars: 14 } } } },
    picks: { type: 'list', count: [2, 4], sample: 'default', of: { item: { type: 'code' }, result: { type: 'image', crop: true, optional: true } } },
  },
  defaults: (ctx = {}) => ({
    type: 'pick', label: 'SKILL.md · themes', claim: ctx.lang === 'zh' ? '挑一种主题，' : 'Pick a theme,', list: SAMPLE.list,
    picks: [{ item: 'guide', result: sampleFrame(0) }, { item: 'reference', result: sampleFrame(1) }, { item: 'cookbook', result: sampleFrame(2) }],
    from: { type: 'request', label: SAMPLE.label, prompt: SAMPLE.prompt, claim: ctx.lang === 'zh' ? ['一份文件', '变成一个站点。'] : ['One file', 'becomes a site.'], result: sampleFrame(0) },
  }),
  ...body,
};

// render-branch — the seam rises to a command band and a branch runs down from it (split-branch): the command types
// above, the output below and its report in the pane the branch opens; the output cuts on each beat and the report's
// lines land every half beat beside it, then the result line and the claim's second phrase.
// From the split template (choreo.js render; film.js inputOf.render, reportPane; split-branch, stage 0.5).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('render');

export default {
  id: 'render-branch', kind: 'scene',
  fits: ['proof', 'demo'],
  beats: { min: 6, max: 14 },
  needs: { motions: ['split-branch'], props: ['seam-grip', 'report-pane'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'mutedOnBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    command: { type: 'code', sample: 'default', limits: { en: { chars: 44 }, zh: { chars: 44 } } },
    claim: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 7 } } } },
    results: { type: 'list', count: [2, 5], sample: 'default', of: { type: 'image', crop: true, optional: true } },
  },
  defaults: (ctx = {}) => ({
    type: 'render', label: 'terminal', command: SAMPLE.command, claim: ctx.lang === 'zh' ? ['渲染，', '量过。'] : ['render,', 'measured.'],
    results: [sampleFrame(4), sampleFrame(1), sampleFrame(2), sampleFrame(5)], report: SAMPLE.report,
    from: { type: 'file', label: 'docs.config.js', claim: ctx.lang === 'zh' ? '填一份文件，' : 'fill one file,', source: { file: 'docs.config.js', from: 7 }, lines: SAMPLE.lines, pairs: SAMPLE.pairs.map((p, k) => ({ ...p, result: sampleFrame(3 + k) })) },
  }),
  ...body,
};

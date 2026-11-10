// file-pair — a copy of the seam wipes down the frame and leaves real lines of a real file over the frames they made
// (the seam under the code); an accent underline pairs a token with the frame below it, hopping to the next token on
// each beat while the frame cuts on the same beat. Lines keep their text and their numbers in the gutter.
// From the split template (choreo.js file; film.js inputOf.file, the underline; wipe-line down).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('file');

export default {
  id: 'file-pair', kind: 'scene',
  fits: ['demo', 'proof'],
  beats: { min: 5, max: 12 },
  needs: { motions: ['wipe-line', 'pair-hop'], props: ['seam-grip', 'code-gutter'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    claim: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } },
    lines: { type: 'list', count: [2, 6], sample: 'default', of: { type: 'code', limits: { en: { chars: 64 }, zh: { chars: 64 } } } },
    pairs: { type: 'list', count: [1, 4], sample: 'default', of: { token: { type: 'code' }, result: { type: 'image', crop: true, optional: true } } },
  },
  defaults: (ctx = {}) => ({
    type: 'file', label: 'docs.config.js', claim: ctx.lang === 'zh' ? '填一份文件，' : 'fill one file,', source: { file: 'docs.config.js', from: 7 },
    lines: SAMPLE.lines, pairs: SAMPLE.pairs.map((p, k) => ({ ...p, result: sampleFrame(3 + k) })),
    from: { type: 'pick', label: 'SKILL.md · themes', claim: ctx.lang === 'zh' ? '挑一种主题，' : 'Pick a theme,', list: SAMPLE.list, picks: [{ item: 'guide', result: sampleFrame(0) }, { item: 'cookbook', result: sampleFrame(2) }] },
  }),
  ...body,
};

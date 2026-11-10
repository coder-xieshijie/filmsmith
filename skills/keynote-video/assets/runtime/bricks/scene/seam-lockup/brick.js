// seam-lockup — a copy of the seam wipes left and brings the lock-up: the name, the install line typing behind the
// caret, the address (≥ 3 s), a glance line, the published page beside the seam; on the last bar the seam slides off
// the frame's edge and the caret blinks after the install line, waiting.
// From the split template (choreo.js lockup; film.js stateOf lockup; wipe-line left, the seam close).
import { sceneBody, SAMPLE, sampleFrame } from '../../prop/seam-grip/scenes.js';
const body = sceneBody('lockup');

export default {
  id: 'seam-lockup', kind: 'scene',
  fits: ['lockup'],
  beats: { min: 10, max: 24 },
  needs: { motions: ['wipe-line', 'seam-close'], props: ['seam-grip'], roles: ['paper', 'ink', 'muted', 'dim', 'bench', 'onBench', 'accent', 'key'], type: ['display', 'mono'] },
  slots: {
    label: { type: 'code', sample: 'default' },
    name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 16 }, zh: { chars: 8 } } },
    command: { type: 'code', sample: 'default', limits: { en: { chars: 44 }, zh: { chars: 44 } } },
    url: { type: 'code', sample: 'default', limits: { en: { chars: 44 }, zh: { chars: 44 } } },
    line: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 34 }, zh: { chars: 14 } } },
    result: { type: 'image', crop: true, optional: true, sample: 'default' },
  },
  defaults: (ctx = {}) => ({
    type: 'lockup', label: SAMPLE.label, name: 'Northwind', command: SAMPLE.install, url: SAMPLE.url, line: ctx.lang === 'zh' ? '文档用代码写，也用代码量。' : 'Written and checked in code.',
    result: { n: 1, kind: 'page', chip: 'github.com/northwind/docs · 2026-11-09' },
    from: { type: 'diff', label: 'docs.config.js', line: SAMPLE.diff, claim: ctx.lang === 'zh' ? ['改一行，', '换一套主题。'] : ['One line,', 'a new theme.'], before: sampleFrame(1), after: sampleFrame(3) },
  }),
  ...body,
};

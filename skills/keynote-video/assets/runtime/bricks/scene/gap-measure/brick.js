// gap-measure — the climax: the gap between two points of a print is measured on its own axis. A chip in the way
// steps aside, the match's ring comes off, a pencil dimension draws (1.5 beats) with ticks at both ends and dashed
// drops, its chip lands with the computed difference, the rest of the print steps back round the span, and the claim
// is set down and held in a pause. From the exhibit template (choreo.js measure; film.js measureGeom, measures,
// measureVeil, chipAside).
import { sceneBody, SAMPLE_PRINTS, SAMPLE_BOXES, SAMPLE_GLYPHS, CAPTION_LIMITS } from '../../prop/print-mount/exhibit.js';
const body = sceneBody('measure');

export default {
  id: 'gap-measure', kind: 'scene',
  fits: ['climax', 'claim', 'proof'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['dimension-line'], props: ['print-mount', 'claim-chip'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', claim: true, limits: CAPTION_LIMITS },
    prints: { type: 'list', count: [1, 6], sample: 'default', of: { image: { type: 'image', crop: true, optional: true }, source: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 56 }, zh: { chars: 28 } } } } },
  },
  defaults: (ctx = {}) => { const zh = ctx.lang === 'zh'; return { prints: SAMPLE_PRINTS[zh ? 'zh' : 'en'], print: 2, from: null, ringed: SAMPLE_BOXES.r2, a: { point: [544, 459], value: 0.045 }, b: { point: [1150, 459], value: 0.907 }, label: '~{ratio}×', digits: 0, claim: true, held: [], caption: zh ? '对手约 20 倍的成本。' : 'The rival: ~20× the cost.', desk: 'plain', seed: 3 }; },
  ...body,
};

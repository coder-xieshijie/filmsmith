// glyph-swatch — the palette link: the word's first four glyph boxes morph into four swatches (text, ground, field, line), hop on
// 1/16 notes, the hex labels type on under them, and a type specimen of the three faces rises; the centre stage name.
// From the thread template: film.js palette, SW_ROLES, SPECIMEN. Chinese: the specimen names the Chinese faces
// (思源黑体, 思源宋体, JetBrains Mono); hex labels stay Latin, untracked.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'glyph-swatch', type: 'palette',
  fits: [ 'demo' ],
  beats: { min: 2, max: 8 },
  slots: {},
  DEFAULT: {
    en: { stage: { name: 'Colour', note: 'every hex comes from one preset' }, before: [ { type: 'word', word: 'Plan.' } ], after: [] },
    zh: { stage: { name: '配色', note: '每个色值出自同一预设' }, before: [ { type: 'word', word: '先做计划。' } ], after: [] },
  },
  motions: [],
  motion: "four glyphs become four swatches; the hex labels type on; the specimen rises",
  shots: [ 'swatches' ],
});

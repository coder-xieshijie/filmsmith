// sheet-flood — the review link, the chain's climax: the line colour floods the frame from a dot on a bar line (runtime transition
// dot-iris), holds two bars, retracts onto the contact sheet, 420 particles gather onto 16 tile outlines that show this
// film's own frames, checks tick on 1/16 notes, the counter runs to the film's frame count, the camera pushes 6 %,
// the tiles collapse into one file card with its title, its spec line in three parts and an export bar, and the card
// squashes into the line.
// From the thread template: film.js review, floodArea, particles, tileTimes; shots.js REVIEW_CUES, CARD. Chinese: the
// counter label untracked; the card title and the spec line stay Latin.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'sheet-flood', type: 'review',
  fits: [ 'climax', 'proof' ],
  beats: { min: 16, max: 22 },
  slots: { count: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } }, card: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 4 }, zh: { chars: 4 } } } },
  DEFAULT: {
    en: { stage: { name: 'Output', note: '{frames} frames, each one inspected' }, count: 'FRAMES RENDERED', card: 'MP4', before: [ { type: 'storyboard', stage: { name: 'Boards', note: 'six panels before anything moves' } }, { type: 'merge', stage: { name: 'Physics', note: 'volume and light, computed per frame' } } ], after: [] },
    zh: { stage: { name: '输出', note: '{frames} 帧，逐帧检查' }, count: '帧已渲染', card: 'MP4', before: [ { type: 'storyboard', stage: { name: '分镜', note: '动之前先画六格分镜' } }, { type: 'merge', stage: { name: '物理', note: '体积与光逐帧计算' } } ], after: [] },
  },
  motions: [ 'card-squash' ],
  motion: "the flood; particles gather into the contact sheet; checks and the counter; the card; the card squashes into the line",
  shots: [ 'flood', 'sheet', 'card' ],
});

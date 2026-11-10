// edit-tracks — the tracks link: the ground floods out of the line both ways, four named track rows land, clips slide in where
// this film's links, shots and stages really sit (and a beat-grid sound row), the playhead waits, sweeps to the centre
// and grows to full height, the line the ink starts from.
// From the thread template: film.js tracks, clips, TR. Chinese: the track names untracked at 28 px.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'edit-tracks', type: 'tracks',
  fits: [ 'demo' ],
  beats: { min: 4, max: 8 },
  slots: { tracks: { type: 'list', count: [ 4, 4 ], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } } },
  DEFAULT: {
    en: { stage: { name: 'Cut', note: 'sound and picture share one clock' }, tracks: [ 'SHOTS', 'GL PASSES', 'MUSIC', 'TITLES' ], before: [], after: [] },
    zh: { stage: { name: '剪辑', note: '声画共用一个时钟' }, tracks: [ '镜头', 'GL 通道', '音乐', '字幕' ], before: [], after: [] },
  },
  motions: [],
  motion: "the ground floods out of the line; tracks and clips land; the playhead sweeps and grows to full height",
  shots: [ 'tracks' ],
});

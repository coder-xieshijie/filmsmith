// sphere-merge — the merge link: the camera pushes through panel 3 into the shot it shows (the template's T2 thread-panel-push),
// three glossy spheres on the field drift together, merge through a viscous neck, squash on landing, rebound and settle
// (WebGL, gl.js blob); the centre stage name lands under the sphere. Followed by the curves it holds the settled
// sphere; otherwise it squashes into the 1400 × 6 rod the close opens from.
// From the thread template: film.js merge, shots.js mergeState and squashState, gl.js. Chinese: only the stage name.
import { linkScene } from '../../prop/thread-line/kit.js';

export default linkScene({
  id: 'sphere-merge', type: 'merge',
  fits: [ 'demo', 'proof' ],
  beats: { min: 6, max: 12 },
  slots: {},
  DEFAULT: {
    en: { stage: { name: 'Physics', note: 'volume and light, computed per frame' }, before: [ { type: 'storyboard' } ], after: [] },
    zh: { stage: { name: '物理', note: '体积与光逐帧计算' }, before: [ { type: 'storyboard' } ], after: [] },
  },
  motions: [],
  motion: "the push into panel 3; three spheres merge, squash, rebound and settle; the sphere squashes into the line",
  shots: [ 'push', 'spheres' ],
});

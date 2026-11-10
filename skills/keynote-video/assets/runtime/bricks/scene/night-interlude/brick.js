// night-interlude — a stretch of the stream night after the closing sweep, for a film's own composition (a section the
// skeleton has no scene for, or an ending of its own): the sky goes on with the film's motes and push, the stars are
// gathered, and the mascot stays on its perch at the top of the spine with the product's name, or leaves the frame to
// the composition (`perch: false`). The film lays it out like any scene, so the sky's push runs over the film's real
// length and the lock-up (if any) follows it. No text and no cues of its own: the composition over it brings them.
// Own: the stream engine's interlude scene (prop/glow-thread sched.js interlude).
import { filmScene } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'night-interlude', type: 'interlude',
  fits: ['demo', 'proof', 'rest', 'lockup'],
  beats: { min: 1, max: 64 },
  slots: {
    // its length in beats (1–64): the composition's own; the film's rounding to a whole bar goes to its last scene
    beats: { type: 'number', min: 1, max: 64, default: 8, sample: 'default' },
    // the mascot on its perch with the product's name (true), or the frame left to the composition (false); the film's
    // `mascot` stays the mascot's picture, as in every stream scene
    perch: { type: 'flag', default: true, optional: true },
  },
  defaults: () => ({ beats: 8, perch: true }),
  reads: () => [],
  props: ['yarn-mascot'],
  motion: 'the night goes on: the motes drift, the sky keeps its push, the mascot sits on its perch or is gone; the film\'s own composition plays over it',
  shots: ['sky'],
});

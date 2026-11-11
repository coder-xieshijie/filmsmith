// plan.js — the fitted film for the picture and the sound: validates content.js, runs lib/timing.js fit() with
// timing.rules.js, and lays every scene's choreography (choreo.js) and every moment (timeline.js) on the beat grid.
// Throws on content that breaks the registry, a slot limit or a reading ceiling, so film.js can show it as a red
// banner and score.mjs stops.
import { fit } from './lib/timing.js';
import rules from './timing.rules.js';
import { validate, CANVAS } from './registry.js';
import { timelineOf, windowOf } from './timeline.js';

export { CANVAS, windowOf };

export const plan = (content) => {
  const errs = validate(content);
  if (errs.length) throw new Error(['content.js does not fit the pulse registry:', ...errs].join('\n'));
  const T = fit(content, rules);
  const bad = T.notes.filter((n) => n.level === 'error');
  if (bad.length) throw new Error(['npm run fit reports errors:', ...bad.map((n) => `${n.scene != null ? `scene ${n.scene + 1}: ` : ''}${n.msg}`)].join('\n'));
  const g = { bpm: T.bpm, beat: T.beat, bar: T.bar, beatsPerBar: T.beatsPerBar };
  const tl = timelineOf(T.scenes, g, content);
  return { T, g, B: T.beat, bar: T.bar, duration: T.duration, bars: T.bars, scenes: tl.laid, cues: tl.cues, keys: tl.keys, facts: tl.facts, timeline: tl };
};

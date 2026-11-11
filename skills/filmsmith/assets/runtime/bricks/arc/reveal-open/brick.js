// reveal-open — an opening fragment: a world before the name, the name stated and held, then one hero with a whole
// action arc, handed on to the film's features. Pure data (SPEC 3.6); a film's arc puts it in front of its own slots.
// The order and the minimum holds follow video-shotcraft's opening rules (references/pipeline.md stage 3,
// references/aesthetic-rules.md Q5, references/sequences/promo-energy-arc.md segments 1 and 2), restated here.
export default {
  id: 'reveal-open', kind: 'arc',
  arc: {
    slots: [
      // a world before anything is named: low energy, one image that says "many" or "flow"; at least two scene
      // changes inside the first five seconds come from this slot and the next
      { role: 'hook', sec: [3, 7], scenes: { tags: ['flow-landscape', 'icon-field', 'crane-reveal', 'orbit-title'] }, peak: 'hook', required: true },
      // the name, stated once and held at least a second
      { role: 'claim', sec: [2.5, 5], scenes: { tags: ['name-stamp', 'word-window', 'outline-write', 'segment-reveal', 'shard-gather'] }, peak: 'claim', required: true },
      { role: 'turn', sec: [0.5, 1.5], turn: true },
      // one hero, one whole action arc (rise, hold, settle) of at least three seconds: the slowest, most textured shot
      { role: 'demo', sec: [5, 7], scenes: { tags: ['hero-spotlight', 'card-conjure'] }, required: true },
    ],
    length: { sec: [11, 20] },
    peaks: [1, 2],
  },
};

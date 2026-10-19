// content.js — the film. The only file edited for an ordinary halftone film; TEMPLATE.md lists every slot and limit.
// No duration and no bars: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js) and
// prints the table. Optional `bpm` (112–128, default 120) or `target` (seconds; the tempo moves to meet it).
//
// The example's subject is made up for the template: "parley-2", a speech model that pulls the voices of a room
// apart from one microphone and writes down who said what, live. Nothing here is a claim about a real product and
// every number is illustrative; replace all of it, the mark included.

// The mark, in mark units (y down; origin = the anchor's centre, which stays on one screen point all film).
// Here: a microphone capsule (the anchor, printed in the process ink) and three arcs of sound (the black plate).
const band = (r, w, deg) => { // an arc band of radius r and width w, ±deg about the +x axis, round ends
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), ro = r + w / 2, ri = r - w / 2, h = w / 2;
  const p = (rr, sg) => `${(rr * c).toFixed(4)} ${(sg * rr * s).toFixed(4)}`;
  return `M ${p(ro, -1)} A ${ro} ${ro} 0 0 1 ${p(ro, 1)} A ${h} ${h} 0 0 1 ${p(ri, 1)} A ${ri} ${ri} 0 0 0 ${p(ri, -1)} A ${h} ${h} 0 0 1 ${p(ro, -1)} Z`;
};

export default {
  palette: 'cyan',
  seed: 20261019,
  // dot: 'round',          // form variant: 'round' (default), 'square' or 'line' (TEMPLATE.md, Variants)
  // edges: 'full',         // 'cut' for a reel: the anchor is in place on frame 0 (TEMPLATE.md, Shortest cut)
  meta: { title: 'parley-2 — halftone example', url: '' },
  mark: {
    accent: 'M -0.06 -0.09 A 0.06 0.06 0 0 1 0.06 -0.09 L 0.06 0.09 A 0.06 0.06 0 0 1 -0.06 0.09 Z',
    ink: [band(0.25, 0.08, 48), band(0.39, 0.075, 48), band(0.53, 0.07, 48)].join(' '),
    box: [-0.075, -0.45, 0.58, 0.45],       // the whole mark
    anchorBox: [-0.06, -0.15, 0.06, 0.15],  // the anchor
    lambda: 0.14,                           // spacing of the mark's rings: the field's rings land on the arcs
  },
  scenes: [
    // the problem, on paper: one capsule, the room's sound arriving as rings
    { type: 'hook', lines: ['Everyone talks', 'at once.'], label: 'one mic · room 4' },
    // feature 1: the voices interfere, then come apart (the field changes its function; same ground)
    { type: 'card', word: 'CROSSTALK', line: 'three voices, one channel', field: 'cross' },
    { type: 'card', word: 'SPLIT', line: 'one clean track per voice', field: 'cells' },
    // the number, printed reversed out of ink: one cell per voice
    { type: 'count', value: 12, from: 1, line: 'voices pulled from one mic', label: 'one mic · 41 min', to: 'quantize' },
    // feature 2: the cells quantize into rows of words; then two real lines of the transcript, one card a speaker
    { type: 'card', word: 'WRITTEN', line: 'every word, with its speaker', field: 'rows', ground: 'ink' },
    { type: 'card', word: 'S4', line: '“ship it on friday”', label: '00:14.2 · track 4', mono: true, field: 'wave', pattern: 4, to: 'whip' },
    { type: 'card', word: 'S9', line: '“no, monday”', label: '00:15.1 · track 9', mono: true, field: 'wave', pattern: 9, to: 'scan' },
    // the same voice again, the same waveform: it knows who is talking
    { type: 'card', word: 'S4', line: '“friday. final.”', label: '00:16.0 · track 4', mono: true, field: 'wave', pattern: 4 },
    // feature 3 and 4: live captions scroll; the world inverts round the capsule onto the chip
    { type: 'card', word: 'LIVE', line: 'captioned as spoken', field: 'rows', to: 'invert' },
    { type: 'card', word: 'ON DEVICE', line: 'nothing leaves the room', field: 'grid', ground: 'ink' },
    // the claim: the room collapses into the capsule, which speaks the line
    { type: 'claim', lines: ['Every voice,', 'its own words.'] },
    // pull back: the capsule is the mark's, and the rings were its arcs
    { type: 'lockup', name: 'parley-2', line: 'speech model · out today' },
  ],
};

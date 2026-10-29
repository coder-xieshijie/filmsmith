// content.js — the film. The only file edited for an ordinary ink film; TEMPLATE.md lists every slot and limit.
// No duration and no bars: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js) and
// prints the table with the four tiers of change. Optional `bpm` (120–136, default 124) or `target` (seconds; the
// tempo moves to meet it). Copy may quote computed values: {bpm} {bars} {seconds} {width} {height} {fps} {lufs} {seed}
// ({lufs} is the master's measured loudness once `npm run audio` has run; before that, the −14 target).
//
// The example's subject is made up for the template: "loudgate", a CI check that meters the loudness of every
// media file in a pull request. Nothing here is a claim about a real product; replace all of it.
export default {
  palette: 'cobalt',
  seed: 20261018,
  meta: { title: 'loudgate — ink example', url: '' },
  scenes: [
    // the hook: one word a beat on the same anchor, each on its own ground, opened from the dot (aperture-swap)
    { type: 'swap', words: ['TOO', 'LOUD', 'AGAIN'] },
    // build: paper, one word per beat, the dot is the full stop; the label types once the line is complete
    { type: 'slam', lines: [['SHIPPED'], ['ANYWAY']], label: 'NOBODY MEASURED' },
    { type: 'warp', word: 'CLIPPING', word2: 'LIVE' },
    // the turn: the guess shrinks into its dot, which bursts into the method (collapse-burst)
    { type: 'burst', word: 'GUESS', into: 'METER' },
    // the dot sinks into the paper and blooms into the accent field; the music breaks in its last half bar
    { type: 'bloom' },
    // drop on the name; the dot holds still while a hairline scans the night in (anchor-swap)
    { type: 'name', name: 'loudgate', labels: ['LOUDNESS CHECKS FOR CI', 'EBU R128 METERING'], to: 'scan' },
    // night: one step per beat — the meter's own stages, the film's technical object
    { type: 'steps', steps: ['DECODE', 'GATE', 'INTEGRATE', 'PEAK', 'COMPARE', 'REPORT'] },
    // the film measures itself: its real length, its real mix
    { type: 'ruler', words: ['{seconds}', 'SECONDS'], label: 'THIS FILM' },
    { type: 'counter', items: [{ value: '{lufs} LUFS', label: 'ITS MIX, MEASURED' }] },
    // the gate's two verdicts, a beat each; the answer stands on the accent field the dot opens into
    { type: 'swap', words: ['PASS', 'FAIL'], grounds: ['night'], answer: 1 },
    // the claim: the frame exposes to white on the music's second drop; the camera leaves through the first O
    { type: 'claim', lines: ['TOO LOUD', 'NO MERGE'], to: 'portal' },
    // the dot ends as the cursor of the command
    { type: 'cta', name: 'loudgate', url: 'loudgate check media/', line: 'MIT  /  RUNS IN ANY CI' },
  ],
};

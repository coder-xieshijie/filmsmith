// content.js — the film. The only file edited for an ordinary pulse film; TEMPLATE.md lists every slot and limit.
// No duration and no bars: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js) and
// prints the table. Optional `bpm` (112–120, default 120) or `target` (seconds; the tempo moves to meet it).
// Copy may quote computed values: {answer} {version} {pass} {x:<label>} from the searches, {bpm} {bars}
// {seconds} from the fitted timing.
//
// The example's subject is made up for the template: "quench" 4.0, an incremental build tool for TypeScript
// monorepos, and its warm-rebuild benchmark. Nothing here is a claim about a real product; replace all of it.
export default {
  palette: 'indigo',
  seed: 20261019,
  aperture: 'cut', // form variant: 'cut' (straight-edged apertures, square cells) or 'round'
  meta: { title: 'quench 4.0 — pulse example' },
  scenes: [
    // the question in two phrases, one word per beat; each word's machine form types into the query line under it
    { type: 'ask', words: [
      { text: 'which', param: '$ quench bench' },
      { text: 'build', param: '--builds 3.7,3.8,3.9' },
      'rebuilds',
    ] },
    { type: 'ask', words: [
      { text: '2,400 files', param: '--repo mono-2400 --warm' },
      { text: 'under', param: '--max 1s' },
      '1 s?',
    ] },
    // the query runs over the real builds: none passes, the highlight ends on the empty slot
    { type: 'search', line: '2,400 files under 1 s?', limit: 1, slot: true, query: 'mono-2400 · warm · median of 5 runs', to: 'whip',
      candidates: [{ label: '3.7', value: '4.8 s' }, { label: '3.8', value: '3.1 s' }, { label: '3.9', value: '1.9 s' }] },
    // why: one edited line rechecks the whole repository
    { type: 'data', to: 'invert', query: 'git diff · +1 −1',
      items: [{ value: 'token.ts', label: 'one line edited' }, { value: '2,400', label: 'files rechecked', count: true }, { value: '1.9 s', label: 'every time' }] },
    // what changed, on the inverted ground, in two short asks that speed up into the re-run
    { type: 'ask', words: [
      { text: 'in 4.0', param: '$ quench@4.0 bench' },
      { text: 'an edit', param: '--graph imports' },
      'rechecks',
    ] },
    { type: 'ask', words: [
      { text: 'only', param: '--recheck dirty' },
      'its importers',
    ] },
    // the same query again, now with 4.0: eighth-note hops over the known builds, the new one scrambles, locks,
    // and the exposure builds into the whiteout
    { type: 'search', line: '2,400 files under 1 s?', limit: 1, query: '+ 4.0 · mono-2400 · warm · median of 5',
      candidates: [{ label: '3.7', value: '4.8 s' }, { label: '3.8', value: '3.1 s' }, { label: '3.9', value: '1.9 s' }, { label: '4.0', value: '0.6 s' }] },
    // the film's one whiteout, on the drop
    { type: 'reveal', value: '{answer}', line: 'only build under 1 s', query: 'p50 · {pass} pass' },
    // through the 0 of the answer into the figures that explain it
    { type: 'data', to: 'slice', query: 'import graph · 14 of 2,400 dirty',
      items: [{ value: '14', label: 'files rechecked' }, { value: '{x:3.9}', label: 'vs 3.9' }, { value: '{x:3.7}', label: 'vs 3.7' }] },
    // the lock-up
    { type: 'name', name: 'quench', version: '{version}', line: 'incremental TypeScript builds', install: 'npm i -D quench@4.0.0' },
  ],
};

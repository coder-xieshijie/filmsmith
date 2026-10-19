// content.js — the film. The only file edited for an ordinary film; read TEMPLATE.md first.
// Example: the launch of grainlock, a fictional dependency-lock tool. Every line of copy is a placeholder:
// write your own sentences for your product, do not keep these sentence shapes. Its length follows the copy
// (`npm run fit` prints the timing table); no scene sets bars. Illustrative values: the package names, counts
// and policy rules are invented; the hashes and the head id are computed from the text shown on screen (see
// TEMPLATE.md, "Computed values").
export default {
  // bpm: 128,    // optional; 120–136, default 128 (timing.rules.js)
  // target: 100, // optional seconds; the tempo moves inside its range to meet it
  palette: 'ice',
  seed: 7,
  meta: { title: 'grainlock — launch', url: 'github.com/example-org/grainlock' },
  brand: { name: 'grainlock', tag: '// v1.0', licence: 'OPEN SOURCE · MIT', logo: 'prompt' },

  scenes: [
    {
      type: 'boot',
      prompt: 'npm install left-pad-pro',
      question: 'Pulled in 312 packages.', stress: '312',
      problems: [['OWNER', 'changed'], ['POSTINSTALL', 'curl'], ['UNPINNED']],
    },
    {
      type: 'hero',
      lines: ['Every dependency,', 'accounted for.'],
      sub: 'grainlock blocks [changes nobody reviewed].',
      facts: [['installs', 'brew · npm · cargo'], ['policy', 'one file in the repo'], ['runs in', 'CI | pre-commit']],
    },
    {
      type: 'qa',
      chapter: { title: ['SET', 'THE POLICY'], card: 'grainlock init // asks twice' },
      note: '// reads the lockfile first',
      window: ['grainlock init', 'billing-api'],
      questions: [
        { id: 'Q1', q: 'Maintainer changes?', options: ['Block', 'Flag'], pick: 0 },
        { id: 'Q2', q: 'Install scripts?', options: ['Allow', 'Deny'], pick: 1 },
      ],
    },
    {
      type: 'decide',
      note: '// written to grainlock.toml',
      summary: ['POLICY', 'confirm once'],
      decisions: [
        { id: 'D1', text: 'New maintainer → block' },
        { id: 'D2', text: 'Install scripts denied' },
        { id: 'D3', text: 'Pin transitive versions', found: 'from lockfile' },
      ],
      confirm: ['YOU ▸', 'Confirm the policy'],
      strip: ['Plain TOML', 'Reviewed like code'],
    },
    {
      type: 'freeze',
      chapter: { title: ['LOCK', 'THE GRAPH'], card: 'grainlock lock // hash it' },
      note: '// a second pass looks for gaps',
      docs: [
        { name: 'grainlock.toml', label: 'policy', lines: [
          '## Policy', '- maintainer_change = "block"', '- install_scripts = "deny"', '- pin_transitive = true',
          '## Exceptions', '- esbuild: install script allowed'] },
        { name: 'deps.lock', label: 'graph', lines: [
          '{Packages:} 312', '| ID  | Package            | Pin |', '| {P01} | left-pad-pro 2.1.0 | yes |', '| {P02} | tiny-glob 0.9.4    | yes |',
          '| …   | 309 more           |     |'] },
      ],
      gaps: [
        { doc: 1, after: 3, flag: 'esbuild unpinned', fix: '✓ pinned', add: '| {P03} | esbuild 0.24.0     | yes |' },
        { doc: 0, after: 5, flag: 'no expiry' },
      ],
      command: 'grainlock lock --policy grainlock.toml --graph deps.lock',
      output: [{ key: 'policy:', hashOf: 0 }, { key: 'graph:', hashOf: 1 }],
      lock: 'LOCKED',
      result: 'Committed',
    },
    {
      type: 'flow',
      chapter: { title: ['CHECK', 'EVERY PR'], card: 'grainlock ci // diff the lock' },
      note: '// on every pull request',
      command: ['grainlock ci', '✓ lock verified'],
      inputs: [['Diff', '+3 packages'], ['deps.lock', '⬢ 312 locked']],
      hub: ['ONE RUNNER', 'grainlock', 'diff · policy'],
      outputs: [['Policy', '2 rules hit'], ['Verdict', 'posted to PR']],
      checks: [['owners unchanged', 0], ['verdict: pass', 1]],
      strip: ['About 4 s per PR', 'Fails closed'],
    },
    {
      type: 'compare',
      chapter: { title: ['AUDIT', 'TWICE'], card: 'laptop and CI must agree' },
      note: '// same lock, two machines',
      left: { label: 'LAPTOP', name: 'local', desc: 'pre-commit hook', items: ['Reads deps.lock', 'Checks the policy', 'Prints a verdict'] },
      middle: { label: 'SHARED LOCK', name: 'deps.lock', desc: '⬢ {head}' },
      right: { label: 'CI RUNNER', name: 'ci', desc: 'clean machine', items: ['Rebuilds the graph', 'Re-hashes packages', 'Posts the verdict'] },
      counter: { label: 'hashes match', items: ['P313', 'P314', 'P315', 'P316', 'P317', 'P318'], verdict: 'MATCH' },
      meta: ['Mismatch blocks the merge.'],
    },
    {
      type: 'ends',
      title: ['Humans write the ', 'rules.'],
      sub: '// grainlock checks the middle',
      nodes: [
        { tag: 'YOU', name: 'Policy', sub: 'write the rules', you: true },
        { tag: 'LOCAL', name: 'lock', sub: 'hash the graph' },
        { tag: 'CI', name: 'ci', sub: 'diff every PR' },
        { tag: 'CI', name: 'audit', sub: 'rebuild, compare' },
        { tag: 'GATE', name: 'merge', sub: 'blocks drift' },
        { tag: 'YOU', name: 'Review', sub: 'sign exceptions', you: true },
      ],
      bracket: 'grainlock runs the middle',
      loop: 'exceptions flow back to policy',
    },
    {
      type: 'install',
      title: ['Set up ', 'once.'],
      window: ['terminal', 'zsh'],
      commands: ['brew install grainlock', 'grainlock init && grainlock lock'],
      steps: [['grainlock init', 'write the policy'], ['grainlock lock', 'hash the graph'], ['grainlock ci', 'check every PR'], ['grainlock audit', 'compare runs']],
    },
    {
      type: 'horizon-tagline',
      lines: ['Nothing runs', 'until you say so.'], stress: 'you',
    },
    {
      type: 'end',
      chips: ['INIT', 'LOCK', 'CI', 'AUDIT'],
      url: 'github.com/example-org/grainlock', icon: 'github',
      sub: 'MIT licensed · npm, cargo and pip',
    },
  ],
};

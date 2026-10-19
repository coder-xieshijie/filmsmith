// content.js — the film. The only file edited for an ordinary film. Slots and limits: TEMPLATE.md.
// Example: a placeholder launch film for "gatewright", a fictional staged-rollout tool. The copy is there to show
// every slot filled; write your own sentences for your product and do not reuse these sentence shapes. Ids, hashes
// and counts are illustrative (the four health checks H01–H04 are the same four rows on the verify page; the error
// rates on the bars page are under the 0.5 % limit the plan sets).
// Length is not set here: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js) and
// prints the table. Optional: bpm (112–128, default 120), target (seconds; the tempo moves to meet it).

export default {
  palette: 'signal',
  seed: 7,
  meta: { title: 'gatewright — staged rollouts, a person at every gate', url: 'gatewright.example/docs' },

  // Persistent header and footer (every frame): real information only — brand, tag, section, licence, progress.
  chrome: {
    brand: 'gatewright',
    tag: 'Staged rollouts · a person at every gate',
    license: 'Apache-2.0',
    url: 'gatewright.example/docs',
    platforms: 'macOS / Linux / CI',
  },

  // Sound: bed preset. Optional: bed: { file: 'assets/audio/bed.wav', offset: 0 }.
  sound: { preset: 'swiss' },

  scenes: [
    {
      type: 'problem', section: '00 — Problem',
      lines: ['All users,', 'one push.'],
      rows: [
        { label: 'ROLLBACK', value: 'manual' },
        { label: 'SIGN-OFF', value: 'an emoji' },
      ],
    },
    {
      type: 'claim', section: '00 — Claim',
      input: { label: 'YOU SET', lines: ['Who first,', 'how far.'] },
      output: { label: 'IT RUNS', lines: ['Every stage,', 'gated.'] },
      name: 'gatewright',
      desc: 'Staged rollouts for services.',
    },
    { // entered by the grid columns (the first chapter card: upright)
      type: 'chapter', num: '01', label: 'Before anything ships', title: 'Plan',
      caption: 'You set the cohorts.',
    },
    {
      type: 'options', num: '01', title: 'Plan',
      caption: 'Cohorts come from live traffic.',
      heads: ['Q', 'Question', 'Options'],
      rows: [
        { q: 'First cohort?', options: ['Staff only', '1 % of users'], pick: 0 },
        { q: 'How to widen?', options: ['Timer', 'Sign-off'], pick: 1 },
      ],
      summary: 'Rollout plan',
      confirm: 'You approve.',
    },
    {
      type: 'slot', section: '01 — Stages',
      label: 'rollout.yaml · five stages',
      words: ['staff', '1 %', '10 %', { text: 'you widen', human: true }, '100 %'],
    },
    { // the second chapter card: the columns lean on the grid diagonal
      type: 'chapter', num: '02', label: 'Nothing moves unsigned', title: 'Sign',
      caption: 'A dry run, then your name.',
    },
    {
      type: 'document', num: '02', title: 'Sign',
      caption: 'A signed plan cannot drift.',
      left: {
        title: 'rollout.yaml', label: 'Cohorts & limits',
        lines: [
          { k: 'C1', text: 'staff only' },
          { k: 'L1', text: 'halt above 0.5 % errors' },
          { k: 'G1', text: 'widen on sign-off' },
          { text: 'rollback: one command', dim: true },
        ],
      },
      right: {
        title: 'checks.yaml', label: 'What “healthy” means',
        groups: [
          { label: 'Health checks', prefix: 'H', count: 3, added: 1 },
          { label: 'Stages', prefix: 'S', count: 4 },
        ],
        note: 'dry run: {added} added',
      },
      stamp: 'SIGNED',
      hashes: ['sha256  7c1e09d2…a4f0', 'sha256  b3d8e115…09c2'],
      rail: { label: 'Sequence', steps: ['Dry run', 'You sign', 'Locked', 'Stage 1 opens'], after: '→ ramp' },
    },
    { // the third chapter card: two-phase columns
      type: 'chapter', num: '03', label: 'Checked from outside', title: 'Watch',
      caption: 'A separate probe watches.',
    },
    {
      type: 'verify', num: '03', title: 'Watch',
      caption: 'The probe never sees the plan.',
      from: { label: 'Rollout', title: 'Stage 3 · 50 %' },
      link: 'build 4812  a91f2c0',
      to: { label: 'Probe', title: 'Outside probe', note: 'own account · live traffic' },
      heads: ['Check', 'Result'],
      rows: [
        { id: 'H01', ref: 'error rate below 0.5 %', result: 'PASS' },
        { id: 'H02', ref: 'p95 latency under 300 ms', result: 'PASS' },
        { id: 'H03', ref: 'checkout success ≥ 99 %', result: 'PASS' },
        { id: 'H04', ref: 'no new crash signatures', result: 'PASS' },
      ],
      counter: { label: 'Healthy', caption: 'checks green on live traffic' },
      band: { a: 'One check fails.', b: 'You decide.' },
    },
    {
      type: 'flow', section: '04 — Both ends',
      title: 'A person at every gate.',
      nodes: [
        { name: 'YOU', note: 'plan', human: true },
        { name: 'dry run', note: 'finds gaps' },
        { name: 'gates', note: 'per stage' },
        { name: 'probe', note: 'live checks' },
        { name: 'YOU', note: 'widen, close', human: true },
      ],
      bracket: 'in between: gatewright moves traffic',
      loop: 'red checks flow back → limits',
      statement: 'Widening stays with you.',
      list: 'widen · skip · lower a limit · close',
    },
    { // arrives as a staircase whose steps are its own values (step-wipe)
      type: 'bars', num: '05', title: 'Errors',
      caption: 'Error rate at each stage.',
      unit: '%',
      values: [
        { label: 'STAFF', value: 0.12 },
        { label: '1 %', value: 0.18 },
        { label: '10 %', value: 0.21 },
        { label: '50 %', value: 0.19 },
      ],
      limit: { value: 0.5, label: 'YOUR LIMIT · 0.5 %' },
    },
    { // one number; the next scene opens on the accent, so the camera pushes through the 0 (counter-portal)
      type: 'figure', section: '05 — Errors',
      value: '0', label: 'since the first rollout',
      line: ['stages widened', 'without a person.'],
    },
    { // the climax: a run of words on one anchor, each on its own ground (aperture-swap)
      type: 'words', peak: 'reveal', climax: true,
      states: [
        { text: 'You widen.', ground: 'accent' },
        { text: 'It ramps.', ground: 'ink' },
        { text: 'You *close*.', ground: 'paper' },
      ],
    },
    {
      type: 'install', section: '06 — Install',
      title: 'Install',
      panel: 'terminal',
      commands: ['npm i -g gatewright'],
      note: 'Plans live in rollout.yaml',
      steps: [
        { cmd: 'gatewright plan', note: 'choose the cohorts' },
        { cmd: 'gatewright sign', note: 'open the next gate' },
      ],
    },
    {
      type: 'tagline', section: '07 — gatewright',
      lines: ['Every gate,', 'opened by *you*.'],
      label: 'plan → sign → watch → ramp',
    },
    {
      type: 'end',
      name: 'gatewright',
      items: ['PLAN', 'SIGN', 'WATCH', 'RAMP'],
      url: 'gatewright.example/docs',
      foot: ['Apache-2.0 · macOS / Linux / CI', 'Every gate, opened by you.'],
    },
  ],
};

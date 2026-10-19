// content.js — the film. The only file edited for an ordinary film; read TEMPLATE.md first.
// 6–9 sheets laid out in a serpentine on one drawing, plus up to two `overview` pull-outs (2–9 in an excerpt).
// No duration and no bars: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js).
//
// PLACEHOLDER COPY. "tidepool" is an invented backup tool, there only so every slot shows a realistic length.
// Replace every line with your product's own words; do not keep its sentence shapes, and do not fall back on
// "X in. Y out." or a "Who …?" headline, the source film's lines that every film made from it repeated
// (mode card, Factory defaults). Its numbers (row counts, hashes) are illustrative.
// Budget (timing API 3): every line, value, question and answer enters on its own cue and carries at most five
// words; the sheet's reading must end within two beats of its last landing; notes of six words or fewer are read
// at a glance. The copy below is cut to that: terse questions, short subs, short stamps.
export default {
  // bpm: 100,     // optional; default 100, range 92–108 (timing.rules.js)
  // target: 80,   // optional seconds; the tempo moves inside its range to meet it
  // linework: 'pencil', // optional; 'ink' (default) | 'pencil', the drafting instrument (TEMPLATE.md "Line work")
  // excerpt: true,      // optional; a 2–9 sheet cut-down without the release card (TEMPLATE.md "Excerpts")
  palette: 'cyanotype',
  original: 'vellum', // the pencil original the film is drafted on until the detail sheet marked issue: true

  seed: 7,
  meta: {
    title: 'tidepool', // title block name and HUD product line (≤ 12)
    subtitle: 'Backups proven by restore', // HUD product line (≤ 28)
    corner: 'Apache-2.0 · Open source', // top-right corner note (≤ 24)
    url: 'github.com/example/tidepool',
  },
  scenes: [
    {
      type: 'problem',
      hud: 'Problem statement',
      label: 'Fig. 1 — current practice',
      lines: ['Backups run nightly.', 'Nobody restores them.'],
      mark: 'restores them.',
      items: [
        { key: 'Schedule', value: '02:00' },
        { key: 'Last restore', value: 'never' },
        { key: 'Checksums', value: 'unchecked' },
        { key: 'On failure', value: 'silence' },
      ],
      note: '4 open items',
    },
    {
      type: 'arrangement',
      hud: 'General arrangement',
      label: 'Fig. 2 — general arrangement',
      lines: ['Backed up nightly,', 'restored weekly.'],
      sub: 'Restores each backup, then checks it.',
      input: { tag: 'Input', name: 'DATABASE' },
      system: { tag: 'Scheduler', name: 'tidepool' },
      output: { tag: 'Output · checked', name: 'RESTORE LOG' },
    },
    {
      type: 'interface',
      hud: 'Detail 01 · Console',
      label: 'Detail 01 — the backup, opened',
      title: 'CONSOLE',
      sub: 'Every backup, opened into its parts.',
      regions: ['tidepool · main db', 'Backups', 'Restore log', 'Row counts', 'Checksums', 'Schedule'],
      // views: ['Outline', 'Isometric'], // optional: the figure's two labels
    },
    {
      type: 'detail',
      hud: 'Detail 02 · Policy',
      label: 'Detail 02 — restore policy',
      title: 'POLICY',
      sub: 'Asked once, applied to every run.',
      rows: [
        { q: 'Restore where?', a: 'Scratch' },
        { q: 'Retention?', a: '90 days' },
        { q: 'On failure?', a: 'Page' },
      ],
      summary: 'Policy · scratch · 90 days · page',
      note: 'saved → tidepool.toml',
      stamp: { word: 'Confirmed', small: 'By you' }, // a person's decision: amber
      issue: true, // the stamp issues the print: the pencil original floods into the palette's print
    },
    {
      type: 'section',
      hud: 'Detail 03 · Seal',
      label: 'Detail 03 — the archive',
      title: 'SEAL',
      sub: 'Compressed, hashed, encrypted.',
      parts: [
        { name: 'dump.zst', desc: 'compressed SQL dump', lines: [] },
        { name: 'manifest', desc: 'sizes and hashes', lines: ['tables 42 · rows 1.8 M', 'sha256 per file'] },
      ],
      notes: ['Checksums recorded.', 'Encrypted at rest.'],
      dimension: 'sha256 3be1…09c2',
      output: 'ARCHIVE',
      stamp: { word: 'Sealed', small: 'checksum ok' }, // a machine's check: line-colour inspection stamp
    },
    {
      type: 'checklist',
      hud: 'Detail 04 · Probe',
      label: 'Detail 04 — row-count probes',
      title: 'PROBE',
      sub: 'Row counts: restored copy vs. source.',
      head: ['Table', 'Rows match'],
      items: ['users', 'orders', 'invoices', 'events', 'sessions', 'audit'].map((id) => ({ id, ok: true })),
      countLabel: 'tables match the source',
      note: 'Drift → flagged, not hidden',
      footer: 'Failures page a person.',
      stamp: { word: 'Restored' }, // a machine's check: line colour; small line defaults to the computed count, "6 / 6"
    },
    {
      type: 'overview', final: true,
      hud: 'System overview',
      label: 'System overview — all sheets',
      lines: ['Proven by restore,', 'not by hope.'],
      stamp: { word: 'Approved', small: 'You sign off' }, // lands in the title block's APPROVED BY cell
    },
    {
      type: 'release',
      hud: 'Release',
      label: 'Release',
      kicker: 'Backups you have actually restored',
      name: 'tidepool',
      tags: ['policy', 'seal', 'restore', 'probe'],
      url: 'github.com/example/tidepool',
      foot: [['Apache-2.0', 'ink'], [' · Postgres / MySQL / SQLite', 'muted']],
      // status: 'Released', // optional (≤ 12): lettered in on the film's last downbeat
    },
  ],
};

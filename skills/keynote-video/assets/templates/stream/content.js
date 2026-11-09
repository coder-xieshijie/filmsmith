// content.js — the film. The only file edited for an ordinary film (see TEMPLATE.md for every slot and its limits).
// Example: Skein, a fictional desk that runs your agent tasks in parallel and brings results back checked.
// The same film in Chinese is examples/content.zh.js: write the copy in the film's language, then set `lang`.
export default {
  lang: 'en', // 'en' | 'zh' — sets fonts, reading time, line breaking, type sizes and <html lang>
  palette: 'night', // night | ember | aurora | mono (palettes.js)
  opening: 'desk', // 'desk' — a daytime desktop piles up and is threaded; 'night' — scattered cards in the night sky are threaded
  lockup: 'name', // 'name' — the thread winds into a point and the name opens out of it; 'mascot' — the mascot hops onto the wordmark
  seed: 7,
  // bpm: 128,  // optional; 120–132
  product: { name: 'Skein', role: 'Your agent desk', tagline: 'Hand it off. Get it back checked.' },
  ui: { running: 'Running', done: 'Done', queued: 'Queued', needsYou: 'Needs you', tasks: 'Tasks', all: 'All', workspace: 'Workspace', you: 'You', input: 'Ask anything…' },
  scenes: [
    {
      type: 'open',
      sessions: [
        { title: 'Session 1 · Research', ask: 'Look into these links', status: 'Thinking…' },
        { title: 'Session 2 · Proposal', ask: 'Write up a proposal', status: 'Generating…' },
        { title: 'Session 3 · Code', ask: 'Fix this function', status: 'Needs your approval' },
      ],
      alerts: [
        { title: 'Needs your approval', yes: 'Allow', no: 'Deny' },
        { title: 'Done? Take a look', yes: 'Open', no: 'Later' },
        { title: 'Waiting for your reply', yes: 'Reply', no: 'Later' },
        { title: 'Keep going?', yes: 'Continue', no: 'Stop' },
      ],
      note: ['Which one finished?', 'Which one wants me to click Allow?'],
      freeze: 'Until today.',
    },
    { type: 'intro', lines: ["Hand me your tasks. I'll come back with results.", "No need to watch. I'll ask when it's your call."] },
    {
      type: 'ask', caption: 'One ask', file: 'sketch.png', ask: 'Turn this sketch into an app icon', reply: "Got it. I'll send a task to do it.", chip: '1 task created',
      task: { title: 'Sketch → app icon', running: 'Running · reading the sketch', done: 'Done · 3 icons, middle recommended' },
    },
    {
      type: 'evening', caption: 'One evening', more: 10,
      asks: [
        { ask: 'Add a CSV option to export', task: 'CSV option for export' },
        { ask: "Clean up Wednesday's meeting notes", task: 'Meeting notes, Wednesday' },
        { ask: "Sum up this week's user feedback", task: 'Weekly user feedback' },
        { ask: 'Start a draft of the weekly report', task: 'Draft the weekly report' },
        { ask: 'Look into this login error', task: 'Fix the login error' },
      ],
    },
    {
      type: 'constellation', caption: 'A job that keeps going',
      ask: 'Plan a video editor: research frameworks, rivals and needs.',
      offer: 'This will run a while. Open a workspace for it?', yes: 'Yes',
      workspace: 'Video editor',
      jobs: [{ label: 'Frameworks' }, { label: 'Rivals' }, { label: 'User needs' }],
      plan: { label: 'Pick the stack', waits: 'Queued · waits for 3' },
      result: "Framework A. B can't export; C's license won't fit.",
      caption2: 'Three findings, one answer',
    },
    {
      type: 'verify', caption: 'Done means checked', gate: 'Check', item: 'Stack proposal',
      fail: 'Not passed · sent back', pass: 'Checked · framework A',
    },
    {
      type: 'cards', caption: 'Tasks end. The workspace stays.', caption2: 'Every new task starts from here',
      cards: [
        { title: 'Summary', sub: 'Goal, decisions, status', rows: ['Goal · a video editor', 'Decision · framework A'] },
        { title: 'Memory', sub: 'What you asked it to keep', rows: ['Reports stay under a page', 'Exports always carry subtitles'] },
        { title: 'Files', sub: 'Everything delivered', rows: ['frameworks.md', 'stack-proposal.md'] },
      ],
    },
    {
      type: 'close', caption: 'It comes to you only when needed',
      panel: {
        title: 'All workspaces',
        rows: [
          { title: 'Pick the stack', status: 'needs', detail: 'Use framework A?' },
          { title: 'Frameworks', status: 'done', detail: 'One-page comparison' },
          { title: 'Rivals', status: 'done', detail: 'Export compared' },
          { title: 'User needs', status: 'done', detail: 'Needs list' },
        ],
      },
      nudge: 'Your call on the stack',
      claim: 'You do three things', words: ['Ask', 'Decide', 'Review'],
    },
    { type: 'lockup' },
  ],
};

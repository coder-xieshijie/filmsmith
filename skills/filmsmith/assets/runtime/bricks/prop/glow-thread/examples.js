// examples.js — the stream template's worked example (Skein, a fictional desk that runs agent tasks in parallel and
// brings results back checked), in English and in Chinese: the film every stream scene brick defaults to, so a scene
// alone draws its window of this film. From assets/templates/stream/content.js and examples/content.zh.js.
export const EN = {
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
export const ZH = {
  lang: 'zh',
  palette: 'night',
  opening: 'desk',
  lockup: 'name',
  seed: 7,
  product: { name: 'Skein', role: '你的任务调度台', tagline: '交出去，拿回核对过的结果。' },
  ui: { running: '进行中', done: '已完成', queued: '排队中', needsYou: '需要你', tasks: '任务', all: '全部', workspace: '任务空间', you: '你', input: '想做点什么…' },
  scenes: [
    {
      type: 'open',
      sessions: [
        { title: '会话 1 · 调研', ask: '看看这三个链接', status: '正在思考…' },
        { title: '会话 2 · 方案', ask: '写一份方案', status: '正在生成…' },
        { title: '会话 3 · 代码', ask: '修一下这个函数', status: '需要你的允许' },
      ],
      alerts: [
        { title: '需要你的允许', yes: '允许', no: '拒绝' },
        { title: '做完了？去看看', yes: '去看看', no: '稍后' },
        { title: '在等你回复', yes: '去回复', no: '稍后' },
        { title: '要继续吗？', yes: '继续', no: '停止' },
      ],
      note: ['哪个做完了？', '哪个在等我点“允许”？'],
      freeze: '直到今天。',
    },
    { type: 'intro', lines: ['把事交给我，做完带着结果回来找你。', '不用守着，要你拍板时我来问。'] },
    {
      type: 'ask', caption: '交代一件事', file: '草图.png', ask: '把草图做成应用图标', reply: '收到，派个任务去做。', chip: '新建了 1 个任务',
      task: { title: '草图 → 应用图标', running: '进行中 · 正在读草图', done: '已完成 · 推荐中间那版' },
    },
    {
      type: 'evening', caption: '一个晚上', more: 10,
      asks: [
        { ask: '导出加个 CSV 选项', task: '导出加 CSV 选项' },
        { ask: '整理周三的会议记录', task: '整理周三会议记录' },
        { ask: '汇总这周的用户反馈', task: '汇总本周用户反馈' },
        { ask: '周报先起个草稿', task: '起草本周周报' },
        { ask: '登录报错查一下', task: '修复登录报错' },
      ],
    },
    {
      type: 'constellation', caption: '一件要持续推进的事',
      ask: '做个剪辑工具：调研框架、竞品和需求。',
      offer: '要推进一阵子，建个任务空间？', yes: '好',
      workspace: '视频剪辑',
      jobs: [{ label: '调研框架' }, { label: '看竞品' }, { label: '理需求' }],
      plan: { label: '定技术方案', waits: '排队中 · 等三个调研' },
      result: '推荐框架 A：B 导出弱，C 授权不合适。',
      caption2: '三个调研，合成一个结论',
    },
    {
      type: 'verify', caption: '完成，是核对过的完成', gate: '核对', item: '技术方案',
      fail: '没通过 · 发回返工', pass: '核对通过 · 框架 A',
    },
    {
      type: 'cards', caption: '任务结束了，空间还在', caption2: '新任务开工，先从这里读起',
      cards: [
        { title: '空间摘要', sub: '目标、决定和现状', rows: ['目标 · 剪辑工具', '决定 · 框架 A'] },
        { title: '记忆', sub: '你让它记住的事', rows: ['报告不超一页', '导出都带字幕'] },
        { title: '资料', sub: '交付的文件', rows: ['框架调研.md', '技术方案.md'] },
      ],
    },
    {
      type: 'close', caption: '只在需要你的时候来找你',
      panel: {
        title: '全部空间',
        rows: [
          { title: '定技术方案', status: 'needs', detail: '用框架 A 吗？' },
          { title: '调研框架', status: 'done', detail: '一页对比表' },
          { title: '看竞品', status: 'done', detail: '导出能力对比' },
          { title: '理需求', status: 'done', detail: '需求清单' },
        ],
      },
      nudge: '技术方案等你拍板',
      claim: '你只做三件事', words: ['交代', '拍板', '验收'],
    },
    { type: 'lockup' },
  ],
};
export default { en: EN, zh: ZH };

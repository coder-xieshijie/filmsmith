// day-after-day — the days go on in one chat (the stream style's optional scene between the three cards and the closing
// sweep): a chat block unfolds from the spine and days scroll past in it (a day divider, an ask, an answer each, read at a
// glance), then today's question and the product's answer written from what it kept; the progress runs back along the
// three strands to the mascot, and one short line hangs on each card. Reads the same `film` as every stream scene (the
// cards it hangs on, the spine, the stars). From the stream original K (the source film
// s6-threads.html, "一直用下去": the days scrolling past, the progress along the strands, three lines on the cards).
import { filmScene, text } from '../../prop/glow-thread/kit.js';

const DEFAULT = {
  en: {
    caption: 'Every day, the same chat', sub: 'Nothing drops, nothing is forgotten',
    days: [{ day: 'Day 2', user: 'Is the report done?', bot: 'Done, under a page' }, { day: 'Day 3', user: 'Subtitles on the export?', bot: 'On every export' }, { day: 'Later', user: 'Where is the stack doc?', bot: 'In Files: stack-proposal.md' }],
    ask: 'Where are we now?', answer: 'Framework A is chosen; the prototype plan waits for you.', notes: ['Plan waits for you', 'Kept: under a page', '2 files kept'],
  },
  zh: {
    caption: '每天，都在同一个对话里', sub: '对话不会断，要紧的事不会忘',
    days: [{ day: '第二天', user: '报告写好了吗', bot: '写好了，不超一页' }, { day: '第三天', user: '导出带字幕了吗', bot: '每次导出都带' }, { day: '隔天', user: '技术方案在哪', bot: '在资料里：技术方案.md' }],
    ask: '现在进展怎么样？', answer: '框架定了 A，原型计划等你确认。', notes: ['计划等你确认', '已记：不超一页', '收了 2 份资料'],
  },
};

export default filmScene({
  id: 'day-after-day', type: 'days',
  fits: ['proof', 'rest'],
  beats: { min: 12, max: 28 },
  slots: {
    caption: text('caption', 'primary'),
    sub: text('sub', 'glance', { optional: true }),
    days: { type: 'list', count: [2, 5], of: { day: text('day', 'glance'), user: text('bubble', 'glance'), bot: text('bubble', 'glance') } },
    ask: text('bubble', 'glance'),
    answer: text('bubble', 'glance', { claim: true }),
    notes: { type: 'list', count: [3, 3], of: text('say', 'glance') },
    // optional: one summary card (its title) in place of the three: the cards fold into it, the days scroll by in one
    // move, the three lines hang inside it
    summary: text('cardTitle', 'glance', { optional: true }),
    // optional, with `summary`: rows under its title (1–3, as the cards it gathers: "Summary", "Files"), and the three
    // lines large under its rule instead of small tags (`bigNotes`)
    summaryRows: { type: 'list', count: [1, 3], optional: true, of: text('cardRow', 'glance') },
    bigNotes: { type: 'flag', default: false, optional: true },
  },
  defaults: (ctx) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'] }),
  reads: (s) => [s.caption], // primary; the days, the ask, the answer and the lines are glanced (sched.js)
  motions: ['hook-unfold', 'beam-return'], props: ['hung-block'],
  motion: 'a chat block unfolds from the spine; days scroll past in it; today\'s question and its answer; the progress runs back along the strands to the mascot; a line hangs on each card',
  shots: ['days', 'answer', 'notes'],
});

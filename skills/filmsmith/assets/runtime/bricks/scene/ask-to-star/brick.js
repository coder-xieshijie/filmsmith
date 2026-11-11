// ask-to-star — one ask becomes one task and one star: the user's message (with a file) and the product's reply arrive in
// the chat block, a chip says a task was created, the task row unfolds on a beam from the block's edge, runs, turns done,
// then shrinks into its status ring and leaves as a star with a comet tail, arcing up into the sky where it stays.
// From the stream template: film.js renderAsk, renderChat, the stars of renderBG; sched.js ask.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'ask-to-star', type: 'ask',
  fits: ['demo'],
  beats: { min: 12, max: 44 },
  slots: {
    caption: text('caption', 'primary'),
    file: text('file', 'glance', { optional: true }),
    ask: text('bubble', 'glance'),
    reply: text('bubble', 'glance'),
    chip: text('rowSub', 'glance'),
    task: { type: 'group', of: { title: text('row', 'primary'), running: text('rowSub', 'glance'), done: text('rowSub', 'glance') } },
    // optional: the picture the ask is about (a URL): it flies in on the right and shrinks into the ask as its thumbnail
    // (in place of the file chip)
    image: { type: 'image', crop: false, optional: true },
    // optional: a decision asked with a recommendation, drawn in the engine's canvas: a caption, a question card (2–4
    // options, the recommended one tagged), the cursor picks it, the card folds into the chat as the user's answer
    choice: { type: 'group', optional: true, of: {
      caption: text('caption', 'primary'), question: text('question', 'glance'), step: text('step', 'glance', { optional: true, sample: 'default' }),
      options: { type: 'list', count: [2, 4], of: { label: text('option', 'glance'), desc: text('optionDesc', 'glance', { optional: true, sample: 'default' }) } },
      pick: { type: 'number', min: 0, max: 3, optional: true, sample: 'default' }, answer: text('bubble', 'glance', { optional: true, sample: 'default' }),
    } },
  },
  reads: (s) => [s.caption, s.choice?.caption], // primary; the rest is glanced (sched.js)
  motions: ['hook-unfold', 'star-launch'], props: ['hung-block'],
  motion: 'ask and reply in the chat; the task row unfolds on a beam, runs, turns done, shrinks into its ring and flies off as a star',
  shots: ['chat', 'row', 'star'],
});

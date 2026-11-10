// job-constellation — a job that keeps going: an ask and an offer in the chat, a dashed workspace region with its name,
// three jobs and a plan launched from the thread as stars along beams, each labelled with its status; results flow back
// along the beams as beads of light and the jobs turn done; on the drop the plan joins the three into a constellation
// (the second peak); one answer comes back into the chat. From the stream template: film.js renderConst; sched.js
// constellation; plan.js CONST.
import { filmScene, text } from '../../prop/glow-thread/kit.js';

export default filmScene({
  id: 'job-constellation', type: 'constellation',
  fits: ['climax', 'demo'],
  beats: { min: 20, max: 44 },
  slots: {
    caption: text('caption', 'primary'),
    ask: text('bubble', 'glance'),
    offer: text('bubble', 'glance'),
    yes: text('word', 'glance'),
    workspace: text('label', 'glance'),
    jobs: { type: 'list', count: [3, 3], of: { label: text('label', 'glance') } },
    plan: { type: 'group', of: { label: text('label', 'glance'), waits: text('labelSub', 'glance') } },
    result: text('bubble', 'primary', { claim: true }),
    caption2: text('caption', 'glance'),
    // optional: the workspace's header (a space chip with its name, a filter row with live counts) in place of its small
    // label, as ui-kit's space header
    head: { type: 'flag', default: false, optional: true },
    // optional: the new-workspace dialog after the yes (1–3 fields), folded into the workspace's name
    modal: { type: 'group', optional: true, of: { title: text('question', 'glance'), fields: { type: 'list', count: [1, 3], of: { label: text('field', 'glance'), value: text('field', 'glance'), required: { type: 'flag', default: false } } }, note: text('optionDesc', 'glance', { optional: true, sample: 'default' }) } },
  },
  reads: (s) => [s.caption, s.result], // primary; the rest is glanced (sched.js)
  motions: ['beam-return'], props: ['hung-block'],
  motion: 'a workspace opens; three jobs and a plan fly out along beams; results flow back; the plan links them into a constellation',
  shots: ['chat', 'beams', 'constellation'],
});

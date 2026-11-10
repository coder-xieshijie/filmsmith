// rules.js — how long each stream scene needs: the template's timing.rules.js, read by the runtime's timing.js fit().
// Copied from assets/templates/stream/timing.rules.js; changed: the language functions come from text.js.

import { schedule } from './sched.js';
import { len, LIMITS } from './text.js';
const langOf = (content) => (content?.lang === 'zh' ? 'zh' : 'en');

const REASON = 'stream: one continuous composition on the thread; length = choreography + reading (sched.js)';
const TYPES = ['open', 'intro', 'ask', 'evening', 'constellation', 'verify', 'cards', 'days', 'close', 'lockup'];
const OPTIONAL = new Set(['days']); // a film may leave these scenes out

// slot → limit key, per type; arrays are checked item by item
const SLOTS = {
  open: (s) => [...s.sessions.flatMap((x) => [['window', x.title], ['popup', x.ask], ['popup', x.status]]), ...s.alerts.flatMap((a) => [['popup', a.title], ['word', a.yes], ['word', a.no]]), ...s.note.map((x) => ['note', x]), ['freeze', s.freeze]],
  intro: (s) => [...s.lines.map((x) => ['bubble', x]), ...(s.title ? [['name', s.title]] : []), ...(s.role ? [['role', s.role]] : [])],
  ask: (s) => [['caption', s.caption], ...(s.image ? [] : [['file', s.file]]), ['bubble', s.ask], ['bubble', s.reply], ['rowSub', s.chip], ['row', s.task.title], ['rowSub', s.task.running], ['rowSub', s.task.done],
    ...(s.choice ? [['caption', s.choice.caption], ['question', s.choice.question], ...(s.choice.step ? [['step', s.choice.step]] : []), ...s.choice.options.flatMap((o) => [['option', o.label], ...(o.desc ? [['optionDesc', o.desc]] : [])]), ...(s.choice.answer ? [['bubble', s.choice.answer]] : [])] : [])],
  evening: (s) => [['caption', s.caption], ...s.asks.flatMap((a) => [['bubble', a.ask], ['row', a.task], ...(a.file ? [['file', a.file]] : []), ...(a.progress ? [['rowSub', a.progress]] : [])]),
    ...(s.followUp ? [['caption', s.followUp.caption], ['quote', s.followUp.quote], ['bubble', s.followUp.text], ...(s.followUp.tag ? [['label', s.followUp.tag]] : [])] : [])],
  constellation: (s) => [['caption', s.caption], ['bubble', s.ask], ['bubble', s.offer], ['word', s.yes], ['label', s.workspace], ...s.jobs.map((j) => ['label', j.label]), ['label', s.plan.label], ['labelSub', s.plan.waits], ['bubble', s.result], ['caption', s.caption2],
    ...(s.modal ? [['question', s.modal.title], ...s.modal.fields.flatMap((f) => [['field', f.label], ['field', f.value]]), ...(s.modal.note ? [['optionDesc', s.modal.note]] : [])] : [])],
  verify: (s) => [['caption', s.caption], ['word', s.gate], ['label', s.item], ['labelSub', s.fail], ['labelSub', s.pass], ...(s.explain ? [['bubble', s.explain]] : []),
    ...(s.graph ? [['caption', s.graph.caption], ['label', s.graph.node], ...s.graph.outs.map((x) => ['labelSub', x]), ['labelSub', s.graph.back], ['caption', s.graph.caption2]] : [])],
  cards: (s) => [['caption', s.caption], ['caption', s.caption2], ...s.cards.flatMap((c) => [['cardTitle', c.title], ['cardSub', c.sub], ...c.rows.map((r) => ['cardRow', r]), ...(c.say ? [['caption', c.say]] : []), ...(c.flow ? [['cardRow', c.flow]] : []), ...(c.task ? [['row', c.task.title], ...(c.task.detail ? [['rowSub', c.task.detail]] : [])] : [])])],
  days: (s) => [['caption', s.caption], ...(s.sub ? [['sub', s.sub]] : []), ...s.days.flatMap((d) => [['day', d.day], ['bubble', d.user], ['bubble', d.bot]]), ['bubble', s.ask], ['bubble', s.answer], ...s.notes.map((x) => ['say', x]), ...(s.summary ? [['cardTitle', s.summary]] : []), ...(s.summaryRows || []).map((x) => ['cardRow', x])],
  close: (s) => [['caption', s.caption], ...(s.caption2 ? [['caption', s.caption2]] : []), ['row', s.panel.title], ...(s.panel.tabs || []).map((x) => ['tab', x]), ...s.panel.rows.flatMap((r) => [['row', r.title], ['rowSub', r.detail], ...(r.group ? [['rowSub', r.group]] : []), ...(r.time ? [['time', r.time]] : [])]), ['rowSub', s.nudge], ['claim', s.claim], ...s.words.map((w) => ['word', w])],
  lockup: () => [],
};
const SHAPE = {
  open: (s) => [Array.isArray(s.sessions) && s.sessions.length === 3 || 'open.sessions: exactly 3', Array.isArray(s.alerts) && s.alerts.length >= 1 && s.alerts.length <= 6 || 'open.alerts: 1–6', s.copies == null || (Number.isInteger(s.copies) && s.copies >= 4 && s.copies <= 30) || 'open.copies: 4–30', Array.isArray(s.note) && s.note.length === 2 || 'open.note: 2 lines'],
  intro: (s) => [Array.isArray(s.lines) && s.lines.length === 2 || 'intro.lines: 2 lines'],
  ask: (s) => [!!s.task || 'ask.task: { title, running, done }', s.image == null || (typeof s.image === 'string' && !!s.image) || 'ask.image: an image URL',
    s.choice == null || (Array.isArray(s.choice.options) && s.choice.options.length >= 2 && s.choice.options.length <= 4) || 'ask.choice.options: 2–4 { label, desc }',
    s.choice == null || s.choice.pick == null || (Number.isInteger(s.choice.pick) && s.choice.pick >= 0 && s.choice.pick < (s.choice.options?.length ?? 0)) || 'ask.choice.pick: an option index'],
  evening: (s) => [Array.isArray(s.asks) && s.asks.length >= 3 && s.asks.length <= 8 || 'evening.asks: 3–8 items', Number.isInteger(s.more) && s.more >= 0 && s.more <= 16 || 'evening.more: 0–16',
    s.followUp == null || (Number.isInteger(s.followUp.to) && s.followUp.to >= 0 && s.followUp.to < (s.asks?.length ?? 0)) || 'evening.followUp.to: the index of an ask',
    s.followUp?.after == null || (Number.isInteger(s.followUp.after) && s.followUp.after >= s.followUp.to && s.followUp.after < (s.asks?.length ?? 0)) || 'evening.followUp.after: the index of an ask at or after `to`',
    s.fileInBubble == null || typeof s.fileInBubble === 'boolean' || 'evening.fileInBubble: true or false'],
  constellation: (s) => [Array.isArray(s.jobs) && s.jobs.length === 3 || 'constellation.jobs: exactly 3', !!s.plan || 'constellation.plan: { label, waits }',
    s.modal == null || (Array.isArray(s.modal.fields) && s.modal.fields.length >= 1 && s.modal.fields.length <= 3) || 'constellation.modal.fields: 1–3 { label, value, required }',
    s.head == null || typeof s.head === 'boolean' || 'constellation.head: true or false'],
  verify: (s) => [s.graph == null || (Array.isArray(s.graph.outs) && s.graph.outs.length >= 3 && s.graph.outs.length <= 6) || 'verify.graph.outs: 3–6'],
  cards: (s) => [Array.isArray(s.cards) && s.cards.length === 3 || 'cards.cards: exactly 3', ...(s.cards || []).map((c, k) => (c.rows?.length >= 1 && c.rows.length + (c.flow ? 1 : 0) <= 5) || `cards.cards[${k}].rows: 1–5 (with the flow line)`)],
  days: (s) => [Array.isArray(s.days) && s.days.length >= 2 && s.days.length <= 5 || 'days.days: 2–5 { day, user, bot }', Array.isArray(s.notes) && s.notes.length === 3 || 'days.notes: exactly 3 (one per card)',
    s.summaryRows == null || (!!s.summary && Array.isArray(s.summaryRows) && s.summaryRows.length >= 1 && s.summaryRows.length <= 3) || 'days.summaryRows: 1–3, with `summary`',
    s.bigNotes == null || typeof s.bigNotes === 'boolean' || 'days.bigNotes: true or false'],
  close: (s) => [Array.isArray(s.panel?.rows) && s.panel.rows.length >= 2 && s.panel.rows.length <= 4 || 'close.panel.rows: 2–4', s.panel?.rows?.filter((r) => r.status === 'needs').length === 1 || 'close.panel.rows: exactly one status "needs"', Array.isArray(s.words) && s.words.length === 3 || 'close.words: exactly 3',
    s.panel?.tabs == null || (Array.isArray(s.panel.tabs) && s.panel.tabs.length >= 2 && s.panel.tabs.length <= 3) || 'close.panel.tabs: 2–3',
    s.panel?.head == null || typeof s.panel.head === 'boolean' || 'close.panel.head: true or false',
    s.panel?.warnAtNeed == null || typeof s.panel.warnAtNeed === 'boolean' || 'close.panel.warnAtNeed: true or false'],
  lockup: () => [],
};

// Key events for check-film: the beat-locked moments that carry a hit in score.mjs. The opening's hook lands half a
// second after the mascot and the gate's stamp on the half beat, off the grid by design, so neither is a key.
const KEYS = {
  constellation: (k) => [{ t: k.link, kind: 'accent', drop: true }], // the constellation links, music drops
  close: (k) => [{ t: k.unfold, kind: 'accent', drop: true }], // the point opens into the panel (climax)
  lockup: (k) => [{ t: k.open, kind: 'land' }], // the name opens
};

export const validate = (content) => {
  const lang = langOf(content), L = LIMITS[lang], errs = [];
  if (content.lang && content.lang !== lang) errs.push(`lang "${content.lang}": use 'en' or 'zh'`);
  if (!['desk', 'night'].includes(content.opening ?? 'desk')) errs.push(`opening "${content.opening}": use 'desk' or 'night'`);
  if (!['name', 'mascot'].includes(content.lockup ?? 'name')) errs.push(`lockup "${content.lockup}": use 'name' or 'mascot'`);
  const order = content.scenes.map((s) => s.type).join(' ');
  const want = TYPES.filter((t) => !OPTIONAL.has(t) || content.scenes.some((s) => s.type === t)).join(' ');
  if (order !== want) errs.push(`scenes: the stream skeleton is ${TYPES.map((t) => (OPTIONAL.has(t) ? `[${t}]` : t)).join(' → ')} in this order, [ ] optional (got ${order}) (no cut-down yet: TEMPLATE.md "Scenes")`);
  const p = content.product || {};
  if (len(p.name) > L.name) errs.push(`product.name: ${len(p.name)} > ${L.name} characters`);
  if (len(p.tagline) > L.tagline) errs.push(`product.tagline: ${len(p.tagline)} > ${L.tagline} characters`);
  content.scenes.forEach((s, i) => {
    if (!SLOTS[s.type]) return;
    for (const m of SHAPE[s.type](s)) if (m !== true) errs.push(`scene ${i} ${m}`);
    if (s.holds != null && (typeof s.holds !== 'object' || Array.isArray(s.holds) || !Object.values(s.holds).every((v) => [v].flat().every((x) => x == null || (Number.isFinite(x) && x >= 0 && x <= 20))))) errs.push(`scene ${i} ${s.type}.holds: { key: seconds 0–20, or an array of them }`);
    if (s.glance != null && !(Number.isFinite(s.glance) && s.glance >= 0.3 && s.glance <= 3)) errs.push(`scene ${i} ${s.type}.glance: 0.3–3 s`);
    if (errs.length) return;
    for (const [key, text] of SLOTS[s.type](s)) {
      if (typeof text !== 'string' || !text) { errs.push(`scene ${i} (${s.type}): a ${key} slot is empty`); continue; }
      if (len(text) > L[key]) errs.push(`scene ${i} (${s.type}) ${key} "${text}": ${len(text)} > ${L[key]} characters (${lang})`);
    }
  });
  return errs;
};

export default (content) => {
  const lang = langOf(content);
  const type = (name) => ({
    rest: true, reason: REASON,
    need: (s, g) => schedule(s, g.beat, lang, content).dur,
    events: (s, g) => {
      const sc = schedule(s, g.beat, lang, content);
      return {
        keys: KEYS[s.type]?.(sc) ?? [],
        micro: sc.cues.map((c) => ({ t: c.t, what: c.kind })),
        peaks: sc.peak ? [sc.peak] : [],
      };
    },
  });
  return {
    api: 1,
    bpm: { default: 128, min: 120, max: 132 },
    beatsPerBar: 4, unit: 0.25, phrase: 1,
    types: Object.fromEntries(TYPES.map((t) => [t, type(t)])),
    validate,
  };
};

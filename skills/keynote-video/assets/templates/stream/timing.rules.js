// timing.rules.js — how long each stream scene needs. lib/timing.js fit() reads this (CONTRACT.md "Length follows
// content"); index.html, score.mjs and lib/fit.mjs all call fit(), so picture, sound and data-duration agree.
//
// Each type's need() is the duration of its choreography in sched.js, whose reading holds come from lang.js
// (English 0.3 s a word; Chinese 6 characters a second + 0.5 s a state). A stream scene is one continuous
// composition hung on the thread (no cuts inside or between scenes), so the page ceilings of api 2 and the T1
// "≤ 6 s per composition" of api 3 do not describe it: the rules declare api 1 and mark every type `rest` with that
// reason, and the tier measures are reported as INFO. Moving to api 3 (shots inside each scene) is a known issue on
// the mode card.

import { schedule } from './sched.js';
import { langOf, len, LIMITS } from './lang.js';

const REASON = 'stream: one continuous composition on the thread; length = choreography + reading (sched.js)';
const TYPES = ['open', 'intro', 'ask', 'evening', 'constellation', 'verify', 'cards', 'close', 'lockup'];

// slot → limit key, per type; arrays are checked item by item
const SLOTS = {
  open: (s) => [...s.sessions.flatMap((x) => [['window', x.title], ['popup', x.ask], ['popup', x.status]]), ...s.alerts.flatMap((a) => [['popup', a.title], ['word', a.yes], ['word', a.no]]), ...s.note.map((x) => ['note', x]), ['freeze', s.freeze]],
  intro: (s) => s.lines.map((x) => ['bubble', x]),
  ask: (s) => [['caption', s.caption], ['file', s.file], ['bubble', s.ask], ['bubble', s.reply], ['rowSub', s.chip], ['row', s.task.title], ['rowSub', s.task.running], ['rowSub', s.task.done]],
  evening: (s) => [['caption', s.caption], ...s.asks.flatMap((a) => [['bubble', a.ask], ['row', a.task]])],
  constellation: (s) => [['caption', s.caption], ['bubble', s.ask], ['bubble', s.offer], ['word', s.yes], ['label', s.workspace], ...s.jobs.map((j) => ['label', j.label]), ['label', s.plan.label], ['labelSub', s.plan.waits], ['bubble', s.result], ['caption', s.caption2]],
  verify: (s) => [['caption', s.caption], ['word', s.gate], ['label', s.item], ['labelSub', s.fail], ['labelSub', s.pass]],
  cards: (s) => [['caption', s.caption], ['caption', s.caption2], ...s.cards.flatMap((c) => [['cardTitle', c.title], ['cardSub', c.sub], ...c.rows.map((r) => ['cardRow', r])])],
  close: (s) => [['caption', s.caption], ['row', s.panel.title], ...s.panel.rows.flatMap((r) => [['row', r.title], ['rowSub', r.detail]]), ['rowSub', s.nudge], ['claim', s.claim], ...s.words.map((w) => ['word', w])],
  lockup: () => [],
};
const SHAPE = {
  open: (s) => [Array.isArray(s.sessions) && s.sessions.length === 3 || 'open.sessions: exactly 3', Array.isArray(s.alerts) && s.alerts.length === 4 || 'open.alerts: exactly 4', Array.isArray(s.note) && s.note.length === 2 || 'open.note: 2 lines'],
  intro: (s) => [Array.isArray(s.lines) && s.lines.length === 2 || 'intro.lines: 2 lines'],
  ask: (s) => [!!s.task || 'ask.task: { title, running, done }'],
  evening: (s) => [Array.isArray(s.asks) && s.asks.length >= 3 && s.asks.length <= 8 || 'evening.asks: 3–8 items', Number.isInteger(s.more) && s.more >= 0 && s.more <= 16 || 'evening.more: 0–16'],
  constellation: (s) => [Array.isArray(s.jobs) && s.jobs.length === 3 || 'constellation.jobs: exactly 3', !!s.plan || 'constellation.plan: { label, waits }'],
  verify: () => [],
  cards: (s) => [Array.isArray(s.cards) && s.cards.length === 3 || 'cards.cards: exactly 3', ...(s.cards || []).map((c, k) => (c.rows?.length >= 1 && c.rows.length <= 3) || `cards.cards[${k}].rows: 1–3`)],
  close: (s) => [Array.isArray(s.panel?.rows) && s.panel.rows.length >= 2 && s.panel.rows.length <= 4 || 'close.panel.rows: 2–4', s.panel?.rows?.filter((r) => r.status === 'needs').length === 1 || 'close.panel.rows: exactly one status "needs"', Array.isArray(s.words) && s.words.length === 3 || 'close.words: exactly 3'],
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
  if (order !== TYPES.join(' ')) errs.push(`scenes: the stream skeleton is ${TYPES.join(' → ')} in this order (got ${order}) (no cut-down yet: TEMPLATE.md "Scenes")`);
  const p = content.product || {};
  if (len(p.name) > L.name) errs.push(`product.name: ${len(p.name)} > ${L.name} characters`);
  if (len(p.tagline) > L.tagline) errs.push(`product.tagline: ${len(p.tagline)} > ${L.tagline} characters`);
  content.scenes.forEach((s, i) => {
    if (!SLOTS[s.type]) return;
    for (const m of SHAPE[s.type](s)) if (m !== true) errs.push(`scene ${i} ${m}`);
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

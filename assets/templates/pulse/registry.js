// registry.js — the pulse scene registry and the pure helpers that timing.rules.js (how long a scene needs),
// plan.js (when everything happens inside it), film.js and score.mjs all read, so they never disagree.

export const CANVAS = { width: 1920, height: 1080, fps: 30 };

// type → character limits per slot and item counts (TEMPLATE.md explains each). Bars are not here: they are fitted.
// Character limits are a first filter; film.js measures every string once the fonts are in and paints a red
// banner when one still crosses the 160 px margin at its auto-fit floor.
export const REGISTRY = {
  ask: { limits: { word: 14, param: 34 }, items: [2, 6] },
  search: { limits: { line: 34, label: 5, value: 8, query: 48 }, items: [2, 5] },
  data: { limits: { value: 9, label: 26, query: 48 }, items: [1, 3] },
  reveal: { limits: { value: 7, line: 30, query: 48 }, items: [0, 0] },
  name: { limits: { name: 12, version: 6, line: 34, install: 34 }, items: [0, 0] },
};
export const TYPES = Object.keys(REGISTRY);

// Scene changes (`to` on the outgoing scene). The tier is the pacing tier of references/principles.md (batch 4,
// T0–T3): T1 a new composition, T2 an expressive transition (at most 3 uses of one device in a film).
export const TRANSITIONS = {
  aperture: { tier: 'T1', what: 'the next scene opens in a geometric aperture onto its ground (X18 aperture-swap)' },
  cut: { tier: 'T1', what: 'a plain cut on the beat' },
  invert: { tier: 'T2', what: 'hard flip to the inverted ground on the downbeat (whole-frame change of ground)' },
  whip: { tier: 'T2', what: 'the next card pushes the old one off to the left with a motion streak (X19 whip-push)' },
  slice: { tier: 'T2', what: 'the old scene leaves in line-high bands, the next smears in and resolves (X20 slice-smear)' },
  portal: { tier: 'T2', what: 'from a reveal only: push through the counter of the answer into the next scene (X23 counter-portal)' },
};
export const T2_MAX_USES = 3;
// content.aperture: the form variant (mode card "Variants"). 'cut' (default): straight-edged apertures and square
// cells; 'round': circular apertures, pill cells and highlight.
export const APERTURE_IDS = ['cut', 'round'];

// Glyphs that close a counter in Barlow (checked again on the rendered glyph in film.js before a portal is drawn).
export const COUNTER_GLYPHS = '0689ABDOPQRabdegopq';
export const counterIndex = (s) => [...String(s ?? '')].findIndex((ch) => COUNTER_GLYPHS.includes(ch));

// ---------- copy ----------
export const fill = (s, f) => (s == null ? s : String(s).replace(/\{([\w.:-]+)\}/g, (m, k) => (k in f ? f[k] : m)));

// ask words are strings or { text, param }; param is the query fragment typed with the word.
export const wordOf = (w) => (typeof w === 'string' ? { text: w, param: null } : { text: w.text, param: w.param ?? null });

// The first number in a value ('4.8 s' → 4.8, '2,400' → 2400); NaN when there is none.
export const numberOf = (v) => {
  const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

// A search's outcome, computed from its candidates and limit: which pass, and the best of them (the answer).
// better: 'lower' (default: times, sizes) or 'higher' (throughput, scores).
export const outcome = (s) => {
  const cands = s.candidates || [];
  const lower = (s.better ?? 'lower') === 'lower';
  const lim = Number(s.limit);
  const pass = cands.map((c) => {
    const v = numberOf(c.value);
    return Number.isFinite(v) && Number.isFinite(lim) && (lower ? v < lim : v > lim);
  });
  let best = -1;
  pass.forEach((p, i) => {
    if (!p) return;
    if (best < 0) { best = i; return; }
    const a = numberOf(cands[i].value), b = numberOf(cands[best].value);
    if (lower ? a < b : a > b) best = i;
  });
  const n = pass.filter(Boolean).length;
  return { pass, best, passed: n, total: cands.length, result: `${n} of ${cands.length} pass` };
};

// The film's answer: the best passing candidate of the last search that has one.
export const answerOf = (content) => {
  const ss = (content.scenes || []).filter((s) => s.type === 'search');
  for (let i = ss.length - 1; i >= 0; i--) {
    const o = outcome(ss[i]);
    if (o.best >= 0) return { scene: ss[i], index: o.best, candidate: ss[i].candidates[o.best], better: ss[i].better ?? 'lower', limit: ss[i].limit, outcome: o };
  }
  return null;
};

const fmt1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

// Values the copy may quote: {bpm} {bars} {seconds} from the fitted timing; from the film's answer {answer} (its
// value), {version} (its label), {pass} ('1 of 4'), and {x:<label>}, how many times better the answer is than the
// candidate with that label, computed from the values (e.g. {x:3.7} → '8.0×'). Every number derived from another
// number on screen comes from here, so it can never disagree with itself (principle 2).
export const facts = (content, timing) => {
  const f = {};
  if (timing) {
    f.bpm = String(Number(timing.bpm.toFixed(1)));
    f.bars = String(timing.bars);
    f.seconds = String(Math.round(timing.duration));
  }
  const a = answerOf(content);
  if (a) {
    f.answer = a.candidate.value;
    f.version = a.candidate.label;
    f.pass = `${a.outcome.passed} of ${a.outcome.total}`;
    const av = numberOf(a.candidate.value);
    for (const s of content.scenes.filter((x) => x.type === 'search')) {
      for (const c of s.candidates || []) {
        const v = numberOf(c.value);
        if (!Number.isFinite(v) || !Number.isFinite(av) || av === 0) continue;
        f[`x:${c.label}`] = fmt1(a.better === 'lower' ? v / av : av / v) + '×';
      }
    }
  }
  return f;
};
// Stand-ins of the same shape, for sizing copy before the timing exists.
export const FACTS_PROVISIONAL = { bpm: '128.5', bars: '99', seconds: '999', answer: '00.0 s', version: '00.0', pass: '9 of 9' };
export const factsFor = (content, timing) => {
  const f = { ...FACTS_PROVISIONAL, ...facts(content, timing) };
  return new Proxy(f, { has: (o, k) => k in o || /^x:/.test(k), get: (o, k) => (k in o ? o[k] : /^x:/.test(String(k)) ? '99.9×' : undefined) });
};

// ---------- validation (sync; Node and browser) ----------
// Returns error strings: unknown types and transitions, slot limits, item counts, the one-whiteout rule, the
// portal's conditions, and how often each expressive device is used.
export const validate = (content) => {
  const err = [];
  const sc = content.scenes || [];
  const f = factsFor(content);
  if (!sc.length) err.push('content.scenes is empty');
  if (content.aperture != null && !APERTURE_IDS.includes(content.aperture)) err.push(`aperture "${content.aperture}" is not one of ${APERTURE_IDS.join(', ')}`);
  const len = (v) => [...String(fill(v, f) ?? '')].length;
  const lim = (i, type, slot, v) => {
    const max = REGISTRY[type].limits[slot];
    if (v != null && len(v) > max) err.push(`scene ${i + 1} (${type}): ${slot} "${fill(v, f)}" has ${len(v)} characters; at most ${max}`);
  };
  const uses = {};
  sc.forEach((s, i) => {
    const R = REGISTRY[s.type];
    if (!R) { err.push(`scene ${i + 1}: unknown type "${s.type}" (registry: ${TYPES.join(', ')})`); return; }
    if (s.to != null) {
      if (!TRANSITIONS[s.to]) err.push(`scene ${i + 1} (${s.type}): to "${s.to}" is not one of ${Object.keys(TRANSITIONS).join(', ')}`);
      if (s.to === 'portal' && s.type !== 'reveal') err.push(`scene ${i + 1} (${s.type}): to "portal" only leaves a reveal (it pushes through the answer's counter)`);
      if (sc[i + 1]?.type === 'reveal') err.push(`scene ${i + 1} (${s.type}): a scene before a reveal hands over by the exposure build; remove its "to"`);
      if (!sc[i + 1]) err.push(`scene ${i + 1} (${s.type}): the last scene has no "to"`);
    }
    const count = (n, what) => { const [a, b] = R.items; if (n < a || n > b) err.push(`scene ${i + 1} (${s.type}): ${n} ${what}; ${a}–${b} allowed`); };
    if (s.type === 'ask') {
      const ws = (s.words || []).map(wordOf);
      count(ws.length, 'words');
      ws.forEach((w) => { lim(i, 'ask', 'word', w.text); lim(i, 'ask', 'param', w.param); if (!w.text) err.push(`scene ${i + 1} (ask): an empty word`); });
    }
    if (s.type === 'search') {
      const cs = s.candidates || [];
      count(cs.length, 'candidates');
      lim(i, 'search', 'line', s.line); lim(i, 'search', 'query', s.query);
      cs.forEach((c) => { lim(i, 'search', 'label', c.label); lim(i, 'search', 'value', c.value); if (!Number.isFinite(numberOf(c.value))) err.push(`scene ${i + 1} (search): value "${c.value}" has no number`); });
      if (!Number.isFinite(Number(s.limit))) err.push(`scene ${i + 1} (search): limit must be a number in the values' unit (e.g. 1 for "under 1 s")`);
      if (s.better != null && !['lower', 'higher'].includes(s.better)) err.push(`scene ${i + 1} (search): better must be 'lower' or 'higher'`);
      if (cs.length + (s.slot ? 1 : 0) > 5) err.push(`scene ${i + 1} (search): ${cs.length} candidates and a slot are more than five cells`);
      if (sc[i + 1]?.type === 'reveal' && outcome(s).best < 0) err.push(`scene ${i + 1} (search): it leads into a reveal but no candidate passes its limit`);
    }
    if (s.type === 'data') {
      count((s.items || []).length, 'items');
      lim(i, 'data', 'query', s.query);
      (s.items || []).forEach((it) => { lim(i, 'data', 'value', it.value); lim(i, 'data', 'label', it.label); });
    }
    if (s.type === 'reveal') {
      ['value', 'line', 'query'].forEach((k) => lim(i, 'reveal', k, s[k]));
      if (!s.value) err.push(`scene ${i + 1} (reveal): value is required`);
      if (i === 0) err.push('scene 1: a reveal cannot open the film (it lands out of the scene before it)');
      if (i === sc.length - 1 && s.rest !== true) err.push(`scene ${i + 1} (reveal): a reveal that closes the film (the shortest cut) is its closing card: give it rest: true`);
      if (s.to === 'portal' && counterIndex(fill(s.value, f)) < 0) err.push(`scene ${i + 1} (reveal): to "portal" needs a glyph with a counter in the value (${COUNTER_GLYPHS})`);
    }
    if (s.type === 'name') {
      ['name', 'version', 'line', 'install'].forEach((k) => lim(i, 'name', k, s[k]));
      if (!s.name) err.push(`scene ${i + 1} (name): name is required`);
      if (i !== sc.length - 1) err.push(`scene ${i + 1} (name): the name is the closing card; it must be the last scene`);
    }
    const out = outOf(sc, i);
    if (TRANSITIONS[out]?.tier === 'T2') uses[out] = (uses[out] || 0) + 1;
  });
  const reveals = sc.filter((s) => s.type === 'reveal').length;
  if (reveals > 1) err.push(`${reveals} reveals: the whiteout slam happens once in a film (mode principle 4)`);
  for (const [k, n] of Object.entries(uses)) if (n > T2_MAX_USES) err.push(`transition "${k}" is used ${n} times; an expressive device appears at most ${T2_MAX_USES} times in a film`);
  // facts the copy quotes must exist
  const all = JSON.stringify(sc);
  for (const m of all.matchAll(/\{([\w.:-]+)\}/g)) {
    const k = m[1];
    if (/^x:/.test(k) || ['answer', 'version', 'pass'].includes(k)) {
      const real = facts(content);
      if (!(k in real)) err.push(`{${k}}: ${/^x:/.test(k) ? `no candidate labelled "${k.slice(2)}", or no search with a passing answer` : 'no search with a passing answer'}`);
    } else if (!['bpm', 'bars', 'seconds'].includes(k)) err.push(`{${k}} is not a value the template computes ({bpm} {bars} {seconds} {answer} {version} {pass} {x:<label>})`);
  }
  return err;
};

// The transition out of scene i: into a reveal always the exposure build; else `to`; a reveal defaults to the
// portal when its value has a counter; everything else to the aperture.
export const outOf = (scenes, i) => {
  const s = scenes[i], n = scenes[i + 1];
  if (!n) return null;
  if (n.type === 'reveal') return 'build';
  if (s.to) return s.to;
  if (s.type === 'reveal') return counterIndex(fill(s.value, facts({ scenes }))) >= 0 ? 'portal' : 'aperture';
  return 'aperture';
};
export const inOf = (scenes, i) => (i > 0 ? outOf(scenes, i - 1) : null);

// A candidate is "known" when an earlier search showed the same label with the same value: a re-run passes over
// it on eighth notes with its value already there.
export const isKnown = (scenes, i, c) => scenes.slice(0, i).some((s) => s.type === 'search' && (s.candidates || []).some((d) => d.label === c.label && d.value === c.value));

// timing.js — the film's length follows its content.
//
// Nobody types a scene's bars or the film's duration. Each mode states, per scene type, how long its
// choreography takes (in beats, so it follows the tempo) and which text the viewer reads while the scene
// holds still. fit() turns that into bars per scene, rounds the film to a musical phrase and returns the
// duration. index.html, score.mjs and lib/fit.mjs all call the same function, so picture, sound and the
// static data-duration attributes agree. lib/fit.mjs also writes renders/timing.json (timingJson() below),
// which check-film reads.
//
// Rules, from references/principles.md:
//   reading   three tiers (principle 1):
//             primary  titles, claims, numbers, commands, questions: 0.3 s a word (CJK: 1/9 s a character),
//                      read one after another; a scene's primary text adds up
//             glance   labels, corner notes, stage names, title-block fields: ≤ 6 words, repeated elsewhere or
//                      safe to delete; fully still ≥ 1 s, read in parallel, never added up. A glance item over
//                      6 words is counted as primary and reported
//             word     slammed one word at a time: once the line is complete it holds 0.3 s × its words
//   ceiling   a scene may build in steps; after each step lands the picture holds still ≤ maxStillBars (1);
//             after the last step, where the whole page is read, ≤ lastStillBars (1.5).
//             A page holds at most `max` bars (2); a type that declares its steps may raise `max` to
//             pageMaxBars (4). Past 4 only a rest or a climax, with a written reason (principles 3 and 5)
//   brisk     a page carries at most pageWords (12) words of primary text; a type's text is readable within
//             entryBeats (2) of the scene's start, unless it is a turn, a rest or a climax (principle 5)
//   grid      every scene is a whole number of `unit` bars (default one beat). A `turn` scene (chapter
//             change, claim) starts on a bar line; the part bar it waits for is its `pad` (principle 5)
//   phrase    the total is rounded up to a multiple of `phrase` bars, because music moves in 2-, 4- and
//             8-bar groups (Lerdahl & Jackendoff 1983). The extra is shared out, one beat at most per scene
//             (phraseShareBeats), from the back, over scenes below their ceiling; before a turn only whole
//             bars per segment, so every turn stays on its bar line. Only what is left goes to the closing
//             scene (`absorb`), which carries a second move on the last downbeat
//   tempo     bpm comes from content.bpm, else the mode's default, clamped to the mode's range
//   target    optional content.target (seconds): the tempo moves inside the range to meet it; what the range
//             cannot absorb is reported, never padded with holds or squeezed below reading time
//
//   tiers     api 3 only (four tiers of change, owner-approved 2026-10-19; at 120 BPM one beat is 0.5 s). It replaces
//             the ceiling and brisk rows above (maxStillBars, lastStillBars, max 2 / pageMaxBars 4, pageWords 12):
//             T0 micro   a word or phrase entering, a highlight jump, a count tick, a morph step: median gap
//                        between neighbouring onsets ≤ 2 beats, never more than 4 beats without one (rest scenes
//                        and pause holds excepted); each carries one new piece of information
//             T1 scene   a new composition: median 2–3 s, a scene ≤ 6 s (rest, or climax with a reason, excepted),
//                        ≥ 2 scenes in the first 5 s, scene-length CV ≥ 0.3 with a run that speeds up or slows down
//             T2         expressive transitions (devices of runtime/transitions and runtime/handoffs, full-frame
//                        ground changes): one every 8–12 s (the count; a gap over 12 s between two, or from the
//                        film's start or to its end, warns), the same device ≤ 3 times a film and never twice in a
//                        row unchanged, each ≤ 2 beats long
//             T3 peaks   hook, claim or reveal, lock-up: 2–3 a film; the one marked climax at 60–85 % of the length
//             holds      a declared still window is ≥ 0.2 s and ≤ 2 beats; one marked pause (a claim being read)
//                        ≤ 2 bars; a step's still hold ≤ 2 beats, or ≤ 2 bars when the step is { still, pause: true }
//             reading    the 0.3 s floor stands; primary text entering at one moment (items sharing an `at`) is
//                        ≤ 5 words, or ≤ 8 when one of them is a claim ({ text, claim: true }); a claim is read in
//                        a pause hold. Text counts as read while it is readable and still, whatever else moves
//             Below api 3 the same measures are computed and reported as one INFO note, never as errors.
//
// rules = {
//   api: 3,                       // 3: the four tiers above, as errors; 2: the ceiling checks as errors; 1: warnings
//   bpm: { default: 120, min: 112, max: 128 },
//   beatsPerBar: 4, unit: 0.25, phrase: 2,
//   // optional overrides of DEFAULTS: wordSec, cjkCharSec, glanceSec, glanceMaxWords, maxStillBars,
//   // lastStillBars, pageMaxBars, pageWords, entryBeats, max, phraseShareBeats, fps, keyFrames
//   types: {
//     claim:   { in: 2, out: 1, turn: true, read: (s) => [s.title, { text: s.kicker, tier: 'glance' }] },
//     options: { in: 1, max: 4, steps: (s, g, ctx) => [...], need: (s, g, ctx) => ... ctx.reading([...]) ... },
//     review:  { in: 14, max: 8, climax: true, reason: 'the climax: four bars of choreography, then the card' },
//     cta:     { in: 2, read: (s) => [s.url], hold: 3, absorb: true, rest: true, reason: 'closing card' },
//   },
//   events: (scenes, g, content) => ({ keys, holds, handoffs, mask, micro, shots, expressive, peaks }), // see events()
//   accent: '#FF3B1F',            // optional (or content => hex); else content.accent, else palettes.js
//   devices: ['plakat-accent-wipe'],  // optional: the template's own T2 device ids, so lib/fit.mjs knows them
// }
//
// Per type:
//   in / out   beats of motion before the text is readable and after it starts leaving
//   read(s, ctx)   the text read while the scene holds: an array of strings (primary) and { text, tier, at }
//              items; tier 'primary' | 'glance' | 'word'; at = seconds after the text is readable (default 0).
//              Nested arrays are flattened. A rules file from before api 2 returns plain strings: all primary.
//   hold       minimum seconds of stillness (e.g. a URL)
//   extra(s, g, ctx)   seconds of further motion (typing, counting)
//   need(s, g, ctx)    full override of in + reading + out + extra; its reading part must come from
//              ctx.reading(items), so every mode reads with the same reader
//   steps(s, g, ctx)   seconds the picture holds still after each step lands (at the fitted `need`);
//              each must be ≤ maxStillBars, the last ≤ lastStillBars. api 3: each ≤ holdMaxBeats (2 beats); an
//              entry may be { still, pause: true } for a reading pause (a claim), ≤ pauseMaxBars (2 bars).
//              Called again once the grid, the pad and the phrase share are added, with ctx.dur = the scene's
//              fitted seconds (undefined in the first call): a type that reads ctx.dur returns its holds at that
//              length and they are checked as returned (warnings); otherwise the slack counts on the last step
//   fillsSlack true: the type fills whatever the grid, the pad and the phrase share add with moves of its own (tail
//              moves), so the slack is not counted as a still hold; its events() holds and the T0 gaps measure it
//   min / max  bars; max defaults to 2, up to pageMaxBars with steps, past it only with rest or climax + reason.
//              api 3: max defaults to sceneMaxSec (6 s) in whole units at the fitted tempo; a type that splits
//              its scene into several compositions (events() `shots`) may raise it, and every composition is
//              then held to 6 s by the T1 check
//   rest       true: a deliberate rest, no ceiling (needs `reason` past pageMaxBars). Only boolean true counts;
//              a non-boolean `rest` on a scene is reported, so a content field cannot switch the ceiling off
//   climax     true: may exceed pageMaxBars with a `reason`
//   turn       true: the scene starts on a bar line; the wait is reported as its pad
//   absorb     takes what is left of the phrase rounding (default: the last scene)
//   events(s, g, ctx)  key events of this scene, times in seconds from the scene start
// Callbacks get ctx = { i, scenes, prev, next, content, lang }; need() and steps() also get
// ctx.read (seconds of primary reading of `read`), ctx.wordSec and ctx.reading(items); steps() ctx.dur (see above).
// A scene may set `bars` by hand: accepted when it lies in [need, max], otherwise reported, so a hand
// value can lengthen a scene for rhythm but never cut it below reading time.

// The highest rules api this runtime knows; also the format version of renders/timing.json. A rules file
// keeps the api it declares (timing.json `rulesApi`): api 2 rules run exactly as before.
export const TIMING_API = 3;

export const DEFAULTS = {
  wordSec: 0.3, // s per Latin word (principle 1, standard)
  cjkCharSec: 1 / 9, // s per CJK character (≤ 9 characters a second; used from the Chinese batch on)
  glanceSec: 1.0, // s a glance item stays fully still (subtitle minimum 5/6 s, rounded up)
  glanceMaxWords: 6, // a glance item longer than this is primary text
  maxStillBars: 1, // bars the picture may hold still after a step lands (brisk: something new every bar, 2026-10-18)
  lastStillBars: 1.5, // bars the picture may hold still after the page's last step, where the page is read
  max: 2, // bars: default page ceiling
  pageMaxBars: 4, // bars: ceiling of a page that declares its steps (was 6 before 2026-10-18)
  pageWords: 12, // words of primary text one page may carry (3.6 s at 0.3 s a word); more is cut, moved to glance or split
  entryBeats: 2, // beats from a scene's start until its first text is readable (turns, rests and climaxes excepted)
  phrase: 2, // bars
  phraseShareBeats: 1, // beats of phrase rounding one scene may take before the closing scene does
  fps: 30, // frame rate the key-event tolerance is counted in
  keyFrames: 2, // key events sit within ± this many frames of a beat
  // api 3: four tiers of change (references/principles.md 4 and 5; owner-approved 2026-10-19). Enforced only when
  // rules.api >= 3; below it the same measures are reported as INFO.
  holdMinSec: 0.2, // s: a landing holds at least this long, so it reads as arrived and the next onset as a start
  holdMaxBeats: 2, // beats: the longest fully still hold after a landing (rest scenes and pause holds excepted)
  pauseMaxBars: 2, // bars: the longest hold marked pause (a claim being read)
  stateWords: 5, // words of primary text entering at one moment (one state)
  claimWords: 8, // words in a state that carries a claim ({ text, claim: true }), read in a pause hold
  claimsMax: 2, // claims (pause holds) per film before a warning (draft)
  sceneMaxSec: 6, // s: the longest composition (T1); rest, or climax with a reason, excepted
  sceneMedianSec: [2, 3], // s: median composition length (T1); over the top an error, under the bottom a warning
  firstSec: 5, // s: the opening window ...
  firstScenes: 2, // ... must show at least this many compositions (T1)
  sceneCV: 0.3, // coefficient of variation of composition lengths, at least (T1)
  microMedianBeats: 2, // beats: median gap between neighbouring onsets (T0)
  microMaxGapBeats: 4, // beats: the longest gap without an onset, rests and pauses excepted (T0)
  expressiveEverySec: [8, 12], // s: one expressive transition every 8–12 s (T2): count in [floor(D/12), ceil(D/8)]
  expressiveSameMax: 3, // one device at most this many times a film (T2)
  expressiveMaxBeats: 2, // beats: the longest expressive transition (T2)
  peakCount: [2, 3], // marked peaks per film (T3)
  climaxAt: [0.6, 0.85], // share of the film's length where the climax sits (T3)
};

export const TIERS = ['primary', 'glance', 'word'];
export const KEY_KINDS = ['turn', 'land', 'stamp', 'accent', 'claim', 'end'];
export const PEAK_KINDS = ['hook', 'claim', 'reveal', 'lockup'];

// ---------- counting ----------

const clean = (text) =>
  String(text ?? '')
    .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1') // [[style|text]] markup
    .replace(/\{[^}]*\}/g, ' x '); // {TOKEN} placeholders count as one word
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const flatText = (v) => (Array.isArray(v) ? v.flat(Infinity).filter((x) => x != null && x !== false).join(' ') : v);

// Latin words and CJK characters in a string (or array of strings).
export const count = (text) => {
  const t = clean(flatText(text));
  const cjk = (t.match(CJK) || []).length;
  const latin = t.replace(CJK, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length; // "...", "/", "→" are not words
  return { latin, cjk };
};

// Reading units: Latin by word, CJK by character. `lang` (content.lang, default 'en') is accepted for
// language-specific rules to come; counting follows the script.
export const units = (text, lang = 'en') => { // eslint-disable-line no-unused-vars
  const c = count(text);
  return c.latin + c.cjk;
};

export const readTime = (text, o = {}) => {
  const c = count(text);
  return c.latin * (o.wordSec ?? DEFAULTS.wordSec) + c.cjk * (o.cjkCharSec ?? DEFAULTS.cjkCharSec);
};

// Before api 2. words() counts Latin words exactly as it always did; readSeconds() sums every string.
export const words = (text) =>
  String(text ?? '')
    .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\{[^}]*\}/g, 'x')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export const readSeconds = (strings, wordSec = 0.3) =>
  (strings || []).flat(Infinity).reduce((n, s) => n + words(s) * wordSec, 0);

// ---------- the reader ----------

// Normalise read() output into [{ text, tier, at, claim? }]. Strings are primary; nested arrays are flattened;
// empty items are dropped. claim: true (api 3) marks a claim: its state may carry claimWords instead of stateWords.
export const items = (list) => {
  const out = [];
  const walk = (x) => {
    if (x == null || x === false || x === '') return;
    if (Array.isArray(x)) return x.forEach(walk);
    if (typeof x === 'object') {
      const text = flatText(x.text);
      if (text == null || text === '') return;
      out.push({ text: String(text), tier: x.tier ?? 'primary', at: x.at ?? 0, ...(x.claim === true ? { claim: true } : {}) });
      return;
    }
    out.push({ text: String(x), tier: 'primary', at: 0 });
  };
  walk(list);
  return out;
};

// reader(list, opts) → { primary, glance, done, glanceDone, end, items, demoted }
//   primary     seconds of primary and word reading, summed (the reading the scene's need carries)
//   glance      glanceSec when the scene has glance text, else 0
//   done        when the primary path ends: each item starts at max(its `at`, the previous item read)
//   glanceDone  latest at + glanceSec over the glance items
//   end         max(done, glanceDone): the scene can leave after this (plus its exit)
//   demoted     glance items over glanceMaxWords, counted as primary
// Times are seconds from the moment the scene's text is readable (or from whatever origin the `at`
// values use).
export const reader = (list, opts = {}) => {
  const o = { ...DEFAULTS, ...opts };
  const out = [], demoted = [];
  let done = 0, glanceDone = 0, primary = 0, hasGlance = false;
  for (const it of items(list)) {
    const n = units(it.text, o.lang);
    if (!n) continue;
    let tier = TIERS.includes(it.tier) ? it.tier : 'primary';
    if (tier === 'glance' && n > o.glanceMaxWords) { tier = 'primary'; demoted.push(it.text); }
    if (tier === 'glance') {
      hasGlance = true;
      glanceDone = Math.max(glanceDone, it.at + o.glanceSec);
      out.push({ ...it, tier, units: n, from: it.at, to: it.at + o.glanceSec });
      continue;
    }
    const sec = readTime(it.text, o);
    const from = Math.max(done, it.at);
    done = from + sec;
    primary += sec;
    out.push({ ...it, tier, units: n, sec, from, to: done });
  }
  return { primary, glance: hasGlance ? o.glanceSec : 0, done, glanceDone, end: Math.max(done, glanceDone), items: out, demoted };
};

// ---------- sizing ----------

const EPS = 1e-9;
const ceilTo = (x, unit) => Math.ceil(x / unit - 1e-9) * unit;
const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const tidy = (x) => Math.round(x * 1e6) / 1e6;
const optsOf = (rules) => {
  const o = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (rules[k] != null) o[k] = rules[k];
  return o;
};
const apiOf = (rules) => Number(rules?.api ?? 1) || 1;

// Reading states (api 3): primary items of one reader result grouped by the frame they become readable on.
// Returns [{ at, words, cap, claim, texts }]: words entering together, and their cap (claimWords when one item
// of the state is a claim, else stateWords). Glance and word-at-a-time items are not states (a slammed word is
// its own state by construction).
export const readingStates = (res, o = DEFAULTS) => {
  const fps = o.fps ?? DEFAULTS.fps, by = new Map();
  for (const it of res.items || []) {
    if (it.tier !== 'primary') continue;
    const k = Math.round((it.at ?? 0) * fps);
    if (!by.has(k)) by.set(k, { at: it.at ?? 0, words: 0, claim: false, texts: [] });
    const st = by.get(k);
    st.words += it.units ?? units(it.text);
    st.claim ||= it.claim === true;
    st.texts.push(it.text);
  }
  return [...by.values()].map((st) => ({ ...st, cap: st.claim ? (o.claimWords ?? DEFAULTS.claimWords) : (o.stateWords ?? DEFAULTS.stateWords) }));
};

// Static checks of the rules themselves (one note per type, not per scene). api 3 has no bar ceilings: its
// scene limit is in seconds and is checked per scene (sizeScenes) and per composition (tiers).
const checkRules = (rules, o, strict) => {
  const notes = [];
  const lvl = strict ? 'error' : 'warn';
  const later = strict ? '' : ' (an error once the rules declare api: 2)';
  const v3 = apiOf(rules) >= 3;
  for (const [type, r] of Object.entries(rules.types || {})) {
    if (r.rest != null && typeof r.rest !== 'boolean') notes.push({ level: 'warn', msg: `type ${type}: rest must be true or false, got ${JSON.stringify(r.rest)}; ignored` });
    if (r.turn != null && typeof r.turn !== 'boolean') notes.push({ level: 'warn', msg: `type ${type}: turn must be true or false; ignored` });
    const rest = r.rest === true, climax = r.climax === true;
    const max = r.max ?? rules.max ?? o.max;
    const reason = typeof r.reason === 'string' && r.reason.trim();
    if (!v3) {
      if (!rest && !climax && max > o.max + EPS && !r.steps) notes.push({ level: lvl, msg: `type ${type}: max ${max} bars without steps(); a page without declared steps holds at most ${o.max} bars${later}` });
      if (!rest && !climax && max > o.pageMaxBars + EPS) notes.push({ level: lvl, msg: `type ${type}: max ${max} bars is past the page ceiling ${o.pageMaxBars}; split the page, or mark it rest or climax with a reason${later}` });
      if ((rest || climax) && max > o.pageMaxBars + EPS && max !== Infinity && !reason) notes.push({ level: lvl, msg: `type ${type}: ${rest ? 'rest' : 'climax'} past ${o.pageMaxBars} bars needs a reason string${later}` });
    }
    if (!rest && !climax && r.turn !== true && !r.need && (r.in ?? 1) > o.entryBeats + EPS) notes.push({ level: 'warn', msg: `type ${type}: text becomes readable only after ${r.in} beats; a brisk scene shows its first text within ${o.entryBeats} beats` });
  }
  return notes;
};

// Bars each scene needs at a given bpm.
const sizeScenes = (scenes, rules, bpm, content) => {
  const o = optsOf(rules);
  const api = apiOf(rules), v3 = api >= 3;
  const strict = api >= 2;
  const lvl = strict ? 'error' : 'warn';
  const later = strict ? '' : ' (an error once the rules declare api: 2)';
  const beatsPerBar = rules.beatsPerBar ?? 4, unit = rules.unit ?? 1 / beatsPerBar;
  const beat = 60 / bpm, bar = beat * beatsPerBar;
  const g = { bpm, beat, bar, beatsPerBar, unit };
  const lang = content.lang ?? 'en';
  const notes = [];
  const preview = { states: [], claims: 0, steps: 0 }; // api 3 measures on api < 3 rules: one INFO note
  // api 3: the cap on a step's still hold, in bars (pause: a claim being read)
  const stepCap = (k, n, pause) => (v3 ? (pause ? o.pauseMaxBars : o.holdMaxBeats / beatsPerBar) : k === n - 1 ? o.lastStillBars : o.maxStillBars);
  const sceneMax = Math.max(unit, Math.floor(o.sceneMaxSec / bar / unit + 1e-9) * unit); // api 3 default ceiling, bars
  const ctxs = []; // per scene: the type and the ctx steps() was called with, for the check at the fitted length
  const sized = scenes.map((s, i) => {
    const r = rules.types?.[s.type];
    const ctx = { i, scenes, prev: scenes[i - 1], next: scenes[i + 1], content, lang };
    if (!r) { notes.push({ level: 'error', scene: i, msg: `unknown scene type "${s.type}"` }); return { ...s, bars: s.bars ?? 1, need: 0, timing: { pad: 0, phraseShare: 0, reading: { primary: 0, glance: 0 }, rest: false, turn: false, climax: false } }; }

    if (s.rest !== undefined && typeof s.rest !== 'boolean') notes.push({ level: 'warn', scene: i, msg: `${s.type}: field "rest" is ${JSON.stringify(s.rest)}; only rest: true marks a rest, so rename this field (it no longer lifts the ceiling)` });
    const rest = r.rest === true || s.rest === true;
    const climax = r.climax === true || s.climax === true;
    const turn = r.turn === true || s.turn === true;
    const reason = s.reason ?? r.reason;

    // reading: every call of ctx.reading() is recorded, so the table shows what need() counted
    const seen = new Set(), calls = [];
    const read = (list, extra = {}) => {
      const res = reader(list, { ...o, lang, ...extra });
      for (const d of res.demoted) if (!seen.has(d)) { seen.add(d); notes.push({ level: 'warn', scene: i, msg: `${s.type}: glance text "${d}" has more than ${o.glanceMaxWords} words; counted as primary (shorten it or delete it)` }); }
      return res;
    };
    const base = read(r.read ? r.read(s, ctx) : []);
    const reading = (list, extra) => { const res = read(list, extra); calls.push(res); return res; };
    const full = { ...ctx, read: base.primary, wordSec: o.wordSec, reading };
    ctxs[i] = { r, s, full };

    const need = r.need
      ? r.need(s, g, full)
      : ((r.in ?? 1) + (r.out ?? 0)) * beat + Math.max(base.end, r.hold ?? 0) + (r.extra ? r.extra(s, g, ctx) : 0);
    const used = calls.length ? calls : [base];
    // from: 'reader' when need() read through ctx.reading() or the default formula ran; 'read' when a
    // need() override ignored the reader and the table can only show what read() lists
    const rd = { primary: Math.max(...used.map((x) => x.primary)), glance: Math.max(...used.map((x) => x.glance)), from: r.need && !calls.length ? 'read' : 'reader' };

    const max = rest ? Infinity : (r.max ?? rules.max ?? (v3 ? sceneMax : o.max));
    const min = r.min ?? unit;
    if (!v3 && !rest && !climax && rd.primary > o.pageWords * o.wordSec + 1e-6) notes.push({ level: lvl, scene: i, msg: `${s.type}: ${(rd.primary / o.wordSec).toFixed(0)} words of primary text; a page carries at most ${o.pageWords} (cut the copy, make labels glance text, or split the page)${later}` });
    // api 3 reading states: primary text entering at one moment ≤ stateWords (claimWords with a claim)
    {
      let worst = null;
      for (const res of used) for (const st of readingStates(res, o)) {
        if (st.claim) preview.claims++;
        if (st.words > st.cap && (!worst || st.words - st.cap > worst.words - worst.cap)) worst = st;
      }
      if (worst && !rest) {
        if (v3) notes.push({ level: 'error', scene: i, msg: `${s.type}: ${worst.words} words of primary text enter together at ${worst.at.toFixed(2)} s ("${worst.texts.join(' / ').slice(0, 60)}"); a state carries at most ${worst.cap}${worst.claim ? ' (a claim)' : ` (${o.claimWords} for a claim marked claim: true)`}: split it into phrases that enter one after another` });
        else preview.states.push(`${i + 1} ${s.type} ${worst.words}w`);
      }
    }
    let bars = clamp(ceilTo(need / bar, unit), min, Math.max(min, max));
    if (need / bar > max + EPS) notes.push({ level: 'error', scene: i, msg: `${s.type} needs ${(need / bar).toFixed(2)} bars to read but holds at most ${max}: shorten the copy or split the scene` });
    if (s.bars != null) {
      if (s.bars + EPS < need / bar) notes.push({ level: 'warn', scene: i, msg: `${s.type}: bars ${s.bars} is below the ${(need / bar).toFixed(2)} bars needed; using ${bars}` });
      else if (s.bars > max) notes.push({ level: 'warn', scene: i, msg: `${s.type}: bars ${s.bars} is above the ceiling ${max}; using ${bars}` });
      else bars = ceilTo(s.bars, unit);
    }

    // steps: the still hold after each step, each ≤ maxStillBars (api 3: ≤ holdMaxBeats, a pause ≤ pauseMaxBars)
    let still = null, pause = null;
    if (r.steps) {
      const raw = r.steps(s, g, full) || [];
      still = raw.map((x) => Number(x && typeof x === 'object' ? x.still : x));
      pause = raw.map((x) => !!(x && typeof x === 'object' && x.pause === true));
      if (!rest) still.forEach((x, k) => {
        const cap = stepCap(k, still.length, pause[k]);
        if (x > cap * bar + 1e-6) {
          if (v3) notes.push({ level: 'error', scene: i, msg: `${s.type}: step ${k + 1} holds still ${(x / beat).toFixed(2)} beats; at most ${pause[k] ? `${o.pauseMaxBars} bars (a pause)` : `${o.holdMaxBeats} beats: land something new (a T0 change that is not new text may run while the text is read), or mark the step { still, pause: true } if a claim is read here`}` });
          else notes.push({ level: 'error', scene: i, msg: `${s.type}: step ${k + 1} holds still ${(x / bar).toFixed(2)} bars; at most ${cap} ${k === still.length - 1 ? 'after the last step' : 'before the next landing'}` });
        } else if (!v3 && x > o.holdMaxBeats * beat + 1e-6) preview.steps++;
      });
    }
    return { ...s, bars: tidy(bars), need, absorb: s.absorb ?? r.absorb ?? false,
      timing: { pad: 0, phraseShare: 0, reading: rd, rest, turn, climax, reason, still, ...(pause?.some(Boolean) ? { pause } : {}), max, hasSteps: !!r.steps } };
  });

  // ---- turn scenes start on a bar line: the previous scene holds to it, reported as the turn's pad
  let pos = 0;
  sized.forEach((s, k) => {
    if (k > 0 && s.timing.turn) {
      const gap = tidy(Math.ceil(pos - 1e-6) - pos);
      if (gap > EPS) {
        sized[k - 1].bars = tidy(sized[k - 1].bars + gap);
        s.timing.pad = tidy(gap * beatsPerBar);
        pos += gap;
      }
    }
    pos += s.bars;
  });

  // ---- phrase rounding, shared out before the closing scene takes the rest.
  // Turn scenes split the film into segments. The segment after the last turn may take any number of grid
  // steps. A segment before a turn may only grow by whole bars (a multiple of beatsPerBar beats), so every
  // later turn stays on its bar line; those beats are spread round-robin over its scenes, from the back.
  // Each scene takes whole grid steps, at most phraseShareBeats in all, and only while it stays under its
  // ceiling (and its last step under lastStillBars). Rests, turns and the closing scene take no share; the
  // closing scene takes what is left, last.
  const total = sized.reduce((n, s) => n + s.bars, 0);
  const extraB = tidy((ceilTo(total, o.phrase) - total) * beatsPerBar); // beats
  if (extraB > EPS && sized.length) {
    let k = sized.findLastIndex((s) => s.absorb);
    if (k < 0) k = sized.length - 1;
    const stepB = Math.max(unit * beatsPerBar, 1), capB = o.phraseShareBeats;
    const given = sized.map(() => 0);
    const room = (j) => { // beats scene j can still take, in whole steps
      const s = sized[j], T = s.timing;
      if (j === k || T.rest || T.turn || s.absorb) return 0;
      let c = Math.min(capB - given[j], (T.max - s.bars) * beatsPerBar - given[j]);
      if (T.still?.length) { // the share lengthens the last step's hold
        const last = T.still[T.still.length - 1] + (s.bars * bar - s.need) + given[j] * beat;
        c = Math.min(c, (stepCap(T.still.length - 1, T.still.length, T.pause?.[T.still.length - 1]) * bar - last) / beat);
      }
      return Math.max(0, Math.floor(c / stepB + 1e-6) * stepB);
    };
    const spread = (seg, amount) => { // round-robin from the back of the segment; returns beats placed
      let placed = 0;
      for (let moved = true; moved && amount - placed >= stepB - EPS;) {
        moved = false;
        for (let x = seg.length - 1; x >= 0 && amount - placed >= stepB - EPS; x--) {
          if (room(seg[x]) >= stepB - EPS) { given[seg[x]] = tidy(given[seg[x]] + stepB); placed = tidy(placed + stepB); moved = true; }
        }
      }
      return placed;
    };
    const capacity = (seg) => { // beats a segment could take, without placing them
      const saved = given.slice();
      const c = spread(seg, Infinity);
      saved.forEach((v, j) => (given[j] = v));
      return c;
    };
    // segments: [before turn 1], [turn 1 .. before turn 2], ..., [last turn .. end]
    const segs = [[]];
    sized.forEach((s, j) => { if (j > 0 && s.timing.turn) segs.push([]); segs[segs.length - 1].push(j); });
    const lastSeg = segs[segs.length - 1], earlier = segs.slice(0, -1).reverse(); // back to front
    const lastCap = capacity(lastSeg);
    const barsCap = earlier.map((seg) => (beatsPerBar % stepB < EPS ? Math.floor(capacity(seg) / beatsPerBar + 1e-6) : 0));
    // how many whole bars go before the last turn: leave the closing scene as little as possible, and
    // among equal choices keep the share at the back
    let bestBars = 0, bestLeft = Infinity;
    for (let n = 0; n <= Math.min(barsCap.reduce((a, b) => a + b, 0), Math.floor(extraB / beatsPerBar + 1e-6)); n++) {
      const rest = extraB - n * beatsPerBar;
      const left = rest - Math.min(Math.floor(rest / stepB + 1e-6) * stepB, lastCap);
      if (left < bestLeft - EPS) { bestLeft = left; bestBars = n; }
    }
    let n = bestBars;
    earlier.forEach((seg, x) => {
      const take = Math.min(n, barsCap[x]);
      if (!take) return;
      const saved = given.slice();
      const placed = spread(seg, take * beatsPerBar);
      if (Math.abs(placed - take * beatsPerBar) > EPS) saved.forEach((v, j) => (given[j] = v)); // whole bars or nothing
      else n -= take;
    });
    const rest = tidy(extraB - (bestBars - n) * beatsPerBar);
    const placedLast = spread(lastSeg, Math.min(Math.floor(rest / stepB + 1e-6) * stepB, lastCap));
    given[k] += tidy(rest - placedLast);
    given.forEach((b, j) => {
      if (b <= EPS) return;
      sized[j].bars = tidy(sized[j].bars + b / beatsPerBar);
      sized[j].timing.phraseShare = tidy(sized[j].timing.phraseShare + b);
    });
  }

  // ---- after the grid, the pad and the phrase: the step holds at the scene's fitted length, and the page ceilings.
  // The grid, a turn's pad and the phrase share make a scene longer than its need. steps() is called again with
  // ctx.dur = the fitted seconds: a type that reads ctx.dur returns its holds at that length (it may have filled the
  // slack with moves) and each is checked as returned. A type that does not read it is assumed to hold the slack on
  // its last step. A type with fillsSlack: true fills any slack with moves of its own; it is not checked here (its
  // events() holds and the T0 gaps measure it).
  sized.forEach((s, i) => {
    const T = s.timing, C = ctxs[i];
    if (!T || T.rest || !T.still?.length || C?.r?.fillsSlack === true) return;
    const dur = s.bars * bar, slack = dur - s.need;
    if (slack <= 1e-6) return; // nothing added: the holds were checked at the need
    const extra = [T.phraseShare && 'the phrase share', T.pad && "the turn's pad"].filter(Boolean);
    const added = `once the grid${extra.length ? ` and ${extra.join(' and ')}` : ''} are added`;
    const show = (x) => (v3 ? `${(x / beat).toFixed(2)} beats` : `${(x / bar).toFixed(2)} bars`);
    const capOf = (cap) => (v3 ? `${tidy(cap * beatsPerBar)} beats` : cap);
    let used = false, raw = null;
    const c = { ...C.full };
    Object.defineProperty(c, 'dur', { get: () => { used = true; return dur; }, enumerable: false });
    try { raw = C.r.steps(C.s, g, c) || []; } catch (e) { notes.push({ level: 'warn', scene: i, msg: `${s.type}: steps() threw at the fitted length (${String(e?.message ?? e)})` }); return; }
    if (used) {
      const still = raw.map((x) => Number(x && typeof x === 'object' ? x.still : x));
      const pause = raw.map((x) => !!(x && typeof x === 'object' && x.pause === true));
      still.forEach((x, k) => {
        const cap = stepCap(k, still.length, pause[k]);
        if (x > cap * bar + 1e-6) notes.push({ level: 'warn', scene: i, msg: `${s.type}: step ${k + 1} holds still ${show(x)} at the scene's fitted length (${added}); at most ${capOf(cap)}` });
      });
      return;
    }
    const n = T.still.length, cap = stepCap(n - 1, n, T.pause?.[n - 1]);
    const last = T.still[n - 1] + slack;
    if (last > cap * bar + 1e-6) notes.push({ level: 'warn', scene: i, msg: `${s.type}: the last step holds still ${show(last)} ${added}; at most ${capOf(cap)} (if the type fills the slack with moves, let steps() read ctx.dur or declare fillsSlack: true)` });
  });
  if (!v3) sized.forEach((s, i) => {
    const T = s.timing;
    if (!T) return;
    if ((T.rest || T.climax) && s.bars > o.pageMaxBars + EPS && !(typeof T.reason === 'string' && T.reason.trim())) notes.push({ level: lvl, scene: i, msg: `${s.type}: ${T.rest ? 'rest' : 'climax'} of ${s.bars} bars is past ${o.pageMaxBars}; give it a reason string${later}` });
  });
  // below api 3 the reading measures go into events()' INFO note, not into fit()'s notes (templates log those)
  const previewMsg = !v3 && (preview.states.length || preview.steps) ? `reading: ${preview.states.length} scene(s) with a state over ${o.stateWords} primary words${preview.states.length ? ` (${preview.states.slice(0, 6).join(', ')}${preview.states.length > 6 ? ', …' : ''})` : ''}, ${preview.steps} step hold(s) over ${o.holdMaxBeats} beats` : null;

  return { sized, notes, g, previewMsg };
};

// fit(content, rules) → { api, rulesApi, bpm, beat, bar, beatsPerBar, unit, phrase, scenes, bars, duration, notes }
// Each scene keeps its content fields and gets bars, need, absorb, startBar, start, end, dur, and
// timing = { pad, phraseShare (beats), reading: { primary, glance } (s), rest, turn, climax, still }.
// rules may also be a function content => rules, for modes whose scene lengths depend on computed data
// (an algorithm run, a dataset) rather than on the copy alone.
export const fit = (content, rulesOrFn) => {
  const rules = typeof rulesOrFn === 'function' ? rulesOrFn(content) : rulesOrFn;
  const o = optsOf(rules);
  const strict = (rules.api ?? 1) >= 2;
  const range = rules.bpm ?? { default: 120 };
  const lo = range.min ?? range.default, hi = range.max ?? range.default;
  const notes = checkRules(rules, o, strict);
  let bpm = content.bpm ?? range.default;
  if (bpm < lo || bpm > hi) { notes.push({ level: 'warn', msg: `bpm ${bpm} is outside ${lo}–${hi}; clamped` }); bpm = clamp(bpm, lo, hi); }

  const solve = (b) => {
    const r = sizeScenes(content.scenes, rules, b, content);
    const bars = tidy(r.sized.reduce((n, s) => n + s.bars, 0));
    return { ...r, bars, duration: bars * r.g.bar };
  };

  let best = solve(bpm);
  if (content.target && !content.bpm) {
    // Search the tempo range for the duration closest to the target (ties: closest to the default),
    // skipping tempos at which some scene cannot be read inside its ceiling.
    const ok = (c) => !c.notes.some((n) => n.level === 'error');
    for (let b = lo; b <= hi + 1e-9; b += 0.5) {
      const c = solve(b);
      if (!ok(c) && ok(best)) continue;
      if (ok(c) && !ok(best)) { best = c; continue; }
      const d = Math.abs(c.duration - content.target), e = Math.abs(best.duration - content.target);
      if (d < e - 1e-6 || (Math.abs(d - e) < 1e-6 && Math.abs(b - range.default) < Math.abs(best.g.bpm - range.default))) best = c;
    }
    const off = best.duration - content.target;
    if (Math.abs(off) > best.g.bar / 2) notes.push({ level: 'warn', msg: `target ${content.target}s: the tempo range reaches ${best.duration.toFixed(2)}s; ${off > 0 ? 'cut' : 'add'} about ${Math.round(Math.abs(off) / best.g.bar)} bar(s) of scenes` });
  }

  const { g } = best;
  let bar = 0;
  const scenes = best.sized.map((s) => {
    const start = bar * g.bar, end = (bar + s.bars) * g.bar;
    const out = { ...s, startBar: tidy(bar), start, end, dur: end - start };
    bar = tidy(bar + s.bars);
    return out;
  });
  const t = {
    api: TIMING_API, rulesApi: apiOf(rules), bpm: g.bpm, beat: g.beat, bar: g.bar, beatsPerBar: g.beatsPerBar, unit: g.unit, phrase: o.phrase,
    scenes, bars: best.bars, duration: best.duration, notes: [...notes, ...best.notes],
  };
  Object.defineProperty(t, 'rules', { value: rules, enumerable: false }); // for timingJson()
  Object.defineProperty(t, 'limits', { value: o, enumerable: false });
  Object.defineProperty(t, 'content', { value: content, enumerable: false });
  Object.defineProperty(t, 'preview', { value: best.previewMsg ?? null, enumerable: false });
  return t;
};

// ---------- events and renders/timing.json ----------

// events(t) → { keys, holds, handoffs, mask, micro, shots, expressive, peaks, tiers, notes }
// Sources: rules.events(scenes, g, content) with absolute times, and per type events(s, g, ctx) with times
// in seconds from the scene start (ctx = { i, scenes, content }). A key may carry drop: true (the music's
// drop, where check-film allows the loudness jump). Every turn scene's start is a key of kind
// 'turn' whether or not the mode exports events. Keys must sit on a beat (± keyFrames frames); turn and
// claim keys on a bar line. Throws when a mode's events() throws (lib/fit.mjs reports it).
//
// The tier arrays (api 3; any api may give them, they are reported as INFO below api 3):
//   micro       [{ t, scene, what }]   T0: a word or phrase enters, a highlight jumps, a count ticks, a morph
//                                      step lands. Keys, scene starts, shots, expressive starts and peaks count
//                                      as onsets too, so they need not be repeated here
//   shots       [{ t, scene, what }]   T1: a new composition inside a scene (a camera move to a new region, a page
//                                      turn inside one type); every scene start is one already
//   expressive  [{ t, dur, device, variant, scene }]   T2: an expressive transition starting at t, lasting dur
//                                      seconds (or `beats`); device: an id from runtime/transitions,
//                                      runtime/handoffs or rules.devices (lib/fit.mjs warns on any other id); variant: what
//                                      changed from its last use (direction, origin, colour role), so a repeat
//                                      is not "unchanged"
//   peaks       [{ t, kind, climax, scene }]   T3: kind hook | claim | reveal | lockup; climax: true on one
// Holds may carry pause: true: a claim being read, allowed up to pauseMaxBars.
export const events = (t, content = t.content, rulesOrFn = t.rules) => {
  const rules = typeof rulesOrFn === 'function' ? rulesOrFn(content) : rulesOrFn;
  const o = optsOf(rules);
  const api = apiOf(rules);
  const strict = api >= 2;
  const g = { bpm: t.bpm, beat: t.beat, bar: t.bar, beatsPerBar: t.beatsPerBar, unit: t.unit, t0: 0 };
  const keys = [], holds = [], handoffs = [], micro = [], shots = [], expressive = [], peaks = [], notes = [];
  let mask = null;
  const at = (x, off, scene) => ({ ...x, t: x.t + off, scene: x.scene ?? scene });
  const add = (ev, off = 0, scene = null) => {
    if (!ev) return;
    for (const k of ev.keys || []) keys.push(at(k, off, scene));
    for (const h of ev.holds || []) holds.push({ ...h, from: h.from + off, to: h.to + off, scene: h.scene ?? scene });
    for (const h of ev.handoffs || []) handoffs.push(at(h, off, scene));
    for (const m of ev.micro || []) micro.push(at(m, off, scene));
    for (const m of ev.shots || []) shots.push(at(m, off, scene));
    for (const m of ev.expressive || []) expressive.push(at(m, off, scene));
    for (const m of ev.peaks || []) peaks.push(at(m, off, scene));
    if (ev.mask) mask = ev.mask;
  };
  t.scenes.forEach((s, i) => {
    const r = rules.types?.[s.type];
    if (r?.events) add(r.events(s, g, { i, scenes: t.scenes, content }), s.start, i);
  });
  if (rules.events) add(rules.events(t.scenes, g, content));
  t.scenes.forEach((s, i) => {
    if (s.timing?.turn && !keys.some((k) => k.kind === 'turn' && Math.abs(k.t - s.start) < 1e-6)) keys.push({ t: s.start, kind: 'turn', scene: i });
  });
  for (const x of expressive) {
    if (x.dur == null && Number.isFinite(x.beats)) x.dur = x.beats * g.beat;
    if (typeof x.device !== 'string' || !x.device) notes.push({ level: 'warn', scene: x.scene, msg: `expressive transition at ${x.t.toFixed(3)} s has no device id` });
  }
  for (const p of peaks) if (!PEAK_KINDS.includes(p.kind)) notes.push({ level: 'warn', scene: p.scene, msg: `peak kind "${p.kind}" is not one of ${PEAK_KINDS.join(', ')}` });
  const byT = (a, b) => a.t - b.t;
  keys.sort(byT); handoffs.sort(byT); micro.sort(byT); shots.sort(byT); expressive.sort(byT); peaks.sort(byT);
  holds.sort((a, b) => a.from - b.from);

  const tol = o.keyFrames / o.fps + 1e-6;
  const lvl = strict ? 'error' : 'warn';
  for (const k of keys) {
    if (k.drop != null && typeof k.drop !== 'boolean') notes.push({ level: 'warn', scene: k.scene, msg: `key at ${k.t.toFixed(3)} s: drop must be true or false` });
    if (!KEY_KINDS.includes(k.kind)) notes.push({ level: 'warn', scene: k.scene, msg: `key event kind "${k.kind}" is not one of ${KEY_KINDS.join(', ')}` });
    const grid = k.kind === 'turn' || k.kind === 'claim' ? g.bar : g.beat;
    const off = k.t - Math.round(k.t / grid) * grid;
    if (Math.abs(off) > tol) notes.push({ level: lvl, scene: k.scene, msg: `${k.kind} at ${k.t.toFixed(3)} s is ${(off * o.fps).toFixed(1)} frames off the ${grid === g.bar ? 'bar line' : 'beat'}` });
    if (k.t < -tol || k.t > t.duration + tol) notes.push({ level: lvl, scene: k.scene, msg: `${k.kind} at ${k.t.toFixed(3)} s is outside the film` });
  }
  for (const h of holds) if (!(h.to > h.from)) notes.push({ level: 'warn', scene: h.scene, msg: `hold ${h.from}–${h.to} s is empty` });
  if (mask && !(Array.isArray(mask) && mask.length === 4 && mask.every(Number.isFinite))) { notes.push({ level: 'warn', msg: 'mask must be [x, y, w, h]; ignored' }); mask = null; }

  const tr = tiers({
    duration: t.duration, beat: g.beat, bar: g.bar,
    scenes: t.scenes.map((s, i) => ({ i, type: s.type, start: s.start, end: s.end, rest: !!s.timing?.rest, climax: !!s.timing?.climax, reason: s.timing?.reason })),
    keys, holds, micro, shots, expressive, peaks,
  }, o, api);
  if (api < 3 && t.preview && tr.notes[0]) tr.notes[0].msg += `; ${t.preview}`;
  notes.push(...tr.notes);
  return { keys, holds, handoffs, mask, micro, shots, expressive, peaks, tiers: tr.summary, notes };
};

// ---------- the four tiers (api 3) ----------

const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const r2 = (x) => (x == null || !Number.isFinite(x) ? x : Math.round(x * 100) / 100);

// tiers(d, limits, api) → { summary, notes }. Pure data in, so check-film runs the same measures on a
// renders/timing.json: d = { duration, beat, bar, scenes: [{ i, type, start, end, rest, climax, reason }], keys,
// holds, micro, shots, expressive, peaks } (times in seconds). Notes carry `tier` (T0 | T1 | T2 | T3 | hold) and
// are errors (deterministic) or warnings (shape) at api ≥ 3; below it the measures go into one INFO note.
export const tiers = (d, limits = DEFAULTS, api = 3) => {
  const o = { ...DEFAULTS, ...(limits || {}) };
  const v3 = api >= 3;
  const D = Number(d.duration) || 0, beat = Number(d.beat) || 0.5, bar = Number(d.bar) || beat * 4;
  const frame = 1 / (o.fps || 30), eps = 1e-6;
  const scenes = (d.scenes || []).filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end));
  const list = (x) => (Array.isArray(x) ? x.filter((e) => e && Number.isFinite(e.t)) : []);
  const keys = list(d.keys), micro = list(d.micro), shots = list(d.shots), expressive = list(d.expressive), peaks = list(d.peaks);
  const holds = (Array.isArray(d.holds) ? d.holds : []).filter((h) => Number.isFinite(h.from) && Number.isFinite(h.to));
  const notes = [];
  const note = (tier, level, msg, scene) => notes.push({ level, tier, ...(scene != null ? { scene } : {}), msg });
  // composition starts are rounded to 1e-4 s below, so a start may sit up to 5e-5 s before its scene
  const near = 1e-4;
  const sceneAt = (x) => scenes.find((s) => x >= s.start - near && x < s.end - near) ?? scenes[scenes.length - 1];
  const reasoned = (s) => typeof s?.reason === 'string' && s.reason.trim().length > 0;
  const excusedScene = (s) => s && (s.rest || (s.climax && reasoned(s)));
  const ts = (x) => `${x.toFixed(2)} s`;

  // marked rests: rest scenes and pause holds; a T0 gap counts only its part outside them
  const rests = [...scenes.filter((s) => s.rest).map((s) => [s.start, s.end]), ...holds.filter((h) => h.pause === true).map((h) => [h.from, h.to])]
    .sort((a, b) => a[0] - b[0]).reduce((m, x) => { const l = m[m.length - 1]; if (l && x[0] <= l[1] + eps) l[1] = Math.max(l[1], x[1]); else m.push([...x]); return m; }, []);
  const outside = (a, b) => rests.reduce((free, [x, y]) => free - Math.max(0, Math.min(b, y) - Math.max(a, x)), b - a);

  // ---- T1: compositions = scene starts ∪ shots
  const starts = [...new Set([...scenes.map((s) => s.start), ...shots.map((x) => x.t)].filter((x) => x >= -eps && x < D - frame).map((x) => Math.round(Math.max(0, x) * 1e4) / 1e4))].sort((a, b) => a - b);
  if (!starts.length || starts[0] > eps) starts.unshift(0);
  const segs = starts.map((s, k) => ({ start: s, end: starts[k + 1] ?? D })).map((x) => ({ ...x, len: x.end - x.start, scene: sceneAt(x.start) }));
  const lens = segs.map((x) => x.len);
  const t1med = median(lens), mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const cv = lens.length > 1 && mean ? Math.sqrt(lens.reduce((a, x) => a + (x - mean) ** 2, 0) / lens.length) / mean : 0;
  const first = segs.filter((x) => x.start < o.firstSec - eps).length;
  let run = 1, best = lens.length ? 1 : 0, dir = 0;
  for (let k = 1; k < lens.length; k++) {
    const dd = lens[k] - lens[k - 1], sd = Math.abs(dd) <= frame ? 0 : Math.sign(dd);
    if (sd !== 0 && sd === dir) run++; else run = sd !== 0 ? 2 : 1;
    dir = sd; if (run > best) best = run;
  }
  const long = segs.filter((x) => x.len > o.sceneMaxSec + eps && !excusedScene(x.scene));
  const [mlo, mhi] = o.sceneMedianSec;
  if (lens.length >= 2) {
    if (t1med > mhi + eps) note('T1', 'error', `median composition ${r2(t1med)} s; at most ${mhi} s (${lens.length} compositions)`);
    else if (t1med < mlo - eps) note('T1', 'warn', `median composition ${r2(t1med)} s, under ${mlo} s: check every state can still be read`);
    if (cv < o.sceneCV - eps) note('T1', 'error', `composition lengths vary too little: CV ${r2(cv)}, at least ${o.sceneCV} (lengths ${lens.map((x) => r2(x)).join(' ')})`);
    if (best < 3) note('T1', 'warn', 'no run of three compositions that speeds up or slows down (Cutting 2016: lengths come in accelerating and decelerating runs)');
  }
  for (const x of long) note('T1', 'error', `composition at ${ts(x.start)} lasts ${r2(x.len)} s; at most ${o.sceneMaxSec} s (split it with a shot, or mark the scene rest, or climax with a reason)`, x.scene?.i);
  if (D > o.firstSec && first < o.firstScenes) note('T1', 'error', `${first} composition(s) in the first ${o.firstSec} s; at least ${o.firstScenes}`);

  // ---- T0: onsets = micro ∪ keys ∪ scene starts ∪ shots ∪ expressive starts ∪ peaks
  const on = [...micro, ...keys, ...shots, ...expressive, ...peaks].map((x) => x.t).concat(scenes.map((s) => s.start))
    .filter((x) => x >= -eps && x <= D + eps).sort((a, b) => a - b)
    .reduce((m, x) => { if (!m.length || x - m[m.length - 1] > frame / 2) m.push(x); return m; }, []);
  const gaps = [];
  for (let k = 0; k < on.length; k++) {
    const a = on[k], b = on[k + 1] ?? D;
    if (b - a > frame / 2) gaps.push({ a, b, free: outside(a, b) });
  }
  const counted = gaps.filter((x) => x.free > frame);
  const t0med = median(counted.map((x) => x.free / beat));
  const worst = counted.reduce((m, x) => (!m || x.free > m.free ? x : m), null);
  const tol = (2 * frame) / beat;
  if (on.length) {
    if (worst && worst.free / beat > o.microMaxGapBeats + tol) note('T0', 'error', `${r2(worst.free / beat)} beats without a change from ${ts(worst.a)} to ${ts(worst.b)}; at most ${o.microMaxGapBeats} (rest scenes and pause holds excepted)`, sceneAt(worst.a)?.i);
    const over = counted.filter((x) => x.free / beat > o.microMaxGapBeats + tol).length;
    if (over > 1) note('T0', 'error', `${over} gaps over ${o.microMaxGapBeats} beats in all`);
    if (t0med != null && t0med > o.microMedianBeats + tol) note('T0', 'error', `median gap between changes ${r2(t0med)} beats; at most ${o.microMedianBeats}`);
  }
  if (!micro.length) note('T0', 'warn', 'no micro events declared: T0 counts only scene starts, shots, keys, expressive transitions and peaks');

  // ---- holds: ≥ holdMinSec, ≤ holdMaxBeats (pause: ≤ pauseMaxBars), rest scenes excepted
  const short = [], lng = [];
  for (const h of holds) {
    const len = h.to - h.from, s = scenes.find((x) => x.i === h.scene) ?? sceneAt(h.from);
    if (s?.rest) continue;
    const cap = h.pause === true ? o.pauseMaxBars * bar : o.holdMaxBeats * beat;
    if (len < o.holdMinSec - eps) short.push(h);
    if (len > cap + eps) lng.push({ h, cap });
  }
  for (const h of short) note('hold', 'error', `hold ${ts(h.from)}–${ts(h.to)} is ${r2(h.to - h.from)} s; a landing holds at least ${o.holdMinSec} s`, h.scene);
  for (const { h, cap } of lng) note('hold', 'error', `hold ${ts(h.from)}–${ts(h.to)} is ${r2((h.to - h.from) / beat)} beats; at most ${h.pause ? `${o.pauseMaxBars} bars (pause)` : `${o.holdMaxBeats} beats (mark it pause: true only where a claim is read)`}`, h.scene);
  const pauses = holds.filter((h) => h.pause === true).length;
  if (pauses > o.claimsMax) note('hold', 'warn', `${pauses} pause holds; claims read in a pause are at most ${o.claimsMax} a film (draft)`);

  // ---- T2: expressive transitions
  const [elo, ehi] = o.expressiveEverySec;
  const nMin = Math.floor(D / ehi), nMax = Math.ceil(D / elo);
  const devices = {};
  for (const x of expressive) devices[x.device ?? '?'] = (devices[x.device ?? '?'] ?? 0) + 1;
  if (expressive.length < nMin || expressive.length > nMax) note('T2', 'error', `${expressive.length} expressive transition(s) in ${r2(D)} s; ${nMin}–${nMax} (one every ${elo}–${ehi} s)`);
  for (const [dev, n] of Object.entries(devices)) if (n > o.expressiveSameMax) note('T2', 'error', `device ${dev} used ${n} times; at most ${o.expressiveSameMax} a film`);
  for (let k = 1; k < expressive.length; k++) {
    const a = expressive[k - 1], b = expressive[k];
    if (a.device === b.device && JSON.stringify(a.variant ?? null) === JSON.stringify(b.variant ?? null)) note('T2', 'error', `device ${b.device} at ${ts(a.t)} and ${ts(b.t)} back to back unchanged; change its direction, origin or colour role (variant), or use another device`, b.scene);
  }
  for (const x of expressive) {
    if (!Number.isFinite(x.dur)) note('T2', 'warn', `expressive ${x.device ?? '?'} at ${ts(x.t)}: give its dur (seconds) or beats`, x.scene);
    else if (x.dur > o.expressiveMaxBeats * beat + eps) note('T2', 'error', `expressive ${x.device} at ${ts(x.t)} lasts ${r2(x.dur / beat)} beats; at most ${o.expressiveMaxBeats}`, x.scene);
  }
  const egaps = expressive.slice(1).map((x, k) => x.t - expressive[k].t);
  // spacing: the count alone lets transitions bunch up; two neighbours (or the film's start and the first, the last
  // and the film's end) more than ehi seconds apart leave a stretch without one (a warning: shape, not a rule)
  if (expressive.length) {
    const marks = [{ t: 0, edge: 'the start' }, ...expressive.map((x) => ({ t: x.t, x })), { t: D, edge: 'the end' }];
    for (let k = 1; k < marks.length; k++) {
      const a = marks[k - 1], b = marks[k], gap = b.t - a.t;
      if (gap <= ehi + eps) continue;
      const name = (m) => (m.edge ? `${m.edge} of the film` : `${m.x.device ?? '?'} at ${ts(m.t)}`);
      note('T2', 'warn', `${r2(gap)} s between ${name(a)} and ${name(b)} without an expressive transition; one every ${elo}–${ehi} s`, (b.x ?? a.x)?.scene);
    }
  }

  // ---- T3: peaks
  const [plo, phi] = o.peakCount, [clo, chi] = o.climaxAt;
  const climaxes = peaks.filter((p) => p.climax === true);
  let climax = null;
  if (peaks.length < plo || peaks.length > phi) note('T3', 'error', `${peaks.length} peak(s); ${plo}–${phi} a film (hook, claim or reveal, lock-up)`);
  if (climaxes.length > 1) note('T3', 'error', `${climaxes.length} peaks marked climax: true; mark one`);
  else if (climaxes.length === 1 && D > 0) {
    const c = climaxes[0], pos = c.t / D;
    climax = { t: c.t, at: r2(pos), kind: c.kind };
    if (pos < clo - eps || pos > chi + eps) note('T3', 'error', `climax at ${ts(c.t)} is ${Math.round(pos * 100)} % of the film; ${Math.round(clo * 100)}–${Math.round(chi * 100)} %`, c.scene);
    const k = segs.findIndex((x) => c.t >= x.start - eps && c.t < x.end - eps);
    const before = k > 0 ? segs.slice(Math.max(0, k - 2), k).map((x) => x.len) : [];
    if (before.length && t1med != null) {
      const bm = before.reduce((a, b) => a + b, 0) / before.length;
      climax.before = r2(bm);
      if (bm > t1med + eps) note('T3', 'warn', `the compositions before the climax average ${r2(bm)} s, longer than the median ${r2(t1med)} s; the run into the climax is the shortest`);
      const after = segs[k + 1];
      if (after && after.len <= bm + eps) note('T3', 'warn', `no release after the climax: the next composition (${r2(after.len)} s) is no longer than the ones before it`);
    }
  } else if (peaks.length) note('T3', 'warn', 'no peak is marked climax: true');

  const summary = {
    api,
    t0: { onsets: on.length, declared: micro.length, medianGapBeats: r2(t0med), maxGapBeats: worst ? r2(worst.free / beat) : null, maxGapAt: worst ? r2(worst.a) : null },
    t1: { count: segs.length, shots: shots.length, medianSec: r2(t1med), maxSec: r2(lens.length ? Math.max(...lens) : null), cv: r2(cv), first: first, run: best },
    t2: { count: expressive.length, range: [nMin, nMax], devices, gapSec: egaps.length ? [r2(Math.min(...egaps)), r2(Math.max(...egaps))] : null },
    t3: { count: peaks.length, climax },
    holds: { count: holds.length, pauses, short: short.length, long: lng.length },
  };
  if (!v3) {
    const by = {};
    for (const x of notes) if (x.level === 'error') by[x.tier] = (by[x.tier] ?? 0) + 1;
    const n = Object.values(by).reduce((a, b) => a + b, 0);
    return { summary, notes: [{ level: 'info', tier: 'all', msg: `api 3 tiers not enforced at api ${api}: ${n ? `${n} would be error(s) (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ')})` : 'all would pass'}; ${tierLine(summary)}` }] };
  }
  return { summary, notes };
};

// deviceNotes(expressive, known, rules) → warnings for T2 device ids that are neither in `known` (the ids of
// runtime/transitions and runtime/handoffs, which lib/fit.mjs collects) nor in rules.devices, the template's own T2
// devices (e.g. devices: ['plakat-accent-wipe']). A rules `devices` that is not an array of strings is reported too.
export const deviceNotes = (expressive, known, rules = {}) => {
  const notes = [], own = rules?.devices;
  const ok = new Set(known ?? []);
  if (own != null && !(Array.isArray(own) && own.every((x) => typeof x === 'string' && x))) notes.push({ level: 'warn', msg: 'rules.devices must be an array of device ids (strings); ignored' });
  else for (const d of own ?? []) ok.add(d);
  for (const d of new Set((expressive || []).map((x) => x.device).filter(Boolean))) {
    if (!ok.has(d)) notes.push({ level: 'warn', msg: `expressive device "${d}" is not an id of runtime/transitions or runtime/handoffs, nor one of the rules' own devices (rules.devices)` });
  }
  return notes;
};

// One line of the tier measures, for the fit table and the INFO note.
export const tierLine = (s) => !s ? '' : [
  `T0 ${s.t0.onsets} onsets (${s.t0.declared} micro), median gap ${s.t0.medianGapBeats ?? '–'} beats, max ${s.t0.maxGapBeats ?? '–'}`,
  `T1 ${s.t1.count} compositions, median ${s.t1.medianSec ?? '–'} s, max ${s.t1.maxSec ?? '–'} s, CV ${s.t1.cv}, ${s.t1.first} in the first 5 s`,
  `T2 ${s.t2.count} (wants ${s.t2.range[0]}–${s.t2.range[1]})`,
  `T3 ${s.t3.count} peaks${s.t3.climax ? `, climax at ${Math.round(s.t3.climax.at * 100)} %` : ''}`,
].join(' · ');

// The accent hex for check-film's accent-area measure: rules.accent (a hex, or content => hex), else
// content.accent, else `fallback` (lib/fit.mjs passes palettes.js[content.palette].accent). Omitted when
// none is a #rrggbb hex.
const HEX = /^#[0-9a-f]{6}$/i;
export const accentOf = (t, content = t.content, fallback) => {
  const r = t.rules?.accent;
  const v = [typeof r === 'function' ? r(content) : r, content?.accent, fallback].find((x) => typeof x === 'string' && HEX.test(x));
  return v ?? null;
};

// timingJson(t, ev, extra) → the object lib/fit.mjs writes to renders/timing.json (format api 3; rulesApi is the
// api the rules declare). micro, shots, expressive and peaks are the tier arrays of events(), tiers their
// measures (tierLine). pause: per step, true where the step is a reading pause. pad and phraseShare are
// in beats, reading in seconds, everything else in seconds or bars as named. mask null = the whole frame.
// limits: the effective rule values (DEFAULTS with the rules' overrides). A scene's max is null when it
// has no ceiling (a rest). Keys keep any extra fields a mode gives them, e.g. drop: true at the music's drop.
export const timingJson = (t, ev = events(t), extra = {}) => ({
  api: TIMING_API,
  rulesApi: t.rulesApi ?? apiOf(t.rules), // the api the rules declare: ≥ 3 means check-film fails the tiers
  duration: t.duration, bpm: t.bpm, beatsPerBar: t.beatsPerBar, t0: 0, unit: t.unit, phrase: t.phrase,
  limits: t.limits ? { ...t.limits } : { ...DEFAULTS },
  ...(() => { const a = accentOf(t, t.content, extra.accent); return a ? { accent: a } : {}; })(),
  scenes: t.scenes.map((s, i) => ({
    i, type: s.type, start: s.start, end: s.end, beats: tidy(s.bars * t.beatsPerBar), bars: s.bars, need: s.need,
    max: Number.isFinite(s.timing?.max) ? s.timing.max : null,
    pad: s.timing?.pad ?? 0, phraseShare: s.timing?.phraseShare ?? 0,
    reading: { primary: s.timing?.reading.primary ?? 0, glance: s.timing?.reading.glance ?? 0, from: s.timing?.reading.from ?? 'reader' },
    rest: !!s.timing?.rest, turn: !!s.timing?.turn, climax: !!s.timing?.climax,
    ...(s.timing?.still ? { still: s.timing.still } : {}),
    ...(s.timing?.pause ? { pause: s.timing.pause } : {}),
    ...(s.timing?.reason ? { reason: s.timing.reason } : {}),
  })),
  keys: ev.keys, holds: ev.holds, handoffs: ev.handoffs, mask: ev.mask,
  micro: ev.micro ?? [], shots: ev.shots ?? [], expressive: ev.expressive ?? [], peaks: ev.peaks ?? [],
  ...(ev.tiers ? { tiers: ev.tiers } : {}),
  notes: [...t.notes, ...(ev.notes || [])],
});

// A printable table for the agent: scene (numbered from 1), bars, start, seconds needed, reading
// (primary / glance seconds), pad and phrase share (beats), flags.
export const report = (t) => {
  const f = (x, n = 2) => (x ? x.toFixed(n) : '·');
  const head = ' #  type              bars    start    need  primary glance   pad share  flags';
  const rows = t.scenes.map((s, i) => {
    const T = s.timing || {};
    const flags = [T.turn && 'turn', T.rest && 'rest', T.climax && 'climax', s.absorb && 'absorb'].filter(Boolean).join(' ');
    const star = T.reading?.from === 'read' ? '*' : ' ';
    return `${String(i + 1).padStart(2)}  ${s.type.padEnd(16)} ${String(s.bars).padStart(5)}  ${s.start.toFixed(2).padStart(6)}s  ${s.need.toFixed(2).padStart(5)}s  ${f(T.reading?.primary).padStart(6)}${star} ${f(T.reading?.glance).padStart(6)}  ${f(T.pad, 2).padStart(4)} ${f(T.phraseShare, 2).padStart(5)}  ${flags}`;
  });
  if (t.scenes.some((s) => s.timing?.reading?.from === 'read')) rows.push('    * need() does not call ctx.reading(): reading shown from read(), not what need() counted');
  const notes = t.notes.map((n) => `${n.level.toUpperCase()}${n.scene != null ? ` scene ${n.scene + 1}` : ''}: ${n.msg}`);
  const tl = t.tiers && (t.rulesApi ?? 0) >= 3 ? [`tiers: ${tierLine(t.tiers)}`] : []; // below api 3 the INFO note carries them
  return [`${t.bpm} bpm · ${t.bars} bars · ${t.duration.toFixed(3)} s · unit ${t.unit} bar · phrase ${t.phrase} bars`, head, ...rows, ...tl, ...notes].join('\n');
};

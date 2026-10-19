// timeline.js — when everything happens, in beats. Picture (layouts.js, index.html), sound (score.mjs) and the
// length rules (timing.rules.js) all read it. Runs in the browser and in Node.
//
// Every time here is counted in beats from the scene's own start, never from its end and never scaled to its
// length: a scene that fit() makes longer lands at the same moments and holds longer, and plan() fills any still
// stretch over 1.75 beats with a glint (below), so no hold passes the 2 beats of timing API 3. Two things are tied
// to the scene's end: the text exit (it starts EXIT beats before the end and runs EXIT_OVER beats into the next
// scene) and the closing scene's last move (its accent squares light up on the downbeat of the film's last bar).
//
// Pacing (principles 4 and 5, the four tiers, owner-approved 2026-10-19):
//   T0  every phrase of text, every band landing, every hop of the roulette frame, every counter, reveal, glint
//   T1  every scene; inside `list` the stream is a second composition (a shot)
//   T2  the chapter entries (`enter: 'flip' | 'dither' | 'step'`): tally-flip, dither-sweep, step-wipe
//   T3  the opening scene's landing (hook), the reveal of the scene marked `climax: true`, the closing light
import { grid } from './lib/beat.js';
import { readTime } from './lib/timing.js';
import { beatsOf } from './lib/handoffs/index.js';
import { phrasesOf, tokens, tokensText, isWord, plain } from './fx.js';

// Square flight: within one group squares leave over STAGGER beats and each flies FLIGHT beats,
// so a group lands STAGGER + FLIGHT = 2 beats after it starts.
export const STAGGER = 0.6;
export const FLIGHT = 1.4;
// Mark, then move: when squares change role between scenes, they change colour in place over MARK beats
// and only then fly, so the viewer sees which squares before seeing where they go (one visual variable at
// a time: Heer & Robertson 2007; owner 2026-10-18). Colour never changes in flight.
export const MARK = 0.5;
// Flights leave on the beat after the mark (DEPART beats from the scene start), so every group lands on a beat.
// A scene whose squares keep their colours (a `columns` or `timeline` with no accent at landing after a scene
// with none) has nothing to mark and leaves on beat 0.
export const DEPART = 1;
// A change of protagonist: the old accent squares first fade to neutral (beats 0–0.5), the title names the new
// category in the accent, the new squares light up (beats 1–1.5) and the flight leaves at beat 2 (Hunt 1995:
// emphasis only works when everything else is alike). One beat longer than a plain mark.
export const UNMARK_AT = 0, SWAP_MARK_AT = 1, SWAP_DEPART = 2;
// The first scene's squares appear in a wave: departures over WAVE.from … WAVE.from + WAVE.spread beats,
// each grows for WAVE.grow beats, so the wave settles on beat 3.
export const WAVE = { from: 0.25, spread: 2.05, grow: 0.7 };
export const WAVE_END = WAVE.from + WAVE.spread + WAVE.grow;
// Text leaves over EXIT + EXIT_OVER = 0.4 beat, at most 2/3 of the 0.35 s entrance (2026-10-18, brisk): it starts
// EXIT beats before the scene ends and finishes EXIT_OVER beats into the next scene. The next title enters at
// TITLE_AT, as the old text finishes leaving: no empty beat between chapters.
export const EXIT = 0.15, EXIT_OVER = 0.25;
export const TITLE_AT = EXIT_OVER;
// Text per state (timing API 3): a line of primary text enters phrase by phrase, PHRASE_STEP beats apart, each
// phrase at most STATE_WORDS words (fx.js phrasesOf). A phrase enters whole: WORD_STEP 0, no word ripple (a 60–90 ms
// word stagger on a fade-and-rise is web-page load motion, references/ai-tells.md); the beat between phrases is the
// rhythm.
export const PHRASE_STEP = 1, WORD_STEP = 0, STATE_WORDS = 5;
// The closing scene's last move: its accent squares light up one by one from the downbeat of the last bar,
// LIGHT_SPAN beats in all, LIGHT_STEP apart at most (the secondary move of the closing lock-up).
export const LIGHT_SPAN = 1, LIGHT_STEP = 0.25;
// Closing numbers land NUM_STEP beats apart.
export const NUM_STEP = 1;
// Chapter entries (T2), content `enter` on a scene after the first. 'flip' and 'dither' are frame-level
// transitions (lib/transitions: tally-flip, dither-sweep) over beats 0–2: the old frame turns into the new one
// whose squares already wear their new colours (the transition is the mark), and the squares leave at beat 2.
// 'step' (lib/handoffs step-wipe) needs a `columns` scene before a `timeline`: the band labels leave (beat 0–0.4),
// a staircase front whose steps are the timeline's columns sweeps in over beats 1–2 and stays as the chart.
export const ENTER = {
  flip: { device: 'tally-flip', beats: 2 },
  dither: { device: 'dither-sweep', beats: 2 },
  step: { device: 'step-wipe', at: 1, beats: 1 },
};
// The roulette (`pick: 'roulette'` on a columns scene; lib/handoffs roulette-lock): a frame hops to each band as it
// lands, half a beat apart, laps back to the top band and slows (a beat a hop) onto the protagonist, which lights up
// on the lock. Real candidates: the bands themselves (PLAN §4 X10).
export const ROULETTE = { laps: 1, step: 0.5, slow: 2, settle: 0.4 };
// `list` (lib/handoffs stream-brake): the listed squares fly into a column of lines, the list streams up and brakes
// exponentially onto the key item (80 % of STREAM beats), the reading band locks at the end (PLAN §4 X14).
export const STREAM = 2, STREAM_STOP = 0.8;
// `trend` (lib/handoffs re-encode): the timeline's columns step back and their tops become points, then a curve
// draws through them: the same counts, read as a trend (PLAN §4 X07). From beat REENCODE_AT for REENCODE beats.
export const REENCODE_AT = 1, REENCODE = 2;
// Glints: a still stretch longer than GLINT_GAP beats (1.5: the motion model below is approximate, the limit is 2) inside a scene gets a sweep of light along the protagonist's
// squares (or the scene's base squares), GLINT_LEAD beats after the stillness begins: the T0 change that is not new
// text (CONTRACT "Migrating", step 3), so a long reading window never holds a fully still frame past 2 beats.
export const GLINT_GAP = 1.5, GLINT_LEAD = 1, GLINT_SPAN = 0.6, GLINT_SWELL = 0.35;
// A chart scene that closes the film (columns, share or timeline with an accent, as the last scene) also ends
// with a second move on the downbeat of the film's last bar, a sweep by rank over LIGHT_SPAN beats: every square
// that is not the protagonist steps back from `base` to `rest` while the protagonist's squares light up one by one
// along their band (Hunt 1995: emphasis by contrast with everything alike).
// The sweep runs over CHART_LIGHT_SPAN beats (3) of the last bar, so the frame settles only in its last beat (api 3:
// no still past 2 beats outside a rest); the protagonist's squares swell × 1.4 so the sweep reads on small squares, and
// in columns and share the protagonist's value pulses as the sweep reaches the end of its band (lightEnd()).
export const CHART_LIGHT_SPAN = 3;
export const CLOSING_CHARTS = new Set(['columns', 'share', 'timeline']);
export const lightEnd = (T) => T.light + (CHART_LIGHT_SPAN - 0.4) * T.beat;
export const closesChart = (ch, last) => !!last && CLOSING_CHARTS.has(ch.type) && !!ch.accent;
// A closing number's reading tier: beside an accent number the others recap counts already shown in earlier
// chapters, so they are glance text (≤ 6 words with the number); without an accent every number is primary.
export const closeTier = (ch, x) => (x.accent || !(ch.numbers || []).some((y) => y.accent) ? 'primary' : 'glance');

const ceilTo = (beat, per) => Math.ceil(beat / per - 1e-6) * per;

// Count of groups a scene moves in sequence (bands, segments, periods, series, numbers); from the data.
export const groupCount = (ch, m) => {
  if (ch.type === 'columns') return m.groups(ch.top ?? 7, ch.restLabel).length;
  if (ch.type === 'share') return m.groups(ch.top ?? 5, ch.restLabel).length;
  if (ch.type === 'timeline' || ch.type === 'trend') return m.periods.length;
  if (ch.type === 'axis') return (ch.series || []).length;
  if (ch.type === 'close') return (ch.numbers || []).length;
  return 1;
};

// The accent band of a columns or share scene (its index among the shown groups), or -1.
export const accentGroup = (ch, m) => {
  if (!ch.accent) return -1;
  const sel = m.match(ch.accent);
  return m.groups(ch.top ?? (ch.type === 'columns' ? 7 : 5), ch.restLabel).findIndex((g) => g.key !== '__rest' && m.units.some((u) => g.ids.includes(u.c) && sel(u)));
};

// The listed units of a `list` scene in data order, and the index of its key item among them.
export const listOf = (ch, m) => {
  const units = m.units.filter(m.match(ch.sel || 'all'));
  let key = units.length - 1;
  if (ch.key === 'first') key = 0;
  else if (ch.key && ch.key !== 'last') key = units.findIndex(m.match(ch.key));
  return { units, key };
};

// Which squares wear the accent: when the scene's squares land (`at: 'land'`) and when it ends (`at: 'end'`,
// after a reveal). A Set of unit indices; empty when the scene marks no squares.
export const accentUnits = (ch, m, at = 'land') => {
  const ids = (sel) => new Set(m.units.filter(m.match(sel)).map((u) => u.k));
  switch (ch.type) {
    case 'columns':
    case 'share': {
      if (!ch.accent || (ch.type === 'columns' && ch.pick && at === 'land')) return new Set();
      const sel = m.match(ch.accent);
      const cats = new Set(m.groups(ch.top ?? (ch.type === 'columns' ? 7 : 5), ch.restLabel)
        .filter((g) => g.key !== '__rest' && m.units.some((u) => g.ids.includes(u.c) && sel(u)))
        .flatMap((g) => g.ids));
      return new Set(m.units.filter((u) => cats.has(u.c)).map((u) => u.k));
    }
    case 'split':
      return ch.by ? ids(ch.by) : new Set();
    case 'timeline':
      return at === 'end' && ch.accent ? ids(ch.accent) : new Set();
    case 'list': {
      if (at !== 'end') return new Set();
      const L = listOf(ch, m);
      return L.units[L.key] ? new Set([L.units[L.key].k]) : new Set();
    }
    default:
      return new Set(); // count, axis (the bars carry the accent), trend (the curve does), close (lights at the end)
  }
};

// swaps(scenes, m)[i]: scene i changes the protagonist (P-12): the previous scene ends with accent squares and
// this one lands different ones.
export const swaps = (scenes, m) =>
  scenes.map((ch, i) => {
    if (i === 0) return false;
    const a = accentUnits(scenes[i - 1], m, 'end'), b = accentUnits(ch, m, 'land');
    if (!a.size || !b.size) return false;
    if (a.size !== b.size) return true;
    for (const k of a) if (!b.has(k)) return true;
    return false;
  });

// The entry of scene i (ENTER), or null: never on the first scene; 'step' only from columns into timeline.
export const entryOf = (scenes, i) => {
  const ch = scenes[i], e = ch?.enter && ENTER[ch.enter];
  if (!e || i === 0) return null;
  if (ch.enter === 'step' && !(scenes[i - 1].type === 'columns' && ch.type === 'timeline')) return null;
  return { kind: ch.enter, ...e };
};

// Nothing to mark: a columns or timeline scene that lands no accent after a scene that ends with none, and has
// no colour of its own to change (all its squares land in `base`).
const marklessOf = (ch, prev, m) => (ch.type === 'columns' || ch.type === 'timeline') && !!prev && !accentUnits(ch, m, 'land').size && !accentUnits(prev, m, 'end').size && prev.type !== 'split' && prev.type !== 'share' && prev.type !== 'close' && prev.type !== 'trend';

// A line of primary text, phrase by phrase: [{ at (beats), text (markup), plain, words }], from `at`, PHRASE_STEP
// apart. `fill` turns copy into filled markup text.
export const linePhrases = (text, at, step = PHRASE_STEP) =>
  text ? phrasesOf(text, STATE_WORDS).map((p, k) => ({ at: at + k * step, text: p.text, plain: p.plain, words: p.words })) : [];
const lastAt = (ph, or = 0) => (ph.length ? ph[ph.length - 1].at : or);
// The roulette's hop times (beats from its start) and lock, from lib/handoffs roulette-lock's own schedule.
export const rouletteOf = (n, answer) => {
  const P = { labels: Array.from({ length: n }, (_, k) => String(k)), answer: Math.max(0, answer), ...ROULETTE };
  const L = n * P.laps + P.answer + 1, hops = [];
  let b = 0;
  for (let i = 0; i < L; i++) { hops.push(b); b += P.step * (i >= L - 3 ? P.slow : 1); }
  const beats = beatsOf('roulette-lock', P);
  return { P, hops, lock: beats - P.settle, beats };
};

// The scene's choreography in beats from its start. o = { first, swap, prev, last, beat, entry, fill }:
// first = it opens the film (its squares appear in a wave); swap = it changes the protagonist (swaps());
// prev = the scene before; last = it closes the film; beat (s) lets the closing line wait until the closing
// numbers' labels are read; entry = entryOf(); fill = copy → filled markup text.
export const schedule = (ch, m, { first = false, swap = false, prev = null, last = false, beat = null, entry = null, fill = (x) => String(x ?? '') } = {}) => {
  const n = groupCount(ch, m);
  const markless = !first && !entry && !swap && marklessOf(ch, prev, m);
  const M = first ? 0 : entry && entry.kind !== 'step' ? entry.beats : swap ? SWAP_DEPART : markless ? 0 : DEPART;
  const S = {
    title: TITLE_AT, depart: M, swap, closing: closesChart(ch, last), entry,
    instant: !!entry, // the entry is the mark: the new colours are there from beat 0
    mark: first || entry || markless ? null : swap ? SWAP_MARK_AT : 0, unmark: swap && !entry ? UNMARK_AT : null,
    delay: new Array(Math.max(1, n)).fill(M), land: [], lines: {},
  };
  const phr = (key, at, text) => { const p = linePhrases(text == null ? '' : fill(text), at); if (p.length) S.lines[key] = p; return p; };
  const title = phr('title', TITLE_AT, ch.title);
  switch (ch.type) {
    case 'count': {
      S.counter = [M + 0.5, 3]; // [start, length] in beats
      S.caption = M + 2.5;
      const cap = phr('caption', S.caption, ch.caption);
      S.note = lastAt(cap, S.caption) + 1;
      S.land = [first ? WAVE_END : 2 + M];
      break;
    }
    case 'columns':
    case 'share':
    case 'timeline': {
      const step = ch.type === 'timeline' ? Math.min(0.5, 6 / Math.max(1, n)) : 0.5;
      if (entry?.kind === 'step') {
        // the staircase lands the whole chart at once: every group is in place when the front stops
        S.step = [entry.at, entry.beats];
        const at = entry.at + entry.beats;
        S.delay = S.delay.map(() => at - STAGGER - FLIGHT);
        S.land = S.delay.map(() => at);
      } else {
        // groups land on eighth notes; the first leaves late enough that the last one lands on a beat
        const late = Math.ceil((n - 1) * step - 1e-6) - (n - 1) * step;
        S.delay = S.delay.map((_, k) => M + late + k * step);
        S.land = S.delay.map((d) => d + STAGGER + FLIGHT);
      }
      const lastLand = S.land[S.land.length - 1];
      S.reveal = ceilTo(lastLand + (S.step ? 1 : 0.5), 1); // the accent on the next beat
      if (ch.type === 'columns' && ch.pick === 'roulette' && ch.accent) {
        // the frame hops to each band as it lands; the start shifts so the lock falls on a whole beat
        const R = rouletteOf(n, accentGroup(ch, m));
        const start = ceilTo(S.land[0] + R.lock, 1) - R.lock;
        S.roulette = { start, hops: R.hops.map((h) => start + h), lock: start + R.lock, beats: R.beats, P: R.P };
        S.reveal = start + R.lock;
        // the title names the protagonist as the frame locks on it: its accent words become their own phrase
        const k = title.findIndex((p) => /\*[^*]+\*/.test(p.text));
        if (k >= 0) {
          const tk = tokens(title[k].text), a = tk.findIndex((x) => x.kind === 'accent');
          const before = tk.slice(0, a), after = tk.slice(a);
          const part = (list, at) => ({ at, text: tokensText(list), plain: plain(tokensText(list)), words: list.filter((x) => isWord(x.text)).length });
          if (before.some((x) => isWord(x.text))) title.splice(k, 1, part(before, title[k].at), part(after.map((x, j) => (j ? x : { ...x, sp: false })), S.reveal));
          else title[k].at = Math.max(title[k].at, S.reveal);
        }
      }
      if (ch.type === 'columns' || ch.type === 'axis') phr('callout', S.reveal, ch.callout);
      break;
    }
    case 'split': {
      S.delay = [M, M + 1];
      S.land = [2 + M, 3 + M]; // matches first, then the rest, each on a beat
      S.counter = [1 + M, 2]; // starts once the matches have left the bands
      S.reveal = 3 + M; // the counter lands; its caption (which may carry the percentage) enters only now
      S.caption = S.reveal + 0.5; // its own state: the number is read first
      const cap = phr('caption', S.caption, ch.caption);
      S.other = lastAt(cap, S.reveal) + 0.5; // the complement line, at label size
      S.labels = [S.other + 0.5, S.other + 1]; // the grid labels, an eighth apart
      break;
    }
    case 'axis': {
      S.land = [2 + M];
      S.grow = (ch.series || []).map((_, k) => M + 2.5 + k * 0.5);
      S.growLen = 2;
      const lastStart = M + 2.5 + (n - 1) * 0.5;
      S.reveal = Math.ceil(lastStart + 1.5);
      S.foot = 3 + M; // the footnote arrives with the chart
      phr('callout', S.reveal, ch.callout);
      break;
    }
    case 'trend': {
      // the squares stay in their columns; the re-encode runs from REENCODE_AT, the curve is the accent when done
      S.delay = S.delay.map(() => 0);
      S.reencode = [REENCODE_AT, REENCODE];
      S.reveal = REENCODE_AT + REENCODE;
      S.land = [S.reveal];
      S.mark = prev && accentUnits(prev, m, 'end').size ? 0 : null; // lit squares return to neutral first
      phr('callout', S.reveal, ch.callout);
      break;
    }
    case 'list': {
      S.land = [2 + M];
      S.stream = [2 + M, STREAM];
      S.stop = 2 + M + STREAM * STREAM_STOP;
      S.reveal = 2 + M + STREAM; // the band locks onto the key item
      S.keyRead = S.stop; // the key line is readable from the stop
      S.note = S.reveal;
      break;
    }
    case 'close': {
      S.land = [2 + M];
      // numbers on beats, a beat apart: the first a beat after the flight leaves, the second as the rule lands
      S.nums = (ch.numbers || []).map((_, k) => M + 1 + k * NUM_STEP);
      let at = M + 1 + n * NUM_STEP;
      if (beat && ch.line) {
        // the line enters on the eighth after the primary numbers have been read (0.2 s to readable); beside an
        // accent number the others are glance text (closeTier), read in parallel
        let done = 0;
        (ch.numbers || []).forEach((x, k) => { if (closeTier(ch, x) === 'primary') done = Math.max(done, S.nums[k] * beat + 0.2) + readTime(`0 ${String(fill(x.label)).replace(/[*[\]]/g, '')}`); });
        at = Math.max(at, Math.ceil((done / beat) * 2 - 1e-6) / 2);
      }
      S.line = at;
      phr('line', at, ch.line);
      break;
    }
    default:
      throw new Error(`unknown scene type ${ch.type}`);
  }
  // when the last phrase of each line enters, in beats
  const lineEnd = Math.max(0, ...Object.values(S.lines).map((p) => lastAt(p)));
  // the last moment anything moves (a landing, a counter settling, a reveal, a phrase entering), in beats
  S.settle = Math.max(
    ...S.land,
    S.counter ? S.counter[0] + S.counter[1] : 0,
    S.other ?? 0,
    S.reveal ?? 0,
    S.grow ? S.grow[S.grow.length - 1] + S.growLen : 0,
    S.nums ? S.nums[S.nums.length - 1] : 0, // + the 0.9 s count of the last number (seconds; timing.rules.js adds it)
    S.labels ? S.labels[S.labels.length - 1] : 0,
    S.note ?? 0,
    lineEnd,
    first ? WAVE_END : 0,
  );
  return S;
};

// The squares that light up in the closing move and the beat offset of each, from the last downbeat.
export const lightStep = (count) => Math.min(LIGHT_STEP, LIGHT_SPAN / Math.max(1, count));

// ---------- what moves when: the still windows, the glints, renders/timing.json ----------
// Seconds from the scene start: every window in which something on screen moves. TEXT_IN: an entrance (its 0.35 s
// fade; the 14 px rise is under a pixel after that), plus the word ripple of a phrase; POP_SEC: a reveal's pop.
export const TEXT_IN = 0.35, COUNT_SEC = 0.9, POP_SEC = 0.4;
const phraseIn = (p, b) => TEXT_IN + Math.max(0, p.words - 1) * WORD_STEP * b;
export const motionWindows = (ch, S, beat, { first = false, light = null, glints = [] } = {}) => {
  const b = beat, w = [];
  const add = (from, to) => { if (to > from) w.push([from, to]); };
  const text = (at) => add(at, at + TEXT_IN);
  if (S.entry && S.entry.kind !== 'step') add(0, S.entry.beats * b);
  if (S.step) add(0, (S.step[0] + S.step[1]) * b); // the old labels leave, then the front sweeps
  if (S.unmark != null) add(S.unmark * b, (S.unmark + MARK) * b);
  if (S.mark != null) add(S.mark * b, (S.mark + MARK) * b);
  if (first) add(WAVE.from * b, WAVE_END * b);
  else if (ch.type !== 'trend' && !S.step) add(Math.min(...S.delay) * b, Math.max(...S.land) * b);
  if (S.counter) add(S.counter[0] * b, (S.counter[0] + S.counter[1]) * b);
  for (const ph of Object.values(S.lines)) for (const p of ph) add(p.at * b, p.at * b + phraseIn(p, b));
  if (ch.sub) text(S.title * b + 0.25);
  for (const k of ['note', 'other', 'foot']) if (S[k] != null && (ch[k] || (k === 'note' && ch.type === 'list'))) text(S[k] * b);
  (S.labels || []).forEach((t) => text(t * b));
  if (S.reveal != null) add(S.reveal * b, S.reveal * b + POP_SEC);
  if (S.grow) add(S.grow[0] * b, (S.grow[S.grow.length - 1] + S.growLen) * b);
  (S.nums || []).forEach((t) => add(t * b, t * b + COUNT_SEC));
  if (S.roulette) {
    for (const h of S.roulette.hops) add(h * b, h * b + 1 / 30); // a hop is a jump: one frame of change
    add(S.roulette.hops[0] * b, (S.roulette.hops[0] + 0.24) * b); // the frame pops in
    const wrap = S.roulette.hops.find((h, k) => k && k === groupCountOf(S)); // the slide back to the top band
    if (wrap != null) add(wrap * b, (wrap + 0.3) * b);
    add(S.roulette.lock * b, (S.roulette.lock + ROULETTE.settle) * b);
  }
  if (S.stream) add(S.stream[0] * b, (S.stream[0] + S.stream[1]) * b);
  if (S.reencode) add(S.reencode[0] * b, (S.reencode[0] + S.reencode[1]) * b);
  if (ch.type === 'list') add(S.keyRead * b, S.keyRead * b + TEXT_IN);
  if (light != null) add(light, light + (S.closing ? CHART_LIGHT_SPAN : LIGHT_SPAN) * b + 0.35);
  if (light != null && S.closing && ch.type !== 'timeline') add(light, light + (CHART_LIGHT_SPAN - 0.4) * b + 0.32); // the value answers
  for (const g of glints) add(g, g + GLINT_SPAN * b + GLINT_SWELL);
  return w.sort((x, y) => x[0] - y[0]);
};
const groupCountOf = (S) => S.roulette.P.labels.length;
// The still windows between `from` and `to` (seconds), given motion windows.
export const stillWindows = (motion, from, to) => {
  const out = [];
  let t = from;
  for (const [a, z] of motion) {
    if (a > t) out.push([t, Math.min(a, to)]);
    t = Math.max(t, z);
    if (t >= to) break;
  }
  if (t < to) out.push([t, to]);
  return out.filter(([a, z]) => z - a > 1e-6);
};
// Glints for a scene of length `dur` (s): in every still window longer than GLINT_GAP beats, one GLINT_LEAD beats
// after it begins (on the half beat of the film's grid), and again after that glint while the rest is too long.
// `origin` = the scene's start (s), to snap to the film's grid.
export const glintsOf = (ch, S, beat, dur, { first = false, light = null, origin = 0 } = {}) => {
  const glints = [];
  const end = dur - EXIT * beat;
  for (let guard = 0; guard < 12; guard++) {
    const still = stillWindows(motionWindows(ch, S, beat, { first, light, glints }), 0, end);
    const long = still.find(([a, z]) => z - a > GLINT_GAP * beat + 1e-6 && !(light != null && a >= light - 1e-6));
    if (!long) break;
    const half = beat / 2;
    const g = Math.ceil((origin + long[0] + GLINT_LEAD * beat) / half - 1e-6) * half - origin;
    if (g >= long[1] - 0.05) break;
    glints.push(g);
  }
  return glints.sort((a, b) => a - b);
};

// plan(content, m, fitted) — fitted = lib/timing.js fit(content, rules): scene starts, bars, bpm.
export const plan = (content, m, fitted) => {
  const g = grid({ bpm: fitted.bpm, beatsPerBar: fitted.beatsPerBar ?? 4 });
  const laid = fitted.scenes;
  const sw = swaps(laid, m);
  const fill = (x) => m.fill(String(x ?? ''));
  laid.forEach((ch, i) => {
    const B = (beats) => ch.start + beats * g.beat;
    const n = groupCount(ch, m);
    const entry = entryOf(laid, i);
    const last = i === laid.length - 1;
    const S = schedule(ch, m, { first: i === 0, swap: sw[i], prev: laid[i - 1] ?? null, last, beat: g.beat, entry, fill });
    const T = { i, first: i === 0, beat: g.beat, B, swap: sw[i] };
    T.title = B(S.title);
    T.depart = S.depart; // beats from chapter start
    T.mark = S.mark; // beats from chapter start (null: no mark)
    T.unmark = S.unmark;
    T.instant = S.instant;
    T.delay = S.delay; // group start, beats from chapter start
    T.land = S.land.map(B); // group landing, seconds
    T.lines = Object.fromEntries(Object.entries(S.lines).map(([k, ph]) => [k, ph.map((p) => ({ ...p, t: B(p.at) }))]));
    T.busy = []; // windows with fast motion (motion blur on)
    T.ticks = []; // counter ticks for the sound
    if (S.counter) T.counter = [B(S.counter[0]), S.counter[1] * g.beat];
    if (S.caption != null) T.caption = B(S.caption);
    if (S.note != null) T.note = B(S.note);
    if (S.other != null) T.other = B(S.other);
    if (S.labels) T.labels = S.labels.map(B);
    if (S.reveal != null) T.reveal = B(S.reveal);
    if (S.grow) { T.grow = S.grow.map(B); T.growDur = S.growLen * g.beat; }
    if (S.foot != null) T.foot = B(S.foot);
    if (S.entry && S.entry.kind !== 'step') T.entry = { ...S.entry, t0: ch.start, dur: S.entry.beats * g.beat };
    if (S.step) T.step = [B(S.step[0]), S.step[1] * g.beat];
    if (S.roulette) T.roulette = { start: B(S.roulette.start), hops: S.roulette.hops.map(B), lock: B(S.roulette.lock), dur: S.roulette.beats * g.beat, P: S.roulette.P };
    if (S.stream) { T.stream = [B(S.stream[0]), S.stream[1] * g.beat]; T.stop = B(S.stop); T.keyRead = B(S.keyRead); }
    if (S.reencode) T.reencode = [B(S.reencode[0]), S.reencode[1] * g.beat];
    if (S.nums) {
      T.nums = S.nums.map(B);
      T.line = B(S.line);
      // the closing move: on the downbeat of the film's last bar (the scene ends on a phrase line)
      T.reveal = ch.end - g.bar;
      T.light = T.reveal;
    }
    if (S.closing) T.light = ch.end - g.bar; // a closing chart scene: the others step back on the last downbeat
    T.wave = i === 0 && ch.type === 'count'; // a count opener: squares appear in a wave instead of flying
    if (T.wave) T.busy.push([B(0.2), B(WAVE_END + 0.1)]);
    else if (ch.type !== 'trend' && !T.step) T.busy.push([B(T.depart), Math.max(...T.land) + 0.05]);
    if (T.stream) T.busy.push([T.stream[0], T.stream[0] + T.stream[1]]);
    if (T.counter) {
      // ticks thin out as the counter eases (expo-out): one tick each time the value passes another 1/14
      const [t0, d] = T.counter;
      for (let k = 1; k <= 14; k++) {
        const u = k / 14;
        const x = u >= 1 ? 1 : -Math.log2(1 - u * 0.999) / 10;
        T.ticks.push(t0 + Math.min(1, x) * d);
      }
    }
    // glints in the still stretches over GLINT_GAP beats (not in the closing scene, a rest, nor before its light)
    const lightRel = ch.type === 'close' || S.closing ? T.light - ch.start : null;
    T.glints = ch.type === 'close' ? [] : glintsOf(ch, S, g.beat, ch.end - ch.start, { first: i === 0, light: lightRel, origin: ch.start }).map((x) => ch.start + x);
    ch.T = T;
    ch.S = S; // the schedule in beats, for motionWindows()
    ch.i = i;
    ch.groups = n;
  });
  return { g, chapters: laid, events: events(laid) };
};

// Sound events on the same clock: whoosh on every flight, thud on every landing, chime on the accent reveal and
// the closing light; mark / unmark on the colour changes before a flight; the devices' own sounds.
const events = (laid) => {
  const ev = [];
  for (const ch of laid) {
    const T = ch.T;
    if (T.unmark != null) ev.push({ t: T.B(T.unmark), kind: 'unmark' });
    if (T.mark != null) ev.push({ t: T.B(T.mark), kind: 'mark' });
    if (T.entry) ev.push({ t: T.entry.t0, kind: T.entry.kind, dur: T.entry.dur }); // flip: a tick roll; dither: a quiet glitch
    if (!T.first && ch.type !== 'trend' && !T.step) ev.push({ t: T.B(T.depart), kind: 'whoosh' }); // the squares leave after the mark
    if (T.step) { ev.push({ t: T.step[0], kind: 'step', dur: T.step[1], n: ch.groups }); ev.push({ t: T.step[0] + T.step[1], kind: 'stamp' }); }
    T.ticks.forEach((t, k) => ev.push({ t, kind: 'tick', gain: 1 - k / 20 }));
    if (ch.type === 'columns' || ch.type === 'share' || (ch.type === 'timeline' && !T.step))
      T.land.forEach((t, k) => ev.push({ t, kind: 'thud', gain: k === 0 ? 1 : 0.7, pitch: k }));
    if (ch.type === 'axis') T.grow.forEach((t, k) => ev.push({ t, kind: 'thud', gain: 0.75, pitch: k }));
    if (ch.type === 'split') ev.push({ t: T.land[1], kind: 'thud', gain: 0.8 });
    if (ch.type === 'close') T.nums.forEach((t, k) => ev.push({ t, kind: 'thud', gain: 1, pitch: k }));
    if (T.roulette) { T.roulette.hops.forEach((t, k) => ev.push({ t, kind: 'hop', k })); ev.push({ t: T.roulette.lock, kind: 'stamp' }); }
    if (T.stream) { ev.push({ t: T.stream[0], kind: 'stream', dur: T.stream[1] * STREAM_STOP }); ev.push({ t: T.stop, kind: 'tick', gain: 1 }); }
    if (T.reencode) ev.push({ t: T.reencode[0], kind: 'reencode', dur: T.reencode[1], n: ch.groups });
    if (ch.type === 'list') ev.push({ t: ch.start + T.depart * T.beat, kind: 'whoosh' });
    T.glints.forEach((t) => ev.push({ t, kind: 'glint' }));
    if (T.reveal != null && ch.type !== 'close') ev.push({ t: T.reveal, kind: 'chime', ...(ch.climax === true ? { climax: true } : {}) });
    if (ch.type === 'close') ev.push({ t: T.reveal, kind: 'chime' });
    if (ch.S?.closing) ev.push({ t: T.light, kind: 'chime' }); // the closing light of a chart scene
  }
  return ev.filter((e, k, a) => !(e.kind === 'whoosh' && a.findIndex((x) => x.kind === 'whoosh' && Math.abs(x.t - e.t) < 1e-6) !== k)).sort((a, b) => a.t - b.t);
};

// Timing events for lib/timing.js (renders/timing.json, read by check-film), in seconds:
// keys: every mark and unmark (kind 'accent'), every regroup's last landing ('land'), every reveal ('accent'),
// the closing move ('end'); handoffs: each flight's departure and arrival; holds: every still window of at least
// 0.2 s up to the text exit (the closing scene: to the fade); micro: every T0 onset; shots: the list's stream;
// expressive: the entries; peaks: hook, climax, lock-up.
export const timingEvents = (laid, g, { fadeOut = 0.6 } = {}) => {
  const keys = [], holds = [], handoffs = [], micro = [], shots = [], expressive = [], peaks = [];
  const b = g.beat;
  for (const ch of laid) {
    const T = ch.T, scene = ch.i, S = ch.S, t0 = ch.start;
    const mi = (t, what) => micro.push({ t, scene, what });
    if (T.unmark != null) keys.push({ t: T.B(T.unmark), kind: 'accent', scene });
    if (T.mark != null) keys.push({ t: T.B(T.mark), kind: 'accent', scene });
    if (!T.wave && ch.type !== 'trend' && !T.step) handoffs.push({ t: T.B(T.depart), scene });
    const landed = Math.max(...T.land);
    handoffs.push({ t: landed, scene });
    keys.push({ t: landed, kind: 'land', scene });
    if (T.reveal != null) keys.push({ t: T.reveal, kind: ch.type === 'close' ? 'end' : 'accent', scene });
    if (S.closing) keys.push({ t: T.light, kind: 'end', scene });
    // T0: the same tables the picture draws from
    if (T.mark != null) mi(T.B(T.mark), 'mark');
    if (T.unmark != null) mi(T.B(T.unmark), 'unmark');
    if (!T.wave && !T.step && ch.type !== 'trend') mi(T.B(T.depart), 'flight leaves');
    if (T.wave) mi(T.B(WAVE.from), 'the wave begins');
    [...new Set(T.land.map((x) => Math.round(x * 1e4) / 1e4))].forEach((x, k) => mi(x, `group ${k + 1} lands`));
    for (const [k, ph] of Object.entries(T.lines)) ph.forEach((p) => mi(p.t, `${k}: ${p.plain}`));
    if (ch.sub) mi(T.title + 0.25, 'sub');
    if (T.counter) { mi(T.counter[0], 'counter starts'); mi(T.counter[0] + T.counter[1], 'counter lands'); }
    for (const k of ['note', 'other', 'foot']) if (T[k] != null && (ch[k] || (k === 'note' && ch.type === 'list'))) mi(T[k], k);
    (T.labels || []).forEach((x) => mi(x, 'grid label'));
    (T.grow || []).forEach((x, k) => mi(x, `bar ${k + 1} grows`));
    (T.nums || []).forEach((x, k) => mi(x, `number ${k + 1}`));
    if (T.reveal != null) mi(T.reveal, 'reveal');
    if (T.roulette) T.roulette.hops.forEach((x, k) => mi(x, `roulette hop ${k + 1}`));
    if (T.step) { mi(T.step[0], 'step-wipe front'); }
    // T1: a regroup makes a new composition where its last group lands (the flight is the change, the landed chart
    // the new layout); the title over the old layout before it is the scene's first composition. The closing scene
    // is one composition, the lock-up (its numbers land with the rule): the release after the climax
    if (ch.type !== 'close' && landed - t0 > 0.5 && ch.dur - (landed - t0) > 0.5) shots.push({ t: landed, scene, what: ch.type === 'list' ? 'the list' : ch.type === 'trend' ? 'the trend' : 'the new layout lands' });
    if (T.stream) { mi(T.stream[0], 'the stream runs'); mi(T.stop, 'the stream stops'); }
    if (T.reencode) { mi(T.reencode[0], 're-encode: bars to points'); mi(T.reencode[0] + T.reencode[1] / 2, 're-encode: the curve draws'); }
    T.glints.forEach((x) => mi(x, 'glint'));
    if (T.light != null) mi(T.light, 'closing light');
    // T2
    if (T.entry) expressive.push({ t: T.entry.t0, dur: T.entry.dur, device: T.entry.device, variant: ch.enterFrom ?? (T.entry.kind === 'flip' ? 'top-left' : 'bottom-left'), scene });
    if (T.step) expressive.push({ t: T.step[0], dur: T.step[1], device: 'step-wipe', variant: 'bands → columns', scene });
    // T3
    if (scene === 0) peaks.push({ t: T.counter ? T.counter[0] + T.counter[1] : landed, kind: 'hook', scene });
    if (ch.climax === true && T.reveal != null && ch.type !== 'close') peaks.push({ t: T.reveal, kind: 'reveal', climax: true, scene });
    // a closing scene marked climax: the accent number landing is the climax, the light the lock-up after it
    if (ch.climax === true && ch.type === 'close' && T.nums?.length) peaks.push({ t: T.nums[Math.max(0, (ch.numbers || []).findIndex((x) => x.accent))], kind: 'reveal', climax: true, scene });
    if (scene === laid.length - 1 && T.light != null) peaks.push({ t: T.light, kind: 'lockup', scene });
    // holds: the still windows, from the scene start to the text exit (the closing scene: to the fade)
    const last = ch.type === 'close' || S.closing;
    const motion = motionWindows(ch, S, b, { first: T.first, light: last ? T.light - t0 : null, glints: T.glints.map((x) => x - t0) });
    const to = last ? ch.dur - fadeOut : ch.dur - EXIT * b;
    for (const [a, z] of stillWindows(motion, 0, to)) if (z - a >= 0.2) holds.push({ from: t0 + a, to: t0 + z, scene });
  }
  const byT = (a, c) => a.t - c.t;
  return { keys: keys.sort(byT), holds, handoffs: handoffs.sort(byT), micro: micro.sort(byT), shots, expressive: expressive.sort(byT), peaks: peaks.sort(byT) };
};

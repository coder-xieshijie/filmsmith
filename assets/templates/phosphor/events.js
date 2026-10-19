// events.js — when everything happens inside each scene, computed from content alone (no DOM), so the
// picture (film.js), the sound (score.mjs) and the length (timing.rules.js) read the same times.
//
// Timing API 3 (CONTRACT.md "api 3: the four tiers"; principles 4 and 5, owner-approved 2026-10-19). Entrances
// are timed in beats from the scene's start and paced by reading: a step starts once the step before it has been
// read, never earlier than its choreography allows. Exits are timed in beats before the scene's end. Every state
// carries at most five primary words: a typed line is read in chunks of five words as it types, and every other
// primary item is one state of its own. After a landing the picture holds at most two beats: when the copy is
// read faster than that, the next thing lands; when a scene is laid out longer than it needs (the beat grid, the
// phrase share, the pad before a chapter turn) the slack before its exit gets tail moves (`tails`, below), so it
// never holds still longer than two beats either.
//
// Reading uses the shared reader of lib/timing.js (principle 1, three tiers): primary lines add up in the order
// they are read; a glance line (≤ 6 words, repeated elsewhere or safe to delete) needs 1 s fully still and is
// read alongside; a line slammed word by word holds 0.3 s a word once complete. Each call site below says which
// tier a slot is in; timing.rules.js says why it qualifies. Inside fit() the reader is ctx.reading.
//
// Every TIMING function (s, g, read) returns T with
//   ...event times     seconds from the scene's start
//   done               when the last line has been read and the last landing has held
//   out                seconds of exit choreography after `done` (depends on the exit, see exitsOf)
//   cues               sound cues [t, kind, gain, dur]
//   moves              [from, to] intervals in which something in the content area moves; the gaps between
//                      them are the still holds that steps() and the exported holds report
//   micro              [t, what] T0 changes (every move's start, every five-word chunk of a typed line)
//   shots              [t, what] T1 compositions inside the scene (the page after a chapter card, the collapse)
//   keys               [t, kind] key events (kind: land | stamp | accent | claim | end), each on a beat
//   peaks, expressive, pauses   T3 peaks, T2 devices that belong to the scene, reading pauses [from, to]
// need(s, g, read) = done + out is the scene's need; lib/timing.js fit() turns it into beats.
//
// plan(content, fitted) → { g, laid, chapterCount, cues, total }
import { grid } from './lib/beat.js';
import { reader, DEFAULTS, units } from './lib/timing.js';
import { beatsOf } from './lib/handoffs/index.js';
import RL from './lib/handoffs/roulette-lock.js';
import { merge } from './lib/handoffs/util.js';

export const WORD_SEC = DEFAULTS.wordSec; // primary reading, s per English word (principle 1)
const STATE = DEFAULTS.stateWords; // primary words entering together (api 3)
const HOLD = DEFAULTS.holdMaxBeats; // beats a landing may hold still
const SEEN = 0.25; // an entering line is readable this long after its entrance starts
const LAND = 0.5; // an entrance or a pop has settled this long after it starts

// What is read: symbol-only tokens (· → | // ✓ ▸ =) are not words (the reader skips them), and markup
// brackets are dropped so `{Decoy:} check` reads as two words and `[verified, PR]` as two.
const clean = (s) => String(s ?? '').replace(/[{}[\]]/g, '');
const text = (xs) => [xs].flat(Infinity).filter((x) => x != null && x !== '').map(clean).join(' ').trim();

const clamp = (x, a, z) => Math.min(z, Math.max(a, x));
const words = (s) => String(s || '').split(/\s+/).filter(Boolean);
const half = (t, B) => Math.ceil(t / (B / 2) - 1e-6) * (B / 2); // next half beat
const onBeat = (t, B) => Math.ceil(t / B - 1e-6) * B; // next beat
// Typing speed of a primary line: its base speed, slowed (never below 24 cps) so that it ends no more than 1.6
// beats before it has been read — a typed line is read along as it types, and the picture must not then hold
// longer than two beats before the next step lands.
export const paceCps = (str, base, B) => {
  const len = String(str || '').length, sec = units(clean(str)) * WORD_SEC;
  return clamp(len / Math.max(0.2, sec + SEEN - 1.6 * B), 24, base);
};

// ---------------------------------------------------------------- exits: how one scene hands over to the next
// Every boundary is one of:
//   burst   boot / audit: collapse into the cursor, the fibres, the flash (T2 fibre-burst, the hook)
//   glitch  the glitch cut: jitter, six tear bars, ≤ 0.25 s, then the cut (T2 glitch-cut; 2026-10-19 it counts
//           as an expressive device, so at most three a film, never twice in a row unchanged)
//   crt     the picture collapses as a CRT does when its deflection dies, and the next one powers on (T2
//           crt-collapse, lib/transitions phosphor.js, drawn on the DOM pages, see film.js)
//   morph   the window of a page becomes the window of the page that continues it (T1 container-morph)
//   cut     a straight cut on the beat: the next scene's first element enters on the cut frame
//   slit    horizon-tagline: the slit closes into the line, which the end card turns into its cursor
//   tear    tunnel-tagline (legacy)
// By default the turn into a chapter page (and into install) is an expressive transition, alternating glitch and
// crt; a page that continues the chapter in a window morphs out of the last one; every other boundary is a cut.
// A scene may set `out: 'glitch' | 'crt' | 'cut'` to choose its own exit.
export const WINDOWED = ['qa', 'decide', 'run', 'pick'];
export const CONTINUES = ['decide', 'pick'];
const OUT_BEATS = { glitch: 0.5, crt: 0.75, morph: 0.2, cut: 0, slit: 0.5, tear: 0.6, burst: 4 };
export const CRT = { off: 0.75, on: 0.6 }; // beats of the collapse (outgoing) and the power-on (incoming)
export const MORPH_BEATS = beatsOf('container-morph'); // 1.5: content out 0.133, shape 0.133–0.6, content in 0.6–0.8
const MORPH_IN = 0.6;
// The camera push-in on a page's result (run, pick, decide, compare): scale 1.1 about the result, 0.6 beat expo.out;
// the header and note leave as it starts. A new composition (T1 shot), and the result is made unmistakable by scale.
export const PUSH = { scale: 1.1, dur: 0.6 };
export const SMEAR_BEATS = 0.5; // the exit half of slice-smear (its 1 beat at the library default)
const cache = new WeakMap();
export const exitsOf = (scenes) => {
  if (cache.has(scenes)) return cache.get(scenes);
  let k = 0;
  const out = scenes.map((s, i) => {
    const n = scenes[i + 1];
    if (!n) return 'end';
    if (s.type === 'boot' || s.type === 'audit') return 'burst';
    if (s.type === 'horizon-tagline') return 'slit';
    if (s.type === 'tunnel-tagline') return 'tear';
    if (['glitch', 'crt', 'cut'].includes(s.out)) { if (s.out !== 'cut') k++; return s.out; }
    if (!n.chapter && CONTINUES.includes(n.type) && WINDOWED.includes(s.type)) return 'morph';
    if (n.chapter || n.type === 'install') return k++ % 2 ? 'crt' : 'glitch';
    return 'cut';
  });
  cache.set(scenes, out);
  return out;
};
// the exit of scene i and the beats at the head of scene i that the transition into it still takes
export const linkOf = (scenes, i) => {
  const ex = exitsOf(scenes), into = i > 0 ? ex[i - 1] : null;
  return { exit: ex[i], into, lead: into === 'morph' ? MORPH_BEATS * MORPH_IN - OUT_BEATS.morph : 0 };
};
const outOf = (s, B, fallback) => (s.exit && OUT_BEATS[s.exit] != null && s.exit !== 'burst' ? OUT_BEATS[s.exit] * B : fallback);
// glitch variants: the jitter leans left, then right, then left (a repeat is never unchanged)
const variantOf = (scenes, i, kind) => {
  const ex = exitsOf(scenes);
  const n = ex.slice(0, i).filter((x) => x === kind).length;
  return kind === 'glitch' ? (n % 2 ? 'right' : 'left') : kind === 'crt' ? (n % 2 ? 'collapse to the left of centre' : 'collapse to centre') : undefined;
};

// One scene's reading and motion. `read` is lib/timing.js reader (or fit()'s ctx.reading, which wraps it).
const session = (read) => {
  const list = [], moves = [], micro = [], shots = [], pauses = [];
  let floor = 0;
  const run = () => read(list);
  const self = {
    // primary text readable from `at`; returns when it has been read, after every primary line before it
    primary(at, ...txt) { const x = text(txt); if (!x) return at; list.push({ text: x, tier: 'primary', at }); return run().done; },
    // a claim (≤ 8 words in one state), read in a pause
    claim(at, ...txt) { const x = text(txt); if (!x) return at; list.push({ text: x, tier: 'primary', at, claim: true }); return run().done; },
    // glance text readable from `at`: 1 s fully still, read alongside (more than 6 words → primary, reported)
    glance(at, ...txt) { const x = text(txt); if (x) list.push({ text: x, tier: 'glance', at }); },
    // a line slammed word by word, complete at `at`: then 0.3 s a word
    word(at, ...txt) { const x = text(txt); if (!x) return at; list.push({ text: x, tier: 'word', at }); return run().done; },
    // a line typed from `at` at `cps`, read along as it types in chunks of at most five words (one state each)
    typed(at, str, cps) {
      const s = String(str ?? ''), chunks = [];
      let cur = '', start = 0, n = 0, pos = 0;
      for (const tok of s.split(/(\s+)/)) {
        if (!tok) continue;
        const w = /^\s+$/.test(tok) ? 0 : units(clean(tok));
        if (w && n + w > STATE && cur.trim()) { chunks.push([start, cur]); cur = ''; n = 0; start = pos; }
        cur += tok; n += w; pos += tok.length;
      }
      if (cur.trim()) chunks.push([start, cur]);
      let done = at;
      chunks.forEach(([c, x], k) => { const t = at + c / cps; if (k) micro.push([t, 'next phrase types']); done = self.primary(t + SEEN, x); });
      return done;
    },
    at(t) { floor = Math.max(floor, t); return t; },
    move(t, dur = LAND, what = 'lands') { if (Number.isFinite(t)) { moves.push([t, t + dur]); micro.push([t, what]); } return t; },
    shot(t, what) { if (Number.isFinite(t)) shots.push([t, what]); return t; },
    pause(a, z) { if (Number.isFinite(a) && Number.isFinite(z) && z > a) pauses.push([a, z]); },
    get done() { return Math.max(run().end, floor); },
    get moves() { return moves; },
    get micro() { return micro; },
    get shots() { return shots; },
    get pauses() { return pauses; },
  };
  return self;
};
const finish = (T, rd) => { T.moves = [...rd.moves, ...(T.moves || [])]; T.micro = [...rd.micro, ...(T.micro || [])]; T.shots = [...rd.shots, ...(T.shots || [])]; T.pauses = rd.pauses; return T; };

// Chapter card at the head of a page scene. The title decodes (0.4 s, 0.45 s) and is primary; the card line
// enters at 0.2 beat and is glance (≤ 6 words: it names the chapter's tool, which the page then shows). The
// title flies to the header on the first half beat after it has been read (at least chapter.beats, default 2): no
// glitch before the flight, which is a transformation, not a cut (mode principle 4). The page starts entering
// 0.4 beat into the 0.8-beat flight, so the card hands over to the page without a wait (2026-10-18); the page is
// a new composition (a shot, T1).
const card = (s, B, rd) => {
  const ch = s.chapter;
  if (!ch) return { cb: 0 };
  rd.at(0.34 * B + 0.45);
  rd.primary(0.08 * B + 0.4, ch.title);
  // the card line types (about 0.5 s, 40–120 cps) and is then seen fully still for a second (glance)
  const cardCps = clamp(String(ch.card || '').length / 0.5, 40, 120), cardType = String(ch.card || '').length / cardCps;
  if (ch.card) { rd.glance(0.2 * B + cardType, ch.card); rd.move(0.2 * B, Math.max(0.4, cardType), 'the card line types'); }
  rd.move(0, 0.5, 'chapter title slams');
  const cardRead = rd.done;
  const cb = Math.max((ch.beats ?? 2) * B, half(cardRead, B));
  // a second of glance is more than two beats above 120 BPM: halfway through the hold the chapter number and the
  // card line light (muted → ink), a T0 change that is not new text
  const settled = Math.max(0.34 * B + 0.45, 0.2 * B + Math.max(0.4, cardType));
  const cardLight = cb - settled > 1.8 * B ? settled + (cb - settled) / 2 : null;
  if (cardLight != null) rd.move(cardLight, 0.1, 'the card lights');
  rd.move(cb, 0.8 * B + 0.45, 'title flies to the header'); // flight, page settles
  rd.shot(cb + 0.4 * B, 'the page under the header');
  return { cb, cardRead, cardTitle: 0.08 * B, cardTitle2: 0.34 * B, cardSub: 0.2 * B, cardCps, cardLight, flight: cb, flightDur: 0.8 * B };
};
const cardCues = (T, B) =>
  T.cb > 0
    ? [[0, 'stamp', 0.8], [T.flight, 'whoosh', 0.6]]
    : [[0.1 * B, 'whoosh', 0.4]];
// Page start (0.4 beat into the card's flight, or after the window morph into the page) and the page note under
// the header (glance: ≤ 6 words, a caption the page reads without).
const page = (s, B, T, rd) => {
  const L = (s.lead ?? 0) * B;
  const P = T.cb ? T.cb + 0.4 * B : L;
  const at = T.cb ? T.cb + 0.45 * B : Math.max(0.3 * B, L);
  if (s.note && !(s.continues && s.continues.note === s.note)) { rd.glance(at + SEEN, s.note); rd.move(at, 0.35, 'note'); }
  if (s.musicRest) T.musicRest = Math.max(s.musicRest * B, T.cb); // the music breaks under the whole card
  T.page = P;
  return P;
};
// The exit of a page: its choreography after `done` and its sound
const exitCues = (s, T, D, B) => {
  if (s.exit === 'glitch') return [[D - T.out, 'glitch', 0.6]];
  if (s.exit === 'crt') return [[D - T.out, 'crtOff', 0.7, T.out]];
  if (s.exit === 'morph') return [[D - T.out, 'morph', 0.5]];
  return [];
};

const TIMING = {
  // ---------------------------------------------------------------- openings
  boot(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const T = { cursor: 0, line1: 0.25 * B, cps1: 40, out: 4 * B };
    const prompt = String(s.prompt || ''), question = String(s.question || '');
    const p1 = prompt.length / T.cps1;
    rd.move(T.line1, p1, 'the prompt types');
    const promptRead = Math.max(T.line1 + p1, rd.typed(T.line1, prompt, T.cps1)); // read along as it types
    T.line2 = half(Math.max(1.5 * B, promptRead), B);
    rd.shot(T.line2, 'the prompt rises; the hook types under it');
    T.cps2 = clamp(question.length / (1.4 * B), 20, 60);
    const q2 = question.length / T.cps2;
    rd.move(T.line2, q2, 'the hook types');
    T.stress = onBeat(T.line2 + q2 + 0.25 * B, B); // the key word grows on a beat (key: accent; the hook)
    rd.move(T.stress, 0.45, 'the key word grows');
    const qRead = Math.max(T.line2 + q2, rd.typed(T.line2, question, T.cps2));
    rd.at(T.stress + 0.5 * B);
    const probs = (s.problems || []).slice(0, 4);
    // the tags land one after another as the one before has nearly been read (primary, one state per tag)
    let at = half(Math.max(T.stress + 0.5 * B, qRead - SEEN), B);
    T.problems = probs.map((p) => {
      const t = rd.move(at, 0.3, 'problem tag');
      at = half(Math.max(t + 0.5 * B, rd.primary(t + SEEN, p) - SEEN - 0.5 * B), B);
      return t;
    });
    if (probs.length) rd.at(T.problems[probs.length - 1] + 0.3);
    T.done = rd.done;
    // the burst lasts two beats (T2 ≤ 2 beats; it was 2.2 before 2026-10-19)
    Object.assign(T, { collapse: D - 4 * B, collapseDur: 1.5 * B, point: D - 2.5 * B, burst: [D - 2 * B, D], flash: D - 0.045 });
    rd.shot(T.collapse, 'everything is pulled into the cursor');
    T.cues = [
      [T.line1, 'type', 0.5, p1],
      [T.line2, 'type', 0.7, q2],
      [T.stress, 'stamp', 1],
      ...T.problems.map((t) => [t, 'pop', 0.7]),
      [T.collapse, 'rise', 0.9, D - T.collapse],
      [T.burst[0], 'rush', 0.8, T.burst[1] - T.burst[0]],
      [T.flash, 'impact', 1],
    ];
    T.keys = [[T.stress, 'accent'], [T.flash, 'accent']];
    T.peaks = [[T.stress, 'hook']];
    T.expressive = [[T.burst[0], 2 * B, 'fibre-burst', 'the cursor\'s point of light']];
    T.moves = [[T.collapse, D]];
    T.micro = [[T.point, 'the cursor becomes a point'], [T.burst[0], 'the fibres converge']];
    return finish(T, rd);
  },
  audit(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const rows = (s.rows || []).slice(0, 4), n = rows.length;
    const T = { cmd: 0.5 * B, cps: 32, fixCps: 58, out: 2 * B };
    const cmdDur = String(s.command || '').length / T.cps;
    rd.move(T.cmd, cmdDur, 'the audit command types');
    rd.glance(T.cmd + cmdDur, s.command); // glance: the command echoes the rows it lists
    T.rows = rows.map((_, i) => rd.move(Math.max(2 * B, T.cmd + cmdDur) + i * B, 0.45, 'row'));
    rows.forEach((r, i) => rd.primary(T.rows[i] + SEEN, r.word, r.bad)); // primary, one state per row
    const rowsRead = n ? Math.max(T.rows[n - 1] + 0.45, rd.done) : 2 * B;
    T.fixCmd = half(Math.max(T.cmd + cmdDur + 1, rowsRead - SEEN), B);
    const fixDur = String(s.fix || '').length / T.fixCps;
    rd.move(T.fixCmd, fixDur, 'the fix types');
    rd.glance(T.fixCmd + fixDur, s.fix);
    const f0 = half(T.fixCmd + fixDur + 0.5 * B, B);
    T.flips = rows.map((_, i) => rd.move(f0 + i * 0.5 * B, 0.4, 'row flips'));
    rows.forEach((r, i) => rd.primary(T.flips[i] + SEEN, r.word, r.good));
    if (n) rd.at(T.flips[n - 1] + 0.3);
    T.done = rd.done;
    Object.assign(T, { burst: [D - 2 * B, D], flash: D - 0.045 });
    rd.shot(T.burst[0], 'the fibre burst');
    T.cues = [
      [T.cmd, 'type', 0.5, cmdDur],
      ...T.rows.map((t) => [t, 'pop', 0.8]),
      [T.fixCmd, 'type', 0.5, fixDur],
      ...T.flips.map((t) => [t, 'tick', 0.9]),
      [T.burst[0], 'rush', 0.8, T.burst[1] - T.burst[0]],
      [T.flash, 'impact', 1],
    ];
    T.keys = [[T.flash, 'accent']];
    T.peaks = n ? [[T.flips[0], 'hook']] : [];
    T.expressive = [[T.burst[0], 2 * B, 'fibre-burst', 'the audit rows']];
    T.moves = [[T.burst[0], D]];
    return finish(T, rd);
  },
  // ---------------------------------------------------------------- hero
  hero(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const T = { grow: 0, line1: 0.27 * B, out: outOf(s, B, 0) };
    if (s.exit === 'glitch') T.out = 0.64 * B;
    rd.move(0, 0.9, 'the horizon draws out of the point'); rd.move(T.line1, 0.75, 'the claim decodes');
    const read1 = rd.primary(T.line1 + 0.55, s.lines?.[0]); // primary: the claim, one state a line
    T.line2 = Math.max(1.12 * B, read1 - 0.6); // the second line lands (0.6 s decode) as the first has been read
    rd.move(T.line2, 0.6, 'its second line decodes');
    const claim = Math.max(T.line2 + 0.6, rd.primary(T.line2 + 0.6, s.lines?.[1]));
    T.sub = Math.max(2 * B, claim - SEEN); // as soon as the claim has been read (not snapped: only key events sit on the beat)
    rd.move(T.sub, 0.5, 'the sub');
    rd.primary(T.sub + SEEN, s.sub); // primary: the sub, ≤ 5 words, read after the claim
    T.facts = (s.facts || []).slice(0, 3).map((f, i) => { const t = rd.move(T.sub + 0.5 * B + i * 0.5 * B, 0.3, 'fact'); rd.glance(t + SEEN, f); return t; }); // glance: each fact ≤ 6 words, the film reads without them
    T.done = rd.done;
    Object.assign(T, { exit: D - T.out, flash: D - 0.05 });
    T.cues = [[0, 'stamp', 0.6], [T.line1, 'glitch', 0.4], [T.line2, 'glitch', 0.4], [T.sub, 'tick', 0.4], ...T.facts.map((t) => [t, 'tick', 0.5]), ...exitCues(s, T, D, B), ...(s.exit === 'glitch' ? [[T.flash, 'flash', 0.6]] : [])];
    T.keys = [[0, 'claim']];
    return finish(T, rd);
  },
  // ---------------------------------------------------------------- chapter pages
  // Questions, at most two: each types at reading pace, its options pop in once it has been read, one option is
  // picked on a beat; the next question starts once this one and its options have been read. The decisions and
  // the confirmation are the next scene (`decide`).
  qa(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    const qs = (s.questions || []).slice(0, 2);
    T.win = rd.move(P, 0.45, 'the window');
    (s.window || []).forEach((x) => rd.glance(T.win + SEEN, x)); // glance: window title and right label, each ≤ 6 words, the page reads without them
    let t = half(P + 0.35 * B, B);
    T.q = qs.map((q) => {
      const a = t, cps = paceCps(q.q, 48, B), end = a + 0.05 + q.q.length / cps;
      rd.move(a, end - a, 'the question types');
      const qRead = rd.typed(a + 0.05, q.q, cps); // primary: the question, ≤ 5 words
      const o0 = half(Math.max(end + 0.25 * B, qRead - SEEN), B);
      const opts = (q.options || []).map((_, k) => rd.move(o0 + k * 0.25 * B, 0.25, 'option'));
      const oRead = rd.primary(o0 + SEEN, q.options); // primary: its options, ≤ 4 words together
      const pick = onBeat(Math.max(opts[opts.length - 1] + 0.25 + 0.25 * B, oRead - 1.25 * B), B); // the pick lands on a beat (key: land)
      rd.move(pick, 0.5 * B, 'the pick pushes in');
      t = half(Math.max(pick + 0.5 * B, oRead), B);
      return { t: a, cps, end, opts, pick };
    });
    if (T.q.length) rd.at(T.q[T.q.length - 1].pick + 0.5 * B); // the last pick settles
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    T.exit = D - T.out;
    T.cues = [
      ...cardCues(T, B),
      ...T.q.flatMap((q) => [[q.t, 'type', 0.45, q.end - q.t], ...q.opts.map((x) => [x, 'tick', 0.35]), [q.pick, 'pop', 0.8]]),
      ...exitCues(s, T, D, B),
    ];
    T.keys = T.q.map((q) => [q.pick, 'land']);
    return finish(T, rd);
  },
  // The chapter's decision summary, then one confirmation. No card: the page header stays where the previous page
  // left it, and after a windowed page the window morphs into this one. Decisions land every half beat; the
  // confirmation lands once they have been read, on a beat, and its tick stamps a beat later.
  decide(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = { cb: 0 };
    const L = (s.lead ?? 0) * B;
    if (s.lead) { T.morph = -OUT_BEATS.morph * B; rd.move(0, L, 'the window reshapes'); }
    if (s.note) { rd.glance(Math.max(0.3 * B, L) + SEEN, s.note); rd.move(Math.max(0.3 * B, L), 0.35, 'note'); } // glance, as on every page
    T.win = rd.move(L + 0.1 * B, 0.45, 'the window');
    rd.glance(T.win + SEEN, s.summary); // glance: window title
    const decs = (s.decisions || []).slice(0, 4);
    const d0 = half(L + 0.5 * B, B);
    let next = d0;
    T.decs = decs.map((d) => {
      const t = rd.move(next, 0.35, 'decision');
      // glance: a decision that restates a pick from the questions page (≤ 6 words); a decision the tool
      // found on its own (`found`) is new, so primary, and the next decision lands once it has been read
      if (d.found) next = half(Math.max(t + 0.5 * B, rd.primary(t + SEEN, d.text, d.found) - 1.5 * B), B);
      else { rd.glance(t + SEEN, d.text); next = t + 0.5 * B; }
      return t;
    });
    T.strip = rd.move(d0 + 0.5 * B, 0.4, 'strip');
    (s.strip || []).forEach((x) => rd.glance(T.strip + SEEN, x)); // glance: each strip item ≤ 6 words, safe to delete
    const last = T.decs.length ? T.decs[T.decs.length - 1] : d0;
    T.confirm = onBeat(Math.max(last + 0.5 * B, rd.done - 1.5 * B), B);
    rd.move(T.confirm, 0.35, 'the confirmation');
    T.check = T.confirm + B; // key: stamp
    rd.move(T.check, 0.3, 'its check');
    if (s.confirm) { T.push = T.check; rd.move(T.push, PUSH.dur * B, 'the camera pushes in on the confirmation'); rd.shot(T.push, 'the confirmation, close'); }
    if (s.confirm) { rd.primary(T.confirm + SEEN, s.confirm); rd.at(T.check + 0.5 * B); }
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    T.exit = D - T.out;
    T.cues = [
      ...(s.lead ? [] : [[0.1 * B, 'whoosh', 0.3]]),
      ...T.decs.map((x, i) => [x, decs[i].found ? 'pop' : 'tick', decs[i].found ? 0.7 : 0.6]),
      ...(s.confirm ? [[T.confirm, 'tick', 0.5], [T.check, 'stamp', 1]] : []),
      ...exitCues(s, T, D, B),
    ];
    T.keys = s.confirm ? [[T.check, 'stamp']] : [];
    return finish(T, rd);
  },
  // Two documents land; the second checker sweeps and flags gaps (one per beat, each read in turn); a gap is fixed;
  // the freeze terminal enters under the windows (a new composition) while the fix note is still read, the command
  // types, the hashes resolve, both files lock on a beat, the result lands.
  freeze(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    const docs = (s.docs || []).slice(0, 2), gaps = (s.gaps || []).slice(0, 2);
    T.wins = [P, P + 0.2 * B];
    T.lines = [(i) => P + 0.3 * B + i * 0.18 * B, (i) => P + 0.5 * B + i * 0.18 * B];
    // glance: window names and document lines (each ≤ 6 words; the page is about the flags, not every
    // line), but every line must have been seen before the fix moves the rows below an addition
    const docsRead = session(read);
    docs.forEach((d, di) => {
      rd.move(T.wins[di], 0.4, 'document window');
      rd.glance(T.wins[di] + SEEN, d.name, d.label);
      d.lines.forEach((l, i) => { rd.move(T.lines[di](i), 0.18, 'document line'); docsRead.glance(T.lines[di](i) + SEEN, l); });
    });
    T.scan = P + 1.5 * B; T.scanDur = 1.2 * B;
    rd.move(T.scan, T.scanDur, 'the second checker sweeps');
    T.flags = gaps.map((_, i) => rd.move(T.scan + 0.5 * B + i * B, 0.3, 'gap flag'));
    gaps.forEach((gp, i) => rd.primary(T.flags[i] + SEEN, gp.flag)); // primary, one state per flag
    const nf = gaps.length, lastFlag = nf ? T.flags[nf - 1] : T.scan;
    const flagsRead = nf ? Math.max(lastFlag + 0.3, rd.done) : T.scan + T.scanDur;
    T.resolve = half(Math.max(flagsRead - 0.5 * B, lastFlag + B, docsRead.done), B);
    rd.move(T.resolve, 0.3, 'the gap is fixed');
    const fixes = gaps.filter((gp) => gp.add);
    fixes.forEach((gp) => rd.glance(T.resolve + 0.05 + SEEN, gp.add)); // glance: the added line (the fix note says it)
    const fixRead = fixes.length ? rd.primary(T.resolve + 0.05 + SEEN, fixes.map((gp) => gp.fix)) : T.resolve; // primary
    T.noteOut = Math.max(T.resolve + 0.05 + 1.2 * B, fixRead);
    T.term = half(T.resolve + 0.5 * B, B); // enters below the windows while the fix note is still read
    rd.shot(T.term, 'the freeze terminal under the windows');
    T.cmd = T.term + 0.1 * B;
    T.cps = 120;
    const cmdDur = String(s.command || '').length / T.cps;
    rd.move(T.term, 0.3, 'the terminal'); rd.move(T.cmd, cmdDur, 'the command types');
    rd.glance(T.cmd + cmdDur, s.command); // glance: ≤ 6 words, the hashes below say what it did
    const o0 = half(T.cmd + cmdDur + 0.1 * B, B);
    T.resolveDur = 0.5 * B; // each hash resolves left to right (scramble-resolve, hex alphabet)
    T.outs = (s.output || []).slice(0, 2).map((o, i) => { const x = rd.move(o0 + i * 0.25 * B, T.resolveDur, 'hash resolves'); rd.glance(x + T.resolveDur, o.key, o.value ?? 'sha256'); return x; }); // glance
    T.lock = onBeat((T.outs.length ? T.outs[T.outs.length - 1] : o0) + T.resolveDur, B); // key: stamp
    rd.move(T.lock, 0.45, 'both files lock');
    T.result = T.lock; // the result lands with the lock: one stamp
    if (s.lock) rd.glance(T.lock + SEEN, s.lock); // glance: the lock badge repeats what the result says
    rd.primary(T.result + SEEN, s.result); // primary
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    T.exit = D - T.out;
    T.cues = [
      ...cardCues(T, B),
      [T.scan, 'rise', 0.35, T.scanDur], ...T.flags.map((t) => [t, 'pop', 0.8]), [T.resolve, 'tick', 0.8],
      [T.cmd, 'type', 0.45, cmdDur], ...T.outs.map((t) => [t, 'tick', 0.5]),
      [T.lock, 'stamp', 1.1], ...exitCues(s, T, D, B),
    ];
    T.keys = [[T.lock, 'stamp']];
    return finish(T, rd);
  },
  // Inputs → one hub → outputs land and are read by name; then each output lights in turn (on a beat) and its
  // checks tick; the next output lights once the previous checks have been read.
  flow(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    const ins = (s.inputs || []).slice(0, 3), outs = (s.outputs || []).slice(0, 3), checks = (s.checks || []).slice(0, 5);
    const nout = outs.length;
    T.cmd = rd.move(P + 0.1 * B, 0.35, 'the command');
    rd.glance(T.cmd + SEEN, s.command); // glance: ≤ 6 words, the hub repeats what runs
    T.inputs = ins.map((d, i) => { const t = rd.move(P + 0.2 * B + i * 0.26 * B, 0.35, 'input'); rd.glance(t + SEEN, d[1]); return t; }); // glance: node subs
    T.hub = rd.move(P + 0.85 * B, 0.45, 'the hub');
    rd.glance(T.hub + SEEN, s.hub?.[0]); rd.glance(T.hub + SEEN, s.hub?.[2]); // glance: hub label and sub
    T.outputs = outs.map((d, i) => { const t = rd.move(P + 1.4 * B + i * 0.26 * B, 0.35, 'output'); rd.glance(t + SEEN, d[1]); return t; });
    // primary: the node names, left to right, one state per node
    ins.forEach((d, i) => rd.primary(T.inputs[i] + SEEN, d[0]));
    rd.primary(T.hub + SEEN, s.hub?.[1]);
    outs.forEach((d, i) => rd.primary(T.outputs[i] + SEEN, d[0]));
    const names = rd.done;
    T.drawIn = ins.map((_, i) => P + 0.75 * B + i * 0.17 * B);
    T.drawOut = outs.map((_, i) => P + 1.6 * B + i * 0.17 * B);
    rd.move(P + 0.75 * B, 1.4 * B, 'connectors draw');
    T.checksIn = checks.map((_, i) => rd.move(P + 1.9 * B + i * 0.21 * B, 0.3, 'check'));
    T.strip = rd.move(P + 2.2 * B, 0.4, 'strip');
    (s.strip || []).forEach((x) => rd.glance(T.strip + SEEN, x)); // glance: each strip item ≤ 6 words, safe to delete
    T.travelIn = ins.map((_, i) => P + 2.1 * B + i * 0.21 * B);
    T.travelDur = B;
    rd.move(T.travelIn[0] ?? P, (T.travelIn.length ? T.travelIn[T.travelIn.length - 1] - T.travelIn[0] : 0) + B, 'dots travel in');
    T.travelOut = []; T.light = [];
    T.ticks = checks.map(() => 0);
    let t = onBeat(Math.max(P + 2.5 * B, names - 2 * B), B);
    for (let o = 0; o < nout; o++) {
      T.travelOut.push(t);
      const light = t + T.travelDur; // on a beat (key: stamp)
      T.light.push(light);
      rd.move(t, T.travelDur + 0.15, 'a dot travels out; the output lights');
      const mine = checks.map((c, i) => [c, i]).filter(([c]) => clamp(c[1], 0, nout - 1) === o);
      mine.forEach(([, i], n) => (T.ticks[i] = rd.move(light + 0.5 * B + n * 0.5 * B, 0.1, 'check ticks')));
      // primary: this output's check labels, one state per check, after everything read before them
      mine.forEach(([c, i]) => rd.primary(T.ticks[i], c[0]));
      const done = mine.length ? Math.max(T.ticks[mine[mine.length - 1][1]] + 0.3, rd.done) : light + 0.5 * B;
      t = onBeat(Math.max(t + B, done - T.travelDur - 0.5 * B), B);
    }
    T.pulse = P + 1.9 * B;
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    if (s.exit === 'glitch') T.out = 0.6 * B;
    T.exit = D - T.out;
    T.flash = D - 0.05;
    T.cues = [...cardCues(T, B), [T.cmd, 'tick', 0.5], [T.hub, 'pop', 0.7], ...T.light.map((x) => [x, 'stamp', 0.8]), ...T.ticks.map((x) => [x, 'tick', 0.6]), ...exitCues(s, T, D, B), ...(s.exit === 'glitch' ? [[T.flash, 'flash', 0.5]] : [])];
    T.keys = T.light.map((x) => [x, 'stamp']);
    return finish(T, rd);
  },
  // Two parties and the shared ruler land and are read by name; the counter steps to N, its last step on a
  // beat; the meta line lands. Under it a ticker repeats the counted items with the verdict.
  compare(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    const L = s.left || {}, Rt = s.right || {}, M = s.middle || {};
    T.left = P; T.right = P + 0.32 * B; T.middle = P + 0.96 * B; T.links = P + 1.4 * B; T.pulse = P + 2.4 * B;
    rd.move(T.left, 0.4, 'left party'); rd.move(T.right, 0.4, 'right party'); rd.move(T.middle, 0.35, 'shared ruler'); rd.move(T.links, 0.2, 'links');
    // glance: the three labels, descriptions and list items (≤ 6 words each; the names say who is who)
    [[T.left, L], [T.right, Rt], [T.middle, M]].forEach(([t, c]) => { rd.glance(t + SEEN, c.label); rd.glance(t + SEEN, c.desc); });
    (L.items || []).slice(0, 3).forEach((x) => rd.glance(T.left + SEEN, x));
    (Rt.items || []).slice(0, 3).forEach((x) => rd.glance(T.right + SEEN, x));
    // primary: the three names, left, right, middle, one state each
    rd.primary(T.left + SEEN, L.name); rd.primary(T.right + SEEN, Rt.name);
    const cards = Math.max(T.middle + SEEN, rd.primary(T.middle + SEEN, M.name));
    const n = (s.counter?.items || []).length;
    let c0 = half(Math.max(P + 2 * B, cards - 1.5 * B), B);
    const lastAt = c0 + 0.5 * B * n;
    if (Math.abs(lastAt / B - Math.round(lastAt / B)) > 1e-6) c0 += 0.5 * B; // the last step lands on a beat
    T.counter = rd.move(c0, 0.3, 'the counter');
    T.steps = [...Array(n)].map((_, i) => T.counter + 0.5 * B + i * 0.5 * B);
    const last = n ? T.steps[n - 1] : T.counter;
    T.steps.forEach((x) => rd.move(x, 0.1, 'count step'));
    rd.at(last + 0.5 * B);
    if (n) { T.push = last; rd.move(T.push, PUSH.dur * B, 'the camera pushes in on the count'); rd.shot(T.push, 'the count, close'); }
    rd.primary(T.counter + SEEN, String(n), s.counter?.label); // primary: N and its label (≤ 4 words)
    T.ticker = rd.move(T.counter + 1.2 * B, 0.3, 'ticker'); // scrolls the counted items: repeated content, not read
    T.meta = rd.move(half(Math.max(last + 0.5 * B, rd.done - 1.5 * B), B), 0.35, 'meta');
    (s.meta || []).forEach((m) => rd.primary(T.meta + SEEN, m)); // primary, ≤ 5 words each
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    if (s.exit === 'glitch') T.out = 0.6 * B;
    T.exit = D - T.out; T.flash = D - 0.05;
    T.cues = [...cardCues(T, B), [T.middle, 'pop', 0.6], ...T.steps.map((x, i) => [x, 'count', 0.5 + (0.5 * i) / Math.max(1, n - 1)]), [last, 'stamp', 0.9], ...(s.meta ? [[T.meta, 'tick', 0.5]] : []), ...exitCues(s, T, D, B), ...(s.exit === 'glitch' ? [[T.flash, 'flash', 0.5]] : [])];
    T.keys = n ? [[last, 'stamp']] : [];
    return finish(T, rd);
  },
  // ---------------------------------------------------------------- the three batch 4 pages (2026-10-19)
  // run: a log stream of the tool's own runs races past in a terminal window, brakes exponentially and stops with
  // the key line exactly in the reading band, which locks (lib/handoffs stream-brake, T1); the camera pushes in on
  // the band as it locks (a new composition, T1). The key line is primary (≤ 5 words); the stream before it is not
  // read (it repeats one line shape: the marquee condition); the lines after it are glance.
  run(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    T.win = rd.move(P, 0.45, 'the window');
    (s.window || []).forEach((x) => rd.glance(T.win + SEEN, x)); // glance: window title (the command that runs) and its right label
    T.streamDur = (s.beats ?? beatsOf('stream-brake')) * B;
    // the key line stops in the band on a beat (key: land)
    T.brake = onBeat(half(P + 0.5 * B, B) + 0.8 * T.streamDur, B);
    T.stream = T.brake - 0.8 * T.streamDur;
    rd.move(T.stream, 0.8 * T.streamDur, 'the stream runs and brakes');
    rd.move(T.brake, 0.2 * T.streamDur, 'the band locks');
    T.push = T.brake; rd.move(T.push, PUSH.dur * B, 'the camera pushes in on the band');
    rd.shot(T.push, 'the locked line, close');
    const keyRead = rd.primary(T.brake + PUSH.dur * B * 0.6, [s.key?.mark, s.key?.text]); // primary: the key line, ≤ 5 words
    T.after = (s.after || []).length ? rd.move(T.brake + 1.5 * B, 0.3, 'the line after it') : null;
    if (T.after != null) (s.after || []).forEach((x) => rd.glance(T.after + SEEN, x)); // glance: what the tool did with it
    rd.at(keyRead);
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    // before a window morph the log's lines smear off first (lib/transitions slice-smear, X20, its exit half: bands
    // one mono line high slide off right with their streaks, 0.5 beat), so the window reshapes empty
    T.smear = s.exit === 'morph' ? SMEAR_BEATS * B : 0;
    T.out += T.smear;
    T.exit = D - T.out;
    T.cues = [...cardCues(T, B), [T.stream, 'rush', 0.5, 0.8 * T.streamDur], [T.brake, 'stamp', 0.9], ...(T.after != null ? [[T.after, 'tick', 0.4]] : []),
      ...(T.smear ? [[T.exit, 'smear', 0.6, T.smear], [D - OUT_BEATS.morph * B, 'morph', 0.5]] : exitCues(s, T, D, B))];
    if (T.smear) T.micro = [[T.exit, 'the lines smear off']];
    T.keys = [[T.brake, 'land']];
    T.handoffs = [T.brake];
    return finish(T, rd);
  },
  // pick: the tool tries each candidate in turn; a frame jumps one per half beat (laps the row `laps` times), slows
  // for the last two jumps and locks on the answer; the others step back (lib/handoffs roulette-lock, T1), and the
  // camera pushes in on the answer as the result resolves under it. Each jump is a T0 change. The question is
  // primary (≤ 5 words, typed); the candidates are labels the frame visits (glance, one or two words each); the
  // result is primary (≤ 5 words) and resolves left to right.
  pick(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    T.win = rd.move(P, 0.45, 'the window');
    (s.window || []).forEach((x) => rd.glance(T.win + SEEN, x)); // glance: window title and its right label
    const q = String(s.question || '');
    T.q = half(P + 0.2 * B, B);
    T.cps = paceCps(q, 48, B);
    T.qEnd = T.q + q.length / T.cps;
    rd.move(T.q, T.qEnd - T.q, 'the question types');
    const qRead = rd.typed(T.q, q, T.cps); // primary: the question
    const cands = (s.candidates || []).slice(0, 8);
    T.cells = cands.map((c, i) => { const t = rd.move(half(T.qEnd, B) + i * 0.125 * B, 0.3, 'candidate'); rd.glance(t + SEEN, c); return t; }); // glance: labels the frame visits
    const R = roulette(s);
    T.hopBeats = R.hops.map((h) => h.b);
    T.hopCells = R.hops.map((h) => h.cell);
    T.lockBeats = R.lock;
    T.settle = R.settle * B;
    // the frame starts as the question has been read; the lock lands on a beat (key: land)
    const start = Math.max((T.cells[T.cells.length - 1] ?? T.qEnd) + 0.3 + 0.25 * B, qRead - SEEN);
    T.lock = onBeat(start + T.lockBeats * B, B);
    T.roulette = T.lock - T.lockBeats * B;
    T.hops = T.hopBeats.map((b) => T.roulette + b * B);
    T.hops.forEach((x) => rd.move(x, 0.12, 'the frame jumps'));
    rd.move(T.lock, T.settle, 'the others step back');
    T.push = T.lock; rd.move(T.push, PUSH.dur * B, 'the camera pushes in on the answer');
    rd.shot(T.push, 'the answer, close');
    T.result = s.result ? rd.move(half(T.lock + 0.5 * B, B), 0.5 * B, 'the result resolves') : null;
    if (s.result) rd.primary(T.result + 0.5 * B, s.result); // primary: ≤ 5 words
    rd.at(T.lock + T.settle);
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    T.exit = D - T.out;
    T.cues = [...cardCues(T, B), [T.q, 'type', 0.45, T.qEnd - T.q], ...T.cells.map((x) => [x, 'tick', 0.3]), ...T.hops.slice(0, -1).map((x, i) => [x, 'count', 0.5 + (0.5 * i) / Math.max(1, T.hops.length - 1)]), [T.lock, 'stamp', 1], ...(T.result != null ? [[T.result, 'type', 0.4, 0.5 * B]] : []), ...exitCues(s, T, D, B)];
    T.keys = [[T.lock, 'land']];
    return finish(T, rd);
  },
  // scope: the measure on a phosphor screen. The old reading decodes and is read while the beam sweeps the old trace
  // under it (a time base: constant speed), each failed run a spike as the beam passes it; then the picture is no
  // longer refreshed and fades as phosphor afterglow while the beam draws the new trace and the new reading lands
  // bright and settles (lib/handoffs beam-trace, 1.5 beats: the old picture falls to 10 % in about 0.18 s at 128
  // BPM, the order of a long-persistence phosphor such as P39, 150 ms to 10 %). The new reading is read in a pause.
  scope(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), T = card(s, B, rd);
    const P = page(s, B, T, rd);
    const runs = Math.max(1, s.runs ?? 50);
    T.win = rd.move(P, 0.45, 'the screen');
    (s.window || []).forEach((x) => rd.glance(T.win + SEEN, x)); // glance: window title and its right label
    T.oldReading = rd.move(half(P + 0.25 * B, B), 0.45, 'the old reading decodes');
    const oldRead = rd.primary(T.oldReading + 0.45, s.from?.label); // primary: ≤ 5 words
    T.sweep = T.oldReading + 0.5 * B;
    T.beam = onBeat(Math.max(T.sweep + 1.5 * B, oldRead - 0.25 * B), B);
    T.sweepDur = T.beam - 0.25 * B - T.sweep; // the time base: the old trace is drawn at constant speed
    rd.move(T.sweep, T.sweepDur, 'the beam sweeps the old trace');
    T.spikes = (s.from?.failed || []).filter((r) => r >= 1 && r <= runs).map((r) => T.sweep + (T.sweepDur * (r - 0.5)) / runs);
    T.spikes.forEach((x) => rd.move(x, 0.1, 'a failed run spikes'));
    T.beamDur = (s.beats ?? 1.5) * B;
    rd.move(T.beam, T.beamDur, 'afterglow; the beam draws the new trace');
    T.land = T.beam + 0.8 * T.beamDur; // the new reading lands (the reveal)
    const newRead = rd.claim(T.land + 0.1, s.to?.label); // primary, read in a pause (≤ 8 words)
    rd.at(newRead + 0.2);
    T.done = rd.done;
    rd.pause(T.beam + T.beamDur, T.done);
    T.out = outOf(s, B, 0);
    T.exit = D - T.out;
    T.cues = [...cardCues(T, B), [T.oldReading, 'glitch', 0.3], [T.sweep, 'sweep', 0.35, T.sweepDur], ...T.spikes.map((x) => [x, 'pop', 0.6]), [T.beam, 'whoosh', 0.5], [T.beam + 0.3 * T.beamDur, 'sweep', 0.6, 0.48 * T.beamDur], [T.land, 'impact', 0.7], ...exitCues(s, T, D, B)];
    T.keys = [[T.beam, 'land']];
    T.handoffs = [T.beam + T.beamDur];
    T.reveal = T.land;
    return finish(T, rd);
  },
  // ---------------------------------------------------------------- closing chain
  ends(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const nodes = (s.nodes || []).slice(0, 6), n = nodes.length;
    const T = { title1: 0.17 * B, title2: 0.8 * B, sub: 1.5 * B };
    rd.move(T.title1, 0.5, 'the title decodes'); rd.move(T.title2, 0.45, 'its second half decodes');
    rd.at(T.title2 + 0.45);
    const titleRead = rd.primary(T.title1 + 0.4, s.title); // primary, ≤ 5 words
    rd.move(T.sub, 0.35, 'sub');
    rd.glance(T.sub + SEEN, s.sub); // glance: ≤ 6 words, the nodes say it
    const n0 = half(Math.max(1.2 * B, titleRead - SEEN), B); // the nodes enter as the title finishes being read
    T.nodes = nodes.map((d, i) => { const t = rd.move(n0 + i * 0.5 * B, 0.3, 'node'); rd.glance(t + SEEN, d.tag); rd.glance(t + SEEN, d.sub); return t; }); // glance: tags, subs
    nodes.forEach((d, i) => rd.primary(T.nodes[i] + SEEN, d.name)); // primary: names, one state each
    const named = n ? Math.max(T.nodes[n - 1] + 0.3, rd.done) : n0;
    T.links = rd.move(n0 + B, 0.4, 'links');
    T.bracket = rd.move(half(Math.max(n0 + 2 * B, named - B), B), 0.35, 'bracket');
    rd.glance(T.bracket + SEEN, s.bracket); // glance: ≤ 6 words
    T.glow = T.bracket + B;
    T.loop = rd.move(T.bracket + 0.5 * B, 0.3, 'loop'); T.loopLab = rd.move(T.loop, 0.35, 'loop label'); T.dot = T.loop + 0.5 * B; T.dotDur = 2 * B;
    rd.glance(T.loopLab + SEEN, s.loop); // glance: ≤ 6 words
    rd.at(T.dot + T.dotDur); // the dot completes one loop
    rd.move(T.dot, T.dotDur, 'a dot loops back');
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    if (s.exit === 'glitch') T.out = 0.53 * B;
    T.exit = D - T.out;
    T.cues = [[T.title1, 'glitch', 0.4], ...T.nodes.map((t, i) => [t, i === 0 || i === n - 1 ? 'stamp' : 'tick', i === 0 || i === n - 1 ? 0.7 : 0.5]), [T.loop, 'whoosh', 0.35], ...exitCues(s, T, D, B)];
    T.keys = [];
    return finish(T, rd);
  },
  // Title, then the install commands typed under a musical break; the steps land one per beat as soon as the
  // commands are read; the music drops on the first bar line among them.
  install(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), bar = B * (g.beatsPerBar ?? 4);
    const T = { title1: 0.1 * B, title2: 0.6 * B, term: 0.43 * B, cps: 90 };
    rd.move(T.title1, 0.5, 'the title decodes'); rd.move(T.title2, 0.45, 'its second half'); rd.move(T.term, 0.35, 'the terminal');
    rd.at(T.title2 + 0.45);
    const titleRead = rd.primary(T.title1 + 0.4, s.title); // primary, ≤ 3 words
    rd.glance(T.term + SEEN, s.window); // glance: window title
    let t = half(Math.max(0.9 * B, titleRead - SEEN), B); // the commands type once the title has been read
    T.cmds = (s.commands || []).slice(0, 2).map((c) => {
      const a = t, cps = paceCps(c, T.cps, B), dur = c.length / cps;
      rd.move(a, dur, 'a command types');
      rd.at(a + dur);
      const read = rd.typed(a, c, cps); // primary: read along as it types
      t = half(Math.max(a + dur + 0.2 * B, read - SEEN - 0.5 * B), B); // the next command types once this one is nearly read
      return { a, cps, dur };
    });
    // the steps land one per beat from the first beat after the commands have been read; the music drops on
    // the first bar line among them (four beats always hold one), so a step lands on the drop and the
    // terminal never waits for a bar line
    const steps = (s.steps || []).slice(0, 4);
    const s0 = onBeat(rd.done - 1.25 * B, B);
    T.stepsAt = steps.length ? Math.max(bar, Math.ceil(s0 / bar - 1e-6) * bar) : null;
    if (T.stepsAt != null && T.stepsAt > s0 + (steps.length - 1) * B + 1e-6) T.stepsAt = null; // no bar line among them: no drop
    T.steps = steps.map((_, i) => rd.move(s0 + i * B, 0.3, 'step'));
    if (steps.length) rd.shot(s0, 'the step cards, alone on the drop');
    // glance: each step (command and label, ≤ 6 words) recaps a chapter the film has shown
    steps.forEach((st, i) => rd.glance(T.steps[i] + SEEN, st));
    T.musicRest = T.stepsAt ?? undefined;
    T.done = rd.done;
    T.out = outOf(s, B, 0);
    if (s.exit === 'glitch') T.out = 0.5 * B;
    T.exit = D - T.out;
    const cmds = (s.commands || []).slice(0, 2);
    T.cues = [...(T.stepsAt != null ? [[0, 'rest', 1, T.stepsAt], [T.stepsAt, 'drop', 1]] : []), ...T.cmds.map((c, i) => [c.a, 'type', 0.5, cmds[i].length / c.cps]), ...T.steps.map((x) => [x, 'stamp', 0.8]), ...exitCues(s, T, D, B)];
    T.keys = [...(T.stepsAt == null || T.steps.some((x) => Math.abs(x - T.stepsAt) < 1e-6) ? [] : [[T.stepsAt, 'accent']]), ...T.steps.map((x) => [x, T.stepsAt != null && Math.abs(x - T.stepsAt) < 1e-6 ? 'accent' : 'land'])];
    return finish(T, rd);
  },
  // Tunnel, fold, the slit opens on the bar line (the claim) and the words land one per half beat; once the
  // line is complete it is read in a pause (0.3 s a word); the slit closes in 0.6 of the time it took to open.
  'horizon-tagline'(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const w1 = words(s.lines?.[0]), w2 = words(s.lines?.[1]);
    const T = { tunnel: [0, 4 * B], flat: [3.1 * B, 4 * B], open: 4 * B, openDur: 0.75 * B, out: 0.5 * B };
    T.words = [...w1.map((_, i) => 4.5 * B + i * 0.5 * B)];
    const l2 = (T.words[T.words.length - 1] ?? 4 * B) + 0.5 * B; // one stream of half beats across the two lines
    T.words.push(...w2.map((_, i) => l2 + i * 0.5 * B));
    const last = T.words[T.words.length - 1] ?? T.open;
    rd.move(0, 0.2, 'the tunnel'); rd.move(B, 3 * B, 'the tunnel rushes'); rd.move(T.flat[0], T.flat[1] - T.flat[0], 'the tunnel folds into the line');
    rd.move(T.open, T.openDur, 'the line opens as a slit');
    rd.shot(T.open, 'the slit holding the claim');
    T.words.forEach((x) => rd.move(x, 0.5, 'a word'));
    rd.at(last + 0.5 * B);
    rd.word(last + SEEN, s.lines); // word at a time: complete at the last word, then 0.3 s a word
    T.done = rd.done;
    rd.pause(last + 0.5, T.done);
    T.closeDur = 0.6 * T.openDur; // exits faster than entrances (principle 5)
    T.close = D - 0.5 * B;
    T.cues = [[0, 'rush', 1, 4 * B], [T.open, 'impact', 0.9], ...T.words.map((t) => [t, 'tick', 0.55]), [T.close, 'whoosh', 0.5]];
    T.keys = [[T.open, 'claim']];
    T.handoffs = [T.open];
    T.expressive = [[T.flat[0], T.open + T.openDur - T.flat[0], 'tunnel-fold', 'the ground folds into the horizon']];
    T.claimAt = T.open;
    T.moves = [[T.close, D]];
    return finish(T, rd);
  },
  'tunnel-tagline'(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read);
    const T = { tunnel: [0, 4 * B], flash1: 4 * B - 0.075, line1: 4 * B, line2: 4.5 * B, out: 0.6 * B };
    rd.move(0, 0.2, 'the tunnel'); rd.move(B, 3.5 * B, 'the tunnel rushes'); rd.move(T.line1, 0.5, 'the slogan decodes'); rd.move(T.line2, 0.5, 'its second line');
    rd.shot(T.line1, 'the dot-matrix slogan');
    rd.at(T.line2 + 0.5);
    rd.primary(T.line1 + 0.45, s.lines?.[0]); rd.primary(T.line2 + 0.5, s.lines?.[1]); // primary, one state a line
    T.done = rd.done;
    // after the slogan has been read, a small jitter on every second beat while it holds
    T.jitters = [];
    for (let x = Math.max(6 * B, Math.ceil(T.done / (2 * B) - 1e-6) * 2 * B); x < D - B - 1e-6; x += 2 * B) T.jitters.push(x);
    T.tear = D - 0.6 * B; T.flash = D - 0.05;
    T.cues = [[0, 'rush', 1, 4 * B], [4 * B, 'impact', 1], ...T.jitters.map((t) => [t, 'glitch', 0.4]), [T.tear, 'glitch', 0.6], [T.flash, 'flash', 0.6]];
    T.keys = [[4 * B, 'claim']];
    T.claimAt = 4 * B;
    T.expressive = [[T.flash1, 0.5 * B, 'tunnel-fold', 'the tunnel flashes into the slogan']];
    T.moves = [...T.jitters.map((x) => [x, x + 0.1]), [T.tear, D]];
    return finish(T, rd);
  },
  // The name and the chips type out of the cursor, the URL typed at the cursor (held >= 3 s), then one line of
  // sub. On the downbeat of the last bar the chips light, one per half beat: the closing scene's second move
  // (principle 5). A rest: the URL hold is the film's closing card.
  end(s, g, read) {
    const B = g.beat, D = s.dur, rd = session(read), bar = B * (g.beatsPerBar ?? 4);
    const url = String(s.url || '');
    const T = { morph: 0, morphDur: 0.9 * B, logo: 0.05 * B, name: 0.15 * B, url: 1.5 * B, cps: 45, out: 0.4 };
    rd.move(0, 0.9 * B, 'the line shrinks into the cursor'); rd.move(T.logo, 0.6, 'the name types out of it');
    T.chips = (s.chips || []).slice(0, 4).map((c, i) => { const t = rd.move(B + i * 0.5 * B, 0.3, 'chip'); rd.glance(t + SEEN, c); return t; }); // glance: chips repeat the install steps
    const typed = T.url + url.length / T.cps;
    rd.move(T.url, typed - T.url, 'the URL types');
    rd.at(typed + 3); // the closing URL holds >= 3 s (principle 1)
    const urlRead = Math.max(typed, rd.primary(T.url + SEEN, url)); // primary
    T.sub = rd.move(half(Math.max(4 * B, urlRead), B), 0.5, 'sub');
    if (s.sub) rd.primary(T.sub + SEEN, s.sub); // primary: ≤ 8 words (a rest: the state limit does not apply)
    T.done = rd.done;
    T.dim = D - 0.4;
    // the last bar line of the film: the closing scene ends on one, so this is its last downbeat
    const endAbs = (s.start ?? 0) + D;
    T.final = Number.isFinite(D) ? Math.round(endAbs / bar) * bar - bar - (s.start ?? 0) : NaN;
    T.ticks = Number.isFinite(T.final) && T.final > T.sub + 0.5 ? T.chips.map((_, i) => T.final + i * 0.5 * B) : [];
    T.cues = [[0, 'stamp', 0.9], ...T.chips.map((t) => [t, 'tick', 0.55]), [T.url, 'type', 0.5, url.length / T.cps], ...T.ticks.map((t, i) => [t, i ? 'tick' : 'stamp', i ? 0.6 : 0.8])];
    T.keys = [[0, 'end'], ...(T.ticks.length ? [[T.ticks[0], 'end']] : [])];
    T.handoffs = [0];
    T.peaks = [[0, 'lockup']];
    T.moves = T.ticks.map((x) => [x, x + 0.3]);
    T.micro = T.ticks.map((x) => [x, 'a chip lights']);
    return finish(T, rd);
  },
};

// The candidates' hop schedule of the pick, from lib/handoffs roulette-lock itself: hop times in beats, the lock,
// the length (the module's own prepare(), with this film's candidates).
export const roulette = (s) => {
  const P = merge(RL.defaults, { labels: (s.candidates || []).slice(0, 8), answer: Math.max(0, (s.candidates || []).indexOf(s.answer)), laps: s.laps ?? 1, step: 0.5, slow: 1.5, settle: 0.4 });
  const D = P.labels.length ? RL.prepare(P) : { hops: [{ b: 0, cell: 0 }], lock: 0, beats: P.settle };
  return { hops: D.hops, lock: D.lock, beats: D.beats, settle: P.settle };
};

// Tail moves: when a scene is laid out longer than its choreography needs (the beat grid, the phrase share, a pad
// before the next chapter turn), the hold before its exit would grow past two beats. Each tail is a T0 change in
// that slack, on a beat, so no hold exceeds two beats: the page's supporting elements dim to 60 % in two frames,
// one group per tail (the window bar and strip first, then the lines read earlier; film.js `dims` per type), so
// what the page proved stands alone. The taglines (motion of their own to their end) and the closing rest have none.
const NO_TAILS = ['horizon-tagline', 'tunnel-tagline', 'end'];
export const tailsOf = (s, T, B) => {
  if (!Number.isFinite(s.dur) || NO_TAILS.includes(s.type)) return [];
  const X = s.dur - (T.out ?? 0), cap = HOLD * B;
  const ends = (T.moves || []).filter(([a]) => a < X).map(([, z]) => Math.min(z, X));
  const E = ends.length ? Math.max(...ends) : 0;
  if (X - E <= cap + 1e-6) return [];
  const n = Math.ceil((X - E) / cap - 1e-6) - 1, out = [];
  const absBeat = (t) => Math.round(((s.start ?? 0) + t) / B) * B - (s.start ?? 0); // a beat of the film
  for (let k = 1; k <= n; k++) {
    const t = absBeat(E + ((X - E) * k) / (n + 1));
    if (t > E + 0.2 && t < X - 0.2 && !out.some((x) => Math.abs(x - t) < 1e-6)) out.push(t);
  }
  // rounding to the beat may leave a gap over the cap: add one more where it is
  const pts = [E, ...out, X];
  for (let k = 1; k < pts.length; k++) if (pts[k] - pts[k - 1] > cap + 1e-6) { const t = absBeat((pts[k] + pts[k - 1]) / 2); if (t > pts[k - 1] + 0.2 && t < pts[k] - 0.2) out.push(t); }
  return out.sort((a, b) => a - b);
};

// The scene's timing with its links (exit, lead) and its tails. ctx: { scenes, i } in fit(), the laid list in plan().
const linked = (s, scenes, i) => {
  const L = scenes && i != null ? linkOf(scenes, i) : { exit: s.exit ?? 'cut', into: null, lead: 0 };
  return { ...s, exit: L.exit, into: L.into, lead: L.lead };
};
const timed = (s, g, read) => {
  const fn = TIMING[s.type];
  const T = fn(s, g, read);
  T.tails = tailsOf(s, T, g.beat);
  if (T.tails.length) { T.moves.push(...T.tails.map((t) => [t, t + 0.1])); T.micro.push(...T.tails.map((t) => [t, 'supporting elements dim'])); }
  return T;
};

// The scene's need in seconds: everything read and held, then the exit. `read` is ctx.reading in fit().
export const need = (s, g, read = reader, scenes, i) => {
  if (!TIMING[s.type]) return 0;
  const T = timed({ ...linked(s, scenes, i), dur: NaN }, g, read);
  return T.done + T.out;
};

// The still holds of a scene laid out at `dur` seconds: the gaps between the intervals in which something
// in the content area moves, from the first landing to the start of the exit. Ambient layers (grid drift,
// glow breathing, the sphere's rings, pulses, the cursor blink) are not counted; they are registered on the
// mode card.
export const stills = (T, dur) => {
  const exit = dur - (T.out ?? 0);
  const iv = (T.moves || []).filter(([a, z]) => Number.isFinite(a) && Number.isFinite(z) && a < exit).map(([a, z]) => [a, Math.min(z, exit)]).sort((p, q) => p[0] - q[0]);
  const out = [];
  let reach = iv.length ? iv[0][1] : 0;
  for (const [a, z] of iv) {
    if (a > reach + 1e-6) out.push([reach, a]);
    reach = Math.max(reach, z);
  }
  if (exit > reach + 1e-6) out.push([reach, exit]);
  return out;
};

// steps(s, g, read): seconds the picture holds still after each landing, the scene laid out at its need; a hold
// that is a reading pause (a claim being read) is returned as { still, pause: true }.
export const steps = (s, g, read = reader, scenes, i) => {
  if (!TIMING[s.type]) return [];
  const sl = linked(s, scenes, i);
  const d = need(s, g, read, scenes, i);
  const T = timed({ ...sl, dur: d }, g, read);
  const inPause = ([a, z]) => (T.pauses || []).some(([p, q]) => a >= p - 0.05 && z <= q + 0.05);
  return stills(T, d).map((x) => (inPause(x) ? { still: x[1] - x[0], pause: true } : x[1] - x[0]));
};

// Lay the fitted scenes out and compute every event. `fitted` is lib/timing.js fit(content, rules).
// A `decide` or `pick` scene without a chapter continues the chapter before it: same number, same header.
export const plan = (content, fitted) => {
  const g = grid({ bpm: fitted.bpm });
  const read = (list) => reader(list, { lang: content.lang ?? 'en' });
  const laid = fitted.scenes.map((s) => ({ ...s }));
  const src = content.scenes;
  let ch = 0, chapter = null, chNote = null;
  laid.forEach((s, i) => {
    s.index = i;
    s.prev = laid[i - 1]?.type;
    s.next = laid[i + 1]?.type;
    if (s.chapter) { s.chapterNo = ++ch; chapter = s.chapter; chNote = s.note; }
    else if (CONTINUES.includes(s.type) && chapter) { s.chapterNo = ch; s.continues = { ...chapter, note: chNote }; }
    const fn = TIMING[s.type];
    if (!fn) throw new Error(`phosphor: unknown scene type "${s.type}" (scene ${i})`);
    Object.assign(s, linked(s, src, i));
    s.variant = s.exit === 'glitch' || s.exit === 'crt' ? variantOf(src, i, s.exit) : undefined;
    s.T = timed(s, g, read);
  });
  const end = laid.length ? laid[laid.length - 1].end : 0;
  const cues = laid
    .flatMap((s) => [...s.T.cues, ...(s.into === 'crt' ? [[0, 'crtOn', 0.6, CRT.on * g.beat]] : [])].map(([t, kind, gain = 1, dur = 0]) => ({ t: s.start + t, kind, gain, dur, scene: s.index })))
    .filter((c) => c.t >= 0 && c.t < end)
    .sort((a, b) => a.t - b.t);
  return { g, laid, chapterCount: ch, cues, total: end };
};

// Key events, still holds, hand-offs and the four tiers for renders/timing.json (lib/timing.js events()). Holds
// are exported only for pages whose content area has no ambient motion of its own (no sphere, pulse, ticker,
// travelling dot or blinking cursor), so check-film can measure stillness there; a reading pause is exported on
// any page (pause: true). The mask is the content area inside the HUD: brand and licence above y 84, chapter
// label and progress bar below y 996.
export const HOLD_TYPES = ['qa', 'decide', 'freeze', 'install', 'run', 'pick', 'scope'];
export const MASK = [100, 84, 1720, 912];
export const EXPRESSIVE = { glitch: 'glitch-cut', crt: 'crt-collapse' };
export const exportEvents = (scenes, g, content) => {
  const p = plan(content, { bpm: g.bpm, scenes });
  const keys = [], holds = [], handoffs = [], micro = [], shots = [], expressive = [], peaks = [];
  const B = p.g.beat;
  // the climax (T3): a scene marked `climax: true`, else the tagline's claim, else the scope's reveal
  const marked = p.laid.findIndex((s) => s.climax === true);
  const tag = p.laid.findIndex((s) => s.T.claimAt != null);
  const scope = p.laid.findIndex((s) => s.T.reveal != null);
  const climax = marked >= 0 ? marked : tag >= 0 ? tag : scope;
  for (const s of p.laid) {
    const T = s.T, at = (t) => s.start + t, inside = (t) => Number.isFinite(t) && t >= 0 && t <= s.dur + 1e-6;
    for (const [t, kind] of T.keys || []) if (inside(t)) keys.push({ t: at(t), kind, scene: s.index });
    for (const t of T.handoffs || []) handoffs.push({ t: at(t), scene: s.index });
    for (const [t, what] of T.micro || []) if (inside(t) && t < s.dur - 1e-6) micro.push({ t: at(t), scene: s.index, what });
    for (const [t, what] of T.shots || []) if (inside(t) && t > 1e-6 && t < s.dur - 1e-6) shots.push({ t: at(t), scene: s.index, what });
    for (const [t, dur, device, variant] of T.expressive || []) if (inside(t)) expressive.push({ t: at(t), dur, device, variant, scene: s.index });
    if (EXPRESSIVE[s.exit]) {
      const dur = s.exit === 'crt' ? (CRT.off + CRT.on) * B : T.out;
      expressive.push({ t: s.end - T.out, dur, device: EXPRESSIVE[s.exit], variant: s.variant, scene: s.index });
    }
    for (const [t, kind] of T.peaks || []) if (inside(t)) peaks.push({ t: at(t), kind, scene: s.index });
    if (s.index === climax) {
      const t = T.claimAt ?? T.reveal ?? 0;
      peaks.push({ t: at(t), kind: T.claimAt != null ? 'claim' : 'reveal', climax: true, scene: s.index });
    }
    const pauses = (T.pauses || []).map(([a, z]) => [a, Math.min(z, s.dur - (T.out ?? 0))]).filter(([a, z]) => z - a >= 0.2);
    for (const [a, z] of pauses) holds.push({ from: at(a), to: at(z), scene: s.index, pause: true });
    if (HOLD_TYPES.includes(s.type)) for (const [a, z] of stills(T, s.dur)) {
      if (z - a < 0.2 || pauses.some(([pa, pz]) => a >= pa - 0.05 && z <= pz + 0.05)) continue;
      holds.push({ from: at(a), to: at(z), scene: s.index });
    }
  }
  return { keys, holds, handoffs, mask: MASK, micro, shots, expressive, peaks };
};

export const TYPES = Object.keys(TIMING);

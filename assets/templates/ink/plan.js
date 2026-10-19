// plan.js — every time in an ink film, computed from content.js alone.
// Scene starts, bars, bpm and duration come from lib/timing.js fit() with ./timing.rules.js; inside a scene,
// entrances are timed in beats from its start and exits in beats before its end, so a longer scene lands at the
// same moment and holds longer. Pure (no DOM): film.js draws from it, score.mjs places sounds from it, and
// timing.rules.js events() reads the four tiers of change from it (P.tiers), so picture, sound and the checks agree.
import { BLOOM } from './inkflow.js';
import { fit, report, reader } from './lib/timing.js';
import { grid } from './lib/beat.js';
import rules, { C, bindContext, registerPlan, nameLabelStarts, counterStarts, ctaTimes, slamLabelAt, warpLabelAt, rulerLabelAt, burstTimes, claimText, leadBeats } from './timing.rules.js';
import { CANVAS, LUFS, LUFS_SOURCE, REGISTRY, TRANSITIONS, TYPE_WIDTH_IDS, LIMITS_EXTENDED, DOT_OUT, APERTURES, GROUNDS, groundOf, groundIn, groundsOf, transitionOut, tokensOf, fill, facts, readWords } from './registry.js';

export { CANVAS, LUFS, LUFS_SOURCE, REGISTRY, TRANSITIONS, groundOf, groundIn, groundsOf };
const reading = (list) => reader(list, { wordSec: C.wordSec });

// Glyphs whose closed counter sits in the middle of their box: what counter-portal can push through.
export const PORTAL_GLYPHS = '0OQD';
// Types whose dot arrives by a hop (a key of the generic dot), so a scan can hand them the dot.
const SCAN_INTO = ['steps', 'ruler', 'counter', 'slam', 'warp', 'swap', 'burst'];

// Throws on content that the template cannot render as designed.
export const validate = (c, f) => {
  const err = [];
  const len = (s) => [...fill(s, f)].length;
  // the batch 2 variants were settled on 2026-10-18 (field: the short field is the bloom's own timing; push: the
  // ambient push is the only push); no options remain
  if (c.variant != null) err.push(`variant: no options remain (field and push were settled 2026-10-18); delete it`);
  if (c.typeWidth != null && !TYPE_WIDTH_IDS.includes(c.typeWidth)) err.push(`typeWidth '${c.typeWidth}' unknown; use ${TYPE_WIDTH_IDS.join(' or ')}`);
  const wide = c.typeWidth === 'extended';
  const claims = c.scenes.filter((s) => s.type === 'claim').length;
  if (claims > 1) err.push(`${claims} claim scenes: a film has one (its whiteout is the film's one peak, X21)`);
  c.scenes.forEach((s, i) => {
    const r = REGISTRY[s.type] && { ...REGISTRY[s.type], limits: { ...REGISTRY[s.type].limits, ...(wide ? LIMITS_EXTENDED[s.type] : {}) } };
    const at = `scenes[${i}] (${s.type})`;
    if (!r) return err.push(`${at}: unknown type; use one of ${Object.keys(REGISTRY).join(', ')}`);
    if (s.to && !TRANSITIONS.includes(s.to)) err.push(`${at}: to '${s.to}' unknown; use ${TRANSITIONS.join(', ')}`);
    const next = c.scenes[i + 1];
    const check = (v, lim, name) => v != null && len(v) > lim && err.push(`${at}: ${name} "${v}" is ${len(v)} chars, limit ${lim}`);
    if (s.type === 'slam') {
      const toks = tokensOf(s);
      if (!s.lines || s.lines.length < 1 || s.lines.length > 2) err.push(`${at}: lines must hold 1 or 2 lines`);
      (s.lines || []).forEach((l) => check(l.join(' '), r.limits.line, 'line'));
      if (toks.length < 1 || toks.length > 4) err.push(`${at}: ${toks.length} words; a slam takes 1–4 (one per beat)`);
      check(s.label, r.limits.label, 'label');
    }
    if (s.type === 'swap') {
      const n = (s.words || []).length;
      if (n < 2 || n > 6) err.push(`${at}: ${n} words; a swap takes 2–6 (one per beat, each on its own ground)`);
      (s.words || []).forEach((w) => { check(w, r.limits.word, 'word'); if (/\s/.test(String(w).trim())) err.push(`${at}: "${w}" is more than one word; a swap shows one word a beat`); });
      if (s.answer != null && !(Number.isInteger(s.answer) && s.answer >= 0 && s.answer < n)) err.push(`${at}: answer must be the index of one of its words`);
      (s.grounds || []).forEach((g, k) => {
        if (!GROUNDS.includes(g)) err.push(`${at}: ground '${g}' unknown; use ${GROUNDS.join(', ')}`);
        else if (g === 'accent' && k !== s.answer) err.push(`${at}: only the answer stands on the accent field (set answer: ${k})`);
      });
      groundsOf(s).forEach((g, k) => { if (k && g === groundsOf(s)[k - 1]) err.push(`${at}: words ${k} and ${k + 1} share the ${g} ground; an aperture opens onto another ground`); });
      (s.apertures || []).forEach((a) => { if (!APERTURES.includes(a)) err.push(`${at}: aperture '${a}' unknown; use ${APERTURES.join(', ')}`); });
    }
    if (s.type === 'warp') ['word', 'word2', 'label'].forEach((k) => check(s[k], r.limits[k], k));
    if (s.type === 'burst') {
      ['word', 'into', 'label'].forEach((k) => check(s[k], r.limits[k], k));
      if (!s.word || !s.into) err.push(`${at}: a burst needs word and into`);
    }
    if (s.type === 'bloom') {
      if (!next || next.type !== 'name') err.push(`${at}: a bloom must be followed by a name scene (it ends on the accent field)`);
      // the film may open on the bloom: its frame 0 is the dot at rest on paper, the state a slam hands over
      const pv = c.scenes[i - 1];
      if (i > 0 && (!['slam', 'warp', 'burst', 'swap'].includes(pv.type) || groundOf(pv) !== 'paper')) err.push(`${at}: a bloom opens the film or follows a slam, warp, burst or swap that ends on paper (the dot sinks into the paper)`);
    }
    if (s.type === 'name') {
      check(s.name, r.limits.name, 'name');
      if (!s.labels || s.labels.length < 1 || s.labels.length > 2) err.push(`${at}: labels must hold 1 or 2 lines`);
      (s.labels || []).forEach((l) => check(l, r.limits.label, 'label'));
      if (!c.scenes[i - 1] || c.scenes[i - 1].type !== 'bloom') err.push(`${at}: a name scene follows a bloom`);
    }
    if (s.type === 'steps') {
      const n = (s.steps || []).length;
      if (n < 3 || n > 8) err.push(`${at}: ${n} steps; a steps scene takes 3–8`);
      (s.steps || []).forEach((w) => check(w, r.limits.step, 'step'));
    }
    if (s.type === 'ruler') {
      if (!s.words || s.words.length !== 2) err.push(`${at}: words must be two words`);
      (s.words || []).forEach((w) => check(w, r.limits.word, 'word'));
      check(s.label, r.limits.label, 'label');
    }
    if (s.type === 'counter') {
      const n = (s.items || []).length;
      if (n < 1 || n > 2) err.push(`${at}: ${n} items; a counter takes 1 or 2 values`);
      (s.items || []).forEach((it) => { check(it.value, r.limits.value, 'value'); check(it.label, r.limits.label, 'label'); });
    }
    if (s.type === 'claim') {
      const ls = s.lines || [];
      if (ls.length < 1 || ls.length > 2 || ls.some((l) => typeof l !== 'string')) err.push(`${at}: lines must hold 1 or 2 strings`);
      ls.forEach((l) => check(l, r.limits.line, 'line'));
      const w = readWords(fill(claimText(s), f));
      if (w > 8) err.push(`${at}: ${w} words; a claim carries at most 8 (read in one pause)`);
      if (i === 0) err.push(`${at}: a claim cannot open the film (its whiteout exposes the scene before it)`);
      if (s.to === 'portal' && ![...fill(claimText(s), f)].some((ch) => PORTAL_GLYPHS.includes(ch))) err.push(`${at}: to 'portal' pushes through a counter: its lines need one of ${[...PORTAL_GLYPHS].join(' ')}`);
    }
    if (s.type === 'cta') {
      if (i !== c.scenes.length - 1) err.push(`${at}: cta must be the last scene`);
      ['name', 'url', 'line'].forEach((k) => check(s[k], r.limits[k], k));
    }
    if (s.to === 'portal') {
      if (s.type !== 'claim') err.push(`${at}: 'portal' leaves a claim only (it pushes through a counter of the claim's type)`);
      // the counter shows the next scene's ground inside a letter set in ink: on night it would fill the letter solid
      if (next && groundIn(next) === 'night') err.push(`${at}: 'portal' shows the next ground inside an ink letter: scenes[${i + 1}] starts on night, which would fill the counter solid; use another transition`);
    }
    if (s.to === 'scan') {
      if (['bloom', 'claim', 'cta'].includes(s.type)) err.push(`${at}: 'scan' cannot leave a ${s.type}`);
      if (next && !SCAN_INTO.includes(next.type)) err.push(`${at}: 'scan' hands the dot to a scene it hops into (${SCAN_INTO.join(', ')}), not ${next.type}`);
      if (next && groundIn(next) === groundOf(s)) err.push(`${at}: 'scan' swaps the world around the dot: scenes[${i + 1}] must stand on another ground`);
    }
    if (next && DOT_OUT.includes(s.to) && ['bloom', 'name'].includes(next.type)) err.push(`${at}: '${s.to}' cannot lead into ${next.type}`);
    if (next && next.type === 'claim' && s.to) err.push(`${at}: to '${s.to}' is ignored: a claim always enters by its whiteout; delete it`);
    if (next && s.to === 'hop' && groundOf(s) !== groundIn(next)) err.push(`${at}: 'hop' needs the same ground on both sides; use wipe, iris, flood, scan or cut`);
  });
  if (err.length) throw new Error('content.js:\n  ' + err.join('\n  '));
};

// Fitted timing (throws when fit() reports an error, e.g. copy that needs more than the scene ceiling).
export const timing = (c) => {
  bindContext(c);
  const T = fit(c, rules);
  const errors = T.notes.filter((n) => n.level === 'error');
  if (errors.length) throw new Error('timing (npm run fit):\n' + report(T));
  return T;
};

// Every scene with its beat times, its text windows, every sound event and the four tiers. Times in seconds.
export const plan = (c) => {
  const T = timing(c);
  const f = facts(T, c.seed);
  validate(c, f);
  const B = T.beat;
  const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
  const laid = T.scenes.map((s, i) => ({ ...s, index: i }));
  const ev = [];
  const E = (t, kind, extra = {}) => ev.push({ t, kind, ...extra });
  // tiers: T0 micro changes {t, what, settle, lead}, holds, shots, expressive, peaks
  const micro = [], shots = [], expressive = [], peaks = [], holds = [];
  const M = (s, t, what, o = {}) => micro.push({ t, scene: s.index, what, settle: o.settle ?? 0.2, lead: o.lead ?? 0.05 });
  laid.forEach((s, i) => {
    const bt = (n) => s.start + n * B;
    s.out = transitionOut(c.scenes, i);
    s.inFrom = i > 0 ? laid[i - 1].out : null;
    const dotOut = DOT_OUT.includes(s.out);
    // words leave early when the next thing needs the stage (bloom, a dot transition); into a claim they stay while
    // the frame exposes to white over the last beat (read before it starts)
    s.exitAt = s.out === 'whiteout' ? s.end + 1 : s.end - leadBeats(s.out) * B - (s.out === 'portal' ? C.portalClearSec : 0);
    // night scenes hand the dot on: they hold it until ownEnd, then it hops or transforms; their words stay to exitAt,
    // like a slam's words while its dot hops
    s.ownEnd = dotOut ? s.end - C.leadDot * B : s.out === 'hop' ? s.end - C.ownLeadHop * B : s.end;
    // after a scan the dot hops from the anchor to its place in this scene over the first beat
    s.inDelay = s.inFrom === 'scan' ? C.scanIn * B : 0;
    s.labelWins = []; // mono lines: {text, tIn, tOut, still, cps}
    s.bigWins = []; // display words: {text, tIn, still}
    s.bounces = []; // the resting dot's in-place bounces (landing times)
    s.dotIn = null; // when the generic dot first lands in this scene (where a hop into it ends)
    s.restFrom = null; // when the generic dot lands for the last time in this scene (it rests, bounces, then leaves)
    if (s.type === 'slam') {
      s.offset = i === 0 ? C.firstOffset : 0;
      s.tokens = tokensOf(s).map((tk, k) => ({ ...tk, text: fill(tk.text, f), t: bt(s.offset + k), accent: s.accent === k }));
      const last = s.tokens[s.tokens.length - 1];
      s.tokens.forEach((tk) => s.bigWins.push({ text: tk.text, tIn: tk.t, still: s.exitAt - C.wordExitSec }));
      if (s.label) s.labelWins.push({ text: fill(s.label, f), tIn: s.start + slamLabelAt(s, B, i === 0), tOut: s.exitAt, still: s.exitAt - C.labelEarlySec, cps: C.cps });
      s.tokens.forEach((tk, k) => { E(tk.t, 'slam', { stop: s.stops === 'each' || k === s.tokens.length - 1, k }); M(s, tk.t, `slam "${tk.text}"`); });
      if (s.stops === 'each') { s.mergeEnd = last.t + C.splitMerge * B; M(s, s.mergeEnd, 'the stops merge into one', { lead: 0.4 * B }); }
      s.dotIn = s.stops === 'each' ? s.tokens[0].t : last.t;
      s.restFrom = s.stops === 'each' ? s.mergeEnd : last.t;
    }
    if (s.type === 'swap') {
      s.offset = i === 0 ? C.firstOffset : 0;
      const grounds = groundsOf(s), aps = s.apertures?.length ? s.apertures : APERTURES.slice(0, 3);
      s.items = s.words.map((w, k) => ({ text: fill(w, f), t: bt(s.offset + k), ground: grounds[k], ap: k ? aps[(k - 1) % aps.length] : null }));
      s.apDur = C.swapApBeats * B;
      s.items.forEach((it, k) => {
        const nx = s.items[k + 1];
        // a word before the last is read in its beat, until the next aperture opens over it
        s.bigWins.push({ text: it.text, tIn: it.t, still: nx ? nx.t : s.exitAt - C.wordExitSec });
        E(it.t, 'slam', { stop: true, k });
        if (k) E(it.t, 'aperture', { shape: it.ap, k });
        M(s, it.t, k ? `aperture (${it.ap}) onto ${it.ground}: "${it.text}"` : `slam "${it.text}"`);
      });
      s.dotIn = s.items[0].t;
      s.restFrom = s.items.at(-1).t;
    }
    if (s.type === 'warp') {
      s.wordText = fill(s.word, f); s.word2Text = fill(s.word2, f);
      s.t1 = bt(0); s.t2 = bt(C.warpWord2);
      s.bigWins.push({ text: s.wordText, tIn: s.t1, still: s.exitAt - C.wordExitSec }, { text: s.word2Text, tIn: s.t2, still: s.exitAt - C.wordExitSec });
      if (s.label) s.labelWins.push({ text: fill(s.label, f), tIn: s.start + warpLabelAt(B), tOut: s.exitAt, still: s.exitAt - C.labelEarlySec, cps: C.cps });
      E(s.t1, 'rise'); E(bt(0.6), 'warble', { dur: Math.min(s.exitAt, s.end) - bt(0.6) }); E(s.t2, 'slam', { stop: true });
      M(s, s.t1, `"${s.wordText}" rises and warps`); M(s, s.t2, `slam "${s.word2Text}"`);
      s.dotIn = s.t2; s.restFrom = s.t2;
    }
    if (s.type === 'burst') {
      const b = burstTimes(s, B, i === 0);
      s.wordText = fill(s.word, f); s.intoText = fill(s.into, f);
      s.land = s.start + b.land; s.t0 = s.start + b.t0; s.t1 = s.start + b.t1; s.burstAt = s.start + b.burst;
      s.bigWins.push({ text: s.wordText, tIn: s.land, still: s.t0 }, { text: s.intoText, tIn: s.t1, still: s.exitAt - C.wordExitSec });
      if (s.label) s.labelWins.push({ text: fill(s.label, f), tIn: s.start + b.labelAt, tOut: s.exitAt, still: s.exitAt - C.labelEarlySec, cps: C.cps });
      E(s.land, 'slam', { stop: true }); E(s.t0, 'collapse', { dur: s.burstAt - s.t0 }); E(s.burstAt, 'burst'); E(s.burstAt + 0.3 * B, 'form', { dur: s.t1 - s.burstAt - 0.3 * B }); E(s.t1, 'slam', { stop: true });
      M(s, s.land, `slam "${s.wordText}"`);
      M(s, s.t0, 'the word shrinks into its dot', { settle: s.t1 - s.t0 + 0.05, lead: 0 });
      M(s, s.burstAt, 'the dot bursts', { settle: s.t1 - s.burstAt + 0.05, lead: 0 });
      M(s, s.t1, `the particles condense into "${s.intoText}"`);
      expressive.push({ t: s.t0, dur: s.t1 - s.t0, device: 'collapse-burst', scene: i });
      s.dotIn = s.land; s.restFrom = s.t1;
    }
    if (s.type === 'bloom') {
      // fixed choreography (inkflow.js BLOOM): the dot rests, is released on 1, the pour from 2.4, frame covered by 7, flat from 7.9
      s.sink = bt(0); s.surge1 = bt(BLOOM.drop); s.surge2 = bt(BLOOM.pour); s.cover = bt(7);
      E(bt(0.08), 'drip'); E(s.surge1, 'surge', { dur: (BLOOM.pour - BLOOM.drop) * B }); E(s.surge2, 'surge', { dur: 4.6 * B, big: true });
      [[BLOOM.drop, 'the dot is released into the water'], [BLOOM.pour, 'held ink and three drops pour'], [BLOOM.spread, 'drops round the rim carry it out'], [5.2, 'drops toward the corners'], [6.8, 'the last paper goes']].forEach(([b, w]) => M(s, bt(b), w, { settle: 0, lead: 0 }));
      // from beat 4 the ink runs past the frame while the camera pushes in: a second composition (T1)
      shots.push({ t: bt(C.bloomShot), scene: i, what: 'the ink fills the frame; the camera pushes in' });
    }
    if (s.type === 'name') {
      s.nameText = fill(s.name, f);
      s.rise = bt(0);
      s.widthSteps = [2, 3, 4, 5, 6].map(bt); // per-beat width jumps
      s.playFrom = bt(5);
      s.bigWins.push({ text: s.nameText, tIn: s.rise, still: s.end });
      const ls = (s.labels || []).map((l) => fill(l, f));
      const at = nameLabelStarts(s, B, reading).map((x) => s.start + x);
      const still = dotOut ? s.end - C.leadDot * B : s.end;
      ls.forEach((text, k) => {
        const tOut = k < ls.length - 1 ? at[k + 1] : s.end;
        s.labelWins.push({ text, tIn: at[k], tOut, still: k < ls.length - 1 ? tOut : still, cps: C.cps });
      });
      E(s.rise, 'drop'); s.widthSteps.forEach((t) => E(t, 'jump'));
      M(s, s.rise, `"${s.nameText}" rises out of the field`); s.widthSteps.forEach((t, k) => M(s, t, `width jump ${k + 1}`)); M(s, s.playFrom, 'the playhead runs');
      peaks.push({ t: s.start, kind: 'reveal', scene: i });
    }
    if (s.type === 'steps') {
      s.stepTexts = s.steps.map((w) => fill(w, f));
      s.stepAts = s.stepTexts.map((_, k) => bt(k));
      // a step list shows one word per beat by design; only the last step is held to the reading standard
      s.stepTexts.forEach((text, k) => { if (k === s.stepTexts.length - 1) s.bigWins.push({ text, tIn: s.stepAts[k], still: s.exitAt }); });
      // streak bursts mark the hand-off into the list (its first beat) by default; 'each' fires one per beat
      s.streakAts = s.streaks === false ? [] : s.streaks === 'each' ? [...s.stepAts] : [s.stepAts[0]];
      s.stepAts.forEach((t, k) => { E(t, 'step', { k, streak: s.streakAts.includes(t) }); M(s, t, `step "${s.stepTexts[k]}"`, { settle: 0.1 }); });
      // the scene owns its dot (the current progress dot): after the last step it bounces on the next beat, then
      // every two beats, until it leaves
      s.restFrom = s.stepAts.at(-1); s.restTo = s.ownEnd; s.ownsRest = true;
      if (s.inDelay) s.dotIn = s.start + s.inDelay;
    }
    if (s.type === 'ruler') {
      s.wordTexts = s.words.map((w) => fill(w, f));
      s.wordAts = [bt(0), bt(C.rulerWord2)];
      s.wordTexts.forEach((text, k) => s.bigWins.push({ text, tIn: s.wordAts[k], still: s.exitAt }));
      if (s.label) s.labelWins.push({ text: fill(s.label, f), tIn: s.start + rulerLabelAt(B), tOut: s.exitAt, still: s.exitAt, cps: C.cps });
      s.wordAts.forEach((t, k) => { E(t, 'slam', { stop: false }); M(s, t, `slam "${s.wordTexts[k]}"`); });
      E(s.start, 'ruler', { dur: C.rulerDrawSec });
      if (s.inDelay) s.dotIn = s.start + s.inDelay;
    }
    if (s.type === 'counter') {
      s.rollDur = C.counterRoll * B;
      const starts = counterStarts(s, g, reading);
      s.itemTexts = s.items.map((it, k) => {
        const st = starts[k], t = s.start + st.t, tOut = k < s.items.length - 1 ? s.start + starts[k + 1].t : s.exitAt;
        const value = fill(it.value, f), roll = /\d/.test(value);
        const still = k < s.items.length - 1 ? tOut - C.counterHopSec : tOut;
        s.bigWins.push({ text: value, tIn: t + (roll ? s.rollDur : 0), still });
        if (it.label) s.labelWins.push({ text: fill(it.label, f), tIn: t + st.labelAt, tOut, still, cps: C.cps });
        if (roll) E(t, 'roll', { dur: s.rollDur }); else E(t, 'slam', { stop: true });
        if (roll) E(t + s.rollDur, 'land');
        M(s, t, roll ? `"${value}" counts up` : `slam "${value}"`, { settle: roll ? s.rollDur + 0.05 : 0.2 });
        return { value, label: it.label ? fill(it.label, f) : '', t, tOut, roll, landed: t + st.landed };
      });
      // the stop rests on the last value: it bounces two beats after the value lands, then every two beats
      // the stop rests on each value until it hops to the next (0.3 s before it), on the last until the dot leaves
      s.rests = s.itemTexts.map((it, k) => [it.landed, k < s.itemTexts.length - 1 ? s.itemTexts[k + 1].t - C.counterHopSec : s.ownEnd]);
      s.restFrom = s.itemTexts.at(-1).landed; s.restTo = s.ownEnd; s.ownsRest = true;
      if (s.inDelay) s.dotIn = s.start + s.inDelay;
    }
    if (s.type === 'claim') {
      s.claimLines = (s.lines || []).map((l) => fill(l, f));
      s.hit = s.start; s.landed = s.start + C.claimLandSec;
      s.bigWins.push({ text: s.claimLines.join(' '), tIn: s.landed, still: s.exitAt });
      E(s.hit, 'whitehit');
      peaks.push({ t: s.start, kind: 'claim', scene: i });
      // the claim is read in a pause: still from the moment the shock has decayed until the push or the transition
      if (s.exitAt - s.landed >= 0.2) holds.push({ from: s.landed, to: s.exitAt, scene: i, pause: true, what: 'the claim is read' });
    }
    if (s.type === 'cta') {
      // the wordmark rises (after a portal it is already there: it was the far side of the counter); the URL or
      // command types on with a block cursor; on the next beat after typing the dot lands in the cursor's place;
      // on the downbeat of the last bar it hops in place and lands again
      s.nameText = fill(s.name, f);
      s.rise = s.inFrom === 'portal' ? s.start - 10 : bt(0);
      const ct = ctaTimes(s, B);
      s.typedAt = s.start + ct.typed; s.landAt = s.start + ct.land; s.lastDown = s.end - T.bar;
      s.bigWins.push({ text: s.nameText, tIn: Math.max(s.rise, s.start), still: s.end });
      s.labelWins.push({ text: fill(s.url, f), tIn: bt(C.ctaUrl), tOut: s.end + 0.2, still: s.end, cps: C.urlCps, url: true });
      if (s.line) s.labelWins.push({ text: fill(s.line, f), tIn: bt(C.ctaLine), tOut: s.end + 0.2, still: s.end, cps: C.cps, glance: true });
      if (s.inFrom !== 'portal') { E(s.rise, 'drop', { soft: true }); M(s, s.rise, `"${s.nameText}" rises`); }
      E(s.landAt, 'bell'); E(s.lastDown, 'land');
      M(s, s.landAt, 'the dot lands as the cursor'); M(s, s.lastDown, 'the second move');
      peaks.push({ t: s.start, kind: 'lockup', scene: i });
    }
    s.labelWins.forEach((w) => { E(w.tIn, 'type', { n: w.text.length, cps: w.cps }); M(s, w.tIn, `types "${w.text}"`, { settle: w.text.length / w.cps + 0.05, lead: 0 }); });
    // transition sounds sit on the same beats as the picture
    if (s.out === 'wipe') { E(s.end - B, 'whoosh', { dur: B }); E(s.end, 'impact'); M(s, s.end - B, 'the dot stretches into a bar'); }
    if (s.out === 'iris') { E(s.end - B, 'whoosh', { dur: 1.5 * B }); E(s.end, 'impact', { soft: true }); M(s, s.end - B, 'the dot swells into a ring'); }
    if (s.out === 'flood') { E(s.end - 0.5 * B, 'whoosh', { dur: 0.5 * B }); E(s.end, 'impact', { soft: true }); M(s, s.end - B, 'the dot takes the next ground'); }
    if (s.out === 'scan') { E(s.end - B, 'scan', { dur: C.scanBeats * B }); M(s, s.end - B, 'a hairline scans the next world in round the dot'); }
    if (s.out === 'portal') {
      E(s.exitAt, 'clear'); E(s.end - C.portalLead * B, 'portal', { dur: C.portalBeats * B }); E(s.end, 'impact', { soft: true });
      M(s, s.exitAt, 'the other glyphs leave; the counter holds'); M(s, s.end - C.portalLead * B, 'the camera pushes into the counter');
    }
    if (s.out === 'whiteout') M(s, s.end - B, 'the frame exposes to white');
    if (s.out === 'cut') E(s.end, 'impact');
    // T2: the dot's own iris and flood onto another ground are the library's dot-iris, drawn by this template
    if (s.out === 'iris' && groundOf(s) !== groundIn(laid[i + 1])) expressive.push({ t: s.end - B, dur: 1.5 * B, device: 'dot-iris', variant: 'ring', scene: i });
    if (s.out === 'flood' && groundOf(s) !== groundIn(laid[i + 1])) expressive.push({ t: s.end - B, dur: B, device: 'dot-iris', variant: 'flood', scene: i });
    if (s.out === 'scan') expressive.push({ t: s.end - C.scanBeats * B, dur: C.scanBeats * B, device: 'anchor-swap', variant: 'scan', scene: i });
    if (s.out === 'whiteout') expressive.push({ t: s.end - C.slamBeats / 2 * B, dur: C.slamBeats * B, device: 'whiteout-slam', scene: i });
    if (s.out === 'portal') expressive.push({ t: s.end - C.portalLead * B, dur: C.portalBeats * B, device: 'counter-portal', scene: i });
  });

  // The generic dot rests after its last landing in a scene and bounces in place every two beats until it leaves:
  // to hop on (it leaves at the same moment film.js starts the hop), into the bloom, a dot transition or the whiteout
  // (a beat before the end), or on a cut (at the end).
  // A bounce lands on a beat, as late as it can while no still stretch (from one change's settle to the next
  // change's lead) passes two beats; steps and counter own their dot and bounce it the same way after their last
  // landing.
  micro.sort((a, b) => a.t - b.t);
  const cap = C.bounceEvery * B - 0.02;
  laid.forEach((s, i) => {
    if (s.restFrom == null) return;
    const nx = laid[i + 1];
    const hopTo = (tl) => Math.max(s.restFrom + 0.15, tl - Math.min(0.9, (tl - s.restFrom) * 0.7));
    if (!s.ownsRest) {
      let to = s.end;
      if (s.out === 'hop' && nx?.dotIn != null) to = hopTo(nx.dotIn);
      else if (s.out === 'tobloom') to = hopTo(s.end - 0.4 * B);
      else if (DOT_OUT.includes(s.out) || s.out === 'whiteout') to = s.end - B;
      s.restTo = to;
    }
    for (const [from, to] of s.rests ?? [[s.restFrom, s.restTo]]) {
      const inside = micro.filter((m) => m.scene === s.index && m.t > from + 1e-6 && m.t < to - 1e-6);
      const marks = [...inside.map((m) => ({ a: m.t - m.lead, z: m.t + m.settle })), { a: to, z: Infinity }];
      let cur = from + 0.2;
      for (const mk of marks) {
        while (mk.a - cur > cap) {
          // the latest beat whose bounce starts within two beats of cur and ends before the dot leaves
          const j = Math.min(Math.floor((cur + cap + C.bounceSec - s.start) / B + 1e-9), Math.floor((to - C.bounceLeadSec - s.start) / B + 1e-9));
          const b = s.start + j * B;
          if (b - C.bounceSec <= cur + 1e-6) break;
          s.bounces.push(b);
          cur = b + 0.05;
        }
        cur = Math.max(cur, mk.z);
      }
    }
  });
  laid.forEach((s) => s.bounces.forEach((b) => { E(b, 'bounce'); M(s, b, 'the dot bounces in place', { settle: 0.05, lead: C.bounceSec }); }));

  ev.sort((a, b) => a.t - b.t);
  // reading gate, a cross-check of timing.rules.js on the fitted film: every still line holds ≥ 0.3 s per word
  // after it has typed (a glance line ≥ 1 s), the closing URL ≥ 3 s, and every step or swap word that is shown for
  // one beat can be read in that beat
  const slow = [];
  laid.forEach((s) => {
    const beatWords = s.type === 'steps' ? s.stepTexts.slice(0, -1) : s.type === 'swap' ? s.items.slice(0, -1).map((x) => x.text) : [];
    beatWords.forEach((w) => {
      if (readWords(w) * C.wordSec > B - 0.02) slow.push(`scenes[${s.index}] (${s.type}): "${w}" is shown for one beat (${B.toFixed(2)} s) but needs ${(readWords(w) * C.wordSec).toFixed(2)} s; a ${s.type} shows one word a beat`);
    });
    for (const w of [...s.labelWins, ...s.bigWins]) {
      const need = w.url ? C.urlHoldSec : w.glance ? 1.0 : readWords(w.text) * C.wordSec;
      const hold = w.still - (w.tIn + (w.cps ? w.text.length / w.cps : 0));
      if (hold + 1e-6 < need) slow.push(`scenes[${s.index}] (${s.type}): "${w.text}" holds ${hold.toFixed(2)} s, needs ${(need).toFixed(2)} s (timing.rules.js disagrees with plan.js)`);
    }
  });
  if (slow.length) throw new Error('reading time:\n  ' + slow.join('\n  '));

  // ---------- the four tiers ----------
  // holds: only the claim's reading pause is declared. Every other scene runs the ambient camera push (Motion), so
  // no frame of it is ever pixel-still; its T0 changes (words, labels, apertures, the resting dot's bounces) keep
  // every stretch between changes within two beats instead (the bounces above are placed so).
  micro.sort((a, b) => a.t - b.t);
  // T3: name (reveal), claim, closing card (lock-up); the climax is the claim or reveal that sits at 60–85 % of the
  // length (none marked otherwise: check-film warns); a film without a name or a claim marks its opening as the hook
  if (peaks.length < 3 && !laid.some((s) => s.type === 'claim') && laid[0].type !== 'bloom') {
    const first = micro.find((m) => m.scene === 0);
    if (first) peaks.push({ t: first.t, kind: 'hook', scene: 0 });
  }
  // peak times rounded as lib/timing.js tiers() rounds composition starts, so a peak on a scene start falls in it
  peaks.forEach((p) => (p.t = Math.round(p.t * 1e4) / 1e4));
  peaks.sort((a, b) => a.t - b.t);
  const D = T.duration, [clo, chi] = [0.6, 0.85];
  const mid = peaks.filter((p) => (p.kind === 'claim' || p.kind === 'reveal') && p.t / D >= clo && p.t / D <= chi).sort((a, b) => (a.kind === 'claim' ? -1 : 0) - (b.kind === 'claim' ? -1 : 0) || Math.abs(a.t - 0.72 * D) - Math.abs(b.t - 0.72 * D))[0];
  if (mid) mid.climax = true;
  expressive.sort((a, b) => a.t - b.t);
  const tiers = {
    micro: micro.map(({ t, scene, what }) => ({ t, scene, what })),
    holds, shots, expressive, peaks,
  };

  const nameScene = laid.find((s) => s.type === 'name');
  return { g, B, T, duration: T.duration, bars: T.bars, scenes: laid, events: ev, facts: f, drop: nameScene ? nameScene.start : null, tiers };
};
registerPlan(plan);

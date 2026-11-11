// choreo.js — the choreography of every Exhibit scene type: when each thing moves, lands, enters and is read, in
// seconds from the scene's start. One function per type, pure, shared by timing.rules.js (need, events), film.js
// (the picture) and score.mjs (the sound), so picture, sound and the timing table cannot drift. Beats are B
// (the fitted beat in seconds). Text enters word by word at reading pace (wordSec a word), so the picture is never
// still while text is being read; it holds still only after the text has landed.
import { reader } from './lib/timing.js';
import { moveOf } from './moves.js';

export const C = {
  wordSec: 0.3,         // a word enters every 0.3 s, the reading pace (principle 1); its entrance takes 0.15 s
  wordIn: 0.15,
  settle: 0.3,          // a landing holds at least this long before the next move (≥ 0.2 s, principle 5)
  pullAt: 1,            // open: the content holds a beat at the zoom cap, then the camera rises
  capAt: 0.5,           // a caption's first word enters half a beat after the landing before it
  ringStep: 0.5, ringDraw: 1.5, // read: rings start half a beat apart and draw in 1.5 beats
  liftStagger: 0.08,    // the lift-out module's stagger between cells (p)
  noteAt: 1,            // a card's note enters a beat into its reading, or halfway through it when shorter
  back: 1, unring: 0.5, // the readings go back into their cells, then the rings come off (beats before the end)
  ringIn: 1,            // match: the ring draws round the value in 1 beat, then the push, the cut and the pull
  cutAt: 0.5,           // match: the cut, as a share of the move (match-cut's `cut`)
  unringM: 0.5, dimAt: 0.5, dim: 1.5,  // measure: the match's ring comes off, the dimension draws, its chip lands on beat 2
  mcapAt: 2.5,          // measure: the claim enters half a beat after the chip
  pauseMin: 0.75,       // measure: the claim holds at least this long once read (a pause hold)
  rise: 2,              // lockup: the camera rises over the whole desk
  nameAt: 1.5, lineAt: 3, urlCps: 24, // lockup: the name settles by beat 2, its line from beat 3, the address types at 24 characters a second
  urlHold: 3,           // the address holds at least 3 s (principle 1)
};

export const words = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);
// the exhibit the camera is on before scene i
export const exhibitBefore = (scenes, i) => { for (let k = i - 1; k >= 0; k--) if (scenes[k].exhibit) return scenes[k].exhibit; return null; };
// the label of a dimension: '{diff}' and '{ratio}' filled from the two values (computed, principle 2)
export const measureLabel = (s) => {
  const d = (s.b?.value ?? 0) - (s.a?.value ?? 0), r = (s.a?.value ? s.b.value / s.a.value : 0), k = s.digits ?? 1;
  return String(s.label ?? '{diff}').replace('{diff}', `${d >= 0 ? '' : '−'}${Math.abs(d).toFixed(k)}`).replace('{ratio}', Math.abs(r).toFixed(k));
};
// the move a travel scene uses: its own `move`, else content.moves.travel, else the first adapter (parallax-slide)
export const travelMove = (s, content) => moveOf('travel', s.move ?? content?.moves?.travel);
// the chip an exhibit carries ([label, value]) from content.assets
const chipOf = (content, id) => content?.assets?.[id]?.chip ?? null;

const wordTimes = (text, t0) => words(text).map((w, k) => ({ t: t0 + k * C.wordSec, w, k }));

// plan(s, ctx, B, dur): { need, landAt, items (reader input), r (reader result), keys, micro, shots, expressive, peaks,
// spans (moving), handoffs, pause, ...per-type times }. `dur` is the scene's fitted length (undefined at the need).
export const plan = (s, ctx, B, dur, content = ctx?.content ?? {}) => {
  const read = (items) => (ctx?.reading ? ctx.reading(items) : reader(items, { wordSec: C.wordSec }));
  const P = { keys: [], micro: [], shots: [], expressive: [], peaks: [], spans: [], handoffs: [], words: [] };
  const span = (a, b, what) => P.spans.push([a, b, what]);
  const micro = (t, what) => P.micro.push({ t, what });
  const addWords = (text, t0, tag) => { for (const x of wordTimes(text, t0)) { P.words.push({ ...x, tag }); span(x.t, x.t + C.wordIn, `${tag} word`); micro(x.t, `${tag}: "${x.w}"`); } };
  const scenes = ctx?.scenes ?? [];
  const i = ctx?.i ?? 0;
  const moves = content.moves ?? {};
  const prev = exhibitBefore(scenes, i);
  // a landing on an exhibit with a chip: the chip's label (glance) and value (primary) are read from the landing,
  // then the caption; returns the caption's start
  const landed = (at, id, extra = []) => {
    const chip = chipOf(content, id);
    const items = [
      ...(chip ? [{ text: chip[0], tier: 'glance', at }, { text: chip[1], at }] : []),
      ...extra,
      ...(s.caption ? [{ text: s.caption, at: at + C.capAt * B, ...(s.claim ? { claim: true } : {}) }] : []),
    ];
    P.items = items;
    P.r = read(items);
    if (s.caption) {
      const it = P.r.items.find((x) => x.text === s.caption && x.tier !== 'glance');
      P.capAt = it ? it.from : at + C.capAt * B;
      addWords(s.caption, P.capAt, s.claim ? 'claim' : 'caption');
    }
  };

  if (s.type === 'open') {
    const pull = moveOf('open', moves.open);
    P.pull = [C.pullAt * B, (C.pullAt + pull.beats) * B];
    span(...P.pull, 'the camera rises; the mount grows');
    micro(P.pull[0], 'the camera rises');
    P.handoffs.push({ t: P.pull[0] });
    P.landAt = P.pull[1];
    P.keys.push({ t: P.landAt, kind: 'land', what: 'the mount lands' });
    P.shots.push({ t: P.landAt, what: 'the exhibit in its mount' });
    landed(P.landAt, s.exhibit);
    if (s.caption && i === 0) P.peaks.push({ t: P.capAt, kind: 'hook' });
    P.need = Math.max(P.r.done, P.r.glanceDone ?? 0, P.landAt) + C.settle;
    P.device = pull.device;
  }

  if (s.type === 'travel') {
    const mv = travelMove(s, content), o = mv.beats * B;
    P.move = [0, o];
    P.moveId = mv.id;
    span(0, o, `${mv.device}: ${prev} → ${s.exhibit}`);
    micro(0, 'the camera leaves');
    if (mv.device === 'grid-hop') { micro(0.36 * o, 'the whole desk; the ring hops'); micro(0.55 * o, 'the camera dives'); }
    else micro(0.5 * o, 'the camera passes between the prints');
    P.handoffs.push({ t: 0 });
    if (mv.expressive) P.expressive.push({ t: 0, dur: o, device: mv.device, variant: `${prev} → ${s.exhibit}` });
    P.landAt = o;
    P.keys.push({ t: o, kind: 'land', what: 'the camera arrives' });
    P.shots.push({ t: o, what: `${s.exhibit} at rest` });
    landed(o, s.exhibit);
    P.need = Math.max(P.r.done, P.r.glanceDone ?? 0, P.landAt) + C.settle;
    P.device = mv.device;
  }

  if (s.type === 'read') {
    const n = (s.cells || []).length;
    const lift = moveOf('lift', moves.lift);
    P.rings = (s.cells || []).map((c, k) => [C.ringStep * k * B, (C.ringStep * k + C.ringDraw) * B]);
    P.rings.forEach((r, k) => { span(...r, `ring ${k + 1}`); micro(r[0], `ring ${k + 1}`); });
    const Rt = Math.ceil(C.ringStep * (n - 1) + C.ringDraw) * B;
    P.lift = [Rt, Rt + lift.beats * B];
    span(...P.lift, 'lift-out');
    P.handoffs.push({ t: Rt });
    P.expressive.push({ t: Rt, dur: lift.beats * B, device: lift.device, variant: `${s.exhibit}, ${n} cell${n > 1 ? 's' : ''}` });
    P.landAt = P.lift[1];
    P.keys.push({ t: P.landAt, kind: 'land', what: 'the readings land' });
    P.shots.push({ t: P.landAt, what: 'the readings lifted' });
    // each card's label lands as the lift-out widens it (lift-out: 0.98 − 0.75 · stagger · (n − 1 − k) of the move)
    P.labelAt = (s.cells || []).map((c, k) => Rt + lift.beats * B * (0.98 - 0.75 * C.liftStagger * (n - 1 - k)));
    P.labelAt.forEach((t, k) => micro(t, `card ${k + 1} label`));
    micro(Rt + 0.25 * lift.beats * B, 'the values turn to code');
    const cards = (s.cells || []).map((c, k) => ({ text: `${c.value} ${c.label}`, at: P.labelAt[k] }));
    const first = read(cards);
    const capFrom = first.done;
    P.items = [...cards, ...(s.caption ? [{ text: s.caption, at: capFrom, ...(s.claim ? { claim: true } : {}) }] : [])];
    P.reading = first.items.map((it) => [it.from, it.to]);
    P.noteAt = (s.cells || []).map((c, k) => (c.note ? P.reading[k][0] + Math.min(C.noteAt * B, (P.reading[k][1] - P.reading[k][0]) / 2) : null));
    (s.cells || []).forEach((c, k) => { if (c.note) { P.items.push({ text: c.note, tier: 'glance', at: P.noteAt[k] }); span(P.noteAt[k], P.noteAt[k] + C.wordIn, 'note'); micro(P.noteAt[k], `note ${k + 1}`); } });
    if (n > 1) P.reading.forEach(([a], k) => { span(a, a + 0.1, 'reading step'); micro(a, `reading card ${k + 1}`); });
    P.r = read(P.items);
    if (s.caption) { addWords(s.caption, capFrom, s.claim ? 'claim' : 'caption'); P.capAt = capFrom; }
    const done = Math.max(P.r.done, P.r.glanceDone, P.landAt);
    P.need = done + C.settle + (C.back + C.unring) * B;
    const D = dur ?? P.need;
    P.back = [D - (C.back + C.unring) * B, D - C.unring * B];
    P.unring = [D - C.unring * B, D];
    span(...P.back, 'the readings go back'); span(...P.unring, 'the rings come off');
    micro(P.back[0], 'the readings go back'); micro(P.unring[0], 'the rings come off');
    P.shots.push({ t: P.back[0], what: 'the readings go back into the exhibit' });
    if (s.claim) P.peaks.push({ t: P.landAt, kind: 'claim' });
    P.device = lift.device;
  }

  if (s.type === 'match') {
    const mv = moveOf('match', moves.match);
    P.ringIn = [0, C.ringIn * B];
    span(...P.ringIn, 'the ring draws round the value'); micro(0, 'the ring draws round the value');
    P.move = [C.ringIn * B, (C.ringIn + mv.beats) * B];
    P.cut = P.move[0] + C.cutAt * mv.beats * B;
    span(P.move[0], P.cut - 0.05, 'the camera pushes in on the value'); span(P.cut + 0.05, P.move[1], 'the camera pulls back');
    micro(P.move[0], 'the push in'); micro(P.cut, 'the cut: the same value, the next source');
    P.handoffs.push({ t: P.move[0] });
    P.expressive.push({ t: P.move[0], dur: mv.beats * B, device: mv.device, variant: `${prev} → ${s.exhibit}` });
    P.keys.push({ t: P.cut, kind: 'accent', what: 'the cut to the same value in the next source' });
    P.landAt = P.move[1];
    P.keys.push({ t: P.landAt, kind: 'land', what: 'the next source at rest, its value ringed' });
    P.shots.push({ t: P.landAt, what: `${s.exhibit} at rest, the value ringed` });
    landed(P.landAt, s.exhibit);
    P.need = Math.max(P.r.done, P.r.glanceDone ?? 0, P.landAt) + C.settle;
    P.device = mv.device;
  }

  if (s.type === 'measure') {
    const after = ['match'].includes(scenes[i - 1]?.type) && scenes[i - 1]?.exhibit === s.exhibit;
    P.unringM = after ? [0, C.unringM * B] : null;
    if (after) { span(...P.unringM, 'the match ring comes off'); micro(0, 'the ring leaves the value'); }
    P.dim = [C.dimAt * B, (C.dimAt + C.dim) * B];
    span(0, P.dim[0], 'a chip in the way steps aside');
    span(...P.dim, 'the dimension draws'); micro(P.dim[0], 'the dimension draws');
    P.landAt = P.dim[1];
    P.keys.push({ t: P.landAt, kind: 'accent', what: 'the measured gap lands' });
    P.peaks.push({ t: P.landAt, kind: 'reveal' });
    span(P.landAt - 0.2 * B, P.landAt, 'chip');
    span(P.landAt - 0.2 * B, P.landAt + 0.3 * B, 'the rest of the print steps back'); micro(P.landAt - 0.2 * B, 'the print steps back round the gap');
    const capAt = C.mcapAt * B;
    P.items = s.caption ? [{ text: s.caption, at: capAt, ...(s.claim ? { claim: true } : {}) }] : [];
    P.r = read(P.items);
    if (s.caption) { addWords(s.caption, capAt, 'claim'); P.capAt = capAt; }
    const done = Math.max(P.r.done, P.landAt);
    P.pause = !!(s.caption && s.claim);
    P.need = done + Math.max(C.pauseMin, C.settle);
  }

  if (s.type === 'lockup') {
    P.rise = [0, C.rise * B];
    span(...P.rise, 'the camera rises over the desk'); micro(0, 'the camera rises');
    P.expressive.push({ t: 0, dur: C.rise * B, device: 'exhibit-rise', variant: 'over the whole desk' });
    P.keys.push({ t: 0, kind: 'accent', what: 'the rise begins; the music resolves', drop: true });
    P.landAt = P.rise[1];
    P.keys.push({ t: P.landAt, kind: 'land', what: 'the name lands' });
    P.peaks.push({ t: P.landAt, kind: 'lockup' });
    P.name = [C.nameAt * B, C.rise * B];
    span(...P.name, 'the name settles');
    const items = [{ text: s.name, at: P.landAt }];
    if (s.line) items.push({ text: s.line, at: C.lineAt * B });
    const r0 = read(items);
    if (s.line) { P.lineAt = r0.items[1].from; addWords(s.line, P.lineAt, 'line'); }
    P.urlAt = Math.max(r0.done, P.landAt) + 0.1;
    P.urlTyped = P.urlAt + String(s.url || '').length / C.urlCps;
    span(P.urlAt, P.urlTyped, 'the address types'); micro(P.urlAt, 'the address types');
    P.items = [...items, { text: s.url, at: P.urlTyped }];
    P.r = read(P.items);
    P.rule = [P.urlTyped, P.urlTyped + B];
    P.route = [P.rule[1], P.rule[1] + 2 * B];
    span(...P.rule, 'the rule draws'); span(...P.route, 'the route draws');
    micro(P.rule[0], 'the rule draws'); micro(P.route[0], 'the route draws');
    const bar = 4 * B;
    P.need = Math.max(P.r.done, P.route[1]) + Math.max(bar, C.urlHold);
    const D = dur ?? P.need;
    P.last = [D - bar, D - bar + 0.75 * B];
    span(...P.last, 'the last ring'); micro(P.last[0], 'the last ring closes round the address');
    P.keys.push({ t: D - bar, kind: 'end', what: 'second move: the ring closes round the address' });
  }

  // holds: every still stretch of at least 0.2 s after the first landing (the pixels hold still there)
  const D = dur ?? P.need;
  const sp = P.spans.map(([a, b]) => [a, b]).sort((x, y) => x[0] - y[0]);
  const holds = [];
  let cur = P.landAt ?? 0;
  for (const [a, b] of sp) { if (b <= cur) continue; if (a - cur >= 0.2) holds.push({ from: cur, to: a }); cur = Math.max(cur, b); }
  if (D - cur >= 0.2) holds.push({ from: cur, to: D, ...(P.pause ? { pause: true } : {}) });
  P.holds = holds;
  return P;
};

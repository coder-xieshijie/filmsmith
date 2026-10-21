// choreo.js — every scene's choreography as one table of moments, in seconds from the scene's start. The same table
// places the picture (film.js), the sound (score.mjs) and the timing events (timeline.js → renders/timing.json), so a
// stroke, its sound and its key can never drift apart.
//
// Moments are set in beats and converted with B (seconds a beat). Keyed moments (a stroke landing, a sticker pressed,
// a slip laid down, a claim struck) sit on whole beats; entrances and moves may sit on half and quarter beats.

// Durations in seconds (C) or beats (CB), from the mode card's Motion table (references/modes/dossier.md).
export const C = {
  rise: 0.42, stagger: 0.12, settle: 0.25, // words rise out of a mask (expo out), one after another; readable once settled
  sink: 0.2, sinkStagger: 0.02, // words leave upward (power3 in), faster than they came
  veil: 0.3, leader: 0.4, dot: 0.12, stamp: 0.12, // the veil dims the page; the leader draws; a sticker lands (scale 1.1 → 1)
  bandMove: 0.4, exit: 0.35, rule: 0.4, header: 0.3,
  pop: 0.36, popScale: 0.12, // the tail move: the stroke pressed again
};
export const CB = { stroke: 1, deal: 1, turn: 1, slip: 2, stack: 1, lift: 0.5 };
// seconds each kind of moment is in motion (text moments: until their last word lands)
const MOVE = { exit: C.exit, deal: 0.45, move: C.bandMove, veil: C.veil, leader: C.leader, land: C.stamp, stamp: C.stamp,
  header: C.header, tab: C.stamp, lift: 0.25, swap: 0.2, cross: 0.45, rule: C.rule, leave: 0.25, mark: 0.4, end: 0.4 };

// How a sheet arrives. 'open' (the first exhibit, already on the mat), 'deal' (slid onto the file from below),
// 'turn' (the sheet above turns away over an edge in the previous scene's last beat; this one was underneath), or the id
// of a page change registered in changes.js (a frame-level transition of lib/transitions, or a module added there),
// which also runs in the previous scene's last beat.
export const enterOf = (scenes, i) => (i === 0 ? 'open' : scenes[i].type === 'exhibit' ? scenes[i].enter ?? 'deal' : null);
export const isChange = (enter) => enter != null && enter !== 'open' && enter !== 'deal';
// the device id the timing events and the T2 checks name for a page change
export const deviceOf = (enter) => (enter === 'turn' ? 'dossier-page-turn' : enter);
// seconds at the end of scene i taken by the page change into scene i + 1
export const outSec = (scenes, i, B) => (scenes[i + 1] && isChange(enterOf(scenes, i + 1)) ? CB.turn * B : 0);

const wordsOf = (s) => String(s ?? '').split(/\s+/).filter(Boolean);
// the moment the last word of a line has landed (90 % of its rise)
const landOf = (at, text) => at + (wordsOf(text).length - 1) * C.stagger + C.rise * 0.9;
const phrases = (claim) => (Array.isArray(claim) ? claim : [claim]);

// planOf(scenes, i, B) → { a, moments: [{ t, kind, what, sound?, key?, peak?, micro? }], items (reading), marks
// (landings), out, focus } — every t in seconds from the scene's start
export const planOf = (scenes, i, B) => {
  const s = scenes[i];
  const m = [], items = [];
  const at = (beats) => beats * B;
  const TEXT = /^(claim|terms|title|row|figure|caption|url|name): /;
  const mo = (t, kind, what, extra = {}) => {
    const d = extra.beats ? extra.beats * B : TEXT.test(what) ? landOf(t, what.replace(TEXT, '')) - t : MOVE[kind] ?? 0.3;
    m.push({ t, kind, what, micro: true, d, ...extra });
  };
  const out = outSec(scenes, i, B);
  let focus = null; // what the tail move presses: 'band' | 'slip' | 'tab' | null

  if (s.type === 'exhibit') {
    const enter = enterOf(scenes, i);
    const a = enter === 'open' ? 0 : enter === 'deal' ? 1 : 0.25; // beats: the claim's entrance
    if (enter === 'deal') { mo(0, 'exit', 'the sheet before leaves', { sound: 'exit' }); mo(at(0.5), 'deal', 'the exhibit is dealt onto the file', { sound: 'deal' }); }
    if (i > 0) mo(at(enter === 'deal' ? 0.5 : 0), 'header', 'the page in hand changes');
    const strokeAt = Math.ceil(a + 0.5), land = strokeAt + CB.stroke;
    const claimAt = at(a), claim = phrases(s.claim).join(' ');
    mo(claimAt, 'claim', `claim: ${claim}`);
    mo(at(a + 0.5), 'veil', 'the rest of the page dims');
    mo(at(strokeAt), 'stroke', 'the highlighter strikes the claim', { sound: 'stroke', beats: CB.stroke });
    mo(at(land), 'land', 'the stroke lands', { key: i === 0 ? 'accent' : null, peak: i === 0 ? 'hook' : null, sound: i === 0 ? 'land' : null });
    if (s.leader !== false) mo(at(land), 'leader', 'the leader runs to the sticker');
    mo(at(land + 1), 'stamp', 'the exhibit sticker is pressed', { key: 'stamp', sound: 'stamp' });
    mo(at(land + 1.5), 'terms', `terms: ${s.terms}`);
    items.push({ text: claim, at: claimAt + C.settle, claim: true }, { text: s.terms, tier: 'glance', at: at(land + 1.5) + C.settle });
    focus = 'band';
    return { a, moments: m, items, marks: [landOf(claimAt, claim), at(land), at(land + 1) + C.stamp, landOf(at(land + 1.5), s.terms)].sort((x, y) => x - y), out, focus, enter };
  }
  if (s.type === 'claim') {
    mo(0, 'move', 'the band moves to the next claim', { sound: 'move' });
    mo(at(0.25), 'claim', `claim: ${phrases(s.claim).join(' ')}`);
    if (s.leader !== false) mo(at(0.5), 'leader', 'the leader follows the band');
    mo(at(1.5), 'terms', `terms: ${s.terms}`);
    const claim = phrases(s.claim).join(' ');
    items.push({ text: claim, at: at(0.25) + C.settle, claim: true }, { text: s.terms, tier: 'glance', at: at(1.5) + C.settle });
    focus = 'band';
    return { a: 0.25, moments: m, items, marks: [C.bandMove, landOf(at(0.25), claim), landOf(at(1.5), s.terms)], out, focus };
  }
  if (s.type === 'worksheet') {
    mo(0, 'deal', 'the worksheet is dealt beside the exhibit', { sound: 'deal' });
    mo(0, 'header', 'the page in hand changes');
    mo(at(0.75), 'tab', 'its exhibit tab is pressed', { sound: 'tab' });
    let r0 = 1.5;
    const marks = [at(0.5), at(0.75)];
    if (s.carry) {
      mo(at(1), 'lift', 'the figure lifts off the page', { sound: 'lift' });
      mo(at(1 + CB.lift), 'swap', 'the slip is set in code');
      mo(at(1 + CB.lift + 0.6), 'cross', 'the slip crosses to the worksheet');
      mo(at(1 + CB.slip), 'land', 'the slip is laid on the worksheet', { key: 'land', sound: 'land' });
      marks.push(at(1 + CB.slip));
      r0 = 3.5;
    }
    mo(at(r0), 'title', `worksheet: ${s.title}`);
    items.push({ text: s.title, at: at(r0) + C.settle });
    marks.push(landOf(at(r0), s.title));
    s.rows.forEach((r, k) => {
      const t = at(r0 + 0.5 + k * 0.5);
      mo(t, 'row', `row: ${r[0]} ${r[1]}`);
      items.push({ text: `${r[0]} ${r[1]}`, tier: 'glance', at: t + C.settle }); // the rows restate the claims' figures
      marks.push(t + C.rise * 0.9);
    });
    focus = s.carry ? 'slip' : null;
    return { a: 0, moments: m, items, marks, out, focus, slipAt: s.carry ? at(1) : null };
  }
  if (s.type === 'result') {
    const [p0, p1] = phrases(s.claim);
    mo(at(0.5), 'rule', 'the rule under the rows');
    mo(at(1), 'figure', `result: ${s.value}`);
    mo(at(1.5), 'caption', `result: ${s.caption}`);
    mo(at(1.5), 'leave', 'the last claim leaves the mat');
    mo(at(1.75), 'claim', `claim: ${p0}`);
    mo(at(2.25), 'terms', `terms: ${s.terms}`);
    mo(at(3), 'stroke', 'the highlighter strikes the result', { sound: 'stroke', beats: CB.stroke });
    mo(at(4), 'claim', `claim: ${p1}`, { key: 'accent', peak: 'claim', climax: true, sound: 'claim' });
    // the figure and its caption are restated by the claim's second phrase: glance
    items.push({ text: s.value, tier: 'glance', at: at(1) + C.settle }, { text: s.caption, tier: 'glance', at: at(1.5) + C.settle },
      { text: p0, at: at(1.75) + C.settle, claim: true }, { text: s.terms, tier: 'glance', at: at(2.25) + C.settle },
      { text: p1, at: at(4) + C.settle, claim: true });
    return { a: 1.75, moments: m, items, marks: [at(0.5) + C.rule, at(1) + C.rise, at(1.5) + C.rise, landOf(at(1.75), p0), landOf(at(2.25), s.terms), at(4), landOf(at(4), p1)], out, focus: null, pauseFrom: landOf(at(4), p1) };
  }
  if (s.type === 'ledger') {
    const [p0, p1] = phrases(s.claim);
    mo(0, 'exit', 'the sheets leave', { sound: 'exit' });
    mo(0, 'header', 'the page in hand changes');
    mo(at(0.5), 'deal', 'the index is dealt onto the mat', { sound: 'deal' });
    mo(at(1), 'claim', `claim: ${p0}`);
    mo(at(2), 'claim', `claim: ${p1}`);
    items.push({ text: p0, at: at(1) + C.settle, claim: true }, { text: p1, at: at(2) + C.settle, claim: true });
    const marks = [at(1) + C.rise];
    s.rows.forEach((r, k) => {
      const t = at(1.5 + k);
      mo(t, 'tab', `index row ${r[0]}: ${r[1]}`, { sound: 'tab', d: landOf(t, r[1]) - t });
      items.push({ text: r[1], tier: 'glance', at: t + C.settle });
      marks.push(t, landOf(t, r[1]));
    });
    marks.push(landOf(at(2), p1));
    return { a: 1, moments: m, items, marks: marks.sort((x, y) => x - y), out, focus: 'tab' };
  }
  if (s.type === 'lockup') {
    mo(0, 'stack', 'the file slides off the mat', { sound: 'exit' });
    mo(0, 'header', 'the page in hand changes');
    const n = 1;
    if (s.mark) mo(at(0.5), 'mark', 'the mark');
    mo(at(n), 'stroke', 'the highlighter strikes the name', { sound: 'stroke', beats: CB.stroke });
    mo(at(n + 1), 'name', `the name: ${s.name}`, { key: 'accent', peak: 'lockup', sound: 'lockup' });
    mo(at(n + 1.5), 'url', `url: ${s.url}`);
    if (s.caption) mo(at(n + 2), 'caption', `capture line: ${s.caption}`);
    items.push({ text: s.name, at: at(n) + C.settle }, { text: s.url, at: at(n + 1.5) + C.settle });
    if (s.caption) items.push({ text: s.caption, tier: 'glance', at: at(n + 2) + C.settle });
    return { a: n, moments: m, items, marks: [at(n + 1), landOf(at(n + 1.5), s.url)], out: 0, focus: null, urlAt: at(n + 1.5), nameAt: at(n) };
  }
  throw new Error(`scene ${i + 1}: unknown type "${s.type}"`);
};

// Seconds the scene needs: its reading (lib/timing.js ctx.reading), its last landing plus a short settle, the URL's
// 3 s, the page change out.
export const needOf = (scenes, i, B, reading) => {
  const s = scenes[i], p = planOf(scenes, i, B);
  const r = reading(p.items);
  let end = Math.max(r.end, (p.marks.at(-1) ?? 0) + 0.25);
  if (s.type === 'result') end = Math.max(end, p.pauseFrom + 2 * B);
  if (s.type === 'lockup') end = Math.max(end, p.urlAt + C.settle + 3, p.urlAt + 4 * B);
  return end + p.out;
};

// The tail moves (T0): where the grid, a turn's pad or the phrase share leave the last landing holding still over two
// beats, the scene's focus is pressed again on the beat that splits the hold (the stroke, the slip or the last tab
// scales 1 → 1.12 → 1 about its centre in 0.36 s). No new text, nothing moves off its place.
export const popsOf = (scenes, i, B, dur) => {
  const p = planOf(scenes, i, B);
  if (dur == null || !p.focus) return [];
  const m = Math.max(0, ...p.moments.map((x) => x.t + x.d)), stop = dur - p.out, cap = 2 * B;
  const w = stop - m;
  if (w <= cap + 1e-6) return [];
  const n = Math.ceil(w / cap - 1e-9) - 1, out = [];
  for (let j = 1; j <= n; j++) {
    const target = m + (j * w) / (n + 1), prev = out.at(-1) ?? m;
    const ok = (t) => t - prev >= 0.2 && t - prev <= cap + 1e-6 && stop - t >= 0.2 && stop - t <= (n - j + 1) * cap + 1e-6;
    const beats = [Math.round(target / B), Math.floor(target / B), Math.ceil(target / B)].map((k) => k * B);
    out.push(beats.find(ok) ?? target);
  }
  return out;
};

// The still holds, for fit()'s checks (≤ 2 beats; the result's claim ≤ 2 bars, a pause): every gap in which nothing
// on screen moves, from the first landing to the page change out. Each moment is in motion for its `d` seconds (a
// line until its last word lands), a tail move for C.pop.
export const stepsOf = (scenes, i, B, need, dur) => {
  const s = scenes[i], p = planOf(scenes, i, B);
  const stop = (dur ?? need) - p.out;
  const iv = [...p.moments.map((m) => [m.t, m.t + m.d]), ...popsOf(scenes, i, B, dur).map((t) => [t, t + C.pop])].sort((a, b) => a[0] - b[0]);
  const out = [];
  let end = iv.length ? iv[0][1] : 0;
  for (const [a, b] of iv.slice(1)) {
    if (a > end + 1e-6) out.push([end, a]);
    end = Math.max(end, b);
  }
  if (stop > end + 1e-6) out.push([end, stop]);
  return out.map(([a, b]) => (s.type === 'result' && a >= p.pauseFrom - 0.05 ? { still: b - a, pause: true } : b - a));
};

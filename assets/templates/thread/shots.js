// shots.js — choreography shared by film.js (picture), timing.rules.js (length, events) and score.mjs (sound):
// the two volume shots as pure functions of local time, and the chain's timing constants. All times are
// reference seconds u at 120 BPM (one u = two beats); positions are film pixels (1920×1080). gl.js draws the shots.
import { clamp, lerp, smooth } from './lib/motion.js';
import { units } from './lib/timing.js';

export const PITCH = (12 * Math.PI) / 180; // camera looks down 12°: spheres stay round, shadows flatten
const SP = Math.sin(PITCH), CP = Math.cos(PITCH);

// World centre of a primitive whose centre projects to screen (sx, sy) at height Y above the floor.
export const toWorld = (sx, sy, Y) => [sx - 960, Y, (540 - sy - Y * CP) / SP];

// Three spheres as the storyboard panel shows them, and the one they become.
export const SPHERES = [
  { x: 700, y: 610, r: 132 },
  { x: 1220, y: 600, r: 120 },
  { x: 975, y: 380, r: 110 },
];
export const MERGED = { x: 960, y: 560, r: 180 };
export const LINE = { w: 1400, h: 6 }; // the rod the merged sphere squashes into

const ARRIVE = [[0.2, 1.7], [0.27, 1.75], [0.34, 1.65]]; // drift windows per sphere
export const SETTLED = 2.45; // merge time at which every value is exactly final

// Geometry only: where the three primitives are at merge time m (seconds since the shot began, 0..3).
const placed = (m) => {
  m = clamp(m, 0, 3);
  const end = toWorld(MERGED.x, MERGED.y, MERGED.r);
  // squash and rebound after the spheres land: a damped sine that is exactly zero from SETTLED on
  const d = m - 1.7;
  const osc = d > 0 ? -0.26 * Math.exp(-4.2 * d) * Math.sin((2 * Math.PI * d) / 0.52) * (1 - smooth((d - 0.5) / 0.25)) : 0;
  const sy = 1 + osc, sx = 1 / Math.sqrt(sy);
  return SPHERES.map((s, i) => {
    const [a, b] = ARRIVE[i];
    const e = smooth((m - a) / (b - a));
    const r = lerp(s.r, MERGED.r, smooth((m - 0.9) / 0.8));
    const w0 = toWorld(s.x, s.y, s.r);
    const c = [lerp(w0[0], end[0], e), r * sy, lerp(w0[2], end[2], e)];
    return { c, b: [r * sx, r * sy, r * sx], r: r * Math.min(sx, sy) };
  });
};
const dist = (a, b) => Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1], a.c[2] - b.c[2]);
const gap = (m, i, j) => { const p = placed(m); return dist(p[i], p[j]) - p[i].r - p[j].r; };
// Merge time at which spheres i and j first touch (bisection on the drift; computed once, a pure constant).
const touch = (i, j) => {
  let lo = 0, hi = SETTLED;
  if (gap(hi, i, j) > 0) return Infinity;
  for (let n = 0; n < 40; n++) { const mid = (lo + hi) / 2; if (gap(mid, i, j) > 0) lo = mid; else hi = mid; }
  return hi;
};
const T01 = touch(0, 1), T2 = Math.min(touch(0, 2), touch(1, 2));

// The neck. From the moment two surfaces touch, the smooth-min radius rises linearly from 0 to its target over
// NECK_RISE seconds (it was already full before contact, so the spheres fused in about three frames), and fades
// as the centres coincide so the merged body never inflates. Sphere 2 joins the union of 0 and 1 with its own
// radius, timed from its own contact. A small surface tremor (1.5 % of the radius) starts at each contact and
// decays; it is exactly zero from WOBBLE_END, before SETTLED, so the settled sphere matches the squash.
export const NECK = { k: 140, rise: 0.35, fade: 220, wobble: 0.015, decay: 0.3 };
const WOBBLE_END = 2.3;
const neck = (m, tc, d) => NECK.k * clamp((m - tc) / NECK.rise) * smooth(d / NECK.fade);
const tremor = (m, tc) => (m < tc ? 0 : (1 - Math.exp(-(m - tc) / 0.03)) * Math.exp(-(m - tc) / NECK.decay));

// Times inside the merge shot (seconds after it begins, at 120 BPM) that sound and checks can follow:
// the two contacts, the landing squash, the rebound and the exact settle. Computed from the choreography above.
export const MERGE_CUES = { contact: [T01, T2], land: 1.7, rebound: 1.97, settled: SETTLED };

// m: seconds since the shot began (0..3). Returns blob() parameters for gl.js.
export const mergeState = (m) => {
  m = clamp(m, 0, 3);
  const prims = placed(m);
  const k = [neck(m, T01, dist(prims[0], prims[1])), neck(m, T2, Math.min(dist(prims[0], prims[2]), dist(prims[1], prims[2])))];
  const env = (tremor(m, T01) + tremor(m, T2)) * (1 - smooth((m - (WOBBLE_END - 0.4)) / 0.4));
  return { prims, k, wobble: NECK.wobble * MERGED.r * Math.min(1, env), phase: m, flat: 0, box: 0, pitch: PITCH };
};

// The thread's profile (content.js `thread`, mode card "Variants"): 'rule' is a ruled line of even weight with
// square ends (the source film); 'swell' is a swelled rule, SWELL times as thick in the middle and tapering to
// points at both ends, its outline an ellipse (the printers' swelled or English rule; the pointed pen's
// expansion stroke). A swelled line is a sphere squashed flat, so the merge ends on it without a box morph.
export const THREADS = ['rule', 'swell'];
export const SWELL = 2;

// q: 0 (settled sphere) → 1 (a 1400 × 6 rod in the line colour at the sphere's centre, matching the 2D line).
// With thread 'swell' the sphere stays an ellipsoid and flattens into a 1400 × 12 lens (the 2D swelled line).
export const squashState = (q, thread = 'rule') => {
  q = clamp(q, 0, 1);
  const R = MERGED.r;
  const c = toWorld(MERGED.x, MERGED.y, R);
  const sw = thread === 'swell';
  const th = lerp(R, (LINE.h * (sw ? SWELL : 1)) / 2, q);
  const bx = lerp(R, LINE.w / 2, Math.pow(q, 0.8));
  return { prims: [{ c, b: [bx, th, th], r: th }], k: [0, 0], wobble: 0, phase: 0, flat: Math.pow(q, 1.6), box: sw ? 0 : smooth(q / 0.6), pitch: PITCH };
};
export const SQUASH_TIME = 0.42; // seconds from settled sphere to flat rod

// Ink shot: t is the plume's growth (0..1 over the first 2u, exactly as the one-bar shot), z its slow
// evolution. In a longer link the growth eases out with the same slope it had at 2u, settling 15 % wider,
// while z keeps drifting at its own rate, so the ink keeps curling under the words instead of freezing.
export const inkState = (u, dur = 2) => {
  const x = Math.max(0, u) / dur, k = 0.15;
  return { t: x <= 1 ? x : 1 + k * (1 - Math.exp(-(x - 1) / k)), z: x, seed: 3.7 };
};

// ---------- chain constants (u from a link's start, or before its end) ----------

// open: the letters slide into the caret from D − OPEN_OUT; the caret closes by D − 0.05 (no overlap with the word).
export const OPEN_OUT = 0.4;

// Centre names. Each stage is named once, large and centred, on the first link of its stage span whose centre
// has no words of its own (open, word, ink, review and close carry centre text). Per type: u at which the name
// lands (on a beat: a multiple of 0.5) and its baseline; it springs in from u − NAME_IN, holds NAME_HOLD (one
// beat) and leaves in NAME_OUT. A short link moves the landing earlier, still on a beat; `exit` is u the link
// spends on its own exit before D (the merge's squash into the line when no `curves` follows: SQUASH_EXIT).
export const SQUASH_EXIT = 0.45;
export const CENTRE_NAME = { palette: { u: 2.0, y: 330 }, storyboard: { u: 2.0, y: 262 }, merge: { u: 3.0, y: 851 }, curves: { u: 2.0, y: 975 }, tracks: { u: 1.5, y: 282 } };
export const NAME_IN = 0.2, NAME_HOLD = 0.5, NAME_OUT = 0.12;
export const nameAt = (type, D, exit = 0) => Math.max(0.5, Math.min(CENTRE_NAME[type].u, Math.floor((D - exit - NAME_HOLD - NAME_OUT - 0.05) * 2) / 2));
export const nameExit = (type, next) => (type === 'merge' && (!next || next.type !== 'curves') ? SQUASH_EXIT : 0);
// Indices of the links that show their stage name (a link without `stage` continues the previous stage).
export const namedLinks = (scenes) => {
  const out = new Set();
  let cur = null, done = false;
  scenes.forEach((s, i) => {
    if (s.type === 'close') { cur = null; return; }
    const nm = s.stage ? s.stage.name : cur;
    if (nm !== cur) { cur = nm; done = false; }
    if (nm && !done && CENTRE_NAME[s.type]) { out.add(i); done = true; }
  });
  return out;
};

// review: u from the link's start (the flood lands at 0). The particles gather from `gather`; the tiles reveal
// this film's frames one every `tile` (1/16 note) and the counter starts at `sheet`; checks land one per tile
// from `checks`; the counter lands at `counted`; the tiles collapse at `collapse` and the file card lands at
// `card`, readable from `cardText`. film.js draws from these, score.mjs puts its sounds on them, timing.rules.js
// exports them as events.
// `recede`: the flood has retracted into the sheet's gutters by then, two bars after it landed, starting RECEDE
// before (principle 7: a change of ground lasts at most two bars; settled 2026-10-18, see TEMPLATE.md "Settled").
export const REVIEW_CUES = { gather: 0.1, sheet: 2.0, tile: 0.125, checks: 4.0, counted: 5.5, pushEnd: 6.0, collapse: 6.45, card: 6.85, cardText: 7.05, recede: 4.0 };
export const RECEDE = 0.4;

// close: the second move (the caret at the URL's end falls flat into the URL's underline) lands on the downbeat of the
// link's last bar.
export const closeSecondMove = (D) => (D >= 3 ? D - 2 : null);

// ---------- timing API 3 choreography (2026-10-19): the line hands over with the hand-off library ----------
// The four tiers of change (principles 4 and 5): film.js draws from these tables, timing.rules.js declares the same
// times as micro / holds / shots / expressive / peaks, score.mjs puts its sounds on them.

// open: the brief is one or two phrases of at most five words (one reading state each). The caret types the first,
// then falls flat into the line under it; with a second phrase the line rolls up a loop and carries the first phrase
// round and out while the second follows it in (lib/handoffs path-type, 2 beats: the T2 of the head). The line then
// tightens under the last phrase (a T0 that is not new text), contracts back into the caret at its right end, and the
// letters slide into the caret (OPEN_OUT). u from the link's start; K = bpm / 120 turns reading seconds into u.
export const OPEN = { draw: 0.45, type: 1.0, typeMax: 0.6, flatDelay: 0.2, flat: 0.3, loop: 1.0, hug: 0.3, contract: 0.2, lift: 14, radius: 190 };
export const BRIEF_Y = 560; // the brief's baseline; the line under it is centred at BRIEF_Y + OPEN.lift
export const briefPhrases = (brief) => (Array.isArray(brief) ? brief : [brief]).map((x) => String(x ?? '')).filter((x) => x.trim()).slice(0, 2);
const beatUp = (u) => Math.ceil(u * 2 - 1e-9) / 2; // the next beat (0.5 u) at or after u
// phrases: the filled strings; D: the link's length in u (null while fit() sizes it).
export const openPlan = (phrases, K = 1, D = null) => {
  const [p1 = '', p2] = phrases;
  const n1 = p1.length, cps = Math.max(42, n1 / OPEN.typeMax); // characters per u
  const typed = OPEN.type + n1 / cps;
  const read1 = OPEN.type + Math.max(n1 / cps + 0.3 * K, 0.3 * units(p1) * K); // read along the typing
  const flat0 = typed + OPEN.flatDelay, flatEnd = flat0 + OPEN.flat;
  const two = p2 != null;
  const loop0 = two ? beatUp(Math.max(flatEnd + 0.2, read1)) : null; // the loop starts on a beat, with a sound
  const landed = two ? loop0 + OPEN.loop : flatEnd; // the last phrase lies still on the straight line
  const read = two ? landed + 0.3 * units(p2) * K : Math.max(read1, landed);
  const need = Math.max(read, landed + 2 * OPEN.hug + 0.3) + OPEN.contract + OPEN_OUT + 0.05;
  const out0 = D == null ? null : D - OPEN_OUT - OPEN.contract; // the line contracts into the caret
  const hug0 = out0 == null ? null : Math.max(landed + 0.15, (landed + out0 - OPEN.hug) / 2); // halfway through the last hold
  return { cps, typed, read1, flat0, flatEnd, two, loop0, landed, read, need, out0, hug0, last: two ? p2 : p1 };
};

// merge → curves: the merge's centre name sits under the sphere, and when `curves` follows, the squashed rod drops onto
// it and presses it into itself (lib/handoffs rail-press, phase 'press', 1 beat): the stage name becomes the beat ruler.
// u in curves: the rod (squashed by 0.42 u) drops from `drop` to hover 30 px over the name, the press starts at `at` so
// the line lands under the name on the beat (`hit`, p = 0.36 of rail-press's 1-beat press: the slam squashes the word in
// its last two frames, the line then takes the word's weight and recovers), and the curves' own choreography runs
// `shift` u later.
export const PRESS = { drop: 0.45, at: 0.82, dur: 0.5, hit: 1.0, shift: 0.5 }; // drop: the rod drops to hover 30 px over the name
// A merge whose centre name the next link presses: it shows its name and `curves` follows it.
export const pressedName = (scenes, i) => scenes[i]?.type === 'merge' && scenes[i + 1]?.type === 'curves' && namedLinks(scenes).has(i);
export const NAME_UNDER = CENTRE_NAME.merge.y; // the merge's centre name baseline (under the sphere); the ruler's top edge is NAME_UNDER + 6
// curves: the easing curves draw on 1/32 notes, the riders run them and land together on the beat (RIDE)
export const RIDE = { from: 0.95, to: 2.0 };

// close: the line settles where the name's band will be, then thickens into a bar that a blade cuts into the name
// (lib/handoffs rail-press, phase 'cut', 1 beat: the T2 of the lock-up). What is left of the line does not stay under
// the name (an underline there meant nothing: owner review, 2026-10-19): as the name lands
// the band contracts into the caret at the URL's start (`caret` u, the open's caret path run back), the caret types the
// URL, and on the last downbeat it falls flat into the URL's underline (OPEN.flat u, landing on closeSecondMove): the
// line that typed the brief ends as the link. The closing line enters once the caret has passed (`line`).
export const CLOSE = { settle: 0.05, cut: 0.5, cutDur: 0.5, caret: 0.2, line: 1.2, url: 1.2, urlDur: 0.3, gap: 50 };

// review: the card's title, then its spec line typed in three parts (each part one state), then the line runs along
// the card's foot as the export's progress (constant speed, a process), then the card squashes into the line.
export const CARD = { title: 0.2, spec: 0.45, specStep: 0.25, bar: 1.2, barDur: 0.8, squash: 0.35 }; // u after REVIEW_CUES.card; squash: u before the review's end, so the close starts on the line

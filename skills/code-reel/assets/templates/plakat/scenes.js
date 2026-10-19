// scenes.js — the plakat scene registry (timing API 3: the four tiers of change, principles 4 and 5).
//
// Each type has
//   counts / limits  how many items and how many characters each slot takes (checked by planFilm)
//   plan(s, D, k)    pure: the time of every landing inside the scene, in "u" (two beats; one second at 120 BPM), and
//                    what timing.rules.js, score.mjs and the picture share:
//                      cues     [u, kind, opt]  the sound of every landing (also every T0 change, below)
//                      reads    [u, strings, { tier, hold, settle, claim }]  the text read and when it lands: tier
//                               'primary' (default) or 'glance'; hold = s it stays once legible; settle = s from the
//                               landing until it is legible (default 0.25); claim: true marks a claim (8 words)
//                      motion   [u, s]  every move on the page: when it starts and how long it visibly moves (an
//                               out-eased tween is counted for 65 % of its length: the rest is under a pixel). The
//                               still windows between them are the holds (≤ 2 beats; pause holds ≤ 2 bars)
//                      settled  u by which the last landing has come to rest; out  u of its exit before the end
//                      shots    [u, what]  a new composition inside the scene (T1)
//                      peakAt   u of the scene's peak when content marks it one (T3)
//                      pause    [u0, u1]  where a claim is read (its holds may last up to 2 bars)
//                      walk     the hold move that fills a still window past 2 beats (planScene): 'frame' (an ink
//                               frame steps over the page's items in reading order), 'arrow' (the claim's arrow
//                               pushes a gutter); install's cursor blinks on every beat by itself
//   build(api, s, P) browser only: writes the scene's DOM. animate(api, s, P): adds its tweens to the one paused GSAP
//                    timeline. prepare(api, s, P) (async, optional): creates the scene's hand-offs once fonts are
//                    loaded. paint(ctx, t, api, s, P) (optional): draws the scene's own canvas (its first child, HAND) at film time t.
//
// Reading tiers (principle 1, lib/timing.js reader): primary text is read 0.3 s a word, one string after another, and
// enters at most five words at a time (api 3): every multi-part slot enters part by part. Glance text — labels,
// kickers, captions, notes, ids and refs — is at most six words, repeated elsewhere or safe to delete (each type
// names why below); it needs ≥ 1 s fully still and is read in parallel.
//
// Times inside a scene are written in u and converted with api.at(u) = scene.start + u × (120 / bpm), so the
// choreography follows the tempo. Tween durations stay in real seconds. Entrances count from the scene start and
// exits from the scene end, so a longer scene lands at the same moments and carries more hold moves, never a
// longer still. Scene lengths come from timing.rules.js through lib/timing.js fit().

import { grid } from './lib/beat.js';
import { fit, readTime } from './lib/timing.js';
import { createHandoff } from './lib/handoffs/index.js';
import { text as ctext, measure as cmeasure } from './lib/handoffs/util.js';
import { expOut } from './lib/motion.js';
import RULES from './timing.rules.js';
import { ENTER, SLOT_BEATS, AP_BEATS, isColumns, linked, portalTarget, APERTURE_SHAPES } from './devices.js';

// ---------- grid ----------
export const COL = (i) => 96 + (i - 1) * 146; // left edge of column i (1..12): 96 px margins, 122 px columns, 24 px gutters
export const W = (span) => span * 146 - 24; // width of a span of columns

// ---------- type scale (settled 2026-10-18, batch 3) ----------
// Every size comes from one modular scale, 25 × 1.3685ⁿ (25 px, the floor, to 120 px, the page head, in five steps),
// and each page sets three tiers of it: display, body 34, label 25. The 640 numeral, the 400 side numeral and the
// 300 counter are graphics and stay off the scale; so does the chrome. A fitted display line steps down the scale.
export const SERIES = [25, 34, 47, 64, 88, 120, 164, 225, 308, 421];

// ---------- holds (api 3, principle 5) ----------
const V = 0.65; // share of an out-eased tween counted as visible motion
export const HOLD_U = 0.8; // the longest still a hold move leaves, u (the limit is 2 beats = 1 u; the margin is the pixel measure's)
const SET_U = 0.5; // a scene entered by the columns: entrances starting before the shutter has passed are already set behind it

// ---------- exits: they straddle the cut ----------
// Brisk turns (principle 5, 2026-10-18): a scene's exit starts EXIT_LEAD s before its end and runs EXIT s, so the next
// scene's first entrance, on its own start beat, begins while the exit is finishing. Exits take ≤ 2/3 of the entrances
// they answer. Masked type sinks upward through its mask; a page without its own exit is cleared bottom-up by a clip on
// the whole page (leave()). When the next scene's device covers this one (the columns, the portal, the aperture) the
// scene has no exit of its own: it stays at rest until it is covered (planScene `covered`).
export const EXIT = 0.25, EXIT_LEAD = 0.125;
const leave = (api, D) => {
  const { tl, at, sec } = api;
  if (api.scene.last || api.P.covered) return;
  tl.fromTo(sec, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: EXIT, ease: 'power2.in', immediateRender: false }, at(D) - EXIT_LEAD);
};
const LEAVE = (k, s) => (s?.last ? { out: 0, tail: 0 } : { out: EXIT_LEAD / k, tail: EXIT - EXIT_LEAD });

// ---------- form variant (content.form, 2026-10-19) ----------
// 'square' (default): every block, field and wipe is a rectangle on the column grid. 'diagonal': the solid fields
// wider than four columns — the problem's ink bars and full wipe, the claim's field and band, the verify band, the
// install block — lean on one grid diagonal (one column pitch per half content band, 19.2°). Type stays upright.
export const FORMS = ['square', 'diagonal'];
export const LEAN = 146 / 420;
const LEAN_DEG = (Math.atan(LEAN) * 180) / Math.PI;
const isDiag = (s) => s.form === 'diagonal';
const skew = (sign) => `transform:skewX(${(sign * LEAN_DEG).toFixed(4)}deg)`;
const FIELD_OVER = 190;
const CLAIM_EDGE = 814;

// ---------- text ----------
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// *word* → accent span: only for a word that names a person or a decision, only in large type.
export const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="acc">$1</span>');
const plain = (s) => String(s ?? '').replace(/\*/g, '');
const m = (x, y, size, inner, { cls = '', style = '', fit = '', id = '', wstyle = '' } = {}) =>
  `<div class="m"${id ? ` id="${id}"` : ''} style="left:${x}px;top:${y}px;font-size:${size}px;${wstyle}"${fit ? ` data-fit="${fit}"` : ''}><div class="mi ${cls}" style="${style}">${inner}</div></div>`;
const pad2 = (n) => String(n).padStart(2, '0');
const words = (x) => plain(x).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// Page head shared by options / document / matrix / verify / bars: numeral + title at 120 px, caption from column 8.
const pageHead = (s) =>
  m(90, 150, 120, esc(s.num), { cls: 'num ph' }) +
  m(388, 150, 120, esc(s.title), { cls: 'disp ph', fit: '706,88' }) +
  `<div class="abs pcap h ph-cap" style="left:1118px;top:158px;width:706px;font-size:25px" data-lines="2">${esc(s.caption)}</div>` +
  `<div class="rule ph-rule" style="left:96px;top:300px;width:1728px"></div>`;
const pageHeadAnim = (api) => {
  const { at, $, $$, rise, show, grow } = api;
  rise($$('.ph'), at(0), 0.5, 'expo.out', 0.07);
  show($('.ph-cap'), at(0.15), 0.35, { y: 10 });
  grow($('.ph-rule'), at(0.05), 0.6, 'expo.inOut');
};
const pageHeadMotion = (mv) => { mv(0, 0.57); mv(0.15, 0.35); mv(0.05, 0.6, 0.85); };

// Reading pace inside a page, in u: 0.3 s a word (principle 1).
const readU = (k) => (x) => readTime(plain(x)) / k;
const halfBeatUp = (u) => Math.ceil(u * 4 - 1e-9) / 4;
const beatUp = (u) => Math.ceil(u * 2 - 1e-9) / 2;
const G = { tier: 'glance' };
// motion table helper: mv(u, seconds, visible share)
const motionOf = (k) => { const motion = []; return { motion, mv: (u, sec, f = V) => motion.push([u, sec * f]) }; };

const CLAIM_NUDGE = 24, CLAIM_NUDGES = 3;
// A scene drawn partly by a hand-off carries its own canvas as its first child: under its own type, inside its own
// clips (the roll-up exit, the columns), hidden with it.
const HAND = '<canvas class="hand" width="1920" height="1080" data-layout-allow-occlusion style="position:absolute;left:0;top:0;width:1920px;height:1080px"></canvas>';
const FONT = { display: 'Inter Tight', mono: 'IBM Plex Mono' };

// ---------- registry ----------
export const TYPES = {
  // ======== problem: headline that shrinks into the heading of a problem table; ends in a full accent wipe ========
  problem: {
    purpose: 'Hook: one or two headline lines, then a table of what is broken; values flagged by ink bars one per half beat; full-screen accent wipe out.',
    counts: { lines: [1, 2], rows: [1, 4] },
    limits: { lines: 18, 'rows.label': 12, 'rows.value': 12 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      // The second line lands once the first is read (at least 1.5 beats after it); the headline shrinks into the table
      // heading as soon as both are read; rows are paced by reading; the ink flags land one per half beat after the
      // last row is read (a stepped print move, one T0 each).
      const rd = readU(k);
      const lineT = [0.5];
      let read = lineT[0] + 0.25 / k + rd(s.lines[0]);
      if (s.lines[1]) { lineT.push(Math.max(1.25, halfBeatUp(read - 0.25 / k))); read = Math.max(read, lineT[1] + 0.25 / k) + rd(s.lines[1]); }
      const row0 = halfBeatUp(Math.max(lineT[lineT.length - 1] + 0.75, read + 0.15));
      const shrink = row0 - 0.15;
      const rowT = [];
      s.rows.forEach((r, i) => {
        const u = i ? Math.max(rowT[i - 1] + 0.5, halfBeatUp(read - 0.25 / k)) : row0;
        rowT.push(u);
        read = Math.max(read, u + 0.25 / k) + rd(`${r.label} ${r.value}`);
      });
      const bars = Math.max(rowT[rowT.length - 1] + 0.5, halfBeatUp(read));
      // a row's ink flag lands as the next row rises (its value has been read by then); the last once it is read
      const flagT = s.rows.map((_, i) => (i < s.rows.length - 1 ? rowT[i + 1] + 0.1 : bars));
      const wipe = s.last ? null : D - 0.45;
      lineT.forEach((u) => mv(u, 0.7));
      mv(shrink, 0.6, 0.85);
      rowT.forEach((u) => { mv(u, 0.5); mv(u + 0.1 / k, 0.45); mv(u + 0.18 / k, 0.45); });
      flagT.forEach((u) => mv(u, 0.3));
      const cues = [
        ...lineT.map((u) => [u, 'land']),
        ...rowT.map((u) => [u, 'tick']),
        ...flagT.map((u, i) => [u, 'block', { i, ink: true }]),
        ...(wipe == null ? [] : [[wipe, 'wipe', { exit: true }]]),
      ];
      // all primary: the headline lines and each row's label + value (≤ 5 words a state); the row index only numbers them
      const reads = [...lineT.map((u, i) => [u, [s.lines[i]]]), ...rowT.map((u, i) => [u, [s.rows[i].label, s.rows[i].value]])];
      const settled = flagT[flagT.length - 1] + 0.3 / k;
      return { lineT, shrink, rowT, bars, flagT, wipe, cues, reads, settled, out: wipe == null ? 0 : 0.45, motion,
        shots: [[shrink, 'the headline becomes the table heading']], peakAt: lineT[0], walkFrom: settled };
    },
    build(api, s, P) {
      const dg = isDiag(s);
      let h = `<div class="abs pb-head" data-layout-allow-overlap style="left:0;top:0;width:1920px;height:600px;transform-origin:96px 190px">`;
      s.lines.forEach((l, i) => (h += m(96, 186 + i * 186, 164, rich(l), { cls: 'disp pb-l', fit: '1728,120' })));
      h += `</div>`;
      h += `<div class="rule pb-r" style="left:96px;top:430px;width:1728px"></div>`;
      s.rows.forEach((r, i) => {
        const y = 430 + i * 125;
        h += `<div class="abs pb-row" style="left:84px;top:${y + 8}px;width:1752px;height:110px"></div>`;
        h += `<div class="rule pb-r" style="left:96px;top:${y + 125}px;width:1728px"></div>`;
        h += `<div class="abs lbl h pb-i" style="left:96px;top:${y + 48}px">${pad2(i + 1)}</div>`;
        h += m(242, y + 16, 88, esc(r.label), { cls: 'disp pb-lab', fit: `${COL(8) - 242 - 24},64` });
        h += m(1146, y + 34, 47, esc(r.value), { cls: 'pb-val', style: 'font-weight:400;letter-spacing:-0.02em', fit: `660,34` });
        h += `<div class="abs" style="left:1118px;top:${y + 22}px;width:706px;height:80px${dg ? ';' + skew(-1) : ''}"><div class="layer pb-bar" data-layout-allow-overlap style="background:var(--ink)"><div class="abs" style="left:28px;top:12px;font-size:47px${dg ? ';' + skew(1) : ''}"><div class="mi pb-dup" style="font-weight:400;letter-spacing:-0.02em;color:var(--on-ink)">${esc(r.value)}</div></div></div></div>`;
      });
      if (P.wipe != null && !P.covered) h += dg
        ? `<div class="abs pb-wipe" data-accent-field="${-FIELD_OVER},0,${1920 + 2 * FIELD_OVER},1080,${LEAN}" data-layout-allow-overflow style="left:${-FIELD_OVER}px;top:0;width:${1920 + 2 * FIELD_OVER}px;height:1080px;background:var(--accent);transform-origin:0 50%;z-index:20"></div>`
        : `<div class="abs pb-wipe" data-accent-field="0,0,1920,1080" style="left:0;top:0;width:1920px;height:1080px;background:var(--accent);transform-origin:0 50%;z-index:20"></div>`;
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.pb-row'),
    walkInset: 0,
    animate(api, s, P) {
      const { tl, at, $, $$, rise, show, grow, reveal } = api;
      $$('.pb-dup').forEach((d, i) => (d.parentElement.style.fontSize = $$('.pb-val')[i].parentElement.style.fontSize));
      const lines = $$('.pb-l');
      P.lineT.forEach((u, i) => rise(lines[i], at(u), 0.7));
      tl.fromTo($('.pb-head'), { scale: 1, y: 0 }, { scale: 0.5, y: -32, duration: 0.6, ease: 'expo.inOut', immediateRender: false }, at(P.shrink));
      const rules = $$('.pb-r'), labs = $$('.pb-lab'), vals = $$('.pb-val'), idx = $$('.pb-i'), bars = $$('.pb-bar');
      grow(rules[0], at(P.rowT[0]), 0.45, 'expo.out');
      P.rowT.forEach((u, i) => {
        grow(rules[i + 1], at(u) + 0.1, 0.45, 'expo.out');
        rise(labs[i], at(u), 0.5);
        show(idx[i], at(u), 0.2);
        rise(vals[i], at(u) + 0.18, 0.45);
        reveal(bars[i], at(P.flagT[i]), 0.3, 'expo.out', 'x');
      });
      const wipe = $('.pb-wipe');
      if (!wipe) return;
      if (isDiag(s)) gsap.set(wipe, { skewX: -LEAN_DEG });
      tl.set(wipe, { scaleX: 0 }, 0);
      tl.fromTo(wipe, { scaleX: 0 }, { scaleX: 1, duration: 0.45 * api.k, ease: 'expo.inOut', immediateRender: false }, at(P.wipe));
    },
  },

  // ======== claim: accent half (INPUT) beside paper half (OUTPUT), arrow between, product name and one line ========
  claim: {
    purpose: 'The promise as input → output. Accent half = what the human brings. Grows out of the previous full accent wipe, or out of a figure\'s counter.',
    counts: { 'input.lines': [1, 2], 'output.lines': [1, 2] },
    limits: { 'input.label': 10, 'input.lines': 12, 'output.label': 10, 'output.lines': 12, name: 16, desc: 40 },
    walk: 'arrow',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      // Exit: it starts LEAD s before the end and runs on past the cut (tail), overlapping the next entrance.
      const LEAD = 0.15, TAIL = 0.25;
      const out = s.last ? 0 : LEAD / k, exit = D - out;
      // On u 3 the accent half collapses into a band behind the input label (settled 2026-10-18), a new composition.
      const collapse = 3.0;
      const nA = s.input.lines.length + 1, nB = s.output.lines.length + 1;
      mv(0, 0.6, 0.85); mv(0.3, 0.6 + 0.1 * (nA - 1)); mv(0.8, 0.6 + 0.1 * (nB - 1)); mv(1.5, 0.6, 0.85);
      mv(2.0, 0.5); mv(2.5, 0.5); mv(2.75, 0.45); mv(collapse, 0.6, 0.85);
      // A claim that ends the film carries a second move on the downbeat of its last bar (the closing scene's move,
      // lib/timing.js phrase): the output lines sink and the product name rises in their place at 120 px, a lock-up.
      const lock = s.last && D - 2 >= collapse + 1 ? D - 2 : null;
      if (lock != null) { mv(lock, 0.2, 1); mv(lock + 0.1 / k, 0.55); }
      const cues = [
        [0, 'slide'], [0.3, 'land'], [0.8, 'land'], [1.5, 'draw'], [2.0, 'block', { ink: true }], [2.5, 'tick'],
        [collapse, 'slide'],
        ...(lock != null ? [[lock, 'land', { low: true }]] : []),
        ...(s.last ? [] : [[exit, 'slide', { exit: true }]]),
      ];
      // each half's lines enter together (≤ 4 words); the name, then the line. Glance: the two side labels (the
      // halves' colour and the arrow already say which side is which)
      const reads = [[0.3, s.input.lines], [0.3, [s.input.label], G], [0.8, s.output.lines], [0.8, [s.output.label], G], [2.5, [s.name]], [2.75, [s.desc]]];
      return { collapse, lock, exit, cues, reads, settled: Math.max(2.75 + 0.45 / k, collapse + 0.6 / k), out, tail: s.last ? 0 : TAIL, motion,
        shots: [[collapse, 'the accent half collapses into a band'], ...(lock != null ? [[lock, 'the name takes the output side']] : [])],
        peakAt: lock ?? 0, walkFrom: 2.1 };
    },
    build(api, s, P) {
      const dg = isDiag(s);
      let h = dg
        ? `<div class="abs cl-red" data-accent-field="${-FIELD_OVER},0,${1920 + 2 * FIELD_OVER},1080,${LEAN}" data-layout-allow-overflow style="left:${-FIELD_OVER}px;top:0;width:${1920 + 2 * FIELD_OVER}px;height:1080px;background:var(--accent);transform-origin:0 50%"></div>`
        : `<div class="abs cl-red" data-accent-field="0,0,1920,1080" style="left:0;top:0;width:1920px;height:1080px;background:var(--accent);transform-origin:0 50%"></div>`;
      h += m(96, 196, 25, esc(s.input.label), { cls: 'mono cl-a', style: 'font-weight:600;letter-spacing:0.1em;color:var(--on-accent)' });
      const inW = dg ? Math.floor(CLAIM_EDGE + LEAN * (540 - (437 + 136 * (s.input.lines.length - 1))) - 24 - 96) : 820;
      s.input.lines.forEach((l, i) => (h += m(96, 300 + i * 136, 120, esc(l), { cls: 'disp cl-a cl-in', style: 'color:var(--on-accent)', fit: `${inW},96` })));
      h += dg
        ? `<svg class="abs cl-arrow" style="left:96px;top:690px;overflow:visible" width="620" height="90" viewBox="0 0 620 90"><path class="cl-arP" d="M0 45 H576 M536 8 L578 45 L536 82" fill="none" style="stroke:var(--on-accent)" stroke-width="12" stroke-linejoin="miter" /></svg>`
        : `<svg class="abs cl-arrow" style="left:96px;top:690px;overflow:visible" width="800" height="90" viewBox="0 0 800 90"><path class="cl-arP" d="M0 45 H776 M736 8 L778 45 L736 82" fill="none" style="stroke:var(--on-accent)" stroke-width="12" stroke-linejoin="miter" /></svg>`;
      h += m(972, 196, 25, esc(s.output.label), { cls: 'mono cl-b', style: 'font-weight:600;letter-spacing:0.1em;color:var(--grey)' });
      s.output.lines.forEach((l, i) => (h += m(972, 300 + i * 136, 120, esc(l), { cls: 'disp cl-b cl-out', fit: '852,96' })));
      h += `<div class="rule cl-ul" style="left:972px;top:612px;width:852px;height:14px;background:var(--ink)"></div>`;
      h += m(972, 712, 34, esc(s.name), { cls: 'disp cl-c', style: 'letter-spacing:-0.02em', fit: `852,25` });
      h += `<div class="abs pcap h cl-desc" style="left:972px;top:776px;width:820px;font-size:34px;line-height:1.3" data-lines="2">${esc(s.desc)}</div>`;
      if (P.lock != null) h += m(972, 300, 120, esc(s.name), { cls: 'disp cl-lock', fit: '852,88' });
      api.html(h);
    },
    animate(api, s, P) {
      const { tl, at, $, $$, rise, sink, show, grow, draw } = api;
      const red = $('.cl-red');
      const half = isDiag(s) ? (CLAIM_EDGE + FIELD_OVER) / (1920 + 2 * FIELD_OVER) : 0.5;
      if (isDiag(s)) gsap.set(red, { skewX: -LEAN_DEG });
      tl.fromTo(red, { scaleX: 1 }, { scaleX: half, duration: 0.6, ease: 'expo.inOut', immediateRender: false }, at(0));
      rise($$('.cl-a'), at(0.3), 0.6, 'expo.out', 0.1);
      rise($$('.cl-b'), at(0.8), 0.6, 'expo.out', 0.1);
      draw($('.cl-arP'), at(1.5), 0.6, 'power3.inOut');
      grow($('.cl-ul'), at(2.0), 0.5, 'expo.out');
      rise($('.cl-c'), at(2.5), 0.5);
      show($('.cl-desc'), at(2.75), 0.45, { y: 14 });
      if (P.lock != null) {
        sink([...$$('.cl-out'), $('.cl-c')], at(P.lock), 0.2, 0.02); // the name moves up to poster size
        rise($('.cl-lock'), at(P.lock) + 0.1, 0.55, 'expo.out');
      }
      // hold move: the arrow pushes forward one gutter, at most three gutters out, then back to one (planScene fills)
      P.moves.forEach((u, i) => tl.to($('.cl-arrow'), { x: CLAIM_NUDGE * ((i % CLAIM_NUDGES) + 1), duration: 0.35, ease: 'expo.out' }, at(u)));
      {
        const t0 = at(P.collapse), BAND = { top: 172, h: 80 }, DUR = 0.6, EASE = 'expo.inOut';
        tl.to(red, { scaleY: BAND.h / 1080, y: BAND.top + BAND.h / 2 - 540, duration: DUR, ease: EASE }, t0);
        const ease = gsap.parseEase(EASE), bottom = BAND.top + BAND.h;
        const passAt = (y) => { const p = (1080 - y) / (1080 - bottom); let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const mm = (lo + hi) / 2; if (ease(mm) < p) lo = mm; else hi = mm; } return t0 + hi * DUR; };
        const mid = (el) => { const mm = el.closest('.m'); return parseFloat(mm.style.top) + parseFloat(mm.style.fontSize) * 0.5; };
        tl.set($('.cl-arP'), { stroke: api.pal.ink }, passAt(690 + 45));
        $$('.cl-in').forEach((el) => tl.set(el, { color: api.pal.ink }, passAt(mid(el))));
      }
      if (s.last || P.covered) return;
      const x0 = at(P.exit);
      sink([...$$('.cl-a'), ...$$('.cl-b'), $('.cl-c')], x0, 0.2, 0.01);
      tl.to($('.cl-desc'), { opacity: 0, duration: 0.12 }, x0);
      tl.to($('.cl-ul'), { scaleX: 0, transformOrigin: '100% 50%', duration: 0.2, ease: 'power2.in' }, x0 + 0.02);
      tl.to(red, { scaleX: 0, duration: 0.2, ease: 'power2.in' }, x0 + 0.04);
      tl.to($('.cl-arrow'), { opacity: 0, duration: 0.1 }, x0);
    },
  },

  // ======== chapter: 640 px numeral as a graphic + title, ink rule, caption ========
  chapter: {
    purpose: 'Chapter card between pages: 640 px numeral, title, ink rule, caption; the numeral steps 6 px on every beat. The first three in a film arrive by the grid columns (upright, lean, two-phase).',
    counts: {},
    limits: { num: 2, label: 32, title: 8, caption: 40 },
    plan(s, D, k = 1) {
      // glance: the kicker and the caption — the page that follows states the same thing at length
      const reads = [[0.08, [s.label], G], [0.1, [s.title]], [0.3, [s.caption], G]];
      const out = s.last ? 0 : EXIT_LEAD / k;
      // the numeral drifts 6 px a beat, stepped on every beat (api 3: the drift is a T0 the eye and check-film can
      // see; before 2026-10-19 it was a continuous 0.4 px a frame, which a pixel measure reads as still)
      const hops = [];
      for (let u = 0.5; u < D - out - 0.1 + 1e-9; u += 0.5) hops.push(u);
      const { motion, mv } = motionOf(k);
      mv(0, 0.55); mv(0.08, 0.4); mv(0.1, 0.5); mv(0.2, 0.45); mv(0.3, 0.3);
      hops.forEach((u) => mv(u - 0.06 / k, 0.12, 1));
      return { hops, sinkAt: D - EXIT_LEAD / k, cues: [[0, 'land', { low: true }], [0.2, 'block', { ink: true }]], reads, settled: 0.3 + 0.3 / k,
        ...(s.last ? { out: 0, tail: 0 } : { out, tail: EXIT - EXIT_LEAD }), motion, micro: hops.map((u) => [u, 'the numeral steps 6 px']) };
    },
    build(api, s) {
      const left = (s.side || (s.chapterIndex % 2 === 0 ? 'left' : 'right')) === 'left';
      s._left = left;
      let h = '';
      if (left) {
        h += m(72, 150, 640, esc(s.num), { cls: 'num ch-num' }).replace('class="m"', 'class="m ch-numM"');
        h += m(972, 250, 25, esc(s.label), { cls: 'lbl ch-lab', fit: '852,25' });
        h += m(966, 300, 225, esc(s.title), { cls: 'disp ch-t', fit: '858,160' });
        h += `<div class="rule ch-rule" style="left:972px;top:560px;width:852px;height:12px;background:var(--ink)"></div>`;
        h += `<div class="abs cap h ch-cap" style="left:972px;top:600px;width:852px;font-size:34px" data-lines="2">${esc(s.caption)}</div>`;
      } else {
        h += m(1040, 150, 640, esc(s.num), { cls: 'num ch-num', style: 'text-align:right', wstyle: 'width:820px' }).replace('class="m"', 'class="m ch-numM"');
        h += m(96, 250, 25, esc(s.label), { cls: 'lbl ch-lab', fit: '852,25' });
        h += m(90, 300, 225, esc(s.title), { cls: 'disp ch-t', fit: '858,160' });
        h += `<div class="rule ch-rule" style="left:96px;top:560px;width:852px;height:12px;background:var(--ink)"></div>`;
        h += `<div class="abs cap h ch-cap" style="left:96px;top:600px;width:852px;font-size:34px" data-lines="2">${esc(s.caption)}</div>`;
      }
      api.html(h);
    },
    animate(api, s, P) {
      const { tl, at, $, rise, sink, show, grow } = api;
      rise($('.ch-num'), at(0), 0.55, 'expo.out');
      // the drift: 6 px a beat, one step on every beat (0.12 s, landing on the beat)
      P.hops.forEach((u) => tl.to($('.ch-numM'), { x: (s._left ? -6 : 6) * u * 2, duration: 0.12, ease: 'power2.out' }, at(u) - 0.06));
      rise($('.ch-lab'), at(0.08), 0.4);
      rise($('.ch-t'), at(0.1), 0.5, 'expo.out');
      grow($('.ch-rule'), at(0.2), 0.45, 'expo.out');
      show($('.ch-cap'), at(0.3), 0.3, { y: 12 });
      if (s.last || P.covered) return;
      const x0 = at(P.sinkAt), xd = EXIT - 0.06;
      sink([$('.ch-num'), $('.ch-lab'), $('.ch-t')], x0, xd, 0.03);
      tl.to($('.ch-rule'), { scaleX: 0, transformOrigin: '100% 50%', duration: xd, ease: 'power3.in' }, x0 + 0.03);
      tl.to($('.ch-cap'), { opacity: 0, duration: 0.12 }, x0);
    },
  },

  // ======== options: question table, the human's pick fills accent, decision summary, "You confirm." block ========
  options: {
    purpose: 'Decisions the human makes: each question offers two options, the chosen one fills accent; summary + confirm block.',
    counts: { rows: [1, 3], notes: [0, 2] },
    limits: { num: 2, title: 10, caption: 48, heads: 10, 'rows.q': 24, 'rows.options': 16, notes: 36, summary: 24, confirm: 14 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const rd = readU(k);
      let read = 0.25 / k + rd(s.title);
      const rowT = [];
      s.rows.forEach((r, i) => {
        const u = i === 0 ? 0.4 : Math.max(rowT[i - 1] + 1, halfBeatUp(read - 0.25 / k));
        rowT.push(u);
        read = Math.max(read, u + 0.25 / k) + rd(r.q);
      });
      const base = rowT[rowT.length - 1];
      const sum = Math.max(base + 1.25, halfBeatUp(read));
      const P = { rowT, notes: base + 0.9, sum, items: sum + 0.2, confirm: sum + 0.75, ctext: sum + 0.9, tick: sum + 1.25 };
      // glance: page caption, column heads, the options (they restate the alternatives the question names), the
      // notes, the summary label and items (they restate the picks)
      P.reads = [
        [0, [s.title]], [0.15, [s.caption], G], [0.2, s.heads || [], G],
        ...rowT.flatMap((u, i) => [[u, [s.rows[i].q]], [u + 0.25 / k, s.rows[i].options, G]]),
        ...(s.notes?.length ? [[P.notes, s.notes, G]] : []),
        [P.sum, [s.summary || 'Decision summary'], G], [P.items, s.rows.map((r) => r.options[r.pick]), G],
        [P.ctext, [s.confirm || 'You confirm.']],
      ];
      P.settled = P.tick + 0.3 / k;
      Object.assign(P, LEAVE(k, s));
      pageHeadMotion(mv); mv(0.2, 0.35);
      rowT.forEach((u) => { mv(u, 0.6); mv(u + 0.25 / k, 0.33); mv(u + 0.85, 0.32); });
      if (s.notes?.length) mv(P.notes, 0.3);
      mv(P.sum, 0.45, 0.85); mv(P.items, 0.3 + 0.12 * (s.rows.length - 1)); mv(P.confirm, 0.45, 0.85); mv(P.ctext, 0.5); mv(P.tick, 0.3);
      P.motion = motion;
      P.walkFrom = P.settled;
      P.cues = [
        [0, 'land'],
        ...rowT.map((u) => [u, 'tick']),
        ...rowT.map((u, i) => [u + 0.85, 'block', { i }]),
        [P.sum, 'draw'],
        [P.confirm, 'stamp'],
        [P.tick, 'block', { i: 3 }],
      ];
      P.peakAt = P.tick;
      return P;
    },
    build(api, s) {
      let h = pageHead(s);
      const [h0, h1, h2] = s.heads || ['Q', 'Question', 'Options'];
      h += `<div class="abs lbl h op-th" style="left:96px;top:318px">${esc(h0)}</div><div class="abs lbl h op-th" style="left:242px;top:318px">${esc(h1)}</div><div class="abs lbl h op-th" style="left:1264px;top:318px">${esc(h2)}</div>`;
      s.rows.forEach((r, i) => {
        const y = 378 + i * 120;
        h += `<div class="hair op-line" style="left:96px;top:${y + 100}px;width:1728px;height:2px"></div>`;
        h += `<div class="abs mono h op-qi" style="left:96px;top:${y + 18}px;font-size:25px;font-weight:600">Q${i + 1}</div>`;
        h += m(242, y + 10, 34, esc(r.q), { cls: 'op-q', style: 'font-weight:600;letter-spacing:-0.015em', fit: `990,25` });
        r.options.forEach((o, j) => {
          const x = j === 0 ? 1264 : 1556;
          const lab = `<span style="font-size:25px">${esc(o)}</span>`;
          h += `<div class="opt h op-o${i}" style="left:${x}px;top:${y}px">${lab}${j === r.pick ? `<div class="layer op-pick" data-layout-allow-overlap style="background:var(--accent);color:var(--on-accent)">${lab}</div>` : ''}</div>`;
        });
      });
      const ny = 378 + s.rows.length * 120 + 2;
      if (s.notes?.length) {
        h += `<div class="abs mono h op-notes" style="left:242px;top:${ny}px;font-size:25px;white-space:nowrap">${s.notes.map((n) => `<span class="sq" style="width:14px;height:14px"></span>&nbsp; ${esc(n)}`).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}</div>`;
      }
      h += `<div class="box h op-sum" style="left:96px;top:796px;width:1144px;height:140px"><div class="abs lbl" style="left:24px;top:16px">${esc(s.summary || 'Decision summary')}</div>`;
      h += `<div class="abs op-items" style="left:24px;top:62px;display:flex;gap:44px;white-space:nowrap" data-fitrow="1096">`;
      s.rows.forEach((r, i) => (h += `<div class="h op-d" style="font-size:34px;font-weight:700;letter-spacing:-0.03em"><span class="mono grey" style="font-size:25px;font-weight:500;letter-spacing:0">D${i + 1} </span>${esc(r.options[r.pick])}</div>`));
      h += `</div></div>`;
      h += `<div class="abs" style="left:1264px;top:796px;width:560px;height:140px"><div class="fill op-cfill"></div>`;
      h += m(28, 50, 34, esc(s.confirm || 'You confirm.'), { cls: 'disp op-ct', style: `color:var(--on-ink);letter-spacing:-0.02em`, fit: `420,25` });
      h += `<svg class="abs h op-ck" style="left:470px;top:48px" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" style="fill:var(--accent)" /><path class="op-ckP" d="M11 25 L20 34 L37 14" fill="none" style="stroke:var(--on-accent)" stroke-width="6" /></svg></div>`;
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.op-d'),
    animate(api, s, P) {
      const { tl, at, $, $$, rise, show, grow, clipIn, draw, reveal } = api;
      pageHeadAnim(api);
      show($$('.op-th'), at(0.2), 0.25, {}, 'power2.out', 0.05);
      const qi = $$('.op-qi'), q = $$('.op-q'), lines = $$('.op-line'), picks = $$('.op-pick');
      P.rowT.forEach((u, i) => {
        show(qi[i], at(u), 0.2);
        rise(q[i], at(u), 0.5);
        grow(lines[i], at(u), 0.6, 'expo.out');
        show($$(`.op-o${i}`), at(u) + 0.25, 0.25, { y: 10 }, 'power2.out', 0.08);
        reveal(picks[i], at(u + 0.85), 0.32, 'expo.out', 'x');
        tl.set(picks[i].parentElement.querySelector(':scope > span'), { opacity: 0 }, at(u + 0.85) + 0.34);
      });
      if ($('.op-notes')) show($('.op-notes'), at(P.notes), 0.3, { x: -16 });
      clipIn($('.op-sum'), at(P.sum), 0.45, 'expo.inOut');
      show($('.op-sum'), at(P.sum), 0.01);
      show($$('.op-d'), at(P.items), 0.3, { y: 14 }, 'power3.out', 0.12);
      grow($('.op-cfill'), at(P.confirm), 0.45, 'expo.inOut');
      tl.set($('.op-ct'), { opacity: 0 }, 0);
      tl.set($('.op-ct'), { opacity: 1 }, at(P.ctext) - 0.01);
      rise($('.op-ct'), at(P.ctext), 0.5);
      show($('.op-ck'), at(P.tick), 0.12, {}, 'none');
      draw($('.op-ckP'), at(P.tick) + 0.02, 0.28, 'power2.out');
      leave(api, s.D);
    },
  },

  // ======== document: two framed documents fill with numbered cells, a gap-check adds cells, then frozen ========
  document: {
    purpose: 'Artefacts being written and frozen. Fixed four-step rail: check → confirm → freeze → hand-off; labels are slots.',
    counts: { 'left.lines': [1, 6], 'right.groups': [1, 2], 'rail.steps': [4, 4], hashes: [0, 2] },
    limits: { num: 2, title: 10, caption: 48, 'left.title': 12, 'left.label': 26, 'left.lines.k': 3, 'left.lines.text': 26, 'right.title': 12, 'right.label': 26, 'right.groups.label': 20, 'right.groups.prefix': 2, 'right.note': 40, stamp: 8, hashes: 30, 'rail.label': 16, 'rail.steps': 16, 'rail.after': 16 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const groups = s.right.groups;
      // The rail is paced by reading (source spacing 1.25, 0.5, 0.75 u at least); the freeze stays on a whole beat.
      const rd = readU(k), BASE = [1.25, 2.5, 3.0, 3.75];
      let read = 0.25 / k + rd(s.title);
      read = Math.max(read, 0.15 + 0.25 / k) + rd(s.left.title);
      read = Math.max(read, 0.25 + 0.25 / k) + rd(s.right.title);
      const step = [];
      s.rail.steps.forEach((st, j) => {
        let u = Math.max(j ? step[j - 1] + BASE[j] - BASE[j - 1] : BASE[0], halfBeatUp(read - 0.25 / k));
        if (j === 2) u = beatUp(u);
        step.push(u);
        read = Math.max(read, u + 0.25 / k) + rd(st);
      });
      const added = groups.map((g, i) => (g.added ? step[0] + 0.5 + 0.25 * i : null));
      const P = { cells: groups.map((_, i) => 0.6 + 0.35 * i), step, off: step[3] + 0.75, added, note: step[0] + 0.8 };
      // glance: page caption, document labels and lines, group labels, the note, the stamp, the hashes, the rail label
      // and its hand-off (the rail steps say the same in full)
      P.reads = [
        [0, [s.title]], [0.15, [s.caption], G], [0.15, [s.left.title]], [0.15, [s.left.label], G], [0.25, [s.right.title]], [0.25, [s.right.label], G],
        [0.3, [s.rail.label], G], [0.45, s.left.lines.map((l) => [l.k, l.text].filter(Boolean).join(' ')), G],
        ...groups.map((g, i) => [P.cells[i], [g.label], G]),
        ...s.rail.steps.map((st, j) => [P.step[j], [st]]),
        ...(s.right.note ? [[P.note, [s.right.note], G]] : []),
        [P.step[2] + 0.05, [s.stamp || 'FROZEN'], G], [P.step[2] + 0.2, s.hashes || [], G],
        ...(s.rail.after ? [[P.step[3], [s.rail.after], G]] : []),
      ];
      P.settled = P.off;
      Object.assign(P, LEAVE(k, s));
      const nCells = groups.reduce((n, g) => n + g.count + (g.added || 0), 0);
      pageHeadMotion(mv);
      mv(0.15, 0.5, 0.85); mv(0.25, 0.5, 0.85); mv(0.45, 0.2 + 0.09 * (s.left.lines.length - 1)); mv(0.3, 0.25); mv(0.4, 0.46);
      groups.forEach((g, i) => mv(P.cells[i], 0.16 + 0.06 * (g.count - 1)));
      mv(step[0], 1.0 * k, 1); // the scan line
      added.forEach((u, i) => u != null && mv(u, 0.14 + 0.06 * (groups[i].added - 1)));
      if (s.right.note) mv(P.note, 0.25);
      mv(step[1], 0.18 + 0.025 * (nCells - 1), 1);
      mv(step[2], 0.25); mv(step[2] + 0.05 / k, 0.28); mv(step[2] + 0.2 / k, 0.35);
      mv(step[3], 0.08, 1); mv(P.off, 0.08, 1);
      P.motion = motion;
      P.walkFrom = P.off + 0.1;
      P.cues = [
        [0, 'land'], [0.15, 'draw'],
        ...groups.flatMap((g, i) => Array.from({ length: g.count }, (_, j) => [P.cells[i] + (j * 0.06) / k, 'tick', { soft: true }])),
        [P.step[0], 'scan'],
        ...added.filter((u) => u != null).map((u) => [u, 'block']),
        [P.step[1], 'tick'], [P.step[1] + (0.025 * (nCells - 1)) / k, 'tick'],
        [P.step[2] + 0.05, 'stamp'],
        [P.step[3], 'tick'],
      ];
      P.peakAt = P.step[2];
      return P;
    },
    build(api, s) {
      let h = pageHead(s);
      const L = s.left, R = s.right;
      const docHead = (w, title, label) =>
        `<div class="abs" style="left:28px;top:38px;font-size:34px;font-weight:800;letter-spacing:-0.035em;white-space:nowrap">${esc(title)}</div>` +
        `<div class="abs lbl" style="left:30px;top:94px">${esc(label)}</div>` +
        `<div class="hair" style="left:28px;top:140px;width:${w - 60}px;height:2px;background:var(--ink)"></div>` +
        `<div class="abs h dc-stamp" style="left:${w - 28 - 156}px;top:26px;width:156px;height:44px;background:var(--ink)"><div class="abs mono" style="inset:0;display:flex;align-items:center;justify-content:center;color:var(--on-ink);font-size:25px;font-weight:600;letter-spacing:0.08em">${esc(s.stamp || 'FROZEN')}</div></div>`;
      h += `<div class="box dc-doc" style="left:96px;top:340px;width:560px;height:500px">${docHead(560, L.title, L.label)}`;
      let y = 170, dimSeen = false;
      L.lines.forEach((ln) => {
        if (ln.dim && !dimSeen) { y += 20; dimSeen = true; }
        h += `<div class="abs mono h dc-l${ln.dim ? ' grey' : ''}" style="left:30px;top:${y}px;font-size:25px;white-space:pre">${esc(ln.k || '—')}${ln.k && ln.k.length > 2 ? ' ' : '  '}${esc(ln.text)}</div>`;
        y += 50;
      });
      h += `</div>`;
      h += `<div class="box dc-doc" style="left:680px;top:340px;width:706px;height:500px">${docHead(706, R.title, R.label)}`;
      R.groups.forEach((g, gi) => {
        h += `<div class="abs lbl" style="left:30px;top:${166 + 130 * gi}px">${esc(g.label)}</div>`;
        const n = g.count + (g.added || 0);
        for (let j = 0; j < n; j++) {
          const isAdd = j >= g.count;
          const id = `${esc(g.prefix)}${pad2(j + 1)}`;
          h += `<div class="cell h dc-c dc-g${gi}${isAdd ? ' dc-add' : ''}" style="left:${28 + 90 * j}px;top:${204 + 130 * gi}px${isAdd ? ';background:var(--accent);border-color:var(--accent)' : ''}"><span${isAdd ? ' style="color:var(--on-accent)"' : ''}>${id}</span><div class="layer dc-fill" data-layout-allow-overlap style="background:var(--ink);color:var(--on-ink)"><span>${id}</span></div></div>`;
        }
      });
      const addedN = R.groups.reduce((a, g) => a + (g.added || 0), 0);
      if (R.note) h += `<div class="abs mono h dc-note" style="left:30px;top:${166 + 130 * R.groups.length - 2}px;font-size:25px;white-space:nowrap"><span class="sq" style="width:14px;height:14px"></span>&nbsp; ${esc(R.note.replace('{added}', addedN))}</div>`;
      h += `</div>`;
      (s.hashes || []).forEach((x, i) => (h += `<div class="abs mono h dc-sha grey" style="left:${i ? 680 : 96}px;top:858px;font-size:25px;white-space:pre">${esc(x)}</div>`));
      h += `<div class="rule dc-scan" style="left:80px;top:340px;width:1322px;height:4px;background:var(--accent);opacity:0"></div>`;
      h += `<div class="abs lbl h dc-rl" style="left:1410px;top:340px">${esc(s.rail.label)}</div>`;
      s.rail.steps.forEach((st, k) => {
        const last = k === s.rail.steps.length - 1;
        h += `<div class="abs h dc-step" style="left:1410px;top:${392 + 110 * k}px;width:414px;height:${last ? 118 : 100}px"><div class="hair" style="left:0;top:0;width:414px;height:2px;background:var(--ink)"></div><div class="abs dc-mk" style="left:0;top:26px;width:28px;height:28px;border:2px solid var(--ink)"></div><div class="abs" style="left:48px;top:20px;font-size:34px;font-weight:650;letter-spacing:-0.02em;line-height:1.1;width:366px" data-lines="2">${esc(st)}</div>${last && s.rail.after ? `<div class="abs mono grey" style="left:48px;top:66px;font-size:25px">${esc(s.rail.after)}</div>` : ''}</div>`;
      });
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.dc-step'),
    animate(api, s, P) {
      const { tl, at, $, $$, show, clipIn, reveal, pal } = api;
      pageHeadAnim(api);
      const docs = $$('.dc-doc');
      clipIn(docs[0], at(0.15), 0.5, 'expo.inOut', 'inset(0% 0% 100% 0%)');
      clipIn(docs[1], at(0.25), 0.5, 'expo.inOut', 'inset(0% 0% 100% 0%)');
      show($$('.dc-l'), at(0.45), 0.2, { x: -12 }, 'power2.out', 0.09);
      s.right.groups.forEach((g, gi) => show($$(`.dc-g${gi}:not(.dc-add)`), at(P.cells[gi]), 0.16, { y: 8 }, 'power2.out', 0.06));
      show($('.dc-rl'), at(0.3), 0.25);
      show($$('.dc-step'), at(0.4), 0.25, { x: 16 }, 'power2.out', 0.07);
      const mk = $$('.dc-mk');
      const on = (el, u) => tl.to(el, { backgroundColor: pal.accent, borderColor: pal.accent, duration: 0.08 }, at(u));
      const off = (el, u) => tl.to(el, { backgroundColor: pal.ink, borderColor: pal.ink, duration: 0.08 }, at(u));
      on(mk[0], P.step[0]);
      const scan = $('.dc-scan');
      tl.fromTo(scan, { opacity: 1, y: 0 }, { opacity: 1, y: 496, duration: 1.0 * api.k, ease: 'none', immediateRender: false }, at(P.step[0]));
      tl.to(scan, { opacity: 0, duration: 0.08 }, at(P.step[0] + 1.0));
      s.right.groups.forEach((g, gi) => { if (P.added[gi] != null) show($$(`.dc-g${gi}.dc-add`), at(P.added[gi]), 0.14, { scale: 1.4 }, 'back.out(3)', 0.06); });
      if ($('.dc-note')) show($('.dc-note'), at(P.note), 0.25, { x: -12 });
      off(mk[0], P.step[1]); on(mk[1], P.step[1]);
      reveal($$('.dc-fill'), at(P.step[1]), 0.18, 'power2.out', 'y', 0.025);
      off(mk[1], P.step[2]); on(mk[2], P.step[2]);
      tl.to(docs, { borderWidth: 7, duration: 0.25, ease: 'expo.out' }, at(P.step[2]));
      show($$('.dc-stamp'), at(P.step[2] + 0.05), 0.2, { scale: 1.3 }, 'expo.out', 0.08);
      show($$('.dc-sha'), at(P.step[2] + 0.2), 0.25, { y: 8 }, 'power2.out', 0.1);
      off(mk[2], P.step[3]); on(mk[3], P.step[3]);
      off(mk[3], P.off);
      leave(api, s.D);
    },
  },

  // ======== matrix: steps × milestones; an accent cursor frame moves cell by cell, cells fill ink on half beats ========
  matrix: {
    purpose: 'Work done in a fixed loop: rows are steps, columns are milestones; side numeral; two-statement strip below.',
    counts: { cols: [2, 3], rows: [2, 4], strip: [0, 2] },
    limits: { num: 2, title: 10, caption: 48, corner: 18, cols: 4, rows: 18, done: 7, 'side.label': 12, 'side.big': 2, 'side.caption': 22, 'strip.text': 24, 'strip.note': 24 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const N = s.cols.length * s.rows.length;
      // the step rows enter one per half beat (each its own state); the cells fill on half beats after them
      const rowT = s.rows.map((_, i) => 0.15 + 0.25 * i);
      const cellT = Array.from({ length: N }, (_, j) => 0.6 + 0.25 * j);
      const end = cellT[N - 1];
      const rd = readU(k);
      let read = 0.25 / k + rd(s.title);
      s.rows.forEach((r, i) => (read = Math.max(read, rowT[i] + 0.25 / k) + rd(r)));
      const stT = [];
      (s.strip || []).forEach((x, i) => {
        const u = Math.max(i ? stT[i - 1] + 0.35 : end + 0.15, halfBeatUp(read - 0.25 / k));
        stT.push(u);
        read = Math.max(read, u + 0.25 / k) + rd(x.text);
      });
      const st = stT[0] ?? end + 0.15;
      const P = { rowT, cellT, end, strip: st - 0.1, st, stT, ssT: stT.map((u) => u + 0.25), curOff: end + 0.3 };
      const ns = s.strip?.length || 0;
      // primary: title, step rows, the side numeral, the strip lines. Glance: page caption, corner, milestone heads,
      // the cells' done labels (the fill shows it), the side label and caption, the strip notes
      P.reads = [
        [0, [s.title]], [0.15, [s.caption], G], [0.1, [s.corner, ...s.cols], G], ...rowT.map((u, i) => [u, [s.rows[i]]]), [0.3, [s.side.label], G],
        [0.35 + 0.1 / k, [s.side.big]], [0.6, [s.side.caption], G], [cellT[0], [s.done || 'DONE'], G],
        ...(s.strip || []).flatMap((x, i) => [[stT[i], [x.text]], [stT[i] + 0.25, [x.note], G]]),
      ];
      P.settled = Math.max(end + 0.3 / k, ns ? P.ssT[ns - 1] + 0.25 / k : 0);
      Object.assign(P, LEAVE(k, s));
      pageHeadMotion(mv); mv(0.1, 0.3); rowT.forEach((u) => mv(u, 0.45)); mv(0.3, 0.25, 1); mv(0.35, 0.6); mv(0.6, 0.3);
      cellT.forEach((u) => { mv(u - 0.1 / k, 0.1, 1); mv(u, 0.2); });
      s.cols.forEach((_, c) => mv(cellT[c * s.rows.length + s.rows.length - 1] + 0.1 / k, 0.3));
      if (ns) { mv(P.strip, 0.5); stT.forEach((u, i) => { mv(u, 0.5); mv(P.ssT[i], 0.25); }); }
      mv(P.curOff, 0.1, 1);
      P.motion = motion;
      P.walkFrom = P.settled;
      P.cues = [
        [0, 'land'], ...rowT.slice(1).map((u) => [u, 'tick', { soft: true }]), [0.35, 'land', { low: true }],
        ...cellT.map((u, j) => [u, 'count', { i: j % s.rows.length, n: s.rows.length }]),
        ...s.cols.map((_, c) => [cellT[c * s.rows.length + s.rows.length - 1] + 0.1, 'block', { i: c }]),
        ...P.stT.map((u) => [u, 'tick']),
      ];
      return P;
    },
    build(api, s) {
      let h = pageHead(s);
      const cx = (c) => COL(5 + 2 * c);
      h += `<div class="abs lbl h mx-th" style="left:96px;top:340px">${esc(s.corner || '')}</div>`;
      s.cols.forEach((c, i) => {
        h += `<div class="abs h mx-th" style="left:${cx(i)}px;top:336px;font-size:34px;font-weight:800;letter-spacing:-0.03em">${esc(c)}</div>`;
        h += `<div class="rule mx-mu" style="left:${cx(i)}px;top:382px;width:268px;height:8px;background:var(--accent)"></div>`;
      });
      s.rows.forEach((r, i) => (h += m(96, 419 + 90 * i, 34, esc(r), { cls: 'mx-rl', style: 'font-weight:600;letter-spacing:-0.02em', fit: `${cx(0) - 96 - 24},25` })));
      s.cols.forEach((c, ci) => s.rows.forEach((_, ri) => {
        h += `<div class="box mx-c" style="left:${cx(ci)}px;top:${409 + ri * 90}px;width:268px;height:72px"><div class="fill"></div><div class="abs mono mx-done" style="inset:0;display:flex;align-items:center;justify-content:center;font-size:25px;font-weight:600;color:var(--on-ink);opacity:0;letter-spacing:0.1em;white-space:nowrap">${esc(c)} ${esc(s.done || 'DONE')}</div></div>`;
      }));
      h += `<div class="abs mx-cur" style="left:${cx(0)}px;top:409px;width:268px;height:72px;border:5px solid var(--accent);opacity:0"></div>`;
      const sx = COL(5 + 2 * s.cols.length);
      h += `<div class="abs lbl h mx-ol" style="left:${sx}px;top:340px">${esc(s.side.label)}</div>`;
      h += m(sx - 6, 380, 400, esc(s.side.big), { cls: 'num mx-one', fit: `${1824 - sx + 40},240` });
      h += `<div class="abs pcap h mx-oc" style="left:${sx}px;top:720px;width:268px;font-size:25px" data-lines="2">${esc(s.side.caption)}</div>`;
      (s.strip || []).forEach((st, i) => {
        const x = i ? 972 : 96;
        h += `<div class="rule mx-sr" style="left:${x}px;top:800px;width:852px;height:4px"></div>`;
        h += m(x, 832, 34, esc(st.text), { cls: 'mx-st', style: 'font-weight:750;letter-spacing:-0.03em', fit: `840,25` });
        h += `<div class="abs mono h mx-ss grey" style="left:${x}px;top:890px;font-size:25px;white-space:nowrap">${esc(st.note)}</div>`;
      });
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.mx-rl').map((e) => e.closest('.m')),
    animate(api, s, P) {
      const { tl, at, $, $$, rise, show, grow } = api;
      pageHeadAnim(api);
      show($$('.mx-th'), at(0.1), 0.2, { y: 8 }, 'power2.out', 0.06);
      $$('.mx-rl').forEach((el, i) => rise(el, at(P.rowT[i]), 0.45, 'expo.out'));
      const cells = $$('.mx-c');
      tl.set(cells, { opacity: 0 }, 0);
      tl.fromTo(cells, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.025, immediateRender: false }, at(0.3));
      show($('.mx-ol'), at(0.3), 0.2);
      rise($('.mx-one'), at(0.35), 0.6, 'expo.out');
      show($('.mx-oc'), at(0.6), 0.3, { y: 10 });
      const cur = $('.mx-cur'), R = s.rows.length, mu = $$('.mx-mu');
      tl.set(mu, { scaleX: 0 }, 0);
      tl.set(cur, { opacity: 1 }, at(0.55));
      P.cellT.forEach((u, j) => {
        const c = Math.floor(j / R), r = j % R, cell = cells[c * R + r];
        tl.to(cur, { x: COL(5 + 2 * c) - COL(5), y: r * 90, duration: 0.1, ease: 'power2.out' }, at(u) - 0.1);
        grow(cell.querySelector('.fill'), at(u), 0.18, 'power2.out');
        show(cell.querySelector('.mx-done'), at(u) + 0.08, 0.12);
        if (r === R - 1) tl.fromTo(mu[c], { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'expo.out', immediateRender: false }, at(u) + 0.1);
      });
      tl.to(cur, { opacity: 0, duration: 0.1 }, at(P.curOff));
      if ($$('.mx-sr').length) {
        grow($$('.mx-sr'), at(P.strip), 0.5, 'expo.out');
        $$('.mx-st').forEach((el, i) => rise(el, at(P.stT[i]), 0.5, 'expo.out'));
        $$('.mx-ss').forEach((el, i) => show(el, at(P.ssT[i]), 0.25, { y: 6 }, 'power2.out'));
      }
      leave(api, s.D);
    },
  },

  // ======== verify: who checks (two boxes), a list that passes row by row, a whole-number counter, an accent stop band ========
  verify: {
    purpose: 'Independent check: rows pass one per half beat while the counter steps in whole numbers to n/n; ends on an accent rule band.',
    counts: { rows: [3, 7] },
    limits: { num: 2, title: 10, caption: 48, 'from.label': 18, 'from.title': 18, link: 28, 'to.label': 18, 'to.title': 16, 'to.note': 34, blind: 34, heads: 14, 'rows.id': 4, 'rows.ref': 28, 'rows.result': 6, 'counter.label': 12, 'counter.caption': 40, 'band.a': 20, 'band.b': 20 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const n = s.rows.length;
      const passT = s.rows.map((_, i) => 1.25 + 0.25 * i);
      const pe = passT[n - 1];
      const P = { passT, flash: pe + 0.25, unflash: pe + 0.4, blind: pe + 0.5, band: pe + 0.75 };
      P.bt = P.band + 0.25;
      // primary: title, both box titles, the counter's n/N, the band. Glance: page caption, box labels, the head link
      // and the note, column heads, every row's check (the counter states the outcome; the rows are evidence to scan),
      // the counter label and caption, and the blind-spot line (safe to delete: the band carries the page's point)
      P.reads = [
        [0, [s.title]], [0.15, [s.caption], G], [0.15, [s.from.title]], [0.15, [s.from.label], G], [0.5, [s.link], G],
        [0.9, [s.to.title]], [0.9, [s.to.label, s.to.note], G], [0.3, s.heads || [], G],
        ...s.rows.map((r, i) => [passT[i], [r.ref], G]), [0.6, [s.counter.label], G], [1.0, [s.counter.caption], G],
        [P.flash, [`${n}/${n}`]], ...(s.blind ? [[P.blind, [s.blind], G]] : []), [P.bt, [s.band.a]], [P.bt + 0.35, [s.band.b]],
      ];
      P.settled = P.bt + 0.35 + 0.55 / k;
      Object.assign(P, LEAVE(k, s));
      pageHeadMotion(mv); mv(0.15, 0.3); mv(0.45, 0.3); mv(0.5, 0.25); mv(0.7, 0.4, 0.85); mv(0.9, 0.37); mv(0.3, 0.2);
      mv(0.35, 0.4 + 0.04 * (n - 1)); mv(0.4, 0.2 + 0.04 * (n - 1)); mv(0.5, 0.2 + 0.04 * (n - 1)); mv(0.6, 0.2); mv(0.7, 0.3); mv(0.8, 0.3); mv(1.0, 0.3);
      passT.forEach((u) => mv(u, 0.15, 1));
      mv(P.flash, 0.04, 1); mv(P.unflash, 0.04, 1); if (s.blind) mv(P.blind, 0.3); mv(P.band, 0.5, 0.85); mv(P.bt, 0.55); mv(P.bt + 0.35, 0.55);
      P.motion = motion;
      P.walkFrom = P.settled;
      P.cues = [
        [0, 'land'], [0.7, 'block', { ink: true }],
        ...passT.map((u, i) => [u, 'count', { i, n }]),
        [P.flash, 'block', { i: 2 }],
        [P.band, 'wipe'], [P.bt, 'land'], [P.bt + 0.35, 'land'],
      ];
      P.peakAt = P.band;
      return P;
    },
    build(api, s) {
      let h = pageHead(s);
      h += `<div class="box h vf-A" style="left:96px;top:340px;width:560px;height:110px;border-style:dashed"><div class="abs lbl" style="left:24px;top:18px">${esc(s.from.label)}</div><div class="abs" style="left:24px;top:50px;font-size:34px;font-weight:700;letter-spacing:-0.025em;white-space:nowrap">${esc(s.from.title)}</div></div>`;
      h += `<div class="rule vf-v1" style="left:210px;top:450px;width:2px;height:70px;transform-origin:50% 0"></div>`;
      h += `<div class="abs mono h vf-head" style="left:240px;top:468px;font-size:25px;white-space:pre">${esc(s.link)}</div>`;
      h += `<div class="abs" style="left:96px;top:520px;width:560px;height:150px"><div class="fill vf-Bf"></div><div class="abs lbl h vf-Bt" style="left:24px;top:20px;color:var(--on-ink)">${esc(s.to.label)}</div><div class="abs h vf-Bt" style="left:24px;top:56px;font-size:34px;font-weight:800;letter-spacing:-0.03em;color:var(--on-ink);white-space:nowrap">${esc(s.to.title)}</div><div class="abs mono h vf-Bt" style="left:24px;top:108px;font-size:25px;color:var(--on-ink);white-space:nowrap">${esc(s.to.note)}</div></div>`;
      if (s.blind) h += `<div class="abs h vf-bl" style="left:96px;top:692px;font-size:34px;font-weight:650;letter-spacing:-0.02em;white-space:nowrap"><span class="sq" style="width:18px;height:18px"></span>&nbsp; ${esc(s.blind)}</div>`;
      const [ha, hb] = s.heads || ['Requirement', 'Result'];
      h += `<div class="abs lbl h vf-th" style="left:680px;top:340px">${esc(ha)}</div><div class="abs lbl h vf-th" style="left:1264px;top:340px">${esc(hb)}</div>`;
      s.rows.forEach((r, i) => {
        const y = 380 + i * 52;
        h += `<div class="abs vf-row" style="left:668px;top:${y + 2}px;width:730px;height:48px"></div>`;
        h += `<div class="hair vf-hl" style="left:680px;top:${y + 50}px;width:706px;height:2px"></div>`;
        h += `<div class="abs mono h vf-rid" style="left:680px;top:${y + 10}px;font-size:25px;font-weight:600">${esc(r.id)}</div>`;
        h += `<div class="abs mono grey h vf-rv" style="left:800px;top:${y + 10}px;font-size:25px;white-space:nowrap">${esc(r.ref)}</div>`;
        h += `<div class="abs vf-pass" style="left:1264px;top:${y + 8}px;width:122px;height:36px"><div class="fill"></div><div class="abs mono" style="inset:0;display:flex;align-items:center;justify-content:center;font-size:25px;font-weight:600;color:var(--on-ink)">${esc(r.result)}</div></div>`;
      });
      h += `<div class="abs lbl h vf-cl" style="left:1556px;top:340px">${esc(s.counter.label)}</div>`;
      h += `<div class="abs num h vf-n" style="left:1546px;top:392px;font-size:300px">0</div>`;
      h += `<div class="abs num h vf-of" style="left:1712px;top:532px;font-size:120px">/${s.rows.length}</div>`;
      h += `<div class="abs mono h vf-cs" style="left:1556px;top:660px;font-size:25px;width:268px;line-height:1.4" data-lines="3">${esc(s.counter.caption)}</div>`;
      const bo = isDiag(s) ? Math.ceil(LEAN * 80) : 0;
      h += bo
        ? `<div class="abs vf-band" data-accent-field="${-bo},780,${1920 + 2 * bo},160,${LEAN}" data-layout-allow-overflow style="left:${-bo}px;top:780px;width:${1920 + 2 * bo}px;height:160px;background:var(--accent);transform-origin:0 50%"></div>`
        : `<div class="abs vf-band" data-accent-field="0,780,1920,160" style="left:0;top:780px;width:1920px;height:160px;background:var(--accent);transform-origin:0 50%"></div>`;
      h += m(96, 841, 34, esc(s.band.a), { cls: 'disp vf-bt', style: `color:var(--on-accent);letter-spacing:-0.02em`, fit: `840,25` });
      h += m(972, 841, 34, esc(s.band.b), { cls: 'disp vf-bt', style: `font-weight:800;color:var(--on-accent);letter-spacing:-0.02em`, fit: `852,25` });
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.vf-row'),
    walkInset: 0,
    animate(api, s, P) {
      const { tl, at, $, $$, rise, show, grow, pal } = api;
      pageHeadAnim(api);
      show($('.vf-A'), at(0.15), 0.3, { x: -16 });
      grow($('.vf-v1'), at(0.45), 0.3, 'power2.out', 'scaleY');
      show($('.vf-head'), at(0.5), 0.25, { x: -10 });
      grow($('.vf-Bf'), at(0.7), 0.4, 'expo.inOut');
      show($$('.vf-Bt'), at(0.9), 0.25, { y: 8 }, 'power2.out', 0.06);
      show($$('.vf-th'), at(0.3), 0.2);
      grow($$('.vf-hl'), at(0.35), 0.4, 'expo.out', 'scaleX', 0.04);
      show($$('.vf-rid'), at(0.4), 0.2, { x: -8 }, 'power2.out', 0.04);
      show($$('.vf-rv'), at(0.5), 0.2, { x: -8 }, 'power2.out', 0.04);
      const pass = $$('.vf-pass');
      tl.set(pass, { opacity: 0 }, 0);
      show($('.vf-cl'), at(0.6), 0.2);
      show($('.vf-n'), at(0.7), 0.3, { y: 20 });
      show($('.vf-of'), at(0.8), 0.3, { y: 20 });
      show($('.vf-cs'), at(1.0), 0.3);
      const n = $('.vf-n');
      tl.set(n, { textContent: '0' }, 0);
      P.passT.forEach((u, i) => {
        tl.set(pass[i], { opacity: 1 }, at(u));
        grow(pass[i].querySelector('.fill'), at(u), 0.15, 'power2.out');
        tl.set(n, { textContent: String(i + 1) }, at(u));
      });
      tl.set(n, { color: pal.accent }, at(P.flash));
      tl.set(n, { color: pal.ink }, at(P.unflash));
      if ($('.vf-bl')) show($('.vf-bl'), at(P.blind), 0.3, { y: 8 });
      if (isDiag(s)) gsap.set($('.vf-band'), { skewX: -LEAN_DEG });
      grow($('.vf-band'), at(P.band), 0.5, 'expo.inOut');
      tl.set($$('.vf-bt'), { opacity: 0 }, 0);
      tl.set($$('.vf-bt'), { opacity: 1 }, at(P.bt) - 0.01);
      rise($$('.vf-bt'), at(P.bt), 0.55, 'expo.out', 0.35 * api.k);
      leave(api, s.D);
    },
  },

  // ======== flow: a line of nodes, humans in accent at both ends; bracket, loop back, a rule and a list ========
  flow: {
    purpose: 'The whole system as one line: human → steps → human. An ink frame walks the line on the beat while the page holds.',
    counts: { nodes: [3, 6] },
    limits: { title: 26, 'nodes.name': 11, 'nodes.note': 13, bracket: 48, loop: 44, statement: 36, list: 60 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const n = s.nodes.length;
      const nodeT = s.nodes.map((_, i) => 0.35 + 0.25 * i);
      // after the last node: the bracket, the loop back, then the rule and the statement (one landing a half beat or so)
      const nb = nodeT[n - 1] + 0.4;
      const P = { nodeT, bracket: nb, brL: nb + 0.2, loop: nb + 0.5, loopL: nb + 0.85, loopH: nb + 1.25, r2: nb + 1.1, st: nb + 1.2, list: nb + 1.6 };
      // primary: title, the human nodes, the statement. Glance: the steps between (name + note), the human nodes'
      // notes, bracket, loop and list (the statement and the line itself carry the point)
      P.reads = [
        [0, [s.title]],
        ...s.nodes.flatMap((nd, i) => (nd.human ? [[nodeT[i], [nd.name]], [nodeT[i], [nd.note], G]] : [[nodeT[i], [`${nd.name} ${nd.note}`], G]])),
        [P.brL, [s.bracket], G], [P.loopL, [s.loop], G], [P.st, [s.statement]], [P.list, [s.list], G],
      ];
      P.settled = P.list + 0.35 / k;
      Object.assign(P, LEAVE(k, s));
      mv(0, 0.6); mv(0.35, 1.4 * k, 1); nodeT.forEach((u) => mv(u, 0.25)); mv(P.bracket, 0.5, 0.85); mv(P.brL, 0.3);
      mv(P.loop, 0.8, 0.85); mv(P.loopL, 0.3); mv(P.loopH, 0.1, 1); mv(P.r2, 0.6); mv(P.st, 0.5); mv(P.list, 0.35);
      P.motion = motion;
      P.walkFrom = P.settled;
      P.cues = [
        [0, 'land'],
        ...nodeT.map((u, i) => (s.nodes[i].human ? [u, 'block', { i: i ? 2 : 0 }] : [u, 'tick'])),
        [P.bracket, 'draw'], [P.loop, 'draw'], [P.st, 'land'],
      ];
      return P;
    },
    build(api, s) {
      const n = s.nodes.length, span = Math.min(4, Math.max(2, Math.floor(12 / n)));
      const nw = span * 146 - 62, x = (i) => COL(1 + span * i);
      let h = m(92, 150, 120, esc(s.title), { cls: 'disp fl-h', fit: '1732,100' });
      h += `<div class="rule fl-line" style="left:96px;top:559px;width:${x(n - 1) + nw - 96}px;height:3px"></div>`;
      s.nodes.forEach((nd, i) => {
        h += nd.human
          ? `<div class="abs h fl-n" style="left:${x(i)}px;top:490px;width:${nw}px;height:140px;background:var(--accent);color:var(--on-accent)"><div class="abs" style="left:20px;top:34px;font-size:34px;font-weight:800;letter-spacing:-0.04em;white-space:nowrap">${esc(nd.name)}</div><div class="abs mono" style="left:22px;top:92px;font-size:25px;font-weight:600;white-space:nowrap">${esc(nd.note)}</div></div>`
          : `<div class="abs h fl-n" style="left:${x(i)}px;top:490px;width:${nw}px;height:140px;background:var(--paper);border:3px solid var(--ink)"><div class="abs lbl" style="left:18px;top:20px">${pad2(i)}</div><div class="abs mono" style="left:18px;top:52px;font-size:34px;font-weight:600;white-space:nowrap">${esc(nd.name)}</div><div class="abs mono grey" style="left:18px;top:96px;font-size:25px;white-space:nowrap">${esc(nd.note)}</div></div>`;
        h += `<div class="abs fl-box" style="left:${x(i) - 12}px;top:478px;width:${nw + 24}px;height:164px"></div>`;
        if (i < n - 1) h += `<svg class="abs h fl-a" style="left:${x(i) + nw + (span * 146 - nw - 26) / 2}px;top:548px" width="26" height="26" viewBox="0 0 26 26"><path d="M4 2 L22 13 L4 24 Z" style="fill:var(--ink)"/></svg>`;
      });
      const inner = s.nodes.map((nd, i) => i).filter((i) => !s.nodes[i].human);
      const a = inner.length ? inner[0] : 0, b = inner.length ? inner[inner.length - 1] : n - 1;
      const bx0 = x(a), bx1 = x(b) + nw, lx0 = x(a) + nw / 2, lx1 = x(b) + nw / 2;
      h += `<svg class="abs" style="left:0;top:0" width="1920" height="1080"><path class="fl-br" d="M${bx0} 470 V446 H${bx1} V470" fill="none" style="stroke:var(--ink)" stroke-width="2" /><path class="fl-loop" d="M${lx1} 630 V700 H${lx0} V636" fill="none" style="stroke:var(--ink)" stroke-width="3" /><path class="fl-loopH" d="M${lx0 - 12} 650 L${lx0} 632 L${lx0 + 12} 650" fill="none" style="stroke:var(--ink)" stroke-width="3" opacity="0" /></svg>`;
      h += `<div class="abs mono h fl-brL" style="left:${bx0}px;top:400px;font-size:25px;white-space:nowrap">${esc(s.bracket)}</div>`;
      h += `<div class="abs mono h fl-loopL" style="left:${lx0 + 57}px;top:714px;font-size:25px;white-space:pre">${esc(s.loop)}</div>`;
      h += `<div class="rule fl-r2" style="left:96px;top:790px;width:1728px;height:2px"></div>`;
      h += m(96, 818, 34, esc(s.statement), { cls: 'fl-i', style: 'font-weight:750;letter-spacing:-0.03em', fit: `1728,25` });
      h += `<div class="abs mono h fl-list" style="left:96px;top:886px;font-size:25px;white-space:nowrap" data-fitw="1728">${esc(s.list)}</div>`;
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.fl-box'),
    walkInset: 0,
    animate(api, s, P) {
      const { at, $, $$, rise, show, grow, draw } = api;
      rise($('.fl-h'), at(0), 0.6, 'expo.out');
      grow($('.fl-line'), at(0.35), 1.4 * api.k, 'power1.inOut');
      const nodes = $$('.fl-n'), arr = $$('.fl-a');
      nodes.forEach((nd, i) => show(nd, at(P.nodeT[i]), 0.25, { y: 18 }, s.nodes[i].human ? 'back.out(2)' : 'power3.out'));
      arr.forEach((a, i) => show(a, at(0.5 + 0.25 * i), 0.15, { x: -8 }));
      draw($('.fl-br'), at(P.bracket), 0.5, 'power2.inOut');
      show($('.fl-brL'), at(P.brL), 0.3, { y: 8 });
      draw($('.fl-loop'), at(P.loop), 0.8, 'power2.inOut');
      show($('.fl-loopH'), at(P.loopH), 0.1);
      show($('.fl-loopL'), at(P.loopL), 0.3, { y: 8 });
      grow($('.fl-r2'), at(P.r2), 0.6, 'expo.out');
      rise($('.fl-i'), at(P.st), 0.5);
      show($('.fl-list'), at(P.list), 0.35, { x: -16 });
      leave(api, s.D);
    },
  },

  // ======== install: ink command block typed out, then numbered steps on the beat ========
  install: {
    purpose: 'How to start. Commands type out in an ink block; numbered steps land one by one, paced by reading. The music rests here (reading).',
    counts: { commands: [1, 2], steps: [2, 4] },
    limits: { title: 26, panel: 24, commands: 36, note: 48, 'steps.cmd': 16, 'steps.note': 24 },
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const cps = 72;
      const len = (x) => [...x].length;
      const typeT = [0.5];
      for (let i = 1; i < s.commands.length; i++) typeT.push(typeT[i - 1] + len(s.commands[i - 1]) / cps / k + 0.15 / k);
      const typeEnd = typeT[typeT.length - 1] + len(s.commands[s.commands.length - 1]) / cps / k;
      const note = Math.max(1.6, typeEnd - 0.5);
      const rd = readU(k);
      let read = 0.25 / k + rd(s.title);
      s.commands.forEach((c, i) => (read = Math.max(read, typeT[i] + len(c) / cps / k + 0.25 / k) + rd(c)));
      const stepT = [];
      s.steps.forEach((st, i) => {
        const u = Math.max(i ? stepT[i - 1] + 0.5 : Math.max(2.0, typeEnd - 0.1), halfBeatUp(read - 0.25 / k));
        stepT.push(u);
        read = Math.max(read, u + 0.25 / k) + rd(st.cmd);
      });
      // primary: title, each command once typed, each step's command. Glance: panel, note, the steps' notes
      const reads = [
        [0, [s.title]], [0.2, [s.panel], G],
        ...s.commands.map((c, i) => [typeT[i] + len(c) / cps / k, [c]]),
        ...(s.note ? [[note, [s.note], G]] : []),
        ...s.steps.flatMap((st, i) => [[stepT[i], [st.cmd]], [stepT[i], [st.note], G]]),
      ];
      const rules = Math.min(stepT[0], Math.max(typeEnd + 0.25, halfBeatUp((typeEnd + stepT[0]) / 2)));
      const P = { cps, typeT, typeEnd, note, rules, stepT, reads, settled: stepT[stepT.length - 1] + 0.35 / k, ...LEAVE(k, s), motionEnds: [typeEnd] };
      // Hold move: the block cursor blinks on every beat once typing ends (a terminal idling; silent)
      P.blink = [];
      for (let u = beatUp(typeEnd) + 0.5; u <= D - P.out - 0.25 + 1e-9; u += 0.5) P.blink.push(u);
      P.moves = [];
      mv(0, 0.55); mv(0.2, 0.4, 0.85);
      typeT.forEach((u, i) => mv(u, len(s.commands[i]) / cps, 1));
      if (s.note) mv(note, 0.3);
      mv(rules, 0.35 + 0.08 * (s.steps.length - 1)); stepT.forEach((u) => mv(u + 0.05 / k, 0.3));
      P.blink.forEach((u) => mv(u, 0.04, 1));
      P.motion = motion;
      P.cues = [[0, 'land'], [0.2, 'draw'], ...typeT.map((u, i) => [u, 'type', { dur: len(s.commands[i]) / cps }]), [rules, 'draw'], ...stepT.map((u) => [u, 'tick'])];
      P.micro = [...typeT.map((u) => [u, 'a command types out']), ...P.blink.map((u) => [u, 'the cursor blinks'])];
      return P;
    },
    build(api, s) {
      const dg = isDiag(s), lean = dg ? ';' + skew(-1) : '', up = dg ? ';' + skew(1) : '';
      let h = m(92, 150, 120, esc(s.title), { cls: 'disp in-h', fit: '1732,100' });
      h += `<div class="abs in-box" style="left:96px;top:350px;width:1728px;height:200px;background:var(--ink)${lean}"><div class="abs lbl" style="right:28px;top:20px;color:var(--muted-on-ink)${up}">${esc(s.panel)}</div>`;
      s.commands.forEach((c, i) => (h += `<div class="abs mono" style="left:40px;top:${s.commands.length === 1 ? 80 : 44 + 72 * i}px;font-size:34px;color:var(--on-ink);white-space:pre${up}"><span style="color:var(--prompt-on-ink)">›</span> <span class="in-c"></span><span class="in-cur" style="display:inline-block;width:20px;height:38px;margin-left:4px;vertical-align:-6px;background:var(--on-ink);opacity:0"></span></div>`));
      h += `</div>`;
      if (s.note) h += `<div class="abs mono h grey in-note" style="left:96px;top:566px;font-size:25px;white-space:nowrap">${esc(s.note)}</div>`;
      s.steps.forEach((st, i) => {
        const x = COL(1 + 3 * i);
        h += `<div class="rule in-r" style="left:${x}px;top:640px;width:414px;height:4px"></div>`;
        h += `<div class="abs h in-s" style="left:${x}px;top:664px;width:414px"><div class="lbl">${pad2(i + 1)}</div><div class="mono" style="font-size:34px;font-weight:600;margin-top:18px;white-space:nowrap">${esc(st.cmd)}</div><div class="pcap" style="margin-top:8px;font-size:25px;color:var(--grey);white-space:nowrap">${esc(st.note)}</div></div>`;
      });
      api.html(h);
    },
    animate(api, s, P) {
      const { at, $, $$, rise, show, grow, clipIn, typeText } = api;
      rise($('.in-h'), at(0), 0.55, 'expo.out');
      clipIn($('.in-box'), at(0.2), 0.4, 'expo.inOut');
      const cs = $$('.in-c');
      s.commands.forEach((c, i) => typeText(cs[i], c, at(P.typeT[i]), P.cps));
      const cur = $$('.in-cur'), tl = api.tl;
      cur.forEach((c, i) => {
        tl.set(c, { opacity: 1 }, at(P.typeT[i]));
        if (i < cur.length - 1) tl.set(c, { opacity: 0 }, at(P.typeT[i + 1]));
      });
      P.blink.forEach((u, j) => tl.set(cur[cur.length - 1], { opacity: j % 2 ? 1 : 0 }, at(u)));
      if ($('.in-note')) show($('.in-note'), at(P.note), 0.3);
      const r = $$('.in-r'), st = $$('.in-s');
      P.stepT.forEach((u, i) => {
        grow(r[i], at(P.rules) + 0.08 * i, 0.35, 'expo.out');
        show(st[i], at(u) + 0.05, 0.3, { y: 16 }, 'expo.out');
      });
      leave(api, s.D);
    },
  },

  // ======== tagline: the claim again at poster size, ink bar under it ========
  tagline: {
    purpose: 'The promise restated as the biggest type in the film, an ink bar under it. A claim: it is read in a pause.',
    counts: { lines: [1, 2] },
    limits: { lines: 17, label: 60 },
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      // the lines are the film's claim (≤ 8 words, read in a pause hold of ≤ 2 bars); glance: the label under the bar
      const P = { bar: 0.6, lab: 1.0, exit: D - EXIT_LEAD / k, reads: [...s.lines.map((l, i) => [0.25 * i, [{ text: l, claim: true }]]), [1.0, [s.label], G]], ...(s.last ? { out: 0, tail: 0 } : { out: EXIT_LEAD / k, tail: EXIT - EXIT_LEAD }) };
      P.settled = Math.max(P.bar + 0.7 / k, P.lab + 0.45 / k);
      mv(0, 0.65 + 0.25 * k * (s.lines.length - 1)); mv(P.bar, 0.7, 0.85); mv(P.lab, 0.45);
      P.motion = motion;
      P.pause = [0, D];
      P.cues = [[0, 'land'], ...(s.lines.length > 1 ? [[0.25, 'land']] : []), [P.bar, 'wipe', { short: true }], ...(s.last ? [] : [[P.exit, 'slide', { exit: true }]])];
      P.peakAt = 0;
      return P;
    },
    build(api, s) {
      let h = '';
      const lh = 246;
      s.lines.forEach((l, i) => (h += m(88, 190 + lh * i, 225, rich(l), { cls: 'disp tg-t', fit: `1736,164` })));
      const by = 190 + lh * (s.lines.length - 1) + 300;
      h += `<div class="rule tg-bar" style="left:96px;top:${by}px;width:1728px;height:28px;background:var(--ink)"></div>`;
      h += m(96, by + 60, 25, esc(s.label), { cls: 'lbl tg-lab', fit: '1728,25' });
      api.html(h);
    },
    animate(api, s, P) {
      const { tl, at, $, $$, rise, sink, grow } = api;
      rise($$('.tg-t'), at(0), 0.65, 'expo.out', 0.25 * api.k);
      grow($('.tg-bar'), at(P.bar), 0.7, 'expo.inOut');
      rise($('.tg-lab'), at(P.lab), 0.45);
      if (s.last || P.covered) return;
      sink([...$$('.tg-t'), $('.tg-lab')], at(P.exit), EXIT - 0.06, 0.03);
      tl.to($('.tg-bar'), { scaleX: 0, transformOrigin: '100% 50%', duration: EXIT, ease: 'power3.in' }, at(P.exit));
    },
  },

  // ======== words: a run of short phrases on one anchor, each on its own ground (aperture-swap) ========
  words: {
    purpose: 'A run of one- to three-word states on one anchor, one per beat or two: the word holds its place while an aperture opens onto the next ground (paper, ink or the accent, which is only for the person).',
    counts: { states: [2, 8] },
    limits: { 'states.text': 16 },
    walk: 'invert', // hold move: the last word stays on its anchor while its ground inverts on the beat (a cut)
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const rd = readU(k);
      const AP = (AP_BEATS / 2) * k; // seconds one aperture takes
      const portal = s.enterBy === 'portal';
      // the first state rises from its mask when the scene opens on its ground (through the portal); otherwise it
      // opens by its own aperture over the outgoing page. Each next state comes on the first beat after the last is
      // read (legible 0.1 s into its aperture: the band opens from the word's middle)
      const settle = (i) => (i === 0 && portal ? 0.25 : 0.1);
      const land = [];
      s.states.forEach((st, i) => {
        if (!i) return land.push(0);
        const prev = land[i - 1];
        land.push(Math.max(prev + 0.5, beatUp(prev + (settle(i - 1) / k) + rd(s.states[i - 1].text))));
      });
      const shapes = s.states.map((st, i) => st.shape ?? ['band', 'close', 'circle'][(i + (portal ? 2 : 0)) % 3]);
      const reads = s.states.map((st, i) => [land[i], [st.text], { settle: settle(i) }]);
      land.forEach((u, i) => (i === 0 && portal ? mv(u, 0.55) : mv(u, AP, 1)));
      const last = land[land.length - 1];
      const P = { land, shapes, reads, motion, settled: last + (portal && land.length === 1 ? 0.55 * V : AP) / k, ...LEAVE(k, s) };
      P.cues = land.map((u, i) => [u, s.states[i].ground === 'accent' ? 'block' : 'ap', { i, ground: s.states[i].ground ?? 'paper' }]);
      P.micro = land.map((u, i) => [u, `${s.states[i].ground ?? 'paper'} ground: ${plain(s.states[i].text)}`]);
      P.peakAt = 0;
      P.walkFrom = P.settled;
      return P;
    },
    build(api, s, P) {
      let h = '';
      const INV = { paper: 'ink', ink: 'paper', accent: 'ink' };
      const last = s.states[s.states.length - 1];
      // the states, then one layer per hold move: the last word again, its ground inverted (and back)
      const layers = [...s.states, ...P.moves.map((_, j) => ({ ...last, ground: j % 2 ? last.ground ?? 'paper' : INV[last.ground ?? 'paper'], hold: true }))];
      layers.forEach((st) => {
        const g = st.ground ?? 'paper';
        const fg = g === 'ink' ? 'var(--on-ink)' : g === 'accent' ? 'var(--on-accent)' : 'var(--ink)';
        const bg = g === 'ink' ? 'var(--ink)' : g === 'accent' ? 'var(--accent)' : 'var(--paper)';
        h += `<div class="abs wd-s" data-layout-allow-overlap style="inset:0">`;
        h += `<div class="abs wd-g" style="left:0;top:118px;width:1920px;height:844px;background:${bg}"></div>`;
        h += m(90, 380, 225, g === 'accent' ? esc(plain(st.text)) : rich(st.text), { cls: 'disp wd-w', style: `color:${fg}`, fit: '1728,120' });
        h += `</div>`;
      });
      api.html(h);
    },
    animate(api, s, P) {
      const { at, $$, rise } = api;
      // one size for every state (the smallest the fit chose), so the anchor holds
      const ms = $$('.wd-w').map((el) => el.closest('.m'));
      const size = Math.min(...ms.map((el) => parseFloat(el.style.fontSize)));
      ms.forEach((el) => (el.style.fontSize = size + 'px'));
      const layers = $$('.wd-s'), root = document.getElementById('root').getBoundingClientRect();
      const times = [...P.land, ...P.moves];
      P.clips = layers.map((layer, i) => {
        const r = layer.querySelector('.mi').getBoundingClientRect();
        const origin = [r.left - root.left + r.width / 2, r.top - root.top + r.height * 0.55];
        return { layer, t0: at(times[i]), dur: (AP_BEATS / 2) * api.k, shape: i < P.land.length ? P.shapes[i] : 'cut', origin, open: i === 0 && api.scene.enterBy === 'portal' };
      });
      if (api.scene.enterBy === 'portal') rise(layers[0].querySelector('.mi'), at(0), 0.55, 'expo.out');
      leave(api, s.D);
    },
  },

  // ======== slot: words pass through a slot between two grid baselines (slot-rails) ========
  slot: {
    purpose: 'A sequence of steps or stages through one slot: two rails on the grid are its top and bottom; each word leaves up through the top rail as the next rises from the bottom one. The person\'s step is set in the accent.',
    counts: { words: [2, 8] },
    limits: { label: 40, words: 14, note: 40 },
    walk: 'frame',
    walkInset: 0,
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const rd = readU(k);
      const R = SLOT_BEATS / 2; // u one word takes through the slot
      const W = s.words.map((w) => (typeof w === 'string' ? { text: w } : w));
      // each word enters once the previous one has been read: legible 0.2 s into its hand-off, 0.3 s a word
      const starts = [];
      let u = 0.35;
      W.forEach((w, i) => { starts.push(u); u = Math.max(u + R, halfBeatUp(u + 0.2 / k + rd(w.text))); });
      const last = starts[starts.length - 1];
      const noteAt = last + R;
      // glance: the label (it names the sequence; the words carry it) and the note
      const reads = [[0.1, [s.label], G], ...W.map((w, i) => [starts[i], [w.text], { settle: 0.2 }]), ...(s.note ? [[noteAt, [s.note], G]] : [])];
      mv(0.1, 0.45); mv(0.1, 0.3);
      starts.forEach((x) => mv(x, R * k, 0.8));
      if (s.note) mv(noteAt, 0.3);
      const P = { W, starts, noteAt, reads, motion, settled: last + R + (s.note ? 0.3 / k : 0), ...LEAVE(k, s) };
      P.cues = [[0.1, 'draw'], ...starts.map((x, i) => [x, W[i].human ? 'block' : 'rail', { i }])];
      P.micro = starts.map((x, i) => [x, `the slot passes ${plain(W[i].text)}`]);
      P.walkFrom = P.settled;
      const h = W.findIndex((w) => w.human);
      P.peakAt = starts[h >= 0 ? h : 0];
      return P;
    },
    build(api, s) {
      let h = HAND + `<div class="abs lbl h sl-lab" style="left:96px;top:172px">${esc(s.label)}</div>`;
      h += `<div class="abs sl-box" style="left:84px;top:150px;width:1752px;height:70px"></div><div class="abs sl-box" style="left:84px;top:440px;width:1752px;height:240px"></div>`;
      if (s.note) h += `<div class="abs mono h grey sl-note" style="left:242px;top:760px;font-size:25px;white-space:nowrap">${esc(s.note)}</div>`;
      api.html(h);
    },
    walkBoxes: (api) => api.$$('.sl-box'),
    async prepare(api, s, P) {
      const pal = api.pal, cv = document.createElement('canvas').getContext('2d');
      const W = P.W.map((w) => ({ ...w, text: plain(w.text).toUpperCase() }));
      // one size for every word: the largest scale step at which the longest fits between x 242 and the rails' end
      const fits = (size) => W.every((w) => cmeasure(cv, w.text, { family: FONT.display, weight: 800, size, spacing: -0.045 * size }).width <= 1794 - 242 - 12);
      const size = [225, 164, 120].find(fits) ?? 120;
      if (!fits(size)) api.fail(`slot: a word does not fit the slot at 120 px — shorten it`);
      const base = { x: 242, rails: [126, 1794], cy: 560, pad: 12, ticks: 0, dimension: false, ground: false,
        font: { family: FONT.display, weight: 800, spacing: -0.045 * size }, colors: { ground: pal.paper, ink: pal.ink, line: pal.ink, accent: pal.accent } };
      P.hand = [];
      for (let i = 0; i < W.length; i++) {
        P.hand.push(await createHandoff('slot-rails', { ...base, from: i ? { text: W[i - 1].text, size, accent: !!W[i - 1].human } : { text: '', size }, to: { text: W[i].text, size, accent: !!W[i].human } }));
      }
      P.size = size;
    },
    paint(ctx, t, api, s, P) {
      if (!P.hand?.length) return;
      const u = (t - s.start) / api.k;
      const grow = Math.min(1, Math.max(0, ((u - 0.1) * api.k) / 0.45));
      if (grow < 1) { ctx.beginPath(); ctx.rect(0, 0, 96 + 1728 * expOut(grow), 1080); ctx.clip(); }
      let j = -1;
      P.starts.forEach((x, i) => { if (u >= x) j = i; });
      if (j < 0) P.hand[0].still(ctx, 'from');
      else if (u < P.starts[j] + SLOT_BEATS / 2) P.hand[j].draw(ctx, (u - P.starts[j]) / (SLOT_BEATS / 2));
      else P.hand[j].still(ctx, 'to');
      // the step index beside the slot (glance: it only counts the words); it turns as the incoming word arrives
      const shown = j >= 0 && u < P.starts[j] + SLOT_BEATS / 8 ? j - 1 : j;
      if (shown >= 0) ctext(ctx, `${pad2(shown + 1)}/${pad2(P.W.length)}`, 96, 560 + 9, { family: FONT.mono, weight: 500, size: 25 }, { color: api.pal.grey });
    },
    animate(api, s, P) {
      const { at, $, show } = api;
      show($('.sl-lab'), at(0.1), 0.3);
      if ($('.sl-note')) show($('.sl-note'), at(P.noteAt), 0.3, { y: 8 });
      leave(api, s.D);
    },
  },

  // ======== bars: a column chart on the grid that arrives as a staircase front (step-wipe) ========
  bars: {
    purpose: 'One measured quantity per item as columns on the grid. It arrives as a staircase front whose steps are its own values; the values land one per half beat; an accent rule marks the limit the person set.',
    counts: { values: [2, 6] },
    limits: { num: 2, title: 10, caption: 48, 'values.label': 14, 'values.display': 9, unit: 8, 'limit.label': 32, note: 40 },
    walk: 'frame',
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const R = ENTER.steps.beats / 2; // u the front takes
      const valT = s.values.map((_, i) => R + 0.25 * i);
      const lim = s.limit ? valT[valT.length - 1] + 0.25 : null;
      const noteAt = (lim ?? valT[valT.length - 1]) + 0.5;
      const disp = (v) => v.display ?? `${v.value}${s.unit ? ' ' + s.unit : ''}`;
      // primary: title, every value (a number, one per half beat). Glance: caption, the item labels (they name the
      // columns), the limit's label (the accent rule shows it), the note
      const reads = [
        [0, [s.title]], [0.15, [s.caption], G],
        ...s.values.flatMap((v, i) => [[valT[i], [disp(v)]], [valT[i], [v.label], G]]),
        ...(s.limit ? [[lim, [s.limit.label], G]] : []), ...(s.note ? [[noteAt, [s.note], G]] : []),
      ];
      pageHeadMotion(mv); mv(0, R * k, 1);
      valT.forEach((u) => mv(u, 0.3));
      if (lim != null) mv(lim, 0.45);
      if (s.note) mv(noteAt, 0.3);
      const P = { R, valT, lim, noteAt, reads, motion, disp, ...LEAVE(k, s) };
      P.settled = Math.max(valT[valT.length - 1] + 0.3 / k, lim != null ? lim + 0.45 / k : 0, s.note ? noteAt + 0.3 / k : 0);
      P.walkFrom = P.settled;
      P.cues = [[0, 'steps', { n: s.values.length }], ...valT.map((u, i) => [u, 'count', { i, n: s.values.length }]), ...(lim != null ? [[lim, 'block', { i: 1 }]] : [])];
      P.peakAt = lim ?? valT[valT.length - 1];
      // geometry, shared by the DOM labels and the hand-off
      const n = s.values.length, span = Math.max(2, Math.floor(12 / n)), slot = span * 146;
      const top = Math.max(...s.values.map((v) => v.value), s.limit?.value ?? 0);
      P.geo = { n, span, slot, x0: 96, gap: 24, base: 860, scale: 420 / top };
      return P;
    },
    build(api, s, P) {
      let h = HAND + pageHead(s);
      const { slot, x0, base, scale } = P.geo;
      s.values.forEach((v, i) => {
        const x = x0 + i * slot, y = base - v.value * scale;
        h += `<div class="abs bx-box" style="left:${x - 10}px;top:${y - 70}px;width:${slot - 4}px;height:${base - y + 120}px"></div>`;
        h += `<div class="abs h bx-v" style="left:${x}px;top:${y - 56}px;font-size:34px;font-weight:800;letter-spacing:-0.03em;white-space:nowrap">${esc(P.disp(v))}</div>`;
        h += `<div class="abs lbl h bx-l" style="left:${x}px;top:${base + 18}px">${esc(v.label)}</div>`;
      });
      if (s.limit) {
        const y = Math.round(base - s.limit.value * scale);
        h += `<div class="rule bx-lim" style="left:96px;top:${y - 3}px;width:1728px;height:6px;background:var(--accent)"></div>`;
        h += `<div class="abs mono h bx-limL" style="right:96px;top:${y - 44}px;font-size:25px;font-weight:600;text-align:right;white-space:nowrap">${esc(s.limit.label)}</div>`;
      }
      if (s.note) h += `<div class="abs mono h grey bx-note" style="left:96px;top:322px;font-size:25px;white-space:nowrap">${esc(s.note)}</div>`;
      api.html(h);
    },
    async prepare(api, s, P) {
      const { slot, x0, gap, base, scale } = P.geo, pal = api.pal;
      P.hand = await createHandoff('step-wipe', {
        from: { values: [] }, to: { values: s.values.map((v) => v.value), x0, slot, gap, base, scale, highlight: null },
        axis: true, ground: false, colors: { ground: pal.paper, base: pal.ink, accent: pal.accent, rule: pal.ink },
      });
    },
    paint(ctx, t, api, s, P) {
      if (!P.hand) return;
      const u = (t - s.start) / api.k;
      if (u < P.R) P.hand.draw(ctx, Math.max(0, u / P.R));
      else P.hand.still(ctx, 'to');
    },
    walkBoxes: (api) => api.$$('.bx-box'),
    walkInset: 0,
    animate(api, s, P) {
      const { at, $, $$, show, grow } = api;
      pageHeadAnim(api);
      $$('.bx-v').forEach((el, i) => show(el, at(P.valT[i]), 0.3, { y: 12 }, 'expo.out'));
      $$('.bx-l').forEach((el, i) => show(el, at(P.valT[i]), 0.3, { y: 8 }));
      if ($('.bx-lim')) { grow($('.bx-lim'), at(P.lim), 0.45, 'expo.out'); show($('.bx-limL'), at(P.lim) + 0.1, 0.3, { y: 8 }); }
      if ($('.bx-note')) show($('.bx-note'), at(P.noteAt), 0.3, { x: -12 });
      leave(api, s.D);
    },
  },

  // ======== figure: one measured number at 640 px; its counter may hold the next scene (counter-portal) ========
  figure: {
    purpose: 'One number the film turns on, at 640 px, with what it counts. When the next scene opens on the accent (a claim, or words whose first ground is the accent), that scene already shows in the number\'s counter and the camera pushes through it.',
    counts: { line: [1, 2] },
    limits: { value: 4, label: 32, line: 22, note: 40 },
    plan(s, D, k = 1) {
      const { motion, mv } = motionOf(k);
      const rd = readU(k);
      const lines = [].concat(s.line);
      // the number lands, its label, then the line part by part (each part once the previous one is read)
      const lineT = [0.35];
      let read = Math.max(0.25 / k + rd(s.value), 0.35 + 0.25 / k) + rd(lines[0]);
      for (let i = 1; i < lines.length; i++) { const u = Math.max(lineT[i - 1] + 0.5, halfBeatUp(read - 0.25 / k)); lineT.push(u); read = Math.max(read, u + 0.25 / k) + rd(lines[i]); }
      const noteAt = lineT[lineT.length - 1] + 0.25;
      // the number and its line are a claim (≤ 8 words a state), read in a pause hold that may last up to 2 bars
      const reads = [[0, [{ text: s.value, claim: true }]], [0.15, [s.label], G], ...lines.map((l, i) => [lineT[i], [{ text: l, claim: true }]]), ...(s.note ? [[noteAt, [s.note], G]] : [])];
      mv(0, 0.55); mv(0.15, 0.3); lineT.forEach((u) => mv(u, 0.5)); if (s.note) mv(noteAt, 0.3);
      const P = { lines, lineT, noteAt, reads, motion, settled: Math.max(lineT[lineT.length - 1] + 0.5 * V / k, s.note ? noteAt + 0.3 / k : 0), ...LEAVE(k, s) };
      P.cues = [[0, 'land', { low: true }], [0.15, 'tick', { soft: true }], ...lineT.map((u) => [u, 'land'])];
      P.peakAt = 0;
      P.pause = [lineT[0], D];
      return P;
    },
    build(api) { api.html(HAND); },
    async prepare(api, s, P) {
      const pal = api.pal, cv = document.createElement('canvas').getContext('2d');
      const fspec = (size) => ({ family: FONT.display, weight: 800, size, spacing: -0.06 * size });
      const size = [640, 421, 308].find((z) => cmeasure(cv, s.value, fspec(z)).width <= 852) ?? 308;
      P.font = fspec(size);
      const mm = cmeasure(cv, s.value, P.font);
      P.box = { x: 90, base: 840, asc: mm.actualBoundingBoxAscent, desc: mm.actualBoundingBoxDescent, w: mm.width };
      P.lineSize = [64, 47, 34].find((z) => P.lines.every((l) => cmeasure(cv, l, { family: FONT.display, weight: 800, size: z, spacing: -0.03 * z }).width <= 852)) ?? 34;
      const portal = api.P.covered === 'portal';
      if (portal && !/[0OoDdQqPpBbAa69]/.test(s.value)) api.fail(`figure: "${s.value}" has no letter with a counter for the portal into the next scene`);
      P.marks = (c, u) => { // the label, the line and the note in the figure's own space; u: scene time in u (entrances)
        const a = (x, d = 0.3) => Math.min(1, Math.max(0, ((u - x) * api.k) / d));
        const o = (x) => 1 - (1 - a(x)) ** 2;
        ctext(c, plain(s.label).toUpperCase(), 972, 520 + 10 * (1 - o(0.15)), { family: FONT.mono, weight: 500, size: 25, spacing: 2 }, { color: pal.grey, alpha: o(0.15) });
        P.lines.forEach((l, i) => {
          const r = expOut(a(P.lineT[i], 0.5)), y = 600 + i * (P.lineSize * 1.1);
          c.save(); c.beginPath(); c.rect(960, y - P.lineSize * 1.0, 900, P.lineSize * 1.3); c.clip();
          ctext(c, l, 972, y + (1 - r) * P.lineSize * 1.2, { family: FONT.display, weight: 800, size: P.lineSize, spacing: -0.03 * P.lineSize }, { color: pal.ink });
          c.restore();
        });
        if (s.note) ctext(c, s.note, 972, 600 + P.lines.length * P.lineSize * 1.1 + 30 + 8 * (1 - o(P.noteAt)), { family: FONT.mono, weight: 400, size: 25 }, { color: pal.grey, alpha: o(P.noteAt) });
      };
      let U = 0;
      P.hand = await createHandoff('counter-portal', {
        glyph: { text: s.value, counter: null, counterAt: [0.5, 0.5] }, x: P.box.x, baseline: P.box.base, font: P.font, parallax: 0.55, ground: false,
        colors: { ground: pal.paper, ink: pal.ink, portal: portal ? pal.accent : pal.paper },
        from: (c) => P.marks(c, U), to: () => {},
      });
      P.setU = (u) => (U = u);
      // the far scene's extent: the claim's field is the whole frame; a run of words stands in the content band
      P.portalClip = api.next?.type === 'words' ? [0, 118, 1920, 844] : null;
    },
    paint(ctx, t, api, s, P) {
      if (!P.hand) return;
      const u = (t - s.start) / api.k, k = api.k;
      P.setU(u);
      const push0 = s.D - (api.P.covered === 'portal' ? ENTER.portal.beats / 2 : 0);
      if (api.P.covered === 'portal' && u >= push0) {
        if (P.portalClip) { const [x, y, w, h] = P.portalClip; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
        P.hand.draw(ctx, Math.min(1, (u - push0) / (s.D - push0)));
        return;
      }
      // the numeral rises out of its mask (0.55 s expo out), the marks enter by themselves
      const r = expOut(Math.min(1, Math.max(0, (u * k) / 0.55)));
      const B = P.box, top = B.base - B.asc - 30, hgt = B.asc + B.desc + 60;
      ctx.save(); ctx.beginPath(); ctx.rect(B.x - 40, top, B.w + 80, hgt); ctx.clip();
      ctx.translate(0, (1 - r) * hgt * 1.05);
      P.setU(-1e3); // marks are drawn below, unshifted
      P.hand.still(ctx, 'from');
      ctx.restore();
      P.marks(ctx, u);
    },
    animate(api, s, P) { leave(api, s.D); },
  },

  // ======== end: name, the parts in four columns, ink square + URL, footer line ========
  end: {
    rest: true,
    purpose: 'Closing page, flush left. The URL lands at 1.1 u and holds to the last frame (>= 3 s once legible); an ink underline lands under it on the downbeat of the film\'s last bar.',
    counts: { items: [2, 4], foot: [1, 2] },
    limits: { name: 14, items: 12, url: 44, foot: 44 },
    plan(s, D, k = 1) {
      const P = { rules: 0.4, items: 0.5, sq: 1.0, url: 1.1, eR: 1.7, foot: 1.9 };
      // primary: name, URL (held 3 s once legible). Glance: the parts (as one line) and the foot
      P.reads = [[0, [s.name]], [P.items, [s.items.join(' ')], G], [P.url, [s.url], { hold: 3 }], [P.foot, s.foot || [], G]];
      P.settled = Math.max(P.eR + 0.6 / k, P.foot + (0.15 * Math.max(0, (s.foot?.length || 1) - 1) + 0.4) / k);
      P.out = 0;
      P.last = D - 2;
      P.moves = P.last >= P.url + 0.6 / k - 1e-9 ? [P.last] : [];
      P.cues = [[0, 'land'], ...s.items.map((_, i) => [P.items + (0.1 * i) / k, 'tick', { soft: true }]), [P.sq, 'block', { i: 0, ink: true }], [P.url, 'land', { low: true }], ...P.moves.map((u) => [u, 'step', { i: 0 }])];
      P.motion = [[0, 1e3]]; // a rest: not held to the hold limit
      P.peakAt = 0;
      return P;
    },
    build(api, s) {
      let h = m(84, 150, 225, esc(s.name), { cls: 'disp e-name', fit: `1740,164` });
      s.items.forEach((it, i) => {
        const x = COL(1 + 3 * i);
        h += `<div class="rule e-r" style="left:${x}px;top:500px;width:414px;height:4px"></div>`;
        h += `<div class="abs h e-i" style="left:${x}px;top:522px"><div class="lbl">${pad2(i + 1)}</div><div style="font-size:47px;font-weight:800;letter-spacing:-0.025em;margin-top:8px;white-space:nowrap">${esc(it)}</div></div>`;
      });
      h += `<div class="abs e-sq" style="left:96px;top:700px;width:52px;height:52px;background:var(--ink);transform-origin:0 50%"></div>`;
      h += m(176, 692, 47, esc(s.url), { cls: 'mono e-url', style: 'font-weight:500;letter-spacing:-0.02em', fit: `1648,34` });
      h += `<div class="rule e-ul" style="left:176px;top:772px;width:400px;height:6px"></div>`;
      h += `<div class="rule e-R" style="left:96px;top:820px;width:1728px;height:2px"></div>`;
      (s.foot || []).forEach((f, i) => (h += `<div class="abs h e-f" style="left:${i ? 1118 : 96}px;top:842px;font-size:25px;font-weight:${i ? 750 : 500};letter-spacing:${i ? -0.02 : -0.01}em;white-space:nowrap">${esc(f)}</div>`));
      api.html(h);
    },
    animate(api, s, P) {
      const { at, $, $$, rise, show, grow } = api;
      rise($('.e-name'), at(0), 0.7, 'expo.out');
      grow($$('.e-r'), at(P.rules), 0.45, 'expo.out', 'scaleX', 0.1);
      show($$('.e-i'), at(P.items), 0.3, { y: 14 }, 'power3.out', 0.1);
      grow($('.e-sq'), at(P.sq), 0.3, 'expo.out');
      rise($('.e-url'), at(P.url), 0.6, 'expo.out');
      grow($('.e-R'), at(P.eR), 0.6, 'expo.out');
      show($$('.e-f'), at(P.foot), 0.4, { y: 10 }, 'power2.out', 0.15);
      const ul = $('.e-ul'), url = $('.e-url');
      ul.style.width = Math.round(url.scrollWidth) + 'px';
      if (P.moves.length) grow(ul, at(P.last) - 0.332 * 0.4, 0.4, 'expo.out');
      else ul.style.display = 'none';
    },
  },
};

// ---------- holds: still windows, hold moves ----------
// Still windows of a scene in [from, to] (u), from its motion table: the gaps between one move's visible end and the
// next move's start. The window from the scene start to its first move is not a hold (nothing has landed yet).
export const stillsOf = (motion, k, from, to) => {
  const iv = motion.map(([u, sec]) => [u, u + sec / k]).sort((a, b) => a[0] - b[0]);
  const out = [];
  let busy = null;
  for (const [a, b] of iv) {
    if (b <= from) { busy = Math.max(busy ?? from, from); continue; }
    if (a >= to) break;
    if (busy != null && a > busy + 1e-9) out.push([Math.max(from, busy), a]);
    busy = Math.max(busy ?? a, b);
  }
  if (busy != null && to > busy + 1e-9) out.push([Math.max(from, busy), to]);
  return out;
};
const inPause = (P, a, b) => !!P.pause && a >= P.pause[0] - 1e-9 && b <= P.pause[1] + 1e-9;
// the hold moves: when each starts against its beat, how long it visibly moves, its sound
const MOVE = { frame: { lead: 0.06, sec: 0.12, vis: 1, cue: 'step' }, arrow: { lead: 0, sec: 0.35, vis: V, cue: 'step' }, invert: { lead: 0, sec: 0.04, vis: 1, cue: 'ap' } };

// planScene(s, D, k): a type's plan with its links applied — what covers its end, how it is entered — and every still
// window past the hold limit filled with the type's hold move (on a beat, 0.3–0.8 u into the window). `s` comes
// from devices.js linked(), so enterBy, exitBy and last are set. fill: false (D unknown, as when fit() sizes the scene).
export const planScene = (s, D, k, { fill = true } = {}) => {
  const T = TYPES[s.type];
  if (!T) return { cues: [], reads: [], settled: 0, out: 0, motion: [], moves: [], micro: [], shots: [], stills: [] };
  const P = T.plan(s, D, k);
  P.motion ||= []; P.moves ||= []; P.micro ||= []; P.shots ||= [];
  // covered by the next scene's device: no exit of its own, at rest until covered
  if (s.exitBy && !s.last) {
    const half = s.exitBy === 'columns' ? ENTER.columns.beats / 4 : s.exitBy === 'portal' ? ENTER.portal.beats / 2 : 0; // u inside this scene
    P.out = half;
    P.tail = s.exitBy === 'columns' ? (ENTER.columns.beats / 2) * (k / 2) : s.exitBy === 'aperture' ? (AP_BEATS * k) / 2 : 0;
    P.covered = s.exitBy;
    P.cues = P.cues.filter((c) => !c[2]?.exit);
    if (half) P.motion.push([D - half, half * k]);
    if (s.exitBy === 'portal') P.cues.push([D - half, 'portal', { dur: half * k }]);
  }
  // entered by the columns: the poster is composed behind the shutter, which is the entrance
  if (isColumns(s.enterBy)) {
    P.motion = P.motion.filter(([u]) => u >= SET_U - 1e-9);
    P.motion.push([-ENTER.columns.beats / 4, (ENTER.columns.beats / 2) * k]);
    P.cues = P.cues.filter(([u]) => u >= SET_U - 1e-9);
    P.cues.push([-ENTER.columns.beats / 4, 'columns', { variant: ENTER[s.enterBy].variant, dur: (ENTER.columns.beats / 2) * k }]);
    P.set = { from: -ENTER.columns.beats / 4, before: SET_U };
  }
  const end = D - P.out;
  if (fill && T.walk && D < 500) {
    const mv = MOVE[T.walk], from = P.walkFrom ?? P.settled ?? 0;
    for (let guard = 0; guard < 80; guard++) {
      const w = stillsOf(P.motion, k, 0, end).find(([a, b]) => b - a > HOLD_U + 1e-9 && b > from + 1e-9 && !inPause(P, a, b));
      if (!w) break;
      const u = Math.ceil(Math.max(w[0] + 0.3, from) * 2 - 1e-9) / 2; // on a beat, 0.3 u or more into the window
      if (u >= end - 1e-9 || u > w[0] + HOLD_U) break; // a window the hold move cannot reach: fit reports it
      P.moves.push(u);
      P.motion.push([u - mv.lead / k, mv.sec * mv.vis]);
      if (mv.cue) P.cues.push([u, mv.cue, { i: P.moves.length - 1 }]);
      P.micro.push([u, `hold move (${T.walk})`]);
    }
    P.moves.sort((a, b) => a - b);
  }
  // a rest or an ambient layer (the chapter numeral's drift) is never held still
  // a window inside the claim's reading range is a pause hold only when it needs to be (past the 2-beat limit)
  P.stills = P.ambient || T.rest ? [] : stillsOf(P.motion, k, 0, end).map(([a, b]) => ({ from: a, to: b, pause: inPause(P, a, b) && b - a > HOLD_U }));
  return P;
};

// ---------- validation ----------
const get = (o, path) => path.split('.').reduce((v, p) => (v == null ? v : Array.isArray(v) ? v.flatMap((x) => (x == null ? [] : [].concat(x[p] ?? []))) : v[p]), o);
const texts = (v) => (v == null ? [] : Array.isArray(v) ? v.flatMap(texts) : typeof v === 'object' ? [] : [String(v)]);
const GROUNDS = ['paper', 'ink', 'accent'];
const ENTERS = ['columns', 'columns-lean', 'columns-two', 'turn', 'cut'];

export const validate = (film) => {
  const errors = [], warnings = [];
  film.scenes.forEach((s, i) => {
    const T = TYPES[s.type], where = `scene ${i + 1} (${s.type})`;
    if (!T) return errors.push(`${where}: unknown type; use one of ${Object.keys(TYPES).join(', ')}`);
    for (const [path, [lo, hi]] of Object.entries(T.counts)) {
      const v = get(s, path), n = Array.isArray(v) ? v.length : v == null ? 0 : 1;
      if (n < lo || n > hi) errors.push(`${where}: ${path} has ${n} items; allowed ${lo}–${hi}`);
    }
    for (const [path, lim] of Object.entries(T.limits)) {
      for (const t of texts(get(s, path))) if (plain(t).length > lim) warnings.push(`${where}: ${path} "${t}" is ${plain(t).length} chars; limit ${lim} — rewrite shorter`);
    }
    for (const t of texts([s.lines])) for (const [, w] of plain(t) === t ? [] : t.matchAll(/\*([^*]+)\*/g)) {
      if (!/\p{L}/u.test(w)) warnings.push(`${where}: *${w}* sets punctuation in the accent; the accent marks only a person or a decision`);
    }
    if (s.enter != null && !ENTERS.includes(s.enter)) errors.push(`${where}: enter "${s.enter}" is not one of ${ENTERS.join(', ')}`);
    if (s.type === 'claim' && isColumns(s.enter)) errors.push(`${where}: a claim opens on its accent field; it cannot be entered by the columns`);
    if (s.type === 'words') s.states?.forEach((st, j) => {
      if (st.ground != null && !GROUNDS.includes(st.ground)) errors.push(`${where}: state ${j + 1} ground "${st.ground}" is not one of ${GROUNDS.join(', ')}`);
      if (st.shape != null && !APERTURE_SHAPES.includes(st.shape)) errors.push(`${where}: state ${j + 1} shape "${st.shape}" is not one of ${APERTURE_SHAPES.join(', ')}`);
      if (words(st.text) > 3) errors.push(`${where}: state ${j + 1} "${st.text}" has ${words(st.text)} words; a state on the anchor carries at most 3`);
      if (j && (st.ground ?? 'paper') === (s.states[j - 1].ground ?? 'paper')) warnings.push(`${where}: states ${j} and ${j + 1} stand on the same ground; the aperture shows only where the ground changes`);
    });
    if (s.type === 'slot') s.words?.forEach((w, j) => { const t = typeof w === 'string' ? w : w.text; if (words(t) > 3) errors.push(`${where}: word ${j + 1} "${t}" has ${words(t)} words; the slot carries at most 3`); });
    if (s.type === 'bars') s.values?.forEach((v, j) => { if (!(Number.isFinite(v.value) && v.value >= 0)) errors.push(`${where}: value ${j + 1} must be a number ≥ 0`); });
    if (s.type === 'figure' && portalTarget(film.scenes[i + 1]) && !/[0OoDdQqPpBbAa69]/.test(String(s.value))) errors.push(`${where}: "${s.value}" has no letter with a counter, so the portal into the next scene has nothing to push through`);
  });
  const CHROME = { brand: 16, tag: 40, license: 10, url: 32, platforms: 24 };
  for (const [key, lim] of Object.entries(CHROME)) if (plain(film.chrome?.[key] ?? '').length > lim) warnings.push(`chrome.${key} "${film.chrome[key]}" over ${lim} chars`);
  film.scenes.forEach((s, i) => { if (s.section && plain(s.section).length > 24) warnings.push(`scene ${i + 1}: section "${s.section}" over 24 chars`); });
  if (film.scenes.filter((s) => s.type === 'options').some((s) => s.rows.some((r) => r.pick !== 0 && r.pick !== 1))) errors.push('options: pick must be 0 or 1');
  if (film.form != null && !FORMS.includes(film.form)) errors.push(`form "${film.form}" is not one of ${FORMS.join(', ')}`);
  if (film.opening != null && !['draw', 'set'].includes(film.opening)) errors.push(`opening "${film.opening}" is not one of draw, set`);
  return { errors, warnings };
};

// ---------- the film plan: shared by index.html and score.mjs ----------
export const planFilm = (film) => {
  const t = fit(film, RULES);
  const g = grid({ bpm: t.bpm });
  const k = 120 / t.bpm; // u → seconds
  let chapterIndex = 0, section = '';
  const laid = t.scenes.map((s, i) => {
    const D = s.dur / k;
    if (s.type === 'chapter') s.chapterIndex = chapterIndex++;
    section = s.section || (s.num && s.title ? `${s.num} — ${s.title}` : section);
    const S = { ...linked(t.scenes, i), D, form: film.form ?? 'square' };
    const P = planScene(S, D, k);
    return { ...S, index: i, P, sectionLabel: section };
  });
  const cues = laid.flatMap((s) => s.P.cues.map(([u, kind, opt = {}]) => ({ t: s.start + u * k, kind, scene: s.type, index: s.index, ...opt })));
  cues.sort((a, b) => a.t - b.t);
  const { errors, warnings } = validate(film);
  for (const n of t.notes) (n.level === 'error' ? errors : warnings).push(`fit${n.scene != null ? ` scene ${n.scene + 1}` : ''}: ${n.msg}`);
  return { g, k, laid, cues, errors, warnings, fit: t, duration: t.duration, bars: t.bars };
};

// Longest still window of a laid scene, in beats (validate.mjs; rest scenes and ambient layers report none).
export const longestStill = (L) => (L.P.ambient || L.type === 'end' ? 0 : Math.max(0, ...(L.P.stills || []).filter((x) => !x.pause).map((x) => (x.to - x.from) * 2)));

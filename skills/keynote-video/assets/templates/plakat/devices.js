// devices.js — how one plakat scene hands over to the next, and the aperture inside a run of words.
//
// The devices are the shared library's (references/transitions.md, "Which transition for which mode"):
//   plakat-columns  (runtime/transitions/plakat.js, T2)   an ink shutter runs up each grid column; `angle`, `twoPhase`
//   aperture-swap   (runtime/transitions/aperture-swap.js, T0)  the word holds its anchor, a band, circle or closing
//                                                        bars open onto the next ground
//   counter-portal  (runtime/handoffs/counter-portal.js, T2)    the next scene waits in the counter of a figure's 0
//   step-wipe       (runtime/handoffs/step-wipe.js, T2)  a staircase front whose steps are the next chart's values
//   slot-rails      (runtime/handoffs/slot-rails.js, T0) two grid baselines are a slot; words pass through it
// and one of the mode's own (rules.devices), like the problem's full accent wipe:
//   plakat-reblock  (this template, T2)  a solid block of the outgoing poster is re-laid as a block of the next: the
//                   verify page's accent stop band ("you decide") becomes the flow's first YOU node; the install page's
//                   ink command block becomes the tagline's ink bar. Mode principle 5's re-layout at a turn: the block
//                   is one object across the cut, keeps its colour (and so its meaning) and lands on the beat
// The hand-offs are drawn by their modules on a canvas over the page (index.html), with the page's palette, fonts
// and grid. The two frame-level entries need two rendered frames as textures, which a DOM page cannot hand to
// WebGL; so this file computes their exact geometry — the module's own stagger, sweep, easing, slant and radius,
// read from the module's entry — and index.html applies it as CSS clip paths on the two pages (and on the canvas
// layer). Same picture, same numbers; the new poster does not take the shader's 40 px `rise`, which would need a
// copy of the page per column (rise 0 is one of the module's own settings).
//
// Pure functions of progress only (no state between frames), shared by index.html, timing.rules.js and score.mjs.

import COLUMNS from './lib/transitions/plakat.js';
import APERTURE from './lib/transitions/aperture-swap.js';
import counterPortal from './lib/handoffs/counter-portal.js';
import stepWipe from './lib/handoffs/step-wipe.js';
import slotRails from './lib/handoffs/slot-rails.js';

const COL = COLUMNS.find((d) => d.name === 'plakat-columns');
const AP = APERTURE.find((d) => d.name === 'aperture-swap');
export const LEAN_DEG = (Math.atan(146 / 420) * 180) / Math.PI; // the mode's grid diagonal (form 'diagonal'), 19.2°

// Entrances by device. `at`: where the device's window sits against the incoming scene's start, in beats from
// its start (negative: it begins inside the outgoing scene); `beats`: its length (the module's default, ≤ 2 beats,
// so every one is a T2 at its own length). `variant` is recorded in timing.json so two uses of one device differ.
export const ENTER = {
  columns: { device: 'plakat-columns', tier: 'T2', beats: COL.beats, at: -COL.beats / 2, opts: { angle: 0, twoPhase: false }, variant: 'upright' },
  'columns-lean': { device: 'plakat-columns', tier: 'T2', beats: COL.beats, at: -COL.beats / 2, opts: { angle: -LEAN_DEG, twoPhase: false }, variant: 'lean 19.2°' },
  'columns-two': { device: 'plakat-columns', tier: 'T2', beats: COL.beats, at: -COL.beats / 2, opts: { angle: 0, twoPhase: true }, variant: 'two-phase' },
  portal: { device: 'counter-portal', tier: 'T2', beats: counterPortal.beats, at: -counterPortal.beats },
  steps: { device: 'step-wipe', tier: 'T2', beats: stepWipe.beats, at: 0 },
  aperture: { device: 'aperture-swap', tier: 'T0', beats: AP.beats, at: 0 },
  reblock: { device: 'plakat-reblock', tier: 'T2', beats: 1, at: -0.5 },
};
// The block hands over only where the outgoing block and the incoming one are the same kind of thing: the stop band
// where the person decides → the flow's first node when it is the person; the ink command block → the tagline's bar.
export const reblockPair = (prev, s) => !!prev && !!s && (
  (prev.type === 'verify' && s.type === 'flow' && !!s.nodes?.[0]?.human) ||
  (prev.type === 'install' && s.type === 'tagline'));
export const SLOT_BEATS = slotRails.beats; // one word through the slot
export const AP_BEATS = AP.beats; // one aperture (0.22 s at 120 BPM)
export const isColumns = (e) => typeof e === 'string' && e.startsWith('columns');

// The scene after a figure may be entered through the figure's counter only if it opens on the accent field: the
// claim (its input half) or a run of words whose first state stands on the accent. The portal is the person's colour.
export const portalTarget = (s) => !!s && (s.type === 'claim' || (s.type === 'words' && s.states?.[0]?.ground === 'accent'));

// How scene i is entered. Explicit `enter` on the scene: 'columns', 'columns-lean', 'columns-two', 'turn' (the
// mode's page turn) or 'cut'. Defaults: `bars` arrive by the step-wipe; a scene after a figure that can take the
// portal arrives through it; `words` open their first state by the aperture; the first three chapter cards with no
// `enter` take the columns in their three variants (upright, lean, two-phase), later ones turn the page; a `flow`
// opening on the person after a `verify`, and a `tagline` after an `install`, take the block (reblock).
export const enterOf = (scenes, i) => {
  const s = scenes[i], prev = scenes[i - 1];
  if (!s || !prev) return null;
  const e = s.enter;
  if (e === 'turn' || e === 'cut') return null;
  if (s.type === 'bars') return 'steps';
  if (prev.type === 'figure' && portalTarget(s)) return 'portal';
  if (s.type === 'words') return 'aperture';
  if (isColumns(e) && ENTER[e] && s.type !== 'claim') return e;
  if (e != null) return null;
  if (reblockPair(prev, s)) return 'reblock';
  if (s.type === 'chapter') {
    const n = scenes.slice(1, i).filter((x) => x.type === 'chapter' && x.enter == null).length;
    return ['columns', 'columns-lean', 'columns-two'][n] ?? null;
  }
  return null;
};
// What ends scene i when the next scene's device covers it: 'columns', 'portal', 'aperture', else null (own exit).
// 'reblock' does not cover the scene: it keeps its own exit and only hands its block over (planScene).
export const exitOf = (scenes, i) => {
  const e = enterOf(scenes, i + 1);
  return isColumns(e) ? 'columns' : e === 'portal' || e === 'aperture' || e === 'reblock' ? e : null;
};
// u before the cut where the reblock starts (its block leaves the outgoing page there): half a beat
export const REBLOCK_LEAD = -ENTER.reblock.at / 2; // beats → u (1 u = 2 beats)
// The scene with its links: enterBy, exitBy, last. Every caller (index.html, timing.rules.js, score.mjs) plans
// a scene through this, so a scene's length, picture and sound agree on how it starts and ends.
export const linked = (scenes, i) => ({ ...scenes[i], enterBy: enterOf(scenes, i), exitBy: exitOf(scenes, i), last: i === scenes.length - 1 });

// Seconds of a device's window against the incoming scene's start: [from, to] relative to that start.
export const windowOf = (kind, beat) => { const E = ENTER[kind]; return E ? [E.at * beat, (E.at + E.beats) * beat] : null; };

// ---------- plakat-columns: exact geometry of runtime/transitions/plakat.js ----------
const sat = (x) => Math.min(1, Math.max(0, x));
const lin = (a, b, x) => sat((x - a) / (b - a));
const quint = (x) => { x = sat(x); return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2; };
const cubicOut = (x) => 1 - (1 - sat(x)) ** 3;
// Strips of the 12-column grid split at the gutters' centres (the shader's floor((sx − 96 + 12) / 146), clamped to
// 0..11), in sheared x: sx = x − slant (y − 540). The outer strips run past the frame.
const EDGES = [-900, ...Array.from({ length: 11 }, (_, k) => 84 + 146 * (k + 1)), 2820];
const shear = (pts, slant) => pts.map(([sx, y]) => [sx + slant * (y - 540), y]);
const stairs = (h) => { // the staircase edge y = h[k] over strip k, right to left
  const out = [];
  for (let k = 11; k >= 0; k--) out.push([EDGES[k + 1], h[k]], [EDGES[k], h[k]]);
  return out;
};
// p in [0, 1] → { a, b, ink }: polygons (film px) where the old page, the new page and the ink shutter show.
// null for `a` / `b` means none of it; 'all' means all of it.
export const columnsAt = (p, opts = {}) => {
  const U = COL.uniforms({ block: 200, rise: 0, ...opts });
  const slant = U.uSlant, st = U.uStagger, dur = U.uDur;
  if (p <= 0) return { a: 'all', b: null, ink: null };
  if (p >= 1) return { a: null, b: 'all', ink: null };
  let top, low;
  if (U.uTwo > 0.5) {
    top = Array.from({ length: 12 }, (_, k) => 1080 + (-2 - 1080) * quint(lin(k * st, k * st + dur, p / 0.45)));
    low = Array.from({ length: 12 }, (_, k) => 1080 + (-2 - 1080) * quint(lin(k * st, k * st + dur, (p - 0.55) / 0.45)));
  } else {
    top = Array.from({ length: 12 }, (_, k) => 1080 + (-U.uBlock - 1080) * quint(lin(k * st, k * st + dur, p)));
    low = top.map((y) => y + U.uBlock);
  }
  const clampY = (y) => Math.min(1200, Math.max(-300, y));
  const T = top.map(clampY), L = low.map(clampY);
  const a = shear([[EDGES[0], -300], [EDGES[12], -300], ...stairs(T)], slant);
  const b = shear([[EDGES[0], 1200], [EDGES[12], 1200], ...stairs(L)], slant);
  const up = []; for (let k = 0; k < 12; k++) up.push([EDGES[k], T[k]], [EDGES[k + 1], T[k]]);
  const ink = shear([...up, ...stairs(L)], slant);
  return { a, b, ink };
};
export const polyCss = (pts) => (pts === 'all' ? 'none' : !pts ? 'polygon(0px 0px, 0px 0px, 0px 0px)' : `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ')})`);

// ---------- aperture-swap: exact geometry of runtime/transitions/aperture-swap.js ----------
// The incoming state is visible where the module's mask is 1: band |y − oy| < u R; circle |s − o| < u R; close: bars
// from the top (y < u (oy + 1)) and the bottom (y > 1080 − u (1081 − oy)); cut: everywhere. u = cubic out of p.
export const APERTURE_SHAPES = ['band', 'circle', 'close', 'cut'];
export const apertureCss = (p, shape, origin) => {
  if (p <= 0) return 'polygon(0px 0px, 0px 0px, 0px 0px)';
  if (p >= 1 || shape === 'cut') return 'none';
  const u = cubicOut(p), R = AP.uniforms({ origin, shape }).uR, [ox, oy] = origin;
  if (shape === 'circle') return `circle(${(u * R).toFixed(2)}px at ${ox.toFixed(1)}px ${oy.toFixed(1)}px)`;
  if (shape === 'close') {
    const a = u * (oy + 1), b = 1080 - u * (1081 - oy);
    return `path("M0 0 H1920 V${a.toFixed(2)} H0 Z M0 ${b.toFixed(2)} H1920 V1080 H0 Z")`;
  }
  const r = u * R;
  return `polygon(0px ${(oy - r).toFixed(2)}px, 1920px ${(oy - r).toFixed(2)}px, 1920px ${(oy + r).toFixed(2)}px, 0px ${(oy + r).toFixed(2)}px)`;
};

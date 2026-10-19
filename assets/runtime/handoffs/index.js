// handoffs — object-level hand-offs: one object of the outgoing scene carries the eye into the incoming one.
//
//   import { createHandoff, list, progressAt } from './lib/handoffs/index.js';
//   const h = await createHandoff('rail-press', {          // after fonts have loaded (it measures text)
//     from: { text: 'tracewire' }, to: { text: 'rewind' },
//     font: { family: 'Bricolage Grotesque', weight: 700, size: 230 },
//     colors: { ground: pal.ground, ink: pal.text, accent: pal.line },
//   });
//   // in render(t), during the hand-off that starts at t0:
//   const dur = h.duration(BPM);                            // beats × 60 / bpm
//   h.draw(ctx, progressAt(t, t0, dur), { dur });            // p in [0, 1]; `dur` turns on motion blur where it is fast
//   // before t0 and after t0 + dur the template draws its scenes; h.still(ctx, 'from' | 'to') paints the two rests.
//
// Every hand-off has the same structure: an object of scene A (`from`) hands off, an object of scene B (`to`) takes
// over, and a few named properties interpolate between them (`interpolates` in `list`). A module computes the state at
// p (`at`), and the rests at either end (`rest`), as plain numbers; `paint` draws a state. So a frame depends on
// (name, params, p) only, p = 0 paints exactly the `from` rest and p = 1 exactly the `to` rest (test/selftest.html checks
// both), and nothing is kept from one frame to the next. Randomness comes from rng.js `hash` with `params.seed`.
//
// Params: `colors` by role (`ground`, `ink`, `accent`, `dim`, plus the few a module names in `roles`), `font` / `mono`
// ({ family, weight, size, spacing }), geometry in film px (1920 × 1080), content (`from`, `to`: text, values, painters),
// `seed`. `ground: false` draws the hand-off as a layer over the template's own scene instead of on its ground.
// Defaults render a neutral sample; a template passes its own content and palette. references/transitions.md
// documents each one (tier, when to use, parameters, theory, modes).

import { subframes } from '../canvas.js';
import { merge, maxDisp } from './util.js';

import railPress from './rail-press.js';
import slotRails from './slot-rails.js';
import arcCurl from './arc-curl.js';
import strokeReinterpret from './stroke-reinterpret.js';
import netUnfold from './net-unfold.js';
import containerMorph from './container-morph.js';
import reEncode from './re-encode.js';
import pathType from './path-type.js';
import signalRelay from './signal-relay.js';
import rouletteLock from './roulette-lock.js';
import collapseBurst from './collapse-burst.js';
import convergeMark from './converge-mark.js';
import anchorSwap from './anchor-swap.js';
import streamBrake from './stream-brake.js';
import scrambleResolve from './scramble-resolve.js';
import squashToPath from './squash-to-path.js';
import fieldMorph from './field-morph.js';
import counterPortal from './counter-portal.js';
import stepWipe from './step-wipe.js';
import beamTrace from './beam-trace.js';

const MODULES = [
  railPress, slotRails, arcCurl, strokeReinterpret, netUnfold, containerMorph, reEncode, pathType, signalRelay,
  rouletteLock, collapseBurst, convergeMark, anchorSwap, streamBrake, scrambleResolve, squashToPath, fieldMorph,
  counterPortal, stepWipe, beamTrace,
];
const BY_NAME = Object.fromEntries(MODULES.map((m) => [m.name, m]));

// name, tier (T0 micro change, T1 scene change, T2 expressive, T3 peak), default length in beats, colour roles,
// one-line summary, theory, modes that use it, who hands off, who takes over, which properties interpolate
export const list = MODULES.map(({ name, tier, beats, roles, summary, theory, modes, from, to, interpolates }) => ({ name, tier, beats, roles, summary, theory, modes, from, to, interpolates }));

export const progressAt = (t, start, dur) => Math.min(1, Math.max(0, (t - start) / dur));

const moduleOf = (name) => {
  const m = BY_NAME[name];
  if (!m) throw new Error(`unknown hand-off "${name}"; known: ${MODULES.map((x) => x.name).join(', ')}`);
  return m;
};

// Length in beats for these params (some hand-offs scale with their content: hops, characters).
export const beatsOf = (name, params = {}) => {
  const m = moduleOf(name);
  return m.beatsFor ? m.beatsFor(merge(m.defaults, params)) : m.beats;
};
export const durationOf = (name, bpm, params = {}) => (beatsOf(name, params) * 60) / bpm;

const build = (m, P, D) => {
  const at = (p) => m.at(Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)), P, D);
  const paint = (ctx, S) => { ctx.save(); m.paint(ctx, S, P, D); ctx.restore(); };
  // px per unit of p of the fastest tracked point, measured over the span of p before p (backward difference)
  const speed = (p, span = 1e-3) => {
    if (!m.track) return 0;
    const a = Math.max(0, p - span);
    return p > a ? maxDisp(m.track(at(a), P, D), m.track(at(p), P, D)) / (p - a) : 0;
  };
  const beats = m.beatsFor ? m.beatsFor(P) : m.beats;
  return {
    name: m.name,
    params: P,
    beats,
    duration: (bpm) => (beats * 60) / bpm,
    state: at,
    speed,
    // Draw the hand-off at progress p. With { dur } (seconds the hand-off lasts) frames whose fastest point moves more
    // than 1 px per frame during the exposure get sub-frame motion blur (canvas.js subframes); slower frames and the two
    // rests are sharp; { blur: false } turns it off.
    draw(ctx, p, { dur, fps = 30, blur = true, shutter = 0.5 } = {}) {
      p = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0));
      // the two rests are never blurred: p = 0 and p = 1 paint exactly the scenes on either side
      if (dur > 0 && blur && m.track && p > 0 && p < 1) {
        const span = shutter / (fps * dur);                       // the exposure, in units of p
        const v = (speed(p, span) * span) / shutter;              // px per frame of the fastest point during it
        return subframes(ctx, (c, q) => paint(c, at(q)), p, { speed: v, fps: fps * dur, shutter });
      }
      paint(ctx, at(p));
    },
    // The rest at either end: what scene A shows before the hand-off ('from') and scene B after it ('to').
    still(ctx, side = 'to') { paint(ctx, m.rest(side, P, D)); },
  };
};

// Merge params over the module's defaults, run its preparation (glyph outlines, particle targets: needs fonts loaded).
export const createHandoff = async (name, params = {}) => {
  const m = moduleOf(name);
  const P = merge(m.defaults, params);
  const D = m.prepare ? await m.prepare(P) : null;
  return build(m, P, D);
};

// One-call form for hand-offs whose preparation is synchronous (all but those that sample glyph pixels).
export const drawHandoff = (ctx, name, p, params = {}, opts = {}) => {
  const m = moduleOf(name);
  const P = merge(m.defaults, params);
  const D = m.prepare ? m.prepare(P) : null;
  if (D && typeof D.then === 'function') throw new Error(`hand-off "${name}" prepares asynchronously; use createHandoff`);
  return build(m, P, D).draw(ctx, p, opts);
};

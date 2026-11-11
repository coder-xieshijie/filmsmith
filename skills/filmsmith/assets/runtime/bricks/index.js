// bricks/index.js — one entry to every brick of the library (SPEC 3.1), next to the hand-offs and frame-level
// transitions it forwards to.
//
//   import { createBrick, progressAt } from './lib/bricks/index.js';
//   const b = await createBrick('card-portal', { from: myScenePainter, to: nextScenePainter, rect: [...] }, { lang: 'zh' });
//   // canvas: inside render(t), during the brick that starts at t0
//   b.draw(ctx, progressAt(t, t0, b.duration(BPM)), { dur: b.duration(BPM) });
//   // dom: build the rig once in a 1920 × 1080 element, then pose it every frame (the whole rig is rewritten each time)
//   b.mount(rootEl); b.pose(progressAt(t, t0, dur), { dur });
//
// A brick module exports { id, kind, tier, family, beats, beatsFor?, surface, roles, from, to, interpolates, summary,
// theory, defaults (an object, or a function of ctx = { lang, palette }), prepare?, rest(side, P, D), at(p, P, D),
// paint?(ctx, S, P, D), build?(root, P, D) → rig, pose?(rig, S, P, D), track?(S, P, D), blur?(p, P, D) }. A frame
// depends on (id, params, p) only; p = 0 paints exactly the `from` rest and p = 1 exactly the `to` rest.
// Hand-off names (handoffs/) go to createHandoff unchanged; frame-level names (transitions/) come back as a small
// wrapper around createTransitions.

import { subframes } from '../canvas.js';
import { merge, maxDisp } from '../handoffs/util.js';
import { createHandoff, list as handoffList } from '../handoffs/index.js';
import { list as transitionList } from '../transitions/index.js';
import { palette, loadPalette } from './sample.js';

export const progressAt = (t, start, dur) => Math.min(1, Math.max(0, (t - start) / dur));
const HANDOFFS = new Set(handoffList.map((h) => h.name));
const TRANSITIONS = new Set(transitionList.map((t) => t.name));

// The module of a brick: bricks/<category>/<id>/brick.js. A scene written as SPEC 3.2 (plan, paint(ctx, u, s, ctx, D),
// no at) or a prop written as SPEC 3.3 (states, draw(ctx, state, P), no at) comes back adapted to the motion shape, so
// every host and tool drives them the same way (adaptScene, adaptProp below).
export const moduleOf = async (id, category = 'motion') => adapt((await import(`./${category}/${id}/brick.js`)).default);

const ctxOf = (P) => ({ lang: P.lang || 'en', bpm: P.bpm || 120, k: P.k ?? 1, look: P.look || null });
const lerpState = (a, b, u) => Object.fromEntries(Object.keys(a).map((k) => [k, typeof a[k] === 'number' && typeof b[k] === 'number' ? a[k] + (b[k] - a[k]) * u : u < 0.5 ? a[k] : b[k]]));
const smoothstep = (u) => u * u * (3 - 2 * u);
// scene (SPEC 3.2): p runs the scene's own time u = p × plan().beats; its rests are its first and last frames
export const adaptScene = (m) => ({
  ...m, native: 'scene',
  beats: m.beats?.min ?? 4,
  beatsFor: (P) => m.plan(P, ctxOf(P)).beats,
  // SPEC 3.2: the beats of the scene's opening that may play under the previous scene's last beat (a host starts it
  // that much earlier when the seam lets the pictures overlap); the scene's own clock still starts at 0
  leadFor: (P) => Math.max(0, m.plan(P, ctxOf(P)).lead || 0),
  async prepare(P) { return m.prepare ? await m.prepare(P, ctxOf(P)) : null; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { const beats = m.plan(P, ctxOf(P)).beats; return { p, u: p * beats, beats }; },
  paint: m.paint ? (c, S, P, D) => m.paint(c, S.u, P, ctxOf(P), D) : undefined,
  build: m.pose ? (root) => ({ root, blurTarget: null }) : undefined,
  pose: m.pose ? (R, S, P, D) => m.pose(R.root, S.u, P, ctxOf(P), D) : undefined,
  track: (S, P, D) => (m.track ? m.track(S.u, P, ctxOf(P), D) : [[960, 540]]),
  blur: m.blur || (() => false),
});
// prop (SPEC 3.3): p walks its states in order, each held one beat with a one-beat move to the next (smoothstep), drawn
// centred at the size tier P.size (S, M, L; default M) on the ground role (a prop driven on its own, as in its samples;
// a scene that draws a prop calls its draw() directly, on its own ground); draw gets P with w, h of the tier
export const adaptProp = (m) => {
  const names = Object.keys(m.states || { rest: {} }), n = names.length, beats = Math.max(1, 2 * n - 1);
  const sized = (P) => { const [w, h] = (m.sizes || {})[P.size || 'M'] || [1100, 700]; return { ...P, w, h }; };
  return {
    ...m, native: 'prop', beats, beatsFor: () => beats,
    defaults: (ctx) => ({ size: 'M', ...(typeof m.defaults === 'function' ? m.defaults(ctx) : m.defaults || {}) }),
    async prepare(P) { return m.prepare ? await m.prepare(sized(P)) : null; },
    rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
    at(p) {
      const t = Math.min(beats, Math.max(0, p * beats)), k = Math.min(n - 1, Math.floor(t / 2)), local = t - 2 * k;
      const a = m.states[names[k]], b = m.states[names[Math.min(n - 1, k + 1)]];
      return { p, name: local < 1 || k === n - 1 ? names[k] : names[k + 1], state: local < 1 || k === n - 1 ? { ...a } : lerpState(a, b, smoothstep(local - 1)) };
    },
    paint: m.draw ? (c, S, P, D) => { const Q = sized(P); if (P.colors?.ground) { c.fillStyle = P.colors.ground; c.fillRect(0, 0, 1920, 1080); } c.save(); c.translate(960 - Q.w / 2, 540 - Q.h / 2); m.draw(c, S.state, Q, D); c.restore(); } : undefined,
    build: m.build ? (root, P, D) => {
      const Q = sized(P), box = document.createElement('div');
      if (P.colors?.ground) root.style.background = P.colors.ground;
      Object.assign(box.style, { position: 'absolute', left: `${960 - Q.w / 2}px`, top: `${540 - Q.h / 2}px`, width: `${Q.w}px`, height: `${Q.h}px` });
      root.appendChild(box); m.build(box, Q, D); return { root, box, blurTarget: null };
    } : undefined,
    pose: m.pose ? (R, S, P, D) => m.pose(R.box, S.state, sized(P), D) : undefined,
    track: (S) => [[960, 540]],
    blur: () => false,
  };
};
export const adapt = (m) => {
  if (!m || typeof m.at === 'function') return m;
  if (m.kind === 'scene' && typeof m.plan === 'function') return adaptScene(m);
  if (m.kind === 'prop' && (m.draw || m.pose)) return adaptProp(m);
  return m;
};

const defaultsOf = (m, ctx) => {
  const d = typeof m.defaults === 'function' ? m.defaults(ctx) : m.defaults || {};
  return merge({ colors: palette(ctx.palette || 'neutral-light'), seed: 1, lang: ctx.lang || 'en' }, d);
};
export const beatsOf = (m, P) => (m.beatsFor ? m.beatsFor(P) : m.beats);
export const durationOf = (m, bpm, P) => (beatsOf(m, P) * 60) / bpm;

export const buildModule = (m, P, D) => {
  const at = (p) => m.at(Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)), P, D);
  const stateAt = (p) => (p <= 0 ? m.rest('from', P, D) : p >= 1 ? m.rest('to', P, D) : at(p));
  // px per unit of p of the fastest tracked point over the span before p (backward difference)
  const speed = (p, span = 1e-3) => {
    if (!m.track) return 0;
    const a = Math.max(0, p - span);
    // a point a frame does not have (null: off frame, dropped by compare) does not count
    const t0 = m.track(at(a), P, D) || [], t1 = m.track(at(p), P, D) || [], k = t0.map((q, i) => (q && t1[i] ? i : -1)).filter((i) => i >= 0);
    return p > a && k.length ? maxDisp(k.map((i) => t0[i]), k.map((i) => t1[i])) / (p - a) : 0;
  };
  const beats = beatsOf(m, P);
  const blurOn = (p) => !m.blur || m.blur(p, P, D) !== false;
  let rig = null;
  return {
    id: m.id || m.name, kind: m.kind || "motion", module: m, params: P, data: D, beats, lead: m.leadFor ? m.leadFor(P) : 0, surface: m.surface,
    duration: (bpm) => (beats * 60) / bpm,
    state: stateAt, speed, track: (p) => (m.track ? m.track(stateAt(p), P, D) : []),
    // canvas: draw at p; with { dur } the frames whose fastest point moves more than 1 px during the exposure get
    // sub-frame motion blur (canvas.js subframes); the rests are always sharp.
    draw(ctx, p, { dur, fps = 30, blur = true, shutter = 0.5 } = {}) {
      if (!m.paint) throw new Error(`brick "${m.id}" has no canvas surface`);
      p = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0));
      const paint = (c, S) => { c.save(); m.paint(c, S, P, D); c.restore(); };
      if (dur > 0 && blur && m.track && p > 0 && p < 1 && blurOn(p)) {
        const span = shutter / (fps * dur);
        const v = (speed(p, span) * span) / shutter;
        return subframes(ctx, (c, q) => paint(c, stateAt(q)), p, { speed: v, fps: fps * dur, shutter });
      }
      paint(ctx, stateAt(p));
    },
    still(ctx, side = 'to') { ctx.save(); m.paint(ctx, m.rest(side, P, D), P, D); ctx.restore(); },
    // a host calls warm() once before its first frame: the brick's offscreen canvases get their first full draw
    // (a canvas filter, a first raster) off screen, so frame 0 and a later return to it draw alike (SPEC 3.1)
    warm(w = 1920, h = 1080) {
      if (!m.paint || typeof document === 'undefined') return;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      for (const q of [0, 0.5, 1]) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); this.draw(x, q); }
    },
    // dom: build the rig under root once; pose rewrites every element of it from the state at p. With { dur } a fast
    // frame gets a CSS blur on the rig's blur target, sized from the fastest tracked point (none at the rests).
    mount(root) {
      if (!m.build) throw new Error(`brick "${m.id}" has no dom surface`);
      rig = m.build(root, P, D);
      return rig;
    },
    pose(p, { dur, fps = 30, blur = true, shutter = 0.5 } = {}) {
      if (!rig) throw new Error('mount(root) first');
      p = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0));
      m.pose(rig, stateAt(p), P, D);
      const target = rig.blurTarget;
      if (target) {
        let px = 0;
        if (dur > 0 && blur && m.track && p > 0 && p < 1 && blurOn(p)) {
          const span = shutter / (fps * dur);
          px = (speed(p, span) * span) / shutter;            // px per frame of the fastest point
        }
        target.style.filter = px > 2 ? `blur(${Math.min(4, px * 0.1).toFixed(2)}px)` : "none";
      }
    },
  };
};

// Merge params over the module's defaults (filled for ctx.lang and ctx.palette), prepare, and return the brick.
// ctx = { lang, palette, category, sample }: sample true keeps optional slots' sample defaults (tools only).
export const createBrick = async (id, params = {}, ctx = {}) => {
  if (HANDOFFS.has(id)) return createHandoff(id, params);
  if (TRANSITIONS.has(id)) {
    const { createTransitions } = await import('../transitions/index.js');
    let tx = null;
    return { id, kind: 'motion', surface: ['webgl'], draw: (canvas, from, to, p, opts) => (tx ||= createTransitions(canvas)).draw(id, from, to, p, { ...params, ...opts }) };
  }
  const m = await moduleOf(id, ctx.category || 'motion');
  await loadPalette(ctx.palette);   // a palette of another look (sample.json "palette": "afterglow-dawn")
  const d = defaultsOf(m, ctx), slots = m.slots || m.swap;
  // an optional slot the caller leaves out is not drawn: its default is sample copy, kept only when ctx.sample is set
  // (the sample and check hosts), so a film never shows text it did not give
  if (!ctx.sample && slots) for (const [k, sl] of Object.entries(slots)) if (sl?.optional && !(k in params)) d[k] = sl.type === 'list' ? [] : ['text', 'code'].includes(sl.type) ? '' : null;
  // params merge over the defaults key by key (a partial `colors` keeps the rest); a param the module lists in `replace`
  // (a target given in one of several forms, such as { section } or { anchor }) replaces its default whole
  const P = merge(d, params);
  for (const k of m.replace || []) if (k in params) P[k] = params[k];
  // a role the brick declares that the palette lacks (a look's extra role under neutral-light) is drawn in the accent,
  // with a warning, instead of throwing deep in the paint; check.mjs reports it as a FAIL with the palette to use
  const declared = [...new Set([...(m.roles || []), ...(m.needs?.roles || [])])], lacks = P.colors ? declared.filter((r) => !P.colors[r]) : [];
  if (lacks.length) { console.warn(`brick ${id}: palette ${ctx.palette || 'neutral-light'} has no ${lacks.join(', ')}; drawn in accent (give it its look's palette, <look>/<id>)`); P.colors = { ...P.colors, ...Object.fromEntries(lacks.map((r) => [r, P.colors.accent || P.colors.ink])) }; }
  const D = m.prepare ? await m.prepare(P) : null;
  return buildModule(m, P, D);
};

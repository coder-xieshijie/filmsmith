// timeline.js — the fitted film as one list of moments: every scene's plan placed at its start, the key events
// and the four pacing tiers for renders/timing.json (timing.rules.js events()), and the sound cues score.mjs
// plays. film.js draws from the same scene plans, so a word, its sound and its key can never drift apart.
import { C, planAt, leadSec, tailSec, popsOf } from './choreo.js';
import { outOf, inOf, factsFor, TRANSITIONS, CANVAS } from './registry.js';

// Device ids of the expressive transitions (runtime/transitions and runtime/handoffs naming, PLAN batch 4 §3).
export const DEVICE = { whip: 'whip-push', slice: 'slice-smear', portal: 'counter-portal', invert: 'aperture-swap' };

// Window of the transition between scene i and i+1, absolute seconds: [a, b] around the boundary.
export const windowOf = (kind, boundary, B) => {
  switch (kind) {
    case 'aperture': return [boundary - C.apLeadSec, boundary - C.apLeadSec + C.apSec];
    case 'whip': return [boundary - C.whipSec, boundary];
    case 'slice': return [boundary - C.sliceLeadSec, boundary - C.sliceLeadSec + C.sliceDurSec];
    case 'portal': return [boundary - C.portal * B, boundary];
    case 'build': return [boundary - C.build * B, boundary + C.build * B]; // lib whiteout-slam: the build, the hit on the boundary, the shock
    default: return [boundary, boundary];
  }
};

export const timelineOf = (scenes, g, content) => {
  const B = g.beat, bar = g.bar;
  const f = factsFor(content, { bpm: g.bpm, bars: scenes.reduce((n, s) => n + s.bars, 0), duration: scenes.at(-1)?.end ?? 0 });
  const form = content.aperture || 'cut';
  const memo = [];
  const laid = scenes.map((s, i) => {
    // a search into a reveal turns any time the fit added past its need into extra highlight laps
    const extra = s.type === 'search' && outOf(scenes, i) === 'build' && Number.isFinite(s.need) ? Math.max(0, s.end - s.start - s.need) : 0;
    const p = planAt(scenes, i, B, f, form, memo, extra);
    const outKind = outOf(scenes, i);
    // the beat pops that split a last hold the fitted length stretched past two beats (choreo.js popsOf)
    const pops = popsOf(s, p, B, outKind, s.end - s.start);
    return { ...s, i, plan: p, inKind: inOf(scenes, i), outKind, pops };
  });
  const D = laid.at(-1)?.end ?? 0;
  const keys = [], holds = [], handoffs = [], micro = [], shots = [], expressive = [], peaks = [], cues = [];
  const key = (t, kind, i, extra = {}) => keys.push({ t, kind, scene: i, ...extra });
  const mic = (t, i, what) => micro.push({ t, scene: i, what });
  const cue = (t, kind, extra = {}) => cues.push({ t, kind, ...extra });

  laid.forEach((sc, i) => {
    const p = sc.plan, t0 = sc.start;
    const T = (x) => t0 + x;
    // the way in: transitions are drawn from the outgoing side, their sound sits on the landing
    if (i > 0) {
      const k = sc.inKind;
      const [a] = windowOf(k, t0, B);
      if (TRANSITIONS[k]?.tier === 'T2') expressive.push({ t: a, dur: windowOf(k, t0, B)[1] - a, device: DEVICE[k], variant: { kind: k, from: laid[i - 1].type, into: sc.type }, scene: i });
      if (k === 'whip') cue(a, 'whip', { dur: C.whipSec });
      if (k === 'slice') cue(a, 'slice', { dur: C.sliceSec });
      if (k === 'portal') { cue(a, 'portal', { dur: C.portal * B }); handoffs.push({ t: t0, scene: i }); }
      if (k === 'invert') cue(t0, 'invert');
      if (k === 'aperture') cue(t0, 'aperture');
      if (k === 'build') cue(a, 'build', { dur: C.build * B });
    }
    sc.pops.forEach((t) => mic(T(t), i, 'beat pop'));
    switch (sc.type) {
      case 'ask':
        p.states.forEach((st) => {
          key(T(st.land), 'land', i);
          cue(T(st.land), st.hook ? 'hook' : 'word', { k: st.k, ground: st.ground, ap: st.ap });
          if (st.param) cue(T(st.paramAt), 'type', { n: st.param.length, cps: 1 / C.typeSec });
          if (st.param && Math.abs(st.paramAt - st.land) > 1e-6) mic(T(st.paramAt), i, 'query fragment');
        });
        if (p.states[0]?.hook) peaks.push({ t: T(p.states[0].land), kind: 'hook', scene: i });
        break;
      case 'search':
        p.hops.forEach((h) => {
          mic(T(h.t), i, h.slot ? 'hop to the empty slot' : h.known ? 'hop over a known candidate' : 'hop');
          if (!h.known) key(T(h.t), 'land', i);
          cue(T(h.t), h.slot ? 'slot' : 'hop', { k: h.i, known: !!h.known });
        });
        p.valueAt.forEach((v, k) => v != null && cue(T(v), 'value', { k }));
        if (p.scrambleFrom != null) cue(T(p.scrambleFrom), 'scramble', { dur: (p.resolveAt ?? (sc.end - t0)) - p.scrambleFrom });
        if (p.lock != null) { key(T(p.lock), 'accent', i); cue(T(p.lock), 'lock'); mic(T(p.lock), i, 'lock'); }
        if (p.result != null) {
          key(T(p.result), 'land', i);
          shots.push({ t: T(p.result), scene: i, what: 'verdict at the anchor' });
          cue(T(p.result), p.best < 0 ? 'fail' : 'result');
          if (p.summary) { mic(T(p.summaryAt), i, 'query appends the summary'); cue(T(p.summaryAt), 'type', { n: p.summary.length, cps: 1 / C.typeSec }); }
        }
        break;
      case 'data':
        p.rows.forEach((r) => {
          key(T(r.land), 'land', i);
          mic(T(r.land), i, 'figure');
          if (!r.instant) mic(T(r.labelAt), i, 'label');
          cue(T(r.land), r.instant ? 'figure-in' : r.count ? 'count' : 'figure', { dur: r.resolved - r.land, k: r.k });
        });
        if (p.query) { mic(T(p.queryAt), i, 'query'); cue(T(p.queryAt), 'type', { n: p.query.length, cps: 1 / C.typeSec }); }
        break;
      case 'reveal':
        key(t0, 'claim', i, { drop: true });
        peaks.push({ t: t0, kind: 'reveal', climax: true, scene: i });
        cue(t0, 'whiteout');
        if (p.line) { mic(T(p.lineAt), i, 'line'); cue(T(p.lineAt), 'rise'); }
        if (p.query) { mic(T(p.queryAt), i, 'query'); cue(T(p.queryAt), 'type', { n: p.query.length, cps: 1 / C.typeSec }); }
        // a reveal that closes the film (the shortest cut) lands again: the ground flips once more around the fixed
        // answer on the downbeat of the last bar, as the name does
        if (!sc.outKind) {
          const last = Math.max(sc.start + 4 * B, sc.end - bar);
          sc.endMove = last;
          key(last, 'end', i);
          cue(last, 'end');
          // the answer on its new ground is the cut's lock-up: a new composition and the last peak
          shots.push({ t: last, scene: i, what: 'the answer lands again' });
          peaks.push({ t: last, kind: 'lockup', scene: i });
        }
        if (p.line) {
          // the claim is read in a pause: from the line landing until the way out (or the closing move) starts
          const from = T(p.lineAt + C.riseSec), to = sc.outKind ? sc.end - leadSec(sc.outKind, B) : sc.endMove;
          if (to - from > 0.2) holds.push({ from, to, scene: i, pause: true });
        }
        break;
      case 'name': {
        key(t0, 'land', i);
        peaks.push({ t: t0, kind: 'lockup', scene: i });
        cue(t0, 'name');
        if (p.lineAt != null && sc.line) { mic(T(p.lineAt), i, 'line'); cue(T(p.lineAt), 'rise'); }
        if (p.install) { mic(T(p.installAt), i, 'install'); cue(T(p.installAt), 'type', { n: p.install.length, cps: C.installCps, loud: true }); }
        // the second move: the ground flips once more around the fixed name, on the downbeat of the last bar
        const last = Math.max(sc.start + 2 * B, sc.end - bar);
        sc.endMove = last;
        key(last, 'end', i);
        cue(last, 'end');
        if (p.typed != null && last - C.apLeadSec - T(p.typed) > 0.2) holds.push({ from: T(p.typed), to: last - C.apLeadSec, scene: i });
        break;
      }
    }
  });
  // turns get a high tick on top of their low landing (an onset above 1.5 kHz)
  keys.sort((a, b) => a.t - b.t);
  cues.sort((a, b) => a.t - b.t);
  return { laid, D, keys, holds, handoffs, micro, shots, expressive, peaks, cues, mask: null, facts: f };
};

export { CANVAS, tailSec };

// timeline.js — the fitted film as one list of moments: every scene's plan (choreo.js) placed at its start, the key
// events and the four pacing tiers for renders/timing.json (timing.rules.js events()), and the sound cues score.mjs
// plays. film.js draws from the same plans, so a stroke, its sound and its key can never drift apart.
import { C, CB, planOf, popsOf, enterOf, isChange, changeSpec, outSec } from './choreo.js';

export const timelineOf = (scenes, g, content) => {
  const B = g.beat, bar = g.bar;
  const laid = scenes.map((s, i) => {
    const p = planOf(scenes, i, B);
    const dur = s.end - s.start;
    return { ...s, i, plan: p, dur, pops: popsOf(scenes, i, B, dur), out: outSec(scenes, i, B), enter: enterOf(scenes, i) };
  });
  const D = laid.at(-1)?.end ?? 0;
  const keys = [], holds = [], micro = [], shots = [], expressive = [], peaks = [], cues = [];
  const used = {}; // device → uses so far (the variant names what changed since the last one)

  laid.forEach((sc, i) => {
    const t0 = sc.start, T = (x) => t0 + x;
    // the page change into this scene runs in the previous scene's last beats (choreo.js CHANGES)
    if (i > 0 && isChange(sc.enter)) {
      const spec = changeSpec(sc.enter), dur = spec.beats * B, a = t0 - dur / 2, device = spec.device;
      used[device] = (used[device] ?? 0) + 1;
      const variant = sc.enter === 'turn' ? { edge: sc.edge ?? 'top' } : { into: `exhibit ${sc.ex}`, use: used[device] };
      if (spec.tier === 'T2') expressive.push({ t: a, dur, device, variant, scene: i - 1 });
      else micro.push({ t: a, scene: i - 1, what: `page change: ${device}` });
      if (sc.enter === 'match-cut') { micro.push({ t: a + dur / 2, scene: i - 1, what: 'the cut, on the matched value' }); }
      cues.push({ t: a, kind: spec.sound, dur });
    }
    for (const m of sc.plan.moments) {
      const t = T(m.t);
      if (m.micro && m.t > 1e-6) micro.push({ t, scene: i, what: m.what });
      if (m.key) keys.push({ t, kind: m.key, scene: i, ...(m.climax ? { drop: true } : {}) });
      if (m.peak) peaks.push({ t, kind: m.peak, scene: i, ...(m.climax ? { climax: true } : {}) });
      if (m.sound) cues.push({ t, kind: m.sound, ...(m.beats ? { dur: m.beats * B } : {}), ...(m.climax ? { drop: true } : {}) });
      if (m.kind === 'lift') {
        // the value carried as a paper slip: lifted, set in code, laid on the worksheet (T2, two beats)
        expressive.push({ t, dur: CB.slip * B, device: 'dossier-slip', variant: { from: 'exhibit', to: 'worksheet' }, scene: i });
      }
      if (m.kind === 'stack') {
        expressive.push({ t, dur: CB.stack * B, device: 'dossier-stack', variant: { out: 'the file' }, scene: i });
        cues.push({ t, kind: 'stack', dur: CB.stack * B });
      }
    }
    sc.pops.forEach((t) => { micro.push({ t: T(t), scene: i, what: 'the focus pressed again' }); cues.push({ t: T(t), kind: 'pop' }); });
    if (sc.type === 'result') {
      // the claim is read in a pause: from its last word landing until the next scene
      const from = T(sc.plan.pauseFrom), to = sc.end;
      if (to - from > 0.2) holds.push({ from, to, scene: i, pause: true });
    }
    if (sc.type === 'lockup') {
      // the second move: the URL is underlined on the downbeat of the last bar
      const last = Math.max(T(sc.plan.urlAt + C.settle + 0.5), sc.end - bar);
      const lastBeat = Math.round(last / B) * B;
      sc.endMove = lastBeat;
      keys.push({ t: lastBeat, kind: 'end', scene: i });
      cues.push({ t: lastBeat, kind: 'end' });
      micro.push({ t: lastBeat, scene: i, what: 'the URL is underlined' });
    }
  });
  const byT = (a, b) => a.t - b.t;
  [keys, micro, shots, expressive, peaks, cues].forEach((x) => x.sort(byT));
  return { laid, D, keys, holds, micro, shots, expressive, peaks, cues, mask: null };
};

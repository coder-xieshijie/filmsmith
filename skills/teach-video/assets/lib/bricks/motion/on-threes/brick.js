// on-threes — a time modifier around any canvas motion brick: the move is drawn on threes (each pose held three frames,
// like hand-drawn animation) until a switch, two impact frames mark the switch, and the rest runs on ones, smooth.
// Adapted from video-shotcraft demos/rhythm/sakuga-timing-shift/SakugaTimingShift.tsx (card references/shots/rhythm/sakuga-timing-shift.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the upstream's paper sheet, cel card, timesheet,
// corner label and speed lines are gone: what is kept is the timing rule (stepped on threes, impact frames, then on
// ones) applied to any inner brick's progress; the impact frames invert the picture instead of an ink ground with focus
// lines; no motion blur while stepped (each held pose is sharp).
import { createBrick } from '../../index.js';
import { quantize } from '../../time.js';

export default {
  id: 'on-threes', kind: 'motion',
  tier: 'T1', family: 'edit-cut', beats: 4,
  beatsFor: (P) => P.beats,
  surface: ['canvas'],
  roles: [], modifier: true,   // wraps an inner brick, which reads the roles
  from: 'the inner brick\'s first rest',
  to: 'the inner brick\'s last rest',
  interpolates: ['the inner brick\'s progress, held every `every` frames until `switch`, continuous after'],
  summary: 'Runs any motion brick on threes (each pose held three frames) until a switch, marks the switch with two inverted impact frames, then lets the rest run smooth on ones.',
  theory: 'Limited animation holds drawings for two or three frames; switching to ones for the climax makes the fast part feel faster by contrast (sakuga timing, the "on threes / on ones" shift of Japanese key animation); the impact frames are its punctuation.',
  sceneRest: false,
  defaults: () => ({ inner: { id: 'card-portal', params: {} }, beats: 4, every: 3, switch: 0.5, impact: 2, fpb: 15 }),
  async prepare(P) {
    const inner = await createBrick(P.inner.id, { lang: P.lang, colors: P.colors, ...(P.inner.params || {}) }, { lang: P.lang, category: P.inner.category || 'motion' });
    return { inner };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const frames = P.beats * P.fpb, f = Math.floor(p * frames + 1e-6), sw = Math.floor(P.switch * frames + 1e-6);
    const stepped = p < 1 && f < sw;
    const q = stepped ? quantize(p, P.every, frames) : p;
    return { p, q, stepped, impact: p < 1 && f >= sw && f < sw + P.impact };
  },
  paint(ctx, S, P, D) {
    D.inner.draw(ctx, S.q);
    if (S.impact) {
      ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
    }
  },
  blur: (p, P, D) => !(p * P.beats * P.fpb < Math.floor(P.switch * P.beats * P.fpb + 1e-6)),
  track(S, P, D) { return D.inner.track(S.q); },
};

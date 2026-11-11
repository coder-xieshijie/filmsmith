// crop-cuts — one picture cut to tighter crops of itself on the beat, each cut a hard cut; optionally a flash per cut.
// Adapted from video-shotcraft demos/rhythm/rhythm-interrupt-moves/JumpCutPunchIn.tsx (card references/shots/rhythm/rhythm-interrupt-moves.md)
// and demos/rhythm/beat-cut-moves/PaparazziFlash.tsx (card references/shots/rhythm/beat-cut-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the picture is the scene's own painter; cuts fall on
// beats (`every`) instead of fixed frames; the two shots are one brick (`flash: false` the jump cut with its darkening
// pulse, `flash: true` the white flash with the cut-in settle); colours by role (the ring is the accent, the flash the
// paper); brand, demo copy, the viewfinder HUD, vignette and grain removed.
import { clamp, lerp, rgba, rrect, seg } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

// Steps of the picture: the time of each cut in beats from the start, and the crop shown from it.
const cutsOf = (P) => P.crops.map((c, i) => ({ at: i * P.every, crop: c }));

export default {
  id: 'crop-cuts', kind: 'motion',
  tier: 'T1', family: 'edit-cut', beats: 5,
  beatsFor: (P) => (P.crops.length - 1) * P.every + P.settle,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'paper'],
  from: 'a picture (the scene painter) at its full framing',
  to: 'the same picture at the last, tightest crop',
  interpolates: ['crop: hard cut on each beat', 'a slow drift inside each step', 'the ring around the subject deepens at the last cut'],
  summary: 'The same picture jumps to tighter crops of itself on the beat, hard cuts with no tween, and holds on the subject.',
  theory: 'The jump cut keeps the framing axis and only changes the size, so the eye stays on the subject while the cut marks the beat (Reisz & Millar, The Technique of Film Editing); steps under 1.5× read as a shake, so each is at least that.',
  sceneRest: true,
  defaults: () => ({
    from: { scene: 'grid', target: 4 },
    // [centre x, centre y, zoom]: the full frame, then two steps into the target card (≥ 1.5× each)
    crops: [[960, 540, 1], [960, 627, 1.6], [960, 812, 2.6]],
    every: 2, settle: 1, drift: 0.008,
    ring: gridRect(4), flash: false, pulse: 0.08, bpm: 120,
  }),
  prepare(P) { return { from: painterOf(P.from, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const total = (P.crops.length - 1) * P.every + P.settle, b = p * total;
    const cuts = cutsOf(P);
    let k = 0;
    for (let i = 1; i < cuts.length; i++) if (b >= cuts[i].at) k = i;
    const last = k === cuts.length - 1;
    // drift inside a step: in-out over the step, or ease-out over `settle` at the last one, then still
    const local = last ? EASE.out(seg(b, cuts[k].at, cuts[k].at + P.settle)) : EASE.smooth(seg(b, cuts[k].at, cuts[k].at + P.every));
    const since = (b - cuts[k].at) * (total > 0 ? 1 : 0);            // beats since this step's cut
    const fr = since * (60 / P.bpm) * 30;                             // frames since the cut (flash and pulse last frames, not beats)
    const flash = P.flash && k > 0 ? 0.95 * (1 - EASE.out(clamp(fr / 4))) * (fr <= 4 ? 1 : 0) : 0;
    const pop = P.flash && k > 0 ? 1 + 0.03 * (1 - EASE.out(clamp(fr / 6))) : 1;
    const dark = !P.flash && k > 0 && fr < 2 ? P.pulse : 0;
    const lock = last ? EASE.out(seg(b, cuts[k].at, cuts[k].at + P.settle * 0.5)) : 0;
    const [cx, cy, z] = cuts[k].crop;
    return { p, k, crop: [cx, cy, z * (1 + P.drift * local) * pop], flash, dark, lock: p >= 1 ? 1 : lock };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, [cx, cy, z] = S.crop;
    if (S.k === 0 && z === 1 && cx === 960 && cy === 540 && !S.flash && !S.dark && S.lock === 0) return D.from(ctx);
    ctx.save();
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-cx, -cy);
    D.from(ctx);
    if (P.ring && (S.k > 0 || S.lock > 0)) {
      const [x, y, w, h] = P.ring;
      ctx.lineWidth = 1.5 / Math.max(1, z * 0.6);
      rrect(ctx, x - 5, y - 5, w + 10, h + 10, 19);
      ctx.strokeStyle = rgba(c.accent, lerp(0.42, 0.85, S.lock)); ctx.stroke();
      rrect(ctx, x - 10, y - 10, w + 20, h + 20, 24);
      ctx.lineWidth = 5; ctx.strokeStyle = rgba(c.accent, lerp(0.07, 0.14, S.lock)); ctx.stroke();
    }
    ctx.restore();
    if (S.dark) { ctx.fillStyle = rgba('#000000', S.dark); ctx.fillRect(0, 0, 1920, 1080); }
    if (S.flash > 0.004) { ctx.fillStyle = rgba(c.paper, S.flash); ctx.fillRect(0, 0, 1920, 1080); }
  },
  // the subject's box on screen: corners of the ring (or of the frame) under the current crop
  track(S, P) {
    const [cx, cy, z] = S.crop, [x, y, w, h] = P.ring || [0, 0, 1920, 1080];
    const at = (a, b) => [960 + (a - cx) * z, 540 + (b - cy) * z];
    return [at(x, y), at(x + w, y), at(x, y + h), at(x + w, y + h), at(x + w / 2, y + h / 2)];
  },
  blur: () => false,                   // hard cuts: never average two crops across a cut
};

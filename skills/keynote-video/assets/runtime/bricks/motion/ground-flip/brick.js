// ground-flip — the accent of a film made by its ground: an aurora rises slowly from the foot of a light frame, then the
// whole ground drops to near black in about a third of a second and the aurora is pressed into an afterglow; the old
// line blurs away before the flip, the new one blurs in after a gap.
// Adapted from video-shotcraft demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx
// (card references/shots/effects/aurora-bloom-bg-flip.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the two grounds are the light and the dark preset of
// one look (default neutral-light → neutral-dark), the aurora is the afterglow look's bloom texture in the accent;
// the two lines are the two scenes' own painters, blurred out and in as wholes (word by word staggers are the text
// bricks'); brand and demo copy removed; the top light, sky light, vignette and grain are the style's.
import { clamp, lerp, mix, rgba, seg, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { painterOf, palette } from '../../sample.js';
import { bloom, bloomBox } from '../../look/afterglow/texture.js';

const F = 156;
const outCubic = (u) => 1 - Math.pow(1 - clamp(u), 3), inOutQuad = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const inQuad = (u) => clamp(u) * clamp(u), outQuint = (u) => 1 - Math.pow(1 - clamp(u), 5);
const overshoot = bez(0.34, 1.45, 0.64, 1);
const T = { rise: [0.04, 0.56], flip: [0.57, 0.64], out: [0.4, 0.58], in: [0.7, 0.86] };

export default {
  id: 'ground-flip', kind: 'motion',
  tier: 'T3', family: 'shape', beats: 10.4,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'paper'],
  from: 'a scene on the light preset of the look',
  to: 'a scene on the dark preset of the same look, an afterglow at its foot',
  interpolates: ['aurora rise 32 % → −6 % of the frame, scale 1 → 1.25 (out cubic, 4–56 %)', 'ground light → dark (in-out quad, 57–64 %: about 0.36 s)', 'aurora 1 → 0.4, pale fringe 1 → 0', 'old scene blur 0 → 32 px and out (40–58 %), new scene blur 32 → 0 and in (70–86 %)'],
  summary: 'An aurora rises slowly from the foot of a light frame, then the ground drops to near black in a third of a second and the aurora becomes an afterglow; the next line blurs in after a gap.',
  theory: 'A change of ground is the largest luminance change a frame can make, so made fast after a long build it is the strongest accent available (von Restorff isolation; the build is anticipation); the empty gap before the next line lets the eye take the change before reading (one thing at a time, Mayer\'s segmenting).',
  defaults: (ctx = {}) => ({ from: { scene: 'title', key: 'titleLong', size: ctx.lang === 'zh' ? 104 : 120 }, to: { scene: 'title', key: 'claim' }, toPalette: 'neutral-dark', blur: 32, rise: 24 }),
  prepare(P) {
    const dark = typeof P.toPalette === 'string' ? palette(P.toPalette) : P.toPalette;
    const buf = canvasOf(1920, 1080); buf.getContext('2d', { willReadFrequently: true });
    return { from: painterOf(P.from, P), to: painterOf({ ...P.to, colors: dark }, P), dark, buf };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const t = p;
    return { p, t, rise: outCubic(seg(t, ...T.rise)), flip: inOutQuad(seg(t, ...T.flip)), squash: overshoot(seg(t, T.flip[0], T.flip[1] + 0.06)),
      out: inQuad(seg(t, ...T.out)), in: outQuint(seg(t, ...T.in)) };
  },
  paint(ctx, S, P, D) {
    const L = P.colors, Dk = D.dark;
    ctx.fillStyle = mix(L.ground, Dk.ground, S.flip); ctx.fillRect(0, 0, 1920, 1080);
    bloom(ctx, S, { ...Dk, accent: mix(L.accent, Dk.accent, S.flip), paper: L.paper });
    const b = D.buf.getContext('2d', { willReadFrequently: true });
    // the old line: its own pixels darken over the light (its pale ground does not cover the aurora)
    if (S.out < 1) {
      b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, 1920, 1080); D.from(b);
      ctx.save(); ctx.globalCompositeOperation = 'darken'; ctx.globalAlpha = 1 - S.out;
      if (S.out > 0.005) ctx.filter = `blur(${(S.out * P.blur).toFixed(2)}px)`;
      ctx.translate(0, -S.out * P.rise * 0.8); ctx.drawImage(D.buf, 0, 0); ctx.restore();
    }
    // the new line: its own pixels lighten over the dark (its dark ground does not cover the afterglow)
    if (S.in > 0) {
      b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, 1920, 1080); D.to(b);
      ctx.save(); ctx.globalCompositeOperation = 'lighten'; ctx.globalAlpha = S.in;
      if (S.in < 0.995) ctx.filter = `blur(${((1 - S.in) * P.blur).toFixed(2)}px)`;
      ctx.translate(0, (1 - S.in) * P.rise); ctx.drawImage(D.buf, 0, 0); ctx.restore();
    }
  },
  blur() { return false; },
  track(S) { const B = bloomBox(S); return [B.at(B.x0, B.y0), B.at(B.x0 + B.W / 2, B.y0 + B.H / 2)]; },
};

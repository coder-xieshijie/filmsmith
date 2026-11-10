// card-portal — a card of the current scene grows into a full-frame window; the next scene grows from inside it.
// Adapted from video-shotcraft demos/transition/shot-transitions/PortalWipeV2.tsx (card references/shots/transition/shot-transitions.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and
// screenshots removed; the card and the world are the two scenes' own painters (the card face is the outgoing scene
// cropped to the card, so the rests are the scenes pixel for pixel); the neighbours' dimming is a ground veil over the
// outgoing scene; the resting shadow belongs to the scene, so the lift shadow grows from nothing; the parallax spread
// and chart draw of the upstream world are the incoming painter's own arrival, driven by the brick's progress.
import { clamp, lerp, mix, rgba, rrect, seg } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

// Phases in p (upstream: 60 frames from frame 14): hover 0–12, grow 12–52, spread 28–60, veil 12–46
const PH = { hover: [0, 0.2], grow: [0.2, 0.8667], spread: [0.4667, 1], veil: [0.2, 0.7667] };

export default {
  id: 'card-portal', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink'],
  from: 'a card in the current scene (its rect)',
  to: 'the next scene, full frame; it may use the arrival progress (parallax, a line drawing in)',
  interpolates: ['card rect → frame rect', 'corner radius → 0', 'inner scale 0.42 → 1', 'card face opacity 1 → 0 over the first 28 % of the growth', 'lift and shadow'],
  summary: 'A card lifts, then grows into a full-frame window; the next scene grows from inside it while the card face fades.',
  theory: 'Part–whole continuity: the card the eye is on becomes the frame, so the change of scene reads as entering that item (object constancy, Heer & Robertson 2007); slow–fast–slow growth is the acceleration of a real camera move.',
  sceneRest: true,
  defaults: () => ({
    from: { scene: 'grid', target: 4 }, to: { scene: 'detail' },
    rect: gridRect(4), radius: 22,
    lift: 10, liftScale: 1.03, dim: 0.18, veil: 0.26, inner: 0.42, face: 0.28, elevation: 56,
  }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const hover = EASE.snappy(seg(p, ...PH.hover));
    const t = EASE.portal(seg(p, ...PH.grow));
    const spread = EASE.out(seg(p, ...PH.spread));
    const veil = P.veil * EASE.out(seg(p, ...PH.veil));
    const [cx, cy, cw, ch] = P.rect, s0 = 1 + (P.liftScale - 1) * hover;
    const c0 = [cx - (cw * (s0 - 1)) / 2, cy - P.lift * hover - (ch * (s0 - 1)) / 2, cw * s0, ch * s0];
    const rect = [lerp(c0[0], 0, t), lerp(c0[1], 0, t), lerp(c0[2], 1920, t), lerp(c0[3], 1080, t)];
    const elev = (18 * hover) * (1 - t) + P.elevation * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - t);
    return { p, hover, t, spread, veil, rect, radius: lerp(P.radius, 0, t), inner: lerp(P.inner, 1, t), face: Math.max(0, 1 - t / P.face), elev };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    if (S.t >= 1) return D.to(ctx, S.spread);
    D.from(ctx);
    if (S.hover === 0 && S.t === 0) return;
    if (S.hover > 0) { ctx.fillStyle = rgba(c.ground, P.dim * S.hover); ctx.fillRect(0, 0, 1920, 1080); }
    if (S.veil > 0.002) { ctx.fillStyle = rgba(mix(c.ground, '#000000', 0.75), S.veil); ctx.fillRect(0, 0, 1920, 1080); }
    const [x, y, w, h] = S.rect;
    if (S.elev > 0.5) {
      ctx.save();
      ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.28);
      ctx.shadowBlur = S.elev * 1.3; ctx.shadowOffsetY = S.elev * 0.55;
      rrect(ctx, x, y, w, h, S.radius); ctx.fillStyle = c.ground; ctx.fill();
      ctx.restore();
    }
    ctx.save();
    rrect(ctx, x, y, w, h, S.radius); ctx.clip();
    if (S.t > 0) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(S.inner, S.inner); ctx.translate(-960, -540);
      D.to(ctx, S.spread);
      ctx.restore();
    }
    if (S.face > 0) {
      const [cx, cy, cw, ch] = P.rect;
      ctx.globalAlpha = S.face;
      ctx.translate(x, y); ctx.scale(w / cw, h / ch); ctx.translate(-cx, -cy);
      D.from(ctx);
    }
    ctx.restore();
  },
  track(S) { const [x, y, w, h] = S.rect; return [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y + h / 2]]; },
};

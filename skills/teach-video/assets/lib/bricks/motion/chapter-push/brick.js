// chapter-push — the next scene, ground and all, pushes the current one off the frame from one edge, as one rigid slab.
// Adapted from video-shotcraft demos/transition/bottom-push-stack-wipe/BottomPushStackWipe.tsx (card references/shots/transition/bottom-push-stack-wipe.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and
// screenshots removed; one push per brick (the upstream's three chapters are three uses of it); the direction is a
// parameter (the upstream pushes up only); no speed blur and no grain (the slab's edge stays sharp, so the seam reads);
// the contact shadow's colour is the ground mixed with black instead of each chapter's own shade.
import { bez, mix, rgba } from '../../../handoffs/util.js';
import { painterOf } from '../../sample.js';

// the upstream's pinned push curve: fast in, long soft stop (26 frames at 30 fps)
const HEAVY = bez(0.12, 0.9, 0.2, 1);
const DIRS = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }; // where the incoming scene starts, in frames

export default {
  id: 'chapter-push', kind: 'motion',
  tier: 'T1', family: 'vertical', beats: 1.75,
  surface: ['canvas'],
  roles: ['ground'],
  from: 'the current scene, full frame',
  to: 'the next scene, full frame, with its own ground',
  interpolates: ['both scenes offset together by one frame (rigid)', 'contact shadow and lit edge on the seam while it moves'],
  summary: 'The next scene, ground and all, pushes the current one off the frame from one edge in one heavy ease-out.',
  theory: 'A rigid push keeps both pictures in one plane, so the cut reads as turning a page of the same document (spatial continuity of a single sheet); fast-in, slow-stop motion carries weight (Thomas & Johnston, The Illusion of Life: slow out of a heavy object).',
  sceneRest: true,
  defaults: () => ({ from: { scene: 'title' }, to: { scene: 'detail' }, direction: 'up', seam: 56, shade: 0.42, edge: 0.45 }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const e = p <= 0 ? 0 : p >= 1 ? 1 : HEAVY(p);
    const [dx, dy] = DIRS[P.direction] || DIRS.up;
    const size = dx ? 1920 : 1080;
    // incoming offset (1 − e) frames from its edge; the outgoing scene moves by the same amount
    return { p, e, inc: [dx * (1 - e) * size, dy * (1 - e) * size], out: [-dx * e * size, -dy * e * size] };
  },
  paint(ctx, S, P, D) {
    if (S.e <= 0) return D.from(ctx);
    if (S.e >= 1) return D.to(ctx, 1);
    const c = P.colors, [dx, dy] = DIRS[P.direction] || DIRS.up;
    ctx.save(); ctx.translate(S.out[0], S.out[1]); D.from(ctx); ctx.restore();
    // contact shadow on the outgoing scene, just ahead of the seam (near solid, far soft)
    const sx = S.inc[0], sy = S.inc[1], shade = mix(c.ground, '#000000', 0.8);
    ctx.save();
    const g = dy
      ? ctx.createLinearGradient(0, dy > 0 ? sy : sy + 1080, 0, dy > 0 ? sy - P.seam : sy + 1080 + P.seam)
      : ctx.createLinearGradient(dx > 0 ? sx : sx + 1920, 0, dx > 0 ? sx - P.seam : sx + 1920 + P.seam, 0);
    g.addColorStop(0, rgba(shade, P.shade)); g.addColorStop(0.4, rgba(shade, P.shade * 0.29)); g.addColorStop(1, rgba(shade, 0));
    ctx.fillStyle = g;
    if (dy) ctx.fillRect(0, dy > 0 ? sy - P.seam : sy + 1080, 1920, P.seam);
    else ctx.fillRect(dx > 0 ? sx - P.seam : sx + 1920, 0, P.seam, 1080);
    ctx.restore();
    ctx.save(); ctx.translate(sx, sy); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080); ctx.clip(); D.to(ctx, 1); ctx.restore();
    // the slab's lit leading edge, 2 px
    ctx.fillStyle = rgba('#FFFFFF', P.edge);
    if (dy) ctx.fillRect(0, dy > 0 ? sy : sy + 1078, 1920, 2); else ctx.fillRect(dx > 0 ? sx : sx + 1918, 0, 2, 1080);
  },
  blur: () => false,
  // 0: the incoming scene's leading edge (middle), 1: the outgoing scene's centre
  track(S, P) {
    const [dx, dy] = DIRS[P.direction] || DIRS.up;
    const lead = dy ? [960 + S.inc[0], dy > 0 ? S.inc[1] : S.inc[1] + 1080] : [dx > 0 ? S.inc[0] : S.inc[0] + 1920, 540 + S.inc[1]];
    return [lead, [960 + S.out[0], 540 + S.out[1]]];
  },
};

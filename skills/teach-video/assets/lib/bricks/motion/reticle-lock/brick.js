// reticle-lock — four L-shaped corners fly in as one frame, shrink past the target, bite onto it, and a small label pops.
// Adapted from video-shotcraft demos/effects/fui-hud-moves/ReticleLockOn.tsx (card references/shots/effects/fui-hud-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (corners in the accent on a paper
// underlay, the lock glow in paper, the veil ground mixed with black, the label pill ink on ground); brand, demo copy
// and the dashboard removed (the target is a rect of the caller's scene, the label is the film's text); the slow camera
// push is the style's; `fly: [0, 0]` with `grow` gives the in-place collapse of the corner brackets other scan scenes use.
// Variant `corners: 'own'` (from demos/data/scroll-brake-moves/BrakeReticleLock.tsx, same repo and commit): each corner
// flies in from its own side (±620, ±320) over 9 frames with back-out 2.4, no shrink or bite of its own (the overshoot is
// the bite); the label pops beside the target at +4 frames (0.6 → 1, back-out 2.6). Its frame 0 is the frame something
// stops (stream-brake's overshoot exports it).
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { painterOf, gridRect, copy, look } from '../../sample.js';

const F = 45, FLY = [0, 10], SHRINK = 6, UNDER = 26, LOCK = 32, LABEL = [34, 44];   // frames (upstream 14–59)
const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
const backOut = (s) => (u) => { u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
const OWN = { F: 30, LOCK: 9, LABEL: [13, 21], OFF: [620, 320] };   // corners: 'own'
const lin = (f, keys) => { for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return f <= a ? va : va + ((f - a) / (b - a)) * (vb - va); } return keys[keys.length - 1][1]; };

export default {
  id: 'reticle-lock', kind: 'motion',
  tier: 'T0', family: 'shape', beats: 3,
  beatsFor: (P) => (P.corners === 'own' ? 2 : 3),
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'paper'],
  from: 'the scene, nothing marked',
  to: 'the same scene, one region framed by four corners, lit a little, with a label',
  interpolates: ['frame offset (1100, 620) → 0 (cubic out)', 'frame scale 2.2 → 0.94 (swift) → 1 (out), then a 6 px bite', 'lock glow 0 → 0.55 → 0.28, veil outside 0 → 0.1', 'label scale 0 → 1 (back out)'],
  summary: 'Four L-shaped corners fly in as one frame, shrink past the target, bite onto it with a click, and a small label pops above.',
  theory: 'Capture in motion, the targeting reticle of fictional interfaces: the frame says "this one" without stopping the picture; the overshoot and bite give the lock a felt moment (anticipation and settle), and attention follows the one region outlined and lit (Posner 1980).',
  defaults: (ctx = {}) => ({
    from: { scene: 'grid', target: 1 }, rect: gridRect(1), pad: 16, arm: 58, thick: 5, radius: 22,
    fly: [1100, 620], scale0: 2.2, grow: 0, label: { text: copy('cards', ctx.lang)[1].title, code: '02' }, corners: 'frame',
  }),
  prepare(P) { return { scene: painterOf(P.from, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    if (P.corners === 'own') {
      const f = p * OWN.F, lock = backOut(2.4)(f / OWN.LOCK);
      const glow = lin(f, [[OWN.LOCK, 0], [OWN.LOCK + 3, 0.55], [OWN.LOCK + 10, 0.28]]);
      const label = f < OWN.LABEL[0] ? 0 : 0.6 + 0.4 * backOut(2.6)((f - OWN.LABEL[0]) / (OWN.LABEL[1] - OWN.LABEL[0]));
      return { p, f, own: true, show: true, alpha: Math.min(1, clamp(lock) * 3 + 0.35), fly: [0, 0], shrink: 1, grow: 0, bite: 0, lock, glow,
        focus: cubicOut(clamp((f - OWN.LOCK + 2) / 12)), label, labelAlpha: clamp((f - OWN.LABEL[0]) / 3), locked: f >= OWN.LOCK };
    }
    const f = p * F, t = cubicOut(clamp((f - FLY[0]) / (FLY[1] - FLY[0])));
    const fly = [(1 - t) * P.fly[0], (1 - t) * P.fly[1]];
    const s0 = P.grow ? 1 : P.scale0;
    const shrink = f < UNDER ? lerp(s0, 0.94, ramp(f, SHRINK, UNDER - SHRINK, 'swift')) : lerp(0.94, 1, ramp(f, UNDER, LOCK - UNDER, 'out'));
    const grow = P.grow ? P.grow * (1 - ramp(f, SHRINK, LOCK - SHRINK, 'snappy')) : 0;
    const bite = lin(f, [[LOCK, 0], [LOCK + 1, 1], [LOCK + 5, 0]]);
    const glow = lin(f, [[LOCK, 0], [LOCK + 3, 0.55], [LOCK + 10, 0.28]]);
    const focus = cubicOut(clamp((f - LOCK + 2) / 12));
    const label = f < LABEL[0] ? 0 : backOut(1.8)((f - LABEL[0]) / (LABEL[1] - LABEL[0]));
    return { p, f, show: f > FLY[0], alpha: clamp((f - FLY[0]) / 3), fly, shrink, grow, bite, glow, focus, label, locked: f >= LOCK };
  },
  box(S, P) {
    const [x, y, w, h] = P.rect, cx = x + w / 2, cy = y + h / 2;
    const hw = (w / 2 + P.pad) * S.shrink + S.grow - 6 * S.bite, hh = (h / 2 + P.pad) * S.shrink + S.grow - 6 * S.bite;
    return { cx: cx + S.fly[0], cy: cy + S.fly[1], hw, hh };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, [x, y, w, h] = P.rect;
    D.scene(ctx);
    if (!S.show) return;
    if (S.focus > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080); rrect(ctx, x, y, w, h, P.radius);
      ctx.fillStyle = rgba(mix(c.ground, '#000000', 0.85), 0.1 * S.focus); ctx.fill('evenodd'); ctx.restore();
    }
    if (S.locked) {
      ctx.save(); rrect(ctx, x, y, w, h, P.radius); ctx.clip();
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, rgba(c.paper, S.glow)); g.addColorStop(0.6, rgba(c.paper, S.glow * 0.55)); g.addColorStop(1, rgba(c.paper, S.glow * 0.35));
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
      ctx.save(); rrect(ctx, x, y, w, h, P.radius); ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(c.accent, 0.55 * S.focus); ctx.stroke(); ctx.restore();
    }
    const B = this.box(S, P);
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const off = S.own ? 1 - S.lock : 0;
      const px = B.cx + sx * (B.hw + OWN.OFF[0] * off), py = B.cy + sy * (B.hh + OWN.OFF[1] * off), a = P.arm - P.thick / 2;
      const path = () => { ctx.beginPath(); ctx.moveTo(px - sx * a, py); ctx.lineTo(px, py); ctx.lineTo(px, py - sy * a); };
      path(); ctx.lineWidth = P.thick + 4; ctx.strokeStyle = rgba(c.paper, 0.92); ctx.stroke();
      path(); ctx.lineWidth = P.thick; ctx.strokeStyle = c.accent; ctx.stroke();
    }
    const cross = S.own ? 0 : 0.8 * (1 - S.focus);   // centre tick while the frame flies, gone once locked
    if (cross > 0.01) {
      ctx.globalAlpha = S.alpha * cross;
      for (const [dx, dy] of [[14, 0], [0, 14]]) {
        ctx.beginPath(); ctx.moveTo(B.cx - dx, B.cy - dy); ctx.lineTo(B.cx + dx, B.cy + dy);
        ctx.lineWidth = 7; ctx.strokeStyle = rgba(c.paper, 0.85); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = c.accent; ctx.stroke();
      }
    }
    ctx.restore();
    if (S.label > 0 && P.label) {                 // the label pill above the top-left corner, popping from its foot
      const ft = fontFor(look, 'text', P.lang, 30, 600), fm = fontFor(look, 'mono', P.lang, 25, 500);
      const tw = measure(ctx, P.label.text, ft).width, cw = P.label.code ? measure(ctx, P.label.code, fm).width + 16 : 0;
      const pw = 14 + 12 + 14 + tw + (cw ? 14 + cw : 0) + 16, ph = 54;
      // above the top-left corner, popping from its foot; beside the target, from its left middle (corners: 'own')
      const lx = S.own ? B.cx + B.hw + 28 : B.cx - B.hw + 2, ly = S.own ? B.cy - ph / 2 : B.cy - B.hh - 70, oy = S.own ? ly + ph / 2 : ly + ph;
      ctx.save(); ctx.globalAlpha = S.own ? S.labelAlpha : Math.min(1, S.label * 1.5);
      ctx.translate(lx, oy); ctx.scale(S.label, S.label); ctx.translate(-lx, -oy);
      ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.35); ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
      rrect(ctx, lx, ly, pw, ph, 12); ctx.fillStyle = c.ink; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.arc(lx + 20, ly + ph / 2, 6, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
      text(ctx, P.label.text, lx + 40, ly + ph / 2 + 1, ft, { color: c.ground, baseline: 'middle' });
      if (cw) {
        const bx = lx + 40 + tw + 14;
        rrect(ctx, bx, ly + 10, cw, ph - 20, 6); ctx.fillStyle = rgba(c.ground, 0.1); ctx.fill();
        text(ctx, P.label.code, bx + 8, ly + ph / 2 + 1, fm, { color: rgba(c.ground, 0.6), baseline: 'middle' });
      }
      ctx.restore();
    }
  },
  blur(p, P) { return P?.corners === 'own' ? p * OWN.F < OWN.LOCK + 2 : p * F < FLY[1] + 2; },
  track(S, P) {
    const B = this.box(S, P), off = S.own ? 1 - S.lock : 0, hw = B.hw + OWN.OFF[0] * off, hh = B.hh + OWN.OFF[1] * off;
    return [[B.cx - hw, B.cy - hh], [B.cx + hw, B.cy - hh], [B.cx - hw, B.cy + hh], [B.cx + hw, B.cy + hh], [B.cx, B.cy]];
  },
};

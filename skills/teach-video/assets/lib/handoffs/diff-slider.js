// diff-slider — a before/after of one frame rendered twice, registered pixel for pixel: left of the seam the frame
// before the edit, right of it the frame after, and the seam travels so the edit takes over the frame. The input above
// shows the one changed line. Borrowed mechanism: the before/after comparison slider (public grammar), here between
// two real renders of the same template at the same instant, so the only difference is the edited line.
// Variant `scrub: true`: the seam is handled like a hand on a slider: it rests at 8 % of the pane, winds back to 6.5 %
// (4 frames), flings to 76 % (12, ease out), settles back to 70 % (12, smooth), holds (18) and scrubs back to 40 % (48,
// smooth), 94 frames in all; a round grip rides the seam and stretches with its speed (up to 1.18 wide), and `tags`
// [before, after] sit in their own halves, cut by the seam. Adapted from video-shotcraft
// demos/data/before-after-slider-scrub/BeforeAfterSliderScrub.tsx, https://github.com/Vincentwei1021/video-shotcraft @
// 1266a3e, Apache-2.0 (timing and grip as filed by batch 7); the pictures are the module's painters.

import { cubicInOut, lerp, cubicOut, text, rrect, rgba } from './util.js';
import { clipRect, seamV, samplePane } from './seam.js';

// scrub: [frame, share of the pane] keys and the curve into each
const SCRUB = [[0, 0.08], [4, 0.065, 'io'], [16, 0.76, 'out'], [28, 0.7, 'io'], [46, 0.7, 'io'], [94, 0.4, 'io']], SCRUB_F = 94;
const scrubAt = (f) => {
  for (let i = 1; i < SCRUB.length; i++) {
    const [f0, v0] = SCRUB[i - 1], [f1, v1, e] = SCRUB[i];
    if (f <= f1) { const u = Math.min(1, Math.max(0, (f - f0) / (f1 - f0))); return v0 + (v1 - v0) * (e === 'out' ? cubicOut(u) : cubicInOut(u)); }
  }
  return SCRUB[SCRUB.length - 1][1];
};

export default {
  name: 'diff-slider',
  tier: 'T2',
  beats: 2,
  modes: ['split (the before / after)', 'dossier', 'every mode with two renders of one frame'],
  roles: ['accent', 'key'],
  from: 'the seam at x0: mostly before',
  to: 'the seam at x1: mostly after',
  interpolates: ['seam x'],
  summary: 'Two registered renders of one frame either side of the seam; the seam moves and the after takes over.',
  theory: 'Registered comparison isolates the one variable (juxtaposition, Tufte 1990: small multiples, compare like with like).',
  defaults: { pane: { x: 0, y: 260, w: 1920, h: 820 }, x0: 1440, x1: 620, before: { paint: samplePane(0) }, after: { paint: samplePane(1) }, colors: { accent: '#007C72', key: '#F3F2EE' } },
  // variant options (absent by default): scrub (bool), tags ([before, after]), font ({ family, weight, size }) for the tags
  beatsFor: (P) => (P.scrub ? Math.round((SCRUB_F / 15) * 4) / 4 : 2),
  rest(side, P) { if (P.scrub) { const v = side === 'from' ? SCRUB[0][1] : SCRUB[SCRUB.length - 1][1]; return { x: P.pane.x + P.pane.w * v, grip: 1 }; } return { x: side === 'from' ? P.x0 : P.x1 }; },
  at(p, P) {
    if (P.scrub) {
      // the grip stretches with the seam's speed (share of the pane per frame; 1.18 at the fling's top)
      const f = Math.min(1, Math.max(0, p)) * SCRUB_F, v = Math.abs(scrubAt(f + 0.5) - scrubAt(f - 0.5));
      return { x: P.pane.x + P.pane.w * scrubAt(f), grip: p <= 0 || p >= 1 ? 1 : 1 + Math.min(0.18, v * 2.2) };
    }
    return { x: lerp(P.x0, P.x1, cubicInOut(p)) };
  },
  paint(ctx, S, P) {
    const R = P.pane;
    clipRect(ctx, R.x, R.y, S.x - R.x, R.h, () => P.before.paint(ctx, 0, 0));
    clipRect(ctx, S.x, R.y, R.x + R.w - S.x, R.h, () => P.after.paint(ctx, 0, 0));
    if (P.tags) {
      // each tag in its own half, cut by the seam
      const C = P.colors, F = P.font || { family: 'sans-serif', weight: 650, size: 30 }, tag = (s, x, align, lo, hi) => clipRect(ctx, lo, R.y, hi - lo, R.h, () => {
        ctx.font = `${F.weight} ${F.size}px ${F.family}`; const w = ctx.measureText(s).width + 44, x0 = align === 'left' ? x : x - w;
        rrect(ctx, x0, R.y + 36, w, F.size + 30, (F.size + 30) / 2); ctx.fillStyle = rgba('#000000', 0.55); ctx.fill();
        text(ctx, s, x0 + 22, R.y + 36 + F.size + 8, F, { color: C.key });
      });
      tag(P.tags[0], R.x + 40, 'left', R.x, S.x); tag(P.tags[1], R.x + R.w - 40, 'right', S.x, R.x + R.w);
    }
    seamV(ctx, S.x, R.y, R.y + R.h, P.colors);
    if (P.scrub) {
      const cy = R.y + R.h / 2, r = 30, w = r * (S.grip || 1);
      ctx.save(); rrect(ctx, S.x - w, cy - r, 2 * w, 2 * r, r); ctx.fillStyle = P.colors.key; ctx.shadowColor = rgba('#000000', 0.35); ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; ctx.fill(); ctx.restore();
      ctx.save(); ctx.strokeStyle = P.colors.accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(S.x + d * 8, cy - 9); ctx.lineTo(S.x + d * 15, cy); ctx.lineTo(S.x + d * 8, cy + 9); ctx.stroke(); }
      ctx.restore();
    }
  },
  track(S, P) { return [[S.x, P.pane.y + P.pane.h / 2]]; },
};

// frame-snap — a thick band of colour grows round the whole frame before the content, then on one frame flips to the
// other colour of the pair: band, mode label and the content inside change together, with a three-frame white flash
// from the band inward and a damped bounce of the band's thickness. The flip is a change of mode, not a transition.
// Adapted from video-shotcraft demos/effects/brand-frame-snap/BrandFrameSnap.tsx (card
// references/shots/effects/brand-frame-snap.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the two band colours are two roles of the palette
// (default accent → ink) instead of cobalt and orange; the content before and after the flip is the caller's two
// scenes (the design tool window, its drop, cursor, selection and redlines are removed: they are the scene's and the
// UI bricks'); the mode label is the film's text, the brand mark and word mark removed (a second label slot remains).
import { rgba, rrect, text } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, caseOf } from '../../lang.js';
import { painterOf, copy, look } from '../../sample.js';

const GROW = 19, SETTLE = 24, INNER_R = 22;
// The board: the frame-sized rect and its rounded hole as one path (fill and clip with 'evenodd'). util's rrect begins a
// new path, so the hole is traced here.
const board = (ctx, b, pad = 0) => {
  const r = Math.min(INNER_R, b * 4), x = b, y = b, w = 1920 - 2 * b, h = 1080 - 2 * b;
  ctx.beginPath(); ctx.rect(-pad, -pad, 1920 + 2 * pad, 1080 + 2 * pad);
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
};
// The text colour that reads on each band role.
const ON = { accent: 'onAccent', ink: 'ground', paper: 'onPaper', panel: 'ink', ground: 'ink', fail: 'onAccent', ok: 'onAccent' };
export const framesOf = (P) => (P.flip == null ? GROW + 1 : P.flip + SETTLE);

// The band at frame g: thickness (with the bounce after the flip), whether the flip has happened, the flash level.
export const bandAt = (g, P) => {
  const grow = P.grown ? 1 : ramp(g, 0, GROW, 'snappy'), since = P.flip == null ? -1 : g - P.flip;
  const bounce = since >= 0 ? Math.exp(-since * 0.24) * Math.cos(since * 0.95) * P.bounce : 0;
  const flash = since >= 0 && since < 3 ? 0.6 - since * 0.2 : 0;
  return { band: Math.max(0, P.band * grow + bounce), flipped: since >= 0, flash, label: P.grown ? 1 : ramp(g, 6, 14, 'snappy') };
};

export default {
  id: 'frame-snap', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 54 / 15,
  beatsFor: (P) => framesOf(P) / 15,
  surface: ['canvas'],
  roles: ['accent', 'ink', 'onAccent', 'ground'],
  from: 'a scene, full frame',
  to: 'the next scene inside a thick band of the second colour, its mode label on the top band',
  interpolates: ['band thickness 0 → 60 px (snappy, 19 frames)', 'label rises 16 px into the top band', 'on the flip frame: band colour, label and inner scene cut together; white flash 0.6 → 0.2 over 3 frames; thickness bounce 12 px · e^(−0.24 t) · cos(0.95 t)'],
  summary: 'A thick band of colour grows round the frame, then on one frame flips to the other colour of the pair; band, label and content change together with a short flash and a bounce.',
  theory: 'The frame is the edge of the picture, so colouring it says "this whole view is in a mode" without touching the content (figure–ground: the band is ground to the scene); a hard cut on one frame, with every part changing together, reads as one cause (common fate, Gestalt) and as a switch, not a transition; the bounce gives the switch a physical click (squash and stretch).',
  defaults: (ctx) => ({
    from: { scene: 'page' }, to: { scene: 'detail' }, colors2: ['accent', 'ink'], band: 60, bounce: 12, flip: 30, grown: false,
    labels: [copy('steps', ctx.lang)[1], copy('steps', ctx.lang)[2]], mark: copy('product', ctx.lang),
  }),
  prepare(P) { return { from: painterOf(P.from, P), to: painterOf(P.to ?? P.from, P) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { const g = p * framesOf(P); return { p, g, ...bandAt(g, P) }; },
  paint(ctx, S, P, D) {
    const c = P.colors, role = P.colors2[S.flipped ? 1 : 0], col = c[role], on = c[ON[role] || 'ground'], b = S.band;
    (S.flipped ? D.to : D.from)(ctx);
    if (b > 0.01) {
      // the inner edge: the board's thickness, a soft shadow falling into the hole
      ctx.save(); rrect(ctx, b, b, 1920 - 2 * b, 1080 - 2 * b, Math.min(INNER_R, b * 4)); ctx.clip();
      board(ctx, b, 200); ctx.shadowColor = rgba('#000000', 0.18); ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.fillStyle = col; ctx.fill('evenodd');
      ctx.restore();
      // the band: one board with a rounded hole, lit from the top
      ctx.save(); board(ctx, b); ctx.fillStyle = col; ctx.fill('evenodd'); ctx.clip('evenodd');
      const g = ctx.createLinearGradient(0, 0, 0, 1080);
      g.addColorStop(0, rgba('#ffffff', 0.14)); g.addColorStop(0.35, rgba('#ffffff', 0)); g.addColorStop(1, rgba('#000000', 0.1));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
      // labels on the top band: the mode on the left, a mark on the right; they rise in and swap on the flip frame
      if (S.label > 0.001 && b > 24) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, b); ctx.clip();
        const dy = (1 - S.label) * 16, size = 30, f = fontFor(look, 'text', P.lang, size, 800);
        const lab = caseOf(P.labels[S.flipped ? 1 : 0], look, 'label', P.lang);
        ctx.globalAlpha = S.label;
        text(ctx, lab.text, 66, b / 2 + size * 0.36 + dy, { ...f, spacing: (P.lang === 'zh' ? 0.08 : 0.16) * size }, { color: on });
        if (P.mark) { ctx.globalAlpha = S.label * 0.92; text(ctx, P.mark, 1920 - 66, b / 2 + size * 0.36 + dy, fontFor(look, 'display', P.lang, size, 700), { color: on, align: 'right' }); }
        ctx.restore();
      }
    }
    // the flip flash: brightest at the band, about a third at the centre
    if (S.flash > 0) {
      ctx.save(); ctx.globalAlpha = S.flash; ctx.translate(960, 540); ctx.scale(1, 810 / 1440);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1440);
      g.addColorStop(0.4, rgba('#ffffff', 0.3)); g.addColorStop(1, rgba('#ffffff', 1));
      ctx.fillStyle = g; ctx.fillRect(-1440, -1440, 2880, 2880); ctx.restore();
    }
  },
  blur() { return false; },
  track(S) { return [[S.band, S.band]]; },
};

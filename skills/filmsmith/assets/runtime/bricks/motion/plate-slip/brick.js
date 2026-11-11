// plate-slip — a title slams in and splits into two ink plates printed out of register; they shake twice, decaying, and
// snap into register with a small pulse.
// Adapted from video-shotcraft demos/effects/riso-print-hits/RisoMisregistrationHit.tsx
// (card references/shots/effects/riso-print-hits.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the two inks are the accent and the ink (multiplied
// on a light ground, screened with paper on a dark one) instead of fluorescent pink and blue; the title is the film's
// text through lang.js; brand, demo copy, the halftone sun, register marks, info rows and the stamp removed (the
// scene's); paper fibre and grain are the style's texture; motion blur from the tracked plates.
import { clamp, lerp, text, measure, canvasOf, hexToRgb } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { fontFor, wrap } from '../../lang.js';
import { painterOf, copy, look } from '../../sample.js';

const F = 60, HIT = 8, SNAP = 52;                // frames (upstream 20–80: slam 20–28, shake 28–72, snap 72)
const IN_CUBIC = bez(0.55, 0.055, 0.675, 0.19);
const lum = (hex) => { const [r, g, b] = hexToRgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

export default {
  id: 'plate-slip', kind: 'motion',
  tier: 'T2', family: 'paper', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'paper'],
  from: 'the scene without the title',
  to: 'the scene with the title printed in register',
  interpolates: ['title x off-frame → place (ease-in, 8 frames)', 'plate offsets ±(20, 8) px · cos(2πt/18) · e^(−t/60), snapped to 0 at frame 52', 'register pulse 1.03 → 1 (4 frames)', 'page kick 1.2 % (10 frames)'],
  summary: 'A title slams in and splits into two ink plates out of register; they shake twice, decaying, and snap into register with a pulse.',
  theory: 'A print metaphor for a hit: two colour plates out of register are what a risograph does when the drum slips, so the shake reads as material rather than as a screen glitch; the hard snap (not an ease) on a residue of about 11 px is the accent, the register itself.',
  defaults: (ctx = {}) => ({
    from: null, text: copy('claim', ctx.lang), x: 120, y: 250, size: ctx.lang === 'zh' ? 176 : 230, width: ctx.lang === 'zh' ? 1680 : 1500, weight: 860,
    amp: [20, 8], period: 18, tau: 60, slide: 1700,
  }),
  prepare(P) {
    const dark = lum(P.colors.ground) < 0.4;
    const f = fontFor(look, 'display', P.lang, P.size, P.weight, 'display');
    const g = canvasOf(16, 16).getContext('2d', { willReadFrequently: true });
    const lines = wrap(g, P.text, f, P.width, P.lang);
    const lh = P.size * (P.lang === 'zh' ? 1.12 : 0.9);
    // one plate drawn once as an alpha mask; each frame tints it (a tool cache, like a sampled glyph)
    const mask = canvasOf(1920, 1080), m = mask.getContext('2d', { willReadFrequently: true });
    lines.forEach((l, i) => text(m, l, P.x, P.y + i * lh, f, { color: '#000000', baseline: 'top' }));
    const tint = (col) => { const c = canvasOf(1920, 1080), t = c.getContext('2d', { willReadFrequently: true }); t.drawImage(mask, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = col; t.fillRect(0, 0, 1920, 1080); return c; };
    const inks = dark ? [P.colors.accent, P.colors.paper] : [P.colors.accent, P.colors.ink];
    const tw = Math.max(...lines.map((l) => measure(g, l, f).width));
    return { tw, from: P.from ? painterOf(P.from, P) : (ctx) => { ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); }, dark, plates: inks.map(tint), lines, lh };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = p * F, t = f - HIT, split = f >= HIT && f < SNAP;
    const slide = f < HIT ? lerp(P.slide, 0, clamp(IN_CUBIC(clamp(f / HIT)))) : 0;
    const m = split ? Math.cos(((2 * Math.PI) / P.period) * t) * Math.exp(-t / P.tau) : 0;
    const pulse = f >= SNAP && f < SNAP + 4 ? 1 + 0.03 * (1 - (f - SNAP) / 4) : 1;
    const kick = t >= 0 && t < 10 ? 1 + 0.012 * Math.exp(-t / 2.5) : 1;
    return { p, f, show: p > 0, slide, dx: P.amp[0] * m, dy: P.amp[1] * m, pulse, kick };
  },
  paint(ctx, S, P, D) {
    ctx.save();
    if (S.kick !== 1) { ctx.translate(768, 540); ctx.scale(S.kick, S.kick); ctx.translate(-768, -540); }
    D.from(ctx);
    if (S.show) {
      const ox = P.x + 0.3 * D.tw, oy = P.y + 0.6 * D.lh * D.lines.length;
      D.plates.forEach((pl, i) => {
        const s = i ? 1 : -1;
        ctx.save();
        ctx.globalCompositeOperation = D.dark ? 'screen' : 'multiply';
        ctx.translate(S.slide + s * S.dx, -s * S.dy);
        if (S.pulse !== 1) { ctx.translate(ox, oy); ctx.scale(S.pulse, S.pulse); ctx.translate(-ox, -oy); }
        ctx.drawImage(pl, 0, 0);
        ctx.restore();
      });
    }
    ctx.restore();
  },
  blur(p) { return p * F < HIT; },
  track(S, P, D) {
    const ox = P.x + 0.3 * D.tw, oy = P.y + 0.6 * D.lh * D.lines.length, k = S.pulse;
    return [[ox + (P.x - ox) * k + S.slide - S.dx, oy + (P.y - oy) * k + S.dy], [ox + (P.x - ox) * k + S.slide + S.dx, oy + (P.y - oy) * k - S.dy]];
  },
};

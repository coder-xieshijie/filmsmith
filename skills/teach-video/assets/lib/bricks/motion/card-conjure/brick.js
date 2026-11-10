// card-conjure — a star flash blinks at one point and a card is thrown out of it: it spins about its diagonal along an arc
// toward the camera, the spin dying as it nears, and stops dead face-on; a pulse rings out from its edge.
// Adapted from video-shotcraft demos/opening/magician-card-flourish/MagicianCardFlourish.tsx (card references/shots/opening/magician-card-flourish.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); the card's turn about its diagonal is drawn as the
// affine projection of the turned plane (the upstream's mild CSS perspective left out), so motion blur comes from the
// tracked corner (canvas.js subframes) instead of a multi-sample camera blur; the card face is the caller's painter (a
// neutral tile-card by default) and its back a crosshatch in the panel's colours; the flash, glow, pulse and backlight
// in the accent and the accent mixed with white; the ticket's brand line, mark, demo copy, holographic foil, the right-
// hand copy, the dust and the sheen after landing (sheen-sweep) removed.
import { clamp, mix, rgba, rrect, ground } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { cardItems, faceCanvas } from '../../prop/tile-card/brick.js';

// Upstream frames (30 fps): the flash 0–12 (takes off at 9), flight 48 frames, dead stop at 57, the pulse over 22.
const T = { takeoff: 9, flashEnd: 12, flight: 48, land: 57, pulse: 22, frames: 81 };
const TURNS = 13, FOCAL = 900, DEPTH = 14000;
const CW = 380, CH = 540, AX = CW / Math.hypot(CW, CH), AY = CH / Math.hypot(CW, CH);

// The flight at frame f: spin angle (deg), arc position, scale relative to the landed card.
const flight = (f, P) => {
  const t = clamp((f - T.takeoff) / T.flight);
  const spinP = t < 0.4 ? t * 1.55 : 0.62 + 0.38 * (1 - Math.pow(1 - (t - 0.4) / 0.6, 2.4));
  const tp = t < 0.14 ? 0.06 * (t / 0.14) ** 2 : 0.06 + 0.94 * (1 - Math.pow(1 - (t - 0.14) / 0.86, 3));
  const arc = Math.sin(tp * Math.PI);
  return { t, theta: TURNS * 360 * Math.min(1, spinP), x: P.at[0] + arc * P.swing[0], y: P.at[1] - arc * P.swing[1], k: FOCAL / (FOCAL + DEPTH * (1 - tp)) };
};
// The 2 × 2 projection of a plane turned by theta about the in-plane axis (AX, AY): orthographic, so affine.
const turnMatrix = (deg) => { const c = Math.cos((deg * Math.PI) / 180), q = 1 - c; return [c + q * AX * AX, q * AX * AY, q * AX * AY, c + q * AY * AY]; };

export default {
  id: 'card-conjure', kind: 'motion',
  tier: 'T3', family: 'lift-flip', beats: T.frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'accent'],
  from: 'a dark stage, nothing on it',
  to: 'the card held face-on, large, a glow behind it',
  interpolates: ['a star flash: two needle beams in an X turning 90° with a core and spikes, 9 frames, collapsing by 12', 'the card: slow-in then thrown along an arc from the flash point and back, from 14 000 px deep to 0 (true perspective scale)', 'spin about its diagonal, 13 turns, near constant for 40 % then dying (power 2.4), face-on at the stop', 'a pulse ringing out from the edge and the backlight rising after the stop'],
  summary: 'A star flash blinks at one point and a card is thrown out of it, spinning about its diagonal along an arc toward the camera; it stops dead face-on and a pulse rings out from its edge.',
  theory: 'A magician\'s production: the light marks where to look (Posner 1980) a moment before the thing appears there, so the card seems made by the flash; a hard stop with no rebound reads as control, not physics (the "freeze" of a flourish), and the pulse lets the stop land.',
  defaults: (ctx) => ({ card: null, item: cardItems(ctx.lang, 6)[4], at: [700, 540], swing: [470, 230], scale: 1.72, radius: 24 }),
  prepare(P) {
    const W = CW * P.scale, H = CH * P.scale, c = P.colors;
    const face = typeof P.card === 'function' ? (() => { const cv = document.createElement('canvas'); cv.width = Math.round(W); cv.height = Math.round(H); P.card(cv.getContext('2d', { willReadFrequently: true }), W, H); return cv; })()
      : faceCanvas(P.item, CW, CH, P, { layout: 'cover', lit: 1, radius: P.radius }, P.scale);
    // the back: a crosshatch on the panel, an inset frame
    const back = document.createElement('canvas'); back.width = Math.round(W); back.height = Math.round(H);
    const g = back.getContext('2d', { willReadFrequently: true }), R = P.radius * P.scale;
    rrect(g, 0, 0, W, H, R); g.fillStyle = mix(c.panel, c.accent, 0.18); g.fill(); g.save(); g.clip();
    g.strokeStyle = rgba(c.line, 0.5); g.lineWidth = 1.5;
    for (let s = -H; s < W + H; s += 20) { g.beginPath(); g.moveTo(s, 0); g.lineTo(s + H, H); g.moveTo(s, H); g.lineTo(s + H, 0); g.stroke(); }
    g.restore(); rrect(g, 36, 36, W - 72, H - 72, R * 0.6); g.strokeStyle = rgba(c.accent, 0.5); g.lineWidth = 2; g.stroke();
    return { face, back, W, H, R };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = clamp(p) * T.frames, fl = flight(f, P), landed = f >= T.land;
    const grow = ramp(f, 0, 2.5, (u) => 1 - (1 - u) * (1 - u)), shrinkK = f <= 6 ? 1 : f <= T.takeoff ? 1 - 0.7 * ((f - 6) / 3) ** 2 : 0.3 - 0.25 * ((f - T.takeoff) / 3) ** 2;
    const flashOp = f < 1.5 ? 0.35 + 0.65 * (f / 1.5) : f < 6 ? 1 : 1 - clamp((f - 6) / 6);
    const flicker = 0.94 + 0.06 * (0.5 + 0.5 * Math.sin(f * 1.9) * Math.sin(f * 0.83 + 1.7));
    const rot = 90 * (f >= T.flashEnd ? 1 : (u => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2))(f / T.flashEnd));
    const pulse = landed && p < 1 ? ramp(f, T.land, T.pulse, 'out') : 0;
    return { p, f, ...fl, on: f >= T.takeoff, landed, flash: f > T.flashEnd ? 0 : (0.2 + 0.8 * grow) * Math.max(0.05, shrinkK) * 1, flashOp: f > T.flashEnd ? 0 : flashOp * flicker, rot,
      pulse, pulseOn: landed && p < 1 && f <= T.land + 24, lit: ramp(f, T.land - 6, 30, 'out') };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, hot = mix(c.accent, '#ffffff', 0.7);
    ground(ctx, P);
    // backlight behind the landed card
    if (S.lit > 0) {
      const rg = ctx.createRadialGradient(P.at[0], P.at[1], 0, P.at[0], P.at[1], 620);
      rg.addColorStop(0, rgba(c.accent, 0.3 * S.lit)); rg.addColorStop(0.42, rgba(c.accent, 0.08 * S.lit)); rg.addColorStop(1, rgba(c.accent, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, 1920, 1080);
    }
    if (S.on) {
      const [a, b, cc, d] = turnMatrix(S.theta), cos = Math.cos((S.theta * Math.PI) / 180), sin = Math.sin((S.theta * Math.PI) / 180);
      ctx.save();
      ctx.transform(a * S.k, b * S.k, cc * S.k, d * S.k, S.x, S.y);
      ctx.save();
      if (S.landed) { ctx.shadowColor = rgba('#000000', 0.55); ctx.shadowBlur = 90; ctx.shadowOffsetY = 40 * S.k; }
      else { ctx.shadowColor = rgba(c.accent, 0.55); ctx.shadowBlur = 70 * S.k; }
      rrect(ctx, -D.W / 2, -D.H / 2, D.W, D.H, D.R); ctx.fillStyle = c.panel; ctx.fill();
      ctx.restore();
      ctx.save(); rrect(ctx, -D.W / 2, -D.H / 2, D.W, D.H, D.R); ctx.clip();
      ctx.drawImage(cos < 0 ? D.back : D.face, -D.W / 2, -D.H / 2, D.W, D.H);
      // the side light of the turn, frozen once landed
      const g = ctx.createLinearGradient(-D.W / 2, -D.H / 2, D.W / 2, D.H / 2);
      const s = Math.abs(sin);
      g.addColorStop(0.3, rgba('#ffffff', 0)); g.addColorStop(0.5, rgba(hot, 0.08 + 0.16 * s)); g.addColorStop(0.7, rgba('#ffffff', 0));
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(-D.W / 2, -D.H / 2, D.W, D.H);
      ctx.restore();
      ctx.lineWidth = 1.5 / Math.max(0.05, S.k); ctx.strokeStyle = rgba(c.accent, S.landed ? 0.25 : 0.4); rrect(ctx, -D.W / 2, -D.H / 2, D.W, D.H, D.R); ctx.stroke();
      ctx.restore();
    }
    // the pulse: a frame of the card's shape growing out from its edge
    if (S.pulseOn && S.pulse < 1) {
      const gr = 1 + S.pulse * 0.14, w = D.W * gr, h = D.H * gr;
      ctx.save(); ctx.shadowColor = rgba(c.accent, 0.7 * (1 - S.pulse)); ctx.shadowBlur = 40;
      rrect(ctx, P.at[0] - w / 2, P.at[1] - h / 2, w, h, D.R * gr); ctx.strokeStyle = rgba(hot, 0.9 * (1 - S.pulse)); ctx.lineWidth = 2.5 - S.pulse * 1.5; ctx.stroke(); ctx.restore();
    }
    // the star flash: two needle beams in an X, a core, a glow and short spikes, turning as it collapses
    if (S.flashOp > 0) {
      ctx.save(); ctx.translate(P.at[0], P.at[1]); ctx.scale(S.flash, S.flash); ctx.globalAlpha = clamp(S.flashOp);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 70); glow.addColorStop(0, rgba(c.accent, 0.75)); glow.addColorStop(0.45, rgba(c.accent, 0.35)); glow.addColorStop(1, rgba(c.accent, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fill();
      const needle = (deg, len, w0, a) => {
        ctx.save(); ctx.rotate(((deg + S.rot) * Math.PI) / 180);
        const ng = ctx.createLinearGradient(-len, 0, len, 0);
        ng.addColorStop(0, rgba(c.accent, 0)); ng.addColorStop(0.2, rgba(c.accent, 0.55 * a)); ng.addColorStop(0.47, rgba(hot, 0.95 * a)); ng.addColorStop(0.5, rgba('#ffffff', a));
        ng.addColorStop(0.53, rgba(hot, 0.95 * a)); ng.addColorStop(0.8, rgba(c.accent, 0.55 * a)); ng.addColorStop(1, rgba(c.accent, 0));
        ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, -w0 / 2); ctx.lineTo(len, 0); ctx.lineTo(0, w0 / 2); ctx.closePath(); ctx.fill(); ctx.restore();
      };
      ctx.save(); ctx.filter = 'blur(6px)'; needle(-38, 826, 26, 0.75); needle(52, 413, 20, 0.75); ctx.restore();
      needle(-38, 840, 8, 1); needle(52, 420, 6.5, 1); needle(-38, 819, 3, 1); needle(52, 410, 2.6, 1);
      ctx.save(); ctx.rotate((-S.rot * 0.6 * Math.PI) / 180); ctx.fillStyle = rgba(hot, 0.65);
      [15, 52, 88, 123, 160, 197, 231, 268, 305, 341].forEach((deg, i) => { const ln = 46 + ((i * 37) % 3) * 16; ctx.save(); ctx.rotate((deg * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(8, -1.1); ctx.lineTo(ln, 0); ctx.lineTo(8, 1.1); ctx.fill(); ctx.restore(); });
      ctx.restore();
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 13); core.addColorStop(0, '#ffffff'); core.addColorStop(0.45, rgba(hot, 0.95)); core.addColorStop(1, rgba(c.accent, 0));
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  // 0: the card's centre; 1: its top-right corner (the spin, for motion blur); 2: [scale × 1000, 0] (the approach)
  track(S, P, D) {
    if (!S.on) return [[P.at[0], P.at[1]], [P.at[0], P.at[1]], [0, 0]];
    const [a, b, c, d] = turnMatrix(S.theta), hx = (D.W / 2) * S.k, hy = (-D.H / 2) * S.k;
    return [[S.x, S.y], [S.x + a * hx + c * hy, S.y + b * hx + d * hy], [S.k * 1000, 0]];
  },
  blur(p) { const f = p * T.frames; return f > T.takeoff && f < T.land; },
};

// isolate — the camera pulls back from a close-up of one card while the cards around it go out, nearest first, until it
// hangs alone and lit in the dark.
// Adapted from video-shotcraft demos/camera/tension-camera-moves/PullBackIsolation.tsx (card references/shots/camera/tension-camera-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the metric
// card removed (the cards are the sample's cards or any painters); the siblings' heights follow the card's aspect
// (painted at one scale, never stretched); the lift to a dark ground is the look's ground deepened instead of a fixed
// blue-black; the hero's halo is the accent mixed with white; grain is left to the look.
import { mix, rgba, rrect } from '../../../handoffs/util.js';
import { card, GRID } from '../../sample.js';

const clamp01 = (u) => Math.min(1, Math.max(0, u));
const outCubic = (u) => 1 - Math.pow(1 - u, 3);
const inOutQuad = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const outQuint = (u) => 1 - Math.pow(1 - u, 5);  // ≈ EASE.out for the opacity, which leads the darkening
const lum = (hex) => { const v = parseInt(hex.slice(1, 7), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };
// the upstream's eight siblings: offsets from the hero's centre and widths (heights follow the card's aspect)
const SIBS = [[-620, -330, 360], [10, -390, 420], [620, -320, 380], [-680, 20, 340], [700, 40, 360], [-600, 360, 400], [40, 400, 440], [640, 350, 370]];

export default {
  id: 'isolate', kind: 'motion',
  tier: 'T2', family: 'zoom-depth', beats: 7.5,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'panel'],
  from: 'a close-up (2.2×) of one card among its siblings, on the look\'s ground',
  to: 'the card alone, small and lit, in a dark ground',
  interpolates: ['camera scale 2.2 → 0.62 (out-cubic) about the card', 'siblings going out by distance (opacity, darkening, defocus, a slight sink)', 'ground sinking to dark', 'halo on the card'],
  summary: 'The camera pulls back from a close-up of one card while its neighbours go out one by one, nearest first, until the card hangs alone and lit in the dark.',
  theory: 'Isolation by subtraction: removing every competitor leaves one figure, and the pull-back gives it scale against the emptiness (figure–ground, Rubin; the "lonely figure" wide shot); the nearest-first order makes the darkness travel outward from the subject.',
  sceneRest: false,
  defaults: () => ({ hero: { w: 520, i: 4 }, siblings: SIBS, start: 2.2, end: 0.62, step: 8, fade: 16, halo: true }),
  prepare(P) {
    const sibs = P.siblings.map(([dx, dy, w], i) => ({ dx, dy, w, h: (w * GRID.tile.h) / GRID.tile.w, i: (i + (i >= P.hero.i ? 1 : 0)) % 6, dist: Math.hypot(dx, dy) }));
    const rank = sibs.map((_, i) => i).sort((a, b) => sibs[a].dist - sibs[b].dist);
    rank.forEach((idx, r) => { sibs[idx].t0 = 30 + r * P.step; });
    return { sibs, hh: (P.hero.w * GRID.tile.h) / GRID.tile.w };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = clamp01(p) * 110;
    const s = P.start + (P.end - P.start) * outCubic(clamp01(f / 110));
    const ks = D.sibs.map((b) => clamp01((f - b.t0) / P.fade));
    return { p, f, s, ks, bg: inOutQuad(clamp01((f - 60) / 50)), glow: inOutQuad(clamp01((f - 60) / 40)) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, lang = P.lang, dark = lum(c.ground) > 0.5 ? mix(c.ground, '#000000', 0.88) : mix(c.ground, '#000000', 0.55);
    ctx.fillStyle = mix(c.ground, dark, S.bg); ctx.fillRect(0, 0, 1920, 1080);
    if (S.bg > 0) {
      const g = ctx.createRadialGradient(960, 540, 0, 960, 540, 1100);
      g.addColorStop(0, rgba(mix(dark, c.accent, 0.25), 0.5 * S.bg)); g.addColorStop(1, rgba(dark, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
    }
    ctx.save();
    ctx.translate(960, 540); ctx.scale(S.s, S.s);
    D.sibs.forEach((b, j) => {
      const k = S.ks[j], op = 1 - outQuint(k);
      if (op <= 0.002) return;
      ctx.save();
      ctx.globalAlpha = op;
      ctx.translate(b.dx, b.dy); const sk = 1 - 0.03 * k; ctx.scale(sk, sk);
      if (k > 0.001) ctx.filter = `blur(${(k * 5 * S.s).toFixed(2)}px)`;
      card(ctx, b.i, [-b.w / 2, -b.h / 2, b.w, b.h], { lang, colors: c });
      if (k > 0.001) { rrect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, (22 * b.w) / GRID.tile.w); ctx.fillStyle = rgba(dark, 0.7 * k * k); ctx.fill(); }
      ctx.restore();
    });
    const w = P.hero.w, h = D.hh;
    ctx.save();
    if (P.halo && S.glow > 0) {
      ctx.shadowColor = rgba(mix(c.accent, '#FFFFFF', 0.75), 0.45 * S.glow); ctx.shadowBlur = 90;
      rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = c.panel; ctx.fill();
    } else {
      ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.18); ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
      rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = c.panel; ctx.fill();
    }
    ctx.restore();
    card(ctx, P.hero.i, [-w / 2, -h / 2, w, h], { lang, colors: c, target: true });
    ctx.restore();
  },
  blur: () => false,
  // 0–3: the hero card's corners; 4: its centre; 5: the first sibling's centre; 6: the hero's left edge, middle
  track(S, P, D) {
    const w = P.hero.w, h = D.hh, b = D.sibs[0], q = (x, y) => [960 + x * S.s, 540 + y * S.s];
    return [q(-w / 2, -h / 2), q(w / 2, -h / 2), q(-w / 2, h / 2), q(w / 2, h / 2), q(0, 0), q(b.dx, b.dy), q(-w / 2, 0)];
  },
};

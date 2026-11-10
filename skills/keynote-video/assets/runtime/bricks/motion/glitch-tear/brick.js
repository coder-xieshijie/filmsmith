// glitch-tear — the frame splits into 16 horizontal bands that jitter sideways; the cut to the next scene hides at the peak.
// Adapted from video-shotcraft demos/transition/tear-streak-transitions/GlitchDisplace.tsx (card references/shots/transition/tear-streak-transitions.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and
// screenshots removed; the two scenes are any painters (the upstream's release console is gone); the two-colour ghost is
// the scene's own content (its difference from the ground) tinted with the accent and an accent–ink mix instead of
// re-rendering the page in two tints; the shot's slow push-in, vignette and grain are left to the film; the jitter steps
// once per tick (32 ticks over the brick, one per frame at 120 BPM) instead of once per frame.
import { canvasOf, mix, rgba } from '../../../handoffs/util.js';
import { painterOf } from '../../sample.js';
// an offscreen buffer rasterised on the CPU (the same pixels on every pass; a GPU buffer read back into another canvas
// can switch raster path mid-render and change its anti-aliasing)
const buffer = (w, h) => { const b = canvasOf(w, h); b.getContext('2d', { willReadFrequently: true }); return b; };

const W = 1920, H = 1080;
// the upstream's library hash (deterministic; same bands and same jitter as the shot)
const h = (n) => { const s = Math.sin(n * 127.3) * 43758.5453; return s - Math.floor(s); };
// tick timeline (upstream frames 29–61): precursor 1–2, tear 15–31 (rise 3 ticks), cut at 25, decay to 0 by tick 30
// (the upstream decays over 6 frames and snaps from 1/6 at its last; here it lands, so the brick ends settled)
const T = { pre: [1, 2], tearIn: 15, cut: 25, tearOut: 31 };
const rampT = (x, a, d, f = (u) => u) => f(Math.min(1, Math.max(0, (x - a) / d)));
const outCubic = (u) => 1 - Math.pow(1 - u, 3);
const exitCurve = (u) => u * u * u * u; // ≈ EASE.exit for the pre-cut creep

const bandsOf = (n) => {
  const w = Array.from({ length: n }, (_, i) => 0.45 + h(i * 13 + 5) * 0.9);
  const sum = w.reduce((a, b) => a + b, 0);
  let top = 0;
  return w.map((wi, i) => { const bh = i === n - 1 ? H - top : Math.round((wi / sum) * H); const b = { top, h: bh, energy: 0 }; top += bh; const r = h(i * 7 + 101); b.energy = r < 0.2 ? 0 : r > 0.68 ? 1 : 0.18 + r * 0.35; return b; });
};

export default {
  id: 'glitch-tear', kind: 'motion',
  tier: 'T1', family: 'edit-cut', beats: 2.125,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'the current scene, full frame',
  to: 'the next scene, full frame (best on the same grid: the tear then reads as a state jump)',
  interpolates: ['band offsets (seeded per tick, an envelope that rises in 3 ticks and decays after the cut)', 'ghost strength', 'exposure kick at the cut'],
  summary: 'The frame tears into 16 uneven bands that jitter sideways; the hard cut to the next scene hides in the strongest jitter, then the bands settle.',
  theory: 'A cut hidden inside motion is not seen as a cut (edit blindness during large transients, Smith & Henderson 2008); the precursor tremor makes the jump expected (anticipation), and the tear says "signal" rather than "broken page" because every band stays whole.',
  sceneRest: true,
  defaults: () => ({ from: { scene: 'grid' }, to: { scene: 'detail' }, bands: 16, amp: 70, ghost: 12, ticks: 32, scan: true, exposure: 1.28 }),
  prepare(P) {
    return { from: painterOf(P.from, P), to: painterOf(P.to, P), bands: bandsOf(P.bands), page: buffer(W, H), g1: buffer(W, H), g2: buffer(W, H), out: buffer(W, H) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = Math.floor(Math.min(1, Math.max(0, p)) * P.ticks + 1e-6); // tick
    const pre = f === T.pre[0] || f === T.pre[1];
    const tearing = f >= T.tearIn && f < T.tearOut;
    const env = tearing ? Math.min(rampT(f, T.tearIn, 3, outCubic), 1 - rampT(f, T.cut, T.tearOut - 1 - T.cut)) : 0;
    const dx = D.bands.map((b, i) => {
      if (pre) return i === 5 || i === 12 ? (h(i * 31 + (f + 29) * 7) > 0.5 ? 12 : -12) * (P.amp / 70) : 0;
      if (!tearing) return 0;
      const r = h(i * 31 + (f + 29) * 7) * 2 - 1;
      return Math.sign(r) * Math.pow(Math.abs(r), 0.6) * P.amp * b.energy * env;
    });
    const kick = f >= T.cut ? 0.016 * (1 - rampT(f, T.cut, 6, (u) => 1 - Math.pow(1 - u, 4))) : 0.006 * rampT(f, T.tearIn, T.cut - T.tearIn, exitCurve);
    const exposure = f === T.cut ? P.exposure : f === T.cut + 1 ? 1 + (P.exposure - 1) * 0.43 : 1;
    const scans = tearing && P.scan ? [0, 1].map((k) => ({ y: Math.floor(h((f + 29) * 13 + k * 71) * H), a: (0.25 + 0.55 * h((f + 29) * 5 + k)) * env, w: 1 + Math.floor(h(f + 29 + k * 9) * 3) })) : [];
    return { p, f, side: f >= T.cut ? 'to' : 'from', env, dx, kick, exposure, scans, active: pre || tearing };
  },
  paint(ctx, S, P, D) {
    const scene = S.side === 'to' ? (c) => D.to(c, 1) : (c) => D.from(c);
    if (!S.active && S.kick === 0 && S.exposure === 1) return scene(ctx);
    const c = P.colors;
    const pg = D.page.getContext('2d');
    pg.setTransform(1, 0, 0, 1, 0, 0); pg.globalCompositeOperation = 'source-over'; pg.globalAlpha = 1; pg.filter = 'none'; pg.clearRect(0, 0, W, H);
    scene(pg);
    // ghosts: the content's difference from the ground, tinted (accent, accent–ink), screened onto the moving bands
    const ghostOn = S.env > 0;
    if (ghostOn) for (const [g, tint] of [[D.g1, mix(c.accent, c.ink, 0.45)], [D.g2, c.accent]]) {
      const x = g.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
      x.globalCompositeOperation = 'copy'; x.drawImage(D.page, 0, 0);
      x.globalCompositeOperation = 'difference'; x.fillStyle = c.ground; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'source-over';
    }
    const o = D.out.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'copy'; o.globalAlpha = 1;
    o.drawImage(D.page, 0, 0);
    o.globalCompositeOperation = 'source-over';
    D.bands.forEach((b, i) => {
      const dx = S.dx[i];
      if (Math.abs(dx) < 0.5) return;
      o.save();
      o.beginPath(); o.rect(0, b.top, W, b.h); o.clip();
      o.drawImage(D.page, dx, 0);
      const ghost = S.env > 0 ? Math.min(1, Math.abs(dx) / 36) * S.env : 0;
      if (ghost > 0.04) {
        o.globalCompositeOperation = 'screen';
        o.globalAlpha = 0.55 * ghost; o.drawImage(D.g1, dx + P.ghost, 0);
        o.globalAlpha = 0.6 * ghost; o.drawImage(D.g2, dx - P.ghost, 0);
        o.globalCompositeOperation = 'source-over';
      }
      // torn edges: a lit top line, a dark bottom lip
      o.globalAlpha = Math.max(0, Math.min(1, (Math.abs(dx) - 25) / 30));
      o.fillStyle = rgba(mix(c.ink, '#FFFFFF', 0.6), 0.5); o.fillRect(0, b.top, W, 1.5);
      o.globalAlpha = Math.min(1, Math.abs(dx) / 30);
      const lip = o.createLinearGradient(0, b.top + b.h - 3, 0, b.top + b.h);
      const dark = mix(c.ground, '#000000', 0.9);
      lip.addColorStop(0, rgba(dark, 0)); lip.addColorStop(1, rgba(dark, 0.75));
      o.fillStyle = lip; o.fillRect(0, b.top + b.h - 3, W, 3);
      o.restore();
    });
    for (const sc of S.scans) {
      const g = o.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, rgba(c.accent, 0)); g.addColorStop(0.3, rgba(mix(c.accent, c.ink, 0.45), sc.a)); g.addColorStop(0.6, rgba('#FFFFFF', sc.a)); g.addColorStop(1, rgba(c.accent, 0));
      o.fillStyle = g; o.fillRect(0, sc.y, W, sc.w);
    }
    const z = 1 + S.kick;
    ctx.save();
    ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
    if (S.exposure > 1) ctx.filter = `brightness(${S.exposure})`;
    ctx.drawImage(D.out, 0, 0);
    ctx.restore();
  },
  blur: () => false,
  // 0, 1: the left edge's middle of band 2 and band 14 (both carry the tear; 2 at full energy)
  track(S, P, D) { const b2 = D.bands[2], b14 = D.bands[14]; return [[960 + S.dx[2], b2.top + b2.h / 2], [960 + S.dx[14], b14.top + b14.h / 2]]; },
};

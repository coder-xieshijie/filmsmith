// impact-frame — the camera crashes into one card and the picture takes a punch: three frames of negative, focus lines
// and a two-ink channel split, then the clean close-up shakes still.
// Adapted from video-shotcraft demos/effects/impact-feedback/AnimeImpact.tsx (card references/shots/effects/impact-feedback.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the focus lines are paper and
// onPaper, the two split inks are the accent and its complement, the veils are ground mixed with black); brand, demo copy
// and screenshots removed; the scene is the caller's painter; the overview creep and the constant vignette are left to
// the style; the wind-back and the crash are kept so the punch has its approach (a film that already pushed in passes
// `push: false`); the zoom's motion blur comes from the tracked card corners instead of stacked copies.
import { clamp, lerp, mix, rgba, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf, gridRect } from '../../sample.js';

const F = 38;                                     // frames at the default length (upstream frames 22–60)
const T = { wind: [0, 6], zoom: [6, 12], hit: 12, hits: 3 };
const IN_CUBIC = bez(0.55, 0.055, 0.675, 0.19);  // the crash: ease-in cubic
const W = 1920, H = 1080;

// The complement of a colour (255 − each channel): the second ink of the split, derived from the accent.
const complement = (hex) => '#' + hex.replace('#', '').match(/../g).map((v) => (255 - parseInt(v, 16)).toString(16).padStart(2, '0')).join('');

export default {
  id: 'impact-frame', kind: 'motion',
  tier: 'T3', family: 'zoom-depth', beats: 2.5,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'paper', 'onPaper'],
  from: 'a scene with the card the punch lands on (its rect)',
  to: 'the same scene, pushed in on that card (or held, with push: false), the rest of it veiled a little',
  interpolates: ['camera scale 1 → 0.985 (wind-back) → fill (crash, ease-in)', 'three hard frames of negative + focus lines + channel split', 'shake 6 px decaying (τ 2.2 frames)', 'veil outside the card 0.22 → 0.1'],
  summary: 'The camera winds back, crashes into one card, and three frames of negative with focus lines hit before the clean close-up shakes still.',
  theory: 'Impact frames of Japanese animation: a few frames of inverted, line-struck picture read as force because the eye cannot resolve them (persistence, about 100 ms); the shake that follows is Vlambeer’s screenshake (feedback for a hit) and dies in 12 frames so the close-up is read still.',
  defaults: () => ({
    from: { scene: 'grid', target: 1 },
    rect: gridRect(1), scale: null, fill: 0.92, push: true,
    lines: { thick: 34, thin: 22 }, split: 8, shake: 6, veil: [0.22, 0.1], vignette: 0.3,
  }),
  prepare(P) {
    const [, , w, h] = P.rect;
    const scale = P.push === false ? 1 : P.scale || Math.min((W * P.fill) / w, (H * P.fill) / h);
    return { scene: painterOf(P.from, P), scale, buf: canvasOf(W, H), tint: canvasOf(W, H), lines: canvasOf(W, H), split: complement(P.colors.accent) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * F;
    const wind = P.push === false ? 0 : ramp(f, T.wind[0], T.wind[1] - T.wind[0], 'smooth');
    const zoom = P.push === false ? 1 : ramp(f, T.zoom[0], T.zoom[1] - T.zoom[0], IN_CUBIC);
    const s0 = lerp(1, 0.985, wind);
    const scale = f < T.zoom[0] || P.push === false ? (P.push === false ? 1 : s0) : lerp(0.985, D.scale, zoom);
    const hit = f >= T.hit && f < T.hit + T.hits ? Math.floor(f - T.hit) : -1;
    const since = f - (T.hit + T.hits);
    const env = since >= 0 ? P.shake * Math.exp(-since / 2.2) : 0;
    const live = env > 0.12;
    const sh = live ? [env * 0.7 * Math.sin(since * 2.5 + 0.6), env * Math.cos(since * 2.9), env * 0.04 * Math.sin(since * 3.3 + 1.7)] : [0, 0, 0];
    const after = since >= 0 ? 1 - ramp(f, T.hit + T.hits, F - T.hit - T.hits, 'out') : 0;
    const veil = since >= 0 ? lerp(P.veil[1], P.veil[0], after) : 0;
    return { p, f, scale, push: P.push === false ? 1 : zoom, hit, sh, veil, vig: P.vignette * after };
  },
  // the camera: scale about the card centre while the card centre travels to the frame centre
  camera(ctx, S, P) {
    const [x, y, w, h] = P.rect, cx = x + w / 2, cy = y + h / 2;
    ctx.translate(cx + (960 - cx) * S.push, cy + (540 - cy) * S.push);
    ctx.scale(S.scale, S.scale);
    ctx.translate(-cx, -cy);
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    ctx.save();
    if (S.sh[0] || S.sh[1] || S.sh[2]) { ctx.translate(960 + S.sh[0], 540 + S.sh[1]); ctx.rotate((S.sh[2] * Math.PI) / 180); ctx.translate(-960, -540); }
    if (S.hit < 0) {
      ctx.save(); this.camera(ctx, S, P); D.scene(ctx); ctx.restore();
      if (S.veil > 0) {                      // the rest of the screen veiled so the close-up stands out
        const [x, y, w, h] = P.rect;
        ctx.save(); this.camera(ctx, S, P);
        ctx.beginPath(); ctx.rect(-W * 4, -H * 4, W * 9, H * 9); ctx.rect(x + w, y, -w, h);
        ctx.fillStyle = rgba(mix(c.ground, '#000000', 0.8), S.veil); ctx.fill('evenodd');
        ctx.restore();
      }
      if (S.vig > 0.002) {
        const g = ctx.createRadialGradient(960, 540, 540 * 0.5, 960, 540, 1100);
        g.addColorStop(0, rgba(mix(c.ground, '#000000', 0.85), 0));
        g.addColorStop(1, rgba(mix(c.ground, '#000000', 0.85), S.vig));
        ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
      }
      ctx.restore();
      return;
    }
    // an impact frame: the close-up as a hard negative, two tinted negatives screened and offset, focus lines on top
    const b = D.buf.getContext('2d', { willReadFrequently: true });
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, W, H);
    b.save(); this.camera(b, S, P); D.scene(b); b.restore();
    ctx.fillStyle = mix(c.onPaper, '#000000', 0.5); ctx.fillRect(-40, -40, W + 80, H + 80);
    ctx.save(); ctx.filter = 'invert(1) grayscale(1) contrast(1.45)'; ctx.drawImage(D.buf, 0, 0); ctx.restore();
    const flip = S.hit % 2 === 0 ? 1 : -1;
    const t = D.tint.getContext('2d', { willReadFrequently: true });
    for (const [dx, dy, ink] of [[-P.split, 4 * flip, c.accent], [P.split, -4 * flip, D.split]]) {
      t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, W, H);
      t.save(); t.filter = 'invert(1) grayscale(1) contrast(1.45)'; t.drawImage(D.buf, 0, 0); t.restore();
      t.globalCompositeOperation = 'multiply'; t.fillStyle = ink; t.fillRect(0, 0, W, H); t.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55; ctx.drawImage(D.tint, dx, dy); ctx.restore();
    }
    this.lines(ctx, S.hit, P, D);
    ctx.restore();
  },
  // hand-drawn focus lines: thick wedges and thin needles from outside the frame toward the card, re-drawn each frame;
  // their inner ends fade into a clear ellipse round the focus
  lines(ctx, phase, P, D) {
    const c = P.colors, cx = 960, cy = 540, R = 1300, seed = (P.seed || 1) * 7919;
    const t = D.lines, g = t.getContext('2d', { willReadFrequently: true });
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    const wedge = (i, n, k, r0, r0v, w0, wv) => {
      const ang = ((i + 0.5) / n) * Math.PI * 2 + (hash(k, seed) - 0.5) * 0.24;
      const r = r0 + hash(k + 1, seed) * r0v, half = (w0 + hash(k + 2, seed) * wv) / R;
      g.beginPath();
      g.moveTo(cx + Math.cos(ang) * r * 1.18, cy + Math.sin(ang) * r);
      g.lineTo(cx + Math.cos(ang - half) * R, cy + Math.sin(ang - half) * R);
      g.lineTo(cx + Math.cos(ang + half) * R, cy + Math.sin(ang + half) * R);
      g.closePath(); g.fill();
    };
    for (let i = 0; i < P.lines.thick; i++) { g.fillStyle = i % 5 === 0 ? c.onPaper : c.paper; wedge(i, P.lines.thick, i * 13 + phase * 101, 330, 230, 9, 22); }
    g.globalAlpha = 0.85; g.fillStyle = c.paper;
    for (let i = 0; i < P.lines.thin; i++) wedge(i + 0.37, P.lines.thin, i * 29 + phase * 57 + 7, 420, 260, 2, 4);
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in';
    const m = g.createRadialGradient(cx, cy, 0, cx, cy, 700);
    m.addColorStop(0.38, rgba('#ffffff', 0)); m.addColorStop(0.6, rgba('#ffffff', 1));
    g.fillStyle = m; g.fillRect(0, 0, W, H);
    ctx.drawImage(t, 0, 0);
  },
  blur(p) { const f = p * F; return f > T.zoom[0] && f < T.hit; },
  track(S, P) {
    const [x, y, w, h] = P.rect, cx = x + w / 2, cy = y + h / 2;
    const at = (px, py) => [cx + (960 - cx) * S.push + (px - cx) * S.scale + S.sh[0], cy + (540 - cy) * S.push + (py - cy) * S.scale + S.sh[1]];
    return [at(x, y), at(x + w, y), at(x, y + h), at(x + w, y + h), at(cx, cy)];
  },
};

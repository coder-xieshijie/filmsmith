// panel-carve — slanted comic seams carve the frame into three panels, one per beat, each popping in hard with its own
// framing of one subject; after a hold the last panel's slanted edge sweeps across and eats the frame.
// Adapted from video-shotcraft demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx (card references/shots/rhythm/panel-grid-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the seams are paper with an
// onPaper edge, the glow, halftone and speed lines the accent instead of the vermilion and cream literals); brand, demo
// copy and the vector lens removed: the subject is any painter (default the sample page) framed by three cameras;
// the captions, the headline and the poster are the scene three-angles (the panels' corners are in track()); the
// working subject (focus ring, aperture) is the painter's; the speed blur, vignette and grain are left to the film. The
// 12° seams at 750 and 1405, the 4-frame beat, the 5-frame pop from 1.07 with its flash, the dimmed frame under the cuts,
// the seam drawn down in 3 frames, the speed lines on the last pop, the hold's slow pushes and the eat (2 frames back,
// then 14 frames snappy) are the upstream's.
import { canvasOf, mix, rgba } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { painterOf } from '../../sample.js';

const W = 1920, H = 1080, SLANT = 230, HALF = 9, B1 = 750, B2 = 1405;
const SPLIT = 20, BEAT = 4, POP = 5, HOLD0 = SPLIT + 2 * BEAT + POP + 2, EXP0 = 64, EXP_DUR = 16, START = 19;
// cameras: screen = c + s · (p − f), in the painter's 1920 × 1080 scene
const CAMS = [
  { fx: 960, fy: 540, cx: 380, cy: 600, s: 0.42 },    // ① the whole subject, small
  { fx: 960, fy: 560, cx: 1010, cy: 430, s: 1.35 },   // ② closer, on the middle
  { fx: 330, fy: 880, cx: 1640, cy: 540, s: 2.2 },    // ③ very close, on one detail
];
const END = { cx: 1360, s: 2.45 };                    // where ③ ends after the eat
const ORIGINS = [330, 962, 1610];                     // each panel's pop origin (x)
const GLOWS = [[380, 560], [1000, 900], [1640, 540]];
const hash = (i) => { const h = Math.sin(i * 91.7) * 43758.5; return h - Math.floor(h); };
const lum = (hex) => { const v = parseInt(hex.slice(1, 7), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };

const expandAt = (f) => { if (f < EXP0) return 0; const pre = ramp(f, EXP0, 2, EASE.out), go = ramp(f, EXP0 + 2, EXP_DUR - 2, EASE.snappy); return -0.03 * pre * (1 - go) + go; };
const edgeAt = (f, eat) => (eat ? B2 + 5 + (-SLANT - 40 - B2 - 5) * expandAt(f) : B2 + 5);

// a panel's ground: the ground deepened, a glow of the accent about (lx, ly) and a ring of halftone dots around it
const panelGround = (c, lx, ly) => {
  const b = canvasOf(W, H), g = b.getContext('2d');
  const dark = lum(c.ground) < 0.5 ? c.ground : mix(c.ground, c.ink, 0.85);
  const v = g.createLinearGradient(0, 0, 0, H); v.addColorStop(0, mix(dark, c.accent, 0.08)); v.addColorStop(0.55, mix(dark, '#000000', 0.25)); v.addColorStop(1, mix(dark, '#000000', 0.55));
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.save(); g.translate(lx, ly); g.scale(0.46 * W / (0.56 * H), 1);
  const r = g.createRadialGradient(0, 0, 0, 0, 0, 0.56 * H * 1.5); r.addColorStop(0, rgba(c.accent, 0.34)); r.addColorStop(0.3, rgba(c.accent, 0.08)); r.addColorStop(0.5, rgba(c.accent, 0));
  g.fillStyle = r; g.fillRect(-W, -H, 2 * W, 2 * H); g.restore();
  g.fillStyle = c.accent;
  for (let y = 6.5; y < H; y += 13) for (let x = 6.5; x < W; x += 13) {
    const d = Math.hypot((x - lx) / (0.6 * W), (y - ly) / (0.7 * H));
    const a = d < 0.2 ? 0 : d < 0.6 ? 0.55 * (d - 0.2) / 0.4 : d < 1 ? 0.55 * (1 - (d - 0.6) / 0.4) : 0;
    if (a < 0.01) continue;
    g.globalAlpha = a * 0.6 * 0.5; g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  return b;
};

export default {
  id: 'panel-carve', kind: 'motion',
  tier: 'T2', family: 'split-wipe', beats: 4,
  beatsFor: (P) => (P.eat ? 4 : 3),
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent', 'paper', 'onPaper'],
  from: 'the subject, full frame',
  to: 'the third framing of the subject, full frame (or, without the eat, the three panels held)',
  interpolates: ['three slanted seams drawn down one per beat', 'each panel\'s hard pop (scale 1.07 → 1, a paper flash)', 'slow pushes in each panel while they hold', 'the last panel\'s slanted edge sweeping across (2 frames back, then snappy), its framing sliding to the end'],
  summary: 'Slanted comic seams carve the frame into three panels on three beats, each popping in with its own framing of one subject; after a hold the last panel\'s slanted edge sweeps across and eats the frame.',
  theory: 'Comic panels set side by side are read as one moment from several angles (closure between panels, McCloud, Understanding Comics); cutting them in on the beat makes the layout the rhythm, and the last panel eating the frame resolves the three into one.',
  sceneRest: false,
  defaults: () => ({ subject: { scene: 'page' }, cams: CAMS, eat: true, lines: true, dim: 0.72 }),
  prepare(P) {
    const subject = painterOf(P.subject, P), c = P.colors;
    // the subject once at full size, to be framed by each camera (a painter is drawn once, then placed)
    const art = canvasOf(W, H); subject(art.getContext('2d'));
    return { art, grounds: GLOWS.map(([x, y]) => panelGround(c, x, y)) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) {
    const f = START + Math.min(1, Math.max(0, p)) * ((P.eat ? EXP0 + EXP_DUR : EXP0) - START);
    const hold = ramp(f, HOLD0, EXP0 - HOLD0, EASE.smooth), e = Math.max(0, P.eat ? expandAt(f) : 0);
    const cams = P.cams.map((k, i) => ({ ...k, s: k.s * (1 + [0.035, 0.03, 0][i] * hold) }));
    cams[2] = { ...cams[2], cx: cams[2].cx + (END.cx - cams[2].cx) * e, s: (P.cams[2].s + hold * 0.06) + (END.s - P.cams[2].s - hold * 0.06) * e };
    return { p, f, edge: edgeAt(f, P.eat), cams };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, f = S.f, e = S.edge, cut = (k) => SPLIT + k * BEAT;
    const core = c.paper || mix(c.ink, '#FFFFFF', 0.6), edge = c.onPaper || mix(c.ground, '#000000', 0.7);
    const shot = (g, k) => { g.save(); g.translate(k.cx - k.s * k.fx, k.cy - k.s * k.fy); g.scale(k.s, k.s); g.drawImage(D.art, 0, 0); g.restore(); };
    // the frame being carved: the subject full frame, dimmed once the first panel is in
    if (f < cut(2) + 2) {
      ctx.drawImage(D.art, 0, 0);
      if (f >= cut(0)) { ctx.fillStyle = rgba(edge, P.dim); ctx.fillRect(0, 0, W, H); }
    } else { ctx.fillStyle = edge; ctx.fillRect(0, 0, W, H); }
    const clips = [
      [[0, 0], [B1 - HALF, 0], [B1 - SLANT - HALF, H], [0, H]],
      [[B1 + HALF, 0], [B2 - HALF, 0], [B2 - SLANT - HALF, H], [B1 - SLANT + HALF, H]],
      [[e + HALF, 0], [W, 0], [W, H], [e - SLANT + HALF, H]],
    ];
    for (let i = 0; i < 3; i++) {
      if (f < cut(i)) continue;
      const pop = ramp(f, cut(i), POP, EASE.snappy), flash = 1 - ramp(f, cut(i), 4, EASE.out), k = 1.07 + (1 - 1.07) * pop;
      ctx.save();
      ctx.translate(ORIGINS[i], 540); ctx.scale(k, k); ctx.translate(-ORIGINS[i], -540);
      ctx.beginPath(); clips[i].forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
      ctx.drawImage(D.grounds[i], 0, 0);
      shot(ctx, S.cams[i]);
      // speed lines from the last panel's centre as it pops (comic impact)
      const t = (f - cut(2)) / 12;
      if (i === 2 && P.lines && t >= 0 && t <= 1) {
        ctx.save(); ctx.globalAlpha = 0.5 * (1 - EASE.out(t)); ctx.lineCap = 'butt';
        const k3 = P.cams[2];
        for (let j = 0; j < 40; j++) {
          const r = hash(j), a = (j / 40) * Math.PI * 2 + r * 0.1, r0 = 470 + r * 160 + t * 120;
          ctx.strokeStyle = j % 3 ? core : c.accent; ctx.lineWidth = 2 + r * 4;
          ctx.beginPath(); ctx.moveTo(k3.cx + Math.cos(a) * r0, k3.cy + Math.sin(a) * r0); ctx.lineTo(k3.cx + Math.cos(a) * 1300, k3.cy + Math.sin(a) * 1300); ctx.stroke();
        }
        ctx.restore();
      }
      if (flash > 0.01) { ctx.fillStyle = rgba(core, 0.55 * flash); ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }
    // the seams: drawn down in 3 frames, paper core and onPaper edge over a soft shadow
    const seam = (x, at) => {
      const d = ramp(f, at - 1, 3, EASE.out);
      if (d <= 0) return;
      const y2 = -20 + 1120 * d, x2 = x - SLANT * ((y2 + 20) / H);
      ctx.save(); ctx.lineCap = 'butt';
      ctx.filter = 'blur(8px)'; ctx.strokeStyle = rgba('#000000', 0.55); ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(x + 4, -20); ctx.lineTo(x2 + 4, y2); ctx.stroke(); ctx.filter = 'none';
      ctx.strokeStyle = edge; ctx.lineWidth = 2 * HALF + 2; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = core; ctx.lineWidth = 2 * HALF - 7; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.restore();
    };
    if (e > B1 + HALF) seam(B1, cut(1));
    if (e > -SLANT - 39) seam(f < EXP0 ? B2 : e, cut(2));
  },
  blur: () => false,
  // 0: the eating edge's top; 1: the third panel's framing centre; 2–4: the panels' top-left corners (caption anchors)
  track(S) { return [[S.edge, 0], [S.cams[2].cx, 540], [0, 0], [B1 + HALF, 0], [S.edge + HALF, 0]]; },
};

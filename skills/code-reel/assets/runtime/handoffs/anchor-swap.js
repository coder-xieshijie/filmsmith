// anchor-swap — the thing the viewer is looking at stays put while the world around it is replaced: a hairline scan
// wipes one world into the next ('scan'), or an iris from the anchor opens onto the next ('iris'); finally the camera
// pulls back on a log scale and the anchor lands as a part of the product's mark ('pull'). Theory: a fixed fixation
// point needs no re-orienting saccade (Material's persistent element); part-to-whole reveal (Navon 1977).
// references/transitions.md#anchor-swap.

import { seg, lerp, cubicInOut, cubicOut, ground } from './util.js';
import { screen, knockText } from './halftone.js';

const BEATS = { scan: 1, iris: 0.6, pull: 1.2 };

// default mark, in mark units with the anchor (a round hole) at the origin: a nib (collar, body tapering to the tip)
const nibPath = (ctx) => {
  ctx.rect(-0.40, -0.78, 0.80, 0.14);
  ctx.moveTo(-0.40, -0.56); ctx.lineTo(0.40, -0.56); ctx.lineTo(0.40, -0.06);
  ctx.quadraticCurveTo(0.34, 0.36, 0, 0.86);
  ctx.quadraticCurveTo(-0.34, 0.36, -0.40, -0.06);
  ctx.closePath();
};

// default anchor: a paper hole printed with the accent plate (15°), shaded like a lit sphere
const ballAnchor = (ctx, [x, y], R, P) => {
  const C = P.colors;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = C.ground; ctx.fill(); ctx.clip();
  screen(ctx, {
    x0: x - R, y0: y - R, x1: x + R, y1: y + R, pitch: P.pitch * (R / (P.hole * P.unit)), angle: 15, ox: x, oy: y, color: C.accent,
    tone: (px, py) => 0.3 + 0.68 * Math.min(1, Math.hypot((px - x) / R + 0.35, (py - y) / R + 0.35) / 1.35),
  });
  ctx.restore();
};

// default view: the printed mark at scale Z with its anchor at `at` (black plate shading, slit from hole to tip)
const nibView = (ctx, at, Z, P) => {
  const C = P.colors, k = P.unit * Z, [x, y] = at;
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); nibPath(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.ink; ctx.fill(); ctx.clip();
  const bx0 = Math.max(0, x - 0.42 * k), bx1 = Math.min(1920, x + 0.42 * k), by0 = Math.max(0, y - 0.8 * k), by1 = Math.min(1080, y + 0.88 * k);
  if (bx1 > bx0 && by1 > by0) {
    screen(ctx, {
      x0: bx0, y0: by0, x1: bx1, y1: by1, pitch: P.pitch * Z, angle: 45, ox: x, oy: y, color: C.ground,
      tone: (px) => 0.5 * Math.pow(Math.min(1, Math.max(0, ((px - x) / k + 0.4) / 0.8)), 1.4) + 0.03,
    });
  }
  ctx.fillStyle = C.ground;
  ctx.fillRect(x - 0.016 * k, y, 0.032 * k, 0.9 * k);
  ctx.restore();
};

// default worlds: paper with a word; a ring field centred on the anchor with a word
const wordWorld = (word, rings) => (ctx, P) => {
  const C = P.colors;
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (rings) {
    const [ax, ay] = P.anchor;
    screen(ctx, {
      pitch: 12, angle: 45, ox: ax, oy: ay, color: C.ink,
      tone: (x, y) => { const d = Math.hypot(x - ax, y - ay) - 250; return d < 0 ? 0 : Math.max(0, 1 - d / 950) * (0.5 - 0.5 * Math.cos((2 * Math.PI * d) / 112)); },
    });
  }
  knockText(ctx, word, 140, 520, { ...P.font, color: C.ink, paper: C.ground, knock: rings ? 16 : 0 });
};

export default {
  name: 'anchor-swap',
  tier: 'T1',
  beats: 1,
  beatsFor: (P) => BEATS[P.swap] ?? 1,
  modes: ['halftone', 'ink'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a world around the anchor (or, for pull, the anchor seen up close as part of the mark)',
  to: 'the next world around the same anchor (or the whole mark, the anchor in its place)',
  interpolates: ['scan line y', 'iris radius', 'zoom (log scale) and anchor position'],
  summary: 'The anchor the eye is on stays put while the world around it is replaced; a final pull-back shows it is part of the mark.',
  theory: 'A fixation point that does not move needs no saccade to re-find (Material\'s persistent element); a local part revealed as the whole (Navon 1977).',
  defaults: {
    swap: 'scan',                        // 'scan', 'iris' (the next world inside a disc from the anchor), 'pull'
    anchor: [1100, 460],                 // the anchor on screen while the worlds swap (and where the pull starts)
    home: [670, 515],                    // pull: the anchor's place in the landed mark
    zoom: 12,                            // pull: the close-up scale
    unit: 280, hole: 0.065,              // mark units → px at scale 1; the anchor's radius in mark units
    pitch: 4.5,                          // the mark's print screen at scale 1 (px)
    from: wordWorld('before', false),    // (ctx, P) => paint a world (scan, iris)
    to: wordWorld('after', true),
    view: nibView,                       // (ctx, at, Z, P) => paint the mark at scale Z with its anchor at `at`
    anchorPaint: ballAnchor,             // (ctx, at, R, P) => paint the anchor of radius R
    font: { family: 'sans-serif', weight: 800, size: 170 },
    colors: { ground: '#F1EDE4', ink: '#141414', accent: '#00A3E0' },
  },
  rest(side, P) {
    if (P.swap === 'pull') return side === 'from' ? { mode: 'view', at: P.anchor, Z: P.zoom } : { mode: 'view', at: P.home, Z: 1 };
    return { mode: side };
  },
  at(p, P) {
    if (p <= 0) return this.rest('from', P);
    if (p >= 1) return this.rest('to', P);
    if (P.swap === 'scan') return { mode: 'scan', y: -4 + 1088 * (0.12 * cubicInOut(p) + 0.88 * p) };
    if (P.swap === 'iris') {
      const [ax, ay] = P.anchor, far = Math.max(Math.hypot(ax, ay), Math.hypot(1920 - ax, ay), Math.hypot(ax, 1080 - ay), Math.hypot(1920 - ax, 1080 - ay));
      return { mode: 'iris', R: lerp(P.hole * P.unit * P.zoom, far + 4, cubicInOut(p)) };
    }
    const e = cubicOut(p);
    return { mode: 'view', at: [lerp(P.anchor[0], P.home[0], e), lerp(P.anchor[1], P.home[1], e)], Z: Math.pow(P.zoom, 1 - e) };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const R0 = P.hole * P.unit * P.zoom, W = ctx.canvas.width, H = ctx.canvas.height;
    const clipRect = (x, y, w, h, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); };
    if (S.mode === 'view') {
      P.view(ctx, S.at, S.Z, P);
      P.anchorPaint(ctx, S.at, P.hole * P.unit * S.Z, P);
      return;
    }
    if (S.mode === 'from' || S.mode === 'to') (S.mode === 'from' ? P.from : P.to)(ctx, P);
    else if (S.mode === 'scan') {
      clipRect(0, S.y, W, H - S.y, () => P.from(ctx, P));
      clipRect(0, 0, W, S.y, () => P.to(ctx, P));
      ctx.fillStyle = P.colors.ink; ctx.fillRect(0, S.y - 2, W, 4);
    } else if (S.mode === 'iris') {
      P.from(ctx, P);
      ctx.save(); ctx.beginPath(); ctx.arc(P.anchor[0], P.anchor[1], S.R, 0, Math.PI * 2); ctx.clip(); P.to(ctx, P); ctx.restore();
    }
    P.anchorPaint(ctx, P.anchor, R0, P);
  },
  track: (S, P) => (S.mode === 'view' ? [S.at, [S.at[0] + 0.86 * P.unit * S.Z, S.at[1] + 0.86 * P.unit * S.Z]] : [[0, 0]]),
};

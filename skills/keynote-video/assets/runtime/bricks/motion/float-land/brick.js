// float-land — the text of a surface hovers above it with a soft same-shape shadow, then falls onto it piece by piece and
// the shadow closes into a contact shadow and goes.
// Adapted from video-shotcraft demos/camera/graze-face-tour/GrazeFaceTour.tsx (FloatWrap and liftOf; card
// references/shots/camera/graze-face-tour.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the
// workspace UI removed: the surface is any painter and the pieces are text set by the look's type (default a list of the
// sample cards' titles and counts); the low grazing camera, its three segments and the neon frames are the scene
// graze-tour; the fall curve (0.5, 0.05, 0.6, 1), the offsets and the shadow's growth with height are the upstream's.
// Mode 'lift' (from demos/ui-entrance/element-body-moves/ContactShadowLift.tsx, same repo and commit): the reverse beat,
// cards lying on a table seen from above at a tilt (24° easing to 20°) lift along its normal (96 px, scale 1.05); the
// shadow stays on the table as two layers, a small hard contact core and a wide soft ambient shade, that grow, soften,
// fade and drift away from the light as the card rises; the first cards are named in turn (up 10 frames out-cubic,
// hover, back in 8 frames in-cubic, a 2-frame press), the last springs up (damping 16) and stays in the air, the others
// dimmed while one is up. The title, the camera follow and push, the outline and the tick are the scene's. Each card is
// painted once and drawn in horizontal strips (a turn about x keeps rows level), the shadows as projected outlines.
import { bez, canvasOf, measure, mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { spring } from '../digit-roll/brick.js';
import { copy, infoSize } from '../../sample.js';
import { fontFor } from '../../lang.js';
import NEUTRAL from '../../look/neutral/look.js';

const FALL_EASE = bez(0.5, 0.05, 0.6, 1);
const ROWS = { x: 300, y: 330, gap: 112, right: 1620, n: 6 };
const clamp01 = (u) => Math.min(1, Math.max(0, u));

// ── lift: cards on a tilted table ──
const LIFT = { cw: 420, ch: 600, gap: 60, r: 30, z: 96, s: 1.05, top: 350, persp: 2600, frames: 120, scans: [4, 38], pick: 74 };
const DESK_W = 3 * LIFT.cw + 2 * LIFT.gap;
const outCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3), inCubic = (t) => Math.pow(clamp01(t), 3);
const scanMotion = (t) => {   // named: up, hover, back down, a 2-frame press
  if (t < 0 || t >= 34) return { lift: 0, s: 1 };
  const lift = outCubic(t / 10) - inCubic((t - 24) / 8), hover = t >= 10 && t < 24 ? Math.sin(((t - 10) / 14) * Math.PI) : 0;
  const s = t >= 32 ? 0.99 + 0.01 * outCubic((t - 32) / 2) : t >= 31 ? 0.99 : 1 + (LIFT.s - 1) * lift;
  return { lift: lift + 0.05 * hover, s };
};
const pickMotion = (f) => {   // chosen: springs up and stays, breathing
  if (f < LIFT.pick) return { lift: 0, s: 1 };
  const k = spring(f - LIFT.pick, { damping: 16, stiffness: 120 });
  const breathe = f > LIFT.pick + 16 ? 0.04 * Math.sin(((f - LIFT.pick - 16) / 40) * Math.PI * 2) * ramp(f, LIFT.pick + 16, 20, 'smooth') : 0;
  return { lift: 1.15 * k + breathe, s: 1 + (LIFT.s - 1) * Math.min(1.2, k) };
};
// a point of the table (x, y from its top-left, z up its normal) on screen, the table turned `tilt`° about 60 % down
const deskPoint = (x, y, z, tilt) => {
  const ox = DESK_W / 2, oy = 0.6 * LIFT.ch, a = (tilt * Math.PI) / 180, dy = y - oy;
  const y1 = dy * Math.cos(a) - z * Math.sin(a), z1 = dy * Math.sin(a) + z * Math.cos(a), k = LIFT.persp / (LIFT.persp - z1);
  const sx = (1920 - DESK_W) / 2 + ox, sy = LIFT.top + oy, px = 960, py = 0.34 * 1080;
  return [px + (sx + (x - ox) - px) * k, py + (sy + y1 - py) * k];
};
const roundedOutline = (x, y, w, h, r) => {   // points round a rounded rect, clockwise
  const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return pts;
};
// the default card faces: a label, a big figure, a line of text and a row of cells, from the sample copy
const cardFace = (i, c, lang, look) => (g, w, h) => {
  const k = copy('kpis', lang)[i % 3], card = copy('cards', lang)[i];
  rrect(g, 46, 44, 80, 80, 22); g.fillStyle = rgba(c.ink, 0.07); g.fill();
  rrect(g, 70, 68, 32, 32, 8); g.fillStyle = i === 2 ? c.accent : mix(c.line, c.dim, 0.4); g.fill();
  text(g, k.label, 46, 200, fontFor(look, 'text', lang, 34, 650), { color: c.dim });
  text(g, k.value, 42, 330, fontFor(look, 'display', lang, 120, 780, 'display'), { color: c.ink });
  text(g, card.title, 46, 400, fontFor(look, 'text', lang, 34, 500), { color: c.dim });
  for (let j = 0; j < 7; j++) { rrect(g, 46 + j * 48, h - 96, 40, 52, 12); g.fillStyle = (j + i) % 3 ? rgba(c.ink, 0.06) : i === 2 ? c.accent : rgba(c.ink, 0.8); g.fill(); }
};

// the default surface: a panel with ruled rows (the pieces are its text)
const surface = (c) => (ctx) => {
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  rrect(ctx, 200, 200, 1520, 760, 28); ctx.fillStyle = c.panel; ctx.fill(); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = mix(c.panel, c.ground, 0.5); ctx.fillRect(201, 201, 1518, 70);
  for (let i = 1; i < ROWS.n; i++) { ctx.fillStyle = c.line; ctx.fillRect(240, ROWS.y - 72 + i * ROWS.gap, 1440, 1.5); }
  for (let i = 0; i < ROWS.n; i++) { ctx.fillStyle = i === 4 ? c.accent : mix(c.line, c.dim, 0.4); rrect(ctx, 240, ROWS.y - 30 + i * ROWS.gap, 28, 28, 8); ctx.fill(); }
};
const rowsOf = (lang) => copy('cards', lang).flatMap((it, i) => [
  { text: it.title, x: ROWS.x, y: ROWS.y + i * ROWS.gap, size: 40, weight: 600, role: 'display', color: 'ink' },
  { text: it.meta, x: ROWS.right, y: ROWS.y + i * ROWS.gap, size: infoSize(lang), weight: 500, role: 'text', color: 'dim', align: 'right' },
]);

export default {
  id: 'float-land', kind: 'motion',
  tier: 'T1', family: 'lift-flip', beats: 3.5,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'],
  from: 'the surface with its text hovering above it (each piece at its own height), soft shadows below',
  to: 'the surface with its text lying on it (the scene as set)',
  interpolates: ['each piece\'s height (accelerating fall, soft landing), staggered in reading order', 'the shadow\'s offset, blur, size and strength with height'],
  summary: 'The text of a surface hovers above it with a soft same-shape shadow, then falls onto it piece by piece in reading order; the shadows close into contact shadows and go.',
  theory: 'A cast shadow is the strongest cue for height above a surface (Kersten, Mamassian & Knill 1997: the shadow\'s offset alone makes an object appear to rise); landing in reading order leads the eye through the text.',
  sceneRest: false,
  beatsFor: (P) => (P.mode === 'lift' ? LIFT.frames / 15 : 3.5),
  defaults: () => ({ look: null, surface: null, pieces: null, lift: 130, first: 0.22, span: 0.62, fall: 0.34, mode: 'land', cards: null, tilt: [24, 20] }),
  prepare(P) {
    if (P.mode === 'lift') {
      const c = P.colors, look = P.look || NEUTRAL;
      const faces = [0, 1, 2].map((i) => {
        const cv = canvasOf(LIFT.cw, LIFT.ch), g = cv.getContext('2d');
        g.save(); rrect(g, 0, 0, LIFT.cw, LIFT.ch, LIFT.r); g.clip(); g.fillStyle = mix(c.panel, '#FFFFFF', 0.4); g.fillRect(0, 0, LIFT.cw, LIFT.ch);
        (P.cards?.[i] || cardFace(i, c, P.lang, look))(g, LIFT.cw, LIFT.ch); g.restore();
        rrect(g, 0.5, 0.5, LIFT.cw - 1, LIFT.ch - 1, LIFT.r); g.strokeStyle = rgba(c.ink, 0.07); g.lineWidth = 1; g.stroke();
        return cv;
      });
      return { faces };
    }
    const pieces = (P.pieces || rowsOf(P.lang)).map((it) => ({ ...it, f: fontFor(P.look || NEUTRAL, it.role || 'text', P.lang, it.size || 40, it.weight || 600, it.role === 'display' ? 'display' : null) }));
    return { surface: P.surface || surface(P.colors), pieces };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    if (P.mode === 'lift') {
      const f = clamp01(p) * LIFT.frames, m = [0, 1].map((i) => scanMotion(f - LIFT.scans[i])).concat(pickMotion(f));
      return { p, f, tilt: P.tilt[0] + (P.tilt[1] - P.tilt[0]) * ramp(f, 0, LIFT.frames, 'smooth'), cards: m.map((x) => ({ lift: x.lift, l: clamp01(x.lift), s: x.s })) };
    }
    const n = D.pieces.length;
    const h = D.pieces.map((_, i) => { const land = P.first + (i / n) * P.span; return (1 - FALL_EASE(clamp01((p - (land - P.fall)) / P.fall))) * P.lift; });
    return { p, h };
  },
  paint(ctx, S, P, D) {
    if (P.mode === 'lift') return this.paintLift(ctx, S, P, D);
    const c = P.colors, shade = mix(c.ground, '#000000', 0.9);
    D.surface(ctx);
    D.pieces.forEach((it, i) => {
      const h = S.h[i], color = c[it.color] || it.color || c.ink, align = it.align || 'left';
      if (h > 1.5) {
        // the same shape in the shade colour, below and right, larger, softer and stronger with height
        const s = 1 + h * 0.0011, w = measure(ctx, it.text, it.f).width, ax = align === 'right' ? it.x - w / 2 : it.x + w / 2;
        ctx.save();
        ctx.filter = `blur(${(2 + h * 0.09).toFixed(2)}px)`;
        ctx.translate(ax + h * 0.22, it.y + h * 0.42); ctx.scale(s, s); ctx.translate(-ax, -it.y);
        text(ctx, it.text, it.x, it.y, it.f, { color: shade, align, alpha: Math.min(0.22, 0.08 + h * 0.0026) });
        ctx.restore();
      }
      text(ctx, it.text, it.x - h * 0.34, it.y - h * 0.78, it.f, { color, align });
    });
  },
  paintLift(ctx, S, P, D) {
    const c = P.colors, shade = mix(c.ground, '#000000', 0.85), T = S.tilt;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the table: a dot field in perspective, fading out round the cards
    for (let y = -520; y < LIFT.ch + 480; y += 44) for (let x = -700; x < DESK_W + 700; x += 44) {
      const d = Math.hypot((x - DESK_W / 2) / (DESK_W / 2 + 700), (y - LIFT.ch * 0.52) / (LIFT.ch / 2 + 500)), a = 0.13 * clamp01((0.78 - d) / 0.48);
      if (a < 0.005) continue;
      const [sx, sy] = deskPoint(x - 6, y + 14, 0, T); ctx.fillStyle = rgba(c.ink, a); ctx.beginPath(); ctx.arc(sx, sy, 1.9, 0, Math.PI * 2); ctx.fill();
    }
    const poly = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
    const shadow = (x0, dx, dy, k, z, alpha, blur) => {   // a card's outline on the table, moved and grown, blurred
      const cx = x0 + LIFT.cw / 2, cy = LIFT.ch / 2;
      const pts = roundedOutline(x0, 0, LIFT.cw, LIFT.ch, LIFT.r).map(([x, y]) => deskPoint(cx + (x - cx) * k + dx, cy + (y - cy) * k + dy, z, T));
      ctx.save(); ctx.filter = `blur(${blur.toFixed(2)}px)`; poly(pts); ctx.fillStyle = rgba(shade, alpha); ctx.fill(); ctx.restore();
    };
    S.cards.forEach((m, i) => {
      const x0 = i * (LIFT.cw + LIFT.gap), l = m.l, others = Math.max(0, ...S.cards.filter((_, k) => k !== i).map((o) => o.l));
      shadow(x0, 10 + 40 * l, 16 + 60 * l, 1 + 0.06 * l, 0.5, 0.09 + 0.13 * l, 14 + 40 * l);      // ambient shade
      shadow(x0, 2 + 18 * l, 4 + 36 * l, 0.99 + 0.05 * l, 1, 0.32 - 0.18 * l, 3 + 22 * l);         // contact core
      // the card: lifted along the normal, scaled about its centre, drawn in strips (rows stay level under a turn about x)
      const z = 2 + LIFT.z * m.lift, cx = x0 + LIFT.cw / 2, cy = LIFT.ch / 2, N = 120, face = D.faces[i];
      for (let j = 0; j < N; j++) {
        const v0 = (j / N) * LIFT.ch, v1 = ((j + 1) / N) * LIFT.ch;
        const [xa, ya] = deskPoint(cx - (LIFT.cw / 2) * m.s, cy + (v0 - cy) * m.s, z, T), [, yb] = deskPoint(cx, cy + (v1 - cy) * m.s, z, T);
        const [xr] = deskPoint(cx + (LIFT.cw / 2) * m.s, cy + ((v0 + v1) / 2 - cy) * m.s, z, T), [xl] = deskPoint(cx - (LIFT.cw / 2) * m.s, cy + ((v0 + v1) / 2 - cy) * m.s, z, T);
        ctx.drawImage(face, 0, v0, LIFT.cw, v1 - v0, xl, ya, xr - xl, yb - ya + 0.6);
      }
      if (others > 0.001) {   // giving way: the cards left on the table sink a little
        const pts = roundedOutline(x0, 0, LIFT.cw, LIFT.ch, LIFT.r).map(([x, y]) => deskPoint(cx + (x - cx) * m.s, cy + (y - cy) * m.s, z, T));
        ctx.save(); poly(pts); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(mix(c.ground, c.ink, 0.12), others * 0.22); ctx.fill(); ctx.restore();
      }
    });
  },
  // 0: the first piece's float offset from the frame centre (its fall curve); 1…: each piece's anchor where it is drawn
  // (lift: per card, its centre on screen and its contact core's centre on the table)
  track(S, P, D) {
    if (P.mode === 'lift') return S.cards.flatMap((m, i) => { const cx = i * (LIFT.cw + LIFT.gap) + LIFT.cw / 2, cy = LIFT.ch / 2; return [deskPoint(cx, cy, 2 + LIFT.z * m.lift, S.tilt), deskPoint(cx + 2 + 18 * m.l, cy + 4 + 36 * m.l, 1, S.tilt)]; });
    return [[960 - S.h[0] * 0.34, 540 - S.h[0] * 0.78], ...D.pieces.map((it, i) => [it.x - S.h[i] * 0.34, it.y - S.h[i] * 0.78])];
  },
};

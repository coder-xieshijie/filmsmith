// row-to-card — picked rows leave a side panel one after another on an upward arc and land on an open canvas as
// cards: on the way the row's content fades out, the card's fades in, the size follows the position three frames
// late, each lands with a slight tilt and a squash, and the empty slots stay behind as dashed outlines.
// Adapted from video-shotcraft demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx (card
// references/shots/interaction/canvas-materialize-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the accent for ticks, the card's
// top rule and the dashed slots); brand, the recipe list, names and quotes removed (rows and cards are painters the
// scene hands over, by default neutral ones from the sample copy); the cursor and checkbox clicks are cursor-glide's
// and the scene's; speed blur by the brick runtime's sub-frames instead of an SVG filter.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, wrap } from '../../lang.js';
import { painterOf, copy, look, infoSize } from '../../sample.js';
import { springAt } from '../stagger-in/brick.js';

const FLY = { damping: 17, stiffness: 95, mass: 0.9 };
const LIFT = 4, LAG = 3, LEAD = 2, FRAMES = 60;
const PANEL = { x: 1164, y: 96, w: 656, h: 888 }, ROW = { x: 1188, w: 608, h: 104, step: 116, top: 262 };
const CARD = { w: 486, h: 300 };
const TARGETS = [[116, 268, -2.5], [636, 306, 1.8], [330, 640, -1.2], [860, 650, 2.2]];
const COPY = { placed: { en: 'On the canvas', zh: '已放上画布' }, button: { en: 'Place on canvas', zh: '放到画布' } };
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (P, role, size, weight, kind) => fontFor(P.look || look, role, P.lang, size, weight, kind);
const rowRect = (slot) => [ROW.x, ROW.top + slot * ROW.step, ROW.w, ROW.h];

const tick = (ctx, x, y, s, c, draw = 1, color = null) => {
  ctx.save(); ctx.lineWidth = 2.6 * s / 18 * 1.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color || c.onAccent || c.panel;
  const pts = [[3.5, 9.5], [7.3, 13], [14.5, 5]].map(([a, b]) => [x + (a / 18) * s, y + (b / 18) * s]);
  const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
  ctx.setLineDash([l1 + l2, l1 + l2]); ctx.lineDashOffset = (l1 + l2) * (1 - clamp(draw));
  ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.lineTo(...pts[2]); ctx.stroke();
  ctx.restore();
};
// A neutral row: a ticked box, the title, a meta pill (w × h at 1:1).
export const neutralRow = (item, P) => (ctx, w, h, checked = true) => {
  const c = P.colors;
  rrect(ctx, 24, h / 2 - 18, 36, 36, 10);
  if (checked) { ctx.fillStyle = c.accent; ctx.fill(); tick(ctx, 31, h / 2 - 11, 22, c); }
  else { ctx.fillStyle = c.panel; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(c.ink, 0.22); ctx.stroke(); }
  text(ctx, item.title, 82, h / 2 + 11, F(P, 'text', 32, 600), { color: c.ink });
  text(ctx, item.meta, w - 24, h / 2 + 9, F(P, 'text', infoSize(P.lang), 500), { color: c.dim, align: 'right' });
};
// A neutral card: the meta as a tag, the title large, a caption, a foot line.
export const neutralCard = (item, P) => (ctx, w, h) => {
  const c = P.colors, info = infoSize(P.lang), pad = 30;
  const tf = F(P, 'mono', info, 600, 'label');
  text(ctx, item.meta, pad, 26 + info, tf, { color: c.accent });
  wrap(ctx, item.title, F(P, 'display', 40, 680), w - pad * 2, P.lang).slice(0, 2).forEach((l, i) => text(ctx, l, pad, 26 + info + 62 + i * 46, F(P, 'display', 40, 680), { color: c.ink }));
  ctx.fillStyle = mix(c.panel, c.ink, 0.08);
  for (let k = 0; k < 2; k++) { rrect(ctx, pad, 26 + info + 108 + k * 26, (w - pad * 2) * (0.86 - k * 0.3), 12, 6); ctx.fill(); }
  text(ctx, copy('caption', P.lang), pad, h - 34, F(P, 'text', info, 500), { color: c.dim });
};

// The default scene: a canvas board on the left (dot grid, a heading), a panel of five rows on the right; the rows in
// `skip` are left out (they are the brick's to draw). Neutral copy only.
const board = (P, skip) => (ctx) => {
  const c = P.colors, lang = P.lang, items = copy('cards', lang);
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = rgba(c.ink, 0.13);
  for (let y = 14; y < 1080; y += 38) for (let x = 10; x < 1120; x += 38) { const d = Math.hypot((x - 560) / 560, (y - 600) / 640); if (d < 1) { ctx.globalAlpha = Math.min(1, (1 - d) * 2.2); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); } }
  ctx.globalAlpha = 1;
  text(ctx, copy('eyebrow', lang), 120, 112, F(P, 'mono', infoSize(lang), 600, 'label'), { color: c.accent });
  text(ctx, copy('detailTitle', lang), 116, 196, F(P, 'display', 84, 700, 'display'), { color: c.ink });
  ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.16); ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rrect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 30); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
  rrect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 30); ctx.lineWidth = 1.5; ctx.strokeStyle = c.line; ctx.stroke();
  text(ctx, copy('title', lang), PANEL.x + 32, PANEL.y + 80, F(P, 'display', 44, 700), { color: c.ink });
  text(ctx, copy('subtitle', lang), PANEL.x + 32, PANEL.y + 130, F(P, 'text', infoSize(lang) + 1, 450), { color: c.dim });
  for (let s = 0; s < 5; s++) {
    if (skip.includes(s)) continue;
    const [x, y, w, h] = rowRect(s);
    rrect(ctx, x, y, w, h, 18); ctx.fillStyle = mix(c.panel, c.ground, 0.45); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = c.line; ctx.stroke();
    ctx.save(); ctx.translate(x, y); neutralRow(items[s % items.length], P)(ctx, w, h, false); ctx.restore();
  }
  const bx = PANEL.x + 24, by = PANEL.y + PANEL.h - 116;
  rrect(ctx, bx, by, PANEL.w - 48, 92, 20); ctx.fillStyle = c.ink; ctx.fill();
  text(ctx, pick(COPY.button, lang), bx + (PANEL.w - 48) / 2, by + 56, F(P, 'text', 32, 620), { color: c.panel, align: 'center' });
};

const itemsOf = (P) => {
  const cards = copy('cards', P.lang);
  return (P.items || [0, 2, 3].map((slot, k) => ({ from: rowRect(slot), to: [TARGETS[k][0], TARGETS[k][1], CARD.w, CARD.h], rot: TARGETS[k][2], slot }))).map((it, k) => {
    const data = cards[(it.slot ?? k) % cards.length];
    return { ...it, rot: it.rot ?? TARGETS[k % TARGETS.length][2], row: it.row || neutralRow(data, P), card: it.card || neutralCard(data, P) };
  });
};
const framesOf = (P) => Math.max(FRAMES, LEAD + LIFT + ((P.items || [0, 1, 2]).length - 1) * P.stagger + 42);

// Geometry of item k at frame f (upstream flyGeom): position on a quadratic arc lifted `lift` px, size 3 frames late.
const geom = (it, k, f, P) => {
  const start = LEAD + k * P.stagger + LIFT;
  const u = springAt(f - start, FLY), us = springAt(f - start - LAG, FLY);
  const [fx, fy, fw, fh] = it.from, [tx, ty, tw, th] = it.to;
  const sx = fx + fw / 2, sy = fy + fh / 2, ex = tx + tw / 2, ey = ty + th / 2;
  const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - P.lift, q = clamp(u);
  const x = (1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * ex + (u - q) * (ex - cx) * 0.6;
  const y = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ey + (u - q) * (ey - cy) * 0.6;
  const pre = ramp(f, start - LIFT, LIFT, 'out'), flying = f >= start;
  const squash = 1 - 0.03 * Math.sin(Math.PI * clamp((f - start - 22) / 6));
  return {
    flying, pre, u, us, x: flying ? x : sx, y: flying ? y : sy,
    w: flying ? lerp(fw, tw, us) : fw * (1 + 0.02 * pre), h: flying ? lerp(fh, th, us) : fh * (1 + 0.02 * pre),
    rot: flying ? it.rot * u : 0, arc: Math.sin(Math.PI * q), squash, landed: u > 0.96,
    rowOp: 1 - ramp(us, 0.08, 0.32, 'linear'), cardOp: ramp(us, 0.5, 0.3, 'linear'), ghost: ramp(f, start + 4, 10, 'out'),
  };
};

export default {
  id: 'row-to-card', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: 4,
  beatsFor: (P) => framesOf(P) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  from: 'a panel listing rows, some picked (the scene draws the panel and every row that stays)',
  to: 'the same panel with dashed empty slots, the picked items as cards on the canvas',
  interpolates: ['each item: lift 4 f (scale 1.02, deeper shadow), then position on a quadratic arc lifted 220 px (spring 17/95/0.9), size and corner 3 f later', 'row content out over us 0.08–0.40, card content in over 0.50–0.80', 'tilt 0 → its own angle, a 6 f squash on landing, the slot behind turning to a dashed outline'],
  summary: 'Picked rows leave a panel on an upward arc, staggered, and land on the canvas as cards; their slots stay as dashed outlines.',
  theory: 'Object permanence across containers: the same object changing form on one continuous path reads as moved, not deleted and re-added (the cross-fade never shows both forms at once); the dashed slot says "moved", not "copied".',
  sceneRest: false,
  defaults: () => ({ from: { scene: 'board' }, items: null, stagger: 6, lift: 220 }),
  prepare(P) {
    const items = itemsOf(P);
    const scene = P.from?.scene === 'board' ? board(P, items.map((it) => it.slot).filter((s) => s != null)) : painterOf(P.from, P);
    return { items, scene, frames: framesOf(P) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) { const f = p * D.frames; return { p, f, g: D.items.map((it, k) => geom(it, k, f, P)) }; },
  paint(ctx, S, P, D) {
    const c = P.colors, shadowTone = mix(c.ink, '#000000', 0.6);
    if (D.scene) D.scene(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    D.items.forEach((it, k) => {                               // the slots left behind
      const g = S.g[k], [x, y, w, h] = it.from;
      if (!g.flying) return;
      if (g.ghost <= 0) return;
      ctx.save(); ctx.globalAlpha = g.ghost;
      rrect(ctx, x + 1, y + 1, w - 2, h - 2, 18); ctx.fillStyle = rgba(c.accent, 0.04); ctx.fill();
      ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = rgba(c.accent, 0.45); ctx.stroke(); ctx.setLineDash([]);
      const lf = F(P, 'text', infoSize(P.lang), 600), label = pick(P.placed ?? COPY.placed, P.lang);
      const lw = measure(ctx, label, lf).width;
      tick(ctx, x + w / 2 - (lw + 34) / 2, y + h / 2 - 11, 22, c, 1, c.accent);
      text(ctx, label, x + w / 2 - (lw + 34) / 2 + 34, y + h / 2 + 9, lf, { color: rgba(c.accent, 0.85) });
      ctx.restore();
    });
    D.items.forEach((it, k) => {                               // the items, rows or cards or between
      const g = S.g[k], w = g.w, h = g.h, r = lerp(18, 24, Math.min(1, Math.max(0, g.us)));
      const elev = g.flying ? 8 + 46 * g.arc + (g.landed ? 0 : 6) : 4 + 10 * g.pre;
      ctx.save();
      ctx.translate(g.x, g.y + h / 2); ctx.rotate((g.rot * Math.PI) / 180); ctx.scale(1, g.squash); ctx.translate(-w / 2, -h);
      ctx.save(); ctx.shadowColor = rgba(shadowTone, 0.12 + elev * 0.002); ctx.shadowBlur = 4 + elev * 1.1; ctx.shadowOffsetY = 2 + elev * 0.45;
      rrect(ctx, 0, 0, w, h, r); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      ctx.save(); rrect(ctx, 0, 0, w, h, r); ctx.clip();
      if (g.cardOp > 0) { ctx.fillStyle = rgba(c.accent, g.cardOp); ctx.fillRect(0, 0, w, 6); }
      if (g.rowOp > 0) { ctx.save(); ctx.globalAlpha *= g.rowOp; it.row(ctx, it.from[2], it.from[3]); ctx.restore(); }
      if (g.cardOp > 0) { ctx.save(); ctx.globalAlpha *= g.cardOp; it.card(ctx, it.to[2], it.to[3]); ctx.restore(); }
      ctx.restore();
      rrect(ctx, 0.5, 0.5, w - 1, h - 1, r); ctx.lineWidth = 1; ctx.strokeStyle = g.cardOp < 1 ? mix(c.line, c.accent, 0.35 * (1 - g.cardOp)) : c.line; ctx.stroke();
      ctx.restore();
    });
  },
  track(S) { return S.g.map((g) => [g.x, g.y]); },
};

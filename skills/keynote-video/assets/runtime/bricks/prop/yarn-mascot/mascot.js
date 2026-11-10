// mascot.js — the stream style's mascot slot: a small ball of thread whose loose end is the thread itself, drawn in
// code (no image): an accent halo, a ball shaded core → glow → accent, three wound arcs across it, two eyes and a
// highlight. A film with its own mascot passes an image (`img`), drawn in the ball's 60 px box at the same anchor;
// nothing else changes (the thread still leaves from the anchor). The box is 60 px at scale 1; a film's own size is a
// scale on top (the engine's mascotSize: sit / 60).
// From the stream template's film.js mascot().
import { glow } from '../glow-thread/draw.js';

// (x, y) the anchor (the ball's centre), s its scale, a its opacity, squash > 0 a landing squash (wider, lower)
export const mascot = (ctx, C, x, y, s = 1, a = 1, squash = 0, img = null) => {
  if (a <= 0.01 || s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + squash), s * (1 - squash)); ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, 0, 0, 74, C.line, 0.32);
  ctx.globalCompositeOperation = 'source-over';
  if (img) { const k = 60 / Math.max(img.width || 60, img.height || 60), w = (img.width || 60) * k, h = (img.height || 60) * k; ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore(); return; }
  const r = 30, g = ctx.createRadialGradient(-10, -12, 2, 0, 0, r);
  g.addColorStop(0, `rgb(${C.core})`); g.addColorStop(0.6, `rgb(${C.glow})`); g.addColorStop(1, `rgb(${C.line})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 0.5, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = `rgba(${C.onLine},0.26)`; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  [[-0.5, 34, 14, 10], [0.35, 30, 12, -12], [1.25, 36, 16, 4]].forEach(([rot, rx, ry, oy]) => { ctx.save(); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, oy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore(); });
  ctx.restore();
  ctx.fillStyle = `rgb(${C.onLine})`;
  [[-9, 3], [9, 3]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 3.3, 4.4, 0, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = `rgba(${C.core},0.9)`; ctx.beginPath(); ctx.ellipse(-12, -15, 6, 3.5, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
// the slot's poses as bounding boxes (SPEC 3.3: a mascot slot gives an anchor and its boxes): sit (on the spine top),
// drop (falling, 1.6 ×), squash (landing), point (wound into the point a name opens from)
export const POSES = { sit: { box: [-37, -37, 74, 74], s: 1 }, drop: { box: [-59, -59, 118, 118], s: 1.6 }, squash: { box: [-70, -48, 140, 96], s: 1.6 }, point: { box: [-22, -22, 44, 44], s: 0.6 } };

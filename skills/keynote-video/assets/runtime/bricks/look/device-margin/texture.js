// texture.js — the device-margin ground and its specimen: a fixed seeded grain tile laid at 4 % overlay (it never
// moves), and the look sheet's cell (a small head-on laptop with a lit band and the ring). From the handset template
// (film.js grainTile at 4 %). A frame depends on its arguments only.
import { rrect, rgba, mix } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';

export const grainTile = (cv, seed = 3) => {
  const c = cv.getContext('2d'), img = c.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(hash(i, seed) * 255); img.data[4 * i] = img.data[4 * i + 1] = img.data[4 * i + 2] = v; img.data[4 * i + 3] = 255; }
  c.putImageData(img, 0, 0);
  return cv;
};
export const grain = (ctx, tile, amount = 0.04, w = 1920, h = 1080) => {
  if (!tile || amount <= 0) return;
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay';
  for (let y = 0; y < h; y += 256) for (let x = 0; x < w; x += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
};
// The specimen cell: a head-on laptop (lid, edge, screen, deck), a light band on the screen, the ring and the tick.
export const specimen = (ctx, w, h, C) => {
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, w, h);
  const lw = Math.min(w * 0.6, h * 1.2), lh = lw * 0.67, x = w * 0.08, y = (h - lh) / 2 - 6;
  rrect(ctx, x, y, lw, lh, 10); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  const sx = x + 8, sy = y + 8, sw = lw - 16, sh = lh * 0.86;
  ctx.fillStyle = C.paper || C.ink; ctx.fillRect(sx, sy, sw, sh);
  ctx.fillStyle = mix(C.paper || C.ink, C.ground, 0.25);
  for (let i = 0; i < 6; i++) ctx.fillRect(sx + 14, sy + 16 + i * (sh / 6.5), sw * (0.4 + 0.07 * (i % 3)), 6);
  ctx.fillStyle = rgba(C.ground, 0.52); ctx.fillRect(sx, sy, sw, sh * 0.4); ctx.fillRect(sx, sy + sh * 0.58, sw, sh * 0.42);
  rrect(ctx, sx + 8, sy + sh * 0.4 + 4, sw * 0.5, sh * 0.18 - 8, 5); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.accent; rrect(ctx, x + lw - 3, sy + sh * 0.49 - 10, 4, 20, 2); ctx.fill();
  ctx.fillStyle = C.deck || C.panel; ctx.fillRect(x - 10, y + lh, lw + 20, 6);
};

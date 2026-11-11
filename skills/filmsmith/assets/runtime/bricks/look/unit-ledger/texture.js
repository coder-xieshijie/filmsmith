// texture.js — the unit-ledger ground as pure painters: the radial glow (panel at 62 %, 42 %, into ground and edge)
// and a seeded grain tile. From the tally template's index.html background. A frame depends on its arguments only.
import { mix } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';

// The ground of every tally frame.
export const radial = (ctx, C, w = 1920, h = 1080) => {
  const g = ctx.createRadialGradient(w * 0.62, h * 0.42, 0, w * 0.62, h * 0.42, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, C.panel || C.ground); g.addColorStop(0.55, C.ground); g.addColorStop(1, C.edge || mix(C.ground, '#000000', 0.35));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
};
// A 256 px grain tile drawn once per brick (prepare) with a canvas the caller passes: values from the seeded hash.
export const grainTile = (cv, seed = 3) => {
  const c = cv.getContext('2d'), img = c.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(hash(i, seed) * 255); img.data[4 * i] = img.data[4 * i + 1] = img.data[4 * i + 2] = v; img.data[4 * i + 3] = 255; }
  c.putImageData(img, 0, 0);
  return cv;
};
export const grain = (ctx, tile, amount = 0.05, w = 1920, h = 1080) => {
  if (!tile || amount <= 0) return;
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay';
  for (let y = 0; y < h; y += 256) for (let x = 0; x < w; x += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
};
// The specimen cell of the look sheet: a band of squares in base, rest and the accent on the radial ground.
export const specimen = (ctx, w, h, C) => {
  radial(ctx, C, w, h);
  const p = 18, s = 14;
  for (let r = 0; r < 4; r++) for (let k = 0; k < Math.floor((w - 80) / p); k++) {
    const role = k < 9 ? 'accent' : k < 30 ? 'base' : 'rest';
    ctx.fillStyle = C[role] || C.ink; ctx.beginPath(); ctx.roundRect(40 + k * p, h / 2 - 36 + r * p, s, s, s * 0.18); ctx.fill();
  }
};

// texture.js — the light-desk ground: the desk (the back plane) with a fixed-seed fibre texture laid in soft light,
// the cutting mat's grid (desk 'mat'), and the light falling off toward the frame's edges; plus the look sheet's
// specimen cell (a mount with its bar on the desk, a ringed region and a chip). From the exhibit template (film.js
// desk, falloff, texture). A frame depends on its arguments only.
import { rgba, rrect, mix } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';

// the fibre tile: a 256 px grey noise around mid-grey (± 9), drawn once per brick with a canvas the caller passes
export const fibreTile = (cv, seed = 1) => {
  const g = cv.getContext('2d'), img = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (hash(i, seed) - 0.5) * 18; img.data[4 * i] = img.data[4 * i + 1] = img.data[4 * i + 2] = v; img.data[4 * i + 3] = 255; }
  g.putImageData(img, 0, 0);
  return cv;
};
// the desk seen through the back plane's view v ({ a, bx, by }); mat: the cutting mat's grid every 80 desk px
export const desk = (ctx, C, v, tile, { mat = false, w = 1920, h = 1080 } = {}) => {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, w, h);
  if (tile) {
    const pat = ctx.createPattern(tile, 'repeat');
    pat.setTransform(new DOMMatrix([v.a * 2, 0, 0, v.a * 2, v.bx, v.by]));
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  if (mat) {
    const step = 80 * v.a;
    ctx.strokeStyle = rgba(C.muted || C.dim, 0.22); ctx.lineWidth = 1; ctx.beginPath();
    for (let x = ((v.bx % step) + step) % step; x < w; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h); }
    for (let y = ((v.by % step) + step) % step; y < h; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5); }
    ctx.stroke();
  }
  ctx.restore();
};
// the light falls off toward the edges: 10 % of a warm shadow at the corners on a light desk, 38 % of black on a dark
export const falloff = (ctx, C, dark, w = 1920, h = 1080) => {
  const g = ctx.createRadialGradient(w / 2, h * 0.48, 420, w / 2, h / 2, 1250);
  const edge = dark ? mix(C.ground, C.onPaper || C.ground, 1) : mix(C.dim, C.ground, 0.2);
  g.addColorStop(0, rgba(edge, 0)); g.addColorStop(1, rgba(edge, dark ? 0.38 : 0.1));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
};
export const specimen = (ctx, w, h, C) => {
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, w, h);
  const mw = w * 0.56, mh = mw * 0.6, x = w * 0.12, y = (h - mh) / 2;
  ctx.save(); ctx.shadowColor = rgba(C.onPaper, 0.3); ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  rrect(ctx, x, y, mw, mh, 8); ctx.fillStyle = C.panel; ctx.fill(); ctx.restore();
  ctx.fillStyle = mix(C.panel, C.line, 0.6); ctx.fillRect(x, y, mw, 18);
  ctx.fillStyle = mix(C.panel, C.dim, 0.35); for (let i = 0; i < 5; i++) ctx.fillRect(x + 16, y + 34 + i * (mh / 6.5), mw * (0.5 + 0.08 * (i % 3)), 7);
  rrect(ctx, x + 10, y + 34 + 2 * (mh / 6.5) - 8, mw * 0.4, 22, 6); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke();
  const cx = x + mw * 0.7, cy = y + mh * 0.72;
  ctx.save(); ctx.shadowColor = rgba(C.onPaper, 0.35); ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
  rrect(ctx, cx, cy, mw * 0.5, mh * 0.34, 8); ctx.fillStyle = C.panel; ctx.fill(); ctx.restore();
  ctx.fillStyle = C.accent; ctx.fillRect(cx + 12, cy + 12, 4, mh * 0.34 - 24);
};

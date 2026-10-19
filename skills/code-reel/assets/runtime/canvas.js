// canvas.js — canvas setup, film grain and sub-frame motion blur.
import { mulberry32 } from './rng.js';

export const canvas2d = (id, w = 1920, h = 1080) => {
  const c = document.getElementById(id);
  c.width = w;
  c.height = h;
  return c.getContext('2d');
};

// A 256×256 grain tile drawn once from a seed; drawGrain shifts it per frame by a function of t.
export const grainTile = (seed = 7, size = 256, strength = 22) => {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const r = mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 2 * strength;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};

export const drawGrain = (ctx, tile, t, { alpha = 0.06, fps = 30, mode = 'overlay' } = {}) => {
  const f = Math.floor(t * fps);
  const ox = (f * 97) % tile.width, oy = (f * 61) % tile.height;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.translate(-ox, -oy);
  const W = ctx.canvas.width + tile.width, H = ctx.canvas.height + tile.height;
  for (let y = 0; y < H; y += tile.height) for (let x = 0; x < W; x += tile.width) ctx.drawImage(tile, x, y);
  ctx.restore();
};

// Motion blur: render n sub-frames spread over the shutter (a fraction of one frame, ending at t) and average them.
// draw(ctx, t) paints the frame at time t; it is called with a scratch context, so it must not keep state.
//
//   subframes(ctx, draw, t, { n, fps, shutter })                  fixed n, running average (the original form)
//   subframes(ctx, draw, t, { speed, fps, shutter, step, ... })   on only above a speed threshold (below)
//
// `speed`: px per frame of the fastest edge at t (a number, or a function of t). Below `threshold` (default 1 px) the
// frame is drawn once, sharp: no blur while settled, none left after landing. Above it the sub-frames are spaced at most
// `step` px apart (default 2, under the width of a 3 px stroke), so a fast thin line becomes a streak instead of a row of
// ghost copies; n = ceil(speed · shutter / step) clamped to [minN, maxN], and when even maxN cannot keep that spacing the
// shutter shortens (the streak is at most maxN · step px long, never broken). This form sums the sub-frames exactly
// (integers, premultiplied alpha, fixed order), so a frame renders bit-identically every time and a transparent layer
// (a hand-off drawn over the template's scene) keeps clean edges; the result is composited onto ctx with drawImage.
// `exact: true` selects the exact sum for a fixed n too. Render cost is multiplied by n on the blurred frames only.
export const blurPlan = (speed, { shutter = 0.5, step = 2, threshold = 1, minN = 4, maxN = 32 } = {}) => {
  if (!(speed > threshold)) return { n: 0, shutter: 0 };
  const streak = speed * shutter;
  const n = Math.min(maxN, Math.max(minN, Math.ceil(streak / step)));
  return { n, shutter: Math.min(shutter, (n * step) / speed) };
};

const exact = { c: null, x: null, o: null, ox: null, sum: null, sa: null };
const subframesExact = (ctx, draw, t, n, fps, shutter) => {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  if (!exact.c || exact.c.width !== W || exact.c.height !== H) {
    exact.c = document.createElement('canvas'); exact.c.width = W; exact.c.height = H;
    exact.x = exact.c.getContext('2d', { willReadFrequently: true });
    // CPU-backed too: drawing a GPU canvas into a CPU one switches the target's rasterizer (its antialiasing changes,
    // so the next frames would no longer match frames rendered alone)
    exact.o = document.createElement('canvas'); exact.o.width = W; exact.o.height = H;
    exact.ox = exact.o.getContext('2d', { willReadFrequently: true });
    exact.sum = new Uint32Array(W * H * 3);
    exact.sa = new Uint32Array(W * H);
  }
  const { x, sum, sa } = exact;
  sum.fill(0); sa.fill(0);
  for (let i = 0; i < n; i++) {
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, W, H);
    x.save();
    draw(x, t - (shutter / fps) * (i / n));
    x.restore();
    const d = x.getImageData(0, 0, W, H).data;
    for (let k = 0, j = 0, q = 0; k < d.length; k += 4, j += 3, q++) {
      const a = d[k + 3];
      if (!a) continue;
      sum[j] += d[k] * a; sum[j + 1] += d[k + 1] * a; sum[j + 2] += d[k + 2] * a;
      sa[q] += a;
    }
  }
  const img = x.createImageData(W, H), o = img.data, half = n >> 1;
  for (let k = 0, j = 0, q = 0; k < o.length; k += 4, j += 3, q++) {
    const s = sa[q];
    if (!s) continue;
    const hs = s >> 1;
    o[k] = Math.floor((sum[j] + hs) / s); o[k + 1] = Math.floor((sum[j + 1] + hs) / s); o[k + 2] = Math.floor((sum[j + 2] + hs) / s);
    o[k + 3] = Math.floor((s + half) / n);
  }
  exact.ox.putImageData(img, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(exact.o, 0, 0);
  ctx.restore();
};

export const subframes = (ctx, draw, t, opts = {}) => {
  const { n: n0 = 6, fps = 30, shutter: sh0 = 0.5 } = opts;
  if (opts.speed != null) {
    const v = typeof opts.speed === 'function' ? opts.speed(t) : opts.speed;
    const plan = blurPlan(v, { shutter: sh0, ...opts });
    if (!plan.n) return draw(ctx, t);
    return subframesExact(ctx, draw, t, plan.n, fps, plan.shutter);
  }
  if (opts.exact) return n0 <= 1 ? draw(ctx, t) : subframesExact(ctx, draw, t, n0, fps, sh0);
  return subframesAverage(ctx, draw, t, { n: n0, fps, shutter: sh0 });
};

// The original running average (kept so existing films render as before).
const subframesAverage = (ctx, draw, t, { n = 6, fps = 30, shutter = 0.5 } = {}) => {
  if (n <= 1) return draw(ctx, t);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const acc = subframes.acc || (subframes.acc = document.createElement('canvas'));
  if (acc.width !== W || acc.height !== H) { acc.width = W; acc.height = H; }
  const a = acc.getContext('2d');
  a.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) {
    const ts = t - (shutter / fps) * (i / n);
    draw(ctx, ts);
    a.globalAlpha = 1 / (i + 1);
    a.drawImage(ctx.canvas, 0, 0);
  }
  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.drawImage(acc, 0, 0);
};

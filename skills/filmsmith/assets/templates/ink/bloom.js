// bloom.js — the ink bloom: the dot sinks into the paper and blooms into the accent field as a fluid.
//
// The fluid is simulated once by bloom-bake.mjs (inkflow.js: ink dropped in water) and stored in assets/bloom/; here
// the stored ink at beat b is drawn as pigment on paper on the CPU (inkflow.js shade), so a frame is a pure function
// of b and every machine draws the same pixels.
//   rest (beats 0–1)     the dot, exactly as the slam scene left it (r 34, centred)
//   drop (1)             the dot is released and blooms into lobes and curls
//   pour (2.4)           held ink and three drops thicken and widen the mass
//   spread (4.2)         drops round the rim carry it past the frame while the camera pushes in (3.6 → 2.4× at 7.2)
//   flat (6.9–7.9)       the tones even out; beat 8 is exactly the accent hex the name scene stands on
// About 20 ms a frame at 1920 × 1080 on an M4 Pro.

import { BLOOM, shade, viewAt } from './inkflow.js';

export { BLOOM };

const smooth = (a, z, x) => { const u = Math.min(1, Math.max(0, (x - a) / (z - a))); return u * u * (3 - 2 * u); };

// createBloom({ seed, W, H }) → Promise<{ frame(b, pal), canvas, renderer }>. b = beats since the bloom started (0..8);
// frame returns the canvas holding paper + bloom, for drawImage. Throws when the baked fields are missing or were
// baked for another seed (run `npm run bloom`).
export const createBloom = async ({ seed = 1, W = 1920, H = 1080 } = {}) => {
  const meta = await fetch('assets/bloom/field.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!meta) throw new Error('assets/bloom/field.json is missing: run `npm run bloom`');
  if (meta.seed !== seed) throw new Error(`the bloom was baked for seed ${meta.seed}, the film's is ${seed}: run \`npm run bloom\``);
  const raw = new Uint8Array(await (await fetch('assets/bloom/field.inkz')).arrayBuffer());
  // gzip unless the server already undid it
  const data = raw[0] === 0x1f && raw[1] === 0x8b
    ? new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())
    : raw;
  const F = { ...meta, data };
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  let last = null;
  const frame = (b, pal) => {
    const key = `${b}|${pal.paper}|${pal.accent}`;
    if (key === last) return canvas;
    shade(F, b, img.data, W, H, pal, viewAt(b));
    ctx.putImageData(img, 0, 0);
    last = key;
    return canvas;
  };
  return { frame, canvas, renderer: 'cpu' };
};

// Without the baked fields: the dot grows into a plain disc that covers the frame by beat 7.5 (with a console error
// and the red banner). The film is not acceptable that way; TEMPLATE.md says so.
export const drawBloomFallback = (ctx, b, pal, W = 1920, H = 1080) => {
  ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
  const u = smooth(0.8, 7.5, b), r = 34 + u * (Math.hypot(W, H) / 2 - 34);
  ctx.fillStyle = pal.accent; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.fill();
};

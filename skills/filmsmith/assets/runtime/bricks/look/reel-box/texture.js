// texture.js — the reel-box ground: the light box (the ground, brighter at the gate's centre) and the look sheet's
// specimen cell (a piece of strip with an intertitle and a frame, the pencil's loop). From the strip template
// (film.js lightbox; lib/handoffs/strip.js painters). A frame depends on its arguments only.
import { text } from '../../../handoffs/util.js';
import { paintStrip, pencilLoop, cellFrame } from '../../../handoffs/strip.js';

export const lightbox = (ctx, C, w = 1920, h = 1080) => {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.45, 120, w / 2, h * 0.45, 1150);
  g.addColorStop(0, C.glow || C.ground); g.addColorStop(1, C.ground);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.restore();
};
export const specimen = (ctx, w, h, C, lang = 'en') => {
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, w, h);
  const k = w / 2400, F = { title: { family: '"Hanken Grotesk", "Noto Sans SC", sans-serif', weight: 700 } };
  const cells = [{ kind: 'title', text: lang === 'zh' ? '十种方式' : 'Ten ways', size: 79 }, { kind: 'title', text: '' }, { kind: 'title', text: lang === 'zh' ? '用代码' : 'in code', size: 79 }];
  paintStrip(ctx, C, F, { cells, s: 1, cx: w / 2, top: h / 2 - 330 * k, k });
  pencilLoop(ctx, C, cellFrame(1, 1, w / 2, h / 2 - 330 * k, k), 1, { width: 3 });
  text(ctx, lang === 'zh' ? '选一种风格。' : 'Pick a style.', w / 2, h - 10, { family: F.title.family, weight: 600, size: 14 }, { color: C.ink, align: 'center' });
};

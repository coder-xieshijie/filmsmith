// strip.js — the still of an arc split from a launch style: one block per slot along a time axis at the
// arc's default length, labelled with its role (both languages), its seconds and the bricks that fill it in the
// style's example film; peaks outlined in the accent. Shared by count-to-close, rule-run, dimension-climb and
// anchor-launch. Draws on the neutral look; it does not take part in a film.
import { rgba, rrect, text } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const ZH = { hook: '钩子', problem: '问题', turn: '转折', demo: '演示', climax: '高潮', proof: '证据', claim: '主张', rest: '休息', lockup: '落版' };
export const drawStrip = (ctx, A, { title, note }, { colors: c, lang = 'en', look = NEUTRAL } = {}) => {
  const zh = lang === 'zh', F = (size, weight, role = 'text') => fontFor(look, role, lang, size, weight);
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  text(ctx, title[zh ? 'zh' : 'en'], 120, 190, F(80, 750, 'display'), { color: c.ink });
  text(ctx, note[zh ? 'zh' : 'en'], 120, 252, F(zh ? 34 : 32, 450), { color: c.dim });
  const blocks = A.slots.map((s) => ({ ...s, mid: (s.sec[0] + s.sec[1]) / 2 * (Array.isArray(s.repeat) ? s.repeat[0] : 1) }));
  const total = blocks.reduce((a, b) => a + b.mid, 0), x0 = 120, W = 1680, k = W / total, y = 380, h = 220;
  let x = x0;
  blocks.forEach((b, i) => {
    const w = Math.max(8, b.mid * k - 10);
    rrect(ctx, x, y, w, h, 14);
    ctx.fillStyle = b.peak ? rgba(c.accent, 0.16) : rgba(c.ink, 0.08 + 0.04 * (i % 3)); ctx.fill();
    if (b.peak) { ctx.lineWidth = 3; ctx.strokeStyle = c.accent; ctx.stroke(); }
    text(ctx, zh ? ZH[b.role] : b.role, x + 14, y + 52, F(zh ? 34 : 30, 650), { color: c.ink });
    text(ctx, `${b.sec[0]}–${b.sec[1]}${zh ? ' 秒' : ' s'}${b.repeat ? ` ×${b.repeat[0]}–${b.repeat[1]}` : ''}`, x + 14, y + 96, F(26, 500, 'mono'), { color: c.dim });
    (b.scenes?.ids || []).slice(0, 2).forEach((id, j) => {
      const ty = y + h + 56 + ((i % 2) * 2 + j) * 44;
      text(ctx, id, x + 4, ty, F(28, 500, 'mono'), { color: c.ink });
    });
    ctx.fillStyle = c.line; ctx.fillRect(x + 2, y + h + 8, 2, 18 + (i % 2) * 88);
    x += b.mid * k;
  });
  text(ctx, `${zh ? '声音床' : 'bed'}: ${A.bedPreset}`, 120, 1000, F(28, 500, 'mono'), { color: c.dim });
};

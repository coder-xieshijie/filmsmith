// table.js — the still of a sound brick split from a launch style: the bed (preset or recipe, tempo, key,
// sections per arc role) and the cue table (picture event → voice, gain, lead), on the neutral look. Shared by
// data-bed, diagram-bed, glass-climb and press-bed. It does not take part in a film.
import { rgba, rrect, text } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const ZH = { hook: '钩子', problem: '问题', turn: '转折', demo: '演示', climax: '高潮', proof: '证据', claim: '主张', rest: '休息', lockup: '落版' };
export const drawTable = (ctx, S, { title, note }, { colors: c, lang = 'en', look = NEUTRAL } = {}) => {
  const zh = lang === 'zh', F = (size, weight, role = 'text') => fontFor(look, role, lang, size, weight);
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  text(ctx, title[zh ? 'zh' : 'en'], 120, 170, F(76, 750, 'display'), { color: c.ink });
  text(ctx, note[zh ? 'zh' : 'en'], 120, 228, F(zh ? 32 : 30, 450), { color: c.dim });
  const b = S.bed;
  text(ctx, `${zh ? '声音床' : 'bed'}  ${b.preset || b.recipe?.name}   ${b.bpm.min}–${b.bpm.max} BPM   ${b.key}`, 120, 320, F(34, 600, 'mono'), { color: c.ink });
  // the sections along the arc roles
  const roles = Object.keys(b.kinds), w = 1680 / roles.length;
  roles.forEach((r, i) => {
    const x = 120 + i * w, e = b.energy?.[r] ?? 0.5;
    rrect(ctx, x, 360, w - 10, 120, 12); ctx.fillStyle = rgba(c.accent, 0.08 + 0.3 * e); ctx.fill();
    text(ctx, zh ? ZH[r] : r, x + 12, 404, F(zh ? 30 : 28, 650), { color: c.ink });
    text(ctx, b.kinds[r], x + 12, 452, F(26, 500, 'mono'), { color: c.dim });
  });
  // the cues
  const cues = Object.entries(S.cues).filter(([, v]) => v.voice);
  cues.forEach(([k, v], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 120 + col * 860, y = 560 + row * 62;
    text(ctx, k, x, y, F(30, 600, 'mono'), { color: c.ink });
    text(ctx, `${v.voice}  ${v.gain} dB${v.lead ? `  lead ${v.lead} s` : ''}`, x + 220, y, F(28, 500, 'mono'), { color: c.dim });
  });
  text(ctx, `master ${S.master.lufs} LUFS · ${S.master.tp} dBTP`, 120, 1010, F(26, 500, 'mono'), { color: c.dim });
};

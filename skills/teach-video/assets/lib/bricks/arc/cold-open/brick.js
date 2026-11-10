// cold-open — an arc for the first seconds of a launch film or teaser: three hard nine-frame cuts of the product (a
// whole page, another page, one detail close up), one beat of black silence, then the opening title fades up and holds.
// Adapted from video-shotcraft demos/rhythm/trailer-grammar-moves/TrailerBumper.tsx (card references/shots/rhythm/trailer-grammar-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: the upstream's timeline as data (SPEC 3.6) for the film maker's "set the arc, then fill each slot"; the
// product frames, the title card, the brand and its tagline are left to the scenes that fill the slots; the six-frame
// black becomes one beat on the sound bed's rest section. `draw` paints the arc's animatic still (labelled grey blocks
// on the neutral look) for its sample; it does not take part in a film.
import { mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

export const ARC = {
  slots: [
    { role: 'hook', sec: [0.3, 0.5], repeat: [3, 3], scenes: { fits: 'demo', tags: ['still', 'page'] }, peak: 'hook', required: true, cut: 'hard', push: [1, 1.04] },
    { role: 'rest', sec: [0.2, 0.5], beats: 1, scenes: { tags: ['black'] }, silence: true, required: true },
    { role: 'lockup', sec: [2, 4], scenes: { tags: ['title'], fits: 'hook' }, peak: 'lockup', required: true },
  ],
  length: { sec: [3, 6] },
  peaks: [1, 1],
  bed: { hook: 'intro', rest: 'rest', lockup: 'outro' },
};
const LABEL = {
  en: { title: 'Cold open', hook: ['Cut 1 · whole page', 'Cut 2 · another page', 'Cut 3 · one detail'], rest: 'Black · silence', lockup: 'Opening title · holds', sec: 's', note: 'hard cuts, each pushing in 1 → 1.04', bed: 'bed' },
  zh: { title: '冷开场', hook: ['速剪 1 · 整页', '速剪 2 · 另一页', '速剪 3 · 一处细节'], rest: '黑场 · 静默', lockup: '开场标题 · 定住', sec: ' 秒', note: '硬切，每镜 1 → 1.04 轻推', bed: '声音床' },
};

export default {
  id: 'cold-open', kind: 'arc',
  arc: ARC,
  summary: 'Three nine-frame cuts of the product, one beat of black silence, then the opening title fades up and holds.',
  // the animatic still: one bar per slot along a time axis (at 120 BPM: cuts 0.3 s, black 0.5 s, title 3 s)
  draw(ctx, { colors: c, lang = 'en', look = NEUTRAL } = {}) {
    const L = LABEL[lang === 'zh' ? 'zh' : 'en'], F = (size, weight, role = 'text') => fontFor(look, role, lang, size, weight);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    text(ctx, L.title, 120, 200, F(84, 750, 'display'), { color: c.ink });
    text(ctx, L.note, 120, 262, F(lang === 'zh' ? 34 : 32, 450), { color: c.dim });
    const blocks = [...L.hook.map((t) => ({ t, sec: 0.3, tone: 'panel', kind: 'hook' })), { t: L.rest, sec: 0.5, tone: 'black', kind: 'rest' }, { t: L.lockup, sec: 3, tone: 'title', kind: 'lockup' }];
    const total = blocks.reduce((a, b) => a + b.sec, 0), x0 = 120, W = 1680, k = W / total, y = 470, h = 240;
    let x = x0;
    blocks.forEach((b, i) => {
      const w = b.sec * k - 8;
      rrect(ctx, x, y, w, h, 14);
      ctx.fillStyle = b.tone === 'black' ? mix(c.ground, '#000000', 0.94) : b.tone === 'title' ? rgba(c.accent, 0.16) : rgba(c.ink, 0.12 + 0.05 * i); ctx.fill();
      if (b.tone === 'title') { ctx.lineWidth = 2; ctx.strokeStyle = c.accent; ctx.stroke(); }
      const ty = b.kind === 'hook' ? y + h + 70 + i * 52 : y + h + 70;
      ctx.fillStyle = c.line; ctx.fillRect(x + 2, y + h + 12, 2, ty - (y + h + 12) - 34);
      text(ctx, b.t, x, ty, F(lang === 'zh' ? 32 : 30, 600), { color: c.ink });
      text(ctx, `${b.sec}${L.sec}`, b.kind === 'lockup' ? x + w : x, y - 24, F(28, 500, 'mono'), { color: c.dim, align: b.kind === 'lockup' ? 'right' : 'left' });
      x += b.sec * k;
    });
    text(ctx, `${L.bed}: intro → rest → outro`, 120, 980, F(28, 500, 'mono'), { color: c.dim });
  },
};

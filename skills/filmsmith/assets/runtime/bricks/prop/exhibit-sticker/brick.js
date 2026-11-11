// exhibit-sticker — the exhibit sticker: an accent label on the sheet's mount, overlapping only its lower margin by
// 12 px, at least 300 × 96: "EX. n" in mono semibold and the source's kind (as published, as captured) on the first
// line, where and when it was captured on the second; pressed on its beat (there at 1.1×, settling to 1 in 0.12 s,
// power 3 out) and pressed again (half as far as the stroke) on a tail move. The accent fill here is a filing mark of
// a published claim, as the mode card allows.
// From the dossier template's example (the dossier source film film.js paintSheet sticker, layout.js tagOf).
import { measureCtx, tagOf, drawSticker, paper, edges, exhibitSpec } from '../../look/evidence-mat/kit.js';

export default {
  id: 'exhibit-sticker', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // s: the press scale; a: shown
  states: { pressing: { s: 1.1, a: 1 }, pressed: { s: 1, a: 1 }, popped: { s: 1.06, a: 1 } },
  parts: ['label', 'kind', 'where'],
  swap: { ex: { type: 'number' }, kind: { type: 'text', tier: 'glance', limits: { en: { chars: 16 }, zh: { chars: 8 } } }, where: { type: 'text', tier: 'glance', limits: { en: { chars: 36 }, zh: { chars: 24 } } } },
  roles: ['ground', 'paper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ex: 3, kind: ctx.lang === 'zh' ? '原样截图' : 'as captured', where: ctx.lang === 'zh' ? '示例应用 · 2026-10-20' : 'Example app · 2026-10-20' }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en', e = exhibitSpec({ ex: P.ex, kind: P.kind, where: P.where }, L), tg = tagOf(measureCtx(), e, L);
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the mount's lower margin it overlaps, enlarged ×2 to read the label
    ctx.translate(960, 540); ctx.scale(2, 2); ctx.translate(-tg.w / 2 - 120, -tg.h / 2 - 60);
    edges(ctx, 0, 0, tg.w + 160, 72, C); paper(ctx, 0, 0, tg.w + 160, 72, C);
    drawSticker(ctx, 160 - 20, 72 - 12, tg, e, C, L, state.a, state.s);
    ctx.restore();
  },
};

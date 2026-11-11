// chip.js — the claim a print carries, set in code on label stock: a card (10 px corners, a 2 px mat edge, a shadow
// cast on the desk), the pencil's tick down its left side, a label (32 px, secondary) over a value (76 px). It lies
// on the front glass, so it moves 1.65 times as far as the print under it. Also the dimension's chip: the measured
// difference on stock with a mat edge (44 px). From the exhibit template (film.js chips, measures).
import { rrect, text, settle } from '../../../handoffs/util.js';
import { castShadow } from '../../../handoffs/stage.js';

// a claim chip at plane rect c seen through plane view v; chip: [label, value]; k (0..1): how far it has landed
export const drawChip = (ctx, v, c, chip, C, font, { k = 1 } = {}) => {
  if (k <= 0) return;
  const r = { x: v.bx + c.x * v.a, y: v.by + c.y * v.a, w: c.w * v.a, h: c.h * v.a };
  ctx.save();
  ctx.globalAlpha = k;
  castShadow(ctx, r, { radius: 10 * v.a, alpha: 0.5 * k, blur: 36 * v.a, dy: 18 * v.a * k });
  ctx.setTransform(v.a, 0, 0, v.a, v.bx, v.by);
  ctx.translate(0, (1 - settle(k, 10)) * 24);
  ctx.fillStyle = C.panel; rrect(ctx, c.x, c.y, c.w, c.h, 10); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, c.x + 1, c.y + 1, c.w - 2, c.h - 2, 9); ctx.stroke();
  ctx.fillStyle = C.accent; ctx.fillRect(c.x + 28, c.y + 34, 6, c.h - 68);
  text(ctx, chip[0], c.x + 56, c.y + 66, { ...font, weight: 500, size: 32 }, { color: C.smuted || C.dim });
  text(ctx, chip[1], c.x + 56, c.y + 150, { ...font, weight: 700, size: 76 }, { color: C.onPaper || C.ink });
  ctx.restore();
};
// the dimension's chip: screen rect r, the label at size (screen px), k its landing (alpha)
export const drawLabelChip = (ctx, r, label, C, f, px, size, k = 1) => {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rrect(ctx, r.x, r.y, r.w, r.h, 8); ctx.fillStyle = C.panel; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.line; ctx.stroke();
  text(ctx, label, r.x + px, r.y + r.h / 2 + 0.36 * size, f, { color: C.onPaper || C.ink });
  ctx.restore();
};

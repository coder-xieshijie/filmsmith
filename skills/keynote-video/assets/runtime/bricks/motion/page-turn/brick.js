// page-turn — the dossier's page turn: the sheet on top rotates away about its top edge (or its left edge) to 89°,
// perspective 2200 px from the hinge, easing in (power 2), drawn in 3 px strips scaled about the hinge's middle, and
// darkens as it tilts (up to 28 % of the mat at edge-on) so the page underneath reads as lit; the page underneath lies
// still, whole, with its edges and its sticker. One beat, ending edge-on on the downbeat at its fastest, as the
// template's turn does: the next state takes over on that frame (brick.json endsMoving, SPEC 3.1).
// From the dossier template's example (the dossier source film changes.js 'turn', device dossier-page-turn):
// the curves and constants the template's. `from` and `to` are exhibit specs (kit.js exhibitSpec); without them two
// placeholder pages.
import { canvasOf, clamp } from '../../../handoffs/util.js';
import { measureCtx, X0, Y0, ground, exhibitSpec, loadImage, sheetOf, restState, paintSheet, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

const F = 2200, STRIP = 3, MG = 64;
const sheetCanvas = (G, img, e, Cc, lang, withEdges) => {
  const c = canvasOf(G.w + 2 * MG, G.h + 90 + 2 * MG), g = c.getContext('2d');
  paintSheet(g, G, img, { ...restState(G, e), edges: withEdges }, MG, MG, Cc, lang);
  return { c, x: X0 - MG, y: Y0 - MG, ox: MG, oy: MG, w: G.w, h: G.h, H: G.h + 90 };
};
const angle = (p) => clamp(p) ** 2 * (89 * Math.PI) / 180;
const travel = (w, h, p, edge) => { const th = angle(p), d = edge === 'left' ? w : h; return d - d * Math.cos(th) * (F / (F + d * Math.sin(th))); };
export default {
  id: 'page-turn', kind: 'motion',
  tier: 'T2', family: 'lift-flip', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  from: 'an exhibit at rest on the mat', to: 'the exhibit that lay underneath, at rest',
  interpolates: ['the sheet\'s angle about its hinge, 0 → 89°, power 2 in', 'per-strip perspective scale F / (F + d sin θ)', 'the shade over the turning sheet, 0 → 28 % of the mat'],
  summary: 'The sheet on top turns away over its top or left edge, darkening as it tilts, onto the page that lay underneath.',
  theory: 'A page change made by handling paper, not by a camera: the next exhibit was under this one all along (object permanence), and the shading of a surface turning from the light reads as depth without a 3D engine.',
  defaults: (ctx = {}) => ({ edge: 'top', from: null, to: { band: PLACEHOLDER.band(2), ex: 2, of: 2 } }),
  async prepare(P) {
    const L = P.lang || 'en', a = exhibitSpec(P.from || {}, L), b = exhibitSpec({ ex: 2, of: 2, ...(P.to || {}) }, L), ctx = measureCtx();
    const Ga = sheetOf(ctx, a, L), Gb = sheetOf(ctx, b, L);
    return { A: sheetCanvas(Ga, await loadImage(a.src), a, P.colors, L, false), B: sheetCanvas(Gb, await loadImage(b.src), b, P.colors, L, true) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) { return { p, th: angle(p) }; },
  paint(ctx, S, P, D) {
    const C = P.colors, to = D.B, from = D.A;
    ground(ctx, C);
    ctx.drawImage(to.c, to.x, to.y);
    if (S.p >= 1) return;   // edge-on: the page underneath takes over
    const s = Math.sin(S.th), c = Math.cos(S.th), w = from.w, h = from.H, x = from.x + from.ox, y = from.y + from.oy, sx = from.ox, sy = from.oy;
    ctx.save(); ctx.fillStyle = C.ground;
    if (P.edge === 'left') {
      const cy = h / 2;
      for (let u = 0; u < w; u += STRIP) {
        const u1 = Math.min(w, u + STRIP), k0 = F / (F + u * s), k1 = F / (F + u1 * s), x0 = u * c * k0, x1 = u1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(from.c, sx + u, sy, u1 - u, h, x + x0, y + cy - cy * k, Math.max(0.5, x1 - x0 + 0.35), h * k);
      }
      const kw = F / (F + w * s);
      ctx.globalAlpha = 0.28 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * c * kw, y + cy - cy * kw); ctx.lineTo(x + w * c * kw, y + cy + cy * kw); ctx.lineTo(x, y + h); ctx.fill();
    } else {
      const cx = w / 2;
      for (let v = 0; v < h; v += STRIP) {
        const v1 = Math.min(h, v + STRIP), k0 = F / (F + v * s), k1 = F / (F + v1 * s), y0 = v * c * k0, y1 = v1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(from.c, sx, sy + v, w, v1 - v, x + cx - cx * k, y + y0, w * k, Math.max(0.5, y1 - y0 + 0.35));
      }
      const kh = F / (F + h * s);
      ctx.globalAlpha = 0.28 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + cx + cx * kh, y + h * c * kh); ctx.lineTo(x + cx - cx * kh, y + h * c * kh); ctx.fill();
    }
    ctx.restore();
  },
  track(S, P, D) { return [[960, travel(D.A.w, D.A.H, Math.min(S.p, 1), P.edge)]]; },
};

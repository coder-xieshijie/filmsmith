// cube-page — a solid becomes an interface: the cube unfolds about its front face into a flat cross (net-unfold's
// geometry), the six squares slide into the six panels of the generated docs page (api-page), the panels fill, the
// second caption rises under the first, and the highlight jumps down the endpoint list to the endpoint the film
// follows, then settles into the ink. The front face keeps the accent until the page fills.
// From the morph template's `unfold` scene (assets/templates/morph/film.js drawUnfold, panelRects; choreo.js unfold):
// the net, the slide (decelerate 0.45 s, 25 ms apart), the fill (0.24 s, 40 ms apart) and the beats are the template's.
import { NET, PANELS, ORDER, PANEL_R, Sd, CAP1, CAP2, SZ, secs, prog, spr, colorsOf, groundOf, loadFonts, cube, caption, productOf, fillShape, strokeShape, clipShape,
  lerp, mix, cubicOut, cubicInOut, decelerate, readTime, clamp } from '../../motion/outline-morph/ink.js';
import { panelContent } from '../../prop/api-page/brick.js';

const DEFAULT = {
  en: { above: 'One spec in.', caption: 'Every doc out.', ref: 'Retrieve an invoice', code: ['python', 'qs.invoices.get(id)'] },
  zh: { above: '一份规格进。', caption: '全部文档出。', ref: '获取一张发票', code: ['python', 'qs.invoices.get(id)'] },
};
const BT = { slide: 1, fillAt: 2, caption: 2.5, jump: 3, settle: 4 };
const timesOf = (bpm) => Object.fromEntries(Object.entries(BT).map(([k, v]) => [k, secs(v, bpm)]));
const rectsAt = (t, T) => Object.fromEntries(ORDER.map((k, i) => {
  const e = decelerate(prog(t, T.slide + i * 0.025, 0.45)), [nx, ny] = NET[k], [px, py, pw, ph] = PANELS[k];
  return [k, [lerp(nx, px, e), lerp(ny, py, e), lerp(Sd, pw, e), lerp(Sd, ph, e), lerp(0, PANEL_R, e)]];
}));

export default {
  id: 'cube-page', kind: 'scene',
  fits: ['demo', 'turn'],
  surface: ['canvas'],
  beats: { min: 5, max: 9 },
  needs: { motions: ['net-unfold'], props: ['api-page'], roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    above: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 4, chars: 15 }, zh: { chars: 7 } } },
    caption: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 15 }, zh: { chars: 7 } } },
    ref: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 12 } } },
    code: { type: 'list', count: [2, 2], of: { type: 'code' } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], corners: 'round' }),
  plan(s, ctx) {
    const read = (readTime(s.caption, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(Math.max(BT.settle + 1, BT.caption + read + 0.75)), 5, 9);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }, { text: s.ref, lang: ctx.lang, tier: 'glance' }],
      cues: [{ beat: 0, kind: 'turn' }, { beat: BT.slide, kind: 'turn' }, { beat: BT.fillAt, kind: 'land' }, { beat: BT.jump, kind: 'accent' }],
      motion: 'cube → net → panels', settled: BT.settle + 0.25, peakAt: BT.slide, pause: beats - BT.settle - 0.25 };
  },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, t = secs(u, c.bpm), T = timesOf(c.bpm), P = productOf(s), K = s.corners;
    groundOf(ctx, s, C);
    if (s.above) caption(ctx, s.above, CAP1, 1, C, L);
    const armK = 1 - cubicOut(prog(t, T.fillAt, 0.2));
    if (t < T.slide) cube(ctx, cubicInOut(prog(t, 0, T.slide)), 1, armK, C);
    else {
      const R = rectsAt(t, T);
      for (const k of ORDER) { fillShape(ctx, R[k], C.paper, K); strokeShape(ctx, R[k], mix(C.ink, C.accent, k === 'F' ? armK : 0), 3 + (k === 'F' ? 2 * armK : 0), K); }
      const sel = spr(t - T.jump, 26), settle = cubicOut(prog(t, T.settle, 0.2));
      ORDER.forEach((k, i) => {
        const kin = cubicOut(prog(t, T.fillAt + i * 0.04, 0.24));
        if (kin <= 0) return;
        ctx.save(); clipShape(ctx, R[k], K); ctx.globalAlpha = kin; ctx.translate(0, 14 * (1 - kin));
        panelContent(ctx, k, R[k], P, C, L, { ref: s.ref, code: s.code, sel, settle, on: t >= T.fillAt ? 1 : 0 });
        ctx.restore();
      });
    }
    caption(ctx, s.caption, CAP2, spr(t - T.caption, 22), C, L);
  },
  track() { return [[1300, 540]]; },
};

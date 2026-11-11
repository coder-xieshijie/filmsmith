// api-page — the generated docs page as one object: six panels on the paper (title bar, endpoint list, the
// reference, a code sample, the response, the SDK chips), outlined in the ink. The highlight in the list sits on the
// endpoint the film follows: in the accent while it is chosen, settled into the ink after. Code, paths and facts are
// the product's and stay Latin; the two labels (ENDPOINTS, SDKs) follow `lang`.
// From the morph template (assets/templates/morph/film.js PANELS, panelContent): the panel places at 1920 × 1080 are
// the template's; here the page is drawn scaled into the prop's box (its native box is 1008 × 888).
import { PANELS, ORDER, PANEL_R, SZ, colorsOf, loadFonts, productOf, endpointLine, metaLine, METHOD, lastSeg, sans, mono, tw, txt, fillShape, strokeShape, clipShape, labelFont, labelText, mix, clamp } from '../../motion/outline-morph/ink.js';

const X0 = 792, Y0 = 96, PW = 1008, PH = 888;
const LABELS = { en: { endpoints: 'Endpoints', sdks: 'SDKs', ref: 'Retrieve an invoice', code: ['python', 'qs.invoices.get(id)'] }, zh: { endpoints: '接口', sdks: 'SDK', ref: '获取一张发票', code: ['python', 'qs.invoices.get(id)'] } };
// the contents of one panel at its place on the 1920 × 1080 frame; sel 0–1 how far the highlight has jumped, settle 0–1
export const panelContent = (ctx, k, R, P, C, lang, { ref, code, sel = 1, settle = 1, on = 1, labels = LABELS[lang === 'zh' ? 'zh' : 'en'] } = {}) => {
  const [x, y, w] = R, S = clamp(P.select ?? 0, 0, P.endpoints.length - 1);
  if (k === 'T') {
    txt(ctx, P.title, x + 28, y + 66, sans(lang, SZ.main, 700), C.ink);
    txt(ctx, P.version, x + 28 + tw(ctx, sans(lang, SZ.main, 700), P.title) + 18, y + 64, mono(SZ.body), C.dim);
    txt(ctx, P.file, x + w - 28, y + 63, mono(SZ.label), C.dim, { align: 'right' });
  } else if (k === 'L') {
    txt(ctx, labelText(labels.endpoints, lang), x + 24, y + 50, labelFont(lang), C.dim);
    const rowY = (i) => y + 76 + i * 92, hy = rowY(0) + (rowY(S) - rowY(0)) * sel;
    if (on) fillShape(ctx, [x + 12, hy, w - 24, 72, 12], mix(C.accent, C.ink, settle));
    P.endpoints.forEach(([m, p], i) => {
      const hit = on ? clamp(1 - Math.abs(hy - rowY(i)) / 92) : 0, onCol = mix(C.onAccent, C.ground, settle);
      txt(ctx, METHOD(m), x + 28, rowY(i) + 46, mono(SZ.label, 600), mix(C.dim, onCol, hit));
      txt(ctx, lastSeg(p), x + 122, rowY(i) + 48, mono(SZ.body), mix(C.ink, onCol, hit));
    });
  } else if (k === 'F') {
    txt(ctx, ref ?? labels.ref, x + 32, y + 72, sans(lang, SZ.main, 700), C.ink);
    txt(ctx, endpointLine(P), x + 32, y + 140, mono(SZ.body), C.ink);
    ctx.fillStyle = C.line; ctx.fillRect(x + 32, y + 172, w - 64, 2);
    const b0 = P.body[0] || ['id', '', 'string'];
    txt(ctx, b0[0], x + 32, y + 236, mono(SZ.body, 600), C.ink);
    txt(ctx, `${b0[2]} · required`, x + 32 + tw(ctx, mono(SZ.body, 600), b0[0]) + 24, y + 236, mono(SZ.label), C.dim);
  } else if (k === 'Bo') {
    const [lg, line] = code || labels.code;
    txt(ctx, lg, x + 28, y + 48, mono(SZ.label), C.dim);
    txt(ctx, line, x + 28, y + 118, mono(SZ.body), C.ink);
  } else if (k === 'R') {
    const st = String(P.call.status);
    txt(ctx, st, x + 28, y + 76, mono(SZ.main, 600), C.ink);
    txt(ctx, metaLine(P), x + 28 + tw(ctx, mono(SZ.main, 600), st) + 20, y + 75, mono(SZ.body), C.dim);
  } else if (k === 'K') {
    txt(ctx, labels.sdks, x + 28, y + 55, mono(SZ.label, 600, lang), C.dim);
    let cx = x + 128;
    P.sdks.forEach((s) => { const cw = tw(ctx, mono(SZ.label), s) + 36; strokeShape(ctx, [cx, y + 18, cw, 52, 26], C.ink, 2); txt(ctx, s, cx + cw / 2, y + 54, mono(SZ.label), C.ink, { align: 'center' }); cx += cw + 14; });
  }
};

export default {
  id: 'api-page', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [504, 444], M: [756, 666], L: [1008, 888] },
  states: { empty: { fill: 0, sel: 0, settle: 0 }, chosen: { fill: 1, sel: 1, settle: 0 }, settled: { fill: 1, sel: 1, settle: 1 } },
  parts: ['T', 'L', 'F', 'Bo', 'R', 'K'],
  swap: { product: { type: 'facts' }, ref: { type: 'text', limits: { en: { words: 4, chars: 24 }, zh: { chars: 12 } } }, code: { type: 'code' } },
  roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ground: true, corners: 'round', ...(ctx.lang === 'zh' ? { ref: LABELS.zh.ref } : {}) }),
  async prepare(P) { await loadFonts(P.lang || 'en'); },
  draw(ctx, st, P) {
    const C = colorsOf(P), lang = P.lang || 'en', PR = productOf(P), k = P.w / PW;
    if (P.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(-P.w, -P.h, P.w * 3, P.h * 3); }
    ctx.save(); ctx.scale(k, P.h / PH); ctx.translate(-X0, -Y0);
    for (const key of ORDER) {
      const R = [...PANELS[key], PANEL_R];
      fillShape(ctx, R, C.paper, P.corners); strokeShape(ctx, R, C.ink, 3, P.corners);
      if (st.fill <= 0) continue;
      ctx.save(); clipShape(ctx, R, P.corners); ctx.globalAlpha = st.fill;
      panelContent(ctx, key, R, PR, C, lang, { ref: P.ref, code: P.code, sel: st.sel, settle: st.settle });
      ctx.restore();
    }
    ctx.restore();
  },
};

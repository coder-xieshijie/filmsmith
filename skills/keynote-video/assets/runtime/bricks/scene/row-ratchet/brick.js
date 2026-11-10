// row-ratchet — a list on the page read row by row: the sheet reels onto a heading (1.5 beats, momentum k 6.5), which
// pins at the top as the chapter; from beat 2.5 its rows dock under the tab one a beat, each detent an expo-out half
// beat, the docked row marked in the margin by a 6 px accent bar, the rows still to come veiled 34 % in the ground; a
// slot on the pinned tab names the docked row (49 px), the names rolling vertically with each step.
// From the scroll template (the source film plan.js reel1, RATCHET0 22.5, RATCHET_STEP 1,
// RATCHET_MOVE 0.5; film.js offsetAt, ratchet, slot): the slot sits after the heading's own glyphs, found by scanning
// the tab's pixels for its ink as the template does.
import { canvasOf, measure, text, rgba } from '../../../handoffs/util.js';
import { SX, SW, TOP, H, secs, pIn, lerp, momentum, expOut, cubicOut, cubicInOut, loadSheet, drawSheet, minimap, offsetOf, grain, clamp, F } from '../../look/reading-sheet/kit.js';

const DEFAULT = { en: { names: [] }, zh: { names: [] } };
export const R0 = 2.5, MOVE = 0.5;
export const slotGeometry = (G, head) => {
  const h = G.S.heads[head], w = G.S.w, hh = Math.max(1, Math.round(h.iy1 - h.iy0)), c = canvasOf(w, hh), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(G.img, G.S.x0, h.iy0, w, hh, 0, 0, w, hh);
  let d; try { d = g.getImageData(0, 0, w, hh).data; } catch (e) { return { x: w * 0.3 * G.K, base: hh * 0.75 * G.K }; }
  let right = 0, base = 0;
  for (let y = 0; y < hh - 14; y++) for (let x = 0; x < w * 0.6; x++) { const i = (y * w + x) * 4; if (d[i + 3] > 128 && d[i] < 110 && d[i + 1] < 110 && d[i + 2] < 110) { right = Math.max(right, x); base = Math.max(base, y); } }
  return { x: (right + 1) * G.K, base: (base + 1) * G.K };
};
// the slot: '·' and the docked row's name, rolling vertically (names: [[text, offset in line heights]])
export const drawSlot = (ctx, ty, tabH, geo, names, C, lang) => {
  const x = SX + geo.x + 26, base = ty + geo.base + 1, f = F('display', lang, 49, 600);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 4, ty + 2, SW - (x - SX), tabH - 4); ctx.clip();
  text(ctx, '·', x, base, { ...f, weight: 500 }, { color: C.paperMuted });
  const nx = x + measure(ctx, '· ', { ...f, weight: 500 }).width;
  for (const [s, d] of names) text(ctx, s, nx, base + d * 49 * 1.3, f, { color: C.onPaper });
  ctx.restore();
};
export default {
  id: 'row-ratchet', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 5, max: 16 },
  needs: { motions: ['scroll-reel', 'section-lock'], props: ['sheet-minimap'], roles: ['ground', 'paper', 'onPaper', 'paperMuted', 'accent', 'line'], type: ['display'] },
  slots: { names: { type: 'list', count: [0, 12], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 12 }, zh: { chars: 5 } } } }, sheet: { type: 'object', optional: true } },
  roles: ['ground', 'paper', 'onPaper', 'paperMuted', 'accent', 'line'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], head: 1, from: 'top', rows: null, open: 0, seed: 11 }),
  plan(s, ctx) {
    const n = s.rows ?? 6;
    return { beats: clamp(Math.ceil(R0 + n - 0.5), 5, 16), reads: (s.names || []).map((x) => ({ text: x, lang: ctx.lang, tier: 'glance' })), cues: [{ beat: 0, kind: 'turn' }, { beat: 1.5, kind: 'land' }, ...Array.from({ length: n }, (_, k) => ({ beat: R0 + k, kind: 'tick' }))], motion: 'ratchet', settled: 1.5, peakAt: R0, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const G = await loadSheet(s.sheet, c.lang), L = G.layout(s.open || 0), n = s.rows ?? Math.min(G.S.rows.length, 12);
    const names = (s.names && s.names.length ? s.names : G.S.rows.map((r) => r.label)).slice(0, n);
    const rows = G.S.rows.slice(0, n).map((r, k) => ({ off: offsetOf(G, L, { row: k, head: s.head }), h: r.ih * G.K }));
    const tabH = G.heads(L)[s.head].h;
    return { G, n, names, rows, tabH, o0: offsetOf(G, L, s.from), o1: offsetOf(G, L, { head: s.head }), geo: slotGeometry(G, s.head) };
  },
  paint(ctx, b, s, c, D) {
    const C = s.colors, Lg = c.lang, G = D.G, land = (k) => R0 + k;
    let off = b < 1.5 ? lerp(D.o0, D.o1, momentum(pIn(b, [0, 1.5]))) : D.o1, k = -1;
    for (let i = 0; i < D.n; i++) { const a = land(i) - MOVE; if (b >= a) { k = i; off = lerp(i ? D.rows[i - 1].off : D.o1, D.rows[i].off, expOut(pIn(b, [a, land(i)]))); } }
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    grain(ctx, s.seed || 1, C);
    drawSheet(ctx, G, off, b, C, Lg, { open: s.open || 0,
      after: (g) => {
        if (k < 0) return;
        const u = expOut(pIn(b, [land(k) - MOVE, land(k)])), hRow = lerp(k > 0 ? D.rows[k - 1].h : D.rows[0].h, D.rows[k].h, u), y = TOP + D.tabH, fade = cubicOut(pIn(b, [R0 - MOVE, R0]));
        g.save(); g.globalAlpha = fade; g.fillStyle = rgba(C.ground, 0.34); g.fillRect(SX, y + hRow, SW, H - y - hRow);
        g.fillStyle = C.accent; g.fillRect(SX + 8, y + 6, 6, hRow - 12); g.restore();
      },
      slot: (g, i, ty) => {
        if (i !== s.head || k < 0) return;
        const u = expOut(pIn(b, [land(k) - MOVE, land(k)])), names = [];
        if (k > 0) names.push([D.names[k - 1], -u]);
        names.push([D.names[k], 1 - u]);
        drawSlot(g, ty, D.tabH, D.geo, names, C, Lg);
      } });
    if (s.minimap !== false) minimap(ctx, G, off, C, { open: s.open || 0 });
  },
  track(u) { return [[300, 300]]; },
  blur() { return false; },
};

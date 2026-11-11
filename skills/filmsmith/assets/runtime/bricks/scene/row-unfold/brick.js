// row-unfold — the climax of a scroll film: the sheet moves to a row of the page (1 beat, momentum k 6), the ratchet's
// mark fades, and the row opens in place (2 beats, cubic in-out): the page below slides down and a dark panel is
// revealed from the fold line, carrying what the row describes (a film's own frames, 1:1, from half a beat in; when
// they run out the last stays), its source label on the right of the caption strip; on beat 5 the claim rises into
// the caption strip at 49 px. The minimap grows with the page.
// From the scroll template (the source film plan.js reelUp, unMark, unfold, play, caption;
// film.js panel, PANEL 792 / 88 / 1216 × 684): runtime unfold's opening (cubic in-out, revealed from the fold).
import { text, rgba } from '../../../handoffs/util.js';
import { SX, SW, TOP, H, PANEL, secs, pIn, lerp, momentum, expOut, cubicOut, cubicInOut, loadSheet, drawSheet, minimap, offsetOf, grain, clamp, F, placeholderFrame } from '../../look/reading-sheet/kit.js';
import { slotGeometry, drawSlot } from '../row-ratchet/brick.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { claim: 'Measured on a real scene.', label: 'city-4k · 0.6 s' }, zh: { claim: '在真实场景上测得。', label: 'city-4k · 0.6 秒' } };
export default {
  id: 'row-unfold', kind: 'scene',
  fits: ['climax', 'demo'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { motions: ['unfold', 'scroll-reel'], props: ['sheet-minimap'], roles: ['ground', 'panel', 'onPanel', 'dim', 'accent', 'paper', 'onPaper', 'line'], type: ['display', 'mono'] },
  slots: {
    claim: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } } },
    label: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 30 }, zh: { chars: 30 } } },
    frames: { type: 'object', optional: true }, sheet: { type: 'object', optional: true },
  },
  roles: ['ground', 'panel', 'onPanel', 'dim', 'accent', 'paper', 'onPaper', 'line'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], row: 1, from: null, head: 1, slotFrom: null, frames: null, seed: 11 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, need = 5 + readTime(s.claim, ctx.lang) / B;
    return { beats: clamp(Math.ceil(need + 0.5), 6, 12), reads: [{ text: s.claim, lang: ctx.lang }], cues: [{ beat: 0, kind: 'turn' }, { beat: 3, kind: 'land' }, { beat: 5, kind: 'claim' }], motion: 'unfold', settled: 3, peakAt: 5, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const G = await loadSheet(s.sheet, c.lang), L = G.layout(0), B = 60 / c.bpm;
    const fr = s.frames, imgs = [];
    if (fr?.src) for (let i = 0; i < fr.count; i++) { const im = new Image(); im.src = fr.src.replace('{n}', String(i + 1).padStart(3, '0')); await im.decode(); imgs.push(im); }
    const last = G.S.rows.length - 1, fromRow = s.from ?? { row: Math.min(last, 5), head: s.head }, fr0 = fromRow.row ?? Math.min(last, 5);
    return { G, B, imgs, n: fr?.count || 24, fps: fr?.fps || 15, o0: offsetOf(G, L, fromRow), o1: offsetOf(G, L, { row: s.row, head: s.head }), tabH: G.heads(L)[s.head].h, geo: slotGeometry(G, s.head), rowH0: G.S.rows[fr0].ih * G.K, rowH1: G.S.rows[s.row].ih * G.K, lastName: s.slotFrom ?? G.S.rows[fr0].label, name: G.S.rows[s.row].label };
  },
  paint(ctx, b, s, c, D) {
    const C = s.colors, Lg = c.lang, G = D.G, open = cubicInOut(pIn(b, [1, 3]));
    const off = lerp(D.o0, D.o1, momentum(pIn(b, [0, 1]), 6));
    const panel = (g, y) => {
      g.fillStyle = C.panel; g.fillRect(SX, y, SW, PANEL.h);
      const fx = SX + (SW - PANEL.fw) / 2, fy = y + PANEL.cap, f = clamp(Math.floor((b - 1.5) * D.B * D.fps + 1e-6), 0, D.n - 1);
      if (D.imgs.length) g.drawImage(D.imgs[f], fx, fy, PANEL.fw, PANEL.fh); else placeholderFrame(g, fx, fy, PANEL.fw, PANEL.fh, f, D.n, C);
      if (s.label) text(g, s.label, fx + PANEL.fw, y + 58, F('mono', Lg, 25, 500), { color: C.dim, align: 'right' });
      if (b >= 5) { g.save(); g.beginPath(); g.rect(fx, y + 6, PANEL.fw * 0.75, PANEL.cap - 8); g.clip(); const u = expOut(clamp((b - 5) / 0.5)); text(g, s.claim, fx, y + 64 + (1 - u) * 32, F('display', Lg, 49, 600), { color: C.onPanel }); g.restore(); }
    };
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    grain(ctx, s.seed || 1, C);
    drawSheet(ctx, G, off, b, C, Lg, { open, panel,
      after: (g) => { const fade = 1 - cubicInOut(pIn(b, [0, 0.5])); if (fade <= 0) return; const u = expOut(pIn(b, [0, 1])), hRow = lerp(D.rowH0, D.rowH1, u), y = TOP + D.tabH; g.save(); g.globalAlpha = fade; g.fillStyle = rgba(C.ground, 0.34); g.fillRect(SX, y + hRow, SW, H - y - hRow); g.fillStyle = C.accent; g.fillRect(SX + 8, y + 6, 6, hRow - 12); g.restore(); },
      slot: (g, i, ty) => { if (i !== s.head) return; const u = expOut(pIn(b, [0, 1])); drawSlot(g, ty, D.tabH, D.geo, [[D.lastName, -u], [D.name, 1 - u]], C, Lg); } });
    if (s.minimap !== false) minimap(ctx, G, off, C, { open, panel });
  },
  track(u) { return [[960, 600]]; },
  blur() { return false; },
};

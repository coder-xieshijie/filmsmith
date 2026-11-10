// roll-lockup — the end of a scroll film: the sheet flings back to its top (2 beats, fling k 12: it peaks a sixth in
// and brakes softly; the tabs unpin in reverse); the hook band's lines rise out and the name rises in at 134 px; the
// underline draws under the page's own title; the address types under the name in DM Mono 35; then the paper roll comes
// back up from below and winds the sheet onto itself, landing just under the band on a downbeat (1.5 beats, k 5),
// four beats before the end.
// From the scroll template (the source film plan.js fling, name, under5, url, rollup; film.js
// band Q1, rollAt).
import { text } from '../../../handoffs/util.js';
import { H, SX, TOP, OFF0, ROLL_OUT, R_ROLL, secs, pIn, lerp, momentum, fling, loadSheet, drawSheet, underline, drawOf, minimap, offsetOf, grain, clamp, F, slotLine, graphemes, roll } from '../../look/reading-sheet/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { name: 'tidewell', url: 'github.com/acme/tidewell' }, zh: { name: 'tidewell', url: 'github.com/acme/tidewell' } };
export default {
  id: 'roll-lockup', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 10, max: 16 },
  needs: { motions: ['scroll-fling', 'roll', 'section-lock'], props: ['quote-band', 'sheet-minimap'], roles: ['ground', 'paper', 'onPaper', 'paperMuted', 'accent', 'roll'], type: ['display', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
    url: { type: 'code', tier: 'primary', limits: { en: { chars: 40 }, zh: { chars: 40 } } },
    sheet: { type: 'object', optional: true },
  },
  roles: ['ground', 'paper', 'onPaper', 'paperMuted', 'accent', 'roll', 'rollHi', 'rollShade', 'rollEdge'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], band: 'Q1', from: { piece: 'C4' }, mark: 'title', open: 0, seed: 11 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, need = 5 + Math.max(3 / B, readTime(s.name, ctx.lang) / B);
    const beats = clamp(Math.ceil((need + 4) / 4) * 4, 10, 16);
    return { beats, reads: [{ text: s.name, lang: ctx.lang }, { text: s.url, lang: 'en' }], cues: [{ beat: 0, kind: 'turn' }, { beat: 2, kind: 'land' }, { beat: beats - 4, kind: 'end' }], motion: 'fling, roll-up', settled: 2, peakAt: 2.75, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const G = await loadSheet(s.sheet, c.lang), L = G.layout(s.open || 0), beats = this.plan(s, c).beats, L0 = G.layout(0);
    return { G, beats, o0: offsetOf(G, L, s.from), up: [beats - 5.5, beats - 4], target: TOP + L0[s.band].y + L0[s.band].h - OFF0 + R_ROLL * 0.2 + 2 };
  },
  paint(ctx, b, s, c, D) {
    const C = s.colors, Lg = c.lang, G = D.G, open = b < 1 ? (s.open || 0) : 0;
    const off = lerp(D.o0, OFF0, fling(pIn(b, [0, 2])));
    const ry = b >= D.up[0] ? lerp(ROLL_OUT, D.target, momentum(pIn(b, D.up), 5)) : null;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    grain(ctx, s.seed || 1, C);
    const anims = { [s.band]: { replaceAt: 2.5, custom: (g, y, h, x, bb) => {
      const f = { ...F('display', Lg, 96, 700) }, bl = [132, 244];
      (G.S.pieces.find((p) => p.id === s.band)?.lines || []).forEach((ln, k) => slotLine(g, ln.join(Lg === 'zh' ? '' : ' '), x, y + bl[k], f, C.onPaper, bb, -1e9, 2.5));
      slotLine(g, s.name, x, y + 168, F('display', Lg, 134, 700), C.onPaper, bb, 2.75);
      if (bb >= 3.5) { const gs = graphemes(s.url), n = Math.max(1, Math.round(clamp((bb - 3.5) / 1.5) * gs.length)); text(g, gs.slice(0, n).join(''), x + 4, y + 250, F('mono', 'en', 35, 500), { color: C.paperMuted }); }
    } } };
    drawSheet(ctx, G, off, b, C, Lg, { open, anims, clipBottom: ry == null ? H : ry - R_ROLL * 0.2, after: (g, Ly) => underline(g, G, G.S.marks[s.mark], off, Ly, drawOf(b, [3, 3.5]), C) });
    if (s.minimap !== false) minimap(ctx, G, off, C, { open });
    if (ry != null) roll(ctx, ry, C);
  },
  track(u) { return [[700, 300]]; },
  blur() { return false; },
};

// anchor-ask — the question asked one word per beat at a fixed anchor (left edge 160, baseline 660): each word opens
// on its own ground through an aperture from its optical middle (a band, bars closing, or a circle), the grounds walking
// one hue's lightness ramp (mid, black, light, deep; a word ending in "?" on the tinted white), while the word's machine
// form types into the query line under it. The film's first word, and the first after an invert, slams in (scale and
// blur settle in 0.2 s about the anchor). From the pulse template's `ask` (assets/templates/pulse/choreo.js askPlan,
// film.js paintAsk): timings, ground walk and type are the template's; the aperture shapes are aperture-swap's, drawn
// here as a clip so the brick is pure Canvas2D.
// Chinese (adapted): no condensed black exists, so a word is set in Noto Sans SC 900 as 长体 (0.84 wide) at the same
// 364 px and floor 233, which keeps a four- or five-character word on the anchor at full size; one 词 a beat.
import { clamp, canvasOf } from '../../../handoffs/util.js';
import { readTime, units } from '../../lang.js';
import { SZ, T, X0, ANCHOR_Y, MAXW, F, draw, widthOf, fitSize, opticalMiddle, groundHex, onGround, fillGround, aperture, drawQuery, popAt, secs, grain } from '../../look/query-ramp/kit.js';

const CYCLE = ['r2', 'r0', 'r3', 'r1'];
const SHAPES = { cut: ['band', 'close'], round: ['circle'] };
const WORD = { text: { type: 'text', tier: 'word', limits: { en: { words: 3, chars: 14 }, zh: { chars: 5 } } },
  param: { type: 'code', tier: 'glance', optional: true, limits: { en: { chars: 34 }, zh: { chars: 34 } } } };
const DEFAULT = {
  en: { words: [{ text: 'which', param: '$ tidewell bench' }, { text: 'build', param: '--builds 2.1,2.2,2.3' }, { text: 'renders', param: '--scene city-4k' }, { text: 'under 1 s?', param: '--max 1s' }] },
  zh: { words: [{ text: '哪个', param: '$ tidewell bench' }, { text: '版本', param: '--builds 2.1,2.2,2.3' }, { text: '1 秒内', param: '--max 1s' }, { text: '渲完？', param: '--scene city-4k' }] },
};
const wordOf = (w) => (typeof w === 'string' ? { text: w, param: null } : { text: w.text, param: w.param ?? null });

// states in seconds from the scene start: land, hold beats, ground, aperture shape, query fragment start
const statesOf = (s, ctx) => {
  const B = 60 / ctx.bpm, L = ctx.lang, off = s.first ? B : 0, ws = (s.words || []).map(wordOf);
  const out = [];
  let t = off, cyc = 0, prev = s.prevGround || null;
  ws.forEach((w, k) => {
    const n = Math.max(1, units(w.text, L)), read = L === 'zh' ? readTime(w.text, 'zh') - 0.5 : n * 0.3;
    const beats = Math.max(1, Math.ceil(read / B - 1e-9)), last = k === ws.length - 1;
    const paramAt = s.first && k === 0 ? 0 : beats >= 3 ? t + B : last && w.param ? t + B / 2 : t;
    let g;
    if (/[?？]\s*$/.test(w.text)) g = 'white';
    else if (k === 0 && s.first) g = 'r0';
    else if (k === 0 && s.invert) g = 'white';
    else { do { g = CYCLE[cyc % 4]; cyc++; } while (g === prev || ((prev === 'white' || prev === 'r3') && g === 'r3')); }
    const ap = k === 0 ? null : g === 'white' ? 'invert' : SHAPES[s.form === 'round' ? 'round' : 'cut'][(k - 1) % SHAPES[s.form === 'round' ? 'round' : 'cut'].length];
    out.push({ k, land: t, beats, text: w.text, param: w.param, read, paramAt, typed: w.param ? paramAt + w.param.length * T.typeSec : null, ground: g, ap, slam: (s.first && k === 0) || g === 'white' && (ap === 'invert' || k === 0) });
    prev = g; t += beats * B;
  });
  return out;
};

export default {
  id: 'anchor-ask', kind: 'scene',
  fits: ['hook', 'problem', 'turn'],
  surface: ['canvas'],
  beats: { min: 2, max: 12 },
  needs: { motions: [], props: ['query-line'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'r0', 'r1', 'r2', 'r3', 'white'], type: ['display', 'mono'] },
  slots: {
    words: { type: 'list', count: [2, 6], of: WORD },
    queryBase: { type: 'code', tier: 'glance', optional: true, limits: { en: { chars: 48 }, zh: { chars: 48 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'r0', 'r1', 'r2', 'r3', 'white'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], first: true, invert: false, form: 'cut', queryBase: '', seed: 20261019 }),
  plan(s, ctx) {
    const st = statesOf(s, ctx), B = 60 / ctx.bpm, last = st.at(-1);
    const end = last ? Math.max(last.land + last.read, last.typed != null ? last.typed + 1 : 0, last.land + last.beats * B) : B;
    const beats = clamp(Math.ceil(end / B - 1e-9), 2, 12);
    return { beats, reads: st.map((x) => ({ text: x.text, lang: ctx.lang, tier: 'word' })), cues: st.map((x) => ({ beat: x.land / B, kind: x.slam ? 'hit' : 'land' })),
      motion: 'aperture per word', settled: last ? last.land / B + 0.4 : 0, peakAt: s.first ? 1 : 0, pause: 0, lead: 0 };
  },
  validate(s, ctx) {
    const n = (s.words || []).length, e = [];
    if (n < 2 || n > 6) e.push('words: 2–6');
    for (const w of (s.words || []).map(wordOf)) if (units(w.text, ctx.lang) > 5) e.push(`"${w.text}": a state carries at most 5 words`);
    return e;
  },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang;
    const st = statesOf(s, c);
    const sizes = st.map((x) => fitSize(cv, x.text, 'display', L, SZ.word, SZ.wordMin));
    const widths = st.map((x, k) => widthOf(cv, x.text, F('display', L, sizes[k]), L));
    const B = 60 / c.bpm, last = st.at(-1), sceneEnd = this.plan(s, c).beats * B;
    const pops = last && sceneEnd - last.land > 2 * B ? [last.land + Math.floor((sceneEnd - last.land) / B / 2) * B] : [];
    return { st, sizes, widths, pops };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), L = c.lang, C = s.colors, st = D.st;
    let k = -1; st.forEach((x, j) => { if (t >= x.land - 1e-9) k = j; });
    const query = (tt) => {
      let q = s.queryBase || '';
      for (const x of st) if (x.param && tt >= x.paramAt) { const n = Math.min(x.param.length, Math.floor((tt - x.paramAt) / T.typeSec)); if (n > 0) q += (q ? ' ' : '') + x.param.slice(0, n); }
      return q;
    };
    const state = (g, j) => {
      const x = st[j], gr = x ? x.ground : st[0]?.ground ?? 'r0', col = onGround(C, gr);
      fillGround(g, groundHex(C, gr));
      if (x) {
        const size = D.sizes[j], f = F('display', L, size);
        if (x.slam) { const q = clamp((t - x.land) / 0.2), d = Math.pow(1 - q, 2.2) * (s.first && j === 0 ? 1 : 0.6); draw(g, x.text, X0, ANCHOR_Y, f, col.text, L, { k: 1 + 0.1 * d, blur: 10 * d }); }
        else draw(g, x.text, X0, ANCHOR_Y, f, col.text, L, { k: j === st.length - 1 ? popAt(D.pops, t) : 1 });
      }
      drawQuery(g, query(t), col.quiet, L);
      grain(g, (s.seed || 1) + j, 0.05);
    };
    const x = st[k];
    if (k > 0 && x.ap && x.ap !== 'invert' && t < x.land + T.apSec) {
      state(ctx, k - 1);
      ctx.save(); aperture(ctx, x.ap, (t - x.land) / T.apSec, [X0 + D.widths[k] / 2, opticalMiddle(D.sizes[k], L)]); state(ctx, k); ctx.restore();
    } else state(ctx, k);
  },
  track(u, s, c, D) { const t = secs(u, c.bpm); let k = 0; D.st.forEach((x, j) => { if (t >= x.land) k = j; }); return [[X0 + D.widths[k] / 2, opticalMiddle(D.sizes[k], c.lang)]]; },
  blur() { return false; },
};

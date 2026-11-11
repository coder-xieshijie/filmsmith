// screen-change — the screen's state changes while the device stays: `move: 'feed'` (the usual change of surface) the
// next capture rises from below the screen on a landing spring like the next post of a vertical feed, the current one
// steps back a level (5 % smaller, 34 px up, veiled to 40 %), window-less, the chin changing half way; `scroll` the
// same page is flicked to another stop at its own width (scroll-reel: a ramp, a release, a coast to an exact stop, a
// little pull-back while fast); `flip` the whole device turns edge-on about its vertical axis and the screen and the
// chin change on that frame (device-flip, once a film at most). Then the copy group lands and the region is ringed.
// From the handset template's `feed`, `scroll` and `flip` (assets/templates/handset/choreo.js TYPES, moves.js
// adapters over the runtime hand-offs feed-stack, scroll-reel and device-flip): timings are the template's.
import { clamp } from '../../../handoffs/util.js';
import { viewOf, asView, drawCapture, paintLit, paintFrame, paintDevice, prepareScene, group, needBeats, timed, blockLevel, litAt, levelOf, scrollAt, feedCards, paintCard, paintFlip, trackFlip, faceCanvases, boxOf, ground, trackView, MOVE_BEATS, FLIP_SWAP } from '../../prop/device-shell/device.js';
import { paintNotes } from '../../prop/margin-notes/notes.js';
import { grain } from '../../look/device-margin/texture.js';

const LIM = { value: { en: { words: 2, chars: 10 }, zh: { chars: 5 } }, line: { en: { words: 4, chars: 18 }, zh: { chars: 14 } }, note: { en: { words: 6, chars: 40 }, zh: { chars: 22 } } };
const DEFAULT = {
  en: { value: 'Any team', note: 'from the pricing page', line: 'one plan for all' },
  zh: { value: '任何团队', note: '出自价格页', line: '一个方案通用' },
};
const timeline = (s, ctx) => {
  const M = MOVE_BEATS[s.move] ?? 1, g = group(M, s, { ring: !!s.region });
  const need = needBeats(g.items, g.last, ctx.bpm, ctx.lang, 0.45);
  return { M, g, beats: Math.min(12, Math.max(M + 2, Math.ceil(Math.max(need, s.beats || 0) - 1e-9))) };
};

export default {
  id: 'screen-change', kind: 'scene',
  fits: ['demo', 'turn', 'proof'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: ['feed-stack', 'scroll-reel', 'device-flip'], props: ['device-shell', 'margin-notes', 'region-light'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    value: { type: 'text', tier: 'primary', limits: LIM.value },
    line: { type: 'text', tier: 'primary', limits: LIM.line },
    note: { type: 'text', tier: 'glance', optional: true, limits: LIM.note },
    screen: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'muted', 'glass'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], device: 'laptop', move: 'feed', screen: null, from: null, region: 'r1', zoom: 'rest', view: null, variant: 'right', veil: 0.52, grain: 0.04, seed: 3, leave: true, chin: 'pricing.example.dev', kind: 'page' }),
  plan(s, ctx) {
    const T = timeline(s, ctx);
    return { beats: T.beats, reads: T.g.items.filter((i) => i.role !== 'note').map((i) => ({ text: i.text, lang: ctx.lang })), cues: [{ beat: 0, kind: 'turn' }, { beat: T.M, kind: 'land' }, ...(T.g.ringAt ? [{ beat: T.g.ringAt, kind: 'accent' }] : [])], motion: s.move, settled: T.M, peakAt: null, pause: 0 };
  },
  validate(s) { return ['feed', 'scroll', 'flip'].includes(s.move) ? [] : [`move ${s.move}: feed, scroll or flip`]; },
  async prepare(s, ctx) {
    const T = timeline(s, ctx);
    if (s.move === 'scroll' && !s.from?.screen) s = { ...s, from: { ...(s.from || {}), screen: s.screen, kind: s.kind } };
    const D = await prepareScene(s, ctx, timed(T.g.items, T.beats, 60 / ctx.bpm, s.leave === false));
    D.T = T;
    const spec = (x) => (!x || x === 'rest' ? 'rest' : x), from = s.from || {};
    D.v0 = asView(viewOf(D.A0, spec(from.view), D.D));
    D.v1 = asView(viewOf(D.A, s.view ? spec(s.view) : s.region ? { region: s.region, zoom: s.zoom ?? 'rest', anchor: 'top' } : 'rest', D.D));
    D.fromRegion = from.region || null;
    D.level = s.region ? blockLevel(levelOf(D.A, D.v1, D.D, s.region)) : 410;
    if (s.move === 'flip') D.faces = faceCanvases(D.D);
    return D;
  },
  paint(g, u, s, c, Dd) {
    const C = s.colors, B = 60 / c.bpm, t = u * B, T = Dd.T, p = clamp(t / (T.M * B)), chinOf = (A, k) => A.chin || (k ? s.from?.chin : s.chin);
    const lit = litAt(t, s.region, T.M * B, T.g.ringAt != null ? T.g.ringAt * B : null);
    const fromLit = Dd.fromRegion && t < 0.15 ? { alpha: 1 - t / 0.15, region: Dd.fromRegion, ring: 1, ringAlpha: 1 - t / 0.15 } : null;
    if (s.move === 'flip' && p > 0 && p < 1) {
      // both faces of the whole device at rest (the old state with its chin, the new one with its own), turned
      const B0 = boxOf(Dd.D);
      Dd.faces.forEach((cv, k) => {
        const q = cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, B0.w, B0.h); q.translate(-B0.x, -B0.y);
        const A = k ? Dd.A : Dd.A0, v = k ? Dd.v1 : Dd.v0;
        paintDevice(q, Dd.D, C, { lang: c.lang, chin: chinOf(A, !k), screen: (z) => drawCapture(z, A, v, Dd.D) });
      });
      ground(g, C);
      paintFlip(g, p, Dd.faces, Dd.D, C, s.variant);
      paintNotes(g, Dd.Lay, t, Dd.level, Dd.D.copy.x, s.copyW || Dd.D.copy.w, C);
      if (Dd.tile) grain(g, Dd.tile, s.grain);
      return;
    }
    const moving = p > 0 && p < 1;
    const v = s.move === 'scroll' && moving ? scrollAt(Dd.v0, Dd.v1, Dd.A, Dd.D, p) : p <= 0 ? Dd.v0 : Dd.v1;
    const A = p <= 0 ? Dd.A0 : Dd.A;
    paintFrame(g, s, C, Dd, {
      t, by: Dd.level, lang: c.lang, chin: s.move === 'feed' && moving ? chinOf(p < 0.5 ? Dd.A0 : Dd.A, p < 0.5) : chinOf(A, p <= 0),
      screenFn: (q) => {
        if (s.move === 'feed' && moving) {
          const cd = feedCards(p, Dd.D);
          paintCard(q, Dd.A0, Dd.v0, Dd.D, C, cd.back, cd.back.dim);
          if (cd.u > 0) paintCard(q, Dd.A, Dd.v1, Dd.D, C, cd.front, 0);
          return;
        }
        drawCapture(q, A, v, Dd.D);
        if (fromLit && p <= 0.01) paintLit(q, Dd.A0, Dd.v0, Dd.D, C, fromLit, s.veil);
        if (lit) paintLit(q, Dd.A, v, Dd.D, C, lit, s.veil);
      },
      tickAt: lit && lit.ring > 0 ? { A: Dd.A, v: Dd.v1, region: s.region, alpha: clamp(lit.ring * 3) } : null,
    });
  },
  track(u, s, c, Dd) {
    const B = 60 / c.bpm, p = clamp((u * B) / (Dd.T.M * B));
    if (s.move === 'flip') return p > 0 && p < 1 ? trackFlip(p, Dd.faces, Dd.D, s.colors, s.variant) : [[960, 540]];
    if (s.move === 'feed') { const cd = feedCards(p, Dd.D), S = Dd.D.screen; return [[S.x + cd.back.x, S.y + cd.back.y], [S.x + cd.front.x, S.y + cd.front.y], [S.x + cd.front.x + cd.front.w, S.y + cd.front.y + cd.front.h]]; }
    return trackView(p > 0 && p < 1 ? scrollAt(Dd.v0, Dd.v1, Dd.A, Dd.D, p) : p <= 0 ? Dd.v0 : Dd.v1, Dd.v1, Dd.D);
  },
};

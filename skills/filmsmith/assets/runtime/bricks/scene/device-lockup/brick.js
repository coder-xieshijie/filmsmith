// device-lockup — the close: the screen goes back to the product's own surface at rest (a pull back on the same
// capture, a feed, or the film's one flip), the whole screen recedes under the veil behind the margin, and the margin
// gives the mark, the name, the line and the address (held at least 3 s); on the last bar's downbeat the region is lit
// and ringed once more (the second move).
// From the handset template's `lockup` (assets/templates/handset/choreo.js TYPES.lockup; film.js light `all`).
import { clamp } from '../../../handoffs/util.js';
import { viewOf, asView, drawCapture, paintLit, paintFrame, paintDevice, prepareScene, needBeats, timed, litAt, pushAt, feedCards, paintCard, paintFlip, trackFlip, faceCanvases, boxOf, ground, trackView, MOVE_BEATS } from '../../prop/device-shell/device.js';
import { paintNotes } from '../../prop/margin-notes/notes.js';
import { grain } from '../../look/device-margin/texture.js';

const LIM = { name: { en: { words: 2, chars: 10 }, zh: { chars: 5 } }, line: { en: { words: 4, chars: 18 }, zh: { chars: 14 } }, url: { en: { words: 1, chars: 30 }, zh: { chars: 15 } } };
const DEFAULT = {
  en: { name: 'Northwind', line: 'out today', url: 'northwind.dev/download' },
  zh: { name: 'Northwind', line: '今天发布', url: 'northwind.dev/download' },
};
const timeline = (s, ctx) => {
  const via = s.entry || 'push', L = MOVE_BEATS[via] ?? 1, B = 60 / ctx.bpm, items = [];
  if (s.mark) items.push({ role: 'mark', in: L });
  items.push({ role: 'display', text: s.name, in: L });
  if (s.line) items.push({ role: 'line', text: s.line, in: L + 1 });
  const urlAt = L + 2;
  if (s.url) items.push({ role: 'url', text: s.url, in: urlAt });
  const bar = 4, need = Math.max(needBeats(items, urlAt, ctx.bpm, ctx.lang, 0.45), urlAt + 3.2 / B + bar);
  const beats = Math.min(24, Math.max(8, Math.ceil(Math.max(need, s.beats || 0) - 1e-9)));
  const second = Math.max(urlAt + 1.5 / B, beats - bar);
  return { via, L, items, urlAt, beats, second };
};

export default {
  id: 'device-lockup', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 24 },
  needs: { motions: ['viewport-push', 'feed-stack', 'device-flip'], props: ['device-shell', 'margin-notes', 'region-light'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: LIM.name },
    line: { type: 'text', tier: 'primary', limits: LIM.line },
    url: { type: 'text', tier: 'glance', limits: LIM.url },
    mark: { type: 'image', optional: true },
    screen: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'muted', 'glass'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], device: 'laptop', entry: 'push', screen: null, from: null, region: 'title', mark: null, view: 'rest', variant: 'right', veil: 0.52, grain: 0.04, seed: 3, chin: 'northwind.dev/download' }),
  plan(s, ctx) {
    const T = timeline(s, ctx);
    return { beats: T.beats, reads: T.items.filter((i) => i.text && i.role !== 'url').map((i) => ({ text: i.text, lang: ctx.lang })), cues: [{ beat: 0, kind: T.via === 'push' ? 'land' : 'turn' }, { beat: T.L, kind: 'land' }, { beat: T.second, kind: 'end' }], motion: T.via, settled: T.L, peakAt: T.L, pause: T.beats - T.urlAt - 1 };
  },
  validate(s) { return s.name ? [] : ['name']; },
  async prepare(s, ctx) {
    const T = timeline(s, ctx);
    const items = timed(T.items, T.beats, 60 / ctx.bpm, true);
    const D = await prepareScene(s, ctx, items);
    D.T = T;
    const from = s.from || {};
    D.v0 = asView(viewOf(D.A0, !from.view || from.view === 'rest' ? 'rest' : from.view, D.D));
    D.v1 = asView(viewOf(D.A, !s.view || s.view === 'rest' ? 'rest' : s.view, D.D));
    D.fromRegion = from.region || null;
    if (T.via === 'flip') D.faces = faceCanvases(D.D);
    return D;
  },
  paint(g, u, s, c, Dd) {
    const C = s.colors, B = 60 / c.bpm, t = u * B, T = Dd.T, p = clamp(t / (T.L * B)), moving = p > 0 && p < 1, level = 420;
    const chin0 = Dd.A0.chin || s.from?.chin, chin1 = Dd.A.chin || s.chin;
    if (T.via === 'flip' && moving) {
      const B0 = boxOf(Dd.D);
      Dd.faces.forEach((cv, k) => {
        const q = cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, B0.w, B0.h); q.translate(-B0.x, -B0.y);
        paintDevice(q, Dd.D, C, { lang: c.lang, chin: k ? chin1 : chin0, screen: (z) => drawCapture(z, k ? Dd.A : Dd.A0, k ? Dd.v1 : Dd.v0, Dd.D) });
      });
      ground(g, C); paintFlip(g, p, Dd.faces, Dd.D, C, s.variant);
      paintNotes(g, Dd.Lay, t, level, Dd.D.copy.x, s.copyW || Dd.D.copy.w, C);
      if (Dd.tile) grain(g, Dd.tile, s.grain);
      return;
    }
    const v = T.via === 'push' ? (p <= 0 ? Dd.v0 : pushAt(Dd.v0, Dd.v1, p)) : p <= 0 ? Dd.v0 : Dd.v1;
    const A = T.via === 'push' ? Dd.A : p <= 0 ? Dd.A0 : Dd.A;
    // the light: the previous region fades in 0.15 s; the whole screen veils from the landing over 0.3 s; the second
    // move opens the region's hole in the veiled screen and rings it
    const fade = Dd.fromRegion && t < 0.15 ? { alpha: 1 - t / 0.15, region: Dd.fromRegion, ring: 1, ringAlpha: 1 - t / 0.15 } : null;
    const all = t >= T.L * B ? { alpha: clamp((t - T.L * B) / 0.3), region: null } : null;
    const second = s.region ? litAt(t, s.region, T.second * B, T.second * B) : null;
    if (second) { second.holeFill = 1 - second.alpha; second.alpha = 1; }
    paintFrame(g, s, C, Dd, {
      t, by: level, lang: c.lang, chin: T.via === 'feed' && moving ? (p < 0.5 ? chin0 : chin1) : p <= 0 ? chin0 : chin1,
      screenFn: (q) => {
        if (T.via === 'feed' && moving) { const cd = feedCards(p, Dd.D); paintCard(q, Dd.A0, Dd.v0, Dd.D, C, cd.back, cd.back.dim); if (cd.u > 0) paintCard(q, Dd.A, Dd.v1, Dd.D, C, cd.front, 0); return; }
        drawCapture(q, A, v, Dd.D);
        if (fade && p <= 0.01) paintLit(q, Dd.A0, Dd.v0, Dd.D, C, fade, s.veil);
        if (second) paintLit(q, Dd.A, v, Dd.D, C, second, s.veil); else if (all) paintLit(q, Dd.A, v, Dd.D, C, all, s.veil);
      },
      tickAt: second && second.ring > 0 ? { A: Dd.A, v, region: s.region, alpha: clamp(second.ring * 3) } : null,
    });
  },
  track(u, s, c, Dd) {
    const B = 60 / c.bpm, p = clamp((u * B) / (Dd.T.L * B));
    if (Dd.T.via === 'flip') return p > 0 && p < 1 ? trackFlip(p, Dd.faces, Dd.D, s.colors, s.variant) : [[960, 540]];
    if (Dd.T.via === 'feed') { const cd = feedCards(p, Dd.D), S = Dd.D.screen; return [[S.x + cd.front.x, S.y + cd.front.y], [S.x + cd.back.x, S.y + cd.back.y]]; }
    return trackView(p <= 0 ? Dd.v0 : pushAt(Dd.v0, Dd.v1, p), Dd.v1, Dd.D);
  },
};

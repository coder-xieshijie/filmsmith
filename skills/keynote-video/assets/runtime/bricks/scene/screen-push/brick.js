// screen-push — the screen moves to the region in play while the device holds still: one zoom about the point the two
// views share (viewport-push, log scale, the move in 0.8 of its beat), never past the zoom cap; the light (a veil with
// the region's hole) comes on 0.4 beat in, the value lands with the push, the note and the line a beat later, the ring
// closes round the evidence a beat after that and the level tick marks its height; the margin rides level with it.
// `entry: 'cut'`: a hard cut on the beat to another capture of the same screen, registered on the region, so only what
// changed changes (the light stays). `claim: true`: the climax — the region lit and the lead line read first, the push
// lands on the bar line `pre` beats in with the value, the line follows and is read in a pause. `release: 'rest'` (or a
// view): a beat after the ring closes the light goes out and the screen pushes back to that view, the copy held (the
// context round a readout, as film-v2 does after its cut at 7.5 s).
// From the handset template's `push`, `cut` and `claim` (assets/templates/handset/choreo.js TYPES, film.js camera
// and light; moves.js viewport-push): timings are the template's.
import { clamp } from '../../../handoffs/util.js';
import { zoomBetween } from '../../../handoffs/asset.js';
import { viewOf, asView, registered, drawCapture, paintLit, paintFrame, prepareScene, group, needBeats, timed, blockLevel, litAt, levelOf, pushAt, trackView } from '../../prop/device-shell/device.js';

const LIM = { value: { en: { words: 2, chars: 10 }, zh: { chars: 5 } }, line: { en: { words: 4, chars: 18 }, zh: { chars: 14 } }, note: { en: { words: 6, chars: 40 }, zh: { chars: 22 } }, lead: { en: { words: 4, chars: 20 }, zh: { chars: 14 } } };
const DEFAULT = {
  en: { value: '42%', line: 'faster builds', note: 'measured on the release build', lead: 'every build measured' },
  zh: { value: '42%', line: '构建更快', note: '在正式版上实测', lead: '每次构建都有实测' },
};
const timeline = (s, ctx) => {
  if (s.claim) {
    const P = Math.max(4, Math.min(7, s.pre ?? 4)), items = [];
    if (s.lead) items.push({ role: 'line', text: s.lead, in: 1, out: P - 1 });
    const noteAt = P >= 6 ? 3 : 1;
    if (s.note) items.push({ role: 'note', text: s.note, in: noteAt, out: P - 1 });
    items.push({ role: 'display', text: s.value, in: P, claim: true });
    if (s.line) items.push({ role: 'line', text: s.line, in: P + 1 });
    const ringAt = P >= 6 ? 5 : P, lastIn = s.line ? P + 1 : P;
    const need = needBeats(items.filter((i) => i.in >= P), lastIn, ctx.bpm, ctx.lang, 0.4) + (s.pause ?? 2);
    const beats = Math.min(14, Math.max(5, Math.ceil(Math.max(need, s.beats || 0) - 1e-9)));
    return { items, ringAt, on: 0, push: [P - 1, P], beats, land: P, claim: true };
  }
  const cut = s.entry === 'cut', L = cut ? 0 : 1, g = group(L, s, { ring: s.ring !== false && !!s.region });
  const need = needBeats(g.items, g.last, ctx.bpm, ctx.lang, 0.45);
  const beats = Math.min(12, Math.max(3, Math.ceil(Math.max(need, s.beats || 0) - 1e-9)));
  const rel = s.release ? [(g.ringAt ?? g.last) + 0.2, (g.ringAt ?? g.last) + 1] : null;
  const beats1 = rel ? Math.max(beats, Math.ceil(rel[1]) + 1) : beats;
  return { items: g.items, ringAt: g.ringAt, on: cut ? 0 : 0.4, push: cut ? null : [0, 1], beats: Math.min(12, beats1), land: L, cut, rel };
};

export default {
  id: 'screen-push', kind: 'scene',
  fits: ['demo', 'proof', 'climax'],
  surface: ['canvas'],
  beats: { min: 3, max: 14 },
  needs: { motions: ['viewport-push', 'level-rail'], props: ['device-shell', 'margin-notes', 'region-light'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    value: { type: 'text', tier: 'primary', claim: true, limits: LIM.value },
    line: { type: 'text', tier: 'primary', limits: LIM.line },
    note: { type: 'text', tier: 'glance', optional: true, limits: LIM.note },
    lead: { type: 'text', tier: 'primary', optional: true, limits: LIM.lead },
    screen: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'muted', 'glass'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], device: 'laptop', screen: null, from: null, region: 'r2', zoom: 1.3, view: null, entry: 'push', claim: false, pre: 4, release: null, veil: 0.52, grain: 0.04, seed: 3, leave: true }),
  plan(s, ctx) {
    const T = timeline(s, ctx);
    const reads = T.items.filter((i) => i.role !== 'note').map((i) => ({ text: i.text, lang: ctx.lang }));
    return { beats: T.beats, reads, cues: [{ beat: T.land, kind: T.claim ? 'claim' : T.cut ? 'accent' : 'land' }, ...(T.ringAt != null ? [{ beat: T.ringAt, kind: 'accent' }] : [])], motion: T.cut ? 'in-frame cut' : 'viewport-push', settled: T.land, peakAt: T.claim ? T.land : null, pause: T.claim ? T.beats - T.land - 1 : 0 };
  },
  validate(s) { const e = []; if (s.claim && !s.value) e.push('claim: a value'); if (s.entry === 'cut' && !s.from?.screen) e.push('cut: from.screen, the capture cut from'); return e; },
  async prepare(s, ctx) {
    const T = timeline(s, ctx);
    const D = await prepareScene(s, ctx, timed(T.items, T.beats, 60 / ctx.bpm, s.leave === false));
    D.T = T;
    const spec = (x) => (!x || x === 'rest' ? 'rest' : x);
    const from = s.from || {};
    const v0 = viewOf(D.A0, spec(from.view), D.D);
    const v1 = s.view ? viewOf(D.A, spec(s.view), D.D) : T.cut && s.region ? registered(v0, D.A0, D.A, s.region) : viewOf(D.A, s.region ? { region: s.region, zoom: s.zoom ?? 'rest' } : 'rest', D.D);
    D.v0 = asView(v0); D.v1 = asView(v1);
    D.fromRegion = from.region || null;
    if (T.rel) D.v2 = asView(viewOf(D.A, spec(s.release), D.D));
    D.level = s.region ? blockLevel(levelOf(D.A, D.v1, D.D, s.region)) : 410;
    return D;
  },
  // the mapping of the screen at time t (s)
  viewAt(t, B, T, Dd) {
    if (T.rel && t > T.rel[0] * B) return pushAt(Dd.v1, Dd.v2, clamp((t - T.rel[0] * B) / ((T.rel[1] - T.rel[0]) * B)));
    if (!T.push) return Dd.v1; const p = clamp((t - T.push[0] * B) / ((T.push[1] - T.push[0]) * B)); return p <= 0 ? Dd.v0 : pushAt(Dd.v0, Dd.v1, p); },
  paint(g, u, s, c, Dd) {
    const C = s.colors, B = 60 / c.bpm, t = u * B, T = Dd.T;
    const v = this.viewAt(t, B, T, Dd), A = T.cut || t >= (T.push ? T.push[0] * B : 0) ? Dd.A : Dd.A0;
    // the light: the previous region fades in 0.15 s, the new one comes on at `on`; a cut or a claim keeps it on
    let lit = litAt(t, s.region, T.on * B, T.ringAt != null ? T.ringAt * B : null);
    if (T.cut && lit) lit.alpha = 1;
    if (T.rel && lit) { const a = 1 - clamp((t - T.rel[0] * B) / 0.15); if (a <= 0) lit = null; else { lit.alpha *= a; lit.ringAlpha = a; } }
    if (!lit && Dd.fromRegion && !T.claim) { const a = 1 - clamp(t / 0.15); if (a > 0) lit = { alpha: a, region: Dd.fromRegion, ring: 1, ringAlpha: a, band: null, src: 'from' }; }
    if (T.claim && lit && Dd.fromRegion === s.region) lit.alpha = 1;
    const shown = lit?.src === 'from' ? Dd.A0 : A;
    paintFrame(g, s, C, Dd, {
      t, by: Dd.level, lang: c.lang, chin: A.chin || (A === Dd.A ? s.chin : s.from?.chin),
      screenFn: (q) => { drawCapture(q, A, v, Dd.D); if (lit) paintLit(q, shown, v, Dd.D, C, lit, s.veil); },
      tickAt: lit && lit.ring > 0 && lit.src !== 'from' ? { A, v, region: s.region, alpha: clamp(lit.ring * 3) * (lit.ringAlpha ?? 1) } : null,
    });
  },
  track(u, s, c, Dd) { const B = 60 / c.bpm, t = u * B; return trackView(this.viewAt(t, B, Dd.T, Dd), Dd.T.rel && t > Dd.T.rel[0] * B ? Dd.v2 : Dd.v1, Dd.D); },
};

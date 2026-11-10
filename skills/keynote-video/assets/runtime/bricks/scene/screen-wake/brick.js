// screen-wake — the opening of a film told on one device: the device's 2 px edge draws out from the camera dot both
// ways, the lid fills in, on beat 1 the screen comes up from the glass on the first real capture (monotonic, no
// overshoot), the product's name lands in the margin on beat 2, the note and the line a beat later; the region named
// (if any) is lit and ringed; the chin shows where the screen's state comes from once the copy is in.
// From the handset template's `wake` (assets/templates/handset/choreo.js TYPES.wake, film.js paintDevice and the
// backlight): timings are the template's; `edges: 'cut'` starts on the lit device, the name lands on beat 1.
import { clamp } from '../../../handoffs/util.js';
import { viewOf, asView, drawCapture, paintLit, paintFrame, prepareScene, group, needBeats, timed, blockLevel, litAt, levelOf, tones } from '../../prop/device-shell/device.js';

const LIM = { value: { en: { words: 2, chars: 10 }, zh: { chars: 5 } }, line: { en: { words: 4, chars: 18 }, zh: { chars: 14 } }, note: { en: { words: 6, chars: 40 }, zh: { chars: 22 } } };
const DEFAULT = {
  en: { value: 'Northwind', note: 'its own release notes', line: 'a code editor', chin: 'northwind.dev/releases' },
  zh: { value: 'Northwind', note: '它自己的发布说明', line: '一个代码编辑器', chin: 'northwind.dev/releases' },
};
const timeline = (s, ctx) => {
  const cut = s.edges === 'cut', L = cut ? 1 : 2;
  const g = group(L, s, { ring: !!s.region });
  const chinAt = g.last + 1;
  const need = needBeats(g.items, chinAt, ctx.bpm, ctx.lang, 0.5);
  const beats = Math.min(12, Math.max(4, Math.ceil(Math.max(need, s.beats || 0) - 1e-9)));
  return { cut, L, g, chinAt, beats };
};

export default {
  id: 'screen-wake', kind: 'scene',
  fits: ['hook'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: [], props: ['device-shell', 'margin-notes', 'region-light'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    value: { type: 'text', tier: 'primary', limits: LIM.value },
    line: { type: 'text', tier: 'primary', limits: LIM.line },
    note: { type: 'text', tier: 'glance', optional: true, limits: LIM.note },
    chin: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 44 }, zh: { chars: 22 } } },
    screen: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'muted', 'glass'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], device: 'laptop', screen: null, view: 'rest', region: null, edges: 'wake', veil: 0.52, grain: 0.04, seed: 3, leave: true }),
  plan(s, ctx) {
    const { cut, L, g, chinAt, beats } = timeline(s, ctx);
    return { beats, reads: g.items.filter((i) => i.role !== 'note').map((i) => ({ text: i.text, lang: ctx.lang })), cues: [{ beat: cut ? L : 1, kind: 'accent' }, ...(g.ringAt ? [{ beat: g.ringAt, kind: 'accent' }] : [])], motion: 'screen wake', settled: chinAt, peakAt: cut ? L : 1, pause: beats - chinAt };
  },
  validate(s) { return s.region && !(s.screen?.regions?.[s.region] || ['title', 'r1', 'r2', 'r3', 'r4'].includes(s.region)) ? [`region ${s.region}: not in the capture`] : []; },
  async prepare(s, ctx) {
    const T = timeline(s, ctx);
    const D = await prepareScene(s, ctx, timed(T.g.items, T.beats, 60 / ctx.bpm, s.leave === false));
    D.T = T; D.v = asView(viewOf(D.A, s.view === 'rest' || !s.view ? 'rest' : s.view, D.D));
    D.level = s.region ? blockLevel(levelOf(D.A, D.v, D.D, s.region)) : 410;
    return D;
  },
  paint(g, u, s, c, Dd) {
    const C = s.colors, B = 60 / c.bpm, t = u * B, T = Dd.T, cut = T.cut;
    const lit = litAt(t, s.region, T.L * B, T.g.ringAt != null ? T.g.ringAt * B : null);
    paintFrame(g, s, C, Dd, {
      edge: cut ? 1 : clamp(t / 0.45), fill: cut ? 1 : clamp(t / 0.3), t, by: Dd.level, lang: c.lang,
      chin: Dd.A.chin || s.chin, chinAlpha: clamp((t - T.chinAt * B) / 0.3),
      screenFn: (q) => {
        drawCapture(q, Dd.A, Dd.v, Dd.D);
        const on = cut ? 1 : clamp((t - B) / 0.3);
        if (on < 1) { q.fillStyle = tones(C).glass; q.globalAlpha = 1 - on; q.fillRect(0, 0, Dd.D.screen.w, Dd.D.screen.h); q.globalAlpha = 1; }
        paintLit(q, Dd.A, Dd.v, Dd.D, C, lit, s.veil);
      },
      tickAt: lit && lit.ring > 0 ? { A: Dd.A, v: Dd.v, region: s.region, alpha: clamp(lit.ring * 3) } : null,
    });
  },
  track() { return [[960, 540]]; },
  blur() { return false; },
};

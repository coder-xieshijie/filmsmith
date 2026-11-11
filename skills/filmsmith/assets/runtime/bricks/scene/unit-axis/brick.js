// unit-axis — overlapping groups as bars: the subset's own squares shrink to a few px and stack into the vertical
// axis, the other squares drop 40 px and fade, then one bar per series grows out of that axis (quint-out, half a beat
// apart), its value counting with it; the protagonist's bar in the accent pulses, the rest dim a little. Use it where
// squares cannot carry the chart (one item can be in several series): they become its axis instead.
// From the tally template's `axis` scene (assets/templates/tally/layouts.js axis): geometry, growth and the drop.
import { text } from '../../../handoffs/util.js';
import { quintOut } from '../../../motion.js';
import { F, MX, TOP, setup, paintGround, drawUnits, digits, enter, pulse, label, labelFont, readTime, title, clamp, smooth, TIME } from '../../motion/unit-flight/units.js';

const SERIES = { name: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } }, count: { type: 'number' } };
const GROUP = { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, count: { type: 'number' } };
const DEFAULT = {
  en: { title: 'Most named a *code renderer*.', sub: 'Tools named · one render can name several', callout: '← the surprise', foot: '238 shipped renders that named their tools',
        series: [{ name: 'Code renderer', count: 141 }, { name: 'Image model', count: 96 }, { name: 'Video model', count: 58 }, { name: 'Screen capture', count: 33 }],
        groups: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }] },
  zh: { title: '最多人用的是*代码渲染*。', sub: '提到的工具 · 一次可提到多个', callout: '← 意外之处', foot: '238 次已发布渲染提到了工具',
        series: [{ name: '代码渲染', count: 141 }, { name: '图像模型', count: 96 }, { name: '视频模型', count: 58 }, { name: '录屏', count: 33 }],
        groups: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }] },
};
const timesOf = (s, ctx) => {
  const n = (s.series || []).length || 1, land = 1 + TIME.depart + TIME.flight, grow = (i) => Math.ceil(land) + i * 0.5, growDur = 2;
  const reveal = Math.ceil(grow(n - 1) + growDur), read = ((readTime(s.title, ctx.lang) + readTime(s.callout || '', ctx.lang)) * ctx.bpm) / 60;
  return { n, land, grow, growDur, reveal, beats: clamp(Math.ceil(reveal + Math.max(1.25, read * 0.5) + 0.75), 6, 14) };
};

export default {
  id: 'unit-axis', kind: 'scene',
  fits: ['climax', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 14 },
  needs: { motions: ['unit-flight'], props: ['chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } },
    sub: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } },
    callout: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 20 }, zh: { chars: 8 } } },
    foot: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 8, chars: 56 }, zh: { chars: 22 } } },
    series: { type: 'list', count: [2, 8], of: SERIES },
    groups: { type: 'list', count: [1, 9], of: GROUP },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], within: 0, hero: 0, from: 'grid', mark: 'square', seed: 3 }),
  plan(s, ctx) {
    const T = timesOf(s, ctx);
    return { beats: T.beats, reads: [{ text: s.title, lang: ctx.lang }], cues: [{ beat: 1, kind: 'turn' }, ...Array.from({ length: T.n }, (_, i) => ({ beat: T.grow(i) + T.growDur * 0.6, kind: 'land' })), { beat: T.reveal, kind: 'accent' }],
      motion: 'subset into the axis, bars grow', settled: T.reveal, peakAt: T.reveal, pause: T.beats - T.reveal };
  },
  validate(s) { return (s.series || []).length >= 2 ? [] : ['series: at least two bars']; },
  async prepare(s, c) {
    const D = await setup(s, c, 'axis');
    D.T = timesOf(s, c);
    const sorted = [...(s.series || [])].map((x, i) => ({ ...x, i })).sort((a, b) => b.count - a.count);
    D.series = sorted;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, T = D.T, G = D.B.geo;
    paintGround(ctx, s, D);
    drawUnits(ctx, u, D.I, D.A, D.B, D.S, C, s.mark);
    title(ctx, s, u, s, L, bpm, { t0: 0.25 });
    const lf = labelFont(L), vf = F('text', L, 28, 700), h = G.band * 0.56, maxN = Math.max(1, ...D.series.map((x) => x.count));
    const scale = Math.min(1000, 1824 - G.axisX - 320) / maxN, dim = 1 - 0.45 * smooth((u - T.reveal) / 0.8);
    D.series.forEach((sr, i) => {
      const y = TOP + i * G.band, t0 = T.grow(i), g = quintOut((u - t0) / T.growDur), hero = sr.i === s.hero;
      const [la] = enter(u, t0 - 0.3, bpm, 0);
      text(ctx, String(sr.name), G.axisX - 26, y + h / 2 + 1, lf, { color: hero ? C.ink : C.dim, align: 'right', baseline: 'middle', alpha: la });
      if (g <= 0) return;
      const len = Math.max(4, sr.count * scale) * g;
      ctx.save(); ctx.globalAlpha = hero ? 1 : 0.88 * dim; ctx.fillStyle = hero ? C.accent : C.base || C.ink;
      ctx.beginPath(); ctx.roundRect(G.axisX + G.sz / 2 + 2, y, len, h, [0, 4, 4, 0]); ctx.fill(); ctx.restore();
      const sc = hero ? 1 + 0.35 * pulse(u, T.reveal, bpm, 0.3) : 1;
      ctx.save(); ctx.translate(G.axisX + G.sz / 2 + 2 + len + 18, y + h / 2); ctx.scale(sc, sc);
      const w = digits(ctx, sr.count * g, 0, 10, vf, hero ? C.accent : C.ink, { alpha: clamp((u - t0) / 0.4) });
      ctx.restore();
      if (hero && s.callout) { const [ca] = enter(u, T.reveal + 0.25, bpm, 0); text(ctx, label(s.callout, L), G.axisX + G.sz / 2 + 2 + len + 18 + w + 28, y + h / 2 + 9, lf, { color: C.accent, alpha: ca }); }
    });
    if (s.foot) { const [fa, fdy] = enter(u, T.reveal + 0.75, bpm, 10); text(ctx, label(s.foot, L), MX, TOP + D.series.length * G.band + 44 + fdy, lf, { color: C.dim, alpha: fa }); }
  },
  track(u, s, c, D) { return [[D.B.geo.axisX, 330]]; },
  blur() { return false; },
};

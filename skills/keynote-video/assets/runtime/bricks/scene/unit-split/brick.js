// unit-split — the same grid re-sorted: the matches light up where they stand, then fly back into the grid first, in
// the accent, while one big accent number counts them; the caption with the share enters only once the count has
// landed; the complement is a label-size line, never a second big number. Labels name the two parts of the grid.
// From the tally template's `split` scene (assets/templates/tally/layouts.js split; counter 2 beats landing with a
// × 1.08 pulse): geometry and rules are the template's.
import { text } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { F, MX, TOP, setup, paintGround, drawUnits, digits, enter, pulse, label, labelFont, lines, readTime, title, clamp, TIME } from '../../motion/unit-flight/units.js';

const GROUP = { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, count: { type: 'number' } };
const DEFAULT = {
  en: { title: 'Still being argued: *drafts*.', sub: 'Status draft · not yet decided', caption: 'still drafts (16%)', other: 'decided or closed', labelIn: 'Draft · 92', labelOut: 'Everything else · 482',
        groups: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }] },
  zh: { title: '还在争论的：*草稿*。', sub: '状态为草稿 · 尚未定论', caption: '仍是草稿（16%）', other: '已定或已关闭', labelIn: '草稿 · 92', labelOut: '其余 · 482',
        groups: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }] },
};
const timesOf = (s, ctx) => {
  const land = 1 + TIME.group + TIME.depart + TIME.flight, c0 = 1 + TIME.flight * 0.5, reveal = Math.ceil(c0 + 2);
  const read = ((readTime(s.title, ctx.lang) + readTime(s.caption, ctx.lang)) * ctx.bpm) / 60;
  return { land, c0, reveal, beats: clamp(Math.ceil(Math.max(land, reveal) + Math.max(1.5, read * 0.6) + 0.75), 6, 12) };
};

export default {
  id: 'unit-split', kind: 'scene',
  fits: ['turn', 'proof', 'demo'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { motions: ['unit-flight'], props: ['unit-mark', 'chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base', 'rest'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } },
    sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 30 }, zh: { chars: 12 } } },
    other: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 30 }, zh: { chars: 12 } } },
    labelIn: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    labelOut: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 28 }, zh: { chars: 10 } } },
    groups: { type: 'list', count: [2, 9], of: GROUP },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base', 'rest'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], by: 2, from: 'grid', mark: 'square', seed: 3 }),
  plan(s, ctx) {
    const T = timesOf(s, ctx);
    return { beats: T.beats, reads: [{ text: s.title, lang: ctx.lang }, { text: s.caption, lang: ctx.lang }], cues: [{ beat: 0, kind: 'accent' }, { beat: 1, kind: 'turn' }, { beat: T.reveal, kind: 'land' }],
      motion: 'mark then fly into the sorted grid', settled: T.land, peakAt: T.reveal, pause: T.beats - T.reveal };
  },
  validate(s) { return s.by >= 0 && s.by < (s.groups || []).length ? [] : ['by: the index of the group to sort first']; },
  async prepare(s, c) { const D = await setup(s, c, 'sorted'); D.T = timesOf(s, c); return D; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, T = D.T, G = D.B.geo, g = G.G;
    paintGround(ctx, s, D);
    drawUnits(ctx, u, D.I, D.A, D.B, D.S, C, s.mark);
    title(ctx, s, u, s, L, bpm, { t0: 0.25 });
    const [ba] = enter(u, T.c0 - 0.05, bpm, 0), sc = 1 + 0.08 * pulse(u, T.reveal, bpm, 0.3);
    ctx.save(); ctx.translate(MX, TOP + 172); ctx.scale(sc, sc);
    digits(ctx, G.nIn * expOut((u - T.c0) / (T.reveal - T.c0)), 0, 0, F('display', L, 200, 800), C.accent, { alpha: ba });
    ctx.restore();
    const cf = F('text', L, 40, 600, 'display'), ls = lines(ctx, s.caption, cf, 760, L), [ca, cdy] = enter(u, T.reveal + 0.25, bpm, 12);
    ls.forEach((ln, i) => text(ctx, ln, MX + 6, TOP + 240 + i * 48 + cdy, cf, { color: C.ink, alpha: ca }));
    const lf = labelFont(L);
    if (s.other) { const [oa] = enter(u, T.reveal + 1, bpm, 0); text(ctx, label(`${G.nOut} ${s.other}`, L), MX + 6, TOP + 240 + ls.length * 48 + 34, lf, { color: C.dim, alpha: oa }); }
    if (s.labelIn) { const [la] = enter(u, T.land - 0.5, bpm, 0); text(ctx, label(s.labelIn, L), g.x0, g.y0 - 20, lf, { color: C.accent, alpha: la }); }
    if (s.labelOut) { const [la] = enter(u, T.land, bpm, 0); text(ctx, label(s.labelOut, L), g.x0, g.y0 + g.rows * g.p + 34, lf, { color: C.dim, alpha: la }); }
  },
  track(u, s, c, D) { return [[D.B.L.x[0], D.B.L.y[0]]]; },
  blur() { return false; },
};

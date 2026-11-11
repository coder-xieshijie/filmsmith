// unit-count — the opening of a count: one big number counts up to the size of the set while one square per item
// appears in a wave in data order (the right-hand grid); a caption names the set, a capital mono note says what one
// square is. The squares stay on screen for every later chapter (unit-bands, unit-split, … start from this grid).
// From the tally template's `count` scene (assets/templates/tally/layouts.js count, squares.js wave, timeline.js):
// geometry, the wave (2.05 beats, each square 0.7 beat cubic-out from 30 %) and the expo-out counter are the template's.
import { text } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { F, MX, TOP, setup, paintGround, drawUnits, digits, enter, label, labelFont, lines, readTime, title, clamp } from '../../motion/unit-flight/units.js';

const GROUP = { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, count: { type: 'number' } };
const DEFAULT = {
  en: { caption: 'Renders in the archive', note: 'One square per render, by date', groups: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }] },
  zh: { caption: '档案里的全部渲染', note: '一格一次渲染，按日期排', groups: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }] },
};

export default {
  id: 'unit-count', kind: 'scene',
  fits: ['hook', 'problem'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: ['unit-flight'], props: ['unit-mark', 'chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 34 }, zh: { chars: 14 } } },
    note: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
    title: { type: 'text', tier: 'primary', claim: true, optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } },
    groups: { type: 'list', count: [1, 9], of: GROUP },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], mark: 'square', seed: 3, title: '' }),
  // the counter runs 3 beats from 0.25; the caption enters at 1.5 and is read; then a hold of a beat
  plan(s, ctx) {
    const read = (readTime(s.caption, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(1.5 + Math.max(1.75, read) + 1), 4, 10);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }], cues: [{ beat: 0.25, kind: 'accent' }, { beat: 3.25, kind: 'land' }], motion: 'wave entrance', settled: 3.25, peakAt: 3.25, pause: beats - 3.25 };
  },
  validate(s) { return (s.groups || []).length ? [] : ['groups: at least one']; },
  prepare(s, c) { return setup(s, c, 'grid', { from: null }); },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, n = D.I.N;
    paintGround(ctx, s, D);
    drawUnits(ctx, u, D.I, null, D.B, D.S, C, s.mark);
    // the number: 300 px, fitted down to keep it left of the grid; it reads the frame time, not the sub-frames
    let size = 300; const f = (z) => F('display', L, z, 800);
    while (size > 120 && digits(ctx, n, -1e5, -1e5, f(size), C.ink) > 860) size -= 4;
    const [na] = enter(u, 0.15, bpm, 0);
    digits(ctx, n * expOut((u - 0.25) / 3), MX - size * 0.03, TOP + size * 0.86, f(size), C.ink, { alpha: na });
    const cf = F('text', L, 40, 600, 'display'), cy = TOP + size * 0.86 + 74;
    const ls = lines(ctx, s.caption, cf, 720, L);
    const [ca, cdy] = enter(u, 1.5, bpm, 16);
    ls.forEach((ln, i) => text(ctx, ln, MX + 8, cy + i * 48 + cdy, cf, { color: C.ink, alpha: ca }));
    if (s.note) { const [oa] = enter(u, 2.5, bpm, 0); text(ctx, label(s.note, L), MX + 8, cy + ls.length * 48 + 34, labelFont(L), { color: C.dim, alpha: oa }); }
    title(ctx, s, u, s, L, bpm, { t0: 0.25 });
  },
  track(u, s, c, D) { const k = Math.min(D.I.N - 1, Math.floor(clamp(u / 2.05) * D.I.N)); return [[D.B.L.x[k], D.B.L.y[k]]]; },
  blur() { return false; },
};

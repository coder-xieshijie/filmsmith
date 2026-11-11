// quad-montage — the frame cut hard into a 2 × 2 grid, four bricks running side by side, each started a few frames off
// the others so that something moves every few frames but never two heavy beats at once; then all four hold on their
// end states, one poster of four.
// Adapted from video-shotcraft demos/rhythm/quad-split-parallel-scenes/QuadSplitParallelScenes.tsx (card
// references/shots/rhythm/quad-split-parallel-scenes.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion): the four hand-made micro-scenes (a browser, a
// terminal push, three slammed words, an approval chain) become four `brick` slots, any canvas motion or scene of the
// library, each drawn into its cell with its own start frame (the staggered timetable is now a list of start frames);
// the quads' light / dark / accent checkerboard is a role remap per cell (`tone`); brand, demo copy and the fixed
// ember colours removed; the 8 px seams, the 20 px corners, the corner labels and the end hold (28 frames) are the
// upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor, caseOf } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { createBrick } from '../../index.js';

const G = 8, QW = (1920 - 3 * G) / 2, QH = (1080 - 3 * G) / 2, R = 20, HOLD = 28;
const CELLS = [[G, G], [2 * G + QW, G], [G, 2 * G + QH], [2 * G + QW, 2 * G + QH]];
const lum = (hex) => { const v = parseInt(hex.slice(1, 7), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };
// a cell's roles: the look as it is, its panel, or inverted (ink as the ground), or the accent as the ground
const toneOf = (c, tone) => {
  if (tone === 'panel') return { ...c, ground: c.panel, panel: mix(c.panel, c.ground, 0.6) };
  if (tone === 'ink') return { ...c, ground: c.ink, panel: mix(c.ink, c.ground, 0.12), ink: c.ground, dim: mix(c.ground, c.ink, 0.45), line: mix(c.ink, c.ground, 0.25), paper: c.ground, onPaper: c.ink };
  if (tone === 'accent') { const on = c.onAccent || (lum(c.accent) > 0.5 ? c.ink : c.ground); return { ...c, ground: c.accent, panel: mix(c.accent, on, 0.12), ink: on, dim: mix(on, c.accent, 0.35), line: mix(on, c.accent, 0.6), accent: on, onAccent: c.accent }; }
  return c;
};
const QUAD = {
  brick: { type: 'brick', optional: true },
  label: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
};
// the default four: an overview opening into its detail, a number rolling, a card slamming down, a title entering
const DEFAULT_QUADS = (lang) => [
  { brick: { id: 'card-portal', category: 'motion', params: {} }, at: 0, tone: 'ground', label: lang === 'zh' ? '打开' : 'Open' },
  { brick: { id: 'digit-roll', category: 'motion', params: {} }, at: 8, tone: 'ink', label: lang === 'zh' ? '计数' : 'Count' },
  { brick: { id: 'slam-drop', category: 'motion', params: {} }, at: 16, tone: 'accent', label: lang === 'zh' ? '落定' : 'Land' },
  { brick: { id: 'type-enter', category: 'motion', params: {} }, at: 4, tone: 'panel', label: lang === 'zh' ? '标题' : 'Title' },
];

export default {
  id: 'quad-montage', kind: 'scene',
  fits: ['demo', 'climax', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: ['card-portal', 'digit-roll', 'slam-drop', 'type-enter'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'], type: ['text'] },
  slots: {
    quads: { type: 'list', count: [4, 4], of: QUAD },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  summary: 'Four bricks run side by side in a hard 2 × 2 grid, each started a few frames off the others, then hold together as one poster of four.',
  defaults: (ctx = {}) => ({ quads: DEFAULT_QUADS(ctx.lang === 'zh' ? 'zh' : 'en'), labels: true, hold: HOLD }),
  // a quad's length in frames at 120 BPM: its brick's beats (known after prepare; plan uses `len` when the film gives
  // it, else the default four's lengths)
  lenOf(q) { return q.len ?? { 'card-portal': 60, 'digit-roll': 45, 'slam-drop': 36, 'type-enter': 45 }[q.brick?.id] ?? 45; },
  plan(s, ctx) {
    const ends = s.quads.map((q) => (q.at || 0) + this.lenOf(q)), end = Math.max(...ends), beats = clamp(Math.ceil((end + (s.hold ?? HOLD)) / 15), 4, 10);
    return { beats, reads: [], cues: s.quads.map((q) => ({ beat: (q.at || 0) / 15, kind: 'accent' })).sort((a, b) => a.beat - b.beat),
      motion: 'four bricks in parallel, staggered starts', settled: end / 15, peakAt: null, pause: beats - end / 15 };
  },
  validate(s) {
    const err = [];
    if ((s.quads || []).length !== 4) err.push('quads: exactly 4');
    const starts = (s.quads || []).map((q) => q.at || 0).sort((a, b) => a - b);
    for (let i = 1; i < starts.length; i++) if (starts[i] - starts[i - 1] < 3) err.push(`quads: starts ${starts[i - 1]} and ${starts[i]} are under 3 frames apart (they read as one beat)`);
    return err;
  },
  async prepare(s) {
    const bricks = [];
    for (const [i, q] of s.quads.entries()) {
      const d = DEFAULT_QUADS(s.lang)[i], spec = q.brick || d.brick, colors = toneOf(s.colors, q.tone || 'ground');
      const b = await createBrick(spec.id, { ...(spec.params || {}), colors }, { lang: s.lang, category: spec.category || 'motion' });
      const buf = new OffscreenCanvas(1920, 1080);
      bricks.push({ b, buf, g: buf.getContext('2d', { willReadFrequently: true }), colors });
    }
    return { bricks };
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, bpm = cx.bpm || 120;
    ctx.fillStyle = mix(c.ink, c.ground, lum(c.ground) < 0.5 ? 0.92 : 0.08); ctx.fillRect(0, 0, 1920, 1080);   // the seams
    s.quads.forEach((q, i) => {
      const { b, buf, g, colors } = D.bricks[i], len = b.beats * 15, p = clamp((f - (q.at || 0)) / len), [x, y] = CELLS[i];
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
      g.fillStyle = colors.ground; g.fillRect(0, 0, 1920, 1080);
      b.draw(g, p, { dur: (b.beats * 60) / bpm });
      ctx.save(); rrect(ctx, x, y, QW, QH, R); ctx.clip();
      ctx.fillStyle = colors.ground; ctx.fillRect(x, y, QW, QH);
      const k = Math.max(QW / 1920, QH / 1080);
      ctx.drawImage(buf, x + (QW - 1920 * k) / 2, y + (QH - 1080 * k) / 2, 1920 * k, 1080 * k);
      if (s.labels !== false && q.label) {
        const lf = fontFor(s.look || NEUTRAL, 'text', s.lang, s.lang === 'zh' ? 28 : 25, 700, 'label'), lb = caseOf(`0${i + 1} — ${q.label}`, s.look || NEUTRAL, 'label', s.lang);
        const tw = measure(ctx, lb.text, { ...lf, spacing: lb.tracking * lf.size }).width;
        rrect(ctx, x + 18, y + 18, tw + 32, lf.size + 22, (lf.size + 22) / 2); ctx.fillStyle = rgba(colors.ground, 0.88); ctx.fill();
        text(ctx, lb.text, x + 34, y + 18 + (lf.size + 22) / 2 + lf.size * 0.36, { ...lf, spacing: lb.tracking * lf.size }, { color: colors.ink, alpha: 0.8 });
      }
      ctx.restore();
    });
  },
  blur() { return false; },
  // each quad's own tracked first point, mapped into its cell
  track(u, s, cx, D) {
    if (!D) return [[960, 540]];
    const f = u * 15, k = Math.max(QW / 1920, QH / 1080);
    return s.quads.map((q, i) => {
      const { b } = D.bricks[i], p = clamp((f - (q.at || 0)) / (b.beats * 15)), pt = (b.track(p) || [])[0] || [960, 540], [x, y] = CELLS[i];
      return [x + (QW - 1920 * k) / 2 + pt[0] * k, y + (QH - 1080 * k) / 2 + pt[1] * k];
    });
  },
};

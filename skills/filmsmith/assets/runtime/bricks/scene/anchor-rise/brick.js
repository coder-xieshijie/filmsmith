// anchor-rise — the hook of a print film: on paper, the anchor (the piece of the mark printed in the process ink)
// rises 820 px into its point over beat 0 and lands on beat 1 with a squash; a contact wave of larger dots runs out
// of it, and the coarse opening field (rings, a 24 px screen, peak tone 0.36) steps out one wavelength a beat; the
// problem lands in one or two big lines at the left, a small mono label above them. `rise: false`: the anchor is in
// place on frame 0 (a reel's cut).
// From the halftone template's `hook` scene (assets/templates/halftone/film.js toneAt hook, riseSpeed, ready hook
// layout; timing.rules.js C): the rise, the squash, the contact wave, sizes [131, 96] and places are the template's.
import { P, X0, TEXT_R, secs, worldColors, ground, display, monoF, fitSize, riseText, label, fieldTone, drawField, HOOK, markGeo, drawAnchor, riseOf, loadFonts, clamp, cubicOut, readTime } from '../../motion/dot-quantize/press.js';

const DEFAULT = { en: { lines: ['Everyone talks', 'at once.'], label: 'one mic · room 4' }, zh: { lines: ['所有人', '同时在说话。'], label: '一支麦克风 · 4 号会议室' } };
const LAND = 1;
const layout = (ctx, s, L, bpm) => {
  const ls = (s.lines || []).slice(0, 2), mk = (z) => display(L, z, 800);
  const sz = Math.min(...ls.map((l) => fitSize(ctx, l, mk, [131, 96], TEXT_R - X0).size));
  const ys = ls.length > 1 ? [520, 520 + Math.round(sz * (L === 'zh' ? 1.18 : 1.08))] : [600];
  return [...ls.map((l, k) => ({ str: l, x: X0, y: ys[k], f: mk(sz), role: 'ink', land: secs(LAND + k, bpm) })),
    ...(s.label ? [{ str: label(s.label, L), x: X0 + 4, y: 330, f: monoF(L, 28), role: 'dim', land: secs(LAND + 0.5, bpm) }] : [])];
};

export default {
  id: 'anchor-rise', kind: 'scene',
  fits: ['hook', 'problem'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: [], props: ['anchor-mark'], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 15 }, zh: { chars: 8 } } } },
    label: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 30 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], rise: true, dot: 'round', seed: 7 }),
  plan(s, ctx) {
    const n = Math.min(2, (s.lines || []).length), read = (readTime((s.lines || []).join(' '), ctx.lang) * ctx.bpm) / 60;
    const beats = clamp(Math.ceil(LAND + (n - 1) + Math.max(1.5, read * 0.7) + 0.5), 4, 8);
    return { beats, reads: [{ text: (s.lines || []).join(' '), lang: ctx.lang }, { text: s.label, lang: ctx.lang, tier: 'glance' }],
      cues: [{ beat: LAND, kind: 'hit' }, ...(n > 1 ? [{ beat: LAND + 1, kind: 'land' }] : [])], motion: 'anchor rises; contact wave; rings step', settled: LAND + n - 0.75, peakAt: LAND, pause: beats - LAND - n + 0.75 };
  },
  validate(s) { return (s.lines || []).length ? [] : ['lines: one or two']; },
  async prepare(s, c) { await loadFonts(c.lang); return { G: markGeo() }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, t = secs(u, c.bpm), wc = worldColors(C, 'paper'), tl = secs(LAND, c.bpm);
    ground(ctx, wc);
    const base = fieldTone('rings', u - LAND, { seed: s.seed, hook: true });
    const w = (t - tl) / 0.7; // the contact wave: an annulus of larger dots runs out of the anchor as it lands
    const tone = w > 0 && w < 1 ? (x, y) => { const r = 260 + 1300 * cubicOut(w), d = Math.abs(Math.hypot(x - P[0], y - P[1]) - r); return d < 100 ? Math.max(base(x, y), 0.24 * (1 - d / 100) * (1 - w)) : base(x, y); } : base;
    if (u >= LAND - 0.25 || s.rise === false) drawField(ctx, tone, wc.ink, { pitch: HOOK.pitch, shape: s.dot });
    D.T = D.T || layout(ctx, s, L, c.bpm);
    for (const e of D.T) riseText(ctx, e, t, wc);
    const r = s.rise === false ? { A: P, sq: 0 } : riseOf(t, tl);
    drawAnchor(ctx, D.G, r.A, D.G.ZH, C, { sq: r.sq, shape: s.dot });
  },
  track(u, s, c) { return [riseOf(secs(u, c.bpm), secs(LAND, c.bpm)).A]; },
  blur(u) { return u > 0.02 && u < LAND + 0.05; },
};

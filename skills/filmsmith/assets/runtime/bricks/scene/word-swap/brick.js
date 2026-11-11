// word-swap — one word a beat on one anchor (left margin, the one-line baseline), each on its own ground; on the beat
// the next ground opens from the previous word's dot (a circle), its line (a band) or as bars closing from top and
// bottom, 0.44 beat cubic out, and the new word slams in with its dot; the answer (`answer`) stands on the accent field
// the dot opens into. All words share one size, so the anchor never moves.
// From the ink template's `swap` (assets/templates/ink/film.js drawSwap, swapState; plan.js swap): timings and type
// are the template's; the apertures are aperture-swap's shapes drawn as canvas clips (the ink kit has no WebGL).
import { canvasOf } from '../../../handoffs/util.js';
import { cubicOut } from '../../../motion.js';
import { X, ONE, SLAM, SLAM_MIN, secs, word, stopOf, dot, fill, groundHex, inkOn, dotOn, camera, applyCam, grain, fitSize, clamp, disp } from '../../look/paper-slam/kit.js';
import { readTime, units } from '../../lang.js';

const DEFAULT = { en: { words: ['Who', 'broke', 'main'] }, zh: { words: ['谁', '弄坏了', '主干'] } };
const SHAPES = ['circle', 'band', 'close'];
const groundsOf = (s) => (s.words || []).map((_, k) => (s.answer === k ? 'accent' : (s.grounds || ['paper', 'night'])[k % (s.grounds || ['paper', 'night']).length]));
const clip = (ctx, shape, q, o) => {
  const e = cubicOut(clamp(q)), [ox, oy] = o;
  ctx.beginPath();
  if (shape === 'circle') ctx.arc(ox, oy, e * 2300 + 1, 0, Math.PI * 2);
  else if (shape === 'close') { ctx.rect(-1920, -1080, 5760, 1080 + e * oy); ctx.rect(-1920, 2160 - e * (2160 - oy), 5760, 2160); }
  else { const h = e * 2400; ctx.rect(-1920, oy - h / 2, 5760, h); }
  ctx.clip();
};

export default {
  id: 'word-swap', kind: 'scene',
  fits: ['hook', 'turn', 'proof'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: ['glyph-slam'], props: ['ink-dot'], roles: ['ground', 'ink', 'accent', 'onAccent', 'night', 'nightInk', 'nightAccent', 'mis'], type: ['display'] },
  slots: { words: { type: 'list', count: [2, 6], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } } } },
  roles: ['ground', 'ink', 'accent', 'onAccent', 'night', 'nightInk', 'nightAccent', 'mis'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], first: true, answer: null, grounds: ['paper', 'night'], seed: 20261018 }),
  plan(s, ctx) {
    const off = s.first ? 1 : 0, n = (s.words || []).length, B = 60 / ctx.bpm;
    const read = readTime((s.words || []).at(-1) || '', ctx.lang) + 0.3;
    const beats = clamp(off + n - 1 + Math.max(2, Math.ceil(read / B)), 3, 12);
    return { beats, reads: (s.words || []).map((w) => ({ text: w, lang: ctx.lang, tier: 'word' })), cues: (s.words || []).map((_, k) => ({ beat: off + k, kind: 'land' })), motion: 'aperture from the dot', settled: off + n - 1, peakAt: off, pause: 0, lead: 0 };
  },
  validate(s, ctx) { return (s.words || []).some((w) => units(w, ctx.lang) > 1 && ctx.lang !== 'zh') ? ['one word a beat'] : []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, z = Math.min(...(s.words || []).map((w) => fitSize(cv, disp(w, L), L, SLAM, SLAM_MIN)));
    const B = 60 / c.bpm, off = s.first ? 1 : 0, G = groundsOf(s);
    const items = (s.words || []).map((w, k) => { const sp = { text: w, x: X, y: ONE, size: z, lang: L }; return { ...sp, t: (off + k) * B, ground: G[k], ap: k ? SHAPES[(k - 1) % 3] : null, stop: stopOf(cv, sp) }; });
    return { z, items, B };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, it = D.items;
    let k = -1; it.forEach((x, j) => { if (t >= x.t) k = j; });
    const state = (j) => {
      const x = it[Math.max(0, j)], g = j < 0 ? (it[0]?.ground || 'paper') : x.ground;
      fill(ctx, groundHex(C, g));
      if (j < 0) return;
      word(ctx, { ...x, mode: 'slam', z: 0.8, w: 44, stagger: 0.012, color: inkOn(C, g), tIn: x.t, outMode: 'none', lang: L }, t, C);
      dot(ctx, x.stop.x, x.stop.y, x.stop.r, dotOn(C, g), t, x.t);
    };
    applyCam(ctx, camera(t, it.map((x) => x.t)));
    const x = it[k], q = x && x.ap ? (t - x.t) / (0.44 * D.B) : 1;
    if (x && x.ap && q < 1) {
      const prev = it[k - 1];
      state(k - 1); ctx.save(); clip(ctx, x.ap, q, x.ap === 'circle' ? [prev.stop.x, prev.stop.y] : [960, prev.stop.y - D.z * 0.3]); state(k); ctx.restore();
    } else state(k);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { const t = secs(u, c.bpm); let k = 0; D.items.forEach((x, j) => { if (t >= x.t) k = j; }); return [[D.items[k].stop.x, D.items[k].stop.y]]; },
  blur() { return false; },
};

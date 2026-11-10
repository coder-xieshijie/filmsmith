// dot-slam — one phrase slammed a word per beat (one or two lines at the left margin), the dot landing as its full stop
// with the last word; `stops: 'each'` buds a stop after every word and merges them back into one 0.85 beat after the
// last (the arc a stop takes is drawn; the template's gooey neck is not); an optional mono label types 0.75 beat after
// the line is complete; the words leave up through their mask 0.2 s before the scene ends. Slams carry the
// misregistration ghost on their impact frame and a 5 % punch-in.
// From the ink template's `slam` (assets/templates/ink/film.js layoutScenes slam, drawSplit; plan.js slam): sizes 330
// fitted to 220, baselines 640 / 520 · 830, timings the template's.
import { canvasOf } from '../../../handoffs/util.js';
import { cubicInOut } from '../../../motion.js';
import { X, ONE, L1, L2, LABEL, SLAM, SLAM_MIN, MAXW, T, secs, word, label, dot, fill, groundHex, inkOn, dotOn, camera, applyCam, grain, widthOf, D as DF, disp, clamp } from '../../look/paper-slam/kit.js';
import { readTime, units } from '../../lang.js';

const DEFAULT = { en: { lines: [['4096'], ['commits']], label: 'since Friday' }, zh: { lines: [['4096'], ['次提交']], label: '从周五起' } };
const layout = (cv, s, L) => {
  const lines = s.lines || [], each = s.stops === 'each', gapE = (z) => z * 0.2 + (each ? z * 0.174 : 0);
  const lw = (z) => Math.max(...lines.map((ln) => ln.reduce((w, tk, k) => w + widthOf(cv, disp(tk, L), DF(z, L), L) + (k ? gapE(z) : 0), 0) + z * 0.174));
  let z = SLAM; while (z > SLAM_MIN && lw(z) > MAXW) z -= 2;
  const ys = lines.length === 1 ? [ONE] : [L1, L2], r = z * 0.062, toks = [];
  lines.forEach((ln, li) => { let x = X; ln.forEach((tk) => { const w = widthOf(cv, disp(tk, L), DF(z, L), L); toks.push({ text: tk, x, y: ys[li], stop: { x: x + w + z * 0.05 + r, y: ys[li] - r } }); x += w + gapE(z); }); });
  return { z, r, toks, ly: lines.length === 1 ? ONE + 90 : 190 };
};
const timing = (s, ctx) => {
  const B = 60 / ctx.bpm, off = s.first ? 1 : 0, n = (s.lines || []).flat().length, last = (off + n - 1) * B;
  const words = (s.lines || []).flat().join(' '), lineRead = ctx.lang === 'zh' ? readTime(words.replace(/\s/g, ''), 'zh') : units(words, 'en') * 0.3;
  const labelAt = s.label ? last + T.labelAfter * B : null;
  const end = Math.max(last + lineRead, labelAt != null ? labelAt + s.label.length / T.cps + readTime(s.label, ctx.lang) : 0) + 0.25;
  return { B, off, last, labelAt, beats: clamp(Math.ceil(end / B - 1e-9), 3, 12) };
};

export default {
  id: 'dot-slam', kind: 'scene',
  fits: ['hook', 'problem', 'claim'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: ['glyph-slam'], props: ['ink-dot'], roles: ['ground', 'ink', 'accent', 'mis'], type: ['display', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'list', count: [1, 3], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } } } },
    label: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'ink', 'accent', 'mis'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], first: false, stops: 'one', accent: null, ground: 'paper', seed: 20261018 }),
  plan(s, ctx) {
    const T0 = timing(s, ctx), n = (s.lines || []).flat().length;
    return { beats: T0.beats, reads: [{ text: (s.lines || []).flat().join(' '), lang: ctx.lang }, ...(s.label ? [{ text: s.label, lang: ctx.lang }] : [])],
      cues: Array.from({ length: n }, (_, k) => ({ beat: T0.off + k, kind: 'land' })), motion: 'slam a word a beat', settled: T0.last / T0.B + 0.2, peakAt: T0.off, pause: 0, lead: 0 };
  },
  validate(s) { const n = (s.lines || []).flat().length; return n < 1 || n > 5 ? ['1–5 words'] : []; },
  prepare(s, c) { return { ...layout(canvasOf(8, 8).getContext('2d'), s, c.lang), ...timing(s, c) }; },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, end = D.beats * B, g = s.ground || 'paper';
    const at = (k) => (D.off + k) * B, n = D.toks.length;
    fill(ctx, groundHex(C, g));
    applyCam(ctx, camera(t, D.toks.map((_, k) => at(k))));
    D.toks.forEach((tk, k) => word(ctx, { text: tk.text, x: tk.x, y: tk.y, size: D.z, lang: L, mode: 'slam', tIn: at(k), tOut: end, outMode: 'up', color: s.accent === k ? C.accent : inkOn(C, g) }, t, C));
    if (s.label) label(ctx, { text: s.label, x: X + 6, y: D.ly, tIn: D.labelAt, tOut: end - T.labelEarlySec, color: inkOn(C, g), size: LABEL }, t, L);
    // the dot: one stop on the last word; or a stop per word merging back into the last 0.85 beat after it
    const lastStop = D.toks[n - 1].stop, col = dotOn(C, g), merge = at(n - 1) + 0.85 * B;
    if (s.stops === 'each') D.toks.forEach((tk, k) => {
      if (t < at(k)) return;
      const q = cubicInOut(clamp((t - merge) / (0.4 * B)));
      if (k < n - 1 && q >= 1) return;
      const x = tk.stop.x + (lastStop.x - tk.stop.x) * q, y = tk.stop.y + (lastStop.y - tk.stop.y) * q - Math.sin(Math.PI * q) * 120;
      dot(ctx, x, y, D.r, col, t, at(k));
    });
    else dot(ctx, lastStop.x, lastStop.y, D.r, col, t, at(n - 1), { fall: s.fall ?? 0 });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[D.toks.at(-1).stop.x, D.toks.at(-1).stop.y]]; },
  blur() { return false; },
};

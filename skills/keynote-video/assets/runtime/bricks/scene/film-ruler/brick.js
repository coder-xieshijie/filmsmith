// film-ruler — where we are in the film, on night: a hairline ruler grows out of the dot (0.5 s, expo out) across
// x 300–1620 at y 760 with a tick per beat of the film (tall on bar lines); the dot is its playhead, riding at the
// film's own progress; two words slam side by side above it (the second a beat later) and a mono label types on top.
// The ruler is the film measuring itself (a mid-film "half way" or "two left").
// From the ink template's `ruler` (assets/templates/ink/film.js layoutScenes ruler, drawScene ruler; timing.rules.js
// rulerWord2 1, labelAfter .75): sizes and positions the template's. `film` gives the film's length in beats and
// where this scene sits in it; standing alone the scene is a 32-beat film's middle.
import { canvasOf } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { secs, word, label, fill, camera, applyCam, grain, fitSize, widthOf, D as DF, disp, clamp, mix, MAXW, landSq, SLAM, SLAM_MIN, T } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';
import LOOK from '../../look/paper-slam/look.js';

const DEFAULT = { en: { words: ['half', 'way'], label: 'twelve builds to go' }, zh: { words: ['过半', '了'], label: '还剩十二次构建' } };
export default {
  id: 'film-ruler', kind: 'scene',
  fits: ['turn', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 8 },
  needs: { motions: ['glyph-slam'], props: ['ink-dot'], roles: ['night', 'nightInk', 'nightAccent'], type: ['display', 'mono'] },
  slots: {
    words: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 7 }, zh: { chars: 3 } } } },
    label: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 5, chars: 26 }, zh: { chars: 10 } } },
  },
  roles: ['night', 'nightInk', 'nightAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], film: { beats: 32, at: 14 }, seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, need = B + readTime(s.words.join(' '), ctx.lang) + (s.label ? 0.75 * B + readTime(s.label, ctx.lang) : 0);
    return { beats: clamp(Math.ceil(need / B), 4, 8), reads: [{ text: s.words.join(' '), lang: ctx.lang }, ...(s.label ? [{ text: s.label, lang: ctx.lang }] : [])], cues: [{ beat: 0, kind: 'land' }, { beat: 1, kind: 'land' }], motion: 'ruler grows from the dot', settled: 1, peakAt: 1, pause: 0, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, joined = s.words.map((w) => disp(w, L)).join('  ');
    const z = fitSize(cv, joined, L, SLAM, SLAM_MIN, MAXW - 40);
    const w0 = widthOf(cv, disp(s.words[0], L), DF(z, L), L), w1 = widthOf(cv, disp(s.words[1], L), DF(z, L), L), gap = z * 0.2;
    return { z, B: 60 / c.bpm, x0: 960 - (w0 + gap + w1) / 2, w0, gap, beats: this.plan(s, c).beats };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, F = s.film || { beats: 32, at: 14 };
    const R = { x0: 300, x1: 1620, y: 760 }, head = (tt) => R.x0 + (R.x1 - R.x0) * clamp((F.at + tt / B) / F.beats);
    fill(ctx, C.night);
    applyCam(ctx, camera(t, [0, B]));
    if (s.label) label(ctx, { text: s.label, x: 960, align: 'center', y: 300, tIn: 1.75 * B, color: C.nightInk }, t, L);
    word(ctx, { text: s.words[0], x: D.x0, y: 600, size: D.z, lang: L, mode: 'slam', tIn: 0, outMode: 'none', color: C.nightInk }, t, C);
    word(ctx, { text: s.words[1], x: D.x0 + D.w0 + D.gap, y: 600, size: D.z, lang: L, mode: 'slam', tIn: B, outMode: 'none', color: C.nightInk }, t, C);
    const g = expOut(clamp(t / 0.5)), h0 = head(0), a = h0 + (R.x0 - h0) * g, b = h0 + (R.x1 - h0) * g;
    ctx.save(); ctx.strokeStyle = C.nightInk; ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(a, R.y); ctx.lineTo(b, R.y); ctx.stroke();
    for (let k = 0; k <= F.beats; k++) {
      const x = R.x0 + ((R.x1 - R.x0) * k) / F.beats; if (x < a - 0.5 || x > b + 0.5) continue;
      const h = k % 4 === 0 ? 30 : 12; ctx.beginPath(); ctx.moveTo(x, R.y - h); ctx.lineTo(x, R.y); ctx.stroke();
    }
    ctx.restore();
    const q = landSq(t);
    ctx.save(); ctx.translate(head(t), R.y); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, -0, 12, 0, Math.PI * 2); ctx.fillStyle = C.nightAccent; ctx.fill(); ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[960, 600]]; },
  blur() { return false; },
};

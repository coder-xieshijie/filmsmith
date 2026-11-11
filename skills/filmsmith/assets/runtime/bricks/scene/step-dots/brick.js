// step-dots — a loop's real stages on night, one a beat: each step word slams centred on a stiff spring (settled in
// 0.07 s) and is cut by the next, a mono STEP n / N counter above it, a row of progress dots below (done: filled ink;
// to come: rings; the current one is the accent dot, landing with its squash); streaks sweep the night on the first
// step (or on every step); after the last step the dot bounces in place to the scene's end.
// From the ink template's `steps` (assets/templates/ink/film.js layoutScenes steps, drawScene steps; plan.js stepAts,
// streakAts): sizes 300 (floor 200) at y 650, the counter at y 300, dots 46 px apart at y 850, r 9 and 11.
import { canvasOf } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { LABEL, secs, word, label, fill, camera, applyCam, grain, fitSize, disp, clamp, MAXW, landSq, bounceY, streaks } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { steps: ['fetch', 'midpoint', 'build', 'test', 'narrow'] }, zh: { steps: ['拉取', '取中点', '构建', '测试', '缩小'] } };
export default {
  id: 'step-dots', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: ['glyph-slam'], props: ['ink-dot'], roles: ['night', 'nightInk', 'nightSoft', 'nightAccent'], type: ['display', 'mono'] },
  slots: { steps: { type: 'list', count: [3, 7], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 9 }, zh: { chars: 4 } } } } },
  roles: ['night', 'nightInk', 'nightSoft', 'nightAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], streaks: 'first', seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, n = (s.steps || []).length, last = readTime(s.steps[n - 1], ctx.lang);
    return { beats: clamp(n + Math.max(2, Math.ceil(last / B)), 4, 10), reads: s.steps.map((x) => ({ text: x, lang: ctx.lang, tier: 'word' })), cues: s.steps.map((_, k) => ({ beat: k, kind: 'land' })), motion: 'one step a beat', settled: n - 1, peakAt: n - 1, pause: 0, lead: 0 };
  },
  validate(s) { const n = (s.steps || []).length; return n < 3 || n > 7 ? ['steps: 3–7'] : []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), B = 60 / c.bpm, beats = this.plan(s, c).beats;
    const z = Math.min(...s.steps.map((w) => fitSize(cv, disp(w, c.lang), c.lang, 300, 200, MAXW)));
    const n = s.steps.length, rest = [];
    for (let b = n + 1; b < beats; b++) rest.push(b * B);
    return { z, B, beats, n, rest };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, n = D.n, end = D.beats * B, at = (k) => k * B;
    const k = Math.min(n - 1, Math.max(0, Math.floor(t / B + 1e-6)));
    fill(ctx, C.night);
    for (const a of s.streaks === 'each' ? s.steps.map((_, j) => at(j)) : s.streaks === false ? [] : [0]) streaks(ctx, t, a, C, s.seed || 1);
    const sc = camera(t, s.steps.map((_, j) => at(j)));
    applyCam(ctx, sc);
    s.steps.forEach((w, j) => {
      word(ctx, { text: w, x: 960, y: 650, size: D.z, align: 'center', lang: L, mode: 'slam', z: 0.8, w: 44, stagger: 0.012, tIn: at(j), tOut: j < n - 1 ? at(j + 1) - 0.02 : end, outMode: j < n - 1 ? 'cut' : 'none', color: C.nightInk }, t, C);
    });
    const counter = L === 'zh' ? `第 ${k + 1} / ${n} 步` : `step ${k + 1} / ${n}`;
    label(ctx, { text: counter, x: 960, align: 'center', y: 300, tIn: at(k), color: C.nightSoft, cps: 400 }, t, L);
    const pos = (j) => [960 + (j - (n - 1) / 2) * 46, 850];
    for (let j = 0; j < n; j++) {
      const pop = clamp((t - j * 0.025) / 0.18); if (pop <= 0) continue;
      const [x, y] = pos(j);
      ctx.beginPath(); ctx.arc(x, y, 9 * expOut(pop), 0, Math.PI * 2);
      if (j < k) { ctx.fillStyle = C.nightInk; ctx.fill(); } else if (j > k) { ctx.strokeStyle = C.nightSoft; ctx.lineWidth = 2; ctx.stroke(); }
    }
    const [x, y] = pos(k), by = bounceY(t, D.rest, 70) * 0.6, q = by ? 0 : landSq(t - at(k));
    ctx.save(); ctx.translate(x, y + 11 + by); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, -11, 11, 0, Math.PI * 2); ctx.fillStyle = C.nightAccent; ctx.fill(); ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { const k = Math.min(D.n - 1, Math.floor(secs(u, c.bpm) / D.B)); return [[960 + (k - (D.n - 1) / 2) * 46, 850]]; },
  blur() { return false; },
};

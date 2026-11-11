// beat-list — a metronome of three channels: a list of words steps up one row on every beat, a pill fixed in the
// middle of the frame catches the next word and changes tone, and the ground changes with it, all on the same beat;
// each jump takes the first 6 frames of the beat and the rest of the beat stands still.
// Adapted from video-shotcraft demos/rhythm/beat-step-list-theme-cycle/BeatStepListThemeCycle.tsx (card
// references/shots/rhythm/beat-step-list-theme-cycle.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the five themes of fixed colours and system
// fonts become steps inside the look: the pill walks from the ink role to the accent (the last word is the one the
// film means), the ground leans a little toward the pill, and the word in the pill changes face among the look's own
// type roles and weights (no palette swap, no extra fonts); brand, the adjectives, the theme names and the slogan
// removed (every word is a slot); the jumps sit on the film's beats (`every` beats apart, default one) instead of
// 18 frames; the list's depth blur is left out (the far rows fade and shrink); the lens (the pill shows a clipped copy
// of the list in its own ink and face), the 6-frame jump on 1 − (1 − x)^3.2, the squash (1.14 → 0.96 → 1 against
// 0.97 → 1.01 → 1), the flash on the catch, the pill's width following the caught word, the row fade by distance, the
// feathered top and bottom in the live ground, the counter and the swatches are the upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';

const ROW_H = 176, FS = 132, CY = 520, PILL_H = 156, PAD_L = 64, PAD_R = 76, GAP = 34, MARGIN = 128, JUMP = 6, LEAD = 2;
// the faces the caught word cycles through: the look's own roles and weights
const FACES = [{ role: 'display', weight: 700 }, { role: 'display', weight: 400 }, { role: 'mono', weight: 600 }, { role: 'display', weight: 800 }, { role: 'text', weight: 600 }];
const snap = (t) => 1 - Math.pow(1 - clamp(t), 3.2);
const lum = (hex) => { const v = parseInt(hex.slice(1, 7), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };
const pw = (k, a, b) => (k <= 0.6 ? a[0] + (a[1] - a[0]) * (k / 0.6) : a[1] + (a[2] - a[1]) * ((k - 0.6) / 0.4));
const DEFAULT = {
  en: { lead: 'Every cut is', words: ['sketched', 'planned', 'drafted', 'reviewed', 'checked', 'shipped', 'shared', 'archived'], start: 2, steps: 4,
    counter: 'Step', tagline: 'Five passes, one cut.' },
  zh: { lead: '每一刀都', words: ['勾勒过', '规划过', '起稿过', '审阅过', '检查过', '发布过', '分享过', '存档过'], start: 2, steps: 4,
    counter: '步骤', tagline: '五道工序，一刀。' },
};

export default {
  id: 'beat-list', kind: 'scene',
  fits: ['hook', 'turn', 'demo', 'climax'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { motions: ['stagger-in'], props: [], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    lead: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 12 }, zh: { chars: 4 } } },
    words: { type: 'list', count: [5, 10], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 3 } } } },
    counter: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } },
    tagline: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  summary: 'A list of words steps up one row a beat; a pill fixed mid-frame catches each word and changes tone, and the ground changes with it.',
  defaults: (ctx = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])), every: 1 }),
  // in beats: the lead-in (2), one jump every `every` beats, the tagline, then a hold (2 beats, or the tagline's read)
  timing(s, lang) {
    const n = s.steps, ev = s.every || 1, last = LEAD + (n - 1) * ev, read = s.tagline ? readTime(s.tagline, lang) * 2 : 0;
    return { ev, last, total: last + 0.4 + Math.max(2, 0.8 + read) };
  },
  plan(s, ctx) {
    const T = this.timing(s, ctx.lang), beats = clamp(Math.ceil(T.total), 6, 12);
    return { beats, reads: [{ text: `${s.lead} ${s.words[s.start + s.steps]}`, lang: ctx.lang }, ...(s.tagline ? [{ text: s.tagline, lang: ctx.lang }] : [])],
      cues: Array.from({ length: s.steps }, (_, i) => ({ beat: LEAD + i * T.ev, kind: i === s.steps - 1 ? 'land' : 'accent' })),
      motion: 'the list steps a row a beat; pill and ground change on the same beat', settled: T.last + 0.4, peakAt: T.last, pause: beats - T.last - 0.4 };
  },
  validate(s) {
    const err = [], n = (s.words || []).length;
    if (n < 5 || n > 10) err.push('words: 5 to 10');
    if (!(s.steps >= 2 && s.steps <= 5)) err.push('steps: 2 to 5 jumps');
    if (s.start < 1) err.push('start: at least one word above the first caught word');
    if (s.start + s.steps + 2 > n) err.push('words: two below the last caught word, so the list does not run out');
    return err;
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  face(s, k) { const f = FACES[k % FACES.length]; return this.F(s, f.role, FS, f.weight, f.role === 'display' ? 'display' : null); },
  prepare(s) {
    const c = s.colors, g = new OffscreenCanvas(8, 8).getContext('2d'), n = s.steps;
    // tone k of the ladder: the pill from the ink role to the accent, its ink the darker or lighter of ground and ink
    const tones = Array.from({ length: n + 1 }, (_, k) => { const pill = mix(c.ink, c.accent, k / n); const dark = lum(c.ground) < lum(c.ink) ? c.ground : c.ink, light = dark === c.ground ? c.ink : c.ground; return { pill, on: lum(pill) > 0.45 ? dark : light, ground: mix(c.ground, pill, 0.07) }; });
    const widths = Array.from({ length: n + 1 }, (_, k) => measure(g, s.words[s.start + k], this.face(s, k)).width);
    const mid = [...widths].sort((a, b) => a - b)[Math.floor(widths.length / 2)] + PAD_L + PAD_R;
    const leadF = this.F(s, 'display', FS, 400, 'display'), leadW = measure(g, s.lead, leadF).width;
    const left = (1920 - (leadW + GAP + mid)) / 2;
    return { tones, widths, leadF, leadW, pillX: left + leadW + GAP };
  },
  // one clock: jumps done, progress inside the jump; every channel reads it
  clock(u, s) {
    const T = this.timing(s, s.lang), raw = (u - LEAD) / T.ev, beat = Math.min(s.steps, Math.max(0, Math.floor(raw) + 1));
    const since = beat === 0 ? 99 : (u - (LEAD + (beat - 1) * T.ev)) * 15;
    const t = beat === 0 ? 1 : snap(since / JUMP);
    return { beat, t, step: beat === 0 ? 0 : beat - 1 + t, since };
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, K = this.clock(u, s), n = s.steps, total = this.timing(s, s.lang).total * 15;
    const prev = D.tones[Math.max(0, K.beat - 1)], now = D.tones[K.beat], m = K.beat === 0 ? 1 : K.t;
    const pill = mix(prev.pill, now.pill, m), bg = mix(prev.ground, now.ground, m), hit = K.beat === 0 ? 0 : Math.exp(-K.since / 3.2);
    const sy = K.beat === 0 ? 1 : pw(K.t, [1.14, 0.96, 1]), sx = K.beat === 0 ? 1 : pw(K.t, [0.97, 1.01, 1]);
    const open = ramp(f, 2, 16, EASE.snappy), listIn = ramp(f, 4, 18, EASE.out), cam = 1 + 0.03 * ramp(f, 0, total, EASE.smooth);
    const pillW = (K.beat === 0 ? D.widths[0] : D.widths[K.beat - 1] + (D.widths[K.beat] - D.widths[K.beat - 1]) * m) + PAD_L + PAD_R;
    const pos = s.start + K.step, X = D.pillX, wordX = X + PAD_L;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
    const halo = ctx.createRadialGradient(X + 300, CY, 0, X + 300, CY, 1100);
    halo.addColorStop(0, rgba(pill, 0.16 + 0.06 * hit)); halo.addColorStop(0.45, rgba(pill, 0.05)); halo.addColorStop(1, rgba(pill, 0));
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(X, CY); ctx.scale(cam, cam); ctx.translate(-X, -CY);
    // the list outside the pill: one face, fading and shrinking with distance from the middle row
    const base = this.F(s, 'display', FS, 700, 'display'), y0 = CY + (1 - listIn) * 40;
    s.words.forEach((w, i) => {
      const d = Math.abs(i - pos), op = Math.max(0, 0.42 - 0.15 * Math.max(0, d - 1)) * listIn, sc = 1 - Math.min(0.14, 0.05 * Math.max(0, d - 0.5));
      if (op <= 0.003) return;
      const y = y0 + (i - pos) * ROW_H;
      ctx.save(); ctx.translate(wordX, y); ctx.scale(sc, sc); text(ctx, w, 0, 0, base, { color: c.ink, alpha: op, baseline: 'middle' }); ctx.restore();
    });
    // the pill: a lens over the list; inside it the same rows in the pill's ink and each caught word's face
    ctx.save(); ctx.translate(X, CY); ctx.scale(sx * (0.55 + 0.45 * open), sy); ctx.translate(-X, -CY);
    ctx.globalAlpha = Math.min(1, open * 2.5);
    ctx.save(); ctx.shadowColor = rgba(pill, 0.4 + 0.25 * hit); ctx.shadowBlur = 60 + 50 * hit; ctx.shadowOffsetY = 18;
    rrect(ctx, X, CY - PILL_H / 2, pillW, PILL_H, PILL_H / 2); ctx.fillStyle = pill; ctx.fill(); ctx.restore();
    ctx.save(); rrect(ctx, X, CY - PILL_H / 2, pillW, PILL_H, PILL_H / 2); ctx.clip();
    const sheen = ctx.createLinearGradient(0, CY - PILL_H / 2, 0, CY + PILL_H / 2);
    sheen.addColorStop(0, rgba('#FFFFFF', 0.16 + 0.07 * hit)); sheen.addColorStop(0.5, rgba('#FFFFFF', 0.03 * hit)); sheen.addColorStop(1, rgba('#000000', 0.1));
    ctx.fillStyle = sheen; ctx.fillRect(X, CY - PILL_H / 2, pillW, PILL_H);
    s.words.forEach((w, i) => {
      const k = i - s.start, y = CY + (i - pos) * ROW_H;
      if (Math.abs(y - CY) > ROW_H) return;
      text(ctx, w, wordX, y, k >= 0 && k <= n ? this.face(s, k) : base, { color: (D.tones[clamp(k, 0, n)] || now).on, baseline: 'middle', alpha: Math.min(1, open * 2) });
    });
    ctx.restore(); ctx.restore();
    // the lead: still, right-aligned against the pill
    riseText(ctx, s.lead, X - GAP, CY + FS * 0.36, D.leadF, { color: rgba(c.ink, 0.94), lang: s.lang, f, start: 2, each: 16, gap: 4, align: 'right' });
    ctx.restore();
    // feather the top and the bottom into the live ground
    const top = ctx.createLinearGradient(0, 0, 0, 300); top.addColorStop(0.34, bg); top.addColorStop(1, rgba(bg, 0)); ctx.fillStyle = top; ctx.fillRect(0, 0, 1920, 300);
    const bot = ctx.createLinearGradient(0, 750, 0, 1080); bot.addColorStop(0, rgba(bg, 0)); bot.addColorStop(0.62, bg); ctx.fillStyle = bot; ctx.fillRect(0, 750, 1920, 330);
    // the counter (rolls one place on each jump) and the swatches of the ladder
    const lf = this.F(s, 'text', s.lang === 'zh' ? 28 : 25, 600, 'label'), cl = caseOf(s.counter || '', s.look || NEUTRAL, 'label', s.lang), mf = this.F(s, 'mono', 32, 500);
    const tot = ` / ${String(n + 1).padStart(2, '0')}`, wt = measure(ctx, tot, mf).width, wn = measure(ctx, '00', mf).width, fade = ramp(f, 0, 12, EASE.out);
    text(ctx, tot, 1920 - MARGIN, 132, mf, { color: rgba(c.ink, 0.4), align: 'right', alpha: fade });
    ctx.save(); ctx.beginPath(); ctx.rect(1920 - MARGIN - wt - wn - 4, 100, wn + 8, 42); ctx.clip();
    for (let k = 0; k <= n; k++) text(ctx, String(k + 1).padStart(2, '0'), 1920 - MARGIN - wt - wn, 132 + (k - (K.beat - 1 + (K.beat === 0 ? 1 : K.t))) * 38, mf, { color: c.ink, alpha: fade });
    ctx.restore();
    text(ctx, cl.text, 1920 - MARGIN - wt - wn - 18, 130, { ...lf, spacing: cl.tracking * lf.size }, { color: rgba(c.ink, 0.5), align: 'right', alpha: fade });
    D.tones.forEach((tn, k) => {
      const cur = k === K.beat, pop = cur ? (K.beat === 0 ? 1 : pw(K.t, [0.7, 1.12, 1])) : 1, appear = clamp(ramp(f, 6 + k * 2, 12, EASE.overshoot), 0, 1.2);
      const r = 23 * (cur ? 1 : 0.62) * pop * appear, x = MARGIN + 23 + k * 68, y = 923;
      if (r <= 0.2) return;
      ctx.save(); ctx.globalAlpha = cur ? 1 : k < K.beat ? 0.55 : 0.32;
      if (cur) { ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.strokeStyle = rgba(c.ink, 0.85); ctx.lineWidth = 2; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = tn.pill; ctx.fill(); ctx.restore();
    });
    if (s.tagline) {
      const T = this.timing(s, s.lang), tf = this.F(s, 'text', 40, 500);
      riseText(ctx, s.tagline, 1920 - MARGIN, 936, tf, { color: rgba(c.ink, 0.72), lang: s.lang, f, start: (T.last + 0.4) * 15, each: 14, gap: 3, align: 'right' });
    }
  },
  blur() { return true; },
  // the left end of the last word to be caught (the list jumps a row a beat)
  track(u, s, cx, D) {
    const K = this.clock(u, s), cam = 1 + 0.03 * ramp(u * 15, 0, this.timing(s, s.lang).total * 15, EASE.smooth), X = D ? D.pillX : 960;
    const y = CY + (1 - ramp(u * 15, 4, 18, EASE.out)) * 40 + (s.steps - K.step) * ROW_H;
    return [[X + PAD_L * cam, CY + (y - CY) * cam]];
  },
};

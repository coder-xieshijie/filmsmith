// three-angles — one subject cut into three comic panels on three beats (whole, closer, one detail), each panel stamped
// with its own caption box; after a held beat the last panel eats the frame and becomes the poster the headline sits
// on.
// Adapted from video-shotcraft demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx (card references/shots/rhythm/panel-grid-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion) over the motion brick panel-carve (the seams,
// the pops, the hold and the eat are its own); colours by role (caption boxes in paper with an onPaper rim and hard
// shadow, the kicker in the accent, the headline in paper over a shade of the ground); brand, the vector lens, the
// wordmark and every word removed (the subject is any painter, by default the sample page; captions, headline, subline
// and eyebrow are slots); the captions sit at panel-carve's tracked panel corners and are clipped to their panels, so
// the eating edge covers them; the stamp (scale 1.25 → 1 overshoot over 9 frames, 7 frames after its panel, tilts of
// −2°, 1.5°, −1.5°), the left shade of the poster and the headline's line-by-line rise at frame 82 are the upstream's.
import { clamp, mix, rgba, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { createBrick } from '../../index.js';
import { riseText } from '../../motion/stagger-in/brick.js';

const START = 19, END = 80, CAP = 7, TITLE = 82, SLANT = 230, HALF = 9, H = 1080;
// the upstream's caption places, relative to each panel: panel 1 and 3 at the top, panel 2 low; 3 anchored right
const PLACES = [{ dx: 88, y: 96, tilt: -2, anchor: 'left' }, { dx: 41, y: 810, tilt: 1.5, anchor: 'left' }, { x: 1920 - 92, y: 96, tilt: -1.5, anchor: 'right' }];
const CAPTION = {
  kicker: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 14 }, zh: { chars: 6 } } },
  text: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } },
};
const DEFAULT = {
  en: { captions: [{ kicker: '01 · Wide', text: 'The whole page' }, { kicker: '02 · Close', text: 'The trend' }, { kicker: '03 · Detail', text: 'One number' }],
    eyebrow: 'Three angles', headline: 'Ship the cut you meant', subline: 'Every render, checked before it ships' },
  zh: { captions: [{ kicker: '01 · 全景', text: '整页' }, { kicker: '02 · 近景', text: '走势' }, { kicker: '03 · 特写', text: '一个数字' }],
    eyebrow: '三个机位', headline: '发出你想要的那一版', subline: '每一次渲染，发布前都检查过' },
};

export default {
  id: 'three-angles', kind: 'scene',
  fits: ['demo', 'climax', 'claim'],
  surface: ['canvas'],
  beats: { min: 9, max: 12 },
  needs: { motions: ['panel-carve'], props: [], roles: ['ground', 'ink', 'accent', 'paper', 'onPaper'], type: ['display', 'text'] },
  slots: {
    subject: { type: 'brick', optional: true },
    captions: { type: 'list', count: [3, 3], of: CAPTION },
    eyebrow: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    headline: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 24 }, zh: { chars: 10 } } },
    subline: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 7, chars: 40 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'accent', 'paper', 'onPaper'],
  summary: 'One subject cut into three comic panels on three beats, each stamped with a caption; the last panel eats the frame and holds the headline.',
  defaults: (ctx = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])), subject: null }),
  // frames: the subject alone (19), the carve to the eat (80), the headline from 82, then the read
  frames(s, lang) { const read = readTime(s.headline, lang) + (s.subline ? readTime(s.subline, lang) : 0); return TITLE + 14 + Math.max(60, Math.ceil(read * 30)); },
  plan(s, ctx) {
    const total = this.frames(s, ctx.lang), beats = clamp(Math.ceil(total / 15), 9, 12);
    return { beats, reads: [...s.captions.map((c) => ({ text: c.text, lang: ctx.lang })), { text: s.headline, lang: ctx.lang }, ...(s.subline ? [{ text: s.subline, lang: ctx.lang }] : [])],
      cues: [0, 1, 2].map((i) => ({ beat: (20 + i * 4) / 15, kind: 'accent' })).concat([{ beat: 66 / 15, kind: 'turn' }, { beat: TITLE / 15, kind: 'land' }]),
      motion: 'panel-carve, then the poster', settled: (TITLE + 30) / 15, peakAt: 66 / 15, pause: beats - (TITLE + 30) / 15 };
  },
  validate(s) { return (s.captions || []).length === 3 ? [] : ['captions: exactly 3, one per panel']; },
  async prepare(s) {
    const carve = await createBrick('panel-carve', { colors: s.colors, ...(s.subject ? { subject: s.subject } : {}) }, { lang: s.lang });
    return { carve };
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  // a caption box: paper, an onPaper rim and a hard shadow, the kicker in the accent over the line; stamped in
  caption(ctx, cap, x, y, place, f, at, s) {
    if (f < at) return;
    const c = s.colors, paper = c.paper || c.panel, rim = c.onPaper || c.ink, p = ramp(f, at, 9, EASE.overshoot), a = Math.min(1, (f - at) / 3);
    const kf = this.F(s, 'text', s.lang === 'zh' ? 28 : 22, 800, 'label'), kk = caseOf(cap.kicker, s.look || NEUTRAL, 'label', s.lang), tf = this.F(s, 'display', 40, 800, 'display');
    const kfs = { ...kf, spacing: kk.tracking * kf.size }, w = Math.max(measure(ctx, kk.text, kfs).width, measure(ctx, cap.text, tf).width) + 44, h = kf.size + 40 + 30;
    ctx.save(); ctx.translate(x, y); ctx.rotate((place.tilt * Math.PI) / 180); ctx.scale(1.25 + (1 - 1.25) * p, 1.25 + (1 - 1.25) * p); ctx.globalAlpha *= a;
    const x0 = place.anchor === 'right' ? -w : 0;
    ctx.fillStyle = rim; ctx.fillRect(x0 + 7, 7, w, h); ctx.fillRect(x0 - 4, -4, w + 8, h + 8);
    ctx.fillStyle = paper; ctx.fillRect(x0, 0, w, h);
    text(ctx, kk.text, x0 + 22, 14 + kf.size * 0.9, kfs, { color: c.accent });
    text(ctx, cap.text, x0 + 22, h - 18, tf, { color: rim });
    ctx.restore();
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, p = clamp((f - START) / (END - START)), b = D.carve, T = b.track(p);
    b.draw(ctx, p);
    const edge = T[0][0], corners = [T[2], T[3], T[4]];
    // panels 1 and 2: their captions live left of the eating edge
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(edge - HALF, 0); ctx.lineTo(edge - SLANT - HALF, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
    [0, 1].forEach((i) => this.caption(ctx, s.captions[i], corners[i][0] + PLACES[i].dx, PLACES[i].y, PLACES[i], f, START + 1 + i * 4 + CAP, s));
    ctx.restore();
    // panel 3's caption fades as the eat begins
    const out = 1 - ramp(f, 65, 6, EASE.exit);
    if (out > 0.001) { ctx.save(); ctx.globalAlpha = out; this.caption(ctx, s.captions[2], PLACES[2].x, PLACES[2].y, PLACES[2], f, START + 9 + CAP, s); ctx.restore(); }
    // the poster: the last framing, shaded on the left, the headline line by line, the subline word by word
    if (f >= END) {
      const shade = mix(c.ground, '#000000', 0.5), g = ctx.createLinearGradient(0, 0, 1920, 0);
      const k = ramp(f, END, 8, EASE.out);
      g.addColorStop(0, rgba(shade, 0.94 * k)); g.addColorStop(0.42, rgba(shade, 0.8 * k)); g.addColorStop(0.66, rgba(shade, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      const ink = c.paper || c.ink, ef = this.F(s, 'mono', s.lang === 'zh' ? 28 : 25, 650, 'label'), eb = caseOf(s.eyebrow || '', s.look || NEUTRAL, 'label', s.lang);
      if (s.eyebrow) text(ctx, eb.text, 120, 320, { ...ef, spacing: eb.tracking * ef.size }, { color: c.accent, alpha: ramp(f, TITLE - 2, 10, EASE.out) });
      const hf = this.F(s, 'display', s.lang === 'zh' ? 140 : 150, 800, 'display'), lines = wrap(ctx, s.headline, hf, s.lang === 'zh' ? 760 : 980, s.lang).slice(0, 2), lh = hf.size * (s.lang === 'zh' ? 1.12 : 0.98);
      lines.forEach((ln, i) => riseText(ctx, ln, 120, 346 + hf.size * 0.92 + i * lh, hf, { color: ink, lang: s.lang, f, start: TITLE + i * 6, each: 20, gap: 0, span: 0 }));
      if (s.subline) {
        const sf = this.F(s, 'text', 38, 500), y = 346 + hf.size * 0.92 + (lines.length - 1) * lh + 34 + 38 + 20;
        wrap(ctx, s.subline, sf, 680, s.lang).slice(0, 2).forEach((ln, i) => riseText(ctx, ln, 120, y + i * 50, sf, { color: rgba(ink, 0.78), lang: s.lang, f, start: TITLE + 14 + i * 4, each: 14, gap: 3 }));
      }
    }
  },
  blur() { return false; },
  // panel-carve's points: the eating edge, the third framing's centre, the three panels' top-left corners
  track(u, s, cx, D) { return D ? D.carve.track(clamp((u * 15 - START) / (END - START))) : [[960, 540]]; },
};

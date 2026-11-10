// pill-dictate — the quietest beat of a demo: a fixed-width pill field arrives slightly large and out of focus and
// settles; a glow inside it, faint on the left and strong on the right ("waiting for you to speak"), lights the wall
// behind it and the floor below; the caret comes first, then the dictated sentence types at an even pace, and the glow
// recedes with the typing until a neutral bar with its sentence is left.
// Adapted from video-shotcraft demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx (card
// references/shots/interaction/glass-pill-dictation-typing.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React, CSS backdrop filter or Remotion); the pill is the
// input-field prop (form pill, voice button with live bars); colours by role (the inner glow, the light behind and the
// floor's reflection in the accent and a lighter accent, the frosted body in the panel colour); the sentence and the
// line under the pill are slots; the brand mark is gone; typing goes by grapheme in either language.
import { clamp, lerp, mix, rgba, measure, text, scratch } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, graphemes, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { drawField } from '../../prop/input-field/brick.js';

const PW = 1240, PH = 132, PX = (1920 - PW) / 2, PY = 540 - PH / 2, TYPE0 = 8, TAIL = 36;
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const cpf = (lang) => (lang === 'zh' ? 3.5 : 2);                  // frames a grapheme: an even pace, a Chinese character takes longer
const lengthOf = (s, lang) => TYPE0 + graphemes(s).length * cpf(lang) + TAIL;

export default {
  id: 'pill-dictate', kind: 'scene',
  fits: ['demo', 'hook'],
  surface: ['canvas'],
  beats: { min: 5, max: 9 },
  needs: { motions: [], props: ['input-field'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['text'] },
  slots: {
    text: { type: 'text', tier: 'primary', limits: { en: { words: 9, chars: 34 }, zh: { chars: 16 } }, default: { en: 'Draft a teaser for the new release', zh: '给新版本写一支预告片' } },
    caption: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } }, default: { en: 'Speak or type', zh: '说出来，或打出来' } },
  },
  defaults: () => ({ text: { en: 'Draft a teaser for the new release', zh: '给新版本写一支预告片' }, caption: { en: 'Speak or type', zh: '说出来，或打出来' } }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', t = pick(s.text, lang) || '', n = lengthOf(t, lang), end = n - TAIL;
    return {
      beats: n / 15, reads: readTime(t, lang),
      cues: [{ beat: TYPE0 / 15, kind: 'accent' }, { beat: end / 15, kind: 'land' }],
      motion: [], settled: (end + 10) / 15, shots: 1, peakAt: 0.5, pause: { from: (end + 10) / 15, to: n / 15 },
    };
  },
  validate: () => [],
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, text: pick(s.text, lang) || '', caption: pick(s.caption, lang) };
    const N = graphemes(S.text).length, end = TYPE0 + N * cpf(lang);
    return { S, N, end };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, c0 = s.colors, f = u * 15, c = { ...c0 }, hi = mix(c0.accent, '#ffffff', 0.35), look = { ...S, colors: c };
    const appear = ramp(f, 0, 2, 'linear'), land = ramp(f, 0, 20, 'snappy'), sc = lerp(1.25, 1, land), defocus = 6 * (1 - ramp(f, 0, 14, 'out'));
    const typed = clamp((f - TYPE0) / (D.end - TYPE0));
    const caret = ramp(f, 2, 2, 'linear') * (1 - ramp(f, D.end + 2, 8, 'out'));
    const g = 1 - ramp(f, 10, D.end + 8 - 10, 'smooth');
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    const blob = (x, y, rx, ry, stops) => { ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); stops.forEach(([k, col]) => gr.addColorStop(k, col)); ctx.fillStyle = gr; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore(); };
    // the light behind the pill (it recedes to a little warmth), a few soft lights for the frost to blur, the floor
    blob(1330, 470, 550, 450, [[0, rgba(hi, 0.15 + 0.6 * g)], [0.18, rgba(hi, 0.1 + 0.42 * g)], [0.4, rgba(c.accent, 0.06 + 0.26 * g)], [0.62, rgba(c.accent, 0.02 + 0.08 * g)], [0.8, rgba(c.accent, 0)]]);
    [[520, 470, 220, mix(c.panel, '#ffffff', 0.5), 0.9], [820, 620, 160, mix(c.accent, c.panel, 0.5), 0.35], [1460, 610, 200, mix(hi, c.panel, 0.4), 0.55]].forEach(([x, y, r, col, a], i) => blob(x + Math.sin(f / 40 + i) * 6, y, r, r, [[0, rgba(col, a * 0.5)], [0.7, rgba(col, 0)]]));
    ctx.save(); ctx.globalAlpha = appear; blob(PX + PW * 0.35 + PW * 0.75 * 0.6, PY + PH * 0.9 + 44, PW * 0.375, 88, [[0, rgba(c.accent, 0.22 * g)], [0.72, rgba(c.accent, 0)]]); ctx.restore();
    // the pill: lands from 1.25 ×, out of focus for the first frames
    ctx.save(); ctx.globalAlpha = appear;
    ctx.translate(960, 540); ctx.scale(sc, sc); ctx.translate(-960, -540);
    if (defocus > 0.05) ctx.filter = `blur(${(defocus * sc).toFixed(2)}px)`;
    ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.4); ctx.shadowBlur = 70; ctx.shadowOffsetY = lerp(60, 36, land) - 28;
    drawField(ctx, PX, PY, PW, PH, { focus: 1, typed, glow: g, caret, wave: f * 0.5 }, look, { form: 'pill', text: S.text, button: 'voice', icon: 'none', size: 56, ring: false });
    ctx.restore();
    ctx.restore();
    if (S.caption) {
      const cf = fontFor(S.look || NEUTRAL, 'text', S.lang, 30, 560);
      text(ctx, S.caption, 960, 1080 - 112 - 17, cf, { color: c.dim, align: 'center', baseline: 'middle', alpha: ramp(f, 4, 16, 'out') * (0.9 + 0.05 + 0.05 * Math.sin(f / 22)) });
    }
  },
  // the caret's centre on screen (it leads the text; the pill's landing scale included)
  track(u, s, cx, D) {
    const f = u * 15, S = D.S, land = ramp(f, 0, 20, 'snappy'), sc = lerp(1.25, 1, land);
    const shown = graphemes(S.text).slice(0, Math.floor(clamp((f - TYPE0) / (D.end - TYPE0)) * D.N + 1e-6)).join('');
    const tw = shown ? measure(scratch(), shown, fontFor(S.look || NEUTRAL, 'text', S.lang, 56, 500)).width : 0, x = PX + 58 + tw + 4 + 2;
    return [[960 + sc * (x - 960), 540]];
  },
};

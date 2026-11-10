// name-stamp — the opening's first beat states the name: a crosshair draws itself, the name presses in grapheme by
// grapheme with an accent glint under each, a mono kicker types itself, the whole lockup holds a full second and
// lifts away.
// Adapted from video-shotcraft demos/typography/brand-ink-open/BrandInkOpen.tsx (card references/shots/opening/brand-ink-open.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the name and the kicker are the film's slots
// (graphemes from lang.js, the kicker's case from the look); the hold is computed from reading time and never under one
// second; the exit is optional (`exit`), for a scene that hands off with its own transition; colours by role (ink,
// dim, the accent for the crosshair, glint and cursor); the serif letterpress face is the look's display role; brand
// name and motto removed.
import { clamp, rgba, rrect, ground, fontOf, measure, text } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { ramp } from '../../ease.js';
import { fontFor, graphemes, caseOf, readTime, units } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const press = bez(0.2, 0.7, 0.25, 1), draw = bez(0.3, 0, 0.2, 1), out = bez(0.4, 0, 0.5, 1);
// frames at 30 fps: crosshair 0–18 (fades 24–34), graphemes from 10 every 3 for 12, kicker from 28, exit 7
const K = { v: [0, 9], h: [8, 18], fade: [24, 34], name0: 10, each: 3, dur: 12, kick0: 28, exit: 7, hold: 30 };
const perChar = (lang) => (lang === 'zh' ? 1.5 : 0.7);

// The timeline of one set of slots: when the name completes, when the kicker is typed, when the exit starts.
const timeline = (s, lang) => {
  const g = graphemes(s.name).length, k = graphemes(s.kicker || '').length;
  const nameDone = K.name0 + (g - 1) * K.each + K.dur, kickDone = K.kick0 + k * perChar(lang);
  const read = Math.round((readTime(s.name, lang) + (s.kicker ? readTime(s.kicker, lang) : 0)) * 30);
  const hold = Math.max(K.hold, read - (Math.max(nameDone, kickDone) - K.name0));
  const exitAt = Math.max(nameDone, kickDone) + hold;
  return { nameDone, kickDone, exitAt, end: exitAt + (s.exit ? K.exit : 0) };
};

export default {
  id: 'name-stamp', kind: 'scene',
  fits: ['hook', 'lockup'],
  surface: ['canvas'],
  beats: { min: 5, max: 9 },
  needs: { motions: [], props: [], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', sample: 'product', limits: { en: { words: 2, chars: 16 }, zh: { chars: 7 } } },
    kicker: { type: 'text', tier: 'glance', sample: 'claim', limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } }, optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  summary: 'The name is stated first: a crosshair draws itself, the name presses in letter by letter with a glint under each, a kicker types itself, the lockup holds a full second and lifts away.',
  defaults: () => ({ name: null, kicker: null, size: null, exit: true, cross: true }),
  plan(s, ctx) {
    const T = timeline(s, ctx.lang), beats = Math.ceil((T.end / 15) * 2) / 2;
    return { beats, reads: [{ text: s.name, lang: ctx.lang, tier: 'primary' }].concat(s.kicker ? [{ text: s.kicker, lang: ctx.lang, tier: 'glance' }] : []),
      cues: [{ beat: (K.name0 + K.dur) / 15, kind: 'land' }].concat(s.exit ? [{ beat: T.exitAt / 15, kind: 'turn' }] : []),
      motion: 'press-in by grapheme; lift out', settled: T.nameDone / 15, peakAt: T.nameDone / 15, pause: (T.exitAt - Math.max(T.nameDone, T.kickDone)) / 15 };
  },
  validate(s, ctx) {
    const e = [];
    if (!s.name) e.push('name: required');
    else if (units(s.name, ctx.lang) > (ctx.lang === 'zh' ? 7 : 2)) e.push('name: too long');
    return e;
  },
  prepare(s, ctx) {
    const look = s.look || NEUTRAL, lang = ctx.lang, gs = graphemes(s.name);
    const size = s.size || (lang === 'zh' ? 132 : Math.min(150, 1500 / Math.max(4, gs.length) * 1.6));
    const f = fontFor(look, 'display', lang, size, 650, 'display'), sc = document.createElement('canvas').getContext('2d');
    const total = measure(sc, s.name, f).width, x0 = 960 - total / 2;
    const xs = gs.map((_, i) => x0 + measure(sc, gs.slice(0, i).join(''), f).width), ws = gs.map((g) => measure(sc, g, f).width);
    const kc = caseOf(s.kicker || '', look, 'label', lang), kf = { ...fontFor(look, 'mono', lang, lang === 'zh' ? 30 : 26, 500), spacing: kc.tracking * (lang === 'zh' ? 30 : 26) };
    const kg = graphemes(kc.text), kw = measure(sc, kc.text, kf).width;
    return { f, size, gs, xs, ws, kg, kf, kw, T: timeline(s, lang), base: 540 + size * 0.36 };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, fr = u * 15, T = D.T, lang = ctx.lang;
    ground(ctx2d, s);
    const o = s.exit ? ramp(fr, T.exitAt, K.exit, out) : 0;
    ctx2d.save();
    ctx2d.globalAlpha = 1 - o;
    ctx2d.translate(960, 540); ctx2d.scale(1 - 0.12 * o, 1 - 0.12 * o); ctx2d.translate(-960, -540 + 40 * o);
    // the crosshair, drawn by an invisible pen in the accent, faded before the name is complete
    const cy = D.base - D.size - 34 - 32, fade = 1 - ramp(fr, K.fade[0], K.fade[1] - K.fade[0], 'linear');
    if (s.cross && fade > 0) {
      const v = ramp(fr, K.v[0], K.v[1] - K.v[0], draw), h = ramp(fr, K.h[0], K.h[1] - K.h[0], 'linear');
      ctx2d.save(); ctx2d.globalAlpha *= fade; ctx2d.strokeStyle = c.accent; ctx2d.lineWidth = 5; ctx2d.lineCap = 'round';
      if (v > 0) { ctx2d.beginPath(); ctx2d.moveTo(960, cy - 30); ctx2d.lineTo(960, cy - 30 + 60 * v); ctx2d.stroke(); }
      if (h > 0) { ctx2d.beginPath(); ctx2d.moveTo(930, cy); ctx2d.lineTo(930 + 60 * h, cy); ctx2d.stroke(); }
      ctx2d.restore();
    }
    // the name: each grapheme presses from 1.6× to 1 about its foot, blur 6 → 0, an accent glint under it as it lands
    D.gs.forEach((g, i) => {
      const d = K.name0 + i * K.each, t = ramp(fr, d, K.dur, press);
      if (t <= 0) return;
      const sc = 1.6 - 0.6 * t, x = D.xs[i] + D.ws[i] / 2;
      ctx2d.save(); ctx2d.translate(x, D.base); ctx2d.scale(sc, sc);
      if (t < 1) ctx2d.filter = `blur(${((1 - t) * 6).toFixed(2)}px)`;
      text(ctx2d, g, 0, 0, D.f, { color: c.ink, align: 'center', alpha: t });
      ctx2d.restore();
      const gl = 1 - Math.min(1, Math.abs(fr - (d + K.dur)) / 4);
      if (gl > 0) { ctx2d.fillStyle = rgba(c.accent, gl); rrect(ctx2d, x - (D.ws[i] * gl) / 2, D.base + 12, D.ws[i] * gl, 2, 1); ctx2d.fill(); }
    });
    // the kicker, typed, with a block cursor that blinks after it until the exit
    if (s.kicker && fr >= K.kick0) {
      const n = Math.min(D.kg.length, Math.floor((fr - K.kick0) / perChar(lang))), shown = D.kg.slice(0, n).join('');
      const ky = D.base + 30 + 46, kx = 960 - D.kw / 2;
      text(ctx2d, shown, kx, ky, D.kf, { color: c.dim });
      const typing = fr < T.kickDone, blink = Math.floor((fr - T.kickDone) / 2) % 2 === 0, on = typing || (blink && fr < T.exitAt - 2);
      if (on) { ctx2d.fillStyle = rgba(c.accent, 0.85); ctx2d.fillRect(kx + measure(ctx2d, shown, D.kf).width + 4, ky - 22, 14, 24); }
    }
    ctx2d.restore();
  },
  // 0: [the first grapheme's press scale × 1000, 0]; 1: the lockup's centre as it lifts out
  track(u, s, ctx, D) {
    const fr = u * 15, t = ramp(fr, K.name0, K.dur, press), o = s.exit ? ramp(fr, D.T.exitAt, K.exit, out) : 0;
    return [[(1.6 - 0.6 * t) * 1000, 0], [960, 540 - 40 * o]];
  },
  blur() { return false; },
};

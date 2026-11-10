// orbit-title — a two-level title centred inside a ring of content cards that orbits it; the key line arrives letter by
// letter out of a blur, a highlighter sweeps it and turns its letters to the ground's ink, a kicker floats up.
// Adapted from video-shotcraft demos/opening/orbit-ring-title-open/OrbitRingTitleOpen.tsx (card references/shots/opening/orbit-ring-title-open.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the eight animated demo tiles are the film's
// cards (`cards`: images, or neutral sample cards), still; the lines are slots with limits per language, entering by
// grapheme; the highlighter is the accent and the letters it covers turn `onAccent`; the marker spring is the runtime
// spring; colours by role; the brand mark, wordmark, code name and the Chinese demo lines removed; the optional exit
// blur kept as `exit`.
import { clamp, mix, rgba, rrect, ground, text, measure } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, graphemes, readTime, units } from '../../lang.js';
import { look as NEUTRAL, card as sampleCard, infoSize } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';

// frames at 30 fps (upstream): ring opens 0–24, orbit line 0–30, line 1 from 10 (1 a grapheme), line 2 from 18
// (2 a grapheme), marker from 50, kicker 60–76; the rest is hold
const R = { rx: 720, ry: 380, cw: 400, ch: 225, n: 8, speed: 0.3, from: 0.62, depth: 0.12 };
// the orbit's angle (rad) at frame fr: constant speed; unless `loop`, it brakes to a stop over the last 24 frames
const angleAt = (fr, end, loop) => { const fb = end - 24; if (loop || fr <= fb) return (fr / 30) * R.speed; const v = Math.min(1, (fr - fb) / 24); return ((fb + 24 * (v - (v * v) / 2)) / 30) * R.speed; };
const L1 = { at: 10, each: 1, dur: 27 }, L2 = { at: 18, each: 2, dur: 32 }, MARK = 50, KICK = 60;

export default {
  id: 'orbit-title', kind: 'scene',
  fits: ['hook', 'claim', 'lockup'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { motions: ['marker-stroke'], props: ['tile-card'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    cards: { type: 'list', count: [6, 10], of: { image: { type: 'image', crop: true, optional: true } } },
    lead: { type: 'text', tier: 'glance', sample: 'titleLong', limits: { en: { words: 7, chars: 40 }, zh: { chars: 14 } } },
    key: { type: 'text', tier: 'primary', claim: true, sample: 'claim', limits: { en: { words: 5, chars: 24 }, zh: { chars: 9 } } },   // drawn at up to 140 px (zh 150), fitted to 1000 px
    kicker: { type: 'text', tier: 'glance', sample: 'subtitle', limits: { en: { words: 6, chars: 32 }, zh: { chars: 16 } }, optional: true },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'A two-level title sits inside a ring of content cards orbiting it; the key line arrives out of a blur, a highlighter sweeps it and turns its letters dark, a kicker floats up.',
  defaults: () => ({ cards: null, lead: null, key: null, kicker: null, exit: false, loop: false }),
  plan(s, ctx) {
    const n2 = graphemes(s.key || '').length, keyDone = L2.at + (n2 - 1) * L2.each + L2.dur * 0.6;
    const read = (readTime(s.lead || '', ctx.lang) + readTime(s.key || '', ctx.lang)) * 30;
    const end = Math.max(MARK + 16, keyDone) + Math.max(30, read * 0.6) + 16 + (s.exit ? 12 : 0);
    const beats = clamp(Math.ceil(end / 7.5) / 2, this.beats.min, this.beats.max);
    return { beats, reads: [{ text: s.lead, lang: ctx.lang, tier: 'glance' }, { text: s.key, lang: ctx.lang, tier: 'primary' }], cues: [{ beat: MARK / 15, kind: 'accent' }, { beat: 1.6, kind: 'land' }],
      motion: 'ring orbit (constant)', settled: (KICK + 16) / 15, peakAt: MARK / 15, pause: beats - (KICK + 16) / 15 };
  },
  validate(s, ctx) {
    const e = [], n = s.cards ? s.cards.length : 8;
    if (n < 6 || n > 10) e.push(`cards: ${n} (6–10)`);
    if (!s.key) e.push('key: required');
    else if (units(s.key, ctx.lang) > (ctx.lang === 'zh' ? 9 : 5)) e.push('key: too long');
    return e;
  },
  prepare(s, ctx) {
    const look = s.look || NEUTRAL, lang = ctx.lang, c = s.colors, n = s.cards ? s.cards.length : R.n;
    // each card once, 1.5× for the near ones
    const faces = Array.from({ length: n }, (_, i) => {
      const cv = document.createElement('canvas'); cv.width = R.cw * 1.5; cv.height = R.ch * 1.5;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.scale(1.5, 1.5);
      const img = s.cards?.[i]?.image;
      if (img && img.width) { const k = Math.max(R.cw / img.width, R.ch / img.height); g.drawImage(img, (R.cw - img.width * k) / 2, (R.ch - img.height * k) / 2, img.width * k, img.height * k); }
      else { g.fillStyle = c.panel; g.fillRect(0, 0, R.cw, R.ch); sampleCard(g, i, [0, 0, R.cw, R.ch], { lang, colors: c, target: i % 3 === 1 }); }
      return cv;
    });
    const sc = document.createElement('canvas').getContext('2d');
    // the key line at 150 / 140 px, smaller when it would pass 1000 px (it must stay inside the ring)
    const s1 = lang === 'zh' ? 60 : 56, b2 = lang === 'zh' ? 150 : 140, w2 = measure(sc, s.key || '', fontFor(look, 'display', lang, b2, 680, 'display')).width;
    const s2 = Math.max(lang === 'zh' ? 96 : 88, Math.min(b2, Math.floor((b2 * 1000) / Math.max(1, w2))));
    const f1 = fontFor(look, 'text', lang, s1, 500), f2 = fontFor(look, 'display', lang, s2, 680, 'display'), fk = fontFor(look, 'mono', lang, infoSize(lang) + 1, 600);
    const lay = (str, f) => { const gs = graphemes(str || ''), w = measure(sc, str || '', f).width, x0 = 960 - w / 2; return { gs, w, x0, xs: gs.map((_, i) => x0 + measure(sc, gs.slice(0, i).join(''), f).width) }; };
    return { end: this.plan(s, ctx).beats * 15, exitAt: this.plan(s, ctx).beats * 15 - 12, faces, n, f1, f2, fk, s1, s2, l1: lay(s.lead, f1), l2: lay(s.key, f2), y1: 430, y2: 430 + s1 * 0.4 + 34 + s2 * 0.82 };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, fr = u * 15, t = fr / 30;
    ground(ctx2d, s);
    const ringIn = ramp(fr, 0, 24, 'snappy'), rs = R.from + (1 - R.from) * ringIn, rot = angleAt(fr, D.end, s.loop), push = 1 + 0.025 * ramp(fr, 40, 70, 'smooth');
    const exitQ = s.exit ? ramp(fr, D.exitAt, 10, 'exit') : 0;
    ctx2d.save(); ctx2d.translate(960, 540); ctx2d.scale(push, push); ctx2d.translate(-960, -540);
    // the orbit drawn on
    const track = ramp(fr, 0, 30, 'out');
    if (track > 0) { ctx2d.beginPath(); ctx2d.ellipse(960, 540, R.rx * rs, R.ry * rs, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * track); ctx2d.strokeStyle = rgba(c.accent, 0.16); ctx2d.lineWidth = 1.5; ctx2d.stroke(); }
    // the cards, far first: ±12 % scale, darker and softer far away, a shadow that grows near
    const cards = Array.from({ length: D.n }, (_, i) => { const th = -Math.PI / 2 + (i * Math.PI * 2) / D.n + rot; return { i, th, depth: Math.sin(th) }; }).sort((a, b) => a.depth - b.depth);
    const scrim = () => {
      const rg = ctx2d.createRadialGradient(960, 530, 0, 960, 530, 700);
      rg.addColorStop(0, rgba(mix(c.ground, '#000000', 0.5), 0.82)); rg.addColorStop(0.45, rgba(mix(c.ground, '#000000', 0.5), 0.55)); rg.addColorStop(1, rgba(c.ground, 0));
      ctx2d.save(); ctx2d.translate(960, 530); ctx2d.scale(1, 0.4); ctx2d.translate(-960, -530); ctx2d.fillStyle = rg; ctx2d.fillRect(0, -500, 1920, 2100); ctx2d.restore();
    };
    for (const k of cards) {
      const sc = 1 + R.depth * k.depth, op = ramp(fr, 2 + k.i * 1.5, 11, 'out'), grow = 0.9 + 0.1 * op, far = Math.max(0, -k.depth), w = R.cw * sc * grow, h = R.ch * sc * grow;
      if (op <= 0) continue;
      const x = 960 + Math.cos(k.th) * R.rx * rs, y = 540 + Math.sin(k.th) * R.ry * rs, elev = 14 + 12 * k.depth;
      ctx2d.save(); ctx2d.globalAlpha = op;
      ctx2d.shadowColor = rgba('#000000', 0.45 + 0.2 * k.depth); ctx2d.shadowBlur = elev * 1.6; ctx2d.shadowOffsetY = elev * 0.6;
      rrect(ctx2d, x - w / 2, y - h / 2, w, h, 14); ctx2d.fillStyle = c.panel; ctx2d.fill(); ctx2d.shadowColor = 'transparent';
      ctx2d.clip();
      if (far > 0.05) ctx2d.filter = `blur(${(far * 1.6).toFixed(2)}px)`;
      ctx2d.drawImage(D.faces[k.i], x - w / 2, y - h / 2, w, h); ctx2d.filter = 'none';
      ctx2d.fillStyle = rgba(mix(c.ground, '#000000', 0.5), 0.25 * far + 0.25 * far); ctx2d.fillRect(x - w / 2, y - h / 2, w, h);
      ctx2d.restore();
      ctx2d.save(); ctx2d.globalAlpha = op; rrect(ctx2d, x - w / 2, y - h / 2, w, h, 14); ctx2d.strokeStyle = c.line; ctx2d.lineWidth = 1; ctx2d.stroke(); ctx2d.restore();
    }
    scrim();
    // the title: graphemes arrive out of a blur, travel only in the first third
    ctx2d.save(); if (exitQ > 0) { ctx2d.globalAlpha = 1 - exitQ; ctx2d.filter = `blur(${(exitQ * 6.5).toFixed(2)}px)`; }
    const glyph = (g, x, y, f, size, at, dur, color) => {
      const pm = ramp(fr, at, dur, 'out'), pt = ramp(fr, at, dur / 3, 'out'); if (pm <= 0) return;
      ctx2d.save(); if (pm < 1) ctx2d.filter = `blur(${((1 - pm) * (size / 6)).toFixed(2)}px)`;
      text(ctx2d, g, x, y + (1 - pt) * size * 0.22, f, { color, alpha: pm }); ctx2d.restore();
    };
    D.l1.gs.forEach((g, i) => glyph(g, D.l1.xs[i], D.y1, D.f1, D.s1, L1.at + i * L1.each, L1.dur, mix(c.ink, c.dim, 0.35)));
    // the highlighter under the key line; letters it has passed are drawn onAccent
    const m = Math.min(1.03, springAt(fr - MARK, { stiffness: 190, damping: 20 })), pad = 0.14 * D.s2, bw = D.l2.w + 2 * pad;
    const edge = D.l2.x0 - pad + bw * Math.min(1, m);
    if (m > 0.001) {
      ctx2d.save(); ctx2d.shadowColor = rgba(c.accent, 0.28); ctx2d.shadowBlur = 60;
      rrect(ctx2d, D.l2.x0 - pad, D.y2 - D.s2 * 0.86, bw * m, D.s2 * 1.06, 8); ctx2d.fillStyle = c.accent; ctx2d.fill(); ctx2d.restore();
    }
    for (const [clipL, clipR, col] of [[edge, 1920, c.ink], [0, edge, c.onAccent]]) {
      ctx2d.save(); ctx2d.beginPath(); ctx2d.rect(clipL, 0, clipR - clipL, 1080); ctx2d.clip();
      D.l2.gs.forEach((g, i) => glyph(g, D.l2.xs[i], D.y2, D.f2, D.s2, L2.at + i * L2.each, L2.dur, col));
      ctx2d.restore();
    }
    if (s.kicker) { const k = ramp(fr, KICK, 16, 'out'); if (k > 0) text(ctx2d, s.kicker, 960, D.y2 + 40 + D.s2 * 0.3 + 30 + (1 - k) * 12, D.fk, { color: c.dim, align: 'center', alpha: k }); }
    ctx2d.restore();
    ctx2d.restore();
  },
  // 0: the first card's centre (the orbit); 1: [highlighter share × 1000, 0]
  track(u, s, ctx, D) {
    const fr = u * 15, rs = R.from + (1 - R.from) * ramp(fr, 0, 24, 'snappy'), th = -Math.PI / 2 + angleAt(fr, D.end, s.loop), push = 1 + 0.025 * ramp(fr, 40, 70, 'smooth');
    return [[960 + Math.cos(th) * R.rx * rs * push, 540 + Math.sin(th) * R.ry * rs * push], [Math.min(1.03, springAt(fr - MARK, { stiffness: 190, damping: 20 })) * 1000, 0]];
  },
  blur() { return false; },
};

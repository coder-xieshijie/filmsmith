// theme-reveal — the same interface changes theme in front of you: the next theme spreads over the current one from a
// point as a circle with a white-hot rim (ripple; optionally a command panel first collapses into that point like a
// television switching off), or crosses the frame behind a 15° edge with a hot core line (sweep).
// Adapted from video-shotcraft demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx and
// demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx (card references/shots/interaction/theme-switch-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the two themes are the caller's scene painted with
// two palettes of one look (the brick never inverts colours); rim, glow and edge bands by role (white core, the
// accents of the two palettes for the glows); brand, the gallery and calendar fixtures, demo copy and the camera
// removed (the camera and the "lights come on" aftermath are the scene's); the command panel is a neutral one.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { painterOf, palette, look, infoSize } from '../../sample.js';

const W = 1920, H = 1080, T15 = Math.tan((15 * Math.PI) / 180);
const RIPPLE_EASE = bez(0.2, 0.55, 0.3, 1), SWEEP_EASE = bez(0.3, 0, 0.35, 1);
// frames of the ripple with a panel (upstream 47 → 95): squash, line, dot, ripple, end
const K = { squash: 1, line: 5, dot: 9, ripple: 14, end: 48 };
const KP = { squash: -99, line: -99, dot: -99, ripple: 0, end: 34 };   // from a point: the ripple at once
const SW = { start: 0, frames: 64, end: 66 };
const COPY = {
  query: { en: 'dark', zh: '深色' },
  rows: { en: ['Use the dark theme', 'Follow the system', 'Theme settings'], zh: ['使用深色主题', '跟随系统', '主题设置'] },
  hint: { en: 'Enter to run', zh: '回车执行' },
};
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);

const framesOf = (P) => (P.shape === 'sweep' ? SW.end : P.panel ? K.end : KP.end + 2);
const keysOf = (P) => (P.panel ? K : KP);

// The neutral command panel at [x, y, w, h]: a query row with the typed word and caret, three results (the first
// selected in the accent), a hint foot. alpha: content opacity.
const panelFace = (ctx, [x, y, w, h], P, c, alpha = 1) => {
  const lang = P.lang, q = pick(P.query ?? COPY.query, lang), rows = pick(P.rows ?? COPY.rows, lang);
  rrect(ctx, x, y, w, h, 22); ctx.fillStyle = c.panel; ctx.fill();
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  rrect(ctx, x, y, w, h, 22); ctx.clip();
  const qf = fontFor(look, 'text', lang, 46, 550), rf = fontFor(look, 'text', lang, 32, 520), hf = fontFor(look, 'text', lang, infoSize(lang), 500);
  ctx.strokeStyle = c.line; ctx.lineWidth = 2;                                          // search glyph
  ctx.beginPath(); ctx.arc(x + 51, y + 49, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 61, y + 59); ctx.lineTo(x + 70, y + 68); ctx.stroke();
  text(ctx, q, x + 92, y + 52, qf, { color: c.ink, baseline: 'middle' });
  const qw = measure(ctx, q, qf).width;
  ctx.fillStyle = c.accent; ctx.fillRect(x + 96 + qw, y + 27, 3, 50);
  ctx.fillStyle = c.line; ctx.fillRect(x, y + 104, w, 1);
  rows.forEach((r, i) => {
    const ry = y + 118 + i * 88;
    if (i === 0) { rrect(ctx, x + 16, ry, w - 32, 82, 16); ctx.fillStyle = c.accent; ctx.fill(); }
    rrect(ctx, x + 36, ry + 16, 50, 50, 13); ctx.fillStyle = i === 0 ? rgba(c.onAccent || '#ffffff', 0.2) : mix(c.panel, c.ground, 0.6); ctx.fill();
    text(ctx, r, x + 108, ry + 42, rf, { color: i === 0 ? c.onAccent || '#ffffff' : c.ink, baseline: 'middle', alpha: i === 0 ? 1 : 0.6 });
  });
  ctx.fillStyle = mix(c.panel, c.ground, 0.5); ctx.fillRect(x, y + h - 52, w, 52);
  text(ctx, pick(P.hint ?? COPY.hint, lang), x + 34, y + h - 25, hf, { color: c.dim, baseline: 'middle' });
  ctx.restore();
};

export default {
  id: 'theme-reveal', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 3.2,
  beatsFor: (P) => framesOf(P) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  from: 'an interface in one theme (with a command panel open over it, for the ripple from a panel)',
  to: 'the same interface, same layout, in the other theme',
  interpolates: ['panel scale y 1 → 0.012 (4 f, ease in), then x 1 → 0.008 (4 f), a white dot held 5 f', 'ripple radius 6 → 1.1 × the farthest corner (34 f, bezier .2 .55 .3 1), the new theme scaled 1.035 → 1', 'sweep edge x 1960 → −480 at 15° (64 f, bezier .3 0 .35 1), its bands widening with speed'],
  summary: 'The same interface changes theme in front of you: a ripple from a point (a panel may collapse into it first) or a 15° sweep with a hot edge.',
  theory: 'Object constancy: when every element keeps its place and only its colours change, the eye reads one interface changing state, not a cut to another page (the identical layouts are the condition; Michotte 1946 on caused change: the ripple leaves the point that caused it).',
  sceneRest: false,
  defaults: (ctx = {}) => ({
    from: { scene: 'page', palette: 'neutral-light' }, to: { scene: 'page', palette: 'neutral-dark' },
    shape: 'ripple', origin: [960, 452], panel: { rect: [470, 242, 980, 420] }, angle: 15, sweep: { from: 1960, to: -480 },
  }),
  prepare(P) {
    const side = (v) => painterOf(v && v.palette ? { ...v, colors: palette(v.palette) } : v, P);
    const toC = P.to?.palette ? palette(P.to.palette) : P.colors, fromC = P.from?.palette ? palette(P.from.palette) : P.colors;
    const [ox, oy] = P.origin, far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - ox, y - oy)));
    return { from: side(P.from), to: side(P.to), toC, fromC, maxR: far * 1.1, F: framesOf(P) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.F;
    if (P.shape === 'sweep') {
      const at = (g) => lerp(P.sweep.from, P.sweep.to, SWEEP_EASE(clamp((g - SW.start) / SW.frames)));
      const pos = at(f), v = Math.abs(at(f + 0.5) - at(f - 0.5));
      const edge = clamp((f - SW.start) / 3) * (1 - clamp((f - (SW.start + SW.frames - 8)) / 8));
      return { p, f, pos, streak: Math.min(1, v / 110), edge, done: f >= SW.start + SW.frames };
    }
    const k = keysOf(P), panel = !!P.panel;
    const sy = panel ? lerp(1, 0.012, ramp(f, k.squash, k.line - k.squash, 'exit')) : 0;
    const sx = panel ? lerp(1, 0.008, ramp(f, k.line, k.dot - k.line, 'exit')) : 0;
    const content = panel ? 1 - ramp(f, k.squash, 3, 'linear') : 0, glare = panel ? ramp(f, k.squash, k.line - k.squash, 'linear') : 0;
    const dim = panel ? 1 - ramp(f, k.squash, k.dot - k.squash, 'swift') : 0;
    const dotOn = panel && f >= k.line + 2 && f < k.ripple + 4;
    const dotA = f < k.dot ? ramp(f, k.line + 2, k.dot - k.line - 2, 'linear') : 1 - ramp(f, k.ripple, 4, 'linear');
    const pulse = f >= k.dot && f < k.ripple ? 1 + 0.18 * Math.sin((f - k.dot) * 0.9) : 1;
    const smear = 0.4 + 0.6 * (1 - ramp(f, k.dot, k.ripple - k.dot + 4, 'out'));
    const rAt = (s) => lerp(6, D.maxR, RIPPLE_EASE(clamp((f - s) / (k.end - k.ripple))));
    const r = rAt(k.ripple), r2 = rAt(k.ripple + 4) * 0.96;
    const ring = 1 - ramp(f, k.ripple + 6, k.end - k.ripple - 6, 'out');
    const scale = lerp(1.035, 1, ramp(f, k.ripple, 26, 'snappy'));
    return { p, f, sx, sy, content, glare, dim, panelOn: panel && f < k.dot, dotOn, dotA, pulse, smear, r, r2, ring, scale, dark: f >= k.ripple, done: f >= k.end };
  },
  paint(ctx, S, P, D) {
    if (P.shape === 'sweep') return sweep(ctx, S, P, D);
    const [ox, oy] = P.origin, c = D.toC, cf = D.fromC;
    if (!S.done) {
      ctx.save();
      if (S.dim > 0.01) ctx.filter = `blur(${(S.dim * 7).toFixed(2)}px)`;
      D.from(ctx);
      ctx.restore();
      if (S.dim > 0.001) {
        const g = ctx.createRadialGradient(960, 454, 0, 960, 454, 1100);
        g.addColorStop(0, rgba(mix(cf.ink, '#000000', 0.5), 0.3 * S.dim)); g.addColorStop(1, rgba(mix(cf.ink, '#000000', 0.6), 0.55 * S.dim));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }
    if (S.dark) {
      ctx.save();
      if (!S.done) { ctx.beginPath(); ctx.arc(ox, oy, S.r, 0, Math.PI * 2); ctx.clip(); }
      ctx.translate(ox, oy); ctx.scale(S.scale, S.scale); ctx.translate(-ox, -oy);
      D.to(ctx);
      ctx.restore();
      if (!S.done && S.ring > 0.001) {
        ctx.save();
        ctx.beginPath(); ctx.arc(ox, oy, S.r2, 0, Math.PI * 2); ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(mix('#ffffff', c.accent, 0.3), 0.5 * 0.6 * S.ring); ctx.stroke();
        ctx.globalAlpha = S.ring;
        for (const [blur, a, w] of [[90, 0.22, 40], [34, 0.55, 12]]) { ctx.shadowColor = rgba(c.accent, a); ctx.shadowBlur = blur; ctx.beginPath(); ctx.arc(ox, oy, S.r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = rgba(c.accent, a); ctx.stroke(); }
        ctx.shadowColor = rgba('#ffffff', 0.3); ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(ox, oy, Math.max(1, S.r - 1.5), 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = rgba(mix('#ffffff', c.accent, 0.04), 0.95); ctx.stroke();
        ctx.restore();
      }
    }
    if (S.dotOn) {
      ctx.save(); ctx.globalAlpha = clamp(S.dotA);
      const sw = 840 * S.smear, g = ctx.createLinearGradient(ox - sw / 2, 0, ox + sw / 2, 0);
      g.addColorStop(0, rgba('#ffffff', 0)); g.addColorStop(0.3, rgba(c.accent, 0.5)); g.addColorStop(0.5, rgba(mix('#ffffff', c.accent, 0.03), 0.95)); g.addColorStop(0.7, rgba(c.accent, 0.5)); g.addColorStop(1, rgba('#ffffff', 0));
      ctx.globalAlpha = clamp(S.dotA) * 0.8; ctx.filter = 'blur(1.5px)'; ctx.fillStyle = g; rrect(ctx, ox - sw / 2, oy - 3, sw, 6, 3); ctx.fill(); ctx.filter = 'none';
      ctx.globalAlpha = clamp(S.dotA);
      const rd = 13 * S.pulse;
      for (const [blur, col] of [[120, rgba('#ffffff', 0.4)], [36, rgba(c.accent, 0.75)]]) { ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.beginPath(); ctx.arc(ox, oy, rd, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); }
      ctx.shadowColor = 'transparent'; ctx.beginPath(); ctx.arc(ox, oy, rd + 5, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.stroke();
      ctx.restore();
    }
    if (S.panelOn) {
      const [x, y, w, h] = P.panel.rect, cx = x + w / 2, cy = y + h / 2;
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(S.sx, S.sy); ctx.translate(-cx, -cy);
      if (S.glare > 0) {
        ctx.shadowColor = rgba('#ffffff', 0.4 + 0.4 * S.glare); ctx.shadowBlur = 30 + 60 * S.glare;
        rrect(ctx, x, y, w, h, 22 * Math.min(1, S.sy * 6)); ctx.fillStyle = mix(cf.panel, '#ffffff', S.glare); ctx.fill();
        ctx.shadowColor = rgba(c.accent, 0.35 * S.glare); ctx.shadowBlur = 120; ctx.fill(); ctx.shadowColor = 'transparent';
      } else {
        ctx.shadowColor = rgba(mix(cf.ink, '#000000', 0.7), 0.45); ctx.shadowBlur = 90; ctx.shadowOffsetY = 40;
        rrect(ctx, x, y, w, h, 22); ctx.fillStyle = cf.panel; ctx.fill(); ctx.shadowColor = 'transparent';
      }
      panelFace(ctx, [x, y, w, h], P, { ...cf, panel: mix(cf.panel, '#ffffff', S.glare) }, S.content);
      ctx.restore();
    }
  },
  blur(p, P) { return P.shape === 'sweep'; },
  track(S, P) {
    const [ox, oy] = P.origin;
    if (P.shape === 'sweep') return [[S.pos + 540 * T15, 540]];
    const [, , w, h] = P.panel ? P.panel.rect : [0, 0, 0, 0];
    return [[ox + (S.dark ? S.r : 6), oy], [ox, oy - (h / 2) * (S.panelOn ? S.sy : 0)], [ox + (w / 2) * (S.panelOn ? S.sx : 0), oy]];
  },
};

// The sweep: the next theme on the far side of a 15° edge moving across; a hot core line, a warm band on the near
// side and a cool glow on the far side, both widening with the edge's speed.
function sweep(ctx, S, P, D) {
  const pos = S.pos, xc = pos + 540 * T15, a = (P.angle * Math.PI) / 180, cf = D.fromC, c = D.toC;
  if (!S.done) D.from(ctx);
  if (S.f >= SW.start) {
    ctx.save();
    if (!S.done) { ctx.beginPath(); ctx.moveTo(pos - 400 * T15, -400); ctx.lineTo(2400, -400); ctx.lineTo(2400, 1500); ctx.lineTo(pos + 1500 * T15, 1500); ctx.closePath(); ctx.clip(); }
    D.to(ctx);
    ctx.restore();
  }
  if (S.done || S.edge <= 0.001) return;
  const dusk = 70 + 170 * S.streak, cool = 60 + 140 * S.streak;
  ctx.save(); ctx.globalAlpha = S.edge;
  ctx.translate(xc, 540); ctx.rotate(-a);
  let g = ctx.createLinearGradient(-dusk, 0, 0, 0);
  g.addColorStop(0, rgba(cf.accent, 0)); g.addColorStop(0.6, rgba(cf.accent, 0.06 + 0.08 * S.streak)); g.addColorStop(0.94, rgba(cf.accent, 0.22 + 0.12 * S.streak)); g.addColorStop(1, rgba(mix(cf.ink, '#000000', 0.5), 0.22));
  ctx.fillStyle = g; ctx.fillRect(-dusk, -1100, dusk, 2200);
  g = ctx.createLinearGradient(0, 0, cool, 0);
  g.addColorStop(0, rgba(mix(c.accent, '#ffffff', 0.4), 0.26 + 0.1 * S.streak)); g.addColorStop(0.3, rgba(c.accent, 0.1)); g.addColorStop(1, rgba(c.accent, 0));
  ctx.fillStyle = g; ctx.fillRect(0, -1100, cool, 2200);
  ctx.shadowColor = rgba(cf.accent, 0.5); ctx.shadowBlur = 26; ctx.fillStyle = mix('#ffffff', cf.accent, 0.04); ctx.fillRect(-1.5, -1100, 3, 2200);
  ctx.shadowColor = rgba('#ffffff', 0.9); ctx.shadowBlur = 8; ctx.fillRect(-1.5, -1100, 3, 2200);
  ctx.restore();
}

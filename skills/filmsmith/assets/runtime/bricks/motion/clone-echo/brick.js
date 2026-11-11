// clone-echo — one element copies itself into a file of translucent clones that recede into depth toward a corner,
// holds while they can be counted, then they all rush back into it and it bounces once: "one is many".
// Adapted from video-shotcraft demos/ui-entrance/cloner-depth-echo/ClonerDepthEcho.tsx (card
// references/shots/ui-entrance/cloner-depth-echo.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); every clone is parallel to the screen, so its CSS
// perspective (1500 px, vanishing point up left at 360, 120) is drawn exactly as a scale about that point; the motion
// runs from the element in place (upstream frame 16) to the merged element at rest (112): a press, staggered spring
// clones (2.2 frames apart, 250 px apart in depth, fading from 100 % to 28 % and keeping only an accent outline), a
// slow dolly and drift while they hold, a synchronous ease-in rush back with depth-speed blur, a 1.06 pulse and one
// accent rim on the element; the element is the scene's own painter (a neutral render card by default: the upstream's
// mark, file name, readout and shot names are gone); the ×N counter is optional; dust and grain are dropped.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { springAt } from '../stagger-in/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const F0 = 16, F1 = 112, SPREAD = 24, EACH = 2.2, MERGE = 76, MERGE_DUR = 10, LAND = MERGE + MERGE_DUR, GAP_Z = 250, PERSP = 1500;
const SPARK = [0.62, 0.58, 0.66, 0.52, 0.55, 0.44, 0.48, 0.36, 0.4, 0.3, 0.33, 0.26, 0.3, 0.22];
const spreadOf = (f, i) => (f < SPREAD + (i - 1) * EACH ? 0 : springAt(f - SPREAD - (i - 1) * EACH, { damping: 15, stiffness: 150, mass: 0.9 }));
const mergeOf = (f) => ramp(f, MERGE, MERGE_DUR, 'exit');
const depthOf = (f, i) => spreadOf(f, i) * (1 - mergeOf(f));
const pad = (v) => String(v).padStart(2, '0');

// The sample's element: a neutral render card. o.clone 0 is the element itself (filled, every part); a clone keeps the
// top bar and the line only, its fill fading with depth and its edge in the accent; o.lit lights the eight slots.
const renderCard = (P) => (ctx, [x, y, w, h], o) => {
  const c = P.colors, info = infoSize(P.lang), k = o.clone / o.n, hero = o.clone === 0, fill = hero ? 1 : lerp(0.55, 0.06, k);
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, rgba(mix(c.panel, c.accent, 0.06), fill)); g.addColorStop(0.6, rgba(c.panel, fill)); g.addColorStop(1, rgba(mix(c.panel, '#000000', 0.3), fill));
  ctx.save();
  if (!hero) { ctx.shadowColor = rgba(c.accent, 0.12 + 0.1 * k); ctx.shadowBlur = 18 + 20 * k; }
  rrect(ctx, x, y, w, h, 30); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 30); ctx.strokeStyle = hero ? rgba('#ffffff', 0.12) : rgba(c.accent, lerp(0.55, 0.85, k)); ctx.lineWidth = 1.5; ctx.stroke();
  if (hero) { ctx.save(); rrect(ctx, x, y, w, h, 30); ctx.clip(); const lg = ctx.createRadialGradient(x + w * 0.3, y, 0, x + w * 0.3, y, w * 0.6); lg.addColorStop(0, rgba(c.accent, 0.1)); lg.addColorStop(1, rgba(c.accent, 0)); ctx.fillStyle = lg; ctx.fillRect(x, y, w, h); ctx.restore(); }
  // top bar: a mark, the file name and the copy's number
  ctx.beginPath(); ctx.arc(x + 59, y + 57, 15, 0, Math.PI * 2); ctx.strokeStyle = hero ? c.accent : rgba(c.accent, 0.8); ctx.lineWidth = 4; ctx.stroke();
  text(ctx, copy('command', P.lang), x + 90, y + 68, F(P, 'mono', 32, 600, 'label'), { color: hero ? c.ink : rgba(c.ink, 0.85) });
  const pf = F(P, 'mono', Math.max(26, info), 700, 'label'), tag = pad(o.clone + 1), pw = measure(ctx, tag, pf).width + 32;
  rrect(ctx, x + w - 42 - pw, y + 35, pw, 44, 22); ctx.fillStyle = hero ? c.accent : rgba(c.accent, 0.14); ctx.fill();
  if (!hero) { ctx.strokeStyle = rgba(c.accent, 0.6); ctx.lineWidth = 1.5; ctx.stroke(); }
  text(ctx, tag, x + w - 42 - pw / 2, y + 66, pf, { color: hero ? c.onAccent : c.accent, align: 'center' });
  if (hero) {
    const vf = F(P, 'display', 132, 750, 'display'), v = copy('kpis', P.lang)[2].value;
    text(ctx, v, x + 40, y + 216, vf, { color: c.ink });
    text(ctx, copy('metric2Label', P.lang), x + 52 + measure(ctx, v, vf).width, y + 216, F(P, 'text', Math.max(26, info), 500), { color: c.dim });
  }
  // the line (and its fill on the element)
  const lx = x + 42, ly = y + 246, lw = 576, lh = 120, pts = SPARK.map((s, i) => [lx + (i / (SPARK.length - 1)) * lw, ly + s * lh]);
  if (hero) { ctx.beginPath(); ctx.moveTo(lx, ly + 130); pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.lineTo(lx + lw, ly + 130); ctx.closePath(); const fg = ctx.createLinearGradient(0, ly, 0, ly + 130); fg.addColorStop(0, rgba(c.accent, 0.2)); fg.addColorStop(1, rgba(c.accent, 0)); ctx.fillStyle = fg; ctx.fill(); }
  ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.strokeStyle = rgba(c.accent, hero ? 1 : 0.8); ctx.lineWidth = hero ? 4 : 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  if (hero) {   // eight slots along the bottom: the first lit, the rest light as the clones merge back
    const n = 8, gap = 8, sw = (w - 84 - gap * (n - 1)) / n, sf = F(P, 'mono', info, 600, 'label');
    for (let i = 0; i < n; i++) {
      const on = i === 0 ? 1 : o.lit, sx = x + 42 + i * (sw + gap), sy = y + h - 30 - 40;
      rrect(ctx, sx, sy, sw, 40, 8); ctx.fillStyle = rgba(c.accent, 0.06 + 0.84 * on); ctx.fill(); ctx.strokeStyle = rgba(c.accent, 0.18 + 0.5 * on); ctx.lineWidth = 1; ctx.stroke();
      text(ctx, pad(i + 1), sx + sw / 2, sy + 29, sf, { color: on > 0.5 ? c.onAccent : c.dim, align: 'center' });
    }
  }
};
const stage = (P) => (ctx) => {
  const c = P.colors;
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  const g = ctx.createRadialGradient(1190, 454, 0, 1190, 454, 1100); g.addColorStop(0, rgba(mix(c.ground, c.ink, 0.12), 0.8)); g.addColorStop(1, rgba(c.ground, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
};

export default {
  id: 'clone-echo', kind: 'motion',
  tier: 'T1', family: 'zoom-depth', beats: 6.4,
  beatsFor: () => (F1 - F0) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'],
  from: 'the element alone in place (the scene with it)',
  to: 'the element alone, merged and lit (its own rest); the counter, if on, at ×(clones + 1)',
  interpolates: ['each clone\'s depth (a staggered spring out, a synchronous ease-in back)', 'clone opacity, outline and depth blur', 'a slow dolly and drift while held', 'the element\'s press, pulse and rim'],
  summary: 'One element copies itself into a file of translucent clones receding into depth, holds, then they all rush back into it and it bounces: one is many.',
  theory: 'Identical copies laid out at equal steps are read as one thing multiplied (Gestalt similarity and common fate), and their return into one body states that the many are the same; the asymmetric rhythm (staggered out, together back) separates "copying" from "gathering".',
  defaults: () => ({ rect: [1130, 352, 660, 420], clones: 7, vp: [360, 120], under: null, content: null, counter: true, label: null }),
  prepare(P) { return { under: P.under || stage(P), content: P.content || renderCard(P), n: P.clones || 7, label: P.label || copy('kpis', P.lang)[1].label }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = F0 + p * (F1 - F0), n = D.n;
    const press = ramp(f, 16, 8, 'swift') * (1 - ramp(f, SPREAD, 10, 'overshoot'));
    const popT = clamp((f - LAND) / 16), pop = f >= LAND && f < LAND + 16 ? Math.sin(popT * Math.PI) * Math.pow(1 - popT, 0.6) : 0;
    const merge = mergeOf(f), drift = 14 * ramp(f, 40, 40, 'smooth') * (1 - merge);
    let count = 1, last = -99;
    for (let i = 1; i <= n; i++) { const f0 = SPREAD + (i - 1) * EACH + 2; if (f >= f0) { count++; last = f0; } }
    const clones = Array.from({ length: n }, (_, j) => {
      const i = j + 1, d = depthOf(f, i), sp = spreadOf(f, i), v = Math.abs(depthOf(f + 0.5, i) - depthOf(f - 0.5, i)) * GAP_Z * i;
      return { i, d, op: (1 - (i / n) * 0.72) * clamp(sp * 2.5) * (1 - merge * 0.4), z: -GAP_Z * i * d, dx: (-58 * i - drift * i * 0.4) * d, dy: -6 * i * d, blur: Math.min(10, v * 0.06) + (i / n) * 1.6, born: clamp(1 - (f - (SPREAD + (i - 1) * EACH)) / 8) };
    });
    return { f, clones, hero: (1 - 0.04 * press) * (1 + 0.06 * pop), press, rim: f >= LAND ? Math.max(0, 1 - (f - LAND) / 14) : 0, lit: ramp(f, LAND - 1, 5, 'snappy'),
      dolly: 1 + 0.02 * ramp(f, 40, 40, 'smooth'), count, roll: ramp(f - last, 0, 5, 'snappy'), punch: f >= LAND && f < LAND + 12 ? Math.sin(clamp((f - LAND) / 12) * Math.PI) : 0 };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, [x, y, w, h] = P.rect, [vx, vy] = P.vp, cx = x + w / 2, cy = y + h / 2;
    D.under(ctx);
    const fl = ctx.createRadialGradient(cx, y + h + 48, 0, cx, y + h + 48, w * 0.75);   // the floor light under the element
    fl.addColorStop(0, rgba(c.accent, 0.14 + 0.12 * S.rim)); fl.addColorStop(1, rgba(c.accent, 0));
    ctx.save(); ctx.translate(cx, y + h + 48); ctx.scale(1, 0.3); ctx.translate(-cx, -(y + h + 48)); ctx.fillStyle = fl; ctx.fillRect(x - 200, y + h - 400, w + 400, 900); ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(S.dolly, S.dolly); ctx.translate(-cx, -cy);
    for (let j = S.clones.length - 1; j >= 0; j--) {   // far to near
      const K = S.clones[j];
      if (K.op <= 0.005 || K.d <= 0.002) continue;
      const k = PERSP / (PERSP - K.z);
      ctx.save(); ctx.globalAlpha = K.op; ctx.filter = `blur(${K.blur.toFixed(2)}px)`;
      ctx.translate(vx, vy); ctx.scale(k, k); ctx.translate(-vx + K.dx, -vy + K.dy);
      if (K.born > 0) { ctx.save(); ctx.shadowColor = rgba(c.accent, 0.7 * K.born); ctx.shadowBlur = 14 * K.born; rrect(ctx, x, y, w, h, 30); ctx.strokeStyle = rgba(c.accent, 0.5 * K.born); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
      D.content(ctx, [x, y, w, h], { clone: K.i, n: D.n, lit: 0 });
      ctx.restore();
    }
    ctx.save(); ctx.translate(cx, cy); ctx.scale(S.hero, S.hero); ctx.translate(-cx, -cy);
    D.content(ctx, [x, y, w, h], { clone: 0, n: D.n, lit: S.lit });
    const rimA = 0.25 * S.press + 0.9 * S.rim;
    if (rimA > 0.005) { ctx.save(); ctx.shadowColor = rgba(c.accent, 0.45 * S.rim); ctx.shadowBlur = 50 * S.rim; rrect(ctx, x + 1, y + 1, w - 2, h - 2, 30); ctx.strokeStyle = rgba(c.accent, rimA); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    ctx.restore();
    ctx.restore();
    if (P.counter) {   // ×N, bottom left: one place per clone, a punch when they merge
      const size = 260, df = F(P, 'display', size, 800, 'display'), sx = 128, top = 622, s = 1 + 0.06 * S.punch;
      ctx.save(); ctx.translate(sx, top + size * 0.7); ctx.scale(s, s); ctx.translate(-sx, -(top + size * 0.7));
      text(ctx, '×', sx, top + size * 0.2 + size * 0.62 * 0.8, F(P, 'display', size * 0.62, 500, 'display'), { color: rgba(c.accent, 0.55) });
      const nx = sx + size * 0.62 * 0.62 + 8;
      [S.count - 1, S.count].forEach((v, k2) => {
        if (v < 1) return;
        const yy = k2 === 0 ? -S.roll * 0.45 * size * 1.02 : (1 - S.roll) * 0.45 * size * 1.02, a = k2 === 0 ? clamp(1 - S.roll * 1.6) : clamp(S.roll * 1.6), spd = S.roll < 1 ? 1 - S.roll : 0;
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a; if (spd > 0.05) ctx.filter = `blur(${(spd * 6).toFixed(2)}px)`;
        ctx.shadowColor = rgba(c.accent, 0.55 * (0.35 + 0.5 * S.punch)); ctx.shadowBlur = 24 * (0.35 + 0.5 * S.punch);
        text(ctx, String(v), nx, top + size * 0.82 + yy, df, { color: c.accent }); ctx.restore();
      });
      ctx.restore();
      ctx.fillStyle = c.accent; ctx.fillRect(140, 917, 40, 2);
      text(ctx, D.label, 196, 930, F(P, 'mono', 32, 600, 'label'), { color: c.dim });
    }
  },
  // the farthest clone's centre, the third clone's centre and the element's top-left corner (the dolly applied)
  track(S, P, D) {
    const [x, y, w, h] = P.rect, [vx, vy] = P.vp, cx = x + w / 2, cy = y + h / 2;
    const dolly = ([px, py]) => [cx + (px - cx) * S.dolly, cy + (py - cy) * S.dolly];
    const clone = (j) => { const K = S.clones[j], k = PERSP / (PERSP - K.z); return dolly([vx + (cx + K.dx - vx) * k, vy + (cy + K.dy - vy) * k]); };
    return [clone(S.clones.length - 1), clone(Math.min(2, S.clones.length - 1)), dolly([cx - (w / 2) * S.hero, cy - (h / 2) * S.hero])];
  },
  blur: () => false,
};

// type-enter — a title enters unit by unit (word, phrase or character); how each unit travels is the variant.
// Adapted from video-shotcraft demos/typography/blur-slide/BlurSlide.tsx (card references/shots/typography/blur-slide.md),
// demos/typography/type-assembly-moves/SplitTextStagger.tsx, LetterformDriftAssembly.tsx and TextOnPath.tsx (card
// references/shots/typography/type-assembly-moves.md), demos/typography/type-entrance-moves/LetterDropPhysics.tsx (card
// references/shots/typography/type-entrance-moves.md) and demos/typography/paper-title-card/PaperTitleCard.tsx (card
// references/shots/typography/paper-title-card.md), and, for the variant tumble, demos/effects/assemble-then-type-flyin/
// AssembleThenTypeFlyin.tsx (card references/shots/effects/assemble-then-type-flyin.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as one HyperFrames brick (no React or Remotion) with seven variants on one timing model; colours by
// role; brand, demo copy, page furniture (mastheads, folios, charts, badges) and backdrops removed; units come from
// type.js by language (Chinese: phrases for blur and press, characters for the others); seeded noise from rng.js in
// place of the sine hash; the subtitle is an optional second block; motion blur from track() instead of SVG filters;
// tumble's CSS 3D turn drawn on canvas as an affine map from the projected centre and axes (foreshortened, no keystone).
import { clamp, lerp, ground, mix, rgba, bez } from '../../../handoffs/util.js';
import { scratch } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { EASE } from '../../ease.js';
import { copy } from '../../sample.js';
import { setText, drawUnit, fontSpec, deepen, FPB, beatsFrom, langOf, roughUnits, pick } from './type.js';

// Params with every per-language value ({ en, zh }) resolved for the brick's language.
const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), accent: pick(P.accent, lang), size: pick(P.size, lang), sub: P.sub ? { ...P.sub, text: pick(P.sub.text, lang) } : null };
};

// The subtitle block, filled out (null without one).
const subOf = (P) => (P.sub ? { after: 24, gap: 2.4, dur: 20, dy: 0.56, blur: 0.2, size: langOf(P.text, P.lang) === 'zh' ? 40 : 46, weight: 500, ...P.sub } : null);

const R = (u) => clamp(u);
const ramp = (f, a, d, curve) => curve(R((f - a) / Math.max(1e-9, d)));
const cubicOut = (u) => 1 - Math.pow(1 - R(u), 3);
const quadOut = (u) => 1 - Math.pow(1 - R(u), 2);
const cubicInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const PRESS = bez(0.2, 0.75, 0.3, 1);
const TRAVEL = bez(0.42, 0, 0.12, 1);
const LIFT = bez(0.3, 1.22, 0.6, 1);

// Per variant: unit size by language, stagger (frames, by language), each unit's window, amplitudes in em.
const HOW = {
  blur:  { by: { en: 'word', zh: 'word' }, gap: { en: 4, zh: 4 }, dur: 22, accentDur: 30, linePause: 4, dy: 0.376, blur: 0.106 },
  rise:  { by: { en: 'char', zh: 'char' }, gap: { en: 2, zh: 3 }, rise: 14, settle: 6, over: 0.10, lineH: 1.05, rule: 30 },
  press: { by: { en: 'word', zh: 'word' }, gap: { en: 4, zh: 4 }, dur: 9, scale: 0.28, blur: 0.06 },
  drift: { by: { en: 'char', zh: 'char' }, gap: { en: 3, zh: 4 }, travel: 45, mag: [260, 360], rot: 24, depth: 0.22, blur: 8, pulse: 8, breath: 0.04 },
  drop:  { by: { en: 'char', zh: 'char' }, spread: 36, fall: 24, b1: 16, b2: 8, drop: 720, tilt: 6, hold: 22, snap: 6 },
  path:  { by: { en: 'char', zh: 'char' }, travel: 60, hold: 8, lift: 18, liftGap: 1.1 },
  // tumble: every character flies in through depth under a 900 px perspective, turning on three axes; `land` frames after
  // the lead the last one has landed (the stagger shrinks to fit, 0.35–1.6 frames a character)
  tumble: { by: { en: 'char', zh: 'char' }, dur: 16, land: 70, step: [0.35, 1.6], persp: 900, dx: 260, dy: 200, dz: [200, 760], rx: 170, ry: 190, rz: 120, blur: 7 },
};

// A tumbling character's seeded flight (px and degrees), or the one P.offsets gives it.
const flightOf = (P, H, i) => P.offsets?.[i] || {
  dx: (hash(i * 7 + 1, P.seed) - 0.5) * 2 * H.dx, dy: (hash(i * 7 + 2, P.seed) - 0.5) * 2 * H.dy, dz: -lerp(H.dz[0], H.dz[1], hash(i * 7 + 3, P.seed)),
  rx: (hash(i * 7 + 4, P.seed) - 0.5) * 2 * H.rx, ry: (hash(i * 7 + 5, P.seed) - 0.5) * 2 * H.ry, rz: (hash(i * 7 + 6, P.seed) - 0.5) * 2 * H.rz,
};
// CSS perspective(persp) translate3d(t) rotateX rotateY rotateZ about the glyph's centre, as a canvas affine map: the
// projected centre and the projected axes over half a glyph (a turned glyph's foreshortening, not its keystone).
const project = (t, deg, persp, h) => {
  const [ax, ay, az] = deg.map((d) => (d * Math.PI) / 180);
  const rot = ([x, y, z]) => {
    [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
    [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
    [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
    return [x, y, z];
  };
  const pr = ([x, y, z]) => { const k = persp / Math.max(1, persp - z); return [x * k, y * k]; };
  const c = pr(t), ex = rot([h, 0, 0]), ey = rot([0, h, 0]);
  const px = pr([t[0] + ex[0], t[1] + ex[1], t[2] + ex[2]]), py = pr([t[0] + ey[0], t[1] + ey[1], t[2] + ey[2]]);
  return { c, m: [(px[0] - c[0]) / h, (px[1] - c[1]) / h, (py[0] - c[0]) / h, (py[1] - c[1]) / h] };
};

// Frame timeline of a variant for n units (and the sub block's m units): starts, ends, total.
const plan = (P, LU, SU) => {
  const L = { units: LU }, S = SU ? { units: SU } : null;
  const H = HOW[P.how], n = L.units.length, lang = langOf(P.text, P.lang), gap = P.gap ?? H.gap?.[lang] ?? 0;
  const lead = P.lead;
  let starts = [], total = 0, extra = {};
  if (P.how === 'blur') {
    let t = lead, line = 0;
    L.units.forEach((u, i) => { if (u.line !== line) { t += H.linePause; line = u.line; } starts.push(t); t += gap; });
    const durs = L.units.map((u) => (u.accent ? H.accentDur : H.dur));
    total = Math.max(...starts.map((s, i) => s + durs[i]));
    extra.durs = durs;
  } else if (P.how === 'rise') {
    starts = L.units.map((_, i) => lead + i * gap);
    total = Math.max(starts[n - 1] + H.rise + H.settle, lead + H.rule);
  } else if (P.how === 'press') {
    starts = L.units.map((_, i) => lead + i * gap);
    total = starts[n - 1] + H.dur;
  } else if (P.how === 'drift') {
    starts = L.units.map((_, i) => lead + i * gap);
    const lastLock = starts[n - 1] + H.travel;
    extra.breathAt = lastLock + 11;
    total = extra.breathAt + 24;
  } else if (P.how === 'drop') {
    starts = L.units.map((_, i) => lead + H.spread * (1 - Math.pow(1 - (n > 1 ? i / (n - 1) : 1), 1.5)));
    extra.snapAt = starts[n - 1] + H.fall + H.b1 + H.b2 + H.hold;
    total = extra.snapAt + H.snap + 2;
  } else if (P.how === 'tumble') {
    const step = clamp(((P.land ?? H.land) - H.dur) / n, H.step[0], H.step[1]);
    starts = L.units.map((_, i) => lead + i * step);
    total = starts[n - 1] + H.dur;
  } else if (P.how === 'path') {
    extra.liftAt = lead + H.travel + H.hold;
    starts = L.units.map((_, i) => extra.liftAt + i * H.liftGap);
    total = starts[n - 1] + H.lift + 2;
  }
  if (S) {
    const sub = subOf(P), s0 = (starts[0] ?? lead) + sub.after;
    extra.subStarts = S.units.map((_, i) => s0 + i * sub.gap);
    total = Math.max(total, extra.subStarts[S.units.length - 1] + sub.dur);
  }
  return { starts, total, ...extra };
};

// ── per-unit poses at frame f ───────────────────────────────────────────────────────────────────────────────────────
const dropY = (t, H) => {
  if (t <= 0) return -H.drop;
  if (t < H.fall) return -H.drop + H.drop * (t / H.fall) ** 2;
  if (t < H.fall + H.b1) { const u = (t - H.fall) / H.b1; return -H.drop * 0.3 * 4 * u * (1 - u); }
  if (t < H.fall + H.b1 + H.b2) { const u = (t - H.fall - H.b1) / H.b2; return -H.drop * 0.09 * 4 * u * (1 - u); }
  return 0;
};
const squash = (t, H) => {
  let s = 0;
  for (const [t0, k] of [[H.fall, 1], [H.fall + H.b1, 0.45], [H.fall + H.b1 + H.b2, 0.18]]) {
    const d = t - t0;
    if (d < 0 || d > 16) continue;
    s += k * Math.exp(-d / 2.6) * Math.cos(d * 0.85);
  }
  return s;
};

const poseOf = (P, D, f) => {
  const H = HOW[P.how], L = D.L, T = D.T, size = L.size;
  const U = L.units.map((u, i) => {
    const t0 = T.starts[i];
    const o = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, alpha: 1, blur: 0, pulse: 0, clip: null, shadow: null };
    if (P.how === 'blur') {
      const q = ramp(f, t0, T.durs[i], EASE.out);
      o.alpha = q; o.dy = (1 - q) * H.dy * size; o.blur = q >= 0.999 ? 0 : (1 - q) * H.blur * size;
    } else if (P.how === 'rise') {
      const yp = f < t0 + H.rise ? lerp(1.15, -H.over, cubicOut((f - t0) / H.rise)) : lerp(-H.over, 0, quadOut((f - t0 - H.rise) / H.settle));
      const lh = H.lineH * size;
      o.dy = yp * lh;
      const bottom = u.y + size * 0.26;
      o.clip = [u.x - size * 0.2, bottom - size * 1.35, u.w + size * 0.4, size * 1.35];
      o.alpha = f <= t0 ? 0 : 1;
    } else if (P.how === 'press') {
      const q = ramp(f, t0, H.dur, PRESS);
      o.alpha = q; o.sx = o.sy = 1 + H.scale * (1 - q); o.blur = q >= 0.999 ? 0 : (1 - q) * H.blur * size;
    } else if (P.how === 'drift') {
      const q = ramp(f, t0, H.travel, cubicOut);
      const ang = hash(i * 3 + 1, P.seed) * Math.PI * 2, mag = lerp(H.mag[0], H.mag[1], hash(i * 3 + 2, P.seed));
      o.dx = Math.cos(ang) * mag * (1 - q); o.dy = Math.sin(ang) * mag * (1 - q);
      o.rot = ((hash(i * 3 + 3, P.seed) - 0.5) * 2 * H.rot * (1 - q) * Math.PI) / 180;
      o.sx = o.sy = 1 + H.depth * (1 - q); o.blur = q >= 0.999 ? 0 : H.blur * (1 - q); o.alpha = lerp(0.35, 1, q);
      const lock = t0 + H.travel, d = f - lock;
      o.pulse = d <= 0 || d >= H.pulse ? 0 : d < H.pulse / 2 ? d / (H.pulse / 2) : (H.pulse - d) / (H.pulse / 2);
    } else if (P.how === 'drop') {
      const t = f - t0, y = dropY(t, H), vy = dropY(t + 0.5, H) - dropY(t - 0.5, H);
      const inhale = ramp(f, T.snapAt - 2, 2, EASE.out), snap = ramp(f, T.snapAt, H.snap, EASE.snappy), snapRot = ramp(f, T.snapAt, H.snap + 2, EASE.overshoot);
      const pulse = 0.06 * inhale * (1 - snap);
      const tilt = (hash(i + 1, P.seed) - 0.5) * 2 * H.tilt;
      const rotDeg = tilt * EASE.out(R((t - H.fall) / 6)) * (1 - snapRot);
      const stretch = Math.min(1, Math.abs(vy) / 60) * 0.1 * (t < H.fall ? 1 : 0.6), sq = squash(t, H);
      o.sy = (1 + stretch) * (1 - 0.2 * sq) + pulse; o.sx = (1 - stretch * 0.55) * (1 + 0.15 * sq) + pulse;
      o.rot = (rotDeg * Math.PI) / 180;
      o.dy = y - Math.sin(Math.abs(o.rot)) * u.w * 0.5;
      o.oy = u.y; o.ox = u.cx;                                        // squash and tilt about the foot
      const lift = R(-y / 420);
      o.shadow = { alpha: (t < 0 ? 0 : 0.2) * (1 - lift * 0.85) * R((t + 2) / 8), w: lerp(0.74, 1.3, lift) * (1 + 0.12 * Math.max(0, sq)), blur: lerp(7, 28, lift) };
      o.alpha = t < -2 ? 0 : 1;
    } else if (P.how === 'path') {
      const head = -24 + (D.endS + 24) * ramp(f, P.lead, H.travel, TRAVEL);
      const s = head - (D.lastC - D.cs[i]);
      const [px, py, ang] = D.curveAt(s);
      const q = ramp(f, t0, H.lift, LIFT), qx = ramp(f, t0, H.lift, EASE.swift);
      o.dx = lerp(px, u.cx, qx) - u.cx; o.dy = lerp(py, u.cy, q) - u.cy;
      o.rot = lerp(ang, 0, R(q));
      o.alpha = R((s + 150) / 60);
    } else if (P.how === 'tumble') {
      const a = ramp(f, t0, H.dur, EASE.snappy), q = 1 - a, g = flightOf(P, H, i);
      if (a < 1) {
        const pj = project([q * g.dx, q * g.dy, q * g.dz], [q * g.rx, q * g.ry, q * g.rz], H.persp, size * 0.3);
        o.dx = pj.c[0]; o.dy = pj.c[1]; o.m = pj.m;
        o.blur = q * q * (1 + (Math.abs(g.dz) / 760) * H.blur);
      }
      o.alpha = a > 0 ? Math.min(1, a * 1.8) : 0;
    }
    return o;
  });
  // drift: the whole word breathes once after the last lock
  let breath = 1;
  if (P.how === 'drift') {
    breath = f < T.breathAt + 12 ? lerp(1, 1 + H.breath, cubicInOut(R((f - T.breathAt) / 12))) : lerp(1 + H.breath, 1, cubicInOut(R((f - T.breathAt - 12) / 12)));
  }
  const sb = subOf(P);
  const sub = D.S ? D.S.units.map((u, i) => {
    const q = ramp(f, T.subStarts[i], sb.dur, EASE.out);
    return { alpha: q, dy: (1 - q) * sb.dy * D.S.size, blur: q >= 0.999 ? 0 : (1 - q) * sb.blur * D.S.size };
  }) : [];
  const rule = P.how === 'rise' && P.rule ? ramp(f, T.starts[0], H.rule, EASE.snappy) : 0;
  return { U, sub, breath, rule };
};

export default {
  id: 'type-enter', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 3,
  // From unit counts only (no measuring), so Node (the host's length) and the browser agree.
  beatsFor(P) {
    P = norm(P);
    const H = HOW[P.how], lang = langOf(P.text, P.lang), sub = subOf(P);
    const LU = roughUnits(P.text, lang, { by: P.by || H.by[lang], size: P.size, maxW: P.maxW, accent: P.accent });
    const SU = sub ? roughUnits(sub.text, lang, { by: 'word' }) : null;
    return beatsFrom(plan(P, LU, SU).total);
  },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent', 'line'],
  from: 'the ground (or the scene under the title), no title yet',
  to: 'the title set at rest (and its subtitle)',
  interpolates: ['per unit: opacity, offset, blur, scale, rotation, a mask (rise), a fall with bounces (drop), a place on a curve (path), a flight through depth turning on three axes (tumble)', 'the units\' start times (stagger)'],
  summary: 'A title enters unit by unit — words or Chinese phrases, or characters — each unit travelling the same short way on one curve, staggered.',
  theory: 'Common fate and staggered onset: units that move the same way read as one line, and an onset in reading order leads the eye through it (Wertheimer 1923; the stagger of kinetic typography, Lee, Forlizzi & Hudson 2002).',
  defaults: (ctx = {}) => ({
    how: 'blur', text: copy('titleLong', ctx.lang), accent: null,
    sub: null, by: null, gap: null, lead: 0,
    size: ctx.lang === 'zh' ? 128 : 140, weight: 700, role: 'display',
    x: 960, y: 540, align: 'center', maxW: 1560, leading: null,
    rule: true, floor: true, curve: true,
    path: [[150, 930], [860, 920], [1300, 780], [1700, 400]],
    land: null, offsets: null, probes: [], seed: 1,
  }),
  prepare(P) {
    P = norm(P);
    const H = HOW[P.how], lang = langOf(P.text, P.lang), sub = subOf(P);
    const L = setText(scratch(), P.text, fontSpec(P), lang, { by: P.by || H.by[lang], x: P.x, y: P.y, align: P.align, maxW: P.maxW, leading: P.leading, accent: P.accent });
    const S = sub ? setText(scratch(), sub.text, fontSpec(P, sub.size, sub.weight, 'text'), lang, { by: 'word', x: sub.x ?? P.x, y: sub.y ?? L.box[1] + L.box[3] + sub.size * 1.2, align: sub.align ?? P.align, maxW: P.maxW }) : null;
    const T = plan(P, L.units, S && S.units);
    const frames = this.beatsFor(P) * FPB;
    // the measured lines can differ from the estimate: squeeze the plan into the brick's length if it runs over
    if (T.total > frames) { const k = frames / T.total; for (const key of ['starts', 'subStarts']) if (T[key]) T[key] = T[key].map((v) => v * k); for (const key of ['breathAt', 'snapAt', 'liftAt']) if (T[key] != null) T[key] *= k; }
    const D = { L, S, T, frames, N: P };
    if (P.how === 'path') {
      const [p0, p1, p2, p3] = P.path, N = 300;
      const pt = (t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
      const arc = [0]; let prev = pt(0);
      for (let k = 1; k <= N; k++) { const q = pt(k / N); arc.push(arc[k - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1])); prev = q; }
      const LEN = arc[N];
      const tAt = (s) => { const v = clamp(s, 0, LEN); let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arc[m] < v) lo = m; else hi = m; } return (lo + (v - arc[lo]) / (arc[hi] - arc[lo] || 1)) / N; };
      // before the start and past the end the curve goes on straight along its end tangents
      D.curveAt = (s) => {
        const t = tAt(s), a = pt(Math.max(0, t - 1e-3)), b = pt(Math.min(1, t + 1e-3)), q = pt(t), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const over = s < 0 ? s : s > LEN ? s - LEN : 0;
        return [q[0] + Math.cos(ang) * over, q[1] + Math.sin(ang) * over, ang];
      };
      D.pt = pt; D.tAt = tAt; D.LEN = LEN; D.endS = LEN * 0.94;
      const x0 = L.units[0].x;
      D.cs = L.units.map((u) => u.cx - x0); D.lastC = D.cs[D.cs.length - 1];
    }
    return D;
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) { const f = p * D.frames; return { p, f, ...poseOf(D.N, D, f) }; },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, L = D.L, H = HOW[P.how], dark = !!P.dark;
    ground(ctx, P);
    if (P.how === 'drop' && P.floor) {
      const y = L.lines[0].base + 1, g = ctx.createLinearGradient(160, 0, 1760, 0);
      g.addColorStop(0, rgba(c.line, 0)); g.addColorStop(0.22, rgba(c.line, 1)); g.addColorStop(0.78, rgba(c.line, 1)); g.addColorStop(1, rgba(c.line, 0));
      ctx.fillStyle = g; ctx.fillRect(160, y, 1600, 2);
    }
    if (P.how === 'path' && P.curve) {
      const head = -24 + (D.endS + 24) * ramp(S.f, P.lead, H.travel, TRAVEL);
      const tail = ramp(S.f, P.lead + H.travel - 4, 30, EASE.out);
      const reach = Math.min(D.LEN, Math.max(head + L.size * 0.45, 0) * (1 - tail) + D.LEN * tail);
      if (reach > 1) {
        ctx.save(); ctx.beginPath();
        const te = D.tAt(reach);
        for (let k = 0; k <= 120; k++) { const q = D.pt((k / 120) * te); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
        const tip = D.pt(te);
        ctx.beginPath(); ctx.arc(tip[0], tip[1], 9, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
        ctx.restore();
      }
    }
    if (S.rule > 0) {
      const ln = L.lines[L.lines.length - 1], x0 = Math.min(...L.lines.map((l) => l.left)), w = Math.max(...L.lines.map((l) => l.left + l.w)) - x0;
      ctx.fillStyle = c.accent; ctx.fillRect(x0, ln.base + L.size * 0.26 + 12, w * S.rule, 3);
    }
    ctx.save();
    if (S.breath !== 1) { const [bx, by, bw, bh] = L.box; ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(S.breath, S.breath); ctx.translate(-(bx + bw / 2), -(by + bh / 2)); }
    L.units.forEach((u, i) => {
      const o = S.U[i];
      if (o.shadow && o.shadow.alpha > 0.003) {
        ctx.save(); ctx.globalAlpha = o.shadow.alpha; ctx.filter = `blur(${o.shadow.blur.toFixed(1)}px)`;
        ctx.fillStyle = mix(c.ink, '#000000', 0.3);
        ctx.beginPath(); ctx.ellipse(u.cx, u.y, u.w * 0.42 * o.shadow.w, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      if (o.clip) { ctx.save(); ctx.beginPath(); ctx.rect(...o.clip); ctx.clip(); }
      drawUnit(ctx, u, L, { ...o, color: deepen(c.ink, o.pulse, dark), accentColor: c.accent,
        stroke: o.pulse > 0.01 ? { width: 3 * o.pulse, color: deepen(c.ink, 1, dark) } : null });
      if (o.clip) ctx.restore();
    });
    ctx.restore();
    if (D.S) D.S.units.forEach((u, i) => drawUnit(ctx, u, D.S, { ...S.sub[i], color: c.dim, accentColor: c.accent }));
  },
  track(S, P, D) {
    P = D.N;
    const pts = D.L.units.map((u, i) => [u.cx + S.U[i].dx, u.cy + S.U[i].dy]);
    for (const i of P.probes || []) pts.push([960 + (S.U[i]?.dx ?? 0), 540 + (S.U[i]?.dy ?? 0)]);
    return pts;
  },
};

// flow-landscape — a data landscape seen from a low camera flying forward: one bright trunk line winds from under the
// lens to a vanishing point a third from the right, tributaries sweep in from both sides and merge into it, pins rise
// on them, pulses run toward the vanishing point, it lights up, and a two-line title lands in the sky.
// Adapted from video-shotcraft demos/opening/dataviz-landscape-open/DatavizLandscapeOpen.tsx (card references/shots/opening/dataviz-landscape-open.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React, Remotion or SVG); the ground plane, the camera, the trunk and
// the eleven tributaries keep the upstream geometry (pinhole F 1100, camera height 220, horizon 420); the six pins carry
// the film's names (`pins`, numbered automatically) in place of the upstream's shot ids and camera-move names; the brand
// eyebrow and the two title lines are slots, the second fitted to stay clear of the vanishing point; colours by role
// (the trunk and its light the accent, tributaries and dots a mix of ink into the ground); the sky dust seeded with
// rng.js hash; the camera's run spans the scene, however long the title's reading time makes it.
import { clamp, mix, rgba, rrect, ground, text, measure, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, readTime } from '../../lang.js';
import { look as NEUTRAL, infoSize } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';

// The world: a ground plane seen through a pinhole camera (as upstream)
const HY = 420, F = 1100, CAM_H = 220, SLOPE = 0.29, VPX = 960 + F * SLOPE, CAM_DIST = 950, DUR = 180;
const camPath = bez(0.3, 0.3, 0.55, 1);
const camAt = (fr, end) => { const t = clamp(fr / (end - 1)), z = CAM_DIST * camPath(t); return { z, x: SLOPE * z + (-140 + 250 * EASE.smooth(t)) }; };
const project = (p, cam) => { const zr = p.z - cam.z; return { sx: 960 + (F * (p.x - cam.x)) / zr, sy: HY + (F * CAM_H) / zr, zr }; };
const trunkX = (z) => SLOPE * z - 160 + 150 * Math.sin(z / 950), trunkDX = (z) => SLOPE + (150 / 950) * Math.cos(z / 950);
const TRUNK = Array.from({ length: 261 }, (_, i) => { const z = -300 + Math.pow(i / 260, 1.7) * 14300; return { x: trunkX(z), z }; });
const cubic = (a, b, c, d, t) => { const u = 1 - t; return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, z: u * u * u * a.z + 3 * u * u * t * b.z + 3 * u * t * t * c.z + t * t * t * d.z }; };
const resample = (at, n) => {
  const raw = Array.from({ length: 241 }, (_, i) => at(i / 240)), cum = [0];
  for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].z - raw[i - 1].z));
  const total = cum[cum.length - 1], out = [];
  for (let k = 0, j = 1; k <= n; k++) {
    const target = (k / n) * total; while (j < raw.length - 1 && cum[j] < target) j++;
    const f = (target - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]); out.push({ x: raw[j - 1].x + (raw[j].x - raw[j - 1].x) * f, z: raw[j - 1].z + (raw[j].z - raw[j - 1].z) * f });
  }
  return out;
};
// tributaries: side, start z, lateral offset, merge z, lead length, grow frame, width — each meets the trunk on its tangent
const TRIB_SPECS = [[-1, -260, 700, 1500, 520, 8, 5], [1, -120, 900, 2100, 640, 11, 5], [-1, 500, 1500, 2700, 760, 16, 4.4], [1, 800, 1800, 3300, 820, 20, 4.4], [-1, 1400, 2300, 3900, 900, 25, 4.2],
  [1, 1700, 2500, 4600, 980, 29, 4.2], [-1, 2500, 2900, 5300, 1050, 34, 4.2], [1, 3100, 3200, 6100, 1150, 38, 4.2], [-1, 4100, 3600, 7100, 1250, 43, 4.2], [1, 5000, 3900, 8200, 1350, 47, 4.2], [1, -420, 260, 980, 380, 4, 6]];
const TRIBS = TRIB_SPECS.map(([side, z0, off, zm, lm, grow, w]) => {
  const end = { x: trunkX(zm), z: zm }, dx = trunkDX(zm), dl = Math.hypot(dx, 1), p2 = { x: end.x - (dx / dl) * lm, z: end.z - (1 / dl) * lm };
  const p0 = { x: trunkX(z0) + side * off, z: z0 }, p1 = { x: p0.x + (end.x - p0.x) * 0.12, z: p0.z + (end.z - p0.z) * 0.5 };
  return { grow, w, pts: resample((t) => cubic(p0, p1, p2, end, t), 90) };
});
// pins: on which tributary, how far along it, the frame it rises
const PINS = [[2, 0.6, 44], [1, 0.75, 53], [3, 0.6, 62], [6, 0.3, 73], [7, 0.45, 84], [8, 0.45, 96]].map(([tr, u, appear]) => ({ appear, p: TRIBS[tr].pts[Math.round(u * 90)] }));
const s01 = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const EYE = 104, T1 = 110, T2 = 121, HANDOFF = 118, TOP = 108;

// One line's segments: [x1, y1, x2, y2, width, opacity] into the sharp list and the near (blurred) list; returns the pen's tip.
const emit = (pts, g, cam, fr, o, sharp, near) => {
  const n = pts.length - 1, reach = g * n, kMax = Math.min(n, Math.ceil(reach));
  for (let k = 0; k < kMax; k++) {
    const a = pts[k], b0 = pts[k + 1], f = Math.min(1, reach - k), b = f < 1 ? { x: a.x + (b0.x - a.x) * f, z: a.z + (b0.z - a.z) * f } : b0;
    if (a.z - cam.z < 70 || b.z - cam.z < 70) continue;
    const pa = project(a, cam), pb = project(b, cam);
    if ((pa.sx < -200 && pb.sx < -200) || (pa.sx > 2120 && pb.sx > 2120) || (pa.sy > 1300 && pb.sy > 1300)) continue;
    const zr = (pa.zr + pb.zr) / 2, u = (k + 0.5 * f) / n, fog = 1 - s01(2600, 11000, zr), lift = o.ramp ? 0.3 + 0.7 * Math.pow(u, 0.8) : 1;
    const ph = u * o.pn - fr * o.speed + o.seed, pv = 0.7 + o.on * 0.55 * Math.pow(Math.max(0, Math.cos(ph * Math.PI * 2)), 4);
    const op = o.base * fog * lift * (1 + (pv - 1) * s01(500, 1400, zr));
    if (op < 0.01) continue;
    const w = Math.max(0.9, Math.min(46, (o.w * F) / zr)), nearW = 1 - s01(420, 1050, zr), seg = [pa.sx, pa.sy, pb.sx, pb.sy];
    if (nearW < 0.98) sharp.push([...seg, w, op * (1 - nearW)]);
    if (nearW > 0.02) near.push([...seg, w * 1.3, op * nearW * 0.7]);
  }
  if (g > 0 && g < 1) {
    const k = Math.min(n - 1, Math.floor(reach)), f = reach - k, tip = { x: pts[k].x + (pts[k + 1].x - pts[k].x) * f, z: pts[k].z + (pts[k + 1].z - pts[k].z) * f };
    if (tip.z - cam.z > 70) return project(tip, cam);
  }
  return null;
};
const strokeAll = (g, segs, color, k = 1, ka = 1) => { g.lineCap = 'butt'; g.strokeStyle = color; for (const [x1, y1, x2, y2, w, o] of segs) { g.globalAlpha = o * ka; g.lineWidth = w * k; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); } g.globalAlpha = 1; };

export default {
  id: 'flow-landscape', kind: 'scene',
  fits: ['hook', 'lockup', 'claim'],
  surface: ['canvas'],
  beats: { min: 12, max: 14 },
  needs: { motions: ['stagger-in'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', sample: 'eyebrow', limits: { en: { words: 4, chars: 28 }, zh: { chars: 10 } } },
    line1: { type: 'text', tier: 'primary', sample: 'detailTitle', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
    line2: { type: 'text', tier: 'primary', claim: true, sample: 'claim', limits: { en: { words: 5, chars: 24 }, zh: { chars: 9 } } },   // in the accent; both lines fitted to 1040 px
    pins: { type: 'list', count: [3, 6], of: { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 16 }, zh: { chars: 6 } } } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent'],
  summary: 'A low camera flies over a data landscape: a bright trunk line winds to a vanishing point, tributaries sweep in and merge, pins rise on them, pulses flow, the vanishing point lights and a two-line title lands in the sky.',
  defaults: () => ({ eyebrow: null, line1: null, line2: null, pins: null }),
  plan(s, ctx) {
    const read = (readTime(s.line1 || '', ctx.lang) + readTime(s.line2 || '', ctx.lang)) * 30;
    const end = Math.max(DUR, T2 + 30 + read * 0.8), beats = clamp(Math.ceil(end / 7.5) / 2, this.beats.min, this.beats.max);
    return { beats, reads: [{ text: s.line1, lang: ctx.lang }, { text: s.line2, lang: ctx.lang }], cues: [{ beat: 44 / 15, kind: 'accent' }, { beat: HANDOFF / 15, kind: 'turn' }, { beat: (T2 + 20) / 15, kind: 'land' }],
      motion: 'forward dolly (constant, easing out)', settled: (T2 + 30) / 15, peakAt: (T2 + 20) / 15, pause: beats - (T2 + 30) / 15 };
  },
  validate(s) { const n = s.pins ? s.pins.length : 6; return n < 3 || n > 6 ? [`pins: ${n} (3–6)`] : []; },
  prepare(s, ctx) {
    const lang = ctx.lang, look = s.look || NEUTRAL, info = infoSize(lang), sc = canvasOf(16, 16).getContext('2d');
    // both title lines at up to 108 px (zh 112), smaller when the longer would pass 1040 px (clear of the vanishing point)
    const base = lang === 'zh' ? 112 : 108, f0 = fontFor(look, 'display', lang, base, 650, 'display');
    const wmax = Math.max(measure(sc, s.line1 || '', f0).width, measure(sc, s.line2 || '', f0).width), size = Math.max(64, Math.min(base, Math.floor((base * 1040) / Math.max(1, wmax))));
    const pins = (s.pins || []).slice(0, 6).map((p, i) => ({ ...PINS[i], id: String(i + 1).padStart(2, '0'), name: p.name || '' }));
    return { end: this.plan(s, ctx).beats * 15, pins, size, info, ft: fontFor(look, 'display', lang, size, 650, 'display'), fe: fontFor(look, 'mono', lang, info + 3, 600, 'label'),
      near: canvasOf(1920, 1080), glow: canvasOf(1920, 1080), look,
      dust: Array.from({ length: 26 }, (_, i) => ({ x: hash(i, 7) * 1920, y: hash(i + 50, 7) * HY, r: 1 + hash(i + 100, 7) * 1.4, v: (hash(i + 150, 7) - 0.5) * 0.24, a: 0.15 + hash(i + 200, 7) * 0.35 })) };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, fr = u * 15, cam = camAt(fr, D.end), lang = ctx.lang, trib = mix(c.ink, c.ground, 0.38), handoff = ramp(fr, HANDOFF, 50, 'swift');
    ground(ctx2d, s);
    // the stage: a light at the vanishing point, the ground a shade lighter under the horizon, a hairline horizon, dust in the sky
    const kl = ctx2d.createRadialGradient(VPX, HY, 0, VPX, HY, 1300); kl.addColorStop(0, rgba(c.ink, 0.07)); kl.addColorStop(1, rgba(c.ink, 0));
    ctx2d.fillStyle = kl; ctx2d.fillRect(0, 0, 1920, 1080);
    const gg = ctx2d.createLinearGradient(0, HY, 0, 1080); gg.addColorStop(0, rgba(mix(c.ground, c.ink, 0.12), 0.55)); gg.addColorStop(0.3, rgba(mix(c.ground, c.ink, 0.05), 0.3)); gg.addColorStop(1, rgba(c.ground, 0));
    ctx2d.fillStyle = gg; ctx2d.fillRect(0, HY, 1920, 1080 - HY);
    const hl = ctx2d.createLinearGradient(0, 0, 1920, 0); hl.addColorStop(0, rgba(c.ink, 0)); hl.addColorStop(0.4, rgba(c.ink, 0.16)); hl.addColorStop(0.66, rgba(c.accent, 0.35)); hl.addColorStop(0.85, rgba(c.ink, 0.12)); hl.addColorStop(1, rgba(c.ink, 0));
    ctx2d.fillStyle = hl; ctx2d.fillRect(0, HY - 0.5, 1920, 1);
    ctx2d.fillStyle = trib;
    for (const d of D.dust) { const x = (((d.x + fr * d.v) % 1920) + 1920) % 1920; ctx2d.globalAlpha = d.a * 0.35; ctx2d.beginPath(); ctx2d.arc(x, d.y, d.r, 0, Math.PI * 2); ctx2d.fill(); }
    ctx2d.globalAlpha = 1;
    // the ground's dot grid, locked to the world: it streams in from the distance as the camera flies
    const STEP = 420; ctx2d.fillStyle = trib;
    for (let z = Math.ceil((cam.z + 300) / STEP) * STEP; z < cam.z + 9000; z += STEP) for (let x = Math.floor((cam.x - 5200) / STEP) * STEP; x < cam.x + 5200; x += STEP) {
      const pr = project({ x, z }, cam); if (pr.sx < -20 || pr.sx > 1940 || pr.sy > 1100) continue;
      const o = 0.28 * (1 - s01(2000, 9000, pr.zr)) * s01(300, 900, pr.zr); if (o < 0.01) continue;
      ctx2d.globalAlpha = o; ctx2d.beginPath(); ctx2d.arc(pr.sx, pr.sy, Math.max(0.8, Math.min(3.2, 2400 / pr.zr)), 0, Math.PI * 2); ctx2d.fill();
    }
    ctx2d.globalAlpha = 1;
    // the lines: tributaries (faint at the source, bright where they merge), then the trunk; pulses once each has grown
    const sharpT = [], nearT = [], sharpM = [], nearM = [], tips = [];
    TRIBS.forEach((t, i) => { const tip = emit(t.pts, ramp(fr, t.grow, 34, 'out'), cam, fr, { w: t.w, base: 0.62, ramp: true, pn: 2.2, speed: 0.018, seed: i * 0.37, on: ramp(fr, t.grow + 34, 24, 'smooth') }, sharpT, nearT); if (tip) tips.push([tip, false]); });
    const tt = emit(TRUNK, ramp(fr, 0, 36, 'out'), cam, fr, { w: 11, base: 0.95, pn: 4, speed: 0.022, seed: 0, on: ramp(fr, 36, 24, 'smooth') }, sharpM, nearM); if (tt) tips.push([tt, true]);
    const gl = D.glow.getContext('2d'); gl.clearRect(0, 0, 1920, 1080); strokeAll(gl, sharpM, c.accent, 3, 0.45);
    ctx2d.save(); ctx2d.globalAlpha = 0.75; ctx2d.filter = 'blur(7px)'; ctx2d.drawImage(D.glow, 0, 0); ctx2d.restore();
    strokeAll(ctx2d, sharpT, trib); strokeAll(ctx2d, sharpM, c.accent);
    for (const [t, trunk] of tips) {
      const r = Math.max(3, Math.min(18, (trunk ? 7000 : 4200) / t.zr)), tg = ctx2d.createRadialGradient(t.sx, t.sy, 0, t.sx, t.sy, r * 5);
      tg.addColorStop(0, rgba('#ffffff', 0.9)); tg.addColorStop(0.3, rgba(c.accent, 0.35)); tg.addColorStop(1, rgba(c.accent, 0));
      ctx2d.fillStyle = tg; ctx2d.beginPath(); ctx2d.arc(t.sx, t.sy, r * 5, 0, Math.PI * 2); ctx2d.fill();
      ctx2d.fillStyle = '#ffffff'; ctx2d.beginPath(); ctx2d.arc(t.sx, t.sy, r * 0.6, 0, Math.PI * 2); ctx2d.fill();
    }
    // the vanishing point lights up: the hand-off to the title
    ctx2d.save(); ctx2d.globalCompositeOperation = 'screen'; ctx2d.globalAlpha = 0.25 + 0.75 * handoff;
    ctx2d.translate(VPX, HY); ctx2d.scale(1, 0.5); const vg = ctx2d.createRadialGradient(0, 0, 0, 0, 0, 520);
    vg.addColorStop(0, rgba(mix(c.accent, '#ffffff', 0.8), 0.55)); vg.addColorStop(0.22, rgba(c.accent, 0.22)); vg.addColorStop(0.7, rgba(c.accent, 0)); ctx2d.fillStyle = vg; ctx2d.fillRect(-520, -520, 1040, 1040); ctx2d.restore();
    ctx2d.save(); ctx2d.globalAlpha = 0.4 + 0.6 * handoff; ctx2d.shadowColor = rgba(c.accent, 0.6); ctx2d.shadowBlur = 24;
    ctx2d.fillStyle = mix(c.accent, '#ffffff', 0.85); ctx2d.beginPath(); ctx2d.arc(VPX, HY, 4, 0, Math.PI * 2); ctx2d.fill(); ctx2d.restore();
    // the pins, far first: a square pin on the line, a stem, a capsule with its number and name (to the stem's left
    // when it would leave the frame); scaled by depth
    const pins = D.pins.map((p) => ({ ...p, pr: project(p.p, cam) })).sort((a, b) => b.p.z - a.p.z);
    for (const p of pins) {
      if (fr < p.appear || p.pr.zr < 200) continue;
      const k = clamp(1500 / p.pr.zr, 0.7, 1.7), kt = Math.max(k, D.info / 25), fog = 1 - s01(3600, 8000, p.pr.zr), { sx, sy } = p.pr;
      const pin = ramp(fr, p.appear, 10, 'overshoot'), pinOp = ramp(fr, p.appear, 4, 'out'), stem = ramp(fr, p.appear + 2, 12, 'snappy'), tag = ramp(fr, p.appear + 6, 14, 'snappy'), stemH = 44 * k;
      ctx2d.save(); ctx2d.globalAlpha = fog;
      ctx2d.save(); ctx2d.globalAlpha = fog * pinOp; ctx2d.translate(sx, sy); ctx2d.scale(pin, pin);
      ctx2d.shadowColor = rgba(c.accent, 0.7); ctx2d.shadowBlur = 18 * k; rrect(ctx2d, -6 * k, -6 * k, 12 * k, 12 * k, 2.5 * k); ctx2d.fillStyle = c.accent; ctx2d.fill();
      ctx2d.shadowColor = 'transparent'; ctx2d.strokeStyle = rgba(c.ground, 0.9); ctx2d.lineWidth = 3 * k; rrect(ctx2d, -7.5 * k, -7.5 * k, 15 * k, 15 * k, 4 * k); ctx2d.stroke(); ctx2d.restore();
      if (stem > 0) { const sg = ctx2d.createLinearGradient(0, sy - 8 * k, 0, sy - 8 * k - stemH * stem); sg.addColorStop(0, rgba(c.accent, 0.7)); sg.addColorStop(1, rgba(c.ink, 0.25)); ctx2d.fillStyle = sg; ctx2d.fillRect(sx - 0.75, sy - 8 * k - stemH * stem, 1.5, stemH * stem); }
      if (tag > 0) {
        const fs = 25 * kt, fid = fontFor(D.look, 'mono', lang, fs, 600), fn = fontFor(D.look, 'text', lang, fs, 550);
        const wId = measure(ctx2d, p.id, fid).width, wN = measure(ctx2d, p.name, fn).width, h = 46 * kt, gap = 10 * kt;
        const w = 12 * kt + 7 * kt + gap + wId + gap + wN + 14 * kt, x = sx - 2 * k + w > 1880 ? sx + 2 * k - w : sx - 2 * k, y = sy - 8 * k - stemH - h + (1 - tag) * 14 * k, my = y + h / 2 + fs * 0.35;
        ctx2d.save(); ctx2d.globalAlpha = fog * tag; if (tag < 0.98) ctx2d.filter = `blur(${((1 - tag) * 6).toFixed(2)}px)`;
        ctx2d.shadowColor = rgba('#000000', 0.5); ctx2d.shadowBlur = 28 * k; ctx2d.shadowOffsetY = 10 * k;
        rrect(ctx2d, x, y, w, h, 10 * kt); ctx2d.fillStyle = rgba(mix(c.ground, c.panel, 0.5), 0.86); ctx2d.fill(); ctx2d.shadowColor = 'transparent';
        ctx2d.strokeStyle = rgba(c.ink, 0.12); ctx2d.lineWidth = 1; ctx2d.stroke();
        ctx2d.fillStyle = c.accent; ctx2d.beginPath(); ctx2d.arc(x + 12 * kt + 3.5 * kt, y + h / 2, 3.5 * kt, 0, Math.PI * 2); ctx2d.fill();
        let tx = x + 12 * kt + 7 * kt + gap;
        text(ctx2d, p.id, tx, my, fid, { color: c.accent }); tx += wId + gap;
        text(ctx2d, p.name, tx, my, fn, { color: c.ink });
        ctx2d.restore();
      }
      ctx2d.restore();
    }
    // the near layer, out of focus, over the pins: the lines sweeping past under the lens
    const nl = D.near.getContext('2d'); nl.clearRect(0, 0, 1920, 1080); strokeAll(nl, nearT, trib); strokeAll(nl, nearM, c.accent);
    ctx2d.save(); ctx2d.filter = 'blur(11px)'; ctx2d.drawImage(D.near, 0, 0); ctx2d.restore();
    // the landscape surfaces from the dark over the first 12 frames; a vignette holds the eye on the middle
    const up = ramp(fr, 0, 12, 'out'); if (up < 1) { ctx2d.fillStyle = rgba(c.ground, 0.65 * (1 - up)); ctx2d.fillRect(0, 0, 1920, 1080); }
    const vig = ctx2d.createRadialGradient(960, 540, 420, 960, 540, 1150); vig.addColorStop(0, rgba(mix(c.ground, '#000000', 0.6), 0)); vig.addColorStop(1, rgba(mix(c.ground, '#000000', 0.6), 0.55));
    ctx2d.fillStyle = vig; ctx2d.fillRect(0, 0, 1920, 1080);
    // the title in the sky, top left: the eyebrow, then two lines rising by word (Chinese by phrase), the second in the accent
    const ey = (1 - ramp(fr, EYE, 18, 'snappy')) * 12, y1 = TOP + 28 + 26 + D.size * 0.86;
    if (s.eyebrow) text(ctx2d, s.eyebrow, 120, TOP + 26 + ey, D.fe, { color: c.accent, alpha: ramp(fr, EYE, 14, 'out') });
    riseText(ctx2d, s.line1 || '', 120, y1, D.ft, { color: c.ink, lang, f: fr, start: T1, each: 20, gap: 5 });
    riseText(ctx2d, s.line2 || '', 120, y1 + D.size * 1.04, D.ft, { color: c.accent, lang, f: fr, start: T2, each: 20, gap: 5 });
  },
  // 0, 1: the first and the fifth pin's place on the screen (the camera's flight, seen through the perspective)
  track(u, s, ctx, D) { const cam = camAt(u * 15, D.end); return [0, 4].map((i) => { const pr = project(PINS[i].p, cam); return [pr.sx, pr.sy]; }); },
  blur() { return false; },
};

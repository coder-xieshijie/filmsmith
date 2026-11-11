// neon-marquee — a three-word recap as a wall of neon: each word runs as a row of hollow tube letters across a brick
// wall shot at an angle, odd rows one way and the middle row the other, and the rows light in turn (one lit, two
// dark glass) on a 42-frame cycle; at the end the rows lose power top to bottom with two flickers each, leaving the
// unlit tubes on the wall.
// Adapted from video-shotcraft demos/outro/neon-triple-marquee/NeonTripleMarquee.tsx (card
// references/shots/outro/neon-triple-marquee.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion, no CSS 3D): the wall is painted flat and
// projected in vertical strips through the same perspective (1700 px, rotateY −17° → −9°, scale 1 → 1.05); the
// three tube colours become one accent (the rows differ by when they are lit, not by hue; colours by role); the three
// words are a slot (demo words removed), set in the look's display face (no condensed system face), measured per
// language; the seam texture, spill, floor pools and the bottom row's reflection are drawn on the wall.
import { clamp, lerp, mix, rgba, rrect, measure, fontOf, canvasOf } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

const SIZE = 286, GAP = SIZE * 0.36, DOT = SIZE * 0.42, PW = 2900, PH = 1200, FLOOR = 900, ROW_Y = [28, 318, 608];
const SPEED = [9, 11, 9], DIR = [1, -1, 1];
const PERSP = 1700, PO = [960, 486], ORIGIN = [960, 520], LEFT = (1920 - PW) / 2, TOP = 40, OX = PW / 2, OY = PH * 0.4;
const IGNITE = [0, 1, 0.15, 0, 0.9, 0.6], KILL = [1, 0.2, 0.85, 0.1, 0.5, 0];
const ignite = (f, at) => { const k = Math.floor(f - at); return k < 0 ? 0 : k < IGNITE.length ? IGNITE[k] : 1; };
const kill = (f, at) => { const k = Math.floor(f - at); return k < 0 ? 1 : k < KILL.length ? KILL[k] : 0; };
const PERIOD = 42, SLOT = PERIOD / 3;
// one row lit at a time: 2 ignition frames, up in 3, a plateau, down in 5 overlapping the next row by 2 (never all dark)
const pulse = (f, i) => {
  if (f < 18) return 0;
  const ph = ((((f - 18) - i * SLOT) % PERIOD) + PERIOD) % PERIOD, len = SLOT + 2;
  if (ph >= len) return 0;
  const fl = ph < 1 ? 0.6 : ph < 2 ? 0.25 : 1;
  return Math.max(ramp(ph, 1, 3, 'out') * (1 - ramp(ph, len - 5, 5, 'exit')), 0) * fl;
};
const LIM = { en: { words: 1, chars: 9 }, zh: { chars: 3 } };

export default {
  id: 'neon-marquee', kind: 'scene',
  fits: ['claim', 'rest', 'lockup'],
  surface: ['canvas'],
  beats: { min: 10, max: 10 },
  needs: { motions: [], props: [], roles: ['ground', 'ink', 'accent'], type: ['display'] },
  slots: { words: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'word', limits: LIM } } },
  roles: ['ground', 'ink', 'accent'],
  summary: 'Three recap words as rows of neon tubes on an angled brick wall, running in opposite directions and lit in turn, then switched off row by row.',
  defaults: (ctx = {}) => ({ words: copy('steps', ctx.lang || 'en').slice(0, 3) }),
  plan(s, ctx) {
    return { beats: 10, reads: s.words.map((w) => ({ text: w, lang: ctx.lang })), cues: [{ beat: 0, kind: 'accent' }, { beat: 124 / 15, kind: 'end' }],
      motion: 'rows scroll, lit in turn; slow camera swing', settled: 142 / 15, peakAt: 18 / 15, pause: 8 / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en';
    if (!Array.isArray(s.words) || s.words.length !== 3) err.push('words: exactly three');
    (s.words || []).forEach((w, i) => { if (units(w, L) > (L === 'zh' ? LIM.zh.chars : LIM.en.words)) err.push(`words[${i}] too long`); });
    return err;
  },
  prepare(s, ctx) {
    const font = fontFor(NEUTRAL, 'display', ctx.lang, SIZE, 800, 'display'), g = canvasOf(8, 8).getContext('2d');
    const C = s.colors, rows = s.words.map((w, i) => { const ww = measure(g, w, font).width; const unit = ww + GAP + DOT + GAP; return { w, ww, unit, copies: Math.ceil(PW / unit) + 3, speed: SPEED[i], dir: DIR[i] }; });
    for (const R of rows) { R.glass = this.sprite(R, 6, C.accent, font); R.tube = this.sprite(R, 8, C.accent, font); R.core = this.sprite(R, 2.8, mix(C.accent, '#ffffff', 0.85), font); }
    return { font, rows, wall: canvasOf(PW, PH), floor: canvasOf(PW, 300) };
  },
  cam(f) { const c = ramp(f, 0, 150, 'smooth'); return { rot: (lerp(-17, -9, c) * Math.PI) / 180, scale: lerp(1, 1.05, c) }; },
  // a wall point (px of the 2900 × 1200 plane) on screen: scale and rotateY about the plane's origin, then perspective
  project(X, Y, V) {
    const dx = (X - OX) * V.scale, dy = (Y - OY) * V.scale, x = dx * Math.cos(V.rot), z = -dx * Math.sin(V.rot), k = PERSP / (PERSP - z);
    return [PO[0] + (ORIGIN[0] + x - PO[0]) * k, PO[1] + (ORIGIN[1] + dy - PO[1]) * k, k];
  },
  power(f) {
    const pw = [0, 1, 2].map((i) => ignite(f, i * 5) * kill(f, 124 + i * 6));
    const glass = [0, 1, 2].map((i) => Math.max(ignite(f, i * 5), f >= 124 ? 1 : 0) * (1 - 0.25 * ramp(f, 124 + i * 6 + 4, 8, 'out')));
    const lit = [0, 1, 2].map((i) => { const boot = f < 18 ? 0.7 * ignite(f, i * 5) * (1 - ramp(f, 12, 6, 'out')) : 0, kf = f >= 124 && f >= 124 + i * 6 ? 0.55 * kill(f, 124 + i * 6) : 0; return Math.max(boot, pulse(f, i) * pw[i], kf); });
    return { glass, lit };
  },
  // one row of tube letters: glass always (if powered once), the lit tube with three glows and its hot core. Each
  // layer is a sprite of one unit (word + diamond) made in prepare: the outline stroked at twice the tube width, then
  // the glyphs' fill erased, so only the outer contour of the union shows (a variable font's overlapping contours
  // would otherwise draw lines inside the letters).
  sprite(R, w, color, font) {
    const pad = 24, cv = canvasOf(Math.ceil(R.unit + pad * 2), Math.ceil(SIZE * 1.2 + pad * 2)), x = cv.getContext('2d');
    const base = pad + SIZE * 0.6, d = DOT * 0.6, dx = pad + R.ww + GAP + DOT * 0.2 + d / 2, dy = pad + SIZE * 0.34 - SIZE * 0.525 + SIZE * 0.6 + d / 2;
    x.font = fontOf(font); if ('letterSpacing' in x) x.letterSpacing = `${font.spacing ?? 0}px`; x.textBaseline = 'middle'; x.lineJoin = 'round';
    x.strokeStyle = color; x.lineWidth = w * 2; x.strokeText(R.w, pad, base);
    x.save(); x.translate(dx, dy); x.rotate(Math.PI / 4); rrect(x, -d / 2, -d / 2, d, d, 6); x.stroke(); x.restore();
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000000'; x.fillText(R.w, pad, base);
    x.save(); x.translate(dx, dy); x.rotate(Math.PI / 4); rrect(x, -d / 2, -d / 2, d, d, 6); x.fill(); x.restore();
    return { cv, pad, dy: SIZE * 0.6 - SIZE * 0.525 };
  },
  row(x, R, y, f, lit, glass, D, C, cheap) {
    const raw = (f * R.speed) % R.unit, off = R.dir === 1 ? -R.unit * 1.5 + raw : -R.unit * 0.5 - raw;
    const pass = (sp, alpha, blur, color) => {
      if (alpha <= 0.002) return;
      x.save(); x.globalAlpha = clamp(alpha);
      if (blur && !cheap) { x.shadowColor = color; x.shadowBlur = blur; }
      for (let i = 0; i < R.copies; i++) {
        const cx = off + i * R.unit;
        if (cx > PW + 50 || cx + R.unit < -50) continue;
        x.drawImage(sp.cv, cx - sp.pad, y - sp.pad - sp.dy);
      }
      x.restore();
    };
    pass(R.glass, 0.3 * glass, 0);
    if (lit > 0.02) {
      const a = Math.min(1, lit * 1.1);
      pass(R.tube, a, (40 + lit * 50) * 2, C.accent);
      pass(R.tube, a, (14 + lit * 22) * 2, C.accent);
      pass(R.tube, a, (3 + lit * 6) * 2, C.accent);
      pass(R.core, Math.min(1, lit * 1.3), 4, mix(C.accent, '#ffffff', 0.85));
    }
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, V = this.cam(f), P = this.power(f), x = D.wall.getContext('2d');
    const wallC = mix(C.ground, '#000000', 0.35), deep = mix(C.ground, '#000000', 0.6);
    ctx.fillStyle = deep; ctx.fillRect(0, 0, 1920, 1080);
    // the wall: base, faint brick seams, the spill of each lit row, the rows
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, PW, PH);
    x.fillStyle = wallC; x.fillRect(0, 0, PW, FLOOR);
    x.strokeStyle = rgba(C.ink, 0.04); x.lineWidth = 3; x.beginPath();
    for (let y = 0; y < FLOOR; y += 120) { x.moveTo(0, y + 1.5); x.lineTo(PW, y + 1.5); x.moveTo(0, y + 61.5); x.lineTo(PW, y + 61.5); }
    for (let y = 0; y < FLOOR; y += 120) for (let bx = 0; bx < PW; bx += 300) { x.moveTo(bx + 1.5, y); x.lineTo(bx + 1.5, y + 60); x.moveTo(bx + 151.5, y); x.lineTo(bx + 151.5, y + 60); x.moveTo(bx + 76.5, y + 60); x.lineTo(bx + 76.5, y + 120); x.moveTo(bx + 226.5, y + 60); x.lineTo(bx + 226.5, y + 120); }
    x.stroke();
    x.globalCompositeOperation = 'screen';
    D.rows.forEach((R, i) => {
      const a = 0.05 * P.glass[i] + P.lit[i] * 0.55; if (a <= 0.002) return;
      const top = ROW_Y[i] - 200, h = SIZE + 400;
      x.save(); x.globalAlpha = a; x.translate(PW / 2, top + h / 2); x.scale(PW * 0.5, h * 0.44);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(C.accent, 0.6)); g.addColorStop(0.45, rgba(C.accent, 0.12)); g.addColorStop(0.72, rgba(C.accent, 0));
      x.fillStyle = g; x.fillRect(-1, -1.2, 2, 2.4); x.restore();
    });
    x.globalCompositeOperation = 'source-over';
    D.rows.forEach((R, i) => this.row(x, R, ROW_Y[i], f, P.lit[i], P.glass[i], D, C, false));
    // the wet floor: a dark band, the bottom row mirrored in it (blurred, fading), the pools of light
    const fl = mix(C.ground, '#000000', 0.5);
    const fg = x.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fg.addColorStop(0, fl); fg.addColorStop(1, mix(fl, '#000000', 0.5));
    x.fillStyle = fg; x.fillRect(0, FLOOR, PW, 300);
    const r = D.floor.getContext('2d');
    r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, PW, 300);
    r.save(); r.translate(0, FLOOR); r.scale(1, -1);   // wall y → floor y = FLOOR − y (mirrored about the floor line)
    this.row(r, D.rows[2], ROW_Y[2], f, P.lit[2], P.glass[2], D, C, true); r.restore();
    r.globalCompositeOperation = 'destination-in'; const mg = r.createLinearGradient(0, 0, 0, 300); mg.addColorStop(0, rgba('#000000', 0.55)); mg.addColorStop(0.7, rgba('#000000', 0)); r.fillStyle = mg; r.fillRect(0, 0, PW, 300);
    x.save(); x.filter = 'blur(3px)'; x.drawImage(D.floor, 0, FLOOR); x.restore();
    x.globalCompositeOperation = 'screen';
    D.rows.forEach((R, i) => {
      const a = P.lit[i] * [0.18, 0.28, 0.5][i]; if (a <= 0.002) return;
      x.save(); x.globalAlpha = a; x.translate(PW / 2, FLOOR - 40 + 220 * 0.3); x.scale(PW * 0.46, 220 * 0.4);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(C.accent, 0.55)); g.addColorStop(0.7, rgba(C.accent, 0)); x.fillStyle = g; x.fillRect(-1.1, -1.2, 2.2, 2.6); x.restore();
    });
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = rgba(C.ink, 0.06); x.fillRect(0, FLOOR, PW, 2);
    // project the wall onto the frame in thin vertical strips (a strip at one depth is a scaled rectangle)
    const N = 290, sw = PW / N;
    for (let i = 0; i < N; i++) {
      const X0 = i * sw, X1 = X0 + sw, [a0] = this.project(X0, 0, V), [a1] = this.project(X1, 0, V), [, top] = this.project((X0 + X1) / 2, 0, V), [, bot] = this.project((X0 + X1) / 2, PH, V);
      if (a1 < -4 || a0 > 1924) continue;
      ctx.drawImage(D.wall, X0, 0, sw, PH, a0, top, a1 - a0 + 0.6, bot - top);
    }
  },
  // the wall's top corners on screen (compare pairs them with the upstream plane)
  // (as a bounding box: the left edge's x and the near corner's top, the right edge's x and the same top)
  track(u) { const V = this.cam(u * 15), a = this.project(0, 0, V), b = this.project(PW, 0, V), top = Math.min(a[1], b[1]); return [[a[0], top], [b[0], top]]; },
  blur() { return false; },
};


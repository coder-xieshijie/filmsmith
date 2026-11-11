// word-tunnel — keywords fly out of the depth toward the camera and past it, through a tunnel of faint rings and
// streaks, looping seamlessly behind a still title; the screen never stops moving but nothing shakes.
// Adapted from video-shotcraft demos/typography/flying-words/FlyingWords.tsx (card references/shots/typography/flying-words.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React or Remotion) in Canvas2D with the same hand-computed
// perspective; colours by role (one accent for a few keywords, the rest in ink tones); brand mark, capability words,
// eyebrow and backdrop removed: the words and the title are slots; serif italics become a lighter weight (Chinese has
// no italic); seeded placement from rng.js; the trails are drawn copies along the screen velocity.
//
// A loop: p = 0 and p = 1 draw the same frame. Its track() is the still title only, so hosts add no motion blur and the
// "lands settled" check reads the title, which never moves (the tunnel is a background layer, never a landing).
import { clamp, ground, rgba, mix, text } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { fontSpec, pick, langOf } from '../../motion/type-enter/type.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, infoSize } from '../../sample.js';

const K = { P: 4400, z0: -7000, z1: 3200, cx: 960, cy: 540, rings: 10, dust: 56 };
const OP = [0, 1, 0.5, 0.2, 0], OT = [0, 0.25, 0.6, 0.85, 1];
const life = (u) => { for (let k = 0; k < 4; k++) if (u <= OT[k + 1]) return OP[k] + ((OP[k + 1] - OP[k]) * (u - OT[k])) / (OT[k + 1] - OT[k]); return 0; };
const project = (x, y, u, roll, drift = true) => {
  const z = K.z0 + (K.z1 - K.z0) * u, d = drift ? 0.5 + u * 1.35 : 1, s = K.P / (K.P - z);
  const c = Math.cos(roll), sn = Math.sin(roll), rx = x * c - y * sn, ry = x * sn + y * c;
  return [K.cx + rx * d * s, K.cy + ry * d * s, s];
};
const WORDS = {
  en: ['Drafts', 'Reviews', 'Renders', 'Notes', 'Exports', 'Plan', 'Ship', 'Rough cuts', 'Releases', 'Weekly review', 'Last 30 days', 'Frames checked', 'Shots approved', 'Cuts on the beat', 'Workspace', 'Good morning'],
  zh: ['草稿', '审阅', '渲染', '笔记', '导出', '规划', '发布', '粗剪', '版本', '每周回顾', '最近 30 天', '检查过的帧', '通过的镜头', '踩在拍点上', '工作台', '早上好'],
};
const norm = (P) => {
  const lang = langOf(pick(P.title, P.lang || 'en'), P.lang);
  return { ...P, lang, words: pick(P.words, lang), title: pick(P.title, lang), eyebrow: pick(P.eyebrow, lang) };
};

export default {
  id: 'word-tunnel', kind: 'scene',
  fits: ['hook', 'rest', 'lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 16 },
  beatsFor(P) { return P.beats || 12; },
  needs: { motions: [], props: [], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    words: { type: 'list', count: [12, 28], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } } },
    title: { type: 'text', tier: 'primary', claim: true, optional: true, limits: { en: { words: 6, chars: 32 }, zh: { chars: 14 } } },
    eyebrow: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 24 }, zh: { chars: 10 } } },
  },
  plan(s, ctx = {}) { const beats = s.beats || 12; return { beats, reads: s.title ? 1 : 0, cues: [], settled: 0, peakAt: null, pause: null, loop: true }; },
  validate(s, ctx = {}) { const P = norm({ words: WORDS, ...s, lang: ctx.lang }), n = P.words.length; return n < 12 || n > 28 ? [`words: ${n}, want 12–28`] : []; },
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the tunnel at its loop point', to: 'the same frame (a seamless loop)',
  interpolates: ['each word\'s depth z (linear, two laps per loop), its opacity over its life [0, 1, 0.5, 0.2, 0]', 'rings pushing toward the camera, streaks of dust', 'a slow roll of ±2.5°'],
  summary: 'Keywords fly out of the depth toward the camera and past it through a tunnel of faint rings and streaks, looping seamlessly behind a still title.',
  theory: 'Motion in depth carries "a lot, fast" without asking to be read (optic flow, Gibson 1950); the life curve keeps every word readable only at mid-distance, and the still title stays the figure on a moving ground.',
  defaults: () => ({ words: WORDS, title: { en: 'Every render, checked', zh: '每一次渲染都检查过' }, eyebrow: { en: 'WORKSPACE', zh: '工作台' },
    accents: [2, 6, 11, 14], light: [1, 5, 9, 13, 17, 21], cycles: 2, seed: 3, probes: false }),
  prepare(P) {
    P = norm(P);
    const n = P.words.length, r = (i) => hash(i, P.seed);
    const items = P.words.map((w, i) => {
      const a = i * 2.39996 + r(i * 7 + 1) * 0.8, rad = 330 + r(i * 13 + 2) * 660;
      return { w, accent: P.accents.includes(i), light: P.light.includes(i), size: 64 + r(i + 3) * 56, tone: Math.floor(r(i + 5) * 3),
        x: Math.cos(a) * rad, y: Math.sin(a) * rad * 0.6, rz: (r(i + 21) - 0.5) * 12, ph: i / n };
    });
    const dust = Array.from({ length: K.dust }, (_, i) => { const a = i * 2.39996 + r(i * 5 + 77) * 1.2, rad = 180 + r(i * 3 + 91) * 1500; return { x: Math.cos(a) * rad, y: Math.sin(a) * rad * 0.62, ph: r(i * 9 + 13), w: 1 + r(i + 50) * 1.6 }; });
    const tf = fontSpec({ ...P, size: P.lang === 'zh' ? 104 : 112, weight: 750 }), ef = fontFor(NEUTRAL, 'mono', P.lang, infoSize(P.lang) + 2, 600, 'label');
    return { N: P, items, dust, tf, ef, frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) { const t = p >= 1 ? 0 : p; return { p, t, roll: (2.5 * Math.PI / 180) * Math.sin(t * Math.PI * 2) }; },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, t = S.t, roll = S.roll, du = P.cycles / D.frames;
    ground(ctx, P);
    // the far glow at the end of the tunnel, breathing twice a loop
    const gb = 0.82 + 0.14 * Math.sin(t * Math.PI * 4);
    const gr = ctx.createRadialGradient(K.cx, K.cy, 0, K.cx, K.cy, 520);
    gr.addColorStop(0, rgba(c.accent, 0.22 * gb)); gr.addColorStop(0.38, rgba(c.accent, 0.06 * gb)); gr.addColorStop(0.7, rgba(c.accent, 0));
    ctx.save(); ctx.translate(K.cx, K.cy); ctx.scale(1, 0.7); ctx.translate(-K.cx, -K.cy); ctx.fillStyle = gr; ctx.fillRect(0, 0, 1920, 1080 / 0.7 + 400); ctx.restore();
    // rings
    for (let k = 0; k < K.rings; k++) {
      const u = (t * P.cycles + k / K.rings) % 1, [, , s] = project(0, 0, u, roll, false), rx = 1150 * s;
      const op = Math.min(1, u / 0.3) * (1 - clamp((u - 0.55) / 0.3));
      if (op <= 0.01) continue;
      ctx.save(); ctx.translate(K.cx, K.cy); ctx.rotate(roll); ctx.strokeStyle = rgba(c.accent, op * 0.16); ctx.lineWidth = 1 + s * 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, rx, rx * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    // dust streaks: the segment a speck covers in 2.6 frames
    ctx.save(); ctx.lineCap = 'round';
    for (const d of D.dust) {
      const u = (t * P.cycles + d.ph) % 1, op = life(u) * 0.75;
      if (op <= 0.01) continue;
      const a = project(d.x, d.y, Math.max(0, u - du * 2.6), roll), b = project(d.x, d.y, u, roll);
      ctx.strokeStyle = rgba(mix(c.ink, c.accent, 0.3), op); ctx.lineWidth = d.w * Math.min(2.4, b[2]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
    // words, far to near
    const tones = [c.ink, mix(c.ink, c.ground, 0.25), mix(c.ink, c.ground, 0.5)];
    const order = D.items.map((it) => ({ it, u: (t * P.cycles + it.ph) % 1 })).sort((a, b) => a.u - b.u);
    for (const { it, u } of order) {
      const [x, y, s] = project(it.x, it.y, u, roll), [qx, qy] = project(it.x, it.y, Math.max(0, u - du), roll);
      const k = ((x - K.cx) / 760) ** 2 + ((y - K.cy) / 190) ** 2, occl = P.title && k < 1 ? 0.2 + 0.8 * k * k : 1;
      const op = life(u) * occl;
      if (op <= 0.005) continue;
      const blur = (u < 0.22 ? (1 - u / 0.22) * 2.2 : 0) + (u > 0.86 ? (u - 0.86) * 60 : 0);
      const f = fontSpec({ ...P, size: it.size * s, weight: it.light ? 400 : 700 }, it.size * s, it.light ? 400 : 700, 'display');
      const col = it.accent ? c.accent : tones[it.tone], vx = x - qx, vy = y - qy, sp = Math.hypot(vx, vy);
      const draw = (dx, dy, a) => { ctx.save(); ctx.globalAlpha = a; if (blur > 0.2) ctx.filter = `blur(${blur.toFixed(2)}px)`; ctx.translate(x - dx, y - dy); ctx.rotate((it.rz * Math.PI) / 180 + roll); text(ctx, it.w, 0, it.size * s * 0.35, f, { color: col, align: 'center' }); ctx.restore(); };
      if (sp > 6) for (let j = 6; j >= 1; j--) draw((vx * j * 0.9) / 6, (vy * j * 0.9) / 6, op * 0.12 * (1 - j / 7));
      draw(0, 0, op);
    }
    // the still title in front, on a dark veil
    if (P.title) {
      const v = ctx.createRadialGradient(K.cx, K.cy, 0, K.cx, K.cy, 760);
      v.addColorStop(0, rgba(c.ground, 0.75)); v.addColorStop(1, rgba(c.ground, 0));
      ctx.save(); ctx.translate(K.cx, K.cy); ctx.scale(1, 0.32); ctx.translate(-K.cx, -K.cy); ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 3400); ctx.restore();
      if (P.eyebrow) text(ctx, P.eyebrow, K.cx, K.cy - 92, D.ef, { color: c.accent, align: 'center' });
      text(ctx, P.title, K.cx, K.cy + D.tf.size * 0.35, D.tf, { color: c.ink, align: 'center' });
    }
  },
  // the still title; `probes` adds the first word's projection scale (×100 px) for the comparison
  track(S, P, D) {
    if (!D.N.probes) return [[K.cx, K.cy]];
    const it = D.items[0], u = (S.t * D.N.cycles + it.ph) % 1;
    return [[K.cx, K.cy], [960 + 100 * project(it.x, it.y, u, S.roll)[2], 540]];
  },
};

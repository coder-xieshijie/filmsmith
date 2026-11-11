// space-steps — three chapter cards hang in one 3D space, each with its own place, turn and roll; the camera holds on
// one, then flies to the next (pulling back a little mid-flight), the next title rising as it lands, and at the end
// pulls back 2.7× to show all three at once while the closing line rises in front of them.
// Adapted from video-shotcraft demos/camera/basic-3d-scene/Basic3DScene.tsx (card references/shots/camera/basic-3d-scene.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion) over the motion brick pose-fly (the poses, the flight
// curve and its 30 % hop, the focus of the cards away from the camera are its own; each flight is one pose-fly at());
// colours by role (cards in panel with a line rim, the chapter number, the progress line and the closing kicker in the
// accent); brand, wordmark and every word removed (each chapter's kicker, title and line, the closing kicker, headline
// and subline are slots); the cards are canvases repainted every frame (a fixed-resolution texture, so the 2.7×
// overview stays pixel-pure) and the defocus blur and the motion-blur subframes are left out (the cards away from the
// camera only dim); the timetable (holds 0–36, 64–96, 128–158, flights 36–64, 96–128, 158–190), the 1.06 → 1 push in,
// the 1.5 % creep on every hold and on the overview, the title's character rise 8 frames before landing, the progress
// line along each card's foot, the cropped outline chapter number and the closing plate at frame 184 are the upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { fontFor, caseOf, wrap, readTime, breaks } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import fly from '../../motion/pose-fly/brick.js';

const CW = 1240, CH = 700, M = 140, PERSP = 2600, END = 225;
const FLIGHTS = [[36, 64], [96, 128], [158, 190]], ARRIVE = [0, 64, 128, 190], HOLD_END = [36, 96, 158, 225], PLATE = 184;
const POSES = fly.defaults().poses;
const KEYS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's'];
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });
const DEFAULT = {
  en: { chapters: [{ kicker: 'Frame', title: 'Frame.', line: 'Real pages, staged for the camera.' }, { kicker: 'Craft', title: 'Craft.', line: 'Every move written as a recipe.' }, { kicker: 'Ship', title: 'Ship.', line: 'One prompt to a finished film.' }],
    kicker: 'Three chapters, one film', headline: 'Make it move.', subline: 'Recipes for product films that move.' },
  zh: { chapters: [{ kicker: '取景', title: '取景', line: '真实页面，为镜头布好位。' }, { kicker: '打磨', title: '打磨', line: '每个动作都写成配方。' }, { kicker: '发布', title: '发布', line: '一句话，出一支成片。' }],
    kicker: '三章，一支片', headline: '把镜头做好', subline: '让产品片动起来的配方' },
};
// 4 × 4 column-major matrices in CSS order, for the track (the screen box of a card)
const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
const rad = (d) => (d * Math.PI) / 180;
const Tm = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const Sm = (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];   // CSS scale(s) is 2D: z is not scaled
const RXm = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
const RYm = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
const RZm = (d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
const chain = (...ms) => ms.reduce((a, b) => mul(a, b));
const camCSS = (c) => `scale(${n(1 / c.s, 5)}) rotateZ(${n(-c.rz)}deg) rotateY(${n(-c.ry)}deg) rotateX(${n(-c.rx)}deg) translate3d(${n(-c.x, 3)}px,${n(-c.y, 3)}px,${n(-c.z, 3)}px)`;
const poseCSS = (p, lift = 0) => `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s}) translateZ(${n(lift, 2)}px)`;
const screen = (c, p, lift, x, y) => {
  const m = chain(Sm(1 / c.s), RZm(-c.rz), RYm(-c.ry), RXm(-c.rx), Tm(-c.x, -c.y, -c.z), Tm(p.x, p.y, p.z), RXm(p.rx), RYm(p.ry), RZm(p.rz), Sm(p.s), Tm(0, 0, lift));
  const X = m[0] * x + m[4] * y + m[12], Y = m[1] * x + m[5] * y + m[13], Z = m[2] * x + m[6] * y + m[14], k = PERSP / (PERSP - Z);
  return [960 + X * k, 540 + Y * k];
};
const hash = (k) => { const x = Math.sin(k * 91.345 + 47.853) * 43758.5453; return x - Math.floor(x); };
const MOTES = Array.from({ length: 70 }, (_, i) => ({ x: -2600 + hash(i * 3.1) * 6800, y: -2000 + hash(i * 5.7 + 1) * 4800, z: -3200 + hash(i * 7.3 + 2) * 3600, r: 3 + hash(i * 11.9 + 3) * 7, a: 0.25 + hash(i * 13.1 + 4) * 0.55 }));
// a line rising unit by unit (characters when `chars`), each clipped under its own baseline
const riseUnits = (g, units, x, y, font, color, f, start, each, gap) => {
  let cx = x;
  units.forEach((u, i) => {
    const w = measure(g, u, font).width, p = EASE.snappy(clamp((f - start - i * gap) / each));
    if (p > 0) { g.save(); g.beginPath(); g.rect(cx - 6, y - font.size * 1.1, w + 12, font.size * 1.36); g.clip(); text(g, u, cx, y + (1 - p) * font.size * 1.3, font, { color }); g.restore(); }
    cx += w;
  });
};

export default {
  id: 'space-steps', kind: 'scene',
  fits: ['demo', 'turn', 'lockup'],
  surface: ['dom'],
  beats: { min: 15, max: 15 },
  beatsFor: () => 15,
  needs: { motions: ['pose-fly'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    chapters: { type: 'list', count: [3, 3], of: {
      kicker: { type: 'text', tier: 'glance', limits: lim(14, 6, 2) },
      title: { type: 'text', tier: 'word', limits: lim(9, 4, 1) },
      line: { type: 'text', tier: 'glance', limits: lim(40, 14, 8) },
    } },
    kicker: { type: 'text', tier: 'glance', optional: true, limits: lim(28, 10, 5) },
    headline: { type: 'text', tier: 'primary', claim: true, limits: lim(20, 8, 4) },
    subline: { type: 'text', tier: 'glance', optional: true, limits: lim(40, 14, 7) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'Three chapter cards hang in one 3D space; the camera holds on each, flies to the next as its title rises, then pulls back to show all three under the closing line.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    return { beats: 15, reads: [...s.chapters.map((c) => ({ text: `${c.title} ${c.line}`, lang: ctx.lang })), { text: s.headline, lang: ctx.lang }],
      cues: ARRIVE.map((a, i) => ({ beat: a / 15, kind: i === 3 ? 'land' : i ? 'turn' : 'accent' })),
      motion: 'pose-fly three times: card → card → card → overview', settled: 212 / 15, peakAt: null, pause: (END - 212) / 15 };
  },
  validate(s, ctx) {
    const e = [];
    if ((s.chapters || []).length !== 3) e.push('chapters: exactly three');
    // a card reads from its title's rise to the next flight's start (about 1.7 s), and once more in the overview
    (s.chapters || []).forEach((c, i) => { if (readTime(`${c.title} ${c.line}`, ctx.lang) > 3.2) e.push(`chapters[${i}]: too long to read in one stop`); });
    return e;
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  prepare() { return {}; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  // the camera at frame f: the 1.06 → 1 push in, the flight under way (one pose-fly at()), the creep of each hold
  at(p, P) {
    const f = clamp(p) * END, flyP = { cards: [0, 1, 2], poses: POSES };
    let k = FLIGHTS.findIndex(([a, b]) => f < b), S;
    if (k < 0) k = 2;
    const [a, b] = FLIGHTS[k];
    S = fly.at(clamp((f - a) / (b - a)), { ...flyP, from: k, to: k + 1 });
    const cam = {}; for (const key of KEYS) cam[key] = S.cam[key];
    cam.s *= 1 + 0.06 * (1 - ramp(f, 0, 30, EASE.snappy));
    let creep = 0;
    for (let i = 0; i < 3; i++) creep += ramp(f, ARRIVE[i] + 4, HOLD_END[i] - ARRIVE[i], EASE.smooth) * (1 - ramp(f, FLIGHTS[i][0], 14, EASE.smooth));
    cam.s *= (1 - 0.015 * creep) * (1 - 0.015 * ramp(f, 196, 29, EASE.smooth));
    const over = ramp(f, FLIGHTS[2][0], FLIGHTS[2][1] - FLIGHTS[2][0], EASE.smooth);
    return { p, f, cam, af: S.af, over };
  },
  build(root, P) {
    const c = P.colors;
    root.style.background = `radial-gradient(ellipse 70% 60% at 50% -8%, ${mix(c.ground, c.ink, 0.12)} 0%, ${c.ground} 70%)`;
    const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${PERSP}px` }, root);
    const world = el('div', { position: 'absolute', left: '50%', top: '50%', width: '0', height: '0', transformStyle: 'preserve-3d' }, stage);
    for (const m of MOTES) {
      const d = el('canvas', { position: 'absolute', left: `${-m.r}px`, top: `${-m.r}px`, width: `${m.r * 2}px`, height: `${m.r * 2}px`, transform: `translate3d(${n(m.x, 2)}px,${n(m.y, 2)}px,${n(m.z, 2)}px)` }, world);
      d.width = d.height = 32; const g = d.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, rgba(c.ink, m.a)); gr.addColorStop(0.7, rgba(c.ink, 0)); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    }
    const cards = [0, 1, 2].map((i) => {
      const d = el('canvas', { position: 'absolute', left: `${-CW / 2 - M}px`, top: `${-CH / 2 - M}px`, width: `${CW + 2 * M}px`, height: `${CH + 2 * M}px`, transform: poseCSS(POSES[i]) }, world);
      d.width = CW + 2 * M; d.height = CH + 2 * M;
      return { d, g: d.getContext('2d') };
    });
    // the closing plate hangs at the overview pose, laid out 2.7× so the camera sees it at 1:1
    const plate = el('canvas', { position: 'absolute', left: '-960px', top: '-540px', width: '1920px', height: '1080px', transform: poseCSS(POSES[3]) }, world);
    plate.width = 1920; plate.height = 1080;
    return { root, stage, world, cards, plate, pg: plate.getContext('2d'), blurTarget: null };
  },
  // one card at frame f: panel with a lit top edge, the cropped chapter number, kicker, title, line, progress
  card(g, i, f, focus, P) {
    const c = P.colors, s = P, L = s.lang, ch = s.chapters[i], arrive = ARRIVE[i], reveal = arrive - (i === 0 ? -2 : 8);
    const hold = ramp(f, arrive, HOLD_END[i] - arrive, EASE.smooth), numIn = ramp(f, reveal - 4, 26, EASE.out), bodyIn = ramp(f, reveal + 8, 18, EASE.out);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW + 2 * M, CH + 2 * M); g.translate(M, M);
    g.save(); g.shadowColor = rgba(mix(c.ground, '#000000', 0.85), 0.7); g.shadowBlur = 80; g.shadowOffsetY = 30;
    rrect(g, 10, 10, CW - 20, CH - 20, 24); g.fillStyle = c.panel; g.fill(); g.restore();
    g.save(); rrect(g, 0, 0, CW, CH, 34); g.clip();
    const bg = g.createLinearGradient(0, 0, CW * 0.4, CH * 1.1); bg.addColorStop(0, mix(c.panel, c.ink, 0.05)); bg.addColorStop(0.55, c.panel); bg.addColorStop(1, mix(c.panel, c.ground, 0.4));
    g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
    const lit = g.createLinearGradient(0, 0, CW, 0); lit.addColorStop(0, rgba(c.ink, 0)); lit.addColorStop(0.5, rgba(c.ink, 0.35 * (0.4 + 0.6 * focus))); lit.addColorStop(1, rgba(c.ink, 0));
    g.fillStyle = lit; g.fillRect(0, 0, CW, 2);
    // the chapter number, thin and huge, cropped by the card's right and bottom edges
    const no = String(i + 1).padStart(2, '0'), nf = this.F(s, 'display', 560, 200, 'display');
    if (numIn > 0) {
      const ng = g.createLinearGradient(0, CH - 420, 120, CH + 120); ng.addColorStop(0.1, rgba(c.ink, 0.16)); ng.addColorStop(0.7, rgba(c.ink, 0.02));
      text(g, no, CW + 36, CH + 6 + (1 - numIn) * 60, { ...nf, spacing: -0.06 * nf.size }, { color: ng, align: 'right', alpha: numIn });
    }
    // the eyebrow: number in the accent, a short rule, the kicker
    const ef = this.F(s, 'mono', L === 'zh' ? 28 : 26, 600, 'label'), kk = caseOf(ch.kicker, s.look || NEUTRAL, 'label', L), efs = { ...ef, spacing: 0.14 * ef.size };
    text(g, no, 84, 74 + 26, efs, { color: c.accent });
    const nw = measure(g, no, efs).width;
    g.fillStyle = rgba(c.accent, 0.6); g.fillRect(84 + nw + 18, 74 + 17, 44, 1.5);
    text(g, kk.text, 84 + nw + 18 + 44 + 18, 74 + 26, { ...ef, spacing: Math.max(kk.tracking, 0.1) * ef.size }, { color: c.dim });
    // the title rises character by character (the upstream's 20-frame rise, 1.8 frames apart)
    const tf = this.F(s, 'display', L === 'zh' ? 140 : 156, 760, 'display');
    riseUnits(g, [...ch.title], 84, 254 + tf.size * 0.86, tf, c.ink, f, reveal, 20, 1.8);
    const lf = this.F(s, 'text', L === 'zh' ? 40 : 44, 420);
    if (bodyIn > 0) wrap(g, ch.line, lf, 820, L).slice(0, 2).forEach((ln, k) => text(g, ln, 84, 254 + tf.size * 1.05 + 34 + lf.size + k * lf.size * 1.3 + (1 - bodyIn) * 18, lf, { color: mix(c.dim, c.ink, 0.35), alpha: bodyIn }));
    // the progress along the foot: earlier chapters full, this one filling while it holds
    const bw = (CW - 168 - 28) / 3;
    for (let k = 0; k < 3; k++) {
      const x = 84 + k * (bw + 14), y = CH - 70 - 3, w = (k < i ? 1 : k === i ? hold : 0) * bw;
      rrect(g, x, y, bw, 3, 1.5); g.fillStyle = rgba(c.ink, 0.1); g.fill();
      if (w > 0.5) {
        g.save(); if (k === i) { g.shadowColor = rgba(c.accent, 0.6); g.shadowBlur = 10 * focus; }
        rrect(g, x, y, w, 3, 1.5); g.fillStyle = k === i ? c.accent : rgba(c.ink, 0.45); g.fill(); g.restore();
      }
    }
    g.restore();
    rrect(g, 0.75, 0.75, CW - 1.5, CH - 1.5, 33.25); g.strokeStyle = mix(c.line, c.ink, 0.15 * focus); g.lineWidth = 1.5; g.stroke();
  },
  // the closing plate, 1:1 on screen at the overview: kicker, headline word by word, subline
  closing(g, f, P) {
    const c = P.colors, s = P, L = s.lang, kick = ramp(f, PLATE, 22, EASE.snappy), sub = ramp(f, PLATE + 20, 18, EASE.out);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
    if (f < PLATE - 1) return;
    const hf = this.F(s, 'display', L === 'zh' ? 136 : 150, 400, 'display'), sf = this.F(s, 'text', L === 'zh' ? 36 : 38, 420);
    const yb = 1080 - 128, ys = yb - (s.subline ? sf.size * 1.3 : 0), yh = ys - (s.subline ? 22 : 0) - hf.size * 0.22;
    if (s.kicker) {
      const ef = this.F(s, 'mono', L === 'zh' ? 26 : 24, 600, 'label'), kk = caseOf(s.kicker, s.look || NEUTRAL, 'label', L);
      text(g, kk.text, 120, yh - hf.size * 0.95 - 26, { ...ef, spacing: (0.16 + (0.6 - 0.16) * (1 - kick)) * ef.size }, { color: c.accent, alpha: kick });
    }
    riseUnits(g, breaks(s.headline, L).map((u, i) => (i ? u.sep : '') + u.w), 120, yh, hf, c.ink, f, PLATE + 6, 22, 5);
    if (s.subline) text(g, s.subline, 120, yb + (1 - sub) * 14, sf, { color: mix(c.dim, c.ink, 0.35), alpha: sub });
  },
  pose(R, S, P) {
    R.world.style.transform = camCSS(S.cam);
    R.cards.forEach((card, i) => {
      const d = Math.min(1, Math.abs(S.af - i)), focus = Math.max(1 - d, S.over * 0.85), lift = (1 - d) * 18;
      card.d.style.transform = poseCSS(POSES[i], lift);
      card.d.style.opacity = n(0.22 + 0.78 * focus, 4);
      this.card(card.g, i, S.f, focus, P);
    });
    R.plate.style.opacity = n(ramp(S.f, 176, 16, EASE.out), 4);
    this.closing(R.pg, S.f, P);
  },
  // 0: the centre of the card the camera is nearest (its screen box); 1–3: each card's centre while it is near the
  // frame (null once its centre leaves the frame: off frame and near the eye its projection races)
  track(S) {
    const centre = (i) => {
      const d = Math.min(1, Math.abs(S.af - i)), lift = (1 - d) * 18;
      const q = [[-CW / 2, -CH / 2], [CW / 2, -CH / 2], [-CW / 2, CH / 2], [CW / 2, CH / 2]].map(([x, y]) => screen(S.cam, POSES[i], lift, x, y));
      const xs = q.map((v) => v[0]), ys = q.map((v) => v[1]);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    };
    const near = ([x, y]) => x > 0 && x < 1920 && y > 0 && y < 1080;
    const all = [0, 1, 2].map(centre);
    return [all[Math.min(2, Math.max(0, Math.round(S.af)))], ...all.map((c) => (near(c) ? c : null))];
  },
  blur: () => false,
};

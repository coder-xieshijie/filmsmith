// flock-finale — the closing poster of a film: three of its pages stand edge-on, tumble into a stair and keep turning;
// then in ten frames they are pulled into one point, which flashes white-hot, a single ring of smoke grows out of it,
// and the title slams in at the ring's centre with the eyebrow above and the tagline below.
// Adapted from video-shotcraft demos/transition/card-flock-tumble/CardFlockTumble.tsx (card references/shots/transition/card-flock-tumble.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion) over the motion brick tumble-stair (the edge-on start,
// the spline flight into the stair and the idle turn are its own; its cards are its painters or the film's scenes);
// colours by role (the ring, the backlight, the flash's halo and the title's glow in the accent, the wall and the title
// in the ink); brand, mark, wordmark and every word removed (the wall's words, eyebrow, title and tagline are slots,
// sample copy by default); the pull (10 frames, quad in, toward the converge poses, fading over its last 45 %), the
// core flash (6-frame decay with a light wash), the one turbulent smoke ring (three layers displaced by fractal noise,
// slowing as it grows, never quite gone), the title's slam (1.22 → 1 with the tracking closing, snappy 14 frames, then
// a slow growth) and the outlined word wall drifting in two rows are the upstream's; grain and vignette are left out.
// The pull and the ring are drawn here; the collapse-burst ring variant the dispositions name is not in variants/ yet.
import { clamp, mix, rgba, text, measure, fontOf } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { fontFor, caseOf, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';
import tumble from '../../motion/tumble-stair/brick.js';

const END = 135, OUT = [62, 72], RING_T0 = 70, TEXT_T0 = 74, CY = 570, PERSP = 1400, CW = 560, CH = 400;
const CONV = [{ x: -20, y: -12, rx: 0, ry: 55, rz: 4, s: 0.12 }, { x: 0, y: 0, rx: 0, ry: 60, rz: 4, s: 0.12 }, { x: 15, y: 10, rx: 0, ry: 65, rz: 4, s: 0.12 }];
const KEYS = ['x', 'y', 'rx', 'ry', 'rz', 's'];
const rad = (d) => (d * Math.PI) / 180;
// tumble-stair's projection of a card point (scale, rotateZ, rotateY, rotateX, translate, perspective at CY)
const project = (q, u, v) => {
  let x = u * q.s, y = v * q.s, z = 0;
  [x, y] = [x * Math.cos(rad(q.rz)) - y * Math.sin(rad(q.rz)), x * Math.sin(rad(q.rz)) + y * Math.cos(rad(q.rz))];
  [x, z] = [x * Math.cos(rad(q.ry)) + z * Math.sin(rad(q.ry)), -x * Math.sin(rad(q.ry)) + z * Math.cos(rad(q.ry))];
  [y, z] = [y * Math.cos(rad(q.rx)) - z * Math.sin(rad(q.rx)), y * Math.sin(rad(q.rx)) + z * Math.cos(rad(q.rx))];
  const k = PERSP / (PERSP - z);
  return [960 + (q.x + x) * k, CY + (q.y + y) * k];
};
const lm = (a, b, t) => a + (b - a) * t;
const quadIn = (u) => u * u, cubicIn = (u) => u * u * u, cubicOut = (u) => 1 - (1 - u) ** 3;
const lerpK = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return ks[i - 1][1] + ((ks[i][1] - ks[i - 1][1]) * (t - ks[i - 1][0])) / (ks[i][0] - ks[i - 1][0]); return ks[ks.length - 1][1]; };
const DEFAULT = {
  en: { wall: 'Make it move', eyebrow: 'Tidewell', title: 'Cinematic', tagline: 'Every render, checked before it ships.' },
  zh: { wall: 'Make it move', eyebrow: 'Tidewell', title: '一镜到底', tagline: '每一版都检查过。' },
};

export default {
  id: 'flock-finale', kind: 'scene',
  fits: ['lockup', 'climax'],
  surface: ['dom'],
  beats: { min: 9, max: 9 },
  beatsFor: () => 9,
  needs: { motions: ['tumble-stair'], props: [], roles: ['ground', 'panel', 'ink', 'line', 'accent'], type: ['display', 'text'] },
  slots: {
    cards: { type: 'list', count: [3, 3], optional: true, of: { type: 'brick' } },
    wall: { type: 'text', tier: 'texture', optional: true, limits: { en: { words: 4, chars: 20 }, zh: { chars: 20 } } },
    eyebrow: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 16 }, zh: { chars: 8 } } },
    title: { type: 'text', tier: 'word', claim: true, limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    tagline: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 7, chars: 40 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'panel', 'ink', 'line', 'accent'],
  summary: 'Three pages tumble edge-on into a stair, are pulled into one point that flashes, and a single smoke ring grows out of it around the slammed title.',
  defaults: (ctx = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])), cards: null }),
  plan(s, ctx) {
    return { beats: 9, reads: [{ text: s.title, lang: ctx.lang }, ...(s.tagline ? [{ text: s.tagline, lang: ctx.lang }] : [])],
      cues: [{ beat: 10 / 15, kind: 'turn' }, { beat: OUT[0] / 15, kind: 'turn' }, { beat: RING_T0 / 15, kind: 'land' }, { beat: TEXT_T0 / 15, kind: 'accent' }],
      motion: 'tumble-stair, the pull into a point, the smoke ring', settled: 106 / 15, peakAt: RING_T0 / 15, pause: (END - 106) / 15 };
  },
  // the tagline rises from frame 92 and must be read by the end (about 1.4 s)
  validate(s, ctx) { return s.tagline && readTime(s.tagline, ctx.lang) > 2.4 ? ['tagline: too long to read before the end'] : []; },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  prepare(s) {
    const TP = { ...tumble.defaults(), colors: s.colors, ...(s.cards ? { cards: s.cards } : {}) };
    return { TP, TD: tumble.prepare(TP), dark: this.lum(s.colors.ground) < 0.4 };
  },
  lum(hex) { const h = String(hex).replace('#', ''), v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  // the cards' poses: tumble-stair's up to frame 62, then the pull toward the converge poses
  at(p, P, D) {
    const f = clamp(p) * END, T = tumble.at(clamp((f - 10) / (OUT[0] - 10)), D.TP);
    if (f < OUT[0]) return { p, f, poses: T.poses, op: [1, 1, 1] };
    const r = clamp((f - OUT[0]) / (OUT[1] - OUT[0])), e = quadIn(r), fade = 1 - cubicIn(Math.max(0, (r - 0.55) / 0.45));
    return { p, f, poses: T.poses.map((q, i) => Object.fromEntries(KEYS.map((k) => [k, q[k] + (CONV[i][k] - q[k]) * e]))), op: [fade, fade, fade] };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = c.ground;
    const bg = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root); bg.width = 1920; bg.height = 1080;
    const holder = el('div', { position: 'absolute', inset: '0' }, root);
    const T = tumble.build(holder, D.TP, D.TD); holder.style.background = 'transparent';
    // the smoke ring: three layers of a stroked circle displaced by fractal noise (the upstream's SVG filters)
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '1920'); svg.setAttribute('height', '1080'); svg.setAttribute('viewBox', '0 0 1920 1080');
    Object.assign(svg.style, { position: 'absolute', left: '0', top: '0', overflow: 'visible', mixBlendMode: D.dark ? 'screen' : 'multiply' });
    const defs = document.createElementNS(NS, 'defs');
    [['A', '0.013 0.016', 4, 11], ['B', '0.021 0.018', 4, 37], ['C', '0.019 0.023', 3, 73]].forEach(([id, fq, oct, seed]) => {
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', `ff-smoke${id}`); ['x', 'y'].forEach((a) => f.setAttribute(a, '-60%')); ['width', 'height'].forEach((a) => f.setAttribute(a, '220%'));
      // the first primitive takes the element's own graphic by default: a zero offset names it for the displacement
      const o = document.createElementNS(NS, 'feOffset'); o.setAttribute('result', 'src');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', fq); t.setAttribute('numOctaves', String(oct)); t.setAttribute('seed', String(seed)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'src'); d.setAttribute('in2', 'n'); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      f.append(o, t, d); defs.append(f);
    });
    const grad = document.createElementNS(NS, 'linearGradient'); grad.setAttribute('id', 'ff-ring'); ['x1', 'y1', 'x2'].forEach((a) => grad.setAttribute(a, '0')); grad.setAttribute('y2', '1');
    [[0, mix(c.accent, c.ink, 0.55)], [0.38, mix(c.accent, c.ink, 0.22)], [1, c.accent]].forEach(([o, col]) => { const s = document.createElementNS(NS, 'stop'); s.setAttribute('offset', String(o)); s.setAttribute('stop-color', col); s.setAttribute('stop-opacity', '0.9'); grad.append(s); });
    defs.append(grad); svg.append(defs);
    const g = document.createElementNS(NS, 'g'); svg.append(g);
    const layer = (filter, stroke, blur, op = 1) => { const w = document.createElementNS(NS, 'g'); w.setAttribute('filter', `url(#ff-smoke${filter})`); const ci = document.createElementNS(NS, 'circle'); ci.setAttribute('cx', '960'); ci.setAttribute('cy', String(CY)); ci.setAttribute('fill', 'none'); ci.setAttribute('stroke', stroke); ci.style.filter = `blur(${blur}px)`; ci.setAttribute('opacity', String(op)); w.append(ci); g.append(w); return ci; };
    const rings = [layer('A', rgba(c.accent, 0.3), 22), layer('A', 'url(#ff-ring)', 9, 0.88), layer('B', rgba(mix(c.accent, c.ink, 0.6), 0.62), 6), layer('C', rgba(mix(c.ground, '#000000', 0.6), D.dark ? 0.4 : 0.12), 7)];
    root.append(svg);
    const fx = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root); fx.width = 1920; fx.height = 1080;
    return { root, bg, bgc: bg.getContext('2d'), T, svg, ring: g, rings, filters: [...defs.querySelectorAll('feDisplacementMap')], fx, fxc: fx.getContext('2d'), blurTarget: null };
  },
  // the backdrop: the bloom behind the cards and the outlined word wall drifting in two rows, pulled in as the cards go
  backdrop(g, f, P) {
    const c = P.colors, L = P.lang, up = EASE.out(clamp((f - 6) / 16)), k = ramp(f, OUT[0], OUT[1] - OUT[0] + 4, EASE.exit), a = lm(0.5, 0.32, ramp(f, OUT[0], 14, EASE.smooth));
    g.setTransform(1, 0, 0, 1, 0, 0);
    const v = g.createLinearGradient(0, 0, 0, 1080); v.addColorStop(0, mix(c.ground, c.accent, 0.08)); v.addColorStop(0.55, c.ground); v.addColorStop(1, mix(c.ground, '#000000', 0.25)); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
    g.save(); g.translate(960, CY); g.scale(1920 * 0.46, 1080 * 0.52); const b = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    b.addColorStop(0, rgba(mix(c.accent, c.ink, 0.3), a)); b.addColorStop(0.4, rgba(c.accent, a * 0.28)); b.addColorStop(0.72, rgba(c.accent, 0)); g.fillStyle = b; g.fillRect(-1.2, -1.2, 2.4, 2.4); g.restore();
    const op = up * (1 - k);
    if (P.wall && op > 0.01) {
      const wf = this.F(P, 'display', 300, 900, 'display'), word = caseOf(P.wall, P.look || NEUTRAL, 'display', L).text, line = `${word}  ·  ${word}  ·  ${word}  ·  `;
      g.save(); g.globalAlpha = op; g.translate(960, 540); g.scale(lm(1, 0.7, k), lm(1, 0.7, k)); g.translate(-960, -540);
      g.font = fontOf({ ...wf, style: L === 'zh' ? '' : 'italic' }); if ('letterSpacing' in g) g.letterSpacing = `${-0.02 * 300}px`; g.lineWidth = 2.5;
      [0, 1].forEach((row) => { g.strokeStyle = rgba(c.ink, row ? 0.12 : 0.18); g.strokeText(line, (row ? 1 : -1) * f * 2.4 - (row ? 1400 : 300), (row ? 640 : 60) + 300 * 0.82); });
      g.restore();
    }
    g.save(); g.translate(960, 1080 * 0.89); g.scale(1920 * 0.6, 1080 * 0.15); const h = g.createRadialGradient(0, 0, 0, 0, 0, 1); h.addColorStop(0, rgba(c.accent, 0.12)); h.addColorStop(0.7, rgba(c.accent, 0)); g.fillStyle = h; g.fillRect(-1, -1, 2, 2); g.restore();
  },
  // the flash, the title, the eyebrow and the tagline
  front(g, f, P, D) {
    const c = P.colors, L = P.lang;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
    const t = f - RING_T0;
    if (t >= -1 && t <= 14) {
      const a = t < 0 ? 0.4 : Math.exp(-t / 3.2), hot = mix(c.ink, '#FFFFFF', D.dark ? 0.6 : 0);
      g.save(); g.globalCompositeOperation = D.dark ? 'screen' : 'source-over';
      const r = g.createRadialGradient(960, CY, 0, 960, CY, 420);
      r.addColorStop(0, rgba(D.dark ? hot : c.accent, a)); r.addColorStop(0.09, rgba(mix(hot, c.accent, 0.2), 0.85 * a)); r.addColorStop(0.22, rgba(c.accent, 0.45 * a)); r.addColorStop(0.44, rgba(c.accent, 0.22 * a)); r.addColorStop(0.7, rgba(c.accent, 0));
      g.fillStyle = r; g.fillRect(540, CY - 420, 840, 840); g.fillStyle = rgba(D.dark ? hot : c.accent, 0.12 * a); g.fillRect(0, 0, 1920, 1080); g.restore();
    }
    const st = f - TEXT_T0;
    if (st < 0) return;
    const slam = ramp(f, TEXT_T0, 14, EASE.snappy), scale = lm(1.22, 1, slam) + Math.max(0, st - 14) * 0.0008, glowK = 0.6 + 0.4 * Math.exp(-Math.max(0, st) / 10);
    const tt = caseOf(P.title, P.look || NEUTRAL, 'display', L).text;
    let tf = this.F(P, 'display', L === 'zh' ? 250 : 282, 900, 'display');
    tf = { ...tf, style: L === 'zh' ? '' : 'italic', spacing: lm(0.06, L === 'zh' ? 0.02 : -0.025, slam) * tf.size };
    const w = measure(g, tt, tf).width, fit = Math.min(1, 1700 / Math.max(1, w));
    g.save(); g.translate(960, CY); g.scale(scale * fit, scale * fit); g.globalAlpha = EASE.out(clamp(st / 5));
    const fill = g.createLinearGradient(0, -tf.size * 0.5, 0, tf.size * 0.5);
    fill.addColorStop(0, D.dark ? mix(c.ink, '#FFFFFF', 0.6) : c.ink); fill.addColorStop(0.38, c.ink); fill.addColorStop(0.72, mix(c.ink, c.accent, 0.35)); fill.addColorStop(1, mix(c.ink, c.accent, 0.6));
    g.shadowColor = rgba(c.accent, 0.55 * glowK); g.shadowBlur = 60 * glowK;
    text(g, tt, 0, 0, tf, { color: fill, align: 'center', baseline: 'middle' });
    g.shadowBlur = 18 * glowK; text(g, tt, 0, 0, tf, { color: fill, align: 'center', baseline: 'middle' });
    g.restore();
    if (P.eyebrow) {
      const ef = this.F(P, 'text', L === 'zh' ? 32 : 30, 700, 'label'), eb = caseOf(P.eyebrow, P.look || NEUTRAL, 'label', L), ew = measure(g, eb.text, { ...ef, spacing: 0.12 * ef.size }).width;
      riseText(g, eb.text, 960 - ew / 2, CY - 262 + 30, { ...ef, spacing: 0.12 * ef.size }, { color: rgba(c.ink, 0.9), lang: L, f, start: TEXT_T0 + 10, each: 12, gap: 1 });
    }
    if (P.tagline) riseText(g, P.tagline, 960, CY + 200 + 44, this.F(P, 'text', 44, 500), { color: rgba(c.ink, 0.82), lang: L, f, start: TEXT_T0 + 18, each: 16, gap: 3, align: 'center' });
  },
  ring(R, f, D) {
    const t = f - RING_T0;
    R.svg.style.visibility = t < 0 ? 'hidden' : 'visible';
    if (t < 0) return;
    const grow = cubicOut(Math.min(1, t / 52)), Rr = 46 + 330 * grow + Math.max(0, t - 52) * 1.6, op = lerpK(t, [[0, 0], [4, 1], [30, 0.94], [60, 0.76]]);
    const w = Rr * lerpK(t, [[0, 0.36], [52, 0.27]]), disp = 60 + grow * 90;
    R.ring.setAttribute('transform', `rotate(${n(t * 0.35, 3)} 960 ${CY})`); R.ring.setAttribute('opacity', n(op, 4));
    [[1, 1.9], [1, 1], [0.99, 0.42], [1.005, 0.4]].forEach(([kr, kw], i) => { R.rings[i].setAttribute('r', n(Rr * kr, 3)); R.rings[i].setAttribute('stroke-width', n(w * kw, 3)); });
    [1, 0.85, 1.1].forEach((k, i) => R.filters[i].setAttribute('scale', n(disp * k, 3)));
  },
  pose(R, S, P, D) {
    this.backdrop(R.bgc, S.f, P);
    const show = S.f < OUT[1] + 2;
    R.T.stage.style.visibility = show ? 'visible' : 'hidden';
    if (show) { tumble.pose(R.T, { poses: S.poses }); R.T.cards.forEach((cv, i) => { cv.style.opacity = n(S.op[i], 4); }); }
    this.ring(R, S.f, D);
    this.front(R.fxc, S.f, P, D);
  },
  // per card, back to front: its box centre, left and right edges (tumble-stair's points), through the pull
  track(S) {
    return S.poses.flatMap((q) => {
      const pts = [[-CW / 2, -CH / 2], [CW / 2, -CH / 2], [-CW / 2, CH / 2], [CW / 2, CH / 2]].map(([u, v]) => project(q, u, v));
      const xs = pts.map((t) => t[0]), ys = pts.map((t) => t[1]), cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      return [[(Math.min(...xs) + Math.max(...xs)) / 2, cy], [Math.min(...xs), cy], [Math.max(...xs), cy]];
    });
  },
  blur: () => false,
};

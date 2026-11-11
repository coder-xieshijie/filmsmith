// ring-gallery — a ring of cards turns in front of a fixed camera, a step at a time, the card at the front lit and
// named in a caption under the ring.
// Adapted from video-shotcraft demos/ui-entrance/carousel-3d/Carousel3D.tsx (card references/shots/ui-entrance/carousel-3d.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion): CSS 3D planes holding canvases painted once by the
// tile-card prop (a rest face and a lit face cross-fading), every pose rewriting every transform; the turn keeps the
// upstream's half-constant, half-stepped angle (a dock every 45°), but its constant half brakes over the last step so
// the ring lands still with a card in front (`loop: true` keeps the seamless loop); colours by role; the shot names,
// numbers, mark and frame furniture are the film's slots (sample copy by default).
import { clamp, rgba, text, measure } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { el, n, stage3d } from '../../dom.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { faceCanvas, cardItems } from '../../prop/tile-card/brick.js';

const R = { n: 8, radius: 700, cw: 340, ch: 460, y: 470, frames: 168, beat: 21, dwell: 8, tilt: -9, persp: 2200 };
R.floor = R.ch / 2 + 10;
const rad = (d) => (d * Math.PI) / 180;
const MASK = `linear-gradient(180deg, ${rgba('#000000', 0)} 62%, ${rgba('#000000', 0.85)} 100%)`;   // the reflection fades out upward
const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);

// Ring angle (degrees) at frame f: half constant, half stepped (dwell, then a smooth change of place); with no loop the
// constant half brakes over the last step (h(u) = u + u² − u³: speed 1 → 0, the same angle gained), so f = 168 is 360°.
const spinAt = (f, n, loop) => {
  const N = n * R.beat, k = Math.min(n, Math.floor(f / R.beat)), local = f - k * R.beat;
  const step = (Math.min(n, k) + EASE.smooth(clamp((local - R.dwell) / (R.beat - R.dwell)))) / n;
  let g = f;
  if (!loop && f > N - R.beat) { const u = clamp((f - (N - R.beat)) / R.beat); g = N - R.beat + R.beat * (u + u * u - u * u * u); }
  return 360 * (0.5 * (g / N) + 0.5 * (k >= n ? 1 : step));
};

export default {
  id: 'ring-gallery', kind: 'scene',
  fits: ['demo', 'proof', 'rest'],
  surface: ['dom'],
  beats: { min: 8, max: 14 },
  beatsFor: (P) => ((P.cards ? P.cards.length : R.n) * R.beat + (P.loop ? 0 : R.dwell)) / 15,   // a last dwell holds the front card
  needs: { motions: [], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'mono'] },
  slots: {
    cards: { type: 'list', count: [6, 10], of: {
      meta: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      value: { type: 'number', limits: { en: { chars: 6 }, zh: { chars: 6 } } },
      label: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
      image: { type: 'image', crop: true, optional: true },
    } },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 10 } } },
    corner: { type: 'text', tier: 'glance', limits: { en: { chars: 16 }, zh: { chars: 8 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A ring of cards turns a step at a time in front of a fixed camera; the card at the front is lit and named under the ring.',
  defaults: () => ({ cards: null, eyebrow: null, corner: null, loop: false }),
  plan(s, ctx) { const beats = this.beatsFor(s); return { beats, reads: [], cues: Array.from({ length: beats / 1.4 }, (_, i) => ({ beat: i * 1.4 + 0.53, kind: 'accent' })), peakAt: null, settled: beats - 0.5 }; },
  validate(s) { const n = (s.cards || []).length; return s.cards && (n < 6 || n > 10) ? [`cards: ${n} (6–10)`] : []; },
  prepare(P) {
    const base = cardItems(P.lang, 6), kpis = copy('kpis', P.lang), cards = copy('cards', P.lang);
    const n = P.cards ? P.cards.length : R.n;
    const items = (P.cards || Array.from({ length: n }, (_, i) => ({ ...base[i % 6], meta: `${String(i + 1).padStart(2, '0')}`, value: kpis[i % 3].value, label: cards[i % 6].title }))).map((it, i) => ({ figure: ['line', 'bars', 'wave', 'rings', 'grid', 'gantt', 'dots', 'blocks'][i % 8], ...it }));
    return { n, items, eyebrow: P.eyebrow || copy('eyebrow', P.lang), corner: P.corner || copy('label', P.lang) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const N = D.n * R.beat, f = Math.min(N, p * (N + (P.loop ? 0 : R.dwell))), spin = spinAt(f, D.n, P.loop);
    const az = (i) => ((((i * 360) / D.n - spin) % 360) + 540) % 360 - 180;
    const k = Math.min(D.n - 1, Math.floor(f / R.beat)), roll = k >= D.n - 1 && f >= N - R.dwell ? 0 : EASE.smooth(clamp((f - k * R.beat - R.dwell) / (R.beat - R.dwell)));
    return { f, spin, az: D.items.map((_, i) => az(i)), k: f >= N ? 0 : k, roll: f >= N ? 0 : roll };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = c.ground;
    const glow = el('div', { position: 'absolute', left: `${960 - 520}px`, top: `${R.y + 120}px`, width: '1040px', height: '420px', borderRadius: '50%', background: `radial-gradient(ellipse at 50% 40%, ${rgba(c.accent, 0.16)} 0%, ${rgba(c.accent, 0)} 65%)` }, root);
    const { stage, world } = stage3d(root, { perspective: R.persp, origin: `960px ${R.y - 60}px` });
    world.style.width = '0px'; world.style.height = '0px';
    const anchor = el('div', { position: 'absolute', left: '960px', top: `${R.y}px`, width: '0', height: '0', transformStyle: 'preserve-3d', transform: `translateZ(${-R.radius}px) rotateX(${R.tilt}deg)` }, world);
    // the floor: a soft accent disc and a ring of ticks, lying flat under the cards
    const floor = el('div', { position: 'absolute', left: `${-R.radius * 1.35}px`, top: `${R.floor - R.radius * 1.35}px`, width: `${R.radius * 2.7}px`, height: `${R.radius * 2.7}px`, borderRadius: '50%', transform: 'rotateX(90deg)',
      background: `radial-gradient(circle, ${rgba(c.accent, 0.1)} 0%, ${rgba(c.accent, 0.03)} 45%, ${rgba(c.accent, 0)} 66%)` }, anchor);
    const T = R.radius * 2.4, ticks = el('canvas', { position: 'absolute', left: `${-T / 2}px`, top: `${R.floor - T / 2}px`, width: `${T}px`, height: `${T}px` }, anchor);
    ticks.width = T; ticks.height = T;
    const g = ticks.getContext('2d', { willReadFrequently: true });
    g.translate(T / 2, T / 2);
    g.beginPath(); g.arc(0, 0, R.radius * 1.08, 0, Math.PI * 2); g.strokeStyle = rgba(c.ink, 0.08); g.lineWidth = 2; g.stroke();
    for (let t = 0; t < 96; t++) { const a = (t / 96) * Math.PI * 2, r0 = R.radius * (t % 12 === 0 ? 1.02 : 1.05); g.beginPath(); g.moveTo(r0 * Math.cos(a), r0 * Math.sin(a)); g.lineTo(R.radius * 1.08 * Math.cos(a), R.radius * 1.08 * Math.sin(a)); g.strokeStyle = t % 12 === 0 ? rgba(c.accent, 0.5) : rgba(c.ink, 0.12); g.lineWidth = t % 12 === 0 ? 3 : 2; g.stroke(); }
    const plane = (parent, it, i, reflect) => {
      const holder = el('div', { position: 'absolute', left: `${-R.cw / 2}px`, top: `${-R.ch / 2}px`, width: `${R.cw}px`, height: `${R.ch}px`, transformStyle: 'preserve-3d' }, parent);
      const faces = [0, 180].map((turn) => {
        const f = el('div', { position: 'absolute', inset: '0', borderRadius: '22px', overflow: 'hidden', backfaceVisibility: 'hidden', transform: turn ? 'rotateY(180deg)' : 'none',
          ...(reflect ? { opacity: '0.08', maskImage: MASK, WebkitMaskImage: MASK } : {}) }, holder);
        const rest = faceCanvas(it, R.cw, R.ch, P, { layout: 'stat', index: i }, 1.5), lit = faceCanvas(it, R.cw, R.ch, P, { layout: 'stat', index: i, lit: 1 }, 1.5);
        for (const cv of [rest, lit]) { Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: `${R.cw}px`, height: `${R.ch}px` }); f.appendChild(cv); }
        const veil = el('div', { position: 'absolute', inset: '0', background: c.ground }, f);
        return { f, lit, veil };
      });
      return { holder, faces };
    };
    const mirror = el('div', { position: 'absolute', transformStyle: 'preserve-3d' }, anchor);
    const carrier = el('div', { position: 'absolute', transformStyle: 'preserve-3d' }, anchor);
    const refl = D.items.map((it, i) => plane(mirror, it, i, true));
    const cards = D.items.map((it, i) => plane(carrier, it, i, false));
    // the frame furniture and the caption window: one canvas, repainted on every pose
    const hud = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root);
    hud.width = 1920; hud.height = 1080;
    return { root, glow, stage, world, anchor, ticks, mirror, carrier, refl, cards, hud, hg: hud.getContext('2d'), blurTarget: null };
  },
  pose(Rg, S, P, D) {
    const c = P.colors, hlOf = (a) => EASE.smooth(clamp(1 - Math.abs(a) / 26));
    Rg.ticks.style.transform = `rotateX(90deg) rotateZ(${n(S.spin)}deg)`;
    Rg.carrier.style.transform = `rotateY(${n(-S.spin)}deg)`;
    Rg.mirror.style.transform = `translateY(${R.floor * 2}px) scaleY(-1) rotateY(${n(-S.spin)}deg)`;
    const set = (pl, i, reflect) => {
      const a = S.az[i], d = (1 - Math.cos(rad(a))) / 2, hl = reflect ? 0 : hlOf(a);
      pl.holder.style.transform = `rotateY(${n((i * 360) / D.n)}deg) translateZ(${n(R.radius + 44 * hlOf(a))}px)`;
      for (const fc of pl.faces) { fc.lit.style.opacity = n(hl, 4); fc.veil.style.opacity = n(0.7 * d, 4); }
    };
    D.items.forEach((_, i) => { set(Rg.cards[i], i, false); set(Rg.refl[i], i, true); });
    const g = Rg.hg, info = infoSize(P.lang);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
    text(g, D.eyebrow, 120, 120, F(P, 'mono', info, 600, 'label'), { color: c.dim });
    text(g, D.corner, 1800, 120, F(P, 'mono', info, 600, 'label'), { color: c.dim, align: 'right' });
    g.save(); g.beginPath(); g.rect(0, 862, 1920, 120); g.clip();
    for (const j of [0, 1]) {
      const ci = (S.k + j) % D.n, y = 862 + 60 + (j - S.roll) * 120, a = 1 - Math.abs(j - S.roll) * 0.9;
      if (a <= 0.02) continue;
      const it = D.items[ci], idx = `${String(ci + 1).padStart(2, '0')} / ${String(D.n).padStart(2, '0')}`;
      const fi = F(P, 'mono', info + 1, 600, 'label'), fn = F(P, 'display', 72, 760, 'display');
      const wi = measure(g, idx, fi).width, wn = measure(g, it.label || it.title, fn).width;
      const x0 = 960 - (wi + 34 + wn) / 2;
      text(g, idx, x0, y + 9, fi, { color: c.accent, alpha: a });
      text(g, it.label || it.title, x0 + wi + 34, y + 26, fn, { color: c.ink, alpha: a });
    }
    g.restore();
  },
  // the centre of card 0 and of card 2 on screen (the ring projected through the camera)
  track(S, P, D) {
    const b = rad(R.tilt), d = R.persp, oy = R.y - 60;
    return [0, 2].map((i) => {
      const a = rad((i * 360) / D.n - S.spin), rr = R.radius + 44 * EASE.smooth(clamp(1 - Math.abs(S.az[i]) / 26));
      const x = rr * Math.sin(a), z0 = rr * Math.cos(a), y = -z0 * Math.sin(b), z = z0 * Math.cos(b) - R.radius;
      const X = 960 + x, Y = R.y + y, k = d / (d - z);
      return [960 + (X - 960) * k, oy + (Y - oy) * k];
    });
  },
  blur: () => false,
};

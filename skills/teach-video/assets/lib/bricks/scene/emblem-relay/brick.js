// emblem-relay — two to four benefit words relayed in the centre, each with geometry of its own behind it: a dashed
// ring and a tick ring turning against each other with a comet running round (spin), three rings drawn one after another
// that close in and lock (link), or a metal sheen sweeping the word before it settles to plain ink with a bloom (sheen,
// the conclusion's treatment). Each word arrives outline first, its fill wiped in after; the old one shrinks to 0.86 and
// defocuses out while the next pushes in.
// Adapted from video-shotcraft demos/typography/word-relay-geometry/WordRelayGeometry.tsx (card
// references/shots/typography/word-relay-geometry.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React or Remotion) in Canvas2D (text stroke, masks and
// background-clip become composited offscreen layers); colours by role (white lines are ink, the champagne highlight
// is the accent); brand mark, brand name and demo copy removed: words, subs and emblems are slots, the timing is
// per word so two to four fit; uppercase progress labels set as written (Chinese has no case); the static Helvetica
// becomes the look's display face.
//
// Played through the motion-shaped interface the brick tools drive (rest / at / paint over p); plan() and validate()
// give the scene's length and its slot checks as SPEC 3.2 asks.
import { clamp, lerp, ground, rgba, mix, measure, scratch, text, fontOf } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { hash } from '../../../rng.js';
import { infoSize, look as NEUTRAL } from '../../sample.js';
import { fontFor, units as unitCount } from '../../lang.js';
import { setText, drawUnit, fontSpec, pick, langOf, beatsFrom } from '../../motion/type-enter/type.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c = (u) => u) => c(R((f - a) / d));
const deg = Math.PI / 180;
const CX = 960, CY = 500;
const K = { every: 57, first: 2, tail: 64, tin: 14, tout: 10, fill: [10, 18] };
const norm = (P) => {
  const lang = langOf(pick(P.words, P.lang || 'en').join(''), P.lang);
  const words = pick(P.words, lang), subs = pick(P.subs, lang) || [];
  const emblems = P.emblems || words.map((_, i) => (i === words.length - 1 ? 'sheen' : ['spin', 'link'][i % 2]));
  return { ...P, lang, words, subs, emblems, size: pick(P.size, lang) };
};
// each word's entry, in frames: `cues` (beats) when given, else 2 f then one every 57 f
const IN = (P, i) => (P.cues ? P.cues[i] * 15 : K.first + i * K.every);
const framesOf = (P) => IN(P, P.words.length - 1) + K.tail;
const OUT = (P, i) => (i + 1 < P.words.length ? IN(P, i + 1) - 4 : null);
const canvas = (w, h) => { const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h }); return c.getContext('2d', { willReadFrequently: true }); };

export default {
  id: 'emblem-relay', kind: 'scene',
  fits: ['claim', 'proof'],
  surface: ['canvas'],
  beats: { min: 8, max: 16 },
  beatsFor(P) { return beatsFrom(framesOf(norm(P))); },
  needs: { motions: [], props: [], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    words: { type: 'list', count: [2, 4], of: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 9 }, zh: { chars: 3 } } } },
    subs: { type: 'list', count: [2, 4], optional: true, of: { type: 'text', tier: 'info', limits: { en: { words: 7, chars: 40 }, zh: { chars: 16 } } } },
    emblems: { type: 'list', optional: true, of: { type: 'enum', values: ['spin', 'link', 'sheen', 'none'] }, note: 'one per word; default spin, link, …, sheen for the last' },
  },
  plan(s, ctx = {}) {
    const P = norm({ ...this.defaults(ctx), ...s, lang: ctx.lang }), beats = this.beatsFor(P);
    return { beats, reads: P.words.length, cues: P.words.map((_, i) => ({ beat: IN(P, i) / 15, kind: 'accent' })), settled: beats - 22 / 15, peakAt: (IN(P, P.words.length - 1) + 30) / 15, pause: null };
  },
  validate(s, ctx = {}) {
    const P = norm({ ...this.defaults(ctx), ...s, lang: ctx.lang }), err = [], lim = this.slots.words.of.limits[P.lang];
    if (P.words.length < 2 || P.words.length > 4) err.push(`words: ${P.words.length}, want 2–4`);
    for (const w of P.words) if (unitCount(w, P.lang) > lim.chars) err.push(`word "${w}" over ${lim.chars} (${P.lang})`);
    if (P.emblems.length !== P.words.length) err.push('emblems: one per word');
    return err;
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the ground with the first emblem at 0.4 scale, faint',
  to: 'the last word settled in ink with its bloom and the horizon line, its sub below',
  interpolates: ['per word: scale 1.06 → 1 and blur 10 → 0 in 14 f, then 1 → 0.86 and blur 0 → 12 out in 10 f, 6 f of overlap', 'the outline layer, then the fill wiped in left to right with a soft front', 'spin: ring growth 0.4 → 1 with 160° of braking, then a steady turn; a comet at 7.5°/frame', 'link: three rings trimmed on 6 f apart, closing 340 → 300 px, rivets at the crossings', 'sheen: chrome, a sweep band, then plain ink with a bloom and a horizon line', 'the progress segments and the counter'],
  summary: 'Two to four benefit words relayed in the centre, each with its own geometry behind it: rings that spin, rings that lock, a metal sheen for the last.',
  theory: 'The geometry argues the adjective (iconicity: spin reads as fast, interlock as tight, metal as strong); the relay with overlap keeps three claims one continuous space, and the last gets the upgrade because it concludes (serial position, recency).',
  defaults: () => ({
    words: { en: ['Quick', 'Locked', 'Polished'], zh: ['更快', '咬合', '精致'] },
    subs: { en: ['One brief to a finished film.', 'Each cut lands on the beat.', 'Frames that look hand-made.'], zh: ['一份需求，直接出成片。', '每一刀都落在拍点上。', '每一帧都像手工打磨过。'] },
    emblems: null, size: { en: 230, zh: 236 }, weight: 800, counter: true, progress: true, dust: 26, push: 0.025, seed: 7, cues: null, probes: false,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), wf = fontSpec(P, P.size, P.weight);
    const ws = P.words.map((w) => measure(g, w, wf).width);
    const sf = fontFor(NEUTRAL, 'text', P.lang, 40, 450), mf = fontFor(NEUTRAL, 'mono', P.lang, Math.max(infoSize(P.lang), 24), 600, 'label');
    const subs = P.words.map((_, i) => (P.subs[i] ? setText(g, P.subs[i], sf, P.lang, { by: 'word', x: CX, y: CY + (P.emblems[i] === 'link' ? 246 : 210) + 20, align: 'center', maxW: 1500 }) : null));
    const dust = Array.from({ length: P.dust }, (_, i) => ({ x: hash(i * 3 + 1, P.seed) * 1920, y: hash(i * 3 + 2, P.seed) * 1080, r: 1 + hash(i * 3 + 3, P.seed) * 1.8, a: 0.2 + hash(i + 40, P.seed) * 0.6, d: hash(i + 80, P.seed) * Math.PI * 2 }));
    const OH = Math.round(P.size * 1.9);
    return { N: P, wf, ws, subs, mf, dust, OH, off: canvas(1920, OH), tmp: canvas(1920, OH), frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const N = D.N, f = p * D.frames;
    const W = N.words.map((_, i) => {
      const a = IN(N, i), o = OUT(N, i), tin = ramp(f, a, K.tin, EASE.snappy), tout = o == null ? 0 : ramp(f, o, K.tout, EASE.exit);
      return { a, o, f: f - a, tin, tout, alive: f >= a - 1 && tout < 1, fill: ramp(f, a + K.fill[0], K.fill[1], EASE.swift) };
    });
    let active = 0; W.forEach((w, i) => { if (i && f >= w.a) active = i; });
    return { p, f, W, active, cam: 1 + N.push * EASE.smooth(R(f / D.frames)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, f = S.f, last = P.words.length - 1, LW = S.W[last];
    const white = P.emblems[last] === 'sheen' ? ramp(LW.f, 30, 12, EASE.out) : 0, flare = P.emblems[last] === 'sheen' ? Math.sin(R((LW.f - 30) / 26) * Math.PI) : 0;
    ground(ctx, P);
    // stage light and dust
    const gl = ctx.createRadialGradient(CX, 1080 * 0.34, 0, CX, 1080 * 0.34, 900);
    gl.addColorStop(0, rgba(c.ink, 0.07 + 0.05 * flare)); gl.addColorStop(1, rgba(c.ink, 0));
    ctx.fillStyle = gl; ctx.fillRect(0, 0, 1920, 1080);
    for (const d of D.dust) {
      const x = (d.x + Math.cos(d.d) * f * 0.18 + 1920) % 1920, y = (d.y + Math.sin(d.d) * f * 0.18 - f * 0.1 + 1080) % 1080;
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, Math.PI * 2); ctx.fillStyle = rgba(mix(c.ink, c.dim, 0.4), d.a * 0.35); ctx.fill();
    }
    ctx.save(); ctx.translate(CX, CY); ctx.scale(S.cam, S.cam); ctx.translate(-CX, -CY);
    S.W.forEach((w, i) => {
      if (!w.alive) return;
      const fade = clamp(w.tin * 2) * (1 - w.tout);
      if (P.emblems[i] === 'spin') spin(ctx, w, c, 1 - w.tout);
      else if (P.emblems[i] === 'link') link(ctx, w, c, fade);
    });
    // the horizon line under the concluding word
    if (P.emblems[last] === 'sheen' && LW.alive) {
      const op = ramp(LW.f, 32, 14, EASE.out) * 0.8, sx = lerp(0.2, 1, ramp(LW.f, 30, 22, EASE.snappy));
      if (op > 0.002) {
        const hl = ctx.createLinearGradient(CX - 700 * sx, 0, CX + 700 * sx, 0);
        hl.addColorStop(0, rgba(c.ink, 0)); hl.addColorStop(0.5, rgba(c.ink, 0.7)); hl.addColorStop(1, rgba(c.ink, 0));
        ctx.save(); ctx.globalAlpha = op; ctx.shadowColor = rgba(c.ink, 0.4); ctx.shadowBlur = 24; ctx.fillStyle = hl; ctx.fillRect(CX - 700 * sx, CY + 158, 1400 * sx, 2); ctx.restore();
      }
    }
    S.W.forEach((w, i) => { if (w.alive) word(ctx, w, i, P, D, c); });
    // subs, by word (Chinese by phrase), rising after the word lands
    S.W.forEach((w, i) => {
      const L = D.subs[i]; if (!w.alive || !L) return;
      const start = P.emblems[i] === 'sheen' ? 34 : 16;
      L.units.forEach((u, j) => {
        const q = ramp(w.f, start + j * 2.2, 16, EASE.out);
        if (q <= 0) return;
        drawUnit(ctx, u, L, { alpha: q * (1 - w.tout), dy: (1 - q) * 18, blur: w.tout > 0.02 ? w.tout * 6 : 0, color: mix(c.ink, c.ground, 0.3) });
      });
    });
    ctx.restore();
    // frame furniture (not under the camera): counter, progress segments
    const m = D.mf, n = P.words.length;
    if (P.counter) {
      const op = ramp(f, 0, 14, EASE.out), a = String(S.active + 1).padStart(2, '0');
      text(ctx, a, 120, 96 + m.size, m, { color: c.ink, alpha: op });
      text(ctx, ` / ${String(n).padStart(2, '0')}`, 120 + measure(ctx, a, m).width, 96 + m.size, m, { color: c.dim, alpha: op });
    }
    if (P.progress) {
      const gw = (1920 - 240 - 24 * (n - 1)) / n;
      S.W.forEach((w, i) => {
        const x = 120 + i * (gw + 24), end = w.o ?? (w.a + 42), q = R((f - w.a) / (end - w.a)), on = i === S.active;
        ctx.fillStyle = rgba(c.ink, 0.1); ctx.fillRect(x, 1080 - 96 - 40, gw, 2);
        ctx.fillStyle = on ? c.ink : rgba(c.ink, 0.45); ctx.fillRect(x, 1080 - 96 - 40, gw * q, 2);
        text(ctx, `${String(i + 1).padStart(2, '0')}  ${P.words[i]}`, x, 1080 - 96 - 40 + 16 + m.size, m, { color: on ? c.ink : c.dim });
      });
    }
  },
  // the active word's centre and its right edge (its scale), for the hosts and the comparison
  track(S, P, D) {
    const i = S.active, w = S.W[i], sc = lerp(1.06, 1, w.tin) * lerp(1, 0.86, w.tout);
    const pts = [[CX, CY], [CX + (D.ws[i] / 2) * sc, CY]];
    // `probes`: the second word's scale (×300 px) and the link rings' spacing, for the comparison
    if (D.N.probes) {
      const w = S.W[1], s1 = lerp(1.06, 1, w.tin) * lerp(1, 0.86, w.tout), tight = ramp(w.f + 2, 38, 14, EASE.swift);
      pts.push([960 + 300 * s1, 540], [960 + lerp(340, 300, tight), 540]);
    }
    return pts;
  },
};

// spin: a dashed ring and a tick ring turning against each other, a comet running round
function spin(ctx, w, c, fade) {
  const f = w.f + 2, grow = ramp(f, 0, 22, EASE.snappy), s = lerp(0.4, 1, grow), Rr = 400, RT = 452;
  ctx.save(); ctx.globalAlpha = fade * lerp(0.35, 1, grow); ctx.translate(CX, CY); ctx.scale(s, s);
  ctx.save(); ctx.rotate((-90 - 160 * (1 - grow) + f * 0.9) * deg); ctx.setLineDash([10, 16]); ctx.strokeStyle = rgba(c.ink, 0.42); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, Rr, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate((40 * (1 - grow) - f * 0.35) * deg);
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2, long = k % 10 === 0, r0 = RT - (long ? 18 : 8);
    ctx.strokeStyle = rgba(c.ink, long ? 0.55 : 0.2); ctx.lineWidth = long ? 2 : 1.4;
    ctx.beginPath(); ctx.moveTo(r0 * Math.cos(a), r0 * Math.sin(a)); ctx.lineTo(RT * Math.cos(a), RT * Math.sin(a)); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = rgba(c.ink, 0.08); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, Rr - 58, 0, Math.PI * 2); ctx.stroke();
  const head = -90 + f * 7.5 - 220 * (1 - grow);
  ctx.globalAlpha *= grow; ctx.lineCap = 'round'; ctx.shadowColor = rgba(c.ink, 0.6); ctx.shadowBlur = 10;
  for (let k = 0; k < 16; k++) {
    ctx.strokeStyle = rgba(c.ink, Math.pow(1 - k / 16, 1.6)); ctx.lineWidth = 4 - k * 0.15;
    ctx.beginPath(); ctx.arc(0, 0, Rr, (head - (k + 1) * 4) * deg, (head - k * 4) * deg); ctx.stroke();
  }
  ctx.restore();
}

// link: three rings trimmed on one after another, then closing in to lock; rivets at the crossings
function link(ctx, w, c, fade) {
  const f = w.f + 2, Rr = 218, tight = ramp(f, 38, 14, EASE.swift), gap = lerp(340, 300, tight), click = Math.sin(R((f - 46) / 12) * Math.PI);
  const sc = lerp(1.04, 1, w.tin) * lerp(1, 0.9, w.tout);
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(CX, CY); ctx.scale(sc, sc);
  [-1, 0, 1].forEach((k, i) => {
    const grow = ramp(f, 4 + i * 6, 22, EASE.out), back = w.o == null ? 0 : ramp(w.f, w.o - w.a - 4, 12, EASE.exit), tr = Math.max(0, grow - back), x = k * gap;
    if (tr <= 0.001) return;
    ctx.strokeStyle = rgba(c.ink, 0.4 + 0.35 * click); ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(x, 0, Rr, -Math.PI / 2, -Math.PI / 2 + tr * Math.PI * 2); ctx.stroke();
    const tip = grow < 1 ? 1 - R((grow - 0.85) / 0.15) : 0;
    if (tip > 0) {
      const a = -Math.PI / 2 + tr * Math.PI * 2;
      ctx.save(); ctx.globalAlpha *= tip; ctx.shadowColor = c.ink; ctx.shadowBlur = 16; ctx.fillStyle = c.ink;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * Rr, Math.sin(a) * Rr, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  });
  const h = Math.sqrt(Math.max(0, Rr * Rr - (gap / 2) ** 2));
  for (const k of [-1, 1]) for (const sy of [-1, 1]) {
    const on = ramp(f, 46 + (k + 1) * 1.5 + (sy + 1), 10, EASE.overshoot);
    if (on <= 0) continue;
    ctx.save(); ctx.translate((k * gap) / 2, sy * h); ctx.rotate(Math.PI / 4); ctx.scale(on, on); ctx.globalAlpha *= clamp(on);
    ctx.shadowColor = rgba(c.ink, 0.8); ctx.shadowBlur = 10; ctx.fillStyle = c.ink; ctx.fillRect(-6, -6, 12, 12); ctx.restore();
  }
  ctx.restore();
}

// one word: outline, then the fill wiped in (or chrome, sweep and ink for the sheen word), composed offscreen and
// drawn with the word's scale, alpha and defocus
function word(ctx, w, i, P, D, c) {
  const o = D.off, t = D.tmp, OH = D.OH, by = OH * 0.62, sheen = P.emblems[i] === 'sheen', s = P.words[i];
  const sh = sheen ? ramp(w.f, 4, 10, EASE.out) : 0, sweep = sheen ? ramp(w.f, 8, 24, EASE.smooth) : 0, white = sheen ? ramp(w.f, 30, 12, EASE.out) : 0;
  const bloom = sheen ? Math.sin(R((w.f - 30) / 22) * Math.PI) * 0.9 + white * 0.35 : 0;
  const font = (x) => { x.font = fontOf(D.wf); if ('letterSpacing' in x) x.letterSpacing = `${D.wf.spacing ?? 0}px`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; };
  const set = (x) => { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.shadowColor = 'transparent'; x.filter = 'none'; x.clearRect(0, 0, 1920, OH); font(x); };
  const fillText = (x, col) => { x.fillStyle = col; x.fillText(s, CX, by + D.wf.size * 0.35); };
  set(o);
  // outline (the CJK outline also carries a faint fill so the strokes' inner overlaps stay quiet)
  o.globalAlpha = sheen ? 1 - sh * 0.85 : 1 - w.fill * 0.8;
  if (P.lang === 'zh') fillText(o, rgba(c.ink, 0.06));
  o.lineWidth = 2; o.strokeStyle = rgba(mix(c.ink, c.dim, 0.1), 0.55); o.lineJoin = 'round'; o.strokeText(s, CX, by + D.wf.size * 0.35);
  o.globalAlpha = 1;
  const layer = (paint, alpha) => { if (alpha <= 0.002) return; set(t); fillText(t, '#000000'); t.globalCompositeOperation = 'source-in'; paint(t); o.globalAlpha = alpha; o.drawImage(t.canvas, 0, 0); o.globalAlpha = 1; };
  const hw = D.ws[i] / 2 + D.wf.size * 0.1, x0 = CX - hw, x1 = CX + hw;
  if (!sheen && w.fill > 0) {
    // soft-edged wipe: a mask ramp ±7 % of the word around the front
    layer((x) => {
      const e = w.fill * 1.14 - 0.07, gr = x.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, c.ink); gr.addColorStop(clamp(e - 0.07), c.ink); gr.addColorStop(clamp(e + 0.07), rgba(c.ink, 0)); gr.addColorStop(1, rgba(c.ink, 0));
      x.fillStyle = gr; x.fillRect(0, 0, 1920, OH);
    }, 1);
  }
  if (sheen) {
    const top = by + D.wf.size * 0.35 - D.wf.size * 0.75, bot = by + D.wf.size * 0.35 + D.wf.size * 0.1;
    layer((x) => {
      const gr = x.createLinearGradient(0, top, 0, bot), hi = c.ink, mid = mix(c.ink, c.dim, 0.35), lo = mix(c.dim, c.ground, 0.45);
      gr.addColorStop(0.08, hi); gr.addColorStop(0.4, mid); gr.addColorStop(0.52, lo); gr.addColorStop(0.62, mix(mid, lo, 0.4)); gr.addColorStop(0.88, mix(hi, mid, 0.3));
      x.fillStyle = gr; x.fillRect(0, 0, 1920, OH);
    }, sh * (1 - white));
    if (sweep * (1 - sweep) > 0) layer((x) => {
      const span = (x1 - x0) * 3, left = x0 - (x1 - x0) * 2 * (1 - sweep), gr = x.createLinearGradient(left, top, left + span, top + span * 0.18);
      gr.addColorStop(0.38, rgba(c.accent, 0)); gr.addColorStop(0.45, rgba(c.accent, 0.7)); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(0.55, rgba(c.accent, 0.7)); gr.addColorStop(0.62, rgba(c.accent, 0));
      x.fillStyle = gr; x.fillRect(0, 0, 1920, OH);
    }, sh * (1 - white));
    if (white > 0) {
      o.globalAlpha = white;
      if (bloom > 0.01) { o.shadowColor = rgba(c.ink, 0.3 * bloom); o.shadowBlur = 60 * bloom; fillText(o, c.ink); o.shadowColor = 'transparent'; }
      fillText(o, c.ink); o.globalAlpha = 1;
    }
  }
  const sc = lerp(1.06, 1, w.tin) * lerp(1, 0.86, w.tout), blur = (1 - w.tin) * 10 + w.tout * 12;
  ctx.save(); ctx.globalAlpha = clamp(w.tin * 1.6) * (1 - w.tout);
  if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  ctx.translate(CX, CY); ctx.scale(sc, sc); ctx.translate(-CX, -by);
  ctx.drawImage(o.canvas, 0, 0); ctx.restore();
}

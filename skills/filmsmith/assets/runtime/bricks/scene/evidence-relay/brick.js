// evidence-relay — a column of page cards on the left steps one card at a time only when the word changes; on the
// right a noun holds still while the verb under it is relayed in place (the old one greys and rises out, then the new
// one rises in letter by letter, never both at once), the word block centred on the card in focus.
// Adapted from video-shotcraft demos/typography/word-relay-filmstrip/WordRelayFilmstrip.tsx (card
// references/shots/typography/word-relay-filmstrip.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React or Remotion) in Canvas2D; the hand-made demo pages
// (pacing report, storyboard, render log, code review, scan viewer, shipment table) replaced by the neutral sample
// scenes (sample.js) drawn into the cards, one tone the palette, the other paper; colours by role (the gold accent is
// the accent role); brand mark, brand noun and demo notes removed: noun, verbs, notes and cards are slots; the serif
// italic verb becomes the display face at full weight (no serif in the neutral look; Chinese has no italic); Chinese
// verbs rise character by character and end on a Chinese full stop.
//
// Played through the motion-shaped interface the brick tools drive (rest / at / paint over p); plan() and validate()
// give the scene's length and its slot checks as SPEC 3.2 asks.
import { clamp, lerp, ground, rgba, mix, rrect, measure, scratch, text } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { copy, infoSize, painterOf, look as NEUTRAL } from '../../sample.js';
import { fontFor, units as unitCount } from '../../lang.js';
import { setText, drawUnit, fontSpec, pick, langOf, beatsFrom } from '../../motion/type-enter/type.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c = (u) => u) => c(R((f - a) / d));
const K = { cw: 940, ch: 530, gap: 105, left: 100, sw: 18, lead: 16, every: 49, tail: 66, wx: 1196, inAt: 7, rise: 16 };
K.step = K.ch + K.gap; K.focus = 540 - K.ch / 2;
const norm = (P) => {
  const lang = langOf(pick(P.verbs, P.lang || 'en').join(''), P.lang);
  return { ...P, lang, noun: pick(P.noun, lang), verbs: pick(P.verbs, lang), notes: pick(P.notes, lang), stop: pick(P.stop, lang), size: pick(P.size, lang) };
};
// the changes, in frames: `cues` (beats) when given, else a 16 f lead and one every 49 f
const SW = (P) => (P.cues ? P.cues.map((b) => b * 15) : P.verbs.map((_, i) => K.lead + i * K.every));
const framesOf = (P) => SW(P)[P.verbs.length - 1] + K.tail;
const stepAt = (f, P) => SW(P).reduce((a, s) => a + ramp(f, s, K.sw, EASE.swift), 0);

export default {
  id: 'evidence-relay', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 9, max: 18 },
  beatsFor(P) { return beatsFrom(framesOf(norm(P))); },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'paper', 'onPaper'], type: ['display', 'text', 'mono'] },
  slots: {
    noun:  { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    verbs: { type: 'list', count: [2, 4], of: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 9 }, zh: { chars: 3 } } } },
    notes: { type: 'list', count: [2, 4], optional: true, of: { type: 'text', tier: 'info', limits: { en: { words: 8, chars: 44 }, zh: { chars: 20 } } } },
    cards: { type: 'list', count: [4, 8], of: { type: 'scene', note: 'card k + 1 is the evidence for verb k; painted at 0.49 scale, its words are texture' } },
  },
  plan(s, ctx = {}) {
    const P = norm({ ...this.defaults(ctx), ...s, lang: ctx.lang }), beats = this.beatsFor(P);
    return { beats, reads: P.verbs.length + 1, cues: SW(P).map((f) => ({ beat: f / 15, kind: 'cut' })), settled: beats - K.tail / 15 + 1, peakAt: null, pause: null };
  },
  validate(s, ctx = {}) {
    const P = norm({ ...this.defaults(ctx), ...s, lang: ctx.lang }), err = [], lim = this.slots.verbs.of.limits[P.lang];
    if (P.verbs.length < 2 || P.verbs.length > 4) err.push(`verbs: ${P.verbs.length}, want 2–4`);
    if (P.cards.length < P.verbs.length + 2) err.push(`cards: ${P.cards.length}, want at least verbs + 2`);
    for (const v of P.verbs) if (unitCount(v, P.lang) > lim.chars) err.push(`verb "${v}" over ${lim.chars} (${P.lang})`);
    return err;
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'paper', 'onPaper'],
  from: 'the column at rest on the first card, the noun and the lead line already there, no verb',
  to: 'a poster: the last verb under the noun, its card in focus, its note below',
  interpolates: ['the column\'s offset: one card height per verb in 18 frames (swift), still otherwise', 'per card: dim, scale 0.94 and blur by its distance from focus', 'the verb: old greys then rises out of the mask (8 f), new rises in per letter (Chinese per character) from below', 'the lead line: withdrawn at the change, redrawn when the new card lands', 'the counter and the note relayed with the verb', 'a slow camera push 1 → 1.02'],
  summary: 'A column of page cards steps one card at a time only when the word changes, while a noun holds and the verb beside it is relayed in place.',
  theory: 'Text and picture annotate each other: the step makes "new evidence" a mechanical event tied to the new word (contiguity, Mayer 2009); the still column between steps keeps the click of each change (Gestalt common fate only when it means something).',
  defaults: (ctx = {}) => ({
    noun: copy('product', ctx.lang), verbs: { en: ['plans', 'renders', 'ships'], zh: ['规划', '渲染', '发布'] },
    notes: { en: ['Twelve shots, every cut on the beat', 'Render 1284 · 1080p · 1 min 42 s', 'Review approved · ready to ship'],
      zh: ['十二个镜头，每一刀都踩在拍点上', '第 1284 次渲染 · 1080p · 1 分 42 秒', '评审通过，可以发布'] },
    stop: { en: '.', zh: '。' }, size: { en: 140, zh: 128 }, counter: true, lineTo: true, push: 0.02, cues: null, probes: false,
    cards: [{ scene: 'bars' }, { scene: 'page' }, { scene: 'grid' }, { scene: 'detail' }, { scene: 'title' }, { scene: 'grid', target: 2 }],
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), c = P.colors, LH = Math.round(P.size * 1.1), top = 540 - LH;
    const paper = { ...c, ground: c.paper, panel: c.paper, ink: c.onPaper, dim: mix(c.onPaper, c.paper, 0.45), line: mix(c.onPaper, c.paper, 0.86) };
    const cards = P.cards.map((s, i) => ({ paint: painterOf(s, { lang: P.lang, colors: i % 2 ? paper : c }), light: i % 2 === 1 }));
    const nf = fontSpec(P, P.size, 560), vf = fontSpec(P, P.size, 760);
    const verbs = P.verbs.map((v) => setText(g, v + P.stop, vf, P.lang, { by: 'char', x: K.wx, y: top + LH * 1.5, align: 'left', maxW: 1e5 }));
    const mf = fontFor(NEUTRAL, 'mono', P.lang, Math.max(28, infoSize(P.lang)), 600, 'label'), tf = fontFor(NEUTRAL, 'text', P.lang, 32, 450);
    return { N: P, cards, nf, vf, verbs, mf, tf, LH, top, frames: this.beatsFor(P) * 15, sw: SW(P) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const N = D.N, f = p * D.frames, n = N.verbs.length, st = stepAt(f, N);
    const inAt = D.sw.map((s) => s + K.inAt), idx = inAt.filter((s) => f >= s).length;
    const verbs = N.verbs.map((_, i) => {
      const outAt = i + 1 < n ? D.sw[i + 1] : null;
      const grey = outAt != null ? ramp(f, outAt - 10, 10, EASE.smooth) : 0, out = outAt != null ? ramp(f, outAt, 8, EASE.exit) : 0;
      const step = N.lang === 'zh' ? 2 : 1.2;
      const k = D.verbs[i].units.map((_, j) => ramp(f, inAt[i] + j * step, K.rise, EASE.snappy));
      return { live: f >= inAt[i] && out < 1, grey, out, k };
    });
    const notes = N.verbs.map((_, i) => { const a = ramp(f, inAt[i] + 6, 14, EASE.snappy), b = i + 1 < n ? ramp(f, D.sw[i + 1], 7, EASE.exit) : 0; return { a, b, op: a * (1 - b) }; });
    const last = [...D.sw].reverse().find((s) => f >= s);
    const line = last === undefined ? ramp(f, 0, 16, EASE.snappy) : f < last + 10 ? 1 - ramp(f, last, 6, EASE.exit) : ramp(f, last + 10, 16, EASE.snappy);
    return { p, f, st, idx, verbs, notes, line, cam: 1 + N.push * EASE.swift(R(f / D.frames)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, n = P.cards.length, scroll = S.st * K.step;
    ground(ctx, P);
    ctx.save(); ctx.translate(960, 540); ctx.scale(S.cam, S.cam); ctx.translate(-960, -540);
    // the column: three laps of the cards so it never runs out; focus top at 275
    for (let rep = -1; rep < 2; rep++) D.cards.forEach((card, i) => {
      const y = K.focus + i * K.step + rep * n * K.step - scroll;
      if (y > 1200 || y < -K.ch - 120) return;
      const dist = Math.min(1.4, Math.abs(y - K.focus) / K.step), dim = Math.min(0.68, dist * 0.68), sc = 1 - 0.06 * Math.min(1, dist), blur = Math.min(3, dist * 3);
      ctx.save();
      ctx.translate(K.left + K.cw / 2, y + K.ch / 2); ctx.scale(sc, sc); ctx.translate(-K.cw / 2, -K.ch / 2);
      ctx.shadowColor = rgba('#000000', 0.5); ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
      rrect(ctx, 0, 0, K.cw, K.ch, 18); ctx.fillStyle = card.light ? c.paper : c.ground; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.save(); rrect(ctx, 0, 0, K.cw, K.ch, 18); ctx.clip();
      if (blur > 0.15) ctx.filter = `blur(${(blur / sc).toFixed(2)}px)`;
      const k = K.cw / 1920; ctx.translate(0, (K.ch - 1080 * k) / 2); ctx.scale(k, k);
      if (card.paint) card.paint(ctx, 1);
      ctx.restore();
      rrect(ctx, 0, 0, K.cw, K.ch, 18);
      if (dim > 0.002) { ctx.fillStyle = rgba(c.ground, card.light ? 0.04 + dim * 0.96 : dim); ctx.fill(); }
      ctx.lineWidth = 1; ctx.strokeStyle = card.light ? rgba(c.onPaper, 0.2) : rgba(c.ink, 0.1); ctx.stroke();
      ctx.restore();
    });
    // the lead line: focus card's right edge to the word block's centre line
    if (P.lineTo && S.line > 0.002) {
      const x0 = K.left + K.cw + 14, x1 = K.wx - 40, g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, c.accent); g.addColorStop(1, rgba(c.accent, 0.35));
      ctx.fillStyle = g; ctx.fillRect(x0, 539, (x1 - x0) * S.line, 2);
      ctx.save(); ctx.globalAlpha = Math.min(1, S.line * 2); ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(x0, 540, 7, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    }
    // counter
    if (P.counter) {
      const a = String(S.idx).padStart(2, '0'), x = K.wx + 6, y = D.top - 58 + 28;
      text(ctx, a, x, y, D.mf, { color: c.accent });
      text(ctx, ` / ${String(P.verbs.length).padStart(2, '0')}`, x + measure(ctx, a, D.mf).width, y, D.mf, { color: c.dim });
    }
    // the noun, then the verb relayed under it inside its line's mask
    text(ctx, P.noun, K.wx, D.top + D.LH * 0.5 + P.size * 0.35, D.nf, { color: mix(c.ink, c.ground, 0.3) });
    ctx.save(); ctx.beginPath(); ctx.rect(K.wx - 30, D.top + D.LH, 1920 - K.wx + 30, D.LH); ctx.clip();
    S.verbs.forEach((v, i) => {
      if (!v.live) return;
      const L = D.verbs[i], col = mix(c.ink, c.dim, v.grey), last = L.units.length - 1;
      L.units.forEach((u, j) => drawUnit(ctx, u, L, { dy: (1 - v.k[j]) * D.LH * 0.95 - v.out * D.LH * 0.9, alpha: 1 - v.out * 0.6, color: j === last && v.grey < 0.5 ? c.accent : col }));
    });
    ctx.restore();
    // the note under the block
    S.notes.forEach((o, i) => {
      if (o.op <= 0.002 || !P.notes?.[i]) return;
      text(ctx, P.notes[i], K.wx + 6, D.top + D.LH * 2 + 40 + 32 + (1 - o.a) * 14 - o.b * 10, D.tf, { color: mix(c.ink, c.ground, 0.25), alpha: o.op });
    });
    ctx.restore();
  },
  // the focus card's centre (moves only at a change) and the first unit of the newest verb
  track(S, P, D) {
    const i = Math.max(0, S.idx - 1), v = S.verbs[i], u = D.verbs[i].units[0];
    const pts = [[K.left + K.cw / 2, 540 - (S.st % 1) * K.step], [u.cx, u.y + (1 - v.k[0]) * D.LH * 0.95 - v.out * D.LH * 0.9]];
    // `probes`: the second verb's first letter as an offset, and the lead line's length ×5, for the comparison
    if (D.N.probes && S.verbs[1]) { const w = S.verbs[1]; pts.push([960, 540 + (1 - w.k[0]) * D.LH * 0.95 - w.out * D.LH * 0.9], [960 + 5 * (K.wx - 40 - (K.left + K.cw + 14)) * S.line, 540]); }
    return pts;
  },
};

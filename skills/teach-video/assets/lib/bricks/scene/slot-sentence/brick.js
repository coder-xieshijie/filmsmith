// slot-sentence — a sentence with one slot: the stem holds still while the slot cycles through words on the beat, then
// the sentence lands. Four ways to cycle: a pill rolled like a slot machine (roll), a dark chip whose width pushes
// the words beside it (chip), a wheel of words with blurred neighbours (wheel), or two words pinned at the margins
// with hard cuts that close together at the end (converge).
// Adapted from video-shotcraft demos/typography/pill-slot-cycle/PillSlotCycle.tsx (card
// references/shots/typography/pill-slot-cycle.md), demos/typography/pill-chip-slot-cycle-handled/PillChipSlotCycleHandled.tsx
// (card references/shots/typography/pill-chip-slot-cycle-handled.md),
// demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle.tsx (card
// references/shots/typography/vertical-word-roll-blur-cycle.md) and demos/typography/text-column-converge/TextColumnConverge.tsx
// (card references/shots/typography/text-column-converge.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as one HyperFrames scene brick (no React or Remotion, no measuring after mount) with four variants
// on one stem–slot–tail layout measured in prepare(); colours by role; brand words, icons, demo copy and backdrops
// removed; slot widths from the measured words in either language (Chinese: no space between stem and slot); pure
// state per frame instead of React state.
//
// Variant `how: 'bracket'` (from demos/ui-entrance/avatar-bracket-carousel/AvatarBracketCarousel.tsx, same repo and
// commit): the slot holds pictures (`images`, painters; default icons on neutral discs) in a fixed square with four accent
// corner brackets that close in from 14 units outside and swell 7 % at each change; the pictures queue vertically 76
// apart (slot 92, picture 58, at the upstream's 480-wide scale, here sized from the sentence: 34 → `size`), the queue
// moves one spring per change, each picture scaled, faded and blurred by its distance to the slot and stretched a little
// with the speed; a label chip under the slot rolls the item words with the queue; stem and tail rise in, staggered.
//
// Played through the motion-shaped interface the brick tools drive (rest / at / paint over p, u = p × beats); plan()
// and validate() give the scene's length and its slot checks as SPEC 3.2 asks.
import { clamp, lerp, ground, rgba, mix, rrect, measure, scratch, text, fontOf, bez } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { fontSpec, pick, langOf, roughUnits } from '../../motion/type-enter/type.js';
import { units as unitCount } from '../../lang.js';

const R = (u) => clamp(u);
const quintOut = (u) => 1 - Math.pow(1 - R(u), 5);
const backOut = (u) => { const c1 = 1.70158, c3 = c1 + 1, x = R(u) - 1; return 1 + c3 * x * x * x + c1 * x * x; };
const CONV = bez(0.65, 0, 0.35, 1);
// frames: per item, the move inside it, the lead, the outro
const HOW = {
  roll:     { every: 21, move: 8, lead: 12, outro: 14, center: 26 },
  chip:     { every: 30, move: 14, lead: 8, outro: 0, center: 0 },
  wheel:    { every: 30, move: 17, lead: 10, outro: 0, center: 0 },
  converge: { every: 12, move: 0, lead: 8, outro: 70, center: 0 },
  bracket:  { every: 34, move: 22, lead: 25, outro: 0, center: 0 },
};
const bspring = (t) => 1 - Math.exp(-6 * t) * Math.cos((8 + 8 * 0.75) * t * 0.25 * 2.2);   // the upstream's spring, bounce 0.25
const seg = (f, a, b, e = (x) => x) => e(R((f - a) / (b - a)));
const norm = (P) => {
  const lang = langOf(pick(P.stem, P.lang || 'en') + pick(P.items, P.lang || 'en').join(''), P.lang);
  return { ...P, lang, stem: pick(P.stem, lang), items: pick(P.items, lang), tail: pick(P.tail, lang), size: pick(P.size, lang) };
};
const framesOf = (P) => { const H = HOW[P.how]; return H.lead + (P.items.length - 1) * H.every + H.move + H.outro + H.center + 10; };

export default {
  id: 'slot-sentence', kind: 'scene',
  fits: ['demo', 'proof', 'claim'],
  surface: ['canvas'],
  beats: { min: 4, max: 14 },
  beatsFor(P) { return Math.ceil(framesOf(norm(P)) / 7.5) / 2; },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display'] },
  slots: {
    stem:  { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, default: { en: 'Every', zh: '每一次' } },
    items: { type: 'list', count: [3, 6], of: { type: 'text', tier: 'word', limits: { en: { words: 2, chars: 14 }, zh: { chars: 4 } } } },
    tail:  { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } },
  },
  plan(s, ctx = {}) {
    const P = norm({ how: 'roll', ...s, lang: ctx.lang });
    const beats = this.beatsFor(P), H = HOW[P.how];
    return { beats, reads: P.items.length, cues: P.items.map((_, i) => ({ beat: (H.lead + i * H.every) / 15, kind: 'accent' })), settled: beats - 10 / 15, peakAt: null, pause: null };
  },
  validate(s, ctx = {}) {
    const P = norm({ how: 'roll', ...s, lang: ctx.lang }), lang = P.lang, err = [];
    const n = P.items.length; if (n < 3 || n > 6) err.push(`items: ${n}, want 3–6`);
    const lim = this.slots.items.of.limits[lang];
    for (const it of P.items) { const k = lang === 'zh' ? unitCount(it, 'zh') : it.length; if (k > (lang === 'zh' ? lim.chars : lim.chars)) err.push(`item "${it}" over ${lim.chars} (${lang})`); }
    return err;
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  from: 'the stem with the first word in its slot',
  to: 'the landed sentence (roll, converge) or the last word in the slot (chip, wheel)',
  interpolates: ['the slot\'s word (out up and in from below; a wheel step; a hard cut)', 'the slot\'s width and the words it pushes', 'the landing: pill gone and the line centred (roll), the two halves closing (converge)'],
  summary: 'A sentence with one slot: the stem holds still while the slot cycles through words on the beat, then the sentence lands.',
  theory: 'Common region and a fixed frame: one slot holding words in turn says "all of these, one at a time" faster than a list; the still stem is the anchor (Palmer 1992).',
  defaults: (ctx = {}) => ({
    how: 'roll', stem: { en: 'Every', zh: '每一次' }, items: { en: ['draft', 'review', 'render', 'release'], zh: ['起稿', '审阅', '渲染', '发布'] },
    tail: { en: 'is checked', zh: '都检查过' }, size: { en: 104, zh: 96 }, weight: 700, y: 540, margin: 300,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), f = fontSpec(P), H = HOW[P.how];
    const pad = P.how === 'chip' || P.how === 'roll' ? 0.42 * P.size : 0;
    if (P.how === 'bracket') {   // fixed slot: the sentence never reflows
      const k = P.size / 34, chip = fontSpec(P, Math.round(10 * k), 600, 'text');
      return { N: P, f, H, k, chip, ws: P.items.map(() => 92 * k), sw: measure(g, P.stem, f).width, tw: P.tail ? measure(g, P.tail, f).width : 0, gap: 22 * k, pad: 0, frames: this.beatsFor(P) * 15 };
    }
    const ws = P.items.map((it) => measure(g, it, f).width), sw = measure(g, P.stem, f).width, tw = P.tail ? measure(g, P.tail, f).width : 0;
    const gap = P.lang === 'zh' ? 0.18 * P.size : measure(g, ' ', f).width + (pad ? 0.08 * P.size : 0);
    const sub = P.how === 'converge' && P.tail ? fontSpec(P, Math.round(P.size * 0.42), 500, 'text') : null;
    return { N: P, f, H, ws, sw, tw, gap, pad, sub, frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const N = D.N, H = D.H, f = Math.round(p * D.frames * 1e6) / 1e6, n = N.items.length;   // rounded: the steps are frame-exact
    if (N.how === 'bracket') {
      const starts = N.items.slice(1).map((_, i) => H.lead + i * H.every + (H.every - H.move));
      const posAt = (ff) => starts.reduce((a, t0) => a + seg(ff, t0, t0 + H.move, bspring), 0);
      return { p, f, k: 0, e: 1, wSlot: D.ws[0], pos: posAt(f), vel: posAt(f + 0.5) - posAt(f - 0.5),
        breath: starts.reduce((a, t0) => a + Math.sin(seg(f, t0, t0 + 15.5) * Math.PI), 0), lock: seg(f, 5, 26, EASE.snappy), lockOp: seg(f, 5, 14, EASE.out),
        wl: seg(f, 0, 20, EASE.snappy), wr: seg(f, 5.4, 25.4, EASE.snappy), conv: 0 };
    }
    // the step in progress: k (the word coming in), q (0 → 1 over the move)
    let k = 0, q = 1;
    for (let i = 1; i < n; i++) { const t0 = H.lead + (i - 1) * H.every + (H.every - H.move); if (f >= t0) { k = i; q = H.move ? R((f - t0) / H.move) : 1; } }
    const ease = N.how === 'wheel' ? (u) => 0.7 * quintOut(u) + 0.3 * backOut(u) : N.how === 'chip' ? EASE.swift : EASE.snappy;
    const e = ease(q), wSlot = lerp(D.ws[Math.max(0, k - 1)], D.ws[k], k ? EASE.swift(q) : 1) + 2 * D.pad;
    const endAt = H.lead + (n - 1) * H.every + H.move;
    const land = N.how === 'roll' ? EASE.snappy(R((f - endAt - 4) / H.outro)) : 0;
    const center = N.how === 'roll' ? EASE.smooth(R((f - endAt - 4 - H.outro) / H.center)) : 0;
    const conv = N.how === 'converge' ? CONV(R((f - endAt - 10) / 36)) : 0;
    const sub = N.how === 'converge' ? R((f - endAt - 10 - 36 - 18) / 4) : 0;
    const flash = N.how === 'converge' && k > 0 && f - (H.lead + (k - 1) * H.every + H.every) < 1 && f >= H.lead + (k - 1) * H.every + H.every ? 1 : 0;
    const accent = N.how === 'wheel' ? EASE.swift(R((f - (H.lead + (k - 1) * H.every + H.every - H.move) - H.move * 0.6) / 6)) + (k > 0 ? 0 : 1) : 0;
    return { p, f, k, q, e, wSlot, land, center, conv, sub, flash, accent };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, f = D.f, size = P.size, y = P.y, base = y + size * 0.35;
    ground(ctx, P);
    if (P.how === 'converge') return converge(ctx, S, P, D, c);
    if (P.how === 'bracket') return bracket(ctx, S, P, D, c);
    // layout: stem · slot · tail, centred; roll keeps the stem pinned at the margin until it lands, then centres
    const total = D.sw + D.gap + S.wSlot + (P.tail ? D.gap + D.tw : 0);
    let left = 960 - total / 2;
    if (P.how === 'roll') {
      const pinned = P.margin, landed = 960 - (D.sw + D.gap + D.ws[D.ws.length - 1] + (P.tail ? D.gap + D.tw : 0)) / 2;
      left = lerp(pinned, landed, S.center);
    }
    const sx = left + D.sw + D.gap, w = S.wSlot - (P.how === 'roll' ? 2 * D.pad * S.land : 0);
    text(ctx, P.stem, left, base, f, { color: c.ink });
    if (P.tail) text(ctx, P.tail, sx + w + D.gap, base, f, { color: c.ink });
    const H = size * 1.18, word = (s, x, yy, col, alpha = 1, blur = 0, sc = 1) => {
      ctx.save(); ctx.globalAlpha *= alpha; if (blur > 0.2) ctx.filter = `blur(${blur.toFixed(2)}px)`;
      ctx.translate(x, yy); ctx.scale(1, sc); text(ctx, s, 0, size * 0.35, f, { color: col, align: 'center' }); ctx.restore();
    };
    const cx = sx + w / 2, cur = P.items[S.k], prev = P.items[Math.max(0, S.k - 1)];
    if (P.how === 'roll') {
      const pill = (x, yy, ww, alpha, sc, s, col) => {
        ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, yy); ctx.scale(1, sc);
        ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.5), 0.12 * (1 - S.land)); ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
        rrect(ctx, -ww / 2, -H / 2, ww, H, H / 2); ctx.fillStyle = rgba(c.panel, 1 - S.land); ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(c.line, 1 - S.land); ctx.stroke();
        ctx.restore();
        word(s, x, yy, col, alpha, 0, sc);
      };
      // the old pill leaves up 1.35 em, the new one comes in from 1.25 em below (upstream 130 / 120 px at 96 px)
      if (S.k > 0 && S.q < 1) pill(cx, y - size * 1.35 * EASE.exit(S.q), D.ws[S.k - 1] + 2 * D.pad, 1 - S.q, 1 - 0.06 * S.q, prev, c.ink);
      const inY = S.k > 0 ? (1 - S.e) * size * 1.25 : 0;
      ctx.save(); if (S.k > 0 && S.q < 1) ctx.filter = `blur(${((1 - S.e) * 6).toFixed(2)}px)`;
      pill(cx, y + inY, w, S.k > 0 ? Math.min(1, S.q * 1.6) : 1, S.k > 0 ? 0.94 + 0.06 * S.e : 1, cur, S.land > 0 ? mix(c.ink, c.accent, S.land) : c.ink);
      ctx.restore();
    } else if (P.how === 'chip') {
      // the chip stays; its width follows the words; the words roll inside it, ghosts of the neighbours outside
      const pos = S.k > 0 ? S.k - 1 + S.e : 0;
      P.items.forEach((it, i) => { const d = i - pos; if (Math.abs(d) > 0.5 && Math.abs(d) < 1.6) word(it, cx, y + d * H, c.dim, 0.13); });
      rrect(ctx, sx, y - H / 2, w, H, H / 2); ctx.fillStyle = c.ink; ctx.fill();
      ctx.save(); rrect(ctx, sx, y - H / 2, w, H, H / 2); ctx.clip();
      P.items.forEach((it, i) => { const d = i - pos; if (Math.abs(d) < 1.2) word(it, cx, y + d * H, c.ground); });
      ctx.restore();
    } else if (P.how === 'wheel') {
      // a wheel: the centre word, its neighbours above and below dimmed and blurred by distance, squashed by the drum
      const pos = S.k - 1 + (S.k > 0 ? S.e : 1);
      for (let i = 0; i < P.items.length; i++) {
        const d = i - pos; if (Math.abs(d) > 1.8) continue;
        const a = Math.abs(d), col = i === S.k ? mix(c.dim, c.accent, S.accent * (1 - Math.min(1, a * 3))) : c.dim;
        word(P.items[i], sx + D.ws[i] / 2, y + d * H * 0.92, a < 0.5 ? mix(c.ink, col, 1) : col, Math.max(0, 1 - a * 0.55), a * 5, 1 - 0.12 * Math.min(1, a));
      }
    }
  },
  // roll, chip, wheel, converge: 0 the incoming word, 1 the stem's left, 2 the slot's right edge; bracket: 0 the slot
  // picture's centre (the queue), 1 the stem's left, 2 a bracket corner (its swell and close)
  track(S, P, D) {
    if (D.N.how === 'bracket') { const L = bracketLayout(D), sc = 1 + Math.min(1, S.breath) * 0.07, o = (1 - S.lock) * 14 * D.k; return [[L.cx, D.N.y + (Math.round(S.pos) - S.pos) * 76 * D.k], [L.left, D.N.y], [L.cx - 46 * D.k * sc - o, D.N.y - 46 * D.k * sc - o]]; }
    const N = D.N, x0 = 960 - (D.sw + D.gap + D.ws[D.ws.length - 1]) / 2;
    return [[960, N.y + (S.k > 0 ? (1 - S.e) * N.size * 1.25 : 0)], [lerp(N.margin, x0, S.conv), N.y], [960 + S.wSlot / 2, N.y]];
  },
};

// converge: the stem pinned at the left margin, the slot word's right edge at the right margin, hard cuts between
// words; after the last one the two close together on one curve into one centred phrase; a small line under it
const converge = (ctx, S, P, D, c) => {
  const f = D.f, size = P.size, base = P.y + size * 0.35, m = P.margin;
  const last = D.ws[D.ws.length - 1], line = D.sw + D.gap + last, x0 = 960 - line / 2;
  const stemX = lerp(m, x0, S.conv), wordR = lerp(1920 - m, x0 + line, S.conv);
  const stemCol = mix(c.dim, c.ink, S.conv), bright = S.flash ? mix(c.ink, '#ffffff', 0.35) : c.ink;
  text(ctx, P.stem, stemX, base, f, { color: stemCol });
  text(ctx, P.items[S.k], wordR, base, f, { color: S.k === P.items.length - 1 ? mix(bright, c.accent, S.conv) : bright, align: 'right' });
  if (D.sub && S.sub > 0) text(ctx, P.tail, 960, base + size * 0.9, D.sub, { color: c.dim, align: 'center', alpha: S.sub });
};

// bracket: stem · fixed slot · tail, centred; the picture queue, the corner brackets and the label chip in the slot
const bracketLayout = (D) => { const total = D.sw + D.gap + 92 * D.k + (D.N.tail ? D.gap + D.tw : 0), left = 960 - total / 2; return { left, cx: left + D.sw + D.gap + 46 * D.k }; };
const ICONS = [
  (g, r) => { g.beginPath(); g.arc(0, 0, r * 0.42, 0, Math.PI * 2); g.stroke(); },
  (g, r) => { rrect(g, -r * 0.4, -r * 0.4, r * 0.8, r * 0.8, r * 0.14); g.stroke(); },
  (g, r) => { g.beginPath(); g.moveTo(0, -r * 0.44); g.lineTo(r * 0.42, r * 0.34); g.lineTo(-r * 0.42, r * 0.34); g.closePath(); g.stroke(); },
  (g, r) => { g.beginPath(); for (let i = 0; i < 5; i++) { const x = (i - 2) * r * 0.2, h = [0.2, 0.5, 0.8, 0.5, 0.2][i] * r * 0.5; g.moveTo(x, -h); g.lineTo(x, h); } g.stroke(); },
  (g, r) => { g.beginPath(); g.moveTo(-r * 0.4, 0); g.lineTo(r * 0.4, 0); g.moveTo(0, -r * 0.4); g.lineTo(0, r * 0.4); g.stroke(); },
  (g, r) => { g.beginPath(); g.arc(0, 0, r * 0.42, Math.PI * 0.15, Math.PI * 1.85); g.stroke(); },
];
const bracket = (ctx, S, P, D, c) => {
  const k = D.k, y = P.y, base = y + P.size * 0.35, L = bracketLayout(D), cx = L.cx, n = P.items.length;
  const rise = (s, x, a, align) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; if (a < 1) ctx.filter = `blur(${((1 - a) * 2 * k).toFixed(2)}px)`; text(ctx, s, x, base + (1 - a) * 10 * k, D.f, { color: c.ink, align }); ctx.restore(); };
  rise(P.stem, L.left, S.wl, 'left');
  if (P.tail) rise(P.tail, cx + 46 * k + D.gap, S.wr, 'left');
  // a faint accent light under the slot
  if (S.lockOp > 0) { const g = ctx.createRadialGradient(cx, y, 0, cx, y, 64 * k * 0.62); g.addColorStop(0, rgba(c.accent, 0.16 * S.lockOp)); g.addColorStop(1, rgba(c.accent, 0)); ctx.fillStyle = g; ctx.fillRect(cx - 64 * k, y - 64 * k, 128 * k, 128 * k); }
  // the queue: each picture by its distance d to the slot (scale, fade, blur), stretched along the queue with the speed
  const smear = Math.min(0.08, Math.abs(S.vel) * 0.24), r = 29 * k;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(i - S.pos), op = Math.max(0, 1 - d * 0.62), enter = seg(S.f, 3 + i * 4.65, 18.6 + i * 4.65, EASE.out);
    if (op * enter <= 0.002) continue;
    const sc = Math.max(0.5, 1 - d * 0.38);
    ctx.save(); ctx.globalAlpha = op * enter; const bl = Math.min(3, d * 2.4) * k; if (bl > 0.2) ctx.filter = `blur(${bl.toFixed(2)}px)`;
    ctx.translate(cx, y + (i - S.pos) * 76 * k + (1 - enter) * 12 * k); ctx.scale(sc * (1 - smear * 0.5), sc * (1 + smear));
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
    if (P.images?.[i]) { ctx.translate(-r, -r); P.images[i](ctx, 2 * r, 2 * r); }
    else {
      const disc = mix(c.panel, c.ink, 0.18 + 0.1 * (i % 4)), g = ctx.createRadialGradient(-r * 0.36, -r * 0.64, 0, 0, 0, r * 1.2);
      g.addColorStop(0, mix(disc, '#FFFFFF', 0.22)); g.addColorStop(0.55, disc); g.addColorStop(1, mix(disc, '#000000', 0.18));
      ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
      ctx.strokeStyle = rgba(c.ground, 0.94); ctx.lineWidth = 1.7 * k * 0.42; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ICONS[i % ICONS.length](ctx, r);
    }
    ctx.restore();
  }
  // the brackets: four corners closing in from 14 units outside, swelling 7 % at each change
  if (S.lockOp > 0) {
    const sc = 1 + Math.min(1, S.breath) * 0.07, o = (1 - S.lock) * 14 * k, h = 46 * k * sc, a = 22 * k * sc;
    ctx.save(); ctx.globalAlpha = S.lockOp; ctx.strokeStyle = c.accent; ctx.lineWidth = 3.2 * k * 0.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = rgba(c.accent, 0.45); ctx.shadowBlur = 3 * k;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const px = cx + sx * (h + o), py = y + sy * (h + o);
      ctx.beginPath(); ctx.moveTo(px, py - sy * a); ctx.lineTo(px, py); ctx.lineTo(px - sx * a, py); ctx.stroke();
    }
    ctx.restore();
    // the label chip under the slot: its words roll with the queue, one at a time
    const cw = 78 * k, ch = 20 * k, top = y + 58 * k - ch / 2 + (1 - S.lockOp) * 6 * k;
    ctx.save(); ctx.globalAlpha = S.lockOp; rrect(ctx, cx - cw / 2, top, cw, ch, ch / 2); ctx.fillStyle = c.ink; ctx.fill(); ctx.clip();
    P.items.forEach((it, i) => {
      const a = Math.max(0, 1 - Math.abs(i - S.pos) * 2.2); if (a <= 0) return;
      const yy = top + ch / 2 + (i - S.pos) * 14 * k, w = measure(ctx, it, D.chip).width, x0 = cx - (w + 9 * k) / 2;
      ctx.globalAlpha = S.lockOp * a; ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(x0 + 2 * k, yy, 2 * k, 0, Math.PI * 2); ctx.fill();
      text(ctx, it, x0 + 9 * k, yy, D.chip, { color: c.ground, baseline: 'middle' });
    });
    ctx.restore();
  }
};

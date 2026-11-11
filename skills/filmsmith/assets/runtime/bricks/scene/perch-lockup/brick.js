// perch-lockup — the lock-up with a mascot: the mascot drops into the frame and lands with a squash, the name rises
// behind it, the mascot shrinks and flies to perch at the end of the name, a selection box takes the name, a suffix
// types itself after it (the row re-centres as it grows), a pill says where to find the product, and the mascot hops
// once and sways while the lock-up holds.
// Own: extracted from the source film (the shared lock-up of the bunny launch films).
// Changes from it: a Canvas2D scene brick (no GSAP timeline, no DOM); the product name, the typed suffix, the pill's
// text and its highlighted part are slots; the mascot is a slot of two poses (`mascot` dropping in, `perch` crouched),
// with a neutral placeholder box and anchor when the film has none (SPEC 3.3: the library draws no character);
// colours by role (the white-to-accent ground and its three slow glows, the suffix, caret, box and pill in the
// accent); the flight to the perch scales about the mascot's centre so it lands on the slot; the hold comes from
// reading time.
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch } from '../../../handoffs/util.js';
import { fontFor, graphemes, readTime, units } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

const S = 30;   // frames a second (the source is timed in seconds)
const E = {
  cubicIn: (t) => t * t * t, quadOut: (t) => t * (2 - t), cubicOut: (t) => 1 - Math.pow(1 - t, 3), cubicInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)), sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  backOut: (t, s = 3) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  bounceOut: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
};
const tw = (t, a, d, e = (u) => u) => e(clamp((t - a) / d));
// the timeline in seconds (as in the source)
const T = { blobs: 0.35, drop: 0.5, squash: [0.5, 0.09], back: [0.59, 0.35], name: [0.35, 0.5], fly: [0.95, 0.5], perch: [1.45, 0.3], sel: [1.6, 0.18], selOut: [2.6, 0.15], caret: 1.8, type0: 1.85, each: 0.15, pill: [2.75, 0.35], wipe: [2.85, 0.6], hop: 3.6 };
const BIG = 560, SLOT = 150, ROW_Y = 510;
const LIM = { name: { en: { words: 1, chars: 10 }, zh: { chars: 5 } }, suffix: { en: { words: 2, chars: 12 }, zh: { chars: 5 } }, pill: { en: { words: 6, chars: 34 }, zh: { chars: 16 } } };

const timing = (s, lang) => {
  const typed = T.type0 + graphemes(s.suffix || '').length * T.each, settled = Math.max(T.wipe[0] + T.wipe[1], typed);
  const read = readTime(`${s.name} ${s.suffix || ''}`, lang) + (s.pill ? readTime(s.pill, lang) : 0) + 0.6;
  const end = Math.max(6, settled + 1, T.name[0] + read);
  return { settled, end, beats: Math.ceil((end * S) / 15) };
};

// The mascot in a box of `size` px centred at (cx, cy): the film's image of that pose, or the neutral placeholder (a
// dashed box with the anchor where the feet go).
const mascotAt = (ctx, img, cx, cy, size, C, alpha = 1) => {
  if (alpha <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (typeof img === 'function') img(ctx, cx - size / 2, cy - size / 2, size);
  else if (img && (img.width || img.naturalWidth)) { const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, k = size / Math.max(w, h); ctx.drawImage(img, cx - (w * k) / 2, cy - (h * k) / 2, w * k, h * k); }
  else {
    const k = size / 560, x = cx - size * 0.38, y = cy - size * 0.44, w = size * 0.76, h = size * 0.86;
    rrect(ctx, x, y, w, h, size * 0.18); ctx.fillStyle = rgba(C.panel, 0.7); ctx.fill();
    ctx.setLineDash([18 * k, 12 * k]); ctx.lineWidth = Math.max(1.5, 5 * k); ctx.strokeStyle = mix(C.accent, C.ink, 0.25); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, y + h, Math.max(3, 12 * k), 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
    ctx.lineWidth = Math.max(1, 3 * k); ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.moveTo(cx - 30 * k, y + h); ctx.lineTo(cx + 30 * k, y + h); ctx.stroke();
  }
  ctx.restore();
};

export default {
  id: 'perch-lockup', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 12, max: 16 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    name: { type: 'text', tier: 'primary', sample: 'product', limits: LIM.name },
    suffix: { type: 'text', tier: 'primary', optional: true, limits: LIM.suffix },
    pill: { type: 'text', tier: 'glance', optional: true, limits: LIM.pill },
    highlight: { type: 'text', tier: 'glance', optional: true, limits: LIM.name },
    mascot: { type: 'image', optional: true },
    perch: { type: 'image', optional: true },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'The mascot drops in, the name rises behind it, the mascot flies to perch at its end, a suffix types itself on, a pill says where to find it, and the lock-up holds.',
  defaults: (ctx = {}) => {
    const zh = ctx.lang === 'zh', p = copy('product', ctx.lang || 'en');
    return { name: p, suffix: zh ? '工作台' : 'Studio', pill: zh ? `${p} · 左侧栏` : `${p} · left sidebar`, highlight: p, mascot: null, perch: null };
  },
  plan(s, ctx) {
    const t = timing(s, ctx.lang);
    return { beats: t.beats, reads: [{ text: `${s.name} ${s.suffix || ''}`.trim(), lang: ctx.lang }, ...(s.pill ? [{ text: s.pill, lang: ctx.lang }] : [])],
      cues: [{ beat: (T.drop * S) / 15, kind: 'land' }, { beat: ((T.fly[0] + T.fly[1]) * S) / 15, kind: 'accent' }, { beat: (T.type0 * S) / 15, kind: 'accent' }, { beat: (T.hop * S) / 15, kind: 'accent' }],
      motion: 'drop, perch, type, pill', settled: (t.settled * S) / 15, peakAt: (T.drop * S) / 15, pause: ((t.end - t.settled) * S) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en';
    for (const k of ['name', 'suffix', 'pill']) if (s[k] && units(s[k], L) > (L === 'zh' ? LIM[k].zh.chars : LIM[k].en.words)) err.push(`${k} too long`);
    if (s.highlight && s.pill && !s.pill.includes(s.highlight)) err.push('highlight: not part of the pill text');
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, g = scratch();
    const nf = fontFor(NEUTRAL, 'display', L, 150, 800, 'display'), sf = fontFor(NEUTRAL, 'display', L, 118, 600), pf = fontFor(NEUTRAL, 'text', L, 32, 500);
    const glyphs = graphemes(s.suffix || ''), cum = [0]; for (let i = 0; i < glyphs.length; i++) cum.push(measure(g, glyphs.slice(0, i + 1).join(''), sf).width);
    const nw = measure(g, s.name, nf).width, pw = s.pill ? measure(g, s.pill, pf).width : 0;
    return { nf, sf, pf, glyphs, cum, nw, pw, t: timing(s, L) };
  },
  // the row at time t: the words (name, typed suffix, caret) then the perch slot, centred as one line
  row(t, D) {
    const n = t < T.type0 ? 0 : Math.min(D.glyphs.length, Math.floor((t - T.type0) / T.each + 1e-9) + 1), sw = n ? 26 + D.cum[n] : 0;
    const words = 6 + D.nw + sw + 8 + 6 + 6, total = words + 22 + SLOT, x0 = 960 - total / 2;
    return { n, x0, words, slotX: x0 + words + 22, slotCx: x0 + words + 22 + SLOT / 2, slotCy: ROW_Y + 12 };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, t = f / S;
    // the ground: panel down to the accent, three slow glows fading in
    const g = ctx.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, C.panel); g.addColorStop(0.34, C.panel); g.addColorStop(0.52, mix(C.panel, C.accent, 0.12)); g.addColorStop(0.7, mix(C.panel, C.accent, 0.3)); g.addColorStop(0.86, mix(C.panel, C.accent, 0.6)); g.addColorStop(1, C.accent);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
    const ba = tw(t, 0, T.blobs, E.quadOut), drift = clamp(t / 6);
    const blob = (cx, cy, rx, ry, col, a) => { if (a <= 0.002) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(rx, ry); const r = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, rgba(col, a)); r.addColorStop(0.55, rgba(col, a * 0.55)); r.addColorStop(1, rgba(col, 0)); ctx.fillStyle = r; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); };
    blob(-180 + 450 + lerp(-60, 80, drift), 640 + 260, 560, 360, C.accent, 0.55 * ba);
    blob(1100 + 500 + lerp(60, -90, drift), 700 + 280, 620, 380, mix(C.accent, C.ink, 0.3), 0.45 * ba);
    blob(560 + 410, 560 + 180 + lerp(20, -20, drift), 520, 260, C.panel, 0.75 * ba);
    const R = this.row(t, D), R0 = this.row(T.fly[0], D);
    // the name rises out of a blur, behind the mascot
    const na = tw(t, T.name[0], T.name[1], E.expoOut), nb = ROW_Y + D.nf.size * 0.36;
    if (na > 0) { ctx.save(); if (na < 0.999) ctx.filter = `blur(${((1 - na) * 10).toFixed(2)}px)`; text(ctx, s.name, R.x0 + 6, nb + (1 - na) * 40, D.nf, { color: C.ink, alpha: na }); ctx.restore(); }
    // the typed suffix and its caret
    if (R.n) text(ctx, D.glyphs.slice(0, R.n).join(''), R.x0 + 6 + D.nw + 26, nb, D.sf, { color: C.accent });
    const caretOn = t >= T.caret && t < 3.3 && !(t >= 2.5 && t < 2.75) && !(t >= 3.0 && t < 3.25);
    if (caretOn) { ctx.fillStyle = C.accent; ctx.fillRect(R.x0 + 6 + D.nw + (R.n ? 26 + D.cum[R.n] : 0) + 8, ROW_Y - 56, 6, 112); }
    // the selection box round the words, with four handles
    const sa = t < T.selOut[0] ? tw(t, T.sel[0], T.sel[1], E.quadOut) : 1 - tw(t, T.selOut[0], T.selOut[1]);
    if (sa > 0.002) {
      const k = lerp(1.04, 1, tw(t, T.sel[0], T.sel[1], E.quadOut)), x = R.x0 - 16, y = ROW_Y - D.nf.size * 0.5 - 14, w = R.words + 32, h = D.nf.size + 36;
      ctx.save(); ctx.globalAlpha = sa; ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h);
      for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { ctx.fillStyle = C.panel; ctx.fillRect(hx - 8, hy - 8, 16, 16); ctx.strokeRect(hx - 8, hy - 8, 16, 16); }
      ctx.restore();
    }
    // the pill: rises in, its text wiped on left to right, the highlighted part in the accent
    if (s.pill) {
      const pa = tw(t, T.pill[0], T.pill[1], E.cubicOut), wipe = tw(t, T.wipe[0], T.wipe[1], E.quadOut);
      if (pa > 0.002) {
        const w = 20 + 40 + 16 + D.pw + 32, h = 72, x = 960 - w / 2, y = 650 + (1 - pa) * 16;
        ctx.save(); ctx.globalAlpha = pa;
        ctx.save(); ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.4), 0.14); ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = rgba(C.panel, 0.92); ctx.fill(); ctx.restore();
        rrect(ctx, x, y, w, h, h / 2); ctx.strokeStyle = rgba(C.accent, 0.18); ctx.lineWidth = 1.5; ctx.stroke();
        rrect(ctx, x + 20, y + 16, 40, 40, 12); ctx.fillStyle = C.accent; ctx.fill(); ctx.beginPath(); ctx.arc(x + 40, y + 36, 8, 0, Math.PI * 2); ctx.fillStyle = C.onAccent; ctx.fill();
        const tx = x + 76;
        ctx.save(); ctx.beginPath(); ctx.rect(tx - 2, y, (D.pw + 4) * wipe, h); ctx.clip();
        const by = y + h / 2 + D.pf.size * 0.35, hi = s.highlight && s.pill.includes(s.highlight) ? s.pill.indexOf(s.highlight) : -1;
        if (hi < 0) text(ctx, s.pill, tx, by, D.pf, { color: C.ink });
        else {
          const a = s.pill.slice(0, hi), b = s.highlight, cpart = s.pill.slice(hi + b.length), g = scratch();
          const wa = measure(g, a, D.pf).width, wb = measure(g, b, D.pf).width;
          text(ctx, a, tx, by, D.pf, { color: C.ink }); text(ctx, b, tx + wa, by, D.pf, { color: C.accent }); text(ctx, cpart, tx + wa + wb, by, D.pf, { color: C.ink });
        }
        ctx.restore(); ctx.restore();
      }
    }
    // the mascot: dropped big, squashed and sprung back, then flown to the perch (scaled about its centre)
    const big = { x: 960, y: 470 };
    if (t < T.perch[0]) {
      const d = tw(t, 0, T.drop, E.cubicIn), y = lerp(-1150, 0, d);
      let sx = lerp(0.92, 1, d), sy = lerp(1.1, 1, d);
      if (t >= T.squash[0]) { const q = tw(t, T.squash[0], T.squash[1], E.quadOut); sx = lerp(1, 1.12, q); sy = lerp(1, 0.86, q); }
      if (t >= T.back[0]) { const q = tw(t, T.back[0], T.back[1], E.backOut); sx = lerp(1.12, 1, q); sy = lerp(0.86, 1, q); }
      const fl = tw(t, T.fly[0], T.fly[1], E.cubicInOut), k = lerp(1, SLOT / BIG, fl);
      const cx = lerp(big.x, R0.slotCx, fl), cy = lerp(big.y + y, R0.slotCy, fl), foot = cy + (BIG * k) * 0.4;
      ctx.save(); ctx.translate(cx, foot); ctx.scale(sx * k, sy * k); ctx.translate(-cx, -foot);
      mascotAt(ctx, s.mascot, cx, cy, BIG, C); ctx.restore();
    } else {
      // perched: lands with a squash, hops once, sways
      const q = tw(t, T.perch[0], T.perch[1], (u) => E.backOut(u)), sx = lerp(1.1, 1, q), sy = lerp(0.86, 1, q);
      const hop = t < T.hop ? 0 : t < T.hop + 0.18 ? -26 * tw(t, T.hop, 0.18, E.quadOut) : -26 * (1 - tw(t, T.hop + 0.18, 0.22, E.bounceOut));
      const rot = t < 4.2 ? 0 : t < 4.8 ? lerp(0, -5, tw(t, 4.2, 0.6, E.sineInOut)) : t < 5.5 ? lerp(-5, 3, tw(t, 4.8, 0.7, E.sineInOut)) : lerp(3, 0, tw(t, 5.5, 0.5, E.sineInOut));
      const cx = R.slotCx, cy = R.slotCy + hop, foot = cy + SLOT * 0.4;
      ctx.save(); ctx.translate(cx, foot); ctx.rotate((rot * Math.PI) / 180); ctx.scale(sx, sy); ctx.translate(-cx, -foot);
      mascotAt(ctx, s.perch || s.mascot, cx, cy, SLOT, C); ctx.restore();
    }
  },
  track(u, s, c, D) { const t = (u * 15) / S, R = this.row(t, D); return [[R.x0 + 6, ROW_Y], [R.slotCx, R.slotCy]]; },
  blur() { return false; },
};

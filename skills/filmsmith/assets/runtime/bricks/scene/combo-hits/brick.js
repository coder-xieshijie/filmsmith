// combo-hits — a feature combo: three cards slam into three dashed slots one after another on an even beat; every hit
// holds the whole picture for two frames, throws a ring and sparks, punches a number up off the card and steps a ×N
// counter up (bigger, tilted further, one more heat bar); after the third hit a closing line rises word by word.
// Adapted from video-shotcraft demos/effects/impact-feedback/HitCounter.tsx (card
// references/shots/effects/impact-feedback.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the hit-stop is time-freeze's hitStop() (the
// same remap: real hit frame = content hit frame + the frames already held; only the card flash and the slot glow run
// on real frames); the fall is slam-drop's `fall` drop, but its ring and sparks are drawn round the card's outline as in
// the upstream (burst() throws round rings from a point), sparks growing hit by hit; the closing line is stagger-in's riseText(); brand, eyebrow, demo features, their icons' meaning and the demo savings
// removed: the cards (title, meta, an optional icon image), the number each hit punches out, the counter's label and
// the closing line are slots; colours by role (the cobalt field is the ground leaning to the accent, the cards are
// paper, the arcade yellow is the accent, the hard shadow a darkened ground); no italic or skew in Chinese.
import { clamp, lerp, mix, rgba, rrect, measure, text, scratch } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, readTime, units, breaks } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import { hitStop } from '../../motion/time-freeze/brick.js';
import { riseText } from '../../motion/stagger-in/brick.js';

const HITS = [30, 58, 86], STOP = 2, REAL = HITS.map((h, i) => h + i * STOP);
const SLOT = { w: 480, h: 330, y: 446, gap: 60 }, XS = [0, 1, 2].map((i) => 960 - (SLOT.w * 3 + SLOT.gap * 2) / 2 + i * (SLOT.w + SLOT.gap));
const FROM = -460, IN_QUAD = bez(0.55, 0.085, 0.68, 0.53);
const DMG = [88, 104, 124], PULSE = [1.3, 1.45, 1.6], TILT = [-2, -4, -6], COUNTER = [140, 166, 196];
const CLOSE = { at: REAL[2] + 14, each: 18, gap: 3, y: 866 };
const LIM = {
  title: { en: { words: 3, chars: 16 }, zh: { chars: 6 } }, meta: { en: { words: 4, chars: 22 }, zh: { chars: 9 } },
  hit: { en: { words: 2, chars: 8 }, zh: { chars: 5 } }, label: { en: { words: 1, chars: 8 }, zh: { chars: 3 } }, line: { en: { words: 7, chars: 36 }, zh: { chars: 14 } },
};
const dropY = (t, hit) => lerp(FROM, SLOT.y, ramp(t, hit - 10, 10, IN_QUAD));

const timing = (s, lang) => {
  const n = s.line ? breaks(s.line, lang).length : 0, risen = CLOSE.at + Math.max(0, n - 1) * CLOSE.gap + CLOSE.each;
  const end = Math.max(176, risen + 15, Math.round(CLOSE.at + (readTime(s.line || '', lang) + 0.6) * 30));
  return { end, risen, beats: Math.ceil(end / 15) };
};

// The card's default icon: three plain line glyphs (lines on a sheet, a level meter, stacked planes).
const glyph = (ctx, i, x, y, col) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(34 / 24, 34 / 24); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  if (i % 3 === 0) { rrect(ctx, 4, 3.5, 16, 17, 2.5); ctx.moveTo(8, 8.5); ctx.lineTo(16, 8.5); ctx.moveTo(8, 12); ctx.lineTo(16, 12); ctx.moveTo(8, 15.5); ctx.lineTo(13, 15.5); }
  else if (i % 3 === 1) for (const [x0, a, b] of [[7, 8.5, 15.5], [11, 4.5, 19.5], [15, 8, 16], [19, 10.5, 13.5]]) { ctx.moveTo(x0, a); ctx.lineTo(x0, b); }
  else { ctx.moveTo(3, 8.5); ctx.lineTo(12, 4); ctx.lineTo(21, 8.5); ctx.lineTo(12, 13); ctx.closePath(); ctx.moveTo(3, 12.5); ctx.lineTo(12, 17); ctx.lineTo(21, 12.5); ctx.moveTo(3, 16.5); ctx.lineTo(12, 21); ctx.lineTo(21, 16.5); }
  ctx.stroke(); ctx.restore();
};

export default {
  id: 'combo-hits', kind: 'scene',
  fits: ['proof', 'climax', 'demo'],
  surface: ['canvas'],
  beats: { min: 12, max: 14 },
  needs: { motions: ['time-freeze', 'stagger-in'], props: [], roles: ['ground', 'paper', 'onPaper', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    cards: { type: 'list', count: [3, 3], of: {
      title: { type: 'text', tier: 'glance', limits: LIM.title },
      meta: { type: 'text', tier: 'glance', optional: true, limits: LIM.meta },
      hit: { type: 'text', tier: 'word', claim: true, limits: LIM.hit },
      icon: { type: 'image', optional: true },
    } },
    label: { type: 'text', tier: 'word', limits: LIM.label },
    line: { type: 'text', tier: 'primary', claim: true, sample: 'claim', optional: true, limits: LIM.line },
  },
  roles: ['ground', 'paper', 'onPaper', 'dim', 'accent'],
  summary: 'Three cards slam into their slots on an even beat; every hit freezes the frame for two frames, punches a number up off the card and steps a ×N counter up; a closing line rises after the third.',
  defaults: (ctx = {}) => {
    const L = ctx.lang || 'en', cards = copy('cards', L), kpis = copy('kpis', L);
    return { cards: [0, 1, 2].map((i) => ({ title: cards[i].title, meta: cards[i].meta, hit: kpis[i].delta, icon: null })), label: L === 'zh' ? '连击' : 'Combo', line: copy('claim', L) };
  },
  plan(s, ctx) {
    const T = timing(s, ctx.lang);
    return { beats: T.beats, reads: [...s.cards.map((c) => ({ text: `${c.title} ${c.hit}`, lang: ctx.lang })), ...(s.line ? [{ text: s.line, lang: ctx.lang }] : [])],
      cues: REAL.map((h) => ({ beat: h / 15, kind: 'hit' })), motion: 'three slams with hit-stop; counter steps; closing line rises',
      settled: T.risen / 15, peakAt: REAL[2] / 15, pause: (T.end - T.risen) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en', over = (v, lim) => v && units(v, L) > (L === 'zh' ? lim.zh.chars : lim.en.words);
    if (!Array.isArray(s.cards) || s.cards.length !== 3) err.push('cards: exactly three');
    (s.cards || []).forEach((c, i) => { for (const k of ['title', 'meta', 'hit']) if (over(c[k], LIM[k])) err.push(`cards[${i}].${k} too long`); });
    if (over(s.label, LIM.label)) err.push('label too long');
    if (over(s.line, LIM.line)) err.push('line too long');
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, g = scratch(), it = L === 'zh' ? '' : 'italic';
    const titles = s.cards.map((c) => { let f = fontFor(NEUTRAL, 'display', L, 48, 760, 'display'); const w = measure(g, c.title, f).width; if (w > SLOT.w - 76) f = { ...f, size: Math.max(36, (48 * (SLOT.w - 76)) / w) }; return f; });
    return {
      titles, meta: fontFor(NEUTRAL, 'text', L, 30, 450), num: fontFor(NEUTRAL, 'mono', L, 26, 600), slotNum: fontFor(NEUTRAL, 'display', L, 120, 800, 'display'),
      foot: { ...fontFor(NEUTRAL, 'display', L, 32, 800), style: it }, dmg: DMG.map((z) => ({ ...fontFor(NEUTRAL, 'display', L, z, 900, 'display'), style: it })),
      counter: COUNTER.map((z) => ({ ...fontFor(NEUTRAL, 'display', L, z, 900, 'display'), style: it })), counter0: { ...fontFor(NEUTRAL, 'display', L, 130, 900, 'display'), style: it },
      label: { ...fontFor(NEUTRAL, 'display', L, 26, 800), style: it, spacing: L === 'zh' ? 26 * 0.12 : 26 * 0.3 }, line: fontFor(NEUTRAL, 'display', L, 60, 760, 'display'),
      skew: L === 'zh' ? 0 : 1, T: timing(s, L),
    };
  },
  // a card's top-left and scale at real frame f (content time from the hit-stop remap); null before it appears
  card(f, i) {
    const t = hitStop(f, HITS, STOP), hit = HITS[i];
    if (t < hit - 10) return null;
    const y = dropY(t, hit), vy = t < hit ? dropY(t + 0.5, hit) - dropY(t - 0.5, hit) : 0, speed = Math.min(1, vy / 200);
    const s = t - hit, squash = s >= 0 ? 0.07 * Math.exp(-s / 1.6) : 0;
    return { x: XS[i], y, vy, sx: 1 - speed * 0.025 + squash * 0.5, sy: 1 + speed * 0.06 - squash, elev: s >= 0 ? 6 : lerp(6, 60, (SLOT.y - y) / (SLOT.y - FROM)) };
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, t = hitStop(f, HITS, STOP), L = c.lang, count = HITS.filter((h) => t >= h).length;
    const field = mix(C.ground, C.accent, 0.22), deep = mix(C.ground, '#000000', 0.55), white = C.paper;
    // the field: a gradient leaning to the accent, a key light, slow diagonal stripes (frozen with the hits), a dot screen at the foot
    const bg = ctx.createLinearGradient(0, 0, 400, 1080 * 1.1); bg.addColorStop(0, mix(field, C.accent, 0.18)); bg.addColorStop(0.55, field); bg.addColorStop(1, mix(field, '#000000', 0.45));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(730, 324); ctx.scale(1150, 594); const kl = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); kl.addColorStop(0, rgba(mix(C.accent, white, 0.4), 0.3)); kl.addColorStop(0.7, rgba(C.accent, 0)); ctx.fillStyle = kl; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = white; ctx.lineWidth = 2; ctx.beginPath();
    const sh = (t * 2.2) % 54.2, dx = Math.tan((32 * Math.PI) / 180) * 1480;
    for (let x = -1400 + sh; x < 2200; x += 54.2) { ctx.moveTo(x, -200); ctx.lineTo(x + dx, 1280); }
    ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = deep; for (let y = 441; y < 1080; y += 18) { ctx.globalAlpha = 0.14 * clamp((y - 432) / 648); for (let x = 9; x < 1920; x += 18) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); } } ctx.restore();
    // the slots: dashed outlines with their numbers; the falling card's shadow gathering; the glow under a landing (real frames)
    for (let i = 0; i < 3; i++) {
      const x = XS[i], near = ramp(t, HITS[i] - 10, 10, IN_QUAD), glow = f >= REAL[i] ? Math.exp(-(f - REAL[i]) / 6) : 0;
      rrect(ctx, x, SLOT.y, SLOT.w, SLOT.h, 26); ctx.fillStyle = rgba(deep, 0.16); ctx.fill();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = rgba(white, 0.28); ctx.lineWidth = 2; rrect(ctx, x + 1, SLOT.y + 1, SLOT.w - 2, SLOT.h - 2, 25); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, `0${i + 1}`, x + SLOT.w / 2, SLOT.y + SLOT.h / 2 + D.slotNum.size * 0.36, D.slotNum, { color: white, alpha: 0.1, align: 'center' });
      if (near > 0 && t < HITS[i]) { ctx.save(); ctx.filter = `blur(${lerp(44, 16, near).toFixed(1)}px)`; ctx.globalAlpha = lerp(0.05, 0.5, near); rrect(ctx, x + 40 - (1 - near) * 40, SLOT.y + 50, SLOT.w - 80 + (1 - near) * 80, SLOT.h - 40, 30); ctx.fillStyle = deep; ctx.fill(); ctx.restore(); }
      if (glow > 0.02) { ctx.save(); ctx.translate(x + SLOT.w / 2, SLOT.y + SLOT.h + 20); ctx.scale((SLOT.w + 240) / 2, 100); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(C.accent, 0.45 * glow)); g.addColorStop(0.7, rgba(C.accent, 0)); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
    }
    // the cards: stretched by their speed while falling (a few sub-samples), squashed on the hit, flashed white on the held frames
    for (let i = 0; i < 3; i++) {
      const P = this.card(f, i); if (!P) continue;
      const cd = s.cards[i], saved = ramp(t, HITS[i] + 12, 12, EASE.snappy), df = f - REAL[i];
      const flash = df >= 0 && df < STOP + 4 ? (df < STOP ? 0.7 : 0.7 * (1 - (df - STOP + 1) / 5)) : 0;
      const n = P.vy > 8 ? Math.min(4, Math.ceil(P.vy / 30)) : 1;
      for (let k = 0; k < n; k++) {
        const oy = n === 1 ? 0 : -(P.vy * 0.12) * (k / (n - 1));
        ctx.save(); ctx.globalAlpha = n === 1 ? 1 : (k === 0 ? 1 : 0.45 / n);
        ctx.translate(P.x + SLOT.w / 2, P.y + oy + SLOT.h); ctx.scale(P.sx, P.sy); ctx.translate(-SLOT.w / 2, -SLOT.h);
        ctx.save(); ctx.shadowColor = rgba(deep, 0.5); ctx.shadowBlur = 30 + P.elev * 1.4; ctx.shadowOffsetY = 10 + P.elev * 0.8; rrect(ctx, 0, 0, SLOT.w, SLOT.h, 26);
        const cg = ctx.createLinearGradient(0, 0, 0, SLOT.h); cg.addColorStop(0, white); cg.addColorStop(1, mix(white, C.accent, 0.03)); ctx.fillStyle = cg; ctx.fill(); ctx.restore();
        if (k === 0) {
          rrect(ctx, 38, 34, 62, 62, 18); ctx.fillStyle = rgba(C.accent, 0.1); ctx.fill();
          if (cd.icon && (cd.icon.width || cd.icon.naturalWidth)) ctx.drawImage(cd.icon, 52, 48, 34, 34); else glyph(ctx, i, 52, 48, C.accent);
          text(ctx, `0${i + 1}`, SLOT.w - 38, 74, D.num, { color: mix(C.onPaper, white, 0.55), align: 'right' });
          text(ctx, cd.title, 38, 34 + 62 + 30 + D.titles[i].size * 0.8, D.titles[i], { color: C.onPaper });
          if (cd.meta) text(ctx, cd.meta, 38, 34 + 62 + 30 + D.titles[i].size + 12 + 30, D.meta, { color: mix(C.onPaper, white, 0.35) });
          if (saved > 0) { ctx.save(); ctx.globalAlpha = saved; ctx.fillStyle = rgba(C.onPaper, 0.1); ctx.fillRect(38, SLOT.h - 80, SLOT.w - 76, 1); text(ctx, cd.hit, 38, SLOT.h - 32 + lerp(10, 0, saved), D.foot, { color: mix(C.accent, C.onPaper, 0.25) }); ctx.restore(); }
          if (flash > 0) { rrect(ctx, 0, 0, SLOT.w, SLOT.h, 26); ctx.fillStyle = rgba(white, flash); ctx.fill(); }
        }
        ctx.restore();
      }
    }
    // the impact of each hit (content time: it freezes with the hold): slam-drop's ring and sparks, the rounded ring round the slot
    for (let i = 0; i < 3; i++) {
      const k = t - HITS[i]; if (k < 0 || k > 16) continue;
      const cx = XS[i] + SLOT.w / 2, cy = SLOT.y + SLOT.h / 2, ring = ramp(t, HITS[i], 14, EASE.out), grow = lerp(0, 46 + i * 10, ring);
      if (ring < 1) { ctx.save(); ctx.globalAlpha = (1 - ring) * 0.8; ctx.strokeStyle = white; ctx.lineWidth = lerp(5, 1, ring); rrect(ctx, XS[i] - grow, SLOT.y - grow * 0.7, SLOT.w + grow * 2, SLOT.h + grow * 1.4, 26 + grow * 0.6); ctx.stroke(); ctx.restore(); }
      const b = ramp(t, HITS[i], 12, EASE.snappy), n = 10 + i * 3;
      if (b < 1) {
        ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = lerp(7, 2, b); ctx.globalAlpha = Math.min(1, b * 6) * (1 - b);
        for (let q = 0; q < n; q++) {
          const ang = (q / n) * Math.PI * 2 + hash(i * 31 + q, 5) * 0.4, rx = SLOT.w * 0.52, ry = SLOT.h * 0.56;
          const r0 = lerp(1, 1.08 + hash(q + i * 7, 6) * 0.15, b), r1 = lerp(1.04, 1.3 + hash(q * 3 + i, 7) * 0.35 + i * 0.06, Math.min(1, b * 1.2));
          ctx.strokeStyle = q % 3 === 0 ? white : C.accent; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * rx * r0, cy + Math.sin(ang) * ry * r0); ctx.lineTo(cx + Math.cos(ang) * rx * r1, cy + Math.sin(ang) * ry * r1); ctx.stroke();
        }
        ctx.restore();
      }
    }
    // the numbers each hit punches out: set on the card, scaled down from 1.45, rising off its top edge, fading
    for (let i = 0; i < 3; i++) {
      const k = t - HITS[i]; if (k < 0 || k > 17) continue;
      const sc = lerp(1.45, 1, ramp(t, HITS[i], 5, EASE.snappy)), rise = lerp(0, -150, ramp(t, HITS[i], 16, EASE.out)), a = k < 4 ? 1 : 1 - ramp(t, HITS[i] + 4, 12, EASE.swift);
      const F = D.dmg[i], bx = XS[i] + SLOT.w / 2, by = SLOT.y + SLOT.h * 0.62 + rise;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(bx, by); ctx.scale(sc, sc); if (D.skew) ctx.transform(1, 0, Math.tan((-8 * Math.PI) / 180), 1, 0, 0);
      text(ctx, s.cards[i].hit, 6, -F.size * 0.12 + 6, F, { color: deep, align: 'center' }); text(ctx, s.cards[i].hit, 0, -F.size * 0.12, F, { color: C.accent, align: 'center' });
      ctx.restore();
    }
    // the counter, top right: ×0 dim, then a stamp per hit (bigger, tilted further, pulsing back), heat bars filling
    {
      const i = count - 1, since = count ? t - HITS[i] : 0, k = count ? 1 + (PULSE[i] - 1) * Math.exp(-since / 2.4) : 1, rot = count ? TILT[i] : 0, stamp = count ? 1 - ramp(t, HITS[i], 7, EASE.out) : 0;
      const F = count ? D.counter[i] : D.counter0, right = 1920 - 120, top = 64, ox = right - 40, oy = top + 56;
      ctx.save(); ctx.translate(ox, oy); ctx.rotate((rot * Math.PI) / 180); ctx.scale(k, k); ctx.translate(-ox, -oy);
      text(ctx, s.label, right, top + 26, D.label, { color: white, alpha: count ? 1 : 0.4, align: 'right' });
      const ny = top + 26 + 6 + F.size * 0.8 - stamp * 0.14 * F.size;
      ctx.save(); ctx.translate(right, ny); if (D.skew) ctx.transform(1, 0, Math.tan((-6 * Math.PI) / 180), 1, 0, 0);
      if (count) text(ctx, `×${count}`, 7, 7, F, { color: deep, align: 'right' });
      text(ctx, `×${count}`, 0, 0, F, { color: count ? C.accent : white, alpha: count ? 1 : 0.22, align: 'right' });
      ctx.restore();
      for (let b = 0; b < 3; b++) { const x = right - (3 - b) * 56 - (2 - b) * 8, y = ny + 14 + F.size * 0.1; if (b < count) { rrect(ctx, x + 3, y + 3, 56, 10, 5); ctx.fillStyle = deep; ctx.fill(); } rrect(ctx, x, y, 56, 10, 5); ctx.fillStyle = b < count ? C.accent : rgba(white, 0.18); ctx.fill(); }
      ctx.restore();
    }
    // the closing line, word by word (real frames)
    if (s.line) riseText(ctx, s.line, 960, CLOSE.y + D.line.size * 0.8, D.line, { color: white, lang: L, f, start: CLOSE.at, each: CLOSE.each, gap: CLOSE.gap, align: 'center' });
    // the vignette in the darkened ground
    ctx.save(); ctx.translate(960, 540); ctx.scale(1250, 860); const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); vg.addColorStop(0.45, rgba(deep, 0)); vg.addColorStop(1, rgba(deep, 0.42)); ctx.fillStyle = vg; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  },
  // the first and last cards' top-left corners (compare pairs them with the upstream's card boxes)
  // (before a card appears, the point where it will hang)
  track(u) { const f = u * 15; return [0, 2].map((i) => { const P = this.card(f, i); return P ? [P.x, P.y] : [XS[i], FROM]; }); },
  blur() { return false; },
};

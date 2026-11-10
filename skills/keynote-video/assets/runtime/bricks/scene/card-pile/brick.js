// card-pile — a set of cards lands one by one on a pile, then either fans out with one card drawn (fan) or keeps
// arriving while the older cards step back, blur and fade (stream).
// Adapted from video-shotcraft demos/ui-entrance/card-stack/CardStack.tsx (card references/shots/ui-entrance/card-stack.md)
// and demos/ui-entrance/research-card-stack-scroll/ResearchCardStackScroll.tsx (card
// references/shots/ui-entrance/research-card-stack-scroll.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the two shots are two `end`s of one pile (fan:
// accelerating spring drops, a 5 px press per landing, a squeeze, a spring fan of 6.5° and 138 px per card from a pivot
// under the cards, the centre card drawn 72 px with an accent ring and one sheen; stream: one card every 12 frames on
// a down-right axis, older cards step back by depth, blur and dim, a ruled ground scrolls as the speed reference, and
// the stream brakes to a stop in the last 20 frames so the scene lands still); cards are the tile-card prop with the
// film's items; colours by role; the mark, shot names, paper titles and counts are the film's own slots.
import { clamp, lerp, mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { cubicOut } from '../../../motion.js';
import { fontFor, wrap, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { springAt, riseText } from '../../motion/stagger-in/brick.js';
import { drawCard, faceCanvas, cardItems, cardShadow } from '../../prop/tile-card/brick.js';

const FAN = { frames: 150, cw: 320, ch: 440, cx: 960, cy: 610, rot: 6.5, tx: 138, drop: 820 };
const STREAM = { frames: 144, per: 12, k: 4.32, cw: 1280, ch: 416, brake: 20 };
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // fixed per-card scatter
const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);

const startsOf = (n) => Array.from({ length: n }, (_, i) => 2 + (n <= 1 ? 0 : EASE.out(i / (n - 1)) * 40));

// fan: every card's pose at frame f
const fanAt = (f, n) => {
  const S = startsOf(n), feat = Math.floor((n - 1) / 2);
  const dip = S.reduce((d, s) => d + Math.sin(clamp((f - s - 6) / 9) * Math.PI) * 5, 0);
  const squeeze = 1 - 0.02 * Math.sin(clamp((f - 62) / 10) * Math.PI);
  const fan = f < 68 ? 0 : springAt(f - 68, { damping: 20, stiffness: 95 });
  const cam = lerp(lerp(1, 1.06, ramp(f, 0, 64, 'smooth')), 0.88, ramp(f, 64, 42, 'smooth')) * lerp(1, 1.017, ramp(f, 122, 28, 'smooth'));
  const lift = ramp(f, 102, 18, 'overshoot'), ring = ramp(f, 104, 12, 'out'), sheen = ramp(f, 108, 22, 'smooth');
  const cards = S.map((s, i) => {
    const p = f < s ? 0 : springAt(f - s, { damping: 13, stiffness: 150 });
    const y = (1 - p) * FAN.drop, k = i - (n - 1) / 2;
    const tilt = (i % 2 ? 1 : -1) * 9 * (y / FAN.drop);
    return {
      on: f >= s, feat: i === feat,
      rot: lerp((rnd(i * 3 + 1) - 0.5) * 6.4 + tilt, k * FAN.rot, fan),
      tx: lerp((rnd(i * 5 + 2) - 0.5) * 22, k * FAN.tx, fan),
      ty: y + dip + (i === feat ? -72 * lift : 0),
      elev: 6 + (y / FAN.drop) * 50 + (i === feat ? 26 * lift : 0),
    };
  });
  return { cards, dip, squeeze, fan, cam, lift, ring, sheen, landed: S.filter((s) => f >= s + 6).length };
};

// stream: the brake maps scene frames to stream frames (speed 1 → 0 over the last `brake` frames)
const streamFrame = (f, n) => {
  const end = STREAM.frames, b = STREAM.brake, a = end - b;
  if (f <= a) return f;
  const u = clamp((f - a) / b);
  return a + b * (u - (u * u) / 2);
};
const streamAt = (f, n) => {
  const g = streamFrame(f, n), K = STREAM.k, GAP = 30 * K, XOFF = 9 * K;
  const cards = Array.from({ length: n }, (_, i) => {
    const e = g - i * STREAM.per;
    const p = cubicOut(clamp((e + 6) / 6));
    const drift = (Math.max(0, e) / STREAM.per) * GAP;
    const depth = Math.min(1, drift / (GAP * 3));
    const op = e < -6 ? 0 : Math.min(1, (e + 6) / 2) * (1 - Math.max(0, (drift - GAP * 3.2) / (GAP * 1.6)));
    return { on: op > 0, x: (Math.max(0, e) / STREAM.per) * XOFF, y: lerp(-40 * K, 0, p) + drift, s: lerp(0.94, 1, p), squash: e >= 0 && e < 1.6 ? 0.97 : 1, depth, op: clamp(op) };
  });
  return { g, cards, focus: Math.floor(g / STREAM.per), grid: (((g / STREAM.per) * 30 * 1.08) % 24) * 4 };
};

export default {
  id: 'card-pile', kind: 'scene',
  fits: ['demo', 'proof', 'hook'],
  surface: ['canvas'],
  beats: { min: 8, max: 12 },
  beatsFor: (P) => (P.end === 'stream' ? STREAM.frames : FAN.frames) / 15,
  needs: { motions: ['stagger-in'], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    cards: { type: 'list', count: [5, 13], of: {
      title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      meta: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      image: { type: 'image', crop: true, optional: true },
    } },
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 30 }, zh: { chars: 13 } } },
    subtitle: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 22 } } },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A set of cards lands one by one on a pile, then fans out with one card drawn, or keeps arriving while older cards step back.',
  defaults: (ctx = {}) => ({ end: 'fan', cards: null, title: null, subtitle: null, eyebrow: null }),
  plan(s, ctx) {
    const beats = this.beatsFor(s);
    const reads = [s.title || copy('claim', ctx.lang)].map((t) => ({ text: t, lang: ctx.lang }));
    return { beats, reads, cues: s.end === 'stream' ? [{ beat: 0.4, kind: 'accent' }] : [{ beat: 4.5, kind: 'turn' }, { beat: 6.8, kind: 'land' }], peakAt: s.end === 'stream' ? null : 6.8, settled: beats - 1.9 };
  },
  validate(s, ctx) {
    const err = [], n = (s.cards || []).length;
    if (s.cards && (n < 5 || n > 13)) err.push(`cards: ${n} (5–13)`);
    if (s.end === 'fan' && n && n % 2 === 0) err.push('fan: an odd number of cards keeps the drawn card in the middle');
    const lim = this.slots.title.limits[ctx.lang === 'zh' ? 'zh' : 'en'];
    if (s.title && units(s.title, ctx.lang) > (ctx.lang === 'zh' ? lim.chars : lim.words)) err.push('title too long');
    return err;
  },
  prepare(P) {
    const stream = P.end === 'stream';
    const n = P.cards ? P.cards.length : stream ? 13 : 9;
    const base = cardItems(P.lang, 6);
    const items = (P.cards || Array.from({ length: n }, (_, i) => base[i % base.length])).map((it, i) => ({ figure: ['gantt', 'bars', 'line', 'rings', 'blocks', 'grid', 'dots', 'wave', 'bars'][i % 9], foot: copy('caption', P.lang), ...it }));
    const feat = Math.floor((n - 1) / 2);
    const faces = stream
      ? items.map((it, i) => ({ full: faceCanvas(it, STREAM.cw, STREAM.ch, P, { layout: 'note', index: i, featured: i % 4 === 1 }, 1), bare: faceCanvas({ ...it, meta: '' }, STREAM.cw, STREAM.ch, P, { layout: 'note', index: i, featured: i % 4 === 1, body: 0 }, 1) }))
      : items.map((it, i) => faceCanvas(it, FAN.cw, FAN.ch, P, { layout: 'cover', index: i, featured: i === feat, ts: 1 / 0.88 }, 1.6));
    return { n, items, faces, stream, title: P.title || copy('claim', P.lang), subtitle: P.subtitle || copy('subtitle', P.lang), eyebrow: P.eyebrow || copy('eyebrow', P.lang) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * (D.stream ? STREAM.frames : FAN.frames);
    return { p, f, ...(D.stream ? streamAt(f, D.n) : fanAt(f, D.n)) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, f = S.f, info = infoSize(P.lang);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    if (D.stream) {
      ctx.save(); ctx.strokeStyle = rgba(c.ink, 0.055); ctx.lineWidth = 4;
      for (let y = -104 + S.grid; y < 1180; y += 96) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke(); }
      ctx.restore();
      const K = STREAM.k, top = 540 - STREAM.ch / 2 - 14 * K;
      S.cards.forEach((cd, i) => {
        if (!cd.on) return;
        ctx.save();
        ctx.globalAlpha = cd.op;
        ctx.translate(960 + cd.x, top + cd.y + STREAM.ch / 2); ctx.scale(cd.s, cd.s * cd.squash); ctx.translate(-STREAM.cw / 2, -STREAM.ch / 2);
        cardShadow(ctx, STREAM.cw, STREAM.ch, 26, c, 44, 1 - cd.depth * 0.5);
        if (cd.depth > 0.01) ctx.filter = `blur(${(cd.depth * 4 * K).toFixed(2)}px) brightness(${(1 - cd.depth * 0.25).toFixed(3)})`;
        const face = i === S.focus ? D.faces[i].full : D.faces[i].bare;
        ctx.drawImage(face, 0, 0, STREAM.cw, STREAM.ch);
        ctx.restore();
      });
      return;
    }
    // fan: frame furniture that does not move with the camera
    ctx.save(); ctx.globalAlpha = ramp(f, 0, 12, 'out');
    text(ctx, D.eyebrow, 120, 120, F(P, 'mono', info, 600, 'label'), { color: c.dim });
    ctx.restore();
    const n = D.n, pad = (v) => String(v).padStart(2, '0');
    ctx.save(); ctx.globalAlpha = ramp(f, 4, 12, 'out');
    text(ctx, `${pad(S.landed)} / ${pad(n)}`, 1800, 120, F(P, 'mono', info, 600, 'label'), { color: c.dim, align: 'right' });
    ctx.restore();
    ctx.save();
    ctx.translate(FAN.cx, FAN.cy + 120); ctx.scale(S.cam, S.cam); ctx.translate(-FAN.cx, -(FAN.cy + 120));
    // the contact shadow on the ground: gathered under the pile, wide under the fan
    const sw = lerp(220, 760, S.fan), sy = FAN.cy + FAN.ch / 2 - 30 + S.dip;
    ctx.save(); ctx.globalAlpha = ramp(f, 6, 20, 'out');
    const g = ctx.createRadialGradient(FAN.cx, sy + 35, 0, FAN.cx, sy + 35, sw / 2);
    g.addColorStop(0, rgba(mix(c.ink, '#000000', 0.5), 0.28)); g.addColorStop(0.7, rgba(mix(c.ink, '#000000', 0.5), 0));
    ctx.translate(FAN.cx, sy + 35); ctx.scale(1, 70 / sw); ctx.translate(-FAN.cx, -(sy + 35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(FAN.cx, sy + 35, sw / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const px = FAN.cx, py = FAN.cy - FAN.ch / 2 + 1.3 * FAN.ch;   // the fan's pivot: under the cards (origin 50 % 130 %)
    S.cards.forEach((cd, i) => {
      if (!cd.on) return;
      ctx.save();
      ctx.translate(cd.tx, cd.ty);
      ctx.translate(px, py); ctx.rotate((cd.rot * Math.PI) / 180); ctx.scale(S.squeeze, S.squeeze); ctx.translate(-px, -py);
      ctx.translate(FAN.cx - FAN.cw / 2, FAN.cy - FAN.ch / 2);
      cardShadow(ctx, FAN.cw, FAN.ch, cd.elev, c);
      ctx.drawImage(D.faces[i], 0, 0, FAN.cw, FAN.ch);
      if (cd.feat && S.ring > 0) { rrect(ctx, -1.5, -1.5, FAN.cw + 3, FAN.ch + 3, 23.5); ctx.lineWidth = 3 * S.ring; ctx.strokeStyle = rgba(c.accent, 0.9 * S.ring); ctx.stroke(); }
      if (cd.feat && S.sheen > 0 && S.sheen < 1) {
        ctx.save(); rrect(ctx, 0, 0, FAN.cw, FAN.ch, 22); ctx.clip();
        const sx = lerp(-FAN.cw * 0.4, FAN.cw * 1.4, S.sheen);
        const sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
        sg.addColorStop(0, rgba('#ffffff', 0)); sg.addColorStop(0.5, rgba('#ffffff', 0.55)); sg.addColorStop(1, rgba('#ffffff', 0));
        ctx.fillStyle = sg; ctx.fillRect(0, 0, FAN.cw, FAN.ch); ctx.restore();
      }
      ctx.restore();
    });
    ctx.restore();
    // the title rises as the drawn card lifts; the subtitle follows
    const tf = F(P, 'display', 88, 720, 'display');
    riseText(ctx, D.title, 960, 238, tf, { color: c.ink, lang: P.lang, f, start: 106, each: 18, gap: 3, span: 18, align: 'center' });
    const so = ramp(f, 116, 14, 'out');
    if (so > 0) text(ctx, D.subtitle, 960, 318 + (1 - ramp(f, 116, 18, 'snappy')) * 16, F(P, 'text', 34, 480), { color: c.dim, align: 'center', alpha: so });
  },
  // fan: the first card's and the drawn card's centres (the camera applied); stream: the newest card's centre
  track(S, P, D) {
    if (D.stream) {
      const K = STREAM.k, top = 540 - STREAM.ch / 2 - 14 * K, i = Math.max(0, Math.min(D.n - 1, S.focus));
      return [[960 + S.cards[i].x, top + S.cards[i].y + STREAM.ch / 2], [960 + S.cards[0].x, top + S.cards[0].y + STREAM.ch / 2]];
    }
    const px = FAN.cx, py = FAN.cy - FAN.ch / 2 + 1.3 * FAN.ch, oy = FAN.cy + 120;
    return [0, Math.floor((D.n - 1) / 2), D.n - 1].map((i) => {
      const cd = S.cards[i], a = (cd.rot * Math.PI) / 180;
      const dx = 0, dy = (FAN.cy - py) * S.squeeze;
      let x = px + dx * Math.cos(a) - dy * Math.sin(a) + cd.tx, y = py + dx * Math.sin(a) + dy * Math.cos(a) + cd.ty;
      return [FAN.cx + (x - FAN.cx) * S.cam, oy + (y - oy) * S.cam];
    });
  },
};

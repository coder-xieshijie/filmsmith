// field-fill — a detail card builds itself field by field as if being filled in: a fill cursor jumps ahead from slot
// to slot, each skeleton slot gives way to its content (picture, title, tags, a value that is struck and replaced, body
// lines with a marker, swatches, the button filling left to right) while the whole card creeps forward.
// Adapted from video-shotcraft demos/ui-entrance/product-card-progressive-assemble/ProductCardProgressiveAssemble.tsx
// (card references/shots/ui-entrance/product-card-progressive-assemble.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the upstream's product (its own mark, name,
// price, licence chip, selling lines and brand swatches) is the film's slots, with sample copy, a neutral object on a
// seamless backdrop and the palette's roles as swatches by default; the cursor's AUTOFILL tag is a pulsing dot (a
// label only when the film gives one); the field timetable, the cursor's 6-frame asymmetric hops, the rise and pop
// landings, the value change (struck and shrunk, the new value on a spring, a chip), the 6-frame markers, the button
// fill and the 1 → 1.035 push keep the upstream timing; colours by role; grain is dropped.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const FRAMES = 172;
const CW = 1520, CH = 840, CL = (1920 - CW) / 2, CT = (1080 - CH) / 2 + 6, PAD = 60;
const IMG = { x: PAD, y: PAD, w: 640, h: CH - PAD * 2 };
const COL = PAD + 640 + 64, COLW = CW - COL - PAD;
// field slots (card px) and the frame the cursor arrives
const FIELDS = {
  img: { box: [IMG.x, IMG.y, IMG.w, IMG.h], at: 8 },
  title: { box: [COL, 66, 560, 150], at: 20 },
  tags: { box: [COL, 244, 560, 52], at: 30 },
  value: { box: [COL, 322, 670, 112], at: 42 },
  body: { box: [COL, 462, COLW, 150], at: 76 },
  swatch: { box: [COL, 636, 520, 56], at: 96 },
  cta: { box: [COL, 716, COLW, 64], at: 114 },
};
const ORDER = ['img', 'title', 'tags', 'value', 'body', 'swatch', 'cta'];
const HOP = 6, LAND = 2, DROP = 62;
const ORIGIN = [CL + CW / 2, CT + CH * 0.55];

// the cursor's box at frame f: between two slots, an asymmetric in-out (swift) on position and size together
const cursorBox = (f) => {
  let prev = FIELDS[ORDER[0]].box;
  for (let i = 0; i < ORDER.length; i++) {
    const cur = FIELDS[ORDER[i]];
    if (f < cur.at) { const k = i === 0 ? 1 : ramp(f, cur.at - HOP, HOP, 'swift'); return prev.map((v, j) => lerp(v, cur.box[j], k)); }
    prev = cur.box;
  }
  return prev;
};
const landP = (f, key, extra = 0) => ramp(f, FIELDS[key].at + LAND + extra, 14, 'snappy');
const popAt = (f, start) => ({ s: lerp(0.4, 1, springAt(f - start, { damping: 13, stiffness: 260 })), o: clamp((f - start) / 4) });
// draw fn() risen by (1 - p)·dist, blurred and faded in (p ≥ 1: plain)
const rise = (ctx, p, dist, fn) => {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.8); ctx.translate(0, (1 - p) * dist);
  if (p < 0.98) ctx.filter = `blur(${((1 - p) * 6).toFixed(2)}px)`;
  fn(); ctx.restore();
};
const skeleton = (ctx, [x, y, w, h], fade, rows, radius, c) => {
  if (fade >= 1) return;
  const gap = 14, rh = Math.min(28, (h - gap * (rows.length - 1)) / rows.length), top = y + (h - (rows.length * rh + gap * (rows.length - 1))) / 2;
  ctx.save(); ctx.globalAlpha *= 1 - fade; ctx.fillStyle = mix(c.panel, c.line, 0.75);
  rows.forEach((r, i) => { rrect(ctx, x, top + i * (rh + gap), w * r, rh, Math.min(radius, rh / 2)); ctx.fill(); });
  ctx.restore();
};

export default {
  id: 'field-fill', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 10, max: 13 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    image: { type: 'image', crop: true, optional: true },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 28 }, zh: { chars: 12 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 5 } } },
    tags: { type: 'list', count: [2, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 5 } } } },
    from: { type: 'number', limits: { en: { chars: 6 }, zh: { chars: 6 } } },
    to: { type: 'number', claim: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
    chip: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } },
    body: { type: 'list', count: [2, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 38 }, zh: { chars: 18 } } } },
    marks: { type: 'list', count: [0, 3], of: { type: 'number' }, optional: true },
    swatchLabel: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    cta: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    cursorLabel: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A detail card builds itself field by field as a fill cursor jumps ahead from slot to slot; one value is struck and replaced on the way.',
  defaults: () => ({ image: null, eyebrow: null, title: null, tags: null, from: null, to: null, chip: null, body: null, marks: null, swatchLabel: null, cta: null, cursorLabel: null }),
  plan(s, ctx) {
    const beats = FRAMES / 15;
    return { beats, reads: [{ text: s.to || copy('metric2', ctx.lang), lang: ctx.lang }], cues: [{ beat: DROP / 15, kind: 'turn' }, { beat: (DROP + 4) / 15, kind: 'land' }], peakAt: (DROP + 4) / 15, settled: 132 / 15 };
  },
  validate(s, ctx) {
    const err = [];
    if (s.title && units(s.title, ctx.lang) > (ctx.lang === 'zh' ? 5 : 1)) err.push('title: one word (112 px)');
    if (s.tags && (s.tags.length < 2 || s.tags.length > 3)) err.push('tags: 2–3');
    if (s.body && (s.body.length < 2 || s.body.length > 3)) err.push('body: 2–3 lines');
    return err;
  },
  prepare(P) {
    const kpis = copy('kpis', P.lang), steps = copy('steps', P.lang), sep = P.lang === 'zh' ? ' · ' : ' · ';
    const D = {
      eyebrow: P.eyebrow || `${copy('eyebrow', P.lang)}${sep}${copy('detailEyebrow', P.lang)}`,
      title: P.title || copy('product', P.lang),
      tags: P.tags || steps.slice(0, 3),
      from: P.from || copy('metric2', P.lang), to: P.to || kpis[2].value, chip: P.chip || kpis[2].delta,
      body: P.body || [copy('claim', P.lang), copy('titleLong', P.lang), copy('subtitle', P.lang)],
      marks: P.marks || [0, 1],
      swatchLabel: P.swatchLabel || copy('label', P.lang),
      cta: P.cta || `${steps[3]} — ${copy('product', P.lang)}`,
    };
    return D;
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const f = p * FRAMES;
    const enter = ramp(f, 0, 14, 'snappy'), push = 1 + 0.035 * ramp(f, 0, 132, 'swift');
    const cOut = ramp(f, FIELDS.cta.at + 8, 8, 'exit');
    return { f, enter, scale: lerp(0.96, 1, enter) * push, ty: (1 - enter) * 30,
      cursor: cursorBox(f), cursorOp: ramp(f, 2, 6, 'out') * (1 - cOut), pad: 14 * (1 - cOut),
      img: landP(f, 'img'), title: landP(f, 'title'), title2: landP(f, 'title', 2), tags: landP(f, 'tags'), value: landP(f, 'value'), body: landP(f, 'body'), sw: landP(f, 'swatch'),
      cut: ramp(f, DROP, 6, 'snappy'), strike: ramp(f, DROP, 5, 'out'), newP: springAt(f - DROP - 1, { damping: 14, stiffness: 240 }), newO: clamp((f - DROP - 1) / 3), chip: ramp(f, DROP + 7, 10, 'snappy'),
      cta: ramp(f, FIELDS.cta.at + LAND, 12, 'out'), ctaText: ramp(f, FIELDS.cta.at + 8, 8, 'out'), objIn: ramp(f, 10, 40, 'out') };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, f = S.f, info = infoSize(P.lang);
    // the stage: a vertical wash of the ground, a key light up left, a faint accent glow behind the card, a vignette
    const bg = ctx.createLinearGradient(0, 0, 0, 1080);
    bg.addColorStop(0, mix(c.ground, '#ffffff', 0.35)); bg.addColorStop(1, mix(c.ground, c.dim, 0.08));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
    for (const [x, y, r, col, a] of [[576, 54, 1100, mix(c.ground, '#ffffff', 0.7), 0.7], [1550, 870, 520, c.accent, 0.08]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
    }
    ctx.save();
    ctx.globalAlpha = clamp(S.enter * 1.6);
    ctx.translate(ORIGIN[0], ORIGIN[1] + S.ty); ctx.scale(S.scale, S.scale); ctx.translate(-ORIGIN[0] + CL, -ORIGIN[1] + CT);
    // the card face
    const tone = mix(c.ink, '#000000', 0.55);
    ctx.save();
    for (const [b, dy, a] of [[4, 2, 0.06], [90, 40, 0.2]]) { ctx.shadowColor = rgba(tone, a); ctx.shadowBlur = b; ctx.shadowOffsetY = dy; rrect(ctx, 20, 20, CW - 40, CH - 40, 36); ctx.fillStyle = c.panel; ctx.fill(); }
    ctx.restore();
    const face = ctx.createLinearGradient(0, 0, 0, CH); face.addColorStop(0, mix(c.panel, '#ffffff', 0.5)); face.addColorStop(1, c.panel);
    rrect(ctx, 0, 0, CW, CH, 36); ctx.fillStyle = face; ctx.fill();
    rrect(ctx, 0.75, 0.75, CW - 1.5, CH - 1.5, 36); ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.stroke();
    // skeleton slots
    skeleton(ctx, [COL, 66, 200, 26], S.title, [1], 10, c);
    skeleton(ctx, [COL, 112, 520, 96], S.title, [0.85], 16, c);
    skeleton(ctx, FIELDS.tags.box, S.tags, [0.62], 26, c);
    skeleton(ctx, FIELDS.value.box, S.value, [0.38], 16, c);
    skeleton(ctx, FIELDS.body.box, S.body, [0.92, 0.86, 0.6], 10, c);
    skeleton(ctx, FIELDS.swatch.box, S.sw, [0.5], 28, c);
    skeleton(ctx, FIELDS.cta.box, S.cta, [1], 32, c);
    // the picture: a seamless backdrop and the film's image, or a neutral object on it
    ctx.save(); rrect(ctx, IMG.x, IMG.y, IMG.w, IMG.h, 24); ctx.clip();
    ctx.fillStyle = mix(c.panel, c.line, 0.5); ctx.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
    ctx.globalAlpha = S.img;
    const sb = ctx.createRadialGradient(IMG.x + IMG.w * 0.38, IMG.y + IMG.h * 0.26, 0, IMG.x + IMG.w * 0.38, IMG.y + IMG.h * 0.26, IMG.h * 0.9);
    sb.addColorStop(0, mix(c.panel, '#ffffff', 0.8)); sb.addColorStop(0.46, mix(c.panel, c.line, 0.5)); sb.addColorStop(1, mix(c.panel, c.dim, 0.18));
    ctx.fillStyle = sb; ctx.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);
    ctx.globalAlpha = 1;
    rise(ctx, S.img, 26, () => {
      const k = lerp(1.08, 1, S.objIn), cx = IMG.x + IMG.w / 2, cy = IMG.y + IMG.h * 0.47;
      ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
      if (P.image && (P.image.width || P.image.naturalWidth)) {
        const iw = P.image.width || P.image.naturalWidth, ih = P.image.height || P.image.naturalHeight, s = Math.max(IMG.w / iw, IMG.h / ih);
        ctx.drawImage(P.image, cx - (iw * s) / 2, IMG.y + IMG.h / 2 - (ih * s) / 2, iw * s, ih * s);
        return;
      }
      const sh = ctx.createRadialGradient(cx, cy + 210, 0, cx, cy + 210, 230);
      sh.addColorStop(0, rgba(tone, 0.26)); sh.addColorStop(1, rgba(tone, 0));
      ctx.save(); ctx.translate(cx, cy + 210); ctx.scale(1, 0.14); ctx.translate(-cx, -(cy + 210)); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy + 210, 230, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      const og = ctx.createLinearGradient(cx, cy - 170, cx, cy + 170);
      og.addColorStop(0, mix(c.panel, '#ffffff', 0.7)); og.addColorStop(1, mix(c.panel, c.dim, 0.22));
      ctx.save(); ctx.shadowColor = rgba(tone, 0.18); ctx.shadowBlur = 40; ctx.shadowOffsetY = 24; rrect(ctx, cx - 170, cy - 170, 340, 340, 64); ctx.fillStyle = og; ctx.fill(); ctx.restore();
      rrect(ctx, cx - 169, cy - 169, 338, 338, 63); ctx.strokeStyle = rgba(c.ink, 0.08); ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.strokeStyle = c.accent; ctx.lineWidth = 14; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill();
    });
    ctx.restore();
    text(ctx, '01 / 06', IMG.x + 32, IMG.y + 30 + info, F(P, 'mono', info, 500, 'label'), { color: c.dim, alpha: S.img });
    // eyebrow and title
    rise(ctx, S.title, 10, () => text(ctx, D.eyebrow, COL, 66 + info, F(P, 'mono', info, 600, 'label'), { color: c.dim }));
    rise(ctx, S.title2, 26, () => text(ctx, D.title, COL - 4, 104 + 100, F(P, 'display', 112, 720, 'display'), { color: c.ink }));
    // tags: popped in turn from their left edge
    const tf = F(P, 'text', Math.max(28, info), 560);
    let tx = COL;
    D.tags.forEach((t, i) => {
      const w = measure(ctx, t, tf).width + 44, { s, o } = popAt(f, FIELDS.tags.at + LAND + i * 3), last = i === D.tags.length - 1, y = FIELDS.tags.box[1];
      if (o > 0) {
        ctx.save(); ctx.globalAlpha *= o; ctx.translate(tx, y + 26); ctx.scale(s, s); ctx.translate(-tx, -(y + 26));
        rrect(ctx, tx, y, w, 52, 26); ctx.fillStyle = last ? mix(c.panel, '#ffffff', 0.6) : mix(c.panel, c.line, 0.45); ctx.fill();
        ctx.strokeStyle = last ? rgba(c.ink, 0.16) : c.line; ctx.lineWidth = last ? 1.5 : 1; ctx.stroke();
        text(ctx, t, tx + 22, y + 36, tf, { color: last ? c.ink : mix(c.ink, c.dim, 0.5) });
        ctx.restore();
      }
      tx += w + 12;
    });
    // the value row: the first value lands, holds, then is struck, shrunk and greyed; the new one springs out, a chip follows
    const vy = FIELDS.value.box[1], vf = F(P, 'display', 112, 760, 'display'), base = vy + 112 - 4 - 22;
    rise(ctx, S.value, 16, () => {
      const k = lerp(1, 0.46, S.cut), w0 = measure(ctx, D.from, vf).width;
      ctx.save(); ctx.translate(COL, vy + 112 * 0.88); ctx.scale(k, k); ctx.translate(-COL, -(vy + 112 * 0.88));
      text(ctx, D.from, COL, base, vf, { color: S.cut > 0.5 ? c.dim : c.ink });
      if (S.strike > 0) { rrect(ctx, COL - 6, base - 40, (w0 + 12) * S.strike, 9, 4); ctx.fillStyle = c.dim; ctx.fill(); }
      ctx.restore();
      const nx = COL + w0 * 0.46 + 36;
      if (S.newO > 0) {
        const s = lerp(1.18, 1, S.newP);
        ctx.save(); ctx.globalAlpha *= S.newO; ctx.translate(nx, vy + 112 * 0.8); ctx.scale(s, s); ctx.translate(-nx, -(vy + 112 * 0.8));
        text(ctx, D.to, nx, base, F(P, 'display', 112, 780, 'display'), { color: c.accent }); ctx.restore();
      }
      if (S.chip > 0) {
        const cf = F(P, 'text', Math.max(26, info), 700), cw = measure(ctx, D.chip, cf).width + 32, cx = nx + measure(ctx, D.to, F(P, 'display', 112, 780, 'display')).width + 28 - (1 - S.chip) * 16;
        ctx.save(); ctx.globalAlpha *= S.chip; rrect(ctx, cx, vy + 40, cw, 46, 23); ctx.fillStyle = rgba(c.accent, 0.1); ctx.fill(); ctx.strokeStyle = rgba(c.accent, 0.25); ctx.lineWidth = 1.5; ctx.stroke();
        text(ctx, D.chip, cx + 16, vy + 40 + 33, cf, { color: c.accent }); ctx.restore();
      }
    });
    // body: lines rise in turn; a marker sweeps under the marked lines, faster than the lines landed
    const bf = F(P, 'text', 34, 450), bfm = F(P, 'text', 34, 620);
    D.body.forEach((line, li) => {
      const y = FIELDS.body.box[1] + 36 + li * 50, marked = D.marks.includes(li);
      rise(ctx, landP(f, 'body', li * 3), 14, () => {
        if (marked) {
          const m = ramp(f, 86 + li * 4, 6, 'out'), w = measure(ctx, line, bfm).width;
          if (m > 0) { rrect(ctx, COL - 4, y - 30, (w + 8) * m, 40, 6); ctx.fillStyle = rgba(c.accent, 0.16); ctx.fill(); }
        }
        text(ctx, line, COL, y, marked ? bfm : bf, { color: marked ? c.ink : mix(c.ink, c.dim, 0.45) });
      });
    });
    // swatches (the palette's own roles) and their label
    const sy = FIELDS.swatch.box[1] + 28;
    [c.ink, c.panel, c.accent, c.dim].forEach((col, i) => {
      const { s, o } = popAt(f, FIELDS.swatch.at + LAND + i * 3), x = COL + 26 + i * 68 + (i ? 4 : 0);
      if (o <= 0) return;
      ctx.save(); ctx.globalAlpha *= o; ctx.translate(x, sy); ctx.scale(s, s);
      if (i === 0) { ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = c.panel; ctx.fill(); }
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = rgba(c.ink, 0.12); ctx.lineWidth = 1; ctx.stroke();
      const hl = ctx.createRadialGradient(-9, -8, 0, -9, -8, 18); hl.addColorStop(0, rgba('#ffffff', 0.35)); hl.addColorStop(1, rgba('#ffffff', 0));
      ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    rise(ctx, ramp(f, FIELDS.swatch.at + 12, 12, 'snappy'), 10, () => text(ctx, D.swatchLabel, COL + 26 + 3 * 68 + 4 + 54, sy + 11, F(P, 'text', 30, 600), { color: c.ink }));
    // the button: its fill runs left to right, the label fades in
    if (S.cta > 0) {
      const [x, y, w, h] = FIELDS.cta.box;
      ctx.save(); ctx.globalAlpha *= clamp(S.cta * 4); rrect(ctx, x, y, w, h, 32); ctx.clip();
      ctx.fillStyle = c.ink; ctx.fillRect(x, y, w * S.cta, h);
      text(ctx, D.cta, x + w / 2, y + h / 2 + 11, F(P, 'text', 30, 650), { color: c.panel, align: 'center', alpha: S.ctaText });
      ctx.restore();
    }
    // the fill cursor: an accent frame with a soft halo and a tag, a hop ahead of every field; it shrinks into the button
    if (S.cursorOp > 0.01) {
      const [x, y, w, h] = S.cursor, pd = S.pad;
      ctx.save(); ctx.globalAlpha *= S.cursorOp;
      ctx.save(); ctx.shadowColor = rgba(c.accent, 0.16); ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      rrect(ctx, x - pd - 6, y - pd - 6, w + 2 * pd + 12, h + 2 * pd + 12, 28); ctx.strokeStyle = rgba(c.accent, 0.08); ctx.lineWidth = 12; ctx.stroke(); ctx.restore();
      rrect(ctx, x - pd, y - pd, w + 2 * pd, h + 2 * pd, 22); ctx.fillStyle = rgba(c.accent, 0.04); ctx.fill(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5; ctx.stroke();
      const lf = F(P, 'mono', info, 600, 'label'), lw = P.cursorLabel ? measure(ctx, P.cursorLabel, lf).width + 12 : 34, tw = 24 + 8 + lw, tagX = x + w + pd - 18 - tw, tagY = y - pd - 17;
      rrect(ctx, tagX, tagY, tw, 34, 8); ctx.fillStyle = c.accent; ctx.fill();
      ctx.beginPath(); ctx.arc(tagX + 16, tagY + 17, 4, 0, Math.PI * 2); ctx.fillStyle = rgba('#ffffff', 0.6 + 0.4 * Math.sin(f / 3)); ctx.fill();
      if (P.cursorLabel) text(ctx, P.cursorLabel, tagX + 30, tagY + 17 + info * 0.36, lf, { color: '#ffffff' });
      else [0, 1, 2].forEach((k) => { ctx.fillStyle = rgba('#ffffff', 0.85); rrect(ctx, tagX + 28 + k * 9, tagY + 13, 5, 8, 2); ctx.fill(); });
      ctx.restore();
    }
    ctx.restore();
  },
  // the cursor's centre and the value row's centre on screen (the card's push applied)
  track(S) {
    const map = (x, y) => [ORIGIN[0] + (x + CL - ORIGIN[0]) * S.scale, ORIGIN[1] + S.ty + (y + CT - ORIGIN[1]) * S.scale];
    const [x, y, w, h] = S.cursor, [vx, vy] = [COL + 340, FIELDS.value.box[1] + 56 + (1 - S.value) * 16];
    return [map(x + w / 2, y + h / 2), map(vx, vy)];
  },
  blur: () => false,
};

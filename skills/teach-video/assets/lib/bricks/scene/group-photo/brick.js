// group-photo — the film's cast gathers for a photo: one piece from each part of the film flies in from its side of
// the frame with a real overshoot and lands around the centre, the camera cranes down onto the group, the mark and
// the wordmark press in letter by letter while the cast steps back, a rule grows under them and the tagline follows;
// a light sweep, a stage light and drifting motes make it a launch, and the frame holds, then fades.
// Adapted from video-shotcraft demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx (card
// references/shots/outro/outro-group-photo-launch.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the demo screenshots are slots (`shots`, cropped
// to cover; without them each place draws a neutral placeholder of its shape: a bar, a card, a document, a search
// field, a stats pill), the blurred background page is a slot (`page`, the neutral sample page without one); the brand
// mark, wordmark and motto are slots (the mark drawn by mark-lockup's drawMark); colours by role (the gold dust,
// rule and stage light become the accent and white); the crane's 4° tilt is left out (canvas has no perspective; the
// crane is the scale and its slow push), and the speed blur is a few sub-samples per flying piece.
import { clamp, lerp, mix, rgba, rrect, measure, text, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes, caseOf, readTime, units } from '../../lang.js';
import { look as NEUTRAL, copy, page as samplePage } from '../../sample.js';
import { figure } from '../../prop/tile-card/brick.js';
import { drawMark } from '../mark-lockup/brick.js';

const FLY = bez(0.34, 1.4, 0.44, 1), CRANE = bez(0.3, 0, 0.2, 1), LP = bez(0.2, 0.75, 0.3, 1), BLUR = bez(0.4, 0, 0.4, 1), SWEEP = bez(0.4, 0, 0.6, 1);
const lin = (f, a, b, c = (u) => u) => c(clamp((f - a) / (b - a)));
// Where each piece settles (centre, size, scale, angle), where it comes from (offset), when (cue frame) and what it is.
export const PLACES = [
  { kind: 'nav', w: 1920, h: 61, cx: 960, cy: 84, scale: 0.62, rot: 0, dx: 0, dy: -120, r: 10, cue: 4 },
  { kind: 'card', w: 358, h: 312, cx: 280, cy: 300, scale: 0.72, rot: -5, dx: -500, dy: 0, r: 16, cue: 7 },
  { kind: 'card', w: 358, h: 288, cx: 1640, cy: 318, scale: 0.68, rot: 4, dx: 500, dy: 0, r: 16, cue: 10 },
  { kind: 'doc', w: 1104, h: 225, cx: 1460, cy: 730, scale: 0.5, rot: -3, dx: 450, dy: 260, r: 12, cue: 13 },
  { kind: 'card', w: 358, h: 312, cx: 260, cy: 800, scale: 0.6, rot: 3, dx: -400, dy: 300, r: 16, cue: 16 },
  { kind: 'doc', w: 1104, h: 225, cx: 620, cy: 930, scale: 0.48, rot: 2, dx: 0, dy: 320, r: 12, cue: 19 },
  { kind: 'search', w: 1016, h: 44, cx: 760, cy: 180, scale: 0.55, rot: -1.5, dx: 0, dy: -240, r: 10, cue: 22 },
  { kind: 'stats', w: 315, h: 56, cx: 1560, cy: 950, scale: 0.9, rot: -2, dx: 380, dy: 0, r: 10, cue: 25 },
  { kind: 'strip', w: 688, h: 54, cx: 1620, cy: 170, scale: 0.8, rot: 2.5, dx: 360, dy: -200, r: 8, cue: 28 },
];
const LIM = { wordmark: { en: { words: 2, chars: 16 }, zh: { chars: 6 } }, tagline: { en: { words: 6, chars: 34 }, zh: { chars: 12 } } };
const K = { mark: 38, letters: 42, each: 1.8, dur: 8, rule: [58, 70], ext: [58, 66, 72], tag: 68, recede: [42, 50], stage: [42, 50, 58], fade: 12, min: 145 };

const timing = (s, lang) => {
  const read = Math.round((readTime(s.wordmark, lang) + (s.tagline ? readTime(s.tagline, lang) : 0) + 0.6) * 30);
  const set = K.tag + 12, hold = Math.max(set + 30, K.letters + read);
  const end = Math.max(K.min, hold + (s.exit === 'fade' ? K.fade : 0));
  return { end, beats: Math.ceil(end / 15), fadeAt: end - (s.exit === 'fade' ? K.fade : 0) };
};

// The neutral placeholder of a place: its shape only (bars, dots, lines; no words), panel and line roles.
const placeholder = (ctx, el, w, h, C, i) => {
  const ink = mix(C.ink, C.panel, 0.35), soft = mix(C.dim, C.panel, 0.45);
  ctx.fillStyle = C.panel; ctx.fillRect(0, 0, w, h);
  if (el.kind === 'nav') { ctx.fillStyle = C.accent; rrect(ctx, 24, h / 2 - 14, 28, 28, 7); ctx.fill(); ctx.fillStyle = ink; for (let k = 0; k < 4; k++) { rrect(ctx, 520 + k * 190, h / 2 - 7, 120, 14, 7); ctx.fill(); } rrect(ctx, w - 220, h / 2 - 9, 180, 18, 9); ctx.fill(); }
  else if (el.kind === 'card') { figure(ctx, ['bars', 'line', 'rings'][i % 3], 0, 0, w, h * 0.58, { ...C, dim: C.ink }, { seed: i + 2, lit: i === 1 ? 1 : 0, ground: mix(C.panel, C.ground, 0.8) }); ctx.fillStyle = mix(C.ink, C.panel, 0.2); rrect(ctx, 22, h * 0.66, w * 0.55, 22, 11); ctx.fill(); ctx.fillStyle = soft; rrect(ctx, 22, h * 0.66 + 40, w * 0.38, 16, 8); ctx.fill(); }
  else if (el.kind === 'doc') { ctx.fillStyle = mix(C.ink, C.panel, 0.2); rrect(ctx, 40, 40, w * 0.42, 30, 15); ctx.fill(); ctx.fillStyle = soft; for (let k = 0; k < 3; k++) { rrect(ctx, 40, 100 + k * 36, w * (0.82 - k * 0.14), 16, 8); ctx.fill(); } ctx.fillStyle = C.accent; rrect(ctx, w - 160, 40, 120, 30, 15); ctx.fill(); }
  else if (el.kind === 'search') { ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(26, h / 2, 9, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = soft; rrect(ctx, 52, h / 2 - 7, w * 0.4, 14, 7); ctx.fill(); }
  else if (el.kind === 'stats') { for (let k = 0; k < 3; k++) { ctx.fillStyle = k === 1 ? C.accent : ink; rrect(ctx, 18 + k * 100, h / 2 - 10, 70, 20, 10); ctx.fill(); } }
  else { for (let k = 0; k < 5; k++) { ctx.fillStyle = k === 0 ? C.accent : soft; rrect(ctx, 14 + k * 132, h / 2 - 13, 116, 26, 13); ctx.fill(); } }
};

export default {
  id: 'group-photo', kind: 'scene',
  fits: ['lockup', 'climax'],
  surface: ['canvas'],
  beats: { min: 10, max: 14 },
  needs: { motions: [], props: ['tile-card'], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'], type: ['display', 'mono'] },
  slots: {
    shots: { type: 'list', count: [5, 9], of: { type: 'image', crop: true, optional: true } },
    page: { type: 'image', crop: true, optional: true },
    mark: { type: 'image', optional: true },
    wordmark: { type: 'text', tier: 'primary', sample: 'product', limits: LIM.wordmark },
    tagline: { type: 'text', tier: 'glance', sample: 'claim', optional: true, limits: LIM.tagline },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'],
  summary: 'One piece from each part of the film flies in and lands around the centre for a group photo; the camera cranes down, the mark and wordmark press in while the cast steps back, a rule and the tagline follow.',
  defaults: (ctx = {}) => ({ shots: Array(9).fill(null), page: null, mark: null, wordmark: copy('product', ctx.lang || 'en'), tagline: copy('claim', ctx.lang || 'en'), exit: 'fade', seed: 3 }),
  plan(s, ctx) {
    const T = timing(s, ctx.lang);
    return { beats: T.beats, reads: [{ text: s.wordmark, lang: ctx.lang }, ...(s.tagline ? [{ text: s.tagline, lang: ctx.lang }] : [])],
      cues: [{ beat: 4 / 15, kind: 'turn' }, { beat: K.letters / 15, kind: 'stamp' }, { beat: K.rule[0] / 15, kind: 'accent' }, { beat: T.fadeAt / 15, kind: 'end' }],
      motion: 'pieces fly in and settle; crane down and slow push', settled: (K.tag + 12) / 15, peakAt: K.letters / 15, pause: (T.fadeAt - K.tag - 12) / 15 };
  },
  validate(s, ctx) {
    const err = [], L = ctx.lang === 'zh' ? 'zh' : 'en';
    const n = (s.shots || []).length; if (n < 5 || n > 9) err.push('shots: 5 to 9 pieces (null draws a placeholder)');
    for (const k of ['wordmark', 'tagline']) if (s[k] && units(s[k], L) > (L === 'zh' ? LIM[k].zh.chars : LIM[k].en.words)) err.push(`${k} too long`);
    return err;
  },
  prepare(s, ctx) {
    const L = ctx.lang, C = s.colors, n = clamp((s.shots || []).length, 5, 9) | 0;
    // the pieces as sprites (placeholder or the film's crop, rounded), made once
    const pieces = PLACES.slice(0, n).map((el, i) => {
      const cv = canvasOf(el.w, el.h), x = cv.getContext('2d'), img = s.shots?.[i];
      x.save(); rrect(x, 0, 0, el.w, el.h, el.r); x.clip();
      if (img && (img.width || img.naturalWidth)) { const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.max(el.w / iw, el.h / ih); x.drawImage(img, (el.w - iw * k) / 2, (el.h - ih * k) / 2, iw * k, ih * k); }
      else placeholder(x, el, el.w, el.h, C, i);
      x.restore(); x.strokeStyle = mix(C.line, C.panel, 0.3); x.lineWidth = 2; rrect(x, 1, 1, el.w - 2, el.h - 2, el.r); x.stroke();
      return { el, cv };
    });
    // the background page at 0.75 about (960, 700): the film's or the neutral one
    const bg = canvasOf(1920, 1080), b = bg.getContext('2d');
    b.fillStyle = C.ground; b.fillRect(0, 0, 1920, 1080);
    b.save(); b.translate(960, 540); b.scale(0.75, 0.75); b.translate(-960, -700);
    if (s.page && (s.page.width || s.page.naturalWidth)) { const iw = s.page.naturalWidth || s.page.width, ih = s.page.naturalHeight || s.page.height, k = 1920 / iw; b.drawImage(s.page, 0, 0, iw * k, ih * k); }
    else { samplePage({ lang: L, colors: C })(b); b.translate(0, 1080); samplePage({ lang: L, colors: C })(b); }
    b.restore();
    const font = fontFor(NEUTRAL, 'display', L, 118, 700, 'display'), g = bg.getContext('2d');
    const glyphs = graphemes(s.wordmark), ws = glyphs.map((ch) => measure(g, ch, font).width);
    const markW = 154 + 36, wordW = ws.reduce((a, c) => a + c, 0), tag = s.tagline ? caseOf(s.tagline, NEUTRAL, 'label', L) : null;
    const dust = Array.from({ length: 20 }, (_, i) => ({ x: (i * 439 + 137) % 1920, y0: (i * 613 + 271) % 1080, rise: 0.3 + (i % 5) * 0.11, amp: 9 + (i % 4) * 5, freq: 0.022 + (i % 3) * 0.008, ph: (i * 0.83) % (Math.PI * 2), size: 2.4 + (i % 3) * 0.9, a: 0.35 + ((i * 7) % 5) * 0.09 }));
    const bokeh = Array.from({ length: 6 }, (_, i) => ({ x: (i * 701 + 260) % 1920, y0: (i * 389 + 640) % 1080, rise: 0.55 + (i % 3) * 0.2, size: 14 + (i % 3) * 7, a: 0.1 + (i % 2) * 0.06 }));
    return { pieces, bg, font, glyphs, ws, markW, wordW, tag, tagFont: fontFor(NEUTRAL, 'mono', L, 32, 500, 'label'), dust, bokeh, T: timing(s, L) };
  },
  // a piece's pose at frame f: offset, angle, scale, opacity, how far it still is from the ground (air), the landing press
  pose(el, f) {
    const t = lin(f, el.cue, el.cue + 12, FLY), op = lin(f, el.cue, el.cue + 3);
    const land = f < el.cue + 9 ? 0 : f < el.cue + 12 ? (f - el.cue - 9) / 3 : f < el.cue + 16 ? 1 - (f - el.cue - 12) / 4 : 0;
    return { x: el.dx * (1 - t), y: el.dy * (1 - t), rot: el.rot * (2 - t), scale: el.scale * (1.12 - 0.12 * t) * (1 - 0.015 * land), op, air: Math.max(0, 1 - t), land };
  },
  cam(f, end) { const crane = lin(f, 0, 40, CRANE), push = ramp(f, 36, end - 36, 'smooth'); return 1.06 - 0.06 * crane + 0.035 * push; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, f = u * 15, end = D.T.end, cam = this.cam(f, end), recede = lin(f, K.recede[0], K.recede[1]);
    const fade = s.exit === 'fade' ? 1 - ramp(f, D.T.fadeAt, K.fade - 1, 'exit') : 1;
    ctx.save();
    ctx.save(); ctx.translate(960, 486); ctx.scale(cam, cam); ctx.translate(-960, -486);
    // the page behind, going out of focus; a warm scrim of the ground over it
    const bl = 14 * lin(f, 0, 24, BLUR);
    ctx.fillStyle = C.ground; ctx.fillRect(-200, -200, 2320, 1480);
    if (bl > 0.05) ctx.filter = `blur(${bl.toFixed(2)}px)`;
    ctx.drawImage(D.bg, 0, 0); ctx.filter = 'none';
    const sg = ctx.createRadialGradient(960, 518, 0, 960, 518, 1200);
    sg.addColorStop(0, rgba(C.ground, 0.82)); sg.addColorStop(0.6, rgba(C.ground, 0.55)); sg.addColorStop(1, rgba(C.ground, 0.35));
    ctx.fillStyle = sg; ctx.fillRect(-200, -200, 2320, 1480);
    // the cast: in cue order, later on top; a few sub-samples along the way while fast
    for (const { el, cv } of D.pieces) {
      if (f < el.cue) continue;
      const P = this.pose(el, f), Q = this.pose(el, f - 0.5), sp = Math.hypot(P.x - Q.x, P.y - Q.y) * 2, n = sp > 4 ? Math.min(5, Math.ceil(sp / 12)) : 1;
      for (let k = 0; k < n; k++) {
        const S = n === 1 ? P : this.pose(el, f - (0.5 * k) / (n - 1));
        ctx.save(); ctx.globalAlpha = (S.op * (1 - 0.12 * recede)) / n * (n > 1 ? 1.6 : 1);
        if (recede > 0) ctx.filter = `saturate(${(1 - 0.08 * recede).toFixed(3)})`;
        ctx.translate(el.cx + S.x, el.cy + S.y); ctx.rotate((S.rot * Math.PI) / 180); ctx.scale(S.scale, S.scale);
        if (k === 0) { const a = S.air; ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.3), S.land > 0.01 ? 0.16 + 0.06 * S.land : 0.16 + 0.1 * a); ctx.shadowBlur = S.land > 0.01 ? 24 - 12 * S.land : 24 + 46 * a; ctx.shadowOffsetY = S.land > 0.01 ? 10 - 5 * S.land : 10 + 26 * a; }
        ctx.drawImage(cv, -el.w / 2, -el.h / 2);
        ctx.restore();
      }
    }
    ctx.restore();
    // motes rising in front, and six soft out-of-focus spots
    const gold = mix(C.accent, '#ffffff', 0.55);
    for (const d of D.dust) {
      const y = (((d.y0 - f * d.rise) % 1080) + 1080) % 1080, x = d.x + Math.sin(f * d.freq + d.ph) * d.amp, tw = 0.7 + 0.3 * Math.sin(f * 0.21 + d.ph * 3);
      ctx.save(); ctx.shadowColor = rgba(gold, 0.6); ctx.shadowBlur = d.size * 2.5; ctx.beginPath(); ctx.arc(x, y, d.size / 2, 0, Math.PI * 2); ctx.fillStyle = rgba(gold, d.a * tw); ctx.fill(); ctx.restore();
    }
    for (const b of D.bokeh) {
      const y = (((b.y0 - f * b.rise) % 1180) + 1180) % 1180 - 50, g = ctx.createRadialGradient(b.x + b.size / 2, y + b.size / 2, 0, b.x + b.size / 2, y + b.size / 2, b.size / 2);
      g.addColorStop(0, rgba(gold, 0.9 * b.a)); g.addColorStop(0.55, rgba(gold, 0.35 * b.a)); g.addColorStop(0.72, rgba(gold, 0)); ctx.fillStyle = g; ctx.fillRect(b.x, y, b.size, b.size);
    }
    // the opening light sweep, the stage light behind the wordmark, the closing vignette
    const sx = lerp(-700, 2020, lin(f, 2, 14, SWEEP)), sa = f < 2 || f > 14 ? 0 : f < 5 ? lerp(0, 0.12, (f - 2) / 3) : f < 11 ? 0.12 : lerp(0.12, 0, (f - 11) / 3);
    if (sa > 0) { const g = ctx.createLinearGradient(sx - 300, 0, sx + 300, 0); g.addColorStop(0, rgba('#ffffff', 0)); g.addColorStop(0.5, rgba('#ffffff', sa)); g.addColorStop(1, rgba('#ffffff', 0)); ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = g; ctx.fillRect(sx - 300, 0, 600, 1080); ctx.restore(); }
    const st = f < K.stage[0] ? 0 : f < K.stage[1] ? lerp(0, 0.55, (f - K.stage[0]) / 8) : f < K.stage[2] ? lerp(0.55, 0.32, (f - K.stage[1]) / 8) : 0.32;
    if (st > 0) { ctx.save(); ctx.translate(960, 470); ctx.scale(700, 360); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba('#ffffff', 0.95 * st)); g.addColorStop(0.55, rgba('#ffffff', 0.35 * st)); g.addColorStop(0.75, rgba('#ffffff', 0)); ctx.fillStyle = g; ctx.fillRect(-1.4, -1.6, 2.8, 3.2); ctx.restore(); }
    const vg = lin(f, 42, 54) * 0.1;
    if (vg > 0) { ctx.save(); ctx.translate(960, 540); ctx.scale(1400, 900); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0.55, rgba(mix(C.ink, C.accent, 0.15), 0)); g.addColorStop(1, rgba(mix(C.ink, C.accent, 0.15), 0.7 * vg)); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
    // the sign-off: the mark first, then the letters pressed in (lift, scale and focus), a breath of tracking
    const breath = lerp(-0.01, 0.005, lin(f, 62, 66, CRANE)) * 118, total = D.markW + D.wordW + breath * D.glyphs.length;
    let x = 960 - total / 2;
    const cy = 489, press = (t) => ({ a: t, dy: (1 - t) * 28, k: 1.35 - 0.35 * t, blur: (1 - t) * 8 });
    const tm = lin(f, K.mark, K.mark + 8, LP), pm = press(tm);
    if (tm > 0) { ctx.save(); if (pm.blur > 0.05) ctx.filter = `blur(${pm.blur.toFixed(2)}px)`; ctx.translate(x + 77, cy + pm.dy); ctx.scale(pm.k, pm.k); drawMark(ctx, 0, 0, 154, s, { alpha: pm.a }); ctx.restore(); }
    x += D.markW;
    D.glyphs.forEach((ch, i) => {
      const d = Math.round(K.letters + i * K.each), t = lin(f, d, d + K.dur, LP), p = press(t), w = D.ws[i];
      if (t > 0) {
        ctx.save(); if (p.blur > 0.05) ctx.filter = `blur(${p.blur.toFixed(2)}px)`;
        ctx.translate(x + w / 2, cy + p.dy); ctx.scale(p.k, p.k);
        ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.3), 0.14 * t); ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
        text(ctx, ch, -w / 2, D.font.size * 0.36, D.font, { color: C.ink, alpha: p.a });
        ctx.restore();
      }
      x += w + breath;
    });
    const rule = lin(f, K.rule[0], K.rule[1], CRANE), ry = 593;
    if (rule > 0) { ctx.fillStyle = C.accent; rrect(ctx, 960 - 130 * rule, ry, 260 * rule, 6, 3); ctx.fill(); }
    const ext = lin(f, K.ext[0], K.ext[1], CRANE), ef = 1 - lin(f, K.ext[1], K.ext[2]);
    if (ext > 0 && ef > 0) { ctx.save(); ctx.globalAlpha = ef; ctx.fillStyle = C.accent; ctx.fillRect(960 - 130 - 190 * ext, ry + 2.5, 190 * ext, 1); ctx.fillRect(960 + 130, ry + 2.5, 190 * ext, 1); ctx.restore(); }
    if (D.tag) { const a = ramp(f, K.tag, 12, 'out'); if (a > 0) text(ctx, D.tag.text, 960, 629 + 26 + (1 - a) * 6, { ...D.tagFont, spacing: 0.16 * 32 * (c.lang === 'zh' ? 0.4 : 1) }, { color: C.dim, align: 'center', alpha: a }); }
    ctx.restore();
    // the exit: the whole frame fades to a near-black of the ink (as one layer, not piece by piece)
    if (fade < 1) { ctx.fillStyle = rgba(mix(C.ink, '#000000', 0.55), 1 - fade); ctx.fillRect(0, 0, 1920, 1080); }
  },
  // two pieces' centres on screen (compare pairs them with the upstream's cards)
  track(u, s, c, D) {
    const f = u * 15, cam = this.cam(f, D.T.end), at = (el) => { const P = this.pose(el, f); return [960 + (el.cx + P.x - 960) * cam, 486 + (el.cy + P.y - 486) * cam]; };
    return [at(PLACES[1]), at(PLACES[3])];
  },
  blur() { return false; },
};


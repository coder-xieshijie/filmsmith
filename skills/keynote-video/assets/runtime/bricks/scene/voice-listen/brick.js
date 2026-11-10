// voice-listen — a voice capture you can read twice: above, the live transcript, each word rising out of a blur on its
// syllable and cooling from the accent to ink; below, a capsule whose waveform scrolls right to left from a talk-pause-
// talk envelope. In the pause the bars fall to a dotted line and a caret blinks after the last word (the stop is shown
// in two places). On send the key presses, the waveform collapses, an arrow flies off and a tick lands; the transcript
// rises, shrinks and is wrapped in a message bubble; a sent line rises; the capsule sinks back to standby.
// Adapted from video-shotcraft demos/interaction/voice-waveform-live/VoiceWaveformLive.tsx (card
// references/shots/interaction/voice-waveform-live.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React, SVG or Remotion); colours by role (the mic, the bars, the
// fresh words and the bubble in the accent, the send key in ink); the brand name, the spoken sentence, the hint, the
// listening and sent labels replaced by slots; word timing derived from the film's phrases in either language (or
// given in frames, to sit on a voice-over); value noise from the shared hash instead of the upstream's own generator.
import { clamp, lerp, mix, rgba, rrect, text, measure, scratch } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { noise1 } from '../../../rng.js';
import { fontFor, breaks, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

const CAP = { w: 1240, h: 196, cy: 760 }, TEXT_CY = 372, N_BARS = 64, SCROLL = 1.6, MAX_H = 150, PAUSE = 23, START = 15, FS = 92, LH = 1.08;
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);
const lin = (t, a, b, c, d) => (t <= a || t >= d ? 0 : t < b ? (t - a) / (b - a) : t <= c ? 1 : (d - t) / (d - c));

// Word times (frames) for each phrase: a word comes 2 frames into its stretch, the next after the last one's length
// (English about a frame a letter, Chinese 3 frames a character); a phrase ends 12 frames after its last word and the
// next starts after a 23-frame pause. `at` (frames, one list a phrase) overrides, to sit the words on a voice-over.
export const timesOf = (phrases, lang, at = null) => {
  let t = START;
  return phrases.map((ph, k) => {
    const ws = breaks(ph, lang);
    let ts;
    if (at && at[k]) ts = at[k].slice(0, ws.length);
    else { let x = t + 2; ts = ws.map((w, i) => { const v = x; x += lang === 'zh' ? 3 : 2 + Math.round(1.1 * w.w.length); return v; }); }
    const seg = [ts[0] - 2, ts[ts.length - 1] + 12];
    t = seg[1] + PAUSE;
    return { words: ws.map((w, i) => ({ ...w, at: ts[i] })), seg };
  });
};
const timeline = (S) => {
  const L = timesOf(S.said, S.lang, S.at), submit = L[L.length - 1].seg[1] + 2;
  return { L, submit, end: submit + 46 };
};
const envelope = (t, L) => Math.max(0, ...L.map(({ seg: [a, b] }) => lin(t, a, a + 5, b - 7, b))) * (0.55 + 0.45 * noise1(t / 4.5 + 200, 7));

const micGlyph = (ctx, cx, cy, s, color) => {
  ctx.save(); ctx.translate(cx - s / 2, cy - s / 2); ctx.scale(s / 24, s / 24); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 1.9; ctx.lineCap = 'round';
  rrect(ctx, 8.5, 3, 7, 12, 3.5); ctx.fill();
  ctx.beginPath(); ctx.arc(12, 11.5, 6.5, 0, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 18); ctx.lineTo(12, 21); ctx.moveTo(9, 21); ctx.lineTo(15, 21); ctx.stroke();
  ctx.restore();
};

export default {
  id: 'voice-listen', kind: 'scene',
  fits: ['demo', 'hook'],
  surface: ['canvas'],
  beats: { min: 9, max: 14 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    said: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } } } },
    hint: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 26 }, zh: { chars: 10 } }, default: { en: 'Say what you need…', zh: '说说你要什么…' } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, default: { en: 'Listening', zh: '正在听' } },
    sent: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } }, default: { en: 'Sent', zh: '已发送' } },
  },
  defaults: () => ({
    said: { en: ['Cut a teaser for Friday,', 'start on the close-up.'], zh: ['周五前剪一支预告，', '从特写开始。'] },
    hint: { en: 'Say what you need…', zh: '说说你要什么…' }, label: { en: 'Listening', zh: '正在听' }, sent: { en: 'Sent', zh: '已发送' }, at: null,
  }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, said: [].concat(pick(s.said, lang) || []) }, T = timeline(S);
    return {
      beats: T.end / 15, reads: readTime(S.said.join(' '), lang),
      cues: [{ beat: T.L[0].words[0].at / 15, kind: 'accent' }, ...(T.L[1] ? [{ beat: T.L[1].words[0].at / 15, kind: 'accent' }] : []), { beat: T.submit / 15, kind: 'turn' }, { beat: (T.submit + 14) / 15, kind: 'land' }],
      motion: [], settled: (T.submit + 28) / 15, shots: 1, peakAt: T.submit / 15, pause: T.L[1] ? { from: T.L[0].seg[1] / 15, to: T.L[1].seg[0] / 15 } : { from: (T.submit + 28) / 15, to: T.end / 15 },
    };
  },
  validate(s, ctx = {}) { const n = [].concat(pick(s.said, ctx.lang || 'en') || []).length; return n < 1 || n > 2 ? [`said: ${n} phrases, want 1–2`] : []; },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en';
    const S = { ...s, lang, said: [].concat(pick(s.said, lang) || []), hint: pick(s.hint, lang), label: pick(s.label, lang), sent: pick(s.sent, lang) };
    const T = timeline(S), g = scratch();
    let size = FS; const wide = () => Math.max(...S.said.map((p) => measure(g, p, F({ ...S }, 'display', size, 760, 'display')).width));
    while (size > 56 && wide() > 1560) size -= 2;                   // a long phrase shrinks to fit, it never wraps
    const f = F(S, 'display', size, 760, 'display');
    const lines = T.L.map((l) => { let x = 0; return l.words.map((w, i) => { const sp = i && w.sep ? measure(g, w.sep, f).width * 1.0 : 0, ww = measure(g, w.w, f).width; x += sp; const o = { ...w, x, ww }; x += ww; return o; }); });
    const blockW = Math.max(...lines.map((l) => (l.length ? l[l.length - 1].x + l[l.length - 1].ww : 0))), blockH = size * LH * lines.length;
    return { S, T, size, f, lines, blockW, blockH };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, T = D.T, c = s.colors, f = u * 15, hi = mix(c.accent, '#ffffff', 0.3), lang = S.lang;
    const inT = ramp(f, 0, 14, 'snappy'), labelT = ramp(f, 6, 12, 'out'), submitted = f >= T.submit, SU = T.submit;
    const btnPress = f < SU ? 1 : f < SU + 3 ? lerp(1, 0.82, (f - SU) / 3) : f < SU + 9 ? lerp(0.82, 1, (f - SU - 3) / 6) : 1;
    const collapse = lerp(1, 0.06, ramp(f, SU, 12, 'exit')), arrowOut = ramp(f, SU + 1, 6, 'exit'), checkIn = ramp(f, SU + 4, 8, 'overshoot');
    const toBubble = ramp(f, SU + 2, 22, 'swift'), bubbleFill = ramp(f, SU + 6, 10, 'out'), sentT = ramp(f, SU + 14, 12, 'out'), idle = ramp(f, SU + 14, 14, 'swift');
    const bars = Array.from({ length: N_BARS }, (_, i) => {
      const st = f - (N_BARS - 1 - i) * SCROLL, env = st < 0 ? 0 : envelope(st, T.L);
      const center = Math.pow(Math.sin((i / (N_BARS - 1)) * Math.PI), 0.8), jitter = 0.35 + 0.65 * noise1(st * 1.7 + i * 0.13, 11);
      return Math.max(6, env * center * jitter * MAX_H * collapse);
    });
    const nowEnv = submitted ? 0 : envelope(f, T.L), level = (bars.slice(-12).reduce((a, b) => a + b, 0) / 12 / MAX_H) * collapse;
    const secs = Math.min(f, SU) / 30, timer = `0:${String(Math.floor(Math.max(0, secs - 0.4))).padStart(2, '0')}`;
    const all = D.lines.flat(), lastAt = all.filter((w) => f >= w.at).pop()?.at ?? -99;
    const caretOn = !submitted && f > 14 && (nowEnv > 0.05 || Math.floor((f - lastAt) / 8) % 2 === 0);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    // the warm floor under the capsule, lit by the live level
    ctx.save(); ctx.globalAlpha = inT; ctx.translate(960, CAP.cy - 40 + 420 * 0.4); ctx.scale(1, (420 * 0.46) / 820);
    const fl = ctx.createRadialGradient(0, 0, 0, 0, 0, 820); fl.addColorStop(0, rgba(hi, 0.08 + 0.22 * level)); fl.addColorStop(0.7, rgba(hi, 0)); ctx.fillStyle = fl; ctx.fillRect(-820, -820, 1640, 1640); ctx.restore();
    // the transcript, rising into a bubble
    const sc = lerp(1, 0.72, toBubble), ty = lerp(TEXT_CY, 330, toBubble), bw = D.blockW, bh = D.blockH;
    ctx.save(); ctx.translate(960, ty); ctx.scale(sc, sc);
    if (bubbleFill > 0) {
      const x0 = -bw / 2 - 64, y0 = -bh / 2 - 44, w = bw + 128, h = bh + 88, r = 64, rb = lerp(64, 18, bubbleFill);
      ctx.save(); ctx.globalAlpha = bubbleFill; ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.35 * bubbleFill); ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
      ctx.beginPath(); ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r); ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, rb); ctx.arcTo(x0, y0 + h, x0, y0, r); ctx.arcTo(x0, y0, x0 + w, y0, r); ctx.closePath();
      ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    }
    D.lines.forEach((line, li) => line.forEach((w) => {
      const p = ramp(f, w.at, 8, 'snappy'); if (p <= 0) return;
      const fresh = 1 - ramp(f, w.at + 3, 6, 'linear'), col = bubbleFill > 0 ? mix(c.ink, c.onAccent || c.panel, bubbleFill) : mix(c.ink, c.accent, fresh);
      const x = -bw / 2 + w.x, base = -bh / 2 + D.size * LH * li + D.size * 0.86;
      ctx.save(); ctx.globalAlpha = p; if (p < 1) ctx.filter = `blur(${((1 - p) * 10 * sc).toFixed(2)}px)`;
      text(ctx, w.w, x, base + (1 - p) * 0.22 * D.size, D.f, { color: col });
      ctx.restore();
      if (caretOn && w.at === lastAt) { rrect(ctx, x + w.ww + D.size * 0.06, base - D.size * 0.72, 6, D.size * 0.8, 3); ctx.fillStyle = c.accent; ctx.fill(); }
    }));
    ctx.restore();
    const hintO = ramp(f, 4, 10, 'out') * (1 - ramp(f, 15, 4, 'linear'));
    if (S.hint && hintO > 0.01) { ctx.save(); ctx.globalAlpha = hintO * 0.55; ctx.filter = `blur(${((1 - hintO) * 6).toFixed(2)}px)`; text(ctx, S.hint, 960, TEXT_CY - 52 + D.size * 0.86, D.f, { color: c.dim, align: 'center' }); ctx.restore(); }
    // the sent line
    if (sentT > 0) {
      const sf = F(S, 'text', 32, 550), line = `${S.sent} · ${timer}`, tw = measure(ctx, line, sf).width, ck = 26, x0 = 960 - (tw + ck + 12) / 2, y = 492 + 20 + (1 - sentT) * 16;
      ctx.save(); ctx.globalAlpha = sentT; ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x0 + 3, y); ctx.lineTo(x0 + 10, y + 7); ctx.lineTo(x0 + 23, y - 8); ctx.stroke();
      text(ctx, line, x0 + ck + 12, y + 1, sf, { color: c.dim, baseline: 'middle' }); ctx.restore();
    }
    // the listening label
    { const lf = F(S, 'text', 32, 600), x = 960 - CAP.w / 2 + 24, y = CAP.cy - CAP.h / 2 - 62 + 19 + (1 - labelT) * 10;
      ctx.save(); ctx.globalAlpha = labelT * (1 - idle);
      ctx.beginPath(); ctx.arc(x + 7, y, 7 + 4 + 6 * nowEnv, 0, Math.PI * 2); ctx.fillStyle = rgba(c.accent, 0.18); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 7, y, 7, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
      text(ctx, S.label, x + 28, y + 1, lf, { color: c.dim, baseline: 'middle' }); ctx.restore(); }
    // the capsule
    const ccy = CAP.cy + 24 * idle, csc = lerp(1.04, 1, inT) * lerp(1, 0.94, idle), x0 = 960 - CAP.w / 2, y0 = ccy - CAP.h / 2;
    ctx.save(); ctx.globalAlpha = inT; ctx.translate(960, ccy); ctx.scale(csc, csc); ctx.translate(-960, -ccy);
    if (inT < 1) ctx.filter = `blur(${((1 - inT) * 6).toFixed(2)}px)`;
    ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.3); ctx.shadowBlur = 80; ctx.shadowOffsetY = 40 - 15;
    rrect(ctx, x0, y0, CAP.w, CAP.h, CAP.h / 2); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
    rrect(ctx, x0 + 0.5, y0 + 0.5, CAP.w - 1, CAP.h - 1, CAP.h / 2); ctx.lineWidth = 1; ctx.strokeStyle = rgba(c.ink, 0.07); ctx.stroke();
    const mx = x0 + 38 + 60, my = ccy;
    [0, 1].forEach((k) => { const r = 60 + 8 + (14 + k * 14) * nowEnv; ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fillStyle = rgba(c.accent, (0.14 - k * 0.06) * Math.min(1, nowEnv * 1.6)); ctx.fill(); });
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.6 * (1 - idle)); ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(mx, my, 60, 0, Math.PI * 2); ctx.fillStyle = mix(c.accent, mix(c.panel, c.dim, 0.35), idle); ctx.fill(); ctx.restore();
    micGlyph(ctx, mx, my, 56, c.onAccent || c.panel);
    const bx = mx + 60 + 30, bW = CAP.w - 76 - 240 - 70 - 90, gap = 5, w1 = (bW - gap * (N_BARS - 1)) / N_BARS;
    bars.forEach((h, i) => {
      const age = i / (N_BARS - 1), quiet = h <= 7 || collapse < 0.25, x = bx + i * (w1 + gap), mask = clamp((x - bx) / (bW * 0.14));
      ctx.save(); ctx.globalAlpha *= mask;
      rrect(ctx, x, my - h / 2, w1, h, w1 / 2);
      if (quiet) ctx.fillStyle = rgba(c.dim, 0.55);
      else { const g = ctx.createLinearGradient(0, my - h / 2, 0, my + h / 2); g.addColorStop(0, rgba(hi, 0.6 + 0.4 * age)); g.addColorStop(0.5, rgba(c.accent, 0.65 + 0.35 * age)); g.addColorStop(1, rgba(hi, 0.6 + 0.4 * age)); ctx.fillStyle = g; }
      if (!quiet && i === N_BARS - 1 && !submitted) { ctx.shadowColor = rgba(c.accent, 0.5 * Math.min(1, h / MAX_H)); ctx.shadowBlur = 14; }
      ctx.fill(); ctx.restore();
    });
    text(ctx, timer, bx + bW + 30 + 70, my + 1, F(S, 'mono', 32, 600), { color: c.dim, align: 'right', baseline: 'middle' });
    const kx = x0 + CAP.w - 38 - 60;
    ctx.save(); ctx.translate(kx, my); ctx.scale(btnPress, btnPress);
    ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill(); ctx.clip();
    ctx.strokeStyle = c.ground; ctx.lineWidth = 2.6 * (52 / 24); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (arrowOut < 1) { ctx.save(); ctx.globalAlpha *= 1 - arrowOut; ctx.translate(0, -30 * arrowOut); const k = 52 / 24; ctx.beginPath(); ctx.moveTo(0, 8 * k); ctx.lineTo(0, -7 * k); ctx.moveTo(-6.5 * k, -0.5 * k); ctx.lineTo(0, -7 * k); ctx.lineTo(6.5 * k, -0.5 * k); ctx.stroke(); ctx.restore(); }
    if (checkIn > 0.001) { ctx.save(); ctx.globalAlpha *= Math.min(1, checkIn * 1.4); ctx.translate(0, 16 * (1 - checkIn)); const k = (54 / 24) * (0.7 + 0.3 * checkIn); ctx.beginPath(); ctx.moveTo(-6.5 * k, 0.5 * k); ctx.lineTo(-2.3 * k, 4.7 * k); ctx.lineTo(6.5 * k, -4.2 * k); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    ctx.restore();
  },
  // the transcript block's centre (rising into the bubble) and the capsule's centre (sinking to standby)
  track(u, s, cx, D) {
    const f = u * 15, SU = D.T.submit;
    return [[960, lerp(TEXT_CY, 330, ramp(f, SU + 2, 22, 'swift'))], [960, CAP.cy + 24 * ramp(f, SU + 14, 14, 'swift')]];
  },
};

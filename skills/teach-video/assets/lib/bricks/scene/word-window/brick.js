// word-window — the title is a window: huge heavy letters cut out of the stage show a live product picture drifting
// slowly behind them; the word draws breath, then rushes out through one of its own strokes until the picture behind
// it fills the frame.
// Adapted from video-shotcraft demos/opening/text-as-mask/TextAsMask.tsx (card references/shots/opening/text-as-mask.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React, Remotion, CSS mask or SVG data URI): the word is drawn into a
// layer and the picture composited into it (source-in); the point the rush grows from is found in the word's own
// strokes (the deepest point of a distance transform, leaning to the middle) and the end scale from that stroke's
// width, so any word or script works without a hand-placed origin; the word, eyebrow and subtitle are slots, the word
// fitted to 72 % of the frame; the picture is the film's (`picture`) or a neutral live panel drawn from sample copy and
// the palette's roles (the upstream's render dashboard, its numbers, nav and brand removed); the brand mark and
// wordmark eyebrow are a text slot.
import { clamp, mix, rgba, rrect, ground, text, measure, canvasOf } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { ramp } from '../../ease.js';
import { fontFor, readTime } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';

// frames (upstream): wipe in 0–16, drift 18–96, breath 96–104, rush 104–128, land 104–132, hold to 165
const K = { in: 18, wipe: 16, d0: 18, d1: 96, b0: 96, r0: 104, r1: 128, land: 132, end: 165, dash0: 1.32 };
const drift = bez(0.3, 0, 0.7, 1);
const lum = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
const wave = (u) => 0.52 + 0.17 * Math.sin(u * 0.11) + 0.09 * Math.sin(u * 0.31 + 1.3) + 0.05 * Math.sin(u * 0.73 + 0.4) + 0.12 * Math.max(0, Math.sin(u * 0.045 - 0.6));

// The state of the move at frame f: the word's scale and shift (about the origin O), the picture's drift.
const moveAt = (f, D) => {
  const intro = ramp(f, 0, K.in, 'snappy'), breath = ramp(f, K.b0, K.r0 - K.b0, 'swift'), rush = Math.pow(ramp(f, K.r0, K.r1 - K.r0, 'linear'), 1.8);
  const s0 = (1.04 - 0.04 * intro) * (1 - 0.035 * breath), S = s0 * Math.pow(D.maxS / s0, rush);
  const d = ramp(f, K.d0, K.d1 - K.d0, drift), land = ramp(f, K.r0, K.land - K.r0, 'snappy');
  return { intro, rush, S, cdx: (960 - D.ox) * rush, cdy: (540 - D.oy) * rush, dx: (150 - 300 * d) * (1 - land), dy: -110 * (1 - land), ds: K.dash0 + (1 - K.dash0) * land };
};

// the picture behind the word, in screen space: the film's image, or a live panel (an area chart flowing left)
const paintPicture = (g, f, s, D, m) => {
  const P = D.P, F = D.F;
  g.save(); g.clearRect(0, 0, 1920, 1080); g.translate(960 + m.dx, 540 + m.dy); g.scale(m.ds, m.ds); g.translate(-960, -540);
  const img = s.picture;
  if (img && img.width) { const k = Math.max(1920 / img.width, 1080 / img.height); g.drawImage(img, (1920 - img.width * k) / 2, (1080 - img.height * k) / 2, img.width * k, img.height * k); g.restore(); return; }
  const bg = g.createRadialGradient(1150, 320, 0, 1150, 320, 1300); bg.addColorStop(0, mix(P.bg, P.accent, 0.22)); bg.addColorStop(0.7, P.bg); g.fillStyle = bg; g.fillRect(-400, -300, 2720, 1680);
  const card = (x, y, w, h) => { rrect(g, x, y, w, h, 22); g.fillStyle = P.panel; g.fill(); g.strokeStyle = rgba(P.ink, 0.1); g.lineWidth = 1; g.stroke(); };
  g.fillStyle = rgba(P.ink, 0.1); g.fillRect(230, 0, 1, 1080);
  rrect(g, 30, 36, 40, 40, 11); g.fillStyle = P.accent; g.fill(); text(g, D.product, 84, 66, F.tb, { color: P.ink });
  D.nav.forEach((n, i) => { if (i === 2) { rrect(g, 22, 126 + i * 62 - 34, 190, 50, 10); g.fillStyle = rgba(P.accent, 0.22); g.fill(); } text(g, n, 36, 126 + i * 62, F.t, { color: i === 2 ? P.ink : P.dim }); });
  text(g, D.title, 290, 92, F.h1, { color: P.ink });
  const tw = measure(g, D.title, F.h1).width, live = 0.6 + 0.4 * Math.sin(f / 5);
  g.fillStyle = rgba(P.accent, 0.9 * live); g.beginPath(); g.arc(290 + tw + 32, 74, 6, 0, Math.PI * 2); g.fill();
  text(g, D.range, 1860, 86, F.t, { color: P.dim, align: 'right' });
  D.kpis.forEach((k, i) => { const x = 290 + i * 532; card(x, 150, 508, 200); text(g, k.label, x + 30, 200, F.lab, { color: P.dim }); text(g, k.value, x + 30, 310, F.kpi, { color: P.ink }); });
  card(290, 376, 1570, 470);
  const CW = 1560, CH = 380, N = 96, flow = f * 0.55, ox = 294, oy = 446, pts = Array.from({ length: N + 1 }, (_, i) => [ox + (i / N) * CW, oy + CH - wave(i + flow) * CH * 0.92]);
  [0.25, 0.5, 0.75].forEach((q) => { g.fillStyle = rgba(P.ink, 0.08); g.fillRect(ox, oy + CH * q, CW, 1.5); });
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(ox + CW, oy + CH); g.lineTo(ox, oy + CH); g.closePath();
  const ag = g.createLinearGradient(0, oy, 0, oy + CH); ag.addColorStop(0, rgba(P.accent, 0.55)); ag.addColorStop(1, rgba(P.accent, 0)); g.fillStyle = ag; g.fill();
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  const lg = g.createLinearGradient(ox, 0, ox + CW, 0); lg.addColorStop(0, P.accent); lg.addColorStop(1, mix(P.accent, '#ffffff', 0.45)); g.strokeStyle = lg; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke();
  const [lx, ly] = pts[N]; g.fillStyle = mix(P.accent, '#ffffff', 0.45); g.beginPath(); g.arc(lx, ly, 10, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.22; g.beginPath(); g.arc(lx, ly, 22, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  card(290, 870, 1570, 170);
  D.steps.forEach((st, i) => { const x = 330 + i * 385, v = [0.92, 0.74, 0.58, 0.41][i]; text(g, st, x, 935, F.t, { color: P.dim }); text(g, `${Math.round(v * 100)}%`, x + 330, 935, F.tb, { color: P.ink, align: 'right' });
    rrect(g, x, 962, 330, 12, 6); g.fillStyle = rgba(P.ink, 0.1); g.fill(); rrect(g, x, 962, 330 * v, 12, 6); g.fillStyle = P.accent; g.fill(); });
  g.restore();
};

export default {
  id: 'word-window', kind: 'scene',
  fits: ['hook', 'lockup', 'chapter'],
  surface: ['canvas'],
  beats: { min: 11, max: 11 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    word: { type: 'text', tier: 'primary', claim: true, sample: 'product', limits: { en: { words: 1, chars: 9 }, zh: { chars: 3 } } },
    eyebrow: { type: 'text', tier: 'glance', sample: 'eyebrow', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } }, optional: true },
    subtitle: { type: 'text', tier: 'glance', sample: 'titleLong', limits: { en: { words: 8, chars: 44 }, zh: { chars: 16 } }, optional: true },
    picture: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'The title is a window: huge letters cut out of the stage show a live product picture drifting behind them; the word draws breath, then rushes out through one of its strokes until the picture fills the frame.',
  defaults: () => ({ word: null, eyebrow: null, subtitle: null, picture: null }),
  plan(s, ctx) {
    return { beats: 11, reads: [{ text: s.word, lang: ctx.lang }, { text: s.subtitle, lang: ctx.lang, tier: 'glance' }], cues: [{ beat: K.in / 15, kind: 'land' }, { beat: K.b0 / 15, kind: 'turn' }, { beat: K.r1 / 15, kind: 'hit' }],
      motion: 'drift inside the word; rush out through a stroke', settled: K.land / 15, peakAt: K.r1 / 15, pause: (K.end - K.land) / 15 };
  },
  validate(s, ctx) {
    const e = [];
    if (!s.word) e.push('word: required');
    // the subtitle is up from frame 14 until it fades on the breath (96–106); the word stays and is read at a glance
    if (readTime(s.subtitle || '', ctx.lang) * 30 > K.b0 + 5 - 14) e.push('subtitle: too long to read before the breath');
    return e;
  },
  prepare(s, ctx) {
    const lang = ctx.lang, look = s.look || NEUTRAL, c = s.colors, sc = canvasOf(16, 16).getContext('2d');
    // the word at up to 470 px, black weight, tight; fitted to 72 % of the frame
    const b = lang === 'zh' ? 440 : 470, f0 = fontFor(look, 'display', lang, b, 900, 'display'), track = lang === 'zh' ? 0 : -22 / 470;
    const w0 = measure(sc, s.word || '', { ...f0, spacing: track * b }).width, fs = Math.min(b, Math.floor((b * 1380) / Math.max(1, w0)));
    const font = { ...fontFor(look, 'display', lang, fs, 900, 'display'), spacing: track * fs }, base = Math.round(540 + fs * (lang === 'zh' ? 0.4 : 0.36));
    // the word as a mask at a quarter scale; a chamfer distance transform finds the deepest point of its strokes
    const W4 = 480, H4 = 270, m = canvasOf(W4, H4), g = m.getContext('2d', { willReadFrequently: true });
    g.scale(0.25, 0.25); text(g, s.word || '', 960, base, font, { color: '#ffffff', align: 'center' });
    const px = g.getImageData(0, 0, W4, H4).data, dist = new Float32Array(W4 * H4);
    for (let i = 0; i < W4 * H4; i++) dist[i] = px[i * 4 + 3] > 127 ? 1e6 : 0;
    const at = (x, y) => (x < 0 || y < 0 || x >= W4 || y >= H4 ? 0 : dist[y * W4 + x]);
    for (let y = 0; y < H4; y++) for (let x = 0; x < W4; x++) { const i = y * W4 + x; if (dist[i]) dist[i] = Math.min(dist[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414); }
    for (let y = H4 - 1; y >= 0; y--) for (let x = W4 - 1; x >= 0; x--) { const i = y * W4 + x; if (dist[i]) dist[i] = Math.min(dist[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414); }
    let best = -1, ox = 960, oy = 540, r = 20;
    for (let y = 0; y < H4; y++) for (let x = 0; x < W4; x++) { const d = dist[y * W4 + x]; if (!d) continue; const score = d * (1 - 0.25 * Math.hypot(x * 4 - 960, y * 4 - 540) / 1101); if (score > best) { best = score; ox = x * 4 + 2; oy = y * 4 + 2; r = d * 4; } }
    // the end scale: by 86 % of the rush the stroke must already cover the frame from the middle
    const maxS = clamp(Math.pow(1123 / Math.max(8, r), 1 / 0.86), 24, 90);
    // the picture's colours: dark and saturated on a light stage, deeper than the ground on a dark one
    const light = lum(c.ground) > 0.5, P = light
      ? { bg: mix(mix(c.ink, '#000000', 0.3), c.accent, 0.16), panel: mix(mix(c.ink, '#000000', 0.15), c.accent, 0.2), ink: '#ffffff', dim: mix(c.ground, c.accent, 0.35), accent: mix(c.accent, '#ffffff', 0.15) }
      : { bg: mix(c.ground, c.accent, 0.22), panel: mix(c.panel, c.accent, 0.28), ink: c.ink, dim: c.dim, accent: c.accent };
    const info = infoSize(lang);
    return { font, fs, base, ox, oy, r, maxS, P, light, word: canvasOf(1920, 1080), pic: canvasOf(1920, 1080), shadow: canvasOf(1920, 1080),
      F: { h1: fontFor(look, 'display', lang, 56, 720, 'display'), kpi: fontFor(look, 'display', lang, 96, 760, 'display'), lab: fontFor(look, 'mono', lang, info - 2, 650, 'label'), t: fontFor(look, 'text', lang, info, 500), tb: fontFor(look, 'text', lang, info, 650),
        eye: fontFor(look, 'mono', lang, info + 5, 700, 'label'), sub: fontFor(look, 'text', lang, lang === 'zh' ? 40 : 40, 500) },
      nav: copy('nav', lang), steps: copy('steps', lang), kpis: copy('kpis', lang), title: copy('detailTitle', lang), range: copy('label', lang), product: copy('product', lang) };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, f = u * 15, m = moveAt(f, D), wipe = ramp(f, 0, K.wipe, 'out'), out = 1 - ramp(f, K.b0, 10, 'exit');
    ground(ctx2d, s);
    const kl = ctx2d.createRadialGradient(806, 130, 0, 806, 130, 1300); kl.addColorStop(0, rgba(D.light ? '#ffffff' : c.ink, D.light ? 0.5 : 0.06)); kl.addColorStop(1, rgba(c.ground, 0));
    ctx2d.fillStyle = kl; ctx2d.fillRect(0, 0, 1920, 1080);
    paintPicture(D.pic.getContext('2d'), f, s, D, m);
    // the word's transform: scaled about the origin in its stroke, shifted so that stroke comes to the middle
    const wordT = (g) => { g.translate(m.cdx, m.cdy); g.translate(D.ox, D.oy); g.scale(m.S, m.S); g.translate(-D.ox, -D.oy); };
    const clipH = 1080 - (1 - wipe) * (1080 - D.base + D.fs * 0.72);
    // a soft tinted shadow under the window, as if cut into the stage; gone as the rush starts
    const rim = 1 - clamp(m.rush / 0.25);
    if (rim * m.intro > 0.002) {
      const sg = D.shadow.getContext('2d'); sg.clearRect(0, 0, 1920, 1080); sg.save(); wordT(sg); sg.beginPath(); sg.rect(0, 0, 1920, clipH); sg.clip();
      text(sg, s.word || '', 960, D.base + 26, D.font, { color: mix(c.ink, c.accent, 0.4), align: 'center' }); sg.restore();
      ctx2d.save(); ctx2d.globalAlpha = 0.2 * rim * m.intro; ctx2d.filter = 'blur(22px)'; ctx2d.drawImage(D.shadow, 0, 0); ctx2d.restore();
    }
    // the window: the word drawn into a layer, the picture kept only inside it
    const wg = D.word.getContext('2d'); wg.save(); wg.clearRect(0, 0, 1920, 1080); wordT(wg); wg.beginPath(); wg.rect(0, 0, 1920, clipH); wg.clip();
    text(wg, s.word || '', 960, D.base, D.font, { color: '#ffffff', align: 'center' }); wg.restore();
    wg.save(); wg.globalCompositeOperation = 'source-in'; wg.drawImage(D.pic, 0, 0); wg.restore();
    ctx2d.drawImage(D.word, 0, 0);
    // the take-over: once the stroke covers the frame, the picture itself fades in over it
    const cover = clamp((m.rush - 0.86) / 0.09);
    if (cover > 0) { ctx2d.save(); ctx2d.globalAlpha = cover; ctx2d.drawImage(D.pic, 0, 0); ctx2d.restore(); }
    // the eyebrow (tracking closing in) and the subtitle (rising); both leave on the breath
    const eb = ramp(f, 6, 20, 'out'), sub = ramp(f, 14, 18, 'out');
    if (s.eyebrow && eb * out > 0) text(ctx2d, s.eyebrow, 960, 244, { ...D.F.eye, spacing: (0.12 + (1 - eb) * 0.3) * D.F.eye.size }, { color: c.ink, align: 'center', alpha: eb * out });
    if (s.subtitle && sub * out > 0) text(ctx2d, s.subtitle, 960, D.base + 92 + 30 + (1 - sub) * 16, D.F.sub, { color: c.dim, align: 'center', alpha: sub * out });
  },
  // 0: [the word's scale in log space × 1000, 0] (the rush); 1: the picture's centre (its drift and landing)
  track(u, s, ctx, D) { const m = moveAt(u * 15, D); return [[(Math.log(m.S) / Math.log(D.maxS)) * 1000, 0], [960 + m.dx, 540 + m.dy]]; },
  blur() { return false; },
};

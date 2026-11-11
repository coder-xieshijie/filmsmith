// list-fill — the rows of a list arrive one by one into their places on a page while the camera follows: cards rise
// from below and press the stack as each lands, a counter rolling on (stack), or rows drop from above and click into
// their slots with an accent seam (embed).
// Adapted from video-shotcraft demos/ui-entrance/list-stack-press/ListStackPress.tsx (card
// references/shots/ui-entrance/list-stack-press.md) and demos/ui-entrance/row-embed/RowEmbed.tsx (card
// references/shots/ui-entrance/row-embed.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the two shots are two `mode`s of one list
// (stack: cards rise 600 px on a 12-frame beat with ±2° tilts, every later landing presses the settled cards 6 px,
// a marker bar grows under each card's note line, one glaze crosses the stack, an odometer counter rolls one digit per
// card; embed: rows drop 120 px in perspective, tilted 16° and flattening as they come, into dashed slots, with a
// press, a contact shadow that tightens and a 2 px accent seam spreading from the centre); the page screenshots and
// paper crops are a neutral page and neutral rows painted from the film's items; the camera is the upstream's page
// camera (one continuous curve for stack, one eased key pair for embed); colours by role; grain is dropped.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez, cubicOut } from '../../../motion.js';
import { fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { figure } from '../../prop/tile-card/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const pad = (v) => String(v).padStart(2, '0');

// stack: page geometry and timing (upstream frames; five cards → 88 frames)
const ST = { x: 408, w: 1104, h: 224.5, y0: 214, pitch: 240.5, each: 12, first: 6, dur: 22, rise: 600, tilt: 2 };
const FLY_UP = bez(0.45, 0.05, 0.25, 1.12);     // passes about 2 % above its place and settles
const CY_EASE = bez(0.42, 0, 0.2, 1), Z_EASE = bez(0.3, 0, 0.18, 1), HL_EASE = bez(0.3, 0, 0.2, 1), ROLL = bez(0.25, 0.8, 0.25, 1), GLAZE = bez(0.45, 0, 0.35, 1);
// embed: rows, gaps that shrink (the rain speeds up), flight
const EM = { x: 408, w: 1104, h: 95, y0: 666, gaps: [10, 9, 8, 7, 6], first: 12, fly: 12, drop: 120, tilt: 16, persp: 900 };
const FLY_DOWN = bez(0.5, 0, 0.8, 0.75);       // starts slow and still has speed when it hits the slot
const CAM_EASE = bez(0.33, 0, 0.15, 1);

const stackCues = (n) => Array.from({ length: n }, (_, i) => ST.first + i * ST.each);
const stackFrames = (n) => ST.first + (n - 1) * ST.each + ST.dur + 12;
const embedCues = (n) => { const c = [EM.first]; for (let i = 1; i < n; i++) c.push(c[i - 1] + EM.gaps[i - 1]); return c; };
const embedFrames = (n) => embedCues(n)[n - 1] + EM.fly + 10;

// page px → screen px through the page camera (cx 960)
const toScreen = (x, y, cam) => [(x - 960) * cam.zoom + 960, (y - cam.cy) * cam.zoom + 540];

// A neutral list card (stack): a figure, an index and meta, a title, a value and its delta; the note line is drawn
// live in paint so the marker bar can sit under it.
const stackFace = (g, it, i, w, h, P) => {
  const c = P.colors, info = infoSize(P.lang);
  rrect(g, 0, 0, w, h, 12); g.fillStyle = c.panel; g.fill();
  g.save(); rrect(g, 0, 0, w, h, 12); g.clip();
  g.fillStyle = rgba('#ffffff', 0.9); g.fillRect(0, 0, w, 1.5);
  g.restore();
  rrect(g, 0.75, 0.75, w - 1.5, h - 1.5, 12); g.strokeStyle = rgba(c.ink, 0.08); g.lineWidth = 1.5; g.stroke();
  g.save(); rrect(g, 22, 22, 250, h - 44, 8); g.clip();
  figure(g, it.figure, 22, 22, 250, h - 44, c, { seed: i + 1, ground: mix(c.panel, c.ground, 0.65) });
  g.restore();
  text(g, `${pad(i + 1)} · ${it.meta}`, 304, 64, F(P, 'mono', info + 1, 600, 'label'), { color: c.dim });
  text(g, it.title, 304, 130, F(P, 'display', 50, 700, 'display'), { color: c.ink });
  if (it.value) text(g, it.value, w - 40, 112, F(P, 'display', 52, 720, 'display'), { color: c.ink, align: 'right' });
  if (it.delta) text(g, it.delta, w - 40, 160, F(P, 'text', 32, 600), { color: c.accent, align: 'right' });
};
// A neutral row (embed): a glyph square, the label, a short meter and the value.
const embedFace = (g, it, i, w, h, P) => {
  const c = P.colors;
  rrect(g, 0, 0, w, h, 8); g.fillStyle = c.panel; g.fill();
  rrect(g, 0.75, 0.75, w - 1.5, h - 1.5, 8); g.strokeStyle = rgba(c.ink, 0.07); g.lineWidth = 1.5; g.stroke();
  rrect(g, 24, (h - 56) / 2, 56, 56, 10); g.fillStyle = mix(c.panel, c.ground, 0.65); g.fill();
  text(g, pad(i + 1), 52, h / 2 + 9, F(P, 'mono', infoSize(P.lang), 600, 'label'), { color: c.dim, align: 'center' });
  text(g, it.title, 108, h / 2 + 12, F(P, 'text', 34, 560), { color: c.ink });
  const mx = 600, mw = 220, share = [0.72, 0.46, 0.88, 0.34, 0.6, 0.52][i % 6];
  rrect(g, mx, h / 2 - 5, mw, 10, 5); g.fillStyle = rgba(c.ink, 0.08); g.fill();
  rrect(g, mx, h / 2 - 5, mw * share, 10, 5); g.fillStyle = mix(c.accent, c.panel, 0.25); g.fill();
  text(g, it.meta, w - 36, h / 2 + 12, F(P, 'text', 32, 600), { color: c.dim, align: 'right' });
};
// The page under the list: furniture only (eyebrow, title, a rule, a footer); the list's places are empty.
const stackPage = (g, D, P) => {
  const c = P.colors, info = infoSize(P.lang);
  g.fillStyle = c.ground; g.fillRect(0, -400, 1920, D.pageH + 800);
  text(g, D.eyebrow, ST.x, 100, F(P, 'mono', info + 1, 600, 'label'), { color: c.dim });
  text(g, D.title, ST.x, 172, F(P, 'display', 60, 720, 'display'), { color: c.ink });
  g.fillStyle = c.line; g.fillRect(ST.x, 194, ST.w, 1.5);
  g.fillStyle = c.line; g.fillRect(ST.x, D.pageH - 60, ST.w, 1.5);
};
const embedPage = (g, D, P) => {
  const c = P.colors, info = infoSize(P.lang);
  g.fillStyle = c.ground; g.fillRect(0, -400, 1920, D.pageH + 800);
  let nx = EM.x;
  D.nav.forEach((s, i) => { const f = F(P, 'mono', info, i === 1 ? 700 : 500, 'label'); text(g, s, nx, 96, f, { color: i === 1 ? c.ink : c.dim }); nx += measure(g, s, f).width + 56; });
  g.fillStyle = c.line; g.fillRect(EM.x, 128, EM.w, 1.5);
  text(g, D.eyebrow, EM.x, 214, F(P, 'mono', info + 1, 600, 'label'), { color: c.accent });
  text(g, D.title, EM.x, 304, F(P, 'display', 80, 740, 'display'), { color: c.ink });
  text(g, D.subtitle, EM.x, 364, F(P, 'text', 34, 480), { color: c.dim });
  const kw = (EM.w - 2 * 28) / 3;
  D.kpis.forEach((k, i) => {
    const x = EM.x + i * (kw + 28), y = 410;
    rrect(g, x, y, kw, 140, 14); g.fillStyle = mix(c.panel, c.ground, 0.35); g.fill();
    text(g, k.label, x + 28, y + 50, F(P, 'text', 30, 520), { color: c.dim });
    text(g, k.value, x + 28, y + 112, F(P, 'display', 50, 720, 'display'), { color: c.ink });
  });
  g.fillStyle = c.line; g.fillRect(EM.x, 590, EM.w, 1.5);
  text(g, D.label, EM.x, 642, F(P, 'mono', info, 600, 'label'), { color: c.dim });
  g.fillStyle = c.line; g.fillRect(EM.x, D.pageH - 18, EM.w, 1.5);
};
const canvasOf = (w, h, k, paint) => {
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.scale(k, k); paint(g);
  return cv;
};

export default {
  id: 'list-fill', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 7 },
  beatsFor: (P) => { const n = P.items ? P.items.length : 5; return (P.mode === 'embed' ? embedFrames(n) : stackFrames(n)) / 15; },
  needs: { motions: [], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    items: { type: 'list', count: [3, 5], of: {
      title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
      meta: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 26 }, zh: { chars: 11 } } },
      value: { type: 'number', optional: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
      delta: { type: 'text', optional: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
      image: { type: 'image', crop: true, optional: true },
    } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 10 } } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'The rows of a list arrive one by one into their places on a page as the camera follows: risen from below with a press and a counter, or dropped from above into slots.',
  defaults: () => ({ mode: 'stack', items: null, title: null, eyebrow: null, label: null, caption: null }),
  plan(s, ctx) {
    const n = s.items ? s.items.length : 5, beats = this.beatsFor(s);
    const cues = s.mode === 'embed' ? embedCues(n).map((f) => ({ beat: (f + EM.fly) / 15, kind: 'accent' })) : stackCues(n).map((f) => ({ beat: (f + ST.dur) / 15, kind: 'accent' }));
    return { beats, reads: [], cues, peakAt: cues[cues.length - 1].beat, settled: beats - 0.3 };
  },
  validate(s, ctx) {
    const err = [], n = (s.items || []).length;
    if (s.items && (n < 3 || n > 5)) err.push(`items: ${n} (3–5)`);
    for (const it of s.items || []) if (it.title && units(it.title, ctx.lang) > (ctx.lang === 'zh' ? 8 : 3)) err.push(`item title too long: ${it.title}`);
    return err;
  },
  prepare(P) {
    const embed = P.mode === 'embed', cards = copy('cards', P.lang), kpis = copy('kpis', P.lang);
    const n = P.items ? P.items.length : 5;
    const items = (P.items || Array.from({ length: n }, (_, i) => ({ title: cards[i].title, meta: cards[i].meta, note: `${kpis[i % 3].label} ${kpis[i % 3].value}`, value: kpis[(i + 1) % 3].value, delta: kpis[(i + 1) % 3].delta })))
      .map((it, i) => ({ figure: ['bars', 'line', 'rings', 'gantt', 'wave'][i % 5], ...it }));
    const D = { embed, n, items, eyebrow: P.eyebrow || copy(embed ? 'detailEyebrow' : 'eyebrow', P.lang), title: P.title || copy(embed ? 'detailTitle' : 'title', P.lang),
      label: P.label || copy('label', P.lang), caption: P.caption || copy('caption', P.lang), subtitle: copy('subtitle', P.lang), nav: copy('nav', P.lang), kpis };
    if (embed) {
      D.cues = embedCues(n); D.frames = embedFrames(n); D.pageH = EM.y0 + n * EM.h + 32;
      D.rows = items.map((_, i) => [EM.x, EM.y0 + i * EM.h + 0.5, EM.w, EM.h - 1]);
      D.faces = items.map((it, i) => canvasOf(EM.w, EM.h - 1, 1.3, (g) => embedFace(g, it, i, EM.w, EM.h - 1, P)));
      D.camEnd = 740 + (n - 5) * EM.h;
      D.page = canvasOf(1920, D.pageH, 1.3, (g) => embedPage(g, D, P));
    } else {
      D.cues = stackCues(n); D.frames = stackFrames(n); D.pageH = ST.y0 + n * ST.pitch + 88;
      D.rows = items.map((_, i) => [ST.x, ST.y0 + i * ST.pitch, ST.w, ST.h]);
      D.faces = items.map((it, i) => canvasOf(ST.w, ST.h, 1.4, (g) => stackFace(g, it, i, ST.w, ST.h, P)));
      D.camEnd = 815 - (5 - n) * ST.pitch / 2; D.camF = D.frames - 6;
      D.page = canvasOf(1920, D.pageH, 1.4, (g) => stackPage(g, D, P));
    }
    return D;
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames;
    if (D.embed) {
      const u = CAM_EASE(clamp(f / D.frames));
      const cam = { cy: lerp(500, D.camEnd, u), zoom: lerp(1.12, 1.25, u) };
      const rows = D.cues.map((cue) => {
        const land = cue + EM.fly, air = 1 - FLY_DOWN(clamp((f - cue) / EM.fly)), q = 1 - air;
        const scale = f < land ? 1.06 - 0.065 * q : lerp(0.995, 1, EASE.out(clamp((f - land) / 4)));
        const near = clamp(1 - air / 0.5);
        return { on: f >= cue, air: f >= land ? 0 : air, appear: clamp((f - cue) / 3), scale: f < cue ? 1.06 : scale,
          slot: f >= land + 2 ? 0 : (1 - clamp((f - land) / 2)) * lerp(0.55, 1, clamp((f - cue + 6) / 10)),
          contact: f < cue ? 0 : f < land ? near * 0.5 : 0.5 * (1 - clamp((f - land) / 3)),
          seam: f < land ? 0 : cubicOut(clamp((f - land) / 5)), seamOp: f < land ? 0 : f < land + 2 ? 1 : 1 - clamp((f - land - 2) / 6) };
      });
      return { f, cam, rows };
    }
    const u = clamp(f / D.camF);
    const cam = { cy: 270 + (D.camEnd - 270) * CY_EASE(u), zoom: 1.35 + (0.86 - 1.35) * Z_EASE(u) };
    const press = (j0) => { let m = 0; for (let j = j0 + 1; j < D.n; j++) { const c = D.cues[j]; const a = clamp((f - c) / 4), b = clamp((f - c - 4) / 4); m = Math.max(m, f < c + 4 ? 6 * (0.5 - 0.5 * Math.cos(Math.PI * a)) : 6 * (0.5 + 0.5 * Math.cos(Math.PI * b))); } return m; };
    const flyY = (g, cue) => ST.rise * (1 - FLY_UP(clamp((g - cue) / ST.dur)));
    const cards = D.cues.map((cue, i) => {
      const t = FLY_UP(clamp((f - cue) / ST.dur)), settled = f >= cue + ST.dur, pr = settled ? press(i) : 0, last = i === D.n - 1;
      const hs = cue + ST.dur + (last ? 2 : 3), hl = last ? 5 : 7;
      return { on: f > cue, dy: ST.rise * (1 - t) + pr, vy: settled ? 0 : flyY(f + 0.5, cue) - flyY(f - 0.5, cue), rot: (i % 2 ? -1 : 1) * ST.tilt * (1 - t), scale: 1.06 - 0.06 * t,
        elev: settled ? 3 - pr * 0.3 : 3 + 53 * clamp(1 - t), hl: HL_EASE(clamp((f - hs) / hl)), hlOp: 1 - clamp((f - hs - hl) / (last ? 4 : 5)) };
    });
    const rollAt = (g) => D.cues.reduce((a, c) => a + ROLL(clamp((g - c - ST.dur) / 8)), 0), roll = rollAt(f);
    const g0 = D.frames - 14;
    return { f, cam, cards, roll, rollV: Math.abs(rollAt(f + 0.5) - rollAt(f - 0.5)), ant: EASE.out(clamp(f / 6)), glazeX: lerp(-500, 2300, GLAZE(clamp((f - g0) / 13))), glaze: f < g0 ? 0 : Math.min(clamp((f - g0) / 3), 1 - clamp((f - g0 - 10) / 3)) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, cam = S.cam, info = infoSize(P.lang);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save();
    ctx.translate(960, 540); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-960, -cam.cy);
    ctx.drawImage(D.page, 0, 0, 1920, D.pageH);
    if (D.embed) {
      const shadowTone = mix(c.ink, '#000000', 0.6);
      D.rows.forEach(([x, y, w, h], i) => {
        const R = S.rows[i];
        if (R.slot > 0) {   // the empty slot: a faint dashed frame that brightens as its row approaches
          ctx.save(); ctx.globalAlpha = R.slot; ctx.setLineDash([7, 6]);
          rrect(ctx, x + 0.5, y + 6, w - 1, h - 12, 8); ctx.fillStyle = rgba(c.ink, 0.02); ctx.fill(); ctx.strokeStyle = rgba(c.ink, 0.22); ctx.lineWidth = 1.5; ctx.stroke();
          ctx.restore();
        }
        if (!R.on) return;
        if (R.contact > 0.005) { ctx.save(); ctx.shadowColor = rgba(shadowTone, 0.22 * R.contact * 2); ctx.shadowBlur = 6 + 18 * R.air; ctx.shadowOffsetY = 2 + 6 * R.air; rrect(ctx, x + 10, y + 6, w - 20, h - 6, 10); ctx.fillStyle = rgba(shadowTone, 0.05 * R.contact); ctx.fill(); ctx.restore(); }
        // the row in perspective: rotateX(16°·air) about its middle at 900 px, drawn in horizontal strips
        const cx = x + w / 2, cy = y + h / 2 - EM.drop * R.air, th = (EM.tilt * R.air * Math.PI) / 180, s = R.scale, face = D.faces[i];
        ctx.save(); ctx.globalAlpha = R.appear;
        if (R.air > 0.01) { ctx.save(); ctx.shadowColor = rgba(shadowTone, 0.24 * R.air); ctx.shadowBlur = 64 * R.air; ctx.shadowOffsetY = 34 * R.air; rrect(ctx, cx - (w * s) / 2 + 10 * R.air, cy - (h * s * Math.cos(th)) / 2, w * s - 20 * R.air, h * s * Math.cos(th), 8); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore(); }
        const N = th > 0.001 ? 16 : 1, sh = h / N, kx = face.width / w, ky = face.height / h;
        for (let j = 0; j < N; j++) {
          const v0 = (j * sh - h / 2) * s, v1 = ((j + 1) * sh - h / 2) * s;
          const k0 = EM.persp / (EM.persp - v0 * Math.sin(th)), k1 = EM.persp / (EM.persp - v1 * Math.sin(th)), k = (k0 + k1) / 2;
          const y0 = cy + v0 * Math.cos(th) * k0, y1 = cy + v1 * Math.cos(th) * k1, ww = w * s * k;
          ctx.drawImage(face, 0, j * sh * ky, face.width, sh * ky + (N > 1 ? 0.6 : 0), cx - ww / 2, y0, ww, y1 - y0 + (N > 1 ? 0.6 : 0));
        }
        ctx.restore();
        if (R.seamOp > 0 && R.seam > 0) {   // the embed seam: 2 px of accent at the bottom edge, spreading from the centre
          const sw = w * R.seam, g = ctx.createLinearGradient(cx - sw / 2, 0, cx + sw / 2, 0);
          g.addColorStop(0, rgba(c.accent, 0)); g.addColorStop(0.18, c.accent); g.addColorStop(0.5, mix(c.accent, '#ffffff', 0.2)); g.addColorStop(0.82, c.accent); g.addColorStop(1, rgba(c.accent, 0));
          ctx.save(); ctx.globalAlpha = R.seamOp; ctx.shadowColor = rgba(c.accent, 0.4); ctx.shadowBlur = 7; ctx.fillStyle = g; ctx.fillRect(cx - sw / 2, y + h - 2, sw, 2); ctx.restore();
        }
      });
      ctx.restore();
      const vg = ctx.createRadialGradient(960, 540, 540, 960, 540, 1150);
      vg.addColorStop(0, rgba(mix(c.ink, '#000000', 0.5), 0)); vg.addColorStop(1, rgba(mix(c.ink, '#000000', 0.5), 0.1));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 1920, 1080);
      return;
    }
    const noteFont = F(P, 'text', 34, 520);
    D.rows.forEach(([x, y, w, h], i) => {
      const C = S.cards[i];
      if (!C.on) return;
      // a card in flight is drawn as an even smear of six taps along its path (its speed over half a frame each way)
      const L = Math.min(32, Math.abs(C.vy) * 0.5), taps = L * cam.zoom > 1.5 ? 6 : 1;
      const place = (k) => { ctx.translate(x + w / 2, y + h / 2 + C.dy + (taps > 1 ? (k / (taps - 1) - 0.5) * L : 0)); ctx.rotate((C.rot * Math.PI) / 180); ctx.scale(C.scale, C.scale); ctx.translate(-w / 2, -h / 2); };
      const tone = mix(c.ink, '#000000', 0.6), e = C.elev;
      for (let k = 0; k < taps; k++) {   // the shadows first (every tap's), so no tap's shadow lands on another's face
        ctx.save(); ctx.globalAlpha = 1 / taps; place(k);
        for (const [b, dy, a] of [[2 + e * 0.2, 1 + e * 0.1, 0.14], [10 + e * 1.1, 3 + e * 0.55, 0.16]]) { ctx.shadowColor = rgba(tone, a * Math.min(1, taps / 2)); ctx.shadowBlur = b; ctx.shadowOffsetY = dy; rrect(ctx, 2, 2, w - 4, h - 4, 12); ctx.fillStyle = c.panel; ctx.fill(); }
        ctx.restore();
      }
      for (let k = 0; k < taps; k++) {
      ctx.save(); ctx.globalAlpha = 1 / (k + 1); place(k);
      ctx.drawImage(D.faces[i], 0, 0, w, h);
      const it = D.items[i];
      if (it.note) {
        const nw = measure(ctx, it.note, noteFont).width;
        if (C.hl > 0 && C.hlOp > 0) {   // the marker under the note line: grows left to right, then fades
          ctx.save(); ctx.globalAlpha *= 0.85 * C.hlOp; rrect(ctx, 296, 160, (nw + 16) * C.hl, 44, 4); ctx.fillStyle = mix(c.accent, c.panel, 0.7); ctx.fill(); ctx.restore();
        }
        text(ctx, it.note, 304, 194, noteFont, { color: mix(c.ink, c.dim, 0.3) });
      }
      if (S.glaze > 0) {   // one glaze across the settled stack, clipped to every card's corners
        ctx.save(); rrect(ctx, 0, 0, w, h, 12); ctx.clip();
        ctx.translate(S.glazeX - x - (y - 200) * 0.25 + 180, h / 2); ctx.rotate((14 * Math.PI) / 180);
        const g = ctx.createLinearGradient(-180, 0, 180, 0), lite = mix(c.accent, '#ffffff', 0.75);
        g.addColorStop(0, rgba(lite, 0)); g.addColorStop(0.45, rgba(lite, 0.95)); g.addColorStop(0.55, rgba(lite, 0.95)); g.addColorStop(1, rgba(lite, 0));
        ctx.globalAlpha *= 0.5 * S.glaze; ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(-180, -h - 200, 360, 2 * h + 400);
        ctx.restore();
      }
      ctx.restore();
      }
    });
    ctx.restore();
    // the counter in screen space, top right: a label, an odometer that rolls one place per landed card, a rule, a caption
    ctx.save(); ctx.globalAlpha = 0.3 + 0.7 * S.ant;
    const sc = 0.96 + 0.04 * S.ant, RX = 1824, TY = 70;
    ctx.translate(RX, TY); ctx.scale(sc, sc); ctx.translate(-RX, -TY);
    text(ctx, D.label, RX, TY + 26, F(P, 'mono', info, 600, 'label'), { color: c.dim, align: 'right' });
    const df = F(P, 'display', 104, 560, 'display'), lh = 116, dw = measure(ctx, '0', df).width, top = TY + 40;
    ctx.save(); ctx.beginPath(); ctx.rect(RX - dw - 8, top, dw + 16, lh); ctx.clip();
    const base = Math.floor(S.roll), fr = S.roll - base;
    if (S.rollV > 0.02) ctx.filter = `blur(${Math.min(3, S.rollV * 12).toFixed(2)}px)`;
    for (const k of [0, 1]) text(ctx, String((base + k) % 10), RX, top + lh * 0.82 + (k - fr) * lh, df, { color: c.accent, align: 'right' });
    ctx.restore();
    ctx.fillStyle = c.line; ctx.fillRect(RX - 220, top + lh + 10, 220, 1.5);
    text(ctx, D.caption, RX, top + lh + 50, F(P, 'mono', info, 500, 'label'), { color: c.dim, align: 'right' });
    ctx.restore();
  },
  // stack: every card's centre on screen; embed: every row's centre on screen (the camera applied)
  track(S, P, D) {
    return D.rows.map(([x, y, w, h], i) => toScreen(x + w / 2, y + h / 2 + (D.embed ? -EM.drop * S.rows[i].air : S.cards[i].dy), S.cam));
  },
  // stack smears its own flying cards (a whole-frame blur would soften the page under the moving camera)
  blur(p, P, D) {
    if (!D.embed) return false;
    const f = p * D.frames;
    return D.cues.some((c) => f > c && f < c + (D.embed ? EM.fly : ST.dur));
  },
};

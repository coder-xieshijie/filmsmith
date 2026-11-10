// bento-wall — a dark bento wall waits dimmed; cell by cell on an even beat a comet runs once round the cell's edge and
// the cell's content brightens and floats up into place, until the whole wall is lit and the camera eases in.
// Adapted from video-shotcraft demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx (card
// references/shots/ui-entrance/wall-reveal-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the comet is outline-trace's (a 22 % head with a
// glow and a hot core, a thin rim left behind that anneals to 40 %); cells are neutral bento faces painted once from the
// film's items (a label, a title, a figure or the film's image), wide and narrow cells alternating 600/420/420 and
// 420/420/600 over one or two rows; the upstream's mark, wordmark and tagline are the film's eyebrow and title; the
// per-cell glow jitter is a fixed sine hash; colours by role (the comet is the accent); grain is dropped.
import { clamp, lerp, mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez, cubicOut } from '../../../motion.js';
import { fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { figure, cardItems } from '../../prop/tile-card/brick.js';
import { rrPoint, strokeSpan } from '../../motion/outline-trace/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const FRAMES = 150, FIRST = 20, GAP = 12, CH = 330, GUT = 44, U = 480, R = 14, TAIL = 0.22;
const ROW_W = U * 3 + GUT * 2, LEFT = (1920 - ROW_W) / 2;
const WIDTHS = [[1.25, 0.875, 0.875], [0.875, 0.875, 1.25]];
const RISE = bez(0.3, 1.4, 0.5, 1), PUSH = bez(0.33, 0, 0.2, 1);
const outQuad = (u) => 1 - (1 - clamp(u)) * (1 - clamp(u));
const pad = (v) => String(v).padStart(2, '0');
const cellsOf = (rows) => {
  const top = (1080 - (CH * rows + GUT * (rows - 1))) / 2 + 44;
  return WIDTHS.slice(0, rows).flatMap((row, r) => { let x = LEFT; return row.map((k) => { const c = { x, y: top + r * (CH + GUT), w: k * U }; x += k * U + GUT; return c; }); });
};

// One bento face (w × 330): the panel lit from the top, a label, a title and a figure (right of the text in a wide
// cell, under it in a narrow one), or the film's image filling the figure box.
const cellFace = (it, i, w, P) => {
  const c = P.colors, info = infoSize(P.lang), k = 1.5, cv = document.createElement('canvas');
  cv.width = Math.round(w * k); cv.height = Math.round(CH * k);
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.scale(k, k);
  const face = g.createLinearGradient(0, 0, 0, CH); face.addColorStop(0, mix(c.panel, c.ink, 0.06)); face.addColorStop(1, c.panel);
  rrect(g, 0, 0, w, CH, R); g.fillStyle = face; g.fill();
  rrect(g, 0.75, 0.75, w - 1.5, CH - 1.5, R); g.strokeStyle = rgba(c.ink, 0.1); g.lineWidth = 1.5; g.stroke();
  const wide = w > 500, box = wide ? [w * 0.5, 36, w * 0.5 - 32, CH - 72] : [28, 150, w - 56, CH - 178];
  text(g, `${pad(i + 1)} · ${it.meta}`, 32, 36 + info, F(P, 'mono', info, 600, 'label'), { color: c.dim });
  text(g, it.title, 32, 112, F(P, 'display', 44, 700, 'display'), { color: c.ink });
  if (wide) text(g, it.value, 32, CH - 44, F(P, 'display', 64, 720, 'display'), { color: c.ink });
  g.save(); rrect(g, box[0], box[1], box[2], box[3], 10); g.clip();
  if (it.image && (it.image.width || it.image.naturalWidth)) {
    const iw = it.image.width || it.image.naturalWidth, ih = it.image.height || it.image.naturalHeight, s = Math.max(box[2] / iw, box[3] / ih);
    g.drawImage(it.image, box[0] + box[2] / 2 - (iw * s) / 2, box[1] + box[3] / 2 - (ih * s) / 2, iw * s, ih * s);
  } else figure(g, it.figure, box[0], box[1], box[2], box[3], c, { seed: i + 2, ground: mix(c.panel, c.ground, 0.4) });
  g.restore();
  return cv;
};

export default {
  id: 'bento-wall', kind: 'scene',
  fits: ['demo', 'rest', 'proof'],
  surface: ['canvas'],
  beats: { min: 7, max: 11 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: ['outline-trace'], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'mono'] },
  slots: {
    cells: { type: 'list', count: [3, 6], of: {
      meta: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
      value: { type: 'number', optional: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
      image: { type: 'image', crop: true, optional: true },
      figure: { type: 'enum', of: ['bars', 'line', 'rings', 'gantt', 'grid', 'dots', 'wave', 'blocks'], optional: true },
    } },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 10 } } },
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 34 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'A dimmed bento wall lights up cell by cell: a comet runs once round each edge and the content brightens and floats up; then the camera eases in.',
  defaults: () => ({ cells: null, eyebrow: null, title: null }),
  plan(s, ctx) {
    const n = s.cells ? s.cells.length : 6;
    return { beats: FRAMES / 15, reads: [{ text: s.title || copy('titleLong', ctx.lang), lang: ctx.lang }],
      cues: Array.from({ length: n }, (_, i) => ({ beat: (FIRST + i * GAP) / 15, kind: 'accent' })), peakAt: null, settled: 121 / 15 };
  },
  validate(s, ctx) {
    const err = [], n = (s.cells || []).length;
    if (s.cells && n !== 3 && n !== 6) err.push(`cells: ${n} (3 for one row, 6 for two)`);
    if (s.title && units(s.title, ctx.lang) > (ctx.lang === 'zh' ? 14 : 6)) err.push('title too long');
    return err;
  },
  prepare(P) {
    const n = P.cells ? P.cells.length : 6, rows = n > 3 ? 2 : 1, cells = cellsOf(rows), base = cardItems(P.lang, 6);
    const items = (P.cells || base).slice(0, cells.length).map((it, i) => ({ figure: ['line', 'bars', 'rings', 'dots', 'gantt', 'wave'][i % 6], value: base[i % 6].value, ...it }));
    return { cells, items, faces: items.map((it, i) => cellFace(it, i, cells[i].w, P)), eyebrow: P.eyebrow || copy('eyebrow', P.lang), title: P.title || copy('titleLong', P.lang),
      jitter: cells.map((_, i) => Math.abs((Math.sin(i * 127.3) * 43758.5453) % 1)) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * FRAMES, n = D.cells.length, last = FIRST + (n - 1) * GAP;
    const cells = D.cells.map((_, i) => {
      const s = FIRST + i * GAP;
      return { draw: cubicOut(clamp((f - s) / 8)), ring: outQuad((f - s - 2) / 8), anneal: lerp(1, 0.4, outQuad((f - s - 12) / 14)), head: 1 - clamp((f - s - 8) / 8),
        lit: cubicOut(clamp((f - s - 6) / 8)), rise: RISE(clamp((f - s - 6) / 8)) };
    });
    return { f, cells, push: lerp(1, 1.04, PUSH(clamp((f - (last + 16)) / 25))), titleLit: lerp(0.25, 1, outQuad((f - FIRST) / 20)), allLit: outQuad((f - last - 6) / 24) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, info = infoSize(P.lang);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    for (const [x, y, rx, ry, col, a] of [[960, 108, 1100, 700, mix(c.ground, c.ink, 0.12), 1], [960, 670, 960, 430, c.accent, 0.1 * (0.3 + 0.7 * S.allLit)]]) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    ctx.save(); ctx.translate(960, 540); ctx.scale(S.push, S.push); ctx.translate(-960, -540);
    const top = D.cells[0].y;
    ctx.save(); ctx.globalAlpha = S.titleLit;
    ctx.beginPath(); ctx.arc(LEFT + 6, top - 132 + 9, 6, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
    text(ctx, D.eyebrow, LEFT + 22, top - 132 + 9 + info * 0.36, F(P, 'mono', info, 700, 'label'), { color: c.accent });
    text(ctx, D.title, LEFT, top - 132 + 28 + 50, F(P, 'display', 56, 700, 'display'), { color: c.ink });
    ctx.restore();
    D.cells.forEach(({ x, y, w }, i) => {
      const C = S.cells[i], ty = 20 * (1 - C.rise), pulse = C.lit * (1 - C.lit) * 4;
      ctx.save(); ctx.translate(x, y + ty);
      ctx.save(); ctx.globalAlpha = 0.18 + 0.82 * C.lit; ctx.drawImage(D.faces[i], 0, 0, w, CH);
      if (pulse > 0) {   // a warm light inside the cell at the middle of its lighting, clipped to the corners
        rrect(ctx, 0, 0, w, CH, R); ctx.clip();
        const g = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, CH * 1.1);
        g.addColorStop(0, rgba(c.accent, 0.16 * pulse * (0.8 + D.jitter[i] * 0.4))); g.addColorStop(1, rgba(c.accent, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, CH);
      }
      ctx.restore();
      if (C.draw > 0) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(c.accent, C.ring * C.anneal); ctx.lineWidth = 1.5; strokeSpan(ctx, [0.75, 0.75, w - 1.5, CH - 1.5], R, 0, C.draw);
        if (C.head > 0) {
          const a = C.draw - TAIL, rr = [1.5, 1.5, w - 3, CH - 3];
          ctx.save(); ctx.globalAlpha = 0.8 * C.head; ctx.filter = `blur(${(4 + D.jitter[i] * 2).toFixed(2)}px)`; ctx.strokeStyle = c.accent; ctx.lineWidth = 6; strokeSpan(ctx, rr, R, a, C.draw); ctx.restore();
          ctx.save(); ctx.globalAlpha = C.head; ctx.strokeStyle = mix(c.accent, '#ffffff', 0.6); ctx.lineWidth = 2.5; strokeSpan(ctx, rr, R, a, C.draw); ctx.restore();
        }
      }
      ctx.restore();
    });
    ctx.restore();
    const vg = ctx.createRadialGradient(960, 540, 420, 960, 540, 1150);
    vg.addColorStop(0, rgba(mix(c.ground, '#000000', 0.6), 0)); vg.addColorStop(1, rgba(mix(c.ground, '#000000', 0.6), 0.55));
    ctx.fillStyle = vg; ctx.fillRect(0, 0, 1920, 1080);
  },
  // the first and last cells' centres and the first cell's comet head (the push applied)
  track(S, P, D) {
    const map = ([x, y]) => [960 + (x - 960) * S.push, 540 + (y - 540) * S.push], n = D.cells.length - 1;
    const ctr = (i) => { const { x, y, w } = D.cells[i]; return map([x + w / 2, y + CH / 2 + 20 * (1 - S.cells[i].rise)]); };
    const { x, y, w } = D.cells[0], [hx, hy] = rrPoint(S.cells[0].draw, x + 1.5, y + 1.5 + 20 * (1 - S.cells[0].rise), w - 3, CH - 3, R);
    return [ctr(0), ctr(n), map([hx, hy])];
  },
  blur: () => false,
};

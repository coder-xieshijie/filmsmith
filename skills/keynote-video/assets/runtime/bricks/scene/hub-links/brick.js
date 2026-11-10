// hub-links — several sources joined to one hub by paths with light running along them: either the sources stay and
// keep feeding the hub (connect), or they slide down their paths and are swallowed by it (merge).
// Adapted from video-shotcraft demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx (card
// references/shots/ui-entrance/bezier-source-converge-merge.md) and demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx
// (card references/shots/ui-entrance/integration-hub-map.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the two shots are two `mode`s of one hub
// (merge: four source discs on bezier paths into a sink disc, packets, a three-stage accelerating shrink into the
// sink, a receiving pulse and ripple, the paths erasing from the source end while the group pans the sink to the
// centre, a caption darkening word by word; connect: a hub panel pulled back from 2.05× while five source tiles pop
// and five glowing tubes grow into its edges and keep carrying pulses); the paths, packets and tubes are path-flow's;
// colours by role; the mark, third-party logos, hub page and caption are the film's slots (neutral glyphs, the sample
// page and copy by default); the page flip that opens the upstream hub shot is left to device-flip (`turn: 'over'`).
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez, cubicOut, cubicInOut } from '../../../motion.js';
import { breaks, fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, page } from '../../sample.js';
import { pathGeom, drawLine, drawPacket, drawTube, drawPulse, MERGE_PATHS, HUB_PATHS } from '../../motion/path-flow/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const outBack = (u) => { const s = 1.70158; u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
const outQuad = (u) => 1 - (1 - clamp(u)) * (1 - clamp(u));

// Neutral line glyphs in a 24-unit box (a page, a card, code, a waveform, a speaker): the placeholder for each source.
export const GLYPHS = {
  page: (g) => { g.rect(3.5, 5, 17, 14); g.moveTo(3.5, 9); g.lineTo(20.5, 9); },
  card: (g) => { g.rect(6.5, 7.5, 12, 13); g.moveTo(9.5, 4.5); g.lineTo(19.5, 4.5); g.lineTo(19.5, 16.5); g.moveTo(9.3, 12); g.lineTo(15.7, 12); g.moveTo(9.3, 15.5); g.lineTo(13.3, 15.5); },
  code: (g) => { g.moveTo(8.5, 7); g.lineTo(3.8, 12); g.lineTo(8.5, 17); g.moveTo(15.5, 7); g.lineTo(20.2, 12); g.lineTo(15.5, 17); g.moveTo(13.2, 5.5); g.lineTo(10.8, 18.5); },
  wave: (g) => { for (const [x, h] of [[4, 0.5], [7.4, 5.6], [10.6, 12.4], [13.8, 7.2], [17, 3.2], [20, 0.5]]) { g.moveTo(x, 12 - h / 2); g.lineTo(x, 12 + h / 2); } },
  speaker: (g) => { g.moveTo(3.5, 9.5); g.lineTo(7, 9.5); g.lineTo(11.5, 5.5); g.lineTo(11.5, 18.5); g.lineTo(7, 14.5); g.lineTo(3.5, 14.5); g.closePath(); g.moveTo(14.5, 9.5); g.arc(14.5, 12, 3.5, -Math.PI / 2 + 0.3, Math.PI / 2 - 0.3); g.moveTo(16.8, 7); g.arc(16.8, 12, 6.5, -Math.PI / 2 + 0.5, Math.PI / 2 - 0.5); },
};
const glyph = (ctx, name, cx, cy, size, color, lw = 1.6) => {
  ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 24, size / 24);
  ctx.beginPath(); (GLYPHS[name] || GLYPHS.page)(ctx);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
};
// A source: the film's image or painter in a disc / tile, or a neutral glyph.
const sourceFace = (ctx, src, cx, cy, size, color) => {
  if (src.paint) { ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); src.paint(ctx, size, size); ctx.restore(); return; }
  if (src.image && (src.image.width || src.image.naturalWidth)) { const s = size * 0.6; ctx.drawImage(src.image, cx - s / 2, cy - s / 2, s, s); return; }
  glyph(ctx, src.glyph, cx, cy, size * 0.46, color, 1.6);
};
// A porcelain disc: the panel role lit from the top, a hairline and two soft shadows.
const disc = (ctx, cx, cy, d, c, elev = 6) => {
  if (d <= 3) return;
  ctx.save();
  ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.5), 0.16); ctx.shadowBlur = elev * 2.2; ctx.shadowOffsetY = elev * 0.6;
  const g = ctx.createLinearGradient(cx, cy - d / 2, cx, cy + d / 2);
  g.addColorStop(0, mix(c.panel, '#ffffff', 0.6)); g.addColorStop(1, mix(c.panel, c.ground, 0.4));
  ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, d / 2 - 1, 0, Math.PI * 2); ctx.strokeStyle = rgba(c.ink, 0.09); ctx.lineWidth = 2; ctx.stroke();
};
// The neutral mark in the sink when the film gives none: an accent ring round a dot (a placeholder, not a logo).
const neutralMark = (ctx, cx, cy, s, c) => {
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.38, 0, Math.PI * 2); ctx.strokeStyle = c.accent; ctx.lineWidth = s * 0.1; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.14, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill();
};

const MERGE = { frames: 168, sink: [1408, 540], node: 176, badge: 184, shift: 448, glyphs: ['page', 'card', 'code', 'wave'] };
const HUB = { frames: 110, f0: 40, panel: [550, 280, 820, 520], tiles: [[452, 262], [252, 612], [992, 178], [1512, 272], [1702, 618]], glyphs: ['page', 'code', 'card', 'wave', 'speaker'], tile: 112 };
const CAM = bez(0.55, 0, 0.18, 1);
const POP = bez(0.34, 1.5, 0.64, 1);   // passes about 8 % and settles

export default {
  id: 'hub-links', kind: 'scene',
  fits: ['demo', 'turn', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  beatsFor: (P) => (P.mode === 'connect' ? HUB.frames : MERGE.frames) / 15,
  needs: { motions: ['path-flow'], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['text'] },
  slots: {
    sources: { type: 'list', count: [3, 6], of: { image: { type: 'image', optional: true }, glyph: { type: 'enum', of: Object.keys(GLYPHS) } } },
    mark: { type: 'image', optional: true },
    hub: { type: 'brick', optional: true },
    caption: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'Several sources joined to one hub by paths with light running along them: they keep feeding it (connect) or slide in and are swallowed (merge).',
  defaults: () => ({ mode: 'merge', sources: null, mark: null, hub: null, caption: null }),
  plan(s, ctx) {
    const beats = this.beatsFor(s);
    return s.mode === 'connect'
      ? { beats, reads: [], cues: [{ beat: 0.8, kind: 'accent' }, { beat: 1.5, kind: 'land' }], peakAt: 1.5, settled: 3.7 }
      : { beats, reads: [{ text: s.caption || copy('claim', ctx.lang), lang: ctx.lang }], cues: [{ beat: 4.8, kind: 'turn' }, { beat: 8.2, kind: 'land' }], peakAt: 8.2, settled: 10 };
  },
  validate(s, ctx) {
    const err = [], n = (s.sources || []).length;
    if (s.sources && s.mode !== 'connect' && n !== 4) err.push('merge lays out four sources');
    if (s.sources && s.mode === 'connect' && n !== 5) err.push('connect lays out five sources');
    if (s.caption && units(s.caption, ctx.lang) > (ctx.lang === 'zh' ? 12 : 5)) err.push('caption too long');
    return err;
  },
  prepare(P) {
    const connect = P.mode === 'connect';
    const glyphs = connect ? HUB.glyphs : MERGE.glyphs;
    const sources = (P.sources || glyphs.map((g) => ({ glyph: g }))).map((s, i) => ({ glyph: glyphs[i % glyphs.length], ...s }));
    const geoms = (connect ? HUB_PATHS : MERGE_PATHS).map((s) => pathGeom(s));
    let hub = null;
    if (connect) {
      const [, , w, h] = HUB.panel, cv = document.createElement('canvas');
      cv.width = w * 2; cv.height = h * 2;
      const g = cv.getContext('2d', { willReadFrequently: true });
      g.scale((w * 2) / 1920, (w * 2) / 1920);
      (P.hub || page({ lang: P.lang, colors: P.colors, w: 1920, h: Math.round((1920 * h) / w), radius: 44 }))(g);
      hub = cv;
    }
    const words = breaks(P.caption || copy('claim', P.lang), P.lang);
    return { connect, sources, geoms, hub, words };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    if (D.connect) {
      const f = HUB.f0 + p * HUB.frames;
      const cam = CAM(clamp(f / 96));
      const grow = cubicOut(clamp((f - 62) / 9));
      return { f, connect: true, zoom: lerp(2.05, 1, cam), panX: lerp(130, 0, cam), panY: lerp(120, 25, cam), mapIn: clamp((f - 34) / 26),
        appear: D.sources.map(() => clamp((f - 52) / 13)), on: cubicOut(clamp((f - 69) / 10)), grow, spark: grow > 0 && grow < 1 ? 1 : 0, flow: Math.max(0, f - 71) * 4.6,
        flowOn: clamp((f - 71) / 8), breathe: f > 71 ? 0.5 + 0.5 * Math.sin((f - 71) * 0.16) : 0 };
    }
    const t = p;
    const conv = cubicInOut(clamp((t - 0.34) / 0.4));
    return { t, conv, erase: outQuad(clamp((t - 0.78) / 0.12)), cyc: t >= 0.74 ? 0 : ((clamp((t - 0.1) / 0.64) * 2) % 1),
      pk: clamp((t - 0.1) / 0.06) * (1 - clamp((t - 0.7) / 0.06)), pan: EASE.smooth(clamp((t - 0.76) / 0.17)),
      draw: D.geoms.map((_, i) => outQuad(clamp((t - 0.04 - i * 0.045) / 0.17))),
      appear: D.sources.map((_, i) => EASE.overshoot(clamp((t - 0.02 - i * 0.04) / 0.1))), appearOp: D.sources.map((_, i) => EASE.out(clamp((t - 0.02 - i * 0.04) / 0.06))),
      bp: cubicOut(clamp((t - 0.16) / 0.1)), pulse: outBack(clamp((t - 0.7) / 0.08)) * 0.12 - outQuad(clamp((t - 0.78) / 0.08)) * 0.12,
      ripple: EASE.out(clamp((t - 0.72) / 0.14)), capShow: EASE.out(clamp((t - 0.84) / 0.06)), capInn: clamp((t - 0.84) / 0.11) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    if (S.connect) {
      // the hub panel, pulled back from 2.05× (its own camera); a glow that breathes once the tubes carry
      const [x, y, w, h] = HUB.panel, cx = x + w / 2, cy = y + h / 2;
      const glow = 0.16 * S.breathe;
      ctx.save();
      ctx.translate(cx + S.panX, cy + S.panY); ctx.scale(S.zoom, S.zoom); ctx.translate(-w / 2, -h / 2);
      ctx.save(); ctx.shadowColor = rgba(c.accent, 0.25 + glow); ctx.shadowBlur = 60; rrect(ctx, 0, 0, w, h, 18); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      ctx.save(); ctx.shadowColor = rgba('#000000', 0.55); ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rrect(ctx, 0, 0, w, h, 18); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      ctx.save(); rrect(ctx, 0, 0, w, h, 18); ctx.clip(); ctx.drawImage(D.hub, 0, 0, w, h); ctx.restore();
      rrect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, 18); ctx.strokeStyle = rgba('#ffffff', 0.4); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = S.mapIn;
      D.geoms.forEach((g, i) => {
        drawTube(ctx, g, 0, g.len * S.grow, c, { spark: S.spark });
        if (S.flowOn > 0) for (let s = S.flow % 74; s < g.len + 46; s += 74) drawPulse(ctx, g, s, c, { alpha: S.flowOn * (0.84 + 0.16 * Math.sin((S.f - 71) * 0.16 + i)) });
      });
      ctx.restore();
      HUB.tiles.forEach(([tx, ty], i) => {
        const a = S.appear[i]; if (a <= 0) return;
        const pop = POP(a), s = 0.72 + 0.28 * pop, T = HUB.tile;
        ctx.save(); ctx.globalAlpha = clamp(a * 2.2); ctx.translate(tx, ty + (1 - pop) * 22); ctx.scale(s, s);
        ctx.save(); ctx.shadowColor = rgba(c.accent, 0.44 * S.on); ctx.shadowBlur = 18 + S.on * 40; rrect(ctx, -T / 2, -T / 2, T, T, 28); ctx.fillStyle = c.paper; ctx.fill(); ctx.restore();
        ctx.save(); ctx.shadowColor = rgba('#000000', 0.7); ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rrect(ctx, -T / 2, -T / 2, T, T, 28); ctx.fillStyle = c.paper; ctx.fill(); ctx.restore();
        sourceFace(ctx, D.sources[i], 0, 0, T * 1.05, c.onPaper);
        ctx.restore();
      });
      return;
    }
    // merge
    ctx.save(); ctx.translate(-S.pan * MERGE.shift, 0);
    D.geoms.forEach((g, i) => drawLine(ctx, g, S.erase * g.len, S.draw[i] * g.len, c, { alpha: S.draw[i] * (1 - clamp((S.erase - 0.85) / 0.15)) }));
    const [sx, sy] = MERGE.sink;
    D.geoms.forEach((g, i) => {
      const f0 = 384 / g.len, frac = f0 + (1 - f0) * S.conv, [px, py] = g.at(g.len * frac);
      const ph = (S.cyc + i * 0.13) % 1;
      drawPacket(ctx, g, g.len * (f0 + (1 - f0) * ph), c, { alpha: S.pk * (1 - Math.abs(ph - 0.5) * 0.6), gap: g.len * 0.0055 * (1 - f0) });
      const size = (S.conv < 0.75 ? lerp(44, 15, S.conv / 0.75) : lerp(15, 0, (S.conv - 0.75) / 0.25)) * 4, k = size / MERGE.node;
      const op = S.appearOp[i] * (S.conv > 0.92 ? clamp((1 - S.conv) / 0.08) : 1);
      if (op <= 0 || size < 1) return;
      ctx.save(); ctx.globalAlpha = op; ctx.translate(px, py); ctx.scale(S.appear[i], S.appear[i]);
      disc(ctx, 0, 0, size, c, 2 + 4 * k);
      sourceFace(ctx, D.sources[i], 0, 0, size, mix(c.ink, c.dim, i / 3));
      ctx.restore();
    });
    if (S.ripple > 0 && S.ripple < 1) { ctx.beginPath(); ctx.arc(sx, sy, (MERGE.badge / 2) * lerp(1, 2.1, S.ripple), 0, Math.PI * 2); ctx.strokeStyle = rgba(c.accent, (1 - S.ripple) * 0.55); ctx.lineWidth = 3; ctx.stroke(); }
    if (S.bp > 0) {
      const bs = lerp(0.7, 1, S.bp) * (1 + S.pulse);
      ctx.save(); ctx.globalAlpha = S.bp; ctx.translate(sx, sy); ctx.scale(bs, bs);
      disc(ctx, 0, 0, MERGE.badge, c, 8);
      if (P.mark && (P.mark.width || P.mark.naturalWidth)) ctx.drawImage(P.mark, -68, -68, 136, 136); else neutralMark(ctx, 0, 0, 136, c);
      ctx.restore();
    }
    // the caption under the sink: every unit starts as a placeholder grey and darkens in turn
    if (S.capShow > 0) {
      const f = F(P, 'text', 52, 600), n = D.words.length, ST = 0.78 / n, WIN = ST * 1.5;
      const parts = D.words.map((u, i) => (i ? u.sep : '') + u.w), ws = parts.map((s) => measure(ctx, s, f).width);
      let x = sx - ws.reduce((a, b) => a + b, 0) / 2;
      ctx.save(); ctx.globalAlpha = S.capShow; ctx.translate(0, (1 - S.capShow) * 16);
      parts.forEach((s, i) => { const q = clamp((S.capInn - i * ST) / WIN); text(ctx, s, x, sy + 144 + 52, f, { color: mix(mix(c.dim, c.ground, 0.4), c.ink, q) }); x += ws[i]; });
      ctx.restore();
    }
    ctx.restore();
  },
  // merge: the first and last sources (sliding into the sink) and the sink; connect: the hub panel centre, a tube head
  track(S, P, D) {
    if (S.connect) {
      const [x, y, w, h] = HUB.panel, g = D.geoms[0];
      return [[x + w / 2 + S.panX, y + h / 2 + S.panY], g.at(g.len * S.grow)];
    }
    const pts = [0, D.geoms.length - 1].map((i) => { const g = D.geoms[i], f0 = 384 / g.len; const [px, py] = g.at(g.len * (f0 + (1 - f0) * S.conv)); return [px - S.pan * MERGE.shift, py]; });
    return [...pts, [MERGE.sink[0] - S.pan * MERGE.shift, MERGE.sink[1]]];
  },
};

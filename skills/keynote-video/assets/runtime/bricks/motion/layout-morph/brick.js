// layout-morph — a set of tiles moves from one layout to another: each tile's centre, size and turn change on their own
// (the centre first, the size two frames later, the turn four frames later with one small overshoot), tile after tile,
// and a tile lifts off the page while it travels.
// Adapted from video-shotcraft demos/transition/mosaic-reframe/MosaicReframe.tsx (card references/shots/transition/mosaic-reframe.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand, demo copy and the eight
// illustrated photos removed (the tiles are any painters, by default six role-coloured pictures); one change of layout per
// brick (the upstream's two changes, its holds, the segmented control, the captions, the headline and the slow camera
// push are the scene gallery-reframe); the three layouts (4 × 3 grid, the 6 × 4 feature mosaic, the diagonal cascade of
// mounted prints), the move curve (0.75, 0, 0.15, 1), the turn's overshoot (0.45, 0, 0.3, 1.22), the 2- and 4-frame lags,
// both staggers (a wave from the first tile, a deal at equal steps) and the lift (3.5 % and a deeper shadow) are the
// upstream's.
import { bez, mix, rgba, rrect } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';

const MOVE = bez(0.75, 0, 0.15, 1);        // decisive change of place: slow start, fast travel, long soft landing
const TURN = bez(0.45, 0, 0.3, 1.22);      // the turn arrives late and passes once
const AREA = [96, 212, 1824, 984];         // the upstream's content area below its header
const STAGGERS = { wave: { span: 10, dur: 26, curve: 'out' }, deal: { span: 14, dur: 30, curve: 'linear' } };
const LAG_SIZE = 2, LAG_TURN = 4;
// the upstream's feature mosaic: [column, row, columns, rows] on a 6 × 4 grid, the first tile 3 × 2
const MOSAIC = [[0, 0, 3, 2], [3, 0, 1, 1], [4, 0, 1, 1], [5, 0, 1, 1], [3, 1, 2, 1], [5, 1, 1, 1], [0, 2, 1, 1], [1, 2, 2, 1], [3, 2, 1, 2], [4, 2, 2, 1], [0, 3, 3, 1], [4, 3, 2, 1]];

// the layouts: n boxes { x, y, w, h, rot, pad (a mount's border), radius } in an area [x0, y0, x1, y1]
const LAYOUTS = {
  grid: (n, [x0, y0, x1, y1], { cols = 4, gap = 24 } = {}) => {
    const rows = Math.ceil(n / cols), w = (x1 - x0 - (cols - 1) * gap) / cols, h = (y1 - y0 - (rows - 1) * gap) / rows;
    return Array.from({ length: n }, (_, i) => ({ x: x0 + (i % cols) * (w + gap), y: y0 + Math.floor(i / cols) * (h + gap), w, h, rot: 0, pad: 0, radius: 16 }));
  },
  mosaic: (n, [x0, y0, x1, y1], { gap = 16 } = {}) => {
    const uw = (x1 - x0 - 5 * gap) / 6, uh = (y1 - y0 - 3 * gap) / 4;
    return Array.from({ length: n }, (_, i) => { const [c, r, cw, rh] = MOSAIC[i % MOSAIC.length]; return { x: x0 + c * (uw + gap), y: y0 + r * (uh + gap), w: cw * uw + (cw - 1) * gap, h: rh * uh + (rh - 1) * gap, rot: 0, pad: 0, radius: 16 }; });
  },
  // portrait prints fanned along a diagonal, each turned 3° more than the last (−15° for the first of twelve)
  cascade: (n, [x0, y0, x1, y1], { w = 300, h = 372, from = [850, 214], to = [1724, 930], turn = [-15, 18] } = {}) => Array.from({ length: n }, (_, i) => {
    const s = n > 1 ? i / (n - 1) : 0, cx = from[0] + (to[0] - from[0]) * s, cy = from[1] + (to[1] - from[1]) * s;
    return { x: cx - w / 2, y: cy - h / 2, w, h, rot: turn[0] + (turn[1] - turn[0]) * s, pad: 14, radius: 6 };
  }),
};
const boxesOf = (spec, n, area) => (Array.isArray(spec) ? spec.map((b) => ({ rot: 0, pad: 0, radius: 16, ...b })) : (LAYOUTS[spec?.kind || spec] || LAYOUTS.grid)(n, area, spec?.kind ? spec : {}));

// the default tiles: six pictures in the palette's roles, painted on a 160 × 100 design and cropped to cover the tile
const PICTURES = [
  (g, c) => { const sky = g.createLinearGradient(0, 0, 0, 64); sky.addColorStop(0, mix(c.accent, '#FFFFFF', 0.55)); sky.addColorStop(1, c.accent); g.fillStyle = sky; g.fillRect(0, 0, 160, 64);
    g.fillStyle = mix(c.accent, '#FFFFFF', 0.85); g.beginPath(); g.arc(118, 56, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = mix(c.ink, c.accent, 0.25); g.fillRect(0, 60, 160, 40);
    for (let k = 0; k < 5; k++) { g.fillStyle = rgba(mix(c.accent, '#FFFFFF', 0.7), 0.75 - k * 0.12); g.fillRect(118 - (16 - k * 2.2), 63 + k * 5, 2 * (16 - k * 2.2), 1.4); } },
  (g, c) => { g.fillStyle = mix(c.panel, c.accent, 0.18); g.fillRect(0, 0, 160, 100);
    for (const [y, t] of [[58, 0.45], [72, 0.7], [86, 0.95]]) { g.fillStyle = mix(c.accent, c.ink, t * 0.5); g.beginPath(); g.moveTo(0, y + 10); g.bezierCurveTo(50, y - 18, 100, y + 22, 160, y - 4); g.lineTo(160, 100); g.lineTo(0, 100); g.fill(); } },
  (g, c) => { g.fillStyle = mix(c.accent, c.panel, 0.45); g.fillRect(0, 0, 160, 100); g.fillStyle = mix(c.ink, c.accent, 0.3);
    g.beginPath(); g.moveTo(56, 100); g.lineTo(56, 46); g.arc(80, 46, 24, Math.PI, 0); g.lineTo(104, 100); g.fill(); g.fillStyle = rgba(c.ink, 0.18); g.fillRect(0, 88, 160, 12); },
  (g, c) => { const sky = g.createLinearGradient(0, 0, 0, 100); sky.addColorStop(0, mix(c.panel, c.ground, 0.4)); sky.addColorStop(1, mix(c.panel, c.accent, 0.25)); g.fillStyle = sky; g.fillRect(0, 0, 160, 100);
    [[0.25, 40], [0.45, 56], [0.7, 72]].forEach(([t, y]) => { g.fillStyle = mix(c.panel, c.ink, t); g.beginPath(); g.moveTo(0, y + 12); g.lineTo(38, y - 10); g.lineTo(70, y + 6); g.lineTo(112, y - 16); g.lineTo(160, y + 8); g.lineTo(160, 100); g.lineTo(0, 100); g.fill(); }); },
  (g, c) => { g.fillStyle = mix(c.panel, c.ground, 0.5); g.fillRect(0, 0, 160, 100); rrect(g, 22, 30, 116, 52, 8); g.fillStyle = mix(c.accent, c.ink, 0.15); g.fill();
    g.strokeStyle = rgba(mix(c.accent, '#FFFFFF', 0.8), 0.7); g.lineWidth = 1.4; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(30, 42 + k * 10); g.bezierCurveTo(60, 38 + k * 10, 100, 46 + k * 10, 130, 42 + k * 10); g.stroke(); } },
  (g, c) => { g.fillStyle = mix(c.accent, '#FFFFFF', 0.4); g.fillRect(0, 0, 160, 46); for (let k = 0; k < 7; k++) { g.fillStyle = mix(c.accent, c.ink, 0.15 + (k % 2) * 0.25); g.fillRect(0, 46 + k * 8, 160, 8); }
    g.fillStyle = mix(c.accent, '#FFFFFF', 0.8); g.beginPath(); g.arc(40, 30, 9, 0, Math.PI * 2); g.fill(); },
];
const picture = (i, c) => (g, w, h) => {
  const s = Math.max(w / 160, h / 100);
  g.save(); g.translate((w - 160 * s) / 2, (h - 100 * s) / 2); g.scale(s, s); PICTURES[i % PICTURES.length](g, c); g.restore();
};

export default {
  id: 'layout-morph', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 2.75,
  beatsFor: (P) => { const st = STAGGERS[P.stagger] || STAGGERS.wave; return Math.round(((P.span ?? st.span) + (P.dur ?? st.dur) + LAG_TURN) / 15 * 4) / 4; },
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'accent'],
  from: 'the tiles in one layout (default the 4 × 3 grid)',
  to: 'the same tiles in another layout (default the 6 × 4 feature mosaic, the first tile 3 × 2)',
  interpolates: ['each tile\'s centre (move curve), then its size (2 frames later), then its turn (4 frames later, one overshoot)', 'the stagger across tiles (a wave from the first, or a deal at equal steps)', 'the lift while a tile travels (3.5 % larger, a deeper shadow)', 'a mount\'s border and corner radius'],
  summary: 'A set of tiles moves from one layout to another, tile after tile: each one lifts off the page, travels to its new place, takes its new size and settles into its turn.',
  theory: 'Keeping every tile visible while it moves lets the eye follow each one to its new place (object constancy; animated layout transitions, Heer & Robertson 2007); the stagger turns one change into a readable sequence, and the late size and turn make the place arrive first.',
  sceneRest: false,
  defaults: () => ({ from: 'grid', to: 'mosaic', n: 12, area: AREA, tiles: null, stagger: 'wave', span: null, dur: null, lift: 0.035 }),
  prepare(P) {
    const c = P.colors;
    const tiles = Array.from({ length: P.n }, (_, i) => (P.tiles && P.tiles[i % P.tiles.length]) || picture(i, c));
    return { tiles, A: boxesOf(P.from, P.n, P.area), B: boxesOf(P.to, P.n, P.area) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const st = STAGGERS[P.stagger] || STAGGERS.wave, span = P.span ?? st.span, dur = P.dur ?? st.dur;
    const f = Math.min(1, Math.max(0, p)) * (span + dur + LAG_TURN), n = P.n;
    const tiles = D.A.map((a, i) => {
      const b = D.B[i], s0 = n > 1 ? EASE[st.curve]((i / (n - 1))) * span : 0;
      const pos = ramp(f, s0, dur, MOVE), size = ramp(f, s0 + LAG_SIZE, dur, MOVE), turn = ramp(f, s0 + LAG_TURN, dur, TURN);
      return {
        cx: a.x + a.w / 2 + (b.x + b.w / 2 - a.x - a.w / 2) * pos, cy: a.y + a.h / 2 + (b.y + b.h / 2 - a.y - a.h / 2) * pos,
        w: a.w + (b.w - a.w) * size, h: a.h + (b.h - a.h) * size, rot: a.rot + (b.rot - a.rot) * turn,
        pad: a.pad + (b.pad - a.pad) * size, radius: a.radius + (b.radius - a.radius) * size, lift: Math.sin(Math.PI * pos), mount: Math.max(a.pad, b.pad) > 0 ? size : 0,
      };
    });
    return { p, tiles };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, shade = mix(c.ground, '#000000', 0.8);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    // travelling tiles above resting ones, then by index (a later tile lies on an earlier one)
    const order = S.tiles.map((t, i) => i).sort((a, b) => (S.tiles[a].lift > 0.001) - (S.tiles[b].lift > 0.001) || a - b);
    for (const i of order) {
      const t = S.tiles[i], k = 1 + P.lift * t.lift, e = 6 + 34 * t.lift + 8 * t.mount, s = 0.9 + 0.5 * (t.pad > 0 ? t.mount : 0);
      ctx.save();
      ctx.translate(t.cx, t.cy); ctx.rotate((t.rot * Math.PI) / 180); ctx.scale(k, k);
      const x = -t.w / 2, y = -t.h / 2;
      // two soft shadows, as the upstream's: a tight contact one and a wide ambient one pulled in by its spread
      const sp = e * 0.22;
      ctx.save(); ctx.shadowColor = rgba(shade, (0.08 + (Math.min(e, 64) / 64) * 0.22) * s); ctx.shadowBlur = e * 1.3; ctx.shadowOffsetY = e * 0.55;
      rrect(ctx, x + sp, y + sp, t.w - 2 * sp, t.h - 2 * sp, Math.max(0, t.radius - sp)); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      ctx.save(); ctx.shadowColor = rgba(shade, (0.12 * s) / (1 + e / 24)); ctx.shadowBlur = 1 + e * 0.18; ctx.shadowOffsetY = 0.5 + e * 0.06;
      rrect(ctx, x, y, t.w, t.h, t.radius); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
      rrect(ctx, x, y, t.w, t.h, t.radius); ctx.fillStyle = mix(c.panel, '#FFFFFF', 0.5 * t.mount); ctx.fill();
      // the picture inside the mount, cropped to cover
      const iw = t.w - 2 * t.pad, ih = t.h - 2 * t.pad;
      ctx.save(); rrect(ctx, x + t.pad, y + t.pad, iw, ih, Math.max(2, t.radius - t.pad * 0.7)); ctx.clip();
      ctx.translate(x + t.pad, y + t.pad); D.tiles[i](ctx, iw, ih);
      const v = ctx.createLinearGradient(0, ih - 60, 0, ih); v.addColorStop(0, rgba(shade, 0)); v.addColorStop(1, rgba(shade, 0.18)); ctx.fillStyle = v; ctx.fillRect(0, ih - 60, iw, 60);
      ctx.restore();
      rrect(ctx, x + t.pad, y + t.pad, iw, ih, Math.max(2, t.radius - t.pad * 0.7)); ctx.strokeStyle = rgba(shade, 0.12); ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
  },
  blur: () => false,
  // each tile's centre, in tile order
  track(S) { return S.tiles.map((t) => [t.cx, t.cy]); },
};

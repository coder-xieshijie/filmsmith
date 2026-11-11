// deck-deal — a physical pile of cards on a dark table, seen close as the camera circles it; a light spreads from the
// pile to the page board beside it; then the deck is dealt into the board's grid with hard-accelerating cues while the
// camera chases the deal, rises and tilts back into a runway view of the full board, and a title rises at the left.
// Adapted from video-shotcraft demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx (card
// references/shots/ui-entrance/deck-deal-flyin.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion), keeping the upstream's camera (a monotone cubic Hermite
// spline through six anchors, CSS zoom and a perspective that grows with the tilt), the pile (3 px layers, fixed
// jitter), the anticipation (the pile presses 48 px, the top card pulls back 30 px), the cues (36 + 4k − 0.0792·k(k−1)),
// the flight (an 8-frame dive with a 110 px arc and a 1.06 peak, a 4-frame overshooting settle, a press), the ghost, the
// lagging shadow and the light opening from the pile; the page captures and the projects page are the film's images
// or neutral cards (tile-card on the paper role) and a neutral page; the brushed-metal noise tile is dropped (the table
// is gradients of the ground role); the mark, tagline and count label are the film's slots; grain is dropped.
import { clamp, lerp, mix, rgba, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { bez } from '../../../motion.js';
import { el, n } from '../../dom.js';
import { breaks, fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { faceCanvas, cardItems } from '../../prop/tile-card/brick.js';
import { riseText } from '../../motion/stagger-in/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const FRAMES = 150, PAGE_H = 1746, BOARD = { x: 352, w: 1216 }, BOARD_H = PAGE_H + 2036, CARD_W = 357.328125, T = 4000;
const COLS = [408, 781.328125, 1154.65625], EXTRA_ROWS = [1795, 2188, 2581, 2974, 3367];
const PRIMARY = [[408, 247, 288], [781.328125, 247, 288], [408, 616, 312], [781.328125, 616, 312], [1154.65625, 616, 312], [408, 1009, 312], [781.328125, 1009, 312], [1154.65625, 1009, 312], [408, 1402, 312], [781.328125, 1402, 312]];
const PILE = { x: 1640, y: 250 }, PILE_CX = PILE.x + CARD_W / 2, PILE_CY = PILE.y + 156, N = 26, STEP = 3, START = 36, HOVER = 40;
const ANT = { from: 26, to: 36, down: 48, pull: 30 };
const DIVE = bez(0.3, 0, 0.2, 1), SETTLE = bez(0.3, 0, 0.25, 1.15), LIGHT = bez(0.5, 0, 0.6, 1);
const GRID = (() => {
  const extras = Array.from({ length: 16 }, (_, i) => ({ src: (i * 3 + 2) % 10, x: i === 0 ? COLS[2] : COLS[(i - 1) % 3], y: i === 0 ? 1402 : EXTRA_ROWS[Math.floor((i - 1) / 3)], h: 312 }));
  return [...PRIMARY.map(([x, y, h], i) => ({ src: i, x, y, h })), ...extras].sort((a, b) => a.y - b.y || a.x - b.x)
    .map((c, k) => ({ ...c, w: CARD_W, cue: START + 4 * k - 0.0792 * k * (k - 1), px: PILE.x + (((k * 7) % 9) - 4) * 2, py: PILE.y + (((k * 5) % 7) - 3) * 2, prot: ((k * 11) % 7) - 3, pz: (N - k) * STEP }));
})();
// the camera: a monotone cubic Hermite spline per parameter through the anchors (speed continuous at every anchor)
const KEYS = ['cx', 'cy', 'zoom', 'rotX', 'rotY', 'rotZ', 'persp', 'sx'];
const ANCHORS = [
  [0, PILE_CX - 40, PILE_CY + 60, 1.9, 48, -30, 9, 1100, 0], [30, PILE_CX + 20, PILE_CY + 40, 1.8, 42, 24, -6, 1100, 0], [62, 1080, 760, 0.8, 22, 0, 2, 1700, 0],
  [86, 980, 1720, 0.56, 38, -4, -10, 2500, 120], [110, 960, 2150, 0.5, 52, -6, -26, 3300, 300], [150, 960, 2160, 0.508, 52, -6, -26, 3300, 300],
];
const hermite = (xs, ys) => {
  const k = xs.length, d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const m = xs.map((_, i) => (i === 0 ? d[0] : i === k - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < k - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const s = 3 / Math.sqrt(h); m[i] = s * a * d[i]; m[i + 1] = s * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[k - 1]) return ys[k - 1];
    let i = 0; while (i < k - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};
const CURVES = KEYS.map((_, j) => hermite(ANCHORS.map((a) => a[0]), ANCHORS.map((a) => a[j + 1])));
const camAt = (f) => Object.fromEntries(KEYS.map((key, j) => [key, CURVES[j](f)]));
const paperColors = (c) => ({ ...c, panel: c.paper, ink: c.onPaper, dim: mix(c.onPaper, c.paper, 0.5), line: mix(c.onPaper, c.paper, 0.85), ground: mix(c.paper, c.onPaper, 0.06) });

// one card's pose at frame f (board px; z up from the board)
const cardAt = (c, i, f, ant) => {
  const dive = DIVE(clamp((f - c.cue) / 8)), settle = SETTLE(clamp((f - c.cue - 8) / 4)), inPile = f < c.cue, landed = f >= c.cue + 12;
  const arc = Math.sin(dive * Math.PI) * 110, z = inPile ? c.pz : (lerp(c.pz, HOVER, dive) + arc) * (1 - settle);
  const press = f < c.cue + 10 ? 1 : f < c.cue + 11 ? lerp(1, 0.996, f - c.cue - 10) : f < c.cue + 12 ? lerp(0.996, 1, f - c.cue - 11) : 1;
  const lag = EASE.out(clamp((f - c.cue - 8) / 7));
  if (landed) return { dx: 0, dy: 0, z: 0, rot: 0, s: 1, inPile, landed, dive: 1, settle: 1, lag };
  if (inPile) return { dx: c.px - c.x - (i === 0 ? ANT.pull * ant : 0), dy: c.py - c.y + (f < ANT.to + 2 ? ANT.down * ant : 0), z: c.pz, rot: c.prot, s: 1, inPile, landed, dive: 0, settle: 0, lag: 0 };
  return { dx: (c.px - c.x) * (1 - dive), dy: (c.py - c.y) * (1 - dive), z, rot: c.prot * (1 - dive), s: (1 + Math.sin(dive * Math.PI) * 0.06) * press, inPile, landed, dive, settle, lag };
};

export default {
  id: 'deck-deal', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['dom'],
  beats: { min: 9, max: 11 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: ['stagger-in'], props: ['tile-card'], roles: ['ground', 'paper', 'onPaper', 'ink', 'dim', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    cards: { type: 'list', count: [10, 10], optional: true, of: { image: { type: 'image', crop: true } } },
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 26 }, zh: { chars: 10 } } },
    count: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 9 } } },
    page: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } },
  },
  roles: ['ground', 'paper', 'onPaper', 'ink', 'dim', 'accent'],
  summary: 'A pile of cards on a dark table is dealt into a page board with hard-accelerating cues while the camera chases the deal into a runway view of the full board.',
  defaults: () => ({ cards: null, title: null, count: null, page: null }),
  plan(s, ctx) { return { beats: FRAMES / 15, reads: [{ text: s.title || copy('claim', ctx.lang), lang: ctx.lang }], cues: [{ beat: 26 / 15, kind: 'accent' }, { beat: 36 / 15, kind: 'turn' }, { beat: 110 / 15, kind: 'land' }], peakAt: 70 / 15, settled: 110 / 15 }; },
  validate(s, ctx) {
    const err = [];
    if (s.cards && s.cards.length !== 10) err.push('cards: 10 crops (16 more are dealt from the same ten)');
    if (s.title && units(s.title, ctx.lang) > (ctx.lang === 'zh' ? 10 : 6)) err.push('title too long');
    return err;
  },
  prepare(P) {
    const base = cardItems(P.lang, 10), pc = { ...P, colors: paperColors(P.colors) };
    const faces = Array.from({ length: 10 }, (_, i) => {
      const h = i < 2 ? 288 : 312;
      if (P.cards && P.cards[i] && P.cards[i].image) return { image: P.cards[i].image, h };
      return { face: faceCanvas({ ...base[i], foot: '', figure: ['line', 'bars', 'rings', 'gantt', 'grid', 'dots', 'wave', 'blocks', 'bars', 'line'][i] }, CARD_W, h, pc, { layout: i % 4 === 3 ? 'note' : 'cover', index: i, radius: 16 }, 1.25), h };
    });
    const title = P.title || copy('claim', P.lang), us = breaks(title, P.lang), half = Math.ceil(us.length / 2);
    const join = (a) => a.map((u, i) => (i ? u.sep : '') + u.w).join('');
    return { faces, lines: [join(us.slice(0, half)), join(us.slice(half))], count: P.count || copy('eyebrow', P.lang), page: P.page || copy('nav', P.lang)[1] };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * FRAMES, light = LIGHT(clamp((f - 34) / 30)), ant = 1 - (1 - clamp((f - ANT.from) / (ANT.to - ANT.from))) ** 2;   // quad out
    return { f, cam: camAt(f), light, hole: 4200 * light, feather: 600 + 1000 * light, fog: ramp(f, 80, 34, 'smooth'), ant, statIn: ramp(f, 90, 12, 'out'),
      landed: GRID.filter((c) => f >= c.cue + 8).length, cards: GRID.map((c, i) => cardAt(c, i, f, ant)) };
  },
  build(root, P, D) {
    const c = P.colors, info = infoSize(P.lang);
    root.style.background = c.ground;
    el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 70% 60% at 60% 20%, ${rgba(mix(c.ground, c.ink, 0.1), 0.6)} 0%, ${rgba(c.ground, 0)} 70%)` }, root);
    const shift = el('div', { position: 'absolute', inset: '0' }, root);
    const persp = el('div', { position: 'absolute', inset: '0', perspectiveOrigin: '960px 540px' }, shift);
    const world = el('div', { position: 'absolute', left: '0', top: '0', width: '1920px', height: `${BOARD_H}px`, transformStyle: 'preserve-3d' }, persp);
    const table = el('div', { position: 'absolute', left: `${-T}px`, top: `${-T}px`, width: `${1920 + 2 * T}px`, height: `${BOARD_H + 2 * T}px`,
      maskImage: `radial-gradient(ellipse 2600px 3600px at ${T + 960}px ${T + BOARD_H / 2}px, ${rgba('#000000', 1)} 40%, ${rgba('#000000', 0)} 100%)` }, world);
    table.style.webkitMaskImage = table.style.maskImage;
    // the board: a neutral page (its head, a filter row, an empty grid) on the paper role, with its own long shadow
    const board = el('div', { position: 'absolute', left: `${BOARD.x}px`, top: '0', width: `${BOARD.w}px`, height: `${BOARD_H}px`, overflow: 'hidden', borderRadius: '18px', background: c.paper,
      boxShadow: `0 0 0 1px ${rgba('#ffffff', 0.08)}, 0 60px 160px ${rgba(mix(c.ground, '#000000', 0.8), 0.7)}, 0 12px 40px ${rgba(mix(c.ground, '#000000', 0.8), 0.5)}` }, world);
    const head = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${BOARD.w}px`, height: '240px' }, board);
    head.width = BOARD.w * 1.25; head.height = 300;
    const g = head.getContext('2d'); g.scale(1.25, 1.25);
    const ink = c.onPaper, dimP = mix(c.onPaper, c.paper, 0.5);
    text(g, copy('eyebrow', P.lang), 56, 82, F(P, 'mono', info, 600, 'label'), { color: dimP });
    text(g, D.page, 56, 156, F(P, 'display', 60, 720, 'display'), { color: ink });
    copy('steps', P.lang).forEach((s, i) => { const x = 1160 - (4 - i) * 150; g.fillStyle = rgba(ink, i === 0 ? 0.1 : 0.05); g.beginPath(); g.roundRect ? g.roundRect(x, 118, 136, 48, 24) : g.rect(x, 118, 136, 48); g.fill(); text(g, s, x + 68, 151, F(P, 'text', 28, 600), { color: i === 0 ? ink : dimP, align: 'center' }); });
    g.fillStyle = rgba(ink, 0.08); g.fillRect(56, 206, BOARD.w - 112, 1.5);
    el('div', { position: 'absolute', left: `${408 - BOARD.x}px`, top: `${PAGE_H + 6}px`, width: '1104px', height: '1px', background: rgba(ink, 0.08) }, board);
    const dark = el('div', { position: 'absolute', inset: '0', background: rgba(mix(c.ground, '#000000', 0.3), 0.88) }, board);
    const cards = GRID.map((cd) => {
      const wrap = el('div', { transformStyle: 'preserve-3d' }, world);
      const fc = D.faces[cd.src];
      const mk = (extra) => { const d = el('div', { position: 'absolute', left: `${cd.x}px`, top: `${cd.y}px`, width: `${cd.w}px`, height: `${cd.h}px`, borderRadius: '16px', overflow: 'hidden', ...extra }, wrap);
        const cv = el('canvas', { position: 'absolute', inset: '0', width: '100%', height: '100%' }, d); const src = fc.face || fc.image; cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0);
        return d; };
      const ghost = mk({ filter: 'blur(7px)', display: 'none' }), body = mk({}), shade = el('div', { position: 'absolute', inset: '0', background: rgba(mix(c.ground, '#000000', 0.4), 1), opacity: '0' }, body);
      return { ghost, body, shade };
    });
    const fog = el('div', { position: 'absolute', left: `${BOARD.x - 2}px`, top: '-2px', width: `${BOARD.w + 4}px`, height: `${BOARD_H + 4}px`, borderRadius: '18px', transform: 'translateZ(1px)' }, world);
    el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 75% 75% at 58% 46%, ${rgba(mix(c.ground, '#000000', 0.7), 0)} 45%, ${rgba(mix(c.ground, '#000000', 0.7), 0.55)} 100%)` }, root);
    const hud = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root);
    hud.width = 1920; hud.height = 1080;
    return { root, shift, persp, world, table, dark, cards, fog, hud, hg: hud.getContext('2d'), blurTarget: null };
  },
  pose(Rg, S, P, D) {
    const c = P.colors, f = S.f, cam = S.cam, Z = cam.zoom, L = S.light;
    Rg.shift.style.transform = `translateX(${n(cam.sx, 2)}px)`;
    Rg.persp.style.perspective = `${n(cam.persp * Z, 2)}px`;
    Rg.world.style.zoom = n(Z, 5);
    Rg.world.style.transformOrigin = `${n(cam.cx, 2)}px ${n(cam.cy, 2)}px`;
    Rg.world.style.transform = `translate(${n(960 / Z - cam.cx, 3)}px, ${n(540 / Z - cam.cy, 3)}px) rotateY(${n(cam.rotY, 3)}deg) rotateX(${n(cam.rotX, 3)}deg) rotateZ(${n(cam.rotZ, 3)}deg)`;
    const tl = mix(c.ground, c.ink, 0.85), tx = T + PILE_CX, ty = T + PILE_CY;
    Rg.table.style.background = [
      `radial-gradient(${n(1100 + 1400 * L, 1)}px ${n(800 + 1600 * L, 1)}px at ${n(tx - 600 * L, 1)}px ${n(ty + 900 * L, 1)}px, ${rgba(tl, 0.2 - 0.08 * L)}, ${rgba(tl, 0.05)} 45%, ${rgba(tl, 0)} 70%)`,
      `linear-gradient(104deg, ${rgba(tl, 0)} ${tx - 1600}px, ${rgba(tl, 0.07)} ${tx - 500}px, ${rgba(tl, 0.11)} ${tx}px, ${rgba(tl, 0.05)} ${tx + 600}px, ${rgba(tl, 0)} ${tx + 1800}px)`,
      `linear-gradient(115deg, ${mix(c.ground, c.ink, 0.06)} 0%, ${mix(c.ground, c.ink, 0.1)} 30%, ${mix(c.ground, c.ink, 0.04)} 56%, ${mix(c.ground, c.ink, 0.08)} 80%, ${c.ground} 100%)`,
    ].join(', ');
    // the light opens from the pile over the board (a soft-edged hole in the dark layer)
    Rg.dark.style.display = L < 1 ? 'block' : 'none';
    const mask = L > 0 ? `radial-gradient(circle at ${n(PILE_CX - BOARD.x, 1)}px ${PILE_CY}px, ${rgba('#000000', 0)} ${n(S.hole, 0)}px, ${rgba('#000000', 1)} ${n(S.hole + S.feather, 0)}px)` : 'none';
    Rg.dark.style.maskImage = mask; Rg.dark.style.webkitMaskImage = mask;
    const tone = mix(c.ground, '#000000', 0.8);
    GRID.forEach((cd, i) => {
      const K = S.cards[i], R = Rg.cards[i];
      R.body.style.transform = K.landed ? 'translate3d(0px, 0px, 0px)' : `translate3d(${n(K.dx, 3)}px, ${n(K.dy, 3)}px, ${n(K.z, 3)}px) rotateZ(${n(K.rot, 3)}deg) scale(${n(K.s, 5)})`;
      R.body.style.boxShadow = K.landed ? `0 ${n(2 + 14 * (1 - K.lag), 1)}px ${n(6 + 30 * (1 - K.lag), 1)}px ${rgba(tone, 0.1 + 0.12 * (1 - K.lag))}`
        : K.inPile ? (i === N - 1 ? `0 1px 3px ${rgba(tone, 0.4)}, 0 26px 60px ${rgba(tone, 0.75)}` : `0 1px 2px ${rgba(tone, 0.35)}`)
          : `0 ${n(36 - 24 * K.settle, 1)}px ${n(70 - 50 * K.settle, 1)}px ${rgba(tone, 0.45 - 0.25 * K.settle)}`;
      const ghostOn = K.dive > 0.02 && K.dive < 0.98;
      R.ghost.style.display = ghostOn ? 'block' : 'none';
      if (ghostOn) { R.ghost.style.transform = `translate3d(${n(K.dx + (cd.px - cd.x) * 0.06, 3)}px, ${n(K.dy + (cd.py - cd.y) * 0.06, 3)}px, ${n(K.z, 3)}px) rotateZ(${n(K.rot, 3)}deg) scale(${n(K.s, 5)})`; R.ghost.style.opacity = n(0.28 * (1 - K.dive), 4); }
      const dist = Math.hypot(cd.x + cd.w / 2 - PILE_CX, cd.y + cd.h / 2 - PILE_CY), darkK = clamp((dist - S.hole) / S.feather) * 0.88 * (L < 1 ? 1 : 0);
      R.shade.style.opacity = n(K.inPile ? 0.08 * (1 - L) : K.dive > 0.6 && !K.landed ? darkK * Math.min(1, (K.dive - 0.6) / 0.4) : 0, 4);
    });
    const fg = mix(c.ground, '#000000', 0.3);
    Rg.fog.style.display = S.fog > 0 ? 'block' : 'none';
    Rg.fog.style.background = `linear-gradient(180deg, ${rgba(fg, 0.62 * S.fog)} 0%, ${rgba(fg, 0.3 * S.fog)} 35%, ${rgba(fg, 0)} 70%)`;
    // the title and the count, left low, in screen space
    const g = Rg.hg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080);
    riseText(g, D.lines[0], 120, 772, F(P, 'display', 120, 800, 'display'), { color: c.ink, lang: P.lang, f, start: 100, each: 16, gap: 4 });
    riseText(g, D.lines[1], 120, 896, F(P, 'display', 120, 300, 'display'), { color: c.dim, lang: P.lang, f, start: 106, each: 16, gap: 4 });
    if (S.statIn > 0) {
      g.save(); g.globalAlpha = S.statIn;
      g.beginPath(); g.arc(141, 628, 15, 0, Math.PI * 2); g.strokeStyle = c.accent; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(141, 628, 5, 0, Math.PI * 2); g.fillStyle = c.ink; g.fill();
      const mf = F(P, 'mono', 30, 600, 'label');
      text(g, String(S.landed).padStart(2, '0'), 174, 639, mf, { color: c.ink });
      text(g, D.count, 228, 639, mf, { color: c.dim });
      g.restore();
    }
  },
  // the first card dealt, the last, and the board's top-left corner, through the camera (on-screen box middles)
  track(S, P, D) {
    const cam = S.cam, Z = cam.zoom, d = (a) => (a * Math.PI) / 180, [ry, rx, rz] = [d(cam.rotY), d(cam.rotX), d(cam.rotZ)], dp = cam.persp * Z;
    const proj = (x, y, z) => {
      let X = Z * (x - cam.cx), Y = Z * (y - cam.cy), W = Z * z;
      [X, Y] = [X * Math.cos(rz) - Y * Math.sin(rz), X * Math.sin(rz) + Y * Math.cos(rz)];
      [Y, W] = [Y * Math.cos(rx) - W * Math.sin(rx), Y * Math.sin(rx) + W * Math.cos(rx)];
      [X, W] = [X * Math.cos(ry) + W * Math.sin(ry), -X * Math.sin(ry) + W * Math.cos(ry)];
      const k = dp / (dp - W);
      return [cam.sx + 960 + X * k, 540 + Y * k];
    };
    const box = (i) => {
      const cd = GRID[i], K = S.cards[i], a = d(K.rot), cx = cd.x + cd.w / 2 + K.dx, cy = cd.y + cd.h / 2 + K.dy;
      const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([u, v]) => { const ox = (u * cd.w * K.s) / 2, oy = (v * cd.h * K.s) / 2; return proj(cx + ox * Math.cos(a) - oy * Math.sin(a), cy + ox * Math.sin(a) + oy * Math.cos(a), K.z); });
      const xs = cs.map((q) => q[0]), ys = cs.map((q) => q[1]);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    };
    return [box(0), box(N - 1), proj(BOARD.x, 0, 0)];
  },
  blur: () => false,
};

// hero-spotlight — the house lights are down on a product page; a lamp searches it, locks on one card, the camera
// pushes in to a low side angle, the card lifts off the page and hovers while a light runs twice round its edge, a
// two-line note floats beside it, and card and note settle back into the page.
// Adapted from video-shotcraft demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx (card references/shots/opening/spotlight-hero-card.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion): the page and the card are canvases painted once
// from sample cards (or the film's `page` and `hero` images), the lights are canvases repainted on every pose (the
// multiply dark with its pool, the soft-light lamp, the screen beam with seeded dust); the camera keys, the lamp's
// stations, the lift, hover, two laps of light and reseat are the upstream's; the note's two lines are slots, right-aligned to
// end short of the card's left edge; the cards are tile-card faces; the champagne light is the accent, the tungsten lamp white warmed by it, the dark the
// ground's black; the page screenshot, brand copy and film grain removed.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';
import { cardItems, drawCard } from '../../prop/tile-card/brick.js';

// the page (as upstream's projects page): header, sections, ten cards; the hero is the fourth
const PAGE_H = 1746, CW = 357.33, RADIUS = 16;
const CARDS = [[408, 247, 288], [781.33, 247, 288], [408, 616, 312], [781.33, 616, 312], [1154.66, 616, 312], [408, 1009, 312], [781.33, 1009, 312], [1154.66, 1009, 312], [408, 1402, 312], [781.33, 1402, 312]].map(([x, y, h]) => ({ x, y, w: CW, h }));
const HERO = CARDS[3], MCX = HERO.x + HERO.w / 2, MCY = HERO.y + HERO.h / 2, SECTIONS = [93, 206, 575, 968, 1361];
// frames: lock 34, push 40–58, rise 56–66, hover, reseat 124–142, hold to 172
const LOCK = 34, PUSH0 = 40, PUSH1 = 58, RISE0 = 56, RISE1 = 66, RESEAT0 = 124, LAND = 142, END = 172;
const pushE = bez(0.35, 0, 0.2, 1), popE = bez(0.2, 1.25, 0.3, 1), reseatE = bez(0.4, 0, 0.3, 1.05), smoothE = bez(0.42, 0, 0.58, 1);
const K0 = { cx: 960, cy: 600, zoom: 0.8, rx: 0, ry: 0, rz: 0 }, K1 = { cx: MCX - 105, cy: MCY - 10, zoom: 2.6, rx: 8, ry: 34, rz: 2 }, PERSP = 1200;
const camAt = (f) => { const t = pushE(clamp((f - PUSH0) / (PUSH1 - PUSH0))); return Object.fromEntries(Object.keys(K0).map((k) => [k, K0[k] + (K1[k] - K0[k]) * t])); };
// piecewise interpolation over keys (clamped), each piece eased
const pw = (f, xs, ys, e = (t) => t) => { if (f <= xs[0]) return ys[0]; for (let i = 0; i < xs.length - 1; i++) if (f <= xs[i + 1]) return ys[i] + (ys[i + 1] - ys[i]) * e(xs[i + 1] === xs[i] ? 1 : (f - xs[i]) / (xs[i + 1] - xs[i])); return ys[ys.length - 1]; };
const rad = (d) => (d * Math.PI) / 180;
// a page point (x, y) at height z through the camera, to the screen
const project = (x, y, z, c) => {
  let X = (x - c.cx) * c.zoom, Y = (y - c.cy) * c.zoom, Z = z * c.zoom;
  [X, Y] = [X * Math.cos(rad(c.rz)) - Y * Math.sin(rad(c.rz)), X * Math.sin(rad(c.rz)) + Y * Math.cos(rad(c.rz))];
  [Y, Z] = [Y * Math.cos(rad(c.rx)) - Z * Math.sin(rad(c.rx)), Y * Math.sin(rad(c.rx)) + Z * Math.cos(rad(c.rx))];
  [X, Z] = [X * Math.cos(rad(c.ry)) + Z * Math.sin(rad(c.ry)), -X * Math.sin(rad(c.ry)) + Z * Math.cos(rad(c.ry))];
  const d = PERSP * c.zoom, k = d / (d - Z);
  return [960 + X * k, 540 + Y * k];
};
const camT = (c) => `translate(960px,540px) rotateY(${n(c.ry)}deg) rotateX(${n(c.rx)}deg) rotateZ(${n(c.rz)}deg) scale(${n(c.zoom)}) translate(${n(-c.cx, 3)}px,${n(-c.cy, 3)}px)`;

// The state at frame f: lights, card lift, laps, note.
const stateAt = (f) => {
  const lamp = pw(f, [1, 3, 4, 6], [0, 1, 0.62, 1]), ST = [4, 10, 13, 19, 22, 28, LOCK, PUSH1];
  const spotX = pw(f, ST, [24, 24, 72, 72, 38, 38, 50, 60], smoothE) * 19.2, spotY = pw(f, ST, [30, 30, 40, 40, 62, 62, 64, 55], smoothE) * 10.8;
  const poolBase = pw(f, [22, LOCK, PUSH1], [400, 300, 470], (t) => ramp(t, 0, 1, 'swift')), pulse = pw(f, [LOCK, LOCK + 4, LOCK + 10], [0, 0.06, 0]);
  const breathe = 1 + 0.015 * Math.sin((f - LAND) / 14) * ramp(f, LAND, 20, 'out');
  const rise = popE(clamp((f - RISE0) / (RISE1 - RISE0))), reseat = reseatE(clamp((f - RESEAT0) / (LAND - RESEAT0))), lift = rise * (1 - reseat);
  return { f, lamp, spotX, spotY, poolRx: poolBase * (1 + pulse) * breathe, poolRy: poolBase * pw(f, [PUSH0, PUSH1], [0.8, 0.92]) * (1 + pulse) * breathe,
    dark: pw(f, [0, LOCK, PUSH1], [0.9, 0.92, 0.94]), cardLight: ramp(f, LOCK + 4, PUSH1 - LOCK - 4, 'smooth'), hold: 1 + 0.012 * Math.sin((f - LAND) / 14) * ramp(f, LAND, 20, 'out'),
    rise, reseat, lift, z: 110 * lift + Math.sin(((f - RISE1) / 40) * Math.PI * 2) * 4 * lift, press: pw(f, [LAND - 4, LAND - 1, LAND], [1, 0.997, 1]),
    landPulse: pw(f, [LAND - 4, LAND, LAND + 14], [0, 1, 0]), cam: camAt(f) };
};

export default {
  id: 'hero-spotlight', kind: 'scene',
  fits: ['hook', 'demo'],
  surface: ['dom'],
  beats: { min: 11.5, max: 11.5 },
  needs: { motions: [], props: ['tile-card'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text'] },
  slots: {
    line1: { type: 'text', tier: 'primary', sample: 'detailTitle', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
    line2: { type: 'text', tier: 'primary', claim: true, sample: 'label', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },   // a highlighter grows behind it
    hero: { type: 'image', crop: true, optional: true },
    page: { type: 'image', crop: true, optional: true },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  summary: 'The lights are down on a product page; a lamp searches it and locks on one card, the camera pushes in low from the side, the card lifts, a light runs twice round it, a note floats beside it, and both settle back.',
  defaults: () => ({ line1: null, line2: null, hero: null, page: null }),
  plan(s, ctx) {
    return { beats: 11.5, reads: [{ text: s.line1, lang: ctx.lang }, { text: s.line2, lang: ctx.lang }], cues: [{ beat: LOCK / 15, kind: 'accent' }, { beat: RISE0 / 15, kind: 'turn' }, { beat: LAND / 15, kind: 'land' }],
      motion: 'lamp search; push to a side angle; lift, hover, reseat', settled: LAND / 15, peakAt: RISE1 / 15, pause: (END - LAND) / 15 };
  },
  validate(s) { return s.line1 || s.line2 ? [] : ['line1 or line2: required']; },
  prepare(s, ctx) {
    const lang = ctx.lang, look = s.look || NEUTRAL;
    const fs = lang === 'zh' ? 36 : 34, f1 = fontFor(look, 'display', lang, fs, 760, 'display');
    return { lang, look, fs, f1, dust: Array.from({ length: 36 }, (_, i) => ({ u: hash(i, 4), v: hash(i + 40, 4), r: 0.8 + hash(i + 80, 4) * 1.6, d: (hash(i + 120, 4) - 0.5) * 0.6, a: 0.3 + hash(i + 160, 4) * 0.7 })) };
  },
  // the rig, built once into the root and rewritten whole on every pose
  rig(root, s, D) {
    const c = s.colors, dk = mix(c.ground, '#000000', 0.85), lampC = mix('#ffffff', c.accent, 0.12);
    root.style.background = dk;
    const stage = (z) => { const st = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspectiveOrigin: '960px 540px', zIndex: z }, root);
      const w = el('div', { position: 'absolute', left: '0', top: '0', width: '1920px', height: `${PAGE_H}px`, transformOrigin: '0 0', transformStyle: 'preserve-3d' }, st); return { st, w }; };
    const cv = (parent, w, h, style = {}) => { const k = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px`, ...style }, parent); k.width = w; k.height = h; return k; };
    const A = stage(1);
    // the page at 2× (it is seen at up to 2.6×): header, sections, cards (or the film's page image)
    const page = cv(A.w, 3840, PAGE_H * 2, { width: '1920px', height: `${PAGE_H}px` }), g = page.getContext('2d'); g.scale(2, 2);
    g.fillStyle = mix(c.ground, c.panel, 0.4); g.fillRect(0, 0, 1920, PAGE_H);
    if (s.page && s.page.width) { const k = Math.max(1920 / s.page.width, PAGE_H / s.page.height); g.drawImage(s.page, 0, 0, s.page.width * k, s.page.height * k); }
    else {
      g.fillStyle = c.panel; g.fillRect(0, 0, 1920, 61); g.fillStyle = c.line; g.fillRect(0, 61, 1920, 1);
      rrect(g, 32, 16, 28, 28, 7); g.fillStyle = c.accent; g.fill();
      const ft = fontFor(D.look, 'text', D.lang, 18, 600), fsec = fontFor(D.look, 'text', D.lang, 16, 650, 'label');
      text(g, copy('product', D.lang), 72, 37, ft, { color: c.ink }); copy('nav', D.lang).forEach((t, i) => text(g, t, 408 + i * 140, 37, ft, { color: i === 1 ? c.ink : c.dim }));
      const secs = [copy('label', D.lang), ...copy('steps', D.lang)];
      SECTIONS.forEach((y, i) => text(g, secs[i], 408, y + 13, i ? fsec : ft, { color: i ? c.dim : c.ink }));
      const items = cardItems(D.lang, 6).map((it) => ({ ...it, foot: '' }));   // these cards are too short for a footer
      CARDS.forEach((r, i) => { if (i !== 3) { g.save(); g.translate(r.x, r.y); drawCard(g, items[i % 6], r.w, r.h, { colors: c, lang: D.lang }, { layout: 'cover', radius: RADIUS, index: i }); g.restore(); } });
    }
    // the page's dark with a card-shaped soft hole (above the page, under the card)
    const hole = cv(A.w, 1920, PAGE_H, { transform: 'translateZ(1px)' }), hg = hole.getContext('2d');
    hg.fillStyle = dk; hg.fillRect(0, 0, 1920, PAGE_H); hg.globalCompositeOperation = 'destination-out';
    hg.filter = 'blur(60px)'; rrect(hg, HERO.x - 60, HERO.y - 50, HERO.w + 120, HERO.h + 100, 70); hg.fillStyle = rgba('#000000', 0.15); hg.fill();
    hg.filter = 'blur(22px)'; rrect(hg, HERO.x - 14, HERO.y - 14, HERO.w + 28, HERO.h + 28, RADIUS + 14); hg.fillStyle = '#000000'; hg.fill();
    // the slot the card leaves: a patch in the page's panel with a breathing accent edge
    const patch = el('div', { position: 'absolute', left: `${HERO.x - 2}px`, top: `${HERO.y - 2}px`, width: `${HERO.w + 4}px`, height: `${HERO.h + 4}px`, borderRadius: `${RADIUS}px`, transform: 'translateZ(1.5px)', background: c.panel }, A.w);
    const patchEdge = el('div', { position: 'absolute', inset: '0', borderRadius: `${RADIUS}px`, border: `1.5px solid ${c.accent}` }, patch);
    // the card (3× for the close-up), its light from the upper right, its rim, the light running round it
    const cardBox = el('div', { position: 'absolute', left: `${HERO.x}px`, top: `${HERO.y}px`, width: `${HERO.w}px`, height: `${HERO.h}px`, transformOrigin: 'center center', transformStyle: 'preserve-3d' }, A.w);
    const face = el('div', { position: 'absolute', inset: '0', borderRadius: `${RADIUS}px`, overflow: 'hidden' }, cardBox);
    const fc = cv(face, HERO.w * 3, HERO.h * 3, { width: `${HERO.w}px`, height: `${HERO.h}px` }), fg = fc.getContext('2d');
    if (s.hero && s.hero.width) { const k = Math.max((HERO.w * 3) / s.hero.width, (HERO.h * 3) / s.hero.height); fg.drawImage(s.hero, (HERO.w * 3 - s.hero.width * k) / 2, (HERO.h * 3 - s.hero.height * k) / 2, s.hero.width * k, s.hero.height * k); }
    else { fg.scale(3, 3); drawCard(fg, { ...cardItems(D.lang, 6)[3], foot: '' }, HERO.w, HERO.h, { colors: c, lang: D.lang }, { layout: 'cover', radius: RADIUS, index: 3, featured: true }); }
    const lit = el('div', { position: 'absolute', inset: '0', background: `linear-gradient(200deg, ${rgba(lampC, 0.35)}, ${rgba(lampC, 0)} 45%, ${rgba(dk, 0.08)} 100%)` }, face);
    const rim = el('div', { position: 'absolute', inset: '0', borderRadius: `${RADIUS}px` }, cardBox);
    const beam = cv(cardBox, HERO.w + 80, HERO.h + 80, { left: '-40px', top: '-40px' });
    const trail = el('div', { position: 'absolute', inset: '-3px', borderRadius: `${RADIUS + 3}px`, border: `1.5px solid ${c.accent}` }, cardBox);
    const edge = el('div', { position: 'absolute', left: '0', right: '0', top: `${PAGE_H - 8}px`, height: '8px', background: rgba(lampC, 0.8), filter: 'blur(6px)' }, A.w);
    // the lights, in screen space: the dark and its pool (multiply), the lamp (soft-light), the beam and its dust (screen)
    const mul = cv(root, 1920, 1080, { mixBlendMode: 'multiply', zIndex: 2 }), soft = cv(root, 1920, 1080, { mixBlendMode: 'soft-light', zIndex: 3 }), scr = cv(root, 1920, 1080, { mixBlendMode: 'screen', zIndex: 4 });
    // the note: same camera, drawn over the lights (it glows by itself); a dark backing, two lines, the highlighter
    const B = stage(5);
    const nshadow = el('div', { position: 'absolute', left: '520px', top: '760px', width: '240px', height: '70px', background: `radial-gradient(ellipse at 50% 50%, ${rgba('#000000', 0.55)}, transparent 70%)`, filter: 'blur(12px)' }, B.w);
    const nback = el('div', { position: 'absolute', left: '400px', top: '600px', width: '380px', height: '240px', background: `radial-gradient(ellipse 50% 50% at 52% 50%, ${rgba(dk, 0.97)} 0%, ${rgba(dk, 0.9)} 60%, ${rgba(dk, 0)} 100%)`, filter: 'blur(6px)' }, B.w);
    const note = cv(B.w, 1440, 420, { left: `${HERO.x - 48 - 480}px`, top: '650px', width: '480px', height: '140px' });
    return { A, B, page, hole, patch, patchEdge, cardBox, face, lit, rim, beam, trail, edge, mul, soft, scr, nshadow, nback, note, dk, lampC };
  },
  pose(root, u, s, ctx, D) {
    const R = root.__hero || (root.__hero = this.rig(root, s, D)), c = s.colors, S = stateAt(u * 15), f = S.f, cam = S.cam;
    for (const st of [R.A, R.B]) { st.st.style.perspective = `${n(PERSP * cam.zoom, 3)}px`; st.w.style.transform = camT(cam); }
    // the page's light: the near (lower) edge, the card-shaped hole fading in as the pool hands over
    R.edge.style.opacity = n(0.5 * Math.min(1, S.lift + ramp(f, PUSH0, 16, 'linear')));
    R.hole.style.opacity = n(S.cardLight > 0.001 ? Math.min(0.97, 0.94 * S.hold) * S.cardLight : 0);
    // the slot, the card, its rim, the laps
    const slotVis = Math.min(1, S.rise * 2) * (1 - S.reseat), slotEdge = Math.min(1, 0.45 * (1 - S.reseat)) + S.landPulse * 0.5;
    R.patch.style.opacity = n(Math.max(slotVis > 0.02 ? slotVis : 0, S.landPulse > 0.02 ? S.landPulse : 0)); R.patch.style.background = slotVis > 0.02 ? c.panel : 'transparent';
    R.patch.style.boxShadow = `inset 0 0 26px ${rgba(c.accent, 0.14 * slotEdge)}`;
    R.patchEdge.style.opacity = n(Math.min(1, slotEdge)); R.patchEdge.style.boxShadow = S.landPulse > 0.02 ? `0 0 ${n(24 * S.landPulse, 2)}px ${rgba(c.accent, 0.8)}` : 'none';
    R.cardBox.style.transform = `translateZ(${n(S.z + 2, 3)}px) scale(${n(S.press, 5)})`;
    const L = S.lift;
    R.face.style.boxShadow = f >= LAND || L < 0.001 ? 'none' : `${n(-10 * L, 2)}px ${n(10 * L, 2)}px ${n(12 + 12 * L, 2)}px ${rgba(R.dk, 0.35 * L)}, ${n(-36 * L, 2)}px ${n(48 * L, 2)}px ${n(90 * L, 2)}px ${rgba(R.dk, 0.42 * L)}`;
    R.lit.style.opacity = n(L);
    R.rim.style.boxShadow = `inset 0 0 0 1px ${rgba('#ffffff', 0.7 * L)}, 0 0 0 1.5px ${rgba(R.lampC, 0.7 * S.cardLight)}, 0 0 44px ${rgba(mix(R.lampC, c.accent, 0.3), 0.18 * S.cardLight)}`;
    const b1 = f >= 67 && f <= 83, b2 = f >= 87 && f <= 109, prog = b1 ? clamp((f - 68) / 14) : ramp(f, 88, 20, 'swift'), bg = R.beam.getContext('2d');
    bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, HERO.w + 80, HERO.h + 80);
    if ((b1 || b2) && L > 0.4) {
      const bw = HERO.w + 2, bh = HERO.h + 2, per = 2 * (bw + bh) - 8 * RADIUS + 2 * Math.PI * RADIUS;
      bg.translate(40 - 1, 40 - 1); bg.globalAlpha = b1 ? 1 : 0.62; bg.lineCap = 'round'; bg.setLineDash([0.16 * per, per]); bg.lineDashOffset = -prog * per;
      for (const [col, w, blur] of [[c.accent, b1 ? 5 : 3.5, 18], [mix('#ffffff', c.accent, 0.06), b1 ? 2.5 : 1.75, 6]]) {
        bg.shadowColor = rgba(c.accent, 0.9); bg.shadowBlur = blur; bg.strokeStyle = col; bg.lineWidth = w; rrect(bg, 0, 0, bw, bh, RADIUS); bg.stroke();
      }
    }
    R.trail.style.opacity = n(pw(f, [108, 122], [0.4, 0]));
    // the lights
    const m = R.mul.getContext('2d'), so = R.soft.getContext('2d'), sc = R.scr.getContext('2d'), dk = R.dk, pool = 1 - S.cardLight;
    m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, 1920, 1080);
    if (S.lamp * pool > 0.001) {
      m.save(); m.globalAlpha = S.lamp * pool; m.translate(S.spotX, S.spotY); m.scale(S.poolRx * 1.35, S.poolRy * 1.35);
      const rg = m.createRadialGradient(0, 0, 0, 0, 0, 1); [[0, 0], [0.26, 0], [0.44, 0.25], [0.62, 0.62], [0.8, 0.9], [1, 1]].forEach(([o, k]) => rg.addColorStop(o, rgba(dk, S.dark * k)));
      m.fillStyle = rg; m.fillRect(-40, -40, 80, 80); m.restore();   // one fill: past the radius the gradient holds its last stop, so no seams
    }
    if (S.lamp < 1) { m.fillStyle = rgba(dk, 0.84 * (1 - S.lamp)); m.fillRect(0, 0, 1920, 1080); }
    so.setTransform(1, 0, 0, 1, 0, 0); so.clearRect(0, 0, 1920, 1080);
    if (S.lamp * pool > 0.001) {
      so.save(); so.globalAlpha = S.lamp * pool; so.translate(S.spotX, S.spotY); so.scale(S.poolRx * 1.2, S.poolRy * 1.2);
      const lg = so.createRadialGradient(0, 0, 0, 0, 0, 1); lg.addColorStop(0, rgba(R.lampC, 0.24)); lg.addColorStop(0.5, rgba(R.lampC, 0.12)); lg.addColorStop(0.8, rgba(R.lampC, 0)); so.fillStyle = lg; so.fillRect(-1, -1, 2, 2); so.restore();
    }
    sc.setTransform(1, 0, 0, 1, 0, 0); sc.clearRect(0, 0, 1920, 1080);
    const beamOn = S.lamp * (1 - 0.45 * ramp(f, PUSH0, 18, 'smooth'));
    if (beamOn > 0.001) {
      const px = S.spotX, py = S.spotY, sx = px + 420, sy = -720, cw = S.poolRx * 0.6, cone = () => { sc.beginPath(); sc.moveTo(sx - 26, sy); sc.lineTo(sx + 26, sy); sc.lineTo(px + cw, py); sc.lineTo(px - cw, py); sc.closePath(); };
      const gr = sc.createLinearGradient(sx, sy, px, py); gr.addColorStop(0, rgba(R.lampC, 0.34)); gr.addColorStop(0.6, rgba(R.lampC, 0.16)); gr.addColorStop(1, rgba(R.lampC, 0.06));
      sc.save(); sc.globalAlpha = beamOn; sc.filter = 'blur(28px)'; cone(); sc.fillStyle = gr; sc.fill(); sc.restore();
      sc.save(); sc.globalAlpha = beamOn; cone(); sc.clip(); sc.fillStyle = mix('#ffffff', c.accent, 0.1);
      for (const d of D.dust) { const t = (d.v + f * 0.004 * (1 + d.d)) % 1, x = sx + (px - sx) * t + (d.u - 0.5) * (cw * 2 * t + 52) + Math.sin(f / 30 + d.u * 6) * 6, y = sy + (py - sy) * t;
        sc.globalAlpha = beamOn * 0.6 * d.a; sc.beginPath(); sc.arc(x, y, d.r, 0, Math.PI * 2); sc.fill(); }
      sc.restore();
    }
    // the note: rises out of a blur at 70, the highlighter grows at 84, settles back into the page with the card
    const noteIn = ramp(f, 70, 14, 'out'), settle = reseatE(clamp((f - (RESEAT0 - 4)) / (LAND - RESEAT0 + 4))), nz = 4 + (88 + Math.sin(((f - 70) / 44) * Math.PI * 2) * 3) * (1 - settle), hl = ramp(f, 84, 12, 'swift');
    const vis = f >= 70 ? 'visible' : 'hidden'; for (const e of [R.nshadow, R.nback, R.note]) e.style.visibility = vis;
    R.nshadow.style.transform = 'translateZ(2px)'; R.nshadow.style.opacity = n(0.5 * noteIn * (1 - settle));
    const ty = (1 - noteIn) * 26;
    R.nback.style.transform = `translateZ(${n(nz - 1, 3)}px) translateY(${n(ty, 3)}px)`; R.nback.style.opacity = n(noteIn);
    R.note.style.transform = `translateZ(${n(nz, 3)}px) translateY(${n(ty, 3)}px)`; R.note.style.opacity = n(noteIn); R.note.style.filter = noteIn < 1 ? `blur(${n((1 - noteIn) * 4, 2)}px)` : 'none';
    const ng = R.note.getContext('2d'); ng.setTransform(3, 0, 0, 3, 0, 0); ng.clearRect(0, 0, 480, 140);
    const fsz = D.fs, x1 = 480, y1 = 16 + fsz * 0.92, y2 = y1 + fsz * 1.1 + 2, white = mix('#ffffff', c.accent, 0.04);
    ng.save(); ng.shadowColor = rgba('#000000', 0.6); ng.shadowBlur = 18; ng.shadowOffsetY = 2;
    if (s.line1) text(ng, s.line1, x1, y1, D.f1, { color: white, align: 'right' });
    ng.restore();
    if (s.line2) {
      const w = measure(ng, s.line2, D.f1).width;
      if (hl > 0) { rrect(ng, x1 - w - 6, y2 - fsz * 0.84, (w + 12) * hl, fsz * 1.02, 4); ng.fillStyle = c.accent; ng.fill(); }
      text(ng, s.line2, x1, y2, D.f1, { color: hl > 0.55 ? c.onAccent || white : white, align: 'right' });
    }
  },
  // 0: the card's centre on the screen (the push, the lift, the reseat), through the same camera
  track(u) { const S = stateAt(u * 15); return [project(MCX, MCY, S.z + 2, S.cam)]; },
  blur() { return false; },
};

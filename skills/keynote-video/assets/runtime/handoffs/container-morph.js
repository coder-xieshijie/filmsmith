// container-morph — one rounded rectangle walks from one state of the interface to the next: width, height and corner
// radius ride a critically damped landing; the content leaves (blur + fade) before the shape moves and enters (blur →
// sharp) after it lands, so two contents are never on screen together. Theory: the container transform (Material);
// content out, then in. references/transitions.md#container-morph.

import { seg, settle, lerp, cubicOut, rrect, text, ground } from './util.js';

const OUT = [0, 0.133], MORPH = [0.133, 0.6], IN = [0.6, 0.8];

const label = (s) => (ctx, b, P) => {
  text(ctx, s, b.x + b.w / 2, b.y + b.h / 2 + P.font.size * 0.35, P.font, { color: P.colors.onInk, align: 'center' });
};

// The selected block of a segmented control moving from [l0, r0] to [l1, r1]: the leading edge moves first, the
// trailing edge `lag` (fraction of u) later, so the block stretches toward where it goes, then catches up.
export const leadingEdges = ([l0, r0], [l1, r1], u, lag = 0.1, w = 8) => {
  const right = l1 + r1 > l0 + r0;
  const a = settle(Math.min(1, u / (1 - lag)), w), b = settle(Math.max(0, (u - lag) / (1 - lag)), w);
  const lead = right ? a : b, trail = right ? b : a;
  return [lerp(l0, l1, trail), lerp(r0, r1, lead)];
};

export default {
  name: 'container-morph',
  tier: 'T1',
  beats: 1.5,
  modes: ['morph', 'phosphor'],
  roles: ['ground', 'ink', 'onInk'],
  from: 'a container in one interface state (a button, a pill) with its content',
  to: 'the same container in the next state (a card) with the next content',
  interpolates: ['width', 'height', 'corner radius', 'content opacity and blur (out, then in)'],
  summary: 'One rounded rectangle springs from one interface state to the next; its content leaves first and enters after it lands.',
  theory: 'The container transform keeps one element across states (Material motion); content out, then in, so two contents never overlap.',
  defaults: {
    center: [960, 560],
    from: { w: 440, h: 116, r: 58, content: label('Run check') },
    to: { w: 900, h: 500, r: 36, content: label('Passed') },
    shadow: true,
    font: { family: 'sans-serif', weight: 600, size: 44 },
    colors: { ground: '#EDEFF2', ink: '#15171A', onInk: '#EDEFF2' },
  },
  rest(side, P) {
    const s = side === 'from' ? P.from : P.to;
    return { w: s.w, h: s.h, r: s.r, content: side, alpha: 1, blur: 0 };
  },
  at(p, P) {
    const k = settle(seg(p, ...MORPH), 7.7);
    const v = (key) => (k >= 1 ? P.to[key] : lerp(P.from[key], P.to[key], k));
    const S = { w: v('w'), h: v('h'), r: v('r'), content: null, alpha: 0, blur: 0 };
    if (p < OUT[1]) { const u = seg(p, ...OUT); S.content = 'from'; S.alpha = 1 - u; S.blur = 12 * u; }
    else if (p >= IN[0]) { const u = cubicOut(seg(p, ...IN)); S.content = 'to'; S.alpha = u; S.blur = 12 * (1 - u); }
    return S;
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const [cx, cy] = P.center, x = cx - S.w / 2, y = cy - S.h / 2;
    ctx.save();
    if (P.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; }
    rrect(ctx, x, y, S.w, S.h, S.r); ctx.fillStyle = P.colors.ink; ctx.fill();
    ctx.restore();
    if (!S.content || S.alpha <= 0) return;
    ctx.save();
    rrect(ctx, x, y, S.w, S.h, S.r); ctx.clip();
    ctx.globalAlpha = S.alpha;
    if (S.blur > 0.05) ctx.filter = `blur(${S.blur.toFixed(2)}px)`;
    const draw = (S.content === 'from' ? P.from : P.to).content;
    if (draw) draw(ctx, { x, y, w: S.w, h: S.h, r: S.r }, P);
    ctx.restore();
  },
  track: (S, P) => [[P.center[0] - S.w / 2, P.center[1] - S.h / 2], [P.center[0] + S.w / 2, P.center[1] + S.h / 2]],
};

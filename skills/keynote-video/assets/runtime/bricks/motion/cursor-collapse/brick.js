// cursor-collapse — everything on screen is pulled into the block cursor: far pieces first so they all arrive
// together, each shrinking to 5 % and blurring to 6 px on power3.in; then the cursor shrinks to a 14 px point of light
// at the frame's centre (expo.inOut), its glow growing, ready for the fibre burst.
// From the phosphor template: film.js BUILD.boot (the collapse and the point; events.js collapse D − 4 beats over 1.5,
// delays (1 − d) × 0.5 beat; point D − 2.5 beats over 0.8). The pieces here are the hook's characters and a tag.
import { E, F, W, at, rect, rr, display, ground, post, palOf, rgba, zh, clamp, graphemes, fit } from '../../prop/terminal-hud/kit.js';

const DEFAULT = { en: { line: '3 runs failed.', tag: '✕ SEED · lost' }, zh: { line: '3 次运行失败。', tag: '✕ 种子 · 丢了' } };
export default {
  id: 'cursor-collapse', kind: 'motion',
  tier: 'T2', family: 'shape', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'bad', 'accent', 'hi', 'titleHi', 'titleLo'],
  from: 'a frame of type and tags with a block cursor after the last character', to: 'a 14 px point of light at the frame\'s centre',
  interpolates: ['each piece: position → the cursor, scale 1 → 0.05, blur 0 → 6 px, opacity 1 → 0 (delay by distance)', 'cursor: rect → 14 px disc at (960, 540), glow 14 → 54 px'],
  summary: 'Everything on screen is pulled into the block cursor, far pieces first so they arrive together, then the cursor shrinks to a glowing point at the frame\'s centre.',
  theory: 'A collapse to a point is the CRT power-off read as a gesture: the screen\'s contents return to their source (the cursor), and the point becomes the next shot\'s origin (match on position, Bordwell & Thompson on graphic matches).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice' }),
  prepare(P) {
    const L = P.lang || 'en', m = canvasOfLocal(), f = fit(m, P.line, { ...F('display', L, 150, 800), spacing: zh(L) ? 0 : -0.045 * 150 }, 1640, 96), ft = F('mono', L, zh(L) ? 28 : 25, 500);
    const g = []; let x = 960 - W(m, P.line, f) / 2; for (const ch of graphemes(P.line)) { const w = W(m, ch, f); g.push({ ch, x, w }); x += w; }
    return { Pal: palOf(P.colors, P.palette), f, ft, g, end: x + 6, tw: W(m, P.tag, ft) + 36 };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, S, P, D) {
    const L = P.lang || 'en', Pal = D.Pal, B = 0.5, t = S.p * 4 * B, y = 400, cw = D.f.size * 0.42, ch = D.f.size * 0.74, tgt = [D.end + cw / 2, y + D.f.size * 0.6];
    ground(ctx, Pal, 0, {});
    const pull = (cx, cy, fn) => { const dx = tgt[0] - cx, dy = tgt[1] - cy, d = Math.min(1, Math.hypot(dx, dy) / 1400), t0 = (1 - d) * 0.5 * B, dur = 1.5 * B * (0.5 + 0.5 * d), e = E.p2In((t - t0) / dur); if (e >= 1) return; ctx.save(); ctx.translate(cx + dx * e, cy + dy * e); ctx.scale(1 - 0.95 * e, 1 - 0.95 * e); ctx.translate(-cx, -cy); if (e > 0) ctx.filter = `blur(${(6 * e).toFixed(1)}px)`; ctx.globalAlpha *= 1 - e; fn(); ctx.restore(); };
    D.g.forEach((g) => pull(g.x + g.w / 2, y + D.f.size * 0.6, () => display(ctx, g.ch, g.x, y, D.f, Pal, { screen: P.screen })));
    const tx = 960 - D.tw / 2, ty = 640; pull(960, ty + 25, () => { rr(ctx, tx, ty, D.tw, 49, 4); ctx.fillStyle = rgba(Pal.bad, 0.08); ctx.fill(); ctx.strokeStyle = rgba(Pal.bad, 0.55); ctx.lineWidth = 2; ctx.stroke(); at(ctx, P.tag, tx + 18, ty + 12, D.ft, Pal.bad); });
    const tp = 1.5 * B, e = E.expoInOut((t - tp) / (0.8 * B)), x = D.end + (953 - D.end) * e, yy = y + (D.f.size * 1.2 - ch) / 2 + (533 - y - (D.f.size * 1.2 - ch) / 2) * e;
    ctx.save(); ctx.shadowColor = rgba(Pal.accent, 0.6 + 0.3 * e); ctx.shadowBlur = 14 + 40 * e; rr(ctx, x, yy, cw + (14 - cw) * e, ch + (14 - ch) * e, 7 * e); ctx.fillStyle = e > 0.5 ? Pal.hi : Pal.ink; ctx.fill(); ctx.restore();
    post(ctx, Pal, 0, { screen: P.screen });
  },
  track(S) { return [[960, 540]]; },
};
import { canvasOf } from '../../prop/terminal-hud/kit.js';
const canvasOfLocal = () => canvasOf(8, 8).getContext('2d');

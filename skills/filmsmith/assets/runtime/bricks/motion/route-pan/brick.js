// route-pan — the drafting route pulls the camera: between two sheets of one drawing an ink arrow draws across the
// gutter on the camera's own easing (power3.inOut, one beat), its head lands as the camera arrives, and the next
// sheet's frame and crop marks are already drawing (from 0.45 of the move). No cut, no second space: one paper, one
// grid, the camera travelling the 3-column serpentine (right, right, down, left, left, down …).
// From the blueprint template (assets/templates/blueprint/film.js world route arrows; camera.js keys, quartInOut;
// choreography.js MOVE_B 1).
import { E, SW, SH, palOf, makePen, drawWorld, drawLight, texturesOf, canvasOf, setLang, lerp, clamp, rgba } from '../../prop/sheet-hud/kit.js';

const GX = 120;
const DEFAULT = { en: { fromName: 'General arrangement', toName: 'Console', dir: 'right' }, zh: { fromName: '总体布置', toName: '控制台', dir: 'right' } };
export default {
  id: 'route-pan', kind: 'motion',
  tier: 'T1', family: 'horizontal', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'paper', 'ink', 'line'],
  from: 'a sheet at rest (1:1)', to: 'the next sheet of the same drawing at rest, its frame drawing in',
  interpolates: ['camera centre sheet → sheet (power3.inOut)', 'route arrow length 0 → gutter width, head on arrival', 'next frame and crop marks drawn from 0.45'],
  summary: 'The camera travels the drawing to the next sheet while an ink arrow draws across the gutter and lands with it.',
  theory: 'Spatial continuity (one world, the camera moves): the viewer keeps a map of where each sheet is (cognitive map of a scene; Tversky 2003); the line drawing ahead of the camera is a leading line that pulls the eye to the next sheet.',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 7 }),
  prepare(P) {
    setLang(P.lang || 'en');
    const Pal = palOf(P.colors, P.palette), mctx = canvasOf(8, 8).getContext('2d'), pen = makePen(Pal, mctx, { lang: P.lang });
    const d = { right: [1, 0], left: [-1, 0], down: [0, 1] }[P.dir] || [1, 0], B = [d[0] * (SW + GX), d[1] * (SH + GX)];
    const sheet = (x, y, name, t0) => {
      pen.rect(x, y, SW, SH, t0, 0.5, 'sf');
      [[0, 0, -1, -1], [SW, 0, 1, -1], [0, SH, -1, 1], [SW, SH, 1, 1]].forEach(([px, py, sx, sy]) => { pen.seg(x + px + sx * 16, y + py, x + px + sx * 70, y + py, t0 + 0.1, 0.2, 's1'); pen.seg(x + px, y + py + sy * 16, x + px, y + py + sy * 70, t0 + 0.1, 0.2, 's1'); });
      pen.text(name, x + 142, y + 325, { fam: 'cond', w: 700, size: 140, track: -0.02 }, t0 < 0 ? t0 : 9, 0.4);
    };
    sheet(0, 0, P.fromName, -9);
    sheet(B[0], B[1], P.toName, 0.45);
    const a = d[1] ? [SW / 2, SH - 80, SW / 2, B[1] + 72] : d[0] > 0 ? [SW - 80, SH / 2, B[0] + 72, SH / 2] : [80, SH / 2, B[0] + SW - 72, SH / 2];
    pen.line([[a[0], a[1]], [a[2], a[3]]], 0, 1, 's2', { ease: E.quartInOut, width: 3 });
    pen.head(a[2], a[3], Math.atan2(a[3] - a[1], a[2] - a[0]), 0.98, 'ink', 26);
    return { Pal, pen, B, T: texturesOf(Pal, P.seed || 7) };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p, e: E.quartInOut(clamp(p)) }; },
  paint(ctx, S, P, D) {
    const cam = { x: 960 + D.B[0] * S.e, y: 540 + D.B[1] * S.e, s: 1, dx: 0, dy: 0 };
    drawWorld(ctx, D.Pal, cam, D.pen.items, S.p, { extent: [-2400, -1400, 8000, 5000] });
    drawLight(ctx, D.Pal, D.T, 0);
  },
  track(S, P, D) { return [[960 - D.B[0] * S.e + (D.B[0] ? SW * 0.6 : 0), 540 - D.B[1] * S.e]]; },
};

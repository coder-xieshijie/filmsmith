// hand-mark — the one emphasis that is drawn by hand: a smooth vermilion 4.5 px stroke, drawn in one go and never boiling —
// a gently curved underline (0.5 s), an ellipse round a word (0.45 s, clear of the text by 20 px) or a brace that grows
// from its middle out (0.55 s) towards what it groups. At most four in a film, only where the viewer must look.
// From teach-video assets/kits/terminal-ledger/starter/components/hand.js (F.hand.underline, circle, brace; paths and
// times are the kit's); drawn by the kit's drawMark. Seconds at 120 BPM.
import { say, widthOf, drawMark, markPts, tw, E, pointAt, lengths, clamp } from '../../look/paper-ledger/kit.js';

const SEC = 0.5;
const DEFAULT = { en: { target: { lines: ['This step is a person\'s call'], x: 700, y: 470, size: 42 }, label: '' }, zh: { target: { lines: ['这一步要人来定'], x: 760, y: 470, size: 42 }, label: '' } };
// the mark's geometry from the target's measured box when the caller gives none
const geometry = (ctx, P) => {
  const T = P.target, lh = Math.round(T.size * 1.4), w = Math.max(...T.lines.map((s) => widthOf(ctx, s, P.lang, T.size))), h = lh * T.lines.length;
  if (P.mark?.kind && P.mark.x0 != null || P.mark?.cx != null || P.mark?.y0 != null) return { ...P.mark, at: 0 };
  const k = P.kind || 'underline';
  if (k === 'circle') return { kind: k, cx: T.x + w / 2, cy: T.y + h / 2, rx: w / 2 + 34, ry: h / 2 + 22, at: 0 };
  if (k === 'brace') return { kind: k, side: 'left', x: T.x - 34, y0: T.y - 6, y1: T.y + h + 6, at: 0 };
  return { kind: 'underline', x0: T.x, x1: T.x + w, y: T.y + lh * 0.5 + T.size * 0.62, at: 0 };
};
export default {
  id: 'hand-mark', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 1.5,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'the content at rest, unmarked',
  to: 'the same content with one hand-drawn mark on it',
  interpolates: ['the stroke drawn along its path (underline 0.5 s power2.inOut, circle 0.45 s, brace 0.55 s power2.out from its middle out)'],
  summary: 'The one hand-drawn emphasis: a smooth vermilion underline, ellipse or brace drawn in one go, never boiling; at most four a film.',
  theory: 'A mark that looks hand-made reads as a person pointing (deixis), so it is spent only where the viewer must look; drawn once and then still, it keeps attention without the motion noise of a boiling line.',
  defaults: (ctx = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])), kind: 'underline', mark: null }),
  prepare(P) { return null; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { return { p, t: p * 1.5 * SEC }; },
  paint(ctx, S, P) {
    const C = P.colors, T = P.target, lh = Math.round(T.size * 1.4);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    T.lines.forEach((s, i) => say(ctx, s, T.x, T.y + i * lh, P.lang, T.size, C.ink, { lh }));
    drawMark(ctx, C, geometry(ctx, P), S.t);
  },
  track(S, P) {
    const c = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    if (!c) return [[960, 540]];
    const m = geometry(c, P), pts = markPts(m), d = m.kind === 'brace' ? 0.55 : m.kind === 'circle' ? 0.45 : 0.5, u = tw(S.t, 0, d, m.kind === 'brace' ? E.p2o : E.p2io), Ls = lengths(pts);
    return m.kind === 'brace' ? [pointAt(pts, 0.5 - u / 2, Ls), pointAt(pts, 0.5 + u / 2, Ls)] : [pointAt(pts, u, Ls)];
  },
  blur: () => false,
};

// pair-hop — the one pairing mark on the input side hops to the next thing it pairs while the result beside the seam
// cuts on the same beat: a 6 × 34 px accent tick slides 0.25 s down a list to the next item (bold), or a 4 px
// underline slides 0.2 s to the next token of the quoted code, changing its width on the way. One mark at a time; it
// never fades between places. From the split template (film.js inputOf.pick tick, inputOf.file underline; the mode
// card's "pairing hop", T0).
import { clamp, lerp, cubicInOut, W, H, L, MARGIN, fonts, text, chw, painter, clipRect, seamV, seamColors } from '../../prop/seam-grip/split.js';
import { SAMPLE } from '../../prop/seam-grip/scenes.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

const frame = (n) => { const img = placeholderFrame(n); return { img, size: [img.width, img.height], kind: 'frame', focus: null, at: null }; };
export default {
  id: 'pair-hop', kind: 'motion',
  tier: 'T0', family: 'vertical',
  beats: 2,
  surface: ['canvas'],
  roles: ['paper', 'ink', 'muted', 'bench', 'accent', 'key'],
  from: 'the mark on one item (or token), its result beside the seam', to: 'the mark on the next, the next result cut in on the same beat',
  interpolates: ['the mark’s y (and, for an underline, x and width), cubic in-out over 0.25 s (0.2 s for an underline)'],
  summary: 'The pairing mark slides to the next item or token while the result beside the seam cuts on the same beat.',
  theory: 'Spatial and temporal contiguity (Mayer 2017): the input and the result it makes are paired by one moving mark on the beat the result changes; one mark at a time keeps one protagonist.',
  defaults: () => ({ mode: 'tick', list: SAMPLE.list, from: 0, to: 2, lines: SAMPLE.lines, tokens: SAMPLE.pairs }),
  rest(side) { return { b: side === 'from' ? 0 : 2 }; },
  at(p) { return { b: p * 2 }; },
  paint(g, S, P) {
    const C = seamColors(P.colors), F = fonts(P.lang || 'en'), B = 0.5, t = (S.b - 1) * B;   // the hop on beat 1
    const k = S.b >= 1 ? 1 : 0;
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    if (P.mode === 'underline') {
      const ch = chw(g, F.code), y0 = L.inputY;
      P.lines.forEach((ln, i) => { text(g, String(7 + i), MARGIN, y0 + i * L.inputStep, F.code, C.dim); text(g, ln, L.inputX, y0 + i * L.inputStep, F.code, C.ink); });
      const box = (j) => { const p = P.tokens[j], i = P.lines[p.line].indexOf(p.token); return { x: L.inputX + (i + 1) * ch, w: (p.token.length - 2) * ch, y: y0 + p.line * L.inputStep }; };
      const a = box(0), b = box(1), u = k ? cubicInOut(clamp(t / 0.2)) : 0, yS = y0 + P.lines.length * L.inputStep;
      g.fillStyle = C.accent; g.fillRect(lerp(a.x, b.x, u), lerp(a.y, b.y, u) + 9, lerp(a.w, b.w, u), 4);
      const pane = { x: 0, y: yS, w: W, h: H - yS };
      clipRect(g, 0, yS, W, H - yS, () => painter(frame(3 + k), pane, C)(g));
      return;
    }
    const pane = { x: L.X, y: 0, w: W - L.X, h: H }, cur = k ? P.to : P.from, u = k ? cubicInOut(clamp(t / 0.25)) : 0;
    P.list.forEach((m, i) => text(g, m, L.listX, L.listY + i * L.listStep, i === cur ? F.codeB : F.code, i === cur ? C.ink : C.muted));
    g.fillStyle = C.accent; g.fillRect(MARGIN, L.listY + lerp(P.from, P.to, u) * L.listStep - 26, 6, 34);
    clipRect(g, L.X, 0, W - L.X, H, () => painter(frame(k ? 2 : 0), pane, C)(g));
    seamV(g, L.X, 0, H, C);
  },
  track(S, P) { const u = S.b >= 1 ? cubicInOut(clamp((S.b - 1) * 0.5 / 0.25)) : 0; return [[MARGIN, L.listY + lerp(P.from, P.to, u) * L.listStep]]; },
};

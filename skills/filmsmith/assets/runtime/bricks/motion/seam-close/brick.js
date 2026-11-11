// seam-close — the lock-up's second move: the seam (with its grip and the page beside it) slides off the frame's right
// edge in one beat, cubic in-out, landing on the last bar line; then the caret blinks after the install line on each
// beat, waiting. The paper side is all that is left. From the split template (film.js stateOf lockup: close, blinks;
// the mode card's "seam close").
import { clamp, lerp, cubicInOut, W, H, L, MARGIN, fonts, text, chw, caret, painter, clipRect, seamV, gripV, seamColors } from '../../prop/seam-grip/split.js';
import { SAMPLE } from '../../prop/seam-grip/scenes.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

export default {
  id: 'seam-close', kind: 'motion',
  tier: 'T1', family: 'split-wipe',
  beats: 2,
  surface: ['canvas'],
  roles: ['paper', 'ink', 'muted', 'bench', 'accent', 'key'],
  from: 'the lock-up with the seam at x 1000 and the page beside it', to: 'the paper alone, the caret blinking after the install line',
  interpolates: ['the seam’s x 1000 → 1936 (cubic in-out, 1 beat)', 'the caret on for a quarter beat on each beat after'],
  summary: 'The seam slides off the frame’s edge on the last bar; the caret blinks after the install line, waiting.',
  theory: 'Closure: the actor that opened the film leaves the way it came, and the caret it was born from is what remains (object constancy, Heer & Robertson 2007).',
  defaults: () => ({ name: 'Northwind', command: SAMPLE.install, url: SAMPLE.url }),
  rest(side) { return { b: side === 'from' ? 0 : 2 }; },
  at(p) { return { b: p * 2 }; },
  paint(g, S, P) {
    const C = seamColors(P.colors), F = fonts(P.lang || 'en'), x = lerp(L.XF, W + 16, cubicInOut(clamp(S.b)));
    g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
    text(g, P.name, MARGIN, L.name, F.name, C.ink);
    text(g, P.command, MARGIN, L.install, F.code, C.ink);
    text(g, P.url, MARGIN, L.url, F.code, C.muted);
    if (S.b >= 1 && S.b < 1.25) caret(g, MARGIN + P.command.length * chw(g, F.code) + 3, L.install, 33, C.accent);
    if (x < W) {
      const img = placeholderFrame(1), A = { img, size: [img.width, img.height], kind: 'page', focus: null, at: null }, pane = { x: L.XF, y: 0, w: W - L.XF, h: H };
      clipRect(g, x, 0, W - x, H, () => painter(A, pane, C)(g, x - L.XF, 0));
      seamV(g, x, 0, H, C); gripV(g, C, x);
    }
  },
  track(S) { return [[lerp(L.XF, W + 16, cubicInOut(clamp(S.b))), 540]]; },
};

// code-gutter — real lines of a real file on the paper side, set as they are: one mono, one colour, no syntax colours,
// each line's real number in a gutter at x 96 and the code from x 176, the file's path as the label above; the one
// pairing mark (a 4 px accent underline under a token) or, for a diff, the removed line muted and the added line
// beside a 6 × 40 px accent bar. States: quoted → paired (the underline under a token) → diffed (− and + lines).
// From the split template (film.js inputOf.file, inputOf.diff; choreo.js layout).
import { W, H, L, MARGIN, fonts, text, chw } from '../seam-grip/split.js';
import { SAMPLE } from '../seam-grip/scenes.js';

export default {
  id: 'code-gutter', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { quoted: { pair: -1, diff: 0 }, paired: { pair: 1, diff: 0 }, diffed: { pair: -1, diff: 1 } },
  parts: ['label', 'gutter', 'code', 'underline', 'minus line', 'plus line', 'plus bar'],
  swap: {
    lines: { type: 'list', count: [2, 6], sample: 'default', of: { type: 'code', limits: { en: { chars: 64 }, zh: { chars: 64 } } } },
    label: { type: 'code', sample: 'default' },
  },
  roles: ['paper', 'ink', 'muted', 'dim', 'accent'],
  defaults: () => ({ label: 'docs.config.js', from: 7, lines: SAMPLE.lines, token: { line: 1, token: "'Install'" }, diff: SAMPLE.diff }),
  draw(g, st, P) {
    const C = P.colors, F = fonts(P.lang || 'en');
    g.save(); g.scale(P.w / W, P.h / H);
    g.fillStyle = C.paper || C.ground; g.fillRect(0, 0, W, H);
    text(g, P.label, MARGIN, L.label, F.label, C.dim);
    if (st.diff) {
      const y0 = L.diffY + 200, y1 = y0 + L.diffStep, d = P.diff;
      text(g, String(d.n), L.diffNum, y0, F.code, C.dim); text(g, '-', L.diffSign, y0, F.code, C.muted); text(g, d.before, L.diffCode, y0, F.code, C.muted);
      g.fillStyle = C.accent; g.fillRect(L.diffBar, y1 - 30, 6, 40);
      text(g, String(d.n), L.diffNum, y1, F.code, C.dim); text(g, '+', L.diffSign, y1, F.code, C.ink); text(g, d.after, L.diffCode, y1, F.code, C.ink);
    } else {
      P.lines.forEach((ln, i) => { const y = L.inputY + 120 + i * L.inputStep; text(g, String(P.from + i), MARGIN, y, F.code, C.dim); text(g, ln, L.inputX, y, F.code, C.ink); });
      if (st.pair >= 0 && P.token) {
        const ch = chw(g, F.code), i = P.lines[P.token.line].indexOf(P.token.token);
        g.fillStyle = C.accent; g.fillRect(L.inputX + (i + 1) * ch, L.inputY + 120 + P.token.line * L.inputStep + 9, (P.token.token.length - 2) * ch, 4);
      }
    }
    g.restore();
  },
};

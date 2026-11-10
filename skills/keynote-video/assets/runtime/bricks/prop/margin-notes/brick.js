// margin-notes — the words beside a real asset: a block of a value (display), a line and a glance note (or an address)
// in the margin, each line rising through its own rail and leaving up through it; the block rides level with the part
// of the asset in play. States: empty → value → the group (line and note) → leaving. Text is a swap point; Chinese
// lines wrap inside the margin. From the handset template (film.js paintCopy, choreo.js group).
import { layout, paintNotes } from './notes.js';

const LIM = { value: { en: { words: 2, chars: 10 }, zh: { chars: 5 } }, line: { en: { words: 4, chars: 18 }, zh: { chars: 14 } }, note: { en: { words: 6, chars: 40 }, zh: { chars: 22 } } };
const DEFAULT = {
  en: { value: '42%', line: 'faster builds', note: 'measured on the release build' },
  zh: { value: '42%', line: '构建更快', note: '在正式版上实测' },
};
export default {
  id: 'margin-notes', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [448, 320], M: [448, 400], L: [996, 400] },
  // t: the block's clock in s (each line enters at its own time); the states sample it
  states: { empty: { t: 0, gone: 0 }, value: { t: 0.5, gone: 0 }, group: { t: 1.4, gone: 0 }, leaving: { t: 1.4, gone: 1 } },
  parts: ['value', 'line', 'note'],
  swap: { value: { type: 'text', tier: 'primary', limits: LIM.value }, line: { type: 'text', tier: 'primary', limits: LIM.line }, note: { type: 'text', tier: 'glance', limits: LIM.note } },
  roles: ['ground', 'ink', 'dim', 'muted'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'] }),
  draw(g, s, P) {
    const L = P.lang || 'en';
    const Lay = layout(g, [{ role: 'display', text: P.value, in: 0.1 }, { role: 'line', text: P.line, in: 0.6 }, { role: 'note', text: P.note, in: 0.6 }].map((i) => ({ ...i, out: s.gone > 0 ? 1.4 : null })), P.w, L);
    paintNotes(g, Lay, s.t + s.gone * 0.2, 40, 0, P.w, P.colors);
  },
};

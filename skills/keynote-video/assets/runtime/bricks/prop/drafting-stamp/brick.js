// drafting-stamp — a rubber stamp in worn ink: a double frame (6 px inner, 2 px outer ring), the word at 70 / 50 px
// in Plex Sans Condensed, a small line under it (never under 25 px, 28 in Chinese), the ink eroded by seeded noise. It
// drops from 2.1× in 0.17 s accelerating, lands with a 0.14 s squash; the frame gives one short thud (the scene's).
// The role carries the meaning: `accent` is a person's decision (CONFIRMED, SIGNED, APPROVED), `line` a machine's
// check (VERIFIED, SEALED), same shape. From the blueprint template (assets/templates/blueprint/fx.js makeStamp,
// drawStamp); the word goes through caseOf, so Chinese stamp words (已签字, 已验证) keep their characters and take no
// tracking.
import { palOf, makeStamp, drawStamp, canvasOf, setLang, zf } from '../sheet-hud/kit.js';

export default {
  id: 'drafting-stamp', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [360, 160], M: [540, 240], L: [720, 320] },
  // land: seconds since the stamp's landing beat (−0.17 … the drop, ≥ 0.14 settled); rot in degrees
  states: { hidden: { land: -1, rot: -5 }, dropping: { land: -0.08, rot: -5 }, landed: { land: 0.5, rot: -5 } },
  parts: ['inner frame', 'outer ring', 'word', 'small line', 'worn ink'],
  swap: {
    word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    small: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } },
    role: { type: 'enum', of: ['accent', 'line'] },
  },
  roles: ['paper', 'accent', 'line'],
  defaults: (ctx = {}) => (ctx.lang === 'zh' ? { word: '已签字', small: '负责人', role: 'accent', seed: 7, ground: true } : { word: 'Signed', small: 'by the owner', role: 'accent', seed: 7, ground: true }),
  prepare: (P) => {
    setLang(P.lang || 'en');
    const Pal = palOf(P.colors, P.palette), mctx = canvasOf(8, 8).getContext('2d'), k = (P.w || 540) / 540;
    return { Pal, k, st: makeStamp(Pal, mctx, { word: P.word, small: P.small }, Math.round(70 * k), P.seed || 7, P.role || 'accent') };
  },
  draw(ctx, st, P, D) {
    const w = P.w || 540, h = P.h || 240;
    if (P.ground !== false) { ctx.save(); ctx.fillStyle = D.Pal.paper; ctx.fillRect(0, 0, w, h); ctx.restore(); }
    drawStamp(ctx, D.st, w / 2, h / 2, st.rot, 0, st.land);
  },
};

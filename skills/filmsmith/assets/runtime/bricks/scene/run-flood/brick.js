// run-flood — the climax of a demo: Run is pressed and spins while the request is in flight; on the bar line its own
// outline floods the frame (exponential in, one beat) and inside is the same card in the other material, the live
// console: the status lands in the ink accent, two body lines rise, then the claim lands centred under the card (the
// climax, read in a pause); the console retracts back into the Run button, which stays on top in the accent.
// From the morph template's `flood` scene (assets/templates/morph/film.js drawFlood, consoleFrame, floodScale;
// choreo.js flood): the flood's curve (exp of progress^2.2 to 1.15 × the cover scale), the retract (1.25 beats) and
// the beats are the template's.
import { FOCUS, CX, W, H, SZ, secs, prog, colorsOf, groundOf, loadFonts, productOf, bodyLines, statusLine, sans, mono, txt, riseText, spr, fillShape, strokeShape, clipShape, shapePath,
  runRect, runButton, crit, cubicInOut, readTime, clamp } from '../../motion/outline-morph/ink.js';
import { cardContents, TABS, DEFAULT as CARD } from '../../prop/code-card/brick.js';

const DEFAULT = { en: { ...CARD.en, claim: 'Docs that run.' }, zh: { ...CARD.zh, claim: '能跑的文档。' } };
const RETRACT = 1.25;
const FLOOD_MAX = (() => { const R = runRect(), cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2; return 1.15 * Math.max((Math.max(cx, W - cx) + R[4]) / (R[2] / 2), (Math.max(cy, H - cy) + R[4]) / (R[3] / 2)); })();
const floodPath = (ctx, k, corners) => { const R = runRect(), cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2; shapePath(ctx, cx - (R[2] * k) / 2, cy - (R[3] * k) / 2, R[2] * k, R[3] * k, R[4] * k, { corners }); };
const beatsOf = (s, ctx) => { const pre = s.pre ?? 2, read = (readTime(s.claim, ctx.lang) * ctx.bpm) / 60; return { pre, claim: pre + 4, beats: clamp(Math.ceil(pre + 4 + Math.max(1.5, read) + RETRACT), 8, 14) }; };
const REST = (tabs) => ({ enter: -20, code: -20, tabs: tabs.map((_, i) => -20 + i), arm: -20 });

export default {
  id: 'run-flood', kind: 'scene',
  fits: ['climax', 'proof', 'demo'],
  surface: ['canvas'],
  beats: { min: 8, max: 14 },
  needs: { motions: [], props: ['code-card'], roles: ['ground', 'paper', 'ink', 'dim', 'accent', 'onAccent', 'inkDim', 'inkAccent', 'inkCard', 'inkEdge'], type: ['display', 'mono'] },
  slots: {
    claim: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 14 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
    run: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } },
    tabs: { type: 'list', count: [1, 4], of: { lang: { type: 'code' }, code: { type: 'list', count: [1, 3], of: { type: 'code' } } } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'accent', 'onAccent', 'inkDim', 'inkAccent', 'inkCard', 'inkEdge'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], tabs: TABS, pre: 2, corners: 'round' }),
  plan(s, ctx) {
    const b = beatsOf(s, ctx);
    return { beats: b.beats, reads: [{ text: s.claim, lang: ctx.lang }],
      cues: [{ beat: 0, kind: 'hit' }, { beat: b.pre, kind: 'turn' }, { beat: b.pre + 2, kind: 'land' }, { beat: b.claim, kind: 'accent' }, { beat: b.beats - RETRACT, kind: 'turn' }],
      motion: 'the Run button floods the frame', settled: b.claim + 0.5, peakAt: b.claim, pause: b.beats - RETRACT - b.claim - 0.5 };
  },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, bpm = c.bpm, t = secs(u, bpm), K = s.corners, tabs = s.tabs?.length ? s.tabs : TABS, b = beatsOf(s, c), P = productOf(s);
    const tFlood = secs(b.pre, bpm), tRet = secs(b.beats - RETRACT, bpm), B1 = secs(1, bpm), RT = REST(tabs);
    const scale = t < tFlood ? 0 : t < tRet ? Math.exp(Math.log(FLOOD_MAX) * Math.pow(prog(t, tFlood, B1), 2.2)) : (prog(t, tRet, secs(RETRACT, bpm)) >= 1 ? 0 : Math.exp(Math.log(FLOOD_MAX) * Math.pow(1 - cubicInOut(prog(t, tRet, secs(RETRACT, bpm))), 1.6)));
    const light = () => {
      groundOf(ctx, s, C);
      const press = 1 - 0.05 * (crit(t, 34) - crit(t - 0.1, 34)), spin = b.pre > 0 && t < tFlood + 0.05 ? t * 2 * Math.PI * 1.6 : null;
      fillShape(ctx, FOCUS, C.paper, K); strokeShape(ctx, FOCUS, C.ink, 3, K);
      ctx.save(); clipShape(ctx, FOCUS, K); cardContents(ctx, { ...s, tabs }, 0, RT, C, L, { runState: { press, spin } }); ctx.restore();
    };
    const console_ = () => {
      ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
      fillShape(ctx, FOCUS, C.inkCard, K); strokeShape(ctx, FOCUS, C.inkEdge, 3, K);
      ctx.save(); clipShape(ctx, FOCUS, K);
      cardContents(ctx, { ...s, tabs }, 0, RT, C, L, { material: 'ink' });
      const x = FOCUS[0] + 64, lines = bodyLines(P).slice(0, 2).map((l) => l.trim().replace(/,$/, ''));
      riseText(ctx, statusLine(P), x, FOCUS[1] + 430, mono(SZ.main, 600), C.inkAccent, spr(t - secs(b.pre + 2, bpm), 22));
      lines.forEach((ln, i) => riseText(ctx, ln, x, FOCUS[1] + 500 + i * 64, mono(SZ.main), C.ground, spr(t - secs(b.pre + 2.5 + 0.5 * i, bpm), 22)));
      ctx.restore();
      runButton(ctx, runRect(), s.run, L, C, { stroke: C.inkDim, color: C.ground });
      const cOut = prog(t, tRet - 0.12, 0.12);
      riseText(ctx, s.claim, CX, 930, sans(L, SZ.caption, 700, 'display'), C.ground, spr(t - secs(b.claim, bpm), 22), { align: 'center', out: cOut });
    };
    if (scale <= 0) { light(); if (t >= tRet) runButton(ctx, runRect(), s.run, L, C, { fill: C.accent, stroke: C.accent, color: C.onAccent }); return; }
    if (scale >= FLOOD_MAX * 0.999) { console_(); return; }
    light();
    ctx.save(); floodPath(ctx, scale, K); ctx.clip(); console_(); ctx.restore();
    if (t >= tRet) runButton(ctx, runRect(), s.run, L, C, { fill: C.accent, stroke: C.accent, color: C.onAccent });
  },
  track() { const R = runRect(); return [[R[0] + R[2] / 2, R[1] + R[3] / 2]]; },
};

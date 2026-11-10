// install-block — how to start: a title, an ink block where one or two commands type out after the prompt glyph
// (72 characters a second) with a block cursor, an optional note, then numbered steps under 4 px rules landing one by
// one, paced by reading; the cursor blinks on every beat while the page holds (its hold move). The music rests here.
// From the plakat template's `install` (assets/templates/plakat/scenes.js). Commands are code: they stay Latin.
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, wrapLines, drawPath, rollUp, lerp, graphemes , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { title: 'Start in one line', panel: 'terminal · macOS · Linux', commands: ['brew install tablewarden', 'tw init --db postgres://prod'], note: 'reads tablewarden.yaml · never runs unsigned',
    steps: [{ cmd: 'tw draft', note: 'the agent writes the plan' }, { cmd: 'tw replay', note: 'checks on a shadow copy' }, { cmd: 'tw sign', note: 'you approve each change' }] },
  zh: { title: '一行命令开始', panel: '终端 · macOS · Linux', commands: ['brew install tablewarden', 'tw init --db postgres://prod'], note: '读取 tablewarden.yaml · 未签字不执行',
    steps: [{ cmd: 'tw draft', note: '代理写出计划' }, { cmd: 'tw replay', note: '在影子副本上检查' }, { cmd: 'tw sign', note: '每处改动由你批准' }] },
};
const CPS = 72;
const tplan = (s, bpm, L) => {
  const len = (x) => graphemes(x).length, typeT = [0.5];
  for (let i = 1; i < s.commands.length; i++) typeT.push(typeT[i - 1] + len(s.commands[i - 1]) / CPS + 0.15);
  const typeEnd = typeT[typeT.length - 1] + len(s.commands[s.commands.length - 1]) / CPS, note = Math.max(1.6, typeEnd - 0.5), r = rd(L);
  let read = 0.25 + r(s.title); s.commands.forEach((c, i) => (read = Math.max(read, typeT[i] + len(c) / CPS + 0.25) + r(c)));
  const stepT = []; s.steps.forEach((st, i) => { const u = Math.max(i ? stepT[i - 1] + 0.5 : Math.max(2.0, typeEnd - 0.1), halfBeatUp(read - 0.25)); stepT.push(u); read = Math.max(read, u + 0.25) + r(st.cmd); });
  const rules = Math.min(stepT[0], Math.max(typeEnd + 0.25, halfBeatUp((typeEnd + stepT[0]) / 2)));
  const P = { typeT, typeEnd, note, stepT, rules };
  P.reads = [[0, [s.title]], [0.2, [s.panel], G], ...s.commands.map((c, i) => [typeT[i] + len(c) / CPS, [c]]), ...s.steps.flatMap((st, i) => [[stepT[i], [st.cmd]], [stepT[i], [st.note], G]])];
  P.settled = stepT[stepT.length - 1] + 0.35;
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.blink = []; for (let u = beatUp(typeEnd) + 0.5; u <= P.D - 0.125 - 0.25 + 1e-9; u += 0.5) P.blink.push(u);
  return P;
};
export default {
  id: 'install-block', kind: 'scene',
  fits: ['demo', 'rest', 'lockup'],
  surface: ['canvas'],
  beats: { min: 6, max: 22 },
  needs: { motions: ['block-carry'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'onInk', 'mutedOnInk', 'promptOnInk'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 26 }, zh: { chars: 10 } } },
    panel: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 24 }, zh: { chars: 10 } } },
    commands: { type: 'list', count: [1, 2], of: { type: 'code', tier: 'primary', limits: { en: { chars: 36 }, zh: { chars: 36 } } } },
    note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 8, chars: 48 }, zh: { chars: 22 } } },
    steps: { type: 'list', count: [2, 4], of: { cmd: { type: 'code', tier: 'primary', limits: { en: { chars: 16 }, zh: { chars: 16 } } }, note: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 28 }, zh: { chars: 9 } } } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'onInk', 'mutedOnInk', 'promptOnInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, ...s.commands, ...s.steps.map((x) => x.cmd)].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, ...P.typeT.map((u) => ({ beat: u * 2, kind: 'type' })), ...P.stepT.map((u) => ({ beat: u * 2, kind: 'tick' })), ...P.blink.map((u) => ({ beat: u * 2, kind: 'tick' }))],
      motion: 'the block clips in, commands type, steps land; the cursor blinks on the beat', settled: P.settled * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L);
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    const tz = fitSize(ctx, plain(s.title), (z) => F('display', L, z), 1732, 120, 100);
    masked(ctx, s.title, 92, 150, F('display', L, tz), C, { off: riseOff(tw(0, 0.55)), lh: 1 });
    const bp = tw(0.2, 0.4, E.expoInOut);
    if (bp > 0 && !(s.exitBy === 'reblock' && ck.t >= AT(P.D - 0.25))) {
      ctx.save(); ctx.beginPath(); ctx.rect(96, 350, 1728 * bp, 200); ctx.clip();
      rect(ctx, 96, 350, 1728, 200, C.ink);
      at(ctx, labelText(s.panel, L), 1796, 370, lf, C.mutedOnInk, { align: 'right' });
      const cf = F('mono', L, 34, 400);
      s.commands.forEach((cmd, i) => {
        const y = s.commands.length === 1 ? 350 + 80 : 350 + 44 + 72 * i, g = graphemes(cmd), n = Math.max(0, Math.min(g.length, Math.floor((ck.t - AT(P.typeT[i])) * CPS * (1 / ck.k) + 1e-6)));
        at(ctx, '›', 136, y, cf, C.promptOnInk);
        const typed = ck.t >= AT(P.typeT[i]) ? g.slice(0, n).join('') : '', w = width(ctx, '› ', cf);
        at(ctx, typed, 136 + w, y, cf, C.onInk);
        const lastCur = i === s.commands.length - 1, on = ck.t >= AT(P.typeT[i]) && (lastCur || ck.t < AT(P.typeT[i + 1]));
        let vis = on; if (lastCur && on) { let j = -1; P.blink.forEach((bu, k) => { if (ck.t >= AT(bu)) j = k; }); if (j >= 0) vis = j % 2 === 1; }
        if (vis) rect(ctx, 136 + w + width(ctx, typed, cf) + 4, y + 2, 20, 38, C.onInk);
      });
      ctx.restore();
    }
    if (s.note) { const np = tw(P.note, 0.3); at(ctx, s.note, 96, 566, F('mono', L, S.label, 400), C.dim, { alpha: np }); }
    s.steps.forEach((st, i) => {
      const x = COL(1 + 3 * i);
      rect(ctx, x, 640, 414 * ck.sec(AT(P.rules) + 0.08 * i, 0.35, E.expoOut), 4, C.ink);
      const p = ck.sec(AT(P.stepT[i]) + 0.05, 0.3, E.expoOut);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p; ctx.translate(0, 16 * (1 - p));
      at(ctx, labelText(pad2(i + 1), L), x, 664, lf, C.dim);
      at(ctx, st.cmd, x, 664 + S.label * 1.3 + 18, F('mono', L, 34, 600), C.ink);
      at(ctx, st.note, x, 664 + S.label * 1.3 + 18 + 34 * 1.3 + 8, F('text', L, S.label, 500), C.dim);
      ctx.restore();
    });
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 450]]; },
};

// panel-focus — an interface gathers into one card: the six panels of the docs page fly together into one card at
// main size (a container transform: their content leaves first, then the shapes move on springs 20 ms apart), the
// title rises, the language tabs, the code and the Run button enter; the highlight steps tab to tab (leading edge
// first) and the code changes with it; on the last beat Run takes the accent. The captions of the page leave first.
// From the morph template's `focus` scene (assets/templates/morph/film.js drawFocus, focusContents; choreo.js focus):
// springs, the gather order and beats are the template's.
import { PANELS, ORDER, PANEL_R, FOCUS, CAP1, CAP2, secs, prog, spr, colorsOf, groundOf, loadFonts, productOf, caption, fillShape, strokeShape, clipShape, lerpR, readTime, clamp } from '../../motion/outline-morph/ink.js';
import { panelContent } from '../../prop/api-page/brick.js';
import { cardContents, TABS, DEFAULT as CARD } from '../../prop/code-card/brick.js';

const DEFAULT = {
  en: { ...CARD.en, above: 'One spec in.', caption: 'Every doc out.', ref: 'Retrieve an invoice' },
  zh: { ...CARD.zh, above: '一份规格进。', caption: '全部文档出。', ref: '获取一张发票' },
};
// beats: gather on 0, the title on 1, the code on 2, each further tab 1.5 beats later, Run arms 1.5 after the last
export const focusTimes = (tabs, bpm) => {
  const at = tabs.map((_, k) => 2 + 1.5 * k), arm = at[at.length - 1] + 1.5;
  return { beats: { enter: 1, code: 2, tabs: at, arm, end: arm + 1.5 }, T: { enter: secs(1, bpm), code: secs(2, bpm), tabs: at.map((b) => secs(b, bpm)), arm: secs(arm, bpm) } };
};

export default {
  id: 'panel-focus', kind: 'scene',
  fits: ['demo'],
  surface: ['canvas'],
  beats: { min: 5, max: 11 },
  needs: { motions: ['container-morph'], props: ['api-page', 'code-card'], roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } },
    run: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } },
    tabs: { type: 'list', count: [1, 4], of: { lang: { type: 'code' }, code: { type: 'list', count: [1, 3], of: { type: 'code' } } } },
    above: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 15 }, zh: { chars: 7 } } },
    caption: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 15 }, zh: { chars: 7 } } },
    ref: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 12 } } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], tabs: TABS, corners: 'round' }),
  plan(s, ctx) {
    const tabs = s.tabs?.length ? s.tabs : TABS, B = focusTimes(tabs, ctx.bpm).beats;
    const read = (readTime(s.title, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(Math.max(B.end, B.enter + read + 1)), 5, 11);
    return { beats, reads: [{ text: s.title, lang: ctx.lang }, ...tabs.map((tb) => ({ text: (tb.code || []).join(' '), lang: 'en' }))],
      cues: [{ beat: 0, kind: 'turn' }, { beat: B.enter, kind: 'land' }, ...B.tabs.slice(1).map((b) => ({ beat: b, kind: 'tick' })), { beat: B.arm, kind: 'accent' }],
      motion: 'six panels gather into one card', settled: B.arm + 0.5, peakAt: 0, pause: beats - B.arm - 0.5 };
  },
  validate(s) { return (s.tabs || []).length > 4 ? ['tabs: four at most (the track is 1,392 px wide)'] : []; },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, t = secs(u, c.bpm), K = s.corners, P = productOf(s), tabs = s.tabs?.length ? s.tabs : TABS;
    const { T } = focusTimes(tabs, c.bpm), out = prog(t, 0, 0.1), capOut = prog(t, 0, 0.12);
    groundOf(ctx, s, C);
    caption(ctx, s.above, CAP1, 1, C, L, capOut);
    caption(ctx, s.caption, CAP2, 1, C, L, capOut);
    const R = Object.fromEntries(ORDER.map((k, i) => [k, lerpR([...PANELS[k], PANEL_R], FOCUS, spr(t - 0.1 - i * 0.02, 18))]));
    for (const k of [...ORDER.filter((k) => k !== 'Bo'), 'Bo']) { fillShape(ctx, R[k], C.paper, K); strokeShape(ctx, R[k], C.ink, 3, K); }
    if (out < 1) ORDER.forEach((k) => {
      const R0 = [...PANELS[k], PANEL_R];
      ctx.save(); clipShape(ctx, R0, K); ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
      panelContent(ctx, k, R0, P, C, L, { ref: s.ref });
      ctx.restore();
    });
    ctx.save(); clipShape(ctx, FOCUS, K);
    cardContents(ctx, { ...s, tabs }, t, T, C, L);
    ctx.restore();
  },
  track() { return [[960, 440]]; },
};

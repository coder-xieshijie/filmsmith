// width-jump — a name changing its width on the beat: the word stands centred and each step snaps it to the next
// width of the face's axis (Archivo wdth: condensed, semi-condensed, extra-condensed, semi-condensed, normal) with a
// 5 % punch-in, no tween between steps, so the name "breathes" in time with the bar; the glyph count and the centre
// never move. Chinese (zhRedesigns): no CJK face has a width axis, so the same five steps are 长体 scales of Noto Sans
// SC 900 (0.86, 0.93, 0.8, 0.93, 1 wide), the way Chinese headline type condenses.
// From the ink template's name scene (assets/templates/ink/film.js TYPE_WIDTHS.compressed.jumps, stretchAt; plan.js
// widthSteps on beats 2–6).
import { word, fill, camera, applyCam } from '../../look/paper-slam/kit.js';
import LOOK from '../../look/paper-slam/look.js';

const JUMPS = LOOK.type.stretch.jumps;
const DEFAULT = { en: { text: 'cleave' }, zh: { text: '二分侠' } };
export default {
  id: 'width-jump', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 5,
  beatsFor: (P) => (P.steps || JUMPS).length,
  surface: ['canvas'],
  roles: ['accent', 'onAccent'],
  from: 'the word at the face\'s normal width', to: 'the word back at normal width after its jumps',
  interpolates: ['width keyword (or Chinese horizontal scale) stepped once a beat', 'camera punch 5 % on each step'],
  summary: 'A name snaps through the face\'s widths once a beat, condensed to normal, with a small punch-in on each step: the type breathes with the bar.',
  theory: 'A discrete change on the beat is heard as part of the rhythm (synchronisation of picture and pulse); keeping the centre and the glyph count fixed lets the eye stay on one word while it changes (the ink mode card, "width jumps").',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], size: 225, steps: JUMPS, bpm: 124 }),
  rest(side) { return { p: side === 'from' ? 0 : 1 }; },
  at(p) { return { p }; },
  paint(ctx, S, P) {
    const C = P.colors, L = P.lang || 'en', st = P.steps || JUMPS, n = st.length, B = 60 / (P.bpm || 124);
    const k = S.p >= 1 ? n - 1 : Math.floor(S.p * n + 1e-6) - 0, stretch = S.p <= 0 ? 'normal' : st[Math.min(n - 1, k)];
    fill(ctx, C.accent);
    const t = S.p * n * B, punches = st.map((_, j) => (j * B)).filter((a) => a <= t);
    applyCam(ctx, camera(S.p >= 1 ? 9 : t, S.p >= 1 ? [] : punches, { push: false }));
    word(ctx, { text: P.text, raw: true, x: 960, y: 610, size: P.size, align: 'center', stretch, kind: 'mark', lang: L, mode: 'rise', tIn: -10, outMode: 'none', color: C.onAccent, mis: false }, 0, C);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },
  track() { return [[960, 530]]; },
};

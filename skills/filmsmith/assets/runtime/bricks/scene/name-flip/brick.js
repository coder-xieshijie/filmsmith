// name-flip — the lock-up of a query film: the name and its version at the anchor's height (the version in amber when
// it is the answer), the tagline a beat later, the install command typing from beat 2 at 50 characters a second and
// held at least 3 s once typed; on the downbeat of the scene's last bar the ground flips from ramp[1] to ramp[0] round
// the fixed name, through a band (or a circle with `form: 'round'`).
// From the pulse template's `name` (assets/templates/pulse/film.js paintName, choreo.js namePlan): baselines 600 /
// 720 / 860, sizes 364 (floor 291) / 61 / 49, the timings the template's; the scene rounds itself to whole bars.
import { clamp, canvasOf } from '../../../handoffs/util.js';
import { readTime, graphemes } from '../../lang.js';
import { SZ, T, X0, F, draw, rise, fitSize, widthOf, groundHex, onGround, fillGround, aperture, typed, secs, grain } from '../../look/query-ramp/kit.js';
import { text } from '../../../handoffs/util.js';

const DEFAULT = { en: { name: 'tidewell', version: '2.4', line: 'incremental scene renders', install: 'npm i -D tidewell@2.4.0' }, zh: { name: 'tidewell', version: '2.4', line: '增量场景渲染', install: 'npm i -D tidewell@2.4.0' } };

const timing = (s, ctx) => {
  const B = 60 / ctx.bpm, typedAt = 2 * B + graphemes(s.install || '').length / T.installCps;
  const need = Math.max(typedAt + 3, B + readTime(s.line, ctx.lang) + readTime(s.name, ctx.lang), 4.5);
  const beats = clamp(Math.ceil(Math.ceil(need / B - 1e-9) / 4) * 4, 8, 16);
  return { B, beats, flip: (beats - 4) * B };
};

export default {
  id: 'name-flip', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 16 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'r0', 'r1', 'r3'], type: ['display', 'text', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } },
    version: { type: 'text', tier: 'primary', optional: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
    line: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 34 }, zh: { chars: 14 } } },
    install: { type: 'code', tier: 'primary', limits: { en: { chars: 34 }, zh: { chars: 34 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'r0', 'r1', 'r3'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], answer: true, form: 'cut', seed: 20261019 }),
  plan(s, ctx) {
    const { B, beats, flip } = timing(s, ctx);
    return { beats, reads: [{ text: s.name, lang: ctx.lang }, { text: s.line, lang: ctx.lang }, { text: s.install, lang: 'en' }], cues: [{ beat: 0, kind: 'hit' }, { beat: flip / B, kind: 'end' }],
      motion: 'ground flip on the last downbeat', settled: 2, peakAt: 0, pause: beats - 4, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, full = s.version ? `${s.name} ${s.version}` : s.name;
    const z = fitSize(cv, full, 'display', L, SZ.name, SZ.nameMin);
    return { z, nameW: widthOf(cv, s.name + ' ', F('display', L, z), L), fullW: widthOf(cv, full, F('display', L, z), L), ...timing(s, c) };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), L = c.lang, C = s.colors, B = D.B;
    const frame = (g, gr) => {
      const col = onGround(C, gr), f = F('display', L, D.z);
      fillGround(g, groundHex(C, gr));
      draw(g, s.name, X0, 600, f, col.text, L);
      if (s.version) draw(g, s.version, X0 + D.nameW, 600, f, s.answer && col.accent ? col.accent : col.text, L);
      rise(g, s.line, X0, 720, t, B, F('text', L, SZ.line), col.text, L);
      if (t >= 2 * B) text(g, typed(s.install, t, 2 * B, T.installCps), X0 + 4, 860, F('mono', L, SZ.install, 600), { color: col.quiet });
      grain(g, (s.seed || 1) + (gr === 'r0' ? 3 : 0), 0.05);
    };
    if (t < D.flip) frame(ctx, 'r1');
    else if (t < D.flip + T.apSec) { frame(ctx, 'r1'); ctx.save(); aperture(ctx, s.form === 'round' ? 'circle' : 'band', (t - D.flip) / T.apSec, [X0 + D.fullW / 2, 600 - D.z * 0.36]); frame(ctx, 'r0'); ctx.restore(); }
    else frame(ctx, 'r0');
  },
  track(u, s, c, D) { return [[X0 + D.fullW / 2, 600 - D.z * 0.36]]; },
  blur() { return false; },
};

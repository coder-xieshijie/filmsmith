// cursor-close — the closing card: the wordmark rises at the face's normal width and carries no dot; the URL or
// command types under it at 120 characters a second with a block cursor; on the next beat after it is typed the dot
// drops the last 46 px into the cursor's place and lands (contact frame), resting there as the cursor; a mono licence
// line types under it on beat 1; on the last downbeat the dot hops in place and lands again.
// From the ink template's `cta` (assets/templates/ink/film.js layoutScenes cta, drawScene cta; timing.rules.js
// ctaTimes, ctaUrl .25, ctaLine 1, urlHoldSec 3, ctaLandGapSec .15): wordmark 210 (floor 130) at y 590, command
// IBM Plex Mono 600 40 px at y 700, licence 28 px at y 770, the cursor dot r 16. After a portal the wordmark is
// already at rest (`risen: true`: it was the far side of the counter).
import { canvasOf, measure } from '../../../handoffs/util.js';
import { graphemes } from '../../lang.js';
import { MAXW, URL_SIZE, LABEL, secs, word, label, fill, camera, applyCam, grain, fitSize, M, disp, clamp, landSq } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { name: 'cleave', url: 'cleave run --good v2.3 -- npm test', line: 'MIT  /  runs in any CI' }, zh: { name: 'cleave', url: 'cleave run --good v2.3 -- npm test', line: 'MIT  /  任何 CI 都能跑' } };
const times = (s, B) => { const urlAt = 0.25 * B, typed = urlAt + graphemes(s.url).length / 120; return { urlAt, typed, land: Math.ceil((typed + 0.15) / B - 1e-9) * B }; };
export default {
  id: 'cursor-close', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 6, max: 16 },
  needs: { motions: [], props: ['ink-dot'], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 12 }, zh: { chars: 5 } } },
    url: { type: 'code', tier: 'primary', limits: { en: { chars: 44 }, zh: { chars: 44 } } },
    line: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 30 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], risen: false, seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T0 = times(s, B), need = Math.max(T0.land + 3, B + readTime(`${s.name} ${s.line || ''}`, ctx.lang)) + B;
    const beats = clamp(Math.ceil(need / B - 1e-9), 6, 16);
    return { beats, reads: [{ text: s.name, lang: ctx.lang }, { text: s.url, lang: 'en' }, ...(s.line ? [{ text: s.line, lang: ctx.lang, tier: 'glance' }] : [])], cues: [{ beat: 0, kind: 'drop' }, { beat: T0.land / B, kind: 'bell' }, { beat: beats - 4, kind: 'land' }], motion: 'the dot becomes the cursor', settled: T0.land / B, peakAt: T0.land / B, pause: 0, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, B = 60 / c.bpm, beats = this.plan(s, c).beats;
    const z = fitSize(cv, s.name, L, 210, 130, MAXW, 'normal');
    const full = measure(cv, s.url, M(URL_SIZE, 'en', 600)).width, r = 16, gap = 8, ux = 960 - (gap + 2 * r) / 2;
    return { z, B, beats, ux, cursor: { x: ux + full / 2 + gap + r, y: 700 - URL_SIZE * 0.325, r }, ...times(s, B), lastDown: (beats - 4) * B };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang;
    fill(ctx, C.ground);
    applyCam(ctx, camera(t, s.risen ? [] : [0]));
    word(ctx, { text: s.name, raw: true, x: 960, align: 'center', y: 590, size: D.z, stretch: 'normal', kind: 'mark', lang: L, mode: 'rise', tIn: s.risen ? -10 : 0, outMode: 'none', color: C.ink, stagger: 0.025, mis: false }, t, C);
    label(ctx, { text: s.url, x: D.ux, align: 'center', y: 700, tIn: D.urlAt, color: C.ink, size: URL_SIZE, weight: 600, cps: 120, cursorUntil: D.land, raw: true }, t, 'en');
    if (s.line) label(ctx, { text: s.line, x: 960, align: 'center', y: 770, tIn: D.B, color: C.dim, size: LABEL }, t, L);
    if (t >= D.land - 0.18) {
      const cu = D.cursor; let y = cu.y, q = 0, a = 1;
      if (t < D.land) { const p = clamp((t - (D.land - 0.18)) / 0.18); y = cu.y - 46 * (1 - p * p); a = clamp(p / 0.4); }
      else {
        q = landSq(t - D.land);
        const h0 = D.lastDown - 0.3;
        if (D.lastDown > D.land + 0.3 && t >= h0) { const p = clamp((t - h0) / 0.3); if (p < 1) { y = cu.y - 36 * 4 * p * (1 - p); q = 0; } else q = landSq(t - D.lastDown); }
      }
      ctx.save(); ctx.globalAlpha = a; ctx.translate(cu.x, y + cu.r); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, -cu.r, cu.r, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[D.cursor.x, D.cursor.y]]; },
  blur() { return false; },
};

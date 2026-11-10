// width-name — the drop on the name: the accent field, the name rising out of it on the downbeat in the face's normal
// width, then its width jumping on every beat from beat 2 (condensed, semi-condensed, extra-condensed,
// semi-condensed, normal) with a punch-in on each; a mono label types under it at beat 0.5 and a second at 4.5 once the
// first is read; from beat 5 a hairline playhead with the dot on it runs under the name to the scene's end.
// From the ink template's `name` (assets/templates/ink/film.js layoutScenes name, namePlayhead; plan.js widthSteps,
// playFrom; timing.rules.js nameLabel .5, nameLabel2 4.5). Chinese: the width jumps are 长体 jumps (look.type.zhWidth;
// motion/width-jump), the same five steps as horizontal scales of Noto Sans SC 900.
import { canvasOf } from '../../../handoffs/util.js';
import { readTime } from '../../lang.js';
import { LABEL, T, secs, word, label, fill, camera, applyCam, grain, fitSize, widthOf, D as DF, disp, clamp, mix, cubicInOut, MAXW, landSq, tl } from '../../look/paper-slam/kit.js';
import LOOK from '../../look/paper-slam/look.js';

const JUMPS = LOOK.type.stretch.jumps;
const DEFAULT = { en: { name: 'cleave', labels: ['finds the commit', 'that broke main'] }, zh: { name: '二分侠', labels: ['找出那次提交', '是它弄坏了主干'] } };
export const stretchAt = (t, B) => { let v = 'normal'; [2, 3, 4, 5, 6].forEach((b, k) => { if (t >= b * B - 0.03) v = JUMPS[k]; }); return v; };
export default {
  id: 'width-name', kind: 'scene',
  fits: ['climax', 'lockup'],
  surface: ['canvas'],
  beats: { min: 7, max: 10 },
  needs: { motions: ['width-jump'], props: ['ink-dot'], roles: ['accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
    labels: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 20 }, zh: { chars: 8 } } } },
  },
  roles: ['accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, ls = s.labels || [], l2 = ls[1] ? Math.max(4.5 * B, 0.5 * B + readTime(`${s.name} ${ls[0]}`, ctx.lang)) : 0;
    const need = Math.max(8 * B, l2 + (ls[1] ? readTime(ls[1], ctx.lang) : 0));
    return { beats: clamp(Math.ceil(need / B - 1e-9), 7, 10), reads: [{ text: s.name, lang: ctx.lang }, ...ls.map((l) => ({ text: l, lang: ctx.lang }))], cues: [{ beat: 0, kind: 'drop' }, ...[2, 3, 4, 5, 6].map((b) => ({ beat: b, kind: 'tick' }))], motion: 'width-jump', settled: 6, peakAt: 0, pause: 0, lead: 0 };
  },
  validate() { return []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, B = 60 / c.bpm, ls = s.labels || [];
    const z = Math.min(...['normal', ...JUMPS].map((st) => fitSize(cv, s.name, L, 225, 140, MAXW, st)));
    const l2 = ls[1] ? Math.max(4.5 * B, 0.5 * B + readTime(`${s.name} ${ls[0]}`, L)) : null;
    return { z, B, l2, beats: this.plan(s, c).beats, cv };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, end = D.beats * B, st = stretchAt(t, B), ink = C.onAccent;
    fill(ctx, C.accent);
    applyCam(ctx, camera(t, [0, ...[2, 3, 4, 5, 6].map((b) => b * B)]));
    word(ctx, { text: s.name, raw: true, x: 960, y: 610, size: D.z, align: 'center', stretch: st, kind: 'mark', lang: L, mode: 'rise', tIn: 0, outMode: 'none', color: ink, stagger: 0.03, mis: false }, t, C);
    const ls = s.labels || [];
    if (ls[0]) label(ctx, { text: ls[0], x: 960, align: 'center', y: 720, tIn: 0.5 * B, tOut: D.l2 ?? end - T.labelEarlySec, color: ink }, t, L);
    if (ls[1]) label(ctx, { text: ls[1], x: 960, align: 'center', y: 720, tIn: D.l2, tOut: end - T.labelEarlySec, color: ink }, t, L);
    if (t >= 5 * B) {
      const w = widthOf(ctx, s.name, DF(D.z, tl(s.name, L), st, 'mark'), L), x0 = 960 - w / 2, x1 = 960 + w / 2;
      const p = cubicInOut(clamp((t - 5.5 * B) / (end - 0.02 - 5.5 * B))), a = clamp((t - 5 * B) / 0.12), x = x0 + (x1 - x0) * p;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ink; ctx.fillRect(x0, 780, x1 - x0, 3);
      const q = landSq(t - 5 * B); ctx.translate(x, 781); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[960, 540]]; },
  blur() { return false; },
};

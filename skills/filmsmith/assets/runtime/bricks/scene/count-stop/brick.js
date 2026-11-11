// count-stop — the number, on night: one or two values centred, each entering on a bar; a value with digits rolls up
// over a beat in its own final glyph slots (nothing shifts), its full stop waiting at the end of the final width and
// landing when the value completes; its mono label types above a three-quarter beat later; to a second value the stop
// hops (0.3 s arc, 120 px) to the next value's end; a resting stop bounces on the beats.
// From the ink template's `counter` (assets/templates/ink/film.js layoutScenes counter, drawScene counter;
// timing.rules.js counterStarts, counterRoll 1, counterHopSec .3, labelAfter .75): 280 (floor 180) at y 640, labels
// at y 300, tracking −0.01 em. `motion/digit-roll` is a reel odometer; this roll counts in place, the template's.
import { canvasOf, measure, text } from '../../../handoffs/util.js';
import { secs, word, label, fill, camera, applyCam, grain, fitSize, advances, D as DF, disp, clamp, MAXW, landSq, bounceY, cubicInOut } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = { en: { items: [{ value: '12', label: 'builds, not 4096' }] }, zh: { items: [{ value: '12', label: '次构建，不是 4096' }] } };
const timesOf = (s, ctx) => {
  const B = 60 / ctx.bpm, bar = 4 * B, out = []; let t = 0;
  (s.items || []).forEach((it) => {
    const roll = /\d/.test(it.value), landed = roll ? B : 0, labelAt = landed + 0.75 * B;
    const need = Math.max(landed + readTime(it.value, ctx.lang), it.label ? labelAt + readTime(it.label, ctx.lang) : 0);
    out.push({ t, roll, landed: t + landed, labelAt: t + labelAt, need });
    t = Math.max(t + bar, Math.ceil((t + need + 0.3) / bar - 1e-9) * bar);
  });
  return { B, out, end: out.length ? out[out.length - 1].t + out[out.length - 1].need : 0 };
};
export default {
  id: 'count-stop', kind: 'scene',
  fits: ['proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: [], props: ['ink-dot'], roles: ['night', 'nightInk', 'nightAccent'], type: ['display', 'mono'] },
  slots: { items: { type: 'list', count: [1, 2], of: { value: { type: 'text', tier: 'word', limits: { en: { chars: 7 }, zh: { chars: 7 } } }, label: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 5, chars: 24 }, zh: { chars: 10 } } } } } },
  roles: ['night', 'nightInk', 'nightAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], seed: 20261018 }),
  plan(s, ctx) {
    const T0 = timesOf(s, ctx);
    return { beats: clamp(Math.ceil(T0.end / T0.B - 1e-9), 4, 12), reads: s.items.flatMap((it) => [{ text: it.value, lang: ctx.lang }, ...(it.label ? [{ text: it.label, lang: ctx.lang }] : [])]), cues: T0.out.flatMap((o) => [{ beat: o.t / T0.B, kind: o.roll ? 'tick' : 'land' }, ...(o.roll ? [{ beat: (o.landed) / T0.B, kind: 'land' }] : [])]), motion: 'count in place', settled: T0.out[0].landed / T0.B, peakAt: T0.out[0].landed / T0.B, pause: 0, lead: 0 };
  },
  validate(s) { const n = (s.items || []).length; return n < 1 || n > 2 ? ['items: 1 or 2'] : []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, T0 = timesOf(s, c);
    const z = Math.min(...s.items.map((it) => fitSize(cv, it.value, L, 280, 180, MAXW - 120)));
    const f = { ...DF(z, L), spacing: -0.01 * z };
    const items = s.items.map((it, k) => { const a = advances(cv, it.value, f, L), w = a.xs[a.xs.length - 1] - f.spacing, x0 = 960 - w / 2, r = z * 0.062; return { ...it, ...T0.out[k], xs: a.xs, x0, stop: { x: x0 + w + z * 0.05 + r, y: 640 - r }, r }; });
    const beats = this.plan(s, c).beats, rests = []; for (let b = 1; b < beats; b++) rests.push(b * T0.B);
    return { z, f, items, B: T0.B, beats, rests };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), C = s.colors, L = c.lang, B = D.B, end = D.beats * B;
    fill(ctx, C.night);
    applyCam(ctx, camera(t, D.items.map((it) => it.t)));
    let cur = D.items[0]; D.items.forEach((it) => { if (t >= it.t) cur = it; });
    const k = D.items.indexOf(cur), nx = D.items[k + 1], tOut = nx ? nx.t : end + 1;
    if (cur.label) label(ctx, { text: cur.label, x: 960, align: 'center', y: 300, tIn: cur.labelAt, tOut, color: C.nightInk }, t, L);
    if (cur.roll) {
      const p = 1 - Math.pow(1 - clamp((t - cur.t) / B), 3);
      const txt = cur.value.replace(/\d+/g, (m) => String(Math.round(Number(m) * p)).padStart(m.length, ' '));
      const g = [...txt];
      g.forEach((ch, j) => { if (ch !== ' ') text(ctx, ch, cur.x0 + (cur.xs[j] + cur.xs[j + 1]) / 2, 640, { ...D.f, spacing: 0 }, { color: C.nightInk, align: 'center' }); });
    } else word(ctx, { text: cur.value, x: 960, y: 640, size: D.z, align: 'center', lang: L, mode: 'slam', tIn: cur.t, outMode: 'none', color: C.nightInk, stagger: 0.02 }, t, C);
    let p = cur.stop, r = cur.r, by = 0;
    if (nx && t >= nx.t - 0.3) { const e = cubicInOut(clamp((t - (nx.t - 0.3)) / 0.3)), uu = clamp((t - (nx.t - 0.3)) / 0.3); p = { x: p.x + (nx.stop.x - p.x) * e, y: p.y + (nx.stop.y - p.y) * e - 120 * 4 * uu * (1 - uu) }; r = r + (nx.r - r) * e; }
    else by = t > cur.landed + 0.3 ? bounceY(t, D.rests.filter((a) => a > cur.landed + 0.3), 70) : 0;
    if (t >= cur.landed - 1e-6 || nx) {
      const q = by ? 0 : landSq(t - cur.landed);
      ctx.save(); ctx.translate(p.x, p.y + r + by); ctx.scale(1 + q, 1 - q); ctx.beginPath(); ctx.arc(0, -r, r, 0, Math.PI * 2); ctx.fillStyle = C.nightAccent; ctx.fill(); ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[960, 560]]; },
  blur() { return false; },
};

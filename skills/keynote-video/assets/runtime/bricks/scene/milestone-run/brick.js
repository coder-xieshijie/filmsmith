// milestone-run — a release history as a journey along a time axis: the camera starts slow, sprints along the axis
// past the milestones and brakes hard on the last one, then pushes in; each milestone's card springs up from its tick
// just before the camera reaches it, so history flashes past and "now" is where the film stops.
// Adapted from video-shotcraft demos/data/timeline-travel/TimelineTravel.tsx (card references/shots/data/timeline-travel.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); colours by role (the last milestone in the
// accent, the rest ink, dim and line); brand, header and milestone copy removed (every word is a slot, illustrative by
// default); 3–5 milestones; card text sized to the information floors (25 px, Chinese 28 px) and wrapped by lang.js;
// the travel's motion blur is the runtime's sub-frames from the axis speed. The travel curve (slow 15 %, sprint, brake
// in the last 12 %, then a 1.28× push) is a candidate for camera-truck's `travel` variant (batch 7 variants).
import { clamp, lerp, mix, rgba, rrect, text, measure, ground } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { fontFor, wrap, units, readTime } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { spring } from '../../motion/digit-roll/brick.js';

const F0 = 12, TRAVEL = [12, 104], ZOOM_END = 114, AXIS_Y = 700, GAP = 1400, CARD = { w: 400, h: 260 }, STEM = 36;
const ORIGIN = [960, 1080 * 0.62];
const inOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
// piecewise travel: [0, .15, .88, 1] → [0, .055, .9, 1], each piece in-out quad
const travel = (t) => {
  const K = [[0, 0], [0.15, 0.055], [0.88, 0.9], [1, 1]];
  t = clamp(t);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [a, va] = K[i - 1], [b, vb] = K[i]; return va + (vb - va) * inOutQuad((t - a) / (b - a)); }
  return 1;
};
const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
const STOP = {
  label: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } },
  date: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 8 }, zh: { chars: 5 } } },
  title: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
  desc: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 40 }, zh: { chars: 20 } } },
  metric: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 20 }, zh: { chars: 8 } } },
};
const DEFAULT = {
  en: { eyebrow: 'Milestones · illustrative', headline: 'A new version every two months', stops: [
    { label: 'v1', date: 'Mar', title: 'First draft', desc: 'One template and a gallery of shots.', metric: '12 shots' },
    { label: 'v2', date: 'May', title: 'On the beat', desc: 'Every cut lands on the music.', metric: 'Beat grid' },
    { label: 'v3', date: 'Jul', title: 'Review pages', desc: 'Every cut checked before it ships.', metric: 'One link' },
    { label: 'Today', date: 'Sep', title: 'Ship the cut', desc: 'You direct the film, the tools shoot it.', metric: 'One prompt' }] },
  zh: { eyebrow: '里程碑 · 示意', headline: '每两个月发一版', stops: [
    { label: 'v1', date: '3 月', title: '第一版', desc: '一个模板和一组镜头。', metric: '12 个镜头' },
    { label: 'v2', date: '5 月', title: '踩上拍点', desc: '每一刀都落在音乐上。', metric: '节拍网格' },
    { label: 'v3', date: '7 月', title: '审阅页', desc: '每一版发布前都检查过。', metric: '一个链接' },
    { label: '今天', date: '9 月', title: '发出那一版', desc: '你来导演，工具来拍。', metric: '一句提示' }] },
};

export default {
  id: 'milestone-run', kind: 'scene',
  fits: ['proof', 'demo', 'turn'],
  surface: ['canvas'],
  beats: { min: 8, max: 12 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 28 }, zh: { chars: 10 } } },
    headline: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 32 }, zh: { chars: 14 } } },
    stops: { type: 'list', count: [3, 5], of: STOP },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'A release history as a journey: the camera sprints along a time axis past milestone cards that spring up as it reaches them, brakes hard on the last one and pushes in.',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'] }),
  // beats: the travel and its push (to frame 110 at 120 BPM, the last card upright), then the last title read
  plan(s, ctx) {
    const last = s.stops[s.stops.length - 1], read = readTime(last.title, ctx.lang);
    const beats = clamp(Math.ceil(6.5 + read * (ctx.bpm / 60)), 8, 12);
    return { beats, reads: [{ text: s.headline, lang: ctx.lang }, { text: last.title, lang: ctx.lang }],
      cues: s.stops.map((_, i) => ({ beat: (this.popFrame(i, s.stops.length) - F0) / 15, kind: i === s.stops.length - 1 ? 'land' : 'accent' })),
      motion: 'camera travel along the axis', settled: (ZOOM_END - F0) / 15, peakAt: (TRAVEL[1] - F0) / 15, pause: beats - (ZOOM_END - F0) / 15 };
  },
  validate(s, ctx) {
    const err = [], n = (s.stops || []).length, lim = (v, l) => !v || units(v, ctx.lang) <= (ctx.lang === 'zh' ? l.zh.chars : l.en.words);
    if (n < 3 || n > 5) err.push('stops: 3 to 5 milestones');
    (s.stops || []).forEach((st, i) => { for (const k of Object.keys(STOP)) if (!lim(st[k], STOP[k].limits)) err.push(`stops[${i}].${k} too long`); });
    return err;
  },
  camX(f, n) { return travel((f - TRAVEL[0]) / (TRAVEL[1] - TRAVEL[0])) * (n - 1) * GAP; },
  popFrame(i, n) { for (let f = TRAVEL[0]; f <= TRAVEL[1]; f++) if (this.camX(f, n) >= i * GAP) return f - 6; return TRAVEL[1] - 6; },
  view(u, n) { const f = F0 + u * 15; return { f, camX: this.camX(f, n), zoom: lerp(1, 1.28, cubicOut((f - TRAVEL[1]) / (ZOOM_END - TRAVEL[1]))) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, n = s.stops.length, V = this.view(u, n), f = V.f;
    ground(ctx, s);
    // far layer: each milestone's label, huge and faint, at 0.35× the speed, only near its own stop
    ctx.save(); ctx.translate(ORIGIN[0], ORIGIN[1]); const zf = 1 + (V.zoom - 1) * 0.35; ctx.scale(zf, zf); ctx.translate(-ORIGIN[0], -ORIGIN[1]);
    const ff = fontFor(look, 'display', L, 280, 800, 'display');
    s.stops.forEach((st, i) => { const d = Math.abs(V.camX - i * GAP) / GAP, op = Math.max(0, 1 - d / 0.62); if (op > 0) text(ctx, st.date, 960 + i * GAP * 0.35 - V.camX * 0.35, 210 + 230, ff, { color: rgba(C.ink, 0.05 * op), align: 'center' }); });
    ctx.restore();
    // the world: the axis, minor ticks, stops; one translate, pushed in after the brake
    ctx.save(); ctx.translate(ORIGIN[0], ORIGIN[1]); ctx.scale(V.zoom, V.zoom); ctx.translate(-ORIGIN[0], -ORIGIN[1]); ctx.translate(-V.camX, 0);
    const W = 960 + GAP * (n - 1) + 960, ax = ctx.createLinearGradient(200, 0, W - 200, 0);
    ax.addColorStop(0, rgba(C.ink, 0)); ax.addColorStop(0.04, rgba(C.ink, 0.22)); ax.addColorStop(0.96, rgba(C.ink, 0.22)); ax.addColorStop(1, rgba(C.ink, 0));
    ctx.fillStyle = ax; ctx.fillRect(200, AXIS_Y - 1, W - 400, 2);
    ctx.fillStyle = rgba(C.ink, 0.2);
    for (let i = 0; i <= (n - 1) * 5 + 2; i++) if (i % 5) rrect(ctx, 960 + i * (GAP / 5) - 1, AXIS_Y - 9, 2, 18, 1), ctx.fill();
    const lf = fontFor(look, 'display', L, 40, 720, 'display'), df = fontFor(look, 'text', L, infoSize(L) + 3, 500);
    s.stops.forEach((st, i) => {
      const x = 960 + i * GAP, hero = i === n - 1, pop = D.pops[i], k = spring(f - pop, { stiffness: 160, damping: 11, mass: 0.9, dur: 26 });
      const lit = clamp((f - pop) / 6), ink = hero ? C.accent : C.ink;
      ctx.beginPath(); ctx.arc(x, AXIS_Y, 16 * (0.6 + 0.4 * lit), 0, Math.PI * 2); ctx.fillStyle = rgba(ink, hero ? 0.16 : 0.07); ctx.fill();
      ctx.beginPath(); ctx.arc(x, AXIS_Y, 6.5, 0, Math.PI * 2); ctx.fillStyle = lit > 0.5 ? ink : C.ground; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
      text(ctx, st.label, x, AXIS_Y + 84, lf, { color: hero ? C.accent : C.ink, align: 'center' });
      text(ctx, st.date, x, AXIS_Y + 124, df, { color: C.dim, align: 'center' });
      if (f < pop) return;
      const h = STEM * Math.min(1, k);
      ctx.fillStyle = rgba(ink, hero ? 0.5 : 0.22); ctx.fillRect(x - 0.5, AXIS_Y - 8 - h, 1, h);
      ctx.save(); ctx.translate(x, AXIS_Y - 8 - STEM); ctx.scale(0.85 + 0.15 * k, Math.max(0.001, k)); ctx.globalAlpha = Math.min(1, k * 2);
      this.card(ctx, st, hero, -CARD.w / 2, -CARD.h, C, L);
      ctx.restore();
    });
    ctx.restore();
    // the header: fixed
    const ef = fontFor(look, 'mono', L, infoSize(L), 650, 'label'), hf = fontFor(look, 'display', L, 56, 720, 'display');
    if (s.eyebrow) text(ctx, s.eyebrow, 120, 126, ef, { color: C.accent });
    if (s.headline) text(ctx, s.headline, 120, 196, hf, { color: C.ink });
  },
  card(ctx, st, hero, x, y, C, L) {
    ctx.save();
    ctx.shadowColor = rgba(mix(C.ink, '#000000', 0.5), hero ? 0.18 : 0.1); ctx.shadowBlur = hero ? 36 : 18; ctx.shadowOffsetY = hero ? 14 : 6;
    rrect(ctx, x, y, CARD.w, CARD.h, 18); ctx.fillStyle = hero ? mix(C.panel, C.accent, 0.04) : C.panel; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5; ctx.strokeStyle = hero ? rgba(C.accent, 0.4) : C.line; ctx.stroke();
    const cf = fontFor(look, 'mono', L, 22, 650), sf = fontFor(look, 'text', L, infoSize(L), 500);
    const cw = measure(ctx, st.label, cf).width + 24;
    rrect(ctx, x + 26, y + 24, cw, 34, 8); ctx.fillStyle = hero ? C.accent : mix(C.panel, C.ink, 0.06); ctx.fill();
    text(ctx, st.label, x + 38, y + 42, cf, { color: hero ? C.onAccent : C.dim, baseline: 'middle' });
    text(ctx, st.date, x + CARD.w - 26, y + 50, sf, { color: C.dim, align: 'right' });
    const tf = fontFor(look, 'display', L, 34, 700, 'display');
    text(ctx, st.title, x + 26, y + 108, tf, { color: C.ink });
    wrap(ctx, st.desc || '', sf, CARD.w - 52, L).slice(0, 2).forEach((line, i) => text(ctx, line, x + 26, y + 150 + i * (L === 'zh' ? 36 : 31), sf, { color: mix(C.ink, C.dim, 0.5) }));
    if (st.metric) {
      ctx.beginPath(); ctx.arc(x + 30, y + CARD.h - 32, 4, 0, Math.PI * 2); ctx.fillStyle = hero ? C.accent : C.line; ctx.fill();
      text(ctx, st.metric, x + 44, y + CARD.h - 23, fontFor(look, 'text', L, infoSize(L), 600), { color: hero ? C.accent : C.dim });
    }
    ctx.restore();
  },
  prepare(s) { const n = s.stops.length; return { pops: s.stops.map((_, i) => this.popFrame(i, n)) }; },
  blur() { return true; },
  // the first and the last tick on screen (compare pairs them with the upstream nodes)
  track(u, s) {
    const n = s.stops.length, V = this.view(u, n), at = (x) => [ORIGIN[0] + (x - V.camX - ORIGIN[0]) * V.zoom, ORIGIN[1] + (AXIS_Y - ORIGIN[1]) * V.zoom];
    return [at(960), at(960 + (n - 1) * GAP)];
  },
};

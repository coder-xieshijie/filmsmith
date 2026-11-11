// versus — two sides of a comparison slam together: a question stands on the ground while a seam is drawn through it,
// the two halves (one in the ink, one in the accent, each with its number) rush in from the frame's sides and shut on
// the seam with a flash and a shake, a stamp presses the mark between them, and each side's line and list rise in.
// Adapted from video-shotcraft demos/transition/transition-hidden-cut/VersusSlam.tsx (card references/shots/transition/transition-hidden-cut.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion) over the hand-off split-open's `close` variant
// (the seam drawn on, the ease-in slam, the flash and the shake are its own; the halves are its next content, a frame-
// filling window whose bar is off frame); the seam is split-open's vertical one instead of the upstream's 78° slant;
// colours by role (left side the ink role with ground type, right side the accent with onAccent type, stamp and verdict
// in paper with an onPaper rim); brand, mark and every word removed (question, the two sides, the stamp's mark and the
// verdict are slots); the gap the question leaves in the seam, the shock ring and twelve speed lines (16 and 7
// frames), the stamp (spring, damping 12, from 1.9× and −8°), the captions 8 and the lists 14 frames after the hit (the
// right side 4 frames later), the verdict at hit + 26 and the 1 → 1.015 push are the upstream's.
import { clamp, mix, rgba, rrect, text, measure, canvasOf } from '../../../handoffs/util.js';
import { buildModule } from '../../index.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, caseOf, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { springAt, riseText } from '../../motion/stagger-in/brick.js';
import SPLIT_OPEN from '../../../handoffs/split-open.js';   // the runtime hand-off, with its close variant

const HIT = 28, SPAN = 45, RUN = 0.4, WIN = { x: -12, y: -54, w: 1944, h: 1104 }, PAD = 120, RX = 1190;
const merge = (a, b) => { const o = { ...a }; for (const [k, v] of Object.entries(b || {})) o[k] = v && typeof v === 'object' && !Array.isArray(v) && !(v.image) && a?.[k] && typeof a[k] === 'object' ? merge(a[k], v) : v; return o; };
const splitOpen = async () => SPLIT_OPEN;
const SIDE = {
  name: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 7 } } },
  value: { type: 'number', claim: true, limits: { en: { chars: 3 }, zh: { chars: 3 } } },
  unit: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 7 }, zh: { chars: 3 } } },
  caption: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 46 }, zh: { chars: 13 } } },
  items: { type: 'list', count: [0, 4], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 4 } } } },
};
const DEFAULT = {
  en: { eyebrow: 'Two ways to ship', question: 'What does a cut take?', mark: 'VS', verdict: 'Ship the cut you meant',
    sides: [{ name: 'By hand', value: '14', unit: 'days', caption: 'Drafts, reviews and three rounds of fixes.', items: ['Draft', 'Review', 'Fix', 'Repeat'] },
      { name: 'With Tidewell', value: '1', unit: 'prompt', caption: 'One line in, a checked cut out.', items: ['Shots chosen', 'On beat'] }] },
  zh: { eyebrow: '两种做法', question: '一版成片要多久？', mark: 'VS', verdict: '发出你想要的那一版',
    sides: [{ name: '手工', value: '14', unit: '天', caption: '起稿、审阅，再改三轮。', items: ['起稿', '审阅', '修改', '重来'] },
      { name: '用 Tidewell', value: '1', unit: '句话', caption: '一句话进去，成片出来。', items: ['镜头选好', '剪点踩拍'] }] },
};

export default {
  id: 'versus', kind: 'scene',
  fits: ['problem', 'turn', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 10 },
  needs: { motions: ['split-open'], props: [], roles: ['ground', 'ink', 'dim', 'accent', 'onAccent', 'paper', 'onPaper'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 8 } } },
    question: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 9 } } },
    sides: { type: 'list', count: [2, 2], of: SIDE },
    mark: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 3 }, zh: { chars: 2 } } },
    verdict: { type: 'text', tier: 'primary', claim: true, optional: true, limits: { en: { words: 7, chars: 40 }, zh: { chars: 16 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'onAccent', 'paper', 'onPaper'],
  summary: 'Two sides of a comparison slam together over a question: ink half against accent half, each with its number, a flash, a shake and a stamp between them.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  frames(s, lang) { const read = s.sides.reduce((a, d) => a + readTime(`${d.value} ${d.unit} ${d.caption}`, lang), 0) + (s.verdict ? readTime(s.verdict, lang) : 0); return Math.max(105, HIT + 26 + Math.ceil(read * 30 * 0.6)); },
  plan(s, ctx) {
    const beats = clamp(Math.ceil(this.frames(s, ctx.lang) / 15), 6, 10);
    return { beats, reads: [{ text: s.question, lang: ctx.lang }, ...s.sides.map((d) => ({ text: `${d.value} ${d.unit}`, lang: ctx.lang })), ...(s.verdict ? [{ text: s.verdict, lang: ctx.lang }] : [])],
      cues: [{ beat: 18 / 15, kind: 'turn' }, { beat: HIT / 15, kind: 'land' }, { beat: (HIT + 26) / 15, kind: 'accent' }],
      motion: 'split-open close with impact', settled: (HIT + 44) / 15, peakAt: HIT / 15, pause: beats - (HIT + 44) / 15 };
  },
  validate(s) { return (s.sides || []).length === 2 ? [] : ['sides: exactly two']; },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  async prepare(s) {
    const c = s.colors, m = await splitOpen();
    const from = canvasOf(WIN.w, WIN.h), to = canvasOf(WIN.w, WIN.h);
    const fg = from.getContext('2d'); fg.fillStyle = c.ground; fg.fillRect(0, 0, WIN.w, WIN.h);
    const v = fg.createRadialGradient(WIN.w / 2, WIN.h * 0.45, 200, WIN.w / 2, WIN.h * 0.45, 1300); v.addColorStop(0, rgba(c.ground, 0)); v.addColorStop(1, rgba(mix(c.ground, '#000000', 0.5), 0.14)); fg.fillStyle = v; fg.fillRect(0, 0, WIN.w, WIN.h);
    this.paintSides(to.getContext('2d'), s);
    const P = merge(m.defaults, { window: WIN, from: { asset: { image: from } }, to: { asset: { image: to } }, close: true, impact: true, hit: 0.62, run: RUN, colors: { ...c, key: c.paper || c.panel } });
    const D = m.prepare(P);
    return { b: buildModule(m, P, D) };
  },
  // the two halves the slam brings in (in the window's content px: x on screen + 12): name, number and unit of each side
  paintSides(g, s) {
    const c = s.colors, L = s.lang, ox = -WIN.x;
    const sideFill = [c.ink, c.accent], sideOn = [c.ground, c.onAccent || c.panel];
    [0, 1].forEach((k) => {
      const x0 = k ? 960 + ox : 0, w = k ? WIN.w - 960 - ox : 960 + ox;
      const gr = g.createRadialGradient(x0 + w * (k ? 0.85 : 0.18), 110, 40, x0 + w * (k ? 0.85 : 0.18), 110, 1300);
      gr.addColorStop(0, mix(sideFill[k], '#FFFFFF', 0.06)); gr.addColorStop(0.6, sideFill[k]); gr.addColorStop(1, mix(sideFill[k], '#000000', 0.18));
      g.fillStyle = gr; g.fillRect(x0, 0, w, WIN.h);
      const d = s.sides[k], x = (k ? RX : PAD) + ox, on = sideOn[k];
      const nf = this.F(s, 'text', L === 'zh' ? 30 : 30, 800, 'label'), nm = caseOf(d.name, s.look || NEUTRAL, 'label', L);
      if (k) { g.beginPath(); g.arc(x + 8, 140, 8, 0, Math.PI * 2); g.fillStyle = rgba(on, 0.85); g.fill(); } else { g.fillStyle = rgba(on, 0.7); g.fillRect(x, 132, 16, 16); }
      text(g, nm.text, x + 32, 151, { ...nf, spacing: nm.tracking * nf.size }, { color: rgba(on, 0.78) });
      const vf = this.F(s, 'display', 360, 800, 'display'), uf = this.F(s, 'display', L === 'zh' ? 88 : 96, 800, 'display');
      text(g, d.value, x - 14, 196 + 330, vf, { color: on });
      text(g, d.unit, x - 14 + measure(g, d.value, vf).width + 22, 196 + 330, uf, { color: on });
    });
  },
  // the captions and lists rising after the hit (left first, right 4 frames later)
  details(ctx, f, s) {
    const c = s.colors, L = s.lang, on = [c.ground, c.onAccent || c.panel];
    [0, 1].forEach((k) => {
      const d = s.sides[k], x = k ? RX : PAD, cap = ramp(f, HIT + 8 + k * 4, 18, EASE.snappy), list = ramp(f, HIT + 14 + k * 4, 18, EASE.snappy);
      const cf = this.F(s, 'text', 44, 600);
      wrap(ctx, d.caption, cf, k ? 620 : 640, L).slice(0, 2).forEach((ln, i) => text(ctx, ln, x, 590 + 44 + i * 52 + (1 - cap) * 26, cf, { color: on[k], alpha: cap }));
      let ix = x;
      const lf = this.F(s, 'text', 32, 600), mf = this.F(s, 'mono', L === 'zh' ? 28 : 26, 500);
      (d.items || []).forEach((it, i) => {
        const mk = k ? '✓' : `0${i + 1}`, mw = measure(ctx, mk, mf).width, iw = measure(ctx, it, lf).width, y = 800 + 32 + (1 - list) * 20;
        text(ctx, mk, ix, y, mf, { color: rgba(on[k], k ? 0.62 : 0.4), alpha: list });
        text(ctx, it, ix + mw + 12, y, lf, { color: rgba(on[k], k ? 0.82 : 0.62), alpha: list });
        if (!k) { ctx.save(); ctx.globalAlpha = list; ctx.fillStyle = rgba(on[k], 0.62); ctx.fillRect(ix + mw + 12, y - 11, iw, 2); ctx.restore(); }
        ix += mw + 12 + iw + 30;
      });
    });
  },
  paint(ctx, u, s, cx, D) {
    const c = s.colors, f = u * 15, L = s.lang, b = D.b, p = clamp(f / SPAN), S = b.state(p), T = b.track(p), paper = c.paper || c.panel, rim = c.onPaper || c.ink;
    const push = 1 + 0.015 * ramp(f, HIT + 10, 105 - HIT - 10, EASE.smooth);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960, 540); ctx.scale(push, push); ctx.translate(-960, -540);
    if (f < HIT) {
      b.draw(ctx, p);
      // the question, between the incoming halves, over a band of ground that leaves a gap in the seam
      ctx.save(); ctx.beginPath(); ctx.rect(T[0][0], 0, Math.max(0, T[1][0] - T[0][0]), 1080); ctx.clip();
      const qf = this.F(s, 'display', L === 'zh' ? 112 : 124, 800, 'display'), lines = wrap(ctx, s.question, qf, 1600, L).slice(0, 1);
      ctx.fillStyle = c.ground; ctx.fillRect(960 - 8, 386 + 4, 16, 70 + qf.size * 1.15);
      if (s.eyebrow) { const ef = this.F(s, 'text', L === 'zh' ? 30 : 30, 800, 'label'), eb = caseOf(s.eyebrow, s.look || NEUTRAL, 'label', L); text(ctx, eb.text, 960, 386 + 30, { ...ef, spacing: eb.tracking * ef.size }, { color: c.accent, align: 'center', alpha: ramp(f, 0, 10, EASE.out) }); }
      lines.forEach((ln) => riseText(ctx, ln, 960, 386 + 60 + qf.size * 0.95, qf, { color: c.ink, lang: L, f, start: 1, each: 14, gap: 3, align: 'center' }));
      ctx.restore();
    } else {
      // after the hit: split-open's flash and shake, then the cut line, the ring and lines, the stamp, the details
      b.draw(ctx, p);
      const sx = S.sx || 0, sy = S.sy || 0, wave = ramp(f, HIT, 16, EASE.out), ln = ramp(f, HIT, 7, EASE.out), stamp = springAt(f - HIT, { damping: 12, stiffness: 260 });
      ctx.save(); ctx.translate(sx, sy);
      const cut = ctx.createLinearGradient(938, 0, 982, 0), shade = rgba(mix(c.ink, '#000000', 0.6), 0.35);
      cut.addColorStop(0, rgba(paper, 0)); cut.addColorStop(0.38, shade); cut.addColorStop(0.43, paper); cut.addColorStop(0.57, paper); cut.addColorStop(0.62, shade); cut.addColorStop(1, rgba(paper, 0));
      ctx.fillStyle = cut; ctx.fillRect(938, -20, 44, 1120);
      this.details(ctx, f, s);
      if (wave < 1) { const r = 130 + (640 - 130) * wave; ctx.beginPath(); ctx.arc(960, 540, r, 0, Math.PI * 2); ctx.lineWidth = 14 + (1 - 14) * wave; ctx.strokeStyle = rgba(paper, 0.85 * (1 - wave)); ctx.stroke(); }
      if (ln < 1) for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.26, r0 = 170 + 250 * ln, r1 = 260 + 460 * ln;
        ctx.beginPath(); ctx.moveTo(960 + Math.cos(a) * r0, 540 + Math.sin(a) * r0); ctx.lineTo(960 + Math.cos(a) * r1, 540 + Math.sin(a) * r1);
        ctx.lineCap = 'round'; ctx.lineWidth = 8 + (2 - 8) * ln; ctx.strokeStyle = rgba(paper, 1 - ln); ctx.stroke();
      }
      ctx.save(); ctx.translate(960, 540); ctx.rotate((-8 * (1 - stamp) * Math.PI) / 180); const k = 1.9 + (1 - 1.9) * stamp; ctx.scale(k, k); ctx.globalAlpha = Math.min(1, stamp * 4);
      ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.7), 0.5); ctx.shadowBlur = 50; ctx.shadowOffsetY = 26;
      ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.fillStyle = paper; ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.arc(0, 0, 126, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = rim; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 110, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = rgba(rim, 0.35); ctx.stroke();
      text(ctx, s.mark, -6, 4, this.F(s, 'display', L === 'zh' ? 112 : 124, 800, 'display'), { color: rim, align: 'center', baseline: 'middle' });
      ctx.restore();
      if (s.verdict) {
        const v = ramp(f, HIT + 26, 18, EASE.snappy), vf = this.F(s, 'display', 38, 800, 'display'), w = measure(ctx, s.verdict, vf).width + 88;
        ctx.save(); ctx.globalAlpha = v; ctx.translate(0, (1 - v) * 40);
        ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.7), 0.45); ctx.shadowBlur = 44; ctx.shadowOffsetY = 20;
        rrect(ctx, 960 - w / 2, 930, w, 84, 42); ctx.fillStyle = paper; ctx.fill(); ctx.shadowColor = 'transparent';
        text(ctx, s.verdict, 960, 930 + 42, vf, { color: rim, align: 'center', baseline: 'middle' });
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();
  },
  blur() { return false; },
  // split-open's points: the two halves' leading edges and the seam's foot (with the shake), under the push
  track(u, s, cx, D) {
    if (!D) return [[960, 540]];
    const f = u * 15, push = 1 + 0.015 * ramp(f, HIT + 10, 105 - HIT - 10, EASE.smooth);
    return D.b.track(clamp(f / SPAN)).map(([x, y]) => [960 + (x - 960) * push, 540 + (y - 540) * push]);
  },
};

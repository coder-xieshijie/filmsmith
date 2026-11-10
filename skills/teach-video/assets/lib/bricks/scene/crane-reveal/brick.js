// crane-reveal — from one row to the whole wall: the camera starts tight on one tracked row of a table and cranes up
// and out until the whole product window sits on the stage; each row washes with light as the frame's top edge passes
// it, the headline number counts up with the move, and the tracked row turns done once everything has landed.
// Adapted from video-shotcraft demos/opening/crane-rise-reveal/CraneRiseReveal.tsx (card references/shots/opening/crane-rise-reveal.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the window, its header, the number and the rows
// are slots (the upstream's render-queue rows, recipe names, nav, search box, avatar and brand removed); text sizes
// raised to the look's floors; status chips by role (accent for in progress, ok for done, dim for waiting); motion
// blur from the tracked points (runtime subframes) instead of a multi-sample camera blur on the first 40 frames.
import { clamp, mix, rgba, rrect, ground, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { ramp, mixN } from '../../ease.js';
import { fontFor, readTime } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';

// World (the end frame is the world at 1:1) and timing in frames, as upstream
const W = { x: 120, y: 90, w: 1680, h: 900, pad: 48, bar: 72 }, ROW_H = 48, HOLD = 24, MOVE_END = 126, FLIP = 134, END = 165;
const HEAD_Y = W.y + W.bar, THEAD_Y = W.y + 262, ROW0 = W.y + 302, CX0 = W.x + W.pad;
const COL = { id: 0, step: 170, name: 420, status: 930, prog: 1160, value: 1584 };
const crane = bez(0.2, 0, 0.25, 1), S0 = 3.0, F0X = 441;
const rowTop = (i) => ROW0 + i * ROW_H;
// the four row states' labels when the film gives none: [running, checking, done, waiting]
const STATUS = { en: ['Running', 'Checking', 'Done', 'Waiting'], zh: ['进行中', '核对中', '已完成', '等待中'] };
const KIND = { run: 0, review: 1, done: 2, wait: 3 };

// the camera at frame f: scale, translation, the world y of the frame's top edge
const camAt = (f) => {
  const breath = ramp(f, 0, HOLD, 'smooth'), e = crane(clamp((f - HOLD) / (MOVE_END - HOLD))), s0 = S0 * (1 + 0.015 * breath), s = mixN(s0, 1, e);
  const fy0 = W.y + W.h - 30 - 540 / s0, fx = mixN(F0X, 960, e), fy = mixN(fy0, 540, e);
  return { s, e, tx: 960 - fx * s, ty: 540 - fy * s, top: fy - 540 / s };
};

export default {
  id: 'crane-reveal', kind: 'scene',
  fits: ['hook', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 9, max: 12 },
  needs: { motions: [], props: [], roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'ok'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', sample: 'detailEyebrow', limits: { en: { words: 3, chars: 22 }, zh: { chars: 9 } } },
    title: { type: 'text', tier: 'primary', sample: 'detailTitle', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    caption: { type: 'text', tier: 'glance', sample: 'caption', limits: { en: { words: 6, chars: 34 }, zh: { chars: 14 } } },
    value: { type: 'number', limits: { en: { chars: 8 }, zh: { chars: 8 } } },   // its digits count up; a sign, unit or % around them stays
    valueLabel: { type: 'text', tier: 'glance', sample: 'metricLabel', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    rows: { type: 'list', count: [8, 12], of: {
      name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 16 }, zh: { chars: 6 } } },
      step: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 9 }, zh: { chars: 4 } } },
    } },
  },
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'ok'],
  summary: 'From one row to the whole wall: the camera starts tight on one tracked row and cranes up and out until the whole window sits on the stage, rows washing with light as the frame passes them.',
  // tracked: the row the camera starts on (from 0); states: the four state labels [running, checking, done, waiting]
  defaults: () => ({ eyebrow: null, title: null, caption: null, value: '48,210', valueLabel: null, rows: null, tracked: null, states: null }),
  plan(s, ctx) {
    const read = readTime(s.title || '', ctx.lang) * 30, end = Math.max(END, FLIP + 16 + read), beats = clamp(Math.ceil(end / 7.5) / 2, this.beats.min, this.beats.max);
    return { beats, reads: [{ text: s.title, lang: ctx.lang }], cues: [{ beat: HOLD / 15, kind: 'turn' }, { beat: FLIP / 15, kind: 'accent' }], motion: 'crane up and out', settled: MOVE_END / 15, peakAt: FLIP / 15, pause: beats - (FLIP + 14) / 15 };
  },
  validate(s) { const n = s.rows ? s.rows.length : 12; return n < 8 || n > 12 ? [`rows: ${n} (8–12)`] : s.tracked != null && (s.tracked < 0 || s.tracked >= n) ? ['tracked: outside the rows'] : []; },
  prepare(s, ctx) {
    const lang = ctx.lang, look = s.look || NEUTRAL, steps = copy('steps', lang), cards = copy('cards', lang);
    const kinds = ['done', 'run', 'review', 'run', 'wait', 'run', 'done', 'run', 'review', 'run', 'wait', 'run'], progs = [1, 0.72, 0.48, 0.61, 0.12, 0.83, 1, 0.54, 0.4, 0.91, 0.2, 0.66];
    const rows = (s.rows || Array.from({ length: 12 }, (_, i) => ({ step: steps[i % 4], name: cards[(i * 5) % 6].title }))).map((r, i) => ({ id: `#${401 + i}`, kind: kinds[i % 12], prog: progs[i % 12], value: String(73 + ((i * 37) % 140)), ...r }));
    const n = rows.length, info = infoSize(lang), T = s.tracked ?? n - 3;
    // the number: its digits count up, whatever stands around them stays
    const m = String(s.value ?? '').match(/^(.*?)(\d[\d,]*\.?\d*)(.*)$/), num = m ? { pre: m[1], v: parseFloat(m[2].replace(/,/g, '')), dec: (m[2].split('.')[1] || '').length, sep: m[2].includes(','), post: m[3] } : null;
    // the frame each row's top is first passed by the frame's top edge (rows in view at the start never wash)
    const trig = rows.map((_, i) => { if (camAt(HOLD).top <= rowTop(i)) return -1; for (let f = HOLD; f <= MOVE_END; f++) if (camAt(f).top <= rowTop(i) + 2) return f; return MOVE_END; });
    let head = MOVE_END; for (let f = HOLD; f <= MOVE_END; f++) if (camAt(f).top <= HEAD_Y + 60) { head = f; break; }
    return { rows, n, T, num, trig, head, F: {
      row: fontFor(look, 'text', lang, info, 600), dim: fontFor(look, 'text', lang, info, 500), mono: fontFor(look, 'mono', lang, info - 2, 600), head: fontFor(look, 'mono', lang, info - 4, 700, 'label'),
      eyebrow: fontFor(look, 'mono', lang, info - 4, 700, 'label'), title: fontFor(look, 'display', lang, 64, 700, 'display'), value: fontFor(look, 'display', lang, 104, 750, 'display'), cap: fontFor(look, 'text', lang, info, 500) },
      labels: s.states || STATUS[lang === 'zh' ? 'zh' : 'en'], heads: lang === 'zh' ? ['编号', '环节', '名称', '状态', '进度', '帧数'] : ['ID', 'STEP', 'NAME', 'STATE', 'PROGRESS', 'FRAMES'] };
  },
  paint(ctx2d, u, s, ctx, D) {
    const c = s.colors, fr = u * 15, cam = camAt(fr), T = D.T;
    ground(ctx2d, s);
    // the stage's dot grid, at 0.35 of the camera's move (further away)
    const k = 0.35, sp = 1 + (cam.s - 1) * k, px = 960 + (cam.tx + 960 * cam.s - 960) * k - 960 * sp, py = 540 + (cam.ty + 540 * cam.s - 540) * k - 540 * sp;
    ctx2d.save(); ctx2d.translate(px, py); ctx2d.scale(sp, sp); ctx2d.fillStyle = rgba(c.ink, 0.13);
    const x0 = Math.floor((-px / sp - 48) / 48) * 48, y0 = Math.floor((-py / sp - 48) / 48) * 48;
    for (let y = y0; y < (1080 - py) / sp + 48; y += 48) for (let x = x0; x < (1920 - px) / sp + 48; x += 48) { ctx2d.beginPath(); ctx2d.arc(x, y, 1.6, 0, Math.PI * 2); ctx2d.fill(); }
    ctx2d.restore();
    ctx2d.save(); ctx2d.translate(cam.tx, cam.ty); ctx2d.scale(cam.s, cam.s);
    // the window, its shadow rising from almost nothing to a floating height
    const elev = mixN(6, 34, ramp(fr, HOLD + 30, MOVE_END - HOLD - 20, 'swift'));
    ctx2d.save(); ctx2d.shadowColor = rgba(mix(c.ground, '#000000', 0.6), 0.22); ctx2d.shadowBlur = elev * 2; ctx2d.shadowOffsetY = elev;
    rrect(ctx2d, W.x, W.y, W.w, W.h, 28); ctx2d.fillStyle = c.panel; ctx2d.fill(); ctx2d.restore();
    rrect(ctx2d, W.x, W.y, W.w, W.h, 28); ctx2d.strokeStyle = c.line; ctx2d.lineWidth = 1; ctx2d.stroke();
    ctx2d.fillStyle = c.line; ctx2d.fillRect(W.x, W.y + W.bar, W.w, 1);
    rrect(ctx2d, CX0, W.y + 20, 32, 32, 9); ctx2d.fillStyle = c.accent; ctx2d.fill();
    text(ctx2d, copy('product', ctx.lang), CX0 + 46, W.y + 46, D.F.row, { color: c.ink });
    copy('nav', ctx.lang).forEach((nv, i) => text(ctx2d, nv, CX0 + 300 + i * 190, W.y + 46, D.F.dim, { color: i === 2 ? c.ink : c.dim }));
    // the header: eyebrow, title, caption; the number counting up with the move
    const headOn = ramp(fr, D.head - 8, 20, 'out'), N = D.num, kv = N ? N.v * ramp(fr, HOLD + 6, MOVE_END - HOLD + 4, 'snappy') : 0;
    const kpi = N ? N.pre + kv.toLocaleString('en-US', { minimumFractionDigits: N.dec, maximumFractionDigits: N.dec, useGrouping: N.sep }) + N.post : String(s.value ?? '');
    ctx2d.save(); ctx2d.globalAlpha = 0.35 + 0.65 * headOn;
    text(ctx2d, s.eyebrow || '', CX0, HEAD_Y + 58, D.F.eyebrow, { color: c.accent });
    text(ctx2d, s.title || '', CX0 - 3, HEAD_Y + 136, D.F.title, { color: c.ink });
    text(ctx2d, s.caption || '', CX0, HEAD_Y + 180, D.F.cap, { color: c.dim });
    text(ctx2d, kpi, W.x + W.w - W.pad, HEAD_Y + 130, D.F.value, { color: c.ink, align: 'right' });
    text(ctx2d, s.valueLabel || '', W.x + W.w - W.pad, HEAD_Y + 180, D.F.cap, { color: c.dim, align: 'right' });
    ctx2d.restore();
    [COL.id, COL.step, COL.name, COL.status, COL.prog].forEach((x, i) => text(ctx2d, D.heads[i], CX0 + x, THEAD_Y + 26, D.F.head, { color: c.dim }));
    text(ctx2d, D.heads[5], CX0 + COL.value, THEAD_Y + 26, D.F.head, { color: c.dim, align: 'right' });
    ctx2d.fillStyle = c.line; ctx2d.fillRect(CX0, ROW0 - 1, W.w - 2 * W.pad, 1);
    // the rows: the tracked one sharp from the start, the others coming into focus as the camera lifts
    D.rows.forEach((r, i) => {
      const top = rowTop(i), ty = top + ROW_H / 2, tracked = i === T, focus = tracked ? 1 : mixN(0.38, 1, ramp(fr, HOLD - 2, 28, 'out'));
      ctx2d.save(); ctx2d.globalAlpha = focus;
      if (tracked) {
        const g = ctx2d.createLinearGradient(W.x, 0, W.x + W.w, 0); g.addColorStop(0, rgba(c.accent, 0.11)); g.addColorStop(0.6, rgba(c.accent, 0.05)); g.addColorStop(1, rgba(c.accent, 0.03));
        rrect(ctx2d, W.x + 10, top + 3, W.w - 20, ROW_H - 6, 12); ctx2d.fillStyle = g; ctx2d.fill(); ctx2d.strokeStyle = rgba(c.accent, 0.22); ctx2d.stroke();
        const beat = 0.5 + 0.5 * Math.sin(fr / 5.5);
        ctx2d.fillStyle = c.accent; ctx2d.beginPath(); ctx2d.arc(CX0 - 21, ty, 5, 0, Math.PI * 2); ctx2d.fill();
        ctx2d.strokeStyle = rgba(c.accent, 0.5 * (1 - beat)); ctx2d.lineWidth = 1.5; ctx2d.beginPath(); ctx2d.arc(CX0 - 21, ty, 5 + 6 * beat, 0, Math.PI * 2); ctx2d.stroke();
      } else if (i < D.n - 1 && i !== T - 1) { ctx2d.fillStyle = c.line; ctx2d.fillRect(CX0, top + ROW_H - 0.5, W.w - 2 * W.pad, 1); }
      const flip = tracked ? springAt(fr - FLIP, { damping: 16, stiffness: 190 }) : 0, kind = tracked && fr >= FLIP + 2 ? 'done' : r.kind;
      const prog = tracked ? mixN(r.prog, 1, ramp(fr, FLIP - 4, 16, 'out')) : r.prog, base = ty + 9;
      text(ctx2d, r.id, CX0 + COL.id, base, D.F.mono, { color: tracked ? c.accent : c.dim });
      text(ctx2d, r.step || '', CX0 + COL.step, base, D.F.dim, { color: c.dim });
      text(ctx2d, r.name || '', CX0 + COL.name, base, D.F.row, { color: c.ink });
      // the status chip; the tracked row's pops to done with a tick
      const col = kind === 'done' ? c.ok || c.accent : kind === 'wait' ? c.dim : kind === 'review' ? c.ink : c.accent, pop = tracked && fr >= FLIP ? 0.86 + 0.14 * flip : 1;
      const label = D.labels[KIND[kind]], lw = measure(ctx2d, label, D.F.dim).width;
      ctx2d.save(); ctx2d.translate(CX0 + COL.status, ty); ctx2d.scale(pop, pop);
      rrect(ctx2d, 0, -17, lw + 40, 34, 17); ctx2d.fillStyle = rgba(col, 0.12); ctx2d.fill();
      const tick = tracked ? ramp(fr, FLIP + 4, 10, 'out') : 0;
      if (kind === 'done' && tick > 0) { ctx2d.strokeStyle = col; ctx2d.lineWidth = 2.4; ctx2d.lineCap = 'round'; ctx2d.beginPath(); ctx2d.moveTo(10, 0.4); ctx2d.lineTo(10 + 3.1 * Math.min(1, tick * 2), 0.4 + 2.8 * Math.min(1, tick * 2)); if (tick > 0.5) ctx2d.lineTo(13.1 + 5.9 * (tick - 0.5) * 2, 3.2 - 6.4 * (tick - 0.5) * 2); ctx2d.stroke(); }
      else { ctx2d.fillStyle = col; ctx2d.beginPath(); ctx2d.arc(16, 0, 4, 0, Math.PI * 2); ctx2d.fill(); }
      text(ctx2d, label, 28, 9, D.F.dim, { color: col });
      ctx2d.restore();
      rrect(ctx2d, CX0 + COL.prog, ty - 3, 260, 6, 3); ctx2d.fillStyle = rgba(c.ink, 0.07); ctx2d.fill();
      rrect(ctx2d, CX0 + COL.prog, ty - 3, 260 * prog, 6, 3); ctx2d.fillStyle = kind === 'done' ? col : tracked ? c.accent : rgba(c.ink, 0.32); ctx2d.fill();
      text(ctx2d, r.value, CX0 + COL.value, base, D.F.dim, { color: c.dim, align: 'right' });
      ctx2d.restore();
      // the wash: a band of accent light running along the row as the frame's top edge passes it
      const t = D.trig[i];
      if (t >= 0 && !tracked) {
        const p = ramp(fr, t, 20, 'out'), op = Math.min(1, ramp(fr, t, 3, 'linear')) * (1 - ramp(fr, t + 6, 18, 'out'));
        if (op > 0.002) { const head = mixN(-0.2, 1.1, p), g = ctx2d.createLinearGradient(W.x + 10, 0, W.x + W.w - 10, 0);
          g.addColorStop(0, rgba(c.accent, 0.03 * op)); g.addColorStop(clamp(head), rgba(c.accent, 0.14 * op)); g.addColorStop(clamp(head + 0.22), rgba(c.accent, 0));
          rrect(ctx2d, W.x + 10, top + 3, W.w - 20, ROW_H - 6, 12); ctx2d.fillStyle = g; ctx2d.fill(); ctx2d.strokeStyle = rgba(c.accent, 0.18 * op); ctx2d.stroke(); }
      }
    });
    ctx2d.restore();
    // the close-up's vignette, gone as the camera lifts
    const vig = 1 - ramp(fr, HOLD, 60, 'swift');
    if (vig > 0) { const vg = ctx2d.createRadialGradient(864, 626, 600, 864, 626, 1250); vg.addColorStop(0, rgba(c.ink, 0)); vg.addColorStop(1, rgba(c.ink, 0.16 * vig)); ctx2d.fillStyle = vg; ctx2d.fillRect(0, 0, 1920, 1080); }
  },
  // 0, 1: the window's top-left and bottom-right corners on screen (the crane)
  track(u) { const cam = camAt(u * 15); return [[cam.tx + W.x * cam.s, cam.ty + W.y * cam.s], [cam.tx + (W.x + W.w) * cam.s, cam.ty + (W.y + W.h) * cam.s]]; },
};

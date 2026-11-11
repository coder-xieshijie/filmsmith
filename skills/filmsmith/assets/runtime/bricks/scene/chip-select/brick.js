// chip-select — a single choice shown as cause and effect: a question and its options as chips (3 + 2, centred), a
// pointer arrives and presses one; one grey frame (pressed), five frames to ink (selected) with a light bounce, the
// others fade to 18 % without moving; then the others go, the chosen chip rises and narrows to the centre line and the
// result rises below it: the old value, struck through, the new value, a note in the accent.
// Adapted from video-shotcraft demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx
// (card references/shots/interaction/chip-grid-single-select-blackout.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React or Remotion); colours by role (selected = ink, the light
// and the note in the accent); brand, the billing options and prices replaced by slots (question, options, before,
// after, unit, note) with neutral defaults; chip widths measured from the film's text in either language (the
// upstream's fixed width table is gone); the pointer and the chips are the cursor and choice-chip bricks.
import { clamp, lerp, mix, rgba, rrect, text, measure, scratch } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor, graphemes, readTime } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { riseText } from '../../motion/stagger-in/brick.js';
import { chipWidth, drawChip } from '../../prop/choice-chip/brick.js';
import { drawCursor } from '../../prop/cursor/brick.js';
import { glideAt } from '../../motion/cursor-glide/brick.js';

const CH = 96, GAP = 22, ROWS = [452, 570], FS = 56, COLLAPSE = 101, TARGET_Y = 330, TARGET_S = 0.88, FRAMES = 165;
const lin = (f, a, b) => clamp((f - a) / (b - a));
const outQuad = (t) => 1 - (1 - t) * (1 - t);
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);

const layout = (s) => {
  const g = scratch(), n = s.options.length, r1 = n <= 3 ? n : Math.ceil(n / 2);
  const ws = s.options.map((o) => Math.round(chipWidth(g, o, CH, s, false) - CH * 0.083));   // label + 44 px a side; the tick takes the padding
  const rows = n <= 3 ? [[...Array(n).keys()]] : [[...Array(r1).keys()], [...Array(n - r1).keys()].map((k) => k + r1)];
  const pos = [];
  rows.forEach((ids, r) => {
    const total = ids.reduce((a, k) => a + ws[k], 0) + GAP * (ids.length - 1);
    let x = (1920 - total) / 2;
    for (const k of ids) { pos[k] = [x, rows.length === 1 ? 511 : ROWS[r]]; x += ws[k] + GAP; }
  });
  return { ws, pos };
};

export default {
  id: 'chip-select', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 10, max: 12 },
  needs: { motions: ['cursor-glide', 'stagger-in'], props: ['choice-chip', 'cursor'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    eyebrow: { type: 'text', tier: 'glance', optional: true, sample: 'detailEyebrow', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
    question: { type: 'text', tier: 'primary', limits: { en: { words: 6, chars: 30 }, zh: { chars: 12 } }, default: { en: 'Which cut goes out?', zh: '发哪一版？' } },
    options: { type: 'list', count: [3, 6], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 7 } } } },
    before: { type: 'number', limits: { en: { chars: 8 }, zh: { chars: 6 } }, default: { en: '12 min', zh: '12 分钟' } },
    after: { type: 'number', claim: true, limits: { en: { chars: 6 }, zh: { chars: 5 } }, default: { en: '4', zh: '4' } },
    unit: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 6 }, zh: { chars: 3 } }, default: { en: 'min', zh: '分钟' } },
    note: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } }, default: { en: 'Three times faster', zh: '快了三倍' } },
  },
  defaults: (ctx = {}) => ({
    eyebrow: copy('detailEyebrow', ctx.lang), question: { en: 'Which cut goes out?', zh: '发哪一版？' }, options: copy('cards', ctx.lang).slice(0, 5).map((c) => c.title), choice: 0,
    before: { en: '12 min', zh: '12 分钟' }, after: { en: '4', zh: '4' }, unit: { en: 'min', zh: '分钟' }, note: { en: 'Three times faster', zh: '快了三倍' },
  }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en';
    return {
      beats: FRAMES / 15, reads: readTime(pick(s.question, lang), lang),
      cues: [{ beat: 8 / 15, kind: 'accent' }, { beat: FS / 15, kind: 'turn' }, { beat: 118 / 15, kind: 'accent' }, { beat: 128 / 15, kind: 'stamp' }],
      motion: ['stagger-in', 'cursor-glide'], settled: 134 / 15, shots: 1, peakAt: FS / 15, pause: { from: 66 / 15, to: COLLAPSE / 15 },
    };
  },
  validate(s, ctx = {}) {
    const err = [], n = (s.options || []).length;
    if (n < 3 || n > 6) err.push(`options: ${n}, want 3–6`);
    if (!(s.choice >= 0 && s.choice < n)) err.push(`choice ${s.choice} is not an option`);
    return err;
  },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, question: pick(s.question, lang), before: pick(s.before, lang), after: pick(s.after, lang), unit: pick(s.unit, lang), note: pick(s.note, lang) };
    const L = layout(S), k = S.choice || 0, [x0, y0] = L.pos[k];
    const glide = { start: [1500, 960], stops: [{ at: [x0 + L.ws[k] * 0.62, y0 + CH * 0.58], travel: 28, wait: 2, ease: 'swift' }], arc: 60, after: 0, ripple: { frames: 1 } };
    return { S, L, glide };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, c = s.colors, f = u * 15, lang = S.lang, k = S.choice || 0;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    const cam = 1 + 0.015 * ramp(f, 20, 60, 'smooth') - 0.015 * ramp(f, COLLAPSE, 30, 'smooth');
    ctx.save(); ctx.translate(960, 540); ctx.scale(cam, cam); ctx.translate(-960, -540);
    // the question and its eyebrow, leaving upward when the choice collapses
    const out = ramp(f, COLLAPSE - 4, 16, 'exit');
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -30 * out);
    if (S.eyebrow) {
      const tr = 0.3 * (1 - ramp(f, 0, 18, 'snappy'));
      const ef = { ...F(S, 'mono', infoSize(lang), 650, 'label') }; ef.spacing = (ef.spacing || 0) + tr * ef.size;
      text(ctx, S.eyebrow, 960, 196, ef, { color: c.accent, align: 'center', alpha: ramp(f, 0, 10, 'out') });
    }
    riseText(ctx, S.question, 960, 304, F(S, 'display', 84, 700, 'display'), { color: c.ink, lang, f, start: 3, each: 16, gap: 2.5, align: 'center' });
    ctx.restore();
    // the chips
    const bk = lin(f, FS + 1, FS + 6), pr = lin(f, FS + 1, FS + 10), fade = outQuad(lin(f, FS + 1, FS + 10)), gone = outQuad(lin(f, COLLAPSE, COLLAPSE + 9));
    const lift = ramp(f, COLLAPSE, 18, 'smooth');
    S.options.forEach((o, i) => {
      if (i === k) return;
      const [x, y] = D.L.pos[i], inP = ramp(f, 8 + i * 3, 16, 'snappy');
      ctx.save(); ctx.globalAlpha = inP * (1 - gone);
      drawChip(ctx, x, y + (1 - inP) * 30, D.L.ws[i], CH, o, { fade }, S);
      ctx.restore();
    });
    {
      const [x, y] = D.L.pos[k], w = D.L.ws[k], inP = ramp(f, 8 + k * 3, 16, 'snappy');
      const ccx = x + w / 2, ccy = y + CH / 2, dx = (960 - ccx) * lift, dy = (TARGET_Y - ccy) * lift, sc = lerp(1, TARGET_S, lift);
      ctx.save(); ctx.globalAlpha = inP;
      ctx.translate(ccx + dx, ccy + dy + (1 - inP) * 30); ctx.scale(sc, sc); ctx.translate(-ccx, -ccy);
      drawChip(ctx, x, y, w, CH, S.options[k], { sel: bk, press: Math.floor(f) === FS ? 1 : 0, bounce: pr > 0 ? Math.sin(pr * Math.PI) : 0, light: bk * (1 - 0.5 * lift) }, S);
      ctx.restore();
    }
    // the result: before (struck), after with its unit, the note
    if (f >= 108) {
      const vf = F(S, 'display', 180, 750, 'display'), of = F(S, 'text', 60, 500), uf = F(S, 'text', 48, 500);
      const ow = measure(ctx, S.before, of).width, aw = measure(ctx, S.after, vf).width, uw = S.unit ? measure(ctx, S.unit, uf).width + 10 : 0;
      const total = ow + 44 + aw + uw, x0 = 960 - total / 2, base = 640;
      const oldIn = ramp(f, 108, 14, 'snappy'), strike = ramp(f, 118, 8, 'swift');
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, base - 72, ow + 20, 92); ctx.clip();
      const oy = base + (1 - oldIn) * 80;
      text(ctx, S.before, x0, oy, of, { color: mix(c.dim, c.ground, 0.35 * strike) });
      if (strike > 0) { rrect(ctx, x0 - 4, oy - 26, (ow + 8) * strike, 4, 2); ctx.fillStyle = c.dim; ctx.fill(); }
      ctx.restore();
      const ax = x0 + ow + 44, gs = graphemes(S.after);
      let gx = ax;
      gs.forEach((g, i) => {
        const p = ramp(f, 116 + i * 1.2, 14, 'snappy'), gw = measure(ctx, g, vf).width;
        if (p > 0) { ctx.save(); ctx.beginPath(); ctx.rect(gx - 4, base - 180, gw + 8, 210); ctx.clip(); text(ctx, g, gx, base + (1 - p) * 200, vf, { color: c.ink }); ctx.restore(); }
        gx += gw;
      });
      if (S.unit) text(ctx, S.unit, ax + aw + 10, base, uf, { color: c.dim, alpha: ramp(f, 124, 10, 'out') });
      const sv = ramp(f, 128, 14, 'overshoot');
      if (sv > 0 && S.note) {
        const nf = F(S, 'text', 32, 650), nw = measure(ctx, S.note, nf).width + 52, nh = 58;
        ctx.save(); ctx.globalAlpha = Math.min(1, sv * 1.5); ctx.translate(960, 719 + (1 - sv) * 16); ctx.scale(0.8 + 0.2 * sv, 0.8 + 0.2 * sv);
        ctx.shadowColor = rgba(c.accent, 0.5); ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
        rrect(ctx, -nw / 2, -nh / 2, nw, nh, nh / 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.shadowColor = 'transparent';
        text(ctx, S.note, 0, 1, nf, { color: c.onAccent || c.panel, align: 'center', baseline: 'middle' });
        ctx.restore();
      }
    }
    // the pointer: in from the lower right on an arc, presses on the grey frame, leaves
    const show = ramp(f, 24, 8, 'out') * (1 - ramp(f, 70, 12, 'out'));
    if (show > 0.001) { const g = glideAt(f - 26, D.glide); drawCursor(ctx, g.x, g.y, { h: 50, form: 'solid', press: g.press, alpha: show, colors: c }); }
    ctx.restore();
  },
  track(u, s, cx, D) {
    const f = u * 15, g = glideAt(f - 26, D.glide), k = D.S.choice || 0, [x, y] = D.L.pos[k], lift = ramp(f, COLLAPSE, 18, 'smooth');
    const ccx = x + D.L.ws[k] / 2, ccy = y + CH / 2 + (1 - ramp(f, 8 + k * 3, 16, 'snappy')) * 30;
    return [[g.x, g.y], [ccx + (960 - ccx) * lift, ccy + (TARGET_Y - (y + CH / 2)) * lift]];
  },
};

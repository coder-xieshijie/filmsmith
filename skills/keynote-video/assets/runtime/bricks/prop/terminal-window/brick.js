// terminal-window — a terminal as an object: a title bar (three lights, a step number, a name, a path), a prompt the
// command is typed into behind a block caret, and output lines printed one by one, each with a spinner that settles
// into a tick; an optional progress row of cells with its count, and an optional last line, a badge and a name in the
// accent with the only glow of the window.
// Adapted from video-shotcraft demos/camera/terminal-3d/Terminal3D.tsx (card references/shots/camera/terminal-3d.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React or Remotion); only the structure is kept (the 1180 × 620 layout and its
// proportions: the 72 px title bar, the prompt at 124, the output from 220 every 70, the 52 / 38 / 24 px type); colours
// by role (the window in panel darkened toward the ground, the prompt mark, the step, the ticks, the cells and the last
// line in the accent, keys in dim, values in ink); every word is the film's (the CLI name, the command, the lines, the
// last line; sample copy by default); the braille spinner and the ❯ and ✓ glyphs are drawn as strokes (no glyph that a
// font may lack); the line's print (6 frames, 10 px from the left), the spinner turning into the tick after 6 frames and
// the badge's pop (0.94 → 1, overshoot) are the upstream's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { fontFor, graphemes } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

export const TW = 1180, TH = 620;
const F = (P, size, weight = 500, role = 'mono') => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, role === 'mono' ? 'mono' : null);

// The typed command at `typed` (0 → 1 of its graphemes).
export const typedCmd = (s, typed) => { const g = graphemes(s || ''); return g.slice(0, Math.floor(clamp(typed) * g.length + 1e-6)).join(''); };

// The prompt mark (a chevron) and the tick, drawn so no font is needed.
const chevron = (ctx, x, y, s, color) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y - s * 0.38); ctx.lineTo(x + s * 0.34, y); ctx.lineTo(x, y + s * 0.38); ctx.stroke(); ctx.restore(); };
const tick = (ctx, x, y, s, color) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.3, y + s * 0.3); ctx.lineTo(x + s * 0.8, y - s * 0.32); ctx.stroke(); ctx.restore(); };
// a spinner: an arc of 270° turning (t in frames)
const spinner = (ctx, x, y, s, t, color) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.beginPath(); const a = t * 0.9; ctx.arc(x + s * 0.4, y, s * 0.3, a, a + Math.PI * 1.4); ctx.stroke(); ctx.restore(); };

// Draw a window in [x, y, w, h] (its layout is 1180 × 620, scaled to w). st: { focus, typed (0 → 1 of the command),
// caret (0 hides it), lines: [t per output line, in frames since it was printed; < 0 not yet], progress (0 → 1 of the
// cells), progressAt (frames since the progress row was printed), ready (frames since the last line was printed; < 0 not yet) }. W: the window's words { step, name, path, cmd,
// lines: [{ key, value, note }], progress: { count, unit } | null, ready: { label, value } | null }.
export const drawTerminal = (ctx, x, y, w, h, st, P, W) => {
  const c = P.colors, k = w / TW, focus = clamp(st.focus ?? 1), body = mix(c.panel, c.ground, 0.55), zh = P.lang === 'zh';
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const H = h / k;
  ctx.save(); ctx.shadowColor = rgba(mix(c.ground, '#000000', 0.85), 0.7); ctx.shadowBlur = 120; ctx.shadowOffsetY = 50;
  rrect(ctx, 0, 0, TW, H, 22); ctx.fillStyle = body; ctx.fill(); ctx.restore();
  if (focus > 0.01) { ctx.save(); ctx.shadowColor = rgba(c.accent, 0.07 * focus * 2); ctx.shadowBlur = 90; rrect(ctx, 0, 0, TW, H, 22); ctx.fillStyle = body; ctx.fill(); ctx.restore(); }
  ctx.save(); rrect(ctx, 0, 0, TW, H, 22); ctx.clip();
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, mix(c.panel, c.ground, 0.3)); bg.addColorStop(0.3, body); bg.addColorStop(1, mix(c.panel, c.ground, 0.8));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, TW, H);
  // the title bar: three muted lights, the step in the accent, the name, the path at the right
  const tb = ctx.createLinearGradient(0, 0, 0, 72); tb.addColorStop(0, rgba(c.ink, 0.035)); tb.addColorStop(1, rgba(c.ink, 0)); ctx.fillStyle = tb; ctx.fillRect(0, 0, TW, 72);
  ctx.fillStyle = rgba(c.ink, 0.07); ctx.fillRect(0, 71, TW, 1.5);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(38 + i * 30, 36, 8, 0, Math.PI * 2); ctx.fillStyle = rgba(c.ink, 0.16); ctx.fill(); }
  const sf = F(P, 24, 700), nf = F(P, zh ? 26 : 24, 500), pf = F(P, zh ? 24 : 22, 400);
  let tx = 30 + 3 * 30 + 22;
  if (W.step) { text(ctx, W.step, tx, 36, { ...sf, spacing: 0.04 * 24 }, { color: c.accent, baseline: 'middle' }); tx += measure(ctx, W.step, { ...sf, spacing: 0.04 * 24 }).width + 14; }
  if (W.name) text(ctx, W.name, tx, 36, nf, { color: mix(c.dim, c.ink, 0.4), baseline: 'middle' });
  if (W.path) text(ctx, W.path, TW - 30, 36, pf, { color: c.dim, baseline: 'middle', align: 'right' });
  // the prompt: the mark, the typed command, the block caret right after it
  const cf = F(P, zh ? 48 : 52, 600), cy = 124 + 26;
  chevron(ctx, 58, cy, 40, c.accent);
  const cmd = typedCmd(W.cmd, st.typed ?? 1), cx = 56 + 58;
  text(ctx, cmd, cx, cy, cf, { color: c.ink, baseline: 'middle' });
  if ((st.caret ?? 0) > 0) { const cw = measure(ctx, cmd, cf).width; ctx.save(); ctx.globalAlpha *= clamp(st.caret) * 0.95; rrect(ctx, cx + cw + 4, cy - cf.size * 0.56, cf.size * 0.58, cf.size * 1.08, 3); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore(); }
  // the output: each line printed in 6 frames from 10 px to the left; spinner for 6 frames, then the tick
  const of = F(P, zh ? 36 : 38, 500), lines = W.lines || [], T = st.lines || [];
  const keyW = Math.max(0, ...lines.map((l) => (l.key ? measure(ctx, l.key, of).width : 0))) + 28;
  let row = 0;
  const put = (t, draw, extra = 0) => {
    const yy = 220 + row * 70 + extra + of.size * 0.5; row++;
    if (t == null || t < 0) return;
    const p = EASE.snappy(clamp(t / 6));
    ctx.save(); ctx.globalAlpha *= Math.min(1, p * 1.8); ctx.translate((1 - p) * -10, 0); draw(yy, t); ctx.restore();
  };
  if (W.progress) put(st.progress == null ? null : (st.progressAt ?? 6), (yy) => {
    const N = 24, on = Math.round(clamp(st.progress) * N);
    for (let j = 0; j < N; j++) { rrect(ctx, 56 + j * 22, yy - 17, 17, 34, 3); ctx.fillStyle = j < on ? c.accent : rgba(c.ink, 0.1); ctx.fill(); }
    const nx = 56 + N * 22 + 17, count = String(Math.round(clamp(st.progress) * Number(W.progress.count || N)));
    text(ctx, count.padStart(String(W.progress.count || N).length, ' '), nx, yy, of, { color: c.ink, baseline: 'middle' });
    text(ctx, `/ ${W.progress.count || N} ${W.progress.unit || ''}`, nx + measure(ctx, `${'0'.repeat(String(W.progress.count || N).length)} `, of).width, yy, of, { color: c.dim, baseline: 'middle' });
  });
  lines.forEach((ln, i) => put(T[i], (yy, t) => {
    const done = t > 6 || ln.mark === 'pass';
    if (ln.mark !== 'none') { if (done) tick(ctx, 58, yy, 34, c.accent); else spinner(ctx, 56, yy, 34, t, c.dim); }
    const x0 = 56 + (ln.mark !== 'none' ? 60 : 0);
    if (ln.key) text(ctx, ln.key, x0, yy, of, { color: ln.mark === 'pass' ? c.accent : c.dim, baseline: 'middle' });
    const vx = x0 + (ln.key ? keyW : 0);
    if (ln.value) text(ctx, ln.value, vx, yy, of, { color: c.ink, baseline: 'middle' });
    if (ln.note) text(ctx, ` · ${ln.note}`, vx + measure(ctx, ln.value || '', of).width, yy, of, { color: c.dim, baseline: 'middle' });
  }));
  // the last line: the badge in the accent (a pulsing dot, the label) and the name with the window's only glow
  if (W.ready) put(st.ready, (yy, t) => {
    const pop = EASE.overshoot(clamp(t / 14)), g = EASE.out(clamp(t / 26)), pulse = 0.55 + 0.45 * Math.cos(Math.max(0, t) / 6), sc = 0.94 + 0.06 * pop;
    ctx.save(); ctx.translate(56, yy + 16); ctx.scale(sc, sc);
    const lf = F(P, zh ? 28 : 30, 800, 'text'), lw = measure(ctx, W.ready.label, { ...lf, spacing: 0.08 * lf.size }).width, bw = lw + 22 * 2 + 28;
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.45 * g); ctx.shadowBlur = 40 * g; rrect(ctx, 0, -28, bw, 56, 12); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(22 + 7, 0, 7, 0, Math.PI * 2); ctx.fillStyle = rgba(c.onAccent || c.panel, 0.4 + 0.6 * pulse); ctx.fill();
    text(ctx, W.ready.label, 22 + 28, 1, { ...lf, spacing: 0.08 * lf.size }, { color: c.onAccent || c.panel, baseline: 'middle' });
    const vf = F(P, zh ? 48 : 52, 700);
    ctx.save(); ctx.shadowColor = rgba(c.accent, 0.55 * g); ctx.shadowBlur = 24 * g; text(ctx, W.ready.value, bw + 26, 2, vf, { color: c.accent, baseline: 'middle' }); ctx.restore();
    ctx.restore();
  }, 16);
  ctx.restore();
  rrect(ctx, 0.75, 0.75, TW - 1.5, H - 1.5, 21.25); ctx.strokeStyle = rgba(c.ink, 0.1 + 0.08 * focus); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = rgba(c.ink, 0.08 + 0.1 * focus); ctx.fillRect(22, 1, TW - 44, 2);
  ctx.restore();
};

const DEFAULT = {
  en: { step: '01', name: 'render', path: '~/promo', cmd: 'tidewell render',
    lines: [{ key: 'shots', value: '12 cards', note: '2.5D', mark: 'spin' }, { key: 'audio', value: '120 bpm', note: 'beat grid', mark: 'spin' }, { key: 'ready', value: 'next: tidewell export', mark: 'pass' }],
    progress: null, ready: { label: 'READY', value: 'launch-film.mp4' } },
  zh: { step: '01', name: '渲染', path: '~/promo', cmd: 'tidewell render',
    lines: [{ key: '镜头', value: '12 张卡', note: '2.5D', mark: 'spin' }, { key: '音频', value: '120 bpm', note: '节拍网格', mark: 'spin' }, { key: '就绪', value: '下一步：导出', mark: 'pass' }],
    progress: null, ready: { label: '完成', value: 'launch-film.mp4' } },
};
const STATES = {
  idle: { focus: 1, typed: 0, caret: 1, out: 0, ready: 0 },
  typed: { focus: 1, typed: 1, caret: 1, out: 0, ready: 0 },
  printed: { focus: 1, typed: 1, caret: 0, out: 1, ready: 0 },
  ready: { focus: 1, typed: 1, caret: 0, out: 1, ready: 1 },
};
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

export default {
  id: 'terminal-window', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [760, 400], M: [1180, 620], L: [1500, 788] },
  states: STATES,
  parts: ['titlebar', 'lights', 'step', 'name', 'path', 'prompt', 'command', 'caret', 'lines', 'spinner', 'tick', 'progress', 'ready'],
  swap: {
    step: { type: 'text', tier: 'glance', limits: lim(3, 3, 1) },
    name: { type: 'text', tier: 'glance', limits: lim(14, 6, 2) },
    path: { type: 'text', tier: 'glance', limits: lim(18, 18, 2) },
    cmd: { type: 'text', tier: 'primary', limits: lim(24, 24, 3) },
    lines: { type: 'list', count: [0, 4], of: { key: { type: 'text', tier: 'glance', limits: lim(8, 3, 1) }, value: { type: 'text', tier: 'glance', limits: lim(22, 10, 4) }, note: { type: 'text', tier: 'glance', optional: true, limits: lim(12, 5, 2) } } },
    progress: { type: 'list', count: [0, 1], optional: true, of: { count: { type: 'number', limits: lim(3, 3, 1) }, unit: { type: 'text', tier: 'glance', limits: lim(8, 3, 1) } } },
    ready: { type: 'list', count: [0, 1], optional: true, of: { label: { type: 'text', tier: 'word', limits: lim(6, 2, 1) }, value: { type: 'text', tier: 'primary', limits: lim(18, 18, 1) } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'A terminal as an object: a title bar, a command typed behind a block caret, output lines printed one by one whose spinners settle into ticks, and a last line in the accent.',
  defaults: (ctx = {}) => { const d = JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])); return { ...d, ready: d.ready ? [d.ready] : [], progress: d.progress ? [d.progress] : [], backdrop: true }; },
  // the window's words as drawTerminal takes them (the swap's one-item lists unwrapped)
  words(P) { return { ...P, progress: (P.progress || [])[0] || null, ready: (P.ready || [])[0] || null }; },
  draw(ctx, S, P) {
    if (P.backdrop) { ctx.save(); ctx.fillStyle = P.colors.ground; ctx.fillRect(-(960 - P.w / 2), -(540 - P.h / 2), 1920, 1080); ctx.restore(); }
    // a state's out (0 → 1) prints the lines in turn, 4 frames apart in a 30-frame beat; ready prints the last line
    const W = this.words(P), n = (W.lines || []).length + (W.progress ? 1 : 0), o = clamp(S.out) * (n * 4 + 8);
    const lines = (W.lines || []).map((_, i) => o - (i + (W.progress ? 1 : 0)) * 4 - (S.out > 0 ? 0 : 1e9));
    drawTerminal(ctx, 0, 0, P.w, P.h, { focus: S.focus, typed: S.typed, caret: S.caret, lines, progress: W.progress && S.out > 0 ? clamp(S.out * 1.4) : null, progressAt: o, ready: S.ready > 0 ? S.ready * 30 : -1 }, P, W);
  },
};

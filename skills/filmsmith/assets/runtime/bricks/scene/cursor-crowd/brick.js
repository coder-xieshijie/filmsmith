// cursor-crowd — a team arriving on a shared board: named cursors fly in from the edges one after another and keep a
// slow drift ("people are here"); the avatar stack in the corner takes each one the frame they land; one of them parks
// on the brief card's title and types it, the arrow riding the insertion point across a line break; the card goes from
// draft to ready and the others gather round it without covering the title. Notes on the board and the board's chrome
// make it a place, not a screen.
// Adapted from video-shotcraft demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx (card
// references/shots/interaction/collab-cursor-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames scene brick (no React, SVG or Remotion); five identity colours replaced by role
// tones (the typist in the accent, the others in ink, dim and two mixes of them; notes tinted from their author's
// tone); the board, the people, the notes, the brief's title, eyebrow, due line, status words, footer and the share
// button are slots; the brand mark and name are gone; the cursors and tags are the cursor prop; typing goes by
// grapheme in either language and wraps by lang.js.
import { clamp, lerp, mix, rgba, rrect, text, measure, scratch } from '../../../handoffs/util.js';
import { ramp } from '../../ease.js';
import { hash } from '../../../rng.js';
import { fontFor, graphemes, wrap, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { springAt } from '../../motion/stagger-in/brick.js';
import { drawCursor, drawTag } from '../../prop/cursor/brick.js';

const CARD = { x: 432, y: 318, w: 1056, h: 432, pad: 56 }, TFS = 88, TLH = TFS * 1.04, TITLE_TOP = CARD.y + CARD.pad + 66, TYPE0 = 48, CH = 84;
// the four who drift (from, home, gather, delay, phase) and the typist's entry
const CREW = [
  { from: [-160, 260], home: [330, 470], gather: [318, 372], delay: 2, phase: 0.0 },
  { from: [2080, 220], home: [1600, 470], gather: [1512, 330], delay: 7, phase: 1.7 },
  { from: [-160, 980], home: [380, 860], gather: [900, 784], delay: 11, phase: 3.1 },
  { from: [2080, 1000], home: [1540, 880], gather: [1470, 800], delay: 16, phase: 4.4 },
];
const TYPIST = { from: [980, -200], delay: 22 };
const NOTES = [
  { x: 96, y: 156, rot: -3.2, owner: 0, far: true }, { x: 1540, y: 150, rot: 2.6, owner: 1, far: true },
  { x: 60, y: 560, rot: 2.2, owner: 2, far: false }, { x: 1580, y: 560, rot: -2.4, owner: 3, far: false },
  { x: 560, y: 812, rot: -1.6, owner: 4, far: true }, { x: 1090, y: 820, rot: 1.8, owner: 0, far: true },
];
const TOOLS = ['M7 5v15l4-4 3 6 3-1.4-3-5.8h6z', 'M9 13V7.5a1.5 1.5 0 0 1 3 0V12M12 11V6a1.5 1.5 0 0 1 3 0v5M15 11V7a1.5 1.5 0 0 1 3 0v7c0 4-2.5 6.5-6 6.5S7 18 6 15l-1.5-3a1.5 1.5 0 0 1 2.6-1.5L9 13',
  'M6 5h14v10l-5 5H6zM15 20v-5h5', 'M6 7V5h14v2M13 5v16M10 21h6', 'M7 5h7a2 2 0 0 1 2 2v7H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM21.5 17a4.5 4.5 0 1 1-9 0a4.5 4.5 0 1 1 9 0', 'M5 21l1.2-4.6L17 5.6a2 2 0 0 1 2.8 2.8L9 19.2zM15 7.6l3.4 3.4'];
const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v);
const F = (s, role, size, weight, kind) => fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind);

// Keystroke frames: 1.6–2.4 a grapheme (seeded), a word gap a little longer; Chinese characters 1.8 × as long.
const typeTimes = (title, lang) => { const g = graphemes(title), at = []; let f = TYPE0; g.forEach((ch, i) => { at.push(f); f += (1.6 + hash(i, 41) * 0.8) * (lang === 'zh' ? 1.8 : 1) + (ch === ' ' ? 0.9 : 0); }); return at; };
const timeline = (S) => {
  const at = typeTimes(S.title, S.lang), end = at.length ? at[at.length - 1] : TYPE0, ready = S.readyAt ?? Math.round(end) - 2;
  return { at, end, ready, gather: ready - 8, total: ready + 50 };
};
// a crew member's cursor tip on the board (before the camera)
const crewAt = (i, f, T) => {
  const a = CREW[i], s = springAt(f - a.delay, { damping: 15, stiffness: 80, mass: 0.9 }), gT = ramp(f, T.gather, 28, 'smooth');
  const settled = clamp((f - a.delay - 20) / 12);
  const dX = Math.sin(f * 0.055 + a.phase) * 40 + Math.sin(f * 0.021 + a.phase * 2) * 26, dY = Math.cos(f * 0.047 + a.phase * 1.3) * 32 + Math.cos(f * 0.017 + a.phase) * 20;
  const x = lerp(a.from[0], a.home[0], s) + dX * settled * (1 - gT), y = lerp(a.from[1], a.home[1], s) + dY * settled * (1 - gT);
  return [lerp(x, a.gather[0] + dX * 0.25, gT), lerp(y, a.gather[1] + dY * 0.25, gT)];
};

export default {
  id: 'cursor-crowd', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 8, max: 12 },
  needs: { motions: [], props: ['cursor'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', limits: { en: { words: 7, chars: 32 }, zh: { chars: 14 } }, default: { en: 'Ship the teaser by Friday.', zh: '周五前把预告片发出去。' } },
    people: { type: 'list', count: [3, 5], of: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } } },
    notes: { type: 'list', count: [0, 6], of: { title: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 22 }, zh: { chars: 8 } } }, meta: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } } } },
    board: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } }, default: { en: 'Teaser kickoff', zh: '预告片开工会' } },
    eyebrow: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 5 } }, default: { en: 'Brief', zh: '简报' } },
    due: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 14 }, zh: { chars: 6 } }, default: { en: 'Due Thursday', zh: '周四截止' } },
    draft: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 7 }, zh: { chars: 3 } }, default: { en: 'Draft', zh: '草稿' } },
    ready: { type: 'text', tier: 'word', limits: { en: { words: 1, chars: 7 }, zh: { chars: 3 } }, default: { en: 'Ready', zh: '就绪' } },
    footer: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 22 }, zh: { chars: 9 } }, default: { en: '2 leads · 9 shots', zh: '2 位负责 · 9 镜' } },
    action: { type: 'text', tier: 'word', optional: true, limits: { en: { words: 1, chars: 6 }, zh: { chars: 2 } }, default: { en: 'Share', zh: '共享' } },
  },
  defaults: () => ({
    title: { en: 'Ship the teaser by Friday.', zh: '周五前把预告片发出去。' },
    people: { en: ['Ines', 'Kofi', 'Mei', 'Tomás', 'Rita'], zh: ['伊娜', '柯飞', '梅', '托马', '丽塔'] },
    notes: {
      en: [['Open on a close-up', '3 likes'], ['Logo at the end', 'Pending'], ['Cut on the beat', '5 replies'], ['Real screen shots', 'By Tuesday'], ['Renders: 214', 'Updating'], ['Sound pass', 'To check']].map(([title, meta]) => ({ title, meta })),
      zh: [['用特写开场', '4 票'], ['结尾放标志', '审阅中'], ['踩着拍子剪', '2 条评论'], ['用真实截屏', '周三截止'], ['渲染：214', '实时计数'], ['过一遍音效', '待混音']].map(([title, meta]) => ({ title, meta })),
    },
    board: { en: 'Teaser kickoff', zh: '预告片开工会' }, eyebrow: { en: 'Brief', zh: '简报' }, due: { en: 'Due Thursday', zh: '周四截止' },
    draft: { en: 'Draft', zh: '草稿' }, ready: { en: 'Ready', zh: '就绪' }, footer: { en: '2 leads · 9 shots', zh: '2 位负责 · 9 镜' }, action: { en: 'Share', zh: '共享' },
    readyAt: null, progress: [0.38, 0.72],
  }),
  plan(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', S = { ...s, lang, title: pick(s.title, lang) || '' }, T = timeline(S);
    return {
      beats: T.total / 15, reads: readTime(S.title, lang),
      cues: [{ beat: 2 / 15, kind: 'accent' }, { beat: TYPE0 / 15, kind: 'turn' }, { beat: T.ready / 15, kind: 'stamp' }],
      motion: [], settled: (T.gather + 28) / 15, shots: 1, peakAt: T.ready / 15, pause: { from: (T.gather + 28) / 15, to: T.total / 15 },
    };
  },
  validate(s, ctx = {}) { const n = (pick(s.people, ctx.lang || 'en') || []).length; return n < 3 || n > 5 ? [`people: ${n}, want 3–5`] : []; },
  prepare(s, ctx = {}) {
    const lang = ctx.lang || s.lang || 'en', P = {};
    for (const k of ['title', 'people', 'notes', 'board', 'eyebrow', 'due', 'draft', 'ready', 'footer', 'action']) P[k] = pick(s[k], lang);
    const S = { ...s, ...P, lang, notes: (P.notes || []).slice(0, 6) }, T = timeline(S), g = scratch(), tf = F(S, 'display', TFS, 760, 'display');
    const lines = wrap(g, S.title, tf, CARD.w - CARD.pad * 2, lang).slice(0, 2), glyphs = lines.map((l) => graphemes(l)), tg = graphemes(S.title);
    let pos = 0; const starts = glyphs.map((gs) => { const st = pos; pos += gs.length; while (tg[pos] === ' ') pos++; return st; });   // where each line starts among the keystrokes
    // the typist is the last person; the others take the crew's slots in order
    const n = S.people.length, crew = S.people.slice(0, n - 1), typist = S.people[n - 1];
    return { S, T, tf, lines, glyphs, starts, crew, typist, paths: TOOLS.map((d) => (typeof Path2D !== 'undefined' ? new Path2D(d) : null)) };
  },
  paint(ctx, u, s, cx, D) {
    const S = D.S, T = D.T, c = s.colors, f = u * 15, lang = S.lang;
    // tones: the typist in the accent, the crew in ink, dim and two mixes; a note is its author's tone over the panel
    const tones = [c.ink, mix(c.ink, c.accent, 0.45), mix(c.ink, c.dim, 0.5), c.dim], toneOf = (k) => (k >= D.crew.length ? c.accent : tones[k % 4]);
    const cam = lerp(1, 1.045, ramp(f, 0, T.total, 'swift')), camFar = lerp(1, 1.02, ramp(f, 0, T.total, 'swift'));
    const ready = ramp(f, T.ready, 8, 'out'), typingHold = clamp((f - 40) / 8), typed = T.at.filter((t) => f >= t).length;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    ctx.save(); ctx.translate(960, 540); ctx.scale(camFar, camFar); ctx.translate(-960, -540); ctx.fillStyle = rgba(c.ink, 0.13);
    for (let y = -40; y < 1120; y += 40) for (let x = -40; x < 1960; x += 40) { const d = Math.hypot((x - 960) / 1530, (y - 540) / 900); if (d < 1) { ctx.globalAlpha = Math.min(1, (1 - d) / 0.55); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(960, 518.4); ctx.scale(cam, cam); ctx.translate(-960, -518.4);
    // the notes: far ones a little smaller, softer and paler
    const nf = F(S, 'display', 36, 700), mf = F(S, 'text', 24, 560);
    S.notes.forEach((n, i) => {
      const N = NOTES[i], owner = N.owner % S.people.length, tone = toneOf(owner === S.people.length - 1 ? 99 : owner);
      ctx.save(); ctx.translate(N.x + 144, N.y + 116); ctx.rotate((N.rot * Math.PI) / 180); if (N.far) { ctx.scale(0.94, 0.94); ctx.globalAlpha = 0.78; ctx.filter = 'blur(1.4px)'; }
      ctx.translate(-144, -116);
      ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.22); ctx.shadowBlur = 34; ctx.shadowOffsetY = 18 - 8;
      rrect(ctx, 0, 0, 288, 232, 10); ctx.fillStyle = mix(c.panel, tone, 0.12); ctx.fill(); ctx.restore();
      const lines = wrap(ctx, n.title, nf, 236, lang).slice(0, 3);
      lines.forEach((l, k) => text(ctx, l, 26, 26 + 33 + k * 40, nf, { color: rgba(c.ink, 0.86) }));
      ctx.beginPath(); ctx.arc(26 + 7, 232 - 22 - 15, 7, 0, Math.PI * 2); ctx.fillStyle = tone; ctx.fill();
      text(ctx, n.meta ? `${S.people[owner]} · ${n.meta}` : S.people[owner], 26 + 24, 232 - 22 - 14, mf, { color: rgba(c.ink, 0.5), baseline: 'middle' });
      ctx.restore();
    });
    // the brief card
    ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.25); ctx.shadowBlur = 80; ctx.shadowOffsetY = 10;
    rrect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 28); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
    rrect(ctx, CARD.x + 0.5, CARD.y + 0.5, CARD.w - 1, CARD.h - 1, 28); ctx.lineWidth = 1; ctx.strokeStyle = c.line; ctx.stroke();
    const hx = CARD.x + CARD.pad, hy = CARD.y + CARD.pad + 20;
    const ef = { ...F(S, 'text', 26, 700) }; ef.spacing = (lang === 'zh' ? 0.04 : 0.06) * 26;
    let x = hx; text(ctx, S.eyebrow, x, hy + 1, ef, { color: c.dim, baseline: 'middle' }); x += measure(ctx, S.eyebrow, ef).width + 16;
    if (S.due) { ctx.beginPath(); ctx.arc(x + 2.5, hy, 2.5, 0, Math.PI * 2); ctx.fillStyle = c.dim; ctx.fill(); x += 21; text(ctx, S.due, x, hy + 1, F(S, 'text', 28, 520), { color: mix(c.ink, c.dim, 0.5), baseline: 'middle' }); }
    { const on = ready > 0.5, w0 = S[on ? 'ready' : 'draft'], sf = F(S, 'text', 26, 650), pw = measure(ctx, w0, sf).width + 36 + 22, px = CARD.x + CARD.w - CARD.pad - pw, k = 1 + 0.06 * Math.sin(Math.PI * ready);
      ctx.save(); ctx.translate(px + pw / 2, hy); ctx.scale(k, k); ctx.translate(-pw / 2, 0);
      rrect(ctx, 0, -22, pw, 44, 22); ctx.fillStyle = on ? rgba(c.accent, 0.1) : mix(c.panel, c.ink, 0.05); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = on ? rgba(c.accent, 0.3) : c.line; ctx.stroke();
      ctx.beginPath(); ctx.arc(18 + 6, 0, 6, 0, Math.PI * 2); ctx.fillStyle = on ? c.accent : c.dim; ctx.fill();
      text(ctx, w0, 18 + 22, 1, sf, { color: on ? c.accent : mix(c.ink, c.dim, 0.5), baseline: 'middle' }); ctx.restore(); }
    // the title, typed; the insertion point carries the typist's caret and arrow
    let ix = CARD.x + CARD.pad, iy = TITLE_TOP;
    D.glyphs.forEach((gs, li) => {
      const k = clamp(typed - D.starts[li], 0, gs.length), s0 = gs.slice(0, k).join(''), y = TITLE_TOP + li * TLH;
      if (s0) text(ctx, s0, CARD.x + CARD.pad, y + TFS * 0.86, D.tf, { color: c.ink });
      if (!li || typed >= D.starts[li]) { ix = CARD.x + CARD.pad + (s0 ? measure(ctx, s0, D.tf).width : 0); iy = y; }
    });
    const caretOn = typed < T.at.length || Math.floor(f / 9) % 2 === 0;
    if (f >= TYPE0 - 6 && caretOn) { rrect(ctx, ix + 3, iy + TFS * 0.86 - TFS * 0.8 - 4 + TFS * 0.06, 6, TFS * 0.92, 3); ctx.fillStyle = c.accent; ctx.fill(); }
    // footer: three avatars, the footer line, progress
    const fy = CARD.y + CARD.h - CARD.pad + 6 - 22, people = S.people, n = people.length, av = [n - 1, 0, 1];
    av.forEach((k, j) => { const ax = CARD.x + CARD.pad + 22 + j * 32; ctx.beginPath(); ctx.arc(ax, fy, 22, 0, Math.PI * 2); ctx.fillStyle = toneOf(k === n - 1 ? 99 : k); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.panel; ctx.stroke();
      text(ctx, graphemes(people[k])[0], ax, fy + 1, F(S, 'text', 20, 760), { color: c.panel, align: 'center', baseline: 'middle' }); });
    if (S.footer) text(ctx, S.footer, CARD.x + CARD.pad + 108 + 28, fy + 1, F(S, 'text', 30, 540), { color: mix(c.ink, c.dim, 0.5), baseline: 'middle' });
    const pr = lerp(S.progress[0], S.progress[1], ready), bxe = CARD.x + CARD.w - CARD.pad - 70 - 28;
    rrect(ctx, bxe - 260, fy - 5, 260, 10, 5); ctx.fillStyle = mix(c.panel, c.ink, 0.05); ctx.fill(); ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.stroke();
    rrect(ctx, bxe - 260, fy - 5, 260 * pr, 10, 5); ctx.fillStyle = c.accent; ctx.fill();
    text(ctx, `${Math.round(pr * 100)}%`, CARD.x + CARD.w - CARD.pad, fy + 1, F(S, 'text', 30, 650), { color: c.ink, align: 'right', baseline: 'middle' });
    // the typist's arrow, riding the insertion point (steady while typing)
    const rs = springAt(f - TYPIST.delay, { damping: 16, stiffness: 70, mass: 1 }), a0 = [CARD.x + CARD.pad, TITLE_TOP + TFS * 0.86 - TFS * 0.74];
    const rDrift = 1 - typingHold * (f < T.end + 6 ? 1 : 1 - clamp((f - T.end - 6) / 14) * 0.75);
    const tipX = ix + (TYPIST.from[0] - a0[0]) * (1 - rs) + 12 + Math.sin(f * 0.06 + 1) * 18 * rDrift + 2, tipY = iy + TFS * 0.86 - TFS * 0.74 + (TYPIST.from[1] - a0[1]) * (1 - rs) - 8 + Math.cos(f * 0.05) * 14 * rDrift + 2;
    const draw = (x0, y0, tone, name, show) => { const cc = { ...c, ink: tone, tag: tone }; drawCursor(ctx, x0, y0, { h: CH, form: 'solid', colors: cc, rim: 1.4 }); drawTag(ctx, x0, y0, name, { h: CH, tone: 'tag', show, colors: cc, lang, look: S.look || NEUTRAL, size: 26 }); };
    draw(tipX, tipY, c.accent, D.typist, ramp(f, TYPIST.delay + 12, 12, 'out'));
    D.crew.forEach((name, i) => { const [x0, y0] = crewAt(i, f, T); draw(x0 + 2, y0 + 2, toneOf(i), name, ramp(f, CREW[i].delay + 10, 12, 'out')); });
    ctx.restore();
    // chrome (not under the camera): the board's name, the avatar stack with the share key, the toolbar
    rrect(ctx, 64, 48, 48, 48, 14); ctx.fillStyle = c.ink; ctx.fill();
    [[0, 0], [1, 0], [0, 1]].forEach(([a, b]) => { rrect(ctx, 64 + 13 + a * 12, 48 + 13 + b * 12, 10, 10, 2.5); ctx.fillStyle = c.panel; ctx.fill(); });
    text(ctx, S.board, 64 + 48 + 18, 72 + 1, F(S, 'display', 32, 700), { color: c.ink, baseline: 'middle' });
    let rx = 1920 - 64;
    if (S.action) { const af = F(S, 'text', 26, 680), aw = measure(ctx, S.action, af).width + 44; rx -= aw; ctx.save(); ctx.shadowColor = rgba(c.accent, 0.5); ctx.shadowBlur = 20; ctx.shadowOffsetY = 4; rrect(ctx, rx, 46, aw, 52, 26); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore(); text(ctx, S.action, rx + aw / 2, 72 + 1, af, { color: c.onAccent || c.panel, align: 'center', baseline: 'middle' }); rx -= 18; }
    const pops = people.map((_, i) => springAt(f - ((i === n - 1 ? TYPIST.delay : CREW[i]?.delay ?? 22) + 8), { damping: 15, stiffness: 190 }));
    for (let i = n - 1; i >= 0; i--) {
      const p = pops[i], slot = (i ? 42 : 56) * clamp(p), cx0 = rx - 28; rx -= slot;
      if (p <= 0.001) continue;
      const tone = toneOf(i === n - 1 ? 99 : i);
      ctx.save(); ctx.translate(cx0, 72); ctx.scale(p, p); ctx.globalAlpha = clamp(p * 3);
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fillStyle = tone; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.panel; ctx.stroke();
      text(ctx, graphemes(people[i])[0], 0, 1, F(S, 'text', 24, 760), { color: c.panel, align: 'center', baseline: 'middle' }); ctx.restore();
    }
    const tbw = 6 * 52 + 5 * 6 + 28, tbx = 960 - tbw / 2, tby = 1080 - 40 - 72;
    ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.2); ctx.shadowBlur = 36; ctx.shadowOffsetY = 2; rrect(ctx, tbx, tby, tbw, 72, 22); ctx.fillStyle = rgba(c.panel, 0.92); ctx.fill(); ctx.restore();
    rrect(ctx, tbx + 0.5, tby + 0.5, tbw - 1, 71, 22); ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.stroke();
    D.paths.forEach((p, i) => {
      const bx = tbx + 14 + i * 58; if (i === 2) { rrect(ctx, bx, tby + 10, 52, 52, 14); ctx.fillStyle = rgba(c.accent, 0.1); ctx.fill(); }
      if (!p) return; ctx.save(); ctx.translate(bx + 13, tby + 23); ctx.strokeStyle = i === 2 ? c.accent : mix(c.ink, c.dim, 0.5); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
    });
  },
  // the first and third of the crew: their cursor boxes' corners on the board (before the camera), like the upstream's
  track(u, s, cx, D) {
    const f = u * 15;
    return [crewAt(0, f, D.T), crewAt(Math.min(2, D.crew.length - 1), f, D.T)];
  },
};

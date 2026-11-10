// doc-findings — the source document parks at the left edge, still being read (a slow scroll), while findings are
// dealt one at a time on the right as pills; each finding marks its evidence line in the document, a thin accent line
// joins the two, and a one-line caption under the pill darkens word by word and clears before the next.
// Adapted from video-shotcraft demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx (card
// references/shots/ui-entrance/doc-park-left-pill-deal.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D scene brick (no React or Remotion); the document is the doc-page prop with the
// film's lines (sample copy by default); the park (slide left 55 % of its width, scale 0.92 about the left edge), the
// slow deal (findings 0.22 of the shot apart, opacity fast and position slow with a back-out), the evidence marker and
// connector, and the caption's darken-then-clear grammar keep the upstream timing; the scroll brakes over the last
// 20 % so the scene lands still; the pill icons are neutral line glyphs (hub-links); the light backdrop is the ground
// role with a soft accent light and a vignette, without grain; colours by role.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { cubicInOut } from '../../../motion.js';
import { breaks, fontFor, units } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';
import { DOC, docLines, layoutDoc, paintDoc, docShadow } from '../../prop/doc-page/brick.js';
import { GLYPHS } from '../hub-links/brick.js';
import { pathGeom, subPath } from '../../motion/path-flow/brick.js';

const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);
const FRAMES = 174;
const L = { x: 216, y: 160, park: 0.55, shrink: 0.92, scroll: 480 };   // the page before parking (film px)
const PILL = { x: 936, y: 276, w: 688, h: 136, gap: 56 };
const outQuad = (u) => 1 - (1 - clamp(u)) * (1 - clamp(u));
const outBack = (u) => { const s = 1.70158; u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const startsOf = (n) => (n === 3 ? [0.26, 0.48, 0.7] : Array.from({ length: n }, (_, k) => 0.26 + k * (0.66 / Math.max(1, n - 1)) * (n === 2 ? 0.66 : 1)));
const glyph = (ctx, name, cx, cy, size, color) => {
  ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 24, size / 24);
  ctx.beginPath(); (GLYPHS[name] || GLYPHS.page)(ctx);
  ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
};

export default {
  id: 'doc-findings', kind: 'scene',
  fits: ['demo', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 10, max: 14 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: [], props: ['doc-page'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    doc: { type: 'list', count: [10, 40], of: { kind: { type: 'enum', of: ['title', 'meta', 'h', 'p'] }, text: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 12, chars: 64 }, zh: { chars: 28 } } }, mark: { type: 'number', optional: true } } },
    findings: { type: 'list', count: [2, 3], of: {
      name: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 18 }, zh: { chars: 7 } } },
      value: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 6 }, zh: { chars: 6 } } },
      caption: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 7, chars: 40 }, zh: { chars: 16 } } },
      glyph: { type: 'enum', of: Object.keys(GLYPHS), optional: true },
    } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'The source document parks at the left, still being read, while findings are dealt one by one on the right, each tied to its evidence line.',
  defaults: () => ({ doc: null, findings: null }),
  plan(s, ctx) {
    const n = s.findings ? s.findings.length : 3, T0 = startsOf(n), beats = FRAMES / 15;
    const caps = (s.findings || []).map((f) => f.caption);
    return { beats, reads: (caps.length ? caps : ['claim', 'titleLong', 'subtitle'].map((k) => copy(k, ctx.lang))).map((t) => ({ text: t, lang: ctx.lang })),
      cues: T0.map((f) => ({ beat: (f * (FRAMES - 1)) / 15, kind: 'accent' })), peakAt: null, settled: beats - 0.3 };
  },
  validate(s, ctx) {
    const err = [], n = (s.findings || []).length;
    if (s.findings && (n < 2 || n > 3)) err.push(`findings: ${n} (2–3; more do not leave a caption time to be read)`);
    for (const f of s.findings || []) if (f.caption && units(f.caption, ctx.lang) > (ctx.lang === 'zh' ? 16 : 7)) err.push(`caption too long: ${f.caption}`);
    if (s.doc && s.findings && s.findings.some((_, k) => !s.doc.some((l) => l.mark === k))) err.push('every finding needs a doc line with its mark');
    return err;
  },
  prepare(P) {
    const kpis = copy('kpis', P.lang), caps = ['claim', 'titleLong', 'subtitle'].map((k) => copy(k, P.lang)), glyphs = ['page', 'card', 'wave'];
    const findings = (P.findings || kpis.map((k, i) => ({ name: k.label, value: k.delta, caption: caps[i] }))).map((f, i) => ({ glyph: glyphs[i % 3], ...f }));
    const lines = P.doc || docLines(P.lang), lay = layoutDoc(lines, 1 / L.shrink);
    return { findings, n: findings.length, T0: startsOf(findings.length), lines, lay, words: findings.map((f) => breaks(f.caption, P.lang)) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const t = p, park = cubicInOut(seg(t, 0.06, 0.24));
    const a = 0.8, u = clamp((t - a) / (1 - a));   // a steady read that brakes over the last fifth
    const scroll = L.scroll * (t <= a ? t : a + (1 - a) * (u - (u * u) / 2));
    const items = D.T0.map((f, k) => {
      const ce = k < D.n - 1 ? D.T0[k + 1] - 0.03 : 0.98, cs = f + 0.05;
      return { o: outQuad(seg(t, f, f + 0.035)), b: outBack(seg(t, f, f + 0.062)), mark: EASE.out(seg(t, f + 0.06, f + 0.13)),
        draw: EASE.out(seg(t, f + 0.04, f + 0.11)), fade: 1 - EASE.out(seg(t, ce - 0.06, ce - 0.01)),
        show: seg(t, cs, cs + 0.02), inn: seg(t, cs, cs + (ce - cs) * 0.7), out: t >= ce ? 1 : outQuad(seg(t, ce - 0.05, ce)) };
    });
    return { t, park, tx: -L.park * DOC.w * park, sc: lerp(1, L.shrink, park), scroll, items };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, ts = 1 / L.shrink;
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    const lite = mix(c.ground, '#ffffff', 0.6);   // a soft light up right (one colour per gradient: no tint in between)
    for (const [col, a, r] of [[lite, 0.6, 1000], [c.accent, 0.035, 760]]) {
      const lg = ctx.createRadialGradient(1152, 260, 0, 1152, 260, r);
      lg.addColorStop(0, rgba(col, a)); lg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = lg; ctx.fillRect(0, 0, 1920, 1080);
    }
    // the page, parked about its left-middle
    const ox = L.x + S.tx, oy = L.y + (DOC.h / 2) * (1 - S.sc);
    ctx.save(); ctx.translate(ox, oy); ctx.scale(S.sc, S.sc);
    docShadow(ctx, DOC.w, DOC.h, 8, c);
    const ends = paintDoc(ctx, D.lines, D.lay, P, { scroll: S.scroll, marks: S.items.map((it) => it.mark), ts });
    ctx.restore();
    const toScreen = ([x, y]) => [ox + S.sc * x, oy + S.sc * (y - S.scroll)];
    // connectors: from the end of each evidence line to its pill, drawn on, cleared with its caption
    S.items.forEach((it, k) => {
      if (it.draw <= 0 || it.fade <= 0 || !ends[k]) return;
      const [ax, ay] = toScreen(ends[k]), bx = PILL.x - 12, by = PILL.y + k * (PILL.h + PILL.gap) + PILL.h / 2, mx = (ax + 18 + bx) / 2;
      const g = pathGeom([['M', ax + 18, ay], ['C', mx, ay, mx, by, bx, by]], 4);
      ctx.save(); ctx.globalAlpha = 0.9 * it.fade; ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
      if (subPath(ctx, g, 0, g.len * it.draw)) ctx.stroke();
      ctx.globalAlpha = 0.9 * it.fade * Math.min(1, it.draw * 3); ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(ax + 18, ay, 6.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    // the pills and their captions
    const info = infoSize(P.lang), nf = F(P, 'display', 50, 640, 'display'), vf = F(P, 'mono', info + 4, 500, 'label'), cf = F(P, 'text', 44, 600);
    S.items.forEach((it, k) => {
      if (it.o <= 0) return;
      const f = D.findings[k], y0 = PILL.y + k * (PILL.h + PILL.gap), { w, h } = PILL, R = h / 2;
      ctx.save(); ctx.globalAlpha = it.o;
      ctx.translate(PILL.x + w / 2, y0 + h / 2 + lerp(56, 0, it.b)); const s = lerp(0.94, 1, it.b); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
      const e = lerp(56, 16, clamp(it.b)), tone = mix(c.ink, '#000000', 0.6);
      ctx.save();
      for (const [bl, dy, a] of [[2 + e * 0.2, 1 + e * 0.1, 0.12], [8 + e * 1.1, 3 + e * 0.5, 0.14]]) { ctx.shadowColor = rgba(tone, a); ctx.shadowBlur = bl; ctx.shadowOffsetY = dy; rrect(ctx, 2, 2, w - 4, h - 4, R); ctx.fillStyle = c.panel; ctx.fill(); }
      ctx.restore();
      const fg = ctx.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, mix(c.panel, '#ffffff', 0.5)); fg.addColorStop(1, c.panel);
      rrect(ctx, 0, 0, w, h, R); ctx.fillStyle = fg; ctx.fill();
      rrect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, R); ctx.strokeStyle = rgba(c.ink, 0.09); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(28 + 42, h / 2, 42, 0, Math.PI * 2); ctx.fillStyle = rgba(c.accent, 0.1); ctx.fill(); ctx.strokeStyle = rgba(c.accent, 0.18); ctx.lineWidth = 2; ctx.stroke();
      glyph(ctx, f.glyph, 70, h / 2, 48, c.accent);
      text(ctx, f.name, 144, h / 2 + 17, nf, { color: c.ink });
      if (f.value) text(ctx, f.value, w - 48, h / 2 + 11, vf, { color: c.dim, align: 'right' });
      ctx.restore();
      // the caption: every word starts as a placeholder grey, darkens in turn, then turns back and the line clears
      if (it.show <= 0 || it.out >= 1) return;
      const words = D.words[k], n = words.length, st = 0.78 / n, win = st * 1.5, stw = 0.55 / n, row = it.out > 0 ? clamp(1 - (it.out - 0.7) / 0.3) : it.show;
      const parts = words.map((u, i) => (i ? u.sep : '') + u.w), ghost = mix(c.dim, c.ground, 0.45);
      let x = PILL.x + 16;
      ctx.save(); ctx.globalAlpha = row;
      parts.forEach((s2, i) => {
        let q = clamp((it.inn - i * st) / win);
        if (it.out > 0) q = 1 - clamp((it.out - i * stw) / (stw * 1.4));
        text(ctx, s2, x, y0 + h + 28 + 44, cf, { color: mix(ghost, c.ink, q) });
        x += measure(ctx, s2, cf).width;
      });
      ctx.restore();
    });
    const vg = ctx.createRadialGradient(960, 540, 560, 960, 540, 1160);
    vg.addColorStop(0, rgba(mix(c.ink, '#000000', 0.5), 0)); vg.addColorStop(1, rgba(mix(c.ink, '#000000', 0.5), 0.12));
    ctx.fillStyle = vg; ctx.fillRect(0, 0, 1920, 1080);
  },
  // the page's right edge (middle) and every pill's centre
  track(S, P, D) {
    const ox = L.x + S.tx, oy = L.y + (DOC.h / 2) * (1 - S.sc);
    return [[ox + S.sc * DOC.w, oy + (S.sc * DOC.h) / 2], ...S.items.map((it, k) => [PILL.x + PILL.w / 2, PILL.y + k * (PILL.h + PILL.gap) + PILL.h / 2 + lerp(56, 0, it.b)])];
  },
  blur: () => false,
};

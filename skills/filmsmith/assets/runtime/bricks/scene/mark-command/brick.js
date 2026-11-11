// mark-command — the lock-up: the card splits into as many pieces as the product's mark has parts, and each flies on
// a bent arc into its part, filling with the ink; a target ring draws where the mark's dot belongs; the point grows
// back out of the last accent element (the Run button), hops in on an arc and lands as the dot on beat 2 (squash);
// the name wipes out of the mark, the tagline rises, the closing command types on (60 characters a second) and holds;
// on the last bar's downbeat the rows of the mark press once (the second move).
// From the morph template's `mark` scene (assets/templates/morph/film.js drawMark, markLayout, piecesOf, batonOf;
// choreo.js mark): grid unit 30 px, the arcs, ring, hop and beats are the template's. The name and the command stay
// as written in every language; the tagline follows `lang`.
import { FOCUS, W, SZ, secs, prog, spr, colorsOf, groundOf, loadFonts, productOf, sans, mono, tw, txt, riseText, fillShape, strokeShape, clipShape, runRect, mix, lerp, cubicOut, cubicInOut, expOut, readTime, clamp } from '../../motion/outline-morph/ink.js';
import { cardContents, TABS, DEFAULT as CARD } from '../../prop/code-card/brick.js';

const DEFAULT = {
  en: { ...CARD.en, line: 'docs from one spec', cmd: 'npx quillstack build invoices.yaml' },
  zh: { ...CARD.zh, line: '一份规格，生成全部文档', cmd: 'npx quillstack build invoices.yaml' },
};
const U = 30, GAP = 72, CPS = 60, HOLD = 3;
const BT = { ring: 1.25, hop: 1.44, land: 2, name: 2, line: 2.5, cmd: 3.5 };
const layoutOf = (ctx, P, L) => {
  const m = P.mark, mw = Math.max(...m.parts.map(([x, , w]) => x + w), m.dot[0] + m.dot[2]) * U, mh = Math.max(...m.parts.map(([, y, , h]) => y + h), m.dot[1] + m.dot[2]) * U;
  const nf = sans(L, SZ.mark, 700, 'mark'), nameW = tw(ctx, nf, P.name), total = mw + GAP + nameW;
  const mx = Math.round((W - total) / 2), my = Math.round(540 - mh / 2 - 30), rowsH = Math.max(...m.parts.map(([, y, , h]) => y + h)) * U;
  return { mx, my, nf, nameW, total, nameX: mx + mw + GAP, base: Math.round(my + rowsH / 2 + SZ.mark * 0.36),
    parts: m.parts.map(([x, y, w, h]) => [mx + x * U, my + y * U, w * U, h * U, Math.min((h * U) / 2, 0.5 * U)]), dot: [mx + m.dot[0] * U, my + m.dot[1] * U, m.dot[2] * U] };
};
const piecesOf = (n, gap) => { const R = FOCUS, rows = Math.ceil(n / 2), cw = R[2] / 2, ch = R[3] / rows; return Array.from({ length: n }, (_, i) => [R[0] + (i % 2) * cw + gap / 2, R[1] + Math.floor(i / 2) * ch + gap / 2, cw - gap, ch - gap, Math.min(R[4], (ch - gap) / 2)]); };
const beatsOf = (s, c) => {
  const typed = s.cmd ? BT.cmd + ([...s.cmd].length / CPS) * (c.bpm / 60) : null;
  const read = BT.line + ((readTime(s.line, c.lang) + 0.6) * c.bpm) / 60;
  return { typed, beats: clamp(Math.ceil(Math.max(read + 1, BT.line + 4, typed != null ? typed + (HOLD * c.bpm) / 60 : 0)), 8, 14) };
};

export default {
  id: 'mark-command', kind: 'scene',
  fits: ['close'],
  surface: ['canvas'],
  beats: { min: 8, max: 14 },
  needs: { motions: ['converge-mark'], props: ['code-card'], roles: ['ground', 'paper', 'ink', 'dim', 'accent'], type: ['display', 'mono'] },
  slots: {
    line: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 26 }, zh: { chars: 12 } } },
    cmd: { type: 'code', tier: 'primary', optional: true, limits: { en: { chars: 36 }, zh: { chars: 36 } } },
  },
  roles: ['ground', 'paper', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], tabs: TABS, from: 'card', corners: 'round' }),
  plan(s, ctx) {
    const b = beatsOf(s, ctx);
    return { beats: b.beats, reads: [{ text: productOf(s).name, lang: 'en' }, { text: s.line, lang: ctx.lang }, { text: s.cmd, lang: 'en' }],
      cues: [{ beat: 0, kind: 'turn' }, { beat: BT.land, kind: 'hit' }, { beat: BT.line, kind: 'land' }, ...(s.cmd ? [{ beat: BT.cmd, kind: 'type' }] : []), { beat: b.beats - 4, kind: 'accent' }],
      motion: 'the card splits into the mark; the point lands as its dot', settled: b.typed ?? BT.line + 0.5, peakAt: BT.land, pause: b.beats - (b.typed ?? BT.line) };
  },
  validate(s) { const P = productOf(s); return P.mark?.parts?.length ? [] : ['product.mark.parts: the mark, in grid units']; },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, bpm = c.bpm, t = secs(u, bpm), K = s.corners, P = productOf(s), tabs = s.tabs?.length ? s.tabs : TABS;
    const T = Object.fromEntries(Object.entries(BT).map(([k, v]) => [k, secs(v, bpm)])), b = D.b || (D.b = beatsOf(s, c));
    groundOf(ctx, s, C);
    const ml = D.ml || (D.ml = layoutOf(ctx, P, L)), n = ml.parts.length, out = prog(t, 0, 0.1);
    // the card's content leaves first (0.1 s)
    if (out < 1 && s.from !== 'none') {
      fillShape(ctx, FOCUS, C.paper, K); strokeShape(ctx, FOCUS, C.ink, 3, K);
      ctx.save(); clipShape(ctx, FOCUS, K); ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
      cardContents(ctx, { ...s, tabs }, 0, { enter: -20, code: -20, tabs: tabs.map((_, i) => -20 + i), arm: -20 }, C, L);
      ctx.restore();
    }
    // the second move: on the last bar's downbeat each row of the mark presses 8 px, 30 ms apart
    const second = secs(b.beats - 4, bpm), press = (row) => (t < second - 0.2 ? 0 : 8 * Math.sin(Math.PI * clamp((t - (second - 0.1 + row * 0.03)) / 0.2)));
    const rowOf = (y) => Math.round((y - ml.my) / U);
    const from = piecesOf(n, 16 * cubicOut(prog(t, 0, 0.12)));
    const sorted = ml.parts.map((p) => p).sort((a, q) => a[1] - q[1] || a[0] - q[0]), fromS = from.slice().sort((a, q) => a[1] - q[1] || a[0] - q[0]);
    if (t >= 0.12 || s.from === 'none') sorted.forEach((to, j) => {
      const a = fromS[j], c0 = [a[0] + a[2] / 2, a[1] + a[3] / 2], c1 = [to[0] + to[2] / 2, to[1] + to[3] / 2], dist = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) || 1;
      const e = s.from === 'none' ? 1 : cubicInOut(prog(t, 0.12 + j * 0.02, 0.24 + dist / 3800));
      const bend = (j % 2 ? 1 : -1) * 0.18 * dist, dx = c1[0] - c0[0], dy = c1[1] - c0[1];
      const qx = (c0[0] + c1[0]) / 2 - (dy / dist) * bend, qy = (c0[1] + c1[1]) / 2 + (dx / dist) * bend;
      const A = (1 - e) ** 2, Bq = 2 * e * (1 - e), Cq = e * e, cx = A * c0[0] + Bq * qx + Cq * c1[0], cy = A * c0[1] + Bq * qy + Cq * c1[1];
      const w = lerp(a[2], to[2], e), h = lerp(a[3], to[3], e), R = [cx - w / 2, cy - h / 2 + (e >= 1 ? press(rowOf(to[1])) : 0), w, h, lerp(a[4], to[4], e)];
      fillShape(ctx, R, mix(C.paper, C.ink, e), K);
      if (e < 1) strokeShape(ctx, R, C.ink, 3 * (1 - e), K);
    });
    // the target ring, drawn before the point arrives; it closes onto the point as it lands
    const [dx0, dy0, dr] = ml.dot;
    if (t >= T.ring) {
      const sweep = cubicOut(prog(t, T.ring, 0.2)), close = cubicOut(prog(t, T.land, 0.1));
      if (close < 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(dx0, dy0, lerp(dr + 14, dr, close), -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2); ctx.stroke(); }
    }
    // the point: grows out of the Run button (the last accent), waits, hops in on an arc, lands on beat 2
    const bt = runRect(), b0 = [bt[0] + bt[2] / 2, bt[1] + bt[3] / 2], shrink = cubicInOut(prog(t, 0, 0.3));
    if (shrink < 1) fillShape(ctx, [b0[0] - lerp(bt[2], 28, shrink) / 2, b0[1] - lerp(bt[3], 28, shrink) / 2, lerp(bt[2], 28, shrink), lerp(bt[3], 28, shrink), lerp(bt[4], 14, shrink)], C.accent);
    else {
      let px = b0[0], py = b0[1], r = 14;
      if (t >= T.hop) {
        const e = cubicInOut(prog(t, T.hop, T.land - T.hop)), q = [(b0[0] + dx0) / 2 + 60, Math.min(b0[1], dy0) - 240];
        const A = (1 - e) ** 2, Bq = 2 * e * (1 - e), Cq = e * e;
        px = A * b0[0] + Bq * q[0] + Cq * dx0; py = A * b0[1] + Bq * q[1] + Cq * dy0; r = lerp(14, dr, cubicOut(e));
      }
      const sq = t > T.land ? 0.12 * Math.exp(-14 * (t - T.land)) * Math.sin(40 * (t - T.land)) : 0;
      ctx.save(); ctx.translate(px, py + (t > T.land ? press(rowOf(dy0)) : 0)); ctx.scale(1 + sq, 1 - sq);
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // the lock-up: the name wipes out of the mark; the tagline rises; the command types on
    if (t >= T.name) {
      const k = expOut(prog(t, T.name, 0.28));
      ctx.save(); ctx.beginPath(); ctx.rect(ml.nameX - 8, ml.base - SZ.mark, (ml.nameW + 40) * k, SZ.mark * 1.3); ctx.clip();
      txt(ctx, P.name, ml.nameX, ml.base, ml.nf, C.ink); ctx.restore();
    }
    riseText(ctx, s.line, ml.nameX + 4, ml.base + 84, sans(L, SZ.main, 600), C.dim, spr(t - T.line, 22));
    if (s.cmd && t >= T.cmd) {
      const chars = [...s.cmd], nch = Math.min(chars.length, Math.floor((t - T.cmd) * CPS + 1e-6)), shown = chars.slice(0, nch).join(''), y = ml.base + 168, f = mono(SZ.main);
      txt(ctx, shown, ml.nameX + 4, y, f, C.ink);
      if (t < T.cmd + chars.length / CPS + 0.4) { ctx.fillStyle = C.ink; ctx.fillRect(ml.nameX + 4 + tw(ctx, f, shown) + 4, y - 36, 4, 44); }
    }
  },
  track(u, s, c, D) { return D.ml ? [[D.ml.dot[0], D.ml.dot[1]]] : [[960, 540]]; },
};

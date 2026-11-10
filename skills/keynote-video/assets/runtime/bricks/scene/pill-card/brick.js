// pill-card — a plane out of a line: the endpoint's baseline thickens upward into the request pill around its own text
// (the text knocked out of the ink), the swapped token hands the accent to the action chip, the chip is pressed; then a
// container transform grows the pill into the response card (the old content leaves first, the status and the body
// enter on beats; the status chip gives up the accent). `form: 'schema'`: the same card re-read as its schema, the
// header swapped for the type's name, type chips rising into each field in the accent and settling to outlines.
// From the morph template's `press` and `card` scenes (assets/templates/morph/film.js pressState, drawPressContents,
// cardHeader, cardBody, schemaChips; choreo.js press, card): geometry, springs and beats are the template's.
import { CX, LY, LINE_TH, SZ, W, H, PAD, CARD, secs, prog, spr, colorsOf, groundOf, loadFonts, lineLayout, lineText, pillRect, productOf, jsonLines, metaLine,
  sans, mono, tw, txt, fillShape, strokeShape, clipShape, shapePath, lerp, lerpR, mix, crit, cubicOut, leaving, entering, readTime, clamp } from '../../motion/outline-morph/ink.js';

const DEFAULT = {
  en: { line: 'GET /v2/invoices/{id}', swap: ['{id}', 'inv_8KQ2'], action: 'Send', name: 'Invoice', schemaWord: 'schema' },
  zh: { line: 'GET /v2/invoices/{id}', swap: ['{id}', 'inv_8KQ2'], action: '发送', name: 'Invoice', schemaWord: '结构' },
};
// beats: response — the pill grows on 0, the accent goes to the chip on 1, the press on 3, the card on 4, the header
// and the first half of the body on 5, the rest on 6, the status chip settles on 7; schema — the header swaps on 0,
// the chips rise on 1, settle on 3
const B = { release: 1, chip: 1, press: 3, card: 4, head: 5, bodyB: 6, settle: 7 };
const SB = { head: 0, chips: 1, settle: 3 };

// the line's last frame (point-line at rest): its rect and its text, swap done
const lineEnd = (Lx) => [CX - Lx.Lw1 / 2, LY - LINE_TH / 2, Lx.Lw1, LINE_TH, LINE_TH / 2];
const pressR = (D, t, T) => {
  const from = lineEnd(D.Lx), to = D.pill.R;
  const kH = spr(t, 14), kW = spr(t - 0.06, 22);
  const x = lerp(from[0], to[0], kW), w = lerp(from[2], to[2], kW);
  const bot = lerp(from[1] + from[3], to[1] + to[3], kH), top = lerp(from[1], to[1], kH);
  const press = T.press != null ? 1 - 0.04 * (crit(t - T.press, 34) - crit(t - T.press - 0.08, 34)) : 1;
  const cx = x + w / 2, cy = (top + bot) / 2, h = (bot - top) * press;
  return [cx - (w * press) / 2, cy - h / 2, w * press, h, h / 2];
};
const pressContents = (ctx, D, t, T, R, s, C, L) => {
  const Lx = D.Lx, textX = lerp(CX - Lx.textW / 2, R[0] + PAD, spr(t - 0.06, 26)), chipK = 1 - cubicOut(prog(t, T.release, 0.2));
  // above the pill the text is ink on the ground; inside it, knocked out of the ink
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); shapePath(ctx, R[0], R[1], R[2], R[3], R[4], { begin: false, corners: s.corners }); ctx.clip('evenodd');
  ctx.beginPath(); ctx.rect(0, 0, W, LY - LINE_TH / 2 - 2); ctx.clip();
  lineText(ctx, Lx, 99, 0, textX, C, { color: C.ink, chipK });
  ctx.restore();
  ctx.save(); clipShape(ctx, R, s.corners);
  lineText(ctx, Lx, 99, 0, textX, C, { color: C.ground, chipK });
  if (s.action && t >= T.chip) {
    const k = spr(t - T.chip, 24), cw = D.pill.chipW, ch = 76, cx = R[0] + R[2] - 28 - cw, cy = R[1] + R[3] / 2;
    fillShape(ctx, [cx, cy - ch / 2 + (1 - k) * 90, cw, ch, ch / 2], C.accent, s.corners);
    txt(ctx, s.action, cx + cw / 2, cy + 15 + (1 - k) * 90, sans(L, SZ.main, 600), C.onAccent, { align: 'center' });
  }
  ctx.restore();
};
const cardHeader = (ctx, R, t, T, P, C, corners) => {
  const x = R[0] + 64, y = R[1] + 104, st = String(P.call.status), f = mono(SZ.main, 600), cw = tw(ctx, f, st) + 36;
  const k = cubicOut(prog(t, T.settle, 0.2));
  fillShape(ctx, [x, y - 48, cw, 66, 12], mix(C.accent, C.ink, k), corners);
  if (k > 0) strokeShape(ctx, [x, y - 48, cw, 66, 12], mix(C.accent, C.inkDim, k), 2, corners);
  txt(ctx, st, x + 18, y, f, mix(C.onAccent, C.ground, k));
  txt(ctx, metaLine(P), x + cw + 24, y, mono(SZ.main), C.ground);
};
const cardBody = (ctx, R, t, T, P, C, split) => {
  const lines = jsonLines(P), half = Math.ceil((lines.length - 2) / 2);
  lines.forEach((s, i) => {
    let a = 1, dy = 0;
    if (split) { const k = cubicOut(prog(t, i <= half ? T.head : T.bodyB, 0.2)); a = k; dy = 12 * (1 - k); if (k <= 0) return; }
    txt(ctx, s, R[0] + 64, R[1] + 196 + i * 60 + dy, mono(SZ.main), C.ground, { alpha: a });
  });
};
const schemaChips = (ctx, R, t, T, P, C, corners) => {
  const f = mono(SZ.body), settle = cubicOut(prog(t, T.settle, 0.2));
  P.body.forEach((fd, i) => {
    const k = spr(t - T.chips - i * 0.04, 24);
    if (k <= 0) return;
    const ry = R[1] + 196 + (i + 1) * 60, cw = tw(ctx, f, fd[2]) + 32, cx = R[0] + R[2] - 64 - cw, dy = (1 - k) * 50;
    ctx.save(); ctx.beginPath(); ctx.rect(R[0], ry - 46, R[2], 60); ctx.clip();
    fillShape(ctx, [cx, ry - 38 + dy, cw, 50, 25], mix(C.accent, C.ink, settle), corners);
    if (settle > 0) strokeShape(ctx, [cx, ry - 38 + dy, cw, 50, 25], mix(C.accent, C.inkDim, settle), 2, corners);
    txt(ctx, fd[2], cx + cw / 2, ry - 2 + dy, f, mix(C.onAccent, C.ground, settle), { align: 'center' });
    ctx.restore();
  });
};
const timesOf = (s, bpm) => Object.fromEntries(Object.entries(s.form === 'schema' ? SB : B).map(([k, v]) => [k, secs(v, bpm)]));

export default {
  id: 'pill-card', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 5, max: 11 },
  needs: { motions: ['outline-morph'], props: ['code-card'], roles: ['ground', 'ink', 'dim', 'accent', 'onAccent', 'inkDim'], type: ['display', 'mono'] },
  slots: {
    line: { type: 'code', tier: 'primary', limits: { en: { chars: 30 }, zh: { chars: 30 } } },
    swap: { type: 'list', count: [0, 2], of: { type: 'code' }, optional: true },
    action: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } },
    name: { type: 'code', tier: 'glance', limits: { en: { chars: 16 }, zh: { chars: 16 } } },
    schemaWord: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'onAccent', 'inkDim'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], form: 'response', corners: 'round' }),
  plan(s, ctx) {
    const schema = s.form === 'schema', P = productOf(s);
    const read = (readTime(jsonLines(P).join(' '), 'en') * 0.5 * ctx.bpm) / 60;
    const beats = schema ? clamp(Math.ceil(SB.settle + Math.max(1.5, read * 0.5)), 5, 7) : clamp(Math.ceil(B.settle + Math.max(1.5, read * 0.4)), 9, 11);
    return { beats, reads: [{ text: s.action, lang: ctx.lang }],
      cues: schema ? [{ beat: SB.head, kind: 'turn' }, { beat: SB.chips, kind: 'land' }, { beat: SB.settle, kind: 'accent' }]
        : [{ beat: 0, kind: 'turn' }, { beat: B.chip, kind: 'accent' }, { beat: B.press, kind: 'hit' }, { beat: B.card, kind: 'turn' }, { beat: B.head, kind: 'land' }, { beat: B.settle, kind: 'accent' }],
      motion: schema ? 'card re-read as schema' : 'line → pill → card (container transform)', settled: schema ? SB.settle + 0.5 : B.settle + 0.5, peakAt: schema ? SB.chips : B.press, pause: 1.5 };
  },
  validate(s) { const e = []; if (s.form !== 'schema' && !s.line) e.push('line: required'); return e; },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, t = secs(u, c.bpm), T = timesOf(s, c.bpm), P = productOf(s), K = s.corners;
    groundOf(ctx, s, C);
    if (!D.Lx) { D.Lx = lineLayout(ctx, s.line, s.swap); D.pill = pillRect(ctx, D.Lx, s.action, L); }
    if (s.form === 'schema') { // the card at rest, its header swapped for the schema's name, type chips rising
      const R = CARD;
      fillShape(ctx, R, C.ink, K);
      ctx.save(); clipShape(ctx, R, K);
      leaving(ctx, prog(t, 0, 0.1), () => cardHeader(ctx, R, 99, { settle: 0 }, P, C, K));
      entering(ctx, cubicOut(prog(t, 0.14, 0.15)), () => {
        const x = R[0] + 64, y = R[1] + 106;
        txt(ctx, s.name, x, y, sans(L, SZ.sub, 700), C.ground);
        txt(ctx, s.schemaWord, x + tw(ctx, sans(L, SZ.sub, 700), s.name) + 22, y, L === 'zh' ? sans(L, SZ.body, 600) : mono(SZ.body), C.inkDim);
      });
      cardBody(ctx, R, t, T, P, C, false);
      schemaChips(ctx, R, t, T, P, C, K);
      ctx.restore();
      return;
    }
    if (t < T.card) { // the press
      const R = pressR(D, t, T);
      fillShape(ctx, R, C.ink, K);
      pressContents(ctx, D, t, T, R, s, C, L);
      return;
    }
    // the card: a container transform from the pill (content out first, then the shape springs to the card)
    const tc = t - T.card, from = pressR(D, T.card, T), R = lerpR(from, CARD, spr(tc - 0.1, 18));
    fillShape(ctx, R, C.ink, K);
    ctx.save(); clipShape(ctx, R, K);
    leaving(ctx, prog(tc, 0, 0.1), () => pressContents(ctx, D, T.card, T, from, s, C, L));
    if (t >= T.head) {
      entering(ctx, cubicOut(prog(t, T.head, 0.15)), () => cardHeader(ctx, R, t, T, P, C, K));
      cardBody(ctx, R, t, T, P, C, true);
    }
    ctx.restore();
  },
  track(u, s, c) { return [[CX, LY]]; },
};

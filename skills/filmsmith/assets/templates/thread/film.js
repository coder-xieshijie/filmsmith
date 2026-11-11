// film.js — thread: one line colour that becomes everything, link by link.
//
// The chain is fixed choreography (the mode's signature); content.js fills its slots. Every link is a pure
// function of its local time u, measured in seconds at 120 BPM ("reference seconds", two beats each), so a
// different bpm scales the whole chain and every landing stays on the beat. How many bars each link holds
// comes from lib/timing.js fit() with ./timing.rules.js: entrances are timed from the link's start and exits
// from its end (D, the link's length in u), so a longer link lands at the same moment and holds longer.
// Hand-offs are computed from the neighbours:
// the word hands its first four glyph boxes to whatever follows; the merged sphere squashes into the line
// the next link starts from; the playhead becomes the full-height line the ink (or the flood) starts from.
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import { clamp, lerp, crit, expIn, expOut, expInOut, cubicOut, cubicInOut, smooth, rgba } from './lib/motion.js';
import { mulberry32, hash } from './lib/rng.js';
import { grainTile, subframes } from './lib/canvas.js';
import { fontsReady } from './lib/text.js';
import { boot } from './lib/boot.js';
import { createGL } from './gl.js';
import { mergeState, squashState, inkState, SQUASH_TIME, MERGED, LINE, PITCH, OPEN_OUT, CENTRE_NAME, NAME_IN, NAME_HOLD, NAME_OUT, nameAt, nameExit, namedLinks, closeSecondMove, SQUASH_EXIT, REVIEW_CUES as RC, RECEDE, THREADS, SWELL,
  OPEN, BRIEF_Y, openPlan, briefPhrases, PRESS, NAME_UNDER, RIDE, CLOSE, CARD, pressedName } from './shots.js';
import { createHandoff } from './lib/handoffs/index.js';
import { createTransitions } from './lib/transitions/index.js';
import { measure as hMeasure, scratch as hScratch, settle } from './lib/handoffs/util.js';
import { units } from './lib/timing.js';
import { W, H, FAMILY, SPECIMEN, FORMULA, TYPE, FONTS_TO_LOAD, SPEC, setFont, adv, textW, fitSize, typed, typedCount, rr, mix, shade, deepen, fill, facts, clearMeasure, contrast } from './fx.js';
import CONTENT from './content.js';
import PALETTES from './palettes.js';
import RULES from './timing.rules.js';

// ---------- registry ----------
// type → whether it may be left out, its drawing window in reference seconds ([lead before start, tail
// after end]), its fast moves (sub-frame motion blur windows, [from, to, sub-frames]) and the window in which
// it holds still enough for a contact-sheet tile. Windows are functions of D, the link's length in u, so
// exits stay anchored to the end. Bars come from fit() (timing.rules.js), never from here.
// `optional` links may be left out on their own; `head` and `tail` links only as the short chain allows
// (validation below): the head (open, word) together, the storyboard then entering from the line; the tail
// (tracks, review) together with curves and ink, the merge then handing its line straight to the close.
export const REGISTRY = {
  open: { head: true, win: [0, 0], blur: (D, S) => [[0, 0.45], [D - OPEN_OUT, D], ...(S ? [[openOf(S).flat0, openOf(S).flatEnd, 6], [openOf(S).out0, openOf(S).out0 + OPEN.contract, 6]] : [])], still: (D, S) => { const o = openOf(S); return [o.landed + 0.1, o.hug0]; } },
  word: { head: true, win: [-0.05, 0.3], blur: () => [[-0.05, 0.4]], still: (D) => [0.6, D - 0.1] },
  palette: { optional: true, win: [-0.05, 0], still: (D) => [0.6, D - 0.15] },
  storyboard: { win: [-0.05, 0], blur: (D, S) => (S && !S.prev ? [[0, 0.5, 10]] : []), still: (D) => [0.9, D] },
  merge: { win: [0, 0], blur: () => [[0.15, 0.85, 16]], still: (D) => [0.9, D - 0.5] },
  curves: { optional: true, win: [0, 0.5], blur: (D, S) => (shiftOf(S) ? [[PRESS.drop, PRESS.at - 0.1, 6]] : []), still: (D, S) => [RIDE.to + 0.1 + shiftOf(S), D] },
  tracks: { tail: true, win: [-0.05, 0.05], blur: (D) => [[0.45, 1.05, 10], [D - 1.0, D - 0.02, 10]], still: (D) => [1.5, D - 1.0] },
  ink: { optional: true, win: [0, 0.05], still: (D) => [1.0, D - 0.2] },
  review: { tail: true, win: [-0.25, 0], blur: (D) => [[RC.gather, 0.9], [RC.collapse, RC.collapse + 0.5, 10], [D - CARD.squash, D, 10]] },
  close: { win: [-0.1, 0], blur: (D) => { const c = CLOSE.cut + CLOSE.cutDur, u2 = closeSecondMove(D); return [[0.15, 0.65], [c, c + CLOSE.caret, 6], ...(u2 == null ? [] : [[u2 - OPEN.flat, u2, 6]])]; } },
};
const ORDER = Object.keys(REGISTRY);
const LIMITS = { phrase: 24, phraseWords: 5, wordMin: 4, wordMax: 7, stageName: 14, note: 40, track: 12, words: 14, count: 22, card: 4, name: 16, line: 52, url: 52 };

const C = CONTENT;
const P = PALETTES[C.palette] || PALETTES.vermilion;
const TIMING = fit(C, RULES); // bars per link, bpm and duration, from the copy (timing.rules.js)
const K = TIMING.bpm / 120; // reference seconds per real second
const FPS = C.fps || 30;
const G = grid({ bpm: TIMING.bpm });
const laid = TIMING.scenes.map((s, i) => ({ ...s, i, D: s.bars * 2 }));
laid.forEach((s, i) => { s.prev = laid[i - 1] || null; s.next = laid[i + 1] || null; });
const DUR = TIMING.duration;
const FRAMES = Math.ceil(DUR * FPS - 1e-6); // the frame count HyperFrames renders
const VARS = facts(TIMING, FPS); // {seconds} {frames} {fps} … for the copy, from the fitted length
const byType = (type) => laid.find((s) => s.type === type) || null;
const ROLE = { ground: P.text, field: P.onField, line: P.onLine };
const DEEP = deepen(P.line); // the spheres' shadow side: the line colour, linearly ×0.45, hue −4°

// ---------- validation: errors are painted on the frame so check and snapshot show them ----------
const errors = [];
(() => {
  if (!PALETTES[C.palette]) errors.push(`palette "${C.palette}" is not in palettes.js`);
  // the batch-2 options were settled on 2026-10-18 (TEMPLATE.md "Settled"); there are no variants left to pick
  if (C.variant) errors.push(`variant ${JSON.stringify(C.variant)}: thread has no variants since 2026-10-18 (the short flood and the name ending are the only behaviour); delete it`);
  let last = -1;
  for (const s of C.scenes) {
    const r = REGISTRY[s.type];
    if (!r) { errors.push(`unknown scene type "${s.type}"`); continue; }
    const k = ORDER.indexOf(s.type);
    if (k <= last) errors.push(`scene "${s.type}" is out of order (order: ${ORDER.join(' → ')})`);
    last = k;
  }
  const has = (t) => C.scenes.some((s) => s.type === t);
  for (const t of ORDER) if (!REGISTRY[t].optional && !REGISTRY[t].head && !REGISTRY[t].tail && !has(t)) errors.push(`required scene "${t}" is missing`);
  // the short chain: the head and the tail may each be left out as a whole (TEMPLATE.md "Short chain")
  if (has('open') !== has('word')) errors.push('open and word go together: leave both out (the storyboard then enters from the line) or keep both');
  if (has('palette') && !has('word')) errors.push('palette takes the word\'s glyphs: it needs word');
  if (has('tracks') !== has('review')) errors.push('tracks and review go together: leave both out (the merge then hands its line to the close) or keep both');
  if (!has('review') && (has('curves') || has('ink'))) errors.push('curves and ink need tracks and review: the short tail is merge → close');
  if (C.thread !== undefined && !THREADS.includes(C.thread)) errors.push(`thread "${C.thread}" is not one of ${THREADS.join(', ')}`);
  // fit(): a link whose copy cannot be read inside its ceiling is an error; tempo and target notes are warnings
  for (const n of TIMING.notes) if (n.level === 'error') errors.push(`${n.scene != null ? `scene ${n.scene} ` : ''}${n.msg}`);
  const lim = (v, n, what) => { if (v && String(v).length > n) errors.push(`${what} is ${String(v).length} chars (limit ${n}): "${v}"`); };
  for (const s of C.scenes) {
    if (s.stage) { lim(s.stage.name, LIMITS.stageName, 'stage.name'); lim(fill(s.stage.note, VARS), LIMITS.note, 'stage.note'); }
    if (s.type === 'open') {
      // the brief: one or two phrases, each one reading state (≤ 5 words, timing API 3); two make the loop (path-type)
      const ph = Array.isArray(s.brief) ? s.brief : [s.brief];
      if (!ph.length || ph.length > 2 || ph.some((x) => !String(x ?? '').trim())) errors.push('brief: one or two phrases (a string, or an array of two strings)');
      ph.forEach((x, k) => { const f = fill(x, VARS); lim(f, LIMITS.phrase, `brief phrase ${k + 1}`); if (units(f) > LIMITS.phraseWords) errors.push(`brief phrase ${k + 1} has ${units(f)} words (limit ${LIMITS.phraseWords}): "${f}"; split it into two phrases`); });
    }
    if (s.type === 'word') {
      const core = String(s.word || '').replace(/[.!?]$/, '');
      if (core.length < LIMITS.wordMin || core.length > LIMITS.wordMax) errors.push(`word "${s.word}" needs ${LIMITS.wordMin}–${LIMITS.wordMax} letters before its mark`);
    }
    if (s.type === 'tracks') { if (!Array.isArray(s.tracks) || s.tracks.length !== 4) errors.push('tracks needs 4 names'); else s.tracks.forEach((n) => lim(n, LIMITS.track, 'track name')); }
    if (s.type === 'ink') lim(s.words, LIMITS.words, 'ink words');
    if (s.type === 'review') { lim(s.count, LIMITS.count, 'review.count'); lim(s.card, LIMITS.card, 'review.card'); }
    if (s.type === 'close') { lim(s.name, LIMITS.name, 'close.name'); lim(s.line, LIMITS.line, 'close.line'); lim(s.url, LIMITS.url, 'close.url'); }
  }
  if (contrast(P.text, P.ground) < 4.5) errors.push('palette: text on ground < 4.5:1');
  if (contrast(P.onLine, P.line) < 4.5) errors.push('palette: onLine on line < 4.5:1');
  if (contrast(P.onField, P.field) < 4.5) errors.push('palette: onField on field < 4.5:1');
  if (contrast(P.line, P.ground) < 3) errors.push('palette: line on ground < 3:1');
})();

// ---------- the thread's profile (content.js `thread`; shots.js THREADS) ----------
// Every place the line colour is drawn as a line (the drawn line and the caret, the rod, the ruler, the playhead,
// the full-height line the ink starts from, the line the card squashes into, the underline) goes through
// threadRect, given the box a ruled line would fill. 'rule' fills that box exactly as before. 'swell' fills
// the box's swelled form: an ellipse along the long side, the short side SWELL times thicker in the middle,
// tapering to points (the swell eases off as the box nears a square, so a line can turn into a caret through a
// dot without a jump). s (0..1) blends a ruled box into its swell, for the card flattening into the line.
const THREAD = THREADS.includes(C.thread) ? C.thread : 'rule';
const swellPath = (ctx, x, y, w, h, s = 1) => {
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  ctx.beginPath();
  if (w <= 0 || h <= 0) return;
  const horiz = w >= h, L = horiz ? w : h, T = horiz ? h : w;
  const k = 1 + (SWELL - 1) * clamp((L / T - 1) / 2);
  const cx = x + w / 2, cy = y + h / 2;
  if (s >= 1) {
    ctx.ellipse(cx, cy, horiz ? L / 2 : (T * k) / 2, horiz ? (T * k) / 2 : L / 2, 0, 0, Math.PI * 2);
    return;
  }
  // half-thickness along the long axis: (1 − s) of the ruled box plus s of the swell
  const N = 48, half = (t) => (T / 2) * ((1 - s) + s * k * Math.sqrt(Math.max(0, 1 - t * t)));
  const pt = (t, side) => (horiz ? [cx + (t * L) / 2, cy + side * half(t)] : [cx + side * half(t), cy + (t * L) / 2]);
  for (let i = 0; i <= N; i++) { const [px, py] = pt(-1 + (2 * i) / N, -1); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  for (let i = N; i >= 0; i--) { const [px, py] = pt(-1 + (2 * i) / N, 1); ctx.lineTo(px, py); }
  ctx.closePath();
};
const threadRect = (ctx, x, y, w, h) => {
  if (THREAD === 'rule') return ctx.fillRect(x, y, w, h);
  swellPath(ctx, x, y, w, h); ctx.fill();
};
// Half-thickness of the horizontal line (1400 wide, centred) at x: the short chain splits it into panels.
const lineHalf = (x) => (THREAD === 'rule' ? LINE.h / 2 : ((LINE.h * SWELL) / 2) * Math.sqrt(Math.max(0, 1 - ((x - 960) / (LINE.w / 2)) ** 2)));

// ---------- shared state built once at ready() (fixed times, so any frame rendered alone agrees) ----------
let GL = null, STILL = null, TILES = [], GRAIN = null, TX = null, TXC = null;
const land = (u, u0, w = 20) => crit(u - (u0 - 0.05), w); // spring that lands on u0 (starts 0.05 early)
const glDraw = (ctx, canvas) => ctx.drawImage(canvas, 0, 0, W, H);

// blob/ink with a 2D fallback when WebGL is missing (flat discs, no fluid); TEMPLATE.md notes it.
const drawBlob = (ctx, st) => {
  if (GL) return glDraw(ctx, GL.blob({ ...st, colors: { field: P.field, shade: shade(P.field), line: P.line, deep: DEEP } }));
  ctx.fillStyle = P.field; ctx.fillRect(0, 0, W, H);
  const sp = Math.sin(PITCH), cp = Math.cos(PITCH);
  for (const p of st.prims) {
    const sx = 960 + p.c[0], sy = 540 - (p.c[1] * cp + p.c[2] * sp);
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.ellipse(sx, sy, p.b[0], p.b[1], 0, 0, Math.PI * 2); ctx.fill();
  }
};
const drawInk = (ctx, u) => {
  if (GL) return glDraw(ctx, GL.ink({ ...inkState(u), dark: 0.55, colors: { ground: P.ground, dyeA: P.text, dyeB: P.line } }));
  ctx.fillStyle = P.ground; ctx.fillRect(0, 0, W, H);
};

// ---------- open: the line draws, becomes the caret, types the brief; the caret takes the letters back ----------
// The brief is one or two phrases (one reading state each, ≤ 5 words). The caret types the first and falls flat into the
// line under it; with a second phrase the line rolls up a loop and carries the first phrase round and out while the
// second follows it in (lib/handoffs path-type, 2 beats); the line tightens under the last phrase, contracts back into
// the caret at its right end, and the letters slide into the caret, last letter first; the caret closes by D − 0.05,
// and the big word springs in after. Times: shots.js openPlan (timing.rules.js declares the same).
const OPEN_Y = BRIEF_Y + OPEN.lift; // the line under the brief (centre)
let LOOP = null; // the path-type hand-off of a two-phrase brief, built in ready()
const phrasesOf = (S) => briefPhrases(S.brief).map((p) => fill(p, VARS));
const openOf = (S) => S._open || (S._open = openPlan(phrasesOf(S), K, S.D));
const geo = (txt) => { const xs = adv('mono', 500, TYPE.body, 0, txt), w = textW('mono', 500, TYPE.body, 0, txt); return { txt, xs, w, x0: 960 - w / 2 }; };
const letters = (ctx, G, k = G.txt.length) => {
  setFont(ctx, 'mono', 500, TYPE.body, 0); ctx.fillStyle = P.text;
  for (let i = 0; i < k; i++) ctx.fillText(G.txt[i], G.x0 + G.xs[i], BRIEF_Y);
};
// A box that moves from one rectangle to another (edges eased together): the caret falling flat, the line contracting.
const boxLerp = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e) });
// The caret falls flat in two moves so it never crosses the text: it shrinks onto the line's height at its own place,
// right of the phrase, then stretches both ways under the phrase (`e` 0 → 1; contracting runs the same path back).
const caretToLine = (caret, line, e) => {
  const d = cubicInOut(clamp(e / 0.4)), s = cubicInOut(clamp((e - 0.3) / 0.7));
  const dot = { x: caret.x, y: line.y, w: caret.w, h: line.h };
  const v = boxLerp(caret, dot, d);
  return { x: lerp(v.x, line.x, s), y: v.y, w: lerp(v.w, line.w, s), h: v.h };
};
const fillBox = (ctx, r) => { ctx.fillStyle = P.line; threadRect(ctx, r.x, r.y, r.w, r.h); };
const CARET = (G, k = G.txt.length) => ({ x: G.x0 + (k ? G.xs[k] : 0) + (k ? 8 : 0), y: 544 - 32, w: 6, h: 64 });
const FLAT = { x: 960 - LINE.w / 2, y: OPEN_Y - LINE.h / 2, w: LINE.w, h: LINE.h };
// The bent line of path-type, drawn by the template so it keeps the thread's profile (the module strokes an even
// line). Geometry as lib/handoffs/path-type.js: a loop of radius R·b rolls up from the middle of a line of fixed length,
// the tails pulling in by the loop's length; the figure rises by R·b so it stays centred. A template-local extension:
// the module cannot draw a swelled line.
const loopLine = (ctx, b) => {
  const L = LINE.w, R = OPEN.radius, r = R * b, m = 2 * Math.PI * r, t1 = (L - m) / 2, y0 = OPEN_Y - R * b, N = 240;
  const at = (s) => {
    if (s <= t1) return [960 - (t1 - s), y0];
    if (s >= t1 + m) return [960 + (s - t1 - m), y0];
    const th = -Math.PI / 2 + (2 * Math.PI * (s - t1)) / m;
    return [960 + r * Math.cos(th), y0 + r + r * Math.sin(th)];
  };
  const pts = Array.from({ length: N + 1 }, (_, i) => at((L * i) / N));
  ctx.fillStyle = P.line; ctx.strokeStyle = P.line;
  if (THREAD === 'rule') {
    ctx.lineWidth = LINE.h; ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    return;
  }
  // swell: half-thickness (LINE.h · SWELL / 2) · √(1 − t²) along the arc, t from −1 to 1
  const side = (sg) => pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(N, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const t = (2 * i) / N - 1, hh = ((LINE.h * SWELL) / 2) * Math.sqrt(Math.max(0, 1 - t * t));
    return [x - (dy / l) * hh * sg, y + (dx / l) * hh * sg];
  });
  const A = side(1), B = side(-1).reverse();
  ctx.beginPath(); [...A, ...B].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
};
// Draw a hand-off with the library's speed-gated sub-frame blur (canvas.js subframes, as h.draw does), plus what the
// template draws with it in the same sub-frame (its own line, in the thread's profile).
const handoffDraw = (ctx, h, p, dur, extra = () => {}) => {
  const shutter = 0.5, span = shutter / (FPS * dur), v = p > 0 && p < 1 ? (h.speed(p, span) * span) / shutter : 0;
  subframes(ctx, (c, q) => { h.draw(c, q, { blur: false }); extra(c, q); }, p, { speed: v, fps: FPS * dur, shutter });
};
const open = {
  draw(ctx, u, S) {
    const O = openOf(S), ph = phrasesOf(S), A = geo(ph[0]), Z = geo(O.last), D = S.D;
    if (u < O.flat0) { // the line draws from the centre, becomes the caret, types the first phrase
      const k = typedCount(u, OPEN.type, O.cps, A.txt.length), typedW = k ? A.xs[k] : 0;
      letters(ctx, A, k);
      const draw = expOut(clamp(u / OPEN.draw)), toCaret = crit(u - OPEN.draw, 18);
      const a = lerp(960 - 680 * draw, A.x0, toCaret), b = lerp(960 + 680 * draw, A.x0 + 6, toCaret);
      const h = lerp(6, 64, crit(u - 0.75, 22)), yC = lerp(540, 544, crit(u - 0.75, 22));
      ctx.fillStyle = P.line; threadRect(ctx, a + typedW + (typedW ? 8 : 0), yC - h / 2, b - a, h);
      return;
    }
    if (u < O.flatEnd) { letters(ctx, A); fillBox(ctx, caretToLine(CARET(A), FLAT, (u - O.flat0) / OPEN.flat)); return; }
    if (O.two && u < O.loop0) { letters(ctx, A); fillBox(ctx, FLAT); return; }
    if (O.two && u < O.landed && LOOP) { // path-type: the template draws the line, the module the letters
      handoffDraw(ctx, LOOP, (u - O.loop0) / OPEN.loop, OPEN.loop / K, (c, q) => loopLine(c, LOOP.state(q).b));
      return;
    }
    // the last phrase on the line; the line tightens under it, contracts into the caret, takes the letters back
    const hugW = Z.w + 48, hug = crit(u - O.hug0, 20);
    const HUG = { x: 960 - lerp(LINE.w, hugW, hug) / 2, y: FLAT.y, w: lerp(LINE.w, hugW, hug), h: LINE.h };
    if (u < O.out0) { letters(ctx, Z); fillBox(ctx, HUG); return; }
    const caret = CARET(Z), uo = D - OPEN_OUT;
    if (u < uo) { letters(ctx, Z); fillBox(ctx, caretToLine(caret, HUG, 1 - clamp((u - O.out0) / OPEN.contract))); return; }
    const n = Z.txt.length, caretX = caret.x;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, caretX, H); ctx.clip(); // swallowed at the caret's left edge
    setFont(ctx, 'mono', 500, TYPE.body, 0); ctx.fillStyle = P.text;
    const stag = n > 1 ? 0.1 / (n - 1) : 0;
    for (let i = 0; i < n; i++) {
      const d = expIn(clamp((u - uo - (n - 1 - i) * stag) / 0.16)); // last letter first
      if (d < 1) ctx.fillText(Z.txt[i], lerp(Z.x0 + Z.xs[i], caretX, d), BRIEF_Y);
    }
    ctx.restore();
    const exit = expIn(clamp((u - (D - 0.13)) / 0.08));
    if (exit < 1) { ctx.fillStyle = P.line; threadRect(ctx, caretX, caret.y + (caret.h * exit) / 2, caret.w, caret.h * (1 - exit)); }
  },
};

// ---------- word: the big word springs in, its weight swings on the beats; the mark is the line colour ----------
const WORD = { size: 360, y: 650 };
const wordParts = (S) => {
  const w = String(S.word || '');
  const mark = /[.!?]$/.test(w) ? w.slice(-1) : '';
  return { text: w, mark };
};
const weightAt = (u) => {
  let v = 780, prev = 780;
  for (const [u0, to] of [[0.5, 200], [1.0, 800], [1.5, 430]]) { v += (to - prev) * land(u, u0, 16); prev = to; }
  return v;
};
const wordSize = (S) => Math.min(WORD.size, fitSize('disp', 800, -0.02, S.word, 1500, WORD.size));
let BOXES = null; // glyph boxes at the hand-off time
const glyphBoxes = (S) => {
  if (BOXES) return BOXES;
  const { text } = wordParts(S), size = wordSize(S), wt = weightAt(S.D - 0.05);
  const total = textW('disp', wt, size, -0.02, text), x0 = 960 - total / 2, xs = adv('disp', wt, size, -0.02, text);
  BOXES = [0, 1, 2, 3].map((i) => ({ x: x0 + (xs[i] + xs[i + 1]) / 2, y: WORD.y - size * 0.36, w: xs[i + 1] - xs[i], h: size * 0.72 }));
  return BOXES;
};
const word = {
  draw(ctx, u, S) {
    const { text, mark } = wordParts(S), size = wordSize(S);
    const uM = S.D - 0.05, wMid = weightAt(u);
    const total = textW('disp', wMid, size, -0.02, text), x0 = 960 - total / 2, xs = adv('disp', wMid, size, -0.02, text);
    for (let i = 0; i < text.length; i++) {
      const ti = u + 0.05 - i * 0.0625; // 1/32-note stagger at 120 BPM
      if (ti < 0) continue;
      const p = crit(ti, 20), wt = clamp(weightAt(u - i * 0.03), 200, 800);
      const morph = clamp((u - uM) / 0.3);
      if (i < 4 && morph >= 1) continue;
      ctx.save();
      ctx.globalAlpha = clamp(ti / 0.12) * (i < 4 ? 1 - morph : 1 - clamp((u - uM) / 0.12));
      setFont(ctx, 'disp', wt, size, -0.02);
      ctx.fillStyle = mark && i === text.length - 1 ? P.line : P.text;
      ctx.fillText(text[i], x0 + xs[i], WORD.y + (1 - p) * 180);
      ctx.restore();
    }
  },
};

// ---------- palette: four glyphs become four swatches; hex labels type on; the type specimen ----------
const SW_ROLES = ['text', 'ground', 'field', 'line'];
const swCentre = (k) => ({ x: 960 + (k - 1.5) * 250, y: 500 });
const palette = {
  draw(ctx, u, S) {
    const boxes = glyphBoxes(byType('word'));
    const out = 1 - clamp((u - (S.D - 0.15)) / 0.15);
    for (let k = 0; k < 4; k++) {
      const g = boxes[k], c = swCentre(k), role = SW_ROLES[k];
      const p = crit(u + 0.05 - k * 0.0625, 17);
      const hop = u > 0.95 ? -36 * Math.max(0, Math.sin(Math.PI * clamp((u - 0.95 - k * 0.125) / 0.35))) : 0;
      const w = lerp(g.w, 140, p), h = lerp(g.h, 140, p), x = lerp(g.x, c.x, p), y = lerp(g.y, c.y, p) + hop;
      rr(ctx, x - w / 2, y - h / 2, w, h, lerp(6, 70, p));
      ctx.fillStyle = role === 'ground' ? mix(P.text, P.panel, p * 1.4) : mix(P.text, P[role], p * 1.4);
      ctx.fill();
      if (role === 'ground') { ctx.save(); ctx.strokeStyle = P.text; ctx.lineWidth = 3; ctx.globalAlpha = clamp(p * 2); ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = out;
      typed(ctx, P[role].toUpperCase(), c.x, 640, 0.5 + k * 0.125, u, { size: TYPE.label, align: 'center', cps: 60, color: P.text });
      ctx.restore();
    }
    if (u >= 1.0) {
      const a = crit(u - 1.0, 20) * out;
      const ws = SPECIMEN.map(([f, wt, sz, name]) => textW(f, wt, sz, f === 'disp' ? -0.01 : 0, name));
      const gap = 56, tot = ws.reduce((s, v) => s + v, 0) + gap * 2;
      let x = 960 - tot / 2;
      const y = 790 + (1 - a) * 30;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = P.text;
      SPECIMEN.forEach(([f, wt, sz, name], i) => { setFont(ctx, f, wt, sz, f === 'disp' ? -0.01 : 0); ctx.fillText(name, x, y); x += ws[i] + gap; });
      ctx.restore();
    }
  },
};

// ---------- storyboard: swatches (or glyphs) grow into panels; panel 3 is chosen; the camera pushes in ----------
const PW = 400, PH = 225, PG = 40;
const panel = (k) => ({ x: (W - (3 * PW + 2 * PG)) / 2 + (k % 3) * (PW + PG), y: (H - (2 * PH + PG)) / 2 + 20 + Math.floor(k / 3) * (PH + PG), w: PW, h: PH });
const PANEL_ROLE = ['text', 'panel', 'field', 'line', 'panel', 'text'];
const onRole = (role) => (role === 'text' ? P.ground : role === 'line' ? P.onLine : role === 'field' ? P.onField : P.text);
const pushZoom = (u) => expInOut(clamp(u / 0.9)); // merge-local u: 0..0.9 → panel 3 becomes the frame
const pushXform = (z) => {
  const p2 = panel(2);
  const s = Math.exp(lerp(0, Math.log(W / p2.w), z));
  return { s, cx: lerp(W / 2, p2.x + p2.w / 2, z), cy: lerp(H / 2, p2.y + p2.h / 2, z) };
};
const sketch = (ctx, k, x, y, w, h, p) => {
  ctx.save();
  ctx.translate(x, y); ctx.scale(w / PW, h / PH);
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (k === 0) {
    const ws = byType('word'), cl = byType('close'), txt = ws ? ws.word : cl ? cl.name || '' : ''; // no word: the title board
    const sz = Math.min(92, fitSize('disp', 800, -0.02, txt, 300, 92));
    setFont(ctx, 'disp', 800, sz, -0.02); ctx.globalAlpha = p; ctx.fillStyle = P.ground;
    ctx.fillText(txt, (PW - textW('disp', 800, sz, -0.02, txt)) / 2, 112 + sz * 0.36);
  }
  if (k === 1) {
    if (THREAD === 'rule') { ctx.strokeStyle = P.line; ctx.beginPath(); ctx.moveTo(60, 112); ctx.lineTo(60 + 280 * p, 112); ctx.stroke(); }
    else if (p > 0) { ctx.fillStyle = P.line; threadRect(ctx, 60, 110.5, 280 * p, 3); }
  }
  if (k === 2 && STILL) { ctx.drawImage(STILL, 0, 0, PW, PH); }
  if (k === 3) {
    ctx.strokeStyle = P.onLine; ctx.beginPath();
    for (let i = 0; i <= 120 * p; i++) { const xx = 40 + i * 2.7, yy = 112 + Math.sin(i * 0.5) * 40 * Math.sin(i * 0.05 + 0.4); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
  if (k === 4) {
    ctx.strokeStyle = P.text; ctx.globalAlpha = 0.8;
    for (let r = 0; r < 4; r++) { ctx.beginPath(); ctx.moveTo(40, 60 + r * 36); ctx.lineTo(40 + 320 * p, 60 + r * 36); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = P.line; threadRect(ctx, 40 + 200 * p, 40, 4, 140);
  }
  if (k === 5) { ctx.fillStyle = P.ground; for (let i = 0; i < 16; i++) { if (i / 16 > p) break; ctx.fillRect(80 + (i % 4) * 66, 40 + Math.floor(i / 4) * 40, 56, 31); } }
  ctx.restore();
};
// Short chain, storyboard first: the film opens on the line (1400 wide at the centre), which is cut into four
// equal segments; each opens into a panel, nearest first so no two paths cross (segment i → panel SEG_PANEL[i]),
// staggered left to right on 1/32 notes from the first frame. A segment keeps its slice of the line's profile
// until it opens (`lineHalf`), so the first frame is the line itself.
const SEG = { x: 960 - LINE.w / 2, w: LINE.w / 4, y: 540 };
const SEG_PANEL = [0, 3, 1, 2];
// The outline a segment sweeps while it opens: its slice of the line at p = 0, the panel at p = 1.
const segEnvelope = (ctx, i, Pn, p) => {
  const N = 24, x0 = SEG.x + i * SEG.w;
  ctx.beginPath();
  for (let j = 0; j <= N; j++) { const f = j / N, lx = x0 + f * SEG.w; const px = lerp(lx, Pn.x + f * Pn.w, p), py = lerp(SEG.y - lineHalf(lx), Pn.y, p); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  for (let j = N; j >= 0; j--) { const f = j / N, lx = x0 + f * SEG.w; ctx.lineTo(lerp(lx, Pn.x + f * Pn.w, p), lerp(SEG.y + lineHalf(lx), Pn.y + Pn.h, p)); }
  ctx.closePath();
};
// ub: storyboard-local time (keeps running through the push); z: push 0..1
const drawBoard = (ctx, ub, z) => {
  if (z >= 1 && STILL) { ctx.drawImage(STILL, 0, 0, W, H); return; } // exact first frame of the merge
  const from = byType('palette') ? 'swatch' : byType('word') ? 'glyph' : 'line';
  const boxes = from === 'glyph' ? glyphBoxes(byType('word')) : null;
  const X = pushXform(z);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(X.s, X.s); ctx.translate(-X.cx, -X.cy);
  for (let k = 0; k < 6; k++) {
    const Pn = panel(k), role = PANEL_ROLE[k];
    let x = Pn.x, y = Pn.y, w = Pn.w, h = Pn.h, rad = 14 * (1 - z), a = 1, col = P[role], seg = null, op = 1;
    if (k < 4 && from === 'line') {
      const i = SEG_PANEL.indexOf(k), p = crit(ub - i * 0.0625, 16), sx = SEG.x + i * SEG.w, th = THREAD === 'rule' ? LINE.h : LINE.h * SWELL;
      x = lerp(sx, Pn.x, p); y = lerp(SEG.y - th / 2, Pn.y, p); w = lerp(SEG.w, Pn.w, p); h = lerp(th, Pn.h, p); rad = lerp(0, 14 * (1 - z), p);
      col = mix(P.line, P[role], p * 1.3);
      seg = { i, p }; op = clamp(p * 2); // the outline and the shot appear as the segment opens, not on the line
    } else if (k < 4) {
      const p = crit(ub + 0.05 - k * 0.0625, 16);
      if (from === 'swatch') {
        const c = swCentre(k);
        x = lerp(c.x - 70, Pn.x, p); y = lerp(c.y - 70, Pn.y, p); w = lerp(140, Pn.w, p); h = lerp(140, Pn.h, p); rad = lerp(70, 14 * (1 - z), p);
      } else {
        const g = boxes[k];
        x = lerp(g.x - g.w / 2, Pn.x, p); y = lerp(g.y - g.h / 2, Pn.y, p); w = lerp(g.w, Pn.w, p); h = lerp(g.h, Pn.h, p); rad = lerp(6, 14 * (1 - z), p);
        col = mix(P.text, P[role], p * 1.3);
      }
    } else {
      const p = crit(ub - 0.45 - (k - 4) * 0.125, 18), cx = Pn.x + Pn.w / 2, cy = Pn.y + Pn.h / 2;
      w = Pn.w * p; h = Pn.h * p; x = cx - w / 2; y = cy - h / 2; a = p;
    }
    if (w < 1) continue;
    ctx.save(); ctx.globalAlpha = a;
    if (seg && THREAD !== 'rule' && seg.p < 1) { segEnvelope(ctx, seg.i, Pn, seg.p); ctx.clip(); } // a swelled line opens from its slice
    rr(ctx, x, y, w, h, rad); ctx.fillStyle = col; ctx.fill();
    if (role === 'panel') { ctx.strokeStyle = P.text; ctx.globalAlpha = a * 0.6 * (1 - z) * op; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = a; }
    ctx.save(); rr(ctx, x, y, w, h, rad); ctx.clip();
    if (seg && k === 2) ctx.globalAlpha = a * clamp((seg.p - 0.4) / 0.5);
    sketch(ctx, k, x, y, w, h, k === 2 ? 1 : clamp((ub - 0.6 - k * 0.0625) / 0.8));
    ctx.restore();
    if (ub > 0.5 && z < 0.5) typed(ctx, '0' + (k + 1), x + 14, y + 30, 0.5 + k * 0.0625, ub, { size: 16, cps: 40, color: onRole(role), alpha: 0.7 * (1 - z * 2) });
    ctx.restore();
    if (k === 2 && ub >= 1.45 && z < 0.9) {
      const p = crit(ub - 1.45, 24);
      ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 6 / X.s; ctx.globalAlpha = p * (1 - z);
      rr(ctx, x - 10 * p, y - 10 * p, w + 20 * p, h + 20 * p, rad + 8); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
};
const storyboard = { draw: (ctx, u) => drawBoard(ctx, u, 0) };

// ---------- merge: push into panel 3, then three spheres merge, squash, rebound and settle ----------
const merge = {
  draw(ctx, u, S) {
    const sb = byType('storyboard');
    if (u < 1.0) return drawBoard(ctx, (sb ? sb.D : 2) + u, u >= 0.9 ? 1 : pushZoom(u));
    const m = u - 1.0;
    if (S.next && S.next.type === 'curves') return drawBlob(ctx, mergeState(m));
    // no curves link: squash into the line in the last 0.45u, then hold it for the flood
    const q0 = S.D - 1.0 - SQUASH_EXIT;
    if (m < q0) return drawBlob(ctx, mergeState(m));
    const q = cubicOut((m - q0) / SQUASH_TIME);
    if (q < 1) return drawBlob(ctx, squashState(q, THREAD));
    ctx.fillStyle = P.field; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = P.line; threadRect(ctx, 960 - LINE.w / 2, MERGED.y - LINE.h / 2, LINE.w, LINE.h);
  },
  bg(u) {
    if (u >= 0.9) return 'field';
    const X = pushXform(pushZoom(u)), p2 = panel(2);
    const lx = (170 - W / 2) / X.s + X.cx, ly = (110 - H / 2) / X.s + X.cy; // label point in board space
    return lx >= p2.x && lx <= p2.x + p2.w && ly >= p2.y && ly <= p2.y + p2.h ? 'field' : 'ground';
  },
};

// ---------- curves: the sphere squashes into the line, the line becomes the beat ruler, easing curves ride it ----------
const OMEGAS = [12, 20, 30, 40];
const GR = { x: 520, y: 260, w: 880, h: 420 };
const curvePt = (k, s) => ({ x: GR.x + s * GR.w, y: GR.y + GR.h - crit(s * 0.6, OMEGAS[k]) * GR.h });
const lineYAt = (u) => lerp(MERGED.y, 860, crit(u - 0.45, 16));
const easingGraph = (ctx, u, alpha, flatten, ink) => {
  ctx.save(); ctx.globalAlpha = alpha;
  const ax = clamp((u - 0.6) / 0.25);
  ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath(); ctx.moveTo(GR.x, GR.y + GR.h); ctx.lineTo(GR.x + GR.w * ax, GR.y + GR.h); ctx.moveTo(GR.x, GR.y + GR.h); ctx.lineTo(GR.x, GR.y + GR.h - GR.h * ax); ctx.stroke();
  ctx.setLineDash([6, 10]); ctx.beginPath(); ctx.moveTo(GR.x, GR.y); ctx.lineTo(GR.x + GR.w * ax, GR.y); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = alpha;
  for (let k = 0; k < 4; k++) {
    const dp = clamp((u - 0.75 - k * 0.125) / 0.35);
    if (dp <= 0) continue;
    ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const p = curvePt(k, (i / 120) * dp); const fy = lerp(p.y, 380 + k * 110, flatten); i ? ctx.lineTo(p.x, fy) : ctx.moveTo(p.x, fy); }
    ctx.stroke();
    if (flatten < 0.05) {
      ctx.save(); setFont(ctx, 'mono', 500, TYPE.label, 0.1); ctx.fillStyle = ink; ctx.globalAlpha = alpha * clamp(dp * 3);
      ctx.fillText('ω ' + OMEGAS[k], GR.x + GR.w + 18, GR.y + 10 + k * 36); ctx.restore();
    }
  }
  if (u >= RIDE.from && flatten < 0.05) {
    const s = clamp((u - RIDE.from) / (RIDE.to - RIDE.from));
    for (let k = 0; k < 4; k++) { const p = curvePt(k, s); ctx.fillStyle = P.line; ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }
  if (u >= 0.9 && flatten < 0.05) {
    const a = crit(u - 0.9, 20);
    ctx.globalAlpha = alpha * a; ctx.fillStyle = ink;
    const [f, sup] = FORMULA;
    setFont(ctx, 'serif', 400, TYPE.line, 0); ctx.fillText(f, GR.x, GR.y - 44);
    const w = textW('serif', 400, TYPE.line, 0, f); setFont(ctx, 'serif', 400, TYPE.note, 0); ctx.fillText(sup, GR.x + w + 4, GR.y - 72);
  }
  ctx.restore();
};
// After the merge's name: the rod holds over it, then drops onto it and presses it into itself (lib/handoffs rail-press,
// phase 'press', 1 beat, hitting the name on the beat); the line takes the name's weight and recovers as the ruler. The
// curves' own choreography then runs PRESS.shift u later. Without a name to press, the line drops as before.
let PRESSH = null; // built in ready()
const shiftOf = (S) => (S && S.prev && pressedName(laid, S.prev.i) ? PRESS.shift : 0);
// rail-press with the thread's profile: the module draws the word and the bar, the band (the line itself) is drawn here
// through threadRect, so a swelled thread stays swelled (a template-local extension: the module fills an even band).
// band: false draws the word and the bar only (the close, once its line has left the name).
const railDraw = (c, h, q, band = true) => {
  const R = h.state(q), xl = h.params.x - R.half, w = 2 * R.half;
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.rect(xl - 2, R.yTop, w + 4, R.th); c.clip('evenodd');
  h.draw(c, q, { blur: false }); c.restore();
  if (band) { c.fillStyle = P.line; threadRect(c, xl, R.yTop, w, R.th); }
};
const curves = {
  draw(ctx, u, S) {
    if (u < SQUASH_TIME) return drawBlob(ctx, squashState(cubicOut(u / SQUASH_TIME), THREAD));
    ctx.fillStyle = P.field; ctx.fillRect(0, 0, W, H);
    const sh = shiftOf(S), y = 860;
    if (sh && PRESSH && u < PRESS.at + PRESS.dur) {
      if (u < PRESS.at) { // the rod drops to hover just over the name (an exact landing: the press starts from its rest)
        const R = PRESSH.state(0), e = settle(clamp((u - PRESS.drop) / (PRESS.at - PRESS.drop - 0.04)), 10);
        ctx.fillStyle = P.line; threadRect(ctx, 960 - LINE.w / 2, lerp(MERGED.y - LINE.h / 2, R.yTop, e), LINE.w, LINE.h);
      }
      else handoffDraw(ctx, PRESSH, (u - PRESS.at) / PRESS.dur, PRESS.dur / K, (c, q) => railDraw(c, PRESSH, q));
    } else {
      const yl = sh ? y : lineYAt(u);
      ctx.fillStyle = P.line; threadRect(ctx, 960 - LINE.w / 2, yl - LINE.h / 2, LINE.w, LINE.h);
    }
    const uc = u - sh, yt = sh ? y : lineYAt(u);
    for (let i = 0; i <= 8; i++) {
      const x = 960 - LINE.w / 2 + i * (LINE.w / 8), a = clamp((uc - 0.55 - i * 0.03) / 0.1);
      if (a <= 0) continue;
      ctx.fillStyle = P.onField; ctx.globalAlpha = a; ctx.fillRect(x - 1.5, yt - (i % 4 === 0 ? 34 : 16), 3, i % 4 === 0 ? 34 : 16);
    }
    ctx.globalAlpha = 1;
    if (uc >= 0.6) easingGraph(ctx, uc, 1, 0, P.onField);
  },
  bg: () => 'field',
};

// ---------- tracks: ground floods out of the line, curves flatten into tracks, clips land, the playhead sweeps ----------
const TR = { x: 300, w: 1320, y0: 360, dy: 110, h: 56 };
let CLIPS = null;
const clips = () => {
  if (CLIPS) return CLIPS;
  const f = (a, b) => [a / DUR, (b - a) / DUR];
  const row0 = laid.map((s) => [...f(s.start, s.end), 'text']);
  const row1 = [];
  const m = byType('merge'), cv = byType('curves'), ink = byType('ink');
  if (m) row1.push([...f(m.start + 1.0 / K, cv ? cv.start + SQUASH_TIME / K : m.end), 'shot']);
  if (ink) row1.push([...f(ink.start, ink.end), 'shot']);
  const row3 = stageSpans().map((sp) => [...f(sp.start, sp.end), 'text']);
  const cl = byType('close'); if (cl) row3.push([...f(cl.start, cl.end), 'text']);
  CLIPS = [row0, row1, [[0, 1, 'wave']], row3];
  return CLIPS;
};
const tracks = {
  draw(ctx, u, S) {
    const fromCurves = S.prev && S.prev.type === 'curves';
    const y0 = fromCurves ? 860 : MERGED.y;
    const fl = expOut(clamp((u + 0.05) / 0.3));
    if (u < 0.3 && !fromCurves) { // the line the merge left behind, under the flood (curves draws its own tail)
      ctx.fillStyle = P.field; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P.line; threadRect(ctx, 960 - LINE.w / 2, y0 - LINE.h / 2, LINE.w, LINE.h);
    }
    const gr = { x: -4, y: y0 * (1 - fl), w: W + 8, h: y0 * fl + (H - y0) * fl + 1 };
    ctx.fillStyle = P.ground; ctx.fillRect(0, gr.y, W, gr.h);
    // the graph flattening into the tracks: onField where the field still shows, text colour on the ground
    if (fromCurves && u < 0.5) split(ctx, gr, (role) => easingGraph(ctx, S.prev.D - shiftOf(S.prev) + u, 1 - clamp((u - 0.15) / 0.25), crit(u - 0.05, 14), role === 'field' ? P.onField : P.text), 'ground', 'field');
    const D = S.D, out = clamp((u - (D - 0.25)) / 0.2), names = S.tracks || [];
    const rows = clips();
    for (let r = 0; r < 4; r++) {
      const y = TR.y0 + r * TR.dy, la = clamp((u - 0.2 - r * 0.0625) / 0.15) * (1 - out);
      if (la <= 0) continue;
      ctx.save();
      ctx.globalAlpha = la * 0.4; ctx.fillStyle = P.text; ctx.fillRect(TR.x, y + TR.h / 2, TR.w, 2);
      ctx.globalAlpha = la; setFont(ctx, 'mono', 500, TYPE.label, 0.18); ctx.fillText(names[r] || '', TR.x + 16, y - 14);
      ctx.globalAlpha = 1 - out;
      const list = rows[r], stag = Math.min(0.0625, 0.5 / list.length);
      list.forEach((c, i) => {
        const p = crit(u - (0.45 + r * 0.125 + i * stag), 20);
        if (p <= 0.001) return;
        const x = lerp(TR.x + TR.w + 200, TR.x + c[0] * TR.w, p), w = Math.max(6, c[1] * TR.w - 6);
        rr(ctx, x, y, w, TR.h, 8);
        if (c[2] === 'wave') {
          ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.stroke();
          ctx.save(); ctx.clip(); ctx.beginPath();
          const beats = Math.round(DUR / G.beat), rv = byType('review');
          for (let b = 0; b < beats * 4; b++) {
            const tb = (b / 4) * G.beat, xx = x + (tb / DUR) * w;
            const peak = rv && tb >= rv.start + G.bar && tb < rv.start + 3.225 * G.bar ? 1 : 0.55; // the drop under the sheet
            const amp = (b % 4 === 0 ? 1 : 0.35 + 0.5 * hash(b, C.seed)) * peak * 20;
            ctx.moveTo(xx, y + TR.h / 2 - amp); ctx.lineTo(xx, y + TR.h / 2 + amp);
          }
          ctx.stroke(); ctx.restore();
        } else if (c[2] === 'shot') { // a neutral clip outlined in the line colour (the field colour is ground only)
          ctx.fillStyle = mix(P.text, P.ground, 0.55); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 3; ctx.stroke();
        } else { ctx.fillStyle = P.text; ctx.fill(); }
      });
      ctx.restore();
    }
    if (u >= 0.6) { // playhead: waits at the left, sweeps over the last 1.0u, ends centred, grows to full height
      const p = expInOut(clamp((u - (D - 1.0)) / 0.95)), x = lerp(TR.x, 960, p);
      const g = expOut(clamp((u - (D - 0.3)) / 0.3));
      const top = lerp(TR.y0 - 50, 0, g), bot = lerp(TR.y0 + 3 * TR.dy + TR.h + 30, H, g);
      ctx.fillStyle = P.line; ctx.globalAlpha = clamp((u - 0.6) / 0.1); threadRect(ctx, x - 3, top, 6, bot - top); ctx.globalAlpha = 1;
    }
  },
  bg(u, S) {
    const y0 = S.prev && S.prev.type === 'curves' ? 860 : MERGED.y;
    return y0 * (1 - expOut(clamp((u + 0.05) / 0.3))) < 80 ? 'ground' : 'field';
  },
};

// ---------- ink: the full-height line dissolves into two marbled dyes; serif words rise over the darker centre ----------
const ink = {
  draw(ctx, u) {
    drawInk(ctx, u);
    const a = 1 - smooth(u / 0.35);
    if (a > 0) { ctx.fillStyle = P.line; ctx.globalAlpha = a; threadRect(ctx, 957, 0, 6, H); ctx.globalAlpha = 1; }
  },
  over(ctx, u, S) {
    const words = String(S.words || '').split(/\s+/).filter(Boolean).slice(0, 3);
    if (!words.length) return;
    const line = words.join(' '), size = Math.min(230, fitSize('serif', 400, -0.01, line, 1300, 230));
    const full = textW('serif', 400, size, -0.01, line), ex = clamp((u - (S.D - 0.18)) / 0.15);
    let x = 960 - full / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 380, W, 340); ctx.clip();
    setFont(ctx, 'serif', 400, size, -0.01);
    ctx.shadowColor = rgba(P.ground, 0.75); ctx.shadowBlur = 40;
    words.forEach((wd, i) => {
      const p = land(u, 0.45 + i * 0.55, 18);
      if (p > 0) { ctx.fillStyle = P.text; ctx.fillText(wd, x, 640 + (1 - p) * 260 - ex * 300); }
      x += textW('serif', 400, size, -0.01, wd + ' ');
    });
    ctx.restore();
  },
};

// Times of the 16 contact-sheet tiles: every link before the review gets tiles in proportion to its length
// (at least one), spread evenly inside its still window (REGISTRY.still), so no tile catches a hand-off
// mid-flight and every link shows up however long the links are.
const tileTimes = (until) => {
  const links = laid.filter((S) => S.start < until - 1e-6 && REGISTRY[S.type].still);
  if (!links.length) return Array.from({ length: 16 }, (_, k) => ((k + 0.5) / 16) * until);
  const total = links.reduce((n, S) => n + S.D, 0);
  const n = links.map((S) => Math.max(1, Math.floor((16 * S.D) / total)));
  for (let left = 16 - n.reduce((a, b) => a + b, 0), i = 0; left !== 0; i = (i + 1) % links.length) {
    // hand the remainder to the longest links first (or take it back from them)
    const k = [...links.keys()].sort((a, b) => links[b].D / n[b] - links[a].D / n[a])[left > 0 ? 0 : links.length - 1];
    if (left < 0 && n[k] <= 1) break;
    n[k] += Math.sign(left); left -= Math.sign(left);
  }
  const out = [];
  links.forEach((S, i) => {
    const [a, b] = REGISTRY[S.type].still(S.D, S);
    for (let j = 0; j < n[i]; j++) out.push(S.start + lerp(a, b, n[i] === 1 ? 0.5 : j / (n[i] - 1)) / K);
  });
  return out.slice(0, 16).sort((x, y) => x - y);
};

// ---------- review: the line colour floods out; particles gather into this film's own contact sheet ----------
const TG = { cols: 4, w: 280, h: 158, g: 12 };
TG.x = (W - (4 * TG.w + 3 * TG.g)) / 2; TG.y = 200;
const tileRect = (k) => ({ x: TG.x + (k % 4) * (TG.w + TG.g), y: TG.y + Math.floor(k / 4) * (TG.h + TG.g), w: TG.w, h: TG.h });
TG.W = 4 * TG.w + 3 * TG.g; TG.H = 4 * TG.h + 3 * TG.g;
const sheetPush = (u) => 1 + 0.06 * cubicInOut(clamp((u - RC.sheet) / (RC.pushEnd - RC.sheet)));
// The flood is short (principle 7, a change of ground ≤ 2 bars; settled 2026-10-18). The line colour holds the frame
// from the flood until RC.recede − RECEDE, then retracts (exponential in-out) onto the contact sheet, landing on
// the downbeat two bars after the flood: what is left of it is the sheet's 12 px gutters and border (about 5 % of
// the frame, under the tiles). From the collapse it shrinks with the tiles and ends hidden under the stack, before
// the card lands. Returns the area the line colour covers in screen pixels (with the sheet's push), or null while
// it is the whole frame.
const floodArea = (u) => {
  if (u < RC.recede - RECEDE || u >= RC.card) return null;
  const r = expInOut(clamp((u - (RC.recede - RECEDE)) / RECEDE)), c = crit(u - RC.collapse, 14), m = lerp(TG.g, 0, c), k = sheetPush(u);
  const x0 = lerp(TG.x, 960 - TG.w / 2, c) - m, x1 = lerp(TG.x + TG.W, 960 + TG.w / 2, c) + m;
  const y0 = lerp(TG.y, 540 - TG.h / 2, c) - m, y1 = lerp(TG.y + TG.H, 540 + TG.h / 2, c) + m;
  const sx = (x) => 960 + (x - 960) * k, sy = (y) => 540 + (y - 540) * k;
  const x = lerp(-4, sx(x0), r), y = lerp(-4, sy(y0), r);
  return { x, y, w: lerp(W + 4, sx(x1), r) - x, h: lerp(H + 4, sy(y1), r) - y, rad: r * (6 + m) * k };
};
// Draw something twice when a second ground ends inside the frame: draw(inside) within area A, draw(outside)
// beyond it, so text crossing a moving edge (the flood receding, the push into panel 3, the ground
// opening out of the line) keeps its contrast on both sides.
const FLOOD = { origin: [960, 540], dot: 1, contents: 'ground-only', growth: 'exp', ring: false, colors: { ground: P.line, ink: P.line } };
const split = (ctx, A, draw, inside = 'line', outside = 'ground') => {
  if (!A) return draw(inside);
  ctx.save(); ctx.beginPath(); ctx.roundRect(A.x, A.y, A.w, A.h, A.rad || 0); ctx.clip(); draw(inside); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.roundRect(A.x, A.y, A.w, A.h, A.rad || 0); ctx.clip('evenodd'); draw(outside); ctx.restore();
};
let PART = null;
const particles = () => {
  if (PART) return PART;
  const r = mulberry32(C.seed + 77);
  PART = [];
  for (let i = 0; i < 420; i++) {
    const R = tileRect(i % 16), side = Math.floor(r() * 4), f = r();
    const tx = side === 0 || side === 2 ? R.x + f * R.w : side === 1 ? R.x + R.w : R.x;
    const ty = side === 1 || side === 3 ? R.y + f * R.h : side === 0 ? R.y : R.y + R.h;
    const ang = r() * Math.PI * 2, rad = 160 + r() * 900;
    PART.push({ sx: 960 + Math.cos(ang) * rad, sy: 540 + Math.sin(ang) * rad * 0.6, tx, ty, d: r() * 0.35, s: 7 + r() * 9, c: r() < 0.25 ? P.text : P.onLine });
  }
  return PART;
};
const review = {
  draw(ctx, u, S) {
    const fl = expIn(clamp((u + 0.25) / 0.3));
    const A = floodArea(u);
    if (u >= 0.05) {
      ctx.fillStyle = P.line;
      if (!A) { if (u < RC.card) ctx.fillRect(0, 0, W, H); } // gone under the stack by the card
      else { ctx.beginPath(); ctx.roundRect(A.x, A.y, A.w, A.h, A.rad); ctx.fill(); }
    } else if (TX && ctx.canvas.width === W && ctx.canvas.height === H) {
      // the flood: the line colour opens from the centre as the next ground (lib/transitions dot-iris, contents
      // 'ground-only', exponential growth, no ring), landing just after the downbeat; the frame-level library's iris,
      // used for this one change of ground (principle 7), never as a cut between links
      TX.draw('dot-iris', ctx.canvas, ctx.canvas, clamp((u + 0.25) / 0.3), FLOOD);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(TXC, 0, 0); ctx.restore();
      return;
    } else { ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(960, 540, 1150 * fl, 0, Math.PI * 2); ctx.fill(); return; } // no WebGL
    const push = sheetPush(u), collapse = crit(u - RC.collapse, 14);
    ctx.save(); ctx.translate(960, 540); ctx.scale(push, push); ctx.translate(-960, -540);
    if (u < 2.2) for (const p of particles()) {
      const q = crit(u - 0.1 - p.d, 9), fade = 1 - clamp((u - 1.7) / 0.5), s = p.s * (1 - q * 0.5);
      ctx.globalAlpha = fade; ctx.fillStyle = p.c;
      ctx.fillRect(lerp(p.sx, p.tx, q) - s / 2, lerp(p.sy, p.ty, q) - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    for (let k = 0; k < 16; k++) {
      let R = tileRect(k);
      if (collapse > 0) R = { ...R, x: lerp(R.x, 960 - R.w / 2, collapse), y: lerp(R.y, 540 - R.h / 2, collapse) };
      const o = clamp((u - 1.45 - k * 0.02) / 0.2);
      if (o <= 0) continue;
      ctx.globalAlpha = o; ctx.fillStyle = P.ground; rr(ctx, R.x, R.y, R.w, R.h, 6); ctx.fill();
      const rv = clamp((u - (RC.sheet - 0.05) - k * RC.tile) / 0.12);
      if (rv > 0 && TILES[k]) { ctx.save(); rr(ctx, R.x, R.y, R.w, R.h * rv, 6); ctx.clip(); ctx.drawImage(TILES[k], R.x, R.y, R.w, R.h); ctx.restore(); }
      ctx.strokeStyle = P.text; ctx.lineWidth = 3; rr(ctx, R.x, R.y, R.w, R.h, 6); ctx.stroke();
      const ck = crit(u - (RC.checks - 0.05) - k * RC.tile, 26); // starts 0.05 early, lands on the 1/16 note
      if (ck > 0.001 && collapse < 0.3) {
        const cx = R.x + R.w - 26, cy = R.y + 26, r = 17 * ck;
        ctx.fillStyle = P.text; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(cx - 8 * ck, cy); ctx.lineTo(cx - 2 * ck, cy + 6 * ck); ctx.lineTo(cx + 9 * ck, cy - 7 * ck); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (u >= RC.sheet - 0.05 && u < RC.collapse + 0.15) { // counter: this film's real frame count
      const n = Math.round(FRAMES * cubicOut(clamp((u - RC.sheet) / (RC.counted - RC.sheet))));
      const a = clamp((u - (RC.sheet - 0.05)) / 0.12) * (1 - clamp((u - RC.collapse) / 0.12));
      const digits = String(FRAMES).length, s = String(n).padStart(digits, '0'), label = S.count || '';
      const nw = textW('disp', 800, TYPE.count, -0.02, String(FRAMES).replace(/\d/g, '0')), lw = textW('mono', 500, TYPE.label, 0.18, label);
      const x0 = 960 - (nw + 24 + lw) / 2;
      split(ctx, A, (role) => {
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = role === 'line' ? P.onLine : P.text;
        setFont(ctx, 'disp', 800, TYPE.count, -0.02); ctx.textAlign = 'right'; ctx.fillText(s, x0 + nw, 985);
        setFont(ctx, 'mono', 500, TYPE.label, 0.18); ctx.fillText(label, x0 + nw + 24, 977);
        ctx.restore();
      });
    }
    if (u >= 6.8) { // the sheet becomes one file card (timed from the start), held to be read, then the card becomes the line (timed from the end)
      const p = crit(u - RC.card, 16), cw = lerp(TG.w, 900, p), ch = lerp(TG.h, 506, p);
      const sq = settle(clamp((u - (S.D - CARD.squash)) / CARD.squash), 10), hh = lerp(ch, LINE.h, sq), ww = lerp(cw, 1100, sq); // lands exactly on the line the close starts from
      ctx.fillStyle = sq > 0.5 ? P.line : P.text;
      if (THREAD === 'rule' || sq <= 0.5) rr(ctx, 960 - ww / 2, 540 - hh / 2, ww, hh, lerp(10, 0, sq));
      else swellPath(ctx, 960 - ww / 2, 540 - hh / 2, ww, hh, (sq - 0.5) / 0.5); // swells as it flattens
      ctx.fill();
      if (sq < 0.3) {
        // the title, then the spec line in three parts (one reading state each), then the export bar: the line runs
        // along the card's foot at constant speed (a process), and the card squashes into the line it made
        const card = S.card || '', spec = fill(SPEC, VARS), c0 = RC.card;
        const sz = Math.min(230, fitSize('disp', 800, -0.03, card, 720, 230)), out = 1 - sq / 0.3;
        ctx.save(); ctx.globalAlpha = clamp((u - (c0 + CARD.title)) / 0.15) * out; ctx.fillStyle = P.ground;
        setFont(ctx, 'disp', 800, sz, -0.03); ctx.textAlign = 'center'; ctx.fillText(card, 960, 590);
        ctx.globalAlpha = out;
        const parts = spec.split(' · '), sw = textW('mono', 500, TYPE.body, 0.06, spec);
        let shown = 0, from = 0;
        parts.forEach((pt, k) => {
          const seg = (k ? ' · ' : '') + pt;
          const n = typedCount(u, c0 + CARD.spec + k * CARD.specStep, 90, seg.length);
          if (n) shown = from + n;
          from += seg.length;
        });
        if (shown) { setFont(ctx, 'mono', 500, TYPE.body, 0.06); ctx.fillText(spec.slice(0, shown), 960 - sw / 2, 690); }
        const bp = clamp((u - (c0 + CARD.bar)) / CARD.barDur);
        if (bp > 0) { ctx.fillStyle = P.line; threadRect(ctx, 960 - 410, 540 + 506 / 2 - 52, 820 * bp, LINE.h); }
        ctx.restore();
      }
    }
  },
  bg: (u) => (u >= -0.05 && 1150 * expIn(clamp((u + 0.25) / 0.3)) > 900 && u < RC.recede - RECEDE ? 'line' : 'ground'),
};

// ---------- close: the ground opens from the line; the line is cut into the name and ends as the link ----------
// The ground opens out of the line (the card's, or in the short chain the merge's rod); the line settles where the
// name's band will be (baseline + 50), thickens upward into a bar, and a blade cuts the bar into the name, left to right
// (lib/handoffs rail-press, phase 'cut', 1 beat, landing on the beat: the lock-up). What is left of the line does not
// stay under the name: as the name lands, the band contracts into the caret at the URL's start (the open's caret path
// run back, caretToLine), the caret types the URL, and on the downbeat of the last bar (shots.js closeSecondMove, the
// closing second move of principle 5) it falls flat into the URL's underline, as the caret fell flat under the brief.
// The line that typed the request ends as the link to the product. Without a URL the band stays under the name.
let CUT = null; // built in ready()
const nameSize = (name) => Math.min(196, fitSize('disp', 800, -0.03, name, 1500, 196));
const URL_Y = 870; // the URL's baseline (name 600 + 270)
// The URL as typed (mono 500, ≤ 44 px, +0.02 em), its caret and its underline, in the open's proportions scaled to its size.
const urlGeo = (url) => {
  const size = Math.min(TYPE.body, fitSize('mono', 500, 0.02, url, 1500, TYPE.body)), k = size / TYPE.body;
  const xs = adv('mono', 500, size, 0.02, url), w = textW('mono', 500, size, 0.02, url), x0 = 960 - w / 2;
  const cps = Math.max(110, url.length / CLOSE.urlDur);
  const caret = (n) => ({ x: x0 + (n ? xs[n] + 8 * k : 0), y: URL_Y - 48 * k, w: LINE.h, h: 64 * k });
  const under = { x: 960 - (w + 48) / 2, y: URL_Y + OPEN.lift * k - LINE.h / 2, w: w + 48, h: LINE.h };
  return { size, xs, w, x0, cps, caret, under };
};
const close = {
  draw(ctx, u, S) {
    const op = expOut(clamp(u / 0.3));
    const rod = S.prev && S.prev.type === 'merge';
    const y0 = rod ? MERGED.y : 540, w0 = rod ? LINE.w : 1100;
    if (rod) {
      ctx.fillStyle = P.field; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P.ground; ctx.fillRect(0, y0 * (1 - op), W, H * op);
    } else { ctx.fillStyle = P.ground; ctx.fillRect(0, 540 - 540 * op, W, 1080 * op); }
    // From u = 0 the line is drawn where the review's card flattens to (1100 × 6 at y 540), so the ground band that
    // covers the card never leaves a frame of bare ground (fixed 2026-10-19; it returned up to u 0.05).
    if (u < 0 && !rod) return;
    if (!CUT) return;
    const R0 = CUT.state(0), band = { x: 960 - R0.half, y: R0.yTop, w: 2 * R0.half, h: R0.th };
    const url = S.url || '', UG = url.trim() ? urlGeo(url) : null, done = CLOSE.cut + CLOSE.cutDur;
    if (u < CLOSE.cut) { // the line settles where the band will be (an exact landing, so the cut starts on its rest)
      const e = settle(clamp((u - CLOSE.settle) / (CLOSE.cut - CLOSE.settle - 0.05)), 10);
      fillBox(ctx, boxLerp({ x: 960 - w0 / 2, y: y0 - LINE.h / 2, w: w0, h: LINE.h }, band, e));
    } else if (u < done) {
      handoffDraw(ctx, CUT, (u - CLOSE.cut) / CLOSE.cutDur, CLOSE.cutDur / K, (c, q) => railDraw(c, CUT, q));
    } else if (!UG) railDraw(ctx, CUT, 1);
    else {
      railDraw(ctx, CUT, 1, false);
      const n = typedCount(u, CLOSE.url, UG.cps, url.length), u2 = closeSecondMove(S.D);
      const fall0 = u2 == null ? CLOSE.url + url.length / UG.cps + OPEN.flatDelay : u2 - OPEN.flat;
      if (u < done + CLOSE.caret) fillBox(ctx, caretToLine(UG.caret(0), band, 1 - (u - done) / CLOSE.caret)); // the band contracts into the caret
      else fillBox(ctx, caretToLine(UG.caret(n), UG.under, clamp((u - fall0) / OPEN.flat))); // types the URL, then falls flat under it
    }
    const y = 600;
    if (u >= CLOSE.line) {
      const a = crit(u - CLOSE.line, 18), sz = Math.min(TYPE.line, fitSize('serif', 400, 0, S.line || '', 1500, TYPE.line));
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = P.text; setFont(ctx, 'serif', 400, sz, 0); ctx.textAlign = 'center';
      ctx.fillText(S.line || '', 960, y + 150 + (1 - a) * 20); ctx.restore();
    }
    if (UG) typed(ctx, url, 960, URL_Y, CLOSE.url, u, { size: UG.size, cps: UG.cps, align: 'center', ls: 0.02, color: P.text }); // typed in CLOSE.urlDur: holds ≥ 3 s
  },
};

const LINKS = { open, word, palette, storyboard, merge, curves, tracks, ink, review, close };

// ---------- stage labels: real pipeline steps, numbered, with a one-line note ----------
let SPANS = null;
function stageSpans() {
  if (SPANS) return SPANS;
  SPANS = [];
  let cur = null;
  for (const s of laid) {
    if (s.type === 'close') { cur = null; continue; }
    const st = s.stage || (cur && { name: cur.name, note: null });
    if (!st) continue;
    if (!cur || cur.name !== st.name) { cur = { name: st.name, start: s.start, end: s.end, notes: [] }; SPANS.push(cur); }
    cur.end = s.end;
    if (st.note) { const last = cur.notes[cur.notes.length - 1]; if (last) last.end = s.start; cur.notes.push({ text: fill(st.note, VARS), start: s.start, end: s.end }); }
    else if (cur.notes.length) cur.notes[cur.notes.length - 1].end = s.end;
  }
  const names = [...new Set(SPANS.map((s) => s.name))];
  SPANS.forEach((s) => { s.step = names.indexOf(s.name) + 1; s.of = names.length; });
  return SPANS;
}
const bgRole = (t) => {
  let role = 'ground';
  for (const S of laid) {
    const r = REGISTRY[S.type], u = (t - S.start) * K;
    if (u < r.win[0] || u >= S.D + r.win[1]) continue;
    if (LINKS[S.type].bg) role = LINKS[S.type].bg(u, S);
    else if (u >= 0 && u < S.D) role = 'ground';
  }
  return role;
};
// The corner label is persistent: the mark appears once and stays until the name; when the stage changes only
// the parts that change (step number, name) are retyped in place. On the field or the flood the label and the
// note use the solid onField / onLine colour one weight heavier (the note, a single-weight italic, gets a
// 1.2 px stroke of its own colour), so they hold ≥ 4.5:1 on every ground.
const pad2 = (n) => String(n).padStart(2, '0');
const corner = () => {
  const spans = stageSpans();
  if (!spans.length) return null;
  const t0 = spans[0].start + (spans[0].start === laid[0].start ? 0.5 / K : 0.1 / K);
  return { spans, t0, t1: spans[spans.length - 1].end };
};
const stage = (ctx, t) => {
  const c = corner();
  if (!c || t < c.t0 || t >= c.t1) return;
  const e = edgeAt(t);
  if (e) split(ctx, e.A, (role) => stageLayer(ctx, t, c, role), e.inside, e.outside);
  else stageLayer(ctx, t, c, bgRole(t));
};
// Where a ground edge sweeps across the corner label: the push into panel 3 (the field grows from the panel),
// the ground opening out of the line in `tracks` (the field shrinks above it), the flood receding. A label
// coloured for one side only drops to about 1.6:1 on the other side in a light-field preset (ultramarine).
const edgeAt = (t) => {
  const at = (S) => (S ? (t - S.start) * K : -1);
  const rv = byType('review'), A = rv ? floodArea(at(rv)) : null;
  if (A) return { A, inside: 'line', outside: 'ground' };
  const m = byType('merge'), um = at(m);
  if (m && um > 0 && um < 0.9) {
    const z = pushZoom(um), X = pushXform(z), p2 = panel(2);
    return { A: { x: (p2.x - X.cx) * X.s + W / 2, y: (p2.y - X.cy) * X.s + H / 2, w: p2.w * X.s, h: p2.h * X.s, rad: 14 * (1 - z) * X.s }, inside: 'field', outside: 'ground' };
  }
  const tr = byType('tracks'), ut = at(tr);
  if (tr && ut >= -0.05 && ut < 0.3) {
    const y0 = tr.prev && tr.prev.type === 'curves' ? 860 : MERGED.y, top = y0 * (1 - expOut(clamp((ut + 0.05) / 0.3)));
    if (top > 0.5) return { A: { x: -4, y: -4, w: W + 8, h: top + 4 }, inside: 'field', outside: 'ground' };
  }
  return null;
};
const stageLayer = (ctx, t, c, role) => {
  const { spans, t0, t1 } = c;
  const out = 1 - clamp((t - (t1 - 0.12 / K)) * K / 0.12);
  const ink = ROLE[role], heavy = role !== 'ground', mark = role === 'line' ? P.onLine : P.line;
  const k = spans.findLastIndex((sp) => t >= sp.start), sp = spans[k], prev = spans[k - 1];
  ctx.save(); ctx.globalAlpha = out;
  ctx.fillStyle = mark; ctx.fillRect(150, 90, 16 * crit((t - t0) * K, 26), 16);
  const segs = (x) => [pad2(x.step), ` / ${pad2(x.of)}   `, x.name.toUpperCase()];
  const now = segs(sp), was = prev ? segs(prev) : null, wt = heavy ? 700 : 500;
  const xs = adv('mono', wt, TYPE.label, 0.18, now.join(''));
  const u = (t - Math.max(sp.start, t0)) * K;
  setFont(ctx, 'mono', wt, TYPE.label, 0.18); ctx.fillStyle = ink;
  let i0 = 0;
  now.forEach((seg, j) => {
    const n = was && was[j] === seg ? seg.length : typedCount(u, 0.05, 60, seg.length);
    if (n) ctx.fillText(seg.slice(0, n), 180 + xs[i0], 106);
    i0 += seg.length;
  });
  setFont(ctx, 'serif', 400, TYPE.note, 0);
  if (heavy) { ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; }
  for (const s of spans) for (const n of s.notes) {
    const a0 = Math.max(n.start, t0) + 0.15 / K, a1 = n.end;
    if (t < a0 || t >= a1) continue;
    const a = clamp((t - a0) * K / 0.2) * (a1 >= t1 ? 1 : 1 - clamp((t - (a1 - 0.1 / K)) * K / 0.1));
    ctx.globalAlpha = out * a;
    const y = 152 + (1 - a) * 8;
    ctx.fillText(n.text, 180, y);
    if (heavy) ctx.strokeText(n.text, 180, y);
  }
  ctx.restore();
};

// Each stage is also named once in the centre, large, after its first link lands (principle 3: the frame
// says what it is about without the corner). Which links, where and when: shots.js CENTRE_NAME. The name lands
// on a beat, holds one beat and leaves; the corner label stays.
let NAMED = null;
const centreNames = () => {
  if (NAMED) return NAMED;
  const idx = namedLinks(laid);
  NAMED = laid.filter((S, i) => idx.has(i)).map((S) => {
    const name = S.stage ? S.stage.name : stageSpans().find((sp) => S.start >= sp.start - 1e-9 && S.start < sp.end - 1e-9)?.name;
    // a merge name the next link presses into the line stays until the press starts (curves draws it from there)
    const until = pressedName(laid, S.i) ? S.next.start + PRESS.at / K : null;
    return { name: name || '', S, u0: nameAt(S.type, S.D, nameExit(S.type, S.next)), y: CENTRE_NAME[S.type].y, until };
  });
  return NAMED;
};
const centreName = (ctx, t) => {
  for (const n of centreNames()) {
    const u = (t - n.S.start) * K - n.u0;
    if (u < -NAME_IN || (n.until == null ? u >= NAME_HOLD + NAME_OUT : t >= n.until)) continue;
    const p = crit(u + NAME_IN, 24), x = n.until == null ? clamp((u - NAME_HOLD) / NAME_OUT) : 0;
    const size = Math.min(TYPE.name, fitSize('disp', 800, -0.02, n.name, 1500, TYPE.name));
    ctx.save(); ctx.globalAlpha = clamp(p * 1.4) * (1 - x); ctx.fillStyle = ROLE[bgRole(t)];
    setFont(ctx, 'disp', 800, size, -0.02); ctx.textAlign = 'center';
    ctx.fillText(n.name, 960, n.y + (1 - p) * 24 - x * 16);
    ctx.restore();
  }
};

// ---------- the frame ----------
export const paint = (ctx, t, { thumb = false } = {}) => {
  t = Math.max(0, t);
  ctx.save();
  ctx.fillStyle = P.ground; ctx.fillRect(0, 0, W, H);
  const active = [];
  for (const S of laid) {
    const r = REGISTRY[S.type], u = (t - S.start) * K;
    if (u >= r.win[0] && u < S.D + r.win[1]) active.push([S, u]);
  }
  for (const [S, u] of active) LINKS[S.type].draw(ctx, u, S);
  for (const [S, u] of active) if (LINKS[S.type].over) LINKS[S.type].over(ctx, u, S, thumb);
  centreName(ctx, t);
  stage(ctx, t);
  if (errors.length) {
    ctx.fillStyle = '#FF0033'; ctx.fillRect(0, 0, W, 40 + errors.length * 34);
    ctx.fillStyle = '#FFFFFF'; setFont(ctx, 'mono', 600, 24, 0);
    errors.forEach((e, i) => ctx.fillText('content.js: ' + e, 30, 40 + i * 34));
  }
  ctx.restore();
};
// sub-frame count for motion blur at t (0 = none): the largest n of any fast-move window open at t
const blurAt = (t) => {
  let n = 0;
  for (const S of laid) {
    const r = REGISTRY[S.type];
    if (!r.blur) continue;
    const u = (t - S.start) * K;
    for (const [a, b, m = 6] of r.blur(S.D, S)) if (u >= a && u < b) n = Math.max(n, m);
  }
  return n;
};

export const start = () => {
  const film = document.getElementById('film');
  film.width = W; film.height = H;
  const ctx = film.getContext('2d');
  const gr = document.getElementById('grain');
  gr.width = W; gr.height = H;
  const gctx = gr.getContext('2d');
  if (errors.length) console.error('[thread] content.js:\n  ' + errors.join('\n  '));
  for (const n of TIMING.notes) if (n.level !== 'error') console.warn(`[thread] timing: ${n.scene != null ? `scene ${n.scene} ` : ''}${n.msg}`);
  let ready = false;
  const render = (t) => {
    if (!ready) return; // hf-seek can arrive before fonts and WebGL are ready; boot draws again after
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const n = blurAt(t);
    if (n) subframes(ctx, (c, ts) => paint(c, ts), t, { n, fps: FPS, shutter: 0.5 });
    else paint(ctx, t);
    const f = Math.round(t * FPS), ox = (f * 197) % 512, oy = (f * 311) % 512;
    gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.save(); gctx.translate(-ox, -oy);
    gctx.fillStyle = gctx.createPattern(GRAIN, 'repeat'); gctx.fillRect(0, 0, W + 512, H + 512); gctx.restore();
  };
  boot({
    id: 'film',
    duration: DUR,
    render,
    ready: async () => {
      await fontsReady(FONTS_TO_LOAD);
      clearMeasure(); BOXES = null;
      GRAIN = grainTile(C.seed, 512, 127);
      try { GL = createGL(); } catch (e) { console.error('[thread] WebGL failed, using flat fallback', e); GL = null; }
      if (!GL) console.warn('[thread] no WebGL: volume shots fall back to flat shapes');
      // the hand-offs the line performs (lib/handoffs; they measure text, so after the fonts): the brief's loop, the merge's
      // name pressed into the ruler, the line cut into the name
      const o = byType('open');
      if (o && openOf(o).two) {
        const ph = phrasesOf(o);
        LOOP = await createHandoff('path-type', {
          from: { text: ph[0] }, to: { text: ph[1] }, x: 960, y: BRIEF_Y + OPEN.lift, length: LINE.w, radius: OPEN.radius, lift: OPEN.lift,
          lineWidth: LINE.h, font: { family: FAMILY.mono, weight: 500, size: TYPE.body, spacing: 0 },
          colors: { ground: P.ground, ink: P.text, accent: 'rgba(0,0,0,0)' }, ground: false, // the template draws the line
        });
      }
      const mi = laid.findIndex((x) => pressedName(laid, x.i));
      if (mi >= 0) {
        const nm = centreNames().find((n) => n.S.i === mi), f = { family: FAMILY.disp, weight: 800, size: Math.min(TYPE.name, fitSize('disp', 800, -0.02, nm.name, 1500, TYPE.name)) };
        f.spacing = -0.02 * f.size;
        const m = hMeasure(hScratch(), nm.name, f);
        PRESSH = await createHandoff('rail-press', {
          phase: 'press', x: 960, baseline: NAME_UNDER, font: f, from: { text: nm.name }, to: { text: nm.name },
          line: { width: LINE.h, gap: 860 - LINE.h / 2 - NAME_UNDER, above: 30, pad: LINE.w / 2 - m.width / 2, padTo: 0 },
          colors: { ground: P.field, ink: P.onField, accent: P.line }, ground: false,
        });
      }
      const cl = byType('close');
      if (cl) {
        const nm = cl.name || '', size = nameSize(nm), f = { family: FAMILY.disp, weight: 800, size, spacing: -0.03 * size };
        CUT = await createHandoff('rail-press', {
          phase: 'cut', x: 960, baseline: 600, font: f, from: { text: nm }, to: { text: nm },
          line: { width: LINE.h, gap: CLOSE.gap, above: 30, pad: 0, padTo: 0 },
          colors: { ground: P.ground, ink: P.text, accent: P.line }, ground: false,
        });
      }
      // the flood's iris (frame-level library); without WebGL the 2D disc above stands in
      if (byType('review')) {
        TXC = document.createElement('canvas'); TXC.width = W; TXC.height = H;
        TX = createTransitions(TXC);
        if (TX) TX.draw('dot-iris', TXC, TXC, 0.5, FLOOD); // compile its program now, not on the first flood frame
      }
      // the merge's first frame, used by the storyboard panel and the push (pixel-identical hand-off)
      STILL = document.createElement('canvas'); STILL.width = W; STILL.height = H;
      drawBlob(STILL.getContext('2d'), mergeState(0));
      // this film's own contact sheet: 16 frames spread over everything before the review
      const rv = byType('review'), until = rv ? rv.start : DUR;
      TILES = [];
      const times = rv ? tileTimes(until) : [];
      for (let k = 0; k < (rv ? 16 : 0); k++) { // the short chain has no contact sheet
        const c = document.createElement('canvas'); c.width = 480; c.height = 270;
        const x = c.getContext('2d'); x.scale(0.25, 0.25);
        paint(x, times[k], { thumb: true });
        TILES.push(c);
      }
      ready = true;
    },
  });
};

export const FILM = { content: C, palette: P, timing: TIMING, laid, duration: DUR, frames: FRAMES, errors, REGISTRY };

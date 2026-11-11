// review-callouts — the problem as open review items: a two-line headline, a bus feeding 2–4 boxes, each with an amber revision
// triangle (a reviewer's mark), one phrase of line 2 underlined in amber, a note.
// From the blueprint template's `problem` sheet (assets/templates/blueprint/sheets/problem.js; choreography.js CUES.problem): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = (s) => {
    const n = s.items.length, c = { title: 0, title2: 0.75, mark: 1.5, bus: 1.5, note: 1.5 + 0.5 * n };
    s.items.forEach((_, i) => (c['item' + i] = 1.75 + 0.5 * i));
    // the last box's value and triangle land ~1.2 beats after its cue and the note ~0.8 after its own: ≤ 4.4 with four items
    return { N0: 4.5, c, sounds: [['title', 'pen'], ['title2', 'pen'], ['mark', 'mark'], ...s.items.map((_, i) => ['item' + i, 'box']), ['note', 'mark']] };
  };

const TRI_W = 52, TRI_H = 46; // revision triangle; its number is 25 px, like every other figure


const sheetPlan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  (s.lines || []).forEach((l, i) => env.lim(`lines[${i}]`, l, 22));
  if (!Array.isArray(s.lines) || s.lines.length !== 2) env.err('lines needs exactly 2 entries');
  const n = (s.items || []).length;
  if (n < 2 || n > 4) env.err('items needs 2–4 entries');
  const f1 = sz(F.title, 140, { w: 500 }), f2 = sz(F.title, 140);
  const title = header(pen, env, s, { lines: s.lines, fonts: [f1, f2], bases: [325, 497], cues: [c('title'), c('title2')], minSize: 100 });

  // amber underline under the marked phrase of line 2 (hand-drawn: a gentle S-curve)
  if (s.mark) {
    env.lim('mark', s.mark, 22);
    const l2 = s.lines[1], at = l2.indexOf(s.mark);
    if (at < 0) env.err(`mark "${s.mark}" is not part of lines[1]`);
    else {
      const f = env.fit(l2, f2, CW, 100);
      const x0 = X0 - 8 + pen.measure(l2.slice(0, at), f), x1 = x0 + pen.measure(s.mark, f);
      const y = 497 + 24, pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([x0 + (x1 - x0) * u, y + 7 * Math.sin(u * Math.PI * 1.6) * (1 - u * 0.4)]); }
      pen.line(pts, c('mark'), 0.45, 'sa', { ease: E.quadOut });
    }
  }

  // bus + boxes
  const gap = 40, bw = (CW - (n - 1) * gap) / n, by = 652, bh = 190;
  const cx = (i) => X0 + i * (bw + gap) + bw / 2;
  if (n >= 2) pen.seg(cx(0), 610, cx(n - 1), 610, c('bus'), 0.5, 's1');
  const fk = F.tag, fv = { fam: 'cond', w: 500, size: 70 };
  (s.items || []).forEach((it, i) => {
    const t = c('item' + i), x = X0 + i * (bw + gap);
    env.lim(`items[${i}].key`, it.key, 12);
    env.lim(`items[${i}].value`, it.value, 11);
    pen.dot(cx(i), 610, 7, t, 'line');
    pen.seg(cx(i), 610, cx(i), 640, t, 0.18, 's1');
    pen.head(cx(i), 650, Math.PI / 2, t + 0.18, 'line', 14);
    pen.rect(x, by, bw, bh, t + 0.05, 0.4, 's1');
    pen.text(up(it.key), x + 28, by + 48, fk, t + 0.18, 0.3, { col: 'line' });
    const f = env.fit(it.value, fv, bw - 26 - 30, 50, `items[${i}].value`);
    pen.text(it.value, x + 26, by + 133, f, t + 0.26, 0.4);
    // revision triangle with its number
    const tx = x + bw - TRI_W - 14, ty = by + 16, hx = TRI_W / 2;
    pen.custom(t + 0.4, (ctx, tt, local) => {
      const v = Math.min(1, local / 0.3), k = 0.4 + 0.6 * E.backOut(v);
      ctx.save();
      ctx.globalAlpha *= Math.min(1, v * 3);
      ctx.translate(tx + hx, ty + 30); ctx.scale(k, k); ctx.translate(-tx - hx, -ty - 30);
      ctx.fillStyle = pen.P.accent;
      ctx.beginPath(); ctx.moveTo(tx + hx, ty); ctx.lineTo(tx + TRI_W, ty + TRI_H); ctx.lineTo(tx, ty + TRI_H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = pen.P.onAccent;
      ctx.font = '600 25px "Plex Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), tx + hx, ty + 41);
      ctx.restore();
    });
  });

  if (s.note) {
    env.lim('note', s.note, 24);
    const str = '△ ' + up(s.note), f = sz(F.body, 25, { track: 0.12 });
    const w = pen.measure(str, f);
    pen.seg(X0, 880, X0 + w, 880, c('note'), 0.5, 'sa');
    pen.text(str, X0, 918, f, c('note'), 0.5, { col: 'accent' });
  }
  return { title, focus: null };
};

const DEFAULT = {
 "en": {
  "hud": "Problem statement",
  "label": "Fig. 1 — how flags ship today",
  "lines": [
   "Flags flip live.",
   "Nobody signs off."
  ],
  "mark": "signs off.",
  "items": [
   {
    "key": "Rollout",
    "value": "everyone"
   },
   {
    "key": "Canary",
    "value": "none"
   },
   {
    "key": "Rollback",
    "value": "manual"
   },
   {
    "key": "Owner",
    "value": "unclear"
   }
  ],
  "note": "Four open items",
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "问题说明",
  "label": "图 1 — 现在怎么上线开关",
  "lines": [
   "开关直接上线。",
   "没人签字。"
  ],
  "mark": "签字",
  "items": [
   {
    "key": "发布范围",
    "value": "所有人"
   },
   {
    "key": "金丝雀",
    "value": "没有"
   },
   {
    "key": "回滚",
    "value": "手动"
   },
   {
    "key": "负责人",
    "value": "不清楚"
   }
  ],
  "note": "四个未决项",
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.label, true], ['title', s.lines?.[0]], ['title2', s.lines?.[1]], ...(s.items || []).map((it, i) => ['item' + i, `${it.key} ${it.value}`, true]), ['note', s.note, true]];
const tplan = (s, bpm, L) => {
  const def = CUES(s), beat = 60 / bpm, cue = def.c;
  let prim = 0, gl = 0;
  for (const [k, x, g] of READS(s).filter((r) => r[1]).sort((a, b) => (cue[a[0]] ?? 0) - (cue[b[0]] ?? 0))) {
    const at = (ARRIVE_B + (cue[k] ?? 0)) * beat + 0.3;
    if (g) gl = Math.max(gl, at + (g === true ? 1 : g)); else prim = Math.max(prim, at) + readTime(String(x), L);
  }
  const build = ARRIVE_B + (def.stamp != null ? Math.max(def.N0, def.stamp + 1) : def.N0) + 2;
  const beats = Math.max(s.minBeats || 0, Math.ceil(Math.max(build, Math.max(prim, gl) / beat + 1) - 1e-9));
  return { def, beats };
};
export default {
  id: 'review-callouts', kind: 'scene',
  fits: ["hook", "problem"],
  surface: ['canvas'],
  beats: { min: 7, max: 14 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, lines: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 22 }, zh: { chars: 9 } } } }, mark: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 3, chars: 22 }, zh: { chars: 6 } } }, items: { type: 'list', count: [2, 4], of: { key: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } }, value: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 11 }, zh: { chars: 5 } } } } }, note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 1, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; boxes drop off the bus; amber triangles pop', settled: ARRIVE_B + P.def.N0, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
  },
  async prepare(s, c) {
    const P = tplan(s, c.bpm, c.lang), def = P.def;
    
    const D = prepareSheet(sheetPlan, def.c, s, c, { N0: def.N0, stampB: def.stamp ?? null, issue: s.issue === true });
    const F0 = { ...hudDefaults[c.lang === 'zh' ? 'zh' : 'en'], ...(s.frame || {}), sheet: s.sheetNo, name: s.hud };
    D.H = makeHud(D.P, null, F0, c.lang);
    D.cam = camOf({ beat: D.beat, from: s.from, push: D.push, holdStart: (ARRIVE_B + def.N0) * D.beat, impacts: D.stampT != null ? [D.stampT] : [] });
    D.beats = P.beats;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const t = u * D.beat, cam = D.cam(t);
    drawWorld(ctx, D.P, cam, D.pen.items, t);
    
    drawLight(ctx, D.P, D.T, t, s.lampT || 0);
    drawHud(ctx, D.P, D.H, cam, foldOf(D.push, t));
  },
  track() { return [[960, 540]]; },
};

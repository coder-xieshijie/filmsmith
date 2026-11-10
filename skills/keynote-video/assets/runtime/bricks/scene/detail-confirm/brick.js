// detail-confirm — decisions a person settles: leaders run from 2–3 questions to their answers, an amber bracket closes the
// chosen answers, a summary box with a note, and the amber CONFIRMED stamp lands on beat 5 with a push-in and a thud.
// `issue: true` asks the host for the flood into the print one beat later (runtime transition shape-flood).
// From the blueprint template's `detail` sheet (assets/templates/blueprint/sheets/detail.js; choreography.js CUES.detail): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = (s) => {
    const n = s.rows.length, c = { title: 0, sub: 0.5, summary: 3.0, note: 3.25 };
    const step = n > 1 ? 1.2 / (n - 1) : 0;
    s.rows.forEach((_, i) => { c['row' + i] = 0.9 + i * step; c['ans' + i] = 1.5 + i * step; });
    // issue: the flood starts FLOOD_AFTER_B after the stamp and closes FLOOD_B later, on a beat
    if (s.issue === true) c.flood = STAMP_B + FLOOD_AFTER_B;
    return { N0: s.issue === true ? ISSUE_N0 : STAMP_N0, stamp: STAMP_B, c, sounds: [['title', 'pen'], ...s.rows.map((_, i) => ['ans' + i, 'box']), ['summary', 'pen'], ...(s.issue === true ? [['flood', 'flood']] : [])] };
  };


const sheetPlan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 90);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.9, { col: 'muted' });

  const rows = s.rows || [];
  const n = rows.length;
  if (n < 2 || n > 3) env.err('rows needs 2–3 entries');
  const pitch = n === 3 ? 115 : 140, y0 = 452;
  const fq = { fam: 'cond', w: 500, size: 35 }, fa = { fam: 'cond', w: 700, size: 35 };
  const aw = Math.max(240, ...rows.map((r) => pen.measure(r.a || '', fa) + 80));
  const ax = X1 - aw;
  const ftag = { fam: 'mono', w: 400, size: 25, track: 0.06 };
  const roundWord = up(s.roundLabel || 'Round');
  env.lim('roundLabel', s.roundLabel, 6);
  let focus = null;
  rows.forEach((r, i) => {
    env.lim(`rows[${i}].q`, r.q, 56);
    env.lim(`rows[${i}].a`, r.a, 12);
    const y = y0 + i * pitch, t = c('row' + i), ta = c('ans' + i);
    pen.rect(X0, y, 150, 58, t - 0.1, 0.3, 's1');
    pen.text(`${roundWord} ${i + 1}`, X0 + 75, y + 36, ftag, t + 0.08, 0.2, { align: 'center', col: 'line', mode: 'fade' });
    const f = env.fit(r.q, fq, ax - 330 - 18 - 70, 25, `rows[${i}].q`);
    const qi = pen.text(r.q, 330, y + 44, f, t, 0.55);
    const qe = qi.x + qi.w + 18, ym = y + 29;
    pen.line([[qe, ym], [ax - 12, ym]], ta - 0.25, 0.25, 's1', { dash: 'dash' });
    pen.head(ax - 2, ym, 0, ta - 0.02, 'line', 14);
    pen.rect(ax, y - 4, aw, 66, ta - 0.2, 0.3, 's2');
    pen.text(r.a, ax + aw / 2, y + 44, fa, ta, 0.3, { align: 'center', mode: 'pop' });
    focus = union(focus, [ax, y - 4, aw, 66]);
  });
  // amber bracket: these answers are your decisions
  const yb0 = y0 - 4, yb1 = y0 + (n - 1) * pitch + 62;
  pen.line([[X1 + 16, yb0], [X1 + 36, yb0], [X1 + 36, yb1], [X1 + 16, yb1]], c('summary'), 0.35, 'sa');

  // summary box
  env.lim('summary', s.summary, 48);
  env.lim('note', s.note, 28);
  const fsum = { fam: 'mono', w: 500, size: 25 }, fnote = sz(F.small, 25, { track: 0.04 });
  const sy = yb1 + 46;
  const bw = Math.max(pen.measure(up(s.summary), fsum), pen.measure(s.note || '', fnote)) + 60;
  pen.rect(X0, sy, bw, 100, c('summary'), 0.5, 's1');
  pen.text(up(s.summary), X0 + 30, sy + 42, fsum, c('summary') + 0.2, 0.55);
  if (s.note) pen.text(s.note, X0 + 30, sy + 82, fnote, c('note'), 0.45, { col: 'line' });

  // stamp (a person's decision: amber), right of the summary, clear of every answer and caption
  let stamp = null, stampSize = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    env.lim('stamp.small', s.stamp.small, 16);
    const p = fitStamp(pen, env, s.stamp, { sizes: [70, 50], rot: -5, prefer: [X1 - 200, sy + 50], region: [X0 + bw + 20, yb1 + 12, X1 + 20, 930], where: 'detail stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -5);
    stamp = p.rect;
    stampSize = [p.st.w, p.st.h]; // the issue's flood grows out of the stamp's own outline (film.js)
  }
  return { title, focus: union(union(focus, stamp), [X0, sy, bw, 100]), stamp, stampSize, ease: E.quartOut };
};

const DEFAULT = {
 "en": {
  "hud": "Detail 02 · Sign-off",
  "label": "Detail 02 — the owner’s review",
  "title": "REVIEW",
  "sub": "Answered once, by the flag owner.",
  "rows": [
   {
    "q": "First audience?",
    "a": "Staff, 1 %"
   },
   {
    "q": "Abort when?",
    "a": "Errors > 1 %"
   },
   {
    "q": "Rollback?",
    "a": "One click"
   }
  ],
  "roundLabel": "Ask",
  "summary": "Plan 7 · staff · abort > 1 %",
  "note": "saved → plans/7.toml",
  "stamp": {
   "word": "Signed",
   "small": "by the owner"
  },
  "issue": false,
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "详图 02 · 签字",
  "label": "详图 02 — 负责人评审",
  "title": "评审",
  "sub": "由开关负责人一次答完。",
  "rows": [
   {
    "q": "先给谁？",
    "a": "员工 1%"
   },
   {
    "q": "何时中止？",
    "a": "错误 > 1%"
   },
   {
    "q": "怎么回滚？",
    "a": "一键"
   }
  ],
  "roundLabel": "问",
  "summary": "计划 7 · 员工 · 错误超 1% 即中止",
  "note": "已存 → plans/7.toml",
  "stamp": {
   "word": "已签字",
   "small": "负责人"
  },
  "issue": false,
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.label, true], ['title', s.title], ['sub', s.sub, true], ...(s.rows || []).flatMap((r, i) => [['row' + i, r.q], ['ans' + i, r.a]]), ['summary', s.summary], ['note', s.note, true], ['summary', s.stamp?.word]];
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
  id: 'detail-confirm', kind: 'scene',
  fits: ["turn", "demo"],
  surface: ['canvas'],
  beats: { min: 10, max: 22 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, title: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 90 }, zh: { chars: 20 } } }, rows: { type: 'list', count: [2, 3], of: { q: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 56 }, zh: { chars: 12 } } }, a: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 12 }, zh: { chars: 6 } } } } }, roundLabel: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } }, summary: { type: 'text', tier: 'primary', limits: { en: { words: 10, chars: 48 }, zh: { chars: 20 } } }, note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 14 } } }, stamp: { type: 'group', of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, small: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 4, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; leaders run to the answers; the amber bracket; the stamp drops on beat 5', settled: ARRIVE_B + P.def.N0, peakAt: ARRIVE_B + P.def.stamp, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
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

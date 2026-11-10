// parts-list — install / getting started as a parts list: a bill-of-materials table of 1–3 rows with BOM balloons, then a
// chain of 2–5 chips (the first steps) under a THEN label, and a note.
// From the blueprint template's `parts` sheet (assets/templates/blueprint/sheets/parts.js; choreography.js CUES.parts): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = (s) => {
    const c = { title: 0, table: 0.5, then: 1.8, note: 3.2 };
    s.rows.forEach((_, i) => (c['row' + i] = 0.8 + i * (0.8 / Math.max(1, s.rows.length - 1))));
    s.chips.forEach((_, i) => (c['chip' + i] = 2.0 + i * (1.0 / Math.max(1, s.chips.length - 1))));
    return { N0: 4.5, c, sounds: [['title', 'pen'], ...s.rows.map((_, i) => ['row' + i, 'pen']), ...s.chips.map((_, i) => ['chip' + i, 'box'])] };
  };


const sheetPlan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 26);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.head2], bases: [310], cues: [c('title')], minSize: 70 });

  const rows = s.rows || [];
  if (rows.length < 1 || rows.length > 3) env.err('rows needs 1–3 entries');
  const fr = { fam: 'mono', w: 400, size: 35 };
  rows.forEach((r, i) => env.lim(`rows[${i}]`, r, 60));
  const colX = 300, textX = 330;
  const rf = rows.map((r, i) => env.fit('› ' + r, fr, X1 - 30 - textX, 28, `rows[${i}]`));
  const rsize = Math.min(...rf.map((f) => f.size), 35); // one size for every row
  const frow = { ...fr, size: rsize };
  const tw = Math.min(CW, Math.max(1000, ...rows.map((r) => textX - X0 + pen.measure('› ' + r, frow) + 50)));
  const ty = 384, hh = 48, rh = 84, th = hh + rows.length * rh;
  const t0 = c('table');
  pen.rect(X0, ty, tw, th, t0, 0.5, 's1');
  pen.seg(X0, ty + hh, X0 + tw, ty + hh, t0 + 0.1, 0.3, 's1');
  pen.seg(colX, ty, colX, ty + th, t0 + 0.1, 0.3, 'sf');
  const head = s.head || ['Item', 'Step'];
  head.forEach((h, i) => env.lim(`head[${i}]`, h, 8));
  const fh = F.tag;
  pen.text(up(head[0]), X0 + 26, ty + 34, fh, t0 + 0.1, 0.3, { col: 'line' });
  pen.text(up(head[1] || ''), textX, ty + 34, fh, t0 + 0.15, 0.3, { col: 'line' });
  rows.forEach((r, i) => {
    const t = c('row' + i), yc = ty + hh + rh * (i + 0.5);
    if (i < rows.length - 1) pen.seg(X0, ty + hh + rh * (i + 1), X0 + tw, ty + hh + rh * (i + 1), t0 + 0.2, 0.3, 'sg');
    pen.circle((X0 + colX) / 2, yc, 24, t - 0.1, 0.3, 's1');
    pen.text(String(i + 1), (X0 + colX) / 2, yc + 9, { fam: 'mono', w: 500, size: 25 }, t + 0.1, 0.2, { align: 'center', col: 'line', mode: 'fade' });
    const sp = [['› ', 'line'], [r, 'ink']];
    pen.text('› ' + r, textX, yc + rsize * 0.36, frow, t, 0.8, { spans: sp });
  });

  // chain of chips: the order of use
  const chips = s.chips || [];
  if (chips.length < 2 || chips.length > 5) env.err('chips needs 2–5 entries');
  chips.forEach((x, i) => env.lim(`chips[${i}]`, x, 16));
  const fc = { fam: 'mono', w: 400, size: 35 };
  const cw = chips.map((x) => pen.measure(x, fc) + 56), cg = 70;
  const total = cw.reduce((a, b) => a + b, 0) + cg * (chips.length - 1);
  if (total > CW) env.err(`chips are ${total.toFixed(0)} px wide; the sheet holds ${CW}`);
  const yb = ty + th;
  env.lim('thenLabel', s.thenLabel, 8);
  pen.text(up(s.thenLabel || 'Then'), X0, yb + 56, fh, c('then'), 0.3, { col: 'line' });
  const cy = yb + 76, ch = 80;
  let x = X0;
  chips.forEach((name, i) => {
    const t = c('chip' + i);
    pen.rect(x, cy, cw[i], ch, t, 0.25, i === 0 ? 's1' : 's2');
    pen.text(name, x + cw[i] / 2, cy + ch / 2 + 10, fc, t + 0.15, 0.25, { align: 'center' });
    if (i < chips.length - 1) pen.arrow(x + cw[i] + 8, cy + ch / 2, x + cw[i] + cg - 6, cy + ch / 2, t + 0.2, 0.12, 's2', { headSize: 16 });
    x += cw[i] + cg;
  });
  if (s.note) {
    const { text, spans: sp } = spans(s.note);
    env.lim('note', text, 90);
    const f = env.fit(text, F.small, CW, MIN, 'note');
    pen.text(text, X0, cy + ch + 62, f, c('note'), 0.6, { col: 'muted', spans: sp });
  }
  return { title, focus: null };
};

const DEFAULT = {
 "en": {
  "hud": "Parts list",
  "label": "Fig. 6 — parts list",
  "title": "Install in one line",
  "head": [
   "Item",
   "Command"
  ],
  "rows": [
   "npm i -g lintel",
   "lintel init --store launchdarkly"
  ],
  "thenLabel": "Then",
  "chips": [
   "draw a plan",
   "sign it",
   "stage it"
  ],
  "note": "Works with any flag store.",
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "零件表",
  "label": "图 6 — 零件表",
  "title": "一行命令安装",
  "head": [
   "项",
   "命令"
  ],
  "rows": [
   "npm i -g lintel",
   "lintel init --store launchdarkly"
  ],
  "thenLabel": "然后",
  "chips": [
   "画一份计划",
   "签字",
   "分阶段发布"
  ],
  "note": "支持任何开关服务。",
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.title], ...(s.rows || []).map((r, i) => ['row' + i, Array.isArray(r) ? r.map((p) => p[0]).join('') : r]), ['then', (s.chips || []).join(' '), true], ['note', Array.isArray(s.note) ? s.note.map((p) => p[0]).join('') : s.note, true]];
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
  id: 'parts-list', kind: 'scene',
  fits: ["demo", "rest"],
  surface: ['canvas'],
  beats: { min: 7, max: 14 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, title: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 26 }, zh: { chars: 10 } } }, head: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 4 } } } }, rows: { type: 'list', count: [1, 3], of: { type: 'code', tier: 'primary', limits: { en: { chars: 60 }, zh: { chars: 60 } } } }, thenLabel: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 4 } } }, chips: { type: 'list', count: [2, 5], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } }, note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 10, chars: 90 }, zh: { chars: 30 } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 6, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; the parts table rules itself; rows letter in; the chips land along the chain', settled: ARRIVE_B + P.def.N0, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
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

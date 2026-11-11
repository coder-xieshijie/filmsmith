// general-arrangement — the claim as a general arrangement: a two-line headline, then input → system → output as three boxes on
// one axis with arrows, the system name large in the middle, an overall dimension under them.
// From the blueprint template's `arrangement` sheet (assets/templates/blueprint/sheets/arrangement.js; choreography.js CUES.arrangement): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = () => ({
    N0: 4.5,
    c: { title: 0, title2: 0.7, input: 1.3, arrow1: 1.8, system: 2.0, arrow2: 2.5, output: 2.7, sub: 3.0, dim: 3.3 },
    sounds: [['title', 'pen'], ['title2', 'pen'], ['input', 'box'], ['system', 'box'], ['output', 'box'], ['dim', 'pen']],
  });


const sheetPlan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  (s.lines || []).forEach((l, i) => env.lim(`lines[${i}]`, l, 18));
  if (!Array.isArray(s.lines) || s.lines.length !== 2) env.err('lines needs exactly 2 entries');
  const title = header(pen, env, s, { lines: s.lines, fonts: [F.claim, F.claim], bases: [330, 500], cues: [c('title'), c('title2')], minSize: 100 });

  env.lim('sub', s.sub, 90);
  const fs = env.fit(s.sub, F.sub, CW, MIN, 'sub');
  pen.text(s.sub, X0, 584, fs, c('sub'), 0.9, { col: 'muted' });

  const fio = { fam: 'mono', w: 500, size: 35 }, fsys = { fam: 'cond', w: 700, size: 140, track: -0.02 };
  const parts = [['input', s.input, fio, 14], ['system', s.system, fsys, 12], ['output', s.output, fio, 14]];
  const W = parts.map(([k, p, f, lim]) => {
    env.lim(`${k}.name`, p?.name, lim);
    env.lim(`${k}.tag`, p?.tag, 18);
    const nameW = pen.measure(p?.name || '', f), tagW = pen.measure(up(p?.tag || ''), F.tag);
    return Math.max(k === 'system' ? nameW + 140 : nameW + 120, tagW + 20, k === 'system' ? 420 : 300);
  });
  const gap = (CW - W[0] - W[1] - W[2]) / 2;
  if (gap < 110) env.err(`input/system/output names are too wide (gap ${gap.toFixed(0)} px < 110)`);
  const xs = [X0, X0 + W[0] + gap, X1 - W[2]];
  const cy = 737;
  parts.forEach(([k, p, f], i) => {
    const sys = k === 'system', h = sys ? 170 : 130, y = cy - h / 2, t = c(k);
    pen.text(up(p?.tag || ''), xs[i], y - 16, F.tag, t, 0.3, { col: 'line' });
    pen.rect(xs[i], y, W[i], h, t, 0.45, sys ? 's2' : 's1');
    if (sys) pen.rect(xs[i] - 10, y - 10, W[i] + 20, h + 20, t + 0.1, 0.45, 'sf');
    pen.text(p?.name || '', xs[i] + W[i] / 2, cy + f.size * 0.35, f, t + 0.27, 0.35, { align: 'center' });
  });
  pen.arrow(xs[0] + W[0] + 10, cy, xs[1] - 10, cy, c('arrow1'), 0.25, 's2', { headSize: 20 });
  pen.arrow(xs[1] + W[1] + 10, cy, xs[2] - 10, cy, c('arrow2'), 0.25, 's2', { headSize: 20 });
  pen.dim(X0, X1, 860, c('dim'), 0.5, 18); // above the title block
  return { title, focus: null };
};

const DEFAULT = {
 "en": {
  "hud": "General arrangement",
  "label": "Fig. 2 — general arrangement",
  "lines": [
   "Drawn first,",
   "shipped in stages."
  ],
  "sub": "Each flag change becomes a plan.",
  "input": {
   "tag": "Input",
   "name": "FLAG CHANGE"
  },
  "system": {
   "tag": "Planner",
   "name": "lintel"
  },
  "output": {
   "tag": "Output · staged",
   "name": "ROLLOUT"
  },
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "总体布置",
  "label": "图 2 — 总体布置",
  "lines": [
   "先画图，",
   "再分批上线。"
  ],
  "sub": "每次开关改动都变成一份计划。",
  "input": {
   "tag": "输入",
   "name": "开关改动"
  },
  "system": {
   "tag": "规划器",
   "name": "lintel"
  },
  "output": {
   "tag": "输出 · 分阶段",
   "name": "发布"
  },
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.label, true], ['title', s.lines?.[0]], ['title2', s.lines?.[1]], ['sub', s.sub, true], ['input', s.input?.name], ['system', s.system?.name], ['output', s.output?.name]];
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
  id: 'general-arrangement', kind: 'scene',
  fits: ["claim", "turn"],
  surface: ['canvas'],
  beats: { min: 7, max: 14 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, lines: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 18 }, zh: { chars: 8 } } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 90 }, zh: { chars: 20 } } }, input: { type: 'group', of: { tag: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } } } }, system: { type: 'group', of: { tag: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } } } }, output: { type: 'group', of: { tag: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 2, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; boxes and arrows run left to right; the dimension spans them', settled: ARRIVE_B + P.def.N0, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
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

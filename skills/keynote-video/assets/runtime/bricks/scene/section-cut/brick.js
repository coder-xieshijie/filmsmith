// section-cut — an artefact and the check on it: two oblique boxes (the parts) cut by SECTION A-A, notes off the cut, a
// dimension repeating the check, the output box, and an inspection stamp in the line colour (a machine's check).
// From the blueprint template's `section` sheet (assets/templates/blueprint/sheets/section.js; choreography.js CUES.section): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = () => ({
    N0: STAMP_N0, stamp: STAMP_B,
    c: { title: 0, sub: 0.5, box1: 0.9, box2: 1.4, cut: 2.2, notes: 2.6, output: 2.9, dim: 3.2 },
    sounds: [['title', 'pen'], ['box1', 'box'], ['box2', 'box'], ['cut', 'pen'], ['dim', 'pen'], ['output', 'box']],
  });

const DX = 60, DY = -45; // oblique depth


const sheetPlan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 60);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.6, { col: 'muted' });

  const parts = s.parts || [];
  if (parts.length !== 2) env.err('parts needs exactly 2 entries');
  const fn = { fam: 'cond', w: 600, size: 35 }, fd = F.body, fl = { fam: 'mono', w: 400, size: 25 };
  const y = 470, h = 300;
  const W = parts.map((p, i) => {
    env.lim(`parts[${i}].name`, p.name, 12);
    env.lim(`parts[${i}].desc`, p.desc, 26);
    (p.lines || []).forEach((l, j) => env.lim(`parts[${i}].lines[${j}]`, l, 30));
    if ((p.lines || []).length > 2) env.err(`parts[${i}].lines holds at most 2`);
    return Math.max(360, pen.measure(p.name, fn) + 68, pen.measure(p.desc, fd) + 68, ...(p.lines || []).map((l) => pen.measure(l, fl) + 68));
  });
  const xs = [X0, X0 + W[0] + DX + 70];
  const R = xs[1] + W[1] + DX; // right edge of the second box including depth
  const tb = [c('box1'), c('box2')];
  parts.forEach((p, i) => {
    const x = xs[i], w = W[i], t = tb[i];
    pen.fill([[x, y], [x + DX, y + DY], [x + w + DX, y + DY], [x + w, y]], t + 0.35, 0.3, rgba(P.line, 1), 0.14);
    pen.fill([[x + w, y], [x + w + DX, y + DY], [x + w + DX, y + h + DY], [x + w, y + h]], t + 0.35, 0.3, rgba(P.line, 1), 0.07);
    pen.rect(x, y, w, h, t, 0.5, 's2');
    pen.line([[x, y], [x + DX, y + DY], [x + w + DX, y + DY], [x + w, y]], t + 0.2, 0.4, 's1');
    pen.line([[x + w + DX, y + DY], [x + w + DX, y + h + DY], [x + w, y + h]], t + 0.3, 0.3, 's1');
    pen.text(p.name, x + 32, y + 88, fn, t + 0.3, 0.4);
    pen.text(p.desc, x + 34, y + 130, fd, t + 0.5, 0.4, { col: 'muted' });
    if ((p.lines || []).length) p.lines.forEach((l, j) => pen.text(l, x + 34, y + 205 + j * 50, fl, t + 0.7 + j * 0.2, 0.5));
    else [0, 1, 2].forEach((j) => pen.seg(x + 34, y + 220 + j * 28, x + 34 + (w - 68) * [1, 0.83, 0.92][j], y + 220 + j * 28, t + 0.6 + j * 0.08, 0.3, 'sg'));
  });

  // section line A-A through both boxes, viewing arrows, letters
  const ys = 628, xl = X0 - 30, xr = R + 40, tc = c('cut');
  const fA = { fam: 'mono', w: 600, size: 25 };
  pen.line([[xl, ys], [xr, ys]], tc, 0.6, 's1', { dash: 'dashdot' });
  pen.arrow(xl - 16, ys, xl - 16, ys - 38, tc, 0.15, 's1', { headSize: 12 });
  pen.arrow(xr + 16, ys, xr + 16, ys - 38, tc + 0.5, 0.15, 's1', { headSize: 12 });
  pen.text('A', xl - 58, ys + 10, fA, tc + 0.06, 0.2, { col: 'line' });
  pen.text('A', xr + 34, ys + 10, fA, tc + 0.56, 0.2, { col: 'line' });
  const cutLabel = up(s.cut || 'Section A-A');
  env.lim('cut', s.cut, 14);
  // detail circle on the second artefact, leader up to the notes
  const ccx = xs[1] + W[1] * 0.62, ccy = 690, r = 118;
  pen.circle(ccx, ccy, r, tc, 0.7, 's1', { dash: 'dash' });
  const Nx = R + 110;
  // leader leaves the circle at its right-most point, runs between the lettering rows, then climbs to the notes
  pen.line([[ccx + r, ccy], [R + 30, ccy], [Nx - 60, 452], [Nx - 12, 452]], c('notes') - 0.1, 0.4, 's1');
  const notes = s.notes || [];
  if (notes.length < 1 || notes.length > 2) env.err('notes needs 1–2 entries');
  const marks = ['①', '②'];
  notes.forEach((nt, j) => {
    env.lim(`notes[${j}]`, nt, 30);
    const str = `${marks[j]} ${nt}`, f = env.fit(str, fd, X1 - Nx, MIN, `notes[${j}]`);
    pen.text(str, Nx, 462 + j * 56, f, c('notes') + j * 0.6, 0.5);
  });
  const fcut = F.tag;
  if (Nx + pen.measure(cutLabel, fcut) > X1) env.err('cut label does not fit right of the section');
  pen.text(cutLabel, Nx, ys + 7, fcut, tc + 0.6, 0.4, { col: 'line' });

  // output box with an arrow from the second artefact
  env.lim('output', s.output, 12);
  const fo = { fam: 'mono', w: 600, size: 35 }, ow = pen.measure(s.output || '', fo) + 100;
  if (Nx + ow > X1) env.err('output box does not fit');
  pen.arrow(xs[1] + W[1] + DX * 0.5 + 6, 720, Nx - 8, 720, c('output') - 0.1, 0.2, 's2', { headSize: 18 });
  pen.rect(Nx, 672, ow, 96, c('output'), 0.4, 's2');
  pen.text(s.output || '', Nx + ow / 2, 731, fo, c('output') + 0.25, 0.3, { align: 'center' });

  // overall dimension: the frozen record
  const xr2 = xs[1] + W[1];
  pen.seg(X0, y + h + 8, X0, 846, c('dim'), 0.2, 'sf');
  pen.seg(xr2, y + h + 8, xr2, 846, c('dim'), 0.2, 'sf');
  pen.dim(X0, xr2, 832, c('dim'), 0.5, 14);
  env.lim('dimension', s.dimension, 28);
  if (s.dimension) {
    const word = up(s.stamp?.word || ''), fdim = sz(F.body, 35);
    const sp = word ? [[word, 'line'], [' · ' + s.dimension, 'ink']] : [[s.dimension, 'ink']];
    const str = sp.map((p) => p[0]).join('');
    pen.text(str, (X0 + xr2) / 2, 884, fdim, c('dim') + 0.3, 0.6, { align: 'center', spans: sp });
  }

  let stamp = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    env.lim('stamp.small', s.stamp.small, 18);
    const p = fitStamp(pen, env, s.stamp, { sizes: [70, 50], rot: -8, role: 'line', prefer: [xs[0] + W[0] / 2 + 20, 712], region: [X0 - 40, y - 10, X1, 900], margin: 10, where: 'section stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -8);
    stamp = p.rect;
  }
  return { title, focus: union([X0, y + DY, R - X0, h - DY], stamp), stamp };
};

const DEFAULT = {
 "en": {
  "hud": "Detail 03 · Seal",
  "label": "Detail 03 — the archive",
  "title": "SEAL",
  "sub": "Compressed, hashed, encrypted.",
  "parts": [
   {
    "name": "dump.zst",
    "desc": "compressed SQL dump",
    "lines": []
   },
   {
    "name": "manifest",
    "desc": "sizes and hashes",
    "lines": [
     "tables 42 · rows 1.8 M",
     "sha256 per file"
    ]
   }
  ],
  "cut": "Section A-A",
  "notes": [
   "Checksums recorded.",
   "Encrypted at rest."
  ],
  "dimension": "sha256 3be1…09c2",
  "output": "ARCHIVE",
  "stamp": {
   "word": "Sealed",
   "small": "checksum ok"
  },
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "详图 03 · 封存",
  "label": "详图 03 — 归档",
  "title": "封存",
  "sub": "压缩、哈希、加密。",
  "parts": [
   {
    "name": "dump.zst",
    "desc": "压缩后的 SQL 导出",
    "lines": []
   },
   {
    "name": "manifest",
    "desc": "大小与哈希",
    "lines": [
     "42 张表 · 180 万行",
     "每个文件一个 sha256"
    ]
   }
  ],
  "cut": "剖面 A-A",
  "notes": [
   "已记录校验和。",
   "静态加密。"
  ],
  "dimension": "sha256 3be1…09c2",
  "output": "归档",
  "stamp": {
   "word": "已封存",
   "small": "校验通过"
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
const READS = (s) => [['title', s.label, true], ['title', s.title], ['sub', s.sub, true], ...(s.parts || []).map((p, i) => ['box' + (i + 1), `${p.name} ${p.desc}`]), ['notes', (s.notes || []).join(' ')], ['output', s.output], ['dim', s.dimension, true]];
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
  id: 'section-cut', kind: 'scene',
  fits: ["proof", "demo"],
  surface: ['canvas'],
  beats: { min: 10, max: 18 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, title: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 60 }, zh: { chars: 16 } } }, parts: { type: 'list', count: [2, 2], of: { name: { type: 'code', tier: 'primary', limits: { en: { chars: 12 }, zh: { chars: 12 } } }, desc: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 26 }, zh: { chars: 10 } } }, lines: { type: 'list', count: [0, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 30 }, zh: { chars: 14 } } } } } }, cut: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, notes: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 30 }, zh: { chars: 12 } } } }, output: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 12 }, zh: { chars: 4 } } }, dimension: { type: 'code', tier: 'glance', limits: { en: { chars: 28 }, zh: { chars: 28 } } }, stamp: { type: 'group', of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, small: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 6 } } } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 5, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; the oblique boxes draw; the section line cuts them; the line-colour stamp drops on beat 5', settled: ARRIVE_B + P.def.N0, peakAt: ARRIVE_B + P.def.stamp, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
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

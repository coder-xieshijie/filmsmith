// exploded-chain — the whole flow as an exploded view: 2–5 nodes float apart on dash-dot centre lines between two amber ends
// (YOU), then snap into one chain on a beat; amber brackets over the ends, a loop label, a claim and its sub.
// From the blueprint template's `assembly` sheet (assets/templates/blueprint/sheets/assembly.js; choreography.js CUES.assembly): the
// planner and its cue table are copied unchanged (capitals go through caseOf, Chinese takes the library floors and
// em-box construction lines in the pen, sheet-hud/kit.js); the brick adds the arrival (its first beat, plan lead 1),
// the sheet's two-beat hold, its reading time, its push-in on the stamp and the frame.
import { E, X0, X1, CW, F, MIN, ISO, up, header, sz, union, fitStamp, solveStamp, box, spans, rgba, fontStr, partial, polyLen, pointAt, strokePts, crit, clamp, CHECK_TABLE, checkRows, scanRowBeats, lampPass, SCAN_B, STAMP_B, STAMP_N0, ISSUE_N0, FLOOD_AFTER_B, FLOOD_B, PUSH_BACK_B, prepareSheet, makeHud, hudDefaults, drawWorld, drawLight, drawHud, foldOf, camOf, ARRIVE_B, readTime, zf, hasCJK } from '../../prop/sheet-hud/kit.js';

const CUES = () => ({
    N0: 4.5,
    c: { title: 0, axis: 0.5, ends: 0.7, nodes: 0.9, assemble: 2.25, brackets: 2.6, loop: 2.9, claim: 3.2, claimSub: 3.6 },
    sounds: [['title', 'pen'], ['ends', 'box'], ['assemble', 'clack'], ['brackets', 'mark'], ['claim', 'pen']],
  });


const sheetPlan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 26);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.head2], bases: [310], cues: [c('title')], minSize: 70 });

  const nodes = s.nodes || [], ends = s.ends || [];
  if (nodes.length < 2 || nodes.length > 5) env.err('nodes needs 2–5 entries');
  if (ends.length !== 2) env.err('ends needs exactly 2 entries');
  const fn = { fam: 'mono', w: 500, size: 35 }, fe = { fam: 'cond', w: 700, size: 100 }, fes = F.small;
  nodes.forEach((x, i) => env.lim(`nodes[${i}]`, x, 12));
  ends.forEach((e, i) => { env.lim(`ends[${i}].word`, e.word, 5); env.lim(`ends[${i}].sub`, e.sub, 16); });
  const k = nodes.length + 2;
  // the ends' sub lines sit under their boxes, so only the words size the chain
  const need = Math.max(...nodes.map((x) => pen.measure(x, fn)), ...ends.map((e) => pen.measure(e.word, fe))) + 48;
  let bw = Math.max(200, need), gap = (CW - k * bw) / (k - 1);
  if (gap < 50) { bw = need; gap = (CW - k * bw) / (k - 1); }
  if (gap < 40) env.err(`chain does not fit: ${k} boxes of ${need.toFixed(0)} px`);
  const by = 470, bh = 120, cy = by + bh / 2;
  const X = (j) => X0 + j * (bw + gap);

  // assembly axis
  // (it served the exploded view; once the parts are seated it fades so it never crosses their lettering)
  pen.line([[X0 - 30, cy], [X1 + 30, cy]], c('axis'), 0.7, 'sf', { dash: 'dashdot' }).fadeOut = c('assemble') + 0.25;

  // ends: YOU, amber
  [0, k - 1].forEach((j, e) => {
    const t = c('ends') + e * 0.15, x = X(j);
    pen.rect(x, by, bw, bh, t, 0.3, 'sa');
    pen.text(ends[e]?.word || '', x + bw / 2, by + bh / 2 + fe.size * 0.35, fe, t + 0.15, 0.3, { align: 'center', col: 'accent', mode: 'pop' });
    const sw = pen.measure(ends[e]?.sub || '', fes), sx = e ? Math.min(x + bw / 2, X1 + 40 - sw / 2) : Math.max(x + bw / 2, X0 - 40 + sw / 2);
    pen.text(ends[e]?.sub || '', sx, by + bh + 38, fes, t + 0.25, 0.3, { align: 'center', mode: 'fade' });
  });

  // nodes: exploded positions, then a spring into the chain at the assemble cue
  const ta = c('assemble'), m = (nodes.length - 1) / 2;
  nodes.forEach((name, i) => {
    const j = i + 1, fx = X(j), dx = (i - m) * 24, dy = (i % 2 ? 1 : -1) * 128;
    const t1 = c('nodes') + i * 0.25 * env.b / 0.6;
    const pos = (t) => {
      const u = crit(t - ta - i * 0.04, 15);
      return [fx + dx * (1 - u), by + dy * (1 - u)];
    };
    // dash-dot centre line from the exploded part to its seat, fades once seated
    pen.custom(t1, (ctx, t) => {
      const a = Math.min(1, (t - t1) / 0.3) * (1 - Math.min(1, Math.max(0, (t - ta) / 0.35)));
      if (a <= 0) return;
      const [x, y] = pos(t);
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = rgba(P.line, 0.55); ctx.lineWidth = 1.5; ctx.setLineDash([24, 8, 4, 8]);
      ctx.beginPath(); ctx.moveTo(x + bw / 2, y + bh / 2); ctx.lineTo(fx + bw / 2, cy); ctx.stroke();
      ctx.restore();
    });
    pen.custom(t1, (ctx, t) => {
      const [x, y] = pos(t);
      const u = Math.min(1, (t - t1) / 0.3);
      ctx.save();
      ctx.strokeStyle = P.line; ctx.lineWidth = 2.5;
      // outline draws itself
      const per = 2 * (bw + bh), d = per * E.cubicInOut(u);
      ctx.beginPath();
      const seg = [[x, y], [x + bw, y], [x + bw, y + bh], [x, y + bh], [x, y]];
      let left = d;
      ctx.moveTo(x, y);
      for (let q = 1; q < seg.length && left > 0; q++) {
        const L = Math.hypot(seg[q][0] - seg[q - 1][0], seg[q][1] - seg[q - 1][1]), f = Math.min(1, left / L);
        ctx.lineTo(seg[q - 1][0] + (seg[q][0] - seg[q - 1][0]) * f, seg[q - 1][1] + (seg[q][1] - seg[q - 1][1]) * f);
        left -= L;
      }
      ctx.stroke();
      if (u > 0.5) {
        ctx.globalAlpha *= Math.min(1, (u - 0.5) * 4);
        ctx.font = fontStr(fn); ctx.fillStyle = P.ink; ctx.textAlign = 'center';
        ctx.fillText(name, x + bw / 2, y + bh / 2 + 10);
      }
      ctx.restore();
    });
  });
  // arrows along the assembled chain
  for (let j = 0; j < k - 1; j++) pen.arrow(X(j) + bw + 4, cy, X(j + 1) - 6, cy, ta + 0.2 + j * 0.06, 0.15, 's2', { headSize: 16 });
  // constraints at both ends
  env.lim('endTag', s.endTag, 12);
  [0, k - 1].forEach((j, e) => {
    const x = X(j);
    pen.line([[x, by - 18], [x, by - 30], [x + bw, by - 30], [x + bw, by - 18]], c('brackets'), 0.3, 'sa');
    // the right-hand tag is right-aligned to its bracket, so a long tag runs inward, not off the sheet
    pen.text(up(s.endTag || 'Constraint'), e ? x + bw : x, by - 46, F.tag, c('brackets') + 0.05, 0.3, { col: 'accent', align: e ? 'right' : 'left' });
  });
  // return line: gaps flow back
  if (s.loop) {
    env.lim('loop', s.loop, 48);
    const xa = X(k - 2) + bw / 2, xb = X(1) + bw / 2, yl = by + bh + 100;
    pen.line([[xa, by + bh + 6], [xa, yl], [xb, yl], [xb, by + bh + 14]], c('loop'), 0.7, 's1', { dash: 'dash' });
    pen.head(xb, by + bh + 6, -Math.PI / 2, c('loop') + 0.66, 'line', 18);
    const fl = F.body;
    if (xb + 20 + pen.measure(s.loop, fl) > X1) env.err('loop label is too wide');
    pen.text(s.loop, xb + 20, yl + 36, fl, c('loop') + 0.2, 0.6, { col: 'line' });
  }
  if (s.claim) {
    env.lim('claim', s.claim, 36);
    pen.text(s.claim, X0 - 6, 846, env.fit(s.claim, { fam: 'cond', w: 600, size: 35 }, CW, 35, 'claim'), c('claim'), 0.5);
  }
  if (s.claimSub) {
    env.lim('claimSub', s.claimSub, 90);
    pen.text(s.claimSub, X0, 896, env.fit(s.claimSub, F.small, CW, MIN, 'claimSub'), c('claimSub'), 0.5, { col: 'muted' });
  }
  return { title, focus: null };
};

const DEFAULT = {
 "en": {
  "hud": "Assembly",
  "label": "Fig. 5 — assembly",
  "title": "One chain, two people",
  "ends": [
   {
    "word": "YOU",
    "sub": "write the change"
   },
   {
    "word": "YOU",
    "sub": "sign the plan"
   }
  ],
  "endTag": "Person",
  "nodes": [
   "plan",
   "stage",
   "canary"
  ],
  "loop": "a failed canary returns to the plan",
  "claim": "People at both ends.",
  "claimSub": "The machine runs only what a person signed.",
  "frame": {
   "title": "lintel",
   "subtitle": "Rollouts signed, then staged",
   "corner": "MIT · Open source",
   "total": 7
  }
 },
 "zh": {
  "hud": "装配",
  "label": "图 5 — 装配",
  "title": "一条链，两端是人",
  "ends": [
   {
    "word": "你",
    "sub": "写下改动"
   },
   {
    "word": "你",
    "sub": "签下计划"
   }
  ],
  "endTag": "人",
  "nodes": [
   "计划",
   "分阶段",
   "金丝雀"
  ],
  "loop": "金丝雀失败就退回计划",
  "claim": "两端都是人。",
  "claimSub": "机器只执行人签过字的计划。",
  "frame": {
   "title": "lintel",
   "subtitle": "先签字，再分阶段发布",
   "corner": "MIT · 开源",
   "total": 7
  }
 }
};
// the strings read in draw order: [cue, text, glance]
const READS = (s) => [['title', s.title], ['ends', (s.ends || []).map((e) => e.word).join(' ')], ['nodes', (s.nodes || []).join(' '), true], ['loop', s.loop, true], ['claim', s.claim], ['claimSub', s.claimSub, true]];
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
  id: 'exploded-chain', kind: 'scene',
  fits: ["demo", "claim"],
  surface: ['canvas'],
  beats: { min: 7, max: 16 },
  needs: { motions: ["guide-letter"], props: ["sheet-hud"], roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: { hud: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 7, chars: 36 }, zh: { chars: 16 } } }, title: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 26 }, zh: { chars: 10 } } }, ends: { type: 'list', count: [2, 2], of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 5 }, zh: { chars: 2 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } } }, endTag: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 12 }, zh: { chars: 4 } } }, nodes: { type: 'list', count: [2, 5], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } }, loop: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 8, chars: 48 }, zh: { chars: 16 } } }, claim: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 5, chars: 36 }, zh: { chars: 14 } } }, claimSub: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 10, chars: 90 }, zh: { chars: 24 } } } },
  roles: ['ground', 'paper', 'ink', 'line', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], sheetNo: 5, from: 'left', seed: 7, linework: 'ink' }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), c = P.def.c;
    const cues = (P.def.sounds || []).map(([k, kind]) => ({ beat: ARRIVE_B + (c[k] ?? 0), kind: { pen: 'land', box: 'tick', mark: 'accent', tick: 'tick', clack: 'hit', scan: 'turn', flood: 'turn', reinterpret: 'turn', unfold: 'turn', slot: 'tick' }[kind] || 'tick' }));
    if (P.def.stamp != null) cues.push({ beat: ARRIVE_B + P.def.stamp, kind: 'stamp' });
    return { beats: P.beats, lead: ARRIVE_B, reads: READS(s).filter((r) => r[1] && !r[2]).map((r) => ({ text: String(r[1]), lang: ctx.lang })), cues,
      motion: 'the camera arrives drawing; lines and lettering draft themselves; the exploded parts snap into one chain on a beat; amber brackets close the ends', settled: ARRIVE_B + P.def.N0, shots: P.def.stamp != null ? [{ beat: ARRIVE_B + P.def.stamp - 1.5, kind: "push-in" }] : [] };
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

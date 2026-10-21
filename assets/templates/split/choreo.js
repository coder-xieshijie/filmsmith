// choreo.js — Split choreography: the layout of each scene type and when everything happens in it. One table for
// film.js (picture), timing.rules.js (length and events) and score.mjs (sound), so the three cannot drift. Pure
// functions of content and the beat; nothing here reads a clock or the DOM, so Node tools import it too.
//
// Times are seconds from the scene's start (B = the fitted beat in seconds). Text rises through its own rail in
// 0.36 s (TEXT_IN) and leaves upward in 0.2 s; typed text runs at a constant rate (a process, principle 5). A scene's
// copy leaves at the scene's end, unless the next scene changes the whole frame with a wipe line.
import { moveOf } from './moves.js';

export const W = 1920, H = 1080, CAP = 4 / 3;     // the zoom cap: output px per source px, at most
export const TEXT_IN = 0.36, TEXT_OUT = 0.2, SETTLE = 0.3, WORD = 0.3;
export const CPS = 28, PLUS_CPS = 42;              // typing: characters a second (a command; the diff's + line)
export const MARGIN = 96;

// ---------------------------------------------------------------- layout (film px; TEMPLATE.md, Fixed parts)
export const L = {
  X: 900,               // request, pick: the vertical seam (input 804 px wide)
  XF: 1000,             // lockup: the vertical seam
  YD: 260,              // render, diff: the top band's seam
  XD: 1320,             // render: the branch; diff: where the slider starts
  XE: 620,              // diff: where the slider rests
  label: 84,            // the input label's baseline
  claimA: [330, 404],   // request: the claim's two phrases
  prompt: 600,          // request: the prompt's baseline
  claimB: 200, listY: 300, listStep: 50, listX: 136,
  claimC: 170, inputY: 236, inputStep: 46, inputX: 176,
  cmdY: 190,            // render: the command in the band
  reportX: 1360, reportLabel: 310, claimD: [390, 464], reportY: 556, reportStep: 45, resultY: 756,
  diffY: 150, diffStep: 52, diffBar: MARGIN, diffNum: 120, diffSign: 174, diffCode: 200, claimE: [140, 214], claimEX: 1040,
  name: 470, install: 580, url: 640, line: 720, page: { x: 1060, w: 800 },
};
export const YC = (s) => L.inputY + (s.lines?.length ?? 4) * L.inputStep;   // file: the horizontal seam under the code

// the pane each result type shows in, at rest
export const PANE = {
  request: { x: L.X, y: 0, w: W - L.X, h: H },
  pick: { x: L.X, y: 0, w: W - L.X, h: H },
  file: (s) => ({ x: 0, y: YC(s), w: W, h: H - YC(s) }),
  render: { x: 0, y: L.YD, w: L.XD, h: H - L.YD },
  diff: { x: 0, y: L.YD, w: W, h: H - L.YD },
  lockup: { x: L.XF, y: 0, w: W - L.XF, h: H },
};
export const paneOf = (s) => (typeof PANE[s.type] === 'function' ? PANE[s.type](s) : PANE[s.type]);

// Where an asset sits in a pane: frames and renders cover the pane at scale 1 (or the asset's `scale`, ≤ the cap)
// with its `focus` (asset px; default the centre) as near the pane's centre as covering allows; a page is contained
// in the pane, 60 px clear of the seam, at most the cap. Returns { x, y, k } (top-left in film px, film px per asset px).
export const placeOf = (A, pane, focus) => {
  const [aw, ah] = A.size;
  if (A.kind === 'page') {
    const k = Math.min(CAP, (pane.w - 120) / aw, (pane.h - 160) / ah);
    return { x: pane.x + 60, y: Math.round(pane.y + (pane.h - ah * k) / 2), k };
  }
  const k = Math.min(CAP, Math.max(A.scale ?? 1, pane.w / aw, pane.h / ah));
  const [fx, fy] = focus ?? A.focus ?? [aw / 2, ah / 2];
  const cx = pane.x + pane.w / 2, cy = pane.y + pane.h / 2;
  const x = Math.min(pane.x, Math.max(pane.x + pane.w - aw * k, cx - fx * k));
  const y = Math.min(pane.y, Math.max(pane.y + pane.h - ah * k, cy - fy * k));
  return { x: Math.round(x), y: Math.round(y), k };
};

export const words = (t) => String(t ?? '').trim().split(/\s+/).filter(Boolean);
const phrases = (c) => (Array.isArray(c) ? c : c ? [c] : []);
const ceilB = (t, B) => Math.ceil(t / B - 1e-9) * B;

// ---------------------------------------------------------------- one scene
// plan1(content, scenes, i, B, dur, start) → T: { type, need, reads, micro, keys, shots, expressive, peaks, spans, pauseFrom,
// results: [{ at, asset, move? }], copy times, move windows }. dur: the fitted length (undefined at the need);
// start: the scene's start in the film (seconds), so the diff can land its slider on the next bar line itself.
export const plan1 = (content, scenes, i, B, dur, start = 0) => {
  const s = scenes[i], T = { type: s.type, micro: [], keys: [], shots: [], expressive: [], peaks: [], spans: [], reads: [], results: [] };
  const span = (a, b) => T.spans.push([a, b]);
  const micro = (t, what) => T.micro.push({ t, what });
  const read = (text, at, extra = {}) => { T.reads.push({ text, at, ...extra }); span(at, at + TEXT_IN); micro(at, `"${text}"`); };
  // typing is a constant-rate process: an onset where it starts and one every beat while it runs (each brings new text)
  const typing = (text, at, end) => { span(at, end); micro(at, `types "${text}"`); for (let u = at + B; u < end - 0.05; u += B) micro(u, 'typing'); return end; };
  const type = (text, at, cps) => typing(text, at, at + text.length / cps);
  const moves = content.moves ?? {};
  const first = i === 0;
  T.last = i === scenes.length - 1;

  if (s.type === 'request') {
    const open = moveOf(content, 'open');
    const typeEnd = type(s.prompt, 0.25 * B, CPS);
    T.reads.push({ text: s.prompt, at: typeEnd });
    const land = Math.max(2 * B, ceilB(typeEnd + 0.75 * B, B));
    T.open = [land - 0.75 * B, land + B];          // the caret runs and stands up (0.75 beat), the drawer (1 beat)
    T.land = land;
    span(...T.open); micro(T.open[0], 'the caret runs to the seam'); micro(land + B, 'the drawer lands');
    T.keys.push({ t: land, kind: 'land', what: 'the caret has stood up into the seam' });
    if (first) T.peaks.push({ t: land, kind: 'hook' });
    T.results.push({ at: T.open[0], asset: s.result, move: { role: 'open', id: open.id, dur: T.open[1] - T.open[0] } });
    T.phrases = phrases(s.claim).map((p, k) => land + (1 + k) * B);
    phrases(s.claim).forEach((p, k) => read(p, T.phrases[k]));
    T.promptOut = (T.phrases.at(-1) ?? land) + 1.5 * B;
    span(T.promptOut, T.promptOut + TEXT_OUT); micro(T.promptOut, 'the request leaves');
  }

  if (s.type === 'pick') {
    const change = moveOf(content, 'change'), push = moveOf(content, 'push');
    T.claimAt = 0.25 * B; read(s.claim, T.claimAt);
    T.listAt = 0.5 * B; span(T.listAt, T.listAt + TEXT_IN + 0.04 * s.list.length); micro(T.listAt, 'the list rises');
    for (const it of s.list) T.reads.push({ text: it, tier: 'glance', at: T.listAt + TEXT_IN });
    T.hops = s.picks.map((p, k) => (k === 0 ? B : k === 1 ? 2 * B : (5 + 2 * (k - 2)) * B));
    T.hops.forEach((h, k) => { span(h, h + 0.25); micro(h, `tick on ${s.picks[k].item}`); });
    const prev = lastResult(content, scenes, i);
    if (prev && prev !== s.picks[0].result) T.results.push({ at: 0, asset: s.picks[0].result, move: { role: 'push', id: push.id, dur: push.beats * B } });
    else T.results.push({ at: 0, asset: s.picks[0].result });
    s.picks.forEach((p, k) => {
      if (k === 0) return;
      const m = k === 1 ? change : push, t0 = T.hops[k], d = m.beats * B;
      T.results.push({ at: t0, asset: p.result, move: { role: k === 1 ? 'change' : 'push', id: m.id, dur: d } });
      span(t0, t0 + d); micro(t0 + d, `${p.item} lands`);
      T.shots.push({ t: t0 + d, what: `${p.item} in the result pane` });
      if (k === 1) {
        T.expressive.push({ t: t0, dur: d, device: m.device, variant: `${s.picks[0].item} → ${p.item}` });
        T.keys.push({ t: t0 + d, kind: 'land', what: `${m.device} lands on ${p.item}` });
      }
    });
    T.lastLand = Math.max(...T.spans.map((x) => x[1]));
  }

  if (s.type === 'file') {
    if (!first) {
      const wipe = moveOf(content, 'wipe');
      T.wipe = [0, wipe.beats * B];
      span(...T.wipe); micro(0, 'the wipe line starts');
      T.expressive.push({ t: 0, dur: wipe.beats * B, device: wipe.device, variant: 'down' });
      T.keys.push({ t: T.wipe[1], kind: 'land', what: 'the wipe line has crossed: code over the result' });
    } else {
      // a cut-down opening on the file (edges: 'cut'): the first frame is already code over its result; the first
      // underline is the hook
      T.keys.push({ t: 2 * B, kind: 'land', what: 'the first token paired with its frame' });
      T.peaks.push({ t: 2 * B, kind: 'hook' });
    }
    T.claimAt = 1.5 * B; read(s.claim, T.claimAt);
    T.pairs = s.pairs.map((p, k) => (2 + k) * B);
    s.pairs.forEach((p, k) => {
      read(p.token, T.pairs[k]);
      T.results.push({ at: k === 0 ? 0 : T.pairs[k], asset: p.result });
      if (k > 0) { T.keys.push({ t: T.pairs[k], kind: 'accent', what: `${p.token} paired` }); T.shots.push({ t: T.pairs[k], what: `${p.token} and its frame` }); }
    });
    T.lastLand = T.pairs.at(-1) + 0.2;
  }

  if (s.type === 'render') {
    const branch = moveOf(content, 'branch');
    T.branch = [0, branch.beats * B];
    span(...T.branch); micro(0, 'the band rises'); micro(T.branch[1] / 2, 'the branch runs down');
    T.expressive.push({ t: 0, dur: branch.beats * B, device: branch.device, variant: 'band rises, a branch runs down' });
    T.keys.push({ t: T.branch[1], kind: 'land', what: 'three panes' });
    T.shots.push({ t: T.branch[1], what: 'command | film | report' });
    T.cmdAt = 0.75 * B; T.cmdEnd = type(s.command, T.cmdAt, CPS); T.reads.push({ text: s.command, at: T.cmdEnd });
    T.cuts = s.results.map((_, k) => (2 + k) * B);
    s.results.forEach((r, k) => {
      T.results.push({ at: T.cuts[k], asset: r });
      micro(T.cuts[k], `frame ${r}`);
      if (k > 0) T.keys.push({ t: T.cuts[k], kind: 'accent', what: `frame ${r}` });
    });
    T.labelAt = T.branch[1] - 0.5 * B; span(T.labelAt, T.labelAt + TEXT_IN); micro(T.labelAt, 'report label');
    const [p1, p2] = phrases(s.claim);
    T.p1 = 2.5 * B; read(p1, T.p1);
    T.lines = s.report.lines.map((_, k) => 3 * B + 0.5 * k * B);
    s.report.lines.forEach((ln, k) => { T.reads.push({ text: ln.join(' '), tier: 'glance', at: T.lines[k] + TEXT_IN }); span(T.lines[k], T.lines[k] + TEXT_IN); micro(T.lines[k], `report line ${k + 1}`); });
    T.resultAt = Math.max(T.lines.at(-1) + B, T.cuts.at(-1) + 0.5 * B);
    read(s.report.result, T.resultAt);
    if (p2) { T.p2 = T.resultAt + 0.5 * B; read(p2, T.p2); }   // half a beat after the result line (its own state)
    T.lastLand = T.resultAt + TEXT_IN;
  }

  if (s.type === 'diff') {
    const slide = moveOf(content, 'slide');
    // the slider lands on the first bar line at least 7.5 beats in (the claim's key sits on a bar line, principle 5);
    // everything else is placed back from that landing, and the + line types into whatever that leaves (a process,
    // constant speed, 12–42 characters a second), so no still stretch passes 2 beats however the bar falls
    const bar = 4 * B, land = Math.ceil((start + 7.5 * B) / bar - 1e-6) * bar - start;
    T.slide = [land - slide.beats * B, land];
    T.chipsAt = land - 4 * B;
    T.p1 = land - 6 * B;
    T.plusAt = 0.5 * B;
    const n = s.line.after.length;
    T.plusEnd = Math.max(T.plusAt + n / PLUS_CPS, Math.min(T.plusAt + n / 12, T.p1 - 0.5 * B));
    T.plusCps = n / (T.plusEnd - T.plusAt);
    typing(s.line.after, T.plusAt, T.plusEnd); T.reads.push({ text: s.line.after, at: T.plusEnd });
    const [p1, p2] = phrases(s.claim);
    read(p1, T.p1); T.shots.push({ t: T.p1, what: 'the diff and its first phrase' });
    span(T.chipsAt, T.chipsAt + 0.24); micro(T.chipsAt, 'before and after named');
    T.shots.push({ t: T.chipsAt, what: 'before | after named' });
    span(...T.slide); micro(T.slide[0], 'the slider moves');
    T.results.push({ at: 0, asset: s.before, after: s.after });
    T.p2 = T.slide[1]; read(p2 ?? '', T.p2, { claim: true });
    T.keys.push({ t: T.slide[1], kind: 'claim', what: 'the edit takes the frame over' });
    T.peaks.push({ t: T.slide[1], kind: 'claim', climax: true });
    T.shots.push({ t: T.slide[1], what: 'the slider at rest' });
    T.pauseFrom = T.p2 + TEXT_IN + 0.1;
    T.lastLand = T.pauseFrom;
  }

  if (s.type === 'lockup') {
    const wipe = moveOf(content, 'wipe');
    T.wipe = [0, wipe.beats * B];
    span(...T.wipe); micro(0, 'the wipe line starts');
    T.expressive.push({ t: 0, dur: wipe.beats * B, device: wipe.device, variant: 'left' });
    T.keys.push({ t: T.wipe[1], kind: 'land', what: 'the wipe line has crossed: the lock-up' });
    T.results.push({ at: 0, asset: s.result });
    T.nameAt = T.wipe[1] + 1.5 * B; read(s.name, T.nameAt);
    T.keys.push({ t: T.nameAt + 0.5 * B, kind: 'land', what: 'the name lands' });
    T.peaks.push({ t: T.nameAt + 0.5 * B, kind: 'lockup' });
    T.cmdAt = T.nameAt + B; T.cmdEnd = type(s.command, T.cmdAt, CPS); T.reads.push({ text: s.command, at: T.cmdEnd });
    T.urlAt = ceilB(T.cmdEnd + 0.5 * B, B); read(s.url, T.urlAt);
    T.lineAt = s.line ? T.urlAt + B : null;
    if (s.line) { T.reads.push({ text: s.line, tier: 'glance', at: T.lineAt + TEXT_IN }); span(T.lineAt, T.lineAt + TEXT_IN); micro(T.lineAt, 'the line'); }
    const D = dur ?? null;
    if (D != null) {
      T.close = [D - 5 * B, D - 4 * B];
      span(...T.close); micro(T.close[0], 'the seam closes');
      T.keys.push({ t: T.close[1], kind: 'land', what: 'second move: the seam has closed, the caret waits' });
      T.blinks = [0, 1, 2, 3].map((k) => T.close[1] + k * B).filter((t) => t < D);
      T.blinks.forEach((t) => micro(t, 'the caret blinks'));
    }
    T.lastLand = (T.lineAt ?? T.urlAt) + TEXT_IN;
  }
  return T;
};

// the result showing at the end of scene i−1 (what a scene continues from)
export const lastResult = (content, scenes, i) => {
  for (let k = i - 1; k >= 0; k--) {
    const s = scenes[k];
    if (s.type === 'request' || s.type === 'lockup') return s.result;
    if (s.type === 'pick') return s.picks.at(-1).result;
    if (s.type === 'file') return s.pairs.at(-1).result;
    if (s.type === 'render') return s.results.at(-1);
    if (s.type === 'diff') return s.after;
  }
  return null;
};

// need(T, reading) → seconds the scene needs: its last landing, its reading done, then the type's own tail
export const needOf = (T, B, reading) => {
  const r = reading(T.reads.filter((x) => x.text));
  const read = Math.max(r.done ?? 0, r.glanceDone ?? 0);
  switch (T.type) {
    case 'request': return Math.max(read, T.promptOut + TEXT_OUT) + SETTLE;
    case 'pick': return Math.max(read, T.lastLand + 1.25 * B);
    case 'file': return Math.max(read + SETTLE, T.lastLand + 1.5 * B);
    case 'render': return Math.max(read + SETTLE, T.lastLand + B);
    case 'diff': return Math.max(read, T.p2 + TEXT_IN) + 2 * B;
    case 'lockup': return Math.max(T.urlAt + 3, (T.lineAt ?? T.urlAt) + TEXT_IN + 0.5 + 5 * B);   // the address ≥ 3 s on screen; the close starts 0.5 s after the last landing
    default: return read;
  }
};

// holds: the still windows between the busy spans of a scene (≥ 0.2 s); the diff's last one is the claim's pause
export const holdsOf = (T, dur) => {
  const sp = [...T.spans].sort((a, b) => a[0] - b[0]);
  const end = T.type === 'lockup' || T.last ? dur : dur - TEXT_OUT, out = [];
  let busy = 0;
  for (const [a, b] of sp) {
    if (a - busy >= 0.2 + 1 / 30 && busy > 0) out.push({ from: busy, to: a - 1 / 30 });
    busy = Math.max(busy, b);
  }
  if (end - busy >= 0.2 + 1 / 30) out.push({ from: busy, to: end - 1 / 30 });
  return out.map((h) => (T.pauseFrom != null && h.from >= T.pauseFrom - 0.5 ? { ...h, pause: true } : h));
};

// ---------------------------------------------------------------- validation (TEMPLATE.md, Scene registry)
export const LIMITS = { claim: 5, claimChars: 24, prompt: 40, label: 44, list: [2, 10], item: 14, picks: [2, 4], lines: [2, 6], lineChars: 64, pairs: [1, 4], command: 44, results: [2, 5], report: [1, 5], reportChars: 30, diffChars: 40, name: 16, url: 44, line: 6, chip: 52 };
const TYPES = ['request', 'pick', 'file', 'render', 'diff', 'lockup'];
export const validate = (content) => {
  const e = [], A = content.assets ?? {}, S = content.scenes ?? [];
  const asset = (id, at, kinds) => { if (!A[id]) e.push(`${at}: asset "${id}" is not in assets`); else if (kinds && !kinds.includes(A[id].kind)) e.push(`${at}: asset "${id}" is a ${A[id].kind}; here a ${kinds.join(' or ')}`); };
  const claim = (c, at, max = LIMITS.claim) => phrases(c).forEach((p, k) => {
    if (words(p).length > max) e.push(`${at}: claim phrase ${k + 1} "${p}" has ${words(p).length} words; at most ${max} (one state)`);
    if (p.length > LIMITS.claimChars) e.push(`${at}: claim phrase ${k + 1} over ${LIMITS.claimChars} characters (it must fit the input side at 59 px)`);
  });
  for (const [id, a] of Object.entries(A)) {
    if (!a.file || !Array.isArray(a.size) || a.size.length !== 2) e.push(`assets.${id}: needs file and size [w, h]`);
    if (!['frame', 'render', 'page'].includes(a.kind)) e.push(`assets.${id}: kind is 'frame', 'render' or 'page'`);
    if (!a.chip || a.chip.length > LIMITS.chip) e.push(`assets.${id}: chip (the source shown beside the seam), at most ${LIMITS.chip} characters`);
    if (!String(a.people ?? '').startsWith('none')) e.push(`assets.${id}: people must start with 'none' (crop people, avatars and account rows out; say what was checked)`);
    if (a.kind === 'frame' && !(a.from?.film && Number.isFinite(a.from?.at))) e.push(`assets.${id}: a frame names its film and time: from { film, at }`);
    if ((a.scale ?? 1) > CAP + 1e-9) e.push(`assets.${id}: scale ${a.scale} over the zoom cap ${CAP.toFixed(3)}`);
  }
  if (!S.length) e.push('scenes: none');
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES.includes(s.type)) return e.push(`${at}: unknown type; types: ${TYPES.join(', ')}`);
    if (s.label && s.label.length > LIMITS.label) e.push(`${at}: label over ${LIMITS.label} characters`);
    if (s.type === 'request') {
      if (i !== 0) e.push(`${at}: request opens the film (scene 1 only)`);
      if (!s.prompt || s.prompt.length > LIMITS.prompt) e.push(`${at}: prompt, at most ${LIMITS.prompt} characters`);
      asset(s.result, at, ['frame', 'render']); claim(s.claim, at);
      if (phrases(s.claim).length > 2) e.push(`${at}: claim in at most two phrases`);
    }
    if (s.type === 'pick') {
      if (i === 0 || !['request', 'pick'].includes(S[i - 1].type)) e.push(`${at}: pick follows request (it keeps the vertical seam)`);
      if (!Array.isArray(s.list) || s.list.length < LIMITS.list[0] || s.list.length > LIMITS.list[1]) e.push(`${at}: list of ${LIMITS.list.join('–')} items`);
      else s.list.forEach((x) => { if (String(x).length > LIMITS.item) e.push(`${at}: list item "${x}" over ${LIMITS.item} characters`); });
      if (!Array.isArray(s.picks) || s.picks.length < LIMITS.picks[0] || s.picks.length > LIMITS.picks[1]) e.push(`${at}: picks, ${LIMITS.picks.join('–')} of { item, result }`);
      else s.picks.forEach((p, k) => { if (!s.list?.includes(p.item)) e.push(`${at}: pick ${k + 1} "${p.item}" is not in the list`); asset(p.result, `${at} pick ${k + 1}`, ['frame', 'render']); });
      claim(s.claim, at);
    }
    if (s.type === 'file') {
      if (!s.source?.file || !Number.isInteger(s.source?.from)) e.push(`${at}: source { file, from }: the file the lines are quoted from and the first line's number`);
      if (!Array.isArray(s.lines) || s.lines.length < LIMITS.lines[0] || s.lines.length > LIMITS.lines[1]) e.push(`${at}: lines, ${LIMITS.lines.join('–')} lines quoted verbatim`);
      else s.lines.forEach((l, k) => { if (l.length > LIMITS.lineChars) e.push(`${at}: line ${k + 1} over ${LIMITS.lineChars} characters (it must fit the frame at 33 px)`); });
      if (!Array.isArray(s.pairs) || s.pairs.length < LIMITS.pairs[0] || s.pairs.length > LIMITS.pairs[1]) e.push(`${at}: pairs, ${LIMITS.pairs.join('–')} of { line, token, result }`);
      else s.pairs.forEach((p, k) => {
        if (!s.lines?.[p.line]?.includes(p.token)) e.push(`${at}: pair ${k + 1}: token ${p.token} is not on line ${p.line} (0-based) of lines`);
        asset(p.result, `${at} pair ${k + 1}`, ['frame', 'render']);
      });
      claim(s.claim, at);
    }
    if (s.type === 'render') {
      if (S[i - 1]?.type !== 'file') e.push(`${at}: render follows file (the band rises from the file's seam)`);
      if (!s.command || s.command.length > LIMITS.command) e.push(`${at}: command, at most ${LIMITS.command} characters`);
      if (!Array.isArray(s.results) || s.results.length < LIMITS.results[0] || s.results.length > LIMITS.results[1]) e.push(`${at}: results, ${LIMITS.results.join('–')} asset ids`);
      else s.results.forEach((r) => asset(r, at, ['frame', 'render']));
      const rp = s.report;
      if (!rp?.label || !Array.isArray(rp?.lines) || rp.lines.length < LIMITS.report[0] || rp.lines.length > LIMITS.report[1] || !rp.result) e.push(`${at}: report { label, source, lines: 1–5 of [status, item, value], result }`);
      else rp.lines.forEach((l) => { if (!Array.isArray(l) || l.length !== 3 || l.join(' ').length > LIMITS.reportChars) e.push(`${at}: report line ${JSON.stringify(l)}: [status, item, value], at most ${LIMITS.reportChars} characters`); });
      claim(s.claim, at);
    }
    if (s.type === 'diff') {
      if (!s.source?.file || !Number.isInteger(s.line?.n)) e.push(`${at}: source { file } and line { n, before, after }`);
      if (!s.line?.before || !s.line?.after || s.line.before.length > LIMITS.diffChars || s.line.after.length > LIMITS.diffChars) e.push(`${at}: line.before and line.after, at most ${LIMITS.diffChars} characters each`);
      asset(s.before, `${at} before`, ['frame', 'render']); asset(s.after, `${at} after`, ['frame', 'render']);
      if (A[s.before] && A[s.after] && String(A[s.before].size) !== String(A[s.after].size)) e.push(`${at}: before and after must be the same size (two renders of one instant, registered)`);
      claim(s.claim, at, 8);
      if (phrases(s.claim).length !== 2) e.push(`${at}: claim in two phrases (the second lands with the slider)`);
    }
    if (s.type === 'lockup') {
      if (i !== S.length - 1) e.push(`${at}: lockup closes the film (last scene only)`);
      if (!s.name || s.name.length > LIMITS.name) e.push(`${at}: name, at most ${LIMITS.name} characters`);
      if (!s.command || s.command.length > LIMITS.command) e.push(`${at}: command, at most ${LIMITS.command} characters`);
      if (!s.url || s.url.length > LIMITS.url) e.push(`${at}: url, at most ${LIMITS.url} characters`);
      if (s.line && words(s.line).length > LIMITS.line) e.push(`${at}: line over ${LIMITS.line} words (a glance)`);
      asset(s.result, at, ['page', 'frame', 'render']);
    }
  });
  const cut = content.edges === 'cut';
  if (content.edges !== undefined && !['full', 'cut'].includes(content.edges)) e.push(`edges: 'full' or 'cut' (got ${content.edges})`);
  if (S.length && S.at(-1).type !== 'lockup' && !(cut && S.at(-1).type === 'diff')) e.push(cut ? "the last scene must be lockup or (edges: 'cut') diff" : "the last scene must be lockup (a cut-down may end on a diff: edges: 'cut')");
  if (content.seam && !['straight', 'stitched'].includes(content.seam)) e.push(`seam: 'straight' or 'stitched' (got ${content.seam})`);
  for (const [role, id] of Object.entries(content.moves ?? {})) { try { moveOf({ moves: { [role]: id } }, role); } catch (x) { e.push(x.message); } }
  return e;
};

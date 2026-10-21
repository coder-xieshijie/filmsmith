// choreo.js — the Strip choreography: every scene's moves, texts and events in beats from its start, and the reels
// they run on. One pure module read by timing.rules.js (need, reading, events), film.js (the picture) and score.mjs
// (the sound), so the three cannot drift. No DOM.
//
// The grammar (TEMPLATE.md, "Scene registry"): titles and frames feed one reel through the gate, a pull-down at a
// time; a frame in the gate may punch to the full frame and shrink into its cell on the contact sheet; the grease
// pencil picks a cell, which punches to full and runs; the lock-up pulls in a source frame and runs the strip out.
// Every landing in the gate is pulled in during the last quarter beat before it, which belongs to the scene before
// when the landing opens a scene, so a scene's first landing is on its first beat.

export const C = {
  pull: 0.25,          // beats: one claw pull-down
  runIn: 2,            // beats: the opening run braking onto the first frame (strip-advance, brake: T2)
  runInCells: 3.5,     // cells the opening run passes
  fill: 6,             // cells in front of the reel for the run to pass (the films' gate frames, blurred)
  wordSec: 0.3,
  holdMax: 2,          // beats: the longest still after a landing (principle 5)
  track: [0.4, 1.15],  // beats after its landing: the optical track lights, swept left to right
  punch: 1, full: 1,   // beats: the punch to the full frame; the hold at full size
  loop: 1, step: 0.5,  // beats: the pencil loop; the other rows stepping back
  pick: 1,             // beats: the ringed cell to the full frame (sheet-pick: T2)
  back: 1,             // beats: the full frame into the gate (gate-punch out)
  runOut: 1.5,         // beats: strip-advance, run-out (T2)
  urlCps: 72,          // characters a second the address types at
  urlHold: 3,          // seconds the address holds (principle 1)
  rowStep: 0.1,        // beats between rows (the pull-out, the lengths)
};
export const TYPES = ['titles', 'frames', 'punch', 'sheet', 'pick', 'lockup'];

export const words = (t) => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;
const q4 = (x) => Math.ceil(x * 4 - 1e-9) / 4;
const ceil1 = (x) => Math.ceil(x - 1e-9);
export const lineOf = (l) => (typeof l === 'string' ? { text: l } : { ...l });
const readBeats = (text, B) => (words(text) * C.wordSec) / B;

// the films a frames scene runs through (default: every film, in the manifest's order)
export const filmsOf = (s, content) => (s.films?.length ? s.films : Object.keys(content.films || {}));
// does the next scene open with a landing in the gate (pulled in during this scene's last quarter beat)?
const nextPulls = (next) => !!next && (next.type === 'titles' || next.type === 'frames' || (next.type === 'lockup' && next.source && next.after !== 'pick'));

// ---------- one scene, in beats from its start (dur: its fitted beats; undefined while fitting) ----------
export function local(s, ctx, B, dur) {
  const i = ctx.i, scenes = ctx.scenes, content = ctx.content || {}, prev = scenes[i - 1], next = scenes[i + 1];
  const tail = nextPulls(next && { ...next, after: s.type === 'pick' ? 'pick' : undefined }) ? C.pull : 0;
  const P = { type: s.type, landings: [], captions: [], holds: [], micro: [], keys: [], peaks: [], expressive: [], shots: [], handoffs: [], items: [] };
  const hold = (a, b, pause) => { if (b - a >= 0.4 - 1e-9) P.holds.push(pause ? [a, b, true] : [a, b]); };

  if (s.type === 'titles') {
    const lines = (s.lines || []).map(lineOf), first = i === 0 && content.edges !== 'cut';   // edges 'cut': no opening run
    const L0 = first ? C.runIn : 0;
    // each line's slot: its reading plus the pull-down that takes it away, on a quarter-beat grid, at least a beat
    const slot = lines.map((l) => Math.max(1, q4(readBeats(l.text, B) + C.pull)));
    // where a hold can stretch: up to holdMax after the landing (after the track lights, for a line that lights it)
    const cap = lines.map((l, k) => Math.max(0, C.holdMax - (slot[k] - C.pull - (l.track ? C.track[1] : 0))));
    const need = L0 + slot.reduce((a, b) => a + b, 0) - (tail ? 0 : C.pull);
    let extra = dur != null ? Math.max(0, dur - need) : 0;
    const totalCap = cap.reduce((a, b) => a + b, 0) || 1;
    // in quarter beats, so every landing stays on the quarter-beat grid
    const add = cap.map((c) => Math.floor(Math.min(c, (extra * c) / totalCap) * 4 + 1e-9) / 4);
    extra -= add.reduce((a, b) => a + b, 0);
    for (let k = 0; extra > 1e-6 && k < 4 * lines.length; k++) {
      const j = k % lines.length;
      if (add[j] + 0.25 <= cap[j] + 1e-9) { add[j] += 0.25; extra -= 0.25; }
    }
    if (extra > 1e-6) add[add.length - 1] += extra;            // reported by the hold check if it breaks a hold
    let L = L0;
    lines.forEach((l, k) => {
      const end = L + slot[k] + add[k] - (k === lines.length - 1 && !tail ? 0 : C.pull);
      P.landings.push({ at: L, kind: 'title', line: k, text: l.text, track: !!l.track });
      P.items.push({ text: l.text, at: L * B });
      P.micro.push([L, `intertitle: ${l.text}`]);
      if (l.track) {
        P.track = [L + C.track[0], L + C.track[1]];
        P.micro.push([L + C.track[0], 'the optical track lights']);
        hold(L, L + C.track[0]); hold(L + C.track[1], end);
      } else hold(L, end);
      L = end + (k === lines.length - 1 && !tail ? 0 : C.pull);
    });
    P.need = need;
    if (first) {
      P.expressive.push({ t: 0, beats: C.runIn, device: 'strip-advance', variant: 'brake: the run stops on the first frame' });
      P.keys.push({ t: C.runIn, kind: 'land' });
      P.runIn = [0, C.runIn];
    }
    if (s.hook) { const t = P.landings.at(-1).at; P.peaks.push({ t, kind: 'hook' }); if (Number.isInteger(t)) P.keys.push({ t, kind: 'accent' }); }
    if (!first && P.landings[0]) P.shots.push([0, 'intertitles']);
  }

  if (s.type === 'frames') {
    const ids = filmsOf(s, content), n = ids.length;
    ids.forEach((id, k) => {
      const end = k === n - 1 ? (dur ?? n) - tail : k + 1 - C.pull;
      P.landings.push({ at: k, kind: 'film', film: id });
      P.captions.push({ from: k, to: k === n - 1 ? (dur ?? n) : k + 1 - C.pull, text: content.films?.[id]?.name ?? id });
      P.items.push({ text: content.films?.[id]?.name ?? id, at: k * B });
      if (k) P.micro.push([k, `frame: ${id}`]);
      hold(k, end);
    });
    P.need = n;
    P.keys.push({ t: 0, kind: 'land' });
    if (n > 4) P.keys.push({ t: Math.floor(n / 2), kind: 'land' });
    if (n > 1) P.keys.push({ t: n - 1, kind: 'land' });
  }

  if (s.type === 'punch') {
    P.punch = [0, C.punch]; P.full = [C.punch, C.punch + C.full]; P.out = [C.punch + C.full, C.punch + C.full + C.back];
    P.need = P.out[1];
    P.expressive.push({ t: 0, beats: C.punch, device: 'gate-punch', variant: 'in, from the gate' });
    P.keys.push({ t: 0, kind: 'accent' }, { t: C.punch, kind: 'land' });
    P.shots.push([C.punch, 'the frame at full size']);
    P.micro.push([P.out[0], 'the frame shrinks into its cell on the sheet']);
    P.handoffs.push(0, P.out[0]);
    hold(P.full[0], P.full[1]);
  }

  if (s.type === 'sheet') {
    const lines = (s.lines || []).map(lineOf);
    const rows = Object.values(content.films || {});
    const short = Math.min(...rows.map((f) => f.duration));
    const longer = rows.filter((f) => f.duration > short + 1e-3).length;
    const l1 = 1, r1 = readBeats(lines[0]?.text, B);
    P.extend = longer ? [2, 2.75 + C.rowStep * (longer - 1)] : null;
    const extEnd = P.extend ? P.extend[1] : 2;
    P.items.push({ text: lines[0]?.text, at: l1 * B });
    P.captions.push({ from: l1, text: lines[0]?.text });
    let L2 = null, lenAt;
    if (lines[1]) {
      L2 = ceil1(Math.max(l1 + r1, extEnd + 0.25));
      P.captions[0].to = L2;
      P.captions.push({ from: L2, text: lines[1].text });
      P.items.push({ text: lines[1].text, at: L2 * B });
      lenAt = L2 + 0.25;
      P.keys.push({ t: L2, kind: 'accent' }); P.shots.push([L2, 'the measured lengths']);
    } else lenAt = Math.max(extEnd + 0.25, ceil1(l1 + r1));
    P.lengths = [lenAt, lenAt + C.rowStep * rows.length];
    const readEnd = L2 != null ? L2 + readBeats(lines[1].text, B) : l1 + r1;
    P.need = ceil1(Math.max(readEnd, P.lengths[1] + 0.25));
    const end = dur ?? P.need;
    P.captions.at(-1).to = end;
    P.keys.push({ t: 0, kind: 'land' });
    P.micro.push([l1, 'caption'], [lenAt, 'the measured lengths']);
    if (P.extend) P.micro.push([P.extend[0], 'the longer strips pull out']);
    hold(0, l1); hold(P.extend ? extEnd : l1, L2 ?? lenAt); hold(P.lengths[1], end);
  }

  if (s.type === 'pick') {
    const run = content.films?.[s.film]?.run;
    const runBeats = run ? (run.frames - 1) / run.fps / B : C.full;
    P.loop = [0, C.loop]; P.stepBack = [C.loop, C.loop + C.step];
    P.pick = [C.loop + 1, C.loop + 1 + C.pick];
    P.run = [P.pick[1], P.pick[1] + runBeats];
    P.back = [P.run[1], P.run[1] + C.back];
    P.need = ceil1(P.back[1]);
    P.captions.push({ from: 0, to: P.pick[0] + 0.5, text: s.caption });
    P.items.push({ text: s.caption, at: 0 });
    P.keys.push({ t: P.loop[1], kind: 'accent' }, { t: P.pick[1], kind: 'land' });
    P.expressive.push({ t: P.pick[0], beats: C.pick, device: 'sheet-pick', variant: 'from the ringed cell' });
    P.peaks.push({ t: P.pick[1], kind: 'reveal', climax: true });
    P.shots.push([P.pick[1], 'the picked film at full size, running']);
    P.micro.push([P.stepBack[0], 'the other rows step back']);
    for (let b = Math.ceil(P.run[0] + 1); b < P.run[1]; b++) P.micro.push([b, 'the picked film runs']);
    P.micro.push([P.back[0], 'into the gate']);
    P.handoffs.push(P.pick[0], P.back[0]);
    hold(P.stepBack[1], P.pick[0]);
    if (!run) hold(P.run[0], P.run[1]);
  }

  if (s.type === 'lockup') {
    const afterPick = prev?.type === 'pick';
    const src = s.source ? (afterPick ? 1 : 0) : null;    // the source frame lands (after a pick: pulled in here)
    const lineAt = src ?? 0.5;
    const r = s.line ? readBeats(s.line, B) : 0;
    const runOut = ceil1(Math.max(lineAt + r, lineAt + 1));
    const nameAt = runOut + 2, urlAt = nameAt + 1;
    const urlBeats = Math.max(0.5, (String(s.url || '').length / C.urlCps) / B);
    P.source = src; P.runOut = [runOut, runOut + C.runOut]; P.name = [nameAt, nameAt + 0.4]; P.url = [urlAt, urlAt + urlBeats];
    const holdUrl = C.urlHold / B;
    P.need = urlAt + urlBeats + holdUrl;
    const end = dur ?? P.need;
    P.underline = [Math.max(urlAt + urlBeats + 0.5, end - 4), Math.max(urlAt + urlBeats + 0.5, end - 4) + 0.75];
    if (src != null) { P.landings.push({ at: src, kind: 'source' }); if (src > 0) P.micro.push([src, 'the source frame registers']); }
    if (s.line) { P.captions.push({ from: lineAt, to: runOut, text: s.line }); P.items.push({ text: s.line, at: lineAt * B }); P.micro.push([lineAt, 'line']); }
    P.items.push({ text: s.name, at: nameAt * B }, { text: s.url, at: urlAt * B });
    P.expressive.push({ t: runOut, beats: C.runOut, device: 'strip-advance', variant: 'run-out: the strip leaves the gate' });
    P.keys.push({ t: nameAt, kind: 'land', drop: true });
    if (Number.isInteger(P.underline[0])) P.keys.push({ t: P.underline[0], kind: 'accent' });
    P.peaks.push({ t: nameAt, kind: 'lockup' });
    P.shots.push([nameAt, 'the name']);
    P.micro.push([urlAt, 'the address types']);
    if (afterPick) hold(0, (src ?? lineAt) - (src != null ? C.pull : 0));
  }
  return P;
}

// ---------- the whole film at its fitted length: absolute times (seconds) and the reels ----------
// T: lib/timing.js fit() result. Returns { B, scenes: [{ ...scene, p (local plan), start, end }], reel, close,
// stops (gate landings on the main reel: [t, cell]), closeStops, runIn, trackOn, … }
export function build(content, T) {
  const B = T.beat;
  const scenes = T.scenes.map((s, i) => ({ ...s, i, p: local(s, { i, scenes: T.scenes, content }, B, (s.end - s.start) / B) }));
  const films = content.films || {};
  const ids = Object.keys(films);
  // the main reel: fill cells for the run to pass, then every landing of titles and frames scenes, then a leader
  const reel = [];
  for (let k = 0; k < C.fill; k++) reel.push({ kind: 'film', film: ids[(ids.length - C.fill + k + ids.length * 4) % ids.length], fill: true });
  const stops = [];
  let close = null; const closeStops = [];
  let pickScene = null, punchScene = null;
  for (const sc of scenes) {
    const at = (b) => sc.start + b * B;
    for (const L of sc.p.landings) {
      if (L.kind === 'source' && pickScene) continue;     // after a pick the source frame is on the closing reel
      reel.push(L.kind === 'title' ? { kind: 'title', text: L.text, line: L.line, scene: sc.i } : L.kind === 'film' ? { kind: 'film', film: L.film } : { kind: 'source' });
      stops.push([at(L.at), reel.length - 1]);
    }
    if (sc.type === 'punch') punchScene = sc;
    if (sc.type === 'pick') pickScene = sc;
  }
  reel.push({ kind: 'leader' });
  if (pickScene) {
    const f = films[pickScene.film], run = f?.run;
    close = [{ kind: 'run', film: pickScene.film, frame: run ? Math.floor((run.frames - 1) / 2) : 0 }, { kind: 'run', film: pickScene.film, frame: run ? run.frames - 1 : 0 }];
    const lock = scenes.find((x) => x.type === 'lockup');
    if (lock?.source) { close.push({ kind: 'source' }); closeStops.push([lock.start + lock.p.source * B, 2]); }
  }
  const first = scenes[0];
  return {
    B, scenes, reel, stops, close, closeStops, punchScene, pickScene,
    runIn: first.p.runIn ? [first.start, first.start + first.p.runIn[1] * B] : null,
    track: (() => { const s = scenes.find((x) => x.p.track); return s ? [s.start + s.p.track[0] * B, s.start + s.p.track[1] * B] : null; })(),
  };
}

// the scene a time falls in
export const sceneAt = (F, t) => (t < F.scenes[0].start ? F.scenes[0] : F.scenes.find((s) => t >= s.start - 1e-9 && t < s.end - 1e-9) ?? F.scenes.at(-1));

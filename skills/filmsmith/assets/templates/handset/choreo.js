// choreo.js — Handset choreography: the device's geometry, the screen views, and when everything happens in each scene.
// One table for film.js (picture), timing.rules.js (length and events) and score.mjs (sound), so the three cannot
// drift. Pure functions of content and the beat; nothing here reads a clock or the DOM.
//
// A scene's times are seconds from its start. Every state of the margin enters in the same order (the copy group):
//   value (display) on the landing → note (glance) one beat later → line (primary) one beat after that → the ring
//   closes round the evidence one beat later (a T0 change that is not new text, so the line is read in a still frame
//   while the picture keeps a change about every beat).

import { moveOf } from './moves.js';

export const W = 1920, H = 1080;
export const CAP = 1 / 0.75;            // the zoom cap: output px per source px, at most (1 output px >= 0.75 source px)
export const TEXT_IN = 0.36, TEXT_OUT = 0.2, READABLE = 0.1, SETTLE = 0.2, RING_DRAW = 0.25;

// ---------------------------------------------------------------- the device (form variant `device`)
// laptop: head-on lid with a 16:10 screen and a chin naming the source; phone: head-on body with a 400 × 840 screen,
// the source line under it. The margin (copy) sits right of the device, 88 px clear.
export const DEVICES = {
  laptop: {
    body: { x: 96, y: 131, w: 1192, h: 800, r: 28 }, deck: { x: 56, y: 931, w: 1272, h: 18 },
    screen: { x: 116, y: 151, w: 1152, h: 720, r: 8 }, chin: { y: 931 - 31 }, cam: { x: 692, y: 141 },
    copy: { x: 1376, w: 448 }, tick: { x: 1284 },
  },
  phone: {
    body: { x: 300, y: 48, w: 440, h: 920, r: 64 }, deck: null,
    screen: { x: 320, y: 88, w: 400, h: 840, r: 44 }, chin: { y: 1004, outside: true }, cam: { x: 520, y: 68 },
    copy: { x: 828, w: 996 }, tick: { x: 736 },
  },
};
export const deviceOf = (content) => DEVICES[content?.device === 'phone' ? 'phone' : 'laptop'];
// the device's bounding box (what a device-flip turns), with room for the source line
export const deviceBox = (D) => {
  const x0 = Math.min(D.body.x, D.deck?.x ?? D.body.x), x1 = Math.max(D.body.x + D.body.w, D.deck ? D.deck.x + D.deck.w : 0);
  const y1 = Math.max(D.body.y + D.body.h, D.deck ? D.deck.y + D.deck.h : 0, D.chin.outside ? D.chin.y + 16 : 0);
  return { x: x0, y: D.body.y, w: x1 - x0, h: y1 - D.body.y };
};

// ---------------------------------------------------------------- views
// A view shows the source rect [x, y, scr.w / k, scr.h / k] of an asset on the screen, k output px per source px.
// 'rest' (or zoom 'rest'): the asset's public region covering the screen (the larger of the width and height fits),
// anchored top-left; { region, zoom }: centred on the region at that zoom; { x, y, zoom }: a top-left source point.
// Always kept inside the public region (the private parts of a capture are never on screen) and under the cap.
export const publicOf = (A) => A.public ?? [0, 0, A.size[0], A.size[1]];
export const coverK = (A, D) => { const P = publicOf(A); return Math.max(D.screen.w / P[2], D.screen.h / P[3]); };
export const viewOf = (A, spec, D) => {
  const P = publicOf(A), S = D.screen, cover = coverK(A, D);
  const sp = spec == null || spec === 'rest' ? { zoom: 'rest' } : spec;
  let k = sp.zoom == null || sp.zoom === 'rest' ? cover : Number(sp.zoom);
  k = Math.max(cover, Math.min(CAP, k));
  const vw = S.w / k, vh = S.h / k;
  let cx, cy;
  if (sp.region) { const b = A.regions[sp.region].box; cx = b[0] + b[2] / 2; cy = b[1] + b[3] / 2; }
  else if (sp.x != null) { cx = sp.x + vw / 2; cy = (sp.y ?? P[1]) + vh / 2; }
  else { cx = P[0] + vw / 2; cy = P[1] + vh / 2; }
  if (sp.anchor === 'top' && sp.region) cy = A.regions[sp.region].box[1] - 24 / k + vh / 2;
  const x = Math.min(Math.max(cx - vw / 2, P[0]), P[0] + P[2] - vw), y = Math.min(Math.max(cy - vh / 2, P[1]), P[1] + P[3] - vh);
  return { x, y, k, w: vw, h: vh };
};
// source → screen-local px
export const toScreen = (v, x, y) => [(x - v.x) * v.k, (y - v.y) * v.k];

// ---------------------------------------------------------------- the copy group
// One state of the margin from landing L: value, note, line, then the ring. Returns the times and the reads.
const group = (L, B, s, { ring = true, ringAt = null, claim = false } = {}) => {
  const out = { copy: [], reads: [], micro: [] };
  const t1 = s.value ? L + B : L;                 // the note and the line enter together, one beat after the value
  if (s.value) {
    out.copy.push({ role: 'display', text: s.value, slot: 0, in: L });
    out.reads.push({ text: s.value, at: L + READABLE, ...(claim ? { claim: true } : {}) });
    out.micro.push([L, `"${s.value}" enters`, SETTLE]);
  }
  if (s.note) {
    out.copy.push({ role: 'note', text: s.note, slot: 214, in: t1 });
    out.reads.push({ text: s.note, tier: 'glance', at: t1 + READABLE });
  }
  if (s.line) {
    out.copy.push({ role: 'line', text: s.line, slot: 128, in: t1 });
    out.reads.push({ text: s.line, at: t1 + READABLE });
  }
  if (s.note || s.line) out.micro.push([t1, `"${s.line ?? s.note}" enters`, SETTLE]);
  out.ring = ring ? (ringAt ?? t1 + B) : null;
  if (out.ring != null && out.ring > L) out.micro.push([out.ring, 'the ring closes on the evidence', RING_DRAW]);
  out.last = Math.max(t1, out.ring ?? 0);
  return out;
};

// ---------------------------------------------------------------- per type
// Each returns { move, light, copy, reads, micro, keys, expressive, peaks, choreo } with times from the scene start.
// move: { kind: 'set' | 'push' | 'feed' | 'flip' | 'scroll' | 'cut', t, dur, view, variant }; light: [{ t, region, ring, hop, off, all }].
// `ctx`: { B, prevAsset, prevRegion, flips (flips before this scene), assets, D, startBeats (claim only), dur }.
// Move lengths and T2 device names come from the adapters content.moves picks (moves.js); ctx.M holds them.
export const movesOf = (content) => ({ push: moveOf(content, 'push'), hop: moveOf(content, 'hop'), scroll: moveOf(content, 'scroll'), feed: moveOf(content, 'feed'), flip: moveOf(content, 'flip') });
export const MAX_FLIPS = 1;            // the device turns once a film at most (owner, 2026-10-21); the screen's content moves instead
const regionOf = (ctx, s, name) => (name ? ctx.assets[s.asset]?.regions?.[name] : null);

export const TYPES = {
  // The lid draws out from the camera dot; on beat 1 the screen lights on the first capture (the hook).
  // With content.edges 'cut' (a cut-down inside a reel) the first frame is already the lit device: the name lands on
  // beat 1 instead (the hook), one beat sooner. The source line appears on the chin once the copy is in.
  wake(s, ctx) {
    const { B } = ctx, cut = ctx.edges === 'cut', L = cut ? B : 2 * B;
    const g = group(L, B, { value: s.name, note: s.note, line: s.line }, { ring: !!s.region });
    const chinAt = g.last + B;
    return {
      move: { kind: 'set', t: 0, view: s.view ?? 'rest' },
      light: s.region ? [{ t: L, region: s.region }, { t: g.ring, region: s.region, ring: true }] : [],
      copy: g.copy, reads: g.reads,
      micro: [...(cut ? [] : [[0, 'the lid draws', 0.45], [B, 'the screen lights', 0.3]]), ...g.micro, [chinAt, 'the source line appears', 0.3]],
      keys: [{ t: B, kind: 'accent', what: cut ? 'the name lands' : 'the screen lights' }],
      peaks: [{ t: B, kind: 'hook' }],
      chin: chinAt,                                     // when the source line appears (film.js)
      choreo: chinAt + 0.3 + 0.2,
    };
  },
  // viewport-push (or a pan at equal zoom) to a region of the same capture; the light moves with it.
  push(s, ctx) {
    const { B, M } = ctx, L = M.push.beats * B;
    const g = group(L, B, s, { ring: s.ring !== false });
    return {
      move: { kind: 'push', t: 0, dur: L, view: { region: s.region, zoom: s.zoom ?? 'rest' } },
      light: [{ t: 0, off: true }, { t: 0.4 * B, region: s.region }, ...(g.ring != null ? [{ t: g.ring, region: s.region, ring: true }] : [])],
      copy: g.copy, reads: g.reads,
      micro: [[0, `push to ${s.region}`, L], [0.4 * B, `light on ${s.region}`, 0.2], ...g.micro],
      keys: [{ t: L, kind: 'land', what: `the push lands on ${s.region}` }],
      choreo: g.last + RING_DRAW + 0.2,
    };
  },
  // A hard cut on the beat to another capture of the same screen, registered so the region keeps its place.
  cut(s, ctx) {
    const { B } = ctx;
    const g = group(0, B, s, { ring: true });
    return {
      move: { kind: 'cut', t: 0, view: { register: s.region } },
      light: [{ t: 0, region: s.region, cut: true }, { t: g.ring, region: s.region, ring: true }],
      copy: g.copy, reads: g.reads,
      micro: [[0, `cut to ${s.asset}`, 0.05], ...g.micro],
      keys: [{ t: 0, kind: 'accent', what: `cut to ${s.asset}` }],
      choreo: g.last + RING_DRAW + 0.2,
    };
  },
  // device-flip (T2): the device turns edge-on, the screen and the source line change there, it turns back.
  flip(s, ctx) {
    const { B, M } = ctx, L = M.flip.beats * B;
    const g = group(L, B, s, { ring: !!s.region });
    const variant = ctx.flips % 2 ? 'left' : 'right';
    return {
      move: { kind: 'flip', t: 0, dur: L, view: s.view ?? { region: s.region, zoom: s.zoom ?? 'rest' }, variant },
      light: [{ t: 0, off: true }, ...(s.region ? [{ t: L, region: s.region }, { t: g.ring, region: s.region, ring: true }] : [])],
      copy: g.copy, reads: g.reads,
      micro: [[0, `flip to ${s.asset}`, L], ...g.micro],
      keys: [{ t: L, kind: 'land', what: `the flip lands on ${s.asset}` }],
      expressive: [{ t: 0, beats: M.flip.beats, device: M.flip.device, variant }],
      choreo: g.last + (g.ring != null ? RING_DRAW : SETTLE) + 0.2,
    };
  },
  // feed (T2): the next capture rises from below the screen over the current one, which steps back; the source line
  // changes as it lands. A change of surface that keeps the device still (the flip's quieter twin).
  feed(s, ctx) {
    const { B, M } = ctx, L = M.feed.beats * B;
    const g = group(L, B, s, { ring: !!s.region });
    return {
      move: { kind: 'feed', t: 0, dur: L, view: s.view ?? { region: s.region, zoom: s.zoom ?? 'rest', anchor: 'top' } },
      light: [{ t: 0, off: true }, ...(s.region ? [{ t: L, region: s.region }, { t: g.ring, region: s.region, ring: true }] : [])],
      copy: g.copy, reads: g.reads,
      micro: [[0, `the next capture rises: ${s.asset}`, L], ...g.micro],
      keys: [{ t: L, kind: 'land', what: `${s.asset} lands` }],
      expressive: [{ t: 0, beats: M.feed.beats, device: M.feed.device }],
      choreo: g.last + (g.ring != null ? RING_DRAW : SETTLE) + 0.2,
    };
  },
  // scroll (T2): the page travels under the glass to another stop of the same capture, at the page's width.
  scroll(s, ctx) {
    const { B, M } = ctx, L = M.scroll.beats * B;
    const g = group(L, B, s, { ring: !!s.region });
    const from = ctx.prevView, to = viewOf(ctx.assets[s.asset], s.view ?? { region: s.region, zoom: s.zoom ?? 'rest', anchor: 'top' }, ctx.D);
    const variant = from && to.y < from.y ? 'up' : 'down';
    return {
      move: { kind: 'scroll', t: 0, dur: L, view: s.view ?? { region: s.region, zoom: s.zoom ?? 'rest', anchor: 'top' }, variant },
      light: [{ t: 0, off: true }, ...(s.region ? [{ t: L, region: s.region }, { t: g.ring, region: s.region, ring: true }] : [])],
      copy: g.copy, reads: g.reads,
      micro: [[0, `scroll ${variant}`, L], ...g.micro],
      keys: [{ t: L, kind: 'land', what: `the scroll lands on ${s.region ?? 'its stop'}` }],
      expressive: [{ t: 0, beats: M.scroll.beats, device: M.scroll.device, variant }],
      choreo: g.last + (g.ring != null ? RING_DRAW : SETTLE) + 0.2,
    };
  },
  // spotlight-band: the light hops row to row on the still capture; each row brings its own copy (2–4 rows).
  band(s, ctx) {
    const { B, M } = ctx;
    const out = { move: null, light: [], copy: [], reads: [], micro: [], keys: [], shots: [] };
    let t = 0, prev = ctx.prevRegion && ctx.prevAsset === s.asset ? ctx.prevRegion : null;
    s.rows.forEach((row, k) => {
      const hop = !!prev;
      const L = t + B;
      out.light.push({ t, region: row.region });
      out.micro.push([t, hop ? `band hops to ${row.region}` : `light on ${row.region}`, hop ? M.hop.beats * B : 0.2]);
      if (k > 0) out.shots.push({ t, what: `row ${row.region}` });
      if (hop) out.keys.push({ t: L, kind: 'accent', what: `the band lands on ${row.region}` });
      const g = group(L, B, row, { ring: true });
      out.light.push({ t: g.ring, region: row.region, ring: true });
      for (const c of g.copy) out.copy.push({ ...c, row: k });
      out.reads.push(...g.reads); out.micro.push(...g.micro);
      t = g.ring + B; prev = row.region;
      out.last = g.ring;
    });
    if (!out.keys.length) out.keys.push({ t: B, kind: 'accent', what: `"${s.rows[0].value}" lands on ${s.rows[0].region}` });
    out.choreo = out.last + RING_DRAW + 0.2;
    // each row's copy leaves when the next row's hop starts
    out.copy.forEach((c) => { const nx = out.light.find((l) => !l.ring && l.t > c.in); if (nx) c.out = nx.t - TEXT_OUT; });
    return out;
  },
  // The claim (T3, climax): the region is lit and the lead line read; the push lands on the next bar line, the value
  // arrives with it and the line is read in a pause.
  claim(s, ctx) {
    const { B, M } = ctx;
    const sb = ctx.startBeats ?? 0;
    let P = 4; while ((sb + P) % 4 !== 0) P++;                  // beats to the bar line the push lands on (4–7)
    const hop = ctx.prevRegion && ctx.prevAsset === s.asset && ctx.prevRegion !== s.region;
    const pre = [[0, hop ? `the band hops to ${s.region}` : `light on ${s.region}`, hop ? M.hop.beats * B : 0.2]];
    const copy = [], reads = [];
    if (s.lead) { copy.push({ role: 'line', text: s.lead, slot: 128, in: B, out: (P - 1) * B - TEXT_OUT }); reads.push({ text: s.lead, at: B + READABLE }); pre.push([B, `"${s.lead}" enters`, SETTLE]); }
    // the note enters two beats after the lead when the preroll leaves room (P ≥ 6), else with it
    const noteAt = P >= 6 ? 3 * B : B;
    if (s.note) { copy.push({ role: 'note', text: s.note, slot: 214, in: noteAt, out: (P - 1) * B - TEXT_OUT }); reads.push({ text: s.note, tier: 'glance', at: noteAt + READABLE }); if (noteAt !== B || !s.lead) pre.push([noteAt, `note "${s.note}" enters`, SETTLE]); }
    if (P >= 6) pre.push([5 * B, 'the ring closes on the region', RING_DRAW]);
    const L = P * B;
    const post = [[L, `"${s.value}" lands (claim)`, SETTLE]];
    copy.push({ role: 'display', text: s.value, slot: 0, in: L, claim: true });
    reads.push({ text: s.value, at: L + READABLE, claim: true });
    if (s.line) { copy.push({ role: 'line', text: s.line, slot: 128, in: L + B }); reads.push({ text: s.line, at: L + B + READABLE }); post.push([L + B, `"${s.line}" enters`, SETTLE]); }
    const lastIn = s.line ? L + B : L;
    return {
      move: { kind: 'push', t: L - M.push.beats * B, dur: M.push.beats * B, view: { region: s.region, zoom: s.zoom ?? 'rest' } },
      light: [{ t: 0, region: s.region }, { t: P >= 6 ? 5 * B : L, region: s.region, ring: true }],
      copy, reads,
      micro: [...pre, [L - M.push.beats * B, `push to ${s.region}`, M.push.beats * B], ...post],
      keys: [{ t: L, kind: 'claim', what: 'the push lands on the claim (bar line)' }],
      peaks: [{ t: L, kind: 'claim', climax: true }],
      pauseFrom: lastIn + SETTLE, preroll: P,
      choreo: lastIn + SETTLE + 0.2,
    };
  },
  // The lock-up (T3, rest): back to the product's surface at rest, veiled; the margin gives the mark, the name, the line
  // and the URL; on the last bar's downbeat the region is lit and ringed once more (the second move).
  lockup(s, ctx) {
    const { B, M } = ctx;
    const change = ctx.prevAsset !== s.asset;
    // a change of capture: a flip if the film has not turned the device yet (or s.change says so), else a feed
    const via = change ? (s.change ?? (ctx.flips < MAX_FLIPS ? 'flip' : 'feed')) : 'push';
    const L = M[via].beats * B;
    const variant = ctx.flips % 2 ? 'left' : 'right';
    const copy = [], reads = [], micro = [[0, via === 'push' ? 'pull back to rest' : `${via} back`, L]];
    if (s.mark) { copy.push({ role: 'mark', asset: s.mark, slot: -150, in: L }); }
    copy.push({ role: 'display', text: s.name, slot: 0, in: L }); reads.push({ text: s.name, at: L + READABLE }); micro.push([L, 'the name enters', SETTLE]);
    if (s.line) { copy.push({ role: 'line', text: s.line, slot: 128, in: L + B }); reads.push({ text: s.line, at: L + B + READABLE }); micro.push([L + B, 'the line enters', SETTLE]); }
    const urlAt = L + 2 * B;
    if (s.url) { copy.push({ role: 'url', text: s.url, slot: 214, in: urlAt }); reads.push({ text: s.url, at: urlAt + READABLE }); micro.push([urlAt, 'the URL enters', SETTLE]); }
    // the second move: the last bar's downbeat, once the scene's length is known (ctx.dur), else after the URL's 3 s
    const end = ctx.dur ?? urlAt + 3.2 + ctx.bar;
    const second = Math.max(urlAt + 1.5, end - ctx.bar);
    return {
      move: { kind: via, t: 0, dur: L, view: s.view ?? 'rest', ...(via === 'flip' ? { variant } : {}) },
      light: [{ t: 0, off: true }, { t: L, all: true }, ...(s.region ? [{ t: second, region: s.region }, { t: second, region: s.region, ring: true }] : [])],
      copy, reads, micro: [...micro, [second, 'second move', RING_DRAW]],
      keys: [{ t: L, kind: 'land', what: 'the lock-up lands' }, { t: second, kind: 'end', what: 'second move on the last downbeat' }],
      expressive: via === 'push' ? [] : [{ t: 0, beats: M[via].beats, device: M[via].device, ...(via === 'flip' ? { variant } : {}) }],
      peaks: [{ t: L, kind: 'lockup' }],
      choreo: urlAt + 3.2,
      second,
    };
  },
};

// ---------------------------------------------------------------- the whole film
// plan(content, scenes, B, bar) → per scene { ...TYPES[type] result, start, end, asset, view }, the absolute camera,
// light and copy lists film.js draws from. `scenes` are fitted (start, end) or not yet (start undefined: need only).
export const plan = (content, scenes, B, bar, reading = null) => {
  const D = deviceOf(content), assets = content.assets, M = movesOf(content);
  let prevAsset = null, prevRegion = null, prevView = null, flips = 0, beats = 0;
  return scenes.map((s, i) => {
    const dur = s.end != null ? s.end - s.start : undefined;
    const startBeats = s.start != null ? Math.round(s.start / B) : beats;
    const T = TYPES[s.type](s, { B, bar, D, M, edges: content.edges, assets, prevAsset, prevRegion, prevView, flips, startBeats, dur });
    const A = assets[s.asset];
    let view;
    if (T.move?.kind === 'cut') {
      // registered: the new capture's region sits where the old one's did
      const r0 = assets[prevAsset].regions[s.region].box, r1 = A.regions[s.region].box;
      view = { ...prevView, x: prevView.x + (r1[0] - r0[0]), y: prevView.y + (r1[1] - r0[1]) };
    } else view = T.move ? viewOf(A, T.move.view, D) : prevView;
    if (T.move?.kind === 'flip') flips++;
    const lastLit = [...(T.light ?? [])].reverse().find((l) => l.region);
    // a line that leaves inside the scene (a band row's, the claim's lead) is a change: its exit ends the hold before it
    const exits = (T.copy ?? []).filter((c) => c.out != null).map((c) => c.out);
    for (const t of [...new Set(exits)]) T.micro.push([t, 'the copy leaves', TEXT_OUT]);
    const out = { ...T, i, type: s.type, asset: s.asset, view, scene: s, startBeats };
    prevAsset = s.asset; prevRegion = lastLit ? lastLit.region : (T.light?.some((l) => l.off || l.all) ? null : prevRegion); prevView = view;
    beats += Math.max(1, Math.ceil((needOf(out, reading) - 1e-9) / B));
    return out;
  });
};

// A scene's need: its choreography or its reading (ctx.reading in timing.rules.js gives the same reader), whichever is longer.
export const needOf = (T, reading) => {
  const r = reading ? reading(T.reads).end + 0.1 : 0;
  return Math.max(T.choreo, r);
};

// ---------------------------------------------------------------- copy limits (TEMPLATE.md, Slots)
// character caps (film.js measures every line against the margin's width as well, and banners what does not fit)
export const LIMITS = { value: 12, name: 14, line: 24, lead: 24, note: 34, url: 48 };
const words = (x) => String(x).trim().split(/\s+/).filter(Boolean).length;
export const validate = (content) => {
  const e = [];
  const A = content.assets ?? {};
  if (!content.scenes?.length) return ['content.scenes is empty'];
  if (!['laptop', 'phone', undefined].includes(content.device)) e.push(`device '${content.device}': laptop or phone`);
  try { movesOf(content); } catch (err) { e.push(err.message); }
  if (![undefined, 'full', 'cut'].includes(content.edges)) e.push(`edges '${content.edges}': 'full' (default) or 'cut'`);
  for (const [id, a] of Object.entries(A)) {
    if (!a.file || !Array.isArray(a.size)) { e.push(`assets.${id}: file and size [w, h] are required`); continue; }
    if (typeof a.people !== 'string') e.push(`assets.${id}: people — say what was checked (e.g. 'none: no faces, avatars or account names')`);
    if (!a.source) e.push(`assets.${id}: source (page or origin of the capture) is required`);
    const P = publicOf(a);
    if (P[0] < 0 || P[1] < 0 || P[0] + P[2] > a.size[0] || P[1] + P[3] > a.size[1]) e.push(`assets.${id}: public region outside the image`);
    for (const [rn, r] of Object.entries(a.regions ?? {})) {
      const b = r.box;
      if (!Array.isArray(b) || b.length !== 4) { e.push(`assets.${id}.regions.${rn}: box [x, y, w, h]`); continue; }
      if (b[0] < P[0] || b[1] < P[1] || b[0] + b[2] > P[0] + P[2] || b[1] + b[3] > P[1] + P[3]) e.push(`assets.${id}.regions.${rn}: box outside the public region`);
      if (r.band && (r.band[0] < P[1] || r.band[0] + r.band[1] > P[1] + P[3])) e.push(`assets.${id}.regions.${rn}: band outside the public region`);
    }
  }
  const S = content.scenes;
  if (S[0].type !== 'wake') e.push('scene 1 must be wake');
  if (S[S.length - 1].type !== 'lockup') e.push('the last scene must be lockup');
  let cur = null, flipsSeen = 0;
  S.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!TYPES[s.type]) { e.push(`${at}: unknown type; one of ${Object.keys(TYPES).join(', ')}`); return; }
    if (!A[s.asset]) { e.push(`${at}: asset '${s.asset}' is not in content.assets`); return; }
    const regs = A[s.asset].regions ?? {};
    const need = (r) => { if (!r || !regs[r]) e.push(`${at}: region '${r}' is not in assets.${s.asset}.regions`); };
    if (['push', 'cut', 'claim'].includes(s.type)) need(s.region);
    if (['flip', 'feed', 'scroll'].includes(s.type)) need(s.region);   // after a change the screen points at something
    if (['push', 'band', 'claim', 'scroll'].includes(s.type) && cur && s.asset !== cur) e.push(`${at}: the screen shows '${cur}'; change capture with feed or flip (another surface) or cut (the same screen later)`);
    if (['flip', 'feed'].includes(s.type) && s.asset === cur) e.push(`${at}: ${s.type} changes the capture; '${s.asset}' is already on screen (use push or scroll)`);
    if (s.type === 'flip' || (s.type === 'lockup' && s.change === 'flip')) flipsSeen++;
    if (s.type === 'lockup' && s.change != null && !['flip', 'feed'].includes(s.change)) e.push(`${at}: change '${s.change}': 'feed' or 'flip'`);
    if (s.type === 'scroll' && s.zoom != null && s.zoom !== 'rest') e.push(`${at}: a scroll travels at the page's width: zoom 'rest' (push in after it lands)`);
    if (s.type === 'cut') {
      if (s.asset === cur) e.push(`${at}: cut needs another capture of the same screen`);
      else if (cur && !(A[cur].regions ?? {})[s.region]) e.push(`${at}: region '${s.region}' must exist on both captures (the cut is registered on it)`);
    }
    if (s.type === 'band') {
      if (!Array.isArray(s.rows) || s.rows.length < 2 || s.rows.length > 4) e.push(`${at}: rows: 2–4 { region, value, note, line }`);
      else s.rows.forEach((r, k) => { need(r.region); if (regs[r.region] && !regs[r.region].band) e.push(`${at}: row ${k + 1}: region '${r.region}' needs a band [y, h]`); });
    }
    if (s.zoom != null && s.zoom !== 'rest' && !(Number(s.zoom) > 0 && Number(s.zoom) <= CAP + 1e-9)) e.push(`${at}: zoom ${s.zoom} — output px per source px, at most ${CAP.toFixed(3)} (the zoom cap)`);
    const texts = [['value', s.value], ['name', s.name], ['line', s.line], ['lead', s.lead], ['note', s.note], ['url', s.url], ...(s.rows ?? []).flatMap((r) => [['value', r.value], ['line', r.line], ['note', r.note]])];
    for (const [k, v] of texts) {
      if (v == null) continue;
      if (typeof v !== 'string') { e.push(`${at}: ${k} must be a string`); continue; }
      if (v.length > LIMITS[k]) e.push(`${at}: ${k} "${v}" is ${v.length} characters; at most ${LIMITS[k]}`);
      if ((k === 'line' || k === 'lead') && words(v) > 4) e.push(`${at}: ${k} "${v}" has ${words(v)} words; at most 4 (it is read while the ring closes, in one still of at most two beats)`);
      if (k === 'note' && words(v) > 6) e.push(`${at}: note "${v}" has ${words(v)} words; a glance note is at most 6`);
    }
    if (s.type === 'claim' && !s.value) e.push(`${at}: value (the claim) is required`);
    if (s.type === 'lockup' && !s.name) e.push(`${at}: name is required`);
    if (s.mark && !A[s.mark]) e.push(`${at}: mark '${s.mark}' is not in content.assets`);
    cur = s.asset;
  });
  if (S.filter((s) => s.type === 'claim').length > 1) e.push('one claim a film (the climax)');
  if (flipsSeen > MAX_FLIPS) e.push(`${flipsSeen} device flips; at most ${MAX_FLIPS} a film: change capture with feed (the screen's content moves, the device stays)`);
  if (e.length) return e;
  // a scroll starts and lands at the page's width (scroll-reel's rest fit): the screen must not be pushed in before it,
  // and the page must be taller than the screen
  const D = deviceOf(content);
  try {
    const planned = plan(content, S.map((x) => ({ ...x })), 0.5, 2);
    planned.forEach((T, i) => {
      if (T.type !== 'scroll') return;
      const A = content.assets[T.asset], k = coverK(A, D), P = publicOf(A), prev = i > 0 ? planned[i - 1].view : null;
      // 2 % tolerance: a page within 2 % of the screen's aspect scrolls (almost) nowhere but does not pop
      if ((k - D.screen.w / P[2]) / k > 0.02) e.push(`scene ${i + 1} (scroll): '${T.asset}' is not taller than the screen at its width; a scroll needs a long page`);
      else if (prev && Math.abs(prev.k - k) / k > 0.02) e.push(`scene ${i + 1} (scroll): the screen is at ${prev.k.toFixed(2)} px per source px before it; a scroll starts at the page's width (${k.toFixed(2)}): pull back to zoom 'rest' first`);
    });
  } catch (err) { e.push(`plan: ${err.message}`); }
  return e;
};

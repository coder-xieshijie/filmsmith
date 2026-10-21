// choreo.js — the choreography of every Scroll scene type: when the sheet moves, when each mark draws, when each
// phrase enters and is read, in seconds from the scene's start. One pure function per type, shared by
// timing.rules.js (need, events), film.js (the picture) and score.mjs (the sound), so picture, sound and the timing
// table cannot drift. B is the fitted beat in seconds. Quotes enter phrase by phrase (≤ 3 words at a time), each
// phrase only once the one before it has been read, so no reading hold runs long.
import { reader } from './lib/timing.js';
import { moveOf } from './moves.js';

export const C = {
  wordSec: 0.3,          // reading pace (principle 1)
  phraseIn: 0.5,         // beats: a phrase rises into its line
  exit: 0.35,            // beats: lines leaving a band rise out (ease in)
  markDraw: 0.5,         // beats: an underline draws left to right
  markOff: 0.25,         // beats: it retracts
  settle: 0.3,           // s: a landing holds at least this long
  mini: 1,               // beats: the minimap prints (variant 'on')
  dockMove: 0.5,         // beats: a ratchet step (expo out), landing on the beat
  playAt: 0.5,           // beats into the unfold: the frames start playing
  captionAt: 2,          // beats after the panel is open: the claim enters
  urlCps: 25,            // the address types at 25 characters a second
  urlHold: 3,            // s: the address holds at least this long (principle 1)
  rollup: 1.5,           // beats: the roll comes up, landing on the last bar's downbeat
  creep: 10,             // px a second: the page creeps up while a quote is read, and in an unfold once its frames have
                         // run out (the last frame stays): never a still page under the reader
};

export const words = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);
const q = (x, B) => Math.ceil(x / (B / 4) - 1e-9) * (B / 4);   // up to the quarter beat

// phrase-by-phrase entry of a band's lines: [{ t, text, line, k }]; each phrase waits until the one before is read
export const phrases = (lines, t0, B) => {
  const out = [];
  let t = t0;
  (lines || []).forEach((line, li) => line.forEach((text, k) => {
    out.push({ t, text, line: li, k });
    t += Math.max(B, q(words(text).length * C.wordSec + 0.05, B));
  }));
  return out;
};

// plan(s, ctx, B, dur): { need, items, keys, micro, shots, expressive, peaks, holds, handoffs, moves, marks, ... }
// `ctx` carries { i, scenes, content, reading }; `dur` is the fitted length (undefined at the need).
export const plan = (s, ctx, B, dur, content = ctx?.content ?? {}) => {
  const read = (items) => (ctx?.reading ? ctx.reading(items) : reader(items, { wordSec: C.wordSec }));
  const i = ctx?.i ?? 0, scenes = ctx?.scenes ?? content.scenes ?? [];
  const mv = content.moves ?? {};
  const P = { keys: [], micro: [], shots: [], expressive: [], peaks: [], holds: [], handoffs: [], moves: [], phrases: [], items: [] };
  const micro = (t, what) => P.micro.push({ t, what });
  const quote = (lines, t0) => {
    P.phrases = phrases(lines, t0, B);
    P.items = P.phrases.map((p) => ({ text: p.text, at: p.t }));
    for (const p of P.phrases) micro(p.t, `"${p.text}"`);
    const r = read(P.items);
    const last = P.phrases.at(-1);
    P.landed = last ? last.t + C.phraseIn * B : t0;
    P.read = Math.max(r.done ?? 0, P.landed);
    return r;
  };

  if (s.type === 'open') {
    const roll = moveOf('roll', mv.roll);
    const unroll = s.unroll !== false;
    const first = unroll ? roll.beats * B : 0;
    if (unroll) {
      P.moves.push({ kind: 'unroll', from: 0, to: first, device: roll.device });
      P.handoffs.push({ t: 0 });
      P.expressive.push({ t: 0, dur: first, device: roll.device, variant: 'unroll from the top edge' });
      micro(B, 'the roll passes the middle of the frame');
      P.shots.push({ t: first, what: 'the hanging sheet' });
    }
    P.markAt = first;
    micro(first, 'the underline draws under the quoted line');
    P.keys.push({ t: first, kind: 'accent', what: 'the underline' });
    quote(s.lines, first + B);
    P.keys.push({ t: first + B, kind: 'accent', what: 'the hook\'s first phrase' });
    if (i === 0) P.peaks.push({ t: first + B, kind: 'hook' });
    let last = P.landed;
    if (content.minimap !== 'off') {
      P.miniAt = P.phrases.at(-1).t + 0.75 * B;
      micro(P.miniAt, 'the minimap prints');
      last = Math.max(last, P.miniAt + C.mini * B);
    }
    P.need = Math.max(P.read + C.settle, last + C.settle);
    // from the last change to the scene's end the page creeps while the hook is read (film.js)
    if ((dur ?? P.need) - last > 1e-6) { P.creep = [last, dur ?? P.need]; micro(last, 'the page creeps while the hook is read'); }
  }

  if (s.type === 'quote') {
    const m = s.move && s.move !== 'none' ? moveOf(s.move, mv[s.move]) : null;
    const o = m ? m.beats * B : 0;
    if (m) {
      P.moves.push({ kind: s.move, from: 0, to: o, device: m.device, role: s.move });
      P.handoffs.push({ t: 0 });
      micro(0, `the sheet: ${s.move}`);
      if (m.tier === 'T2') {
        P.expressive.push({ t: 0, dur: o, device: m.device, variant: `down to ${s.at?.asset ?? 'the next section'}` });
        P.keys.push({ t: 0, kind: 'accent', what: 'the reel starts' });
      } else P.keys.push({ t: o, kind: 'land', what: 'the detent lands' });
      // a detent lands a new composition; a reel's landing is the scene's own (it starts the composition)
      if (m.tier !== 'T2') P.shots.push({ t: o, what: `${s.at?.asset ?? 'the page'} at the reading line` });
    } else {
      P.keys.push({ t: 0, kind: 'accent', what: 'the underline moves on' });
      micro(0, 'the band\'s lines roll out; the underline moves');
    }
    P.markAt = m ? o : 0.25 * B;
    if (m) micro(P.markAt, 'the underline draws');
    const t0 = m ? o + 0.5 * B : 0.5 * B;
    quote(s.lines, t0);
    if (!m) P.shots.push({ t: P.phrases.at(-1)?.t ?? t0, what: 'the quote complete' });
    P.need = P.read + C.settle;
    // no hold: from the last landing to the scene's end the page creeps (film.js), so the reading time is never a still
    P.creep = [P.landed, dur ?? P.need];
    micro(P.landed, 'the page creeps while the quote is read');
  }

  if (s.type === 'ratchet') {
    const m = moveOf('reel', mv.reel);
    const o = m.beats * B;
    P.moves.push({ kind: 'reel', from: 0, to: o, device: m.device, role: 'reel' });
    P.handoffs.push({ t: 0 });
    P.expressive.push({ t: 0, dur: o, device: m.device, variant: `locks chapter ${(s.head ?? 0) + 1}` });
    P.keys.push({ t: 0, kind: 'accent', what: 'the reel starts' });
    micro(o, 'the heading locks as the chapter');
    P.shots.push({ t: o, what: 'the chapter locked' });
    P.docks = (s.rows || []).map((r, k) => ({ t: o + (k + 1) * B, name: r.name, k }));
    for (const d of P.docks) micro(d.t, `docks: ${d.name}`);
    if (P.docks.length) P.keys.push({ t: P.docks[0].t, kind: 'land', what: 'the first row docks' });
    // half-way down the rows the page under the tab is a new composition (it has moved on by half a table)
    const mid = P.docks[Math.floor(P.docks.length / 2)];
    if (P.docks.length >= 6 && mid) P.shots.push({ t: mid.t, what: `half-way: ${mid.name}` });
    // the names are read word by word, one a beat, as they dock
    P.items = P.docks.map((d) => ({ text: d.name, at: d.t, tier: 'word' }));
    read(P.items);
    P.need = (P.docks.at(-1)?.t ?? o) + 0.75 * B;
  }

  if (s.type === 'unfold') {
    const reach = moveOf('detent', mv.detent), uf = moveOf('unfold', mv.unfold);
    const r0 = reach.beats * B, u1 = r0 + uf.beats * B;
    P.moves.push({ kind: 'reach', from: 0, to: r0, device: reach.device, role: 'detent' });
    P.moves.push({ kind: 'unfold', from: r0, to: u1, device: uf.device });
    P.handoffs.push({ t: 0 }, { t: r0 });
    P.keys.push({ t: 0, kind: 'accent', what: 'the sheet goes to the row' });
    P.expressive.push({ t: r0, dur: u1 - r0, device: uf.device, variant: `a row opens on ${s.frames}` });
    micro(r0, 'the row starts to open');
    P.playAt = r0 + C.playAt * B;
    P.keys.push({ t: u1, kind: 'land', what: 'the panel is open' });
    P.shots.push({ t: u1, what: 'what the row describes, inside the page' });
    P.captionAt = u1 + C.captionAt * B;
    P.items = [{ text: s.caption, at: P.captionAt, claim: true }];
    if (s.label) P.items.push({ text: s.label, tier: 'glance', at: P.playAt });
    const r = read(P.items);
    P.keys.push({ t: P.captionAt, kind: 'accent', what: 'the claim' });
    P.peaks.push({ t: P.captionAt, kind: 'reveal', climax: true });
    P.need = Math.max(r.done ?? 0, P.captionAt + words(s.caption).length * C.wordSec) + B;
    // the frames play: a change every beat while they run
    const fa = content.assets?.[s.frames], end = P.playAt + (fa ? fa.count / fa.fps : Infinity);
    for (let t = r0 + B; t < Math.min(end, (dur ?? P.need) - 0.25 * B); t += B) if (Math.abs(t - P.captionAt) > 0.1) micro(t, 'the frames play');
    // the frames run out before the scene ends: the last one stays and the page creeps (film.js)
    if (end < (dur ?? P.need) - 1e-6) { P.creep = [end, dur ?? P.need]; micro(end, 'the last frame stays; the page creeps'); }
    micro(P.captionAt, 'the claim');
  }

  if (s.type === 'lockup') {
    const f = moveOf('fling', mv.fling), roll = moveOf('roll', mv.roll);
    // straight after the opening (the shortest cut) the sheet is already at its top: no fling, the name replaces the hook
    const still = scenes[i - 1]?.type === 'open';
    const o = still ? 0 : f.beats * B;
    P.landAt = o;
    if (still) {
      P.keys.push({ t: 0, kind: 'accent', what: 'the hook gives way to the name' });
      P.peaks.push({ t: 0.5 * B, kind: 'lockup' });
    } else {
      P.moves.push({ kind: 'fling', from: 0, to: o, device: f.device, role: 'fling' });
      P.handoffs.push({ t: 0 });
      P.expressive.push({ t: 0, dur: o, device: f.device, variant: 'up to the top of the sheet' });
      P.keys.push({ t: 0, kind: 'accent', what: 'the fling starts' }, { t: o, kind: 'land', what: 'the top of the sheet' });
      P.peaks.push({ t: o, kind: 'lockup' });
      P.shots.push({ t: o, what: 'the top again' });
    }
    P.exitAt = o; P.nameAt = o + 0.5 * B; P.markAt = o + B; P.urlAt = o + 1.5 * B;
    P.urlEnd = P.urlAt + String(s.url || '').length / C.urlCps;
    if (still) P.shots.push({ t: P.urlAt, what: 'the name and its address' });
    micro(P.exitAt, 'the band\'s lines roll out'); micro(P.nameAt, 'the name'); micro(P.markAt, 'the underline under the title'); micro(P.urlAt, 'the address types');
    P.items = [{ text: s.name, at: P.nameAt }, { text: s.url, at: P.urlAt }];
    const r = read(P.items);
    P.need = Math.max(r.done ?? 0, P.urlEnd) + Math.max(6 * B, C.urlHold) + C.rollup * B * 0;
    const end = dur ?? P.need, land = end - 4 * B;
    P.rollup = [land - C.rollup * B, land];
    P.moves.push({ kind: 'rollup', from: P.rollup[0], to: land, device: roll.device });
    micro(P.rollup[0], 'the roll comes up');
    micro(land, 'the roll lands under the band');
    P.keys.push({ t: land, kind: 'land', what: 'the roll lands on the last downbeat' });
    P.shots.push({ t: land, what: 'the sheet rolled up under the address' });
  }
  return P;
};

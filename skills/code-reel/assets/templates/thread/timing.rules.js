// timing.rules.js — how long each link of the thread chain needs, and what changes in it (read by lib/timing.js
// fit() and events(); timing API 3: the four tiers of change, principles 4 and 5, owner-approved 2026-10-19).
//
// film.js writes every link in reference seconds u at 120 BPM; one u is two beats, so a link of D u is D / 2 bars.
// Reading is in real seconds (u / K, K = bpm / 120). A link needs the longest of three paths:
//
//   centre  the time until its text is readable, the centre text read through ctx.reading() (primary 0.3 s a word;
//           items with an `at` enter one after another, each a reading state of at most five words), and its exit.
//   corner  the stage label and its note, glance text: each holds fully still ≥ 1 s, in parallel with the centre,
//           never added to it. cornerIn is 1.7 beats on the first link (the label waits for the line), 0.9 where a
//           new stage starts, 0.7 where only the note changes; 0.25 beat as the note leaves. Why glance: the stage
//           name is a label (≤ 2 words) repeated in the centre (shots.js CENTRE_NAME) or by the link itself; the note
//           (≤ 6 words) restates what the link performs on screen (mode principle 3).
//   motion  the choreography that must play out before the hand-off (shots.js tables). It does not grow with the copy.
//
// Events: every time below comes from the tables in shots.js that film.js draws from and score.mjs scores from:
//   micro       T0: each landing, typed phrase, swing, hop, contact, tick run, rider landing, the line's own small moves
//               (the caret falling flat, the line tightening under the brief, the export bar on the card)
//   shots       T1: a new composition inside a link (the loop of the brief, the shot behind panel 3, the contact sheet,
//               the file card); every link start is one already
//   expressive  T2: the hand-offs of lib/handoffs that the line performs between states: path-type (the brief's two
//               phrases), rail-press 'press' (the merge's stage name pressed into the line that becomes the ruler),
//               rail-press 'cut' (the line cut into the name)
//   peaks       T3: the hook (the big word's first swing; without the head, the first centre name), the climax (the
//               contact sheet, on the music's drop; without the review, the name cut out of the line), the lock-up
//   holds       the still windows after each landing, ≤ 2 beats; the close is a rest
// The glance text elsewhere: the palette's hex labels and specimen names, the four track names (row labels). Incidental
// labels that show the step being done (panel numbers at 16 px, ω labels, the tile frames) are decoration.
import PALETTES from './palettes.js';
import { SPECIMEN, FORMULA, SPEC, FACTS_PROVISIONAL, fill, facts } from './fx.js';
import {
  OPEN_OUT, NAME_HOLD, NAME_OUT, nameAt, nameExit, namedLinks, closeSecondMove, MERGE_CUES, REVIEW_CUES as RC,
  SQUASH_EXIT, OPEN, openPlan, briefPhrases, PRESS, RIDE, CLOSE, CARD, pressedName,
} from './shots.js';

const WORD = 0.3; // s per English word (principle 1, standard)
const CORNER = { first: 1.7, span: 0.9, note: 0.7, out: 0.25 };
const text = (v) => fill(v, FACTS_PROVISIONAL); // copy with its placeholders at their widest
const glance = (t) => ({ text: t, tier: 'glance' });
const Kof = (g) => g.bpm / 120;
const sec = (u, g) => u / Kof(g); // u → seconds
// The stage name in effect just before scene i (a link without `stage` continues the previous one).
const stageBefore = (scenes, i) => {
  for (let j = i - 1; j >= 0; j--) if (scenes[j].stage) return scenes[j].stage.name;
  return null;
};
// u (link-local) at which the centre name has left, for a link that shows it; 0 otherwise.
const nameEnd = (s, ctx, D) => (namedLinks(ctx.scenes).has(ctx.i) && !pressedName(ctx.scenes, ctx.i) ? nameAt(s.type, D) + NAME_HOLD + NAME_OUT : 0);
const nameLanded = (s, ctx, D) => (namedLinks(ctx.scenes).has(ctx.i) ? nameAt(s.type, D) + 0.1 : 0);
// The curves link runs its own choreography PRESS.shift u later when it first presses the merge's name.
export const curvesShift = (scenes, i) => (i > 0 && scenes[i - 1].type === 'merge' && pressedName(scenes, i - 1) ? PRESS.shift : 0);

// The brief's phrases as the film shows them (placeholders at their widest while fitting, filled when laid out).
const phrasesOf = (s, vars) => briefPhrases(s.brief).map((p) => fill(p, vars));

const cornerNeed = (s, g, ctx) => {
  if (!s.stage) return 0;
  const B = g.beat;
  const fresh = stageBefore(ctx.scenes, ctx.i) !== s.stage.name;
  const cin = ctx.i === 0 ? CORNER.first : fresh ? CORNER.span : CORNER.note;
  const corner = ctx.reading([fresh ? glance(s.stage.name) : null, glance(text(s.stage.note))]);
  return (cin + CORNER.out) * B + corner.end;
};
// motion in u, plus the centre name's beat when the link shows it (it lands, holds a beat, leaves)
const motionNeed = (s, ctx, u, afterName = 0.05) => {
  const ne = nameEnd(s, ctx, 99);
  return Math.max(u, ne ? ne + afterName : 0, nameLanded(s, ctx, 99));
};

const types = {
  // line → caret → phrase 1 typed → the caret falls flat into the line under it → (path-type) phrase 2 → the line
  // tightens under it → contracts into the caret → the letters slide in (shots.js openPlan)
  open: {
    max: 3,
    read: (s) => briefPhrases(s.brief).map((p, k) => ({ text: text(p), at: k ? 1.5 : 0 })),
    need: (s, g, ctx) => {
      const ph = phrasesOf(s, FACTS_PROVISIONAL), P = openPlan(ph, Kof(g));
      const r = ctx.reading(ph.map((p, k) => ({ text: p, at: k ? sec(P.landed - OPEN.type, g) : 0 })));
      return Math.max(sec(P.need, g), sec(OPEN.type + OPEN.contract + OPEN_OUT, g) + r.end, cornerNeed(s, g, ctx));
    },
  },
  // letters spring in on a 1/32 stagger (readable ≈ 0.6u); weight swings land on beats 2–4 (settled ≈ 1.85u);
  // the first four glyphs leave D − 0.05u
  word: {
    read: (s) => [s.word],
    need: (s, g, ctx) => Math.max(sec(1.95, g), 1.3 * g.beat + ctx.reading([s.word]).end, cornerNeed(s, g, ctx)),
  },
  // first hex label typed by ≈ 0.62u, specimen lands ≈ 1.25u, hops end 1.675u, the name lands 2.0u; labels fade D − 0.15u
  palette: {
    read: () => [...['#000000', '#000000', '#000000', '#000000'].map(glance), ...SPECIMEN.map((x) => glance(x[3]))],
    need: (s, g, ctx) => {
      const r = ctx.reading([...['#000000', '#000000', '#000000', '#000000'].map(glance), ...SPECIMEN.map((x) => glance(x[3]))]);
      return Math.max(sec(motionNeed(s, ctx, 1.825, 0.15), g), 1.25 * g.beat + r.end + 0.3 * g.beat, cornerNeed(s, g, ctx));
    },
  },
  // panels grow out of the swatches, the glyphs or the line; sketches finish ≈ 1.71u, panel 3's outline lands ≈ 1.65u
  storyboard: { need: (s, g, ctx) => Math.max(sec(motionNeed(s, ctx, 1.9), g), cornerNeed(s, g, ctx)) },
  // push 0–1.0u, the spheres settle at 3.45u; without `curves` the squash into the line adds 0.45u
  merge: {
    need: (s, g, ctx) => {
      const sq = !ctx.next || ctx.next.type !== 'curves' ? SQUASH_EXIT : 0;
      return Math.max(sec(Math.max(1.0 + MERGE_CUES.settled + 0.05, (namedLinks(ctx.scenes).has(ctx.i) ? 3.5 + (sq ? NAME_OUT + 0.05 : 0.05) : 0)) + sq, g), cornerNeed(s, g, ctx));
    },
  },
  // formula readable ≈ 1.15u (+ the press) and held until tracks flattens it; riders land on RIDE.to
  curves: {
    read: () => [FORMULA.join('')],
    need: (s, g, ctx) => {
      const sh = curvesShift(ctx.scenes, ctx.i);
      const r = ctx.reading([FORMULA.join('')]);
      return Math.max(sec(sh + 1.15, g) + r.end, sec(motionNeed(s, ctx, sh + RIDE.to + 0.05), g), cornerNeed(s, g, ctx));
    },
  },
  // fourth track name full at 0.54u; rows fade D − 0.25u; clips land through ≈ 1.5u; the playhead sweeps the last 1.0u,
  // so it starts after the centre name has left
  tracks: {
    read: (s) => (s.tracks || []).map(glance),
    need: (s, g, ctx) => {
      const r = ctx.reading((s.tracks || []).map(glance));
      return Math.max(sec(motionNeed(s, ctx, 2.0, 0.85), g), 1.075 * g.beat + r.end + 0.5 * g.beat, cornerNeed(s, g, ctx));
    },
  },
  // first word lands ≈ 0.65u, one word every 0.55u; words leave D − 0.18u; the plume grows over 2u
  ink: {
    read: (s) => String(s.words || '').split(/\s+/).filter(Boolean).slice(0, 3).map((w, k) => ({ text: w, at: k * 1.1 * 0.5 })),
    need: (s, g, ctx) => {
      const ws = String(s.words || '').split(/\s+/).filter(Boolean).slice(0, 3);
      const r = ctx.reading(ws.map((w, k) => ({ text: w, at: sec(k * 0.55, g) })));
      return Math.max(sec(2.0, g), sec(0.65, g) + r.end + sec(0.18, g), cornerNeed(s, g, ctx));
    },
  },
  // flood on the bar line, gather, sheet on 1/16 notes, counter to 5.5u, checks, collapse 6.45u, card 6.85u; the card's
  // title, its spec line in three parts, the export bar along its foot; the card squashes into the line D − 0.05u.
  review: {
    max: 5, turn: true, climax: true,
    reason: 'the climax: the flood, the contact sheet with its counter and the file card, three compositions in one take (shots at the sheet and the card)',
    read: (s) => [s.card, ...SPEC.split(' · ').map((x, k) => ({ text: text(x), at: 0.3 + 0.3 * k }))],
    need: (s, g, ctx) => {
      const c0 = RC.card + CARD.title, parts = SPEC.split(' · ').map(text);
      const r = ctx.reading([s.card, ...parts.map((x, k) => ({ text: x, at: sec(CARD.spec + k * CARD.specStep - CARD.title, g) }))]);
      return Math.max(sec(c0, g) + r.end + sec(0.1 + CARD.squash, g), sec(RC.card + CARD.bar + CARD.barDur + 0.25 + CARD.squash, g), cornerNeed(s, g, ctx));
    },
  },
  // the line settles under the name's place, the blade cuts it into the name (≈ 1.0u), the line and URL follow; the URL
  // holds ≥ 3 s; the underline's second move lands on the last bar's downbeat (shots.js closeSecondMove)
  close: {
    rest: true, absorb: true, reason: 'closing card: the URL holds ≥ 3 s',
    read: (s) => [s.name, s.line, s.url],
    need: (s, g, ctx) => Math.max(sec(CLOSE.url + CLOSE.urlDur, g) + 3, sec(CLOSE.cut + CLOSE.cutDur, g) + ctx.reading([s.name, s.line, s.url]).end),
  },
};

// ---------- events: keys, holds, hand-offs, and the four tiers (absolute seconds) ----------
const events = (scenes, g, content) => {
  const K = Kof(g), out = { keys: [], holds: [], handoffs: [], micro: [], shots: [], expressive: [], peaks: [] };
  const named = namedLinks(scenes);
  const vars = facts({ duration: scenes[scenes.length - 1].end, bpm: g.bpm, bars: 0 }, content.fps);
  scenes.forEach((S, i) => {
    const D = S.bars * 2, at = (u) => S.start + u / K;
    const key = (u, kind, what, extra = {}) => out.keys.push({ t: at(u), kind, scene: i, what, ...extra });
    const micro = (u, what) => out.micro.push({ t: at(u), scene: i, what });
    const hold = (a, b, extra = {}) => { if ((b - a) / K >= 0.2) out.holds.push({ from: at(a), to: at(b), scene: i, ...extra }); };
    const shot = (u, what) => out.shots.push({ t: at(u), scene: i, what });
    const expr = (u, beats, device, variant) => out.expressive.push({ t: at(u), beats, device, variant, scene: i });
    const handoff = (u, what) => out.handoffs.push({ t: at(u), scene: i, what });
    const pressed = pressedName(scenes, i); // a merge whose name the next link presses
    const ex = nameExit(S.type, scenes[i + 1]);
    const ne = named.has(i) ? nameAt(S.type, D, ex) : null, nEnd = ne == null || pressed ? 0 : ne + NAME_HOLD + NAME_OUT;
    if (ne != null) { key(ne, 'land', 'centre name'); micro(ne, 'centre name'); }
    if (i > 0 && S.type !== 'review') handoff(0, `${scenes[i - 1].type} → ${S.type}`);
    micro(0, `${S.type} starts`);
    if (S.type === 'open') {
      const P = openPlan(phrasesOf(S, vars), K, D);
      micro(OPEN.draw, 'the line contracts to the caret'); micro(OPEN.type, 'phrase 1 typed');
      micro(P.flat0, 'the caret falls flat into the line');
      hold(P.typed + 0.05, P.flat0); hold(P.flatEnd + 0.05, P.two ? P.loop0 : P.hug0);
      if (P.two) {
        expr(P.loop0, 2, 'path-type', 'brief: phrase 1 → phrase 2 round the loop'); shot(P.loop0, 'the line rolls up a loop');
        handoff(P.loop0, 'path-type starts'); key(P.landed, 'land', 'phrase 2 lies on the straight line');
        micro(P.landed, 'phrase 2 lands'); hold(P.landed + 0.05, P.hug0);
      }
      micro(P.hug0, 'the line tightens under the phrase'); hold(P.hug0 + OPEN.hug + 0.05, P.out0);
      micro(P.out0, 'the line contracts into the caret'); micro(D - OPEN_OUT, 'the letters slide into the caret');
    }
    if (S.type === 'word') {
      [0.5, 1.0, 1.5].forEach((u) => { key(u, 'accent', 'weight swing'); micro(u, 'weight swing'); });
      hold(1.95, D - 0.05);
    }
    if (S.type === 'palette') { [[0.5, 'hex labels'], [0.95, 'swatches hop'], [1.0, 'type specimen']].forEach(([u, w]) => micro(u, w)); hold(Math.max(1.75, nEnd), D - 0.15); }
    if (S.type === 'storyboard') { [[0.45, 'two more panels'], [0.6, 'sketches'], [1.45, 'panel 3 chosen']].forEach(([u, w]) => micro(u, w)); hold(Math.max(1.9, nEnd), D); }
    if (S.type === 'merge') {
      handoff(1.0, 'push → shot'); shot(1.0, 'the shot behind panel 3');
      [[1.0 + MERGE_CUES.contact[0], 'contact'], [1.0 + MERGE_CUES.contact[1], 'third sphere'], [1.0 + MERGE_CUES.land, 'landing'], [1.0 + MERGE_CUES.rebound, 'rebound']].forEach(([u, w]) => micro(u, w));
      if (ex) micro(D - ex, 'the sphere squashes into the line');
      hold(Math.max(1.0 + MERGE_CUES.settled, nEnd, ne != null ? ne + 0.1 : 0), D - ex);
    }
    if (S.type === 'curves') {
      const sh = curvesShift(scenes, i);
      if (sh) {
        expr(PRESS.at, 1, 'rail-press', 'press: the stage name into the ruler');
        handoff(PRESS.at, 'rail-press starts'); key(PRESS.hit, 'accent', 'the line hits the name');
        micro(PRESS.hit, 'the name is pressed into the line');
        micro(PRESS.drop, 'the line drops over the name');
      }
      [[sh + 0.55, 'ruler ticks'], [sh + 0.75, 'curves draw'], [sh + 0.9, 'formula'], [sh + RIDE.to, 'riders land']].forEach(([u, w]) => micro(u, w));
      hold(Math.max(sh + RIDE.to + 0.05, nEnd), D);
    }
    if (S.type === 'tracks') {
      [[0.2, 'track names'], [0.45, 'clips land'], [D - 1.0, 'the playhead sweeps'], [D - 0.3, 'the playhead grows to full height']].forEach(([u, w]) => micro(u, w));
      hold(Math.max(1.6, nEnd), D - 1.0);
    }
    if (S.type === 'ink') {
      String(S.words || '').split(/\s+/).filter(Boolean).slice(0, 3).forEach((w, k) => micro(0.45 + 0.55 * k, `ink word ${w}`));
      micro(D - 0.18, 'the words leave');
    }
    if (S.type === 'review') {
      // the flood: the line colour opens from the centre as the next ground (lib/transitions dot-iris, ground-only), in the
      // 0.3 u before the downbeat; a full-frame change of ground (principle 4), the T2 of the climax
      expr(-0.25, 0.6, 'dot-iris', 'ground-only: the line colour floods out from the centre');
      // the music drops on the contact sheet, one bar into the review (score.mjs)
      key(RC.sheet, 'accent', 'contact sheet: the music drops', { drop: true });
      key(RC.counted, 'land', 'counter'); micro(RC.recede, 'the flood retracts onto the sheet\'s gutters');
      shot(RC.sheet, 'the contact sheet'); shot(RC.card, 'the file card');
      out.peaks.push({ t: at(RC.sheet), kind: 'reveal', climax: true, scene: i });
      [[RC.gather, 'particles gather'], [1.45, 'tile outlines'], [RC.sheet + 0.5, 'tiles'], [RC.sheet + 1.0, 'tiles'], [RC.sheet + 1.5, 'tiles'],
        [RC.checks, 'checks'], [RC.checks + 0.5, 'checks'], [RC.checks + 1.0, 'checks'], [RC.collapse, 'the tiles collapse'],
        [RC.card + CARD.title, 'card title'], ...[0, 1, 2].map((k) => [RC.card + CARD.spec + k * CARD.specStep, 'spec line part']),
        [RC.card + CARD.bar, 'the export bar runs'], [D - CARD.squash, 'the card squashes into the line']].forEach(([u, w]) => micro(u, w));
      hold(RC.pushEnd, RC.collapse); hold(RC.card + CARD.bar + CARD.barDur + 0.05, D - CARD.squash);
    }
    if (S.type === 'close') {
      expr(CLOSE.cut, 1, 'rail-press', 'cut: the line into the name'); handoff(CLOSE.cut, 'rail-press starts');
      const done = CLOSE.cut + CLOSE.cutDur;
      key(done, 'land', 'the name is cut out of the line'); micro(done, 'the name'); shot(done, 'the lock-up: name, line, URL');
      micro(CLOSE.line, 'closing line'); micro(CLOSE.url, 'URL typed');
      const u2 = closeSecondMove(D);
      out.peaks.push({ t: at(done), kind: 'lockup', climax: !scenes.some((x) => x.type === 'review'), scene: i });
      hold(CLOSE.url + CLOSE.urlDur + 0.05, u2 == null ? D : u2 - 0.1);
      if (u2 != null) { key(u2, 'end', 'underline second move'); micro(u2, 'underline second move'); hold(u2 + 0.25, D); }
    }
  });
  // the hook: the big word's first swing; without the head, the first centre name
  const wi = scenes.findIndex((x) => x.type === 'word');
  if (wi >= 0) out.peaks.push({ t: scenes[wi].start + 0.5 / K, kind: 'hook', scene: wi });
  else {
    const k = [...named][0];
    if (k != null) out.peaks.push({ t: scenes[k].start + nameAt(scenes[k].type, scenes[k].bars * 2, nameExit(scenes[k].type, scenes[k + 1])) / K, kind: 'hook', scene: k });
  }
  // content area: everything but the corner stage label (the persistent frame)
  return { ...out, mask: [0, 170, 1920, 910] };
};

export default {
  api: 3,
  // the one accent is the line colour (mode card, Accent role), for check-film's accent-area measure
  accent: (content) => (PALETTES[content.palette] ?? PALETTES.vermilion).line,
  bpm: { default: 120, min: 112, max: 128 },
  beatsPerBar: 4,
  unit: 0.25, // one beat: links start on any beat (api 3 holds are ≤ 2 beats, so half-bar rounding left dead holds);
  // the review (a turn) starts on a bar line, so its flood lands on a downbeat
  // The phrase is one bar and none of its rounding is shared out: added to a link it would lengthen a still hold past
  // two beats. The closing card (a rest) takes it and ends with its second move on the last downbeat.
  phrase: 1,
  phraseShareBeats: 0,
  wordSec: WORD,
  types,
  events,
};

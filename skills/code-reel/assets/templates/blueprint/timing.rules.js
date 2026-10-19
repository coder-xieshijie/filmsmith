// timing.rules.js — how long each blueprint sheet needs, measured from its choreography (choreography.js)
// and the reading standard (references/principles.md 1). Format: lib/timing.js header (api 3, the four tiers of
// change, principles 4 and 5, owner-approved 2026-10-19); turned into bars per scene by lib/timing.js fit(); see
// TEMPLATE.md "How long a film is".
//
// A sheet is not a still card: its parts draw one after another, and the viewer reads each part as it
// lands while the next one draws. So each type's need() runs lib/timing.js's reader (ctx.reading) over the
// sheet, every item placed at the moment it has finished drawing (`at`, seconds from the scene start):
//   read   the copy the sheet exists to say (ink lettering: headline, values, questions and answers, steps,
//          commands, claim, stamp): primary text, read in draw order, one after another. Each item enters on its
//          own cue, so a state is one line, one value or one answer: at most five words (api 3 stateWords); the
//          final overview's claim lines are marked claim: true (eight words) and read in a pause hold.
//   notes  the drawing's annotations (figure label, muted subs and descriptions, box tags, ids, footnotes).
//          A note of six words or fewer is glance text (≥ 1 s fully still, read in parallel): every note
//          qualifies by its role, because it repeats what the drawing already shows (the figure label repeats
//          the HUD's sheet label, a tag names the box under it, the summary repeats the answers just read, the
//          footer of a sub restates the title) or can be deleted without losing the sheet. A longer note is
//          primary text, read in its place in the draw order (principle 1: glance text is short or it is
//          read like the rest).
//   build  the choreography itself: N0 beats until the last part lands, then two beats of complete stillness.
// need = max(reading done, build + stillness) + the shortest move out.
//
// Steps (api 3): a sheet builds in steps, its cues. steps() returns the stillness after each landing (the gap to
// the next cue) and the last hold, each ≤ 2 beats (holdMaxBeats); the final overview's claim is a pause (≤ 2 bars).
// A sheet is at most one 6 s composition (sceneMaxSec); the stamp sheets and the interface split into several
// compositions (events() shots: the push-in, the return, the unfold), so their ceiling is 3 bars and each
// composition is held to 6 s by the T1 check.
//
// Grid and phrase: scenes in whole beats (unit 0.25 bar). There are no bar-line turns at api 3: a turn's pad
// lengthened the sheet before it into a hold over 2 beats. The film rounds up to a 2-bar phrase; the release takes
// all of it (phraseShareBeats 0), then letters its status in on the film's last downbeat. A sheet whose
// build does not end on a beat gives the remainder to its move out (a pan of 1–1.75 beats), never to its hold.
//
// The lead and the move out depend on the neighbours (ctx from fit()): the first sheet waits half a beat for
// the drawing frame; the camera leaves at least 1.5 beats before the end into or out of an overview, 1 beat between
// sheets, 1 beat out of the final overview into a release entered under the rule, and not at all from the last scene.
import { units, reader } from './lib/timing.js';
import { CUES, TYPES, stampBeat, endBuild, HOLD_S, URL_HOLD_S, MOVE_B, MOVE_OV_B, LEAD_B, PANEL_OUT_B, STATUS_DUR_B, PUSH_BACK_B, FLOOD_AFTER_B, FLOOD_B, RULE_B, REINTERPRET_B, UNFOLD_B, SLOT_B, ROUTE_B } from './choreography.js';
import { CONTENT_MASK } from './hud.js';
import palettes from './palettes.js';

const GLANCE_MAX = 6; // words: a note longer than this is read as primary text (principle 1)
const THUD_S = 0.25; // the stamp's thud (camera.js), after which the push-in holds still

const isOv = (s) => s?.type === 'overview';
// the first sheet waits half a beat for the drawing frame; an excerpt's frame is pre-printed, so it starts at once
const leadB = (ctx) => (ctx.i === 0 && ctx.content?.excerpt !== true ? LEAD_B : 0);
// the release after the final overview enters under a parallel rule (occluder-pass) unless enter: 'push'
export const ruleEntry = (s, prev) => s?.type === 'release' && prev?.type === 'overview' && prev.final === true && s.enter !== 'push';
// the shortest move out (beats); a sheet's rounding remainder lengthens it (timeline.js)
export const outMinB = (s, next) => (!next ? 0 : ruleEntry(next, s) ? RULE_B : isOv(s) || isOv(next) ? MOVE_OV_B : MOVE_B);
const outB = (s, ctx) => outMinB(s, ctx.next);

// Lettering wipe of a header line (sheets/common.js header()).
const hw = (str) => 0.6 * (String(str ?? '').length > 12 ? 1.15 : 1);
const text = (v) => (Array.isArray(v) ? v.map((p) => (Array.isArray(p) ? p[0] : p)).join('') : String(v ?? ''));
const passed = (s) => `${(s.items || []).filter((x) => x.ok).length} / ${(s.items || []).length}`;

// Item: [cue, text, wipe seconds, extra beats, claim]. '@stamp' is the stamp's beat (choreography.js stampBeat).
// Stamps: the stamp word is primary (it is what the stamp says); its small line (By you, checksum ok, 6 / 6)
// is a note, read at a glance: it repeats the colour's meaning or the count just read.
const COPY = {
  problem: {
    read: (s) => [
      ['title', s.lines?.[0], hw(s.lines?.[0])],
      ['title2', s.lines?.[1], hw(s.lines?.[1])],
      ...(s.items || []).map((it, i) => [`item${i}`, it.value, 0.66]),
    ],
    notes: (s) => [['title', s.label, 0.03], ...(s.items || []).map((it, i) => [`item${i}`, it.key, 0.48]), ['note', s.note && `△ ${s.note}`, 0.5]],
  },
  arrangement: {
    read: (s) => [
      ['title', s.lines?.[0], hw(s.lines?.[0])],
      ['title2', s.lines?.[1], hw(s.lines?.[1])],
      ['input', s.input?.name, 0.62],
      ['system', s.system?.name, 0.62],
      ['output', s.output?.name, 0.62],
    ],
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.9], ['input', s.input?.tag, 0.3], ['system', s.system?.tag, 0.3], ['output', s.output?.tag, 0.3]],
  },
  detail: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ...(s.rows || []).flatMap((r, i) => [[`row${i}`, r.q, 0.55], [`ans${i}`, r.a, 0.3]]),
      ['@stamp', s.stamp?.word, 0.17],
    ],
    // the summary repeats the answers just read: a recap, read at a glance
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.9], ['summary', s.summary, 0.75], ['note', s.note, 0.45], ['@stamp', s.stamp?.small, 0.17]],
  },
  section: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ...(s.parts || []).map((p, i) => [`box${i + 1}`, p.name, 0.7]),
      ...(s.notes || []).map((n, j) => ['notes', n, 0.5 + j * 0.6]),
      ['output', s.output, 0.55],
      ['@stamp', s.stamp?.word, 0.17],
    ],
    notes: (s) => [
      ['title', s.label, 0.03], ['sub', s.sub, 0.6],
      ...(s.parts || []).map((p, i) => [`box${i + 1}`, p.desc, 0.9]),
      ...(s.parts || []).flatMap((p, i) => (p.lines || []).map((l, j) => [`box${i + 1}`, l, 1.2 + j * 0.2])),
      ['dim', text(s.dimension), 0.9],
      ['@stamp', s.stamp?.small, 0.17],
    ],
  },
  loop: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ...(s.steps || []).map((st, i) => ['loop', st, 0.5, i * 0.5]),
      ['gate', s.gate?.title, 0.6],
    ],
    // the aside is a side note by role (a box off the loop): its head and text are notes, glance when short
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.6], ['gate', s.gate?.sub, 0.7], ['aside', s.aside?.head, 0.55], ['aside', s.aside?.text, 1.0]],
  },
  checklist: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ['count', 'n', 0.25], // the computed count reads as one figure
      ['note', s.note, 0.6],
      ['footer', s.footer, 0.6],
      ['@stamp', s.stamp?.word, 0.17],
    ],
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.8], ['label', s.countLabel, 0.5], ['@stamp', s.stamp && (s.stamp.small ?? passed(s)), 0.17]],
  },
  assembly: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ...(s.ends || []).map((e, i) => ['ends', e.word, 0.45 + i * 0.15]),
      ['claim', s.claim, 0.5],
    ],
    // the nodes repeat the sheets just drawn (their titles), so they are read at a glance
    notes: (s) => [['title', s.label, 0.03], ...(s.ends || []).map((e, i) => ['ends', e.sub, 0.55 + i * 0.15]),
      ...(s.nodes || []).map((n, i) => ['nodes', n, 0.3, i * (0.25 / 0.6)]), ['loop', s.loop, 0.8], ['claimSub', s.claimSub, 0.5]],
  },
  parts: {
    read: (s) => [
      ['title', s.title, hw(s.title)],
      ...(s.rows || []).map((r, i) => [`row${i}`, r, 0.8]),
    ],
    // the chips repeat the order of use the assembly drew, so they are read at a glance
    notes: (s) => [['title', s.label, 0.03], ...(s.chips || []).map((c, i) => [`chip${i}`, c, 0.4]), ['note', text(s.note), 0.6]],
  },
  release: {
    read: (s) => [
      ['name', s.name, 0.65],
      ...(s.tags || []).map((t, i) => [`tag${i}`, t, 0.35]),
      ['url', s.url, 0.6],
    ],
    notes: (s) => [['kicker', s.kicker, 0.8], ['foot', text(s.foot), 0.5]],
  },
  // the console: the title is read; the region names are labels (glance: each repeats a part of the product's own
  // interface and can be deleted without losing the sheet); the two view labels are drafting furniture
  interface: {
    read: (s) => [['title', s.title, hw(s.title)]],
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.6], ...(s.regions || []).map((r, k) => [`region${k}`, r, 0.3])],
  },
  // each stage word is read as it lands (SLOT_B after its hand-off starts); the counter and note are glance
  stages: {
    read: (s) => [['title', s.title, hw(s.title)], ...(s.stages || []).map((w, k) => [`stage${k}`, w, 0, SLOT_B * 0.75])],
    notes: (s) => [['title', s.label, 0.03], ['sub', s.sub, 0.6], ['note', s.note, 0.5]],
  },
  overview: {
    read: (s) => (s.final ? [['line1', s.lines?.[0], 0.6, 0, true], ['line2', s.lines?.[1], 0.6, 0, true], ['@stamp', s.stamp?.word, 0.17]] : []),
    notes: (s) => (s.final ? [['panel', s.label, 0.5], ['@stamp', s.stamp?.small, 0.17]] : []),
  },
};

// The reader over one sheet: seconds from the scene start.
const reading = (s, g, ctx, lead) => {
  const def = CUES[s.type](s), copy = COPY[s.type];
  const cueB = (cue) => (cue === '@stamp' ? stampBeat(s) : Math.round((def.c[cue] ?? 0) * 8) / 8); // timeline.js snaps cues to 1/8 beat
  const when = ([cue, , wipe = 0, beats = 0]) => (lead + cueB(cue) + beats) * g.beat + wipe;
  const list = [
    ...copy.read(s).map((it) => ({ text: it[1], at: when(it), tier: 'primary', ...(it[4] ? { claim: true } : {}) })),
    ...copy.notes(s).map((it) => ({ text: it[1], at: when(it), tier: units(it[1]) <= GLANCE_MAX ? 'glance' : 'primary' })),
  ].filter((x) => x.text).sort((a, b) => a.at - b.at);
  const r = ctx.reading(list);
  return { end: r.end, build: (lead + def.N0) * g.beat, def };
};
const holdSec = (g) => Math.ceil(HOLD_S / g.beat - 1e-9) * g.beat;

// need and the build of one sheet (or overview), in seconds from the scene start
const sheetPlan = (s, g, ctx) => {
  const lead = leadB(ctx), r = reading(s, g, ctx, lead), out = outB(s, ctx) * g.beat;
  // an excerpt's last sheet (only an excerpt ends on a sheet that is not the release): it builds up to its end
  // state (a stamp sheet: the stamp has landed with the camera pushed in; choreography.js endBuild), then holds
  // still for the same two beats, with no move out
  const eb = ctx.next ? null : endBuild(s);
  if (eb !== null) { const build = (lead + eb) * g.beat; return { need: Math.max(r.end, build + holdSec(g)), build, out: 0, lead, def: r.def }; }
  const still = ctx.next ? holdSec(g) : 0; // the last scene has no move out and no still hold before one
  // the beat grid's remainder goes to the move out (a slightly longer pan), never to the hold: need is rounded up
  // to the beat here, so the hold after the last landing is exactly two beats (or the reading's end)
  const core = Math.max(r.end, r.build + still);
  const need = ctx.next ? Math.ceil((core + out) / g.beat - 1e-9) * g.beat : core + out;
  return { need, build: r.build, out: need - core, lead, def: r.def };
};
const overviewPlan = (s, g, ctx) => {
  const def = CUES.overview(s), out = outB(s, ctx) * g.beat;
  if (!s.final) { ctx.reading([]); return { need: def.N0 * g.beat + out, build: def.N0 * g.beat, out, lead: 0, def }; } // nothing to read
  const r = reading(s, g, ctx, 0);
  return { need: Math.max(r.end, r.build) + PANEL_OUT_B * g.beat + out, build: r.build, out, lead: 0, def };
};

// Stillness after each step: the gap from one cue to the next (an upper bound: the drawing of the next part
// starts before its cue), then the last landing's hold up to the move out. The final overview's last step is
// the claim being read: a pause (≤ 2 bars).
const steps = (planOf) => (s, g, ctx) => {
  const p = planOf(s, g, ctx);
  const sb = stampBeat(s);
  const cues = [...new Set([...Object.values(p.def.c), ...(sb === null ? [] : [sb])].map((b) => Math.round((p.lead + b) * 8) / 8))].sort((a, b) => a - b);
  const gaps = cues.slice(1).map((b, k) => (b - cues[k]) * g.beat);
  const last = Math.max(0, p.need - p.out - p.build);
  // a pause: the final overview's claim, and an excerpt's closing stamp (the cut-down's last word, held to its end)
  const pause = (isOv(s) && s.final) || (!ctx.next && !isOv(s) && sb !== null);
  return [...gaps, pause ? { still: last, pause: true } : last];
};

// Ceiling (api 3): one composition is at most 6 s (lib/timing.js sceneMaxSec, the default `max`). The stamp
// sheets, the final overview and the interface are split by shots (events() below) and may run to 3 bars; the T1
// check holds each of their compositions to 6 s.
const SPLIT_MAX = 3;

// The music's drops, for the keys' drop: true (check-film allows the loudness jump there). The same kinds
// score.mjs gives the bed: a sheet's `music`, else MUSIC[type] (an overview drops when final, else breaks). A drop
// sheet after a sheet of another kind drops on its first beat, where the camera arrives; a drop after a drop
// (reading or not) is no landing.
export const MUSIC = { problem: 'intro', arrangement: 'build', interface: 'build', detail: 'build', section: 'drop', loop: 'drop', stages: 'drop', checklist: 'drop', assembly: 'build', parts: 'break', release: 'outro' };
const musicOf = (sc) => sc.music || (sc.type === 'overview' ? (sc.final ? 'drop' : 'break') : MUSIC[sc.type]);
const dropsHere = (scenes, i) => musicOf(scenes[i]) === 'drop' && (i === 0 || musicOf(scenes[i - 1]) !== 'drop');

// The move out of a fitted scene, in seconds: the shortest move plus whatever the beat grid left after the hold
// (a build that ends off the beat gives its remainder to the pan, never to the stillness). An overview's move is
// fixed; its claim pause takes the rest. timeline.js uses the same function. ctx: { i, scenes, content } (fitted).
export const outSec = (sc, g, ctx) => {
  const next = ctx.scenes[ctx.i + 1];
  if (!next) return 0;
  if (isOv(sc)) return outMinB(sc, next) * g.beat;
  const full = { ...ctx, next, prev: ctx.scenes[ctx.i - 1], reading: (list) => reader(list) };
  const lead = leadB(full), r = reading(sc, g, full, lead);
  return Math.max(outMinB(sc, next) * g.beat, sc.end - sc.start - Math.max(r.end, r.build + holdSec(g)));
};

// The camera's push-in on a stamp, in beats from the scene start (timeline.js builds the same windows): in over
// [stamp − 1.5, stamp − 0.5], held still to `hold`, back over PUSH_BACK_B. An issue sheet holds until its flood has
// closed. An excerpt's last stamp sheet stays pushed in.
export const pushBeats = (s, lead) => {
  const sb = stampBeat(s);
  if (sb === null || isOv(s)) return null;
  const st = lead + sb, hold = st + (s.issue === true ? FLOOD_AFTER_B + FLOOD_B : 1);
  return { from: st - 1.5, at: st - 0.5, stamp: st, hold, back: hold + PUSH_BACK_B };
};

// Key events, holds, the tiers' events (micro, shots, expressive) of one sheet, in seconds from the scene start
// (lib/timing.js events). The same arithmetic as timeline.js, which imports this file and so cannot be imported here.
const sheetEvents = (s, g, ctx) => {
  const i = ctx.i, sc = ctx.scenes[i], next = ctx.scenes[i + 1];
  const lead = leadB(ctx), def = CUES[s.type](s), b = g.beat, dur = sc.end - sc.start;
  const out = outSec(sc, g, ctx);
  const keys = [], holds = [], micro = [], shots = [], expressive = [];
  if (i > 0) keys.push({ t: 0, kind: 'land' }); // the camera arrives on the beat
  const sb = stampBeat(s);
  const eb = next ? null : endBuild(s); // an excerpt's last sheet: ends on its hold, a stamp sheet pushed in on its stamp
  const buildEnd = (lead + (eb ?? def.N0)) * b, moveOut = dur - out;
  const snap = (x) => Math.round(x * 8) / 8;
  // T0: every part landing on its cue (the same cue table the picture and the sound use)
  for (const [name, cb] of Object.entries(def.c)) {
    const t = (lead + snap(cb)) * b;
    if (t >= 0 && t < dur - 1e-6) micro.push({ t, what: name });
  }
  if (s.type === 'stages') (s.stages || []).forEach((w, k) => micro.push({ t: (lead + snap(def.c['stage' + k]) + SLOT_B) * b, what: `${w} lands` }));
  if (next) micro.push({ t: moveOut, what: isOv(next) ? 'the camera pulls out' : ruleEntry(next, s) ? 'the rule enters' : 'the route draws to the next sheet' });
  if (sb !== null) {
    const st = (lead + sb) * b;
    keys.push({ t: st, kind: 'stamp' });
    const pu = pushBeats(s, lead);
    if (pu) {
      // T1: the push-in frames the stamp (a new composition), the return frames the whole sheet again
      shots.push({ t: pu.from * b, what: 'push-in on the stamp' });
      micro.push({ t: pu.at * b, what: 'the push-in settles' });
      const end = eb !== null;
      // the push-in has settled half a beat before the stamp; after the thud it holds until it returns (an issue
      // sheet: until its flood starts), or, at the end of an excerpt, until the end
      holds.push({ from: st + THUD_S, to: end ? dur : s.issue === true ? (lead + sb + FLOOD_AFTER_B) * b : pu.hold * b, ...(end ? { pause: true } : {}) });
      if (!end) { shots.push({ t: pu.back * b, what: 'back to the whole sheet' }); micro.push({ t: pu.hold * b, what: 'the camera returns' }); }
      if (s.issue === true) {
        const f0 = (lead + sb + FLOOD_AFTER_B) * b;
        expressive.push({ t: f0, dur: FLOOD_B * b, device: 'shape-flood', variant: 'rect · from the stamp · original to print' });
        micro.push({ t: f0 + FLOOD_B * b, what: 'the print has replaced the original' });
      }
    } else if (s.final) {
      holds.push({ from: st + THUD_S, to: dur - (out / b + PANEL_OUT_B) * b, pause: true }); // final overview: the claim with its stamp
    }
  }
  if (isOv(s) && s.final) {
    shots.push({ t: def.c.panel * b, what: 'the claim panel over the drawing' });
    micro.push({ t: dur - (out / b + PANEL_OUT_B) * b, what: 'the claim panel leaves' });
  }
  if (s.type === 'interface') {
    expressive.push({ t: (lead + def.c.reinterpret) * b, dur: REINTERPRET_B * b, device: 'stroke-reinterpret', variant: 'add' });
    expressive.push({ t: (lead + def.c.unfold) * b, dur: UNFOLD_B * b, device: 'net-unfold', variant: 'both' });
    shots.push({ t: (lead + def.c.unfold) * b, what: 'the box opens into the console' });
  }
  if (next && ruleEntry(next, s)) expressive.push({ t: moveOut, dur: RULE_B * b, device: 'occluder-pass', variant: 'tilt 10' });
  if (!isOv(s) && s.type !== 'release' && moveOut > buildEnd + 1e-6 && !(eb !== null && sb !== null)) holds.push({ from: buildEnd, to: moveOut });
  if (isOv(s) && !s.final) { const drift = Math.min(moveOut, 4 * b); if (moveOut > drift) holds.push({ from: drift, to: moveOut }); }
  if (s.type === 'release') {
    const status = Math.max(dur - g.beatsPerBar * b, Math.ceil(lead + def.N0 - 1e-9) * b);
    if (status > buildEnd) holds.push({ from: buildEnd, to: status });
    keys.push({ t: status, kind: 'land' }); // the RELEASED lettering, on the last downbeat
    micro.push({ t: status, what: 'the status is lettered' });
    if (dur > status + STATUS_DUR_B * b) holds.push({ from: status + STATUS_DUR_B * b, to: dur });
  }
  if (dropsHere(ctx.scenes, i)) { // the camera's arrival (land), or on the first sheet an accent
    const at0 = keys.find((x) => Math.abs(x.t) < 1e-3);
    if (at0) at0.drop = true;
    else keys.push({ t: 0, kind: 'accent', drop: true });
  }
  return { keys, holds: holds.filter((h) => h.to > h.from + 1e-6), micro, shots, expressive };
};

const sheet = (type, extra = {}) => ({
  steps: steps(sheetPlan),
  need: (s, g, ctx) => sheetPlan(s, g, ctx).need,
  events: sheetEvents,
  ...extra,
});

// Copy that breaks the issue's rules stops `npm run fit` (the page shows the same errors as a red banner).
const validate = (content) => {
  const errs = [], sc = content.scenes || [];
  const issues = sc.filter((s) => s.issue !== undefined);
  for (const s of issues) {
    if (s.issue !== true) errs.push(`${s.type}: issue must be true or left out`);
    else if (s.type !== 'detail') errs.push(`${s.type}: only a detail sheet (a person's amber stamp) can issue the print`);
    else if (!s.stamp) errs.push('detail: issue: true needs its stamp');
  }
  if (issues.length > 1) errs.push(`${issues.length} sheets marked issue: true; the print is issued once`);
  if (content.original !== undefined && !issues.length) errs.push('original is set but no detail sheet has issue: true; the original is printed only at a signature');
  if (content.original !== undefined && !palettes[content.original]) errs.push(`unknown original "${content.original}"; presets: ${Object.keys(palettes).join(', ')}`);
  if (issues.length && content.original === content.palette) errs.push('original and palette are the same preset: the issue would change only the line work');
  sc.forEach((s, i) => {
    if (s.enter !== undefined && !(s.type === 'release' && ['rule', 'push'].includes(s.enter))) errs.push(`scene ${i + 1} (${s.type}): enter is 'rule' or 'push', on the release only`);
  });
  return errs;
};

export default {
  api: 3,
  bpm: { default: 100, min: 92, max: 108 },
  beatsPerBar: 4,
  unit: 0.25, // scenes in whole beats (principle 5)
  phrase: 2,
  // the release takes all of the phrase rounding: a sheet's last hold is already at its 2-beat cap, and two beats more
  // on the final overview's claim pause made a 5-beat near-still passage (check-film pace WARN on the example)
  phraseShareBeats: 0,
  types: {
    problem: sheet('problem'),
    arrangement: sheet('arrangement'),
    interface: sheet('interface', { max: SPLIT_MAX }),
    detail: sheet('detail', { max: SPLIT_MAX }),
    section: sheet('section', { max: SPLIT_MAX }),
    loop: sheet('loop'),
    stages: sheet('stages'),
    checklist: sheet('checklist', { max: SPLIT_MAX }),
    assembly: sheet('assembly'),
    parts: sheet('parts'),
    release: {
      rest: true, absorb: true,
      reason: 'the closing card: the URL holds ≥ 3 s, then the RELEASED status lands on the last downbeat',
      // the last scene: no move out, no still hold; the URL holds ≥ 3 s after it has drawn
      need: (s, g, ctx) => {
        const lead = leadB(ctx), r = reading(s, g, ctx, lead);
        return Math.max(r.end, r.build, (lead + r.def.c.url + 1) * g.beat + URL_HOLD_S);
      },
      events: sheetEvents,
    },
    overview: {
      max: SPLIT_MAX, // the final overview: the pull-out, then the claim panel (a second composition) read in a pause
      steps: steps(overviewPlan),
      need: (s, g, ctx) => overviewPlan(s, g, ctx).need,
      events: sheetEvents,
    },
  },
  // the content mask: the drawing inside the HUD frame, without the label panel, corner note, scale bar and
  // title block (hud.js); the end of the film, on its last bar line; and the peaks (T3): the first sheet's title
  // (hook), the final overview's approval (the claim) or, in an excerpt without one, the last stamp (a reveal),
  // the release's name (lock-up). The claim or reveal is the climax.
  events: (scenes, g, content) => {
    const peaks = [], b = g.beat;
    const lead0 = content?.excerpt === true ? 0 : LEAD_B;
    if (scenes.length) peaks.push({ t: scenes[0].start + lead0 * b, kind: 'hook', scene: 0, what: 'the first line is lettered' });
    const fi = scenes.findIndex((s) => isOv(s) && s.final);
    if (fi >= 0) peaks.push({ t: scenes[fi].start + stampBeat(scenes[fi]) * b, kind: 'claim', climax: true, scene: fi, what: 'the approval stamp under the claim' });
    else {
      const k = scenes.findLastIndex((s) => stampBeat(s) !== null);
      if (k > 0) peaks.push({ t: scenes[k].start + (stampBeat(scenes[k]) + (k === 0 ? lead0 : 0)) * b, kind: 'reveal', climax: true, scene: k, what: 'the last stamp' });
    }
    const ri = scenes.findIndex((s) => s.type === 'release');
    if (ri >= 0) peaks.push({ t: scenes[ri].start + CUES.release(scenes[ri]).c.name * b, kind: 'lockup', scene: ri, what: 'the name' });
    return { keys: scenes.length ? [{ t: scenes[scenes.length - 1].end, kind: 'end', scene: scenes.length - 1 }] : [], mask: CONTENT_MASK, peaks };
  },
  validate,
};

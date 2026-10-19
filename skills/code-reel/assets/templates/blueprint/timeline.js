// timeline.js — the film's schedule as pure data, shared by index.html (picture) and score.mjs (sound).
// Scene lengths, the tempo and the duration come from lib/timing.js fit() with this mode's timing.rules.js,
// the same call lib/fit.mjs makes, so picture, sound and the static data-duration agree. Inside a scene every
// cue is a fixed beat after the camera arrives (choreography.js) and every exit a fixed beat before the scene
// ends: a longer scene lands everything at the same moment and holds still longer. Nothing depends on
// measured text, so Node computes the same cue times as the browser.
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import rules, { outSec, pushBeats, ruleEntry } from './timing.rules.js';
import { TYPES, CUES, SHEETS_MIN, SHEETS_MAX, EXCERPT_MIN, HOLD_S, URL_HOLD_S, LEAD_B, PANEL_OUT_B, FLOOD_AFTER_B, FLOOD_B, RULE_B, stampBeat, endBuild } from './choreography.js';

export { TYPES, SHEETS_MIN, SHEETS_MAX, HOLD_S, URL_HOLD_S };

const snap = (b, q = 0.125) => Math.round(b / q) * q;

// schedule(content) → { g, duration, scenes, sheetsTotal, errors, warnings, sounds, fitted }
export const schedule = (content) => {
  const errors = [], warnings = [];
  const raw = content.scenes || [];
  const T = fit(content, rules);
  for (const n of T.notes) {
    const msg = `${n.scene != null ? `scene ${n.scene + 1}: ` : ''}${n.msg}`;
    (n.level === 'error' ? errors : warnings).push(msg);
  }
  const g = grid({ bpm: T.bpm, beatsPerBar: T.beatsPerBar });
  const laid = T.scenes;
  const holdB = Math.ceil(HOLD_S / g.beat - 1e-9);

  let sheetNo = 0;
  const sheetsTotal = raw.filter((s) => TYPES[s.type]?.sheet).length;
  // an excerpt (content.excerpt: true) is a cut-down for a reel: 2–9 sheets, ending on its last sheet, the release
  // optional (TEMPLATE.md "Excerpts"); a film holds 6–9 sheets and ends on the release card
  const excerpt = content.excerpt === true;
  if (content.excerpt !== undefined && typeof content.excerpt !== 'boolean') errors.push(`excerpt must be true or false, got ${JSON.stringify(content.excerpt)}`);
  const minSheets = excerpt ? EXCERPT_MIN : SHEETS_MIN;
  if (sheetsTotal < minSheets || sheetsTotal > SHEETS_MAX) errors.push(`${sheetsTotal} sheets; ${excerpt ? 'an excerpt' : 'the layout'} holds ${minSheets}–${SHEETS_MAX}${excerpt ? '' : ' (a shorter cut: excerpt: true)'}`);
  if (!excerpt && raw.length && raw[raw.length - 1].type !== 'release') errors.push('the last scene must be type "release"');
  if (excerpt && raw.length && raw[raw.length - 1].type === 'overview') errors.push('an excerpt ends on a sheet, not on an overview');
  raw.forEach((s, i) => { if (s.type === 'release' && i !== raw.length - 1) errors.push('"release" may only be the last scene'); });
  if (raw[0] && raw[0].type === 'overview') errors.push('the film cannot open on an overview');

  const isOv = (s) => s && s.type === 'overview';
  // the move into scene i happens at the end of scene i − 1: its shortest move plus the beat grid's remainder
  // (timing.rules.js outSec, the same function the key events use)
  const outs = laid.map((s, i) => (TYPES[s.type] ? outSec(s, g, { i, scenes: laid, content }) : 0) / g.beat);
  const moveIn = (i) => (i === 0 ? 0 : outs[i - 1]);
  const scenes = laid.map((s, i) => {
    const Ty = TYPES[s.type];
    if (!Ty) return { ...s, index: i, cue: {}, sounds: [] }; // fit() already reported the unknown type
    const last = i === laid.length - 1;
    const mIn = moveIn(i), mOut = last ? 0 : moveIn(i + 1);
    const nb = s.bars * g.beatsPerBar;
    // an excerpt's last sheet ends on its own hold (a stamp sheet pushed in on the stamp): choreography.js endBuild
    const eb = last ? endBuild(s) : null;
    const hold = s.type === 'overview' || (last && eb === null) ? 0 : holdB;
    const lead = i === 0 && !excerpt ? LEAD_B : 0; // the first sheet waits for the drawing frame (an excerpt's is pre-printed)
    const def = CUES[s.type](s);
    const build = eb ?? def.N0;
    if (s.type === 'interface' && i === laid.length - 1 && !excerpt) errors.push('interface cannot be the last scene');
    // timing.rules.js budgets this; a shortfall means the rules and the choreography disagree
    if (nb - mOut - hold - lead < build - 1e-9) errors.push(`scene ${i + 1} (${s.type}): ${s.bars} bars cannot hold its ${build}-beat build; timing.rules.js is out of step with choreography.js`);
    const cueB = {};
    for (const [name, b] of Object.entries(def.c)) cueB[name] = lead + snap(b);
    if (s.type === 'overview' && s.final) cueB.panelOut = nb - mOut - PANEL_OUT_B; // exit timed from the end
    // the closing sheet's second move lands on the downbeat of the film's last bar (principle 5; flow F6),
    // or as soon after the build as the next beat allows when the sheet is shorter than that
    if (last && s.type === 'release') cueB.status = Math.max(nb - g.beatsPerBar, Math.ceil(lead + def.N0 - 1e-9));
    const sb = stampBeat(s);
    const stampB = sb === null ? null : lead + sb;
    const at = (b) => s.start + b * g.beat;
    const cue = {};
    for (const [name, b] of Object.entries(cueB)) cue[name] = at(b);
    const out = {
      ...s,
      index: i,
      sheetNo: Ty.sheet ? ++sheetNo : null,
      sheetsTotal,
      moveIn: mIn * g.beat, // seconds; the camera travels during [start - moveIn, start]
      moveOutStart: s.end - mOut * g.beat,
      holdStart: at(lead + build), // from here to moveOutStart nothing moves
      buildEnd: at(lead + build),
      cue,
      stampT: stampB === null ? null : at(stampB),
      sounds: def.sounds.map(([name, kind]) => ({ t: cue[name], kind })).filter((x) => Number.isFinite(x.t)),
    };
    if (out.stampT !== null) {
      out.sounds.push({ t: out.stampT, kind: 'stamp' });
      // the camera settles half a beat before the stamp lands, so the stamp is the only thing moving on its beat
      // (one operation at a time, land then hold: 学习理论 07 C1/C6; owner 2026-10-18); it holds a beat (an issue
      // sheet: until its flood has closed) and returns in 0.6 of the push-in's beat (exits are faster; flow F15)
      const pu = Ty.stamp ? pushBeats(s, lead) : null;
      if (pu) out.push = { from: at(pu.from), at: at(pu.at), hold: at(pu.hold), back: at(pu.back) };
      // an excerpt that ends on this stamp: the camera stays pushed in to the end (no return, no move out)
      if (pu && eb !== null) out.push = { ...out.push, hold: s.end, back: Infinity, end: true };
      // the issue: the stamp's outline floods the frame into the print (film.js; lib/transitions shape-flood)
      if (s.issue === true) out.flood = { t0: out.stampT + FLOOD_AFTER_B * g.beat, dur: FLOOD_B * g.beat };
    }
    // the release entered from the final overview under the parallel rule (lib/transitions occluder-pass)
    if (ruleEntry(s, laid[i - 1])) out.rule = { t0: s.start - RULE_B * g.beat, dur: RULE_B * g.beat };
    if (s.type === 'release' && cue.url !== undefined && s.end - (cue.url + g.beat) < URL_HOLD_S - 1e-6) errors.push(`release: the URL is readable for only ${(s.end - cue.url - g.beat).toFixed(2)} s; timing.rules.js is out of step`);
    if (i > 0) out.sounds.push({ t: s.start - mIn * g.beat, kind: out.rule ? 'rule' : isOv(s) ? 'pullout' : isOv(laid[i - 1]) ? 'pushin' : 'move' });
    return out;
  });

  const sounds = scenes.flatMap((s) => s.sounds).sort((a, b) => a.t - b.t);
  return { g, duration: T.duration, scenes, sheetsTotal, errors, warnings, sounds, holdBeats: holdB, fitted: T };
};

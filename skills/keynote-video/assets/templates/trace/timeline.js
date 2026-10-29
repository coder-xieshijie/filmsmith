// timeline.js — the scene choreography on the film's clock. Picture (index.html) and sound (score.mjs) read it.
// Scene lengths come from lib/timing.js fit() with this mode's timing.rules.js; the beats each scene type lands
// on come from the same file's choreo, so the fitted length, the key events and the picture agree. Entrances
// are timed in beats from the scene start, exits back from its end; nothing is scaled to the scene's length.
// The first two steps each get a scene of their own (slow); the rest are compressed into one or two `loop` scenes.
import { grid } from './lib/beat.js';
import { fit } from './lib/timing.js';
import {
  rulesFor, sceneTiming, caps, phrasesOf, stepRanges, morphs, morphFrom, enterOf, enterVariant, pathCaps,
  CAP, FLIGHT, FUSE, EXIT, MORPH, PUSH, BIG, ENTER, REVEAL, SCRAMBLE,
} from './timing.rules.js';

export { FUSE };

export const plan = (content, run) => {
  const rules = rulesFor(run);
  const T = fit(content, rules);
  const g = grid({ bpm: T.bpm });
  const laid = T.scenes;
  const b = g.beat;
  const ranges = stepRanges(content.scenes, run.steps.length);
  const S = {
    T, g, laid, beat: b,
    hook: null, count: null, steps: [], loop: null, summary: null, probe: null, thesis: null, ending: null,
    captions: [], camera: [[0, 1, 960, 540, 'hold']], events: [], focus: [], windows: [],
  };
  laid.forEach((sc, i) => {
    const src = content.scenes[i];
    const B = (x) => sc.start + x * b;
    const { ch, cp } = sceneTiming(src, b, run, content.scenes, i);
    const pc = pathCaps(content.scenes, i);
    // the expressive transition this scene enters with: two beats straddling its first cut
    const enter = enterOf(content.scenes, i);
    if (enter) {
      const dur = ENTER[enter].beats * b, variant = enterVariant(content.scenes, i);
      S.windows.push({ name: enter, device: ENTER[enter].device, scene: i, t0: sc.start - dur / 2, dur, cut: sc.start, variant, mirror: variant === 'right to left' });
      S.events.push({ t: sc.start - dur / 2, kind: enter, dur });
    }
    // captions in sequence (timing.rules.js captionPlan): each a line of phrases; the last leaves before the scene's
    // exit, or rides the next scene's transition out (path-type carries it; under a sweep or a flow it is covered)
    const cap = () => {
      const cs = caps(src);
      cp.list.forEach((c, j) => {
        const last = j === cs.length - 1;
        const tout = !last ? sc.start + cp.list[j + 1].tin - CAP.gap : ch.winOut ? sc.end + 1 : sc.end - ch.exit - CAP.exit;
        const path = (j === 0 && pc.first) ? 'to' : (last && pc.last) ? 'from' : null;
        S.captions.push({
          // cut: a caption carried or covered by the next scene's transition is gone on its far side
          tin: sc.start + c.tin, tout, cut: last && ch.winOut ? sc.end : null, scene: i, path, plain: !!path,
          phrases: phrasesOf(cs[j]).map((raw, k) => ({ raw, tin: sc.start + c.phrases[k].tin, placed: c.phrases[k].tin === c.phrases[k].ready })),
        });
      });
    };
    switch (sc.type) {
      case 'hook': {
        S.hook = { t0: sc.start, rowsIn: ch.rowsIn.map(B), split: B(ch.split), strip: B(ch.strip) };
        // the bar counts in over a fixed number of beats, however many cells it has
        S.hook.stripDt = Math.min(0.03, (ch.countIn * b) / Math.max(1, run.hud0.b));
        S.hook.rowsIn.forEach((t) => S.events.push({ t, kind: 'tick' }));
        S.events.push({ t: S.hook.split, kind: 'split' });
        cap();
        S.focus.push([sc.start, { board: 1, bar: 1, hist: 0, rules: 0 }]);
        break;
      }
      case 'count': {
        // items[i]: the row lights and its first weight leaves; segLands: each segment's 90 % frame (the tick)
        S.count = { t0: sc.start, items: ch.items.map((x) => sc.start + x), segLands: ch.segLands.map((l) => l.map((x) => sc.start + x)) };
        S.count.segLands.flat().forEach((t) => S.events.push({ t, kind: 'tick' }));
        cap();
        S.focus.push([sc.start, { board: 1, bar: 0.45, hist: 1, rules: 0 }]);
        break;
      }
      case 'step': {
        const k = ranges[i].from;
        // the histogram regrows (a recount) unless the count of this very step came just before
        const st = { k, show: B(ch.fresh ? ch.pick - 1 : ch.pick - 0.5), regrow: ch.fresh, pick: B(ch.pick), hi: B(ch.hi), fuse: sc.start + ch.fuse, dur: ch.dur, rule: B(ch.rule), slow: true };
        S.steps[k] = st;
        S.events.push({ t: st.pick, kind: 'pop' }, { t: B(ch.contact), kind: 'fuse' } /* on the fuse's landing */, { t: st.rule, kind: 'tick' });
        cap();
        S.focus.push([sc.start, { board: 1, bar: 1, hist: 1, rules: 1 }]);
        break;
      }
      case 'loop': {
        const { from, to, dur } = ch;
        S.loop = S.loop ?? { t0: sc.start, from, to };
        S.loop.to = to;
        for (let k = from; k <= to; k++) {
          const j = k - from;
          const st = { k, show: B(ch.hi[j]), regrow: false, pick: B(ch.hi[j]), hi: B(ch.hi[j]), fuse: sc.start + ch.fuse[j], dur, rule: B(ch.rules[j]), slow: false };
          S.steps[k] = st;
          S.events.push({ t: B(ch.contacts[j]), kind: 'fuse', gain: ch.pace < 2 ? 0.7 : 0.8 }, { t: st.rule, kind: 'tick' });
        }
        cap();
        S.focus.push([sc.start, { board: 1, bar: 1, hist: 0, rules: 1 }]);
        break;
      }
      case 'summary': {
        // the count grows into the enlarged line (lands on beat 1) and shrinks back into it before the exit
        const end = sc.end - ch.winOut;
        S.summary = { t0: sc.start, big: sc.start + ch.bigStart, bigDur: BIG.dur, back: end - EXIT.big, backDur: EXIT.big, end };
        S.camera.push([B(ch.push), sc.zoom ?? 1.3, 820, 900, 'push', PUSH.dur]);
        // before a trace-flow the flow carries the frame back: the camera is home on the far side of the cut
        if (ch.flowOut) S.camera.push([sc.end, 1, 960, 540, 'return', 1e-3]);
        else S.camera.push([end - EXIT.camera, 1, 960, 540, 'return', EXIT.camera]);
        S.events.push({ t: B(ch.big), kind: 'chime', gain: 0.6 });
        cap();
        S.focus.push([sc.start, { board: 0, bar: 1, hist: 0, rules: 0 }]);
        break;
      }
      case 'probe': {
        const replay = ch.replay.map(B), reveal = B(ch.reveal);
        const out = sc.end - ch.exit; // the hand-off: camera returns, then the chips grow into the thesis
        S.probe = { t0: sc.start, rowIn: B(ch.rowIn), chipsIn: B(ch.chipsIn), scrambleDur: SCRAMBLE.beats * b, stagger: SCRAMBLE.stagger,
          replay, dur: ch.dur, reveal, dimAt: B(ch.dim), out, morph: sc.end - MORPH, end: sc.end };
        S.events.push({ t: S.probe.rowIn, kind: 'pop' }, { t: S.probe.chipsIn, kind: 'scramble', dur: ch.scrambleEnd - ch.chipsIn * b });
        ch.contacts.forEach((c) => S.events.push({ t: B(c), kind: 'fuse', gain: 0.75 }));
        S.events.push({ t: reveal, kind: 'chime' });
        // the flow at the reveal (REVEAL): a frame-level window like an entry's, its cut on the reveal beat; side A is
        // the probe held just before the reveal, side B the reveal held until it starts
        if (ch.flow) {
          const dur = 2 * ch.win * b;
          S.windows.push({ name: ch.flow, device: REVEAL[ch.flow].device, scene: i, t0: reveal - dur / 2, dur, cut: reveal, variant: REVEAL[ch.flow].variant, mirror: false });
          S.events.push({ t: reveal - dur / 2, kind: ch.flow, dur });
        }
        S.camera.push([B(ch.pushAt), 1.06, 960, 540, 'push', PUSH.dur], [out, 1, 960, 540, 'return', EXIT.camera]);
        cap();
        S.focus.push([sc.start, { board: 0.3, bar: 0.5, hist: 0, rules: 1 }]);
        break;
      }
      case 'thesis': {
        const morphed = morphs(content.scenes, i, run);
        // from: 'probe' (the probe's result chips) or 'board' (the last step's first fused chip, 2026-10-19)
        const from = morphFrom(content.scenes, i, run);
        S.thesis = { t0: sc.start, morphed, from, morphAt: sc.start - MORPH, lines: ch.lines.map(B), stats: ch.stats.map(B) };
        // the felt-keys chord sounds as the claim lands (the first line, on the thesis's bar line)
        S.events.push({ t: morphed ? sc.start : B(ch.lines[0] ?? 0), kind: 'chord' });
        // the regions leave as the hand-off starts (or at the cut when there is none)
        S.focus.push([morphed ? sc.start - MORPH : sc.start, { board: 0, bar: 0.5, hist: 0, rules: 0 }]);
        // closing move: the dimmed token bar lights up again, landing on the last downbeat (principle 4, B4)
        S.ending = { t: T.duration - g.bar };
        break;
      }
      default:
        throw new Error(`unknown scene type ${sc.type}`);
    }
  });
  // a path window carries the last caption of the scene before it and brings in the first caption of its own scene
  for (const w of S.windows.filter((x) => x.name === 'path')) {
    w.from = S.captions.findLastIndex((c) => c.scene === w.scene - 1);
    w.to = S.captions.findIndex((c) => c.scene === w.scene);
  }
  S.events.sort((x, y) => x.t - y.t);
  S.FLIGHT = FLIGHT;
  S.EXIT = EXIT;
  return S;
};

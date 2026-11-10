// sched.js — every stream scene's choreography as times in seconds from the scene's start. Pure (no DOM), so the rules
// (scene lengths), the engine (the picture) and the sound read the same table and cannot drift.
// Copied from the stream template's sched.js; changed: reading through text.js readSec (the library's readTime), and
// only the primary texts are read.
//
// Reading (the rule set by the films' reviewer: liveliness before reading every word; readability guards only the key
// sentences): a text is either primary or a glance. A primary text holds for its reading time (readSec: Chinese 6
// characters a second + 0.5 s, English 0.3 s a word; 1 s at least). At most one primary sentence is on screen at a
// time: a scene's chapter caption, or its claim where the scene has one (open: the note and the freeze line; intro: the
// two lines, one after the other; constellation: the result, which shares the screen with the second caption; close:
// the claim and its words). Everything else (task
// rows, file chips, progress lines, tabs, dialog text, the bubbles around a caption, card rows, labels) is a glance: a
// fixed short hold, GLANCE s, or `glance` (s) on the scene or the film. `holds` on a scene ({ key: seconds, or an
// array per item }) overrides the reading or the glance of any named text; the keys are the slot names (and, for a
// group's own caption, `choiceCaption`, `followUpCaption`, `graphCaption`, `graphCaption2`), listed in each scene's card.

import { readSec } from './text.js';
import { copiesOf } from '../desk-pile/pile.js';

const R = (text, lang) => readSec(text, lang);
const snap = (t, B) => Math.ceil(t / B - 1e-6) * B; // next beat
const BUBBLE_IN = 0.3; // a bubble is readable this long after it starts entering
export const GLANCE = 0.8; // a glance's hold (s)
export const answerOf = (c) => c.answer || `${'ABCD'[c.pick ?? 0]}: ${c.options?.[c.pick ?? 0]?.label ?? ''}`;

// read(key, text, i): a primary text's hold; glance(key, text, i): a glance's (0 for no text); either overridden by
// holds[key] (a number, or an array indexed by i); time(key, default): a named timing (a gap between items, a
// stretch of motion), holds[key] seconds or the default
const reader = (s, lang, content) => {
  const g = Number.isFinite(s.glance) ? s.glance : Number.isFinite(content?.glance) ? content.glance : GLANCE;
  const held = (key, i) => { const v = s.holds?.[key]; const x = Array.isArray(v) ? v[i ?? 0] : v; return Number.isFinite(x) ? x : null; };
  const has = (t) => (Array.isArray(t) ? t.some(Boolean) : !!t);
  return {
    read: (key, text, i) => held(key, i) ?? R(text, lang),
    glance: (key, text, i) => held(key, i) ?? (has(text) ? g : 0),
    // a timing (a gap, a stretch) the scene names in its card: holds[key] in seconds, else the default
    time: (key, def) => held(key) ?? def,
    g,
  };
};

export const SCHED = {
  // 0 · scattered → threaded: windows and alerts pile up, freeze, the mascot drops in, one thread pierces every
  // item, pulls them in, the day sinks into the night and the thread straightens into the spine.
  // Primary: the note, the freeze line.
  open(s, B, lang, content) {
    const { read, time } = reader(s, lang, content);
    const n = s.sessions.length, m = s.alerts.length;
    const win = Array.from({ length: n }, (_, i) => (0.5 + i) * B);
    const alert = Array.from({ length: m }, (_, i) => (n + 0.5 + i * 0.5) * B);
    const note = (n + 0.5 + m * 0.5) * B;
    const noteR = read('note', s.note);
    const noteRead = note + 0.4 + noteR;
    const cs = snap(note + 0.4 + 0.55 * noteR, B); // copies pile up while the note is still read (the cascade keeps clear of it)
    const cascade = []; let t = cs;
    for (let k = 0; k < copiesOf(s); k++) { cascade.push(t); t += Math.max(0.1, 0.36 * Math.pow(0.84, k)); }
    const click = cs + 0.45;
    const fz = snap(Math.max(t + 0.2, noteRead), B); // freeze
    const fzRead = fz + 0.45 + read('freeze', s.freeze) + 0.3;
    const drop = snap(fzRead, B), land = drop + 0.5;
    const th0 = land + 0.4 * B, th1 = th0 + 3.5 * B; // the thread's head runs through every item
    // holds `reel` (s, from taut to reeled in) and `sink` (s, the emptied day sinking into the night) stretch the two moves
    const tug = th1 + 0.1, tugEnd = th1 + time('reel', 2.5 * B); // reeled in along the thread
    const sink0 = tugEnd - 0.5 * B, sink1 = sink0 + time('sink', 2.75 * B); // the emptied day sinks into the night
    const dur = sink1 + 0.5 * B;
    const cues = [
      ...win.map((x, i) => ({ t: x, kind: 'pop', i })), ...alert.map((x, i) => ({ t: x, kind: 'notify', i })),
      { t: note, kind: 'stick' }, ...cascade.map((x, i) => ({ t: x, kind: 'pile', i })), { t: click, kind: 'click' },
      { t: fz, kind: 'freeze' }, { t: drop, kind: 'fall', dur: 0.5 }, { t: land, kind: 'land' },
      { t: th0, kind: 'riser', dur: th1 - th0 }, { t: th1, kind: 'hit' }, { t: tug, kind: 'pull', dur: tugEnd - tug },
      { t: tugEnd, kind: 'thud' }, { t: sink0, kind: 'sink', dur: sink1 - sink0 }, { t: sink1, kind: 'settle' },
    ];
    const music = [
      { at: 0, kind: 'build', energy: 0.4 }, { at: cs, kind: 'build', energy: 0.62 }, { at: fz, kind: 'break', energy: 0.12 },
      { at: drop, kind: 'build', energy: 0.55 }, { at: th1, kind: 'drop', energy: 0.8 }, { at: tugEnd, kind: 'intro', energy: 0.3 },
    ];
    return { dur, win, alert, note, noteRead, cs, cascade, click, fz, fzRead, drop, land, th0, th1, tug, tugEnd, sink0, sink1, cues, music, peak: { t: th1, kind: 'hook' } };
  },

  // 1 · the mascot names itself; the first block unfolds from the thread; two lines from the product.
  // Primary: the two lines. Glance: the title and role.
  intro(s, B, lang, content) {
    const { read, glance } = reader(s, lang, content);
    const name = 0, card = 0.2 * B, b1 = 1.1 * B;
    const b2 = b1 + BUBBLE_IN + read('lines', s.lines[0], 0);
    // optional: the product's name large and who it is (`title`, `role`) on the right, entering 0.9 beat in
    const hero = 0.9 * B, heroRead = s.title || s.role ? hero + 0.6 + glance('role', [s.title, s.role]) + 0.4 : 0;
    const dur = snap(Math.max(b2 + BUBBLE_IN + read('lines', s.lines[1], 1) + 0.4, heroRead), B);
    return { dur, name, card, hero, bubbles: [b1, b2], cues: [{ t: card, kind: 'unfold' }, { t: b1, kind: 'pop', i: 0 }, { t: b2, kind: 'pop', i: 1 }], music: [{ at: 0, kind: 'intro', energy: 0.32, reading: true }] };
  },

  // 2 · one ask → one task hung on the thread → it finishes and shrinks into a star.
  // Primary: the caption (and the choice's caption). Glance: the ask, the reply, the chip, the task's lines, the
  // question card, the answer.
  ask(s, B, lang, content) {
    const { read, glance, time } = reader(s, lang, content);
    // optional image (`image`): it flies in on the right (lands 1 beat in), the ask follows it, and it shrinks into the
    // chat as the ask's thumbnail as the ask is sent; holds `image` (s after it lands) keeps the large card up beside the
    // block instead (it rises to clear the task row), until the choice's card or the scene's end
    const img = s.image ? 0.1 * B : null, imgLand = s.image ? 1.0 * B : null;
    const cap = 0, user = s.image ? imgLand + 0.6 * B : 0.6 * B;
    const reply = user + BUBBLE_IN + glance('ask', s.ask);
    const chip = reply + BUBBLE_IN + glance('reply', s.reply);
    const row = chip + 0.15;
    const done = row + Math.max(1.5 * B, 0.3 + glance('task', s.task.title) + 0.2); // "running" is a glance
    const launch = done + 0.3 + glance('done', s.task.done);
    let end = Math.max(launch + 1.0, cap + read('caption', s.caption) + 0.6);
    // optional choice (`choice`): when the product needs a decision it asks with a recommendation: a sub-caption, a
    // question card with options (the recommended one tagged), the cursor picks it, the card folds into the chat as the
    // user's answer
    let ch = null;
    if (s.choice) {
      const c = s.choice, opts = c.options || [];
      const cc = launch + 0.4, card = cc + 0.5 * B;
      const cur = card + 0.4 + Math.max(1.5 * B, glance('choice', c.question)), sel = cur + 0.7, fold = sel + 0.6 * B, answer = fold + 0.25;
      ch = { cap: cc, card, opts: opts.map((_, i) => card + 0.1 + i * 0.16), cur, sel, fold, answer };
      end = Math.max(end, answer + BUBBLE_IN + glance('answer', answerOf(c)) + 0.3, cc + read('choiceCaption', c.caption) + 0.6);
    }
    const imgHeld = s.image ? time('image', null) : null;
    const imgYield = !s.image ? null : imgHeld == null ? user - 0.2 // the image shrinks into the ask as it is sent
      : Math.max(user - 0.2, Math.min(imgLand + imgHeld, (ch ? ch.card : snap(end, B)) - 0.5));
    return {
      dur: snap(end, B), cap, user, reply, chip, row, done, launch, img, imgLand, imgYield, imgHeld: imgHeld != null, ch,
      cues: [...(s.image ? [{ t: img, kind: 'fall', dur: imgLand - img }, { t: imgLand, kind: 'land' }] : []), { t: user, kind: 'send' }, { t: reply, kind: 'pop', i: 1 }, { t: chip, kind: 'tick' }, { t: row, kind: 'unfold' }, { t: done, kind: 'done' }, { t: launch, kind: 'launch', i: 0 },
        ...(ch ? [{ t: ch.card, kind: 'unfold' }, { t: ch.sel, kind: 'click' }, { t: ch.fold, kind: 'fold' }, { t: ch.answer, kind: 'send' }] : [])],
      music: [{ at: 0, kind: 'build', energy: 0.45, reading: true }],
    };
  },

  // 3 · one evening: the block sinks and grows a task list; every ask launches a star; then a burst.
  // Primary: the caption (and the follow-up's caption). Glance: everything in the chat and the list.
  evening(s, B, lang, content) {
    const { read, glance, time } = reader(s, lang, content);
    const cap = 0, grow = 0.2 * B, n = s.asks.length;
    // holds `askGap` (s between two asks) and `burstGap` (s between two of the unnamed tasks) set the pace of the list
    const step = time('askGap', Math.max(0.75 * B, 0.5)), bstep = time('burstGap', 0.2);
    const f = s.followUp, after = f && Number.isInteger(f.after) ? Math.min(n - 1, Math.max(f.to ?? 0, f.after)) : null;
    // optional follow-up (`followUp`): a sub-caption, a quoted addition in the chat, sent along a beam to the star of
    // the task it adds to (`to`), which flares and is tagged; the list finds that row. After the burst by default; with
    // `after` (an ask's index) it takes the slot after that ask and the asks after it wait one slot, while its beam flies
    const fuMsg = after == null ? null : Math.max(1.8 * B + (after + 1) * step, cap + read('caption', s.caption) + 0.2 + 0.6 * B);
    const asks = Array.from({ length: n }, (_, i) => (after != null && i > after ? fuMsg + (i - after) * step : 1.8 * B + i * step));
    const burst0 = asks[n - 1] + 1.2 * B;
    const burst = Array.from({ length: s.more }, (_, i) => burst0 + i * bstep);
    const count = (burst.length ? burst[burst.length - 1] : asks[n - 1] + 0.35 * B) + 0.3;
    let end = Math.max(count + 0.4 + 1.2, cap + read('caption', s.caption) + 0.6);
    let fu = null;
    if (f) {
      const c2 = after == null ? count + 0.3 : fuMsg - 0.6 * B, msg = after == null ? c2 + 0.6 * B : fuMsg, beam = msg + BUBBLE_IN + glance('followUp', [f.quote, f.text]);
      fu = { cap: c2, msg, beam, tag: beam + 0.4, after, free: beam + 0.4 + glance('tag', f.tag || 'tag') + 0.6 };
      end = Math.max(end, fu.free, c2 + read('followUpCaption', f.caption) + 0.6);
    }
    return {
      dur: snap(end, B), cap, grow, asks, burst, count, fu,
      cues: [{ t: grow, kind: 'sweep' }, ...asks.map((x, i) => ({ t: x + 0.35 * B, kind: 'launch', i: i + 1 })), ...burst.map((x, i) => ({ t: x, kind: 'spark', i })), { t: count, kind: 'tick' },
        ...(fu ? [{ t: fu.msg, kind: 'send' }, { t: fu.beam, kind: 'return', i: 0 }] : [])],
      music: [{ at: 0, kind: 'drop', energy: 0.7 }],
    };
  },

  // 4 · a job that keeps going: a workspace, jobs launched as a constellation, results flowing back along the
  // beams, the plan joins them (the second peak), one answer comes back into the chat.
  // Primary: the caption, the result. Glance: the ask, the offer, the yes, the dialog, the labels, the second caption
  // (it shares the screen with the result).
  constellation(s, B, lang, content) {
    const { read, glance } = reader(s, lang, content);
    const cap = 0, back = 0.1 * B, user = 1.2 * B;
    const offer = user + BUBBLE_IN + glance('ask', s.ask);
    const yes = offer + BUBBLE_IN + glance('offer', s.offer);
    // optional modal (`modal`): the new-workspace dialog opens after the yes and folds into the workspace's name
    const modal = s.modal ? yes + 0.3 * B : null;
    const ws = s.modal ? modal + 0.4 + Math.max(1.5 * B, glance('modal', s.modal.title)) : yes + 0.3 * B; // the caption stays up until the second one
    const jobs = s.jobs.map((_, k) => ws + 1 * B + k * 0.5 * B);
    const plan = jobs[jobs.length - 1] + 0.5 * B;
    const ret = s.jobs.map((_, k) => plan + 1.5 * B + k * 0.5 * B);
    const link = snap(ret[ret.length - 1] + 0.7, B);
    const cap2 = link + 0.4;
    const result = link + 0.75 * B;
    const end = Math.max(result + BUBBLE_IN + read('result', s.result) + 0.5, cap2 + glance('caption2', s.caption2) + 0.5);
    return {
      dur: snap(end, B), cap, back, user, offer, yes, modal, ws, jobs, plan, ret, link, cap2, result,
      cues: [{ t: user, kind: 'send' }, { t: offer, kind: 'pop', i: 0 }, { t: yes, kind: 'send' }, ...(modal != null ? [{ t: modal, kind: 'unfold' }] : []), { t: ws, kind: 'thud' },
        ...jobs.map((x, i) => ({ t: x, kind: 'launch', i: i + 2 })), { t: plan, kind: 'queue' }, ...ret.map((x, i) => ({ t: x, kind: 'return', i })),
        { t: link - 1.2, kind: 'riser', dur: 1.2 }, { t: link, kind: 'hit' }, { t: result, kind: 'pop', i: 2 }],
      music: [{ at: 0, kind: 'build', energy: 0.5, reading: true }, { at: link, kind: 'drop', energy: 0.95 }, { at: result, kind: 'build', energy: 0.55, reading: true }],
      peak: { t: link, kind: 'reveal' },
    };
  },

  // 5 · the check gate: the plan is stopped once, sent back, reworked, passes.
  // Primary: the caption (and the graph's two captions, one after the other). Glance: the fail and pass lines, the
  // explanation, the arcs' names and the return.
  verify(s, B, lang, content) {
    const { read, glance } = reader(s, lang, content);
    const cap = 0, gate = 0.5 * B, go1 = 1.5 * B, hit = go1 + 1.0 * B;
    const failRead = hit + 0.3 + glance('fail', s.fail);
    // optional: the product says why it was sent back (`explain`, a bubble in the chat) while it is reworked
    const explain = s.explain ? hit + 0.5 : null;
    const rework = s.explain ? Math.max(failRead, explain + BUBBLE_IN + glance('explain', s.explain)) : failRead;
    const go2 = rework + 1.5 * B, pass = go2 + 1.0 * B;
    const passRead = pass + 0.3 + glance('pass', s.pass);
    const fold = passRead + 0.2;
    let end = Math.max(fold + 0.7 * B, cap + read('caption', s.caption) + 0.6);
    // optional relation graph (`graph`): a caption, arcs from the thread to one node, each named (what the product does
    // to a task), then one thick arc back (the one thing the task does) with the second caption
    let gr = null;
    if (s.graph) {
      const g = s.graph, outs = g.outs || [], g0 = fold + 0.4 * B, node = g0 + 0.15, arc0 = g0 + 0.6 * B;
      const arcs = outs.map((_, i) => arc0 + i * 0.5 * B), ret = Math.max(arcs.at(-1) + 0.6 * B, g0 + read('graphCaption', g.caption) + 0.4, arc0 + glance('outs', outs));
      const out = ret + 0.3 + Math.max(read('graphCaption2', g.caption2), glance('back', g.back));
      gr = { cap: g0, node, arcs, ret, cap2: ret, out };
      end = out + 0.3;
    }
    return {
      dur: snap(end, B), cap, gate, go1, hit, explain, rework, go2, pass, fold, gr,
      cues: [{ t: gate, kind: 'rise' }, { t: go1, kind: 'slide' }, { t: hit, kind: 'stamp' }, ...(explain != null ? [{ t: explain, kind: 'pop', i: 3 }] : []), { t: rework, kind: 'tick' }, { t: go2, kind: 'slide' }, { t: pass, kind: 'chime' }, { t: fold, kind: 'fold' },
        ...(gr ? [...gr.arcs.map((x, i) => ({ t: x, kind: 'pluck', i })), { t: gr.ret, kind: 'return', i: 1 }] : [])],
      music: [{ at: 0, kind: 'build', energy: 0.55 }],
    };
  },

  // 6 · three cards, whole–part–whole: the thread forks into three strands, each ends in a card; each card is
  // enlarged in turn with its text; then the three again.
  // Primary: the caption, each card's `say` while it is open, the second caption. Glance: the cards' titles and rows, the
  // flowed line, the new task.
  cards(s, B, lang, content) {
    const { read, glance } = reader(s, lang, content);
    // optional tangle (`tangle`): first the earlier tasks' beams light again, knot into a tangle, the thread finds the
    // loose end and pulls it straight into three strands (6 beats), then the cards land as usual
    const tg = s.tangle ? { relight: 0.2 * B, knot0: 1.2 * B, knot1: 2.4 * B, reach: 2.4 * B, pull0: 3.0 * B, pull1: 5.6 * B } : null;
    const cap = 0, fork = (tg ? 6 * B : 0) + 0.4 * B;
    const land = s.cards.map((_, k) => fork + (1 + k * 0.5) * B);
    // whole: the titles are glanced as the cards land; the caption is read
    const allRead = Math.max(land[land.length - 1] + 0.4 + glance('cards', s.cards.map((c) => c.title)), cap + read('caption', s.caption) + 0.3);
    const zoom = [];
    let t = snap(allRead, B);
    s.cards.forEach((c, k) => { // part: each card opens in turn, straight from the previous one
      const z0 = t, rows = c.rows.map((_, j) => z0 + 0.6 * B + j * 0.4 * B);
      let z1 = rows[rows.length - 1] + 0.3 + glance('rows', c.rows, k);
      // optional per card: a caption while it is open (`say`), a line that flows along the strand into it and becomes
      // its last row (`flow`), a new task that starts by reading it and leaves as a star (`task`)
      if (c.say) z1 = Math.max(z1, z0 + 0.3 + read('say', c.say, k));
      let flow = null, task = null;
      // both start once the card's rows are in, while they are still read
      const after = rows[rows.length - 1] + 0.5;
      if (c.flow) { flow = { t0: after, t1: after + 0.9 }; z1 = Math.max(z1, flow.t1 + 0.3 + glance('flow', c.flow, k)); }
      if (c.task) { const r0 = (flow ? flow.t1 : after) + 0.1, done = r0 + 0.4 + glance('task', c.task.title, k) + 0.3; task = { row: r0, launch: done + 0.3 }; z1 = Math.max(z1, task.launch + 0.5); }
      zoom.push({ z0, rows, z1, flow, task });
      t = snap(z1, B);
    });
    const whole = t, cap2 = whole + 0.6 * B;
    const end = cap2 + read('caption2', s.caption2) + 0.6;
    return {
      dur: snap(end, B), cap, fork, land, zoom, whole, cap2, tg,
      cues: [...(tg ? [{ t: tg.relight, kind: 'sweep' }, { t: tg.pull0, kind: 'pull', dur: tg.pull1 - tg.pull0 }] : []), { t: fork, kind: 'sweep' }, ...land.map((x, i) => ({ t: x, kind: 'pluck', i })), ...zoom.flatMap((z, k) => [{ t: z.z0, kind: 'zoom', i: k }, ...z.rows.map((x, j) => ({ t: x, kind: 'tick', i: j })), { t: z.z1 + 0.2, kind: 'unzoom' }]), { t: whole, kind: 'chime' }],
      music: [{ at: 0, kind: 'break', energy: 0.4, reading: true }, { at: whole, kind: 'build', energy: 0.5 }],
    };
  },

  // 6b · (optional) days go on: a chat window unfolds from the thread and days scroll past in it (a divider, an ask, an
  // answer each, read at a glance); the next day's question and the product's answer, written from what it kept; the
  // progress flows back along the strands to the mascot; three short lines hang on the cards.
  // Primary: the caption (one sentence a screen: today's answer shares it, so it is a glance). Glance: the sub-line,
  // the days, today's ask and answer, the three lines.
  days(s, B, lang, content) {
    const { read, glance, time } = reader(s, lang, content);
    // holds `dayGap` (s between two days) and `noteGap` (s between two of the lines) set the pace; with `summary` the
    // days are in the window at once and scroll by in one move (dayGap 0), and the cards fold into one summary card
    const cap = 0, win = 0.2 * B, s0 = win + 0.6 * B, n = (s.days || []).length;
    const gap = time('dayGap', s.summary ? 0 : 0.45), ngap = time('noteGap', 0.5 * B);
    const day = Array.from({ length: n }, (_, i) => s0 + i * gap);
    const ask = s.summary && !s.holds?.dayGap ? s0 + 0.6 + 0.3 : s0 + n * gap + 0.3, answer = ask + BUBBLE_IN + glance('ask', s.ask);
    const beads = answer + 0.3;
    const ansR = glance('answer', s.answer);
    const notes = (s.notes || []).map((_, i) => answer + BUBBLE_IN + 0.5 * ansR + i * ngap);
    const done = Math.max(answer + BUBBLE_IN + ansR, (notes.at(-1) ?? answer) + 0.4 + glance('notes', s.notes || []), cap + read('caption', s.caption) + 0.6);
    const fold = done + 0.2, dur = snap(fold + 0.6, B);
    return {
      dur, cap, win, day, ask, answer, beads, notes, fold, summary: !!s.summary,
      cues: [{ t: win, kind: 'unfold' }, ...day.map((x, i) => ({ t: x, kind: 'pop', i })), { t: ask, kind: 'send' }, { t: answer, kind: 'pop', i: 9 }, { t: beads, kind: 'return', i: 2 }, ...notes.map((x, i) => ({ t: x, kind: 'pluck', i })), { t: fold, kind: 'fold' }],
      music: [{ at: 0, kind: 'build', energy: 0.5, reading: true }],
    };
  },

  // 7 · one thread gathers everything: the spine retracts, the thread sweeps the sky in three passes catching
  // every star, straightens, the stars flow into one point, which opens as the task panel (the climax); one
  // "needs you"; the thread lies flat as the claim's baseline; then it is wound back into the mascot.
  // Primary: the caption, then the claim with its words. Glance: the panel's rows, the nudge.
  close(s, B, lang, content) {
    const { read, glance, time } = reader(s, lang, content);
    const r0 = 0.1 * B, gA = 0.9 * B, gB = 4.6 * B, flowA = 5.0 * B, flowB = 6.9 * B, unfold = 7.0 * B;
    const cap = unfold + 0.4 * B;
    // holds `need` (s from the panel opening to its one "needs you") keeps the panel still before the alert
    const need = unfold + time('need', 1.4 * B);
    const nudge = need + 0.6 * B;
    // optional second chapter line (`caption2`) after the alert, once the first is read
    const cap2 = s.caption2 ? Math.max(need + 0.3, cap + read('caption', s.caption) + 0.2) : null;
    const panelRead = Math.max(cap + read('caption', s.caption), nudge + BUBBLE_IN + glance('nudge', s.nudge), need + glance('panel', s.panel.rows[0].title), cap2 != null ? cap2 + read('caption2', s.caption2) : 0) + 0.4;
    const recede = snap(panelRead, B), lay = recede + 1.0 * B;
    const claim = lay + 0.4 * B;
    const words = s.words.map((_, k) => claim + 0.6 * B + k * 0.75 * B);
    const claimRead = words[words.length - 1] + 0.4 + read('claim', [s.claim, ...s.words]) * 0.7;
    const con0 = snap(claimRead, B), con1 = con0 + 1.2 * B;
    const dur = con1 + 0.3 * B;
    return {
      dur, r0, gA, gB, flowA, flowB, unfold, cap, cap2, need, nudge, recede, lay, claim, words, con0, con1,
      cues: [{ t: r0, kind: 'sweep' }, { t: gA, kind: 'riser', dur: gB - gA }, { t: flowA, kind: 'pull', dur: flowB - flowA }, { t: unfold - 0.8, kind: 'riser', dur: 0.8 },
        { t: unfold, kind: 'hit' }, { t: need, kind: 'alert' }, { t: recede, kind: 'fold' }, { t: claim, kind: 'impact' }, ...words.map((x, i) => ({ t: x, kind: 'word', i })), { t: con0, kind: 'fold' }],
      music: [{ at: 0, kind: 'build', energy: 0.65 }, { at: unfold, kind: 'drop', energy: 0.85 }, { at: recede, kind: 'build', energy: 0.55, reading: true }],
      peak: { t: unfold, kind: 'reveal', climax: true },
    };
  },

  // 8 · lock-up: 'name' — the thread winds into a point at the centre and the name opens out of it;
  //               'mascot' — the name opens and the mascot hops onto the end of the wordmark.
  lockup(s, B, lang, content) {
    const move = 0, open = 1.0 * B, tag = open + 1.2 * B, hop = open + 0.9 * B;
    const { read: rd } = reader(s, lang, content); // Primary: the name and tagline together (key `name`).
    const read = tag + 0.4 + rd('name', [content.product.name, content.product.tagline]);
    const dur = snap(Math.max(read + 0.8, tag + 6.2), B); // a closing line holds ≥ 6 s (hyperframes check)
    return {
      dur, move, open, tag, hop,
      cues: [{ t: move, kind: 'pull', dur: open - move }, { t: open, kind: 'hit' }, { t: content.lockup === 'mascot' ? hop + 0.5 : tag, kind: 'land' }, { t: tag, kind: 'chime' }],
      music: [{ at: 0, kind: 'outro', energy: 0.5 }],
      peak: { t: open, kind: 'lockup' },
    };
  },
};

export const schedule = (s, B, lang, content) => SCHED[s.type](s, B, lang, content);

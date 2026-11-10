// sched.js — every scene's choreography as times in seconds from the scene's start. Pure (no DOM), so
// timing.rules.js (scene lengths), film.js (the picture) and score.mjs (the sound) read the same table and
// cannot drift. Each schedule returns { dur, ...named times, cues: [{ t, kind, ... }] }.
// Reading holds come from lang.js readSec(): English by word, Chinese by character.

import { readSec } from './lang.js';

const R = (text, lang) => readSec(text, lang);
const snap = (t, B) => Math.ceil(t / B - 1e-6) * B; // next beat
const BUBBLE_IN = 0.3; // a bubble is readable this long after it starts entering

export const SCHED = {
  // 0 · scattered → threaded: windows and alerts pile up, freeze, the mascot drops in, one thread pierces every
  // item, pulls them in, the day sinks into the night and the thread straightens into the spine.
  open(s, B, lang) {
    const n = s.sessions.length, m = s.alerts.length;
    const win = Array.from({ length: n }, (_, i) => (0.5 + i) * B);
    const alert = Array.from({ length: m }, (_, i) => (n + 0.5 + i * 0.5) * B);
    const note = (n + 0.5 + m * 0.5) * B;
    const noteRead = note + 0.4 + R(s.note, lang);
    const cs = snap(note + 0.4 + 0.55 * R(s.note, lang), B); // copies pile up while the note is still read (the cascade keeps clear of it)
    const cascade = []; let t = cs;
    for (let k = 0; k < 14; k++) { cascade.push(t); t += Math.max(0.1, 0.36 * Math.pow(0.84, k)); }
    const click = cs + 0.45;
    const fz = snap(Math.max(t + 0.2, noteRead), B); // freeze
    const fzRead = fz + 0.45 + R(s.freeze, lang) + 0.3;
    const drop = snap(fzRead, B), land = drop + 0.5;
    const th0 = land + 0.4 * B, th1 = th0 + 3.5 * B; // the thread's head runs through every item
    const tug = th1 + 0.1, tugEnd = th1 + 2.5 * B; // reeled in along the thread
    const sink0 = tugEnd - 0.5 * B, sink1 = sink0 + 2.75 * B; // the emptied day sinks into the night
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
  intro(s, B, lang) {
    const name = 0, card = 0.2 * B, b1 = 1.1 * B;
    const b2 = b1 + BUBBLE_IN + R(s.lines[0], lang);
    const dur = snap(b2 + BUBBLE_IN + R(s.lines[1], lang) + 0.4, B);
    return { dur, name, card, bubbles: [b1, b2], cues: [{ t: card, kind: 'unfold' }, { t: b1, kind: 'pop', i: 0 }, { t: b2, kind: 'pop', i: 1 }], music: [{ at: 0, kind: 'intro', energy: 0.32, reading: true }] };
  },

  // 2 · one ask → one task hung on the thread → it finishes and shrinks into a star.
  ask(s, B, lang) {
    const cap = 0, user = 0.6 * B;
    const reply = user + BUBBLE_IN + R(s.ask, lang);
    const chip = reply + BUBBLE_IN + 0.5 * R(s.reply, lang); // the chip is a glance under the reply
    const row = chip + 0.15;
    const done = row + Math.max(1.5 * B, 0.3 + R(s.task.title, lang) + 0.4); // "running" is a glance
    const launch = done + 0.3 + R(s.task.done, lang);
    const end = Math.max(launch + 1.0, cap + R(s.caption, lang) + 0.6, reply + BUBBLE_IN + R(s.reply, lang) + 0.5);
    return {
      dur: snap(end, B), cap, user, reply, chip, row, done, launch,
      cues: [{ t: user, kind: 'send' }, { t: reply, kind: 'pop', i: 1 }, { t: chip, kind: 'tick' }, { t: row, kind: 'unfold' }, { t: done, kind: 'done' }, { t: launch, kind: 'launch', i: 0 }],
      music: [{ at: 0, kind: 'build', energy: 0.45, reading: true }],
    };
  },

  // 3 · one evening: the block sinks and grows a task list; every ask launches a star; then a burst.
  evening(s, B, lang) {
    const cap = 0, grow = 0.2 * B, n = s.asks.length;
    const step = Math.max(0.75 * B, 0.5);
    const asks = Array.from({ length: n }, (_, i) => 1.8 * B + i * step);
    const burst0 = asks[n - 1] + 1.2 * B;
    const burst = Array.from({ length: s.more }, (_, i) => burst0 + i * 0.2);
    const count = burst[burst.length - 1] + 0.3;
    const end = Math.max(count + 0.4 + 1.2, cap + R(s.caption, lang) + 0.6);
    return {
      dur: snap(end, B), cap, grow, asks, burst, count,
      cues: [{ t: grow, kind: 'sweep' }, ...asks.map((x, i) => ({ t: x + 0.35 * B, kind: 'launch', i: i + 1 })), ...burst.map((x, i) => ({ t: x, kind: 'spark', i })), { t: count, kind: 'tick' }],
      music: [{ at: 0, kind: 'drop', energy: 0.7 }],
    };
  },

  // 4 · a job that keeps going: a workspace, jobs launched as a constellation, results flowing back along the
  // beams, the plan joins them (the second peak), one answer comes back into the chat.
  constellation(s, B, lang) {
    const cap = 0, back = 0.1 * B, user = 1.2 * B;
    const offer = user + BUBBLE_IN + R(s.ask, lang);
    const yes = offer + BUBBLE_IN + R(s.offer, lang);
    const ws = yes + 0.3 * B;
    const jobs = s.jobs.map((_, k) => ws + 1 * B + k * 0.5 * B);
    const plan = jobs[jobs.length - 1] + 0.5 * B;
    const ret = s.jobs.map((_, k) => plan + 1.5 * B + k * 0.5 * B);
    const link = snap(ret[ret.length - 1] + 0.7, B);
    const cap2 = link + 0.4;
    const result = link + 0.75 * B;
    const end = Math.max(result + BUBBLE_IN + R(s.result, lang) + 0.5, cap2 + R(s.caption2, lang) + 0.5);
    return {
      dur: snap(end, B), cap, back, user, offer, yes, ws, jobs, plan, ret, link, cap2, result,
      cues: [{ t: user, kind: 'send' }, { t: offer, kind: 'pop', i: 0 }, { t: yes, kind: 'send' }, { t: ws, kind: 'thud' },
        ...jobs.map((x, i) => ({ t: x, kind: 'launch', i: i + 2 })), { t: plan, kind: 'queue' }, ...ret.map((x, i) => ({ t: x, kind: 'return', i })),
        { t: link - 1.2, kind: 'riser', dur: 1.2 }, { t: link, kind: 'hit' }, { t: result, kind: 'pop', i: 2 }],
      music: [{ at: 0, kind: 'build', energy: 0.5, reading: true }, { at: link, kind: 'drop', energy: 0.95 }, { at: result, kind: 'build', energy: 0.55, reading: true }],
      peak: { t: link, kind: 'reveal' },
    };
  },

  // 5 · the check gate: the plan is stopped once, sent back, reworked, passes.
  verify(s, B, lang) {
    const cap = 0, gate = 0.5 * B, go1 = 1.5 * B, hit = go1 + 1.0 * B;
    const failRead = hit + 0.3 + R(s.fail, lang);
    const rework = failRead;
    const go2 = rework + 1.5 * B, pass = go2 + 1.0 * B;
    const passRead = pass + 0.3 + R(s.pass, lang);
    const fold = passRead + 0.2;
    const end = Math.max(fold + 0.7 * B, cap + R(s.caption, lang) + 0.6);
    return {
      dur: snap(end, B), cap, gate, go1, hit, rework, go2, pass, fold,
      cues: [{ t: gate, kind: 'rise' }, { t: go1, kind: 'slide' }, { t: hit, kind: 'stamp' }, { t: rework, kind: 'tick' }, { t: go2, kind: 'slide' }, { t: pass, kind: 'chime' }, { t: fold, kind: 'fold' }],
      music: [{ at: 0, kind: 'build', energy: 0.55 }],
    };
  },

  // 6 · three cards, whole–part–whole: the thread forks into three strands, each ends in a card; each card is
  // enlarged in turn with its text; then the three again.
  cards(s, B, lang) {
    const cap = 0, fork = 0.4 * B;
    const land = s.cards.map((_, k) => fork + (1 + k * 0.5) * B);
    // whole: titles read as the cards land (the subs are glances, repeated when each card opens)
    const allRead = Math.max(land[land.length - 1] + 0.4 + R(s.cards.at(-1).title, lang), land[0] + 0.3 + R(s.cards.map((c) => c.title), lang));
    const zoom = [];
    let t = snap(allRead, B);
    s.cards.forEach((c, k) => { // part: each card opens in turn, straight from the previous one
      const z0 = t, rows = c.rows.map((_, j) => z0 + 0.6 * B + j * 0.4 * B);
      const z1 = Math.max(rows[0] + 0.3 + R(c.rows, lang), rows[rows.length - 1] + 0.3 + R(c.rows.at(-1), lang));
      zoom.push({ z0, rows, z1 });
      t = snap(z1, B);
    });
    const whole = t, cap2 = whole + 0.6 * B;
    const end = cap2 + R(s.caption2, lang) + 0.6;
    return {
      dur: snap(end, B), cap, fork, land, zoom, whole, cap2,
      cues: [{ t: fork, kind: 'sweep' }, ...land.map((x, i) => ({ t: x, kind: 'pluck', i })), ...zoom.flatMap((z, k) => [{ t: z.z0, kind: 'zoom', i: k }, ...z.rows.map((x, j) => ({ t: x, kind: 'tick', i: j })), { t: z.z1 + 0.2, kind: 'unzoom' }]), { t: whole, kind: 'chime' }],
      music: [{ at: 0, kind: 'break', energy: 0.4, reading: true }, { at: whole, kind: 'build', energy: 0.5 }],
    };
  },

  // 7 · one thread gathers everything: the spine retracts, the thread sweeps the sky in three passes catching
  // every star, straightens, the stars flow into one point, which opens as the task panel (the climax); one
  // "needs you"; the thread lies flat as the claim's baseline; then it is wound back into the mascot.
  close(s, B, lang) {
    const r0 = 0.1 * B, gA = 0.9 * B, gB = 4.6 * B, flowA = 5.0 * B, flowB = 6.9 * B, unfold = 7.0 * B;
    const cap = unfold + 0.4 * B;
    const need = unfold + 1.4 * B;
    const nudge = need + 0.6 * B;
    const panelRead = Math.max(cap + R(s.caption, lang), nudge + BUBBLE_IN + R(s.nudge, lang), need + R(s.panel.rows[0].title + ' ' + s.panel.rows[0].detail, lang)) + 0.4;
    const recede = snap(panelRead, B), lay = recede + 1.0 * B;
    const claim = lay + 0.4 * B;
    const words = s.words.map((_, k) => claim + 0.6 * B + k * 0.75 * B);
    const claimRead = words[words.length - 1] + 0.4 + R([s.claim, ...s.words], lang) * 0.7;
    const con0 = snap(claimRead, B), con1 = con0 + 1.2 * B;
    const dur = con1 + 0.3 * B;
    return {
      dur, r0, gA, gB, flowA, flowB, unfold, cap, need, nudge, recede, lay, claim, words, con0, con1,
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
    const read = tag + 0.4 + R([content.product.name, content.product.tagline], lang);
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

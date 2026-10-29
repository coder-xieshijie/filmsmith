// choreo.js — every time in the morph chain, in one place. film.js (picture), score.mjs (sound) and timing.rules.js
// (length, key events, tiers) all read these functions, so the three cannot drift.
//
// A scene's times are seconds from its start, computed from the beat B (60 / bpm) and the scene's copy. Exits are
// measured back from the scene's fitted end (`dur`), so a longer scene lands at the same moment and holds.
//
// The chain (TEMPLATE.md, "Scene registry"): point → line → press → card (one or more) → solid → unfold → focus →
// flood → mark. Each scene starts from the exact shape the previous one ended on (pixel-continuous hand-offs).
// Optional links and the short chain are validated by validate() below.

export const WORD = 0.3; // s per English word (principle 1, standard)
export const CPS = 60; // characters a second the closing command types at
export const CMD_HOLD = 3; // s the closing command holds once typed (principle 1: the closing URL or command ≥ 3 s)
export const GLANCE = 1.0; // s a glance item stays fully still

// ---------- facts and placeholders ----------
// Copy may quote facts computed from content.product: {endpoints} {schemas} {sdks} (counts), {title} {version}
// {file} {name} {status} {reason} {ms}. Any other {token} (an API path parameter such as {id}) is left as written.
export const facts = (content) => {
  const p = content.product || {};
  const c = p.call || {};
  return {
    endpoints: (p.endpoints || []).length, schemas: (p.schemas || []).length, sdks: (p.sdks || []).length,
    title: p.title ?? '', version: p.version ?? '', file: p.file ?? '', name: p.name ?? '',
    status: c.status ?? '', reason: c.reason ?? '', ms: c.ms ?? '',
  };
};
export const fill = (s, f) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in f ? String(f[k]) : m));
const words = (s) => String(s ?? '').replace(/\{[^}]*\}/g, ' x ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
export const readSec = (s) => words(s) * WORD;

// The response body as JSON lines, and the status line, from content.product (one source for the card, the docs page
// and the console).
export const bodyLines = (content) => (content.product?.body || []).map(([k, v], i, a) => `  "${k}": ${typeof v === 'number' ? v : `"${v}"`}${i < a.length - 1 ? ',' : ''}`);
export const statusLine = (content) => { const c = content.product?.call || {}; return `${c.status} ${c.reason} · ${c.ms} ms`; };
// the endpoint the film follows, with the API's base path: "GET /v2/invoices/{id}"
export const endpointLine = (content) => { const p = content.product || {}; const e = p.endpoints?.[p.select ?? 0]; return e ? `${e[0]} ${p.base ?? ''}${e[1]}` : ''; };
export const metaLine = (content) => { const c = content.product?.call || {}; return `${c.reason} · ${c.ms} ms`; };

// ---------- choreography ----------
// Settle times (s) after an onset until the picture is still again, used for the still windows check-film measures.
const SETTLE = { rise: 0.32, chip: 0.3, shape: 0.62, morph: 0.55, pop: 0.12, swap: 0.42, flood: 0.08, tab: 0.4, ring: 0.24, fill: 0.36 };

const ceilBeat = (x, B) => Math.ceil(x / B - 1e-9) * B;

// Each entry: what the type needs, given beat B, the scene and its neighbours (ctx = { first, prev, next, content }).
// Returns { micro: [[t, what, settle]], reads: [{ text, tier, at }], need, fast: [[a, b]], ... named times }.
export const TIMES = {
  // The point: present from frame 0 (r 10), swells and lands on beat 1 (the hook).
  point: (s, B) => {
    const land = 1 * B;
    return { land, need: 2 * B, micro: [[land, 'the point lands', SETTLE.pop]], reads: [], fast: [] };
  },

  // The line: the point shoots out into a line (beat 0), the text rises out of it as its baseline (beat 1), one token
  // is swapped in the accent (beat 3).
  line: (s, B) => {
    const shoot = 0, rise = 1 * B, readable = rise + 0.24;
    const swap = s.swap ? 3 * B : null;
    const micro = [[shoot, 'the point shoots out into a line', 0.4], [rise, 'the text rises out of the line', SETTLE.rise]];
    const reads = [{ text: s.text, at: readable }];
    if (swap != null) { micro.push([swap, `${s.swap[0]} → ${s.swap[1]}`, SETTLE.swap]); reads.push({ text: s.swap[1], at: swap + 0.36 }); }
    const end = swap != null ? swap + 0.36 + readSec(s.swap[1]) + 0.25 : readable + readSec(s.text) + 0.25;
    return { shoot, rise, swap, readable, micro, reads, need: Math.max(end, (swap ?? rise) + 1 * B), fast: [[0.02, 0.26]] };
  },

  // The press: the line thickens upward into a pill around its own text (beat 0); the token's accent is released
  // (beat 1) and handed to the action chip (beat 1.5); the chip is pressed (beat 3).
  press: (s, B) => {
    const grow = 0, release = 1 * B, chip = 1 * B, press = 3 * B;
    const micro = [[grow, 'the line thickens into the request pill', 0.55], [release, s.action ? 'the token hands the accent to the action chip' : 'the token settles into the pill', 0.3]];
    if (s.action) micro.push([press, 'the action is pressed', 0.2]);
    const reads = s.action ? [{ text: s.action, tier: 'glance', at: chip + 0.25 }] : [];
    const end = s.action ? Math.max(press + 0.35, chip + 0.25 + GLANCE) : release + 0.5;
    return { grow, release, chip, press, micro, reads, need: Math.max(end, (s.action ? press : release) + 1 * B), fast: [] };
  },

  // A card state. From the pill: content out (0–0.1 s), the shape springs to the card, header and the first half of
  // the body enter on beat 1, the rest on beat 2, the status chip gives up the accent on beat 3. From a card (schema):
  // the header is swapped (beat 0), type chips rise in the accent (beat 1) and settle to outlines (beat 3).
  card: (s, B, ctx) => {
    const fromCard = ctx.prev?.type === 'card';
    const n = (ctx.content.product?.body || []).length;
    if (!fromCard) {
      const head = 1 * B, bodyA = 1 * B, bodyB = 2 * B, settle = 3 * B;
      const lines = bodyLines(ctx.content), half = Math.ceil(lines.length / 2);
      const micro = [[0, 'the pill grows into the card', SETTLE.shape], [head, 'status and the body enter', SETTLE.fill], [bodyB, 'the rest of the body enters', SETTLE.fill], [settle, 'the status chip gives up the accent', 0.25]];
      const reads = [{ text: statusLine(ctx.content), at: head + 0.15 },
        ...lines.slice(0, half).map((l) => ({ text: l, tier: 'glance', at: bodyA + 0.15 })),
        ...lines.slice(half).map((l) => ({ text: l, tier: 'glance', at: bodyB + 0.15 }))];
      return { fromCard, head, bodyA, bodyB, half, settle, micro, reads, need: Math.max(settle + 0.6, bodyB + 0.15 + GLANCE + 0.1), fast: [] };
    }
    const head = 0, chips = 1 * B, settle = 3 * B;
    const micro = [[head, 'the header turns into the schema name', SETTLE.swap], [chips, 'type chips rise into each field', SETTLE.chip + 0.04 * n], [settle, 'the chips settle to outlines', 0.25]];
    const reads = [{ text: s.name ?? '', at: 0.32 }, ...(ctx.content.product?.body || []).map((f) => ({ text: f[2], tier: 'glance', at: chips + 0.3 }))];
    return { fromCard, head, chips, settle, micro, reads, need: Math.max(settle + 0.6, chips + 0.3 + GLANCE + 0.1), fast: [] };
  },

  // The solid: the card's outline morphs, at equal arc length, into a flat hexagon (beat 0); three accent lines from
  // its centre re-read it as a cube (beat 2, expressive); the faces take three tones of the ink; the caption rises
  // (beat 3); the face labels follow half a beat apart (3.5, 4, 4.5); a beat before the end the front face, about to
// unfold, takes the accent. Opening a film (short chain), it starts on the hexagon, a beat earlier.
  solid: (s, B, ctx, dur) => {
    // opening a film (a reel's short cut) there is no card to morph: the hexagon is the first frame, the lines draw on
    // beat 1 (the hook), and caption and labels follow half a beat sooner, so the first composition stays short
    const first = !!ctx.first;
    const morph = first ? null : 0, lines = (first ? 1 : 2) * B, tones = (first ? 1.6 : 2.6) * B, caption = (first ? 1.5 : 3) * B;
    const faces = (s.faces || []).map((_, k) => ((first ? 2 : 3.5) + 0.5 * k) * B);
    const micro = [...(morph != null ? [[morph, 'the card outline becomes a hexagon', SETTLE.morph]] : []), [lines, 'three lines turn the hexagon into a cube', 0.36], [tones, 'the faces take three tones', 0.22], [caption, 'the caption rises', SETTLE.rise], ...faces.map((t, k) => [t, `face label ${k + 1}`, SETTLE.rise])];
    const reads = [{ text: s.caption, at: caption + 0.24 }, ...(s.faces || []).map((f, k) => ({ text: f, tier: 'glance', at: faces[k] + 0.24 }))];
    const lastFace = faces.length ? faces[faces.length - 1] : caption;
    const need = Math.max(lastFace + 0.24 + GLANCE + 0.05, caption + 0.24 + readSec(s.caption) + 0.2);
    const arm = (dur ?? need) - 1 * B; // the front face, the hinge of the unfold, takes the accent
    micro.push([arm, 'the front face takes the accent', 0.22]);
    return { morph, lines, tones, caption, faces, arm, micro, reads, need, fast: morph != null ? [[0.1, 0.46]] : [] };
  },

  // The unfold: the cube unfolds about its front face into a cross (beat 0) and the six squares slide into the
  // panels of the interface (beat 1; together the expressive transition); the panels fill (beat 2); the caption
  // rises (beat 2.5); the highlight jumps down the endpoint list to the endpoint the film follows (beat 3) and settles
// into the ink (beat 4).
  unfold: (s, B) => {
    const unfold = 0, slide = 1 * B, fillAt = 2 * B, caption = 2.5 * B, jump = 3 * B, settle = 4 * B;
    const micro = [[unfold, 'the cube unfolds into a cross', 0.5], [slide, 'the squares slide into panels', 0.5], [fillAt, 'the panels fill', SETTLE.fill + 0.2], [caption, 'the caption rises', SETTLE.rise], [jump, 'the highlight jumps to the endpoint', 0.3], [settle, 'the highlight settles into the ink', 0.25]];
    const reads = [{ text: s.caption, at: caption + 0.24 }, { text: s.ref ?? '', tier: 'glance', at: fillAt + 0.4 }];
    return { unfold, slide, fillAt, caption, jump, settle, micro, reads, need: Math.max(settle + 0.4, caption + 0.24 + readSec(s.caption) + 0.1), fast: [[0.02, 0.5], [slide, slide + 0.5]] };
  },

  // The focus: the six panels gather into one card (beat 0, a container transform); the title enters (beat 1); the
  // tabs, the first tab's code and the Run button (beat 2); each next tab is selected once the previous code has been
  // read (a step); one beat before the end the tab highlight lets go of the accent and the Run button takes it
  // (exit-relative, `arm`).
  focus: (s, B, ctx, dur) => {
    const gather = 0, enter = 1 * B, code = 2 * B, entry = 0.28;
    const tabs = s.tabs || [];
    const at = [];
    let done = enter + 0.15 + readSec(s.title);
    tabs.forEach((tb, k) => {
      const t = k === 0 ? code : Math.max(at[k - 1] + 2 * B, ceilBeat(done - entry, B));
      at.push(t);
      done = Math.max(done, t + entry) + readSec((tb.code || []).join(' '));
    });
    const last = at.length ? at[at.length - 1] : enter;
    const need = Math.max(done + 0.1, last + 2 * B);
    const arm = (dur ?? need) - 1 * B;
    const micro = [[gather, 'the panels gather into one card', SETTLE.shape], [enter, 'the title enters', SETTLE.rise], [code, 'tabs, code and Run enter', SETTLE.fill], ...at.slice(1).map((t, k) => [t, `tab ${k + 2}: ${tabs[k + 1].lang}`, SETTLE.tab]), [arm, 'the Run button takes the accent', 0.22]];
    const reads = [{ text: s.title, at: enter + 0.24 }, ...tabs.map((tb, k) => ({ text: (tb.code || []).join(' '), at: at[k] + entry })), ...tabs.map((tb, k) => ({ text: tb.lang, tier: 'glance', at: code + 0.15 + k * 0.001 })), ...(endpointLine(ctx.content) ? [{ text: endpointLine(ctx.content), tier: 'glance', at: code + 0.2 }] : [])];
    return { gather, enter, code, tabs: at, entry, arm, micro, reads, need, fast: [[0.08, 0.62]] };
  },

  // The flood: the Run button is pressed (beat 0) and spins until the next bar line (`pre`, 0–3 beats, from the scene's
  // start in the film); on the bar line its own outline floods the frame (1 beat,
  // expressive): inside, the same card in the other material, the live console; the status lands in the accent
  // (pre + 2 beats), the body lines (2.5, 3); the claim lands on the next bar line (pre + 4, the climax) and is read in
  // a pause; the console retracts into the button (the last 1.25 beats).
  flood: (s, B, ctx, dur, pre = 3 * B) => {
    const press = 0, flood = pre, covered = pre + 1 * B, status = pre + 2 * B, l1 = pre + 2.5 * B, l2 = pre + 3 * B, claim = pre + 4 * B;
    const n = Math.min(2, (ctx.content.product?.body || []).length);
    const micro = [...(pre > 0 ? [[press, 'Run is pressed; the request is in flight', 0.2]] : []), [flood, 'the Run button floods the frame', 0.55], [status, 'the status lands', SETTLE.rise], ...(n > 0 ? [[l1, 'body line 1', SETTLE.rise]] : []), ...(n > 1 ? [[l2, 'body line 2', SETTLE.rise]] : []), [claim, 'the claim lands', SETTLE.rise]];
    const reads = [{ text: statusLine(ctx.content), at: status + 0.24 }, { text: s.claim, claim: true, at: claim + 0.24 }];
    const retract = 1.25 * B; // from the end
    const claimRead = claim + 0.24 + readSec(s.claim) + 0.35;
    return { press, pre, flood, covered, status, l1, l2, n, claim, retractBeats: 1.25, micro, reads, claimRead, need: claimRead + 0.12 + retract, fast: [[flood, covered + 0.04]] };
  },

  // The mark: the previous shape splits into the mark's parts, which fly in on arcs (beat 0, filling with ink); a
  // target ring draws (beat 1.25); the point hops in and lands as the mark's point (beat 2, the lock-up); the name
  // wipes out of the mark (beat 2); the tagline rises (beat 2.5); the command types on (beat 3.5) and holds ≥ 3 s; on
// the last downbeat the stack presses once.
  mark: (s, B, ctx) => {
    const split = 0, ring = 1.25 * B, hop = 1.44 * B, land = 2 * B, name = 2 * B, line = 2.5 * B, cmd = 3.5 * B;
    const name0 = ctx.content.product?.name ?? '';
    const typed = s.cmd ? cmd + [...s.cmd].length / CPS : null;
    const micro = [[split, 'the shape splits and flies into the mark', 0.75], [ring, 'a target ring draws', SETTLE.ring], [land, 'the point lands; the name wipes out', 0.32], [line, 'the tagline rises', SETTLE.rise], ...(s.cmd ? [[cmd, 'the command types on', typed - cmd + 0.05]] : [])];
    const reads = [{ text: name0, at: name + 0.28 }, { text: s.line ?? '', at: line + 0.24 }, ...(s.cmd ? [{ text: s.cmd, at: typed }] : [])];
    const read = line + 0.24 + readSec(name0) + readSec(s.line) + 0.3;
    const need = Math.max(read + 0.5, line + 4 * B, typed != null ? typed + CMD_HOLD : 0);
    return { split, ring, hop, land, name, line, cmd: s.cmd ? cmd : null, typed, micro, reads, need, fast: [[0.1, 0.62], [hop, land + 0.02]] };
  },
};

// Times of scene i inside a laid-out film (scenes from fit()); ctx carries the neighbours.
// `dur` is the fitted length (end − start) for the types that time an event from their end; the flood's preroll comes
// from its start in the film (the beats left to the next bar line).
export const prerollOf = (start, B, beatsPerBar = 4) => { const b = Math.round(start / B); return ((beatsPerBar - (b % beatsPerBar)) % beatsPerBar) * B; };
export const timesOf = (scenes, i, B, content) => {
  const s = scenes[i];
  const f = TIMES[s.type];
  if (!f) return null;
  const dur = s.end != null ? s.end - s.start : undefined;
  return f(s, B, { first: i === 0, prev: scenes[i - 1], next: scenes[i + 1], content }, dur, s.type === 'flood' && s.start != null ? prerollOf(s.start, B) : undefined);
};

// The second move of the closing scene: lands on the downbeat of the last bar (seconds from the scene start), or
// null when the scene is shorter than a bar past its tagline.
export const secondMove = (dur, bar, B, T) => { const t = dur - bar; return t > T.line + 2 * B - 1e-6 ? t : null; };

// ---------- the registry ----------
export const TYPES = ['point', 'line', 'press', 'card', 'solid', 'unfold', 'focus', 'flood', 'mark'];
// what may come right before each type (null: it may open the film)
export const FOLLOWS = {
  point: [null], line: [null, 'point'], press: ['line'], card: ['press', 'card'], solid: [null, 'card'],
  unfold: ['solid'], focus: ['unfold'], flood: ['focus'], mark: ['card', 'unfold', 'focus', 'flood'],
};
export const LIMITS = {
  name: 12, line: 30, swap: 12, action: 8, cardName: 14, body: 5, bodyLine: 26, chip: 8, caption: 14, face: 16,
  ref: 22, title: 22, tabs: [2, 4], lang: 8, code: 36, codeLines: 2, claim: 16, tagline: 24, cmd: 36, parts: [3, 8],
};

// validate(content) → error strings (film.js paints them on every frame; npm run fit exits 1).
export const validate = (content) => {
  const e = [];
  const f = facts(content);
  const p = content.product || {};
  const len = (v) => [...fill(v, f)].length;
  const over = (what, v, n) => { if (v != null && len(v) > n) e.push(`${what}: "${fill(v, f)}" has ${len(v)} characters; at most ${n}`); };
  const sc = content.scenes || [];
  if (!sc.length) e.push('scenes: empty');
  if (!p.name) e.push('product.name: missing (the closing wordmark)');
  over('product.name', p.name, LIMITS.name);
  const body = p.body || [];
  if (body.length > LIMITS.body) e.push(`product.body: ${body.length} fields; at most ${LIMITS.body}`);
  bodyLines(content).forEach((l, i) => over(`product.body[${i}]`, l.trim(), LIMITS.bodyLine));
  body.forEach((x, i) => over(`product.body[${i}] type`, x[2], LIMITS.chip));
  const parts = p.mark?.parts || [];
  if (parts.length < LIMITS.parts[0] || parts.length > LIMITS.parts[1]) e.push(`product.mark.parts: ${parts.length}; ${LIMITS.parts[0]}–${LIMITS.parts[1]} rectangles [x, y, w, h] in grid units`);
  if (!Array.isArray(p.mark?.dot) || p.mark.dot.length !== 3) e.push('product.mark.dot: [cx, cy, r] in grid units (where the point lands)');
  sc.forEach((s, i) => {
    const at = `scenes[${i}] (${s.type})`;
    if (!TYPES.includes(s.type)) { e.push(`${at}: unknown type; one of ${TYPES.join(', ')}`); return; }
    const prev = i ? sc[i - 1].type : null;
    if (!FOLLOWS[s.type].includes(prev)) e.push(`${at}: cannot follow ${prev ?? 'the start'}; it follows ${FOLLOWS[s.type].map((x) => x ?? 'the start').join(' or ')}`);
    if (s.type === 'line') {
      if (!s.text) e.push(`${at}: text missing`);
      over(`${at} text`, s.text, LIMITS.line);
      if (s.swap) {
        if (!Array.isArray(s.swap) || s.swap.length !== 2 || !String(s.text).includes(s.swap[0])) e.push(`${at}: swap is [token in text, replacement]`);
        else over(`${at} swap`, s.swap[1], LIMITS.swap);
      }
    }
    if (s.type === 'press') over(`${at} action`, s.action, LIMITS.action);
    if (s.type === 'card') {
      if (prev === 'card') { if (!s.name) e.push(`${at}: a card after a card shows the schema: give its name`); over(`${at} name`, s.name, LIMITS.cardName); }
      if (!body.length) e.push(`${at}: product.body is empty`);
    }
    if (s.type === 'solid') {
      over(`${at} caption`, s.caption, LIMITS.caption);
      if ((s.faces || []).length !== 3) e.push(`${at}: faces needs three labels (one per visible face)`);
      (s.faces || []).forEach((x, k) => over(`${at} faces[${k}]`, x, LIMITS.face));
    }
    if (s.type === 'unfold') { over(`${at} caption`, s.caption, LIMITS.caption); over(`${at} ref`, s.ref, LIMITS.ref); }
    if (s.type === 'focus') {
      over(`${at} title`, s.title, LIMITS.title);
      const n = (s.tabs || []).length;
      if (n < LIMITS.tabs[0] || n > LIMITS.tabs[1]) e.push(`${at}: ${n} tabs; ${LIMITS.tabs[0]}–${LIMITS.tabs[1]}`);
      (s.tabs || []).forEach((tb, k) => {
        over(`${at} tabs[${k}].lang`, tb.lang, LIMITS.lang);
        if (!(tb.code || []).length || tb.code.length > LIMITS.codeLines) e.push(`${at} tabs[${k}].code: 1–${LIMITS.codeLines} lines`);
        (tb.code || []).forEach((c) => over(`${at} tabs[${k}].code`, c, LIMITS.code));
      });
    }
    if (s.type === 'flood') { if (!s.claim) e.push(`${at}: claim missing`); over(`${at} claim`, s.claim, LIMITS.claim); }
    if (s.type === 'mark') { over(`${at} line`, s.line, LIMITS.tagline); over(`${at} cmd`, s.cmd, LIMITS.cmd); if (i !== sc.length - 1) e.push(`${at}: the mark closes the film; it must be the last scene`); }
  });
  if (sc.length && sc[sc.length - 1].type !== 'mark') e.push('the last scene must be mark (the lock-up)');
  if (content.corners && !['round', 'cut'].includes(content.corners)) e.push(`corners: "${content.corners}"; 'round' or 'cut'`);
  return e;
};

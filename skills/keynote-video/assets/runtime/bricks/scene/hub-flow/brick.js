// hub-flow — a chapter page of inputs → hub → outputs: the command in a box beside the header, inputs slide in from
// the left, the hub (the owner, outlined in muted) pops in, outputs slide in from the right, connectors draw, dots
// travel in, then for each output a dot travels out and it lights on the beat (accent status light and border) and
// its checks tick, one a half beat, in a row of check boxes along the bottom.
// From the phosphor template: film.js BUILD.flow, events.js TIMING.flow (command 0.1, inputs every 0.26 beat from
// 0.2, hub 0.85, outputs from 1.4, connectors 0.75–2.15, checks from 1.9 every 0.21, dots in from 2.1; each output a
// beat's travel, lit on the beat, its checks half a beat after), index.html .envbox .node .owner .sc. Chinese: node
// names at 40 px (fit to 35), subs and checks at 28 px.
import { E, F, W, at, rr, rect, ground, post, hud, hudAt, palOf, reader, onBeat, SEEN, rgba, zh, clamp, fit, label, pageHead } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { head: { title: ['LOCK', 'THE GRAPH'], note: '// every package, hashed' }, command: ['grainlock lock', '--all'], inputs: [{ name: 'package.json', sub: '41 direct' }, { name: 'registry', sub: 'npm · 312 total' }], hub: ['OWNER', 'grainlock', 'hash and sign'], outputs: [{ name: 'grainlock.lock', sub: 'one hash' }, { name: 'audit log', sub: 'who changed what' }], checks: [{ label: 'hashes match', output: 0 }, { label: 'no new maintainers', output: 0 }, { label: 'signed', output: 1 }] },
  zh: { head: { title: ['锁定', '依赖图'], note: '// 每个包都做哈希' }, command: ['grainlock lock', '--all'], inputs: [{ name: 'package.json', sub: '41 个直接依赖' }, { name: '注册表', sub: 'npm · 共 312 个' }], hub: ['负责人', 'grainlock', '哈希 + 签名'], outputs: [{ name: 'grainlock.lock', sub: '一个哈希' }, { name: '审计日志', sub: '谁改了什么' }], checks: [{ label: '哈希一致', output: 0 }, { label: '没有新维护者', output: 0 }, { label: '已签名', output: 1 }] },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), ins = (s.inputs || []).slice(0, 3), outs = (s.outputs || []).slice(0, 3), checks = (s.checks || []).slice(0, 5), T = {};
  T.cmd = rd.move(0.1 * B, 0.35); rd.glance(T.cmd + SEEN, s.command);
  T.inputs = ins.map((d, i) => { const t = rd.move(0.2 * B + i * 0.26 * B, 0.35); rd.glance(t + SEEN, d.sub); return t; });
  T.hub = rd.move(0.85 * B, 0.45); rd.glance(T.hub + SEEN, s.hub?.[0]); rd.glance(T.hub + SEEN, s.hub?.[2]);
  T.outputs = outs.map((d, i) => { const t = rd.move(1.4 * B + i * 0.26 * B, 0.35); rd.glance(t + SEEN, d.sub); return t; });
  ins.forEach((d, i) => rd.primary(T.inputs[i] + SEEN, d.name, 'en')); rd.primary(T.hub + SEEN, s.hub?.[1]); outs.forEach((d, i) => rd.primary(T.outputs[i] + SEEN, d.name));
  const names = rd.done;
  T.drawIn = ins.map((_, i) => 0.75 * B + i * 0.17 * B); T.drawOut = outs.map((_, i) => 1.6 * B + i * 0.17 * B); rd.move(0.75 * B, 1.4 * B);
  T.checksIn = checks.map((_, i) => rd.move(1.9 * B + i * 0.21 * B, 0.3));
  T.travelIn = ins.map((_, i) => 2.1 * B + i * 0.21 * B); T.travelDur = B;
  T.travelOut = []; T.light = []; T.ticks = checks.map(() => 0);
  let t = onBeat(Math.max(2.5 * B, names - 2 * B), B);
  for (let o = 0; o < outs.length; o++) {
    T.travelOut.push(t); const light = t + T.travelDur; T.light.push(light); rd.move(t, T.travelDur + 0.15);
    const mine = checks.map((c, i) => [c, i]).filter(([c]) => clamp(c.output ?? 0, 0, outs.length - 1) === o);
    mine.forEach(([, i], n) => (T.ticks[i] = rd.move(light + 0.5 * B + n * 0.5 * B, 0.1)));
    mine.forEach(([c, i]) => rd.primary(T.ticks[i], c.label));
    const done = mine.length ? Math.max(T.ticks[mine[mine.length - 1][1]] + 0.3, rd.done) : light + 0.5 * B;
    t = onBeat(Math.max(t + B, done - T.travelDur - 0.5 * B), B);
  }
  T.done = rd.done; T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};
const cub = (a, b, c, d, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; };

export default {
  id: 'hub-flow', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 20 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'hi', 'titleHi', 'titleLo'], type: ['display', 'text', 'mono'] },
  slots: {
    head: { type: 'group', of: { title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } }, note: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } } } },
    command: { type: 'list', count: [1, 2], optional: true, of: { type: 'code', tier: 'glance', limits: { en: { chars: 30 }, zh: { chars: 30 } } } },
    inputs: { type: 'list', count: [1, 3], of: { name: { type: 'code', tier: 'primary', limits: { en: { words: 2, chars: 16 }, zh: { chars: 7 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 22 }, zh: { chars: 9 } } } } },
    hub: { type: 'list', count: [2, 3], of: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } },
    outputs: { type: 'list', count: [1, 3], of: { name: { type: 'code', tier: 'primary', limits: { en: { words: 2, chars: 16 }, zh: { chars: 7 } } }, sub: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 22 }, zh: { chars: 9 } } } } },
    checks: { type: 'list', count: [0, 5], of: { label: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 22 }, zh: { chars: 8 } } }, output: { type: 'number' } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'hi', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], headEnter: false, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [...(s.inputs || []).map((d) => ({ text: d.name, lang: 'en' })), { text: (s.hub || [])[1] || '', lang: ctx.lang }, ...(s.checks || []).map((x) => ({ text: x.label, lang: ctx.lang }))],
      cues: [{ beat: b(T.cmd), kind: 'accent' }, { beat: b(T.hub), kind: 'land' }, ...T.light.map((x) => ({ beat: b(x), kind: 'stamp' })), ...T.ticks.map((x) => ({ beat: b(x), kind: 'accent' }))],
      motion: 'inputs, the hub and outputs land; connectors draw; dots travel in and out; each output lights and its checks tick', settled: b(T.done), peakAt: T.light.length ? b(T.light[0]) : undefined,
      shots: [{ beat: 0, kind: 'flow' }],
    };
  },
  prepare(s, c) { const L = c.lang || 'en', B = 60 / c.bpm; return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0) }; },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, ins = (s.inputs || []).slice(0, 3), outs = (s.outputs || []).slice(0, 3), checks = (s.checks || []).slice(0, 5);
    ground(ctx, P, t, { bpm: c.bpm });
    pageHead(ctx, P, L, s.head, t, B, { enter: s.headEnter, screen: s.screen });
    const fm = F('mono', L, zh(L) ? 28 : 25, 400), fnt = { ...F('text', L, 40, 700), spacing: zh(L) ? 0 : -0.02 * 40 };
    if (s.command && t >= T.cmd) { const e = E.p3Out((t - T.cmd) / 0.35), left = 930; ctx.save(); ctx.globalAlpha *= e; ctx.translate(30 * (1 - e), 0); rr(ctx, left, 82, 1810 - left, 74, 8); ctx.fillStyle = rgba(P.panel, 0.9); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.stroke(); let x = left + 26; at(ctx, '$', x, 82 + 24, fm, P.ink); x += W(ctx, '$ ', fm); at(ctx, s.command[0], x, 106, fm, P.muted); x += W(ctx, s.command[0] + '  ', fm); if (s.command[1]) at(ctx, s.command[1], x, 106, fm, P.dim); ctx.restore(); }
    const ys = (n) => [...Array(n)].map((_, i) => 495 + (i - (n - 1) / 2) * 147), spread = (i, n) => 495 + (i - (n - 1) / 2) * 25;
    const curves = [...ins.map((_, i) => { const y1 = ys(ins.length)[i], y2 = spread(i, ins.length); return [[480, y1], [640, y1], [650, y2], [790, y2]]; }), ...outs.map((_, i) => { const y1 = spread(i, outs.length), y2 = ys(outs.length)[i]; return [[1120, y1], [1270, y1], [1270, y2], [1420, y2]]; })];
    curves.forEach((cv, k) => {
      const t0 = k < ins.length ? T.drawIn[k] : T.drawOut[k - ins.length], e = E.p2Out((t - t0) / 0.45); if (e <= 0) return;
      ctx.save(); ctx.strokeStyle = rgba(P.muted, 0.55); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...cv[0]); for (let i = 1; i <= 24; i++) { const q = (i / 24) * e; ctx.lineTo(...cub(...cv, q)); } ctx.stroke(); ctx.restore();
      const tt = k < ins.length ? T.travelIn[k] : T.travelOut[k - ins.length];
      if (tt != null && t >= tt && t < tt + T.travelDur) { const pt = cub(...cv, E.sine((t - tt) / T.travelDur)); ctx.beginPath(); ctx.arc(pt[0], pt[1], 7, 0, Math.PI * 2); ctx.fillStyle = P.hi; ctx.fill(); }
    });
    const node = (d, x, y, w, t0, from, lit) => {
      if (t < t0) return; const e = E.p3Out((t - t0) / 0.35);
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(from * 30 * (1 - e), 0);
      rr(ctx, x, y - 48, w, 96, 8); ctx.fillStyle = rgba(P.panel, 0.92); ctx.fill(); ctx.strokeStyle = lit ? P.accent : P.line; ctx.lineWidth = 2; ctx.stroke();
      at(ctx, d.name, x + 24, y - 34, fit(ctx, d.name, fnt, w - 70, 35), P.ink); at(ctx, d.sub || '', x + 24, y + 12, fit(ctx, d.sub || '', fm, w - 50, 22), P.muted);
      if (from > 0) { ctx.beginPath(); ctx.arc(x + w - 30, y, 7, 0, Math.PI * 2); ctx.fillStyle = lit ? P.accent : P.line; if (lit) { ctx.shadowColor = P.accent; ctx.shadowBlur = 14; } ctx.fill(); }
      ctx.restore();
    };
    ins.forEach((d, i) => node(d, 120, ys(ins.length)[i], 360, T.inputs[i], -1, false));
    outs.forEach((d, i) => node(d, 1420, ys(outs.length)[i], 390, T.outputs[i], 1, T.light[i] != null && t >= T.light[i]));
    if (t >= T.hub) {
      const e = clamp((t - T.hub) / 0.45), k = 0.85 + 0.15 * E.back(2)(e), h = s.hub || [];
      ctx.save(); ctx.globalAlpha *= Math.min(1, e * 1.5); ctx.translate(955, 495); ctx.scale(k, k); ctx.translate(-955, -495);
      rr(ctx, 790, 400, 330, 190, 8); ctx.fillStyle = rgba(P.panel, 0.92); ctx.fill(); ctx.strokeStyle = P.muted; ctx.lineWidth = 2; ctx.stroke();
      at(ctx, label(h[0] || '', L), 955, 420, { ...fm, spacing: zh(L) ? 0 : 0.2 * 25 }, P.muted, { align: 'center' });
      at(ctx, h[1] || '', 955, 470, fit(ctx, h[1] || '', fnt, 290, 35), P.ink, { align: 'center' });
      at(ctx, h[2] || '', 955, 530, fm, P.muted, { align: 'center' });
      ctx.restore();
    }
    let cx = 120;
    checks.forEach((ck, i) => {
      const w = W(ctx, '○ ' + ck.label, fm) + 36 + 10; if (t < T.checksIn[i]) { cx += w + 20; return; }
      const e = E.p3Out((t - T.checksIn[i]) / 0.3), ok = T.ticks[i] && t >= T.ticks[i];
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, 16 * (1 - e)); rr(ctx, cx, 792, w, 64, 6); ctx.fillStyle = rgba(P.panel, 0.9); ctx.fill(); ctx.strokeStyle = ok ? P.accent : P.line; ctx.lineWidth = 2; ctx.stroke();
      at(ctx, ok ? '✓' : '○', cx + 18, 792 + 32 - fm.size * 0.55, F('mono', L, fm.size, 400), ok ? P.accent : P.dim); at(ctx, ck.label, cx + 18 + W(ctx, '○ ', fm), 792 + 32 - fm.size * 0.55, fm, ok ? P.ink : P.muted);
      ctx.restore(); cx += w + 20;
    });
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

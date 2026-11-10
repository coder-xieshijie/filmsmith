// terminal-stations — three terminal windows stand along an arc in one dark 3D space, each turned its own way over a
// perspective floor; the camera holds on one at a slight side view while a command is typed and its output prints, then
// pulls far back and flies to the next (all three windows in one frame mid-flight), and the last window ends on the
// one line in the accent with the only glow of the film.
// Adapted from video-shotcraft demos/camera/terminal-3d/Terminal3D.tsx (card references/shots/camera/terminal-3d.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion); each window is the prop terminal-window drawn into a
// canvas plane repainted every frame (typing, printing, spinners and ticks, the progress cells, the last line are the
// prop's); colours by role (windows in panel toward the ground, the floor grid, the pool under the window in focus, the
// outlined step numbers, the prompt, the ticks and the last line in the accent); brand, the CLI's name and every word
// removed (the three commands, their lines, the progress count and the last line are slots, sample copy by default);
// the floor, the backlight and the pool are drawn on a screen canvas from the same projection; the defocus blur, the
// directional speed blur and the dust are left out (windows away from the camera dim instead); the window poses, the
// side views (9°, −8°, 10°), the −4° tilt, the camera (260 px push in, swift flights 62–92 and 152–182 with a sine pull
// back of 1250 px, the 2 % creep at the end), the typing rhythm (1.15 frames a character with a seeded jitter, 2 frames
// before the enter), the output timing and the 560 px outlined step numbers behind the windows are the upstream's.
import { clamp, mix, rgba, fontOf } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { el, n } from '../../dom.js';
import { fontFor, graphemes, readTime } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';
import { drawTerminal, TW, TH } from '../../prop/terminal-window/brick.js';

const W = TW, H = TH, M = 170, PERSP = 1800, FLOOR_Y = 500, TILT = -4, PULL_PEAK = 1250, END = 240;
const POSES = [{ x: -1500, y: -30, z: -220, ry: 24 }, { x: 0, y: 30, z: 260, ry: -14 }, { x: 1520, y: -40, z: -160, ry: 28 }];
const VIEW = [9, -8, 10], FLY = [[62, 92], [152, 182]], TYPE_AT = [8, 94, 184];
const rand = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a, b, t) => a + (b - a) * t;
// the camera: s the station (0..2, fractional in flight), pull the distance back, pose the point looked at, yaw
const camAt = (f) => {
  let s = 0, pull = 260 * (1 - ramp(f, 0, 24, EASE.out));
  FLY.forEach(([a, b], i) => {
    s += ramp(f, a, b - a, EASE.swift);
    const raw = clamp((f - a) / (b - a));
    pull += Math.sin(Math.PI * Math.pow(raw, 0.85)) * PULL_PEAK * (i === 0 ? 1 : 1.05);
  });
  pull -= 36 * ramp(f, 222, 24, EASE.smooth);
  const i0 = Math.min(1, Math.floor(s)), k = s - i0, a = POSES[i0], b = POSES[i0 + 1];
  const pose = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k), ry: lerp(a.ry, b.ry, k) };
  return { s, pull, pose, yaw: lerp(VIEW[i0], VIEW[i0 + 1], k) - pose.ry };
};
// the projection of the world's CSS transform: translateZ(−pull) rotateX(TILT) rotateY(yaw) translate(−pose)
const project = (cam, [px, py, pz]) => {
  const x0 = px - cam.pose.x, y0 = py - cam.pose.y, z0 = pz - cam.pose.z, ty = (cam.yaw * Math.PI) / 180, tx = (TILT * Math.PI) / 180;
  const x1 = x0 * Math.cos(ty) + z0 * Math.sin(ty), z1 = -x0 * Math.sin(ty) + z0 * Math.cos(ty);
  return { x: x1, y: y0 * Math.cos(tx) - z1 * Math.sin(tx), z: y0 * Math.sin(tx) + z1 * Math.cos(tx) - cam.pull };
};
const toScreen = (q) => { const k = PERSP / (PERSP - q.z); return { x: 960 + q.x * k, y: 540 + q.y * k, k }; };
// a point of window i (local x, y from its centre) in the world
const local = (i, x, y) => { const p = POSES[i], r = (p.ry * Math.PI) / 180; return [p.x + x * Math.cos(r), p.y + y, p.z - x * Math.sin(r)]; };
// typing: each character's frame offset (1.15 frames on average with a seeded jitter, spaces slower) and the end
const charTimes = (cmd, seed) => { const out = []; let t = 0; graphemes(cmd).forEach((ch, k) => { out.push(t); t += 0.75 + rand(seed * 31 + k) * 0.9 + (ch === ' ' ? 0.6 : 0); }); return { out, end: t }; };
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });
const LINE = { key: { type: 'text', tier: 'glance', limits: lim(8, 3, 1) }, value: { type: 'text', tier: 'glance', limits: lim(20, 9, 4) }, note: { type: 'text', tier: 'glance', optional: true, limits: lim(12, 5, 2) } };
const DEFAULT = {
  en: { path: '~/promo', stations: [
    { name: 'storyboard', cmd: 'tidewell init', lines: [{ key: 'template', value: 'ink-press' }, { key: 'shots', value: '12 recipe cards', note: '2.5D' }, { key: 'audio', value: '120 bpm', note: 'beat grid' }, { key: 'ready', value: 'next: render' }] },
    { name: 'render', cmd: 'tidewell render', lines: [{ key: 'done', value: 'act-1/opening', note: '8' }, { key: 'done', value: 'act-2/features', note: '10' }, { key: 'done', value: 'act-3/outro', note: '6' }, { key: 'shots', value: '1080p · 30fps' }] },
    { name: 'export', cmd: 'tidewell export', lines: [{ key: 'mix', value: 'voice + sfx', note: '-14 LUFS' }, { key: 'encode', value: 'h264 · 1080p30' }, { key: 'draft', value: 'exported' }] }],
    progress: [{ count: '24', unit: 'shots' }], ready: [{ label: 'READY', value: 'launch-film.mp4' }] },
  zh: { path: '~/promo', stations: [
    { name: '分镜', cmd: 'tidewell init', lines: [{ key: '模板', value: 'ink-press' }, { key: '镜头', value: '12 张配方卡', note: '2.5D' }, { key: '音频', value: '120 bpm', note: '节拍网格' }, { key: '就绪', value: '下一步：渲染' }] },
    { name: '渲染', cmd: 'tidewell render', lines: [{ key: '完成', value: '第一幕 开场', note: '8' }, { key: '完成', value: '第二幕 功能', note: '10' }, { key: '完成', value: '第三幕 收尾', note: '6' }, { key: '镜头', value: '1080p · 30fps' }] },
    { name: '导出', cmd: 'tidewell export', lines: [{ key: '混音', value: '人声 + 音效', note: '-14 LUFS' }, { key: '编码', value: 'h264 · 1080p' }, { key: '草稿', value: '已导出' }] }],
    progress: [{ count: '24', unit: '个镜头' }], ready: [{ label: '完成', value: 'launch-film.mp4' }] },
};

export default {
  id: 'terminal-stations', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['dom'],
  beats: { min: 16, max: 16 },
  beatsFor: () => 16,
  needs: { motions: [], props: ['terminal-window'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'], type: ['mono', 'display', 'text'] },
  slots: {
    path: { type: 'text', tier: 'glance', optional: true, limits: lim(18, 18, 2) },
    stations: { type: 'list', count: [3, 3], of: {
      name: { type: 'text', tier: 'glance', limits: lim(12, 4, 1) },
      cmd: { type: 'text', tier: 'primary', limits: lim(22, 22, 3) },
      lines: { type: 'list', count: [2, 4], of: LINE },
    } },
    progress: { type: 'list', count: [0, 1], optional: true, of: { count: { type: 'number', limits: lim(3, 3, 1) }, unit: { type: 'text', tier: 'glance', limits: lim(8, 4, 1) } } },
    ready: { type: 'list', count: [0, 1], optional: true, of: { label: { type: 'text', tier: 'word', limits: lim(6, 2, 1) }, value: { type: 'text', tier: 'primary', claim: true, limits: lim(18, 18, 1) } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent'],
  summary: 'Three terminal windows stand along an arc in a dark 3D space; the camera holds on each while a command is typed and its output prints, pulling far back between them, and ends on one line in the accent.',
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    return { beats: 16, reads: s.stations.map((st) => ({ text: `${st.cmd} ${st.lines.map((l) => l.value).join(' ')}`, lang: ctx.lang })),
      cues: TYPE_AT.map((t, i) => ({ beat: t / 15, kind: i ? 'turn' : 'accent' })).concat((s.ready || []).length ? [{ beat: 219 / 15, kind: 'land' }] : []),
      motion: 'camera holds on each window at a side view, pulls back and flies to the next', settled: 222 / 15, peakAt: 219 / 15, pause: (END - 222) / 15 };
  },
  validate(s, ctx) {
    const e = [];
    if ((s.stations || []).length !== 3) e.push('stations: exactly three windows');
    // a command types in about 18 frames: a longer one runs into the flight
    (s.stations || []).forEach((st, i) => { if (charTimes(st.cmd, i + 3).end > 26) e.push(`stations[${i}].cmd: too long to type before the flight`); });
    // the output is texture read at a glance; what must be read in the stop is the command (code, read as Latin) and the
    // last line
    (s.stations || []).forEach((st, i) => { const last = st.lines[st.lines.length - 1]; if (readTime(st.cmd, 'en') + readTime(`${last.key} ${last.value}`, ctx.lang) > 3) e.push(`stations[${i}]: command and last line too long to read in one stop`); });
    return e;
  },
  F(s, role, size, weight, kind) { return fontFor(s.look || NEUTRAL, role, s.lang, size, weight, kind); },
  prepare(s) { return { typing: s.stations.map((st, i) => charTimes(st.cmd, i + 3)) }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) { const f = clamp(p) * END; return { p, f, cam: camAt(f) }; },
  // window i's state at frame f, as terminal-window draws it
  stateOf(i, f, P, D) {
    const st = P.stations[i], T = D.typing[i], tf = f - TYPE_AT[i], typed = T.out.filter((x) => x <= tf).length, ent = TYPE_AT[i] + T.end + 2, out0 = ent + 2;
    const caret = f >= ent + 1 ? 0 : tf < T.end && tf >= 0 ? 1 : Math.floor((f - (tf < 0 ? 0 : TYPE_AT[i] + T.end)) / 8) % 2 === 0 ? 1 : 0;
    const prog = i === 1 && (P.progress || []).length, last = st.lines.length - 1;
    const lines = st.lines.map((_, j) => f - (out0 + (prog ? 10 : 0) + j * 4 + (j === last && i < 2 ? 2 : 0)));
    const words = { step: String(i + 1).padStart(2, '0'), name: st.name, path: P.path, cmd: st.cmd,
      lines: st.lines.map((l, j) => ({ ...l, mark: j === last && i < 2 ? 'pass' : 'spin' })), progress: prog ? P.progress[0] : null, ready: i === 2 && (P.ready || []).length ? P.ready[0] : null };
    return { words, st: { typed: graphemes(st.cmd).length ? typed / graphemes(st.cmd).length : 1, caret, lines, progress: prog && f >= out0 ? ramp(f, out0, 20, EASE.out) : null, progressAt: f - out0, ready: f - (out0 + last * 4 + 7) } };
  },
  build(root, P) {
    const c = P.colors;
    root.style.background = c.ground;
    const bg = el('canvas', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, root); bg.width = 1920; bg.height = 1080;
    const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${PERSP}px` }, root);
    const world = el('div', { position: 'absolute', left: '960px', top: '540px', width: '0', height: '0', transformStyle: 'preserve-3d' }, stage);
    const nf = this.F(P, 'display', 560, 800, 'display');
    const wins = POSES.map((p, i) => {
      // the outlined step number behind the window, turned with it
      const num = el('canvas', { position: 'absolute', left: `${-W / 2 - 120}px`, top: `${-H / 2 - 270}px`, width: '1400px', height: '640px', transform: `translate3d(${p.x}px,${p.y}px,${p.z - 380}px) rotateY(${p.ry}deg)` }, world);
      num.width = 1400; num.height = 640;
      const g = num.getContext('2d'); g.font = fontOf(nf); if ('letterSpacing' in g) g.letterSpacing = `${-0.05 * nf.size}px`;
      g.textBaseline = 'alphabetic'; g.lineWidth = 2; g.strokeStyle = c.accent; g.strokeText(String(i + 1).padStart(2, '0'), 0, 560 * 0.86);
      const d = el('canvas', { position: 'absolute', left: `${-W / 2 - M}px`, top: `${-H / 2 - M}px`, width: `${W + 2 * M}px`, height: `${H + 2 * M}px`, transform: `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateY(${p.ry}deg)` }, world);
      d.width = W + 2 * M; d.height = H + 2 * M;
      return { num, d, g: d.getContext('2d') };
    });
    return { root, bg, bgc: bg.getContext('2d'), stage, world, wins, blurTarget: null };
  },
  // the stage behind the windows: a key light, the backlight and the pool of the window in focus, the floor grid
  floor(g, cam, P) {
    const c = P.colors;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c.ground; g.fillRect(0, 0, 1920, 1080);
    const key = g.createRadialGradient(0.36 * 1920, -0.06 * 1080, 0, 0.36 * 1920, -0.06 * 1080, 1500); key.addColorStop(0, rgba(mix(c.ground, c.ink, 0.18), 0.9)); key.addColorStop(1, rgba(c.ground, 0));
    g.fillStyle = key; g.fillRect(0, 0, 1920, 1080);
    const glowAt = (q, w, h, stops) => { if (q.z > PERSP - 200) return; const s = toScreen(q); g.save(); g.translate(s.x, s.y); g.scale((w * s.k) / 2, (h * s.k) / 2); const r = g.createRadialGradient(0, 0, 0, 0, 0, 1); stops.forEach(([t, col]) => r.addColorStop(t, col)); g.fillStyle = r; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore(); };
    [0, 1, 2].forEach((i) => {
      const on = Math.max(0, 1 - Math.abs(cam.s - i)); if (on < 0.02) return;
      const p = POSES[i], lit = mix(c.ink, c.accent, 0.25);
      glowAt(project(cam, [p.x, p.y - 60, p.z - 300]), 2500, 1250, [[0, rgba(lit, 0.22 * on)], [0.46, rgba(lit, 0.08 * on)], [0.72, rgba(lit, 0)]]);
      glowAt(project(cam, [p.x, FLOOR_Y, p.z]), 1500, 260, [[0, rgba(c.accent, 0.26 * on)], [0.45, rgba(c.accent, 0.08 * on)], [0.72, rgba(c.accent, 0)]]);
    });
    // the grid, projected segment by segment; near lines bright, far ones fading into the ground
    g.lineWidth = 1.4; g.strokeStyle = rgba(c.accent, 0.34);
    const line = (a, b) => {
      for (let j = 0; j < 8; j++) {
        const pa = project(cam, [lerp(a[0], b[0], j / 8), a[1], lerp(a[2], b[2], j / 8)]), pb = project(cam, [lerp(a[0], b[0], (j + 1) / 8), a[1], lerp(a[2], b[2], (j + 1) / 8)]);
        if (pa.z > PERSP - 120 || pb.z > PERSP - 120) continue;
        const op = clamp(1.25 - (PERSP - (pa.z + pb.z) / 2) / 4200); if (op < 0.02) continue;
        const sa = toScreen(pa), sb = toScreen(pb);
        g.globalAlpha = op * op; g.beginPath(); g.moveTo(sa.x, sa.y); g.lineTo(sb.x, sb.y); g.stroke();
      }
    };
    for (let i = -14; i <= 14; i++) line([i * 240, FLOOR_Y, -3600], [i * 240, FLOOR_Y, 2400]);
    for (let j = -15; j <= 10; j++) line([-3400, FLOOR_Y, j * 240], [3400, FLOOR_Y, j * 240]);
    g.globalAlpha = 1;
  },
  pose(R, S, P, D) {
    const c = P.colors, cam = S.cam, v = cam.pose;
    this.floor(R.bgc, cam, P);
    R.world.style.transform = `translateZ(${n(-cam.pull, 2)}px) rotateX(${TILT}deg) rotateY(${n(cam.yaw, 3)}deg) translate3d(${n(-v.x, 2)}px,${n(-v.y, 2)}px,${n(-v.z, 2)}px)`;
    const wide = clamp(cam.pull / PULL_PEAK);
    R.wins.forEach((w, i) => {
      const focus = Math.min(1, Math.max(0, 1 - Math.abs(cam.s - i) * 1.25) + wide * 0.45), { words, st } = this.stateOf(i, S.f, P, D);
      w.num.style.opacity = n(0.07 + 0.3 * focus, 4);
      w.d.style.opacity = n(0.72 + 0.28 * focus, 4);
      const g = w.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W + 2 * M, H + 2 * M);
      drawTerminal(g, M, M, W, H, { ...st, focus }, P, words);
      // away from the camera the window darkens (the upstream's brightness 0.62 → 1)
      if (focus < 0.999) { g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = rgba(mix(c.ground, '#000000', 0.5), 0.38 * (1 - focus)); g.fillRect(M, M, W, H); g.restore(); }
    });
  },
  // 0: the centre of the window in focus; 1–3: each window's centre
  track(S) {
    const all = [0, 1, 2].map((i) => {
      const q = [[-W / 2, -H / 2], [W / 2, -H / 2], [-W / 2, H / 2], [W / 2, H / 2]].map(([x, y]) => toScreen(project(S.cam, local(i, x, y))));
      const xs = q.map((p) => p.x), ys = q.map((p) => p.y);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    });
    return [all[Math.min(2, Math.max(0, Math.round(S.cam.s)))], ...all];
  },
  blur: () => false,
};

// net-unfold — a box opens along its edges into a flat cross (unfold), then the six squares slide and stretch into the
// six panels of a layout (arrange); the template fills the panels afterwards. Theory: object constancy and staged
// transitions, one thing per stage (Heer & Robertson 2007). references/transitions.md#net-unfold.

import { seg, lerp, clamp, cubicInOut, decelerate, mix, rrect, ground } from './util.js';

const ORDER = ['T', 'L', 'F', 'R', 'Bo', 'K'];   // header, list, main, side tile, second tile, footer
const STAGES = {
  both: { unfold: [0, 0.5], arrange: (i) => [0.5 + i * 0.025, 0.5 + i * 0.025 + 0.375] },
  unfold: { unfold: [0, 1] },
  arrange: { arrange: (i) => [i * 0.05, i * 0.05 + 0.75] },
};

// 3D corners of each face at unfold u (0 folded cube, 1 flat cross in z = 0); x right, y up, z toward the viewer
const faces = (u, S) => {
  const H = S / 2, th = (1 - u) * Math.PI / 2, c = Math.cos(th), s = Math.sin(th), c2 = Math.cos(2 * th), s2 = Math.sin(2 * th);
  const py = -H - S * c, pz = -S * s;
  return {
    F: [[-H, -H, 0], [H, -H, 0], [H, H, 0], [-H, H, 0]],
    T: [[-H, H, 0], [H, H, 0], [H, H + S * c, -S * s], [-H, H + S * c, -S * s]],
    Bo: [[-H, -H, 0], [H, -H, 0], [H, py, pz], [-H, py, pz]],
    R: [[H, -H, 0], [H, H, 0], [H + S * c, H, -S * s], [H + S * c, -H, -S * s]],
    L: [[-H, -H, 0], [-H, H, 0], [-H - S * c, H, -S * s], [-H - S * c, -H, -S * s]],
    K: [[-H, py, pz], [H, py, pz], [H, py - S * c2, pz - S * s2], [-H, py - S * c2, pz - S * s2]],
  };
};
const rot = ([x, y, z], yaw, pitch) => {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw), z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)];
};
const netRects = (P) => {
  const S = P.size, H = S / 2, [cx, cy] = P.center;
  const at = { F: [cx - H, cy - H], T: [cx - H, cy - H - S], Bo: [cx - H, cy + H], K: [cx - H, cy + H + S], L: [cx - H - S, cy - H], R: [cx + H, cy - H] };
  return Object.fromEntries(ORDER.map((k) => [k, [at[k][0], at[k][1], S, S, 0]]));
};
// projected polygons of the cube at unfold u: [{ k, pts (screen), z, light }]
const project = (u, P) => {
  const S = P.size, H = S / 2;
  const yaw = P.yaw * (1 - u), pitch = P.pitch * (1 - u);
  const cc = rot([0, 0, -H], P.yaw, P.pitch);
  const ox = lerp(P.cubeAt[0] - cc[0], P.center[0], u), oy = lerp(P.cubeAt[1] + cc[1], P.center[1], u);
  return Object.entries(faces(u, S)).map(([k, pts]) => {
    const r = pts.map((q) => rot(q, yaw, pitch));
    const z = r.reduce((a, q) => a + q[2], 0) / 4;
    const ax = r[1][0] - r[0][0], ay = r[1][1] - r[0][1], az = r[1][2] - r[0][2];
    const bx = r[3][0] - r[0][0], by = r[3][1] - r[0][1], bz = r[3][2] - r[0][2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    return { k, pts: r.map(([x, y]) => [ox + x, oy - y]), z, light: Math.abs(nz) / (Math.hypot(nx, ny, nz) || 1) };
  }).sort((a, b) => a.z - b.z);
};

export default {
  name: 'net-unfold',
  tier: 'T2',
  beats: 2,
  beatsFor: (P) => (P.stage === 'both' ? 2 : 1),
  modes: ['morph', 'blueprint'],
  roles: ['ground', 'ink', 'line'],
  from: 'a box (the product, the run, the package)',
  to: 'the six panels of its interface, empty, ready to fill',
  interpolates: ['fold angle of each face', 'camera yaw and pitch', 'panel x, y, width, height, corner radius'],
  summary: 'A box opens along its edges into a flat cross; the six squares slide and stretch into the panels of a layout.',
  theory: 'Object constancy and staged transitions, one change per stage (Heer & Robertson 2007): the box-to-interface relation is shown, not cut.',
  defaults: {
    stage: 'both',                       // 'unfold', 'arrange', 'both'
    size: 240,                           // cube edge (px)
    center: [960, 420],                  // the front face's centre in the flat cross
    cubeAt: [1100, 540],                 // the folded cube's centre on screen
    yaw: -0.62, pitch: 0.5,
    panels: {                            // target rects [x, y, w, h] per face
      T: [80, 60, 1760, 92], L: [80, 176, 380, 844], F: [484, 176, 912, 524],
      R: [1420, 176, 420, 250], Bo: [1420, 450, 420, 250], K: [484, 724, 1356, 296],
    },
    radius: 16,                          // panel corner radius once landed
    stroke: 3,
    colors: { ground: '#EDEFF2', ink: '#15171A', line: '#C3C9D0' },
  },
  rest(side, P) {
    const st = STAGES[P.stage] || STAGES.both;
    if (side === 'from') return st.unfold ? { u: 0 } : { rects: netRects(P) };
    if (!st.arrange) return { u: 1 };
    return { rects: Object.fromEntries(ORDER.map((k) => [k, [...P.panels[k], P.radius]])) };
  },
  at(p, P) {
    const st = STAGES[P.stage] || STAGES.both;
    if (st.unfold && (!st.arrange || p < st.unfold[1])) return { u: cubicInOut(seg(p, ...st.unfold)) };
    const net = netRects(P), rects = {};
    ORDER.forEach((k, i) => {
      const s = seg(p, ...st.arrange(i)), u = s >= 1 ? 1 : decelerate(s);
      const [nx, ny, nw, nh] = net[k], [px, py, pw, ph] = P.panels[k];
      rects[k] = u >= 1 ? [px, py, pw, ph, P.radius] : [lerp(nx, px, u), lerp(ny, py, u), lerp(nw, pw, u), lerp(nh, ph, u), lerp(0, P.radius, u)];
    });
    return { rects };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const C = P.colors;
    ctx.lineJoin = 'round';
    ctx.lineWidth = P.stroke;
    ctx.strokeStyle = C.ink;
    if (S.rects) {
      for (const k of ORDER) {
        const [x, y, w, h, r] = S.rects[k];
        rrect(ctx, x, y, w, h, r);
        ctx.fillStyle = C.ground; ctx.fill(); ctx.stroke();
      }
      return;
    }
    for (const { pts, light } of project(S.u, P)) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = mix(C.ground, C.line, clamp((1 - light) * 1.1));
      ctx.fill(); ctx.stroke();
    }
  },
  // the bounding box of every face, in a fixed order (the same in the cube and the flat stage, so the switch is not speed)
  track: (S, P) => {
    const boxes = {};
    if (S.rects) for (const k of ORDER) { const [x, y, w, h] = S.rects[k]; boxes[k] = [[x, y], [x + w, y + h]]; }
    else for (const f of project(S.u, P)) {
      const xs = f.pts.map((q) => q[0]), ys = f.pts.map((q) => q[1]);
      boxes[f.k] = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
    }
    return ORDER.flatMap((k) => boxes[k]);
  },
};

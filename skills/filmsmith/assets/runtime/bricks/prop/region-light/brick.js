// region-light — the spotlight on a real asset: everything but the region in play recedes under a uniform veil of the
// ground (never a recolour, never a blur), the region keeps its pixels inside a padded box or a full-width band, a ring
// closes round it in the accent over a ground under-stroke, and a level tick marks its height at the asset's edge.
// States: off → veiled (the hole opens) → ringed (the ring draws on, the tick follows) → band (the band hops to the
// next row). From the handset template (film.js paintScreen, the level tick; the veil 0.52, ring 4 px on 9 px).
import { lerp } from '../../../handoffs/util.js';
import { placeholderPage } from '../../../handoffs/asset.js';
import { veilHole, ringRect, tick } from './light.js';

export default {
  id: 'region-light', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [640, 400], M: [1152, 720], L: [1600, 1000] },
  // veil: the veil's share (× P.veil); hole: 0 a padded box, 1 a full-width band; row: which row the band is on
  // (fractional while it hops); ring: how much of the ring is drawn; tick: its opacity
  states: { off: { veil: 0, hole: 0, row: 0, ring: 0, tick: 0 }, veiled: { veil: 1, hole: 0, row: 0, ring: 0, tick: 0 }, ringed: { veil: 1, hole: 0, row: 0, ring: 1, tick: 1 }, band: { veil: 1, hole: 1, row: 1, ring: 1, tick: 1 } },
  parts: ['veil', 'hole', 'ring', 'tick'],
  swap: { asset: { type: 'image', crop: true, optional: true } },
  roles: ['ground', 'accent'],
  defaults: () => ({ asset: null, veil: 0.52, rows: [[0.22, 0.14], [0.36, 0.14]], box: [0.34, 0.26, 0.2, 0.06] }),
  draw(g, s, P) {
    const C = P.colors, w = P.w, h = P.h, im = P.asset || placeholderPage(1600, 1000);
    g.drawImage(im, 0, 0, w, h);
    const r0 = P.rows[0], r1 = P.rows[1] || r0, ry = lerp(r0[0], r1[0], s.row) * h, rh = lerp(r0[1], r1[1], s.row) * h;
    const [bx, by, bw, bh] = P.box, pad = 14;
    const boxY = lerp(by * h, ry + (rh - bh * h) / 2, s.hole);
    const box = [[bx * w - pad, boxY - pad], [(bx + bw) * w + pad, boxY - pad], [(bx + bw) * w + pad, boxY + bh * h + pad], [bx * w - pad, boxY + bh * h + pad]];
    const band = [[0, ry], [w, ry], [w, ry + rh], [0, ry + rh]];
    const poly = s.hole >= 0.5 ? band : box;
    veilHole(g, { x: 0, y: 0, w, h }, poly, C, P.veil * s.veil);
    const r = { x: bx * w, y: boxY, w: bw * w, h: bh * h };
    ringRect(g, r, C, { draw: s.ring });
    tick(g, w + 10, boxY + (bh * h) / 2, C, s.tick);
  },
};

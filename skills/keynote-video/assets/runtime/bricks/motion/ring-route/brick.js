// ring-route — the pencil retraces where it went: over the whole desk, one stroke runs from the top of each region the
// ring visited, up to a lane above the prints, along it and down into the next, in visiting order, so the film's
// evidence reads as one path at the close. In the exhibit style it follows the rule drawn under the name.
// From the exhibit template (film.js lockup: the route over 2 beats after the rule, the regions of each read's first
// cell and both sides of each match).
import { clamp } from '../../../handoffs/util.js';
import { contextFrom, backPlane, mount, viewOf, overview, fileRect, pt, boxRing, SAMPLE_BOXES } from '../../prop/print-mount/desk.js';
import { routePoints, paintRoute } from './route.js';

export default {
  id: 'ring-route', kind: 'motion',
  tier: 'T1', family: 'line-path',
  beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'accent'],
  from: 'the whole desk from above, the regions the ring visited', to: 'one pencil stroke joining them in visiting order along a lane above the row',
  interpolates: ['the stroke’s drawn length (cubic in-out)'],
  summary: 'Over the whole desk one pencil stroke joins every region the ring visited, in order, along a lane above the prints.',
  theory: 'A path drawn through the items in the order they were shown recalls the sequence (method of loci; Yates 1966) and closes the argument on one figure.',
  defaults: () => ({ prints: 3, route: [[0, 'r0'], [1, 'r2'], [2, 'r1']] }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(g, S, P) {
    const X = contextFrom({ prints: Array.from({ length: P.prints }, () => ({})), colors: P.colors }, P.lang || 'en'), OV = overview(X.Wd);
    const v = viewOf(OV.cam);
    backPlane(g, OV.cam, X);
    for (const e of X.Wd.list) mount(g, v, e, X);
    const rects = P.route.map(([i, b]) => fileRect(X.Wd.list[i], SAMPLE_BOXES[b] || b));
    P.route.forEach(([i, b]) => boxRing(g, v, X.Wd.list[i], SAMPLE_BOXES[b] || b, 1, X));
    paintRoute(g, routePoints(rects, OV.laneY).map(([x, y]) => pt(v, x, y)), P.colors, clamp(S.u));
  },
  track() { return [[960, 540]]; },
};

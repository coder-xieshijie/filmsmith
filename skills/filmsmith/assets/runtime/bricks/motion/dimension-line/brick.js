// dimension-line — a gap measured on the print's own axis: a pencil line draws from one point to the other, offset
// to the side, with a tick across each end and dashed drops to what it measures; as it lands its chip settles with
// the computed difference, and the rest of the print steps back round the span. The climax of an exhibit film.
// From the exhibit template (film.js measureGeom, measures, measureVeil; choreo.js measure: the line in 1.5 beats,
// the chip in the last 0.2 beat, the print back over 0.5 beat).
import { clamp } from '../../../handoffs/util.js';
import { cubicOut } from '../../../motion.js';
import { contextFrom, backPlane, mount, viewOf, restCam, fileToWorld, contentOfE, rect, pt, PLACEHOLDER } from '../../prop/print-mount/desk.js';
import { geom, paintDimension, isolate, labelOf } from './dimension.js';

export default {
  id: 'dimension-line', kind: 'motion',
  tier: 'T1', family: 'line-path',
  beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'accent', 'onPaper'],
  from: 'a print at rest on the desk, two points on it', to: 'the dimension between them with its chip, the rest of the print stepped back',
  interpolates: ['the line from a to b (cubic in-out, 1.5 beats from 0.5 beat in)', 'the chip (settle, the last 0.2 beat)', 'the veil round the span (0 → 45 %)'],
  summary: 'A pencil dimension draws between two points of a print, ticks at both ends, and lands with a chip of the computed difference.',
  theory: 'A measured gap is read as a quantity only when its ends are marked on the evidence itself (Tufte 1983, data-ink on the data); computing the label keeps it honest.',
  defaults: (ctx = {}) => ({ a: { point: [544, 207], value: 62.8 }, b: { point: [1150, 207], value: 76.2 }, label: '+{diff}', digits: 1 }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(g, S, P) {
    const X = contextFrom({ prints: [{}], colors: P.colors }, P.lang || 'en'), e = X.Wd.list[0], cam = restCam(e), v = viewOf(cam);
    backPlane(g, cam, X); mount(g, v, e, X);
    const G = geom(g, pt(v, ...fileToWorld(e, ...P.a.point)), pt(v, ...fileToWorld(e, ...P.b.point)), rect(v, contentOfE(e)), v.a, labelOf(P.a.value, P.b.value, P.label, P.digits), X.F.font);
    const t = S.u * 2;   // beats
    isolate(g, G, rect(v, contentOfE(e)), P.colors, cubicOut(clamp((t - 1.8) / 0.5)));
    paintDimension(g, G, P.colors, clamp((t - 0.5) / 1.5), clamp((t - 1.8) / 0.2));
  },
  track() { return [[960, 540]]; },
};

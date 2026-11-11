// tally.js — tally-flip: the frame becomes a grid of unit tiles (gutters open), each tile is marked in place with
// an accent outline, then turns over in perspective to show the new frame, in order of distance from the origin;
// the gutters close. Theory: references/transitions.md#tally-flip.

const FLIP = `
uniform float uTile;     // tile size (film px)
uniform float uGap;      // half-gutter at its widest (film px)
uniform float uMaxR;

vec3 transition(vec2 s, float p) {
  vec2 id = floor(s / uTile);
  vec2 c = (id + 0.5) * uTile;
  float g = uGap * smoothstep(0.0, 0.14, p) * (1.0 - smoothstep(0.86, 1.0, p));
  float h = uTile * 0.5 - g;
  // order: distance from the origin, with a little jitter so the wave reads as many units
  float r = length(c - uOrigin) / uMaxR + 0.07 * (hash12(id + seedOff()) - 0.5);
  float t0 = 0.1 + 0.62 * clamp(r, 0.0, 1.0);
  float u = easeInOutCubic(lin(t0, t0 + 0.16, p));
  float th = 3.14159265 * u;
  float co = cos(th), si = sin(th);
  float lift = 1.0 + 0.07 * sin(3.14159265 * u);    // the tile rises toward the viewer as it turns
  vec2 d = (s - c) / lift;
  // inverse perspective of a tile turning about its vertical axis (camera 1400 px away)
  float D = 1400.0;
  float den = co * D - d.x * si;
  float uu = d.x * D / (abs(den) < 1e-3 ? 1e-3 : den);
  float vv = d.y * (D + uu * si) / D;
  float onTile = step(0.0, D + uu * si) * cover(h - abs(uu)) * cover(h - abs(vv));
  bool back = co < 0.0;
  vec3 img = back ? B(vec2(c.x - uu, c.y + vv)) : A(vec2(c.x + uu, c.y + vv));
  img *= 0.78 + 0.22 * abs(co);                      // a turning tile catches less light
  // the mark: an accent outline drawn in place before the turn, gone after it
  float mk = smoothstep(t0 - 0.045, t0 - 0.01, p) * (1.0 - smoothstep(t0 + 0.12, t0 + 0.17, p));
  float edge = min(h - abs(uu), h - abs(vv));
  img = mix(img, uAccent, cover(2.0 * mk - edge) * step(0.01, mk));
  return mix(uGround, img, onTile);
}`;

const farthest = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(1920 - x, y), Math.hypot(x, 1080 - y), Math.hypot(1920 - x, 1080 - y));

export default [
  {
    name: 'tally-flip',
    mode: 'tally',
    tier: 'T2',
    beats: 3,
    ease: 'gutters open 14 %, close 14 %; mark 4.5 % before each turn, gone as it lands; each turn cubic in-out over 16 %; turns spread over 62 % by distance',
    roles: ['ground', 'accent'],
    summary: 'The frame splits into unit tiles; each is marked in place, then turns over to the new frame, in order from the origin.',
    origin: [0, 0],
    frag: FLIP,
    uniforms: ({ origin, tile = 120 }) => ({ uTile: tile, uGap: 4, uMaxR: farthest(origin) }),
  },
];

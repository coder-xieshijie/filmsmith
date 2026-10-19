// slice-smear.js — slice-smear: exit, the outgoing frame is cut into bands one text line high; each band slides off to
// the right at its own speed and drags a streak along its path (the shutter integrated over 96 taps). Entry, each band
// of the incoming frame arrives as a strong horizontal streak that resolves to sharp in 0.13 s. Both frames should share
// their ground colour (the `ground` role), which shows between exit and entry. Theory:
// references/transitions.md#slice-smear.

const SMEAR = `
uniform float uBand, uTop, uCount;   // band height and first band's top (film px), number of bands
uniform float uShutter;              // exit streak shutter (fraction of p)
uniform float uResolve;              // entry resolve time (fraction of p)

float h1(float i) { return hash12(vec2(i * 7.13 + 1.7, 3.1 + uSeed)); }
vec3 Ag(vec2 s) { return s.x < 0.0 || s.x > 1920.0 ? uGround : A(s); }
vec3 Bg(vec2 s) { return s.x < 0.0 || s.x > 1920.0 ? uGround : B(s); }
// displacement of band i at p: expo in over the exit half
float dispAt(float i, float p) { return (p <= 0.0 ? 0.0 : pow(2.0, 10.0 * (sat(p / 0.5) - 1.0))) * (1900.0 + 1500.0 * h1(i)); }

vec3 transition(vec2 s, float p) {
  float i = floor((s.y - uTop) / uBand);
  bool inBands = i >= 0.0 && i < uCount;
  if (!inBands) return p < 0.5 ? A(s) : B(s);
  if (p < 0.5) {
    float d1 = dispAt(i, p), d0 = dispAt(i, p - uShutter);
    float span = min(d1 - d0, 600.0);
    if (span < 2.0) return Ag(vec2(s.x - d1, s.y));
    vec3 acc = vec3(0.0);
    for (int k = 0; k < 96; k++) acc += Ag(vec2(s.x - d1 + span * (float(k) + 0.5) / 96.0, s.y));
    return acc / 96.0;
  }
  float lag = uCount > 1.0 ? 0.1 * i / (uCount - 1.0) : 0.0;
  float u = (p - 0.5 - lag) / uResolve;
  if (u < 0.0) return uGround;
  float L = (400.0 + 240.0 * h1(i + 77.0)) * (1.0 - easeOutExpo(u));
  if (L < 0.5) return B(s);
  vec3 acc = vec3(0.0);
  for (int k = 0; k < 96; k++) acc += Bg(vec2(s.x + 0.25 * L + L * (float(k) + 0.5) / 96.0, s.y));
  return acc / 96.0;
}`;

export default [
  {
    name: 'slice-smear',
    mode: 'phosphor, pulse',
    tier: 'T1',
    beats: 1,
    ease: 'exit 0.25 s expo in per band (speeds 1900–3400 px over the exit), streak shutter 0.04 s; entry per band 0.13 s expo out, bands 0.1 of p apart',
    roles: ['ground'],
    summary: 'The frame is cut into text-line bands that slide off with streaks; the new frame\'s bands arrive as streaks that resolve.',
    frag: SMEAR,
    // band: the mono line height (px); top: first band's top; count: bands (default: to the bottom of the frame)
    uniforms: ({ band = 76, top = 0, count, dur = 0.5 }) => ({
      uBand: band, uTop: top, uCount: count ?? Math.ceil((1080 - top) / band), uShutter: 0.04 / dur, uResolve: 0.13 / dur,
    }),
  },
];

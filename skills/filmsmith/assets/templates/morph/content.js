// content.js — the film. The only file edited for an ordinary morph film; TEMPLATE.md lists every slot and limit.
// No duration and no bars: `npm run fit` sizes every scene from its copy and choreography (timing.rules.js) and
// prints the table. Optional `bpm` (112–128, default 120) or `target` (seconds; the tempo moves to meet it).
//
// product holds the facts several scenes draw from (the docs page, the card, the console all show the same call and
// body; the counts on the cube are computed from these lists). Copy may quote them: {endpoints} {schemas} {sdks}
// {title} {version} {file} {name} {status} {reason} {ms}; any other {token} (the path parameter {id}) stays as written.
//
// The example's subject is made up for the template: "quillstack", a tool that turns one API spec into the whole
// docs site. Nothing here is a claim about a real product; replace all of it. Its numbers (84 ms, 4200) are
// illustrative and say so in the film's README.
export default {
  palette: 'slate',
  corners: 'round', // form variant: 'round' (default) or 'cut' (chamfered corners); mode card "Variants"
  seed: 20261019,
  meta: { title: 'quillstack — morph example', url: '' },
  product: {
    name: 'quillstack',
    title: 'Invoices API', version: 'v2.3', file: 'invoices.yaml', base: '/v2',
    endpoints: [['GET', '/invoices'], ['POST', '/invoices'], ['GET', '/invoices/{id}'], ['PATCH', '/invoices/{id}'], ['DELETE', '/invoices/{id}']],
    select: 2, // the endpoint the film follows (index in endpoints)
    schemas: ['Invoice', 'LineItem', 'Customer', 'Money', 'Error'],
    sdks: ['python', 'node', 'go', 'curl'],
    call: { status: 200, reason: 'OK', ms: 84 },
    body: [['id', 'inv_8KQ2', 'string'], ['amount', 4200, 'integer'], ['currency', 'eur', 'string'], ['status', 'open', 'enum']],
    // The product's mark, in grid units: a stepped nib, three layers of a stack split by the slit, the point as the
    // drop of ink at its tip. The panels of the interface fly into these parts; the point lands on `dot`.
    mark: {
      parts: [[0, 0, 4.6, 2], [5.4, 0, 4.6, 2], [1.4, 2.8, 3.2, 2], [5.4, 2.8, 3.2, 2], [3, 5.6, 1.6, 2], [5.4, 5.6, 1.6, 2]],
      dot: [5, 8.9, 0.75],
    },
  },
  scenes: [
    // point: the film opens on the accent point
    { type: 'point' },
    // line: it shoots into a line, which becomes the baseline of the endpoint; the path parameter is filled in
    { type: 'line', text: 'GET /v2/invoices/{id}', swap: ['{id}', 'inv_8KQ2'] },
    // plane: the line thickens into the request pill; Send is pressed
    { type: 'press', action: 'Send' },
    // the pill grows into the response card, then the same card is re-read as the schema
    { type: 'card' },
    { type: 'card', name: 'Invoice' },
    // solid: the card becomes a hexagon, three lines make it a cube: the spec
    { type: 'solid', caption: 'One spec in.', faces: ['{endpoints} endpoints', '{schemas} schemas', '{sdks} SDKs'] },
    // interface: the cube unfolds into the generated docs page
    { type: 'unfold', caption: 'Every doc out.', ref: 'Retrieve an invoice', code: ['python', 'qs.invoices.get(id)'] },
    // the page gathers into one card at main size; one tab per language
    { type: 'focus', title: 'Retrieve an invoice', run: 'Run', tabs: [
      { lang: 'python', code: ['qs.invoices.get("inv_8KQ2")'] },
      { lang: 'node', code: ['await qs.invoices.get(id)'] },
      { lang: 'curl', code: ['curl $QS/v2/invoices/inv_8KQ2'] },
    ] },
    // the Run button floods the frame: the live console; the claim is the climax
    { type: 'flood', claim: 'Docs that run.' },
    // mark: the card splits into the nib, the point lands as its drop of ink
    { type: 'mark', line: 'docs from one spec', cmd: 'npx quillstack build invoices.yaml' },
  ],
};

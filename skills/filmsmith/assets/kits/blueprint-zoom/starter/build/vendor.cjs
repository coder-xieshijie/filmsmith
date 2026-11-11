#!/usr/bin/env node
// Puts the pinned GSAP build into <project>/vendor/ (gsap.min.js, MotionPathPlugin.min.js, DrawSVGPlugin.min.js).
// GSAP is not redistributed with the skill: it is fetched from the npm registry and checked against pinned
// sha256 sums (licence: GreenSock's standard "no charge" licence, https://gsap.com/standard-license).
// A kit that draws with another library lists it in the project's vendor.json, fetched the same way from the npm registry:
//   { "<file name under vendor/>": { "package": "<npm name>", "version": "<x.y.z>", "file": "<path inside the package>", "sha256": "<sum>",
//     "licence": "<SPDX id and URL>" } }
// assemble.cjs adds one <script src="vendor/<file name>"> per entry after GSAP, in the order listed. vendor.json belongs to the kit
// (kit-sync copies it); name the library and its licence in THIRD-PARTY.md.
// assemble.cjs checks every file's sha256 against its pin on each run (stale(), about 1 ms) and runs this script when one is missing,
// damaged or pinned anew (a kit-sync that moved a version); it does nothing when every file is present with the right hash.
//   node build/vendor.cjs [project-dir]      exit 0 ready, 1 download or hash failed, or vendor.json unreadable
//   require('./vendor.cjs').stale(dir)       the files under vendor/ whose hash does not match (throws "vendor.json: …" when it is malformed)
// To move the pin: change VERSION and the three sums together, then re-check a finished film (README "Engine version").
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
const VERSION = '3.15.0';
const FILES = {
  'gsap.min.js': '92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb',
  'MotionPathPlugin.min.js': 'ace44a07c6c179f5347d9b46a152d468e4c9f272ee0d68bf0354e00d60000693',
  'DrawSVGPlugin.min.js': 'beb19529f54c1212f1f5117d027be01afda2f363a4926d32aa979bc11140edc1',
};
const URL = `https://registry.npmjs.org/gsap/-/gsap-${VERSION}.tgz`;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
// The project's extra libraries (vendor.json), {} when it has none
const readExtra = (dir) => {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'vendor.json'), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw new Error(`vendor.json: ${e.message}`); }
};
const pins = (dir) => Object.assign({}, FILES, Object.fromEntries(Object.entries(readExtra(dir)).map(([f, e]) => [f, e.sha256])));
const okAt = (out, f, sum) => { try { return sha(fs.readFileSync(path.join(out, f))) === sum; } catch (_) { return false; } };
const stale = (dir) => Object.entries(pins(dir)).filter(([f, sum]) => !okAt(path.join(dir, 'vendor'), f, sum)).map(([f]) => f);
module.exports = { stale, readExtra, FILES, VERSION };

// Minimal tar reader: 512-byte headers, name at 0..100, prefix at 345..500, octal size at 124..136
function untar(tar) {
  const files = {};
  for (let off = 0; off + 512 <= tar.length;) {
    const h = tar.subarray(off, off + 512);
    if (h.every((b) => b === 0)) break;
    const str = (a, b) => h.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
    const name = (str(345, 500) ? str(345, 500) + '/' : '') + str(0, 100);
    const size = parseInt(str(124, 136).trim() || '0', 8);
    files[name] = tar.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

const tgzUrl = (pkg, v) => `https://registry.npmjs.org/${pkg}/-/${pkg.split('/').pop()}-${v}.tgz`;
async function fetchTgz(url) {
  let res;
  for (let i = 1; ; i++) {
    try { res = await fetch(url); if (res.ok || res.status < 500 || i >= 4) break; } catch (e) { if (i >= 4) throw e; }
    await new Promise((r) => setTimeout(r, 500 * 2 ** (i - 1)));
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return untar(zlib.gunzipSync(Buffer.from(await res.arrayBuffer())));
}

async function main() {
  const dir = path.resolve(process.argv[2] || path.join(__dirname, '..')), out = path.join(dir, 'vendor');
  let EXTRA;
  try { EXTRA = readExtra(dir); } catch (e) { console.error(`[vendor] ${e.message}`); process.exit(1); }
  const say = (f, sum) => { if (fs.existsSync(path.join(out, f)) && !okAt(out, f, sum)) console.error(`[vendor] vendor/${f}: sha256 does not match its pin (damaged, or the pin moved): fetching it again`); };
  const put = (f, buf) => { fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, f + '.part'), buf); fs.renameSync(path.join(out, f + '.part'), path.join(out, f)); };
  const todo = Object.keys(FILES).filter((f) => !okAt(out, f, FILES[f]));
  if (todo.length) {
    for (const f of todo) say(f, FILES[f]);
    const all = await fetchTgz(URL);
    for (const f of todo) {
      const buf = all['package/dist/' + f];
      if (!buf) throw new Error(`${f} not in ${URL}`);
      if (sha(buf) !== FILES[f]) throw new Error(`${f}: sha256 ${sha(buf)} does not match the pin`);
      put(f, buf);
    }
    console.error(`[vendor] GSAP ${VERSION}: ${todo.join(', ')} → vendor/`);
  }
  for (const f of Object.keys(EXTRA).filter((k) => !okAt(out, k, EXTRA[k].sha256))) {
    say(f, EXTRA[f].sha256);
    const e = EXTRA[f], url = tgzUrl(e.package, e.version);
    const buf = (await fetchTgz(url))['package/' + e.file];
    if (!buf) throw new Error(`${e.file} not in ${url}`);
    if (sha(buf) !== e.sha256) throw new Error(`${f}: sha256 ${sha(buf)} does not match vendor.json`);
    put(f, buf);
    console.error(`[vendor] ${e.package} ${e.version} → vendor/${f}`);
  }
}
if (require.main === module) main().catch((e) => { console.error(`[vendor] could not set up the vendor files: ${e.message}`); process.exit(1); });

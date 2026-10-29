#!/usr/bin/env node
// Puts the pinned GSAP build into <project>/vendor/ (gsap.min.js, MotionPathPlugin.min.js, DrawSVGPlugin.min.js).
// GSAP is not redistributed with the skill: it is fetched from the npm registry and checked against pinned
// sha256 sums (licence: GreenSock's standard "no charge" licence, https://gsap.com/standard-license).
// assemble.cjs runs this when a file is missing; it does nothing when all three are present with the right hash.
//   node build/vendor.cjs [project-dir]      exit 0 ready, 1 download or hash failed
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
const dir = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const out = path.join(dir, 'vendor');
const ok = (f) => { try { return sha(fs.readFileSync(path.join(out, f))) === FILES[f]; } catch (_) { return false; } };

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

(async () => {
  const todo = Object.keys(FILES).filter((f) => !ok(f));
  if (!todo.length) return;
  let res;
  for (let i = 1; ; i++) {
    try { res = await fetch(URL); if (res.ok || res.status < 500 || i >= 4) break; } catch (e) { if (i >= 4) throw e; }
    await new Promise((r) => setTimeout(r, 500 * 2 ** (i - 1)));
  }
  if (!res.ok) throw new Error(`${res.status} ${URL}`);
  const all = untar(zlib.gunzipSync(Buffer.from(await res.arrayBuffer())));
  fs.mkdirSync(out, { recursive: true });
  for (const f of todo) {
    const buf = all['package/dist/' + f];
    if (!buf) throw new Error(`${f} not in ${URL}`);
    if (sha(buf) !== FILES[f]) throw new Error(`${f}: sha256 ${sha(buf)} does not match the pin`);
    fs.writeFileSync(path.join(out, f + '.part'), buf); fs.renameSync(path.join(out, f + '.part'), path.join(out, f));
  }
  console.error(`[vendor] GSAP ${VERSION}: ${todo.join(', ')} → vendor/`);
})().catch((e) => { console.error(`[vendor] could not set up GSAP ${VERSION}: ${e.message}`); process.exit(1); });

#!/usr/bin/env node
// setup-vendor.mjs <film-dir>
// Puts the pinned GSAP build at <film-dir>/lib/vendor/gsap.min.js, so a film renders without a CDN. GSAP is
// fetched from the npm registry at scaffold time (it is not redistributed with the skill; its licence is
// GreenSock's standard "no charge" licence, https://gsap.com/standard-license) and checked against a pinned
// sha256. Skips the download when the file is already there with the right hash. Exits 1 on any failure:
// index.html loads only the local file, so a film without it cannot render.
//
// To move the pin: change GSAP_VERSION and GSAP_SHA256 together (sha256 of dist/gsap.min.js), then re-render
// the seven templates.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';

export const GSAP_VERSION = '3.14.2';
export const GSAP_SHA256 = 'c174bfce53a729418d57a8ad8625e7247c793a22fef8e2851e3cfa3de9cd8280';
const URL = `https://registry.npmjs.org/gsap/-/gsap-${GSAP_VERSION}.tgz`;
const WANT = 'package/dist/gsap.min.js';

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// Minimal tar reader: 512-byte headers, name at 0..100, prefix at 345..500, octal size at 124..136.
const untarOne = (tar, want) => {
  for (let off = 0; off + 512 <= tar.length;) {
    const h = tar.subarray(off, off + 512);
    if (h.every((b) => b === 0)) break;
    const str = (a, b) => h.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
    const name = (str(345, 500) ? str(345, 500) + '/' : '') + str(0, 100);
    const size = parseInt(str(124, 136).trim() || '0', 8);
    if (name === want) return tar.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return null;
};

const dir = resolve(process.argv[2] || '.');
const dest = join(dir, 'lib', 'vendor', 'gsap.min.js');
const have = await readFile(dest).catch(() => null);
if (have && sha(have) === GSAP_SHA256) process.exit(0);

// Network hiccups (a reset connection, a 5xx) are retried three times with a short back-off; a 4xx is final.
const fetchRetry = async (url, tries = 4) => {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500 || i >= tries) return res;
    } catch (e) { if (i >= tries) throw e; }
    await new Promise((r) => setTimeout(r, 500 * 2 ** (i - 1)));
  }
};
try {
  const res = await fetchRetry(URL);
  if (!res.ok) throw new Error(`${res.status} ${URL}`);
  const file = untarOne(gunzipSync(Buffer.from(await res.arrayBuffer())), WANT);
  if (!file) throw new Error(`${WANT} not found in ${URL}`);
  if (sha(file) !== GSAP_SHA256) throw new Error(`gsap.min.js sha256 ${sha(file)} does not match the pin ${GSAP_SHA256}`);
  await mkdir(join(dir, 'lib', 'vendor'), { recursive: true });
  await writeFile(dest + '.part', file);
  await rename(dest + '.part', dest);
  console.log(`vendor: gsap ${GSAP_VERSION} → lib/vendor/gsap.min.js`);
} catch (e) {
  console.error(`vendor: could not set up GSAP ${GSAP_VERSION}: ${e.message}`);
  process.exit(1);
}

#!/usr/bin/env node
// The HyperFrames engine version is written here and nowhere else: every engine call in build/, package.json's
// dev / hf scripts, build/browser.cjs and the skill's scripts/review-packet.mjs go through this file.
//   node build/hf.cjs <command> [args]   = npx --yes hyperframes@<VERSION> <command> [args]   (same as npm run hf -- <command>)
// To upgrade: change VERSION, check a finished film's look as the kit README's "Engine version" section says, then commit.
'use strict';
const cp = require('child_process');
const VERSION = '0.8.214';
const argv = (args) => ['--yes', `hyperframes@${VERSION}`, ...args];
// Run one engine command synchronously; returns { status, stdout, stderr }
const run = (args, opts = {}) => cp.spawnSync('npx', argv(args), { encoding: 'utf8', maxBuffer: 256 << 20, ...opts });
// Run a command that takes --json (snapshot and friends) and parse its output; throws with the engine's last lines on failure
function json(args, opts = {}) {
  const r = run([...args, '--json'], opts);
  const s = r.stdout || '';
  const i = s.indexOf('{');
  let j = null;
  try { j = JSON.parse(s.slice(i)); } catch (_) {}
  if (r.status !== 0 || !j) throw new Error(`hyperframes ${args[0]} failed (exit ${r.status}): ${(r.stderr || s).trim().split('\n').slice(-6).join(' | ')}`);
  return j;
}
module.exports = { VERSION, argv, run, json };
if (require.main === module) {
  const r = cp.spawnSync('npx', argv(process.argv.slice(2)), { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}

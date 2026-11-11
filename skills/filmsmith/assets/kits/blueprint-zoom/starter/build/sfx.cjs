#!/usr/bin/env node
// Collect sound cues (npm run render runs this): open the page directly, read the cues each segment registered with ctx.hit(),
// write sfx.json; assemble then writes them into index.html as audio tracks.
'use strict';
const fs = require('fs'), path = require('path');
const { dir, open } = require('./common.cjs');
(async () => {
  const { page, close } = await open();
  const list = await page.evaluate(() => window.__sfx);
  await close();
  fs.writeFileSync(path.join(dir, 'sfx.json'), JSON.stringify(list, null, 0) + '\n');
  console.error(`[sfx] ${list.length} cues`);
})().catch((e) => { console.error(e); process.exit(2); });

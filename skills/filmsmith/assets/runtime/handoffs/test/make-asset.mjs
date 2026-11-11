#!/usr/bin/env node
// make-asset.mjs — write asset.png, the neutral test image the asset hand-offs' self-test cases load as a real image
// (an ImageBitmap decoded from a file, as a film passes its screenshots). Drawn here in code, no third-party pixels:
// a light page of grey rows with one tinted column whose dark blocks stand in for printed numbers, and a dark mark
// in the header that stands in for a logo. 1600 × 1000. The boxes selftest.html uses follow from LAYOUT.
// Run: node make-asset.mjs (writes asset.png next to it).
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LAYOUT = { w: 1600, h: 1000, header: 160, row: 140, rows: 6, col: [440, 640], glyph: [490, 100, 36], mark: [60, 40, 360, 80] };
const { w: W, h: H } = LAYOUT;
const px = new Uint8Array(W * H * 3);
const rect = (x, y, w, h, hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) px.set(c, (j * W + i) * 3);
};
rect(0, 0, W, H, '#F2F2EF');
rect(0, 0, W, LAYOUT.header, '#E2E2DE');
rect(...LAYOUT.mark, '#2A2D33');
rect(LAYOUT.mark[0] + 20, LAYOUT.mark[1] + 20, 40, 40, '#F2F2EF');
const lens = [0.62, 0.48, 0.71, 0.36, 0.55, 0.44];
for (let r = 0; r < LAYOUT.rows; r++) {
  const y = LAYOUT.header + r * LAYOUT.row;
  if (r % 2) rect(0, y, W, LAYOUT.row, '#EBEBE7');
  rect(80, y + 56, 300, 28, '#9A9A96');
  rect(LAYOUT.col[0], y + 2, LAYOUT.col[1] - LAYOUT.col[0], LAYOUT.row - 4, '#E4EAF1');
  rect(LAYOUT.glyph[0], y + 52, LAYOUT.glyph[1], LAYOUT.glyph[2], '#22252A');
  rect(700, y + 56, Math.round(800 * lens[r]), 28, '#B5B5B0');
}
rect(0, LAYOUT.header - 2, W, 2, '#C8C8C3');

// PNG: 8-bit RGB, filter 0 per scanline, one IDAT
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'asset.png'), png);
  console.log(`asset.png ${W}×${H}, ${png.length} bytes`);
}

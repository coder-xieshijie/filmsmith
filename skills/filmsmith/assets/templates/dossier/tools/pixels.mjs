// tools/pixels.mjs — decode an image file to raw RGB with ffmpeg (no npm dependencies): { w, h, data: Uint8Array }.
import { execFileSync } from 'node:child_process';

const cache = new Map();
export const pixels = (file) => {
  if (cache.has(file)) return cache.get(file);
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split(',').map(Number);
  const data = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: w * h * 3 + 1024 });
  const px = { w, h, data: new Uint8Array(data.buffer, data.byteOffset, w * h * 3) };
  cache.set(file, px);
  return px;
};

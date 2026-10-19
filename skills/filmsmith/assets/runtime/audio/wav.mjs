// wav.mjs — WAV write (PCM 16/24-bit or 32-bit float) and decode of any audio file through ffmpeg.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

// Encode channels (array of Float32Array/Float64Array, equal length) to a WAV Buffer.
export const encodeWav = (channels, sr = 48000, { bits = 24 } = {}) => {
  const ch = channels.length, n = channels[0].length, float = bits === 32, bps = bits / 8;
  const data = n * ch * bps, buf = Buffer.alloc(44 + data);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + data, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(float ? 3 : 1, 20); buf.writeUInt16LE(ch, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * ch * bps, 28); buf.writeUInt16LE(ch * bps, 32); buf.writeUInt16LE(bits, 34);
  buf.write('data', 36); buf.writeUInt32LE(data, 40);
  let o = 44;
  const max = bits === 16 ? 32767 : 8388607;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      let v = channels[c][i];
      if (!(v === v)) v = 0; // NaN guard
      if (float) { buf.writeFloatLE(v, o); o += 4; continue; }
      v = v > 1 ? 1 : v < -1 ? -1 : v;
      const q = Math.round(v * max);
      if (bits === 16) { buf.writeInt16LE(q, o); o += 2; } else { buf.writeIntLE(q, o, 3); o += 3; }
    }
  }
  return buf;
};

// writeWav(path, channels, sr, { bits: 24 }) — mono or stereo; creates the folder if needed.
export const writeWav = async (path, channels, sr = 48000, opts = {}) => {
  if (!Array.isArray(channels)) channels = [channels];
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, encodeWav(channels, sr, opts));
  return path;
};

// readAudio(path, { sr }) → [L, R] Float32Array, decoded and resampled by ffmpeg (any format ffmpeg reads).
export const readAudio = (path, { sr = 48000, offset = 0, duration } = {}) => {
  const args = ['-hide_banner', '-loglevel', 'error', '-ss', String(offset), '-i', path];
  if (duration) args.push('-t', String(duration));
  args.push('-f', 'f32le', '-ac', '2', '-ar', String(sr), '-');
  const r = spawnSync('ffmpeg', args, { maxBuffer: 2 ** 31 });
  if (r.status !== 0) throw new Error(`readAudio: ffmpeg failed on ${path}: ${r.stderr}`);
  const f = new Float32Array(Uint8Array.from(r.stdout).buffer);
  const n = f.length / 2, L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  return [L, R];
};

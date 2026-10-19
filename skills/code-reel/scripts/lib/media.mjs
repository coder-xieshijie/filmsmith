// media.mjs — ffprobe / ffmpeg access for check-film. No npm dependencies.
//   run(cmd, args)                  synchronous run, exits 2 when the tool is missing
//   probe(file)                     { video, audio, format, fps, duration, frames }
//   streamFrames(file, opts, onFrame) decodes the video once at w×h rgb24; resolves with ffmpeg's stderr
//   grabFrame(file, t, w, h)        one rgb24 frame at time t (accurate seek)
//   decodePcm(file, sr)             { mono, peak } float32 samples (peak = max |L|, |R|)
//   ebur128(file)                   { I, LRA, TP, t[], M[], S[] } — 100 ms momentary / short-term series

import { spawn, spawnSync } from 'node:child_process';

export const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 30, ...opts });
  if (r.error) { console.error(`${cmd} not found on PATH (${r.error.message})`); process.exit(2); }
  return r;
};

const ratio = (s) => { const [a, b] = String(s || '0/1').split('/').map(Number); return b ? a / b : a; };

export const probe = (file) => {
  const p = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]).stdout || '{}');
  const video = (p.streams || []).find((s) => s.codec_type === 'video');
  const audio = (p.streams || []).find((s) => s.codec_type === 'audio');
  if (!video) return { video: null };
  const fps = ratio(video.avg_frame_rate) || ratio(video.r_frame_rate);
  const duration = Number(video.duration || p.format?.duration || 0);
  let frames = Number(video.nb_frames || 0);
  if (!frames) {
    const c = JSON.parse(run('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'json', file]).stdout);
    frames = Number(c.streams?.[0]?.nb_read_frames || 0);
  }
  return { video, audio, format: p.format, fps, duration, frames };
};

// Decode every frame once, scaled with area averaging. `vf` adds filters before the pixel format
// conversion (blackdetect logs to stderr at info level). onFrame(buf, index) gets a view that is only
// valid during the call.
export const streamFrames = (file, { w, h, vf = [] }, onFrame) => new Promise((resolve, reject) => {
  const size = w * h * 3;
  const filters = [`scale=${w}:${h}:flags=area`, ...vf, 'format=rgb24'].join(',');
  const p = spawn('ffmpeg', ['-hide_banner', '-nostats', '-v', 'info', '-i', file, '-map', '0:v:0', '-vf', filters, '-an', '-f', 'rawvideo', '-']);
  let err = '', pending = [], have = 0, index = 0;
  p.on('error', (e) => reject(new Error(`ffmpeg not found on PATH (${e.message})`)));
  p.stderr.on('data', (d) => { err += d; if (err.length > 1 << 24) err = err.slice(-(1 << 23)); });
  p.stdout.on('data', (d) => {
    pending.push(d); have += d.length;
    if (have < size) return;
    let buf = Buffer.concat(pending), off = 0;
    while (buf.length - off >= size) { onFrame(buf.subarray(off, off + size), index++); off += size; }
    pending = [buf.subarray(off)]; have = buf.length - off;
  });
  p.on('close', (code) => (code === 0 ? resolve({ stderr: err, frames: index }) : reject(new Error(`ffmpeg exited ${code}\n${err.slice(-1500)}`))));
});

export const grabFrame = (file, t, w = 1920, h = 1080) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', t.toFixed(3), '-i', file, '-frames:v', '1', '-vf', `scale=${w}:${h},format=rgb24`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  return r.status === 0 && r.stdout.length === w * h * 3 ? r.stdout : null;
};

// Mixed track as mono float32 (mean of the channels) plus the per-sample peak of either channel.
export const decodePcm = (file, sr = 48000) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:a:0', '-ac', '2', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 2 ** 31 });
  if (r.status !== 0) return null;
  const b = r.stdout, st = new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 8) * 2);
  const n = st.length / 2, mono = new Float32Array(n), peak = new Float32Array(n);
  for (let i = 0; i < n; i++) { const l = st[2 * i], rr = st[2 * i + 1]; mono[i] = (l + rr) / 2; peak[i] = Math.max(Math.abs(l), Math.abs(rr)); }
  return { mono, peak, sr };
};

export const ebur128 = (file) => {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-v', 'info', '-i', file, '-map', '0:a:0', '-vn', '-af', 'ebur128=peak=true:framelog=info', '-f', 'null', '-']);
  const s = r.stderr;
  const t = [], M = [], S = [];
  const val = (x) => (x === '-inf' || x === 'nan' ? -120 : Number(x));
  for (const m of s.matchAll(/t:\s*([\d.]+)\s+TARGET:[^M]*M:\s*(-?[\d.]+|-inf|nan)\s+S:\s*(-?[\d.]+|-inf|nan)/g)) {
    t.push(Number(m[1])); M.push(val(m[2])); S.push(val(m[3]));
  }
  const sum = s.slice(s.lastIndexOf('Summary:'));
  const num = (re) => { const m = re.exec(sum); return m ? (m[1] === '-inf' ? -Infinity : Number(m[1])) : NaN; };
  return { I: num(/I:\s+(-?[\d.]+|-inf) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), t, M, S };
};

// Keyframe times: the encoder refreshes the whole picture there, which shows as a faint uniform frame
// difference that is not motion.
export const keyframes = (file) => {
  const r = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-skip_frame', 'nokey', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', file]);
  return r.stdout.split('\n').map((s) => parseFloat(s)).filter((x) => Number.isFinite(x));
};

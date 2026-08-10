#!/usr/bin/env node
/* Flag rendered stills that have content touching the frame edge.
 *
 * Every individual URL can return 200 while a page is broken, and every still
 * can be non-blank while a label sits half outside the frame. This checks the
 * outer band of each PNG for drawn pixels.
 *
 *   node scripts/check-frames.mjs out/still-*.png
 *
 * Exceptions: a beat that deliberately fills the frame (a black title card, a
 * full-width rule) will trip this. Judge the report; do not silence it.
 */
import { readFileSync } from 'node:fs';
import zlib from 'node:zlib';

const BG = [11, 17, 29];        // PALETTE.bg
const BAND = 10;                // px inspected at each edge
const TOLERANCE = 14;           // per-channel distance still counted as background
const NOISE = 6;                // hits below this are anti-aliasing, not content

function decodePng(buf) {
  // Minimal PNG reader: 8-bit RGB/RGBA, non-interlaced.
  let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG: depth ${bitDepth}, colour type ${colorType}`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride); rp += stride;
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      switch (filter) {
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); break;
        }
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, channels, px: out };
}

const isBg = (p, i) => Math.abs(p[i] - BG[0]) < TOLERANCE
  && Math.abs(p[i + 1] - BG[1]) < TOLERANCE
  && Math.abs(p[i + 2] - BG[2]) < TOLERANCE;

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: check-frames.mjs <png…>'); process.exit(2); }

let bad = 0;
for (const f of files) {
  let img;
  try { img = decodePng(readFileSync(f)); }
  catch (e) { console.log(`  FAIL  ${f}  (unreadable: ${e.message})`); bad++; continue; }
  const { w, h, channels, px } = img;
  let hits = 0;
  const at = (x, y) => (y * w + x) * channels;
  for (let y = 0; y < h; y += 3) {
    for (let x = 0; x < BAND; x++) { if (!isBg(px, at(x, y))) hits++; if (!isBg(px, at(w - 1 - x, y))) hits++; }
  }
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < BAND; y++) { if (!isBg(px, at(x, y))) hits++; if (!isBg(px, at(x, h - 1 - y))) hits++; }
  }
  if (hits > NOISE) { console.log(`  EDGE  ${f}  (${hits} px touching the frame)`); bad++; }
  else console.log(`  ok    ${f}`);
}
console.log(bad ? `\n  ${bad} still(s) failed` : `\n  ${files.length} still(s) clean`);
process.exit(bad ? 1 : 0);

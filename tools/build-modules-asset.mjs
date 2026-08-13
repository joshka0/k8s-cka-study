#!/usr/bin/env node
/* Generate assets/modules.js — the module-video metadata the learn path uses.
 *
 *   node tools/build-modules-asset.mjs
 *
 * The module scripts are the source of truth. This file is derived, never
 * hand-edited, so a unit's video section cannot drift from the video itself.
 * A unit only gets a section once its video actually exists on disk.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MODULES = path.join(ROOT, 'video/modules');
const OUT_DIR = path.join(ROOT, 'video/out');
const AUDIO_DIR = path.join(ROOT, 'experiments');
const DECK_DIR = path.join(ROOT, 'deck/by-module');

/* Where the player fetches video from.
 *
 * Default is the repository itself, which is how this started and still works
 * for a local checkout. Set VIDEO_BASE_URL to serve from object storage:
 *
 *   VIDEO_BASE_URL=https://videos.example.dev node tools/build-modules-asset.mjs
 *
 * Two limits push video off the repository as the course grows. Cloudflare
 * Pages refuses any file over 25 MiB, and the largest module is already 22 MB.
 * And git keeps every version of a binary forever, so one re-render of all 27
 * modules adds about 400 MB to history that cannot be reclaimed.
 */
const VIDEO_BASE_URL = (process.env.VIDEO_BASE_URL || '').replace(/\/+$/, '');

/** First 8 hex of the file's MD5 — matches the etag R2 reports. */
function contentHash(file) {
  return createHash('md5').update(readFileSync(file)).digest('hex').slice(0, 8);
}

/* The "listen in class" tracks for a unit, when they have been produced.
 *
 * Two variants share one shape: the base lecture, and an extended cut that
 * adds retrieval practice — the teacher asks a student to recall a term
 * before the question that reuses it. Same material, more reinforcement, so
 * they are variants of one thing rather than two separate lessons.
 *
 * These live beside a cache/ of per-segment synthesis that must never be
 * published, so each file is addressed by name rather than by scanning the
 * directory. Hashed for the same reason video is: the filename does not
 * change between runs, and the bucket serves an immutable year-long cache. */
function audioFor(pad) {
  const out = {};
  for (const [key, infix] of [['audio', ''], ['audioExtended', '-extended']]) {
    const stem = `u${pad}-listen-in-class${infix}`;
    const rel = path.join(`${stem}-audio`, `${stem}.mp3`);
    const full = path.join(AUDIO_DIR, rel);
    if (!existsSync(full)) continue;
    out[key] = VIDEO_BASE_URL
      ? `${VIDEO_BASE_URL}/audio/${stem}.mp3?v=${contentHash(full)}`
      : `experiments/${rel}`;
    out[`${key}Seconds`] = Math.round(mp3Seconds(full));
  }
  return Object.keys(out).length ? out : null;
}

/* The single-unit Anki deck, when one has been built.
 *
 * Matched on the uNN prefix rather than by rebuilding the deck builder's slug
 * rule: the slug comes from the course unit title, and two copies of that rule
 * would drift the first time a title is edited. */
function deckFor(pad) {
  if (!existsSync(DECK_DIR)) return null;
  const file = readdirSync(DECK_DIR).find((f) => f.startsWith(`u${pad}-`) && f.endsWith('.apkg'));
  return file ? { deck: `deck/by-module/${file}` } : null;
}

/* Duration straight from the MP3 frame headers.
 *
 * ffprobe would be a dependency for one number in a build that otherwise needs
 * nothing but node. These are constant-bitrate files from one encoder, so the
 * first frame's bitrate describes the whole file. */
function mp3Seconds(file) {
  const buf = readFileSync(file);
  const RATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  for (let i = 0; i + 1 < buf.length; i++) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) continue;
    const kbps = RATES[(buf[i + 2] & 0xf0) >> 4];
    if (!kbps) continue;
    return (buf.length - i) * 8 / (kbps * 1000);
  }
  return 0;
}

/** Measured narration wins, exactly as the composition resolves it. */
function seconds(dir, script) {
  const p = path.join(dir, 'durations.json');
  const measured = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  return script.beats.reduce((acc, b) => {
    const m = measured[b.id];
    return acc + (typeof m === 'number' && m > 0 ? m : b.estSeconds);
  }, 0);
}

// A clean checkout has no rendered video at all. Reading the directory
// unconditionally crashed instead of producing the script-only state the
// no-video branch below already handles. Read it once, tolerantly.
const VIDEO_FILES = existsSync(OUT_DIR) ? readdirSync(OUT_DIR) : [];

const entries = {};
for (const d of readdirSync(MODULES)) {
  const dir = path.join(MODULES, d);
  const sp = path.join(dir, 'script.json');
  if (!existsSync(sp)) continue;
  const script = JSON.parse(readFileSync(sp, 'utf8'));
  const n = script.series.module;
  const pad = String(n).padStart(2, '0');
  // Only the exact export is a complete module. Beat proofs and excerpts also
  // use a ModuleNN- prefix and must never become the lesson player's source.
    const file = VIDEO_FILES.find((f) => f === `Module${pad}.mp4`);
  if (!file) continue;                       // no video yet, no section
  entries[script.series.unit] = {
    n,
    title: script.title,
    subtitle: script.subtitle,
    // Object storage serves these with a one-year immutable cache, so the URL
    // has to change when the video does. A re-render keeps the same filename,
    // and without this a viewer would be pinned to the old cut for a year.
    src: VIDEO_BASE_URL
      ? `${VIDEO_BASE_URL}/${file}?v=${contentHash(path.join(OUT_DIR, file))}`
      : `video/out/${file}`,
    seconds: Math.round(seconds(dir, script)),
    // The classroom track is optional: a unit without one simply has no
    // listen option, exactly as a unit without a video has no player.
    ...(audioFor(pad) || {}),
    ...(deckFor(pad) || {}),
    // Spine beats bracket every module; the teaching beats are the contents.
    beats: script.beats.filter((b) => b.lane !== null).map((b) => b.title),
  };
}

const banner = `/* AUTO-GENERATED by tools/build-modules-asset.mjs — do not edit.
 * Module video metadata, keyed by course unit id. Regenerate after rendering
 * or re-dubbing a module: node tools/build-modules-asset.mjs
 */\n`;

writeFileSync(
  path.join(ROOT, 'assets/modules.js'),
  banner + 'window.MODULE_VIDEOS = ' + JSON.stringify(entries, null, 2) + ';\n',
);

const ids = Object.keys(entries);
console.log(`  assets/modules.js written — ${ids.length} unit(s) with a video`);
console.log(`  serving from ${VIDEO_BASE_URL || 'video/out (the repository)'}`);
for (const id of ids) {
  const e = entries[id];
  const m = `${Math.floor(e.seconds / 60)}:${String(e.seconds % 60).padStart(2, '0')}`;
  console.log(`    ${id.padEnd(4)} module ${String(e.n).padStart(2, '0')}  ${m.padStart(5)}  ${e.title}`);
}

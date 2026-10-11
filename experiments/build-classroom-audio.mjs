#!/usr/bin/env node
/* Build the listen-in classroom audio from its markdown script.
 *
 * The script is the source of truth: this parser reads the dialogue turns,
 * the cast's voice ids, and the scripted listener pauses straight out of the
 * markdown, so editing the .md is editing the audio. Silence is assembled
 * here, not requested from the TTS — fish.audio has no notion of a scripted
 * pause, and the pauses are the pedagogy.
 *
 *   infisical run --projectId <id> --env dev --path /home -- \
 *     node experiments/build-classroom-audio.mjs u21-listen-in-class.md
 *
 * Per-line synthesis is cached by content hash under <script>-audio/cache, so
 * an edited line re-synthesises alone and a re-run after a crash is free.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TTS_URL = 'https://api.fish.audio/v1/tts';
const MODEL = process.env.FISH_MODEL || 's2.1-pro-free';

// Pacing, in seconds. Scripted listener pauses come from the markdown.
const TURN_GAP = 0.7;      // between consecutive dialogue turns
const SECTION_GAP = 1.5;   // at a ### section boundary
const BOTH_GAP = 0.25;     // between the two students on a "Both:" line

/* Scripted pauses are compressed above 3s: listening back, a literal 5-7s
 * gap reads as latency, not as thinking time. Authors keep writing the pause
 * they mean pedagogically; the compression is a delivery concern and lives
 * here. 4->3.6, 5->4.2, 7->5.4, and the long reconstruction pause lands near
 * 15s instead of 30. */
function pauseSeconds(scripted) {
  const s = Math.min(scripted, 3 + (scripted - 3) * 0.6);
  return Math.min(s, 15);
}

function apiKey() {
  for (const n of ['FISH_AUDIO_API_KEY', 'FISH_API_KEY']) {
    const v = (process.env[n] || '').trim();
    if (v) return v;
  }
  throw new Error('no FISH_AUDIO_API_KEY in the environment — run under infisical');
}

function safe(text, key) {
  let out = String(text);
  if (key) out = out.split(key).join('[redacted]');
  return out.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]').slice(0, 300);
}

/** Cast voices are declared in the markdown's Cast section as `(32-hex-id)`. */
function parseCast(md) {
  const cast = {};
  const section = md.split(/^## Cast$/m)[1]?.split(/^---$/m)[0] ?? '';
  const re = /\*\*(\w+)\*\*[^]*?`([0-9a-f]{32})`/g;
  for (let m; (m = re.exec(section)); ) cast[m[1]] = m[2];
  return cast;
}

/** Dialogue events between "## Script" and the closing "---". */
function parseScript(md) {
  const body = md.split(/^## Script$/m)[1]?.split(/^---$/m)[0];
  if (!body) throw new Error('no "## Script" section found');
  const events = [];
  let current = null;
  const flush = () => { if (current) { events.push(current); current = null; } };

  for (const raw of body.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^### /))) {
      flush(); events.push({ kind: 'section' });
    } else if ((m = line.match(/^\*\*Listener pause: (\d+) seconds?\*\*/))) {
      flush(); events.push({ kind: 'pause', seconds: Number(m[1]) });
    } else if ((m = line.match(/^\*\*(\w+):\*\* ?(.*)$/))) {
      flush(); current = { kind: 'turn', speaker: m[1], text: m[2] };
    } else if (current) {
      // Blank lines separate paragraphs inside one turn; keep them as breaks.
      current.text += line === '' ? '\n' : (current.text.endsWith('\n') || current.text === '' ? '' : ' ') + line;
    }
  }
  flush();
  for (const e of events) {
    if (e.kind === 'turn') e.text = e.text.replace(/\*\*/g, '').replace(/\s*\n\s*/g, '\n').trim();
  }
  return events.filter(e => e.kind !== 'turn' || e.text);
}

// A ~90-call sequential run will hit the occasional dead keep-alive socket
// (EPIPE mid-write); that is a retry, not a failure.
async function synth(text, referenceId, key, attempt = 1) {
  try {
    return await synthOnce(text, referenceId, key);
  } catch (e) {
    if (attempt >= 4 || /HTTP 4\d\d/.test(e.message)) throw e;
    const wait = attempt * 2000;
    console.log(`retry ${attempt} in ${wait / 1000}s (${e.cause?.code ?? e.message.slice(0, 40)})`);
    await new Promise(r => setTimeout(r, wait));
    return synth(text, referenceId, key, attempt + 1);
  }
}

async function synthOnce(text, referenceId, key) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    // A dead connection once hung a batch for two hours: no fetch timeout
    // means no retry. Two minutes is far beyond any legitimate synthesis.
    signal: AbortSignal.timeout(120_000),
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', model: MODEL },
    body: JSON.stringify({
      text, format: 'mp3', mp3_bitrate: 128, latency: 'normal', normalize: true,
      reference_id: referenceId,
      prosody: { speed: 1.0, volume: 0, normalize_loudness: true },
    }),
  });
  if (!res.ok) throw new Error(`fish.audio HTTP ${res.status}: ${safe(await res.text().catch(() => ''), key)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`suspiciously small audio: ${buf.length} bytes`);
  return buf;
}

function ffmpeg(args) { execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]); }

const scriptFile = process.argv[2];
if (!scriptFile) { console.error('usage: build-classroom-audio.mjs <script.md>'); process.exit(1); }
const mdPath = path.resolve(HERE, scriptFile);
const md = fs.readFileSync(mdPath, 'utf8');
const cast = parseCast(md);
const events = parseScript(md);
const key = apiKey();

const stem = path.basename(mdPath, '.md');
const work = path.join(HERE, `${stem}-audio`);
const cache = path.join(work, 'cache');
fs.mkdirSync(cache, { recursive: true });

const turns = events.filter(e => e.kind === 'turn');
const speakers = [...new Set(turns.map(t => t.speaker))];
for (const s of speakers) {
  if (s !== 'Both' && !cast[s]) throw new Error(`speaker ${s} has no voice id in the Cast section`);
}
console.log(`cast: ${Object.entries(cast).map(([n, v]) => `${n}=${v.slice(0, 8)}…`).join('  ')}`);
console.log(`${turns.length} turns, ${events.filter(e => e.kind === 'pause').length} scripted pauses\n`);

// 1. Synthesise every line (cache-keyed on voice + text).
async function lineWav(speaker, text) {
  const voice = cast[speaker];
  const h = crypto.createHash('sha256').update(voice + '\0' + text).digest('hex').slice(0, 20);
  const mp3 = path.join(cache, `${h}.mp3`);
  const wav = path.join(cache, `${h}.wav`);
  if (!fs.existsSync(wav)) {
    if (!fs.existsSync(mp3)) {
      process.stdout.write(`  synth ${speaker.padEnd(8)} ${text.slice(0, 56).replace(/\n/g, ' ')}… `);
      fs.writeFileSync(mp3, await synth(text, voice, key));
      console.log('ok');
    }
    ffmpeg(['-i', mp3, '-ar', '44100', '-ac', '1', wav]);
  }
  return wav;
}

const silences = new Map();
function silenceWav(seconds) {
  const s = seconds.toFixed(2);
  if (!silences.has(s)) {
    const wav = path.join(cache, `silence-${s}.wav`);
    if (!fs.existsSync(wav)) {
      ffmpeg(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', s, wav]);
    }
    silences.set(s, wav);
  }
  return silences.get(s);
}

const pieces = [];
let spoken = 0;
for (const e of events) {
  if (e.kind === 'section') {
    if (pieces.length) pieces.push(silenceWav(SECTION_GAP));
  } else if (e.kind === 'pause') {
    pieces.push(silenceWav(pauseSeconds(e.seconds)));
  } else if (e.speaker === 'Both') {
    pieces.push(await lineWav('Maya', e.text));
    pieces.push(silenceWav(BOTH_GAP));
    pieces.push(await lineWav('Leon', e.text));
    spoken += 2;
    pieces.push(silenceWav(TURN_GAP));
  } else {
    pieces.push(await lineWav(e.speaker, e.text));
    spoken++;
    pieces.push(silenceWav(TURN_GAP));
  }
}

// 2. Concatenate, then encode once.
const list = path.join(work, 'concat.txt');
fs.writeFileSync(list, pieces.map(p => `file '${p}'`).join('\n') + '\n');
const outMp3 = path.join(work, `${stem}.mp3`);
ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c:a', 'libmp3lame', '-b:a', '128k', outMp3]);

const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'default=nw=1:nk=1', outMp3]).toString().trim();
const mins = (Number(dur) / 60).toFixed(1);
const desk = path.join(os.homedir(), 'Desktop', `${stem}.mp3`);
fs.copyFileSync(outMp3, desk);
console.log(`\n${spoken} lines synthesised · ${mins} min total`);
console.log(`-> ${desk}`);

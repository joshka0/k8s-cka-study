#!/usr/bin/env node
/* Synthesise the same sample in several voices, for choosing one.
 *
 * The whole course is dubbed in a single voice, so switching means re-dubbing
 * every beat. Listen before committing to that.
 *
 *   infisical run --projectId <id> --env dev --path /home -- \
 *     node scripts/voice-sample.mjs
 *
 *   node scripts/voice-sample.mjs --list-account   # voices on the account
 *   node scripts/voice-sample.mjs --voices current,olivia,<32-char-id>
 *   node scripts/voice-sample.mjs --out ~/Desktop/voice-test
 *
 * The sample is a real module opening and closing, not lorem: pacing on
 * technical nouns and short sentences is exactly what has to sound right.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TTS_URL = 'https://api.fish.audio/v1/tts';
const MODEL_URL = 'https://api.fish.audio/model';
const MODEL = process.env.FISH_MODEL || 's2.1-pro-free';

const KNOWN = {
  current: 'c023b17b38144a60b3984153247d993f',
  olivia: '311bf5222d874b1b849baf6a4886bc07',
  sandra: '0baad0571f04479c9b5459620d69db38',
  veronica: 'af3100196fcd4cb382193827a901cfa2',
};

function arg(name, fallback = null) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

function apiKey() {
  for (const n of ['FISH_AUDIO_API_KEY', 'FISH_API_KEY']) {
    const v = (process.env[n] || '').trim();
    if (v) return v;
  }
  throw new Error(
    'no FISH_AUDIO_API_KEY in the environment.\n' +
    '  run under: infisical run --projectId <id> --env dev --path /home -- node scripts/voice-sample.mjs');
}

/** Redact the key from anything a server echoes back before printing it. */
function safe(text, key) {
  let out = String(text);
  if (key) out = out.split(key).join('[redacted]');
  return out.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]').slice(0, 300);
}

async function listAccount(key) {
  const res = await fetch(`${MODEL_URL}?self=true&page_size=100`, {
    headers: { authorization: `Bearer ${key}` },
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`fish.audio HTTP ${res.status}: ${safe(raw, key)}`);
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error(`unexpected body: ${safe(raw, key)}`); }
  const items = data.items ?? data.data ?? [];
  if (!items.length) { console.log('no voices on this account'); return; }
  console.log(`${items.length} voice(s) on the account:\n`);
  for (const m of items) {
    const id = m._id ?? m.id ?? '?';
    const mine = Object.entries(KNOWN).find(([, v]) => v === id);
    console.log(`  ${id}  ${m.title ?? m.name ?? '(untitled)'}${mine ? `   <- ${mine[0]}` : ''}`);
  }
}

async function synth(text, referenceId, key) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      model: MODEL,
    },
    body: JSON.stringify({
      text,
      format: 'mp3',
      mp3_bitrate: 128,
      latency: 'normal',
      normalize: true,
      reference_id: referenceId,
      prosody: { speed: 1.0, volume: 0, normalize_loudness: true },
    }),
  });
  if (!res.ok) throw new Error(`fish.audio HTTP ${res.status}: ${safe(await res.text().catch(() => ''), key)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`suspiciously small audio: ${buf.length} bytes`);
  return buf;
}

/* A real opening and closing, so the sample carries the actual cadence: a
 * hook, a segment name, a list, and a landing line. */
function sampleText() {
  const p = path.join(ROOT, 'modules', arg('module', 'u06-scheduling'), 'script.json');
  const s = JSON.parse(fs.readFileSync(p, 'utf8'));
  const part = String(arg('part', 'open'));
  const open = s.beats[0].narration;
  const close = s.beats[s.beats.length - 1].narration;
  if (part === 'open') return open;
  if (part === 'close') return close;
  return `${open}\n\n${close}`;
}

const key = apiKey();

if (arg('list-account')) {
  await listAccount(key);
  process.exit(0);
}

const outDir = String(arg('out', path.join(os.homedir(), 'Desktop', 'voice-test')));
const wanted = String(arg('voices', 'current,olivia,sandra,veronica'))
  .split(',').map(v => v.trim()).filter(Boolean);

const text = sampleText();
const words = text.split(/\s+/).length;
console.log(`sample: ${words} words, roughly ${Math.round(words / 3)}s at 180 wpm`);
console.log(`model ${MODEL} · ${wanted.length} voice(s) -> ${outDir}\n`);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sample-text.txt'), text + '\n');

let made = 0;
for (const name of wanted) {
  const id = KNOWN[name] ?? (name.length === 32 ? name : null);
  if (!id) { console.error(`  skip  ${name} — unknown voice and not a 32-char id`); continue; }
  process.stdout.write(`  synth ${name} … `);
  try {
    const buf = await synth(text, id, key);
    const file = path.join(outDir, `${name}.mp3`);
    fs.writeFileSync(file, buf);
    console.log(`${(buf.length / 1024).toFixed(0)} KB -> ${file}`);
    made++;
  } catch (e) {
    console.log('FAILED');
    console.error(`        ${e.message}`);
    process.exitCode = 1;
  }
}
console.log(`\ndone: ${made} sample(s). Nothing else was changed; the course dub is untouched.`);

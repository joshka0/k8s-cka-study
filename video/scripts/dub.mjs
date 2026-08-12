#!/usr/bin/env node
/* Synthesise narration with Fish Audio.
 *
 * Mirrors the request herdr-executive's src/tts.rs makes, but writes mp3 files
 * instead of streaming PCM. The API key is read from the environment or from
 * ~/.env and is never logged.
 *
 *   node scripts/dub.mjs --list
 *   node scripts/dub.mjs --only recap --voice olivia --suffix .olivia
 *   node scripts/dub.mjs --voice sandra           # every beat still missing
 *   node scripts/dub.mjs --voice sandra --force   # redo everything
 *
 * A module video keeps its script and its audio together, so --module selects
 * both at once:
 *
 *   node scripts/dub.mjs --module u02-api-path --voice c023b17b…
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TTS_URL = 'https://api.fish.audio/v1/tts';
const MODEL = process.env.FISH_MODEL || 's2.1-pro-free';
const LATENCY = process.env.FISH_LATENCY || 'normal';

// The voices herdr-executive ships (src/coordinator.rs).
const VOICES = {
  olivia: '311bf5222d874b1b849baf6a4886bc07',
  sandra: '0baad0571f04479c9b5459620d69db38',
  veronica: 'af3100196fcd4cb382193827a901cfa2'
};

function arg(name, fallback = null) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const SPEED = Number(arg('speed', 1.0)) || 1.0;

/* Key resolution: the injected environment first, then ~/.env as a fallback.
 *
 * The fallback is announced, because a silent one is expensive. A stale key in
 * ~/.env shadowed the real one for a whole session: the API answered 402, and
 * under load that surfaced as a 502 that read exactly like a provider outage.
 * The canonical key is in Infisical, so prefer:
 *
 *   infisical run --projectId <id> --env dev --path /home -- node scripts/dub.mjs …
 */
function apiKey() {
  for (const n of ['FISH_AUDIO_API_KEY', 'FISH_API_KEY']) {
    const v = (process.env[n] || '').trim();
    if (v) return v;
  }
  const dotenv = path.join(os.homedir(), '.env');
  if (fs.existsSync(dotenv)) {
    for (const line of fs.readFileSync(dotenv, 'utf8').split('\n')) {
      const m = line.trim().match(/^(FISH_AUDIO_API_KEY|FISH_API_KEY)\s*=\s*(.*)$/);
      if (m) {
        const v = m[2].trim().replace(/^["']|["']$/g, '');
        if (v) {
          console.warn('  ! no key in the environment — falling back to ~/.env.');
          console.warn('  ! if synthesis fails with 402 or 502, that file is stale;');
          console.warn('  ! run under `infisical run … --path /home` instead.');
          return v;
        }
      }
    }
  }
  throw new Error('no FISH_AUDIO_API_KEY in the environment or ~/.env');
}

async function synth(text, referenceId, key) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      model: MODEL
    },
    body: JSON.stringify({
      text,
      format: 'mp3',
      mp3_bitrate: 128,
      latency: LATENCY,
      normalize: true,
      reference_id: referenceId,
      prosody: { speed: SPEED, volume: 0, normalize_loudness: true }
    })
  });
  if (!res.ok) {
    // Surface the API's own message, never the request that carried the key.
    // The body is untrusted: a proxy or debug error page could echo the
    // Authorization header back. Redact the key from anything we print, and
    // prefer a parsed message field over the raw body.
    const raw = await res.text().catch(() => '');
    let detail = raw;
    try {
      const j = JSON.parse(raw);
      detail = String(j.message || j.error || j.detail || raw);
    } catch (e) { /* not JSON — fall back to the raw body, redacted below */ }
    if (key) detail = detail.split(key).join('[redacted]');
    detail = detail.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
    throw new Error(`fish.audio HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`suspiciously small audio: ${buf.length} bytes`);
  return buf;
}

// The pilot lives at the project root; each module owns a directory holding its
// script and the narration rendered from it.
//
// `--module` and `--suffix` become path components, so they are validated
// rather than trusted: a bare `--module` used to select the pilot silently, and
// a `..` segment or separator could write outside the narration directory —
// destructive with --force.
const rawModule = arg('module');
if (rawModule === true) {
  console.error('--module needs a value, e.g. --module u02-api-path');
  process.exit(1);
}
const moduleName = rawModule ? String(rawModule) : null;
if (moduleName && (moduleName.includes('/') || moduleName.includes(path.sep) || moduleName.includes('..'))) {
  console.error(`--module must be a single directory name, got ${moduleName}`);
  process.exit(1);
}
const BASE = moduleName ? path.join(ROOT, 'modules', moduleName) : ROOT;
if (moduleName && path.dirname(path.resolve(BASE)) !== path.resolve(ROOT, 'modules')) {
  console.error(`--module resolved outside modules/: ${BASE}`);
  process.exit(1);
}
const OUT = path.join(BASE, 'narration');
const scriptPath = path.join(BASE, 'script.json');
if (!fs.existsSync(scriptPath)) {
  console.error(`no script at ${path.relative(ROOT, scriptPath)}`);
  process.exit(1);
}
const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

if (arg('list')) {
  console.log('voices :', Object.keys(VOICES).join(', '));
  console.log('beats  :', script.beats.map(b => b.id).join(', '));
  process.exit(0);
}

// A script that names its own voice is the authority; --voice still overrides.
const voiceName = String(arg('voice', script.meta?.voiceReferenceId || 'olivia')).toLowerCase();
const referenceId = VOICES[voiceName] || (voiceName.length === 32 ? voiceName : null);
if (!referenceId) {
  console.error(`unknown voice ${voiceName}; known: ${Object.keys(VOICES).join(', ')}`);
  process.exit(1);
}

const only = arg('only');
const force = !!arg('force');
const suffix = arg('suffix', '') === true ? '' : (arg('suffix', '') || '');
if (suffix.includes('/') || suffix.includes(path.sep) || suffix.includes('..')) {
  console.error(`--suffix must not contain a path separator, got ${suffix}`);
  process.exit(1);
}

const beats = script.beats.filter(b => (only && only !== true ? b.id === only : true));
if (!beats.length) { console.error(`no beat matched --only ${only}`); process.exit(1); }

const key = apiKey();
fs.mkdirSync(OUT, { recursive: true });
console.log(`voice ${voiceName} · model ${MODEL} · ${beats.length} beat(s)`);

let made = 0, skipped = 0;
for (const b of beats) {
  const file = path.join(OUT, `${b.id}${suffix}.mp3`);
  if (fs.existsSync(file) && !force) { console.log(`  skip  ${b.id} (exists)`); skipped++; continue; }
  process.stdout.write(`  synth ${b.id} … `);
  try {
    const buf = await synth(b.narration, referenceId, key);
    fs.writeFileSync(file, buf);
    console.log(`${(buf.length / 1024).toFixed(0)} KB -> ${path.relative(ROOT, file)}`);
    made++;
  } catch (e) {
    console.log('FAILED');
    console.error(`        ${e.message}`);
    process.exitCode = 1;
    break;
  }
}
console.log(`done: ${made} written, ${skipped} skipped`);

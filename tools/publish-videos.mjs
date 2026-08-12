#!/usr/bin/env node
/* Upload rendered module videos to Cloudflare R2.
 *
 *   infisical run --projectId <id> --env dev --path /home -- \
 *     node tools/publish-videos.mjs --bucket k8s-study-videos
 *
 *   node tools/publish-videos.mjs --bucket <name> --dry-run
 *   node tools/publish-videos.mjs --bucket <name> --only Module04.mp4
 *   node tools/publish-videos.mjs --bucket <name> --force
 *
 * Only exact module exports are published. Beat proofs and excerpts share the
 * ModuleNN- prefix and must never reach the player, so the match is exact.
 *
 * Uploads are skipped when the object already carries the same content hash,
 * which makes a re-run after a partial render cheap and safe to repeat.
 *
 * Needs CLOUDFLARE_API_TOKEN with R2 write permission, and CLOUDFLARE_ACCOUNT_ID
 * (or --account). Values are read from the environment and never printed.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, 'video/out');
const MODULE_RE = /^Module\d{2}\.mp4$/;

function arg(name, fallback = null) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

function need(name, flag) {
  const v = (arg(flag) && arg(flag) !== true ? String(arg(flag)) : process.env[name] || '').trim();
  if (!v) {
    console.error(`missing ${name}. Pass --${flag} or run under:`);
    console.error('  infisical run --projectId <id> --env dev --path /home -- node tools/publish-videos.mjs …');
    process.exit(1);
  }
  return v;
}

/** Never let a token reach stdout, including via an echoed error body. */
function redact(text, ...secrets) {
  let out = String(text);
  for (const s of secrets) if (s) out = out.split(s).join('[redacted]');
  return out.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]').slice(0, 300);
}

const token = need('CLOUDFLARE_API_TOKEN', 'token');
const account = need('CLOUDFLARE_ACCOUNT_ID', 'account');
const bucket = String(arg('bucket') || '').trim();
if (!bucket) { console.error('--bucket is required'); process.exit(1); }

const publicBase = String(arg('public-base', process.env.VIDEO_BASE_URL || '')).replace(/\/+$/, '');
const dryRun = !!arg('dry-run');
const force = !!arg('force');
const only = arg('only');

const api = `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects`;

/* Existence is checked through the public hostname, not the REST API.
 *
 * The API's object HEAD is served from Cloudflare's own edge cache — a probe
 * for an object that exists came back 404 with `cf-cache-status: HIT` and a
 * four-hour TTL, so every re-run would have re-uploaded all 400 MB. The public
 * hostname answers from the bucket and returns the content MD5 as its etag. */
async function head(key) {
  if (!publicBase) return null;                // no hostname: always upload
  const res = await fetch(`${publicBase}/${key}`, { method: 'HEAD' });
  if (!res.ok) return null;
  return { etag: (res.headers.get('etag') || '').replace(/"/g, '') };
}

async function put(key, body) {
  const res = await fetch(`${api}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'video/mp4',
      // Cached hard, and busted by content hash rather than by name: the
      // manifest appends ?v=<hash> to each src, so a re-rendered module gets a
      // new URL. Without that, `immutable` would pin viewers to a stale video
      // for a year after every re-render.
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`R2 HTTP ${res.status}: ${redact(await res.text().catch(() => ''), token, account)}`);
  }
}

const files = (fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR) : [])
  .filter((f) => MODULE_RE.test(f))
  .filter((f) => (only && only !== true ? f === only : true))
  .sort();

if (!files.length) {
  console.error(`no module exports in ${path.relative(ROOT, OUT_DIR)}${only ? ` matching ${only}` : ''}`);
  process.exit(1);
}

console.log(`bucket ${bucket} · ${files.length} module export(s)${dryRun ? ' · DRY RUN' : ''}\n`);

let sent = 0, skipped = 0, bytes = 0;
for (const f of files) {
  const full = path.join(OUT_DIR, f);
  const body = fs.readFileSync(full);
  const md5 = createHash('md5').update(body).digest('hex');
  const mb = (body.length / 1048576).toFixed(1);

  if (!force) {
    const existing = await head(f);
    if (existing && existing.etag === md5) {
      console.log(`  skip   ${f}  ${mb} MB (unchanged)`);
      skipped++;
      continue;
    }
  }
  if (dryRun) {
    console.log(`  would  ${f}  ${mb} MB`);
    sent++; bytes += body.length;
    continue;
  }
  process.stdout.write(`  put    ${f}  ${mb} MB … `);
  try {
    await put(f, body);
    console.log('ok');
    sent++; bytes += body.length;
  } catch (e) {
    console.log('FAILED');
    console.error(`         ${e.message}`);
    process.exitCode = 1;
  }
}

console.log(`\n${dryRun ? 'would upload' : 'uploaded'} ${sent}, skipped ${skipped}` +
            ` · ${(bytes / 1048576).toFixed(0)} MB`);
if (!dryRun && sent) {
  console.log('\nnext: point the manifest at the bucket and rebuild the site');
  console.log('  VIDEO_BASE_URL=https://<your-domain> node tools/build-modules-asset.mjs');
}

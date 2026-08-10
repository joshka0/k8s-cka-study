#!/usr/bin/env node
/* Kubernetes Beyond YAML — static server + shared progress store.
 *
 * Serves the course and keeps one progress.json on this machine so every
 * device studying through it shares a single state. The server owns the merge,
 * so two devices can study concurrently and converge: the client PUTs whatever
 * it has, the server reconciles it with disk and returns the result.
 *
 *   node serve.js                  # 127.0.0.1:8730
 *   PORT=9000 node serve.js
 *   HOST=0.0.0.0 node serve.js     # only if you deliberately want LAN exposure
 *
 * Binds loopback by default: `tailscale serve` proxies from localhost, so the
 * course reaches your tailnet without ever being exposed to the local network.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = __dirname;
const STATE_FILE = path.join(ROOT, 'progress.json');
const PORT = Number(process.env.PORT || 8730);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY = 1 << 20; // 1 MiB is far more than a progress blob needs

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.apkg': 'application/octet-stream',
  '.md': 'text/plain; charset=utf-8'
};

const EMPTY = { xp: 0, streak: 0, lastDay: null, done: {}, srs: {} };

/* ---------- progress state ---------- */

let writing = Promise.resolve();

async function readState() {
  try {
    const raw = await fsp.readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...EMPTY, ...parsed } : { ...EMPTY };
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('progress.json unreadable, starting fresh:', e.message);
    return { ...EMPTY };
  }
}

async function writeState(state) {
  // Serialise writes and swap atomically so a crash cannot truncate the file.
  writing = writing.then(async () => {
    const tmp = STATE_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8');
    await fsp.rename(tmp, STATE_FILE);
  }).catch(e => console.error('progress write failed:', e.message));
  return writing;
}

/* Merge two states. Device preferences (sound) are deliberately NOT synced. */
function merge(a, b) {
  const out = {
    xp: Math.max(num(a.xp), num(b.xp)),
    streak: 0,
    lastDay: null,
    done: {},
    srs: {}
  };

  // The more recent day wins the streak; same day keeps the longer count.
  const dayA = a.lastDay === null || a.lastDay === undefined ? -1 : num(a.lastDay);
  const dayB = b.lastDay === null || b.lastDay === undefined ? -1 : num(b.lastDay);
  if (dayA > dayB) { out.lastDay = a.lastDay; out.streak = num(a.streak); }
  else if (dayB > dayA) { out.lastDay = b.lastDay; out.streak = num(b.streak); }
  else { out.lastDay = dayA === -1 ? null : a.lastDay; out.streak = Math.max(num(a.streak), num(b.streak)); }

  // Completed lessons union; keep the better recorded accuracy.
  for (const src of [a.done, b.done]) {
    if (!src || typeof src !== 'object') continue;
    for (const [k, v] of Object.entries(src)) {
      const prev = out.done[k];
      if (!prev) out.done[k] = v;
      else if (v && typeof v === 'object' && typeof prev === 'object') {
        out.done[k] = { ...prev, ...v, best: Math.max(num(prev.best), num(v.best)) };
      }
    }
  }

  // Scheduling: the most recently touched answer wins, so a lapse on one
  // device is never overwritten by an older success on another.
  for (const src of [a.srs, b.srs]) {
    if (!src || typeof src !== 'object') continue;
    for (const [k, v] of Object.entries(src)) {
      if (!v || typeof v !== 'object') continue;
      const prev = out.srs[k];
      if (!prev || num(v.t) > num(prev.t)) out.srs[k] = v;
    }
  }
  return out;
}

const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/* ---------- http ---------- */

function send(res, code, body, type) {
  res.writeHead(code, {
    'content-type': type || 'text/plain; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const full = path.join(ROOT, rel);
  // Never serve outside the course directory, whatever the request says.
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden');
  // Progress is only reachable through the API, never as a static file.
  if (path.basename(full) === 'progress.json') return send(res, 404, 'Not found');

  let stat;
  try { stat = await fsp.stat(full); } catch { return send(res, 404, 'Not found'); }
  if (stat.isDirectory()) return serveStatic(req, res, pathname.replace(/\/?$/, '/'));

  res.writeHead(200, {
    'content-type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': 'no-cache'
  });
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/progress') {
    try {
      if (req.method === 'GET') {
        return send(res, 200, JSON.stringify(await readState()), MIME['.json']);
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const incoming = JSON.parse(await readBody(req) || '{}');
        if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
          return send(res, 400, 'expected a progress object');
        }
        const merged = merge(await readState(), incoming);
        await writeState(merged);
        const lessons = Object.keys(merged.done).filter(k => k[0] !== '@').length;
        console.log(`[sync] ${new Date().toISOString()}  xp=${merged.xp} lessons=${lessons} items=${Object.keys(merged.srs).length}`);
        return send(res, 200, JSON.stringify(merged), MIME['.json']);
      }
      return send(res, 405, 'Method not allowed');
    } catch (e) {
      return send(res, 400, 'bad request: ' + e.message);
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res, pathname === '/' ? '/index.html' : pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Kubernetes Beyond YAML`);
  console.log(`  serving  ${ROOT}`);
  console.log(`  progress ${STATE_FILE}`);
  console.log(`  local    http://${HOST}:${PORT}/`);
  console.log(`\n  To reach it from your tailnet (./start.sh does this for you):`);
  console.log(`    tailscale serve --bg --https=8443 http://127.0.0.1:${PORT}`);
  console.log(`  then open https://<this-machine>.<tailnet>.ts.net:8443/`);
  console.log(`  A distinct port leaves any existing serve mount on / untouched.`);
  console.log(`\n  Ctrl-C to stop.`);
});
